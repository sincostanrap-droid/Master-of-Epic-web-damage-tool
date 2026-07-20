const assert = require("node:assert/strict");
const {
  decodeCombatLog,
  detectCombatIntervals,
  buildCombatReportCsv,
  buildCombatLogDiagnosticsText,
  buildCompactCombatReportText,
  buildCombatReportText,
  analyzeCombatEvents,
  parseCombatLog,
  parseCombatLogLine,
  rankAttackPairs,
  summarizeCombatEvents
} = require("../src/domain/combatLogParser.js");

const sample = [
  "26/07/20 00:30:24: secrap→デュラハン : 1801 ダメージ（クリティカル）",
  "26/07/20 00:30:25: Magiccat→デュラハン : 魔法攻撃 667 ダメージ",
  "26/07/20 00:30:26: secrap→デュラハン : 攻撃ミス",
  "26/07/20 00:30:27: secrap→デュラハン : ミス ザ マーク",
  "26/07/20 00:30:28: Abenius→Abenius : 魔法攻撃ミス",
  "26/07/20 00:30:25: secrap は 3 ダメージ受けた！",
  "26/07/20 00:30:26: secrap は 体力が 360 回復した",
  "26/07/20 00:30:31: Historical は 神の杖 を ザハーク に唱えた！",
  "26/07/20 00:30:32: Historical は 神の杖 の詠唱に失敗した",
  "26/07/20 00:30:33: secrap は 聖絶 に失敗した"
  ,"26/07/20 00:30:34: secrap→デュラハン : 52 ダメージ（リアクティブ）"
  ,"26/07/20 00:30:35: デュラハン→secrap : 96 ダメージ（カウンター）"
  ,"26/07/20 00:30:36: デュラハン→secrap : ダメージ回避"
  ,"26/07/20 00:30:37: secrap：9 毒ダメージ"
].join("\r\n");

const parsed = parseCombatLog(sample);
assert.equal(parsed.lineCount, 14);
assert.equal(parsed.invalidLines.length, 0);
assert.equal(parsed.unclassifiedCombatLines.length, 0);
assert.deepEqual(parsed.events.map(event => event.type), [
  "damage", "damage", "miss", "miss", "miss", "received-damage", "recovery", "cast", "cast-failure", "action-failure", "damage", "damage", "miss", "periodic-damage"
]);

assert.deepEqual(
  Object.fromEntries(Object.entries(parsed.events[0]).filter(([key]) => ["type", "attacker", "target", "damageKind", "amount", "critical"].includes(key))),
  {type: "damage", attacker: "secrap", target: "デュラハン", damageKind: "physical", amount: 1801, critical: true}
);
assert.equal(parsed.events[1].damageKind, "magic");
assert.equal(parsed.events[4].damageKind, "magic");
assert.equal(parsed.events[6].resource, "hp");

const summary = summarizeCombatEvents(parsed.events, {attacker: "secrap", target: "デュラハン"});
assert.equal(summary.totalDamage, 1853);
assert.equal(summary.attackCount, 4);
assert.equal(summary.hitCount, 2);
assert.equal(summary.missCount, 2);
assert.equal(summary.criticalCount, 1);
assert.equal(summary.criticalDamage, 1801);
assert.equal(summary.criticalRate, 50);
assert.equal(summary.physicalDamage, 1853);
assert.equal(summary.magicDamage, 0);
assert.equal(summary.attackMissCount, 1);
assert.equal(summary.missTheMarkCount, 1);
assert.equal(summary.attackMissRate, 25);
assert.equal(summary.missTheMarkRate, 25);
assert.equal(summary.reflectionCount, 1);
assert.equal(summary.reflectionDamage, 52);

const analysis = analyzeCombatEvents(parsed.events, {
  attacker: "secrap",
  target: "デュラハン",
  from: parsed.events[0].timestamp,
  to: parsed.events[13].timestamp
});
assert.equal(analysis.total.totalDamage, 1853);
assert.equal(analysis.physical.attackCount, 4);
assert.equal(analysis.magic.attackCount, 0);
assert.equal(analysis.incoming.unknownDamage, 12);
assert.equal(analysis.recovery.hp.amount, 360);
assert.equal(analysis.recovery.hp.count, 1);
assert.equal(analysis.recovery.hp.average, 360);
assert.equal(analysis.recovery.hp.max, 360);
assert.equal(analysis.recovery.hp.min, 360);
assert.ok(Math.abs(analysis.recovery.hp.perMinute - (360 * 60 / 13)) < 1e-9);
assert.deepEqual(
  [analysis.recovery.st.amount, analysis.recovery.st.count, analysis.recovery.st.average, analysis.recovery.st.max, analysis.recovery.st.min],
  [0, 0, 0, 0, 0]
);
assert.equal(analysis.actions.attemptCount, 1);
assert.equal(analysis.actions.actionFailureCount, 1);
assert.deepEqual(
  analysis.actions.actions.map(item => [item.action, item.attemptCount, item.actionFailureCount]),
  [["聖絶", 1, 1]]
);

const actionAnalysis = analyzeCombatEvents(parsed.events, {
  attacker: "Historical",
  from: parsed.events[0].timestamp,
  to: parsed.events[13].timestamp
});
assert.equal(actionAnalysis.actions.attemptCount, 2);
assert.equal(actionAnalysis.actions.castCount, 1);
assert.equal(actionAnalysis.actions.castFailureCount, 1);
assert.deepEqual(actionAnalysis.actions.actions.map(item => [item.action, item.attemptCount]), [["神の杖", 2]]);
const targetFilteredActions = analyzeCombatEvents(parsed.events, {
  attacker: "Historical",
  target: "デュラハン",
  from: parsed.events[0].timestamp,
  to: parsed.events[13].timestamp
});
assert.equal(targetFilteredActions.actions.castCount, 0);
assert.equal(targetFilteredActions.actions.castFailureCount, 1);
assert.equal(analysis.incoming.physicalDamage, 96);
assert.equal(analysis.incoming.unknownDamage, 12);

const fixedRange = analyzeCombatEvents(parsed.events, {
  attacker: "secrap",
  target: "デュラハン",
  from: parsed.events[0].timestamp,
  to: parsed.events[9].timestamp
});
assert.equal(fixedRange.total.durationSeconds, 9);
assert.equal(fixedRange.physical.durationSeconds, 9);
assert.equal(fixedRange.magic.durationSeconds, 9);

const guardPenetration = parseCombatLogLine("26/07/20 00:30:35: デュラハン→secrap : 796 ダメージ （ 69 ダメージ回避 ）");
assert.equal(guardPenetration.type, "damage");
assert.equal(guardPenetration.resultKind, "guard-penetration");
assert.equal(guardPenetration.guardPenetration, true);
assert.equal(guardPenetration.guardAvoidedAmount, 69);
const penetrationAnalysis = analyzeCombatEvents([...parsed.events, guardPenetration], {
  attacker: "secrap",
  target: "デュラハン",
  from: parsed.events[0].timestamp,
  to: parsed.events[13].timestamp
});
assert.equal(penetrationAnalysis.incoming.penetrationDamage, 796);
assert.equal(penetrationAnalysis.incoming.penetrationCount, 1);
assert.equal(penetrationAnalysis.incoming.guardAvoidedDamage, 69);
assert.equal(penetrationAnalysis.incoming.physicalHitCount, 2);
assert.equal(penetrationAnalysis.incoming.penetrationRate, 50);

const ranking = rankAttackPairs(parsed.events, {
  from: parsed.events[0].timestamp,
  to: parsed.events[13].timestamp
});
assert.deepEqual(ranking.map(row => [row.attacker, row.target, row.totalDamage, row.attackCount]), [
  ["secrap", "デュラハン", 1853, 4],
  ["Magiccat", "デュラハン", 667, 1],
  ["デュラハン", "secrap", 96, 2],
  ["Abenius", "Abenius", 0, 1]
]);
assert.equal(ranking[0].durationSeconds, 13);

const intervalEvents = parseCombatLog([
  "26/07/20 00:00:00: secrap→対象A : 100 ダメージ",
  "26/07/20 00:00:30: secrap→対象A : 攻撃ミス",
  "26/07/20 00:01:01: secrap→対象A : 200 ダメージ",
  "26/07/20 00:00:10: secrap→対象B : 50 ダメージ"
].join("\n")).events;
const intervals = detectCombatIntervals(intervalEvents);
assert.deepEqual(intervals.map(interval => [interval.target, interval.totalDamage, interval.attackCount, interval.durationSeconds]), [
  ["対象A", 200, 1, 0],
  ["対象B", 50, 1, 0],
  ["対象A", 100, 2, 30]
]);
assert.equal(detectCombatIntervals(intervalEvents, {gapMs: 31000}).length, 2);

const reportMetadata = {fromText: "2026/07/20 00:30:24", toText: "2026/07/20 00:30:37", attacker: "secrap", target: "デュラハン"};
const reportText = buildCombatReportText(analysis, reportMetadata);
assert.match(reportText, /集計対象：secrap → デュラハン/);
assert.match(reportText, /合計 ： 1853 \(dmg\)/);
const compactReport = buildCompactCombatReportText(analysis, reportMetadata);
assert.ok(compactReport.length <= 240);
assert.equal(compactReport.includes("\n"), false);
assert.match(compactReport, /secrap→デュラハン/);
assert.match(compactReport, /1853dmg\/4atk/);
assert.equal(buildCompactCombatReportText(analysis, {attacker: "a".repeat(100), target: "b".repeat(100)}, {maxLength: 80}).length, 80);
const reportCsv = buildCombatReportCsv(analysis, {...reportMetadata, target: '対象,"A"'});
assert.ok(reportCsv.startsWith("\uFEFFcategory,item,value,unit"));
assert.match(reportCsv, /metadata,target,"対象,""A"""/);

const diagnosticsText = buildCombatLogDiagnosticsText({
  lineCount: 3,
  unclassifiedCombatLines: [{lineNumber: 2, raw: "未分類の戦闘行"}],
  invalidLines: [{lineNumber: 3, raw: "日時なし行"}]
}, {fileName: "sample.txt"});
assert.match(diagnosticsText, /ファイル：sample\.txt/);
assert.match(diagnosticsText, /2: 未分類の戦闘行/);
assert.match(diagnosticsText, /3: 日時なし行/);

const emptyAnalysis = analyzeCombatEvents([], {});
assert.equal(emptyAnalysis.total.totalDamage, 0);
assert.equal(emptyAnalysis.total.durationSeconds, 0);
assert.equal(emptyAnalysis.total.damagePerMinute, 0);
assert.equal(emptyAnalysis.recovery.hp.perMinute, 0);
assert.equal(detectCombatIntervals([]).length, 0);

const sameSecondEvents = parseCombatLog([
  "26/07/20 01:00:00: A→B : 10 ダメージ",
  "26/07/20 01:00:00: A→B : 20 ダメージ"
].join("\n")).events;
const sameSecondSummary = analyzeCombatEvents(sameSecondEvents, {attacker: "A", target: "B"}).total;
assert.equal(sameSecondSummary.totalDamage, 30);
assert.equal(sameSecondSummary.durationSeconds, 0);
assert.equal(sameSecondSummary.damagePerMinute, 0);

const crossDayEvents = parseCombatLog([
  "26/07/20 23:59:55: A→B : 10 ダメージ",
  "26/07/21 00:00:05: A→B : 20 ダメージ"
].join("\n")).events;
const crossDayIntervals = detectCombatIntervals(crossDayEvents);
assert.equal(crossDayIntervals.length, 1);
assert.equal(crossDayIntervals[0].durationSeconds, 10);
assert.equal(crossDayIntervals[0].totalDamage, 30);

assert.equal(parseCombatLogLine("not a log line"), null);
assert.equal(parseCombatLog("not a log line").invalidLines.length, 1);

const utf8Bytes = new TextEncoder().encode(sample);
assert.equal(decodeCombatLog(utf8Bytes), sample.replace(/\r\n/g, "\n"));
assert.throws(() => decodeCombatLog({}), TypeError);

console.log("combatLogParser tests: OK");
