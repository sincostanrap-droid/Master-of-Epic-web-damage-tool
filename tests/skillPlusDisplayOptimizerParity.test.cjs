const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const {context,json,root}=require('../tools/benchmark-optimizer.cjs');
const p=context(root,{catalog:true});
const inputs={raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponSkill:100,atkCap:500,techMultiplier:1};
const settings={maxSlots:24,topN:5,beamWidth:10,equipmentEvalLimit:5,exactEquipmentLimit:100,buffMode:'local',localPasses:2,objective:'skillPlus',skillPlusTargetSkill:'回復魔法',includeDisabledBuffs:true,forceOtherBuffs:false,includeCurrentConfig:false,evaluateCurrentEquipment:false,onlyBetterThanCurrent:false};
const panel={innerHTML:'',hidden:false}, copy={value:''};
const events=new Map(),tasks=[];
p.document={readyState:'complete',getElementById:id=>id==='showcaseSkillPlusTotals'?panel:id==='showcaseText'?copy:null,addEventListener:(key,fn)=>events.set(key,fn),removeEventListener:key=>events.delete(key)};
p.renderShowcaseTab=()=>{}; // Only the totals renderer needs DOM nodes in this test.
p.localStorage={getItem:()=>null};p.setTimeout=fn=>{tasks.push(fn);return 1;};
vm.runInContext(fs.readFileSync(path.join(root,'src/ui/showcaseSkillPlusTotals.js'),'utf8'),p);
events.get('moe:main-tab-activated')({detail:{id:'showcase'}});
const setState=st=>{p.__testState=json(st);vm.runInContext('state=clone(__testState)',p);};
function verify(st,label){
 setState(st);
 const metrics=p.computeMetrics(st,inputs);
 const totals=p.skillPlusTotalsFromResolvedState(p.showcaseResolvedBuffState());
 assert.deepEqual(json(totals),json(metrics.skillPlusTotals),label+' showcase/calculation');
 events.get('change')({});while(tasks.length)tasks.shift()();
 for(const [name,value] of Object.entries(totals))assert.ok(copy.value.includes(`${name}強化 +${value}`),label+' rendered '+name);
 if(!Object.keys(totals).length){assert.equal(panel.hidden,true);assert.ok(!copy.value.includes('スキル強化合計:'));}
 return metrics;
}
const empty=()=>{const st=vm.runInContext('DEFAULT_STATE()',p);st.equipment=[];st.composite=[];return st;};
const seen=new Set();const rows=[];
for(const item of p.equipmentCatalogItems()){
 const key=(item.buffRefs||[]).join(',');if(!key||seen.has(key))continue;seen.add(key);
 const row=p.catalogEquipmentToRow(item);
 if(!(row.extraEffects||[]).some(e=>e.key==='skillPlus'))continue;
 rows.push({...json(row),enabled:true});
}
assert.ok(rows.length>100,'real catalog coverage');
for(const row of rows){
 const st=empty();st.equipment=[row];verify(st,row.name);
 st.equipment=[row,json(row)];verify(st,row.name+' duplicate');
 st.equipment=[{...row,equipBuffEnabled:false}];verify(st,row.name+' Buff OFF');
}
const byId=id=>{const r=rows.find(r=>String(r.equipBuffTechnicId)===String(id));assert.ok(r,String(id));return r;};
const st=empty();st.equipment=[12763,13240,14633,14484].map(byId);
verify(st,'real conflicting recovery Buffs');
setState(st);const out=p.runOptimizerCore({state:st,inputs,settings});assert.ok(out.results.length);
for(const r of out.results){
 setState(st);const selected=p.optimizerStateForSelection(r.equipmentIdxs,r.compositeIdxs,settings);
 const metrics=verify(selected,'optimizer result');
 assert.deepEqual(json(metrics.skillPlusTotals),json(r.metrics.skillPlusTotals));
 assert.deepEqual(json(metrics.skillPlusTotals),json(r.skillPlusTotals));
}
console.log(`skillPlus display/optimizer parity: ${rows.length} distinct catalog Buff sets, single/duplicate/OFF, ${out.results.length} real search results OK`);
