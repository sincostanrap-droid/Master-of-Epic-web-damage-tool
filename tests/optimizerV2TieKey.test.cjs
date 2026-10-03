const assert=require('node:assert/strict'),vm=require('node:vm');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound;
const json=v=>JSON.parse(JSON.stringify(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const H='防具: 頭',D='防具: 胴',G='防具: 手';
let partials=0,safeChecks=0;
function check(name,defs){
 const snapshot=json(p.MOEOptimizerV2Candidates.generate({items:defs.map(d=>({catalogId:d.id,name:d.id,slot:d.slot,category:'defense'}))}));
 snapshot.candidates.forEach((c,i)=>{const d=defs[i];Object.assign(c.evaluationFields,{equipBuffEnabled:true,
  equipBuffName:d.buffName||d.id,equipBuffTechnicId:d.tech||d.id,equipBuffConflictGroups:d.group||'X',
  extraEffects:[{key:'skillPlus',name:'回復魔法',value:d.value??5}],...d.row});});
 freeze(snapshot);
 const skillSim=vm.runInContext('defaultSkillSimState()',p);
 const context=C.create({objective:{metric:'skillPlus',skillName:'回復魔法'},topK:20,skillSim,
  slots:[...new Set(defs.map(d=>d.slot))]});
 const reduction=R.reduce(snapshot,context),all=new Map(),states=[];
 function visit(depth,chosen){
  const completions=[];
  if(depth===context.slots.length){
   const evaluated=C.evaluate(context,chosen,snapshot.sources);
   if(evaluated.feasible){const described=R.describeConfiguration(reduction,chosen.map(c=>c.candidateId));
    const result={score:evaluated.score,key:described.performanceKey};completions.push(result);all.set(result.key,result);}
  }else for(const c of [null,...reduction.candidates.filter(c=>c.slot===context.slots[depth])])
   completions.push(...visit(depth+1,c?[...chosen,c]:chosen));
  states.push({ids:chosen.map(c=>c.candidateId),remaining:context.slots.slice(depth),completions});
  return completions;
 }
 visit(0,[]);
 const expected=[...all.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,20);
 for(const state of states){
  const bound=B.inspectTieKey(reduction,state.ids,state.remaining);
  const upper=B.inspectSkillPlusPotential(reduction,state.ids,state.remaining).groupAware.upper;
  assert.ok(bound);partials++;
  for(const completion of state.completions){assert.ok(bound.key<=completion.key,`${name}: lower key bound`);
   assert.ok(upper>=completion.score,`${name}: admissible objective bound`);}
  for(const kth of expected){const test=B.inspectTieKey(reduction,state.ids,state.remaining,kth.key);
   if(upper===kth.score && test.key>=kth.key){safeChecks++;
    assert.ok(state.completions.every(r=>r.score<kth.score || (r.score===kth.score && r.key>=kth.key)),
     `${name}: safe equality cut at ${kth.key}`);}
  }
 }
 const first=B.run(reduction,{slotOrder:'blockers',skillPlusTiePruning:false});
 assert.deepEqual(json(first.results.map(r=>({score:r.score,key:r.performanceKey}))),expected);
 const dry=B.run(reduction,{slotOrder:'blockers',skillPlusTieAudit:true});
 assert.deepEqual(json(dry.results),json(first.results));assert.equal(dry.diagnostics.searchNodes,first.diagnostics.searchNodes);
 assert.equal(dry.diagnostics.completeConfigurationsEvaluated,first.diagnostics.completeConfigurationsEvaluated);
 assert.equal(dry.diagnostics.boundPrunedNodes,first.diagnostics.boundPrunedNodes);
 const identity=results=>json(results.map(r=>({score:r.score,key:r.performanceKey,ids:r.candidateIds.slice().sort(),
  equivalent:r.equipment.map(e=>[e.slot,e.equivalentCandidateIds])})));
 for(const options of [{slotOrder:'blockers'},{slotOrder:'ascending'},{slotOrder:'descending'},
  {enablePruning:false},{skillPlusGroupAwareBound:false},{skillPlusPreparedGroupBound:false}]){
  const actual=B.run(reduction,options);
  assert.deepEqual(json(actual.results.map(r=>({score:r.score,key:r.performanceKey}))),expected);
  assert.deepEqual(identity(actual.results),identity(first.results),'rank and original/equivalent IDs');
  assert.equal(actual.diagnostics.exact,true);
  for(const r of actual.results){const normal=C.evaluate(context,r.candidateIds.map(id=>R.resolveCandidate(reduction,id)),snapshot.sources);
   assert.deepEqual(json(normal.metrics),json(r.metrics));assert.equal(normal.score,r.score);}
 }
 console.log(name,states.length,'partial states',all.size,'distinct keys');
 return {reduction,expected};
}
const ties=check('Top20 all equal; first/middle/final slot, null, requirements and hard conflicts',[
 ...Array.from({length:5},(_,i)=>({id:'h'+i,slot:H,row:{weaponReq:[{name:'銃器',required:i*20}],tags:i===4?'hard':''}})),
 ...Array.from({length:5},(_,i)=>({id:'d'+i,slot:D,row:{weaponReq:[{name:'回復魔法',required:i*20}],tags:i===4?'hard':''}})),
 ...Array.from({length:3},(_,i)=>({id:'g'+i,slot:G,tech:i===1?'h0':undefined,group:i===2?'X,Y':'X'}))]);
assert.equal(ties.expected.length,20);assert.equal(new Set(ties.expected.map(r=>r.score)).size,1);
const equivalents=check('equivalent original IDs and same key, escaping and numeric string order',[
 {id:'alias-a',slot:H,tech:'same',buffName:'same'}, {id:'alias-b',slot:H,tech:'same',buffName:'same'},
 {id:'quoted"\\name',slot:D,value:10},{id:'numeric2',slot:D,value:2},
 {id:'bridge',slot:G,value:0,group:'X,Y',row:{equipBuffFlatAttack:20}}]);
assert.ok(equivalents.reduction.contextEquivalentClasses.some(cls=>cls.equivalentCandidateIds.length===2));
check('two handed occupancy and later Buff winner',[
 {id:'twohand',slot:'武器: 右手',value:10,tech:'T',row:{weaponDamage:20,weaponAttackInterval:100,weaponTwoHanded:'○'}},
 {id:'left',slot:'武器: 左手',value:5,tech:'T'}, {id:'last',slot:H,value:0,group:'X,Y',row:{equipBuffFlatAttack:100}}]);
assert.ok(safeChecks>0);console.log(JSON.stringify({partials,safeChecks}));
