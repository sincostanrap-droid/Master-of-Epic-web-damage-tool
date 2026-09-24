const assert=require('node:assert/strict');
const vm=require('node:vm');
const {context,json}=require('../tools/benchmark-optimizer.cjs');
const p=context();
const st=vm.runInContext(`state=DEFAULT_STATE();state.equipment=normalizeEquipmentRows(['防具: パンツ','防具: 肩','防具: 腰','装飾: 顔'].map(slot=>({slot,name:'test-'+slot,enabled:false,attack:5,extraAttackDelay:-2})));state.composite=normalizeCompositeRows([{name:'test-base',enabled:true,fixed:true,extraAttackDelay:-60,extraCritRatePct:100},{name:'test-damage',enabled:false,dmgPct:10,extraAttackDelay:-10}]);state`,p);
const base={state:json(st),inputs:{raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponWeight:5,weaponSkill:100,techMultiplier:1,atkCap:500,targetAC:0},settings:{objective:'damage',requireAttackDelay60:true,requireCritRate100:true,includeDisabledBuffs:true,maxSlots:24,topN:10,exactEquipmentLimit:3000,beamWidth:30,equipmentEvalLimit:30,buffMode:'fast',includeCurrentConfig:false}};
for(const mode of ['fast','local','beam']){
 const data=json(base);data.settings.buffMode=mode;
 const out=p.runOptimizerCore(data);assert.ok(out.results.length);
 const top=out.results[0];
 for(const slot of ['防具: パンツ','防具: 肩','防具: 腰','装飾: 顔']) assert.ok(top.equipmentIdxs.some(i=>data.state.equipment[i]?.slot===slot && data.state.equipment[i].name),'fills '+slot);
 assert.ok(top.compositeIdxs.includes(1),'damage Buff remains useful beyond -60');
 assert.equal(top.metrics.extraStats.extraAttackDelay,-78);
}
const settings={objective:'damage',requireAttackDelay60:true};
const m=delay=>({finalDamage:100,extraStats:{extraAttackDelay:delay},stats:{magic:0},slots:{total:0}});
assert.ok(p.optimizerCompareRankValues(p.optimizerEvaluationFromMetrics(m(-60),settings).rank,p.optimizerEvaluationFromMetrics(m(-70),settings).rank)>0,'equal damage favors smaller excess');
console.log('delay feasibility: four formerly empty slots + damage Buff selected in all 3 modes; excess only breaks ties OK');
