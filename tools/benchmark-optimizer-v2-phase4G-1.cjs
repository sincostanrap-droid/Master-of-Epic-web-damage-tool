const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
function runtime(baseline=false){const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);if(baseline)for(const n of ['candidates','effectiveCandidates','metricCandidateReducer','facetSearch'])vm.runInContext(cp.execFileSync('git',['show',`481f2c9:src/optimizer-v2/${n}.js`],{encoding:'utf8',maxBuffer:8e6}),p);return p;}
function setup(p){const items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p),context=p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'stat:extraAvoid'}],{topK:20}),{baseState:base});return {items,context};}
const report={checkpoint:'481f2c9',budgetMs:8};const save=()=>fs.writeFileSync('docs/optimizer-v2-phase4G-1-benchmark.json',JSON.stringify(report,null,2));
(async()=>{
 if(process.argv.includes('--isolated-preparation')){
  const prior=JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4G-1-benchmark.json'));
  const measured={};
  for(const [name,old] of [['baseline',true],['cooperative',false]]){
   const p=runtime(old),s=setup(p);measured[name]={};
   for(const temperature of ['cold','warm']){const t=performance.now();let previous=performance.now(),maximum=0,phaseStart=t,lastPhase=null;const stages={};const beat=setInterval(()=>{const now=performance.now();maximum=Math.max(maximum,now-previous);previous=now;},10);
    const onProgress=d=>{if(d.phase!==lastPhase){if(lastPhase)stages[lastPhase]=(stages[lastPhase]||0)+performance.now()-phaseStart;phaseStart=performance.now();lastPhase=d.phase;}};
    const prep=old?p.MOEOptimizerV2FacetSearch.prepare(s.items,s.context):await p.MOEOptimizerV2FacetSearch.prepareAsync(s.items,s.context,{onProgress});clearInterval(beat);if(lastPhase)stages[lastPhase]=(stages[lastPhase]||0)+performance.now()-phaseStart;
    measured[name][temperature]={elapsedMs:performance.now()-t,classes:prep.diagnostics.classes,cache:prep.diagnostics.catalogCache,...prep.diagnostics.preparation,heartbeatMaximumMs:maximum,stages};console.log(name,temperature,JSON.stringify(measured[name][temperature]));
   }
  }
  prior.isolatedPreparation=measured;fs.writeFileSync('docs/optimizer-v2-phase4G-1-benchmark.json',JSON.stringify(prior,null,2));return;
 }
 let p=runtime(true),s=setup(p),t=performance.now();const baseline=p.MOEOptimizerV2FacetSearch.prepare(s.items,s.context);report.baseline={preparationMs:performance.now()-t,classes:baseline.diagnostics.classes};console.log('baseline',JSON.stringify(report.baseline));save();
 p=runtime();s=setup(p);const abort=new AbortController();let updates=0,lastPhase,requested,heartbeatMaximum=0,previous=performance.now();const heartbeat=setInterval(()=>{const now=performance.now();heartbeatMaximum=Math.max(heartbeatMaximum,now-previous);previous=now;},10);
 t=performance.now();const timer=setTimeout(()=>{requested=performance.now();abort.abort();},1000);
 try{await p.MOEOptimizerV2FacetSearch.prepareAsync(s.items,s.context,{signal:abort.signal,onProgress:d=>{updates++;lastPhase=d.phase;}});assert.fail('Expected abort');}catch(e){assert.equal(e.name,'AbortError');report.abort={elapsedMs:performance.now()-t,requestDelayMs:requested-t,stopLatencyMs:performance.now()-requested,progressCallbacks:updates,lastPhase,searchNodes:0,exact:false};}finally{clearTimeout(timer);clearInterval(heartbeat);}
 console.log('abort',JSON.stringify(report.abort));save();
 updates=0;previous=performance.now();heartbeatMaximum=0;const beat=setInterval(()=>{const now=performance.now();heartbeatMaximum=Math.max(heartbeatMaximum,now-previous);previous=now;},10);
 t=performance.now();const cold=await p.MOEOptimizerV2FacetSearch.prepareAsync(s.items,s.context,{onProgress:d=>{updates++;}});clearInterval(beat);
 report.restartCold={preparationMs:performance.now()-t,classes:cold.diagnostics.classes,...cold.diagnostics.preparation,heartbeatMaximumMs:heartbeatMaximum,cache:cold.diagnostics.catalogCache};assert.equal(cold.diagnostics.classes,baseline.diagnostics.classes);console.log('restartCold',JSON.stringify(report.restartCold));save();
 t=performance.now();const warm=await p.MOEOptimizerV2FacetSearch.prepareAsync(s.items,s.context);report.warm={preparationMs:performance.now()-t,...warm.diagnostics.preparation,cache:warm.diagnostics.catalogCache};assert.equal(warm.diagnostics.catalogCache.candidateMisses,0);assert.deepEqual(cold.reduction.contextEquivalentClasses.map(c=>[c.equivalenceKey,c.equivalentCandidateIds]),warm.reduction.contextEquivalentClasses.map(c=>[c.equivalenceKey,c.equivalentCandidateIds]));console.log('warm',JSON.stringify(report.warm));save();
 t=performance.now();const result=await p.MOEOptimizerV2FacetSearch.run(warm);report.exact={elapsedMs:performance.now()-t,exact:result.diagnostics.exact,nodes:result.diagnostics.searchNodes,formal:result.diagnostics.completeConfigurationsEvaluated,best:result.results[0].score,kth:result.results.at(-1).score};assert.equal(report.exact.exact,true);assert.equal(report.exact.best,220.5);assert.equal(report.exact.kth,218);console.log('exact',JSON.stringify(report.exact));save();
})().catch(e=>{console.error(e);process.exitCode=1;});
