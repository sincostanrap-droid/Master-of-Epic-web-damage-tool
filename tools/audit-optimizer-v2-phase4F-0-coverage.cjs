// Audit only: production dispatch, bounded cache smoke, unreduced formal oracle.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
function runtime(){const p=contextRuntime();for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);return p;}
const json=x=>JSON.parse(JSON.stringify(x)),samplesOnly=process.argv.includes('--samples-only'),out=samplesOnly?JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4F-0-coverage.json','utf8')):{checkpoint:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),mode:'uncommitted Phase 4E preserved; no production changes; no long Exact benchmark',cache:[],dispatch:[]};
const save=()=>fs.writeFileSync('docs/optimizer-v2-phase4F-0-coverage.json',JSON.stringify(out,null,2));
const p=runtime(),items=p.equipmentCatalogItems(),base=json(vm.runInContext('DEFAULT_STATE()',p)),S=p.MOEEquipmentSearchSpecification;
function flags(d){return {skillPlus:!!d.skillPlusFastPath?.enabled,magic:!!d.magicFastPath?.enabled,evasion:!!d.avoidFastPath?.enabled,resistance:!!d.resistanceFastPath?.enabled,lexicographic:!!d.lexicographic?.enabled};}
if(!samplesOnly){
for(const name of ['fire-cold','fire-warm']){
 const context=S.toContext(S.create([{key:'stat:extraFireRes'}],{topK:20}),{baseState:base}),t=performance.now(),prep=p.MOEOptimizerV2FacetSearch.prepare(items,context),prepareMs=performance.now()-t;
 const candidateStore=json(prep.reduction.candidatePreparation.diagnostics),signal={aborted:false},start=performance.now(),controller=p.MOEOptimizerV2BranchAndBound.run(prep.reduction,{cooperative:true,signal,progressEvery:1000,onProgress:d=>{if(d.searchNodes>=1000)signal.aborted=true;}});let result;
 try{for(;;){const q=controller.step();if(q.done){result=q.value;break;}if(performance.now()-start>10000)signal.aborted=true;}}finally{controller.close();}
 const row={name,prepareMs,searchMs:performance.now()-start,classes:prep.diagnostics.classes,nodes:result.diagnostics.searchNodes,exact:result.diagnostics.exact,catalogCache:json(prep.diagnostics.catalogCache),objectiveCache:json(prep.diagnostics.objectiveCache),candidateStore,fastPath:json(result.diagnostics.resistanceFastPath)};out.cache.push(row);save();console.log(JSON.stringify(row));
}
out.availableFacets=json(p.MOEEquipmentEffectFacetCatalog.available(items)).sort((a,b)=>a.key<b.key?-1:1);
out.optimizableAxes=out.availableFacets.filter(a=>S.metricFor(a.key)).map(a=>({...a,metric:json(S.metricFor(a.key))}));out.candidateOnlyAxes=out.availableFacets.filter(a=>!S.metricFor(a.key));save();
// A fresh VM keeps the real-catalog cache measurement free of fixture adapters.
const q=runtime(),C=q.MOEOptimizerV2SearchContext,F=q.MOEOptimizerV2FacetSearch,B=q.MOEOptimizerV2BranchAndBound,R=q.MOEOptimizerV2MetricCandidateReducer,E=q.MOEOptimizerV2EffectiveCandidates,T=q.MOEEquipmentSearchSpecification;
const converter=q.catalogEquipmentToRow;q.catalogEquipmentToRow=(i,...a)=>Object.assign(converter(i,...a),i.fixtureFields||{});
const project=i=>q.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:q.catalogEquipmentToRow,resolveBuff:q.resolveEquipmentBuffRow,toComposite:q.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",q),effects:q.normalizeAdditionalEffects,groups:r=>q.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const skills=out.optimizableAxes.filter(a=>a.metric.metric==='skillPlus').map(a=>a.metric.skillName),slots=['防具: 頭','装飾: 胸'],fixture=[];
for(let s=0;s<slots.length;s++)for(let j=1;j<=3;j++){
 const f={magic:(4-j)*10+s,extraAvoid:j*3+s,equipBuffEnabled:true,equipBuffName:`fixture-${s}-${j}`,equipBuffTechnicId:`fixture-${s}-${j}`,extraEffects:skills.map(name=>({key:'skillPlus',name,value:j+s,scope:'display'}))};
 for(const el of ['Fire','Water','Earth','Wind','Neutral']){f['extra'+el+'Res']=(j+s)*5;f['equipBuffExtra'+el+'ResPct']=4-j;}
 fixture.push({catalogId:`fixture-${s}-${j}`,name:`fixture-${s}-${j}`,category:'defense',slot:slots[s],fixtureFields:f});
}
const fixtureBase=json(vm.runInContext('DEFAULT_STATE()',q));fixtureBase.skillSim.skills['精神力']=100;fixtureBase.skillSim.skills['攻撃回避']=80;fixtureBase.skillSim.skills['呪文抵抗力']=50;
const snapshot=q.MOEOptimizerV2Candidates.generate({items:fixture}),identity=r=>({score:r.score,secondary:r.secondaryScore??null,key:r.performanceKey,ids:r.candidateIds.slice().sort()}),order=(a,b)=>b.score-a.score||(b.secondary??0)-(a.secondary??0)||(a.key<b.key?-1:a.key>b.key?1:0);
let formalChecks=0;
function probe(axes,policy={},secondary=axes.length>1,label=''){
 const spec=T.create(axes.map(a=>typeof a==='string'?{key:a}:a),{secondary,topK:20,slots}),ctx=T.toContext(spec,{baseState:fixtureBase,...policy}),prep=F.prepare(fixture,ctx,{project}),oracle=new Map();
 const describe=prep.reduction.metricReducer?.applied?R:E;
 function visit(depth,chosen){if(depth===slots.length){const e=C.evaluate(ctx,chosen,snapshot.sources);formalChecks++;if(e.feasible){const d=describe.describeConfiguration(prep.reduction,chosen.filter(c=>prep.snapshot.candidates.some(x=>x.candidateId===c.candidateId)).map(c=>c.candidateId));oracle.set(d.performanceKey,{score:e.score,secondary:e.secondaryScore??null,key:d.performanceKey,ids:d.equipment.map(x=>x.selectedCandidate.candidateId).sort()});}return;}for(const c of [null,...snapshot.candidates.filter(c=>c.slot===slots[depth])])visit(depth+1,c?[...chosen,c]:chosen);}
 visit(0,[]);const result=B.run(prep.reduction);assert.equal(result.diagnostics.exact,true);assert.deepEqual(json(result.results.map(identity)),json([...oracle.values()].sort(order).slice(0,20)));
 const row={label,axes:json(axes),secondary,policy,spec:json(spec),dispatch:flags(result.diagnostics),metricReducer:prep.reduction.metricReducer?.applied||false,classes:prep.diagnostics.classes,exact:true,parity:true};out.dispatch.push(row);return row;
}
for(const a of out.optimizableAxes){const row=probe([a.key],{},false,'single');assert.ok(Object.values(row.dispatch).some(Boolean),a.key+' must use a dedicated path');}
// All supported axis pairs (including repeated axes, which UI does not prohibit).
for(const a of out.optimizableAxes)for(const b of out.optimizableAxes){const row=probe([a.key,b.key],{},true,'pair');const dedicated=a.metric.metric==='skillPlus'&&b.metric.metric==='magic';assert.equal(row.dispatch.lexicographic,dedicated);if(!dedicated)assert.equal(Object.values(row.dispatch).some(Boolean),false);}
for(const key of ['skillPlus:破壊魔法','skillPlus:回復魔法','stat:magic','stat:extraAvoid',...['Fire','Water','Earth','Wind','Neutral'].map(x=>'stat:extra'+x+'Res')]){
 probe([{key,minimum:'0'}],{},false,'minimum');
 for(const policy of [{fixedCandidateIds:[snapshot.candidates[0].candidateId]},{excludedCandidateIds:[snapshot.candidates[0].candidateId]}])probe([key],policy,false,'policy-single');
}
for(const policy of [{fixedCandidateIds:[snapshot.candidates[0].candidateId]},{excludedCandidateIds:[snapshot.candidates[0].candidateId]}])probe(['skillPlus:破壊魔法','stat:magic'],policy,true,'policy-lexicographic');
const third=probe(['skillPlus:破壊魔法','stat:magic',{key:'stat:extraAvoid',minimum:'0'}],{},true,'third-constraint');assert.equal(third.spec.constraints[0].metric.metric,'avoid');assert.equal(third.dispatch.lexicographic,false);
const displayThird=probe(['skillPlus:破壊魔法','stat:magic','stat:extraAvoid'],{},true,'third-display');assert.equal(displayThird.spec.constraints.length,0);assert.equal(displayThird.dispatch.lexicographic,true);assert.equal(displayThird.spec.third,undefined);
const required=probe(['stat:magic',{key:'stat:extraAvoid',required:true}],{},false,'required-without-secondary');assert.ok(required.spec.constraints.length>0);assert.equal(Object.values(required.dispatch).some(Boolean),false);
let unsupported=0;for(const a of out.candidateOnlyAxes){assert.throws(()=>T.create([{key:a.key}]));assert.throws(()=>T.create([{key:'stat:magic'},{key:a.key}],{secondary:true}));assert.throws(()=>T.create([{key:'stat:magic'},{key:a.key,minimum:'0'}]));const spec=T.create([{key:'stat:magic'},{key:a.key},{key:a.key}],{secondary:false});assert.equal(spec.secondary,null);unsupported++;}
out.validation={single:out.dispatch.filter(x=>x.label==='single').length,pairs:out.dispatch.filter(x=>x.label==='pair').length,totalParity:out.dispatch.length,formalChecks,unsupportedAxes:unsupported,thirdComparator:false,thirdConstraint:true,allPass:true};save();console.log(JSON.stringify(out.validation));
}
// Bounded real-catalog fallback samples for the three proposed next scopes.
// These diagnose early progress only; they never claim a full-search runtime.
out.genericSamples=[];
for(const axes of [['skillPlus:破壊魔法','stat:extraAvoid'],['stat:magic','stat:extraFireRes'],['stat:extraAvoid','stat:extraFireRes']]){
 const ctx=S.toContext(S.create(axes.map(key=>({key})),{secondary:true,topK:20}),{baseState:base}),t=performance.now(),prep=p.MOEOptimizerV2FacetSearch.prepare(items,ctx),prepareMs=performance.now()-t;
 const signal={aborted:false},start=performance.now(),controller=p.MOEOptimizerV2BranchAndBound.run(prep.reduction,{cooperative:true,signal,progressEvery:1000,onProgress:d=>{if(d.searchNodes>=1000)signal.aborted=true;}});let result;
 try{for(;;){const step=controller.step();if(step.done){result=step.value;break;}if(performance.now()-start>10000)signal.aborted=true;}}finally{controller.close();}
 const row={axes,prepareMs,searchMs:performance.now()-start,classes:prep.diagnostics.classes,nodes:result.diagnostics.searchNodes,formal:result.diagnostics.evaluationSession.computeMetricsCalls,objectivePrunes:result.diagnostics.optimisticObjectivePrunedNodes,exact:result.diagnostics.exact,dispatch:flags(result.diagnostics),best:result.results[0]&&[result.results[0].score,result.results[0].secondaryScore],kth:result.results.at(-1)&&[result.results.at(-1).score,result.results.at(-1).secondaryScore]};out.genericSamples.push(row);save();console.log(JSON.stringify(row));
}
