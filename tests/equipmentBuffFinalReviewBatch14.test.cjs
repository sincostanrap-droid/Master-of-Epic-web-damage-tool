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
  "technic-5235", "technic-11533", "technic-8500", "technic-12287",
  "technic-12775", "technic-9511", "technic-9456", "technic-9520",
  "technic-10587", "technic-8895", "technic-12596", "technic-9875",
  "technic-7632", "technic-9936", "technic-2575"
]) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} display-only`);
  assert.ok(rules[id].customEffects.length > 0, `${id} display effect`);
}

for (const id of [
  "technic-11841", "technic-14386"
]) {
  assert.equal(rules[id].reviewStatus, "unverified", `${id} unverified`);
  assert.equal(rules[id].verified, false, `${id} verified flag`);
}

for (const id of [
  "technic-1334 / 1327",
  "technic-7535 / 7534 / 7537 / 7536",
  "technic-3477 / 3756",
  "technic-1327 / 1334 / 1335 / 3113 / 3461 / 3657 / 4042 / 5166"
]) {
  assert.equal(rules[id].sourceCatalogOnly, true, `${id} source-only`);
  assert.equal(rules[id].officialTechnicId, null, `${id} has no single technic ID`);
}

assert.equal(rules["technic-8138"].reviewStatus, "implemented");
assert.equal(rules["technic-8138"].misc.targetRace, "undead");
assert.equal(rules["technic-8138"].misc.targetMultiplier, 1.1);
assert.equal(rules["technic-8138"].conflictGroup, "special:latest");

console.log("equipmentBuffFinalReviewBatch14 tests: OK");
