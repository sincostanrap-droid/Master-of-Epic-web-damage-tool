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

// __MOE_DAMAGE_ON_HIT_RECOVERY_V1__
// 与ダメージ時の回復量。現行のダメージ計算・最適化はリソース回復量を評価しないため、
// 数値は詳細表示用に保持する。ゲーム内では最古の1件のみが有効になる。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-9475": {
    name: "小悪魔の力", officialTechnicId: 9475, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時MP回復", value: 3, unit: "%" }],
    memo: "与ダメージ時MPを3%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-11156": {
    name: "獅子奮迅", officialTechnicId: 11156, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時ST回復", value: 3, unit: "%" }],
    memo: "与ダメージ時STを3%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-7955": {
    name: "真祖", officialTechnicId: 7955, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時HP回復", value: 5, unit: "%" }],
    memo: "与ダメージ時HPを5%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-9321": {
    name: "天空竜の加護", officialTechnicId: 9321, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時HP回復", value: 5, unit: "%" }],
    memo: "実測優先: 与ダメージ時HPを5%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-8641": {
    name: "土偶の加護", officialTechnicId: 8641, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時MP回復", value: 3, unit: "%" }],
    memo: "与ダメージ時MPを3%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-12821": {
    name: "フラワー ブレッシング", officialTechnicId: 12821, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時MP回復", value: 3, unit: "%" }],
    memo: "与ダメージ時MPを3%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-10387": {
    name: "魔剣の加護", officialTechnicId: 10387, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時HP回復", value: 10, unit: "%" }],
    memo: "与ダメージ時HPを10%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-9888": {
    name: "魔性の力", officialTechnicId: 9888, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時ST回復", value: 3, unit: "%" }],
    memo: "与ダメージ時STを3%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-14069": {
    name: "真祖の吸血鬼", officialTechnicId: 14069, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時HP回復", value: 5, unit: "%" }],
    memo: "与ダメージ時HPを5%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  }
});

// __MOE_THREE_VERIFIED_EQUIPMENT_BUFFS_V1__

window.MOE_BUFF_RULES_MANUAL["technic-10685"] = {
  name: "狂戦士",
  officialTechnicId: 10685,
  verified: true,
  applyDefault: true,
  conflictGroup: "technic-10685",
  stackRule: "same-technic",
  stats: { attackPct: 5, hpRegenPerMinute: 78.125 },
  misc: { forcedEvasion: 0, forcedEvasionMode: "set" },
  effects: [
    { key: "attackPct", value: 5, unit: "%", source: "manual-verified" },
    { key: "evasionFixed", value: 0, unit: "", source: "manual-verified" }
  ],
  memo: "攻撃力+5%、HP自然回復78.125/分（15HP/11.52秒）。回避は0固定。WarAgeでは効果なし。"
};

// 自然回復の数値が明記されており、現行パッチ注記まで確認できるものだけを手入力する。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-12310": {
    name: "キャタピラー レッグ", officialTechnicId: 12310, verified: false, applyDefault: true,
    stats: { extraACPct: 5 },
    memo: "暫定: AC+5%。キックATK+10は現行計算対象外。"
  },
  "technic-9473": {
    name: "束縛の鎖", officialTechnicId: 9473, verified: false, applyDefault: true,
    stats: { attackPct: -5 },
    memo: "暫定: 攻撃力-5%。"
  },
  "technic-11384": {
    name: "フェンネの加護", officialTechnicId: 11384, verified: false, applyDefault: true,
    stats: { extraMPPct: 10 },
    memo: "暫定: 最大MP+10%。消費MP-10%は現行計算対象外。"
  },
  "technic-8264": {
    name: "フットワーク", officialTechnicId: 8264, verified: false, applyDefault: true,
    stats: { extraAvoidPct: 10 },
    memo: "暫定: 回避+10%。"
  },
  "technic-13128": {
    name: "フューチャー テクノロジー", officialTechnicId: 13128, verified: false, applyDefault: true,
    stats: { attackPct: 3, extraHitPct: 3, extraAvoidPct: 3, extraACPct: 3, extraFireResPct: 10, extraWaterResPct: 10, extraEarthResPct: 10, extraWindResPct: 10, extraNeutralResPct: 10 },
    memo: "暫定: 攻撃・命中・回避・防御+3%、全属性耐性+10%。"
  },
  "technic-8888": {
    name: "ラビットイヤー スピーカー", officialTechnicId: 8888, verified: false, applyDefault: true,
    stats: { extraAvoidPct: 3 },
    memo: "暫定: 回避+3%。AGI+3%は現行計算対象外。"
  },
  "technic-6672": {
    name: "龍神の加護", officialTechnicId: 6672, verified: false, applyDefault: true,
    stats: { extraACPct: 10, extraFireResPct: 10, extraWaterResPct: 10, extraEarthResPct: 10, extraWindResPct: 10, extraNeutralResPct: 10 },
    memo: "暫定: AC+10%、全属性耐性+10%。HP自然回復は既存補完で20/分。"
  },
  "technic-13681": {
    name: "王の器", officialTechnicId: 13681, verified: false, applyDefault: true,
    stats: { attackPct: 3, magicPct: 3, extraHitPct: 3, extraAvoidPct: 3, extraACPct: 3, extraFireResPct: 3, extraWaterResPct: 3, extraEarthResPct: 3, extraWindResPct: 3, extraNeutralResPct: 3 },
    memo: "暫定: 攻撃・魔力・命中・回避・防御・全属性耐性+3%。"
  },
  "technic-13717": {
    name: "ツヴァイフォーム", officialTechnicId: 13717, verified: true, applyDefault: true,
    stats: { stChangePerSecond: -0.34375, mpChangePerSecond: -0.34375 },
    memo: "現行注記（250729後）: HPスリップは削除済み。ST/MPは各20.625/分減少。"
  }
});

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

// __MOE_REVIEWED_EQUIPMENT_BUFFS_2026_07_21_V1__
// Wiki説明文とユーザー確認に基づく確定値。候補生成データより優先して適用する。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-13239": {
    name: "銃士の心得", officialTechnicId: 13239, verified: true, applyDefault: true,
    conflictGroup: "critical:B1", stackRule: "score",
    stats: { extraCritRatePct: 15, extraHitPct: 10 },
    memo: "クリティカル率+15%（B1枠）、命中+10%。"
  },
  "technic-9212": {
    name: "選ばれし者", officialTechnicId: 9212, verified: true, applyDefault: true,
    conflictGroup: "technic-9212", stackRule: "same-technic",
    stats: { attackPct: 3, magicPct: 3 },
    memo: "攻撃力・魔力+3%。"
  },
  "technic-9604": {
    name: "暗殺術", officialTechnicId: 9604, verified: true, applyDefault: true,
    conflictGroup: "critical:B2", stackRule: "score",
    stats: { extraHitPct: 10, extraCritRatePct: 15 },
    memo: "命中+10%、クリティカル率+15%。"
  },
  "technic-11967": {
    name: "魔弾の射手", officialTechnicId: 11967, verified: true, applyDefault: true,
    conflictGroup: "critical:A1", stackRule: "score",
    stats: { extraHitPct: 10, extraCritRatePct: 15 },
    memo: "命中+10%、クリティカル率+15%。"
  },
  "technic-14252": {
    name: "闘魂", officialTechnicId: 14252, verified: true, applyDefault: true,
    conflictGroup: "damage:physical:L", stackRule: "score",
    stats: { dmgPct: 10, extraHPPct: 10, stRegenPerMinute: 56.25 },
    memo: "物理与ダメージ+10%、最大HP+10%、ST自然回復56.25/分。"
  },
  "technic-11372": {
    name: "石魔の加護", officialTechnicId: 11372, verified: true, applyDefault: true,
    conflictGroup: "damage-cut:physical", stackRule: "score",
    stats: { magicPct: 3, extraDamageReducePct: 15 },
    memo: "魔力+3%、物理ダメージ15%軽減。"
  },
  "technic-7567": {
    name: "力士", officialTechnicId: 7567, verified: true, applyDefault: true,
    conflictGroup: "damage-cut:physical", stackRule: "score",
    stats: { attackPct: 3, extraDamageReducePct: 10 },
    memo: "攻撃力+3%、物理ダメージ10%軽減。"
  },
  "technic-14263": {
    name: "黄金の呪い", officialTechnicId: 14263, verified: true, applyDefault: true,
    conflictGroup: "damage:physical:K", stackRule: "score",
    stats: { attackPct: 3, dmgPct: 10, extraHPPct: -15 },
    memo: "攻撃力+3%、物理与ダメージ+10%、最大HP-15%。"
  },
  "technic-13486": {
    name: "剛剣の使い手", officialTechnicId: 13486, verified: true, applyDefault: true,
    conflictGroup: "damage:physical:G", stackRule: "score",
    stats: { dmgPct: 15, extraHitPct: -5, extraAvoidPct: -5 },
    memo: "物理与ダメージ+15%、命中・回避-5%。"
  },
  "technic-10974": {
    name: "レッドゾーン", officialTechnicId: 10974, verified: true, applyDefault: true,
    conflictGroup: "technic-10974", stackRule: "same-technic",
    stats: { speedPct: 5, extraHPPct: -5 },
    memo: "移動速度+5%、最大HP-5%。"
  },
  "technic-10511": {
    name: "溢れる妖気", officialTechnicId: 10511, verified: true, applyDefault: true,
    conflictGroup: "technic-10511", stackRule: "same-technic",
    stats: { attackPct: 3, mpChangePerSecond: -7.3 },
    memo: "攻撃力+3%、MP-7.3/秒。"
  },
  "technic-9710": {
    name: "桜花爛漫", officialTechnicId: 9710, verified: true, applyDefault: true,
    conflictGroup: "technic-9710", stackRule: "same-technic",
    stats: { extraAvoidPct: 5 },
    memo: "回避+5%。"
  },
  "technic-9392": {
    name: "閣下サポート", officialTechnicId: 9392, verified: true, applyDefault: true,
    conflictGroup: "technic-9392", stackRule: "same-technic",
    stats: { magicPct: 3, extraMPPct: 3 },
    memo: "魔力・最大MP+3%。"
  },
  "technic-9215": {
    name: "賢者の知識", officialTechnicId: 9215, verified: true, applyDefault: true,
    conflictGroup: "technic-9215", stackRule: "same-technic",
    stats: { extraMPPct: 10 },
    memo: "最大MP+10%。"
  },
  "technic-10214": {
    name: "神秘のリンゴ", officialTechnicId: 10214, verified: true, applyDefault: true,
    conflictGroup: "technic-10214", stackRule: "same-technic",
    stats: { extraHPPct: 3, hpRegenPerMinute: 75 },
    memo: "最大HP+3%、HP自然回復75/分。Scrapbox取得済み根拠行で確認。"
  },
  "technic-8753": {
    name: "熾天使の力", officialTechnicId: 8753, verified: true, applyDefault: true,
    conflictGroup: "technic-8753", stackRule: "same-technic",
    stats: { extraHPPct: 3, attackPct: 3 },
    memo: "最大HP・攻撃力+3%。"
  },
  "technic-9406": {
    name: "ハーフ＆ハーフ", officialTechnicId: 9406, verified: true, applyDefault: true,
    conflictGroup: "technic-9406", stackRule: "same-technic",
    stats: { attackPct: 3, magicPct: 3 },
    memo: "攻撃力・魔力+3%。"
  },
  "technic-8517": {
    name: "デビルヘアー", officialTechnicId: 8517, verified: true, applyDefault: true,
    conflictGroup: "technic-8517", stackRule: "same-technic",
    stats: { attackPct: 3, magicPct: 3, extraHPPct: -5 },
    memo: "攻撃力・魔力+3%、最大HP-5%。"
  },
  "technic-12131": {
    name: "焔の加護", officialTechnicId: 12131, verified: true, applyDefault: true,
    conflictGroup: "technic-12131", stackRule: "same-technic",
    stats: { extraHPPct: 10, attackPct: 3, extraFireResPct: 40 },
    memo: "最大HP+10%、攻撃力+3%、耐火属性+40%。"
  },
  "technic-13919": {
    name: "ゴースト ブラザーズ", officialTechnicId: 13919, verified: true, applyDefault: true,
    conflictGroup: "technic-13919", stackRule: "same-technic",
    stats: { extraHPPct: 5, extraSTPct: 5, extraMPPct: 5, attackPct: 3, speedPct: 3, magicPct: 3 },
    customEffects: [{ name: "確率魔法反射（確率未確定）", value: 0 }],
    memo: "HP/ST/MP+5%、攻撃力/移動速度/魔力+3%。魔法反射率は未確定。"
  },
  "technic-14147": {
    name: "チョコっとラブ", officialTechnicId: 14147, verified: true, applyDefault: true,
    conflictGroup: "damage:physical:J", stackRule: "score",
    stats: { extraHPPct: 3, dmgPct: 3 },
    customEffects: [{ name: "魔法与ダメージ", value: 3, unit: "%" }],
    memo: "最大HP+3%、物理・魔法与ダメージ+3%。"
  },
  "technic-13488": {
    name: "愚者のアルカナ", officialTechnicId: 13488, verified: true, applyDefault: true,
    conflictGroup: "technic-13488", stackRule: "same-technic",
    skillEffects: [{ name: "物まね", value: 20 }],
    customEffects: [{ name: "物まねディレイ", value: -20, unit: "%" }],
    memo: "物まねスキル+20、物まねディレイ-20%。"
  },
  "technic-14300": {
    name: "堕天使の魔眼", officialTechnicId: 14300, verified: true, applyDefault: true,
    conflictGroup: "technic-14300", stackRule: "same-technic",
    skillEffects: [{ name: "死の魔法", value: 20 }],
    customEffects: [{ name: "効果範囲", value: 1, unit: "" }, { name: "魔法射程", value: 0, unit: "（数値未検証）" }],
    memo: "死の魔法スキル+20、効果範囲+1.0。魔法射程の数値は未検証。"
  },
  "technic-4799": {
    name: "闇の鍵", officialTechnicId: 4799, verified: true, applyDefault: true,
    conflictGroup: "technic-4799", stackRule: "same-technic",
    stats: { extraMPPct: 5 },
    memo: "最大MP+5%。"
  },
  "technic-12773": {
    name: "マジック チャーム", officialTechnicId: 12773, verified: true, applyDefault: true,
    aliases: ["マジックチャーム"],
    conflictGroup: "technic-12773", stackRule: "same-technic",
    skillEffects: [
      { name: "破壊魔法", value: 5 }, { name: "強化魔法", value: 5 },
      { name: "神秘魔法", value: 5 }, { name: "回復魔法", value: 5 }
    ],
    memo: "破壊・強化・神秘・回復魔法スキル+5。空白なし表記は別名として正規化する。"
  },
  "technic-8838": {
    name: "強化アシスト機能", officialTechnicId: 8838, verified: true, applyDefault: true,
    conflictGroup: "technic-8838", stackRule: "same-technic",
    customEffects: [{ name: "共通攻撃ディレイ", value: -5, unit: "%" }, { name: "ジャンプ力", value: 1.45, unit: "倍" }, { name: "ST消費", value: -10, unit: "%" }],
    memo: "共通攻撃ディレイ-5%。通常攻撃ディレイ値とは別パラメータのため、現行予想値には加算しない。"
  },
  "technic-10040": {
    name: "剣闘士の魂", officialTechnicId: 10040, verified: true, applyDefault: true,
    conflictGroup: "attack-delay:normal-attack", stackRule: "latest",
    customEffects: [{ name: "通常攻撃ディレイ", value: -18, unit: "%" }, { name: "ST消費", value: -10, unit: "%" }],
    memo: "通常攻撃ディレイ-18%。通常攻撃ディレイ値とは別パラメータのため、現行予想値には加算しない。"
  },
  "technic-9117": {
    name: "騎士(ザ・ナイト)", officialTechnicId: 9117, verified: true, applyDefault: true,
    aliases: ["騎士（ザ・ナイト）"],
    conflictGroup: "attack-delay:normal-attack", stackRule: "latest",
    customEffects: [{ name: "通常攻撃ディレイ", value: -18, unit: "%" }],
    memo: "通常攻撃ディレイ-18%。通常攻撃ディレイ値とは別パラメータのため、現行予想値には加算しない。"
  },
  "technic-11837": {
    name: "御使い", officialTechnicId: 11837, verified: true, applyDefault: true,
    conflictGroup: "technic-11837", stackRule: "same-technic",
    customEffects: [{ name: "刀剣技ディレイ", value: -15, unit: "%" }, { name: "共通攻撃ディレイ", value: -5, unit: "%" }],
    memo: "刀剣技ディレイ-15%、共通攻撃ディレイ-5%。現行予想値には加算しない。"
  },
  "technic-9605": {
    name: "神速の剣技", officialTechnicId: 9605, verified: true, applyDefault: true,
    conflictGroup: "technic-9605", stackRule: "same-technic",
    customEffects: [{ name: "刀剣技ディレイ", value: -15, unit: "%" }],
    memo: "刀剣技ディレイ-15%。現行予想値には加算しない。"
  },
  "technic-8693": {
    name: "免許皆伝", officialTechnicId: 8693, verified: true, applyDefault: true,
    conflictGroup: "technic-8693", stackRule: "same-technic",
    customEffects: [{ name: "刀剣技ディレイ", value: -15, unit: "%" }, { name: "攻撃・待機・移動モーション変化", value: 0 }],
    memo: "刀剣技ディレイ-15%。攻撃・待機・移動モーションが変化する。現行予想値には加算しない。"
  },
  "technic-9597": {
    name: "弓の名手", officialTechnicId: 9597, verified: true, applyDefault: true,
    conflictGroup: "technic-9597", stackRule: "same-technic",
    customEffects: [{ name: "弓技ディレイ", value: -15, unit: "%" }],
    memo: "弓技ディレイ-15%。現行予想値には加算しない。"
  },
  "technic-12613": {
    name: "疾風奮迅", officialTechnicId: 12613, verified: true, applyDefault: true,
    conflictGroup: "conversion:attack:C", stackRule: "score",
    conversions: { speedToAttackPct: 10 },
    memo: "移動速度の10%を攻撃力へ変換。攻撃力変換C枠。"
  },
  "technic-12004": {
    name: "双魔剣", officialTechnicId: 12004, verified: true, applyDefault: true,
    conflictGroup: "conversion:attack:dual-magic-sword", stackRule: "score",
    conversions: { magicToAttackPct: 5 },
    customEffects: [{ name: "専用技", value: 0, unit: "（双魔連斬）" }],
    memo: "魔力の5%を攻撃力へ変換。独立した攻撃力変換枠。"
  },
  "technic-11265": {
    name: "魔法剣", officialTechnicId: 11265, verified: true, applyDefault: true,
    conflictGroup: "conversion:attack:magic-sword", stackRule: "score",
    conversions: { magicToAttackPct: 30 },
    memo: "魔力の30%を攻撃力へ変換。独立した攻撃力変換枠。WarAgeでは効果なし。"
  },
  "technic-13132": {
    name: "エイシスの青い天使さん", officialTechnicId: 13132, verified: true, applyDefault: true,
    conflictGroup: "conversion:attack:eisis-blue-angel", stackRule: "score",
    conversions: { magicToAttackPct: 30 },
    memo: "魔力の30%を攻撃力へ変換。独立した攻撃力変換枠。鳥系特攻は別途の特攻最新1件ルールに従うため、この変換ルールには混在させない。"
  },
  "technic-8259": {
    name: "鬼神の力", officialTechnicId: 8259, verified: true, applyDefault: true,
    conflictGroup: "special:latest", stackRule: "latest",
    misc: { targetRace: "giant", targetMultiplier: 1.2 },
    memo: "巨人系への特攻1.2倍（暫定）。特攻系は種別を問わず最新1件のみ。"
  },
  "technic-14141": {
    name: "退魔の力", officialTechnicId: 14141, verified: true, applyDefault: true,
    conflictGroup: "special:latest", stackRule: "latest",
    stats: { magicPct: 3 },
    misc: { targetRace: "devil", targetMultiplier: 1.2 },
    memo: "魔力+3%、悪魔系への特攻1.2倍（暫定）。特攻系は種別を問わず最新1件のみ。"
  },
  "technic-6394": {
    name: "キャンプ", officialTechnicId: 6394, verified: true, applyDefault: true,
    conflictGroup: "technic-6394", stackRule: "same-technic",
    stats: { hpRegenPerMinute: 112, stRegenPerMinute: 112, mpRegenPerMinute: 112 },
    customEffects: [{ name: "移動行動不可", value: 0 }],
    memo: "HP・ST・MP自然回復 各112/分。移動行動不可。プライベート テント由来。"
  }
});
