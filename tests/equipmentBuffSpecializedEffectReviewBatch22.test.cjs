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
  12307, 7624, 7093, 7917, 12334, 9603, 8253,
  6604, 12704, 7824, 13877, 6368, 7873
];

for (const id of ids) {
  const rule = rules[`technic-${id}`];
  assert.equal(rule.reviewStatus, "display-only", `${id} display-only`);
  assert.equal(rule.verified, true, `${id} verified`);
  assert.ok(rule.customEffects.length > 0, `${id} display effect`);
}

assert.deepEqual(
  JSON.parse(JSON.stringify(rules["technic-12307"].skillEffects)),
  [{ name: "筋力", value: 20 }]
);
assert.deepEqual(
  JSON.parse(JSON.stringify(rules["technic-7093"].skillEffects)),
  [{ name: "キック", value: 10 }]
);
assert.match(rules["technic-7917"].customEffects[0].name, /攻撃力\+3%/);
assert.match(rules["technic-9603"].customEffects[0].name, /約-15%/);
assert.match(rules["technic-7824"].customEffects[2].name, /範囲\+2m/);
assert.match(rules["technic-13877"].customEffects[1].name, /海流撃/);

console.log("equipmentBuffSpecializedEffectReviewBatch22 tests: OK");
