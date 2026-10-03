const assert=require('node:assert/strict');
const {contextRuntime,representativeContext}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),s=p.MOEOptimizerV2Candidates.generate(),before=JSON.stringify(s),c=representativeContext(p);
const result=p.MOEOptimizerV2EffectiveCandidates.reduce(s,c),d=result.diagnostics;
assert.equal(d.beforeCount,11813);assert.equal(JSON.stringify(s),before);
const top20=p.MOEOptimizerV2EffectiveCandidates.reduce(s,representativeContext(p,20));
assert.equal(top20.diagnostics.afterFilterCount,d.afterFilterCount);
assert.equal(top20.diagnostics.afterEquivalenceCount,d.afterEquivalenceCount);
assert.equal(top20.candidates.length,result.candidates.length);
assert.deepEqual(Array.from(top20.candidates,x=>x.candidateId),Array.from(result.candidates,x=>x.candidateId));
assert.equal(new Set(top20.equivalentClasses.flatMap(cls=>cls.equivalentCandidateIds)).size,d.afterFilterCount);
assert.equal(JSON.stringify(s),before);
assert.equal(d.beforeCount,d.afterFilterCount+d.filteredCount);
assert.equal(d.afterFilterCount,d.afterParetoCount+d.paretoRemovedCount);
assert.ok(d.paretoRemovedCount>0);assert.ok(d.descriptionNoLongerBlocksCount>0);
assert.ok(d.descriptionOnlyBlockedInPhase2>0);
const survivors=new Map(result.effectiveCandidates.map(e=>[e.candidateId,e]));
const original=new Map(s.candidates.map(e=>[e.candidateId,e]));
for(const r of result.removed) {
  assert.ok(survivors.has(r.dominatedByCandidateId));assert.ok(original.has(r.candidateId));
  assert.ok(!survivors.has(r.candidateId));
  assert.ok(r.dominanceReason.fingerprintEqual);
}
assert.equal(new Set([...survivors.keys(),...result.filtered.map(x=>x.candidateId),...result.removed.map(x=>x.candidateId)]).size,11813);
for(const key of ['before','afterFilter','afterPareto']) assert.equal(Object.values(d.bySlot).reduce((sum,x)=>sum+x[key],0),d[key+'Count']);
// Original metadata is still recoverable even for merged equivalents.
for(const g of result.equivalentGroups) for(const id of g.equivalentCandidateIds) {
  assert.ok(s.sources[original.get(id).sourceRef]);
}
console.log('context full catalog:',JSON.stringify(d));
