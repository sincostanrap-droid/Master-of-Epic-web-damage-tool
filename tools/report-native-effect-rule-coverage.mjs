#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const DEFAULT_EQUIPMENT = path.join(repoRoot, 'src/data/generated/equipmentCatalog.generated.js');
const DEFAULT_RULES = path.join(repoRoot, 'src/data/generated/nativeEffectRules.generated.js');
const DEFAULT_OUTDIR = path.join(repoRoot, 'dist/native-effect-rules');

function parseArgs(argv) {
  const args = { equipment: DEFAULT_EQUIPMENT, rules: DEFAULT_RULES, outDir: DEFAULT_OUTDIR };
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--equipment=')) args.equipment = path.resolve(arg.slice('--equipment='.length));
    else if (arg.startsWith('--rules=')) args.rules = path.resolve(arg.slice('--rules='.length));
    else if (arg.startsWith('--out-dir=')) args.outDir = path.resolve(arg.slice('--out-dir='.length));
    else if (arg === '--help' || arg === '-h') args.help = true;
  }
  return args;
}

function usage() {
  console.log(`Usage: node tools/report-native-effect-rule-coverage.mjs\n\nReports which equipment Buffs are already covered by nativeEffectRules and which remain unregistered.`);
}

function normalizeName(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function tsv(value) {
  return String(value ?? '').replace(/\r?\n/g, ' / ').replace(/\t/g, ' ');
}

async function runGeneratedJs(file) {
  const code = await fs.readFile(file, 'utf8');
  const sandbox = { window: {}, console: { log() {}, warn() {}, error() {} } };
  sandbox.globalThis = sandbox.window;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file, timeout: 2000 });
  return sandbox.window;
}

function looksLikeEquipmentArray(value) {
  if (!Array.isArray(value) || value.length < 10) return false;
  const sample = value.slice(0, Math.min(value.length, 80));
  let score = 0;
  for (const item of sample) {
    if (!item || typeof item !== 'object') continue;
    if ('name' in item) score += 2;
    if ('slot' in item || 'equip' in item) score += 1;
    if ('weaponType' in item || 'weaponDamage' in item || 'armorClass' in item) score += 1;
    if ('addStatuses' in item || 'technicId' in item || 'technicName' in item || 'technic_id' in item) score += 1;
  }
  return score >= Math.max(8, sample.length * 1.2);
}

function findEquipmentArray(windowObj) {
  const known = [
    'MOE_EQUIPMENT_CATALOG',
    'MOE_EQUIPMENT_ITEMS',
    'MOE_EQUIPMENT_CATALOG_ITEMS',
    'MOE_ITEM_CATALOG',
    'EQUIPMENT_CATALOG',
  ];
  for (const key of known) {
    const v = windowObj[key];
    if (looksLikeEquipmentArray(v)) return { key, items: v };
    if (v && typeof v === 'object') {
      for (const sub of ['items', 'equipment', 'data', 'catalog', 'list', 'all']) {
        if (looksLikeEquipmentArray(v[sub])) return { key: `${key}.${sub}`, items: v[sub] };
      }
    }
  }
  for (const key of Object.keys(windowObj)) {
    const v = windowObj[key];
    if (looksLikeEquipmentArray(v)) return { key, items: v };
    if (v && typeof v === 'object') {
      for (const sub of ['items', 'equipment', 'data', 'catalog', 'list', 'all']) {
        if (looksLikeEquipmentArray(v[sub])) return { key: `${key}.${sub}`, items: v[sub] };
      }
    }
  }
  throw new Error('Could not find equipment catalog array in generated JS.');
}

function getBuffName(item) {
  const candidates = [
    item?.technicName,
    item?.technic_name,
    item?.technic?.name,
    item?.buffName,
    item?.buff_name,
    item?.Buff,
    item?.buff,
  ];
  for (const c of candidates) {
    const n = normalizeName(c);
    if (n) return n;
  }
  return '';
}

function getTechnicId(item) {
  const id = item?.technicId ?? item?.technic_id ?? item?.technic?.id;
  return id == null || id === '' ? '' : String(id);
}

function hasDirectEffects(item) {
  if (Array.isArray(item?.addStatuses) && item.addStatuses.length) return true;
  if (Array.isArray(item?.extraStats) && item.extraStats.length) return true;
  if (item?.addStatusText) return true;
  return false;
}

function indexRules(windowObj) {
  const rules = Array.isArray(windowObj.MOE_NATIVE_EFFECT_RULES) ? windowObj.MOE_NATIVE_EFFECT_RULES : [];
  const byBuff = new Map();
  const byTech = new Map();
  const byEquipment = new Map();
  for (const rule of rules) {
    if (!rule || rule.enabled === false) continue;
    if (rule.normalizedTargetName || rule.targetName) {
      const key = normalizeName(rule.normalizedTargetName || rule.targetName);
      if (key) (byBuff.get(key) || byBuff.set(key, []).get(key)).push(rule);
    }
    if (rule.technicId != null && rule.technicId !== '') {
      const key = String(rule.technicId);
      (byTech.get(key) || byTech.set(key, []).get(key)).push(rule);
    }
    for (const name of rule.normalizedEquipmentNames || rule.equipmentNames || []) {
      const key = normalizeName(name);
      if (key) (byEquipment.get(key) || byEquipment.set(key, []).get(key)).push(rule);
    }
  }
  return { rules, byBuff, byTech, byEquipment };
}

function matchRules(item, indexes) {
  const found = [];
  const name = normalizeName(item?.name);
  const buff = getBuffName(item);
  const tech = getTechnicId(item);
  if (buff && indexes.byBuff.has(buff)) found.push(...indexes.byBuff.get(buff));
  if (tech && indexes.byTech.has(tech)) found.push(...indexes.byTech.get(tech));
  if (name && indexes.byEquipment.has(name)) found.push(...indexes.byEquipment.get(name));
  const seen = new Set();
  return found.filter(rule => {
    if (seen.has(rule.id)) return false;
    seen.add(rule.id);
    return true;
  });
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) return usage();

  const equipmentWindow = await runGeneratedJs(args.equipment);
  const rulesWindow = await runGeneratedJs(args.rules);
  const { key: equipmentSource, items } = findEquipmentArray(equipmentWindow);
  const indexes = indexRules(rulesWindow);

  const rows = [];
  const matched = [];
  const unmatched = [];
  const directOnly = [];
  const buffCounter = new Map();

  for (const item of items) {
    const buffName = getBuffName(item);
    const technicId = getTechnicId(item);
    const direct = hasDirectEffects(item);
    if (!buffName && !technicId && !direct) continue;

    const rules = matchRules(item, indexes);
    const row = {
      equipmentName: normalizeName(item?.name),
      slot: normalizeName(item?.slot || item?.equip),
      buffName,
      technicId,
      directEffects: direct ? 'TRUE' : 'FALSE',
      ruleIds: rules.map(r => r.id).join('|'),
      ruleNames: rules.map(r => r.targetName).join('|'),
      status: rules.length ? 'matched' : (buffName || technicId ? 'buff_unregistered' : 'direct_only'),
    };
    rows.push(row);
    if (rules.length) matched.push(row);
    else if (buffName || technicId) unmatched.push(row);
    else directOnly.push(row);

    if (buffName) {
      const key = `${buffName}\t${technicId}`;
      const entry = buffCounter.get(key) || { buffName, technicId, count: 0, examples: [] };
      entry.count++;
      if (entry.examples.length < 8) entry.examples.push(row.equipmentName);
      buffCounter.set(key, entry);
    }
  }

  const uncoveredBuffs = [...buffCounter.values()].filter(entry => {
    const fake = { technicName: entry.buffName, technicId: entry.technicId };
    return matchRules(fake, indexes).length === 0;
  }).sort((a, b) => b.count - a.count || a.buffName.localeCompare(b.buffName, 'ja'));

  const header = ['status', 'equipmentName', 'slot', 'buffName', 'technicId', 'directEffects', 'ruleIds', 'ruleNames'];
  const toLines = (list) => [header.join('\t'), ...list.map(r => header.map(h => tsv(r[h])).join('\t'))].join('\n') + '\n';

  const uncoveredHeader = ['buffName', 'technicId', 'equipmentCount', 'exampleEquipments'];
  const uncoveredLines = [uncoveredHeader.join('\t'), ...uncoveredBuffs.map(r => [r.buffName, r.technicId, r.count, r.examples.join('|')].map(tsv).join('\t'))].join('\n') + '\n';

  await fs.mkdir(args.outDir, { recursive: true });
  await fs.writeFile(path.join(args.outDir, 'nativeEffectRuleCoverage.all.tsv'), toLines(rows), 'utf8');
  await fs.writeFile(path.join(args.outDir, 'nativeEffectRuleCoverage.matched.tsv'), toLines(matched), 'utf8');
  await fs.writeFile(path.join(args.outDir, 'nativeEffectRuleCoverage.unmatchedBuffs.tsv'), toLines(unmatched), 'utf8');
  await fs.writeFile(path.join(args.outDir, 'nativeEffectRuleCoverage.uncoveredBuffNames.tsv'), uncoveredLines, 'utf8');
  await fs.writeFile(path.join(args.outDir, 'nativeEffectRuleCoverage.summary.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    equipmentSource,
    equipmentCount: items.length,
    enabledRuleCount: indexes.rules.filter(r => r.enabled !== false).length,
    rows: rows.length,
    matched: matched.length,
    unmatchedBuffEquipmentRows: unmatched.length,
    directOnly: directOnly.length,
    uncoveredBuffNameCount: uncoveredBuffs.length,
  }, null, 2), 'utf8');

  console.log(`[native-effect-coverage] equipment source: ${equipmentSource}`);
  console.log(`[native-effect-coverage] matched ${matched.length}, unmatched buff rows ${unmatched.length}, uncovered buff names ${uncoveredBuffs.length}`);
  console.log(`[native-effect-coverage] wrote ${path.relative(repoRoot, args.outDir).replace(/\\/g, '/')}`);
}

main().catch(error => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
