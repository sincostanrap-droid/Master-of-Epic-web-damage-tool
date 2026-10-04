const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const {root,json}=require('../tools/benchmark-optimizer.cjs');
(async()=>{
 const {loadEquipmentSupplements,mergeEquipmentSupplements}=await import(pathToFileURL(root+'/tools/build-equipment-catalog-from-google-sheet.mjs'));
 const supplements=await loadEquipmentSupplements(),p=contextRuntime(),items=p.equipmentCatalogItems();
 const hits=items.filter(i=>p.catalogItemMatches(i,{query:'シュライン ナイト'}));
 const expected=[['ヘルム','頭',22,5],['アーマー','胴',25.3,7.5],['アームガード','手',19.8,5.5],
  ['グリーブス','パンツ',23.1,6.5],['カリガ','靴',19.8,6],['ショルダーガード','肩',14.3,4.5],['レッグガード','腰',13.2,5.5]];
 const stats={attack:5,magic:5,extraAttackDelay:-2,extraMagicDelay:-2,extraNeutralRes:10};
 assert.equal(hits.length,7,'ordinary catalog search');
 assert.equal(new Set(hits.map(i=>i.catalogId)).size,7);
 assert.equal(new Set(hits.map(i=>i.name)).size,7);
 const generated=p.MOE_EQUIPMENT_CATALOG_GENERATED,base=generated.filter(i=>i.source!=='wiki-manual');
 assert.equal(base.length,11846);assert.equal(generated.length,11853,'exactly +7');
 p.MOE_EQUIPMENT_CATALOG_GENERATED=base;
 const baselineRuntimeCount=p.equipmentCatalogItems().length;
 p.MOE_EQUIPMENT_CATALOG_GENERATED=generated;
 assert.equal(items.length,baselineRuntimeCount+7,'deduplicated runtime catalog is exactly +7');
 assert.deepEqual(json(generated.slice(base.length)),supplements,'reproducible supplement source');
 assert.deepEqual(json(mergeEquipmentSupplements(base,supplements)),json(generated),'existing rows retained verbatim');
 assert.deepEqual(json(mergeEquipmentSupplements(generated,supplements)),json(generated),'repeated merge is idempotent');
 assert.throws(()=>mergeEquipmentSupplements(base,[supplements[0],supplements[0]]),/Duplicate supplement/);
 assert.throws(()=>mergeEquipmentSupplements([{catalogId:'other',name:supplements[0].name}],supplements),/Duplicate supplement name/);
 assert.throws(()=>mergeEquipmentSupplements([{...supplements[0],source:'official-idb'}],supplements),/Refusing to overwrite/);
 const allSnapshot=p.MOEOptimizerV2Candidates.generate();
 for(const [suffix,slot,ac,weight] of expected){
  const item=hits.find(i=>i.name==='シュライン ナイト '+suffix);assert.ok(item,suffix);
  assert.equal(item.slot,'防具: '+slot);assert.equal(item.armorClass,ac);assert.equal(item.weight,weight);
  assert.equal(item.needLevel,91);assert.equal(item.requiredSkill,'着こなし');
  assert.deepEqual(json(item.requirements),[{name:'着こなし',required:91}]);
  assert.equal(item.durability,22);assert.equal(item.material,'オリハルコン');assert.equal(item.itemType,'PM');assert.equal(item.transfer,'○');
  assert.equal(item.source,'wiki-manual');assert.equal(item.officialId,undefined);assert.equal(item.info,'');
  assert.equal(item.buffRefs.length,0);assert.equal(item.unmappedAddStatuses.length,0);assert.equal(item.addStatuses.length,5);
  assert.deepEqual(json(item.extraStats),stats);
  const candidate=allSnapshot.candidates.find(c=>c.catalogId===item.catalogId);assert.ok(candidate,'full Optimizer v2 catalog');
  const row=p.MOEOptimizerV2Candidates.toEquipmentRow(candidate);
  assert.deepEqual(json(row.armorRequirements),[{name:'着こなし',required:91}]);assert.equal(row.armorBaseAC,ac);
  for(const [key,value] of Object.entries(stats))assert.equal(row[key],value,key);
  for(const [clothing,mod] of [[91,1],[72.8,.8],[72.799,0]]){
   const formal=p.equipmentArmorAC(row,{skills:{'着こなし':clothing}});
   assert.ok(Math.abs(formal.performance.mod-mod)<1e-12,'existing clothing requirement rule');
   assert.ok(Math.abs(formal.effective-ac*mod*(clothing+300)/350)<1e-12);
  }
 }
 assert.equal(hits.reduce((s,i)=>s+i.weight,0),40.5);
 for(const item of hits)assert.ok(!JSON.stringify(item).includes('41.5'),'no erroneous set weight');
 for(const file of ['src/domain/equipmentEffectFacets.js','src/domain/equipmentEffectFacetCatalog.js',
  'src/domain/equipmentSearchSpecification.js','src/optimizer-v2/facetSearch.js'])vm.runInContext(fs.readFileSync(root+'/'+file,'utf8'),p,{filename:file});
 const S=p.MOEEquipmentSearchSpecification,F=p.MOEOptimizerV2FacetSearch;
 const baseState=vm.runInContext('DEFAULT_STATE()',p);baseState.skillSim.skills['着こなし']=91;
 for(const axis of ['stat:magic','stat:extraNeutralRes']){
  const context=S.toContext(S.create([{key:axis}],{slots:hits.map(i=>i.slot)}),{baseState});
  const prepared=F.prepare(items,context);
  for(const item of hits){assert.ok(prepared.snapshot.candidates.some(c=>c.catalogId===item.catalogId),'specialization candidate '+axis+' '+item.name);
   assert.equal(prepared.classification.find(c=>c.catalogId===item.catalogId).reason,'direct-facet');}
 }
 assert.equal(p.MOE_EQUIPMENT_CATALOG_META.equipmentCount,generated.length);assert.equal(p.MOE_EQUIPMENT_CATALOG_META.supplementCount,7);
 console.log('Shrine Knight: 7 search hits, exactly +7, unique additions, source reproduction/idempotence, all values, Optimizer v2 + magic/resistance specialization, existing clothing rules OK');
})().catch(e=>{console.error(e);process.exitCode=1;});
