const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "src/main.js"), "utf8");
const start = source.indexOf("function optimizerCompositeCandidates(settings)");
const end = source.indexOf("function optimizerScoreTolerance(score)", start);

assert.ok(start >= 0 && end > start, "optimizer Buff fixed-state helper block");

const rows = [
  {name:"固定ON", enabled:true, fixed:true, effect:true},
  {name:"固定OFF", enabled:false, fixed:true, effect:true},
  {name:"通常ON", enabled:true, fixed:false, effect:true},
  {name:"通常OFF", enabled:false, fixed:false, effect:true}
];
const context = {
  optimizerCompositeRows: () => rows,
  compositeHasEffect: row => !!row.effect
};
vm.createContext(context);
vm.runInContext(source.slice(start, end), context);

let settings = {includeDisabledBuffs:true, fixCurrentBuffs:false, _compositeCandidates:null};
assert.deepEqual(
  Array.from(context.optimizerCompositeCandidates(settings), x => x.row.name),
  ["固定ON", "通常ON", "通常OFF"],
  "固定OFFは候補に入れない"
);
assert.deepEqual(
  Array.from(context.optimizerFixedCompositeCandidates(settings), x => x.row.name),
  ["固定ON"],
  "行単位の固定ONは必須候補にする"
);

settings = {includeDisabledBuffs:true, fixCurrentBuffs:true, _compositeCandidates:null};
assert.deepEqual(
  Array.from(context.optimizerFixedCompositeCandidates(settings), x => x.row.name),
  ["固定ON", "通常ON"],
  "「現在ONのBuffは必ず使う」と行単位固定を併用できる"
);

assert.equal(
  (source.match(/optimizerFixedCompositeCandidates\(settings(?:, candidates)?\)/g) || []).length,
  3,
  "3探索方式すべてで共通の固定判定を使う"
);

console.log("optimizer Buff fixed-state tests: OK");
