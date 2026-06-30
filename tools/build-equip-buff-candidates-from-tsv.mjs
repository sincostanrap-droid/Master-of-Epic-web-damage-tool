#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const VERSION = 'v1.23.20';
const ROOT = process.cwd();
const DEFAULT_INPUTS = [
  'data/manual/buffRules.manual.refined.tsv',
  'data/manual/buffRules.manual.scrapbox.tsv',
  'data/manual/buffRules.manual.input.tsv'
];
const DEFAULT_OUTPUT = 'src/data/generated/equipBuffRuleCandidates.generated.js';

const args = new Map();
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^--([^=]+)=(.*)$/);
  if (m) args.set(m[1], m[2]);
  else if (arg.startsWith('--')) args.set(arg.slice(2), true);
}

function readText(file) {
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}
function parseTsv(text) {
  return text.split(/\r?\n/).filter(line => line.length).map(line => line.split('\t'));
}
function truthy(v) {
  return /^(true|1|yes|y|on|○|あり|有効)$/i.test(String(v || '').trim());
}
function num(v) {
  const s = String(v ?? '').replace(/[％%]/g, '').trim();
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
function nonEmpty(v) {
  return String(v ?? '').trim();
}
function splitList(v) {
  return nonEmpty(v).split(/\s*[,;、，]\s*|\s*\|\s*|\s+\/\s+/).map(x => x.trim()).filter(Boolean);
}
function rowObject(headers, row) {
  const o = {};
  headers.forEach((h, i) => { if (h) o[h] = row[i] ?? ''; });
  return o;
}
function pickInput() {
  const specified = args.get('input');
  if (specified) return path.resolve(ROOT, specified);
  for (const rel of DEFAULT_INPUTS) {
    const p = path.resolve(ROOT, rel);
    if (fs.existsSync(p)) return p;
  }
  return path.resolve(ROOT, DEFAULT_INPUTS[0]);
}
function hasAnyEffect(rule) {
  return Object.values(rule.stats || {}).some(v => Number.isFinite(+v) && +v !== 0) ||
    rule.magicToAttackPct || rule.magicToSpeedPct || rule.speedToAttackPct ||
    rule.jumpMultiplier || rule.forcedSpeed || rule.targetDamageEffects ||
    (Array.isArray(rule.skillEffects) && rule.skillEffects.length) ||
    (Array.isArray(rule.customEffects) && rule.customEffects.length) ||
    rule.rawInfo || rule.scrapboxRawLines;
}

const input = pickInput();
const output = path.resolve(ROOT, args.get('output') || DEFAULT_OUTPUT);
if (!fs.existsSync(input)) {
  console.error(`[equip-buff-candidates] input not found: ${input}`);
  process.exit(1);
}

const rows = parseTsv(readText(input));
if (rows.length < 2) {
  console.error(`[equip-buff-candidates] TSV must have Japanese header + key header: ${input}`);
  process.exit(1);
}
const keyHeaderRow = rows[1].includes('officialTechnicId') ? 1 : 0;
const headers = rows[keyHeaderRow].map(x => String(x || '').trim());
const dataRows = rows.slice(keyHeaderRow + 1).filter(r => r.some(c => String(c || '').trim()));

const statKeys = [
  'attack','attackPct','magic','magicPct','speed','speedPct','dmgPct',
  'extraAC','extraACPct','extraHP','extraHPPct','extraMP','extraMPPct','extraST','extraSTPct',
  'extraMaxWeight','extraMaxWeightPct','extraHit','extraHitPct','extraAvoid','extraAvoidPct',
  'extraAttackDelay','extraAttackDelayPct','extraMagicDelay','extraMagicDelayPct',
  'extraFireRes','extraFireResPct','extraWaterRes','extraWaterResPct','extraEarthRes','extraEarthResPct',
  'extraWindRes','extraWindResPct','extraNeutralRes','extraNeutralResPct','extraDamageReducePct','extraCritRatePct',
  'extraBreath','extraHearing','extraSeeing','extraSmelling','extraFullness','extraThirst','extraSteal','extraLockpickingFail','extraFangAttack',
  'extraFishingGaugeLength','extraFishingHitZone','extraSmithingGradeZone','extraSmithingGaugeSlip','extraSmithingHitZone',
  'extraCarpentryGradeZone','extraCarpentryGaugeSlip','extraCarpentryHitZone','extraTailoringGradeZone','extraTailoringGaugeSlip','extraTailoringHitZone',
  'extraDecorationGradeZone','extraDecorationGaugeSlip','extraDecorationHitZone','extraCookingGradeZone','extraCookingGaugeSlip','extraCookingHitZone',
  'extraBrewingGradeZone','extraBrewingGaugeSlip','extraBrewingHitZone','extraAlchemyGradeZone','extraAlchemyGaugeSlip','extraAlchemyHitZone',
  'extraReplicationGradeZone','extraReplicationGaugeSlip','extraReplicationHitZone','extraBeautyGaugeSlip','extraBeautyHitZone',
  'hpRegenPerMinute','stRegenPerMinute','mpRegenPerMinute','stCostReducePct','mpCostReducePct','itemUseDelayPct',
  'physicalDamageReducePct','physicalReflectPct','magicReflectPct'
];

const candidates = [];
for (const row of dataRows) {
  const r = rowObject(headers, row);
  const officialTechnicId = nonEmpty(r.officialTechnicId || r.matchedOfficialTechnicIds).split(/[;,|]/)[0];
  const catalogId = nonEmpty(r.catalogId || (officialTechnicId ? `technic-${officialTechnicId}` : ''));
  const name = nonEmpty(r.name || r.wikiName);
  if (!officialTechnicId && !catalogId && !name) continue;

  const stats = {};
  for (const key of statKeys) {
    const v = num(r[key]);
    if (v) stats[key] = v;
  }

  const skillEffects = splitList(r.skillEffects).map(x => {
    const m = x.match(/^(.+?)[：:](?:\+)?(-?\d+(?:\.\d+)?)$/);
    return m ? {name:m[1].trim(), value:num(m[2])} : {name:x, value:0};
  });
  const customEffects = splitList(r.customEffects).map(x => ({name:x, value:0}));

  const rule = {
    catalogId,
    officialTechnicId: officialTechnicId ? Number(officialTechnicId) : '',
    name,
    wikiName: nonEmpty(r.wikiName),
    equipmentNames: splitList(r.equipmentNames),
    enabled: truthy(r.enabled),
    verified: truthy(r.verified),
    applyDefault: truthy(r.applyDefault),
    confidence: nonEmpty(r.refineStatus || r.scrapboxMatchQuality || r.matchStatus),
    conflictGroup: nonEmpty(r.conflictGroup || r.scrapboxConflictGroupHint || (officialTechnicId ? `technic-${officialTechnicId}` : catalogId)),
    stackRule: nonEmpty(r.stackRule || r.scrapboxStackRuleHint || 'same-technic'),
    stats,
    conversions: {
      magicToAttackPct: num(r.magicToAttackPct),
      magicToSpeedPct: num(r.magicToSpeedPct),
      speedToAttackPct: num(r.speedToAttackPct)
    },
    misc: {
      jumpMultiplier: num(r.jumpMultiplier),
      forcedSpeed: num(r.forcedSpeed),
      targetDamageEffects: nonEmpty(r.targetDamageEffects)
    },
    skillEffects,
    customEffects,
    memo: nonEmpty(r.memo || r.refineNotes || r.scrapboxNotes || r.unparsedNotes),
    rawInfo: nonEmpty(r.rawInfo),
    parsedStatsHint: nonEmpty(r.parsedStatsHint || r.scrapboxEffectHint),
    scrapboxPages: nonEmpty(r.scrapboxPages),
    scrapboxRawLines: nonEmpty(r.scrapboxRawLines),
    sourcePage: nonEmpty(r.sourcePage),
    wikiId: nonEmpty(r.wikiId),
    source: nonEmpty(r.source || 'tsv-generated')
  };
  if (hasAnyEffect(rule)) candidates.push(rule);
}

fs.mkdirSync(path.dirname(output), {recursive:true});
const body = `// Generated by tools/build-equip-buff-candidates-from-tsv.mjs\n// ${new Date().toISOString()}\nwindow.MOE_EQUIP_BUFF_RULE_CANDIDATES_META = ${JSON.stringify({generatedAt:new Date().toISOString(), generatorVersion:VERSION, source:path.relative(ROOT,input).replace(/\\/g,'/'), rowCount:candidates.length}, null, 2)};\nwindow.MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED = ${JSON.stringify(candidates, null, 2)};\n`;
fs.writeFileSync(output, body, 'utf8');
console.log(`[equip-buff-candidates] ${VERSION}`);
console.log(`[read] ${input} (${dataRows.length} rows)`);
console.log(`[write] ${output} (${candidates.length} candidates)`);
console.log('[next] カタログ追加時の装備Buff初期値としてブラウザ側で読み込まれます。');
