const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const name of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${name}.js`,'utf8'),p);
vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);
const C=p.MOEOptimizerV2SearchContext,R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound,S=p.MOEEquipmentSearchSpecification;
const json=v=>JSON.parse(JSON.stringify(v)),original=p.catalogEquipmentToRow;
p.catalogEquipmentToRow=(i,...args)=>Object.assign(original(i,...args),i.fixtureFields||{});
const project=i=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(i,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const identity=r=>({score:r.score,key:r.performanceKey,ids:r.candidateIds,aliases:r.equipment.map(e=>[e.slot,e.equivalentCandidateIds])});
let states=0,formalChecks=0;const signatures=[];
for(const skill of ['回復魔法','破壊魔法','強化魔法','神秘魔法','キック','牙']){
 const base=vm.runInContext('DEFAULT_STATE()',p),slots=['武器: 右手','装飾: 胸','防具: 頭'];
 base.composite=[{enabled:true,name:'fixed target',tags:'target-exclusive',extraEffects:[{key:'skillPlus',name:skill,value:3}]},
  {enabled:false,name:'OFF target',extraEffects:[{key:'skillPlus',name:skill,value:999}]}];
 const item=(id,slot,value,fields={})=>({catalogId:id,name:id,category:'defense',slot,fixtureFields:{equipBuffEnabled:true,equipBuffName:id,equipBuffTechnicId:id,
  extraEffects:[{key:'skillPlus',name:skill,value}],...fields}});
 const items=[item('req','武器: 右手',10,{weaponDamage:60,weaponReq:[{name:'刀剣',required:100}],equipBuffConflictGroups:'target-exclusive'}),
  item('req-alias','武器: 右手',10,{weaponDamage:60,weaponReq:[{name:'刀剣',required:100}],equipBuffName:'req',equipBuffTechnicId:'req',equipBuffConflictGroups:'target-exclusive'}),
  item('two-hand','武器: 右手',8,{weaponDamage:30,weaponTwoHanded:'○',tags:'hard'}),
  item('chest','装飾: 胸',7,{equipBuffConflictGroups:'target-exclusive',equipBuffStackRule:'latest'}),
  item('stack','装飾: 胸',6,{equipBuffTechnicId:'req'}),
  item('zero-bridge','防具: 頭',0,{equipBuffConflictGroups:'target-exclusive,another',equipBuffFlatAttack:100}),
  item('head','防具: 頭',5,{equipBuffConflictGroups:'another',tags:'hard'})];
 const context=S.toContext(S.create([{key:'skillPlus:'+skill}],{topK:20,slots}),{baseState:base});
 assert.equal(context.objective.metric,'skillPlus');assert.equal(context.objective.skillName,skill);
 const prep=p.MOEOptimizerV2FacetSearch.prepare(items,context,{project}),r=prep.reduction;
 const snapshot=p.MOEOptimizerV2Candidates.generate({items}),all=new Map(),partial=[];
 const describe=chosen=>R.describeConfiguration(r,chosen.map(c=>c.candidateId));
 // Independent enumeration of original candidates, including equivalent aliases.
 function visit(depth,chosen){let maximum=-Infinity;const completions=[];
  if(depth===slots.length){const e=C.evaluate(context,chosen,snapshot.sources);if(e.feasible){const d=describe(chosen),v={score:e.score,key:d.performanceKey};all.set(v.key,v);maximum=e.score;completions.push(v);}}
  else for(const c of [null,...snapshot.candidates.filter(c=>c.slot===slots[depth])]){const x=visit(depth+1,c?[...chosen,c]:chosen);maximum=Math.max(maximum,x.maximum);completions.push(...x.completions);}
  partial.push({chosen,depth,maximum,completions});return {maximum,completions};
 }visit(0,[]);
 const expected=[...all.values()].sort((a,b)=>b.score-a.score||(a.key<b.key?-1:a.key>b.key?1:0)).slice(0,20);
 const member=new Map(r.contextEquivalentClasses.flatMap(c=>c.equivalentCandidateIds.map(id=>[id,c.representativeCandidateId])));
 for(const x of partial){const ids=x.chosen.map(c=>member.get(c.candidateId)).filter(Boolean),remaining=slots.slice(x.depth);
  const u=B.inspectSkillPlusPotential(r,ids,remaining),tie=B.inspectTieKey(r,ids,remaining);states++;
  assert.deepEqual(json(u.groupAware),json(u.preparedGroupAware));assert.ok(u.groupAware.upper>=x.maximum);
  for(const completion of x.completions)assert.ok(tie.key<=completion.key);
  for(const kth of expected)if(u.groupAware.upper===kth.score&&tie.key>=kth.key)
   assert.ok(x.completions.every(c=>c.score<kth.score||(c.score===kth.score&&c.key>=kth.key)));
 }
 let first;
 for(const options of [{},{skillPlusFastPath:false},
  {boundMode:'none'},{skillPlusPreparedGroupBound:false},{slotOrder:'descending'}]){
  const result=B.run(r,options);assert.equal(result.diagnostics.exact,true);
  assert.deepEqual(json(result.results.map(v=>({score:v.score,key:v.performanceKey}))),expected);
  if(!first)first=json(result.results.map(identity));else assert.deepEqual(json(result.results.map(identity)),first);
  if(!Object.keys(options).length){assert.equal(result.diagnostics.skillPlusFastPath.enabled,true);
   assert.equal(result.diagnostics.skillPlusFastPath.targetSkill,skill);assert.ok(result.diagnostics.skillPlusSuffixPreparation);}
  for(const v of result.results){const formal=C.evaluate(context,v.candidateIds.map(id=>R.resolveCandidate(r,id)),prep.snapshot.sources);
   assert.equal(formal.score,v.score);assert.deepEqual(json(formal.metrics),json(v.metrics));formalChecks++;}
 }
 const req=snapshot.candidates.find(c=>c.catalogId==='req'),evaluation=C.evaluate(context,[req],snapshot.sources);
 assert.equal(evaluation.metrics.skillModInfo.mod,0);assert.equal(evaluation.metrics.skillPlusTotals[skill],10);
 const session=p.MOEOptimizerV2EvaluationSession.create(context,prep.snapshot.sources,{candidates:prep.snapshot.candidates});
 const sessionReq=prep.snapshot.candidates.find(c=>c.candidateId===req.candidateId);
 signatures.push(session.evaluationContextSignature);const score=session.evaluate([sessionReq]).score;
 base.composite[0].enabled=false;base.skillSim.skills['刀剣']=100;assert.equal(session.evaluate([sessionReq]).score,score);session.dispose();
 const otherSkill=skill==='回復魔法'?'破壊魔法':'回復魔法';
 const otherContext=S.toContext(S.create([{key:'skillPlus:'+otherSkill}],{slots}),{baseState:base});
 const otherPrep=p.MOEOptimizerV2FacetSearch.prepare(items,otherContext,{project});
 assert.ok(B.run(otherPrep.reduction).results.every(v=>v.score===0),'new target must not reuse prior projection/potential');
 const secondary=S.toContext(S.create([{key:'skillPlus:'+skill},{key:'stat:magic'}],{secondary:true,slots}),{baseState:base});
 const secondaryPrep=p.MOEOptimizerV2FacetSearch.prepare(items,secondary,{project});
 assert.equal(B.run(secondaryPrep.reduction).diagnostics.lexicographic.enabled,true);
 const constrained=C.create({objective:{metric:'skillPlus',skillName:skill},constraints:[{metric:{metric:'magic'},op:'gte',value:0}],slots,baseState:base});
 assert.equal(B.run(p.MOEOptimizerV2FacetSearch.prepare(items,constrained,{project}).reduction).diagnostics.skillPlusFastPath.enabled,false);
 console.log(skill+' generic facet fast-path, exhaustive safety, Top20, OFF/ON, requirements and snapshot OK');
}
assert.equal(new Set(signatures).size,signatures.length,'target semantic is part of session signature');
assert.equal(S.metricFor('skillPower:破壊魔法'),null,'performance enhancement is not skillPlus');
const fractional=C.create({objective:{metric:'skillPlus',skillName:'破壊魔法'},slots:['防具: 頭']});
const fractionalItem={catalogId:'fractional',name:'fractional',category:'defense',slot:'防具: 頭',fixtureFields:{equipBuffEnabled:true,equipBuffName:'fractional',extraEffects:[{key:'skillPlus',name:'破壊魔法',value:0.5}]}};
const fractionalPrepared=p.MOEOptimizerV2FacetSearch.prepare([fractionalItem],fractional,{project});
const fallback=B.run(fractionalPrepared.reduction);
assert.equal(fallback.diagnostics.skillPlusFastPath.enabled,false);assert.equal(fallback.diagnostics.skillPlusFastPath.reason,'optimistic-proof-unavailable');
assert.equal(fallback.diagnostics.exact,true);assert.equal(fallback.results[0].score,0.5);
console.log(JSON.stringify({states,formalChecks}));
