(function installCombatLogParser(global) {
  "use strict";

  const TIMESTAMP_PATTERN = /^(\d{2})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2}):\s*(.*)$/;
  const DAMAGE_PATTERN = /^(.*?)→(.*?)\s*:\s*(魔法攻撃\s*)?(\d+)\s*ダメージ((?:\s*（[^）]+）)*)$/;
  const MISS_PATTERN = /^(.*?)→(.*?)\s*:\s*(魔法攻撃ミス|攻撃ミス|ミス\s*ザ\s*マーク|ダメージ回避)$/;
  const PERIODIC_DAMAGE_PATTERN = /^(.*?)\s*[：:]\s*(\d+)\s*(毒)ダメージ$/;
  const RECEIVED_DAMAGE_PATTERN = /^(.*?)\s*は\s*(\d+)\s*ダメージ受けた！$/;
  const RECOVERY_PATTERN = /^(.*?)\s*は\s*(体力|スタミナ|MP|ＭＰ)が\s*(\d+)\s*回復した$/;
  const CAST_PATTERN = /^(.*?)\s*は\s*(.*?)\s*を\s*(.*?)\s*に唱えた！$/;
  const CAST_FAILURE_PATTERN = /^(.*?)\s*は\s*(.*?)\s*の詠唱に失敗した$/;
  const ACTION_FAILURE_PATTERN = /^(.*?)\s*は\s*(.*?)\s*に失敗した$/;

  function normalizeCombatLogText(value) {
    return String(value || "").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  }

  function decodeCombatLog(input, options = {}) {
    if (typeof input === "string") return normalizeCombatLogText(input);
    const bytes = input instanceof Uint8Array
      ? input
      : input instanceof ArrayBuffer
        ? new Uint8Array(input)
        : ArrayBuffer.isView(input)
          ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
          : null;
    if (!bytes) throw new TypeError("戦闘ログは文字列、ArrayBuffer、Uint8Arrayのいずれかで指定してください。");

    const requested = String(options.encoding || "auto").toLowerCase();
    if (requested !== "auto") {
      return normalizeCombatLogText(new TextDecoder(requested).decode(bytes));
    }

    try {
      return normalizeCombatLogText(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    } catch {
      return normalizeCombatLogText(new TextDecoder("shift_jis").decode(bytes));
    }
  }

  function parseTimestamp(match) {
    const year = 2000 + Number(match[1]);
    const month = Number(match[2]) - 1;
    return new Date(year, month, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6])).getTime();
  }

  function baseEvent(lineNumber, raw, timestampMatch) {
    return {
      lineNumber,
      raw,
      timestamp: parseTimestamp(timestampMatch),
      timestampText: `${timestampMatch[1]}/${timestampMatch[2]}/${timestampMatch[3]} ${timestampMatch[4]}:${timestampMatch[5]}:${timestampMatch[6]}`,
      message: timestampMatch[7]
    };
  }

  function parseCombatLogLine(rawLine, lineNumber = 1) {
    const raw = String(rawLine || "");
    const timestampMatch = raw.match(TIMESTAMP_PATTERN);
    if (!timestampMatch) return null;
    const event = baseEvent(lineNumber, raw, timestampMatch);
    const message = event.message;

    let match = message.match(DAMAGE_PATTERN);
    if (match) {
      const modifierText = String(match[5] || "");
      const critical = modifierText.includes("（クリティカル）");
      const reflected = modifierText.includes("（リアクティブ）");
      const counter = modifierText.includes("（カウンター）");
      const modifiers = Array.from(modifierText.matchAll(/（([^）]+)）/g), item => item[1].trim());
      const guardModifier = modifiers.map(value => value.match(/^(\d+)\s*ダメージ回避$/)).find(Boolean);
      const guardPenetration = Boolean(guardModifier);
      return {
        ...event,
        type: "damage",
        attacker: match[1].trim(),
        target: match[2].trim(),
        damageKind: match[3] ? "magic" : "physical",
        amount: Number(match[4]),
        critical,
        resultKind: reflected ? "reactive" : counter ? "counter" : guardPenetration ? "guard-penetration" : critical ? "critical" : modifierText ? "other" : "normal",
        reflected,
        counter,
        guardPenetration,
        guardAvoidedAmount: guardModifier ? Number(guardModifier[1]) : 0,
        modifiers
      };
    }

    match = message.match(MISS_PATTERN);
    if (match) {
      const resultText = match[3].replace(/\s+/g, " ");
      return {
        ...event,
        type: "miss",
        attacker: match[1].trim(),
        target: match[2].trim(),
        damageKind: resultText === "魔法攻撃ミス" ? "magic" : "physical",
        missKind: resultText === "ミス ザ マーク" ? "miss-the-mark" : resultText === "ダメージ回避" ? "damage-evasion" : "attack-miss"
      };
    }

    match = message.match(PERIODIC_DAMAGE_PATTERN);
    if (match) {
      return {...event, type: "periodic-damage", target: match[1].trim(), amount: Number(match[2]), damageKind: "poison"};
    }

    match = message.match(RECEIVED_DAMAGE_PATTERN);
    if (match) {
      return {...event, type: "received-damage", target: match[1].trim(), amount: Number(match[2])};
    }

    match = message.match(RECOVERY_PATTERN);
    if (match) {
      const resource = match[2] === "体力" ? "hp" : match[2] === "スタミナ" ? "st" : "mp";
      return {...event, type: "recovery", target: match[1].trim(), resource, amount: Number(match[3])};
    }

    match = message.match(CAST_FAILURE_PATTERN);
    if (match) return {...event, type: "cast-failure", actor: match[1].trim(), action: match[2].trim()};

    match = message.match(ACTION_FAILURE_PATTERN);
    if (match) return {...event, type: "action-failure", actor: match[1].trim(), action: match[2].trim()};

    match = message.match(CAST_PATTERN);
    if (match) {
      return {...event, type: "cast", actor: match[1].trim(), action: match[2].trim(), target: match[3].trim()};
    }

    return {...event, type: "other"};
  }

  function parseCombatLog(text) {
    const normalized = normalizeCombatLogText(text);
    const events = [];
    const invalidLines = [];
    const unclassifiedCombatLines = [];
    normalized.split("\n").forEach((line, index) => {
      if (!line) return;
      const event = parseCombatLogLine(line, index + 1);
      if (event) {
        events.push(event);
        if (event.type === "other" && (/→.*[：:]/.test(event.message) || /[：:]\s*\d+\s*[^ ]*ダメージ/.test(event.message))) {
          unclassifiedCombatLines.push({lineNumber: event.lineNumber, raw: event.raw, message: event.message});
        }
      }
      else invalidLines.push({lineNumber: index + 1, raw: line});
    });
    return {events, invalidLines, unclassifiedCombatLines, lineCount: normalized ? normalized.split("\n").filter(Boolean).length : 0};
  }

  function summarizeAttackEvents(events, filter = {}) {
    const attacker = String(filter.attacker || "");
    const target = String(filter.target || "");
    const from = Number.isFinite(filter.from) ? filter.from : -Infinity;
    const to = Number.isFinite(filter.to) ? filter.to : Infinity;
    const selected = (Array.isArray(events) ? events : []).filter(event => {
      if (event.timestamp < from || event.timestamp > to) return false;
      if (attacker && event.attacker !== attacker) return false;
      if (target && event.target !== target) return false;
      return event.type === "damage" || event.type === "miss";
    });
    const damageEvents = selected.filter(event => event.type === "damage" && (!filter.damageKind || event.damageKind === filter.damageKind));
    const misses = selected.filter(event => event.type === "miss" && (!filter.damageKind || event.damageKind === filter.damageKind));
    const attacks = [...damageEvents, ...misses];
    const totalDamage = damageEvents.reduce((sum, event) => sum + event.amount, 0);
    const timestamps = attacks.map(event => event.timestamp).filter(Number.isFinite);
    const start = Number.isFinite(filter.from) ? filter.from : (timestamps.length ? Math.min(...timestamps) : null);
    const end = Number.isFinite(filter.to) ? filter.to : (timestamps.length ? Math.max(...timestamps) : null);
    const durationSeconds = start === null || end === null ? 0 : Math.max(0, (end - start) / 1000);
    return {
      totalDamage,
      hitCount: damageEvents.length,
      attackCount: attacks.length,
      missCount: misses.length,
      attackMissCount: misses.filter(event => event.missKind === "attack-miss").length,
      missTheMarkCount: misses.filter(event => event.missKind === "miss-the-mark").length,
      damageEvasionCount: misses.filter(event => event.missKind === "damage-evasion").length,
      physicalDamage: damageEvents.filter(event => event.damageKind === "physical").reduce((sum, event) => sum + event.amount, 0),
      magicDamage: damageEvents.filter(event => event.damageKind === "magic").reduce((sum, event) => sum + event.amount, 0),
      criticalCount: damageEvents.filter(event => event.critical).length,
      criticalDamage: damageEvents.filter(event => event.critical).reduce((sum, event) => sum + event.amount, 0),
      reflectionCount: damageEvents.filter(event => event.reflected).length,
      reflectionDamage: damageEvents.filter(event => event.reflected).reduce((sum, event) => sum + event.amount, 0),
      counterCount: damageEvents.filter(event => event.counter).length,
      averageDamage: damageEvents.length ? totalDamage / damageEvents.length : 0,
      maxDamage: damageEvents.length ? Math.max(...damageEvents.map(event => event.amount)) : 0,
      minDamage: damageEvents.length ? Math.min(...damageEvents.map(event => event.amount)) : 0,
      durationSeconds,
      damagePerMinute: durationSeconds > 0 ? totalDamage * 60 / durationSeconds : 0,
      attacksPerMinute: durationSeconds > 0 ? attacks.length * 60 / durationSeconds : 0,
      criticalRate: damageEvents.length ? damageEvents.filter(event => event.critical).length * 100 / damageEvents.length : 0,
      missRate: attacks.length ? misses.length * 100 / attacks.length : 0,
      attackMissRate: attacks.length ? misses.filter(event => event.missKind === "attack-miss").length * 100 / attacks.length : 0,
      missTheMarkRate: attacks.length ? misses.filter(event => event.missKind === "miss-the-mark").length * 100 / attacks.length : 0,
      damageEvasionRate: attacks.length ? misses.filter(event => event.missKind === "damage-evasion").length * 100 / attacks.length : 0,
      start,
      end
    };
  }

  function summarizeCombatEvents(events, filter = {}) {
    return summarizeAttackEvents(events, filter);
  }

  function rankAttackPairs(events, filter = {}) {
    const from = Number.isFinite(filter.from) ? filter.from : -Infinity;
    const to = Number.isFinite(filter.to) ? filter.to : Infinity;
    const groups = new Map();
    (Array.isArray(events) ? events : []).forEach(event => {
      if ((event.type !== "damage" && event.type !== "miss")
        || event.timestamp < from || event.timestamp > to
        || !event.attacker || !event.target) return;
      const key = JSON.stringify([event.attacker, event.target]);
      if (!groups.has(key)) groups.set(key, {attacker: event.attacker, target: event.target, events: []});
      groups.get(key).events.push(event);
    });
    return Array.from(groups.values(), group => ({
      attacker: group.attacker,
      target: group.target,
      ...summarizeAttackEvents(group.events, {from: filter.from, to: filter.to})
    })).sort((a, b) => b.totalDamage - a.totalDamage
      || b.hitCount - a.hitCount
      || a.attacker.localeCompare(b.attacker, "ja")
      || a.target.localeCompare(b.target, "ja"));
  }

  function detectCombatIntervals(events, options = {}) {
    const gapMs = Number.isFinite(options.gapMs) && options.gapMs >= 0 ? options.gapMs : 30000;
    const pairs = new Map();
    (Array.isArray(events) ? events : []).forEach(event => {
      if ((event.type !== "damage" && event.type !== "miss")
        || !Number.isFinite(event.timestamp) || !event.attacker || !event.target) return;
      const key = JSON.stringify([event.attacker, event.target]);
      if (!pairs.has(key)) pairs.set(key, {attacker: event.attacker, target: event.target, events: []});
      pairs.get(key).events.push(event);
    });

    const intervals = [];
    pairs.forEach(pair => {
      const sorted = pair.events.slice().sort((a, b) => a.timestamp - b.timestamp || a.lineNumber - b.lineNumber);
      let current = [];
      const commit = () => {
        if (!current.length) return;
        const summary = summarizeAttackEvents(current);
        intervals.push({attacker: pair.attacker, target: pair.target, ...summary});
        current = [];
      };
      sorted.forEach(event => {
        if (current.length && event.timestamp - current[current.length - 1].timestamp > gapMs) commit();
        current.push(event);
      });
      commit();
    });
    return intervals.sort((a, b) => b.start - a.start
      || b.totalDamage - a.totalDamage
      || a.attacker.localeCompare(b.attacker, "ja")
      || a.target.localeCompare(b.target, "ja"));
  }

  function summarizeIncoming(events, actor, opponent, from, to) {
    const arrowDamage = events.filter(event => event.type === "damage"
      && event.timestamp >= from && event.timestamp <= to
      && (!actor || event.target === actor)
      && (!opponent || event.attacker === opponent));
    const unknownDamage = events.filter(event => (event.type === "received-damage" || event.type === "periodic-damage")
      && event.timestamp >= from && event.timestamp <= to
      && (!actor || event.target === actor));
    const physical = arrowDamage.filter(event => event.damageKind === "physical");
    const magic = arrowDamage.filter(event => event.damageKind === "magic");
    const penetrations = physical.filter(event => event.guardPenetration);
    return {
      totalDamage: [...arrowDamage, ...unknownDamage].reduce((sum, event) => sum + event.amount, 0),
      physicalDamage: physical.reduce((sum, event) => sum + event.amount, 0),
      physicalHitCount: physical.length,
      magicDamage: magic.reduce((sum, event) => sum + event.amount, 0),
      magicHitCount: magic.length,
      penetrationDamage: penetrations.reduce((sum, event) => sum + event.amount, 0),
      penetrationCount: penetrations.length,
      penetrationRate: physical.length ? penetrations.length * 100 / physical.length : 0,
      guardAvoidedDamage: penetrations.reduce((sum, event) => sum + event.guardAvoidedAmount, 0),
      unknownDamage: unknownDamage.reduce((sum, event) => sum + event.amount, 0),
      unknownHitCount: unknownDamage.length
    };
  }

  function summarizeRecovery(events, actor, from, to) {
    const recovery = events.filter(event => event.type === "recovery"
      && event.timestamp >= from && event.timestamp <= to
      && (!actor || event.target === actor));
    const resourceSummary = resource => {
      const selected = recovery.filter(event => event.resource === resource);
      const amount = selected.reduce((sum, event) => sum + event.amount, 0);
      const durationSeconds = Number.isFinite(from) && Number.isFinite(to) ? Math.max(0, (to - from) / 1000) : 0;
      return {
        amount,
        count: selected.length,
        average: selected.length ? amount / selected.length : 0,
        max: selected.length ? Math.max(...selected.map(event => event.amount)) : 0,
        min: selected.length ? Math.min(...selected.map(event => event.amount)) : 0,
        perMinute: durationSeconds > 0 ? amount * 60 / durationSeconds : 0
      };
    };
    return {hp: resourceSummary("hp"), st: resourceSummary("st"), mp: resourceSummary("mp")};
  }

  function summarizeActions(events, actor, opponent, from, to) {
    const selected = events.filter(event => event.timestamp >= from && event.timestamp <= to
      && (!actor || event.actor === actor)
      && (event.type !== "cast" || !opponent || event.target === opponent)
      && (event.type === "cast" || event.type === "cast-failure" || event.type === "action-failure"));
    const groups = new Map();
    selected.forEach(event => {
      const action = event.action || "名称不明";
      if (!groups.has(action)) groups.set(action, {action, castCount: 0, castFailureCount: 0, actionFailureCount: 0});
      const group = groups.get(action);
      if (event.type === "cast") group.castCount += 1;
      else if (event.type === "cast-failure") group.castFailureCount += 1;
      else group.actionFailureCount += 1;
    });
    const actions = Array.from(groups.values(), item => ({
      ...item,
      attemptCount: item.castCount + item.castFailureCount + item.actionFailureCount
    })).sort((a, b) => b.attemptCount - a.attemptCount || a.action.localeCompare(b.action, "ja"));
    return {
      castCount: selected.filter(event => event.type === "cast").length,
      castFailureCount: selected.filter(event => event.type === "cast-failure").length,
      actionFailureCount: selected.filter(event => event.type === "action-failure").length,
      attemptCount: selected.length,
      actions
    };
  }

  function analyzeCombatEvents(events, filter = {}) {
    const list = Array.isArray(events) ? events : [];
    const from = Number.isFinite(filter.from) ? filter.from : -Infinity;
    const to = Number.isFinite(filter.to) ? filter.to : Infinity;
    const baseFilter = {attacker: filter.attacker, target: filter.target, from, to};
    const total = summarizeAttackEvents(list, baseFilter);
    const sharedFrom = Number.isFinite(filter.from) ? filter.from : total.start;
    const sharedTo = Number.isFinite(filter.to) ? filter.to : total.end;
    const groupedFilter = {...baseFilter, from: sharedFrom, to: sharedTo};
    return {
      total,
      physical: summarizeAttackEvents(list, {...groupedFilter, damageKind: "physical"}),
      magic: summarizeAttackEvents(list, {...groupedFilter, damageKind: "magic"}),
      incoming: summarizeIncoming(list, filter.attacker || "", filter.target || "", sharedFrom ?? from, sharedTo ?? to),
      recovery: summarizeRecovery(list, filter.attacker || "", sharedFrom ?? from, sharedTo ?? to),
      actions: summarizeActions(list, filter.attacker || "", filter.target || "", sharedFrom ?? from, sharedTo ?? to)
    };
  }

  function reportNumber(value, digits = 0) {
    return Number(value || 0).toFixed(digits);
  }

  function buildCombatReportText(analysis, metadata = {}) {
    const data = analysis || {};
    const total = data.total || {};
    const physical = data.physical || {};
    const magic = data.magic || {};
    const incoming = data.incoming || {};
    const recovery = data.recovery || {hp: {}, st: {}, mp: {}};
    const actions = data.actions || {actions: []};
    const durationSeconds = Number(total.durationSeconds || 0);
    const lines = [
      `対象時間：${metadata.fromText || "-"} ～ ${metadata.toText || "-"}`,
      `経過時間：${reportNumber(durationSeconds, 0)} 秒 (${reportNumber(durationSeconds / 60, 1)} 分)`,
      `集計対象：${metadata.attacker || "すべての攻撃者"} → ${metadata.target || "すべての対象"}`,
      "▼合計（物理+魔法）",
      `合計 ： ${reportNumber(total.totalDamage)} (dmg)`,
      `攻撃回数 ： ${reportNumber(total.attackCount)} (atk)`,
      `平均 ： ${reportNumber(total.averageDamage, 1)} (dmg/atk)`,
      `毎分ダメージ ： ${reportNumber(total.damagePerMinute, 1)} (dmg/min)`,
      `毎分攻撃回数 ： ${reportNumber(total.attacksPerMinute, 1)} (atk/min)`,
      "▼物理",
      `合計 ： ${reportNumber(physical.totalDamage)} (dmg)`,
      `攻撃回数 ： ${reportNumber(physical.attackCount)} (atk)`,
      `最大 / 最小 ： ${reportNumber(physical.maxDamage)} / ${reportNumber(physical.minDamage)} (dmg)`,
      `クリティカル ： ${reportNumber(physical.criticalCount)} (atk)`,
      `クリティカルダメージ ： ${reportNumber(physical.criticalDamage)} (dmg)`,
      `クリティカル率 ： ${reportNumber(physical.criticalRate, 2)}% (${reportNumber(physical.criticalCount)}/${reportNumber(physical.hitCount)})`,
      `攻撃ミス ： ${reportNumber(physical.attackMissCount)} (atk)`,
      `攻撃ミス率 ： ${reportNumber(physical.attackMissRate, 2)}%`,
      `ミス ザ マーク ： ${reportNumber(physical.missTheMarkCount)} (atk)`,
      `ミス ザ マーク率 ： ${reportNumber(physical.missTheMarkRate, 2)}%`,
      `リアクティブ ： ${reportNumber(physical.reflectionDamage)} (dmg) / ${reportNumber(physical.reflectionCount)} 回`,
      "▼魔法",
      `合計 ： ${reportNumber(magic.totalDamage)} (dmg)`,
      `攻撃回数 ： ${reportNumber(magic.attackCount)} (atk)`,
      `最大 / 最小 ： ${reportNumber(magic.maxDamage)} / ${reportNumber(magic.minDamage)} (dmg)`,
      "▼被ダメージ",
      `合計 ： ${reportNumber(incoming.totalDamage)} (dmg)`,
      `物理 ： ${reportNumber(incoming.physicalDamage)} (dmg) / ${reportNumber(incoming.physicalHitCount)} 回`,
      `魔法 ： ${reportNumber(incoming.magicDamage)} (dmg) / ${reportNumber(incoming.magicHitCount)} 回`,
      `貫通 ： ${reportNumber(incoming.penetrationDamage)} (dmg) / ${reportNumber(incoming.penetrationCount)} 回`,
      `貫通率 ： ${reportNumber(incoming.penetrationRate, 2)}% (${reportNumber(incoming.penetrationCount)}/${reportNumber(incoming.physicalHitCount)})`,
      `盾回避 ： ${reportNumber(incoming.guardAvoidedDamage)} (dmg)`,
      "▼回復",
      `体力 ： ${reportNumber(recovery.hp?.amount)} / ${reportNumber(recovery.hp?.count)} 回`,
      `体力平均 ： ${reportNumber(recovery.hp?.average, 1)} / 毎分 ${reportNumber(recovery.hp?.perMinute, 1)}`,
      `スタミナ ： ${reportNumber(recovery.st?.amount)} / ${reportNumber(recovery.st?.count)} 回`,
      `スタミナ平均 ： ${reportNumber(recovery.st?.average, 1)} / 毎分 ${reportNumber(recovery.st?.perMinute, 1)}`,
      `MP ： ${reportNumber(recovery.mp?.amount)} / ${reportNumber(recovery.mp?.count)} 回`,
      `MP平均 ： ${reportNumber(recovery.mp?.average, 1)} / 毎分 ${reportNumber(recovery.mp?.perMinute, 1)}`,
      "▼行動ログ",
      `詠唱ログ ： ${reportNumber(actions.castCount)} 回`,
      `詠唱失敗 ： ${reportNumber(actions.castFailureCount)} 回`,
      `その他の行動失敗 ： ${reportNumber(actions.actionFailureCount)} 回`,
      ...actions.actions.slice(0, 10).map(item => `${item.action} ： ${reportNumber(item.attemptCount)} 回`)
    ];
    return lines.join("\n");
  }

  function buildCompactCombatReportText(analysis, metadata = {}, options = {}) {
    const total = analysis?.total || {};
    const physical = analysis?.physical || {};
    const magic = analysis?.magic || {};
    const maxLength = Number.isFinite(options.maxLength) && options.maxLength > 0 ? Math.floor(options.maxLength) : 240;
    const shorten = value => {
      const text = String(value || "-");
      return text.length > 28 ? `${text.slice(0, 27)}…` : text;
    };
    const criticalRate = total.hitCount ? Number(total.criticalCount || 0) * 100 / total.hitCount : 0;
    const missRate = total.attackCount ? Number(total.missCount || 0) * 100 / total.attackCount : 0;
    const report = [
      `MoE ${shorten(metadata.attacker || "全攻撃者")}→${shorten(metadata.target || "全対象")}`,
      `${reportNumber(total.durationSeconds)}秒`,
      `${reportNumber(total.totalDamage)}dmg/${reportNumber(total.attackCount)}atk`,
      `平均${reportNumber(total.averageDamage, 1)}`,
      `DPM${reportNumber(total.damagePerMinute, 1)}`,
      `物理${reportNumber(physical.totalDamage)}`,
      `魔法${reportNumber(magic.totalDamage)}`,
      `Crit${reportNumber(total.criticalCount)}(${reportNumber(criticalRate, 1)}%)`,
      `Miss${reportNumber(total.missCount)}(${reportNumber(missRate, 1)}%)`
    ].join(" | ");
    return report.length > maxLength ? `${report.slice(0, Math.max(0, maxLength - 1))}…` : report;
  }

  function csvCell(value) {
    const text = String(value ?? "");
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function buildCombatReportCsv(analysis, metadata = {}) {
    const data = analysis || {};
    const rows = [["category", "item", "value", "unit"]];
    const add = (category, item, value, unit = "") => rows.push([category, item, value ?? 0, unit]);
    add("metadata", "from", metadata.fromText || "");
    add("metadata", "to", metadata.toText || "");
    add("metadata", "attacker", metadata.attacker || "");
    add("metadata", "target", metadata.target || "");
    [["total", data.total], ["physical", data.physical], ["magic", data.magic]].forEach(([category, summary]) => {
      add(category, "damage", summary?.totalDamage, "dmg");
      add(category, "attacks", summary?.attackCount, "atk");
      add(category, "hits", summary?.hitCount, "atk");
      add(category, "average", reportNumber(summary?.averageDamage, 1), "dmg/atk");
      add(category, "damage_per_minute", reportNumber(summary?.damagePerMinute, 1), "dmg/min");
      add(category, "attacks_per_minute", reportNumber(summary?.attacksPerMinute, 1), "atk/min");
      add(category, "critical", summary?.criticalCount, "atk");
      add(category, "critical_damage", summary?.criticalDamage, "dmg");
      add(category, "critical_rate", reportNumber(summary?.criticalRate, 2), "%");
      add(category, "miss", summary?.missCount, "atk");
      add(category, "miss_rate", reportNumber(summary?.missRate, 2), "%");
    });
    add("incoming", "damage", data.incoming?.totalDamage, "dmg");
    add("incoming", "penetration_damage", data.incoming?.penetrationDamage, "dmg");
    add("incoming", "penetration_count", data.incoming?.penetrationCount, "atk");
    add("incoming", "penetration_rate", reportNumber(data.incoming?.penetrationRate, 2), "%");
    add("incoming", "guard_avoided_damage", data.incoming?.guardAvoidedDamage, "dmg");
    add("recovery", "hp", data.recovery?.hp?.amount);
    add("recovery", "hp_count", data.recovery?.hp?.count, "times");
    add("recovery", "hp_average", reportNumber(data.recovery?.hp?.average, 1));
    add("recovery", "hp_per_minute", reportNumber(data.recovery?.hp?.perMinute, 1), "/min");
    add("recovery", "st", data.recovery?.st?.amount);
    add("recovery", "st_count", data.recovery?.st?.count, "times");
    add("recovery", "st_average", reportNumber(data.recovery?.st?.average, 1));
    add("recovery", "st_per_minute", reportNumber(data.recovery?.st?.perMinute, 1), "/min");
    add("recovery", "mp", data.recovery?.mp?.amount);
    add("recovery", "mp_count", data.recovery?.mp?.count, "times");
    add("recovery", "mp_average", reportNumber(data.recovery?.mp?.average, 1));
    add("recovery", "mp_per_minute", reportNumber(data.recovery?.mp?.perMinute, 1), "/min");
    add("actions", "cast", data.actions?.castCount, "times");
    add("actions", "cast_failure", data.actions?.castFailureCount, "times");
    add("actions", "action_failure", data.actions?.actionFailureCount, "times");
    (data.actions?.actions || []).forEach(item => {
      add("action", item.action, item.attemptCount, "times");
    });
    return `\uFEFF${rows.map(row => row.map(csvCell).join(",")).join("\r\n")}`;
  }

  function buildCombatLogDiagnosticsText(parseResult, metadata = {}) {
    const result = parseResult || {};
    const unclassified = Array.isArray(result.unclassifiedCombatLines) ? result.unclassifiedCombatLines : [];
    const invalid = Array.isArray(result.invalidLines) ? result.invalidLines : [];
    const lines = [
      "Master of Epic 戦闘ログ解析診断",
      `ファイル：${metadata.fileName || "-"}`,
      `総行数：${Number(result.lineCount || 0)}`,
      `未分類戦闘候補：${unclassified.length}`,
      `日時形式外：${invalid.length}`
    ];
    if (unclassified.length) {
      lines.push("", "▼未分類戦闘候補");
      unclassified.forEach(item => lines.push(`${item.lineNumber || 0}: ${item.raw || item.message || ""}`));
    }
    if (invalid.length) {
      lines.push("", "▼日時形式外");
      invalid.forEach(item => lines.push(`${item.lineNumber || 0}: ${item.raw || ""}`));
    }
    return lines.join("\n");
  }

  const api = Object.freeze({
    decodeCombatLog,
    normalizeCombatLogText,
    parseCombatLogLine,
    parseCombatLog,
    summarizeCombatEvents,
    rankAttackPairs,
    detectCombatIntervals,
    analyzeCombatEvents,
    buildCombatReportText,
    buildCompactCombatReportText,
    buildCombatReportCsv,
    buildCombatLogDiagnosticsText
  });

  global.MoeCombatLogParser = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
