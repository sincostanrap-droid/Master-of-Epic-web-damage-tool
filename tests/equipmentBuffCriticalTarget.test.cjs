const assert = require('node:assert/strict');
const vm = require('node:vm');
const {context, json} = require('../tools/benchmark-optimizer.cjs');
const page = context(undefined, {catalog:true});
const worker = context(undefined, {worker:true, data:false});
const items = page.equipmentCatalogItems();
const rowFor = name => {
  const item = items.find(x => x.name === name);
  assert.ok(item, name + ' exists in actual catalog');
  return {...json(page.catalogEquipmentToRow(item)), enabled:true};
};
const wig = rowFor('サイドパート ウィッグ');
const spear = rowFor('フォルテイア・スピア');
const fur = rowFor('退魔の毛皮');
const inputs = {raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponWeight:5,atkCap:500,techMultiplier:1,attackType:'attack',allowCrit:true,critRate:1,critMultiplier:1.5,targetAC:0,targetRace:'demon'};
function calc(rows, composite=[], extraInputs={}) {
  page.__rows=json(rows);page.__buffs=json(composite);
  const st=vm.runInContext('state=DEFAULT_STATE(); state.equipment=normalizeEquipmentRows(__rows); state.composite=normalizeCompositeRows(__buffs); state',page);
  return json(page.computeMetrics(st, {...inputs,...extraInputs}));
}
const off=row=>({...row,equipBuffEnabled:false});
const equipOff=row=>({...row,enabled:false});
function near(actual,expected,message) {assert.ok(Math.abs(actual-expected)<1e-9,`${message}: ${actual} vs ${expected}`);}

// New imports and saved rows must both use reviewed values, including explicit zero.
assert.equal(wig.equipBuffExtraCritRatePct,30);
assert.equal(wig.equipBuffAttackPct,0);
assert.equal(spear.equipBuffExtraCritRatePct,20);
assert.equal(fur.equipBuffSpecialTarget,'demon');
const oldWig={...wig,equipBuffExtraCritRatePct:0,equipBuffAttackPct:5,equipBuffConflictGroup:'',equipBuffConflictGroups:'',tags:''};
const oldSpear={...spear,equipBuffExtraCritRatePct:15};
const oldFur={...fur,equipBuffSpecialTarget:'devil'};
for(const row of [wig,oldWig]) {
  const on=calc([row]);const disabled=calc([off(row)]);
  assert.equal(on.extraStats.extraCritRatePct,30);
  assert.equal(disabled.extraStats.extraCritRatePct,0);
  assert.equal(calc([equipOff(row)]).extraStats.extraCritRatePct,0);
  near(on.atk,disabled.atk,'night attack is not unconditional');
  near(on.rawDamage,disabled.rawDamage,'existing 100% critical damage model stays unchanged');
}
for(const row of [spear,oldSpear]) {
  const on=calc([row]);const disabled=calc([off(row)]);
  assert.equal(on.extraStats.extraCritRatePct,20);
  assert.equal(disabled.extraStats.extraCritRatePct,0);
  assert.equal(on.extraStats.extraAttackDelay,disabled.extraStats.extraAttackDelay,'spear-only delay is not common delay');
}
assert.equal(calc([oldWig,oldSpear]).extraStats.extraCritRatePct,50,'F and G stack');
assert.equal(calc([oldWig,{...oldWig,slot:'防具: 胴'}]).extraStats.extraCritRatePct,30,'same technic counts once');
for(const [row,group,base] of [[oldWig,'G',30],[oldSpear,'F',20]]) {
  const buff=value=>({enabled:true,name:'conflict fixture',slot:true,tags:`critical:${group}`,extraCritRatePct:value});
  assert.equal(calc([row],[buff(base-5)]).extraStats.extraCritRatePct,base,'weaker same group suppressed');
  assert.equal(calc([row],[buff(base+5)]).extraStats.extraCritRatePct,base+5,'stronger same group replaces');
}
for(const row of [fur,oldFur]) {
  const base=calc([off(row)]);
  const demon=calc([row]);
  assert.equal(demon.specialMultiplier,1.2);
  near(demon.rawDamage/base.rawDamage,1.2,'demon multiplier changes actual damage');
  near(demon.stats.magic/base.stats.magic,1.03,'magic +3% preserved');
  for(const race of ['dragon','chaos','undead','giant','goblin','bull','bird','']) assert.equal(calc([row],[],{targetRace:race}).specialMultiplier,1,`does not apply to ${race}`);
  assert.equal(calc([equipOff(row)]).specialMultiplier,1);
}
assert.equal(page.normalizeTargetRaceKey('devil'),'demon','old saved race alias');
const dragon={slot:'防具: 頭',enabled:true,equipBuffEnabled:true,equipBuffName:'fixture dragon',equipBuffSpecial:1.5,equipBuffSpecialTarget:'dragon',equipBuffConflictGroup:'special:latest',equipBuffStackRule:'latest'};
assert.equal(calc([dragon,oldFur]).specialMultiplier,1.2,'latest demon wins');
assert.equal(calc([oldFur,dragon]).specialMultiplier,1,'latest different race suppresses demon');
assert.equal(calc([oldFur,dragon],[],{targetRace:'dragon'}).specialMultiplier,1.5,'latest dragon wins');

// Saved rows with no IDs still resolve the two known name spellings.
for(const name of ['リスキー ベット','リスキー ベッド']) {
  const r={...oldWig,equipBuffName:name,equipBuffCatalogId:'',equipBuffTechnicId:''};
  assert.equal(calc([r]).extraStats.extraCritRatePct,30,name);
  assert.equal(page.resolveEquipmentBuffRow(r).equipBuffAttackPct,0,name);
}
for(const name of ['騎心一槍','騎心一槍 (ディア・フィアナ)','騎心一槍（ディア・フィアナ）']) {
  const r={...oldSpear,equipBuffName:name,equipBuffCatalogId:'',equipBuffTechnicId:''};
  assert.equal(calc([r]).extraStats.extraCritRatePct,20,name);
}
// Unrelated user-entered values retain the prior non-overwrite behavior.
const custom={equipBuffFlatAttack:77};
page.applyEquipBuffRuleCandidateToEquipment(custom,{verified:true,stats:{attack:10}});
assert.equal(custom.equipBuffFlatAttack,77);

// Actual search and actual Worker entry: objective must select corrected crit rows.
page.__searchRows=[oldWig,oldSpear,oldFur];
const st=vm.runInContext('state=DEFAULT_STATE(); state.equipment=normalizeEquipmentRows(__searchRows); state',page);
const payload={state:json(st),inputs:{...inputs},runtime:json(page.optimizerRuntimeSnapshot()),settings:{objective:'extraCritRatePct',maxSlots:24,topN:10,exactEquipmentLimit:3000,beamWidth:10,equipmentEvalLimit:10,buffMode:'fast',includeDisabledBuffs:true,forceOtherBuffs:true}};
const direct=page.runOptimizerCore(payload);
assert.equal(direct.results[0].metrics.extraStats.extraCritRatePct,50,'optimizer sees 30+20');
let received;
worker.postMessage=msg=>{if(msg.type==='error') throw new Error(msg.message);if(msg.type==='result') received=structuredClone(msg);};
worker.onmessage({data:structuredClone({type:'optimize',runId:1,payload})});
assert.ok(received);
assert.deepEqual(json(received.results),json(direct.results),'Worker and main results match');
console.log('equipment Buff critical/target runtime regression: OK');
