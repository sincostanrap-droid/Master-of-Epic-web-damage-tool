const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const n of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync('src/domain/'+n+'.js','utf8'),p);
for(const n of ['petGrowth','facetSearch'])vm.runInContext(fs.readFileSync('src/optimizer-v2/'+n+'.js','utf8'),p);
const C=p.MOEOptimizerV2SearchContext,B=p.MOEOptimizerV2BranchAndBound,F=p.MOEOptimizerV2FacetSearch,P=p.MOEPetGrowth,original=p.catalogEquipmentToRow;
p.catalogEquipmentToRow=(item,...a)=>Object.assign(original(item,...a),item.fixtureFields||{});
const slots=['防具: 頭','防具: 手','装飾: 胸','防具: 腰'],json=v=>JSON.parse(JSON.stringify(v));
const mapping={8305:['B',1.1],13692:['B',1.2],14655:['L',1.2],14656:['M',1.1],13787:['K',1.1],11323:['F',1.05],12388:['G',1.2],12612:['H',1.1],13041:['J',1.05]};
const ids=[8305,14655,13692,11323,12388,13787,14656,12612,13041];
const items=ids.map((id,i)=>({catalogId:'pet-'+i,name:'pet-'+i,category:'defense',slot:slots[i%4],technicId:id,fixtureFields:{enabled:true,equipBuffEnabled:true,equipBuffTechnicId:id,equipBuffName:'pet-'+i}}));
items[0].fixtureFields.requirements=[{name:'着こなし',required:100}];
function oracle(chosen){const g={};for(const c of chosen){const row=p.MOEOptimizerV2Candidates.toEquipmentRow(c),r=mapping[row.equipBuffTechnicId];if(r)g[r[0]]=Math.max(g[r[0]]||1,r[1]);}return Object.keys(g).sort().reduce((v,k)=>v*g[k],1);}
let states=0,completions=0,parities=0;
for(const policy of ['normal','fixed','excluded','minimum'])for(const k of [1,5,20]){
 const snap=p.MOEOptimizerV2Candidates.generate({items});const chosen=snap.candidates.find(c=>c.catalogId==='pet-1');
 const context=C.create({objective:'petGrowth',topK:k,slots,...(policy==='fixed'?{fixedCandidateIds:[chosen.candidateId]}:{}),...(policy==='excluded'?{excludedCandidateIds:[chosen.candidateId]}:{}),...(policy==='minimum'?{constraints:[{metric:'petGrowth',op:'gte',value:1.5}]}:{})});
 const prep=F.prepare(items,context),r=prep.reduction,classes=r.contextEquivalentClasses,rows=new Map(classes.map(c=>[c.representativeCandidateId,p.MOEOptimizerV2Candidates.toEquipmentRow(c.representativeCandidate)])),groups=new Map(slots.map(s=>[s,classes.filter(c=>c.representativeCandidate.slot===s)])),proof=P.prepareBound({rows,groups,slots}),expected=[];
 function visit(d,selected){let best=1;if(d===slots.length){const evaluation=C.evaluate(context,selected,r.sources),score=oracle(selected);assert.equal(evaluation.score,score);completions++;if(evaluation.feasible){const desc=p.MOEOptimizerV2EffectiveCandidates.describeConfiguration(r,selected.map(c=>c.candidateId));expected.push({score,key:desc.performanceKey,ids:selected.map(c=>c.candidateId).sort()});}return score;}
 for(const cls of [null,...groups.get(slots[d])])best=Math.max(best,visit(d+1,cls?[...selected,cls.representativeCandidate]:selected));assert.ok(P.upper(proof,selected.map(c=>c.candidateId),d)+1e-12>=best);states++;return best;}
 visit(0,[]);expected.sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0));
 for(const options of [{},{boundMode:'none'},{slotOrder:'descending'}]){const out=B.run(r,options);assert.equal(out.diagnostics.exact,true);assert.deepEqual(json(out.results.map(v=>({score:v.score,key:v.performanceKey,ids:v.candidateIds.slice().sort()}))),json(expected.slice(0,k)));parities++;}
}
assert.ok(states>=300);assert.equal(P.resolve([]).multiplier,1);assert.equal(P.resolve([{enabled:true,equipBuffEnabled:false,equipBuffTechnicId:14655}]).multiplier,1);
const report={partialStates:states,violations:0,independentCompletions:completions,parityRuns:parities,K:[1,5,20],fixed:true,excluded:true,minimum:true,requirement:true,null:true};fs.writeFileSync('docs/pet-growth-fixtures.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
(async()=>{const ctx=C.create({objective:'petGrowth',topK:20,slots}),prep=F.prepare(items,ctx),abort=new AbortController();let progress=0;const out=await F.run(prep,{signal:abort.signal,onProgress:d=>{progress++;if(d.completeConfigurationsEvaluated>0)abort.abort();}});assert.ok(progress>0);assert.equal(out.diagnostics.exact,false);assert.ok(out.results.length>0);const again=await F.run(prep);assert.equal(again.diagnostics.exact,true);const invalid=C.create({objective:'petGrowth',secondary:'magic',slots});assert.throws(()=>F.prepare(items,invalid),/単独軸/);console.log('cooperative stop exact:false, restart exact:true, unsupported secondary explicit rejection passed');})().catch(e=>{console.error(e);process.exitCode=1;});
