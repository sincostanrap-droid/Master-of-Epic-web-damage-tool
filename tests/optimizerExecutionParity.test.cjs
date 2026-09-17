const assert=require('node:assert/strict');
const vm=require('node:vm');
const {context,fixture,compare,json}=require('../tools/benchmark-optimizer.cjs');
const page=context(undefined,{catalog:true});
const worker=context(undefined,{worker:true,data:false});
const payload=fixture(page,'catalog');
page.MOE_NPC_EFFECT_SLOTS={getAcDelta:()=>-12,getEvasionDelta:()=>5,getDamageTakenMultiplier:()=>1.15};
function workerRun(p) {
  let result;
  worker.postMessage=message=>{if(message.type==='error') throw new Error(message.message); if(message.type==='result') result=structuredClone(message);};
  worker.onmessage({data:structuredClone({type:'optimize',runId:1,payload:p})});
  assert.ok(result,'real Worker entry returns a result without document');
  assert.ok(!Object.keys(result.summary.settings).some(k=>k.startsWith('_')),'no private caches cross Worker boundary');
  return result;
}
for(const buffMode of ['fast','local','beam']) {
  for(const exact of [true,false]) {
    const p=json(payload);
    p.settings={...p.settings,buffMode,buffBeamWidth:8,exactEquipmentLimit:exact?3000:1,forceOtherBuffs:exact,requireAttackDelay60:!exact};
    p.state.other=[{name:'other conflict',enabled:true,tags:'test-conflict'}];
    p.runtime=json(page.optimizerRuntimeSnapshot());
    const before=JSON.stringify(p);
    const direct=page.runOptimizerCore(p);
    const viaWorker=workerRun(p);
    compare(direct,viaWorker,buffMode+(exact?' exact':' beam'));
    assert.equal(JSON.stringify(p),before,'caller payload is unchanged');
    assert.ok(direct.results.length>0);
    assert.equal(direct.results[0].metrics.npcAcDelta,-12);
  }
}
// Worker globals must refresh between jobs, including deleted sources.
const p=json(payload);
p.runtime=json(page.optimizerRuntimeSnapshot());
p.runtime.data.MOE_BUFF_RULES_MANUAL={'technic-999999':{name:'fixture-manual',stats:{flatAttack:123}}};
p.state.equipment.push({slot:'防具: 手',name:'manual fixture',enabled:true,optimizerFixed:true,equipBuffEnabled:true,equipBuffName:'fixture-manual',equipBuffTechnicId:999999});
page.MOE_BUFF_RULES_MANUAL=p.runtime.data.MOE_BUFF_RULES_MANUAL;
compare(page.runOptimizerCore(p),workerRun(p),'runtime replacement');
p.runtime.data.MOE_BUFF_RULES_MANUAL=null;page.MOE_BUFF_RULES_MANUAL=null;
compare(page.runOptimizerCore(p),workerRun(p),'runtime removal');
// Compact calculation must retain all numerical values and detail rows, and must
// leave input rows untouched. Compare with the full selection state.
page.__payload=payload;
vm.runInContext(`state=clone(__payload.state); globalThis.__settings={...__payload.settings}; optimizerPrepareRunCaches(__settings);`,page);
let checks=0;
for(let mask=0;mask<16;mask++) {
  const eq=[3,4,...[0,1,2].filter((_,i)=>mask&(1<<i))];
  const buffs=[0,...[1,2,3,4].filter((_,i)=>mask&(1<<i))];
  page.__eq=eq;page.__buffs=buffs;
  const st=vm.runInContext('optimizerStateForSelection(__eq,__buffs,__settings)',page);
  const before=JSON.stringify(st);
  assert.deepEqual(json(page.computeMetrics(st,json(payload.inputs))),json(page.optimizerComputeMetrics(st,json(payload.inputs))),`compact/full selection ${mask}`);
  assert.equal(JSON.stringify(st),before);
  checks++;
}
console.log(`optimizer execution parity: OK (6 search modes, runtime replacement/removal, ${checks} full/compact selections)`);
