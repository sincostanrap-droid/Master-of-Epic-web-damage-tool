/* Investigation only. No candidates are removed and no search is executed. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const {objectiveContexts}=require('./inspect-optimizer-v2-objectives.cjs');
const p=contextRuntime(),snapshot=p.MOEOptimizerV2Candidates.generate(),contexts=objectiveContexts(p,20);
const json=v=>JSON.parse(JSON.stringify(v));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const key=v=>JSON.stringify(canonical(v));
const count=(list,test)=>list.filter(test).length;
const report={commit:'9ad353d3582786f87a0b0519cfb2d943ba7d1cde',catalogCount:snapshot.candidates.length,
  definitions:{positive:'At least one positive observed dimension, before configuration-wide conflict resolution; not a guarantee of final positive delta.',
    negative:'At least one negative observed dimension; positive/negative can overlap.',
    zero:'All objective-local flat/pct or target-skill dimensions are zero, before competition.',
    unrelated:'Zero local dimensions AND no projection protection AND no unknown metric-bound proof; not a proof that structural choices are interchangeable.',
    dominance:'Analysis only. Strictly higher numeric contribution, not an implemented Top-K-safe pruning rule.'},cases:{}};
for(const name of ['ac','skillPlus']){
  const context=contexts[name],reduction=p.MOEOptimizerV2EffectiveCandidates.reduce(snapshot,context);
  assert.equal(context.constraints.length,0);
  const proofs=p.MOEOptimizerV2BranchAndBound.inspectBounds(reduction).metrics[JSON.stringify(context.objective)];
  const projected=new Map(reduction.effectiveCandidates.map(e=>[e.candidateId,e]));
  const membership=new Map();for(const cls of reduction.contextEquivalentClasses)for(const id of cls.equivalentCandidateIds)membership.set(id,cls);
  const filtered=new Map(reduction.filtered.map(x=>[x.candidateId,x.reason]));
  const rows=p.MOEOptimizerV2SearchContext.withRuntime(context,()=>snapshot.candidates.map(c=>{
    const row=reduction.candidatePreparation.readRow(c),artifact=reduction.candidatePreparation.buffFor(c);
    const cls=membership.get(c.candidateId),rep=cls&&projected.get(cls.representativeCandidateId);
    const e=rep||p.MOEOptimizerV2EffectiveCandidates.project(c,snapshot.sources[c.sourceRef],context,{candidatePreparation:reduction.candidatePreparation});
    const buffs=row.equipBuffEnabled&&artifact.hasEffect?[artifact.normalizedCompositePrototype]:[];
    const base=p.emptyExtraStats();p.addExtraStatsInto(base,row,'base');
    const buff=p.emptyExtraStats();buffs.forEach(b=>p.addExtraStatsInto(buff,b,'buff'));
    const totals=p.skillPlusTotalsFromResolvedState({composite:buffs});
    const rawEffects=p.normalizeAdditionalEffects(row.extraEffects),direct=rawEffects.filter(x=>x.key==='skillPlus'&&x.name==='回復魔法').reduce((s,x)=>s+x.value,0);
    const target=p.MOESkillPlusV21.totalForSkill(totals,'回復魔法');
    const flat=base.extraAC+buff.extraAC,pct=base.extraACPct+buff.extraACPct;
    const dims=name==='ac'?[base.extraAC,buff.extraAC,base.extraACPct,buff.extraACPct]:[target];
    const proof=cls&&proofs.candidates[cls.representativeCandidateId];
    const protectedReasons=json(e.protectedReasons),boundUnknown=proof?.classification==='unknown';
    const otherSkills=Object.entries(totals).filter(([skill,value])=>skill!=='回復魔法'&&value!==0);
    const knownOther=!!(row.attack||row.magic||row.speed||Object.entries(base).some(([k,v])=>v&&!(name==='ac'&&['extraAC','extraACPct'].includes(k)))
      || buffs.some(b=>p.compositeHasEffect({...b,...(name==='ac'?{extraAC:0,extraACPct:0}:{}),extraEffects:b.extraEffects.filter(x=>!(name==='skillPlus'&&x.key==='skillPlus'&&x.name==='回復魔法'))})));
    const positive=dims.some(v=>v>0),negative=dims.some(v=>v<0),zero=dims.every(v=>v===0);
    return {candidateId:c.candidateId,name:c.name,slot:c.slot,retained:!!cls,filterReason:filtered.get(c.candidateId)||null,
      representativeCandidateId:cls?.representativeCandidateId,positive,negative,zero,
      flat,pct,baseAC:base.extraAC,buffAC:buff.extraAC,baseACPct:base.extraACPct,buffACPct:buff.extraACPct,
      directSkillPlus:direct,buffSkillPlus:target,otherSkills,knownOther,
      otherSkillOnlyBuff:target===0&&otherSkills.length>0&&buffs.every(b=>b.extraEffects.every(x=>x.key==='skillPlus')&&!p.compositeHasEffect({...b,extraEffects:[]})),
      otherSkillOnlyItem:target===0&&otherSkills.length>0&&!Object.values(base).some(Boolean)&&!row.attack&&!row.magic&&!row.speed&&!row.weaponDamage&&!row.weaponAttackInterval
        &&buffs.every(b=>b.extraEffects.every(x=>x.key==='skillPlus')&&!p.compositeHasEffect({...b,extraEffects:[]})),
      protected:protectedReasons.length>0,protectedReasons,boundUnknown:!!boundUnknown,boundReason:proof?.reason||null,
      unrelated:zero&&!protectedReasons.length&&!boundUnknown,
      structurallyInert:zero&&!protectedReasons.length&&!boundUnknown&&!c.slot.startsWith('武器:')&&!e.semantics.hardConflicts.length,
      buffName:artifact.resolved.equipBuffName,hasResolvedEffect:artifact.hasEffect,confidence:artifact.resolved.equipBuffRuleConfidence||null,
      modelIgnoredNamedBuff:!!row.equipBuffName&&!artifact.hasEffect,
      displayPayloadOnly:buffs.length>0&&buffs.every(b=>b.extraEffects.length>0&&b.extraEffects.every(x=>x.key!=='skillPlus'&&x.scope==='display')&&!p.compositeHasEffect({...b,extraEffects:[]})),
      ruleSource:artifact.resolved.equipBuffRuleSource||null,
      displayOnlyEffects:buffs.flatMap(b=>b.extraEffects).filter(x=>!['skillPlus'].includes(x.key)&&!x.value),
      semantics:json(e.semantics),fingerprint:e.fingerprint,proofBuffs:json(buffs)};
  }));
  const retained=rows.filter(r=>r.retained),classes=reduction.contextEquivalentClasses.map(cls=>rows.find(r=>r.candidateId===cls.representativeCandidateId));
  const summarize=list=>({count:list.length,positive:count(list,r=>r.positive),negative:count(list,r=>r.negative),
    zero:count(list,r=>r.zero),positiveAndNegative:count(list,r=>r.positive&&r.negative),protected:count(list,r=>r.protected),
    boundUnknown:count(list,r=>r.boundUnknown),unrelated:count(list,r=>r.unrelated),structurallyInert:count(list,r=>r.structurallyInert),constraintOnly:0,
    zeroKnownOther:count(list,r=>r.zero&&r.knownOther),zeroOtherSkills:count(list,r=>r.zero&&(r.otherSkills.length||(name==='ac'&&r.buffSkillPlus!==0))),
    otherSkillOnlyBuff:count(list,r=>r.otherSkillOnlyBuff),otherSkillOnlyItem:count(list,r=>r.otherSkillOnlyItem),
    zeroProtected:count(list,r=>r.zero&&r.protected),zeroBoundUnknown:count(list,r=>r.zero&&r.boundUnknown),
    directTargetPositive:count(list,r=>r.directSkillPlus>0),buffTargetPositive:count(list,r=>r.buffSkillPlus>0),
    directAndBuffPositive:count(list,r=>r.directSkillPlus>0&&r.buffSkillPlus>0),
    buffOnlyPositive:count(list,r=>r.buffSkillPlus>0&&r.directSkillPlus<=0),
    modelIgnoredNamedBuff:count(list,r=>r.modelIgnoredNamedBuff),displayPayloadOnly:count(list,r=>r.displayPayloadOnly)});
  const bySlot=Object.fromEntries(context.slots.map(slot=>[slot,{catalog:summarize(rows.filter(r=>r.slot===slot)),
    candidates:summarize(retained.filter(r=>r.slot===slot)),classes:summarize(classes.filter(r=>r.slot===slot))}]));
  const reasons=list=>Object.fromEntries([...new Set(list.flatMap(r=>r.protectedReasons))].map(reason=>[reason,count(list,r=>r.protectedReasons.includes(reason))]));
  const numericDominance=list=>{
    let pairs=0,dominated=0;const bySlot={};
    for(const slot of context.slots){const group=list.filter(r=>r.slot===slot&&!r.protected&&!r.boundUnknown);
      let slotDominated=0,slotPairs=0;
      for(const b of group){const winners=group.filter(a=>name==='ac'?(a.flat>=b.flat&&a.pct>=b.pct&&(a.flat>b.flat||a.pct>b.pct)):a.buffSkillPlus>b.buffSkillPlus);
        pairs+=winners.length;slotPairs+=winners.length;if(winners.length){dominated++;slotDominated++;}}
      bySlot[slot]={dominated:slotDominated,pairs:slotPairs};}
    return {pairs,dominated,bySlot,note:'Numeric same-slot screen only; ignores requirements, hands and conflicts. Not an equivalence or Top-K-safe deletion proof.'};
  };
  const structuralDominance=list=>{
    const groups=new Map();for(const r of list.filter(r=>!r.protected&&!r.boundUnknown)){
      const s=json(r.semantics);delete s.observedExtra;
      const k=key(s);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
    let dominated=0,pairs=0;const examples=[];
    for(const group of groups.values())for(const b of group){const wins=group.filter(a=>name==='ac'?(a.flat>=b.flat&&a.pct>=b.pct&&(a.flat>b.flat||a.pct>b.pct)):a.buffSkillPlus>b.buffSkillPlus);
      pairs+=wins.length;if(wins.length){dominated++;if(examples.length<15)examples.push({name:b.name,by:wins[0].name,value:name==='ac'?b.flat:b.buffSkillPlus,winnerValue:name==='ac'?wins[0].flat:wins[0].buffSkillPlus});}}
    return {dominated,pairs,examples,note:'All remaining projection semantics identical, no protected/unknown flags; still not safe to delete distinct lower-ranked configurations for Top20.'};
  };
  const boundKnownDominance=list=>{
    let pairs=0,dominated=0;const examples=[];
    for(const slot of context.slots){const group=list.filter(r=>r.slot===slot&&!r.boundUnknown);
      for(const b of group){const winners=group.filter(a=>name==='ac'?(a.flat>=b.flat&&a.pct>=b.pct&&(a.flat>b.flat||a.pct>b.pct)):a.buffSkillPlus>b.buffSkillPlus);
        pairs+=winners.length;if(winners.length){dominated++;if(examples.length<12)examples.push({name:b.name,by:winners[0].name,
          value:name==='ac'?b.flat:b.buffSkillPlus,winnerValue:name==='ac'?winners[0].flat:winners[0].buffSkillPlus});}}}
    return {dominated,pairs,examples,note:'Metric-bound-known numerical screen, includes projection-protected rows. Requirements/hands/conflicts are not checked, so not a safe deletion proof.'};
  };
  const hypothetical=(drop,{keepProtection=true}={})=>new Set(classes.map(r=>{
    if(keepProtection&&r.protected)return 'protected:'+r.candidateId;
    const s=json(r.semantics);drop(s);return key(s);
  })).size;
  const keySensitivity={};
  for(const field of Object.keys(classes[0].semantics)){
    const n=hypothetical(s=>delete s[field]);keySensitivity[field]={classesAfterDiagnosticOmission:n,delta:classes.length-n};}
  const skipAll=hypothetical(s=>{}, {keepProtection:false});
  const foreignBuffFieldOmission=s=>{s.buffs=s.buffs.map(b=>{
    const keep=['enabled','fixed','excluded','slot','name','tags','autoStackGroup','stackRule',
      ...(name==='ac'?['extraAC','extraACPct']:[])];
    return {...Object.fromEntries(keep.map(k=>[k,b[k]])),extraEffects:name==='skillPlus'?b.extraEffects.filter(x=>x.key==='skillPlus'&&x.name==='回復魔法'):[]};
  });};
  const objectiveOnly=new Set(classes.map(r=>key([r.slot,name==='ac'?[r.flat,r.pct]:r.buffSkillPlus]))).size;
  const examples=test=>retained.filter(test).slice(0,12).map(({name,slot,flat,pct,directSkillPlus,buffSkillPlus,protectedReasons,boundReason})=>
    ({name,slot,flat,pct,directSkillPlus,buffSkillPlus,protectedReasons,boundReason}));
  const zeroPartition={unprotectedZero:count(classes,r=>r.zero&&!r.protected),protectedZero:count(classes,r=>r.zero&&r.protected),
    zeroBoundUnknown:count(classes,r=>r.zero&&r.boundUnknown)};
  // Analyze the existing resolver's declared dependency graph, never filter.
  // Include transitive links: a zero-target Buff can change a multi-group winner.
  const dependencyClosure=p.MOEOptimizerV2SearchContext.withRuntime(context,()=>{
    const tokens=new Map(),byToken=new Map();
    for(const r of retained){const t=new Set(r.semantics.buffStackKeys.map(k=>'stack:'+String(k).toLowerCase()));
      for(const buff of r.proofBuffs)for(const candidate of p.collectActiveBuffConflictCandidates({composite:[buff]}))
        for(const group of [candidate.group,...p.splitTags(candidate.row.tags)].filter(Boolean))t.add('group:'+group.toLowerCase());
      for(const k of r.semantics.hardConflicts)t.add('equipment:'+k);
      tokens.set(r.candidateId,t);for(const k of t){if(!byToken.has(k))byToken.set(k,[]);byToken.get(k).push(r.candidateId);}}
    const reached=new Set(retained.filter(r=>!r.zero).map(r=>r.candidateId)),queue=[...reached],seenTokens=new Set();
    for(let i=0;i<queue.length;i++)for(const t of tokens.get(queue[i])){if(seenTokens.has(t))continue;seenTokens.add(t);
      for(const id of byToken.get(t)){if(!reached.has(id)){reached.add(id);queue.push(id);}}}
    const reachedRows=retained.filter(r=>reached.has(r.candidateId)),reachedClassIds=new Set(reachedRows.map(r=>r.representativeCandidateId));
    return {candidateCount:reachedRows.length,classCount:reachedClassIds.size,zeroCandidates:count(reachedRows,r=>r.zero),
      zeroClasses:classes.filter(r=>reachedClassIds.has(r.candidateId)&&r.zero).length,
      zeroExamples:reachedRows.filter(r=>r.zero).map(r=>({candidateId:r.candidateId,name:r.name,slot:r.slot})),
      note:'Declared group/stack/hard-conflict transitive closure from local objective effects, same-slot edges retained conservatively. Not a complete relevance/Top-K proof; hand/ammo/fixed external-state interactions need separate treatment.'};
  });
  report.cases[name]={context:{objective:context.objective,constraints:context.constraints,topK:context.topK,observations:context.observations},
    catalog:summarize(rows),prefilter:summarize(retained),classes:summarize(classes),bySlot,
    protectionReasons:{candidates:reasons(retained),classes:reasons(classes)},boundReasons:proofs.slots,
    keySensitivity,zeroPartition,dependencyClosure,classesIgnoringSingletonProtection:skipAll,
    foreignBuffFieldOmission:{keepSingletonProtection:hypothetical(foreignBuffFieldOmission),
      ignoreSingletonProtection:hypothetical(foreignBuffFieldOmission,{keepProtection:false})},
    classesIgnoringProtectionAndNonobjectiveSemantics:objectiveOnly,
    counterfactualNote:'Diagnostic key omission only, not applied to reduction/search; counts are NOT validated Exact-safe reductions.',
    numericDominance:{candidates:numericDominance(retained),classes:numericDominance(classes)},
    boundKnownNumericDominance:{candidates:boundKnownDominance(retained),classes:boundKnownDominance(classes)},
    structuralDominance:{candidates:structuralDominance(retained),classes:structuralDominance(classes)},
    examples:{positive:examples(r=>r.positive),negative:examples(r=>r.negative),zeroUnrelated:examples(r=>r.unrelated),
      zeroProtected:examples(r=>r.zero&&r.protected),boundUnknown:examples(r=>r.boundUnknown),
      otherSkillsOnly:examples(r=>r.zero&&r.otherSkills.length),ignoredNamedBuff:examples(r=>r.modelIgnoredNamedBuff)},
    boundBlockerCandidates:retained.filter(r=>r.boundUnknown).map(r=>({candidateId:r.candidateId,name:r.name,slot:r.slot,reason:r.boundReason,flat:r.flat,pct:r.pct})),
    rows};
  if(name==='ac'){
    const c=snapshot.candidates.find(c=>c.name==='アース チェストベル');
    const cls=membership.get(c.candidateId),r=rows.find(r=>r.candidateId===c.candidateId);
    report.earthChestBell={candidate:json(c),catalog:json(snapshot.sources[c.sourceRef]),row:json(reduction.candidatePreparation.readRow(c)),
      artifact:json(p.MOEOptimizerV2SearchContext.withRuntime(context,()=>reduction.candidatePreparation.buffFor(c))),
      classification:r,projection:json(projected.get(cls.representativeCandidateId)),proof:json(proofs.candidates[cls.representativeCandidateId])};
    const partner=snapshot.candidates.find(c=>{const row=reduction.candidatePreparation.readRow(c);
      return c.slot==='防具: 頭'&&!row.equipBuffName&&row.extraAC>0&&!filtered.has(c.candidateId);});
    report.earthChestBell.formalExample={partner:partner.name,
      earthOnly:p.MOEOptimizerV2SearchContext.evaluate(context,[c],snapshot.sources).score,
      partnerOnly:p.MOEOptimizerV2SearchContext.evaluate(context,[partner],snapshot.sources).score,
      combined:p.MOEOptimizerV2SearchContext.evaluate(context,[partner,c],snapshot.sources).score};
  } else {
    const positiveRows=retained.filter(r=>r.positive);
    for(const r of positiveRows){const c=snapshot.candidates.find(c=>c.candidateId===r.candidateId);
      const evaluation=p.MOEOptimizerV2SearchContext.evaluate(context,[c],snapshot.sources);
      assert.equal(evaluation.score,r.buffSkillPlus,'official singleton target skillPlus parity: '+r.name);}
    report.cases[name].officialPositiveSingletonParity={checked:positiveRows.length,passed:true};
  }
  for(const field of ['damage','interval','weight','range','twoHanded','requirements','projectileKind','ammoKind','motion']){
    const n=hypothetical(s=>{if(s.weapon)delete s.weapon[field];});keySensitivity['weapon.'+field]={classesAfterDiagnosticOmission:n,delta:classes.length-n};
  }
}
fs.writeFileSync('docs/optimizer-v2-relevance-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(report.cases).map(([name,r])=>[name,{catalog:r.catalog,prefilter:r.prefilter,classes:r.classes,
  protectionReasons:r.protectionReasons,keySensitivity:r.keySensitivity,classesIgnoringSingletonProtection:r.classesIgnoringSingletonProtection,
  objectiveOnly:r.classesIgnoringProtectionAndNonobjectiveSemantics,foreignBuffFieldOmission:r.foreignBuffFieldOmission,
  numericDominance:r.numericDominance,boundKnownNumericDominance:r.boundKnownNumericDominance,structuralDominance:r.structuralDominance}])),null,2));
