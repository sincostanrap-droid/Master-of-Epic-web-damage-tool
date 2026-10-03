const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),plain=p.MOEOptimizerV2BranchAndBound,json=x=>JSON.parse(JSON.stringify(x));
let code=fs.readFileSync('src/optimizer-v2/branchAndBound.js','utf8');
function replace(a,b){assert.equal(code.split(a).length,2,'unique anchor '+a);code=code.replace(a,b);}
replace('      function* cooperativeDFS(depth) {','      const tail=options.tailAudit;\n      function* cooperativeDFS(depth) {');
replace('        const performanceKey=JSON.stringify(selectedClasses.map',`        if(options.tailAudit)options.tailAudit.formals.push({node:diagnostics.searchNodes,score:evaluation.score,ids:selectedIds.slice(),metrics:evaluation.metrics,classes:selectedClasses.map(c=>c.equivalenceKey)});
        const performanceKey=JSON.stringify(selectedClasses.map`);
replace('            const result=magicUpper(magic,selectedIds,slots.slice(depth),magicSuffix?.[depth]);d.calls++;d.totalMs+=performance.now()-mark;',`            const result=magicUpper(magic,selectedIds,slots.slice(depth),magicSuffix?.[depth]);d.calls++;d.totalMs+=performance.now()-mark;
            if(options.tailAudit){const a=options.tailAudit,rel=result.upper===null?'unknown':result.upper<heap[0].rankScore?'less':result.upper===heap[0].rankScore?'equal':'greater';a.relations[depth][rel]++;a.lastRelation[depth]=rel;
              if(heap[0].rankScore===64.05)a.at6405[depth][rel]++;
              if(rel==='equal'){const k=optimisticTieKey(prepareTieKey(plan,slots),selectedIds,depth,heap[0].performanceKey);a.ties[k?.classification||'unknown']=(a.ties[k?.classification||'unknown']||0)+1;}
              if(depth===slots.length&&rel==='less'&&diagnostics.searchNodes%100003<76)a.samples.push({node:diagnostics.searchNodes,ids:selectedIds.slice(),upper:result.upper,kth:heap[0].score});}`);
const begin=code.indexOf('      function* cooperativeDFS(depth)'),end=code.indexOf('      if(options.cooperative)',begin);
let part=code.slice(begin,end);
part=part.replace('        const slot=slots[depth],fixed=fixedBySlot.get(slot);','        if(tail){tail.expanded[depth]++;tail.childCurrent[depth]=0;}\n        const slot=slots[depth],fixed=fixedBySlot.get(slot);');
part=part.replace('        for(const cls of choices) {','        if(tail)tail.available[depth]+=choices.length;\n        for(const cls of choices) {\n          if(tail){tail.attempts[depth]++;tail.childCurrent[depth]++;tail.maxBranch[depth]=Math.max(tail.maxBranch[depth],tail.childCurrent[depth]);if(!cls)tail.nulls[depth]++;}');
// Stop remains handled at the same yield boundary; the added early return runs only during unwinding after controller abort.
code=code.slice(0,begin)+part+code.slice(end);vm.runInContext(code,p);const instrumented=p.MOEOptimizerV2BranchAndBound;
for(const name of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${name}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p);items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));
const context=p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'stat:magic'}],{topK:20}),{baseState:base});
const prepared=p.MOEOptimizerV2FacetSearch.prepare(items,context),r=prepared.reduction;
const array=()=>Array(18).fill(0),relations=()=>Array.from({length:18},()=>({less:0,equal:0,greater:0,unknown:0}));
function audit(){return {expanded:array(),available:array(),attempts:array(),maxBranch:array(),childCurrent:array(),nulls:array(),relations:relations(),at6405:relations(),lastRelation:[],ties:{},samples:[],formals:[]};}
function run(B,seconds,nodes,a){const signal={aborted:false},start=performance.now(),c=B.run(r,{cooperative:true,signal,profileSearch:true,profileEvaluation:true,observeTopK:true,tailAudit:a});let last=0,snapshot;
 try{while(true){const n=c.step();if(n.done)return {elapsedMs:performance.now()-start,result:n.value,snapshot};snapshot=n.value;const elapsed=performance.now()-start;if(elapsed-last>20000){last=elapsed;console.log(`${snapshot.searchNodes} nodes ${snapshot.completeConfigurationsEvaluated} formal ${Math.round(elapsed/1000)}s`);}if(elapsed>=seconds*1000||nodes&&snapshot.searchNodes>=nodes)signal.aborted=true;}}finally{c.close();}}
const off=run(plain,120,10000),on=run(instrumented,120,10000,audit());
const identity=x=>x.result.results.map(v=>({score:v.score,key:v.performanceKey,ids:v.candidateIds,aliases:v.equipment.map(e=>e.equivalentCandidateIds)}));
assert.deepEqual(json(identity(off)),json(identity(on)));for(const key of ['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes','feasibilityPrunedNodes'])assert.equal(off.result.diagnostics[key],on.result.diagnostics[key]);
const a=audit(),trial=run(instrumented,Number(process.argv[3]||120),Number(process.argv[4]||0),a),output=process.argv[2]||'docs/optimizer-v2-phase4B-1.5-tail.json';
function numeric(x){if(typeof x==='number')return x;if(Array.isArray(x))return x.map(numeric);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,numeric(x[k])]).filter(([,v])=>v!==undefined));}
function relevant(classes){return JSON.stringify(classes.map(s=>{const v=JSON.parse(s),o=v.at(-1);return {slot:o.slot,base:o.base,extra:o.extra,buffs:o.buffs,stack:o.stack,hand:o.hand,twoHanded:o.twoHanded,hardConflicts:o.hardConflicts};}).sort((x,y)=>x.slot<y.slot?-1:1));}
const seen=[new Set(),new Set(),new Set(),new Set()],fill=[null,null,null,null],groups={};
for(const f of a.formals){f.key=p.MOEOptimizerV2EffectiveCandidates.describeConfiguration(r,f.ids).performanceKey;f.relevantSignature=relevant(f.classes);f.numericMetricsSignature=JSON.stringify(numeric(f.metrics));const values=[String(f.score),JSON.stringify([f.score,f.relevantSignature]),JSON.stringify([f.score,f.numericMetricsSignature]),f.key];values.forEach((v,i)=>{seen[i].add(v);if(seen[i].size>=20&&fill[i]===null)fill[i]=f.node;});groups[f.score]=(groups[f.score]||0)+1;delete f.metrics;delete f.classes;}
a.samples=a.samples.filter((_,i)=>i%Math.max(1,Math.ceil(a.samples.length/128))===0);
for(const s of a.samples){const e=p.MOEOptimizerV2SearchContext.evaluate(context,s.ids.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id)),prepared.snapshot.sources);s.score=e.score;s.feasible=e.feasible;}
const top=trial.result.results.map(v=>({score:v.score,key:v.performanceKey,ids:v.candidateIds,equipment:v.equipment.map(e=>({slot:e.slot,name:e.selectedCandidate.name,equivalentIds:e.equivalentCandidateIds}))}));
const formalParity=trial.result.results.every(v=>{const e=p.MOEOptimizerV2SearchContext.evaluate(context,v.candidateIds.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id)),prepared.snapshot.sources);return e.score===v.score&&JSON.stringify(e.metrics)===JSON.stringify(v.metrics);});
const data={context:json(context),pipeline:json(prepared.diagnostics),classes:r.contextEquivalentClasses.length,parity:{passed:true,offMs:off.elapsedMs,onMs:on.elapsedMs,nodes:off.result.diagnostics.searchNodes},elapsedMs:trial.elapsedMs,diagnostics:json(trial.result.diagnostics),lastSnapshot:json(trial.snapshot),audit:a,distinct:{counts:seen.map(s=>s.size),filledAt:fill,formalScoreHistogram:groups},top,formalParity};fs.writeFileSync(output,JSON.stringify(data,null,2));console.log(JSON.stringify({output,nodes:data.diagnostics.searchNodes,formal:data.diagnostics.completeConfigurationsEvaluated,distinct:data.distinct,formalParity}));
