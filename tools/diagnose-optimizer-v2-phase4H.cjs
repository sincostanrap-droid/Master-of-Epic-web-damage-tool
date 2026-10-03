// Phase 4H experiment: production sources are instrumented only in a private VM.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
const json=x=>JSON.parse(JSON.stringify(x));
function runtime(){
 const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
 for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
 vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
 // Keep the pre-change baseline available after production adoption; no Git writes.
 let code=cp.execFileSync('git',['show','fc5df1429132e37fbee66523d80e950bab42b347:src/optimizer-v2/branchAndBound.js'],{encoding:'utf8'});
 const replace=(a,b)=>{assert.equal(code.split(a).length,2,a);code=code.replace(a,b);};
 replace('        ?null:skillPotentialProof(plan);','        ?null:(options.preparedPrimaryProof||skillPotentialProof(plan));');
 replace('      const primaryCompletion=lexicographic && options.lexicographicMatchingBound!==false?preparePrimaryCompletion(potentialProof,slots):null;',
 `      const primaryCompletion=(lexicographic||options.maximumCertificate) && options.lexicographicMatchingBound!==false?preparePrimaryCompletion(potentialProof,slots):null;
      options.capturePrimaryPreparation?.({proof:potentialProof,completion:primaryCompletion,slots:slots.slice()});`);
 replace('        const performanceKey=JSON.stringify(selectedClasses.map(cls=>[cls.representativeCandidate.slot,cls.equivalenceKey])',
 `        if(options.maximumCertificate){const root=primaryCompletionUpper(primaryCompletion,[],0),old=groupPotentialUpper(potentialProof,[],slots).upper;
          options.maximumCertificate({score:evaluation.score,upper:root===null?old:Math.min(root,old),ids:selectedIds.slice()});}
        const performanceKey=JSON.stringify(selectedClasses.map(cls=>[cls.representativeCandidate.slot,cls.equivalenceKey])`);
 replace('      function boundKindCore(depth) {',`      function boundKindCore(depth) {
        if(options.maximumCertificate&&heap.length){
          const old=preparedGroup?preparedGroupPotentialUpper(preparedGroup,selectedIds,depth).upper:potentialUpper(potentialProof,selectedIds,slots.slice(depth));
          const dp=primaryCompletionUpper(primaryCompletion,selectedIds,depth),upper=dp===null?old:old===null?dp:Math.min(old,dp);
          if(upper!==null&&upper<=heap[0].rankScore)return 'objective';
        }
        if(options.residualTarget!==undefined){
          const old=preparedGroup?preparedGroupPotentialUpper(preparedGroup,selectedIds,depth).upper:potentialUpper(potentialProof,selectedIds,slots.slice(depth));
          const dp=primaryCompletionUpper(primaryCompletion,selectedIds,depth),upper=dp===null?old:old===null?dp:Math.min(old,dp);
          options.sampleResidual?.({ids:selectedIds.slice(),depth,slots:slots.slice(),upper});
          if(upper!==null&&upper<options.residualTarget)return 'objective';
          if(heap.length===context.topK){
            if(avoid){const upper=avoidUpper(avoid,avoidState,depth);if(upper!==null&&upper+slack(upper,heap[0].secondaryRankScore)<heap[0].secondaryRankScore)return 'objective';}
            else if(magic)return magicBoundKind(depth,heap[0].secondaryRankScore);
          }
          return null;
        }`);
 replace('        if(!evaluation.feasible) {',`        if(options.residualTarget!==undefined&&evaluation.score!==options.residualTarget)return;
        options.observeFormal?.(evaluation,selectedIds.slice());
        if(!evaluation.feasible) {`);
 replace('  global.MOEOptimizerV2BranchAndBound=Object.freeze({run,',`  function strataInspector(reduction,preparedProof=null){return contextApi().withRuntime(reduction.context,()=>{
    const proof=preparedProof||skillPotentialProof(prepare(reduction)),cache=new Map();
    function bound(ids,remaining){const key=JSON.stringify(remaining);let dp=cache.get(key);if(!cache.has(key)){dp=preparePrimaryCompletion(proof,remaining);cache.set(key,dp);}
      const old=groupPotentialUpper(proof,ids,remaining).upper,coupled=primaryCompletionUpper(dp,ids,0);return coupled===null?old:Math.min(old,coupled);}
    return {proof,cache,bound};});}
  global.MOEOptimizerV2BranchAndBound=Object.freeze({strataInspector,run,`);
 vm.runInContext(code,p);return p;
}
function run(B,r,options={},limit=90000){const signal=options.signal||{aborted:false},start=performance.now(),controller=B.run(r,{...options,cooperative:true,signal});let result;
 try{for(;;){if(performance.now()-start>limit)signal.aborted=true;const q=controller.step();if(q.done){result=q.value;break;}}}finally{controller.close();}
 return {result,elapsedMs:performance.now()-start};}
const top=x=>json(x.results.map((v,i)=>({rank:i+1,primary:v.score,secondary:v.secondaryScore,key:v.performanceKey,ids:v.candidateIds.slice().sort()})));
function filter(B,r,P,preparedProof=null){const start=performance.now(),ins=B.strataInspector(r,preparedProof),slots=r.context.slots,keep=new Set(),slotRows=[];
 for(const slot of slots){const cs=r.candidates.filter(c=>c.slot===slot),remaining=slots.filter(s=>s!==slot),fixed=r.context.fixedCandidateIds.filter(id=>r.candidates.find(c=>c.candidateId===id)?.slot!==slot);
   for(const c of cs){const upper=ins.bound([...fixed,c.candidateId],remaining);if(upper===null||upper>=P)keep.add(c.candidateId);}
   const nullUpper=ins.bound(fixed,remaining),survivors=cs.filter(c=>keep.has(c.candidateId));
   slotRows.push({slot,before:cs.length,after:survivors.length,nullUpper,nullRetained:nullUpper===null||nullUpper>=P,
     classification:cs.every(c=>ins.proof.byId.get(c.candidateId)===0)?'no-positive-primary-source (conflict relevance unproved)':nullUpper!==null&&nullUpper<P?'primary-required-set':'primary-preserving-alternatives',
     preservingIds:survivors.map(c=>c.candidateId)});
 }
 const residual={...r,candidates:r.candidates.filter(c=>keep.has(c.candidateId)),contextEquivalentClasses:r.contextEquivalentClasses.filter(c=>keep.has(c.representativeCandidateId))};
 const proof={...ins.proof,sourceListsBySlot:new Map(slots.map(s=>[s,residual.candidates.filter(c=>c.slot===s).map(c=>ins.proof.sourcesById.get(c.candidateId))])),bySlot:new Map(slots.map(s=>[s,Math.max(0,...residual.candidates.filter(c=>c.slot===s).map(c=>ins.proof.byId.get(c.candidateId)))]))};
 return {residual,ins,proof,slots:slotRows,elapsedMs:performance.now()-start};
}
if(require.main===module){(async()=>{
 const p=runtime(),C=p.MOEOptimizerV2SearchContext,B=p.MOEOptimizerV2BranchAndBound,items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p);
 const data={head:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),catalog:items.length,production:false,cases:[]},save=()=>fs.writeFileSync('docs/optimizer-v2-phase4H-diagnostic.json',JSON.stringify(data,null,2));
 // Warm facet projection separately; both algorithms share identical preparation.
 let t=performance.now();items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));data.facetWarmupMs=performance.now()-t;save();
 t=performance.now();const primary=C.create({objective:{metric:'skillPlus',skillName:'破壊魔法'},topK:1,baseState:base}),primaryPrep=p.MOEOptimizerV2FacetSearch.prepare(items,primary);data.primaryPreparationMs=performance.now()-t;
 const pr=run(B,primaryPrep.reduction,{candidateOrder:'potential'});assert.equal(pr.result.diagnostics.exact,true);const P=pr.result.results[0].score;data.primary={score:P,elapsedMs:pr.elapsedMs,diagnostics:json(pr.result.diagnostics)};save();console.log('PRIMARY',P,pr.elapsedMs);
 for(const metric of ['magic','avoid']){
  const context=C.create({objective:primary.objective,secondary:{metric},topK:20,baseState:base});t=performance.now();const prep=p.MOEOptimizerV2FacetSearch.prepare(items,context),preparationMs=performance.now()-t,r=prep.reduction;
  const row={metric,preparationMs,classes:r.candidates.length};data.cases.push(row);save();
  const before=run(B,r);row.before={elapsedMs:before.elapsedMs,diagnostics:json(before.result.diagnostics),top:top(before.result)};save();console.log('BEFORE',metric,before.elapsedMs,before.result.diagnostics.exact);
  const f=filter(B,r,P);row.filter={elapsedMs:f.elapsedMs,classes:f.residual.candidates.length,slots:f.slots};save();
  const after=run(B,f.residual,{residualTarget:P});row.after={elapsedMs:after.elapsedMs,totalMs:pr.elapsedMs+f.elapsedMs+after.elapsedMs,diagnostics:json(after.result.diagnostics),top:top(after.result)};
  row.P0DistinctLowerBound=after.result.results.length;row.P0CountMethod='lower bound from distinct formal result keys; no claim of exhaustive count';
  row.parity=JSON.stringify(row.before.top)===JSON.stringify(row.after.top);assert.ok(row.parity);assert.equal(after.result.diagnostics.exact,true);save();console.log('AFTER',metric,f.residual.candidates.length,after.elapsedMs,row.after.totalMs,'PARITY',row.parity);
 }
 data.completed=true;save();
})().catch(e=>{console.error(e);process.exitCode=1;});}
function maximum(p,r){
 const C=p.MOEOptimizerV2SearchContext,c=r.context,context=C.create({objective:c.objective,baseState:c.baseState,skillSim:c.skillSim,inputs:c.inputs,runtime:c.runtime,slots:c.slots,topK:1,race:c.race,gender:c.gender,fixedCandidateIds:c.fixedCandidateIds,excludedCandidateIds:c.excludedCandidateIds,ownedOnly:c.ownedOnly,ownedCandidateIds:c.ownedCandidateIds});
 let preparation,certificate=null;const signal={aborted:false};
 const search=run(p.MOEOptimizerV2BranchAndBound,{...r,context},{signal,candidateOrder:'potential',capturePrimaryPreparation:x=>preparation=x,maximumCertificate:x=>{if(x.score===x.upper){certificate=x;signal.aborted=true;}}});
 return {...search,preparation,certificate,score:certificate?.score??search.result.results[0]?.score,maximumExact:!!certificate||search.result.diagnostics.exact};
}
module.exports={runtime,run,filter,top,json,maximum};
