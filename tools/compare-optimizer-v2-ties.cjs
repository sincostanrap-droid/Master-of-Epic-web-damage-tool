const fs=require('node:fs'),assert=require('node:assert/strict');
const [a,b]=process.argv.slice(2,4).map(file=>JSON.parse(fs.readFileSync(file,'utf8')));
assert.deepEqual(a.context,b.context);assert.equal(a.exact,b.exact);
if(a.exact)assert.deepEqual(a.top,b.top,'Top20 rank/score/key/original IDs/formal parity');
if(process.argv.includes('--repro')){
 assert.equal(a.exact,true);
 for(const field of ['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes','feasibilityPrunedNodes',
  'tiePrunedNodes','tiePrunesByDepth','tieKeyChecks','tieKeyUnknown','tieKeyRetained','tiePrefixPrunes',
  'tieSuffixPrunes','tieSameKeyPrunes','nodesByDepth','formalEvaluationsByDepth','boundPrunesByDepth',
  'upperBoundSummary','kthScoreHistory','firstTopKFullNode','finalKthScoreReachedNode'])
  assert.deepEqual(a.searchDiagnostics[field],b.searchDiagnostics[field],field);
}
function summarize(r){const d=r.searchDiagnostics||r.progress;
 return {exact:r.exact,elapsedMs:r.elapsedMs,nodes:d.searchNodes,formal:d.completeConfigurationsEvaluated,
  objectivePrune:d.boundPrunedNodes,tiePrune:d.tiePrunedNodes||0,kthScore:d.kthScoreHistory.at(-1)?.score,
  reachedFinalScoreNode:d.finalKthScoreReachedNode,nodesPerSecond:d.searchNodes*1000/r.elapsedMs,
  tieKeyChecks:d.tieKeyChecks||0,tieKeyMs:d.tieKeyMs||0,formalMs:d.evaluationProfile?.formalEvaluationMs??null,
  computeMetricsMs:d.evaluationProfile?.computeMetricsMs??null};}
const old=summarize(a),tie=summarize(b);
console.log(JSON.stringify({contextParity:true,topParity:a.exact?true:null,old,tie,
 timeReductionPercent:100*(1-tie.elapsedMs/old.elapsedMs),
 nodeReduction:old.nodes-tie.nodes,nodeReductionPercent:100*(1-tie.nodes/old.nodes),
 formalReduction:old.formal-tie.formal,formalReductionPercent:100*(1-tie.formal/old.formal)},null,2));
