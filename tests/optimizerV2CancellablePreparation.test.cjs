const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),cp=require('node:child_process');
function runtime(original=false){const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${n}.js`,'utf8'),p);vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);if(original)for(const n of ['candidates','effectiveCandidates','metricCandidateReducer','facetSearch'])vm.runInContext(cp.execFileSync('git',['show',`481f2c9:src/optimizer-v2/${n}.js`],{encoding:'utf8',maxBuffer:8e6}),p);const converter=p.catalogEquipmentToRow;p.catalogEquipmentToRow=(i,...args)=>Object.assign(converter(i,...args),i.fields||{});return p;}
const original=runtime(true),p=runtime(),S=p.MOEEquipmentSearchSpecification,F=p.MOEOptimizerV2FacetSearch;
const group={equipBuffEnabled:true,equipBuffConflictGroups:'audit-conflict',equipBuffStackRule:'score'};
const item=(id,slot,fields)=>({catalogId:id,name:id,slot,category:'defense',fields});
const items=[item('high','防具: 頭',{magic:20,extraAvoid:4,extraFireRes:5,extraEffects:[{key:'skillPlus',name:'破壊魔法',value:10,scope:'display'}]}),item('alternate','防具: 頭',{magic:4,extraAvoid:20,extraFireRes:30}),item('buff','装飾: 胸',{...group,equipBuffName:'one',equipBuffFlatMagic:15,equipBuffExtraAvoid:9,equipBuffExtraFireRes:7}),item('buff2','装飾: 腰',{...group,equipBuffName:'two',equipBuffFlatMagic:6,equipBuffExtraAvoid:12,equipBuffExtraFireRes:18}),item('irrelevant','装飾: 耳',{extraHP:5})];
const base=vm.runInContext('DEFAULT_STATE()',p),oldBase=vm.runInContext('DEFAULT_STATE()',original),slots=[...new Set(items.map(i=>i.slot))];
const pairs=[['skillPlus:破壊魔法'],['stat:magic'],['stat:extraAvoid'],['stat:extraFireRes'],['skillPlus:破壊魔法','stat:magic'],['skillPlus:破壊魔法','stat:extraAvoid'],['stat:magic','stat:extraFireRes'],['stat:extraAvoid','stat:extraFireRes']];
const json=x=>JSON.parse(JSON.stringify(x));
const classes=prep=>json(prep.reduction.contextEquivalentClasses.map(c=>[c.equivalenceKey,c.equivalentCandidateIds]));
const top=result=>json(result.results.map((r,i)=>({rank:i+1,primary:r.score,secondary:r.secondaryScore??null,key:r.performanceKey,ids:r.candidateIds,exact:result.diagnostics.exact})));
let comparisons=0;
(async()=>{
 const stateBefore=vm.runInContext('JSON.stringify(state)',p);
 for(const pair of pairs)for(const k of [1,5,20]){
  const axes=pair.map(key=>({key})),spec=S.create(axes,{secondary:pair.length>1,topK:k,slots}),context=S.toContext(spec,{baseState:base});
  const priorSpec=original.MOEEquipmentSearchSpecification.create(axes,{secondary:pair.length>1,topK:k,slots}),priorContext=original.MOEEquipmentSearchSpecification.toContext(priorSpec,{baseState:oldBase});
  const expected=original.MOEOptimizerV2FacetSearch.prepare(items,priorContext),prepared=await F.prepareAsync(items,context,{budgetMs:1,onProgress:()=>assert.equal(vm.runInContext('JSON.stringify(state)',p),stateBefore,'Runtime restored before yielding')});
  assert.deepEqual(classes(prepared),classes(expected));assert.deepEqual(top(await F.run(prepared)),top(original.MOEOptimizerV2BranchAndBound.run(expected.reduction)));comparisons++;
 }
 const context=S.toContext(S.create([{key:'stat:extraAvoid'},{key:'stat:extraFireRes'}],{secondary:true,slots}),{baseState:base});
 for(const phase of ['catalog','candidate preparation','reducer projection','reducer relevance','equivalence','finalize']){
  const signal=new AbortController();let reached=false;
  await assert.rejects(F.prepareAsync(items,context,{budgetMs:0,signal:signal.signal,onProgress:d=>{if(d.phase===phase){reached=true;signal.abort();}}}),e=>e.name==='AbortError');assert.ok(reached,phase);
  const restart=await F.prepareAsync(items,context,{budgetMs:0});assert.equal((await F.run(restart)).diagnostics.exact,true);
 }
 const preAborted=new AbortController();preAborted.abort();let callbacks=0;await assert.rejects(F.prepareAsync(items,context,{signal:preAborted.signal,onProgress:()=>callbacks++}),e=>e.name==='AbortError');assert.equal(callbacks,0);
 const warm=await F.prepareAsync(items,context);assert.equal(warm.diagnostics.catalogCache.candidateMisses,0);assert.ok(warm.snapshot.candidates.every(Object.isFrozen));assert.ok(Object.isFrozen(warm.snapshot.sources));
 console.log(JSON.stringify({baselineCheckpoint:'481f2c9',beforeAfterTopKComparisons:comparisons,K:[1,5,20],stageAbortRestart:6,preAborted:true,runtimeRestoration:true,warmCandidateMisses:0}));
})().catch(e=>{console.error(e);process.exitCode=1;});
