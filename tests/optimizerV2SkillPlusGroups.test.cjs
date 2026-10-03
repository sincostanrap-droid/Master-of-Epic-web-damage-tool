const assert=require('node:assert/strict'),vm=require('node:vm');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound;
const json=v=>JSON.parse(JSON.stringify(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const skillSim=vm.runInContext('defaultSkillSimState()',p);Object.keys(skillSim.skills).forEach(k=>skillSim.skills[k]=100);
let partialCount=0;
function check(name,defs,{external=[],realItems=null,skillSimOverride=null}={}){
 const snapshot=json(p.MOEOptimizerV2Candidates.generate({items:realItems||defs.map(d=>({catalogId:d.id,name:d.id,slot:d.slot,category:'defense'}))}));
 if(!realItems)snapshot.candidates.forEach((c,i)=>{const d=defs[i];Object.assign(c.evaluationFields,{
  equipBuffEnabled:true,equipBuffName:d.id,equipBuffTechnicId:d.tech||d.id,equipBuffConflictGroups:d.groups||'',
  equipBuffStackRule:d.rule||'score',equipBuffFlatAttack:d.attack||0,
  extraEffects:[{key:'skillPlus',name:'回復魔法',value:d.value}],...d.row});});freeze(snapshot);
 const base=vm.runInContext('DEFAULT_STATE()',p);base.composite=external;
 const context=C.create({objective:{metric:'skillPlus',skillName:'回復魔法'},topK:20,skillSim:skillSimOverride||skillSim,baseState:base,
  slots:[...new Set(snapshot.candidates.map(c=>c.slot))]});
 const reduction=R.reduce(snapshot,context),proof=B.inspectSkillPlusPotential(reduction);assert.ok(proof);
 const all=new Map();let count=0;
 function visit(depth,chosen){
  let max=-Infinity;
  if(depth===context.slots.length){const e=C.evaluate(context,chosen,snapshot.sources);if(e.feasible){max=e.score;
   const key=R.describeConfiguration(reduction,chosen.map(c=>c.candidateId)).performanceKey;
   all.set(key,{score:e.score,performanceKey:key});}}
  else{max=visit(depth+1,chosen);for(const c of snapshot.candidates.filter(c=>c.slot===context.slots[depth]))max=Math.max(max,visit(depth+1,[...chosen,c]));}
  const ids=chosen.map(c=>c.candidateId).filter(id=>Object.hasOwn(proof.candidates,id));
  const u=B.inspectSkillPlusPotential(reduction,ids,context.slots.slice(depth));
  assert.deepEqual(json(u.preparedGroupAware),json(u.groupAware),`${name} exact old/new partial ${depth}`);
  const reversed=B.inspectSkillPlusPotential(reduction,ids,context.slots.slice(depth).reverse());
  assert.deepEqual(json(reversed.preparedGroupAware),json(reversed.groupAware),`${name} reversed suffix ${depth}`);
  assert.ok(u.groupAware.upper>=max,`${name} partial ${depth}: ${u.groupAware.upper} >= ${max}`);
  assert.ok(u.groupAware.upper<=u.upperBound);count++;return max;
 }
 visit(0,[]);partialCount+=count;
 const expected=[...all.values()].sort((a,b)=>b.score-a.score||(a.performanceKey<b.performanceKey?-1:1)).slice(0,20);
 const oldDiagnostics=new Map();
 const comparable=d=>json(Object.fromEntries(['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes',
  'feasibilityPrunedNodes','invalidEquipmentCombinationCount','upperBoundKnownCount','upperBoundUnknownCount',
  'groupAwareBoundUseCount','groupAwareReductionCount','upperBoundSummary','nodesByDepth','boundPrunesByDepth',
  'kthScoreHistory'].map(key=>[key,d[key]])));
 for(const options of [{enablePruning:false},{skillPlusGroupAwareBound:false},
  {slotOrder:'blockers',skillPlusPreparedGroupBound:false},{slotOrder:'blockers'},
  {slotOrder:'descending',skillPlusPreparedGroupBound:false}, {slotOrder:'descending'},
  {slotOrder:'ascending',skillPlusPreparedGroupBound:false},{slotOrder:'ascending'},
  {slotOrder:'blockers',candidateOrder:'potential'}]){
  const actual=B.run(reduction,options);
  assert.equal(actual.diagnostics.exact,true);
  assert.deepEqual(json(actual.results.map(r=>({score:r.score,performanceKey:r.performanceKey}))),expected,name+JSON.stringify(options));
  if(options.skillPlusPreparedGroupBound===false)oldDiagnostics.set(options.slotOrder,comparable(actual.diagnostics));
  else if(options.candidateOrder!=="potential" && oldDiagnostics.has(options.slotOrder))
   assert.deepEqual(comparable(actual.diagnostics),oldDiagnostics.get(options.slotOrder),`${name} old/new nodes/bounds/prunes`);
  for(const r of actual.results){const evaluated=C.evaluate(context,r.candidateIds.map(id=>R.resolveCandidate(reduction,id)),snapshot.sources);
   assert.equal(evaluated.score,r.score);assert.deepEqual(json(evaluated.metrics),json(r.metrics));}
 }
 console.log(name,`partial states ${count}`,JSON.stringify(proof.classification));
 return {proof,context,reduction,snapshot};
}
const H='防具: 頭',D='防具: 胴',G='防具: 手';
check('no group, Top20 ties and null',[
 ...Array.from({length:5},(_,i)=>({id:'H'+i,slot:H,value:5+i})),
 ...Array.from({length:5},(_,i)=>({id:'D'+i,slot:D,value:5+i}))]);
const exclusive=check('manual exclusive group positives',[{id:'5',slot:H,value:5,groups:'X'},
 {id:'4',slot:D,value:4,groups:'X'},{id:'3',slot:G,value:3,groups:'X'}]);
assert.equal(exclusive.proof.upperBound,12);assert.equal(exclusive.proof.groupAware.upper,5);
for(const [ids,slots] of [[['not-a-candidate'],[H]],[[],['not-a-slot']]]) {
 const invalid=B.inspectSkillPlusPotential(exclusive.reduction,ids,slots);
 assert.equal(invalid.groupAware,null);assert.equal(invalid.preparedGroupAware,null);
}
const overflow=check('group relaxation overflow retains legacy sum fallback',[
 {id:'large-x',slot:H,value:5_000_000_000_000_000,groups:'X'},
 {id:'large-y',slot:H,value:5_000_000_000_000_000,groups:'Y'}]);
assert.equal(overflow.proof.groupAware.groupUpper,null);
assert.equal(overflow.proof.groupAware.upper,overflow.proof.upperBound);
const mixed=check('independent Composite plus competing Buff rows',[
 {id:'buff5',slot:H,value:5,groups:'X'},{id:'buff4',slot:D,value:4,groups:'X'}],
 {external:[{enabled:true,name:'independent',extraEffects:[{key:'skillPlus',name:'回復魔法',value:3}]}]});
assert.equal(mixed.proof.groupAware.upper,8,'independent +3 is not grouped with Buff +5');
check('multiple effects on a single Buff must stay together',[
 {id:'two-effects',slot:H,value:0,groups:'X',row:{extraEffects:[
  {key:'skillPlus',name:'回復魔法',value:5},{key:'skillPlus',name:'回復魔法',value:3}]}},
 {id:'other',slot:D,value:6,groups:'X'}]);
check('same-technic latest and zero suppressor',[
 {id:'early',slot:H,value:15,tech:'S'},{id:'late',slot:D,value:4,tech:'S'},
 {id:'zero',slot:G,value:0,tech:'S'}]);
check('external positive competes with equipped latest',[
 {id:'eq7',slot:H,value:7,groups:'X',rule:'latest'},{id:'eq0',slot:D,value:0,groups:'X',attack:100}],
 {external:[{enabled:true,name:'external11',tags:'X',extraEffects:[{key:'skillPlus',name:'回復魔法',value:11}]}]});
check('multiple group membership and later winner changes',[
 {id:'positive',slot:H,value:5,groups:'X'},
 {id:'bridge',slot:D,value:0,groups:'X,Y',attack:10},
 {id:'winner',slot:G,value:4,groups:'Y',attack:20}]);
check('overlapping positive cliques cannot be underestimated',[
 {id:'xy',slot:H,value:12,groups:'X,Y'},{id:'x',slot:D,value:8,groups:'X'},
 {id:'y',slot:G,value:9,groups:'Y'}]);
const unmet=json(skillSim);unmet.skills['銃器']=0;
const occupied=check('hard conflict 2HAND and requirements',[
 {id:'twohand',slot:'武器: 右手',value:10,groups:'X',row:{weaponDamage:30,weaponAttackInterval:200,
  weaponTwoHanded:'○',weaponReq:[{name:'銃器',required:100}],tags:'hard'}},
 {id:'left',slot:'武器: 左手',value:20,groups:'X'},
 {id:'head',slot:H,value:12,row:{tags:'hard'}}],{skillSimOverride:unmet});
assert.equal(occupied.context.skillSim.skills['銃器'],0);
assert.ok(C.evaluate(occupied.context,occupied.snapshot.candidates.slice(0,2),occupied.snapshot.sources).violations.includes('two-handed-conflict'));
assert.ok(C.evaluate(occupied.context,[occupied.snapshot.candidates[0],occupied.snapshot.candidates[2]],occupied.snapshot.sources).violations.includes('equipment-conflict'));
const real=p.equipmentCatalogItems();
const mastery=check('official auto compatibility and mastery coexistence',[],{realItems:[
 real.find(c=>c.name==='女神官の錫杖'),real.find(c=>c.name==='双天使のリング'),real.find(c=>c.name==='ウェンディ なりきりウィッグ')]});
assert.ok(C.withRuntime(mastery.context,()=>p.expandSkillSimMasteryBuffState(mastery.context.baseState).other
 .some(row=>row.source==='skillSimMastery')),'real mastery rows present (official model retires other before skillPlus)');
console.log(`total group safety partial states ${partialCount}`);
