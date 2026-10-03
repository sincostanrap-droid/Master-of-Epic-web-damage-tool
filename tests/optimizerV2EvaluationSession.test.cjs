const assert=require('node:assert/strict');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,S=p.MOEOptimizerV2EvaluationSession;
const catalog=p.equipmentCatalogItems();
const named=name=>{const item=catalog.find(x=>x.name===name);assert.ok(item,name);return item;};
const gun={catalogId:'session-gun',name:'session-gun',slot:'武器: 右手',category:'weapon',
  weaponType:'銃器',weaponHand:'1HAND',weaponDamage:60,weaponAttackInterval:250,
  weaponReq:[{name:'銃器',required:50}]};
const twoHand={...gun,catalogId:'session-two-hand',name:'session-two-hand',weaponHand:'2HAND'};
const underSkill={...gun,catalogId:'session-multi-skill',name:'session-multi-skill',
  weaponReq:[{name:'銃器',required:50},{name:'採掘',required:90}]};
const ammo={catalogId:'session-bullet',name:'session-bullet',slot:'武器: 弾丸',category:'weapon',ammoKind:'gun',
  weaponDamage:4,weaponAttackInterval:0};
const shield={catalogId:'session-shield',name:'session-shield',slot:'武器: 左手',category:'shield',extraStats:{extraAC:20}};
const items=[gun,twoHand,underSkill,ammo,shield,...[
  'サイドパート ウィッグ','アルスリア ウィッグ カラー','ドンナー','シュラーク',
  '鍛錬の首飾り','ガーディアン スピリット','女神官の錫杖',
  'フォルテイア・スピア','退魔の毛皮'].map(named)];
const snapshot=p.MOEOptimizerV2Candidates.generate({items});
const candidate=name=>{const found=snapshot.candidates.find(x=>x.name===name);assert.ok(found,name);return found;};
const skillSim=p.defaultSkillSimState();
for(const name of Object.keys(skillSim.skills))skillSim.skills[name]=100;
const common={skillSim,topK:3,inputs:{str:100,spirit:100,allowCrit:true,critRate:1}};
const json=value=>JSON.parse(JSON.stringify(value));
const cases=[
  ['gun DPS / Buff and ammo',{...common,objective:'attackDps',mainWeaponSkill:'銃器'},
    ['session-gun','session-bullet','サイドパート ウィッグ']],
  ['physical damage / two hands and percentage',{...common,objective:'physicalDamage'},
    ['session-two-hand','session-bullet','鍛錬の首飾り']],
  ['attack / conversion and Buff group conflict',{...common,objective:'attack'},['ドンナー','シュラーク']],
  ['AC / left hand and additive Buff',{...common,objective:'ac',constraints:[{metric:'ac',op:'gte',value:20}]},
    ['session-shield','ガーディアン スピリット']],
  ['skillPlus / equipment Buff',{...common,objective:{metric:'skillPlus',skillName:'回復魔法'}},
    ['女神官の錫杖','アルスリア ウィッグ カラー']],
  ['under-skilled multiple requirements',{...common,objective:'physicalDamage',
    skillSim:{...json(skillSim),skills:{...json(skillSim.skills),'採掘':30}}},
    ['session-multi-skill','session-bullet']],
  ['target-specific special Buff',{...common,objective:'physicalDamage',
    inputs:{...common.inputs,targetRace:'demon'}},['退魔の毛皮']],
  ['automatic compatibility group against external Buff',{
    ...common,objective:'attack',baseState:{...json(C.create(common).baseState),composite:[
      {enabled:true,slot:true,name:'critical G external',tags:'critical:G',
        extraCritRatePct:35}]}
  },['サイドパート ウィッグ','フォルテイア・スピア']]
];
for(const [label,options,names] of cases){
  const context=C.create(options),selected=names.map(candidate);
  const rows=new Map(selected.map(x=>[x.candidateId,p.MOEOptimizerV2Candidates.toEquipmentRow(x)]));
  const session=S.create(context,snapshot.sources,{rows});
  const old=C.evaluate(context,selected,snapshot.sources),fast=session.evaluate(selected);
  assert.deepEqual(json(fast),json(old),label+' complete official result');
  assert.ok(Object.is(fast.score,old.score),label+' score');
  assert.ok(Object.is(fast.dps?.continuousDps,old.dps?.continuousDps),label+' DPS');
  assert.equal(fast.feasible,old.feasible,label+' feasibility');
  assert.deepEqual(fast.violations,old.violations,label+' constraints/structural violations');
  // A result is never retained or shared with another branch by default.
  fast.metrics.extraStats.extraAC=99999;
  const mutableCopy=session.rowFor(selected[0]);mutableCopy.extraAC=99999;
  assert.deepEqual(json(session.evaluate(selected)),json(old),label+' repeated leaf isolation');
  assert.equal(session.diagnostics.evaluationCacheHitCount,0);
  assert.equal(session.diagnostics.evaluationCacheMissCount,2);
  assert.ok(session.diagnostics.preparedHitCount>0);
  assert.throws(()=>session.rowFor({...selected[0]}),/candidate snapshot mismatch/);
  session.dispose();
  assert.throws(()=>session.evaluate(selected),/disposed/);
  console.log(label+' prepared/legacy parity OK');
}
// The exact resolved state produced inside computeMetrics can feed the same
// official DPS delay collector without repeating its Buff resolution.
for(const names of [['session-gun','session-bullet','サイドパート ウィッグ'],
  ['ドンナー','シュラーク'],['session-two-hand','鍛錬の首飾り']]){
  const context=C.create({...common,objective:'attack'}),selected=names.map(candidate);
  C.withRuntime(context,()=>{
    const active={...json(context.baseState),equipment:selected.map(x=>p.MOEOptimizerV2Candidates.toEquipmentRow(x))};
    const capture={};
    p.computeMetrics(p.expandSkillSimMasteryBuffState(active),json(context.inputs),capture);
    const old=p.collectAttackDpsDelaySources(active);
    const fast=p.collectAttackDpsDelaySourcesPrepared(capture.normalizedEquipment,capture.resolvedBuffState);
    assert.deepEqual(json(fast),json(old),names.join('+')+' delay-source parity');
  });
}
const base=C.create({...common,objective:'ac'}),baseSession=S.create(base,snapshot.sources);
const variants=[
  {...common,objective:'ac',skillSim:{...json(skillSim),skills:{...json(skillSim.skills),'着こなし':42}}},
  {...common,objective:'ac',targetAC:120},
  {...common,objective:'attack'},
  {...common,objective:'ac',constraints:[{metric:'ac',op:'gte',value:5}]},
  {...common,objective:'ac',race:'elmony'},
  {...common,objective:'ac',runtime:{...json(base.runtime),data:{...json(base.runtime.data),MOE_BUFF_RULES_MANUAL:[{id:'changed-rule'}]}}}
];
for(const [index,options] of variants.entries()){
  const changed=C.create(options),other=S.create(changed,snapshot.sources);
  assert.notEqual(other.evaluationContextSignature,baseSession.evaluationContextSignature);
  assert.throws(()=>baseSession.assertContext(changed,snapshot.sources),/mismatch/);
  if(index<5)assert.deepEqual(json(other.evaluate([candidate('session-gun')])),
    json(C.evaluate(changed,[candidate('session-gun')],snapshot.sources)),
    'changed context uses its own official evaluation');
  other.dispose();
}
baseSession.dispose();
// External Buffs are fixed at context creation, before the official equipment
// Buff conflict resolver runs. Different Buff snapshots never share a session.
const externalState=json(base.baseState);
externalState.composite=[
  {enabled:true,name:'external attack',slot:true,flatAttack:12,tags:'shared'},
  {enabled:true,name:'external percent',slot:true,attackPct:8,extraCritRatePct:3,
    extraAttackDelay:-2},
  {enabled:true,name:'external conversion',slot:true,convMagicRate:5,
    extraEffects:[{key:'skillPlus',name:'回復魔法',value:4}]},
  {enabled:false,name:'external off',slot:true,flatAttack:999}
];
const externalOptions={...common,objective:'attack',baseState:externalState};
const externalContext=C.create(externalOptions);
const externalSession=S.create(externalContext,snapshot.sources);
const externalSelection=[candidate('ドンナー'),candidate('シュラーク')];
const externalExpected=C.evaluate(externalContext,externalSelection,snapshot.sources);
assert.deepEqual(json(externalSession.evaluate(externalSelection)),json(externalExpected),
  'external Buffs and equipment conflict use the official resolver');
const reorderedState=Object.fromEntries(Object.entries(json(externalState)).reverse());
const matchingSession=S.create(C.create({...externalOptions,baseState:reorderedState}),snapshot.sources);
assert.equal(matchingSession.evaluationContextSignature,externalSession.evaluationContextSignature);
matchingSession.dispose();
externalState.composite[0].flatAttack=28;
externalState.composite[3].enabled=true;
assert.deepEqual(json(externalSession.evaluate(externalSelection)),json(externalExpected),
  'live UI state mutation cannot change an existing session');
const updatedContext=C.create(externalOptions),updatedSession=S.create(updatedContext,snapshot.sources);
assert.notEqual(updatedSession.evaluationContextSignature,externalSession.evaluationContextSignature);
assert.deepEqual(json(updatedSession.evaluate(externalSelection)),
  json(C.evaluate(updatedContext,externalSelection,snapshot.sources)));
assert.notEqual(updatedSession.evaluate(externalSelection).score,externalExpected.score);
externalState.composite[0].tags='changed-competition';
const conflictSignature=S.create(C.create(externalOptions),snapshot.sources);
assert.notEqual(conflictSignature.evaluationContextSignature,updatedSession.evaluationContextSignature,
  'external Buff competition metadata enters the signature');
conflictSignature.dispose();
updatedSession.dispose();externalSession.dispose();
const buffFixture=p.MOEOptimizerV2Candidates.generate({items:[
  {catalogId:'latest-head',name:'latest-head',slot:'防具: 頭',category:'defense',
    equipBuffEnabled:true,equipBuffName:'shared technique',equipBuffTechnicId:'fixture-tech',
    equipBuffFlatAttack:5},
  {catalogId:'latest-hand',name:'latest-hand',slot:'防具: 手',category:'defense',
    equipBuffEnabled:true,equipBuffName:'shared technique',equipBuffTechnicId:'fixture-tech',
    equipBuffFlatAttack:9},
  {catalogId:'group-shoulder',name:'group-shoulder',slot:'防具: 肩',category:'defense',
    equipBuffEnabled:true,equipBuffName:'group shoulder',equipBuffConflictGroup:'fixture-group',
    equipBuffFlatAttack:7},
  {catalogId:'group-waist',name:'group-waist',slot:'防具: 腰',category:'defense',
    equipBuffEnabled:true,equipBuffName:'group waist',equipBuffConflictGroup:'fixture-group',
    equipBuffFlatAttack:11}
]});
const buffFields={
  'latest-head':{equipBuffEnabled:true,equipBuffName:'shared technique',
    equipBuffTechnicId:'fixture-tech',equipBuffFlatAttack:5},
  'latest-hand':{equipBuffEnabled:true,equipBuffName:'shared technique',
    equipBuffTechnicId:'fixture-tech',equipBuffFlatAttack:9},
  'group-shoulder':{equipBuffEnabled:true,equipBuffName:'group shoulder',
    equipBuffConflictGroup:'fixture-group',equipBuffFlatAttack:7},
  'group-waist':{equipBuffEnabled:true,equipBuffName:'group waist',
    equipBuffConflictGroup:'fixture-group',equipBuffFlatAttack:11}
};
const buffCandidates=buffFixture.candidates.map(c=>Object.freeze({...c,
  evaluationFields:{...c.evaluationFields,...buffFields[c.name]}}));
const buffContext=C.create({...common,objective:'attack',baseState:externalState});
const buffSession=S.create(buffContext,buffFixture.sources);
const buffChoice=names=>names.map(name=>buffCandidates.find(c=>c.name===name));
for(const names of [['latest-head','latest-hand'],['group-shoulder','group-waist'],
  ['latest-head','latest-hand','group-shoulder','group-waist']]){
  const chosen=buffChoice(names);
  assert.deepEqual(json(buffSession.evaluate(chosen)),
    json(C.evaluate(buffContext,chosen,buffFixture.sources)),
    'same-technic/latest and equipment group competition: '+names.join('+'));
}
assert.ok(buffSession.diagnostics.buffRowHitCount>0);
assert.ok(buffSession.diagnostics.compositePrototypeHitCount>0);
const firstChoice=buffChoice(['latest-head','latest-hand']);
const firstResult=json(buffSession.evaluate(firstChoice));
buffSession.evaluate(buffChoice(['group-shoulder','group-waist']));
assert.deepEqual(json(buffSession.evaluate(firstChoice)),firstResult,
  'A / B / A evaluation cannot mutate a prepared composite prototype');
// Capture the actual official pre-composite, post-conflict state in both paths.
const originalCompute=p.computeMetrics,captured=[];
try{
  p.computeMetrics=function(st,inputs,capture,...rest){
    const actual=capture||{},result=originalCompute(st,inputs,actual,...rest);
    captured.push(json({normalizedEquipment:actual.normalizedEquipment,
      resolvedBuffState:actual.resolvedBuffState}));return result;
  };
  C.evaluate(buffContext,buffChoice(['latest-head','latest-hand','group-shoulder','group-waist']),
    buffFixture.sources);
  buffSession.evaluate(buffChoice(['latest-head','latest-hand','group-shoulder','group-waist']));
}finally{p.computeMetrics=originalCompute;}
assert.deepEqual(captured[1],captured[0],
  'normalized equipment, same-technic and Buff conflict match the non-prepared official path');
buffSession.dispose();
// Mastery rows are generated from the frozen skillSim/runtime snapshot once.
// A later mutation of the caller's skillSim cannot change this session.
const masterySkills=json(skillSim);
const masteryOptions={...common,objective:'attack',skillSim:masterySkills,
  baseState:externalState};
const masteryContext=C.create(masteryOptions);
const masteryRows=C.withRuntime(masteryContext,()=>p.skillSimMasteryBuffRows());
assert.ok(masteryRows.length>1,'high skillSim activates multiple real mastery rows');
const masterySession=S.create(masteryContext,snapshot.sources);
const masterySelected=[candidate('session-gun'),candidate('session-bullet'),
  candidate('サイドパート ウィッグ')];
const masteryExpected=C.evaluate(masteryContext,masterySelected,snapshot.sources);
assert.deepEqual(json(masterySession.evaluate(masterySelected)),json(masteryExpected));
assert.deepEqual(json(masterySession.evaluate(masterySelected)),json(masteryExpected));
assert.equal(masterySession.diagnostics.masteryPreparedMissCount,1);
assert.equal(masterySession.diagnostics.masteryPreparedHitCount,2);
for(const name of Object.keys(masterySkills.skills))masterySkills.skills[name]=0;
assert.deepEqual(json(masterySession.evaluate(masterySelected)),json(masteryExpected),
  'existing session remains on its mastery skillSim snapshot');
const changedMasteryContext=C.create(masteryOptions);
const changedMasteryRows=C.withRuntime(changedMasteryContext,()=>p.skillSimMasteryBuffRows());
assert.ok(changedMasteryRows.length<masteryRows.length);
const changedMasterySession=S.create(changedMasteryContext,snapshot.sources);
assert.notEqual(changedMasterySession.evaluationContextSignature,
  masterySession.evaluationContextSignature);
assert.deepEqual(json(changedMasterySession.evaluate(masterySelected)),
  json(C.evaluate(changedMasteryContext,masterySelected,snapshot.sources)));
assert.notEqual(changedMasterySession.evaluate(masterySelected).score,masteryExpected.score);
changedMasterySession.dispose();masterySession.dispose();
console.log('v2 EvaluationSession: official metrics/DPS, resolved Buff reuse, branch isolation and six context signatures OK');
