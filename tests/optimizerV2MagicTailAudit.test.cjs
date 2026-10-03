/* Diagnostic fixtures for the unchanged magic Top-K contract. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const f of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${f}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const original=p.catalogEquipmentToRow;p.catalogEquipmentToRow=(i,...args)=>Object.assign(original(i,...args),i.fixtureFields||{});
const project=i=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const json=x=>JSON.parse(JSON.stringify(x)),out=[];
for(const [label,count,kind] of [['distinct',24,'distinct'],['maximum-21',21,'tie'],['maximum-19',19,'tie'],['key-only',24,'tie'],['candidate-ID-only',24,'alias']]){
 const items=Array.from({length:count+(kind==='tie'?3:0)},(_,i)=>({catalogId:`${label}-${i}`,name:`item ${i}`,slot:'防具: 頭',category:'defense',fixtureFields:{magic:kind==='distinct'?i+1:kind==='alias'?10:i<count?10:9,equipBuffEnabled:kind==='tie',equipBuffName:kind==='tie'?`nonmagic-${i}`:'',equipBuffFlatAttack:kind==='tie'?i+1:0}}));
 const context=p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'stat:magic'}],{slots:['防具: 頭'],topK:20}),{baseState:vm.runInContext('DEFAULT_STATE()',p)});
 const prepared=p.MOEOptimizerV2FacetSearch.prepare(items,context,{project,magicReduction:false}),all=new Map();
 for(const chosen of [[],...prepared.snapshot.candidates.map(c=>[c])]){const e=p.MOEOptimizerV2SearchContext.evaluate(context,chosen,prepared.snapshot.sources);if(!e.feasible)continue;const d=p.MOEOptimizerV2EffectiveCandidates.describeConfiguration(prepared.reduction,chosen.map(c=>c.candidateId));all.set(d.performanceKey,{score:e.score,key:d.performanceKey});}
 const expected=[...all.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,20);
 for(const enablePruning of [false,true]){const actual=p.MOEOptimizerV2BranchAndBound.run(prepared.reduction,{enablePruning});assert.equal(actual.diagnostics.exact,true);assert.deepEqual(json(actual.results.map(v=>({score:v.score,key:v.performanceKey}))),json(expected));}
 const histogram={};for(const r of expected)histogram[r.score]=(histogram[r.score]||0)+1;
 if(label==='maximum-21'||label==='key-only')assert.equal(histogram[10],20);
 if(label==='maximum-19'){assert.equal(histogram[10],19);assert.equal(histogram[9],1);}
 if(kind==='alias'){assert.equal(prepared.reduction.contextEquivalentClasses.length,1);assert.equal(prepared.reduction.contextEquivalentClasses[0].equivalentCandidateIds.length,24);assert.equal(expected.length,2);}
 out.push({label,raw:items.length,classes:prepared.reduction.contextEquivalentClasses.length,distinctConfigurations:all.size,top:expected.length,histogram,parity:true});
}
fs.writeFileSync('docs/optimizer-v2-phase4B-1.5-fixtures.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));
