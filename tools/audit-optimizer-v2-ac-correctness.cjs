/* Read-only audit of the approved formal AC correction. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
const C=p.MOEOptimizerV2SearchContext,V=p.MOEOptimizerV2Candidates;
const json=v=>JSON.parse(JSON.stringify(v));
function inspect(label,current,items,buff={}) {
 const snapshot=json(V.generate({items}));
 if(snapshot.candidates.length)Object.assign(snapshot.candidates[0].evaluationFields,buff);
 const context=C.create({objective:'ac',race:'newtar',skillSim:{skills:{'着こなし':current}},slots:[...new Set(items.map(i=>i.slot))]});
 const e=C.evaluate(context,snapshot.candidates,snapshot.sources);
 const ui=C.withRuntime(context,()=>p.totalStatValue(p.skillSimDerived().def,e.metrics.extraStats.extraAC,e.metrics.extraStats.extraACPct));
 return {label,current,ui,formalDefense:e.metrics.defense??null,currentV2:e.score,
  formalExtraAC:e.metrics.extraStats.extraAC,pct:e.metrics.extraStats.extraACPct,skillPlusTotals:e.metrics.skillPlusTotals,
  armorAC:e.metrics.armorAC??null,rows:snapshot.candidates.map(c=>V.toEquipmentRow(c))};
}
const armor=(id,ac,req,slot='防具: 胴',add=0)=>({catalogId:id,name:id,category:'defense',slot,
 armorClass:ac,requiredSkill:'着こなし',needLevel:req,requirements:[{name:'着こなし',required:req}],extraStats:{extraAC:add}});
const cases=[inspect('naked',100,[]),inspect('A 50%',100,[armor('A',100,200)]),
 inspect('B 80%',80,[armor('B',100,100)]),inspect('C 90%',90,[armor('C',100,100)]),
 inspect('D 100%',100,[armor('D',100,100)]),inspect('below80',79.999999, [armor('below',100,100)]),
 inspect('mixed requirements',90,[armor('mixed1',100,100),armor('mixed2',80,200,'防具: 頭')]),
 inspect('unmet + add status + flat Buff + percent',100,[armor('buffed',100,200,'防具: 胴',10)],
 {equipBuffEnabled:true,equipBuffName:'audit fixed Buff',equipBuffExtraAC:20,equipBuffExtraACPct:5}),
 inspect('skillPlus must not meet requirement',70,[armor('plus',100,100)],
 {equipBuffEnabled:true,equipBuffName:'audit skillPlus',extraEffects:[{key:'skillPlus',name:'着こなし',value:20}]}),
 inspect('unmet + percent',100,[armor('pct',100,200)],{equipBuffEnabled:true,equipBuffName:'audit percentage',equipBuffExtraACPct:5})];
const snapshot=V.generate(),context=require('./inspect-optimizer-v2-objectives.cjs').objectiveContexts(p,20).ac;
const bell=snapshot.candidates.find(c=>c.name==='アース チェストベル');
if(bell){const e=C.evaluate(context,[bell],snapshot.sources);cases.push({label:bell.name,current:context.skillSim.skills['着こなし'],
 ui:C.withRuntime(context,()=>p.totalStatValue(p.skillSimDerived().def,e.metrics.extraStats.extraAC,e.metrics.extraStats.extraACPct)),
 formalDefense:e.metrics.defense??null,currentV2:e.score,armorAC:e.metrics.armorAC??null});}
// Reuse the formal armor helper; no optimizer-specific AC formula.
function requirementOnly(c,sim){
 const result=p.equipmentArmorAC(V.toEquipmentRow(c),sim);
 return {raw:result.raw,effective:result.effective,addition:result.addition,performance:result.performance};
}
const analyzed=snapshot.candidates.map(c=>({candidate:c,performance:requirementOnly(c,context.skillSim)}));
const reversals=[];let pairCount=0;const affected=new Set();
for(const a of analyzed)for(const b of analyzed){
 if(a.candidate.slot!==b.candidate.slot||!(a.performance.raw>b.performance.raw)||
  !(a.performance.effective<b.performance.effective))continue;
 pairCount++;affected.add(a.candidate.candidateId);
 if(reversals.length<10)reversals.push({slot:a.candidate.slot,A:{name:a.candidate.name,id:a.candidate.candidateId,...a.performance},
 B:{name:b.candidate.name,id:b.candidate.candidateId,...b.performance}});
}
const out={status:'approved formal AC correction; requirements and clothing multiplier applied by formal helper',
 candidateCount:snapshot.candidates.length,validationSkillSim:context.skillSim,validationRace:context.race,
 prePatchCounterexample:{current:100,required:200,rawBodyAC:100,addStatusAC:10,formalExtraAC:110,v2:110,ui:130},
 cases,rankReversalPairCount:pairCount,affectedCandidateCount:affected.size,reversals};
out.boundaryAudit=[100,71,0.1].map(required=>({required,current:required*0.8,
 atCalculatedBoundary:p.skillRequirementRatio(required*0.8,required),
 literalDecimalBoundary:required===0.1?p.skillRequirementRatio(0.08,required):required===71?p.skillRequirementRatio(56.8,required):null}));
const secondarySim=json(context.skillSim);secondarySim.skills['着こなし']=70;
const secondary=analyzed.map(x=>({candidate:x.candidate,performance:requirementOnly(x.candidate,secondarySim)}));
out.secondaryClothing70={label:'supplemental character, NOT validation context',pairCount:0,examples:[]};
for(const a of secondary)for(const b of secondary){
 if(a.candidate.slot!==b.candidate.slot||!(a.performance.raw>b.performance.raw)||!(a.performance.effective<b.performance.effective))continue;
 out.secondaryClothing70.pairCount++;
 if(out.secondaryClothing70.examples.length<10)out.secondaryClothing70.examples.push({slot:a.candidate.slot,
  A:{name:a.candidate.name,id:a.candidate.candidateId,...a.performance},B:{name:b.candidate.name,id:b.candidate.candidateId,...b.performance}});
}
if(process.argv[3]){
 const record=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
 const reduced=p.MOEOptimizerV2MetricCandidateReducer.reduce(snapshot,context);
 const session=p.MOEOptimizerV2EvaluationSession.create(context,snapshot.sources);
 const results=record.progress.observedTopK.map(r=>{
  const selected=r.candidateIds.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(reduced,id));
  const normal=C.evaluate(context,selected,snapshot.sources),prepared=session.evaluate(selected);
  assert.equal(normal.score,r.score);assert.deepEqual(json(normal.metrics),json(prepared.metrics));
  assert.equal(normal.feasible,true);assert.equal(prepared.feasible,true);
  assert.equal(p.MOEOptimizerV2MetricCandidateReducer.describeConfiguration(reduced,r.candidateIds).performanceKey,r.performanceKey);
  return {score:r.score,candidateIds:r.candidateIds,allMetricsParity:true,keyParity:true};
 });
 session.dispose();out.prefixFormalReevaluation=results;
}
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(out,null,2));
console.log(JSON.stringify({caseCount:cases.length,current:context.skillSim.skills['着こなし'],pairCount,affected:affected.size,
 examples:reversals.map(r=>[r.A.name,r.A.raw,r.A.effective,r.B.name,r.B.raw,r.B.effective])},null,2));
