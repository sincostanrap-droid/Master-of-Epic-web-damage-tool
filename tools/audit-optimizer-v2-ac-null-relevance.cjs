/* Read-only diagnostic: no reducer or search strategy replacement. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
const s=p.MOEOptimizerV2Candidates.generate(),base=require('./inspect-optimizer-v2-objectives.cjs').objectiveContexts(p,20).ac;
const C=p.MOEOptimizerV2SearchContext,R=p.MOEOptimizerV2MetricCandidateReducer,V=p.MOEOptimizerV2Candidates;
const json=x=>JSON.parse(JSON.stringify(x));
const sections=['pct','flat','conv','dmg','post','special','composite','other'];
function context(wear){return C.create({objective:base.objective,race:base.race,gender:base.gender,
 skillSim:{...base.skillSim,skills:{...base.skillSim.skills,'着こなし':wear}},topK:base.topK,slots:base.slots,
 baseState:base.baseState,inputs:base.inputs,runtime:base.runtime,constraints:base.constraints});}
function classify(r,c){return C.withRuntime(c,()=>{
 const records=new Map(r.metricReducer.classification.map(x=>[x.candidateId,x]));
 return r.contextEquivalentClasses.map(cls=>{
  const row=V.toEquipmentRow(cls.representativeCandidate),armor=p.equipmentArmorAC(row,c.skillSim),sig=JSON.parse(cls.equivalenceKey)[2],rec=records.get(cls.representativeCandidateId);
  const relevantBuff=sig.buffs.length>0,buffs=relevantBuff?sig.buffs:[];
  const groups=p.collectActiveBuffConflictCandidates({composite:buffs}).map(x=>x.group).filter(Boolean);
  const keys=sig.stackKeys||[],effective=armor.effective,addition=armor.addition;
  const category={A:effective>0,B:addition!==0,C:buffs.some(b=>(+b.extraAC||0)!==0),
   D:(+sig.bodyPercentage||0)!==0||buffs.some(b=>(+b.extraACPct||0)!==0),E:groups.length>0,
   F:relevantBuff&&keys.some(k=>k.startsWith('technic:')),G:relevantBuff&&keys.length>0,H:false,
   I:sig.structural.hardConflicts.length>0||!!sig.structural.weapon,
   J:!!sig.fixed||c.constraints.length>0,K:!!sig.unknown||effective<0||(relevantBuff&&!groups.length&&!keys.length)};
  category.L=!Object.values(category).some(Boolean);
  const numericZero=effective===0&&addition===0&&!category.C&&!category.D;
  const proofUnknown=!!sig.unknown;
  const scoreNeutralProof=numericZero&&!relevantBuff&&!proofUnknown&&!sig.fixed&&!c.constraints.length;
  // Distinct feasibility keys are NOT automatically null-equivalent Top-K entries.
  // The existing null registry is the only current canonical null identity.
  const existingNullIdentity=R.describeConfiguration(r,[cls.representativeCandidateId]).performanceKey==='[]';
  const reason=proofUnknown?'unknown':category.J?'fixed-or-constraint':relevantBuff?'buff-interaction':
   !numericZero?'formal-numeric-effect':scoreNeutralProof&&!existingNullIdentity?'distinct-top-k-key':'uncertified';
  return {id:cls.representativeCandidateId,name:cls.representativeCandidate.name,slot:row.slot,
   equivalentIds:cls.equivalentCandidateIds,category,rawAC:armor.raw,effectiveAC:effective,additionAC:addition,
   requirement:armor.performance,flatBuffs:buffs.map(b=>+b.extraAC||0),percentBuffs:buffs.map(b=>+b.extraACPct||0),
   groups,stackKeys:keys,hardConflicts:sig.structural.hardConflicts,weapon:sig.structural.weapon,
   restrictions:sig.structural.restrictions,numericZero,interactionOnly:numericZero&&relevantBuff,
   scoreNeutralProof,existingNullIdentity,safeNullReplacement:scoreNeutralProof&&existingNullIdentity,
   reason,projectionProtectedReasons:rec.legacyProtectedReasons};
 });
});}
function summarize(rows,c,r){const count=f=>rows.filter(f).length;
 const counts=Object.fromEntries('ABCDEFGHIJKL'.split('').map(k=>[k,count(x=>x.category[k])]));
 const bySlot=Object.fromEntries(c.slots.map(slot=>{const local=rows.filter(x=>x.slot===slot);
  return [slot,{total:local.length,effectivePositive:local.filter(x=>x.category.A).length,
   flatRelevant:local.filter(x=>x.category.B||x.category.C).length,percentage:local.filter(x=>x.category.D).length,
   interactionOnly:local.filter(x=>x.interactionOnly).length,completelyIrrelevant:local.filter(x=>x.category.L).length,
   scoreNeutral:local.filter(x=>x.scoreNeutralProof).length,safeNull:local.filter(x=>x.safeNullReplacement).length,
   safetyRetained:local.filter(x=>!x.safeNullReplacement).length}];}));
 return {wear:c.skillSim.skills['着こなし'],catalog:s.candidates.length,prefilter:r.diagnostics.metricReduction.hardPrefilterCount,
  classes:rows.length,counts,flatRelevant:count(x=>x.category.B||x.category.C),interactionRelevant:count(x=>x.category.E||x.category.F||x.category.G||x.category.H||x.interactionOnly),
  interactionOnly:count(x=>x.interactionOnly),scoreNeutral:count(x=>x.scoreNeutralProof),safeNull:count(x=>x.safeNullReplacement),
  reasons:Object.fromEntries([...new Set(rows.map(x=>x.reason))].map(k=>[k,count(x=>x.reason===k)])),
  existingNullCandidates:Object.values(r.metricReducer.nullReplacements).flat().length,bySlot};}
const reductions=new Map(),runs=[];
for(const wear of [100,0,40,150]){
 const c=context(wear),r=R.reduce(s,c),rows=classify(r,c);reductions.set(wear,{c,r,rows});
 runs.push({requestedWear:wear,...summarize(rows,c,r),rows});
}
const original=reductions.get(100),zero=reductions.get(0);
const zeroRecords=new Map(zero.r.metricReducer.classification.map(x=>[x.candidateId,x]));
const wear0OriginalClasses=C.withRuntime(zero.c,()=>original.r.contextEquivalentClasses.map(cls=>({
 id:cls.representativeCandidateId,name:cls.representativeCandidate.name,slot:cls.representativeCandidate.slot,
 noFlatPercentInteraction:(()=>{const c=cls.representativeCandidate,a=p.equipmentArmorAC(V.toEquipmentRow(c),zero.c.skillSim),rec=zeroRecords.get(c.candidateId);
  const sig=rec.equivalenceKey?JSON.parse(rec.equivalenceKey)[2]:null;
  return a.addition===0&&(!sig||(!sig.bodyPercentage&&!sig.buffs.length));})(),
 aliases:cls.equivalentCandidates.map(candidate=>{const a=p.equipmentArmorAC(V.toEquipmentRow(candidate),zero.c.skillSim);
  return {id:candidate.candidateId,rawAC:a.raw,effectiveAC:a.effective,additionAC:a.addition,requirement:a.performance};})})));
const fixed=C.withRuntime(base,()=>p.expandSkillSimMasteryBuffState(base.baseState));
const fixedExternal=Object.fromEntries(sections.map(k=>[k,(base.baseState[k]||[]).filter(x=>x.enabled&&!x.excluded)]));
const mastery=(fixed.other||[]).filter(x=>x.source==='skillSimMastery');
const sessions=[100,0,40,150].map(w=>p.MOEOptimizerV2EvaluationSession.create(reductions.get(w).c,s.sources));
const signatures=sessions.map(x=>x.evaluationContextSignature);sessions.forEach(x=>x.dispose());assert.equal(new Set(signatures).size,3);
assert.equal(signatures[0],signatures[3],'formal normalizer caps requested wear150 to100');
assert.deepEqual(original.r.contextEquivalentClasses.map(c=>c.equivalenceKey),reductions.get(150).r.contextEquivalentClasses.map(c=>c.equivalenceKey));
const actualCompletionChecks=[];
const sampled=[];
for(const slot of base.slots)for(const candidate of (zero.r.metricReducer.nullReplacements[slot]||[])){
 const row=V.toEquipmentRow(candidate),a=p.equipmentArmorAC(row,zero.c.skillSim);
 if(!row.equipBuffEnabled&&a.effective===0&&a.addition===0&&a.performance.evaluated.length){sampled.push(candidate);if(sampled.filter(c=>c.slot===slot).length>=2)break;}
}
for(const candidate of sampled){const slots=base.slots.filter(slot=>slot!==candidate.slot&&zero.r.candidates.some(c=>c.slot===slot)).slice(0,2);
 const choices=slots.map(slot=>[null,...zero.r.candidates.filter(c=>c.slot===slot).slice(0,2)]);
 for(const a of choices[0]||[null])for(const b of choices[1]||[null]){
  const completion=[a,b].filter(Boolean),withB=C.evaluate(zero.c,[candidate,...completion],s.sources);if(!withB.feasible)continue;
  const without=C.evaluate(zero.c,completion,s.sources);assert.equal(without.feasible,true);assert.ok(without.score>=withB.score);
  assert.equal(R.describeConfiguration(zero.r,[candidate,...completion].map(c=>c.candidateId)).performanceKey,R.describeConfiguration(zero.r,completion.map(c=>c.candidateId)).performanceKey);
  actualCompletionChecks.push({candidateId:candidate.candidateId,name:candidate.name,completion:completion.map(c=>c.candidateId),withScore:withB.score,nullScore:without.score});
 }
}
const candidateDiagnostics=zero.c?C.withRuntime(zero.c,()=>{
 let positiveBody=0,flat=0,pct=0,interaction=0,requirementsZero=0;
 for(const rec of zero.r.metricReducer.classification){if(rec.stage==='hard-prefilter')continue;
  const candidate=s.candidates.find(c=>c.candidateId===rec.candidateId),a=p.equipmentArmorAC(V.toEquipmentRow(candidate),zero.c.skillSim),sig=rec.equivalenceKey?JSON.parse(rec.equivalenceKey)[2]:null;
  positiveBody+=a.effective>0;flat+=a.addition!==0||!!rec.buffFlat;pct+=!!rec.bodyPercentage||!!rec.buffPercentage;interaction+=!!sig?.buffs.length;
  requirementsZero+=a.performance.evaluated.length>0&&a.effective===0;
 }
 return {positiveBody,flat,pct,interaction,requirementsZero};
}):null;
const out={context:{race:base.race,gender:base.gender,objective:base.objective,topK:base.topK,skills:base.skillSim.skills,
 constraints:base.constraints,fixedEquipment:base.fixedCandidateIds,fixedExternal,mastery},runs,wear0OriginalClasses,sessionSignatures:signatures,
 originalClassWear0:{requiredAndZero:wear0OriginalClasses.filter(x=>x.aliases[0].requirement.evaluated.length&&x.aliases[0].effectiveAC===0).length,
  bodyZero:wear0OriginalClasses.filter(x=>x.aliases[0].effectiveAC===0).length,
  requiredZeroNoFlatPercentInteraction:wear0OriginalClasses.filter(x=>x.aliases[0].requirement.evaluated.length&&x.aliases[0].effectiveAC===0&&x.noFlatPercentInteraction).length},
 candidateDiagnostics,actualCatalogNullSamples:sampled.map(c=>({id:c.candidateId,name:c.name,slot:c.slot})),actualCompletionChecks};
fs.writeFileSync('docs/optimizer-v2-ac-null-relevance-audit.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({...out,runs:runs.map(({rows,...rest})=>rest),wear0OriginalClasses:undefined,sessionSignatures:undefined,actualCompletionChecks:actualCompletionChecks.length},null,2));
