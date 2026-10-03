/* Conservative facet relevance and formal Optimizer v2 execution. */
(function(global){
  // Objective-only direct facet relevance; eligibility/closure remain per-context.
  const directRelevance=new WeakMap();
  function relevantKeys(context){const keys=new Set();for(const m of context.observations.metrics){
    if(m.metric==='skillPlus')keys.add('skillPlus:'+m.skillName);
    if(m.metric==='magic')for(const k of ['stat:magic','stat:magicPct'])keys.add(k);
    if(m.metric==='avoid')for(const k of ['stat:extraAvoid','stat:extraAvoidPct'])keys.add(k);
    if(m.metric==='resistance')for(const k of ['stat:extra'+m.element+'Res','stat:extra'+m.element+'ResPct'])keys.add(k);
  }return keys;}
  function prepare(items,context,options={}){return global.MOEOptimizerV2Candidates.drainPreparation(prepareSteps(items,context,options),context,false);}
  function prepareAsync(items,context,options={}){return global.MOEOptimizerV2Candidates.cooperatePreparation(prepareSteps(items,context,options),{...options,context,initialRuntime:false,
    initialProgress:{phase:'catalog',processed:0,total:items.length}});}
  function* prepareSteps(items,context,{project=global.MOEEquipmentEffectFacetCatalog.project,magicReduction=true,lexicographicReduction=true,candidateCache=true}={}){
    if(context.objective.metric==='petGrowth')return yield* global.MOEPetGrowth.prepareSteps(items,context);
    yield {phase:'catalog',processed:0,total:items.length};
    const catalogPreparation=candidateCache?global.MOEOptimizerV2Candidates.createCatalogPreparation():null;
    const avoidResistance=lexicographicReduction&&context.objective.metric==='avoid'&&context.objective.direction==='max'
      &&context.secondary?.metric==='resistance'&&context.secondary.direction==='max'&&!context.constraints.length&&!context.mainWeaponSkill&&!context.mainWeaponSlot;
    const magicResistance=lexicographicReduction&&context.objective.metric==='magic'&&context.objective.direction==='max'
      &&context.secondary?.metric==='resistance'&&context.secondary.direction==='max'&&!context.constraints.length
      &&!context.fixedCandidateIds.length&&!context.excludedCandidateIds.length&&!context.mainWeaponSkill&&!context.mainWeaponSlot;
    const combined=lexicographicReduction&&context.objective.metric==='skillPlus'&&context.objective.direction==='max'
      &&['magic','avoid'].includes(context.secondary?.metric)&&context.secondary.direction==='max'&&!context.constraints.length
      &&(context.secondary.metric==='avoid'||!context.fixedCandidateIds.length&&!context.excludedCandidateIds.length)&&!context.mainWeaponSkill&&!context.mainWeaponSlot;
    const keys=relevantKeys(context),selected=[],classification=[],objectiveKey=JSON.stringify([...keys].sort()),objectiveCache={hits:0,misses:0};
    // All Buff-bearing bridges remain until runtime order-independent closure is
    // proved for these new multi-stat contexts. This is a conservative closure
    // superset, not a private resolver or an assertion that every Buff is relevant.
    for(const item of items){yield {phase:'catalog',processed:classification.length,total:items.length};const p=project(item);let direct;
      if(catalogPreparation&&Object.isFrozen(p)){
        let entries=directRelevance.get(p);if(!entries){entries=new Map();directRelevance.set(p,entries);}
        if(entries.has(objectiveKey)){objectiveCache.hits++;direct=entries.get(objectiveKey);}
        else{objectiveCache.misses++;direct=p.facets.some(f=>keys.has(f.key)&&f.sources.some(s=>s.value!==0));entries.set(objectiveKey,direct);}
      }else direct=p.facets.some(f=>keys.has(f.key)&&f.sources.some(s=>s.value!==0));
      const row=catalogPreparation?catalogPreparation.read(item).row:catalogEquipmentToRow(item);
      const unknown=!!row.equipBuffEnabled;
      const structural=optimizerEquipmentConflictKeys(row).length>0 || optimizerWeaponUsesBothHands(row);
      const keep=direct||unknown||structural||context.fixedCandidateIds.length>0;
      classification.push({catalogId:item.catalogId||item.id,name:item.name,reason:direct?'direct-facet':unknown?'unproved-buff-order-closure':structural?'structural-safety':'objective-irrelevant-no-buff',retained:keep});
      if(keep)selected.push(item);
    }
    const snapshot=yield* global.MOEOptimizerV2Candidates.generateSteps({items:selected,catalogPreparation});
    yield {phase:'reducer',processed:0,total:snapshot.candidates.length,runtime:true};
    // Reuse the proved interaction closure for skillPlus and standalone additive stats.
    const reduction=(avoidResistance||magicResistance||context.objective.metric==='skillPlus'&&(!context.secondary||combined)||['avoid','resistance'].includes(context.objective.metric)&&!context.secondary)&&!context.constraints.length
      ?yield* global.MOEOptimizerV2MetricCandidateReducer.reduceSteps(snapshot,context)
      :yield* global.MOEOptimizerV2EffectiveCandidates.reduceSteps(snapshot,context);
    yield {phase:'equivalence',processed:0,total:reduction.candidates.length,runtime:false};
    if(!reduction.metricReducer?.applied) {
      // Fixed-context simple stats do not read raw requirements or damage/range.
      // Preserve hand/ammo legality and every normalized pre-conflict Buff field.
      const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
      const key=v=>JSON.stringify(stable(v));const byId=new Map(reduction.effectiveCandidates.map(e=>[e.candidateId,e]));
      const groups=new Map();
      for(const candidate of reduction.candidates){const e=byId.get(candidate.candidateId),row=global.MOEOptimizerV2Candidates.toEquipmentRow(candidate),x=e.semantics;
        yield {phase:'equivalence',processed:groups.size,total:reduction.candidates.length};
        const signature={slot:x.slot,hand:x.weaponHand,restrictions:x.restrictions,hardConflicts:x.hardConflicts,
          weaponRole:!!x.weapon,twoHanded:optimizerWeaponUsesBothHands(row),projectile:projectileWeaponKind(row),ammo:optimizerAmmoKind(row),
          base:x.observedBase,extra:x.observedExtra,buffs:x.buffs,stack:x.buffStackKeys,
          protection:e.protectedReasons.filter(r=>r!=='resolved-buff-interaction'),uncertain:e.protectedReasons.some(r=>r!=='resolved-buff-interaction')?candidate.candidateId:null};
        const k=key([context.objective,context.secondary||null,context.constraints,signature]);
        if(!groups.has(k))groups.set(k,[]);groups.get(k).push(candidate);
      }
      const prior=reduction.contextEquivalentClasses;
      const classes=[...groups].map(([equivalenceKey,list])=>{
        const members=list.flatMap(c=>prior.find(g=>g.representativeCandidateId===c.candidateId).equivalentCandidates).sort((a,b)=>a.candidateId<b.candidateId?-1:1);
        const representativeCandidate=members[0];return Object.freeze({equivalenceKey,representativeCandidate,representativeCandidateId:representativeCandidate.candidateId,
          equivalentCandidates:Object.freeze(members),equivalentCandidateIds:Object.freeze(members.map(c=>c.candidateId)),equivalenceReason:'fixed-context-facet-stat',retainedRepresentativeCandidateId:representativeCandidate.candidateId});
      });
      reduction.contextEquivalentClasses=Object.freeze(classes);reduction.equivalentClasses=reduction.contextEquivalentClasses;reduction.equivalentGroups=reduction.contextEquivalentClasses;
      reduction.candidates=classes.map(c=>c.representativeCandidate);
    }
    // Keep the existing equivalence keys, resolver prototypes and aliases.
    // Zero relevance alone does NOT prove preservation of K distinct entries.
    // Only delete a class with K retained, strictly better legal replacements.
    const magicScope=(context.objective.metric==='magic'&&context.objective.direction==='max'&&!context.secondary||combined&&reduction.metricReducer?.applied)&&!context.constraints.length
      &&!context.fixedCandidateIds.length&&!context.excludedCandidateIds.length&&(!combined||context.secondary.metric==='magic');
    if(magicScope){
      yield {phase:'finalize',processed:0,total:reduction.candidates.length,runtime:true};
      const reducerStarted=performance.now();
      const before=reduction.contextEquivalentClasses,byId=new Map(reduction.effectiveCandidates.map(e=>[e.candidateId,e]));
      const oldOrder=context.slots.slice().sort((a,b)=>(a===context.mainWeaponSlot?-1:b===context.mainWeaponSlot?1:0)
        ||before.filter(c=>c.representativeCandidate.slot===a).length-before.filter(c=>c.representativeCandidate.slot===b).length
        ||context.slots.indexOf(a)-context.slots.indexOf(b));
      const groups=new Map(),rows=new Map();let minimumMultiplier=1,maximumMultiplier=1,absoluteFlat=0,finite=!context.mainWeaponSkill;
      const pct=p=>{p=+p||0;if(!Number.isFinite(p)||p<=-100)finite=false;
        else if(p<0)minimumMultiplier*=1+p/100;else maximumMultiplier*=1+p/100;};
      const fixed=expandSkillSimMasteryBuffState(context.baseState);
      absoluteFlat+=Math.abs(global.MOEOptimizerV2SearchContext.evaluate(context,[],snapshot.sources).metrics.baseMagicFromSpirit);
      for(const r of normalizeFlatRows(fixed))if(r.enabled&&(r.target||'magic')==='magic')absoluteFlat+=Math.abs(+r.value||0);
      for(const r of fixed.pct||[])if(r.enabled&&!r.excluded&&r.target==='magic')pct(r.percent);
      for(const r of normalizeCompositeRows(fixed.composite))if(r.enabled&&!r.excluded){pct(r.magicPct);absoluteFlat+=Math.abs(+r.flatMagic||0);}
      // Same formal interaction-closure and order-crossing guard used by the
      // simple metric reducer. Disconnected Buffs cannot affect target winners.
      const entries=before.map(cls=>{const e=byId.get(cls.representativeCandidateId),tokens=new Set(e.proofStackKeys.filter(Boolean).map(k=>'stack:'+k));
        for(const b of e.proofBuffs)for(const g of resolveAllBuffRowsForGroups({composite:[b]}).groups)tokens.add('group:'+g.group.toLowerCase());
        return {cls,e,tokens,relevant:e.proofBuffs.some(b=>+b.flatMagic!==0||+b.magicPct!==0
          ||combined&&global.MOESkillPlusV21.totalForSkill(skillPlusTotalsFromResolvedState({composite:[b]}),context.objective.skillName)!==0)};});
      const visited=new Set();for(const c of collectActiveBuffConflictCandidates(fixed))
        for(const g of [c.group,...splitTags(c.row.tags)].filter(Boolean))visited.add('group:'+g.toLowerCase());
      for(const x of entries)if(x.relevant)for(const token of x.tokens)visited.add(token);
      let changed=true;while(changed){changed=false;for(const x of entries)if([...x.tokens].some(t=>visited.has(t)))for(const t of x.tokens)if(!visited.has(t)){visited.add(t);changed=true;}}
      for(const x of entries)x.connected=x.relevant||[...x.tokens].some(t=>visited.has(t));
      const priorityRows=collectActiveBuffConflictCandidates({...fixed,other:[]});
      for(const x of entries)if(x.connected)priorityRows.push(...collectActiveBuffConflictCandidates({composite:x.e.proofBuffs}));
      const maxOrder=(fixed.composite||[]).length+(fixed.post||[]).length+context.slots.length+1;
      const intervals=priorityRows.map(c=>({first:buffGroupResolveScore(c.row,0,c.type),last:buffGroupResolveScore(c.row,maxOrder,c.type)}));
      const orderSafe=!intervals.some(a=>!Number.isFinite(a.first)||!Number.isFinite(a.last)||intervals.some(b=>
        ((a.first!==a.last)!==(b.first!==b.last)||a.first!==a.last&&a.first!==b.first)&&Math.max(a.first,b.first)<=Math.min(a.last,b.last)));
      const connected=new Map(entries.map(x=>[x.cls.representativeCandidateId,x.connected]));
      for(const cls of before){const c=cls.representativeCandidate,e=byId.get(c.candidateId),row=global.MOEOptimizerV2Candidates.toEquipmentRow(c);
        yield {phase:'finalize',processed:rows.size,total:before.length};
        rows.set(c.candidateId,row);absoluteFlat+=Math.abs(+row.magic||0);
        for(const b of e.proofBuffs||[]){pct(b.magicPct);absoluteFlat+=Math.abs(+b.flatMagic||0);}
        // This is the existing key, with ONLY the directly read flat number
        // removed. All other fields (including irrelevant Buff metadata) stay.
        const signature=JSON.parse(cls.equivalenceKey),semantics=signature[combined?2:3];
        if(combined)delete semantics.bodyMagic;else delete semantics.base.magic;
        if(orderSafe&&!connected.get(c.candidateId)){semantics.buffs=[];if(combined)semantics.stackKeys=[];else semantics.stack=[];}
        const key=JSON.stringify(signature);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(cls);
      }
      const witnesses=[],removed=new Set();let comparisons=0;
      const operationCount=before.length*8+normalizeFlatRows(fixed).length*4
        +(fixed.pct||[]).length*8+(fixed.composite||[]).length*16+32;
      if(operationCount*Number.EPSILON>=0.001||!Number.isFinite(maximumMultiplier)||!Number.isFinite(absoluteFlat))finite=false;
      const error=Number.EPSILON*128*operationCount*(1+absoluteFlat)*maximumMultiplier;
      if(finite&&Number.isFinite(minimumMultiplier)&&minimumMultiplier>0)for(const list of groups.values()){
        const sorted=list.slice().sort((a,b)=>(+rows.get(b.representativeCandidateId).magic||0)-(+rows.get(a.representativeCandidateId).magic||0)
          ||(a.equivalenceKey<b.equivalenceKey?-1:1));
        const retained=sorted.slice(0,context.topK);
        for(const cls of sorted.slice(context.topK)){const value=+rows.get(cls.representativeCandidateId).magic||0;
          yield {phase:'finalize',processed:comparisons,total:before.length*context.topK};
          comparisons+=retained.length;
          if(retained.every(a=>((+rows.get(a.representativeCandidateId).magic||0)-value)*minimumMultiplier>error)){
            removed.add(cls.representativeCandidateId);witnesses.push({id:cls.representativeCandidateId,witnesses:retained.map(a=>a.representativeCandidateId)});
          }
        }
      }
      reduction.magicReduction={applied:magicReduction,oldClasses:before.length,structuralGroups:groups.size,comparisons,
        provenRemovable:removed.size,removed:magicReduction?witnesses:[],dryRunWitnesses:witnesses,minimumMultiplier,
        reason:finite?'strict-K-replacement':'nonpositive-or-nonfinite-percentage',orderSafe,
        directBuffClasses:entries.filter(x=>x.relevant).length,closureClasses:entries.filter(x=>x.connected&&!x.relevant).length,
        disconnectedBuffClasses:entries.filter(x=>!x.connected&&x.e.proofBuffs.length).length,
        slotBefore:Object.fromEntries(context.slots.map(s=>[s,before.filter(c=>c.representativeCandidate.slot===s).length]))};
      if(magicReduction){const classes=before.filter(c=>!removed.has(c.representativeCandidateId));
        reduction.contextEquivalentClasses=Object.freeze(classes);reduction.equivalentClasses=reduction.contextEquivalentClasses;reduction.equivalentGroups=reduction.contextEquivalentClasses;
        reduction.candidates=classes.map(c=>c.representativeCandidate);
        if(!combined)reduction.magicOriginalSlotOrder=oldOrder;
      }
      reduction.magicReduction.elapsedMs=performance.now()-reducerStarted;
    }
    yield {phase:'finalize',processed:1,total:1,runtime:false};
    return {snapshot,reduction,classification,diagnostics:{input:items.length,relevant:selected.length,classes:reduction.candidates.length,catalogCache:catalogPreparation?.diagnostics||null,objectiveCache}};
  }
  async function run(prepared,{signal,onProgress,...options}={}){
    const controller=global.MOEOptimizerV2BranchAndBound.run(prepared.reduction,{...options,signal,cooperative:true});
    try{while(true){const next=controller.step();if(next.done)return next.value;onProgress?.(next.value);await new Promise(resolve=>setTimeout(resolve,0));}}
    finally{controller.close();}
  }
  global.MOEOptimizerV2FacetSearch=Object.freeze({relevantKeys,prepare,prepareAsync,prepareSteps,run});
})(globalThis);
