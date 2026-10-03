/* Diagnostic prefix probe, separate from the exact search API. It returns no ranking. */
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const {objectiveContexts}=require('./inspect-optimizer-v2-objectives.cjs');
const p=contextRuntime(),snapshot=p.MOEOptimizerV2Candidates.generate(),B=p.MOEOptimizerV2BranchAndBound,
  E=p.MOEOptimizerV2EffectiveCandidates;
const STOP=Symbol('diagnostic-prefix-complete'),observedNodes=1000;
for(const [name,context] of Object.entries(objectiveContexts(p,20))) {
  const reduced=E.reduce(snapshot,context),counts=Object.entries(reduced.diagnostics.bySlot)
    .map(([slot,x])=>({slot,candidates:x.afterPareto})).sort((a,b)=>b.candidates-a.candidates);
  const product=counts.reduce((n,x)=>n*BigInt(x.candidates+1),1n);
  let progress=null;
  try {
    B.run(reduced,{progressEvery:observedNodes,onProgress:current=>{progress=current;throw STOP;}});
    console.log(JSON.stringify({objective:name,status:'exactly completed',classes:reduced.candidates.length}));
    continue;
  } catch(error) { if(error!==STOP)throw error; }
  console.log(JSON.stringify({objective:name,status:'diagnostic prefix only; no search result',
    before:reduced.diagnostics.beforeCount,afterFilter:reduced.diagnostics.afterFilterCount,
    contextEquivalentClasses:reduced.candidates.length,cartesianUpperCount:product.toString(),
    largestSlots:counts.slice(0,5),searchNodes:progress.searchNodes,
    completeConfigurationsEvaluated:progress.completeConfigurationsEvaluated,
    feasibilityPrunedNodes:progress.feasibilityPrunedNodes,boundPrunedNodes:progress.boundPrunedNodes,
    invalidEquipmentCombinationCount:progress.invalidEquipmentCombinationCount,
    invalidReasons:progress.invalidReasons,
    nodesByDepth:progress.nodesByDepth,currentDepth:progress.currentDepth,
    lastExploredSlot:progress.slotOrder[progress.currentDepth-1] || null,
    remainingSlots:progress.remainingSlots,elapsedMs:progress.elapsedMs,
    boundMetrics:progress.boundMetrics,exact:false}));
}
