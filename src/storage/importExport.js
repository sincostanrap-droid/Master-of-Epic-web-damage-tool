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
    ["enabled", "slot", "name", "tags", "attackPct", "magicPct", "speedPct", "flatAttack", "flatMagic", "flatSpeed", "convMagicRate", "convSpeedRate", "dmgPct", "special"].concat(extraTsvFields("buff"), ["extraEffects", "note"]),
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
      extraEffects: serializeAdditionalEffectsText(r.extraEffects),
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
    ["enabled", "optimizerFixed", "optimizerExcluded", "slot", "name", "tags", "attack", "magic", "speed", "delay", "weaponDamage", "weaponWeight", "weaponAttackInterval", "weaponRange", "weaponDurability", "weaponTwoHanded", "weaponReqText"].concat(extraTsvFields("base"), ["equipBuffEnabled", "equipBuffSlot", "equipBuffName", "equipBuffAttackPct", "equipBuffMagicPct", "equipBuffSpeedPct", "equipBuffFlatAttack", "equipBuffFlatMagic", "equipBuffFlatSpeed", "equipBuffConvMagicRate", "equipBuffConvSpeedRate", "equipBuffDmgPct", "equipBuffSpecial"], extraTsvFields("equipBuff"), ["equipBuffNote", "extraEffects", "note"]),
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
      extraEffects: serializeAdditionalEffectsText(r.extraEffects),
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
      extraEffects: parseAdditionalEffectsText(r.extraEffects || r.additionalEffects || ""),
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
      extraEffects: parseAdditionalEffectsText(r.extraEffects || r.additionalEffects || ""),
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
function presetConfigLooksUsable(value) {
  const cfg = value?.config || value;
  return !!(cfg && typeof cfg === "object" && cfg.inputs && cfg.state);
}

function presetConfigFingerprint(value) {
  const cfg = value?.config || value;
  if (!presetConfigLooksUsable(cfg)) return "";
  try { return JSON.stringify(cfg); } catch { return ""; }
}

function normalizeNamedPresetMap(raw, sourceLabel="") {
  const out = {};
  if (!raw || typeof raw !== "object") return out;

  Object.entries(raw).forEach(([name, value]) => {
    if (!name) return;
    if (presetConfigLooksUsable(value)) {
      out[name] = value.config ? value : {savedAt: value.savedAt || "", config: value};
    }
  });

  if (Array.isArray(raw.presets)) {
    raw.presets.forEach((entry, idx) => {
      const name = entry?.name || entry?.title || `復旧プリセット${idx + 1}`;
      const value = entry?.preset || entry?.value || entry;
      if (presetConfigLooksUsable(value)) {
        out[name] = value.config ? value : {savedAt: value.savedAt || "", config: value};
      }
    });
  }

  if (raw.namedPresets && typeof raw.namedPresets === "object") {
    Object.assign(out, normalizeNamedPresetMap(raw.namedPresets, sourceLabel));
  }

  if (raw.config && presetConfigLooksUsable(raw.config)) {
    const name = raw.name || raw.title || sourceLabel || "復旧プリセット";
    out[name] = {savedAt: raw.savedAt || "", config: raw.config};
  }

  return out;
}

function mergeNamedPresets(found, preferExisting=true) {
  let added = 0;
  let skipped = 0;
  const existingFingerprints = new Set(Object.values(namedPresets).map(presetConfigFingerprint).filter(Boolean));

  Object.entries(found || {}).forEach(([name, preset]) => {
    if (!presetConfigLooksUsable(preset)) return;
    const fp = presetConfigFingerprint(preset);
    if (fp && existingFingerprints.has(fp)) {
      skipped++;
      return;
    }
    let finalName = name || "復旧プリセット";
    if (namedPresets[finalName] && preferExisting) {
      let i = 2;
      while (namedPresets[`${finalName} (${i})`]) i++;
      finalName = `${finalName} (${i})`;
    }
    namedPresets[finalName] = preset;
    if (fp) existingFingerprints.add(fp);
    added++;
  });
  return {added, skipped};
}

function scanLocalStorageForPresets() {
  const found = {};
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
  } catch {
    return {found, scanned: 0};
  }

  keys.forEach(key => {
    let parsed = null;
    const raw = localStorage.getItem(key);
    if (!raw || !/moe|damage|preset|share|config|snapshot/i.test(key + " " + raw.slice(0, 200))) return;
    try { parsed = JSON.parse(raw); } catch { return; }

    const fromMap = normalizeNamedPresetMap(parsed, key);
    Object.entries(fromMap).forEach(([name, preset]) => {
      const label = key === NAMED_PRESET_KEY ? name : `${name}［${key}］`;
      found[label] = preset;
    });

    if (presetConfigLooksUsable(parsed)) {
      found[`保存構成［${key}］`] = {savedAt: parsed.savedAt || "", config: parsed.config || parsed};
    }
    if (parsed?.state && parsed?.inputs) {
      found[`保存構成［${key}］`] = {savedAt: parsed.savedAt || "", config: parsed};
    }
  });

  return {found, scanned: keys.length};
}

function setPresetStatus(message, type="") {
  const el = byId("presetStatus");
  if (!el) return;
  el.textContent = message || "";
  el.className = `small presetStatus ${type}`.trim();
}

/* 名前付きプリセットをlocalStorageから読む。 */
function loadNamedPresetsFromStorage() {
  let loaded = {};
  try {
    loaded = normalizeNamedPresetMap(JSON.parse(localStorage.getItem(NAMED_PRESET_KEY) || "{}"), NAMED_PRESET_KEY);
  } catch {
    loaded = {};
  }
  namedPresets = loaded || {};

  if (!Object.keys(namedPresets).length) {
    const scan = scanLocalStorageForPresets();
    const candidates = normalizeNamedPresetMap(scan.found, "自動検出");
    if (Object.keys(candidates).length) {
      mergeNamedPresets(candidates, true);
      setPresetStatus(`保存済みプリセットが見つかりました。${Object.keys(namedPresets).length}件を表示しています。必要なら「プリセットをバックアップ」を押してください。`, "ok");
      return;
    }
  }

  const count = Object.keys(namedPresets).length;
  setPresetStatus(count ? `保存済みプリセット: ${count}件` : "保存済みプリセットはまだありません。以前の保存が見えない場合は「保存データを探す」を押してください。", count ? "ok" : "");
}
/* 名前付きプリセットをlocalStorageへ保存する。 */
function saveNamedPresetsToStorage() {
  try {
    localStorage.setItem(NAMED_PRESET_KEY + "_backup_" + new Date().toISOString().slice(0,10), JSON.stringify(namedPresets));
  } catch {}
  localStorage.setItem(NAMED_PRESET_KEY, JSON.stringify(namedPresets));
  setPresetStatus(`保存済みプリセット: ${Object.keys(namedPresets).length}件`, "ok");
}
/* 保存済みプリセットselectを更新する。 */
function renderPresetSelect() {
  const sel = byId("presetSelect");
  if (!sel) return;
  const names = Object.keys(namedPresets).sort((a,b) => a.localeCompare(b, "ja"));
  sel.innerHTML = names.length
    ? names.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join("")
    : `<option value="">保存済みなし</option>`;
  setPresetStatus(names.length ? `保存済みプリセット: ${names.length}件` : "保存済みプリセットはまだありません。", names.length ? "ok" : "");
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
  setPresetStatus(`「${name}」を保存しました。`, "ok");
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
  try {
    localStorage.setItem(NAMED_PRESET_KEY + "_before_delete_" + new Date().toISOString(), JSON.stringify(namedPresets));
  } catch {}
  delete namedPresets[name];
  saveNamedPresetsToStorage();
  renderPresetSelect();
  setPresetStatus(`「${name}」を削除しました。`, "warn");
}


function recoverNamedPresets() {
  const scan = scanLocalStorageForPresets();
  const candidates = normalizeNamedPresetMap(scan.found, "手動復旧");
  const result = mergeNamedPresets(candidates, true);
  if (result.added > 0) {
    saveNamedPresetsToStorage();
    renderPresetSelect();
    setPresetStatus(`保存データから ${result.added}件 復旧しました。`, "ok");
  } else {
    setPresetStatus(`復旧できる追加プリセットは見つかりませんでした。確認した保存データ: ${scan.scanned}件`, "warn");
  }
}

function exportNamedPresets() {
  const payload = {
    type: "moeDamageNamedPresetsBackup",
    version: 1,
    exportedAt: new Date().toISOString(),
    namedPresets
  };
  byId("configBox").value = JSON.stringify(payload, null, 2);
  setPresetStatus("プリセットのバックアップを下の欄に出力しました。コピーして保存してください。", "ok");
}

function importNamedPresets() {
  try {
    const parsed = JSON.parse(byId("configBox").value || "{}");
    const found = normalizeNamedPresetMap(parsed, "バックアップ");
    const result = mergeNamedPresets(found, true);
    if (!Object.keys(found).length) {
      alert("読み込めるプリセットが見つかりません。");
      return;
    }
    saveNamedPresetsToStorage();
    renderPresetSelect();
    setPresetStatus(`バックアップから ${result.added}件 追加しました。`, "ok");
  } catch (e) {
    alert("プリセットバックアップの読み込みに失敗: " + e.message);
  }
}


/* JSON形式で現在構成をテキストエリアへ出力する。 */
function exportConfig() {
  byId("configBox").value = JSON.stringify(collectConfig(), null, 2);
}
/* テキストエリアのJSONを読み込む。 */
function importConfig() {
  try {
    const ok = applyConfig(JSON.parse(byId("configBox").value));
    if (!ok) return;
  } catch (e) {
    setImportStatus("JSONの読み込みに失敗しました: " + e.message, "warn");
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
    const ok = applyConfig(parseConfigFromTsv(byId("configBox").value));
    if (!ok) return;
  } catch (e) {
    setImportStatus("TSVの読み込みに失敗しました: " + e.message, "warn");
    alert("TSVの読み込みに失敗: " + e.message);
  }
}


function equipmentOnlyHeaders() {
  return ["enabled", "optimizerFixed", "optimizerExcluded", "slot", "name", "tags", "attack", "magic", "speed", "weaponDamage", "weaponWeight", "weaponAttackInterval", "weaponRange", "weaponDurability", "weaponTwoHanded", "weaponReqText"]
    .concat(extraTsvFields("base"), ["equipBuffEnabled", "equipBuffSlot", "equipBuffName", "equipBuffAttackPct", "equipBuffMagicPct", "equipBuffSpeedPct", "equipBuffFlatAttack", "equipBuffFlatMagic", "equipBuffFlatSpeed", "equipBuffConvMagicRate", "equipBuffConvSpeedRate", "equipBuffDmgPct", "equipBuffSpecial"], extraTsvFields("equipBuff"), ["equipBuffNote", "extraEffects", "note"]);
}

function equipmentOnlyRows(rows=null) {
  return normalizeEquipmentRows(rows || state.equipment).map(r => ({
    enabled: boolToCell(r.enabled !== false),
    optimizerFixed: boolToCell(r.optimizerFixed),
    optimizerExcluded: boolToCell(r.optimizerExcluded),
    slot: r.slot || "",
    name: r.name || "",
    tags: r.tags || "",
    attack: r.attack ?? 0,
    magic: r.magic ?? 0,
    speed: r.speed ?? 0,
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
    extraEffects: serializeAdditionalEffectsText(r.extraEffects),
    note: r.note || ""
  }));
}

function equipmentFromTsvRows(rows) {
  return rows.map(r => ({
    enabled: r.enabled === undefined || r.enabled === "" ? true : cellToBool(r.enabled),
    optimizerFixed: cellToBool(r.optimizerFixed || r.optimizerFix || r.fixedInOptimizer || r.searchFixed),
    optimizerExcluded: cellToBool(r.optimizerExcluded || r.optimizerExclude || r.excludeFromOptimizer || r.searchExcluded),
    slot: r.slot || "",
    name: r.name || "",
    tags: r.tags || r.tag || "",
    attack: cellToNum(r.attack),
    magic: cellToNum(r.magic),
    speed: cellToNum(r.speed),
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
    extraEffects: parseAdditionalEffectsText(r.extraEffects || r.additionalEffects || ""),
    note: r.note || ""
  }));
}

function parsePlainTsvRows(text) {
  const lines = String(text || "").split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith("#"));
  if (lines[0] && /^\[[^\]]+\]$/.test(lines[0].trim())) return null;
  if (lines.length < 2) return [];
  const headers = lines[0].split("\t").map(tsvUnescape);
  return lines.slice(1).map(line => {
    const cells = line.split("\t").map(tsvUnescape);
    const obj = {};
    headers.forEach((h, i) => obj[h] = cells[i] ?? "");
    return obj;
  });
}

function exportEquipmentOnlyTsv() {
  byId("equipmentImportExportBox").value = makeTsvSection("equipment", equipmentOnlyHeaders(), equipmentOnlyRows());
}

function exportEquipmentOnlyJson() {
  byId("equipmentImportExportBox").value = JSON.stringify({equipment: normalizeEquipmentRows(state.equipment)}, null, 2);
}

function exportEquipmentTemplateTsv() {
  const sample = [{
    enabled:"1", optimizerFixed:"0", optimizerExcluded:"0", slot:"武器: 右手", name:"サンプル武器", tags:"",
    attack:0, magic:0, speed:0, weaponDamage:100, weaponWeight:15, weaponAttackInterval:250, weaponRange:4.5, weaponDurability:32,
    weaponTwoHanded:"○", weaponReqText:"こんぼう:100;筋力:100",
    equipBuffEnabled:"1", equipBuffSlot:"1", equipBuffName:"サンプル装備Buff", equipBuffAttackPct:0, equipBuffMagicPct:0, equipBuffSpeedPct:0,
    equipBuffFlatAttack:0, equipBuffFlatMagic:0, equipBuffFlatSpeed:0, equipBuffConvMagicRate:0, equipBuffConvSpeedRate:0, equipBuffDmgPct:10, equipBuffSpecial:1,
    equipBuffNote:"", extraEffects:"skillPlus|こんぼう|3||display|; elementDamagePct|火属性|10|%|display|", note:""
  }];
  const rows = sample.map(r => ({...Object.fromEntries(equipmentOnlyHeaders().map(h => [h, ""])), ...r}));
  byId("equipmentImportExportBox").value = [
    "# 装備登録だけを読み込むTSVテンプレート",
    "# 使い方: このTSVを表計算ソフトに貼り付け、行を増やしてからこの欄に戻して「装備を読み込み」します。",
    "# slot例: 武器: 右手 / 武器: 左手 / 武器: 弾丸 / 防具: 頭 / 防具: 胴 / 装飾: 指",
    "# 攻撃力・魔力・速度は attack / magic / speed に入ります。ツール上では詳細内の装備本体ステータスとして表示されます。",
    "# 表示用追加効果 extraEffects 例: skillPlus|こんぼう|3||display|; elementDamagePct|火属性|10|%|display|",
    "# extraEffectsのkey例: skillPlus / elementDamagePct / custom",
    makeTsvSection("equipment", equipmentOnlyHeaders(), rows)
  ].join("\n");
}

function importEquipmentOnly() {
  const text = byId("equipmentImportExportBox").value;
  try {
    let rows;
    const trimmed = String(text || "").trim();
    if (!trimmed) return alert("読み込む装備データを貼り付けてください。");
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      const parsed = JSON.parse(trimmed);
      rows = Array.isArray(parsed) ? parsed : parsed.equipment;
    } else {
      const plain = parsePlainTsvRows(text);
      rows = plain || (parseTsvSections(text).equipment?.rows || []);
      rows = equipmentFromTsvRows(rows);
    }
    if (!Array.isArray(rows)) throw new Error("equipment配列または[equipment]セクションが見つかりません。");
    if (!confirm("現在の装備登録を、貼り付けた装備データで置き換えます。よろしいですか？")) return;
    state.equipment = normalizeEquipmentRows(rows);
    renderEquipmentTable();
    renderTagLinkSummary();
    renderShowcaseTab();
    calc();
  } catch (e) {
    alert("装備データの読み込みに失敗: " + e.message);
  }
}

function compositeOnlyHeaders() {
  return ["enabled", "slot", "name", "tags", "attackPct", "magicPct", "speedPct", "flatAttack", "flatMagic", "flatSpeed", "convMagicRate", "convSpeedRate", "dmgPct", "special"]
    .concat(extraTsvFields("buff"), ["extraEffects", "note"]);
}

function compositeOnlyRows(rows=null) {
  return normalizeCompositeRows(rows || state.composite).map(r => ({
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
    extraEffects: serializeAdditionalEffectsText(r.extraEffects),
    note: r.note || ""
  }));
}

function compositeFromTsvRows(rows) {
  return rows.map(r => ({
    enabled: r.enabled === undefined || r.enabled === "" ? true : cellToBool(r.enabled),
    slot: r.slot === undefined || r.slot === "" ? true : cellToBool(r.slot),
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
    dmgPct: cellToNum(r.dmgPct),
    special: r.special === undefined || r.special === "" ? 1 : cellToNum(r.special),
    ...extraTsvParseFields(r, "buff"),
    extraEffects: parseAdditionalEffectsText(r.extraEffects || r.additionalEffects || ""),
    note: r.note || ""
  }));
}

function exportBuffOnlyTsv() {
  byId("buffImportExportBox").value = [
    makeTsvSection("composite", compositeOnlyHeaders(), compositeOnlyRows()),
    makeTsvSection("post", ["enabled", "slot", "name", "tags", "value", "note"], (state.post || []).map(r => ({
      enabled: boolToCell(r.enabled), slot: boolToCell(r.slot), name:r.name || "", tags:r.tags || "", value:r.value ?? 1, note:r.note || ""
    }))),
    makeTsvSection("other", ["enabled", "name", "tags", "note"], (state.other || []).map(r => ({
      enabled: boolToCell(r.enabled), name:r.name || "", tags:r.tags || "", note:r.note || ""
    })))
  ].join("\n");
}

function exportBuffOnlyJson() {
  byId("buffImportExportBox").value = JSON.stringify({
    composite: normalizeCompositeRows(state.composite),
    post: state.post || [],
    other: state.other || []
  }, null, 2);
}

function exportBuffTemplateTsv() {
  const sampleComposite = [{
    enabled:"1", slot:"1", name:"サンプルBuff", tags:"", attackPct:15, magicPct:0, speedPct:0, flatAttack:0, flatMagic:0, flatSpeed:0,
    convMagicRate:0, convSpeedRate:0, dmgPct:10, special:1, extraEffects:"skillPlus|こんぼう|3||display|; elementDamagePct|火属性|10|%|display|", note:""
  }];
  const rows = sampleComposite.map(r => ({...Object.fromEntries(compositeOnlyHeaders().map(h => [h, ""])), ...r}));
  byId("buffImportExportBox").value = [
    "# Buff登録だけを読み込むTSVテンプレート",
    "# 使い方: composite=通常Buff / post=外枠補正 / other=枠だけ数えるBuff",
    "# %欄は10%なら10。specialは倍率なので1.1倍なら1.1。",
    "# 表示用追加効果 extraEffects 例: skillPlus|戦闘技術|3||display|; elementDamagePct|火属性|10|%|display|",
    "# extraEffectsのkey例: skillPlus / elementDamagePct / custom",
    makeTsvSection("composite", compositeOnlyHeaders(), rows),
    makeTsvSection("post", ["enabled", "slot", "name", "tags", "value", "note"], [
      {enabled:"1", slot:"0", name:"サンプル外枠補正", tags:"", value:1.1, note:"最後に1.1倍"}
    ]),
    makeTsvSection("other", ["enabled", "name", "tags", "note"], [
      {enabled:"1", name:"サンプルその他バフ", tags:"", note:"枠だけ数える"}
    ])
  ].join("\n");
}

function importBuffOnly() {
  const text = byId("buffImportExportBox").value;
  try {
    const trimmed = String(text || "").trim();
    if (!trimmed) return alert("読み込むBuffデータを貼り付けてください。");
    let composite, post, other;
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) composite = parsed;
      else {
        composite = parsed.composite;
        post = parsed.post;
        other = parsed.other;
      }
    } else {
      const plain = parsePlainTsvRows(text);
      if (plain) {
        composite = compositeFromTsvRows(plain);
      } else {
        const sections = parseTsvSections(text);
        composite = compositeFromTsvRows(sections.composite?.rows || []);
        post = (sections.post?.rows || []).map(r => ({
          enabled: r.enabled === undefined || r.enabled === "" ? true : cellToBool(r.enabled),
          slot: r.slot === undefined || r.slot === "" ? true : cellToBool(r.slot),
          name: r.name || "", tags: r.tags || r.tag || "", value: cellToNum(r.value) || 1, note: r.note || ""
        }));
        other = (sections.other?.rows || []).map(r => ({
          enabled: r.enabled === undefined || r.enabled === "" ? true : cellToBool(r.enabled),
          name: r.name || "", tags: r.tags || r.tag || "", note: r.note || ""
        }));
      }
    }
    if (!Array.isArray(composite)) throw new Error("composite配列または[composite]セクションが見つかりません。");
    if (!confirm("現在のBuff登録を、貼り付けたBuffデータで置き換えます。よろしいですか？")) return;
    state.composite = normalizeCompositeRows(composite);
    if (Array.isArray(post)) state.post = post;
    if (Array.isArray(other)) state.other = other;
    renderCompositeTable();
    renderNumericTable("post");
    renderOtherTable();
    renderTagLinkSummary();
    renderShowcaseTab();
    calc();
  } catch (e) {
    alert("Buffデータの読み込みに失敗: " + e.message);
  }
}

/* localStorageの現在構成を削除し、初期状態へ戻す。 */
function setImportStatus(message, type="") {
  const el = byId("importStatus");
  if (!el) return;
  el.textContent = message || "";
  el.className = `small importStatus ${type}`.trim();
}

function resetConfig() {
  if (!confirm("現在の入力内容を初期状態に戻しますか？保存済みプリセットは削除しません。")) return;
  localStorage.removeItem("moeDamageSimShortShareUrlShowcase");
  state = DEFAULT_STATE();
  renderAll();
  calc();
  setImportStatus("入力内容を初期状態に戻しました。保存済みプリセットは残っています。", "ok");
}

// stateだけのJSONにも対応します。
function normalizeImportedConfig(raw) {
  if (!raw || typeof raw !== "object") return null;

  if (raw.config && raw.config.inputs && raw.config.state) return raw.config;
  if (raw.preset && raw.preset.inputs && raw.preset.state) return raw.preset;
  if (raw.value && raw.value.inputs && raw.value.state) return raw.value;

  if (raw.inputs && raw.state) return raw;

  const stateLikeKeys = ["weaponReq", "skillSim", "equipment", "composite", "pct", "flat", "conv", "dmg", "special", "post", "other"];
  if (stateLikeKeys.some(k => raw[k] !== undefined)) {
    return {inputs: collectInputs(), state: raw};
  }

  if (raw.namedPresets && typeof raw.namedPresets === "object") {
    const first = Object.values(raw.namedPresets).find(presetConfigLooksUsable);
    if (first) return first.config || first;
  }

  return null;
}

function sanitizeImportedRows(rows) {
  return Array.isArray(rows)
    ? rows.filter(r => r && typeof r === "object" && r.source !== "skillSimMastery")
    : [];
}

/* JSON/TSV/プリセットから復元したconfigを画面とstateへ適用する。 */
function applyConfig(cfg) {
  const normalized = normalizeImportedConfig(cfg);
  if (!normalized || !normalized.inputs || !normalized.state) {
    setImportStatus("読み込める設定データが見つかりませんでした。JSON/TSVの内容を確認してください。", "warn");
    return false;
  }

  try {
    setInputs(normalized.inputs || {});
    const incoming = normalized.state || {};
    state = DEFAULT_STATE();

    state.weaponReq = normalizeWeaponReqRows(incoming.weaponReq, normalized.inputs || {});
    state.skillSim = normalizeSkillSim(incoming.skillSim);
    state.composite = Array.isArray(incoming.composite) ? normalizeCompositeRows(incoming.composite) : state.composite;
    state.equipment = normalizeEquipmentRows(incoming.equipment);

    // 旧形式のBuff/補正も捨てずに保持します。
    // UIが非表示の行でも、古いJSON/TSVやプリセットの計算再現性を優先します。
    state.pct = sanitizeImportedRows(incoming.pct);
    state.flat = sanitizeImportedRows(incoming.flat);
    state.conv = sanitizeImportedRows(incoming.conv);
    state.dmg = sanitizeImportedRows(incoming.dmg);
    state.special = sanitizeImportedRows(incoming.special);
    state.post = sanitizeImportedRows(incoming.post);
    state.other = sanitizeImportedRows(incoming.other);

    state.conv = (state.conv || []).map(r => ({
      ...r,
      baseOffset: r.baseOffset !== undefined ? (+r.baseOffset || 0) : (r.offset !== undefined ? 0 : inferConversionBaseOffset(r)),
      offset: r.offset !== undefined ? (+r.offset || 0) : 0
    }));

    renderAll();
    syncSkillSimToCalcInputs(false, false);
    calc();
    setImportStatus("設定を読み込みました。", "ok");
    return true;
  } catch (e) {
    console.error(e);
    setImportStatus("設定の読み込み中にエラーが出ました: " + (e?.message || e), "warn");
    alert("設定の読み込み中にエラーが出ました: " + (e?.message || e));
    return false;
  }
}
