const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const {context,json,root}=require('../tools/benchmark-optimizer.cjs');
(async()=>{
  const {convertRows,validatePage,mergeCatalog,parsePage}=await import(pathToFileURL(path.join(root,'tools/update-equipment-catalog-from-official.mjs')));
  const row={id:4856,name:'SGK ウェポン',info:'説明\\n次行',weponType:'刀剣',weponHand:'2HAND',need_level:100,equip:'右手',
    need_skills:[{name:'素手',pivot:{value:100}},{name:'槍',pivot:{value:100}}],
    add_statuses:[{id:7,name:'魔力',pivot:{value:5}},{id:0,name:'なし',pivot:{value:0}}],technic:null,technic_id:0};
  const delta=convertRows([{category:'weapons',row,fetchedAt:'2026-09-21T00:00:00Z'}]);
  assert.deepEqual(delta.equipment[0].requirements,[{name:'刀剣',required:100},{name:'素手',required:100},{name:'槍',required:100}]);
  assert.equal(delta.equipment[0].extraStats.magic,5,'additional status counted once');
  assert.equal(delta.equipment[0].info,'説明\n次行');
  const page={props:{weapons:{current_page:1,last_page:1,total:1,per_page:5,data:[row]}}};
  assert.equal(validatePage(page,'weapons',1).total,1);
  assert.throws(()=>validatePage(page,'weapons',2));
  assert.throws(()=>validatePage(page,'weapons',1,4856),'duplicate/non-descending ID');
  assert.throws(()=>validatePage({props:{}},'weapons',1));
  const encoded=JSON.stringify(page).replaceAll('&','&amp;').replaceAll('"','&quot;');
  assert.deepEqual(parsePage(`<div data-page="${encoded}"></div>`),page);
  const old=[{catalogId:'old-item',name:'旧装備',fetchedAt:'2026-06-29'}];
  const merged=mergeCatalog(old,[],delta);
  assert.deepEqual(merged.equipment[0],old[0],'keep old rows and dates verbatim');
  assert.throws(()=>mergeCatalog(delta.equipment,[],delta),'no overwrite');
  assert.equal(old.length,1,'no caller mutation');

  const p=context(root,{catalog:true});
  const report=JSON.parse(fs.readFileSync(path.join(root,'docs/official-catalog-update-20260921.json'),'utf8'));
  assert.equal(report.addedEquipment.length,45);
  assert.equal(report.newBuffs.length,25);
  const items=p.equipmentCatalogItems();
  for(const id of report.addedEquipment){
    const item=items.find(x=>x.catalogId===id);assert.ok(item,id);
    assert.equal(item.source,'official-idb');
    const r=p.catalogEquipmentToRow(item);
    if(report.newBuffs.includes(item.buffRefs[0])) {
      const rule=p.findEquipBuffRuleCandidate({catalogId:item.buffRefs[0]});
      assert.equal(rule.reviewStatus,'unverified');assert.equal(rule.reviewComplete,false);
      assert.deepEqual(json(rule.stats),{});
      assert.ok(p.equipmentBuffEffectText(r).includes('公式説明'),item.name);
      assert.ok(p.catalogBuffEffectEntries(item).length,item.name+' searchable');
      const st=vm.runInContext('DEFAULT_STATE()',p);st.equipment=[{...r,enabled:true,equipBuffEnabled:true}];
      const inputs={raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,atkCap:500,techMultiplier:1};
      const on=p.computeMetrics(st,inputs);
      st.equipment[0].equipBuffEnabled=false;
      const off=p.computeMetrics(st,inputs);
      assert.equal(on.finalDamage,off.finalDamage,item.name+' pending Buff must not alter damage');
      assert.deepEqual(json(on.extraStats),json(off.extraStats),item.name+' pending Buff must not alter stats');
    }
  }
  const bell=items.find(x=>x.catalogId==='official-weapon-23492');
  assert.equal(bell.extraStats.magic,5);
  assert.deepEqual(json(bell.requirements),[{name:'こんぼう',required:21}]);
  assert.equal(bell.weaponAttackInterval,150);
  assert.equal(p.MOE_EQUIPMENT_CATALOG_GENERATED.length,11837);
  assert.equal(p.MOE_BUFF_CATALOG_GENERATED.length,1673);
  console.log('official catalog update: OK (45 items, 25 pending Buffs, primary + secondary requirements, provenance, no overwrite)');
})().catch(e=>{console.error(e);process.exitCode=1;});
