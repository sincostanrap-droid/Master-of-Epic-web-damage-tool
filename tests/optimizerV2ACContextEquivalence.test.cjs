const assert=require('node:assert/strict');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),V=p.MOEOptimizerV2Candidates,C=p.MOEOptimizerV2SearchContext,
 R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound;
const json=x=>JSON.parse(JSON.stringify(x));
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const item=(id,raw,req,slot='防具: 頭',add=0)=>({catalogId:id,name:id,category:'defense',slot,
 armorClass:raw,requiredSkill:'着こなし',needLevel:req,requirements:req?[{name:'着こなし',required:req}]:[],extraStats:{extraAC:add}});
const context=(skill,slots=['防具: 頭'])=>C.create({objective:'ac',race:'newtar',skillSim:{skills:{'着こなし':skill}},slots,topK:20});
function make(items,edits={}){const s=json(V.generate({items}));for(const c of s.candidates)Object.assign(c.evaluationFields,edits[c.catalogId]||{});return freeze(s);}
const equal=make([item('a',10,50),item('b',8,30)]),c=context(40),r=R.reduce(equal,c);
assert.equal(R.reduce(equal,c,{acFixedContextEquivalence:false}).contextEquivalentClasses.length,2);
assert.equal(r.contextEquivalentClasses.length,1);
assert.equal(r.contextEquivalentClasses[0].equivalentCandidateIds.length,2);
const formal=equal.candidates.map(x=>p.equipmentArmorAC(V.toEquipmentRow(x),c.skillSim));
assert.ok(Object.is(formal[0].effective,formal[1].effective));
assert.ok(Object.is(formal[0].addition,formal[1].addition));
assert.equal(R.reduce(equal,context(50)).contextEquivalentClasses.length,2,'reproject on clothing change');
assert.equal(R.reduce(equal,c).contextEquivalentClasses[0].equivalenceKey,r.contextEquivalentClasses[0].equivalenceKey,'A to B to A');
const sessions=[p.MOEOptimizerV2EvaluationSession.create(c,equal.sources),p.MOEOptimizerV2EvaluationSession.create(context(50),equal.sources)];
assert.notEqual(sessions[0].evaluationContextSignature,sessions[1].evaluationContextSignature);
sessions.forEach(s=>s.dispose());
const near=make([item('nearA',8,30),item('nearB',8.000000000000002,30)]);
assert.equal(R.reduce(near,c).contextEquivalentClasses.length,2,'no tolerance merge');
const restrictions=make([{...item('male',8,30),equipGender:'MALE'}, {...item('all',8,30),equipGender:'ALL'}]);
assert.equal(R.reduce(restrictions,c).contextEquivalentClasses.length,2,'restrictions retained');
const hands=make([item('one',0,0,'武器: 右手',3),item('two',0,0,'武器: 右手',3)],{
 one:{weaponDamage:10,weaponAttackInterval:100,weaponReq:[{name:'刀剣',required:10}],weaponTwoHanded:false},
 two:{weaponDamage:10,weaponAttackInterval:100,weaponReq:[{name:'刀剣',required:10}],weaponTwoHanded:true}});
assert.equal(R.reduce(hands,context(40,['武器: 右手'])).contextEquivalentClasses.length,2,'occupancy retained');
const twoParts=make([item('body',7,0,'防具: 頭',0),item('bonus',0,0,'防具: 頭',8)]);
assert.equal(R.reduce(twoParts,context(100)).contextEquivalentClasses.length,2,'same scalar8 but different body/addition must not merge');
for(const skill of [79.999999,80,80.000001,99.999999,100]){
 const s=make([item('req100',100,100,'防具: 頭',1),item('req80',100,80,'防具: 頭',1)]),cx=context(skill),out=R.reduce(s,cx);
 const values=s.candidates.map(x=>p.equipmentArmorAC(V.toEquipmentRow(x),cx.skillSim).effective);
 assert.equal(out.contextEquivalentClasses.length,Object.is(values[0],values[1])?1:2,'exact boundary '+skill);
}
assert.equal(p.equipmentArmorAC(V.toEquipmentRow(make([item('above',100,99.999999)]).candidates[0]),context(100).skillSim).performance.mod,1);
const distinctions=make([item('buffA',100,200),item('buffB',100,200),item('conflict',100,200),item('bonus',100,200,'防具: 頭',2)],{
 buffA:{equipBuffEnabled:true,equipBuffName:'AC A',equipBuffExtraAC:3,equipBuffConflictGroups:'g'},
 buffB:{equipBuffEnabled:true,equipBuffName:'AC B',equipBuffExtraAC:3,equipBuffConflictGroups:'h'},
 conflict:{tags:'hard-different'}});
assert.equal(R.reduce(distinctions,context(70)).contextEquivalentClasses.length,4,'zero body preserves Buff/bonus/conflict');
let partials=0;
function check(items,skill,edits={}){
 const s=make(items,edits),cx=context(skill,[...new Set(items.map(i=>i.slot))]),out=R.reduce(s,cx),old=R.reduce(s,cx,{acFixedContextEquivalence:false}),answers=new Map();
 function brute(depth,selected){
  if(depth===cx.slots.length){const e=C.evaluate(cx,selected,s.sources);if(!e.feasible)return;
   const d=R.describeConfiguration(out,selected.map(c=>c.candidateId));
   const record={score:e.score,key:d.performanceKey,ids:d.equipment.map(g=>[g.slot,[...g.equivalentCandidateIds]])};
   if(answers.has(d.performanceKey))assert.equal(answers.get(d.performanceKey).score,e.score,'every alias same formal score');
   answers.set(d.performanceKey,record);return;}
  brute(depth+1,selected);for(const c of s.candidates.filter(c=>c.slot===cx.slots[depth]))brute(depth+1,[...selected,c]);
 }
 brute(0,[]);
 const expected=[...answers.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,20);
 for(const options of [{enablePruning:false},{},{acPreparedBound:false},{slotOrder:'descending'},{preparedEvaluation:false}]){
  const actual=B.run(out,options);assert.equal(actual.diagnostics.exact,true);
  assert.deepEqual(json(actual.results.map(e=>({score:e.score,key:e.performanceKey,ids:e.equipment.map(g=>[g.slot,[...g.equivalentCandidateIds]])}))),json(expected));
  for(const e of actual.results){const normal=C.evaluate(cx,e.candidateIds.map(id=>R.resolveCandidate(out,id)),s.sources);
   assert.deepEqual(json(normal.metrics),json(e.metrics));assert.equal(normal.score,e.score);}
 }
 function safety(depth,selected){let maximum=-Infinity;
  if(depth===cx.slots.length){const e=C.evaluate(cx,selected,s.sources);if(e.feasible)maximum=e.score;}
  else {maximum=safety(depth+1,selected);for(const c of out.candidates.filter(c=>c.slot===cx.slots[depth]))maximum=Math.max(maximum,safety(depth+1,[...selected,c]));}
  const bound=B.inspectACGroups(out,selected.map(c=>c.candidateId),cx.slots.slice(depth),{prepared:true});
  assert.ok(bound.upper>=maximum);partials++;return maximum;
 }
 safety(0,[]);
 for(const candidate of s.candidates)assert.equal(R.resolveCandidate(out,candidate.candidateId).candidateId,candidate.candidateId);
 assert.equal(old.diagnostics.metricReduction.dominatedClassCount,out.diagnostics.metricReduction.dominatedClassCount);
}
check([item('a',10,50),item('b',8,30),item('other',10,100),item('body',4,30,'防具: 胴'),item('alias',4,1,'防具: 胴')],40);
check([item('high',100,200),item('met',20,30),item('edge',30,100),item('pct',10,100,'防具: 胴'),item('flat',0,0,'防具: 胴',4)],80,{
 pct:{equipBuffEnabled:true,equipBuffName:'percent',equipBuffExtraACPct:5,equipBuffConflictGroups:'ac-g'},
 flat:{equipBuffEnabled:true,equipBuffName:'flat',equipBuffExtraAC:8,equipBuffConflictGroups:'ac-g'}});
check([{...item('male-r',8,30),equipGender:'MALE'},{...item('all-r',8,30),equipGender:'ALL'},item('hard-r',8,30)],40,
 { 'hard-r':{tags:'hard-r-conflict'}});
check([item('one-r',0,0,'武器: 右手',3),item('two-r',0,0,'武器: 右手',3),item('left-r',0,0,'武器: 左手',5)],40,{
 'one-r':{weaponDamage:10,weaponAttackInterval:100,weaponReq:[{name:'刀剣',required:10}],weaponTwoHanded:false},
 'two-r':{weaponDamage:10,weaponAttackInterval:100,weaponReq:[{name:'刀剣',required:10}],weaponTwoHanded:true}});
console.log('AC fixed-context equivalence: exact components, boundaries, alias recovery, reprojection, Top20/bounds/formal parity; partials='+partials);
