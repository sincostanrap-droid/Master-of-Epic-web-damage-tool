const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const candidate = {
  name: "複合Buff",
  stats: {
    attackPct: 5,
    extraAttackDelayPct: -10,
    hpRegenPerMinute: 30
  },
  conversions: { magicToAttackPct: 10 },
  skillEffects: [{ name: "戦闘技術", value: 20 }],
  customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
  misc: { targetRace: "devil", targetMultiplier: 1.2 },
  memo: "複合Buffの検証済み効果"
};
const item = {
  name: "テスト装備",
  category: "defense",
  equipBuff: { name: "複合Buff", officialTechnicId: 123 }
};
const noBuffItem = { name: "Buffなし装備", category: "defense" };

const context = {
  escapeAttr: value => String(value),
  escapeHtml: value => String(value),
  TOOL_STAT_DISPLAY_NAMES: {},
  findEquipBuffRuleCandidate: () => candidate,
  targetRaceLabel: value => value === "devil" ? "悪魔" : value,
  damageBuffCompatibilityRulesForBuff: () => [],
  MOESkillPlusV21: {
    totalsFromObject: () => ({ 戦闘技術: 20 })
  }
};
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, "src/domain/catalogSearch.js"), "utf8"),
  context
);

const matches = filter => context.catalogItemMatches(item, {
  query: "",
  category: "",
  slot: "",
  buffMode: "",
  statFilters: [],
  buffEffectFilters: filter
});

assert.equal(matches([{ effect: "stat:attackPct", op: "gte", valueRaw: "5" }]), true);
assert.equal(matches([{ effect: "stat:attackPct", op: "gt", valueRaw: "5" }]), false);
assert.equal(matches([{ effect: "stat:extraAttackDelayPct", op: "lte", valueRaw: "-10" }]), true);
assert.equal(matches([{ effect: "conversion:magicToAttackPct", op: "eq", valueRaw: "10" }]), true);
assert.equal(matches([{ effect: "skillPlus", target: "戦闘技術", op: "gte", valueRaw: "20" }]), true);
assert.equal(matches([{ effect: "skillPlus", target: "物まね", op: "exists", valueRaw: "" }]), false);
assert.equal(matches([{ effect: "specialTarget", target: "悪魔", op: "gte", valueRaw: "1.2" }]), true);
assert.equal(matches([{ effect: "effectText", target: "モーション変化", op: "exists", valueRaw: "" }]), true);
assert.equal(matches([
  { effect: "stat:attackPct", op: "gte", valueRaw: "5" },
  { effect: "skillPlus", target: "戦闘技術", op: "gte", valueRaw: "20" },
  { effect: "effectText", target: "モーション変化", op: "exists", valueRaw: "" }
]), true, "multiple Buff effects use AND matching");

assert.equal(context.catalogItemMatches(noBuffItem, {
  query: "",
  category: "",
  slot: "",
  buffMode: "",
  statFilters: [],
  buffEffectFilters: [{ effect: "stat:attackPct", op: "exists", valueRaw: "" }]
}), false);

assert.match(
  context.catalogStatFiltersDescription({
    statFilters: [],
    buffEffectFilters: [{ effect: "skillPlus", target: "戦闘技術", op: "gte", valueRaw: "20" }]
  }),
  /スキル強化：戦闘技術 20以上/
);

const catalogTabSource = fs.readFileSync(path.join(root, "src/ui/catalogTab.js"), "utf8");
assert.match(catalogTabSource, /装備Buff効果フィルタ/);
assert.doesNotMatch(catalogTabSource, /スキル強化フィルタ/);
assert.doesNotMatch(catalogTabSource, /catalogSkillPlus/);

console.log("catalogBuffEffectFilter tests: OK");
