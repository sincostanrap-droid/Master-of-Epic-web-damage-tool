function catalogNorm(s) {
  return String(s || "").toLowerCase().replace(/\s+/g, "");
}

function catalogText(item) {
  return [
    item.name,
    item.slot,
    item.category,
    item.categoryLabel,
    item.weaponType,
    item.weaponHand,
    item.requiredSkill,
    item.needLevel,
    item.armorClass,
    item.info,
    item.note,
    item.sourceUrl,
    item.addStatusText,
    item.equipBuff?.name,
    item.equipBuff?.info,
    ...(Array.isArray(item.weaponReq) ? item.weaponReq.map(r => `${r.name || r.skill || ""}${r.value || r.required || r.min || ""}`) : []),
    ...(Array.isArray(item.needSkills) ? item.needSkills.map(r => `${r.name || r.skill || ""}${r.value || r.required || r.min || ""}`) : []),
    ...(Array.isArray(item.requirements) ? item.requirements.map(r => `${r.name || r.skill || ""}${r.value || r.required || r.min || ""}`) : []),
    ...(Array.isArray(item.addStatuses) ? item.addStatuses.map(s => `${s.name}${s.value}`) : []),
    ...(Array.isArray(item.tags) ? item.tags : [])
  ].filter(Boolean).join(" ");
}

function catalogSlotOptions(items) {
  const slots = Array.from(new Set(items.map(i => i.slot).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ja"));
  return `<option value="">すべて</option>` + slots.map(s => `<option value="${escapeAttr(s)}">${escapeHtml(s)}</option>`).join("");
}

function catalogStatOptions(items) {
  const names = new Set();
  items.forEach(item => {
    (item.addStatuses || []).forEach(st => {
      if (st?.statKey) names.add(st.statKey);
      else if (st?.name) names.add(st.name);
    });
    if (item.extraStats) Object.entries(item.extraStats).forEach(([k, v]) => +v && names.add(k));
  });
  const list = Array.from(names).sort((a, b) => String(a).localeCompare(String(b), "ja"));
  return `<option value="">指定なし</option>` + list.map(s => `<option value="${escapeAttr(s)}">${escapeHtml(catalogDisplayStatName(s))}</option>`).join("");
}

function catalogDisplayStatName(name) {
  return TOOL_STAT_DISPLAY_NAMES[name] || name;
}

function catalogHasBuff(item) {
  return !!(item?.equipBuff?.name || (Array.isArray(item?.buffRefs) && item.buffRefs.length));
}

const CATALOG_BUFF_EFFECT_FILTER_TYPES = [
  ["基本ステータス", [
    ["stat:attack", "攻撃力"], ["stat:attackPct", "攻撃力%"],
    ["stat:magic", "魔力"], ["stat:magicPct", "魔力%"],
    ["stat:speed", "移動速度"], ["stat:speedPct", "移動速度%"],
    ["stat:dmgPct", "物理与ダメージ%"],
    ["stat:extraHit", "命中"], ["stat:extraHitPct", "命中%"],
    ["stat:extraAvoid", "回避"], ["stat:extraAvoidPct", "回避%"],
    ["stat:extraAC", "防御力"], ["stat:extraACPct", "防御力%"],
    ["stat:extraHP", "最大HP"], ["stat:extraHPPct", "最大HP%"],
    ["stat:extraMP", "最大MP"], ["stat:extraMPPct", "最大MP%"],
    ["stat:extraST", "最大ST"], ["stat:extraSTPct", "最大ST%"],
    ["stat:extraMaxWeight", "最大重量"], ["stat:extraMaxWeightPct", "最大重量%"]
  ]],
  ["戦闘・回復", [
    ["stat:extraAttackDelay", "攻撃ディレイ"], ["stat:extraAttackDelayPct", "攻撃ディレイ%"],
    ["stat:extraMagicDelay", "魔法ディレイ"], ["stat:extraMagicDelayPct", "魔法ディレイ%"],
    ["stat:extraCritRatePct", "クリティカル率%"],
    ["stat:extraDamageReducePct", "被ダメージ軽減%"],
    ["stat:hpRegenPerMinute", "HP自然回復/分"],
    ["stat:stRegenPerMinute", "ST自然回復/分"],
    ["stat:mpRegenPerMinute", "MP自然回復/分"],
    ["stat:extraFangAttack", "牙攻撃補正"]
  ]],
  ["属性耐性", [
    ["stat:extraFireRes", "耐火属性"], ["stat:extraFireResPct", "耐火属性%"],
    ["stat:extraWaterRes", "耐水属性"], ["stat:extraWaterResPct", "耐水属性%"],
    ["stat:extraEarthRes", "耐地属性"], ["stat:extraEarthResPct", "耐地属性%"],
    ["stat:extraWindRes", "耐風属性"], ["stat:extraWindResPct", "耐風属性%"],
    ["stat:extraNeutralRes", "耐無属性"], ["stat:extraNeutralResPct", "耐無属性%"]
  ]],
  ["変換・特殊効果", [
    ["conversion:magicToAttackPct", "魔力→攻撃力"],
    ["conversion:magicToSpeedPct", "魔力→移動速度"],
    ["conversion:speedToAttackPct", "移動速度→攻撃力"],
    ["skillPlus", "スキル強化"],
    ["specialTarget", "種族特攻"],
    ["effectText", "効果名・説明文"]
  ]]
];

function catalogBuffEffectFilterOptions() {
  const head = `<option value="">指定なし</option>`;
  return head + CATALOG_BUFF_EFFECT_FILTER_TYPES.map(([group, entries]) =>
    `<optgroup label="${escapeAttr(group)}">${entries.map(([value, label]) =>
      `<option value="${escapeAttr(value)}">${escapeHtml(label)}</option>`
    ).join("")}</optgroup>`
  ).join("");
}

function catalogBuffEffectTypeLabel(type) {
  for (const [, entries] of CATALOG_BUFF_EFFECT_FILTER_TYPES) {
    const found = entries.find(([value]) => value === type);
    if (found) return found[1];
  }
  return type;
}

function catalogBuffForItem(item) {
  if (item?.equipBuff?.name) return item.equipBuff;
  if (!Array.isArray(item?.buffRefs) || typeof catalogFindBuffById !== "function") return null;
  return item.buffRefs.map(catalogFindBuffById).find(Boolean) || null;
}

const catalogBuffEffectEntryCache = new WeakMap();

function catalogBuffEffectEntries(item) {
  if (!item || typeof item !== "object") return [];
  if (catalogBuffEffectEntryCache.has(item)) return catalogBuffEffectEntryCache.get(item);

  const buff = catalogBuffForItem(item);
  if (!buff) {
    catalogBuffEffectEntryCache.set(item, []);
    return [];
  }

  const entries = [];
  const seen = new Set();
  const add = (type, target, value, label) => {
    const numeric = Number(value);
    const entry = {
      type: String(type || ""),
      target: String(target || "").trim(),
      value: Number.isFinite(numeric) ? numeric : NaN,
      label: String(label || target || type || "").trim()
    };
    const key = `${entry.type}\u001f${catalogNorm(entry.target)}\u001f${Number.isFinite(entry.value) ? entry.value : ""}\u001f${catalogNorm(entry.label)}`;
    if (!entry.type || seen.has(key)) return;
    seen.add(key);
    entries.push(entry);
  };

  const candidate = typeof findEquipBuffRuleCandidate === "function"
    ? findEquipBuffRuleCandidate(buff, item)
    : null;
  Object.entries(candidate?.stats || {}).forEach(([key, value]) => {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric !== 0) {
      add(`stat:${key}`, "", numeric, catalogBuffEffectTypeLabel(`stat:${key}`));
    }
  });
  Object.entries(candidate?.conversions || {}).forEach(([key, value]) => {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric !== 0) {
      add(`conversion:${key}`, "", numeric, catalogBuffEffectTypeLabel(`conversion:${key}`));
    }
  });
  (candidate?.skillEffects || []).forEach(effect => {
    const name = effect?.name || effect?.target || "";
    if (name) add("skillPlus", name, effect?.value, `${name}スキル強化`);
  });
  (candidate?.customEffects || []).forEach(effect => {
    const name = effect?.name || effect?.target || "";
    if (name) add("effectText", name, effect?.value, name);
  });

  const misc = candidate?.misc || {};
  const targetRace = misc.targetRace || misc.target || candidate?.targetRace || "";
  const targetMultiplier = Number(misc.targetMultiplier ?? candidate?.targetMultiplier);
  if (targetRace) {
    const targetLabel = typeof targetRaceLabel === "function" ? targetRaceLabel(targetRace) : targetRace;
    add("specialTarget", targetLabel, targetMultiplier, `${targetLabel}特攻`);
  }

  const skillTotals = globalThis.MOESkillPlusV21?.totalsFromObject?.(item) || {};
  Object.entries(skillTotals).forEach(([name, value]) => {
    if (name && Number(value)) add("skillPlus", name, value, `${name}スキル強化`);
  });

  if (typeof damageBuffCompatibilityRulesForBuff === "function") {
    damageBuffCompatibilityRulesForBuff(buff, item).forEach(rule => {
      const value = Number(rule?.value);
      if (!Number.isFinite(value) || value === 0 || rule?.valueUncertain) return;
      const kind = String(rule?.autoApplyKind || "");
      const type = {
        equipBuffDmgPct: "stat:dmgPct",
        equipBuffExtraCritRatePct: "stat:extraCritRatePct",
        equipBuffConvMagicRate: "conversion:magicToAttackPct",
        equipBuffConvSpeedRate: "conversion:speedToAttackPct"
      }[kind] || "effectText";
      add(type, "", value, rule.effectLabel || rule.sectionName || rule.buffName || "");
    });
  }

  const sourceText = [
    buff.name, buff.info, buff.note,
    candidate?.name, candidate?.memo, candidate?.rawInfo, candidate?.parsedStatsHint,
    ...entries.map(entry => `${entry.label} ${entry.target}`)
  ].filter(Boolean).join(" / ");
  if (sourceText) add("effectText", sourceText, NaN, sourceText);

  catalogBuffEffectEntryCache.set(item, entries);
  return entries;
}

function catalogNormalizeBuffEffectFilters(filter) {
  const out = [];
  const push = row => {
    const effect = String(row?.effect || row?.type || "").trim();
    if (!effect) return;
    out.push({
      effect,
      target: String(row?.target || "").trim(),
      op: String(row?.op || "exists"),
      valueRaw: String(row?.valueRaw ?? "")
    });
  };
  (filter?.buffEffectFilters || []).forEach(push);
  return out;
}

function catalogBuffEffectFilterMatches(item, filter) {
  const type = String(filter?.effect || "");
  const target = catalogNorm(filter?.target || "");
  const entries = catalogBuffEffectEntries(item).filter(entry => entry.type === type);
  if (type === "effectText") {
    return !!target && entries.some(entry => catalogNorm(`${entry.target} ${entry.label}`).includes(target));
  }

  const candidates = target
    ? entries.filter(entry => catalogNorm(`${entry.target} ${entry.label}`).includes(target))
    : entries;
  if (!candidates.length) return false;
  if (filter?.op === "exists" || filter?.valueRaw === "") return true;
  return candidates.some(entry =>
    catalogStatNumericFilterMatches(entry.value, filter.op, filter.valueRaw)
  );
}

function catalogBuffEffectFilterDescription(filter) {
  const label = catalogBuffEffectTypeLabel(filter?.effect || "");
  const target = String(filter?.target || "").trim();
  if (filter?.effect === "effectText") return target ? `Buff効果「${target}」` : "";
  const prefix = [label, target].filter(Boolean).join("：");
  if (!prefix) return "";
  if (filter?.op === "exists" || filter?.valueRaw === "") return `${prefix}あり`;
  const opLabel = {gte:"以上", lte:"以下", gt:"超", lt:"未満", eq:"="}[filter.op] || "";
  return `${prefix} ${filter.valueRaw}${opLabel}`;
}

function catalogBuffEffectFiltersDescription(filter) {
  return catalogNormalizeBuffEffectFilters(filter)
    .map(catalogBuffEffectFilterDescription)
    .filter(Boolean)
    .join(" / ");
}

function catalogResetPage() {
  catalogPageIndex = 0;
}


function catalogStatNumericValue(item, stat) {
  // __MOE_CATALOG_SORT_MAX_WEIGHT_FIX_V2__: normalize catalog sort/filter alias before numeric lookup.
  let key = String(stat || "").trim();
  if (key === "maxWeight" || key === "最大重量") key = "extraMaxWeight";
  if (!key) return NaN;

  let total = 0;
  let found = false;

  const add = value => {
    const v = parseFloat(value);
    if (!Number.isFinite(v) || v === 0) return;
    total += v;
    found = true;
  };

  (item?.addStatuses || []).forEach(st => {
    if (!st) return;
    const name = String(st.name || st.normalizedName || "").trim();
    const statKey = String(st.statKey || "").trim();
    const special = officialSpecializedCombatStatusInfo(name);
    if (special) {
      // 旧生成データで statKey が attack/extraHit でも、通常攻撃力/命中フィルタには混ぜない。
      if (key === name || key === special.name || key === special.prop) add(st.value);
      return;
    }
    if (statKey === key || name === key) add(st.value);
  });

  if (found) return total;

  const extra = item?.extraStats || {};
  if (Object.prototype.hasOwnProperty.call(extra, key)) {
    const v = parseFloat(extra[key]);
    return Number.isFinite(v) && v !== 0 ? v : NaN;
  }

  const mappedKey = typeof toolStatKeyForOfficialAddStatus === "function" ? toolStatKeyForOfficialAddStatus(key) : "";
  if (mappedKey && Object.prototype.hasOwnProperty.call(extra, mappedKey)) {
    const v = parseFloat(extra[mappedKey]);
    return Number.isFinite(v) && v !== 0 ? v : NaN;
  }

  return NaN;
}

function catalogStatNumericFilterMatches(value, op, expected) {
  if (!Number.isFinite(value)) return false;
  const mode = String(op || "any");
  if (mode === "any" || mode === "exists") return value !== 0;

  const target = parseFloat(expected);
  if (!Number.isFinite(target)) return value !== 0;

  if (mode === "gte") return value >= target;
  if (mode === "lte") return value <= target;
  if (mode === "gt") return value > target;
  if (mode === "lt") return value < target;
  if (mode === "eq") return Math.abs(value - target) < 1e-9;
  return value !== 0;
}

function catalogStatFilterDescription(filter) {
  if (!filter?.stat) return "";
  const label = catalogDisplayStatName(filter.stat);
  const op = String(filter.statOp || "any");
  const raw = filter.statValueRaw ?? "";
  if (!raw || op === "any" || op === "exists") return `${label}あり`;
  const opLabel = {gte:"以上", lte:"以下", gt:"超", lt:"未満", eq:"="}[op] || "";
  return `${label} ${raw}${opLabel}`;
}

function catalogNormalizeStatFilters(filter) {
  const out = [];
  const push = f => {
    const stat = String(f?.stat || "").trim();
    if (!stat) return;
    const statValueRaw = f?.statValueRaw ?? f?.valueRaw ?? "";
    out.push({
      stat,
      statOp: String(f?.statOp || f?.op || "any"),
      statValueRaw: String(statValueRaw ?? "")
    });
  };

  if (Array.isArray(filter?.statFilters)) filter.statFilters.forEach(push);
  else if (filter?.stat) push(filter);

  return out;
}


function catalogStatFiltersDescription(filter) {
  const filters = catalogNormalizeStatFilters(filter);
  const statText = filters.map(catalogStatFilterDescription).filter(Boolean).join(" / ");
  const buffText = catalogBuffEffectFiltersDescription(filter);
  return [statText, buffText].filter(Boolean).join(" / ");
}

function catalogItemMatches(item, filter) {
  const q = catalogNorm(filter.query);
  if (q && !catalogNorm(catalogText(item)).includes(q)) return false;
  if (filter.category && String(item.category || "") !== filter.category) return false;
  if (filter.slot && String(item.slot || "") !== filter.slot) return false;
  const hasBuff = catalogHasBuff(item);
  if (filter.buffMode === "with" && !hasBuff) return false;
  if (filter.buffMode === "without" && hasBuff) return false;

  const statFilters = catalogNormalizeStatFilters(filter);
  for (const statFilter of statFilters) {
    const statValue = catalogStatNumericValue(item, statFilter.stat);
    if (!catalogStatNumericFilterMatches(statValue, statFilter.statOp, statFilter.statValueRaw)) return false;
  }

  for (const buffFilter of catalogNormalizeBuffEffectFilters(filter)) {
    if (!catalogBuffEffectFilterMatches(item, buffFilter)) return false;
  }

  return true;
}
