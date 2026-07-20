/* v1.22.0: 構成診断・比較モード */
function effectiveStateForAnalysis(st) {
  const cloned = clone(st || state);
  return (typeof expandSkillSimMasteryBuffState === "function") ? expandSkillSimMasteryBuffState(cloned) : cloned;
}
function safeMetricsForConfig(config) {
  const cfg = config && config.inputs && config.state ? config : collectConfig();
  return computeMetrics(effectiveStateForAnalysis(cfg.state), cfg.inputs || collectInputs());
}
function buildDiagnosticsForConfig(config=null) {
  const cfg = config && config.inputs && config.state ? config : collectConfig();
  const st = clone(cfg.state || state);
  const effective = effectiveStateForAnalysis(st);
  const metrics = computeMetrics(effective, cfg.inputs || collectInputs());
  const issues = [];
  const slotTotal = +(metrics?.slots?.total || 0);
  const slotLimit = +(metrics?.slots?.limit || 24);

  if (slotTotal > slotLimit) {
    issues.push({level:"bad", title:"Buff枠が上限を超えています", body:`現在 ${fmt(slotTotal,0)} / ${fmt(slotLimit,0)} 枠です。固定・除外チェックで候補を整理してください。`});
  } else if (slotTotal >= slotLimit - 2) {
    issues.push({level:"warn", title:"Buff枠がかなり埋まっています", body:`現在 ${fmt(slotTotal,0)} / ${fmt(slotLimit,0)} 枠です。実戦で追加Buffを入れる余裕が少なめです。`});
  } else {
    issues.push({level:"ok", title:"Buff枠は範囲内です", body:`現在 ${fmt(slotTotal,0)} / ${fmt(slotLimit,0)} 枠です。`});
  }

  const weapon = selectedWeaponForCalc(effective);
  if (!weapon) {
    issues.push({level:"warn", title:"右手武器が未設定です", body:"装備候補または武器手入力が空の場合、火力比較の精度が落ちます。"});
  } else {
    const missing = [];
    if (!(+weapon.weaponDamage > 0)) missing.push("ダメージ");
    if (!(+weapon.weaponWeight > 0)) missing.push("攻撃間隔/重量");
    if (missing.length) issues.push({level:"warn", title:"武器情報に不足があります", body:`${escapeHtml(weapon.name || "選択武器")} の ${missing.join("・")} が未設定です。`});
  }

  const buffRows = [].concat(st.composite || [], st.post || [], st.other || []);
  const fixedExcluded = buffRows.filter(r => r && r.fixed && r.excluded);
  if (fixedExcluded.length) issues.push({level:"warn", title:"固定かつ除外のBuffがあります", body:`${fixedExcluded.length}件あります。意図通りなら問題ありませんが、最適化対象からは外れます。`});

  const disabledFixed = buffRows.filter(r => r && r.fixed && r.enabled === false && !r.excluded);
  if (disabledFixed.length) issues.push({level:"warn", title:"固定されているが使用OFFのBuffがあります", body:`${disabledFixed.length}件あります。固定したまま外す運用なら除外チェックも検討してください。`});

  const activeMasteries = typeof activeSkillSimMasteries === "function" ? activeSkillSimMasteries() : [];
  if (activeMasteries.length) issues.push({level:"ok", title:"発動中マスタリーがあります", body:`${activeMasteries.map(m => escapeHtml(m.name)).join(" / ")}。マスタリー分のBuff枠も計算へ反映しています。`});

  const skillValues = st.skillSim?.skills || {};
  const highSkills = Object.values(skillValues).filter(v => +v >= 90).length;
  if (highSkills >= 8) issues.push({level:"note", title:"高スキル構成です", body:`90以上のスキルが ${highSkills} 個あります。実際の合計スキル上限に収まっているか確認してください。`});

  const excludedCount = [].concat(st.composite || [], st.post || [], st.other || [], st.equipment || []).filter(r => r && r.excluded).length;
  if (excludedCount) issues.push({level:"note", title:"除外中の候補があります", body:`${excludedCount}件が除外中です。比較や最適化に含めたい場合は除外を外してください。`});

  const eqRows = Array.isArray(st.equipment) ? st.equipment : [];
  if (eqRows.length > 120) issues.push({level:"note", title:"装備候補が多めです", body:`装備候補が ${eqRows.length}件あります。最適化が重い場合はフィルタや除外で絞ると安定します。`});

  return {issues, metrics};
}
function buildDiagnosticsHtml(result) {
  const issues = result?.issues || [];
  if (!issues.length) return `<div class="diagItem ok"><b>大きな注意点はありません。</b><p>現在の構成はそのまま比較・保存できます。</p></div>`;
  return issues.map(x => `<div class="diagItem ${escapeHtml(x.level || "note")}"><b>${escapeHtml(x.title || "")}</b><p>${x.body || ""}</p></div>`).join("");
}
function renderBuildDiagnostics() {
  const el = byId("buildDiagnostics");
  if (!el) return;
  try { el.innerHTML = buildDiagnosticsHtml(buildDiagnosticsForConfig()); }
  catch (e) { el.innerHTML = `<div class="diagItem bad"><b>構成診断でエラーが出ました</b><p>${escapeHtml(e?.message || e)}</p></div>`; }
}
function refreshComparePresetSelect() {
  const sel = byId("comparePresetSelect");
  if (!sel) return;
  try { if (!namedPresets || typeof namedPresets !== "object") loadNamedPresetsFromStorage(); } catch {}
  const names = Object.keys(namedPresets || {}).sort((a,b) => a.localeCompare(b, "ja"));
  sel.innerHTML = names.length ? names.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("") : `<option value="">保存済みなし</option>`;
}
function compareMetricRows(current, base) {
  const rows = [
    ["ダメージ", current.rawDamage, base.rawDamage, ""],
    ["攻撃力", current.atk, base.atk, ""],
    ["魔力", current.magic, base.magic, ""],
    ["攻撃間隔", current.interval, base.interval, ""],
    ["Buff枠", current.slots?.total, base.slots?.total, "枠"]
  ];
  return rows.map(([label, cur, old, suffix]) => {
    const c = +cur || 0, o = +old || 0, diff = c - o;
    const cls = diff > 0 ? "plus" : diff < 0 ? "minus" : "";
    const sign = diff > 0 ? "+" : "";
    return `<tr><th>${escapeHtml(label)}</th><td>${fmt(o,2)}${suffix}</td><td>${fmt(c,2)}${suffix}</td><td class="${cls}">${sign}${fmt(diff,2)}${suffix}</td></tr>`;
  }).join("");
}
function compareCurrentWithPreset() {
  const out = byId("buildCompareResult");
  const sel = byId("comparePresetSelect");
  if (!out || !sel) return;
  const name = sel.value;
  if (!name || !namedPresets?.[name]) {
    out.innerHTML = `<div class="diagItem warn"><b>比較するプリセットを選んでください。</b></div>`;
    return;
  }
  try {
    const currentCfg = collectConfig();
    const presetCfg = namedPresets[name].config || namedPresets[name];
    const current = safeMetricsForConfig(currentCfg);
    const base = safeMetricsForConfig(presetCfg);
    out.innerHTML = `<div class="compareTitle">比較対象: ${escapeHtml(name)} → 現在構成</div>
      <table class="compareTable"><thead><tr><th>項目</th><th>プリセット</th><th>現在</th><th>差分</th></tr></thead><tbody>${compareMetricRows(current, base)}</tbody></table>
      <div class="compareDiag"><details><summary>現在構成の診断も見る</summary>${buildDiagnosticsHtml(buildDiagnosticsForConfig(currentCfg))}</details></div>`;
  } catch (e) {
    out.innerHTML = `<div class="diagItem bad"><b>比較でエラーが出ました</b><p>${escapeHtml(e?.message || e)}</p></div>`;
  }
}
function renderAnalysisPanel() {
  refreshComparePresetSelect();
  renderBuildDiagnostics();
}
(function(){
  if (typeof calc !== "function" || calc.__analysisWrapped) return;
  const originalCalc = calc;
  calc = function(...args) {
    const result = originalCalc.apply(this, args);
    try { if (typeof renderAnalysisPanel === "function") renderAnalysisPanel(); } catch {}
    return result;
  };
  calc.__analysisWrapped = true;
})();
