let catalogPageIndex = 0;

function catalogResetPage() {
  catalogPageIndex = 0;
}

function catalogFindBuffById(id) {
  const key = String(id || "");
  if (!key) return null;
  return buffCatalogItems().find(b => String(b.id || "") === key || String(b.officialTechnicId || "") === key || String(b.catalogId || "") === key) || null;
}

function catalogEquipmentToRow(item) {
  const slot = item.slot || idbMapSlot(`${item.equip || ""} ${item.name || ""}`) || "防具: 頭";
  const row = defaultEquipmentCandidate(slot, false);
  row.enabled = false;
  row.name = item.name || "カタログ装備";
  row.importSource = "catalog";
  row.importedFromCatalog = true;
  row.catalogId = item.catalogId || item.id || "";
  row.officialId = item.officialId || "";
  row.importUrl = item.sourceUrl || "";
  row.note = [item.info, item.sourceUrl ? `公式DB: ${item.sourceUrl}` : "", item.verified === false ? "未検証カタログ候補" : ""].filter(Boolean).join("\n");

  if (item.category === "weapon") {
    row.weaponDamage = +item.weaponDamage || 0;
    row.weaponAttackInterval = +item.weaponAttackInterval || 0;
    row.weaponRange = +item.weaponRange || 0;
    row.weaponDurability = +item.weaponDurability || 0;
    row.weaponTwoHanded = /2HAND|両手/i.test(item.weaponHand || item.equip || "") ? "○" : "×";
    if (Array.isArray(item.weaponReq)) row.weaponReq = item.weaponReq;
    else if (item.requiredSkill || item.needLevel) row.weaponReq = idbWeaponReqsFromText(String(item.requiredSkill || ""), +item.needLevel || 0);
  }

  const structuredStatuses = Array.isArray(item.addStatuses) ? item.addStatuses : [];
  if (structuredStatuses.length) {
    structuredStatuses.forEach(st => idbApplyStructuredStatus(row, st.name, st.value, st.statKey));
  } else if (item.extraStats && typeof item.extraStats === "object") {
    // generated catalog normally contains both addStatuses and normalized extraStats for the same official add_status rows.
    // Applying both doubles imported equipment effects, so extraStats is only a fallback when structured addStatuses are absent.
    Object.entries(item.extraStats).forEach(([prop, value]) => {
      if (prop in row) row[prop] = +(row[prop] || 0) + (+value || 0);
    });
  }
  if (item.category !== "weapon" && +item.armorClass) row.extraAC = +(row.extraAC || 0) + (+item.armorClass || 0);

  const buff = item.equipBuff?.name ? item.equipBuff : (item.buffRefs || []).map(catalogFindBuffById).find(Boolean);
  if (buff?.name) {
    idbSetEquipmentBuff(row, buff.name, buff.info || buff.note || "");
    row.equipBuffCatalogId = buff.catalogId || buff.id || "";
    row.equipBuffTechnicId = buff.officialTechnicId || item.technicId || "";
    row.equipBuffConflictGroup = "";
    row.equipBuffStackRule = "same-technic";
    const candidate = findEquipBuffRuleCandidate(buff, item);
    if (candidate) applyEquipBuffRuleCandidateToEquipment(row, candidate);
    applySkillBuffCompatibilityToEquipment(row, buff, item);
    applyDamageBuffCompatibilityToEquipment(row, buff, item);
    if (!row.equipBuffWikiText && (buff.info || buff.note)) row.equipBuffWikiText = buff.info || buff.note || "";
  }

  restoreEquipmentBuffCompatibilityGroups(row, item);
  sanitizeGenericAttackConversionConflict(row);
  return normalizeEquipmentCandidate(row);
}

function addCatalogEquipmentToRegistered(catalogId) {
  const item = equipmentCatalogItems().find(x => String(x.catalogId || x.id) === String(catalogId));
  if (!item) return;
  state.equipment = normalizeEquipmentRows(state.equipment);
  state.equipment.push(catalogEquipmentToRow(item));
  renderEquipmentTable();
  renderTagLinkSummary();
  renderShowcaseTab();
  calc();
  renderCatalogResults();
}

function registeredCatalogIds() {
  return new Set(normalizeEquipmentRows(state.equipment).map(r => String(r.catalogId || "")).filter(Boolean));
}

function renderCatalogPageControls(filteredLength, page, pageCount, limit) {
  const box = byId("catalogPageControls");
  if (!box) return;
  const start = filteredLength ? page * limit + 1 : 0;
  const end = filteredLength ? Math.min(filteredLength, (page + 1) * limit) : 0;
  box.innerHTML = `
    <button type="button" id="catalogPrevPage" ${page <= 0 ? "disabled" : ""}>前へ</button>
    <span class="small">${pageCount ? page + 1 : 0} / ${pageCount || 0} ページ（${start}-${end} / ${filteredLength}件）</span>
    <button type="button" id="catalogNextPage" ${page >= pageCount - 1 ? "disabled" : ""}>次へ</button>
  `;
  const prev = byId("catalogPrevPage");
  const next = byId("catalogNextPage");
  if (prev) prev.onclick = () => { catalogPageIndex = Math.max(0, catalogPageIndex - 1); renderCatalogResults(); };
  if (next) next.onclick = () => { catalogPageIndex = Math.min(Math.max(0, pageCount - 1), catalogPageIndex + 1); renderCatalogResults(); };
}

function renderCatalogResults() {
  const body = byId("catalogResultsBody");
  const summary = byId("catalogSummary");
  if (!body || !summary) return;
  const items = equipmentCatalogItems();
  const filter = catalogFilterState();
  const filtered = sortCatalogItems(items.filter(item => catalogItemMatches(item, filter)), filter);
  const limit = Math.max(25, Math.min(1000, +(filter.limit || 200)));
  const pageCount = filtered.length ? Math.ceil(filtered.length / limit) : 0;
  catalogPageIndex = Math.max(0, Math.min(catalogPageIndex, Math.max(0, pageCount - 1)));
  const start = catalogPageIndex * limit;
  const shown = filtered.slice(start, start + limit);
  const already = registeredCatalogIds();
  body.innerHTML = shown.length
    ? shown.map(item => catalogResultRowHtml(item, already.has(String(item.catalogId || item.id || "")))).join("")
    : `<tr><td colspan="10" class="small mutedText">該当する装備がありません。カタログJSが未生成の場合は tools/build-equipment-catalog-from-google-sheet.mjs を実行してください。</td></tr>`;
  const statFilterText = catalogStatFiltersDescription(filter);
  summary.textContent = `カタログ ${items.length}件 / 該当 ${filtered.length}件 / 表示 ${shown.length}件${statFilterText ? ` / ${statFilterText}` : ""}`;
  renderCatalogPageControls(filtered.length, catalogPageIndex, pageCount, limit);
  body.querySelectorAll("[data-catalog-add]").forEach(btn => {
    btn.onclick = () => addCatalogEquipmentToRegistered(btn.dataset.catalogAdd);
  });
}
