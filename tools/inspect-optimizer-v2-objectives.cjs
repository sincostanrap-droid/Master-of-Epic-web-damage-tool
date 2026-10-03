const {contextRuntime,representativeContext}=require('./inspect-optimizer-v2-context.cjs');
function objectiveContexts(p,topK=1) {
  const gun=representativeContext(p,topK);
  const common={race:gun.race,gender:gun.gender,skillSim:gun.skillSim,topK};
  return {gun,ac:p.MOEOptimizerV2SearchContext.create({...common,objective:{metric:'ac',direction:'max'}}),
    skillPlus:p.MOEOptimizerV2SearchContext.create({...common,objective:{metric:'skillPlus',skillName:'回復魔法',direction:'max'}})};
}
function oldShieldClass(result) {
  const anchor=result.effectiveCandidates.find(e=>e.originalCandidate.name==='トンファー ガード');
  if(!anchor) throw new Error('shield audit anchor missing');
  const key=e=>{const semantics={...e.semantics};delete semantics.rawRequirements;return JSON.stringify([semantics,e.axes]);};
  const matching=new Set(result.effectiveCandidates.filter(e=>!e.protectedReasons.length&&key(e)===key(anchor)).map(e=>e.candidateId));
  return result.contextEquivalentClasses.filter(g=>matching.has(g.representativeCandidateId)).flatMap(g=>Array.from(g.equivalentCandidateIds));
}
function summary(result,oldIds) {
  const ids=new Set(oldIds);
  const groups=result.contextEquivalentClasses.filter(g=>g.equivalentCandidateIds.some(id=>ids.has(id)));
  return {before:result.diagnostics.beforeCount,afterFilter:result.diagnostics.afterFilterCount,
    contextEquivalentClasses:result.contextEquivalentClasses.length,searchCandidates:result.candidates.length,
    historicalShieldClassSize:oldIds.length,historicalShieldClassPartitions:groups.length,
    shieldExamples:groups.slice(0,4).map(g=>({representative:g.representativeCandidate.name,
      membersFromHistoricalClass:g.equivalentCandidateIds.filter(id=>ids.has(id)).length}))};
}
if(require.main===module) {
  const p=contextRuntime(),s=p.MOEOptimizerV2Candidates.generate();let oldIds;
  for(const topK of [1,20]) for(const [objective,context] of Object.entries(objectiveContexts(p,topK))) {
    const result=p.MOEOptimizerV2EffectiveCandidates.reduce(s,context);
    if(!oldIds)oldIds=oldShieldClass(result);
    console.log(JSON.stringify({objective,topK,...summary(result,oldIds)}));
  }
  console.log(JSON.stringify({shieldData:['トンファー ガード','アニマの盾','カオス レザー シールド'].map(name=>{
    const c=s.candidates.find(c=>c.name===name),src=s.sources[c.sourceRef];
    return {name,requirements:c.requirements,rawNeedLevel:src.needLevel,rawRequiredSkill:src.requiredSkill,
      ac:c.ac,modifiers:c.modifiers.base,skillPlus:c.skillPlus,buff:c.equipmentBuff,weaponDamage:c.weaponDamage};
  })}));
}
module.exports={objectiveContexts,oldShieldClass,summary};
