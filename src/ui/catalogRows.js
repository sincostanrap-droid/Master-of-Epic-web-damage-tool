function catalogCategoryLabel(category) {
  return category === "weapon" ? "武器" : category === "defense" ? "防具/装飾" : category === "shield" ? "盾" : (category || "-");
}

function catalogStatusSummary(item) {
  const parts = [];
  (item.addStatuses || []).forEach(st => {
    const v = +(st?.value || 0);
    if (st?.name && v) parts.push(`${st.name} ${v > 0 ? "+" : ""}${fmt(v, 2)}`);
  });
  if (!parts.length && item.extraStats) {
    Object.entries(item.extraStats).forEach(([k, v]) => +v && parts.push(`${catalogDisplayStatName(k)} ${+v > 0 ? "+" : ""}${fmt(+v, 2)}`));
  }
  return parts.join(" / ") || "-";
}

function catalogWeaponSummary(item) {
  if (item.category !== "weapon") return "-";
  const parts = [];
  if (+item.weaponDamage) parts.push(`ダメージ ${fmt(+item.weaponDamage, 2)}`);
  if (+item.weaponAttackInterval) parts.push(`間隔 ${fmt(+item.weaponAttackInterval, 0)}`);
  if (+item.weaponRange) parts.push(`射程 ${fmt(+item.weaponRange, 2)}`);
  if (item.weaponType) parts.push(item.weaponType);
  return parts.join(" / ") || "-";
}

function catalogBuffSummary(item) {
  const buff = item.equipBuff || null;
  if (!buff?.name && !(item.buffRefs || []).length) return "-";
  return [buff?.name, buff?.info].filter(Boolean).join("：") || (item.buffRefs || []).join(" / ");
}

function catalogResultRowHtml(item, already) {
  const id = escapeAttr(item.catalogId || item.id || "");
  const url = item.sourceUrl ? `<a href="${escapeAttr(item.sourceUrl)}" target="_blank" rel="noopener">公式DB</a>` : "-";
  const buff = catalogBuffSummary(item);
  return `<tr>
    <td>${escapeHtml(item.name || "-")}</td>
    <td>${escapeHtml(catalogCategoryLabel(item.category))}</td>
    <td>${escapeHtml(item.slot || "-")}</td>
    <td class="catalogNeedCell">${escapeHtml(catalogRequirementAndPerformanceSummary(item))}</td>
    <td>${escapeHtml(catalogArmorSummary(item))}</td>
    <td>${escapeHtml(catalogWeaponSummary(item))}</td>
    <td>${escapeHtml(catalogStatusSummary(item))}</td>
    <td class="catalogBuffCell">${escapeHtml(buff)}</td>
    <td>${url}</td>
    <td><button type="button" class="miniBtn" data-catalog-add="${id}" ${already ? "disabled" : ""}>${already ? "追加済" : "装備登録へ追加"}</button></td>
  </tr>`;
}
