const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src/main.js"), "utf8");
const start = source.indexOf("function additionalEffectIdentity(");
const end = source.indexOf("function quickEffectTargetName(", start);
assert.ok(start >= 0 && end > start, "additional-effect helpers must be extractable");

const context = {
  quickEffectDef() {
    return { label: "追加効果", unit: "" };
  },
  fmt(value) {
    return String(value);
  }
};
vm.createContext(context);
vm.runInContext(
  `${source.slice(start, end)}
   globalThis.__additionalEffectsTest = {
     normalizeAdditionalEffects,
     additionalEffectsSummary,
     pushDisplayEffect
   };`,
  context
);

const {
  normalizeAdditionalEffects,
  additionalEffectsSummary,
  pushDisplayEffect
} = context.__additionalEffectsTest;

const historical = {
  extraEffects: [
    { key: "custom", name: "ペット取得経験値", value: 1.1, unit: "倍", scope: "display", note: "保存値" },
    { key: "custom", name: "ペット取得経験値", value: 1.1, unit: "倍", scope: "display", note: "manual" },
    { key: "custom", name: "ペット取得経験値", value: 1.1, unit: "倍", scope: "display", note: "再解決" }
  ]
};

assert.equal(normalizeAdditionalEffects(historical.extraEffects).length, 1);
assert.deepEqual(
  Array.from(additionalEffectsSummary(historical, "display")),
  ["ペット取得経験値  +1.1倍"]
);

const row = { extraEffects: historical.extraEffects };
assert.equal(
  pushDisplayEffect(row, "custom", 1.1, "ペット取得経験値", "倍", "display", "候補"),
  false,
  "same display effect must not be appended"
);
assert.equal(row.extraEffects.length, 1);

assert.equal(
  pushDisplayEffect(row, "custom", 1.2, "ペット取得経験値", "倍", "display", "別効果"),
  true,
  "different values must remain distinct"
);
assert.equal(row.extraEffects.length, 2);

const scoped = normalizeAdditionalEffects([
  { key: "custom", name: "同名", value: 1, unit: "%", scope: "display" },
  { key: "custom", name: "同名", value: 1, unit: "%", scope: "calculation" }
]);
assert.equal(scoped.length, 2, "different scopes must remain distinct");

console.log("additionalEffectsDedup tests: OK");
