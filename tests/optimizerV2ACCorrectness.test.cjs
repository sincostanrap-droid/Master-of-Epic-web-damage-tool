const assert=require('node:assert/strict'),vm=require('node:vm');
const {contextRuntime}=require('../tools/inspect-optimizer-v2-context.cjs');
const p=contextRuntime(),C=p.MOEOptimizerV2SearchContext,V=p.MOEOptimizerV2Candidates,
 E=p.MOEOptimizerV2EffectiveCandidates,R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound;
const json=x=>JSON.parse(JSON.stringify(x));
const freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const armor=(id,raw,required,slot='防具: 頭',add=0)=>({catalogId:id,name:id,category:'defense',slot,
 armorClass:raw,requiredSkill:'着こなし',needLevel:required,requirements:required?[{name:'着こなし',required}]:[],extraStats:{extraAC:add}});
function snapshot(items,edits={}){const s=json(V.generate({items}));for(const c of s.candidates)Object.assign(c.evaluationFields,edits[c.catalogId]||{});return freeze(s);}
function ctx(current,slots,extra={}){return C.create({objective:'ac',race:'newtar',skillSim:{skills:{'着こなし':current}},slots,topK:20,...extra});}
const single=snapshot([armor('body',100,100)]);
for(const [current,required,mod] of [[100,200,0],[80,100,.8],[90,100,.9],[100,100,1],
 [79.999999,100,0],[56.8,71,.8],[56.799999,71,0]]){
 const s=snapshot([armor('gate',100,required)]),c=ctx(current,['防具: 頭']),e=C.evaluate(c,s.candidates,s.sources);
 const row=V.toEquipmentRow(s.candidates[0]),formal=p.equipmentArmorAC(row,c.skillSim);
 assert.ok(Math.abs(formal.performance.mod-mod)<1e-12);
 assert.equal(e.metrics.armorAC.raw,100);assert.equal(e.metrics.armorAC.effective,formal.effective);
 assert.equal(e.score,e.metrics.defense);
 assert.equal(e.score,C.withRuntime(c,()=>p.totalStatValue(p.skillSimDerived().def,e.metrics.extraStats.extraAC,e.metrics.extraStats.extraACPct)));
}
assert.ok(Math.abs(p.skillRequirementRatio(.08,.1).ratio-.8)<1e-12);
assert.equal(p.skillRequirementRatio(.079999,.1).ratio,0);
const buff={equipBuffEnabled:true,equipBuffName:'audit AC Buff',equipBuffExtraAC:20,equipBuffExtraACPct:5};
const unmet=snapshot([armor('buffed',100,200,'防具: 頭',10)],{buffed:buff}),uc=ctx(100,['防具: 頭']);
const ue=C.evaluate(uc,unmet.candidates,unmet.sources);
assert.equal(ue.metrics.armorAC.effective,0);assert.equal(ue.metrics.armorAC.additions,10);assert.equal(ue.metrics.armorAC.buff,20);
assert.equal(ue.score,52.5);
const hp=snapshot([armor('plus',100,100)],{plus:{equipBuffEnabled:true,equipBuffName:'clothing plus',
 extraEffects:[{key:'skillPlus',name:'着こなし',value:20}]}});
const pe=C.evaluate(ctx(70,['防具: 頭']),hp.candidates,hp.sources);
assert.equal(pe.metrics.skillPlusTotals['着こなし'],20);assert.equal(pe.metrics.armorAC.effective,0);assert.equal(pe.score,14);
const multi=snapshot([{...armor('multi',100,100),requirements:[{name:'着こなし',required:100},{name:'筋力',required:50}]}]);
const mc=ctx(90,['防具: 頭'],{skillSim:{skills:{'着こなし':90,'筋力':39}}});
assert.equal(C.evaluate(mc,multi.candidates,multi.sources).metrics.armorAC.effective,0);
const legacy=V.toEquipmentRow(single.candidates[0]);delete legacy.armorBaseAC;delete legacy.armorRequirements;
// Synthetic IDs have no catalog fallback: explicit manual body metadata is required.
assert.equal(p.equipmentArmorAC(legacy,{skills:{'着こなし':100}}).raw,0);
const real=p.equipmentCatalogItems().find(i=>i.armorClass>10&&i.requiredSkill==='着こなし');
const realRow=p.catalogEquipmentToRow(real);const recovered=json(realRow);delete recovered.armorBaseAC;delete recovered.armorRequirements;
assert.deepEqual(json(p.equipmentArmorAC(recovered,{skills:{'着こなし':50}})),json(p.equipmentArmorAC(realRow,{skills:{'着こなし':50}})));
const quality=V.generate({items:[armor('quality',100,200,'防具: 頭',10)],qualities:['raw','HG_MG']});
assert.equal(V.toEquipmentRow(quality.candidates[1]).armorBaseAC,110);
assert.equal(p.equipmentArmorAC(V.toEquipmentRow(quality.candidates[1]),{skills:{'着こなし':100}}).addition,10);
const constraint=ctx(100,['防具: 頭'],{minAC:50,constraints:[{metric:'ac',op:'gte',value:50}]});
assert.equal(C.evaluate(constraint,unmet.candidates,unmet.sources).feasible,true);
assert.equal(C.evaluate(constraint,[],unmet.sources).feasible,false);

let partialCount=0;
function exhaustive(label,items,current,edits={},baseState){
 const s=snapshot(items,edits),c=ctx(current,[...new Set(items.map(i=>i.slot))],{baseState});
 const full=E.reduce(s,c),reduced=R.reduce(s,c),answers=new Map();
 // Independent original-candidate Cartesian enumeration, not B&B traversal.
 function brute(depth,selected){
  if(depth===c.slots.length){const evaluated=C.evaluate(c,selected,s.sources);if(evaluated.feasible){
   const d=R.describeConfiguration(reduced,selected.map(x=>x.candidateId));
   const ids=d.equipment.map(g=>[g.slot,[...g.equivalentCandidateIds]]);
   answers.set(d.performanceKey,{score:evaluated.score,key:d.performanceKey,ids});}return;}
  brute(depth+1,selected);for(const candidate of s.candidates.filter(x=>x.slot===c.slots[depth]))brute(depth+1,[...selected,candidate]);
 }
 brute(0,[]);
 const expected=[...answers.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,20);
 // Independently enumerate all completions of EVERY representative partial state.
 function safety(depth,selected){let maximum=-Infinity;
  if(depth===c.slots.length){const e=C.evaluate(c,selected,s.sources);if(e.feasible)maximum=e.score;}
  else {maximum=safety(depth+1,selected);for(const candidate of full.candidates.filter(x=>x.slot===c.slots[depth]))
   maximum=Math.max(maximum,safety(depth+1,[...selected,candidate]));}
  const bound=B.inspectACGroups(full,selected.map(x=>x.candidateId),c.slots.slice(depth));
  const preparedBound=B.inspectACGroups(full,selected.map(x=>x.candidateId),c.slots.slice(depth),{prepared:true});
  assert.deepEqual(json(preparedBound),json(bound),label+' exact old/prepared bound parity');
  assert.ok(Object.is(preparedBound.upper,bound.upper),label+' bit-identical upper');
  const reversed=c.slots.slice(depth).reverse(),ids=selected.map(x=>x.candidateId).reverse();
  const reversedOld=B.inspectACGroups(full,ids,reversed),reversedNew=B.inspectACGroups(full,ids,reversed,{prepared:true});
  assert.ok(Object.is(reversedOld.upper,reversedNew.upper),label+' reverse suffix and selected order');
  assert.ok(bound&&bound.upper!==null,label+' known');assert.ok(bound.upper>=maximum,`${label}: ${bound.upper} >= ${maximum}`);
  const old=B.inspectACPercentage(full,selected.map(x=>x.candidateId),c.slots.slice(depth));
  if(old?.upper!==null&&old?.upper!==undefined)assert.ok(old.upper>=maximum,label+' C1 envelope');
  partialCount++;return maximum;
 }
 safety(0,[]);
 for(const opts of [{enablePruning:false},{acPercentageBound:false,acGroupBound:false},{acGroupBound:false},{acPreparedBound:false},{},
  {slotOrder:'ascending'},{slotOrder:'descending'},{preparedEvaluation:false}]){
  const result=B.run(reduced,opts);assert.equal(result.diagnostics.exact,true);
  assert.deepEqual(json(result.results.map(r=>({score:r.score,key:r.performanceKey,ids:r.equipment.map(g=>[g.slot,[...g.equivalentCandidateIds]])}))),json(expected),label+JSON.stringify(opts));
  for(const r of result.results){const normal=C.evaluate(c,r.candidateIds.map(id=>R.resolveCandidate(reduced,id)),s.sources);
   assert.equal(normal.score,r.score);assert.deepEqual(json(normal.metrics),json(r.metrics));}
 }
 for(const candidate of s.candidates)assert.equal(R.resolveCandidate(reduced,candidate.candidateId).candidateId,candidate.candidateId);
 console.log(label,{partialCount,classes:reduced.contextEquivalentClasses.length});
}
const head='防具: 頭',body='防具: 胴';
for(const current of [0,56.8,70,79.999999,80,90,100])exhaustive('requirements '+current,
 [armor('high-unmet',100,200,head),armor('lower-met',60,50,head),armor('boundary',80,100,head),
  armor('other',50,71,body),armor('bonus',30,200,body,12),armor('alias',50,71,body)],current);
const groupItems=[armor('high',100,200,head),armor('lower',60,50,head),armor('pct',25,100,body),armor('flat',30,50,body)];
exhaustive('groups flat pct and body',groupItems,80,{lower:{...buff,equipBuffConflictGroups:'ac-exclusive'},
 pct:{...buff,equipBuffExtraAC:0,equipBuffExtraACPct:25,equipBuffConflictGroups:'ac-exclusive'},
 flat:{...buff,equipBuffExtraAC:35,equipBuffExtraACPct:0,equipBuffConflictGroups:'ac-exclusive'}});
const negative=vm.runInContext('DEFAULT_STATE()',p);negative.composite=[{enabled:true,name:'sign reversal',extraACPct:-200}];
exhaustive('negative base and group envelope',[armor('negative',-30,100,head),armor('positive',20,50,head),armor('other',10,200,body)],80,{},negative);
exhaustive('Top20 boundary',Array.from({length:24},(_,i)=>armor('ladder'+i,i+1,50,head)),70);
exhaustive('three slots requirement and unattenuated bonus',[
 armor('h1',100,200,head),armor('h2',60,50,head),armor('h3',80,100,head),
 armor('b1',50,71,body),armor('b2',30,200,body,12),armor('b3',20,50,body),
 armor('l1',40,100,'防具: 手'),armor('l2',25,50,'防具: 手',10),armor('l3',10,200,'防具: 手')],80,
 {l3:{...buff,equipBuffExtraAC:0,equipBuffExtraACPct:10}});
assert.ok(partialCount>=227);
exhaustive('floating point addition order',[
 armor('large',1e16,0,head),armor('small',.000001,0,body),armor('medium',.1,0,'防具: 手')],100);
console.log('formal AC correctness: requirements/add status/Buff/percent/skillPlus/UI/Top20/upper safety',partialCount);
