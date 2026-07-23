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

const implementedSpeed = new Map([
  ["technic-8197", 15],
  ["technic-8152", 15],
  ["technic-11373", 10],
  ["technic-9454", 15],
  ["technic-8130", -15],
  ["technic-6595", -25]
]);
for (const [id, speed] of implementedSpeed) {
  assert.equal(rules[id].reviewStatus, "implemented", `${id} implemented`);
  assert.equal(rules[id].stats.speed, speed, `${id} normal movement speed`);
}

const unverified = [
  "technic-8997", "technic-8202", "technic-3103",
  "technic-3151"
];
for (const id of unverified) {
  assert.equal(rules[id].reviewStatus, "unverified", `${id} unverified`);
  assert.equal(rules[id].verified, false, `${id} verified flag`);
}

const displayExamples = [
  "technic-8305", "technic-13284", "technic-10469",
  "technic-10677", "technic-6896", "technic-11213",
  "technic-2823", "technic-9382", "technic-12622",
  "technic-7466", "technic-6886", "technic-9997",
  "technic-8686", "technic-2497", "technic-9268"
];
for (const id of displayExamples) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} display-only`);
  assert.ok(rules[id].customEffects.length > 0, `${id} display effect`);
}

assert.equal(rules["technic-8305"].customEffects[0].name, "ペット取得経験値1.1倍");
assert.equal(rules["technic-2823"].customEffects[0].name, "全魔法 詠唱時間-3%・ディレイ-3%");
assert.equal(rules["technic-7466"].customEffects[0].name, "音楽/シャウト射程+3");
assert.equal(rules["technic-8686"].customEffects[0].name, "消費ST/MP 5%軽減");

console.log("equipmentBuffNumericSpecializedBatch11 tests: OK");
