#!/usr/bin/env node
/**
 * Master of Epic 公式DBスプレッドシート → ツール用カタログ生成
 * v0.1.0
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
  const res = await fetch(url, { headers: { 'User-Agent': 'MoE equipment catalog generator/0.1.0' } });
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

function statusProp(name) {
  const n = str(name);
  if (/攻撃力/.test(n)) return 'attack';
  if (/魔力/.test(n)) return 'magic';
  if (/移動速度|速度/.test(n)) return 'speed';
  if (/最大HP|HP/.test(n)) return 'extraHP';
  if (/最大MP|MP/.test(n)) return 'extraMP';
  if (/最大ST|ST/.test(n)) return 'extraST';
  if (/最大重量|重量/.test(n)) return 'extraMaxWeight';
  if (/命中/.test(n)) return 'extraHit';
  if (/回避/.test(n)) return 'extraAvoid';
  if (/防御力|アーマークラス|AC/.test(n)) return 'extraAC';
  if (/攻撃ディレイ/.test(n)) return 'extraAttackDelay';
  if (/魔法ディレイ/.test(n)) return 'extraMagicDelay';
  if (/耐火属性|火耐性|火属性抵抗/.test(n)) return 'extraFireRes';
  if (/耐水属性|水耐性|水属性抵抗/.test(n)) return 'extraWaterRes';
  if (/耐地属性|地耐性|地属性抵抗/.test(n)) return 'extraEarthRes';
  if (/耐風属性|風耐性|風属性抵抗/.test(n)) return 'extraWindRes';
  if (/耐無属性|無耐性|無属性抵抗/.test(n)) return 'extraNeutralRes';
  return '';
}

function weaponReq(row) {
  const skill = str(row.requiredSkill);
  const level = num(row.need_level);
  if (!skill) return [];
  return skill.split(/[\/、,\s]+/).filter(Boolean).map(name => ({ name, required: level }));
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
    if (!str(st.status_name) || !value || str(st.status_name) === 'なし') continue;
    statusMap.get(key).push({
      statusId: str(st.status_id),
      name: str(st.status_name),
      value,
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
    for (const st of statuses) {
      const prop = statusProp(st.name);
      if (prop) extraStats[prop] = +(extraStats[prop] || 0) + st.value;
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
      weaponReq: cat === 'weapon' ? weaponReq(row) : [],
      technicId: num(row.technic_id),
      addStatuses: statuses,
      addStatusText: str(row.add_status_text),
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
  console.log(`[load] ${CONFIG.inputDir ? CONFIG.inputDir : CONFIG.sourceSheetUrl}`);
  const [items, addStatuses, equipBuffs] = await Promise.all([
    loadSheet(SHEETS.items),
    loadSheet(SHEETS.addStatus),
    loadSheet(SHEETS.equipBuff),
  ]);
  console.log(`[rows] items=${items.length} add_status=${addStatuses.length} equip_buff=${equipBuffs.length}`);
  const { equipment, buffs } = toCatalog(items, addStatuses, equipBuffs);
  await fs.mkdir(CONFIG.outDir, { recursive: true });
  const generatedAt = new Date().toISOString();
  const meta = { generatedAt, sourceSheetUrl: CONFIG.sourceSheetUrl, equipmentCount: equipment.length, buffCount: buffs.length };
  await fs.writeFile(path.join(CONFIG.outDir, 'equipmentCatalog.generated.js'),
    `// Generated by tools/build-equipment-catalog-from-google-sheet.mjs\n// ${generatedAt}\nwindow.MOE_EQUIPMENT_CATALOG_META = ${jsonForJs(meta)};\nwindow.MOE_EQUIPMENT_CATALOG_GENERATED = ${jsonForJs(equipment)};\n`,
    'utf8');
  await fs.writeFile(path.join(CONFIG.outDir, 'buffCatalog.generated.js'),
    `// Generated by tools/build-equipment-catalog-from-google-sheet.mjs\n// ${generatedAt}\nwindow.MOE_BUFF_CATALOG_META = ${jsonForJs(meta)};\nwindow.MOE_BUFF_CATALOG_GENERATED = ${jsonForJs(buffs)};\n`,
    'utf8');
  console.log(`[write] ${CONFIG.outDir}/equipmentCatalog.generated.js (${equipment.length} items)`);
  console.log(`[write] ${CONFIG.outDir}/buffCatalog.generated.js (${buffs.length} buffs)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
