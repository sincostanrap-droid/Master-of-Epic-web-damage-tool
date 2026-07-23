const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

{
  const context = {
    window: {
      MOE_BUFF_RULES_MANUAL: {
        "technic-1": { name: "手動ルール", officialTechnicId: 1 }
      },
      MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED: [
        { catalogId: "technic-1", name: "生成側重複", officialTechnicId: 1 },
        { catalogId: "technic-2", name: "生成ルール", officialTechnicId: 2 }
      ]
    }
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(root, "src/domain/catalogData.js"), "utf8"),
    context
  );

  const first = vm.runInContext("equipBuffRuleCandidateItems()", context);
  const second = vm.runInContext("equipBuffRuleCandidateItems()", context);
  assert.equal(first, second, "unchanged sources reuse the candidate array");
  assert.equal(first.length, 2);
  assert.equal(first[0].name, "手動ルール", "manual priority remains unchanged");

  context.window.MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED = [
    ...context.window.MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED,
    { catalogId: "technic-3", name: "追加ルール", officialTechnicId: 3 }
  ];
  const refreshed = vm.runInContext("equipBuffRuleCandidateItems()", context);
  assert.notEqual(refreshed, first, "replaced source invalidates the cache");
  assert.equal(refreshed.length, 3);
}

{
  const source = fs.readFileSync(path.join(root, "src/main.js"), "utf8");
  const start = source.indexOf("function equipBuffRuleKeyCandidates(");
  const end = source.indexOf("/* 生成候補には", start);
  assert.ok(start >= 0 && end > start, "lookup source block");

  const rules = [
    { catalogId: "technic-1", name: "手動ルール", officialTechnicId: 1 },
    { catalogId: "technic-2", name: "別名ルール", wikiName: "Wiki別名", officialTechnicId: 2 },
    { catalogId: "technic-3", name: "手動ルール", officialTechnicId: 3 }
  ];
  const context = {
    catalogNorm(value) {
      return String(value || "").replace(/[　\s]+/g, "").toLowerCase();
    },
    equipBuffRuleCandidateItems() {
      return rules;
    }
  };
  vm.createContext(context);
  vm.runInContext(
    `${source.slice(start, end)}
     globalThis.__find = findEquipBuffRuleCandidate;
     globalThis.__index = equipBuffRuleCandidateIndex;`,
    context
  );

  assert.equal(context.__find({ officialTechnicId: 1 }), rules[0]);
  assert.equal(context.__find({ name: "Wiki別名" }), rules[1]);
  assert.equal(
    context.__find({ catalogId: "technic-3", name: "手動ルール" }),
    rules[0],
    "the first rule still wins when different lookup keys match different rules"
  );
  assert.equal(context.__index(rules), context.__index(rules), "lookup index is reused");
}

console.log("equipmentBuffLookupCache tests: OK");
