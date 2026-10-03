/* Read-only parity report for interrupted development observations. Never calls them Exact. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const [before,after]=process.argv.slice(2).map(file=>JSON.parse(fs.readFileSync(file,'utf8')));
assert.deepEqual(before.context,after.context);
assert.deepEqual(before.diagnostics,after.diagnostics,'Reducer unchanged');
assert.equal(before.exact,false);assert.equal(after.exact,false);
const checkpoints=record=>record.checkpoints||[record.progress];
const a=checkpoints(before),b=checkpoints(after);assert.equal(a.length,b.length);
const report=a.map((d,i)=>{
 const e=b[i];for(const field of ['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes','topKUpdates'])assert.equal(d[field],e[field],field);
 assert.deepEqual(d.kthScoreHistory,e.kthScoreHistory);
 assert.deepEqual(d.currentCandidateIds,e.currentCandidateIds);
 if(d.observedTopK){assert.deepEqual(d.observedTopK,e.observedTopK,'scores/configuration keys/ranks/original IDs');}
 return {nodes:d.searchNodes,formal:d.completeConfigurationsEvaluated,prune:d.boundPrunedNodes,kth:d.kthScoreHistory.at(-1)?.score,
  known:e.acUpperBound.known,unknown:e.acUpperBound.unknown,percentageUses:e.acUpperBound.percentageUses,
  beforeMs:d.elapsedMs,afterMs:e.elapsedMs,observedTopKParity:!!d.observedTopK,exact:false};
});
console.log(JSON.stringify({parity:true,exact:false,checkpoints:report},null,2));
