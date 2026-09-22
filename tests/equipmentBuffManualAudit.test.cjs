const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const result = spawnSync(
  process.execPath,
  [path.join(root, "tools/audit-equipment-buff-manual.mjs"), "--json"],
  { cwd: root, encoding: "utf8" }
);

assert.equal(result.status, 0, result.stderr || result.stdout);
const report = JSON.parse(result.stdout);
assert.equal(report.ok, true);
assert.equal(report.errors.length, 0);
assert.ok(report.counts.manualRules > 0);
assert.ok(report.counts.runtimeStatKeys > 0);
assert.ok(report.counts.remainingWithoutNormalizedEffect >= 0);

console.log("equipmentBuffManualAudit tests: OK");
