const assert=require('node:assert/strict');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
const V=p.MOEOptimizerV2Candidates,C=p.MOEOptimizerV2SearchContext,R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound;
const json=x=>JSON.parse(JSON.stringify(x));
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const head='防具: 頭',body='防具: 胴';
const item=(id,ac,slot=head,req=0)=>({catalogId:id,name:id,category:'defense',slot,armorClass:ac,
 requiredSkill:'着こなし',needLevel:req,requirements:req?[{name:'着こなし',required:req}]:[]});
const ladder=n=>Array.from({length:n},(_,i)=>item('ladder'+String(i).padStart(2,'0'),i+1,head,i+1));
function make(items,edits={}){const s=json(V.generate({items}));for(const c of s.candidates)Object.assign(c.evaluationFields,edits[c.catalogId]||{});return freeze(s);}
function context(items,baseState){return C.create({objective:'ac',race:'newtar',skillSim:{skills:{'着こなし':100}},
 slots:[...new Set(items.map(x=>x.slot))],topK:20,baseState});}
let completions=0,replacements=0,partials=0;
function verify(items,edits={},baseState){
 const s=make(items,edits),ctx=context(items,baseState),off=R.reduce(s,ctx,{acReplacementDominance:false}),on=R.reduce(s,ctx);
 const proofs=on.diagnostics.metricReduction.acReplacementDominance,active=new Set(on.contextEquivalentClasses.map(c=>c.equivalenceKey));
 for(const proof of proofs.removed){assert.equal(new Set(proof.witnessClassKeys).size,20);assert.ok(proof.witnessClassKeys.every(k=>active.has(k)));
  for(const id of proof.candidateIds){assert.equal(R.resolveCandidate(on,id).candidateId,id);
   assert.ok(!on.contextEquivalentClasses.some(c=>c.equivalentCandidateIds.includes(id)),'dominance is not equivalence');}}
 const all=[],answers=new Map();
 function visit(d,chosen){
  if(d===ctx.slots.length){const e=C.evaluate(ctx,chosen,s.sources);if(!e.feasible)return;completions++;
   const desc=R.describeConfiguration(off,chosen.map(c=>c.candidateId)),record={score:e.score,key:desc.performanceKey,ids:desc.equipment.map(c=>[c.slot,[...c.equivalentCandidateIds]])};
   answers.set(record.key,record);all.push({chosen,score:e.score});return;}
  visit(d+1,chosen);for(const c of s.candidates.filter(c=>c.slot===ctx.slots[d]))visit(d+1,[...chosen,c]);
 }
 visit(0,[]);
 // Oracle uses ONLY official legality and formal scores, never the dominance comparison.
 for(const proof of proofs.removed)for(const build of all){const target=build.chosen.find(c=>proof.candidateIds.includes(c.candidateId));if(!target)continue;
  const keys=new Set();for(const id of proof.witnessCandidateIds){const chosen=build.chosen.map(c=>c===target?R.resolveCandidate(on,id):c),e=C.evaluate(ctx,chosen,s.sources);
   assert.equal(e.feasible,true,'legal replacement');assert.ok(e.score>build.score,'strict formal improvement');
   keys.add(R.describeConfiguration(on,chosen.map(c=>c.candidateId)).performanceKey);replacements++;}
  assert.equal(keys.size,20);}
 const expected=[...answers.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,20);
 for(const reduction of [off,on,R.reduce(s,ctx,{dominance:false})])for(const options of [{},{enablePruning:false},{slotOrder:'descending'},{acPreparedBound:false},{preparedEvaluation:false}]){
  const result=B.run(reduction,options);assert.equal(result.diagnostics.exact,true);
  assert.deepEqual(json(result.results.map(e=>({score:e.score,key:e.performanceKey,ids:e.equipment.map(c=>[c.slot,[...c.equivalentCandidateIds]])}))),json(expected));
  for(const entry of result.results){const e=C.evaluate(ctx,entry.candidateIds.map(id=>R.resolveCandidate(on,id)),s.sources);assert.equal(e.score,entry.score);assert.deepEqual(json(e.metrics),json(entry.metrics));}}
 function safety(d,chosen){let maximum=-Infinity;
  if(d===ctx.slots.length){const e=C.evaluate(ctx,chosen,s.sources);if(e.feasible)maximum=e.score;}
  else {maximum=safety(d+1,chosen);for(const c of on.candidates.filter(c=>c.slot===ctx.slots[d]))maximum=Math.max(maximum,safety(d+1,[...chosen,c]));}
  const upper=B.inspectACGroups(on,chosen.map(c=>c.candidateId),ctx.slots.slice(d),{prepared:true});assert.ok(upper.upper>=maximum);partials++;return maximum;}
 safety(0,[]);
 const shuffled={...s,candidates:s.candidates.slice().reverse()};
 assert.deepEqual(json(R.reduce(shuffled,ctx).diagnostics.metricReduction.acReplacementDominance.removed),json(proofs.removed),'retained witnesses independent of input order');
 return {on,off,proofs};
}
for(const [n,removed] of [[20,0],[21,1],[22,2]]){
 const result=verify(ladder(n));assert.equal(result.proofs.removed.length,removed,n-1+' witness boundary');
}
// Equal classes/IDs do not count as distinct witnesses; no tie dominance.
const equal=Array.from({length:30},(_,i)=>item('alias'+i,3,head,i+1));
assert.equal(verify(equal).proofs.removed.length,0);
const tie=verify(ladder(21).concat(item('topAlias',21,head,25)));
assert.equal(tie.proofs.removed.length,1);assert.ok(tie.on.contextEquivalentClasses.some(c=>c.equivalentCandidateIds.length===2));
const extra=[item('flat',0,body),item('pct',0,body),item('negative',0,body)];
verify(ladder(22).concat(extra),{flat:{extraAC:10,equipBuffEnabled:true,equipBuffName:'flat',equipBuffExtraAC:8,equipBuffConflictGroups:'g'},
 pct:{equipBuffEnabled:true,equipBuffName:'pct',equipBuffExtraACPct:5,equipBuffConflictGroups:'g'},negative:{extraAC:-4}});
// Requirement projection can reverse raw ranking; Buff/group/stack/percentage differences are retained.
const guarded=ladder(22).concat(item('unmet',100,head,200),item('group',1),item('stack',1),item('percent',1),item('hard',1),item('restricted',1));
const g=verify(guarded,{group:{equipBuffEnabled:true,equipBuffName:'group',equipBuffExtraAC:3,equipBuffConflictGroups:'g'},
 stack:{equipBuffEnabled:true,equipBuffName:'stack',equipBuffExtraAC:3,equipBuffTechnicId:'stack'},percent:{equipBuffEnabled:true,equipBuffName:'percent',equipBuffExtraACPct:1},hard:{tags:'hard'},restricted:{equipGender:'MALE'}});
for(const name of ['group','stack','percent','hard','restricted'])assert.ok(!g.proofs.removed.some(x=>x.name===name));
// Negative percentage/sign reversal: no strict monotonicity certificate => no new removals.
const reversed=verify(ladder(21).concat(item('reverse',0,body)),{reverse:{equipBuffEnabled:true,equipBuffName:'reverse',equipBuffExtraACPct:-200}});
assert.equal(reversed.proofs.proofAvailable,false);assert.equal(reversed.proofs.removed.length,0);
// Percentage-only and flat+percentage candidate families remain conservative.
const percentages=ladder(21);const pctEdits=Object.fromEntries(percentages.map((x,i)=>[x.catalogId,{equipBuffEnabled:true,equipBuffName:x.catalogId,equipBuffExtraACPct:i+1}]));
assert.equal(verify(percentages,pctEdits).proofs.removed.length,0);
// Hand occupancy differs => replacement forbidden, while null remains a legal branch.
const hands=ladder(21).map(x=>({...x,slot:'武器: 右手'}));
const handEdits=Object.fromEntries(hands.map((x,i)=>[x.catalogId,{extraAC:i+1,weaponDamage:10,weaponAttackInterval:100,weaponTwoHanded:i%2===0}]));
assert.equal(verify(hands,handEdits).proofs.removed.length,0);
verify(ladder(21).map((x,i)=>({...x,needLevel:105+i,requirements:[{name:'着こなし',required:105+i}]})));
verify(ladder(21).map((x,i)=>({...x,armorClass:-22+i})));
const flatItems=ladder(21).map((x,i)=>({...x,armorClass:0,extraStats:{extraAC:i+1}}));
verify(flatItems);
const hardItems=ladder(21).concat(item('conflicting-body',1,body));
verify(hardItems,Object.fromEntries(hardItems.map(x=>[x.catalogId,{tags:'same-hard-conflict'}])));
const tieItems=Array.from({length:22},(_,i)=>item('key-tie'+i,10));
assert.equal(verify(tieItems,Object.fromEntries(tieItems.map((x,i)=>[x.catalogId,{tags:'tie-structure-'+i}]))).proofs.removed.length,0);
const purePercent=ladder(21).map(x=>({...x,armorClass:0}));
assert.equal(verify(purePercent,pctEdits).proofs.removed.length,0);
const fixed=require('node:vm').runInContext('DEFAULT_STATE()',p);
fixed.composite=[{enabled:true,name:'fixed-AC',extraAC:5,extraACPct:-10}];
verify(ladder(21),{},fixed);
const cancellation=make(ladder(21).concat(item('cancelling',1e16)),{cancelling:{extraAC:0}});
assert.equal(R.reduce(cancellation,context(ladder(21))).diagnostics.metricReduction.acReplacementDominance.removed.length,0,'operand magnitude prevents false rounded strictness');
console.log(JSON.stringify({completions,replacements,partials,independentTop20Parity:true,retainedWitnesses:true}));
