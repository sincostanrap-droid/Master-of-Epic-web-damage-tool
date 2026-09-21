/* Actual catalog equipment plus an explicit test-only -59 Buff for the boundary.
 * node tools/verify-optimizer-target.cjs [--baseline /path/to/main] [--repeats 3]
 */
const vm=require('node:vm');
const {performance}=require('node:perf_hooks');
const {context,json}=require('./benchmark-optimizer.cjs');
const names=['アームガード オブ フィヨルヴァル','南雲ハジメ なりきりコート','隠密の肩当て +9'];
function payload(p,scenario='delay') {
  const items=p.equipmentCatalogItems();
  const equipment=names.map(name=>{const item=items.find(i=>i.name===name);if(!item)throw Error(name);return {...json(p.catalogEquipmentToRow(item)),enabled:false};});
  if(scenario==='fixed'){equipment[0].optimizerFixed=true;equipment[1].enabled=true;}
  p.__equipment=equipment;
  const st=vm.runInContext('state=DEFAULT_STATE();state.equipment=normalizeEquipmentRows(__equipment);state.composite=normalizeCompositeRows([{name:"境界検証用固定値（実在Buffではない）",enabled:true,fixed:true,extraAttackDelay:-59}]);state',p);
  return {state:json(st),inputs:{raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponWeight:5,weaponSkill:100,techMultiplier:1,atkCap:500,targetAC:0},settings:{objective:'damage',requireAttackDelay60:true,includeDisabledBuffs:true,maxSlots:24,topN:10,exactEquipmentLimit:3000,beamWidth:20,equipmentEvalLimit:20,buffMode:'fast',evaluateCurrentEquipment:scenario==='fixed'}};
}
function measure(p,data) {
  const start=performance.now();const out=p.runOptimizerCore(json(data));
  return {ms:performance.now()-start,mode:out.summary.settings.optimizerEquipmentSearchMode,estimatedCombinations:out.summary.settings.optimizerEquipmentExactTotal,evaluations:out.summary.settings.optimizerEvalCount,topDelay:out.results[0]?.metrics.extraStats.extraAttackDelay,topDamage:out.results[0]?.metrics.finalDamage,topEquipment:out.results[0]?.equipmentIdxs.filter(i=>i<3),results:out.results.length};
}
module.exports={payload,measure};
if(require.main===module){
  const args=process.argv.slice(2);const i=args.indexOf('--baseline');const baseline=i<0?null:args[i+1];const ri=args.indexOf('--repeats');const repeats=ri<0?3:Math.max(1,Number(args[ri+1]));
  const before=baseline?context(baseline,{catalog:true}):null;const after=context(undefined,{catalog:true});
  for(const scenario of ['delay','fixed'])for(let iteration=1;iteration<=repeats;iteration++){
    const data=payload(after,scenario);console.log(JSON.stringify({scenario,iteration,before:before?measure(before,data):null,after:measure(after,data)}));
  }
}
