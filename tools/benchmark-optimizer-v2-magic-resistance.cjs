const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p),C=p.MOEOptimizerV2SearchContext;
const context=C.create({objective:'magic',secondary:{metric:'resistance',element:'Fire'},topK:20,baseState:base});
const data={checkpoint:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),catalog:items.length,preparations:[],runs:[]};
const save=()=>fs.writeFileSync('docs/optimizer-v2-phase4F-2-benchmark.json',JSON.stringify(data,null,2));
function prepare(){const t=performance.now(),prep=p.MOEOptimizerV2FacetSearch.prepare(items,context);data.preparations.push({elapsedMs:performance.now()-t,classes:prep.reduction.candidates.length,diagnostics:prep.diagnostics,reducer:prep.reduction.metricReducer?.descriptor});save();console.log(JSON.stringify(data.preparations.at(-1)));return prep;}
const cold=prepare(),warm=prepare();
function run(prep,limit){const signal={aborted:false},t=performance.now(),controller=p.MOEOptimizerV2BranchAndBound.run(prep.reduction,{cooperative:true,signal,progressEvery:10000,onProgress:x=>{if(x.searchNodes>=limit)signal.aborted=true;}});let result;
try{for(;;){const q=controller.step();if(q.done){result=q.value;break;}if(performance.now()-t>120000)signal.aborted=true;}}finally{controller.close();}
const record={limit:Number.isFinite(limit)?limit:'exact-120s',elapsedMs:performance.now()-t,diagnostics:result.diagnostics,top:result.results.map(x=>({primary:x.score,secondary:x.secondaryScore,key:x.performanceKey,ids:x.candidateIds.slice().sort()}))};data.runs.push(record);save();console.log(JSON.stringify({limit:record.limit,ms:record.elapsedMs,nodes:record.diagnostics.searchNodes,formal:record.diagnostics.completeConfigurationsEvaluated,primaryPrunes:record.diagnostics.lexicographic.primaryPrunes,secondaryPrunes:record.diagnostics.lexicographic.secondaryPrunes,resistanceBoundCalls:record.diagnostics.resistanceFastPath.calls,exact:record.diagnostics.exact,best:record.top[0]&&[record.top[0].primary,record.top[0].secondary],kth:record.top.at(-1)&&[record.top.at(-1).primary,record.top.at(-1).secondary]}));return record;}
const diagnostic=run(cold,10000);
if(diagnostic.elapsedMs<10000){const exact=run(warm,Infinity);if(exact.diagnostics.exact&&exact.elapsedMs<=30000){const repeat=run(warm,Infinity);assert.deepEqual(exact.top,repeat.top);data.repeatParity=true;save();}}else{data.exactSkipped='10k diagnostic exceeded 10 seconds';save();}
