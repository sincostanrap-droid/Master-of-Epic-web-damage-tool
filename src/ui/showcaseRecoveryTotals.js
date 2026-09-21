/* 計算済みの追加ステータスを表示。/分と/秒は変換せず別々に示す。 */
function showcaseRecoverySummary(metrics) {
  const fields = [
    ["hpRegenPerMinute", "HP自然回復", "/分"],
    ["stRegenPerMinute", "ST自然回復", "/分"],
    ["mpRegenPerMinute", "MP自然回復", "/分"],
    ["hpChangePerSecond", "HP増減", "/秒"],
    ["stChangePerSecond", "ST増減", "/秒"],
    ["mpChangePerSecond", "MP増減", "/秒"]
  ];
  return fields.flatMap(([key, label, unit]) => {
    const value = Number(metrics?.extraStats?.[key] || 0);
    return value && Number.isFinite(value)
      ? [`${label} ${value > 0 ? "+" : ""}${fmt(value, 2)}${unit}`] : [];
  }).join(" / ");
}

function renderShowcaseRecoveryTotals(metrics) {
  renderShowcaseTotal("recovery", "自然回復・継続増減合計",
    showcaseRecoverySummary(metrics), "showcaseRecoveryTotals");
}
