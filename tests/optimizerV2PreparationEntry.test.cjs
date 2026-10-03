const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {runtime,json}=require('../tools/audit-optimizer-v2-phase4H-final-consistency.cjs');
const p=runtime(),A=p.MOEOptimizerV2Candidates,F=p.MOEOptimizerV2FacetSearch,C=p.MOEOptimizerV2SearchContext;
const items=p.equipmentCatalogItems().slice(0,40),context=C.create({objective:'avoid',topK:20});
const original=p.catalogEquipmentToRow;let conversions=0;p.catalogEquipmentToRow=(...args)=>{conversions++;return original(...args);};
(async()=>{
 for(const kind of ['catalog','policy']){
  const stop=new AbortController();let first,requests=0,before=conversions;
  const options={signal:stop.signal,onProgress:d=>{if(!first){first=d;assert.equal(d.processed,0);assert.equal(d.total,items.length);assert.equal(conversions,before,'No conversion before initial progress');setImmediate(()=>{requests++;stop.abort();});}}};
  await assert.rejects(kind==='catalog'?F.prepareAsync(items,context,options):A.generateAsync({items},options),e=>e.name==='AbortError');assert.equal(requests,1);assert.equal(conversions,before,'First yield allows stop before cold conversions');
 }
 const asyncSnapshot=await A.generateAsync({items}),syncSnapshot=A.generate({items});assert.deepEqual(json(asyncSnapshot),json(syncSnapshot));assert.ok(Object.isFrozen(asyncSnapshot));
 const prep=await F.prepareAsync(items,context);assert.equal((await F.run(prep)).diagnostics.exact,true);
 // Abort after complete row publication, before the candidate is built. Restart
 // must rebuild candidate:null rather than marking that incomplete entry complete.
 const cache=A.createCatalogPreparation(),entry=cache.read(items[0],'raw');assert.equal(entry.candidate,null);
 const stop=new AbortController();await assert.rejects(A.generateAsync({items,catalogPreparation:cache},{signal:stop.signal,onProgress:()=>stop.abort()}),e=>e.name==='AbortError');assert.equal(entry.candidate,null);
 const restarted=await A.generateAsync({items,catalogPreparation:cache});assert.deepEqual(json(restarted.candidates),json(syncSnapshot.candidates));assert.ok(Object.isFrozen(entry.candidate));
 console.log(JSON.stringify({immediateProgressAndTaskAbort:true,policyGenerationParity:true,partialRowCacheRestart:true,formalRestartExact:true}));
})().catch(e=>{console.error(e);process.exitCode=1;});
