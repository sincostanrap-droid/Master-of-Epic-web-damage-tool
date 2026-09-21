/* 属性強化の表示用合計。物理ダメージ式へは加算しない。 */
function showcaseElementDamageTotals(resolvedState) {
  const totals = Object.create(null);
  // 装備Buff展開・競合解決済みの行を使い、装備本体から二重取得しない。
  normalizeCompositeRows(resolvedState?.composite)
    .filter(row => row.enabled && !row.excluded)
    .forEach(row => normalizeAdditionalEffects(row.extraEffects).forEach(effect => {
      if (effect.key !== "elementDamagePct" || !effect.name || !Number.isFinite(effect.value)) return;
      totals[effect.name] = (totals[effect.name] || 0) + effect.value;
    }));
  return totals;
}

function renderShowcaseElementDamageTotals(resolvedState) {
  const body = Object.entries(showcaseElementDamageTotals(resolvedState))
    .filter(([, value]) => value)
    .sort(([a], [b]) => a.localeCompare(b, "ja"))
    .map(([name, value]) => `${name}ダメージ ${value > 0 ? "+" : ""}${fmt(value, 2)}%`)
    .join(" / ");
  renderShowcaseTotal("element", "属性強化合計", body, "showcaseElementDamageTotals");
}
