function catalogNeedSkillPairs(item) {
  const out = [];
  const add = (name, value) => {
    const n = String(name || "").trim();
    const v = parseFloat(value);
    if (!n && !Number.isFinite(v)) return;
    const key = `${n}:${Number.isFinite(v) ? v : ""}`;
    if (!out.some(x => x.key === key)) out.push({key, name:n || "必要スキル", value:Number.isFinite(v) ? v : 0});
  };
  const parseObj = req => {
    if (!req) return;
    if (typeof req === "string") {
      const m = req.match(/(.+?)[：:\s]+([0-9]+(?:\.[0-9]+)?)/);
      if (m) add(m[1], m[2]);
      else if (req.trim()) add(req.trim(), 0);
      return;
    }
    add(req.name || req.skill || req.type || req.label, req.value ?? req.required ?? req.min ?? req.level ?? req.needLevel);
  };
  [item.weaponReq, item.needSkills, item.need_skills, item.requirements, item.requiredSkills].forEach(arr => {
    if (Array.isArray(arr)) arr.forEach(parseObj);
  });
  if (item.requiredSkill || item.needLevel) {
    const text = String(item.requiredSkill || "");
    const m = text.match(/(.+?)[：:\s]+([0-9]+(?:\.[0-9]+)?)/);
    if (m) add(m[1], m[2]);
    else add(text || idbWeaponSkillName(item) || "必要スキル", item.needLevel || 0);
  }
  return out.map(({key, ...x}) => x);
}

function catalogNeedSummary(item) {
  const reqs = catalogNeedSkillPairs(item);
  const parts = reqs.map(req => {
    const cur = req.name ? skillSimValue(req.name) : NaN;
    const base = req.value ? `${req.name} ${fmt(req.value, 1)}` : req.name;
    if (Number.isFinite(cur) && req.value) {
      const shortage = req.value - cur;
      return shortage > 0 ? `${base}（現在${fmt(cur, 1)} / 不足${fmt(shortage, 1)}）` : `${base}（現在${fmt(cur, 1)}）`;
    }
    return base;
  });
  return parts.join(" / ") || "-";
}

function catalogPerformanceSummary(item) {
  const parts = [];
  const tierArrays = [item.tiers, item.performanceTiers, item.skillTiers, item.conditionTiers].filter(Array.isArray);
  tierArrays.forEach(tiers => {
    tiers.slice(0, 4).forEach(t => {
      if (!t || typeof t !== "object") return;
      const min = t.min ?? t.required ?? t.level ?? t.needLevel;
      const label = t.label || t.name || t.rank || (min !== undefined ? `条件${min}` : "段階");
      const text = t.effect || t.summary || t.note || t.performance || t.value || "";
      parts.push([label, text].filter(Boolean).join(":"));
    });
  });
  const reqs = catalogNeedSkillPairs(item);
  const missing = reqs.filter(r => r.value && Number.isFinite(skillSimValue(r.name)) && skillSimValue(r.name) < r.value);
  if (missing.length) parts.unshift("必要スキル未満時は性能低下の可能性あり");
  return parts.join(" / ") || "-";
}

function catalogRequirementAndPerformanceSummary(item) {
  const req = catalogNeedSummary(item);
  const perf = catalogPerformanceSummary(item);
  if (req === "-" && perf === "-") return "-";
  if (perf === "-") return `必要: ${req}`;
  if (req === "-") return `変動: ${perf}`;
  return `必要: ${req} / 変動: ${perf}`;
}

function catalogArmorSummary(item) {
  const ac = +(item.armorClass ?? item.ac ?? item.defense ?? 0);
  return ac ? fmt(ac, 2) : "-";
}

function catalogItemSortValue(item, key) {
  if (key === "name") return item.name || "";
  if (key === "category") return `${catalogCategoryLabel(item.category)} ${item.slot || ""} ${item.name || ""}`;
  if (key === "slot") return `${item.slot || ""} ${item.name || ""}`;
  if (key === "req") return catalogNeedSummary(item);
  if (key === "buff") return catalogBuffSummary(item) || "";
  if (key === "hasBuff") return catalogHasBuff(item) ? 1 : 0;
  if (key === "weaponDamage") return +(item.weaponDamage || 0);
  if (key === "weaponDelay") return +(item.weaponAttackInterval || 0);
  if (key === "attack") return +(item.extraStats?.attack || 0);
  if (key === "magic") return +(item.extraStats?.magic || 0);
  if (key === "speed") return +(item.extraStats?.speed || 0);
  if (key === "ac") return +(item.armorClass ?? item.ac ?? item.defense ?? item.extraStats?.extraAC ?? 0);
  if (key === "hp") return +(item.extraStats?.extraHP || 0);
  if (key === "mp") return +(item.extraStats?.extraMP || 0);
  if (key === "st") return +(item.extraStats?.extraST || 0);
  if (key === "maxWeight") return catalogStatNumericValue(item, "extraMaxWeight");
  if (key === "hit") return +(item.extraStats?.extraHit || 0);
  if (key === "avoid") return +(item.extraStats?.extraAvoid || 0);
  if (key === "attackDelay") return +(item.extraStats?.extraAttackDelay || 0);
  return item.name || "";
}

function sortCatalogItems(items, filter) {
  const key = filter.sort || "name";
  const dir = filter.sortDir === "desc" ? -1 : 1;
  const numericKeys = new Set(["weaponDamage", "weaponDelay", "attack", "magic", "speed", "ac", "hp", "mp", "st", "maxWeight", "hit", "avoid", "attackDelay", "hasBuff"]);
  return items.slice().sort((a, b) => {
    const av = catalogItemSortValue(a, key);
    const bv = catalogItemSortValue(b, key);
    if (numericKeys.has(key)) {
      const diff = (+av || 0) - (+bv || 0);
      if (diff) return diff * dir;
      return String(a.name || "").localeCompare(String(b.name || ""), "ja");
    }
    return String(av || "").localeCompare(String(bv || ""), "ja") * dir;
  });
}
