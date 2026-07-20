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
  if (!filters.length) return "";
  return filters.map(catalogStatFilterDescription).filter(Boolean).join(" / ");
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

  return true;
}
