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

const ids = [
  "technic-7535 / 7534 / 7537 / 7536",
  "technic-7949",
  "technic-8195",
  "technic-8699",
  "technic-9719",
  "technic-4364",
  "technic-8768",
  "technic-14078",
  "technic-8759",
  "technic-3275",
  "technic-8999",
  "technic-6080",
  "technic-977",
  "technic-1577",
  "technic-1579"
];

for (const id of ids) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} display-only`);
  assert.equal(rules[id].verified, true, `${id} verified`);
  assert.ok(rules[id].customEffects[0].name.length > 0, `${id} display effect`);
}

assert.match(rules["technic-8195"].customEffects[0].name, /発動率\/召喚性能不明/);
assert.match(rules["technic-8759"].customEffects[0].name, /最大HP10%ダメージ、上限40/);
assert.match(rules["technic-1577"].customEffects[0].name, /減少量不明/);
assert.equal(rules["technic-7535 / 7534 / 7537 / 7536"].sourceCatalogOnly, true);

console.log("equipmentBuffQualitativeDisplayBatch20 tests: OK");
