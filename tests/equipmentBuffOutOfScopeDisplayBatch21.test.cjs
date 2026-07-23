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
  12386, 14158, 14301, 14311, 14387, 7744, 7754, 6392, 6594,
  8313, 3034, 7720, 9718, 9568, 14090, 6479, 7326, 12145,
  7737, 8301, 6200, 9221, 6393, 10567, 7634, 11379, 7941,
  6086, 5837, 12458, 12777, 7569, 11483, 8819, 14258
];

for (const id of ids) {
  const rule = rules[`technic-${id}`];
  assert.equal(rule.reviewStatus, "display-only", `${id} display-only`);
  assert.equal(rule.verified, true, `${id} verified`);
  assert.ok(rule.customEffects.length > 0, `${id} display effect`);
}

assert.equal(rules["technic-12145"].customEffects.length, 2);
assert.match(rules["technic-12145"].customEffects[1].name, /27～28ダメージ×3/);
assert.match(rules["technic-9221"].memo, /14秒\/15秒/);
assert.match(rules["technic-7634"].customEffects[1].name, /55回÷292被弾≒18\.8%/);
assert.match(rules["technic-14258"].customEffects[3].name, /50%軽減/);

console.log("equipmentBuffOutOfScopeDisplayBatch21 tests: OK");
