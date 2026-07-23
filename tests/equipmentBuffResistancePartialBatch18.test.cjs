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

const snowWoman = rules["technic-10381"];
assert.equal(snowWoman.reviewStatus, "implemented");
assert.equal(snowWoman.verified, true);
assert.equal(snowWoman.stats.extraWaterRes, 20);
assert.equal(snowWoman.stats.extraWaterResPct, 25);
assert.equal(
  snowWoman.customEffects[0].name,
  "専用技「氷結の息吹」使用可能"
);

const scorpio = rules["technic-12145"];
assert.equal(scorpio.reviewStatus, "unverified");
assert.equal(scorpio.verified, false);
assert.equal(
  scorpio.customEffects[1].name,
  "被弾時に毒針反撃 27～28ダメージ×3"
);

const starfish = rules["technic-14258"];
assert.equal(starfish.reviewStatus, "unverified");
assert.equal(starfish.verified, false);
assert.equal(
  starfish.customEffects[3].name,
  "水属性被ダメージ50%軽減"
);

console.log("equipmentBuffResistancePartialBatch18 tests: OK");
