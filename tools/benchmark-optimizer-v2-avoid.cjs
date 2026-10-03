const fs=require('node:fs'),vm=require('node:vm');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p),C=p.MOEOptimizerV2SearchContext;
const context=C.create({objective:'avoid',topK:20,baseState:base}),start=performance.now(),prep=p.MOEOptimizerV2FacetSearch.prepare(items,context),r=prep.reduction;
const data={checkpoint:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),prepareMs:performance.now()-start,catalog:items.length,facetPrefilter:prep.diagnostics.relevant,hardPrefilter:r.metricReducer?.classification.filter(x=>x.stage!=='hard-prefilter').length,relevance:r.metricReducer?.classification.filter(x=>x.stage==='metric-class').length,classes:r.contextEquivalentClasses.length,runs:[]};
const save=()=>fs.writeFileSync('docs/optimizer-v2-phase4D-benchmark.json',JSON.stringify(data,null,2));
for(const limit of [10000,100000,Infinity]){
 if(limit===Infinity&&data.runs.at(-1).elapsedMs>20000&&!data.runs.at(-1).diagnostics.exact){data.exactSkipped='100k diagnostic not sufficiently practical';break;}
 if(limit===Infinity&&data.runs.at(-1).diagnostics.exact){data.exactSkipped='100k run already completed Exact';break;}
 const signal={aborted:false},t=performance.now(),controller=p.MOEOptimizerV2BranchAndBound.run(r,{cooperative:true,signal,observeTopK:true,onProgress:x=>{if(x.searchNodes>=limit)signal.aborted=true;},progressEvery:Number.isFinite(limit)?limit:10000});let result;
 try{for(;;){const q=controller.step();if(q.done){result=q.value;break;}if(performance.now()-t>120000)signal.aborted=true;}}finally{controller.close();}
 const elapsedMs=performance.now()-t,record={limit:Number.isFinite(limit)?limit:'exact-120s',elapsedMs,nodesPerSecond:result.diagnostics.searchNodes*1000/elapsedMs,diagnostics:result.diagnostics,top:result.results.map(x=>({score:x.score,key:x.performanceKey,ids:x.candidateIds.slice().sort()}))};
 data.runs.push(record);save();console.log(JSON.stringify({limit:record.limit,ms:elapsedMs,nodes:result.diagnostics.searchNodes,exact:result.diagnostics.exact,best:record.top[0]?.score,kth:record.top.at(-1)?.score,bound:result.diagnostics.avoidFastPath}));
 if(result.diagnostics.exact)break;
}
save();
