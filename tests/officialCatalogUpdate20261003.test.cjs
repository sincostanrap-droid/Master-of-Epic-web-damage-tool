const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const {context,json,root}=require('../tools/benchmark-optimizer.cjs');
const report=require('../docs/official-catalog-update-20261003.json'),p=context(root,{catalog:true});
assert.equal(report.addedEquipment.length,9);assert.equal(report.newBuffs.length,8);
for(const [name,key] of [['equipmentCatalog','EQUIPMENT'],['buffCatalog','BUFF']]){
 const c=vm.createContext({window:{}});vm.runInContext(cp.execFileSync('git',['show','HEAD:src/data/generated/'+name+'.generated.js'],{maxBuffer:40*1024*1024}).toString(),c);
 const oldRows=c.window['MOE_'+key+'_CATALOG_GENERATED'];
 if(key==='EQUIPMENT' && oldRows.find(i=>i.catalogId==='official-shield-4900').addStatuses.length===4){
  const fire=oldRows.find(i=>i.catalogId==='official-shield-4900');
  assert.deepEqual(json(fire.addStatuses.map(s=>[s.statusId,s.value])),[['9',30],['10',-30],['9',30],['10',-30]]);
  fire.addStatuses=fire.addStatuses.slice(0,2);fire.extraStats={extraFireRes:30,extraWaterRes:-30};
 }
 assert.deepEqual(json(p['MOE_'+key+'_CATALOG_GENERATED'].slice(0,oldRows.length)),json(oldRows),'only verified Fire Shield snapshot repair; all other existing rows preserved');
}
const items=p.equipmentCatalogItems();
for(const coverage of report.coverage){const cat={weapons:'weapon',defences:'defense',shields:'shield'}[coverage.category];const unique=new Set(p.MOE_EQUIPMENT_CATALOG_GENERATED.filter(x=>x.category===cat).map(x=>x.catalogId));assert.equal(unique.size,coverage.officialTotal);}
for(const id of report.addedEquipment){const item=items.find(i=>i.catalogId===id);assert.ok(item);assert.equal(item.source,'official-idb');assert.equal(item.unmappedAddStatuses.length,0);const row=p.catalogEquipmentToRow(item);const b=p.findEquipBuffRuleCandidate({catalogId:item.buffRefs[0]});assert.equal(b.reviewComplete,false);assert.ok(['unverified','partial'].includes(b.reviewStatus));const expected={'technic-14636':{extraHitPct:5},'technic-14640':{extraMPPct:10}};assert.deepEqual(json(b.stats),expected[item.buffRefs[0]]||{});assert.ok(p.equipmentBuffEffectText(row).includes('公式説明'));assert.ok(p.catalogBuffEffectEntries(item).length);}
console.log('20261003 official import: 9 items/8 Buffs, all previous rows preserved, official unique totals match, searchable pending descriptions passed');
