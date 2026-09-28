/* Catalog workspace: existing controls and search engine retain their state. */
let catalogWorkspaceSelectedId = "";
function mountCatalogWorkspace(panel) {
  panel.classList.add("catalogWorkspacePanel");
  const toolbar = panel.querySelector(".catalogToolbar");
  const summary = panel.querySelector(".catalogSummaryLine");
  const table = panel.querySelector(".catalogTableWrap");
  const top = document.createElement("div");
  top.className = "catalogWorkspaceTop";
  const title = document.createElement("div");
  title.innerHTML = '<h2>装備カタログ</h2><p>装備を探して、構成の候補に追加</p>';
  top.append(title);
  const search = document.createElement("div");
  search.className = "catalogWorkspaceSearch";
  search.append(byId("catalogSearch").closest("label"), byId("catalogSearchApplyActions"));
  top.append(search);
  panel.prepend(top);
  panel.querySelector(".tabSectionHint")?.remove();
  const grid = document.createElement("div");
  grid.className = "catalogWorkspaceGrid";
  const sidebar = document.createElement("details");
  sidebar.className = "catalogWorkspaceFilters";
  sidebar.open = window.matchMedia("(min-width: 761px)").matches;
  const heading = document.createElement("summary");
  heading.textContent = "絞り込み";
  sidebar.append(heading, toolbar);
  toolbar.prepend(byId("catalogClearSearch"));
  const result = document.createElement("section");
  result.className = "catalogWorkspaceResults";
  const sort = document.createElement("div");
  sort.className = "catalogWorkspaceSort";
  ["catalogSort", "catalogSortDir", "catalogLimit"].forEach(id => sort.append(toolbar.querySelector("#" + id).closest("label")));
  const chips = document.createElement("div");
  chips.id = "catalogAppliedFilters";
  chips.className = "catalogAppliedFilters";
  chips.setAttribute("aria-label", "適用中の検索条件");
  const pages = byId("catalogPageControls");
  result.append(summary, chips, sort, table, pages);
  const detail = document.createElement("aside");
  detail.id = "catalogSelectedDetail";
  detail.className = "catalogSelectedDetail";
  detail.setAttribute("aria-label", "選択中の装備");
  detail.innerHTML = '<h3>選択中の装備</h3><p>一覧の装備名を選ぶと、詳細を表示します。</p>';
  grid.append(sidebar, result, detail);
  top.after(grid);
  panel.querySelector(".catalogHelp")?.remove();
  toolbar.querySelector(".catalogMultiStatFilters summary").textContent = "数値条件（すべて満たす）";
  toolbar.querySelector(".catalogBuffEffectFilters summary").textContent = "Buff効果（すべて満たす）";
  // Additional condition rows stay available without occupying the initial view.
  for (const [container, rowClass, label] of [
    [".catalogMultiStatFilterRows", ".catalogMultiStatFilterRow", "数値条件"],
    [".catalogBuffEffectFilterRows", ".catalogBuffEffectFilterRow", "Buff条件"]
  ]) {
    const rows = [...toolbar.querySelectorAll(container + " " + rowClass)];
    rows.slice(1).forEach(row => { row.hidden = true; });
    const button = document.createElement("button");
    button.type = "button"; button.textContent = "+ " + label + "を追加";
    button.onclick = () => {
      const next = rows.find(row => row.hidden);
      if (next) next.hidden = false;
      button.disabled = rows.every(row => !row.hidden);
    };
    toolbar.querySelector(container).after(button);
  }
}
function catalogWorkspaceRefresh(shown, filter, refreshQuality) {
  const detail = byId("catalogSelectedDetail");
  if (!detail) return;
  const idOf = item => String(item.catalogId || item.id || "");
  let selected = shown.find(item => idOf(item) === catalogWorkspaceSelectedId) || shown[0];
  catalogWorkspaceSelectedId = selected ? idOf(selected) : "";
  const renderDetail = () => {
    document.querySelectorAll("#catalogResultsBody [data-catalog-open]").forEach(button => {
      const active = button.dataset.catalogOpen === catalogWorkspaceSelectedId;
      button.setAttribute("aria-pressed", String(active));
      button.closest("tr").classList.toggle("catalogSelectedRow", active);
    });
    if (!selected) { detail.innerHTML = '<h3>選択中の装備</h3><p>該当する装備がありません。検索条件を変更してください。</p>'; return; }
    const item = selected;
    const id = idOf(item);
    const already = registeredCatalogIds().has(catalogRegistrationKey(id, item.catalogQuality));
    const section = (title, text) => '<section><h4>' + title + '</h4><p>' + escapeHtml(text) + '</p></section>';
    let source = "";
    try {
      const url = new URL(item.sourceUrl);
      if (["https:", "http:"].includes(url.protocol)) source = '<a href="' + escapeAttr(url.href) + '" target="_blank" rel="noopener noreferrer">公式DBで確認 ↗</a>';
    } catch {}
    detail.innerHTML = '<div class="catalogDetailEyebrow">選択中の装備</div><h3>' + escapeHtml(item.name || "-") + '</h3>' +
      '<p class="catalogDetailSlot">' + escapeHtml(item.slot || catalogCategoryLabel(item.category)) + '</p>' +
      section("基本性能", item.category === "weapon" ? catalogWeaponSummary(item) : catalogArmorSummary(item)) +
      section("装備条件・性能変動", catalogRequirementAndPerformanceSummary(item)) +
      section("装備の追加効果", catalogStatusSummary(item)) +
      section("装備Buff", catalogBuffSummary(item)) +
      (item.info ? section("説明", item.info) : "") +
      '<div class="catalogDetailActions">' +
      ((+item.weaponDamage || +item.armorClass) ? '<label>品質<select id="catalogDetailQuality"><option value="raw">データ通り</option><option value="HG_MG">HG/MG（生産品×1.1）</option></select></label><p class="small">NG基準の生産品だけHG/MGを指定してください。補正済みの数値には適用しません。</p>' : '') +
      '<button type="button" id="catalogDetailAdd" class="primary" ' + (already ? 'disabled' : '') + '>' + (already ? "登録済み" : "＋ 装備登録に追加") + '</button><p class="small">追加した装備はOFFで登録されます。</p>' + source + '</div>';
    const quality = byId("catalogDetailQuality");
    if (quality) {
      quality.value = item.catalogQuality === "HG_MG" ? "HG_MG" : "raw";
      quality.onchange = () => { catalogSetSelectedQuality(id, quality.value); refreshQuality(); };
    }
    byId("catalogDetailAdd").onclick = () => addCatalogEquipmentToRegistered(id);
  };
  document.querySelectorAll("#catalogResultsBody [data-catalog-open]").forEach(button => {
    button.onclick = () => {
      catalogWorkspaceSelectedId = button.dataset.catalogOpen;
      selected = shown.find(item => idOf(item) === catalogWorkspaceSelectedId);
      renderDetail();
      if (window.matchMedia("(max-width: 1100px)").matches) detail.scrollIntoView({block:"nearest", behavior:"smooth"});
    };
  });
  renderDetail();
  const chips = byId("catalogAppliedFilters");
  chips.replaceChildren();
  const addChip = (text, ids) => {
    const button = document.createElement("button");
    button.type = "button"; button.textContent = text + " ×";
    button.setAttribute("aria-label", text + "を解除して検索");
    button.onclick = () => {
      ids.forEach(id => { const el = byId(id); if (el) {el.value = ""; el.dispatchEvent(new Event("change", {bubbles:true}));} });
      applyCatalogSearch(true);
    };
    chips.append(button);
  };
  const labelFor = (id, value) => [...(byId(id)?.options || [])].find(o => o.value === value)?.textContent || value;
  if (filter.query) addChip(filter.query, ["catalogSearch"]);
  for (const [key,id] of [["category","catalogCategory"],["slot","catalogSlot"],["buffMode","catalogBuffMode"]])
    if (filter[key]) addChip((key === "buffMode" ? "Buff：" : "") + labelFor(id,filter[key]), [id]);
  // Conditions use a compact read-only summary; individual rows retain their existing controls.
  const description = catalogStatFiltersDescription(filter);
  if (description) { const span = document.createElement("span"); span.textContent = description; chips.append(span); }
}
