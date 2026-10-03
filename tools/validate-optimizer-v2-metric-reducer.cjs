/* Full-catalog reducer diagnostics. The production Exact API has no stop limit.
 * Optional --observe-ms is an explicitly incomplete development observation.
 */
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const {objectiveContexts}=require('./inspect-optimizer-v2-objectives.cjs');
const json=v=>JSON.parse(JSON.stringify(v));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'
  ?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
if(process.argv[2]==='--compare') {
  const [a,b]=process.argv.slice(3).map(f=>JSON.parse(fs.readFileSync(f,'utf8')));
  assert.equal(a.exact,true);assert.equal(b.exact,true);assert.deepEqual(a.context,b.context);
  assert.deepEqual(a.top,b.top);
  console.log(JSON.stringify({reproducible:true,exact:true,topCount:a.top.length}));process.exit(0);
}
const name=process.argv[2]||'skillPlus',output=process.argv[3];
if(!output||!['skillPlus','ac'].includes(name))throw new Error('Usage: ac|skillPlus output.json [--classify-only] [--observe-ms=N]');
const observation=process.argv.find(a=>a.startsWith('--observe-ms='));
const candidateOrder=process.argv.includes('--potential-first')?'potential':undefined;
const optimisticBound=!process.argv.includes('--no-optimistic');
const groupAwareBound=!process.argv.includes('--sum-bound');
const profileSkillPlusBound=process.argv.includes('--profile-bound');
const preparedGroupBound=!process.argv.includes('--legacy-group-bound');
const skillPlusTieAudit=process.argv.includes('--tie-audit');
const skillPlusTiePruning=!process.argv.includes('--no-tie-pruning');
const acPercentageBound=!process.argv.includes('--no-ac-percentage');
const acGroupBound=!process.argv.includes('--no-ac-group');
const acGroupDryRun=process.argv.includes('--ac-group-dry');
const profileACBound=process.argv.includes('--profile-ac-bound');
const acPreparedBound=!process.argv.includes('--legacy-ac-bound');
const acFixedContextEquivalence=!process.argv.includes('--legacy-ac-equivalence');
const acReplacementDominance=!process.argv.includes('--no-ac-replacement');
const orderFile=process.argv.find(a=>a.startsWith('--slot-order-file='));
const priorOrder=orderFile?JSON.parse(fs.readFileSync(orderFile.slice('--slot-order-file='.length),'utf8')):null;
const fixedSlotOrder=priorOrder?(priorOrder.progress||priorOrder.searchDiagnostics).slotOrder:undefined;
const slotOrder='blockers';
const observeMs=observation?Number(observation.split('=')[1]):null;
const nodeObservation=process.argv.find(a=>a.startsWith('--observe-nodes='));
const observeNodes=nodeObservation?Number(nodeObservation.split('=')[1]):null;
if(observeMs!==null&&(!Number.isFinite(observeMs)||observeMs<=0))throw new Error('Invalid diagnostic observation');
if(observeNodes!==null&&(!Number.isInteger(observeNodes)||observeNodes<=0))throw new Error('Invalid diagnostic node observation');
const started=performance.now(),p=contextRuntime(),snapshot=p.MOEOptimizerV2Candidates.generate();
const context=objectiveContexts(p,20)[name],R=p.MOEOptimizerV2MetricCandidateReducer;
const setupProfile={legacyProjection:{},reducerProjectionMs:0,reducerProjectionCalls:0};
if(profileACBound){
  const original=p.MOEOptimizerV2EffectiveCandidates;
  p.MOEOptimizerV2EffectiveCandidates=Object.freeze({...original,
    reduce:(s,c,profile,options)=>original.reduce(s,c,profile||setupProfile.legacyProjection,options),
    project:(...args)=>{const mark=performance.now();try{return original.project(...args);}finally{
      setupProfile.reducerProjectionMs+=performance.now()-mark;setupProfile.reducerProjectionCalls++;}}});
}
const reductionStart=performance.now();
const reduction=R.reduce(snapshot,context,{acFixedContextEquivalence,acReplacementDominance});
setupProfile.reducerTotalMs=performance.now()-reductionStart;
const keyHash=k=>crypto.createHash('sha256').update(k).digest('hex');
const classification=reduction.metricReducer.classification.map(({equivalenceKey,replacementWitnessClassKeys,...rest})=>({...rest,
  ...(replacementWitnessClassKeys?{replacementWitnessClassKeyHashes:replacementWitnessClassKeys.map(keyHash)}:{}),
  equivalenceKeyHash:equivalenceKey?keyHash(equivalenceKey):null}));
assert.equal(classification.length,11804);
const classifiedFile=output.replace(/\.json$/,'.classification.json');
fs.writeFileSync(classifiedFile,JSON.stringify(classification,null,2)+'\n');
const bounds=p.MOEOptimizerV2BranchAndBound.inspectBounds(reduction);
const reducerDiagnostics=json(reduction.diagnostics.metricReduction);
if(reducerDiagnostics.acReplacementDominance)reducerDiagnostics.acReplacementDominance.removed=
  reducerDiagnostics.acReplacementDominance.removed.map(({equivalenceKey,witnessClassKeys,...rest})=>
    ({...rest,equivalenceKeyHash:keyHash(equivalenceKey),witnessClassKeyHashes:witnessClassKeys.map(keyHash)}));
const record={case:name,status:'classified',exact:false,context:{...json(context),runtime:{signature:hash(context.runtime)}},
  searchOptions:{slotOrder,fixedSlotOrder,candidateOrder,skillPlusOptimisticBound:optimisticBound,skillPlusGroupAwareBound:groupAwareBound,
    skillPlusPreparedGroupBound:preparedGroupBound,profileSkillPlusBound,skillPlusTieAudit,skillPlusTiePruning,acPercentageBound,acGroupBound,acGroupDryRun,acPreparedBound,profileACBound,acFixedContextEquivalence,acReplacementDominance},
  developmentObservation:{observeMs,observeNodes},
  evaluationContextSignature:hash(context),setupProfile:profileACBound?setupProfile:null,
  diagnostics:reducerDiagnostics,classificationFile:classifiedFile,
  removedExamples:reduction.removed.slice(0,12),boundAvailability:json(bounds),setupMs:performance.now()-started};
const save=()=>fs.writeFileSync(output,JSON.stringify(record,null,2)+'\n');
if(name==='ac')record.acPercentageAvailability=json(p.MOEOptimizerV2BranchAndBound.inspectACPercentage(reduction));
save();
console.log(JSON.stringify({event:'classified',case:name,diagnostics:record.diagnostics}));
if(process.argv.includes('--classify-only'))process.exit(0);
record.status='running';save();
const searchStart=performance.now(),stop=new Error('development-observation-ended');
let last=performance.now(),lastSnapshot=null;
try {
  const result=p.MOEOptimizerV2BranchAndBound.run(reduction,{slotOrder,fixedSlotOrder,profileEvaluation:true,
    acPercentageBound,acGroupBound,acGroupDryRun,profileACBound,acPreparedBound,
    observeTopK:process.argv.includes('--observe-top-k'),
    skillPlusPreparedGroupBound:preparedGroupBound,profileSkillPlusBound,profileSearch:profileSkillPlusBound||profileACBound,skillPlusTieAudit,skillPlusTiePruning,
    candidateOrder,skillPlusOptimisticBound:optimisticBound,skillPlusGroupAwareBound:groupAwareBound,
    progressEvery:1000,onProgress:d=>{
      lastSnapshot=d;
      if(process.argv.includes('--observe-top-k') && [10000,13000,100000,300000,1000000].includes(d.searchNodes)) {
        record.checkpoints=record.checkpoints||[];record.checkpoints.push(json(d));
      }
      if(performance.now()-last>=10000) {
        last=performance.now();record.progress=json(d);record.observedMs=performance.now()-searchStart;save();
        console.log(JSON.stringify({event:'progress',case:name,nodes:d.searchNodes,evaluations:d.completeConfigurationsEvaluated,
          objectivePrune:d.boundPrunedNodes,elapsedMs:d.elapsedMs}));
      }
      if(observeMs!==null&&performance.now()-searchStart>=observeMs){record.progress=json(d);throw stop;}
      if(observeNodes!==null&&d.searchNodes>=observeNodes){record.progress=json(d);throw stop;}
    }});
  assert.equal(result.diagnostics.exact,true);
  record.top=result.results.map((r,index)=>{
    const candidates=r.candidateIds.map(id=>R.resolveCandidate(reduction,id));
    const normal=p.MOEOptimizerV2SearchContext.evaluate(context,candidates,snapshot.sources);
    assert.equal(normal.feasible,true);assert.equal(normal.score,r.score);
    assert.deepEqual(json(normal.metrics),json(r.metrics));
    assert.equal(R.describeConfiguration(reduction,r.candidateIds).performanceKey,r.performanceKey);
    return {rank:index+1,score:r.score,performanceKey:r.performanceKey,candidateIds:json(r.candidateIds),
      equipment:r.equipment.map(e=>({slot:e.slot,name:e.representativeCandidate.name,
        equivalentCandidateIds:json(e.equivalentCandidateIds)})),formalParity:true};
  });
  record.status='completed';record.exact=true;record.searchDiagnostics=json(result.diagnostics);
  delete record.progress;
}catch(error) {
  if(error!==stop) {record.status='failed';record.error=error.stack;save();throw error;}
  record.status='incomplete-development-observation';record.exact=false;
  // The search's finally block has now recorded DFS duration. The progress
  // snapshot shares this diagnostic object; it never shares evaluation state.
  if(lastSnapshot?.searchProfile)record.progress.searchProfile=json(lastSnapshot.searchProfile);
}
record.elapsedMs=performance.now()-searchStart;save();
console.log(JSON.stringify({event:record.status,case:name,exact:record.exact,elapsedMs:record.elapsedMs,
  progress:record.progress,top:record.top?.map(r=>({rank:r.rank,score:r.score}))}));
