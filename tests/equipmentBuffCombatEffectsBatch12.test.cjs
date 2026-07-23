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

const recovery = new Map([
  ["technic-7257", ["hpRegenPerMinute", 36.52]],
  ["technic-7300", ["stRegenPerMinute", 36.52]],
  ["technic-7748", ["mpRegenPerMinute", 36.52]],
  ["technic-12217", ["mpRegenPerMinute", 60]],
  ["technic-7942", ["hpRegenPerMinute", 36.52]]
]);
for (const [id, [stat, value]] of recovery) {
  assert.equal(rules[id].reviewStatus, "implemented", `${id} implemented`);
  assert.equal(rules[id].stats[stat], value, `${id} recovery value`);
}

assert.equal(rules["technic-9152"].reviewStatus, "implemented");
assert.equal(rules["technic-9152"].misc.targetRace, "undead");
assert.equal(rules["technic-9152"].misc.targetMultiplier, 1.2);

for (const id of [
  "technic-6479", "technic-7326", "technic-12145", "technic-7737",
  "technic-8139", "technic-8301", "technic-6200", "technic-3564",
  "technic-9221", "technic-6393", "technic-10567", "technic-6080",
  "technic-977", "technic-14078", "technic-7634", "technic-8759",
  "technic-8132", "technic-9712", "technic-8771", "technic-8451"
]) {
  assert.equal(rules[id].reviewStatus, "unverified", `${id} unverified`);
  assert.equal(rules[id].verified, false, `${id} verified flag`);
}

for (const id of [
  "technic-2573", "technic-11266", "technic-9791", "technic-7831",
  "technic-9531", "technic-9323", "technic-10254", "technic-8778",
  "technic-9840", "technic-13579", "technic-13786", "technic-14254",
  "technic-8842", "technic-11964"
]) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} display-only`);
  assert.ok(rules[id].customEffects.length > 0, `${id} display effect`);
}

assert.equal(
  rules["technic-2573"].customEffects[0].name,
  "物理ダメージ10%反射・発動率100%"
);
assert.equal(
  rules["technic-11266"].customEffects[0].name,
  "通常攻撃時「桜花閃」追撃・攻撃力/刀剣依存"
);

console.log("equipmentBuffCombatEffectsBatch12 tests: OK");
