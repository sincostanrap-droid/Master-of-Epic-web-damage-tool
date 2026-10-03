const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();vm.runInContext(fs.readFileSync('src/domain/equipmentEffectFacets.js','utf8'),p);vm.runInContext(fs.readFileSync('src/domain/equipmentEffectFacetCatalog.js','utf8'),p);
const cases=[['起源の弾','magic',2,'magic'],['螺旋の矢','attack',2,'attack'],['錬成弾','extraHit',5,'hit'],['ゴールド アロー','extraHP',1,'hp']];
const base=vm.runInContext('DEFAULT_STATE()',p);const context=p.MOEOptimizerV2SearchContext.create({objective:'magic',baseState:base,skillSim:base.skillSim,inputs:{},slots:['武器: 弾丸']});
for(const [name,field,value,metric]of cases){const i=p.equipmentCatalogItems().find(i=>i.name===name);assert.equal(p.catalogEquipmentToRow(i)[field],value,'no double addStatuses/extraStats');
 assert.equal(p.MOEEquipmentEffectFacetCatalog.project(i).facets.find(f=>f.key==='stat:'+field).value,value);
 const snapshot=p.MOEOptimizerV2Candidates.generate({items:[i]});const empty=p.MOEOptimizerV2SearchContext.evaluate(context,[],snapshot.sources),selected=p.MOEOptimizerV2SearchContext.evaluate(context,[snapshot.candidates[0]],snapshot.sources);
 const read=m=>metric==='magic'?m.stats.magic:metric==='attack'?m.atk:metric==='hit'?m.extraStats.extraHit:m.extraStats.extraHP;assert.equal(read(selected.metrics)-read(empty.metrics),value,name+' formal score');
}
const needle=p.equipmentCatalogItems().find(i=>i.name==='輝針');assert.equal(p.catalogEquipmentToRow(needle).magic,0);
console.log('four ammo additions: single application, candidate facets and formal stats under insufficient requirements passed');
