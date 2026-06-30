(function () {
  const STAT_NAME_MAP = new Map([
    ['攻撃力', 'attackFlat'],
    ['命中', 'hitFlat'],
    ['回避', 'evasionFlat'],
    ['防御力', 'defenseFlat'],
    ['防御', 'defenseFlat'],
    ['魔力', 'magicFlat'],
    ['最大HP', 'maxHp'],
    ['HP', 'maxHp'],
    ['最大MP', 'maxMp'],
    ['MP', 'maxMp'],
    ['最大ST', 'maxSt'],
    ['ST', 'maxSt'],
    ['攻撃ディレイ', 'attackDelay'],
    ['攻撃ディレイ短縮', 'attackDelay'],
    ['移動速度', 'moveSpeedFlat'],
    ['火抵抗', 'resistFire'],
    ['水抵抗', 'resistWater'],
    ['風抵抗', 'resistWind'],
    ['地抵抗', 'resistEarth'],
    ['無抵抗', 'resistNeutral'],
  ]);

  function normalizeName(value) {
    return String(value ?? '')
      .normalize('NFKC')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getRules() {
    return Array.isArray(window.MOE_NATIVE_EFFECT_RULES)
      ? window.MOE_NATIVE_EFFECT_RULES
      : [];
  }

  function getIndexes() {
    return window.MOE_NATIVE_EFFECT_RULE_INDEXES || {};
  }

  function uniqueById(rules) {
    const out = [];
    const seen = new Set();
    for (const rule of rules || []) {
      if (!rule || seen.has(rule.id)) continue;
      seen.add(rule.id);
      out.push(rule);
    }
    return out;
  }

  function ruleByIdMap() {
    const map = new Map();
    for (const rule of getRules()) map.set(rule.id, rule);
    return map;
  }

  function collectCandidateRuleIds(equipment) {
    const indexes = getIndexes();
    const ids = [];
    const name = normalizeName(equipment?.name);
    const technicId = equipment?.technicId ?? equipment?.technic_id;
    const buffNames = [
      equipment?.technicName,
      equipment?.technic_name,
      equipment?.buffName,
      equipment?.Buff,
      equipment?.buff,
    ].filter(Boolean).map(normalizeName);

    if (name && indexes.byEquipmentName?.[name]) ids.push(...indexes.byEquipmentName[name]);
    if (technicId != null && indexes.byTechnicId?.[String(technicId)]) ids.push(...indexes.byTechnicId[String(technicId)]);
    for (const buffName of buffNames) {
      if (indexes.byBuffName?.[buffName]) ids.push(...indexes.byBuffName[buffName]);
    }

    return [...new Set(ids)];
  }

  function findNativeRulesForEquipment(equipment) {
    const ids = collectCandidateRuleIds(equipment);
    const byId = ruleByIdMap();
    return uniqueById(ids.map(id => byId.get(id)).filter(rule => rule && rule.enabled !== false));
  }

  function addEffect(out, key, value, source) {
    const n = Number(value);
    if (!key || !Number.isFinite(n) || n === 0) return;
    out.push({ key, value: n, source });
  }

  function collectDirectEquipmentEffects(equipment) {
    const effects = [];
    const statuses = Array.isArray(equipment?.addStatuses)
      ? equipment.addStatuses
      : Array.isArray(equipment?.add_statuses)
        ? equipment.add_statuses
        : [];

    for (const status of statuses) {
      const name = normalizeName(status?.name || status?.status_name || status?.normalizedName);
      const key = STAT_NAME_MAP.get(name);
      const value = status?.value ?? status?.pivot?.value ?? status?.amount;
      addEffect(effects, key, value, { type: 'equipment.addStatuses', name });
    }

    // Some imported records keep parsed values in extraStats/additional objects.
    const extra = equipment?.extraStats || equipment?.stats || equipment?.effects || null;
    if (extra && typeof extra === 'object' && !Array.isArray(extra)) {
      for (const [rawKey, rawValue] of Object.entries(extra)) {
        const key = STAT_NAME_MAP.get(normalizeName(rawKey)) || rawKey;
        addEffect(effects, key, rawValue, { type: 'equipment.extraStats', name: rawKey });
      }
    }

    return effects;
  }

  function resolveNativeEquipmentEffects(equipment) {
    const directEffects = collectDirectEquipmentEffects(equipment);
    const matchedRules = findNativeRulesForEquipment(equipment);
    const ruleEffects = matchedRules.map(rule => ({
      ruleId: rule.id,
      targetName: rule.targetName,
      effects: rule.effects || {},
      unsupported: rule.unsupported || {},
      stackGroup: rule.stackGroup || '',
      stackMode: rule.stackMode || 'add',
      verification: rule.verification || '',
      notes: rule.notes || '',
    }));

    return {
      equipmentName: equipment?.name || '',
      directEffects,
      matchedRules: ruleEffects,
      hasUnsupported: ruleEffects.some(r => r.unsupported && Object.keys(r.unsupported).length),
    };
  }

  window.MoeNativeEffectResolver = {
    normalizeName,
    getRules,
    findNativeRulesForEquipment,
    collectDirectEquipmentEffects,
    resolveNativeEquipmentEffects,
  };
})();
