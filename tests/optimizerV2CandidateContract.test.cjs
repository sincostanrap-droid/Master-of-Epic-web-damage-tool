const assert = require('node:assert/strict');
const vm = require('node:vm');
const {candidateContext} = require('../tools/inspect-optimizer-v2-candidates.cjs');
const {json} = require('../tools/benchmark-optimizer.cjs');
const p = candidateContext(), api = p.MOEOptimizerV2Candidates;
const fixture = {catalogId:'stable:雪/1', name:'低性能・未知効果', category:'weapon', slot:'武器: 右手',
  weaponType:'刀剣', weaponDamage:1, weaponHand:'2HAND', weaponReq:[{name:'刀剣',required:100}],
  conditions:{unrecognized:'keep verbatim'}, extraStats:{attack:-10},
  info:'未解明の条件付き効果', verified:false};
const other = {...fixture, catalogId:'second', weaponDamage:100};
const before = JSON.stringify(fixture);
const first = api.generate({items:[fixture,other], qualities:['raw','HG_MG']});
assert.equal(first.candidates.length,4,'no dominance, skill or unknown-effect pruning');
assert.equal(JSON.stringify(fixture),before,'source not mutated');
const idFor = output => Object.fromEntries(output.candidates.map(c => [`${c.catalogId}/${c.quality}`,c.candidateId]));
const reordered = api.generate({items:[other,{...fixture,name:'renamed',weaponDamage:2}], qualities:['HG_MG','raw']});
assert.deepEqual(idFor(first),idFor(reordered),'IDs ignore order, names, stats and requested grade order');
assert.equal(new Set(first.candidates.map(c=>c.candidateId)).size,4);
const c = first.candidates[0];
assert.ok(Object.isFrozen(c) && Object.isFrozen(c.evaluationFields));
assert.deepEqual(json(first.sources[c.sourceRef].conditions),fixture.conditions);
assert.equal(c.modifiers.base.attack,-10);
assert.equal(c.twoHanded,true);
assert.equal(c.requirements[0].required,100);
const row = api.toEquipmentRow(c);
row.weaponReq[0].required = 1;
assert.equal(api.toEquipmentRow(c).weaponReq[0].required,100,'rows do not alias snapshot');
fixture.conditions.unrecognized = 'changed after run';
assert.equal(first.sources[c.sourceRef].conditions.unrecognized,'keep verbatim');
const base = json(vm.runInContext('DEFAULT_STATE()',p));
const baseBefore = JSON.stringify(base);
const evaluation = api.toEvaluationState(base,[c]);
evaluation.skillSim.skills['刀剣']=100;
assert.equal(JSON.stringify(base),baseBefore,'evaluation state does not mutate caller');
assert.equal(evaluation.equipment.length,1);
assert.equal(evaluation.equipment[0].enabled,true);
assert.equal(api.toEquipmentRow(c,{enabled:false}).enabled,false);

const invalid = api.generate({items:[null,{}, {...other,catalogId:'dup'}, {...other,catalogId:'dup'},
  {...other,catalogId:'unknown-slot',slot:'未分類',category:'future'},
  {...other,catalogId:'missing-slot',slot:''}], qualities:['raw']});
assert.equal(invalid.diagnostics.excludedCount,4);
assert.deepEqual(json(invalid.diagnostics.exclusionReasons),{
  'invalid-catalog-item':1,'missing-stable-id':1,'duplicate-stable-id':2});
assert.equal(invalid.candidates.length,2,'unknown categories/slots retained, not assigned guessed identity');
assert.equal(invalid.diagnostics.warnings.length,1);
assert.equal(invalid.candidates[1].slot,null);
const converter=p.catalogEquipmentToRow;
p.catalogEquipmentToRow=()=>{throw new Error('fixture conversion error');};
const failed=api.generate({items:[other]});
assert.equal(failed.diagnostics.conversionFailedCount,1);
assert.equal(failed.diagnostics.excludedCount,0);
assert.equal(failed.diagnostics.conversionFailures[0].catalogId,'second');
p.catalogEquipmentToRow=converter;
assert.throws(()=>api.generate({qualities:['guessed']}));
assert.throws(()=>api.generate({qualities:[]}));
assert.throws(()=>api.toEquipmentRow({schemaVersion:999}));
const fallback=api.generate({items:[{id:'only-id',name:'id'},
  {officialId:12,category:'weapon',name:'official'}]});
assert.equal(fallback.candidates.length,2);
console.log('v2 contract: stable identity, grade distinction, no pruning, isolation, diagnostics and unknown data preservation OK');
