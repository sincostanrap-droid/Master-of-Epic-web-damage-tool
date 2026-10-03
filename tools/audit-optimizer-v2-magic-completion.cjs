const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {completionRuntime,slotOrder,choiceOrder,observation}=require('./optimizer-v2-magic-completion-runtime.cjs');
const {p,B}=completionRuntime(),json=x=>JSON.parse(JSON.stringify(x)),output='docs/optimizer-v2-phase4B-3-scaling.json';
const base=vm.runInContext('DEFAULT_STATE()',p),items=p.equipmentCatalogItems();items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));
const makeContext=k=>p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'stat:magic'}],{topK:k}),{baseState:base});
const context=makeContext(20),start=performance.now(),prepared=p.MOEOptimizerV2FacetSearch.prepare(items,context),original=prepared.reduction,prepareMs=performance.now()-start;
const m=B.orderingMeasures(original),slots=slotOrder(m,'potential',context.slots),hashes=Object.fromEntries(['src/optimizer-v2/branchAndBound.js','src/optimizer-v2/facetSearch.js'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
const data={context:{race:context.race,spirit:context.inputs.spirit,skills:json(context.skillSim.skills),external:[],fixed:[],exclusions:[],constraints:[],objective:context.objective},prepareMs,classes:original.contextEquivalentClasses.length,slotOrder:slots,runs:[],sourceHashes:hashes,sameReducerAcrossK:true};
const save=()=>fs.writeFileSync(output,JSON.stringify(data,null,2));save();
for(const k of [1,3,5,10,20]){
 // Freeze the Top20-prepared reduction for this experiment: changing K must not change the candidate domain.
 const r={...original,context:makeContext(k)},a=observation(),samples=[],counts={},signal={aborted:false},started=performance.now();let last=0,lastState,result;
 const completionAudit=k===20?x=>{const rel=x.upper<x.kth?'less':x.upper===x.kth?'equal':'greater',key=x.depth+':'+rel;counts[key]=(counts[key]||0)+1;
   if((counts[key]<=16)||x.node%200003===0)samples.push({...x,ids:x.ids.slice(),slots:x.slots.slice(),relation:rel});}:undefined;
 const controller=B.run(r,{cooperative:true,signal,fixedSlotOrder:slots,diagnosticChoiceOrder:choiceOrder(m,'completion'),orderObservation:a,profileSearch:true,profileEvaluation:true,completionAudit});
 try{while(true){const q=controller.step(),elapsed=performance.now()-started;if(q.done){result=q.value;break;}lastState=q.value;if(elapsed-last>=20000){last=elapsed;console.log(`K=${k} ${Math.round(elapsed/1000)}s nodes=${q.value.searchNodes} best=${a.best} kth=${a.kth}`);}if(elapsed>=120000)signal.aborted=true;}}finally{controller.close();}
 const top=json(result.results.map(v=>({score:v.score,key:v.performanceKey,ids:v.candidateIds.slice().sort(),equipment:v.equipment.map(e=>({slot:e.slot,name:e.selectedCandidate.name,id:e.selectedCandidate.candidateId,aliases:e.equivalentCandidateIds}))})));
 const run={k,elapsedMs:performance.now()-started,diagnostics:json(result.diagnostics),observation:json(a),top,currentDepth:lastState?.currentDepth,samples:json(samples),relationCounts:counts};data.runs.push(run);save();console.log(JSON.stringify({k,exact:result.diagnostics.exact,nodes:result.diagnostics.searchNodes,formal:result.diagnostics.completeConfigurationsEvaluated,best:a.best,kth:a.kth,samples:samples.length}));
}
for(const [f,h] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'),h);data.completed=true;save();
