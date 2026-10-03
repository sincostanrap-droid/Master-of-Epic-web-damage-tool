const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
vm.runInContext(fs.readFileSync('src/domain/equipmentEffectFacets.js','utf8'),p);
vm.runInContext(fs.readFileSync('src/domain/equipmentEffectFacetCatalog.js','utf8'),p);
vm.runInContext(fs.readFileSync('src/domain/equipmentCandidatePolicy.js','utf8'),p);
vm.runInContext(fs.readFileSync('src/ui/catalogSpecialization.js','utf8'),p);
vm.runInContext(fs.readFileSync('src/domain/catalogSort.js','utf8'),p);
const F=p.MOEEquipmentEffectFacets;
const api={toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,
 definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,
 groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups||r.equipBuffConflictGroup)};
const item={catalogId:'facet-fixture',name:'要件不足fixture',category:'weapon',slot:'武器: 右手',weaponDamage:50,weaponReq:[{name:'刀剣',required:100}],addStatuses:[{name:'魔力',value:20,statKey:'magic'}]};
const projected=F.projectEquipmentEffectFacets(item,api);
assert.equal(F.value(projected,'stat:magic'),20);
assert.equal(F.value(projected,'body:weaponDamage'),50);
assert.equal(p.calcRequiredSkillsMod([{name:'刀剣',current:0,required:100}]).mod,0);
assert.equal(F.matches(projected,[{key:'stat:magic'}]),true);
// Reuse the official converter/resolver for the structured skillPlus fixture.
const original=api.toRow(item);original.extraEffects=[{key:'skillPlus',name:'破壊魔法',value:10,scope:'base'}];
const req=F.projectEquipmentEffectFacets(item,{...api,toRow:()=>original});
assert.equal(F.value(req,'skillPlus:破壊魔法'),10);
assert.equal(F.matches(req,[{key:'skillPlus:破壊魔法'},{key:'stat:magic'}]),true);
assert.equal(F.value(req,'skillEnhancement:破壊魔法'),0,'No invented performance-enhancement facet from skillPlus');
const armor={catalogId:'facet-armor',name:'armor',category:'defense',slot:'防具: 頭',armorClass:100,requirements:[{name:'着こなし',required:100}],addStatuses:[{name:'魔力',value:5,statKey:'magic'}]};
const ar=api.toRow(armor);ar.equipBuffEnabled=true;ar.equipBuffName='fixture Buff';ar.equipBuffFlatMagic=10;
ar.equipBuffConflictGroups='fixture:group';ar.extraEffects=[{key:'elementDamagePct',name:'火属性',value:7,unit:'%',scope:'display'},{key:'custom',name:'unknown damage +99',value:99}];ar.extraFireRes=3;
const both=F.projectEquipmentEffectFacets(armor,{...api,toRow:()=>ar});
assert.equal(F.value(both,'stat:magic'),15);assert.equal(both.facets.find(f=>f.key==='stat:magic').sources.length,2);
assert.equal(F.value(both,'elementDamagePct:火属性'),7);assert.equal(F.value(both,'stat:extraFireRes'),3);
assert.equal(F.value(both,'body:armorAC'),100);assert.equal(F.value(both,'stat:extraAC'),0);
const sim=vm.runInContext('defaultSkillSimState()',p);assert.equal(p.equipmentArmorAC(ar,sim).effective,0);
assert.equal(F.value(both,'stat:magic'),15,'requirements attenuate body only, never facet additions');
assert.ok(both.metadata.groups.includes('fixture:group'));assert.equal(both.metadata.hasBuff,true);
assert.equal(both.facets.some(f=>f.label.includes('unknown')),false);
const numericDisplay=F.projectEquipmentEffectFacets(armor,{...api,toRow:()=>ar,additionalRules:()=>[
 {id:'magic-verified',effectKey:'magicDamagePct',effectLabel:'魔法与ダメージ',value:10,valueUnit:'%',safeForValueAutoApply:true,autoApplyKind:'displayMagic'},
 {id:'uncertain',effectKey:'unknown',value:99,safeForValueAutoApply:true,valueUncertain:true}
]});
assert.equal(F.value(numericDisplay,'compat:magicDamagePct:'),10);
assert.equal(F.value(numericDisplay,'compat:unknown:'),0);
const axes=[{key:'skillPlus:破壊魔法',minimum:''},{key:'stat:magic',minimum:''},{key:'elementDamagePct:火属性',minimum:''}];
const mainOnly={facets:[{key:'skillPlus:破壊魔法',value:10}]};
assert.equal(F.matches(mainOnly,axes),true);assert.equal(F.matches(mainOnly,[axes[0],{...axes[1],minimum:'10'}]),false);
assert.equal(F.matches(mainOnly,[axes[0],{...axes[1],minimum:'0'}]),true);
assert.equal(F.matches(mainOnly,[axes[0],{...axes[1],required:true}]),false);
assert.equal(F.matches(mainOnly,[axes[0],{...axes[1],required:true,minimum:'0'}]),false);
assert.equal(F.matches({facets:[{key:'stat:magic',value:-2}]},[{key:'stat:magic',minimum:'-3'}]),true);
assert.equal(F.matches({facets:[{key:'stat:magic',value:-2}]},[{key:'stat:magic'}]),false);
const rows=[{name:'B',catalogId:'b',facets:[{key:axes[0].key,value:10},{key:axes[1].key,value:1}]},{name:'A',catalogId:'a',facets:[{key:axes[0].key,value:10},{key:axes[1].key,value:1},{key:axes[2].key,value:2}]},{name:'C',catalogId:'c',facets:[{key:axes[0].key,value:9},{key:axes[1].key,value:20}]}];
assert.equal(rows.sort((a,b)=>F.compare(a,b,axes,'main',x=>x)).map(x=>x.name).join(','),'A,B,C');
assert.equal(rows.sort((a,b)=>F.compare(a,b,axes,'sub',x=>x)).map(x=>x.name).join(','),'C,A,B');
const real=p.equipmentCatalogItems();const start=Date.now();const available=new Map();
for(const i of real)for(const f of p.catalogEffectProjection(i).facets)available.set(f.key,(available.get(f.key)||0)+1);
for(const key of ['skillPlus:破壊魔法','skillPlus:回復魔法','stat:extraKickAttack','stat:extraFangAttack','stat:extraAvoid','stat:extraFireRes','elementDamagePct:火属性'])assert.ok(available.has(key),key);
const cached=p.catalogEffectProjection(real[0]);assert.equal(p.catalogEffectProjection({...real[0]}),cached);
const coldMs=Date.now()-start,warmStart=Date.now();for(const i of real)p.catalogEffectProjection(i);const warmMs=Date.now()-warmStart;
const rowHtml=p.catalogSpecialRowHtml(real[0],false,{axes:[{key:'stat:magic'},{key:'stat:extraAvoid'},{key:'stat:extraFireRes'}]});
assert.equal((rowHtml.match(/<td/g)||[]).length,9);assert.ok(rowHtml.includes('data-catalog-open'));assert.ok(rowHtml.includes('data-catalog-add'));
p.invalidateCatalogEffectFacets();assert.notEqual(p.catalogEffectProjection(real[0]),cached);
const sourceCached=p.catalogEffectProjection(real[0]);p.MOE_EQUIPMENT_CATALOG_GENERATED=[...p.MOE_EQUIPMENT_CATALOG_GENERATED];assert.notEqual(p.catalogEffectProjection(real[0]),sourceCached);
fs.writeFileSync('docs/specialized-equipment-search-facet-audit.json',JSON.stringify({items:real.length,initialMs:coldMs,warmMs,facets:Object.fromEntries(available),missingStructuredFamilies:['independent skill-performance enhancement','independent technique-power enhancement'],requirementFixture:{magic:20,destructionSkillPlus:10,weaponBodyRaw:50,armorBodyEffective:0}},null,2)+'\n');
console.log('effect facets: direct/Buff/source split, requirements, typed distinctions, optional axes, minima, sort and cache OK');
