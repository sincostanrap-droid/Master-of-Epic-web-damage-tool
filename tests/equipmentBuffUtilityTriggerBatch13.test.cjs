const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, "src/data/manual/buffRules.manual.js"), "utf8"),
  context
);
const rules = context.window.MOE_BUFF_RULES_MANUAL;

const displayOnly = [
  "technic-12615", "technic-7063", "technic-13093", "technic-7729",
  "technic-1578", "technic-1524", "technic-2579", "technic-8126",
  "technic-5686", "technic-7945", "technic-11828", "technic-12449",
  "technic-12013", "technic-12014", "technic-12015", "technic-12016",
  "technic-12017", "technic-11368", "technic-13122", "technic-9127",
  "technic-6891", "technic-12555", "technic-5897", "technic-989",
  "technic-13516"
];
for (const id of displayOnly) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} display-only`);
  assert.equal(rules[id].verified, true, `${id} verified`);
  assert.ok(rules[id].customEffects.length > 0, `${id} display effect`);
}

const unverified = [
  "technic-12307",
  "technic-7624", "technic-7093", "technic-8193",
  "technic-7917", "technic-12334",
  "technic-12704", "technic-13877"
];
for (const id of unverified) {
  assert.equal(rules[id].reviewStatus, "unverified", `${id} unverified`);
  assert.equal(rules[id].verified, false, `${id} verified flag`);
}

assert.equal(
  rules["technic-12615"].customEffects[0].name,
  "現在所持重量0.8倍・最大所持可能重量1.2倍"
);
assert.equal(rules["technic-13093"].customEffects[0].name, "魔法反射率20%");
assert.equal(
  rules["technic-10381"].customEffects[0].name,
  "専用技「氷結の息吹」使用可能"
);

console.log("equipmentBuffUtilityTriggerBatch13 tests: OK");
