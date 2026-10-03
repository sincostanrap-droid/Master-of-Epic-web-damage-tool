let catalogPageIndex = 0;
const catalogQualitySelections = new Map();
function catalogSetSelectedQuality(id, quality) {
  catalogQualitySelections.set(String(id), quality === "HG_MG" ? "HG_MG" : "raw");
}
function catalogSelectedQuality(item) {
  return catalogQualitySelections.get(String(item.catalogId || item.id || "")) || "raw";
}
function catalogRegistrationKey(id, quality="raw") {
  return `${id}:${quality === "HG_MG" ? "HG_MG" : "raw"}`;
}

function catalogResetPage() {
  catalogPageIndex = 0;
}

function addCatalogEquipmentToRegistered(catalogId) {
  const item = equipmentCatalogItems().find(x => String(x.catalogId || x.id) === String(catalogId));
  if (!item) return;
  state.equipment = normalizeEquipmentRows(state.equipment);
  state.equipment.push(catalogEquipmentToRow(item, catalogSelectedQuality(item)));
  renderEquipmentTable();
  renderTagLinkSummary();
  renderShowcaseTab();
  calc();
  renderCatalogResults();
}

function registeredCatalogIds() {
  return new Set(normalizeEquipmentRows(state.equipment).map(r => catalogRegistrationKey(r.catalogId || "", r.catalogQuality)).filter(Boolean));
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
  const items = equipmentCatalogItems().map(item => catalogItemWithQuality(item, catalogSelectedQuality(item)));
  const filter = catalogFilterState();
  const filtered = sortCatalogItems(items.filter(item => catalogItemMatches(item, filter)), filter);
  const limit = Math.max(25, Math.min(1000, +(filter.limit || 200)));
  const pageCount = filtered.length ? Math.ceil(filtered.length / limit) : 0;
  catalogPageIndex = Math.max(0, Math.min(catalogPageIndex, Math.max(0, pageCount - 1)));
  const start = catalogPageIndex * limit;
  const shown = filtered.slice(start, start + limit);
  const already = registeredCatalogIds();
  body.innerHTML = shown.length
    ? shown.map(item => catalogResultRowHtml(item, already.has(catalogRegistrationKey(item.catalogId || item.id || "", item.catalogQuality)))).join("")
    : `<tr><td colspan="5" class="small mutedText">該当する装備がありません。カタログJSが未生成の場合は tools/build-equipment-catalog-from-google-sheet.mjs を実行してください。</td></tr>`;
  const statFilterText = catalogStatFiltersDescription(filter);
  summary.textContent = `カタログ ${items.length}件 / 該当 ${filtered.length}件 / 表示 ${shown.length}件${statFilterText ? ` / ${statFilterText}` : ""}`;
  renderCatalogPageControls(filtered.length, catalogPageIndex, pageCount, limit);
  if (typeof catalogWorkspaceRefresh === "function") catalogWorkspaceRefresh(shown, filter, renderCatalogResults);
  body.querySelectorAll("[data-catalog-quality]").forEach(select => {
    select.onchange = () => {
      catalogQualitySelections.set(select.dataset.catalogQuality, select.value);
      renderCatalogResults();
    };
  });
  body.querySelectorAll("[data-catalog-add]").forEach(btn => {
    btn.onclick = () => addCatalogEquipmentToRegistered(btn.dataset.catalogAdd);
  });
}
