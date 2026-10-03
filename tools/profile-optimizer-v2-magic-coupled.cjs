const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {completionRuntime}=require('./optimizer-v2-magic-completion-runtime.cjs'),{p,B}=completionRuntime({profile:true});
const base=vm.runInContext('DEFAULT_STATE()',p),items=p.equipmentCatalogItems();items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));
const context=p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'stat:magic'}],{topK:20}),{baseState:base}),prep=p.MOEOptimizerV2FacetSearch.prepare(items,context),r=prep.reduction;
const prior=JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4B-3-slack.json')),slots=prior.slotOrder,samples=prior.partials.filter(x=>x.depth===15&&x.max!==undefined).slice(0,8),runs=[];
for(const prepareCandidates of [false,true]){const ins=B.completionInspector(r,{prepareCandidates});ins.jointPrepared(samples[0].ids,slots.slice(15),2);for(const key of Object.keys(ins.profile))delete ins.profile[key];
 const start=performance.now();let pairCalls=0;for(let repeat=0;repeat<8;repeat++)for(const x of samples){const j=ins.jointPrepared(x.ids,slots.slice(15),2);pairCalls+=j.calls;assert.ok(j.upper>=x.max);}
 const totalMs=performance.now()-start,stages={...ins.profile};runs.push({prepareCandidates,queries:64,pairCalls,totalMs,stages,otherMs:totalMs-Object.values(stages).reduce((n,v)=>n+v,0)});
}
const data={runs,note:'Instrumentation changes cost. selectedMs includes candidate projection lookup, collect reconstruction (unless prepared), and bucket joins. fixedMs includes fixed collect/allocation; groupMs includes bucket arithmetic; otherMs includes pair enumeration, concatenation/allocation, table/cache lookup, clocks and validation. No prefix scalar-result cache; prepared suffix tables only.'};
fs.writeFileSync('docs/optimizer-v2-phase4B-4-profile.json',JSON.stringify(data,null,2));console.log(JSON.stringify(data));
