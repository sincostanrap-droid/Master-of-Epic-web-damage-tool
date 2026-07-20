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
