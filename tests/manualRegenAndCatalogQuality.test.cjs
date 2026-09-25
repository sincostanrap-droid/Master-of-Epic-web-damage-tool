const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {context,json,root}=require('../tools/benchmark-optimizer.cjs');
const inputs={raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponSkill:100,atkCap:500,techMultiplier:1};
for(const worker of [false,true]){
 const p=context(undefined,{worker,catalog:!worker});
 const row={name:'manual recovery',enabled:true,slot:true};
 for(const [key,value] of [['hpRegenPerMinute',36.52],['mpRegenPerMinute',15],['stRegenPerMinute',42.25]]){
  assert.ok(p.quickEffectDefsFor('composite').some(x=>x.key===key),'available to manual Buffs');
  assert.ok(p.quickEffectDefsFor('equipment','equipBuff').some(x=>x.key===key));
  assert.equal(p.applyQuickEffectToRow(row,'composite',key,value),true);
 }
 const state=json(vm.runInContext('DEFAULT_STATE()',p));state.equipment=[];state.composite=json(p.normalizeCompositeRows([row]));
 let m=p.computeMetrics(state,inputs);
 assert.equal(m.extraStats.hpRegenPerMinute,36.52);assert.equal(m.extraStats.mpRegenPerMinute,15);assert.equal(m.extraStats.stRegenPerMinute,42.25);assert.equal(m.slots.total,1);
 state.composite[0].enabled=false;assert.equal(p.computeMetrics(state,inputs).extraStats.hpRegenPerMinute,0);
 const equip={name:'manual equipment Buff',slot:'防具: 頭',enabled:true,equipBuffName:'regen'};
 p.applyQuickEffectToRow(equip,'equipment','hpRegenPerMinute',12.5,'','equipBuff');
 state.equipment=json(p.normalizeEquipmentRows([equip]));assert.equal(p.computeMetrics(state,inputs).extraStats.hpRegenPerMinute,12.5);
 state.equipment[0].equipBuffEnabled=false;assert.equal(p.computeMetrics(state,inputs).extraStats.hpRegenPerMinute,0);
 const base={category:'weapon',weaponDamage:65,armorClass:0};const high=p.catalogItemWithQuality(base,'HG_MG');
 assert.equal(high.weaponDamage,71.5);assert.equal(base.weaponDamage,65);
 assert.equal(p.catalogItemWithQuality(high,'HG_MG').weaponDamage,71.5,'not compounded');
 assert.equal(p.catalogItemWithQuality(high,'raw').weaponDamage,65,'restore raw');
}
const p=context(undefined,{catalog:true});
for(const f of ['src/domain/catalogSort.js','src/ui/catalogRows.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),p);
const items=p.equipmentCatalogItems();
const knife=items.find(x=>x.name==='カッパー ナイフ');
const raw=p.catalogEquipmentToRow(knife),hg=p.catalogEquipmentToRow(knife,'HG_MG');
assert.equal(hg.weaponDamage,2.42);assert.equal(raw.weaponDamage,2.2);assert.equal(hg.extraHit,raw.extraHit,'additional accuracy unchanged');
assert.equal(p.normalizeEquipmentRows(json([hg]))[0].catalogQuality,'HG_MG','quality survives save/load');
const armor={catalogId:'fixture',category:'defense',name:'armor',slot:'防具: 頭',armorClass:20,addStatuses:[{name:'防御力',statKey:'extraAC',value:5},{name:'攻撃力',statKey:'attack',value:3}]};
const ar=p.catalogEquipmentToRow(armor,'HG_MG');assert.equal(ar.extraAC,27,'only base AC times 1.1');assert.equal(ar.attack,3,'attack bonus unchanged');
const projected=p.catalogItemWithQuality(knife,'HG_MG');
assert.match(p.catalogWeaponSummary(projected),/2.42/);assert.equal(p.catalogItemSortValue(projected,'weaponDamage'),2.42);
assert.equal(p.catalogItemSortValue(p.catalogItemWithQuality(armor,'HG_MG'),'ac'),22);
assert.match(p.catalogResultRowHtml(projected,false),/data-catalog-quality/);
assert.notEqual(p.catalogRegistrationKey('same','raw'),p.catalogRegistrationKey('same','HG_MG'),'quality variants can coexist');
const s=json(vm.runInContext('DEFAULT_STATE()',p));s.skillSim.skills['刀剣']=100;s.composite=[];s.equipment=json([p.catalogEquipmentToRow({...knife,weaponDamage:65}),p.catalogEquipmentToRow({...knife,weaponDamage:65},"HG_MG")]);
const out=p.runOptimizerCore({state:s,inputs,settings:{objective:'damage',mainWeaponSkill:'刀剣',maxSlots:24,topN:3,exactEquipmentLimit:100,buffMode:'local',includeDisabledBuffs:true}});
assert.ok(out.results.length);assert.ok(json(out.results[0].equipmentIdxs).includes(1),'optimizer uses corrected weapon damage');
console.log('manual recovery input/calculation and catalog quality: main/worker, precision, save/load, base-only scaling and no compound correction OK');
