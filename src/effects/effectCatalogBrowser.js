import { MOE_FORGE_EFFECT_CATALOG } from '../data/generated/moeForgeEffectCatalog.generated.js';
import { MOE_FORGE_EQUIPMENT_BUFF_INDEX } from '../data/generated/moeForgeEquipmentBuffIndex.generated.js';
import { EFFECT_STAT_SCHEMA } from '../data/effects/effectStatSchema.js';

const el = (id) => document.getElementById(id);
const state = {
  selectedKey: '',
  lastResults: []
};

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function normalizeText(value) {
  return String(value ?? '').toLowerCase().replace(/\s+/g, '');
}

function effectLabel(effect) {
  const schema = EFFECT_STAT_SCHEMA[effect.stat];
  const stat = schema?.label || effect.stat || 'unknown';
  const mode = effect.mode || 'unknown';
  if (mode === 'flat') return `${stat} ${effect.value > 0 ? '+' : ''}${effect.value}`;
  if (mode === 'percent') return `${stat} ${effect.value > 0 ? '+' : ''}${effect.value}%`;
  if (mode === 'coefficient') return `${stat} 係数 ${effect.value}`;
  if (mode === 'namedGroup') return `${effect.group || effect.sourceField || stat}: ${effect.value}`;
  if (mode === 'formula') return `${stat} 式`;
  if (mode === 'conversion') return `${effect.sourceStat || '?'} → ${effect.stat || '?'} ${effect.rate || effect.value || ''}`;
  return `${stat} ${mode}`;
}

function effectCategory(effect) {
  return EFFECT_STAT_SCHEMA[effect.stat]?.category || 'special';
}

function entryEffects(entry) {
  return Array.isArray(entry.effects) ? entry.effects : [];
}

function hasCategory(entry, category) {
  if (category === 'all') return true;
  return entryEffects(entry).some((effect) => effectCategory(effect) === category);
}

function entrySearchHaystack(entry) {
  return normalizeText([
    entry.name,
    entry.itemName,
    entry.buffName,
    entry.buffInfo,
    entry.buffStatsText,
    entry.kind,
    entry.slot,
    entry.sourceLayer,
    entry.verificationStatus,
    entry.summary?.description,
    JSON.stringify(entry.rawNonZeroFields || {}),
    JSON.stringify(entry.unsupportedFields || {})
  ].filter(Boolean).join(' '));
}

function makeBuffResult(entry, index) {
  return {
    key: `buff:${entry.id || entry.name || index}`,
    sourceType: 'buff',
    title: entry.name || '(no name)',
    subtitle: `${entry.kind || 'effect'} / ${entry.sourceLayer || 'unknown'} / ${entry.verificationStatus || 'reference'}`,
    description: entry.summary?.description || '',
    entry
  };
}

function makeEquipmentResult(entry, index) {
  return {
    key: `equipment:${entry.itemId || entry.itemName || index}`,
    sourceType: 'equipment',
    title: entry.itemName || '(no item name)',
    subtitle: `${entry.slot || 'slot?'} / Buff: ${entry.buffName || 'なし'} / ${entry.sourceLayer || 'unknown'}`,
    description: entry.buffInfo || entry.buffStatsText || '',
    entry
  };
}

function search() {
  const q = normalizeText(el('q').value);
  const mode = el('mode').value;
  const category = el('category').value;
  const limit = Number(el('limit').value) || 50;
  const results = [];

  if (mode === 'all' || mode === 'buff') {
    MOE_FORGE_EFFECT_CATALOG.forEach((entry, index) => {
      if (category !== 'all' && !hasCategory(entry, category)) return;
      if (q && !entrySearchHaystack(entry).includes(q)) return;
      results.push(makeBuffResult(entry, index));
    });
  }

  if (mode === 'all' || mode === 'equipment') {
    MOE_FORGE_EQUIPMENT_BUFF_INDEX.forEach((entry, index) => {
      if (category !== 'all' && !hasCategory(entry, category)) return;
      if (q && !entrySearchHaystack(entry).includes(q)) return;
      results.push(makeEquipmentResult(entry, index));
    });
  }

  state.lastResults = results.slice(0, limit);
  if (!state.lastResults.some((r) => r.key === state.selectedKey)) state.selectedKey = '';
  render();
}

function renderSummary() {
  const buffCount = MOE_FORGE_EFFECT_CATALOG.length;
  const equipmentCount = MOE_FORGE_EQUIPMENT_BUFF_INDEX.length;
  const shown = state.lastResults.length;
  el('summary').innerHTML = [
    `<span class="pill">Buff/効果: <strong>${buffCount.toLocaleString()}</strong></span>`,
    `<span class="pill">装備Buff索引: <strong>${equipmentCount.toLocaleString()}</strong></span>`,
    `<span class="pill">表示中: <strong>${shown.toLocaleString()}</strong></span>`,
    `<span class="pill">この画面は計算非接続</span>`
  ].join('');
}

function renderList() {
  const list = el('resultList');
  if (!state.lastResults.length) {
    list.innerHTML = '<div class="card muted">検索結果がありません。</div>';
    return;
  }
  list.innerHTML = state.lastResults.map((result, index) => {
    const effects = entryEffects(result.entry).slice(0, 8).map((effect) => `<span class="effect-chip">${esc(effectLabel(effect))}</span>`).join('');
    const more = entryEffects(result.entry).length > 8 ? `<span class="effect-chip">+${entryEffects(result.entry).length - 8}</span>` : '';
    return `
      <article class="card ${result.key === state.selectedKey ? 'selected' : ''}" data-key="${esc(result.key)}">
        <h3>${esc(result.title)}</h3>
        <div class="meta">${esc(result.subtitle)}</div>
        ${result.description ? `<div class="desc">${esc(result.description)}</div>` : ''}
        <div class="effects">${effects}${more}</div>
        <button class="secondary" data-select="${index}" style="margin-top:10px">詳細を見る</button>
      </article>
    `;
  }).join('');
  list.querySelectorAll('[data-select]').forEach((button) => {
    button.addEventListener('click', () => {
      const result = state.lastResults[Number(button.dataset.select)];
      state.selectedKey = result?.key || '';
      render();
    });
  });
}

function renderEffectTable(effects) {
  if (!effects.length) return '<p class="muted">正規化済みeffectはありません。説明文またはunsupportedFieldsだけを参照してください。</p>';
  return `
    <table>
      <thead><tr><th>stat</th><th>表示名</th><th>mode</th><th>value</th><th>source</th></tr></thead>
      <tbody>
        ${effects.map((effect) => `
          <tr>
            <td><code>${esc(effect.stat || '')}</code></td>
            <td>${esc(EFFECT_STAT_SCHEMA[effect.stat]?.label || '')}</td>
            <td><code>${esc(effect.mode || '')}</code></td>
            <td>${esc(effect.value ?? effect.rate ?? '')}</td>
            <td>${esc(effect.sourceField || effect.sourceFields?.join(', ') || effect.group || '')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderRawBlock(title, value) {
  const keys = value && typeof value === 'object' ? Object.keys(value) : [];
  if (!keys.length) return '';
  return `<h3>${esc(title)}</h3><pre>${esc(JSON.stringify(value, null, 2))}</pre>`;
}

function renderDetail() {
  const detail = el('detail');
  const result = state.lastResults.find((r) => r.key === state.selectedKey);
  if (!result) {
    detail.innerHTML = '<div class="detail-empty">左の検索結果を選ぶと詳細が表示されます。</div>';
    return;
  }
  const entry = result.entry;
  const copyText = JSON.stringify(entry, null, 2);
  detail.innerHTML = `
    <h2 style="margin-top:0">${esc(result.title)}</h2>
    <p class="muted">${esc(result.subtitle)}</p>
    ${result.description ? `<p>${esc(result.description)}</p>` : ''}
    <div class="tabs">
      <button class="tab active" data-tab="effects">正規化効果</button>
      <button class="tab" data-tab="raw">Raw</button>
      <button class="tab" data-tab="promote">採用メモ</button>
    </div>
    <div id="detailTab"></div>
    <textarea id="copySource" style="position:absolute;left:-9999px">${esc(copyText)}</textarea>
  `;
  const tab = detail.querySelector('#detailTab');
  const renderTab = (name) => {
    detail.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
    if (name === 'effects') {
      tab.innerHTML = `
        <h3>正規化済みeffects</h3>
        ${renderEffectTable(entryEffects(entry))}
        ${renderRawBlock('unsupportedFields', entry.unsupportedFields)}
      `;
    } else if (name === 'raw') {
      tab.innerHTML = `<pre>${esc(copyText)}</pre><button id="copyRaw" class="secondary">Raw JSONをコピー</button>`;
      tab.querySelector('#copyRaw').addEventListener('click', async () => {
        await navigator.clipboard.writeText(copyText);
        tab.querySelector('#copyRaw').textContent = 'コピーしました';
      });
    } else {
      const name = entry.name || entry.buffName || entry.itemName || '';
      const effects = entryEffects(entry).map(effectLabel).join(' / ') || '正規化効果なし';
      tab.innerHTML = `
        <p>この項目を本採用する場合は、公式DB/Wiki/実測で確認してから verified catalog 側へ昇格します。</p>
        <pre>${esc([
          `name: ${name}`,
          `sourceLayer: ${entry.sourceLayer || ''}`,
          `verificationStatus: ${entry.verificationStatus || 'reference'}`,
          `effects: ${effects}`,
          `description: ${entry.summary?.description || entry.buffInfo || entry.buffStatsText || ''}`,
          'todo: 公式DB/Wiki/実測で確認',
        ].join('\n'))}</pre>
      `;
    }
  };
  detail.querySelectorAll('.tab').forEach((button) => button.addEventListener('click', () => renderTab(button.dataset.tab)));
  renderTab('effects');
}

function render() {
  renderSummary();
  renderList();
  renderDetail();
}

function init() {
  el('loadStatus').textContent = '読み込み完了';
  el('search').addEventListener('click', search);
  el('clear').addEventListener('click', () => {
    el('q').value = '';
    el('mode').value = 'all';
    el('category').value = 'all';
    state.selectedKey = '';
    search();
  });
  ['q', 'mode', 'category', 'limit'].forEach((id) => {
    el(id).addEventListener(id === 'q' ? 'input' : 'change', () => {
      clearTimeout(state.timer);
      state.timer = setTimeout(search, id === 'q' ? 180 : 0);
    });
  });
  el('q').value = 'バーサーク';
  search();
}

init();
