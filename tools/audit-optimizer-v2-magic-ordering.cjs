const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {runtime,slotModes,candidateModes,slotOrder,choiceOrder,observation}=require('./optimizer-v2-magic-ordering-runtime.cjs');
const {p,B}=runtime(),json=x=>JSON.parse(JSON.stringify(x)),output='docs/optimizer-v2-phase4B-2-ordering.json',limit=Number(process.argv[2]||120),extra=process.argv.includes('--extra');
const items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p);const warm=performance.now();items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));
const context=p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'stat:magic'}],{topK:20}),{baseState:base});
const setup=performance.now(),prepared=p.MOEOptimizerV2FacetSearch.prepare(items,context),r=prepared.reduction,setupMs=performance.now()-setup;
const measureStart=performance.now(),m=B.orderingMeasures(r),measureMs=performance.now()-measureStart;
const shape=()=>JSON.stringify(r.contextEquivalentClasses.map(c=>[c.equivalenceKey,c.equivalentCandidateIds])),before=shape();
const witness=JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4B-1.5-tail.json')).highFlatWitness,rows=[];let rank=0n,total=1n;
for(const s of m.currentSlots){const classes=r.contextEquivalentClasses.filter(c=>c.representativeCandidate.slot===s).sort((a,b)=>a.representativeCandidateId.localeCompare(b.representativeCandidateId)),id=witness.ids.find(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id).slot===s),position=id?classes.findIndex(c=>c.equivalentCandidateIds.includes(id))+1:classes.length+1;
 assert.ok(position>0);rank=rank*BigInt(classes.length+1)+BigInt(position-1);total*=BigInt(classes.length+1);rows.push({slot:s,position,branches:classes.length+1,id:id||null,name:id?p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id).name:'null'});}
const fresh={context:json(context),classes:r.contextEquivalentClasses.length,setupMs,facetColdMs:setup-warm,measureMs,measures:json(m),witnessPositions:rows,theoreticalWitnessLeafRank:String(rank+1n),theoreticalTotalLeaves:String(total),runs:[],sourceHashes:Object.fromEntries(['src/optimizer-v2/branchAndBound.js','src/optimizer-v2/facetSearch.js','src/optimizer-v2/searchContext.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]))};
const data=extra?JSON.parse(fs.readFileSync(output)):fresh;
const save=()=>fs.writeFileSync(output,JSON.stringify(data,null,2));save();console.log(JSON.stringify({setupMs,measureMs,currentSlots:m.currentSlots,witnessPositions:rows,rank:String(rank+1n)}));
const nodeBudgets=[10000,100000,500000,1000000,3000000,5000000],timeBudgets=[10000,30000,60000,120000];
function run(sm,cm,tag){const a=observation(),slots=slotOrder(m,sm,context.slots),signal={aborted:false},started=performance.now(),controller=B.run(r,{cooperative:true,signal,fixedSlotOrder:slots,diagnosticChoiceOrder:choiceOrder(m,cm),orderObservation:a,profileSearch:true,profileEvaluation:true});let snapshot,lastLog=0,finished,ni=0,ti=0;const nodes=[],times=[];
 function record(s,t,exact=false){return {elapsedMs:t,nodes:s.searchNodes,best:a.best,kth:a.kth,top20Minimum:a.kth,filled:a.filled,formal:s.completeConfigurationsEvaluated,prune:s.boundPrunedNodes,depth:s.currentDepth??null,leaf:s.nodesByDepth.at(-1),boundCalls:s.magicUpperBound.calls,boundMs:s.magicUpperBound.totalMs,exact};}
 try{while(true){const next=controller.step(),elapsed=performance.now()-started;if(next.done){finished=next.value;break;}snapshot=next.value;
 while(ni<nodeBudgets.length&&snapshot.searchNodes>=nodeBudgets[ni])nodes.push({budget:nodeBudgets[ni++],...record(snapshot,elapsed)});
 while(ti<timeBudgets.length&&elapsed>=timeBudgets[ti])times.push({budgetMs:timeBudgets[ti++],...record(snapshot,elapsed)});
 if(elapsed-lastLog>=20000){lastLog=elapsed;console.log(`${tag} ${sm}/${cm} ${Math.round(elapsed/1000)}s nodes=${snapshot.searchNodes} best=${a.best} kth=${a.kth} formal=${snapshot.completeConfigurationsEvaluated}`);}
 if(elapsed>=limit*1000)signal.aborted=true;
 }}finally{controller.close();}
 const elapsedMs=performance.now()-started,diag=json(finished.diagnostics),final=record({...diag,currentDepth:snapshot?.currentDepth},elapsedMs,diag.exact);
 while(ni<nodeBudgets.length)nodes.push({budget:nodeBudgets[ni++],...final,completedBeforeBudget:diag.exact,unreached:!diag.exact});
 while(ti<timeBudgets.length)times.push({budgetMs:timeBudgets[ti++],...final,completedBeforeBudget:diag.exact,unreached:!diag.exact});
 assert.deepEqual(json(a.suffixOrder),json(slots));assert.equal(before,shape());
 const top=json(finished.results.map(v=>({score:v.score,key:v.performanceKey,ids:v.candidateIds.slice().sort(),traversalIds:v.candidateIds,equipment:v.equipment.map(e=>({slot:e.slot,name:e.selectedCandidate.name,id:e.selectedCandidate.candidateId,aliases:e.equivalentCandidateIds})).sort((a,b)=>a.slot<b.slot?-1:1)})));
 const result={tag,slotMode:sm,candidateMode:cm,slotOrder:slots,elapsedMs,diagnostics:diag,observation:json(a),nodeCheckpoints:nodes,timeCheckpoints:times,top};
 if(diag.exact){const prior=data.runs.find(x=>x.diagnostics.exact);if(prior)assert.deepEqual(top.map(({traversalIds,...x})=>x),prior.top.map(({traversalIds,...x})=>x));result.exactTop20Parity=!!prior;}
 data.runs.push(result);save();console.log(JSON.stringify({tag,sm,cm,elapsedMs,nodes:diag.searchNodes,formal:diag.completeConfigurationsEvaluated,kth:a.kth,best:a.best,exact:diag.exact}));return result;
}
// All single-axis controls first. The subsequent combined choice is selected from measurements, not from the known witness.
if(!extra)for(const cm of candidateModes)run('current',cm,'candidate-control');
if(!extra)for(const sm of slotModes.filter(s=>s!=='current'))run(sm,'current','slot-control');
const checkpoint=r=>r.nodeCheckpoints.find(x=>x.budget===100000),candidateBest=data.runs.filter(x=>x.tag==='candidate-control').sort((a,b)=>(checkpoint(b).kth??-Infinity)-(checkpoint(a).kth??-Infinity)||a.elapsedMs-b.elapsedMs)[0].candidateMode;
data.bestCandidateAt100k=candidateBest;save();
for(const sm of (extra?['pruning']:['smallest','potential','hybrid']))if(!data.runs.some(x=>x.slotMode===sm&&x.candidateMode===candidateBest))run(sm,candidateBest,'combined');
const best=data.runs.slice().sort((a,b)=>Number(b.diagnostics.exact)-Number(a.diagnostics.exact)||(b.observation.kth??-Infinity)-(a.observation.kth??-Infinity)||(a.diagnostics.exact?a.elapsedMs-b.elapsedMs:a.diagnostics.nodesByDepth.at(-1)/a.diagnostics.searchNodes-b.diagnostics.nodesByDepth.at(-1)/b.diagnostics.searchNodes))[0];data.selectedBest={slotMode:best.slotMode,candidateMode:best.candidateMode};save();
const confirmation=run(best.slotMode,best.candidateMode,'selected-120s-confirmation'+(extra?'-extra':''));data.confirmation=confirmation.tag;
const candidates=confirmation.top.map(t=>t.ids.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id)));
data.bestFormalParity=candidates.every((list,i)=>p.MOEOptimizerV2SearchContext.evaluate(context,list,prepared.snapshot.sources).score===confirmation.top[i].score);
const greedyStart=performance.now(),greedy=[];for(const s of slotOrder(m,'potential',context.slots)){const choices=r.candidates.filter(c=>c.slot===s).sort((a,b)=>m.candidates[b.candidateId].completion-m.candidates[a.candidateId].completion);for(const c of [...choices,null]){const list=c?[...greedy,c]:greedy,e=p.MOEOptimizerV2SearchContext.evaluate(context,list,prepared.snapshot.sources);if(e.feasible){if(c)greedy.push(c);break;}}}
const g=p.MOEOptimizerV2SearchContext.evaluate(context,greedy,prepared.snapshot.sources);data.greedy={score:g.score,legal:g.feasible,violations:json(g.violations),elapsedMs:performance.now()-greedyStart,ids:greedy.map(c=>c.candidateId),note:'Diagnostic only, never injected into any ordering run'};
for(const [f,h] of Object.entries(data.sourceHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),h);data.productionSourcesUnchanged=true;if(extra)data.extraCompleted=true;save();console.log(JSON.stringify({selectedBest:data.selectedBest,greedy:data.greedy,formalParity:data.bestFormalParity}));
