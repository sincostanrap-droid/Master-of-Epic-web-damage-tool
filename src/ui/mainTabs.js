/*
  Main tab navigation

  メインタブの定義、表示切替、初期レイアウト構築を管理します。
*/

const MAIN_TABS = [
  {id:"calc", label:"計算", hint:"基本設定、サマリー、分析、実測差分、最適化計算をここにまとめています。"},
  {id:"attackDps", label:"アタックDPS α", hint:"通常アタックのクリティカルキャンセル前提DPSを参考値として計算します。単発ダメージ、ディレイ短縮、モーション発生フレームを分けて扱います。"},
  {id:"skill", label:"スキルシミュレータ", hint:"スキル合計850、残りポイント、種族別の簡易ステータスを確認します。計算タブへは常時自動反映します。"},
  {id:"equipment", label:"装備登録", hint:"武器・防具・装飾候補、装備Buff、AC/HP/命中などの追加ステータスを部位ごとのカテゴリで登録します。候補追加はここで行います。"},
  {id:"catalog", label:"装備カタログ", hint:"Git上の生成カタログから装備を検索し、必要なものだけ装備登録へ追加します。カタログ上にあるだけでは計算対象になりません。"},
  {id:"combatLog", label:"戦闘ログ解析 α", hint:"MoEの戦闘ログをブラウザ内だけで解析し、与ダメージ、クリティカル、ミス、DPMを集計します。"},
  {id:"buffs", label:"Buff登録", hint:"装備以外のBuff、外枠補正、その他バフを登録します。"},
  {id:"groups", label:"競合グループ", hint:"同一グループで重複しないBuffを確認します。"},
  {id:"showcase", label:"見せびらかし", hint:"現在構成のダメージ、ステータス、装備、Buffを一覧表示します。"},
  {id:"save", label:"保存・読込", hint:"JSON/TSV/プリセットを扱います。これまでのJSON/TSV形式はそのまま読み込めます。"}
];

function activateMainTab(id) {
  const valid = MAIN_TABS.some(t => t.id === id) ? id : "calc";
  document.querySelectorAll(".mainTabButton").forEach(btn => {
    const active = btn.dataset.tabId === valid;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  document.querySelectorAll(".mainTabPanel").forEach(panel => {
    panel.hidden = panel.dataset.tabPanel !== valid;
  });
  localStorage.setItem("moeDamageSimActiveTab", valid);
  document.dispatchEvent(new CustomEvent("moe:main-tab-activated", {
    detail: {id: valid}
  }));
  if (valid === "catalog") renderCatalogTab();
  if (valid === "combatLog") renderCombatLogTab();
}

function setupTabLayout() {
  const nav = byId("mainTabNav");
  const panelsWrap = byId("mainTabPanels");
  if (!nav || !panelsWrap) return;
  setupAppVersionBadge(nav);
  if (nav.dataset.ready) return;

  nav.dataset.ready = "1";
  nav.setAttribute("role", "tablist");

  MAIN_TABS.forEach(tab => {
    const btn = makeCell("button", {type:"button", class:"mainTabButton", "data-tab-id":tab.id}, tab.label);
    btn.setAttribute("role", "tab");
    btn.onclick = () => activateMainTab(tab.id);
    nav.appendChild(btn);

    const panel = document.createElement("div");
    panel.className = "mainTabPanel";
    panel.dataset.tabPanel = tab.id;
    panel.setAttribute("role", "tabpanel");

    const hint = document.createElement("div");
    hint.className = "tabSectionHint small";
    hint.textContent = tab.hint;
    panel.appendChild(hint);

    panelsWrap.appendChild(panel);
  });

  document.querySelectorAll("[data-tab-target]").forEach(el => {
    const target = el.dataset.tabTarget || "calc";
    const panel = panelsWrap.querySelector(`[data-tab-panel="${target}"]`);
    if (panel) panel.appendChild(el);
  });

  activateMainTab(localStorage.getItem("moeDamageSimActiveTab") || "calc");
}
