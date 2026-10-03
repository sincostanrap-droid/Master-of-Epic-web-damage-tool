/* Phase 2.5: a synchronous, isolated adapter to the existing calculation model.
 * No damage/DPS formulas live here. Runtime globals are restored even on failure.
 */
(function (global) {
  "use strict";
  const copy = value => JSON.parse(JSON.stringify(value));
  const freeze = value => {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze); Object.freeze(value);
    }
    return value;
  };
  const fields = new Set(("objective mainWeaponSkill weaponType mainWeaponSlot attackType targetAC race gender skillSim " +
    "critRateRequirement attackDelayRequirement minAC fixedCandidateIds excludedCandidateIds ownedOnly ownedCandidateIds " +
    "topK slots inputs baseState dps runtime objectiveDirection constraints secondary").split(" "));
  const skills = ["素手", "刀剣", "こんぼう", "槍", "弓", "銃器", "投げ"];
  function create(options = {}) {
    for (const key of Object.keys(options)) if (!fields.has(key)) throw new Error(`Unsupported SearchContext field: ${key}`);
    const registry=global.MOEOptimizerV2Metrics;
    const objective = registry.normalize(options.objective || "physicalDamage",options.objectiveDirection || "max");
    if(options.objectiveDirection && objective.direction!==options.objectiveDirection) throw new Error("Conflicting objective direction");
    if(options.constraints!==undefined && !Array.isArray(options.constraints)) throw new Error("constraints must be an array");
    const constraints=(options.constraints || []).map(c=>{
      if(!c || Object.keys(c).some(k=>!["metric","op","value"].includes(k)) || !["gte","lte","eq"].includes(c.op) || !Number.isFinite(c.value)) throw new Error("Invalid constraint");
      return {metric:registry.normalize(c.metric),op:c.op,value:c.value};
    });
    for(const [field,metric,op] of [["minAC","ac","gte"],["critRateRequirement","critRate","gte"],["attackDelayRequirement","attackDelay","lte"]]) {
      if(options[field]!=null) constraints.push({metric:registry.normalize(metric),op,value:options[field]});
    }
    const secondary=options.secondary ? registry.normalize(options.secondary) : null;
    const observations=registry.observationPlan(objective,secondary ? [...constraints,{metric:secondary}] : constraints);
    const mainWeaponSkill = options.mainWeaponSkill || options.weaponType || "";
    if (mainWeaponSkill && !skills.includes(mainWeaponSkill)) throw new Error("Unsupported main weapon skill");
    if (options.weaponType && options.mainWeaponSkill && options.weaponType !== options.mainWeaponSkill) throw new Error("Conflicting weapon types");
    const baseState = copy(options.baseState || DEFAULT_STATE());
    baseState.equipment = []; // Only supplied candidates participate; never live registered equipment.
    const skillSim = normalizeSkillSim(copy(options.skillSim || baseState.skillSim));
    const race = options.race || skillSim.race;
    const attackType = options.attackType || "attack";
    if (!["attack", "heavy", "tech"].includes(attackType)) throw new Error("Unsupported attack type");
    if (observations.needsDps && attackType !== "attack") throw new Error("Attack DPS requires attackType=attack");
    const topK = options.topK ?? 1;
    if (!Number.isInteger(topK) || topK < 1) throw new Error("topK must be positive");
    function ids(name) {
      const value = options[name] || [];
      if (!Array.isArray(value) || value.some(id => typeof id !== "string")) throw new Error(`Invalid ${name}`);
      return [...new Set(value)];
    }
    function threshold(name) {
      const value = options[name] ?? null;
      if (value !== null && !Number.isFinite(value)) throw new Error(`Invalid ${name}`);
      return value;
    }
    if (options.ownedOnly && !Array.isArray(options.ownedCandidateIds)) throw new Error("ownedOnly requires ownedCandidateIds");
    const slots = options.slots ?? EQUIPMENT_SLOTS.map(x => x.slot);
    if (!Array.isArray(slots) || slots.some(slot => !EQUIPMENT_SLOTS.some(x => x.slot === slot))) throw new Error("Unknown slot");
    const mainWeaponSlot = options.mainWeaponSlot ?? null;
    if (mainWeaponSlot!==null && !["武器: 右手", "武器: 左手"].includes(mainWeaponSlot)) throw new Error("Invalid mainWeaponSlot");
    const inputs = standardCalculationInputs({str:skillSim.skills["筋力"], spirit:skillSim.skills["精神力"],
      drunk:skillSim.skills["酩酊"], techMultiplier:1, weaponDamage:0, critRate:0, critMultiplier:1.5,
      ...(options.inputs || {}), raceSelect:race, attackType, targetAC:options.targetAC ?? options.inputs?.targetAC ?? 0});
    const dps = normalizeAttackDpsState(options.dps);
    if (observations.needsDps && (dps.damageSource !== "current" || dps.weaponDelaySource !== "currentWeapon"
      || dps.equipmentBuffDelaySource !== "auto")) throw new Error("Phase 2.5 DPS requires current damage/weapon and automatic delay");
    if (observations.needsDps && (!dps.criticalCancel || !["弓", "銃器"].includes(mainWeaponSkill))) {
      throw new Error("Official DPS currently supports critical-cancel bow/gun models only");
    }
    skillSim.race = race; baseState.skillSim = skillSim;
    return freeze({schemaVersion:1, model:"computeMetrics+calculateAttackDps/context-observations-v2-formal-defense", objective,
      objectiveDirection:objective.direction,constraints,observations,...(secondary?{secondary}:{}),
      legacyDominance:options.constraints===undefined && typeof options.objective!=="object" && objective.direction==="max"
        && ["physicalDamage","attackDps"].includes(objective.metric),
      mainWeaponSkill, weaponType:mainWeaponSkill, mainWeaponSlot, attackType, targetAC:inputs.targetAC, race,
      gender:options.gender || null, skillSim, critRateRequirement:threshold("critRateRequirement"),
      attackDelayRequirement:threshold("attackDelayRequirement"), minAC:threshold("minAC"),
      fixedCandidateIds:ids("fixedCandidateIds"), excludedCandidateIds:ids("excludedCandidateIds"),
      ownedOnly:!!options.ownedOnly, ownedCandidateIds:ids("ownedCandidateIds"), topK, slots:[...new Set(slots)],
      inputs, baseState, dps, runtime:copy(options.runtime || optimizerRuntimeSnapshot())});
  }
  function withRuntime(context, operation, preparationState=null) {
    if (context?.schemaVersion !== 1) throw new Error("SearchContext required");
    const oldState = state, oldNpc = global.MOE_NPC_EFFECT_SLOTS, hadNpc=Object.hasOwn(global,"MOE_NPC_EFFECT_SLOTS");
    const oldData = OPTIMIZER_RUNTIME_DATA_KEYS.map(key => [key, Object.hasOwn(global,key), global[key]]);
    try {
      state = preparationState || copy(context.baseState);
      for (const key of OPTIMIZER_RUNTIME_DATA_KEYS) global[key] = context.runtime.data?.[key] ?? null;
      const npc = context.runtime.npc || {};
      global.MOE_NPC_EFFECT_SLOTS = {getAcDelta:()=>npc.acDelta || 0, getEvasionDelta:()=>npc.evasionDelta || 0,
        getDamageTakenMultiplier:()=>npc.damageTakenMultiplier ?? 1};
      return operation();
    } finally {
      state = oldState;
      if (!hadNpc) delete global.MOE_NPC_EFFECT_SLOTS; else global.MOE_NPC_EFFECT_SLOTS = oldNpc;
      for (const [key, existed, value] of oldData) { if (existed) global[key]=value; else delete global[key]; }
    }
  }
  // Own one state clone for a cooperative preparation segment. Restore all live
  // globals at every yield; reuse only this private segment's clone on resume.
  function createPreparationRuntime(context){const owned=copy(context.baseState);return operation=>withRuntime(context,operation,owned);}
  function evaluate(context, candidates, sources, profile=null, prepared=null) {
    const timed=(key, operation)=>{
      if(!profile)return operation();
      const start=performance.now();
      try{return operation();}finally{profile[key]=(profile[key]||0)+performance.now()-start;}
    };
    return withRuntime(context, () => {
      const evaluationStart=profile?performance.now():0;
      const violations = [];
      const ids = new Set(candidates.map(c => c.candidateId));
      if (ids.size !== candidates.length) violations.push("duplicate-candidate");
      for (const id of context.fixedCandidateIds) if (!ids.has(id)) violations.push("missing-fixed-candidate");
      for (const c of candidates) {
        if (!sources?.[c.sourceRef]) throw new Error("Evaluation requires original candidate sources");
        const reason=prepared?.filterReason
          ?prepared.filterReason(c,sources[c.sourceRef])
          :global.MOEOptimizerV2EffectiveCandidates.filterReason(c,sources[c.sourceRef],context);
        if (reason) violations.push(reason);
        if (!context.slots.includes(c.slot)) violations.push("outside-slots");
        if (context.excludedCandidateIds.includes(c.candidateId)) violations.push("excluded-candidate");
        if (context.ownedOnly && !context.ownedCandidateIds.includes(c.candidateId)) violations.push("not-owned");
      }
      if (new Set(candidates.map(c=>c.slot)).size !== candidates.length) violations.push("duplicate-slot");
      // Fix Buff latest-wins order by slot, independent of catalog/reduction array ordering.
      const rows = timed("rowRestorationMs",()=>candidates.map(c => prepared?.rowFor
        ?prepared.rowFor(c):global.MOEOptimizerV2Candidates.toEquipmentRow(c))
        .sort((a,b)=>EQUIPMENT_SLOTS.findIndex(s=>s.slot===a.slot)-EQUIPMENT_SLOTS.findIndex(s=>s.slot===b.slot)));
      const conflictStart=profile?performance.now():0;
      const hand = slot => rows.find(r=>r.slot===slot);
      const right = hand("武器: 右手"), left = hand("武器: 左手");
      if (right && left && (optimizerWeaponUsesBothHands(right) || optimizerWeaponUsesBothHands(left))) violations.push("two-handed-conflict");
      const conflicts=new Set();
      for (const row of rows) for (const key of optimizerEquipmentConflictKeys(row)) {
        if (conflicts.has(key)) violations.push("equipment-conflict");
        conflicts.add(key);
      }
      if(profile)profile.conflictMs=(profile.conflictMs||0)+performance.now()-conflictStart;
      const combinationStart=profile?performance.now():0;
      const active = {...timed("masteryStateCopyMs",()=>copy(prepared?.masteryBaseState || context.baseState)), equipment:rows};
      // One complete configuration has one equipment layout. The official
      // normalizer still decides hand exclusivity and empty slots; reuse its
      // result only within this evaluation, never across DFS branches.
      const normalizedEquipment=prepared?.buffRow
        ?timed("evaluationEquipmentNormalizationMs",()=>normalizeEquipmentRows(rows)):null;
      const weapon = selectedWeaponForCalc(active,normalizedEquipment);
      const ammo=rows.find(r=>r.slot==="武器: 弾丸"), ammoKind=ammo?optimizerAmmoKind(ammo):"", weaponKind=projectileWeaponKind(weapon);
      if (ammoKind && weaponKind && ammoKind!==weaponKind) violations.push("ammo-incompatible");
      if (context.mainWeaponSkill && (!weapon || (context.mainWeaponSlot && weapon.slot !== context.mainWeaponSlot)
        || !optimizerWeaponSkillNames(weapon).includes(context.mainWeaponSkill))) violations.push("main-weapon-mismatch");
      if(profile)profile.combinationMs=(profile.combinationMs||0)+performance.now()-combinationStart;
      const resolvedCapture=prepared?.useResolvedDps && context.observations.needsDps ? {} : null;
      const metrics = timed("computeMetricsMs",()=>computeMetrics(prepared?.masteryBaseState
        ? {...active,equipment:timed("equipmentRowsCopyMs",()=>copy(rows))} : expandSkillSimMasteryBuffState(active),
        copy(context.inputs),resolvedCapture,prepared?.buffRow
          ? {buffRow:prepared.buffRow,normalizedEquipment,
            equipmentBuffCompositeOnly:prepared.equipmentBuffCompositeOnly} : null));
      if (context.critRateRequirement !== null && metrics.extraStats.extraCritRatePct < context.critRateRequirement) violations.push("crit-rate");
      if (context.attackDelayRequirement !== null && metrics.extraStats.extraAttackDelay > context.attackDelayRequirement) violations.push("attack-delay");
      if (context.minAC !== null && metrics.defense < context.minAC) violations.push("ac");
      const dps = context.observations.needsDps ? timed("calculateAttackDpsMs",()=>calculateAttackDps({cfg:context.dps, weapon:metrics.selectedWeapon,
        currentDamage:Math.floor(metrics.finalDamage), currentWeaponDelay:Math.max(0,metrics.effectiveWeapon.attackInterval),
        delayAuto:resolvedCapture
          ?collectAttackDpsDelaySourcesPrepared(resolvedCapture.normalizedEquipment,resolvedCapture.resolvedBuffState)
          :collectAttackDpsDelaySources(active)})) : null;
      if(context.observations.metrics.some(m=>m.metric==="petGrowth"))metrics.petGrowth=global.MOEPetGrowth.resolve(rows);
      const constraintsStart=profile?performance.now():0;
      const score = global.MOEOptimizerV2Metrics.read(context.objective,metrics,dps);
      for(const constraint of context.constraints) {
        const value=global.MOEOptimizerV2Metrics.read(constraint.metric,metrics,dps);
        if(!Number.isFinite(value) || !(constraint.op==="gte"?value>=constraint.value:constraint.op==="lte"?value<=constraint.value:value===constraint.value)) violations.push(`constraint:${constraint.metric.metric}`);
      }
      if (!Number.isFinite(score)) violations.push("unsupported-or-nonfinite-calculation");
      if(profile){profile.constraintsMs=(profile.constraintsMs||0)+performance.now()-constraintsStart;
        profile.evaluateBodyMs=(profile.evaluateBodyMs||0)+performance.now()-evaluationStart;
        profile.evaluationCount=(profile.evaluationCount||0)+1;}
      const secondaryScore=context.secondary ? global.MOEOptimizerV2Metrics.read(context.secondary,metrics,dps) : null;
      if(context.secondary && !Number.isFinite(secondaryScore)) violations.push("nonfinite-secondary");
      return {...(context.secondary?{secondaryScore,secondaryRankScore:context.secondary.direction==="min"?-secondaryScore:secondaryScore}:{}),score, rankScore:context.objective.direction==="min"?-score:score,
        feasible:violations.length===0, violations, metrics, dps};
    });
  }
  global.MOEOptimizerV2SearchContext = Object.freeze({create, withRuntime,createPreparationRuntime, evaluate});
})(globalThis);
