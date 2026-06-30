#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const DEFAULT_INPUTS = [
  'data/manual/buffRules.manual.refined.tsv',
  'data/manual/buffRules.manual.scrapbox.tsv',
  'dist/wiki-equip-buff-effects/wikiEquipBuffEffects.parsed.tsv',
].map(p => path.join(repoRoot, p));

const DEFAULT_OUTPUT = path.join(repoRoot, 'dist/native-effect-rules/nativeEffectRules.candidates.tsv');
const DEFAULT_SUMMARY = path.join(repoRoot, 'dist/native-effect-rules/nativeEffectRules.candidates.summary.json');

const MANUAL_HEADER = [
  'id',
  'enabled',
  'category',
  'match_type',
  'target_name',
  'equipment_names',
  'technic_id',
  'effects_json',
  'unsupported_json',
  'stack_group',
  'stack_mode',
  'verification',
  'notes',
  'sources',
];

function parseArgs(argv) {
  const args = {
    inputs: [...DEFAULT_INPUTS],
    output: DEFAULT_OUTPUT,
    summary: DEFAULT_SUMMARY,
    minScore: 1,
  };
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--input=')) args.inputs = arg.slice('--input='.length).split(/[;,]/).map(p => path.resolve(p.trim())).filter(Boolean);
    else if (arg.startsWith('--output=')) args.output = path.resolve(arg.slice('--output='.length));
    else if (arg.startsWith('--summary=')) args.summary = path.resolve(arg.slice('--summary='.length));
    else if (arg.startsWith('--min-score=')) args.minScore = Number(arg.slice('--min-score='.length));
    else if (arg === '--help' || arg === '-h') args.help = true;
  }
  return args;
}

function usage() {
  console.log(`Usage: node tools/extract-native-effect-rule-candidates.mjs [--input=a.tsv,b.tsv] [--output=path]\n\nExtracts review candidates from existing self-maintained buff/equipment effect TSVs.\nIt does not edit data/manual/nativeEffectRules.manual.tsv.`);
}

function stripBom(text) {
  return String(text || '').replace(/^\uFEFF/, '');
}

function splitTsvLine(line) {
  return String(line).split('\t');
}

function parseTsvLoose(text) {
  const lines = stripBom(text).split(/\r?\n/).filter(line => line.trim());
  if (!lines.length) return { headers: [], rows: [] };
  const headers = splitTsvLine(lines[0]).map(h => h.trim());
  const looksHeader = headers.some(h => /name|buff|technic|effect|equipment|source|notes|id|効果|装備|名前|名称/i.test(h));
  const start = looksHeader ? 1 : 0;
  const finalHeaders = looksHeader ? headers : [];
  const rows = [];
  for (let i = start; i < lines.length; i++) {
    const cells = splitTsvLine(lines[i]).map(v => v.trim());
    const row = { __line: i + 1, __raw: lines[i], __cells: cells };
    finalHeaders.forEach((h, idx) => {
      row[h] = cells[idx] ?? '';
    });
    rows.push(row);
  }
  return { headers: finalHeaders, rows };
}

function normalizeName(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function unique(values) {
  return [...new Set(values.map(v => normalizeName(v)).filter(Boolean))];
}

function safeIdPart(value) {
  return normalizeName(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'unknown';
}

function tsvEscape(value) {
  const text = String(value ?? '');
  return text.replace(/\r?\n/g, ' / ').replace(/\t/g, ' ');
}

function jsonCell(value) {
  return JSON.stringify(value ?? {});
}

function firstExisting(row, names) {
  for (const name of names) {
    if (row[name] != null && String(row[name]).trim()) return String(row[name]).trim();
  }
  return '';
}

function findTechnicId(row) {
  const direct = firstExisting(row, ['technic_id', 'technicId', 'technique_id', 'id', 'ID', '技ID']);
  if (/^\d{3,6}$/.test(direct)) return direct;
  const raw = row.__raw || '';
  const m1 = raw.match(/\btechnic[-_](\d{3,6})\b/i);
  if (m1) return m1[1];
  const cells = row.__cells || [];
  for (const cell of cells.slice(0, 8)) {
    if (/^\d{3,6}$/.test(cell)) return cell;
  }
  return '';
}

function findTargetName(row) {
  const direct = firstExisting(row, [
    'target_name', 'buff_name', 'buffName', 'technic_name', 'technicName', 'name', '名前', '名称', '効果名', 'バフ名'
  ]);
  if (direct && direct.length < 80 && !/^technic-\d+$/i.test(direct)) return normalizeName(direct);

  const raw = row.__raw || '';
  const buffMatches = [...raw.matchAll(/([^\/\t\[\]]{2,60}?):buff\b/g)].map(m => m[1]);
  const named = buffMatches.find(v => !/増加バフ|減少バフ|reference|攻撃力増加バフ|命中増加バフ|魔力増加バフ/.test(v));
  if (named) return normalizeName(named);
  if (buffMatches.length) return normalizeName(buffMatches[0]);

  const cells = row.__cells || [];
  const techIndex = cells.findIndex(c => /^technic-\d+$/i.test(c));
  if (techIndex >= 0 && cells[techIndex + 1] && cells[techIndex + 1].length < 80) {
    return normalizeName(cells[techIndex + 1]);
  }

  for (const cell of cells.slice(0, 12)) {
    if (/^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}A-Za-z0-9ー・（）()\s]+$/u.test(cell) && cell.length >= 2 && cell.length <= 40) {
      if (!/^\d+$/.test(cell) && !/^same-|^matched|^exclusive|^wiki-/i.test(cell)) return normalizeName(cell);
    }
  }
  return '';
}

function findEquipmentNames(row) {
  const raw = row.__raw || '';
  const fromMatched = [...raw.matchAll(/([^\/\t\[\]]{2,80}?):equipment\b/g)].map(m => m[1]);
  const bracketSpec = [...raw.matchAll(/\[([^\]\n]{2,80})\]\s*(?:table:spec|追加|バフ[:：]|https?:\/\/idb\.moepic\.com\/items)/g)].map(m => m[1]);
  const direct = firstExisting(row, ['equipment_names', 'equipments', 'equipment', '装備名', '対象装備']);
  const directList = direct ? direct.split(/[|/、,]+/) : [];
  return unique([...fromMatched, ...bracketSpec, ...directList]).slice(0, 20);
}

function addEffect(effects, key, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  if (effects[key] == null) effects[key] = n;
  else if (effects[key] !== n) effects[key] = effects[key];
  return true;
}

function extractEffects(row) {
  const raw = normalizeName(row.__raw || '');
  const effects = {};
  const unsupportedText = [];
  const hits = [];

  function scan(label, key, regexes) {
    for (const re of regexes) {
      for (const m of raw.matchAll(re)) {
        const ok = addEffect(effects, key, m[1]);
        if (ok) hits.push(`${label}:${m[1]}`);
      }
    }
  }

  scan('攻撃力%', 'attackPct', [
    /#?攻撃力(?:増加)?(?:バフ)?\s*([+-]?\d+(?:\.\d+)?)\s*(?:%|％)/g,
    /攻撃力\s*[+＋]?\s*([+-]?\d+(?:\.\d+)?)\s*(?:%|％)/g,
  ]);
  scan('攻撃力', 'attackFlat', [
    /\[?攻撃力増加装備\]?\s*([+-]?\d+(?:\.\d+)?)/g,
    /攻撃力(?:増加)?(?:装備)?\s*[+＋]\s*(\d+(?:\.\d+)?)(?!\s*(?:%|％))/g,
  ]);
  scan('命中%', 'hitPct', [
    /#?命中(?:増加)?(?:バフ)?\s*([+-]?\d+(?:\.\d+)?)\s*(?:%|％)/g,
    /命中\s*[+＋]?\s*([+-]?\d+(?:\.\d+)?)\s*(?:%|％)/g,
  ]);
  scan('命中', 'hitFlat', [
    /\[?命中増加装備\]?\s*([+-]?\d+(?:\.\d+)?)/g,
    /命中(?:増加)?(?:装備)?\s*[+＋]\s*(\d+(?:\.\d+)?)(?!\s*(?:%|％))/g,
  ]);
  scan('回避%', 'evasionPct', [
    /#?回避(?:増加)?(?:バフ)?\s*([+-]?\d+(?:\.\d+)?)\s*(?:%|％)/g,
    /回避\s*[+＋]?\s*([+-]?\d+(?:\.\d+)?)\s*(?:%|％)/g,
  ]);
  scan('回避', 'evasionFlat', [
    /\[?回避増加装備\]?\s*([+-]?\d+(?:\.\d+)?)/g,
    /回避(?:増加)?(?:装備)?\s*[+＋]\s*(\d+(?:\.\d+)?)(?!\s*(?:%|％))/g,
  ]);
  scan('攻撃ディレイ', 'attackDelay', [
    /\[?攻撃ディレイ減少装備\]?\s*([+-]?\d+(?:\.\d+)?)/g,
    /攻撃ディレイ(?:減少|短縮)?(?:装備)?\s*([+-]?\d+(?:\.\d+)?)/g,
  ]);
  scan('クリティカル率', 'criticalRate', [
    /クリティカル(?:率)?(?:UP|アップ|増加)?[^\d+-]{0,10}([+-]?\d+(?:\.\d+)?)/g,
    /#?クリティカル(?:率)?(?:増加)?(?:バフ)?\s*([+-]?\d+(?:\.\d+)?)/g,
  ]);
  scan('物理与ダメージ%', 'physicalDamagePct', [
    /#?物理(?:攻撃)?(?:与)?ダメージ(?:増加)?(?:バフ)?\s*[*x×]?\s*1\.(\d+)/g,
    /物理(?:攻撃)?(?:与)?ダメージ[^\d+-]{0,20}([+-]?\d+(?:\.\d+)?)\s*(?:%|％)/g,
  ]);
  if (effects.physicalDamagePct != null && effects.physicalDamagePct > 20) {
    // 1.10 style captured as "10" via 1.(10); keep 10. If 1.05 captured as 05 -> 5.
    effects.physicalDamagePct = Number(String(effects.physicalDamagePct).replace(/^0+/, '') || '0');
  }
  scan('移動速度%', 'moveSpeedPct', [
    /#?移動速度(?:増加)?(?:バフ)?\s*([+-]?\d+(?:\.\d+)?)\s*(?:%|％)/g,
    /移動速度[^\d+-]{0,10}(?:x|×)?1\.(\d+)/g,
  ]);
  if (effects.moveSpeedPct != null && effects.moveSpeedPct > 20) {
    effects.moveSpeedPct = Number(String(effects.moveSpeedPct).replace(/^0+/, '') || '0');
  }

  for (const m of raw.matchAll(/#?([\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}A-Za-z0-9ー・]+)スキル効果増加バフ\s*[+＋]?\s*(\d+(?:\.\d+)?)/gu)) {
    const skillName = normalizeName(m[1]);
    const value = Number(m[2]);
    if (skillName && Number.isFinite(value)) {
      effects.skillEffectBonuses ||= {};
      effects.skillEffectBonuses[skillName] = value;
      hits.push(`スキル効果:${skillName}+${value}`);
    }
  }
  for (const m of raw.matchAll(/スキル\+\s*:?\s*(\d+(?:\.\d+)?)\s*\(([^)）]+)\)/g)) {
    const value = Number(m[1]);
    const skillName = normalizeName(m[2]);
    if (skillName && Number.isFinite(value)) {
      effects.skillEffectBonuses ||= {};
      effects.skillEffectBonuses[skillName] = value;
      hits.push(`スキル効果:${skillName}+${value}`);
    }
  }

  const flags = [
    ['WarAgeでは効果がない', /WarAgeでは効果[がは]?ない|WarAgeでは無効|WarAge注意/i],
    ['併用不可/優先度の確認が必要', /併用不可|優先度|上書き|同時に点灯しない|競合/],
    ['条件・確率・専用技などの説明を含む', /条件・専用技・確率|確率|専用技|追撃|追加攻撃|追加ダメージ|通常攻撃.*HIT|発動|変身|夜間|ペット|採集/],
    ['数値効果を自動抽出できませんでした', /数値効果を自動抽出できませんでした/],
  ];
  for (const [text, re] of flags) {
    if (re.test(raw)) unsupportedText.push(text);
  }

  return { effects, unsupportedText: unique(unsupportedText), hits: unique(hits) };
}

function guessStackGroup(effects, unsupportedText) {
  if (effects.physicalDamagePct != null) return 'equipment_physical_damage_pct';
  if (effects.attackPct != null) return 'equipment_attack_pct';
  if (effects.hitPct != null) return 'equipment_hit_pct';
  if (effects.criticalRate != null) return 'equipment_critical_rate';
  if (effects.attackDelay != null) return 'equipment_attack_delay';
  if (unsupportedText.some(t => /専用技|追撃|追加/.test(t))) return 'equipment_special_description';
  return 'equipment_buff';
}

function buildCandidate(row, sourceRel) {
  const targetName = findTargetName(row);
  if (!targetName) return null;
  const technicId = findTechnicId(row);
  const equipmentNames = findEquipmentNames(row);
  const { effects, unsupportedText, hits } = extractEffects(row);
  const hasEffects = Object.keys(effects).length > 0;
  const hasUnsupported = unsupportedText.length > 0;
  if (!hasEffects && !hasUnsupported) return null;

  const id = technicId ? `candidate.technic-${technicId}` : `candidate.${safeIdPart(targetName)}`;
  const notesParts = [];
  if (hits.length) notesParts.push(`auto hits: ${hits.join(', ')}`);
  notesParts.push(`review required; generated from ${sourceRel}:${row.__line}`);

  return {
    id,
    enabled: 'FALSE',
    category: 'equipment_buff',
    match_type: 'buff_name',
    target_name: targetName,
    equipment_names: equipmentNames.join('|'),
    technic_id: technicId,
    effects_json: jsonCell(effects),
    unsupported_json: jsonCell(hasUnsupported ? { text: unsupportedText } : {}),
    stack_group: guessStackGroup(effects, unsupportedText),
    stack_mode: hasEffects ? 'highest' : 'description_only',
    verification: 'candidate-auto-review',
    notes: notesParts.join(' / '),
    sources: sourceRel,
    __score: (hasEffects ? 2 : 0) + (hasUnsupported ? 1 : 0) + (equipmentNames.length ? 1 : 0) + (technicId ? 1 : 0),
  };
}

async function readExistingNativeIds() {
  const manualPath = path.join(repoRoot, 'data/manual/nativeEffectRules.manual.tsv');
  try {
    const text = await fs.readFile(manualPath, 'utf8');
    const parsed = parseTsvLoose(text);
    const ids = new Set();
    const names = new Set();
    for (const row of parsed.rows) {
      const id = firstExisting(row, ['id']);
      const name = firstExisting(row, ['target_name']);
      if (id) ids.add(id);
      if (name) names.add(normalizeName(name));
    }
    return { ids, names };
  } catch {
    return { ids: new Set(), names: new Set() };
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) return usage();

  const existing = await readExistingNativeIds();
  const all = [];
  const stats = [];

  for (const input of args.inputs) {
    const rel = path.relative(repoRoot, input).replace(/\\/g, '/');
    let text;
    try {
      text = await fs.readFile(input, 'utf8');
    } catch {
      stats.push({ source: rel, exists: false, rows: 0, candidates: 0 });
      continue;
    }
    const parsed = parseTsvLoose(text);
    let count = 0;
    for (const row of parsed.rows) {
      const candidate = buildCandidate(row, rel);
      if (!candidate) continue;
      if (candidate.__score < args.minScore) continue;
      if (existing.names.has(normalizeName(candidate.target_name))) continue;
      all.push(candidate);
      count++;
    }
    stats.push({ source: rel, exists: true, rows: parsed.rows.length, candidates: count });
  }

  const deduped = [];
  const seen = new Set();
  for (const c of all.sort((a, b) => b.__score - a.__score || a.target_name.localeCompare(b.target_name, 'ja'))) {
    const key = normalizeName(c.target_name);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(c);
  }

  const lines = [MANUAL_HEADER.join('\t')];
  for (const c of deduped) {
    lines.push(MANUAL_HEADER.map(h => tsvEscape(c[h])).join('\t'));
  }

  await fs.mkdir(path.dirname(args.output), { recursive: true });
  await fs.writeFile(args.output, lines.join('\n') + '\n', 'utf8');
  await fs.writeFile(args.summary, JSON.stringify({
    generatedAt: new Date().toISOString(),
    output: path.relative(repoRoot, args.output).replace(/\\/g, '/'),
    candidateCount: deduped.length,
    sourceStats: stats,
    note: 'Candidates are disabled by default. Review manually before copying to data/manual/nativeEffectRules.manual.tsv.',
  }, null, 2), 'utf8');

  console.log(`[native-effect-candidates] wrote ${path.relative(repoRoot, args.output)} (${deduped.length} candidates)`);
  console.log(`[native-effect-candidates] wrote ${path.relative(repoRoot, args.summary)}`);
}

main().catch(error => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
