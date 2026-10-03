const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const C=p.MOEOptimizerV2SearchContext,S=p.MOEEquipmentSearchSpecification,R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound;
const original=p.catalogEquipmentToRow;p.catalogEquipmentToRow=(i,...a)=>Object.assign(original(i,...a),i.fixtureFields||{});
const project=i=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const slots=['防具: 頭','装飾: 胸','武器: 右手','武器: 左手'],json=x=>JSON.parse(JSON.stringify(x));
const compare=(a,b)=>b.primary-a.primary||b.secondary-a.secondary||(a.key<b.key?-1:a.key>b.key?1:0);
let partials=0,completions=0,parityRuns=0;
function exercise(skill,items,base,activeSlots=slots){
 const context=S.toContext(S.create([{key:'skillPlus:'+skill},{key:'stat:magic'}],{secondary:true,slots:activeSlots,topK:20}),{baseState:base});
 const prep=p.MOEOptimizerV2FacetSearch.prepare(items,context,{project,magicReduction:true}),r=prep.reduction,snapshot=p.MOEOptimizerV2Candidates.generate({items}),all=new Map(),records=[];
 const members=new Map(r.contextEquivalentClasses.flatMap(c=>c.equivalentCandidateIds.map(id=>[id,c.representativeCandidateId])));
 function visit(depth,chosen){let best=null,maximumMagic=-Infinity;
  if(depth===activeSlots.length){const e=C.evaluate(context,chosen,snapshot.sources);completions++;if(e.feasible){const d=R.describeConfiguration(r,chosen.map(c=>c.candidateId));maximumMagic=e.secondaryScore;best={primary:e.score,secondary:e.secondaryScore,key:d.performanceKey,ids:d.equipment.map(x=>x.selectedCandidate.candidateId).sort()};all.set(best.key,best);}}
  else for(const c of [null,...snapshot.candidates.filter(c=>c.slot===activeSlots[depth])]){const child=visit(depth+1,c?[...chosen,c]:chosen),b=child.best;maximumMagic=Math.max(maximumMagic,child.maximumMagic);if(b&&(!best||compare(b,best)<0))best=b;}
  records.push({depth,chosen,best,maximumMagic});return {best,maximumMagic};
 }visit(0,[]);
 const expected=[...all.values()].sort(compare),primaryInspector=B.inspectSkillPlusPotential(r),magicInspector=B.inspectMagicCoupled(r,[],activeSlots);
 for(const x of records){if(x.chosen.some(c=>!members.has(c.candidateId)))continue;const ids=x.chosen.map(c=>members.get(c.candidateId)).filter(Boolean),remaining=activeSlots.slice(x.depth),P=primaryInspector.evaluate(ids,remaining),M=magicInspector.evaluate(ids,remaining);
  if(x.best&&P!==null&&M!==null){assert.ok(P>=x.best.primary);assert.ok(M>=x.maximumMagic,JSON.stringify({M,actual:x.maximumMagic,ids}));assert.ok(P>x.best.primary||(P===x.best.primary&&M>=x.best.secondary),JSON.stringify({P,M,best:x.best}));partials++;}}
 for(const k of [1,5,20])for(const options of [{},{boundMode:'none'},{lexicographicMagicBound:false},{slotOrder:'ascending'},{slotOrder:'descending'},...['current','primary','primaryMagic','pruning'].map(lexicographicOrdering=>({lexicographicOrdering}))]){
  const result=B.run({...r,context:S.toContext(S.create([{key:"skillPlus:"+skill},{key:"stat:magic"}],{secondary:true,slots:activeSlots,topK:k}),{baseState:base})},options);assert.equal(result.diagnostics.exact,true);
  const actual=result.results.map(v=>({primary:v.score,secondary:v.secondaryScore,key:v.performanceKey,ids:v.candidateIds.slice().sort()}));
  assert.deepEqual(json(actual),json(expected.slice(0,k)));parityRuns++;
 }
 return expected;
}
for(const skill of ['破壊魔法','回復魔法','キック']){
 const base=vm.runInContext('DEFAULT_STATE()',p);base.skillSim.skills['精神力']=70;
 base.composite=[{enabled:true,name:'external',flatMagic:3,tags:'G',extraEffects:[{key:'skillPlus',name:skill,value:2}]}];
 const item=(id,slot,P,M,fields={})=>({catalogId:id,name:id,category:'defense',slot,fixtureFields:{equipBuffEnabled:true,equipBuffName:id,equipBuffTechnicId:id,magic:M,extraEffects:[{key:'skillPlus',name:skill,value:P}],...fields}});
 const buff=(id,slot,P,M,fields={})=>item(id,slot,P,M,{equipBuffEnabled:true,equipBuffName:id,equipBuffTechnicId:id,...fields});
 const items=slots.flatMap((slot,i)=>[item('a'+i,slot,10,5,{weaponDamage:50,weaponReq:[{name:'刀剣',required:100}]}),buff('b'+i,slot,10,9,{equipBuffMagicPct:10,equipBuffConflictGroups:'G',equipBuffStackRule:'latest'}),buff('c'+i,slot,9,999,{equipBuffTechnicId:'shared',equipBuffMagicPct:-10}),item('d'+i,slot,0,-10,{weaponTwoHanded:i===2?'○':''})]);
 const candidates=p.MOEOptimizerV2Candidates.generate({items}),req=candidates.candidates.find(c=>c.catalogId==="a2"),reqContext=S.toContext(S.create([{key:"skillPlus:"+skill},{key:"stat:magic"}],{secondary:true,slots}),{baseState:base});
 const required=C.evaluate(reqContext,[req],candidates.sources),naked=C.evaluate(reqContext,[],candidates.sources);assert.equal(required.metrics.skillModInfo.mod,0);assert.equal(required.score,naked.score+10);assert.equal(required.secondaryScore,naked.secondaryScore+5);
 exercise(skill,items,base);
}
const base=vm.runInContext('DEFAULT_STATE()',p),skill='破壊魔法';
const levels=Array.from({length:22},(_,i)=>({catalogId:'level'+i,name:'level'+i,category:'defense',slot:slots[0],fixtureFields:{equipBuffEnabled:true,equipBuffName:"level"+i,equipBuffTechnicId:"level"+i,magic:i<19?100+i:999+i-19,extraEffects:[{key:'skillPlus',name:skill,value:i<19?180:179}]}}));
exercise(skill,[{P:180,M:100},{P:179,M:999}].map(({P,M},i)=>({catalogId:'priority'+i,name:'priority'+i,category:'defense',slot:slots[0],fixtureFields:{equipBuffEnabled:true,equipBuffName:'priority'+i,equipBuffTechnicId:'priority'+i,magic:M,extraEffects:[{key:'skillPlus',name:skill,value:P}]}})),base,[slots[0]]);
exercise(skill,Array.from({length:5},(_,i)=>({catalogId:'distinct'+i,name:'distinct'+i,category:'defense',slot:slots[0],fixtureFields:{equipBuffEnabled:true,equipBuffName:'distinct'+i,equipBuffTechnicId:'distinct'+i,magic:100-i,extraEffects:[{key:'skillPlus',name:skill,value:i+1}]}})),base,[slots[0]]);
const top=exercise(skill,levels,base,[slots[0]]);assert.equal(top.slice(0,20).filter(x=>x.primary===180).length,19);assert.equal(top[19].primary,179);assert.ok(top[0].secondary<top[19].secondary);
const replacementBase=vm.runInContext('DEFAULT_STATE()',p);replacementBase.composite=[{enabled:true,name:'fixed primary',extraEffects:[{key:'skillPlus',name:skill,value:180}]}];
exercise(skill,Array.from({length:25},(_,i)=>({catalogId:'replacement'+i,name:'replacement'+i,category:'defense',slot:slots[0],fixtureFields:{magic:i+1}})),replacementBase,[slots[0]]);
const originalLevels=p.MOEOptimizerV2Candidates.generate({items:levels});
for(const restriction of ['fixedCandidateIds','excludedCandidateIds']){
 const restricted=C.create({objective:{metric:'skillPlus',skillName:skill},secondary:{metric:'magic'},slots:[slots[0]],topK:5,baseState:base,[restriction]:[originalLevels.candidates[0].candidateId]}),prep=p.MOEOptimizerV2FacetSearch.prepare(levels,restricted,{project}),expected=new Map();
 for(const chosen of [[],...originalLevels.candidates.map(c=>[c])]){const e=C.evaluate(restricted,chosen,originalLevels.sources);if(!e.feasible)continue;const d=R.describeConfiguration(prep.reduction,chosen.map(c=>c.candidateId));expected.set(d.performanceKey,{primary:e.score,secondary:e.secondaryScore,key:d.performanceKey});}
 const actual=B.run(prep.reduction);assert.equal(actual.diagnostics.lexicographic.enabled,false);assert.equal(actual.diagnostics.exact,true);
 assert.deepEqual(json(actual.results.map(v=>({primary:v.score,secondary:v.secondaryScore,key:v.performanceKey}))),json([...expected.values()].sort(compare).slice(0,5)));
}
assert.ok(partials>=1000);const report={tupleSafetyPartials:partials,componentwiseSafety:true,violations:0,independentFormalCompletions:completions,parityRuns,K:[1,5,20],maximumPrimary19:true,requirementEffects:true,externalFixed:true,fixedExcludedFallback:true,conflictSameTechnicOccupancy:true,genericTargets:['破壊魔法','回復魔法','キック']};
fs.writeFileSync('docs/optimizer-v2-phase4C-fixtures.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
