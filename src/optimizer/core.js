/*
  optimizer/core.js

  最適化の重い本体です。
  現時点では既存ロジックの安全分離を優先しており、
  normalize系・computeMetrics系などは src/main.js 側の関数を参照します。

  役割:
  - runOptimizerCore(payload, onProgress)
  - makeOptimizerStatusText(...)
*/

function makeOptimizerStatusText({settings, equipmentBeams, buffEvalBeams, results, elapsed}) {
  const equipmentRowsForStatus = optimizerEquipmentRows(settings);
  const equipCount = equipmentRowsForStatus.filter(equipmentCandidateHasData).length;
  const equipExcludedCount = equipmentRowsForStatus.filter(r => r.optimizerExcluded && equipmentCandidateHasData(r)).length;
  const equipFixedCount = equipmentRowsForStatus.filter(r => r.optimizerFixed && equipmentCandidateHasData(r)).length;
  const buffCount = optimizerCompositeCandidates(settings).length;
  const fixedOtherSlots = settings.forceOtherBuffs ? (state.other || []).filter(r => r.enabled).length : 0;
  const otherMode = settings.forceOtherBuffs ? `${fixedOtherSlots}件` : "無視";
  const optimizerFixedText = equipFixedCount ? ` / 固定装備 ${equipFixedCount}件` : "";
  const optimizerExcludeText = equipExcludedCount ? ` / 検索除外装備 ${equipExcludedCount}件` : "";
  const conflictSkipText = settings.equipmentConflictSkipped ? ` / 競合装備除外 ${settings.equipmentConflictSkipped}件` : "";
  const pruneText = settings.optimizerPrunedBuffs ? ` / 不要Buff整理 ${settings.optimizerPrunedBuffs}件` : "";
  const capText = settings.optimizerCapRejected ? ` / 上限超過候補 ${settings.optimizerCapRejected}件除外` : "";
  const duplicateText = settings.optimizerDuplicateRemoved ? ` / 重複構成 ${settings.optimizerDuplicateRemoved}件整理` : "";
  const cacheText = settings.optimizerEvalCount ? ` / 確認 ${settings.optimizerEvalCount}回 / 再利用 ${settings.optimizerCacheHits || 0}回` : "";
  const currentText = settings.includeCurrentConfig
    ? ` / 現在ON構成 ${settings.optimizerCurrentConfigIncluded ? "比較済み" : "比較なし"}`
    : "";
  const betterOnlyText = settings.onlyBetterThanCurrent
    ? ` / 現在ON超え ${settings.optimizerBetterThanCurrentCount ?? 0}件${settings.optimizerBetterThanCurrentFiltered ? `（${settings.optimizerBetterThanCurrentFiltered}件非表示）` : ""}`
    : "";
  const currentEquipSeedText = settings.evaluateCurrentEquipment
    ? ` / 現在ON装備Buff最適化 ${settings.optimizerCurrentEquipmentSeedStatus || "未実行"}`
    : "";
  const accuracyText = settings.accuracyPreset === "fast" ? "高速" : settings.accuracyPreset === "accurate" ? "精度重視" : "標準";
  const equipmentModeText = settings.optimizerEquipmentSearchMode === "exact"
    ? `装備を全通り確認 ${settings.optimizerEquipmentExactTotal || equipmentBeams.length}通り`
    : `装備候補を一部確認 / 全候補 ${settings.optimizerEquipmentExactTotal || "-"}通り`;
  const buffModeText = settings.buffMode === "fast" ? "高速" : settings.buffMode === "beam" ? `深掘り 広さ${settings.buffBeamWidth}` : `標準 仕上げ${settings.localPasses}回`;
  const objectiveText = `${optimizerObjectiveLabel(settings.objective)}${settings.secondaryObjective ? " > " + optimizerObjectiveLabel(settings.secondaryObjective) : ""}`;
  const targetText = optimizerPrimaryTargetDescription(settings);

  return `検索完了: 精度 ${accuracyText} / 目標 ${objectiveText}${targetText ? " / " + targetText : ""} / 装備候補 ${equipCount}件${optimizerFixedText}${optimizerExcludeText} / 装備以外Buff候補 ${buffCount}件 / ${equipmentModeText} / Buff検索 ${buffModeText} / その他固定枠 ${otherMode}${conflictSkipText}${pruneText}${capText}${duplicateText}${cacheText}${currentText}${betterOnlyText}${currentEquipSeedText} / 装備組み合わせ ${equipmentBeams.length}件中 ${buffEvalBeams.length}件確認 / 表示 ${results.length}件 / ${elapsed}ms`;
}

function optimizerCurrentSelectionKey(result, settings=null) {
  return [
    optimizerEquipmentSelectionKey(result?.equipmentIdxs || [], settings),
    optimizerCompositeSelectionKey(result?.compositeIdxs || []),
    result?.forceOtherBuffs === false ? "noOther" : "other"
  ].join("|");
}

function optimizerCurrentEnabledEquipmentIdxs(settings) {
  return optimizerEquipmentRows(settings)
    .map((row, idx) => ({row, idx}))
    .filter(x => x.row.enabled !== false && optimizerEquipmentRowHasVisibleData(x.row))
    .map(x => x.idx);
}

function optimizerCurrentEnabledCompositeIdxs(settings) {
  return optimizerCompositeRows(settings)
    .map((row, idx) => ({row, idx}))
    .filter(x => x.row.enabled && compositeHasEffect(x.row))
    .map(x => x.idx);
}

function optimizerBuildCurrentConfigResult(inputs, settings) {
  const equipmentIdxs = optimizerCanonicalEquipmentIdxs(optimizerCurrentEnabledEquipmentIdxs(settings), settings);
  const compositeIdxs = optimizerCompositeSelectionKey(optimizerCurrentEnabledCompositeIdxs(settings))
    .split(",")
    .filter(Boolean)
    .map(x => parseInt(x, 10));

  const ev = optimizerEvaluateBuffSelection(equipmentIdxs, compositeIdxs, inputs, settings);
  const metrics = ev.metrics;
  const reasons = [];
  const capViolations = optimizerStatCapViolations(metrics, settings).concat(optimizerTargetOverViolations(metrics, settings));

  if (metrics.slots.total > settings.maxSlots) {
    reasons.push(`バフ枠超過 ${metrics.slots.total}/${settings.maxSlots}`);
  }
  capViolations.forEach(x => reasons.push(x));

  const equipmentConflicts = optimizerEquipmentConflictNames(equipmentIdxs);
  if (equipmentConflicts.length) {
    reasons.push(`装備競合 ${equipmentConflicts.join(", ")}`);
  }

  if (ev.score <= OPTIMIZER_INVALID_SCORE / 2 && !capViolations.length) {
    reasons.push("目的/上限判定で無効スコア");
  }

  return {
    equipmentIdxs,
    compositeIdxs,
    metrics,
    score: ev.score,
    rank: ev.rank,
    equipmentSummary: optimizerEquipmentSummaryByIdx(equipmentIdxs, metrics),
    equipmentConflicts,
    capViolations,
    prunedCount: 0,
    forceOtherBuffs: settings.forceOtherBuffs,
    sourceLabel: "現在ON",
    currentConfig: true,
    forcedVisible: true,
    baselineInvalid: reasons.length > 0,
    baselineReasons: reasons
  };
}

function optimizerResultPassesDisplayFilters(result, settings) {
  if (!result || !result.metrics) return false;
  return result.metrics.slots.total <= settings.maxSlots
    && !(result.capViolations || []).length
    && result.score > OPTIMIZER_INVALID_SCORE / 2;
}

function optimizerBuildCurrentEquipmentBuffOptimizedResult(inputs, settings) {
  const equipmentIdxs = optimizerCanonicalEquipmentIdxs(optimizerCurrentEnabledEquipmentIdxs(settings), settings);
  if (!equipmentIdxs.length) {
    settings.optimizerCurrentEquipmentSeedStatus = "装備なし";
    return null;
  }

  const buff = optimizerSelectExternalBuffs(equipmentIdxs, inputs, settings);
  const metrics = buff.metrics;
  const capViolations = optimizerStatCapViolations(metrics, settings).concat(optimizerTargetOverViolations(metrics, settings));
  const equipmentConflicts = optimizerEquipmentConflictNames(equipmentIdxs);
  const reasons = [];

  if (metrics.slots.total > settings.maxSlots) {
    reasons.push(`バフ枠超過 ${metrics.slots.total}/${settings.maxSlots}`);
  }
  capViolations.forEach(x => reasons.push(x));
  if (equipmentConflicts.length) reasons.push(`装備競合 ${equipmentConflicts.join(", ")}`);
  if (buff.score <= OPTIMIZER_INVALID_SCORE / 2 && !capViolations.length) reasons.push("目的/上限判定で無効スコア");

  const result = {
    equipmentIdxs,
    compositeIdxs: optimizerCompositeSelectionKey(buff.compositeIdxs).split(",").filter(Boolean).map(x => parseInt(x, 10)),
    metrics,
    score: buff.score,
    rank: buff.rank,
    equipmentSummary: optimizerEquipmentSummaryByIdx(equipmentIdxs, metrics),
    equipmentConflicts,
    capViolations,
    prunedCount: buff.prunedCount || 0,
    forceOtherBuffs: settings.forceOtherBuffs,
    sourceLabel: "現在ON装備 + 最適Buff",
    currentEquipmentSeed: true,
    baselineInvalid: reasons.length > 0,
    baselineReasons: reasons
  };

  settings.optimizerCurrentEquipmentSeedStatus = optimizerResultPassesDisplayFilters(result, settings)
    ? "評価済み"
    : `条件外${reasons.length ? `（${reasons.join(" / ")}）` : ""}`;
  return result;
}

function optimizerMergeSeedResults(rawResults, seedResults, settings) {
  const out = (rawResults || []).slice();
  (seedResults || []).forEach(seed => {
    if (!seed) return;
    if (optimizerResultPassesDisplayFilters(seed, settings)) {
      out.push(seed);
    }
  });
  return out;
}

function optimizerFilterBetterThanCurrent(results, currentResult, settings) {
  if (!settings?.onlyBetterThanCurrent || !currentResult) return results || [];
  const before = (results || []).length;
  const filtered = (results || []).filter(r => optimizerCompareEvaluations(r, currentResult) > 0);
  settings.optimizerBetterThanCurrentFiltered = before - filtered.length;
  settings.optimizerBetterThanCurrentCount = filtered.length;
  return filtered;
}

function optimizerMergeCurrentConfigResult(results, currentResult, settings) {
  if (!currentResult || !settings?.includeCurrentConfig) return results || [];

  const out = (results || []).slice();
  const currentKey = optimizerCurrentSelectionKey(currentResult, settings);
  const foundIndex = out.findIndex(r => optimizerCurrentSelectionKey(r, settings) === currentKey);

  if (foundIndex >= 0) {
    out[foundIndex] = {
      ...out[foundIndex],
      sourceLabel: settings?.onlyBetterThanCurrent ? "自動探索 + 現在ON（基準超え）" : "自動探索 + 現在ON",
      currentIncluded: true,
      currentConfig: true,
      baselineReasons: currentResult.baselineReasons || [],
      baselineInvalid: currentResult.baselineInvalid,
      equipmentConflicts: currentResult.equipmentConflicts || out[foundIndex].equipmentConflicts || []
    };
    settings.optimizerCurrentConfigIncluded = "merged";
    return out;
  }

  settings.optimizerCurrentConfigIncluded = currentResult.baselineInvalid ? "invalid-appended" : "appended";

  if (settings?.onlyBetterThanCurrent) {
    // 「良い結果だけ」モードでも、現在ON行を基準として末尾に出す。
    // 比較元が見えないと、どれくらい改善したか分かりづらいため。
    return out.concat([{...currentResult, sourceLabel:"現在ON（基準）", baselineReference:true}]);
  }

  if (currentResult.baselineInvalid) {
    return out.concat([currentResult]);
  }

  const withCurrent = out.concat([currentResult]).sort(optimizerSortByEvaluation);
  const currentIndex = withCurrent.findIndex(r => optimizerCurrentSelectionKey(r, settings) === currentKey);

  if (currentIndex < settings.topN) {
    return withCurrent.slice(0, settings.topN);
  }

  // topN外でも、比較用として現在ON行は必ず末尾に残す。
  return withCurrent.slice(0, settings.topN).concat([currentResult]);
}

function runOptimizerCore(payload, onProgress=null) {
  const inputs = {...(payload?.inputs || {})};
  const settings = {...(payload?.settings || {})};
  state = clone(payload?.state || DEFAULT_STATE());

  state.equipment = normalizeEquipmentRows(state.equipment);
  state.composite = normalizeCompositeRows(state.composite);

  settings.optimizerPrunedBuffs = 0;
  settings.optimizerCapRejected = 0;
  optimizerPrepareRunCaches(settings);
  const startTime = performance.now();

  const equipmentBeams = optimizerBuildEquipmentCandidates(inputs, settings);
  const buffEvalBeams = settings.optimizerEquipmentSearchMode === "exact"
    ? equipmentBeams
    : equipmentBeams.slice(0, settings.equipmentEvalLimit || equipmentBeams.length);

  const rawResults = [];
  const total = buffEvalBeams.length;
  const progressStep = Math.max(1, Math.floor(total / 50));

  buffEvalBeams.forEach((beam, index) => {
    const equipmentIdxs = optimizerCanonicalEquipmentIdxs(beam.equipmentIdxs, settings);
    const buff = optimizerSelectExternalBuffs(equipmentIdxs, inputs, settings);
    const result = {
      equipmentIdxs,
      compositeIdxs: optimizerCompositeSelectionKey(buff.compositeIdxs).split(",").filter(Boolean).map(x => parseInt(x, 10)),
      metrics: buff.metrics,
      score: buff.score,
      rank: buff.rank,
      equipmentSummary: optimizerEquipmentSummaryByIdx(equipmentIdxs, buff.metrics),
      equipmentConflicts: optimizerEquipmentConflictNames(equipmentIdxs),
      capViolations: optimizerStatCapViolations(buff.metrics, settings).concat(optimizerTargetOverViolations(buff.metrics, settings)),
      prunedCount: buff.prunedCount || 0,
      forceOtherBuffs: settings.forceOtherBuffs
    };

    if (optimizerResultPassesDisplayFilters(result, settings)) {
      rawResults.push(result);
    }

    if (onProgress && ((index + 1) % progressStep === 0 || index + 1 === total)) {
      onProgress({
        current: index + 1,
        total,
        phase: "buff",
        message: `Buff探索中: ${index + 1}/${total}`
      });
    }
  });

  const seedResults = settings.evaluateCurrentEquipment
    ? [optimizerBuildCurrentEquipmentBuffOptimizedResult(inputs, settings)]
    : [];

  const currentResult = (settings.includeCurrentConfig || settings.onlyBetterThanCurrent)
    ? optimizerBuildCurrentConfigResult(inputs, settings)
    : null;

  const searchResultsWithSeeds = optimizerMergeSeedResults(rawResults, seedResults, settings);

  const dedupedSortedResults = optimizerDedupeResultsByEquipment(searchResultsWithSeeds, settings)
    .sort(optimizerSortByEvaluation);

  const autoResults = optimizerFilterBetterThanCurrent(dedupedSortedResults, currentResult, settings)
    .slice(0, settings.topN);

  const results = optimizerMergeCurrentConfigResult(autoResults, currentResult, settings);

  const elapsed = Math.round(performance.now() - startTime);
  const statusText = makeOptimizerStatusText({settings, equipmentBeams, buffEvalBeams, results, elapsed});

  return {
    results,
    summary: {
      statusText,
      elapsed,
      evaluated: buffEvalBeams.length,
      totalEquipmentCandidates: equipmentBeams.length,
      settings
    }
  };
}

/* v21: skillPlus objective/filter integration
 * skillPlus はステータス・成功率・必要スキルには加算しない。
 * ここでは最適化結果の条件判定/並び替え/表示補助だけを行う。
 */
(function installOptimizerSkillPlusV21(global) {
  if (global.__MOE_OPTIMIZER_SKILL_PLUS_V21_INSTALLED__) return;
  global.__MOE_OPTIMIZER_SKILL_PLUS_V21_INSTALLED__ = true;

  let currentSettings = null;

  function api() {
    return global.MOESkillPlusV21 || null;
  }

  function totalsForResult(result, settings=currentSettings) {
    const helper = api();
    if (!helper || !result) return {};
    if (result.skillPlusTotals && typeof result.skillPlusTotals === "object") return result.skillPlusTotals;
    let rows = [];
    try {
      const equipmentRows = typeof optimizerEquipmentRows === "function" ? optimizerEquipmentRows(settings || {}) : [];
      (result.equipmentIdxs || []).forEach(idx => {
        const row = equipmentRows[idx];
        if (row) rows.push(row);
      });
    } catch {}
    try {
      const compositeRows = typeof optimizerCompositeRows === "function" ? optimizerCompositeRows(settings || {}) : [];
      (result.compositeIdxs || []).forEach(idx => {
        const row = compositeRows[idx];
        if (row) rows.push(row);
      });
    } catch {}
    return helper.totalsForRows(rows);
  }

  function skillPlusObjectiveEnabled(settings=currentSettings, objective=null) {
    const obj = objective || settings?.objective;
    return obj === "skillPlus";
  }

  function skillPlusScore(result, settings=currentSettings) {
    const helper = api();
    if (!helper) return 0;
    const totals = totalsForResult(result, settings);
    const target = settings?.skillPlusTargetSkill || "";
    if (target) return helper.totalForSkill(totals, target);
    return Object.values(totals || {}).reduce((sum, value) => sum + (+value || 0), 0);
  }

  function compareSkillPlus(a, b, settings=currentSettings) {
    const diff = skillPlusScore(b, settings) - skillPlusScore(a, settings);
    if (Math.abs(diff) > 1e-9) return diff;
    const helper = api();
    if (!helper) return 0;
    return helper.summary(totalsForResult(a, settings)).localeCompare(helper.summary(totalsForResult(b, settings)), "ja");
  }

  function resultPassesSkillPlusFilters(result, settings=currentSettings) {
    const helper = api();
    const filters = settings?.skillPlusFilters || [];
    if (!helper || !filters.length) return true;
    return helper.filterMatchesTotals(totalsForResult(result, settings), filters);
  }

  function annotateResult(result, settings=currentSettings) {
    const helper = api();
    if (!helper || !result) return result;
    const totals = totalsForResult(result, settings);
    result.skillPlusTotals = totals;
    result.skillPlusSummary = helper.summary(totals);
    result.skillPlusScore = skillPlusScore(result, settings);
    if (result.equipmentSummary && result.skillPlusSummary && !String(result.equipmentSummary).includes("スキル強化:")) {
      result.equipmentSummary += ` / スキル強化: ${result.skillPlusSummary}`;
    }
    return result;
  }

  const baseRun = global.runOptimizerCore;
  if (typeof baseRun === "function") {
    global.runOptimizerCore = function runOptimizerCoreSkillPlusV21(payload, onProgress=null) {
      currentSettings = payload?.settings || null;
      const out = baseRun.call(this, payload, onProgress);
      try {
        (out?.results || []).forEach(r => annotateResult(r, currentSettings));
        if (out?.summary && currentSettings?.skillPlusFilters?.length && api()) {
          const desc = api().filterDescription(currentSettings.skillPlusFilters);
          if (desc && !String(out.summary).includes("スキル強化条件")) out.summary += ` / スキル強化条件 ${desc}`;
        }
      } catch {}
      return out;
    };
  }

  const basePass = global.optimizerResultPassesDisplayFilters;
  if (typeof basePass === "function") {
    global.optimizerResultPassesDisplayFilters = function optimizerResultPassesDisplayFiltersSkillPlusV21(result, settings) {
      const ok = basePass.call(this, result, settings);
      if (!ok) return false;
      return resultPassesSkillPlusFilters(result, settings || currentSettings);
    };
  }

  const baseSort = global.optimizerSortByEvaluation;
  if (typeof baseSort === "function") {
    global.optimizerSortByEvaluation = function optimizerSortByEvaluationSkillPlusV21(a, b) {
      const settings = currentSettings || {};
      if (skillPlusObjectiveEnabled(settings, settings.objective)) {
        const c = compareSkillPlus(a, b, settings);
        if (c) return c;
      }
      const primary = baseSort.call(this, a, b);
      if (primary) return primary;
      if (skillPlusObjectiveEnabled(settings, settings.secondaryObjective)) {
        return compareSkillPlus(a, b, settings);
      }
      return 0;
    };
  }

  const baseCompare = global.optimizerCompareEvaluations;
  if (typeof baseCompare === "function") {
    global.optimizerCompareEvaluations = function optimizerCompareEvaluationsSkillPlusV21(a, b) {
      const settings = currentSettings || {};
      if (skillPlusObjectiveEnabled(settings, settings.objective)) {
        const c = compareSkillPlus(a, b, settings);
        if (c) return c < 0 ? 1 : -1;
      }
      const primary = baseCompare.call(this, a, b);
      if (primary) return primary;
      if (skillPlusObjectiveEnabled(settings, settings.secondaryObjective)) {
        const c = compareSkillPlus(a, b, settings);
        return c < 0 ? 1 : c > 0 ? -1 : 0;
      }
      return 0;
    };
  }

  const baseLabel = global.optimizerObjectiveLabel;
  if (typeof baseLabel === "function") {
    global.optimizerObjectiveLabel = function optimizerObjectiveLabelSkillPlusV21(objective) {
      if (objective === "skillPlus") {
        const target = currentSettings?.skillPlusTargetSkill || "";
        return target ? `${target}強化 最大` : "スキル強化合計 最大";
      }
      return baseLabel.call(this, objective);
    };
  }

  const baseTargetDesc = global.optimizerPrimaryTargetDescription;
  if (typeof baseTargetDesc === "function") {
    global.optimizerPrimaryTargetDescription = function optimizerPrimaryTargetDescriptionSkillPlusV21(settings) {
      const main = baseTargetDesc.call(this, settings) || "";
      const helper = api();
      const desc = helper && settings?.skillPlusFilters?.length ? helper.filterDescription(settings.skillPlusFilters) : "";
      return [main, desc ? `スキル強化条件 ${desc}` : ""].filter(Boolean).join(" / ");
    };
  }

  const baseSummaryByIdx = global.optimizerEquipmentSummaryByIdx;
  if (typeof baseSummaryByIdx === "function") {
    global.optimizerEquipmentSummaryByIdx = function optimizerEquipmentSummaryByIdxSkillPlusV21(equipmentIdxs, metrics) {
      const text = String(baseSummaryByIdx.call(this, equipmentIdxs, metrics) || "");
      const helper = api();
      if (!helper) return text;
      try {
        const rows = typeof optimizerEquipmentRows === "function" ? optimizerEquipmentRows(currentSettings || {}) : [];
        const picked = (equipmentIdxs || []).map(idx => rows[idx]).filter(Boolean);
        const summary = helper.summary(helper.totalsForRows(picked));
        if (!summary || text.includes("スキル強化:")) return text;
        return text ? `${text} / スキル強化: ${summary}` : `スキル強化: ${summary}`;
      } catch {
        return text;
      }
    };
  }
})(typeof globalThis !== "undefined" ? globalThis : self);
