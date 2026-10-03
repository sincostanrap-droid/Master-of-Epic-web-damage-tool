const assert = require('node:assert/strict');
const vm = require('node:vm');
const {paretoContext} = require('../tools/inspect-optimizer-v2-pareto.cjs');
const {json} = require('../tools/benchmark-optimizer.cjs');
const p = paretoContext(), api = p.MOEOptimizerV2Pareto;
const armor = (id, attack, overrides={}) => ({catalogId:id, name:id, category:'defense', slot:'防具: 頭',
  equipRace:'ALL', equipGender:'ALL', armorClass:10, requirements:[], extraStats:{attack}, ...overrides});
const weapon = (id, damage, required=50, overrides={}) => ({catalogId:id,name:id,category:'weapon',slot:'武器: 右手',
  weaponType:'刀剣',weaponHand:'1HAND',weaponDamage:damage,weaponAttackInterval:200,
  requirements:[{name:'刀剣',required}],weaponReq:[{name:'刀剣',required}],...overrides});
function run(items) {
  const snapshot = p.MOEOptimizerV2Candidates.generate({items});
  assert.equal(snapshot.candidates.length,items.length);
  const before = JSON.stringify(snapshot);
  const result = api.reduce(snapshot);
  assert.equal(JSON.stringify(snapshot),before);
  for (const removed of result.removed) {
    const b=snapshot.candidates.find(c=>c.candidateId===removed.candidateId);
    const a=result.candidates.find(c=>c.candidateId===removed.dominatedByCandidateId);
    assert.ok(a,'witness is retained');
    assert.deepEqual(json(api.compare(a,b,snapshot.sources)),json(removed.dominanceReason));
  }
  return {snapshot,result};
}
function ids(result) { return Array.from(result.candidates,c=>c.catalogId).sort(); }
// 1. Strictly worse in all axes. No equipment or source state gets edited.
let {result}=run([armor('better',5,{armorClass:20,extraStats:{attack:5,extraCritRatePct:10,extraAttackDelay:-10}}),
  armor('worse',1,{armorClass:10,extraStats:{attack:1,extraCritRatePct:5,extraAttackDelay:-5}})]);
assert.deepEqual(ids(result),['better']);assert.equal(result.removed[0].dominanceReason.improvedAxes.length,4);
// 2. One superior axis prevents removal.
assert.deepEqual(ids(run([armor('attack',10,{armorClass:5}),armor('ac',5,{armorClass:10})]).result),['ac','attack']);
// 3. Negative delay: -10 beats -5. Positive increases also have the correct ordering.
for (const [better,worse] of [[-10,-5],[-1,0],[0,5]]) {
  assert.deepEqual(ids(run([armor('fast',1,{extraStats:{extraAttackDelay:better}}),
    armor('slow',1,{extraStats:{extraAttackDelay:worse}})]).result),['fast']);
}
// 4. Higher requirement is not a superior replacement; a lower single requirement is safe.
assert.equal(run([weapon('strong',20,90),weapon('easy',10,50)]).result.candidates.length,2);
assert.deepEqual(ids(run([weapon('strong',20,40),weapon('hard',10,50)]).result),['strong']);
// 5. Armor now shares weighted proficiency with weapons; multi-skill
// requirements cannot safely be ordered pointwise.
const req = (a,b)=>[{name:'着こなし',required:a},{name:'筋力',required:b}];
assert.equal(run([armor('a',20,{requirements:req(10,90)}),armor('b',10,{requirements:req(20,40)})]).result.candidates.length,2);
assert.deepEqual(ids(run([armor('a',20,{requirements:req(10,30)}),armor('b',10,{requirements:req(20,40)})]).result),['a','b']);
assert.deepEqual(ids(run([armor('a',20),armor('b',10,{requirements:req(20,40)})]).result),['a','b']);
// Lowering a satisfied secondary weapon requirement can reduce official proficiency!
const wa=weapon('a',11,80,{requirements:[{name:'刀剣',required:80},{name:'採掘',required:10}],
  weaponReq:[{name:'刀剣',required:80},{name:'採掘',required:10}]});
const wb=weapon('b',10,80,{requirements:[{name:'刀剣',required:80},{name:'採掘',required:100}],
  weaponReq:[{name:'刀剣',required:80},{name:'採掘',required:100}]});
assert.equal(run([wa,wb]).result.candidates.length,2,'multi-skill weapon differences retained');
const st=vm.runInContext('DEFAULT_STATE()',p);st.skillSim.skills['刀剣']=64;st.skillSim.skills['採掘']=100;
p.__st=st;vm.runInContext('state=clone(__st)',p);
const ma=p.calcWeaponSkillMod({...st,equipment:[{...p.catalogEquipmentToRow(wa),enabled:true}]});
const mb=p.calcWeaponSkillMod({...st,equipment:[{...p.catalogEquipmentToRow(wb),enabled:true}]});
assert.ok(ma.mod<mb.mod,'official calculator confirms the counterexample');
assert.ok(ma.mod*wa.weaponDamage<mb.mod*wb.weaponDamage,'even the stronger base weapon can lose');
const same={...wa,catalogId:'same',name:'same',weaponDamage:10};
assert.deepEqual(ids(run([wa,same]).result),['a'],'identical multi-weapon requirements are comparable');
// 6. Different equipment Buffs; even identical unproven Buffs are retained.
for (const name of ['different','same']) {
  const out=run([armor('a',20,{equipBuff:{name:'same',info:'未知'}}),armor('b',10,{equipBuff:{name,info:'未知'}})]);
  assert.equal(out.result.candidates.length,2);assert.equal(out.result.diagnostics.conservativeRetainedCount,2);
  const fingerprints=out.snapshot.candidates.map(c=>api.inspect(c,out.snapshot.sources).fingerprint);
  assert.equal(fingerprints[0]===fingerprints[1],name==='same','only identical Buff semantics share a fingerprint');
}
// 7. Conditional effects are opaque and never assumed harmless.
let pair=run([armor('a',20,{conditions:{belowHP:50}}),armor('b',10,{conditions:{belowHP:20}})]);
assert.equal(pair.result.candidates.length,2);
assert.notEqual(api.inspect(pair.snapshot.candidates[0],pair.snapshot.sources).fingerprint,
  api.inspect(pair.snapshot.candidates[1],pair.snapshot.sources).fingerprint);
// 8/10. Unknown effects and skillPlus cannot improve eligibility; fingerprint retains their semantics.
for (const effect of [{key:'skillPlus',name:'刀剣',value:100},{key:'futureEffect',name:'unknown',value:10}]) {
  const snapshot=json(p.MOEOptimizerV2Candidates.generate({items:[weapon('hard',20,90),weapon('easy',10,50)]}));
  snapshot.candidates[0].effects=[effect];snapshot.candidates[0].skillPlus=effect.key==='skillPlus'?[effect]:[];
  snapshot.candidates[0].evaluationFields.extraEffects=[effect];
  assert.equal(api.reduce(snapshot).candidates.length,2);
}
// 9. Weapon kind, hand form, ammo compatibility, race/gender and quality cannot mix.
for (const changes of [{weaponType:'槍'},{weaponHand:'2HAND'},{ammoKind:'arrow'},
  {equipRace:'ELF'},{equipGender:'FEMALE'}]) {
  assert.equal(run([weapon('a',20,50,changes),weapon('b',10,50)]).result.candidates.length,2);
}
assert.equal(run([armor('a',20,{info:'Only while underwater'}),armor('b',10)]).result.candidates.length,2);
assert.equal(run([armor('a',20,{extraStats:{attack:20,futureStat:1}}),armor('b',10)]).result.candidates.length,2);
assert.equal(run([armor('a',20,{extraStats:{attack:20,futureStat:0}}),armor('b',10)]).result.candidates.length,2);
assert.equal(run([armor('a',20,{addStatuses:[{statKey:'attack',name:'攻撃力',value:20,conditions:{underwater:true}}]}),
  armor('b',10)]).result.candidates.length,2,'unknown nested status condition is retained');
assert.equal(run([armor('a',20,{addStatuses:{futureFormat:true}}),armor('b',10)]).result.candidates.length,2);
// Complete equivalents remain separate for later ownership/name constraints.
assert.equal(run([armor('a',10),armor('b',10)]).result.candidates.length,2);
// No cap-based extra pruning, even beyond -60 / 100%.
pair=run([armor('a',0,{extraStats:{attack:5,extraCritRatePct:110,extraAttackDelay:-70}}),
  armor('b',0,{extraStats:{attack:10,extraCritRatePct:100,extraAttackDelay:-60}})]);
assert.equal(pair.result.candidates.length,2);
// Transitive deletion witnesses always point to a retained winner, independent of input order.
const chain=[armor('c',3),armor('b',2),armor('a',1)];
const one=run(chain).result,two=run(chain.slice().reverse()).result;
assert.deepEqual(json(one.removed),json(two.removed));assert.deepEqual(ids(one),['c']);
assert.equal(api.reduce({candidates:[],sources:{}}).diagnostics.reductionRate,0);
assert.throws(()=>api.reduce(pair.snapshot,{context:{ownedOnly:true}}),/not supported/);
// Missing sources, nonfinite values and unfamiliar requirement syntax must fail closed.
let invalid=json(pair.snapshot);invalid.sources={};assert.equal(api.reduce(invalid).candidates.length,2);
invalid=json(pair.snapshot);invalid.candidates[0].evaluationFields.attack=NaN;
assert.equal(api.reduce(invalid).candidates.length,2);
assert.equal(run([armor('a',20,{requirements:[{name:'unknown-skill',required:10}]}),armor('b',10)]).result.candidates.length,2);
console.log('v2 Pareto: all 10 safety scenarios, multi-skill official counterexample, equivalents, caps, deterministic witnesses and invalid data OK');
