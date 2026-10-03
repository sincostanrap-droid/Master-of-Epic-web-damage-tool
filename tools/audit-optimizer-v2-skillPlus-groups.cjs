const fs=require('node:fs');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const {objectiveContexts}=require('./inspect-optimizer-v2-objectives.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,R=p.MOEOptimizerV2MetricCandidateReducer;
const snapshot=p.MOEOptimizerV2Candidates.generate(),context=objectiveContexts(p,20).skillPlus;
const reduction=R.reduce(snapshot,context),proof=p.MOEOptimizerV2BranchAndBound.inspectSkillPlusPotential(reduction);
const rows=C.withRuntime(context,()=>proof.sources.map(source=>{
 const candidate=source.candidateId&&R.resolveCandidate(reduction,source.candidateId);
 const row=candidate&&reduction.candidatePreparation.readRow(candidate);
 const catalog=candidate&&snapshot.sources[candidate.sourceRef];
 const statusRow=p.defaultEquipmentCandidate(candidate?.slot||'防具: 頭',false);
 for(const status of catalog?.addStatuses||[])p.idbApplyStructuredStatus(statusRow,status.name,status.value,status.statKey);
 const statusEffects=p.normalizeAdditionalEffects(statusRow.extraEffects);
 const identity=e=>JSON.stringify([e.key,e.name,e.value]);
 return {...source,candidateName:candidate?.name,slot:candidate?.slot,catalogId:candidate?.catalogId,
  effectOrigins:source.positiveEffects.map(e=>({effect:e,
   origin:statusEffects.some(s=>identity(s)===identity(e))?'add_status-in-equipment-buff':'equipment-buff-or-fixed-composite'})),
  officialManualGroup:row?p.equipmentBuffManualConflictGroup(row):null,
  officialAutoGroup:row?p.equipmentBuffAutoStackGroup(row):null,
  sameTechnicSubject:!!source.stackKey,
  runtimeOrderDependent:!!source.stackKey||/latest|same|newest|最新/i.test(source.stackRule),
  groupWinnerDependent:source.groups.length>0,
  requirements:candidate?.requirements||[],requirementsDependent:false,
  unconditionalDirectSkillPlus:0};
}));
const report={context:{objective:context.objective,topK:context.topK},candidateCount:reduction.candidates.length,
 representativeCandidateCount:reduction.candidates.length,
 retainedOriginalCandidateCount:reduction.contextEquivalentClasses.reduce((sum,cls)=>sum+cls.equivalentCandidateIds.length,0),
 classCount:reduction.contextEquivalentClasses.length,positiveClasses:rows.filter(s=>s.candidateId).length,
 closureCandidateCount:reduction.metricReducer.classification.filter(c=>c.interaction&&c.buffFlat===0).length,
 classification:proof.classification,root:{sum:proof.upperBound,groupAware:proof.groupAware},sources:rows,
 provenance:Object.fromEntries(['add_status-in-equipment-buff','equipment-buff-or-fixed-composite'].map(k=>[k,
 rows.flatMap(s=>s.effectOrigins).filter(e=>e.origin===k).length]))};
fs.writeFileSync(process.argv[2]||'docs/optimizer-v2-skillPlus-groups-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,sources:undefined},null,2));
