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
