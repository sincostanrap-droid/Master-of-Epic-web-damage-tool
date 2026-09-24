const assert = require('node:assert/strict');
const vm = require('node:vm');
const {context, json} = require('../tools/benchmark-optimizer.cjs');
for (const worker of [false, true]) {
  const p = context(undefined, {worker});
  const original = json(vm.runInContext(`(() => {
    const s = DEFAULT_STATE();
    s.equipment = normalizeEquipmentRows([
      {slot:'防具: 頭', name:'attack head', enabled:true, attack:100},
      {slot:'防具: 頭', name:'delay head', enabled:false, extraAttackDelay:-60},
      {slot:'防具: 腰', name:'positive waist', enabled:false, attack:5},
      {slot:'防具: 腰', name:'excluded waist', enabled:false, attack:200, optimizerExcluded:true}
    ]);
    s.composite = normalizeCompositeRows([
      {name:'delay buff', enabled:true, extraAttackDelay:-60},
      {name:'critical buff', enabled:true, extraCritRatePct:100}
    ]);
    return s;
  })()`, p));
  const inputs = {raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponSkill:100,techMultiplier:1,atkCap:500,targetAC:0};
  const settings = {objective:'damage', requireAttackDelay60:true, requireCritRate100:true,
    maxSlots:24, topN:3, beamWidth:1, equipmentEvalLimit:1, exactEquipmentLimit:1,
    localPasses:2, buffBeamWidth:10, includeDisabledBuffs:true,
    evaluateCurrentEquipment:true, includeCurrentConfig:true, onlyBetterThanCurrent:true};
  const names = (result, state) => json(result.equipmentIdxs.map(i=>state.equipment[i]?.name).filter(Boolean));
  for (const buffMode of ['fast','local','beam']) {
    const payload = {state:json(original),inputs,settings:{...settings,buffMode}};
    const before = json(payload);
    const out = p.runOptimizerCore(payload);
    assert.deepEqual(json(payload), before, 'input unchanged');
    const best = out.results[0];
    assert.deepEqual(names(best, original), ['attack head','positive waist'], `fills empty waist: worker=${worker} ${buffMode}`);
    assert.ok(best.metrics.extraStats.extraAttackDelay <= -60);
    assert.ok(best.metrics.extraStats.extraCritRatePct >= 100);
    assert.ok(best.metrics.slots.total <= 24);
    const exact = p.runOptimizerCore({...payload,settings:{...payload.settings,exactEquipmentLimit:1000}});
    assert.equal(best.metrics.finalDamage, exact.results[0].metrics.finalDamage, 'matches exhaustive result');
  }
  // Replacing an occupied weaker slot must work too.
  const occupied = json(original);
  occupied.equipment.push({...occupied.equipment.find(r=>r.name==='positive waist'),name:'weak waist',attack:1,enabled:true});
  const replacement = p.runOptimizerCore({state:occupied,inputs,settings:{...settings,buffMode:'local'}});
  assert.deepEqual(names(replacement.results[0],occupied),['attack head','positive waist']);
  occupied.equipment.at(-1).optimizerFixed=true;
  const fixed = p.runOptimizerCore({state:occupied,inputs,settings:{...settings,buffMode:'local'}});
  assert.ok(fixed.results.every(r=>names(r,occupied).includes('weak waist')), 'fixed equipment preserved');
  const excluded = json(original);
  excluded.equipment.find(r=>r.name==='positive waist').optimizerExcluded=true;
  const noWaist = p.runOptimizerCore({state:excluded,inputs,settings:{...settings,buffMode:'local'}});
  assert.ok(noWaist.results.every(r=>!names(r,excluded).some(n=>n.includes('waist'))), 'excluded candidates stay excluded');
}
console.log('equipment refinement: empty slot, replacement, fixed/excluded, requirements, all Buff modes and worker parity OK');
