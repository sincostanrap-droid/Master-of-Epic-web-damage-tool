/* Context-specific projection and reduction for the implemented model, not game-wide dominance.
 * Phase 1 sources and Phase 2 unconditional Pareto remain untouched.
 */
(function (global) {
  "use strict";
  const stable = value => JSON.stringify(order(value));
  function order(value) {
    if (Array.isArray(value)) return value.map(order);
    if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(k=>[k,order(value[k])]));
    return value;
  }
  const nonempty = v => v != null && v !== "";
  const immutable=value=>!value || typeof value!=="object"
    || (Object.isFrozen(value) && Object.values(value).every(immutable));
  function timed(profile,key,operation) {
    if(!profile)return operation();
    const start=performance.now();
    try{return operation();}finally{
      profile[key]=(profile[key]||0)+performance.now()-start;
    }
  }
  function restrictionMismatch(raw, wanted, aliases) {
    if (!nonempty(raw) || raw === "ALL" || !nonempty(wanted)) return false;
    // Only exact, recognized single values. Never parse unknown expressions as a prohibition.
    const a=aliases[String(raw).toLowerCase()], b=aliases[String(wanted).toLowerCase()];
    return !!(a && b && a!==b);
  }
  const genders = {male:"male", female:"female", "男":"male", "女":"female"};
  const races = {newtar:"newtar", cognite:"cognite", elmony:"elmony", pandemos:"pandemos"};
  function filterReason(candidate, source, context, rowFor=()=>global.MOEOptimizerV2Candidates.toEquipmentRow(candidate)) {
    if (!context.slots.includes(candidate.slot)) return "outside-slots";
    if (context.excludedCandidateIds.includes(candidate.candidateId)) return "explicit-exclusion";
    if (context.ownedOnly && !context.ownedCandidateIds.includes(candidate.candidateId)) return "not-owned";
    if (restrictionMismatch(source?.equipRace,context.race,races)) return "race-restriction";
    if (restrictionMismatch(source?.equipGender,context.gender,genders)) return "gender-restriction";
    const row=rowFor();
    const ammo=optimizerAmmoKind(row), wanted=context.mainWeaponSkill==="弓"?"bow":context.mainWeaponSkill==="銃器"?"gun":null;
    if (candidate.slot==="武器: 弾丸" && ammo && wanted && ammo!==wanted) return "ammo-incompatible";
    if (context.mainWeaponSkill && candidate.slot===context.mainWeaponSlot) {
      const names=optimizerWeaponSkillNames(row);
      if (names.length && !names.includes(context.mainWeaponSkill)) return "weapon-type";
    }
    // Skill underperformance is not inability to equip. No skill threshold filter exists here.
    return null;
  }
  function project(...args){
    const preparation=args[4]?.candidatePreparation;
    if(!preparation)return projectUncached(...args);
    return preparation.projectFor(args[0],args[2],args[1],args[3],args[4]?.reuseNormalizedSingleton!==false,()=>projectUncached(...args));
  }
  function projectUncached(candidate, source, context, row=global.MOEOptimizerV2Candidates.toEquipmentRow(candidate),
    {reuseNormalizedSingleton=true,candidatePreparation=null}={},profile=null,preparation=null) {
    const extra=emptyExtraStats(); addExtraStatsInto(extra,row,"base");
    extra.extraAC=equipmentArmorAC(row,context.skillSim).total;
    // The official resolver filters on the normalized equipBuffEnabled flag
    // before resolving. A disabled row has an empty pre-conflict Buff set.
    // toEquipmentRow already called the official candidate normalizer. For a
    // singleton layout, all extra rows added by normalizeEquipmentRows are empty
    // defaults without Buffs or weapon data. Hand exclusivity cannot remove this
    // sole active candidate. Pass this exact row through the existing resolver.
    const singleton=reuseNormalizedSingleton?[row]:null;
    const artifact=row.equipBuffEnabled && candidatePreparation?candidatePreparation.buffFor(candidate):null;
    const resolvedBuffs=timed(profile,"buffResolutionMs",()=>row.equipBuffEnabled
      ?resolveEquipmentBuffRowsForSameTechnic([row],singleton,artifact?()=>artifact:null):[]);
    const buffs=timed(profile,"compositeConversionMs",()=>artifact
      ?resolvedBuffs.map(()=>artifact.compositePrototype):resolvedBuffs.map(equipmentBuffToCompositeRow));
    const normalizedBuffs=timed(profile,"buffNormalizationMs",()=>artifact
      ?resolvedBuffs.map(()=>artifact.normalizedCompositePrototype):normalizeCompositeRows(buffs));
    if(preparation) {
      preparation[row.equipBuffEnabled?"buffResolvedCandidates":"buffDisabledCandidates"]++;
      if(row.equipBuffEnabled && reuseNormalizedSingleton)preparation.buffSingletonReuses++;
    }
    const plan=context.observations;
    const protectedReasons=[];
    if (!source || !candidate.slot || candidate.slot!==row.slot) protectedReasons.push("missing-source-or-slot");
    // These affect priority, slots, conversions and conditional targets, including display-only
    // skillPlus used by compositeGroupScore. Keep their alternatives until interchangeability is proved.
    // Narrow proof: an active skillPlus-only Buff without a competition group can
    // vary only in unobserved skills. Preserve its same-technic/name stack identity
    // and all other normalized fields. Thus latest-wins behavior cannot change.
    const skillOnly=normalizedBuffs.length===1 && !buffGroupName(normalizedBuffs[0])
      && normalizedBuffs[0].extraEffects.length>0
      && normalizedBuffs[0].extraEffects.every(e=>e.key==="skillPlus")
      && !compositeHasEffect({...normalizedBuffs[0],extraEffects:[]});
    if (buffs.length && (!skillOnly || plan.conservativeAll)) protectedReasons.push("resolved-buff-interaction");
    if(plan.conservativeAll) protectedReasons.push("unproved-numeric-dependencies");
    if (context.fixedCandidateIds.includes(candidate.candidateId)) protectedReasons.push("fixed-candidate");
    const weaponRole=weaponRowHasCalcData(row);
    const weaponInfo=weaponRole ? {
      damage:row.weaponDamage, interval:row.weaponAttackInterval, weight:row.weaponWeight,
      range:row.weaponRange, twoHanded:row.weaponTwoHanded, requirements:row.weaponReq,
      projectileKind:projectileWeaponKind(row), ammoKind:optimizerAmmoKind(row), motion:attackDpsWeaponMotionKey(row)
    } : null;
    const skillPerformance=timed(profile,"requirementsMs",()=>weaponRole
      ?calcWeaponSkillMod({...context.baseState,equipment:[row]},context.inputs,singleton).mod:null);
    if(preparation && weaponRole && reuseNormalizedSingleton)preparation.weaponSingletonReuses++;
    const semanticsStart=profile?performance.now():0;
    const semantics={slot:row.slot, category:candidate.category, weaponType:candidate.weaponType,
      weaponHand:candidate.weaponHand, ammoKind:candidate.ammoKind, quality:candidate.quality,
      restrictions:{race:source?.equipRace || null,gender:source?.equipGender || null},
      requirements:candidate.requirements,
      rawRequirements:{requiredSkill:source?.requiredSkill??null,needLevel:source?.needLevel??null},
      weapon:weaponInfo, hardConflicts:optimizerEquipmentConflictKeys(row),
      observedBase:Object.fromEntries(plan.baseFields.map(key=>[key,row[key]])),
      observedExtra:Object.fromEntries(plan.extraFields.filter(key=>!(context.legacyDominance
        && ((key==="extraCritRatePct" && context.critRateRequirement!==null)
          || (key==="extraAttackDelay" && context.attackDelayRequirement!==null && !plan.needsDps))))
        .map(key=>[key,extra[key]])),
      buffStackKeys:resolvedBuffs.map(equipmentBuffStackKey),
      buffs:normalizedBuffs.map(buff=>{
        const {note,...rest}=buff;
        rest.extraEffects=rest.extraEffects.map(effect=>{
          const {note:effectNote,...numericEffect}=effect; return numericEffect;
        });
        if(skillOnly && !plan.conservativeAll) {
          const totals=skillPlusTotalsFromResolvedState({composite:[buff]});
          rest.extraEffects=plan.skillNames.map(skillName=>({key:"skillPlus",name:skillName,
            value:global.MOESkillPlusV21.totalForSkill(totals,skillName)}));
          rest.skillPlusOnlyActive=true;
        }
        return rest; // note is diagnostic text after official resolution, not an objective input.
      })};
    if(profile)profile.semanticsMs=(profile.semanticsMs||0)+performance.now()-semanticsStart;
    // Crit equipment bonuses are not injected into inputs.critRate by computeMetrics.
    // These axes are used only for the requested lower-bound feasibility constraints.
    const axes={
      crit:!context.legacyDominance || context.critRateRequirement===null ? 0 : extra.extraCritRatePct,
      delay:!context.legacyDominance || context.attackDelayRequirement===null || plan.needsDps ? 0 : extra.extraAttackDelay
    };
    if ([row.attack,row.magic,row.speed,axes.crit,axes.delay,extra.extraAttackDelay,skillPerformance??0,
      ...plan.extraFields.map(key=>extra[key])]
      .some(x=>!Number.isFinite(x))) protectedReasons.push("nonfinite-projection");
    const fingerprint=timed(profile,"fingerprintMs",()=>stable(semantics));
    return {candidateId:candidate.candidateId, originalCandidate:candidate, fingerprint,
      semantics, axes, skillPerformance, requirements:candidate.requirements,
      // The official resolver already produced these candidate-local, pre-conflict rows.
      // Bound proof may read them; final Buff competition still runs per configuration.
      proofBuffs:normalizedBuffs,proofStackKeys:semantics.buffStackKeys,
      protectedReasons, ignoredMetadata:{sourceRef:candidate.sourceRef,
        descriptionRetained:!!(source?.info || source?.note),
        fields:["catalog name/description/provenance", "body stats not read by this objective/constraints"]}};
  }
  function dominates(a,b) {
    return a.fingerprint===b.fingerprint && a.axes.crit>=b.axes.crit && a.axes.delay<=b.axes.delay
      && (a.axes.crit>b.axes.crit || a.axes.delay<b.axes.delay);
  }
  function reduce(snapshot, context, profile=null, options={}) {
    return global.MOEOptimizerV2Candidates.drainPreparation(reduceSteps(snapshot,context,profile,options),context);
  }
  function* reduceSteps(snapshot,context,profile=null,options={}) {
      const start=profile?performance.now():0;
      if(profile)Object.assign(profile,{filterMs:0,projectionMs:0,groupingMs:0,diagnosticsMs:0,totalMs:0,
        buffResolutionMs:0,compositeConversionMs:0,buffNormalizationMs:0,requirementsMs:0,
        semanticsMs:0,fingerprintMs:0,classKeyMs:0});
      if (!Array.isArray(snapshot?.candidates) || !snapshot.sources) throw new Error("Phase 1 snapshot required");
      const original=snapshot.candidates, byId=new Map(original.map(c=>[c.candidateId,c]));
      // Legacy development callers may supply mutable ad-hoc fixtures. They
      // retain the uncached path; sharing requires the Phase 1 frozen snapshot.
      const candidatePreparation=options.sharedPreparation===false || options.reuseNormalizedSingleton===false
        || !Object.isFrozen(snapshot.sources) || !original.every(immutable)?null:
        global.MOEOptimizerV2EvaluationSession.createCandidatePreparation(context,snapshot.sources,{catalogSignature:snapshot.catalogCacheSignature??null});
      const projectionOptions={...options,candidatePreparation};
      if (byId.size!==original.length) throw new Error("Duplicate candidateId");
      const fixedSlots=new Map();
      for (const id of context.fixedCandidateIds) {
        const c=byId.get(id);
        if (!c) throw new Error(`Unknown fixed candidate: ${id}`);
        if (fixedSlots.has(c.slot)) throw new Error("Multiple fixed candidates in one slot");
        fixedSlots.set(c.slot,id);
      }
      const filtered=[], effective=[], groups=new Map(), removed=[], equivalents=[];
      const preparation={buffResolvedCandidates:0,buffDisabledCandidates:0,
        buffSingletonReuses:0,weaponSingletonReuses:0};
      for (const c of original) {
        yield {phase:'reducer projection',processed:effective.length+filtered.length,total:original.length};
        const filterStart=profile?performance.now():0;
        let row;
        const rowFor=()=>row||(row=candidatePreparation?candidatePreparation.readRow(c):global.MOEOptimizerV2Candidates.toEquipmentRow(c));
        const reason=filterReason(c,snapshot.sources[c.sourceRef],context,rowFor)
          || (fixedSlots.has(c.slot) && fixedSlots.get(c.slot)!==c.candidateId ? "fixed-slot-alternative" : null);
        if(profile)profile.filterMs+=performance.now()-filterStart;
        if (reason) {
          if (context.fixedCandidateIds.includes(c.candidateId)) throw new Error(`Fixed candidate conflicts with context: ${reason}`);
          filtered.push({candidateId:c.candidateId,name:c.name,reason}); continue;
        }
        const projectStart=profile?performance.now():0;
        const e=project(c,snapshot.sources[c.sourceRef],context,rowFor(),projectionOptions,profile,preparation); effective.push(e);
        if (!e.protectedReasons.length) {
          if (!groups.has(e.fingerprint)) groups.set(e.fingerprint,[]);
          groups.get(e.fingerprint).push(e);
        }
        if(profile)profile.projectionMs+=performance.now()-projectStart;
      }
      const groupStart=profile?performance.now():0;
      // Equivalence is independent of K. Strict dominance is safe only for top-1:
      // a dominated, non-equivalent configuration can still belong in the top-K.
      for (const e of effective.filter(e=>e.protectedReasons.length)) {
        groups.set(`protected:${e.candidateId}`,[e]);
      }
      for (const group of groups.values()) {
        yield {phase:'equivalence',processed:equivalents.length,total:effective.length};
        group.sort((a,b)=>a.candidateId<b.candidateId?-1:1);
        const classes=new Map();
        for (const e of group) {
          const key=timed(profile,"classKeyMs",()=>stable(e.axes));
          if (!classes.has(key)) classes.set(key,[]);
          classes.get(key).push(e);
        }
        const reps=[...classes.values()].map(list=>list[0]);
        const frontier=context.topK===1 ? reps.filter(b=>!reps.some(a=>dominates(a,b))) : reps;
        for (const list of classes.values()) {
          const rep=list[0], winner=frontier.includes(rep) ? rep : frontier.find(a=>dominates(a,rep));
          if (!winner) throw new Error("Missing retained witness");
          equivalents.push(Object.freeze({equivalenceScope:"SearchContext",equipmentEquivalence:"not-assessed",
            observedMetrics:context.observations.metrics,
            representativeCandidate:rep.originalCandidate,
            representativeCandidateId:rep.candidateId,
            equivalentCandidateIds:Object.freeze(list.map(e=>e.candidateId)),
            equivalentCandidates:Object.freeze(list.map(e=>e.originalCandidate)),
            equivalenceKey:timed(profile,"classKeyMs",()=>stable([...(context.secondary?[context.secondary]:[]),context.objective,context.constraints,rep.fingerprint,rep.axes,rep.protectedReasons.length?rep.candidateId:null])),
            equivalenceReason:rep.protectedReasons.length ? "conservative-singleton" : "identical-context-projection",
            retainedRepresentativeCandidateId:winner.candidateId}));
          for (const e of list) if (e!==winner) removed.push({candidateId:e.candidateId,name:e.originalCandidate.name,
            dominatedByCandidateId:winner.candidateId, dominatedByName:winner.originalCandidate.name,
            reason:dominates(winner,e)?"context-dominance":"model-equivalent",
            dominanceReason:{fingerprintEqual:true, winnerAxes:winner.axes, removedAxes:e.axes}});
        }
      }
      if(profile)profile.groupingMs=performance.now()-groupStart;
      const diagnosticsStart=profile?performance.now():0;
      const removedIds=new Set(removed.map(x=>x.candidateId));
      const result=effective.filter(e=>!removedIds.has(e.candidateId));
      const bySlot=Object.create(null), reasons=Object.create(null);
      for (const c of original) {
        const slot=c.slot||"unknown";
        if (!bySlot[slot]) bySlot[slot]={before:0,afterFilter:0,afterPareto:0};
        bySlot[slot].before++;
      }
      for (const e of effective) bySlot[e.originalCandidate.slot||"unknown"].afterFilter++;
      for (const e of result) bySlot[e.originalCandidate.slot||"unknown"].afterPareto++;
      for (const x of [...filtered,...removed]) reasons[x.reason]=(reasons[x.reason]||0)+1;
      const comparable=effective.filter(e=>!e.protectedReasons.length && groups.get(e.fingerprint).length>1);
      const descriptionComparable=comparable.filter(e=>e.ignoredMetadata.descriptionRetained);
      if(profile){profile.diagnosticsMs=performance.now()-diagnosticsStart;profile.totalMs=performance.now()-start;}
      const reduction={context,candidates:result.map(e=>e.originalCandidate),effectiveCandidates:result,
        sources:snapshot.sources,filtered,removed,contextEquivalentClasses:Object.freeze(equivalents),
        equivalentGroups:equivalents,equivalentClasses:equivalents,
        diagnostics:{beforeCount:original.length,afterFilterCount:effective.length,afterParetoCount:result.length,
          filteredCount:filtered.length,paretoRemovedCount:removed.length,bySlot,reasons,
          projectionPreparation:preparation,
          equivalentClassCount:equivalents.length,
          afterEquivalenceCount:equivalents.length,
          strictDominanceRemovedCount:removed.filter(x=>x.reason==="context-dominance").length,
          equivalentRemovedCount:removed.filter(x=>x.reason==="model-equivalent").length,
          incomparableRetainedCount:result.filter(e=>e.protectedReasons.length || groups.get(e.fingerprint)?.length===1).length,
          protectedRetainedCount:result.filter(e=>e.protectedReasons.length).length,
          comparableCount:comparable.length,descriptionNoLongerBlocksCount:descriptionComparable.length,
          descriptionOnlyBlockedInPhase2:global.MOEOptimizerV2Pareto ? descriptionComparable.filter(e=>{
            const old=global.MOEOptimizerV2Pareto.inspect(e.originalCandidate,snapshot.sources);
            return old.reasons.length===1 && old.reasons[0]==="uninterpreted-description";
          }).length : null,
          feasibility:"Requirements are checked on complete configurations; no individual threshold pruning",
          topKReductionDisabled:false,strictDominanceDisabled:context.topK>1}};
      // Runtime handle is intentionally absent from serialized result contracts.
      if(candidatePreparation)Object.defineProperty(reduction,'candidatePreparation',{value:candidatePreparation});
      return reduction;
  }
  function resolveCandidate(equivalentClass, candidateId=equivalentClass.representativeCandidateId) {
    const candidate=equivalentClass.equivalentCandidates.find(c=>c.candidateId===candidateId);
    if (!candidate) throw new Error(`Candidate not in equivalent class: ${candidateId}`);
    return candidate;
  }
  // Attach class information to a future search result, allowing any member for display/apply.
  // Keys are scoped to this reduction snapshot; equal scores alone are not equivalence proof.
  function describeConfiguration(reduction, candidateIds) {
    const membership=new Map();
    for (const cls of reduction.equivalentClasses) for (const id of cls.equivalentCandidateIds) membership.set(id,cls);
    const slots=new Set();
    const equipment=candidateIds.map(id=>{
      const cls=membership.get(id);
      if (!cls) throw new Error(`Unknown configuration candidate: ${id}`);
      const candidate=resolveCandidate(cls,id);
      if (slots.has(candidate.slot)) throw new Error("Multiple candidates in one slot");
      slots.add(candidate.slot);
      return {slot:candidate.slot,selectedCandidate:candidate,...cls};
    }).sort((a,b)=>a.slot<b.slot?-1:a.slot>b.slot?1:0);
    return {equipment,performanceKey:stable(equipment.map(e=>[e.slot,e.equivalenceKey]))};
  }
  global.MOEOptimizerV2EffectiveCandidates=Object.freeze({reduce,reduceSteps,filterReason,resolveCandidate,describeConfiguration,
    project:(candidate,source,context,options={})=>global.MOEOptimizerV2SearchContext.withRuntime(context,
      ()=>project(candidate,source,context,options.candidatePreparation?options.candidatePreparation.readRow(candidate):global.MOEOptimizerV2Candidates.toEquipmentRow(candidate),options))});
})(globalThis);
