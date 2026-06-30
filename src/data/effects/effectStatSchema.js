// Canonical effect/stat schema used by the generic MoE effect resolver.
export const EFFECT_STAT_SCHEMA = {
  "hp": {
    "label": "最大HP",
    "category": "survival"
  },
  "mp": {
    "label": "最大MP",
    "category": "magic"
  },
  "st": {
    "label": "最大ST",
    "category": "survival"
  },
  "weight": {
    "label": "最大重量",
    "category": "utility"
  },
  "attack": {
    "label": "攻撃力",
    "category": "physical"
  },
  "hit": {
    "label": "命中",
    "category": "physical"
  },
  "attackDelay": {
    "label": "攻撃ディレイ",
    "category": "physical"
  },
  "critRate": {
    "label": "クリティカル率",
    "category": "physical"
  },
  "critDamage": {
    "label": "クリティカルダメージ",
    "category": "physical"
  },
  "ac": {
    "label": "防御力",
    "category": "survival"
  },
  "avoid": {
    "label": "回避",
    "category": "survival"
  },
  "magic": {
    "label": "魔力",
    "category": "magic"
  },
  "castSpeed": {
    "label": "詠唱速度",
    "category": "magic"
  },
  "magicDelay": {
    "label": "魔法ディレイ",
    "category": "magic"
  },
  "skillEffect": {
    "label": "スキル効果上昇",
    "category": "generic"
  },
  "speed": {
    "label": "移動速度",
    "category": "utility"
  },
  "resistFire": {
    "label": "耐火属性",
    "category": "resist"
  },
  "resistWater": {
    "label": "耐水属性",
    "category": "resist"
  },
  "resistWind": {
    "label": "耐風属性",
    "category": "resist"
  },
  "resistEarth": {
    "label": "耐地属性",
    "category": "resist"
  },
  "resistMagic": {
    "label": "耐無属性",
    "category": "resist"
  },
  "regenHp": {
    "label": "HP自然回復",
    "category": "regen"
  },
  "regenMp": {
    "label": "MP自然回復",
    "category": "regen"
  },
  "regenSt": {
    "label": "ST自然回復",
    "category": "regen"
  },
  "additionalDamage": {
    "label": "追加ダメージ",
    "category": "special"
  },
  "damageTaken": {
    "label": "被ダメージ補正",
    "category": "special"
  },
  "mpCost": {
    "label": "MP消費",
    "category": "magic"
  },
  "stCost": {
    "label": "ST消費",
    "category": "physical"
  },
  "conversion": {
    "label": "ステータス変換",
    "category": "special"
  }
};
