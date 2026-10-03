const assert=require('node:assert/strict');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const {objectiveContexts}=require('../tools/inspect-optimizer-v2-objectives.cjs');
const p=contextRuntime(),S=p.MOEOptimizerV2EvaluationSession,E=p.MOEOptimizerV2EffectiveCandidates;
const snapshot=p.MOEOptimizerV2Candidates.generate(),context=objectiveContexts(p,3).ac;
const json=v=>JSON.stringify(v);
const store=S.createCandidatePreparation(context,snapshot.sources);
const snapshotBefore=json(snapshot);
p.MOEOptimizerV2SearchContext.withRuntime(context,()=>{
  for(const c of snapshot.candidates){
    const row=p.MOEOptimizerV2Candidates.toEquipmentRow(c);
    assert.equal(json(store.rowFor(c)),json(row),c.candidateId+' row');
    const resolved=p.resolveEquipmentBuffRow(row),hasEffect=p.equipmentBuffHasEffect(resolved);
    const prototype=hasEffect?p.equipmentBuffToCompositeRow(resolved):null;
    const expected={resolved,hasEffect,stackKey:hasEffect?p.equipmentBuffStackKey(resolved):'',
      compositePrototype:prototype,normalizedCompositePrototype:hasEffect?p.normalizeCompositeRows([prototype])[0]:null};
    assert.equal(json(store.buffFor(c)),json(expected),c.candidateId+' complete Buff artifact');
    const prepared=store.preparedRow(row);
    assert.equal(json(prepared.resolved),json(resolved));
    if(hasEffect)assert.equal(json(prepared.copyComposite()),
      json(p.equipmentBuffToCompositeRow(p.restoreEquipmentBuffCompatibilityGroups(resolved))));
    assert.ok(Object.isFrozen(store.buffFor(c).resolved));
  }
});
assert.equal(json(snapshot),snapshotBefore,'original candidates preserved');
assert.equal(store.diagnostics.artifactBuildCount,11813);
assert.equal(store.diagnostics.buffBuildCount,11813);
assert.throws(()=>store.assertContext({...context},snapshot.sources),/mismatch/);
console.log('all 11813 canonical rows, Buffs, keys, prototypes, normalized effects and compatibility match');

const selectedNames=['ドンナー','シュラーク','サイドパート ウィッグ','アルスリア ウィッグ カラー',
  '女神官の錫杖','フォルテイア・スピア'];
const items=p.equipmentCatalogItems().filter(x=>selectedNames.includes(x.name));
const small=p.MOEOptimizerV2Candidates.generate({items});
for(const ctx of Object.values(objectiveContexts(p,3))){
  const old=E.reduce(small,ctx,null,{sharedPreparation:false}),fast=E.reduce(small,ctx);
  assert.equal(json(fast),json(old),'full reduction contract unchanged');
  const prep=fast.candidatePreparation;
  const shared=S.create(ctx,small.sources,{preparation:prep}),legacy=S.create(ctx,small.sources);
  const a=small.candidates.slice(0,2),b=small.candidates.slice(-2);
  const artifactsBefore=p.MOEOptimizerV2SearchContext.withRuntime(ctx,()=>
    json(small.candidates.map(c=>prep.buffFor(c))));
  const first=shared.evaluate(a);
  assert.equal(json(first),json(legacy.evaluate(a)),'all metrics, DPS, constraints, competition and weapon selection');
  assert.equal(json(shared.evaluate(b)),json(legacy.evaluate(b)));
  assert.equal(json(shared.evaluate(a)),json(first),'A B A');
  assert.equal(p.MOEOptimizerV2SearchContext.withRuntime(ctx,()=>
    json(small.candidates.map(c=>prep.buffFor(c)))),artifactsBefore,'immutable artifacts after evaluations');
  const ranked=r=>json(r.results.map(({score,rankScore,performanceKey})=>({score,rankScore,performanceKey})));
  const B=p.MOEOptimizerV2BranchAndBound;
  const reference=B.run(old,{slotOrder:'fewest'});
  const current=B.run(fast,{slotOrder:'fewest'});
  assert.equal(json(current.results),json(reference.results),'same-order complete result');
  assert.equal(ranked(current),ranked(reference),'Top-K score/key/order');
  for(const key of ['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes','feasibilityPrunedNodes'])
    assert.equal(current.diagnostics[key],reference.diagnostics[key],key);
  assert.equal(ranked(B.run(fast,{boundMode:'none'})),ranked(reference),'bounds off');
  assert.equal(ranked(B.run(fast,{slotOrder:'descending'})),ranked(reference),'slot order');
  shared.dispose();legacy.dispose();
}
console.log('shared/legacy projection, formal evaluation, A B A, immutable artifact and search parity OK');
