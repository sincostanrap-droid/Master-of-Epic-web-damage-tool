const assert=require('node:assert/strict'),vm=require('node:vm');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const {json}=require('../tools/benchmark-optimizer.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,E=p.MOEOptimizerV2EffectiveCandidates,items=p.equipmentCatalogItems();
const named=name=>{const x=items.find(i=>i.name===name);assert.ok(x,name);return x;};
function plain(slot,n) {
  return items.filter(i=>i.slot===slot && !i.equipBuff && !i.buffRefs?.length).filter(i=>{
    const r=p.catalogEquipmentToRow(i);return !r.attack&&!r.magic&&!r.speed&&!r.extraAttackDelay;
  }).slice(0,n);
}
const armor=[...plain('防具: 手',3),...plain('防具: 頭',2)];
assert.equal(armor.length,5);
const knife=named('カッパー ナイフ');
const multi=items.find(i=>i.slot==='武器: 右手'&&i.weaponType==='こんぼう'&&i.weaponReq?.length>1);
const bow=items.find(i=>i.slot==='武器: 左手'&&i.weaponType==='弓'&&i.weaponAttackInterval>0);
const gun=items.find(i=>i.slot==='武器: 右手'&&i.weaponType==='銃器'&&i.weaponAttackInterval>0);
const wig=named('サイドパート ウィッグ'),delay=named('アルスリア ウィッグ カラー');
const conversion=items.find(i=>{
  if(i.slot!=='防具: 胴'||!i.equipBuff)return false;
  return p.catalogEquipmentToRow(i).equipBuffConvMagicRate>0;
});assert.ok(conversion,'actual conversion equipment');
const skillSim=vm.runInContext('defaultSkillSimState()',p);Object.keys(skillSim.skills).forEach(k=>skillSim.skills[k]=100);
function enumerate(candidates,context,sources) {
  const groups=new Map();for(const c of candidates){if(!groups.has(c.slot))groups.set(c.slot,[]);groups.get(c.slot).push(c);}
  const slots=[...groups.values()];let best=-Infinity,bestIds=[],feasible=0,visited=0;
  function visit(index,selected) {
    if(index===slots.length) {
      visited++;
      const evaluation=C.evaluate(context,selected,sources);
      if(evaluation.feasible) {feasible++;if(evaluation.score>best){best=evaluation.score;bestIds=selected.map(c=>c.candidateId);}}
      return;
    }
    visit(index+1,selected); // Blank slots are valid choices too.
    for(const c of slots[index])visit(index+1,[...selected,c]);
  }
  visit(0,[]);return {best,bestIds,feasible,visited};
}
const baseState=vm.runInContext('DEFAULT_STATE()',p);
const cases=[
  {name:'maximum physical damage',items:[knife,...armor],options:{}},
  {name:'crit >=100 requires equipment Buff',items:[knife,...armor,wig],options:{critRateRequirement:100,
    baseState:{...json(baseState),composite:[{name:'fixed external crit',enabled:true,extraCritRatePct:70}]}}},
  {name:'delay <=-60 requires equipment Buff',items:[knife,...armor,delay],options:{attackDelayRequirement:-60,
    baseState:{...json(baseState),composite:[{name:'fixed external delay',enabled:true,extraAttackDelay:-50}]}}},
  {name:'specified weapon type',items:[knife,bow,...armor],options:{mainWeaponSkill:'刀剣'}},
  {name:'multiple weapon requirements with partial proficiency',items:[multi,knife,...armor],options:{mainWeaponSkill:'こんぼう',
    skillSim:{...skillSim,skills:{...skillSim.skills,'こんぼう':35.2,'採掘':100}}}},
  {name:'equipment conversion Buff',items:[knife,...armor,conversion],options:{}},
  {name:'bow attack DPS',items:[bow,knife,...armor,delay],options:{objective:'attackDps',mainWeaponSkill:'弓'}},
  {name:'gun attack DPS',items:[gun,bow,...armor,conversion],options:{objective:'attackDps',mainWeaponSkill:'銃器'}}
];
for(const test of cases) {
  assert.ok(test.items.every(Boolean),test.name);
  const s=p.MOEOptimizerV2Candidates.generate({items:test.items});
  const c=C.create({skillSim,inputs:{str:100,spirit:100,weaponDamage:0,allowCrit:true,critRate:1},targetAC:100,...test.options});
  const after=E.reduce(s,c);
  const a=enumerate(s.candidates,c,s.sources),b=enumerate(after.candidates,c,s.sources);
  assert.ok(a.feasible>0,test.name+' has a feasible optimum');assert.ok(Number.isFinite(a.best));
  assert.equal(b.best,a.best,test.name+' exact optimum unchanged');
  const top20=E.reduce(s,C.create({skillSim,inputs:{str:100,spirit:100,weaponDamage:0,allowCrit:true,critRate:1},
    targetAC:100,...test.options,topK:20}));
  assert.equal(enumerate(top20.candidates,top20.context,s.sources).best,a.best,test.name+' top20 optimum unchanged');
  assert.ok(after.candidates.length<s.candidates.length,test.name+' actually removes candidates');
  assert.ok(after.removed.length>0,test.name+' non-vacuous Pareto/equivalence test');
  if(test.name.includes('requires equipment')) {
    const buffId=s.candidates.find(x=>x.name===(test.name.startsWith('crit')?wig.name:delay.name)).candidateId;
    assert.ok(a.bestIds.includes(buffId),'optimal feasible configuration uses the required real Buff');
  }
  if(test.name==='equipment conversion Buff') assert.ok(a.bestIds.some(id=>s.candidates.find(x=>x.candidateId===id).catalogId===conversion.catalogId));
  console.log(`${test.name}: ${a.visited} -> ${b.visited} combinations, best=${a.best}, feasible=${a.feasible}/${b.feasible}`);
}
// Also verify the evaluation adapter against the official calls, not a new scoring implementation.
const s=p.MOEOptimizerV2Candidates.generate({items:[bow,delay]});
const c=C.create({objective:'attackDps',mainWeaponSkill:'弓',skillSim,targetAC:100});
const actual=C.evaluate(c,s.candidates,s.sources);
C.withRuntime(c,()=>{
  const st={...json(c.baseState),equipment:s.candidates.map(x=>p.MOEOptimizerV2Candidates.toEquipmentRow(x))};
  const m=p.computeMetrics(p.expandSkillSimMasteryBuffState(st),json(c.inputs));
  const d=p.calculateAttackDps({cfg:c.dps,weapon:m.selectedWeapon,currentDamage:Math.floor(m.finalDamage),
    currentWeaponDelay:m.effectiveWeapon.attackInterval,delayAuto:p.collectAttackDpsDelaySources(st)});
  assert.equal(actual.score,d.continuousDps);assert.deepEqual(json(actual.metrics),json(m));
});
