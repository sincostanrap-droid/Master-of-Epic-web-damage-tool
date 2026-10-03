const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const name of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${name}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const C=p.MOEOptimizerV2SearchContext,B=p.MOEOptimizerV2BranchAndBound,E=p.MOEOptimizerV2EffectiveCandidates,S=p.MOEEquipmentSearchSpecification;
const json=v=>JSON.parse(JSON.stringify(v)),original=p.catalogEquipmentToRow;
p.catalogEquipmentToRow=(i,...args)=>Object.assign(original(i,...args),i.fixtureFields||{});
const project=i=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const slots=['防具: 頭','装飾: 胸','武器: 右手','武器: 左手'];
const item=(id,slot,fields)=>({catalogId:id,name:id,category:'defense',slot,fixtureFields:fields});
const buff=(id,slot,fields)=>item(id,slot,{equipBuffEnabled:true,equipBuffName:id,equipBuffTechnicId:id,...fields});
// Search ordering is a permutation; compare the exact candidate ID set.
const identity=r=>({score:r.score,key:r.performanceKey,ids:r.candidateIds.slice().sort(),aliases:r.equipment.map(e=>e.equivalentCandidateIds)});
let states=0,reevaluations=0;
for(const negative of [false,true]){
 const base=vm.runInContext('DEFAULT_STATE()',p);base.skillSim.skills['精神力']=70;
 base.composite=[{enabled:true,name:'external',flatMagic:7,magicPct:10,tags:'G',stackRule:'latest'},
  {enabled:false,name:'OFF',flatMagic:1000,magicPct:1000}];
 base.pct=[{enabled:true,target:'magic',percent:-10,name:'fixed percentage'}];
 const items=[item('head-high',slots[0],{magic:10,extraAC:100,armorRequirements:[{name:'着こなし',required:100}]}),
  item('head-low',slots[0],{magic:6}),item('head-low-alias',slots[0],{magic:6,armorRequirements:[{name:'着こなし',required:100}]}),item('head-negative',slots[0],{magic:-12}),
  buff('chest-five',slots[1],{equipBuffFlatMagic:5,equipBuffConflictGroups:'G',equipBuffStackRule:'latest'}),
  buff('chest-three',slots[1],{equipBuffFlatMagic:3,equipBuffConflictGroups:'G'}),
  buff('chest-zero',slots[1],{equipBuffFlatAttack:9,equipBuffConflictGroups:'G',equipBuffStackRule:'latest'}),
  item('right-requirement',slots[2],{magic:20,weaponDamage:50,weaponReq:[{name:'刀剣',required:100}]}),
  buff('right-percent',slots[2],{equipBuffMagicPct:20,equipBuffConflictGroups:'G,H',weaponDamage:10}),
  buff('right-stack',slots[2],{equipBuffFlatMagic:4,equipBuffTechnicId:'X',weaponDamage:10,weaponTwoHanded:'○'}),
  buff('left-stack',slots[3],{equipBuffFlatMagic:2,equipBuffTechnicId:'X'}),
  buff('left-negative',slots[3],{equipBuffMagicPct:negative?-150:-30}),
  item('left-flat',slots[3],{magic:5})];
 const context=S.toContext(S.create([{key:'stat:magic'}],{slots,topK:20}),{baseState:base});
 const before=p.MOEOptimizerV2FacetSearch.prepare(items,context,{project,magicReduction:false}),after=p.MOEOptimizerV2FacetSearch.prepare(items,context,{project});
 assert.ok(before.reduction.contextEquivalentClasses.some(c=>c.equivalentCandidateIds.length===2));
 const snapshot=p.MOEOptimizerV2Candidates.generate({items}),all=new Map(),partials=[];
 const describe=chosen=>E.describeConfiguration(before.reduction,chosen.map(c=>c.candidateId));
 function visit(depth,chosen){let maximum=-Infinity;
  if(depth===slots.length){const e=C.evaluate(context,chosen,snapshot.sources);if(e.feasible){const d=describe(chosen);all.set(d.performanceKey,{score:e.score,key:d.performanceKey});maximum=e.score;}}
  else for(const c of [null,...snapshot.candidates.filter(c=>c.slot===slots[depth])])maximum=Math.max(maximum,visit(depth+1,c?[...chosen,c]:chosen));
  partials.push({depth,chosen,maximum});return maximum;
 }visit(0,[]);
 const expected=[...all.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,20);
 const members=new Map(before.reduction.contextEquivalentClasses.flatMap(c=>c.equivalentCandidateIds.map(id=>[id,c.representativeCandidateId])));
 for(const x of partials){const u=B.inspectMagic(before.reduction,x.chosen.map(c=>members.get(c.candidateId)),slots.slice(x.depth));
  states++;assert.ok(u.upper>=x.maximum,JSON.stringify({negative,depth:x.depth,upper:u.upper,max:x.maximum,reason:u.reason}));}
 let first;
 for(const [r,opts] of [[before.reduction,{magicBound:false}],[before.reduction,{}],[after.reduction,{magicPreparedBound:false}],[after.reduction,{}],[after.reduction,{boundMode:'none'}],[after.reduction,{slotOrder:'descending'}]]){
  const result=B.run(r,opts);assert.equal(result.diagnostics.exact,true);
  assert.deepEqual(json(result.results.map(v=>({score:v.score,key:v.performanceKey}))),expected);
  const ids=json(result.results.map(identity));if(!first)first=ids;else assert.deepEqual(ids,first);
  for(const v of result.results){const e=C.evaluate(context,v.candidateIds.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id)),snapshot.sources);
   assert.equal(e.score,v.score);assert.deepEqual(json(e.metrics),json(v.metrics));reevaluations++;}
 }
 const req=snapshot.candidates.find(c=>c.catalogId==='right-requirement'),e=C.evaluate(context,[req],snapshot.sources);
 assert.equal(e.metrics.skillModInfo.mod,0);assert.equal(e.metrics.flatStatRaw.magic,27);
 assert.equal(base.composite[0].enabled,true);assert.equal(base.composite[1].enabled,false);
 const secondary=C.create({objective:'magic',secondary:'ac',slots,baseState:base});
 assert.equal(B.inspectMagic(p.MOEOptimizerV2FacetSearch.prepare(items,secondary,{project}).reduction),null);
}
// Independent K boundary: old keys/aliases remain unchanged; 20 retained,
// distinct strictly better builds, not 20 aliases and not equal-score removal.
for(const count of [19,20,21]){
 const slot='防具: 頭',base=vm.runInContext('DEFAULT_STATE()',p),items=Array.from({length:count},(_,i)=>item('winner'+i,slot,{magic:10+i}));
 items.push(buff('irrelevant',slot,{equipBuffFlatAttack:5}));
 const ctx=S.toContext(S.create([{key:'stat:magic'}],{slots:[slot],topK:20}),{baseState:base});
 const old=p.MOEOptimizerV2FacetSearch.prepare(items,ctx,{project,magicReduction:false}),next=p.MOEOptimizerV2FacetSearch.prepare(items,ctx,{project});
 assert.equal(next.reduction.magicReduction.removed.some(x=>next.snapshot.candidates.find(c=>c.candidateId===x.id).catalogId==='irrelevant'),count>=20);
 const a=B.run(old.reduction,{boundMode:'none'}),b=B.run(next.reduction);assert.deepEqual(json(a.results.map(identity)),json(b.results.map(identity)));
 for(const proof of next.reduction.magicReduction.removed){assert.equal(new Set(proof.witnesses).size,20);
  const victim=p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(old.reduction,proof.id),score=C.evaluate(ctx,[victim],old.snapshot.sources).score;
  for(const id of proof.witnesses){const e=C.evaluate(ctx,[p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(next.reduction,id)],next.snapshot.sources);assert.equal(e.feasible,true);assert.ok(e.score>score);}}
}
assert.ok(states>=200);console.log(JSON.stringify({states,reevaluations}));

// Disconnected Buff removal must never erase a bridge which suppresses a
// negative fixed source, including when there are 20 direct flat witnesses.
{
 const slot='防具: 頭',base=vm.runInContext('DEFAULT_STATE()',p);
 base.composite=[{enabled:true,name:'negative fixed',flatMagic:-100,tags:'bridge'}];
 const items=Array.from({length:20},(_,i)=>item('positive'+i,slot,{magic:10+i}));
 items.push(buff('bridge-zero',slot,{equipBuffFlatAttack:10000,equipBuffConflictGroups:'bridge'}));
 const ctx=S.toContext(S.create([{key:'stat:magic'}],{slots:[slot],topK:20}),{baseState:base});
 const prep=p.MOEOptimizerV2FacetSearch.prepare(items,ctx,{project});
 const bridge=prep.snapshot.candidates.find(c=>c.catalogId==='bridge-zero');
 assert.ok(prep.reduction.candidates.some(c=>c.candidateId===bridge.candidateId));
 assert.equal(C.evaluate(ctx,[bridge],prep.snapshot.sources).score,0);
 assert.equal(B.run(prep.reduction).results[0].score,0);
 const constrained=C.create({objective:'magic',constraints:[{metric:'magic',op:'gte',value:0}],baseState:base,slots:[slot]});
 const q=p.MOEOptimizerV2FacetSearch.prepare(items,constrained,{project});assert.equal(q.reduction.magicReduction,undefined);assert.equal(B.inspectMagic(q.reduction),null);
}

{
 const base=vm.runInContext('DEFAULT_STATE()',p),ss=['防具: 頭','装飾: 胸'];
 const items=Array.from({length:21},(_,i)=>item('replace'+i,ss[0],{magic:10+i}));
 items.push(buff('inert victim',ss[0],{equipBuffFlatAttack:5}));
 items.push(buff('pct',ss[1],{equipBuffMagicPct:20}),buff('negative-pct',ss[1],{equipBuffMagicPct:-30}),buff('flat',ss[1],{equipBuffFlatMagic:7}));
 const ctx=S.toContext(S.create([{key:'stat:magic'}],{slots:ss,topK:20}),{baseState:base});
 const old=p.MOEOptimizerV2FacetSearch.prepare(items,ctx,{project,magicReduction:false}),next=p.MOEOptimizerV2FacetSearch.prepare(items,ctx,{project});
 const enumerate=prep=>{const map=new Map();for(const a of [null,...prep.reduction.candidates.filter(c=>c.slot===ss[0])])for(const b of [null,...prep.reduction.candidates.filter(c=>c.slot===ss[1])]){
  const chosen=[a,b].filter(Boolean),e=C.evaluate(ctx,chosen,prep.snapshot.sources);if(!e.feasible)continue;
  const d=E.describeConfiguration(prep.reduction,chosen.map(c=>c.candidateId));map.set(d.performanceKey,{score:e.score,key:d.performanceKey});}
  return [...map.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:1)).slice(0,20);};
 assert.deepEqual(enumerate(old),enumerate(next));assert.deepEqual(json(B.run(next.reduction).results.map(v=>({score:v.score,key:v.performanceKey}))),enumerate(old));
 for(const proof of next.reduction.magicReduction.removed){const victim=p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(old.reduction,proof.id);
  for(const completion of [null,...old.reduction.candidates.filter(c=>c.slot===ss[1])]){
   const tail=completion?[completion]:[],score=C.evaluate(ctx,[victim,...tail],old.snapshot.sources).score;
   for(const id of proof.witnesses){const candidate=p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(next.reduction,id),e=C.evaluate(ctx,[candidate,...tail],next.snapshot.sources);
    assert.equal(e.feasible,true);assert.ok(e.score>score);}}
 }
}

{
 const base=vm.runInContext('DEFAULT_STATE()',p),slot='防具: 頭',items=[item('snapshot magic',slot,{magic:20})];
 const signatures=[];
 for(const spirit of [0,40,100]){base.skillSim.skills['精神力']=spirit;
  base.composite=[{enabled:true,name:'fixed changing input',flatMagic:spirit/10}];
  const ctx=S.toContext(S.create([{key:'stat:magic'}],{slots:[slot],topK:20}),{baseState:base});
  const prep=p.MOEOptimizerV2FacetSearch.prepare(items,ctx,{project});
  const session=p.MOEOptimizerV2EvaluationSession.create(ctx,prep.snapshot.sources,{candidates:prep.snapshot.candidates});
  signatures.push(session.evaluationContextSignature);const prior=session.evaluate(prep.reduction.candidates).score;
  base.skillSim.skills['精神力']=150;base.composite[0].flatMagic=999;
  assert.equal(session.evaluate(prep.reduction.candidates).score,prior);
  const u=B.inspectMagic(prep.reduction,prep.reduction.candidates.map(c=>c.candidateId),[]);
  assert.ok(u.upper>=prior);session.dispose();
 }
 assert.equal(new Set(signatures).size,3);
}
{
 const slot='防具: 頭',base=vm.runInContext('DEFAULT_STATE()',p),ctx=S.toContext(S.create([{key:'stat:magic'}],{slots:[slot]}),{baseState:base});
 const prep=p.MOEOptimizerV2FacetSearch.prepare([item('finite prototype',slot,{magic:10})],ctx,{project}),old=prep.reduction.contextEquivalentClasses[0];
 const candidate={...old.representativeCandidate,evaluationFields:{...old.representativeCandidate.evaluationFields,magic:Infinity}},cls={...old,representativeCandidate:candidate};
 const malformed={...prep.reduction,candidates:[candidate],contextEquivalentClasses:[cls]};
 assert.equal(B.inspectMagic(malformed,[],[slot]).upper,null,'remaining malformed choice blocks only its unresolved branch');
 assert.equal(B.inspectMagic(malformed,[candidate.candidateId],[]).upper,null);
 assert.ok(Number.isFinite(B.inspectMagic(malformed,[],[]).upper),'null completion recovers a finite bound');
}
