const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {run,top,json}=require('./diagnose-optimizer-v2-phase4H.cjs');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
// Observe the already-built primary proof; do not rebuild rows or alter search.
let code=fs.readFileSync('src/optimizer-v2/branchAndBound.js','utf8');
assert.equal(code.split('      plan.primaryProof=potentialProof;').length,2);
code=code.replace('      plan.primaryProof=potentialProof;','      plan.primaryProof=potentialProof;options.phase4HAudit?.(potentialProof);');
code=code.replace('  global.MOEOptimizerV2BranchAndBound=Object.freeze({run,',`  function phase4HGroups(proof,slots){return [...new Set(proof.allSources.map(s=>s.bucket).filter(Boolean))].map(bucket=>{
    const sourcesById=new Map([...proof.sourcesById].map(([id,rows])=>[id,rows.filter(s=>s.bucket!==bucket)])),fixedSources=proof.fixedSources.filter(s=>s.bucket!==bucket);
    const sourceListsBySlot=new Map([...proof.sourceListsBySlot].map(([slot,options])=>[slot,options.map(rows=>rows.filter(s=>s.bucket!==bucket))]));
    const byId=new Map([...sourcesById].map(([id,rows])=>[id,rows.reduce((n,s)=>n+s.potential,0)])),bySlot=new Map([...sourceListsBySlot].map(([slot,options])=>[slot,Math.max(0,...options.map(rows=>rows.reduce((n,s)=>n+s.potential,0)))]));
    const q={...proof,sourcesById,fixedSources,sourceListsBySlot,byId,bySlot,base:fixedSources.reduce((n,s)=>n+s.potential,0),allSources:proof.allSources.filter(s=>s.bucket!==bucket)},old=groupPotentialUpper(q,[],slots).upper,dp=primaryCompletionUpper(preparePrimaryCompletion(q,slots),[],0);
    return {bucket,upperWithout:dp===null?old:Math.min(old,dp),candidateIds:proof.allSources.filter(s=>s.bucket===bucket).map(s=>s.candidateId).filter(Boolean)};
  });}
  global.MOEOptimizerV2BranchAndBound=Object.freeze({phase4HGroups,run,`);
vm.runInContext(code,p);
const C=p.MOEOptimizerV2SearchContext,B=p.MOEOptimizerV2BranchAndBound,items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p);
const report={production:true,cases:[],method:'Sequential same prepared reduction; legacy disabled strata vs default production strata; CLI without browser scheduling. Shared facet warmup separated. Distinct P0 count is a formally verified LOWER bound when K is filled.'},save=()=>fs.writeFileSync('docs/optimizer-v2-phase4H-production.json',JSON.stringify(report,null,2));
let t=performance.now();items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));report.facetWarmupMs=performance.now()-t;
for(const metric of ['magic','avoid']){
 const context=C.create({objective:{metric:'skillPlus',skillName:'破壊魔法'},secondary:{metric},topK:20,baseState:base});t=performance.now();const prep=p.MOEOptimizerV2FacetSearch.prepare(items,context),preparationMs=performance.now()-t,r=prep.reduction;
 let primaryProof;const before=run(B,r,{primaryStrataFastPath:false}),after=run(B,r,{phase4HAudit:proof=>{if(!primaryProof)primaryProof=proof;}}),saved=require('../docs/optimizer-v2-phase4H-diagnostic.json').cases.find(x=>x.metric===metric).before.top;
 assert.equal(before.result.diagnostics.exact,true);assert.equal(after.result.diagnostics.exact,true);assert.deepEqual(top(after.result),top(before.result));assert.deepEqual(top(before.result),saved);
 for(const x of after.result.results){const e=C.evaluate(context,x.candidateIds.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id)),prep.snapshot.sources);assert.equal(e.score,180);assert.equal(e.secondaryScore,x.secondaryScore);assert.ok(e.feasible);}
 const row={metric,preparationMs,beforeMs:before.elapsedMs,afterMs:after.elapsedMs,beforeIncludingPreparationMs:preparationMs+before.elapsedMs,afterIncludingPreparationMs:preparationMs+after.elapsedMs,improvementPct:100*(1-after.elapsedMs/before.elapsedMs),beforeDiagnostics:json(before.result.diagnostics),afterDiagnostics:json(after.result.diagnostics),top:top(after.result),parity:true,formalRecheck:true,groups:B.phase4HGroups(primaryProof,context.slots).map(g=>({...g,requiredPositiveWinner:g.upperWithout<180,classification:g.upperWithout<180?'primary-required-positive-bucket':'necessity-unproved; all alternatives retained'}))};report.cases.push(row);save();console.log(JSON.stringify({metric,preparationMs,before:row.beforeMs,after:row.afterMs,improvementPct:row.improvementPct,strata:row.afterDiagnostics.primaryStrata}));
}
report.completed=true;save();
