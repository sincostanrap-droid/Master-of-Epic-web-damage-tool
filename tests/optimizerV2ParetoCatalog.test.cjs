const assert=require('node:assert/strict');
const {paretoContext}=require('../tools/inspect-optimizer-v2-pareto.cjs');
const {json}=require('../tools/benchmark-optimizer.cjs');
const p=paretoContext(),api=p.MOEOptimizerV2Pareto,snapshot=p.MOEOptimizerV2Candidates.generate();
assert.equal(snapshot.candidates.length,11813,'Phase 1 full catalog including ammunition');
const before=JSON.stringify(snapshot),result=api.reduce(snapshot);
assert.equal(JSON.stringify(snapshot),before,'no source/candidate mutation');
assert.notEqual(result.candidates,snapshot.candidates,'new candidate array');
const originals=new Map(snapshot.candidates.map(c=>[c.candidateId,c]));
const retained=new Map(result.candidates.map(c=>[c.candidateId,c]));
for(const deletion of result.removed) {
  assert.ok(originals.has(deletion.candidateId));assert.ok(retained.has(deletion.dominatedByCandidateId));
  assert.ok(!retained.has(deletion.candidateId));
  assert.equal(deletion.name,originals.get(deletion.candidateId).name);
  assert.equal(deletion.dominatedByName,retained.get(deletion.dominatedByCandidateId).name);
  assert.deepEqual(json(deletion.dominanceReason),json(api.compare(retained.get(deletion.dominatedByCandidateId),
    originals.get(deletion.candidateId),snapshot.sources)));
}
for(const c of result.candidates) assert.equal(c,originals.get(c.candidateId));
const d=result.diagnostics;
assert.equal(d.beforeCount,d.afterCount+d.removedCount);assert.equal(d.removedCount,result.removed.length);
assert.equal(new Set([...retained.keys(),...result.removed.map(x=>x.candidateId)]).size,11813);
for(const key of ['before','after','removed']) assert.equal(Object.values(d.bySlot).reduce((sum,x)=>sum+x[key],0),
  d[{before:'beforeCount',after:'afterCount',removed:'removedCount'}[key]]);
assert.equal(result.conservativelyRetained.length,d.conservativeRetainedCount);
assert.ok(d.conservativeRetainedCount>0);
console.log('v2 Pareto full catalog:',JSON.stringify(d));
