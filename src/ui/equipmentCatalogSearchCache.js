/* __MOE_EQUIPMENT_CATALOG_APPLY_SEARCH_CACHE_V1__
 * 装備カタログ:
 * - 入力中は全件filter/sortを行わない
 * - 「検索」またはEnterで条件を適用
 * - 適用済み検索結果をキャッシュ
 * - ページ送りはcache.sliceのみ
 * - 追加ステータスと装備Buff効果の複数条件をそのまま利用
 */
(function installEquipmentCatalogApplySearchCacheV1(global) {
  if (!global || global.__MOE_EQUIPMENT_CATALOG_APPLY_SEARCH_CACHE_V1__) return;
  global.__MOE_EQUIPMENT_CATALOG_APPLY_SEARCH_CACHE_V1__ = true;

  const cache = {
    filter: null,
    items: [],
    filtered: [],
    total: 0,
    ready: false,
    applying: false,
    sourceSignature: "",
    lastRenderedPage: -1,
    page: 0
  };

  const modeCaches=new Map();
  global.restoreCatalogSearchMode=mode=>{
    if(cache.ready)modeCaches.set(cache.filter?.specialization?.enabled?'special':'normal',{...cache});
    const saved=modeCaches.get(mode);
    if(saved){Object.assign(cache,saved);renderPage();updateDirtyHint(false);}else applySearch(true);
  };
  function applySearch(resetPage=true, keepFilter=false) {
    if (cache.applying) return;
    cache.applying = true;

    try {
      const items = typeof global.equipmentCatalogItems === "function"
        ? global.equipmentCatalogItems().map(item => global.catalogItemWithQuality(item, global.catalogSelectedQuality(item)))
        : [];
      const filter = keepFilter && cache.filter ? cache.filter : typeof global.catalogFilterState === "function"
        ? (global.catalogFilterState() || {})
        : {};
      const matched = items.filter(item =>
        typeof global.catalogItemMatches !== "function"
          || global.catalogItemMatches(item, filter)
      );
      const spec = filter.specialization;
      const specialized = spec?.enabled && typeof global.catalogEffectProjection === "function";
      const filtered = specialized
        ? matched.filter(item => (spec.showExcluded || catalogCandidatePolicy.get(item)!=='excluded') && global.MOEEquipmentEffectFacets.matches(global.catalogEffectProjection(item), spec.axes))
          .sort((a,b) => global.MOEEquipmentEffectFacets.compare(a,b,spec.axes,spec.sort,global.catalogEffectProjection))
        : typeof global.sortCatalogItems === "function"
        ? global.sortCatalogItems(matched, filter)
        : matched;

      cache.filter = filter;
      cache.items = items;
      cache.filtered = filtered;
      cache.total = items.length;
      cache.ready = true;

      if (resetPage) {
        cache.page = 0;
        if (typeof global.catalogResetPage === "function") {
          global.catalogResetPage();
        }
      }

      renderPage();
      updateDirtyHint(false);
    } finally {
      cache.applying = false;
    }
  }

  function renderCachedPageControls(filteredLength, pageCount, limit) {
    const box = typeof global.byId === "function"
      ? global.byId("catalogPageControls")
      : document.getElementById("catalogPageControls");
    if (!box) return;

    const page = cache.page;
    const start = filteredLength ? page * limit + 1 : 0;
    const end = filteredLength ? Math.min(filteredLength, (page + 1) * limit) : 0;

    box.innerHTML = `
      <button type="button" id="catalogPrevPage" ${page <= 0 ? "disabled" : ""}>前へ</button>
      <span class="small">${pageCount ? page + 1 : 0} / ${pageCount || 0} ページ（${start}-${end} / ${filteredLength}件）</span>
      <button type="button" id="catalogNextPage" ${page >= pageCount - 1 ? "disabled" : ""}>次へ</button>
    `;

    const prev = document.getElementById("catalogPrevPage");
    const next = document.getElementById("catalogNextPage");

    if (prev) prev.onclick = () => {
      cache.page = Math.max(0, cache.page - 1);
      renderPage();
    };

    if (next) next.onclick = () => {
      cache.page = Math.min(Math.max(0, pageCount - 1), cache.page + 1);
      renderPage();
    };
  }

  function renderPage() {
    const body = typeof global.byId === "function"
      ? global.byId("catalogResultsBody")
      : document.getElementById("catalogResultsBody");
    const summary = typeof global.byId === "function"
      ? global.byId("catalogSummary")
      : document.getElementById("catalogSummary");

    if (!body || !summary) return;

    if (!cache.ready) {
      applySearch(false);
      return;
    }

    const filter = cache.filter || {};
    const filtered = cache.filtered || [];
    const limit = Math.max(25, Math.min(1000, +(filter.limit || 200)));
    const pageCount = filtered.length ? Math.ceil(filtered.length / limit) : 0;

    cache.page = Math.max(
      0,
      Math.min(
        +(cache.page || 0),
        Math.max(0, pageCount - 1)
      )
    );

    const start = cache.page * limit;
    const shown = filtered.slice(start, start + limit);
    const already = typeof global.registeredCatalogIds === "function"
      ? global.registeredCatalogIds()
      : new Set();
    if (typeof global.catalogSpecialHeader === "function") global.catalogSpecialHeader(filter);

    body.innerHTML = shown.length
      ? shown.map(item =>
          (filter.specialization?.enabled && typeof global.catalogSpecialRowHtml === "function"
            ? (item, already) => global.catalogSpecialRowHtml(item, already, filter.specialization)
            : global.catalogResultRowHtml)(
            item,
            already.has(global.catalogRegistrationKey(item.catalogId || item.id || "", item.catalogQuality))
          )
        ).join("")
      : `<tr><td colspan="${filter.specialization?.enabled ? 9 : 5}" class="small mutedText">${filter.specialization?.enabled && !filter.specialization.axes[0].key ? 'メイン効果を選んで検索してください。' : '該当する装備がありません。'}</td></tr>`;

    const statText = typeof global.catalogStatFiltersDescription === "function"
      ? global.catalogStatFiltersDescription(filter)
      : "";

    summary.textContent =
      `カタログ ${cache.total}件 / 該当 ${filtered.length}件 / 表示 ${shown.length}件` +
      (statText ? ` / ${statText}` : "");
    if (filter.specialization?.enabled) summary.textContent += " / 特化検索 α・候補効果（競合前）";

    renderCachedPageControls(
      filtered.length,
      pageCount,
      limit
    );

    if (typeof global.catalogWorkspaceRefresh === "function") global.catalogWorkspaceRefresh(shown, filter, () => applySearch(false, true));

    body.querySelectorAll("[data-catalog-quality]").forEach(select => {
      select.onchange = () => {
        global.catalogSetSelectedQuality(select.dataset.catalogQuality, select.value);
        applySearch(false, true);
      };
    });
    body.querySelectorAll("[data-catalog-add]").forEach(btn => {
      btn.onclick = () => {
        if (typeof global.addCatalogEquipmentToRegistered === "function") {
          global.addCatalogEquipmentToRegistered(btn.dataset.catalogAdd);
        }
        renderPage();
      };
    });
  }

  let dirtyHintState = null;
  function updateDirtyHint(dirty=true) {
    const nextState = !!dirty;
    if (dirtyHintState === nextState) return;
    dirtyHintState = nextState;
    const button = document.getElementById("catalogApplySearch");
    const hint = document.getElementById("catalogSearchApplyHint");

    if (button) button.classList.toggle("catalogSearchPending", nextState);
    if (hint) {
      hint.textContent = nextState
        ? "条件が変更されています。「検索」で反映してください。"
        : "表示中の条件を適用済みです。";
      hint.classList.toggle("warnText", nextState);
    }
  }

  function clearDraftControls() {
    const specialEnabled = document.getElementById("catalogSpecialEnabled");
    if (specialEnabled) specialEnabled.checked = false;
    const direct = {
      catalogSearch: "",
      catalogCategory: "",
      catalogSlot: "",
      catalogBuffMode: "",
      catalogSort: "name",
      catalogSortDir: "asc"
    };

    Object.entries(direct).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    });

    for (let i = 1; i <= 4; i++) {
      const stat = document.getElementById(`catalogStat${i}`);
      const op = document.getElementById(`catalogStatOp${i}`);
      const value = document.getElementById(`catalogStatValue${i}`);
      if (stat) stat.value = "";
      if (op) op.value = "any";
      if (value) value.value = "";

      const effect = document.getElementById(`catalogBuffEffect${i}`);
      const target = document.getElementById(`catalogBuffEffectTarget${i}`);
      const effectOp = document.getElementById(`catalogBuffEffectOp${i}`);
      const effectValue = document.getElementById(`catalogBuffEffectValue${i}`);
      if (effect) effect.value = "";
      if (target) target.value = "";
      if (effectOp) effectOp.value = "exists";
      if (effectValue) effectValue.value = "";
      if (typeof global.updateCatalogBuffEffectFilterRow === "function") {
        global.updateCatalogBuffEffectFilterRow(i);
      }
    }
  }

  function ensureControls() {
    const toolbar = document.querySelector(".catalogToolbar");
    const search = document.getElementById("catalogSearch");
    if (!toolbar || !search) return false;

    let actions = document.getElementById("catalogSearchApplyActions");
    if (!actions) {
      actions = document.createElement("div");
      actions.id = "catalogSearchApplyActions";
      actions.className = "catalogSearchApplyActions";

      const apply = document.createElement("button");
      apply.type = "button";
      apply.id = "catalogApplySearch";
      apply.className = "primary";
      apply.textContent = "検索";
      apply.onclick = () => applySearch(true);

      const clear = document.createElement("button");
      clear.type = "button";
      clear.id = "catalogClearSearch";
      clear.textContent = "条件クリア";
      clear.onclick = () => {
        clearDraftControls();
        applySearch(true);
      };

      const hint = document.createElement("span");
      hint.id = "catalogSearchApplyHint";
      hint.className = "small mutedText";
      hint.textContent = "条件を入力して「検索」で反映します。";

      actions.append(apply, clear, hint);
      toolbar.appendChild(actions);
    }

    const applyButton = document.getElementById("catalogApplySearch");
    if (applyButton && applyButton.dataset.catalogApplyReady !== "1") {
      applyButton.dataset.catalogApplyReady = "1";
      applyButton.onclick = () => applySearch(true);
    }
    const clearButton = document.getElementById("catalogClearSearch");
    if (clearButton && clearButton.dataset.catalogClearReady !== "1") {
      clearButton.dataset.catalogClearReady = "1";
      clearButton.onclick = () => {
        clearDraftControls();
        applySearch(true);
      };
    }

    if (search.dataset.catalogApplyEnterReady !== "1") {
      search.addEventListener("keydown", event => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        event.stopPropagation();
        applySearch(true);
      }, true);
      search.dataset.catalogApplyEnterReady = "1";
    }

    const draftSelector = [
      "#catalogSearch",
      "#catalogCategory",
      "#catalogSlot",
      "#catalogBuffMode",
      "#catalogSort",
      "#catalogSortDir",
      "#catalogLimit",
      "[data-catalog-stat-filter-input]",
      "[data-catalog-stat-filter-select]",
      "[data-catalog-buff-effect-input]",
      "[data-catalog-buff-effect-select]"
      ,"[data-catalog-special]"
    ].join(",");

    document.querySelectorAll(draftSelector).forEach(el => {
      // catalogTab.js の旧即時描画ハンドラーを解除する。
      // 検索条件は「検索」または Enter を押した時だけ適用する。
      el.oninput = null;
      el.onchange = null;
      if (el.dataset.catalogApplyDirtyReady === "1") return;
      const mark = () => updateDirtyHint(true);
      el.addEventListener("input", mark, true);
      el.addEventListener("change", mark, true);
      el.dataset.catalogApplyDirtyReady = "1";
    });

    return true;
  }

  function installRenderOverride() {
    // v23の性能ラッパー適用後に、再試行bootが素の描画関数へ戻すのを防ぐ。
    if (!global.renderCatalogResults?.__catalogPerfV23Wrapped) {
      global.renderCatalogResults = renderPage;
    }
    global.applyCatalogSearch = applySearch;
    global.renderCatalogCachedPage = renderPage;
  }

  function boot() {
    installRenderOverride();
    if (!ensureControls()) return false;
    if (!cache.ready) applySearch(false);
    return true;
  }

  if (typeof document !== "undefined") {
    let catalogSearchCacheInitialized = false;
    global.__MOE_INITIALIZE_CATALOG_SEARCH_CACHE_V1__ = () => {
      if (catalogSearchCacheInitialized) return true;
      catalogSearchCacheInitialized = boot();
      return catalogSearchCacheInitialized;
    };
  } else {
    installRenderOverride();
  }
})(typeof window !== "undefined" ? window : globalThis);
