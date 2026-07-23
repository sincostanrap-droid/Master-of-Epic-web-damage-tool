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

const promoted = [
  "technic-12597", "technic-9383", "technic-9166", "technic-6664",
  "technic-3274", "technic-9594", "technic-5855", "technic-13483",
  "technic-12621", "technic-12132", "technic-8446", "technic-9886",
  "technic-12620", "technic-3038"
];
for (const id of promoted) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} promoted`);
  assert.equal(rules[id].verified, true, `${id} verified`);
  assert.ok(rules[id].customEffects.length > 0, `${id} display effect`);
}

assert.equal(
  rules["technic-9383"].customEffects[0].name,
  "被弾時50%で30魔法ダメージ・5秒間AC10%低下"
);
assert.equal(
  rules["technic-9166"].customEffects[0].name,
  "被弾時30%で20魔法ダメージ・ST20回復・睡眠"
);
assert.equal(
  rules["technic-6664"].customEffects[0].name,
  "消費MP0.95倍（5%軽減）"
);
assert.equal(context.window.MOE_BUFF_RULE_REVIEW_PROMOTIONS_PENDING, undefined);

console.log("equipmentBuffUnverifiedReviewBatch15 tests: OK");
