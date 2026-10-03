const assert=require('node:assert/strict');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const {objectiveContexts,oldShieldClass,summary}=require('../tools/inspect-optimizer-v2-objectives.cjs');
const p=contextRuntime(),s=p.MOEOptimizerV2Candidates.generate(),before=JSON.stringify(s),results={};
let oldIds;
for(const topK of [1,20]) for(const [name,context] of Object.entries(objectiveContexts(p,topK))) {
  const r=p.MOEOptimizerV2EffectiveCandidates.reduce(s,context);
  if(!oldIds)oldIds=oldShieldClass(r);
  const report=summary(r,oldIds);console.log(JSON.stringify({name,topK,...report}));
  assert.equal(r.diagnostics.beforeCount,11813);
  assert.equal(new Set(r.contextEquivalentClasses.flatMap(g=>g.equivalentCandidateIds)).size,r.diagnostics.afterFilterCount);
  if(topK===1)results[name]=report;
  else assert.deepEqual(report,results[name],'K does not change equivalence classes');
  const shield=s.candidates.find(c=>c.name==='トンファー ガード');
  const cls=r.contextEquivalentClasses.find(g=>g.equivalentCandidateIds.includes(shield.candidateId));
  assert.equal(p.MOEOptimizerV2EffectiveCandidates.resolveCandidate(cls,shield.candidateId),shield);
}
assert.equal(oldIds.length,180);
assert.ok(results.ac.historicalShieldClassPartitions>results.gun.historicalShieldClassPartitions);
assert.equal(JSON.stringify(s),before);
// Real skillPlus effects are nonzero in the official model, not a synthetic label-only objective.
const c=objectiveContexts(p).skillPlus;
const candidate=s.candidates.find(x=>x.skillPlus.some(effect=>effect.name==='回復魔法'&&effect.value>0));
assert.ok(candidate);
const value=p.MOEOptimizerV2SearchContext.evaluate(c,[candidate],s.sources);
assert.ok(value.score>0);
console.log('objective catalogs: original snapshot recoverable, shields reclassified, real recovery magic skillPlus evaluated');
