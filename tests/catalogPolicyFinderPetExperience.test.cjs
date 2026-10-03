const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const file of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentCandidatePolicy','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync('src/domain/'+file+'.js','utf8'),p);
p.escapeAttr=p.escapeHtml=String;
vm.runInContext(fs.readFileSync('src/ui/catalogSpecialization.js','utf8'),p);
const F=p.MOEEquipmentEffectFacets;
const api={toRow:x=>x,resolveBuff:x=>x,toComposite:()=>({}),definitions:[],effects:()=>[],groups:()=>[]};
for(const [id,expected] of [[8305,1.1],[13284,1.2],[11323,1.05],[12388,1.2],[14655,1.2],[14656,1.1],[0,0]]){
 const item={equipBuffEnabled:true,equipBuffTechnicId:id};const projection=F.projectEquipmentEffectFacets(item,api);
 assert.equal(F.value(projection,'pet:experienceMultiplier'),expected);
 assert.equal(F.value(F.projectEquipmentEffectFacets({...item,equipBuffEnabled:false},api),'pet:experienceMultiplier'),0);
}
assert.equal(F.value(F.projectEquipmentEffectFacets({equipBuffEnabled:true,equipBuffName:'custom ペット1.9倍'},api),'pet:experienceMultiplier'),0,'display text is never parsed');
const projection=F.projectEquipmentEffectFacets({equipBuffEnabled:true,equipBuffTechnicId:13284},api);
assert.equal(F.matches(projection,[{key:'pet:experienceMultiplier',minimum:1.2}]),true);
assert.equal(F.matches(projection,[{key:'pet:experienceMultiplier',minimum:1.3}]),false);
assert.equal(p.MOEEquipmentSearchSpecification.create([{key:'pet:experienceMultiplier'}]).primary.metric,'petGrowth');
const all=p.equipmentCatalogItems();
const found=p.catalogPolicyMatches('愛玩の指輪',all);assert.ok(found.length);assert.ok(p.catalogPolicyMatches('黒刀',all).length);
assert.equal(p.catalogPolicyMatches(' ',all).length,0);
assert.equal(p.catalogPolicyMatches('ａｂｃ',[{name:'ABC'}]).length,1);
const projected=found.map(i=>p.MOEEquipmentEffectFacetCatalog.project(i));assert.ok(projected.some(x=>F.value(x,'pet:experienceMultiplier')===1.1));
vm.runInContext('catalogCandidatePolicy.set(equipmentCatalogItems().find(i=>i.name.includes("愛玩の指輪")),"excluded")',p);
assert.ok(p.catalogPolicyButtonsHtml(found[0]).includes('除外を解除'));
console.log('pre-search name lookup independent of objective, policy identity, pet 1.05/1.1/1.2, unknown/disabled/text-only omission, minimum and actual ring catalog projection passed');
const fixtures=Array.from({length:35},(_,i)=>({catalogId:'bulk-'+i,name:'フューチャー ノア '+i}));
p.bulkFixtures=fixtures;
vm.runInContext('catalogCandidatePolicy.clear();catalogCandidatePolicy.set(bulkFixtures[0],"fixed");catalogCandidatePolicy.set(bulkFixtures[1],"excluded")',p);
assert.equal(p.catalogBulkExclude('フューチャー ノア',fixtures),35);
assert.ok(fixtures.every(i=>p.catalogPolicyButtonsHtml(i).includes('除外を解除')),'all matches including beyond first 20 are excluded');
const compiled=vm.runInContext('MOEEquipmentCandidatePolicy.compile(catalogCandidatePolicy.snapshot(),{candidates:bulkFixtures.map((i,n)=>({catalogId:i.catalogId,candidateId:"candidate-"+n}))})',p);
assert.equal(compiled.excludedCandidateIds.length,35);assert.equal(compiled.fixedCandidateIds.length,0);
p.catalogUndoBulkExclude();assert.ok(p.catalogPolicyButtonsHtml(fixtures[0]).includes('固定を解除'));assert.ok(p.catalogPolicyButtonsHtml(fixtures[1]).includes('除外を解除'));assert.equal(p.catalogPolicyButtonsHtml(fixtures[2]).includes('解除'),false);
assert.equal(p.catalogBulkExclude(' ',fixtures),0);
console.log('bulk exclude >20, stable IDs forwarded to search, fixed override, exact undo and empty query guard passed');

for(const [id,multiplier] of [['official-defense-23501',1.2],['official-defense-23502',1.2],['official-defense-23503',1.1]]){const item=all.find(x=>x.catalogId===id);assert.ok(item,id);const projected=p.MOEEquipmentEffectFacetCatalog.project(item);assert.equal(F.value(projected,'pet:experienceMultiplier'),multiplier,id);assert.ok(F.matches(projected,[{key:'pet:experienceMultiplier',minimum:multiplier}]));}
console.log('new pet hats A/B, belt, revised Medarot multiplier and actual candidate search passed');
