import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manualPath = path.join(root, "src/data/manual/buffRules.manual.js");
const generatedPath = path.join(root, "src/data/generated/equipBuffRuleCandidates.generated.js");
const skillCompatibilityPath = path.join(root, "src/data/generated/skillBuffCompatibility.generated.js");
const damageCompatibilityPath = path.join(root, "src/data/generated/damageBuffCompatibility.generated.js");
const wikiEffectsPath = path.join(root, "src/data/generated/wikiEquipBuffEffects.generated.js");
const mainPath = path.join(root, "src/main.js");

function loadWindowFiles(files) {
  const context = { window: {} };
  vm.createContext(context);
  files.forEach(file => vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file }));
  return context.window;
}

function semanticEffectKey(effect) {
  return [
    String(effect?.name || effect?.target || "").trim(),
    Number(effect?.value || 0),
    String(effect?.unit || "").trim()
  ].join("\u001f");
}

function hasNumericValues(value) {
  return !!value && Object.values(value).some(item => Number.isFinite(Number(item)) && Number(item) !== 0);
}

function supportedRuntimeStatKeys(mainSource) {
  const start = mainSource.indexOf("const statMap = {", mainSource.indexOf("function applyEquipBuffRuleCandidateToEquipment("));
  const end = mainSource.indexOf("\n  };", start);
  if (start < 0 || end < 0) return new Set();
  const block = mainSource.slice(start, end);
  return new Set(Array.from(block.matchAll(/(?:^|[,\n]\s*)([A-Za-z][A-Za-z0-9]*):\s*"equipBuff/g), match => match[1]));
}

function duplicateSourceRuleIds(source) {
  const counts = new Map();
  for (const match of source.matchAll(/["'](technic-\d+)["']\s*:\s*\{/g)) {
    counts.set(match[1], (counts.get(match[1]) || 0) + 1);
  }
  return Array.from(counts.entries()).filter(([, count]) => count > 1);
}

function normalizedBuffName(value) {
  return String(value || "")
    .replace(/[　\s]+/g, "")
    .replace(/[‐‑‒–—―ー－]/g, "-")
    .toLowerCase()
    .trim();
}

function runtimeSafeHintResolver(mainSource) {
  const start = mainSource.indexOf("function equipmentBuffRecoveryHintValues(");
  const end = mainSource.indexOf("function equipmentBuffRecoveryValues(", start);
  if (start < 0 || end < 0) return () => ({});
  const context = {};
  vm.createContext(context);
  vm.runInContext(
    `${mainSource.slice(start, end)}
     globalThis.__resolveEquipmentBuffSafeHints = equipmentBuffSafeTagHintStats;`,
    context
  );
  return candidate => context.__resolveEquipmentBuffSafeHints(candidate);
}

function runtimePercentPrefixArtifactResolver(mainSource) {
  const start = mainSource.indexOf("function equipmentBuffPercentPrefixArtifactFields(");
  const end = mainSource.indexOf("function applyEquipBuffRuleCandidateToEquipment(", start);
  if (start < 0 || end < 0) return () => new Set();
  const context = {};
  vm.createContext(context);
  vm.runInContext(
    `${mainSource.slice(start, end)}
     globalThis.__resolveEquipmentBuffPercentPrefixArtifacts = equipmentBuffPercentPrefixArtifactFields;`,
    context
  );
  return candidate => context.__resolveEquipmentBuffPercentPrefixArtifacts(candidate);
}

function runtimeSemanticDisplayDeduplicator(mainSource) {
  const start = mainSource.indexOf("function equipmentBuffSemanticEffectKey(");
  const end = mainSource.indexOf("/* 公式説明に含まれる見た目・モーション系", start);
  if (start < 0 || end < 0) return labels => labels;
  const context = {};
  vm.createContext(context);
  vm.runInContext(
    `${mainSource.slice(start, end)}
     globalThis.__deduplicateEquipmentBuffEffectLabels = deduplicateEquipmentBuffEffectLabels;`,
    context
  );
  return labels => Array.from(context.__deduplicateEquipmentBuffEffectLabels(labels));
}

function semanticDisplayDuplicateAudit(rules, deduplicate) {
  let candidates = 0;
  let fields = 0;
  let remaining = 0;
  for (const rule of rules) {
    const labels = [];
    const conversions = rule.conversions || {};
    if (Number(conversions.magicToAttackPct)) labels.push(`魔力→攻撃力 ${Number(conversions.magicToAttackPct)}%`);
    if (Number(conversions.magicToSpeedPct)) labels.push(`魔力→移動速度 ${Number(conversions.magicToSpeedPct)}%`);
    if (Number(conversions.speedToAttackPct)) labels.push(`速度→攻撃力 ${Number(conversions.speedToAttackPct)}%`);
    const stats = rule.stats || {};
    [["HP", "hpRegenPerMinute"], ["ST", "stRegenPerMinute"], ["MP", "mpRegenPerMinute"]]
      .forEach(([resource, key]) => {
        const value = Number(stats[key]);
        if (!value) return;
        labels.push(`${resource}自然回復 ${value > 0 ? "+" : ""}${value}/分`);
        labels.push(`${resource}自然回復/分${value > 0 ? "+" : ""}${value}`);
      });
    for (const effect of rule.customEffects || []) {
      const name = String(effect?.name || "").trim();
      const value = Number(effect?.value || 0);
      labels.push(`${name}${value ? ` ${value > 0 ? "+" : ""}${value}${effect?.unit || ""}` : ""}`);
    }
    const deduped = deduplicate(labels);
    const duplicates = labels.length - deduped.length;
    if (duplicates > 0) {
      candidates += 1;
      fields += duplicates;
    }
    remaining += deduped.length - deduplicate(deduped).length;
  }
  return { candidates, fields, runtimeSuppressed: fields, remaining };
}

function wikiPercentPrefixArtifactCount(rows) {
  const pairs = [
    ["attackPct", "attackFlat"], ["magicPct", "magicFlat"], ["speedPct", "speedFlat"],
    ["extraACPct", "flatAC"], ["extraHPPct", "flatHP"], ["extraMPPct", "flatMP"],
    ["extraSTPct", "flatST"], ["extraHitPct", "hitFlat"], ["extraAvoidPct", "avoidFlat"],
    ["maxWeightPct", "flatMaxWeight"], ["attackDelayPct", "attackDelayFlat"],
    ["magicDelayPct", "magicDelayFlat"]
  ];
  let affectedRows = 0;
  let affectedFields = 0;
  for (const row of rows) {
    let rowFields = 0;
    for (const [pctKey, flatKey] of pairs) {
      const pctEffects = (row.parsedStats || []).filter(effect => effect.key === pctKey);
      const flatEffects = (row.parsedStats || []).filter(effect => effect.key === flatKey);
      for (const pct of pctEffects) {
        for (const flat of flatEffects) {
          const pctRaw = String(pct.raw || "");
          const flatRaw = String(flat.raw || "");
          if (
            pctRaw.endsWith("%")
            && pctRaw.slice(0, -1).startsWith(flatRaw)
            && Number(pct.value) !== Number(flat.value)
            && String(Number(pct.value)).startsWith(String(Number(flat.value)))
          ) rowFields += 1;
        }
      }
    }
    if (rowFields) {
      affectedRows += 1;
      affectedFields += rowFields;
    }
  }
  return { rows: affectedRows, fields: affectedFields };
}

function runAudit() {
  const mainSource = fs.readFileSync(mainPath, "utf8");
  const manualSource = fs.readFileSync(manualPath, "utf8");
  const window = loadWindowFiles([
    generatedPath,
    skillCompatibilityPath,
    damageCompatibilityPath,
    wikiEffectsPath,
    manualPath
  ]);
  const manual = window.MOE_BUFF_RULES_MANUAL || {};
  const generated = window.MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED || [];
  const skillCompatibility = window.MOE_SKILL_BUFF_COMPATIBILITY_GENERATED || [];
  const damageCompatibility = window.MOE_DAMAGE_BUFF_COMPATIBILITY_GENERATED || [];
  const wikiEffects = window.MOE_WIKI_EQUIP_BUFF_EFFECTS_GENERATED || [];
  const resolveSafeHints = runtimeSafeHintResolver(mainSource);
  const resolvePercentPrefixArtifacts = runtimePercentPrefixArtifactResolver(mainSource);
  const deduplicateSemanticDisplay = runtimeSemanticDisplayDeduplicator(mainSource);
  const skillCoveredNames = new Set(skillCompatibility
    .filter(rule => Number(rule?.value) !== 0 && !rule?.valueUncertain)
    .map(rule => normalizedBuffName(rule?.buffName || rule?.name))
    .filter(Boolean));
  const damageCoveredNames = new Set(damageCompatibility
    .filter(rule => rule?.safeForValueAutoApply && Number(rule?.value) !== 0 && !rule?.valueUncertain)
    .map(rule => normalizedBuffName(rule?.buffName || rule?.name))
    .filter(Boolean));
  const runtimeStats = supportedRuntimeStatKeys(mainSource);
  const errors = [];
  const warnings = [];
  const statusCounts = {};

  for (const [id, rule] of Object.entries(manual)) {
    const label = `${id} ${rule?.name || ""}`.trim();
    const expectedId = Number(String(id).replace(/^technic-/, ""));
    const sourceCatalogOnly = rule?.sourceCatalogOnly === true;
    if (
      sourceCatalogOnly
        ? !/^technic-\d+(?:\s*\/\s*\d+)+$/.test(id) || rule?.officialTechnicId != null
        : !Number.isFinite(expectedId) || Number(rule?.officialTechnicId) !== expectedId
    ) {
      errors.push(`${label}: object key and officialTechnicId do not match`);
    }

    if (rule.reviewStatus) {
      statusCounts[rule.reviewStatus] = (statusCounts[rule.reviewStatus] || 0) + 1;
      if (!["implemented", "display-only", "unverified"].includes(rule.reviewStatus)) {
        errors.push(`${label}: unknown reviewStatus ${rule.reviewStatus}`);
      }
    }

    for (const [key, value] of Object.entries(rule.stats || {})) {
      if (!runtimeStats.has(key)) errors.push(`${label}: stats.${key} is not mapped by runtime statMap`);
      if (!Number.isFinite(Number(value))) errors.push(`${label}: stats.${key} is not numeric`);
    }

    for (const key of Object.keys(rule.conversions || {})) {
      if (!["magicToAttackPct", "magicToSpeedPct", "speedToAttackPct"].includes(key)) {
        errors.push(`${label}: conversions.${key} is not supported`);
      }
    }

    for (const field of ["customEffects", "skillEffects"]) {
      const seen = new Set();
      for (const effect of rule[field] || []) {
        const key = semanticEffectKey(effect);
        if (seen.has(key)) errors.push(`${label}: duplicate ${field} entry ${key.replaceAll("\u001f", " / ")}`);
        seen.add(key);
        if (!String(effect?.name || effect?.target || "").trim()) errors.push(`${label}: ${field} entry has no name`);
        if (!Number.isFinite(Number(effect?.value || 0))) errors.push(`${label}: ${field} entry has a non-numeric value`);
      }
    }

    const calculationEffect = hasNumericValues(rule.stats)
      || hasNumericValues(rule.conversions)
      || Number(rule?.misc?.targetMultiplier || 0) > 0
      || Object.prototype.hasOwnProperty.call(rule?.misc || {}, "forcedEvasion");
    const displayEffect = (rule.customEffects || []).length > 0 || (rule.skillEffects || []).length > 0
      || Number(rule?.misc?.jumpMultiplier || 0) !== 0 || Number(rule?.misc?.forcedSpeed || 0) !== 0;

    if (rule.reviewStatus === "implemented" && !calculationEffect) {
      errors.push(`${label}: implemented rule has no calculation effect`);
    }
    if (rule.reviewStatus === "display-only" && calculationEffect) {
      errors.push(`${label}: display-only rule contains a calculation effect`);
    }
    if (rule.reviewStatus === "display-only" && !displayEffect) {
      errors.push(`${label}: display-only rule has no display effect`);
    }
    if (rule.verified === false && rule.reviewStatus === "implemented") {
      warnings.push(`${label}: implemented but verified=false`);
    }
  }

  const sourceDuplicates = duplicateSourceRuleIds(manualSource);
  sourceDuplicates.forEach(([id, count]) => errors.push(`${id}: defined ${count} times in manual source`));

  const coverage = {
    manual: 0,
    generated: 0,
    runtimeSafeHint: 0,
    skillCompatibility: 0,
    damageCompatibility: 0
  };
  const remaining = generated.filter(rule => {
    if (manual[rule.catalogId]) {
      coverage.manual += 1;
      return false;
    }
    if (
      hasNumericValues(rule.stats)
      || hasNumericValues(rule.conversions)
      || (rule.customEffects || []).some(effect => Number(effect?.value || 0) !== 0)
      || (rule.skillEffects || []).some(effect => Number(effect?.value || 0) !== 0)
    ) {
      coverage.generated += 1;
      return false;
    }
    if (hasNumericValues(resolveSafeHints(rule))) {
      coverage.runtimeSafeHint += 1;
      return false;
    }
    const name = normalizedBuffName(rule?.name);
    if (skillCoveredNames.has(name)) {
      coverage.skillCompatibility += 1;
      return false;
    }
    if (damageCoveredNames.has(name)) {
      coverage.damageCompatibility += 1;
      return false;
    }
    return true;
  });
  const remainingWithNumericSource = remaining.filter(rule =>
    /\d/.test([rule.rawInfo, rule.parsedStatsHint, rule.scrapboxRawLines].filter(Boolean).join(" "))
  ).length;
  const percentPrefixArtifactRules = generated.filter(rule => resolvePercentPrefixArtifacts(rule).size > 0);
  const percentPrefixArtifactFields = percentPrefixArtifactRules
    .reduce((sum, rule) => sum + resolvePercentPrefixArtifacts(rule).size, 0);
  const wikiPercentPrefixArtifacts = wikiPercentPrefixArtifactCount(wikiEffects);
  const effectiveRules = [];
  const effectiveRuleKeys = new Set();
  [
    ...Object.entries(manual).map(([catalogId, rule]) => ({ catalogId, ...rule, source: rule.source || "manual" })),
    ...generated
  ].forEach(rule => {
    const key = rule.catalogId || rule.id || rule.officialTechnicId || rule.name;
    if (!key || effectiveRuleKeys.has(key)) return;
    effectiveRuleKeys.add(key);
    effectiveRules.push(rule);
  });
  const semanticDisplayDuplicates = semanticDisplayDuplicateAudit(effectiveRules, deduplicateSemanticDisplay);
  if (semanticDisplayDuplicates.remaining) {
    errors.push(`semantic display duplicates remain after runtime deduplication: ${semanticDisplayDuplicates.remaining}`);
  }
  const unverifiedRules = Object.values(manual)
    .filter(rule => rule?.reviewStatus === "unverified");
  const unverifiedReview = {
    finalized: unverifiedRules.filter(rule => rule?.reviewComplete === true).length,
    pending: unverifiedRules.filter(rule => rule?.reviewComplete !== true).length
  };

  return {
    ok: errors.length === 0,
    counts: {
      generatedRules: generated.length,
      manualRules: Object.keys(manual).length,
      runtimeStatKeys: runtimeStats.size,
      remainingWithoutNormalizedEffect: remaining.length,
      remainingWithNumericSource,
      remainingWithoutNumericSource: remaining.length - remainingWithNumericSource,
      percentPrefixArtifacts: {
        sourceRows: wikiPercentPrefixArtifacts.rows,
        sourceFields: wikiPercentPrefixArtifacts.fields,
        runtimeCandidates: percentPrefixArtifactRules.length,
        runtimeFields: percentPrefixArtifactFields,
        runtimeSuppressed: percentPrefixArtifactFields
      },
      semanticDisplayDuplicates,
      runtimeCoverage: coverage,
      reviewStatus: statusCounts,
      unverifiedReview
    },
    remainingCandidates: process.argv.includes("--details")
      ? remaining.map(rule => ({
          catalogId: rule.catalogId,
          name: rule.name,
          rawInfo: rule.rawInfo || "",
          parsedStatsHint: rule.parsedStatsHint || ""
        }))
      : undefined,
    errors,
    warnings
  };
}

const result = runAudit();
if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else {
  const counts = result.counts;
  console.log(`equipment buff manual audit: ${result.ok ? "OK" : "FAILED"}`);
  console.log(`generated=${counts.generatedRules} manual=${counts.manualRules} runtimeStats=${counts.runtimeStatKeys}`);
  console.log(`remaining=${counts.remainingWithoutNormalizedEffect} numericSource=${counts.remainingWithNumericSource} noNumericSource=${counts.remainingWithoutNumericSource}`);
  console.log(`percentPrefixArtifacts=${JSON.stringify(counts.percentPrefixArtifacts)}`);
  console.log(`semanticDisplayDuplicates=${JSON.stringify(counts.semanticDisplayDuplicates)}`);
  console.log(`runtimeCoverage=${JSON.stringify(counts.runtimeCoverage)}`);
  console.log(`reviewStatus=${JSON.stringify(counts.reviewStatus)}`);
  console.log(`unverifiedReview=${JSON.stringify(counts.unverifiedReview)}`);
  result.warnings.forEach(message => console.warn(`WARN: ${message}`));
  result.errors.forEach(message => console.error(`ERROR: ${message}`));
}

if (!result.ok) process.exitCode = 1;
