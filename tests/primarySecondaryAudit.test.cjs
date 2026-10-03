/* Exhaustive formal single-slot fixtures, not an alternate search implementation. */
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const path of ['src/domain/equipmentEffectFacets.js','src/domain/equipmentEffectFacetCatalog.js','src/domain/equipmentSearchSpecification.js','src/optimizer-v2/facetSearch.js'])vm.runInContext(fs.readFileSync(path,'utf8'),p);
const original=p.catalogEquipmentToRow;p.catalogEquipmentToRow=(i,...args)=>Object.assign(original(i,...args),i.fixtureFields||{});
const projection=i=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const order=(a,b)=>b.score-a.score||(b.secondaryScore??0)-(a.secondaryScore??0)||(a.key<b.key?-1:a.key>b.key?1:0),json=v=>JSON.parse(JSON.stringify(v));
const record=r=>({score:r.score,secondaryScore:r.secondaryScore,key:r.performanceKey});
const findings=[];
for(const [label,count,tie] of [['at-least-20',21,false],['exactly-19',19,false],['exactly-1',1,false],['multiple-levels',4,false],['secondary-tie',21,true],['equivalent-key-tie',21,true]]){
 const items=Array.from({length:count+22},(_,i)=>({catalogId:'case-'+i,name:'case '+i,slot:'防具: 頭',category:'defense',fixtureFields:{magic:tie?5:i+1,equipBuffEnabled:true,equipBuffName:'fixture-plus',extraEffects:[{key:'skillPlus',name:'破壊魔法',value:i<count?10:Math.max(0,9-Math.floor((i-count)/4)),scope:'display'}],...(tie&&label!=='equivalent-key-tie'?{tags:'fixture-distinct-'+i}:{})}}));
 const context=p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'skillPlus:破壊魔法'},{key:'stat:magic'}],{secondary:true,topK:20,slots:['防具: 頭']}),{baseState:vm.runInContext('DEFAULT_STATE()',p)}),prepared=p.MOEOptimizerV2FacetSearch.prepare(items,context,{project:projection});
 const rows=new Map();for(const candidates of [[],...prepared.snapshot.candidates.map(c=>[c])]){const e=p.MOEOptimizerV2SearchContext.evaluate(context,candidates,prepared.snapshot.sources);if(!e.feasible)continue;const d=p.MOEOptimizerV2MetricCandidateReducer.describeConfiguration(prepared.reduction,candidates.map(c=>c.candidateId));rows.set(d.performanceKey,{score:e.score,secondaryScore:e.secondaryScore,key:d.performanceKey});}
 const all=[...rows.values()],expected=all.sort(order).slice(0,20),max=Math.max(...all.map(r=>r.score)),optimal=all.filter(r=>r.score===max).sort(order),naive=optimal.slice(0,20);
 // Virtual score-level selection is diagnostic, never wired into production.
 const levels=[...new Set(all.map(r=>r.score))].sort((a,b)=>b-a),twoStage=[];for(const level of levels){twoStage.push(...all.filter(r=>r.score===level).sort(order).slice(0,20-twoStage.length));if(twoStage.length===20)break;}
 assert.deepEqual(twoStage,expected);assert.deepEqual(naive[0],expected[0]);if(optimal.length>=20)assert.deepEqual(naive,expected);else assert.notDeepEqual(naive,expected);
 for(const enablePruning of [false,true]){const actual=p.MOEOptimizerV2BranchAndBound.run(prepared.reduction,{enablePruning});assert.equal(actual.diagnostics.exact,true);assert.deepEqual(json(actual.results.map(record)),json(expected));}
 findings.push({label,requestedOptimalRows:count,distinctPrimaryOptimalBuilds:optimal.length,primaryMaximum:max,naivePStarOnlyPreservesTop20:optimal.length>=20,scoreLevelSelectionPreservesTop20:true});
}
fs.writeFileSync('docs/primary-secondary-two-stage-fixtures.json',JSON.stringify(findings,null,2)+'\n');console.log(JSON.stringify(findings));
