/* Optimizer v2 Phase 1. Classic script, no DOM, state, search or calculation formulas.
 * Load catalogData.js and the existing main.js conversion helpers first.
 * Explicit catalog loading is the caller's responsibility (see docs/optimizer-v2-phase1.md).
 */
(function (global) {
  "use strict";
  const VERSION = 1;
  // Session-only, source-bound catalog artifacts. No context, winners or scores.
  let catalogSignature=null,catalogFunctions=[],catalogEntries=new Map(),uncacheableGeneration=0;
  function createCatalogPreparation() {
    const names=[...OPTIMIZER_RUNTIME_DATA_KEYS,'MOE_BUFF_CATALOG_MANUAL','MOE_BUFF_CATALOG','MOE_BUFF_CATALOG_GENERATED'];
    let cacheable=true;
    let signature=JSON.stringify(names.map(k=>[k,global[k]??null]),(key,value)=>{if(typeof value==='function'||typeof value==='number'&&(!Number.isFinite(value)||Object.is(value,-0)))cacheable=false;return value;});
    if(!cacheable)signature+=':uncacheable:'+ ++uncacheableGeneration;
    const functions=[global.catalogEquipmentToRow,global.catalogItemWithQuality,global.defaultEquipmentCandidate,global.normalizeEquipmentCandidate,global.resolveEquipmentBuffRow,global.normalizeAdditionalEffects];
    if(signature!==catalogSignature||functions.some((f,i)=>f!==catalogFunctions[i])){catalogEntries=new Map();catalogSignature=signature;catalogFunctions=functions;}
    const entries=catalogEntries,diagnostics={hits:0,misses:0,candidateHits:0,candidateMisses:0};
    return {signature,diagnostics,read(item,quality=null){
      const key=JSON.stringify([quality,item]);let entry=entries.get(key);
      if(entry){diagnostics.hits++;return entry;}
      diagnostics.misses++;entry={row:freeze(global.catalogEquipmentToRow(copy(item),quality)),source:freeze(copy(item)),candidate:null};
      // Bound retained memory; eviction only causes recomputation.
      if(entries.size>=24000)entries.delete(entries.keys().next().value);
      entries.set(key,entry);return entry;
    }};
  }
  const copy = value => JSON.parse(JSON.stringify(value));
  function freeze(value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }
  function identity(item) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    for (const key of ["catalogId", "id"]) {
      if (["string", "number"].includes(typeof item[key]) && String(item[key]).trim()) {
        return {kind:key, value:String(item[key])};
      }
    }
    if (item.category && item.officialId != null && String(item.officialId).trim()) {
      return {kind:"official", value:JSON.stringify([String(item.category), String(item.officialId)])};
    }
    return null; // Names and array positions are deliberately not identities.
  }
  function sourceKey(id) { return `${id.kind}:${encodeURIComponent(id.value)}`; }
  function increment(counts, key) { counts[key || "unknown"] = (counts[key || "unknown"] || 0) + 1; }
  function sparse(row, defaults) {
    return Object.fromEntries(Object.entries(row).filter(([key, value]) =>
      JSON.stringify(value) !== JSON.stringify(defaults[key])));
  }
  function numbers(row, prefix) {
    return Object.fromEntries(Object.entries(row).filter(([key, value]) =>
      typeof value === "number" && value !== 0 && (prefix ? key.startsWith(prefix) : !key.startsWith("equipBuff"))));
  }
  function requireRuntime() {
    for (const name of ["equipmentCatalogItems", "catalogEquipmentToRow", "catalogItemWithQuality",
      "defaultEquipmentCandidate", "normalizeEquipmentCandidate"]) {
      if (typeof global[name] !== "function") throw new Error(`Optimizer v2 missing runtime: ${name}`);
    }
  }

  /** Pure with respect to app state and catalog inputs. Each result is a frozen snapshot.
   * qualities defaults to raw; HG_MG is an explicit hypothetical grade, not an availability claim.
   * items is a catalog-only injection point for tests/imported catalog snapshots, never state.equipment.
   */
  function drainPreparation(iterator,context=null,initialRuntime=true) {
    let active=initialRuntime?context:null,next;
    for(;;){const advance=()=>{for(;;){next=iterator.next();if(next.done||next.value.runtime!==undefined)break;}};
      if(active)global.MOEOptimizerV2SearchContext.withRuntime(active,advance);else advance();
      if(next.done)return next.value;active=next.value.runtime?context:null;
    }
  }
  function abortPreparation(signal){if(signal?.aborted){const error=new Error('Preparation aborted');error.name='AbortError';throw error;}}
  // A persistent task queue avoids nested timer clamping in browser tabs.
  // Node VM uses its immediate task queue, with timers as a compatibility fallback.
  // No path depends on animation frames.
  let preparationChannel=null;const preparationWaiters=[];
  function yieldPreparation(){
    if(typeof global.setImmediate==='function')return new Promise(resolve=>global.setImmediate(resolve));
    if(typeof global.MessageChannel!=='function')return new Promise(resolve=>setTimeout(resolve,0));
    if(!preparationChannel){preparationChannel=new global.MessageChannel();preparationChannel.port1.onmessage=()=>preparationWaiters.shift()?.();}
    return new Promise(resolve=>{preparationWaiters.push(resolve);preparationChannel.port2.postMessage(0);});
  }
  async function cooperatePreparation(iterator,{context=null,signal,onProgress,budgetMs=8,initialRuntime=true,
    initialProgress={phase:'preparation',processed:0,total:0}}={}) {
    const started=performance.now();let maximumChunkMs=0,callbacks=0,active=initialRuntime?context:null;
    let runtime=null,runtimeContext;
    try{
      // Publish the first status and let input/paint tasks run before any cold work.
      abortPreparation(signal);onProgress?.({...initialProgress,elapsedMs:performance.now()-started});callbacks++;
      abortPreparation(signal);await yieldPreparation();
      for(;;){abortPreparation(signal);const chunk=performance.now();let next;
      if(active!==runtimeContext){runtimeContext=active;runtime=active?global.MOEOptimizerV2SearchContext.createPreparationRuntime(active):null;}
      const advance=()=>{do{next=iterator.next();if(next.done||next.value.runtime!==undefined)break;}while(performance.now()-chunk<budgetMs);};
      if(runtime)runtime(advance);else advance();
      maximumChunkMs=Math.max(maximumChunkMs,performance.now()-chunk);abortPreparation(signal);
      if(next.done){if(next.value?.diagnostics&&!Object.isFrozen(next.value.diagnostics))next.value.diagnostics.preparation={elapsedMs:performance.now()-started,maximumChunkMs,progressCallbacks:callbacks};return next.value;}
      if(next.value.runtime!==undefined){active=next.value.runtime?context:null;runtimeContext=undefined;}
      onProgress?.({...next.value,elapsedMs:performance.now()-started});callbacks++;abortPreparation(signal);
      await yieldPreparation();
    }}finally{iterator.return();}
  }
  function generate(options) {return drainPreparation(generateSteps(options));}
  function generateAsync(options={},scheduling={}) {
    return cooperatePreparation(generateSteps(options),{...scheduling,initialRuntime:false,
      initialProgress:{phase:'candidate preparation',processed:0,total:options.items?.length||0}});
  }
  function* generateSteps({items, qualities = ["raw"],catalogPreparation=null} = {}) {
    requireRuntime();
    if (!Array.isArray(qualities) || !qualities.length || qualities.some(q => !["raw", "HG_MG"].includes(q))) {
      throw new Error("qualities must contain raw and/or HG_MG");
    }
    const grades = [...new Set(qualities)];
    if (items === undefined && !global.catalogGlobalsReady()) {
      throw new Error("Load the equipment and ammo catalogs before generating v2 candidates");
    }
    const catalog = items === undefined ? global.equipmentCatalogItems() : items;
    if (!Array.isArray(catalog)) throw new Error("items must be a catalog array");
    const diagnostics = {
      sourceCatalogCount:catalog.length, attemptedCandidateCount:catalog.length * grades.length,
      candidateCount:0, bySlot:Object.create(null), byWeaponType:Object.create(null), byQuality:Object.create(null),
      conversionFailedCount:0, excludedCount:0, exclusionReasons:Object.create(null),
      excluded:[], conversionFailures:[], warnings:[]
    };
    const candidates = [], sources = Object.create(null), defaults = global.defaultEquipmentCandidate("", false);
    const ids = catalog.map(identity), counts = new Map();
    ids.forEach(id => { if (id) { const key = sourceKey(id); counts.set(key, (counts.get(key) || 0) + 1); } });
    for(const [index,item] of catalog.entries()) {
      yield {phase:'candidate preparation',processed:index,total:catalog.length};
      const id = ids[index], key = id && sourceKey(id);
      const reason = !item || typeof item !== "object" || Array.isArray(item) ? "invalid-catalog-item"
        : !id ? "missing-stable-id" : counts.get(key) > 1 ? "duplicate-stable-id" : null;
      for (const quality of grades) {
        const detail = {catalogId:item?.catalogId ?? item?.id ?? null, name:item?.name ?? "", quality};
        if (reason) {
          diagnostics.excludedCount++;
          increment(diagnostics.exclusionReasons, reason);
          diagnostics.excluded.push({...detail, reason});
          continue;
        }
        try {
          const cached=catalogPreparation?.read(item,quality);
          if(cached?.candidate){
            catalogPreparation.diagnostics.candidateHits++;
            const candidate=cached.candidate;
            if(!sources[key])sources[key]=cached.source;
            candidates.push(candidate);increment(diagnostics.bySlot,candidate.slot);increment(diagnostics.byWeaponType,candidate.weaponType);increment(diagnostics.byQuality,quality);
            if(!item.slot)diagnostics.warnings.push({...detail,reason:'missing-source-slot',evaluationSlot:cached.row.slot});
            continue;
          }
          if(cached)catalogPreparation.diagnostics.candidateMisses++;
          // Clone before calling legacy helpers so normalization cannot mutate the catalog.
          const row = cached?cached.row:global.catalogEquipmentToRow(copy(item), quality);
          if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("converter returned no equipment row");
          const projected = global.catalogItemWithQuality(item, quality);
          const candidateId = `ov2:${key}:quality:${quality}`;
          const effects = copy(row.extraEffects || []);
          const candidate = {
            schemaVersion:VERSION, candidateId, catalogId:item.catalogId ?? item.id ?? null,
            name:item.name ?? "", slot:item.slot || null, evaluationSlot:row.slot,
            category:item.category || null, quality,
            qualityAvailability:quality === "raw" ? "catalog" : "unverified-explicit-variant",
            weaponType:item.weaponType || null, weaponHand:item.weaponHand || null,
            twoHanded:row.weaponTwoHanded === "○", ammoKind:item.ammoKind || null,
            weaponDamage:row.weaponDamage, attackInterval:row.weaponAttackInterval,
            armorClass:projected.armorClass ?? null, ac:row.extraAC,
            // Preserve unknown skill names and non-weapon requirements as catalog data.
            requirements:copy(item.requirements ?? (item.category!=="weapon"?row.armorRequirements:null) ?? item.weaponReq ?? row.weaponReq ?? []),
            modifiers:{base:numbers(row, ""), equipmentBuff:numbers(row, "equipBuff")},
            criticalRate:{base:row.extraCritRatePct || 0, equipmentBuff:row.equipBuffExtraCritRatePct || 0},
            attackDelay:{base:row.extraAttackDelay || 0, equipmentBuff:row.equipBuffExtraAttackDelay || 0,
              basePct:row.extraAttackDelayPct || 0, equipmentBuffPct:row.equipBuffExtraAttackDelayPct || 0},
            damageModifiers:{equipmentBuffPct:row.equipBuffDmgPct, special:row.equipBuffSpecial,
              specialTarget:row.equipBuffSpecialTarget},
            skillPlus:effects.filter(effect => effect.key === "skillPlus"),
            equipmentBuff:{refs:copy(item.buffRefs || []), catalogId:row.equipBuffCatalogId,
              technicId:row.equipBuffTechnicId, name:row.equipBuffName, enabled:row.equipBuffEnabled},
            effects, sourceRef:key,
            // Sparse authoritative legacy projection, not a second damage model.
            // All non-default fields (including future/unknown fields) survive the round trip.
            evaluationFields:sparse(row, defaults)
          };
          if(cached)cached.candidate=freeze(candidate);
          if (!sources[key]) sources[key] = cached?cached.source:copy(item);
          candidates.push(candidate);
          increment(diagnostics.bySlot, candidate.slot);
          increment(diagnostics.byWeaponType, candidate.weaponType);
          increment(diagnostics.byQuality, quality);
          if (!item.slot) diagnostics.warnings.push({...detail, reason:"missing-source-slot", evaluationSlot:row.slot});
        } catch (error) {
          diagnostics.conversionFailedCount++;
          diagnostics.conversionFailures.push({...detail, reason:"conversion-error", message:String(error.message || error)});
        }
      }
    }
    diagnostics.candidateCount = candidates.length;
    return freeze({schemaVersion:VERSION, candidates, sources, diagnostics,...(catalogPreparation?{catalogCacheSignature:catalogPreparation.signature}: {})});
  }

  /** Build a fresh official equipment row. Caller supplies skillSim/inputs to the official calculator.
   * No live state or catalog lookup: the run snapshot remains stable across catalog updates.
   */
  function toEquipmentRow(candidate, {enabled = true} = {}) {
    if (candidate?.schemaVersion !== VERSION || !candidate.evaluationFields) throw new Error("Unsupported v2 candidate");
    return global.normalizeEquipmentCandidate({...copy(candidate.evaluationFields), enabled});
  }
  function toEvaluationState(baseState, candidates) {
    return {...copy(baseState), equipment:candidates.map(candidate => toEquipmentRow(candidate))};
  }
  global.MOEOptimizerV2Candidates = Object.freeze({schemaVersion:VERSION, generate,generateAsync,generateSteps,drainPreparation,cooperatePreparation,abortPreparation, toEquipmentRow, toEvaluationState,createCatalogPreparation});
})(globalThis);
