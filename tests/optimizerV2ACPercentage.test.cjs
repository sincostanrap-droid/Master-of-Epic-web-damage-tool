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
    answers.set(desc.performanceKey,{score:e.score,key:desc.performanceKey});}}
  else{maximum=visit(depth+1,selected);for(const c of reduction.candidates.filter(c=>c.slot===context.slots[depth]))
   maximum=Math.max(maximum,visit(depth+1,[...selected,c]));}
  const proof=B.inspectACPercentage(reduction,selected.map(c=>c.candidateId),context.slots.slice(depth));
  if(proof?.upper!==null && proof?.upper!==undefined){known++;assert.ok(proof.upper>=maximum,`${label} depth ${depth}: ${proof.upper} >= ${maximum}`);}
  checked++;return maximum;
 }
 visit(0,[]);
 const expected=[...answers.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,20);
 for(const opts of [{enablePruning:false},{acPercentageBound:false},{},{slotOrder:'descending'},{slotOrder:'ascending'}]){
  const result=B.run(reduction,opts);assert.equal(result.diagnostics.exact,true);
  assert.deepEqual(json(result.results.map(r=>({score:r.score,key:r.performanceKey}))),json(expected),label+JSON.stringify(opts));
  if(label==='percentage Top20 threshold pruning' && opts.acPercentageBound!==false && opts.enablePruning!==false)assert.ok(result.diagnostics.acUpperBound.percentageUses>0);
  for(const r of result.results){const normal=C.evaluate(context,r.candidateIds.map(id=>reduction.candidates.find(c=>c.candidateId===id)),snapshot.sources);
   assert.equal(normal.score||0,r.score||0);assert.deepEqual(json(normal.metrics),json(r.metrics));}
 }
 total+=checked;console.log(label,{checked,known});return {snapshot,context,reduction};
}
const h='防具: 頭',b='防具: 胴',l='武器: 左手',r='武器: 右手';
fixture('flat Top20 ties/null',Array.from({length:6},(_,i)=>({id:'h'+i,slot:h,ac:i})).concat(Array.from({length:6},(_,i)=>({id:'b'+i,slot:b,ac:i}))));
fixture('percentage Top20 threshold pruning',Array.from({length:6},(_,i)=>({id:'pa'+i,slot:h,ac:i+1})).concat(Array.from({length:5},(_,i)=>({id:'pb'+i,slot:b,pct:5+i,ac:i}))));
const earth=fixture('Earth Bell 0.5 -> 0.525 and multi-slot percentages',[
 {id:'cap',slot:h,ac:0.5},{id:'earth',slot:b,pct:5},{id:'other',slot:l,pct:10},{id:'flat',slot:b,ac:5}]);
assert.equal(C.evaluate(earth.context,earth.snapshot.candidates.slice(0,2),earth.snapshot.sources).score,0.525);
fixture('mixed signs including negative multiplier',[
 {id:'negative-flat',slot:h,ac:-100},{id:'positive-flat',slot:h,ac:3},{id:'negative-pct',slot:b,pct:-200},{id:'positive-pct',slot:b,pct:20}]);
fixture('requirements occupancy hard conflicts',[
 {id:'weapon',slot:r,ac:12,pct:5,row:{weaponTwoHanded:'○',weaponReq:[{name:'着こなし',required:100}],tags:'exclusive'}},
 {id:'left',slot:l,ac:15,pct:10},{id:'hard',slot:h,ac:3,row:{tags:'exclusive'}}]);
fixture('same technic/latest/group remain fallback',[
 {id:'first',slot:h,ac:2,pct:5,row:{equipBuffTechnicId:'same',equipBuffConflictGroups:'x',equipBuffStackRule:'latest'}},
 {id:'later',slot:b,pct:10,row:{equipBuffTechnicId:'same',equipBuffConflictGroups:'x',equipBuffStackRule:'latest'}}]);
const state=vm.runInContext('DEFAULT_STATE()',p);state.composite=[{enabled:true,name:'fixed',extraAC:20},{enabled:true,name:'negative',extraAC:-5}];
fixture('fixed external sources', [{id:'pct',slot:h,pct:5},{id:'flat',slot:b,ac:3}],state);
state.composite.push({enabled:true,name:'fixed percent',extraACPct:5});
fixture('fixed percentage conservative unsupported fallback',[{id:'p',slot:h,pct:10},{id:'f',slot:b,ac:2}],state);
const full=p.MOEOptimizerV2Candidates.generate(),ctx=require('../tools/inspect-optimizer-v2-objectives.cjs').objectiveContexts(p,20).ac;
const reduced=p.MOEOptimizerV2MetricCandidateReducer.reduce(full,ctx),old=B.inspectBounds(reduced),proof=B.inspectACPercentage(reduced);
assert.equal(reduced.diagnostics.metricReduction.acFixedContextEquivalence.before,2199);
assert.equal(reduced.diagnostics.metricReduction.acFixedContextEquivalence.after,1350,'fixed-context exact body/addition equivalence');
assert.equal(reduced.contextEquivalentClasses.length,497,'strict retained-witness AC replacement');
const entries=Object.entries(Object.values(old.metrics)[0].candidates);
const percentage=entries.filter(([,v])=>v.reason==='buff-percentage');
assert.equal(percentage.length,19);assert.ok(percentage.every(([id])=>proof.candidates[id].potential));
const groups=entries.filter(([,v])=>v.reason==='buff-group-interaction');assert.equal(groups.length,34);
assert.ok(groups.every(([id])=>proof.candidates[id].potential===null));
console.log({partialStates:total,percentageKnown:percentage.length,groupUnknown:groups.length});



const legacyReduction=E.reduce(full,ctx),legacy=B.inspectBounds(legacyReduction),legacyPercentage=B.inspectACPercentage(legacyReduction);
const legacyEntries=Object.entries(Object.values(legacy.metrics)[0].candidates);
assert.equal(legacyEntries.filter(([,v])=>v.reason==='buff-percentage').length,25);
assert.ok(legacyEntries.filter(([,v])=>v.reason==='buff-percentage').every(([id])=>legacyPercentage.candidates[id].potential));
assert.equal(legacyEntries.filter(([,v])=>v.reason==='buff-group-interaction').length,50);
assert.ok(legacyEntries.filter(([,v])=>v.reason==='buff-group-interaction').every(([id])=>!legacyPercentage.candidates[id].potential));
const earthClass=legacyReduction.contextEquivalentClasses.find(c=>c.representativeCandidate.name==='アース チェストベル');
assert.ok(earthClass);assert.equal(legacyPercentage.candidates[earthClass.representativeCandidateId].potential.pctMax,5);
console.log('pre-reducer 24/24 percentage known; 50 groups remain unknown; real Earth Bell +5%');

for(const invalid of [{extraAC:1e308,equipBuffExtraACPct:1e308},{extraAC:'bad',equipBuffExtraACPct:5},{extraAC:Infinity,equipBuffExtraACPct:5}]){
 const s=json(p.MOEOptimizerV2Candidates.generate({items:[{catalogId:'invalid',name:'invalid',category:'defense',slot:h}]}));
 Object.assign(s.candidates[0].evaluationFields,{equipBuffEnabled:true,equipBuffName:'invalid'},invalid);freeze(s);
 const c=C.create({objective:'ac',slots:[h],topK:20});
 const r=E.reduce(s,c),pr=B.inspectACPercentage(r);
 assert.ok(!pr || pr.upper===null,'nonfinite/overflow falls back to unknown');
}
console.log('NaN/Infinity/overflow fallback OK');
