const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const items=p.equipmentCatalogItems();items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));
const base=vm.runInContext('DEFAULT_STATE()',p),S=p.MOEEquipmentSearchSpecification,C=p.MOEOptimizerV2SearchContext,B=p.MOEOptimizerV2BranchAndBound;
const context=S.toContext(S.create([{key:'skillPlus:破壊魔法'},{key:'stat:magic'}],{secondary:true,topK:20}),{baseState:base});
const t=performance.now(),prep=p.MOEOptimizerV2FacetSearch.prepare(items,context),r=prep.reduction,records=r.metricReducer.classification,classes=r.metricReducer.allClasses;
const entries=classes.map(c=>records.find(x=>x.candidateId===c.representativeCandidateId));
const data={catalogTotal:items.length,facetPrefilter:prep.diagnostics,prepareMs:performance.now()-t,eligibleCandidates:records.filter(x=>x.stage!=='hard-prefilter').length,equivalenceBefore:records.filter(x=>x.stage==='metric-class').length,equivalenceAfter:classes.length,finalClasses:r.contextEquivalentClasses.length,
 primaryDirectClasses:entries.filter(x=>x.primaryDirect).length,secondaryDirectClasses:entries.filter(x=>x.secondaryDirect).length,bothClasses:entries.filter(x=>x.primaryDirect&&x.secondaryDirect).length,interactionOnlyClasses:entries.filter(x=>!x.primaryDirect&&!x.secondaryDirect&&x.interaction).length,conservativeOnlyClasses:entries.filter(x=>!x.direct&&!x.interaction&&x.unknown).length,magicReduction:r.magicReduction,ordering:[]};
const save=()=>fs.writeFileSync('docs/optimizer-v2-phase4C-audit.json',JSON.stringify(data,null,2));
for(const lexicographicOrdering of ['current','primary','primaryMagic','pruning']){
 const signal={aborted:false},controller=B.run(r,{cooperative:true,signal,lexicographicOrdering,onProgress:x=>{if(x.searchNodes>=10000)signal.aborted=true;},progressEvery:10000}),start=performance.now();let result;
 try{for(;;){const q=controller.step();if(q.done){result=q.value;break;}}}finally{controller.close();}
 data.ordering.push({lexicographicOrdering,elapsedMs:performance.now()-start,diagnostics:result.diagnostics,top:result.results.map(x=>({primary:x.score,secondary:x.secondaryScore}))});save();console.log(JSON.stringify({lexicographicOrdering,nodes:result.diagnostics.searchNodes,elapsedMs:performance.now()-start}));
}
const completed=JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4C-benchmark.json')).runs.filter(r=>r.mode==='new'&&r.diagnostics.exact);
for(const run of completed)for(const v of run.top){const e=C.evaluate(context,v.ids.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id)),prep.snapshot.sources);assert.equal(e.score,v.primary);assert.equal(e.secondaryScore,v.secondary);}
data.formalTopParity=true;
const magicContext=S.toContext(S.create([{key:'stat:magic'}],{topK:20}),{baseState:base}),magicPrep=p.MOEOptimizerV2FacetSearch.prepare(items,magicContext),mt=performance.now(),magic=B.run(magicPrep.reduction),previous=JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4B-4-benchmark.json')).runs.find(x=>x.mode==='production');
const top=magic.results.map(x=>({score:x.score,key:x.performanceKey,ids:x.candidateIds.slice().sort()}));assert.equal(magic.diagnostics.exact,true);assert.deepEqual(JSON.parse(JSON.stringify(top)),previous.top.map(({score,key,ids})=>({score,key,ids})));
data.magicRegression={elapsedMs:performance.now()-mt,classes:magicPrep.reduction.contextEquivalentClasses.length,diagnostics:magic.diagnostics,best:top[0].score,kth:top.at(-1).score,topKeyIdsParity:true};
const healing=S.toContext(S.create([{key:'skillPlus:回復魔法'},{key:'stat:magic'}],{secondary:true,topK:20}),{baseState:base}),healingPrep=p.MOEOptimizerV2FacetSearch.prepare(items,healing),signal={aborted:false},controller=B.run(healingPrep.reduction,{cooperative:true,signal,progressEvery:10000,onProgress:x=>{if(x.searchNodes>=10000)signal.aborted=true;}});let result;
try{for(;;){const q=controller.step();if(q.done){result=q.value;break;}}}finally{controller.close();}
data.healingSmoke={classes:healingPrep.reduction.contextEquivalentClasses.length,diagnostics:result.diagnostics,top:result.results.map(x=>({primary:x.score,secondary:x.secondaryScore}))};save();console.log(JSON.stringify({magicExact:true,healingEnabled:result.diagnostics.lexicographic.enabled}));
