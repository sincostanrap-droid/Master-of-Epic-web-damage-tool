const assert = require('node:assert/strict');
const vm = require('node:vm');
const {candidateContext} = require('../tools/inspect-optimizer-v2-candidates.cjs');
const {json} = require('../tools/benchmark-optimizer.cjs');
const p=candidateContext(), api=p.MOEOptimizerV2Candidates, items=p.equipmentCatalogItems();
assert.equal(p.renderCatalogResults,undefined,'v2 conversion works without catalog UI module');
const examples={
  weapon:items.find(x=>x.name==='カッパー ナイフ'),
  armor:items.find(x=>x.slot==='防具: 胴' && x.armorClass>0),
  accessory:items.find(x=>x.slot.startsWith('装飾:')),
  ammo:items.find(x=>x.ammoKind==='arrow'),
  multiSkill:items.find(x=>x.weaponReq?.length>1),
  buff:items.find(x=>x.equipBuff?.name),
  addStatus:items.find(x=>x.addStatuses?.some(s=>s.value!==0)),
};
const base=json(vm.runInContext('DEFAULT_STATE()',p));
Object.keys(base.skillSim.skills).forEach(key=>base.skillSim.skills[key]=100);
p.__base=base;
vm.runInContext('state=clone(__base)',p); // Official calculator still reads skillSim from global state.
const inputs={raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,atkCap:500,techMultiplier:1,targetAC:50};
for(const [label,item] of Object.entries(examples)) {
  assert.ok(item,label+' fixture exists');
  const output=api.generate({items:[item],qualities:['raw','HG_MG']});
  assert.equal(output.candidates.length,2);
  for(const candidate of output.candidates) {
    const legacy={...p.catalogEquipmentToRow(json(item),candidate.quality),enabled:true};
    const row=api.toEquipmentRow(candidate);
    assert.deepEqual(json(row),json(legacy),label+' entire official row / '+candidate.quality);
    const actual=api.toEvaluationState(base,[candidate]);
    const expected={...json(base),equipment:[legacy]};
    assert.deepEqual(json(p.computeMetrics(actual,{...inputs})),json(p.computeMetrics(expected,{...inputs})),
      label+' official metrics / '+candidate.quality);
  }
}
const knife=api.generate({items:[examples.weapon],qualities:['raw','HG_MG']}).candidates;
assert.equal(knife[0].weaponDamage,2.2);
assert.equal(knife[1].weaponDamage,2.42,'known existing HG/MG conversion');
const armor={catalogId:'ac-fixture',name:'AC fixture',category:'defense',slot:'防具: 頭',armorClass:20,
  addStatuses:[{name:'防御力',statKey:'extraAC',value:5},{name:'攻撃力',statKey:'attack',value:3}]};
const high=api.generate({items:[armor],qualities:['HG_MG']}).candidates[0];
assert.equal(high.armorClass,22);assert.equal(high.ac,27);assert.equal(high.modifiers.base.attack,3);
console.log('v2 parity: weapon/armor/accessory/ammo/multiple skills/Buff/add_status, raw + HG/MG, full rows and official metrics OK');
