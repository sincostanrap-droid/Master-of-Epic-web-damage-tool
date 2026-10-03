const assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const {json}=require('../tools/benchmark-optimizer.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,E=p.MOEOptimizerV2EffectiveCandidates,B=p.MOEOptimizerV2BranchAndBound;
const catalog=p.equipmentCatalogItems(),named=name=>{const item=catalog.find(x=>x.name===name);assert.ok(item,name);return item;};
const synthetic=(id,slot,extraStats={})=>({catalogId:id,name:id,slot,category:'defense',extraStats});
const head=[synthetic('head-ac','防具: 頭',{extraAC:10}),synthetic('head-hit','防具: 頭',{extraHit:8}),
  synthetic('head-crit','防具: 頭',{extraCritRatePct:20})];
const body=[synthetic('body-ac','防具: 胴',{extraAC:5}),synthetic('body-delay','防具: 胴',{extraAttackDelay:-10})];
const oneHand={catalogId:'gun-one',name:'gun-one',category:'weapon',slot:'武器: 右手',weaponType:'銃器',weaponHand:'1HAND',
  weaponDamage:50,weaponAttackInterval:250,weaponReq:[{name:'銃器',required:50}]};
const twoHand={...oneHand,catalogId:'gun-two',name:'gun-two',weaponHand:'2HAND',weaponDamage:70};
const shield=synthetic('shield','武器: 左手',{extraAC:20});shield.category='shield';
const ammo=synthetic('bullet','武器: 弾丸',{attack:3});ammo.category='weapon';ammo.ammoKind='gun';
const wrongAmmo={...ammo,catalogId:'arrow',name:'arrow',ammoKind:'bow'};
const skillItem=named('女神官の錫杖');
const critBuff=named('サイドパート ウィッグ'),delayBuff=named('アルスリア ウィッグ カラー');
const conversion=catalog.find(x=>x.slot==='防具: 胴'&&x.equipBuff&&p.catalogEquipmentToRow(x).equipBuffConvMagicRate>0);
const multi=catalog.find(x=>x.slot==='武器: 右手'&&x.weaponType==='こんぼう'&&x.weaponReq?.length>1);
assert.ok(conversion&&multi);
const skillSim=vm.runInContext('defaultSkillSimState()',p);
for(const name of Object.keys(skillSim.skills))skillSim.skills[name]=100;
const base=vm.runInContext('DEFAULT_STATE()',p);
const signature=results=>Array.from(results,r=>[r.score,crypto.createHash('sha256').update(r.performanceKey).digest('hex').slice(0,12)]);
function oracle(reduction) {
  const {context}=reduction,bySlot=new Map();
  for(const cls of reduction.contextEquivalentClasses) {
    if(!reduction.candidates.includes(cls.representativeCandidate))continue;
    const slot=cls.representativeCandidate.slot;
    if(!bySlot.has(slot))bySlot.set(slot,[]);
    bySlot.get(slot).push(cls.representativeCandidate);
  }
  const slots=[...bySlot.keys()],answers=new Map();let complete=0;
  function visit(depth,selected) {
    if(depth===slots.length) {
      complete++;
      const evaluated=C.evaluate(context,selected,reduction.sources);
      if(!evaluated.feasible)return;
      const key=E.describeConfiguration(reduction,selected.map(c=>c.candidateId)).performanceKey;
      answers.set(key,{score:evaluated.score,rankScore:evaluated.rankScore,performanceKey:key});
      return;
    }
    visit(depth+1,selected);
    for(const candidate of bySlot.get(slots[depth]))visit(depth+1,[...selected,candidate]);
  }
  visit(0,[]);
  const results=[...answers.values()].sort((a,b)=>b.rankScore-a.rankScore
    || (a.performanceKey<b.performanceKey?-1:a.performanceKey>b.performanceKey?1:0)).slice(0,context.topK);
  return {results,complete};
}
function check(name,items,options={}) {
  const snapshot=p.MOEOptimizerV2Candidates.generate({items});
  const slots=[...new Set(items.map(i=>i.slot))];
  const context=C.create({objective:'ac',topK:3,slots,skillSim,inputs:{str:100,spirit:100,allowCrit:true,critRate:1},...options});
  const reduction=E.reduce(snapshot,context),expected=oracle(reduction);
  if(!options.expectNoFeasible)assert.ok(expected.results.length>0,`${name}: oracle must find a feasible configuration`);
  const settings=[{enablePruning:false,slotOrder:'catalog',preparedEvaluation:false},
    {enablePruning:false,slotOrder:'catalog',preparedEvaluation:true},
    {enablePruning:true,boundMode:'phase3',slotOrder:'catalog'},
    {enablePruning:true,slotOrder:'catalog'},
    {enablePruning:true,slotOrder:'fewest'},
    {enablePruning:true,slotOrder:'ascending'},
    {enablePruning:true,slotOrder:'descending'},
    {enablePruning:true,slotOrder:'blockers'},
    {enablePruning:true,slotOrder:'impact'},
    {enablePruning:true,slotOrder:slots.slice().reverse()}];
  for(const setting of settings) {
    const actual=B.run(reduction,setting);
    assert.deepEqual(signature(actual.results),signature(expected.results),`${name}: ${JSON.stringify(setting)}`);
    assert.equal(actual.diagnostics.exact,true);assert.equal(actual.diagnostics.approximate,false);
    if(!setting.enablePruning) {
      assert.equal(actual.diagnostics.feasibilityPrunedNodes,0);
      assert.equal(actual.diagnostics.boundPrunedNodes,0);
      if(!context.fixedCandidateIds.length)assert.equal(actual.diagnostics.completeConfigurationsEvaluated,expected.complete,
        name+' pruning-off path evaluates every class combination');
    }
    assert.equal(actual.diagnostics.inputCandidateCount,reduction.diagnostics.afterFilterCount);
    assert.equal(new Set(actual.results.map(r=>r.performanceKey)).size,actual.results.length);
    for(const result of actual.results) for(const equipment of result.equipment)
      for(const id of equipment.equivalentCandidateIds)
        assert.equal(E.resolveCandidate(equipment,id).candidateId,id);
  }
  console.log(`${name}: classes=${reduction.candidates.length} brute=${expected.complete} top=${JSON.stringify(expected.results.map(x=>x.score))}`);
  return {reduction,expected};
}
const gunDps={objective:'attackDps',mainWeaponSkill:'銃器'};
check('1 attackDps maximum',[oneHand,twoHand,shield,...head.slice(0,2)],gunDps);
const designated=check('designated main slot',[oneHand,shield,head[0]],
  {...gunDps,mainWeaponSlot:'武器: 右手'});
assert.ok(B.run(designated.reduction).diagnostics.feasibilityPrunedNodes>0);
check('2 physicalDamage maximum',[oneHand,twoHand,shield,...head.slice(0,2)],{objective:'physicalDamage'});
check('3 AC maximum',[oneHand,shield,...head.slice(0,2),...body],{objective:'ac'});
check('4 recovery magic skillPlus maximum',[skillItem,...head.slice(0,2)],{objective:{metric:'skillPlus',skillName:'回復魔法'}});
check('5 attack maximum',[oneHand,head[0],head[1],conversion],{objective:'attack'});
check('6 critical >= +100 and DPS',[oneHand,critBuff,...head.slice(0,2)],{...gunDps,
  baseState:{...json(base),composite:[{name:'fixed crit',enabled:true,extraCritRatePct:70}]},
  constraints:[{metric:'critRate',op:'gte',value:100}]});
check('7 delay <= -10 and DPS',[oneHand,...body],{...gunDps,constraints:[{metric:'attackDelay',op:'lte',value:-10}]});
check('8 AC >= 10 and attack',[oneHand,...head,...body],{objective:'attack',constraints:[{metric:'ac',op:'gte',value:10}]});
check('9 skillPlus >= 10 and AC',[skillItem,...head.slice(0,2)],{objective:'ac',
  constraints:[{metric:{metric:'skillPlus',skillName:'回復魔法'},op:'gte',value:10}]});
check('10 multiple constraints',[oneHand,critBuff,body[1],shield],{...gunDps,
  baseState:{...json(base),composite:[{name:'fixed crit',enabled:true,extraCritRatePct:70}]},
  constraints:[{metric:'critRate',op:'gte',value:100},{metric:'attackDelay',op:'lte',value:-10},
    {metric:'ac',op:'gte',value:20}]});
check('11 one hand plus left hand',[oneHand,shield,head[0]],{objective:'ac'});
const twoHandCase=check('12 two handed conflict',[oneHand,twoHand,shield,head[0]],{objective:'attack'});
assert.ok(B.run(twoHandCase.reduction).diagnostics.invalidEquipmentCombinationCount>0);
const ammoCase=check('13 ammunition compatibility',[oneHand,ammo,wrongAmmo],{objective:'physicalDamage'});
assert.ok(B.run(ammoCase.reduction).diagnostics.invalidEquipmentCombinationCount>0);
const fixed=p.MOEOptimizerV2Candidates.generate({items:[oneHand,twoHand,shield]});
const fixedCase=check('14 fixed equipment',[oneHand,twoHand,shield],{objective:'attack',fixedCandidateIds:[fixed.candidates[0].candidateId]});
assert.ok(B.run(fixedCase.reduction).results.every(x=>x.candidateIds.includes(fixed.candidates[0].candidateId)));
const excludedCase=check('15 excluded equipment',[oneHand,twoHand,shield],{objective:'attack',excludedCandidateIds:[fixed.candidates[1].candidateId]});
assert.ok(B.run(excludedCase.reduction).results.every(x=>!x.candidateIds.includes(fixed.candidates[1].candidateId)));
const emptyCase=check('16 empty equipment',[head[0],body[0]],{objective:{metric:'ac',direction:'min'},topK:4});
assert.equal(B.run(emptyCase.reduction).results[0].candidateIds.length,0);
check('17 multiple requirements',[multi,oneHand,head[0]],{objective:'physicalDamage',mainWeaponSkill:'こんぼう',
  skillSim:{...json(skillSim),skills:{...json(skillSim.skills),'こんぼう':35.2,'採掘':100}}});
const buffCase=check('18 equipment Buff',[oneHand,critBuff,delayBuff],{...gunDps});
assert.deepEqual(Array.from(B.run(buffCase.reduction).diagnostics.boundMetrics),[],
  'resolved equipment Buffs disable additive bounds');
const converted=check('19 conversion effect',[oneHand,conversion,head[0]],{objective:'physicalDamage'});
assert.ok(B.run(converted.reduction).results[0].candidateIds.some(id=>
  converted.reduction.candidates.find(c=>c.candidateId===id)?.catalogId===conversion.catalogId));
for(const objective of ['accuracy','evasion','magic','hp','st','mp','moveSpeed','attackDelay','critical','extraStat']) {
  const actual=objective==='extraStat'?{metric:'extraStat',stat:'extraAC'}:objective;
  check(`generic ${objective}`,[...head.slice(0,2),body[0]],{objective:actual,topK:4});
}
check('generic numeric official metric',[...head.slice(0,2),body[0]],
  {objective:{metric:'numeric',path:'extraStats.extraAC'},topK:4});
// On a separable fixture, both safe feasibility and objective bounds must do real work.
const pruningItems=[synthetic('ac-1','防具: 頭',{extraAC:1}),synthetic('ac-10','防具: 頭',{extraAC:10}),
  synthetic('ac-2','防具: 胴',{extraAC:2}),synthetic('ac-20','防具: 胴',{extraAC:20}),
  synthetic('ac-3','防具: 手',{extraAC:3}),synthetic('ac-30','防具: 手',{extraAC:30})];
for(const [label,options,field] of [
  ['objective',{objective:'ac',topK:1},'boundPrunedNodes'],
  ['feasibility',{objective:'ac',topK:1,constraints:[{metric:'ac',op:'gte',value:50}]},'feasibilityPrunedNodes']
]) {
  const s=p.MOEOptimizerV2Candidates.generate({items:pruningItems});
  const c=C.create({...options,slots:[...new Set(pruningItems.map(i=>i.slot))]});
  const r=E.reduce(s,c),on=B.run(r),off=B.run(r,{enablePruning:false});
  assert.deepEqual(signature(on.results),signature(off.results),label+' proof preserves the exact Top-K');
  assert.ok(on.diagnostics[field]>0,label+' bound must actually prune');
  assert.ok(on.diagnostics.completeConfigurationsEvaluated<off.diagnostics.completeConfigurationsEvaluated);
}
const unrelatedBuff={...synthetic('attack-only-buff','防具: 頭'),equipBuffEnabled:true,
  equipBuffName:'test attack-only buff',equipBuffFlatAttack:5};
const acMetric=check('metric-local equipment Buff proof',[unrelatedBuff,pruningItems[2],pruningItems[3]],
  {objective:'ac',topK:1});
const acProof=B.run(acMetric.reduction,{slotOrder:'blockers'}).diagnostics;
assert.ok(acProof.boundMetrics.some(spec=>spec.metric==='ac'));
assert.equal(acProof.slotBoundBlockers['防具: 頭'][JSON.stringify(acMetric.reduction.context.objective)].blockerCount,0,
  'attack-only Buff does not block the AC metric');
const fixedAcBuff=named('ガーディアン スピリット');
const buffAc=check('resolved flat AC Buff',[fixedAcBuff,pruningItems[2]],{objective:'ac',topK:2});
const buffProof=B.run(buffAc.reduction).diagnostics;
assert.equal(buffProof.slotBoundBlockers[fixedAcBuff.slot][JSON.stringify(buffAc.reduction.context.objective)].blockerCount,0);
const inspected=B.inspectBounds(buffAc.reduction).metrics[JSON.stringify(buffAc.reduction.context.objective)];
assert.ok(Object.values(inspected.candidates).some(x=>x.classification==='provenAdditiveBuff'));
console.log('v2 Branch & Bound: brute Top-K, phase3/phase3.5/off bounds, five slot orders, metric-local Buff proof OK');
