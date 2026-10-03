// Independent formal Cartesian oracle; no B&B, bound or filtered pool in oracle.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {runtime,filter,top,json}=require('../tools/diagnose-optimizer-v2-phase4H.cjs');
const p=runtime(),C=p.MOEOptimizerV2SearchContext,B=p.MOEOptimizerV2BranchAndBound,R=p.MOEOptimizerV2MetricCandidateReducer;
vm.runInContext(fs.readFileSync('src/optimizer-v2/branchAndBound.js','utf8'),p);const productionB=p.MOEOptimizerV2BranchAndBound;
const original=p.catalogEquipmentToRow;p.catalogEquipmentToRow=(i,...a)=>Object.assign(original(i,...a),i.fixtureFields||{});
const project=i=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const slots=['防具: 頭','防具: 手','装飾: 胸','装飾: 指'];
const report={partialStates:0,nonLeafPartialStates:0,retainedBranches:0,excludedBranches:0,falseSurvivors:0,independentCompletions:0,violations:0,fixtures:[],parityRuns:0,removedCandidatesChecked:0};
const compare=(a,b)=>b.primary-a.primary||b.secondary-a.secondary||(a.key<b.key?-1:a.key>b.key?1:0);
function exercise(name,skill,metric,items,{activeSlots=slots,k=20,restriction=null,base=null}={}){
 base=base||vm.runInContext('DEFAULT_STATE()',p);
 const snap=p.MOEOptimizerV2Candidates.generate({items}),extra=restriction?{[restriction]:[snap.candidates.find(c=>c.catalogId==='headA').candidateId]}:{};
 const ctx=C.create({objective:{metric:'skillPlus',skillName:skill},secondary:{metric},slots:activeSlots,topK:k,baseState:base,...extra}),prep=p.MOEOptimizerV2FacetSearch.prepare(items,ctx,{project,magicReduction:false}),r=prep.reduction,all=new Map(),partials=[];
 // oracle uses ALL source candidates, including candidates discarded by reducers.
 function visit(depth,chosen){let best=-Infinity;
  if(depth===activeSlots.length){const e=C.evaluate(ctx,chosen,snap.sources);report.independentCompletions++;if(e.feasible){best=e.score;const d=R.describeConfiguration(r,chosen.map(c=>c.candidateId));all.set(d.performanceKey,{primary:e.score,secondary:e.secondaryScore,key:d.performanceKey,ids:d.equipment.map(x=>x.selectedCandidate.candidateId).sort()});}}
  else for(const c of [null,...snap.candidates.filter(c=>c.slot===activeSlots[depth])])best=Math.max(best,visit(depth+1,c?[...chosen,c]:chosen));
  partials.push({depth,ids:chosen.map(c=>c.candidateId),best});return best;
 }const P=visit(0,[]),expected=[...all.values()].sort(compare),f=filter(B,r,P);
 const representative=new Map(r.contextEquivalentClasses.flatMap(c=>c.equivalentCandidateIds.map(id=>[id,c.representativeCandidateId])));
 for(const s of partials){if(s.ids.some(id=>!representative.has(id)))continue;const ids=s.ids.map(id=>representative.get(id)),upper=f.ins.bound(ids,activeSlots.slice(s.depth));report.partialStates++;if(s.depth<activeSlots.length)report.nonLeafPartialStates++;
  assert.ok(upper===null||upper>=s.best,JSON.stringify({name,upper,actual:s.best,ids}));
  if(upper!==null&&upper<P){report.excludedBranches++;assert.ok(s.best<P,'Excluded branch reaches primary maximum');}
  else{report.retainedBranches++;if(s.best<P)report.falseSurvivors++;}
 }
 for(const c of r.candidates.filter(c=>!f.residual.candidates.some(x=>x.candidateId===c.candidateId))){
  const reachable=expected.some(x=>x.primary===P&&x.ids.includes(c.candidateId));assert.equal(reachable,false);report.removedCandidatesChecked++;
 }
 const baseline=B.run(r),residual=B.run(f.residual,{residualTarget:P,preparedPrimaryProof:f.proof});
 const P0=expected.filter(x=>x.primary===P),enough=P0.length>=k;
 // Conditional P0 exactness cannot be labelled global Top-K Exact if P0<K.
 const globalExact=residual.diagnostics.exact&&residual.results.length>=k;
 assert.equal(globalExact,enough);
 const selected=globalExact?residual:baseline;
 const ranked=expected.slice(0,k).map((x,i)=>({...x,rank:i+1}));
 assert.deepEqual(top(selected),json(ranked));assert.deepEqual(top(residual),json(P0.slice(0,k).map((x,i)=>({...x,rank:i+1}))));assert.equal(baseline.diagnostics.exact,true);report.parityRuns++;
 const production=productionB.run(r);assert.equal(production.diagnostics.exact,true);assert.deepEqual(top(production),json(ranked));
 assert.equal(production.diagnostics.primaryStrata?.fallbackReason==='P0-below-K',!enough&&production.diagnostics.primaryStrata?.enabled===true);
 if(production.diagnostics.primaryStrata?.enabled)assert.equal(production.diagnostics.primaryStrata.primaryMaximum,P);
const entry={name,skill,metric,P,P0Distinct:P0.length,k,globalExact,residualStratumExact:residual.diagnostics.exact,fallback:!enough,productionParity:true,productionStrata:json(production.diagnostics.primaryStrata||{}),before:r.candidates.length,after:f.residual.candidates.length,best:ranked[0]};report.fixtures.push(entry);
 fs.writeFileSync('docs/optimizer-v2-phase4H-fixtures.json',JSON.stringify(report,null,2));console.log(JSON.stringify({name,skill,metric,P,count:P0.length,partials:report.partialStates}));return {expected,P0,r,baseline,residual};
}
for(const metric of ['magic','avoid'])for(const skill of ['破壊魔法','回復魔法','キック']){
 const item=(id,slot,P,S,fields={})=>({catalogId:id,name:id,category:'defense',slot,fixtureFields:{equipBuffEnabled:true,equipBuffName:id,equipBuffTechnicId:id,extraEffects:P?[{key:'skillPlus',name:skill,value:P}]:[],...(metric==='magic'?{magic:S}:{extraAvoid:S}),...fields}});
 const items=[item('headA',slots[0],15,0),item('headB',slots[0],10,20),item('headBad',slots[0],1,999),item('handA',slots[1],15,0),item('handB',slots[1],20,10),item('handBad',slots[1],1,999),
  ...Array.from({length:5},(_,i)=>item('free'+i,slots[2],0,i+1,{equipBuffFlatAttack:i+1})),...Array.from({length:4},(_,i)=>item('ring'+i,slots[3],0,i+1,{equipBuffFlatAttack:i+1}))];
 const regular=exercise('A/B/C/D alternatives and unrelated slots',skill,metric,items);
 assert.ok(regular.P0.length>=20);assert.ok(regular.expected[0].ids.some(id=>id.includes(':headA:')));assert.ok(regular.expected[0].ids.some(id=>id.includes(':handB:')));
 // Force the documented exchange example with an exclusive group linking A choices.
 const swaps=items.map(i=>({...i,fixtureFields:{...i.fixtureFields,...(['headA','handB'].includes(i.catalogId)?{equipBuffConflictGroups:'tradeoff'}:{})}}));
 const exchanged=exercise('A/B primary Top1 differs from secondary optimum',skill,metric,swaps);
 assert.equal(exchanged.expected[0].primary,30);assert.ok(exchanged.expected[0].ids.some(id=>id.includes(':headB:')));assert.ok(exchanged.expected[0].ids.some(id=>id.includes(':handB:')));
 const primaryTop1=exchanged.P0.slice().sort((a,b)=>a.key<b.key?-1:a.key>b.key?1:0)[0];assert.notEqual(primaryTop1.key,exchanged.expected[0].key);assert.ok(primaryTop1.secondary<exchanged.expected[0].secondary);
 if(skill==='キック'){
  const few=exercise('E P0 below K',skill,metric,items.slice(0,3),{activeSlots:[slots[0]]});assert.equal(few.P0.length,1);
  const conflict=items.map(i=>({...i,fixtureFields:{...i.fixtureFields,...(['headA','handB'].includes(i.catalogId)?{equipBuffConflictGroups:'G',equipBuffStackRule:'latest',equipBuffTechnicId:'shared'}:{})}}));
  exercise('F/G Buff groups, latest technic and same-slot',skill,metric,conflict);
  for(const restriction of ['fixedCandidateIds','excludedCandidateIds'])exercise('H '+restriction,skill,metric,items,{restriction});
  const external=vm.runInContext('DEFAULT_STATE()',p);external.composite=[{enabled:true,name:'external-primary',tags:'G',extraEffects:[{key:'skillPlus',name:skill,value:7}]}];
  exercise('external, negative and equipment Buff conflict',skill,metric,[...conflict,item('negative',slots[0],-3,1000,{equipBuffConflictGroups:'G'})],{base:external});
 }
}
assert.ok(report.nonLeafPartialStates>=300);assert.ok(report.excludedBranches>0&&report.retainedBranches>0);assert.equal(report.violations,0);
fs.writeFileSync('docs/optimizer-v2-phase4H-fixtures.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,fixtures:report.fixtures.map(x=>({name:x.name,skill:x.skill,metric:x.metric,P:x.P,count:x.P0Distinct,fallback:x.fallback}))}));
