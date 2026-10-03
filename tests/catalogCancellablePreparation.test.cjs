const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification','equipmentCandidatePolicy'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);const F=p.MOEOptimizerV2FacetSearch;
const A=p.MOEOptimizerV2Candidates;
const nodes=new Map(),el=id=>{if(!nodes.has(id))nodes.set(id,{value:'',checked:false,disabled:false,textContent:'',innerHTML:'',dataset:{}});return nodes.get(id);};
for(const name of ['catalogWeaponSummary','catalogArmorSummary','catalogRequirementAndPerformanceSummary','catalogStatusSummary','catalogBuffSummary'])p[name]=item=>item.name;
p.document={querySelectorAll:()=>[]};p.byId=el;p.AbortController=AbortController;p.escapeAttr=p.escapeHtml=String;p.collectInputs=()=>({});
vm.runInContext('state=DEFAULT_STATE()',p);vm.runInContext(fs.readFileSync('src/ui/catalogSpecialization.js','utf8'),p);vm.runInContext('loadFacetOptimizerScripts=async()=>{};catalogFacetOptionsReady=true;',p);
const items=p.equipmentCatalogItems().filter(i=>['official-defense-22951','official-defense-21791'].includes(i.catalogId));p.equipmentCatalogItems=()=>items;
el('catalogSpecialAxis0').value='stat:extraAvoid';el('specialSlot').value='装飾: 耳';
const defer=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const wait=()=>new Promise(r=>setTimeout(r,0));
(async()=>{
 // Stop must release the UI even while a shared script download is pending.
 const loading=defer();p.loadFacetOptimizerScripts=()=>loading.promise;
 const pending=p.runCatalogSpecializationOptimizer();assert.ok(el('specialOptimizerStatus').textContent.includes('読み込み'));
 vm.runInContext('catalogOptimizationController.abort()',p);await pending;
 assert.equal(el('specialOptimizeButton').disabled,false);assert.equal(p.MOE_LAST_FACET_SEARCH.result.diagnostics.exact,false);
 loading.resolve();p.loadFacetOptimizerScripts=async()=>{};
 let stopped=false,searchCalls=0;
 p.MOEOptimizerV2FacetSearch={...F,prepareAsync:(items,context,options)=>F.prepareAsync(items,context,{...options,budgetMs:0,onProgress:d=>{options.onProgress(d);assert.ok(el('specialOptimizerStatus').textContent.includes('準備中'));if(!stopped){stopped=true;vm.runInContext('catalogOptimizationController.abort()',p);}}}),run:(...args)=>{searchCalls++;return F.run(...args);}};
 await p.runCatalogSpecializationOptimizer();assert.equal(searchCalls,0);assert.equal(p.MOE_LAST_FACET_SEARCH.result.diagnostics.exact,false);assert.equal(p.MOE_LAST_FACET_SEARCH.result.diagnostics.searchNodes,0);assert.equal(el('specialOptimizeButton').disabled,false);assert.equal(el('specialOptimizeCancel').disabled,true);
 p.MOEOptimizerV2FacetSearch=F;await p.runCatalogSpecializationOptimizer();assert.equal(p.MOE_LAST_FACET_SEARCH.result.diagnostics.exact,true);assert.ok(el('specialOptimizerResults').innerHTML.includes('性能詳細'));assert.ok(el('specialOptimizerResults').innerHTML.includes('data-catalog-policy'));assert.ok(el('specialOptimizerResults').innerHTML.includes('装備Buff：'));
 // Policy generation belongs to preparation too. Stop on the task queue before
 // its first conversion, and ensure neither facet preparation nor search starts.
 let policyUpdates=0,facetCalls=0;
 p.MOEOptimizerV2Candidates={...A,generateAsync:(options,scheduling)=>A.generateAsync(options,{...scheduling,onProgress:d=>{scheduling.onProgress(d);policyUpdates++;assert.ok(el('specialOptimizerStatus').textContent.includes('固定・除外候補'));setImmediate(()=>vm.runInContext('catalogOptimizationController.abort()',p));}})};
 p.MOEOptimizerV2FacetSearch={...F,prepareAsync:(...args)=>{facetCalls++;return F.prepareAsync(...args);}};
 await p.runCatalogSpecializationOptimizer();assert.equal(policyUpdates,1);assert.equal(facetCalls,0);assert.equal(p.MOE_LAST_FACET_SEARCH.result.diagnostics.exact,false);assert.equal(p.MOE_LAST_FACET_SEARCH.result.diagnostics.searchNodes,0);
 p.MOEOptimizerV2Candidates=A;p.MOEOptimizerV2FacetSearch=F;await p.runCatalogSpecializationOptimizer();assert.equal(p.MOE_LAST_FACET_SEARCH.result.diagnostics.exact,true);
 // Simulate a transport that delivers A after abort/release and B has finished.
 for(const stage of ['policy','preparation','result']){
  const late=defer(),entered=defer();let callback,prepared,policySnapshot,first=true;
  p.MOEOptimizerV2Candidates={...A,generateAsync:async(options,scheduling)=>{if(first&&stage==='policy'){first=false;callback=scheduling.onProgress;policySnapshot=A.generate(options);entered.resolve();return late.promise;}return A.generateAsync(options,scheduling);}};
  p.MOEOptimizerV2FacetSearch={...F,prepareAsync:async(items,context,options)=>{if(first&&stage==='preparation'){first=false;callback=options.onProgress;prepared=F.prepare(items,context);entered.resolve();return late.promise;}return F.prepareAsync(items,context,options);},run:async(prep,options)=>{if(first&&stage==='result'){first=false;callback=options.onProgress;prepared=prep;entered.resolve();return late.promise;}return F.run(prep,options);}};
  const a=p.runCatalogSpecializationOptimizer();await entered.promise;vm.runInContext('catalogOptimizationController.abort();catalogOptimizationController=null;',p);
  el('catalogSpecialAxis0').value='stat:magic';await p.runCatalogSpecializationOptimizer();const before={status:el('specialOptimizerStatus').textContent,html:el('specialOptimizerResults').innerHTML,last:p.MOE_LAST_FACET_SEARCH,disabled:el('specialOptimizeButton').disabled};
  callback(stage!=='result'?{phase:'STALE-A',processed:99,total:100}:{searchNodes:999999,completeConfigurationsEvaluated:999});
  late.resolve(stage==='policy'?policySnapshot:stage==='preparation'?prepared:await F.run(prepared));await a;await wait();
  assert.equal(el('specialOptimizerStatus').textContent,before.status);assert.equal(el('specialOptimizerResults').innerHTML,before.html);assert.equal(p.MOE_LAST_FACET_SEARCH,before.last);assert.equal(el('specialOptimizeButton').disabled,before.disabled);assert.equal(el('specialOptimizeCancel').disabled,true);el('catalogSpecialAxis0').value='stat:extraAvoid';
 }
 console.log('UI preparation stop/no search/exact:false/reset/restart and stale preparation/result/progress/finally protection passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
