/* Exact-search prefix profiler. The callback stops the probe and returns no ranking. */
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const {objectiveContexts}=require('./inspect-optimizer-v2-objectives.cjs');
const runtimeStart=performance.now(),p=contextRuntime(),runtimeMs=performance.now()-runtimeStart;
const catalogStart=performance.now(),snapshot=p.MOEOptimizerV2Candidates.generate(),catalogMs=performance.now()-catalogStart;
const contextStart=performance.now(),contexts=objectiveContexts(p,20),contextMs=performance.now()-contextStart;
const name=process.argv[2]||'gun';
const order=process.argv[3]||'fewest',limit=Number(process.argv[4]||1000);
const boundMode=process.argv[5]||'phase3.5';
const evaluationMode=process.argv[6]||'prepared';
const projectionMode=process.argv[7]||'optimized';
const sharedPreparation=process.argv[8]!=='legacy';
const assemblyMode=process.argv[9]||'optimized';
if(!['optimized','legacy'].includes(assemblyMode))throw new Error('assembly mode must be optimized or legacy');
if(!contexts[name] || !Number.isInteger(limit) || limit<1)throw new Error('Usage: node profile-optimizer-v2-search.cjs gun|ac|skillPlus order limit');
if(!['prepared','legacy'].includes(evaluationMode))throw new Error('evaluation mode must be prepared or legacy');
if(!['optimized','legacy'].includes(projectionMode))throw new Error('projection mode must be optimized or legacy');
const innerTimes={},calls={},computeStageTimes={},computeStageCalls={},
  equipmentStageTimes={},equipmentStageCalls={},sameTechnicStageTimes={},sameTechnicStageCalls={},
  resolverStageTimes={},resolverStageCalls={};
const reductionCalls={},reductionTimes={};let phase='reduction';
const pipelineDetail=process.env.MOE_PROFILE_DETAIL==='1'
  ?require('./profile-optimizer-v2-pipeline.cjs').install(p,{enabled:()=>phase==='search'}):null;
const candidateCalls={},candidateObjects=new WeakMap();let currentCandidate=null;
const recordCandidate=(helper,elapsed,id=currentCandidate)=>{
  if(!id)return;
  const item=candidateCalls[helper]||(candidateCalls[helper]={calls:0,ms:0,ids:{}});
  item.calls++;item.ms+=elapsed;item.ids[id]=(item.ids[id]||0)+1;
};
let inCompute=0,inEquipment=0,inSameTechnic=0,inResolver=0;
const originalApi=p.MOEOptimizerV2Candidates;
p.MOEOptimizerV2Candidates=Object.freeze({...originalApi,toEquipmentRow(...args){
  const target=phase==='reduction'?reductionCalls:calls;
  target.candidateToRow=(target.candidateToRow||0)+1;
  const started=process.env.MOE_PROFILE_INNER==='1'?performance.now():0;
  const prior=currentCandidate;currentCandidate=args[0]?.candidateId;
  try{const result=originalApi.toEquipmentRow(...args);candidateObjects.set(result,currentCandidate);return result;}finally{
    recordCandidate('candidateToRow',started?performance.now()-started:0);currentCandidate=prior;
    if(started){const times=phase==='reduction'?reductionTimes:innerTimes;
      times.candidateToRow=(times.candidateToRow||0)+performance.now()-started;}}
}});
for(const helper of ['computeMetrics','calculateAttackDps','expandEquipmentBuffState',
  'applyBuffGroupRules','normalizeEquipmentRows','expandCompositeState',
  'resolveAllBuffRowsForGroups','clone','standardCalculationInputs',
  'expandSkillSimMasteryBuffState','skillSimMasteryBuffRows',
  'resolveEquipmentBuffRowsForSameTechnic','resolveEquipmentBuffRow',
  'equipmentBuffHasEffect','equipmentBuffStackKey',
  'normalizeEquipmentCandidate','normalizeAdditionalEffects','equipmentBuffCompositeTags',
  'equipmentBuffManualConflictGroup','equipmentBuffAutoStackGroup',
  'restoreEquipmentBuffCompatibilityGroups','equipmentBuffToCompositeRow',
  'normalizeCompositeRows','collectActiveBuffConflictCandidates','splitTags',
  'buffGroupName','buffGroupResolveScore','compositeGroupScore','compositeEffectText',
  'skillPlusTotalsFromResolvedState','attackDelayBSourcesFromResolvedState',
  'normalizeFlatRows','applyPercentStats','effectiveWeaponStats','calcWeaponSkillMod',
  'calcConversions','calcPctAttack','collectAttackDpsDelaySources',
  'collectAttackDpsDelaySourcesPrepared','selectedWeaponForCalc',
  'optimizerEquipmentConflictKeys','emptyExtraStats','addExtraStatsInto']) {
  const original=p[helper];
  if(typeof original!=='function')continue;
  p[helper]=function(...args){const target=phase==='reduction'?reductionCalls:calls;
    target[helper]=(target[helper]||0)+1;
    const start=process.env.MOE_PROFILE_INNER==='1'?performance.now():0;
    const inside=inCompute>0,insideEquipment=inEquipment>0,insideSame=inSameTechnic>0,
      insideResolver=inResolver>0;
    if(helper==='computeMetrics')inCompute++;
    if(helper==='expandEquipmentBuffState')inEquipment++;
    if(helper==='resolveEquipmentBuffRowsForSameTechnic')inSameTechnic++;
    if(helper==='resolveAllBuffRowsForGroups')inResolver++;
    const priorCandidate=currentCandidate;
    const first=args[0];
    const owner=first && candidateObjects.get(first) || (Array.isArray(first) && first.length===1 && candidateObjects.get(first[0]));
    if(owner)currentCandidate=owner;
    try{const result=original.apply(this,args);
      if(currentCandidate && result && typeof result==='object'){
        candidateObjects.set(result,currentCandidate);
        if(Array.isArray(result))for(const row of result)if(row && typeof row==='object')candidateObjects.set(row,currentCandidate);
      }
      return result;
    }finally{
      recordCandidate(helper,start?performance.now()-start:0);currentCandidate=priorCandidate;
      if(helper==='computeMetrics')inCompute--;
      if(helper==='expandEquipmentBuffState')inEquipment--;
      if(helper==='resolveEquipmentBuffRowsForSameTechnic')inSameTechnic--;
      if(helper==='resolveAllBuffRowsForGroups')inResolver--;
      if(start){const elapsed=performance.now()-start;
        const times=phase==='reduction'?reductionTimes:innerTimes;
        times[helper]=(times[helper]||0)+elapsed;
        if(phase!=='reduction' && inside){computeStageTimes[helper]=(computeStageTimes[helper]||0)+elapsed;
          computeStageCalls[helper]=(computeStageCalls[helper]||0)+1;}
        if(phase!=='reduction' && insideEquipment){equipmentStageTimes[helper]=(equipmentStageTimes[helper]||0)+elapsed;
          equipmentStageCalls[helper]=(equipmentStageCalls[helper]||0)+1;}
        if(phase!=='reduction' && insideSame){sameTechnicStageTimes[helper]=(sameTechnicStageTimes[helper]||0)+elapsed;
          sameTechnicStageCalls[helper]=(sameTechnicStageCalls[helper]||0)+1;}
        if(phase!=='reduction' && insideResolver){resolverStageTimes[helper]=(resolverStageTimes[helper]||0)+elapsed;
          resolverStageCalls[helper]=(resolverStageCalls[helper]||0)+1;}}
    }};
}
const reductionStart=performance.now();
const reductionProfile={};
const reduction=p.MOEOptimizerV2EffectiveCandidates.reduce(snapshot,contexts[name],reductionProfile,
  {reuseNormalizedSingleton:projectionMode==='optimized',sharedPreparation});
const reductionMs=performance.now()-reductionStart;
phase='search';
const STOP=Symbol('profile-stop');let progress;
try {
  const completed=p.MOEOptimizerV2BranchAndBound.run(reduction,{slotOrder:order,boundMode,
    preparedEvaluation:evaluationMode==='prepared',preparedStateAssembly:assemblyMode==='optimized',
    profileEvaluation:true,profileSearch:true,
    progressEvery:limit,onProgress:diagnostics=>{progress=diagnostics;throw STOP;}});
  progress=completed.diagnostics;
} catch(error){if(error!==STOP)throw error;}
const d=progress,profile=d.evaluationProfile||{},known=['rowRestorationMs','conflictMs','combinationMs',
  'computeMetricsMs','calculateAttackDpsMs','constraintsMs'];
const other=Math.max(0,(profile.formalEvaluationMs||0)-known.reduce((sum,key)=>sum+(profile[key]||0),0));
const objectiveKey=JSON.stringify(contexts[name].objective);
const topBlockerSlots=Object.entries(d.slotBoundBlockers||{}).map(([slot,metrics])=>({slot,
  blockers:metrics[objectiveKey]?.blockerCount??null,reasons:metrics[objectiveKey]?.reasons||{}}))
  .sort((a,b)=>(b.blockers||0)-(a.blockers||0)).slice(0,6);
console.log(JSON.stringify({name,order,boundMode,evaluationMode,projectionMode,sharedPreparation,assemblyMode,
  candidatePreparation:reduction.candidatePreparation?.diagnostics,limit,exact:d.exact,classes:reduction.candidates.length,
  pipelineDetail,
  candidateCount:snapshot.candidates.length,afterFilterCount:reduction.diagnostics.afterFilterCount,
  projectionPreparation:reduction.diagnostics.projectionPreparation,
  pipelineMs:{runtimeMs,catalogMs,contextMs,reductionMs,reductionProfile,searchMs:d.elapsedMs,
    searchProfile:d.searchProfile},
  searchNodes:d.searchNodes,formalEvaluations:d.completeConfigurationsEvaluated,
  feasibilityPruned:d.feasibilityPrunedNodes,boundPruned:d.boundPrunedNodes,
  elapsedMs:d.elapsedMs,formalEvaluationAverageMs:d.formalEvaluationAverageMs,
  computeMetricsAverageMs:d.computeMetricsAverageMs,
  calls,reductionCalls,reductionTimes,evaluationSession:d.evaluationSession,
  timeBreakdownMs:{...profile,otherMs:other,innerHelpersMs:innerTimes,
    computeStageTimes,computeStageCalls,equipmentStageTimes,equipmentStageCalls,
    sameTechnicStageTimes,sameTechnicStageCalls,resolverStageTimes,resolverStageCalls},firstObjectiveBoundDepth:d.firstObjectiveBoundDepth,
  firstConstraintBoundDepth:d.firstConstraintBoundDepth,
  nodesByDepth:d.nodesByDepth,formalEvaluationsByDepth:d.formalEvaluationsByDepth,
  boundPrunesByDepth:d.boundPrunesByDepth,feasibilityPrunesByDepth:d.feasibilityPrunesByDepth,
  slotOrder:d.slotOrder,topBlockerSlots,metricBoundAvailability:d.metricBoundAvailability,
  slotBoundBlockers:d.slotBoundBlockers,
  candidateLocalCalls:Object.fromEntries(Object.entries(candidateCalls).map(([key,item])=>[key,
    {uniqueCandidates:Object.keys(item.ids).length,totalCalls:item.calls,
      duplicateCalls:item.calls-Object.keys(item.ids).length,cumulativeMs:item.ms}]))}));
