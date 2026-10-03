const fs=require('node:fs'),assert=require('node:assert/strict');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
const s=p.MOEOptimizerV2Candidates.generate(),ctx=require('./inspect-optimizer-v2-objectives.cjs').objectiveContexts(p,20).ac;
const R=p.MOEOptimizerV2MetricCandidateReducer,C=p.MOEOptimizerV2SearchContext,V=p.MOEOptimizerV2Candidates;
const r=R.reduce(s,ctx),old=JSON.parse(fs.readFileSync('docs/optimizer-v2-ac-context-old-prefix.json','utf8')),
 fresh=JSON.parse(fs.readFileSync('docs/optimizer-v2-ac-context-new-prefix.json','utf8')),
 observation=JSON.parse(fs.readFileSync('docs/optimizer-v2-ac-context-exact-observation.json','utf8'));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const json=v=>JSON.parse(JSON.stringify(v));
const originalKeys=[...new Set(r.metricReducer.classification.filter(x=>x.stage==='metric-class').map(x=>x.legacyEquivalenceKey))];
const stages=[];let fields=[];
for(const field of ['requirements','armorRequirements','rawRequirements','weaponReq']){
 fields.push(field);const keys=new Set(originalKeys.map(k=>{const x=JSON.parse(k);for(const f of fields)
  if(f==='weaponReq'){if(x[2].structural.weapon)delete x[2].structural.weapon.weaponReq;}else delete x[2].structural[f];return JSON.stringify(canonical(x));}));
 stages.push({removedFields:fields.slice(),classes:keys.size});
}
let aliasChecks=0;
for(const cls of r.contextEquivalentClasses){const rep=p.equipmentArmorAC(V.toEquipmentRow(cls.representativeCandidate),ctx.skillSim);
 for(const c of cls.equivalentCandidates){const other=p.equipmentArmorAC(V.toEquipmentRow(c),ctx.skillSim);
  assert.ok(Object.is(rep.effective,other.effective));assert.ok(Object.is(rep.addition,other.addition));
  assert.equal(R.resolveCandidate(r,c.candidateId).candidateId,c.candidateId);aliasChecks++;}}
const session=p.MOEOptimizerV2EvaluationSession.create(ctx,s.sources);
const reevaluation=observation.progress.observedTopK.map(entry=>{
 const selected=entry.candidateIds.map(id=>R.resolveCandidate(r,id)),normal=C.evaluate(ctx,selected,s.sources),prepared=session.evaluate(selected);
 assert.equal(normal.score,entry.score);assert.deepEqual(json(normal.metrics),json(prepared.metrics));
 assert.equal(R.describeConfiguration(r,entry.candidateIds).performanceKey,entry.performanceKey);
 return {score:entry.score,configurationKey:entry.performanceKey,allMetricsParity:true,equipment:R.describeConfiguration(r,entry.candidateIds).equipment.map(e=>({slot:e.slot,name:e.representativeCandidate.name,equivalentCandidateIds:e.equivalentCandidateIds}))};
});session.dispose();
const canonicalOldKeys=new Set(old.progress.observedTopK.map(entry=>R.describeConfiguration(r,entry.candidateIds).performanceKey));
const benchmarks=[10000,100000,300000].map(nodes=>{
 const summarize=record=>{const d=record.checkpoints.find(c=>c.searchNodes===nodes);return {elapsedMs:d.elapsedMs,nodesPerSecond:nodes/(d.elapsedMs/1000),
   boundCalls:d.acUpperBound.calls,boundMs:d.acUpperBound.totalMs,formal:d.completeConfigurationsEvaluated,prune:d.boundPrunedNodes,unknown:d.acUpperBound.unknown,kth:d.kthScoreHistory.at(-1)?.score};};
 return {nodes,old:summarize(old),new:summarize(fresh)};
});
const d=observation.progress,out={exact:false,classes:r.diagnostics.metricReduction.acFixedContextEquivalence,diagnostics:r.diagnostics.metricReduction,
 stages,aliasChecks,oldPrefixTop20DistinctUnderNewKey:canonicalOldKeys.size,benchmarks,formalReevaluation:reevaluation,
 observation:{elapsedMs:d.elapsedMs,nodes:d.searchNodes,formal:d.completeConfigurationsEvaluated,prune:d.boundPrunedNodes,
 unknown:d.acUpperBound.unknown,kth:d.kthScoreHistory.at(-1)?.score,depth:d.currentDepth,remainingSlots:d.remainingSlots,
 theoreticalRemainingChoices:d.candidateCountsByDepth.slice(d.currentDepth).reduce((n,x)=>n*BigInt(x.choices),1n).toString()}};
fs.writeFileSync('docs/optimizer-v2-ac-context-comparison.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({aliasChecks,classes:out.classes,oldDistinct:canonicalOldKeys.size,observation:out.observation}));
