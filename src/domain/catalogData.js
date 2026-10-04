const CATALOG_SCRIPT_URLS = [
  "src/data/generated/equipmentCatalog.generated.js",
  "src/data/generated/ammoCatalog.generated.js",
  "src/data/generated/buffCatalog.generated.js",
  "src/data/generated/wikiEquipBuffEffects.generated.js",
  "src/data/generated/equipBuffRuleCandidates.generated.js",
  "src/data/generated/skillBuffCompatibility.generated.js",
  "src/data/generated/damageBuffCompatibility.generated.js",
  "src/data/manual/buffRules.manual.js"
];
let catalogScriptsPromise = null;
let equipmentBuffRuntimeScriptsPromise = null;

const EQUIPMENT_BUFF_RUNTIME_SCRIPT_URLS = [
  "src/data/generated/equipBuffRuleCandidates.generated.js",
  "src/data/generated/skillBuffCompatibility.generated.js",
  "src/data/generated/damageBuffCompatibility.generated.js"
];

function catalogGlobalsReady() {
  const equipmentReady = Array.isArray(window.MOE_EQUIPMENT_CATALOG_GENERATED) ||
    Array.isArray(window.MOE_EQUIPMENT_CATALOG) ||
    Array.isArray(window.MOE_EQUIPMENT_CATALOG_MANUAL);
  const ammoReady = Array.isArray(window.MOE_AMMO_CATALOG_GENERATED);
  return equipmentReady && ammoReady;
}

function loadCatalogScriptsOnce() {
  if (catalogScriptsPromise) return catalogScriptsPromise;
  catalogScriptsPromise = Promise.all(CATALOG_SCRIPT_URLS.map(src => new Promise(resolve => {
    if (document.querySelector(`script[data-catalog-src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = `${src}?v=${src === "src/data/generated/equipmentCatalog.generated.js" ? "20261004-status-snapshot" : src === "src/data/manual/buffRules.manual.js" ? "20261004-mana-overdrive" : "1.24.12-pet-20261003"}`;
    script.async = false;
    script.dataset.catalogSrc = src;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  }))).then(() => true).catch(() => false);
  return catalogScriptsPromise;
}

function loadEquipmentBuffRuntimeScriptsOnce() {
  if (equipmentBuffRuntimeScriptsPromise) return equipmentBuffRuntimeScriptsPromise;
  equipmentBuffRuntimeScriptsPromise = Promise.all(EQUIPMENT_BUFF_RUNTIME_SCRIPT_URLS.map(src => new Promise(resolve => {
    if (document.querySelector(`script[data-catalog-src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = `${src}?v=1.24.12`;
    script.async = false;
    script.dataset.catalogSrc = src;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  }))).then(() => true).catch(() => false);
  return equipmentBuffRuntimeScriptsPromise;
}

function catalogArray(...names) {
  const out = [];
  names.forEach(name => {
    const arr = window[name];
    if (Array.isArray(arr)) out.push(...arr);
  });
  return out;
}

function equipmentCatalogItems() {
  const raw = catalogArray("MOE_EQUIPMENT_CATALOG_MANUAL", "MOE_EQUIPMENT_CATALOG", "MOE_EQUIPMENT_CATALOG_GENERATED", "MOE_AMMO_CATALOG_GENERATED");
  const seen = new Set();
  const out = [];
  raw.forEach(item => {
    if (!item) return;
    const key = item.catalogId || item.id || `${item.category || "item"}:${item.officialId || item.name}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(item);
  });
  return out;
}

function buffCatalogItems() {
  const raw = catalogArray("MOE_BUFF_CATALOG_MANUAL", "MOE_BUFF_CATALOG", "MOE_BUFF_CATALOG_GENERATED");
  const seen = new Set();
  const out = [];
  raw.forEach(item => {
    if (!item) return;
    const key = item.catalogId || item.id || item.officialTechnicId || item.name;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(item);
  });
  return out;
}

let equipBuffRuleCandidateItemsCache = null;
let equipBuffRuleCandidateSourceRefs = null;

function equipBuffRuleCandidateItems() {
  // __MOE_MANUAL_BUFF_RULES_PRIORITY_FIX_V1__
  // verified/manual rules must override generated candidates with the same key.
  const sourceRefs = [
    window.MOE_BUFF_RULES_MANUAL,
    window.MOE_EQUIP_BUFF_RULE_CANDIDATES_MANUAL,
    window.MOE_EQUIP_BUFF_RULE_CANDIDATES,
    window.MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED
  ];
  if (
    equipBuffRuleCandidateItemsCache
    && equipBuffRuleCandidateSourceRefs
    && sourceRefs.every((source, index) => source === equipBuffRuleCandidateSourceRefs[index])
  ) {
    return equipBuffRuleCandidateItemsCache;
  }

  const generated = catalogArray(
    "MOE_EQUIP_BUFF_RULE_CANDIDATES_MANUAL",
    "MOE_EQUIP_BUFF_RULE_CANDIDATES",
    "MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED"
  );

  const manualItems = [];
  const manual = window.MOE_BUFF_RULES_MANUAL;
  if (manual && typeof manual === "object") {
    Object.entries(manual).forEach(([catalogId, rule]) => {
      if (!rule || typeof rule !== "object") return;
      manualItems.push({
        catalogId,
        id: catalogId,
        ...rule,
        source: rule.source || "manual"
      });
    });
  }

  const seen = new Set();
  const out = [];

  [...manualItems, ...generated].forEach(item => {
    if (!item) return;
    const key = item.catalogId || item.id || item.officialTechnicId || item.name;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(item);
  });

  equipBuffRuleCandidateSourceRefs = sourceRefs;
  equipBuffRuleCandidateItemsCache = out;
  return equipBuffRuleCandidateItemsCache;
}

// Shared catalog-to-equipment conversion. No DOM access; used by registration and v2.
function catalogFindBuffById(id) {
  const key = String(id || "");
  if (!key) return null;
  return buffCatalogItems().find(b => String(b.id || "") === key || String(b.officialTechnicId || "") === key || String(b.catalogId || "") === key) || null;
}

function catalogEquipmentToRow(item, quality=null) {
  if (quality !== null) item = catalogItemWithQuality(item, quality);
  const slot = item.slot || idbMapSlot(`${item.equip || ""} ${item.name || ""}`) || "防具: 頭";
  const row = defaultEquipmentCandidate(slot, false);
  row.enabled = false;
  row.name = (item.name || "カタログ装備") + (item.catalogQuality === "HG_MG" ? "（HG/MG）" : "");
  row.catalogQuality = item.catalogQuality === "HG_MG" ? "HG_MG" : "raw";
  row.importSource = "catalog";
  row.importedFromCatalog = true;
  row.catalogId = item.catalogId || item.id || "";
  row.officialId = item.officialId || "";
  row.importUrl = item.sourceUrl || "";
  row.note = [item.info, item.sourceUrl ? `公式DB: ${item.sourceUrl}` : "", item.verified === false ? "未検証カタログ候補" : ""].filter(Boolean).join("\n");

  if (row.catalogQuality === "HG_MG") row.note += "\n品質補正 HG/MG：NG基準の武器ダメージ・防具本体ACを1.1倍（追加効果は補正しない）";

  if (item.category === "weapon") {
    row.weaponDamage = +item.weaponDamage || 0;
    row.weaponAttackInterval = +item.weaponAttackInterval || 0;
    row.weaponRange = +item.weaponRange || 0;
    row.weaponDurability = +item.weaponDurability || 0;
    row.weaponTwoHanded = /2HAND|両手/i.test(item.weaponHand || item.equip || "") ? "○" : "×";
    if (Array.isArray(item.weaponReq)) row.weaponReq = item.weaponReq;
    else if (item.requiredSkill || item.needLevel) row.weaponReq = idbWeaponReqsFromText(String(item.requiredSkill || ""), +item.needLevel || 0);
  }

  const structuredStatuses = Array.isArray(item.addStatuses) ? item.addStatuses : [];
  if (structuredStatuses.length) {
    structuredStatuses.forEach(st => idbApplyStructuredStatus(row, st.name, st.value, st.statKey));
  } else if (item.extraStats && typeof item.extraStats === "object") {
    // generated catalog normally contains both addStatuses and normalized extraStats for the same official add_status rows.
    // Applying both doubles imported equipment effects, so extraStats is only a fallback when structured addStatuses are absent.
    Object.entries(item.extraStats).forEach(([prop, value]) => {
      if (prop in row) row[prop] = +(row[prop] || 0) + (+value || 0);
    });
  }
  if (item.category !== "weapon" && +item.armorClass) row.extraAC = +(row.extraAC || 0) + (+item.armorClass || 0);
  if (item.category !== "weapon") {
    row.armorBaseAC = +item.armorClass || 0;
    row.armorRequirements = item.requirements || idbWeaponReqsFromText(item.requiredSkill || "", +item.needLevel || 0);
  }

  const buff = item.equipBuff?.name ? item.equipBuff : (item.buffRefs || []).map(catalogFindBuffById).find(Boolean);
  if (buff?.name) {
    idbSetEquipmentBuff(row, buff.name, buff.info || buff.note || "");
    row.equipBuffCatalogId = buff.catalogId || buff.id || "";
    row.equipBuffTechnicId = buff.officialTechnicId || item.technicId || "";
    row.equipBuffConflictGroup = "";
    row.equipBuffStackRule = "same-technic";
    const candidate = findEquipBuffRuleCandidate(buff, item);
    if (candidate) applyEquipBuffRuleCandidateToEquipment(row, candidate);
    applySkillBuffCompatibilityToEquipment(row, buff, item);
    applyDamageBuffCompatibilityToEquipment(row, buff, item);
    if (!row.equipBuffWikiText && (buff.info || buff.note)) row.equipBuffWikiText = buff.info || buff.note || "";
  }

  restoreEquipmentBuffCompatibilityGroups(row, item);
  sanitizeGenericAttackConversionConflict(row);
  return normalizeEquipmentCandidate(row);
}
