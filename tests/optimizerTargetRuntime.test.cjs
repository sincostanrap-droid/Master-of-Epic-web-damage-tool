const assert=require('node:assert/strict');
const vm=require('node:vm');
const {context,json}=require('../tools/benchmark-optimizer.cjs');
const {payload}=require('../tools/verify-optimizer-target.cjs');
const p=context(undefined,{catalog:true});const worker=context(undefined,{worker:true,data:false});
function run(data){const before=JSON.stringify(data);const out=p.runOptimizerCore(data);assert.equal(JSON.stringify(data),before,'caller data immutable');return out;}
function workerRun(data){let out;worker.postMessage=m=>{if(m.type==='error')throw Error(m.message);if(m.type==='result')out=json(m);};worker.onmessage({data:json({type:'optimize',runId:1,payload:{...data,runtime:json(p.optimizerRuntimeSnapshot())}})});assert.ok(out);return out;}
// Independent oracle: enumerate the four choices and compare concrete computed
// totals by the user requirement, without calling optimizer scoring helpers.
const base=payload(p);
const oracle=[];
for(const selected of [-1,0,1,2]){
 const st=json(base.state);st.equipment.forEach((r,i)=>r.enabled=i===selected);
 const m=json(p.computeMetrics(st,base.inputs));if(m.extraStats.extraAttackDelay<=-60)oracle.push({index:selected,delay:m.extraStats.extraAttackDelay,damage:m.finalDamage});
}
oracle.sort((a,b)=>(-a.delay-60)-(-b.delay-60)||b.damage-a.damage);
assert.deepEqual(oracle.map(x=>x.delay),[-60,-61,-65]);
let searches=0;
for(const buffMode of ['fast','local','beam'])for(const exact of [true,false]) {
 const data=payload(p);Object.assign(data.settings,{buffMode,exactEquipmentLimit:exact?3000:1,buffBeamWidth:8,localPasses:2});
 const out=run(data);assert.deepEqual(json(out.results.map(r=>r.metrics.extraStats.extraAttackDelay)),oracle.map(r=>r.delay));
 assert.ok(out.results[0].equipmentIdxs.includes(oracle[0].index));
 assert.equal(out.summary.settings.optimizerEquipmentExactTotal,4,'blank slots have one choice each');
 assert.equal(out.summary.settings.optimizerEquipmentSearchMode,exact?'exact':'beam');
 assert.deepEqual(json(workerRun(data).results),json(out.results));
 // Fixed equipment must be honored even when disabled, while another row is ON.
 const fixed=payload(p,'fixed');Object.assign(fixed.settings,{buffMode,exactEquipmentLimit:exact?3000:1,buffBeamWidth:8,localPasses:2});
 const f=run(fixed);assert.ok(f.results.length);assert.ok(f.results.every(r=>r.equipmentIdxs.includes(0)&&!r.equipmentIdxs.includes(1)));
 assert.match(f.summary.settings.optimizerCurrentEquipmentSeedStatus,/固定・除外/);
 // Same seed bypass used to also allow excluded current equipment.
 const excluded=payload(p);excluded.state.equipment[1].enabled=true;excluded.state.equipment[1].optimizerExcluded=true;
 Object.assign(excluded.settings,{...fixed.settings,evaluateCurrentEquipment:true});
 assert.ok(run(excluded).results.every(r=>!r.equipmentIdxs.includes(1)));
 searches+=3;
}
// A narrow equipment-stage limit must still rank with required Buffs included.
for(const exactEquipmentLimit of [3000,1]){const data=payload(p);Object.assign(data.settings,{equipmentEvalLimit:1,beamWidth:1,exactEquipmentLimit});assert.equal(run(data).results[0].metrics.extraStats.extraAttackDelay,-60);}
// No exact target available: smallest excess wins. Unreachable target: no result.
const near=payload(p);near.state.equipment[0].optimizerExcluded=true;assert.equal(run(near).results[0].metrics.extraStats.extraAttackDelay,-61);
const unreachable=payload(p);unreachable.state.composite[0].extraAttackDelay=-50;assert.equal(run(unreachable).results.length,0);
const off=payload(p);off.settings.requireAttackDelay60=false;assert.ok(run(off).results[0].equipmentIdxs.includes(1),'without constraint damage wins');
// Fixed Buff ON/OFF and fixed empty slot are valid explicit constraints.
const buffs=payload(p);buffs.state.composite.push({name:'固定OFF',enabled:false,fixed:true,flatAttack:400});
assert.ok(run(buffs).results.every(r=>r.compositeIdxs.includes(0)&&!r.compositeIdxs.includes(1)));
const blank=payload(p);blank.state.equipment.push({slot:'防具: 肩',name:'',enabled:false,optimizerFixed:true});assert.equal(run(blank).results.length,0,'fixed empty shoulder cannot be replaced');
// The comparison-only current configuration can differ from fixed constraints,
// but every suggested alternative must satisfy them.
const current=payload(p,'fixed');current.settings.includeCurrentConfig=true;
assert.ok(run(current).results.filter(r=>!r.currentConfig).every(r=>r.equipmentIdxs.includes(0)));
console.log(`optimizer runtime regression: OK (${searches} searches, independent exhaustive oracle, 6 Worker comparisons, narrow beams, fixed/disabled/excluded/blank cases)`);
