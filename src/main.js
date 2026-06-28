/*
  Master of Epic 物理ダメージ計算webツール
  Split version: main application script.
  まずは単一HTMLからCSS/JSを分離した安全版です。
  onclick属性から呼ばれる関数があるため、現時点では module ではなく通常scriptとして読み込みます。
*/

/* 種族係数。攻撃力係数と魔力係数は別管理。 */
const RACE_COEFFS = {
  newtar: 0.20,
  cognite: 0.19,
  elmony: 0.19,
  pandemos: 0.21
};

const RACE_MAGIC_COEFFS = {
  newtar: 1.00,
  cognite: 1.10,
  elmony: 0.95,
  pandemos: 0.90
};

const RACE_LABELS = {
  newtar: "ニューター",
  cognite: "コグニート",
  elmony: "エルモニー",
  pandemos: "パンデモス"
};

/* 装備欄は固定スロット制。空欄/0なら実質未装備として扱う。 */
const EQUIPMENT_SLOTS = [
  {slot: "武器: 右手"},
  {slot: "武器: 左手"},
  {slot: "武器: 弾丸"},
  {slot: "防具: 頭"},
  {slot: "防具: 胴"},
  {slot: "防具: 手"},
  {slot: "防具: パンツ"},
  {slot: "防具: 靴"},
  {slot: "防具: 肩"},
  {slot: "防具: 腰"},
  {slot: "装飾: 頭"},
  {slot: "装飾: 顔"},
  {slot: "装飾: 耳"},
  {slot: "装飾: 指"},
  {slot: "装飾: 胸"},
  {slot: "装飾: 背中"},
  {slot: "装飾: 腰"}
];

/**
 * 装備固定行の初期データを作る。
 * 防具/装飾/武器の行数を常に一定にして、保存データの欠けや旧形式を吸収しやすくする。
 */

const BASE_EXTRA_STAT_DEFS = [
  {prop:"attack", equipProp:"equipBuffFlatAttack", label:"攻撃力", step:"0.1"},
  {prop:"magic", equipProp:"equipBuffFlatMagic", label:"魔力", step:"0.1"},
  {prop:"speed", equipProp:"equipBuffFlatSpeed", label:"速度", step:"0.1"},
  {prop:"extraAC", equipProp:"equipBuffExtraAC", label:"AC", step:"0.1"},
  {prop:"extraHP", equipProp:"equipBuffExtraHP", label:"HP", step:"1"},
  {prop:"extraMP", equipProp:"equipBuffExtraMP", label:"MP", step:"1"},
  {prop:"extraST", equipProp:"equipBuffExtraST", label:"ST", step:"1"},
  {prop:"extraMaxWeight", equipProp:"equipBuffExtraMaxWeight", label:"最大重量", step:"0.1"},
  {prop:"extraHit", equipProp:"equipBuffExtraHit", label:"命中", step:"0.1"},
  {prop:"extraAvoid", equipProp:"equipBuffExtraAvoid", label:"回避", step:"0.1"},
  {prop:"extraAttackDelay", equipProp:"equipBuffExtraAttackDelay", label:"攻撃ディレイ", step:"0.1"},
  {prop:"extraMagicDelay", equipProp:"equipBuffExtraMagicDelay", label:"魔法ディレイ", step:"0.1"},
  {prop:"extraFireRes", equipProp:"equipBuffExtraFireRes", label:"火耐性", step:"0.1"},
  {prop:"extraWaterRes", equipProp:"equipBuffExtraWaterRes", label:"水耐性", step:"0.1"},
  {prop:"extraEarthRes", equipProp:"equipBuffExtraEarthRes", label:"地耐性", step:"0.1"},
  {prop:"extraWindRes", equipProp:"equipBuffExtraWindRes", label:"風耐性", step:"0.1"},
  {prop:"extraNeutralRes", equipProp:"equipBuffExtraNeutralRes", label:"無耐性", step:"0.1"}
];

const BUFF_FLAT_EXTRA_STAT_DEFS = [
  {prop:"extraAC", equipProp:"equipBuffExtraAC", label:"AC", step:"0.1"},
  {prop:"extraHP", equipProp:"equipBuffExtraHP", label:"HP", step:"1"},
  {prop:"extraMP", equipProp:"equipBuffExtraMP", label:"MP", step:"1"},
  {prop:"extraST", equipProp:"equipBuffExtraST", label:"ST", step:"1"},
  {prop:"extraMaxWeight", equipProp:"equipBuffExtraMaxWeight", label:"最大重量", step:"0.1"},
  {prop:"extraHit", equipProp:"equipBuffExtraHit", label:"命中", step:"0.1"},
  {prop:"extraAvoid", equipProp:"equipBuffExtraAvoid", label:"回避", step:"0.1"},
  {prop:"extraMagicDelay", equipProp:"equipBuffExtraMagicDelay", label:"魔法ディレイ", step:"0.1"},
  {prop:"extraFireRes", equipProp:"equipBuffExtraFireRes", label:"火耐性", step:"0.1"},
  {prop:"extraWaterRes", equipProp:"equipBuffExtraWaterRes", label:"水耐性", step:"0.1"},
  {prop:"extraEarthRes", equipProp:"equipBuffExtraEarthRes", label:"地耐性", step:"0.1"},
  {prop:"extraWindRes", equipProp:"equipBuffExtraWindRes", label:"風耐性", step:"0.1"},
  {prop:"extraNeutralRes", equipProp:"equipBuffExtraNeutralRes", label:"無耐性", step:"0.1"}
];

const BUFF_PCT_EXTRA_STAT_DEFS = [
  {prop:"extraACPct", equipProp:"equipBuffExtraACPct", label:"AC%", step:"0.1"},
  {prop:"extraHPPct", equipProp:"equipBuffExtraHPPct", label:"HP%", step:"0.1"},
  {prop:"extraMPPct", equipProp:"equipBuffExtraMPPct", label:"MP%", step:"0.1"},
  {prop:"extraSTPct", equipProp:"equipBuffExtraSTPct", label:"ST%", step:"0.1"},
  {prop:"extraMaxWeightPct", equipProp:"equipBuffExtraMaxWeightPct", label:"最大重量%", step:"0.1"},
  {prop:"extraHitPct", equipProp:"equipBuffExtraHitPct", label:"命中%", step:"0.1"},
  {prop:"extraAvoidPct", equipProp:"equipBuffExtraAvoidPct", label:"回避%", step:"0.1"},
  {prop:"extraAttackDelayPct", equipProp:"equipBuffExtraAttackDelayPct", label:"攻撃ディレイ%", step:"0.1"},
  {prop:"extraMagicDelayPct", equipProp:"equipBuffExtraMagicDelayPct", label:"魔法ディレイ%", step:"0.1"},
  {prop:"extraFireResPct", equipProp:"equipBuffExtraFireResPct", label:"火耐性%", step:"0.1"},
  {prop:"extraWaterResPct", equipProp:"equipBuffExtraWaterResPct", label:"水耐性%", step:"0.1"},
  {prop:"extraEarthResPct", equipProp:"equipBuffExtraEarthResPct", label:"地耐性%", step:"0.1"},
  {prop:"extraWindResPct", equipProp:"equipBuffExtraWindResPct", label:"風耐性%", step:"0.1"},
  {prop:"extraNeutralResPct", equipProp:"equipBuffExtraNeutralResPct", label:"無耐性%", step:"0.1"}
];

const BUFF_ONLY_EXTRA_STAT_DEFS = [
  {prop:"extraDamageReducePct", equipProp:"equipBuffExtraDamageReducePct", label:"被ダメ軽減%", step:"0.1"},
  {prop:"extraCritRatePct", equipProp:"equipBuffExtraCritRatePct", label:"クリ率%", step:"0.1"}
];

function normalizeExtraMode(mode) {
  if (mode === true) return "equipBuff";
  if (mode === false || mode === undefined || mode === null) return "base";
  return mode;
}

function uniqueDefs(defs) {
  const seen = new Set();
  return defs.filter(d => {
    if (seen.has(d.prop)) return false;
    seen.add(d.prop);
    return true;
  });
}

function extraFieldDefsFor(mode="base") {
  mode = normalizeExtraMode(mode);
  if (mode === "base") return BASE_EXTRA_STAT_DEFS;
  if (mode === "buff" || mode === "equipBuff") return BUFF_FLAT_EXTRA_STAT_DEFS.concat(BUFF_PCT_EXTRA_STAT_DEFS, BUFF_ONLY_EXTRA_STAT_DEFS);
  if (mode === "summary") return uniqueDefs(BASE_EXTRA_STAT_DEFS.concat(BUFF_FLAT_EXTRA_STAT_DEFS, BUFF_PCT_EXTRA_STAT_DEFS, BUFF_ONLY_EXTRA_STAT_DEFS));
  return BASE_EXTRA_STAT_DEFS;
}

function extraPropFor(def, mode) {
  return normalizeExtraMode(mode) === "equipBuff" ? def.equipProp : def.prop;
}

function extraDefaultFields(mode="base") {
  const out = {};
  extraFieldDefsFor(mode).forEach(d => out[extraPropFor(d, mode)] = 0);
  return out;
}

function emptyExtraStats() {
  const out = {};
  extraFieldDefsFor("summary").forEach(d => out[d.prop] = 0);
  return out;
}

function extraStatsHasEffect(row, mode="base") {
  mode = normalizeExtraMode(mode);
  return extraFieldDefsFor(mode).some(d => +(row?.[extraPropFor(d, mode)] || 0));
}

function extraStatsEffectText(row, mode="base") {
  mode = normalizeExtraMode(mode);
  const parts = [];
  extraFieldDefsFor(mode).forEach(d => {
    const v = +(row?.[extraPropFor(d, mode)] || 0);
    if (v) parts.push(`${d.label}${v > 0 ? "+" : ""}${v}`);
  });
  return parts.join(" / ");
}

function addExtraStatsInto(acc, row, mode="base") {
  mode = normalizeExtraMode(mode);
  extraFieldDefsFor(mode).forEach(d => {
    acc[d.prop] = (acc[d.prop] || 0) + (+(row?.[extraPropFor(d, mode)] || 0));
  });
  return acc;
}

function normalizeExtraStatsOnRow(out, source) {
  ["base", "buff", "equipBuff"].forEach(mode => {
    extraFieldDefsFor(mode).forEach(d => {
      const prop = extraPropFor(d, mode);
      out[prop] = +(source?.[prop] || 0);
    });
  });
  return out;
}

function extraStatsSummary(extra) {
  const parts = [];
  extraFieldDefsFor("summary").forEach(d => {
    const v = +(extra?.[d.prop] || 0);
    if (v) parts.push(`${d.label} ${v > 0 ? "+" : ""}${fmt(v, 2)}`);
  });
  return parts;
}


const QUICK_EFFECT_DEFS = [
  {key:"attackFlat", label:"攻撃力+", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"], category:"基本ステータス"},
  {key:"magicFlat", label:"魔力+", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"], category:"基本ステータス"},
  {key:"speedFlat", label:"速度+", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"], category:"基本ステータス"},

  {key:"attackPct", category:"%ステータス", label:"攻撃力%", valueLabel:"%", unit:"%", scopes:["equipBuff","buff"]},
  {key:"magicPct", category:"%ステータス", label:"魔力%", valueLabel:"%", unit:"%", scopes:["equipBuff","buff"]},
  {key:"speedPct", category:"%ステータス", label:"速度%", valueLabel:"%", unit:"%", scopes:["equipBuff","buff"]},

  {key:"flatHP", category:"追加ステータス", label:"HP+", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"]},
  {key:"flatMP", category:"追加ステータス", label:"MP+", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"]},
  {key:"flatST", category:"追加ステータス", label:"ST+", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"]},
  {key:"flatAC", category:"追加ステータス", label:"AC+", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"]},
  {key:"flatMaxWeight", category:"追加ステータス", label:"最大重量+", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"]},
  {key:"hitFlat", category:"追加ステータス", label:"命中+", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"]},
  {key:"avoidFlat", category:"追加ステータス", label:"回避+", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"]},

  {key:"maxWeightPct", category:"追加ステータス%", label:"最大重量%", valueLabel:"%", unit:"%", scopes:["equipBuff","buff"]},
  {key:"critRatePct", category:"追加ステータス%", label:"クリ率%", valueLabel:"%", unit:"%", scopes:["equipBuff","buff"]},

  {key:"convMagicRate", category:"ダメージ系", label:"魔力→攻撃力%", valueLabel:"%", unit:"%", scopes:["equipBuff","buff"]},
  {key:"convSpeedRate", category:"ダメージ系", label:"速度→攻撃力%", valueLabel:"%", unit:"%", scopes:["equipBuff","buff"]},
  {key:"dmgPct", category:"ダメージ系", label:"与ダメ%", valueLabel:"%", unit:"%", scopes:["equipBuff","buff"]},
  {key:"specialMultiplier", category:"ダメージ系", label:"特攻倍率", valueLabel:"倍率", unit:"倍", scopes:["equipBuff","buff"]},

  {key:"skillPlus", category:"表示・連携用", label:"スキル+", valueLabel:"値", unit:"", scopes:["equipBuff","buff"], targetKind:"skill"},
  {key:"elementDamagePct", category:"表示・連携用", label:"属性ダメージ%", valueLabel:"%", unit:"%", scopes:["equipBuff","buff"], targetKind:"element"},
  {key:"custom", category:"表示・連携用", label:"その他効果", valueLabel:"値", unit:"", scopes:["base","equipBuff","buff"], targetKind:"text", placeholder:"効果名"}
];

const QUICK_EFFECT_SCOPE_LABELS = {
  base: "装備本体",
  equipBuff: "装備Buff",
  buff: "Buff"
};

const ELEMENT_DAMAGE_OPTIONS = ["火属性", "水属性", "地属性", "風属性", "無属性"];

function quickEffectDef(key) {
  return QUICK_EFFECT_DEFS.find(d => d.key === key) || QUICK_EFFECT_DEFS[0];
}

function quickEffectScopeFor(context, selectedScope=null) {
  if (context === "equipment") return selectedScope || "base";
  return "buff";
}

function quickEffectDefsFor(context, selectedScope=null) {
  const scope = quickEffectScopeFor(context, selectedScope);
  return QUICK_EFFECT_DEFS.filter(d => (d.scopes || []).includes(scope));
}

function quickEffectOptionsHtml(context, selectedScope=null) {
  const groups = new Map();
  quickEffectDefsFor(context, selectedScope).forEach(d => {
    const category = d.category || "その他";
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(d);
  });
  return Array.from(groups.entries()).map(([category, defs]) => {
    const options = defs.map(d => `<option value="${escapeHtml(d.key)}">${escapeHtml(d.label)}</option>`).join("");
    return `<optgroup label="${escapeHtml(category)}">${options}</optgroup>`;
  }).join("");
}

function quickEffectAppliedMessage(context, scope, key, value, targetName="") {
  const def = quickEffectDef(key);
  const v = fmt(+value || 0, 2);
  const target = targetName ? `${targetName} ` : "";
  if (["skillPlus", "elementDamagePct", "custom"].includes(key)) {
    return `表示用の追加効果へ保存: ${target}${def.label} ${v}${def.unit || ""}`;
  }
  const where = context === "equipment"
    ? (scope === "base" ? "装備本体の追加ステータス" : "装備Buff")
    : "このBuff行";
  return `${where}へ反映: ${target}${def.label} ${v}${def.unit || ""}`;
}

function normalizeAdditionalEffects(effects) {
  if (!Array.isArray(effects)) return [];
  return effects.map(e => ({
    key: e?.key || "custom",
    name: String(e?.name || ""),
    value: +(e?.value || 0),
    unit: e?.unit || quickEffectDef(e?.key || "custom").unit || "",
    scope: e?.scope || "display",
    note: e?.note || ""
  })).filter(e => e.name || e.value || e.key !== "custom");
}

function additionalEffectLabel(effect) {
  const def = quickEffectDef(effect?.key || "custom");
  const name = effect?.name ? `${effect.name} ` : "";
  const value = +(effect?.value || 0);
  const sign = value > 0 && !String(def.label).includes("%") && !String(def.label).includes("倍率") ? "+" : "";
  if (effect?.key === "skillPlus") return `${name}スキル${sign}${fmt(value, 2)}`;
  if (effect?.key === "elementDamagePct") return `${name}ダメージ${value > 0 ? "+" : ""}${fmt(value, 2)}%`;
  if (effect?.key === "custom") return `${name || "追加効果"}${value ? ` ${value > 0 ? "+" : ""}${fmt(value, 2)}${effect?.unit || ""}` : ""}`;
  return `${name}${def.label}${value > 0 ? "+" : ""}${fmt(value, 2)}${def.unit && !String(def.label).includes(def.unit) ? def.unit : ""}`;
}

function additionalEffectsSummary(row, scope=null) {
  const effects = normalizeAdditionalEffects(row?.extraEffects);
  return effects
    .filter(e => !scope || e.scope === scope || e.scope === "display")
    .map(additionalEffectLabel);
}

function serializeAdditionalEffectsText(effects) {
  return normalizeAdditionalEffects(effects)
    .map(e => [e.key, e.name, e.value, e.unit, e.scope, e.note].map(v => String(v ?? "").replace(/[|;\\]/g, m => "\\" + m)).join("|"))
    .join("; ");
}

function splitEscapedList(text, sep) {
  const out = [];
  let cur = "";
  let esc = false;
  String(text || "").split("").forEach(ch => {
    if (esc) {
      cur += ch;
      esc = false;
    } else if (ch === "\\") {
      esc = true;
    } else if (ch === sep) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  });
  out.push(cur);
  return out;
}

function parseAdditionalEffectsText(text) {
  const s = String(text || "").trim();
  if (!s) return [];
  if (s.startsWith("[") || s.startsWith("{")) {
    try {
      const parsed = JSON.parse(s);
      return normalizeAdditionalEffects(Array.isArray(parsed) ? parsed : parsed.effects);
    } catch {}
  }
  return splitEscapedList(s, ";").map(part => {
    const cells = splitEscapedList(part.trim(), "|");
    if (cells.length >= 3) {
      return {
        key: cells[0] || "custom",
        name: cells[1] || "",
        value: parseFloat(cells[2]) || 0,
        unit: cells[3] || "",
        scope: cells[4] || "display",
        note: cells[5] || ""
      };
    }
    const m = part.trim().match(/^(.+?)([+-]?\d+(?:\.\d+)?)(%|倍)?$/);
    return {key:"custom", name:m ? m[1].trim() : part.trim(), value:m ? +(m[2] || 0) : 0, unit:m?.[3] || "", scope:"display"};
  }).filter(e => e.name || e.value);
}

function pushDisplayEffect(row, key, value, name="", unit="", scope="display", note="") {
  row.extraEffects = normalizeAdditionalEffects(row.extraEffects);
  row.extraEffects.push({key, name, value:+value || 0, unit: unit || quickEffectDef(key).unit || "", scope, note});
}

function quickEffectTargetName(def, targetValue) {
  if (def.targetKind === "element") return targetValue || "火属性";
  if (def.targetKind === "skill") return targetValue || (SKILL_SIM_ALL && SKILL_SIM_ALL[0]) || "筋力";
  if (def.targetKind === "text") return targetValue || def.placeholder || def.label;
  return "";
}

function applyQuickEffectToRow(row, context, key, value, name="", scope="auto") {
  const v = parseFloat(value);
  if (!Number.isFinite(v)) {
    alert("追加する数値を入力してください。");
    return false;
  }
  const def = quickEffectDef(key);
  const displayOnly = ["skillPlus", "elementDamagePct", "custom"].includes(key);
  if (displayOnly) {
    pushDisplayEffect(row, key, v, quickEffectTargetName(def, name), def.unit || "", "display");
    return true;
  }

  if (context === "composite") {
    const map = {
      attackFlat:"flatAttack", magicFlat:"flatMagic", speedFlat:"flatSpeed",
      attackPct:"attackPct", magicPct:"magicPct", speedPct:"speedPct",
      convMagicRate:"convMagicRate", convSpeedRate:"convSpeedRate",
      dmgPct:"dmgPct"
    };
    if (map[key]) row[map[key]] = +(row[map[key]] || 0) + v;
    else if (key === "specialMultiplier") row.special = (+(row.special || 1) || 1) * v;
    else if (key === "flatHP") row.extraHP = +(row.extraHP || 0) + v;
    else if (key === "flatMP") row.extraMP = +(row.extraMP || 0) + v;
    else if (key === "flatST") row.extraST = +(row.extraST || 0) + v;
    else if (key === "flatAC") row.extraAC = +(row.extraAC || 0) + v;
    else if (key === "flatMaxWeight") row.extraMaxWeight = +(row.extraMaxWeight || 0) + v;
    else if (key === "hitFlat") row.extraHit = +(row.extraHit || 0) + v;
    else if (key === "avoidFlat") row.extraAvoid = +(row.extraAvoid || 0) + v;
    else if (key === "maxWeightPct") row.extraMaxWeightPct = +(row.extraMaxWeightPct || 0) + v;
    else if (key === "critRatePct") row.extraCritRatePct = +(row.extraCritRatePct || 0) + v;
    return true;
  }

  // equipment
  const bodyScope = scope === "base";
  if (bodyScope && key === "attackFlat") row.attack = +(row.attack || 0) + v;
  else if (bodyScope && key === "magicFlat") row.magic = +(row.magic || 0) + v;
  else if (bodyScope && key === "speedFlat") row.speed = +(row.speed || 0) + v;
  else if (bodyScope && key === "flatHP") row.extraHP = +(row.extraHP || 0) + v;
  else if (bodyScope && key === "flatMP") row.extraMP = +(row.extraMP || 0) + v;
  else if (bodyScope && key === "flatST") row.extraST = +(row.extraST || 0) + v;
  else if (bodyScope && key === "flatAC") row.extraAC = +(row.extraAC || 0) + v;
  else if (bodyScope && key === "flatMaxWeight") row.extraMaxWeight = +(row.extraMaxWeight || 0) + v;
  else if (bodyScope && key === "hitFlat") row.extraHit = +(row.extraHit || 0) + v;
  else if (bodyScope && key === "avoidFlat") row.extraAvoid = +(row.extraAvoid || 0) + v;
  else {
    row.equipBuffEnabled = true;
    if (!row.equipBuffName) row.equipBuffName = row.name ? `${row.name} のBuff` : "装備Buff";
    const map = {
      attackFlat:"equipBuffFlatAttack", magicFlat:"equipBuffFlatMagic", speedFlat:"equipBuffFlatSpeed",
      attackPct:"equipBuffAttackPct", magicPct:"equipBuffMagicPct", speedPct:"equipBuffSpeedPct",
      convMagicRate:"equipBuffConvMagicRate", convSpeedRate:"equipBuffConvSpeedRate",
      dmgPct:"equipBuffDmgPct"
    };
    if (map[key]) row[map[key]] = +(row[map[key]] || 0) + v;
    else if (key === "specialMultiplier") row.equipBuffSpecial = (+(row.equipBuffSpecial || 1) || 1) * v;
    else if (key === "flatHP") row.equipBuffExtraHP = +(row.equipBuffExtraHP || 0) + v;
    else if (key === "flatMP") row.equipBuffExtraMP = +(row.equipBuffExtraMP || 0) + v;
    else if (key === "flatST") row.equipBuffExtraST = +(row.equipBuffExtraST || 0) + v;
    else if (key === "flatAC") row.equipBuffExtraAC = +(row.equipBuffExtraAC || 0) + v;
    else if (key === "flatMaxWeight") row.equipBuffExtraMaxWeight = +(row.equipBuffExtraMaxWeight || 0) + v;
    else if (key === "hitFlat") row.equipBuffExtraHit = +(row.equipBuffExtraHit || 0) + v;
    else if (key === "avoidFlat") row.equipBuffExtraAvoid = +(row.equipBuffExtraAvoid || 0) + v;
    else if (key === "maxWeightPct") row.equipBuffExtraMaxWeightPct = +(row.equipBuffExtraMaxWeightPct || 0) + v;
    else if (key === "critRatePct") row.equipBuffExtraCritRatePct = +(row.equipBuffExtraCritRatePct || 0) + v;
  }
  return true;
}

function makeQuickEffectAdder(row, context, statusButton=null) {
  const wrap = document.createElement("div");
  wrap.className = "quickEffectAdder equipBuffWide";

  const title = document.createElement("div");
  title.className = "extraStatsTitle";
  title.textContent = "効果を追加";
  wrap.appendChild(title);

  const controls = document.createElement("div");
  controls.className = context === "equipment" ? "quickEffectControls quickEffectControlsEquipment" : "quickEffectControls quickEffectControlsBuff";

  let scope = null;
  if (context === "equipment") {
    scope = makeCell("select");
    scope.className = "quickEffectScope";
    scope.innerHTML = `<option value="base">装備本体</option><option value="equipBuff">装備Buff</option>`;
    controls.appendChild(scope);
  }

  const effect = makeCell("select");
  effect.className = "quickEffectType";
  controls.appendChild(effect);

  const targetWrap = document.createElement("div");
  targetWrap.className = "quickEffectTargetWrap";
  controls.appendChild(targetWrap);

  const value = makeCell("input", {type:"number", step:"0.1", placeholder:"値"});
  value.className = "quickEffectValue";
  controls.appendChild(value);

  const add = makeCell("button", {type:"button"}, "追加");
  controls.appendChild(add);

  let targetInput = null;

  const currentScope = () => quickEffectScopeFor(context, scope ? scope.value : null);

  const updateTargetInput = () => {
    const def = quickEffectDef(effect.value);
    targetWrap.innerHTML = "";
    targetInput = null;
    value.placeholder = def.valueLabel || "値";

    if (def.targetKind === "skill") {
      targetInput = makeCell("select");
      targetInput.className = "quickEffectTarget";
      targetInput.innerHTML = SKILL_SIM_ALL.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("");
      targetWrap.appendChild(targetInput);
    } else if (def.targetKind === "element") {
      targetInput = makeCell("select");
      targetInput.className = "quickEffectTarget";
      targetInput.innerHTML = ELEMENT_DAMAGE_OPTIONS.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name.replace("属性", ""))}</option>`).join("");
      targetWrap.appendChild(targetInput);
    } else if (def.targetKind === "text") {
      targetInput = makeCell("input", {type:"text", placeholder:def.placeholder || "対象"});
      targetInput.className = "quickEffectTarget";
      targetWrap.appendChild(targetInput);
    } else {
      const empty = document.createElement("span");
      empty.className = "small muted";
      empty.textContent = "対象なし";
      targetWrap.appendChild(empty);
    }
  };

  const rebuildEffectOptions = () => {
    const s = currentScope();
    effect.innerHTML = quickEffectOptionsHtml(context, s);
    updateTargetInput();
  };

  if (scope) scope.onchange = rebuildEffectOptions;
  effect.onchange = updateTargetInput;

  add.onclick = () => {
    const def = quickEffectDef(effect.value);
    const targetName = targetInput ? targetInput.value : "";
    const appliedValue = value.value;
    const appliedScope = currentScope();
    const ok = applyQuickEffectToRow(row, context, effect.value, appliedValue, targetName, appliedScope);
    if (!ok) return;
    row._lastQuickEffectMessage = quickEffectAppliedMessage(context, appliedScope, effect.value, appliedValue, targetName);
    value.value = "";
    if (statusButton) updateEquipBuffStatus(statusButton, row);
    if (context === "equipment") {
      row._equipBuffOpen = true;
      renderEquipmentTable();
    } else {
      row._compositeExtraOpen = true;
      renderCompositeTable();
    }
    renderTagLinkSummary();
    renderShowcaseTab();
    calc();
  };

  rebuildEffectOptions();
  wrap.appendChild(controls);

  if (row._lastQuickEffectMessage) {
    const result = document.createElement("div");
    result.className = "quickEffectResult";
    result.textContent = row._lastQuickEffectMessage;
    wrap.appendChild(result);
  }

  const help = document.createElement("p");
  help.className = "small";
  help.textContent = context === "equipment"
    ? "追加先を選ぶと、選べる効果が切り替わります。スキル+はスキル一覧から、属性強化は火・水・地・風・無から選べます。"
    : "このBuff行へ効果を追加します。スキル+はスキル一覧から、属性強化は火・水・地・風・無から選べます。";
  wrap.appendChild(help);

  const manual = makeAdditionalEffectsList(row, context);
  wrap.appendChild(manual);
  return wrap;
}

function makeAdditionalEffectsList(row, context) {
  const box = document.createElement("div");
  box.className = "additionalEffectsList";
  const effects = normalizeAdditionalEffects(row.extraEffects);

  const head = document.createElement("div");
  head.className = "additionalEffectsHead";
  head.textContent = "表示用の追加効果";
  box.appendChild(head);

  if (!effects.length) {
    const empty = document.createElement("div");
    empty.className = "small muted additionalEffectsEmpty";
    empty.textContent = "スキル+や属性ダメージ%など、表示・連携用の効果はまだありません。";
    box.appendChild(empty);
    return box;
  }

  effects.forEach((effect, idx) => {
    const item = document.createElement("div");
    item.className = "additionalEffectItem";
    item.dataset.effectKey = effect.key || "custom";

    const text = document.createElement("span");
    text.className = "additionalEffectText";
    text.textContent = additionalEffectLabel(effect);
    item.appendChild(text);

    const edit = makeCell("button", {type:"button", class:"miniButton", title:"この表示用効果を編集"}, "編集");
    edit.onclick = () => {
      row.extraEffects = normalizeAdditionalEffects(row.extraEffects);
      const current = row.extraEffects[idx] || effect;
      const def = quickEffectDef(current.key || "custom");

      let nextName = current.name || "";
      if (def.targetKind === "skill") {
        const message = `スキル名を入力してください。\n候補: ${SKILL_SIM_ALL.join(" / ")}`;
        nextName = prompt(message, current.name || SKILL_SIM_ALL[0] || "");
        if (nextName === null) return;
        if (!SKILL_SIM_ALL.includes(nextName)) {
          alert("スキルシミュレータに存在するスキル名を指定してください。");
          return;
        }
      } else if (def.targetKind === "element") {
        const message = "属性を入力してください。候補: 火属性 / 水属性 / 地属性 / 風属性 / 無属性";
        nextName = prompt(message, current.name || "火属性");
        if (nextName === null) return;
        if (!ELEMENT_DAMAGE_OPTIONS.includes(nextName)) {
          alert("属性は 火属性 / 水属性 / 地属性 / 風属性 / 無属性 から指定してください。");
          return;
        }
      } else {
        nextName = prompt("効果名を入力してください。", current.name || def.placeholder || def.label);
        if (nextName === null) return;
      }

      const rawValue = prompt("値を入力してください。", current.value ?? 0);
      if (rawValue === null) return;
      const nextValue = parseFloat(rawValue);
      if (!Number.isFinite(nextValue)) {
        alert("数値を入力してください。");
        return;
      }

      row.extraEffects[idx] = {
        ...current,
        name: nextName,
        value: nextValue,
        unit: current.unit || def.unit || "",
        scope: current.scope || "display"
      };

      if (context === "equipment") {
        row._equipBuffOpen = true;
        renderEquipmentTable();
      } else {
        row._compositeExtraOpen = true;
        renderCompositeTable();
      }
      renderShowcaseTab();
      calc();
    };
    item.appendChild(edit);

    const del = makeCell("button", {type:"button", class:"dangerMini", title:"この表示用効果を削除"}, "×");
    del.onclick = () => {
      row.extraEffects = normalizeAdditionalEffects(row.extraEffects);
      row.extraEffects.splice(idx, 1);
      if (context === "equipment") {
        row._equipBuffOpen = true;
        renderEquipmentTable();
      } else {
        row._compositeExtraOpen = true;
        renderCompositeTable();
      }
      renderShowcaseTab();
      calc();
    };
    item.appendChild(del);
    box.appendChild(item);
  });
  return box;
}


function extraStatNumberInput(row, def, mode="base", onUpdate=null) {
  mode = normalizeExtraMode(mode);
  const prop = extraPropFor(def, mode);
  const wrap = document.createElement("label");
  wrap.textContent = def.label;
  const input = makeCell("input", {type:"number", step:def.step || "0.1", value: row[prop] ?? 0});
  input.oninput = () => {
    row[prop] = parseFloat(input.value) || 0;
    if (onUpdate) onUpdate();
    calc();
  };
  wrap.appendChild(input);
  return wrap;
}

function extraStatHasValue(row, def, mode="base") {
  const prop = extraPropFor(def, mode);
  return +(row?.[prop] || 0) !== 0;
}

function makeExtraStatsEditor(row, title, mode="base", onUpdate=null) {
  mode = normalizeExtraMode(mode);
  const wrap = document.createElement("div");
  wrap.className = "extraStatsEditor equipBuffWide";
  const h = document.createElement("div");
  h.className = "extraStatsTitle";
  h.textContent = title;
  wrap.appendChild(h);

  const help = document.createElement("p");
  help.className = "small extraStatsHelp";
  help.textContent = "値が入っている項目だけ表示します。新しく足す時は上の「効果を追加」を使ってください。";
  wrap.appendChild(help);

  const activeDefs = extraFieldDefsFor(mode).filter(def => extraStatHasValue(row, def, mode));

  const activeGrid = document.createElement("div");
  activeGrid.className = "extraStatsGrid extraStatsActiveGrid";
  if (activeDefs.length) {
    activeDefs.forEach(def => activeGrid.appendChild(extraStatNumberInput(row, def, mode, onUpdate)));
  } else {
    const empty = document.createElement("div");
    empty.className = "small extraStatsEmptyMessage";
    empty.textContent = "値が入っている項目はありません。";
    activeGrid.appendChild(empty);
  }
  wrap.appendChild(activeGrid);

  return wrap;
}

function extraTsvFields(mode="base") {
  mode = normalizeExtraMode(mode);
  return extraFieldDefsFor(mode).map(d => extraPropFor(d, mode));
}

function extraTsvExportFields(row, mode="base") {
  const out = {};
  extraTsvFields(mode).forEach(prop => out[prop] = row?.[prop] ?? 0);
  return out;
}

function extraTsvParseFields(row, mode="base") {
  const out = {};
  extraTsvFields(mode).forEach(prop => out[prop] = cellToNum(row?.[prop]));
  return out;
}

function defaultEquipmentCandidate(slot, enabled=true) {
  return {
    enabled,
    slot,
    name: "",
    attack: 0,
    magic: 0,
    speed: 0,
    delay: 0,
    weaponDamage: 0,
    weaponWeight: 0,
    weaponAttackInterval: 0,
    weaponRange: 0,
    weaponDurability: 0,
    weaponTwoHanded: "×",
    weaponReq: [],
    tags: "",
    optimizerFixed: false,
    optimizerExcluded: false,
    equipBuffEnabled: false,
    equipBuffSlot: true,
    equipBuffName: "",
    equipBuffAttackPct: 0,
    equipBuffMagicPct: 0,
    equipBuffSpeedPct: 0,
    equipBuffFlatAttack: 0,
    equipBuffFlatMagic: 0,
    equipBuffFlatSpeed: 0,
    equipBuffConvMagicRate: 0,
    equipBuffConvSpeedRate: 0,
    equipBuffDmgPct: 0,
    equipBuffSpecial: 1,
    equipBuffNote: "",
    ...extraDefaultFields("base"),
    ...extraDefaultFields("buff"),
    ...extraDefaultFields("equipBuff"),
    extraEffects: [],
    note: ""
  };
}

function defaultEquipmentRows() {
  return EQUIPMENT_SLOTS.map(x => defaultEquipmentCandidate(x.slot, true));
}

function normalizeEquipmentSlotName(slot) {
  return slot === "武器: 右手武器" ? "武器: 右手"
    : slot === "武器: 左手武器" ? "武器: 左手"
    : slot;
}

function normalizeEquipmentCandidate(row, fallbackSlot) {
  const slot = normalizeEquipmentSlotName(row?.slot || fallbackSlot || "防具: 頭");
  const out = {
    ...defaultEquipmentCandidate(slot, true),
    ...(row || {}),
    slot,
    enabled: row && row.enabled !== undefined ? !!row.enabled : true,
    optimizerFixed: !!(row?.optimizerFixed || row?.optimizerFix || row?.fixedInOptimizer || row?.searchFixed),
    optimizerExcluded: !!(row?.optimizerExcluded || row?.optimizerExclude || row?.excludeFromOptimizer || row?.searchExcluded),
    attack: +(row?.attack || 0),
    magic: +(row?.magic || 0),
    speed: +(row?.speed || 0),
    delay: +(row?.delay || 0),
    weaponDamage: +(row?.weaponDamage || 0),
    weaponWeight: +(row?.weaponWeight || 0),
    weaponAttackInterval: +(row?.weaponAttackInterval || row?.attackInterval || 0),
    weaponRange: +(row?.weaponRange || row?.range || 0),
    weaponDurability: +(row?.weaponDurability || row?.durability || 0),
    weaponTwoHanded: (row?.weaponTwoHanded === true || row?.weaponTwoHanded === "○" || row?.weaponTwoHanded === "yes" || row?.weaponTwoHanded === "true" || row?.twoHanded === true) ? "○" : "×",
    weaponReq: normalizeWeaponReqRowsForEquipment(row?.weaponReq || row?.weaponRequirements || []),
    equipBuffEnabled: !!row?.equipBuffEnabled,
    equipBuffSlot: row?.equipBuffSlot !== false,
    equipBuffAttackPct: +(row?.equipBuffAttackPct || 0),
    equipBuffMagicPct: +(row?.equipBuffMagicPct || 0),
    equipBuffSpeedPct: +(row?.equipBuffSpeedPct || 0),
    equipBuffFlatAttack: +(row?.equipBuffFlatAttack || 0),
    equipBuffFlatMagic: +(row?.equipBuffFlatMagic || 0),
    equipBuffFlatSpeed: +(row?.equipBuffFlatSpeed || 0),
    equipBuffConvMagicRate: +(row?.equipBuffConvMagicRate || 0),
    equipBuffConvSpeedRate: +(row?.equipBuffConvSpeedRate || 0),
    equipBuffDmgPct: +(row?.equipBuffDmgPct || 0),
    equipBuffSpecial: row?.equipBuffSpecial === undefined || row?.equipBuffSpecial === "" ? 1 : +(row?.equipBuffSpecial || 1),
    extraEffects: normalizeAdditionalEffects(row?.extraEffects || row?.additionalEffects || [])
  };
  normalizeExtraStatsOnRow(out, row || {});
  if (+out.delay && !(+out.extraAttackDelay)) out.extraAttackDelay = +out.delay;
  out.delay = 0;
  return out;
}

function normalizeEquipmentRows(rows) {
  const incoming = Array.isArray(rows) ? rows : [];
  if (!incoming.length) return defaultEquipmentRows();

  const result = [];
  const slotless = [];

  incoming.forEach(row => {
    if (!row) return;
    if (!row.slot) slotless.push(row);
    else result.push(normalizeEquipmentCandidate(row));
  });

  // 古い「部位なし装備行」は防具:頭以降へ順に割り当てる。
  const legacySlots = EQUIPMENT_SLOTS.slice(EQUIPMENT_SLOTS.findIndex(x => x.slot === "防具: 頭")).map(x => x.slot);
  slotless.forEach((row, idx) => {
    result.push(normalizeEquipmentCandidate(row, legacySlots[idx] || "防具: 頭"));
  });

  // 各部位に最低1つは空候補を置く。
  EQUIPMENT_SLOTS.forEach(({slot}) => {
    if (!result.some(r => r.slot === slot)) {
      result.push(defaultEquipmentCandidate(slot, true));
    }
  });

  // 同じ部位で使用ONが複数ある場合、先頭だけONにする。
  const seenEnabled = new Set();
  result.forEach(row => {
    if (row.enabled !== false) {
      if (seenEnabled.has(row.slot)) row.enabled = false;
      else seenEnabled.add(row.slot);
    }
  });

  // 最適化固定も同じ部位につき1つだけ。固定は除外より優先する。
  const seenFixed = new Set();
  result.forEach(row => {
    if (row.optimizerFixed) {
      if (seenFixed.has(row.slot)) row.optimizerFixed = false;
      else {
        seenFixed.add(row.slot);
        row.optimizerExcluded = false;
      }
    }
  });

  return result;
}

/* 新規起動時の初期状態。検証用データは入れず、基本的に空で始める。 */

const SKILL_SIM_GROUPS = [
  ["戦闘", ["筋力", "着こなし", "攻撃回避", "生命力", "知能", "持久力", "精神力", "集中力", "呪文抵抗力", "盾"]],
  ["基本", ["落下耐性", "水泳", "死体回収", "包帯", "自然回復", "採掘", "伐採", "収穫", "釣り"]],
  ["生産", ["料理", "醸造", "鍛冶", "木工", "裁縫", "薬調合", "装飾細工", "複製", "栽培", "美容"]],
  ["熟練", ["素手", "刀剣", "こんぼう", "槍", "銃器", "弓", "投げ", "牙", "キック", "罠", "戦闘技術", "酩酊", "物まね", "調教", "破壊魔法", "回復魔法", "強化魔法", "神秘魔法", "召喚魔法", "死の魔法", "魔法熟練", "自然調和", "暗黒命令", "取引", "音楽", "ダンス", "パフォーマンス"]]
];

const SKILL_SIM_ALL = SKILL_SIM_GROUPS.flatMap(([, list]) => list);
const SKILL_SIM_WEAPON = ["素手", "刀剣", "こんぼう", "槍", "銃器", "弓", "投げ", "牙", "キック", "罠"];

const SKILL_SIM_STAT_COEFF = {
  hp: 3.0,
  mp: 3.0,
  st: 3.0,
  atk: 0.2,
  hit: 1.0,
  def: 0.2,
  avoid: 1.0,
  magic: 1.0,
  resist: 1.0,
  weight: 1.5
};

const SKILL_SIM_RACE = {
  newtar: {
    base: {hp:30, mp:30, st:30, atk:0, hit:0, def:0, avoid:0, magic:0, resist:0, weight:10},
    mult: {hp:1.00, mp:1.00, st:1.00, atk:1.00, hit:1.00, def:1.00, avoid:1.00, magic:1.00, resist:1.00, weight:1.00}
  },
  cognite: {
    base: {hp:30, mp:35, st:30, atk:0, hit:0, def:0, avoid:0, magic:0, resist:0, weight:5},
    mult: {hp:0.95, mp:1.10, st:0.95, atk:0.95, hit:1.05, def:0.95, avoid:0.95, magic:1.10, resist:1.10, weight:0.90}
  },
  elmony: {
    base: {hp:25, mp:30, st:35, atk:0, hit:0, def:0, avoid:0, magic:0, resist:0, weight:10},
    mult: {hp:0.95, mp:1.00, st:1.05, atk:0.95, hit:1.05, def:0.95, avoid:1.10, magic:0.95, resist:1.00, weight:1.00}
  },
  pandemos: {
    base: {hp:35, mp:20, st:30, atk:0, hit:0, def:0, avoid:0, magic:0, resist:0, weight:15},
    mult: {hp:1.05, mp:0.95, st:1.00, atk:1.05, hit:1.00, def:1.00, avoid:0.95, magic:0.90, resist:0.90, weight:1.20}
  }
};

function skillSimStat(raceKey, statKey, skillValue) {
  const race = SKILL_SIM_RACE[raceKey] || SKILL_SIM_RACE.newtar;
  const base = +(race.base?.[statKey] || 0);
  const mult = +(race.mult?.[statKey] || 1);
  const coeff = +(SKILL_SIM_STAT_COEFF[statKey] || 0);
  return base + ((+skillValue || 0) * coeff * mult);
}

function defaultSkillSimState() {
  const skills = {};
  SKILL_SIM_ALL.forEach(name => skills[name] = 0);
  return {
    name: "",
    race: "newtar",
    cap: 850,
    weaponSkill: "こんぼう",
    autoApply: true,
    skills
  };
}

function normalizeSkillSim(raw) {
  const base = defaultSkillSimState();
  const incoming = raw || {};
  const out = {
    ...base,
    ...incoming,
    name: incoming.name || "",
    race: incoming.race || "newtar",
    cap: incoming.cap === undefined || incoming.cap === "" ? 850 : (+incoming.cap || 850),
    weaponSkill: incoming.weaponSkill || "こんぼう",
    autoApply: incoming.autoApply !== false,
    skills: {...base.skills, ...(incoming.skills || {})}
  };
  // 旧版・外部データ互換。内部名が異なるものを現行UIのスキル名へ寄せる。
  const aliases = {
    "解読": "複製",
    "盗み": "物まね"
  };
  Object.entries(aliases).forEach(([from, to]) => {
    if (incoming.skills && incoming.skills[from] !== undefined && out.skills[to] !== undefined) {
      out.skills[to] = Math.max(+(out.skills[to] || 0), +(incoming.skills[from] || 0));
    }
  });

  SKILL_SIM_ALL.forEach(name => {
    out.skills[name] = Math.max(0, Math.min(100, +(out.skills[name] || 0)));
  });
  return out;
}

function skillSimValue(name) {
  state.skillSim = normalizeSkillSim(state.skillSim);
  return +(state.skillSim.skills[name] || 0);
}

function skillSimTotal() {
  state.skillSim = normalizeSkillSim(state.skillSim);
  return SKILL_SIM_ALL.reduce((s, name) => s + (+(state.skillSim.skills[name] || 0)), 0);
}

function skillSimDerived() {
  state.skillSim = normalizeSkillSim(state.skillSim);
  const race = state.skillSim.race || "newtar";
  const weapon = skillSimValue(state.skillSim.weaponSkill);
  const total = skillSimTotal();
  return {
    total,
    remain: (state.skillSim.cap || 850) - total,
    hp: skillSimStat(race, "hp", skillSimValue("生命力")),
    mp: skillSimStat(race, "mp", skillSimValue("知能")),
    st: skillSimStat(race, "st", skillSimValue("持久力")),
    weight: skillSimStat(race, "weight", skillSimValue("筋力")),
    atk: skillSimStat(race, "atk", skillSimValue("筋力")),
    def: skillSimStat(race, "def", skillSimValue("着こなし")),
    hit: skillSimStat(race, "hit", weapon),
    avoid: skillSimStat(race, "avoid", skillSimValue("攻撃回避")),
    magic: skillSimStat(race, "magic", skillSimValue("精神力")),
    resist: skillSimStat(race, "resist", skillSimValue("呪文抵抗力")),
    weapon,
    drunk: skillSimValue("酩酊")
  };
}

function syncSkillSimToCalcInputs(force=false, updateWeaponReqName=false) {
  if (!state || !state.skillSim) return false;
  state.skillSim = normalizeSkillSim(state.skillSim);
  if (!force && state.skillSim.autoApply === false) return false;

  const d = skillSimDerived();

  if (byId("raceSelect")) byId("raceSelect").value = state.skillSim.race || "newtar";
  if (byId("str")) byId("str").value = fmt(skillSimValue("筋力"), 1);
  if (byId("spirit")) byId("spirit").value = fmt(skillSimValue("精神力"), 1);
  if (byId("drunk")) byId("drunk").value = fmt(d.drunk, 1);

  // 旧形式・未統合武器用の互換データも更新しておく。
  state.weaponReq = normalizeWeaponReqRows(state.weaponReq, collectInputs());
  if (!state.weaponReq.length) state.weaponReq.push({name:"武器スキル", current:0, required:0});
  state.weaponReq[0].name = state.skillSim.weaponSkill || "武器スキル";
  state.weaponReq[0].current = d.weapon;

  if (updateWeaponReqName) {
    const weaponRow = selectedWeaponRowForEdit();
    if (weaponRow) {
      weaponRow.weaponReq = normalizeWeaponReqRowsForEquipment(weaponRow.weaponReq);
      if (!weaponRow.weaponReq.length) weaponRow.weaponReq.push({name: state.skillSim.weaponSkill || "こんぼう", current:0, required:0});
      weaponRow.weaponReq[0].name = validSkillSimSkillName(state.skillSim.weaponSkill || weaponRow.weaponReq[0].name);
    }
  }

  return true;
}

function handleSkillSimChanged() {
  updateSkillSimSummary();
  syncSkillSimToCalcInputs(false, false);
  calc();
}



const SKILL_KNOWLEDGE_FALLBACK_MASTERIES = [
  {
    "id": "mastery-war",
    "code": "WAR",
    "name": "ウォーリアー / ファイター / ナイト",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ウォーリアー",
        "en": "Warrior"
      },
      {
        "min": 70,
        "name": "ファイター",
        "en": "Fighter"
      },
      {
        "min": 90,
        "name": "ナイト",
        "en": "Knight"
      }
    ],
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40
      },
      {
        "skill": "キック",
        "min": 40
      },
      {
        "skill": "盾",
        "min": 40
      },
      {
        "skill": "戦闘技術",
        "min": 40
      }
    ],
    "effect": "刀剣武器を振るときのディレイが短くなる\nディレイ5％短縮",
    "shipEquipment": "ウォーリアへの果たし状",
    "acquisition": "チュートリアル",
    "transfer": "×",
    "prerequisiteTechniques": [
      "エンデュランス",
      "テンションアップ",
      "ウォークライ",
      "プロテクト ガード",
      "天輪・繚乱の剣",
      "アブソーブ ガード",
      "シバルリー スピリッツ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-alc",
    "code": "ALC",
    "name": "アルケミスト / マスター ウィザード / ウォーロック",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "アルケミスト",
        "en": "Alchemist"
      },
      {
        "min": 70,
        "name": "マスター ウィザード",
        "en": "Master Wizard"
      },
      {
        "min": 90,
        "name": "ウォーロック",
        "en": "Warlock"
      }
    ],
    "requirements": [
      {
        "skill": "破壊魔法",
        "min": 40
      },
      {
        "skill": "回復魔法",
        "min": 40
      },
      {
        "skill": "強化魔法",
        "min": 40
      },
      {
        "skill": "神秘魔法",
        "min": 40
      }
    ],
    "effect": "魔法詠唱速度が速くなる\n全ての魔法の詠唱時間4％・ディレイ6％短縮",
    "shipEquipment": "アルケミストへの試練",
    "acquisition": "チュートリアル",
    "transfer": "×",
    "prerequisiteTechniques": [
      "パル フレア",
      "リフレクト バリア",
      "エナジー チャージ",
      "マジック スプリング",
      "スペル エンハンス",
      "マナ リチャージ",
      "シリアル スペル",
      "ディレイ マジック",
      "マルチプル エンハンス",
      "メルト バースト"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-for",
    "code": "FOR",
    "name": "フォレスター / フォレスト マスター / スカイウォーカー",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "フォレスター",
        "en": "Forester"
      },
      {
        "min": 70,
        "name": "フォレスト マスター",
        "en": "Forest Master"
      },
      {
        "min": 90,
        "name": "スカイウォーカー",
        "en": "Skywalker"
      }
    ],
    "requirements": [
      {
        "skill": "弓",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      },
      {
        "skill": "物まね",
        "min": 40
      },
      {
        "skill": "調教",
        "min": 40
      }
    ],
    "effect": "弓攻撃の発射間隔が短くなる\nディレイ5％短縮",
    "shipEquipment": "フォレスターへの一矢",
    "acquisition": "チュートリアル",
    "transfer": "×",
    "prerequisiteTechniques": [
      "アロー レイン",
      "ヒドゥン ショット",
      "刈り払い",
      "リバイバル ソウル",
      "クイック アロー"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-nec",
    "code": "NEC",
    "name": "ネクロマンサー / ダーク プリースト / シャドウ ナイト",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ネクロマンサー",
        "en": "Necromancer"
      },
      {
        "min": 70,
        "name": "ダーク プリースト",
        "en": "Dark Priest"
      },
      {
        "min": 90,
        "name": "シャドウ ナイト",
        "en": "Shadow Knight"
      }
    ],
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 40
      },
      {
        "skill": "死の魔法",
        "min": 40
      },
      {
        "skill": "牙",
        "min": 40
      },
      {
        "skill": "暗黒命令",
        "min": 40
      }
    ],
    "effect": "召喚魔法の詠唱時間が短縮される\n召喚魔法の詠唱時間・ディレイ5％短縮",
    "shipEquipment": "ネクロマンサーへの実験",
    "acquisition": "チュートリアル",
    "transfer": "×",
    "prerequisiteTechniques": [
      "サモン ストロング ゾンビ",
      "ナイト オブ カース",
      "サモン ドラゴン ゾンビ",
      "ネガティブ バースト",
      "サモン ガシャドクロ",
      "ディメンター ソウル",
      "ダーク ディメンション",
      "サモン ヘッドレス ナイト",
      "残夜の黒翼",
      "ソウル スレイブ",
      "ブラッド ムーン",
      "ベノム インフェルノ",
      "反魂の秘術",
      "地獄の祭壇",
      "サモン プロセルピナ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-cre",
    "code": "CRE",
    "name": "クリエイター / マスター クリエイター / ジェネシス",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "クリエイター",
        "en": "Creator"
      },
      {
        "min": 70,
        "name": "マスター クリエイター",
        "en": "Master Creator"
      },
      {
        "min": 90,
        "name": "ジェネシス",
        "en": "Genesis"
      }
    ],
    "requirements": [
      {
        "skill": "鍛冶",
        "min": 40
      },
      {
        "skill": "木工",
        "min": 40
      },
      {
        "skill": "伐採",
        "min": 40
      },
      {
        "skill": "採掘",
        "min": 40
      }
    ],
    "effect": "合成アクションゲージの移動速度が遅くなる\n鍛治と木工のゲージ速度-10",
    "shipEquipment": "未来生み出す、創造主へ",
    "acquisition": "チュートリアル",
    "transfer": "×",
    "prerequisiteTechniques": [
      "エキスパート センス",
      "サモン アプレンティス"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-bom",
    "code": "BOM",
    "name": "爆弾男 / 爆弾女 / 超爆弾男 / 超爆弾女 / ボンバーキング / ボンバークイーン",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "爆弾男 / 爆弾女",
        "en": "Bomberman"
      },
      {
        "min": 70,
        "name": "超爆弾男 / 超爆弾女",
        "en": "Super Bomberman"
      },
      {
        "min": 90,
        "name": "ボンバーキング / ボンバークイーン",
        "en": "Bomber King / Bomber Queen"
      }
    ],
    "requirements": [
      {
        "skill": "罠",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      },
      {
        "skill": "持久力",
        "min": 40
      },
      {
        "skill": "物まね",
        "min": 40
      }
    ],
    "effect": "罠の設置間隔が短くなる\nディレイ5％短縮",
    "shipEquipment": "爆弾男への一歩",
    "acquisition": "【朝露の芽】への一矢",
    "transfer": "○",
    "prerequisiteTechniques": [
      "ボンバー エクスプロージョン",
      "クロスファイアー ボム",
      "グラウンド ゼロ",
      "リモコン爆弾",
      "パンプキン ボム",
      "エアリアル ボミング"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-bre",
    "code": "BRE",
    "name": "ブリーダー / ブリード マスター / ブリード ロード",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ブリーダー",
        "en": "Breeder"
      },
      {
        "min": 70,
        "name": "ブリード マスター",
        "en": "Breed Master"
      },
      {
        "min": 90,
        "name": "ブリード ロード",
        "en": "Breed Lord"
      }
    ],
    "requirements": [
      {
        "skill": "取引",
        "min": 40
      },
      {
        "skill": "料理",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      },
      {
        "skill": "調教",
        "min": 40
      }
    ],
    "effect": "ペットの経験値がペットウインドウに表示されるようになる\n調教スキルの技のディレイが短くなる\n連れているペットの取得経験値が少し増える\nディレイ5％短縮、取得経験値+20%",
    "shipEquipment": "未実装",
    "acquisition": "【一粒の種】への一矢",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ブリーディング ウィップ",
      "エリア チェリッシング",
      "ひよこ鑑定",
      "トリミング ケア",
      "リバイバルソウル"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-tem",
    "code": "TEM",
    "name": "テンプルナイト / パラディン / セイクリッドロード",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "テンプルナイト",
        "en": "Temple Knight"
      },
      {
        "min": 70,
        "name": "パラディン",
        "en": "Paladin"
      },
      {
        "min": 90,
        "name": "セイクリッドロード",
        "en": "Sacred Lord"
      }
    ],
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 40
      },
      {
        "skill": "神秘魔法",
        "min": 40
      },
      {
        "skill": "こんぼう",
        "min": 40
      },
      {
        "skill": "戦闘技術",
        "min": 40
      },
      {
        "skill": "集中力",
        "min": 40
      }
    ],
    "effect": "アンデッド系に追加ダメージ\nエンチャント魔法の特性\nに準拠。20ダメージ程度\n右手にFzBエフェクト。命中するとLBのエフェクト\nブレイド系と併用できない。ブレイド系に常に上書きされる",
    "shipEquipment": "テンプルナイトへの試練",
    "acquisition": "あわく光る、白き願い",
    "transfer": "○",
    "prerequisiteTechniques": [
      "シャイニング フォース",
      "サクリファイス リザレクション",
      "神の雷",
      "ゴッド ハンマー",
      "ゴッド ブレス",
      "ヘブンズ ジャッジメント"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-dru",
    "code": "DRU",
    "name": "ドルイド / マスター ドルイド / ドルイド キング / ドルイド クイーン",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ドルイド",
        "en": "Druid"
      },
      {
        "min": 70,
        "name": "マスター ドルイド",
        "en": "Master Druid"
      },
      {
        "min": 90,
        "name": "ドルイド キング / ドルイド クイーン",
        "en": "Druid King / Druid Queen"
      }
    ],
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      },
      {
        "skill": "魔法熟練",
        "min": 40
      },
      {
        "skill": "暗黒命令",
        "min": 40
      }
    ],
    "effect": "毒にかかった時、自動で解毒される\n毒系のDoTのみ",
    "shipEquipment": "知識溢れる 祭司への試練",
    "acquisition": "【祝されし者】への挑戦\nウォーター ウンディーネ\nThe Legend of Duelist\n忍者\n御庭番",
    "transfer": "×",
    "prerequisiteTechniques": [
      "グローイング ツリー",
      "アシッド レイン",
      "フォース オブ ネイチャー",
      "スノー ストーム",
      "桜花の魔鏡"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-sag",
    "code": "SAG",
    "name": "紺碧の賢者 / 深緋の賢者 / 白銀の賢者",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "紺碧の賢者",
        "en": "Sage of Cerulean"
      },
      {
        "min": 70,
        "name": "深緋の賢者",
        "en": "Sage of Scarlet"
      },
      {
        "min": 90,
        "name": "白銀の賢者",
        "en": "Sage of Silver"
      }
    ],
    "requirements": [
      {
        "skill": "破壊魔法",
        "min": 40
      },
      {
        "skill": "回復魔法",
        "min": 40
      },
      {
        "skill": "強化魔法",
        "min": 40
      },
      {
        "skill": "神秘魔法",
        "min": 40
      },
      {
        "skill": "召喚魔法",
        "min": 40
      },
      {
        "skill": "死の魔法",
        "min": 40
      }
    ],
    "effect": "詠唱中の移動速度が速くなる\nモーションが、賢者風になる\n※モーションは、男性キャラ限定\n詠唱中の速度移動+40％",
    "shipEquipment": "紺碧の賢者への試練",
    "acquisition": "【入門者】への試練",
    "transfer": "×",
    "prerequisiteTechniques": [
      "マジック ドレイン",
      "リザレクション オール",
      "シリアル スペル",
      "アルティメット バースト",
      "サモン プロセルピナ",
      "紅き援軍要請",
      "蒼き援軍要請"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-gre",
    "code": "GRE",
    "name": "グレート クリエイター / クリエイト ロード / 人間国宝",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "グレート クリエイター",
        "en": "Great Creator"
      },
      {
        "min": 70,
        "name": "クリエイト ロード",
        "en": "Create Lord"
      },
      {
        "min": 90,
        "name": "人間国宝",
        "en": "Living Treasure"
      }
    ],
    "requirements": [
      {
        "skill": "鍛冶",
        "min": 40
      },
      {
        "skill": "木工",
        "min": 40
      },
      {
        "skill": "裁縫",
        "min": 40
      },
      {
        "skill": "薬調合",
        "min": 40
      },
      {
        "skill": "装飾細工",
        "min": 40
      },
      {
        "skill": "料理",
        "min": 40
      },
      {
        "skill": "複製",
        "min": 40
      },
      {
        "skill": "醸造",
        "min": 40
      }
    ],
    "effect": "所持可能重量が増加する\nグレードの高い合成品を作成しやすくなります。\n最大重量+20、全生産のグレードゾーン+1",
    "shipEquipment": "未来切り開く、創造主へ",
    "acquisition": "【砕石の槌】への要務\n【紡ぎ手】への課題\n【見習い】への注文",
    "transfer": "×",
    "prerequisiteTechniques": [
      "鳥獣戯画",
      "マスプロダクション"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-mer",
    "code": "MER",
    "name": "傭兵 / ヒットマン / ゴッドファーザー",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "傭兵",
        "en": "Mercenary"
      },
      {
        "min": 70,
        "name": "ヒットマン",
        "en": "Hitman"
      },
      {
        "min": 90,
        "name": "ゴッドファーザー",
        "en": "Godfather"
      }
    ],
    "requirements": [
      {
        "skill": "銃器",
        "min": 40
      },
      {
        "skill": "罠",
        "min": 40
      },
      {
        "skill": "物まね",
        "min": 40
      },
      {
        "skill": "戦闘技術",
        "min": 40
      },
      {
        "skill": "料理",
        "min": 40
      }
    ],
    "effect": "所持可能重量が増加する、攻撃ディレイが少し短くなる\n最大重量+10\n210525パッチ\nにて攻撃ディレイ-3が追加",
    "shipEquipment": "傭兵装備 取得作戦",
    "acquisition": "【無刀】への果たし状",
    "transfer": "×",
    "prerequisiteTechniques": [
      "スナイパー ショット",
      "グレネード ブラスト",
      "リコール トイソルジャー",
      "マシンガン プレイスメント",
      "リコール アンダーリング",
      "パンプキン ボム"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-sam",
    "code": "SAM",
    "name": "サムライ / サムライ マスター / 将軍",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "サムライ",
        "en": "Samurai"
      },
      {
        "min": 70,
        "name": "サムライ マスター",
        "en": "Samurai Master"
      },
      {
        "min": 90,
        "name": "将軍",
        "en": "Shogun"
      }
    ],
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40
      },
      {
        "skill": "戦闘技術",
        "min": 40
      },
      {
        "skill": "攻撃回避",
        "min": 40
      },
      {
        "skill": "筋力",
        "min": 40
      },
      {
        "skill": "包帯",
        "min": 40
      },
      {
        "skill": "精神力",
        "min": 40
      }
    ],
    "effect": "二刀流による攻撃が可能になる。\n左手に刀剣武器を装備している必要があります。\n詳しくは\n下記\n参照",
    "shipEquipment": "剣の道を極める一歩",
    "acquisition": "【木刀】への果たし状\n異国の剣士",
    "transfer": "×",
    "prerequisiteTechniques": [
      "牙斬",
      "乱れ桜",
      "居合斬り",
      "天輪・繚乱の剣",
      "桜花一閃",
      "燕返し",
      "弧月破斬",
      "堅守の太刀"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-min",
    "code": "MIN",
    "name": "マイン ビショップ / メタル ビショップ / フルメタル ビショップ",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "マイン ビショップ",
        "en": "Mine Bishop"
      },
      {
        "min": 70,
        "name": "メタル ビショップ",
        "en": "Metal Bishop"
      },
      {
        "min": 90,
        "name": "フルメタル ビショップ",
        "en": "Full Metal Bishop"
      }
    ],
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 40
      },
      {
        "skill": "魔法熟練",
        "min": 40
      },
      {
        "skill": "召喚魔法",
        "min": 40
      },
      {
        "skill": "鍛冶",
        "min": 40
      }
    ],
    "effect": "グレードの高い合成品を作成しやすくなる\n鍛治のグレードゾーン+2.2",
    "shipEquipment": "[マインビショップ]への要務",
    "acquisition": "【粗金の槌】への要務",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ロック ミミック",
      "サモン マイナーズ",
      "サモン ブラスト ファーネス"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-kit",
    "code": "KIT",
    "name": "厨房師 / マスター厨房師 / ゴッド厨房師",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "厨房師",
        "en": "Kitchen Master"
      },
      {
        "min": 70,
        "name": "マスター厨房師",
        "en": "True Kitchen Master"
      },
      {
        "min": 90,
        "name": "ゴッド厨房師",
        "en": "God Kitchen Master"
      }
    ],
    "requirements": [
      {
        "skill": "料理",
        "min": 40
      },
      {
        "skill": "醸造",
        "min": 40
      }
    ],
    "effect": "料理と醸造の合成成功率が上昇する\n料理と醸造のヒットゾーン+1",
    "shipEquipment": "厨房師へのオーダー",
    "acquisition": "【皿洗い】への注文",
    "transfer": "×",
    "prerequisiteTechniques": [
      "トリプル フィレッツ",
      "サモン ジンジャーブレッドマン",
      "サモン チョコ キャット",
      "フランバージュ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-ass",
    "code": "ASS",
    "name": "アサシン / 忍者 / 御庭番",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "アサシン",
        "en": "Assassin"
      },
      {
        "min": 70,
        "name": "忍者",
        "en": "Ninja"
      },
      {
        "min": 90,
        "name": "御庭番",
        "en": "Oniwaban"
      }
    ],
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40
      },
      {
        "skill": "罠",
        "min": 40
      },
      {
        "skill": "物まね",
        "min": 40
      },
      {
        "skill": "投げ",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      },
      {
        "skill": "薬調合",
        "min": 40
      },
      {
        "skill": "落下耐性",
        "min": 40
      }
    ],
    "effect": "傾斜に対して垂直に立つ事が可能\n移動速度やクリティカル発生率が上昇する\n移動速度6％、クリティカル発生率10％上昇",
    "shipEquipment": "忍ぶ衣は、金貨と共に",
    "acquisition": "白き、望",
    "transfer": "○",
    "prerequisiteTechniques": [
      "霧隠れの術",
      "火遁の術",
      "エア ジャンプ",
      "木ノ葉風陣の術",
      "アサシネイト",
      "インファリブル スロウ",
      "水遁の術",
      "炎遁の術",
      "石化の術",
      "勇健の術",
      "風魔手裏剣",
      "兵糧丸",
      "パンプキン ボム"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-sea",
    "code": "SEA",
    "name": "海戦士 / 英雄海戦士 / 海王",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "海戦士",
        "en": "Sea Fighter"
      },
      {
        "min": 70,
        "name": "英雄海戦士",
        "en": "Sea Hero"
      },
      {
        "min": 90,
        "name": "海王",
        "en": "Sea King"
      }
    ],
    "requirements": [
      {
        "skill": "水泳",
        "min": 40
      },
      {
        "skill": "槍",
        "min": 40
      },
      {
        "skill": "料理",
        "min": 40
      },
      {
        "skill": "釣り",
        "min": 40
      },
      {
        "skill": "取引",
        "min": 40
      }
    ],
    "effect": "槍攻撃の間隔が短くなる\nディレイ5％短縮\n泳ぎ速度+17",
    "shipEquipment": "熱くたぎる、海の誓い",
    "acquisition": "旅人と、にっこり",
    "transfer": "○",
    "prerequisiteTechniques": [
      "ウォーター ストリーム",
      "キャッチ ターゲット",
      "サモン バディ",
      "サモン クラーケン",
      "ネプチューン スキン",
      "鮪型魚雷",
      "オーシャン ストリーム"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-bra",
    "code": "BRA",
    "name": "ブレイブナイト / アーマーナイト / ジャスティス タンク",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ブレイブナイト",
        "en": "Brave Knight"
      },
      {
        "min": 70,
        "name": "アーマーナイト",
        "en": "Armor Knight"
      },
      {
        "min": 90,
        "name": "ジャスティス タンク",
        "en": "Justice Tank"
      }
    ],
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 40
      },
      {
        "skill": "こんぼう",
        "min": 40
      },
      {
        "skill": "盾",
        "min": 40
      },
      {
        "skill": "着こなし",
        "min": 40
      }
    ],
    "effect": "防御力が増加する\n防御力+5",
    "shipEquipment": "ブレイブナイトへの果たし状",
    "acquisition": "白・抱・望",
    "transfer": "○",
    "prerequisiteTechniques": [
      "アトラクト",
      "エンデュランス",
      "テンションアップ",
      "プロテクト ガード",
      "かばう",
      "アブソーブ ガード",
      "フォートレス",
      "シバルリー スピリッツ",
      "キャッスル オブ ストーン",
      "ショルダー チャージ",
      "ハードネス ストライク",
      "リバーサル エナジー",
      "フォース プロヴォーク"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-evi",
    "code": "EVI",
    "name": "イビルナイト / デスナイト / ヘルナイト",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "イビルナイト",
        "en": "Evil Knight"
      },
      {
        "min": 70,
        "name": "デスナイト",
        "en": "Death Knight"
      },
      {
        "min": 90,
        "name": "ヘルナイト",
        "en": "Hell Knight"
      }
    ],
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40
      },
      {
        "skill": "牙",
        "min": 40
      },
      {
        "skill": "死の魔法",
        "min": 40
      }
    ],
    "effect": "死の魔法の詠唱スピードが速くなる\n死の魔法の詠唱時間・ディレイ6％短縮",
    "shipEquipment": "イビルナイトへの実験",
    "acquisition": "【夕闇】への実験",
    "transfer": "○",
    "prerequisiteTechniques": [
      "ダークネス フォース",
      "ライフ ドレイン",
      "ネガティブ バースト",
      "ダーク ディメンション",
      "残夜の黒翼",
      "カラミティ フォース",
      "ブラッド カーニバル"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-cos",
    "code": "COS",
    "name": "コスプレイヤー / コスプレヒーロー / コスプレヒロイン / ヒーロー / ヒロイン",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "コスプレイヤー",
        "en": "Cos Player"
      },
      {
        "min": 70,
        "name": "コスプレヒーロー / コスプレヒロイン",
        "en": "Cos Play Hero / Cos Play Heroine"
      },
      {
        "min": 90,
        "name": "ヒーロー / ヒロイン",
        "en": "Hero / Heroine"
      }
    ],
    "requirements": [
      {
        "skill": "装飾細工",
        "min": 40
      },
      {
        "skill": "裁縫",
        "min": 40
      },
      {
        "skill": "着こなし",
        "min": 40
      },
      {
        "skill": "物まね",
        "min": 40
      },
      {
        "skill": "攻撃回避",
        "min": 40
      },
      {
        "skill": "パフォーマンス",
        "min": 40
      }
    ],
    "effect": "全てのシップ専用アイテムが装備できる\n詳しくは\n下記\n参照",
    "shipEquipment": "未実装",
    "acquisition": "【織り手】への課題\nウォーター ウンディーネ\nステンノ　忍者　宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "フィニッシング エンド スパーク",
      "ファイナル アルティメット ヒーロー ビーム"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-dab",
    "code": "DAB",
    "name": "物好き / ネタ師変人 / 神ネタ師",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "物好き",
        "en": "Dabster"
      },
      {
        "min": 70,
        "name": "ネタ師変人",
        "en": "Spooky"
      },
      {
        "min": 90,
        "name": "神ネタ師",
        "en": "Spooky Lord"
      }
    ],
    "requirements": [
      {
        "skill": "水泳",
        "min": 40
      },
      {
        "skill": "収穫",
        "min": 40
      },
      {
        "skill": "酩酊",
        "min": 40
      },
      {
        "skill": "落下耐性",
        "min": 40
      },
      {
        "skill": "パフォーマンス",
        "min": 40
      }
    ],
    "effect": "移動と待機モーションが、傷ついた戦士のモーションに変わる\n（男性限定）\n、移動できない技も移動しながら使用できる\n210525パッチ\nにて常時SoWが追加。\n女性キャラでも効果あり",
    "shipEquipment": "未実装",
    "acquisition": "ウォーター ウンディーネ\nThe Legend of Duelist\nステンノ　忍者　宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ウォーター アート"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-ath",
    "code": "ATH",
    "name": "アスリート / トライアスリート / 鉄人",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "アスリート",
        "en": "Athlete"
      },
      {
        "min": 70,
        "name": "トライアスリート",
        "en": "Triathlete"
      },
      {
        "min": 90,
        "name": "鉄人",
        "en": "Ironman"
      }
    ],
    "requirements": [
      {
        "skill": "落下耐性",
        "min": 40
      },
      {
        "skill": "水泳",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      }
    ],
    "effect": "自然スタミナ回復速度が速くなる\n秒間0.83回復(1分で50相当)",
    "shipEquipment": "走れ、金メダルへの道",
    "acquisition": "【新緑の木】への一矢\nウォーター ウンディーネ\nThe Legend of Duelist\nステンノ　宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "エア ジャンプ",
      "ハイパー ジャンプ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-dkf",
    "code": "DKF",
    "name": "酔拳士 / 酔拳マスター / 酔拳聖",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "酔拳士",
        "en": "Drunken Fighter"
      },
      {
        "min": 70,
        "name": "酔拳マスター",
        "en": "Drunken Master"
      },
      {
        "min": 90,
        "name": "酔拳聖",
        "en": "Drunken Lord"
      }
    ],
    "requirements": [
      {
        "skill": "素手",
        "min": 40
      },
      {
        "skill": "キック",
        "min": 40
      },
      {
        "skill": "酩酊",
        "min": 40
      },
      {
        "skill": "攻撃回避",
        "min": 40
      },
      {
        "skill": "持久力",
        "min": 40
      }
    ],
    "effect": "(通常)回避が上昇し、待機状態\nと戦闘体勢\nが酔いモーションに変わる\n(酔歩)回避が上昇し、待機状態と移動が酔いモーションに変わる\n回避+3",
    "shipEquipment": "酒の力で敵を討て\n宝箱",
    "acquisition": "ウォーター ウンディーネ\nThe Legend of Duelist\nメモリーズ ボックス(酔歩)\n*1",
    "transfer": "×",
    "prerequisiteTechniques": [
      "酔避連撃",
      "練気弾",
      "オーラ ナックル",
      "飛燕脚"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-row",
    "code": "ROW",
    "name": "荒くれ者 / レスラー / チャンピオン",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "荒くれ者",
        "en": "Rowdy"
      },
      {
        "min": 70,
        "name": "レスラー",
        "en": "Wrestler"
      },
      {
        "min": 90,
        "name": "チャンピオン",
        "en": "Champion"
      }
    ],
    "requirements": [
      {
        "skill": "素手",
        "min": 40
      },
      {
        "skill": "キック",
        "min": 40
      },
      {
        "skill": "落下耐性",
        "min": 40
      },
      {
        "skill": "生命力",
        "min": 40
      },
      {
        "skill": "パフォーマンス",
        "min": 40
      }
    ],
    "effect": "ヒット・ポイント(HP)の回復速度が速くなる\n秒間0.66回復(1分で40相当)",
    "shipEquipment": "荒くれし者よ イチバンを目指せ",
    "acquisition": "【鉄刀】への挑戦\nウォーター ウンディーネ\nステンノ\nダイアロス チャンピオン",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ギャラクシー ダイナマイト キック",
      "フィニッシング エンド",
      "ファンタスティック ボディ",
      "バックハンド チョップ",
      "オーラ ナックル",
      "毒霧",
      "フライング ボディプレス",
      "ジャンピング ヒップ アタック",
      "飛燕脚",
      "酔拳"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-idl",
    "code": "IDL",
    "name": "新人アイドル / ビスクアイドル / ダイアロスアイドル",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "新人アイドル",
        "en": "New Idol"
      },
      {
        "min": 70,
        "name": "ビスクアイドル",
        "en": "Bisque Idol"
      },
      {
        "min": 90,
        "name": "ダイアロスアイドル",
        "en": "Diaros Idol"
      }
    ],
    "requirements": [
      {
        "skill": "ダンス",
        "min": 40
      },
      {
        "skill": "音楽",
        "min": 40
      },
      {
        "skill": "水泳",
        "min": 40
      },
      {
        "skill": "パフォーマンス",
        "min": 40
      }
    ],
    "effect": "体の周りがキラキラ輝く\nオールドアイドルの場合、常時インヴィジビリティ詠唱エフェクトが発生",
    "shipEquipment": "君だけの、アイドル衣装！",
    "acquisition": "【フレッシュアイドル】への道\nウォーター ウンディーネ\nステンノ　宝箱\n複製(オールド)\n*2",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ライブ ステージ",
      "ファッシネイト キッス",
      "スモーク マシーン"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-hou",
    "code": "HOU",
    "name": "ハウスキーパー / メイド(お手伝い) / バレット(従者) / アビゲイル(侍女) / バトラー(執事)",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ハウスキーパー",
        "en": "House Keeper"
      },
      {
        "min": 70,
        "name": "メイド(お手伝い) / バレット(従者)",
        "en": "Maid / Valet"
      },
      {
        "min": 90,
        "name": "アビゲイル(侍女) / バトラー(執事)",
        "en": "Abigail / Butler"
      }
    ],
    "requirements": [
      {
        "skill": "料理",
        "min": 40
      },
      {
        "skill": "裁縫",
        "min": 40
      },
      {
        "skill": "美容",
        "min": 40
      }
    ],
    "effect": "裁縫合成の成功率が上昇\n裁縫の滑り減少、ヒットゾーン+5",
    "shipEquipment": "仕える心は、[ハウスキーパー]の証",
    "acquisition": "ウォーター ウンディーネ\nステンノ\n忍者\n宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "エリア クリーニング"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-adv",
    "code": "ADV",
    "name": "アドベンチャラー / エクスプローラー / トレジャーハンター",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "アドベンチャラー",
        "en": "Adventurer"
      },
      {
        "min": 70,
        "name": "エクスプローラー",
        "en": "Explorer"
      },
      {
        "min": 90,
        "name": "トレジャーハンター",
        "en": "Treasure Hunter"
      }
    ],
    "requirements": [
      {
        "skill": "落下耐性",
        "min": 40
      },
      {
        "skill": "水泳",
        "min": 40
      },
      {
        "skill": "採掘",
        "min": 40
      },
      {
        "skill": "解読",
        "min": 40
      },
      {
        "skill": "盗み",
        "min": 40
      }
    ],
    "effect": "水中移動速度が上昇し 落下ダメージが軽減される\n泳ぎ速度+6、落下ダメージ-10％",
    "shipEquipment": "未実装",
    "acquisition": "ウォーター ウンディーネ\n忍者\n宝箱",
    "transfer": "",
    "prerequisiteTechniques": [
      "タイダウン ローピング",
      "シークレット シーフ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-spy",
    "code": "SPY",
    "name": "スパイ / ストーカー / ステルス",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "スパイ",
        "en": "Spy"
      },
      {
        "min": 70,
        "name": "ストーカー",
        "en": "Stalker"
      },
      {
        "min": 90,
        "name": "ステルス",
        "en": "Stealth"
      }
    ],
    "requirements": [
      {
        "skill": "物まね",
        "min": 40
      },
      {
        "skill": "投げ",
        "min": 40
      },
      {
        "skill": "盗み",
        "min": 40
      }
    ],
    "effect": "盗み確率が上昇する",
    "shipEquipment": "未実装",
    "acquisition": "ウォーター ウンディーネ\n忍者\n宝箱",
    "transfer": "",
    "prerequisiteTechniques": [
      "シークレット シーフ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-yan",
    "code": "YAN",
    "name": "レディース / チンピラ / アウトロー / ギャング",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "レディース / チンピラ",
        "en": "Ladies' / Punk"
      },
      {
        "min": 70,
        "name": "アウトロー",
        "en": "Outlaw"
      },
      {
        "min": 90,
        "name": "ギャング",
        "en": "Gang"
      }
    ],
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 40
      },
      {
        "skill": "取引",
        "min": 40
      },
      {
        "skill": "盗み",
        "min": 40
      },
      {
        "skill": "酩酊",
        "min": 40
      }
    ],
    "effect": "棍棒武器を振る時のディレイが短くなる\nディレイ5％短縮",
    "shipEquipment": "未実装",
    "acquisition": "ウォーター ウンディーネ\n忍者\n宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ヤンキー ウェイ",
      "グレア アイ",
      "リコール アンダーリング"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-tea",
    "code": "TEA",
    "name": "アカデミアン / ティーチャー / プロフェッサー",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "アカデミアン",
        "en": "Academian"
      },
      {
        "min": 70,
        "name": "ティーチャー",
        "en": "Teacher"
      },
      {
        "min": 90,
        "name": "プロフェッサー",
        "en": "Professor"
      }
    ],
    "requirements": [
      {
        "skill": "解読",
        "min": 40
      },
      {
        "skill": "複製",
        "min": 40
      },
      {
        "skill": "集中力",
        "min": 40
      },
      {
        "skill": "神秘魔法",
        "min": 40
      },
      {
        "skill": "精神力",
        "min": 40
      }
    ],
    "effect": "複製スキルの合成成功率が上昇する\n複製ヒットゾーン+5、グレードゾーン+1",
    "shipEquipment": "未実装",
    "acquisition": "ウォーター ウンディーネ\n御庭番\nステンノ　宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "未実装"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-bbd",
    "code": "BBD",
    "name": "ブラッドバード / ドレッドバード / カオスバード",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ブラッドバード",
        "en": "Blood Bard"
      },
      {
        "min": 70,
        "name": "ドレッドバード",
        "en": "Dread Bard"
      },
      {
        "min": 90,
        "name": "カオスバード",
        "en": "Chaos Bard"
      }
    ],
    "requirements": [
      {
        "skill": "持久力",
        "min": 40
      },
      {
        "skill": "牙",
        "min": 40
      },
      {
        "skill": "音楽",
        "min": 40
      }
    ],
    "effect": "音楽スキル・シャウトスキルの詠唱速度が上昇する\n音楽スキルの効果が上昇し、シャウトスキルの詠唱速度が短縮される\nシャウトのみ詠唱時間5％短縮・ディレイ5％短縮\n音楽は短縮されない\n210525パッチ\nにて効果の出ていなかった音楽短縮を廃止し、音楽効果アップ+？に変更",
    "shipEquipment": "未実装",
    "acquisition": "【スイートアイドル】への道\nウォーター ウンディーネ\nピクシー シャドウ\n宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ヴァンパイア ノクターン",
      "リコール オーディエンス"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-due",
    "code": "DUE",
    "name": "デュエリスト / レガトゥス / タイラント",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "デュエリスト",
        "en": "Duelist"
      },
      {
        "min": 70,
        "name": "レガトゥス",
        "en": "Legatus"
      },
      {
        "min": 90,
        "name": "タイラント",
        "en": "Tyrant"
      }
    ],
    "requirements": [
      {
        "skill": "槍",
        "min": 40
      },
      {
        "skill": "筋力",
        "min": 40
      },
      {
        "skill": "着こなし",
        "min": 40
      }
    ],
    "effect": "攻撃力が上昇する\n攻撃力+3",
    "shipEquipment": "闘う覚悟 己の力で成し遂げよ",
    "acquisition": "ウォーター ウンディーネ\n宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "モラール ブースター",
      "ブレイン ブレイカー",
      "ガード レイジ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-col",
    "code": "COL",
    "name": "コレクター / コレクト マスター / 採集王",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "コレクター",
        "en": "Collector"
      },
      {
        "min": 70,
        "name": "コレクト マスター",
        "en": "???"
      },
      {
        "min": 90,
        "name": "採集王",
        "en": "???"
      }
    ],
    "requirements": [
      {
        "skill": "採掘",
        "min": 40
      },
      {
        "skill": "伐採",
        "min": 40
      },
      {
        "skill": "収穫",
        "min": 40
      },
      {
        "skill": "釣り",
        "min": 40
      }
    ],
    "effect": "スタミナの最大値と最大重量が増加する\n最大スタミナ+10、最大重量+10",
    "shipEquipment": "未実装",
    "acquisition": "宝箱",
    "transfer": "？",
    "prerequisiteTechniques": [
      "未実装"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-elm",
    "code": "ELM",
    "name": "エレメンタルナイト / エレメンタルマスター / エレメンタルロード",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "エレメンタルナイト",
        "en": "Elemental Knight"
      },
      {
        "min": 70,
        "name": "エレメンタルマスター",
        "en": "???"
      },
      {
        "min": 90,
        "name": "エレメンタルロード",
        "en": "???"
      }
    ],
    "requirements": [
      {
        "skill": "槍",
        "min": 40
      },
      {
        "skill": "強化魔法",
        "min": 40
      },
      {
        "skill": "召喚魔法",
        "min": 40
      },
      {
        "skill": "攻撃回避",
        "min": 40
      }
    ],
    "effect": "耐火・水・風・地属性が上昇する\n各属性抵抗+10",
    "shipEquipment": "未実装",
    "acquisition": "ヘントリ",
    "transfer": "？",
    "prerequisiteTechniques": [
      "リコール マーシー ライトⅡ",
      "セルフ ブローバック",
      "リコール ユナイト エレメンタル",
      "ファイア エレメンタル バレット",
      "アクア エレメンタル バレット",
      "ウインド エレメンタル バレット",
      "アース エレメンタル バレット",
      "フォース シールド",
      "エレメント シールド",
      "シュートアロー"
    ],
    "source": "MoERead シップ/複合"
  }
];

function skillKnowledgeData() {
  const src = (typeof window !== "undefined" && window.MOE_SKILL_SIM_KNOWLEDGE) || {};
  const fallbackMasteries = Array.isArray(SKILL_KNOWLEDGE_FALLBACK_MASTERIES) ? SKILL_KNOWLEDGE_FALLBACK_MASTERIES : [];
  const masteries = Array.isArray(src.masteries) && src.masteries.length ? src.masteries : fallbackMasteries;
  return {
    masteries,
    techniques: Array.isArray(src.techniques) ? src.techniques : [],
    magic: Array.isArray(src.magic) ? src.magic : [],
    source: src.source || {masteries: "内蔵フォールバック"}
  };
}

function skillKnowledgeCurrentValue(skill) {
  return skillSimValue(skill);
}

function skillKnowledgeRequirementText(req) {
  const skill = req.skill || req.name || "条件";
  if (req.max !== undefined && req.min !== undefined) return `${skill} ${fmt(req.min, 1)}〜${fmt(req.max, 1)}`;
  if (req.max !== undefined) return `${skill} ${fmt(req.max, 1)}以下`;
  return `${skill} ${fmt(req.min || req.required || 0, 1)}以上`;
}

function skillKnowledgeEvaluateRequirement(req) {
  const skill = req.skill || req.name || "";
  const current = skillKnowledgeCurrentValue(skill);
  const min = req.min !== undefined ? +req.min : +(req.required || 0);
  const max = req.max !== undefined ? +req.max : null;
  let ok = true;
  let shortage = 0;
  if (Number.isFinite(min) && min > 0 && current < min) {
    ok = false;
    shortage = Math.max(shortage, min - current);
  }
  if (max !== null && Number.isFinite(max) && current > max) {
    ok = false;
    shortage = Math.max(shortage, current - max);
  }
  return {skill, current, min, max, ok, shortage};
}

function skillKnowledgeMasteryTierInfo(item) {
  const tiers = Array.isArray(item.tiers) ? item.tiers.slice().sort((a,b) => (+a.min || 0) - (+b.min || 0)) : [];
  if (!tiers.length) return null;

  const reqSkills = (item.requirements || []).map(r => r.skill || r.name).filter(Boolean);
  const achieved = tiers.filter(tier =>
    reqSkills.every(skill => skillKnowledgeCurrentValue(skill) >= (+tier.min || 0))
  ).slice(-1)[0] || null;

  const next = tiers.find(tier =>
    !reqSkills.every(skill => skillKnowledgeCurrentValue(skill) >= (+tier.min || 0))
  ) || null;

  let nextShortage = 0;
  let nextEvaluated = [];
  if (next) {
    nextEvaluated = reqSkills.map(skill => {
      const current = skillKnowledgeCurrentValue(skill);
      const min = +next.min || 0;
      return {skill, current, min, shortage: Math.max(0, min - current), ok: current >= min};
    });
    nextShortage = nextEvaluated.reduce((s, r) => s + r.shortage, 0);
  }

  return {tiers, achieved, next, nextShortage, nextEvaluated};
}

function skillKnowledgeEvaluate(item) {
  const reqs = Array.isArray(item.requirements) ? item.requirements : [];
  const evaluated = reqs.map(skillKnowledgeEvaluateRequirement);
  const missing = evaluated.filter(r => !r.ok);
  const totalShortage = missing.reduce((s, r) => s + (+r.shortage || 0), 0);
  let available = missing.length === 0;

  const tierInfo = skillKnowledgeMasteryTierInfo(item);
  if (tierInfo) {
    available = !!tierInfo.achieved;
  }

  let success = null;
  if (item.successSkill || item.successRequired) {
    const skill = item.successSkill || (reqs[0]?.skill || "");
    const current = skillKnowledgeCurrentValue(skill);
    const required = Math.max(0.000001, +(item.successRequired || reqs[0]?.min || reqs[0]?.required || 0));
    const rate = required <= 0 ? 100 : Math.max(0, Math.min(100, (current / required) * 100));
    success = {skill, current, required, rate, estimated:true};
  }

  let status = available ? "available" : (totalShortage <= 10 ? "near" : "missing");
  if (tierInfo && !tierInfo.achieved && tierInfo.nextShortage <= 10) status = "near";

  return {item, evaluated, missing, totalShortage, available, success, status, tierInfo};
}

function skillKnowledgeCategories() {
  const data = skillKnowledgeData();
  const cats = new Set(["all"]);
  [...data.masteries, ...data.techniques, ...data.magic].forEach(x => {
    if (x.category) cats.add(x.category);
  });
  return Array.from(cats);
}

function setupSkillKnowledgeControls() {
  const cat = byId("skillKnowledgeCategory");
  if (cat) {
    const categories = skillKnowledgeCategories();
    const key = categories.join("|");
    if (cat.dataset.categoryKey !== key) {
      const current = cat.value || "all";
      cat.innerHTML = categories.map(c => `<option value="${escapeHtml(c)}">${c === "all" ? "全カテゴリ" : escapeHtml(c)}</option>`).join("");
      cat.value = categories.includes(current) ? current : "all";
      cat.dataset.categoryKey = key;
    }
  }

  ["skillKnowledgeSearch", "skillKnowledgeCategory", "skillKnowledgeStatus"].forEach(id => {
    const el = byId(id);
    if (!el || el.dataset.skillKnowledgeReady === "1") return;
    el.addEventListener(id === "skillKnowledgeSearch" ? "input" : "change", renderSkillKnowledge);
    el.dataset.skillKnowledgeReady = "1";
  });
}

function clearSkillKnowledgeFilters() {
  if (byId("skillKnowledgeSearch")) byId("skillKnowledgeSearch").value = "";
  if (byId("skillKnowledgeCategory")) byId("skillKnowledgeCategory").value = "all";
  if (byId("skillKnowledgeStatus")) byId("skillKnowledgeStatus").value = "all";
  renderSkillKnowledge();
}


function skillKnowledgeFindMastery(id) {
  const data = skillKnowledgeData();
  return (data.masteries || []).find(x => String(x.id) === String(id)) || null;
}

function applySkillKnowledgeMasteryTier(id, minValue) {
  const item = skillKnowledgeFindMastery(id);
  if (!item) {
    alert("マスタリーデータが見つかりません。");
    return;
  }

  const value = Math.max(0, Math.min(100, parseFloat(minValue) || 0));
  state.skillSim = normalizeSkillSim(state.skillSim);
  const reqs = Array.isArray(item.requirements) ? item.requirements : [];
  reqs.forEach(req => {
    const skill = req.skill || req.name;
    if (!skill) return;
    state.skillSim.skills[skill] = Math.max(+(state.skillSim.skills[skill] || 0), value);
  });

  renderSkillSim();
  syncSkillSimToCalcInputs(false, false);
  calc();
}

function skillKnowledgeMasteryTierButtons(item) {
  if (!Array.isArray(item.tiers) || !item.tiers.length) return "";
  const buttons = item.tiers.map((tier, idx) => {
    const label = idx === 0 ? "1次" : idx === 1 ? "2次" : idx === 2 ? "3次" : `${idx + 1}段階`;
    const title = `${label}: ${tier.name || ""} (${tier.min || 0}〜)`;
    return `<button type="button" class="skillKnowledgeTierButton" onclick="applySkillKnowledgeMasteryTier('${escapeHtml(String(item.id || ""))}', ${+tier.min || 0})">${escapeHtml(title)}</button>`;
  }).join("");
  return `<div class="skillKnowledgeTierButtons">${buttons}</div>`;
}


function skillKnowledgeFilterState() {
  return {
    text: (byId("skillKnowledgeSearch")?.value || "").trim().toLowerCase(),
    category: byId("skillKnowledgeCategory")?.value || "all",
    status: byId("skillKnowledgeStatus")?.value || "all"
  };
}

function skillKnowledgeSearchText(ev) {
  const item = ev.item || {};
  return [
    item.name, item.category, item.kind, item.note, item.reagent,
    ...(Array.isArray(item.requirements) ? item.requirements.map(skillKnowledgeRequirementText) : [])
  ].filter(Boolean).join(" ").toLowerCase();
}

function skillKnowledgeMatches(ev, filter) {
  const item = ev.item || {};
  if (filter.category !== "all" && item.category !== filter.category) return false;
  if (filter.status !== "all" && ev.status !== filter.status) return false;
  if (filter.text) {
    const terms = filter.text.split(/\s+/).filter(Boolean);
    const hay = skillKnowledgeSearchText(ev);
    if (!terms.every(t => hay.includes(t))) return false;
  }
  return true;
}

function skillKnowledgeStatusLabel(status) {
  return status === "available" ? "OK" : status === "near" ? "あと少し" : "不足";
}

function skillKnowledgeStatusClass(status) {
  return status === "available" ? "ok" : status === "near" ? "warn" : "bad";
}

function skillKnowledgeItemHtml(ev, type) {
  const item = ev.item || {};
  const reqText = ev.evaluated.length
    ? ev.evaluated.map(r => `${escapeHtml(r.skill)} ${fmt(r.current, 1)}/${r.max !== null ? "≤" + fmt(r.max, 1) : fmt(r.min, 1)}`).join(" / ")
    : "条件なし";

  const success = ev.success
    ? `<div class="skillKnowledgeSuccess">成功率${ev.success.estimated ? "（推定）" : ""}: ${fmt(ev.success.rate, 1)}% <span class="mutedText">(${escapeHtml(ev.success.skill)} ${fmt(ev.success.current, 1)}/${fmt(ev.success.required, 1)})</span></div>`
    : "";

  const tierInfo = ev.tierInfo;
  let tierHtml = "";
  if (tierInfo) {
    if (tierInfo.achieved) {
      const nextText = tierInfo.next
        ? ` / 次: ${escapeHtml(tierInfo.next.name || "")}`
        : " / 最高ランク";
      tierHtml = `<div class="skillKnowledgeTier">発動: <b>${escapeHtml(tierInfo.achieved.name || "")}</b> (${fmt(tierInfo.achieved.min, 0)}〜)${nextText}</div>`;
    } else if (tierInfo.next) {
      tierHtml = `<div class="skillKnowledgeTier">未発動: ${escapeHtml(tierInfo.next.name || "")}</div>`;
    }
  }

  const tierButtons = item.kind === "マスタリー" ? skillKnowledgeMasteryTierButtons(item) : "";

  const extra = [];
  if (item.mp !== undefined) extra.push(`MP ${item.mp}`);
  if (item.reagent) extra.push(`触媒 ${item.reagent}`);
  if (item.effect) extra.push(String(item.effect).replace(/\n+/g, " / "));
  const extraHtml = extra.length ? `<div class="skillKnowledgeExtra">${escapeHtml(extra.join(" / "))}</div>` : "";
  const prereq = Array.isArray(item.prerequisiteTechniques) && item.prerequisiteTechniques.length
    ? `<div class="skillKnowledgeNote">前提テク: ${escapeHtml(item.prerequisiteTechniques.join(" / "))}</div>`
    : "";
  const note = item.note ? `<div class="skillKnowledgeNote">${escapeHtml(item.note)}</div>` : "";

  return `<article class="skillKnowledgeItem ${skillKnowledgeStatusClass(ev.status)}">
    <div class="skillKnowledgeItemHeader">
      <b>${escapeHtml(item.name || "名称未入力")}</b>
      <span>${skillKnowledgeStatusLabel(ev.status)}</span>
    </div>
    <div class="skillKnowledgeMeta">${escapeHtml(item.category || type)} / ${escapeHtml(item.kind || type)}${item.code ? ` / ${escapeHtml(item.code)}` : ""}</div>
    ${tierHtml}
    ${tierButtons}
    <div class="skillKnowledgeReq">${reqText}</div>
    ${success}
    ${extraHtml}
    ${prereq}
    ${note}
  </article>`;
}

function renderSkillKnowledge() {
  if (!byId("skillMasteryList")) return;
  setupSkillKnowledgeControls();
  const data = skillKnowledgeData();
  const filter = skillKnowledgeFilterState();

  const groups = [
    ["masteries", "マスタリー", "skillMasteryList"],
    ["techniques", "テクニック", "skillTechniqueList"],
    ["magic", "魔法", "skillMagicList"]
  ];

  let total = 0;
  let shown = 0;
  let okCount = 0;

  groups.forEach(([key, label, id]) => {
    const evaluated = (data[key] || []).map(skillKnowledgeEvaluate);
    total += evaluated.length;
    okCount += evaluated.filter(x => x.available).length;
    const visible = evaluated.filter(ev => skillKnowledgeMatches(ev, filter));
    shown += visible.length;

    let html = visible.length
      ? visible.map(ev => skillKnowledgeItemHtml(ev, label)).join("")
      : `<p class="small">該当なし</p>`;

    if (key === "masteries" && (data.masteries || []).length < 30) {
      html = `<div class="warn">マスタリーデータが ${(data.masteries || []).length}件しか読み込めていません。v1.20.6のindex.html/main.jsが反映されているか、ブラウザキャッシュを確認してください。</div>` + html;
    }

    const countId = key === "masteries" ? "skillMasteryCount" : key === "techniques" ? "skillTechniqueCount" : "skillMagicCount";
    if (byId(countId)) byId(countId).textContent = `${visible.length}/${evaluated.length}`;
    byId(id).innerHTML = html;
  });

  const summary = byId("skillKnowledgeSummary");
  if (summary) {
    const dataSource = data.source?.masteries || "不明";
    const usingFallback = dataSource === "内蔵フォールバック";
    const sampleNote = `<span class="skillKnowledgeSampleNote">${usingFallback ? "内蔵マスタリー使用" : "マスタリー実データ"} / テク・魔法はサンプル</span>`;
    summary.innerHTML = `${shown}/${total}件表示 / 使用可能 ${okCount}件 ${sampleNote}<br><span class="small mutedText">Build v1.20.6 / マスタリー ${data.masteries.length}件 / テク ${data.techniques.length}件 / 魔法 ${data.magic.length}件 / ソース: ${escapeHtml(dataSource)}</span>`;
  }
}



function setSkillSimSkillValue(skill, value) {
  state.skillSim = normalizeSkillSim(state.skillSim);
  if (!SKILL_SIM_ALL.includes(skill)) return;
  const v = Math.max(0, Math.min(100, Math.round((parseFloat(value) || 0) * 10) / 10));
  state.skillSim.skills[skill] = v;
}

function makeSkillBarRow(skill) {
  const row = document.createElement("div");
  row.className = "skillBarRow";

  const name = document.createElement("div");
  name.className = "skillBarName";
  name.textContent = skill;
  row.appendChild(name);

  const barWrap = document.createElement("div");
  barWrap.className = "skillBarWrap";

  const range = makeCell("input", {
    type: "range",
    min: "0",
    max: "100",
    step: "0.1",
    value: state.skillSim.skills[skill] ?? 0
  });
  range.className = "skillBarRange";
  range.title = "ドラッグで変更。クリックでもその位置へ変更できます。";

  const fill = document.createElement("div");
  fill.className = "skillBarFill";

  const value = makeCell("input", {
    type: "number",
    min: "0",
    max: "100",
    step: "0.1",
    value: state.skillSim.skills[skill] ?? 0
  });
  value.className = "skillBarValue";
  value.title = "クリックして直接入力できます。";

  const updateVisual = () => {
    const v = Math.max(0, Math.min(100, parseFloat(value.value) || 0));
    fill.style.width = `${v}%`;
    range.value = String(v);
    value.value = fmt(v, 1);
  };

  const apply = v => {
    setSkillSimSkillValue(skill, v);
    const next = state.skillSim.skills[skill] ?? 0;
    range.value = String(next);
    value.value = fmt(next, 1);
    fill.style.width = `${next}%`;
    handleSkillSimChanged();
  };

  range.oninput = () => apply(range.value);
  value.oninput = () => apply(value.value);

  // ホイール操作。Shift中は0.1、通常は1.0刻み。
  row.addEventListener("wheel", e => {
    if (document.activeElement && ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName) && document.activeElement !== value && document.activeElement !== range) return;
    e.preventDefault();
    const step = e.shiftKey ? 0.1 : 1;
    const dir = e.deltaY < 0 ? step : -step;
    apply((state.skillSim.skills[skill] || 0) + dir);
  }, {passive:false});

  barWrap.appendChild(fill);
  barWrap.appendChild(range);
  row.appendChild(barWrap);
  row.appendChild(value);

  updateVisual();
  return row;
}


function renderSkillSim() {
  if (!state.skillSim) state.skillSim = defaultSkillSimState();
  state.skillSim = normalizeSkillSim(state.skillSim);

  const name = byId("skillSimName");
  if (!name) return;

  name.value = state.skillSim.name || "";
  name.oninput = e => {
    state.skillSim.name = e.target.value;
    handleSkillSimChanged();
  };

  const race = byId("skillSimRace");
  race.value = state.skillSim.race || "newtar";
  race.onchange = e => {
    state.skillSim.race = e.target.value;
    handleSkillSimChanged();
  };

  const cap = byId("skillSimCap");
  cap.value = state.skillSim.cap ?? 850;
  cap.oninput = e => {
    state.skillSim.cap = parseFloat(e.target.value) || 850;
    handleSkillSimChanged();
  };

  const weapon = byId("skillSimWeaponSkill");
  weapon.innerHTML = SKILL_SIM_WEAPON.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join("");
  weapon.value = state.skillSim.weaponSkill || "こんぼう";
  weapon.onchange = e => {
    state.skillSim.weaponSkill = e.target.value;
    handleSkillSimChanged();
  };

  const autoApply = byId("skillSimAutoApply");
  if (autoApply) {
    autoApply.checked = state.skillSim.autoApply !== false;
    autoApply.onchange = e => {
      state.skillSim.autoApply = !!e.target.checked;
      if (state.skillSim.autoApply) syncSkillSimToCalcInputs(true, false);
      updateSkillSimSummary();
      calc();
    };
  }

  const root = byId("skillSimGroups");
  root.innerHTML = "";
  SKILL_SIM_GROUPS.forEach(([group, list]) => {
    const box = document.createElement("section");
    box.className = "skillSimGroup skillSimGroupBar";
    const h = document.createElement("h3");
    h.textContent = group;
    box.appendChild(h);

    const grid = document.createElement("div");
    grid.className = "skillSimBarGrid";
    list.forEach(skill => {
      grid.appendChild(makeSkillBarRow(skill));
    });
    box.appendChild(grid);
    root.appendChild(box);
  });

  setupSkillKnowledgeControls();
  updateSkillSimSummary();
}

function updateSkillSimSummary() {
  if (!byId("skillSimTotal")) return;
  const d = skillSimDerived();

  byId("skillSimTotal").textContent = fmt(d.total, 1);
  byId("skillSimRemain").innerHTML = d.remain < 0
    ? `<span class="bad">超過 ${fmt(Math.abs(d.remain), 1)}</span>`
    : `残り ${fmt(d.remain, 1)}`;

  byId("skillSimMainStats").innerHTML = [
    ["HP", d.hp], ["MP", d.mp], ["ST", d.st], ["重量", d.weight]
  ].map(([k,v]) => `<div><span>${k}</span><b>${fmt(v, 1)}</b></div>`).join("");

  byId("skillSimBattleStats").innerHTML = [
    ["攻撃力", d.atk], ["防御力", d.def], ["命中", d.hit],
    ["回避", d.avoid], ["魔力", d.magic], ["呪文抵抗", d.resist]
  ].map(([k,v]) => `<div><span>${k}</span><b>${fmt(v, 1)}</b></div>`).join("");

  const raceLabel = byId("skillSimRace")?.selectedOptions?.[0]?.textContent || "";
  byId("skillSimApplyPreview").innerHTML = [
    `種族 → ${escapeHtml(raceLabel)}`,
    `筋力 → ${fmt(skillSimValue("筋力"), 1)}`,
    `精神力 → ${fmt(skillSimValue("精神力"), 1)}`,
    `酩酊度 → ${fmt(d.drunk, 1)}`,
    `${escapeHtml(state.skillSim.weaponSkill)} → 武器使用条件 ${fmt(d.weapon, 1)}`,
    `自動反映 → ${state.skillSim.autoApply === false ? "OFF" : "ON"}`
  ].map(x => `<div>${x}</div>`).join("");

  renderSkillKnowledge();
}

function applySkillSimToCalc(silent=false) {
  syncSkillSimToCalcInputs(true, true);

  renderWeaponReqTable();
  syncRaceCoeff();
  syncBaseMagic();
  calc();
  if (!silent) alert("スキルシミュレータの値を計算タブへ反映しました。");
}

function resetSkillSim() {
  if (!confirm("スキルシミュレータの入力値をリセットしますか？")) return;
  state.skillSim = defaultSkillSimState();
  renderSkillSim();
  syncSkillSimToCalcInputs(true, false);
  calc();
}


const DEFAULT_STATE = () => ({
  weaponReq: [
    {name: "武器スキル", current: 0, required: 0}
  ],
  composite: [],
  pct: [],
  skillSim: defaultSkillSimState(),
  equipment: defaultEquipmentRows(),
  flat: [],
  conv: [],
  dmg: [],
  special: [],
  post: [],
  other: []
});

/* 現在編集中の構成。localStorageやTSV/JSONから復元される。 */
let state = DEFAULT_STATE();
let snapshots = {A: null, B: null};
let namedPresets = {};
const NAMED_PRESET_KEY = "moeDamageNamedPresetsV1";

/* JSON化できる単純なstate/config用のディープコピー。 */
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
/* document.getElementByIdの短縮。画面要素取得を読みやすくするための小物。 */
function byId(id) { return document.getElementById(id); }
/* number inputから数値を読む。空欄や不正値は0扱い。 */
function num(id) {
  const v = parseFloat(byId(id).value);
  return Number.isFinite(v) ? v : 0;
}
/* 表示用数値フォーマット。計算値そのものは丸めない。 */
function fmt(n, digits=3) {
  if (!Number.isFinite(n)) return "-";
  return Number(n).toLocaleString(undefined, {maximumFractionDigits: digits, minimumFractionDigits: 0});
}
/* 比率をパーセント文字列に変換する表示用関数。 */
function pct(n) {
  if (!Number.isFinite(n)) return "-";
  return (n * 100).toFixed(2) + "%";
}
/* ユーザー入力文字列をHTMLに差し込む前の最低限のエスケープ。 */
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}
/**
 * DOM要素生成ヘルパー。
 * テーブル描画関数内で input/select/button を大量に作るため、記述量を減らしている。
 */
function makeCell(tag, attrs={}, text="") {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === "class") el.className = v;
    else if (k === "type") el.type = v;
    else if (k === "checked") el.checked = !!v;
    else if (k === "value") el.value = v;
    else if (k === "step") el.step = v;
    else if (k === "readonly") el.readOnly = !!v;
    else el.setAttribute(k,v);
  });
  if (text !== "") el.textContent = text;
  return el;
}
/**
 * 装備以外Buff行を安全な形へ正規化する。
 * 空欄や古い保存データで列が欠けていても、計算側がNaNにならないようにする。
 */

/**
 * 空の表に「まだ行がありません」メッセージを出す。
 * colSpanは対象テーブルの列数に合わせる。
 */
function renderEmptyRow(tbody, colSpan, message) {
  const tr = document.createElement("tr");
  tr.className = "emptyRow";
  const td = document.createElement("td");
  td.colSpan = colSpan;
  td.innerHTML = `<div class="emptyState">${escapeHtml(message)}</div>`;
  tr.appendChild(td);
  tbody.appendChild(tr);
}


function equipmentBuffHasEffect(r) {
  return !!(
    +r.equipBuffAttackPct || +r.equipBuffMagicPct || +r.equipBuffSpeedPct ||
    +r.equipBuffFlatAttack || +r.equipBuffFlatMagic || +r.equipBuffFlatSpeed ||
    +r.equipBuffConvMagicRate || +r.equipBuffConvSpeedRate || +r.equipBuffDmgPct ||
    (+r.equipBuffSpecial && +r.equipBuffSpecial !== 1) ||
    extraStatsHasEffect(r, "equipBuff") ||
    additionalEffectsSummary(r, "display").length
  );
}

function equipmentBuffDisplayName(r) {
  return r.equipBuffName || (r.name ? `${r.name} 装備Buff` : "装備Buff");
}

function equipmentBuffEffectText(r) {
  const parts = [];
  if (+r.equipBuffAttackPct) parts.push(`攻撃力+${r.equipBuffAttackPct}%`);
  if (+r.equipBuffMagicPct) parts.push(`魔力+${r.equipBuffMagicPct}%`);
  if (+r.equipBuffSpeedPct) parts.push(`速度+${r.equipBuffSpeedPct}%`);
  if (+r.equipBuffFlatAttack) parts.push(`攻撃力+${r.equipBuffFlatAttack}`);
  if (+r.equipBuffFlatMagic) parts.push(`魔力+${r.equipBuffFlatMagic}`);
  if (+r.equipBuffFlatSpeed) parts.push(`速度+${r.equipBuffFlatSpeed}`);
  if (+r.equipBuffConvMagicRate) parts.push(`魔力→攻撃力 ${r.equipBuffConvMagicRate}%`);
  if (+r.equipBuffConvSpeedRate) parts.push(`速度→攻撃力 ${r.equipBuffConvSpeedRate}%`);
  if (+r.equipBuffDmgPct) parts.push(`与ダメ+${r.equipBuffDmgPct}%`);
  if (+r.equipBuffSpecial && +r.equipBuffSpecial !== 1) parts.push(`特攻×${r.equipBuffSpecial}`);
  const extra = extraStatsEffectText(r, "equipBuff");
  if (extra) parts.push(extra);
  const displayOnly = additionalEffectsSummary(r, "display");
  if (displayOnly.length) parts.push(...displayOnly);
  return parts.join(" / ") || "効果なし";
}

function equipmentBuffToCompositeRow(r) {
  const row = {
    enabled: !!r.equipBuffEnabled,
    slot: r.equipBuffSlot !== false,
    name: equipmentBuffDisplayName(r),
    tags: r.tags || "",
    attackPct: +r.equipBuffAttackPct || 0,
    magicPct: +r.equipBuffMagicPct || 0,
    speedPct: +r.equipBuffSpeedPct || 0,
    flatAttack: +r.equipBuffFlatAttack || 0,
    flatMagic: +r.equipBuffFlatMagic || 0,
    flatSpeed: +r.equipBuffFlatSpeed || 0,
    convMagicRate: +r.equipBuffConvMagicRate || 0,
    convSpeedRate: +r.equipBuffConvSpeedRate || 0,
    dmgPct: +r.equipBuffDmgPct || 0,
    special: +r.equipBuffSpecial || 1,
    extraEffects: normalizeAdditionalEffects(r.extraEffects),
    note: r.equipBuffNote || `装備由来: ${r.name || r.slot || "装備"}`
  };
  extraFieldDefsFor("equipBuff").forEach(d => {
    row[d.prop] = +(r?.[d.equipProp] || 0);
  });
  return row;
}

/* 装備行に内蔵されたBuffを、計算時だけ装備以外Buffへ展開する。 */
function expandEquipmentBuffState(st) {
  const out = clone(st || {});
  out.composite = Array.isArray(out.composite) ? out.composite : [];
  normalizeEquipmentRows((st || {}).equipment)
    .filter(r => r.enabled !== false && r.equipBuffEnabled && equipmentBuffHasEffect(r))
    .forEach(r => out.composite.push(equipmentBuffToCompositeRow(r)));
  return out;
}

function normalizeCompositeRows(rows) {
  return (Array.isArray(rows) ? rows : []).map(r => {
    const out = {
      enabled: !!r.enabled,
      slot: r.slot !== false,
      name: r.name || "装備以外Buff",
      tags: r.tags || r.tag || "",
      attackPct: +r.attackPct || 0,
      magicPct: +r.magicPct || 0,
      speedPct: +r.speedPct || 0,
      flatAttack: +r.flatAttack || 0,
      flatMagic: +r.flatMagic || 0,
      flatSpeed: +r.flatSpeed || 0,
      convMagicRate: +r.convMagicRate || 0,
      convSpeedRate: +r.convSpeedRate || 0,
      // 装備以外Buffの与ダメは、攻撃力%などと同じく「10%なら10」で保持する。
      // 旧データで dmg:0.1 のような小数が来た場合は 10% として移行する。
      dmgPct: r.dmgPct !== undefined
        ? (+r.dmgPct || 0)
        : ((+r.dmg || 0) > 0 && (+r.dmg || 0) <= 1 ? (+r.dmg || 0) * 100 : (+r.dmg || 0)),
      special: +r.special || 1,
      extraEffects: normalizeAdditionalEffects(r.extraEffects || r.additionalEffects || []),
      note: r.note || ""
    };
    extraFieldDefsFor("buff").forEach(d => {
      out[d.prop] = +(r?.[d.prop] || 0);
    });
    return out;
  });
}
/* 装備以外Buff行が実際に何かしらの効果を持っているか判定する。 */
function compositeHasEffect(r) {
  return !!(
    +r.attackPct || +r.magicPct || +r.speedPct ||
    +r.flatAttack || +r.flatMagic || +r.flatSpeed ||
    +r.convMagicRate || +r.convSpeedRate || +r.dmgPct ||
    (+r.special && +r.special !== 1) ||
    extraStatsHasEffect(r, "buff") ||
    additionalEffectsSummary(r, "display").length
  );
}
/* バフ枠ツールチップ用に、装備以外Buffの効果を人間向けの文字列へまとめる。 */
function compositeEffectText(r) {
  const parts = [];
  if (+r.attackPct) parts.push(`攻撃力+${r.attackPct}%`);
  if (+r.magicPct) parts.push(`魔力+${r.magicPct}%`);
  if (+r.speedPct) parts.push(`速度+${r.speedPct}%`);
  if (+r.flatAttack) parts.push(`攻撃力+${r.flatAttack}`);
  if (+r.flatMagic) parts.push(`魔力+${r.flatMagic}`);
  if (+r.flatSpeed) parts.push(`速度+${r.flatSpeed}`);
  if (+r.convMagicRate) parts.push(`魔力→攻撃力 ${r.convMagicRate}%`);
  if (+r.convSpeedRate) parts.push(`速度→攻撃力 ${r.convSpeedRate}%`);
  if (+r.dmgPct) parts.push(`与ダメ+${r.dmgPct}%`);
  if (+r.special && +r.special !== 1) parts.push(`特攻×${r.special}`);
  const extra = extraStatsEffectText(r, false);
  if (extra) parts.push(extra);
  const displayOnly = additionalEffectsSummary(r, "display");
  if (displayOnly.length) parts.push(...displayOnly);
  return parts.join(" / ") || "効果なし";
}
/**
 * 装備以外Buffを計算用の既存カテゴリへ展開する。
 *
 * 例:
 *   擬竜 1行
 *     attackPct: 15
 *     dmgPct: 10
 *   ↓ 内部計算上は
 *     攻撃力%Buff行 + 与ダメ行
 *
 * ただし展開行はslot:falseにして、バフ枠は元の装備以外Buff 1行だけで数える。
 */
function expandCompositeState(st) {
  const out = clone(st || {});
  out.pct = Array.isArray(out.pct) ? out.pct : [];
  out.flat = normalizeFlatRows(out);
  out.conv = Array.isArray(out.conv) ? out.conv : [];
  out.dmg = Array.isArray(out.dmg) ? out.dmg : [];
  out.special = Array.isArray(out.special) ? out.special : [];
  out.post = Array.isArray(out.post) ? out.post : [];

  normalizeCompositeRows((st || {}).composite).filter(r => r.enabled).forEach(r => {
    const baseName = r.name || "装備以外Buff";
    const note = r.note || "";
    if (+r.attackPct) out.pct.push({enabled:true, slot:false, name:`${baseName} 攻撃力%`, target:"attack", percent:+r.attackPct, note});
    if (+r.magicPct) out.pct.push({enabled:true, slot:false, name:`${baseName} 魔力%`, target:"magic", percent:+r.magicPct, note});
    if (+r.speedPct) out.pct.push({enabled:true, slot:false, name:`${baseName} 速度%`, target:"speed", percent:+r.speedPct, note});
    if (+r.flatAttack) out.flat.push({enabled:true, slot:false, name:`${baseName} 攻撃力+`, target:"attack", value:+r.flatAttack, note});
    if (+r.flatMagic) out.flat.push({enabled:true, slot:false, name:`${baseName} 魔力+`, target:"magic", value:+r.flatMagic, note});
    if (+r.flatSpeed) out.flat.push({enabled:true, slot:false, name:`${baseName} 速度+`, target:"speed", value:+r.flatSpeed, note});
    if (+r.convMagicRate) out.conv.push({enabled:true, slot:false, name:`${baseName} 魔力→攻撃力`, source:"magic", rate:+r.convMagicRate, baseOffset:0, offset:0, capped:false, note});
    if (+r.convSpeedRate) out.conv.push({enabled:true, slot:false, name:`${baseName} 速度→攻撃力`, source:"speed", rate:+r.convSpeedRate, baseOffset:0, offset:0, capped:false, note});
    if (+r.dmgPct) out.dmg.push({enabled:true, slot:false, name:`${baseName} 与ダメ`, value:(+r.dmgPct) / 100, category:"装備以外Buff", note});
    if (+r.special && +r.special !== 1) out.special.push({enabled:true, slot:false, name:`${baseName} 特攻`, value:+r.special, note});
  });
  return out;
}
/* テーブルの使用/枠チェックボックスを作る。変更時は即再計算。 */

/**
 * タグ文字列を配列へ分解する。
 * 区切りはカンマ、読点、セミコロン、改行。空白は競合グループ名の一部として扱う。先頭の # はあってもなくても同じ扱い。
 */
function splitTags(value) {
  const seen = new Set();

  // 競合グループ名にスペースを含めたいケースがあるため、空白では分割しない。
  // 複数タグは カンマ / 読点 / セミコロン / 改行 で区切る。
  return String(value || "")
    .split(/[,，、;\n\r]+/)
    .map(x => x.trim().replace(/^#/, ""))
    .filter(Boolean)
    .filter(x => {
      const key = x.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/* タグ入力セル。タグ変更時は競合グループ管理表示と保存内容を更新する。 */

/* 競合グループ名。複数書かれている場合、v1では先頭グループを重複判定に使う。 */
function buffGroupName(row) {
  return splitTags(row.tags)[0] || "";
}

/* 同一競合グループ内で代表を選ぶための暫定スコア。
   v1では「だいたい強そうな効果」を自動採用する。必要なら後で手動優先度方式に変更する。 */
function compositeGroupScore(r) {
  let score = 0;
  score += (+r.dmgPct || 0) * 1000;
  score += (+r.attackPct || 0) * 650;
  score += (+r.magicPct || 0) * 180;
  score += (+r.speedPct || 0) * 60;
  score += (+r.flatAttack || 0) * 35;
  score += (+r.flatMagic || 0) * 12;
  score += (+r.flatSpeed || 0) * 5;
  score += (+r.convMagicRate || 0) * 45;
  score += (+r.convSpeedRate || 0) * 12;
  if (+r.special && +r.special !== 1) score += ((+r.special || 1) - 1) * 100000;
  score += (+r.extraAC || 0) * 8 + (+r.extraACPct || 0) * 12;
  score += (+r.extraHP || 0) * 2 + (+r.extraHPPct || 0) * 20;
  score += (+r.extraMP || 0) * 1.5 + (+r.extraMPPct || 0) * 12;
  score += (+r.extraST || 0) * 1.5 + (+r.extraSTPct || 0) * 12;
  score += (+r.extraHit || 0) * 10 + (+r.extraHitPct || 0) * 16;
  score += (+r.extraAvoid || 0) * 8 + (+r.extraAvoidPct || 0) * 14;
  score += ((+r.extraFireRes || 0) + (+r.extraWaterRes || 0) + (+r.extraEarthRes || 0) + (+r.extraWindRes || 0) + (+r.extraNeutralRes || 0)) * 2;
  score += ((+r.extraFireResPct || 0) + (+r.extraWaterResPct || 0) + (+r.extraEarthResPct || 0) + (+r.extraWindResPct || 0) + (+r.extraNeutralResPct || 0)) * 4;
  score += (+r.extraAttackDelayPct || 0) * 6;
  score += (+r.extraMagicDelay || 0) * 4 + (+r.extraMagicDelayPct || 0) * 6;
  score += (+r.extraDamageReducePct || 0) * 120;
  score += (+r.extraCritRatePct || 0) * 80;
  return score;
}

function resolveCompositeRowsForGroups(rows) {
  const kept = [];
  const byGroup = new Map();

  normalizeCompositeRows(rows).forEach((row, order) => {
    if (!(row.enabled && compositeHasEffect(row))) {
      kept.push(row);
      return;
    }

    const group = buffGroupName(row);
    if (!group) {
      kept.push(row);
      return;
    }

    const key = group.toLowerCase();
    const candidate = {...row, _groupOrder: order, _groupScore: compositeGroupScore(row)};
    if (!byGroup.has(key)) {
      byGroup.set(key, {group, winner: candidate, skipped: [], candidates: [candidate]});
      return;
    }

    const rec = byGroup.get(key);
    rec.candidates.push(candidate);
    if (candidate._groupScore > rec.winner._groupScore) {
      rec.skipped.push(rec.winner);
      rec.winner = candidate;
    } else {
      rec.skipped.push(candidate);
    }
  });

  byGroup.forEach(rec => kept.push(rec.winner));

  return {
    rows: kept,
    groups: Array.from(byGroup.values()).sort((a,b) => a.group.localeCompare(b.group, "ja"))
  };
}


function simpleBuffGroupScore(type, row) {
  if (type === "post") return ((+row.value || 1) - 1) * 100000;
  if (type === "other") return 0;
  return compositeGroupScore(row);
}

function simpleBuffEffectText(type, row) {
  if (type === "post") return `外枠倍率×${fmt(+row.value || 1, 3)}`;
  if (type === "other") return row.note ? `その他バフ枠 / ${row.note}` : "その他バフ枠";
  return compositeEffectText(row);
}

function collectActiveBuffConflictCandidates(st) {
  const candidates = [];
  let order = 0;

  normalizeCompositeRows(st.composite || []).forEach((row, idx) => {
    if (!(row.enabled && compositeHasEffect(row))) return;
    const group = buffGroupName(row);
    if (!group) return;
    candidates.push({
      type:"composite", idx, row, group,
      name: row.name || "装備以外Buff",
      detail: compositeEffectText(row),
      _groupOrder: order++,
      _groupScore: compositeGroupScore(row)
    });
  });

  (st.post || []).forEach((row, idx) => {
    if (!row.enabled) return;
    const group = buffGroupName(row);
    if (!group) return;
    candidates.push({
      type:"post", idx, row, group,
      name: row.name || "外枠補正",
      detail: simpleBuffEffectText("post", row),
      _groupOrder: order++,
      _groupScore: simpleBuffGroupScore("post", row)
    });
  });

  (st.other || []).forEach((row, idx) => {
    if (!row.enabled) return;
    const group = buffGroupName(row);
    if (!group) return;
    candidates.push({
      type:"other", idx, row, group,
      name: row.name || "その他バフ",
      detail: simpleBuffEffectText("other", row),
      _groupOrder: order++,
      _groupScore: simpleBuffGroupScore("other", row)
    });
  });

  return candidates;
}

function resolveAllBuffRowsForGroups(st) {
  const out = clone(st || {});
  const byGroup = new Map();

  collectActiveBuffConflictCandidates(out).forEach(candidate => {
    const key = candidate.group.toLowerCase();
    if (!byGroup.has(key)) {
      byGroup.set(key, {group:candidate.group, winner:candidate, skipped:[], candidates:[candidate]});
      return;
    }
    const rec = byGroup.get(key);
    rec.candidates.push(candidate);
    if (candidate._groupScore > rec.winner._groupScore) {
      rec.skipped.push(rec.winner);
      rec.winner = candidate;
    } else {
      rec.skipped.push(candidate);
    }
  });

  const suppressed = new Set();
  byGroup.forEach(rec => {
    rec.skipped.forEach(c => suppressed.add(`${c.type}:${c.idx}`));
  });

  out.composite = normalizeCompositeRows(out.composite || []).map((row, idx) =>
    suppressed.has(`composite:${idx}`) ? {...row, enabled:false, _suppressedByGroup:true} : row
  );
  out.post = (out.post || []).map((row, idx) =>
    suppressed.has(`post:${idx}`) ? {...row, enabled:false, _suppressedByGroup:true} : row
  );
  out.other = (out.other || []).map((row, idx) =>
    suppressed.has(`other:${idx}`) ? {...row, enabled:false, _suppressedByGroup:true} : row
  );

  return {
    state: out,
    groups: Array.from(byGroup.values()).sort((a,b) => a.group.localeCompare(b.group, "ja"))
  };
}


/* 競合グループ適用: 同一グループの複数Buffは代表1つだけ計算に反映する。 */
function applyBuffGroupRules(st) {
  return resolveAllBuffRowsForGroups(st).state;
}


function tagInputCell(row, className="tagInput") {
  const input = makeCell("input", {
    class: className,
    value: row.tags || "",
    placeholder: "例: 攻撃力上昇A"
  });
  input.oninput = () => {
    row.tags = input.value;
    renderTagLinkSummary();
    calc();
  };
  const td = makeCell("td");
  td.appendChild(input);
  return td;
}

function tagPillHtml(tag) {
  return `<span class="tagPill">${escapeHtml(tag)}</span>`;
}

function taggedItemHtml(item) {
  const detail = item.detail ? `<br><span class="small">${escapeHtml(item.detail)}</span>` : "";
  return `<span class="tagItem"><b>${escapeHtml(item.kind)}</b>: ${escapeHtml(item.name)}${detail}</span>`;
}

function equipmentEffectText(row) {
  const parts = [];
  if (+row.attack) parts.push(`攻撃力+${row.attack}`);
  if (+row.magic) parts.push(`魔力+${row.magic}`);
  if (+row.speed) parts.push(`速度+${row.speed}`);
  if (+row.delay) parts.push(`ディレイ${row.delay}`);
  return parts.join(" / ");
}


function equipmentBuffMonitorCandidate(row, order) {
  const c = equipmentBuffToCompositeRow(row);
  const slot = (row.slot || "").replace(/^武器: /, "").replace(/^防具: /, "").replace(/^装飾: /, "");
  c._groupOrder = order;
  c._groupScore = compositeGroupScore(c);
  c._monitorSource = "装備";
  c._monitorActive = row.enabled !== false && !!row.equipBuffEnabled;
  c._monitorMark = c._monitorActive ? "使用中" : "未使用装備";
  c._monitorClass = c._monitorActive ? "ok" : "tagWatch";
  c._monitorDetail = `${slot}${row.name ? ` / ${row.name}` : ""}`;
  return c;
}

function buildConflictMonitorGroups() {
  const expanded = expandEquipmentBuffState(state);
  const resolved = resolveAllBuffRowsForGroups(expanded);
  const map = new Map();

  const ensure = group => {
    const key = group.toLowerCase();
    if (!map.has(key)) map.set(key, {group, candidates: [], winner: null, skipped: [], inactiveCount: 0});
    return map.get(key);
  };

  resolved.groups.forEach(g => {
    const rec = ensure(g.group);
    rec.winner = g.winner;
    rec.skipped = g.skipped || [];
    g.candidates.forEach(c => {
      const isWinner = c === g.winner || (c.type === g.winner.type && c.idx === g.winner.idx && c._groupOrder === g.winner._groupOrder);
      const typeLabel = c.type === "post" ? "外枠" : c.type === "other" ? "その他" : "Buff";
      rec.candidates.push({
        ...c,
        _monitorActive: true,
        _monitorMark: isWinner ? "採用" : "抑制",
        _monitorClass: isWinner ? "ok" : "muted",
        _monitorDetail: `${typeLabel} / ${c.detail || simpleBuffEffectText(c.type, c.row)}`
      });
    });
  });

  let monitorOrder = 100000;

  normalizeEquipmentRows(state.equipment).forEach(row => {
    if (!(row.enabled === false && row.equipBuffEnabled && equipmentBuffHasEffect(row))) return;
    const candidate = equipmentBuffMonitorCandidate(row, monitorOrder++);
    const groups = splitTags(candidate.tags);
    groups.forEach(group => {
      const rec = ensure(group);
      rec.candidates.push({...candidate, _monitorGroup: group});
      rec.inactiveCount++;
      if (!rec.winner) rec.winner = candidate;
    });
  });

  normalizeCompositeRows(state.composite).forEach((row, idx) => {
    if (row.enabled || !compositeHasEffect(row)) return;
    splitTags(row.tags).forEach(group => {
      const rec = ensure(group);
      rec.candidates.push({
        type:"composite", idx, row, group,
        name: row.name || "装備以外Buff",
        detail: compositeEffectText(row),
        _groupOrder: monitorOrder++,
        _groupScore: compositeGroupScore(row),
        _monitorActive:false,
        _monitorMark:"未使用Buff",
        _monitorClass:"tagWatch",
        _monitorDetail:"装備以外Buff"
      });
      rec.inactiveCount++;
    });
  });

  (state.post || []).forEach((row, idx) => {
    if (row.enabled) return;
    splitTags(row.tags).forEach(group => {
      const rec = ensure(group);
      rec.candidates.push({
        type:"post", idx, row, group,
        name: row.name || "外枠補正",
        detail: simpleBuffEffectText("post", row),
        _groupOrder: monitorOrder++,
        _groupScore: simpleBuffGroupScore("post", row),
        _monitorActive:false,
        _monitorMark:"未使用外枠",
        _monitorClass:"tagWatch",
        _monitorDetail:"外枠補正"
      });
      rec.inactiveCount++;
    });
  });

  (state.other || []).forEach((row, idx) => {
    if (row.enabled) return;
    splitTags(row.tags).forEach(group => {
      const rec = ensure(group);
      rec.candidates.push({
        type:"other", idx, row, group,
        name: row.name || "その他バフ",
        detail: simpleBuffEffectText("other", row),
        _groupOrder: monitorOrder++,
        _groupScore: simpleBuffGroupScore("other", row),
        _monitorActive:false,
        _monitorMark:"未使用その他",
        _monitorClass:"tagWatch",
        _monitorDetail:"その他バフ"
      });
      rec.inactiveCount++;
    });
  });

  return Array.from(map.values())
    .filter(g => g.candidates.length)
    .sort((a,b) => a.group.localeCompare(b.group, "ja"));
}

/**
 * 装備欄とBuff欄のタグを集計して、同じ競合グループのものを横断表示する。
 * 実際の計算には影響しない、管理・メモ用の紐づけ機能。
 */
function renderTagLinkSummary() {
  const el = byId("tagLinkSummary");
  if (!el) return;

  const groups = buildConflictMonitorGroups();

  if (!groups.length) {
    el.innerHTML = `<div class="tagEmpty">まだ競合グループがありません。装備Buffや装備以外Buffの「競合グループ」に同じ文字を入れると、重複しないBuffグループとして管理できます。未使用の装備候補も監視対象になります。</div>`;
    return;
  }

  const body = groups.map(g => {
    const sorted = g.candidates.slice().sort((a,b) => {
      if (!!b._monitorActive !== !!a._monitorActive) return (b._monitorActive ? 1 : 0) - (a._monitorActive ? 1 : 0);
      return (a._groupOrder || 0) - (b._groupOrder || 0);
    });

    const candidates = sorted.map(c => {
      const cls = c._monitorClass || (c._monitorActive ? "ok" : "tagWatch");
      const mark = c._monitorMark || (c._monitorActive ? "使用中" : "未使用装備");
      const detail = [c._monitorDetail, compositeEffectText(c)].filter(Boolean).join(" / ");
      return `<div class="tagItem ${cls}"><b>${escapeHtml(mark)}</b>: ${escapeHtml(c.name || "Buff")}<br><span class="small">${escapeHtml(detail)}</span></div>`;
    }).join("");

    const activeCount = sorted.filter(c => c._monitorActive).length;
    const inactiveCount = sorted.length - activeCount;
    let status;
    if (activeCount >= 2 && (g.skipped || []).length) {
      status = `<span class="warn">同一グループ内で ${g.skipped.length} 件を抑制中</span>`;
    } else if (activeCount === 1 && inactiveCount) {
      status = `<span class="ok">使用中1件 / 未使用候補${inactiveCount}件</span>`;
    } else if (activeCount === 0 && inactiveCount) {
      status = `<span class="tagWatchLabel">未使用候補${inactiveCount}件を監視中</span>`;
    } else {
      status = `<span class="ok">単独</span>`;
    }

    const score = g.winner && g.winner._monitorActive !== false ? fmt(g.winner._groupScore,0) : "-";

    return `<tr>
      <td>${tagPillHtml(g.group)}</td>
      <td>${candidates}</td>
      <td>${status}</td>
      <td class="num">${score}</td>
    </tr>`;
  }).join("");

  el.innerHTML = `<table>
    <thead><tr><th>競合グループ</th><th>候補Buff</th><th>状態</th><th>採用スコア</th></tr></thead>
    <tbody>${body}</tbody>
  </table>
  <p class="small">同じ競合グループのBuffが複数ONの場合、v1では効果スコアが高いものを代表として計算に反映し、それ以外は抑制します。未使用の装備候補に入っている装備Buffも、この管理画面では常時監視します。計算対象になるのは使用ONの装備Buffだけです。</p>`;
}

function checkboxCell(row, prop) {
  const cb = makeCell("input", {type:"checkbox", checked: !!row[prop]});
  cb.onchange = () => { row[prop] = cb.checked; calc(); };
  const td = makeCell("td");
  td.appendChild(cb);
  return td;
}
/* 行の上下移動/削除ボタン。Buffの適用順序を調整できるようにする。 */
function actionCell(arr, idx, renderFn) {
  const td = makeCell("td", {class:"actionCell"});
  const wrap = makeCell("div", {class:"actionsWrap"});
  const up = makeCell("button", {type:"button", title:"上へ"}, "↑");
  up.onclick = () => { if (idx > 0) { [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]]; renderFn(); calc(); } };
  const down = makeCell("button", {type:"button", title:"下へ"}, "↓");
  down.onclick = () => { if (idx < arr.length - 1) { [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]]; renderFn(); calc(); } };
  const del = makeCell("button", {type:"button", title:"削除", class:"dangerMini"}, "×");
  del.onclick = () => { arr.splice(idx, 1); renderFn(); calc(); };
  wrap.appendChild(up); wrap.appendChild(down); wrap.appendChild(del);
  td.appendChild(wrap);
  return td;
}

/**
 * 基本設定フォームから現在値を集める。
 * テーブル類はstate側に持つため、ここではキャラ/武器/攻撃/上限などを読む。
 */
function collectInputs() {
  const ids = [
    "raceSelect","raceCoeff","str","spirit","magic","weaponSkill","requiredSkill","weaponReqMode","weaponDamage","weaponWeight",
    "speed","drunk","targetAC","attackType","heavyFormula","heavyManualMultiplier","techMultiplier",
    "allowCrit","critRate","critMultiplier","atkCap","atkPctMode","finalCap"
  ];
  const inputs = {};
  ids.forEach(id => {
    const el = byId(id);
    if (!el) return;
    inputs[id] = el.type === "checkbox" ? el.checked : el.value;
  });
  return inputs;
}
/* 保存データやプリセットから基本設定フォームへ値を戻す。 */
function setInputs(inputs) {
  const src = {...(inputs || {})};
  if ((src.spirit === undefined || src.spirit === null || src.spirit === "") && src.magic !== undefined) {
    const race = src.raceSelect || byId("raceSelect").value || "newtar";
    const coeff = RACE_MAGIC_COEFFS[race] ?? 1.00;
    const oldMagic = parseFloat(src.magic);
    if (Number.isFinite(oldMagic) && coeff) src.spirit = (oldMagic / coeff).toFixed(3);
  }
  Object.entries(src).forEach(([id, val]) => {
    const el = byId(id);
    if (!el) return;
    if (el.type === "checkbox") el.checked = !!val;
    else el.value = val;
  });
  syncRaceCoeff();
  syncBaseMagic();
}
/* JSON/TSV/プリセット保存用に、inputsとstateを1つのオブジェクトへまとめる。 */
function collectConfig() {
  return {inputs: collectInputs(), state: clone(state)};
}

/* 共有URL用の軽量構成生成は src/storage/shareUrl.js へ分離しました。 */



/* 割合Buffの対象selectを生成する。 */
function targetOptions(value) {
  const labels = {attack:"攻撃力%", magic:"魔力%", speed:"速度%"};
  return Object.entries(labels).map(([k,v]) => `<option value="${k}" ${k===value?'selected':''}>${v}</option>`).join("");
}
/* ステータス変換の参照元selectを生成する。 */
function sourceOptions(value) {
  const labels = {magic:"魔力", speed:"速度", drunk:"酩酊度", str:"筋力"};
  return Object.entries(labels).map(([k,v]) => `<option value="${k}" ${k===value?'selected':''}>${v}</option>`).join("");
}
/* 内部キーを画面表示名へ変換する。 */
function labelOf(key) {
  return ({attack:"攻撃力", magic:"魔力", speed:"速度", drunk:"酩酊度", str:"筋力"})[key] || key;
}
/* 新規割合Buff行のデフォルト名を作る。 */
function targetName(target) {
  return ({attack:"攻撃力% Buff", magic:"魔力% Buff", speed:"速度% Buff"})[target] || "割合Buff";
}
/* 実数加算の対象selectを生成する。 */
function flatTargetOptions(value) {
  const labels = {magic:"魔力", attack:"攻撃力", speed:"速度"};
  return Object.entries(labels).map(([k,v]) => `<option value="${k}" ${k===value?'selected':''}>${v}</option>`).join("");
}
/* 新規実数加算行のデフォルト名を作る。 */
function flatTargetDefaultName(target) {
  return ({magic:"魔力実数加算", attack:"攻撃力実数加算", speed:"速度実数加算"})[target] || "実数加算";
}
/**
 * 実数加算行を現在形式へ正規化する。
 * 旧版のmagicFlat/atk形式から来たデータもapplyConfig側でflatへ統合する。
 */
function normalizeFlatRows(st) {
  if (Array.isArray(st.flat) && st.flat.length) return st.flat;
  const rows = [];
  (st.magicFlat || []).forEach(r => rows.push({...r, target:"magic"}));
  (st.atk || []).forEach(r => rows.push({...r, target:"attack"}));
  return rows;
}

/* 旧形式のweaponSkill/requiredSkillだけがある場合に、使用条件行へ変換する。 */
function defaultWeaponReqFromInputs(inputs={}) {
  return [{
    name: "武器スキル",
    current: parseFloat(inputs.weaponSkill) || 0,
    required: parseFloat(inputs.requiredSkill) || 0
  }];
}
/* 武器使用条件行を数値化し、空欄によるNaNを防ぐ。 */


function validSkillSimSkillName(name, fallback="こんぼう") {
  const n = String(name || "").trim();
  return SKILL_SIM_ALL.includes(n) ? n : fallback;
}

function skillOptionsHtml(selected) {
  const value = validSkillSimSkillName(selected);
  return SKILL_SIM_GROUPS.map(([group, list]) => {
    const opts = list.map(name => `<option value="${escapeHtml(name)}" ${name === value ? "selected" : ""}>${escapeHtml(name)}</option>`).join("");
    return `<optgroup label="${escapeHtml(group)}">${opts}</optgroup>`;
  }).join("");
}

function currentForWeaponReq(req) {
  const name = validSkillSimSkillName(req?.name);
  return skillSimValue(name);
}

function weaponReqRowsWithSkillSimCurrent(rows) {
  return normalizeWeaponReqRowsForEquipment(rows).map(r => ({
    ...r,
    name: validSkillSimSkillName(r.name, ""),
    current: r.name ? skillSimValue(r.name) : 0
  })).filter(r => r.name);
}

function updateWeaponReqAutoCurrentDisplays() {
  document.querySelectorAll(".weaponReqCurrentAuto").forEach(el => {
    const skill = validSkillSimSkillName(el.dataset.skill);
    el.value = fmt(skillSimValue(skill), 1);
  });
}

function normalizeWeaponReqRowsForEquipment(rows) {
  const normalized = (Array.isArray(rows) ? rows : []).map(r => {
    const rawName = r.name || r.skill || "";
    return {
      // 重要: 不明なスキル名を「こんぼう」に丸めない。
      // UIのselect用デフォルトとは別に、取り込み/保存データでは不明名を落とす。
      name: validSkillSimSkillName(rawName, ""),
      current: parseFloat(r.current) || 0,
      required: parseFloat(r.required) || 0
    };
  }).filter(r => r.name && (r.required || r.current));

  const map = new Map();
  normalized.forEach(r => {
    const key = r.name;
    const prev = map.get(key);
    if (!prev || (+r.required || 0) > (+prev.required || 0)) map.set(key, r);
  });
  return Array.from(map.values());
}

function isWeaponEquipmentRow(row) {
  return String(row?.slot || "").startsWith("武器:");
}

function weaponRowHasCalcData(row) {
  return !!(
    isWeaponEquipmentRow(row) && (
      +row.weaponDamage || +row.weaponWeight || +row.weaponAttackInterval || +row.weaponRange || +row.weaponDurability || row.weaponTwoHanded === "○" ||
      normalizeWeaponReqRowsForEquipment(row.weaponReq).some(r => +r.required)
    )
  );
}

function selectedWeaponForCalc(st) {
  const rows = normalizeEquipmentRows(st?.equipment).filter(r => r.enabled !== false && isWeaponEquipmentRow(r));
  const withData = rows.filter(weaponRowHasCalcData);
  return withData.find(r => r.slot === "武器: 右手") || withData[0] || null;
}

function selectedWeaponRowForEdit() {
  state.equipment = normalizeEquipmentRows(state.equipment);
  return state.equipment.find(r => r.enabled !== false && r.slot === "武器: 右手")
    || state.equipment.find(r => r.enabled !== false && isWeaponEquipmentRow(r))
    || state.equipment.find(r => r.slot === "武器: 右手")
    || state.equipment.find(isWeaponEquipmentRow)
    || null;
}

function weaponReqRowsForCalc(st, inputs={}) {
  const selected = selectedWeaponForCalc(st);
  if (selected) return weaponReqRowsWithSkillSimCurrent(selected.weaponReq);
  return normalizeWeaponReqRows(st?.weaponReq, inputs);
}

function serializeWeaponReqText(rows) {
  return weaponReqRowsWithSkillSimCurrent(rows)
    .map(r => `${String(validSkillSimSkillName(r.name)).replace(/[\\n\\r:\/]/g, " ")}:${+r.current || 0}/${+r.required || 0}`)
    .join("\\n");
}

function parseWeaponReqText(text) {
  return String(text || "").split(/\n+/).map(line => {
    const m = line.match(/^(.*?):([^\/]*)\/(.*)$/);
    if (!m) return null;
    return {name:validSkillSimSkillName(m[1].trim()), current:parseFloat(m[2]) || 0, required:parseFloat(m[3]) || 0};
  }).filter(Boolean);
}


function normalizeWeaponReqRows(rows, inputs={}) {
  if (Array.isArray(rows) && rows.length) {
    return rows.map(r => ({
      name: r.name || "使用条件",
      current: parseFloat(r.current) || 0,
      required: parseFloat(r.required) || 0
    }));
  }
  return defaultWeaponReqFromInputs(inputs);
}
/**
 * 使用条件1行分の補正を計算する。
 * 8割未満は0、必要値以上は1、その間は current/required。
 */
function skillRequirementRatio(current, required) {
  current = parseFloat(current) || 0;
  required = Math.max(0.000001, parseFloat(required) || 0);

  // 最新補正式:
  // 8割未満は0、8割以上〜必要値未満は current/required、必要値以上は1
  if (current >= required) return {ratio: 1, denom: required};
  if (current < required * 0.8) return {ratio: 0, denom: required};
  return {ratio: current / required, denom: required};
}

/**
 * 複数使用条件を含む武器性能発揮率を計算する。
 *
 * 仕様:
 *   - どれか1条件でも8割未満ならmod=0。
 *   - 全条件が8割以上なら、sum(min(current, required)) / sum(required)。
 *   - required超過分で他条件の不足を補填しないため、currentはrequiredで上限をかける。
 */
function calcWeaponSkillMod(st, inputs={}) {
  const rows = weaponReqRowsForCalc(st, inputs);
  const active = rows.filter(r => (parseFloat(r.required) || 0) > 0);
  const mode = "official";
  if (!active.length) return {mod: 1, rows, evaluated: [], limiting: null, mode, gateFailed: null, totalCurrent: 0, totalRequired: 0};

  const evaluated = active.map(r => {
    const current = parseFloat(r.current) || 0;
    const required = Math.max(0.000001, parseFloat(r.required) || 0);
    const evalResult = skillRequirementRatio(current, required);
    const meetsGate = current >= required * 0.8;
    const cappedCurrent = Math.min(current, required);
    return {...r, current, required, cappedCurrent, denom: evalResult.denom, ratio: evalResult.ratio, meetsGate};
  });

  // 複数必須条件:
  // すべての条件が8割以上必要。
  // 8割を満たした後は「全条件の達成分合計 / 全条件の必要値合計」で補正する。
  // 必要値を超えた分で他条件の不足を埋めないよう、各条件の達成分は必要値で上限。
  const gateFailed = evaluated.find(r => !r.meetsGate) || null;
  const totalCurrent = evaluated.reduce((s, r) => s + r.cappedCurrent, 0);
  const totalRequired = evaluated.reduce((s, r) => s + r.required, 0);
  const overallRatio = totalRequired ? Math.min(1, totalCurrent / totalRequired) : 1;
  const mod = gateFailed ? 0 : overallRatio;
  const limiting = gateFailed || evaluated.reduce((a, b) => b.ratio < a.ratio ? b : a, evaluated[0]);

  return {mod, rows, evaluated, limiting, mode, gateFailed, totalCurrent, totalRequired, overallRatio};
}

/* 武器使用条件テーブルをstate.weaponReqから描画する。 */
function renderWeaponReqTable() {
  const tbody = document.querySelector("#weaponReqTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  state.weaponReq = normalizeWeaponReqRows(state.weaponReq, collectInputs());

  state.weaponReq.forEach((row, idx) => {
    const tr = document.createElement("tr");

    const name = makeCell("input", {value: row.name || ""});
    name.oninput = () => { row.name = name.value; };
    tr.appendChild(makeCell("td")).appendChild(name);

    const current = makeCell("input", {type:"number", step:"0.1", value: row.current ?? 0});
    current.oninput = () => {
      row.current = parseFloat(current.value) || 0;
      if (idx === 0) byId("weaponSkill").value = row.current;
      calc();
    };
    tr.appendChild(makeCell("td")).appendChild(current);

    const required = makeCell("input", {type:"number", step:"0.1", value: row.required ?? 0});
    required.oninput = () => {
      row.required = parseFloat(required.value) || 0;
      if (idx === 0) byId("requiredSkill").value = row.required;
      calc();
    };
    tr.appendChild(makeCell("td")).appendChild(required);

    const del = makeCell("button", {type:"button", title:"削除"}, "×");
    del.onclick = () => {
      state.weaponReq.splice(idx, 1);
      if (!state.weaponReq.length) state.weaponReq = [{name:"武器スキル", current:0, required:0}];
      renderWeaponReqTable();
      calc();
    };
    tr.appendChild(makeCell("td")).appendChild(del);

    tbody.appendChild(tr);
  });

  if (state.weaponReq[0]) {
    byId("weaponSkill").value = state.weaponReq[0].current ?? 0;
    byId("requiredSkill").value = state.weaponReq[0].required ?? 0;
  }
}
/* 使用条件を1行追加する。 */
function addWeaponReqRow() {
  state.weaponReq.push({name:"追加条件", current:0, required:0});
  renderWeaponReqTable();
  calc();
}

/* 装備以外Buff表の数値入力セルを作る。 */
function compositeNumberCell(row, prop, step="0.1") {
  const input = makeCell("input", {type:"number", step, value: row[prop] ?? 0});
  input.oninput = () => { row[prop] = parseFloat(input.value) || 0; calc(); };
  const td = makeCell("td");
  td.appendChild(input);
  return td;
}
/* 装備以外Buff表をstate.compositeから描画する。 */

function updateCompositeExtraStatus(button, row) {
  const has = extraStatsHasEffect(row, "buff") || additionalEffectsSummary(row, "display").length;
  button.textContent = has ? "追加あり" : "追加なし";
  button.classList.toggle("on", !!has);
}

function makeCompositeExtraDetailRow(row) {
  const detailTr = document.createElement("tr");
  detailTr.className = "compositeExtraDetailRow";
  detailTr.style.display = row._compositeExtraOpen ? "" : "none";

  const td = makeCell("td");
  td.colSpan = 17;
  td.className = "compositeExtraDetailCell";

  const title = document.createElement("div");
  title.className = "extraStatsTitle";
  title.textContent = `${row.name || "装備以外Buff"} の追加ステータス`;
  td.appendChild(title);

  const holder = document.createElement("div");
  holder.className = "compositeExtraEditor";
  td.appendChild(holder);

  detailTr.appendChild(td);
  return detailTr;
}

function compositeExtraCell(row, detailTr) {
  const td = makeCell("td");
  td.className = "compositeExtraCell";
  const button = makeCell("button", {type:"button", class:"equipBuffToggle compositeExtraToggle"});
  updateCompositeExtraStatus(button, row);
  button.onclick = () => {
    row._compositeExtraOpen = !row._compositeExtraOpen;
    detailTr.style.display = row._compositeExtraOpen ? "" : "none";
    button.classList.toggle("open", !!row._compositeExtraOpen);
  };
  td.appendChild(button);

  const holder = detailTr.querySelector(".compositeExtraEditor");
  holder.appendChild(makeQuickEffectAdder(row, "composite", button));
  holder.appendChild(makeExtraStatsEditor(row, "入力済みの追加ステータス", "buff", () => updateCompositeExtraStatus(button, row)));

  return td;
}


function renderCompositeTable() {
  const tbody = document.querySelector("#compositeBuffTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  state.composite = normalizeCompositeRows(state.composite);

  if (!state.composite.length) {
    renderEmptyRow(tbody, 17, "まだ装備以外Buffがありません。「Buff行を追加」から追加してください。");
    return;
  }

  state.composite.forEach((row, idx) => {
    const frag = document.createDocumentFragment();
    const tr = document.createElement("tr");
    tr.appendChild(checkboxCell(row, "enabled"));
    tr.appendChild(checkboxCell(row, "slot"));

    const name = makeCell("input", {value: row.name || ""});
    name.oninput = () => {
      row.name = name.value;
      const title = tr.nextSibling?.querySelector?.(".extraStatsTitle");
      if (title) title.textContent = `${row.name || "装備以外Buff"} の追加ステータス`;
      renderTagLinkSummary();
      calc();
    };
    tr.appendChild(makeCell("td")).appendChild(name);

    tr.appendChild(tagInputCell(row));

    tr.appendChild(compositeNumberCell(row, "attackPct", "1"));
    tr.appendChild(compositeNumberCell(row, "magicPct", "1"));
    tr.appendChild(compositeNumberCell(row, "speedPct", "1"));
    tr.appendChild(compositeNumberCell(row, "flatAttack", "0.1"));
    tr.appendChild(compositeNumberCell(row, "flatMagic", "0.1"));
    tr.appendChild(compositeNumberCell(row, "flatSpeed", "0.1"));
    tr.appendChild(compositeNumberCell(row, "convMagicRate", "1"));
    tr.appendChild(compositeNumberCell(row, "convSpeedRate", "1"));
    tr.appendChild(compositeNumberCell(row, "dmgPct", "1"));
    tr.appendChild(compositeNumberCell(row, "special", "0.01"));

    const detailTr = makeCompositeExtraDetailRow(row);
    tr.appendChild(compositeExtraCell(row, detailTr));

    const note = makeCell("input", {value: row.note || ""});
    note.oninput = () => { row.note = note.value; };
    tr.appendChild(makeCell("td")).appendChild(note);

    tr.appendChild(actionCell(state.composite, idx, renderCompositeTable));
    frag.appendChild(tr);
    frag.appendChild(detailTr);
    tbody.appendChild(frag);
  });
}
/* 空のBuff行を追加する。主要Buffが固まるまではプリセットボタンを置かない方針。 */
function addCompositeRow(kind="blank") {
  const row = {
    enabled:true, slot:true, name:"装備以外Buff", tags:"",
    attackPct:0, magicPct:0, speedPct:0,
    flatAttack:0, flatMagic:0, flatSpeed:0,
    convMagicRate:0, convSpeedRate:0,
    dmgPct:0, special:1,
    ...extraDefaultFields("buff"),
    note:""
  };
  state.composite.push(row);
  renderCompositeTable();
  calc();
}

/* 旧項目: 割合ステータスBuff表を描画する。 */
function renderPctTable() {
  const tbody = document.querySelector("#pctBuffTable tbody");
  tbody.innerHTML = "";
  if (!state.pct.length) {
    renderEmptyRow(tbody, 7, "割合Buff行はありません。必要な場合だけ行を追加してください。");
    return;
  }

  state.pct.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.appendChild(checkboxCell(row, "enabled"));
    tr.appendChild(checkboxCell(row, "slot"));

    const name = makeCell("input", {value: row.name || ""});
    name.oninput = () => { row.name = name.value; };
    tr.appendChild(makeCell("td")).appendChild(name);

    const target = makeCell("select");
    target.innerHTML = targetOptions(row.target || "attack");
    target.onchange = () => { row.target = target.value; calc(); };
    tr.appendChild(makeCell("td")).appendChild(target);

    const percent = makeCell("input", {type:"number", step:"1", value: row.percent ?? 0});
    percent.oninput = () => { row.percent = parseFloat(percent.value) || 0; calc(); };
    tr.appendChild(makeCell("td")).appendChild(percent);

    const note = makeCell("input", {value: row.note || ""});
    note.oninput = () => { row.note = note.value; };
    tr.appendChild(makeCell("td")).appendChild(note);

    tr.appendChild(actionCell(state.pct, idx, renderPctTable));
    tbody.appendChild(tr);
  });
}
/* 旧項目: 割合ステータスBuff行を追加する。 */
function addPctRow(target="attack") {
  state.pct.push({enabled:true, slot:true, name: targetName(target), target, percent:0, note:""});
  renderPctTable();
  calc();
}





function weaponCalcNumberInput(row, prop, label, step="0.1", statusButton=null) {
  const wrap = document.createElement("label");
  wrap.textContent = label;
  const input = makeCell("input", {type:"number", step, value: row[prop] ?? 0});
  input.oninput = () => {
    row[prop] = parseFloat(input.value) || 0;
    if (statusButton) updateEquipBuffStatus(statusButton, row);
    calc();
  };
  wrap.appendChild(input);
  return wrap;
}

function makeWeaponReqMiniTable(row, statusButton=null) {
  row.weaponReq = normalizeWeaponReqRowsForEquipment(row.weaponReq);
  const wrap = document.createElement("div");
  wrap.className = "weaponReqEditor";

  const title = document.createElement("div");
  title.className = "extraStatsTitle";
  title.textContent = "使用条件";
  wrap.appendChild(title);

  const help = document.createElement("p");
  help.className = "small";
  help.textContent = "スキルはスキルシミュレータの項目から選択します。現在値はスキルシミュレータ側の値を自動取得し、必要値だけ手入力します。";
  wrap.appendChild(help);

  const table = document.createElement("table");
  table.className = "miniTable weaponReqMiniTable";
  table.innerHTML = `<thead><tr><th>スキル</th><th>現在(自動)</th><th>必要</th><th></th></tr></thead><tbody></tbody>`;
  const tbody = table.querySelector("tbody");

  const redraw = () => {
    tbody.innerHTML = "";
    row.weaponReq = normalizeWeaponReqRowsForEquipment(row.weaponReq);
    if (!row.weaponReq.length) {
      const tr = document.createElement("tr");
      const td = makeCell("td", {colspan:"4", class:"small"});
      td.textContent = "使用条件なし。必要なら下のボタンで追加してください。";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    row.weaponReq.forEach((req, idx) => {
      req.name = validSkillSimSkillName(req.name);
      const tr = document.createElement("tr");

      const skill = makeCell("select");
      skill.innerHTML = skillOptionsHtml(req.name);
      skill.value = req.name;
      skill.onchange = () => {
        req.name = validSkillSimSkillName(skill.value);
        const auto = tr.querySelector(".weaponReqCurrentAuto");
        if (auto) {
          auto.dataset.skill = req.name;
          auto.value = fmt(skillSimValue(req.name), 1);
        }
        if (statusButton) updateEquipBuffStatus(statusButton, row);
        calc();
      };
      tr.appendChild(makeCell("td")).appendChild(skill);

      const current = makeCell("input", {
        type:"number",
        step:"0.1",
        readonly:true,
        class:"weaponReqCurrentAuto",
        value: fmt(skillSimValue(req.name), 1)
      });
      current.dataset.skill = req.name;
      tr.appendChild(makeCell("td")).appendChild(current);

      const required = makeCell("input", {type:"number", step:"0.1", value:req.required ?? 0});
      required.oninput = () => {
        req.required = parseFloat(required.value) || 0;
        if (statusButton) updateEquipBuffStatus(statusButton, row);
        calc();
      };
      tr.appendChild(makeCell("td")).appendChild(required);

      const del = makeCell("button", {type:"button", title:"削除"}, "×");
      del.onclick = () => {
        row.weaponReq.splice(idx, 1);
        redraw();
        if (statusButton) updateEquipBuffStatus(statusButton, row);
        calc();
      };
      tr.appendChild(makeCell("td")).appendChild(del);

      tbody.appendChild(tr);
    });
  };

  wrap.appendChild(table);

  const add = makeCell("button", {type:"button", class:"miniButton"}, "使用条件を追加");
  add.onclick = () => {
    const defaultSkill = row.weaponReq.length ? "筋力" : (state.skillSim?.weaponSkill || "こんぼう");
    row.weaponReq.push({name: validSkillSimSkillName(defaultSkill), current:0, required:0});
    redraw();
    if (statusButton) updateEquipBuffStatus(statusButton, row);
    calc();
  };
  wrap.appendChild(add);

  redraw();
  return wrap;
}



function weaponCalcSelectInput(row, prop, label, options, statusButton=null) {
  const wrap = document.createElement("label");
  wrap.textContent = label;
  const select = makeCell("select");
  select.className = "weaponCalcSelect";
  select.innerHTML = options.map(v => `<option value="${escapeHtml(v)}" ${String(row[prop] ?? "×") === String(v) ? "selected" : ""}>${escapeHtml(v)}</option>`).join("");
  select.onchange = () => {
    row[prop] = select.value;
    if (statusButton) updateEquipBuffStatus(statusButton, row);
    calc();
  };
  wrap.appendChild(select);
  return wrap;
}

function makeWeaponCalcEditor(row, statusButton=null) {
  const box = document.createElement("div");
  box.className = "weaponCalcEditor equipBuffWide";

  const title = document.createElement("div");
  title.className = "extraStatsTitle";
  title.textContent = "武器性能・使用条件（ダメージ計算に使用）";
  box.appendChild(title);

  const note = document.createElement("p");
  note.className = "small weaponCalcNote";
  note.textContent = "使用条件の現在値はスキルシミュレータから自動取得します。必要値だけ入力してください。";
  box.appendChild(note);

  const layout = document.createElement("div");
  layout.className = "weaponCalcLayout";

  const perf = document.createElement("div");
  perf.className = "weaponCalcPane weaponCalcPerfPane";

  const perfTitle = document.createElement("div");
  perfTitle.className = "weaponCalcPaneTitle";
  perfTitle.textContent = "武器性能";
  perf.appendChild(perfTitle);

  const grid = document.createElement("div");
  grid.className = "weaponCalcGrid";
  grid.appendChild(weaponCalcNumberInput(row, "weaponDamage", "武器ダメージ", "0.1", statusButton));
  grid.appendChild(weaponCalcNumberInput(row, "weaponWeight", "武器重量", "0.1", statusButton));
  grid.appendChild(weaponCalcNumberInput(row, "weaponAttackInterval", "攻撃間隔", "0.1", statusButton));
  grid.appendChild(weaponCalcNumberInput(row, "weaponRange", "射程", "0.1", statusButton));
  grid.appendChild(weaponCalcNumberInput(row, "weaponDurability", "耐久", "1", statusButton));
  grid.appendChild(weaponCalcSelectInput(row, "weaponTwoHanded", "両手武器", ["×", "○"], statusButton));
  perf.appendChild(grid);

  const req = makeWeaponReqMiniTable(row, statusButton);
  req.classList.add("weaponCalcPane", "weaponReqPane");

  layout.appendChild(perf);
  layout.appendChild(req);
  box.appendChild(layout);

  return box;
}

function weaponCalcStatusText(row) {
  if (!isWeaponEquipmentRow(row)) return "";
  const parts = [];
  if (+row.weaponDamage) parts.push(`ダメージ ${row.weaponDamage}`);
  if (+row.weaponWeight) parts.push(`重量 ${row.weaponWeight}`);
  if (+row.weaponAttackInterval) parts.push(`間隔 ${row.weaponAttackInterval}`);
  if (+row.weaponRange) parts.push(`射程 ${row.weaponRange}`);
  if (+row.weaponDurability) parts.push(`耐久 ${row.weaponDurability}`);
  if (row.weaponTwoHanded === "○") parts.push("両手");
  const reqs = normalizeWeaponReqRowsForEquipment(row.weaponReq).filter(r => +r.required);
  if (reqs.length) parts.push(`条件 ${reqs.length}件`);
  return parts.join(" / ");
}

function updateSelectedWeaponCalcSummary(m=null) {
  const el = byId("selectedWeaponCalcSummary");
  if (!el) return;
  const w = selectedWeaponForCalc(state);
  if (!w) {
    el.innerHTML = `装備登録タブの武器詳細が未設定です。武器ダメージ0 / 使用条件なしとして計算しています。`;
    return;
  }
  const reqText = weaponReqRowsWithSkillSimCurrent(w.weaponReq).filter(r => +r.required)
    .map(r => `${escapeHtml(r.name)} ${fmt(r.current,1)}/${fmt(r.required,1)}`)
    .join(" / ") || "条件なし";
  el.innerHTML = [
    `<b>${escapeHtml((w.slot || "武器").replace(/^武器: /, ""))}: ${escapeHtml(w.name || "名称未入力")}</b>`,
    `武器ダメージ ${fmt(+w.weaponDamage || 0,1)} / 武器重量 ${fmt(+w.weaponWeight || 0,1)} / 攻撃間隔 ${fmt(+w.weaponAttackInterval || 0,1)} / 射程 ${fmt(+w.weaponRange || 0,1)} / 耐久 ${fmt(+w.weaponDurability || 0,0)} / 両手 ${escapeHtml(w.weaponTwoHanded || "×")}`,
    `使用条件: ${reqText}`
  ].map(x => `<div>${x}</div>`).join("");
}

function syncSelectedWeaponToHiddenInputs() {
  const w = selectedWeaponForCalc(state);
  if (!w) return;
  if (byId("weaponDamage")) byId("weaponDamage").value = +w.weaponDamage || 0;
  if (byId("weaponWeight")) byId("weaponWeight").value = +w.weaponWeight || 0;
  const reqs = weaponReqRowsWithSkillSimCurrent(w.weaponReq);
  if (reqs[0]) {
    if (byId("weaponSkill")) byId("weaponSkill").value = +reqs[0].current || 0;
    if (byId("requiredSkill")) byId("requiredSkill").value = +reqs[0].required || 0;
  }
}


function equipBuffStatusText(row) {
  if (!row.equipBuffEnabled) return "Buffなし";
  const name = equipmentBuffDisplayName(row);
  const effect = equipmentBuffHasEffect(row) ? equipmentBuffEffectText(row) : "効果未入力";
  return `${name}: ${effect}`;
}

function updateEquipBuffStatus(button, row) {
  const baseExtra = extraStatsHasEffect(row, "base") || additionalEffectsSummary(row, "display").length;
  const weaponText = weaponCalcStatusText(row);
  const buffText = row.equipBuffEnabled ? `Buff ON: ${equipmentBuffDisplayName(row)}` : "Buffなし";
  const suffix = [weaponText, baseExtra ? "追加あり" : ""].filter(Boolean).join(" / ");
  button.textContent = suffix ? `詳細: ${buffText} / ${suffix}` : `詳細: ${buffText}`;
  button.classList.toggle("on", !!row.equipBuffEnabled || baseExtra || !!weaponText);
}

function equipBuffNumberInput(row, key, label, step="1") {
  const wrap = document.createElement("label");
  wrap.textContent = label;
  const input = makeCell("input", {type:"number", step, value: row[key] ?? (key === "equipBuffSpecial" ? 1 : 0)});
  input.oninput = () => {
    row[key] = parseFloat(input.value) || (key === "equipBuffSpecial" ? 1 : 0);
    calc();
  };
  wrap.appendChild(input);
  return wrap;
}

function makeEquipmentBuffEditor(row, statusButton) {
  const grid = document.createElement("div");
  grid.className = "equipBuffGrid equipBuffGridRow";

  const statusUpdater = () => updateEquipBuffStatus(statusButton, row);

  grid.appendChild(makeQuickEffectAdder(row, "equipment", statusButton));

  if (isWeaponEquipmentRow(row)) {
    grid.appendChild(makeWeaponCalcEditor(row, statusButton));
  }

  grid.appendChild(makeExtraStatsEditor(row, "装備本体の追加ステータス", "base", statusUpdater));

  const buffSection = document.createElement("div");
  buffSection.className = "equipBuffSection equipBuffWide";

  const buffTitle = document.createElement("div");
  buffTitle.className = "extraStatsTitle";
  buffTitle.textContent = "装備Buff";
  buffSection.appendChild(buffTitle);

  const buffTop = document.createElement("div");
  buffTop.className = "equipBuffTopControls";

  const enabledLabel = document.createElement("label");
  enabledLabel.className = "equipBuffInline";
  const enabled = makeCell("input", {type:"checkbox", checked: !!row.equipBuffEnabled});
  enabled.onchange = () => {
    row.equipBuffEnabled = enabled.checked;
    updateEquipBuffStatus(statusButton, row);
    calc();
  };
  enabledLabel.appendChild(enabled);
  enabledLabel.appendChild(document.createTextNode("Buffあり"));
  buffTop.appendChild(enabledLabel);

  const slotLabel = document.createElement("label");
  slotLabel.className = "equipBuffInline";
  const slot = makeCell("input", {type:"checkbox", checked: row.equipBuffSlot !== false});
  slot.onchange = () => {
    row.equipBuffSlot = slot.checked;
    calc();
  };
  slotLabel.appendChild(slot);
  slotLabel.appendChild(document.createTextNode("Buff枠を使う"));
  buffTop.appendChild(slotLabel);

  buffSection.appendChild(buffTop);

  const nameMemoRow = document.createElement("div");
  nameMemoRow.className = "equipBuffNameMemoRow";

  const nameLabel = document.createElement("label");
  nameLabel.className = "equipBuffNameLabel";
  nameLabel.textContent = "Buff名";
  const name = makeCell("input", {value: row.equipBuffName || "", placeholder:"例: 黄金の呪い"});
  name.oninput = () => {
    row.equipBuffName = name.value;
    updateEquipBuffStatus(statusButton, row);
    calc();
  };
  nameLabel.appendChild(name);

  const noteLabel = document.createElement("label");
  noteLabel.className = "equipBuffMemoLabel";
  noteLabel.textContent = "Buffメモ";
  const note = makeCell("input", {value: row.equipBuffNote || "", placeholder:"任意メモ"});
  note.oninput = () => { row.equipBuffNote = note.value; };
  noteLabel.appendChild(note);

  nameMemoRow.appendChild(nameLabel);
  nameMemoRow.appendChild(noteLabel);
  buffSection.appendChild(nameMemoRow);

  const buffGrid = document.createElement("div");
  buffGrid.className = "equipBuffDirectGrid";
  buffGrid.appendChild(equipBuffNumberInput(row, "equipBuffAttackPct", "攻撃力%", "1"));
  buffGrid.appendChild(equipBuffNumberInput(row, "equipBuffMagicPct", "魔力%", "1"));
  buffGrid.appendChild(equipBuffNumberInput(row, "equipBuffSpeedPct", "速度%", "1"));
  buffGrid.appendChild(equipBuffNumberInput(row, "equipBuffFlatAttack", "攻撃力+", "0.1"));
  buffGrid.appendChild(equipBuffNumberInput(row, "equipBuffFlatMagic", "魔力+", "0.1"));
  buffGrid.appendChild(equipBuffNumberInput(row, "equipBuffFlatSpeed", "速度+", "0.1"));
  buffGrid.appendChild(equipBuffNumberInput(row, "equipBuffConvMagicRate", "魔力→攻撃力%", "1"));
  buffGrid.appendChild(equipBuffNumberInput(row, "equipBuffConvSpeedRate", "速度→攻撃力%", "1"));
  buffGrid.appendChild(equipBuffNumberInput(row, "equipBuffDmgPct", "与ダメ%", "1"));
  buffGrid.appendChild(equipBuffNumberInput(row, "equipBuffSpecial", "特攻倍率", "0.01"));
  buffSection.appendChild(buffGrid);

  buffSection.appendChild(makeExtraStatsEditor(row, "装備Buffの追加ステータス", "equipBuff", statusUpdater));

  const help = document.createElement("div");
  help.className = "small";
  help.textContent = "%欄は10%なら10。装備本体は装備ON時、装備BuffはBuff ONかつ効果ありの場合だけ反映します。";
  buffSection.appendChild(help);

  grid.appendChild(buffSection);

  return grid;
}

function makeEquipmentBuffButtonCell(row, detailTr) {
  const td = makeCell("td");
  td.className = "equipBuffCell";
  const button = makeCell("button", {type:"button", class:"equipBuffToggle"});
  updateEquipBuffStatus(button, row);
  button.onclick = () => {
    row._equipBuffOpen = !row._equipBuffOpen;
    detailTr.style.display = row._equipBuffOpen ? "" : "none";
    button.classList.toggle("open", !!row._equipBuffOpen);
  };
  button.title = "押すと下の行に装備Buff入力欄を展開します";
  td.appendChild(button);
  return td;
}

function makeEquipmentBuffDetailRow(row, includeSlot, statusButton) {
  const detailTr = document.createElement("tr");
  detailTr.className = "equipBuffDetailRow";
  detailTr.style.display = row._equipBuffOpen ? "" : "none";

  const td = makeCell("td");
  td.colSpan = includeSlot ? 9 : 8;
  td.className = "equipBuffDetailCell";

  const title = document.createElement("div");
  title.className = "equipBuffDetailTitle";
  const slotLabel = (row.slot || "").replace(/^武器: /, "").replace(/^防具: /, "").replace(/^装飾: /, "");
  title.textContent = `${slotLabel}${row.name ? ` / ${row.name}` : ""} の詳細`;
  td.appendChild(title);
  td.appendChild(makeEquipmentBuffEditor(row, statusButton));
  detailTr.appendChild(td);
  return detailTr;
}

/* 装備1行分の入力欄を作る。装備は常に使用扱いで、0なら効果なし。 */
function equipmentUseCell(row, idx) {
  const cb = makeCell("input", {type:"checkbox", checked: row.enabled !== false});
  cb.onchange = () => {
    state.equipment = normalizeEquipmentRows(state.equipment);
    const target = state.equipment[idx];
    if (!target) return;

    if (cb.checked) {
      // 同じ部位は1つだけ使用ONにする。
      state.equipment.forEach((r, i) => {
        if (i !== idx && r.slot === target.slot) r.enabled = false;
      });
      target.enabled = true;
    } else {
      target.enabled = false;
    }

    renderEquipmentTable();
    calc();
  };
  const td = makeCell("td");
  td.appendChild(cb);
  return td;
}


function equipmentOptimizerFixedCell(row, idx) {
  const cb = makeCell("input", {
    type:"checkbox",
    checked: !!row.optimizerFixed,
    title:"ONにすると、最適化検索でこの装備候補を必ず使います。使用ON/OFFとは別設定です。"
  });
  cb.onchange = () => {
    state.equipment = normalizeEquipmentRows(state.equipment);
    const target = state.equipment[idx];
    if (!target) return;

    if (cb.checked) {
      state.equipment.forEach((r, i) => {
        if (i !== idx && r.slot === target.slot) r.optimizerFixed = false;
      });
      target.optimizerFixed = true;
      target.optimizerExcluded = false;
    } else {
      target.optimizerFixed = false;
    }

    renderEquipmentTable();
    calc();
  };

  const td = makeCell("td", {class:"equipmentOptimizerFixedCell"});
  td.title = "最適化検索で固定";
  td.appendChild(cb);
  return td;
}

function equipmentOptimizerExcludeCell(row, idx) {
  const cb = makeCell("input", {
    type:"checkbox",
    checked: !!row.optimizerExcluded,
    title:"ONにすると、この装備候補を最適化検索から除外します。通常計算の使用ON/OFFには影響しません。"
  });
  cb.onchange = () => {
    state.equipment = normalizeEquipmentRows(state.equipment);
    const target = state.equipment[idx];
    if (!target) return;
    target.optimizerExcluded = cb.checked;
    if (cb.checked) target.optimizerFixed = false;
    renderEquipmentTable();
    calc();
  };

  const td = makeCell("td", {class:"equipmentOptimizerExcludeCell"});
  td.title = "最適化検索から除外";
  td.appendChild(cb);
  return td;
}


function moveEquipmentCandidate(idx, dir) {
  state.equipment = normalizeEquipmentRows(state.equipment);
  const row = state.equipment[idx];
  if (!row) return;
  let j = idx + dir;
  while (j >= 0 && j < state.equipment.length) {
    if (state.equipment[j].slot === row.slot) {
      [state.equipment[idx], state.equipment[j]] = [state.equipment[j], state.equipment[idx]];
      renderEquipmentTable();
      calc();
      return;
    }
    j += dir;
  }
}

function equipmentActionCell(idx) {
  const td = makeCell("td", {class:"actionCell"});
  const wrap = makeCell("div", {class:"actionsWrap equipmentActionsWrap"});

  const up = makeCell("button", {type:"button", title:"同じ部位内で上へ"}, "↑");
  up.onclick = () => moveEquipmentCandidate(idx, -1);

  const down = makeCell("button", {type:"button", title:"同じ部位内で下へ"}, "↓");
  down.onclick = () => moveEquipmentCandidate(idx, 1);

  const dup = makeCell("button", {type:"button", title:"この候補を複製"}, "⧉");
  dup.onclick = () => {
    state.equipment = normalizeEquipmentRows(state.equipment);
    const row = state.equipment[idx];
    const copy = {...clone(row), enabled:false, name: row.name ? `${row.name} コピー` : ""};
    state.equipment.splice(idx + 1, 0, copy);
    renderEquipmentTable();
    calc();
  };

  const del = makeCell("button", {type:"button", title:"この候補を削除", class:"dangerMini"}, "×");
  del.onclick = () => {
    state.equipment = normalizeEquipmentRows(state.equipment);
    state.equipment.splice(idx, 1);
    renderEquipmentTable();
    calc();
  };

  wrap.appendChild(up);
  wrap.appendChild(down);
  wrap.appendChild(dup);
  wrap.appendChild(del);
  td.appendChild(wrap);
  return td;
}

/* 装備1行分の入力欄を作る。候補は使用チェックで付け外しする。同じ部位で使用ONにできるのは1つだけ。 */
function makeEquipmentInputRow(row, includeSlot=true, idx=0) {
  const frag = document.createDocumentFragment();
  const tr = document.createElement("tr");
  tr.className = "equipmentMainRow";
  if (row.enabled === false) tr.classList.add("equipmentOffRow");
  if (row.optimizerFixed) tr.classList.add("equipmentOptimizerFixedRow");
  if (row.optimizerExcluded) tr.classList.add("equipmentOptimizerExcludedRow");

  tr.appendChild(equipmentUseCell(row, idx));
  tr.appendChild(equipmentOptimizerFixedCell(row, idx));
  tr.appendChild(equipmentOptimizerExcludeCell(row, idx));

  if (includeSlot) {
    const slotTd = makeCell("td");
    slotTd.textContent = (row.slot || "").replace(/^武器: /, "").replace(/^防具: /, "").replace(/^装飾: /, "");
    tr.appendChild(slotTd);
  }

  const name = makeCell("input", {class:"equipName", value: row.name || ""});
  name.oninput = () => {
    row.name = name.value;
    const title = tr.nextSibling?.querySelector?.(".equipBuffDetailTitle");
    if (title) {
      const slotLabel = (row.slot || "").replace(/^武器: /, "").replace(/^防具: /, "").replace(/^装飾: /, "");
      title.textContent = `${slotLabel}${row.name ? ` / ${row.name}` : ""} の詳細`;
    }
  };
  tr.appendChild(makeCell("td")).appendChild(name);


  const dummyButton = makeCell("button", {type:"button", class:"equipBuffToggle"});
  const detailTr = makeEquipmentBuffDetailRow(row, includeSlot, dummyButton);
  const buffCell = makeEquipmentBuffButtonCell(row, detailTr);
  const realButton = buffCell.querySelector("button");
  detailTr.querySelector(".equipBuffGrid").replaceWith(makeEquipmentBuffEditor(row, realButton));
  tr.appendChild(buffCell);

  tr.appendChild(tagInputCell(row, "equipTag tagInput"));

  const note = makeCell("input", {class:"equipNote", value: row.note || ""});
  note.oninput = () => { row.note = note.value; };
  tr.appendChild(makeCell("td")).appendChild(note);

  tr.appendChild(equipmentActionCell(idx));

  frag.appendChild(tr);
  frag.appendChild(detailTr);
  return frag;
}

/* 武器/防具/装飾の固定行テーブルを描画する。 */

function addEquipmentCandidate(slot) {
  state.equipment = normalizeEquipmentRows(state.equipment);
  state.equipment.push(defaultEquipmentCandidate(slot, false));
  renderEquipmentTable();
  calc();
}

function equipmentSlotBodyFor(slot) {
  if (slot === "武器: 右手") return document.querySelector("#equipmentWeaponRightBody");
  if (slot === "武器: 左手") return document.querySelector("#equipmentWeaponLeftBody");
  if (slot === "武器: 弾丸") return document.querySelector("#equipmentWeaponBulletBody");
  return document.querySelector(`[data-equipment-slot-body="${CSS.escape(slot || "")}"]`);
}


const EQUIPMENT_FILTER_DEFAULT = {text:"", slot:"all", status:"all"};

function equipmentFilterState() {
  return {
    text: (byId("equipmentFilterText")?.value || "").trim().toLowerCase(),
    slot: byId("equipmentFilterSlot")?.value || "all",
    status: byId("equipmentFilterStatus")?.value || "all"
  };
}

function populateEquipmentFilterSlotOptions() {
  const select = byId("equipmentFilterSlot");
  if (!select || select.dataset.ready === "1") return;

  const groups = [
    ["全スロット", ["all"]],
    ["武器", EQUIPMENT_SLOTS.filter(x => x.slot.startsWith("武器: ")).map(x => x.slot)],
    ["防具", EQUIPMENT_SLOTS.filter(x => x.slot.startsWith("防具: ")).map(x => x.slot)],
    ["装飾", EQUIPMENT_SLOTS.filter(x => x.slot.startsWith("装飾: ")).map(x => x.slot)]
  ];

  select.innerHTML = "";
  groups.forEach(([label, slots]) => {
    if (label === "全スロット") {
      const opt = document.createElement("option");
      opt.value = "all";
      opt.textContent = "全スロット";
      select.appendChild(opt);
      return;
    }

    const group = document.createElement("optgroup");
    group.label = label;
    slots.forEach(slot => {
      const opt = document.createElement("option");
      opt.value = slot;
      opt.textContent = slot.replace(/^武器: /, "").replace(/^防具: /, "").replace(/^装飾: /, "");
      group.appendChild(opt);
    });
    select.appendChild(group);
  });
  select.dataset.ready = "1";
}

function setupEquipmentFilterControls() {
  populateEquipmentFilterSlotOptions();
  ["equipmentFilterText", "equipmentFilterSlot", "equipmentFilterStatus"].forEach(id => {
    const el = byId(id);
    if (!el || el.dataset.equipmentFilterReady === "1") return;
    const handler = () => renderEquipmentTable();
    el.addEventListener(id === "equipmentFilterText" ? "input" : "change", handler);
    el.dataset.equipmentFilterReady = "1";
  });
}

function clearEquipmentFilters() {
  if (byId("equipmentFilterText")) byId("equipmentFilterText").value = "";
  if (byId("equipmentFilterSlot")) byId("equipmentFilterSlot").value = "all";
  if (byId("equipmentFilterStatus")) byId("equipmentFilterStatus").value = "all";
  renderEquipmentTable();
}

function equipmentCandidateSearchText(row) {
  const effects = Array.isArray(row.extraEffects)
    ? row.extraEffects.map(e => `${e.type || ""} ${e.target || ""} ${e.value || ""} ${e.unit || ""} ${e.label || ""}`).join(" ")
    : "";
  const reqs = Array.isArray(row.weaponReq)
    ? row.weaponReq.map(r => `${r.name || ""} ${r.required || ""}`).join(" ")
    : "";
  return [
    row.slot, row.name, row.note, row.tags,
    row.equipBuffName, row.equipBuffNote,
    row.importUrl, row.importSource,
    effects, reqs,
    additionalEffectsSummary(row).join(" "),
    extraStatsEffectText(row, "base"),
    extraStatsEffectText(row, "equipBuff")
  ].filter(Boolean).join(" ").toLowerCase();
}

function equipmentCandidateMatchesFilter(row, filter=equipmentFilterState()) {
  if (filter.slot !== "all" && row.slot !== filter.slot) return false;

  if (filter.text) {
    const terms = filter.text.split(/\s+/).filter(Boolean);
    const haystack = equipmentCandidateSearchText(row);
    if (!terms.every(term => haystack.includes(term))) return false;
  }

  switch (filter.status) {
    case "enabled": return row.enabled !== false;
    case "disabled": return row.enabled === false;
    case "fixed": return !!row.optimizerFixed;
    case "excluded": return !!row.optimizerExcluded;
    case "buff": return !!(row.equipBuffEnabled || row.equipBuffName || row.equipBuffNote || equipmentBuffHasEffect(row));
    case "idb": return !!(row.importedFromIdb || row.importSource === "officialDB" || /idb\.moepic\.com/i.test(row.importUrl || ""));
    default: return true;
  }
}

function updateEquipmentFilterSummary(total, visible) {
  const el = byId("equipmentFilterSummary");
  if (!el) return;
  const f = equipmentFilterState();
  const active = [
    f.text ? `検索「${f.text}」` : "",
    f.slot !== "all" ? f.slot : "",
    f.status !== "all" ? byId("equipmentFilterStatus")?.selectedOptions?.[0]?.textContent || f.status : ""
  ].filter(Boolean);
  el.textContent = active.length
    ? `${visible} / ${total}件を表示中（${active.join(" / ")}）`
    : `${total}件`;
}

function equipmentCandidateHasUserContent(row) {
  return !!(
    row.name || row.note || row.tags || row.importedFromIdb || row.importSource ||
    equipmentEffectText(row) !== "補正なし" ||
    equipmentBuffHasEffect(row) ||
    row.equipBuffName || row.equipBuffNote
  );
}

function deleteFilteredEquipmentCandidates() {
  state.equipment = normalizeEquipmentRows(state.equipment);
  const filter = equipmentFilterState();
  const targets = state.equipment.filter(row =>
    row.enabled === false &&
    equipmentCandidateMatchesFilter(row, filter) &&
    equipmentCandidateHasUserContent(row)
  );

  if (!targets.length) {
    alert("削除対象の未使用候補がありません。使用中の候補と空の初期候補は削除しません。");
    return;
  }

  if (!confirm(`表示中の未使用候補 ${targets.length} 件を削除します。よろしいですか？`)) return;

  const deleteSet = new Set(targets);
  state.equipment = state.equipment.filter(row => !deleteSet.has(row));
  renderEquipmentTable();
  renderTagLinkSummary();
  renderShowcaseTab();
  calc();
}


/* 武器/防具/装飾の候補テーブルを描画する。防具・装飾は部位ごとのカテゴリに分けて表示する。 */
function renderEquipmentTable() {
  setupEquipmentFilterControls();

  document.querySelectorAll("#equipmentWeaponRightBody, #equipmentWeaponLeftBody, #equipmentWeaponBulletBody, [data-equipment-slot-body]").forEach(tbody => {
    tbody.innerHTML = "";
  });

  state.equipment = normalizeEquipmentRows(state.equipment);
  const filter = equipmentFilterState();

  let total = 0;
  let visible = 0;

  state.equipment.forEach((row, idx) => {
    if (row.enabled === undefined) row.enabled = true;
    total += 1;

    if (!equipmentCandidateMatchesFilter(row, filter)) return;

    const body = equipmentSlotBodyFor(row.slot);
    if (!body) return;
    body.appendChild(makeEquipmentInputRow(row, false, idx));
    visible += 1;
  });

  updateEquipmentFilterSummary(total, visible);
}

/* 旧項目: 実数ステータス加算表を描画する。 */
function renderFlatTable() {
  const tbody = document.querySelector("#flatStatTable tbody");
  tbody.innerHTML = "";
  if (!state.flat.length) {
    renderEmptyRow(tbody, 7, "実数加算行はありません。必要な場合だけ行を追加してください。");
    return;
  }

  state.flat.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.appendChild(checkboxCell(row, "enabled"));
    tr.appendChild(checkboxCell(row, "slot"));

    const name = makeCell("input", {value: row.name || ""});
    name.oninput = () => { row.name = name.value; };
    tr.appendChild(makeCell("td")).appendChild(name);

    const target = makeCell("select");
    target.innerHTML = flatTargetOptions(row.target || "magic");
    target.onchange = () => { row.target = target.value; calc(); };
    tr.appendChild(makeCell("td")).appendChild(target);

    const value = makeCell("input", {type:"number", step:"0.1", value: row.value ?? 0});
    value.oninput = () => { row.value = parseFloat(value.value) || 0; calc(); };
    tr.appendChild(makeCell("td")).appendChild(value);

    const note = makeCell("input", {value: row.note || ""});
    note.oninput = () => { row.note = note.value; };
    tr.appendChild(makeCell("td")).appendChild(note);

    tr.appendChild(actionCell(state.flat, idx, renderFlatTable));
    tbody.appendChild(tr);
  });
}
/* 旧項目: 実数ステータス加算行を追加する。 */
function addFlatRow(target="magic") {
  state.flat.push({enabled:true, slot:true, name:flatTargetDefaultName(target), target, value:0, note:""});
  renderFlatTable();
  calc();
}

/* 旧項目: ステータス変換表を描画する。 */
function renderConversionTable() {
  const tbody = document.querySelector("#conversionTable tbody");
  tbody.innerHTML = "";
  if (!state.conv.length) {
    renderEmptyRow(tbody, 8, "ステータス変換行はありません。必要な場合だけ行を追加してください。");
    return;
  }

  state.conv.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.appendChild(checkboxCell(row, "enabled"));
    tr.appendChild(checkboxCell(row, "slot"));

    const name = makeCell("input", {value: row.name || ""});
    name.oninput = () => { row.name = name.value; };
    tr.appendChild(makeCell("td")).appendChild(name);

    const source = makeCell("select");
    source.innerHTML = sourceOptions(row.source || "magic");
    source.onchange = () => { row.source = source.value; calc(); };
    tr.appendChild(makeCell("td")).appendChild(source);

    const rate = makeCell("input", {type:"number", step:"1", value: row.rate ?? 0});
    rate.oninput = () => { row.rate = parseFloat(rate.value) || 0; calc(); };
    tr.appendChild(makeCell("td")).appendChild(rate);

    const baseOffset = makeCell("input", {type:"number", step:"0.1", value: row.baseOffset ?? 0});
    baseOffset.oninput = () => { row.baseOffset = parseFloat(baseOffset.value) || 0; calc(); };
    tr.appendChild(makeCell("td")).appendChild(baseOffset);

    const note = makeCell("input", {value: row.note || ""});
    note.oninput = () => { row.note = note.value; };
    tr.appendChild(makeCell("td")).appendChild(note);

    tr.appendChild(actionCell(state.conv, idx, renderConversionTable));
    tbody.appendChild(tr);
  });
}
/* 旧項目: ステータス変換行を追加する。 */
function addConversionRow(source="magic") {
  state.conv.push({enabled:true, slot:true, name:`${labelOf(source)}→攻撃力 変換`, source, rate:0, baseOffset:0, offset:0, capped:false, note:""});
  renderConversionTable();
  calc();
}

/* 与ダメ/特攻/外枠など、単一数値を持つ表を描画する共通関数。 */
function renderNumericTable(type) {
  const tableId = type === "magicFlat" ? "magicBuffTable" : type === "atk" ? "atkBuffTable" : type === "dmg" ? "dmgBuffTable" : type === "special" ? "specialBuffTable" : "postBuffTable";
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = "";
  if (!state[type].length) {
    const label = type === "dmg" ? "与ダメ行" : type === "special" ? "特攻行" : "外枠補正行";
    const colspan = type === "dmg" ? 7 : type === "post" ? 7 : 6;
    renderEmptyRow(tbody, colspan, `${label}はありません。必要な場合だけ行を追加してください。`);
    return;
  }

  state[type].forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.appendChild(checkboxCell(row, "enabled"));
    tr.appendChild(checkboxCell(row, "slot"));

    const name = makeCell("input", {value: row.name || ""});
    name.oninput = () => { row.name = name.value; renderTagLinkSummary(); };
    tr.appendChild(makeCell("td")).appendChild(name);

    if (type === "post") {
      tr.appendChild(tagInputCell(row));
    }

    const value = makeCell("input", {type:"number", step:"0.1", value: row.value ?? 0});
    value.oninput = () => { row.value = parseFloat(value.value) || 0; calc(); };
    tr.appendChild(makeCell("td")).appendChild(value);

    if (type === "dmg") {
      const cat = makeCell("input", {value: row.category || ""});
      cat.oninput = () => { row.category = cat.value; };
      tr.appendChild(makeCell("td")).appendChild(cat);
    }

    const note = makeCell("input", {value: row.note || ""});
    note.oninput = () => { row.note = note.value; };
    tr.appendChild(makeCell("td")).appendChild(note);

    const del = makeCell("button", {type:"button", title:"削除", class:"dangerMini"}, "×");
    del.onclick = () => { state[type].splice(idx, 1); renderAll(); calc(); };
    tr.appendChild(makeCell("td")).appendChild(del);

    tbody.appendChild(tr);
  });
}
/* 与ダメ/特攻/外枠などの行を追加する共通関数。 */
function addRow(type) {
  if (type === "magicFlat") state.magicFlat.push({enabled:true, slot:true, name:"新規魔力", value:0, note:""});
  if (type === "atk") state.atk.push({enabled:true, slot:true, name:"新規攻撃力", value:0, note:""});
  if (type === "dmg") state.dmg.push({enabled:true, slot:true, name:"新規与ダメ", value:0, category:"", note:""});
  if (type === "special") state.special.push({enabled:true, slot:false, name:"新規特攻", value:1.5, note:""});
  if (type === "post") state.post.push({enabled:true, slot:false, name:"新規外枠", tags:"", value:1, note:""});
  renderAll();
  calc();
}

/* その他バフ表を描画する。ここはダメージ計算せずバフ枠だけに使う。 */
function renderOtherTable() {
  const tbody = document.querySelector("#otherBuffTable tbody");
  tbody.innerHTML = "";
  if (!state.other.length) {
    renderEmptyRow(tbody, 5, "その他バフ行はありません。バフ枠だけ数えたいものがある場合に追加してください。");
    return;
  }

  state.other.forEach((row, idx) => {
    const tr = document.createElement("tr");

    const enabled = makeCell("input", {type:"checkbox", checked: !!row.enabled});
    enabled.onchange = () => { row.enabled = enabled.checked; calc(); };
    tr.appendChild(makeCell("td")).appendChild(enabled);

    const name = makeCell("input", {value: row.name || ""});
    name.oninput = () => { row.name = name.value; renderTagLinkSummary(); };
    tr.appendChild(makeCell("td")).appendChild(name);

    tr.appendChild(tagInputCell(row));

    const note = makeCell("input", {value: row.note || ""});
    note.oninput = () => { row.note = note.value; };
    tr.appendChild(makeCell("td")).appendChild(note);

    const del = makeCell("button", {type:"button", title:"削除", class:"dangerMini"}, "×");
    del.onclick = () => { state.other.splice(idx, 1); renderOtherTable(); calc(); };
    tr.appendChild(makeCell("td")).appendChild(del);
    tbody.appendChild(tr);
  });
}
/* その他バフ行を追加する。 */
function addOtherRow() {
  state.other.push({enabled:true, name:"その他バフ", tags:"", note:""});
  renderOtherTable();
  calc();
}

/* state全体を画面へ再描画する。applyConfig後やリセット後に呼ぶ。 */

let integratedOptimizerResults = [];
let optimizerLastSummary = null;
let optimizerLastPayload = null;

function integratedOptimizerSettings() {
  const settings = {
    maxSlots: Math.max(0, parseInt(byId("optimizerMaxSlots")?.value, 10) || 24),
    topN: Math.max(1, parseInt(byId("optimizerTopN")?.value, 10) || 10),
    accuracyPreset: byId("optimizerAccuracyPreset")?.value || "balanced",
    beamWidth: Math.max(10, parseInt(byId("optimizerBeamWidth")?.value, 10) || 100),
    equipmentEvalLimit: Math.max(1, parseInt(byId("optimizerEquipmentEvalLimit")?.value, 10) || 50),
    exactEquipmentLimit: Math.max(0, parseInt(byId("optimizerExactEquipmentLimit")?.value, 10) || 3000),
    buffMode: byId("optimizerBuffMode")?.value || "local",
    buffBeamWidth: Math.max(20, parseInt(byId("optimizerBuffBeamWidth")?.value, 10) || 120),
    localPasses: Math.max(1, parseInt(byId("optimizerLocalPasses")?.value, 10) || 8),
    objective: byId("optimizerObjective")?.value || "damage",
    secondaryObjective: byId("optimizerSecondaryObjective")?.value || "",
    targetValueRaw: byId("optimizerTargetValue")?.value ?? "",
    targetOverRaw: byId("optimizerTargetOver")?.value ?? "",
    includeDisabledBuffs: byId("optimizerIncludeDisabledBuffs") ? !!byId("optimizerIncludeDisabledBuffs").checked : true,
    fixCurrentBuffs: !!byId("optimizerFixCurrentBuffs")?.checked,
    forceOtherBuffs: byId("optimizerForceOtherBuffs") ? !!byId("optimizerForceOtherBuffs").checked : true,
    includeCurrentConfig: byId("optimizerIncludeCurrentConfig") ? !!byId("optimizerIncludeCurrentConfig").checked : true,
    onlyBetterThanCurrent: byId("optimizerOnlyBetterThanCurrent") ? !!byId("optimizerOnlyBetterThanCurrent").checked : true,
    evaluateCurrentEquipment: byId("optimizerEvaluateCurrentEquipment") ? !!byId("optimizerEvaluateCurrentEquipment").checked : true
  };

  // 速度改善で落ちた精度を戻せるよう、プリセットで実効値を調整する。
  // UIの入力値は残しつつ、内部探索だけ補正する。
  if (settings.accuracyPreset === "fast") {
    settings.beamWidth = Math.min(settings.beamWidth, 40);
    settings.equipmentEvalLimit = Math.min(settings.equipmentEvalLimit, 15);
    settings.exactEquipmentLimit = Math.min(settings.exactEquipmentLimit, 500);
    settings.localPasses = Math.min(settings.localPasses, 3);
    if (settings.buffMode === "beam") settings.buffMode = "local";
  } else if (settings.accuracyPreset === "accurate") {
    settings.beamWidth = Math.max(settings.beamWidth, 160);
    settings.equipmentEvalLimit = Math.max(settings.equipmentEvalLimit, 100);
    settings.exactEquipmentLimit = Math.max(settings.exactEquipmentLimit, 8000);
    settings.buffBeamWidth = Math.max(settings.buffBeamWidth, 180);
    settings.localPasses = Math.max(settings.localPasses, 12);
    if (settings.buffMode === "fast") settings.buffMode = "local";
  }

  return settings;
}

function optimizerObjectiveRawValue(m, objective) {
  if (objective === "attack") return m.atk;
  if (objective === "magic") return m.stats.magic;
  if (objective === "slotsMin") return m.slots?.total || 0;
  if (String(objective || "").startsWith("extra")) return +(m.extraStats?.[objective] || 0);
  return m.finalDamage;
}

function optimizerMetricValue(m, objective) {
  if (objective === "slotsMin") return -optimizerObjectiveRawValue(m, objective);
  return optimizerObjectiveRawValue(m, objective);
}

function optimizerObjectiveLabel(objective) {
  return ({
    damage:"最大ダメージ",
    attack:"最大攻撃力",
    magic:"最大魔力",
    slotsMin:"枠数最小",
    extraAC:"最大AC",
    extraHP:"最大HP",
    extraST:"最大ST",
    extraHit:"最大命中",
    extraAvoid:"最大回避",
    extraAttackDelay:"最大攻撃ディレイ",
    extraMagicDelay:"最大魔法ディレイ",
    extraDamageReducePct:"最大被ダメ軽減",
    extraCritRatePct:"最大クリ率"
  })[objective] || "なし";
}

const OPTIMIZER_INVALID_SCORE = -1000000000000;

function optimizerNumberOrNull(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function optimizerPrimaryTargetSettings(settings) {
  const objective = settings?.objective || "damage";
  let target = optimizerNumberOrNull(settings?.targetValueRaw);
  let over = optimizerNumberOrNull(settings?.targetOverRaw);

  // クリ率最大化では、未入力でも「100%を目標、105%まで許容」として扱う。
  // 100%未満より、100～105%の到達構成を優先する。
  if (objective === "extraCritRatePct" && target === null) {
    target = 100;
    if (over === null) over = 5;
  }

  if (target === null) return null;
  if (over !== null && over < 0) over = 0;
  return {objective, target, over};
}

function optimizerPrimaryTargetDescription(settings) {
  const t = optimizerPrimaryTargetSettings(settings);
  if (!t) return "";
  const over = t.over === null ? "" : ` / 超過許容 +${fmt(t.over, 1)}`;
  return `${optimizerObjectiveLabel(t.objective)} 目標 ${fmt(t.target, 1)}${over}`;
}

function optimizerEffectiveTotal(base, flat, pctValue) {
  return ((+base || 0) + (+flat || 0)) * (1 + ((+pctValue || 0) / 100));
}

function optimizerEffectiveIncrease(base, flat, pctValue) {
  return optimizerEffectiveTotal(base, flat, pctValue) - (+base || 0);
}

function optimizerCritRateCap(settings) {
  const t = optimizerPrimaryTargetSettings(settings);
  if (t && t.objective === "extraCritRatePct" && t.over !== null) {
    return t.target + t.over;
  }
  return 100;
}

function optimizerStatCapRows(m, settings=null) {
  const extra = m.extraStats || {};
  const d = skillSimDerived();

  return [
    {label:"クリ率上昇量", value: +extra.extraCritRatePct || 0, cap: optimizerCritRateCap(settings), note:"素のクリ率は上限判定から除外"},
    {label:"命中上昇量", value: optimizerEffectiveIncrease(d.hit, +extra.extraHit || 0, +extra.extraHitPct || 0), cap:500},
    {label:"AC", value: optimizerEffectiveTotal(0, +extra.extraAC || 0, +extra.extraACPct || 0), cap:500},
    {label:"魔力", value: +m.stats.magic || 0, cap:500},
    {label:"回避", value: optimizerEffectiveTotal(d.avoid, +extra.extraAvoid || 0, +extra.extraAvoidPct || 0), cap:500},
    {label:"ST", value: optimizerEffectiveTotal(d.st, +extra.extraST || 0, +extra.extraSTPct || 0), cap:500},
    {label:"HP", value: optimizerEffectiveTotal(d.hp, +extra.extraHP || 0, +extra.extraHPPct || 0), cap:1000},
    {label:"MP", value: optimizerEffectiveTotal(d.mp, +extra.extraMP || 0, +extra.extraMPPct || 0), cap:1000},
    {label:"火耐性", value: optimizerEffectiveTotal(0, +extra.extraFireRes || 0, +extra.extraFireResPct || 0), cap:180},
    {label:"水耐性", value: optimizerEffectiveTotal(0, +extra.extraWaterRes || 0, +extra.extraWaterResPct || 0), cap:180},
    {label:"地耐性", value: optimizerEffectiveTotal(0, +extra.extraEarthRes || 0, +extra.extraEarthResPct || 0), cap:180},
    {label:"風耐性", value: optimizerEffectiveTotal(0, +extra.extraWindRes || 0, +extra.extraWindResPct || 0), cap:180},
    {label:"無耐性", value: optimizerEffectiveTotal(0, +extra.extraNeutralRes || 0, +extra.extraNeutralResPct || 0), cap:180}
  ];
}

function optimizerStatCapViolations(m, settings=null) {
  const eps = 0.000001;
  // 上限ちょうどは有効。クリ率目標100%なら、既定で105%までは通し、超過だけ除外する。
  return optimizerStatCapRows(m, settings)
    .filter(r => r.value > r.cap + eps)
    .map(r => `${r.label} ${fmt(r.value, 2)}/${fmt(r.cap, 0)}${r.note ? `（${r.note}）` : ""}`);
}

function optimizerTargetOverViolations(m, settings) {
  const t = optimizerPrimaryTargetSettings(settings);
  if (!t || t.over === null) return [];
  const value = optimizerObjectiveRawValue(m, t.objective);
  const eps = 0.000001;
  return value > t.target + t.over + eps
    ? [`${optimizerObjectiveLabel(t.objective)} ${fmt(value, 2)} が目標 ${fmt(t.target, 2)} + 許容 ${fmt(t.over, 2)} を超過`]
    : [];
}

function optimizerObjectiveList(settings) {
  const list = [];
  const primary = settings?.objective || "damage";
  const secondary = settings?.secondaryObjective || "";
  if (primary) list.push(primary);
  if (secondary && secondary !== primary) list.push(secondary);
  return list.length ? list : ["damage"];
}

function optimizerTargetRankForPrimary(m, settings) {
  const t = optimizerPrimaryTargetSettings(settings);
  if (!t) return [optimizerMetricValue(m, settings?.objective || "damage")];

  const value = optimizerObjectiveRawValue(m, t.objective);
  if (t.objective === "slotsMin") {
    // 枠数最小だけは「目標以下なら到達」とする。
    if (value <= t.target) return [1, -Math.abs(value - t.target)];
    return [0, -value];
  }

  // 最大化系: 目標以上を最優先。到達後は目標値に近いほどよい。
  // 例: クリ率目標100なら 100 > 101 > 105 > 99。
  if (value >= t.target) return [1, -Math.abs(value - t.target)];
  return [0, value];
}

function optimizerEvaluationFromMetrics(m, settings) {
  const violations = optimizerStatCapViolations(m, settings).concat(optimizerTargetOverViolations(m, settings));
  if (violations.length) return {score: OPTIMIZER_INVALID_SCORE, rank: [OPTIMIZER_INVALID_SCORE], violations};

  const objectives = optimizerObjectiveList(settings);
  let rank = [];
  if (optimizerPrimaryTargetSettings(settings)) {
    rank = rank.concat(optimizerTargetRankForPrimary(m, settings));
    objectives.slice(1).forEach(obj => rank.push(optimizerMetricValue(m, obj)));
  } else {
    rank = objectives.map(obj => optimizerMetricValue(m, obj));
  }
  return {score: rank[0] ?? 0, rank, violations: []};
}

function optimizerMetricValueWithCaps(m, objective, settings=null) {
  const s = {...(settings || {}), objective};
  return optimizerEvaluationFromMetrics(m, s).score;
}

function optimizerCompareRankValues(a, b) {
  const left = Array.isArray(a) ? a : [a ?? OPTIMIZER_INVALID_SCORE];
  const right = Array.isArray(b) ? b : [b ?? OPTIMIZER_INVALID_SCORE];
  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i++) {
    const av = left[i] ?? 0;
    const bv = right[i] ?? 0;
    const tol = optimizerScoreTolerance(Math.max(Math.abs(av), Math.abs(bv)));
    if (av > bv + tol) return 1;
    if (av < bv - tol) return -1;
  }
  return 0;
}

function optimizerCompareEvaluations(a, b) {
  return optimizerCompareRankValues(a?.rank || [a?.score], b?.rank || [b?.score]);
}

function optimizerSortByEvaluation(a, b) {
  const cmp = optimizerCompareEvaluations(a, b);
  if (cmp) return -cmp;
  const aSlots = a?.metrics?.slots?.total ?? 9999;
  const bSlots = b?.metrics?.slots?.total ?? 9999;
  if (aSlots !== bSlots) return aSlots - bSlots;
  const aBuffs = a?.compositeIdxs?.length ?? 9999;
  const bBuffs = b?.compositeIdxs?.length ?? 9999;
  return aBuffs - bBuffs;
}


function equipmentCandidateHasData(row) {
  return !!(
    row.enabled || row.optimizerFixed || row.optimizerExcluded || row.name || row.tags || row.note ||
    +row.attack || +row.magic || +row.speed || +row.delay ||
    +row.weaponDamage || +row.weaponWeight || +row.weaponAttackInterval || +row.weaponRange || +row.weaponDurability || row.weaponTwoHanded === "○" ||
    normalizeWeaponReqRowsForEquipment(row.weaponReq).some(r => +r.required) ||
    row.equipBuffEnabled || equipmentBuffHasEffect(row) ||
    extraStatsHasEffect(row, "base")
  );
}


function optimizerPrepareRunCaches(settings) {
  settings._equipmentRows = normalizeEquipmentRows(state.equipment);
  settings._compositeRows = normalizeCompositeRows(state.composite);
  settings._otherRows = Array.isArray(state.other) ? state.other : [];
  settings._postRows = Array.isArray(state.post) ? state.post : [];
  settings._evaluationCache = new Map();
  settings._compositeCandidates = null;
  settings._equipmentConflictKeyCache = new Map();
  settings.optimizerEvalCount = 0;
  settings.optimizerCacheHits = 0;
}

function optimizerEquipmentRows(settings) {
  return settings?._equipmentRows || normalizeEquipmentRows(state.equipment);
}

function optimizerCompositeRows(settings) {
  return settings?._compositeRows || normalizeCompositeRows(state.composite);
}

const OPTIMIZER_EQUIPMENT_SLOT_ORDER = new Map(EQUIPMENT_SLOTS.map((x, i) => [x.slot, i]));

function optimizerCanonicalEquipmentIdxs(equipmentIdxs, settings=null) {
  const rows = optimizerEquipmentRows(settings);
  return Array.from(new Set(equipmentIdxs || []))
    .sort((a,b) => {
      const ar = rows[a] || {};
      const br = rows[b] || {};
      const as = OPTIMIZER_EQUIPMENT_SLOT_ORDER.has(ar.slot) ? OPTIMIZER_EQUIPMENT_SLOT_ORDER.get(ar.slot) : 9999;
      const bs = OPTIMIZER_EQUIPMENT_SLOT_ORDER.has(br.slot) ? OPTIMIZER_EQUIPMENT_SLOT_ORDER.get(br.slot) : 9999;
      if (as !== bs) return as - bs;
      return a - b;
    });
}

function optimizerEquipmentSelectionKey(equipmentIdxs, settings=null) {
  return optimizerCanonicalEquipmentIdxs(equipmentIdxs, settings).join(",");
}

function optimizerCompositeSelectionKey(compositeIdxs) {
  return Array.from(new Set(compositeIdxs || [])).sort((a,b) => a - b).join(",");
}

function optimizerResultDedupeKey(result, settings=null) {
  // 装備の並び順だけが違う結果を同一扱いにする。
  // Buffも同じなら完全重複、Buffが違っても最終的に同じ装備構成だけの重複表示を抑制する。
  return optimizerEquipmentSelectionKey(result?.equipmentIdxs || [], settings);
}

function optimizerSelectionCacheKey(equipmentIdxs, compositeIdxs, settings) {
  const equipKey = optimizerEquipmentSelectionKey(equipmentIdxs, settings);
  const buffKey = optimizerCompositeSelectionKey(compositeIdxs);
  return [
    equipKey,
    buffKey,
    settings?.forceOtherBuffs === false ? "noOther" : "other",
    settings?.objective || "damage",
    settings?.secondaryObjective || "",
    settings?.targetValueRaw ?? "",
    settings?.targetOverRaw ?? ""
  ].join("|");
}

function optimizerEquipmentConflictKeysForIndex(idx, settings) {
  const rows = optimizerEquipmentRows(settings);
  if (!settings) return optimizerEquipmentConflictKeys(rows[idx]);
  if (!settings._equipmentConflictKeyCache) settings._equipmentConflictKeyCache = new Map();
  if (!settings._equipmentConflictKeyCache.has(idx)) {
    settings._equipmentConflictKeyCache.set(idx, optimizerEquipmentConflictKeys(rows[idx]));
  }
  return settings._equipmentConflictKeyCache.get(idx);
}


function optimizerEquipmentGroups(settings) {
  const rows = optimizerEquipmentRows(settings);
  return EQUIPMENT_SLOTS.map(({slot}) => {
    let candidates = rows
      .map((row, idx) => ({row, idx}))
      .filter(x => x.row.slot === slot && equipmentCandidateHasData(x.row));

    const fixed = candidates.filter(x => x.row.optimizerFixed && !x.row.optimizerExcluded);
    if (fixed.length) {
      candidates = fixed.slice(0, 1);
    } else {
      candidates = candidates.filter(x => !x.row.optimizerExcluded);
    }

    if (!candidates.length) {
      const blank = defaultEquipmentCandidate(slot, false);
      if (settings && settings._equipmentRows) {
        settings._equipmentRows.push(blank);
        state.equipment.push(blank);
        candidates = [{row: blank, idx: settings._equipmentRows.length - 1}];
      } else {
        state.equipment.push(blank);
        candidates = [{row: state.equipment[state.equipment.length - 1], idx: state.equipment.length - 1}];
      }
    }
    return {slot, candidates};
  });
}

function optimizerStateForSelection(equipmentIdxs, compositeIdxs, settings=null) {
  const equipmentRows = optimizerEquipmentRows(settings);
  const compositeRows = optimizerCompositeRows(settings);
  const canonicalEquipmentIdxs = optimizerCanonicalEquipmentIdxs(equipmentIdxs || [], settings);
  const selectedEquipment = new Set(canonicalEquipmentIdxs);
  const selectedBuffs = new Set(compositeIdxs || []);

  // JSON deep cloneを毎評価で行うと重いので、最適化中だけ浅いstateを作る。
  // computeMetrics側で必要な展開・正規化は行うため、ON/OFFだけ差し替えれば足りる。
  const st = {
    ...state,
    equipment: equipmentRows.map((row, idx) => {
      const enabled = selectedEquipment.has(idx);
      return row.enabled === enabled ? row : {...row, enabled};
    }),
    composite: compositeRows.map((row, idx) => {
      const enabled = selectedBuffs.has(idx);
      return row.enabled === enabled ? row : {...row, enabled};
    })
  };

  if (settings && settings.forceOtherBuffs === false) {
    st.other = (settings._otherRows || state.other || []).map(row => row.enabled === false ? row : {...row, enabled:false});
  } else if (settings && settings._otherRows) {
    st.other = settings._otherRows;
  }

  if (settings && settings._postRows) st.post = settings._postRows;

  return st;
}

function optimizerEquipmentConflictKeys(row) {
  return splitTags(row?.tags).map(x => x.toLowerCase());
}

function optimizerEquipmentWouldConflict(selectedIdxs, candidateIdx, settings=null) {
  const candKeys = optimizerEquipmentConflictKeysForIndex(candidateIdx, settings);
  if (!candKeys.length) return false;

  const selectedKeys = new Set();
  selectedIdxs.forEach(idx => {
    optimizerEquipmentConflictKeysForIndex(idx, settings).forEach(k => selectedKeys.add(k));
  });

  return candKeys.some(k => selectedKeys.has(k));
}

function optimizerEquipmentConflictNames(equipmentIdxs) {
  const rows = normalizeEquipmentRows(state.equipment);
  const seen = new Map();
  const conflicts = new Set();

  equipmentIdxs.forEach(idx => {
    const row = rows[idx];
    optimizerEquipmentConflictKeys(row).forEach(k => {
      if (seen.has(k)) conflicts.add(k);
      else seen.set(k, row);
    });
  });

  return Array.from(conflicts);
}




function optimizerDedupeResultsByEquipment(results, settings=null) {
  const bestByKey = new Map();
  let removed = 0;

  (results || []).forEach(r => {
    r.equipmentIdxs = optimizerCanonicalEquipmentIdxs(r.equipmentIdxs || [], settings);
    const key = optimizerResultDedupeKey(r, settings);
    const current = bestByKey.get(key);
    if (!current || optimizerCompareEvaluations(r, current) > 0) {
      if (current) removed++;
      bestByKey.set(key, r);
    } else {
      removed++;
    }
  });

  if (settings) settings.optimizerDuplicateRemoved = (settings.optimizerDuplicateRemoved || 0) + removed;
  return Array.from(bestByKey.values());
}


function optimizerEquipmentGroupProduct(groups) {
  return (groups || []).reduce((n, g) => n * Math.max(1, (g.candidates || []).length), 1);
}

function optimizerBuildEquipmentExact(inputs, settings) {
  const groups = optimizerEquipmentGroups(settings);
  const roughTotal = optimizerEquipmentGroupProduct(groups);

  if (!settings.exactEquipmentLimit || roughTotal > settings.exactEquipmentLimit) {
    settings.optimizerEquipmentExactTotal = roughTotal;
    settings.optimizerEquipmentSearchMode = "beam";
    return null;
  }

  const out = [];
  let aborted = false;
  settings.equipmentConflictSkipped = 0;

  const dfs = (groupIndex, selected, selectedKeys) => {
    if (aborted) return;

    if (groupIndex >= groups.length) {
      const st = optimizerStateForSelection(selected, [], settings);
      const m = computeMetrics(st, inputs);
      const ev = optimizerEvaluationFromMetrics(m, settings);
      out.push({equipmentIdxs: optimizerCanonicalEquipmentIdxs(selected, settings), score: ev.score, rank: ev.rank, metrics: m});
      if (out.length > settings.exactEquipmentLimit) aborted = true;
      return;
    }

    const group = groups[groupIndex];
    group.candidates.forEach(cand => {
      const keys = optimizerEquipmentConflictKeysForIndex(cand.idx, settings);
      if (keys.some(k => selectedKeys.has(k))) {
        settings.equipmentConflictSkipped++;
        return;
      }

      const nextKeys = new Set(selectedKeys);
      keys.forEach(k => nextKeys.add(k));
      selected.push(cand.idx);
      dfs(groupIndex + 1, selected, nextKeys);
      selected.pop();
    });
  };

  dfs(0, [], new Set());

  if (aborted) {
    settings.optimizerEquipmentExactTotal = roughTotal;
    settings.optimizerEquipmentSearchMode = "beam";
    return null;
  }

  const dedupedOut = optimizerDedupeResultsByEquipment(out, settings);
  dedupedOut.sort(optimizerSortByEvaluation);
  settings.optimizerEquipmentExactTotal = roughTotal;
  settings.optimizerEquipmentSearchMode = "exact";
  return dedupedOut;
}

function optimizerBuildEquipmentCandidates(inputs, settings) {
  const exact = optimizerBuildEquipmentExact(inputs, settings);
  if (exact) return exact;
  return optimizerBuildEquipmentBeams(inputs, settings);
}


function optimizerBuildEquipmentBeams(inputs, settings) {
  const groups = optimizerEquipmentGroups(settings);
  settings.equipmentConflictSkipped = 0;
  settings.optimizerEquipmentSearchMode = "beam";
  if (!settings.optimizerEquipmentExactTotal) settings.optimizerEquipmentExactTotal = optimizerEquipmentGroupProduct(groups);
  let beams = [{equipmentIdxs: [], score: 0}];

  groups.forEach(group => {
    const next = [];
    beams.forEach(beam => {
      group.candidates.forEach(cand => {
        if (optimizerEquipmentWouldConflict(beam.equipmentIdxs, cand.idx, settings)) {
          settings.equipmentConflictSkipped++;
          return;
        }

        const equipmentIdxs = optimizerCanonicalEquipmentIdxs(beam.equipmentIdxs.concat([cand.idx]), settings);
        const st = optimizerStateForSelection(equipmentIdxs, [], settings);
        const m = computeMetrics(st, inputs);
        const ev = optimizerEvaluationFromMetrics(m, settings);
        next.push({equipmentIdxs, score: ev.score, rank: ev.rank, metrics: m});
      });
    });
    const dedupedNext = optimizerDedupeResultsByEquipment(next, settings);
    dedupedNext.sort(optimizerSortByEvaluation);
    beams = dedupedNext.slice(0, settings.beamWidth);
  });

  return beams;
}

function optimizerCompositeCandidates(settings) {
  if (settings && settings._compositeCandidates) return settings._compositeCandidates;
  const rows = optimizerCompositeRows(settings);
  const candidates = rows
    .map((row, idx) => ({row, idx}))
    .filter(x => compositeHasEffect(x.row))
    .filter(x => settings.includeDisabledBuffs || x.row.enabled);
  if (settings) settings._compositeCandidates = candidates;
  return candidates;
}


function optimizerScoreTolerance(score) {
  return Math.max(0.000001, Math.abs(+score || 0) * 0.000000001);
}

function optimizerEvaluateBuffSelection(equipmentIdxs, compositeIdxs, inputs, settings) {
  const key = optimizerSelectionCacheKey(equipmentIdxs, compositeIdxs, settings);
  if (settings && settings._evaluationCache && settings._evaluationCache.has(key)) {
    settings.optimizerCacheHits = (settings.optimizerCacheHits || 0) + 1;
    return settings._evaluationCache.get(key);
  }

  const st = optimizerStateForSelection(equipmentIdxs, compositeIdxs, settings);
  const metrics = computeMetrics(st, inputs);
  const ev = optimizerEvaluationFromMetrics(metrics, settings);
  const result = {metrics, violations: ev.violations, score: ev.score, rank: ev.rank};

  if (settings && settings._evaluationCache) {
    settings.optimizerEvalCount = (settings.optimizerEvalCount || 0) + 1;
    settings._evaluationCache.set(key, result);
  }

  return result;
}

function optimizerPruneExternalBuffs(equipmentIdxs, selected, fixedSet, inputs, settings) {
  let current = optimizerEvaluateBuffSelection(equipmentIdxs, selected, inputs, settings);
  let prunedCount = 0;
  let changed = true;

  while (changed) {
    changed = false;

    for (let i = selected.length - 1; i >= 0; i--) {
      const idx = selected[i];
      if (fixedSet && fixedSet.has(idx)) continue;

      const trialSelected = selected.slice(0, i).concat(selected.slice(i + 1));
      const trial = optimizerEvaluateBuffSelection(equipmentIdxs, trialSelected, inputs, settings);

      const scoreKept = optimizerCompareEvaluations(trial, current) >= 0;
      const slotsNotWorse = trial.metrics.slots.total <= current.metrics.slots.total;
      const buffCountReduced = trialSelected.length < selected.length;

      if (scoreKept && slotsNotWorse && buffCountReduced) {
        selected = trialSelected;
        current = trial;
        prunedCount++;
        changed = true;
        break;
      }
    }
  }

  if (settings) settings.optimizerPrunedBuffs = (settings.optimizerPrunedBuffs || 0) + prunedCount;
  return {compositeIdxs: selected, metrics: current.metrics, score: current.score, rank: current.rank, prunedCount};
}

function optimizerCompleteGreedySelection(equipmentIdxs, inputs, settings, initialSelected, fixedSet=null) {
  let selected = Array.from(new Set(initialSelected || []));
  const selectedSet = new Set(selected);

  let evaluated = optimizerEvaluateBuffSelection(equipmentIdxs, selected, inputs, settings);

  let improved = true;
  while (improved) {
    improved = false;
    let best = null;

    optimizerCompositeCandidates(settings).forEach(cand => {
      if (selectedSet.has(cand.idx)) return;
      const trialBuffs = selected.concat([cand.idx]);
      const trial = optimizerEvaluateBuffSelection(equipmentIdxs, trialBuffs, inputs, settings);
      if (trial.metrics.slots.total > settings.maxSlots) return;

      if (!best || optimizerCompareEvaluations(trial, best) > 0) {
        best = {idx: cand.idx, metrics: trial.metrics, score: trial.score, rank: trial.rank};
      }
    });

    if (best && optimizerCompareEvaluations(best, evaluated) > 0) {
      selected.push(best.idx);
      selectedSet.add(best.idx);
      evaluated = {metrics: best.metrics, score: best.score, rank: best.rank};
      improved = true;
    }
  }

  return {selected, selectedSet, evaluated};
}

function optimizerSelectExternalBuffsGreedy(equipmentIdxs, inputs, settings) {
  const fixed = settings.fixCurrentBuffs ? optimizerCompositeCandidates(settings).filter(x => x.row.enabled) : [];
  const fixedSelected = fixed.map(x => x.idx);
  const fixedSet = new Set(fixedSelected);

  const completed = optimizerCompleteGreedySelection(equipmentIdxs, inputs, settings, fixedSelected, fixedSet);
  return optimizerPruneExternalBuffs(equipmentIdxs, completed.selected, fixedSet, inputs, settings);
}

function optimizerSelectExternalBuffsLocal(equipmentIdxs, inputs, settings) {
  const candidates = optimizerCompositeCandidates(settings);
  const fixed = settings.fixCurrentBuffs ? candidates.filter(x => x.row.enabled) : [];
  const fixedSet = new Set(fixed.map(x => x.idx));

  let current = optimizerSelectExternalBuffsGreedy(equipmentIdxs, inputs, settings);
  let selected = current.compositeIdxs.slice();
  let selectedSet = new Set(selected);
  let evaluated = {metrics: current.metrics, score: current.score, rank: current.rank};

  const maxPasses = Math.max(1, settings.localPasses || 8);
  for (let pass = 0; pass < maxPasses; pass++) {
    let best = null;

    // 1件追加
    candidates.forEach(add => {
      if (selectedSet.has(add.idx)) return;
      const trialIdxs = selected.concat([add.idx]);
      const trial = optimizerEvaluateBuffSelection(equipmentIdxs, trialIdxs, inputs, settings);
      if (trial.metrics.slots.total > settings.maxSlots) return;
      const candidate = {type:"add", idxs:trialIdxs, metrics:trial.metrics, score:trial.score, rank:trial.rank};
      if (!best || optimizerCompareEvaluations(candidate, best) > 0) best = candidate;
    });

    // 1件入れ替え
    selected.forEach(removeIdx => {
      if (fixedSet.has(removeIdx)) return;
      candidates.forEach(add => {
        if (selectedSet.has(add.idx)) return;
        const trialIdxs = selected.filter(idx => idx !== removeIdx).concat([add.idx]);
        const trial = optimizerEvaluateBuffSelection(equipmentIdxs, trialIdxs, inputs, settings);
        if (trial.metrics.slots.total > settings.maxSlots) return;
        const candidate = {type:"swap", idxs:trialIdxs, metrics:trial.metrics, score:trial.score, rank:trial.rank};
        if (!best || optimizerCompareEvaluations(candidate, best) > 0) best = candidate;
      });
    });

    // 1件外してからgreedyで詰め直す。greedyが掴んだ局所解から抜けるための軽めの精度回復策。
    selected.forEach(removeIdx => {
      if (fixedSet.has(removeIdx)) return;
      const baseIdxs = selected.filter(idx => idx !== removeIdx);
      const completed = optimizerCompleteGreedySelection(equipmentIdxs, inputs, settings, baseIdxs, fixedSet);
      const trial = completed.evaluated;
      if (trial.metrics.slots.total > settings.maxSlots) return;
      const candidate = {type:"removeRefill", idxs:completed.selected, metrics:trial.metrics, score:trial.score, rank:trial.rank};
      if (!best || optimizerCompareEvaluations(candidate, best) > 0) best = candidate;
    });

    if (!best || optimizerCompareEvaluations(best, evaluated) <= 0) break;

    selected = best.idxs;
    selectedSet = new Set(selected);
    evaluated = {metrics: best.metrics, score: best.score, rank: best.rank};

    const pruned = optimizerPruneExternalBuffs(equipmentIdxs, selected, fixedSet, inputs, settings);
    selected = pruned.compositeIdxs.slice();
    selectedSet = new Set(selected);
    evaluated = {metrics: pruned.metrics, score: pruned.score, rank: pruned.rank};
  }

  const final = optimizerPruneExternalBuffs(equipmentIdxs, selected, fixedSet, inputs, settings);
  return {compositeIdxs: final.compositeIdxs, metrics: final.metrics, score: final.score, rank: final.rank, prunedCount: final.prunedCount || current.prunedCount || 0};
}

function optimizerSelectExternalBuffsBeam(equipmentIdxs, inputs, settings) {
  const candidates = optimizerCompositeCandidates(settings);
  const fixed = settings.fixCurrentBuffs ? candidates.filter(x => x.row.enabled) : [];
  const fixedSelected = fixed.map(x => x.idx);
  const fixedSet = new Set(fixedSelected);

  const initial = optimizerEvaluateBuffSelection(equipmentIdxs, fixedSelected, inputs, settings);
  let beams = [{
    compositeIdxs: fixedSelected,
    selectedSet: new Set(fixedSelected),
    metrics: initial.metrics,
    score: initial.score,
    rank: initial.rank
  }];

  const buffBeamWidth = Math.max(1, settings.buffBeamWidth || 80);

  const rankBuffBeams = list => {
    const bestByKey = new Map();
    list.forEach(b => {
      const key = b.compositeIdxs.join(",");
      const current = bestByKey.get(key);
      if (!current || optimizerCompareEvaluations(b, current) > 0) {
        bestByKey.set(key, b);
      }
    });

    return Array.from(bestByKey.values())
      .sort(optimizerSortByEvaluation)
      .slice(0, buffBeamWidth);
  };

  candidates.forEach(cand => {
    if (fixedSet.has(cand.idx)) return;

    const next = beams.slice();
    beams.forEach(beam => {
      if (beam.selectedSet.has(cand.idx)) return;
      const compositeIdxs = beam.compositeIdxs.concat([cand.idx]);
      const evaluated = optimizerEvaluateBuffSelection(equipmentIdxs, compositeIdxs, inputs, settings);
      if (evaluated.metrics.slots.total > settings.maxSlots) return;
      next.push({
        compositeIdxs,
        selectedSet: new Set(compositeIdxs),
        metrics: evaluated.metrics,
        score: evaluated.score,
        rank: evaluated.rank
      });
    });

    beams = rankBuffBeams(next);
  });

  const best = rankBuffBeams(beams)[0] || beams[0] || {
    compositeIdxs: fixedSelected,
    metrics: initial.metrics,
    score: initial.score,
    rank: initial.rank
  };

  return optimizerPruneExternalBuffs(equipmentIdxs, best.compositeIdxs, fixedSet, inputs, settings);
}

function optimizerSelectExternalBuffs(equipmentIdxs, inputs, settings) {
  if (settings.buffMode === "fast") return optimizerSelectExternalBuffsGreedy(equipmentIdxs, inputs, settings);
  if (settings.buffMode === "beam") return optimizerSelectExternalBuffsBeam(equipmentIdxs, inputs, settings);
  return optimizerSelectExternalBuffsLocal(equipmentIdxs, inputs, settings);
}

function optimizerEquipmentRowHasVisibleData(row) {
  return !!(
    row.name || row.tags ||
    +row.attack || +row.magic || +row.speed || +row.delay ||
    +row.weaponDamage || +row.weaponWeight || +row.weaponAttackInterval || +row.weaponRange || +row.weaponDurability || row.weaponTwoHanded === "○" ||
    normalizeWeaponReqRowsForEquipment(row.weaponReq).some(r => +r.required) ||
    row.equipBuffEnabled || equipmentBuffHasEffect(row) ||
    extraStatsHasEffect(row, "base")
  );
}

function optimizerEquipmentLabel(row) {
  const slot = (row.slot || "").replace(/^武器: /, "").replace(/^防具: /, "").replace(/^装飾: /, "");
  const group = splitTags(row.tags)[0];
  const name = row.name || (isWeaponEquipmentRow(row) && (+row.weaponDamage || +row.weaponWeight) ? "名称未入力の武器" : "空");
  const weaponParts = [];
  if (isWeaponEquipmentRow(row)) {
    if (+row.weaponDamage) weaponParts.push(`Dmg ${fmt(+row.weaponDamage || 0, 1)}`);
    if (+row.weaponWeight) weaponParts.push(`重量 ${fmt(+row.weaponWeight || 0, 1)}`);
    if (+row.weaponAttackInterval) weaponParts.push(`間隔 ${fmt(+row.weaponAttackInterval || 0, 1)}`);
    if (+row.weaponRange) weaponParts.push(`射程 ${fmt(+row.weaponRange || 0, 1)}`);
    if (+row.weaponDurability) weaponParts.push(`耐久 ${fmt(+row.weaponDurability || 0, 0)}`);
    if (row.weaponTwoHanded === "○") weaponParts.push("両手");
  }
  const weapon = weaponParts.length ? ` / ${weaponParts.join(" / ")}` : "";
  return `${slot}: ${name}${weapon}${group ? ` [${group}]` : ""}`;
}

function optimizerEquipmentSummaryByIdx(equipmentIdxs, metrics=null) {
  const selected = new Set(equipmentIdxs);
  const rows = normalizeEquipmentRows(state.equipment)
    .map((row, idx) => ({row, idx}))
    .filter(x => selected.has(x.idx))
    .filter(x => optimizerEquipmentRowHasVisibleData(x.row))
    .map(x => x.row);

  rows.sort((a,b) => {
    const as = OPTIMIZER_EQUIPMENT_SLOT_ORDER.has(a.slot) ? OPTIMIZER_EQUIPMENT_SLOT_ORDER.get(a.slot) : 9999;
    const bs = OPTIMIZER_EQUIPMENT_SLOT_ORDER.has(b.slot) ? OPTIMIZER_EQUIPMENT_SLOT_ORDER.get(b.slot) : 9999;
    return as - bs;
  });

  return rows.map(optimizerEquipmentLabel).join(" / ") || "装備なし";
}

function optimizerBuffSummaryByIdx(compositeIdxs) {
  const selected = new Set(compositeIdxs);
  return normalizeCompositeRows(state.composite)
    .map((row, idx) => ({row, idx}))
    .filter(x => selected.has(x.idx))
    .map(x => {
      const group = splitTags(x.row.tags)[0];
      return `${x.row.name || "Buff"}${group ? ` [${group}]` : ""}`;
    })
    .join(" / ") || "装備以外Buffなし";
}

/* 最適化の重い本体は src/optimizer/core.js へ分離しました。
 * main.js側にはWorker起動・UI更新・結果描画だけを残しています。
 */


let optimizerWorker = null;
let optimizerRunSeq = 0;
let optimizerFallbackPayload = null;

function workerSupportedForThisPage() {
  if (typeof Worker === "undefined") return {ok:false, reason:"このブラウザはWorkerに対応していません。"};
  if (typeof location !== "undefined" && location.protocol === "file:") {
    return {
      ok:false,
      reason:"file:// 直開きではWorkerが制限されやすいため、メインスレッドで実行します。Workerを使う場合は python -m http.server 8000 で開いてください。"
    };
  }
  return {ok:true, reason:""};
}

function runOptimizerOnMainThread(payload, reason="") {
  const status = byId("optimizerStatus");
  const progress = byId("optimizerProgress");

  if (status) {
    status.textContent = reason
      ? `${reason} 検索中...`
      : "検索中...";
  }

  try {
    const out = runOptimizerCore(payload, p => {
      if (progress) {
        progress.max = p.total || 100;
        progress.value = p.current || 0;
      }
      if (status) status.textContent = p.message || `探索中: ${p.current}/${p.total}`;
    });

    integratedOptimizerResults = out.results || [];
    optimizerLastSummary = out.summary || null;
    optimizerLastPayload = payload || null;
    if (progress) {
      progress.max = out.summary?.evaluated || 100;
      progress.value = out.summary?.evaluated || progress.max;
    }
    if (status) {
      status.textContent = reason
        ? `${reason} 検索完了: ${out.summary?.statusText || "探索完了"}`
        : (out.summary?.statusText || "探索完了");
    }
    renderIntegratedOptimizerResults();
  } catch (e) {
    if (status) status.textContent = "最適化エラー: " + (e?.stack || e?.message || String(e));
    if (progress) progress.value = 0;
  }
}

function ensureOptimizerWorker() {
  if (optimizerWorker) return optimizerWorker;

  const support = workerSupportedForThisPage();
  if (!support.ok) {
    const status = byId("optimizerStatus");
    if (status) status.textContent = support.reason;
    return null;
  }

  try {
    optimizerWorker = new Worker("./src/optimizer/optimizer.worker.js");
  } catch (e) {
    optimizerWorker = null;
    const status = byId("optimizerStatus");
    if (status) status.textContent = "Worker作成に失敗しました: " + (e?.message || String(e));
    return null;
  }

  optimizerWorker.onmessage = event => {
    const msg = event.data || {};
    const status = byId("optimizerStatus");
    const progress = byId("optimizerProgress");

    if (msg.runId && msg.runId !== optimizerRunSeq) return;

    if (msg.type === "progress") {
      if (progress) {
        progress.max = msg.total || 100;
        progress.value = msg.current || 0;
      }
      if (status) status.textContent = msg.message || `探索中: ${msg.current || 0}/${msg.total || "?"}`;
      return;
    }

    if (msg.type === "result") {
      integratedOptimizerResults = msg.results || [];
      optimizerLastSummary = msg.summary || null;
      optimizerLastPayload = optimizerFallbackPayload || null;
      if (progress) {
        progress.max = msg.summary?.evaluated || 100;
        progress.value = msg.summary?.evaluated || progress.max;
      }
      if (status) status.textContent = msg.summary?.statusText || "探索完了";
      renderIntegratedOptimizerResults();
      optimizerFallbackPayload = null;
      return;
    }

    if (msg.type === "error") {
      const workerMessage = msg.message || "不明なエラー";
      if (status) status.textContent = "Worker内エラー。メインスレッドで再実行します: " + workerMessage;
      if (optimizerWorker) {
        optimizerWorker.terminate();
        optimizerWorker = null;
      }
      if (optimizerFallbackPayload) {
        runOptimizerOnMainThread(optimizerFallbackPayload, "検索処理を切り替えるため");
      }
      return;
    }
  };

  optimizerWorker.onerror = event => {
    const status = byId("optimizerStatus");
    const detail = event?.message || "詳細なし";
    if (status) status.textContent = "検索処理を切り替えて再実行します: " + detail;

    if (optimizerWorker) {
      optimizerWorker.terminate();
      optimizerWorker = null;
    }

    if (optimizerFallbackPayload) {
      runOptimizerOnMainThread(optimizerFallbackPayload, "Worker起動エラーのため");
    }
  };

  return optimizerWorker;
}

function optimizerPayloadForCurrentState() {
  syncRaceCoeff();
  syncBaseMagic();
  syncAttackTypeUI();

  const inputs = collectInputs();
  inputs.raceCoeff = byId("raceCoeff").value;
  inputs.techMultiplier = byId("techMultiplier").value;

  state.equipment = normalizeEquipmentRows(state.equipment);
  state.composite = normalizeCompositeRows(state.composite);

  return {
    inputs,
    state: clone(state),
    settings: integratedOptimizerSettings()
  };
}

function runIntegratedOptimizer() {
  const status = byId("optimizerStatus");
  const resultEl = byId("optimizerResults");
  const progress = byId("optimizerProgress");

  optimizerRunSeq++;
  const runId = optimizerRunSeq;

  if (status) status.textContent = "検索を開始しました...";
  if (resultEl) resultEl.innerHTML = "";
  if (progress) {
    progress.value = 0;
    progress.max = 100;
  }

  const payload = optimizerPayloadForCurrentState();
  optimizerFallbackPayload = payload;
  const worker = ensureOptimizerWorker();

  if (worker) {
    worker.postMessage({type:"optimize", runId, payload});
    return;
  }

  // Workerが使えない環境向けの保険。UIは固まりやすいが従来通り動く。
  const support = workerSupportedForThisPage();
  runOptimizerOnMainThread(payload, support.reason || "この環境では通常方式で実行するため");
}

function cancelIntegratedOptimizer() {
  if (optimizerWorker) {
    optimizerWorker.terminate();
    optimizerWorker = null;
  }
  optimizerRunSeq++;
  optimizerFallbackPayload = null;
  const status = byId("optimizerStatus");
  const progress = byId("optimizerProgress");
  if (status) status.textContent = "最適化をキャンセルしました。";
  if (progress) progress.value = 0;
}


function optimizerApproximationDiagnosticsHtml() {
  const summary = optimizerLastSummary || {};
  const payload = optimizerLastPayload || optimizerFallbackPayload || {};
  const settings = payload.settings || integratedOptimizerSettings();
  const results = integratedOptimizerResults || [];
  const lines = [];

  const modeText = summary.statusText || "";
  const exactTotal = settings.optimizerEquipmentExactTotal || summary.optimizerEquipmentExactTotal || settings.exactEquipmentLimit || 0;
  const searchMode =
    settings.optimizerEquipmentSearchMode ||
    (/装備を全通り確認/.test(modeText) ? "exact" : (/装備候補を一部確認/.test(modeText) ? "beam" : ""));

  if (searchMode === "beam" || /装備候補を一部確認/.test(modeText)) {
    lines.push(`装備候補が多いため、装備は近似探索です。全通り確認ではありません。精度重視にするか、不要候補を「除外」または候補フィルタで整理してください。`);
  } else if (searchMode === "exact" || /装備を全通り確認/.test(modeText)) {
    lines.push(`装備は全通り確認です。結果精度は高めです。`);
  }

  if ((settings.optimizerEquipmentExactTotal || 0) > (settings.exactEquipmentLimit || 0) && settings.exactEquipmentLimit > 0) {
    lines.push(`装備組み合わせ候補 ${settings.optimizerEquipmentExactTotal} 通りが、全探索上限 ${settings.exactEquipmentLimit} を超えています。`);
  }

  if (settings.accuracyPreset !== "accurate") {
    lines.push(`現在の検索精度は「${settings.accuracyPreset === "fast" ? "高速" : "標準"}」です。精度が怪しい時は「精度重視」を試してください。`);
  }

  if ((settings.beamWidth || 0) < 120 && searchMode === "beam") {
    lines.push(`検索の広さが ${settings.beamWidth} です。候補が多い場合は 200 以上に上げると改善することがあります。`);
  }

  if ((settings.equipmentEvalLimit || 0) < 100 && searchMode === "beam") {
    lines.push(`装備候補の確認数が ${settings.equipmentEvalLimit} です。候補が多い場合は 100〜300 へ上げると取りこぼしが減ります。`);
  }

  const hasCurrent = results.some(r => r.currentConfig || r.baselineReference);
  if (!hasCurrent && settings.includeCurrentConfig) {
    lines.push(`現在ON構成が条件外または表示外です。現在構成より弱い結果に見える場合は、上限・バフ枠・競合設定を確認してください。`);
  }

  if (!lines.length) {
    lines.push(`近似探索の警告はありません。結果がおかしい場合は、固定/除外、右手武器、必要スキル、装備Buff手入力を確認してください。`);
  }

  const level = lines.some(x => /近似|超え|高速|上げる|表示外|怪しい/.test(x)) ? "warn" : "ok";
  return `<div class="optimizerDiagnostics ${level}">
    <b>最適化チェック</b>
    <ul>${lines.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    <div class="small">状態: ${escapeHtml(modeText || "検索状態未取得")}</div>
  </div>`;
}

function damageAuditHtml(m, inputs) {
  const warnings = [];
  const infos = [];

  const isWeaponAttack = inputs.attackType === "attack" || inputs.attackType === "heavy";
  if (isWeaponAttack && !m.selectedWeapon) warnings.push("計算に使う武器が見つかりません。右手武器の使用ONを確認してください。");
  if (m.selectedWeapon && !(+m.weaponDamage > 0)) warnings.push("選択武器の武器ダメージが0です。公式DB取り込み値か手入力値を確認してください。");

  if (m.skillModInfo?.evaluated?.length) {
    if ((+m.skillModInfo.mod || 0) <= 0) warnings.push("武器性能発揮率が0%です。必要スキルが8割未満の条件があります。");
    else if ((+m.skillModInfo.mod || 0) < 1) warnings.push(`武器性能発揮率が ${(m.skillModInfo.mod * 100).toFixed(1)}% です。必要スキル不足でダメージが下がっています。`);
  }

  if (m.selectedWeapon && (m.selectedWeapon.equipBuffName || m.selectedWeapon.equipBuffNote) && !equipmentBuffHasEffect(m.selectedWeapon)) {
    infos.push("装備Buff名/説明文はありますが、実効果値は未入力です。攻撃力%・属性ダメージ%などは必要に応じて手入力してください。");
  }

  if (m.selectedWeapon && /左手/.test(m.selectedWeapon.slot || "")) {
    infos.push("左手武器が計算対象です。右手武器がONなら右手が優先されます。想定武器か確認してください。");
  }

  const formula = [
    `攻撃力 ${fmt(m.atk, 3)}`,
    `×0.8`,
    `×攻撃/テク ${fmt(m.attackMultiplier, 4)}`,
    `×与ダメ ${fmt(m.dmgMultiplier, 3)}`,
    `×特攻 ${fmt(m.specialMultiplier, 3)}`,
    `×防御 ${fmt(m.defenseFactor, 6)}`,
    `×クリ ${fmt(m.critAvg, 3)}`,
    `×外枠 ${fmt(m.postMultiplier, 3)}`
  ].join(" ");

  const weapon = m.selectedWeapon
    ? `${escapeHtml((m.selectedWeapon.slot || "武器").replace(/^武器: /, ""))} ${escapeHtml(m.selectedWeapon.name || "名称未入力")} / Dmg ${fmt(m.weaponDamage, 1)} / 性能 ${(m.skillModInfo?.mod * 100 || 100).toFixed(1)}%`
    : "なし";

  const messages = warnings.length
    ? `<div class="damageAuditWarnings">${warnings.map(x => `⚠ ${escapeHtml(x)}`).join("<br>")}</div>`
    : `<div class="damageAuditOk">計算に使う武器・必要スキルに大きな警告はありません。</div>`;

  const infoHtml = infos.length ? `<div class="damageAuditInfo">${infos.map(x => `※ ${escapeHtml(x)}`).join("<br>")}</div>` : "";

  return `${messages}${infoHtml}
    <div class="damageAuditFormula"><b>計算武器:</b> ${weapon}<br><b>式:</b> ${escapeHtml(formula)}<br><b>丸め前:</b> ${fmt(Math.floor(m.rawDamage), 0)} / <b>表示:</b> ${fmt(Math.floor(m.finalDamage), 0)}</div>`;
}


function renderIntegratedOptimizerResults() {
  const el = byId("optimizerResults");
  if (!el) return;

  const diagnostics = optimizerApproximationDiagnosticsHtml();

  if (!integratedOptimizerResults.length) {
    el.innerHTML = `${diagnostics}<p class="small">条件内に収まる結果がありません。バフ枠上限、各ステータス上限、競合グループ、装備同士の競合、候補の使用状況を見直してください。</p>`;
    return;
  }

  const body = integratedOptimizerResults.map((r, i) => {
    const m = r.metrics;
    const label = r.sourceLabel || (r.currentIncluded ? "現在ON/自動" : "自動探索");
    const rankText = r.currentConfig && r.baselineReference ? "基準" : (i + 1);
    const reasonLines = [];
    if (r.currentConfig) reasonLines.push("手動ON構成");
    (r.baselineReasons || []).forEach(x => reasonLines.push(x));
    const conflicts = r.equipmentConflicts || [];
    if (conflicts.length) reasonLines.push(`装備競合: ${conflicts.join(", ")}`);
    const sourceNote = reasonLines.length
      ? `<br><span class="optimizerResultReason">${escapeHtml(reasonLines.join(" / "))}</span>`
      : "";
    const rowClass = r.currentConfig ? " optimizerCurrentRow" : "";
    const invalidClass = r.baselineInvalid ? " optimizerInvalidRow" : "";
    return `<tr class="${rowClass}${invalidClass}">
      <td class="optimizerRank">${escapeHtml(rankText)}</td>
      <td class="optimizerSourceCell">${escapeHtml(label)}${sourceNote}</td>
      <td class="num">${fmt(Math.floor(m.finalDamage),0)}</td>
      <td class="num">${fmt(m.atk)}</td>
      <td class="num">${fmt(m.stats.magic)}</td>
      <td class="num">${m.slots.total}/24</td>
      <td class="optimizerList">${escapeHtml(extraStatsSummary(m.extraStats || {}).join(" / ") || "-")}</td>
      <td class="optimizerList">${escapeHtml(optimizerEquipmentSummaryByIdx(r.equipmentIdxs, m))}</td>
      <td class="optimizerList">${escapeHtml(optimizerBuffSummaryByIdx(r.compositeIdxs))}</td>
      <td><button class="optimizerApplyButton" onclick="applyIntegratedOptimizerResult(${i})">適用</button></td>
    </tr>`;
  }).join("");

  el.innerHTML = `${diagnostics}<table>
    <thead><tr><th>順位</th><th>種別</th><th>ダメージ</th><th>攻撃力</th><th>魔力</th><th>枠</th><th>追加ステータス</th><th>装備</th><th>装備以外Buff</th><th>適用</th></tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

function applyIntegratedOptimizerResult(index) {
  const r = integratedOptimizerResults[index];
  if (!r) return;

  const equipSet = new Set(r.equipmentIdxs);
  state.equipment = normalizeEquipmentRows(state.equipment).map((row, idx) => ({
    ...row,
    enabled: equipSet.has(idx)
  }));

  const buffSet = new Set(r.compositeIdxs);
  state.composite = normalizeCompositeRows(state.composite).map((row, idx) => ({
    ...row,
    enabled: buffSet.has(idx)
  }));

  if (r.forceOtherBuffs === false) {
    state.other = (state.other || []).map(row => ({...row, enabled:false}));
  }

  renderAll();
  calc();

  const status = byId("optimizerStatus");
  if (status) status.textContent = `${index + 1}位の構成を現在構成へ適用しました。`;
}



const MAIN_TABS = [
  {id:"calc", label:"計算", hint:"基本設定、サマリー、分析、実測差分、最適化計算をここにまとめています。"},
  {id:"skill", label:"スキルシミュレータ", hint:"スキル合計850、残りポイント、種族別の簡易ステータスを確認します。計算側へはボタンを押した時だけ反映します。"},
  {id:"equipment", label:"装備登録", hint:"武器・防具・装飾候補、装備Buff、AC/HP/命中などの追加ステータスを部位ごとのカテゴリで登録します。候補追加はここで行います。"},
  {id:"buffs", label:"Buff登録", hint:"装備以外のBuff、外枠補正、その他バフを登録します。"},
  {id:"groups", label:"競合グループ", hint:"同一グループで重複しないBuffを確認します。"},
  {id:"showcase", label:"見せびらかし", hint:"現在構成のダメージ、ステータス、装備、Buffを一覧表示します。"},
  {id:"save", label:"保存・読込", hint:"JSON/TSV/プリセットを扱います。これまでのJSON/TSV形式はそのまま読み込めます。"}
];

function activateMainTab(id) {
  const valid = MAIN_TABS.some(t => t.id === id) ? id : "calc";
  document.querySelectorAll(".mainTabButton").forEach(btn => {
    const active = btn.dataset.tabId === valid;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
  document.querySelectorAll(".mainTabPanel").forEach(panel => {
    panel.hidden = panel.dataset.tabPanel !== valid;
  });
  localStorage.setItem("moeDamageSimActiveTab", valid);
}

function setupTabLayout() {
  const nav = byId("mainTabNav");
  const panelsWrap = byId("mainTabPanels");
  if (!nav || !panelsWrap || nav.dataset.ready) return;

  nav.dataset.ready = "1";
  nav.setAttribute("role", "tablist");

  MAIN_TABS.forEach(tab => {
    const btn = makeCell("button", {type:"button", class:"mainTabButton", "data-tab-id":tab.id}, tab.label);
    btn.setAttribute("role", "tab");
    btn.onclick = () => activateMainTab(tab.id);
    nav.appendChild(btn);

    const panel = document.createElement("div");
    panel.className = "mainTabPanel";
    panel.dataset.tabPanel = tab.id;
    panel.setAttribute("role", "tabpanel");

    const hint = document.createElement("div");
    hint.className = "tabSectionHint small";
    hint.textContent = tab.hint;
    panel.appendChild(hint);

    panelsWrap.appendChild(panel);
  });

  document.querySelectorAll("[data-tab-target]").forEach(el => {
    const target = el.dataset.tabTarget || "calc";
    const panel = panelsWrap.querySelector(`[data-tab-panel="${target}"]`);
    if (panel) panel.appendChild(el);
  });

  activateMainTab(localStorage.getItem("moeDamageSimActiveTab") || "calc");
}



function showcasePair(label, value) {
  return `<li class="showcasePair"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></li>`;
}

function showcaseList(items) {
  return `<ul class="showcaseList">${items.length ? items.join("") : `<li class="small">なし</li>`}</ul>`;
}

function activeEquipmentForShowcase() {
  return normalizeEquipmentRows(state.equipment)
    .filter(r => r.enabled !== false && equipmentCandidateHasData(r));
}

function equipmentShowcaseText(row) {
  const parts = [];
  if (+row.attack) parts.push(`攻撃力+${fmt(+row.attack,1)}`);
  if (+row.magic) parts.push(`魔力+${fmt(+row.magic,1)}`);
  if (+row.speed) parts.push(`速度+${fmt(+row.speed,1)}`);
  if (isWeaponEquipmentRow(row)) {
    if (+row.weaponDamage) parts.push(`武器Dmg ${fmt(+row.weaponDamage,1)}`);
    if (+row.weaponWeight) parts.push(`重量 ${fmt(+row.weaponWeight,1)}`);
    if (+row.weaponAttackInterval) parts.push(`間隔 ${fmt(+row.weaponAttackInterval,1)}`);
    if (+row.weaponRange) parts.push(`射程 ${fmt(+row.weaponRange,1)}`);
    if (+row.weaponDurability) parts.push(`耐久 ${fmt(+row.weaponDurability,0)}`);
    if (row.weaponTwoHanded === "○") parts.push("両手");
  }
  const extra = extraStatsSummary(row, "base");
  if (extra.length) parts.push(extra.join(" / "));
  return parts.join(" / ") || "補正なし";
}

function showcaseActiveBuffLines() {
  const lines = [];
  normalizeEquipmentRows(state.equipment)
    .filter(r => r.enabled !== false && r.equipBuffEnabled && equipmentBuffHasEffect(r))
    .forEach(r => lines.push(`装備Buff: ${equipmentBuffDisplayName(r)}（${equipmentBuffEffectText(r)}）`));

  normalizeCompositeRows(state.composite)
    .filter(r => r.enabled && compositeHasEffect(r))
    .forEach(r => lines.push(`${r.name || "装備以外Buff"}（${compositeEffectText(r)}）`));

  (state.other || [])
    .filter(r => r.enabled)
    .forEach(r => lines.push(`${r.name || "その他バフ"}${r.note ? `（${r.note}）` : ""}`));

  return lines;
}

function showcaseSkillLines() {
  state.skillSim = normalizeSkillSim(state.skillSim);
  const rows = [];
  SKILL_SIM_GROUPS.forEach(([group, list]) => {
    const active = list
      .map(name => [name, +(state.skillSim.skills[name] || 0)])
      .filter(([,v]) => v)
      .map(([name, v]) => `${name} ${fmt(v,1)}`);
    if (active.length) rows.push(`${group}: ${active.join(" / ")}`);
  });
  return rows;
}

function showcaseTextFromMetrics(m) {
  state.skillSim = normalizeSkillSim(state.skillSim);
  const inputs = collectInputs();
  const d = skillSimDerived();
  const title = state.skillSim.name || "無題構成";
  const race = RACE_LABELS[state.skillSim.race] || state.skillSim.race || "-";
  const weapon = m.selectedWeapon;
  const reqRows = (m.skillModInfo?.evaluated || []).map(r => `${r.name} ${fmt(r.current,1)}/${fmt(r.required,1)}`);
  const equipLines = activeEquipmentForShowcase().map(r => {
    const slot = (r.slot || "").replace(/^武器: /, "").replace(/^防具: /, "").replace(/^装飾: /, "");
    return `- ${slot}: ${r.name || "名称未入力"} / ${equipmentShowcaseText(r)}`;
  });
  const buffLines = showcaseActiveBuffLines().map(x => `- ${x}`);
  const skillLines = showcaseSkillLines().map(x => `- ${x}`);
  const extra = extraStatsSummary(m.extraStats || {}).map(x => `- ${x}`);

  return [
    `【${title}】`,
    `種族: ${race}`,
    `予想ダメージ: ${fmt(Math.floor(m.finalDamage),0)} ダメージ前後`,
    `攻撃力: ${fmt(m.atk,3)}`,
    `魔力: ${fmt(m.stats.magic,3)}`,
    `速度: ${fmt(m.stats.speed,3)}`,
    `バフ枠: ${m.slots.total}/24`,
    `攻撃種別: ${byId("attackType")?.selectedOptions?.[0]?.textContent || inputs.attackType || "-"}`,
    `対象AC: ${inputs.targetAC || 0}`,
    "",
    "■スキル由来ステータス",
    `HP ${fmt(d.hp,1)} / MP ${fmt(d.mp,1)} / ST ${fmt(d.st,1)} / 重量 ${fmt(d.weight,1)}`,
    `命中 ${fmt(d.hit,1)} / 回避 ${fmt(d.avoid,1)} / 防御 ${fmt(d.def,1)} / 呪文抵抗 ${fmt(d.resist,1)}`,
    "",
    "■武器",
    weapon
      ? `${(weapon.slot || "武器").replace(/^武器: /, "")}: ${weapon.name || "名称未入力"} / Dmg ${fmt(+weapon.weaponDamage || 0,1)} / 重量 ${fmt(+weapon.weaponWeight || 0,1)} / 発揮率 ${fmt((m.skillModInfo?.mod || 1) * 100,1)}%${reqRows.length ? ` / 条件 ${reqRows.join(" / ")}` : ""}`
      : "未設定",
    "",
    "■装備",
    ...(equipLines.length ? equipLines : ["- なし"]),
    "",
    "■Buff",
    ...(buffLines.length ? buffLines : ["- なし"]),
    "",
    "■追加ステータス",
    ...(extra.length ? extra : ["- なし"]),
    "",
    "■スキル",
    ...(skillLines.length ? skillLines : ["- なし"])
  ].join("\n");
}

function renderShowcaseTab(m=null) {
  const root = byId("showcaseView");
  const textBox = byId("showcaseText");
  if (!root && !textBox) return;

  if (!m) {
    syncSkillSimToCalcInputs(false, false);
    syncSelectedWeaponToHiddenInputs();
    syncRaceCoeff();
    syncBaseMagic();
    m = computeMetrics(state, collectInputs());
  }

  state.skillSim = normalizeSkillSim(state.skillSim);
  const d = skillSimDerived();
  const title = state.skillSim.name || "無題構成";
  const race = RACE_LABELS[state.skillSim.race] || state.skillSim.race || "-";
  const weapon = m.selectedWeapon;
  const reqRows = (m.skillModInfo?.evaluated || []).map(r => `${escapeHtml(r.name)} ${fmt(r.current,1)}/${fmt(r.required,1)}`);
  const equipRows = activeEquipmentForShowcase();
  const buffLines = showcaseActiveBuffLines();
  const skillLines = showcaseSkillLines();
  const extraLines = extraStatsSummary(m.extraStats || {});
  const inputs = collectInputs();

  if (root) {
    const equipItems = equipRows.map(r => {
      const slot = (r.slot || "").replace(/^武器: /, "").replace(/^防具: /, "").replace(/^装飾: /, "");
      return `<li><b>${escapeHtml(slot)}: ${escapeHtml(r.name || "名称未入力")}</b><br><span class="small">${escapeHtml(equipmentShowcaseText(r))}</span></li>`;
    });
    const buffItems = buffLines.map(x => `<li>${escapeHtml(x)}</li>`);
    const skillItems = skillLines.map(x => `<li>${escapeHtml(x)}</li>`);
    const extraItems = extraLines.map(x => `<li>${escapeHtml(x)}</li>`);

    root.innerHTML = `
      <div class="showcaseHero">
        <div class="showcaseTitle">${escapeHtml(title)}</div>
        <div class="showcaseBigStats">
          <div class="showcaseBigStat"><span>予想ダメージ</span><b>${fmt(Math.floor(m.finalDamage),0)}</b></div>
          <div class="showcaseBigStat"><span>攻撃力</span><b>${fmt(m.atk,3)}</b></div>
          <div class="showcaseBigStat"><span>魔力</span><b>${fmt(m.stats.magic,3)}</b></div>
          <div class="showcaseBigStat"><span>バフ枠</span><b>${m.slots.total}/24</b></div>
        </div>
      </div>

      <div class="showcaseGrid">
        <div class="showcaseCard">
          <h3>基本</h3>
          ${showcaseList([
            showcasePair("種族", race),
            showcasePair("攻撃種別", byId("attackType")?.selectedOptions?.[0]?.textContent || inputs.attackType || "-"),
            showcasePair("対象AC", inputs.targetAC || 0),
            showcasePair("筋力", fmt(skillSimValue("筋力"),1)),
            showcasePair("精神力", fmt(skillSimValue("精神力"),1)),
            showcasePair("酩酊度", fmt(d.drunk,1))
          ])}
        </div>

        <div class="showcaseCard">
          <h3>スキル由来ステータス</h3>
          ${showcaseList([
            showcasePair("HP", fmt(d.hp,1)),
            showcasePair("MP", fmt(d.mp,1)),
            showcasePair("ST", fmt(d.st,1)),
            showcasePair("重量", fmt(d.weight,1)),
            showcasePair("命中", fmt(d.hit,1)),
            showcasePair("回避", fmt(d.avoid,1)),
            showcasePair("防御", fmt(d.def,1)),
            showcasePair("呪文抵抗", fmt(d.resist,1))
          ])}
        </div>

        <div class="showcaseCard">
          <h3>武器</h3>
          ${showcaseList(weapon ? [
            `<li><b>${escapeHtml((weapon.slot || "武器").replace(/^武器: /, ""))}: ${escapeHtml(weapon.name || "名称未入力")}</b></li>`,
            showcasePair("武器ダメージ", fmt(+weapon.weaponDamage || 0,1)),
            showcasePair("武器重量", fmt(+weapon.weaponWeight || 0,1)),
            showcasePair("攻撃間隔", fmt(+weapon.weaponAttackInterval || 0,1)),
            showcasePair("射程", fmt(+weapon.weaponRange || 0,1)),
            showcasePair("耐久", fmt(+weapon.weaponDurability || 0,0)),
            showcasePair("両手武器", weapon.weaponTwoHanded || "×"),
            showcasePair("性能発揮率", `${fmt((m.skillModInfo?.mod || 1) * 100,1)}%`),
            `<li><span>使用条件</span><br><b>${reqRows.length ? reqRows.join(" / ") : "条件なし"}</b></li>`
          ] : [])}
        </div>

        <div class="showcaseCard">
          <h3>追加ステータス</h3>
          ${showcaseList(extraItems)}
        </div>

        <div class="showcaseCard">
          <h3>装備</h3>
          ${showcaseList(equipItems)}
        </div>

        <div class="showcaseCard">
          <h3>Buff</h3>
          ${showcaseList(buffItems)}
        </div>

        <div class="showcaseCard">
          <h3>スキル</h3>
          ${showcaseList(skillItems)}
        </div>
      </div>`;
  }

  if (textBox) textBox.value = showcaseTextFromMetrics(m);
}


async function copyShowcaseText() {
  const text = byId("showcaseText")?.value || "";
  const status = byId("showcaseCopyStatus");
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const box = byId("showcaseText");
      box.focus();
      box.select();
      document.execCommand("copy");
    }
    if (status) status.textContent = "コピーしました。";
  } catch (e) {
    if (status) status.textContent = "コピーに失敗しました。テキスト欄から手動コピーしてください。";
  }
}

/* 共有URLの圧縮/復元/発行処理は src/storage/shareUrl.js へ分離しました。 */



const IDB_BASE_URL = "https://idb.moepic.com/";

function openIdbTop() {
  window.open(IDB_BASE_URL, "_blank", "noopener");
}

function openIdbSearch() {
  const name = byId("idbSearchName")?.value?.trim() || "";
  const url = name
    ? `${IDB_BASE_URL}items/search?name=${encodeURIComponent(name)}`
    : `${IDB_BASE_URL}items/search`;
  window.open(url, "_blank", "noopener");
}

function clearIdbImportBox() {
  if (byId("idbPasteBox")) byId("idbPasteBox").value = "";
  if (byId("idbImportPreview")) byId("idbImportPreview").textContent = "まだ解析していません。";
}

const IDB_WORKER_ENDPOINT = "https://divine-grass-1b84.sincostanrap.workers.dev";

function normalizeIdbWorkerEndpoint() {
  return IDB_WORKER_ENDPOINT;
}

function normalizeIdbItemUrl(url) {
  const s = String(url || "").trim();
  if (!s) return "";
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" || u.hostname !== "idb.moepic.com" || !u.pathname.startsWith("/items/")) return "";
    u.hash = "";
    return u.toString();
  } catch {
    return "";
  }
}

function loadIdbWorkerEndpoint() {
  // v1.18.4: Worker URL is fixed and not user-editable.
}

function saveIdbWorkerEndpoint(endpoint) {
  // v1.18.4: Worker URL is fixed and not user-editable.
}

function setIdbWorkerStatus(message, isError=false) {
  const el = byId("idbWorkerStatus");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("bad", !!isError);
}

async function testIdbWorkerConnection() {
  const endpoint = normalizeIdbWorkerEndpoint();
  if (!endpoint) {
    setIdbWorkerStatus("固定Worker URLの設定が正しくありません。", true);
    return;
  }
  saveIdbWorkerEndpoint(endpoint);
  setIdbWorkerStatus("Worker接続テスト中...");
  try {
    const res = await fetch(endpoint, {method:"GET", cache:"no-store"});
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 160)}`);
    setIdbWorkerStatus(`Worker接続OK: ${text.slice(0, 120)}`);
  } catch (e) {
    setIdbWorkerStatus(`Worker接続失敗: ${e.message || e}`, true);
  }
}

async function fetchIdbUrlViaWorker() {
  const endpoint = normalizeIdbWorkerEndpoint();
  const itemUrl = normalizeIdbItemUrl(byId("idbItemUrl")?.value || "");
  if (!endpoint) {
    setIdbWorkerStatus("固定Worker URLの設定が正しくありません。", true);
    return;
  }
  if (!itemUrl) {
    setIdbWorkerStatus("公式DBの個別アイテムURLを入力してください。例: https://idb.moepic.com/items/defences/22761", true);
    return;
  }

  saveIdbWorkerEndpoint(endpoint);
  setIdbWorkerStatus("取得中...");

  try {
    const url = `${endpoint}?url=${encodeURIComponent(itemUrl)}`;
    const res = await fetch(url, {method:"GET"});
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(`Worker取得失敗: HTTP ${res.status}${msg ? " / " + msg.slice(0, 120) : ""}`);
    }
    const html = await res.text();
    if (!html || html.length < 100) throw new Error("取得したHTMLが短すぎます。URLやWorker設定を確認してください。");

    const paste = byId("idbPasteBox");
    if (paste) paste.value = html;

    setIdbWorkerStatus("取得しました。貼り付け欄へHTMLを入れて解析しました。");
    previewIdbEquipmentImport();
  } catch (e) {
    const msg = e.message || String(e) || "取得に失敗しました。";
    setIdbWorkerStatus(`${msg} / GitHub Pages上から実行しているか、Worker側の許可Origin設定を確認してください。`, true);
  }
}


function idbHtmlHints(raw) {
  const s = String(raw || "");
  if (!/<(?:html|head|body|title|meta|h1|h2|table|div)\b/i.test(s)) return [];
  try {
    const doc = new DOMParser().parseFromString(s, "text/html");
    const hints = [];
    const push = v => {
      const t = String(v || "").replace(/\s+/g, " ").trim();
      if (t && !hints.includes(t)) hints.push(t);
    };
    push(doc.title);
    ["meta[property='og:title']", "meta[name='twitter:title']", "meta[name='description']", "meta[property='og:description']"].forEach(sel => {
      push(doc.querySelector(sel)?.getAttribute("content"));
    });
    doc.querySelectorAll("h1, h2, h3, [class*='title'], [class*='name']").forEach(el => push(el.textContent));
    doc.querySelectorAll("img[alt]").forEach(img => push(img.getAttribute("alt")));
    return hints.slice(0, 20);
  } catch {
    return [];
  }
}

function idbDecodeHtmlEntities(text) {
  let s = String(text || "");
  try {
    if (typeof document !== "undefined") {
      const ta = document.createElement("textarea");
      ta.innerHTML = s;
      s = ta.value;
    }
  } catch {}
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function idbDecodeJsonEscapes(text) {
  let s = String(text || "");
  s = s
    .replace(/\\u003c/gi, "<")
    .replace(/\\u003e/gi, ">")
    .replace(/\\u0026/gi, "&")
    .replace(/\\u002f/gi, "/")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, " ")
    .replace(/\\"/g, "\"");
  try {
    s = s.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  } catch {}
  return s;
}

function idbHtmlToLooseText(html) {
  let s = idbDecodeJsonEscapes(String(html || ""));
  s = s
    .replace(/<script\b[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "\n")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "\n")
    .replace(/<(?:br|hr)\b[^>]*>/gi, "\n")
    .replace(/<\/(?:p|div|section|article|header|footer|nav|main|table|thead|tbody|tr|th|td|dl|dt|dd|li|ul|ol|h1|h2|h3|h4|h5|h6)>/gi, "\n")
    .replace(/<(?:p|div|section|article|header|footer|nav|main|table|thead|tbody|tr|th|td|dl|dt|dd|li|ul|ol|h1|h2|h3|h4|h5|h6)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return idbDecodeHtmlEntities(s);
}

function idbUsefulScriptTextFromHtml(html) {
  const raw = String(html || "");
  const out = [];
  const re = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(raw)) !== null) {
    let s = idbDecodeJsonEscapes(m[1] || "");
    if (!/(装備部位|必要スキル|アーマークラス|付加効果|追加効果|回避|最大重量|移動速度|攻撃力|耐火属性|defences|weapons|items)/.test(s)) continue;
    s = s
      .replace(/[{},[\]]/g, "\n")
      .replace(/["']/g, "")
      .replace(/:/g, " ")
      .replace(/,/g, "\n");
    out.push(idbDecodeHtmlEntities(s));
  }
  return out.join("\n");
}

function idbCleanText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[：:]\s*\n/g, ":\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function idbLabelPattern(labels) {
  return (Array.isArray(labels) ? labels : [labels])
    .map(x => String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
}

function idbCompactFieldText(text, labels, stopLabels=[]) {
  const source = idbCleanText(text).replace(/\n+/g, " ");
  const label = idbLabelPattern(labels);
  const stops = stopLabels?.length ? idbLabelPattern(stopLabels) : "$^";
  const re = new RegExp(`(?:${label})\\s*[:：]?\\s*([\\s\\S]*?)(?=\\s*(?:${stops})\\s*[:：]?|$)`, "i");
  const m = source.match(re);
  return m ? idbCleanText(m[1] || "") : "";
}


function idbTextFromPaste(raw) {
  const original = String(raw || "");
  let s = original;
  const hints = idbHtmlHints(s);
  const scriptUseful = idbUsefulScriptTextFromHtml(s);

  if (/<(?:html|body|div|table|thead|tbody|tr|th|td|dt|dd|p|br|li|h1|h2|h3|span|a|script)\b/i.test(s)) {
    try {
      const doc = new DOMParser().parseFromString(s, "text/html");
      doc.querySelectorAll("script, style, noscript, svg, canvas, iframe").forEach(el => el.remove());
      doc.querySelectorAll("br, p, div, tr, li, h1, h2, h3, h4, dt, dd, th, td, caption, section, article").forEach(el => {
        el.appendChild(doc.createTextNode("\n"));
      });
      const body = doc.body?.textContent || "";
      const loose = idbHtmlToLooseText(original);
      s = [hints.join("\n"), body, loose, scriptUseful].filter(Boolean).join("\n");
    } catch {
      s = [hints.join("\n"), idbHtmlToLooseText(original), scriptUseful].filter(Boolean).join("\n");
    }
  } else if (hints.length || scriptUseful) {
    s = [hints.join("\n"), s, scriptUseful].filter(Boolean).join("\n");
  }

  return idbCleanText(idbDecodeHtmlEntities(idbDecodeJsonEscapes(s)));
}

function idbLines(text) {
  const cleaned = idbTextFromPaste(text);
  const withBreaks = cleaned.replace(/\s+(?=(?:説明|アイテム画像|装備部位|必要スキル|アーマークラス|カラー|使用可能性別|使用可能種族|使用可能シップ|付加効果|追加効果|特殊条件|消耗度|重さ|素材)\b)/g, "\n");
  return withBreaks
    .split(/\n+/)
    .map(x => x.trim())
    .filter(Boolean);
}

function idbFirstMatch(text, patterns) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1] ?? m[0];
  }
  return "";
}

function idbValueAfterLabels(lines, labels, opts={}) {
  const escapedLabels = Array.isArray(labels) ? labels.map(x => String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) : [String(labels)];
  const labelPattern = escapedLabels.join("|");
  const joined = lines.join("\n");

  const inlineRe = new RegExp(`(?:${labelPattern})\\s*[:：]?\\s*([+-]?\\d+(?:\\.\\d+)?)`, "i");
  const inline = joined.match(inlineRe);
  if (inline) return parseFloat(inline[1]);

  for (let i = 0; i < lines.length; i++) {
    if (!new RegExp(`^(?:${labelPattern})\\s*[:：]?$`, "i").test(lines[i])) continue;
    for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
      const m = lines[j].match(/([+-]?\d+(?:\.\d+)?)/);
      if (m) return parseFloat(m[1]);
      if (/^(装備部位|必要スキル|付加効果|追加効果|説明|特殊条件|レアアイテム|素材|検索|アイテム画像)/.test(lines[j])) break;
    }
  }

  const compact = idbCompactFieldText(joined, Array.isArray(labels) ? labels : [labels], ["装備部位", "必要スキル", "アーマークラス", "カラー", "使用可能性別", "使用可能種族", "使用可能シップ", "付加効果", "追加効果", "特殊条件", "消耗度", "重さ", "素材"]);
  const cm = compact.match(/([+-]?\d+(?:\.\d+)?)/);
  if (cm) return parseFloat(cm[1]);

  if (opts.fallbackRegex) {
    const m = joined.match(opts.fallbackRegex);
    if (m) return parseFloat(m[1]);
  }
  return 0;
}

function idbNormalizeTitleName(s) {
  return String(s || "")
    .replace(/\s+-\s+(?:防具装飾|武器|防具|装飾|盾|アイテム|食品|素材).*/, "")
    .replace(/\s+\|\s+Master of Epic.*/, "")
    .replace(/\s+-\s+Master of Epic.*/, "")
    .replace(/^アイテム名\s*[:：]?/, "")
    .replace(/^名称\s*[:：]?/, "")
    .replace(/^Name\s*[:：]?/i, "")
    .trim();
}

function idbGuessName(lines, text) {
  const itemType = "(?:防具装飾|武器|防具|装飾|盾|アイテム|食品|素材)";
  const direct = idbFirstMatch(text, [
    new RegExp(`^(.+?)\\s+-\\s+${itemType}\\s+-\\s+Master of Epic`, "m"),
    new RegExp(`<title>\\s*([^<]+?)\\s+-\\s+${itemType}\\s+-\\s+Master of Epic`, "i"),
    new RegExp(`(?:og:title|twitter:title)["'][^>]*content=["']([^"']+?)\\s+-\\s+${itemType}\\s+-`, "i"),
    /(?:アイテム名|名称|Name)\s*[:：]\s*([^\n]+)/i
  ]);
  if (direct) return idbNormalizeTitleName(direct);

  for (let i = 0; i < lines.length; i++) {
    if (/^(アイテム名|名称|Name)\s*[:：]?$/.test(lines[i]) && lines[i + 1]) {
      const n = idbNormalizeTitleName(lines[i + 1]);
      if (idbLooksLikeItemName(n)) return n;
    }
  }

  // 「ジャイアント ドラゴンフライ 説明 ...」のように1行に詰まった本文から先頭名を取る。
  const compactHead = idbCompactFieldText(`__NAME__ ${text}`, ["__NAME__"], ["説明", "アイテム画像", "装備部位", "必要スキル", "アーマークラス", "付加効果", "追加効果"]);
  const compactName = idbNormalizeTitleName(compactHead).trim();
  if (idbLooksLikeItemName(compactName) && compactName.length <= 40) return compactName;

  const skip = /^(Master of Epic|公式データベース|MoE|アイテム画像|画像|説明|装備部位|使用可能|必要スキル|付加効果|追加効果|特殊条件|レアアイテム|検索|トップ|一覧|Tweet|シェア|NO IMAGE|武器|防具|防具装飾|装飾|盾|アイテム|ダメージ|攻撃間隔|有効レンジ|アーマークラス|消耗度|重さ|素材|戻る|HOME|ログイン|ALL|NG|OK)$/i;

  const scored = lines
    .map((line, idx) => ({line: idbNormalizeTitleName(line), idx}))
    .filter(x => idbLooksLikeItemName(x.line) && !skip.test(x.line))
    .map(x => {
      let score = 0;
      if (/[ぁ-んァ-ヶ一-龠A-Za-z]/.test(x.line)) score += 3;
      if (x.idx < 10) score += 2;
      if (/(?:防具装飾|武器|防具|装飾|盾)\s+-\s+Master/.test(lines[x.idx] || "")) score += 5;
      if (/^[\[\【].+[\]\】]$/.test(x.line)) score += 1;
      if (/\s{2,}/.test(x.line)) score -= 1;
      if (x.line.length > 32) score -= 2;
      return {...x, score};
    })
    .sort((a, b) => b.score - a.score || a.idx - b.idx);

  return scored[0]?.line || "公式DB取り込み装備";
}

function idbLooksLikeItemName(s) {
  const t = String(s || "").trim();
  if (!t || t.length > 60) return false;
  if (/^https?:/.test(t)) return false;
  if (/^[+-]?\d+(?:\.\d+)?$/.test(t)) return false;
  if (/[：:]/.test(t)) return false;
  if (/^(?:[+-]?\d+(?:\.\d+)?\s*)+(?:%|倍)?$/.test(t)) return false;
  if (/^(右手|左手|頭|胴|手|パンツ|靴|肩|腰|顔|耳|指|胸|背中|弾丸|2HAND|1HAND)$/i.test(t)) return false;
  return true;
}

function idbMapSlot(part) {
  const raw = String(part || "").trim();
  const s = raw.replace(/\s+/g, " ");

  // 武器は右手優先。
  // 公式DBで「右手 左手」と出る片手武器は、初期候補スロットを右手にする。
  if (/右手/.test(s)) return "武器: 右手";
  if (/左手/.test(s)) return "武器: 左手";
  if (/弾|矢|銃弾|投げ/.test(s) && !/[頭顔耳指胸背腰胴手肩靴パンツ]/.test(s)) return "武器: 弾丸";

  const normalized = s
    .replace(/[（）]/g, m => m === "（" ? "(" : ")")
    .replace(/装飾/g, "装")
    .replace(/防具/g, "防");

  const accessoryHint = /装|\(装\)|（装）/.test(raw);
  const armorHint = /防|\(防\)|（防）/.test(raw);

  if (/頭/.test(normalized)) return accessoryHint && !armorHint ? "装飾: 頭" : "防具: 頭";
  if (/顔/.test(normalized)) return "装飾: 顔";
  if (/耳/.test(normalized)) return "装飾: 耳";
  if (/指/.test(normalized)) return "装飾: 指";
  if (/胸/.test(normalized)) return "装飾: 胸";
  if (/背中|背/.test(normalized)) return "装飾: 背中";
  if (/腰/.test(normalized)) return accessoryHint && !armorHint ? "装飾: 腰" : "防具: 腰";

  if (/胴|胸当|鎧|よろい|アーマー/.test(normalized)) return "防具: 胴";
  if (/パンツ|ズボン|下半身/.test(normalized)) return "防具: パンツ";
  if (/靴|足/.test(normalized)) return "防具: 靴";
  if (/肩/.test(normalized)) return "防具: 肩";
  if (/手|腕|グローブ/.test(normalized)) return "防具: 手";

  return "";
}

function idbExtractEquipPart(lines, text, name="") {
  const joined = lines.join("\n");
  const inline = idbFirstMatch(joined, [
    /装備部位\s*[:：]\s*([^\n]+)/,
    /(?:装備箇所|部位)\s*[:：]\s*([^\n]+)/
  ]);
  if (inline && !/^(必要スキル|アーマークラス|使用可能|付加効果|追加効果)/.test(inline.trim())) return inline.trim();

  const compact = idbCompactFieldText(joined, ["装備部位", "装備箇所", "部位"], ["必要スキル", "アーマークラス", "カラー", "使用可能性別", "使用可能種族", "使用可能シップ", "付加効果", "追加効果", "特殊条件"]);
  if (compact) {
    const first = compact.split(/\s+/).find(Boolean) || compact;
    return first.trim();
  }

  const idx = lines.findIndex(l => /^(装備部位|装備箇所|部位)\s*[:：]?$/.test(l));
  if (idx >= 0) {
    for (let j = idx + 1; j < Math.min(lines.length, idx + 6); j++) {
      const l = String(lines[j] || "").trim();
      if (!l || /^(必要スキル|使用可能|ダメージ|攻撃間隔|付加効果|追加効果|説明|特殊条件)/.test(l)) break;
      if (!/^(ALL|NG|OK)$/.test(l)) return l;
    }
  }

  const slotWords = [
    "腰装飾", "腰（装）", "腰(装)", "腰［装］", "腰[装]",
    "背中装飾", "背中（装）", "背中(装)", "背中［装］", "背中[装]",
    "頭装飾", "頭（装）", "顔装飾", "顔（装）", "耳装飾", "耳（装）",
    "指装飾", "指（装）", "胸装飾", "胸（装）"
  ];
  const foundSlot = slotWords.find(w => joined.includes(w));
  if (foundSlot) return foundSlot;

  const titleKind = name
    ? idbFirstMatch(joined, [new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+-\\s+(防具装飾|武器|防具|装飾|盾)\\s+-`)])
    : "";
  return titleKind || "";
}

function idbSectionLines(lines, labels, stopLabels, max=20) {
  const labelPat = labels.map(x => String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const stopPat = stopLabels.map(x => String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const labelRe = new RegExp(`^(?:${labelPat})\\s*[:：]?$`);
  const stopRe = new RegExp(`^(?:${stopPat})\\s*[:：]?`);
  const inlineRe = new RegExp(`^(?:${labelPat})\\s*[:：]\\s*(.+)$`);

  const idx = lines.findIndex(l => labelRe.test(l) || inlineRe.test(l));
  if (idx >= 0) {
    const out = [];
    const inline = (lines[idx].match(inlineRe) || [])[1]?.trim() || "";
    if (inline) out.push(inline);
    for (let j = idx + 1; j < Math.min(lines.length, idx + max); j++) {
      if (stopRe.test(lines[j])) break;
      if (lines[j] && !/^(ALL|NG|OK)$/.test(lines[j])) out.push(lines[j]);
    }
    if (out.length) return out;
  }

  const compact = idbCompactFieldText(lines.join("\n"), labels, stopLabels);
  if (!compact) return [];
  return compact
    .replace(/\s+(?=(?:攻撃力|魔力|移動速度|速度|最大HP|HP|最大MP|MP|最大ST|ST|最大重量|重量|命中|回避|防御力|アーマークラス|AC|攻撃ディレイ|魔法ディレイ|火耐性|耐火属性|水耐性|耐水属性|地耐性|耐地属性|風耐性|耐風属性|無耐性|耐無属性)\s*[+＋\-－]?\s*\d)/g, "\n")
    .split(/\n+/)
    .map(x => x.trim())
    .filter(Boolean);
}

function idbExtractRequiredSkills(lines, text) {
  const skills = [];
  const skillNames = SKILL_SIM_ALL.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const addSkill = (name, required) => {
    required = parseFloat(required);
    if (!name || !Number.isFinite(required)) return;
    if (!skills.some(x => x.name === name && x.required === required)) {
      skills.push({name, current: skillSimValue(name), required});
    }
  };

  const section = idbSectionLines(lines, ["必要スキル", "必要Skill", "Required Skill"], ["装備部位", "使用可能", "ダメージ", "攻撃間隔", "付加効果", "追加効果", "説明", "特殊条件"], 12);
  section.forEach(l => {
    let m;
    const re = new RegExp(`(${skillNames})\\s*[:：]?\\s*([0-9]+(?:\\.[0-9]+)?)`, "g");
    while ((m = re.exec(l)) !== null) addSkill(m[1], m[2]);
  });

  if (!skills.length) {
    let m;
    const re = new RegExp(`(${skillNames})\\s*[:：]?\\s*([0-9]+(?:\\.[0-9]+)?)`, "g");
    while ((m = re.exec(text)) !== null) addSkill(m[1], m[2]);
  }

  return skills.slice(0, 4);
}

function idbCanonicalEffectLine(line, nextLine="") {
  let s = String(line || "").trim();
  const n = String(nextLine || "").trim();
  if (s && !/[+-]?\d+(?:\.\d+)?/.test(s) && /^[+-]?\d+(?:\.\d+)?%?$/.test(n)) {
    s = `${s} ${n}`;
  }
  return s
    .replace(/上昇/g, "+")
    .replace(/増加/g, "+")
    .replace(/減少/g, "-")
    .replace(/補正/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function idbSplitEffectLine(line) {
  const s = String(line || "").trim();
  if (!s) return [];
  // 「回避 + 10.0; 最大重量 + 30.0; 移動速度 + 5.0」のような公式DBスニペットを分割。
  const parts = s.split(/\s*[;；]\s*/).map(x => x.trim()).filter(Boolean);
  if (parts.length > 1) return parts;

  // セミコロンが消えていても、主要ステータス名の直前で分割できる範囲だけ分ける。
  const marked = s.replace(/\s+(?=(?:攻撃力|魔力|移動速度|速度|最大HP|HP|最大MP|MP|最大ST|ST|最大重量|重量|命中|回避|防御力|アーマークラス|AC|攻撃ディレイ|魔法ディレイ|火耐性|水耐性|地耐性|風耐性|無耐性)\s*[+-]?\s*\d)/g, "\n");
  return marked.split(/\n+/).map(x => x.trim()).filter(Boolean);
}

function idbEffectNumberFor(line, labels) {
  const label = Array.isArray(labels) ? labels.join("|") : labels;
  const re = new RegExp(`(?:${label})\\s*(?:[+＋]|-|－)?\\s*([+-]?\\d+(?:\\.\\d+)?)`, "i");
  const m = String(line || "").match(re);
  if (m) {
    const signText = (String(line || "").match(new RegExp(`(?:${label})\\s*([+＋\\-－])`, "i")) || [])[1] || "";
    const n = parseFloat(m[1]);
    return /[-－]/.test(signText) && n > 0 ? -n : n;
  }
  const fallback = String(line || "").match(/([+-]?\d+(?:\.\d+)?)/);
  return fallback ? parseFloat(fallback[1]) : NaN;
}

function idbSetEquipmentBuff(row, name, note="") {
  const n = String(name || "").trim();
  const d = String(note || "").trim();
  if (!n) return;
  row.equipBuffEnabled = true;
  row.equipBuffName = n;
  row.equipBuffNote = d;
  row.equipBuffSlot = true;
}

function idbExtractEquipBuff(lines, text="") {
  let sec = idbSectionLines(lines, ["付加効果"], ["追加効果", "装備部位", "使用可能", "必要スキル", "ダメージ", "攻撃間隔", "有効レンジ", "アーマークラス", "消耗度", "重さ", "素材", "特殊条件", "レアアイテム", "アイテム画像", "説明"], 12)
    .map(x => String(x || "").trim())
    .filter(Boolean);

  if (!sec.length && text) {
    const compact = idbCompactFieldText(text, ["付加効果"], ["追加効果", "特殊条件", "装備部位", "必要スキル", "アーマークラス", "使用可能性別", "使用可能種族", "使用可能シップ"]);
    if (compact) sec = compact.split(/\n+/).map(x => x.trim()).filter(Boolean);
  }

  if (!sec.length) return null;

  let name = sec[0];
  let noteLines = sec.slice(1);

  const oneLine = name.match(/^(.+?)(?:\s{2,}|\s+)(.+)$/);
  if (oneLine && oneLine[1].length <= 24 && /効果|獲物|説明|※|WarAge|移動|攻撃|防御|上昇|増加|減少|自然回復/.test(oneLine[2])) {
    name = oneLine[1].trim();
    noteLines.unshift(oneLine[2].trim());
  }

  return {name, note: noteLines.join(" ").trim()};
}


function idbApplyAdditionalEffectLine(row, line) {
  const subLines = idbSplitEffectLine(line);
  if (subLines.length > 1) {
    subLines.forEach(part => idbApplyAdditionalEffectLine(row, part));
    return;
  }

  const s = idbCanonicalEffectLine(line);
  if (!s) return;

  const add = (prop, v) => row[prop] = +(row[prop] || 0) + (+v || 0);
  const display = (key, name, value, unit="") => pushDisplayEffect(row, key, value, name, unit, "display");

  let num;

  if (/(?:攻撃力|ATK)/i.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["攻撃力", "ATK"]))) return add("attack", num);
  if (/(?:魔力|MGC)/i.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["魔力", "MGC"]))) return add("magic", num);
  if (/(?:移動速度|速度)/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["移動速度", "速度"]))) return add("speed", num);
  if (/(?:最大HP|ＨＰ|HP)/i.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["最大HP", "ＨＰ", "HP"]))) return add("extraHP", num);
  if (/(?:最大MP|ＭＰ|MP)/i.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["最大MP", "ＭＰ", "MP"]))) return add("extraMP", num);
  if (/(?:最大ST|ＳＴ|ST)/i.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["最大ST", "ＳＴ", "ST"]))) return add("extraST", num);
  if (/(?:最大重量|重量)/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["最大重量", "重量"]))) return add("extraMaxWeight", num);
  if (/命中/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["命中"]))) return add("extraHit", num);
  if (/回避/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["回避"]))) return add("extraAvoid", num);
  if (/(?:防御力|アーマークラス|AC)/i.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["防御力", "アーマークラス", "AC"]))) return add("extraAC", num);
  if (/攻撃ディレイ/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["攻撃ディレイ"]))) return add("extraAttackDelay", num);
  if (/魔法ディレイ/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["魔法ディレイ"]))) return add("extraMagicDelay", num);
  if (/火耐性|耐火属性|火属性抵抗/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["火耐性", "耐火属性", "火属性抵抗"]))) return add("extraFireRes", num);
  if (/水耐性|耐水属性|水属性抵抗/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["水耐性", "耐水属性", "水属性抵抗"]))) return add("extraWaterRes", num);
  if (/地耐性|耐地属性|地属性抵抗/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["地耐性", "耐地属性", "地属性抵抗"]))) return add("extraEarthRes", num);
  if (/風耐性|耐風属性|風属性抵抗/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["風耐性", "耐風属性", "風属性抵抗"]))) return add("extraWindRes", num);
  if (/無耐性|耐無属性|無属性抵抗/.test(s) && Number.isFinite(num = idbEffectNumberFor(s, ["無耐性", "耐無属性", "無属性抵抗"]))) return add("extraNeutralRes", num);

  const genericNum = idbEffectNumberFor(s, [".+?"]);
  const skill = SKILL_SIM_ALL.find(name => s.includes(name));
  if (skill && Number.isFinite(genericNum)) return display("skillPlus", skill, genericNum, "");

  const elem = ELEMENT_DAMAGE_OPTIONS.find(x => s.includes(x.replace("属性", "")) || s.includes(x));
  if (elem && /ダメージ|属性/.test(s) && Number.isFinite(genericNum)) return display("elementDamagePct", elem, genericNum, "%");

  // 計算に未対応の効果は消さずに表示用へ残す
  display("custom", s.replace(/[+-]?\d+(?:\.\d+)?%?/, "").trim() || "追加効果", Number.isFinite(genericNum) ? genericNum : 0, /%/.test(s) ? "%" : "");
}

function idbCollectEffectLines(lines, text="") {
  const raw = [];
  const joined = [lines.join("\n"), text || ""].join("\n");

  ["追加効果", "特殊効果"].forEach(label => {
    raw.push(...idbSectionLines(lines, [label], ["付加効果", "装備部位", "使用可能", "必要スキル", "ダメージ", "攻撃間隔", "有効レンジ", "アーマークラス", "消耗度", "重さ", "素材", "特殊条件", "レアアイテム", "アイテム画像", "説明"], 24));
  });

  const compact = idbCompactFieldText(joined, ["追加効果", "特殊効果"], ["特殊条件", "付加効果", "装備部位", "必要スキル", "アーマークラス", "使用可能性別", "使用可能種族", "使用可能シップ", "消耗度", "重さ", "素材"]);
  if (compact) raw.push(compact);

  const out = [];
  const addUnique = v => {
    const line = String(v || "").trim();
    if (line && !/^(なし|無し|NO|－|-)$/.test(line) && !out.includes(line)) out.push(line);
  };

  const statRe = /(?:攻撃力|魔力|移動速度|速度|最大HP|HP|最大MP|MP|最大ST|ST|最大重量|重量|命中|回避|防御力|アーマークラス|AC|攻撃ディレイ|魔法ディレイ|火耐性|耐火属性|火属性抵抗|水耐性|耐水属性|水属性抵抗|地耐性|耐地属性|地属性抵抗|風耐性|耐風属性|風属性抵抗|無耐性|耐無属性|無属性抵抗)\s*[+＋\-－]?\s*\d+(?:\.\d+)?/g;

  for (let i = 0; i < raw.length; i++) {
    const line = idbCanonicalEffectLine(raw[i], raw[i + 1]);
    let found = false;
    let m;
    statRe.lastIndex = 0;
    while ((m = statRe.exec(line)) !== null) {
      addUnique(m[0]);
      found = true;
    }
    if (!found) {
      idbSplitEffectLine(line).forEach(addUnique);
    }
    if (line !== raw[i] && /^[+-]?\d+(?:\.\d+)?%?$/.test(String(raw[i + 1] || "").trim())) i++;
  }

  if (!out.length && compact) {
    let m;
    statRe.lastIndex = 0;
    while ((m = statRe.exec(compact)) !== null) addUnique(m[0]);
  }

  return out.slice(0, 30);
}

function idbExtractInertiaDataPage(raw) {
  const s = String(raw || "");
  let encoded = "";

  try {
    if (typeof DOMParser !== "undefined") {
      const doc = new DOMParser().parseFromString(s, "text/html");
      encoded = doc.querySelector("#app")?.getAttribute("data-page") || "";
    }
  } catch {}

  if (!encoded) {
    const m = s.match(/<div\s+id=["']app["'][^>]*\sdata-page=["']([\s\S]*?)["'][^>]*>/i)
      || s.match(/data-page=["']([\s\S]*?)["']/i);
    encoded = m ? m[1] : "";
  }

  if (!encoded) return null;

  try {
    const decoded = idbDecodeHtmlEntities(idbDecodeJsonEscapes(encoded));
    return JSON.parse(decoded);
  } catch (e) {
    try {
      const decoded = encoded
        .replace(/&quot;/g, "\"")
        .replace(/&amp;/g, "&")
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/\\\//g, "/");
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}

function idbStructuredItemFromPage(page) {
  const props = page?.props || {};
  return props.defense || props.defence || props.weapon || props.shield || props.asset || null;
}

function idbStatusValue(status) {
  const p = status?.pivot || {};
  const v = p.value ?? status.value ?? p.add_value ?? 0;
  return parseFloat(v) || 0;
}

function idbApplyStructuredStatus(row, name, value) {
  const n = String(name || "").trim();
  const v = parseFloat(value) || 0;
  if (!n || !v || n === "なし") return;

  const add = prop => row[prop] = +(row[prop] || 0) + v;
  if (/攻撃力/.test(n)) return add("attack");
  if (/魔力/.test(n)) return add("magic");
  if (/移動速度|速度/.test(n)) return add("speed");
  if (/最大HP|HP/.test(n)) return add("extraHP");
  if (/最大MP|MP/.test(n)) return add("extraMP");
  if (/最大ST|ST/.test(n)) return add("extraST");
  if (/最大重量|重量/.test(n)) return add("extraMaxWeight");
  if (/命中/.test(n)) return add("extraHit");
  if (/回避/.test(n)) return add("extraAvoid");
  if (/防御力|アーマークラス|AC/.test(n)) return add("extraAC");
  if (/攻撃ディレイ/.test(n)) return add("extraAttackDelay");
  if (/魔法ディレイ/.test(n)) return add("extraMagicDelay");
  if (/耐火属性|火耐性|火属性抵抗/.test(n)) return add("extraFireRes");
  if (/耐水属性|水耐性|水属性抵抗/.test(n)) return add("extraWaterRes");
  if (/耐地属性|地耐性|地属性抵抗/.test(n)) return add("extraEarthRes");
  if (/耐風属性|風耐性|風属性抵抗/.test(n)) return add("extraWindRes");
  if (/耐無属性|無耐性|無属性抵抗/.test(n)) return add("extraNeutralRes");

  pushDisplayEffect(row, "custom", v, n, "", "display");
}

function idbWeaponSkillName(item) {
  const reqs = idbStructuredWeaponRequirements(item);
  return reqs[0]?.name || "";
}

function idbNormalizeSkillNameForTool(name) {
  const s = String(name || "").trim();
  if (!s || s === "[object Object]") return "";

  const direct = SKILL_SIM_ALL.find(x => x === s);
  if (direct) return direct;

  const noSpace = s.replace(/\s+/g, "");
  const alias = {
    "刀剣": "刀剣",
    "刀剣スキル": "刀剣",
    "刀剣skill": "刀剣",
    "こんぼう": "こんぼう",
    "棍棒": "こんぼう",
    "棍棒スキル": "こんぼう",
    "槍": "槍",
    "槍スキル": "槍",
    "素手": "素手",
    "素手スキル": "素手",
    "弓": "弓",
    "弓スキル": "弓",
    "銃器": "銃器",
    "銃器スキル": "銃器",
    "投げ": "投げ",
    "投げスキル": "投げ",
    "罠": "罠",
    "罠スキル": "罠",
    "牙": "牙",
    "牙スキル": "牙",
    "キック": "キック",
    "キックスキル": "キック",
    "戦闘技術": "戦闘技術",
    "盾": "盾",
    "着こなし": "着こなし",
    "攻撃回避": "攻撃回避"
  };
  if (alias[noSpace]) return alias[noSpace];

  // 「必要スキル 刀剣」「刀剣 1.0」などの文字列からは拾う。
  const matches = SKILL_SIM_ALL
    .slice()
    .sort((a, b) => b.length - a.length)
    .filter(x => new RegExp(`(^|[^ぁ-んァ-ヶ一-龠A-Za-z0-9])${idbEscapeRegExp(x)}([^ぁ-んァ-ヶ一-龠A-Za-z0-9]|$)`).test(s));
  if (matches.length === 1) return matches[0];

  if (/棍棒/.test(s) && matches.length === 0) return "こんぼう";

  // ここで raw string を返すと、後段のUI正規化で「こんぼう」に化ける。
  // 不明な値は空にして捨てる。
  return "";
}

function idbEscapeRegExp(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function idbSkillNamesInText(text) {
  const source = String(text || "");
  const out = [];
  const add = name => {
    const n = idbNormalizeSkillNameForTool(name);
    if (n && !out.includes(n)) out.push(n);
  };

  SKILL_SIM_ALL
    .slice()
    .sort((a, b) => b.length - a.length)
    .forEach(skill => {
      const re = new RegExp(`(^|[^ぁ-んァ-ヶ一-龠A-Za-z0-9])${idbEscapeRegExp(skill)}([^ぁ-んァ-ヶ一-龠A-Za-z0-9]|$)`);
      if (re.test(source)) add(skill);
    });

  // 表記揺れ
  if (/棍棒/.test(source)) add("こんぼう");
  return out;
}

function idbFlattenPrimitiveText(value, out=[], seen=new WeakSet(), depth=0, path="") {
  if (value == null || depth > 8) return out;
  if (typeof value === "string" || typeof value === "number") {
    out.push(`${path} ${value}`);
    return out;
  }
  if (typeof value !== "object") return out;
  if (seen.has(value)) return out;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((v, i) => idbFlattenPrimitiveText(v, out, seen, depth + 1, `${path} ${i}`));
    return out;
  }

  Object.entries(value).forEach(([k, v]) => {
    // ルート定義や説明文ノイズは除外。itemオブジェクト用なので基本は残す。
    if (/created_at|updated_at|image|icon|url|route|ziggy/i.test(k)) return;
    idbFlattenPrimitiveText(v, out, seen, depth + 1, `${path} ${k}`);
  });
  return out;
}

function idbWeaponReqsFromText(text, defaultLevel=0) {
  const source = idbDecodeHtmlEntities(idbDecodeJsonEscapes(String(text || "")))
    .replace(/[{}\[\]",]/g, " ")
    .replace(/[：:=]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const out = [];
  const add = (name, level) => {
    const skillName = idbNormalizeSkillNameForTool(name);
    const required = idbNumberFromAny(level);
    if (!skillName || !required) return;
    if (!out.some(x => x.name === skillName && +x.required === +required)) {
      out.push({name: skillName, current: skillSimValue(skillName), required});
    }
  };

  const skills = SKILL_SIM_ALL.slice().sort((a, b) => b.length - a.length);
  const levelLabel = "(?:value|level|required|need|need_level|needLevel|required_level|requiredLevel|requiredSkillLevel|required_skill_level|require_skill_value|skill_level|skillLevel|point|points)";

  skills.forEach(skill => {
    const s = idbEscapeRegExp(skill);
    let m;

    const pairRe = new RegExp(`${s}\\s*(?:Lv\\.?|level|必要|required|need)?\\s*([0-9]+(?:\\.\\d+)?)`, "g");
    while ((m = pairRe.exec(source)) !== null) add(skill, m[1]);

    const nearRe = new RegExp(`${s}[\\s\\S]{0,160}?${levelLabel}\\d*\\s*([0-9]+(?:\\.\\d+)?)`, "g");
    while ((m = nearRe.exec(source)) !== null) add(skill, m[1]);

    const revRe = new RegExp(`${levelLabel}\\d*\\s*([0-9]+(?:\\.\\d+)?)[\\s\\S]{0,160}?${s}`, "g");
    while ((m = revRe.exec(source)) !== null) add(skill, m[1]);
  });

  if (!out.length && defaultLevel) {
    idbSkillNamesInText(source).forEach(name => add(name, defaultLevel));
  }

  return idbDedupeWeaponRequirements(out);
}

function idbNumericValueFromTextLabels(text, labels) {
  const source = idbDecodeHtmlEntities(idbDecodeJsonEscapes(String(text || "")))
    .replace(/[{}\[\]",]/g, " ")
    .replace(/\s+/g, " ");
  for (const label of labels) {
    const l = idbEscapeRegExp(label);
    const re = new RegExp(`${l}\\s*[：:]?\\s*([+-]?\\d+(?:\\.\\d+)?)`, "i");
    const m = source.match(re);
    if (m) return parseFloat(m[1]) || 0;
  }
  return 0;
}

function idbSupplementStructuredWeapon(row, item, raw, page=null) {
  if (!row || !isWeaponEquipmentRow(row)) return row;

  const itemText = idbFlattenPrimitiveText(item).join("\n");
  const pageText = [
    idbFlattenPrimitiveText(page?.props?.weapon || {}).join("\n"),
    idbPagePropsCompactText(page)
  ].filter(Boolean).join("\n");
  const looseText = (() => {
    try { return idbTextFromPaste(raw); } catch { return ""; }
  })();
  const combined = [itemText, pageText, looseText].filter(Boolean).join("\n");

  const directLevel =
    idbNumberFromAny(item?.need_level) ||
    idbNumberFromAny(item?.required_level) ||
    idbNumberFromAny(item?.requiredSkillLevel) ||
    idbNumberFromAny(item?.required_skill_level) ||
    idbNumberFromAny(item?.skill_level);

  // requiredSkill が「こんぼう 素手」のような複数名 + need_level 1個の場合にも対応。
  const existingReqs = idbDedupeWeaponRequirements(row.weaponReq || []);
  const fromDirectSkillText = idbWeaponReqsFromText(String(item?.requiredSkill ?? item?.required_skill ?? ""), directLevel);

  // 既に構造化data-pageから必要スキルが取れている場合、HTML全文/周辺JSONからの補完は混ぜない。
  // これでSGKウェポンに不要な「こんぼう」が紛れ込むのを防ぐ。
  const fromCombinedText = existingReqs.length
    ? []
    : idbWeaponReqsFromText(combined, directLevel);

  const mergedReqs = idbDedupeWeaponRequirements([...existingReqs, ...fromDirectSkillText, ...fromCombinedText]);
  if (mergedReqs.length) row.weaponReq = mergedReqs;

  if (!(row.weaponAttackInterval > 0)) {
    row.weaponAttackInterval =
      idbNumericValueFromTextLabels(combined, ["攻撃間隔", "攻撃ディレイ", "attack_interval", "attackInterval", "attackSpeed", "attack_speed", "delay", "interval"]) || row.weaponAttackInterval || 0;
  }

  if (!(row.weaponRange > 0)) {
    row.weaponRange =
      idbNumericValueFromTextLabels(combined, ["有効レンジ", "攻撃射程", "射程", "レンジ", "effective_range", "effectiveRange", "valid_range", "validRange", "attack_range", "attackRange", "range"]) || row.weaponRange || 0;
  }

  if (!(row.weaponDamage > 0)) {
    row.weaponDamage =
      idbNumericValueFromTextLabels(combined, ["ダメージ", "damage", "attack", "atk", "power"]) || row.weaponDamage || 0;
  }

  return row;
}


function idbNumberFromAny(v) {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const m = v.match(/([+-]?[0-9]+(?:\.[0-9]+)?)/);
    return m ? parseFloat(m[1]) : 0;
  }
  if (typeof v === "object") {
    const keys = [
      "value", "level", "required", "required_level", "requiredLevel",
      "need_level", "needLevel", "skill_level", "skillLevel",
      "num", "point", "points", "amount", "rate"
    ];
    for (const key of keys) {
      const n = idbNumberFromAny(v[key]);
      if (n) return n;
    }
    const nested = [v.pivot, v.meta, v.requirement, v.condition, v.skill_requirement].filter(Boolean);
    for (const obj of nested) {
      const n = idbNumberFromAny(obj);
      if (n) return n;
    }
  }
  return 0;
}

function idbSkillNameFromAny(v) {
  if (v == null) return "";
  if (typeof v === "string") return idbNormalizeSkillNameForTool(v);
  if (typeof v === "object") {
    const candidates = [
      v.name, v.skill_name, v.label, v.title, v.jp_name, v.ja_name, v.display_name,
      v.skill?.name, v.skill?.skill_name,
      v.required_skill?.name, v.requiredSkill?.name,
      v.attack_skill?.name, v.weapon_skill?.name
    ];
    for (const c of candidates) {
      const name = idbNormalizeSkillNameForTool(c);
      if (name) return name;
    }
  }
  return "";
}

function idbSkillLevelFromAny(v) {
  if (v == null) return 0;
  if (typeof v === "number" || typeof v === "string") return idbNumberFromAny(v);
  if (typeof v !== "object") return 0;

  const directKeys = [
    "required", "required_level", "requiredLevel", "need_level", "needLevel",
    "skill_level", "skillLevel", "level", "value", "num", "point"
  ];
  for (const key of directKeys) {
    const n = idbNumberFromAny(v[key]);
    if (n) return n;
  }

  const nested = [v.pivot, v.requirement, v.required, v.condition, v.meta].filter(Boolean);
  for (const obj of nested) {
    const n = idbSkillLevelFromAny(obj);
    if (n) return n;
  }

  return 0;
}

function idbDedupeWeaponRequirements(reqs) {
  const map = new Map();
  (reqs || []).forEach(req => {
    const name = idbNormalizeSkillNameForTool(req?.name);
    const required = idbNumberFromAny(req?.required);
    if (!name || !required) return;
    const prev = map.get(name);
    if (!prev || required > prev.required) {
      map.set(name, {name, current: skillSimValue(name), required});
    }
  });
  return Array.from(map.values()).slice(0, 8);
}

function idbAddStructuredRequirement(out, name, level) {
  const skillName = idbSkillNameFromAny(name);
  const required = idbNumberFromAny(level);
  if (!skillName || !required) return;
  if (!out.some(x => x.name === skillName && +x.required === +required)) {
    out.push({name: skillName, current: skillSimValue(skillName), required});
  }
}

function idbLooksLikeSkillRequirementObject(obj) {
  if (!obj || typeof obj !== "object") return false;
  const keys = Object.keys(obj).join(" ").toLowerCase();

  // stats/properties の {name:"攻撃間隔", value:290} などを必要スキル扱いしない。
  if (!/skill|required|require|need|level/.test(keys)) return false;

  const name = idbSkillNameFromAny(obj);
  const level = idbSkillLevelFromAny(obj);
  if (name && level) return true;

  return /skill|required|require|need|level/.test(keys) && (name || level);
}

function idbDeepCollectSkillRequirements(value, out, seen=new WeakSet(), depth=0) {
  if (value == null || depth > 7) return;
  if (typeof value !== "object") return;

  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach(v => idbDeepCollectSkillRequirements(v, out, seen, depth + 1));
    return;
  }

  // 典型: { skill:{name:"こんぼう"}, pivot:{value:81} }
  // 典型: { name:"素手", required_level:48 }
  if (idbLooksLikeSkillRequirementObject(value)) {
    const name = idbSkillNameFromAny(value);
    const level = idbSkillLevelFromAny(value);
    idbAddStructuredRequirement(out, name, level);
  }

  // 典型: { required_skill:{name:"こんぼう"}, required_skill_value:81 }
  const entries = Object.entries(value);
  for (const [key, val] of entries) {
    const k = key.toLowerCase();
    if (/skill/.test(k)) {
      const name = idbSkillNameFromAny(val);
      const siblingLevel =
        idbNumberFromAny(value.required_level) ||
        idbNumberFromAny(value.need_level) ||
        idbNumberFromAny(value.skill_level) ||
        idbNumberFromAny(value.requiredSkillLevel) ||
        idbNumberFromAny(value.required_skill_level) ||
        idbNumberFromAny(value.required_skill_value) ||
        idbNumberFromAny(value.require_skill_value) ||
        idbNumberFromAny(value.level) ||
        idbNumberFromAny(value.value) ||
        idbNumberFromAny(value.pivot);
      idbAddStructuredRequirement(out, name, siblingLevel);

      // 逆に skill オブジェクト内に値があるケース
      idbAddStructuredRequirement(out, name, idbSkillLevelFromAny(val));
    }
  }

  // 深掘り対象を広げる。ただしステータス配列は追加効果なので必要スキルには使わない。
  for (const [key, val] of entries) {
    const k = key.toLowerCase();
    if (/add_status|status|stat|property|properties|range|interval|delay|technic|buff|image|description|info|flavor|damage|durability/.test(k)) continue;
    if (typeof val === "object" && val) {
      idbDeepCollectSkillRequirements(val, out, seen, depth + 1);
    }
  }
}

function idbStructuredWeaponRange(item) {
  const direct = item?.range ?? item?.effective_range ?? item?.effectiveRange ?? item?.valid_range ?? item?.validRange ?? item?.shoot_range ?? item?.attack_range;
  const n = idbNumberFromAny(direct);
  if (n) return n;

  // 「有効レンジ」や「射程」が構造化配列に入っている保険
  const candidates = [item?.ranges, item?.weapon_ranges, item?.properties, item?.stats].filter(Array.isArray).flat();
  for (const c of candidates) {
    const name = String(c?.name ?? c?.label ?? c?.title ?? "");
    if (/有効レンジ|攻撃射程|射程|レンジ|range/i.test(name)) {
      const v = idbNumberFromAny(c);
      if (v) return v;
    }
  }
  return 0;
}

function idbStructuredWeaponInterval(item) {
  const direct = item?.attack_interval ?? item?.attackInterval ?? item?.delay ?? item?.interval ?? item?.attack_delay ?? item?.attackDelay;
  const n = idbNumberFromAny(direct);
  if (n) return n;

  const candidates = [item?.intervals, item?.weapon_intervals, item?.properties, item?.stats].filter(Array.isArray).flat();
  for (const c of candidates) {
    const name = String(c?.name ?? c?.label ?? c?.title ?? "");
    if (/攻撃間隔|ディレイ|delay|interval/i.test(name)) {
      const v = idbNumberFromAny(c);
      if (v) return v;
    }
  }
  return 0;
}


function idbIndexedWeaponRequirements(item) {
  const out = [];
  if (!item || typeof item !== "object") return out;

  const entries = Object.entries(item);

  const findLevelForIndex = idx => {
    const idxText = String(idx || "");
    const keyPatterns = [
      new RegExp(`(?:need|need_level|needLevel|required|required_level|requiredLevel|requiredSkillLevel|required_skill_level|skill_level|skillLevel|value|level)${idxText}$`, "i"),
      new RegExp(`${idxText}(?:need|need_level|needLevel|required|required_level|requiredLevel|requiredSkillLevel|required_skill_level|skill_level|skillLevel|value|level)$`, "i"),
      new RegExp(`(?:need|need_level|needLevel|required|required_level|requiredLevel|requiredSkillLevel|required_skill_level|skill_level|skillLevel|value|level)[_-]?${idxText}$`, "i")
    ];

    for (const [key, val] of entries) {
      if (/id$/i.test(key)) continue;
      if (keyPatterns.some(re => re.test(key))) {
        const n = idbNumberFromAny(val);
        if (n) return n;
      }
    }
    return 0;
  };

  entries.forEach(([key, val]) => {
    if (/id$/i.test(key)) return;
    const skillKey = /(?:requiredSkill|required_skill|requireSkill|require_skill|weaponSkill|weapon_skill|skill|skill_name)[_-]?(\d+)$/i.exec(key);
    if (!skillKey) return;

    const idx = skillKey[1];
    const name = idbSkillNameFromAny(val);
    if (!name) return;

    const level =
      idbSkillLevelFromAny(val) ||
      findLevelForIndex(idx) ||
      idbNumberFromAny(item.need_level) ||
      idbNumberFromAny(item.required_level) ||
      idbNumberFromAny(item.requiredSkillLevel) ||
      idbNumberFromAny(item.required_skill_level) ||
      idbNumberFromAny(item.skill_level);

    idbAddStructuredRequirement(out, name, level);
  });

  return idbDedupeWeaponRequirements(out);
}

function idbExternalPageWeaponRequirements(page) {
  const props = page?.props || {};
  const out = [];
  const keys = [
    "requiredSkills", "required_skills",
    "requirements", "requires",
    "requireSkills", "require_skills",
    "weaponRequirements", "weapon_requirements",
    "skillRequirements", "skill_requirements",
    "itemSkillRequirements", "item_skill_requirements"
  ];

  keys.forEach(key => {
    const val = props[key];
    if (Array.isArray(val)) idbDeepCollectSkillRequirements(val, out);
  });

  return idbDedupeWeaponRequirements(out);
}

function idbPagePropsCompactText(page) {
  const props = page?.props || {};
  const picked = {};
  [
    "weapon",
    "requiredSkills", "required_skills",
    "requirements", "requires",
    "requireSkills", "require_skills",
    "weaponRequirements", "weapon_requirements",
    "skillRequirements", "skill_requirements",
    "itemSkillRequirements", "item_skill_requirements"
  ].forEach(key => {
    if (props[key] != null) picked[key] = props[key];
  });
  try {
    return JSON.stringify(picked);
  } catch {
    return "";
  }
}

function idbStructuredWeaponRequirements(item, page=null) {
  const out = [];

  const directName = item?.requiredSkill ?? item?.required_skill ?? item?.required_skill_name ?? item?.skill_name ?? item?.weapon_skill_name ?? "";
  const directLevel =
    item?.requiredSkillLevel ?? item?.required_skill_level ?? item?.required_level ??
    item?.need_level ?? item?.skill_level ?? item?.required_skill_value ??
    item?.require_skill_value ?? item?.skill_value ?? item?.level ?? 0;

  // 高信頼: direct field + direct level
  idbWeaponReqsFromText(String(directName || ""), idbNumberFromAny(directLevel)).forEach(req => {
    idbAddStructuredRequirement(out, req.name, req.required);
  });
  idbAddStructuredRequirement(out, directName, directLevel);

  // 高信頼: requiredSkill1/need_level1 などの番号付きフィールド
  idbIndexedWeaponRequirements(item).forEach(req => idbAddStructuredRequirement(out, req.name, req.required));

  // 高信頼: props側の明示的なrequirements系配列
  idbExternalPageWeaponRequirements(page).forEach(req => idbAddStructuredRequirement(out, req.name, req.required));

  const objects = [
    item?.requiredSkill,
    item?.required_skill,
    item?.skill,
    item?.weapon_skill,
    item?.attack_skill,
    item?.require_skill,
    item?.requirement_skill,
    item?.type
  ].filter(Boolean);

  objects.forEach(obj => {
    const name = idbSkillNameFromAny(obj);
    const level = idbSkillLevelFromAny(obj) || idbNumberFromAny(directLevel);
    idbAddStructuredRequirement(out, name, level);
  });

  const arrays = [
    item?.requiredSkills,
    item?.required_skills,
    item?.skills,
    item?.requirements,
    item?.requires,
    item?.require_skills,
    item?.requireSkills,
    item?.weapon_requirements,
    item?.weaponRequirements,
    item?.skill_requirements,
    item?.skillRequirements,
    item?.item_skill_requirements,
    item?.itemSkillRequirements,
    item?.required_skill_values,
    item?.requiredSkillValues
  ].filter(Array.isArray);

  arrays.flat().forEach(req => {
    const name =
      idbSkillNameFromAny(req?.skill) ||
      idbSkillNameFromAny(req?.required_skill) ||
      idbSkillNameFromAny(req?.requiredSkill) ||
      idbSkillNameFromAny(req?.name) ||
      idbSkillNameFromAny(req?.skill_name) ||
      idbSkillNameFromAny(req);
    const level =
      idbSkillLevelFromAny(req) ||
      idbSkillLevelFromAny(req?.pivot) ||
      idbSkillLevelFromAny(req?.skill) ||
      idbSkillLevelFromAny(req?.required_skill) ||
      idbSkillLevelFromAny(req?.requiredSkill);
    idbAddStructuredRequirement(out, name, level);
  });

  idbDeepCollectSkillRequirements(item, out);

  const highConfidence = idbDedupeWeaponRequirements(out);
  if (highConfidence.length) return highConfidence;

  // 低信頼フォールバック:
  // ここは「構造化フィールドから1件も取れなかった時だけ」使う。
  // SGKウェポンのようにHTML本文/周辺JSONに別武器カテゴリ名が混じると、
  // こんぼう等を誤検出するため、通常は混ぜない。
  idbWeaponReqsFromText(idbFlattenPrimitiveText(item).join("\n"), idbNumberFromAny(directLevel)).forEach(req => {
    idbAddStructuredRequirement(out, req.name, req.required);
  });
  idbWeaponReqsFromText(idbPagePropsCompactText(page), idbNumberFromAny(directLevel)).forEach(req => {
    idbAddStructuredRequirement(out, req.name, req.required);
  });

  return idbDedupeWeaponRequirements(out);
}

function idbRowFromStructuredItem(item, page=null, raw="") {
  if (!item || typeof item !== "object") return null;

  const equipText = String(item.equip || item.equip_name || item.equipPart || item.equip_part || item.equip?.name || "");
  const itemKind = String(item.type || item.itemType || page?.component || "");
  const hasWeaponData =
    item.damage != null || item.attack != null || item.atk != null || item.power != null ||
    idbStructuredWeaponInterval(item) || idbStructuredWeaponRange(item) ||
    /Weapon/i.test(itemKind);
  const slot = idbMapSlot(`${equipText} ${item.name || ""} ${hasWeaponData ? "武器" : ""}`);
  const row = defaultEquipmentCandidate(slot, false);

  row.name = String(item.name || item.item_name || "公式DB取り込み装備").trim();
  row.enabled = false;
  row.note = item.info ? String(item.info).trim() : "公式DB URL取り込み";
  row.weaponTwoHanded = /2HAND|両手/i.test(equipText) ? "○" : "×";

  if (item.armor_class != null) row.extraAC = parseFloat(item.armor_class) || 0;
  const damageValue = item.damage ?? item.attack ?? item.atk ?? item.power;
  const intervalValue = idbStructuredWeaponInterval(item);
  const rangeValue = idbStructuredWeaponRange(item);
  const durabilityValue = item.durability ?? item.max_durability ?? item.maxDurability;

  if (damageValue != null) row.weaponDamage = parseFloat(damageValue) || 0;
  if (intervalValue) row.weaponAttackInterval = intervalValue;
  if (rangeValue) row.weaponRange = rangeValue;
  if (durabilityValue != null) row.weaponDurability = parseFloat(durabilityValue) || 0;

  const weaponReqs = idbStructuredWeaponRequirements(item, page);
  if (hasWeaponData && weaponReqs.length) {
    row.weaponReq = weaponReqs;
  }

  const technic = item.technic || item.buff || item.effect || null;
  if (technic?.name && technic.name !== "なし") {
    idbSetEquipmentBuff(row, technic.name, technic.info || "");
  }

  const addStatuses = item.add_statuses || item.addStatuses || item.add_status || [];
  if (Array.isArray(addStatuses)) {
    addStatuses.forEach(st => idbApplyStructuredStatus(row, st.name, idbStatusValue(st)));
  }

  idbSupplementStructuredWeapon(row, item, raw, page);

  return {
    row: normalizeEquipmentCandidate(row),
    text: "",
    lines: [],
    equipPart: equipText,
    effectLines: Array.isArray(addStatuses)
      ? addStatuses.filter(st => st?.name && st.name !== "なし" && idbStatusValue(st)).map(st => `${st.name} ${idbStatusValue(st) >= 0 ? "+" : ""}${idbStatusValue(st)}`)
      : [],
    source: "data-page"
  };
}

function parseIdbStructuredPage(raw) {
  const page = idbExtractInertiaDataPage(raw);
  const item = idbStructuredItemFromPage(page);
  if (!item) return null;
  return idbRowFromStructuredItem(item, page, raw);
}


function parseIdbEquipmentFromPaste(raw) {
  const structured = parseIdbStructuredPage(raw);
  if (structured?.row) return structured;

  const text = idbTextFromPaste(raw);
  const lines = idbLines(text);
  if (!text) throw new Error("公式DBページの本文を貼り付けてください。");

  const name = idbGuessName(lines, text);
  const equipPart = idbExtractEquipPart(lines, text, name);
  const slot = idbMapSlot(`${equipPart} ${name}`);

  const row = defaultEquipmentCandidate(slot, false);
  row.name = name;
  row.enabled = false;
  row.note = "公式DB貼り付け取り込み";
  row.weaponTwoHanded = /2HAND|両手/i.test(`${equipPart} ${text}`) ? "○" : "×";

  const damage = idbValueAfterLabels(lines, ["ダメージ", "Damage"]);
  const interval = idbValueAfterLabels(lines, ["攻撃間隔", "間隔", "Attack Interval"]);
  const range = idbValueAfterLabels(lines, ["有効レンジ", "レンジ", "射程", "Range"]);
  const ac = idbValueAfterLabels(lines, ["アーマークラス", "防御力", "AC"]);
  const durability = idbValueAfterLabels(lines, ["消耗度", "耐久", "Durability"]);

  if (damage) row.weaponDamage = damage;
  if (interval) row.weaponAttackInterval = interval;
  if (range) row.weaponRange = range;
  if (durability) row.weaponDurability = durability;
  if (ac) row.extraAC = ac;

  row.weaponReq = idbExtractRequiredSkills(lines, text);

  const buff = idbExtractEquipBuff(lines, text);
  if (buff) idbSetEquipmentBuff(row, buff.name, buff.note);

  const effectLines = idbCollectEffectLines(lines, text);
  effectLines.forEach(line => idbApplyAdditionalEffectLine(row, line));

  return {
    row: normalizeEquipmentCandidate(row),
    text,
    lines,
    equipPart,
    effectLines
  };
}

function idbApplyManualCorrections(parsed) {
  if (!parsed?.row) return parsed;
  const name = byId("idbParsedName")?.value?.trim();
  const slot = byId("idbParsedSlot")?.value?.trim();
  if (name) parsed.row.name = name;
  if (slot) parsed.row.slot = slot;
  return parsed;
}

function idbPreviewValue(value, unit="") {
  if (value == null || value === "" || Number.isNaN(+value)) return "未取得";
  const n = +value;
  if (!n) return "未取得";
  return `${fmt(n, Number.isInteger(n) ? 0 : 1)}${unit}`;
}

function idbPreviewIsWeapon(row) {
  return isWeaponEquipmentRow(row) || /^武器:/.test(String(row?.slot || ""));
}

function idbPreviewEquipAllowsBothHands(parsed) {
  const raw = `${parsed?.equipPart || ""} ${parsed?.row?.rawEquipPart || ""}`;
  return /右手/.test(raw) && /左手/.test(raw);
}

function idbPreviewWarnings(parsed) {
  const r = parsed?.row || {};
  const warnings = [];
  const isWeapon = idbPreviewIsWeapon(r);

  if (!r.name) warnings.push("装備名が未取得です。");
  if (!r.slot) warnings.push("装備部位が未取得です。手動補正欄で選んでください。");

  if (isWeapon) {
    if (!Array.isArray(r.weaponReq) || !r.weaponReq.length) warnings.push("武器なのに必要スキルが未取得です。");
    if (!(+r.weaponDamage > 0)) warnings.push("武器なのに武器ダメージが未取得です。");
    if (!(+r.weaponAttackInterval > 0)) warnings.push("武器なのに攻撃間隔が未取得です。");
    if (!(+r.weaponRange > 0)) warnings.push("武器なのに射程/有効レンジが未取得です。");
    if (idbPreviewEquipAllowsBothHands(parsed)) warnings.push("公式DB上は右手/左手の両対応です。このツールでは初期スロットを右手優先にしています。左手で使う場合は候補追加後に変更してください。");
  }

  if (r.equipBuffEnabled || r.equipBuffName || r.equipBuffNote) {
    warnings.push("装備Buffは名称と説明文のみ取得できます。実際の効果値はDB仕様上取得できないため、必要なら手入力してください。");
  }

  return warnings;
}

function idbPreviewField(label, value, important=false, missing=false) {
  const cls = ["idbPreviewField", important ? "important" : "", missing ? "missing" : ""].filter(Boolean).join(" ");
  return `<div class="${cls}"><span>${escapeHtml(label)}</span><b>${escapeHtml(value || "-")}</b></div>`;
}

function idbPreviewSection(title, body, extraClass="") {
  if (!body) return "";
  return `<div class="idbPreviewSection ${extraClass}"><h5>${escapeHtml(title)}</h5>${body}</div>`;
}

function idbPreviewNoticeHtml() {
  return `<div class="idbPreviewInfo">
    公式DBから取れる装備Buff情報は「Buff名」と「説明文」までです。
    装備Buffの攻撃力%・属性ダメージ%・ST自然回復量などの実効果値はDB仕様上取得できません。必要なら候補追加後に装備詳細またはBuff登録で手入力してください。
  </div>`;
}


function idbEquipmentPreviewHtml(parsed) {
  const r = parsed.row;
  const isWeapon = idbPreviewIsWeapon(r);
  const warnings = idbPreviewWarnings(parsed);

  const sourceText = parsed.source
    ? `解析方式: ${parsed.source}`
    : "解析方式: 手動貼り付け/HTML本文";

  const reqText = Array.isArray(r.weaponReq) && r.weaponReq.length
    ? r.weaponReq.map(x => `${x.name} ${x.required}`).join(" / ")
    : "未取得";

  const mainFields = [
    idbPreviewField("推定部位", r.slot || "-", true, !r.slot),
    parsed.equipPart ? idbPreviewField("公式DB上の装備部位", parsed.equipPart, false, false) : "",
    isWeapon ? idbPreviewField("必要スキル", reqText, true, !r.weaponReq?.length) : "",
    isWeapon ? idbPreviewField("武器ダメージ", idbPreviewValue(r.weaponDamage), true, !(+r.weaponDamage > 0)) : "",
    isWeapon ? idbPreviewField("攻撃間隔", idbPreviewValue(r.weaponAttackInterval), true, !(+r.weaponAttackInterval > 0)) : "",
    isWeapon ? idbPreviewField("射程/有効レンジ", idbPreviewValue(r.weaponRange), true, !(+r.weaponRange > 0)) : "",
    isWeapon && r.weaponTwoHanded === "○" ? idbPreviewField("両手武器", "○", false, false) : ""
  ].filter(Boolean).join("");

  const warningHtml = warnings.length
    ? `<div class="idbPreviewWarnings">${warnings.map(w => `<div>⚠ ${escapeHtml(w)}</div>`).join("")}</div>`
    : `<div class="idbPreviewOk">重要項目の未取得警告はありません。候補追加前に数値だけ確認してください。</div>`;

  const baseText = extraStatsEffectText(r, "base");
  const baseSection = baseText
    ? idbPreviewSection("装備本体の追加ステータス", `<div>${escapeHtml(baseText)}</div>`)
    : "";

  const buffSection = (r.equipBuffEnabled || r.equipBuffName || r.equipBuffNote)
    ? idbPreviewSection(
        "装備Buff",
        `<div><b>${escapeHtml(r.equipBuffName || "Buff名未取得")}</b>${r.equipBuffNote ? `<div class="mutedText">${escapeHtml(r.equipBuffNote)}</div>` : ""}</div>
         <div class="idbPreviewInfo mini">Buffの実効果値は公式DBから取得できません。必要な攻撃力%・属性ダメージ%などは手入力してください。</div>`,
        "buff"
      )
    : "";

  const displayEffects = additionalEffectsSummary(r);
  const displaySection = displayEffects.length
    ? idbPreviewSection("表示用効果", `<div>${escapeHtml(displayEffects.join(" / "))}</div>`)
    : "";

  const readLinesSection = parsed.effectLines?.length
    ? idbPreviewSection("読み取った追加効果行", `<div>${escapeHtml(parsed.effectLines.join(" / "))}</div>`)
    : "";

  return `
    <div class="idbPreviewHeader">
      <div>
        <b>${escapeHtml(r.name || "名称未取得")}</b>
        <span>${escapeHtml(sourceText)}</span>
      </div>
    </div>
    ${idbPreviewNoticeHtml()}
    ${warningHtml}
    <div class="idbPreviewGrid">${mainFields}</div>
    ${baseSection}
    ${buffSection}
    ${displaySection}
    ${readLinesSection}
  `;
}


function idbParserSelfTest() {
  const inertiaPage = `<div id="app" data-page="{&quot;component&quot;:&quot;Public/Items/Defences/Show&quot;,&quot;props&quot;:{&quot;defense&quot;:{&quot;id&quot;:22761,&quot;name&quot;:&quot;ジャイアント ドラゴンフライ&quot;,&quot;info&quot;:&quot;人より巨大なトンボの一種&quot;,&quot;equip&quot;:&quot;腰（装）&quot;,&quot;armor_class&quot;:0,&quot;requiredSkill&quot;:&quot;着こなし&quot;,&quot;need_level&quot;:1,&quot;technic&quot;:{&quot;name&quot;:&quot;トンボの餌&quot;,&quot;info&quot;:&quot;高速で移動する巨大なトンボに捕獲された獲物\\n※WarAgeでは効果がない&quot;},&quot;add_statuses&quot;:[{&quot;name&quot;:&quot;回避&quot;,&quot;pivot&quot;:{&quot;value&quot;:10}},{&quot;name&quot;:&quot;最大重量&quot;,&quot;pivot&quot;:{&quot;value&quot;:30}},{&quot;name&quot;:&quot;移動速度&quot;,&quot;pivot&quot;:{&quot;value&quot;:5}},{&quot;name&quot;:&quot;なし&quot;,&quot;pivot&quot;:{&quot;value&quot;:0}}]}}}"></div>`;

  const weaponPageDirect = `<div id="app" data-page="{&quot;component&quot;:&quot;Public/Items/Weapons/Show&quot;,&quot;props&quot;:{&quot;weapon&quot;:{&quot;id&quot;:17163,&quot;name&quot;:&quot;バール&quot;,&quot;equip&quot;:&quot;右手 1HAND&quot;,&quot;damage&quot;:65,&quot;attack_interval&quot;:310,&quot;range&quot;:4.2,&quot;durability&quot;:22,&quot;requiredSkill&quot;:&quot;こんぼう&quot;,&quot;need_level&quot;:81}}}"></div>`;

  const weaponPageNested = `<div id="app" data-page="{&quot;component&quot;:&quot;Public/Items/Weapons/Show&quot;,&quot;props&quot;:{&quot;weapon&quot;:{&quot;id&quot;:99999,&quot;name&quot;:&quot;テスト刀剣&quot;,&quot;equip&quot;:&quot;右手 2HAND&quot;,&quot;damage&quot;:100,&quot;attackInterval&quot;:450,&quot;effectiveRange&quot;:5.5,&quot;required_skill&quot;:{&quot;name&quot;:&quot;刀剣&quot;,&quot;pivot&quot;:{&quot;value&quot;:91}}}}}"></div>`;

  const weaponPageMulti2 = `<div id="app" data-page="{&quot;component&quot;:&quot;Public/Items/Weapons/Show&quot;,&quot;props&quot;:{&quot;weapon&quot;:{&quot;id&quot;:7135,&quot;name&quot;:&quot;炎の珠&quot;,&quot;equip&quot;:&quot;右手 1HAND&quot;,&quot;damage&quot;:30,&quot;requiredSkill&quot;:&quot;こんぼう 素手&quot;,&quot;need_level&quot;:50,&quot;description&quot;:&quot;必要スキル こんぼう 50.0 素手 50.0 ダメージ: 30.0 攻撃間隔: 120 有効レンジ: 3.4&quot;}}}"></div>`;

  const weaponPageMulti3 = `<div id="app" data-page="{&quot;component&quot;:&quot;Public/Items/Weapons/Show&quot;,&quot;props&quot;:{&quot;weapon&quot;:{&quot;id&quot;:4856,&quot;name&quot;:&quot;SGK ウェポン&quot;,&quot;equip&quot;:&quot;右手 2HAND&quot;,&quot;damage&quot;:89,&quot;attack_interval&quot;:690,&quot;effective_range&quot;:7.1,&quot;requiredSkill1&quot;:&quot;刀剣&quot;,&quot;need_level1&quot;:100,&quot;requiredSkill2&quot;:&quot;素手&quot;,&quot;need_level2&quot;:100,&quot;requiredSkill3&quot;:&quot;槍&quot;,&quot;need_level3&quot;:100,&quot;description&quot;:&quot;武器カテゴリ説明にこんぼうという語が混じっても必要スキルへ混ぜない&quot;}}}"></div>`;

  const copperKnifePage = `<div id="app" data-page="{&quot;component&quot;:&quot;Public/Items/Weapons/Show&quot;,&quot;props&quot;:{&quot;weapon&quot;:{&quot;id&quot;:282,&quot;name&quot;:&quot;カッパー ナイフ&quot;,&quot;equip&quot;:&quot;右手 左手&quot;,&quot;damage&quot;:2.2,&quot;effective_range&quot;:3.6,&quot;requiredSkill&quot;:&quot;刀剣&quot;,&quot;need_level&quot;:1,&quot;type&quot;:&quot;Weapon&quot;,&quot;info&quot;:&quot;説明文にこんぼうという語が混じっても必要スキルにはしない&quot;,&quot;add_statuses&quot;:[{&quot;name&quot;:&quot;命中&quot;,&quot;pivot&quot;:{&quot;value&quot;:5}}]}}}"></div>`;

  const samples = [
`ジャイアント ドラゴンフライ
装備部位
    腰（装）
必要スキル
    着こなし 1.0
アーマークラス
    0.0
付加効果
    トンボの餌
    高速で移動する巨大なトンボに捕獲された獲物 ※WarAgeでは効果がない
追加効果
        回避 +10.0
        最大重量 +30.0
        移動速度 +5.0`,
`真紅の大剣
装備部位
    背中（装）
必要スキル
    着こなし 1.0
アーマークラス
    0.0
付加効果
    気炎万丈
    火属性と攻撃力依存の物理ダメージが上昇して、スタミナの自然回復量が増加する ※WarAgeでは効果がない 
追加効果
        攻撃力 +5.0
        耐火属性 +20.0`,
`ジャイアント ドラゴンフライ 説明 人より巨大なトンボの一種 装備部位 腰（装） 必要スキル 着こなし 1.0 アーマークラス 0.0 使用可能性別 ALL 付加効果 トンボの餌 高速で移動する巨大なトンボに捕獲された獲物 ※WarAgeでは効果がない 追加効果 回避 +10.0 最大重量 +30.0 移動速度 +5.0 特殊条件`,
`<html><head><title>真紅の大剣 - 防具装飾 - Master of Epic 公式データベース</title></head><body><table><tr><th>装備部位</th><td>背中（装）</td></tr><tr><th>アーマークラス</th><td>0.0</td></tr></table><h2>付加効果</h2><p>気炎万丈</p><p>火属性と攻撃力依存の物理ダメージが上昇して、スタミナの自然回復量が増加する ※WarAgeでは効果がない</p><h2>追加効果</h2><p>攻撃力 +5.0</p><p>耐火属性 +20.0</p></body></html>`,
inertiaPage,
weaponPageDirect,
weaponPageNested,
weaponPageMulti2,
weaponPageMulti3,
copperKnifePage
  ];
  return samples.map(s => {
    const parsed = parseIdbEquipmentFromPaste(s).row;
    return {
      name: parsed.name,
      slot: parsed.slot,
      ac: parsed.extraAC,
      buffName: parsed.equipBuffName,
      buffNote: parsed.equipBuffNote,
      attack: parsed.attack,
      avoid: parsed.extraAvoid,
      maxWeight: parsed.extraMaxWeight,
      speed: parsed.speed,
      fireRes: parsed.extraFireRes,
      weaponDamage: parsed.weaponDamage,
      weaponAttackInterval: parsed.weaponAttackInterval,
      weaponRange: parsed.weaponRange,
      weaponReq: parsed.weaponReq
    };
  });
}

function previewIdbEquipmentImport() {
  const el = byId("idbImportPreview");
  try {
    const parsed = parseIdbEquipmentFromPaste(byId("idbPasteBox")?.value || "");
    if (byId("idbParsedName")) byId("idbParsedName").value = parsed.row.name || "";
    if (byId("idbParsedSlot")) byId("idbParsedSlot").value = parsed.row.slot || "";
    if (el) {
      el.classList.remove("bad");
      el.innerHTML = idbEquipmentPreviewHtml(parsed);
    }
    return parsed;
  } catch (e) {
    if (el) {
      el.classList.add("bad");
      el.textContent = "解析に失敗: " + e.message;
    }
    return null;
  }
}

function addIdbEquipmentCandidate() {
  const parsedRaw = parseIdbEquipmentFromPaste(byId("idbPasteBox")?.value || "");
  const parsed = idbApplyManualCorrections(parsedRaw);
  if (!parsed) return;
  state.equipment = normalizeEquipmentRows(state.equipment);
  const row = parsed.row;
  row.enabled = false;
  row.importSource = "officialDB";
  row.importedFromIdb = true;
  const url = (byId("idbItemUrl")?.value || "").trim();
  if (url) row.importUrl = url;
  state.equipment.push(normalizeEquipmentCandidate(row));
  renderEquipmentTable();
  renderTagLinkSummary();
  renderShowcaseTab();
  calc();

  const el = byId("idbImportPreview");
  if (el) {
    el.classList.remove("bad");
    el.innerHTML = idbEquipmentPreviewHtml(parsed) + `<div class="okText">装備候補へ追加しました。使用する場合は該当部位の候補で「使用」をONにしてください。装備Buffの実効果値は必要に応じて手入力してください。</div>`;
  }
}



function clearAllEquipmentUsage() {
  state.equipment = normalizeEquipmentRows(state.equipment).map(row => ({...row, enabled:false}));
  renderEquipmentTable();
  renderTagLinkSummary();
  renderShowcaseTab();
  calc();
}

function clearAllBuffUsage() {
  state.composite = normalizeCompositeRows(state.composite).map(row => ({...row, enabled:false}));
  ["pct", "flat", "conv", "dmg", "special", "post", "other"].forEach(key => {
    state[key] = Array.isArray(state[key]) ? state[key].map(row => ({...row, enabled:false})) : [];
  });
  renderCompositeTable();
  renderNumericTable("post");
  renderOtherTable();
  renderTagLinkSummary();
  renderShowcaseTab();
  calc();
}

function renderAll() {
  renderWeaponReqTable();
  renderSkillSim();
  renderCompositeTable();
  renderEquipmentTable();
  renderNumericTable("post");
  renderOtherTable();
  renderTagLinkSummary();
  renderShowcaseTab();
}

/* 種族プルダウンから攻撃力係数hidden値を同期する。 */
function syncRaceCoeff() {
  const coeff = RACE_COEFFS[byId("raceSelect").value] ?? 0.20;
  byId("raceCoeff").value = coeff.toFixed(3);
  return coeff;
}
/* 精神力と種族から基礎魔力を自動計算し、hiddenのmagicへ同期する。 */
function syncBaseMagic() {
  const race = byId("raceSelect").value;
  const spirit = parseFloat(byId("spirit").value) || 0;
  const coeff = RACE_MAGIC_COEFFS[race] ?? 1.00;
  const baseMagic = spirit * coeff;
  byId("magic").value = baseMagic.toFixed(3);
  return baseMagic;
}
/* 攻撃種別に応じてヘビクラ欄やクリティカル欄の表示を切り替える。 */
function syncAttackTypeUI() {
  const type = byId("attackType").value;
  const isAttack = type === "attack";
  const isHeavy = type === "heavy";
  byId("heavyFields").style.display = isHeavy ? "" : "none";
  byId("critFields").classList.toggle("muted", !isAttack);

  if (isAttack) {
    byId("techMultiplier").value = "1.0000";
    byId("techMultiplier").readOnly = true;
    byId("attackHint").textContent = "アタック: 倍率1.00。クリティカルを入れる場合はONにしてください。ON時は1.5倍固定です。";
  } else if (isHeavy) {
    byId("techMultiplier").readOnly = true;
    byId("allowCrit").checked = false;
    byId("attackHint").textContent = "ヘビー クラッシュ: クリティカルなし。上書き倍率が0なら武器重量と選択式から自動計算します。";
  } else {
    byId("techMultiplier").readOnly = false;
    byId("allowCrit").checked = false;
    byId("attackHint").textContent = "その他テクニック: 倍率を手入力。クリティカルは無効として計算します。";
  }
}

/* 変換計算用に、statsから指定ソースの値を取り出す。 */
function statValue(stats, source) {
  if (source === "str") return stats.str;
  if (source === "magic") return stats.magic;
  if (source === "speed") return stats.speed;
  if (source === "drunk") return stats.drunk;
  return 0;
}
/* 魔力%/速度%など、攻撃力以外の割合ステータスBuffを順番に適用する。 */
function applyPercentStats(st, baseStats) {
  const stats = {...baseStats};
  const steps = [];
  (st.pct || []).filter(r => r.enabled && r.target !== "attack").forEach(r => {
    const key = r.target;
    const before = stats[key] ?? 0;
    const add = before * ((+r.percent || 0) / 100);
    stats[key] = before + add;
    steps.push({name:r.name, key, before, add, after:stats[key], percent:+r.percent || 0});
  });
  return {stats, steps};
}
/* 魔力/速度/酩酊度などから攻撃力へ変換する。現在は全て上限外加算扱い。 */
function calcConversions(st, stats) {
  let capped = 0;
  let uncapped = 0;
  const steps = [];
  (st.conv || []).filter(r => r.enabled).forEach(r => {
    const base = statValue(stats, r.source);
    const baseOffset = +r.baseOffset || 0;
    const adjustedBase = base + baseOffset;
    const ratePart = adjustedBase * ((+r.rate || 0) / 100);
    const offset = +r.offset || 0; // 旧版互換用。通常は0。
    const add = ratePart + offset;
    // ステータス変換系は攻撃力加算上限を突破するため、全て上限外へ入れる。
    uncapped += add;
    steps.push({name:r.name, source:r.source, base, baseOffset, adjustedBase, rate:+r.rate || 0, offset, ratePart, add, capped:false});
  });
  return {capped, uncapped, steps};
}
/* 攻撃力%Buffを順番に適用し、増加分を攻撃力加算上限対象として返す。 */
function calcPctAttack(st, baseAtk) {
  let atk = baseAtk;
  let added = 0;
  const steps = [];
  (st.pct || []).filter(r => r.enabled && r.target === "attack").forEach(r => {
    const before = atk;
    const add = before * ((+r.percent || 0) / 100);
    atk = before + add;
    added += add;
    steps.push({name:r.name, before, add, after:atk, percent:+r.percent || 0});
  });
  return {added, after:atk, steps};
}
/* 攻撃種別からテク倍率を決める。ヘビクラは重量式または手動上書きを使う。 */
function attackMultiplierFromInputs(inputs) {
  if (inputs.attackType === "attack") return 1.0;
  if (inputs.attackType === "heavy") {
    const manual = parseFloat(inputs.heavyManualMultiplier) || 0;
    if (manual > 0) return manual;
    const weight = parseFloat(inputs.weaponWeight) || 0;
    return inputs.heavyFormula === "new"
      ? (weight + 31.2) * 0.029
      : 0.90 + 0.029 * weight;
  }
  return parseFloat(inputs.techMultiplier) || 0;
}
/**
 * このツールの計算本体。
 *
 * 入力:
 *   st     : Buff/装備/使用条件などのstate
 *   inputs : 基本設定フォームの値
 *
 * 出力:
 *   攻撃力、魔力、ダメージ、内訳、バフ枠、分析用の中間値。
 *
 * 注意:
 *   画面更新はここでは行わない。純粋な計算関数として扱うと保守しやすい。
 */
/* 計算本体 computeMetrics とバフ枠集計は src/calc/core.js へ分離しました。
 * main.js側にはUI更新と保存/読込を残しています。
 */

/* サマリーのバフ枠バー、内訳、ツールチップ、警告を更新する。 */
function updateSlotUI(metrics) {
  const {total, groups, details} = metrics.slots;
  byId("slotCount").textContent = `${total} / 24`;
  const p = Math.min(100, total / 24 * 100);
  const fill = byId("slotFill");
  fill.style.width = `${p}%`;
  fill.style.color = total > 24 ? "#c0392b" : total >= 22 ? "#a66a00" : "#198754";
  byId("slotBreakdown").textContent = groups.map(([name,n]) => `${name}:${n}`).join(" / ");

  const activeDetails = (details || []).filter(([,items]) => items.length);
  const tooltip = byId("slotTooltip");
  if (activeDetails.length) {
    const listedTotal = activeDetails.reduce((s, [, items]) => s + items.length, 0);
    tooltip.innerHTML = [
      `<div class="slotTooltipTitle">使用中のバフ枠: ${total} / 24</div>`,
      `<div class="slotTooltipMeta">内訳リスト表示: ${listedTotal}件。多い場合はこの枠内をスクロールできます。</div>`,
      ...activeDetails.map(([group, items]) => {
        const lis = items.map(x => `<li>${escapeHtml(x)}</li>`).join("");
        return `<div class="slotTooltipGroup"><b>${escapeHtml(group)}: ${items.length}</b><ul>${lis}</ul></div>`;
      })
    ].join("");
  } else {
    tooltip.innerHTML = `<div class="slotTooltipTitle">使用中のバフ枠: 0 / 24</div><div class="small">枠を使っているバフはありません。</div>`;
  }

  byId("slotWarning").innerHTML = total > 24
    ? `<div class="bad">24枠を ${total - 24} 枠超過しています。</div>`
    : total >= 22
      ? `<div class="warn">残り ${24 - total} 枠です。かなり詰まっています。</div>`
      : `<div class="ok">残り ${24 - total} 枠あります。</div>`;
}

/* 装備補正合計の表示を更新する。 */
function updateEquipmentSummary(m) {
  const lines = [
    `攻撃力: ${m.equipmentRaw.attack.toFixed(3)}`,
    `魔力: ${m.equipmentRaw.magic.toFixed(3)}`,
    `速度: ${m.equipmentRaw.speed.toFixed(3)}`
  ];
  const extra = extraStatsSummary(m.extraStats || {});
  if (extra.length) {
    lines.push(`<b>追加ステータス</b>`);
    extra.forEach(x => lines.push(x));
  }
  byId("equipmentSummary").innerHTML = lines.map(x => `<div>${x}</div>`).join("");
}

/* 使用条件補正の説明表示を更新する。 */
function updateWeaponSkillModHint(m) {
  const el = byId("weaponSkillModHint");
  if (!el) return;
  const limiting = m.skillModInfo.limiting;
  const detail = (m.skillModInfo.evaluated || []).map(r => {
    const gate = r.meetsGate ? "" : " / 8割未満";
    return `${escapeHtml(r.name)}: ${r.current.toFixed(1)}/${r.required.toFixed(1)}${r.denom !== r.required ? `（判定分母 ${r.denom.toFixed(1)}）` : ""}=${(r.ratio * 100).toFixed(1)}%${gate}`;
  }).join(" / ");
  const totalLine = m.skillModInfo.totalRequired
    ? `全体達成率: ${m.skillModInfo.totalCurrent.toFixed(1)}/${m.skillModInfo.totalRequired.toFixed(1)} = ${(m.skillModInfo.overallRatio * 100).toFixed(1)}%`
    : "";
  el.innerHTML = limiting
    ? `武器性能発揮率: <b>${(m.skillModInfo.mod * 100).toFixed(1)}%</b>（${m.skillModInfo.gateFailed ? "8割未満あり" : "全体達成率"}）<br>${detail}${totalLine ? "<br>" + totalLine : ""}`
    : `武器性能発揮率: <b>100.0%</b>`;
}

/* 予想攻撃力/予想魔力/攻撃力上限状態の表示を更新する。 */
function updatePredictedAtkUI(m) {
  byId("predictedAtk").textContent = `${m.atk.toFixed(3)}`;
  byId("predictedMagic").textContent = `${m.stats.magic.toFixed(3)}`;

  const magicPctText = m.pctStats.steps
    .filter(s => s.key === "magic")
    .map(s => `${s.name}+${s.percent}%: ${s.before.toFixed(3)} → ${s.after.toFixed(3)}`)
    .join(" / ");
  const magicLines = [
    `基礎魔力: 精神力 ${m.spirit.toFixed(3)} × 種族魔力係数 ${m.magicCoeff.toFixed(2)} = ${m.baseMagicFromSpirit.toFixed(3)}`,
    `実数加算: +${m.flatStatRaw.magic.toFixed(3)}`,
    magicPctText ? `魔力%Buff: ${magicPctText}` : `魔力%Buff: なし`
  ];
  byId("predictedMagicBreakdown").innerHTML = magicLines.map(x => `<div>${x}</div>`).join("");

  const overAmount = m.atkBuffRaw - m.atkCap;
  const reachedCap = m.atkCap > 0 && overAmount >= -0.000001;
  const over = overAmount > 0 ? ` / 上限超過 ${overAmount.toFixed(3)}` : "";

  if (m.atkCap <= 0) {
    byId("attackCapStatus").innerHTML = `<div class="small">攻撃力加算上限: 無効</div>`;
  } else if (reachedCap) {
    const cut = Math.max(0, overAmount);
    byId("attackCapStatus").innerHTML =
      `<div class="warn"><b>攻撃力加算上限に到達</b><br>上限対象 上限対象 raw ${m.atkBuffRaw.toFixed(3)} / 上限 ${m.atkCap.toFixed(3)}${cut > 0 ? ` / 切り捨て ${cut.toFixed(3)}` : ""}</div>`;
  } else {
    byId("attackCapStatus").innerHTML =
      `<div class="ok">攻撃力加算上限まであと ${(m.atkCap - m.atkBuffRaw).toFixed(3)} / 上限対象 raw ${m.atkBuffRaw.toFixed(3)} / 上限 ${m.atkCap.toFixed(3)}</div>`;
  }

  let lines;
  if (m.atkPctMode === "afterAdds") {
    lines = [
      `基礎系: 種族 ${m.racialAtk.toFixed(3)} + 武器 ${m.weaponAtk.toFixed(3)}（使用条件補正 ${(m.skillModInfo.mod * 100).toFixed(1)}%） = ${m.baseNaturalAtk.toFixed(3)}`,
      `変換上限外: +${m.conversionAtk.toFixed(3)}`,
      `上限対象: 攻撃力実数加算 ${m.flatAtkRaw.toFixed(3)} + 攻撃力%増分 ${m.pctAtkCalc.added.toFixed(3)} = raw ${m.atkBuffRaw.toFixed(3)}`,
      `最終上限: 基礎 ${m.baseNaturalAtk.toFixed(3)} + 変換 ${m.conversionAtk.toFixed(3)} + min(${m.atkBuffRaw.toFixed(3)}, ${m.atkCap.toFixed(3)}) = ${m.atk.toFixed(3)}${over}`,
      `攻撃力×0.8: ${(m.atk * 0.8).toFixed(3)}`
    ];
  } else {
    lines = [
      `基礎系: 種族 ${m.racialAtk.toFixed(3)} + 武器 ${m.weaponAtk.toFixed(3)}（使用条件補正 ${(m.skillModInfo.mod * 100).toFixed(1)}%） = ${m.baseNaturalAtk.toFixed(3)}`,
      `変換上限外: +${m.conversionAtk.toFixed(3)}`,
      `上限対象: 攻撃力実数加算 ${m.flatAtkRaw.toFixed(3)} + 攻撃力% ${m.pctAtkCalc.added.toFixed(3)} = raw ${m.atkBuffRaw.toFixed(3)} / 適用 ${m.atkBuffCapped.toFixed(3)}${over}`,
      `攻撃力×0.8: ${(m.atk * 0.8).toFixed(3)}`
    ];
  }
  byId("predictedAtkBreakdown").innerHTML = lines.map(x => `<div>${x}</div>`).join("");
}

/**
 * 画面全体の再計算エントリーポイント。
 * 入力イベントのたびに呼ばれ、computeMetrics()→各UI更新→localStorage保存まで行う。
 */
function calc() {
  syncSkillSimToCalcInputs(false, false);
  syncSelectedWeaponToHiddenInputs();
  syncRaceCoeff();
  syncBaseMagic();
  syncAttackTypeUI();

  const inputs = collectInputs();
  // sync readonly and auto fields into inputs
  inputs.raceCoeff = byId("raceCoeff").value;
  inputs.techMultiplier = byId("techMultiplier").value;
  const m = computeMetrics(state, inputs);

  if (inputs.attackType === "attack") byId("techMultiplier").value = "1.0000";
  if (inputs.attackType === "heavy") byId("techMultiplier").value = m.attackMultiplier.toFixed(4);

  byId("finalDamage").textContent = `${Math.floor(m.finalDamage).toLocaleString()} ダメージ前後`;
  if (byId("damageAudit")) byId("damageAudit").innerHTML = damageAuditHtml(m, inputs);
  updateSlotUI(m);
  updateEquipmentSummary(m);
  updateWeaponReqAutoCurrentDisplays();
  updateSelectedWeaponCalcSummary(m);
  updateWeaponSkillModHint(m);
  updatePredictedAtkUI(m);
  renderShowcaseTab(m);

  const pctStatLine = m.pctStats.steps.length
    ? `<p>割合ステータスBuff: ${m.pctStats.steps.map(s => `${s.name}+${s.percent}% → ${labelOf(s.key)} ${s.after.toFixed(3)}`).join(" / ")}</p>`
    : "";
  const convLine = m.conv.steps.length
    ? `<p>ステータス変換: ${m.conv.steps.map(s => `${s.name}: (${labelOf(s.source)} ${s.base.toFixed(3)}${s.baseOffset ? ` + 参照補正 ${s.baseOffset.toFixed(3)}` : ""}) × ${s.rate}%${s.offset ? ` + 固定補正 ${s.offset.toFixed(3)}` : ""} = ${s.add.toFixed(3)}（上限外）`).join(" / ")}</p>`
    : "";
  const atkPctLine = m.pctAtkCalc.steps.length
    ? `<p>攻撃力%Buff増分: ${m.pctAtkCalc.steps.map(s => `${s.name}+${s.percent}% = ${s.add.toFixed(3)}`).join(" / ")}</p>`
    : "";

  const lines = [];
  lines.push(`<p>実効ステータス: 筋力 ${m.stats.str.toFixed(3)} / 魔力 ${m.stats.magic.toFixed(3)} / 速度 ${m.stats.speed.toFixed(3)} / 酩酊度 ${m.stats.drunk.toFixed(3)}</p>`);
  lines.push(`<p>基礎魔力: 精神力 ${m.spirit.toFixed(3)} × 種族魔力係数 ${(RACE_MAGIC_COEFFS[inputs.raceSelect] ?? 1).toFixed(2)} = ${m.baseMagicFromSpirit.toFixed(3)}</p>`);
  if (m.equipmentRaw.attack || m.equipmentRaw.magic || m.equipmentRaw.speed) {
    lines.push(`<p>武器・防具・装飾補正: 攻撃力 ${m.equipmentRaw.attack.toFixed(3)} / 魔力 ${m.equipmentRaw.magic.toFixed(3)} / 速度 ${m.equipmentRaw.speed.toFixed(3)}</p>`);
  }
  const extraLine = extraStatsSummary(m.extraStats || {}).join(" / ");
  if (extraLine) lines.push(`<p>構成追加ステータス: ${escapeHtml(extraLine)}</p>`);
  if (m.selectedWeapon) {
    const slotName = (m.selectedWeapon.slot || "武器").replace(/^武器: /, "");
    lines.push(`<p>計算武器: ${escapeHtml(slotName)} ${escapeHtml(m.selectedWeapon.name || "名称未入力")} / 武器ダメージ ${m.weaponDamage.toFixed(3)} / 武器重量 ${m.weaponWeight.toFixed(3)}</p>`);
  }
  if (m.skillModInfo && m.skillModInfo.evaluated && m.skillModInfo.evaluated.length) {
    const reqText = m.skillModInfo.evaluated.map(r => `${escapeHtml(r.name)} ${r.current.toFixed(1)}/${r.required.toFixed(1)}${r.denom !== r.required ? `（判定分母 ${r.denom.toFixed(1)}）` : ""}=${(r.ratio * 100).toFixed(1)}%${r.meetsGate ? "" : " / 8割未満"}`).join(" / ");
    const totalReqText = m.skillModInfo.totalRequired
      ? ` / 全体 ${m.skillModInfo.totalCurrent.toFixed(1)}/${m.skillModInfo.totalRequired.toFixed(1)}=${(m.skillModInfo.overallRatio * 100).toFixed(1)}%`
      : "";
    lines.push(`<p>武器使用条件: ${reqText}${totalReqText} → 武器性能発揮率 <b>${(m.skillModInfo.mod * 100).toFixed(1)}%</b></p>`);
  }
  if (m.flatStatRaw.magic) lines.push(`<p>魔力実数加算合計: +${m.flatStatRaw.magic.toFixed(3)}（武器・防具・装飾込み。魔力%Buff・魔力変換の前に加算）</p>`);
  if (m.flatStatRaw.speed) lines.push(`<p>速度実数加算合計: +${m.flatStatRaw.speed.toFixed(3)}（武器・防具・装飾込み。速度%Buff・速度変換の前に加算）</p>`);
  if (pctStatLine) lines.push(pctStatLine);
  if (convLine) lines.push(convLine);
  if (m.atkPctMode === "afterAdds") {
    lines.push(`<p>攻撃力: <b>${m.atk.toFixed(3)}</b> = 基礎攻撃力 ${m.baseNaturalAtk.toFixed(3)} + 変換上限外 ${m.conversionAtk.toFixed(3)} + min(上限対象 raw ${m.atkBuffRaw.toFixed(3)}, 上限 ${m.atkCap.toFixed(3)})。攻撃力%Buffは加算後攻撃力 ${m.atkBeforePct.toFixed(3)} に順次乗算してから上限判定。</p>`);
  } else {
    lines.push(`<p>攻撃力: <b>${m.atk.toFixed(3)}</b> = 基礎攻撃力 ${m.baseNaturalAtk.toFixed(3)} + 変換上限外 ${m.conversionAtk.toFixed(3)} + min(上限対象 raw ${m.atkBuffRaw.toFixed(3)}, 上限 ${m.atkCap.toFixed(3)})</p>`);
  }
  if (atkPctLine) lines.push(atkPctLine);
  lines.push(`<p>基礎: 攻撃力×0.8 = <b>${m.baseNoTech.toFixed(3)}</b></p>`);
  lines.push(`<p>攻撃/テク倍率: <b>${m.attackMultiplier.toFixed(4)}</b> / 与ダメ倍率: <b>${m.dmgMultiplier.toFixed(3)}</b> / 特攻倍率: <b>${m.specialMultiplier.toFixed(3)}</b> / 防御係数: <b>${m.defenseFactor.toFixed(6)}</b> / クリ平均: <b>${m.critAvg.toFixed(3)}</b> / 外枠: <b>${m.postMultiplier.toFixed(3)}</b></p>`);
  lines.push(`<p>計算式: 攻撃力×0.8×攻撃/テク倍率×与ダメ倍率×特攻倍率×防御係数×クリ平均×外枠</p>`);
  if ((parseFloat(inputs.finalCap) || 0) > 0 && m.rawDamage > (parseFloat(inputs.finalCap) || 0)) {
    lines.push(`<div class="warn">最終表示上限 ${Number(inputs.finalCap).toLocaleString()} により丸めています。丸め前: ${Math.floor(m.rawDamage).toLocaleString()}</div>`);
  } else {
    lines.push(`<div class="ok">丸め前ダメージをそのまま表示しています。</div>`);
  }
  byId("breakdown").innerHTML = lines.join("");

  localStorage.setItem("moeDamageSimShortShareUrlShowcase", JSON.stringify(collectConfig()));
  renderCompareResult();
  renderActualDiff();
  renderRaceTable();
  renderValueTable();
  renderTagLinkSummary();
}

/* 分析用: 現在構成をA/B比較スナップショットへ保存する。 */
function saveSnapshot(which) {
  snapshots[which] = collectConfig();
  const memoEl = byId("snapshotMemo" + which);
  snapshots[which].memo = memoEl ? memoEl.value : "";
  localStorage.setItem("moeDamageSnapshot" + which, JSON.stringify(snapshots[which]));
  renderSnapshotLabels();
  renderCompareResult();
}
/* 分析用: A/Bスナップショットを現在構成へ読み込む。 */
function loadSnapshot(which) {
  if (!snapshots[which]) {
    alert(which + " が未保存です。");
    return;
  }
  applyConfig(snapshots[which]);
}
/* A/Bスナップショットの保存状態ラベルを更新する。 */
function renderSnapshotLabels() {
  ["A","B"].forEach(which => {
    const el = byId("snapshot" + which);
    if (!snapshots[which]) {
      el.textContent = `${which}: 未保存`;
      return;
    }
    const m = computeMetrics(snapshots[which].state, snapshots[which].inputs);
    const memo = snapshots[which].memo ? `<br>メモ: ${escapeHtml(snapshots[which].memo)}` : "";
    el.innerHTML = `${which}: ダメージ ${fmt(Math.floor(m.finalDamage),0)} / 攻撃力 ${fmt(m.atk)} / 枠 ${m.slots.total}/24${memo}`;
  });
}
/* A/B比較メモを保存済みスナップショットへ反映する。 */
function updateSnapshotMemo(which) {
  const el = byId("snapshotMemo" + which);
  if (!el) return;
  if (snapshots[which]) {
    snapshots[which].memo = el.value;
    localStorage.setItem("moeDamageSnapshot" + which, JSON.stringify(snapshots[which]));
    renderSnapshotLabels();
    renderCompareResult();
  }
}

/* A/B比較表を描画する。 */
function renderCompareResult() {
  if (!snapshots.A || !snapshots.B) {
    byId("compareResult").innerHTML = "";
    return;
  }
  const a = computeMetrics(snapshots.A.state, snapshots.A.inputs);
  const b = computeMetrics(snapshots.B.state, snapshots.B.inputs);
  const damageDiff = b.finalDamage - a.finalDamage;
  const atkDiff = b.atk - a.atk;
  const slotDiff = b.slots.total - a.slots.total;
  const damagePct = a.finalDamage !== 0 ? damageDiff / a.finalDamage : NaN;
  const atkPct = a.atk !== 0 ? atkDiff / a.atk : NaN;

  byId("compareResult").innerHTML = `
    <table>
      <thead><tr><th>項目</th><th>A</th><th>B</th><th>B-A</th><th>変化率</th></tr></thead>
      <tbody>
        <tr><td>メモ</td><td>${escapeHtml(snapshots.A.memo || "")}</td><td>${escapeHtml(snapshots.B.memo || "")}</td><td>-</td><td>-</td></tr>
        <tr><td>ダメージ</td><td class="num">${fmt(Math.floor(a.finalDamage),0)}</td><td class="num">${fmt(Math.floor(b.finalDamage),0)}</td><td class="num">${fmt(Math.floor(damageDiff),0)}</td><td class="num">${pct(damagePct)}</td></tr>
        <tr><td>攻撃力</td><td class="num">${fmt(a.atk)}</td><td class="num">${fmt(b.atk)}</td><td class="num">${fmt(atkDiff)}</td><td class="num">${pct(atkPct)}</td></tr>
        <tr><td>バフ枠</td><td class="num">${a.slots.total}/24</td><td class="num">${b.slots.total}/24</td><td class="num">${slotDiff}</td><td class="num">-</td></tr>
        <tr><td>与ダメ倍率</td><td class="num">${fmt(a.dmgMultiplier)}</td><td class="num">${fmt(b.dmgMultiplier)}</td><td class="num">${fmt(b.dmgMultiplier-a.dmgMultiplier)}</td><td class="num">-</td></tr>
        <tr><td>特攻倍率</td><td class="num">${fmt(a.specialMultiplier)}</td><td class="num">${fmt(b.specialMultiplier)}</td><td class="num">${fmt(b.specialMultiplier-a.specialMultiplier)}</td><td class="num">-</td></tr>
        <tr><td>外枠倍率</td><td class="num">${fmt(a.postMultiplier)}</td><td class="num">${fmt(b.postMultiplier)}</td><td class="num">${fmt(b.postMultiplier-a.postMultiplier)}</td><td class="num">-</td></tr>
      </tbody>
    </table>`;
}
/* 価値表示用: 一時的な効果を追加したstateでメトリクスを計算する。 */
function metricWithTempEffect(baseState, inputs, modifier) {
  // 価値表示は「現在のstate/inputs」を基準にした差分を見たいので、
  // 各行の計算でcollectConfig()を呼び直さず、同じ基準値から派生させる。
  const st2 = clone(baseState);
  modifier(st2);
  return computeMetrics(st2, inputs);
}
/* 攻撃力+1、魔力+1、与ダメ+1%などの価値表示テーブルを描画する。 */
function renderValueTable() {
  // ボタンから単独更新された場合でも、種族係数と基礎魔力を最新化してから読む。
  syncRaceCoeff();
  syncBaseMagic();
  syncAttackTypeUI();

  const inputs = collectInputs();
  inputs.raceCoeff = byId("raceCoeff").value;
  inputs.techMultiplier = byId("techMultiplier").value;

  const baseState = clone(state);
  const base = computeMetrics(baseState, inputs);
  const tests = [
    {
      name: "攻撃力 +1",
      note: "攻撃力実数加算。上限対象",
      apply: st => {
        st.flat = normalizeFlatRows(st);
        st.flat.push({enabled:true, slot:false, name:"価値計算 攻撃力+1", target:"attack", value:1, note:""});
      }
    },
    {
      name: "魔力 +1",
      note: "魔力加算。魔力%・魔力変換前",
      apply: st => {
        st.flat = normalizeFlatRows(st);
        st.flat.push({enabled:true, slot:false, name:"価値計算 魔力+1", target:"magic", value:1, note:""});
      }
    },
    {
      name: "速度 +1",
      note: "速度加算。速度変換前",
      apply: st => {
        st.flat = normalizeFlatRows(st);
        st.flat.push({enabled:true, slot:false, name:"価値計算 速度+1", target:"speed", value:1, note:""});
      }
    },
    {
      name: "攻撃力% +1",
      note: "攻撃力%Buffを+1%",
      apply: st => {
        st.pct = Array.isArray(st.pct) ? st.pct : [];
        st.pct.push({enabled:true, slot:false, name:"価値計算 攻撃力%+1", target:"attack", percent:1, note:""});
      }
    },
    {
      name: "魔力% +1",
      note: "魔力%Buffを+1%",
      apply: st => {
        st.pct = Array.isArray(st.pct) ? st.pct : [];
        st.pct.push({enabled:true, slot:false, name:"価値計算 魔力%+1", target:"magic", percent:1, note:""});
      }
    },
    {
      name: "与ダメ +1%",
      note: "与ダメ増加 +1%",
      apply: st => {
        st.dmg = Array.isArray(st.dmg) ? st.dmg : [];
        st.dmg.push({enabled:true, slot:false, name:"価値計算 与ダメ+1%", value:0.01, category:"価値計算", note:""});
      }
    }
  ];

  const body = tests.map(t => {
    const m = metricWithTempEffect(baseState, inputs, t.apply);
    const dmgDelta = m.finalDamage - base.finalDamage;
    const atkDelta = m.atk - base.atk;
    const magicDelta = m.stats.magic - base.stats.magic;
    return `<tr>
      <td>${escapeHtml(t.name)}</td>
      <td class="num">${fmt(dmgDelta, 4)}</td>
      <td class="num">${fmt(atkDelta, 4)}</td>
      <td class="num">${fmt(magicDelta, 4)}</td>
      <td class="num">${base.finalDamage ? pct(dmgDelta / base.finalDamage) : "-"}</td>
      <td class="num">${fmt(m.finalDamage, 4)}</td>
      <td>${escapeHtml(t.note)}</td>
    </tr>`;
  }).join("");

  byId("valueTable").innerHTML = `
    <div class="small valueBaseLine">
      基準: ダメージ ${fmt(base.finalDamage, 4)} / 攻撃力 ${fmt(base.atk, 4)} / 魔力 ${fmt(base.stats.magic, 4)} / 与ダメ倍率 ${fmt(base.dmgMultiplier, 4)}
    </div>
    <table>
      <thead><tr><th>追加するもの</th><th>ダメージ増加</th><th>攻撃力増加</th><th>魔力増加</th><th>ダメージ増加率</th><th>追加後ダメージ</th><th>メモ</th></tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

/* 使用中の行を1つずつOFFにして、ダメージ寄与率と1枠効率を出す。 */
function rowHasTag(row, tag) {
  const key = String(tag || "").toLowerCase();
  return splitTags(row?.tags).some(t => t.toLowerCase() === key);
}

function contributionSlotForRow(key, row) {
  if (key === "other") return row.enabled ? 1 : 0;
  if (key === "equipment") return 0;
  return row.slot ? 1 : 0;
}

function contributionRowsForState(st) {
  const groups = [
    ["装備外Buff", "composite"],
    ["割合", "pct"],
    ["防具装飾", "equipment"],
    ["実数", "flat"],
    ["変換", "conv"],
    ["与ダメ", "dmg"],
    ["特攻", "special"],
    ["外枠", "post"],
    ["その他", "other"]
  ];
  const rows = [];
  groups.forEach(([label, key]) => {
    const sourceRows = key === "equipment"
      ? normalizeEquipmentRows(st.equipment)
      : key === "flat"
        ? normalizeFlatRows(st)
        : (st[key] || []);
    sourceRows.forEach((row, idx) => {
      if (row.enabled === false) return;
      if (key === "equipment" && !(+row.attack || +row.magic || +row.speed || +row.delay)) return;
      if (key === "composite" && !compositeHasEffect(row)) return;
      rows.push({label, key, row, idx});
    });
  });
  return rows;
}

function disableContributionRow(st, key, idx) {
  if (key === "equipment") {
    st.equipment = normalizeEquipmentRows(st.equipment);
  }
  if (key === "flat") {
    st.flat = normalizeFlatRows(st);
  }
  if (st[key] && st[key][idx]) st[key][idx].enabled = false;
}

function disableRowsByTag(st, tag) {
  contributionRowsForState(st).forEach(item => {
    if (rowHasTag(item.row, tag)) disableContributionRow(st, item.key, item.idx);
  });
}

function renderContributionTable() {
  const baseInputs = collectInputs();
  const base = computeMetrics(state, baseInputs);
  const rows = [];
  const tagged = new Map();

  contributionRowsForState(state).forEach(({label, key, row, idx}) => {
    const st2 = clone(state);
    disableContributionRow(st2, key, idx);
    const m2 = computeMetrics(st2, baseInputs);
    const dmgLoss = base.finalDamage - m2.finalDamage;
    const atkLoss = base.atk - m2.atk;
    const slotCount = contributionSlotForRow(key, row);
    const tags = splitTags(row.tags);
    const rowName = row.name || "(名称なし)";

    rows.push({
      group: label,
      key,
      idx,
      name: rowName,
      tags,
      dmgLoss,
      pctLoss: base.finalDamage ? dmgLoss / base.finalDamage : 0,
      atkLoss,
      slot: slotCount,
      slotEff: slotCount ? dmgLoss / slotCount : NaN
    });

    tags.forEach(tag => {
      if (!tagged.has(tag)) tagged.set(tag, {items: [], slots: 0});
      tagged.get(tag).items.push({group: label, name: rowName});
      tagged.get(tag).slots += slotCount;
    });
  });

  const taggedRows = Array.from(tagged.entries()).map(([tag, info]) => {
    const st2 = clone(state);
    disableRowsByTag(st2, tag);
    const m2 = computeMetrics(st2, baseInputs);
    const dmgLoss = base.finalDamage - m2.finalDamage;
    const atkLoss = base.atk - m2.atk;
    const itemText = info.items.map(x => `${x.group}: ${x.name}`).join(" / ");
    return {
      kind: "tag",
      labelHtml: tagPillHtml(tag),
      itemText,
      slots: info.slots,
      dmgLoss,
      pctLoss: base.finalDamage ? dmgLoss / base.finalDamage : 0,
      atkLoss,
      slotEff: info.slots ? dmgLoss / info.slots : NaN
    };
  });

  // グループなし項目は、競合グループ別寄与率の表に「単体」として出す。
  // これで、個別行テーブルを閉じたままでも全項目の寄与を見渡せる。
  const untaggedRows = rows
    .filter(r => !r.tags.length)
    .map(r => ({
      kind: "single",
      labelHtml: `<span class="tagPill tagNoTag">グループなし</span>`,
      itemText: `${r.group}: ${r.name}`,
      slots: r.slot,
      dmgLoss: r.dmgLoss,
      pctLoss: r.pctLoss,
      atkLoss: r.atkLoss,
      slotEff: r.slot ? r.dmgLoss / r.slot : NaN
    }));

  const topRows = taggedRows.concat(untaggedRows).sort((a,b) => b.dmgLoss - a.dmgLoss);
  rows.sort((a,b) => b.dmgLoss - a.dmgLoss);

  const topBody = topRows.map(r => `
    <tr class="${r.kind === "single" ? "contributionSingleRow" : ""}">
      <td>${r.labelHtml}</td>
      <td>${escapeHtml(r.itemText)}</td>
      <td class="num">${fmt(Math.floor(r.dmgLoss),0)}</td>
      <td class="num">${pct(r.pctLoss)}</td>
      <td class="num">${fmt(r.atkLoss)}</td>
      <td class="num">${r.slots}</td>
      <td class="num">${r.slots ? fmt(Math.floor(r.slotEff),0) : "-"}</td>
    </tr>`).join("");

  const body = rows.map(r => `
    <tr>
      <td>${r.group}</td>
      <td>${escapeHtml(r.name)}</td>
      <td>${r.tags.length ? r.tags.map(tagPillHtml).join("") : `<span class="tagPill tagNoTag">グループなし</span>`}</td>
      <td class="num">${fmt(Math.floor(r.dmgLoss),0)}</td>
      <td class="num">${pct(r.pctLoss)}</td>
      <td class="num">${fmt(r.atkLoss)}</td>
      <td class="num">${r.slot}</td>
      <td class="num">${r.slot ? fmt(Math.floor(r.slotEff),0) : "-"}</td>
    </tr>`).join("");

  const topTable = topRows.length
    ? `<h4>競合グループ別寄与率</h4>
      <p class="small">同じ競合グループが付いた装備/BuffはまとめてOFF、タグがない項目は単体でOFFにした場合の低下量です。</p>
      <table>
        <thead><tr><th>競合グループ</th><th>対象</th><th>外した時のダメージ低下</th><th>低下率</th><th>攻撃力低下</th><th>枠</th><th>1枠効率</th></tr></thead>
        <tbody>${topBody}</tbody>
      </table>`
    : `<h4>競合グループ別寄与率</h4><p class="small">使用中の項目がありません。</p>`;

  const individualTable = rows.length
    ? `<details class="contributionDetails">
        <summary>個別行の寄与率</summary>
        <p class="small">各行を1つずつOFFにした場合の詳細です。通常は上の競合グループ別寄与率だけ見ればOKです。</p>
        <table>
          <thead><tr><th>分類</th><th>名称</th><th>競合グループ</th><th>外した時のダメージ低下</th><th>低下率</th><th>攻撃力低下</th><th>枠</th><th>1枠効率</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
      </details>`
    : `<details class="contributionDetails"><summary>個別行の寄与率</summary><p class="small">使用中の項目がありません。</p></details>`;

  byId("contributionTable").innerHTML = topTable + individualTable;
}
/* 実測逆算から得たヘビクラ倍率を入力欄へ反映する。 */
function setHeavyManualMultiplier(value) {
  const el = byId("heavyManualMultiplier");
  if (!el) return;
  el.value = Number(value).toFixed(4);
  calc();
}
/* 指定攻撃力でのAC防御係数を計算する。実測逆算で使用。 */
function defenseFactorForAtk(atk, inputs, m) {
  const ac = parseFloat(inputs.targetAC) || 0;
  if (ac <= 0) return 1;
  const atkDefInput = atk * m.dmgMultiplier * m.specialMultiplier;
  return 1 - Math.pow(ac / (atkDefInput + ac), 1.244);
}
/* 実測ダメージに一致するために必要なヘビクラ倍率を逆算する。 */
function requiredHeavyMultiplier(actualDamage, atkForReverse, inputs, m) {
  const def = defenseFactorForAtk(atkForReverse, inputs, m);
  const denom = atkForReverse * 0.8 * m.dmgMultiplier * m.specialMultiplier * def * m.critAvg * m.postMultiplier;
  return denom ? actualDamage / denom : NaN;
}
/* 実測ダメージ/実測攻撃力と現在予測の差分・逆算値を表示する。 */
function renderActualDiff() {
  const actualDamage = parseFloat(byId("actualDamage").value) || 0;
  const actualAtk = parseFloat(byId("actualAtk").value) || 0;
  if (!actualDamage && !actualAtk) {
    byId("actualDiffResult").innerHTML = `<p class="small">実測ダメージまたはゲーム内攻撃力を入力すると差分を表示します。</p>`;
    return;
  }
  const inputs = collectInputs();
  const m = computeMetrics(state, inputs);
  const lines = [];
  if (actualDamage) {
    const diff = actualDamage - m.finalDamage;
    const ratio = m.finalDamage ? actualDamage / m.finalDamage : NaN;
    const withoutPost = m.baseNoTech * m.attackMultiplier * m.dmgMultiplier * m.specialMultiplier * m.defenseFactor * m.critAvg;
    const reqPost = withoutPost ? actualDamage / withoutPost : NaN;
    const postRatio = m.postMultiplier ? reqPost / m.postMultiplier : NaN;
    lines.push(`<tr><td>実測ダメージ</td><td class="num">${fmt(actualDamage,0)}</td><td class="num">${fmt(Math.floor(m.finalDamage),0)}</td><td class="num">${fmt(diff,0)}</td><td class="num">${pct(ratio-1)}</td></tr>`);
    lines.push(`<tr><td>逆算外枠倍率</td><td class="num">${fmt(reqPost)}</td><td class="num">現在 ${fmt(m.postMultiplier)}</td><td class="num">比率 ${fmt(postRatio)}</td><td class="num">-</td></tr>`);

    if (inputs.attackType === "heavy") {
      const reqHeavyPredAtk = requiredHeavyMultiplier(actualDamage, m.atk, inputs, m);
      const reqHeavyActualAtk = actualAtk ? requiredHeavyMultiplier(actualDamage, actualAtk, inputs, m) : NaN;
      const useReq = Number.isFinite(reqHeavyActualAtk) ? reqHeavyActualAtk : reqHeavyPredAtk;
      const button = Number.isFinite(useReq)
        ? `<button class="miniButton" onclick="setHeavyManualMultiplier(${useReq.toFixed(6)})">この倍率を適用</button>`
        : "-";
      lines.push(`<tr><td>逆算ヘビクラ倍率</td><td class="num">${fmt(useReq,4)}</td><td class="num">現在 ${fmt(m.attackMultiplier,4)}</td><td class="num">${Number.isFinite(useReq) ? fmt(useReq - m.attackMultiplier,4) : "-"}</td><td class="num">${button}</td></tr>`);
      if (actualAtk) {
        lines.push(`<tr><td>逆算ヘビクラ倍率<br><span class="small">予測攻撃力基準</span></td><td class="num">${fmt(reqHeavyPredAtk,4)}</td><td class="num">攻撃力 ${fmt(m.atk)}</td><td class="num">-</td><td class="num">-</td></tr>`);
      }
    }
  }
  if (actualAtk) {
    const diff = actualAtk - m.atk;
    const ratio = m.atk ? actualAtk / m.atk : NaN;
    lines.push(`<tr><td>ゲーム内攻撃力</td><td class="num">${fmt(actualAtk)}</td><td class="num">${fmt(m.atk)}</td><td class="num">${fmt(diff)}</td><td class="num">${pct(ratio-1)}</td></tr>`);
  }
  byId("actualDiffResult").innerHTML = `<table><thead><tr><th>項目</th><th>実測/逆算</th><th>予測/現在</th><th>差分</th><th>補足</th></tr></thead><tbody>${lines.join("")}</tbody></table>`;
}
/* AC別表用に、カンマ区切り数値リストを配列へ変換する。 */
function parseNumberList(text) {
  return text.split(",").map(s => parseFloat(s.trim())).filter(n => Number.isFinite(n));
}
/* 指定ACごとの予想ダメージ表を描画する。 */
function renderACTable() {
  const values = parseNumberList(byId("acList").value);
  const cfg = collectConfig();
  const body = values.map(ac => {
    const inputs = {...cfg.inputs, targetAC: String(ac)};
    const m = computeMetrics(cfg.state, inputs);
    return `<tr><td class="num">${fmt(ac)}</td><td class="num">${fmt(Math.floor(m.finalDamage),0)}</td><td class="num">${fmt(m.defenseFactor,6)}</td></tr>`;
  }).join("");
  byId("acTable").innerHTML = `<table><thead><tr><th>AC</th><th>ダメージ</th><th>防御係数</th></tr></thead><tbody>${body}</tbody></table>`;
}

/* 種族だけを変えた比較表を描画する。 */
function renderRaceTable() {
  const cfg = collectConfig();
  const currentRace = cfg.inputs.raceSelect;
  const current = computeMetrics(cfg.state, cfg.inputs);
  const races = ["newtar", "cognite", "elmony", "pandemos"];

  const rows = races.map(race => {
    const inputs = {...cfg.inputs, raceSelect: race, raceCoeff: String(RACE_COEFFS[race] ?? 0)};
    const m = computeMetrics(cfg.state, inputs);
    const damageDiff = m.finalDamage - current.finalDamage;
    const attackDiff = m.atk - current.atk;
    const magicDiff = m.stats.magic - current.stats.magic;
    const damagePct = current.finalDamage ? damageDiff / current.finalDamage : 0;
    const mark = race === currentRace ? "現在" : "";
    const name = race === currentRace ? `<b>${RACE_LABELS[race]}</b>` : RACE_LABELS[race];

    return `<tr>
      <td>${name}</td>
      <td>${mark}</td>
      <td class="num">${fmt(m.baseMagicFromSpirit)}</td>
      <td class="num">${fmt(m.stats.magic)}</td>
      <td class="num">${fmt(m.atk)}</td>
      <td class="num">${fmt(Math.floor(m.finalDamage),0)}</td>
      <td class="num">${fmt(damageDiff,0)}</td>
      <td class="num">${pct(damagePct)}</td>
      <td class="num">${fmt(attackDiff)}</td>
      <td class="num">${fmt(magicDiff)}</td>
    </tr>`;
  }).join("");

  byId("raceTable").innerHTML = `<table>
    <thead>
      <tr>
        <th>種族</th>
        <th></th>
        <th>基礎魔力</th>
        <th>予想魔力</th>
        <th>予想攻撃力</th>
        <th>予想ダメージ</th>
        <th>ダメージ差</th>
        <th>差%</th>
        <th>攻撃力差</th>
        <th>魔力差</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

/* TSVセル用エスケープ。改行やタブを\n/\tへ逃がす。 */
/* TSV/JSONの入出力とapplyConfigは src/storage/importExport.js へ分離しました。 */



function initializeBrowserApp() {
  loadIdbWorkerEndpoint();

  setupTabLayout();
  setupEquipmentFilterControls();

  document.querySelectorAll("input,select").forEach(el => {
    el.addEventListener("input", calc);
    el.addEventListener("change", calc);
  });

  renderAll();
  const saved = localStorage.getItem("moeDamageSimShortShareUrlShowcase");
  if (saved) {
    try { applyConfig(JSON.parse(saved)); }
    catch { calc(); }
  } else {
    calc();
  }
  ["A","B"].forEach(w => {
    const s = localStorage.getItem("moeDamageSnapshot" + w);
    if (s) {
      try { snapshots[w] = JSON.parse(s); } catch {}
    }
    const memoEl = byId("snapshotMemo" + w);
    if (memoEl) {
      memoEl.value = snapshots[w]?.memo || "";
      memoEl.addEventListener("input", () => updateSnapshotMemo(w));
    }
  });
  loadNamedPresetsFromStorage();
  renderPresetSelect();
  renderSnapshotLabels();
  renderCompareResult();
  renderActualDiff();
  renderACTable();
  renderRaceTable();
  renderValueTable();
  renderTagLinkSummary();
  loadConfigFromShareHash();
}

if (typeof document !== "undefined") {
  initializeBrowserApp();
}
