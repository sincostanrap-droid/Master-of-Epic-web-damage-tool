const assert=require('node:assert/strict');
const vm=require('node:vm');
const {context,json,root}=require('../tools/benchmark-optimizer.cjs');
const inputs={raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponSkill:100,atkCap:500,techMultiplier:1};
const effect=(value,name='回復魔法')=>({key:'skillPlus',name,value,scope:'display'});
const buff=(name,value,other={})=>({name,enabled:true,extraEffects:[effect(value)],...other});
const settings={maxSlots:24,topN:10,beamWidth:10,equipmentEvalLimit:5,exactEquipmentLimit:50,buffMode:'local',localPasses:2,objective:'skillPlus',skillPlusTargetSkill:'回復魔法',includeDisabledBuffs:true,forceOtherBuffs:false,includeCurrentConfig:false,evaluateCurrentEquipment:false,onlyBetterThanCurrent:false};
function make(p){const s=vm.runInContext('DEFAULT_STATE()',p);s.equipment=[];s.composite=[];return s;}
for(const worker of [false,true]){
 const p=context(root,{worker,catalog:!worker});
 const state=make(p);
 state.composite=[buff('weak',10,{tags:'same'}),buff('strong',20,{tags:'same'}),buff('off',100,{enabled:false}),buff('excluded',200,{excluded:true})];
 const before=json(state);
 assert.deepEqual(json(p.computeMetrics(state,inputs).skillPlusTotals),{'回復魔法':20});
 assert.deepEqual(json(state),before,'no mutation');
 // Local search previously pruned useful Buffs because it compared objects without selection indices.
 state.composite=[buff('first',10,{enabled:false}),buff('second',20,{enabled:false})];
 let out=p.runOptimizerCore({state,inputs,settings});
 assert.ok(out.results.length);assert.equal(out.results[0].metrics.skillPlusTotals['回復魔法'],30);
 assert.equal(out.results[0].skillPlusTotals['回復魔法'],30);
 // Target 20 must beat 30, instead of being overridden by raw-skill sorting.
 out=p.runOptimizerCore({state,inputs,settings:{...settings,targetValueRaw:'20'}});
 assert.equal(out.results[0].metrics.skillPlusTotals['回復魔法'],20);
 // A damage objective must still advance through partial skill conditions.
 out=p.runOptimizerCore({state,inputs,settings:{...settings,objective:'damage',skillPlusFilters:[{skill:'回復魔法',op:'gte',valueRaw:'30'}]}});
 assert.ok(out.results.length);assert.equal(out.results[0].metrics.skillPlusTotals['回復魔法'],30);
 out=p.runOptimizerCore({state,inputs,settings:{...settings,skillPlusFilters:[{skill:'回復魔法',op:'gte',valueRaw:'100'}]}});
 assert.equal(out.results.length,0,'impossible condition must not appear as success');
 // Delay requirement stays ahead of skillPlus, including the overshoot preference.
 state.composite=[buff('exact',10,{enabled:false,extraAttackDelay:-60,tags:'delay'}),buff('excess',50,{enabled:false,extraAttackDelay:-70,tags:'delay'})];
 out=p.runOptimizerCore({state,inputs,settings:{...settings,requireAttackDelay60:true}});
 assert.ok(out.results.length);assert.equal(out.results[0].metrics.extraStats.extraAttackDelay,-60);
 assert.equal(out.results[0].metrics.skillPlusTotals['回復魔法'],10);
 state.composite=[buff('first',10,{enabled:false}),buff('second',20,{enabled:false})];
 // Explicitly fixed OFF stays OFF; constraint not silently bypassed.
 state.composite[1].fixed=true;
 out=p.runOptimizerCore({state,inputs,settings});assert.equal(out.results[0].metrics.skillPlusTotals['回復魔法'],10);
}
const p=context(root,{catalog:true});
const item=p.equipmentCatalogItems().find(x=>x.buffRefs.includes('technic-14633'));
const row={...json(p.catalogEquipmentToRow(item)),enabled:true};
const st=make(p);st.equipment=[row,row];
assert.deepEqual(json(p.computeMetrics(st,inputs).skillPlusTotals),{'回復魔法':20,'自然調和':20},'same technic once');
st.equipment=[{...row,equipBuffEnabled:false}];assert.deepEqual(json(p.computeMetrics(st,inputs).skillPlusTotals),{});
console.log('optimizer skillPlus: resolved totals, target ordering, incremental constraints, fixed OFF and worker/main OK');
