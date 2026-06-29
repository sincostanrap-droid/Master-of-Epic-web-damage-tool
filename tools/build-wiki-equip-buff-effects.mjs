#!/usr/bin/env node
/**
 * MoE Wiki 常時発動型追加効果 HTML → 装備Buff効果候補生成
 * v1.23.12
 *
 * 公式DB由来の buffCatalog.generated.js / equipmentCatalog.generated.js と照合し、
 * Wikiに書かれた常時発動Buffの数値候補を technic_id へ寄せるための開発用スクリプトです。
 *
 * Usage:
 *   node tools/build-wiki-equip-buff-effects.mjs --input="data/wiki/equip-buff-effects/*.htm"
 *   node tools/build-wiki-equip-buff-effects.mjs --input="path/to/常時発動1.htm,path/to/常時発動2.htm,path/to/常時発動3.htm"
 *   node tools/build-wiki-equip-buff-effects.mjs --rematch-only
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const GENERATOR_VERSION = 'v1.23.12';
const CONFIG = {
  input: 'data/wiki/equip-buff-effects/*.htm',
  outDir: 'src/data/generated',
  reportDir: 'dist/wiki-equip-buff-effects',
  rematchOnly: false,
};

function parseArgs() {
  for (const arg of process.argv.slice(2)) {
    if (arg === '--help' || arg === '-h') {
      console.log(`Usage:\n  node tools/build-wiki-equip-buff-effects.mjs [--input="data/wiki/equip-buff-effects/*.htm"] [--out=src/data/generated] [--report=dist/wiki-equip-buff-effects] [--rematch-only]`);
      process.exit(0);
    }
    if (arg.startsWith('--input=')) CONFIG.input = arg.slice('--input='.length).trim().replace(/^['"]|['"]$/g, '');
    if (arg.startsWith('--out=')) CONFIG.outDir = arg.slice('--out='.length).trim();
    if (arg.startsWith('--report=')) CONFIG.reportDir = arg.slice('--report='.length).trim();
    if (arg === '--rematch-only') CONFIG.rematchOnly = true;
  }
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function expandInput(patternText) {
  const parts = String(patternText || '').split(',').map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const part of parts) {
    if (!part.includes('*')) {
      out.push(part);
      continue;
    }
    const dir = path.dirname(part);
    const base = path.basename(part);
    const re = new RegExp('^' + escapeRegExp(base).replace(/\\\*/g, '.*') + '$');
    try {
      const names = await fs.readdir(dir);
      names.filter(n => re.test(n)).sort((a, b) => a.localeCompare(b, 'ja')).forEach(n => out.push(path.join(dir, n)));
    } catch {}
  }
  return Array.from(new Set(out));
}

async function readTextSmart(file) {
  const buf = await fs.readFile(file);
  const head = buf.slice(0, 2048).toString('ascii');
  const meta = head.match(/charset=["']?([^"'\s>]+)/i);
  const charset = (meta?.[1] || '').toLowerCase();
  if (charset.includes('euc')) {
    return new TextDecoder('euc-jp', { fatal: false }).decode(buf);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder('euc-jp', { fatal: false }).decode(buf);
  }
}

function decodeEntities(text) {
  return String(text || '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

function stripTags(html) {
  return decodeEntities(String(html || '')
    .replace(/<br\b[^>]*>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n')
    .replace(/<\/div\s*>/gi, '\n')
    .replace(/<\/li\s*>/gi, '\n')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n+ */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cellAttr(attr, name) {
  const m = String(attr || '').match(new RegExp(`${name}\\s*=\\s*["']?([^"'\\s>]+)`, 'i'));
  return m ? m[1] : '';
}

function parseCells(rowHtml) {
  const cells = [];
  const re = /<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(rowHtml))) {
    cells.push({ tag: m[1].toLowerCase(), attrs: m[2] || '', html: m[3] || '', text: stripTags(m[3] || '') });
  }
  return cells;
}

function normalizeName(s) {
  return String(s || '')
    .replace(/\([^)]*\)/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/[\s　・･_＿\-－―〜～~]/g, '')
    .replace(/[+＋]/g, '+')
    .replace(/[％]/g, '%')
    .toLowerCase()
    .trim();
}

function normalizeText(s) {
  return String(s || '')
    .replace(/[＋]/g, '+')
    .replace(/[－−―]/g, '-')
    .replace(/[％]/g, '%')
    .replace(/　/g, ' ')
    .replace(/[、，]/g, '、')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanBuffName(s) {
  return String(s || '')
    .split('\n')
    .map(x => x.trim())
    .filter(x => x && !/^[あ-んア-ン]行$/.test(x) && !/^20\d{2}年/.test(x))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitEquipmentNames(text) {
  return String(text || '')
    .split(/\n+/)
    .map(s => s.replace(/^※.*/, '').trim())
    .flatMap(s => s.split(/\s{2,}|、|，/))
    .map(s => s.trim())
    .filter(s => s && !/^※/.test(s) && !/^\(.+\)$/.test(s));
}

function parseWikiRowsFromHtml(html, file) {
  const sourcePage = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || path.basename(file)).replace(/MoE Wiki \(main\) - /, '').trim();
  const rows = [];
  const tableRe = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let tm;
  while ((tm = tableRe.exec(html))) {
    const table = tm[1];
    if (!/名称[\s\S]*info[\s\S]*装備品/.test(stripTags(table))) continue;
    const trRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let rm;
    let activeInfo = '';
    let activeInfoRows = 0;
    while ((rm = trRe.exec(table))) {
      const cells = parseCells(rm[1]);
      if (!cells.length) continue;
      if (cells.length >= 3 && /名称/.test(cells[0].text) && /info/i.test(cells[1].text)) continue;
      if (cells.length === 1 || /^(あ|か|さ|た|な|は|ま|や|ら|わ)行$/.test(cells[0].text) || /^20\d{2}年/.test(cells[0].text)) continue;

      let name = '';
      let info = '';
      let equip = '';
      if (cells.length >= 3) {
        name = cleanBuffName(cells[0].text);
        info = cells[1].text;
        equip = cells.slice(2).map(c => c.text).join('\n');
        const rs = parseInt(cellAttr(cells[1].attrs, 'rowspan') || '0', 10);
        if (rs > 1) {
          activeInfo = info;
          activeInfoRows = rs - 1;
        } else {
          activeInfo = '';
          activeInfoRows = 0;
        }
      } else if (cells.length === 2 && activeInfoRows > 0) {
        name = cleanBuffName(cells[0].text);
        info = activeInfo;
        equip = cells[1].text;
        activeInfoRows -= 1;
        if (activeInfoRows <= 0) activeInfo = '';
      } else {
        continue;
      }
      if (!name || !info && !equip) continue;
      rows.push({
        wikiId: `${path.basename(file)}:${rows.length + 1}`,
        name,
        normalizedName: normalizeName(name),
        info: normalizeText(info),
        equipmentNames: splitEquipmentNames(equip),
        sourcePage,
        sourceFile: path.basename(file),
      });
    }
  }
  return rows;
}

function pushEffect(effects, key, value, unit, raw, options = {}) {
  const v = Number(value);
  if (!Number.isFinite(v)) return;
  const exists = effects.some(e => e.key === key && e.target === (options.target || '') && Math.abs(e.value - v) < 1e-9 && e.unit === unit);
  if (exists) return;
  effects.push({
    key,
    prop: options.prop || '',
    equipProp: options.equipProp || '',
    label: options.label || key,
    target: options.target || '',
    value: v,
    unit: unit || '',
    confidence: options.confidence || 'medium',
    raw: String(raw || '').trim(),
    note: options.note || '',
  });
}

const STAT_PATTERNS = [
  { re: /攻撃力\s*([+-]\d+(?:\.\d+)?)\s*%/g, key: 'attackPct', prop: 'attackPct', equipProp: 'equipBuffAttackPct', label: '攻撃力%' },
  { re: /攻撃力\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/g, key: 'attackFlat', prop: 'flatAttack', equipProp: 'equipBuffFlatAttack', label: '攻撃力' },
  { re: /魔力\s*([+-]\d+(?:\.\d+)?)\s*%/g, key: 'magicPct', prop: 'magicPct', equipProp: 'equipBuffMagicPct', label: '魔力%' },
  { re: /魔力\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/g, key: 'magicFlat', prop: 'flatMagic', equipProp: 'equipBuffFlatMagic', label: '魔力' },
  { re: /移動速度\s*([+-]\d+(?:\.\d+)?)\s*%/g, key: 'speedPct', prop: 'speedPct', equipProp: 'equipBuffSpeedPct', label: '速度%' },
  { re: /移動速度\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/g, key: 'speedFlat', prop: 'flatSpeed', equipProp: 'equipBuffFlatSpeed', label: '速度' },
  { re: /防御力\s*([+-]\d+(?:\.\d+)?)\s*%/g, key: 'extraACPct', prop: 'extraACPct', equipProp: 'equipBuffExtraACPct', label: 'AC%' },
  { re: /防御力\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/g, key: 'flatAC', prop: 'extraAC', equipProp: 'equipBuffExtraAC', label: 'AC' },
  { re: /(?:最大)?HP\s*([+-]\d+(?:\.\d+)?)\s*%/gi, key: 'extraHPPct', prop: 'extraHPPct', equipProp: 'equipBuffExtraHPPct', label: 'HP%' },
  { re: /(?:最大)?HP\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/gi, key: 'flatHP', prop: 'extraHP', equipProp: 'equipBuffExtraHP', label: 'HP' },
  { re: /(?:最大)?MP\s*([+-]\d+(?:\.\d+)?)\s*%/gi, key: 'extraMPPct', prop: 'extraMPPct', equipProp: 'equipBuffExtraMPPct', label: 'MP%' },
  { re: /(?:最大)?MP\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/gi, key: 'flatMP', prop: 'extraMP', equipProp: 'equipBuffExtraMP', label: 'MP' },
  { re: /(?:最大)?ST\s*([+-]\d+(?:\.\d+)?)\s*%/gi, key: 'extraSTPct', prop: 'extraSTPct', equipProp: 'equipBuffExtraSTPct', label: 'ST%' },
  { re: /(?:最大)?ST\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/gi, key: 'flatST', prop: 'extraST', equipProp: 'equipBuffExtraST', label: 'ST' },
  { re: /命中(?:率)?\s*([+-]\d+(?:\.\d+)?)\s*%/g, key: 'extraHitPct', prop: 'extraHitPct', equipProp: 'equipBuffExtraHitPct', label: '命中%' },
  { re: /命中\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/g, key: 'hitFlat', prop: 'extraHit', equipProp: 'equipBuffExtraHit', label: '命中' },
  { re: /回避\s*([+-]\d+(?:\.\d+)?)\s*%/g, key: 'extraAvoidPct', prop: 'extraAvoidPct', equipProp: 'equipBuffExtraAvoidPct', label: '回避%' },
  { re: /回避\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/g, key: 'avoidFlat', prop: 'extraAvoid', equipProp: 'equipBuffExtraAvoid', label: '回避' },
  { re: /最大(?:所持可能)?重量\s*([+-]\d+(?:\.\d+)?)\s*%/g, key: 'maxWeightPct', prop: 'extraMaxWeightPct', equipProp: 'equipBuffExtraMaxWeightPct', label: '最大重量%' },
  { re: /最大(?:所持可能)?重量\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/g, key: 'flatMaxWeight', prop: 'extraMaxWeight', equipProp: 'equipBuffExtraMaxWeight', label: '最大重量' },
  { re: /攻撃ディレイ\s*([+-]\d+(?:\.\d+)?)\s*%/g, key: 'attackDelayPct', prop: 'extraAttackDelayPct', equipProp: 'equipBuffExtraAttackDelayPct', label: '攻撃ディレイ%' },
  { re: /攻撃ディレイ\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/g, key: 'attackDelayFlat', prop: 'extraAttackDelay', equipProp: 'equipBuffExtraAttackDelay', label: '攻撃ディレイ' },
  { re: /魔法ディレイ\s*([+-]\d+(?:\.\d+)?)\s*%/g, key: 'magicDelayPct', prop: 'extraMagicDelayPct', equipProp: 'equipBuffExtraMagicDelayPct', label: '魔法ディレイ%' },
  { re: /魔法ディレイ\s*([+-]\d+(?:\.\d+)?)(?!\s*%)/g, key: 'magicDelayFlat', prop: 'extraMagicDelay', equipProp: 'equipBuffExtraMagicDelay', label: '魔法ディレイ' },
  { re: /クリ(?:ティカル)?(?:率)?\s*([+-]\d+(?:\.\d+)?)\s*%/g, key: 'critRatePct', prop: 'extraCritRatePct', equipProp: 'equipBuffExtraCritRatePct', label: 'クリ率%' },
  { re: /被ダメ(?:ージ)?(?:軽減|減少)?\s*([+-]?\d+(?:\.\d+)?)\s*%/g, key: 'damageReducePct', prop: 'extraDamageReducePct', equipProp: 'equipBuffExtraDamageReducePct', label: '被ダメ軽減%' },
  { re: /(?:物理)?ダメージ(?:を)?(?:約)?\s*([+-]?\d+(?:\.\d+)?)\s*%\s*(?:増加|上昇|アップ)/g, key: 'dmgPct', prop: 'dmgPct', equipProp: 'equipBuffDmgPct', label: '与ダメ%' },
];

const ELEMENTS = [
  ['火属性', /火属性/],
  ['水属性', /水属性/],
  ['地属性', /地属性/],
  ['風属性', /風属性/],
  ['無属性', /無属性/],
];

const SKILL_NAMES = [
  '刀剣','棍棒','槍','銃器','弓','投げ','素手','キック','牙','罠','酩酊','暗黒命令','シャウト','音楽','ダンス',
  '破壊魔法','回復魔法','強化魔法','神秘魔法','召喚魔法','死の魔法','魔法熟練','自然調和','調教','物まね','盗み','取引',
  '鍛冶','木工','裁縫','装飾細工','料理','醸造','薬調合','複製','美容'
];

function parseStats(text) {
  const info = normalizeText(text);
  const effects = [];
  const unparsed = [];

  // Compound shorthand patterns commonly used on Wiki.
  for (const m of info.matchAll(/HPMP\s*([+-]\d+(?:\.\d+)?)\s*%/gi)) {
    pushEffect(effects, 'extraHPPct', m[1], '%', m[0], { prop:'extraHPPct', equipProp:'equipBuffExtraHPPct', label:'HP%', confidence:'high' });
    pushEffect(effects, 'extraMPPct', m[1], '%', m[0], { prop:'extraMPPct', equipProp:'equipBuffExtraMPPct', label:'MP%', confidence:'high' });
  }
  for (const m of info.matchAll(/攻撃魔力\s*([+-]\d+(?:\.\d+)?)\s*%/g)) {
    pushEffect(effects, 'attackPct', m[1], '%', m[0], { prop:'attackPct', equipProp:'equipBuffAttackPct', label:'攻撃力%', confidence:'high' });
    pushEffect(effects, 'magicPct', m[1], '%', m[0], { prop:'magicPct', equipProp:'equipBuffMagicPct', label:'魔力%', confidence:'high' });
  }

  for (const def of STAT_PATTERNS) {
    def.re.lastIndex = 0;
    for (const m of info.matchAll(def.re)) {
      pushEffect(effects, def.key, m[1], def.key.endsWith('Pct') || def.key.includes('Pct') || String(m[0]).includes('%') ? '%' : '', m[0], {
        prop: def.prop,
        equipProp: def.equipProp,
        label: def.label,
        confidence: 'high',
      });
    }
  }

  for (const [target, re] of ELEMENTS) {
    if (!re.test(info)) continue;
    const m = info.match(/効果量[^\d+-]*約?\s*([+-]?\d+(?:\.\d+)?)\s*%/) || info.match(/ダメージ(?:増加量)?[^\d+-]*約?\s*([+-]?\d+(?:\.\d+)?)\s*%/);
    if (m) pushEffect(effects, 'elementDamagePct', m[1], '%', m[0], { target, label:'属性ダメージ%', confidence:'medium', note:'属性効果アップは対象・併用条件要確認' });
  }

  const sentences = info.split(/[。\n]/).map(x => x.trim()).filter(Boolean);
  for (const sentence of sentences) {
    const m = sentence.match(/スキル\s*([+-]\d+(?:\.\d+)?)\s*相当/);
    if (!m) continue;
    const targets = SKILL_NAMES.filter(skill => sentence.includes(skill));
    targets.forEach(skill => {
      pushEffect(effects, 'skillPlus', m[1], '', sentence, { target: skill, label:'スキル+', confidence:'medium', note:'テクニック効果上昇。計算式への反映は個別対応' });
    });
  }


  const regenSlash = info.match(/HP\s*([+-]?\d+(?:\.\d+)?)\s*\/\s*ST\s*([+-]?\d+(?:\.\d+)?)\s*\/\s*MP\s*([+-]?\d+(?:\.\d+)?)\s*回復\s*\/\s*1\s*min/i);
  if (regenSlash) {
    pushEffect(effects, 'hpRegenPerMinute', regenSlash[1], '/min', regenSlash[0], { label:'HP自然回復/分', confidence:'medium' });
    pushEffect(effects, 'stRegenPerMinute', regenSlash[2], '/min', regenSlash[0], { label:'ST自然回復/分', confidence:'medium' });
    pushEffect(effects, 'mpRegenPerMinute', regenSlash[3], '/min', regenSlash[0], { label:'MP自然回復/分', confidence:'medium' });
  }
  for (const m of info.matchAll(/1分間に\s*HP(?:\/ST\/MP)?が?\s*([+-]?\d+(?:\.\d+)?)\s*回復/g)) {
    pushEffect(effects, 'hpRegenPerMinute', m[1], '/min', m[0], { label:'HP自然回復/分', confidence:'medium' });
    if (/HP\/ST\/MP/.test(m[0])) {
      pushEffect(effects, 'stRegenPerMinute', m[1], '/min', m[0], { label:'ST自然回復/分', confidence:'medium' });
      pushEffect(effects, 'mpRegenPerMinute', m[1], '/min', m[0], { label:'MP自然回復/分', confidence:'medium' });
    }
  }
  for (const m of info.matchAll(/1分間に\s*STが\s*([+-]?\d+(?:\.\d+)?)\s*回復/g)) {
    pushEffect(effects, 'stRegenPerMinute', m[1], '/min', m[0], { label:'ST自然回復/分', confidence:'medium' });
  }
  for (const m of info.matchAll(/1分間に\s*MPが\s*([+-]?\d+(?:\.\d+)?)\s*回復/g)) {
    pushEffect(effects, 'mpRegenPerMinute', m[1], '/min', m[0], { label:'MP自然回復/分', confidence:'medium' });
  }

  if (/専用技|使用可能|変身|モーション|確率|一定確率|低確率|反射|跳ね返|復活|解除|打ち消|特攻|種族|ペット|時間帯|日中|夜間|条件|併用不可|最新の/.test(info)) {
    unparsed.push('条件・専用技・確率・競合など、数値だけでは扱えない説明を含みます');
  }
  if (!effects.length) unparsed.push('数値効果を自動抽出できませんでした');
  return { effects, unparsed };
}

function parseWindowArray(text, globalName) {
  const re = new RegExp(`window\\.${escapeRegExp(globalName)}\\s*=\\s*([\\s\\S]*?);\\s*(?:\\n|$)`);
  const m = String(text || '').match(re);
  if (!m) return [];
  try { return JSON.parse(m[1]); } catch { return []; }
}

async function readGeneratedArray(file, name) {
  try {
    const text = await fs.readFile(file, 'utf8');
    return parseWindowArray(text, name);
  } catch {
    return [];
  }
}

function findMatches(row, buffCatalog, equipmentCatalog) {
  const byName = new Map();
  const byEquipName = new Map();
  buffCatalog.forEach(b => {
    const key = normalizeName(b.name);
    if (!key) return;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(b);
  });
  equipmentCatalog.forEach(e => {
    const key = normalizeName(e.name);
    if (!key) return;
    if (!byEquipName.has(key)) byEquipName.set(key, []);
    byEquipName.get(key).push(e);
  });

  const matched = [];
  const addBuff = (b, type, via = '') => {
    if (!b) return;
    const id = b.catalogId || b.id || (b.officialTechnicId ? `technic-${b.officialTechnicId}` : '');
    if (!id || matched.some(x => x.id === id)) return;
    matched.push({
      id,
      officialTechnicId: b.officialTechnicId || null,
      name: b.name || '',
      type,
      via,
    });
  };

  (byName.get(row.normalizedName) || []).forEach(b => addBuff(b, 'buffName'));

  if (!matched.length) {
    for (const equipName of row.equipmentNames || []) {
      const equips = byEquipName.get(normalizeName(equipName)) || [];
      for (const equip of equips) {
        const refs = equip.buffRefs || [];
        for (const ref of refs) {
          const b = buffCatalog.find(x => String(x.catalogId || x.id) === String(ref));
          addBuff(b, 'equipmentName', equipName);
        }
        if (equip.equipBuff?.name) {
          const b = buffCatalog.find(x => normalizeName(x.name) === normalizeName(equip.equipBuff.name));
          addBuff(b, 'equipmentBuffName', equipName);
        }
      }
    }
  }

  return matched;
}

function jsonForJs(value) {
  return JSON.stringify(value, null, 2).replace(/<\/script/gi, '<\\/script');
}

function tsvCell(v) {
  return String(v ?? '').replace(/\r?\n/g, ' / ').replace(/\t/g, ' ');
}

async function loadExistingWikiRows() {
  const file = path.join(CONFIG.outDir, 'wikiEquipBuffEffects.generated.js');
  const arr = await readGeneratedArray(file, 'MOE_WIKI_EQUIP_BUFF_EFFECTS_GENERATED');
  return arr.map(x => ({...x, parsedStats: x.parsedStats || [], unparsedNotes: x.unparsedNotes || []}));
}

async function main() {
  parseArgs();
  console.log(`[wiki-buff-generator] ${GENERATOR_VERSION}`);
  let rows = [];
  const inputFiles = await expandInput(CONFIG.input);
  if (!CONFIG.rematchOnly && inputFiles.length) {
    for (const file of inputFiles) {
      const html = await readTextSmart(file);
      const parsed = parseWikiRowsFromHtml(html, file);
      rows.push(...parsed);
      console.log(`[parse] ${file} -> ${parsed.length} rows`);
    }
    rows = rows.map(row => {
      const parsed = parseStats(row.info);
      return {
        ...row,
        parsedStats: parsed.effects,
        unparsedNotes: parsed.unparsed,
        verified: false,
        applyDefault: false,
      };
    });
  } else {
    rows = await loadExistingWikiRows();
    console.log(`[reuse] existing wiki generated rows: ${rows.length}`);
    if (!rows.length) {
      throw new Error('入力HTMLがなく、既存の wikiEquipBuffEffects.generated.js もありません。--input で常時発動HTMLを指定してください。');
    }
  }

  const buffCatalog = await readGeneratedArray(path.join(CONFIG.outDir, 'buffCatalog.generated.js'), 'MOE_BUFF_CATALOG_GENERATED');
  const equipmentCatalog = await readGeneratedArray(path.join(CONFIG.outDir, 'equipmentCatalog.generated.js'), 'MOE_EQUIPMENT_CATALOG_GENERATED');
  console.log(`[catalog] buffs=${buffCatalog.length} equipment=${equipmentCatalog.length}`);

  rows = rows.map(row => {
    const matches = findMatches(row, buffCatalog, equipmentCatalog);
    return {
      ...row,
      matchedBuffIds: matches.map(m => m.id),
      matchedOfficialTechnicIds: matches.map(m => m.officialTechnicId).filter(Boolean),
      matchDetails: matches,
      matchStatus: matches.length === 1 ? 'matched' : matches.length > 1 ? 'multiple' : 'unmatched',
    };
  });

  await fs.mkdir(CONFIG.outDir, { recursive: true });
  await fs.mkdir(CONFIG.reportDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const meta = {
    generatedAt,
    generatorVersion: GENERATOR_VERSION,
    sourceFiles: inputFiles.map(f => path.basename(f)),
    rowCount: rows.length,
    parsedCount: rows.filter(r => (r.parsedStats || []).length).length,
    matchedCount: rows.filter(r => r.matchStatus === 'matched').length,
    multipleMatchCount: rows.filter(r => r.matchStatus === 'multiple').length,
    unmatchedCount: rows.filter(r => r.matchStatus === 'unmatched').length,
    unresolvedCount: rows.filter(r => !(r.parsedStats || []).length || r.matchStatus !== 'matched' || (r.unparsedNotes || []).length).length,
    note: 'Wiki由来の装備Buff効果候補。自動計算への即反映はせず、manualルール作成のための開発用データとして扱う。',
  };
  await fs.writeFile(path.join(CONFIG.outDir, 'wikiEquipBuffEffects.generated.js'),
    `// Generated by tools/build-wiki-equip-buff-effects.mjs\n// ${generatedAt}\nwindow.MOE_WIKI_EQUIP_BUFF_EFFECTS_META = ${jsonForJs(meta)};\nwindow.MOE_WIKI_EQUIP_BUFF_EFFECTS_GENERATED = ${jsonForJs(rows)};\n`,
    'utf8');

  const header = ['matchStatus','name','matchedBuffIds','matchedOfficialTechnicIds','parsedStats','unparsedNotes','equipmentNames','info','sourcePage','sourceFile'];
  const reportRows = rows.map(r => [
    r.matchStatus,
    r.name,
    (r.matchedBuffIds || []).join(','),
    (r.matchedOfficialTechnicIds || []).join(','),
    (r.parsedStats || []).map(e => `${e.target ? e.target + ':' : ''}${e.label}${e.value}${e.unit}`).join(' / '),
    (r.unparsedNotes || []).join(' / '),
    (r.equipmentNames || []).join(' / '),
    r.info,
    r.sourcePage,
    r.sourceFile,
  ]);
  await fs.writeFile(path.join(CONFIG.reportDir, 'wikiEquipBuffEffects.parsed.tsv'), [header, ...reportRows].map(r => r.map(tsvCell).join('\t')).join('\n'), 'utf8');
  const unresolved = reportRows.filter((r, i) => {
    const row = rows[i];
    return row.matchStatus !== 'matched' || !(row.parsedStats || []).length || (row.unparsedNotes || []).length;
  });
  await fs.writeFile(path.join(CONFIG.reportDir, 'wikiEquipBuffEffects.unresolved.tsv'), [header, ...unresolved].map(r => r.map(tsvCell).join('\t')).join('\n'), 'utf8');

  console.log(`[write] ${path.join(CONFIG.outDir, 'wikiEquipBuffEffects.generated.js')} (${rows.length} rows)`);
  console.log(`[write] ${path.join(CONFIG.reportDir, 'wikiEquipBuffEffects.parsed.tsv')}`);
  console.log(`[write] ${path.join(CONFIG.reportDir, 'wikiEquipBuffEffects.unresolved.tsv')} (${unresolved.length} rows)`);
  console.log(`[summary] parsed=${meta.parsedCount} matched=${meta.matchedCount} multiple=${meta.multipleMatchCount} unmatched=${meta.unmatchedCount} unresolved=${meta.unresolvedCount}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
