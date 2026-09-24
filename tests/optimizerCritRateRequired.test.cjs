const assert = require('node:assert/strict');
const vm = require('node:vm');
const {context,json} = require('../tools/benchmark-optimizer.cjs');
const p = context();
const worker = context(undefined, {worker:true,data:false});
function payload() {
 const st = vm.runInContext(`state=DEFAULT_STATE();
 state.equipment=normalizeEquipmentRows([
 {slot:'防具:頭',name:'unused',enabled:false}
 ]);state.equipment=[];
 state.composite=normalizeCompositeRows([
 {name:'test-critical-60',enabled:false,extraCritRatePct:60},
 {name:'test-critical-50',enabled:false,extraCritRatePct:50},
 {name:'test-damage',enabled:false,flatAttack:30}
 ]);state`,p);
 return {state:json(st),inputs:{raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponWeight:5,weaponSkill:100,techMultiplier:1,atkCap:500,targetAC:0},settings:{objective:'damage',requireCritRate100:true,includeDisabledBuffs:true,maxSlots:24,topN:10,exactEquipmentLimit:3000,beamWidth:20,equipmentEvalLimit:20,buffMode:'fast',includeCurrentConfig:false}};
}
for (const mode of ['fast','local','beam']) {
 const data=payload();data.settings.buffMode=mode;
 const out=p.runOptimizerCore(data);
 assert.ok(out.results.length,mode+' finds an over-100 combination');
 assert.ok(out.results.every(r=>r.metrics.extraStats.extraCritRatePct>=100));
 assert.equal(out.results[0].metrics.extraStats.extraCritRatePct,110);
 assert.ok(out.results[0].compositeIdxs.includes(2),'damage still optimized after requirement');
 let w; worker.postMessage=m=>{if(m.type==='error')throw Error(m.message);if(m.type==='result') w=json(m);};
 worker.onmessage({data:json({type:'optimize',runId:1,payload:{...data,runtime:json(p.optimizerRuntimeSnapshot())}})});
 assert.deepEqual(json(out.results),w.results,mode+' Worker parity');
 const impossible=payload(); impossible.settings.buffMode=mode;impossible.state.composite[1].extraCritRatePct=39;
 assert.equal(p.runOptimizerCore(impossible).results.length,0,'99 is never a suggestion');
 const conflict=payload();conflict.settings.buffMode=mode;conflict.state.composite[0].tags='critical:test';conflict.state.composite[1].tags='critical:test';
 assert.equal(p.runOptimizerCore(conflict).results.length,0,'conflicting Buffs do not sum to 110');
}
const exact=payload();exact.state.composite[1].extraCritRatePct=40;
assert.equal(p.runOptimizerCore(exact).results[0].metrics.extraStats.extraCritRatePct,100);
const off=payload();off.settings.requireCritRate100=false;
assert.ok(p.runOptimizerCore(off).results.length,'OFF preserves unconstrained search');
const crit=payload();crit.settings.objective='extraCritRatePct';
assert.equal(p.runOptimizerCore(crit).results[0].metrics.extraStats.extraCritRatePct,110,'implicit 105 cap no longer rejects required search');
console.log('critical requirement: 99 rejected, 100/110 accepted, conflict handling, damage optimization, 3 search modes and Worker parity OK');
const both=payload();both.settings.requireAttackDelay60=true;
both.state.composite.push({name:'test-delay',enabled:false,extraAttackDelay:-60});
const combined=p.runOptimizerCore(both);
assert.ok(combined.results.length);
assert.ok(combined.results.every(r=>r.metrics.extraStats.extraCritRatePct>=100 && r.metrics.extraStats.extraAttackDelay<=-60));
const unreachableDelay=payload();unreachableDelay.settings.requireAttackDelay60=true;
assert.equal(p.runOptimizerCore(unreachableDelay).results.length,0,'both requirements must be satisfied');
console.log('critical + attack delay simultaneous requirement OK');
