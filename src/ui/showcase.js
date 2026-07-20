/*
  Showcase view model

  見せびらかし表示で使用する装備・Buff・ステータス・スキルの表示データを生成します。
*/

function showcasePair(label, value) {
  return `<li class="showcasePair"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></li>`;
}

function showcaseList(items) {
  return `<ul class="showcaseList">${items.length ? items.join("") : `<li class="small">なし</li>`}</ul>`;
}

function equipmentRowHasShowcaseContent(row) {
  if (!row || row.enabled === false) return false;
  if (String(row.name || "").trim()) return true;
  if (+row.attack || +row.magic || +row.speed || +row.delay) return true;
  if (isWeaponEquipmentRow(row) && (+row.weaponDamage || +row.weaponWeight || +row.weaponAttackInterval || +row.weaponRange || +row.weaponDurability)) return true;
  if (extraStatsHasEffect(row, "base") || additionalEffectsSummary(row, "display").length) return true;
  if (row.equipBuffEnabled && equipmentBuffHasEffect(row)) return true;
  return false;
}

function activeEquipmentForShowcase() {
  const slotOrder = new Map(EQUIPMENT_SLOTS.map((x, i) => [x.slot, i]));
  return normalizeEquipmentRows(state.equipment)
    .map((row, idx) => ({row, idx}))
    .filter(x => equipmentRowHasShowcaseContent(x.row))
    .sort((a, b) => {
      const ao = slotOrder.has(a.row.slot) ? slotOrder.get(a.row.slot) : 9999;
      const bo = slotOrder.has(b.row.slot) ? slotOrder.get(b.row.slot) : 9999;
      return ao - bo || a.idx - b.idx;
    })
    .map(x => x.row);
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
  const extra = extraStatsSummary(row, {omitProps:["attack","magic","speed"]});
  if (extra.length) parts.push(extra.join(" / "));
  return parts.join(" / ") || "補正なし";
}

function showcaseResolvedBuffState() {
  let st = clone(state || {});
  if (typeof expandSkillSimMasteryBuffState === "function") st = expandSkillSimMasteryBuffState(st);
  if (typeof expandEquipmentBuffState === "function") st = expandEquipmentBuffState(st);
  if (typeof applyBuffGroupRules === "function") st = applyBuffGroupRules(st);
  return st;
}

function showcaseActiveBuffLines(resolvedState=null) {
  const st = resolvedState || showcaseResolvedBuffState();
  const lines = [];

  normalizeCompositeRows(st.composite)
    .filter(r => r.enabled && !r.excluded && compositeHasEffect(r))
    .forEach(r => {
      const prefix = /^装備由来[:：]/.test(r.note || "") || /装備Buff$/.test(r.name || "") ? "装備Buff: " : "";
      lines.push(`${prefix}${r.name || "装備以外Buff"}（${compositeEffectText(r)}）`);
    });

  (st.post || [])
    .filter(r => r.enabled && !r.excluded)
    .forEach(r => lines.push(`外枠: ${r.name || "外枠補正"}（倍率×${fmt(+r.value || 1,3)}${r.note ? ` / ${r.note}` : ""}）`));

  (st.other || [])
    .filter(r => r.enabled && !r.excluded)
    .forEach(r => lines.push(`${r.name || "その他バフ"}${r.note ? `（${r.note}）` : ""}`));

  return lines;
}

function totalStatValue(base, flat=0, pct=0) {
  return ((+base || 0) + (+flat || 0)) * (1 + ((+pct || 0) / 100));
}

function showcaseTotalStats(d, m) {
  const e = m?.extraStats || {};
  const rows = [
    ["HP", totalStatValue(d.hp, e.extraHP, e.extraHPPct)],
    ["MP", totalStatValue(d.mp, e.extraMP, e.extraMPPct)],
    ["ST", totalStatValue(d.st, e.extraST, e.extraSTPct)],
    ["最大重量", totalStatValue(d.weight, e.extraMaxWeight, e.extraMaxWeightPct)],
    ["命中", totalStatValue(d.hit, e.extraHit, e.extraHitPct)],
    ["回避", effectiveAvoidValue(d, m)],
    ["防御/AC", totalStatValue(d.def, e.extraAC, e.extraACPct)],
    ["耐火属性", totalStatValue(d.resist, e.extraFireRes, e.extraFireResPct)],
    ["耐水属性", totalStatValue(d.resist, e.extraWaterRes, e.extraWaterResPct)],
    ["耐地属性", totalStatValue(d.resist, e.extraEarthRes, e.extraEarthResPct)],
    ["耐風属性", totalStatValue(d.resist, e.extraWindRes, e.extraWindResPct)],
    ["耐無属性", totalStatValue(d.resist, e.extraNeutralRes, e.extraNeutralResPct)],
    ["攻撃力", m?.atk || 0],
    ["魔力", m?.stats?.magic || 0],
    ["速度", m?.stats?.speed || 0],
  ];

  const optional = [
    ["攻撃ディレイ", totalStatValue(0, e.extraAttackDelay, e.extraAttackDelayPct), e.extraAttackDelay || e.extraAttackDelayPct],
    ["魔法ディレイ", totalStatValue(0, e.extraMagicDelay, e.extraMagicDelayPct), e.extraMagicDelay || e.extraMagicDelayPct],
    ["被ダメ軽減", +(e.extraDamageReducePct || 0), e.extraDamageReducePct, "%"],
    ["クリ率上昇", +(e.extraCritRatePct || 0), e.extraCritRatePct, "%"],
  ];

  optional.forEach(([label, value, enabled, suffix=""]) => {
    if (enabled) rows.push([label, value, suffix]);
  });

  return rows.map(([label, value, suffix=""]) => ({label, value:`${fmt(value, 2)}${suffix}`}));
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
  const effective = m.effectiveWeapon || effectiveWeaponStats(state);
  const ammo = effective.ammo;
  const reqRows = (m.skillModInfo?.evaluated || []).map(r => `${r.name} ${fmt(r.current,1)}/${fmt(r.required,1)}`);
  const equipLines = activeEquipmentForShowcase().map(r => {
    const slot = (r.slot || "").replace(/^武器: /, "").replace(/^防具: /, "").replace(/^装飾: /, "");
    return `- ${slot}: ${r.name || "名称未入力"} / ${equipmentShowcaseText(r)}`;
  });
  const buffLines = showcaseActiveBuffLines(showcaseResolvedBuffState()).map(x => `- ${x}`);
  const skillLines = showcaseSkillLines().map(x => `- ${x}`);
  const totalStats = showcaseTotalStats(d, m).map(x => `- ${x.label}: ${x.value}`);
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
    "■総合ステータス",
    ...(totalStats.length ? totalStats : ["- なし"]),
    "",
    "■スキル由来ステータス",
    `HP ${fmt(d.hp,1)} / MP ${fmt(d.mp,1)} / ST ${fmt(d.st,1)} / 重量 ${fmt(d.weight,1)}`,
    `命中 ${fmt(d.hit,1)} / 回避 ${fmt(d.avoid,1)} / 防御 ${fmt(d.def,1)} / 属性耐性基礎 ${fmt(d.resist,1)}`,
    "",
    "■武器",
    weapon
      ? `${(weapon.slot || "武器").replace(/^武器: /, "")}: ${weapon.name || "名称未入力"} / Dmg ${fmt(effective.damage,1)}${effective.usesAmmo ? `（本体 ${fmt(effective.weaponDamage,1)} + ${ammo?.name || "矢・弾未設定"} ${fmt(effective.ammoDamage,1)}）` : ""} / 射程 ${fmt(effective.range,1)} / 重量 ${fmt(effective.weight,1)} / 発揮率 ${fmt((m.skillModInfo?.mod || 1) * 100,1)}%${reqRows.length ? ` / 条件 ${reqRows.join(" / ")}` : ""}`
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
  const effective = m.effectiveWeapon || effectiveWeaponStats(state);
  const ammo = effective.ammo;
  const reqRows = (m.skillModInfo?.evaluated || []).map(r => `${escapeHtml(r.name)} ${fmt(r.current,1)}/${fmt(r.required,1)}`);
  const resolvedShowcaseState = showcaseResolvedBuffState();
  const equipRows = activeEquipmentForShowcase();
  const buffLines = showcaseActiveBuffLines(resolvedShowcaseState);
  const skillLines = showcaseSkillLines();
  const extraLines = extraStatsSummary(m.extraStats || {});
  const totalStatLines = showcaseTotalStats(d, m);
  const inputs = collectInputs();

  if (root) {
    const equipItems = equipRows.map(r => {
      const slot = (r.slot || "").replace(/^武器: /, "").replace(/^防具: /, "").replace(/^装飾: /, "");
      return `<li><b>${escapeHtml(slot)}: ${escapeHtml(r.name || "名称未入力")}</b><br><span class="small">${escapeHtml(equipmentShowcaseText(r))}</span></li>`;
    });
    const buffItems = buffLines.map(x => `<li>${escapeHtml(x)}</li>`);
    const skillItems = skillLines.map(x => `<li>${escapeHtml(x)}</li>`);
    const extraItems = extraLines.map(x => `<li>${escapeHtml(x)}</li>`);
    const totalStatItems = totalStatLines.map(x => showcasePair(x.label, x.value));

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

        <div class="showcaseCard showcaseTotalStatsCard">
          <h3>総合ステータス</h3>
          <p class="small">スキル由来 + 装備/有効Buffの追加ステータス込み</p>
          ${showcaseList(totalStatItems)}
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
            showcasePair("属性耐性基礎", fmt(d.resist,1))
          ])}
        </div>

        <div class="showcaseCard">
          <h3>武器</h3>
          ${showcaseList(weapon ? [
            `<li><b>${escapeHtml((weapon.slot || "武器").replace(/^武器: /, ""))}: ${escapeHtml(weapon.name || "名称未入力")}</b></li>`,
            showcasePair("合計ダメージ", fmt(effective.damage,1)),
            showcasePair("武器本体ダメージ", fmt(effective.weaponDamage,1)),
            ...(effective.usesAmmo ? [
              showcasePair("矢・弾", ammo ? (ammo.name || "名称未入力") : "未設定"),
              showcasePair("矢・弾ダメージ", fmt(effective.ammoDamage,1))
            ] : []),
            showcasePair("武器重量", fmt(effective.weight,1)),
            showcasePair("攻撃間隔", fmt(effective.attackInterval,1)),
            showcasePair("合計射程", fmt(effective.range,1)),
            ...(effective.usesAmmo ? [showcasePair("矢・弾射程", fmt(effective.ammoRange,1))] : []),
            showcasePair("耐久", fmt(effective.durability,0)),
            showcasePair("両手武器", effective.twoHanded),
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
