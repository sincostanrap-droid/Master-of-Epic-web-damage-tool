const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {context,json,root}=require('../tools/benchmark-optimizer.cjs');
const p=context(root,{catalog:true});
const report=JSON.parse(fs.readFileSync(path.join(root,'docs/wiki-buff-review-20260922.json')));
for(const f of ['showcaseSkillPlusTotals','showcaseElementDamageTotals']) vm.runInContext(fs.readFileSync(path.join(root,'src/ui/'+f+'.js'),'utf8'),p);
const items=p.equipmentCatalogItems();
const row=id=>{const item=items.find(x=>x.buffRefs.includes('technic-'+id));assert.ok(item,String(id));return {...json(p.catalogEquipmentToRow(item)),enabled:true};};
const inputs={raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,atkCap:500,techMultiplier:1};
const state=rows=>{const s=vm.runInContext('DEFAULT_STATE()',p);s.equipment=rows;s.composite=[];return s;};
const metrics=rows=>p.computeMetrics(state(rows),inputs);
const resolved=rows=>{p.__rows=json(rows);vm.runInContext('state=DEFAULT_STATE();state.equipment=__rows;state.composite=[]',p);return p.showcaseResolvedBuffState();};
for(const r of [...report.skillRows,...report.damageRows]) {
 assert.ok(!/[?？]/.test(r.conflictGroup));
 const actual=(r.skillName?p.MOE_SKILL_BUFF_COMPATIBILITY_GENERATED:p.MOE_DAMAGE_BUFF_COMPATIBILITY_GENERATED).filter(x=>x.id===r.id);
 assert.equal(actual.length,1);assert.equal(actual[0].value,r.value);
}
for(const id of [14633,14581]) {
 const r=row(id);const value=id===14633?56.25:75;
 for(const key of ['hpRegenPerMinute','mpRegenPerMinute','stRegenPerMinute']) {
  assert.equal(metrics([r]).extraStats[key],value);
  assert.equal(metrics([r,r]).extraStats[key],value,'same technic counted once');
  assert.equal(metrics([{...r,equipBuffEnabled:false}]).extraStats[key]||0,0);
 }
}
for(const id of [14580,14577]) {
 const r=row(id);const on=metrics([r]).finalDamage,off=metrics([{...r,equipBuffEnabled:false}]).finalDamage;
 assert.ok(on>off,'physical damage applied');assert.ok(Math.abs(on/off-1.1)<0.00001);
}
const dragon=p.resolveEquipmentBuffRow(row(14486));
assert.equal(dragon.equipBuffAttackPct,3);assert.equal(dragon.equipBuffExtraACPct,10);assert.equal(dragon.equipBuffExtraMaxWeightPct,20);
assert.equal(p.resolveEquipmentBuffRow(row(14577)).equipBuffSpecial||1,1,'unknown dragon multiplier not invented');
assert.equal(p.showcaseElementDamageTotals(resolved([row(14611)]))['火属性'],10);
assert.equal(p.showcaseElementDamageTotals(resolved([row(14581)]))['風属性'],20);
assert.equal(p.showcaseElementDamageTotals(resolved([row(14485)]))['地属性'],15);
const bell=row(14635);assert.equal(metrics([bell]).finalDamage,metrics([{...bell,equipBuffEnabled:false}]).finalDamage,'skillPlus not effective skill');
assert.equal(p.resolveEquipmentBuffRow(row(14618)).extraEffects.filter(e=>e.key==='skillPlus').length,0,'fang direct damage bonus is not generic fang skillPlus');
// Same-group Buffs are resolved by the existing Buff-level exclusivity policy.
const conflict=resolved([row(14633),row(14484)]).composite.filter(x=>x.enabled&&!x.excluded);
assert.equal(conflict.length,1,'recovery magic group O conflicts');
assert.equal(resolved([row(14580),row(14577)]).composite.filter(x=>x.enabled&&!x.excluded).length,2,'physical groups A/C coexist');
assert.equal(report.skillRows.find(x=>x.buffName==='斉天大聖').safeForConflictAutoApply,false,'battle skill section explicitly allows coexistence');
const stale=row(14539);stale.extraEffects.push({key:'custom',name:'公式説明（数値計算・併用未検証）: old',value:0,scope:'display'});
assert.ok(!p.equipmentBuffEffectText(stale).includes('old'));
assert.ok(p.equipmentBuffEffectText(stale).includes('10%'));
for(const id of report.pending){assert.equal(p.MOE_BUFF_RULES_MANUAL[id].reviewComplete,false);}
const worker=context(root,{worker:true});
for(const id of [14633,14580,14486]) assert.deepEqual(json(worker.computeMetrics(state([row(id)]),inputs)),json(metrics([row(id)])),'worker/main agree');
console.log('Wiki new Buffs: runtime values, ON/OFF, groups, displays, unknowns, worker parity OK');
// Multi-group resolution: a rejected candidate must not suppress a compatible third Buff.
const grouped=p.applyBuffGroupRules({composite:[
 {name:'first',enabled:true,tags:'a',flatAttack:30},
 {name:'bridge',enabled:true,tags:'a,b',flatAttack:20},
 {name:'third',enabled:true,tags:'b',flatAttack:10}
]});
assert.deepEqual(json(grouped.composite.filter(r=>r.enabled).map(r=>r.name)),['first','third']);
const reversed=p.applyBuffGroupRules({composite:[
 {name:'high',enabled:true,tags:'b,a',flatAttack:30},
 {name:'low',enabled:true,tags:'a',flatAttack:10}
]});
assert.deepEqual(json(reversed.composite.filter(r=>r.enabled).map(r=>r.name)),['high']);
