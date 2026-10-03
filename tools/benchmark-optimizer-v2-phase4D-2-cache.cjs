// Same-session audit of the production prepare/run APIs. No scoring or cache patches.
const fs=require('node:fs'),vm=require('node:vm');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
let counters={},stage='scan',phase='idle';
function measured(name,fn,scope){return function(...a){const before=stage;if(scope)stage=scope;const t=performance.now();try{return fn.apply(this,a);}finally{if(phase==='prepare'){const q=counters[name]||(counters[name]={calls:0,ms:0,byStage:{}});q.calls++;q.ms+=performance.now()-t;q.byStage[stage]=(q.byStage[stage]||0)+performance.now()-t;}stage=before;}};}
function wrapApi(name,method,scope){const api=p[name];p[name]=Object.freeze({...api,[method]:measured(name+'.'+method,api[method],scope)});}
wrapApi('MOEEquipmentEffectFacets','projectEquipmentEffectFacets','projection');
wrapApi('MOEEquipmentEffectFacetCatalog','project');
wrapApi('MOEOptimizerV2Candidates','generate','vector');
wrapApi('MOEOptimizerV2EffectiveCandidates','reduce','legacy');
wrapApi('MOEOptimizerV2MetricCandidateReducer','reduce','metric');
for(const n of ['catalogEquipmentToRow','resolveEquipmentBuffRow','normalizeAdditionalEffects','equipmentBuffToCompositeRow','normalizeCompositeRows','restoreEquipmentBuffCompatibilityGroups'])p[n]=measured(n,p[n]);
let legacyProfile=null;const effectiveApi=p.MOEOptimizerV2EffectiveCandidates;p.MOEOptimizerV2EffectiveCandidates=Object.freeze({...effectiveApi,reduce(snapshot,context,profile,...rest){legacyProfile=profile||{};return effectiveApi.reduce(snapshot,context,legacyProfile,...rest);}});
const api=p.MOEOptimizerV2EvaluationSession;
p.MOEOptimizerV2EvaluationSession=Object.freeze({...api,createCandidatePreparation(...a){const store=api.createCandidatePreparation(...a);counters.storeCreations=(counters.storeCreations||0)+1;return store;}});
// Instrument the private avoid preparation stages only in this audit VM.
let b=fs.readFileSync('src/optimizer-v2/branchAndBound.js','utf8');
b=b.replace('const slots=plan.slots,frontiers=new Map()', 'globalThis.__avoidVectorMs=performance.now()-started;const slots=plan.slots,frontiers=new Map()');
b=b.replace('const initial={flat:fixedFlat', 'globalThis.__avoidSuffixMs=performance.now()-started-globalThis.__avoidVectorMs;const initial={flat:fixedFlat');
vm.runInContext(b,p);
const catalogStart=performance.now(),items=p.equipmentCatalogItems(),catalogMs=performance.now()-catalogStart;
const base=vm.runInContext('DEFAULT_STATE()',p),C=p.MOEOptimizerV2SearchContext;
const output={checkpoint:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),mode:'same VM session; production UI prepare/run APIs; timing wrappers only',catalogCount:items.length,catalogListMs:catalogMs,runs:[]};
let fixedId;
const save=()=>fs.writeFileSync('docs/optimizer-v2-phase4D-2-cache-benchmark.json',JSON.stringify(output,null,2));
const started=performance.now();
for(const spec of [{name:'avoid-cold',metric:'avoid'},{name:'avoid-warm-2',metric:'avoid'},{name:'avoid-warm-3',metric:'avoid'},{name:'magic-switch',metric:'magic'},{name:'avoid-after-magic',metric:'avoid'},{name:'avoid-skillSim',metric:'avoid',skill:100,limit:1000},{name:'avoid-fixed',metric:'avoid',fixed:true,limit:1000},{name:'avoid-excluded',metric:'avoid',excluded:true,limit:1000}]){
 if(performance.now()-started>480000){output.stopped='8 minute measurement budget reached';break;}
 counters={};stage='scan';phase='prepare';
 const state=JSON.parse(JSON.stringify(base));if(spec.skill!==undefined)state.skillSim.skills['攻撃回避']=spec.skill;
 const context=C.create({objective:spec.metric,topK:20,baseState:state,...(spec.fixed?{fixedCandidateIds:[fixedId]}:{}),...(spec.excluded?{excludedCandidateIds:[fixedId]}:{})});
 const t=performance.now(),prepared=p.MOEOptimizerV2FacetSearch.prepare(items,context),preparationMs=performance.now()-t;
 phase='search';if(!fixedId)fixedId=prepared.reduction.candidates.find(c=>c.slot==='防具: 頭').candidateId;
 const preparationCacheBefore=JSON.parse(JSON.stringify(prepared.reduction.candidatePreparation?.diagnostics||null));
 const signal={aborted:false},searchStart=performance.now(),controller=p.MOEOptimizerV2BranchAndBound.run(prepared.reduction,{cooperative:true,signal,profileSearch:true,progressEvery:spec.limit||10000,onProgress:x=>{if(spec.limit&&x.searchNodes>=spec.limit)signal.aborted=true;}});let result;
 try{for(;;){const next=controller.step();if(next.done){result=next.value;break;}if(performance.now()-searchStart>30000)signal.aborted=true;}}finally{controller.close();}
 const searchMs=performance.now()-searchStart;phase='idle';
 const facetCalls=counters['MOEEquipmentEffectFacetCatalog.project']?.calls||0,facetMiss=counters['MOEEquipmentEffectFacets.projectEquipmentEffectFacets']?.calls||0;
 const record={...spec,preparationMs,searchMs,classes:prepared.reduction.candidates.length,facetCache:{generation:p.MOEEquipmentEffectFacetCatalog.generation(),calls:facetCalls,hits:facetCalls-facetMiss,misses:facetMiss},immutableCache:prepared.diagnostics.catalogCache,objectiveCache:prepared.diagnostics.objectiveCache,legacyReducerProfile:legacyProfile,candidateStore:preparationCacheBefore,candidateStoreAfterSearch:prepared.reduction.candidatePreparation?.diagnostics,evaluationCache:result.diagnostics.evaluationSession,profile:counters,searchProfile:result.diagnostics.searchProfile,avoidPreparation:result.diagnostics.avoidFastPath,avoidVectorGroupMs:spec.metric==='avoid'?p.__avoidVectorMs:null,avoidFrontierSuffixMs:spec.metric==='avoid'?p.__avoidSuffixMs:null,nodes:result.diagnostics.searchNodes,exact:result.diagnostics.exact,best:result.results[0]?.score,kth:result.results.at(-1)?.score,top:result.results.map(x=>({score:x.score,key:x.performanceKey,ids:x.candidateIds.slice().sort()}))};
 output.runs.push(record);save();console.log(JSON.stringify({name:spec.name,prep:preparationMs,search:searchMs,cache:record.facetCache,store:preparationCacheBefore,exact:record.exact,nodes:record.nodes}));
}
output.elapsedMs=performance.now()-started;save();
