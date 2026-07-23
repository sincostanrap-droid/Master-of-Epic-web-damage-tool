const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
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
const ids = [11841, 14386, 8193, 9009, 13910, 8998, 8996];

for (const id of ids) {
  const rule = rules[`technic-${id}`];
  assert.equal(rule.reviewStatus, "unverified", `${id} unverified`);
  assert.equal(rule.verified, false, `${id} verified flag`);
  assert.equal(rule.reviewComplete, true, `${id} final review`);
  assert.ok(rule.customEffects.length > 0, `${id} display effect`);
  assert.match(rule.memo, /最終未検証/);
}

assert.equal(rules["technic-8193"].stats.speedPct, 5);
assert.match(rules["technic-9009"].memo, /装備本体の攻撃力\+1とは分離/);
assert.match(rules["technic-13910"].memo, /装備本体の命中\+5のみ/);

const audit = JSON.parse(childProcess.execFileSync(
  process.execPath,
  [path.join(root, "tools/audit-equipment-buff-manual.mjs"), "--json"],
  { encoding: "utf8" }
));
assert.deepEqual(audit.counts.unverifiedReview, { finalized: 7, pending: 0 });

console.log("equipmentBuffFinalUnverifiedBatch23 tests: OK");
