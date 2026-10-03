const assert=require('node:assert/strict'),vm=require('node:vm');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound;
const json=v=>JSON.parse(JSON.stringify(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const skillSim=vm.runInContext('defaultSkillSimState()',p);
const flat=(id,slot)=>({catalogId:id,name:id,category:'defense',slot,extraStats:{extraAC:0}});
function fixture(label,definitions,baseState){
 const snapshot=json(p.MOEOptimizerV2Candidates.generate({items:definitions.map(d=>flat(d.id,d.slot))}));
 snapshot.candidates.forEach((c,i)=>{const d=definitions[i],r=c.evaluationFields;
  Object.assign(r,{equipBuffEnabled:true,equipBuffName:d.id,equipBuffTechnicId:d.tech||d.id,
   equipBuffConflictGroups:d.group||'',equipBuffStackRule:d.rule||'score',equipBuffFlatAttack:d.attack||0,
   extraEffects:[{key:'skillPlus',name:'回復魔法',value:d.value,scope:'display'}]},d.row||{});
 });
 freeze(snapshot);
 const context=C.create({objective:{metric:'skillPlus',skillName:'回復魔法'},slots:[...new Set(definitions.map(d=>d.slot))],topK:20,skillSim,baseState});
 const reduction=R.reduce(snapshot,context),bounds=B.inspectSkillPlusPotential(reduction);
 assert.ok(bounds);
 const answers=new Map();let checked=0;
 // Independent unreduced Cartesian traversal. Every partial subtree gets its
 // exact feasible maximum from formal leaf evaluations, not a private formula.
 function visit(depth,selected){
  let best=-Infinity;
  if(depth===context.slots.length){
   const e=C.evaluate(context,selected,snapshot.sources);
   if(e.feasible){best=e.score;const key=R.describeConfiguration(reduction,selected.map(c=>c.candidateId)).performanceKey;
    answers.set(key,{score:e.score,performanceKey:key});}
  }else{
   best=visit(depth+1,selected);
   for(const c of snapshot.candidates.filter(c=>c.slot===context.slots[depth]))best=Math.max(best,visit(depth+1,[...selected,c]));
  }
  // Inert removed candidates have no potential and canonicalize to null.
  const selectedIds=selected.map(c=>c.candidateId).filter(id=>Object.hasOwn(bounds.candidates,id));
  const upper=bounds.base+selectedIds.reduce((s,id)=>s+bounds.candidates[id],0)
   +context.slots.slice(depth).reduce((s,slot)=>s+bounds.slots[slot],0);
  assert.equal(B.inspectSkillPlusPotential(reduction,selectedIds,context.slots.slice(depth)).upperBound,upper);
  assert.ok(upper+1e-8>=best,`${label} partial depth ${depth}: ${upper} >= ${best}`);checked++;
  return best;
 }
 visit(0,[]);
 const expected=[...answers.values()].sort((a,b)=>b.score-a.score||(a.performanceKey<b.performanceKey?-1:1)).slice(0,20);
 for(const opts of [{enablePruning:false},{skillPlusOptimisticBound:false},{slotOrder:'blockers'},
  {slotOrder:'blockers',candidateOrder:'potential'},{slotOrder:'descending',candidateOrder:'potential'},{slotOrder:'ascending'}]){
  const actual=B.run(reduction,opts);
  assert.deepEqual(json(actual.results.map(r=>({score:r.score,performanceKey:r.performanceKey}))),expected,label+JSON.stringify(opts));
  assert.equal(actual.diagnostics.exact,true);
  for(const r of actual.results){const e=C.evaluate(context,r.candidateIds.map(id=>R.resolveCandidate(reduction,id)),snapshot.sources);
   assert.equal(e.score,r.score);assert.deepEqual(json(e.metrics),json(r.metrics));}
 }
 console.log(label,`partial safety ${checked}`);
 return {snapshot,context,reduction,bounds};
}
const head='防具: 頭',body='防具: 胴',hand='防具: 手';
fixture('flat multi-slot Top20 ties and null',[
 ...Array.from({length:5},(_,i)=>({id:'head'+i,slot:head,value:5+i})),
 ...Array.from({length:5},(_,i)=>({id:'body'+i,slot:body,value:10+i}))]);
fixture('same technic later zero suppresses positive',[
 {id:'first',slot:head,value:20,tech:'same'},{id:'later',slot:body,value:0,tech:'same'},
 {id:'negative',slot:hand,value:-5}]);
fixture('positive and negative effects in one source cannot cancel potential',[
 {id:'mixed-sign',slot:head,value:0,row:{extraEffects:[
  {key:'skillPlus',name:'回復魔法',value:20},{key:'skillPlus',name:'回復魔法',value:-10}]}},
 {id:'percent unrelated to skillPlus',slot:body,value:5,row:{equipBuffAttackPct:200}}]);
fixture('multi-group zero releases suppressed positive',[
 {id:'positive',slot:head,value:5,group:'x'},
 {id:'middle',slot:body,value:0,group:'x,y',attack:10},
 {id:'zero-winner',slot:hand,value:0,group:'y',attack:20}]);
const external=vm.runInContext('DEFAULT_STATE()',p);
external.composite=[{enabled:true,name:'external positive suppressed initially',tags:'fixed',extraEffects:[{key:'skillPlus',name:'回復魔法',value:30}]},
 {enabled:true,name:'external high score',tags:'fixed,y',flatAttack:100}];
fixture('fixed positive potential restores after later equipment',[
 {id:'restore',slot:head,value:0,group:'y',attack:200},
 {id:'other',slot:body,value:7}],external);
const occupied=fixture('latest group requirements hard conflict and occupancy',[
 {id:'twohand',slot:'武器: 右手',value:12,group:'z',rule:'latest',row:{weaponTwoHanded:'○',weaponDamage:20,
  weaponAttackInterval:200,weaponReq:[{name:'銃器',required:100}],tags:'exclusive'}},
 {id:'left',slot:'武器: 左手',value:15,group:'z',rule:'latest'},
 {id:'hard',slot:head,value:10,row:{tags:'exclusive'}}]);
assert.ok(C.evaluate(occupied.context,occupied.snapshot.candidates.slice(0,2),occupied.snapshot.sources)
 .violations.includes('two-handed-conflict'));
assert.ok(C.evaluate(occupied.context,[occupied.snapshot.candidates[0],occupied.snapshot.candidates[2]],occupied.snapshot.sources)
 .violations.includes('equipment-conflict'));
const full=p.MOEOptimizerV2Candidates.generate(),context=require('../tools/inspect-optimizer-v2-objectives.cjs').objectiveContexts(p,20).skillPlus;
const fullReduction=R.reduce(full,context),potential=B.inspectSkillPlusPotential(fullReduction);
assert.equal(fullReduction.contextEquivalentClasses.length,114);
assert.equal(Object.keys(potential.candidates).length,114);
assert.equal(fullReduction.metricReducer.classification.filter(c=>c.interaction&&c.buffFlat===0).length,32);
assert.ok(Object.values(potential.candidates).every(Number.isFinite));
console.log('all 114 finite; 32 closure candidates preserved');
const fractional=json(p.MOEOptimizerV2Candidates.generate({items:[flat('fractional',head)]}));
Object.assign(fractional.candidates[0].evaluationFields,{equipBuffEnabled:true,equipBuffName:'fractional',
 extraEffects:[{key:'skillPlus',name:'回復魔法',value:0.1}]});freeze(fractional);
const fractionalContext=C.create({objective:{metric:'skillPlus',skillName:'回復魔法'},slots:[head],topK:20});
const fractionalReduction=R.reduce(fractional,fractionalContext);
assert.equal(B.inspectSkillPlusPotential(fractionalReduction),null,'fractional input safe fallback');
assert.deepEqual(json(B.run(fractionalReduction).results.map(r=>[r.score,r.performanceKey])),
 json(B.run(fractionalReduction,{enablePruning:false}).results.map(r=>[r.score,r.performanceKey])));
