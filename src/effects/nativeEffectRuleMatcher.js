(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizeName(value) {
    const resolver = window.MoeNativeEffectResolver;
    if (resolver && typeof resolver.normalizeName === 'function') return resolver.normalizeName(value);
    return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function looksLikeEquipmentArray(value) {
    if (!Array.isArray(value) || value.length < 10) return false;
    const sample = value.slice(0, Math.min(value.length, 80));
    let score = 0;
    for (const item of sample) {
      if (!item || typeof item !== 'object') continue;
      if ('name' in item) score += 2;
      if ('slot' in item || 'equip' in item) score += 1;
      if ('weaponType' in item || 'weaponDamage' in item || 'armorClass' in item) score += 1;
      if ('addStatuses' in item || 'technicId' in item || 'technicName' in item) score += 1;
    }
    return score >= Math.max(8, sample.length * 1.2);
  }

  function unwrapEquipmentArray(value) {
    if (looksLikeEquipmentArray(value)) return value;
    if (!value || typeof value !== 'object') return null;
    const keys = ['items', 'equipment', 'equipments', 'catalog', 'data', 'list', 'all'];
    for (const key of keys) {
      if (looksLikeEquipmentArray(value[key])) return value[key];
    }
    return null;
  }

  function findEquipmentCatalog() {
    const knownNames = [
      'MOE_EQUIPMENT_CATALOG',
      'MOE_EQUIPMENT_ITEMS',
      'MOE_EQUIPMENT_CATALOG_ITEMS',
      'MOE_ITEM_CATALOG',
      'EQUIPMENT_CATALOG',
      'equipmentCatalog',
      'equipmentCatalogItems',
    ];

    for (const name of knownNames) {
      const found = unwrapEquipmentArray(window[name]);
      if (found) return { items: found, source: `window.${name}` };
    }

    // Fallback: scan only plausible global names to avoid touching browser internals too much.
    const globalKeys = Object.keys(window).filter(key => /EQUIP|ITEM|CATALOG|MOE/i.test(key));
    for (const key of globalKeys) {
      const found = unwrapEquipmentArray(window[key]);
      if (found) return { items: found, source: `window.${key}` };
    }

    return { items: [], source: '' };
  }

  function getBuffNames(equipment) {
    const names = [];
    const direct = [
      equipment?.technicName,
      equipment?.technic_name,
      equipment?.buffName,
      equipment?.buff_name,
      equipment?.Buff,
      equipment?.buff,
      equipment?.technic?.name,
    ];
    for (const value of direct) {
      const name = normalizeName(value);
      if (name) names.push(name);
    }
    return [...new Set(names)];
  }

  function getTechnicId(equipment) {
    const id = equipment?.technicId ?? equipment?.technic_id ?? equipment?.technic?.id;
    return id == null || id === '' ? '' : String(id);
  }

  function getDirectEffects(equipment) {
    const resolver = window.MoeNativeEffectResolver;
    if (!resolver || typeof resolver.collectDirectEquipmentEffects !== 'function') return [];
    try {
      return resolver.collectDirectEquipmentEffects(equipment) || [];
    } catch (error) {
      console.warn('[native-effect-rule-matcher] collectDirectEquipmentEffects failed', error, equipment);
      return [];
    }
  }

  function getMatchedRules(equipment) {
    const resolver = window.MoeNativeEffectResolver;
    if (!resolver || typeof resolver.findNativeRulesForEquipment !== 'function') return [];
    try {
      return resolver.findNativeRulesForEquipment(equipment) || [];
    } catch (error) {
      console.warn('[native-effect-rule-matcher] findNativeRulesForEquipment failed', error, equipment);
      return [];
    }
  }

  function hasUnsupported(rule) {
    const unsupported = rule?.unsupported || {};
    if (Array.isArray(unsupported.text) && unsupported.text.length) return true;
    return Object.keys(unsupported).some(key => {
      const value = unsupported[key];
      if (Array.isArray(value)) return value.length > 0;
      return value != null && value !== '';
    });
  }

  function buildRows(equipmentItems) {
    return equipmentItems.map((equipment, index) => {
      const buffNames = getBuffNames(equipment);
      const technicId = getTechnicId(equipment);
      const directEffects = getDirectEffects(equipment);
      const matchedRules = getMatchedRules(equipment);
      const unsupportedRules = matchedRules.filter(hasUnsupported);
      const hasBuff = buffNames.length > 0 || Boolean(technicId);
      return {
        index,
        equipment,
        name: normalizeName(equipment?.name),
        slot: normalizeName(equipment?.slot || equipment?.equip),
        buffNames,
        technicId,
        directEffects,
        matchedRules,
        unsupportedRules,
        hasBuff,
        searchable: normalizeName([
          equipment?.name,
          equipment?.slot,
          equipment?.equip,
          ...buffNames,
          technicId,
          ...matchedRules.map(rule => `${rule.id} ${rule.targetName}`),
        ].filter(Boolean).join(' ')),
      };
    });
  }

  function summarize(rows, catalogSource) {
    const equipmentCount = rows.length;
    const rules = Array.isArray(window.MOE_NATIVE_EFFECT_RULES) ? window.MOE_NATIVE_EFFECT_RULES : [];
    const withBuff = rows.filter(row => row.hasBuff).length;
    const matched = rows.filter(row => row.matchedRules.length).length;
    const unmatchedBuff = rows.filter(row => row.hasBuff && !row.matchedRules.length).length;
    const direct = rows.filter(row => row.directEffects.length).length;
    const unsupported = rows.filter(row => row.unsupportedRules.length).length;

    $('summary').innerHTML = [
      ['装備件数', equipmentCount],
      ['自作ルール件数', rules.length],
      ['Buff/技あり装備', withBuff],
      ['ルール一致あり', matched],
      ['Buffあり未登録', unmatchedBuff],
      ['直接効果あり', direct],
      ['説明/未対応あり', unsupported],
    ].map(([label, value]) => `
      <div class="metric"><div class="value">${escapeHtml(value)}</div><div class="label">${escapeHtml(label)}</div></div>
    `).join('');

    $('loadWarning').innerHTML = catalogSource
      ? `装備カタログ: <code>${escapeHtml(catalogSource)}</code>`
      : '<span class="bad">装備カタログのグローバル配列を見つけられませんでした。equipmentCatalog.generated.js の公開変数名を確認してください。</span>';
  }

  function formatEffectsObject(effects) {
    const entries = Object.entries(effects || {}).filter(([, value]) => value != null && value !== '' && value !== 0);
    if (!entries.length) return '<span class="muted">数値効果なし</span>';
    return entries.map(([key, value]) => `<span class="badge"><code>${escapeHtml(key)}</code> ${escapeHtml(value)}</span>`).join('');
  }

  function formatRule(rule) {
    const unsupported = rule.unsupported || {};
    const unsupportedText = Array.isArray(unsupported.text) ? unsupported.text : [];
    return `
      <div style="margin-bottom:8px">
        <div><strong>${escapeHtml(rule.targetName || rule.id)}</strong> <span class="muted small">${escapeHtml(rule.id)}</span></div>
        <div>${formatEffectsObject(rule.effects)}</div>
        <div class="small muted">
          stack: ${escapeHtml(rule.stackGroup || '-')}/${escapeHtml(rule.stackMode || '-')}
          ・ verification: ${escapeHtml(rule.verification || '-')}
        </div>
        ${unsupportedText.length ? `<div class="small warn">${unsupportedText.map(escapeHtml).join('<br>')}</div>` : ''}
      </div>
    `;
  }

  function formatDirectEffects(effects) {
    if (!effects.length) return '<span class="muted">なし</span>';
    return effects.map(effect => `
      <span class="badge"><code>${escapeHtml(effect.key)}</code> ${escapeHtml(effect.value)}</span>
    `).join('');
  }

  function formatBuff(row) {
    const parts = [];
    if (row.technicId) parts.push(`<span class="badge">technicId: ${escapeHtml(row.technicId)}</span>`);
    for (const name of row.buffNames) parts.push(`<span class="badge">${escapeHtml(name)}</span>`);
    return parts.length ? parts.join('') : '<span class="muted">なし</span>';
  }

  function formatUnsupported(row) {
    const texts = [];
    for (const rule of row.unsupportedRules) {
      const unsupportedText = Array.isArray(rule?.unsupported?.text) ? rule.unsupported.text : [];
      for (const text of unsupportedText) texts.push(`[${rule.targetName || rule.id}] ${text}`);
    }
    const rawText = [
      row.equipment?.technicInfo,
      row.equipment?.technic_info,
      row.equipment?.buffInfo,
      row.equipment?.BuffInfo,
      row.equipment?.info,
    ].filter(Boolean).map(String).join('\n');

    if (!texts.length && !rawText) return '<span class="muted">なし</span>';
    return `
      ${texts.length ? `<div class="warn small">${texts.map(escapeHtml).join('<br>')}</div>` : ''}
      ${rawText ? `<details><summary>装備説明/技説明</summary><pre>${escapeHtml(rawText)}</pre></details>` : ''}
    `;
  }

  function passFilter(row, filter) {
    if (filter === 'matched') return row.matchedRules.length > 0;
    if (filter === 'unmatchedBuff') return row.hasBuff && row.matchedRules.length === 0;
    if (filter === 'directOnly') return row.directEffects.length > 0;
    if (filter === 'unsupported') return row.unsupportedRules.length > 0;
    return true;
  }

  function renderRows(rows) {
    const query = normalizeName($('queryInput').value).toLowerCase();
    const filter = $('filterSelect').value;
    const filtered = rows
      .filter(row => passFilter(row, filter))
      .filter(row => !query || row.searchable.toLowerCase().includes(query));

    $('resultCount').textContent = `${filtered.length} 件表示 / ${rows.length} 件中`;

    const limit = 500;
    const visible = filtered.slice(0, limit);
    $('resultBody').innerHTML = visible.map(row => `
      <tr>
        <td>
          <strong>${escapeHtml(row.name || '(名称なし)')}</strong><br>
          <span class="small muted">${escapeHtml(row.slot || '')}</span>
        </td>
        <td>${formatBuff(row)}</td>
        <td>${row.matchedRules.length ? row.matchedRules.map(formatRule).join('') : '<span class="muted">未登録</span>'}</td>
        <td>${formatDirectEffects(row.directEffects)}</td>
        <td>${formatUnsupported(row)}</td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="muted">該当なし</td></tr>';

    if (filtered.length > limit) {
      $('resultBody').insertAdjacentHTML('beforeend', `
        <tr><td colspan="5" class="muted">表示上限 ${limit} 件。検索語を追加してください。</td></tr>
      `);
    }
  }

  function main() {
    const found = findEquipmentCatalog();
    const rows = buildRows(found.items);
    summarize(rows, found.source);
    renderRows(rows);

    $('queryInput').addEventListener('input', () => renderRows(rows));
    $('filterSelect').addEventListener('change', () => renderRows(rows));
    $('reloadButton').addEventListener('click', () => location.reload());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();
