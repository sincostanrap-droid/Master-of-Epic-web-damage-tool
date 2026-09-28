const assert=require('node:assert/strict'),vm=require('node:vm');
const {context,json}=require('../tools/benchmark-optimizer.cjs');
for(const worker of [false,true]) {
 const p=context(undefined,{worker});
 const state=json(vm.runInContext('DEFAULT_STATE()',p));
 state.equipment=[];state.composite=[{name:'active',enabled:true,slot:true,flatAttack:25,tags:'test-group'}];
 state.other=[{name:'retired',enabled:true,tags:'test-group'}];
 const input={raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponSkill:100,atkCap:999,speed:300,atkPctMode:'baseCappedAdd',finalCap:1,techMultiplier:1};
 const a=p.computeMetrics(state,input);
 const b=p.computeMetrics({...state,other:[]},{...input,atkCap:500,speed:100,atkPctMode:'afterAdds',finalCap:0});
 assert.equal(a.finalDamage,b.finalDamage);assert.equal(a.slots.total,b.slots.total);
 assert.equal(a.atkPctMode,'afterAdds');assert.equal(a.atkCap,500);
 assert.equal(state.other.length,1);assert.equal(state.other[0].enabled,true);
 assert.equal(p.computeMetrics(state,{...input,atkCap:2500}).atkCap,2500);
 assert.equal(p.buffSlotCountForState({...state,composite:[]}).total,0);
 const settings={objective:'damage',maxSlots:24,topN:2,exactEquipmentLimit:100,buffMode:'local',includeDisabledBuffs:true,forceOtherBuffs:false};
 assert.ok(p.runOptimizerCore({state,inputs:input,settings}).results.length);
}
console.log('Compact settings: defaults, map caps, retired rows, optimizer and main/worker OK');
