const fs=require('node:fs'),vm=require('node:vm');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const mode=process.argv[2]||'after',output=process.argv[3]||`docs/optimizer-v2-phase4B-${mode}.json`,limit=Number(process.argv[4]||120),nodeLimit=Number(process.argv[5]||0);
const p=contextRuntime(),json=v=>JSON.parse(JSON.stringify(v));
for(const name of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${name}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p),warm=performance.now();
items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));
const context=p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'stat:magic'}],{topK:20}),{baseState:base});
const start=performance.now(),prepared=p.MOEOptimizerV2FacetSearch.prepare(items,context,{magicReduction:mode!=='before'}),setupMs=performance.now()-start,r=prepared.reduction;
const allClasses=mode==='before'?r.contextEquivalentClasses:p.MOEOptimizerV2FacetSearch.prepare(items,context,{magicReduction:false}).reduction.contextEquivalentClasses;
const effective=new Map(r.effectiveCandidates.map(e=>[e.candidateId,e]));
function classify(cls){const c=cls.representativeCandidate,e=effective.get(c.candidateId),row=p.MOEOptimizerV2Candidates.toEquipmentRow(c),buffs=e.proofBuffs;
 return {id:c.candidateId,name:c.name,slot:c.slot,aliases:cls.equivalentCandidateIds.length,directFlat:+row.magic||0,directPct:0,
  buffFlat:buffs.reduce((s,b)=>s+(+b.flatMagic||0),0),buffPct:buffs.reduce((s,b)=>s+(+b.magicPct||0),0),
  hasBuff:buffs.length>0,group:buffs.some(b=>p.resolveAllBuffRowsForGroups({composite:[b]}).groups.length),stack:e.proofStackKeys.some(Boolean),
  protected:e.protectedReasons.filter(x=>x!=='resolved-buff-interaction'),requirements:c.requirements,
  removed:r.magicReduction?.removed.some(v=>v.id===c.candidateId)||false};}
const audit=allClasses.map(classify);
function counts(list){return {classes:list.length,directFlat:list.filter(x=>x.directFlat!==0).length,directPct:0,
 buffFlat:list.filter(x=>x.buffFlat!==0).length,buffPct:list.filter(x=>x.buffPct!==0).length,
 group:list.filter(x=>x.group).length,stack:list.filter(x=>x.stack).length,
 interactionOrConservativeOnly:list.filter(x=>!x.directFlat&&!x.buffFlat&&!x.buffPct&&x.hasBuff).length,
 structuralOnly:list.filter(x=>!x.directFlat&&!x.buffFlat&&!x.buffPct&&!x.hasBuff).length,
 unknownProtected:list.filter(x=>x.protected.length).length};}
const data={mode,context:json(context),facetColdMs:start-warm,setupMs,pipeline:json(prepared.diagnostics),hardFiltered:r.filtered.length,
 reduction:json(r.magicReduction),audit:counts(audit),slotBefore:Object.fromEntries(context.slots.map(s=>[s,counts(audit.filter(x=>x.slot===s))])),
 slotAfter:Object.fromEntries(context.slots.map(s=>[s,counts(audit.filter(x=>x.slot===s&&!x.removed))])),classes:audit};
fs.writeFileSync(output,JSON.stringify(data,null,2));console.log(mode+' prepared '+r.candidates.length+' classes '+setupMs/1000+'s');
const signal={aborted:false},searchStart=performance.now(),controller=p.MOEOptimizerV2BranchAndBound.run(r,{cooperative:true,signal,magicBound:mode!=='before',profileSearch:true,profileEvaluation:true});let last=0;
try{while(true){const next=controller.step();if(next.done){data.elapsedMs=performance.now()-searchStart;data.diagnostics=json(next.value.diagnostics);
 data.top=json(next.value.results.map(v=>({score:v.score,key:v.performanceKey,ids:v.candidateIds,aliases:v.equipment.map(e=>[e.slot,e.equivalentCandidateIds]),names:v.equipment.map(e=>[e.slot,e.selectedCandidate.name])})));
 data.formalParity=next.value.results.every(v=>{const e=p.MOEOptimizerV2SearchContext.evaluate(context,v.candidateIds.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id)),prepared.snapshot.sources);return e.score===v.score&&JSON.stringify(e.metrics)===JSON.stringify(v.metrics);});break;}
 const elapsed=performance.now()-searchStart;if(elapsed-last>15000){last=elapsed;console.log(next.value.searchNodes+' nodes '+next.value.completeConfigurationsEvaluated+' formal '+Math.round(elapsed/1000)+'s');}
 if(elapsed>=limit*1000||nodeLimit&&next.value.searchNodes>=nodeLimit)signal.aborted=true;
}}finally{controller.close();}
fs.writeFileSync(output,JSON.stringify(data,null,2));console.log(JSON.stringify({exact:data.diagnostics.exact,seconds:data.elapsedMs/1000,nodes:data.diagnostics.searchNodes,formal:data.diagnostics.completeConfigurationsEvaluated,prune:data.diagnostics.boundPrunedNodes,unknown:data.diagnostics.magicUpperBound.unknown,top:data.top.map(v=>v.score)}));
