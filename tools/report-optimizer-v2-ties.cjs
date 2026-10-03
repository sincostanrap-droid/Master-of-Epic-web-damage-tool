/* Read-only aggregation of an exact, non-pruning tie audit. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const r=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),d=r.searchDiagnostics,a=d?.skillPlusTieAudit;
assert.equal(r.exact,true);assert.equal(a?.dryRun,true);
const relations=['less','equal','greater'];
const nodes=a.afterFinalScoreNodes;
const summary={exact:r.exact,elapsedMs:r.elapsedMs,firstTopKFullNode:d.firstTopKFullNode,
 finalScoreReachedNode:d.finalKthScoreReachedNode,kthScoreHistory:d.kthScoreHistory,
 afterFinalScoreNodes:nodes,afterFinalScoreFormal:a.afterFinalScoreFormal,afterFinalScorePrunes:a.afterFinalScorePrunes,
 relations:Object.fromEntries(relations.map(k=>[k,{nodes:a[k].nodes,percent:100*a[k].nodes/nodes,
  formal:a[k].formal,expanded:a[k].expanded,exclusiveMs:a[k].exclusiveMs}])),
 byDepth:d.slotOrder.map((slot,depth)=>({depth,slot,...Object.fromEntries(relations.map(k=>[k,a[k].byDepth[depth]]))})).concat([
  {depth:d.slotOrder.length,slot:'complete',...Object.fromEntries(relations.map(k=>[k,a[k].byDepth.at(-1)]))}]),
 dryKeys:{equalChecks:a.equalChecks,safePrunable:a.safePrunable,retained:a.retained,unknown:a.unknown,
  prefixOnly:a.prefixOnly,suffixBound:a.suffixBound,sameKey:a.sameKey,prunableRoots:a.prunableRoots,
  coveredNodes:a.coveredNodes,coveredFormal:a.coveredFormal,keyBoundMs:a.keyBoundMs,after205:a.afterFinalKey??null},
 predictedNodes:d.searchNodes-(a.coveredNodes-a.prunableRoots),predictedFormal:d.completeConfigurationsEvaluated-a.coveredFormal};
assert.equal(relations.reduce((n,k)=>n+a[k].nodes,0),nodes);
console.log(JSON.stringify(summary,null,2));
