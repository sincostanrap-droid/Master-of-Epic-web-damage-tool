const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {context,json}=require('../tools/benchmark-optimizer.cjs');
const source=fs.readFileSync(path.join(__dirname,'../src/data/manual/foodBuffCatalog.manual.js'),'utf8');
const inputs={raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponSkill:100,atkCap:500,techMultiplier:1};
for(const worker of [false,true]){
 const p=context(undefined,{worker});vm.runInContext(source,p);
 const catalog=p.window.MOE_FOOD_BUFF_CATALOG;
 assert.equal(catalog.length,316);assert.equal(new Set(catalog.map(x=>x.id)).size,catalog.length);
 for(const entry of catalog){assert.match(entry.foodGroup,/^[A-F][1-4]?$/);assert.equal(entry.conflictGroup,'food:'+entry.foodGroup[0]);}
 const lemon=catalog.find(x=>x.name==='レモン かき氷');
 assert.equal(lemon.effect.extraST,15);assert.equal(lemon.effect.extraEffects[0].value,20);assert.equal(lemon.effect.stackRule,'food:D2');
 assert.match(p.reviewedBuffCatalogEffectSummary(lemon.effect),/最大ST\+15/);
 assert.match(p.reviewedBuffCatalogEffectSummary(lemon.effect),/20/);
 const rule=p.window.MOE_REVIEWED_BUFF_CATALOG_MANUAL.find(x=>x.id===lemon.id);
 const changed=rule.evaluate();changed.extraEffects[0].value=99;assert.equal(rule.evaluate().extraEffects[0].value,20,'catalog remains immutable');
 function row(group,value){return {name:group+value,enabled:true,slot:true,tags:'food:'+group[0],stackRule:'food:'+group,flatAttack:value};}
 function metrics(rows){const s=json(vm.runInContext('DEFAULT_STATE()',p));s.equipment=[];s.composite=json(p.normalizeCompositeRows(rows));return p.computeMetrics(s,inputs);}
 function winners(rows){return json(p.resolveCompositeRowsForGroups(rows).rows).filter(x=>x.enabled&&!x.excluded).map(x=>x.name);}
 for(const [lower,upper] of [['D1','D2'],['D2','D3'],['D3','D4'],['C1','C2']]){
  const low=row(lower,100),high=row(upper,1);
  assert.deepEqual(winners([low,high]),[high.name]);assert.deepEqual(winners([high,low]),[high.name]);
  assert.equal(metrics([high,low]).slots.total,1);
 }
 for(const group of ['A','B1','C2','D2','E','F'])assert.deepEqual(winners([row(group,100),row(group,1)]),[group+'1'],'same group latest');
 assert.deepEqual(winners([row('B2',100),row('B1',1)]),['B11'],'B has no tier priority');
 assert.equal(metrics([row('A',1),row('B1',2),row('C1',3),row('D2',4),row('E',5),row('F',6)]).slots.total,6);
 assert.deepEqual(winners([row('D1',1),{...row('D4',100),enabled:false}]),['D11']);
 assert.deepEqual(winners([row('D1',1),{...row('D4',100),excluded:true}]),['D11']);
 const lemonRow={...json(lemon.effect),name:lemon.name,tags:lemon.conflictGroup,slot:true,enabled:true};
 let m=metrics([lemonRow,row('D3',100)]);assert.equal(m.attackDelayBSources.length,0,'overridden lemon cannot supply shortening');
 m=metrics([row('D1',100),lemonRow]);assert.equal(m.attackDelayBSources[0].percent,20);assert.equal(m.extraStats.extraST,15);assert.equal(m.slots.total,1);
 const ramen=catalog.find(x=>x.name==='ラーメン');assert.equal(ramen.effect.extraST,undefined,'conflicting source ST is not guessed');
}
console.log('food catalog: numeric effects, immutable templates, food group priority, slots and shortening after conflicts OK');
