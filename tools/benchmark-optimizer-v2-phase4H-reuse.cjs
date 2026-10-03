const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {runtime,run,filter,top,json,maximum}=require('./diagnose-optimizer-v2-phase4H.cjs');
const p=runtime(),C=p.MOEOptimizerV2SearchContext,B=p.MOEOptimizerV2BranchAndBound,items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p);
const report={cases:[],production:false},save=()=>fs.writeFileSync('docs/optimizer-v2-phase4H-reuse.json',JSON.stringify(report,null,2)),old=require('../docs/optimizer-v2-phase4H-diagnostic.json');
let t=performance.now();items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));report.facetWarmupMs=performance.now()-t;
for(const metric of ['magic','avoid']){
 const context=C.create({objective:{metric:'skillPlus',skillName:'破壊魔法'},secondary:{metric},topK:20,baseState:base});t=performance.now();const prep=p.MOEOptimizerV2FacetSearch.prepare(items,context),preparationMs=performance.now()-t,r=prep.reduction;
 const before=run(B,r);assert.equal(before.result.diagnostics.exact,true);
 const primary=maximum(p,r);assert.equal(primary.maximumExact,true);assert.equal(primary.score,180);
 const seen=new Set(),f=filter(B,r,primary.score,primary.preparation.proof),after=run(B,f.residual,{residualTarget:primary.score,preparedPrimaryProof:f.proof,observeFormal:(e,ids)=>{if(e.feasible&&e.score===primary.score)seen.add(ids.sort().join('|'));}});
 const row={metric,preparationMs,beforeMs:before.elapsedMs,beforeDiagnostics:json(before.result.diagnostics),primaryMs:primary.elapsedMs,primaryMaximum:primary.score,maximumExact:primary.maximumExact,certificate:primary.certificate,primaryDiagnostics:json(primary.result.diagnostics),filterMs:f.elapsedMs,classes:r.candidates.length,residualClasses:f.residual.candidates.length,slots:f.slots,secondaryMs:after.elapsedMs,totalSearchMs:primary.elapsedMs+f.elapsedMs+after.elapsedMs,totalIncludingPreparationMs:preparationMs+primary.elapsedMs+f.elapsedMs+after.elapsedMs,secondaryDiagnostics:json(after.result.diagnostics),top:top(after.result),P0DistinctLowerBound:seen.size,parity:JSON.stringify(top(after.result))===JSON.stringify(top(before.result)),reusedPrimaryProof:true};
 assert.ok(row.parity);assert.equal(after.result.diagnostics.exact,true);report.cases.push(row);save();console.log(JSON.stringify({metric,beforeMs:row.beforeMs,primaryMs:row.primaryMs,filterMs:row.filterMs,secondaryMs:row.secondaryMs,totalSearchMs:row.totalSearchMs,classes:row.classes,residual:row.residualClasses,P0LowerBound:seen.size,parity:row.parity}));
}
report.completed=true;save();
