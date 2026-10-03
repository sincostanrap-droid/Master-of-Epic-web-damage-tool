const fs=require('node:fs'),vm=require('node:vm');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const items=p.equipmentCatalogItems();items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));
const base=vm.runInContext('DEFAULT_STATE()',p),S=p.MOEEquipmentSearchSpecification;
const context=S.toContext(S.create([{key:'skillPlus:破壊魔法'},{key:'stat:magic'}],{secondary:true,topK:20}),{baseState:base});
const data={runs:[]},save=()=>fs.writeFileSync('docs/optimizer-v2-phase4C-benchmark.json',JSON.stringify(data,null,2));
for(const mode of process.argv.slice(2).length?process.argv.slice(2):['old','new','new']){
 const start=performance.now(),prep=p.MOEOptimizerV2FacetSearch.prepare(items,context,{lexicographicReduction:mode!=='old'}),prepareMs=performance.now()-start;
 console.log(JSON.stringify({mode,prepareMs,classes:prep.reduction.contextEquivalentClasses.length}));
 const signal={aborted:false},t=performance.now(),samples=[];
 const controller=p.MOEOptimizerV2BranchAndBound.run(prep.reduction,{cooperative:true,signal,lexicographicFastPath:mode!=='old',observeTopK:true,profileSearch:true});
 let result,snapshot,last=0;
 try{for(;;){const q=controller.step();if(q.done){result=q.value;break;}snapshot=q.value;const ms=performance.now()-t;if(ms-last>10000){last=ms;samples.push({nodes:snapshot.searchNodes,elapsedMs:snapshot.elapsedMs,depth:snapshot.currentDepth,primaryCalls:snapshot.lexicographic.primaryCalls,secondaryCalls:snapshot.lexicographic.secondaryCalls,top:snapshot.observedTopK?.map(x=>({primary:x.score,secondary:x.secondaryScore}))});console.log(JSON.stringify({mode,ms,nodes:snapshot.searchNodes,top:snapshot.observedTopK?.slice(0,1).map(x=>({primary:x.score,secondary:x.secondaryScore}))}));}if(ms>(mode==='old'?30000:120000))signal.aborted=true;}}finally{controller.close();}
 data.runs.push({mode,prepareMs,elapsedMs:performance.now()-t,classes:prep.reduction.contextEquivalentClasses.length,reducer:prep.reduction.metricReducer?{applied:prep.reduction.metricReducer.applied}:null,magicReduction:prep.reduction.magicReduction,diagnostics:result.diagnostics,remaining:{depth:snapshot?.currentDepth,slots:snapshot?.remainingSlots},samples,top:result.results.map(r=>({primary:r.score,secondary:r.secondaryScore,key:r.performanceKey,ids:r.candidateIds.slice().sort()}))});save();
 console.log(JSON.stringify({mode,exact:result.diagnostics.exact,nodes:result.diagnostics.searchNodes,top:data.runs.at(-1).top.slice(0,1).map(x=>({primary:x.primary,secondary:x.secondary}))}));
}

const assert=require('node:assert/strict'),exact=data.runs.filter(r=>r.mode==='new'&&r.diagnostics.exact);if(exact.length>1){assert.deepEqual(exact[0].top,exact[1].top);for(const k of ['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes','tiePrunedNodes'])assert.equal(exact[0].diagnostics[k],exact[1].diagnostics[k]);for(const k of ['primaryCalls','primaryPrunes','secondaryCalls','secondaryPrunes'])assert.equal(exact[0].diagnostics.lexicographic[k],exact[1].diagnostics.lexicographic[k]);data.repeatParity=true;save();}
