function catalogFilterState() {
  const statFilters = [];
  for (let i = 1; i <= 4; i++) {
    const stat = byId(`catalogStat${i}`)?.value || "";
    const statOp = byId(`catalogStatOp${i}`)?.value || "any";
    const statValueRaw = byId(`catalogStatValue${i}`)?.value || "";
    if (stat) statFilters.push({stat, statOp, statValueRaw});
  }

  // v17単一フィルタUIが残っている環境でも一応読めるようにする。
  if (!statFilters.length) {
    const legacyStat = byId("catalogStat")?.value || "";
    if (legacyStat) {
      statFilters.push({
        stat: legacyStat,
        statOp: byId("catalogStatOp")?.value || "any",
        statValueRaw: byId("catalogStatValue")?.value || ""
      });
    }
  }

  const firstStat = statFilters[0] || null;
  return {
    query: byId("catalogSearch")?.value || "",
    category: byId("catalogCategory")?.value || "",
    slot: byId("catalogSlot")?.value || "",
    statFilters,
    // 旧コード・デバッグ用に1条件目も残す。
    stat: firstStat?.stat || "",
    statOp: firstStat?.statOp || "any",
    statValueRaw: firstStat?.statValueRaw || "",
    statValue: firstStat?.statValueRaw === "" || !firstStat ? NaN : parseFloat(firstStat.statValueRaw),
    buffMode: byId("catalogBuffMode")?.value || "",
    sort: byId("catalogSort")?.value || "name",
    sortDir: byId("catalogSortDir")?.value || "asc",
    limit: +(byId("catalogLimit")?.value || 80) || 200
  };
}

function createCatalogTab(panel) {
  panel.innerHTML = `
    <div class="tabSectionHint small">Git上の生成カタログから装備を検索し、使うものだけ装備登録へコピーします。ここにあるだけでは計算対象になりません。必要スキル/AC/性能変動の手掛かりもカタログ上で確認できます。</div>
    <div class="catalogToolbar cardLike">
      <label>検索 <input id="catalogSearch" type="search" placeholder="装備名・効果・Buff名・必要スキル" autocomplete="off"></label>
      <label>カテゴリ <select id="catalogCategory"><option value="">すべて</option><option value="weapon">武器</option><option value="defense">防具/装飾</option><option value="shield">盾</option></select></label>
      <label>部位 <select id="catalogSlot"><option value="">すべて</option></select></label>
      <div id="catalogSearchApplyActions" class="catalogSearchApplyActions catalogSearchApplyActionsTop">
        <button type="button" id="catalogApplySearch" class="primary">検索</button>
        <button type="button" id="catalogClearSearch">条件クリア</button>
        <span id="catalogSearchApplyHint" class="small mutedText">条件を入力して「検索」で反映します。</span>
      </div>
      <details class="catalogMultiStatFilters">
        <summary>追加ステータス数値フィルタ（最大4条件・すべて満たす）</summary>
        <div class="small mutedText catalogMultiStatFilterHelp">例: 攻撃力 +4以上 / 攻撃ディレイ -1以下 / 命中 +1以上。複数行を入れるとAND条件で絞り込みます。</div>
        <div class="catalogMultiStatFilterRows">
          ${[1,2,3,4].map(i => `
            <div class="catalogMultiStatFilterRow">
              <label>効果${i} <select id="catalogStat${i}" data-catalog-stat-select><option value="">指定なし</option></select></label>
              <label>条件 <select id="catalogStatOp${i}"><option value="any">有無のみ</option><option value="gte">以上</option><option value="lte">以下</option><option value="gt">超</option><option value="lt">未満</option><option value="eq">等しい</option></select></label>
              <label>値 <input id="catalogStatValue${i}" type="number" step="0.1" placeholder="例: -1 / 4"></label>
            </div>`).join("")}
        </div>
      </details>
      <details class="catalogSkillPlusFilters">
        <summary>スキル強化フィルタ（最大4条件・すべて満たす）</summary>
        <div class="small mutedText catalogSkillPlusFilterHelp">例: 戦闘技術 +20以上 / 物まね +20以上。ステータスや成功率には加算せず、装備Buffの〇スキル強化だけを条件にします。</div>
        <div class="catalogSkillPlusFilterRows">
          ${[1,2,3,4].map(i => `
            <div class="catalogSkillPlusFilterRow">
              <label>スキル${i} <select id="catalogSkillPlusSkill${i}" data-skill-plus-filter-select><option value="">指定なし</option></select></label>
              <label>条件 <select id="catalogSkillPlusOp${i}" data-skill-plus-filter-input><option value="gte">以上</option><option value="lte">以下</option><option value="gt">超</option><option value="lt">未満</option><option value="eq">等しい</option><option value="exists">有無のみ</option></select></label>
              <label>値 <input id="catalogSkillPlusValue${i}" data-skill-plus-filter-input type="number" step="0.1" placeholder="例: 20"></label>
            </div>`).join("")}
        </div>
      </details>
      <label>装備Buff <select id="catalogBuffMode"><option value="">すべて</option><option value="with">あり</option><option value="without">なし</option></select></label>
      <label>ソート <select id="catalogSort">
        <option value="name">名称</option><option value="category">種別/部位</option><option value="slot">部位</option><option value="req">装備条件</option><option value="buff">装備Buff名</option><option value="hasBuff">Buff有無</option>
        <option value="weaponDamage">武器ダメージ</option><option value="weaponDelay">攻撃間隔</option>
        <option value="attack">攻撃力</option><option value="magic">魔力</option><option value="speed">速度</option><option value="ac">AC</option>
        <option value="hp">HP</option><option value="mp">MP</option><option value="st">ST</option><option value="maxWeight">最大重量</option><option value="hit">命中</option><option value="avoid">回避</option><option value="attackDelay">攻撃ディレイ</option>
      </select></label>
      <label>順序 <select id="catalogSortDir"><option value="asc">昇順</option><option value="desc">降順</option></select></label>
      <label>1ページ <select id="catalogLimit"><option value="50">50件</option><option value="100">100件</option><option value="200" selected>200件</option><option value="500">500件</option><option value="1000">1000件</option></select></label>
      <button type="button" id="catalogReloadBtn">再読み込み</button>
    </div>
    <div class="catalogSummaryLine"><div id="catalogSummary" class="small mutedText">カタログを確認中...</div><div id="catalogPageControls" class="catalogPageControls"></div></div>
    <div class="catalogTableWrap">
      <table class="catalogTable compactTable">
        <thead><tr><th>名称</th><th>種別</th><th>部位</th><th>条件/変動</th><th>AC</th><th>武器性能</th><th>追加効果</th><th>装備Buff</th><th>参照</th><th>操作</th></tr></thead>
        <tbody id="catalogResultsBody"><tr><td colspan="10" class="small mutedText">読み込み中...</td></tr></tbody>
      </table>
    </div>
    <details class="catalogHelp"><summary>カタログ生成メモ</summary>
      <div class="small mutedText">Googleスプレッドシートから生成する場合は、リポジトリ直下で <code>node tools/build-equipment-catalog-from-google-sheet.mjs</code> を実行し、生成された <code>src/data/generated/*.generated.js</code> をGitに追加してください。取り込み時は <code>addStatuses</code> と <code>extraStats</code> の二重適用を避け、追加効果が2倍にならないようにしています。</div>
    </details>
  `;

  ["catalogSearch", "catalogCategory", "catalogSlot", "catalogStat1", "catalogStatOp1", "catalogStatValue1", "catalogStat2", "catalogStatOp2", "catalogStatValue2", "catalogStat3", "catalogStatOp3", "catalogStatValue3", "catalogStat4", "catalogStatOp4", "catalogStatValue4", "catalogBuffMode", "catalogSort", "catalogSortDir", "catalogLimit"].forEach(id => {
    const el = byId(id);
    if (el) {
      const handler = () => { catalogResetPage(); renderCatalogResults(); };
      el.oninput = handler;
      el.onchange = handler;
    }
  });
  const reload = byId("catalogReloadBtn");
  if (reload) reload.onclick = () => {
    catalogScriptsPromise = null;
    catalogResetPage();
    loadCatalogScriptsOnce().then(() => setupCatalogFilterOptions(true));
  };
}

function setupCatalogFilterOptions(force=false) {
  const items = equipmentCatalogItems();
  const slotSelect = byId("catalogSlot");
  const statSelects = Array.from(document.querySelectorAll('[data-catalog-stat-select]'));
  const legacyStatSelect = byId("catalogStat");
  if (legacyStatSelect && !statSelects.includes(legacyStatSelect)) statSelects.push(legacyStatSelect);

  if (slotSelect && (force || !slotSelect.dataset.ready)) {
    const current = slotSelect.value;
    slotSelect.innerHTML = catalogSlotOptions(items);
    slotSelect.value = current;
    slotSelect.dataset.ready = "1";
  }

  statSelects.forEach(statSelect => {
    if (statSelect && (force || !statSelect.dataset.ready)) {
      const current = statSelect.value;
      statSelect.innerHTML = catalogStatOptions(items);
      statSelect.value = current;
      statSelect.dataset.ready = "1";
    }
  });

  renderCatalogResults();
}

function renderCatalogTab() {
  const panel = document.querySelector('[data-tab-panel="catalog"]');
  if (!panel) return;
  if (!panel.dataset.catalogReady) {
    panel.dataset.catalogReady = "1";
    createCatalogTab(panel);
    loadCatalogScriptsOnce().then(() => {
      document.dispatchEvent(new CustomEvent("moe:catalog-ui-ready"));
      setupCatalogFilterOptions(true);
    });
  } else {
    document.dispatchEvent(new CustomEvent("moe:catalog-ui-ready"));
    setupCatalogFilterOptions(false);
  }
}
