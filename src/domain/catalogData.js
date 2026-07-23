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
    script.src = src;
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
    script.src = src;
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
