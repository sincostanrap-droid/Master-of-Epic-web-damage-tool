const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src/main.js"), "utf8");
const syncStart = source.indexOf("function syncEquipmentUsageControls(");
const syncEnd = source.indexOf("function populateEquipmentFilterSlotOptions(", syncStart);
assert.ok(syncStart >= 0 && syncEnd > syncStart, "usage synchronization block");

function classes(initial = []) {
  const values = new Set(initial);
  return {
    toggle(name, force) {
      if (force) values.add(name);
      else values.delete(name);
    },
    contains(name) {
      return values.has(name);
    }
  };
}

const checkbox0 = { checked: false };
const checkbox1 = { checked: true };
const summary0 = { classList: classes() };
const summary1 = { classList: classes() };
const rows = [
  {
    dataset: { equipmentIndex: "0" },
    classList: classes(["equipmentOffRow"]),
    querySelector(selector) {
      return selector === ".equipmentUseCheckbox" ? checkbox0 : summary0;
    }
  },
  {
    dataset: { equipmentIndex: "1" },
    classList: classes(),
    querySelector(selector) {
      return selector === ".equipmentUseCheckbox" ? checkbox1 : summary1;
    }
  }
];

let filterStatus = "all";
let renderCount = 0;
const context = {
  state: { equipment: [{ enabled: true }, { enabled: false }] },
  document: {
    querySelectorAll() {
      return rows;
    }
  },
  equipmentFilterState() {
    return { status: filterStatus };
  },
  renderEquipmentTable() {
    renderCount += 1;
  }
};
vm.createContext(context);
vm.runInContext(
  `${source.slice(syncStart, syncEnd)}
   globalThis.__refresh = refreshEquipmentUsageAfterToggle;`,
  context
);

context.__refresh();
assert.equal(renderCount, 0, "normal toggle does not rebuild the table");
assert.equal(checkbox0.checked, true);
assert.equal(checkbox1.checked, false);
assert.equal(rows[0].classList.contains("equipmentOffRow"), false);
assert.equal(rows[1].classList.contains("equipmentOffRow"), true);
assert.equal(summary0.classList.contains("equipmentOffSummary"), false);
assert.equal(summary1.classList.contains("equipmentOffSummary"), true);

filterStatus = "enabled";
context.__refresh();
assert.equal(renderCount, 1, "status filter still rebuilds changed results");

const useCellStart = source.indexOf("function equipmentUseCell(");
const useCellEnd = source.indexOf("function equipmentOptimizerFixedCell(", useCellStart);
const useCellSource = source.slice(useCellStart, useCellEnd);
assert.match(useCellSource, /refreshEquipmentUsageAfterToggle\(\)/);
assert.doesNotMatch(useCellSource, /renderEquipmentTable\(\)/);
assert.doesNotMatch(useCellSource, /normalizeEquipmentRows\(/);

console.log("equipmentUseToggleResponse tests: OK");
