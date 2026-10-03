const assert=require('node:assert/strict');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,E=p.MOEOptimizerV2EffectiveCandidates;
const item=(id,extraStats={})=>({catalogId:id,name:id,category:'defense',slot:'防具: 頭',extraStats});
const snapshot=items=>p.MOEOptimizerV2Candidates.generate({items});
const dpsOptions={objective:{metric:'attackDps',direction:'max'},mainWeaponSkill:'銃器'};
const gun={catalogId:'gun',name:'test gun',category:'weapon',slot:'武器: 右手',weaponType:'銃器',
  weaponDamage:50,weaponAttackInterval:250,weaponReq:[{name:'銃器',required:1}]};
const gunCandidate=snapshot([gun]);
function compareWithGun(s,c,a,b) {
  const sources={...s.sources,...gunCandidate.sources};
  return [a,b].map(x=>C.evaluate(c,[gunCandidate.candidates[0],x],sources));
}
for(const [metric,stat] of [['ac','extraAC'],['hit','extraHit']]) {
  const s=snapshot([item('low',{[stat]:5}),item('high',{[stat]:20})]),before=JSON.stringify(s);
  for(const topK of [1,20]) {
    const dps=C.create({...dpsOptions,topK}),specific=C.create({objective:{metric,direction:'max'},topK});
    assert.equal(E.reduce(s,dps).contextEquivalentClasses.length,1,metric+' ignored by current DPS');
    assert.equal(E.reduce(s,specific).contextEquivalentClasses.length,2,metric+' reprojected');
    const [a,b]=compareWithGun(s,dps,...s.candidates);assert.equal(a.score,b.score);
    const [x,y]=compareWithGun(s,specific,...s.candidates);assert.ok(y.score>x.score);
  }
  assert.equal(JSON.stringify(s),before);
}
const armor=snapshot([item('low',{extraAC:5}),item('high',{extraAC:20})]);
const constrained=C.create({...dpsOptions,constraints:[{metric:'ac',op:'gte',value:10}]});
assert.equal(E.reduce(armor,constrained).contextEquivalentClasses.length,2);
const acContext=C.create({objective:'ac',constraints:[{metric:'ac',op:'gte',value:10}]});
assert.equal(E.reduce(snapshot([item('attack-a',{extraAC:5,attack:10}),item('attack-b',{extraAC:5,attack:20})]),acContext).contextEquivalentClasses.length,1,
  'AC projection does not retain unrelated firepower axes');
assert.equal(C.evaluate(acContext,[armor.candidates[0]],armor.sources).feasible,false);
assert.equal(C.evaluate(acContext,[armor.candidates[1]],armor.sources).feasible,true);
// Synthetic official rows: a pure skill Buff, same stack identity, no competition group.
// Different Buff identities/groups remain protected or have different fingerprints.
const skills=JSON.parse(JSON.stringify(snapshot([item('a'),item('b'),item('c')])));
const effect=(name,value)=>({key:'skillPlus',name,value,scope:'display'});
skills.candidates.forEach((candidate,i)=>Object.assign(candidate.evaluationFields,{
  equipBuffEnabled:true,equipBuffName:'synthetic isolated skill Buff',
  extraEffects:[effect('銃器',i===1?20:10),effect('回復魔法',i===2?30:5)]
}));
const beforeSkills=JSON.stringify(skills);
for(const topK of [1,20]) {
  const dps=C.create({...dpsOptions,topK});
  assert.equal(E.reduce(skills,dps).contextEquivalentClasses.length,1,'skillPlus not used for attack proficiency');
  const context=C.create({objective:{metric:'skillPlus',skillName:'銃器',direction:'max'},topK});
  const result=E.reduce(skills,context);
  assert.equal(result.contextEquivalentClasses.length,2);
  assert.equal(result.contextEquivalentClasses.find(g=>g.equivalentCandidateIds.includes(skills.candidates[0].candidateId)).equivalentCandidates.length,2,
    'unobserved recovery skill alone does not split isolated Buff alternatives');
  assert.deepEqual(skills.candidates.map(x=>C.evaluate(context,[x],skills.sources).score),[10,20,10]);
  for(const cls of result.contextEquivalentClasses) for(const original of cls.equivalentCandidates) {
    assert.equal(E.resolveCandidate(cls,original.candidateId),original);
    assert.equal(cls.equivalenceScope,'SearchContext');
    assert.equal(cls.equipmentEquivalence,'not-assessed');
  }
  const withSkillConstraint=C.create({objective:'ac',constraints:[{metric:{metric:'skillPlus',skillName:'銃器'},op:'gte',value:20}],topK});
  assert.equal(E.reduce(skills,withSkillConstraint).contextEquivalentClasses.length,2);
  assert.deepEqual(skills.candidates.map(x=>C.evaluate(withSkillConstraint,[x],skills.sources).feasible),[false,true,false]);
  const keys=skills.candidates.map(x=>E.describeConfiguration(result,[x.candidateId]).performanceKey);
  assert.equal(new Set(keys).size,2,'ID variants do not fill Top-K');
}
assert.equal(JSON.stringify(skills),beforeSkills);
const grouped=JSON.parse(beforeSkills);
grouped.candidates.forEach(c=>c.evaluationFields.equipBuffConflictGroup='skill-test-competition');
assert.equal(E.reduce(grouped,C.create(dpsOptions)).candidates.length,3,'group score interactions are protected');
// Same stack key on a later slot still suppresses either same-slot alternative identically.
const later=JSON.parse(JSON.stringify(skills.candidates[1]));later.candidateId+='later';later.slot='防具: 胴';later.evaluationFields.slot=later.slot;
for(const candidate of [skills.candidates[0],skills.candidates[2]]) {
  const context=C.create({objective:{metric:'skillPlus',skillName:'銃器'}});
  assert.equal(C.evaluate(context,[candidate,later],skills.sources).score,20);
}
const delay=snapshot([item('delay',{extraAttackDelay:-60})]);
const min=C.create({objective:{metric:'attackDelay',direction:'min'}});
const value=C.evaluate(min,delay.candidates,delay.sources);assert.equal(value.score,-60);assert.equal(value.rankScore,60);
assert.equal(C.evaluate(C.create({objective:'attack',constraints:[{metric:'attackDelay',op:'lte',value:-60}]}),delay.candidates,delay.sources).feasible,true);
for(const metric of ['attack','magic','speed','avoid','maxHP','maxST','maxMP','critRate']) {
  const context=C.create({objective:metric});assert.ok(Number.isFinite(C.evaluate(context,armor.candidates.slice(0,1),armor.sources).score));
}
const numeric=C.create({objective:{metric:'numeric',path:'extraStats.extraAC'}});
assert.equal(C.evaluate(numeric,[armor.candidates[0]],armor.sources).score,5);
assert.equal(E.reduce(armor,numeric).candidates.length,2,'unknown dependency plan keeps all alternatives');
assert.throws(()=>C.create({objective:'shieldAvoid'}),/Unsupported/);
assert.throws(()=>C.create({objective:{metric:'numeric',path:'__proto__.x'}}));
assert.throws(()=>C.create({objective:'attack',constraints:[{metric:'ac',op:'gte',value:NaN}]}));
assert.throws(()=>C.create({objective:{metric:'skillPlus',skillName:'unknown'}}));
// Complete two-slot oracle, including blanks: non-damage objectives and constraints.
const body=JSON.parse(JSON.stringify(skills.candidates[0]));
body.candidateId+='body';body.slot='防具: 胴';body.evaluationFields.slot=body.slot;
body.evaluationFields.equipBuffName='independent body skill';
body.evaluationFields.extraAC=3;
const pool={candidates:[...skills.candidates,body],sources:skills.sources};
for(const options of [
  {objective:'ac',constraints:[{metric:{metric:'skillPlus',skillName:'銃器'},op:'gte',value:20}]},
  {objective:{metric:'skillPlus',skillName:'銃器'},constraints:[{metric:'ac',op:'gte',value:3}]},
  {objective:{metric:'skillPlus',skillName:'回復魔法',direction:'min'}}
]) {
  const context=C.create({...options,topK:20});
  const reduced=E.reduce(pool,context);
  function best(candidates) {
    const heads=candidates.filter(c=>c.slot==='防具: 頭'),bodies=candidates.filter(c=>c.slot==='防具: 胴');
    let best=-Infinity;
    for(const head of [null,...heads])for(const body of [null,...bodies]) {
      const evaluated=C.evaluate(context,[head,body].filter(Boolean),pool.sources);
      if(evaluated.feasible)best=Math.max(best,evaluated.rankScore);
    }
    return best;
  }
  assert.ok(Number.isFinite(best(pool.candidates)));
  assert.equal(best(reduced.candidates),best(pool.candidates),'generic exhaustive optimum unchanged');
}
console.log('generic context: DPS/AC/hit/skill projection, constraints, scoped equivalence, Top-K, original recovery, official evaluation OK');
