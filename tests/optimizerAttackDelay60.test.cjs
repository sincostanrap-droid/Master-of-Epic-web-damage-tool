const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const mainSource = fs.readFileSync(path.join(root, "src/main.js"), "utf8");
const coreSource = fs.readFileSync(path.join(root, "src/optimizer/core.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");

assert.match(indexSource, /id="optimizerRequireAttackDelay60"[^>]*type="checkbox"/);
assert.match(indexSource, /攻撃ディレイ-60を確保する/);
assert.match(mainSource, /requireAttackDelay60:\s*!!byId\("optimizerRequireAttackDelay60"\)\?\.checked/);
assert.match(mainSource, /value <= -60 \+ eps/);
assert.match(mainSource, /value <= -60 \+ 0\.000001\s*\? \[1, 0\]\s*: \[0, -Math\.abs\(value \+ 60\)\]/);
assert.match(mainSource, /optimizerFinalConstraintViolations\(metrics, settings\)/);
assert.equal(
  (coreSource.match(/optimizerFinalConstraintViolations\([^)]*, settings\)/g) || []).length,
  3,
  "現在ON、現在装備Buff最適化、自動探索の最終結果へ条件を適用する"
);
assert.equal(
  (coreSource.match(/if \(settings\.requireAttackDelay60\) \{\s*return base(?:Sort|Compare)\.call/g) || []).length,
  2,
  "スキル強化目的でも攻撃ディレイ条件を最優先する"
);

const helperStart = mainSource.indexOf("function optimizerRequiredConditionViolations");
const helperEnd = mainSource.indexOf("function optimizerObjectiveList", helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart, "attack-delay constraint helper block");
const context = {
  fmt: value => String(value),
  optimizerStatCapViolations: () => [],
  optimizerTargetOverViolations: () => []
};
vm.createContext(context);
vm.runInContext(mainSource.slice(helperStart, helperEnd), context);

assert.deepEqual(
  Array.from(context.optimizerRequiredConditionViolations(
    {extraStats:{extraAttackDelay:-60}},
    {requireAttackDelay60:true}
  )),
  []
);
assert.deepEqual(
  Array.from(context.optimizerRequiredConditionViolations(
    {extraStats:{extraAttackDelay:-65}},
    {requireAttackDelay60:true}
  )),
  []
);
assert.equal(
  context.optimizerRequiredConditionViolations(
    {extraStats:{extraAttackDelay:-59}},
    {requireAttackDelay60:true}
  ).length,
  1
);
assert.deepEqual(
  Array.from(context.optimizerRequiredConditionViolations(
    {extraStats:{extraAttackDelay:0}},
    {requireAttackDelay60:false}
  )),
  []
);

console.log("optimizer attack-delay -60 tests: OK");
