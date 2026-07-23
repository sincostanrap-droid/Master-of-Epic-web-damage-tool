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

for (const id of [
  "technic-3564", "technic-8997", "technic-8202", "technic-9593"
]) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} display-only`);
  assert.equal(rules[id].verified, true, `${id} verified`);
}

assert.equal(
  rules["technic-3564"].customEffects[0].name,
  "HP/MP自然回復 約15/分・ST自然回復 約10/分"
);
assert.equal(
  rules["technic-8202"].customEffects[0].name,
  "銃器ディレイ 約-10%・専用技「タンク キャノン」使用可能"
);

assert.equal(
  rules["technic-7634"].customEffects[1].name,
  "発動率：Wiki約10% / 実測55回÷292被弾≒18.8%"
);

console.log("equipmentBuffEstimateConflictSplitBatch19 tests: OK");
