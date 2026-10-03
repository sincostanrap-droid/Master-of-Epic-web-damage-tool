const assert=require('node:assert/strict');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const {objectiveContexts}=require('../tools/inspect-optimizer-v2-objectives.cjs');
const p=contextRuntime(),E=p.MOEOptimizerV2EffectiveCandidates;
const snapshot=p.MOEOptimizerV2Candidates.generate(),contexts=objectiveContexts(p,20);
const json=value=>JSON.stringify(value);
const before=json(snapshot);
const comparable=result=>{
  const {projectionPreparation,...diagnostics}=result.diagnostics;
  return {...result,diagnostics};
};
for(const [name,context] of Object.entries(contexts)) {
  const old=E.reduce(snapshot,context,null,{reuseNormalizedSingleton:false});
  const fast=E.reduce(snapshot,context);
  assert.equal(json(comparable(fast)),json(comparable(old)),name+' full reduction / class parity');
  assert.equal(fast.diagnostics.projectionPreparation.buffResolvedCandidates,
    old.diagnostics.projectionPreparation.buffResolvedCandidates,name+' resolves the same enabled Buffs');
  assert.equal(fast.contextEquivalentClasses.length,{gun:5232,ac:6620,skillPlus:4858}[name]);
  console.log(name+': full catalog projected values, flags, class keys, representatives and all IDs match');
}
assert.equal(json(snapshot),before,'projection cannot mutate the catalog snapshot');

// Structural fixtures use existing formal row fields, not new gameplay rules.
// Check fields which can interact with competition even when AC is the objective.
const fields=[
  {extraAC:10}, {extraAC:10,equipBuffEnabled:false},
  {extraAC:10,equipBuffEnabled:true,equipBuffExtraAC:5},
  {extraAC:10,equipBuffEnabled:true,equipBuffExtraACPct:10},
  {equipBuffEnabled:true,equipBuffFlatAttack:7},
  {equipBuffEnabled:true,extraEffects:[{key:'skillPlus',name:'回復魔法',value:5}]},
  {equipBuffEnabled:true,equipBuffExtraAttackDelay:-5},
  {equipBuffEnabled:true,extraEffects:[{key:'custom',name:'未解釈fixture',value:2,unit:'%'}]},
  {equipBuffEnabled:true,equipBuffFlatAttack:7,equipBuffConflictGroup:'fixture-manual',tags:'fixture-manual'},
  {equipBuffEnabled:true,equipBuffName:'未解決fixture',equipBuffNote:'表示用fixture'},
  {weaponDamage:40,weaponReq:[{name:'銃器',required:50},{name:'採掘',required:70}],weaponTwoHanded:'○'},
  {weaponDamage:5,weaponReq:[{name:'銃器',required:1}]}
];
const generated=p.MOEOptimizerV2Candidates.generate({items:fields.map((extra,index)=>({
  catalogId:'projection-fixture-'+index,name:'projection-fixture-'+index,
  slot:index===10?'武器: 右手':index===11?'武器: 弾丸':'防具: 頭',category:index>=10?'weapon':'defense'
}))});
const candidates=generated.candidates.map((candidate,index)=>Object.freeze({...candidate,
  evaluationFields:{...candidate.evaluationFields,...fields[index]}}));
for(const context of Object.values(contexts))for(const candidate of candidates) {
  const source=generated.sources[candidate.sourceRef];
  assert.equal(json(E.project(candidate,source,context)),
    json(E.project(candidate,source,context,{reuseNormalizedSingleton:false})),candidate.name+' direct projection');
}
const pool={...generated,candidates};
const context=p.MOEOptimizerV2SearchContext.create({objective:'ac',topK:3,slots:['防具: 頭']});
const small={...pool,candidates:candidates.slice(0,10)};
const old=E.reduce(small,context,null,{reuseNormalizedSingleton:false}),fast=E.reduce(small,context);
const B=p.MOEOptimizerV2BranchAndBound;
assert.equal(json(B.inspectBounds(fast)),json(B.inspectBounds(old)),'bound proof parity');
const signature=run=>json(run.results.map(r=>[r.score,r.performanceKey]));
const a=B.run(old,{slotOrder:'catalog'}),b=B.run(fast,{slotOrder:'catalog'});
assert.equal(signature(a),signature(b));
for(const field of ['searchNodes','completeConfigurationsEvaluated','feasibilityPrunedNodes','boundPrunedNodes','exact'])
  assert.equal(a.diagnostics[field],b.diagnostics[field],field);
assert.equal(signature(b),signature(B.run(fast,{enablePruning:false,slotOrder:'catalog'})));
console.log('projection preparation: full catalog and model-field fixtures preserve legacy semantics and exact search');
