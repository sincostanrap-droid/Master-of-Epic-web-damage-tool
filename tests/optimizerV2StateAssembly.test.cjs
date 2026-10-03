const assert=require('node:assert/strict');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,S=p.MOEOptimizerV2EvaluationSession;
const json=v=>JSON.parse(JSON.stringify(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const names=['ドンナー','シュラーク','女神官の錫杖','サイドパート ウィッグ','アルスリア ウィッグ カラー'];
const items=p.equipmentCatalogItems().filter(item=>names.includes(item.name));
items.push({catalogId:'assembly-gun',name:'assembly-gun',slot:'武器: 右手',category:'weapon',
  weaponType:'銃器',weaponHand:'1HAND',weaponDamage:50,weaponAttackInterval:250,
  weaponReq:[{name:'銃器',required:80},{name:'採掘',required:70}]},
  {catalogId:'assembly-ammo',name:'assembly-ammo',slot:'武器: 弾丸',category:'weapon',ammoKind:'gun',weaponDamage:5});
const snapshot=p.MOEOptimizerV2Candidates.generate({items});
const candidate=name=>{const c=snapshot.candidates.find(c=>c.name===name);assert.ok(c,name);return c;};
const skillSim=p.defaultSkillSimState();for(const name of Object.keys(skillSim.skills))skillSim.skills[name]=100;
const base=json(C.create({}).baseState);
base.composite=[{enabled:true,slot:true,name:'registered external',tags:'fixture-group',stackRule:'latest',
  attackPct:10,flatAttack:5,convMagicRate:20,extraAttackDelay:-5,extraCritRatePct:15,
  extraEffects:[{key:'skillPlus',name:'回復魔法',value:3}]},
  {enabled:false,slot:true,name:'registered off',flatAttack:999}];
let captureTrace=[],inCompute=false;
const originalCompute=p.computeMetrics,originalSame=p.resolveEquipmentBuffRowsForSameTechnic;
p.computeMetrics=function(st,inputs,capture,prepared){
  const target=capture||{};inCompute=true;
  try{const result=originalCompute(st,inputs,target,prepared);
    captureTrace.push(json({equipment:target.normalizedEquipment,resolved:target.resolvedBuffState}));
    return result;
  }finally{inCompute=false;}
};
let winners=[];
p.resolveEquipmentBuffRowsForSameTechnic=function(...args){
  const result=originalSame(...args);if(inCompute)winners.push(json(result.map(r=>r.resolved||r)));return result;
};
function traced(operation){captureTrace=[];winners=[];const result=json(operation());return {result,capture:captureTrace,winners};}
for(const objective of ['attackDps','physicalDamage','attack','ac',{metric:'skillPlus',skillName:'回復魔法'}]){
  const context=C.create({objective,skillSim,baseState:base,topK:3,mainWeaponSkill:'銃器',
    constraints:[{metric:'ac',op:'gte',value:0}],inputs:{str:100,spirit:100,allowCrit:true,critRate:1}});
  const reduction=p.MOEOptimizerV2EffectiveCandidates.reduce(snapshot,context);
  const store=reduction.candidatePreparation;
  const before=json({context,snapshot,artifacts:C.withRuntime(context,()=>
    snapshot.candidates.map(c=>store.buffFor(c)))});
  const fast=S.create(context,snapshot.sources,{preparation:store});
  const old=S.create(context,snapshot.sources,{preparation:store,preparedStateAssembly:false});
  const a=[candidate('assembly-gun'),candidate('assembly-ammo'),candidate('サイドパート ウィッグ')];
  const b=[candidate('シュラーク'),candidate('アルスリア ウィッグ カラー')];
  const first=traced(()=>fast.evaluate(a));
  assert.deepEqual(first,traced(()=>old.evaluate(a)),'Phase 3.13 metrics, resolved state and winners');
  assert.deepEqual(first,traced(()=>C.evaluate(context,a,snapshot.sources)),'normal official path');
  assert.deepEqual(traced(()=>fast.evaluate(b)),traced(()=>old.evaluate(b)),'alternative conflicts/conversion');
  assert.deepEqual(traced(()=>fast.evaluate(a)),first,'A B A all outputs/winners/state');
  assert.deepEqual(json({context,snapshot,artifacts:C.withRuntime(context,()=>
    snapshot.candidates.map(c=>store.buffFor(c)))}),before,'artifacts and external/mastery context unchanged');
  assert.equal(fast.diagnostics.avoidedEquipmentBuffStateClones,3);
  assert.equal(old.diagnostics.avoidedEquipmentBuffStateClones,0);
  const B=p.MOEOptimizerV2BranchAndBound;
  const expected=B.run(reduction,{preparedStateAssembly:false});
  const actual=B.run(reduction);
  assert.deepEqual(json(actual.results),json(expected.results),'complete ranked Top-K');
  for(const key of ['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes','feasibilityPrunedNodes','exact'])
    assert.equal(actual.diagnostics[key],expected.diagnostics[key],key);
  const rank=run=>json(run.results.map(r=>[r.score,r.performanceKey]));
  assert.deepEqual(rank(B.run(reduction,{boundMode:'none'})),rank(expected));
  assert.deepEqual(rank(B.run(reduction,{slotOrder:'descending'})),rank(expected));
  fast.dispose();old.dispose();
}
// Diagnostic source instrumentation must also preserve formal outputs.
p.computeMetrics=originalCompute;p.resolveEquipmentBuffRowsForSameTechnic=originalSame;
const ctx=C.create({objective:'attackDps',skillSim,baseState:base,mainWeaponSkill:'銃器'});
const chosen=[candidate('assembly-gun'),candidate('assembly-ammo')];
const reference=json(C.evaluate(ctx,chosen,snapshot.sources));
const detail=require('../tools/profile-optimizer-v2-pipeline.cjs').install(p,{enabled:()=>true});
assert.deepEqual(json(C.evaluate(ctx,chosen,snapshot.sources)),reference);
assert.ok(detail.stages['computeMetrics.damageAndHit'].calls>0);
assert.ok(detail.cloneSamples.expandEquipmentBuffState.maxJsonBytes>0);
console.log('state assembly: normal/Phase 3.13/fast metrics, winners, resolved states, A B A, snapshots, Top-K, bounds/orders and profiling parity OK');
