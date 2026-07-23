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

assert.equal(rules["technic-9881"].reviewStatus, "display-only");
assert.equal(rules["technic-9881"].verified, true);
assert.deepEqual(
  Array.from(rules["technic-9881"].customEffects, effect => [
    effect.name,
    effect.value,
    effect.unit || ""
  ]),
  [
    ["落下ダメージ軽減", 15, "%"],
    ["落下速度軽減", 60, "%"],
    ["待機・移動モーション変化", 0, ""]
  ]
);

assert.equal(rules["technic-11484"].reviewStatus, "implemented");
assert.equal(rules["technic-11484"].verified, true);
assert.equal(rules["technic-11484"].stats.stRegenPerMinute, 54);

assert.equal(rules["technic-8193"].reviewStatus, "unverified");
assert.equal(rules["technic-8193"].verified, false);
assert.equal(rules["technic-8193"].stats.speedPct, 5);
assert.equal(
  rules["technic-8193"].customEffects[0].name,
  "攻撃力上昇量未検証"
);

console.log("equipmentBuffPartialVerificationBatch16 tests: OK");
