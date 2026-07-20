(function installCombatLogTab(global) {
  "use strict";

  let parserLoadPromise = null;
  let initialized = false;
  let parsedEvents = [];
  let rankingRows = [];
  let combatIntervals = [];
  let parseDiagnostics = null;
  let parsedFileName = "";

  function loadCombatLogParserOnce() {
    if (global.MoeCombatLogParser) return Promise.resolve(global.MoeCombatLogParser);
    if (parserLoadPromise) return parserLoadPromise;
    parserLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "./src/domain/combatLogParser.js?v=1.24.0";
      script.dataset.combatLogParser = "1";
      script.onload = () => global.MoeCombatLogParser
        ? resolve(global.MoeCombatLogParser)
        : reject(new Error("戦闘ログパーサーを初期化できませんでした。"));
      script.onerror = () => reject(new Error("戦闘ログパーサーの読み込みに失敗しました。"));
      document.head.appendChild(script);
    }).catch(error => {
      parserLoadPromise = null;
      throw error;
    });
    return parserLoadPromise;
  }

  function optionValues(events, key) {
    return Array.from(new Set(events.map(event => event[key]).filter(Boolean)))
      .sort((a, b) => String(a).localeCompare(String(b), "ja"));
  }

  function fillSelect(select, values, emptyLabel) {
    const current = select.value;
    select.replaceChildren();
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = emptyLabel;
    select.appendChild(empty);
    values.forEach(value => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    if (values.includes(current)) select.value = current;
  }

  function formatNumber(value, digits = 0) {
    return Number(value || 0).toLocaleString("ja-JP", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[character]);
  }

  function datetimeLocalValue(timestamp) {
    if (!Number.isFinite(timestamp)) return "";
    const date = new Date(timestamp);
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function shortDateTime(timestamp) {
    if (!Number.isFinite(timestamp)) return "----/--/-- --:--:--";
    const date = new Date(timestamp);
    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function selectedTimeRange() {
    const fromValue = document.getElementById("combatLogFrom")?.value || "";
    const toValue = document.getElementById("combatLogTo")?.value || "";
    const from = fromValue ? new Date(fromValue).getTime() : NaN;
    const to = toValue ? new Date(toValue).getTime() : NaN;
    return {from, to};
  }

  function currentReport() {
    const attacker = document.getElementById("combatLogAttacker")?.value || "";
    const target = document.getElementById("combatLogTarget")?.value || "";
    const {from, to} = selectedTimeRange();
    const analysis = global.MoeCombatLogParser.analyzeCombatEvents(parsedEvents, {attacker, target, from, to});
    const metadata = {
      attacker,
      target,
      fromText: Number.isFinite(from) ? new Date(from).toLocaleString("ja-JP") : "",
      toText: Number.isFinite(to) ? new Date(to).toLocaleString("ja-JP") : ""
    };
    return {analysis, metadata};
  }

  async function copyCombatReport() {
    const status = document.getElementById("combatLogActionStatus");
    try {
      const {analysis, metadata} = currentReport();
      const text = global.MoeCombatLogParser.buildCompactCombatReportText(analysis, metadata);
      if (!global.navigator?.clipboard?.writeText) throw new Error("このブラウザではクリップボードへ書き込めません。");
      await global.navigator.clipboard.writeText(text);
      status.textContent = `共有用の短文をコピーしました（${text.length}文字）。`;
    } catch (error) {
      status.textContent = `コピー失敗：${error?.message || error}`;
    }
  }

  function downloadCombatReportCsv() {
    const status = document.getElementById("combatLogActionStatus");
    try {
      const {analysis, metadata} = currentReport();
      const csv = global.MoeCombatLogParser.buildCombatReportCsv(analysis, metadata);
      const url = URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"}));
      const link = document.createElement("a");
      link.href = url;
      link.download = `moe-combat-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      status.textContent = "現在の集計結果をCSVで保存しました。";
    } catch (error) {
      status.textContent = `CSV保存失敗：${error?.message || error}`;
    }
  }

  function renderParseDiagnostics(result, fileName = "") {
    const details = document.getElementById("combatLogDiagnosticsDetails");
    const summary = document.getElementById("combatLogDiagnosticsSummary");
    const button = document.getElementById("combatLogDiagnosticsSave");
    if (!details || !summary || !button) return;
    parseDiagnostics = result;
    parsedFileName = fileName;
    const unclassified = result?.unclassifiedCombatLines?.length || 0;
    const invalid = result?.invalidLines?.length || 0;
    details.hidden = !result;
    summary.textContent = `解析診断：未分類 ${formatNumber(unclassified)}件 / 日時形式外 ${formatNumber(invalid)}件`;
    button.disabled = !result || unclassified + invalid === 0;
    if (!result) details.open = false;
  }

  function downloadCombatDiagnostics() {
    const status = document.getElementById("combatLogActionStatus");
    if (!parseDiagnostics) return;
    try {
      const text = global.MoeCombatLogParser.buildCombatLogDiagnosticsText(parseDiagnostics, {fileName: parsedFileName});
      const url = URL.createObjectURL(new Blob([text], {type: "text/plain;charset=utf-8"}));
      const link = document.createElement("a");
      link.href = url;
      link.download = `moe-combat-diagnostics-${new Date().toISOString().slice(0, 10)}.txt`;
      link.click();
      URL.revokeObjectURL(url);
      status.textContent = "解析診断を保存しました。";
    } catch (error) {
      status.textContent = `診断保存失敗：${error?.message || error}`;
    }
  }

  function renderRangeStatus(from, to) {
    const output = document.getElementById("combatLogRangeStatus");
    if (!output) return;
    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      output.textContent = "開始・終了時刻を指定してください。";
      return;
    }
    if (from > to) {
      output.textContent = "開始時刻が終了時刻より後になっています。";
      return;
    }
    const seconds = Math.max(0, (to - from) / 1000);
    output.textContent = `対象時間：${new Date(from).toLocaleString("ja-JP")} ～ ${new Date(to).toLocaleString("ja-JP")} / 経過 ${formatNumber(seconds, 0)}秒（${formatNumber(seconds / 60, 1)}分）`;
  }

  function renderSummary() {
    const output = document.getElementById("combatLogSummary");
    if (!output || !global.MoeCombatLogParser) return;
    const attacker = document.getElementById("combatLogAttacker")?.value || "";
    const target = document.getElementById("combatLogTarget")?.value || "";
    const selection = document.getElementById("combatLogSelectionStatus");
    if (selection) selection.textContent = `集計対象：${attacker || "すべての攻撃者"} → ${target || "すべての対象"}`;
    const {from, to} = selectedTimeRange();
    renderRangeStatus(from, to);
    if (Number.isFinite(from) && Number.isFinite(to) && from > to) {
      output.replaceChildren();
      return;
    }
    const analysis = global.MoeCombatLogParser.analyzeCombatEvents(parsedEvents, {attacker, target, from, to});
    const summaryBlock = (key, label, headline, body) => `
      <section id="combatLogSection-${key}" class="combatLogSummaryBlock">
        <h3>▼${label}</h3>
        <div class="combatLogSummaryHeadline">${headline}</div>
        <div class="combatLogTextStats">${body}</div>
      </section>`;
    const statLine = (label, value, unit = "") => `
      <div><span>${label}</span> ： <span class="num">${value}${unit ? ` (${unit})` : ""}</span></div>`;
    const summaryRows = (summary, showMisses = false) => {
      return `
        ${statLine("合計", formatNumber(summary.totalDamage), "dmg")}
        ${statLine("攻撃回数", formatNumber(summary.attackCount), "atk")}
        ${statLine("平均", formatNumber(summary.averageDamage, 1), "dmg/atk")}
        ${statLine("毎分ダメージ", formatNumber(summary.damagePerMinute, 1), "dmg/min")}
        ${statLine("毎分攻撃回数", formatNumber(summary.attacksPerMinute, 1), "atk/min")}
        ${statLine("最大", formatNumber(summary.maxDamage), "dmg")}
        ${statLine("最小", formatNumber(summary.minDamage), "dmg")}
        ${statLine("クリティカル", `${formatNumber(summary.criticalDamage)} dmg / ${formatNumber(summary.criticalCount)}回`)}
        ${statLine("クリティカル率", `${formatNumber(summary.criticalRate, 1)}% (${formatNumber(summary.criticalCount)}/${formatNumber(summary.hitCount)})`)}
        ${statLine("ミス", `${formatNumber(summary.missCount)} / ${formatNumber(summary.missRate, 1)}%`)}
        ${showMisses ? `${statLine("攻撃ミス", formatNumber(summary.attackMissCount), "atk")}
        ${statLine("攻撃ミス率", `${formatNumber(summary.attackMissRate, 1)}% (${formatNumber(summary.attackMissCount)}/${formatNumber(summary.attackCount)})`)}
        ${statLine("ミス ザ マーク", formatNumber(summary.missTheMarkCount), "atk")}
        ${statLine("ミス ザ マーク率", `${formatNumber(summary.missTheMarkRate, 1)}% (${formatNumber(summary.missTheMarkCount)}/${formatNumber(summary.attackCount)})`)}
        ${statLine("ダメージ回避", formatNumber(summary.damageEvasionCount), "atk")}
        ${statLine("ダメージ回避率", `${formatNumber(summary.damageEvasionRate, 1)}% (${formatNumber(summary.damageEvasionCount)}/${formatNumber(summary.attackCount)})`)}
        ${statLine("反射回数", formatNumber(summary.reflectionCount))}
        ${statLine("物理反射", formatNumber(summary.reflectionDamage), "dmg")}` : ""}`;
    };
    const incomingRows = `
      ${statLine("合計", formatNumber(analysis.incoming.totalDamage), "dmg")}
      ${statLine("物理ダメージ", `${formatNumber(analysis.incoming.physicalDamage)} dmg / ${formatNumber(analysis.incoming.physicalHitCount)}回`)}
      ${statLine("魔法ダメージ", `${formatNumber(analysis.incoming.magicDamage)} dmg / ${formatNumber(analysis.incoming.magicHitCount)}回`)}
      ${statLine("貫通", `${formatNumber(analysis.incoming.penetrationDamage)} dmg / ${formatNumber(analysis.incoming.penetrationCount)}回`)}
      ${statLine("貫通率", `${formatNumber(analysis.incoming.penetrationRate, 1)}% (${formatNumber(analysis.incoming.penetrationCount)}/${formatNumber(analysis.incoming.physicalHitCount)})`)}
      ${statLine("盾回避", formatNumber(analysis.incoming.guardAvoidedDamage), "dmg")}
      ${statLine("発生元不明", `${formatNumber(analysis.incoming.unknownDamage)} dmg / ${formatNumber(analysis.incoming.unknownHitCount)}回`)}`;
    const recoveryRows = `
      ${statLine("体力", `${formatNumber(analysis.recovery.hp.amount)} / ${formatNumber(analysis.recovery.hp.count)}回 / 平均${formatNumber(analysis.recovery.hp.average, 1)} / 毎分${formatNumber(analysis.recovery.hp.perMinute, 1)}`)}
      ${statLine("体力 最大 / 最小", `${formatNumber(analysis.recovery.hp.max)} / ${formatNumber(analysis.recovery.hp.min)}`)}
      ${statLine("スタミナ", `${formatNumber(analysis.recovery.st.amount)} / ${formatNumber(analysis.recovery.st.count)}回 / 平均${formatNumber(analysis.recovery.st.average, 1)} / 毎分${formatNumber(analysis.recovery.st.perMinute, 1)}`)}
      ${statLine("スタミナ 最大 / 最小", `${formatNumber(analysis.recovery.st.max)} / ${formatNumber(analysis.recovery.st.min)}`)}
      ${statLine("MP", `${formatNumber(analysis.recovery.mp.amount)} / ${formatNumber(analysis.recovery.mp.count)}回 / 平均${formatNumber(analysis.recovery.mp.average, 1)} / 毎分${formatNumber(analysis.recovery.mp.perMinute, 1)}`)}
      ${statLine("MP 最大 / 最小", `${formatNumber(analysis.recovery.mp.max)} / ${formatNumber(analysis.recovery.mp.min)}`)}`;
    const actionRows = analysis.actions.actions.length
      ? analysis.actions.actions.slice(0, 8).map(item => statLine(escapeHtml(item.action), `${formatNumber(item.attemptCount)}回（詠唱${formatNumber(item.castCount)} / 詠唱失敗${formatNumber(item.castFailureCount)} / その他失敗${formatNumber(item.actionFailureCount)}）`)).join("")
      : statLine("記録", "なし");
    output.innerHTML = `
      ${summaryBlock("total", "合計（物理＋魔法）", `${formatNumber(analysis.total.totalDamage)} damage / ${formatNumber(analysis.total.attackCount)}回`, summaryRows(analysis.total))}
      ${summaryBlock("physical", "物理", `${formatNumber(analysis.physical.totalDamage)} damage / ${formatNumber(analysis.physical.attackCount)}回`, summaryRows(analysis.physical, true))}
      ${summaryBlock("magic", "魔法", `${formatNumber(analysis.magic.totalDamage)} damage / ${formatNumber(analysis.magic.attackCount)}回`, summaryRows(analysis.magic))}
      ${summaryBlock("incoming", "被ダメージ", `${formatNumber(analysis.incoming.totalDamage)} damage`, incomingRows)}
      ${summaryBlock("recovery", "回復", `HP ${formatNumber(analysis.recovery.hp.amount)} / ST ${formatNumber(analysis.recovery.st.amount)} / MP ${formatNumber(analysis.recovery.mp.amount)}`, recoveryRows)}
      ${summaryBlock("actions", "行動ログ", `${formatNumber(analysis.actions.attemptCount)}件`, actionRows)}`;
  }

  function renderRanking() {
    const output = document.getElementById("combatLogRanking");
    if (!output || !global.MoeCombatLogParser) return;
    const {from, to} = selectedTimeRange();
    if (Number.isFinite(from) && Number.isFinite(to) && from > to) {
      output.replaceChildren();
      return;
    }
    rankingRows = global.MoeCombatLogParser.rankAttackPairs(parsedEvents, {from, to});
    if (!rankingRows.length) {
      output.innerHTML = parsedEvents.length ? "<p class=\"small mutedText\">対象時間内に攻撃ログがありません。</p>" : "";
      return;
    }
    output.innerHTML = `
      <table class="compactTable"><thead><tr><th>#</th><th>攻撃者</th><th>対象</th><th>合計</th><th>命中 / 攻撃</th><th>毎分ダメージ</th><th></th></tr></thead><tbody>
        ${rankingRows.slice(0, 50).map((row, index) => `<tr>
          <td class="num">${index + 1}</td><td>${escapeHtml(row.attacker)}</td><td>${escapeHtml(row.target)}</td>
          <td class="num">${formatNumber(row.totalDamage)}</td><td class="num">${formatNumber(row.hitCount)} / ${formatNumber(row.attackCount)}</td>
          <td class="num">${formatNumber(row.damagePerMinute, 1)}</td><td><button type="button" data-combat-log-ranking-index="${index}">詳細</button></td>
        </tr>`).join("")}
      </tbody></table>`;
  }

  function renderAllAnalysis() {
    renderSummary();
    renderRanking();
  }

  function selectRankingPair(event) {
    const button = event.target.closest?.("[data-combat-log-ranking-index]");
    if (!button) return;
    const row = rankingRows[Number(button.dataset.combatLogRankingIndex)];
    if (!row) return;
    document.getElementById("combatLogAttacker").value = row.attacker;
    document.getElementById("combatLogTarget").value = row.target;
    const from = document.getElementById("combatLogFrom");
    const to = document.getElementById("combatLogTo");
    from.value = datetimeLocalValue(row.start);
    to.value = datetimeLocalValue(row.end);
    renderAllAnalysis();
  }

  function renderCombatIntervalOptions() {
    const select = document.getElementById("combatLogEncounter");
    if (!select) return;
    const current = select.value;
    const attacker = document.getElementById("combatLogAttacker")?.value || "";
    const target = document.getElementById("combatLogTarget")?.value || "";
    const visible = combatIntervals
      .map((interval, index) => ({interval, index}))
      .filter(({interval}) => (!attacker || interval.attacker === attacker) && (!target || interval.target === target));
    select.replaceChildren();
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = combatIntervals.length ? `戦闘区間候補（${visible.length}/${combatIntervals.length}件）` : "戦闘区間候補なし";
    select.appendChild(empty);
    visible.forEach(({interval, index}) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${shortDateTime(interval.start)}–${shortDateTime(interval.end).slice(11)}｜${interval.attacker} → ${interval.target}｜${formatNumber(interval.totalDamage)} dmg / ${formatNumber(interval.attackCount)} atk`;
      select.appendChild(option);
    });
    if (visible.some(({index}) => String(index) === current)) select.value = current;
    select.disabled = !visible.length;
  }

  function fillCombatIntervals() {
    if (!global.MoeCombatLogParser) return;
    combatIntervals = global.MoeCombatLogParser.detectCombatIntervals(parsedEvents);
    renderCombatIntervalOptions();
  }

  function selectCombatInterval(event) {
    if (event.target.value === "") return;
    const interval = combatIntervals[Number(event.target.value)];
    if (!interval) return;
    document.getElementById("combatLogAttacker").value = interval.attacker;
    document.getElementById("combatLogTarget").value = interval.target;
    document.getElementById("combatLogFrom").value = datetimeLocalValue(interval.start);
    document.getElementById("combatLogTo").value = datetimeLocalValue(interval.end);
    renderCombatIntervalOptions();
    event.target.value = String(combatIntervals.indexOf(interval));
    renderAllAnalysis();
  }

  function setRangeFromEvents(events) {
    const timestamps = events.map(event => event.timestamp).filter(Number.isFinite);
    if (!timestamps.length) return false;
    const from = document.getElementById("combatLogFrom");
    const to = document.getElementById("combatLogTo");
    from.value = datetimeLocalValue(Math.min(...timestamps));
    to.value = datetimeLocalValue(Math.max(...timestamps));
    return true;
  }

  function setRangeToMatchingAttacks() {
    const attacker = document.getElementById("combatLogAttacker")?.value || "";
    const target = document.getElementById("combatLogTarget")?.value || "";
    const matched = parsedEvents.filter(event => (event.type === "damage" || event.type === "miss")
      && (!attacker || event.attacker === attacker)
      && (!target || event.target === target));
    if (setRangeFromEvents(matched)) renderAllAnalysis();
  }

  async function handleCombatLogFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const status = document.getElementById("combatLogStatus");
    status.textContent = "ログを読み込んでいます...";
    try {
      const parser = await loadCombatLogParserOnce();
      const text = parser.decodeCombatLog(await file.arrayBuffer());
      const result = parser.parseCombatLog(text);
      parsedEvents = result.events;
      const attackEvents = parsedEvents.filter(item => item.type === "damage" || item.type === "miss");
      fillSelect(document.getElementById("combatLogAttacker"), optionValues(attackEvents, "attacker"), "すべての攻撃者");
      fillSelect(document.getElementById("combatLogTarget"), optionValues(attackEvents, "target"), "すべての対象");
      setRangeFromEvents(parsedEvents);
      document.getElementById("combatLogFrom").disabled = false;
      document.getElementById("combatLogTo").disabled = false;
      document.getElementById("combatLogFitRange").disabled = false;
      document.getElementById("combatLogCopy").disabled = false;
      document.getElementById("combatLogCsv").disabled = false;
      fillCombatIntervals();
      renderParseDiagnostics(result, file.name);
      status.textContent = `${file.name}：${result.lineCount.toLocaleString("ja-JP")}行 / 攻撃ログ ${attackEvents.length.toLocaleString("ja-JP")}件 / 未分類戦闘候補 ${result.unclassifiedCombatLines.length.toLocaleString("ja-JP")}件 / 日時形式外 ${result.invalidLines.length.toLocaleString("ja-JP")}件`;
      renderAllAnalysis();
    } catch (error) {
      parsedEvents = [];
      document.getElementById("combatLogCopy").disabled = true;
      document.getElementById("combatLogCsv").disabled = true;
      status.textContent = `読み込みエラー：${error?.message || error}`;
      fillCombatIntervals();
      renderParseDiagnostics(null);
      renderAllAnalysis();
    }
  }

  function initializeCombatLogUi(panel) {
    if (initialized || panel.dataset.combatLogReady === "1") return;
    initialized = true;
    panel.dataset.combatLogReady = "1";
    const section = document.createElement("section");
    section.className = "card wide combatLogSection";
    section.innerHTML = `
      <h2>戦闘ログ解析</h2>
      <p class="small">ログはこのブラウザ内だけで処理し、サーバーへ送信しません。CP932（Shift_JIS）とUTF-8を自動判定します。</p>
      <div class="row">
        <label>ログファイル <input id="combatLogFile" type="file" accept=".txt,text/plain"></label>
        <label>攻撃者 <select id="combatLogAttacker" disabled><option value="">ログ未読込</option></select></label>
        <label>対象 <select id="combatLogTarget" disabled><option value="">ログ未読込</option></select></label>
      </div>
      <div class="row">
        <label>戦闘区間 <select id="combatLogEncounter" disabled><option value="">ログ未読込</option></select></label>
        <label>開始 <input id="combatLogFrom" type="datetime-local" step="1" disabled></label>
        <label>終了 <input id="combatLogTo" type="datetime-local" step="1" disabled></label>
        <button id="combatLogFitRange" type="button" disabled>選択した攻撃区間に合わせる</button>
        <button id="combatLogCopy" type="button" disabled>短文コピー</button>
        <button id="combatLogCsv" type="button" disabled>CSV保存</button>
      </div>
      <div id="combatLogStatus" class="small mutedText" aria-live="polite">解析するmlogファイルを選択してください。</div>
      <div id="combatLogRangeStatus" class="small mutedText" aria-live="polite"></div>
      <div id="combatLogSelectionStatus" class="small" aria-live="polite"></div>
      <div id="combatLogActionStatus" class="small mutedText" aria-live="polite"></div>
      <details id="combatLogDiagnosticsDetails" hidden>
        <summary id="combatLogDiagnosticsSummary">解析診断</summary>
        <button id="combatLogDiagnosticsSave" type="button" disabled>問題行だけ保存</button>
        <span class="small mutedText">元ログ全体ではなく、未分類・日時形式外の行だけを保存します。</span>
      </details>
      <details class="combatLogRankingDetails">
        <summary>攻撃者 × 対象ランキング</summary>
        <div id="combatLogRanking" class="scrollX"></div>
      </details>
      <div id="combatLogSummary" class="combatLogSummaryGrid"></div>`;
    panel.appendChild(section);

    const fileInput = document.getElementById("combatLogFile");
    const attacker = document.getElementById("combatLogAttacker");
    const target = document.getElementById("combatLogTarget");
    const from = document.getElementById("combatLogFrom");
    const to = document.getElementById("combatLogTo");
    const fitRange = document.getElementById("combatLogFitRange");
    const encounter = document.getElementById("combatLogEncounter");
    const copy = document.getElementById("combatLogCopy");
    const csv = document.getElementById("combatLogCsv");
    const diagnosticsSave = document.getElementById("combatLogDiagnosticsSave");
    const ranking = document.getElementById("combatLogRanking");
    fileInput.addEventListener("change", handleCombatLogFile);
    [attacker, target].forEach(select => select.addEventListener("change", () => {
      renderCombatIntervalOptions();
      renderSummary();
    }));
    [from, to].forEach(input => input.addEventListener("change", renderAllAnalysis));
    fitRange.addEventListener("click", setRangeToMatchingAttacks);
    encounter.addEventListener("change", selectCombatInterval);
    copy.addEventListener("click", copyCombatReport);
    csv.addEventListener("click", downloadCombatReportCsv);
    diagnosticsSave.addEventListener("click", downloadCombatDiagnostics);
    ranking.addEventListener("click", selectRankingPair);
    loadCombatLogParserOnce().then(() => {
      attacker.disabled = false;
      target.disabled = false;
    }).catch(error => {
      document.getElementById("combatLogStatus").textContent = error.message;
    });
  }

  function renderCombatLogTab() {
    const panel = document.querySelector('[data-tab-panel="combatLog"]');
    if (!panel || initialized) return;
    initializeCombatLogUi(panel);
  }

  global.renderCombatLogTab = renderCombatLogTab;
})(globalThis);
