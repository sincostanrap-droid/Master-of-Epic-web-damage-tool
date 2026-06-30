#!/usr/bin/env node
/**
 * Master of Epic 物理ダメージ計算webツール
 * data/manual/buffRules.manual.input.tsv を Scrapbox(Medi記録) の検索結果で補完する。
 *
 * 使い方:
 *   node tools/enrich-buff-rules-template-from-scrapbox.mjs
 *   node tools/enrich-buff-rules-template-from-scrapbox.mjs --limit=0
 *   node tools/enrich-buff-rules-template-from-scrapbox.mjs --input=data/manual/buffRules.manual.input.tsv --output=data/manual/buffRules.manual.scrapbox.tsv
 *   node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --limit=0
 *   node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --apply-hints
 *
 * 出力:
 *   data/manual/buffRules.manual.scrapbox.tsv
 *
 * 注意:
 *   - Scrapboxの公開ページ/APIへアクセスするため、インターネット接続が必要です。
 *   - 初回は検索/ページ取得キャッシュを data/cache/scrapbox/ に作ります。
 *   - --auto-fetch を付けると、先にScrapboxプロジェクトの公開ページ一覧を取得してローカル照合します。
 *   - stackRule/conflictGroup等の既存手入力値は上書きしません。
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const VERSION = "v1.23.19";
const ROOT = process.cwd();
const PROJECT = "medianmoe";
const SCRAPBOX_BASE = `https://scrapbox.io`;

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
}));

const DEFAULT_INPUT_REL = "data/manual/buffRules.manual.input.tsv";
const USING_DEFAULT_INPUT = !args.input;
const INPUT = path.resolve(ROOT, args.input || DEFAULT_INPUT_REL);
const OUTPUT = path.resolve(ROOT, args.output || (args["in-place"] ? args.input || "data/manual/buffRules.manual.input.tsv" : "data/manual/buffRules.manual.scrapbox.tsv"));
const CACHE_DIR = path.resolve(ROOT, args.cache || "data/cache/scrapbox");
const APPLY_HINTS = Boolean(args["apply-hints"]);
const AUTO_FETCH = Boolean(args["auto-fetch"] || args.auto || args["project-index"]);
const LOCAL_ONLY = Boolean(args["local-only"]);
const REFRESH_CACHE = Boolean(args.refresh || args["refresh-cache"]);
const STRICT_MATCH = !Boolean(args["broad-match"]);
const PROJECT_PAGE_LIMIT = args["project-page-limit"] === undefined ? 0 : Number(args["project-page-limit"]);
const LIMIT = args.limit === undefined ? 200 : Number(args.limit);
const DELAY_MS = args.delay === undefined ? 250 : Number(args.delay);
let PROJECT_INDEX = [];

const EXTRA_COLUMNS = [
  "scrapboxMatchStatus",
  "scrapboxMatchedQueries",
  "scrapboxPages",
  "scrapboxMatchQuality",
  "scrapboxRejectedPages",
  "scrapboxStackRuleHint",
  "scrapboxConflictGroupHint",
  "scrapboxEffectHint",
  "scrapboxNotes",
  "scrapboxRawLines"
];

const EXTRA_LABELS = {
  scrapboxMatchStatus: "Scrapbox照合状態",
  scrapboxMatchedQueries: "Scrapbox照合クエリ",
  scrapboxPages: "Scrapbox候補ページ",
  scrapboxMatchQuality: "Scrapbox照合品質",
  scrapboxRejectedPages: "Scrapbox除外ページ",
  scrapboxStackRuleHint: "Scrapbox重複/併用ヒント",
  scrapboxConflictGroupHint: "Scrapbox競合グループ候補",
  scrapboxEffectHint: "Scrapbox効果ヒント",
  scrapboxNotes: "Scrapbox注意メモ",
  scrapboxRawLines: "Scrapbox根拠行"
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDir(fileOrDir, isDir = false) {
  fs.mkdirSync(isDir ? fileOrDir : path.dirname(fileOrDir), { recursive: true });
}

function hashKey(s) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

function cachePath(kind, key) {
  return path.join(CACHE_DIR, kind, `${hashKey(key)}.json`);
}

function readCache(kind, key) {
  const p = cachePath(kind, key);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

function writeCache(kind, key, data) {
  const p = cachePath(kind, key);
  ensureDir(p);
  fs.writeFileSync(p, JSON.stringify({ cachedAt: new Date().toISOString(), data }, null, 2), "utf8");
}


function clearCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) return;
  fs.rmSync(CACHE_DIR, { recursive: true, force: true });
}

async function loadProjectIndex() {
  const cacheKey = `${PROJECT}:pages:${PROJECT_PAGE_LIMIT || "all"}`;
  const cached = readCache("project-index", cacheKey);
  if (cached && Array.isArray(cached.data)) return cached.data;

  const pages = [];
  const pageLimit = PROJECT_PAGE_LIMIT > 0 ? PROJECT_PAGE_LIMIT : Infinity;
  const limit = 1000;
  for (let skip = 0; pages.length < pageLimit; skip += limit) {
    const url = `${SCRAPBOX_BASE}/api/pages/${PROJECT}?limit=${limit}&skip=${skip}&sort=updated`;
    const json = await fetchJsonCached("project-list", url, url);
    const chunk = Array.isArray(json?.pages) ? json.pages : [];
    if (!chunk.length) break;
    for (const item of chunk) {
      if (pages.length >= pageLimit) break;
      if (!item?.title) continue;
      pages.push({
        title: item.title,
        id: item.id || item._id || "",
        descriptions: Array.isArray(item.descriptions) ? item.descriptions.join(" ") : String(item.descriptions || ""),
        linksLc: Array.isArray(item.linksLc) ? item.linksLc.join(" ") : "",
        image: item.image || "",
        updated: item.updated || ""
      });
    }
    if (chunk.length < limit) break;
  }

  writeCache("project-index", cacheKey, pages);
  return pages;
}

function searchProjectIndex(query) {
  if (!PROJECT_INDEX.length) return [];
  const raw = String(query || "").trim();
  const nq = normalizeName(raw);
  if (!nq) return [];
  const rawWords = raw.split(/[\s\u3000・,，、/／|｜;；()（）\[\]【】「」『』]+/).map(normalizeName).filter(w => w.length >= 2);
  const scored = PROJECT_INDEX.map(page => {
    const title = page.title || "";
    const nt = normalizeName(title);
    const body = normalizeName(`${page.descriptions || ""} ${page.linksLc || ""}`);
    let score = 0;
    if (nt === nq) score += 120;
    if (nt.includes(nq)) score += 90;
    if (nq.includes(nt) && nt.length >= 3) score += 70;
    if (body.includes(nq)) score += 30;
    for (const word of rawWords) {
      if (nt.includes(word)) score += 18;
      if (body.includes(word)) score += 6;
    }
    if (/バフ|増加|短縮|軽減|回復|ディレイ|与ダメ|被ダメ|自然回復|併用|重複|競合|装備|検証/.test(title)) score += 12;
    if (title.length <= raw.length + 12) score += 4;
    return { title, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ja"));
  return unique(scored.slice(0, 24).map(x => x.title));
}

async function fetchJsonCached(kind, key, url) {
  const cached = readCache(kind, key);
  if (cached && cached.data !== undefined) return cached.data;
  await sleep(DELAY_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "accept": "application/json,text/plain,*/*",
        "user-agent": `MoE-physical-damage-tool/${VERSION} (+local developer script)`
      }
    });
    if (!res.ok) {
      writeCache(kind, key, null);
      return null;
    }
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { json = null; }
    writeCache(kind, key, json);
    return json;
  } catch (err) {
    console.warn(`[warn] fetch failed: ${url} (${err?.message || err})`);
    return null;
  }
}

async function fetchTextCached(kind, key, url) {
  const cached = readCache(kind, key);
  if (cached && cached.data !== undefined) return cached.data;
  await sleep(DELAY_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "accept": "text/html,text/plain,*/*",
        "user-agent": `MoE-physical-damage-tool/${VERSION} (+local developer script)`
      }
    });
    if (!res.ok) {
      writeCache(kind, key, null);
      return null;
    }
    const text = await res.text();
    writeCache(kind, key, text);
    return text;
  } catch (err) {
    console.warn(`[warn] fetch failed: ${url} (${err?.message || err})`);
    return null;
  }
}

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
  for (const row of rows) {
    out.push(header.map(h => tsvCell(row[h])).join("\t"));
  }
  return out.join("\n") + "\n";
}

function appendExtraColumns(parsed) {
  for (const col of EXTRA_COLUMNS) {
    if (!parsed.header.includes(col)) {
      parsed.header.push(col);
      parsed.labels.push(EXTRA_LABELS[col] || col);
      for (const row of parsed.rows) row[col] = "";
    }
  }
  return parsed;
}

function tryAutoBuildDefaultInput(reason) {
  if (!USING_DEFAULT_INPUT) return false;
  const generator = path.join(ROOT, "tools/build-buff-rules-template.mjs");
  const wikiGenerated = path.join(ROOT, "src/data/generated/wikiEquipBuffEffects.generated.js");
  if (!fs.existsSync(generator) || !fs.existsSync(wikiGenerated)) return false;
  console.log(`[auto-template] ${reason}: node tools/build-buff-rules-template.mjs --only-matched を自動実行します。`);
  const result = spawnSync(process.execPath, [generator, "--only-matched"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: false
  });
  if (result.status !== 0) {
    console.warn(`[warn] auto-template failed: exit=${result.status}`);
    return false;
  }
  return fs.existsSync(INPUT);
}

function readInputTsvWithAutoTemplate() {
  if (!fs.existsSync(INPUT)) {
    if (!tryAutoBuildDefaultInput("入力TSVが見つかりません")) {
      throw new Error(`${INPUT} が見つかりません。先に node tools/build-buff-rules-template.mjs --only-matched を実行してください。`);
    }
  }
  let parsed = parseTsv(fs.readFileSync(INPUT, "utf8"));
  if (USING_DEFAULT_INPUT && parsed.rows.length === 0) {
    if (tryAutoBuildDefaultInput("入力TSVのデータ行が0件です")) {
      parsed = parseTsv(fs.readFileSync(INPUT, "utf8"));
    }
  }
  return parsed;
}

function normalizeName(s) {
  return String(s || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000_＿‐‑‒–—―ー-]+/g, "")
    .replace(/[()（）\[\]【】『』「」・.,，、:：;；!！?？'\"]/g, "")
    .trim();
}

function splitList(v) {
  return String(v || "").split(/\s*(?:\/|\||;|；|、|,)\s*/).map(s => s.trim()).filter(Boolean);
}

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function pageUrl(title) {
  return `${SCRAPBOX_BASE}/${PROJECT}/${encodeURIComponent(title)}`;
}

function apiPageUrl(title) {
  return `${SCRAPBOX_BASE}/api/pages/${PROJECT}/${encodeURIComponent(title)}`;
}

function apiTitleSearchUrl(q) {
  return `${SCRAPBOX_BASE}/api/pages/${PROJECT}/search/titles?q=${encodeURIComponent(q)}`;
}

function apiQuerySearchUrl(q) {
  return `${SCRAPBOX_BASE}/api/pages/${PROJECT}/search/query?q=${encodeURIComponent(q)}`;
}

async function searchTitles(query) {
  const titles = [];
  if (AUTO_FETCH && PROJECT_INDEX.length) titles.push(...searchProjectIndex(query));
  if (LOCAL_ONLY) return unique(titles).slice(0, 24);
  const urls = [apiTitleSearchUrl(query), apiQuerySearchUrl(query)];
  for (const url of urls) {
    const json = await fetchJsonCached("search", `${url}`, url);
    if (!json) continue;
    if (Array.isArray(json)) {
      for (const item of json) {
        if (typeof item === "string") titles.push(item);
        else if (item?.title) titles.push(item.title);
        else if (item?.page?.title) titles.push(item.page.title);
      }
    } else if (Array.isArray(json.pages)) {
      for (const item of json.pages) {
        if (typeof item === "string") titles.push(item);
        else if (item?.title) titles.push(item.title);
        else if (item?.page?.title) titles.push(item.page.title);
      }
    } else if (Array.isArray(json.titles)) {
      for (const title of json.titles) titles.push(typeof title === "string" ? title : title?.title);
    }
  }
  return unique(titles).slice(0, 24);
}

async function loadPage(title) {
  const json = await fetchJsonCached("page", title, apiPageUrl(title));
  if (json?.title && Array.isArray(json.lines)) {
    return {
      title: json.title,
      url: pageUrl(json.title),
      lines: json.lines.map(l => typeof l === "string" ? l : (l.text || "")).filter(Boolean)
    };
  }

  // APIが失敗した場合の最低限フォールバック。HTML本文から見える文字列だけ拾う。
  const html = await fetchTextCached("html", title, pageUrl(title));
  if (!html) return null;
  const plain = html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<br\s*\/?\>/gi, "\n")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .split(/\n+/).map(s => s.trim()).filter(Boolean);
  if (!plain.length) return null;
  return { title, url: pageUrl(title), lines: plain };
}

function rowSearchTerms(row) {
  const equipment = splitList(row.equipmentNames).slice(0, 12);
  const buffNames = unique([row.name, row.wikiName].map(s => String(s || "").trim()).filter(s => s && s !== "-"));
  const terms = [];
  for (const q of buffNames) terms.push({ q, type: "buff" });
  for (const q of equipment) terms.push({ q, type: "equipment" });
  for (const q of referenceQueries(row)) terms.push({ q, type: "reference" });
  const seen = new Set();
  return terms.filter(term => {
    const key = `${term.type}:${normalizeName(term.q)}`;
    if (!normalizeName(term.q) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function rowQueries(row) {
  return rowSearchTerms(row).map(term => term.q);
}

function referenceQueries(row) {
  const hay = `${row.name || ""} ${row.wikiName || ""} ${row.rawInfo || ""} ${row.parsedStatsHint || ""}`;
  const refs = [];
  if (/HP自然回復|hpRegenPerMinute|HP.*回復/i.test(hay)) refs.push("HP自然回復増加バフ");
  if (/ST自然回復|stRegenPerMinute|ST.*回復/i.test(hay)) refs.push("ST自然回復増加バフ");
  if (/MP自然回復|mpRegenPerMinute|MP.*回復/i.test(hay)) refs.push("MP自然回復増加バフ");
  if (/攻撃ディレイ|extraAttackDelay/i.test(hay)) refs.push("攻撃ディレイ減少バフ");
  if (/魔法ディレイ|extraMagicDelay/i.test(hay)) refs.push("魔法ディレイ減少バフ");
  if (/物理.*与ダメ|物理ダメージ|dmgPct/i.test(hay)) refs.push("物理与ダメージ増加バフ");
  if (/魔法.*与ダメ|魔法ダメージ/i.test(hay)) refs.push("魔法与ダメージ増加バフ");
  if (/属性効果|火属性|水属性|地属性|風属性|無属性/i.test(hay)) refs.push("属性効果増加バフ");
  if (/攻撃力|attackPct|attack/i.test(hay)) refs.push("攻撃力増加バフ");
  if (/魔力|magicPct|magic/i.test(hay)) refs.push("魔力増加バフ");
  return unique(refs);
}

function isBuffReferenceTitle(title) {
  return /(バフ|増加|短縮|減少|軽減|回復|与ダメ|被ダメ|自然回復|併用|重複|競合|検証)/.test(String(title || ""));
}

function titleScoreForTerm(term, title) {
  const q = String(term.q || "").trim();
  const nq = normalizeName(q);
  const nt = normalizeName(title);
  if (!nq || !nt) return null;
  const lenDiff = Math.abs(nt.length - nq.length);
  const titleIncludes = nt.includes(nq);
  const queryIncludes = nq.includes(nt) && nt.length >= 4;

  if (nt === nq) {
    return { score: 300, quality: term.type === "equipment" ? "exact-equipment-title" : "exact-title" };
  }

  if (term.type === "equipment") {
    // 装備名検索はノイズが出やすいので、原則ほぼ同名ページだけ採用する。
    if ((titleIncludes || queryIncludes) && lenDiff <= 4) return { score: 210, quality: "near-equipment-title" };
    return null;
  }

  if (term.type === "reference") {
    // 参照ページは「攻撃ディレイ減少バフ」などの既知ページだけに絞る。
    if ((titleIncludes || queryIncludes) && isBuffReferenceTitle(title) && lenDiff <= 8) return { score: 190, quality: "reference-title" };
    return null;
  }

  // Buff名検索。短い英字/数値系は誤爆しやすいので exact/near を強めに要求する。
  const shortOrSymbolic = nq.length <= 6 || /[0-9%％]/.test(q);
  if ((titleIncludes || queryIncludes) && lenDiff <= (shortOrSymbolic ? 4 : 10)) {
    return { score: 180, quality: "near-buff-title" };
  }
  if (!shortOrSymbolic && isBuffReferenceTitle(title) && titleIncludes) {
    return { score: 120, quality: "buff-title-contains" };
  }
  return null;
}

function selectRelevantPages(term, titles) {
  const accepted = [];
  const rejected = [];
  for (const title of unique(titles)) {
    const scored = titleScoreForTerm(term, title);
    if (scored) accepted.push({ title, query: term.q, type: term.type, ...scored });
    else if (title) rejected.push(title);
  }
  accepted.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ja"));
  return { accepted: accepted.slice(0, term.type === "equipment" ? 3 : 6), rejected: rejected.slice(0, 12) };
}

function contextLines(page, needles, meta = {}) {
  const nNeedles = unique(needles.map(normalizeName).filter(Boolean));
  const keywordRe = /(併用|重複|競合|加算|乗算|不可|一つしか|1つしか|最新|のみ|有効|ディレイ|回復|与ダメ|被ダメ|攻撃|防御|回避|命中|魔力|自然回復|消費|短縮|軽減|増加|上昇|低下|反射|確率)/;
  const picked = [];
  page.lines.forEach((line, idx) => {
    const nl = normalizeName(line);
    const byName = nNeedles.some(n => nl.includes(n));
    const byKeyword = keywordRe.test(line);

    // 参照ページは巨大な一覧になりやすい。対象Buff/装備名が出る行を優先し、
    // 単なるキーワード行だけでページ全体の汎用ルールを拾いすぎないようにする。
    if (meta.type === "reference" && !byName) return;

    // exact/nearの装備ページは、追加効果行が装備名を含まないことがあるためキーワード行も拾う。
    if (!byName && !byKeyword) return;
    const start = Math.max(0, idx - (byName ? 1 : 0));
    const end = Math.min(page.lines.length - 1, idx + (byName ? 1 : 0));
    for (let i = start; i <= end; i++) picked.push(page.lines[i]);
  });
  return unique(picked).slice(0, 24);
}

function inferHints(lines, pageTitles) {
  const joined = lines.join(" / ");
  const titles = pageTitles.join(" / ");
  const hay = `${titles} / ${joined}`;
  const stack = [];
  const notes = [];
  const groups = [];

  if (/同士は加算|加算/.test(hay)) stack.push("additive");
  if (/乗算/.test(hay)) stack.push("multiplicative");
  if (/併用不可|重複不可|一つしか効果|1つしか効果|一つのみ|1つのみ|のみ有効|最新の.*のみ/.test(hay)) stack.push("exclusive-or-latest");
  if (/大体併用できる|併用可能|併用できる/.test(hay)) stack.push("stackable");

  if (/魔法与ダメージ増加バフ/.test(hay)) groups.push("magic-damage-buff");
  if (/物理与ダメージ増加バフ|与ダメージ増加バフ/.test(hay)) groups.push("physical-damage-buff");
  if (/MP自然回復増加バフ/.test(hay)) groups.push("mp-regen-buff");
  if (/HP自然回復増加バフ/.test(hay)) groups.push("hp-regen-buff");
  if (/ST自然回復増加バフ/.test(hay)) groups.push("st-regen-buff");
  if (/属性効果増加バフ|無属性効果増加バフ|火属性効果|水属性効果|風属性効果|地属性効果/.test(hay)) groups.push("element-damage-buff");
  if (/闇の加護/.test(hay)) groups.push("dark-blessing-mp-regen");

  if (/未確認|らしい|\?/.test(hay)) notes.push("未確認表現あり");
  if (/WarAgeでは効果がな?い|War不可/.test(hay)) notes.push("WarAge注意");
  if (/テク不可|移動不可|非移動/.test(hay)) notes.push("行動制限注意");
  if (/ペット|召喚/.test(hay)) notes.push("ペット/召喚条件注意");
  if (/特定.*のみ|条件|場合のみ/.test(hay)) notes.push("条件付き効果注意");

  const effectLines = lines.filter(line => /(\+|-|％|%|\d+(?:\.\d+)?|回復|短縮|軽減|増加|上昇|低下|加算|乗算)/.test(line)).slice(0, 8);
  return {
    stackRuleHint: unique(stack).join(";"),
    conflictGroupHint: unique(groups).join(";"),
    effectHint: effectLines.join(" / "),
    notes: unique(notes).join(";"),
    rawLines: lines.join(" / ")
  };
}

function safeJoin(list) {
  return unique(list).join(" / ");
}

function isDefaultishStackRule(v) {
  return !String(v || "").trim() || String(v || "").trim() === "same-technic";
}

function shouldProcessRow(row) {
  return row.officialTechnicId || row.name || row.wikiName || row.equipmentNames;
}

async function enrichRow(row, index) {
  const terms = rowSearchTerms(row);
  if (!terms.length) {
    row.scrapboxMatchStatus = "no-query";
    row.scrapboxMatchQuality = "";
    return row;
  }

  const acceptedPages = [];
  const rejectedPages = [];
  for (const term of terms) {
    let titles = await searchTitles(term.q);
    // 直接ページ名として存在するケースもあるため候補には入れるが、strict選別で実在しない/遠いページは落とす。
    titles = unique([term.q, ...titles]);
    const { accepted, rejected } = selectRelevantPages(term, titles);
    acceptedPages.push(...accepted);
    rejectedPages.push(...rejected.map(title => `${term.q}=>${title}`));
  }

  const selected = [];
  const seenTitles = new Set();
  for (const item of acceptedPages.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "ja"))) {
    const key = normalizeName(item.title);
    if (!key || seenTitles.has(key)) continue;
    seenTitles.add(key);
    selected.push(item);
    if (selected.length >= 12) break;
  }

  const pages = [];
  for (const item of selected) {
    const page = await loadPage(item.title);
    if (page) pages.push({ ...page, meta: item });
  }

  const needles = rowQueries(row).concat([row.name, row.wikiName, ...splitList(row.equipmentNames)]);
  const allLines = [];
  for (const page of pages) {
    const lines = contextLines(page, needles, page.meta);
    for (const line of lines) allLines.push(`[${page.title}] ${line}`);
  }
  const hints = inferHints(allLines, pages.map(p => p.title));

  const qualities = unique(pages.map(p => p.meta?.quality).filter(Boolean));
  row.scrapboxMatchStatus = pages.length ? (allLines.length ? "matched" : "page-only") : "unmatched";
  row.scrapboxMatchedQueries = safeJoin(selected.map(p => `${p.query}:${p.type}`));
  row.scrapboxPages = safeJoin(pages.map(p => `${p.title} ${p.url}`));
  row.scrapboxMatchQuality = qualities.join(";");
  row.scrapboxRejectedPages = safeJoin(rejectedPages).slice(0, 4000);
  row.scrapboxStackRuleHint = hints.stackRuleHint;
  row.scrapboxConflictGroupHint = hints.conflictGroupHint;
  row.scrapboxEffectHint = hints.effectHint;
  row.scrapboxNotes = hints.notes;
  row.scrapboxRawLines = hints.rawLines;

  if (APPLY_HINTS) {
    if (isDefaultishStackRule(row.stackRule) && hints.stackRuleHint) row.stackRule = hints.stackRuleHint;
    if (!String(row.conflictGroup || "").trim() && hints.conflictGroupHint) row.conflictGroup = hints.conflictGroupHint;
    const memoParts = [row.memo, hints.notes, hints.effectHint].filter(Boolean);
    row.memo = safeJoin(memoParts);
  }

  if ((index + 1) % 25 === 0) {
    console.log(`[progress] ${index + 1} rows`);
  }
  return row;
}

if (REFRESH_CACHE) {
  console.log(`[cache] refresh requested: ${CACHE_DIR}`);
  clearCacheDir();
}
ensureDir(CACHE_DIR, true);
if (AUTO_FETCH) {
  PROJECT_INDEX = await loadProjectIndex();
}
const parsed = appendExtraColumns(readInputTsvWithAutoTemplate());
const targets = parsed.rows.filter(shouldProcessRow);
const max = LIMIT === 0 ? targets.length : Math.min(targets.length, Number.isFinite(LIMIT) ? LIMIT : 200);
console.log(`[scrapbox-enrich] ${VERSION}`);
console.log(`[read] ${INPUT} (${parsed.rows.length} rows, targets=${targets.length})`);
console.log(`[mode] limit=${LIMIT === 0 ? "all" : max} applyHints=${APPLY_HINTS ? "yes" : "no"} autoFetch=${AUTO_FETCH ? "yes" : "no"} localOnly=${LOCAL_ONLY ? "yes" : "no"} match=${STRICT_MATCH ? "strict" : "broad"}`);
console.log(`[cache] ${CACHE_DIR}`);
if (AUTO_FETCH) console.log(`[project-index] pages=${PROJECT_INDEX.length}`);

for (let i = 0; i < max; i++) {
  await enrichRow(targets[i], i);
}

ensureDir(OUTPUT);
fs.writeFileSync(OUTPUT, stringifyTsv(parsed.labels, parsed.header, parsed.rows), "utf8");
const matched = parsed.rows.filter(r => r.scrapboxMatchStatus === "matched").length;
const pageOnly = parsed.rows.filter(r => r.scrapboxMatchStatus === "page-only").length;
const unmatched = parsed.rows.filter(r => r.scrapboxMatchStatus === "unmatched").length;
console.log(`[write] ${OUTPUT}`);
console.log(`[summary] matched=${matched} pageOnly=${pageOnly} unmatched=${unmatched} processed=${max}`);
console.log(`[next] 出力TSVの Scrapbox根拠行 / 重複ヒントを見て、採用する行だけ enabled=TRUE にしてください。`);
if (!AUTO_FETCH) console.log(`[tip] より広く自動取得する場合は --auto-fetch --limit=0 を付けて再実行してください。`);
