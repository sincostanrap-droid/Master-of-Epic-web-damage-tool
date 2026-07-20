/*
  Application version badge

  ページタイトルと画面上のバージョン表示を現在のビルド情報へ同期します。
*/

function setupAppVersionBadge(nav) {
  const versionText = `${APP_VERSION} / ${APP_VERSION_NOTE}`;
  document.title = `Master of Epic 物理ダメージ計算webツール ${APP_VERSION}`;

  // 既存HTML側にバージョン専用要素がある場合は、それを必ず更新する。
  [
    byId("appVersion"),
    byId("appVersionText"),
    byId("versionLabel"),
    document.querySelector("[data-app-version]")
  ].filter(Boolean).forEach(el => {
    el.textContent = versionText;
  });

  let badge = byId("appVersionBadge");

  const title = Array.from(document.querySelectorAll("h1"))
    .find(el => /Master of Epic 物理ダメージ計算webツール/.test(el.textContent || ""));

  // 旧HTMLに「タイトル直下の静的バージョン表記」が残っている場合は、それを再利用して更新する。
  if (!badge && title) {
    const next = title.nextElementSibling;
    if (next && next.id !== "mainTabNav" && !next.matches("nav, .mainTabs, .mainTabNav") && /(?:v\d+\.\d+|Build|version|バージョン)/i.test(next.textContent || "")) {
      badge = next;
      badge.id = "appVersionBadge";
      badge.classList.add("appVersionBadge");
    }
  }

  if (!badge) {
    badge = document.createElement("div");
    badge.id = "appVersionBadge";
    badge.className = "appVersionBadge";
  }
  badge.textContent = versionText;

  if (title && title.parentNode) {
    if (title.nextSibling !== badge) title.parentNode.insertBefore(badge, title.nextSibling);
  } else if (nav && nav.parentNode) {
    nav.parentNode.insertBefore(badge, nav);
  }
}
