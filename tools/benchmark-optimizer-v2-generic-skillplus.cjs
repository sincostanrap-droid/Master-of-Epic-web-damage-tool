/* Diagnostic limits only; production Exact API has no node/time limit. */
const fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const mode=process.argv[2]||'after',output=process.argv[3]||`docs/optimizer-v2-phase4A-${mode}.json`;
const limit=Number(process.argv[4]||120),only=process.argv[5],json=v=>JSON.parse(JSON.stringify(v));
if(!['before','after'].includes(mode))throw new Error('before or after required');
const p=contextRuntime();
if(mode==='before')vm.runInContext(cp.execFileSync('git',['show','afb5e8d:src/optimizer-v2/branchAndBound.js'],{encoding:'utf8',maxBuffer:1024*1024}),p);
for(const name of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])
 vm.runInContext(fs.readFileSync(`src/domain/${name}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p);
const historical=process.argv.includes('--historical');
const data={mode,baselineCommit:'afb5e8d',character:json(base),historicalContext:historical,limitSeconds:limit,cases:{}};
const cold=performance.now();items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));data.facetColdMs=performance.now()-cold;
for(const skill of ['破壊魔法','回復魔法','強化魔法','キック','牙']){
 if(only&&skill!==only)continue;
 const context=historical?require('./inspect-optimizer-v2-objectives.cjs').objectiveContexts(p,20).skillPlus:
  p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'skillPlus:'+skill}],{topK:20}),{baseState:base,inputs:{}});
 if(historical&&skill!=='回復魔法')throw new Error('Historical context is the existing healing regression fixture');
 const start=performance.now(),prepared=p.MOEOptimizerV2FacetSearch.prepare(items,context),setupMs=performance.now()-start;
 const r=prepared.reduction,records=r.metricReducer.classification,stages={};
 for(const record of records)stages[record.stage]=(stages[record.stage]||0)+1;
 const entry=data.cases[skill]={context:json(context),setupMs,pipeline:{...json(prepared.diagnostics),hardFiltered:r.filtered.length,stages,
  reducer:json(r.diagnostics.metricReduction||null),slotClasses:Object.fromEntries(context.slots.map(slot=>[slot,r.contextEquivalentClasses.filter(c=>c.representativeCandidate.slot===slot).length]))}};
 fs.writeFileSync(output,JSON.stringify(data,null,2));console.log(mode+' '+skill+' prepared '+prepared.diagnostics.classes+' classes');
 const signal={aborted:false},searchStart=performance.now(),controller=p.MOEOptimizerV2BranchAndBound.run(r,{cooperative:true,signal,profileSearch:true,profileEvaluation:true,...(historical?{slotOrder:'blockers'}:{})});let lastPrint=0;
 try{while(true){const next=controller.step();if(next.done){entry.elapsedMs=performance.now()-searchStart;entry.diagnostics=json(next.value.diagnostics);
   entry.top=json(next.value.results.map(v=>({score:v.score,key:v.performanceKey,ids:v.candidateIds,equipment:v.equipment.map(e=>({slot:e.slot,name:e.selectedCandidate.name,ids:e.equivalentCandidateIds}))})));
   // Re-evaluate every returned build through the non-session formal path.
   entry.formalParity=next.value.results.every(v=>{const e=p.MOEOptimizerV2SearchContext.evaluate(context,v.candidateIds.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id)),prepared.snapshot.sources);
    return e.score===v.score&&JSON.stringify(e.metrics)===JSON.stringify(v.metrics);});break;}
  const elapsed=performance.now()-searchStart;if(elapsed-lastPrint>15000){lastPrint=elapsed;console.log(skill+' '+next.value.searchNodes+' nodes '+next.value.completeConfigurationsEvaluated+' formal '+Math.round(elapsed/1000)+'s');}
  if(elapsed>=limit*1000)signal.aborted=true;
 }}finally{controller.close();}
 fs.writeFileSync(output,JSON.stringify(data,null,2));console.log(skill+' '+JSON.stringify({exact:entry.diagnostics.exact,seconds:entry.elapsedMs/1000,nodes:entry.diagnostics.searchNodes,formal:entry.diagnostics.completeConfigurationsEvaluated,prune:entry.diagnostics.boundPrunedNodes,tie:entry.diagnostics.tiePrunedNodes,top:entry.top.map(v=>v.score)}));
}
