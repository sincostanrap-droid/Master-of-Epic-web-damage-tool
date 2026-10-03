const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {runtime,slotModes,candidateModes,slotOrder,choiceOrder,observation}=require('../tools/optimizer-v2-magic-ordering-runtime.cjs');const {p,B,original}=runtime(),S=p.MOEEquipmentSearchSpecification,C=p.MOEOptimizerV2SearchContext,E=p.MOEOptimizerV2EffectiveCandidates;
const toRow=p.catalogEquipmentToRow;p.catalogEquipmentToRow=(i,...args)=>Object.assign(toRow(i,...args),i.fixtureFields||{});
const project=i=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const slots=['防具: 頭','武器: 右手','武器: 左手'],item=(id,slot,f)=>({catalogId:id,name:id,slot,category:'defense',fixtureFields:f}),buff=(id,slot,f)=>item(id,slot,{equipBuffEnabled:true,equipBuffName:id,equipBuffTechnicId:id,...f}),json=x=>JSON.parse(JSON.stringify(x));
const id=x=>({score:x.score,key:x.performanceKey,equipment:x.equipment.map(e=>({slot:e.slot,id:e.selectedCandidate.candidateId,aliases:e.equivalentCandidateIds})).sort((a,b)=>a.slot<b.slot?-1:1)});let runs=0,partials=0,formal=0;
for(const negative of [false,true]){
 const base=vm.runInContext('DEFAULT_STATE()',p);base.skillSim.skills['精神力']=30;base.composite=[{enabled:true,name:'fixed',flatMagic:negative?-8:3,magicPct:negative?-120:5,tags:'G',stackRule:'latest'}];
 const items=[item('h10',slots[0],{magic:10}),item('h6',slots[0],{magic:6}),item('h6-alias',slots[0],{magic:6,armorRequirements:[{name:'着こなし',required:100}]}),
 buff('r-flat',slots[1],{magic:15,equipBuffFlatMagic:4,equipBuffConflictGroups:'G',equipBuffTechnicId:'X',weaponDamage:20,weaponReq:[{name:'刀剣',required:100}]}),
 buff('r-pct',slots[1],{magic:2,equipBuffMagicPct:20,equipBuffConflictGroups:'G,H',weaponDamage:10,weaponTwoHanded:'○'}),item('r-neg',slots[1],{magic:-5,weaponDamage:5}),
 buff('l-flat',slots[2],{equipBuffFlatMagic:8,equipBuffTechnicId:'X'}),buff('l-zero',slots[2],{equipBuffFlatAttack:3,equipBuffConflictGroups:'G'}),item('l-negative',slots[2],{magic:-12})];
 const ctx=S.toContext(S.create([{key:'stat:magic'}],{slots,topK:20}),{baseState:base}),prep=p.MOEOptimizerV2FacetSearch.prepare(items,ctx,{project,magicReduction:false}),r=prep.reduction,m=B.orderingMeasures(r),all=new Map();
 function enumerate(depth,chosen){if(depth===slots.length){const e=C.evaluate(ctx,chosen,prep.snapshot.sources);formal++;if(e.feasible){const d=E.describeConfiguration(r,chosen.map(c=>c.candidateId));all.set(d.performanceKey,id({score:e.score,performanceKey:d.performanceKey,equipment:d.equipment}));}return;}
 for(const c of [null,...prep.snapshot.candidates.filter(c=>c.slot===slots[depth])])enumerate(depth+1,c?[...chosen,c]:chosen);}enumerate(0,[]);
 const expected=[...all.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,20);
 for(const sm of slotModes)for(const cm of candidateModes){const fixed=slotOrder(m,sm,slots),a=observation(),opts={fixedSlotOrder:fixed,diagnosticChoiceOrder:choiceOrder(m,cm),orderObservation:a},result=B.run(r,opts);assert.equal(result.diagnostics.exact,true);assert.deepEqual(json(result.results.map(id)),json(expected),sm+'/'+cm);assert.deepEqual(json(a.suffixOrder),json(fixed));runs++;
 // Inspect all suffix boundaries on the null-prefix relaxation. Fresh permutation for each call.
 for(let depth=0;depth<=slots.length;depth++){const upper=B.inspectMagic(r,[],fixed.slice(depth));assert.ok(upper&&Number.isFinite(upper.upper));partials++;}
 }
 const plain=original.run(r),diag=B.run(r);assert.deepEqual(json(plain.results.map(id)),json(diag.results.map(id)));for(const k of ['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes'])assert.equal(plain.diagnostics[k],diag.diagnostics[k]);
 for(const sm of slotModes){const result=B.run(r,{fixedSlotOrder:slotOrder(m,sm,slots),diagnosticChoiceOrder:choiceOrder(m,'completion'),boundMode:'none'});assert.deepEqual(json(result.results.map(id)),json(expected));}
}
const data={orderingRuns:runs,independentFormalCompletions:formal,suffixBoundaryChecks:partials,allTop20Parity:true,negativeRequirementsGroupsStackOccupancyAliasesExternal:true};fs.writeFileSync('docs/optimizer-v2-phase4B-2-fixtures.json',JSON.stringify(data,null,2));console.log(JSON.stringify(data));
