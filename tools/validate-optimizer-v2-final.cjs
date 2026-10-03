/* Final validation: the production Exact API, with progress observation only.
 * No node/time limit, exception stop, candidate truncation or search changes.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const {objectiveContexts}=require('./inspect-optimizer-v2-objectives.cjs');
const json=value=>JSON.parse(JSON.stringify(value));
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
if(process.argv[2]==='--compare'){
  const [left,right]=process.argv.slice(3).map(file=>JSON.parse(fs.readFileSync(file,'utf8')));
  assert.equal(left.status,'completed');assert.equal(right.status,'completed');
  assert.equal(left.exact,true);assert.equal(right.exact,true);
  assert.deepEqual(left.context,right.context);assert.deepEqual(left.top,right.top);
  for(const key of ['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes','feasibilityPrunedNodes',
    'invalidEquipmentCombinationCount','invalidReasons','slotOrder','nodesByDepth','formalEvaluationsByDepth',
    'boundPrunesByDepth','feasibilityPrunesByDepth'])assert.deepEqual(left.diagnostics[key],right.diagnostics[key],key);
  console.log(JSON.stringify({case:left.case,reproducible:true,exact:true,topCount:left.top.length,
    nodes:left.diagnostics.searchNodes,evaluations:left.diagnostics.completeConfigurationsEvaluated,
    elapsedMs:[left.totalElapsedMs,right.totalElapsedMs]}));
  process.exit(0);
}
const name=process.argv[2]||'ac',output=process.argv[3];
if(!output)throw new Error('Usage: node tools/validate-optimizer-v2-final.cjs ac|skillPlus|gun|hp|fixedHp output.json');
const totalStart=performance.now(),p=contextRuntime(),runtimeMs=performance.now()-totalStart;
const C=p.MOEOptimizerV2SearchContext,E=p.MOEOptimizerV2EffectiveCandidates;
const catalogStart=performance.now(),snapshot=p.MOEOptimizerV2Candidates.generate(),catalogMs=performance.now()-catalogStart;
const contexts=objectiveContexts(p,20);
contexts.hp=C.create({objective:'hp',race:contexts.ac.race,gender:contexts.ac.gender,skillSim:contexts.ac.skillSim,topK:20});
// Supplemental fixed-equipment case, NOT a substitute for any free full search.
// All catalog candidates and slots remain in the reduction; all 17 choices are
// explicitly fixed using the existing SearchContext contract.
if(name==='fixedHp'){
  const fixed=C.withRuntime(contexts.hp,()=>contexts.hp.slots.map(slot=>{
    const candidate=snapshot.candidates.find(c=>{
      if(c.slot!==slot || E.filterReason(c,snapshot.sources[c.sourceRef],contexts.hp))return false;
      const row=p.MOEOptimizerV2Candidates.toEquipmentRow(c);
      return !row.equipBuffName && !p.optimizerWeaponUsesBothHands(row)
        && !p.optimizerEquipmentConflictKeys(row).length
        && (slot!=='武器: 右手' || p.weaponRowHasCalcData(row));
    });
    if(!candidate)throw new Error(`No fixture candidate for ${slot}`);
    return candidate.candidateId;
  }));
  contexts.fixedHp=C.create({objective:'hp',race:contexts.hp.race,gender:contexts.hp.gender,
    skillSim:contexts.hp.skillSim,topK:20,fixedCandidateIds:fixed,
    constraints:[{metric:'attackDelay',op:'lte',value:0}]});
}
const context=contexts[name];if(!context)throw new Error('Unknown case');
const reductionStart=performance.now(),reductionProfile={},reduction=E.reduce(snapshot,context,reductionProfile);
const reductionMs=performance.now()-reductionStart;
const groups=Object.fromEntries(context.slots.map(slot=>[slot,reduction.candidates.filter(c=>c.slot===slot).length]));
const order=name==='skillPlus'?'fewest':'blockers';
const record={case:name,status:'running',exact:false,context:json(context),catalogCandidateCount:snapshot.candidates.length,
  prefilterCount:reduction.diagnostics.afterFilterCount,classCount:reduction.contextEquivalentClasses.length,
  groups,slotCount:context.slots.length,order,setup:{runtimeMs,catalogMs,reductionMs,reductionProfile}};
const save=()=>fs.writeFileSync(output,JSON.stringify(record,null,2)+'\n');
save();console.log(JSON.stringify({event:'start',case:name,groups,setup:record.setup}));
let lastLog=performance.now();
const completed=p.MOEOptimizerV2BranchAndBound.run(reduction,{slotOrder:order,
  profileEvaluation:true,profileSearch:true,progressEvery:1000,onProgress:d=>{
    if(performance.now()-lastLog<30000)return;lastLog=performance.now();
    record.progress=json(d);record.observedTotalMs=performance.now()-totalStart;save();
    console.log(JSON.stringify({event:'progress',case:name,nodes:d.searchNodes,evaluations:d.completeConfigurationsEvaluated,
      elapsedMs:d.elapsedMs,boundPruned:d.boundPrunedNodes,feasibilityPruned:d.feasibilityPrunedNodes,depth:d.currentDepth}));
  }});
assert.equal(completed.diagnostics.exact,true);assert.equal(completed.diagnostics.approximate,false);
record.status='search-completed-validating';record.exact=true;record.diagnostics=json(completed.diagnostics);save();
const keys=new Set(),membership=new Map();
for(const cls of reduction.contextEquivalentClasses)for(const id of cls.equivalentCandidateIds)membership.set(id,cls);
const originalCompute=p.computeMetrics;let capture;
p.computeMetrics=function(st,inputs,target,prepared){const sink=target||{};const result=originalCompute(st,inputs,sink,prepared);capture=json(sink);return result;};
const session=p.MOEOptimizerV2EvaluationSession.create(context,snapshot.sources,{preparation:reduction.candidatePreparation});
record.top=[];
try{for(let i=0;i<completed.results.length;i++){
  const r=completed.results[i];assert.ok(!keys.has(r.performanceKey));keys.add(r.performanceKey);
  if(i){const prior=completed.results[i-1];assert.ok(prior.rankScore>r.rankScore ||
    (prior.rankScore===r.rankScore && prior.performanceKey<r.performanceKey));}
  const candidates=r.candidateIds.map(id=>E.resolveCandidate(membership.get(id),id));
  const normal=C.evaluate(context,candidates,snapshot.sources),normalCapture=capture;
  const prepared=session.evaluate(candidates),preparedCapture=capture;
  assert.deepEqual(json(normal),json(prepared));assert.deepEqual(normalCapture,preparedCapture);
  assert.equal(normal.feasible,true);assert.equal(normal.score,r.score);
  assert.deepEqual(json(normal.metrics),json(r.metrics));assert.deepEqual(json(normal.dps),json(r.dps));
  assert.equal(E.describeConfiguration(reduction,r.candidateIds).performanceKey,r.performanceKey);
  const equipment=r.equipment.map(entry=>{
    const cls=membership.get(entry.representativeCandidateId);
    assert.deepEqual(json(entry.equivalentCandidateIds),json(cls.equivalentCandidateIds));
    for(const id of cls.equivalentCandidateIds){const c=E.resolveCandidate(cls,id);assert.equal(c.candidateId,id);assert.ok(snapshot.sources[c.sourceRef]);}
    return {slot:entry.slot,name:entry.representativeCandidate.name,representativeCandidateId:entry.representativeCandidateId,
      originalCandidateIds:json(entry.equivalentCandidateIds),equivalenceKey:entry.equivalenceKey};
  });
  record.top.push({rank:i+1,score:r.score,rankScore:r.rankScore,performanceKey:r.performanceKey,
    candidateIds:json(r.candidateIds),equipment,metrics:json(r.metrics),dps:json(r.dps),
    formalParity:true,feasible:normal.feasible,resolvedStateHash:hash(normalCapture)});
}}finally{session.dispose();p.computeMetrics=originalCompute;}
record.status='completed';record.totalElapsedMs=performance.now()-totalStart;delete record.progress;save();
console.log(JSON.stringify({event:'completed',case:name,exact:true,totalElapsedMs:record.totalElapsedMs,
  diagnostics:completed.diagnostics,top:record.top.map(r=>({rank:r.rank,score:r.score,keyHash:hash(r.performanceKey)}))}));
