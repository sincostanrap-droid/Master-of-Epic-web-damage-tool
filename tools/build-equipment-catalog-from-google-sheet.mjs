#!/usr/bin/env node
/**
 * Master of Epic 公式DBスプレッドシート → ツール用カタログ生成
 * v0.1.3
 *
 * 既定ではユーザーが作成した公開スプレッドシートから items_all / add_status / equip_buff を取得し、
 * src/data/generated/equipmentCatalog.generated.js と buffCatalog.generated.js を生成します。
 *
 * Usage:
 *   node tools/build-equipment-catalog-from-google-sheet.mjs
 *   node tools/build-equipment-catalog-from-google-sheet.mjs --spreadsheet-id=xxxxxxxx
 *   node tools/build-equipment-catalog-from-google-sheet.mjs --input-dir=dist/moe-official-db
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const GENERATOR_VERSION = 'v1.23.11';
const DEFAULT_SPREADSHEET_ID = '10nHr68XojjuxxJrpLBENrDWUB4TywMGy8CTe9lzclSE';

const CONFIG = {
  spreadsheetId: DEFAULT_SPREADSHEET_ID,
  outDir: 'src/data/generated',
  inputDir: '',
  sourceSheetUrl: '',
};

const SHEETS = {
  items: 'items_all',
  addStatus: 'add_status',
  equipBuff: 'equip_buff',
};

function parseArgs() {
  for (const arg of process.argv.slice(2)) {
    if (arg === '--help' || arg === '-h') {
      console.log(`Usage:\n  node tools/build-equipment-catalog-from-google-sheet.mjs [--spreadsheet-id=ID] [--input-dir=DIR] [--out=DIR]\n\n既定のSpreadsheet ID: ${DEFAULT_SPREADSHEET_ID}`);
      process.exit(0);
    }
    if (arg.startsWith('--spreadsheet-id=')) CONFIG.spreadsheetId = arg.split('=')[1].trim();
    if (arg.startsWith('--input-dir=')) CONFIG.inputDir = arg.split('=')[1].trim();
    if (arg.startsWith('--out=')) CONFIG.outDir = arg.split('=')[1].trim();
  }
  CONFIG.sourceSheetUrl = `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/edit`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}

function parseTsv(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean).map(line => line.split('\t'));
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const header = rows[0].map(h => String(h || '').trim());
  return rows.slice(1).filter(r => r.some(c => String(c || '').trim())).map(r => {
    const obj = {};
    header.forEach((h, i) => obj[h] = r[i] ?? '');
    return obj;
  });
}

async function loadSheet(sheetName) {
  if (CONFIG.inputDir) {
    const candidates = [
      path.join(CONFIG.inputDir, `${sheetName}.tsv`),
      path.join(CONFIG.inputDir, `${sheetName}.csv`),
    ];
    for (const file of candidates) {
      try {
        const text = await fs.readFile(file, 'utf8');
        return rowsToObjects(file.endsWith('.csv') ? parseCsv(text) : parseTsv(text));
      } catch {}
    }
    throw new Error(`input-dir内に ${sheetName}.tsv または ${sheetName}.csv がありません: ${CONFIG.inputDir}`);
  }

  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'MoE equipment catalog generator/0.1.1' } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${sheetName}: HTTP ${res.status} ${text.slice(0, 120)}`);
  if (/^\s*</.test(text)) throw new Error(`${sheetName}: CSVではなくHTMLが返りました。共有設定かシート名を確認してください。`);
  return rowsToObjects(parseCsv(text));
}

function num(v) {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function str(v) {
  return String(v ?? '').trim();
}

function categoryKey(raw) {
  const s = str(raw).toLowerCase();
  if (s.includes('weapon')) return 'weapon';
  if (s.includes('shield')) return 'shield';
  if (s.includes('defence') || s.includes('defense')) return 'defense';
  return s || 'item';
}

function categoryLabel(key) {
  return key === 'weapon' ? '武器' : key === 'shield' ? '盾' : key === 'defense' ? '防具/装飾' : key;
}

function mapSlot(equip, category) {
  const raw = str(equip);
  const s = raw.replace(/\s+/g, ' ');
  if (category === 'weapon' || /右手|左手|弾|矢|銃弾|投げ/.test(s)) {
    if (/右手/.test(s)) return '武器: 右手';
    if (/左手/.test(s)) return '武器: 左手';
    if (/弾|矢|銃弾|投げ/.test(s)) return '武器: 弾丸';
  }
  const normalized = s.replace(/[（）]/g, m => m === '（' ? '(' : ')').replace(/装飾/g, '装').replace(/防具/g, '防');
  const accessoryHint = /装|\(装\)|（装）/.test(raw);
  const armorHint = /防|\(防\)|（防）/.test(raw) || category === 'shield';
  if (/頭/.test(normalized)) return accessoryHint && !armorHint ? '装飾: 頭' : '防具: 頭';
  if (/顔/.test(normalized)) return '装飾: 顔';
  if (/耳/.test(normalized)) return '装飾: 耳';
  if (/指/.test(normalized)) return '装飾: 指';
  if (/胸/.test(normalized)) return '装飾: 胸';
  if (/背中|背/.test(normalized)) return '装飾: 背中';
  if (/腰/.test(normalized)) return accessoryHint && !armorHint ? '装飾: 腰' : '防具: 腰';
  if (/胴|胸当|鎧|よろい|アーマー/.test(normalized)) return '防具: 胴';
  if (/パンツ|ズボン|下半身/.test(normalized)) return '防具: パンツ';
  if (/靴|足/.test(normalized)) return '防具: 靴';
  if (/肩/.test(normalized)) return '防具: 肩';
  if (/手|腕|グローブ/.test(normalized)) return '防具: 手';
  if (category === 'shield') return '武器: 左手';
  return '';
}

const OFFICIAL_ADD_STATUS_TO_TOOL_STAT = Object.freeze({
  "攻撃力": "attack",
  "魔力": "magic",
  "移動速度": "speed",
  "速度": "speed",

  "最大HP": "extraHP",
  "HP": "extraHP",
  "最大ＭＰ": "extraMP",
  "最大MP": "extraMP",
  "MP": "extraMP",
  "最大ＳＴ": "extraST",
  "最大ST": "extraST",
  "ST": "extraST",
  "防御力": "extraAC",
  "アーマークラス": "extraAC",
  "AC": "extraAC",
  "最大重量": "extraMaxWeight",
  "重量": "extraMaxWeight",
  "命中": "extraHit",
  "回避": "extraAvoid",

  "攻撃ディレイ": "extraAttackDelay",
  "魔法ディレイ": "extraMagicDelay",

  "耐火属性": "extraFireRes",
  "火耐性": "extraFireRes",
  "火属性抵抗": "extraFireRes",
  "耐水属性": "extraWaterRes",
  "水耐性": "extraWaterRes",
  "水属性抵抗": "extraWaterRes",
  "耐地属性": "extraEarthRes",
  "地耐性": "extraEarthRes",
  "地属性抵抗": "extraEarthRes",
  "耐風属性": "extraWindRes",
  "風耐性": "extraWindRes",
  "風属性抵抗": "extraWindRes",
  "耐無属性": "extraNeutralRes",
  "無耐性": "extraNeutralRes",
  "無属性抵抗": "extraNeutralRes",

  "BREATH": "extraBreath",
  "HEARING": "extraHearing",
  "SEEING": "extraSeeing",
  "SMELLING": "extraSmelling",
  "満腹度": "extraFullness",
  "潤喉度": "extraThirst",
  "盗み補正": "extraSteal",
  "ピッキング失敗回数補正": "extraLockpickingFail",
  "牙攻撃補正": "extraFangAttack",
  "釣りゲージ長": "extraFishingGaugeLength",
  "釣りヒットゾーン": "extraFishingHitZone",
  "鍛冶グレードゾーン": "extraSmithingGradeZone",
  "鍛冶ゲージ滑り": "extraSmithingGaugeSlip",
  "鍛冶ヒットゾーン": "extraSmithingHitZone",
  "大工グレードゾーン": "extraCarpentryGradeZone",
  "大工ゲージ滑り": "extraCarpentryGaugeSlip",
  "大工ヒットゾーン": "extraCarpentryHitZone",
  "裁縫グレードゾーン": "extraTailoringGradeZone",
  "裁縫ゲージ滑り": "extraTailoringGaugeSlip",
  "裁縫ヒットゾーン": "extraTailoringHitZone",
  "装飾細工グレードゾーン": "extraDecorationGradeZone",
  "装飾細工ゲージ滑り": "extraDecorationGaugeSlip",
  "装飾細工ヒットゾーン": "extraDecorationHitZone",
  "料理グレードゾーン": "extraCookingGradeZone",
  "料理ゲージ滑り": "extraCookingGaugeSlip",
  "料理ヒットゾーン": "extraCookingHitZone",
  "醸造グレードゾーン": "extraBrewingGradeZone",
  "醸造ゲージ滑り": "extraBrewingGaugeSlip",
  "醸造ヒットゾーン": "extraBrewingHitZone",
  "薬調合グレードゾーン": "extraAlchemyGradeZone",
  "薬調合ゲージ滑り": "extraAlchemyGaugeSlip",
  "薬調合ヒットゾーン": "extraAlchemyHitZone",
  "複製グレードゾーン": "extraReplicationGradeZone",
  "複製ゲージ滑り": "extraReplicationGaugeSlip",
  "複製ヒットゾーン": "extraReplicationHitZone",
  "美容ゲージ滑り": "extraBeautyGaugeSlip",
  "美容ヒットゾーン": "extraBeautyHitZone"
});

const OFFICIAL_ADD_STATUS_KNOWN_IGNORED = Object.freeze(new Set([]));

const TOOL_STAT_DISPLAY_NAMES = Object.freeze({
  attack: "攻撃力",
  magic: "魔力",
  speed: "移動速度",
  extraAC: "AC",
  extraHP: "HP",
  extraMP: "MP",
  extraST: "ST",
  extraMaxWeight: "最大重量",
  extraHit: "命中",
  extraAvoid: "回避",
  extraAttackDelay: "攻撃ディレイ",
  extraMagicDelay: "魔法ディレイ",
  extraFireRes: "耐火属性",
  extraWaterRes: "耐水属性",
  extraEarthRes: "耐地属性",
  extraWindRes: "耐風属性",
  extraNeutralRes: "耐無属性",
  extraBreath: "BREATH",
  extraHearing: "HEARING",
  extraSeeing: "SEEING",
  extraSmelling: "SMELLING",
  extraFullness: "満腹度",
  extraThirst: "潤喉度",
  extraSteal: "盗み補正",
  extraLockpickingFail: "ピッキング失敗回数補正",
  extraFangAttack: "牙攻撃補正",
  extraFishingGaugeLength: "釣りゲージ長",
  extraFishingHitZone: "釣りヒットゾーン",
  extraSmithingGradeZone: "鍛冶グレードゾーン",
  extraSmithingGaugeSlip: "鍛冶ゲージ滑り",
  extraSmithingHitZone: "鍛冶ヒットゾーン",
  extraCarpentryGradeZone: "大工グレードゾーン",
  extraCarpentryGaugeSlip: "大工ゲージ滑り",
  extraCarpentryHitZone: "大工ヒットゾーン",
  extraTailoringGradeZone: "裁縫グレードゾーン",
  extraTailoringGaugeSlip: "裁縫ゲージ滑り",
  extraTailoringHitZone: "裁縫ヒットゾーン",
  extraDecorationGradeZone: "装飾細工グレードゾーン",
  extraDecorationGaugeSlip: "装飾細工ゲージ滑り",
  extraDecorationHitZone: "装飾細工ヒットゾーン",
  extraCookingGradeZone: "料理グレードゾーン",
  extraCookingGaugeSlip: "料理ゲージ滑り",
  extraCookingHitZone: "料理ヒットゾーン",
  extraBrewingGradeZone: "醸造グレードゾーン",
  extraBrewingGaugeSlip: "醸造ゲージ滑り",
  extraBrewingHitZone: "醸造ヒットゾーン",
  extraAlchemyGradeZone: "薬調合グレードゾーン",
  extraAlchemyGaugeSlip: "薬調合ゲージ滑り",
  extraAlchemyHitZone: "薬調合ヒットゾーン",
  extraReplicationGradeZone: "複製グレードゾーン",
  extraReplicationGaugeSlip: "複製ゲージ滑り",
  extraReplicationHitZone: "複製ヒットゾーン",
  extraBeautyGaugeSlip: "美容ゲージ滑り",
  extraBeautyHitZone: "美容ヒットゾーン"
});

function normalizeOfficialAddStatusName(name) {
  return str(name)
    .replace(/[＋]/g, '+')
    .replace(/[－−―]/g, '-')
    .replace(/[：]/g, ':')
    .replace(/[％]/g, '%')
    .replace(/　/g, ' ')
    .replace(/\s+/g, '')
    .replace(/^最大HP$/i, '最大HP')
    .replace(/^最大MP$/i, '最大MP')
    .replace(/^最大ST$/i, '最大ST')
    .trim();
}

function isKnownIgnoredStatus(name) {
  const n = normalizeOfficialAddStatusName(name);
  return !n || n === 'なし' || OFFICIAL_ADD_STATUS_KNOWN_IGNORED.has(n);
}


function deriveUtilityAddStatusKey(normalizedName) {
  const n = normalizedName || '';
  const craftMap = {
    '鍛冶': 'Smithing',
    '大工': 'Carpentry',
    '裁縫': 'Tailoring',
    '装飾細工': 'Decoration',
    '料理': 'Cooking',
    '醸造': 'Brewing',
    '薬調合': 'Alchemy',
    '複製': 'Replication',
  };
  for (const [jp, en] of Object.entries(craftMap)) {
    if (n === `${jp}グレードゾーン`) return `extra${en}GradeZone`;
    if (n === `${jp}ゲージ滑り`) return `extra${en}GaugeSlip`;
    if (n === `${jp}ヒットゾーン`) return `extra${en}HitZone`;
  }
  if (n === '美容ゲージ滑り') return 'extraBeautyGaugeSlip';
  if (n === '美容ヒットゾーン') return 'extraBeautyHitZone';
  if (n === '釣りゲージ長') return 'extraFishingGaugeLength';
  if (n === '釣りヒットゾーン') return 'extraFishingHitZone';
  return '';
}

function statusProp(name) {
  const n = normalizeOfficialAddStatusName(name);
  if (!n || n === 'なし' || isKnownIgnoredStatus(n)) return '';
  const utilityStatusKey = deriveUtilityAddStatusKey(n);
  if (utilityStatusKey) return utilityStatusKey;
  if (OFFICIAL_ADD_STATUS_TO_TOOL_STAT[n]) return OFFICIAL_ADD_STATUS_TO_TOOL_STAT[n];
  if (/攻撃力/.test(n)) return 'attack';
  if (/魔力/.test(n)) return 'magic';
  if (/移動速度|速度/.test(n)) return 'speed';
  if (/最大?HP/.test(n)) return 'extraHP';
  if (/最大?MP/.test(n)) return 'extraMP';
  if (/最大?ST/.test(n)) return 'extraST';
  if (/防御力|アーマークラス|AC/.test(n)) return 'extraAC';
  if (/最大重量|重量/.test(n)) return 'extraMaxWeight';
  if (/命中/.test(n)) return 'extraHit';
  if (/回避/.test(n)) return 'extraAvoid';
  if (/攻撃ディレイ/.test(n)) return 'extraAttackDelay';
  if (/魔法ディレイ/.test(n)) return 'extraMagicDelay';
  if (/耐火属性|火耐性|火属性抵抗/.test(n)) return 'extraFireRes';
  if (/耐水属性|水耐性|水属性抵抗/.test(n)) return 'extraWaterRes';
  if (/耐地属性|地耐性|地属性抵抗/.test(n)) return 'extraEarthRes';
  if (/耐風属性|風耐性|風属性抵抗/.test(n)) return 'extraWindRes';
  if (/耐無属性|無耐性|無属性抵抗/.test(n)) return 'extraNeutralRes';
  if (/BREATH/.test(n)) return 'extraBreath';
  if (/HEARING/.test(n)) return 'extraHearing';
  if (/SEEING/.test(n)) return 'extraSeeing';
  if (/SMELLING/.test(n)) return 'extraSmelling';
  if (/満腹度/.test(n)) return 'extraFullness';
  if (/潤喉度/.test(n)) return 'extraThirst';
  if (/盗み補正/.test(n)) return 'extraSteal';
  if (/ピッキング失敗回数補正/.test(n)) return 'extraLockpickingFail';
  if (/牙攻撃補正/.test(n)) return 'extraFangAttack';
  if (/釣りゲージ長/.test(n)) return 'extraFishingGaugeLength';
  if (/釣りヒットゾーン/.test(n)) return 'extraFishingHitZone';
  if (/鍛冶グレードゾーン/.test(n)) return 'extraSmithingGradeZone';
  if (/鍛冶ゲージ滑り/.test(n)) return 'extraSmithingGaugeSlip';
  if (/鍛冶ヒットゾーン/.test(n)) return 'extraSmithingHitZone';
  if (/大工グレードゾーン/.test(n)) return 'extraCarpentryGradeZone';
  if (/大工ゲージ滑り/.test(n)) return 'extraCarpentryGaugeSlip';
  if (/大工ヒットゾーン/.test(n)) return 'extraCarpentryHitZone';
  if (/裁縫グレードゾーン/.test(n)) return 'extraTailoringGradeZone';
  if (/裁縫ゲージ滑り/.test(n)) return 'extraTailoringGaugeSlip';
  if (/裁縫ヒットゾーン/.test(n)) return 'extraTailoringHitZone';
  if (/装飾細工グレードゾーン/.test(n)) return 'extraDecorationGradeZone';
  if (/装飾細工ゲージ滑り/.test(n)) return 'extraDecorationGaugeSlip';
  if (/装飾細工ヒットゾーン/.test(n)) return 'extraDecorationHitZone';
  if (/料理グレードゾーン/.test(n)) return 'extraCookingGradeZone';
  if (/料理ゲージ滑り/.test(n)) return 'extraCookingGaugeSlip';
  if (/料理ヒットゾーン/.test(n)) return 'extraCookingHitZone';
  if (/醸造グレードゾーン/.test(n)) return 'extraBrewingGradeZone';
  if (/醸造ゲージ滑り/.test(n)) return 'extraBrewingGaugeSlip';
  if (/醸造ヒットゾーン/.test(n)) return 'extraBrewingHitZone';
  if (/薬調合グレードゾーン/.test(n)) return 'extraAlchemyGradeZone';
  if (/薬調合ゲージ滑り/.test(n)) return 'extraAlchemyGaugeSlip';
  if (/薬調合ヒットゾーン/.test(n)) return 'extraAlchemyHitZone';
  if (/複製グレードゾーン/.test(n)) return 'extraReplicationGradeZone';
  if (/複製ゲージ滑り/.test(n)) return 'extraReplicationGaugeSlip';
  if (/複製ヒットゾーン/.test(n)) return 'extraReplicationHitZone';
  if (/美容ゲージ滑り/.test(n)) return 'extraBeautyGaugeSlip';
  if (/美容ヒットゾーン/.test(n)) return 'extraBeautyHitZone';
  return '';
}

function addToCountMap(map, key, value=1) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + value);
}

function mapToSortedObject(map) {
  return Object.fromEntries(Array.from(map.entries()).sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'ja')));
}


function reqNameValue_(v) {
  if (v == null) return '';
  if (typeof v === 'object') return str(v.name || v.label || v.id || '');
  return str(v);
}

function normalizeRequirementName(name) {
  return reqNameValue_(name).trim();
}

function dedupeRequirements(reqs) {
  const out = [];
  const seen = new Set();

  for (const req of reqs || []) {
    const name = normalizeRequirementName(req && req.name);
    const required = num(req && req.required);
    if (!name || !required) continue;

    const key = `${name}:${required}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name, required });
  }

  return out;
}

function parseRequirementText(skillText, fallbackLevel) {
  const text = str(skillText).trim();
  if (!text) return [];

  const reqs = [];

  // 例: 「こんぼう 100 筋力 100」「こんぼう100 / 筋力100」
  const explicit = [...text.matchAll(/([^\d\s\/、,＋+：:]+)\s*(\d+(?:\.\d+)?)/g)];
  if (explicit.length) {
    explicit.forEach(match => reqs.push({ name: match[1], required: Number(match[2]) }));
    return dedupeRequirements(reqs);
  }

  return dedupeRequirements(
    text
      .split(/[\/、,\s＋+]+/)
      .filter(Boolean)
      .map(name => ({ name, required: fallbackLevel }))
  );
}

function parseRequirementsJson(value) {
  const text = str(value).trim();
  if (!text || text === '[]') return [];

  try {
    const parsed = JSON.parse(text);
    const source = Array.isArray(parsed) ? parsed : [parsed];
    return dedupeRequirements(source.map(entry => {
      if (!entry || typeof entry !== 'object') return null;
      return {
        name: entry.name || entry.skill || entry.skillName || entry.requiredSkill || entry.label,
        required: entry.required ?? entry.value ?? entry.level ?? entry.need_level ?? entry.needLevel,
      };
    }).filter(Boolean));
  } catch (error) {
    return [];
  }
}

function equipmentRequirements(row, cat) {
  // 正本: Google Sheet に後追い追記した公式DB個別ページ由来の requirements_json。
  const fromJson = parseRequirementsJson(row.requirements_json || row.requirementsJson);
  if (fromJson.length) return fromJson;

  // 補助: requirements_text がある場合。
  const fromText = parseRequirementText(row.requirements_text || row.requirementsText, num(row.need_level));
  if (fromText.length) return fromText;

  // 互換: 旧列 requiredSkill + need_level。
  const fromRequiredSkill = parseRequirementText(row.requiredSkill || row.required_skill, num(row.need_level));
  if (fromRequiredSkill.length) return fromRequiredSkill;

  // 最後の保険: 武器一覧由来の主条件。複数条件は requirements_json 側で補う。
  if (cat === 'weapon') {
    const weaponType = normalizeRequirementName(row.weponType || row.weaponType);
    const level = num(row.need_level);
    if (weaponType && level) return [{ name: weaponType, required: level }];
  }

  return [];
}

function weaponReq(row) {
  return equipmentRequirements(row, 'weapon');
}

function jsonForJs(value) {
  return JSON.stringify(value, null, 2).replace(/<\/script/gi, '<\\/script');
}

function toCatalog(items, addStatuses, equipBuffs) {
  const statusMap = new Map();
  for (const st of addStatuses) {
    const cat = categoryKey(st.category);
    const key = `${cat}:${str(st.item_id)}`;
    if (!statusMap.has(key)) statusMap.set(key, []);
    const value = num(st.value);
    const statusName = str(st.status_name);
    if (!statusName || !value || statusName === 'なし') continue;
    const statKey = statusProp(statusName);
    const ignored = isKnownIgnoredStatus(statusName);
    statusMap.get(key).push({
      statusId: str(st.status_id),
      name: statusName,
      normalizedName: normalizeOfficialAddStatusName(statusName),
      statKey,
      statLabel: statKey ? TOOL_STAT_DISPLAY_NAMES[statKey] || statKey : '',
      value,
      mapped: !!statKey,
      ignored,
    });
  }

  const buffMap = new Map();
  const buffCatalog = new Map();
  for (const bf of equipBuffs) {
    const cat = categoryKey(bf.category);
    const itemKey = `${cat}:${str(bf.item_id)}`;
    const tid = str(bf.technic_id);
    if (!tid || tid === '0' || !str(bf.technic_name) || str(bf.technic_name) === 'なし') continue;
    const buffId = `technic-${tid}`;
    if (!buffMap.has(itemKey)) buffMap.set(itemKey, []);
    buffMap.get(itemKey).push(buffId);
    if (!buffCatalog.has(buffId)) {
      buffCatalog.set(buffId, {
        catalogId: buffId,
        id: buffId,
        officialTechnicId: num(tid),
        name: str(bf.technic_name),
        info: str(bf.technic_info),
        source: 'official-idb-sheet',
        sourceSheetUrl: CONFIG.sourceSheetUrl,
        sourceEquipmentIds: [],
        sourceEquipmentNames: [],
        parsedStats: {},
        conflictGroup: buffId,
        verified: false,
      });
    }
    const b = buffCatalog.get(buffId);
    const itemId = str(bf.item_id);
    const itemName = str(bf.item_name);
    if (itemId && !b.sourceEquipmentIds.includes(itemId)) b.sourceEquipmentIds.push(itemId);
    if (itemName && !b.sourceEquipmentNames.includes(itemName)) b.sourceEquipmentNames.push(itemName);
  }

  const equipment = [];
  for (const row of items) {
    const cat = categoryKey(row.category);
    if (!['weapon', 'defense', 'shield'].includes(cat)) continue;
    const id = str(row.id);
    const itemKey = `${cat}:${id}`;
    const statuses = statusMap.get(itemKey) || [];
    const extraStats = {};
    const unmappedAddStatuses = [];
    for (const st of statuses) {
      const prop = st.statKey || statusProp(st.name);
      if (prop) extraStats[prop] = +(extraStats[prop] || 0) + st.value;
      else if (!st.ignored) unmappedAddStatuses.push(`${st.name} ${st.value >= 0 ? '+' : ''}${st.value}`);
    }

    const buffRefs = buffMap.get(itemKey) || [];
    const firstBuff = buffRefs.length ? buffCatalog.get(buffRefs[0]) : null;
    const equip = str(row.equip);
    const catalogId = `official-${cat}-${id}`;
    equipment.push({
      catalogId,
      id: catalogId,
      officialId: num(id),
      category: cat,
      categoryLabel: categoryLabel(cat),
      name: str(row.name),
      info: str(row.info),
      slot: mapSlot(equip, cat),
      equip,
      equipGender: str(row.equipGender),
      equipRace: str(row.equipRace),
      itemType: str(row.itemType),
      requiredSkill: str(row.requiredSkill),
      needLevel: num(row.need_level),
      armorClass: num(row.armor_class),
      weaponDamage: num(row.damage),
      weaponAttackInterval: num(row.delay_time),
      weaponRange: num(row.range),
      weaponType: str(row.weponType),
      weaponHand: str(row.weponHand),
      requirements: equipmentRequirements(row, cat),
      weaponReq: cat === 'weapon' ? equipmentRequirements(row, cat) : [],
      technicId: num(row.technic_id),
      addStatuses: statuses,
      addStatusText: str(row.add_status_text),
      unmappedAddStatuses,
      extraStats,
      buffRefs,
      equipBuff: firstBuff ? { id: firstBuff.id, name: firstBuff.name, info: firstBuff.info } : null,
      source: 'official-idb-sheet',
      sourceUrl: str(row.source_url),
      sourceSheetUrl: CONFIG.sourceSheetUrl,
      fetchedAt: str(row.fetched_at),
      updatedAt: str(row.updated_at),
      verified: false,
    });
  }
  return { equipment, buffs: Array.from(buffCatalog.values()) };
}

async function main() {
  parseArgs();
  console.log(`[generator] ${GENERATOR_VERSION}`);
  console.log(`[load] ${CONFIG.inputDir ? CONFIG.inputDir : CONFIG.sourceSheetUrl}`);
  const [items, addStatuses, equipBuffs] = await Promise.all([
    loadSheet(SHEETS.items),
    loadSheet(SHEETS.addStatus),
    loadSheet(SHEETS.equipBuff),
  ]);
  console.log(`[rows] items=${items.length} add_status=${addStatuses.length} equip_buff=${equipBuffs.length}`);
  const { equipment, buffs } = toCatalog(items, addStatuses, equipBuffs);
  const mappedStatusCounts = new Map();
  const ignoredStatusCounts = new Map();
  const unmappedStatusCounts = new Map();
  equipment.forEach(item => {
    (item.addStatuses || []).forEach(st => {
      if (st.statKey) addToCountMap(mappedStatusCounts, `${st.name} -> ${st.statKey}`);
      else if (st.ignored) addToCountMap(ignoredStatusCounts, st.name);
      else addToCountMap(unmappedStatusCounts, st.name);
    });
  });
  await fs.mkdir(CONFIG.outDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const meta = {
    generatedAt,
    sourceSheetUrl: CONFIG.sourceSheetUrl,
    equipmentCount: equipment.length,
    buffCount: buffs.length,
    addStatusKeyMap: OFFICIAL_ADD_STATUS_TO_TOOL_STAT,
    knownIgnoredAddStatuses: Array.from(OFFICIAL_ADD_STATUS_KNOWN_IGNORED).sort((a, b) => String(a).localeCompare(String(b), 'ja')),
    mappedStatusCounts: mapToSortedObject(mappedStatusCounts),
    ignoredStatusCounts: mapToSortedObject(ignoredStatusCounts),
    unmappedStatusCounts: mapToSortedObject(unmappedStatusCounts),
  };
  await fs.writeFile(path.join(CONFIG.outDir, 'equipmentCatalog.generated.js'),
    `// Generated by tools/build-equipment-catalog-from-google-sheet.mjs\n// ${generatedAt}\nwindow.MOE_EQUIPMENT_CATALOG_META = ${jsonForJs(meta)};\nwindow.MOE_EQUIPMENT_CATALOG_GENERATED = ${jsonForJs(equipment)};\n`,
    'utf8');
  await fs.writeFile(path.join(CONFIG.outDir, 'buffCatalog.generated.js'),
    `// Generated by tools/build-equipment-catalog-from-google-sheet.mjs\n// ${generatedAt}\nwindow.MOE_BUFF_CATALOG_META = ${jsonForJs(meta)};\nwindow.MOE_BUFF_CATALOG_GENERATED = ${jsonForJs(buffs)};\n`,
    'utf8');
  console.log(`[write] ${CONFIG.outDir}/equipmentCatalog.generated.js (${equipment.length} items)`);
  console.log(`[write] ${CONFIG.outDir}/buffCatalog.generated.js (${buffs.length} buffs)`);
  const ignored = Object.keys(meta.ignoredStatusCounts || {});
  if (ignored.length) {
    console.log(`[info] 既知の非対象add_status: ${ignored.length}種類 / ${Object.values(meta.ignoredStatusCounts).reduce((a, b) => a + b, 0)}件`);
  }
  const unmapped = Object.keys(meta.unmappedStatusCounts || {});
  if (unmapped.length) {
    console.warn(`[warn] 未対応add_status: ${unmapped.join(', ')}`);
  } else {
    console.log('[ok] 計算対象add_status はすべてツール内部ステータスキーへ変換できました');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
