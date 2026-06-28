/*
  skillSimKnowledge.js

  スキルシミュレータ用のマスタリー / テクニック / 魔法データです。
  v1.20では表示基盤のためのサンプルデータを同梱しています。
  実データは今後このファイルへ追加していきます。

  注意:
  - 外部サイトのデータやコードをそのまま転載しない方針です。
  - 条件や成功率式が未検証のものは note / estimate に明記します。
*/
(function(){
  "use strict";

  const masteries = [
    {
      id: "sample-samurai",
      name: "サムライ",
      category: "複合シップ / 近接",
      requirements: [
        {skill:"刀剣", min:90},
        {skill:"戦闘技術", min:90}
      ],
      note: "サンプル。正式条件はデータ追加時に要確認。"
    },
    {
      id: "sample-hero",
      name: "ヒーロー",
      category: "複合シップ / 近接",
      requirements: [
        {skill:"筋力", min:90},
        {skill:"生命力", min:90},
        {skill:"着こなし", min:90}
      ],
      note: "サンプル。正式条件はデータ追加時に要確認。"
    },
    {
      id: "sample-archmage",
      name: "アークメイジ",
      category: "複合シップ / 魔法",
      requirements: [
        {skill:"破壊魔法", min:90},
        {skill:"回復魔法", min:90},
        {skill:"強化魔法", min:90},
        {skill:"神秘魔法", min:90}
      ],
      note: "サンプル。正式条件はデータ追加時に要確認。"
    }
  ];

  const techniques = [
    {
      id: "tech-kicker",
      name: "サイド キック",
      category: "キック",
      kind: "テクニック",
      requirements: [{skill:"キック", min:20}],
      successSkill: "キック",
      successRequired: 20,
      note: "サンプル。"
    },
    {
      id: "tech-shield-guard",
      name: "シールド ガード",
      category: "盾",
      kind: "テクニック",
      requirements: [{skill:"盾", min:10}],
      successSkill: "盾",
      successRequired: 10,
      note: "サンプル。"
    },
    {
      id: "tech-berserk",
      name: "バーサーク",
      category: "戦闘技術",
      kind: "テクニック",
      requirements: [{skill:"戦闘技術", min:40}],
      successSkill: "戦闘技術",
      successRequired: 40,
      note: "サンプル。"
    },
    {
      id: "tech-cannon",
      name: "キャノン ディスチャージ",
      category: "銃器",
      kind: "テクニック",
      requirements: [{skill:"銃器", min:90}],
      successSkill: "銃器",
      successRequired: 90,
      note: "サンプル。"
    }
  ];

  const magic = [
    {
      id: "magic-minor-burst",
      name: "マイナー バースト",
      category: "破壊魔法",
      kind: "魔法",
      requirements: [{skill:"破壊魔法", min:1}],
      successSkill: "破壊魔法",
      successRequired: 1,
      mp: 5,
      reagent: "ノア ダスト",
      note: "サンプル。"
    },
    {
      id: "magic-healing",
      name: "ヒーリング",
      category: "回復魔法",
      kind: "魔法",
      requirements: [{skill:"回復魔法", min:10}],
      successSkill: "回復魔法",
      successRequired: 10,
      mp: 9,
      reagent: "ノア ダスト",
      note: "サンプル。"
    },
    {
      id: "magic-buff",
      name: "エンライテン",
      category: "強化魔法",
      kind: "魔法",
      requirements: [{skill:"強化魔法", min:20}],
      successSkill: "強化魔法",
      successRequired: 20,
      mp: 11,
      reagent: "ノア ダスト",
      note: "サンプル。"
    },
    {
      id: "magic-mesmerize",
      name: "メスメライズ",
      category: "神秘魔法",
      kind: "魔法",
      requirements: [{skill:"神秘魔法", min:40}],
      successSkill: "神秘魔法",
      successRequired: 40,
      mp: 23,
      reagent: "ノア パウダー",
      note: "サンプル。"
    }
  ];

  window.MOE_SKILL_SIM_KNOWLEDGE = {masteries, techniques, magic};
})();
