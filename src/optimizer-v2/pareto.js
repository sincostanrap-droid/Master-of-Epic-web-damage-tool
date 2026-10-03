/* Phase 2: conservative, context-free componentwise dominance. No game formulas.
 * Input is a Phase 1 snapshot, including sources. Unknown semantics fail closed.
 */
(function (global) {
  "use strict";
  const AXES = Object.freeze([
    {field:"attack", direction:"maximize"},
    {field:"extraAC", direction:"maximize"},
    {field:"extraCritRatePct", direction:"maximize"},
    {field:"extraAttackDelay", direction:"minimize"},
    {field:"weaponDamage", direction:"maximize"},
    {field:"weaponAttackInterval", direction:"minimize"}
  ].map(Object.freeze));
  const axisNames = new Set(AXES.map(axis => axis.field));
  const candidateFields = new Set(("schemaVersion candidateId catalogId name slot evaluationSlot category quality " +
    "qualityAvailability weaponType weaponHand twoHanded ammoKind weaponDamage attackInterval armorClass ac " +
    "requirements modifiers criticalRate attackDelay damageModifiers skillPlus equipmentBuff effects sourceRef evaluationFields").split(" "));
  const sourceFields = new Set(("catalogId id officialId category categoryLabel name info slot equip equipGender equipRace " +
    "itemType requiredSkill needLevel armorClass weaponDamage weaponAttackInterval weaponRange weaponWeight weaponDurability " +
    "weaponType weaponHand requirements weaponReq technicId addStatuses addStatusText unmappedAddStatuses extraStats " +
    "buffRefs equipBuff source sourceUrl sourceSheetUrl fetchedAt updatedAt verified ammoKind note").split(" "));
  const rowMetadata = new Set(("slot name enabled catalogQuality importSource importedFromCatalog catalogId officialId " +
    "importUrl note weaponReq weaponTwoHanded weaponWeight weaponRange weaponDurability armorBaseAC armorRequirements").split(" "));
  const provenance = new Set("catalogId id officialId name categoryLabel source sourceUrl sourceSheetUrl fetchedAt updatedAt verified".split(" "));
  const sourceNumeric = new Set(["armorClass", "weaponDamage", "weaponAttackInterval", "requirements", "weaponReq", "requiredSkill", "needLevel", "extraStats", "addStatuses"]);
  const statusFields = new Set("statusId name normalizedName statKey statLabel value mapped ignored".split(" "));
  const active = value => value !== undefined && value !== null && value !== "" && value !== false && value !== 0
    && !(Array.isArray(value) && !value.length) && !(value && typeof value === "object" && !Object.keys(value).length);
  const canonical = value => JSON.stringify(sort(value));
  function sort(value) {
    if (Array.isArray(value)) return value.map(sort);
    if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(k => [k, sort(value[k])]));
    return value;
  }
  function without(object, keys) {
    return Object.fromEntries(Object.entries(object || {}).filter(([key]) => !keys.has(key)));
  }
  function requirements(rows) {
    if (!Array.isArray(rows)) return null;
    const out = Object.create(null);
    for (const row of rows) {
      if (!row || Object.keys(row).some(k => !["name", "required", "current"].includes(k))
        || typeof row.name !== "string" || !row.name || !Number.isFinite(row.required) || row.required < 0
        || (active(row.current)) || typeof global.validSkillSimSkillName !== "function"
        || global.validSkillSimSkillName(row.name, "") !== row.name) return null;
      out[row.name] = Math.max(out[row.name] || 0, row.required);
    }
    return out;
  }
  function prepare(candidate, source) {
    const reasons = [];
    const protect = reason => { if (!reasons.includes(reason)) reasons.push(reason); };
    const row = candidate?.evaluationFields || {};
    if (!candidate || candidate.schemaVersion !== 1 || !candidate.candidateId || !source || !candidate.evaluationFields) {
      protect("missing-or-unsupported-contract");
    }
    source = source || {};
    candidate = candidate || {};
    if (!candidate.slot || candidate.slot !== candidate.evaluationSlot || source.slot !== candidate.slot
      || !["weapon", "defense", "shield"].includes(candidate.category)) protect("unknown-role");
    if (candidate.qualityAvailability !== "catalog") protect("unverified-quality");
    if (Object.keys(candidate).some(k => !candidateFields.has(k))) protect("unknown-candidate-field");
    if (Object.keys(source).some(k => !sourceFields.has(k))) protect("unknown-source-field");
    // A description might contain a set bonus, trigger, or restriction. Do not infer that it is flavor text.
    if (active(source.info) || active(source.note)) protect("uninterpreted-description");
    if (active(source.unmappedAddStatuses)) protect("unmapped-status");
    if (active(source.equipBuff) || active(source.buffRefs) || active(source.technicId)
      || active(candidate.equipmentBuff?.refs) || active(candidate.equipmentBuff?.name)
      || active(candidate.equipmentBuff?.catalogId) || active(candidate.equipmentBuff?.technicId)
      || candidate.equipmentBuff?.enabled) protect("equipment-buff");
    if (active(candidate.effects) || active(candidate.skillPlus) || active(row.extraEffects)) protect("special-or-unknown-effect");
    for (const key of Object.keys(row)) {
      if (!axisNames.has(key) && !rowMetadata.has(key)) protect("unsupported-row-semantics");
    }
    for (const key of Object.keys(source.extraStats || {})) {
      if (!axisNames.has(key)) protect("unsupported-base-stat");
    }
    const statuses = Array.isArray(source.addStatuses) ? source.addStatuses : [];
    if (source.addStatuses != null && !Array.isArray(source.addStatuses)) protect("unsupported-status");
    for (const status of statuses) {
      if (!status || !axisNames.has(status.statKey) || !Number.isFinite(status.value)
        || status.mapped === false || status.ignored === true
        || Object.keys(status).some(k => !statusFields.has(k))) protect("unsupported-status");
    }
    const req = requirements(candidate.requirements);
    if (!req) protect("uncomparable-requirements");
    const sourceReq = source.requirements ?? source.weaponReq;
    if (sourceReq !== undefined && canonical(requirements(sourceReq)) !== canonical(req)) protect("uncomparable-requirements");
    if (sourceReq === undefined && (active(source.requiredSkill) || active(source.needLevel))) protect("uncomparable-requirements");
    const weapon = candidate.category === "weapon";
    if (weapon && canonical(requirements(row.weaponReq || [])) !== canonical(req)) protect("uncomparable-requirements");
    if (weapon && (!candidate.weaponType || (!candidate.weaponHand && !candidate.ammoKind))) protect("unknown-weapon-form");
    const values = Object.fromEntries(AXES.map(({field}) => [field, row[field] === undefined ? 0 : row[field]]));
    if (Object.values(values).some(v => typeof v !== "number" || !Number.isFinite(v))) protect("non-finite-axis");
    const rowSemantic = without(row, new Set([...axisNames, ...rowMetadata]));
    // A raw combined AC axis cannot compare body AC against unscaled bonuses.
    if(row.armorBaseAC && row.extraAC!==row.armorBaseAC)protect("armor-body-bonus-mixture");
    if(row.armorBaseAC<0)protect("negative-armor-body");
    // Stable, inspectable structure, not a lossy hash. All non-axis effects remain in the fingerprint.
    const semantics = {
      role:{slot:candidate.slot, category:candidate.category, weaponType:candidate.weaponType,
        weaponHand:candidate.weaponHand, twoHanded:candidate.twoHanded, ammoKind:candidate.ammoKind,
        quality:candidate.quality, qualityAvailability:candidate.qualityAvailability},
      source:without(source, new Set([...provenance, ...sourceNumeric])),
      statusSemantics:statuses.map(status => without(status, new Set(["value"]))),
      unknownCandidate:without(candidate, candidateFields),
      row:rowSemantic,
      armorKind:row.armorBaseAC?"body":"flat",
      multiArmorRequirements:row.armorBaseAC && Object.keys(req||{}).length>1?req:null,
      weaponInvariants:{weight:row.weaponWeight || 0, range:row.weaponRange || 0, durability:row.weaponDurability || 0,
        // Zero denotes missing/fallback weapon data, not an infinitely fast weapon.
        damagePresent:values.weaponDamage > 0, intervalPresent:values.weaponAttackInterval > 0,
        // Names participate in legacy projectile/ammo fallback inference. Freeze them for those roles.
        projectileName:(candidate.ammoKind || ["弓", "銃器"].includes(candidate.weaponType)) ? candidate.name : null},
      equipmentBuff:candidate.equipmentBuff, effects:candidate.effects, skillPlus:candidate.skillPlus,
      modifiers:without(candidate.modifiers?.equipmentBuff || {}, new Set()),
      damageModifiers:candidate.damageModifiers,
      // Lowering one of several requirements can LOWER the official weighted proficiency ratio.
      multiWeaponRequirements:weapon && Object.keys(req || {}).length > 1 ? req : null,
      weaponRequirementNames:weapon ? Object.keys(req || {}).sort() : null
    };
    return {candidate, values, req, fingerprint:canonical(semantics), reasons};
  }
  function comparePrepared(a, b) {
    if (a.reasons.length || b.reasons.length || a.fingerprint !== b.fingerprint) return null;
    const improvedAxes = [];
    for (const axis of AXES) {
      const av = a.values[axis.field], bv = b.values[axis.field];
      if (axis.direction === "maximize" ? av < bv : av > bv) return null;
      if (av !== bv) improvedAxes.push({axis:axis.field, direction:axis.direction, winner:av, removed:bv});
    }
    // An absent requirement is zero; skillPlus is deliberately not consulted.
    for (const name of new Set([...Object.keys(a.req), ...Object.keys(b.req)])) {
      if ((a.req[name] || 0) > (b.req[name] || 0)) return null;
    }
    if (!improvedAxes.length) return null; // Keep all equivalents, including identity/availability alternatives.
    return {rule:"strict-componentwise-v1", improvedAxes, requirements:{winner:a.req, removed:b.req},
      semanticFingerprintEqual:true};
  }
  function compare(a, b, sources) {
    return comparePrepared(prepare(a, sources?.[a?.sourceRef]), prepare(b, sources?.[b?.sourceRef]));
  }
  function reduce(snapshot, {context} = {}) {
    if (context && Object.keys(context).length) throw new Error("Context-dependent reduction is not supported in Phase 2");
    if (!Array.isArray(snapshot?.candidates) || !snapshot.sources) throw new Error("Phase 1 snapshot with sources required");
    const original = snapshot.candidates;
    if (new Set(original.map(c => c.candidateId)).size !== original.length) throw new Error("Duplicate candidateId");
    const prepared = original.map(c => prepare(c, snapshot.sources[c.sourceRef]));
    const groups = new Map(), removed = new Map(), retained = [];
    for (const item of prepared) {
      if (item.reasons.length) continue;
      if (!groups.has(item.fingerprint)) groups.set(item.fingerprint, []);
      groups.get(item.fingerprint).push(item);
    }
    // Deterministic witnesses independent of source order. No equivalence coalescing.
    for (const group of groups.values()) {
      group.sort((a,b) => a.candidate.candidateId < b.candidate.candidateId ? -1 : 1);
      const survivors = group.filter(b => !group.some(a => a !== b && comparePrepared(a,b)));
      const survivorIds = new Set(survivors.map(x => x.candidate.candidateId));
      for (const b of group) {
        if (survivorIds.has(b.candidate.candidateId)) continue;
        const a = survivors.find(winner => comparePrepared(winner,b));
        if (!a) throw new Error("No retained dominance witness");
        removed.set(b.candidate.candidateId, {candidateId:b.candidate.candidateId, name:b.candidate.name,
          dominatedByCandidateId:a.candidate.candidateId, dominatedByName:a.candidate.name,
          dominanceReason:comparePrepared(a,b)});
      }
    }
    const bySlot = Object.create(null), protectedReasons = Object.create(null);
    let incomparableRetainedCount = 0, conservativeRetainedCount = 0, singletonRetainedCount = 0;
    for (const item of prepared) {
      const c = item.candidate, slot = c.slot || "unknown";
      if (!bySlot[slot]) bySlot[slot] = {before:0, after:0, removed:0};
      bySlot[slot].before++;
      if (removed.has(c.candidateId)) { bySlot[slot].removed++; continue; }
      bySlot[slot].after++;
      if (item.reasons.length) {
        conservativeRetainedCount++;
        incomparableRetainedCount++;
        item.reasons.forEach(reason => { protectedReasons[reason] = (protectedReasons[reason] || 0) + 1; });
        retained.push({candidateId:c.candidateId, name:c.name, reasons:item.reasons});
      } else if ((groups.get(item.fingerprint)?.length || 0) < 2) {
        incomparableRetainedCount++;
        singletonRetainedCount++;
      }
    }
    return {candidates:original.filter(c => !removed.has(c.candidateId)), sources:snapshot.sources,
      removed:[...removed.values()], conservativelyRetained:retained,
      diagnostics:{beforeCount:original.length, afterCount:original.length-removed.size, removedCount:removed.size,
        reductionRate:original.length ? removed.size/original.length : 0, bySlot,
        incomparableRetainedCount, conservativeRetainedCount, singletonRetainedCount, conservativeReasons:protectedReasons,
        comparableGroupCount:groups.size}};
  }
  global.MOEOptimizerV2Pareto = Object.freeze({axes:AXES, reduce, compare,
    inspect:(candidate, sources) => prepare(candidate, sources?.[candidate?.sourceRef])});
})(globalThis);
