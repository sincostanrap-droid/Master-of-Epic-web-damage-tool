const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const mainSource = fs.readFileSync(path.join(root, "src/main.js"), "utf8");
const start = mainSource.indexOf("function equipmentBuffSemanticEffectKey(");
const end = mainSource.indexOf("/* 公式説明に含まれる見た目・モーション系", start);
assert.ok(start >= 0 && end > start, "equipment Buff semantic display helpers must exist");

const context = {};
vm.createContext(context);
vm.runInContext(
  `${mainSource.slice(start, end)}
   globalThis.__semanticKey = equipmentBuffSemanticEffectKey;
   globalThis.__deduplicate = deduplicateEquipmentBuffEffectLabels;`,
  context
);

const deduplicate = labels => Array.from(context.__deduplicate(labels));

assert.deepEqual(
  deduplicate(["魔力→攻撃力 10%", "魔力→攻撃力変換 10%"]),
  ["魔力→攻撃力 10%"],
  "magic-to-attack spelling variants"
);
assert.deepEqual(
  deduplicate(["ST自然回復 +41.25/分", "ST自然回復/分+41.25"]),
  ["ST自然回復 +41.25/分"],
  "ST recovery spelling variants"
);
assert.deepEqual(
  deduplicate(["HP自然回復 +56.25/分", "HP自然回復/分 +56.25"]),
  ["HP自然回復 +56.25/分"],
  "HP recovery spelling variants"
);
assert.deepEqual(
  deduplicate(["MP自然回復 +42/分", "MP自然回復/分+42"]),
  ["MP自然回復 +42/分"],
  "MP recovery spelling variants"
);
assert.deepEqual(
  deduplicate(["魔力→攻撃力 10%", "魔力→攻撃力 5%"]),
  ["魔力→攻撃力 10%", "魔力→攻撃力 5%"],
  "different values must remain distinct"
);
assert.deepEqual(
  deduplicate(["ST自然回復 +41.25/分", "MP自然回復 +41.25/分"]),
  ["ST自然回復 +41.25/分", "MP自然回復 +41.25/分"],
  "different resources must remain distinct"
);

console.log("equipmentBuffSemanticDisplayDedup tests: OK");
