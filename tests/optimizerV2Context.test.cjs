const assert=require('node:assert/strict'),vm=require('node:vm');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const {json}=require('../tools/benchmark-optimizer.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,E=p.MOEOptimizerV2EffectiveCandidates;
const item=(id,overrides={})=>({catalogId:id,name:id,slot:'防具: 頭',category:'defense',info:'flavor '+id,
  equipRace:'ALL',equipGender:'ALL',extraStats:{attack:5},...overrides});
const snapshot=items=>p.MOEOptimizerV2Candidates.generate({items});
const base=snapshot([item('a'),item('b',{info:'different unknown story',armorClass:20})]);
const c=C.create({inputs:{str:100,spirit:100}});
const before=JSON.stringify(base),live=vm.runInContext('state',p),runtime=p.MOE_BUFF_RULES_MANUAL;
let r=E.reduce(base,c);
assert.equal(r.candidates.length,1,'unused description and AC do not block model equivalence');
assert.equal(r.equivalentGroups[0].equivalentCandidateIds.length,2,'identities retained');
assert.equal(JSON.stringify(base),before);assert.equal(vm.runInContext('state',p),live);assert.equal(p.MOE_BUFF_RULES_MANUAL,runtime);
assert.equal(E.reduce(base,C.create({minAC:10})).candidates.length,2,'conditional AC participates');
assert.equal(E.reduce(base,C.create({topK:20})).candidates.length,1,'topK counts performance classes');
for (const topK of [1,20]) {
  const reduced=E.reduce(base,C.create({topK})),cls=reduced.equivalentClasses[0];
  assert.equal(reduced.equivalentClasses.length,1);
  assert.equal(cls.equivalentCandidates.length,2);
  assert.deepEqual(Array.from(cls.equivalentCandidateIds).sort(),Array.from(base.candidates,x=>x.candidateId).sort());
  for(const original of base.candidates) assert.equal(E.resolveCandidate(cls,original.candidateId),original);
  assert.throws(()=>E.resolveCandidate(cls,'missing'));
  const configurations=base.candidates.map(x=>E.describeConfiguration(reduced,[x.candidateId]));
  assert.equal(new Set(configurations.map(x=>x.performanceKey)).size,1,'ID alternatives cannot fill Top-K');
  assert.equal(configurations[1].equipment[0].selectedCandidate,base.candidates[1]);
  assert.equal(configurations[1].equipment[0].equivalentCandidates.length,2);
}
const distinct=snapshot([item('same-a'),item('same-b'),item('different',{extraStats:{attack:6}})]);
const distinctResult=E.reduce(distinct,C.create({topK:20}));
assert.equal(distinctResult.equivalentClasses.length,2);
assert.equal(new Set(distinct.candidates.map(x=>E.describeConfiguration(distinctResult,[x.candidateId]).performanceKey)).size,2);
const requirements=snapshot([item('req-a',{requirements:[{name:'着こなし',required:10}]}),
  item('req-b',{requirements:[{name:'着こなし',required:20}]})]);
assert.equal(E.reduce(requirements,C.create({topK:20})).equivalentClasses.length,2,'non-weapon requirements remain distinct');
// Ignoring descriptions must never discard different resolved, calculation-affecting Buffs.
const resolved=json(base);
for(let i=0;i<resolved.candidates.length;i++) Object.assign(resolved.candidates[i].evaluationFields,
  {equipBuffEnabled:true,equipBuffName:'test active Buff '+i,equipBuffFlatAttack:i+10});
const protectedResult=E.reduce(resolved,c);
assert.equal(protectedResult.candidates.length,2);assert.equal(protectedResult.diagnostics.protectedRetainedCount,2);
assert.equal(protectedResult.equivalentClasses.length,2);
assert.ok(protectedResult.equivalentClasses.every(cls=>cls.equivalentCandidates.length===1));
assert.notEqual(protectedResult.effectiveCandidates[0].fingerprint,protectedResult.effectiveCandidates[1].fingerprint);
assert.equal(E.reduce(base,C.create({fixedCandidateIds:[base.candidates[1].candidateId]})).candidates[0].catalogId,'b');
assert.equal(E.reduce(base,C.create({excludedCandidateIds:[base.candidates[0].candidateId]})).candidates[0].catalogId,'b');
assert.equal(E.reduce(base,C.create({ownedOnly:true,ownedCandidateIds:[base.candidates[1].candidateId]})).candidates[0].catalogId,'b');
assert.throws(()=>C.create({ownedOnly:true}));assert.throws(()=>C.create({objective:'unknown'}));
assert.throws(()=>C.create({objective:'attackDps',mainWeaponSkill:'刀剣'}));
assert.throws(()=>C.create({selfOnly:true}));
const restricted=snapshot([item('female',{equipGender:'女'}),item('male',{equipGender:'男'}),
  item('unknown',{equipGender:'uninterpreted'}),item('otherRace',{equipRace:'cognite'})]);
r=E.reduce(restricted,C.create({race:'newtar',gender:'male'}));
assert.deepEqual(Array.from(r.filtered,x=>x.reason).sort(),['gender-restriction','race-restriction']);
assert.equal(r.candidates.length,2,'unknown restrictions retained');
const delays=snapshot([item('slow',{extraStats:{attack:5,extraAttackDelay:-5}}),item('fast',{extraStats:{attack:5,extraAttackDelay:-10}})]);
r=E.reduce(delays,C.create({attackDelayRequirement:-60}));
assert.equal(E.reduce(delays,C.create({attackDelayRequirement:-60,topK:20})).candidates.length,2,
  'strictly dominated but non-equivalent alternatives may belong in Top-K');
assert.equal(r.candidates[0].catalogId,'fast');assert.equal(r.removed[0].reason,'context-dominance');
assert.equal(C.evaluate(C.create({attackDelayRequirement:-60}),r.candidates,delays.sources).feasible,false,
  'a candidate is not removed merely for failing a whole-build threshold');
const magic=snapshot([item('magic',{extraStats:{attack:5,magic:10}}),item('plain')]);
assert.equal(E.reduce(magic,c).candidates.length,2,'magic preserved for possible selected conversion Buff');
const buff=snapshot([item('buff',{equipBuff:{name:'カタログ未解釈',info:'説明'}}),item('plain')]);
// Actual resolver is the authority; a named Buff with no effect may be ignored by the official model.
assert.equal(E.reduce(buff,c).diagnostics.afterFilterCount,2);
const weapons=snapshot([{catalogId:'weak',name:'weak',category:'weapon',slot:'武器: 右手',weaponType:'刀剣',weaponHand:'1HAND',
  weaponDamage:20,weaponAttackInterval:200,weaponReq:[{name:'刀剣',required:100},{name:'採掘',required:80}],
  requirements:[{name:'刀剣',required:100},{name:'採掘',required:80}]},
  {catalogId:'bow',name:'bow',category:'weapon',slot:'武器: 右手',weaponType:'弓',weaponHand:'2HAND',
    weaponDamage:50,weaponReq:[{name:'弓',required:100}]}]);
const wc=C.create({mainWeaponSkill:'刀剣',mainWeaponSlot:'武器: 右手'});
r=E.reduce(weapons,wc);assert.equal(r.candidates.length,1);assert.equal(r.candidates[0].catalogId,'weak');
assert.equal(r.effectiveCandidates[0].skillPerformance,0,'zero proficiency is retained');
assert.ok(C.evaluate(wc,r.candidates,weapons.sources).feasible);
assert.throws(()=>C.withRuntime(c,()=>{throw new Error('test');}),/test/);
assert.equal(vm.runInContext('state',p),live);assert.equal(p.MOE_BUFF_RULES_MANUAL,runtime);
const oldNpc=p.MOE_NPC_EFFECT_SLOTS;
p.MOE_NPC_EFFECT_SLOTS={getAcDelta:()=>-20,getDamageTakenMultiplier:()=>1.2};
const npcContext=C.create({targetAC:100,inputs:{str:100}});
p.MOE_NPC_EFFECT_SLOTS={getAcDelta:()=>999,getDamageTakenMultiplier:()=>5};
assert.equal(C.evaluate(npcContext,[base.candidates[0]],base.sources).metrics.npcAcDelta,-20);
assert.equal(p.MOE_NPC_EFFECT_SLOTS.getAcDelta(),999,'caller runtime restored');
if(oldNpc===undefined)delete p.MOE_NPC_EFFECT_SLOTS;else p.MOE_NPC_EFFECT_SLOTS=oldNpc;
// Official model intentionally does not turn equipment crit bonuses into inputs.critRate.
const x=C.evaluate(c,[base.candidates[0]],base.sources),y=C.evaluate(c,[base.candidates[1]],base.sources);
assert.equal(x.score,y.score);
assert.ok(Number.isFinite(x.score));assert.deepEqual(json(c.baseState.equipment),[]);
console.log('context projection: metadata separation, restrictions/ownership/fixed/topK, thresholds, skills, runtime restoration OK');
