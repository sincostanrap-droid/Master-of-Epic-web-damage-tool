const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const elements = new Map();
const appendedScripts = [];
const panelChildren = [];

function control(id) {
  const listeners = {};
  return {
    id,
    value: "",
    disabled: id !== "combatLogFile",
    dataset: {},
    files: [],
    children: [],
    addEventListener(type, handler) { listeners[type] = handler; },
    appendChild(child) { this.children.push(child); },
    replaceChildren() { this.children = []; },
    listeners
  };
}

const panel = {
  dataset: {},
  appendChild(child) { panelChildren.push(child); }
};

const document = {
  head: {
    appendChild(script) { appendedScripts.push(script); }
  },
  querySelector(selector) {
    return selector === '[data-tab-panel="combatLog"]' ? panel : null;
  },
  getElementById(id) {
    return elements.get(id) || null;
  },
  createElement(tagName) {
    if (tagName === "script") return {dataset: {}};
    if (tagName === "option") return {value: "", textContent: ""};
    const element = {className: ""};
    Object.defineProperty(element, "innerHTML", {
      set(value) {
        element.html = value;
        ["combatLogFile", "combatLogAttacker", "combatLogTarget", "combatLogEncounter", "combatLogFrom", "combatLogTo", "combatLogFitRange", "combatLogCopy", "combatLogCsv", "combatLogStatus", "combatLogRangeStatus", "combatLogSelectionStatus", "combatLogActionStatus", "combatLogDiagnosticsDetails", "combatLogDiagnosticsSummary", "combatLogDiagnosticsSave", "combatLogRanking", "combatLogSummary"]
          .forEach(id => elements.set(id, control(id)));
        elements.get("combatLogStatus").textContent = "解析するmlogファイルを選択してください。";
      }
    });
    return element;
  }
};

const context = vm.createContext({document, console});
context.globalThis = context;
const source = fs.readFileSync("src/ui/combatLogTab.js", "utf8");
assert.match(source, /summaryBlock\("total"/, "summary sections must use horizontal text blocks");
assert.match(source, /combatLogTextStats/, "summary values must use text-based statistics");
assert.match(source, /visible\.length.*combatIntervals\.length/, "combat intervals must expose filtered and total counts");
vm.runInContext(source, context);

assert.equal(appendedScripts.length, 0, "parser must not load at application startup");
assert.equal(panelChildren.length, 0, "UI must not initialize before the tab opens");

context.renderCombatLogTab();
assert.equal(appendedScripts.length, 1, "first tab open must request the parser once");
assert.equal(panelChildren.length, 1, "first tab open must create the UI once");
assert.equal(panel.dataset.combatLogReady, "1");
assert.match(appendedScripts[0].src, /combatLogParser\.js/);

context.renderCombatLogTab();
assert.equal(appendedScripts.length, 1, "reopening the tab must not request a second parser");
assert.equal(panelChildren.length, 1, "reopening the tab must not duplicate the UI");

context.MoeCombatLogParser = {};
appendedScripts[0].onload();
setImmediate(() => {
  assert.equal(elements.get("combatLogAttacker").disabled, false);
  assert.equal(elements.get("combatLogTarget").disabled, false);
  console.log("combatLogTab lazy initialization tests: OK");
});
