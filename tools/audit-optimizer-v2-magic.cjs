const fs=require('node:fs'),vm=require('node:vm');const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
for(const name of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${name}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p),context=p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'stat:magic'}],{topK:20}),{baseState:base});
const snapshot=p.MOEOptimizerV2Candidates.generate({items}),filtered=snapshot.candidates.filter(c=>p.MOEOptimizerV2EffectiveCandidates.filterReason(c,snapshot.sources[c.sourceRef],context));
const prepared=p.MOEOptimizerV2FacetSearch.prepare(items,context,{magicReduction:false});
const byId=new Map(prepared.reduction.effectiveCandidates.map(e=>[e.candidateId,e]));
const records=prepared.reduction.contextEquivalentClasses.flatMap(cls=>cls.equivalentCandidates.map(candidate=>{const prototype=byId.get(cls.representativeCandidateId),e={...prototype,candidateId:candidate.candidateId,originalCandidate:candidate};const row=p.MOEOptimizerV2Candidates.toEquipmentRow(e.originalCandidate),b=e.proofBuffs;
 return {id:e.candidateId,name:e.originalCandidate.name,slot:e.originalCandidate.slot,direct:+row.magic||0,flat:b.reduce((s,x)=>s+(+x.flatMagic||0),0),pct:b.reduce((s,x)=>s+(+x.magicPct||0),0),buff:b.length>0,group:b.some(x=>p.resolveAllBuffRowsForGroups({composite:[x]}).groups.length),stack:e.proofStackKeys.some(Boolean),protected:e.protectedReasons.filter(x=>x!=='resolved-buff-interaction')};}));
const data={catalog:items.length,hardPrefilter:items.length-filtered.length,filtered:filtered.map(c=>({id:c.candidateId,name:c.name})),facetRelevant:prepared.snapshot.candidates.length,
 candidateCounts:{direct:records.filter(x=>x.direct!==0).length,buffFlat:records.filter(x=>x.flat!==0).length,buffPct:records.filter(x=>x.pct!==0).length,formalRelevantUnion:records.filter(x=>x.direct!==0||x.flat!==0||x.pct!==0).length,group:records.filter(x=>x.group).length,stack:records.filter(x=>x.stack).length,protected:records.filter(x=>x.protected.length).length},
 reducer:prepared.reduction.magicReduction,records};
fs.writeFileSync('docs/optimizer-v2-phase4B-candidate-audit.json',JSON.stringify(data,null,2));console.log(JSON.stringify({catalog:data.catalog,hardPrefilter:data.hardPrefilter,selected:data.facetRelevant,candidates:data.candidateCounts}));
