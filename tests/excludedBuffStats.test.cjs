const assert=require('node:assert/strict'),vm=require('node:vm');
const {context,json}=require('../tools/benchmark-optimizer.cjs');
for(const worker of [false,true]){
 const p=context(undefined,{worker});const s=json(vm.runInContext('DEFAULT_STATE()',p));
 s.equipment=[{name:'equipment',slot:'防具: 頭',enabled:true,extraAttackDelay:-15}];
 s.composite=[{name:'rage',enabled:true,extraAttackDelay:-10},{name:'song',enabled:true,extraAttackDelay:-17,extraCritRatePct:100},
 {name:'excluded force step',enabled:true,excluded:true,extraAttackDelay:-20,dmgPct:10,extraCritRatePct:999,hpRegenPerMinute:123,extraHP:456,extraHPPct:10}];
 const inputs={raceSelect:'cognite',str:100,spirit:100,weaponDamage:92,weaponSkill:98};
 const before=json(s),m=p.computeMetrics(s,inputs);
 assert.equal(m.extraStats.extraAttackDelay,-42);assert.equal(m.extraStats.extraCritRatePct,100);
 assert.equal(m.extraStats.hpRegenPerMinute,0);assert.equal(m.extraStats.extraHP,0);assert.equal(m.extraStats.extraHPPct,0);
 assert.ok(p.optimizerFinalConstraintViolations(m,{requireAttackDelay60:true,requireCritRate100:true}).length);
 const removed=json(s);removed.composite.pop();assert.deepEqual(json(m),json(p.computeMetrics(removed,inputs)),'excluded row equals absent row');assert.deepEqual(json(s),before);
 s.composite[2].excluded=false;assert.equal(p.computeMetrics(s,inputs).extraStats.extraAttackDelay,-62,'enabled nonexcluded effect still applies');
}
console.log('excluded Buff stats: delay/crit/recovery/HP, required conditions, absent-row equivalence and main/worker OK');
