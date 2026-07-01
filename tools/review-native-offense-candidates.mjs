#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_INPUT = 'dist/native-effect-rules/nativeEffectRules.strictReview.combat.tsv';
const DEFAULT_OUT_DIR = 'dist/native-effect-rules';

const OFFENSE_KEYS = new Set(['attackFlat', 'attackPct', 'hitFlat', 'hitPct']);
const NON_OFFENSE_KEYS = new Set([
  'attackDelay',
  'criticalRate',
  'physicalDamagePct',
  'physicalOutgoingDamagePct',
  'physicalDamageReductionPct',
  'physicalReflectPct',
  'physicalDamageUnknownPct',
  'skillEffectBonuses',
  'evasionFlat',
  'evasionPct',
  'moveSpeedPct',
  'defenseFlat',
  'defensePct',
  'magicFlat',
  'magicPct',
  'maxHpFlat',
  'maxMpFlat',
  'maxStFlat',
  'hpRegen',
  'mpRegen',
  'stRegen',
]);

const STATUS_MARKER_RE = /(攻撃力増加バフ|命中増加バフ|攻撃ディレイ減少バフ|物理与ダメージ増加バフ|魔法与ダメージ増加バフ|MP自然回復増加バフ|ST自然回復増加バフ)/;
const SPECIAL_TEXT_RE = /(条件|確率|専用技|併用不可|優先度|WarAge|数値効果を自動抽出できませんでした)/;

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function parseTsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === '\t' && !inQuotes) {
      fields.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  fields.push(current);
  return fields;
}

function parseTsv(text) {
  const lines = stripBom(text).split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseTsvLine(lines[0]);
  return lines.slice(1).map((line, index) => {
    const fields = parseTsvLine(line);
    const row = { __line: index + 2 };
    headers.forEach((header, i) => {
      row[header] = fields[i] ?? '';
    });
    return row;
  });
}

function tsvEscape(value) {
  const s = value == null ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function writeTsv(filePath, rows, headers) {
  const lines = [];
  lines.push(headers.map(tsvEscape).join('\t'));
  for (const row of rows) {
    lines.push(headers.map((header) => tsvEscape(row[header] ?? '')).join('\t'));
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `\ufeff${lines.join('\n')}\n`, 'utf8');
}

function parseEffectsJson(row) {
  const raw = row.effects_json || '';
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed;
  } catch (error) {
    return { __parseError: String(error.message || error) };
  }
}

function classifyRow(row) {
  const effects = parseEffectsJson(row);
  const effectKeys = Object.keys(effects).filter((key) => key !== '__parseError');
  const offenseKeys = effectKeys.filter((key) => OFFENSE_KEYS.has(key));
  const nonOffenseKeys = effectKeys.filter((key) => !OFFENSE_KEYS.has(key));
  const knownNonOffenseKeys = nonOffenseKeys.filter((key) => NON_OFFENSE_KEYS.has(key));
  const unknownExtraKeys = nonOffenseKeys.filter((key) => !NON_OFFENSE_KEYS.has(key));
  const textBlob = [row.target_name, row.equipment_names, row.unsupported_text, row.notes].join(' ');

  const hasOffense = offenseKeys.length > 0;
  const hasNonOffense = nonOffenseKeys.length > 0;
  const hasStatusMarker = STATUS_MARKER_RE.test(textBlob);
  const hasSpecialText = SPECIAL_TEXT_RE.test(textBlob);
  const hasParseError = Boolean(effects.__parseError);

  let offense_review_status = 'not_offense_candidate';
  const reasons = [];

  if (hasParseError) {
    offense_review_status = 'parse_error';
    reasons.push(`effects_json-parse-error:${effects.__parseError}`);
  } else if (!hasOffense) {
    offense_review_status = 'not_offense_candidate';
    reasons.push('no-attack-or-hit-effect');
  } else if (hasNonOffense) {
    offense_review_status = 'offense_mixed_needs_manual';
    reasons.push(`mixed-with:${nonOffenseKeys.join('|')}`);
  } else if (hasStatusMarker) {
    offense_review_status = 'offense_likely_equipment_status_marker_needs_manual';
    reasons.push('equipment-name-or-notes-contains-status-marker-buff-name');
  } else {
    offense_review_status = 'offense_simple_needs_source_check';
    reasons.push('only-attack-hit-effects');
  }

  if (hasSpecialText) reasons.push('condition-priority-or-special-text-exists');
  if (row.verification === 'candidate-auto-review') reasons.push('verification-is-candidate-auto-review');
  if (knownNonOffenseKeys.length > 0) reasons.push(`known-non-offense:${knownNonOffenseKeys.join('|')}`);
  if (unknownExtraKeys.length > 0) reasons.push(`unknown-extra-keys:${unknownExtraKeys.join('|')}`);

  return {
    ...row,
    offense_review_status,
    offense_review_reason: reasons.join('; '),
    parsed_effect_keys: effectKeys.join('|'),
    offense_keys: offenseKeys.join('|'),
    non_offense_keys: nonOffenseKeys.join('|'),
  };
}

function main() {
  const input = process.argv[2] || DEFAULT_INPUT;
  const outDir = process.argv[3] || DEFAULT_OUT_DIR;
  if (!fs.existsSync(input)) {
    console.error(`[native-effect-offense-review] input not found: ${input}`);
    console.error('Run: node tools/extract-native-effect-rule-candidates.mjs');
    console.error('Then: node tools/review-native-effect-rule-candidates.mjs');
    process.exit(1);
  }

  const rows = parseTsv(fs.readFileSync(input, 'utf8')).map(classifyRow);

  const all = rows.filter((row) => row.offense_review_status !== 'not_offense_candidate');
  const simple = all.filter((row) => row.offense_review_status === 'offense_simple_needs_source_check');
  const mixed = all.filter((row) => row.offense_review_status === 'offense_mixed_needs_manual');
  const statusMarker = all.filter((row) => row.offense_review_status === 'offense_likely_equipment_status_marker_needs_manual');
  const parseError = all.filter((row) => row.offense_review_status === 'parse_error');

  const headers = [
    'offense_review_status',
    'offense_review_reason',
    'id',
    'target_name',
    'equipment_names',
    'parsed_effect_keys',
    'offense_keys',
    'non_offense_keys',
    'effects_json',
    'unsupported_text',
    'review_status',
    'review_reason',
    'stack_group',
    'stack_mode',
    'verification',
    'notes',
    'sources',
  ];

  const files = {
    all: path.join(outDir, 'nativeEffectRules.offenseReview.all.tsv'),
    simple: path.join(outDir, 'nativeEffectRules.offenseReview.simpleNeedsSourceCheck.tsv'),
    mixed: path.join(outDir, 'nativeEffectRules.offenseReview.mixedNeedsManual.tsv'),
    statusMarker: path.join(outDir, 'nativeEffectRules.offenseReview.statusMarkerNeedsManual.tsv'),
    parseError: path.join(outDir, 'nativeEffectRules.offenseReview.parseError.tsv'),
    summary: path.join(outDir, 'nativeEffectRules.offenseReview.summary.json'),
  };

  writeTsv(files.all, all, headers);
  writeTsv(files.simple, simple, headers);
  writeTsv(files.mixed, mixed, headers);
  writeTsv(files.statusMarker, statusMarker, headers);
  writeTsv(files.parseError, parseError, headers);

  const byStatus = rows.reduce((acc, row) => {
    acc[row.offense_review_status] = (acc[row.offense_review_status] || 0) + 1;
    return acc;
  }, {});

  fs.writeFileSync(files.summary, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    input,
    outputs: files,
    counts: {
      sourceRows: rows.length,
      offenseCandidates: all.length,
      simpleNeedsSourceCheck: simple.length,
      mixedNeedsManual: mixed.length,
      statusMarkerNeedsManual: statusMarker.length,
      parseError: parseError.length,
      byStatus,
    },
    note: 'Review-only report. Do not promote candidate-auto-review rows automatically. Simple means effects_json contains only attack/hit keys, not that the rule is verified.',
  }, null, 2)}\n`, 'utf8');

  console.log('[native-effect-offense-review] wrote:');
  Object.entries(files).forEach(([name, file]) => console.log(`  ${name}: ${file}`));
}

main();
