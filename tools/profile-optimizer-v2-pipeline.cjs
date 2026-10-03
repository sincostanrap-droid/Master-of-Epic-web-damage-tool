/* Development-only source instrumentation. No calculator/runtime file is rewritten. */
const vm=require('node:vm');
function install(p,{enabled}){
  const stages={},cloneSamples={},stack=[];
  function record(key,ms){
    if(!enabled())return;
    const entry=stages[key]||(stages[key]={calls:0,ms:0});entry.calls++;entry.ms+=ms;
  }
  p.__moePipelineRecord=record;
  function segments(name,markers){
    let source=p[name].toString().replace(/\r\n/g,'\n');
    const body=source.indexOf('{\n');
    if(body<0)throw new Error('Cannot instrument '+name);
    source=source.slice(0,body+2)+
      'let __phase314Start=performance.now(); const __phase314Mark=key=>{const now=performance.now();globalThis.__moePipelineRecord(key,now-__phase314Start);__phase314Start=now;};\n'+source.slice(body+2);
    for(const [text,label] of markers){
      if(!source.includes(text))throw new Error('Missing profiling boundary '+name+': '+text);
      source=source.replace(text,`__phase314Mark(${JSON.stringify(name+'.'+label)});\n  ${text}`);
    }
    vm.runInContext(source,p);
    const original=p[name];
    p[name]=function(...args){stack.push(name);try{return original(...args);}finally{stack.pop();}};
  }
  segments('computeMetrics',[
    ['const normalizedEquipment =','standardInputs'],
    ['st = expandEquipmentBuffState','equipmentNormalization'],
    ['st = applyBuffGroupRules','equipmentBuffExpansion'],
    ['const skillPlusTotals =','buffConflictAndCapture'],
    ['const attackDelayBSources =','skillPlusTotals'],
    ['st = expandCompositeState','attackDelayBSources'],
    ['const raceCoeff =','compositeExpansion'],
    ['const extraStats =','equipmentRawAndBaseInputs'],
    ['const flatRows =','extraStats'],
    ['const pctStats =','flatRowsAndBaseStats'],
    ['const effectiveWeapon =','percentStats'],
    ['const skillModInfo =','effectiveWeaponAndInputs'],
    ['const skillMod =','weaponSkillMod'],
    ['const conv =','targetInputsAndBaseAttack'],
    ['const baseNaturalAtk =','conversions'],
    ['const attackMultiplier =','attackPctAndCap'],
    ['const slots =','damageAndHit'],
    ['return {\n    skillPlusTotals','buffSlots']
  ]);
  segments('expandEquipmentBuffState',[
    ['out.composite =','stateCopy'],['return out;','sameTechnicAndPrototypeCopy']
  ]);
  segments('resolveAllBuffRowsForGroups',[
    ['out.other =','stateClone'],['const groupKeys =','collectCandidates'],
    ['candidates.forEach(candidate => {','sortAndAcceptedSuppressed'],
    ['out.composite = normalizeCompositeRows','groupsReconstruction'],
    ['out.post =','compositeNormalizationAndSuppression'],
    ['return {\n    state: out','postOtherReconstruction']
  ]);
  segments('expandCompositeState',[
    ['out.pct =','stateClone'],['normalizeCompositeRows((st || {}).composite)','baseArraysAndFlatNormalization'],
    ['return out;','normalizeCompositeAndDerivedRows']
  ]);
  const originalClone=p.clone;
  p.clone=function(value){
    const owner=stack.at(-1)||'outsideCompute',start=performance.now();
    const result=originalClone(value);record('clone.'+owner,performance.now()-start);
    // Sample only once per stage, outside clone timing. Byte/object counts are
    // structural estimates, not V8 heap allocation measurements.
    const sample=cloneSamples[owner];
    if(enabled() && (!sample || sample.sampleCount<8)){
      const seen=new Set();let objects=0;
      const visit=v=>{if(!v || typeof v!=='object' || seen.has(v))return;seen.add(v);objects++;Object.values(v).forEach(visit);};
      visit(value);
      const bytes=Buffer.byteLength(JSON.stringify(value),'utf8');
      cloneSamples[owner]={sampleCount:(sample?.sampleCount||0)+1,
        minJsonBytes:Math.min(sample?.minJsonBytes??Infinity,bytes),maxJsonBytes:Math.max(sample?.maxJsonBytes||0,bytes),
        minObjects:Math.min(sample?.minObjects??Infinity,objects),maxObjects:Math.max(sample?.maxObjects||0,objects),
        topLevelFields:Object.keys(value||{})};
    }
    return result;
  };
  const expand=p.expandEquipmentBuffState;
  p.expandEquipmentBuffState=function(st,rows,preparedRow,...rest){
    const callback=preparedRow?row=>{
      const data=preparedRow(row);
      return {...data,copyComposite:()=>{
        const start=performance.now();try{return data.copyComposite();}
        finally{record('copyCompositePrototype',performance.now()-start);}
      }};
    }:null;
    return expand(st,rows,callback,...rest);
  };
  return {stages,cloneSamples};
}
module.exports={install};
