/*
  storage/importExport.js

  保存・読み込みタブのJSON/TSV入出力と、構成復元 applyConfig() を扱います。
  役割:
  - TSV serialize/parse
  - JSON/TSV export/import button handlers
  - applyConfig()
  - resetConfig()
*/

function tsvEscape(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\t/g, "\\t")
    .replace(/\r?\n/g, "\\n");
}
/* TSVセルの\n/\tエスケープを元に戻す。 */
function tsvUnescape(value) {
  return String(value ?? "")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\");
}
/* booleanをTSV用の0/1へ変換する。 */
function boolToCell(v) {
  return v ? "1" : "0";
}
/* TSVセルの0/1/true/false等をbooleanへ変換する。 */
function cellToBool(v) {
  const s = String(v ?? "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "on" || s === "yes" || s === "使用";
}
/* TSVセルを数値へ変換する。不正値は0。 */
function cellToNum(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}
/* 旧TSV互換用。既知の変換名から参照補正を推定する。 */
function inferConversionBaseOffset(row) {
  const name = String(row?.name || "");
  const source = row?.source || "magic";
  const rate = cellToNum(row?.rate);
  // 既存TSV互換: 剣聖の魔法陣は今回の実測から「(魔力+10)×10%」扱いで寄せる
  if (name.includes("剣聖") && source === "magic" && Math.abs(rate - 10) < 0.0001) return 10;
  return 0;
}
/* TSVの1セクションを生成する。ヘッダー名は読み込み側と揃える必要がある。 */
function makeTsvSection(name, headers, rows) {
  const lines = [`[${name}]`, headers.join("\t")];
  rows.forEach(row => {
    lines.push(headers.map(h => tsvEscape(row[h])).join("\t"));
  });
  lines.push("");
  return lines.join("\n");
}
/* 現在構成を人間が表計算で編集しやすいTSVへ変換する。 */
function serializeConfigAsTsv(cfg) {
  const inputs = cfg.inputs || {};
  const st = cfg.state || {};
  const out = [
    "# MoE Damage Simulator TSV v1",
    "# セクション名とヘッダー行は変更しないでください。",
    ""
  ];

  out.push(makeTsvSection("inputs", ["key", "value"],
    Object.keys(inputs).map(k => ({key: k, value: inputs[k]}))
  ));

  out.push(makeTsvSection("weaponReq", ["name", "current", "required"],
    (st.weaponReq || []).map(r => ({
      name: r.name || "",
      current: r.current ?? 0,
      required: r.required ?? 0
    }))
  ));

  out.push(makeTsvSection("composite",
    ["enabled", "slot", "name", "tags", "attackPct", "magicPct", "speedPct", "flatAttack", "flatMagic", "flatSpeed", "convMagicRate", "convSpeedRate", "dmgPct", "special"].concat(extraTsvFields("buff"), ["note"]),
    normalizeCompositeRows(st.composite || []).map(r => ({
      enabled: boolToCell(r.enabled),
      slot: boolToCell(r.slot),
      name: r.name || "",
      tags: r.tags || "",
      attackPct: r.attackPct ?? 0,
      magicPct: r.magicPct ?? 0,
      speedPct: r.speedPct ?? 0,
      flatAttack: r.flatAttack ?? 0,
      flatMagic: r.flatMagic ?? 0,
      flatSpeed: r.flatSpeed ?? 0,
      convMagicRate: r.convMagicRate ?? 0,
      convSpeedRate: r.convSpeedRate ?? 0,
      dmgPct: r.dmgPct ?? 0,
      special: r.special ?? 1,
      ...extraTsvExportFields(r, "buff"),
      note: r.note || ""
    }))
  ));

  const sim = normalizeSkillSim(st.skillSim || {});
  out.push(makeTsvSection("skillSim", ["name", "race", "cap", "weaponSkill", "autoApply", "skill", "value"],
    [
      {name: sim.name || "", race: sim.race || "newtar", cap: sim.cap ?? 850, weaponSkill: sim.weaponSkill || "こんぼう", autoApply: boolToCell(sim.autoApply !== false), skill:"", value:""},
      ...SKILL_SIM_ALL.map(skill => ({name:"", race:"", cap:"", weaponSkill:"", autoApply:"", skill, value: sim.skills[skill] ?? 0}))
    ]
  ));

  out.push(makeTsvSection("equipment",
    ["enabled", "optimizerFixed", "optimizerExcluded", "slot", "name", "tags", "attack", "magic", "speed", "delay", "weaponDamage", "weaponWeight", "weaponAttackInterval", "weaponRange", "weaponDurability", "weaponTwoHanded", "weaponReqText"].concat(extraTsvFields("base"), ["equipBuffEnabled", "equipBuffSlot", "equipBuffName", "equipBuffAttackPct", "equipBuffMagicPct", "equipBuffSpeedPct", "equipBuffFlatAttack", "equipBuffFlatMagic", "equipBuffFlatSpeed", "equipBuffConvMagicRate", "equipBuffConvSpeedRate", "equipBuffDmgPct", "equipBuffSpecial"], extraTsvFields("equipBuff"), ["equipBuffNote", "note"]),
    normalizeEquipmentRows(st.equipment || []).map(r => ({
      enabled: boolToCell(r.enabled !== false),
      optimizerFixed: boolToCell(r.optimizerFixed),
      optimizerExcluded: boolToCell(r.optimizerExcluded),
      slot: r.slot || "",
      name: r.name || "",
      tags: r.tags || "",
      attack: r.attack ?? 0,
      magic: r.magic ?? 0,
      speed: r.speed ?? 0,
      delay: r.delay ?? 0,
      weaponDamage: r.weaponDamage ?? 0,
      weaponWeight: r.weaponWeight ?? 0,
      weaponAttackInterval: r.weaponAttackInterval ?? 0,
      weaponRange: r.weaponRange ?? 0,
      weaponDurability: r.weaponDurability ?? 0,
      weaponTwoHanded: r.weaponTwoHanded || "×",
      weaponReqText: serializeWeaponReqText(r.weaponReq),
      ...extraTsvExportFields(r, "base"),
      equipBuffEnabled: boolToCell(r.equipBuffEnabled),
      equipBuffSlot: boolToCell(r.equipBuffSlot !== false),
      equipBuffName: r.equipBuffName || "",
      equipBuffAttackPct: r.equipBuffAttackPct ?? 0,
      equipBuffMagicPct: r.equipBuffMagicPct ?? 0,
      equipBuffSpeedPct: r.equipBuffSpeedPct ?? 0,
      equipBuffFlatAttack: r.equipBuffFlatAttack ?? 0,
      equipBuffFlatMagic: r.equipBuffFlatMagic ?? 0,
      equipBuffFlatSpeed: r.equipBuffFlatSpeed ?? 0,
      equipBuffConvMagicRate: r.equipBuffConvMagicRate ?? 0,
      equipBuffConvSpeedRate: r.equipBuffConvSpeedRate ?? 0,
      equipBuffDmgPct: r.equipBuffDmgPct ?? 0,
      equipBuffSpecial: r.equipBuffSpecial ?? 1,
      ...extraTsvExportFields(r, "equipBuff"),
      equipBuffNote: r.equipBuffNote || "",
      note: r.note || ""
    }))
  ));

  out.push(makeTsvSection("pct", ["enabled", "slot", "name", "target", "percent", "note"],
    (st.pct || []).map(r => ({
      enabled: boolToCell(r.enabled),
      slot: boolToCell(r.slot),
      name: r.name || "",
      target: r.target || "attack",
      percent: r.percent ?? 0,
      note: r.note || ""
    }))
  ));

  out.push(makeTsvSection("flat", ["enabled", "slot", "name", "target", "value", "note"],
    normalizeFlatRows(st).map(r => ({
      enabled: boolToCell(r.enabled),
      slot: boolToCell(r.slot),
      name: r.name || "",
      target: r.target || "magic",
      value: r.value ?? 0,
      note: r.note || ""
    }))
  ));

  out.push(makeTsvSection("conv", ["enabled", "slot", "name", "source", "rate", "baseOffset", "note"],
    (st.conv || []).map(r => ({
      enabled: boolToCell(r.enabled),
      slot: boolToCell(r.slot),
      name: r.name || "",
      source: r.source || "magic",
      rate: r.rate ?? 0,
      baseOffset: r.baseOffset ?? 0,
      note: r.note || ""
    }))
  ));

  out.push(makeTsvSection("dmg", ["enabled", "slot", "name", "value", "category", "note"],
    (st.dmg || []).map(r => ({
      enabled: boolToCell(r.enabled),
      slot: boolToCell(r.slot),
      name: r.name || "",
      value: r.value ?? 0,
      category: r.category || "",
      note: r.note || ""
    }))
  ));

  out.push(makeTsvSection("special", ["enabled", "slot", "name", "value", "note"],
    (st.special || []).map(r => ({
      enabled: boolToCell(r.enabled),
      slot: boolToCell(r.slot),
      name: r.name || "",
      value: r.value ?? 1,
      note: r.note || ""
    }))
  ));

  out.push(makeTsvSection("post", ["enabled", "slot", "name", "tags", "value", "note"],
    (st.post || []).map(r => ({
      enabled: boolToCell(r.enabled),
      slot: boolToCell(r.slot),
      name: r.name || "",
      tags: r.tags || "",
      value: r.value ?? 1,
      note: r.note || ""
    }))
  ));

  out.push(makeTsvSection("other", ["enabled", "name", "tags", "note"],
    (st.other || []).map(r => ({
      enabled: boolToCell(r.enabled),
      name: r.name || "",
      tags: r.tags || "",
      note: r.note || ""
    }))
  ));

  return out.join("\n");
}
/* TSV文字列をセクションごとの行オブジェクトへ分解する。 */
function parseTsvSections(text) {
  const sections = {};
  let current = null;
  let headers = null;

  String(text || "").split(/\r?\n/).forEach(rawLine => {
    const line = rawLine.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) return;

    const m = line.match(/^\[([^\]]+)\]$/);
    if (m) {
      current = m[1].trim();
      headers = null;
      sections[current] = {headers: [], rows: []};
      return;
    }

    if (!current) return;

    const cells = line.split("\t").map(tsvUnescape);
    if (!headers) {
      headers = cells;
      sections[current].headers = headers;
      return;
    }

    const obj = {};
    headers.forEach((h, i) => { obj[h] = cells[i] ?? ""; });
    sections[current].rows.push(obj);
  });

  return sections;
}
/* TSVからcollectConfig()互換のconfigオブジェクトを復元する。 */
function parseConfigFromTsv(text) {
  const sections = parseTsvSections(text);
  const inputs = {};

  (sections.inputs?.rows || []).forEach(r => {
    if (!r.key) return;
    inputs[r.key] = r.key === "allowCrit" ? cellToBool(r.value) : r.value;
  });

  const stateFromDefaults = DEFAULT_STATE();

  const skillSimRows = sections.skillSim?.rows || [];
  const skillSimMeta = skillSimRows[0] || {};
  const skillSimFromTsv = defaultSkillSimState();
  if (skillSimRows.length) {
    skillSimFromTsv.name = skillSimMeta.name || "";
    skillSimFromTsv.race = skillSimMeta.race || "newtar";
    skillSimFromTsv.cap = skillSimMeta.cap === undefined || skillSimMeta.cap === "" ? 850 : cellToNum(skillSimMeta.cap);
    skillSimFromTsv.weaponSkill = skillSimMeta.weaponSkill || "こんぼう";
    skillSimFromTsv.autoApply = skillSimMeta.autoApply === undefined || skillSimMeta.autoApply === "" ? true : cellToBool(skillSimMeta.autoApply);
    skillSimRows.forEach(r => {
      if (r.skill) skillSimFromTsv.skills[r.skill] = cellToNum(r.value);
    });
  }

  const stateOut = {
    skillSim: normalizeSkillSim(skillSimFromTsv),
    weaponReq: (sections.weaponReq?.rows || []).map(r => ({
      name: r.name || "使用条件",
      current: cellToNum(r.current),
      required: cellToNum(r.required)
    })),
    composite: (sections.composite?.rows || []).map(r => ({
      enabled: cellToBool(r.enabled),
      slot: cellToBool(r.slot),
      name: r.name || "装備以外Buff",
      tags: r.tags || r.tag || "",
      attackPct: cellToNum(r.attackPct),
      magicPct: cellToNum(r.magicPct),
      speedPct: cellToNum(r.speedPct),
      flatAttack: cellToNum(r.flatAttack),
      flatMagic: cellToNum(r.flatMagic),
      flatSpeed: cellToNum(r.flatSpeed),
      convMagicRate: cellToNum(r.convMagicRate),
      convSpeedRate: cellToNum(r.convSpeedRate),
      dmgPct: r.dmgPct !== undefined && r.dmgPct !== ""
        ? cellToNum(r.dmgPct)
        : (cellToNum(r.dmg) > 0 && cellToNum(r.dmg) <= 1 ? cellToNum(r.dmg) * 100 : cellToNum(r.dmg)),
      special: r.special === undefined || r.special === "" ? 1 : cellToNum(r.special),
      ...extraTsvParseFields(r, "buff"),
      note: r.note || ""
    })),
    equipment: (sections.equipment?.rows || []).map(r => ({
      enabled: r.enabled === undefined || r.enabled === "" ? true : cellToBool(r.enabled),
      optimizerFixed: cellToBool(r.optimizerFixed || r.optimizerFix || r.fixedInOptimizer || r.searchFixed),
      optimizerExcluded: cellToBool(r.optimizerExcluded || r.optimizerExclude || r.excludeFromOptimizer || r.searchExcluded),
      slot: r.slot || "",
      name: r.name || "",
      tags: r.tags || r.tag || "",
      attack: cellToNum(r.attack),
      magic: cellToNum(r.magic),
      speed: cellToNum(r.speed),
      delay: cellToNum(r.delay),
      weaponDamage: cellToNum(r.weaponDamage),
      weaponWeight: cellToNum(r.weaponWeight),
      weaponAttackInterval: cellToNum(r.weaponAttackInterval),
      weaponRange: cellToNum(r.weaponRange),
      weaponDurability: cellToNum(r.weaponDurability),
      weaponTwoHanded: (r.weaponTwoHanded === "○" || r.weaponTwoHanded === "true" || r.weaponTwoHanded === "yes") ? "○" : "×",
      weaponReq: parseWeaponReqText(r.weaponReqText),
      ...extraTsvParseFields(r, "base"),
      equipBuffEnabled: cellToBool(r.equipBuffEnabled),
      equipBuffSlot: r.equipBuffSlot === undefined || r.equipBuffSlot === "" ? true : cellToBool(r.equipBuffSlot),
      equipBuffName: r.equipBuffName || "",
      equipBuffAttackPct: cellToNum(r.equipBuffAttackPct),
      equipBuffMagicPct: cellToNum(r.equipBuffMagicPct),
      equipBuffSpeedPct: cellToNum(r.equipBuffSpeedPct),
      equipBuffFlatAttack: cellToNum(r.equipBuffFlatAttack),
      equipBuffFlatMagic: cellToNum(r.equipBuffFlatMagic),
      equipBuffFlatSpeed: cellToNum(r.equipBuffFlatSpeed),
      equipBuffConvMagicRate: cellToNum(r.equipBuffConvMagicRate),
      equipBuffConvSpeedRate: cellToNum(r.equipBuffConvSpeedRate),
      equipBuffDmgPct: cellToNum(r.equipBuffDmgPct),
      equipBuffSpecial: r.equipBuffSpecial === undefined || r.equipBuffSpecial === "" ? 1 : cellToNum(r.equipBuffSpecial),
      ...extraTsvParseFields(r, "equipBuff"),
      equipBuffNote: r.equipBuffNote || "",
      note: r.note || ""
    })),
    pct: (sections.pct?.rows || []).map(r => ({
      enabled: cellToBool(r.enabled),
      slot: cellToBool(r.slot),
      name: r.name || "",
      target: r.target || "attack",
      percent: cellToNum(r.percent),
      note: r.note || ""
    })),
    flat: (sections.flat?.rows || []).map(r => ({
      enabled: cellToBool(r.enabled),
      slot: cellToBool(r.slot),
      name: r.name || "",
      target: r.target || "magic",
      value: cellToNum(r.value),
      note: r.note || ""
    })),
    conv: (sections.conv?.rows || []).map(r => ({
      enabled: cellToBool(r.enabled),
      slot: cellToBool(r.slot),
      name: r.name || "",
      source: r.source || "magic",
      rate: cellToNum(r.rate),
      baseOffset: r.baseOffset !== undefined && r.baseOffset !== "" ? cellToNum(r.baseOffset) : inferConversionBaseOffset(r),
      offset: r.offset !== undefined && r.offset !== "" ? cellToNum(r.offset) : 0,
      capped: false,
      note: r.note || ""
    })),
    dmg: (sections.dmg?.rows || []).map(r => ({
      enabled: cellToBool(r.enabled),
      slot: cellToBool(r.slot),
      name: r.name || "",
      value: cellToNum(r.value),
      category: r.category || "",
      note: r.note || ""
    })),
    special: (sections.special?.rows || []).map(r => ({
      enabled: cellToBool(r.enabled),
      slot: cellToBool(r.slot),
      name: r.name || "",
      value: cellToNum(r.value),
      note: r.note || ""
    })),
    post: (sections.post?.rows || []).map(r => ({
      enabled: cellToBool(r.enabled),
      slot: cellToBool(r.slot),
      name: r.name || "",
      tags: r.tags || r.tag || "",
      value: cellToNum(r.value),
      note: r.note || ""
    })),
    other: (sections.other?.rows || []).map(r => ({
      enabled: cellToBool(r.enabled),
      name: r.name || "",
      tags: r.tags || r.tag || "",
      note: r.note || ""
    }))
  };

  // セクションがない場合は初期値を維持
  Object.keys(stateOut).forEach(k => {
    if (k === "skillSim") {
      if (!sections.skillSim) stateOut[k] = stateFromDefaults[k];
      return;
    }
    if (!sections[k]) stateOut[k] = stateFromDefaults[k];
  });

  return {inputs, state: stateOut};
}
/* 名前付きプリセットをlocalStorageから読む。 */
function loadNamedPresetsFromStorage() {
  try {
    namedPresets = JSON.parse(localStorage.getItem(NAMED_PRESET_KEY) || "{}") || {};
  } catch {
    namedPresets = {};
  }
}
/* 名前付きプリセットをlocalStorageへ保存する。 */
function saveNamedPresetsToStorage() {
  localStorage.setItem(NAMED_PRESET_KEY, JSON.stringify(namedPresets));
}
/* 保存済みプリセットselectを更新する。 */
function renderPresetSelect() {
  const sel = byId("presetSelect");
  if (!sel) return;
  const names = Object.keys(namedPresets).sort((a,b) => a.localeCompare(b, "ja"));
  sel.innerHTML = names.length
    ? names.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("")
    : `<option value="">保存済みなし</option>`;
}
/* 現在構成を名前付きプリセットとして保存する。 */
function saveNamedPreset() {
  let name = (byId("presetName").value || "").trim();
  if (!name) {
    name = prompt("プリセット名を入力してください", "");
    if (!name) return;
    name = name.trim();
  }
  if (!name) return;
  namedPresets[name] = {
    savedAt: new Date().toISOString(),
    config: collectConfig()
  };
  saveNamedPresetsToStorage();
  renderPresetSelect();
  byId("presetSelect").value = name;
  byId("presetName").value = name;
}
/* 選択中の名前付きプリセットを読み込む。 */
function loadNamedPreset() {
  const name = byId("presetSelect").value;
  if (!name || !namedPresets[name]) {
    alert("読み込むプリセットがありません。");
    return;
  }
  const cfg = namedPresets[name].config || namedPresets[name];
  applyConfig(cfg);
}
/* 選択中の名前付きプリセットを削除する。 */
function deleteNamedPreset() {
  const name = byId("presetSelect").value;
  if (!name || !namedPresets[name]) return;
  if (!confirm(`プリセット「${name}」を削除しますか？`)) return;
  delete namedPresets[name];
  saveNamedPresetsToStorage();
  renderPresetSelect();
}

/* JSON形式で現在構成をテキストエリアへ出力する。 */
function exportConfig() {
  byId("configBox").value = JSON.stringify(collectConfig(), null, 2);
}
/* テキストエリアのJSONを読み込む。 */
function importConfig() {
  try {
    applyConfig(JSON.parse(byId("configBox").value));
  } catch (e) {
    alert("JSONの読み込みに失敗: " + e.message);
  }
}
/* TSV形式で現在構成をテキストエリアへ出力する。 */
function exportTsvConfig() {
  byId("configBox").value = serializeConfigAsTsv(collectConfig());
}
/* テキストエリアのTSVを読み込む。 */
function importTsvConfig() {
  try {
    applyConfig(parseConfigFromTsv(byId("configBox").value));
  } catch (e) {
    alert("TSVの読み込みに失敗: " + e.message);
  }
}
/* localStorageの現在構成を削除し、初期状態へ戻す。 */
function resetConfig() {
  if (!confirm("保存済み設定をリセットして初期状態に戻しますか？")) return;
  localStorage.removeItem("moeDamageSimShortShareUrlShowcase");
  state = DEFAULT_STATE();
  renderAll();
  calc();
}
/* JSON/TSV/プリセットから復元したconfigを画面とstateへ適用する。 */
function applyConfig(cfg) {
  if (!cfg || !cfg.inputs || !cfg.state) return;
  setInputs(cfg.inputs);
  const incoming = cfg.state || {};
  state = DEFAULT_STATE();

  state.weaponReq = normalizeWeaponReqRows(incoming.weaponReq, cfg.inputs || {});
  state.skillSim = normalizeSkillSim(incoming.skillSim);
  state.composite = Array.isArray(incoming.composite) ? normalizeCompositeRows(incoming.composite) : state.composite;
  state.equipment = normalizeEquipmentRows(incoming.equipment);

  // 旧項目UIは廃止したため、旧形式の pct/flat/conv/dmg/special は非表示で効かないよう破棄する。
  state.pct = [];
  state.flat = [];
  state.conv = [];
  state.dmg = [];
  state.special = [];

  ["post","other"].forEach(k => {
    state[k] = Array.isArray(incoming[k]) ? incoming[k] : [];
  });
  state.conv = (state.conv || []).map(r => ({
    ...r,
    baseOffset: r.baseOffset !== undefined ? (+r.baseOffset || 0) : (r.offset !== undefined ? 0 : inferConversionBaseOffset(r)),
    offset: r.offset !== undefined ? (+r.offset || 0) : 0
  }));
  renderAll();
  syncSkillSimToCalcInputs(false, false);
  calc();
}
