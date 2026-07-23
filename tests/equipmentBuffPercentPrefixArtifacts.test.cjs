const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const mainSource = fs.readFileSync(path.join(root, "src/main.js"), "utf8");
const start = mainSource.indexOf("function equipmentBuffPercentPrefixArtifactFields(");
const end = mainSource.indexOf("function applyEquipBuffRuleCandidateToEquipment(", start);
assert.ok(start >= 0 && end > start, "percent-prefix artifact helpers must exist");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(
  `${mainSource.slice(start, end)}
   globalThis.__artifactFields = equipmentBuffPercentPrefixArtifactFields;
   globalThis.__cleanStats = equipmentBuffStatsWithoutPercentPrefixArtifacts;
   globalThis.__cleanRow = clearEquipmentBuffPercentPrefixArtifacts;`,
  context
);
vm.runInContext(
  fs.readFileSync(path.join(root, "src/data/generated/equipBuffRuleCandidates.generated.js"), "utf8"),
  context
);

const generated = context.window.MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED;
const affected = generated.filter(rule => context.__artifactFields(rule).size > 0);
const affectedFieldCount = affected.reduce((sum, rule) => sum + context.__artifactFields(rule).size, 0);

for (const rule of affected) {
  const fields = context.__artifactFields(rule);
  const cleaned = context.__cleanStats(rule, rule.stats);
  for (const field of fields) {
    const [flatKey] = field.split("\u001f");
    assert.equal(cleaned[flatKey], undefined, `${rule.catalogId} ${flatKey} must be removed`);
  }
}

const sia = generated.find(rule => rule.catalogId === "technic-13577");
assert.ok(sia, "Sia Buff candidate");
assert.equal(sia.stats.extraAvoidPct, 20, "Sia evasion percent source value");
const siaStats = context.__cleanStats(sia, sia.stats);
assert.equal(siaStats.extraAvoidPct, 20, "Sia evasion percent remains");
assert.equal(siaStats.extraAvoid, undefined, "Sia false flat evasion is removed");
const legacySia = {
  ...sia,
  parsedStatsHint: "回避%:20% / 回避:2",
  stats: { ...sia.stats, extraAvoidPct: 20, extraAvoid: 2 }
};
const savedSia = { equipBuffExtraAvoid: 2, equipBuffExtraAvoidPct: 20 };
context.__cleanRow(savedSia, legacySia);
assert.equal(savedSia.equipBuffExtraAvoid, 0, "old saved Sia row is repaired");
assert.equal(savedSia.equipBuffExtraAvoidPct, 20, "old saved Sia percent remains");

const manualFixture = {
  source: "manual-verified",
  parsedStatsHint: "回避%:20% / 回避:2",
  stats: { extraAvoidPct: 20, extraAvoid: 2 }
};
assert.equal(context.__artifactFields(manualFixture).size, 0, "manual fixed values are never suppressed");

const wikiBuilderSource = fs.readFileSync(
  path.join(root, "tools/build-wiki-equip-buff-effects.mjs"),
  "utf8"
);
const patternStart = wikiBuilderSource.indexOf("const STAT_PATTERNS = [");
const patternEnd = wikiBuilderSource.indexOf("const ELEMENTS =", patternStart);
assert.ok(patternStart >= 0 && patternEnd > patternStart, "Wiki stat patterns must exist");
const patternContext = {};
vm.createContext(patternContext);
vm.runInContext(
  `${wikiBuilderSource.slice(patternStart, patternEnd)}
   globalThis.__patterns = STAT_PATTERNS;`,
  patternContext
);
const parsePatternValues = info => patternContext.__patterns.flatMap(def => {
  def.re.lastIndex = 0;
  return Array.from(info.matchAll(def.re), match => [def.key, Number(match[1])]);
});
assert.equal(
  JSON.stringify(parsePatternValues("回避+20%")),
  JSON.stringify([["extraAvoidPct", 20]]),
  "percent value must not also produce a truncated flat value"
);
assert.equal(
  JSON.stringify(parsePatternValues("回避+2")),
  JSON.stringify([["avoidFlat", 2]]),
  "real flat value remains supported"
);

console.log(`equipmentBuffPercentPrefixArtifacts tests: OK (${affected.length} candidates / ${affectedFieldCount} fields)`);
