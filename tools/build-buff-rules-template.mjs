#!/usr/bin/env node
/**
 * Master of Epic 物理ダメージ計算webツール
 * Wiki装備Buff効果候補から、手入力用TSVテンプレートを生成する。
 *
 * 使い方:
 *   node tools/build-buff-rules-template.mjs
 *   node tools/build-buff-rules-template.mjs --only-matched
 *
 * 出力:
 *   data/manual/buffRules.manual.input.tsv
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const VERSION = "v1.23.13";
const ROOT = process.cwd();
const GENERATED_PATH = path.join(ROOT, "src/data/generated/wikiEquipBuffEffects.generated.js");
const OUT_PATH = path.join(ROOT, "data/manual/buffRules.manual.input.tsv");
const onlyMatched = process.argv.includes("--only-matched");

const STAT_COLUMNS = [
  "attack", "attackPct", "magic", "magicPct", "speed", "speedPct", "dmgPct",
  "extraAC", "extraACPct", "extraHP", "extraHPPct", "extraMP", "extraMPPct", "extraST", "extraSTPct",
  "extraMaxWeight", "extraMaxWeightPct", "extraHit", "extraHitPct", "extraAvoid", "extraAvoidPct",
  "extraAttackDelay", "extraAttackDelayPct", "extraMagicDelay", "extraMagicDelayPct",
  "extraFireRes", "extraFireResPct", "extraWaterRes", "extraWaterResPct", "extraEarthRes", "extraEarthResPct",
  "extraWindRes", "extraWindResPct", "extraNeutralRes", "extraNeutralResPct",
  "extraDamageReducePct", "extraCritRatePct",
  "extraBreath", "extraHearing", "extraSeeing", "extraSmelling",
  "extraFullness", "extraThirst", "extraSteal", "extraLockpickingFail", "extraFangAttack",
  "extraFishingGaugeLength", "extraFishingHitZone",
  "extraSmithingGradeZone", "extraSmithingGaugeSlip", "extraSmithingHitZone",
  "extraCarpentryGradeZone", "extraCarpentryGaugeSlip", "extraCarpentryHitZone",
  "extraTailoringGradeZone", "extraTailoringGaugeSlip", "extraTailoringHitZone",
  "extraDecorationGradeZone", "extraDecorationGaugeSlip", "extraDecorationHitZone",
  "extraCookingGradeZone", "extraCookingGaugeSlip", "extraCookingHitZone",
  "extraBrewingGradeZone", "extraBrewingGaugeSlip", "extraBrewingHitZone",
  "extraAlchemyGradeZone", "extraAlchemyGaugeSlip", "extraAlchemyHitZone",
  "extraReplicationGradeZone", "extraReplicationGaugeSlip", "extraReplicationHitZone",
  "extraBeautyGaugeSlip", "extraBeautyHitZone",
  "hpRegenPerMinute", "stRegenPerMinute", "mpRegenPerMinute",
  "stCostReducePct", "mpCostReducePct", "itemUseDelayPct",
  "physicalDamageReducePct", "physicalReflectPct", "magicReflectPct"
];

const HEADER = [
  "enabled", "verified", "applyDefault", "officialTechnicId", "catalogId", "name", "conflictGroup", "stackRule",
  ...STAT_COLUMNS,
  "skillEffects", "customEffects", "memo", "source", "wikiName", "matchStatus", "matchedBuffIds", "matchedOfficialTechnicIds",
  "parsedStatsHint", "unparsedNotes", "equipmentNames", "rawInfo", "sourcePage", "wikiId"
];

const PROP_ALIASES = new Map([
  ["attack", "attack"], ["attackPct", "attackPct"],
  ["magic", "magic"], ["magicPct", "magicPct"],
  ["speed", "speed"], ["speedPct", "speedPct"], ["dmgPct", "dmgPct"],
  ["extraAC", "extraAC"], ["extraACPct", "extraACPct"],
  ["extraHP", "extraHP"], ["extraHPPct", "extraHPPct"],
  ["extraMP", "extraMP"], ["extraMPPct", "extraMPPct"],
  ["extraST", "extraST"], ["extraSTPct", "extraSTPct"],
  ["extraMaxWeight", "extraMaxWeight"], ["extraMaxWeightPct", "extraMaxWeightPct"],
  ["extraHit", "extraHit"], ["extraHitPct", "extraHitPct"],
  ["extraAvoid", "extraAvoid"], ["extraAvoidPct", "extraAvoidPct"],
  ["extraAttackDelay", "extraAttackDelay"], ["extraAttackDelayPct", "extraAttackDelayPct"],
  ["extraMagicDelay", "extraMagicDelay"], ["extraMagicDelayPct", "extraMagicDelayPct"],
  ["extraFireRes", "extraFireRes"], ["extraFireResPct", "extraFireResPct"],
  ["extraWaterRes", "extraWaterRes"], ["extraWaterResPct", "extraWaterResPct"],
  ["extraEarthRes", "extraEarthRes"], ["extraEarthResPct", "extraEarthResPct"],
  ["extraWindRes", "extraWindRes"], ["extraWindResPct", "extraWindResPct"],
  ["extraNeutralRes", "extraNeutralRes"], ["extraNeutralResPct", "extraNeutralResPct"],
  ["extraDamageReducePct", "extraDamageReducePct"], ["extraCritRatePct", "extraCritRatePct"],
  ["hpRegenPerMinute", "hpRegenPerMinute"], ["stRegenPerMinute", "stRegenPerMinute"], ["mpRegenPerMinute", "mpRegenPerMinute"],
]);

function loadGeneratedRows() {
  if (!fs.existsSync(GENERATED_PATH)) {
    throw new Error(`${GENERATED_PATH} が見つかりません。先に node tools/build-wiki-equip-buff-effects.mjs --rematch-only を実行してください。`);
  }
  const code = fs.readFileSync(GENERATED_PATH, "utf8");
  const sandbox = { window: {} };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: GENERATED_PATH });
  return sandbox.window.MOE_WIKI_EQUIP_BUFF_EFFECTS_GENERATED || [];
}

function tsvCell(value) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function joinList(value) {
  if (!Array.isArray(value)) return tsvCell(value);
  return value.map(v => tsvCell(v)).filter(Boolean).join(" / ");
}

function parsedStatsHint(stats) {
  if (!Array.isArray(stats) || !stats.length) return "";
  return stats.map(s => `${s.label || s.prop || s.key}:${s.value}${s.unit || ""}${s.target ? `(${s.target})` : ""}`).join(" / ");
}

function statValuesFromParsed(stats) {
  const out = Object.fromEntries(STAT_COLUMNS.map(c => [c, ""]));
  if (!Array.isArray(stats)) return out;
  for (const s of stats) {
    const prop = PROP_ALIASES.get(s.prop) || PROP_ALIASES.get(s.key);
    if (!prop || !(prop in out)) continue;
    const v = Number(s.value);
    if (!Number.isFinite(v)) continue;
    out[prop] = out[prop] === "" ? String(v) : `${out[prop]};${v}`;
  }
  return out;
}

function buildRow(row) {
  const ids = Array.isArray(row.matchedOfficialTechnicIds) ? row.matchedOfficialTechnicIds.filter(Boolean) : [];
  const buffIds = Array.isArray(row.matchedBuffIds) ? row.matchedBuffIds.filter(Boolean) : [];
  const singleId = ids.length === 1 ? ids[0] : "";
  const stats = statValuesFromParsed(row.parsedStats);
  const obj = {
    enabled: "",
    verified: "",
    applyDefault: "",
    officialTechnicId: singleId,
    catalogId: singleId ? `technic-${singleId}` : "",
    name: row.name || "",
    conflictGroup: singleId ? `technic-${singleId}` : "",
    stackRule: "same-technic",
    ...stats,
    skillEffects: "",
    customEffects: "",
    memo: "",
    source: "wiki-manual",
    wikiName: row.name || "",
    matchStatus: row.matchStatus || "",
    matchedBuffIds: joinList(buffIds),
    matchedOfficialTechnicIds: joinList(ids),
    parsedStatsHint: parsedStatsHint(row.parsedStats),
    unparsedNotes: joinList(row.unparsedNotes),
    equipmentNames: joinList(row.equipmentNames),
    rawInfo: row.info || "",
    sourcePage: row.sourcePage || "",
    wikiId: row.wikiId || ""
  };
  return HEADER.map(h => tsvCell(obj[h])).join("\t");
}

const rows = loadGeneratedRows();
const filtered = onlyMatched ? rows.filter(r => (r.matchedOfficialTechnicIds || []).length) : rows;
fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
const text = [HEADER.join("\t"), ...filtered.map(buildRow)].join("\n") + "\n";
fs.writeFileSync(OUT_PATH, text, "utf8");
console.log(`[buff-rules-template] ${VERSION}`);
console.log(`[read] ${GENERATED_PATH} (${rows.length} rows)`);
console.log(`[write] ${OUT_PATH} (${filtered.length} rows${onlyMatched ? ", matched only" : ""})`);
console.log("[next] enabled=TRUE にした行だけ tools/build-buff-rules-manual-from-tsv.mjs で manual JS 化できます。");
