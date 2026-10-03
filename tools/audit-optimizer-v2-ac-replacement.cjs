const fs=require('node:fs');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
const s=p.MOEOptimizerV2Candidates.generate();
const ctx=require('./inspect-optimizer-v2-objectives.cjs').objectiveContexts(p,20).ac;
const r=p.MOEOptimizerV2MetricCandidateReducer.reduce(s,ctx,{acReplacementDominance:false});
const groups=new Map(),rejected={};
for(const c of r.contextEquivalentClasses){
 const x=JSON.parse(c.equivalenceKey)[2];
 const reason=x.unknown?'unknown':x.fixed?'fixed':x.buffs.length?'buff-interaction':x.bodyPercentage?'percentage':!x.formalArmor?'no-formal-projection':null;
 if(reason){rejected[reason]=(rejected[reason]||0)+1;continue;}
 const sig=JSON.stringify(x.structural);
 if(!groups.has(sig))groups.set(sig,[]);
 groups.get(sig).push({c,body:x.formalArmor.effective,addition:x.formalArmor.addition,total:x.bodyFlat});
}
const removed=[],bySlot={},scalarOnly=[];let comparisons=0;
for(const list of groups.values()){
 for(const b of list)if(list.filter(a=>a.total-b.total>r.diagnostics.metricReduction.acReplacementDominance.roundingMargin).length>=20)scalarOnly.push(b.c.representativeCandidateId);
 list.sort((a,b)=>b.total-a.total||(a.c.equivalenceKey<b.c.equivalenceKey?-1:1));
 const retained=[];
 for(const b of list){const witnesses=retained.filter(a=>{comparisons++;return a.body>=b.body&&a.addition>=b.addition&&a.total-b.total>r.diagnostics.metricReduction.acReplacementDominance.roundingMargin;});
  if(witnesses.length>=20)removed.push({id:b.c.representativeCandidateId,name:b.c.representativeCandidate.name,slot:b.c.representativeCandidate.slot,witnesses:witnesses.slice(0,20).map(a=>a.c.representativeCandidateId)});
  else retained.push(b);
 }
}
for(const slot of ctx.slots){const before=r.contextEquivalentClasses.filter(c=>c.representativeCandidate.slot===slot).length,drop=removed.filter(c=>c.slot===slot).length;bySlot[slot]={before,removed:drop,after:before-drop};}
const out={dryRun:true,classes:r.contextEquivalentClasses.length,groups:groups.size,comparisons,removed:removed.length,after:r.contextEquivalentClasses.length-removed.length,proofAvailable:r.diagnostics.metricReduction.acReplacementDominance.proofAvailable,margin:r.diagnostics.metricReduction.acReplacementDominance.roundingMargin,rejected,bySlot,witnesses:removed,
 scalarOnlyHypotheticalAfter:r.contextEquivalentClasses.length-scalarOnly.length,
 notProvenBySeparateOperands:scalarOnly.filter(id=>!removed.some(x=>x.id===id)).length};
fs.writeFileSync('docs/optimizer-v2-ac-replacement-dry-run.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({...out,witnesses:undefined},null,2));
