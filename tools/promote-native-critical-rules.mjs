#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const manualPath = path.join(repoRoot, 'data/manual/nativeEffectRules.manual.tsv');

const HEADER = [
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

const unsupported = JSON.stringify({
  text: [
    '候補抽出では攻撃力・命中・攻撃ディレイ等も同時に拾われていたが、装備本体ステータスや別条件の混入を避けるため、v1ではクリティカル率のみ採用する。',
    '計算接続前にゲーム内表示または信頼できる検証情報で最終確認する。',
  ],
});

const RULES = [
  {
    id: 'rule.critical_rate_up_a_lv1',
    enabled: 'TRUE',
    category: 'equipment_buff',
    match_type: 'buff_name',
    target_name: 'クリティカル率UP A Lv1',
    equipment_names: 'ウェディング リング|ギガント フィスト レフト|バーサーク リング|隠密装備(生産版)|黒猫のお面 +1~4|ギガント フィスト',
    technic_id: '1336',
    effects_json: JSON.stringify({ criticalRate: 1 }),
    unsupported_json: unsupported,
    stack_group: 'equipment_critical_rate',
    stack_mode: 'highest',
    verification: 'provisional-manual',
    notes: '候補抽出結果から、クリティカル率のみを手動昇格。攻撃力/命中等の混入値は採用しない。',
    sources: 'data/manual/buffRules.manual.refined.tsv:248; dist/native-effect-rules/nativeEffectRules.review-combat.tsv',
  },
  {
    id: 'rule.critical_rate_up_a_lv2',
    enabled: 'TRUE',
    category: 'equipment_buff',
    match_type: 'buff_name',
    target_name: 'クリティカル率UP A Lv2',
    equipment_names: '黒猫のお面 +5~7|背負い大鉞|竜鱗の肩当',
    technic_id: '1337',
    effects_json: JSON.stringify({ criticalRate: 2 }),
    unsupported_json: unsupported,
    stack_group: 'equipment_critical_rate',
    stack_mode: 'highest',
    verification: 'provisional-manual',
    notes: '候補抽出結果から、クリティカル率のみを手動昇格。攻撃力/攻撃ディレイ等の混入値は採用しない。',
    sources: 'data/manual/buffRules.manual.refined.tsv:249; dist/native-effect-rules/nativeEffectRules.review-combat.tsv',
  },
  {
    id: 'rule.critical_rate_up_a_lv3',
    enabled: 'TRUE',
    category: 'equipment_buff',
    match_type: 'buff_name',
    target_name: 'クリティカル率UP A Lv3',
    equipment_names: '黒猫のお面 +8~9',
    technic_id: '1338',
    effects_json: JSON.stringify({ criticalRate: 3 }),
    unsupported_json: unsupported,
    stack_group: 'equipment_critical_rate',
    stack_mode: 'highest',
    verification: 'provisional-manual',
    notes: '候補抽出結果から、クリティカル率のみを手動昇格。',
    sources: 'data/manual/buffRules.manual.refined.tsv:250; dist/native-effect-rules/nativeEffectRules.review-combat.tsv',
  },
  {
    id: 'rule.critical_rate_up_b_lv1',
    enabled: 'TRUE',
    category: 'equipment_buff',
    match_type: 'buff_name',
    target_name: 'クリティカル率UP B Lv1',
    equipment_names: 'ギガント フィスト ライト|バーサーク イヤリング|狩人の帽子|龍の籠手 +1~4|鴉天狗のお面|ギガント フィスト',
    technic_id: '1397',
    effects_json: JSON.stringify({ criticalRate: 1 }),
    unsupported_json: unsupported,
    stack_group: 'equipment_critical_rate',
    stack_mode: 'highest',
    verification: 'provisional-manual',
    notes: '候補抽出結果から、クリティカル率のみを手動昇格。攻撃力/命中/回避/攻撃ディレイ等の混入値は採用しない。',
    sources: 'data/manual/buffRules.manual.refined.tsv:251; dist/native-effect-rules/nativeEffectRules.review-combat.tsv',
  },
  {
    id: 'rule.critical_rate_up_b_lv2',
    enabled: 'TRUE',
    category: 'equipment_buff',
    match_type: 'buff_name',
    target_name: 'クリティカル率UP B Lv2',
    equipment_names: 'サモン カード < マブの使徒 >|竜鱗の腰当|龍の籠手 +5~7',
    technic_id: '1398',
    effects_json: JSON.stringify({ criticalRate: 2 }),
    unsupported_json: unsupported,
    stack_group: 'equipment_critical_rate',
    stack_mode: 'highest',
    verification: 'provisional-manual',
    notes: '候補抽出結果から、クリティカル率のみを手動昇格。攻撃力/攻撃ディレイ等の混入値は採用しない。',
    sources: 'data/manual/buffRules.manual.refined.tsv:252; dist/native-effect-rules/nativeEffectRules.review-combat.tsv',
  },
  {
    id: 'rule.critical_rate_up_b_lv3',
    enabled: 'TRUE',
    category: 'equipment_buff',
    match_type: 'buff_name',
    target_name: 'クリティカル率UP B Lv3',
    equipment_names: '龍の籠手 +8~9',
    technic_id: '1399',
    effects_json: JSON.stringify({ criticalRate: 3 }),
    unsupported_json: unsupported,
    stack_group: 'equipment_critical_rate',
    stack_mode: 'highest',
    verification: 'provisional-manual',
    notes: '候補抽出結果から、クリティカル率のみを手動昇格。',
    sources: 'data/manual/buffRules.manual.refined.tsv:253; dist/native-effect-rules/nativeEffectRules.review-combat.tsv',
  },
];

function stripBom(text) {
  return text.replace(/^\uFEFF/, '');
}

function parseTsv(text) {
  const lines = stripBom(text).split(/\r?\n/).filter(line => line.length > 0);
  if (!lines.length) return { header: HEADER, rows: [] };
  const header = lines[0].split('\t');
  const rows = lines.slice(1).map(line => {
    const cells = line.split('\t');
    const row = {};
    header.forEach((key, index) => {
      row[key] = cells[index] ?? '';
    });
    return row;
  });
  return { header, rows };
}

function toLine(header, row) {
  return header.map(key => String(row[key] ?? '').replace(/\r?\n/g, ' ')).join('\t');
}

async function main() {
  let text;
  try {
    text = await fs.readFile(manualPath, 'utf8');
  } catch (error) {
    throw new Error(`Failed to read ${manualPath}: ${error.message}`);
  }

  const parsed = parseTsv(text);
  const header = [...parsed.header];
  for (const col of HEADER) {
    if (!header.includes(col)) header.push(col);
  }

  const byId = new Map(parsed.rows.map((row, index) => [row.id, { row, index }]));
  let added = 0;
  let updated = 0;

  const rows = [...parsed.rows];
  for (const rule of RULES) {
    if (byId.has(rule.id)) {
      const { index } = byId.get(rule.id);
      rows[index] = { ...rows[index], ...rule };
      updated += 1;
    } else {
      rows.push(rule);
      added += 1;
    }
  }

  const output = [header.join('\t'), ...rows.map(row => toLine(header, row)), ''].join('\n');
  await fs.writeFile(manualPath, output, 'utf8');
  console.log(`[native-critical-rules] updated ${path.relative(repoRoot, manualPath)}: added=${added}, updated=${updated}`);
  console.log('[native-critical-rules] next: node tools/build-native-effect-rules.mjs');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
