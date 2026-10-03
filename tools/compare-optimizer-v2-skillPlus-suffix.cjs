/* Read-only comparison of diagnostic or completed old/new bound runs. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const [a,b]=process.argv.slice(2).map(file=>JSON.parse(fs.readFileSync(file,'utf8')));
assert.ok(a&&b,'Usage: old.json new.json');
assert.deepEqual(a.context,b.context);assert.equal(a.exact,b.exact);
const diagnostics=r=>r.searchDiagnostics||r.progress;
const fields=['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes','feasibilityPrunedNodes',
 'invalidEquipmentCombinationCount','upperBoundKnownCount','upperBoundUnknownCount',
 'groupAwareBoundUseCount','groupAwareReductionCount','upperBoundSummary','slotOrder','nodesByDepth',
 'boundPrunesByDepth','feasibilityPrunesByDepth','kthScoreHistory','firstTopKFullNode'];
for(const key of fields)assert.deepEqual(diagnostics(a)[key],diagnostics(b)[key],key);
if(a.exact)assert.deepEqual(a.top,b.top,'Top-K scores, keys, ranks and original/equivalent candidate IDs');
else for(const key of ['currentCandidateIds','remainingSlots','currentDepth'])
 assert.deepEqual(diagnostics(a)[key],diagnostics(b)[key],key);
function summary(record){
 const d=diagnostics(record),p=d.skillPlusBoundProfile,calls=p?.calls??d.groupAwareBoundUseCount;
 const allocations=p?.allocationEstimatePerCall||{maps:1,sets:0,arrays:2,closures:2,resultObjects:1};
 return {exact:record.exact,elapsedMs:record.elapsedMs,searchElapsedMs:d.elapsedMs,
  nodes:d.searchNodes,formal:d.completeConfigurationsEvaluated,prunes:d.boundPrunedNodes,
  kthScore:d.kthScoreHistory.at(-1)?.score,boundCalls:calls,
  nodesPerSecond:d.searchNodes*1000/record.elapsedMs,boundsPerSecond:calls*1000/record.elapsedMs,
  formalPerSecond:d.completeConfigurationsEvaluated*1000/record.elapsedMs,
  boundMs:p?.totalMs??null,boundAverageUs:p?p.totalMs*1000/calls:null,
  boundsPerSecondExcludingOtherWork:p?calls*1000/p.totalMs:null,
  boundCallsPerNode:calls/d.searchNodes,
  repeatedRemainingPoolsByDepth:p?.callsByDepth.map(n=>Math.max(0,n-1))??null,
  estimatedAllocations:Object.fromEntries(Object.entries(allocations).map(([key,n])=>[key,n*calls])),
  prepared:d.skillPlusSuffixPreparation??null,stages:p?.stages??null,searchProfile:d.searchProfile??null};
}
const old=summary(a),prepared=summary(b);
console.log(JSON.stringify({parity:true,exact:a.exact,old,prepared,
 elapsedReductionPercent:(1-prepared.elapsedMs/old.elapsedMs)*100,
 nodeThroughputRatio:prepared.nodesPerSecond/old.nodesPerSecond,
 boundTimeReductionPercent:old.boundMs&&prepared.boundMs?(1-prepared.boundMs/old.boundMs)*100:null},null,2));
