/*
  calc/core.js

  ダメージ計算の中心部分です。
  現時点では既存ロジックの安全分離を優先しており、
  正規化関数・補助関数・定数は src/main.js 側の定義を参照します。

  役割:
  - computeMetrics(st, inputs)
  - buffSlotCountForState(st)
*/

function computeMetrics(st, inputs) {
  // 装備行に内蔵されたBuffを計算用の装備以外Buffへ展開し、競合グループで重複しないよう代表だけ採用してから既存カテゴリへ展開する。
  st = expandEquipmentBuffState(st);
  st = applyBuffGroupRules(st);
  st = expandCompositeState(st);
  const raceCoeff = RACE_COEFFS[inputs.raceSelect] ?? parseFloat(inputs.raceCoeff) ?? 0.20;
  const spirit = parseFloat(inputs.spirit) || 0;
  const magicCoeff = RACE_MAGIC_COEFFS[inputs.raceSelect] ?? 1.00;
  const baseMagicFromSpirit = spirit * magicCoeff;
  // 装備補正はBuff枠とは別枠。攻撃力/魔力/速度/ディレイを単純合算する。
  const equipmentRows = normalizeEquipmentRows(st.equipment).filter(r => r.enabled !== false);
  const equipmentRaw = {
    attack: equipmentRows.reduce((s, r) => s + (+r.attack || 0), 0),
    magic: equipmentRows.reduce((s, r) => s + (+r.magic || 0), 0),
    speed: equipmentRows.reduce((s, r) => s + (+r.speed || 0), 0),
    delay: equipmentRows.reduce((s, r) => s + (+r.delay || 0), 0)
  };
  const extraStats = emptyExtraStats();
  equipmentRows.forEach(r => addExtraStatsInto(extraStats, r, "base"));
  normalizeCompositeRows(st.composite).filter(r => r.enabled).forEach(r => addExtraStatsInto(extraStats, r, "buff"));

  // 実数加算。魔力/速度は%Buffや変換より前、攻撃力は上限対象側に入る。
  const flatRows = normalizeFlatRows(st).filter(r => r.enabled);
  const flatStatRaw = {
    magic: flatRows.filter(r => (r.target || "magic") === "magic").reduce((s, r) => s + (+r.value || 0), 0) + equipmentRaw.magic,
    attack: flatRows.filter(r => r.target === "attack").reduce((s, r) => s + (+r.value || 0), 0) + equipmentRaw.attack,
    speed: flatRows.filter(r => r.target === "speed").reduce((s, r) => s + (+r.value || 0), 0) + equipmentRaw.speed
  };
  const baseStats = {
    str: parseFloat(inputs.str) || 0,
    magic: baseMagicFromSpirit + flatStatRaw.magic,
    speed: (parseFloat(inputs.speed) || 0) + flatStatRaw.speed,
    drunk: parseFloat(inputs.drunk) || 0
  };
  // 攻撃力以外の割合ステータスBuffを適用して、変換計算で使う実効ステータスを作る。
  const pctStats = applyPercentStats(st, baseStats);
  const stats = pctStats.stats;

  // 武器性能発揮率を反映した武器攻撃力を計算する。
  const selectedWeapon = selectedWeaponForCalc(st);
  const weaponDamage = selectedWeapon ? (+selectedWeapon.weaponDamage || 0) : (parseFloat(inputs.weaponDamage) || 0);
  const weaponWeight = selectedWeapon ? (+selectedWeapon.weaponWeight || 0) : (parseFloat(inputs.weaponWeight) || 0);
  const weaponInputs = {...inputs, weaponDamage, weaponWeight};
  const skillModInfo = calcWeaponSkillMod(st, weaponInputs);
  const skillMod = skillModInfo.mod;
  const ac = parseFloat(inputs.targetAC) || 0;

  const racialAtk = stats.str * raceCoeff;
  const weaponAtk = ((stats.str + 300) / 350) * weaponDamage * skillMod;
  const conv = calcConversions(st, stats);

  // 攻撃力加算上限の基準:
  // 武器攻撃力 + 種族ごとの基礎攻撃力は基礎攻撃力。
  // ステータス変換系は上限外で突破する。
  // それ以外の攻撃力増加だけを最大 atkCap までに収める。
  const baseNaturalAtk = racialAtk + weaponAtk;
  const conversionAtk = conv.uncapped + conv.capped;
  const baseAtk = baseNaturalAtk + conversionAtk; // 変換込みの上限外基礎として扱う。

  const flatAtkRaw = flatStatRaw.attack;
  const atkCap = parseFloat(inputs.atkCap) || 0;
  const atkBeforePctRaw = baseNaturalAtk + conversionAtk + flatAtkRaw;

  const atkPctMode = inputs.atkPctMode || "afterAdds";
  let pctAtkCalc;
  let atkBuffRaw;
  let atkBuffCapped;
  let atk;
  let atkBeforePct;
  let cappedAddRawBeforePct;
  let cappedAddBeforePct;
  let extraRawBeforePct;

  if (atkPctMode === "afterAdds") {
    // 攻撃力%Buffは、固定加算・変換加算後の攻撃力に順次乗算。
    // ただし上限外で突破するのは変換そのものだけ。
    // 攻撃力%Buffによる増加分は、変換に由来する分も含めて上限対象側へ入れる。
    pctAtkCalc = calcPctAttack(st, atkBeforePctRaw);
    atkBuffRaw = pctAtkCalc.after - baseNaturalAtk - conversionAtk;
    atkBuffCapped = atkCap > 0 ? Math.min(atkBuffRaw, atkCap) : atkBuffRaw;
    atk = baseNaturalAtk + conversionAtk + atkBuffCapped;
    atkBeforePct = atkBeforePctRaw;
    extraRawBeforePct = flatAtkRaw;
    cappedAddRawBeforePct = flatAtkRaw;
    cappedAddBeforePct = atkCap > 0 ? Math.min(flatAtkRaw, atkCap) : flatAtkRaw;
  } else {
    // 旧式: 基礎攻撃力への攻撃力%増分を上限対象加算として扱う。
    pctAtkCalc = calcPctAttack(st, baseNaturalAtk + conversionAtk);
    atkBuffRaw = flatAtkRaw + pctAtkCalc.added;
    atkBuffCapped = atkCap > 0 ? Math.min(atkBuffRaw, atkCap) : atkBuffRaw;
    atk = baseNaturalAtk + conversionAtk + atkBuffCapped;
    atkBeforePct = baseNaturalAtk + conversionAtk;
    extraRawBeforePct = flatAtkRaw;
    cappedAddRawBeforePct = flatAtkRaw;
    cappedAddBeforePct = atkCap > 0 ? Math.min(flatAtkRaw, atkCap) : flatAtkRaw;
  }

  const attackMultiplier = attackMultiplierFromInputs(weaponInputs);
  const dmgBonusSum = (st.dmg || []).filter(r => r.enabled).reduce((s, r) => s + (+r.value || 0), 0);
  const dmgMultiplier = 1 + dmgBonusSum;
  const specialMultiplier = (st.special || []).filter(r => r.enabled).reduce((p, r) => p * (+r.value || 1), 1);

  let defenseFactor = 1;
  if (ac > 0) {
    const atkDefInput = atk * dmgMultiplier * specialMultiplier;
    defenseFactor = 1 - Math.pow(ac / (atkDefInput + ac), 1.244);
  }

  let critAvg = 1;
  if (inputs.attackType === "attack" && inputs.allowCrit) {
    const rate = Math.max(0, Math.min(1, parseFloat(inputs.critRate) || 0));
    critAvg = 1 + rate * ((parseFloat(inputs.critMultiplier) || 1.5) - 1);
  }

  const postMultiplier = (st.post || []).filter(r => r.enabled).reduce((p, r) => p * (+r.value || 1), 1);
  const baseNoTech = atk * 0.8;
  const rawDamage = baseNoTech * attackMultiplier * dmgMultiplier * specialMultiplier * defenseFactor * critAvg * postMultiplier;
  const finalCap = parseFloat(inputs.finalCap) || 0;
  const finalDamage = finalCap > 0 ? Math.min(rawDamage, finalCap) : rawDamage;
  const slots = buffSlotCountForState(st);

  return {
    stats, pctStats, conv, pctAtkCalc, spirit, magicCoeff, baseMagicFromSpirit, flatStatRaw, equipmentRaw, extraStats,
    racialAtk, weaponAtk, weaponDamage, weaponWeight, selectedWeapon, skillModInfo, baseNaturalAtk, conversionAtk, baseAtk, flatAtkRaw, extraRawBeforePct, cappedAddRawBeforePct, cappedAddBeforePct, atkBeforePct, atkPctMode, atkBuffRaw, atkCap, atkBuffCapped, atk,
    attackMultiplier, dmgMultiplier, defenseFactor, critAvg, postMultiplier, baseNoTech,
    rawDamage, finalDamage, slots, specialMultiplier
  };
}
/* バフ枠一覧に表示する行名を作る。 */
function slotRowName(row, fallback) {
  const name = (row && row.name ? String(row.name).trim() : "") || fallback;
  const group = buffGroupName(row);
  return group ? `${name} [${group}]` : name;
}
/* バフ24枠の使用数を数える。装備以外Buffは効果が複数あっても1行=1枠。 */
function buffSlotCountForState(st) {
  const details = [
    ["装備外", normalizeCompositeRows(st.composite).filter(r => r.enabled && r.slot && compositeHasEffect(r)).map(r => `${slotRowName(r, "装備以外Buff")}（${compositeEffectText(r)}）`)],
    ["割合", (st.pct || []).filter(r => r.enabled && r.slot).map(r => slotRowName(r, "割合Buff"))],
    ["実数", normalizeFlatRows(st).filter(r => r.enabled && r.slot).map(r => slotRowName(r, "実数加算"))],
    ["変換", (st.conv || []).filter(r => r.enabled && r.slot).map(r => slotRowName(r, "ステータス変換"))],
    ["与ダメ", (st.dmg || []).filter(r => r.enabled && r.slot).map(r => slotRowName(r, "与ダメBuff"))],
    ["特攻", (st.special || []).filter(r => r.enabled && r.slot).map(r => slotRowName(r, "特攻"))],
    ["外枠", (st.post || []).filter(r => r.enabled && r.slot).map(r => slotRowName(r, "外枠補正"))],
    ["その他", (st.other || []).filter(r => r.enabled).map(r => slotRowName(r, "その他バフ"))]
  ];
  const groups = details.map(([name, items]) => [name, items.length]);
  return {total: groups.reduce((s, [,n]) => s+n, 0), groups, details};
}
