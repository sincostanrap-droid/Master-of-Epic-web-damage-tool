const assert=require('node:assert/strict'),vm=require('node:vm');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,E=p.MOEOptimizerV2EffectiveCandidates,B=p.MOEOptimizerV2BranchAndBound;
const json=v=>JSON.parse(JSON.stringify(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
let total=0;
function fixture(label,defs,baseState){
 const snapshot=json(p.MOEOptimizerV2Candidates.generate({items:defs.map(d=>({catalogId:d.id,name:d.id,category:'defense',slot:d.slot,extraStats:{extraAC:d.ac||0}}))}));
 snapshot.candidates.forEach((c,i)=>Object.assign(c.evaluationFields,{extraAC:defs[i].ac||0},defs[i].row||{},defs[i].pct===undefined?{}:
  {equipBuffEnabled:true,equipBuffName:defs[i].id,equipBuffExtraACPct:defs[i].pct,equipBuffExtraAC:defs[i].buffAC||0}));
 freeze(snapshot);
 const context=C.create({objective:'ac',slots:[...new Set(defs.map(d=>d.slot))],topK:20,baseState});
 const reduction=E.reduce(snapshot,context),answers=new Map();let checked=0,known=0;
 function visit(depth,selected){
  let maximum=-Infinity;
  if(depth===context.slots.length){const e=C.evaluate(context,selected,snapshot.sources);
   if(e.feasible){maximum=e.score;const desc=E.describeConfiguration(reduction,selected.map(c=>c.candidateId));
    answers.set(desc.performanceKey,{score:e.score,key:desc.performanceKey,
     ids:desc.equipment.map(g=>[g.slot,[...g.equivalentCandidateIds]])});}}
  else{maximum=visit(depth+1,selected);for(const c of reduction.candidates.filter(c=>c.slot===context.slots[depth]))
   maximum=Math.max(maximum,visit(depth+1,[...selected,c]));}
  const proof=B.inspectACGroups(reduction,selected.map(c=>c.candidateId),context.slots.slice(depth));
  const fast=B.inspectACGroups(reduction,selected.map(c=>c.candidateId),context.slots.slice(depth),{prepared:true});
  assert.deepEqual(json(fast),json(proof),label+' exact suffix parity');
  assert.ok(Object.is(fast?.upper,proof?.upper),label+' identical numeric bound');
  if(proof?.upper!==null && proof?.upper!==undefined){known++;assert.ok(proof.upper>=maximum,`${label} depth ${depth}: ${proof.upper} >= ${maximum}`);}
  checked++;return maximum;
 }
 visit(0,[]);
 const expected=[...answers.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,20);
 for(const opts of [{enablePruning:false},{acPercentageBound:false,acGroupBound:false},{acGroupBound:false},{acGroupDryRun:true},{acPreparedBound:false},{},{slotOrder:'descending'},{slotOrder:'ascending'}]){
  const result=B.run(reduction,opts);assert.equal(result.diagnostics.exact,true);
  assert.deepEqual(json(result.results.map(r=>({score:r.score,key:r.performanceKey,
   ids:r.equipment.map(g=>[g.slot,[...g.equivalentCandidateIds]])}))),json(expected),label+JSON.stringify(opts));
  for(const r of result.results){const normal=C.evaluate(context,r.candidateIds.map(id=>reduction.candidates.find(c=>c.candidateId===id)),snapshot.sources);
   assert.equal(normal.score||0,r.score||0);assert.deepEqual(json(normal.metrics),json(r.metrics));}
 }
 total+=checked;console.log(label,{checked,known});return {snapshot,context,reduction};
}

const h='防具: 頭',b='防具: 胴',a='防具: 手';
fixture('bare/null',[]);
fixture('direct flat and Top20 ties',Array.from({length:6},(_,i)=>({id:'h'+i,slot:h,ac:i})).concat(Array.from({length:6},(_,i)=>({id:'b'+i,slot:b,ac:i}))));
fixture('group flat versus percentage keep direct body',[
 {id:'flat',slot:h,ac:20,pct:0,buffAC:20,row:{equipBuffConflictGroups:'x'}},
 {id:'percent',slot:b,ac:10,pct:10,row:{equipBuffConflictGroups:'x'}},
 {id:'other',slot:a,ac:3,pct:5}]);
fixture('group percentage Top20 boundary',Array.from({length:6},(_,i)=>({id:'ph'+i,slot:h,ac:i+10,pct:5+i,row:{equipBuffConflictGroups:'x'}}))
 .concat(Array.from({length:6},(_,i)=>({id:'pb'+i,slot:b,ac:i+20,pct:3+i,row:{equipBuffConflictGroups:'x'}}))));
fixture('same technic later winner zero',[
 {id:'first',slot:h,ac:12,pct:10,buffAC:5,row:{equipBuffTechnicId:'same'}},
 {id:'latest',slot:b,ac:2,pct:0,row:{equipBuffTechnicId:'same',equipBuffFlatAttack:1}}]);
fixture('manual/latest/multiple membership winner switches',[
 {id:'positive',slot:h,ac:10,pct:5,buffAC:20,row:{equipBuffConflictGroups:'x'}},
 {id:'middle',slot:b,pct:3,row:{equipBuffConflictGroups:'x,y',equipBuffStackRule:'latest',equipBuffFlatAttack:10}},
 {id:'late',slot:a,pct:0,row:{equipBuffConflictGroups:'y',equipBuffFlatAttack:30}}]);
fixture('negative signs -200% group rectangle',[
 {id:'negative',slot:h,ac:-100,pct:5,buffAC:-20,row:{equipBuffConflictGroups:'sign'}},
 {id:'reverse',slot:b,pct:-200,row:{equipBuffConflictGroups:'sign'}},
 {id:'independent',slot:a,ac:-10,pct:-120}]);
for(const current of [0,79,80,90,100]){
 const state=vm.runInContext('DEFAULT_STATE()',p);state.skillSim=vm.runInContext('defaultSkillSimState()',p);state.skillSim.skills['着こなし']=current;
 fixture('requirements formal raw AC '+current,[{id:'armor',slot:h,ac:20,pct:5,row:{weaponReq:[{name:'着こなし',required:100}]}},
 {id:'armor2',slot:b,ac:15,row:{weaponReq:[{name:'着こなし',required:40}]}}],state);
}
fixture('hard conflict occupancy null',[
 {id:'twohand',slot:'武器: 右手',ac:20,pct:5,row:{weaponTwoHanded:'○',tags:'exclusive'}},
 {id:'left',slot:'武器: 左手',ac:30,pct:10,row:{tags:'exclusive'}},{id:'other',slot:h,ac:15}]);
const state=vm.runInContext('DEFAULT_STATE()',p);
state.composite=[{enabled:true,name:'external flat',tags:'x',extraAC:25},{enabled:true,name:'external pct',tags:'x,y',extraACPct:10}];
fixture('fixed external percent group and later restoration',[
 {id:'gear',slot:h,ac:10,pct:5,row:{equipBuffConflictGroups:'x'}},
 {id:'later',slot:b,pct:0,row:{equipBuffConflictGroups:'y',equipBuffFlatAttack:200}}],state);
const alias=fixture('equivalent aliases', [{id:'same1',slot:h,ac:10},{id:'same2',slot:h,ac:10}]);
assert.ok(alias.reduction.contextEquivalentClasses.some(c=>c.equivalentCandidateIds.length===2));
const s=p.MOEOptimizerV2Candidates.generate(),ctx=require('../tools/inspect-optimizer-v2-objectives.cjs').objectiveContexts(p,20).ac;
const r=p.MOEOptimizerV2MetricCandidateReducer.reduce(s,ctx),g=B.inspectACGroups(r),old=Object.values(B.inspectBounds(r).metrics)[0];
assert.equal(r.diagnostics.metricReduction.acFixedContextEquivalence.before,2199);
assert.equal(r.diagnostics.metricReduction.acFixedContextEquivalence.after,1350,'fixed-context exact body/addition equivalence');
assert.equal(r.contextEquivalentClasses.length,497,'strict retained-witness AC replacement');
const ids=Object.keys(old.candidates).filter(id=>old.candidates[id].reason==='buff-group-interaction');
assert.equal(ids.length,34);assert.ok(ids.every(id=>g.candidates[id].reason===null));
assert.equal(ids.filter(id=>g.candidates[id].sources.some(s=>s.potential.pctMax!==0||s.potential.pctMin!==0)).length,28);
assert.equal(Object.values(g.candidates).filter(x=>x.reason).length,0);
assert.ok(g.sources.some(s=>s.groups.length>1));
assert.ok(g.sources.some(s=>s.autoStackGroup));
console.log({partialStates:total,knownBlockers:34,percentageOverlap:28,rootUpper:g.upper});

const nakedSkill=vm.runInContext('defaultSkillSimState()',p);nakedSkill.skills['着こなし']=100;
const naked=C.create({objective:'ac',skillSim:nakedSkill,race:'newtar',slots:[h],topK:20});
assert.equal(C.evaluate(naked,[],s.sources).score,20,'optimizer observes formal total defense');
assert.equal(C.withRuntime(naked,()=>p.skillSimDerived().def),20,'UI naked defense remains separate');
console.log('formal-model parity: UI naked20, optimizer naked20');
