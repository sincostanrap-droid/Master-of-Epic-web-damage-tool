#!/usr/bin/env node
/*
 * Strict review helper for native effect rule candidates.
 *
 * This script does NOT promote any rule and does NOT modify
 * data/manual/nativeEffectRules.manual.tsv.
 *
 * It reads dist/native-effect-rules/nativeEffectRules.candidates.tsv
 * and emits review-only TSV reports with UTF-8 BOM for Windows/Excel.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INPUT = path.join(ROOT, 'dist', 'native-effect-rules', 'nativeEffectRules.candidates.tsv');
const OUT_DIR = path.join(ROOT, 'dist', 'native-effect-rules');

const OUT_ALL = path.join(OUT_DIR, 'nativeEffectRules.strictReview.all.tsv');
const OUT_COMBAT = path.join(OUT_DIR, 'nativeEffectRules.strictReview.combat.tsv');
const OUT_ATTACK_DELAY = path.join(OUT_DIR, 'nativeEffectRules.strictReview.attackDelay.needsManual.tsv');
const OUT_LIKELY_MIXED = path.join(OUT_DIR, 'nativeEffectRules.strictReview.likelyMixedOrNonCombat.tsv');
const OUT_SUMMARY = path.join(OUT_DIR, 'nativeEffectRules.strictReview.summary.json');

const COMBAT_KEYS = new Set([
  'attackFlat',
  'attackPct',
  'hitFlat',
  'hitPct',
  'attackDelay',
  'criticalRate',
  'physicalDamagePct',
  'skillEffectBonuses',
]);

const NON_ATTACK_DELAY_WORDS = [
  '音楽ディレイ',
  '魔法ディレイ',
  '詠唱ディレイ',
  '詠唱時間',
  'アイテム使用ディレイ',
  '使用ディレイ',
  '薬調合ディレイ',
  '罠ディレイ',
  '生産ディレイ',
  '採掘ディレイ',
  '伐採ディレイ',
  '収穫ディレイ',
];

const EQUIPMENT_STATUS_MARKERS = [
  '攻撃ディレイ減少バフ',
  '物理与ダメージ増加バフ',
  '魔法与ダメージ増加バフ',
  'キック攻撃力増加バフ',
  'MP自然回復増加バフ',
  'ST自然回復増加バフ',
  'HP自然回復増加バフ',
];

function readText(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing input: ${file}\nRun: node tools/extract-native-effect-rule-candidates.mjs`);
  }
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}

function parseDelimited(text, delimiter = '\t') {
  // Candidate TSV cells contain raw JSON like {"attackPct":30}.
  // They are not CSV-quoted, so a quote-aware parser would strip JSON quotes
  // and make every effects_json parse fail. For these generated TSV files,
  // tabs/newlines are already sanitized by the candidate extractor, so a
  // plain TSV split is the correct parser.
  const lines = String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];
  const header = lines.shift().split(delimiter).map((h) => h.replace(/^\uFEFF/, '').trim());
  return lines.map((line) => {
    const cells = line.split(delimiter);
    const row = {};
    header.forEach((h, idx) => {
      row[h] = cells[idx] ?? '';
    });
    return row;
  });
}

function stringifyDelimited(rows, header, delimiter = '\t') {
  const escape = (value) => {
    const s = value == null ? '' : String(value);
    if (s.includes('"') || s.includes('\n') || s.includes('\r') || s.includes(delimiter)) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  };
  return [header.join(delimiter), ...rows.map((row) => header.map((h) => escape(row[h])).join(delimiter))].join('\r\n') + '\r\n';
}

function writeBom(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, '\uFEFF' + text, 'utf8');
}

function safeJsonParse(text, fallback) {
  if (!text || !text.trim()) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getUnsupportedText(row) {
  const unsupported = safeJsonParse(row.unsupported_json, {});
  const text = Array.isArray(unsupported.text) ? unsupported.text : [];
  return text.join(' / ');
}

function getEffectKeys(row) {
  const effects = safeJsonParse(row.effects_json, {});
  return Object.keys(effects).filter((key) => COMBAT_KEYS.has(key));
}

function findAttackDelayValues(text) {
  const values = [];
  const re = /攻撃ディレイ\s*[:：]\s*([+-]?\d+(?:\.\d+)?)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    values.push(Number(m[1]));
  }
  return unique(values.map((v) => String(v)));
}

function containsAny(text, words) {
  return words.some((w) => text.includes(w));
}

function classify(row) {
  const effectKeys = getEffectKeys(row);
  const combinedText = [
    row.target_name,
    row.equipment_names,
    row.effects_json,
    row.unsupported_json,
    row.notes,
  ].join('\n');
  const unsupportedText = getUnsupportedText(row);
  const attackDelayValuesInNotes = findAttackDelayValues(row.notes || '');
  const reasons = [];

  if (effectKeys.length === 0) {
    return {
      review_status: 'non_combat_or_description_only',
      review_reason: 'No supported combat effect key was detected.',
      effect_keys: '',
      unsupported_text: unsupportedText,
      attack_delay_values_in_notes: attackDelayValuesInNotes.join('|'),
    };
  }

  if (containsAny(combinedText, EQUIPMENT_STATUS_MARKERS)) {
    reasons.push('equipment_names_or_notes_contains_status-marker-buff-name');
  }

  if (containsAny(combinedText, NON_ATTACK_DELAY_WORDS)) {
    reasons.push('contains-non-attack-delay-word');
  }

  if (unsupportedText.includes('併用不可') || unsupportedText.includes('優先度')) {
    reasons.push('stacking-or-priority-needs-review');
  }

  if (unsupportedText.includes('条件') || unsupportedText.includes('確率') || unsupportedText.includes('専用技')) {
    reasons.push('condition-proc-or-special-skill-text-exists');
  }

  if (row.verification !== 'verified') {
    reasons.push(`verification-is-${row.verification || 'empty'}`);
  }

  if (effectKeys.includes('attackDelay')) {
    if (attackDelayValuesInNotes.length > 1) {
      reasons.push(`multiple-attack-delay-values-in-notes:${attackDelayValuesInNotes.join('|')}`);
    }
    if (effectKeys.length > 1) {
      reasons.push(`attackDelay-mixed-with:${effectKeys.filter((k) => k !== 'attackDelay').join('|')}`);
    }
  }

  if (/クリティカル率UP [AB] Lv[123]/.test(row.target_name) && effectKeys.includes('criticalRate')) {
    reasons.push('critical-rate-family-manual-promotion-only');
    return {
      review_status: 'manual_promotion_candidate_critical_only',
      review_reason: unique(reasons).join('; '),
      effect_keys: effectKeys.join('|'),
      unsupported_text: unsupportedText,
      attack_delay_values_in_notes: attackDelayValuesInNotes.join('|'),
    };
  }

  if (reasons.some((r) => r.includes('status-marker') || r.includes('non-attack-delay') || r.includes('multiple-attack-delay') || r.includes('mixed-with'))) {
    return {
      review_status: 'likely_mixed_or_non_attack_delay',
      review_reason: unique(reasons).join('; '),
      effect_keys: effectKeys.join('|'),
      unsupported_text: unsupportedText,
      attack_delay_values_in_notes: attackDelayValuesInNotes.join('|'),
    };
  }

  return {
    review_status: 'needs_source_check_before_promotion',
    review_reason: unique(reasons).join('; ') || 'Combat-looking candidate; verify source manually before promotion.',
    effect_keys: effectKeys.join('|'),
    unsupported_text: unsupportedText,
    attack_delay_values_in_notes: attackDelayValuesInNotes.join('|'),
  };
}

function main() {
  const rows = parseDelimited(readText(INPUT));
  const reviewed = rows.map((row) => ({
    ...row,
    ...classify(row),
  }));

  const header = [
    'review_status',
    'review_reason',
    'id',
    'enabled',
    'category',
    'target_name',
    'equipment_names',
    'effect_keys',
    'effects_json',
    'unsupported_text',
    'attack_delay_values_in_notes',
    'stack_group',
    'stack_mode',
    'verification',
    'notes',
    'sources',
  ];

  const combat = reviewed.filter((r) => r.effect_keys);
  const attackDelayNeedsManual = combat.filter((r) => r.effect_keys.split('|').includes('attackDelay'));
  const likelyMixed = reviewed.filter((r) => r.review_status === 'likely_mixed_or_non_attack_delay');

  writeBom(OUT_ALL, stringifyDelimited(reviewed, header));
  writeBom(OUT_COMBAT, stringifyDelimited(combat, header));
  writeBom(OUT_ATTACK_DELAY, stringifyDelimited(attackDelayNeedsManual, header));
  writeBom(OUT_LIKELY_MIXED, stringifyDelimited(likelyMixed, header));

  const byStatus = reviewed.reduce((acc, r) => {
    acc[r.review_status] = (acc[r.review_status] || 0) + 1;
    return acc;
  }, {});

  const summary = {
    generatedAt: new Date().toISOString(),
    input: path.relative(ROOT, INPUT).replaceAll('\\', '/'),
    outputs: {
      all: path.relative(ROOT, OUT_ALL).replaceAll('\\', '/'),
      combat: path.relative(ROOT, OUT_COMBAT).replaceAll('\\', '/'),
      attackDelayNeedsManual: path.relative(ROOT, OUT_ATTACK_DELAY).replaceAll('\\', '/'),
      likelyMixedOrNonCombat: path.relative(ROOT, OUT_LIKELY_MIXED).replaceAll('\\', '/'),
    },
    counts: {
      total: reviewed.length,
      combat: combat.length,
      attackDelayNeedsManual: attackDelayNeedsManual.length,
      likelyMixedOrNonCombat: likelyMixed.length,
      byStatus,
    },
    note: 'Review-only report. Do not promote candidate-auto-review rows automatically.',
  };

  writeBom(OUT_SUMMARY, JSON.stringify(summary, null, 2) + '\n');

  console.log('[native-effect-rules] strict review reports written:');
  console.log(`  ${path.relative(ROOT, OUT_ALL)}`);
  console.log(`  ${path.relative(ROOT, OUT_COMBAT)}`);
  console.log(`  ${path.relative(ROOT, OUT_ATTACK_DELAY)}`);
  console.log(`  ${path.relative(ROOT, OUT_LIKELY_MIXED)}`);
  console.log(`  ${path.relative(ROOT, OUT_SUMMARY)}`);
}

main();
