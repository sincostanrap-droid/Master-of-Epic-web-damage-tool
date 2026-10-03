const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {paretoContext}=require('./inspect-optimizer-v2-pareto.cjs');
function contextRuntime() {
  const p=paretoContext();
  for(const name of ['metrics','searchContext','effectiveCandidates','evaluationSession','branchAndBound','metricCandidateReducer']) {
    const file=path.join(__dirname,`../src/optimizer-v2/${name}.js`);
    vm.runInContext(fs.readFileSync(file,'utf8'),p,{filename:file});
  }
  return p;
}
function representativeContext(p,topK=1) {
  const skillSim=vm.runInContext('defaultSkillSimState()',p);
  for(const name of ['筋力','生命力','持久力','着こなし','銃器','戦闘技術','精神力','攻撃回避']) skillSim.skills[name]=100;
  skillSim.skills['呪文抵抗力']=50;
  return p.MOEOptimizerV2SearchContext.create({objective:'attackDps',mainWeaponSkill:'銃器',mainWeaponSlot:'武器: 右手',
    gender:'male',race:'newtar',targetAC:100,skillSim,critRateRequirement:100,attackDelayRequirement:-60,
    inputs:{allowCrit:true,critRate:1},topK});
}
if(require.main===module) {
  const p=contextRuntime(),snapshot=p.MOEOptimizerV2Candidates.generate(),context=representativeContext(p);
  const result=p.MOEOptimizerV2EffectiveCandidates.reduce(snapshot,context);
  const top20=p.MOEOptimizerV2EffectiveCandidates.reduce(snapshot,representativeContext(p,20));
  const largest=[...result.equivalentClasses].sort((a,b)=>b.equivalentCandidateIds.length-a.equivalentCandidateIds.length)[0];
  console.log(JSON.stringify({context:{objective:context.objective,weapon:context.mainWeaponSkill,gender:context.gender,
    targetAC:context.targetAC,critRateRequirement:context.critRateRequirement,attackDelayRequirement:context.attackDelayRequirement},
    diagnostics:result.diagnostics,top20Diagnostics:top20.diagnostics,
    largestEquivalentClass:{representativeCandidateId:largest.representativeCandidateId,
      name:largest.representativeCandidate.name,count:largest.equivalentCandidateIds.length,
      equivalentCandidateIds:largest.equivalentCandidateIds},examples:result.removed.slice(0,10)},null,2));
}
module.exports={contextRuntime,representativeContext};
