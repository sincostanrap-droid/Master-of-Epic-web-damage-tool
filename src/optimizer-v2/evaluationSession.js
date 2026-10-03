/* One-search prepared evaluator. No global cache or game formulas. */
(function(global){
  "use strict";
  function copy(value){
    if(Array.isArray(value))return value.map(copy);
    if(value && typeof value==="object")return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,copy(item)]));
    return value; // Preserve NaN, infinities and undefined if the formal row contains them.
  }
  function canonical(value){
    if(Array.isArray(value))return value.map(canonical);
    if(value && typeof value==="object")return Object.fromEntries(
      Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
    return value;
  }
  function rowKey(value){
    if(value===null)return 'null';
    if(value===undefined)return 'undefined';
    if(typeof value==='number')return `number:${Object.is(value,-0)?'-0':String(value)}`;
    if(typeof value==='string')return `string:${JSON.stringify(value)}`;
    if(typeof value==='boolean')return `boolean:${value}`;
    if(Array.isArray(value)){
      const parts=value.map(rowKey);
      return parts.includes(null)?null:`array:[${parts.join(',')}]`;
    }
    if(value && Object.getPrototypeOf(value)===Object.prototype){
      const parts=Object.keys(value).sort().map(key=>{
        const part=rowKey(value[key]);return part===null?null:`${JSON.stringify(key)}:${part}`;
      });
      return parts.includes(null)?null:`object:{${parts.join(',')}}`;
    }
    return null; // Unknown value type: do not cache an ambiguous key.
  }
  function freeze(value){
    if(value && typeof value==='object' && !Object.isFrozen(value)){
      Object.values(value).forEach(freeze);Object.freeze(value);
    }
    return value;
  }
  // Context wrappers are per-reduction; only source-bound read-only inputs are shared.
  // Projection-specific protection and all conflict winners remain outside it.
  let sharedSignature=null,sharedArtifacts=new WeakMap(),sharedFunctions=[];
  function createCandidatePreparation(context,sources,{catalogSignature=null}={}){
    if(context?.schemaVersion!==1 || !Object.isFrozen(context) || !sources || !Object.isFrozen(sources))
      throw new Error('Immutable context and sources required');
    const entries=new Map(),byRow=new Map(),projections=new Map();
    const signature=catalogSignature===null?null:JSON.stringify([catalogSignature,context.runtime.data]);
    const functions=[normalizeEquipmentCandidate,resolveEquipmentBuffRow,equipmentBuffToCompositeRow,normalizeCompositeRows,equipmentBuffHasEffect];
    if(signature!==null&&(signature!==sharedSignature||functions.some((f,i)=>f!==sharedFunctions[i]))){sharedArtifacts=new WeakMap();sharedSignature=signature;sharedFunctions=functions;}
    const shared=signature===null?null:sharedArtifacts;
    const diagnostics={artifactBuildCount:0,artifactHitCount:0,artifactMissCount:0,
      artifactBuildMs:0,buffBuildCount:0,compositeBuildCount:0,evaluationPrototypeReuseCount:0,sharedRowHits:0,sharedRowMisses:0,sharedBuffHits:0,projectionHits:0,projectionMisses:0};
    function assertContext(other,otherSources){
      if(other!==context || otherSources!==sources)throw new Error('Candidate preparation context/source mismatch');
    }
    function artifact(candidate){
      if(!Object.isFrozen(candidate))throw new Error('Immutable candidate snapshot required');
      const prior=entries.get(candidate.candidateId);
      if(prior){
        if(prior.candidate!==candidate)throw new Error('Candidate preparation snapshot mismatch');
        diagnostics.artifactHitCount++;return prior;
      }
      const start=performance.now();
      const cached=shared?.get(candidate);
      if(cached){const entry={candidate,row:cached.row,buff:cached.buff,evaluationPrototype:undefined};entries.set(candidate.candidateId,entry);if(cached.buff&&cached.key!==null)byRow.set(cached.key,entry);diagnostics.sharedRowHits++;return entry;}
      // toEquipmentRow copies evaluationFields before the official normalizer;
      // this fresh result is owned here and can be frozen without another copy.
      const row=freeze(global.MOEOptimizerV2Candidates.toEquipmentRow(candidate));
      const entry={candidate,row,buff:null,evaluationPrototype:undefined};
      entries.set(candidate.candidateId,entry);
      if(shared){shared.set(candidate,{row,buff:null});diagnostics.sharedRowMisses++;}
      diagnostics.artifactBuildCount++;diagnostics.artifactMissCount++;
      diagnostics.artifactBuildMs+=performance.now()-start;
      return entry;
    }
    function buff(entry){
      if(entry.buff){if(shared)diagnostics.sharedBuffHits++;return entry.buff;}
      const start=performance.now(),resolved=resolveEquipmentBuffRow(copy(entry.row));
      const hasEffect=equipmentBuffHasEffect(resolved);
      const stackKey=hasEffect?equipmentBuffStackKey(resolved):'';
      const compositePrototype=hasEffect?equipmentBuffToCompositeRow(resolved):null;
      const normalizedCompositePrototype=hasEffect?normalizeCompositeRows([compositePrototype])[0]:null;
      entry.buff=freeze({resolved:copy(resolved),hasEffect,stackKey,
        compositePrototype:copy(compositePrototype),normalizedCompositePrototype:copy(normalizedCompositePrototype)});
      const key=rowKey(entry.row);if(key!==null)byRow.set(key,entry);
      if(shared)shared.set(entry.candidate,{row:entry.row,buff:entry.buff,key});
      diagnostics.buffBuildCount++;if(hasEffect)diagnostics.compositeBuildCount++;
      diagnostics.artifactBuildMs+=performance.now()-start;
      return entry.buff;
    }
    function preparedRow(row){
      const key=rowKey(row),entry=key===null?null:byRow.get(key);
      if(!entry)return null; // Formal normalized layout may differ; retain session fallback.
      diagnostics.artifactHitCount++;
      const data=buff(entry);
      if(data.hasEffect && entry.evaluationPrototype===undefined){
        // Evaluation's official sequence restores compatibility once more.
        // Reuse only after exact structural equality, never assumed idempotence.
        const repaired=restoreEquipmentBuffCompatibilityGroups(copy(data.resolved));
        if(rowKey(repaired)===rowKey(data.resolved)){
          entry.evaluationPrototype=data.compositePrototype;diagnostics.evaluationPrototypeReuseCount++;
        }else entry.evaluationPrototype=freeze(copy(equipmentBuffToCompositeRow(repaired)));
      }
      return {resolved:copy(data.resolved),hasEffect:data.hasEffect,stackKey:data.stackKey,
        copyComposite:()=>copy(entry.evaluationPrototype)};
    }
    // Projection/bound helpers only read these recursively frozen rows. Formal
    // evaluation uses rowFor (copy), never this read-only view.
    return Object.freeze({diagnostics,assertContext,projectFor:(candidate,other,source,row,singleton,build)=>{
      if(other!==context)throw new Error('Candidate projection context mismatch');
      if(!shared||source!==sources[candidate.sourceRef]||row!==artifact(candidate).row)return build();
      const prior=projections.get(candidate);
      if(prior&&prior.singleton===singleton){diagnostics.projectionHits++;return prior.value;}
      diagnostics.projectionMisses++;const value=freeze(build());projections.set(candidate,{value,singleton});return value;
    },readRow:c=>artifact(c).row,rowFor:c=>copy(artifact(c).row),
      buffFor:c=>buff(artifact(c)),preparedRow});
  }
  function create(context,sources,{rows,candidates=[],preparation=null,preparedStateAssembly=true}={}){
    if(context?.schemaVersion!==1 || !sources)throw new Error("SearchContext and candidate sources required");
    if(!Object.isFrozen(context) || !Object.isFrozen(sources))throw new Error("Immutable context and sources required");
    preparation?.assertContext(context,sources);
    // SearchContext.create freezes its JSON-compatible calculation/runtime snapshot.
    // The full signature covers objective, constraints, skillSim, inputs, NPC,
    // Buff/compatibility runtime data and future context fields without a hash collision.
    const evaluationContextSignature=JSON.stringify(canonical(context));
    if(!evaluationContextSignature)throw new Error("SearchContext signature unavailable");
    // Mastery generation reads global state.skillSim and the runtime knowledge
    // table. withRuntime supplies exactly this immutable SearchContext snapshot.
    const masteryStart=performance.now();
    const masteryBaseState=global.MOEOptimizerV2SearchContext.withRuntime(context,()=>
      expandSkillSimMasteryBuffState(context.baseState));
    const masteryPreparationMs=performance.now()-masteryStart;
    const rowCache=new Map([...(rows||[])].map(([id,row])=>[id,copy(row)])),filterCache=new Map();
    const buffRowCache=new Map();
    const candidateRefs=new Map(candidates.map(candidate=>[candidate.candidateId,candidate]));
    let disposed=false;
    const diagnostics={preparedHitCount:0,preparedMissCount:rowCache.size,
      filterHitCount:0,filterMissCount:0,evaluationCacheHitCount:0,evaluationCacheMissCount:0,
      computeMetricsCalls:0,calculateAttackDpsCalls:0,
      buffRowHitCount:0,buffRowMissCount:0,
      stackKeyPreparedHitCount:0,stackKeyPreparedMissCount:0,
      compositePrototypeHitCount:0,compositePrototypeMissCount:0,
      masteryPreparedHitCount:0,masteryPreparedMissCount:1,masteryPreparationMs};
    diagnostics.avoidedEquipmentBuffStateClones=0;
    function assertActive(){if(disposed)throw new Error("EvaluationSession disposed");}
    function assertContext(other,otherSources){
      assertActive();
      if(other!==context || otherSources!==sources)
        throw new Error("EvaluationSession context/source mismatch");
    }
    function assertCandidate(candidate){
      const prior=candidateRefs.get(candidate.candidateId);
      if(prior && prior!==candidate)throw new Error("EvaluationSession candidate snapshot mismatch");
      if(!Object.isFrozen(candidate))throw new Error("Immutable candidate snapshot required");
      if(!prior)candidateRefs.set(candidate.candidateId,candidate);
    }
    function rowFor(candidate){
      assertActive();
      assertCandidate(candidate);
      let row=rowCache.get(candidate.candidateId);
      if(row){diagnostics.preparedHitCount++;return copy(row);}
      row=preparation?preparation.rowFor(candidate):global.MOEOptimizerV2Candidates.toEquipmentRow(candidate);
      rowCache.set(candidate.candidateId,row);diagnostics.preparedMissCount++;
      return copy(row);
    }
    function filterReason(candidate,source){
      assertActive();
      assertCandidate(candidate);
      if(filterCache.has(candidate.candidateId)){
        diagnostics.filterHitCount++;return filterCache.get(candidate.candidateId);
      }
      const reason=global.MOEOptimizerV2EffectiveCandidates.filterReason(candidate,source,context,
        preparation?()=>rowFor(candidate):undefined);
      filterCache.set(candidate.candidateId,reason);diagnostics.filterMissCount++;
      return reason;
    }
    // The official resolver and effect predicate depend only on this normalized
    // equipment row and the frozen runtime tables. The returned row is copied:
    // compatibility restoration later mutates it within a complete evaluation.
    function buffRow(row){
      assertActive();
      const shared=preparation?.preparedRow(row);
      if(shared){
        diagnostics.buffRowHitCount++;diagnostics.stackKeyPreparedHitCount++;
        if(shared.hasEffect)diagnostics.compositePrototypeHitCount++;
        return shared;
      }
      const key=rowKey(row);
      let entry=key===null?null:buffRowCache.get(key);
      if(!entry){
        const resolved=resolveEquipmentBuffRow(row);
        const hasEffect=equipmentBuffHasEffect(resolved);
        const stackKey=hasEffect?equipmentBuffStackKey(resolved):'';
        // Exact candidate-local sequence from expandEquipmentBuffState, before
        // same-technic selection. The selected prototype is copied only after
        // the official resolver has chosen the latest row for this build.
        const compositePrototype=hasEffect?equipmentBuffToCompositeRow(
          restoreEquipmentBuffCompatibilityGroups(copy(resolved))):null;
        entry={resolved:copy(resolved),hasEffect,stackKey,compositePrototype};
        if(key!==null)buffRowCache.set(key,entry);
        diagnostics.buffRowMissCount++;
        diagnostics.stackKeyPreparedMissCount++;
        if(hasEffect)diagnostics.compositePrototypeMissCount++;
      } else {
        diagnostics.buffRowHitCount++;
        diagnostics.stackKeyPreparedHitCount++;
        if(entry.hasEffect)diagnostics.compositePrototypeHitCount++;
      }
      return {resolved:copy(entry.resolved),hasEffect:entry.hasEffect,stackKey:entry.stackKey,
        copyComposite:()=>copy(entry.compositePrototype)};
    }
    function evaluate(candidates,profile=null){
      assertContext(context,sources);
      // DFS over one class per slot has no repeated complete configuration.
      // Deliberately avoid retaining large mutable metrics in an ineffective cache.
      diagnostics.evaluationCacheMissCount++;
      diagnostics.masteryPreparedHitCount++;
      diagnostics.computeMetricsCalls++;
      if(preparedStateAssembly)diagnostics.avoidedEquipmentBuffStateClones++;
      if(context.observations.needsDps)diagnostics.calculateAttackDpsCalls++;
      return global.MOEOptimizerV2SearchContext.evaluate(context,candidates,sources,profile,
        {rowFor,filterReason,buffRow,masteryBaseState,useResolvedDps:true,
          equipmentBuffCompositeOnly:preparedStateAssembly});
    }
    function dispose(){rowCache.clear();filterCache.clear();buffRowCache.clear();candidateRefs.clear();disposed=true;}
    return {evaluationContextSignature,diagnostics,assertContext,rowFor,filterReason,evaluate,dispose};
  }
  global.MOEOptimizerV2EvaluationSession=Object.freeze({create,createCandidatePreparation});
})(globalThis);
