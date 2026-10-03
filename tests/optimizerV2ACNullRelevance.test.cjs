const assert=require('node:assert/strict'),vm=require('node:vm');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
const V=p.MOEOptimizerV2Candidates,C=p.MOEOptimizerV2SearchContext,R=p.MOEOptimizerV2MetricCandidateReducer,B=p.MOEOptimizerV2BranchAndBound;
const json=x=>JSON.parse(JSON.stringify(x)),freeze=x=>{if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const h='防具: 頭',b='防具: 胴';
const item=(id,raw=0,req=0,slot=h)=>({catalogId:id,name:id,category:'defense',slot,armorClass:raw,
 requiredSkill:'着こなし',needLevel:req,requirements:req?[{name:'着こなし',required:req}]:[]});
function setup(items,edits={},options={}){const s=json(V.generate({items}));for(const c of s.candidates)Object.assign(c.evaluationFields,edits[c.catalogId]||{});freeze(s);
 const {wear=0,...rest}=options;
 const ctx=C.create({objective:'ac',race:'newtar',gender:'male',skillSim:{skills:{'着こなし':wear}},topK:20,
  slots:[...new Set(items.map(x=>x.slot))],...rest});return {s,ctx,r:R.reduce(s,ctx)};}
const score=(f,ids)=>C.evaluate(f.ctx,ids.map(id=>f.s.candidates.find(c=>c.catalogId===id)),f.s.sources);
const key=(f,id)=>R.describeConfiguration(f.r,[f.s.candidates.find(c=>c.catalogId===id).candidateId]).performanceKey;
let directChecks=0;
for(const defs of [[item('zeroA'),item('zeroB')],[item('unmet',100,100),item('no-requirement')]]){
 const f=setup(defs);for(const x of defs){assert.equal(score(f,[x.catalogId]).score,score(f,[]).score);assert.equal(key(f,x.catalogId),'[]');directChecks++;}
}
for(const [field,value] of [['extraAC',5],['equipBuffExtraAC',5],['equipBuffExtraACPct',5]]){
 const edits={extraAC:field==='extraAC'?100+value:100,...(field==='extraAC'?{}:{equipBuffEnabled:true,equipBuffName:field,[field]:value})};
 const f=setup([item('bonus',100,100)],{bonus:edits},{wear:40});
 assert.equal(p.equipmentArmorAC(V.toEquipmentRow(f.s.candidates[0]),f.ctx.skillSim).effective,0);
 assert.ok(score(f,['bonus']).score>score(f,[]).score);assert.notEqual(key(f,'bonus'),'[]');
}
const fixed=vm.runInContext('DEFAULT_STATE()',p);fixed.composite=[{enabled:true,name:'negative external',tags:'null-conflict',extraAC:-20}];
const suppress=setup([item('suppressor')],{suppressor:{equipBuffEnabled:true,equipBuffName:'zero suppressor',equipBuffFlatAttack:100,equipBuffConflictGroups:'null-conflict'}},{baseState:fixed,wear:100});
assert.ok(score(suppress,['suppressor']).score>score(suppress,[]).score,'zero AC Buff can suppress a negative external Buff');
assert.notEqual(key(suppress,'suppressor'),'[]');
const latest=setup([item('negative',0,0,h),item('latest',0,0,b)],{
 negative:{equipBuffEnabled:true,equipBuffName:'earlier',equipBuffTechnicId:'same',equipBuffExtraAC:-10},
 latest:{equipBuffEnabled:true,equipBuffName:'later',equipBuffTechnicId:'same',equipBuffFlatAttack:1}});
assert.ok(score(latest,['negative','latest']).score>score(latest,['negative']).score,'later same-technic winner is relevant');
assert.notEqual(key(latest,'latest'),'[]');
const hard=setup([item('hard')],{hard:{tags:'hard-only'}});
assert.equal(score(hard,['hard']).score,score(hard,[]).score);
assert.notEqual(key(hard,'hard'),'[]');
const hardTop=B.run(hard.r);assert.equal(hardTop.results.length,2);assert.equal(hardTop.results[0].candidateIds.length,1,'distinct equal-score hard key can outrank null');
const negative=setup([item('negative-only')],{'negative-only':{extraAC:-1}});
assert.ok(score(negative,[]).score>score(negative,['negative-only']).score);
assert.equal(B.run(negative.r).results.length,2,'one better null build is insufficient to remove a Top20 performance entry');
const restricted=setup([{...item('restricted'),equipGender:'MALE'}]);assert.equal(key(restricted,'restricted'),'[]');
const hand=setup([{...item('two-hand'),slot:'武器: 右手'},item('left',0,0,'武器: 左手')],{
 'two-hand':{weaponDamage:10,weaponAttackInterval:100,weaponTwoHanded:true},left:{extraAC:3}});
assert.equal(score(hand,['two-hand','left']).feasible,false);assert.equal(score(hand,['left']).feasible,true);
assert.equal(key(hand,'two-hand'),'[]','existing inert-hand/null proof only relaxes occupancy');
const constrained=setup([item('constrained')],{}, {constraints:[{metric:'ac',op:'gte',value:0}]});
assert.equal(constrained.r.metricReducer.applied,false,'unsupported constraints conservatively bypass the metric reducer');
const fixedCandidate=setup([item('fixed')]);
const fc=C.create({objective:'ac',slots:[h],topK:20,fixedCandidateIds:[fixedCandidate.s.candidates[0].candidateId]});
assert.equal(C.evaluate(fc,[],fixedCandidate.s.sources).feasible,false);
assert.notEqual(R.describeConfiguration(R.reduce(fixedCandidate.s,fc),[fixedCandidate.s.candidates[0].candidateId]).performanceKey,'[]');
const reprojection=setup([item('armor',10,50)]);
const recovered=[];for(const wear of [0,40,100,150]){const cx=C.create({objective:'ac',race:'newtar',slots:[h],topK:20,skillSim:{skills:{'着こなし':wear}}});
 const rr=R.reduce(reprojection.s,cx);recovered.push({requested:wear,wear:cx.skillSim.skills['着こなし'],classes:rr.contextEquivalentClasses.length});}
assert.equal(recovered[0].classes,0);assert.equal(recovered[1].classes,1);assert.equal(recovered[2].classes,1);assert.equal(recovered[3].wear,100);
const boundary=setup([item('edge',10,100)],{}, {wear:80});assert.ok(score(boundary,['edge']).score>score(boundary,[]).score);
const near=setup([item('below',10,100)],{}, {wear:79.999999});assert.equal(key(near,'below'),'[]');
console.log(JSON.stringify({directChecks,recovered,negativeExternalProtected:true,sameTechnicProtected:true,distinctKeyCounterexamples:true}));
