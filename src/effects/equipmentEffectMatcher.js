import { REFERENCE_EFFECT_CATALOG } from '../data/generated/referenceEffectCatalog.generated.js';
import { REFERENCE_EQUIPMENT_BUFF_INDEX } from '../data/generated/referenceEquipmentBuffIndex.generated.js';
import { EFFECT_STAT_SCHEMA } from '../data/effects/effectStatSchema.js';

const el = (id) => document.getElementById(id);

const state = {
  items: [],
  selectedId: '',
  lastRun: null
};

const DIRECT_FIELD_MAP = new Map([
  ['攻撃力', { stat: 'attack', mode: 'flat' }],
  ['攻撃力修正', { stat: 'attack', mode: 'flat' }],
  ['攻撃力(バフ)', { stat: 'attack', mode: 'flat' }],
  ['攻撃力+', { stat: 'attack', mode: 'flat' }],
  ['ATK', { stat: 'attack', mode: 'flat' }],
  ['atk', { stat: 'attack', mode: 'flat' }],
  ['attack', { stat: 'attack', mode: 'flat' }],
  ['攻撃力(％)', { stat: 'attack', mode: 'percent' }],
  ['攻撃力%', { stat: 'attack', mode: 'percent' }],
  ['atk_pct', { stat: 'attack', mode: 'percent' }],

  ['命中', { stat: 'hit', mode: 'flat' }],
  ['命中修正', { stat: 'hit', mode: 'flat' }],
  ['命中(バフ)', { stat: 'hit', mode: 'flat' }],
  ['hit', { stat: 'hit', mode: 'flat' }],
  ['命中(％)', { stat: 'hit', mode: 'percent' }],
  ['命中%', { stat: 'hit', mode: 'percent' }],

  ['攻撃ディレイ', { stat: 'attackDelay', mode: 'percent' }],
  ['攻撃ディレイ(％)', { stat: 'attackDelay', mode: 'percent' }],
  ['delay', { stat: 'attackDelay', mode: 'percent' }],
  ['attackDelay', { stat: 'attackDelay', mode: 'percent' }],

  ['クリティカル', { stat: 'critRate', mode: 'flat' }],
  ['クリティカル率', { stat: 'critRate', mode: 'flat' }],
  ['crit', { stat: 'critRate', mode: 'flat' }],
  ['critRate', { stat: 'critRate', mode: 'flat' }],
  ['crit_rate', { stat: 'critRate', mode: 'flat' }],

  ['魔力', { stat: 'magic', mode: 'flat' }],
  ['魔力修正', { stat: 'magic', mode: 'flat' }],
  ['魔力(バフ)', { stat: 'magic', mode: 'flat' }],
  ['mag', { stat: 'magic', mode: 'flat' }],
  ['魔力(％)', { stat: 'magic', mode: 'percent' }],
  ['mag_pct', { stat: 'magic', mode: 'percent' }],

  ['最大HP', { stat: 'hp', mode: 'flat' }],
  ['HP', { stat: 'hp', mode: 'flat' }],
  ['HP(基礎)', { stat: 'hp', mode: 'flat' }],
  ['hp', { stat: 'hp', mode: 'flat' }],
  ['最大MP', { stat: 'mp', mode: 'flat' }],
  ['MP', { stat: 'mp', mode: 'flat' }],
  ['MP(基礎)', { stat: 'mp', mode: 'flat' }],
  ['mp', { stat: 'mp', mode: 'flat' }],
  ['最大ST', { stat: 'st', mode: 'flat' }],
  ['ST', { stat: 'st', mode: 'flat' }],
  ['ST(基礎)', { stat: 'st', mode: 'flat' }],
  ['st', { stat: 'st', mode: 'flat' }],

  ['AC', { stat: 'ac', mode: 'flat' }],
  ['AC(基礎)', { stat: 'ac', mode: 'flat' }],
  ['防御力', { stat: 'ac', mode: 'flat' }],
  ['ac', { stat: 'ac', mode: 'flat' }],
  ['防御力(％)', { stat: 'ac', mode: 'percent' }],
  ['AC(％)', { stat: 'ac', mode: 'percent' }],

  ['回避', { stat: 'avoid', mode: 'flat' }],
  ['回避修正', { stat: 'avoid', mode: 'flat' }],
  ['回避(バフ)', { stat: 'avoid', mode: 'flat' }],
  ['攻撃回避', { stat: 'avoid', mode: 'flat' }],
  ['avoid', { stat: 'avoid', mode: 'flat' }],

  ['移動速度', { stat: 'moveSpeed', mode: 'flat' }],
  ['speed', { stat: 'moveSpeed', mode: 'flat' }],
  ['重量', { stat: 'weight', mode: 'flat' }],
  ['最大重量', { stat: 'weight', mode: 'flat' }],
  ['weight', { stat: 'weight', mode: 'flat' }],

  ['火抵抗', { stat: 'resistFire', mode: 'flat' }],
  ['火耐性', { stat: 'resistFire', mode: 'flat' }],
  ['水抵抗', { stat: 'resistWater', mode: 'flat' }],
  ['水耐性', { stat: 'resistWater', mode: 'flat' }],
  ['風抵抗', { stat: 'resistWind', mode: 'flat' }],
  ['風耐性', { stat: 'resistWind', mode: 'flat' }],
  ['地抵抗', { stat: 'resistEarth', mode: 'flat' }],
  ['地耐性', { stat: 'resistEarth', mode: 'flat' }],
  ['無抵抗', { stat: 'resistMagic', mode: 'flat' }],
  ['無耐性', { stat: 'resistMagic', mode: 'flat' }]
]);

const STAT_TEXT_PATTERNS = [
  [/攻撃力\s*([+-]?\d+(?:\.\d+)?)/g, 'attack', 'flat'],
  [/命中\s*([+-]?\d+(?:\.\d+)?)/g, 'hit', 'flat'],
  [/回避\s*([+-]?\d+(?:\.\d+)?)/g, 'avoid', 'flat'],
  [/魔力\s*([+-]?\d+(?:\.\d+)?)/g, 'magic', 'flat'],
  [/攻撃ディレイ\s*([+-]?\d+(?:\.\d+)?)/g, 'attackDelay', 'percent'],
  [/クリティカル(?:率)?\s*([+-]?\d+(?:\.\d+)?)/g, 'critRate', 'flat'],
  [/最大?HP\s*([+-]?\d+(?:\.\d+)?)/g, 'hp', 'flat'],
  [/最大?MP\s*([+-]?\d+(?:\.\d+)?)/g, 'mp', 'flat'],
  [/最大?ST\s*([+-]?\d+(?:\.\d+)?)/g, 'st', 'flat'],
  [/防御力\s*([+-]?\d+(?:\.\d+)?)/g, 'ac', 'flat'],
  [/AC\s*([+-]?\d+(?:\.\d+)?)/g, 'ac', 'flat'],
  [/耐火属性\s*([+-]?\d+(?:\.\d+)?)/g, 'resistFire', 'flat'],
  [/耐水属性\s*([+-]?\d+(?:\.\d+)?)/g, 'resistWater', 'flat'],
  [/耐風属性\s*([+-]?\d+(?:\.\d+)?)/g, 'resistWind', 'flat'],
  [/耐地属性\s*([+-]?\d+(?:\.\d+)?)/g, 'resistEarth', 'flat'],
  [/耐無属性\s*([+-]?\d+(?:\.\d+)?)/g, 'resistMagic', 'flat'],
  [/移動速度\s*([+-]?\d+(?:\.\d+)?)/g, 'moveSpeed', 'flat'],
  [/最大重量\s*([+-]?\d+(?:\.\d+)?)/g, 'weight', 'flat']
];

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function compact(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[\s　_\-・:：［］\[\]（）()<>＜＞"'“”‘’]/g, '');
}

function asNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value.replace(/,/g, '').trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function statLabel(stat) {
  return EFFECT_STAT_SCHEMA[stat]?.label || stat || 'unknown';
}

function effectLabel(effect) {
  const stat = statLabel(effect.stat);
  const value = Number(effect.value ?? 0);
  if (effect.mode === 'flat') return `${stat} ${value > 0 ? '+' : ''}${value}`;
  if (effect.mode === 'percent') return `${stat} ${value > 0 ? '+' : ''}${value}%`;
  if (effect.mode === 'coefficient') return `${stat} 係数 ${value}`;
  if (effect.mode === 'namedGroup') return `${effect.group || effect.sourceField || stat}: ${value}`;
  if (effect.mode === 'formula') return `${stat} 式`;
  if (effect.mode === 'conversion') return `${effect.sourceStat || '?'} → ${effect.stat || '?'} ${effect.rate || effect.value || ''}`;
  return `${stat} ${effect.mode || ''}`;
}

function normalizeItem(raw, meta = {}) {
  const item = raw && typeof raw === 'object' ? raw : { name: String(raw ?? '') };
  const name = item.name || item.itemName || item['名称'] || item['名前'] || item.label || item.title || '';
  const slot = item.slot || item.type || item.part || item['部位'] || item.category || '';
  const buffName = item.buffName || item.Buff || item.buff || item['Buff'] || item['付加効果'] || item.addEffectName || '';
  const buffInfo = item.buffInfo || item.BuffInfo || item['BuffInfo'] || item['追加効果'] || item.description || item.note || item.memo || '';
  const buffStatsText = item.buffStatsText || item.BuffStats || item['BuffStats'] || item.add_status || item.addStatus || item['追加効果ステータス'] || '';
  const id = item.id || item.itemId || item.uid || `${meta.source || 'src'}:${meta.index ?? Math.random().toString(36).slice(2)}`;
  const directEffects = extractDirectEffects(item, buffStatsText);
  const unsupportedTexts = [buffInfo].filter(Boolean);

  return {
    id: String(id),
    source: meta.source || 'unknown',
    sourceKey: meta.sourceKey || '',
    name: String(name || '(名称なし)'),
    slot: String(slot || ''),
    buffName: String(buffName || ''),
    buffInfo: String(buffInfo || ''),
    buffStatsText: String(buffStatsText || ''),
    directEffects,
    unsupportedTexts,
    raw: item
  };
}

function extractDirectEffects(item, buffStatsText = '') {
  const effects = [];
  for (const [field, mapping] of DIRECT_FIELD_MAP.entries()) {
    if (!Object.prototype.hasOwnProperty.call(item, field)) continue;
    const value = asNumber(item[field]);
    if (value === null || value === 0) continue;
    effects.push({ ...mapping, value, sourceField: field });
  }

  const text = String(buffStatsText || '');
  for (const [regex, stat, mode] of STAT_TEXT_PATTERNS) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const value = asNumber(match[1]);
      if (value !== null && value !== 0) {
        effects.push({ stat, mode, value, sourceField: 'BuffStats' });
      }
    }
  }

  return effects;
}

function looksEquipmentLike(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const name = obj.name || obj.itemName || obj['名称'] || obj['名前'] || obj.label || obj.title;
  if (!name || typeof name !== 'string') return false;

  const keys = Object.keys(obj);
  const hasKnownField = keys.some((key) => DIRECT_FIELD_MAP.has(key) || [
    'Buff', 'buff', 'buffName', 'BuffInfo', 'buffInfo', 'BuffStats', 'buffStatsText',
    'add_status', 'addStatus', 'slot', 'part', 'type', 'category', '部位', 'memo', 'note'
  ].includes(key));

  if (hasKnownField) return true;

  // A lightweight fallback for saved equipment rows that only have name + a few flags.
  return keys.some((key) => /slot|part|equip|weapon|armor|accessory|buff|status|stat/i.test(key));
}

function collectEquipmentObjects(root, sourceKey) {
  const found = [];
  const seen = new WeakSet();
  let visited = 0;
  const maxVisited = 25000;

  function walk(value, path) {
    if (visited++ > maxVisited) return;
    if (!value || typeof value !== 'object') return;
    if (seen.has(value)) return;
    seen.add(value);

    if (looksEquipmentLike(value)) {
      found.push({ raw: value, path });
    }

    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${path}[${i}]`));
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      if (typeof child === 'object' && child !== null) walk(child, `${path}.${key}`);
    }
  }

  walk(root, sourceKey);
  return found;
}

function parseLocalStorageItems() {
  const items = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    if (!value) continue;
    const trimmed = value.trim();
    if (!trimmed || !/^[\[{]/.test(trimmed)) continue;
    try {
      const json = JSON.parse(trimmed);
      const candidates = collectEquipmentObjects(json, `localStorage:${key}`);
      candidates.forEach((candidate, index) => {
        items.push(normalizeItem(candidate.raw, {
          source: 'localStorage',
          sourceKey: `${key} ${candidate.path}`,
          index
        }));
      });
    } catch {
      // Not JSON. Ignore.
    }
  }
  return dedupeItems(items);
}

function parsePastedJson(text) {
  const json = JSON.parse(text);
  const candidates = collectEquipmentObjects(json, 'pasteJson');
  return dedupeItems(candidates.map((candidate, index) => normalizeItem(candidate.raw, {
    source: 'pasteJson',
    sourceKey: candidate.path,
    index
  })));
}

function parseTsvLine(line) {
  const cells = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === '\t' && !quoted) {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

function parsePastedTsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const header = parseTsvLine(lines[0]).map((h) => h.trim());
  const hasHeader = header.some((h) => /名前|名称|name|Buff|部位|slot|攻撃|命中|ディレイ/i.test(h));
  const rows = hasHeader ? lines.slice(1) : lines;
  const fallbackHeader = ['name', 'slot', 'buffName', 'buffInfo', 'buffStatsText', 'memo'];
  const keys = hasHeader ? header : fallbackHeader;
  return dedupeItems(rows.map((line, index) => {
    const cells = parseTsvLine(line);
    const obj = {};
    keys.forEach((key, i) => { obj[key || `col${i + 1}`] = cells[i] ?? ''; });
    return normalizeItem(obj, { source: 'pasteTsv', sourceKey: `line ${index + 1}`, index });
  }).filter((item) => item.name && item.name !== '(名称なし)'));
}

function parseManualNames(text) {
  return dedupeItems(text.split(/\r?\n/).map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return null;
    const [name, buffName] = trimmed.split(/\t|,/).map((s) => s?.trim() || '');
    return normalizeItem({ name, buffName: buffName || '' }, { source: 'manualNames', sourceKey: `line ${index + 1}`, index });
  }).filter(Boolean));
}

function dedupeItems(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = compact([item.name, item.slot, item.buffName, item.buffStatsText, item.sourceKey].join('|'));
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function scoreCandidate(item, candidate, mode) {
  const itemName = compact(item.name);
  const itemBuff = compact(item.buffName);
  const itemStats = compact(item.buffStatsText);
  const itemInfo = compact(item.buffInfo);
  const cItem = compact(candidate.itemName || candidate.name);
  const cBuff = compact(candidate.buffName || candidate.name);
  const cStats = compact(candidate.buffStatsText || '');
  const cInfo = compact(candidate.buffInfo || candidate.summary?.description || '');

  let score = 0;
  const reasons = [];
  const exactWeight = mode === 'exact' ? 1.15 : 1;
  const looseWeight = mode === 'loose' ? 1.15 : 1;

  if (itemName && cItem && itemName === cItem) { score += 100 * exactWeight; reasons.push('装備名 完全一致'); }
  else if (itemName && cItem && (itemName.includes(cItem) || cItem.includes(itemName))) { score += 72 * looseWeight; reasons.push('装備名 部分一致'); }

  if (itemBuff && cBuff && itemBuff === cBuff) { score += 86 * exactWeight; reasons.push('Buff名 完全一致'); }
  else if (itemBuff && cBuff && (itemBuff.includes(cBuff) || cBuff.includes(itemBuff))) { score += 58 * looseWeight; reasons.push('Buff名 部分一致'); }

  if (itemStats && cStats && (itemStats.includes(cStats) || cStats.includes(itemStats))) { score += 30 * looseWeight; reasons.push('効果テキスト 類似'); }
  if (itemInfo && cInfo && (itemInfo.includes(cInfo) || cInfo.includes(itemInfo))) { score += 22 * looseWeight; reasons.push('説明 類似'); }

  const candidateEffects = Array.isArray(candidate.effects) ? candidate.effects : [];
  const directStats = new Set(item.directEffects.map((effect) => effect.stat));
  const sharedStats = candidateEffects.filter((effect) => directStats.has(effect.stat)).length;
  if (sharedStats) { score += Math.min(18, sharedStats * 6); reasons.push(`同系統効果 ${sharedStats}件`); }

  return { score: Math.min(100, Math.round(score)), reasons };
}

function buildReferenceCandidates() {
  const equipment = REFERENCE_EQUIPMENT_BUFF_INDEX.map((entry, index) => ({
    kind: 'equipment-index',
    refKey: `equipment:${entry.itemId || entry.itemName || index}`,
    title: entry.itemName || '(装備名なし)',
    subtitle: `${entry.slot || 'slot?'} / Buff: ${entry.buffName || 'なし'}`,
    description: entry.buffInfo || entry.buffStatsText || '',
    ...entry
  }));

  const effects = REFERENCE_EFFECT_CATALOG.map((entry, index) => ({
    kind: 'effect-catalog',
    refKey: `effect:${entry.id || entry.name || index}`,
    title: entry.name || '(効果名なし)',
    subtitle: `${entry.kind || 'effect'} / ${entry.verificationStatus || 'reference'}`,
    description: entry.summary?.description || '',
    ...entry
  }));

  return { equipment, effects };
}

function matchItem(item, allCandidates, mode, minScore) {
  const candidates = [];
  for (const candidate of allCandidates.equipment) {
    const scored = scoreCandidate(item, candidate, mode);
    if (scored.score >= minScore) candidates.push({ ...candidate, ...scored });
  }
  for (const candidate of allCandidates.effects) {
    const scored = scoreCandidate(item, candidate, mode);
    if (scored.score >= minScore) candidates.push({ ...candidate, ...scored });
  }

  candidates.sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title), 'ja'));
  return candidates;
}

function runMatch() {
  const source = el('dataSource').value;
  const mode = el('matchMode').value;
  const minScore = Number(el('minScore').value) || 0;
  const limit = Number(el('limit').value) || 80;
  const text = el('pasteArea').value;
  let items = [];

  try {
    if (source === 'localStorage') items = parseLocalStorageItems();
    if (source === 'pasteJson') items = parsePastedJson(text);
    if (source === 'pasteTsv') items = parsePastedTsv(text);
    if (source === 'manualNames') items = parseManualNames(text);
  } catch (error) {
    el('itemList').innerHTML = `<div class="card"><div class="title">解析エラー</div><p class="muted">${esc(error.message || error)}</p></div>`;
    el('summary').innerHTML = '';
    el('detail').innerHTML = '<span class="muted">入力内容を確認してください。</span>';
    return;
  }

  const allCandidates = buildReferenceCandidates();
  items = items.map((item) => ({
    ...item,
    matches: matchItem(item, allCandidates, mode, minScore).slice(0, limit)
  }));

  state.items = items;
  state.selectedId = items[0]?.id || '';
  state.lastRun = { source, mode, minScore, limit };
  render();
}

function filteredItems() {
  const q = compact(el('filterText').value);
  const kind = el('filterKind').value;
  return state.items.filter((item) => {
    if (kind === 'matched' && !item.matches.length) return false;
    if (kind === 'unmatched' && item.matches.length) return false;
    if (kind === 'direct' && !item.directEffects.length) return false;
    if (kind === 'unsupported' && !(item.buffInfo || item.unsupportedTexts.length)) return false;
    if (!q) return true;
    const haystack = compact([
      item.name, item.slot, item.buffName, item.buffInfo, item.buffStatsText,
      item.matches.map((m) => [m.title, m.buffName, m.description].join(' ')).join(' ')
    ].join(' '));
    return haystack.includes(q);
  });
}

function renderSummary() {
  const items = state.items;
  const matched = items.filter((item) => item.matches.length).length;
  const direct = items.filter((item) => item.directEffects.length).length;
  const unsupported = items.filter((item) => item.buffInfo || item.unsupportedTexts.length).length;
  const totalMatches = items.reduce((sum, item) => sum + item.matches.length, 0);
  el('summary').innerHTML = [
    `<span class="pill">装備候補 ${items.length}</span>`,
    `<span class="pill good">一致候補あり ${matched}</span>`,
    `<span class="pill">直接効果あり ${direct}</span>`,
    `<span class="pill warn">説明/未対応あり ${unsupported}</span>`,
    `<span class="pill">候補合計 ${totalMatches}</span>`,
    state.lastRun ? `<span class="pill">最小スコア ${state.lastRun.minScore}</span>` : ''
  ].join('');
}

function renderItemList() {
  const items = filteredItems();
  if (!items.length) {
    el('itemList').innerHTML = '<div class="card muted">表示できる装備がありません。</div>';
    return;
  }
  el('itemList').innerHTML = items.map((item) => {
    const top = item.matches[0];
    const active = item.id === state.selectedId ? ' active' : '';
    const effects = item.directEffects.slice(0, 6).map((effect) => `<span class="effect-chip">${esc(effectLabel(effect))}</span>`).join('');
    return `<div class="card item-card${active}" data-id="${esc(item.id)}">
      <div class="title-row">
        <div>
          <div class="title">${esc(item.name)}</div>
          <div class="small muted">${esc(item.slot || '部位不明')} / Buff: ${esc(item.buffName || 'なし')}</div>
        </div>
        <div class="match-score">${top ? `最高 ${top.score}` : '候補なし'}</div>
      </div>
      ${item.buffStatsText ? `<div class="small muted">${esc(item.buffStatsText)}</div>` : ''}
      ${effects ? `<div class="effect-list">${effects}</div>` : ''}
    </div>`;
  }).join('');

  el('itemList').querySelectorAll('.item-card').forEach((node) => {
    node.addEventListener('click', () => {
      state.selectedId = node.dataset.id;
      render();
    });
  });
}

function renderEffectTable(effects = []) {
  if (!effects.length) return '<p class="muted">正規化済み効果はありません。</p>';
  return `<table>
    <thead><tr><th>stat</th><th>表示</th><th>mode</th><th>元フィールド</th></tr></thead>
    <tbody>${effects.map((effect) => `<tr>
      <td>${esc(effect.stat || '')}</td>
      <td>${esc(effectLabel(effect))}</td>
      <td>${esc(effect.mode || '')}</td>
      <td>${esc(effect.sourceField || effect.sourceFields?.join('+') || effect.group || '')}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderMatch(match) {
  const effects = Array.isArray(match.effects) ? match.effects : [];
  const rawNonZeroFields = match.rawNonZeroFields && Object.keys(match.rawNonZeroFields).length
    ? `<details><summary>rawNonZeroFields</summary><pre>${esc(JSON.stringify(match.rawNonZeroFields, null, 2))}</pre></details>` : '';
  const unsupportedFields = match.unsupportedFields && Object.keys(match.unsupportedFields).length
    ? `<details><summary>unsupportedFields</summary><pre>${esc(JSON.stringify(match.unsupportedFields, null, 2))}</pre></details>` : '';
  return `<div class="card">
    <div class="title-row">
      <div>
        <div class="title">${esc(match.title || match.itemName || match.name)}</div>
        <div class="small muted">${esc(match.kind)} / score ${esc(match.score)} / ${esc((match.reasons || []).join(', '))}</div>
      </div>
      <span class="pill ${match.kind === 'effect-catalog' ? 'warn' : 'good'}">${match.kind === 'effect-catalog' ? '効果候補' : '装備索引'}</span>
    </div>
    ${match.description ? `<p>${esc(match.description)}</p>` : ''}
    ${match.buffStatsText ? `<p class="small muted">BuffStats: ${esc(match.buffStatsText)}</p>` : ''}
    ${renderEffectTable(effects)}
    ${rawNonZeroFields}
    ${unsupportedFields}
  </div>`;
}

function renderDetail() {
  const item = state.items.find((it) => it.id === state.selectedId);
  if (!item) {
    el('detail').innerHTML = '<span class="muted">左の一覧から装備を選んでください。</span>';
    return;
  }

  const matchesHtml = item.matches.length
    ? item.matches.slice(0, 12).map(renderMatch).join('')
    : '<div class="card muted">参考データ側の候補は見つかりませんでした。</div>';

  el('detail').innerHTML = `<div class="card">
    <h3>${esc(item.name)}</h3>
    <div class="summary">
      <span class="pill">部位 ${esc(item.slot || '不明')}</span>
      <span class="pill">Buff ${esc(item.buffName || 'なし')}</span>
      <span class="pill">直接効果 ${item.directEffects.length}</span>
      <span class="pill">一致候補 ${item.matches.length}</span>
      <span class="pill">${esc(item.source)}</span>
    </div>
    ${item.buffInfo ? `<p>${esc(item.buffInfo)}</p>` : ''}
    ${item.buffStatsText ? `<p class="small muted">BuffStats: ${esc(item.buffStatsText)}</p>` : ''}
    <h3>装備側から読めた直接効果</h3>
    ${renderEffectTable(item.directEffects)}
    <details><summary>元データ</summary><pre>${esc(JSON.stringify(item.raw, null, 2))}</pre></details>
  </div>
  <h3>参考データ側の突合候補</h3>
  <div class="list">${matchesHtml}</div>`;
}

function render() {
  renderSummary();
  renderItemList();
  renderDetail();
}

function bindEvents() {
  el('runBtn').addEventListener('click', runMatch);
  el('filterText').addEventListener('input', render);
  el('filterKind').addEventListener('change', render);
  el('dataSource').addEventListener('change', () => {
    const source = el('dataSource').value;
    el('pasteArea').disabled = source === 'localStorage';
  });
  el('pasteArea').disabled = el('dataSource').value === 'localStorage';
}

bindEvents();
runMatch();
