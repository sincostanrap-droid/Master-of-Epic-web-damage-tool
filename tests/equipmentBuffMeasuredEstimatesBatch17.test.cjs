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

const confirmedEstimates = [
  "technic-5164", "technic-5572", "technic-6856", "technic-8139",
  "technic-8444", "technic-8132", "technic-9712", "technic-8771",
  "technic-8451", "technic-3103", "technic-3151"
];
for (const id of confirmedEstimates) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} display-only`);
  assert.equal(rules[id].verified, true, `${id} verified`);
  assert.ok(rules[id].customEffects.length > 0, `${id} display effect`);
}

assert.equal(
  rules["technic-8139"].customEffects[0].name,
  "被弾時約5%でHP150回復"
);
assert.equal(
  rules["technic-8132"].customEffects[0].name,
  "被弾時約20%で4秒間クリティカル100%・物理完全回避"
);
assert.equal(
  rules["technic-8451"].customEffects[0].name,
  "被弾時約10%で20秒間攻撃力+10%"
);

console.log("equipmentBuffMeasuredEstimatesBatch17 tests: OK");
