const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const path of ['src/domain/equipmentEffectFacets.js','src/domain/equipmentEffectFacetCatalog.js','src/domain/equipmentSearchSpecification.js','src/optimizer-v2/facetSearch.js'])vm.runInContext(fs.readFileSync(path,'utf8'),p,{filename:path});
const S=p.MOEEquipmentSearchSpecification,C=p.MOEOptimizerV2SearchContext,B=p.MOEOptimizerV2BranchAndBound,F=p.MOEOptimizerV2FacetSearch;
const json=v=>JSON.parse(JSON.stringify(v));
// Catalog fixture injection uses the same official converter, adding explicit structured fields.
const original=p.catalogEquipmentToRow;
p.catalogEquipmentToRow=(item,...args)=>Object.assign(original(item,...args),item.fixtureFields||{});
const item=(id,slot,fields={})=>({catalogId:id,name:id,category:'defense',slot,fixtureFields:fields});
const base=vm.runInContext('DEFAULT_STATE()',p);base.skillSim.skills['精神力']=100;base.skillSim.skills['攻撃回避']=80;base.skillSim.skills['呪文抵抗力']=50;
const group={equipBuffEnabled:true,equipBuffConflictGroups:'fixture-exclusive',equipBuffStackRule:'score'};
const items=[item('irrelevant','装飾: 胸'),item('a','防具: 頭',{magic:20,extraAvoid:5,extraFireRes:8}),
 item('equivalent','防具: 頭',{magic:20,extraAvoid:5,extraFireRes:8}),
 item('b','防具: 頭',{magic:10,...group,equipBuffName:'buff-one',equipBuffFlatMagic:15,equipBuffExtraAvoid:12,equipBuffExtraFireRes:9}),
 item('c','装飾: 胸',{magic:3,...group,equipBuffName:'buff-two',equipBuffFlatMagic:8,equipBuffExtraAvoid:10,equipBuffExtraFireRes:20}),
 item('d','装飾: 胸',{magic:1,equipBuffEnabled:true,equipBuffName:'plus',extraEffects:[{key:'skillPlus',name:'破壊魔法',value:10,scope:'display'}]}),
 item('req','武器: 右手',{magic:20,weaponDamage:60,weaponReq:[{name:'刀剣',required:100}],equipBuffEnabled:true,equipBuffName:'req-plus',extraEffects:[{key:'skillPlus',name:'破壊魔法',value:10,scope:'display'}]})];
const projection=item=>p.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(item,{toRow:p.catalogEquipmentToRow,resolveBuff:p.resolveEquipmentBuffRow,toComposite:p.equipmentBuffToCompositeRow,definitions:vm.runInContext("extraFieldDefsFor('summary')",p),effects:p.normalizeAdditionalEffects,groups:r=>p.normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups)});
const identity=r=>({score:r.score,secondaryScore:r.secondaryScore??null,key:r.performanceKey,ids:r.equipment.map(e=>[e.slot,Array.from(e.equivalentCandidateIds)])});
const sort=(a,b)=>b.score-a.score||(b.secondaryScore??0)-(a.secondaryScore??0)||(a.key<b.key?-1:a.key>b.key?1:0);
function brute(prepared,context){const values=new Map(),snapshot=p.MOEOptimizerV2Candidates.generate({items});
 function walk(depth,chosen){if(depth===context.slots.length){const evaluation=C.evaluate(context,chosen,snapshot.sources);if(!evaluation.feasible)return;
 const described=(prepared.reduction.metricReducer?.applied?p.MOEOptimizerV2MetricCandidateReducer:p.MOEOptimizerV2EffectiveCandidates).describeConfiguration(prepared.reduction,chosen.filter(c=>prepared.snapshot.candidates.some(retained=>retained.candidateId===c.candidateId)).map(c=>c.candidateId));
 const r={score:evaluation.score,secondaryScore:evaluation.secondaryScore??null,key:described.performanceKey,ids:described.equipment.map(e=>[e.slot,Array.from(e.equivalentCandidateIds)])};if(values.has(r.key)){assert.equal(values.get(r.key).score,r.score);assert.equal(values.get(r.key).secondaryScore,r.secondaryScore);}values.set(r.key,r);return;}
 walk(depth+1,chosen);for(const c of snapshot.candidates.filter(c=>c.slot===context.slots[depth]))walk(depth+1,[...chosen,c]);}walk(0,[]);return [...values.values()].sort(sort).slice(0,context.topK);}
(async()=>{
 let checked=0;
 for(const axes of [[{key:'stat:magic'}],[{key:'stat:extraAvoid'}],[{key:'stat:extraFireRes'}],[{key:'skillPlus:破壊魔法'}],
 [{key:'stat:magic'},{key:'skillPlus:破壊魔法',minimum:'20'}],[{key:'skillPlus:破壊魔法'},{key:'stat:magic'}]]){
  for(const candidatePolicy of [{fixedCandidateIds:['ov2:catalogId:irrelevant:quality:raw']},{},{excludedCandidateIds:['ov2:catalogId:b:quality:raw']},{fixedCandidateIds:['ov2:catalogId:req:quality:raw']},{fixedCandidateIds:['ov2:catalogId:req:quality:raw'],excludedCandidateIds:['ov2:catalogId:b:quality:raw']}]){
  const spec=S.create(axes,{secondary:axes.length>1,topK:20,slots:['防具: 頭','装飾: 胸','武器: 右手']}),context=S.toContext(spec,{baseState:base,inputs:{spirit:0},...candidatePolicy});
  assert.equal(context.inputs.spirit,100,'Skill simulator is authoritative');
  const prepared=F.prepare(items,context,{project:projection});assert.ok(prepared.snapshot.candidates.some(c=>c.catalogId==='req'));
  const expected=brute(prepared,context);
  for(const id of context.fixedCandidateIds)assert.ok(prepared.snapshot.candidates.some(c=>c.candidateId===id),'Fixed ID exists');
  for(const id of context.excludedCandidateIds)assert.ok(prepared.snapshot.candidates.some(c=>c.candidateId===id),'Excluded ID exists');
  for(const enablePruning of [false,true])for(const slotOrder of ['catalog','descending']){
    const result=B.run(prepared.reduction,{enablePruning,slotOrder});assert.equal(result.diagnostics.exact,true);assert.deepEqual(json(result.results.map(identity)),json(expected));checked++;
  }
  const asyncResult=await F.run(prepared,{slotOrder:'catalog'});assert.deepEqual(json(asyncResult.results.map(identity)),json(expected));checked++;
  for(const r of asyncResult.results){for(const id of context.fixedCandidateIds)assert.ok(r.candidateIds.includes(id));for(const id of context.excludedCandidateIds)assert.ok(!r.candidateIds.includes(id));const selected=r.candidateIds.map(id=>prepared.snapshot.candidates.find(c=>c.candidateId===id));const formal=C.evaluate(context,selected,prepared.snapshot.sources);assert.equal(formal.score,r.score);assert.equal(formal.secondaryScore,r.secondaryScore);assert.deepEqual(json(formal.metrics),json(r.metrics));}
 }
 }
 // Cross-source negative external group and latest/same-technic/stack transitions.
 const savedBase=json(base);
 base.composite.push({enabled:true,name:'negative external',group:'fixture-exclusive',flatMagic:-25,extraAvoid:-9,extraFireRes:-8});
 items[3].fixtureFields.equipBuffStackRule='same-technic';items[3].fixtureFields.equipBuffTechnicId='shared-tech';
 items[4].fixtureFields.equipBuffStackRule='same-technic';items[4].fixtureFields.equipBuffTechnicId='shared-tech';
 for(const objective of ['stat:magic','stat:extraAvoid','stat:extraFireRes']){
  const c=S.toContext(S.create([{key:objective}],{slots:['防具: 頭','装飾: 胸','武器: 右手']}),{baseState:base});
  const prep=F.prepare(items,c,{project:projection}),expected=brute(prep,c);
  for(const enablePruning of [false,true])assert.deepEqual(json(B.run(prep.reduction,{enablePruning}).results.map(identity)),json(expected));
 }
 Object.assign(base,savedBase);
 const axes=[{key:'stat:magic'}],spec=S.create(axes,{slots:['武器: 右手']}),context=S.toContext(spec,{baseState:base});
 const prepared=F.prepare([items.at(-1)],context,{project:projection}),req=prepared.snapshot.candidates[0];
 const formal=C.evaluate(context,[req],prepared.snapshot.sources);assert.equal(formal.metrics.skillModInfo.mod,0);assert.equal(formal.metrics.equipmentRaw.magic,20);assert.equal(formal.metrics.skillPlusTotals['破壊魔法'],10);
 const session=p.MOEOptimizerV2EvaluationSession.create(context,prepared.snapshot.sources,{candidates:prepared.snapshot.candidates});const before=session.evaluate([req]).score;
 base.skillSim.skills['精神力']=0;base.composite.push({enabled:true,name:'external edit',flatMagic:99});assert.equal(session.evaluate([req]).score,before);
 const changed=S.toContext(spec,{baseState:base});assert.notEqual(C.evaluate(changed,[req],prepared.snapshot.sources).score,before);assert.notEqual(JSON.stringify(changed),JSON.stringify(context));session.dispose();
 const many=Array.from({length:25},(_,i)=>item('many-'+i,'防具: 頭',{magic:i+1})).concat([item('many-chest','装飾: 胸',{magic:1}),item('many-chest2','装飾: 胸',{magic:2})]);
 const manyContext=S.toContext(S.create([{key:'stat:magic'}],{slots:['防具: 頭','装飾: 胸']}),{baseState:base});
 const manyPrepared=F.prepare(many,manyContext,{project:projection}),midway={aborted:false};
 const mid=await F.run(manyPrepared,{enablePruning:false,signal:midway,onProgress:d=>{if(d.searchNodes>=64)midway.aborted=true;}});
 assert.equal(mid.diagnostics.exact,false);assert.equal(mid.diagnostics.searchNodes,64,'Every branch cooperatively yields and can cancel');
 const syncMany=B.run(manyPrepared.reduction,{enablePruning:false}),asyncMany=await F.run(manyPrepared,{enablePruning:false});
 assert.deepEqual(json(asyncMany.results.map(identity)),json(syncMany.results.map(identity)));assert.equal(asyncMany.diagnostics.searchNodes,syncMany.diagnostics.searchNodes);
 const abort={aborted:true};const cancelled=await F.run(prepared,{signal:abort});assert.equal(cancelled.diagnostics.exact,false);assert.equal(cancelled.diagnostics.searchNodes,0);
 assert.throws(()=>S.create([{key:'elementDamagePct:火属性'}]));assert.throws(()=>S.create([{key:'stat:magic'},{key:'stat:attack',minimum:'0'}]));
 const signature=S.toContext(spec,{baseState:json(context.baseState)});assert.equal(JSON.stringify(signature),JSON.stringify(context));
 console.log('facet optimizer: '+checked+' independent Top20 / bound / order / async comparisons, requirements, snapshot, cancellation and unsupported axes OK');
})().catch(error=>{console.error(error);process.exitCode=1;});
