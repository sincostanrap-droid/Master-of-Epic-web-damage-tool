const assert=require('node:assert/strict'),vm=require('node:vm');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,R=p.MOEOptimizerV2MetricCandidateReducer,
  E=p.MOEOptimizerV2EffectiveCandidates,B=p.MOEOptimizerV2BranchAndBound;
const json=v=>JSON.parse(JSON.stringify(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const flat=(id,value,slot='防具: 頭')=>({catalogId:id,name:id,category:'defense',slot,extraStats:{extraAC:value}});
const catalog=p.equipmentCatalogItems(),named=name=>{const c=catalog.find(c=>c.name===name);assert.ok(c,name);return c;};
const skillSim=vm.runInContext('defaultSkillSimState()',p);
Object.keys(skillSim.skills).forEach(n=>skillSim.skills[n]=100);
function brute(snapshot,context,reduction) {
  const eligible=new Set(E.reduce(snapshot,context).contextEquivalentClasses.flatMap(c=>c.equivalentCandidateIds));
  const choices=context.slots.map(slot=>snapshot.candidates.filter(c=>eligible.has(c.candidateId)&&c.slot===slot));
  const answers=new Map();
  function visit(depth,selected) {
    if(depth===choices.length) {
      const evaluated=C.evaluate(context,selected,snapshot.sources);if(!evaluated.feasible)return;
      const performanceKey=R.describeConfiguration(reduction,selected.map(c=>c.candidateId)).performanceKey;
      if(answers.has(performanceKey))assert.equal(answers.get(performanceKey).score,evaluated.score,'canonical class score');
      answers.set(performanceKey,{score:evaluated.score,performanceKey});return;
    }
    visit(depth+1,selected);
    for(const c of choices[depth])visit(depth+1,[...selected,c]);
  }
  visit(0,[]);
  return [...answers.values()].sort((a,b)=>b.score-a.score||(a.performanceKey<b.performanceKey?-1:a.performanceKey>b.performanceKey?1:0)).slice(0,context.topK);
}
function check(name,items,options={}) {
  const {editRows,...contextOptions}=options;
  const snapshot=editRows?json(p.MOEOptimizerV2Candidates.generate({items})):p.MOEOptimizerV2Candidates.generate({items});
  if(editRows){editRows(snapshot.candidates);freeze(snapshot);}
  const before=JSON.stringify(snapshot);
  const context=C.create({objective:'ac',topK:20,slots:[...new Set(items.map(c=>c.slot))],skillSim,...contextOptions});
  const reduction=R.reduce(snapshot,context),expected=brute(snapshot,context,reduction);
  for(const setting of [{enablePruning:false},{enablePruning:true},{slotOrder:'descending'},{slotOrder:'blockers',preparedEvaluation:false}]) {
    const actual=B.run(reduction,setting);
    assert.deepEqual(json(actual.results.map(r=>({score:r.score,performanceKey:r.performanceKey}))),json(expected),name+JSON.stringify(setting));
    assert.equal(actual.diagnostics.exact,true);
    for(const result of actual.results) {
      const candidates=result.candidateIds.map(id=>R.resolveCandidate(reduction,id));
      const formal=C.evaluate(context,candidates,snapshot.sources);
      assert.equal(formal.score,result.score);assert.deepEqual(json(formal.metrics),json(result.metrics));
      assert.equal(R.describeConfiguration(reduction,result.candidateIds).performanceKey,result.performanceKey);
    }
  }
  assert.equal(JSON.stringify(snapshot),before);
  for(const c of snapshot.candidates)if(!reduction.filtered.some(f=>f.candidateId===c.candidateId))
    assert.equal(R.resolveCandidate(reduction,c.candidateId).candidateId,c.candidateId);
  console.log(name,JSON.stringify(reduction.diagnostics.metricReduction));
  return reduction;
}
const ladder=Array.from({length:24},(_,i)=>flat('ladder-'+i,i+1));
const ladderResult=check('Top20 lower flat values required',[...ladder,flat('inert',0)]);
assert.equal(ladderResult.diagnostics.metricReduction.dominatedClassCount,4);
check('Top1 flat dominance',[...ladder],{topK:1});
check('ties and null',[flat('tie-a',10),flat('tie-b',10),flat('zero',0),flat('negative',-1)]);
check('percent and high flat',[flat('high',30,'装飾: 胸'),flat('low',25,'装飾: 胸'),named('アース チェストベル'),flat('body',100,'防具: 胴')]);
check('different requirements',[{...flat('req-low',5),requiredSkill:'着こなし',needLevel:1},
  {...flat('req-high',20),requiredSkill:'着こなし',needLevel:80}],{topK:1});
check('hard conflict differences',[{...flat('tagged',30),tags:'exclusive-test'},flat('untagged',20),
  {...flat('other',10,'防具: 胴'),tags:'exclusive-test'}],{topK:1,editRows:cs=>{
    cs[0].evaluationFields.tags='exclusive-test';cs[2].evaluationFields.tags='exclusive-test';}});
const target=named('女神官の錫杖');
check('skillPlus same-technic and zero competitors',[target,{...target,catalogId:'same-technic-copy',name:'same-technic-copy'},
  named('ゴッドアイ リング'),flat('other-stat',0,'防具: 胴')],{objective:{metric:'skillPlus',skillName:'回復魔法'}});
check('group closure and external Buff',[named('天秤剣'),named('ダークネス サイス'),named('スターライト リング')],
  {objective:{metric:'skillPlus',skillName:'回復魔法'}});
const weapon={catalogId:'zero-gun',name:'zero gun',slot:'武器: 右手',category:'weapon',weaponType:'銃器',weaponHand:'2HAND',
  weaponDamage:50,weaponAttackInterval:100,weaponReq:[{name:'銃器',required:100}]};
const ammo={catalogId:'zero-ammo',name:'zero arrow',slot:'武器: 弾丸',category:'weapon',ammoKind:'bow',weaponDamage:1};
check('inert hands and ammo become null',[weapon,ammo,flat('shield',3,'武器: 左手')]);
const effect=value=>[{key:'skillPlus',name:'回復魔法',value,scope:'display'}];
const buff=(row,name,groups,attack,effects=[])=>Object.assign(row,{equipBuffEnabled:true,equipBuffName:name,
  equipBuffTechnicId:name,equipBuffConflictGroups:groups,equipBuffStackRule:'score',equipBuffFlatAttack:attack,extraEffects:effects});
const chain=[flat('chain-target',0),flat('chain-middle',0,'防具: 胴'),flat('chain-end',0,'防具: 手')];
const chainResult=check('transitive zero interaction and foreign group scoring',chain,{
  objective:{metric:'skillPlus',skillName:'回復魔法'},editRows:cs=>{
    buff(cs[0].evaluationFields,'chain-A','fixture-x',0,effect(5));
    buff(cs[1].evaluationFields,'chain-B','fixture-x,fixture-y',10);
    buff(cs[2].evaluationFields,'chain-C','fixture-y',20);
  }});
assert.equal(chainResult.diagnostics.metricReduction.interactionAddedCount,2);
const stackResult=check('latest zero-target same-technic suppressor',[flat('stack-target',0),flat('stack-zero',0,'防具: 胴')],{
  objective:{metric:'skillPlus',skillName:'回復魔法'},editRows:cs=>{
    buff(cs[0].evaluationFields,'fixture-same','',0,effect(5));
    buff(cs[1].evaluationFields,'fixture-same','',10);
  }});
assert.equal(stackResult.diagnostics.metricReduction.interactionAddedCount,1);
const externalBase=vm.runInContext('DEFAULT_STATE()',p);
externalBase.composite=[{enabled:true,name:'fixed external',tags:'fixture-x',flatAttack:30}];
check('fixed external competition',chain,{baseState:externalBase,objective:{metric:'skillPlus',skillName:'回復魔法'},
  editRows:cs=>{buff(cs[0].evaluationFields,'external-A','fixture-x',0,effect(5));
    buff(cs[1].evaluationFields,'external-B','fixture-x,fixture-y',10);
    buff(cs[2].evaluationFields,'external-C','fixture-y',20);}});
const negativeScale=check('negative AC multiplier disables dominance',[flat('negative-scale-low',10),flat('negative-scale-high',20),
  flat('negative-percentage',0,'防具: 胴')],{topK:1,editRows:cs=>{
    buff(cs[2].evaluationFields,'negative percentage','',0);cs[2].evaluationFields.equipBuffExtraACPct=-200;
  }});
assert.equal(negativeScale.diagnostics.metricReduction.positiveMultiplierProven,false);
assert.equal(negativeScale.diagnostics.metricReduction.dominatedClassCount,0);
const hostileSnapshot=json(p.MOEOptimizerV2Candidates.generate({items:chain}));
buff(hostileSnapshot.candidates[0].evaluationFields,'latest-target','hostile',0,effect(5));
hostileSnapshot.candidates[0].evaluationFields.equipBuffStackRule='latest';
buff(hostileSnapshot.candidates[1].evaluationFields,'scored-target','hostile',0,effect(40000000));
freeze(hostileSnapshot);
const hostileContext=C.create({objective:{metric:'skillPlus',skillName:'回復魔法'},slots:chain.map(c=>c.slot)});
assert.equal(R.reduce(hostileSnapshot,hostileContext).metricReducer.reason,'unproved-runtime-order-priority');
const fixedSnapshot=p.MOEOptimizerV2Candidates.generate({items:[flat('fixed-zero',0),flat('not-fixed',10)]});
const fixedContext=C.create({objective:'ac',slots:['防具: 頭'],fixedCandidateIds:[fixedSnapshot.candidates[0].candidateId]});
const fixedReduction=R.reduce(fixedSnapshot,fixedContext);
assert.equal(fixedReduction.candidates[0].candidateId,fixedSnapshot.candidates[0].candidateId);
assert.equal(B.run(fixedReduction).diagnostics.exact,true);
const unsupported=C.create({objective:'attack',slots:['防具: 頭']});
const small=p.MOEOptimizerV2Candidates.generate({items:[flat('a',1)]});
const fallback=R.reduce(small,unsupported);assert.equal(fallback.metricReducer.applied,false);
assert.ok(fallback.candidatePreparation,'fallback preserves non-enumerable preparation');
const constrained=C.create({objective:'ac',constraints:[{metric:'ac',op:'gte',value:1}],slots:['防具: 頭']});
assert.equal(R.reduce(small,constrained).metricReducer.applied,false);
console.log('Metric reducer: canonical independent brute Top-K, bounds/orders, null, ties, requirements/conflicts, percentages and restoration OK');
