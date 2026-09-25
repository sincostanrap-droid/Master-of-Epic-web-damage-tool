const assert=require('node:assert/strict');
const vm=require('node:vm');
const {context,json}=require('../tools/benchmark-optimizer.cjs');
const inputs={raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponSkill:100,atkCap:500,techMultiplier:1,targetAC:0};
const settings={objective:'damage',requireAttackDelayB:true,attackDelayBMinimumPct:20,
 mainWeaponSkill:'銃器',maxSlots:1,topN:5,beamWidth:10,equipmentEvalLimit:10,exactEquipmentLimit:100,
 includeDisabledBuffs:true,evaluateCurrentEquipment:false,includeCurrentConfig:false,onlyBetterThanCurrent:false,
 buffMode:'local',localPasses:2,buffBeamWidth:10};
const main=context(undefined,{catalog:true});
const items=main.equipmentCatalogItems();
const coat=json(main.catalogEquipmentToRow(items.find(x=>x.name==='南雲ハジメ なりきりコート')));
const wig=json(main.catalogEquipmentToRow(items.find(x=>x.name==='南雲ハジメ なりきりウィッグ')));
const gun={slot:'武器: 右手',name:'test gun',enabled:true,optimizerFixed:true,weaponDamage:100,weaponReq:[{name:'銃器',required:100}]};
const sword={...gun,name:'test sword',weaponReq:[{name:'刀剣',required:100}]};
function initial(p,equipment,composite){const s=json(vm.runInContext('DEFAULT_STATE()',p));s.equipment=json(p.normalizeEquipmentRows(equipment));s.composite=json(p.normalizeCompositeRows(composite));return s;}
for(const worker of [false,true]){
 const p=worker?context(undefined,{worker:true}):main;
 vm.runInContext(require('node:fs').readFileSync(require('node:path').join(__dirname,'../src/data/manual/foodBuffCatalog.manual.js'),'utf8'),p);
 const food=p.window.MOE_FOOD_BUFF_CATALOG.find(x=>x.name==='レモン かき氷');
 const lemon=json(p.normalizeCompositeRows([{...food.effect,name:food.name,tags:food.conflictGroup,enabled:false,slot:true}])[0]);
 const run=(s,config={})=>p.runOptimizerCore({state:s,inputs,settings:{...settings,...config}});
 for(const buffMode of ['fast','local','beam']){
  let s=initial(p,[gun],[lemon]);const before=json(s);
  let out=run(s,{buffMode});assert.ok(out.results.length,`lemon ${worker} ${buffMode}`);
  let best=out.results[0];assert.equal(p.optimizerAttackDelayBSelection(best.metrics,settings).percent,20);
  assert.equal(best.metrics.slots.total,1,'lemon consumes a slot');
  assert.equal(best.metrics.extraStats.extraAttackDelay,0,'B does not enter A');
  assert.deepEqual(json(s),before,'payload immutable');
  assert.equal(run(s,{buffMode,maxSlots:0}).results.length,0,'no free lemon Buff');
  assert.equal(run(s,{buffMode,includeDisabledBuffs:false}).results.length,0,'disabled candidate setting honored');
  s.composite[0].fixed=true;
  assert.equal(run(s,{buffMode}).results.length,0,'fixed OFF lemon remains OFF');
  s=initial(p,[gun,{...coat,enabled:false,optimizerFixed:true}],[lemon]);
  out=run(s,{buffMode});assert.ok(out.results.length,'Hajime supplies gun shortening');
  best=out.results[0];assert.equal(best.compositeIdxs.length,0,'no redundant lemon');
  assert.equal(p.optimizerAttackDelayBSelection(best.metrics,settings).name,'天職：錬成師');
  s=initial(p,[sword,{...coat,enabled:false,optimizerFixed:true}],[]);
  assert.equal(run(s,{buffMode,mainWeaponSkill:'刀剣'}).results.length,0,'gun-only Buff cannot satisfy sword');
  s.composite=json(p.normalizeCompositeRows([lemon]));
  assert.ok(run(s,{buffMode,mainWeaponSkill:'刀剣',maxSlots:2}).results.length,'sword can use lemon');
 }
 // Same technic on multiple parts is still a single 20% source, never 40%.
 let s=initial(p,[gun,{...coat,enabled:true},{...wig,enabled:true}],[]);
 let m=p.computeMetrics(s,inputs);assert.equal(p.optimizerAttackDelayBSelection(m,settings).percent,20);
 assert.equal(p.optimizerFinalConstraintViolations(m,{...settings,attackDelayBMinimumPct:21}).length,1);
 const short=(name,value)=>({name,enabled:true,extraEffects:[{key:'attackDelayB',name:'全武器',value,unit:'%',scope:'display'}]});
 s=initial(p,[gun],[short('ten',10),short('fifteen',15)]);
 assert.equal(run(s,{maxSlots:2}).results.length,0,'10+15 does not satisfy 20');
 s=initial(p,[gun],[short('twenty',20),short('later weak',5)]);
 m=p.computeMetrics(s,inputs);assert.equal(p.optimizerAttackDelayBSelection(m,settings).percent,20,'chosen source can be applied last');
 assert.match(p.optimizerAttackDelayBResultText(m,settings),/最後に付与：twenty/);
 s=initial(p,[gun],[{...short('loser',20),tags:'exclusive'},{...short('winner',5),tags:'exclusive'}]);
 m=p.computeMetrics(s,inputs);assert.ok(p.optimizerAttackDelayBSelection(m,settings).percent<=20);
 const resolved=p.applyBuffGroupRules(s);const active=resolved.composite.filter(r=>r.enabled&&!r.excluded);
 assert.equal(p.optimizerAttackDelayBSelection(m,settings).percent,Math.max(...active.map(r=>r.extraEffects[0].value)),'conflict-resolved sources only');
 // Attack-shortening always overrides a stronger skill-shortening.
 s=initial(p,[gun,{...coat,enabled:true}],[{enabled:true,name:'バーサーク',extraAttackDelayPct:-13}]);
 m=p.computeMetrics(s,inputs);
 assert.equal(p.optimizerAttackDelayBSelection(m,settings).percent,13);
 assert.equal(p.optimizerAttackDelayBSelection(m,settings).kind,'attack');
 assert.ok(p.optimizerRequiredConditionViolations(m,settings).length);
 // All three mandatory conditions can be met together.
 s=initial(p,[gun],[{...lemon,extraAttackDelay:-60,extraCritRatePct:100}]);
 assert.ok(run(s,{requireAttackDelay60:true,requireCritRate100:true}).results.length);
 s.composite[0].extraCritRatePct=99;
 assert.equal(run(s,{requireAttackDelay60:true,requireCritRate100:true}).results.length,0);
 s=initial(p,[gun],[]);assert.ok(run(s,{requireAttackDelayB:false}).results.length,'OFF retains old behavior');
}
// A legacy percentage alone and a matching name without an effect are not B.
const invalidSources = main.attackDelayBSourcesFromResolvedState({composite:[
  {enabled:true,name:'レモンかき氷'},
  {enabled:true,name:'unknown percentage',extraAttackDelayPct:-20},
  {enabled:true,name:'approximate',extraEffects:[{key:'custom',name:'銃器ディレイ約',value:-20,unit:'%'}]},
  {enabled:true,name:'positive delay',extraEffects:[{key:'custom',name:'銃器ディレイ',value:20,unit:'%'}]}
]});
assert.equal(invalidSources.length,0);
const berserkSources=main.attackDelayBSourcesFromResolvedState({composite:[{enabled:true,name:'バーサーク',extraAttackDelayPct:-13}]});
assert.equal(main.optimizerAttackDelayBSelection({attackDelayBSources:berserkSources},{mainWeaponSkill:'銃器'}).percent,13);
assert.equal(main.optimizerAttackDelayBSelection({attackDelayBSources:berserkSources},{mainWeaponSkill:'素手'}),null);
// Explicit manual B effects survive save/export normalization and quick entry.
const manual={};assert.equal(main.applyQuickEffectToRow(manual,'composite','attackDelayB',20,'銃器'),true);
assert.equal(main.parseAdditionalEffectsText(main.serializeAdditionalEffectsText(manual.extraEffects))[0].key,'attackDelayB');
console.log('attack delay B: lemon/Hajime alternatives, slots, fixed OFF, weapon scope, non-additivity, three constraints, worker and all Buff modes OK');
