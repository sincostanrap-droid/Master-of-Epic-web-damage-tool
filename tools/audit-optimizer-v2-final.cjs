/* Read-only explanation of the running, unbounded Exact searches. */
const fs=require('node:fs');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const {objectiveContexts}=require('./inspect-optimizer-v2-objectives.cjs');
const p=contextRuntime(),snapshot=p.MOEOptimizerV2Candidates.generate(),contexts=objectiveContexts(p,20);
const copy=v=>JSON.parse(JSON.stringify(v));
const report={status:'incomplete-validation',cases:[]};
for(const name of ['ac','skillPlus','gun']){
  const observed=JSON.parse(fs.readFileSync(`docs/optimizer-v2-final-${name}-run1.json`,'utf8'));
  const context=contexts[name],reduction=p.MOEOptimizerV2EffectiveCandidates.reduce(snapshot,context);
  const bounds=p.MOEOptimizerV2BranchAndBound.inspectBounds(reduction).metrics;
  const candidates=new Map(snapshot.candidates.map(c=>[c.candidateId,c]));
  const d=observed.progress||observed.diagnostics;
  const selected=(d.currentCandidateIds||[]).map(id=>candidates.get(id));
  const metricKey=JSON.stringify(context.objective),proof=bounds[metricKey];
  const selectedBlockers=selected.filter(c=>proof.candidates[c.candidateId]?.classification==='unknown').map(c=>({
    candidateId:c.candidateId,name:c.name,slot:c.slot,...proof.candidates[c.candidateId],depth:d.slotOrder.indexOf(c.slot)+1}));
  const firstBlocker=selectedBlockers.sort((a,b)=>a.depth-b.depth)[0];
  const suffix=firstBlocker?d.slotOrder.slice(firstBlocker.depth):[];
  const suffixChoices=suffix.map(slot=>({slot,choicesIncludingEmpty:observed.groups[slot]+1}));
  const cartesian=suffixChoices.reduce((n,x)=>n*BigInt(x.choicesIncludingEmpty),1n);
  let normalCapture,fastCapture;
  const original=p.computeMetrics;
  p.computeMetrics=function(st,inputs,target,prepared){const capture=target||{};const result=original(st,inputs,capture,prepared);
    if(prepared)fastCapture=copy(capture);else normalCapture=copy(capture);return result;};
  const normal=p.MOEOptimizerV2SearchContext.evaluate(context,selected,snapshot.sources);
  const session=p.MOEOptimizerV2EvaluationSession.create(context,snapshot.sources,{preparation:reduction.candidatePreparation});
  const fast=session.evaluate(selected);session.dispose();p.computeMetrics=original;
  require('node:assert/strict').deepEqual(copy(normal),copy(fast));
  require('node:assert/strict').deepEqual(normalCapture,fastCapture);
  const refs=selected.map(c=>{const cls=reduction.contextEquivalentClasses.find(g=>g.equivalentCandidateIds.includes(c.candidateId));
    for(const id of cls.equivalentCandidateIds)require('node:assert/strict').equal(p.MOEOptimizerV2EffectiveCandidates.resolveCandidate(cls,id).candidateId,id);
    return {candidateId:c.candidateId,name:c.name,slot:c.slot,originalCandidateIds:copy(cls.equivalentCandidateIds)};});
  report.cases.push({case:name,exact:false,status:observed.status,searchNodes:d.searchNodes,
    formalEvaluations:d.completeConfigurationsEvaluated,elapsedMs:d.elapsedMs,boundPruned:d.boundPrunedNodes,
    feasibilityPruned:d.feasibilityPrunedNodes,objectiveBoundStatus:proof.status,
    selectedBlockers,suffixChoices,unfilteredSuffixCartesian:cartesian.toString(),
    note:'Suffix Cartesian volume is not a valid-configuration count or an ETA; structural pruning still applies.',
    observedConfigurationFormalParity:true,observedConfigurationFeasible:normal.feasible,
    observedConfigurationScore:normal.score,observedCandidateRestoration:refs,
    noteParity:'This is a sampled in-progress configuration, not an Exact Top result.',
    metricBoundAvailability:d.metricBoundAvailability,searchProfile:d.searchProfile,evaluationProfile:d.evaluationProfile});
}
fs.writeFileSync('docs/optimizer-v2-final-bound-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.cases.map(({case:name,selectedBlockers,suffixChoices,unfilteredSuffixCartesian,objectiveBoundStatus})=>
  ({case:name,selectedBlockers,suffixChoices,unfilteredSuffixCartesian,objectiveBoundStatus})),null,2));
