const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const C=p.MOEOptimizerV2SearchContext,R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound,original=p.catalogEquipmentToRow;
p.catalogEquipmentToRow=(i,...a)=>Object.assign(original(i,...a),i.fixtureFields||{});
const project=i=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const slot='防具: 頭',json=x=>JSON.parse(JSON.stringify(x));let runs=0;
for(const fixed of [false,true]){
 const base=vm.runInContext('DEFAULT_STATE()',p);if(fixed)base.pct=[{enabled:true,target:'magic',percent:1e-14}];
 const context=C.create({objective:'magic',secondary:{metric:'resistance',element:'Fire'},slots:[slot],baseState:base,topK:20});
 const items=[{catalogId:'large',name:'large',category:'defense',slot,fixtureFields:{magic:2e15,extraFireRes:1,...(!fixed?{equipBuffEnabled:true,equipBuffName:'tiny percentage',equipBuffMagicPct:1e-14}:{})}},{catalogId:'plain',name:'plain',category:'defense',slot,fixtureFields:{magic:2e15,extraFireRes:100}}];
 const prep=p.MOEOptimizerV2FacetSearch.prepare(items,context,{project}),snapshot=p.MOEOptimizerV2Candidates.generate({items}),oracle=new Map(),proof=B.inspectMagicPrimary(prep.reduction),members=new Map(prep.reduction.contextEquivalentClasses.flatMap(c=>c.equivalentCandidateIds.map(id=>[id,c.representativeCandidateId])));
 for(const chosen of [[],...snapshot.candidates.map(c=>[c])]){const e=C.evaluate(context,chosen,snapshot.sources),d=R.describeConfiguration(prep.reduction,chosen.map(c=>c.candidateId));oracle.set(d.performanceKey,{primary:e.score,secondary:e.secondaryScore,key:d.performanceKey,ids:d.equipment.map(x=>x.selectedCandidate.candidateId).sort()});const ids=chosen.map(c=>members.get(c.candidateId));assert.ok(proof.evaluate(ids,[])>=e.score);}
 const expected=[...oracle.values()].sort((a,b)=>b.primary-a.primary||b.secondary-a.secondary||(a.key<b.key?-1:a.key>b.key?1:0));assert.equal(expected[0].primary,2e15+0.25);
 for(const k of [1,5,20]){const result=B.run({...prep.reduction,context:C.create({objective:'magic',secondary:{metric:'resistance',element:'Fire'},slots:[slot],baseState:base,topK:k})});assert.equal(result.diagnostics.exact,true);assert.deepEqual(json(result.results.map(v=>({primary:v.score,secondary:v.secondaryScore,key:v.performanceKey,ids:v.candidateIds.slice().sort()}))),json(expected.slice(0,k)));runs++;}
}
const report={parityRuns:runs,onePlusPercentageRoundsToOne:true,formalAdditionChangesMagic:true,exactEqualityRefused:true,violations:0};fs.writeFileSync('docs/optimizer-v2-phase4F-2-precision.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
