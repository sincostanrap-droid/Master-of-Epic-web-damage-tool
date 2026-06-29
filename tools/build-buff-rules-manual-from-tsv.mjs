#!/usr/bin/env node
/**
 * Master of Epic 物理ダメージ計算webツール
 * data/manual/buffRules.manual.input.tsv から src/data/manual/buffRules.manual.js を生成する。
 *
 * 使い方:
 *   node tools/build-buff-rules-manual-from-tsv.mjs
 *   node tools/build-buff-rules-manual-from-tsv.mjs --input=data/manual/foo.tsv --output=src/data/manual/buffRules.manual.js
 */

import fs from "node:fs";
import path from "node:path";

const VERSION = "v1.23.13";
const ROOT = process.cwd();
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
}));
const INPUT = path.resolve(ROOT, args.input || "data/manual/buffRules.manual.input.tsv");
const OUTPUT = path.resolve(ROOT, args.output || "src/data/manual/buffRules.manual.js");

const STAT_TO_EQUIP_PROP = {
  attack: "equipBuffFlatAttack",
  attackPct: "equipBuffAttackPct",
  magic: "equipBuffFlatMagic",
  magicPct: "equipBuffMagicPct",
  speed: "equipBuffFlatSpeed",
  speedPct: "equipBuffSpeedPct",
  dmgPct: "equipBuffDmgPct",
  extraAC: "equipBuffExtraAC",
  extraACPct: "equipBuffExtraACPct",
  extraHP: "equipBuffExtraHP",
  extraHPPct: "equipBuffExtraHPPct",
  extraMP: "equipBuffExtraMP",
  extraMPPct: "equipBuffExtraMPPct",
  extraST: "equipBuffExtraST",
  extraSTPct: "equipBuffExtraSTPct",
  extraMaxWeight: "equipBuffExtraMaxWeight",
  extraMaxWeightPct: "equipBuffExtraMaxWeightPct",
  extraHit: "equipBuffExtraHit",
  extraHitPct: "equipBuffExtraHitPct",
  extraAvoid: "equipBuffExtraAvoid",
  extraAvoidPct: "equipBuffExtraAvoidPct",
  extraAttackDelay: "equipBuffExtraAttackDelay",
  extraAttackDelayPct: "equipBuffExtraAttackDelayPct",
  extraMagicDelay: "equipBuffExtraMagicDelay",
  extraMagicDelayPct: "equipBuffExtraMagicDelayPct",
  extraFireRes: "equipBuffExtraFireRes",
  extraFireResPct: "equipBuffExtraFireResPct",
  extraWaterRes: "equipBuffExtraWaterRes",
  extraWaterResPct: "equipBuffExtraWaterResPct",
  extraEarthRes: "equipBuffExtraEarthRes",
  extraEarthResPct: "equipBuffExtraEarthResPct",
  extraWindRes: "equipBuffExtraWindRes",
  extraWindResPct: "equipBuffExtraWindResPct",
  extraNeutralRes: "equipBuffExtraNeutralRes",
  extraNeutralResPct: "equipBuffExtraNeutralResPct",
  extraDamageReducePct: "equipBuffExtraDamageReducePct",
  extraCritRatePct: "equipBuffExtraCritRatePct",
  extraBreath: "equipBuffExtraBreath",
  extraHearing: "equipBuffExtraHearing",
  extraSeeing: "equipBuffExtraSeeing",
  extraSmelling: "equipBuffExtraSmelling",
  extraFullness: "equipBuffExtraFullness",
  extraThirst: "equipBuffExtraThirst",
  extraSteal: "equipBuffExtraSteal",
  extraLockpickingFail: "equipBuffExtraLockpickingFail",
  extraFangAttack: "equipBuffExtraFangAttack",
  extraFishingGaugeLength: "equipBuffExtraFishingGaugeLength",
  extraFishingHitZone: "equipBuffExtraFishingHitZone",
  extraSmithingGradeZone: "equipBuffExtraSmithingGradeZone",
  extraSmithingGaugeSlip: "equipBuffExtraSmithingGaugeSlip",
  extraSmithingHitZone: "equipBuffExtraSmithingHitZone",
  extraCarpentryGradeZone: "equipBuffExtraCarpentryGradeZone",
  extraCarpentryGaugeSlip: "equipBuffExtraCarpentryGaugeSlip",
  extraCarpentryHitZone: "equipBuffExtraCarpentryHitZone",
  extraTailoringGradeZone: "equipBuffExtraTailoringGradeZone",
  extraTailoringGaugeSlip: "equipBuffExtraTailoringGaugeSlip",
  extraTailoringHitZone: "equipBuffExtraTailoringHitZone",
  extraDecorationGradeZone: "equipBuffExtraDecorationGradeZone",
  extraDecorationGaugeSlip: "equipBuffExtraDecorationGaugeSlip",
  extraDecorationHitZone: "equipBuffExtraDecorationHitZone",
  extraCookingGradeZone: "equipBuffExtraCookingGradeZone",
  extraCookingGaugeSlip: "equipBuffExtraCookingGaugeSlip",
  extraCookingHitZone: "equipBuffExtraCookingHitZone",
  extraBrewingGradeZone: "equipBuffExtraBrewingGradeZone",
  extraBrewingGaugeSlip: "equipBuffExtraBrewingGaugeSlip",
  extraBrewingHitZone: "equipBuffExtraBrewingHitZone",
  extraAlchemyGradeZone: "equipBuffExtraAlchemyGradeZone",
  extraAlchemyGaugeSlip: "equipBuffExtraAlchemyGaugeSlip",
  extraAlchemyHitZone: "equipBuffExtraAlchemyHitZone",
  extraReplicationGradeZone: "equipBuffExtraReplicationGradeZone",
  extraReplicationGaugeSlip: "equipBuffExtraReplicationGaugeSlip",
  extraReplicationHitZone: "equipBuffExtraReplicationHitZone",
  extraBeautyGaugeSlip: "equipBuffExtraBeautyGaugeSlip",
  extraBeautyHitZone: "equipBuffExtraBeautyHitZone"
};

const EXTRA_NUMERIC_RULES = {
  hpRegenPerMinute: "hpRegenPerMinute",
  stRegenPerMinute: "stRegenPerMinute",
  mpRegenPerMinute: "mpRegenPerMinute",
  stCostReducePct: "stCostReducePct",
  mpCostReducePct: "mpCostReducePct",
  itemUseDelayPct: "itemUseDelayPct",
  physicalDamageReducePct: "physicalDamageReducePct",
  physicalReflectPct: "physicalReflectPct",
  magicReflectPct: "magicReflectPct"
};

function parseTsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.length);
  if (!lines.length) return [];
  const header = lines[0].split("\t");
  return lines.slice(1).map(line => {
    const cells = line.split("\t");
    const row = {};
    header.forEach((h, i) => row[h] = cells[i] ?? "");
    return row;
  });
}

function truthy(v) {
  return ["true", "1", "yes", "y", "on", "ok", "済", "はい"].includes(String(v || "").trim().toLowerCase());
}

function toNumber(v) {
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const s = String(v).trim().replace(/％/g, "%").replace(/,/g, "").replace(/%$/, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function clean(v) {
  return String(v ?? "").replace(/\r?\n/g, " ").trim();
}

function splitList(v) {
  return clean(v).split(/\s*[\/|;、,]\s*/).map(s => s.trim()).filter(Boolean);
}

function parseSkillEffects(v) {
  const s = clean(v);
  if (!s) return [];
  return s.split(/[;；\/]/).map(part => {
    const m = part.trim().match(/^(.+?)[：:](?:\+)?(-?\d+(?:\.\d+)?)$/);
    if (!m) return null;
    return { skill: m[1].trim(), value: Number(m[2]) };
  }).filter(Boolean);
}

function parseCustomEffects(v) {
  const s = clean(v);
  if (!s) return [];
  return s.split(/[;；]/).map(part => part.trim()).filter(Boolean).map(text => ({ text }));
}

function ruleFromRow(row, lineNo) {
  if (!truthy(row.enabled)) return null;
  const officialTechnicId = toNumber(row.officialTechnicId);
  if (!officialTechnicId) {
    throw new Error(`line ${lineNo}: enabled=TRUE ですが officialTechnicId が空です: ${row.name || row.wikiName || "(no name)"}`);
  }
  const id = clean(row.catalogId) || `technic-${officialTechnicId}`;
  const stats = {};
  for (const [col, prop] of Object.entries(STAT_TO_EQUIP_PROP)) {
    const n = toNumber(row[col]);
    if (n !== null) stats[prop] = n;
  }
  const extra = {};
  for (const [col, key] of Object.entries(EXTRA_NUMERIC_RULES)) {
    const n = toNumber(row[col]);
    if (n !== null) extra[key] = n;
  }
  return [id, {
    officialTechnicId,
    name: clean(row.name) || clean(row.wikiName) || id,
    verified: truthy(row.verified),
    applyDefault: truthy(row.applyDefault),
    source: clean(row.source) || "manual-tsv",
    conflictGroup: clean(row.conflictGroup) || id,
    stackRule: clean(row.stackRule) || "same-technic",
    stats,
    extra,
    skillEffects: parseSkillEffects(row.skillEffects),
    customEffects: parseCustomEffects(row.customEffects),
    memo: clean(row.memo),
    sourceWikiName: clean(row.wikiName),
    sourcePage: clean(row.sourcePage),
    equipmentNames: splitList(row.equipmentNames),
    rawInfo: clean(row.rawInfo)
  }];
}

if (!fs.existsSync(INPUT)) {
  throw new Error(`${INPUT} が見つかりません。先に node tools/build-buff-rules-template.mjs を実行してください。`);
}
const rows = parseTsv(fs.readFileSync(INPUT, "utf8"));
const rules = {};
let enabled = 0;
rows.forEach((row, idx) => {
  const entry = ruleFromRow(row, idx + 2);
  if (!entry) return;
  enabled += 1;
  const [id, rule] = entry;
  rules[id] = rule;
});

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
const body = `// Generated by tools/build-buff-rules-manual-from-tsv.mjs\n// Generator: ${VERSION}\n// Source: ${path.relative(ROOT, INPUT).replace(/\\/g, "/")}\n// このファイルはTSVから生成されます。直接編集する場合は次回生成で上書きされる点に注意してください。\nwindow.MOE_BUFF_RULES_MANUAL = ${JSON.stringify(rules, null, 2)};\n`;
fs.writeFileSync(OUTPUT, body, "utf8");
console.log(`[buff-rules-manual] ${VERSION}`);
console.log(`[read] ${INPUT} (${rows.length} rows)`);
console.log(`[enabled] ${enabled}`);
console.log(`[write] ${OUTPUT} (${Object.keys(rules).length} rules)`);
