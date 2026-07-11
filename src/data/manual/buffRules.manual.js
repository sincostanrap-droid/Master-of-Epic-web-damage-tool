// 手入力で確定した装備Buff効果ルールを置くためのファイルです。
// 公式DBやWiki由来の generated ファイルは再生成で上書きされるため、
// 検証済みの効果量・競合グループ・上書きルールはこの manual 側に追記します。
//
// 形式例:
// window.MOE_BUFF_RULES_MANUAL = {
//   "technic-12345": {
//     verified: true,
//     conflictGroup: "attack-delay-buff",
//     stats: { equipBuffExtraAttackDelay: -5 },
//     effects: [{ key: "attackDelayFlat", value: -5, unit: "", source: "manual" }],
//     memo: "検証済み"
//   }
// };
window.MOE_BUFF_RULES_MANUAL = window.MOE_BUFF_RULES_MANUAL || {};

// __MOE_THREE_VERIFIED_EQUIPMENT_BUFFS_V1__

window.MOE_BUFF_RULES_MANUAL["technic-10685"] = {
  name: "狂戦士",
  officialTechnicId: 10685,
  verified: true,
  applyDefault: true,
  conflictGroup: "technic-10685",
  stackRule: "same-technic",
  stats: { attackPct: 5 },
  misc: { forcedEvasion: 0, forcedEvasionMode: "set" },
  effects: [
    { key: "attackPct", value: 5, unit: "%", source: "manual-verified" },
    { key: "evasionFixed", value: 0, unit: "", source: "manual-verified" }
  ],
  memo: "攻撃力+5%。回避は0固定。WarAgeでは効果なし。"
};

window.MOE_BUFF_RULES_MANUAL["technic-12614"] = {
  name: "復讐姫",
  officialTechnicId: 12614,
  verified: true,
  applyDefault: true,
  conflictGroup: "technic-12614",
  stackRule: "same-technic",
  stats: { attackPct: 5 },
  misc: {
    targetDamageEffects: "dragon:1.5",
    targetRace: "dragon",
    targetMultiplier: 1.5
  },
  effects: [
    { key: "attackPct", value: 5, unit: "%", source: "manual-verified" },
    { key: "targetDamageMultiplier", target: "dragon", value: 1.5, unit: "x", source: "manual-verified" }
  ],
  memo: "攻撃力+5%。ドラゴン系への与ダメージ1.5倍。WarAgeでは効果なし。"
};

// __MOE_ROSE_RADIANCE_STAT_KEYS_FIX_V1__
window.MOE_BUFF_RULES_MANUAL["technic-14427"] = {
  name: "薔薇の輝き",
  officialTechnicId: 14427,
  verified: true,
  applyDefault: true,
  conflictGroup: "critical:L",
  stackRule: "score",
  stats: {
    dmgPct: 10,
    extraCritRatePct: 15
  },
  effects: [
    { key: "physicalDamagePct", value: 10, unit: "%", source: "manual-verified" },
    { key: "criticalRatePct", value: 15, unit: "%", source: "manual-verified" }
  ],
  memo: "物理与ダメージ+10%、メイン攻撃クリティカル率+15%。競合なし。独立枠 critical:L。WarAgeでは効果なし。"
};
