#!/usr/bin/env node
/**
 * Master of Epic 物理ダメージ計算webツール
 * Scrapbox/Wiki補完済みBuff TSVから、変換系・ジャンプ倍率・競合候補などを補助抽出する。
 *
 * 使い方:
 *   node tools/refine-buff-rules-tsv.mjs
 *   node tools/refine-buff-rules-tsv.mjs --input=data/manual/buffRules.manual.scrapbox.tsv --output=data/manual/buffRules.manual.refined.tsv
 *
 * 注意:
 *   - 既存入力値は上書きしない。空欄のみ補完する。
 *   - enabled/verified は自動ではONにしない。採用は人間が確認して行う。
 */

import fs from "node:fs";
import path from "node:path";

const VERSION = "v1.23.19";
const ROOT = process.cwd();
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
}));

const INPUT = path.resolve(ROOT, args.input || "data/manual/buffRules.manual.scrapbox.tsv");
const OUTPUT = path.resolve(ROOT, args.output || (args["in-place"] ? INPUT : "data/manual/buffRules.manual.refined.tsv"));

const EXTRA_COLUMNS = [
  "magicToAttackPct",
  "magicToSpeedPct",
  "speedToAttackPct",
  "jumpMultiplier",
  "forcedSpeed",
  "targetDamageEffects",
  "refineStatus",
  "refineNotes"
];

const EXTRA_LABELS = {
  magicToAttackPct: "魔力→攻撃力%",
  magicToSpeedPct: "魔力→移動速度%",
  speedToAttackPct: "移動速度→攻撃力%",
  jumpMultiplier: "ジャンプ力倍率",
  forcedSpeed: "強制移動速度",
  targetDamageEffects: "種族/対象特攻メモ",
  refineStatus: "精度補正状態",
  refineNotes: "精度補正メモ"
};

function splitTsvLine(line) {
  return line.split("\t");
}

function tsvCell(value) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function parseTsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.length);
  if (!lines.length) return { labels: [], header: [], rows: [] };
  let labels = [];
  let header = splitTsvLine(lines[0]);
  let dataStart = 1;
  if (!header.includes("enabled") && lines[1]) {
    const maybeKeys = splitTsvLine(lines[1]);
    if (maybeKeys.includes("enabled") && maybeKeys.includes("officialTechnicId")) {
      labels = header;
      header = maybeKeys;
      dataStart = 2;
    }
  }
  if (!labels.length) labels = header.map(h => h);
  const rows = lines.slice(dataStart).map(line => {
    const cells = splitTsvLine(line);
    const row = {};
    header.forEach((h, i) => row[h] = cells[i] ?? "");
    return row;
  });
  return { labels, header, rows };
}

function stringifyTsv(labels, header, rows) {
  const out = [];
  out.push(header.map((h, i) => tsvCell(labels[i] || h)).join("\t"));
  out.push(header.map(tsvCell).join("\t"));
  for (const row of rows) out.push(header.map(h => tsvCell(row[h])).join("\t"));
  return out.join("\n") + "\n";
}

function ensureColumns(parsed) {
  // 数値変換列は speedPct の直後に入れるとスプレッドシート上で見やすい。
  const after = parsed.header.indexOf("speedPct");
  const insertPos = after >= 0 ? after + 1 : parsed.header.length;
  for (const col of EXTRA_COLUMNS) {
    if (parsed.header.includes(col)) continue;
    parsed.header.splice(insertPos + EXTRA_COLUMNS.indexOf(col), 0, col);
    parsed.labels.splice(insertPos + EXTRA_COLUMNS.indexOf(col), 0, EXTRA_LABELS[col] || col);
    for (const row of parsed.rows) row[col] = "";
  }
  // 既存列があっても日本語ラベルを補正。
  for (const col of EXTRA_COLUMNS) {
    const idx = parsed.header.indexOf(col);
    if (idx >= 0) parsed.labels[idx] = EXTRA_LABELS[col] || parsed.labels[idx] || col;
  }
  return parsed;
}

function normalizePercentText(s) {
  return String(s || "")
    .replace(/％/g, "%")
    .replace(/＋/g, "+")
    .replace(/－/g, "-")
    .replace(/[　\s]+/g, " ")
    .trim();
}

function pickText(row) {
  // rawInfoはWiki由来でノイズが少ない。Scrapboxは補強として使う。
  return normalizePercentText([
    row.rawInfo,
    row.scrapboxEffectHint,
    row.scrapboxRawLines
  ].filter(Boolean).join(" / "));
}

function firstNumberFrom(regex, text) {
  const m = text.match(regex);
  if (!m) return null;
  const n = Number(String(m[1]).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function addNote(row, notes, text) {
  if (!text) return;
  notes.add(text);
}

function setIfEmpty(row, key, value, notes, noteText) {
  if (value === null || value === undefined || value === "") return false;
  if (String(row[key] || "").trim() !== "") return false;
  row[key] = String(value);
  if (noteText) addNote(row, notes, noteText);
  return true;
}

function appendMemo(row, text) {
  const current = String(row.memo || "").trim();
  if (!text || current.includes(text)) return;
  row.memo = current ? `${current}; ${text}` : text;
}

function appendCustomEffect(row, text) {
  const current = String(row.customEffects || "").trim();
  if (!text || current.includes(text)) return;
  row.customEffects = current ? `${current}; ${text}` : text;
}

function refineRow(row) {
  const text = pickText(row);
  const notes = new Set();
  let changed = false;

  const magicToAttack = firstNumberFrom(/魔力(?:の)?\s*([+-]?\d+(?:\.\d+)?)\s*%\s*(?:を|が)?\s*(?:自分の)?\s*攻撃力\s*(?:に)?\s*(?:加算|上乗せ|変換)/, text)
    ?? firstNumberFrom(/#魔力→攻撃力変換バフ\s*([+-]?\d+(?:\.\d+)?)\s*%/, text);
  changed = setIfEmpty(row, "magicToAttackPct", magicToAttack, notes, `魔力→攻撃力 ${magicToAttack}% を抽出`) || changed;

  const magicToSpeed = firstNumberFrom(/魔力(?:の)?\s*([+-]?\d+(?:\.\d+)?)\s*%\s*(?:を|が)?\s*(?:移動)?速度\s*(?:に)?\s*(?:加算|上乗せ|変換)/, text)
    ?? firstNumberFrom(/#魔力→移動速度変換バフ\s*([+-]?\d+(?:\.\d+)?)\s*%/, text);
  changed = setIfEmpty(row, "magicToSpeedPct", magicToSpeed, notes, `魔力→移動速度 ${magicToSpeed}% を抽出`) || changed;

  const speedToAttack = firstNumberFrom(/(?:移動)?速度(?:の)?\s*([+-]?\d+(?:\.\d+)?)\s*%\s*(?:を|が)?\s*(?:自分の)?\s*攻撃力\s*(?:に)?\s*(?:加算|上乗せ|変換)/, text)
    ?? firstNumberFrom(/#(?:移動)?速度→攻撃力変換バフ\s*([+-]?\d+(?:\.\d+)?)\s*%/, text);
  changed = setIfEmpty(row, "speedToAttackPct", speedToAttack, notes, `移動速度→攻撃力 ${speedToAttack}% を抽出`) || changed;

  const jumpMul = firstNumberFrom(/#ジャンプ力増加バフ\s*([+-]?\d+(?:\.\d+)?)\s*倍/, text)
    ?? firstNumberFrom(/ジャンプ力[^\d]{0,12}([+-]?\d+(?:\.\d+)?)\s*倍/, text);
  changed = setIfEmpty(row, "jumpMultiplier", jumpMul, notes, `ジャンプ力倍率 ${jumpMul} を抽出`) || changed;

  const speedMul = firstNumberFrom(/#移動速度増加バフ\s*([+-]?\d+(?:\.\d+)?)\s*倍/, text)
    ?? firstNumberFrom(/移動速度[^\d]{0,16}([+-]?\d+(?:\.\d+)?)\s*倍/, text);
  if (speedMul !== null && speedMul > 0 && speedMul < 10) {
    const speedPct = Number(((speedMul - 1) * 100).toFixed(4));
    changed = setIfEmpty(row, "speedPct", speedPct, notes, `移動速度倍率 ${speedMul}倍 → 移動速度% ${speedPct} を抽出`) || changed;
  }

  const forceSpeed = firstNumberFrom(/強制移動速度\s*\+?([+-]?\d+(?:\.\d+)?)/, text);
  changed = setIfEmpty(row, "forcedSpeed", forceSpeed, notes, `強制移動速度 ${forceSpeed} を抽出`) || changed;

  const targetDamagePieces = [];
  const bird = firstNumberFrom(/#鳥タイプへダメージ増加バフ\s*([+-]?\d+(?:\.\d+)?)\s*倍/, text);
  if (bird !== null) targetDamagePieces.push(`鳥タイプ:${bird}倍`);
  const species = text.match(/([一-龥ぁ-んァ-ヶA-Za-z0-9]+(?:系|タイプ))に対して(?:特攻|ダメージ増加|与えるダメージが増加)/);
  if (species) targetDamagePieces.push(`${species[1]}特攻`);
  if (targetDamagePieces.length && !row.targetDamageEffects) {
    row.targetDamageEffects = Array.from(new Set(targetDamagePieces)).join("; ");
    changed = true;
    addNote(row, notes, `対象特攻候補: ${row.targetDamageEffects}`);
  }

  // 変換系は通常の攻撃力増加とは別枠として扱えるよう、競合グループ候補を付ける。
  const hasAttackConversion = row.magicToAttackPct || row.speedToAttackPct;
  const hasSpeedConversion = row.magicToSpeedPct;
  if (hasAttackConversion && (!row.conflictGroup || /^technic-\d+$/.test(row.conflictGroup))) {
    row.conflictGroup = "attack-conversion";
    changed = true;
    addNote(row, notes, "攻撃力変換系として conflictGroup=attack-conversion 候補");
  }
  if (hasSpeedConversion && (!row.conflictGroup || /^technic-\d+$/.test(row.conflictGroup))) {
    row.conflictGroup = "magic-to-speed-conversion";
    changed = true;
    addNote(row, notes, "魔力→移動速度変換系として conflictGroup=magic-to-speed-conversion 候補");
  }

  if (/併用不可/.test(text)) {
    if (!row.stackRule || row.stackRule === "same-technic") {
      row.stackRule = "exclusive";
      changed = true;
    }
    addNote(row, notes, "併用不可表現あり");
  } else if (/攻撃力変換の併用関係/.test(text) && hasAttackConversion) {
    if (!row.stackRule || row.stackRule === "same-technic") {
      row.stackRule = "manual-check";
      changed = true;
    }
    addNote(row, notes, "攻撃力変換の併用関係は要確認");
  }

  if (/採集に乗らなくなった/.test(text)) {
    addNote(row, notes, "攻撃力変換系は採集に乗らなくなった可能性メモあり");
  } else if (/採集にも効果がある/.test(text)) {
    addNote(row, notes, "採集にも効果ありとの記述あり。現仕様確認推奨");
  }

  if (/重量オーバー|水中補正/.test(text) && hasSpeedConversion) {
    addNote(row, notes, "魔力→移動速度は重量/水中補正後に加算との記述あり");
  }

  if (notes.size) {
    const existing = String(row.refineNotes || "").trim();
    const merged = Array.from(new Set([...existing.split(/\s*;\s*/).filter(Boolean), ...notes])).join("; ");
    row.refineNotes = merged;
  }
  if (changed) {
    const current = String(row.refineStatus || "").trim();
    row.refineStatus = current ? `${current};conversion-refined` : "conversion-refined";
  }

  // 計算未対応であることは customEffects/memo にも残して、manual JSへ変換しても消えないようにする。
  if (row.magicToAttackPct) appendCustomEffect(row, `魔力→攻撃力変換 ${row.magicToAttackPct}%`);
  if (row.magicToSpeedPct) appendCustomEffect(row, `魔力→移動速度変換 ${row.magicToSpeedPct}%`);
  if (row.speedToAttackPct) appendCustomEffect(row, `移動速度→攻撃力変換 ${row.speedToAttackPct}%`);
  if (row.jumpMultiplier) appendCustomEffect(row, `ジャンプ力倍率 ${row.jumpMultiplier}`);
  if (row.speedPct && /移動速度倍率/.test(row.refineNotes || "")) appendCustomEffect(row, `移動速度倍率由来 +${row.speedPct}%`);
  if (row.forcedSpeed) appendCustomEffect(row, `強制移動速度 +${row.forcedSpeed}`);

  return changed || notes.size > 0;
}

if (!fs.existsSync(INPUT)) {
  throw new Error(`${INPUT} が見つかりません。先に Scrapbox補完TSVを作成してください。`);
}

const parsed = ensureColumns(parseTsv(fs.readFileSync(INPUT, "utf8")));
const counters = {
  rows: parsed.rows.length,
  refinedRows: 0,
  magicToAttackPct: 0,
  magicToSpeedPct: 0,
  speedToAttackPct: 0,
  jumpMultiplier: 0,
  forcedSpeed: 0,
  targetDamageEffects: 0
};

for (const row of parsed.rows) {
  const changed = refineRow(row);
  if (changed) counters.refinedRows += 1;
}
for (const key of Object.keys(counters)) {
  if (key === "rows" || key === "refinedRows") continue;
  counters[key] = parsed.rows.filter(r => String(r[key] || "").trim()).length;
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, stringifyTsv(parsed.labels, parsed.header, parsed.rows), "utf8");

console.log(`[buff-rules-refine] ${VERSION}`);
console.log(`[read] ${INPUT} (${counters.rows} rows)`);
console.log(`[write] ${OUTPUT}`);
console.log(`[summary] refinedRows=${counters.refinedRows} magicToAttack=${counters.magicToAttackPct} magicToSpeed=${counters.magicToSpeedPct} speedToAttack=${counters.speedToAttackPct} jumpMultiplier=${counters.jumpMultiplier} forcedSpeed=${counters.forcedSpeed} targetDamage=${counters.targetDamageEffects}`);
console.log("[next] refined TSVを確認し、採用する行だけ enabled=TRUE / verified=TRUE にしてください。");
