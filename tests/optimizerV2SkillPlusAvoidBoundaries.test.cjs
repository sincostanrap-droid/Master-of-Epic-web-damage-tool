const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const C=p.MOEOptimizerV2SearchContext,S=p.MOEEquipmentSearchSpecification,R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound;
const original=p.catalogEquipmentToRow;p.catalogEquipmentToRow=(i,...a)=>Object.assign(original(i,...a),i.fixtureFields||{});
const project=i=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const slots=['防具: 頭','装飾: 胸','武器: 右手','武器: 左手'],json=x=>JSON.parse(JSON.stringify(x));
const skill='キック',base=vm.runInContext('DEFAULT_STATE()',p),activeSlots=slots.slice(0,3);
const item=(id,slot,fields)=>({catalogId:id,name:id,category:'defense',slot,fixtureFields:{equipBuffEnabled:true,equipBuffName:id,equipBuffTechnicId:id,...fields}});
const items=[item('target',slots[0],{extraEffects:[{key:'skillPlus',name:skill,value:10}],equipBuffExtraAvoid:10,equipBuffConflictGroups:'G',weaponReq:[{name:'刀剣',required:100}]}),item('bridge',slots[1],{equipBuffFlatAttack:100,equipBuffConflictGroups:'G,H'}),item('avoid',slots[2],{equipBuffExtraAvoid:20,equipBuffConflictGroups:'H'}),item('unrelated',slots[1],{equipBuffFlatAttack:3,equipBuffConflictGroups:'Z'})];
const snapshot=p.MOEOptimizerV2Candidates.generate({items}),target=snapshot.candidates.find(c=>c.catalogId==='target');
let runs=0;
function parity(context,options={},enabled=true){const prep=p.MOEOptimizerV2FacetSearch.prepare(items,context,{project}),oracle=new Map();
function visit(depth,chosen){if(depth===activeSlots.length){const e=C.evaluate(context,chosen,snapshot.sources);if(e.feasible){const d=R.describeConfiguration(prep.reduction,chosen.map(c=>c.candidateId));oracle.set(d.performanceKey,{primary:e.score,secondary:e.secondaryScore,key:d.performanceKey,ids:d.equipment.map(x=>x.selectedCandidate.candidateId).sort()});}return;}for(const c of [null,...snapshot.candidates.filter(c=>c.slot===activeSlots[depth])])visit(depth+1,c?[...chosen,c]:chosen);}
visit(0,[]);const expected=[...oracle.values()].sort((a,b)=>b.primary-a.primary||b.secondary-a.secondary||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,context.topK).map((v,i)=>({...v,rank:i+1}));
const result=B.run(prep.reduction,options);assert.equal(result.diagnostics.exact,true);assert.equal(result.diagnostics.lexicographic.enabled,enabled);assert.equal(result.diagnostics.avoidFastPath.enabled,enabled);
assert.deepEqual(json(result.results.map((v,i)=>{assert.equal(v.rankScore,v.score);assert.equal(v.secondaryRankScore,v.secondaryScore);return {primary:v.score,secondary:v.secondaryScore,key:v.performanceKey,ids:v.candidateIds.slice().sort(),rank:i+1};})),json(expected));runs++;return {prep,result};}
const create=extra=>C.create({objective:{metric:'skillPlus',skillName:skill},secondary:{metric:'avoid'},baseState:base,slots:activeSlots,topK:20,...extra});
const normal=parity(create());const classification=normal.prep.reduction.metricReducer.classification;
assert.equal(classification.find(c=>c.candidateId.includes(':bridge:')).interaction,true);
assert.equal(classification.find(c=>c.candidateId.includes(':unrelated:')).stage,'null-replaceable');
const naked=C.evaluate(create(),[],snapshot.sources),required=C.evaluate(create(),[target],snapshot.sources);assert.equal(required.score-naked.score,10);assert.equal(required.secondaryScore-naked.secondaryScore,10);
for(const k of [1,5,20])for(const field of ['fixedCandidateIds','excludedCandidateIds'])parity(create({topK:k,[field]:[target.candidateId]}));
parity(create(),{lexicographicFastPath:false},false);
parity(create({constraints:[{metric:'avoid',op:'gte',value:0}]}),{},false);
// Fractional skillPlus cannot use the audited integer primary proof.
items[0].fixtureFields.extraEffects[0].value=0.5;
const fractionalSnapshot=p.MOEOptimizerV2Candidates.generate({items}),fractional=C.create({objective:{metric:'skillPlus',skillName:skill},secondary:{metric:'avoid'},slots:[slots[0]],baseState:base,topK:1}),fractionalPrep=p.MOEOptimizerV2FacetSearch.prepare([items[0]],fractional,{project}),fractionalResult=B.run(fractionalPrep.reduction);
assert.equal(fractionalResult.diagnostics.lexicographic.enabled,false);assert.equal(fractionalResult.diagnostics.avoidFastPath.enabled,false);assert.equal(fractionalResult.results[0].score,C.evaluate(fractional,[fractionalSnapshot.candidates.find(c=>c.catalogId==='target')],fractionalSnapshot.sources).score);
const report={boundaryParityRuns:runs,rankAndIds:true,formalRequirementBuffs:true,interactionClosure:true,disconnectedBuffRemoved:true,fixedExcludedMultiSlot:true,minimumFallback:true,disabledFallback:true,fractionalFallback:true};fs.writeFileSync('docs/optimizer-v2-phase4F-1-boundaries.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
