const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, "src/data/manual/buffRules.manual.js"), "utf8"),
  context
);

const rules = context.window.MOE_BUFF_RULES_MANUAL;
const expectedSpeed = new Map([
  ["technic-10510", 5],
  ["technic-10829", 5],
  ["technic-9277", 10],
  ["technic-9602", 10],
  ["technic-11528", 20]
]);

for (const [id, speed] of expectedSpeed) {
  assert.equal(rules[id].reviewStatus, "implemented", `${id} classification`);
  assert.equal(rules[id].stats.speed, speed, `${id} speed`);
}

for (const id of ["technic-9961", "technic-8063", "technic-2440", "technic-2441", "technic-2442"]) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} classification`);
  assert.ok(rules[id].customEffects.length > 0, `${id} display effects`);
}

assert.equal(rules["technic-9961"].stats, undefined, "water speed must not become normal speed");
assert.equal(rules["technic-2442"].customEffects[0].value, -6, "Lv3 item delay");

const movementBatch2 = new Map([
  ["technic-5812", ["speed", 2]],
  ["technic-7246", ["speed", 15]],
  ["technic-7801", ["speed", 10]],
  ["technic-7879", ["speed", 15]],
  ["technic-10247", ["speed", 20]],
  ["technic-10371", ["speed", 10]],
  ["technic-7746", ["speed", 15]],
  ["technic-12198", ["speed", 20]],
  ["technic-12000", ["speed", 20]],
  ["technic-5988", ["speed", 10]],
  ["technic-11377", ["speed", 10]],
  ["technic-10640", ["speed", 15]],
  ["technic-10933", ["speed", 15]],
  ["technic-10045", ["speed", 15]],
  ["technic-10533", ["speed", 10]],
  ["technic-11577", ["speedPct", 8]],
  ["technic-12523", ["speed", 15]],
  ["technic-5694", ["speed", 10]],
  ["technic-8120", ["speed", 10]]
]);

for (const [id, [stat, value]] of movementBatch2) {
  assert.equal(rules[id].reviewStatus, "implemented", `${id} classification`);
  assert.equal(rules[id].stats[stat], value, `${id} ${stat}`);
}

assert.equal(rules["technic-11377"].misc.jumpMultiplier, 1.45, "frog jump display value");
assert.equal(rules["technic-12523"].skillEffects[0].value, 10, "swimming skill effect");

const movementBatch3 = new Map([
  ["technic-7731", 5],
  ["technic-10882", 20],
  ["technic-6591", 10],
  ["technic-11525", 10],
  ["technic-6780", 10],
  ["technic-9566", 10],
  ["technic-12135", 15],
  ["technic-5649", 10],
  ["technic-8642", 15],
  ["technic-7227", 10],
  ["technic-7753", 10],
  ["technic-7157", 10],
  ["technic-8761", 20],
  ["technic-6478", 15],
  ["technic-6781", 15],
  ["technic-7470", 15],
  ["technic-11759", 20],
  ["technic-8252", 15],
  ["technic-7804", 15],
  ["technic-11162", 10]
]);

for (const [id, speed] of movementBatch3) {
  assert.equal(rules[id].reviewStatus, "implemented", `${id} classification`);
  assert.equal(rules[id].stats.speed, speed, `${id} speed`);
}

assert.equal(rules["technic-7227"].customEffects[1].value, -70, "fall speed display value");
assert.equal(rules["technic-11162"].customEffects[0].value, 25, "fall damage display value");

const movementBatch4 = new Map([
  ["technic-9468", 15],
  ["technic-5839", 5],
  ["technic-6199", -50],
  ["technic-12270", 20],
  ["technic-12701", 10],
  ["technic-9935", 15],
  ["technic-10470", 10],
  ["technic-7815", 15],
  ["technic-5896", 10],
  ["technic-12385", 20],
  ["technic-10155", 15],
  ["technic-8516", 15],
  ["technic-12561", 20],
  ["technic-9477", 10],
  ["technic-12715", 20],
  ["technic-8698", 15],
  ["technic-5883", 10],
  ["technic-5582", 10],
  ["technic-12703", 10],
  ["technic-9968", 15]
]);

for (const [id, speed] of movementBatch4) {
  assert.equal(rules[id].reviewStatus, "implemented", `${id} classification`);
  assert.equal(rules[id].stats.speed, speed, `${id} speed`);
}

assert.equal(rules["technic-6199"].stats.hpRegenPerMinute, 113, "sleeping bag HP regen");
assert.equal(rules["technic-12703"].misc.jumpMultiplier, 1.21, "mountain dog jump display value");

const movementBatch5 = new Map([
  ["technic-8754", ["speed", 15]],
  ["technic-8892", ["speed", 15]],
  ["technic-7539", ["speed", 10]],
  ["technic-11082", ["speedPct", 8]],
  ["technic-6263", ["speed", 10]],
  ["technic-8064", ["speed", 20]],
  ["technic-7386", ["speed", 20]],
  ["technic-7156", ["speed", 10]],
  ["technic-12381", ["speed", 15]],
  ["technic-13401", ["speed", 20]],
  ["technic-13684", ["speed", 10]],
  ["technic-13789", ["speed", 20]],
  ["technic-13720", ["speedPct", -50]],
  ["technic-13869", ["speed", 10]],
  ["technic-13878", ["speed", 20]],
  ["technic-13909", ["speedPct", 20]],
  ["technic-14004", ["speedPct", 20]],
  ["technic-14073", ["speed", 20]],
  ["technic-14083", ["speed", 5]],
  ["technic-14253", ["speedPct", 20]]
]);

for (const [id, [stat, value]] of movementBatch5) {
  assert.equal(rules[id].reviewStatus, "implemented", `${id} classification`);
  assert.equal(rules[id].stats[stat], value, `${id} ${stat}`);
}

assert.equal(rules["technic-13909"].stats.extraMaxWeightPct, 20, "locomotive weight");
assert.equal(rules["technic-13720"].skillEffects[0].value, 20, "training skill effect");

const movementBatch6 = new Map([
  ["technic-10676", ["speed", 15]],
  ["technic-9273", ["speed", 8]],
  ["technic-10374", ["speedPct", 5]],
  ["technic-10051", ["speed", 5]],
  ["technic-13677", ["speed", 10]],
  ["technic-13920", ["speedPct", 10]],
  ["technic-13963", ["speedPct", 5]],
  ["technic-13997", ["speedPct", 5]],
  ["technic-14152", ["speedPct", 10]],
  ["technic-14257", ["speedPct", 5]],
  ["technic-14306", ["speedPct", 10]],
  ["technic-14343", ["speedPct", 10]],
  ["technic-14392", ["speedPct", 15]]
]);

for (const [id, [stat, value]] of movementBatch6) {
  assert.equal(rules[id].reviewStatus, "implemented", `${id} classification`);
  assert.equal(rules[id].stats[stat], value, `${id} ${stat}`);
}

for (const id of ["technic-13876", "technic-14299", "technic-14347"]) {
  assert.equal(rules[id].reviewStatus, "implemented", `${id} classification`);
  assert.ok(rules[id].conversions.magicToSpeedPct > 0, `${id} magic to speed`);
}

for (const id of ["technic-8261", "technic-9453", "technic-8640", "technic-13191"]) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} classification`);
}

assert.equal(rules["technic-10051"].stats.extraAttackDelay, -5, "puppeteer attack delay");
assert.equal(rules["technic-14347"].stats.mpRegenPerMinute, 41.25, "speed star MP regen");

assert.equal(rules["technic-11462"].skillEffects[0].value, 10, "dwarf shaman destruction effect");
assert.equal(rules["technic-11216"].stats.attack, 5, "spiked power attack");

const directEffectsBatch8 = [
  "technic-3358", "technic-4041", "technic-6383", "technic-10113",
  "technic-5165", "technic-8504", "technic-11267", "technic-7078",
  "technic-12494", "technic-6314", "technic-4836", "technic-6262",
  "technic-7538", "technic-9567", "technic-3371", "technic-3276",
  "technic-10384", "technic-2917", "technic-12446", "technic-5879",
  "technic-9839", "technic-3583", "technic-6081", "technic-8764",
  "technic-11157", "technic-7829", "technic-7478", "technic-8005",
  "technic-11169", "technic-10688", "technic-9261", "technic-10530",
  "technic-10396", "technic-12612"
];
for (const id of directEffectsBatch8) {
  assert.equal(rules[id].reviewStatus, "implemented", `${id} batch8 classification`);
}

const displayOnlyBatch8 = [
  "technic-7726", "technic-8135", "technic-12618", "technic-2402",
  "technic-6406", "technic-13351", "technic-11149", "technic-10566",
  "technic-11461", "technic-11029", "technic-9564", "technic-6480",
  "technic-7479", "technic-8648", "technic-1628", "technic-10689",
  "technic-11584", "technic-8573", "technic-8574", "technic-8575",
  "technic-9145", "technic-8590", "technic-13688", "technic-8308"
];
for (const id of displayOnlyBatch8) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} batch8 classification`);
  assert.ok(rules[id].customEffects.length > 0, `${id} batch8 display effects`);
}

assert.equal(rules["technic-3358"].stats.extraDamageReducePct, 3, "cute eyes physical reduction");
assert.equal(rules["technic-5879"].stats.extraNeutralResPct, 5, "resistance stone neutral percent");
assert.equal(rules["technic-7829"].stats.extraACPct, -67, "mosquito body AC percent delta");
assert.equal(rules["technic-12612"].misc.targetRace, "bull", "realise phrase target race");
assert.equal(rules["technic-12612"].misc.targetMultiplier, 1.5, "realise phrase multiplier");

const displayClassificationBatch9 = [
  "technic-8251", "technic-6382", "technic-13392", "technic-8687",
  "technic-6486", "technic-10201", "technic-6177", "technic-4344",
  "technic-10213", "technic-6288", "technic-5471", "technic-4234",
  "technic-9879", "technic-3376", "technic-6305", "technic-4812",
  "technic-5150", "technic-10881", "technic-8639", "technic-5176",
  "technic-10212", "technic-7625", "technic-4806", "technic-6396",
  "technic-4672", "technic-6603", "technic-2993", "technic-10471",
  "technic-11826", "technic-12147", "technic-7529", "technic-8901",
  "technic-9722", "technic-3473", "technic-4952", "technic-4673",
  "technic-2178", "technic-5968", "technic-12006", "technic-10427",
  "technic-10197", "technic-9703", "technic-7751", "technic-10531",
  "technic-2510", "technic-9144", "technic-5687", "technic-9210",
  "technic-7223", "technic-9322", "technic-11953", "technic-4825",
  "technic-9269", "technic-6470", "technic-8770", "technic-12708",
  "technic-4635", "technic-12656", "technic-11767", "technic-11529",
  "technic-5856", "technic-8973", "technic-7946", "technic-10385",
  "technic-8846", "technic-11264", "technic-8115", "technic-3273",
  "technic-6377", "technic-9701", "technic-5827", "technic-9258",
  "technic-1573", "technic-11952", "technic-4582", "technic-13508",
  "technic-13795", "technic-13964", "technic-14092"
];
for (const id of displayClassificationBatch9) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} batch9 classification`);
  assert.ok(rules[id].customEffects.length > 0, `${id} batch9 display effect`);
}

const noNumericDisplayBatch10 = [
  "technic-3268", "technic-7750", "technic-2439", "technic-4559",
  "technic-9674", "technic-7755", "technic-8199", "technic-5967",
  "technic-1327", "technic-4022", "technic-3875", "technic-7880",
  "technic-2996", "technic-7304", "technic-9892", "technic-7649",
  "technic-3551", "technic-3867", "technic-8774", "technic-5976"
];
for (const id of noNumericDisplayBatch10) {
  assert.equal(rules[id].reviewStatus, "display-only", `${id} batch10 display classification`);
  assert.ok(rules[id].customEffects.length > 0, `${id} batch10 display effect`);
}

const noNumericUnverifiedBatch10 = [
  "technic-6368", "technic-8998", "technic-8996", "technic-7873"
];
for (const id of noNumericUnverifiedBatch10) {
  assert.equal(rules[id].reviewStatus, "unverified", `${id} batch10 unverified classification`);
  assert.equal(rules[id].verified, false, `${id} batch10 verified flag`);
  assert.ok(rules[id].customEffects.length > 0, `${id} batch10 unverified display effect`);
}

console.log("equipmentBuffManualRules tests: OK");
