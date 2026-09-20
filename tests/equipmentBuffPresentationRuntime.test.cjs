const assert=require('node:assert/strict');
const vm=require('node:vm');
const {context,json}=require('../tools/benchmark-optimizer.cjs');
const {audit,TIMING_EXPECTATIONS}=require('../tools/audit-equipment-buff-presentation.cjs');
const p=context(undefined,{catalog:true});
const counts=audit(p);
const rowFor=name=>{const item=p.equipmentCatalogItems().find(i=>i.name===name);assert.ok(item,name);return {...json(p.catalogEquipmentToRow(item)),enabled:true};};
const inputs={raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponWeight:5,atkCap:500,techMultiplier:1,attackType:'attack',targetAC:0,targetRace:'dragon'};
function calc(rows,extra={}){p.__rows=json(rows);const state=vm.runInContext('state=DEFAULT_STATE();state.equipment=normalizeEquipmentRows(__rows);state',p);return json(p.computeMetrics(state,{...inputs,...extra}));}
const coat=rowFor('南雲ハジメ なりきりコート');
const oldCoat={...coat,equipBuffExtraHit:1,extraEffects:[]};
const off=r=>({...r,equipBuffEnabled:false});
const on=calc([oldCoat]);const disabled=calc([off(oldCoat)]);
assert.equal(on.extraStats.extraHitPct-disabled.extraStats.extraHitPct,15);
assert.equal(on.extraStats.extraHit-disabled.extraStats.extraHit,0,'no misparsed +1 hit');
assert.equal(on.extraStats.extraAttackDelay,disabled.extraStats.extraAttackDelay,'gun-only delay is not common delay');
assert.equal(on.extraStats.extraAttackDelayPct,disabled.extraStats.extraAttackDelayPct,'gun-only percent is not common percent');
assert.match(p.equipmentBuffEffectText(oldCoat),/銃器ディレイ\s*-20%/);
assert.match(p.equipmentBuffEffectText(oldCoat),/生産MGマス\s*\+2/);
const gun=rowFor('リンカニック ビヤード');
assert.equal(calc([coat,gun]).extraStats.extraHitPct-calc([off(coat),off(gun)]).extraStats.extraHitPct,35,'independent hit bonuses are not suppressed by delay competition');
const uniform=rowFor('アメフト ユニフォーム');
assert.match(p.equipmentBuffEffectText(uniform),/攻撃力\+3%/);
assert.match(p.equipmentBuffEffectText(uniform),/モーション変化/);
const armor=rowFor('アイズ・ヴァレンシュタイン なりきりアーマー');
const old={...armor,extraEffects:[
  {key:'custom',name:'特攻×1.5',scope:'display'},
  {key:'custom',name:'ドラゴン特攻',value:1.5,unit:'倍',scope:'display'},
  {key:'custom',name:'dragon:1.5',scope:'display'}]};
const before=JSON.stringify(old);
for(let n=0;n<3;n++) {
  const text=p.equipmentBuffEffectText(old);
  assert.equal((text.match(/特攻/g)||[]).length,1,text);
  assert.ok(text.includes('攻撃力+5%')&&text.includes('ドラゴン特攻×1.5'),text);
  assert.ok(!text.includes('dragon:'),text);
  const composite=p.compositeEffectText(p.equipmentBuffToCompositeRow(old));
  assert.equal((composite.match(/特攻/g)||[]).length,1,composite);
}
assert.equal(JSON.stringify(old),before,'display does not mutate saved data');
assert.equal(calc([old]).specialMultiplier,1.5);
assert.equal(calc([old],{targetRace:'demon'}).specialMultiplier,1);
assert.ok(Math.abs(calc([old]).rawDamage/calc([old],{targetRace:'demon'}).rawDamage-1.5)<1e-9,'display dedup leaves actual damage intact');
assert.equal(calc([off(old)]).specialMultiplier,1);
for(const [id] of TIMING_EXPECTATIONS) {
  const rule=p.findEquipBuffRuleCandidate({officialTechnicId:id});
  const saved={enabled:true,equipBuffEnabled:true,equipBuffName:rule.name,extraEffects:[],equipBuffTechnicId:id};
  const resolved=p.resolveEquipmentBuffRow(saved);
  const again=p.resolveEquipmentBuffRow(resolved);
  assert.equal(p.equipmentBuffEffectText(resolved),p.equipmentBuffEffectText(again),rule.name+' idempotent');
  assert.equal(calc([off(saved)]).extraStats.extraHitPct,0,'Buff off '+rule.name);
}
for(const id of [11160,2967]) {
  const saved={enabled:true,equipBuffEnabled:true,equipBuffTechnicId:id,equipBuffExtraMagicDelay:-1,equipBuffExtraMagicDelayPct:-15,equipBuffExtraAttackDelayPct:-5};
  const r=p.resolveEquipmentBuffRow(saved);
  if(id===11160) {assert.equal(r.equipBuffExtraMagicDelay,0);assert.equal(r.equipBuffExtraMagicDelayPct,0);}
  else assert.equal(r.equipBuffExtraAttackDelayPct,0);
}
const dedup=labels=>Array.from(p.deduplicateEquipmentBuffEffectLabels(labels));
assert.deepEqual(dedup(['dragon:1.5','dragon:1.2','demon:1.5']),['ドラゴン特攻×1.5','ドラゴン特攻×1.2','悪魔特攻×1.5']);
assert.deepEqual(dedup(['ドラゴン特攻+15%','ドラゴン特攻×1.5（夜間）']),['ドラゴン特攻+15%','ドラゴン特攻×1.5（夜間）']);
assert.deepEqual(dedup(['特攻×1.5','dragon:1.5','demon:1.5']),['特攻×1.5','ドラゴン特攻×1.5','悪魔特攻×1.5'],'ambiguous generic multiplier must not select a race');
assert.deepEqual(dedup(['devil:1.2','悪魔特攻 +1.20倍']),['悪魔特攻×1.2']);
console.log('equipment Buff presentation runtime regressions: OK',JSON.stringify(counts));
