const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const p=require('../tools/inspect-optimizer-v2-context.cjs').contextRuntime();
for(const file of ['equipmentCandidatePolicy','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync('src/domain/'+file+'.js','utf8'),p);
const P=p.MOEEquipmentCandidatePolicy,policy=P.create();const a={catalogId:'a',name:'same'},b={catalogId:'b',name:'same'};
policy.set(a,'excluded');assert.equal(policy.get(b),'normal');policy.set(a,'fixed');assert.equal(policy.get(a),'fixed');const snapshot=policy.snapshot();policy.clear();assert.equal(snapshot.a,'fixed');assert.equal(policy.get(a),'normal');
const candidates=[{catalogId:'a',candidateId:'A'},{catalogId:'b',candidateId:'B'}];assert.deepEqual(JSON.parse(JSON.stringify(P.compile({a:'fixed',b:'excluded'},{candidates}))),{fixedCandidateIds:['A'],excludedCandidateIds:['B']});
assert.throws(()=>P.validateFixed([{slot:'防具: 頭'},{slot:'防具: 頭'}],x=>x),/同じ部位/);
const diff=P.difference({score:10,equipment:[{slot:'head',equivalenceKey:'x'}]},{score:9,equipment:[{slot:'head',equivalenceKey:'x',equivalentCandidateIds:['different']}]});assert.equal(diff.primary,-1);assert.equal(diff.slots.length,0);
const base=vm.runInContext('DEFAULT_STATE()',p),S=p.MOEEquipmentSearchSpecification;
const spec=S.create([{key:'stat:magic'}],{slots:['防具: 頭']});const context=S.toContext(spec,{baseState:base,inputs:{},fixedCandidateIds:['A'],excludedCandidateIds:['B']});assert.equal(context.fixedCandidateIds[0],'A');assert.equal(context.excludedCandidateIds[0],'B');
console.log('candidate policy identity, snapshot, exclusivity, fixed validation, equivalence comparison and context forwarding passed');

assert.throws(()=>P.validateFixed([{slot:'武器: 右手',weaponDamage:1,weaponSkill:'刀剣',weaponTwoHanded:true},{slot:'武器: 左手',weaponDamage:1,weaponSkill:'刀剣'}],x=>x),/両手/);
assert.throws(()=>P.validateFixed([{slot:'防具: 頭',tags:'exclusive-body'},{slot:'防具: 胴',tags:'exclusive-body'}],x=>x),/占有/);
