const fs=require('node:fs'),assert=require('node:assert/strict');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime(),s=p.MOEOptimizerV2Candidates.generate();
const c=require('./inspect-optimizer-v2-objectives.cjs').objectiveContexts(p,20).ac;
const r=p.MOEOptimizerV2MetricCandidateReducer.reduce(s,c),B=p.MOEOptimizerV2BranchAndBound;
const old=Object.values(B.inspectBounds(r).metrics)[0],g=B.inspectACGroups(r),rows=[];
p.MOEOptimizerV2SearchContext.withRuntime(c,()=>{
 for(const cls of r.contextEquivalentClasses){const id=cls.representativeCandidateId;if(old.candidates[id].reason!=='buff-group-interaction')continue;
  const candidate=cls.representativeCandidate,row=p.MOEOptimizerV2Candidates.toEquipmentRow(candidate);
  const resolved=p.resolveEquipmentBuffRowsForSameTechnic([row]);
  rows.push({candidateId:id,name:candidate.name,slot:candidate.slot,requirements:candidate.requirements,
   rawAC:row.extraAC,directAC:p.equipmentArmorAC(row,c.skillSim).total,directPct:row.extraACPct,manualGroups:resolved.map(b=>p.equipmentBuffManualConflictGroup(b)),
   sources:g.candidates[id].sources,known:g.candidates[id].reason===null,
   percentageOverlap:g.candidates[id].sources.some(x=>x.potential.pctMax!==0||x.potential.pctMin!==0)});
 }
});
assert.equal(r.contextEquivalentClasses.length,2198);assert.equal(rows.length,34);
assert.ok(rows.every(x=>x.known));assert.equal(rows.filter(x=>x.percentageOverlap).length,28);
console.log(JSON.stringify({classes:r.contextEquivalentClasses.length,groupBlockers:34,known:34,percentageOverlap:28,
 unknown:Object.values(g.candidates).filter(x=>x.reason).length,sourceCount:g.sources.length,
 exclusiveBuckets:new Set(g.sources.map(x=>x.bucket).filter(Boolean)).size,
 multipleMembership:g.sources.filter(x=>x.groups.length>1).length,rootUpper:g.upper,rows},null,2));
