const assert=require('node:assert/strict');
const {context,json,root}=require('../tools/benchmark-optimizer.cjs');
const p=context(root,{catalog:true});
const row=id=>p.catalogEquipmentToRow(p.equipmentCatalogItems().find(i=>i.buffRefs.includes('technic-'+id)));
const group=(r,g)=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups).includes(g);
let king=row(13685);assert.ok(group(king,'skillBuff:暗黒命令:M'));assert.ok(group(king,'skillBuff:死の魔法:W'));
king.equipBuffConflictGroup='skillBuff:暗黒命令:A';king.equipBuffConflictGroups='skillBuff:暗黒命令:A,skillBuff:死の魔法:F,custom';king.tags='skillBuff:暗黒命令:A,skillBuff:死の魔法:F,custom';
king=p.resolveEquipmentBuffRow(king);
assert.ok(group(king,'skillBuff:暗黒命令:M'));assert.ok(group(king,'skillBuff:死の魔法:W'));assert.ok(group(king,'custom'));
for(const key of ['tags','equipBuffConflictGroups','equipBuffConflictGroup']){assert.ok(!king[key].includes('skillBuff:暗黒命令:A'));assert.ok(!king[key].includes('skillBuff:死の魔法:F'));}
assert.deepEqual(json(p.resolveEquipmentBuffRow(king)),json(king),'migration idempotent');
const skill=(r,name)=>r.extraEffects.filter(e=>e.key==='skillPlus'&&e.name===name).reduce((s,e)=>s+e.value,0);
const strange=row(13876);strange.extraEffects.push({key:'skillPlus',name:'暗黒命令',value:10,scope:'display'});
assert.equal(skill(p.resolveEquipmentBuffRow(strange),'暗黒命令'),20);
const mage=row(9201);mage.tags+=' ,skillBuff:回復魔法:O';mage.equipBuffConflictGroup='skillBuff:回復魔法:O';mage.extraEffects.push({key:'skillPlus',name:'回復魔法',value:10,scope:'display'});
const repaired=p.resolveEquipmentBuffRow(mage);assert.equal(skill(repaired,'回復魔法'),0);assert.equal(skill(repaired,'破壊魔法'),10);assert.ok(!group(repaired,'skillBuff:回復魔法:O'));
for(const [id,g] of [[13870,'E'],[14426,'F']]){const r=row(id);assert.equal(skill(r,'自然調和'),20);assert.ok(group(r,'skillBuff:自然調和:'+g));}
const artemis=row(14426);assert.equal(artemis.equipBuffAttackPct,3);assert.equal(artemis.equipBuffExtraHitPct,20);
const stone=row(13682);assert.equal(stone.equipBuffDmgPct,10);assert.equal(stone.equipBuffExtraACPct,10);assert.ok(group(stone,'damage:physical:A'));assert.ok(stone.extraEffects.some(e=>e.key==='elementDamagePct'&&e.name==='地属性'&&e.value===10));
const phantom=row(14404);assert.ok(group(phantom,'damage:element:water:I'));assert.ok(!phantom.extraEffects.some(e=>e.key==='elementDamagePct'&&e.value));
assert.equal(p.MOE_BUFF_RULES_MANUAL['technic-14427'].conflictGroup,'critical:L');
assert.equal(skill(row(12763),'回復魔法'),15);assert.equal(skill(row(13240),'回復魔法'),10);
// Catch all IDs, duplicate registrations and inconsistent normalized group keys.
for(const [kind,rows] of [['skill',p.MOE_SKILL_BUFF_COMPATIBILITY_GENERATED],['damage',p.MOE_DAMAGE_BUFF_COMPATIBILITY_GENERATED]]){
 const ids=new Set();for(const r of rows){assert.ok(!ids.has(r.id),r.id);ids.add(r.id);if(kind==='skill'&&r.buffName==='闇の王')assert.equal(r.conflictGroup,`skillBuff:${r.skillName}:${r.group}`);}
}
console.log('Compatibility audit: corrected values/groups, saved-row migration, preserved overrides OK');
// Snapshot of every group row from the two user-provided Wiki tables.
// Explicit exceptions are source disagreements or the user's established override.
const fixture=require('./fixtures/compatibility-wiki-20260922.json');
const norm=s=>String(s||'').replace(/[\s　]/g,'');
for(const kind of ['skill','damage'])for(const expected of fixture[kind]){
 if(expected.name==='薔薇の輝き')continue; // critical:L independent override tested above
 const rows=(kind==='skill'?p.MOE_SKILL_BUFF_COMPATIBILITY_GENERATED:p.MOE_DAMAGE_BUFF_COMPATIBILITY_GENERATED).filter(r=>norm(r.skillName||r.sectionName)===norm(expected.section)&&norm(r.buffName)===norm(expected.name));
 assert.ok(rows.length,`${kind}: ${expected.section}/${expected.name} missing`);
 for(const actual of rows){
  assert.equal(actual.group,expected.group,`${expected.section}/${expected.name} group`);
  const match=expected.valueRaw.match(/^\+?(\d+(?:\.\d+)?)%?$/);
  if(!match)continue;
  if(expected.section==='回復魔法'&&['上級魔術師','魔法陣ブースト'].includes(expected.name))continue; // conflicting source values, preserved above
  assert.equal(actual.value,Number(match[1]),`${expected.section}/${expected.name} value`);
 }
}
console.log(`Wiki table snapshot: ${fixture.skill.length+fixture.damage.length} source rows audited`);
