const assert=require('node:assert/strict');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');

const p=contextRuntime(),catalog=p.equipmentCatalogItems();
const named=name=>{const item=catalog.find(row=>row.name===name);assert.ok(item,name);return item;};
const snapshot=p.MOEOptimizerV2Candidates.generate({items:[
  named('女神官の錫杖'),named('サイドパート ウィッグ'),named('アルスリア ウィッグ カラー')
]});
const original=JSON.stringify(snapshot);
const context=p.MOEOptimizerV2SearchContext.create({objective:'ac',topK:3});
const profile={},reduction=p.MOEOptimizerV2EffectiveCandidates.reduce(snapshot,context,profile);
assert.ok(profile.filterMs>=0 && profile.projectionMs>=0 && profile.groupingMs>=0 && profile.totalMs>0);
assert.equal(JSON.stringify(snapshot),original,'projection must leave source candidates unchanged');
for(const effective of reduction.effectiveCandidates) {
  const direct=p.MOEOptimizerV2EffectiveCandidates.project(effective.originalCandidate,
    snapshot.sources[effective.originalCandidate.sourceRef],context);
  assert.equal(effective.fingerprint,direct.fingerprint);
  assert.equal(JSON.stringify(effective.semantics),JSON.stringify(direct.semantics));
  assert.equal(JSON.stringify(effective.proofBuffs),JSON.stringify(direct.proofBuffs));
}
const fallback={...reduction,effectiveCandidates:reduction.effectiveCandidates.map(({proofBuffs,proofStackKeys,...rest})=>rest)};
assert.equal(JSON.stringify(p.MOEOptimizerV2BranchAndBound.inspectBounds(reduction)),
  JSON.stringify(p.MOEOptimizerV2BranchAndBound.inspectBounds(fallback)),
  'projection reuse and official proof reconstruction must agree');
const regular=p.MOEOptimizerV2BranchAndBound.run(reduction);
const profiled=p.MOEOptimizerV2BranchAndBound.run(reduction,{profileSearch:true});
const ranking=run=>JSON.stringify(run.results.map(result=>[result.score,result.performanceKey]));
assert.equal(ranking(profiled),ranking(regular));
for(const field of ['searchNodes','completeConfigurationsEvaluated','feasibilityPrunedNodes','boundPrunedNodes'])
  assert.equal(profiled.diagnostics[field],regular.diagnostics[field],field);
assert.ok(profiled.diagnostics.searchProfile.prepareMs>=0);
assert.equal(profiled.diagnostics.exact,true);
console.log('v2 pipeline: candidate-local projection/proof reuse and optional timing preserve results');
