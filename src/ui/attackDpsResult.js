/*
  Attack DPS result view

  攻撃DPSの計算結果を表示用HTMLへ変換します。
  状態の更新やDPS計算式はこのファイルでは扱いません。
*/

function attackDpsDelaySourceListHtml(auto) {
  if (!auto?.sources?.length) return "該当なし";
  const maxShown = 12;
  const shown = auto.sources.slice(0, maxShown)
    .map(s => `${s.kind}: ${s.name} ${s.value > 0 ? "+" : ""}${fmt(s.value, 2)}`);
  if (auto.sources.length > maxShown) shown.push(`ほか ${auto.sources.length - maxShown}件`);
  return shown.map(escapeHtml).join(" / ");
}

function attackDpsResultCard(label, value, note="") {
  return `<div class="attackDpsCard"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b>${note ? `<small>${escapeHtml(note)}</small>` : ""}</div>`;
}

function renderAttackDpsResult(metrics=null) {
  const el = byId("attackDpsResult");
  if (!el) return;
  const r = computeAttackDpsAlpha(metrics);
  const warnHtml = r.warnings.length
    ? `<div class="attackDpsWarnings">${r.warnings.map(w => `<div>⚠ ${escapeHtml(w)}</div>`).join("")}</div>`
    : `<div class="attackDpsOk">α版の計算に必要な最低限の値は入っています。</div>`;

  const weaponText = r.weapon
    ? `${(r.weapon.slot || "武器").replace(/^武器: /, "")} ${r.weapon.name || "名称未入力"}`
    : "手入力/未選択";

  const cards = [
    attackDpsResultCard("1発ダメージ", fmt(r.damage, 0), r.cfg.damageSource === "current" ? "計算タブ参照" : "手入力"),
    attackDpsResultCard("短縮後ディレイ", fmt(r.shortenedDelay, 2), `${fmt(r.delaySec, 3)} 秒 / ${r.cfg.equipmentBuffDelaySource === "auto" ? "自動参照" : "手入力"}`),
    attackDpsResultCard("ダメージ発生", `${fmt(r.damageFrame, 0)} F`, `${fmt(r.damageFrameSec, 3)} 秒`),
    attackDpsResultCard("実アタック周期", fmt(r.periodSec, 3) + " 秒", r.cfg.criticalCancel ? "クリキャン前提" : "非キャンセル"),
    attackDpsResultCard("継続DPS", fmt(r.continuousDps, 2), `命中率 ${fmt(r.hitRate * 100, 1)}%`),
    attackDpsResultCard(`${fmt(r.simSeconds, 0)}秒DPS`, fmt(r.windowDps, 2), `${r.hitCount} hit / 初撃込み`),
    attackDpsResultCard("1分あたり攻撃回数", fmt(r.attacksPerMinute, 2), "理論値")
  ].join("");

  el.innerHTML = `
    ${warnHtml}
    <div class="attackDpsResultGrid">${cards}</div>
    <details class="attackDpsFormula" open>
      <summary>計算内訳</summary>
      <div>計算武器: ${escapeHtml(weaponText)} / 武器ディレイ ${fmt(r.weaponDelay, 2)}${r.cfg.weaponDelaySource === "currentWeapon" ? "（現在武器）" : "（手入力）"}</div>
      <div>装備+Buff枠: raw ${fmt(r.equipBuffRaw, 2)} → 適用 ${fmt(r.equipBuffCapped, 2)} / アタック短縮Buff ${fmt(r.attackDelayBuff, 2)} / ST補正 ${fmt(r.stBonus, 2)} / 手動補正 ${fmt(r.manualBonus, 2)}</div>
      <div>ディレイ短縮自動参照: 装備 ${fmt(r.delayAuto.equipmentTotal, 2)} / Buff ${fmt(r.delayAuto.buffTotal, 2)} / 合計 ${fmt(r.delayAuto.total, 2)}${r.cfg.equipmentBuffDelaySource === "auto" ? "（採用中）" : "（手入力のため未採用）"}</div>
      <div>参照元: ${attackDpsDelaySourceListHtml(r.delayAuto)}</div>
      <div>短縮後ディレイ = 武器ディレイ × ${fmt(r.delayMultiplier, 4)} = ${fmt(r.shortenedDelay, 3)}（${fmt(r.delaySec, 3)}秒）</div>
      <div>周期 = max(短縮後ディレイ秒 ${fmt(r.delaySec, 3)}, ${r.cfg.criticalCancel ? "ダメージ発生秒" : "行動不能秒"} ${fmt(r.motionLockSec, 3)}) = ${fmt(r.periodSec, 3)}秒</div>
      <div>${fmt(r.simSeconds,0)}秒内ヒット数 = ${r.hitCount} / 期待総ダメージ = ${fmt(r.expectedTotalDamage, 0)}</div>
    </details>
  `;
}

function computeAttackDpsAlpha(metrics=null) {
  const cfg = attackDpsState();
  const weapon = selectedWeaponForCalc(state);
  const currentDamage = metrics && Number.isFinite(+metrics.finalDamage) ? Math.floor(+metrics.finalDamage) : 0;
  const currentWeaponDelay = weapon && +weapon.weaponAttackInterval > 0 ? +weapon.weaponAttackInterval : 0;
  const delayAuto = collectAttackDpsDelaySources(state);
  return calculateAttackDps({cfg, weapon, currentDamage, currentWeaponDelay, delayAuto});
}

function renderAttackDpsTab(metrics=null) {
  const panel = document.querySelector('[data-tab-panel="attackDps"]');
  if (!panel) return;
  if (!panel.dataset.attackDpsReady) {
    panel.dataset.attackDpsReady = "1";
    createAttackDpsTab(panel);
  }
  state.attackDps = normalizeAttackDpsState(state.attackDps);
  renderAttackDpsResult(metrics);
}
