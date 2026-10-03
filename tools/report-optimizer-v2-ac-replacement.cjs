const fs=require('node:fs'),assert=require('node:assert/strict');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
const s=p.MOEOptimizerV2Candidates.generate(),ctx=require('./inspect-optimizer-v2-objectives.cjs').objectiveContexts(p,20).ac;
const R=p.MOEOptimizerV2MetricCandidateReducer,C=p.MOEOptimizerV2SearchContext,r=R.reduce(s,ctx);
const a=JSON.parse(fs.readFileSync('docs/optimizer-v2-ac-replacement-final-old-prefix.json','utf8')),
 b=JSON.parse(fs.readFileSync('docs/optimizer-v2-ac-replacement-final-new-prefix.json','utf8')),
 exact=JSON.parse(fs.readFileSync('docs/optimizer-v2-ac-replacement-exact-run1.json','utf8'));
const proof=r.diagnostics.metricReduction.acReplacementDominance;
const active=new Set(r.contextEquivalentClasses.map(c=>c.equivalenceKey)),ids=new Set(r.contextEquivalentClasses.flatMap(c=>c.equivalentCandidateIds));
let retainedWitnessChecks=0,recoveredDominatedIds=0;
for(const x of proof.removed){assert.equal(new Set(x.witnessClassKeys).size,20);
 for(const k of x.witnessClassKeys){assert.ok(active.has(k));retainedWitnessChecks++;}
 for(const id of x.candidateIds){assert.ok(!ids.has(id));assert.equal(R.resolveCandidate(r,id).candidateId,id);recoveredDominatedIds++;}}
assert.deepEqual(a.progress.slotOrder,b.progress.slotOrder);
assert.deepEqual(a.progress.slotOrder,(exact.progress||exact.searchDiagnostics).slotOrder);
const benchmark=[100000,300000,1000000].map(nodes=>{
 const read=x=>{const d=x.checkpoints.find(c=>c.searchNodes===nodes);return {nodes,seconds:d.elapsedMs/1000,
  nodesPerSecond:nodes/(d.elapsedMs/1000),formal:d.completeConfigurationsEvaluated,prune:d.boundPrunedNodes,
  boundCalls:d.acUpperBound.calls,boundSeconds:d.acUpperBound.totalMs/1000,unknown:d.acUpperBound.unknown,kth:d.kthScoreHistory.at(-1)?.score};};
 return {old:read(a),new:read(b)};});
const d=exact.progress||exact.searchDiagnostics;
const session=p.MOEOptimizerV2EvaluationSession.create(ctx,s.sources),formalParity=[];
for(const x of exact.top||d.observedTopK){const candidates=x.candidateIds.map(id=>R.resolveCandidate(r,id)),normal=C.evaluate(ctx,candidates,s.sources),prepared=session.evaluate(candidates);
 assert.equal(normal.feasible,true);assert.equal(normal.score,x.score);assert.deepEqual(JSON.parse(JSON.stringify(normal.metrics)),JSON.parse(JSON.stringify(prepared.metrics)));
 assert.equal(R.describeConfiguration(r,x.candidateIds).performanceKey,x.performanceKey);
 formalParity.push({score:x.score,key:x.performanceKey,candidateIds:x.candidateIds,allMetricsParity:true});}
session.dispose();
const out={commit:'c34d914',classesBefore:proof.before,classesAfter:r.contextEquivalentClasses.length,
 structuralGroups:proof.structuralGroups,comparisons:proof.comparisons,removed:proof.removed.length,
 bySlot:proof.bySlot,roundingMargin:proof.roundingMargin,minMultiplier:proof.minMultiplier,
 retainedWitnessChecks,recoveredDominatedIds,activeEquivalentIds:ids.size,benchmark,
 exact:{status:exact.status,exact:exact.exact,elapsedSeconds:d.elapsedMs/1000,nodes:d.searchNodes,
  formal:d.completeConfigurationsEvaluated,prune:d.boundPrunedNodes,unknown:d.acUpperBound.unknown,
  boundSeconds:d.acUpperBound.totalMs/1000,kth:d.kthScoreHistory.at(-1)?.score,depth:d.currentDepth,
  remainingSlots:d.remainingSlots,nodesByDepth:d.nodesByDepth,
  theoreticalRemainingChoices:d.candidateCountsByDepth.slice(d.currentDepth).reduce((n,x)=>n*BigInt(x.choices),1n).toString()},formalParity};
fs.writeFileSync('docs/optimizer-v2-ac-replacement-comparison.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({...out,benchmark:out.benchmark,bySlot:undefined,formalParity:undefined,exact:{...out.exact,nodesByDepth:undefined}},null,2));
