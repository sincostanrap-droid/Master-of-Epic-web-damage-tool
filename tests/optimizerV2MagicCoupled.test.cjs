const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {completionRuntime,slotOrder,choiceOrder}=require('../tools/optimizer-v2-magic-completion-runtime.cjs');
const {p,B}=completionRuntime(),C=p.MOEOptimizerV2SearchContext,S=p.MOEEquipmentSearchSpecification,E=p.MOEOptimizerV2EffectiveCandidates,json=x=>JSON.parse(JSON.stringify(x));
const original=p.catalogEquipmentToRow;p.catalogEquipmentToRow=(i,...a)=>Object.assign(original(i,...a),i.fixtureFields||{});
const project=i=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const slots=['防具: 頭','装飾: 胸','武器: 右手','武器: 左手'];
const item=(id,slot,fields)=>({catalogId:id,name:id,category:'defense',slot,fixtureFields:fields}),buff=(id,slot,fields)=>item(id,slot,{equipBuffEnabled:true,equipBuffName:id,equipBuffTechnicId:id,...fields});
const identity=v=>({score:v.score,key:v.performanceKey,ids:v.candidateIds.slice().sort(),aliases:v.equipment.map(e=>[e.slot,e.equivalentCandidateIds]).sort()});
let coupledChecks=0,partials=0,violations=0,replacementBounds=0,formalCalls=0,parityRuns=0,formalParity=0;
for(const [negative,spirit] of [[false,0],[true,0],[false,70],[true,70],[false,140],[false,10]]){
 const base=vm.runInContext('DEFAULT_STATE()',p);base.skillSim.skills['精神力']=spirit;base.pct=[{enabled:true,target:'magic',percent:negative?-120:7}];
 base.composite=[{enabled:true,name:'fixed-external',flatMagic:7,magicPct:11,tags:'G',stackRule:'latest'}];
 const items=[item('h-high',slots[0],{magic:20,extraAC:100,armorRequirements:[{name:'着こなし',required:100}]}),buff('h-percent',slots[0],{equipBuffMagicPct:20}),item('h-both',slots[0],{magic:12,equipBuffEnabled:true,equipBuffName:'both',equipBuffMagicPct:12}),item('h-negative',slots[0],{magic:-30}),
 buff('c-G',slots[1],{equipBuffFlatMagic:8,equipBuffMagicPct:15,equipBuffConflictGroups:'G',equipBuffStackRule:'latest'}),buff('c-GH',slots[1],{equipBuffMagicPct:negative?-160:25,equipBuffConflictGroups:'G,H'}),buff('c-zero',slots[1],{equipBuffFlatAttack:100,equipBuffConflictGroups:'G',equipBuffMagicPct:-30}),
 item('r-req',slots[2],{magic:20,weaponDamage:50,weaponReq:[{name:'刀剣',required:100}]}),buff('r-two',slots[2],{equipBuffFlatMagic:5,equipBuffMagicPct:15,weaponTwoHanded:'○',equipBuffTechnicId:'X',weaponDamage:10}),item('r-flat',slots[2],{magic:8}),
 buff('l-X',slots[3],{equipBuffFlatMagic:9,equipBuffTechnicId:'X'}),buff('l-H',slots[3],{equipBuffMagicPct:8,equipBuffConflictGroups:'H'}),item('l-negative',slots[3],{magic:-15})];
 const ctx=S.toContext(S.create([{key:'stat:magic'}],{slots,topK:20}),{baseState:base}),prep=p.MOEOptimizerV2FacetSearch.prepare(items,ctx,{project,magicReduction:false}),r=prep.reduction,ins=B.completionInspector(r),m=B.orderingMeasures(r),records=[],topMap=new Map();
 function visit(depth,chosen){let max=-Infinity;if(depth===slots.length){const e=C.evaluate(ctx,chosen,prep.snapshot.sources);formalCalls++;if(e.feasible){max=e.score;const d=E.describeConfiguration(r,chosen.map(c=>c.candidateId));topMap.set(d.performanceKey,{score:e.score,performanceKey:d.performanceKey,candidateIds:d.equipment.map(x=>x.selectedCandidate.candidateId),equipment:d.equipment});}}
 else for(const c of [null,...prep.snapshot.candidates.filter(c=>c.slot===slots[depth])])max=Math.max(max,visit(depth+1,c?[...chosen,c]:chosen));
 records.push({depth,ids:chosen.map(c=>c.candidateId),max});return max;}
 visit(0,[]);const expected=[...topMap.values()].sort((a,b)=>b.score-a.score||(a.performanceKey<b.performanceKey?-1:a.performanceKey>b.performanceKey?1:0));
 const controller=B.run(r,{cooperative:true,fixedSlotOrder:slotOrder(m,'potential',slots),diagnosticChoiceOrder:choiceOrder(m,'completion')});
 let cooperative;try{for(;;){const next=controller.step();if(next.done){cooperative=next.value;break;}}}finally{controller.close();}
 assert.equal(cooperative.diagnostics.exact,true);assert.deepEqual(json(cooperative.results.map(identity)),json(expected.slice(0,20).map(identity)));
 for(const x of records){const rem=slots.slice(x.depth),coupled=B.inspectMagicCoupled(r,x.ids,rem);if(coupled.upper!==null){coupledChecks++;assert.ok(coupled.upper>=x.max,JSON.stringify({x,coupled}));}const old=ins.upper(x.ids,rem).upper;assert.ok(old>=x.max);for(const count of [2,3]){const j=ins.joint(x.ids,rem,Math.min(count,rem.length));assert.ok(j.upper>=x.max,JSON.stringify({x,j}));const preparedJoint=ins.jointPrepared(x.ids,rem,Math.min(count,rem.length));assert.equal(preparedJoint.upper,j.upper);replacementBounds++;}partials++;}
 for(const k of [1,5,20]){const context=S.toContext(S.create([{key:'stat:magic'}],{slots,topK:k}),{baseState:base}),reduction={...r,context},proof=B.completionInspector(reduction),expect=json(expected.slice(0,k).map(identity));
 for(const mode of ['none','old','coupled','joint2','joint3','jointPrepared2','jointPrepared3','coupledStrong'])for(const order of ['current','potential']){const result=B.run(reduction,{magicCoupledBound:mode.startsWith('coupled'),boundMode:mode==='none'?'none':undefined,fixedSlotOrder:slotOrder(m,order,slots),diagnosticChoiceOrder:choiceOrder(m,order==='current'?'current':'completion'),strongCompletion:(mode.startsWith('joint')||mode==='coupledStrong')?(ids,rem)=>proof[mode.includes('Prepared')||mode==='coupledStrong'?'jointPrepared':'joint'](ids,rem,Math.min(mode==='coupledStrong'?2:+mode.at(-1),rem.length)).upper:undefined});assert.equal(result.diagnostics.exact,true);assert.deepEqual(json(result.results.map(identity)),expect);parityRuns++;
 for(const v of result.results){const e=C.evaluate(context,v.candidateIds.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(reduction,id)),prep.snapshot.sources);assert.equal(e.score,v.score);formalParity++;}}
 }
}
const nullBase=vm.runInContext('DEFAULT_STATE()',p);nullBase.skillSim.skills['精神力']=70;
const nullContext=S.toContext(S.create([{key:'stat:magic'}],{slots:[slots[0]],topK:1}),{baseState:nullBase});
const nullPrep=p.MOEOptimizerV2FacetSearch.prepare([item('negative-only',slots[0],{magic:-20}),buff('negative-percent-only',slots[0],{equipBuffMagicPct:-30})],nullContext,{project,magicReduction:false});
const nullResult=B.run(nullPrep.reduction);assert.equal(nullResult.diagnostics.exact,true);assert.equal(nullResult.results[0].candidateIds.length,0);
// Formal flat sum and baseline addition have different cancellation order.
// Its rounding residue must be amplified by the percentage error budget.
const cancelBase=vm.runInContext('DEFAULT_STATE()',p);
cancelBase.flat=[1,1,-1e16].map(value=>({enabled:true,target:'magic',value}));
cancelBase.pct=[{enabled:true,target:'magic',percent:1e102}];
const cancelContext=C.create({objective:'magic',slots:[slots[0]],topK:1,baseState:cancelBase,inputs:{spirit:1e16}});
const cancelPrep=p.MOEOptimizerV2FacetSearch.prepare([],cancelContext,{project,magicReduction:false});
const actualCancellation=C.evaluate(cancelContext,[],cancelPrep.snapshot.sources),cancellation=B.inspectMagicCoupled(cancelPrep.reduction);
assert.ok(actualCancellation.score>1e100);assert.ok(cancellation.upper>=actualCancellation.score);
assert.ok(partials>=1000);assert.ok(coupledChecks>=1000);const result={coupledChecks,partialStates:partials,jointBoundsChecked:replacementBounds,safetyViolations:violations,independentFormalCompletions:formalCalls,parityRuns,formalReevaluations:formalParity,K:[1,5,20],modes:['none','old','coupled','joint2','joint3','jointPrepared2','jointPrepared3','coupledStrong'],cooperativeParity:true,nullOptimal:true,nullNegativePercentGroupsStackOccupancyRequirementsExternal:true};fs.writeFileSync('docs/optimizer-v2-phase4B-4-fixtures.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
