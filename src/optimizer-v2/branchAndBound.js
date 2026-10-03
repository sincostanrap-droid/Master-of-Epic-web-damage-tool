/* Exact equipment-only search over context-equivalent classes.
 * Bounds are optional proofs; the official SearchContext evaluator decides every leaf.
 */
(function (global) {
  "use strict";
  const structuralViolations = new Set(["duplicate-candidate", "missing-fixed-candidate", "outside-slots",
    "excluded-candidate", "not-owned", "duplicate-slot", "two-handed-conflict", "equipment-conflict",
    "ammo-incompatible", "main-weapon-mismatch", "weapon-type", "race-restriction", "gender-restriction"]);
  const candidateApi = () => global.MOEOptimizerV2Candidates;
  const contextApi = () => global.MOEOptimizerV2SearchContext;
  const reductionApi = () => global.MOEOptimizerV2EffectiveCandidates;
  const metricApi = () => global.MOEOptimizerV2Metrics;
  const additiveField = spec => ({ac:"extraAC",critRate:"extraCritRatePct",attackDelay:"extraAttackDelay",
    maxHP:"extraHP",maxST:"extraST",maxMP:"extraMP"})[spec.metric]
    || (spec.metric === "extraStat" ? spec.stat : null);
  const pctField = spec => ({ac:"extraACPct",maxHP:"extraHPPct",maxST:"extraSTPct",maxMP:"extraMPPct"})[spec.metric] || null;
  const specKey = spec => JSON.stringify(spec);
  const better = (a,b) => a.rankScore > b.rankScore || (a.rankScore === b.rankScore && ((a.secondaryRankScore??0) > (b.secondaryRankScore??0) || ((a.secondaryRankScore??0) === (b.secondaryRankScore??0) && a.performanceKey < b.performanceKey)));
  const worse = (a,b) => better(b,a);
  function heapPush(heap,item) {
    heap.push(item);
    for(let at=heap.length-1;at>0;) {
      const parent=(at-1)>>1;if(!worse(heap[at],heap[parent]))break;
      [heap[at],heap[parent]]=[heap[parent],heap[at]];at=parent;
    }
  }
  function heapReplaceRoot(heap,item) {
    heap[0]=item;
    for(let at=0;;) {
      let child=at*2+1;if(child>=heap.length)break;
      if(child+1<heap.length && worse(heap[child+1],heap[child]))child++;
      if(!worse(heap[child],heap[at]))break;
      [heap[child],heap[at]]=[heap[at],heap[child]];at=child;
    }
  }
  function orderSlots(groups, context, requested) {
    const slots=context.slots.filter(slot=>groups.has(slot));
    if(Array.isArray(requested)) {
      if(requested.length!==slots.length || new Set(requested).size!==slots.length
        || requested.some(slot=>!groups.has(slot))) throw new Error("slotOrder must be a permutation of the searched slots");
      return requested.slice();
    }
    if(requested===undefined || requested==="fewest") return slots.sort((a,b)=>
      (a===context.mainWeaponSlot?-1:b===context.mainWeaponSlot?1:0)
      || groups.get(a).length-groups.get(b).length
      || context.slots.indexOf(a)-context.slots.indexOf(b));
    if(requested==="ascending")return slots.sort((a,b)=>groups.get(a).length-groups.get(b).length||context.slots.indexOf(a)-context.slots.indexOf(b));
    if(requested==="descending")return slots.sort((a,b)=>groups.get(b).length-groups.get(a).length||context.slots.indexOf(a)-context.slots.indexOf(b));
    if(requested==="catalog" || requested==="blockers" || requested==="impact")return slots;
    throw new Error("Unknown slotOrder");
  }
  function prepare(reduction,{slotOrder}={}) {
    const context=reduction?.context;
    if(!context || !Array.isArray(reduction.contextEquivalentClasses) || !Array.isArray(reduction.candidates))
      throw new Error("A context-equivalent reduction is required");
    if(context.schemaVersion!==1)throw new Error("Unsupported SearchContext");
    const retained=new Set(reduction.candidates.map(c=>c.candidateId));
    const classes=reduction.contextEquivalentClasses.filter(cls=>retained.has(cls.representativeCandidateId));
    if(classes.length!==retained.size)throw new Error("Every retained candidate must have one class");
    const groups=new Map(context.slots.map(slot=>[slot,[]]));
    const rows=new Map(), extras=new Map(), conflicts=new Map();
    for(const cls of classes) {
      const c=cls.representativeCandidate;
      if(!groups.has(c.slot))throw new Error("Class outside SearchContext slots");
      const row=reduction.candidatePreparation?reduction.candidatePreparation.readRow(c):candidateApi().toEquipmentRow(c);
      const extra=emptyExtraStats();addExtraStatsInto(extra,row,"base");
      extra.extraAC=equipmentArmorAC(row,context.skillSim).total;
      groups.get(c.slot).push(cls);rows.set(c.candidateId,row);extras.set(c.candidateId,extra);
      conflicts.set(c.candidateId,optimizerEquipmentConflictKeys(row));
    }
    for(const list of groups.values())list.sort((a,b)=>a.representativeCandidateId.localeCompare(b.representativeCandidateId));
    const slots=orderSlots(groups,context,reduction.magicOriginalSlotOrder&&(slotOrder===undefined||slotOrder==="fewest")
      ?reduction.magicOriginalSlotOrder:slotOrder);
    return {context,classes,groups,rows,extras,conflicts,slots,sources:reduction.sources,reduction};
  }
  // Proofs are deliberately local to a metric and a choice. A complex choice only
  // disables that metric on branches which actually select it. An unresolved slot
  // blocks the bound until its choice has been made.
  function additiveProof(plan) {
    const {context,classes,extras,slots,groups}=plan;
    const specs=[context.objective,...context.constraints.map(c=>c.metric)];
    const baseline=contextApi().evaluate(context,[],plan.sources).metrics;
    const buffInfo=new Map(),stackSlots=new Map(),groupSlots=new Map();
    const register=(map,key,slot)=>{if(!key)return;if(!map.has(key))map.set(key,new Set());map.get(key).add(slot);};
    const conflictGroups=row=>[...new Set([buffGroupName(row),...splitTags(row?.tags||"")]
      .filter(Boolean).map(key=>key.toLowerCase()))];
    const baseBuffState=expandSkillSimMasteryBuffState(context.baseState);
    for(const list of [baseBuffState.composite,baseBuffState.pct,baseBuffState.flat,baseBuffState.conv,
      baseBuffState.dmg,baseBuffState.post,baseBuffState.special])
      for(const row of list||[])if(row?.enabled!==false)for(const group of conflictGroups(row))register(groupSlots,group,"__base");
    const projected=new Map((plan.reduction.effectiveCandidates||[]).map(e=>[e.candidateId,e]));
    for(const cls of classes) {
      const id=cls.representativeCandidateId,row=plan.rows.get(id);
      const effective=projected.get(id);
      // Projection used the same official resolver on this row before any
      // configuration-wide competition. Reuse that exact normalized result.
      const resolved=effective?.proofBuffs?null:resolveEquipmentBuffRowsForSameTechnic([row]);
      const buffs=effective?.proofBuffs||normalizeCompositeRows(resolved.map(equipmentBuffToCompositeRow));
      const keys=(effective?.proofStackKeys||resolved.map(equipmentBuffStackKey)).filter(Boolean);
      buffInfo.set(id,{buffs,keys});
      for(const key of keys)register(stackSlots,key,row.slot);
      for(const buff of buffs)for(const group of conflictGroups(buff))register(groupSlots,group,row.slot);
    }
    const proven=new Map();
    for(const spec of specs) {
      const key=specKey(spec);if(proven.has(key))continue;
      const field=additiveField(spec),pct=pctField(spec);
      const base=metricApi().read(spec,baseline,null);
      const proof={spec,field,base,byId:new Map(),bySlot:new Map(),blockerReasons:Object.create(null)};
      proven.set(key,proof);
      if(!field && spec.metric!=="skillPlus") {proof.unsupported="nonlinear-or-unproved-metric";continue;}
      if(!Number.isFinite(base)){proof.unsupported="nonfinite-baseline";continue;}
      if(pct && (+baseline.extraStats[pct]||0)!==0){proof.unsupported="baseline-percentage";continue;}
      const relevantGroups=new Set(),relevantStacks=new Set();
      // Other Buff categories can participate in the official group resolver.
      // Their metric dependency is not proven here, so a shared group stays complex.
      for(const list of [baseBuffState.pct,baseBuffState.flat,baseBuffState.conv,
        baseBuffState.dmg,baseBuffState.post,baseBuffState.special])
        for(const row of list||[])if(row?.enabled!==false)for(const group of conflictGroups(row))relevantGroups.add(group);
      for(const buff of normalizeCompositeRows(baseBuffState.composite)) {
        const extra=emptyExtraStats();addExtraStatsInto(extra,buff,"buff");
        const relevant=spec.metric==="skillPlus"
          ?global.MOESkillPlusV21.totalForSkill(skillPlusTotalsFromResolvedState({composite:[buff]}),spec.skillName)!==0
          :(extra[field]||0)!==0 || (pct && (extra[pct]||0)!==0);
        if(relevant)for(const group of conflictGroups(buff))relevantGroups.add(group);
      }
      for(const cls of classes) {
        const {buffs,keys}=buffInfo.get(cls.representativeCandidateId);
        buffs.forEach((buff,index)=>{
          const extra=emptyExtraStats();addExtraStatsInto(extra,buff,"buff");
          const relevant=spec.metric==="skillPlus"
            ?global.MOESkillPlusV21.totalForSkill(skillPlusTotalsFromResolvedState({composite:[buff]}),spec.skillName)!==0
            :(extra[field]||0)!==0 || (pct && (extra[pct]||0)!==0);
          if(relevant){for(const group of conflictGroups(buff))relevantGroups.add(group);
            if(keys[index])relevantStacks.add(keys[index]);}
        });
      }
      for(const cls of classes) {
        const id=cls.representativeCandidateId,extra=extras.get(id),{buffs,keys}=buffInfo.get(id);
        let reason=null,contribution=field?extra[field]:0;
        if(pct && (+extra[pct]||0)!==0)reason="equipment-percentage";
        if(!Number.isFinite(contribution))reason="nonfinite-contribution";
        if(buffs.length) {
          if(buffs.some(buff=>conflictGroups(buff).some(group=>
            relevantGroups.has(group) && groupSlots.get(group)?.size>1)))reason="buff-group-interaction";
          else if(keys.some(k=>relevantStacks.has(k) && stackSlots.get(k)?.size>1))reason="buff-stack-interaction";
          else if(spec.metric==="skillPlus") {
            // The official skillPlus resolver sums active, conflict-resolved
            // composite effects. No private skillPlus formula is introduced.
            contribution=buffs.reduce((sum,buff)=>sum+global.MOESkillPlusV21.totalForSkill(
              skillPlusTotalsFromResolvedState({composite:[buff]}),spec.skillName),0);
          } else {
            const buffExtra=emptyExtraStats();buffs.forEach(buff=>addExtraStatsInto(buffExtra,buff,"buff"));
            if(pct && (+buffExtra[pct]||0)!==0)reason="buff-percentage";
            contribution+=buffExtra[field]||0;
          }
        }
        if(spec.metric==="skillPlus" && !buffs.length)contribution=0;
        // A named Buff with no resolved model effect is harmless. Conversion,
        // percentage and conditional Buffs affect only their observed metrics;
        // group/stack interactions above remain conservative across metrics.
        proof.byId.set(id,{classification:reason?"unknown":buffs.length?"provenAdditiveBuff":"provenAdditive",
          contribution:reason?null:contribution,reason});
        if(reason)proof.blockerReasons[reason]=(proof.blockerReasons[reason]||0)+1;
      }
      for(const slot of slots) {
        const members=groups.get(slot).map(cls=>({cls,proof:proof.byId.get(cls.representativeCandidateId)}));
        const choices=members.map(x=>x.proof);
        const blockers=members.filter(x=>x.proof.classification==="unknown");
        const values=choices.filter(x=>x.classification!=="unknown").map(x=>x.contribution);
        proof.bySlot.set(slot,{blockerCount:blockers.length,
          reasons:Object.fromEntries([...new Set(blockers.map(x=>x.proof.reason))].map(reason=>[reason,blockers.filter(x=>x.proof.reason===reason).length])),
          blockerExamples:blockers.slice(0,5).map(x=>({candidateId:x.cls.representativeCandidateId,
            name:x.cls.representativeCandidate.name,reason:x.proof.reason})),
          minimum:Math.min(0,...values),maximum:Math.max(0,...values)});
      }
    }
    return proven;
  }
  function slack(...values) { return 1e-8 + Number.EPSILON*64*values.reduce((sum,x)=>sum+Math.abs(x),0); }
  // Upper-only AC relaxation. Never reinterpret the additive equality proof.
  // core collects extraAC/extraACPct from equipment and active Composite rows,
  // then metrics.read uses totalStatValue. Conflict resolution only removes
  // sources. Retain both signs: negative flat times a negative multiplier can
  // be positive, so simply dropping negative effects would not always be safe.
  function acPercentageProof(plan,additive) {
    if(plan.context.objective.metric!=="ac" || plan.context.objective.direction!=="max" || !additive || additive.unsupported)return null;
    const envelope=rows=>{
      const out={flatMin:0,flatMax:0,pctMin:0,pctMax:0};
      for(const row of rows)for(const [field,prefix] of [["extraAC","flat"],["extraACPct","pct"]]) {
        const value=+(row[field]??0);if(!Number.isFinite(value))return null;
        out[prefix+"Min"]+=Math.min(0,value);out[prefix+"Max"]+=Math.max(0,value);
      }
      return Object.values(out).every(Number.isFinite)?out:null;
    };
    const fixedRows=normalizeCompositeRows(expandSkillSimMasteryBuffState(plan.context.baseState).composite)
      .filter(row=>row.enabled);
    const fixed=envelope(fixedRows);
    if(!fixed)return null;
    const baseDefense=armorACContext(plan.context.skillSim).base;
    fixed.flatMin+=baseDefense;fixed.flatMax+=baseDefense;
    const projected=new Map((plan.reduction.effectiveCandidates||[]).map(e=>[e.candidateId,e]));
    const byId=new Map(),bySlot=new Map();let termCount=fixedRows.length;
    for(const cls of plan.classes) {
      const id=cls.representativeCandidateId,old=additive.byId.get(id);
      if(!old){byId.set(id,{reason:"missing-additive-classification",potential:null});continue;}
      // The ordinary row handoff can JSON-normalize NaN/Infinity to null.
      // Do not certify malformed raw numeric input through that normalization.
      const raw=cls.representativeCandidate.evaluationFields||{};
      if(["extraAC","extraACPct","equipBuffExtraAC","equipBuffExtraACPct"]
        .some(field=>!Number.isFinite(+(raw[field]??0)))) {
        byId.set(id,{reason:"nonfinite-input",potential:null});continue;
      }
      let reason=old?.reason;
      // Group/stack blockers remain unknown even though ignoring conflicts
      // might be a valid later relaxation. Phase 3C-1 only covers percentages.
      if(reason && !["buff-percentage","equipment-percentage"].includes(reason)) {
        byId.set(id,{reason,potential:null});continue;
      }
      const row=normalizeEquipmentCandidate(plan.rows.get(id));
      const buffs=projected.get(id)?.proofBuffs||normalizeCompositeRows(
        resolveEquipmentBuffRowsForSameTechnic([row]).map(equipmentBuffToCompositeRow));
      termCount+=1+buffs.length;
      const potential=envelope([{...row,extraAC:equipmentArmorAC(row,plan.context.skillSim).total},...buffs.filter(buff=>buff.enabled)]);
      byId.set(id,{reason:potential?null:"nonfinite-potential",potential});
    }
    for(const slot of plan.slots) {
      const out={flatMin:0,flatMax:0,pctMin:0,pctMax:0,blockerCount:0};
      for(const cls of plan.groups.get(slot)) {
        const entry=byId.get(cls.representativeCandidateId);
        if(!entry.potential){out.blockerCount++;continue;}
        for(const field of ["flatMin","pctMin"])out[field]=Math.min(out[field],entry.potential[field]);
        for(const field of ["flatMax","pctMax"])out[field]=Math.max(out[field],entry.potential[field]);
      }
      bySlot.set(slot,out);
    }
    return {fixed,byId,bySlot,termCount};
  }
  function acPercentageUpper(proof,selectedIds,remainingSlots) {
    if(!proof)return {upper:null,reason:"unsupported"};
    const interval={...proof.fixed};
    const include=entry=>{
      if(!entry)return false;
      for(const field of ["flatMin","flatMax","pctMin","pctMax"])interval[field]+=entry[field];
      return true;
    };
    for(const id of selectedIds){const entry=proof.byId.get(id);
      if(!entry?.potential)return {upper:null,reason:entry?.reason||"missing-candidate"};
      include(entry.potential);}
    for(const slot of remainingSlots){const entry=proof.bySlot.get(slot);
      if(!entry || entry.blockerCount)return {upper:null,reason:"remaining-blocker"};include(entry);}
    if(!Object.values(interval).every(Number.isFinite))return {upper:null,reason:"nonfinite-interval"};
    return acIntervalUpper(interval,proof.termCount+selectedIds.length+remainingSlots.length+16);
  }
  function acIntervalUpper(interval,count) {
    // Outward error budget for source accumulation plus final multiplication.
    // Refuse extreme magnitudes rather than returning a nonfinite upper bound.
    if(!Number.isSafeInteger(count) || count*Number.EPSILON>=0.001)return {upper:null,reason:"rounding-budget"};
    const pad=Number.EPSILON*count*128*(1+Object.values(interval).reduce((s,v)=>s+Math.abs(v),0));
    const f=[interval.flatMin-pad,interval.flatMax+pad],p=[interval.pctMin-pad,interval.pctMax+pad];
    const upper=Math.max(...f.flatMap(flat=>p.map(pct=>totalStatValue(0,flat,pct))));
    const rounded=upper+slack(upper)*count;
    return Number.isFinite(rounded)?{upper:rounded,interval,reason:null}:{upper:null,reason:"nonfinite-upper"};
  }
  // Source-level relaxation of formal defense. Body proficiency/scaling and
  // naked defense come from formal helpers. The resolver certifies membership;
  // its accepted.has(group) rule permits at most one active row per group.
  function acGroupProof(plan) {
    if(plan.context.objective.metric!=="ac" || plan.context.objective.direction!=="max")return null;
    const zero=()=>({flatMin:0,flatMax:0,pctMin:0,pctMax:0});
    const range=row=>{
      const flat=+(row.extraAC??0),pct=+(row.extraACPct??0);
      return Number.isFinite(flat)&&Number.isFinite(pct)?{flatMin:Math.min(0,flat),flatMax:Math.max(0,flat),
        pctMin:Math.min(0,pct),pctMax:Math.max(0,pct)}:null;
    };
    const allSources=[],byId=new Map(),bySlot=new Map();
    const source=(row,origin,candidateId=null,stackKey="")=>{
      const potential=range(row);if(!potential)return null;
      const groups=resolveAllBuffRowsForGroups({composite:[row]}).groups.map(g=>g.group.toLowerCase());
      const exclusiveKeys=[...new Set(groups.map(g=>"group:"+g))];
      if(stackKey)exclusiveKeys.push("equipment-stack:"+stackKey);
      const out={origin,candidateId,name:row.name,potential,groups,stackKey,exclusiveKeys,bucket:null,
        stackRule:row.stackRule,autoStackGroup:row.autoStackGroup,tags:row.tags};
      allSources.push(out);return out;
    };
    const fixedSources=normalizeCompositeRows(expandSkillSimMasteryBuffState(plan.context.baseState).composite)
      .filter(r=>r.enabled).map(row=>source(row,"fixed"));
    if(fixedSources.some(s=>!s))return null;
    for(const cls of plan.classes) {
      const id=cls.representativeCandidateId,raw=cls.representativeCandidate.evaluationFields||{};
      if(["extraAC","extraACPct","equipBuffExtraAC","equipBuffExtraACPct"].some(k=>!Number.isFinite(+(raw[k]??0)))) {
        byId.set(id,{reason:"nonfinite-input",direct:null,sources:[]});continue;
      }
      const row=normalizeEquipmentCandidate(plan.rows.get(id));
      const direct=range({...row,extraAC:equipmentArmorAC(row,plan.context.skillSim).total});
      const resolved=resolveEquipmentBuffRowsForSameTechnic([row]);
      const buffs=normalizeCompositeRows(resolved.map(equipmentBuffToCompositeRow)).filter(r=>r.enabled);
      const stackKey=resolved.length===1&&buffs.length===1?equipmentBuffStackKey(resolved[0]):"";
      const sources=buffs.map(buff=>source(buff,"equipment",id,stackKey));
      byId.set(id,{direct,sources,reason:!direct||sources.some(s=>!s)?"nonfinite-source":null});
    }
    const frequency=new Map();for(const s of allSources)for(const k of s.exclusiveKeys)frequency.set(k,(frequency.get(k)||0)+1);
    for(const s of allSources)s.bucket=s.exclusiveKeys.slice().sort((a,b)=>frequency.get(b)-frequency.get(a)||(a<b?-1:a>b?1:0))[0]||null;
    for(const [slot,classes] of plan.groups)bySlot.set(slot,classes.map(c=>byId.get(c.representativeCandidateId)));
    return {fixedSources,byId,bySlot,allSources,baseDefense:armorACContext(plan.context.skillSim).base,
      termCount:allSources.length+plan.classes.length};
  }
  function acGroupUpper(proof,selectedIds,remainingSlots,profile=null) {
    if(!proof)return {upper:null,reason:"unsupported"};
    if(profile){profile.calls++;profile.maps++;profile.arrays++;}
    let mark=profile?performance.now():0;
    const fields=["flatMin","flatMax","pctMin","pctMax"],zero=()=>Object.fromEntries(fields.map(k=>[k,0]));
    const interval=zero(),buckets=new Map();let usesGroups=false,usesPercentage=false;
    interval.flatMin=proof.baseDefense;interval.flatMax=proof.baseDefense;
    const add=(a,b)=>fields.forEach(k=>a[k]+=b[k]);
    const join=(a,b)=>fields.forEach(k=>a[k]=k.endsWith("Min")?Math.min(a[k],b[k]):Math.max(a[k],b[k]));
    const collect=entry=>{
      if(!entry || entry.reason)return null;
      if(profile){profile.entries++;profile.objects++;}
      const fallback={...entry.direct};
      for(const s of entry.sources) {
        if(profile)profile.sources++;
        usesPercentage=usesPercentage||s.potential.pctMin!==0||s.potential.pctMax!==0;
        if(s.bucket){usesGroups=true;if(!buckets.has(s.bucket)){buckets.set(s.bucket,zero());if(profile)profile.bucketBuilds++;}join(buckets.get(s.bucket),s.potential);}
        else add(fallback,s.potential);
      }
      usesPercentage=usesPercentage||fallback.pctMin!==0||fallback.pctMax!==0;return fallback;
    };
    const fixed=collect({direct:zero(),sources:proof.fixedSources});add(interval,fixed);
    if(profile){profile.fixedMs+=performance.now()-mark;mark=performance.now();}
    for(const id of selectedIds){const value=collect(proof.byId.get(id));if(!value)return {upper:null,reason:"selected-unknown"};add(interval,value);}
    if(profile){profile.selectedMs+=performance.now()-mark;mark=performance.now();}
    for(const slot of remainingSlots){const best=zero(),entries=proof.bySlot.get(slot);
      if(!entries)return {upper:null,reason:"missing-slot"};
      for(const entry of entries){if(profile)profile.candidateIterations++;const value=collect(entry);if(!value)return {upper:null,reason:"remaining-unknown"};join(best,value);}add(interval,best);}
    if(profile){profile.remainingMs+=performance.now()-mark;mark=performance.now();
      const zeros=2+remainingSlots.length+profile.bucketBuilds-profile.lastBucketBuilds;
      profile.lastBucketBuilds=profile.bucketBuilds;profile.objects+=zeros;profile.arrays+=zeros*5;}
    for(const value of buckets.values())add(interval,value);
    if(!Object.values(interval).every(Number.isFinite))return {upper:null,reason:"nonfinite-interval"};
    if(profile){profile.finalSumMs+=performance.now()-mark;mark=performance.now();}
    const result={...acIntervalUpper(interval,proof.termCount+selectedIds.length+remainingSlots.length+16),usesGroups,usesPercentage};
    if(profile)profile.cornerMs+=performance.now()-mark;
    return result;
  }
  // Preserve slot-addition and first-occurrence bucket order. Do NOT sum the
  // suffix into one range: that would reassociate floating-point additions.
  function prepareACSuffix(proof,slots) {
    if(!proof)return null;
    const started=performance.now(),fields=["flatMin","flatMax","pctMin","pctMax"];
    const zero=()=>Object.fromEntries(fields.map(k=>[k,0]));
    const join=(a,b)=>fields.forEach(k=>a[k]=k.endsWith("Min")?Math.min(a[k],b[k]):Math.max(a[k],b[k]));
    let candidateIterations=0;
    const prepared=slots.map(slot=>{
      const entries=proof.bySlot.get(slot),best=zero(),buckets=new Map();let usesGroups=false,usesPercentage=false;
      if(!entries)return Object.freeze({reason:"missing-slot"});
      for(const entry of entries){candidateIterations++;
        if(!entry||entry.reason)return Object.freeze({reason:"remaining-unknown"});
        const value={...entry.direct};
        for(const s of entry.sources){
          usesPercentage=usesPercentage||s.potential.pctMin!==0||s.potential.pctMax!==0;
          if(s.bucket){usesGroups=true;if(!buckets.has(s.bucket))buckets.set(s.bucket,zero());join(buckets.get(s.bucket),s.potential);}
          else fields.forEach(k=>value[k]+=s.potential[k]);
        }
        usesPercentage=usesPercentage||value.pctMin!==0||value.pctMax!==0;join(best,value);
      }
      return Object.freeze({range:Object.freeze(best),buckets:Object.freeze([...buckets].map(([key,value])=>
        Object.freeze([key,Object.freeze(value)]))),usesGroups,usesPercentage});
    });
    const suffix=Array.from({length:slots.length+1},(_,depth)=>Object.freeze(prepared.slice(depth)));
    return Object.freeze({suffix:Object.freeze(suffix),buildMs:performance.now()-started,candidateIterations});
  }
  function acPreparedUpper(proof,selectedIds,remaining,profile=null) {
    if(!proof)return {upper:null,reason:"unsupported"};
    const fields=["flatMin","flatMax","pctMin","pctMax"],zero=()=>Object.fromEntries(fields.map(k=>[k,0]));
    const interval=zero(),buckets=new Map();interval.flatMin=proof.baseDefense;interval.flatMax=proof.baseDefense;
    let usesGroups=false,usesPercentage=false,mark=profile?performance.now():0;
    if(profile){profile.calls++;profile.maps++;profile.arrays++;profile.objects+=2;}
    const add=(a,b)=>fields.forEach(k=>a[k]+=b[k]);
    const join=(a,b)=>fields.forEach(k=>a[k]=k.endsWith("Min")?Math.min(a[k],b[k]):Math.max(a[k],b[k]));
    const bucket=(key,potential)=>{if(!buckets.has(key)){buckets.set(key,zero());if(profile){profile.bucketBuilds++;profile.objects++;profile.arrays+=5;}}join(buckets.get(key),potential);};
    const collect=entry=>{
      if(!entry||entry.reason)return null;
      if(profile){profile.entries++;profile.objects++;}
      const value={...entry.direct};
      for(const s of entry.sources){if(profile)profile.sources++;
        usesPercentage=usesPercentage||s.potential.pctMin!==0||s.potential.pctMax!==0;
        if(s.bucket){usesGroups=true;bucket(s.bucket,s.potential);}else add(value,s.potential);
      }
      usesPercentage=usesPercentage||value.pctMin!==0||value.pctMax!==0;return value;
    };
    add(interval,collect({direct:zero(),sources:proof.fixedSources}));
    if(profile){profile.fixedMs+=performance.now()-mark;mark=performance.now();}
    for(const id of selectedIds){const value=collect(proof.byId.get(id));if(!value)return {upper:null,reason:"selected-unknown"};add(interval,value);}
    if(profile){profile.selectedMs+=performance.now()-mark;mark=performance.now();}
    for(const slot of remaining){if(slot.reason)return {upper:null,reason:slot.reason};
      for(const [key,value] of slot.buckets)bucket(key,value);
      add(interval,slot.range);usesGroups=usesGroups||slot.usesGroups;usesPercentage=usesPercentage||slot.usesPercentage;
    }
    if(profile){profile.remainingMs+=performance.now()-mark;mark=performance.now();}
    for(const value of buckets.values())add(interval,value);
    if(!Object.values(interval).every(Number.isFinite))return {upper:null,reason:"nonfinite-interval"};
    if(profile){profile.finalSumMs+=performance.now()-mark;mark=performance.now();}
    const result={...acIntervalUpper(interval,proof.termCount+selectedIds.length+remaining.length+16),usesGroups,usesPercentage};
    if(profile)profile.cornerMs+=performance.now()-mark;
    return result;
  }
  // An upper-only proof, deliberately NOT an additive equality. The official
  // skillPlus collector reads only Composite extraEffects before conversions.
  // Equipment expansion/group/technic resolution can discard these sources but
  // cannot multiply or create their target skillPlus values. Ignore every
  // negative effect and every conflict, including conflicts in the fixed input.
  function skillPotentialProof(plan) {
    const spec=plan.context.objective;
    if(spec.metric!=="skillPlus" || spec.direction!=="max")return null;
    const potential=rows=>normalizeCompositeRows(rows).reduce((sum,row)=>{
      if(!row.enabled || row.excluded)return sum;
      return sum+normalizeAdditionalEffects(row.extraEffects).reduce((total,effect)=>{
        const value=global.MOESkillPlusV21.totalForSkill(
          skillPlusTotalsFromResolvedState({composite:[{...row,extraEffects:[effect]}]}),spec.skillName);
        // The audited catalog uses integer skillPlus. Restrict this proof to
        // exact integer accumulation; fractional positive inputs retain the old
        // conservative path rather than assuming a floating-point error budget.
        if(value>0 && !Number.isSafeInteger(value))return NaN;
        return total+Math.max(0,value);
      },0);
    },0);
    const fixedRows=expandSkillSimMasteryBuffState(plan.context.baseState).composite;
    const base=potential(fixedRows);
    const byId=new Map(),bySlot=new Map(),sourcesById=new Map(),allSources=[];
    const sources=(rows,origin,candidateId=null,stackKey="")=>normalizeCompositeRows(rows).flatMap((row,index)=>{
      const amount=potential([row]);if(!(amount>0))return [];
      // Ask the official resolver which groups this single active row occupies.
      // Only its membership is used, never its selected/suppressed result.
      const groups=resolveAllBuffRowsForGroups({composite:[row]}).groups.map(g=>g.group.toLowerCase());
      const exclusiveKeys=[...new Set(groups.map(g=>"group:"+g))];
      // Same-technic exclusivity applies only to equipment, not external rows.
      if(stackKey)exclusiveKeys.push("equipment-stack:"+stackKey);
      const effects=normalizeAdditionalEffects(row.extraEffects).filter(effect=>
        global.MOESkillPlusV21.totalForSkill(skillPlusTotalsFromResolvedState({composite:[{...row,extraEffects:[effect]}]}),spec.skillName)>0);
      const source={origin,candidateId,index,name:row.name,potential:amount,positiveEffects:effects,
        groups,stackKey,exclusiveKeys,stackRule:row.stackRule,bucket:null};
      allSources.push(source);return [source];
    });
    const fixedSources=sources(fixedRows,"fixed-composite");
    for(const cls of plan.classes) {
      const id=cls.representativeCandidateId,row=plan.rows.get(id);
      // Use the official single-source expansion, including restored compatibility
      // metadata. No group or same-technic winner is cached for a configuration.
      const buffs=expandEquipmentBuffState({equipment:[row],composite:[]}).composite;
      byId.set(id,potential(buffs));
      const resolved=resolveEquipmentBuffRowsForSameTechnic([row]);
      // The official equipment expansion currently emits one Composite per row.
      // If that contract ever changes, do not assert one stack winner per source.
      const stackKey=resolved.length===1 && buffs.length===1?equipmentBuffStackKey(resolved[0]):"";
      sourcesById.set(id,sources(buffs,"equipment-buff",id,stackKey));
    }
    for(const [slot,classes] of plan.groups)bySlot.set(slot,Math.max(0,...classes.map(c=>byId.get(c.representativeCandidateId))));
    if(!Number.isSafeInteger(base) || [...byId.values(),...bySlot.values()].some(v=>!Number.isSafeInteger(v))
      || !Number.isSafeInteger(base+[...bySlot.values()].reduce((sum,v)=>sum+v,0)))return null;
    // A source may belong to multiple exclusive groups. Assign it to exactly
    // one proved clique, globally and deterministically. Discarding other edges
    // relaxes the problem; summing clique maxima cannot underestimate a winner
    // set. Group by whole Buff ROW, never by candidate or individual effect.
    const frequency=new Map();
    for(const source of allSources)for(const key of source.exclusiveKeys)frequency.set(key,(frequency.get(key)||0)+1);
    // Only an assignment heuristic among already certified cliques. Prefer the
    // target-skill compatibility labels to unrelated groups/technic cliques;
    // the proof does not rely on the label having any particular game meaning.
    const targetLabel="group:skillbuff:"+spec.skillName.toLowerCase()+":";
    for(const source of allSources)source.bucket=source.exclusiveKeys.slice().sort((a,b)=>
      Number(b.startsWith(targetLabel))-Number(a.startsWith(targetLabel))
      ||frequency.get(b)-frequency.get(a)||(a<b?-1:a>b?1:0))[0]||null;
    const effectCount=list=>list.reduce((sum,s)=>sum+s.positiveEffects.length,0);
    const grouped=allSources.filter(s=>s.bucket),fallback=allSources.filter(s=>!s.bucket);
    const diagnostics={positiveContributionCount:effectCount(allSources),
      unconditionalContributionCount:effectCount(fallback),conflictSensitiveContributionCount:effectCount(grouped),
      safeExclusiveGroupCount:new Set(allSources.flatMap(s=>s.exclusiveKeys.filter(k=>k.startsWith("group:")))).size,
      safeEquipmentStackKeyCount:new Set(allSources.flatMap(s=>s.exclusiveKeys.filter(k=>k.startsWith("equipment-stack:")))).size,
      assignedExclusiveBucketCount:new Set(grouped.map(s=>s.bucket)).size,
      groupAwareContributionCount:effectCount(grouped),sumFallbackContributionCount:effectCount(fallback),
      multiGroupSourceCount:allSources.filter(s=>s.groups.length>1).length};
    const sourceListsBySlot=new Map([...plan.groups].map(([slot,classes])=>
      [slot,classes.map(c=>sourcesById.get(c.representativeCandidateId))]));
    return {spec,base,byId,bySlot,fixedSources,sourcesById,sourceListsBySlot,allSources,diagnostics};
  }
  function potentialUpper(proof,selectedIds,remainingSlots) {
    if(!proof)return null;
    let upper=proof.base;
    for(const id of selectedIds){if(!proof.byId.has(id))return null;upper+=proof.byId.get(id);}
    for(const slot of remainingSlots){if(!proof.bySlot.has(slot))return null;upper+=proof.bySlot.get(slot);}
    return Number.isSafeInteger(upper)?upper:null;
  }
  function groupPotentialUpper(proof,selectedIds,remainingSlots) {
    const sumUpper=potentialUpper(proof,selectedIds,remainingSlots);
    if(sumUpper===null)return null;
    const maxima=new Map();
    const collect=list=>{
      let ungrouped=0;
      for(const source of list) {
        if(source.bucket)maxima.set(source.bucket,Math.max(maxima.get(source.bucket)||0,source.potential));
        else ungrouped+=source.potential;
      }
      return ungrouped;
    };
    let fallback=collect(proof.fixedSources);
    for(const id of selectedIds)fallback+=collect(proof.sourcesById.get(id));
    for(const slot of remainingSlots) {
      let slotMax=0;
      for(const list of proof.sourceListsBySlot.get(slot))slotMax=Math.max(slotMax,collect(list));
      fallback+=slotMax;
    }
    const groupUpper=fallback+[...maxima.values()].reduce((sum,v)=>sum+v,0);
    // Independent relaxations: retain the old slot-coupled upper if the group
    // relaxation ignores too much slot coupling. Overflow also falls back.
    return {sumUpper,groupUpper:Number.isSafeInteger(groupUpper)?groupUpper:null,
      upper:Number.isSafeInteger(groupUpper)?Math.min(sumUpper,groupUpper):sumUpper};
  }
  // Development-only stage sampling of the unchanged Phase 3B-3 algorithm.
  // Timers/counters are absent from its normal path; nested loop stage times
  // intentionally overlap and are reported as samples rather than wall totals.
  function profileGroupPotentialUpper(proof,selectedIds,remainingSlots,profile) {
    const timed=(key,fn)=>{const start=performance.now();const value=fn();
      profile[key]=(profile[key]||0)+performance.now()-start;return value;};
    profile.samples++;
    const sumUpper=timed("legacySumMs",()=>potentialUpper(proof,selectedIds,remainingSlots));
    if(sumUpper===null)return null;
    const maxima=timed("mapCreationMs",()=>new Map());profile.maps++;
    const collect=list=>{
      let ungrouped=0;
      for(const source of list) {
        profile.contributions++;
        if(source.bucket){profile.bucketUpdates++;
          timed("bucketMaxMs",()=>maxima.set(source.bucket,Math.max(maxima.get(source.bucket)||0,source.potential)));}
        else ungrouped+=source.potential;
      }
      return ungrouped;
    };
    let fallback=timed("fixedMs",()=>collect(proof.fixedSources));
    timed("selectedMs",()=>{for(const id of selectedIds)fallback+=collect(proof.sourcesById.get(id));});
    timed("remainingMs",()=>{for(const slot of remainingSlots) {
      profile.remainingSlots++;let slotMax=0;
      for(const list of proof.sourceListsBySlot.get(slot)) {
        profile.candidates++;slotMax=Math.max(slotMax,collect(list));
      }
      fallback+=slotMax;
    }});
    const groupUpper=timed("finalSumMs",()=>fallback+[...maxima.values()].reduce((sum,v)=>sum+v,0));
    profile.arrays++;profile.closures+=3;profile.resultObjects++;
    return timed("finalSelectionMs",()=>({sumUpper,groupUpper:Number.isSafeInteger(groupUpper)?groupUpper:null,
      upper:Number.isSafeInteger(groupUpper)?Math.min(sumUpper,groupUpper):sumUpper}));
  }
  // Exactly the same relaxation as groupPotentialUpper, with only the remaining
  // pool prepared. Bucket assignment has already been certified by the proof.
  // These arrays are private, immutable and scoped to this search; each bound
  // creates its own small accumulator (no shared mutable/re-entrant buffer).
  function prepareGroupPotentialSuffix(proof,slots) {
    if(!proof || slots.some(slot=>!proof.bySlot.has(slot)))return null;
    const start=performance.now();
    const buckets=[...new Set(proof.allSources.filter(s=>s.bucket).map(s=>s.bucket))];
    const indexes=new Map(buckets.map((key,index)=>[key,index]));
    const compile=sources=>{
      let fallback=0;const grouped=[];
      for(const source of sources) {
        if(source.bucket)grouped.push(Object.freeze([indexes.get(source.bucket),source.potential]));
        else fallback+=source.potential;
      }
      return Object.freeze({fallback,grouped:Object.freeze(grouped)});
    };
    const fixed=compile(proof.fixedSources);
    const candidates=new Map([...proof.sourcesById].map(([id,sources])=>
      [id,Object.freeze({...compile(sources),potential:proof.byId.get(id)})]));
    const suffix=Array(slots.length+1);
    suffix[slots.length]=Object.freeze({maxima:Object.freeze(Array(buckets.length).fill(0)),fallback:0,sum:0});
    for(let depth=slots.length-1;depth>=0;depth--) {
      const next=suffix[depth+1],maxima=next.maxima.slice();let slotMax=0;
      // Deliberately use every candidate in this slot, even with fixed equipment,
      // just as the Phase 3B-3 pool does. Do not tighten this relaxation here.
      for(const sources of proof.sourceListsBySlot.get(slots[depth])) {
        let ungrouped=0;
        for(const source of sources) {
          if(source.bucket){const index=indexes.get(source.bucket);maxima[index]=Math.max(maxima[index],source.potential);}
          else ungrouped+=source.potential;
        }
        slotMax=Math.max(slotMax,ungrouped);
      }
      suffix[depth]=Object.freeze({maxima:Object.freeze(maxima),fallback:slotMax+next.fallback,
        sum:proof.bySlot.get(slots[depth])+next.sum});
    }
    return {base:proof.base,fixed,candidates,suffix:Object.freeze(suffix),bucketCount:buckets.length,
      buildMs:performance.now()-start};
  }
  function preparedGroupPotentialUpper(prepared,selectedIds,depth,profile=null) {
    if(!prepared)return null;
    let stage=profile?performance.now():0;
    const remaining=prepared.suffix[depth],maxima=remaining.maxima.slice();
    let sumUpper=prepared.base,fallback=prepared.fixed.fallback+remaining.fallback;
    if(profile){profile.samples++;profile.arrays++;profile.resultObjects++;
      profile.suffixLookupAndCopyMs=(profile.suffixLookupAndCopyMs||0)+performance.now()-stage;stage=performance.now();}
    for(const [index,value] of prepared.fixed.grouped)maxima[index]=Math.max(maxima[index],value);
    if(profile){profile.contributions+=prepared.fixed.grouped.length;profile.bucketUpdates+=prepared.fixed.grouped.length;
      profile.fixedMs=(profile.fixedMs||0)+performance.now()-stage;stage=performance.now();}
    for(const id of selectedIds) {
      const candidate=prepared.candidates.get(id);if(!candidate)return null;
      sumUpper+=candidate.potential;fallback+=candidate.fallback;
      for(const [index,value] of candidate.grouped)maxima[index]=Math.max(maxima[index],value);
      if(profile){profile.contributions+=candidate.grouped.length;profile.bucketUpdates+=candidate.grouped.length;}
    }
    sumUpper+=remaining.sum;
    if(profile){profile.selectedAndLegacySumMs=(profile.selectedAndLegacySumMs||0)+performance.now()-stage;stage=performance.now();}
    if(!Number.isSafeInteger(sumUpper))return null;
    let groupUpper=fallback;for(const value of maxima)groupUpper+=value;
    if(profile){profile.finalSumMs=(profile.finalSumMs||0)+performance.now()-stage;stage=performance.now();}
    const result={sumUpper,groupUpper:Number.isSafeInteger(groupUpper)?groupUpper:null,
      upper:Number.isSafeInteger(groupUpper)?Math.min(sumUpper,groupUpper):sumUpper};
    if(profile)profile.finalSelectionMs=(profile.finalSelectionMs||0)+performance.now()-stage;
    return result;
  }
  // Optimistic key for dry-run and exact tie pruning. Null is omitted from the real key, so choosing
  // an arbitrary per-slot minimum is safe only when the serialized slot prefixes
  // have the same strict order as the canonical (raw string) slot sort. In that
  // case inserting an optional earlier entry is better than skipping to a later
  // entry or the closing ']'. Ignore all feasibility/score restrictions here.
  function prepareTieKey(plan,slots) {
    const canonical=slots.slice().sort((a,b)=>a<b?-1:a>b?1:0);
    const prefixes=canonical.map(slot=>JSON.stringify(slot)+",");
    if(prefixes.some((prefix,i)=>i && !(prefixes[i-1]<prefix)))return null;
    const tokensById=new Map();
    const minima=canonical.map((slot,index)=>{
      let minimum=null;
      for(const cls of plan.groups.get(slot)) {
        const token=JSON.stringify([slot,cls.equivalenceKey]);
        tokensById.set(cls.representativeCandidateId,{index,token});
        if(minimum===null || token<minimum)minimum=token;
      }
      return minimum;
    });
    const depths=new Map(slots.map((slot,index)=>[slot,index]));
    const suffix=Array.from({length:slots.length+1},(_,depth)=>Object.freeze(
      canonical.map((slot,index)=>depths.get(slot)>=depth?minima[index]:null)));
    return {tokensById,suffix:Object.freeze(suffix)};
  }
  function optimisticTieKey(proof,selectedIds,depth,kthKey=null) {
    if(!proof)return null;
    const remaining=proof.suffix[depth],tokens=remaining.slice();
    for(const id of selectedIds){const entry=proof.tokensById.get(id);if(!entry)return null;tokens[entry.index]=entry.token;}
    const key="["+tokens.filter(Boolean).join(",")+"]";
    const firstUnknown=remaining.findIndex(Boolean);
    const prefix="["+tokens.slice(0,firstUnknown<0?tokens.length:firstUnknown).filter(Boolean).join(",");
    return {key,classification:kthKey===null?null:key>=kthKey
      ?prefix>kthKey?"prefix-only":"suffix-bound":"retain",sameKey:key===kthKey};
  }
  function runCore(reduction,options={},stratum=null) {
    const start=performance.now();
    return contextApi().withRuntime(reduction.context,()=>{
      const searchProfile=options.profileSearch?{prepareMs:0,proofMs:0,orderMs:0,sessionMs:0,
        dfsMs:0,boundMs:0,invalidNextMs:0,considerMs:0}:null;
      let stageStart=performance.now();
      const plan=prepare(reduction,options),{context,groups,rows,conflicts}=plan;
      if(searchProfile){searchProfile.prepareMs=performance.now()-stageStart;stageStart=performance.now();}
      const enablePruning=options.enablePruning!==false;
      if(options.boundMode!==undefined && !["none","phase3","phase3.5"].includes(options.boundMode))throw new Error("Unknown boundMode");
      const phase3Compatible=options.boundMode==="phase3";
      const proofs=options.boundMode==="none" || (phase3Compatible && plan.classes.some(cls=>
        rows.get(cls.representativeCandidateId).equipBuffEnabled))?null:additiveProof(plan);
      const potentialProof=options.skillPlusOptimisticBound===false || options.boundMode==="none" || phase3Compatible
        ?null:(stratum?.proof||skillPotentialProof(plan));
      plan.primaryProof=potentialProof;
      // Phase 3B's proof/source/clique construction already takes the target
      // skill from the normalized objective. Restore that same proved path for
      // standalone skillPlus and the supported skillPlus -> magic tuple.
      const standaloneSkillPlus=!context.secondary && !context.constraints.length;
      const lexicographic=!!potentialProof && lexicographicScope(context) && options.lexicographicFastPath!==false;
      const magicResistance=magicResistanceScope(context)&&options.lexicographicFastPath!==false;
      const evasionResistance=evasionResistanceScope(context)&&options.lexicographicFastPath!==false;
      const skillPlusFastPath=!!potentialProof && (standaloneSkillPlus||lexicographic)
        && options.skillPlusFastPath!==false;
      // Preserve the pre-existing healing path outside the new supported scope.
      const groupAware=potentialProof && (standaloneSkillPlus||lexicographic?skillPlusFastPath:context.objective.skillName==="回復魔法")
        && options.skillPlusGroupAwareBound!==false;
      const acProof=options.acPercentageBound===false || options.boundMode==="none" || phase3Compatible
        ?null:acPercentageProof(plan,proofs?.get(specKey(context.objective)));
      const acGroups=options.acGroupBound===false || options.boundMode==="none" || phase3Compatible
        ?null:acGroupProof(plan);
      const magic=options.magicBound===false || options.boundMode==="none" || phase3Compatible || (context.secondary&&!lexicographic&&!magicResistance)?null:magicProof(plan,options.magicCandidatePrepared!==false);
      if(searchProfile){searchProfile.proofMs=performance.now()-stageStart;stageStart=performance.now();}
      if(phase3Compatible && proofs)for(const proof of proofs.values())if(proof.spec.metric==="skillPlus")
        proof.unsupported="phase3-unproved-skill-plus";
      if(["blockers","impact"].includes(options.slotOrder)) {
        const score=slot=>{
          const details=[context.objective,...context.constraints.map(c=>c.metric)].map(spec=>proofs.get(specKey(spec))?.bySlot.get(slot));
          return options.slotOrder==="blockers"
            ? details.reduce((sum,x)=>sum+(x?.blockerCount||0),0)
            : details.reduce((sum,x)=>sum+(x?(x.maximum-x.minimum):0),0);
        };
        plan.slots.sort((a,b)=>score(b)-score(a)||groups.get(a).length-groups.get(b).length||context.slots.indexOf(a)-context.slots.indexOf(b));
      }
      // Diagnostics can pin an existing slot permutation without changing the
      // selected slotOrder strategy's candidate ordering (e.g. blockers).
      if(options.fixedSlotOrder!==undefined)plan.slots=orderSlots(groups,context,options.fixedSlotOrder);
      const lexOrder=options.lexicographicOrdering||"primaryMagic";
      if(lexicographic && !["current","primary","primaryMagic","pruning"].includes(lexOrder))throw new Error("Unknown lexicographicOrdering");
      const magicOrdering=magic&&(!lexicographic||lexOrder!=="current")&&options.magicOrdering!==false&&options.slotOrder===undefined&&options.fixedSlotOrder===undefined
        ?prepareMagicOrdering(magic,plan):null;
      if(magicOrdering)plan.slots=lexicographic?magicOrdering.slots.slice().sort((a,b)=>
        (lexOrder==="pruning"?groupPotentialUpper(potentialProof,[],plan.slots.filter(s=>s!==a)).upper-groupPotentialUpper(potentialProof,[],plan.slots.filter(s=>s!==b)).upper:0)
        ||potentialProof.bySlot.get(b)-potentialProof.bySlot.get(a)||(lexOrder==="primary"?groups.get(a).length-groups.get(b).length:0)||magicOrdering.slots.indexOf(a)-magicOrdering.slots.indexOf(b)):magicOrdering.slots;
      const slots=plan.slots;
      const petProof=context.objective.metric==="petGrowth" ? global.MOEPetGrowth.prepareBound(plan):null;
      const resistance=context.objective.metric==="resistance"||magicResistance;
      const avoid=context.secondary&&!lexicographic&&!magicResistance&&!evasionResistance?null:options[resistance?"resistanceBound":"avoidBound"]===false||options.boundMode==="none"?null:prepareAvoid(plan,!magicResistance&&options[resistance?"resistanceOrdering":"avoidOrdering"]!==false&&options.slotOrder===undefined&&options.fixedSlotOrder===undefined);
      let avoidState=avoid?.initial;
      // Reuse the same additive-stat preparation with a second axis/state;
      // its suffix is built after primary ordering fixes the slot permutation.
      const secondaryResistance=evasionResistance&&options.resistanceBound!==false&&options.boundMode!=="none"?prepareAvoid(plan,false,true):null;
      let resistanceState=secondaryResistance?.initial;
      const magicSuffix=magic && options.magicPreparedBound!==false?prepareMagicSuffix(magic,slots):null;
      const magicCoupled=magic&&options.magicCoupledBound!==false?prepareMagicCoupled(magic,slots):null;
      let magicState={flat:0,log:0};
      const primaryCompletion=(lexicographic||stratum?.kind==="primary") && options.lexicographicMatchingBound!==false?preparePrimaryCompletion(potentialProof,slots,stratum?.completionTemplate):null;
      if(stratum?.kind==="primary") {stratum.proof=potentialProof;stratum.completion=primaryCompletion;stratum.unsupported=!potentialProof||!primaryCompletion;}
      const acSuffix=options.acPreparedBound===false?null:prepareACSuffix(acGroups,slots);
      const tieAuditEnabled=!!options.skillPlusTieAudit && groupAware;
      const tiePruningEnabled=!context.secondary && !!groupAware && !tieAuditEnabled && options.skillPlusTiePruning!==false;
      const tieKeyProof=tieAuditEnabled||tiePruningEnabled||petProof?prepareTieKey(plan,slots):null;
      const preparedGroup=groupAware && options.skillPlusPreparedGroupBound!==false
        ?prepareGroupPotentialSuffix(potentialProof,slots):null;
      if(searchProfile){searchProfile.orderMs=performance.now()-stageStart;stageStart=performance.now();}
      const evaluationSession=options.preparedEvaluation===false?null:
        global.MOEOptimizerV2EvaluationSession.create(context,plan.sources,
          {rows,candidates:plan.classes.map(cls=>cls.representativeCandidate),preparation:reduction.candidatePreparation,
            preparedStateAssembly:options.preparedStateAssembly!==false});
      if(searchProfile)searchProfile.sessionMs=performance.now()-stageStart;
      const selected=[],selectedClasses=[],selectedRows=[],selectedIds=[],activeConflictKeys=new Set();
      const heap=[],keys=new Set();
      const specs=proofs?[...proofs.keys()]:[];
      const evalProfile=options.profileEvaluation?{}:null;
      const byDepth=()=>Array(slots.length+1).fill(0);
      const potentialProfile=options.profileSkillPlusBound?{calls:0,totalMs:0,callsByDepth:byDepth(),
        path:preparedGroup?"prepared-suffix":"phase3B-3",preparedBuildMs:preparedGroup?.buildMs||0,
        bucketCount:preparedGroup?.bucketCount||potentialProof?.diagnostics.assignedExclusiveBucketCount||0,
        allocationEstimatePerCall:preparedGroup?{maps:0,sets:0,arrays:1,closures:0,resultObjects:1}
          :{maps:1,sets:0,arrays:2,closures:2,resultObjects:1},
        stages:{samples:0,maps:0,arrays:0,closures:0,resultObjects:0,remainingSlots:0,candidates:0,
          contributions:0,bucketUpdates:0}}:null;
      const extraBoundDiagnostics={enabled:!!avoid?.supported,prepareMs:avoid?.prepareMs||0,calls:0,totalMs:0,prunes:0,buckets:avoid?.buckets.length||0,frontiers:avoid?Object.fromEntries([...avoid.frontiers].map(([s,f])=>[s,f.length])):{}};
      const diagnostics={avoidFastPath:resistance?{enabled:false}:extraBoundDiagnostics,resistanceFastPath:resistance?{...extraBoundDiagnostics,element:magicResistance?context.secondary.element:context.objective.element}:evasionResistance?{enabled:!!secondaryResistance?.supported,prepareMs:secondaryResistance?.prepareMs||0,calls:0,totalMs:0,prunes:0,buckets:secondaryResistance?.buckets.length||0,frontiers:secondaryResistance?Object.fromEntries([...secondaryResistance.frontiers].map(([s,f])=>[s,f.length])):{},element:context.secondary.element}:null,inputCandidateCount:reduction.diagnostics?.afterFilterCount ?? plan.classes.length,
        lexicographic:{enabled:lexicographic||magicResistance||evasionResistance,targetSkill:context.objective.skillName,primaryCalls:0,primaryMs:0,primaryPrunes:0,secondaryCalls:0,secondaryMs:0,secondaryPrunes:0,secondarySkippedGreater:0,history:[],rootPrimaryUpper:null},
        magicFastPath:magic?{enabled:true,preparedSlots:true,preparedSuffix:!!magicSuffix,
          exclusiveSources:magic.sources.filter(s=>s.bucket).length}:null,
        magicUpperBound:{calls:0,known:0,unknown:0,totalMs:0,reasons:{},less:0,equal:0,greater:0,sum:0,minimum:null,maximum:null},
        magicCoupledBound:{calls:0,totalMs:0,prunes:0,supported:!!magicCoupled?.supported,
          prepareMs:magicCoupled?.prepareMs||0,frontiers:magicCoupled?Object.fromEntries([...magicCoupled.frontiers].map(([s,f])=>[s,f.length])):{}},
        magicRectangleBound:{calls:0,totalMs:0,prunes:0},
        magicOrdering:magicOrdering?lexicographic?lexOrder:"slot-potential/completion":null,
        contextEquivalentClassCount:plan.classes.length,searchNodes:0,completeConfigurationsEvaluated:0,
        feasibilityPrunedNodes:0,boundPrunedNodes:0,invalidEquipmentCombinationCount:0,cacheHitCount:0,
        topKUpdates:0,elapsedMs:0,objective:context.objective,constraints:context.constraints,
        upperBoundKnownCount:0,upperBoundUnknownCount:0,optimisticBoundUseCount:0,
        optimisticObjectivePrunedNodes:0,kthScoreHistory:[],firstTopKFullNode:null,
        finalKthScoreReachedNode:null,
        acSuffixPreparation:acSuffix?{buildMs:acSuffix.buildMs,candidateIterations:acSuffix.candidateIterations}:null,
        acBoundProfile:options.profileACBound?{calls:0,maps:0,arrays:0,objects:0,entries:0,sources:0,
          candidateIterations:0,bucketBuilds:0,lastBucketBuilds:0,fixedMs:0,selectedMs:0,remainingMs:0,finalSumMs:0,cornerMs:0}:null,
        acUpperBound:{calls:0,known:0,unknown:0,percentageUses:0,additiveUses:0,groupFallback:0,totalMs:0,
          groupUses:0,groupPercentageUses:0,dryKnown:0,dryUnknown:0,
          unknownByDepth:byDepth(),reasons:Object.create(null)},
        skillPlusPotentialAvailability:potentialProof?{status:"proven-upper-only",base:potentialProof.base,
          knownCandidateCount:potentialProof.byId.size,
          additiveUnknownCoveredCount:[...(proofs?.get(specKey(context.objective))?.byId.values()||[])]
            .filter(choice=>choice.classification==="unknown").length}:null,
        skillPlusFastPath:context.objective.metric==="skillPlus"?{
          objectiveKind:"skillPlus",targetSkill:context.objective.skillName,enabled:!!skillPlusFastPath && !!groupAware,
          reason:context.secondary&&!lexicographic?"secondary-not-supported":context.constraints.length?"constraints-not-supported":
            !potentialProof?"optimistic-proof-unavailable":!skillPlusFastPath || !groupAware?"disabled-by-option":"enabled",
          sparseReducer:!!reduction.metricReducer?.applied,groupAware:!!groupAware,
          preparedSuffix:!!preparedGroup,tiePruning:!!tiePruningEnabled}:null,
        skillPlusContributionClassification:potentialProof?.diagnostics||null,
        groupAwareBoundUseCount:0,groupAwareReductionCount:0,
        upperBoundSummary:{count:0,sumUpperTotal:0,usedUpperTotal:0,reductionTotal:0,minimum:null,maximum:null,
          sumAverage:null,usedAverage:null,averageReduction:null,distribution:{below100:0,from100to149:0,from150to199:0,atLeast200:0}},
        invalidReasons:Object.create(null),evaluationSession: evaluationSession?.diagnostics||null,
        boundMetrics:specs.filter(key=>!proofs.get(key).unsupported).map(key=>JSON.parse(key)),
        metricBoundAvailability:Object.fromEntries(specs.map(key=>[key,{status:proofs.get(key).unsupported||"candidate-dependent",
          classifications:Object.fromEntries(["provenAdditive","provenAdditiveBuff","unknown"].map(label=>
            [label,[...proofs.get(key).byId.values()].filter(x=>x.classification===label).length])),
          blockerReasons:proofs.get(key).blockerReasons}])),
        slotBoundBlockers:Object.fromEntries(slots.map(slot=>[slot,Object.fromEntries(specs.map(key=>[key,proofs.get(key).bySlot.get(slot)||null]))])),
        slotOrder:slots.slice(),nodesByDepth:byDepth(),formalEvaluationsByDepth:byDepth(),
        boundPrunesByDepth:byDepth(),feasibilityPrunesByDepth:byDepth(),
        firstObjectiveBoundDepth:null,firstConstraintBoundDepth:null,
        formalEvaluationAverageMs:null,computeMetricsAverageMs:null,evaluationProfile:evalProfile,
        searchProfile,
        skillPlusBoundProfile:potentialProfile,
        skillPlusSuffixPreparation:preparedGroup?{buildMs:preparedGroup.buildMs,bucketCount:preparedGroup.bucketCount,
          depthCount:preparedGroup.suffix.length}:null,
        tiePrunedNodes:0,tiePrunesByDepth:byDepth(),tieKeyChecks:0,tieKeyUnknown:0,tieKeyRetained:0,
        tiePrefixPrunes:0,tieSuffixPrunes:0,tieSameKeyPrunes:0,tieKeyMs:0,
        exact:false,approximate:false};
      const relationStats=()=>({nodes:0,formal:0,expanded:0,objectivePrunes:0,exclusiveMs:0,subtreeMs:0,
        byDepth:byDepth(),formalByDepth:byDepth(),expandedByDepth:byDepth()});
      const tieAudit=tieAuditEnabled?{dryRun:true,finalScore:205,startedNode:null,
        afterFinalScoreNodes:0,afterFinalScoreFormal:0,afterFinalScorePrunes:0,
        less:relationStats(),equal:relationStats(),greater:relationStats(),
        equalChecks:0,safePrunable:0,retained:0,unknown:0,prefixOnly:0,suffixBound:0,sameKey:0,
        prunableRoots:0,coveredNodes:0,coveredFormal:0,keyBoundMs:0}:null;
      if(tieAudit)tieAudit.afterFinalKey={checks:0,safePrunable:0,retained:0,unknown:0,prefixOnly:0,suffixBound:0,sameKey:0};
      diagnostics.skillPlusTieAudit=tieAudit;
      const auditFrames=[];
      const fixedBySlot=new Map();
      for(const id of context.fixedCandidateIds) {
        const cls=plan.classes.find(g=>g.equivalentCandidateIds.includes(id));
        if(!cls || cls.representativeCandidateId!==id)throw new Error("Fixed candidate must be retained as its own representative");
        fixedBySlot.set(cls.representativeCandidate.slot,id);
      }
      const snapshot=depth=>({...diagnostics,nodesByDepth:diagnostics.nodesByDepth.slice(),
        elapsedMs:performance.now()-start,currentDepth:depth,
        currentCandidateIds:selectedIds.slice(),remainingSlots:slots.slice(depth),
        // Read-only development observation, never an Exact result on interruption.
        observedTopK:options.observeTopK?heap.slice().sort((a,b)=>better(a,b)?-1:better(b,a)?1:0)
          .map(r=>({score:r.score,secondaryScore:r.secondaryScore,performanceKey:r.performanceKey,candidateIds:r.candidateIds.slice()})):undefined,
        formalEvaluationAverageMs:evalProfile && diagnostics.completeConfigurationsEvaluated
          ?(evalProfile.formalEvaluationMs||0)/diagnostics.completeConfigurationsEvaluated:null,
        computeMetricsAverageMs:evalProfile && diagnostics.completeConfigurationsEvaluated
          ?(evalProfile.computeMetricsMs||0)/diagnostics.completeConfigurationsEvaluated:null});
      function invalidNext(cls) {
        const row=rows.get(cls.representativeCandidateId);
        const right=row.slot==="武器: 右手"?row:selectedRows.find(r=>r.slot==="武器: 右手");
        const left=row.slot==="武器: 左手"?row:selectedRows.find(r=>r.slot==="武器: 左手");
        if(right && left && (optimizerWeaponUsesBothHands(right)||optimizerWeaponUsesBothHands(left)))return true;
        return conflicts.get(cls.representativeCandidateId).some(key=>activeConflictKeys.has(key));
      }
      function recordInvalid(reason) {
        diagnostics.invalidEquipmentCombinationCount++;
        diagnostics.invalidReasons[reason]=(diagnostics.invalidReasons[reason]||0)+1;
      }
      function consider() {
        const considerStart=searchProfile?performance.now():0;
        try {return considerCore();}
        finally {if(searchProfile)searchProfile.considerMs+=performance.now()-considerStart;}
      }
      function considerCore() {
        // The official helper functions can reject these completed layouts before
        // the expensive calculator. SearchContext.evaluate repeats the same checks
        // for every layout that reaches formal scoring.
        const active={...context.baseState,equipment:selectedRows};
        const weapon=selectedWeaponForCalc(active);
        const ammo=selectedRows.find(row=>row.slot==="武器: 弾丸");
        const ammoKind=ammo?optimizerAmmoKind(ammo):"",weaponKind=projectileWeaponKind(weapon);
        if(enablePruning && ammoKind && weaponKind && ammoKind!==weaponKind){recordInvalid("ammo-incompatible");return;}
        if(enablePruning && context.mainWeaponSkill && (!weapon || (context.mainWeaponSlot && weapon.slot!==context.mainWeaponSlot)
          || !optimizerWeaponSkillNames(weapon).includes(context.mainWeaponSkill))) {
          recordInvalid("main-weapon-mismatch");return;
        }
        diagnostics.completeConfigurationsEvaluated++;diagnostics.formalEvaluationsByDepth[slots.length]++;
        if(tieAudit){const frame=auditFrames[slots.length];
          if(frame.relation){frame.relation.formal++;frame.relation.formalByDepth[slots.length]++;tieAudit.afterFinalScoreFormal++;}
          if(frame.covered)tieAudit.coveredFormal++;}
        const evalStart=evalProfile?performance.now():0;
        const evaluation=evaluationSession
          ?evaluationSession.evaluate(selected,evalProfile)
          :contextApi().evaluate(context,selected,plan.sources,evalProfile);
        if(evalProfile)evalProfile.formalEvaluationMs=(evalProfile.formalEvaluationMs||0)+performance.now()-evalStart;
        if(!evaluation.feasible) {
          const reason=evaluation.violations.find(v=>structuralViolations.has(v));
          if(reason)recordInvalid(reason);
          return;
        }
        // A projection is only an upper bound. The official resolver certifies
        // every accepted member of the stratum, including negative/late Buffs.
        if(stratum?.kind==="residual"&&evaluation.score!==stratum.target)return;
        if(stratum?.kind==="primary"&&evaluation.score===primaryRoot)stratum.certified=true;
        const performanceKey=JSON.stringify(selectedClasses.map(cls=>[cls.representativeCandidate.slot,cls.equivalenceKey])
          .sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0));
        if(keys.has(performanceKey))return;
        if(stratum?.kind==="residual")stratum.witnessKeys.add(performanceKey);
        const topStart=evalProfile?performance.now():0;
        const accepted=heap.length<context.topK || better({rankScore:evaluation.rankScore,secondaryRankScore:evaluation.secondaryRankScore,performanceKey},heap[0]);
        if(!accepted)return;
        if(tieAudit && auditFrames[slots.length].covered)throw new Error("Optimistic tie key safety failed: covered result improved heap");
        const described=reductionApi().describeConfiguration(reduction,selectedIds);
        if(described.performanceKey!==performanceKey)throw new Error("Configuration key parity failed");
        const result={score:evaluation.score,rankScore:evaluation.rankScore,...(context.secondary?{secondaryScore:evaluation.secondaryScore,secondaryRankScore:evaluation.secondaryRankScore}:{}),
          performanceKey,equipment:described.equipment,
          candidateIds:selectedIds.slice(),metrics:evaluation.metrics,dps:evaluation.dps};
        if(heap.length<context.topK) {
          heapPush(heap,result);keys.add(result.performanceKey);diagnostics.topKUpdates++;
        } else if(better(result,heap[0])) {
          keys.delete(heap[0].performanceKey);heapReplaceRoot(heap,result);
          keys.add(result.performanceKey);diagnostics.topKUpdates++;
        }
        if(lexicographic||magicResistance||evasionResistance){const best=heap.slice().sort((a,b)=>better(a,b)?-1:1)[0],history=diagnostics.lexicographic.history,last=history.at(-1),kth=heap.length===context.topK?heap[0]:null;
          if(!last||last.bestPrimary!==best.score||last.bestSecondary!==best.secondaryScore||last.kthPrimary!==kth?.score||last.kthSecondary!==kth?.secondaryScore)
            history.push({node:diagnostics.searchNodes,ms:performance.now()-start,bestPrimary:best.score,bestSecondary:best.secondaryScore,kthPrimary:kth?.score,kthSecondary:kth?.secondaryScore});}
        if(evalProfile)evalProfile.topKMs=(evalProfile.topKMs||0)+performance.now()-topStart;
        if((potentialProof || magic || context.objective.metric==="ac") && heap.length===context.topK) {
          if(diagnostics.firstTopKFullNode===null)diagnostics.firstTopKFullNode=diagnostics.searchNodes;
          const last=diagnostics.kthScoreHistory.at(-1);
          if(!last || last.score!==heap[0].score)diagnostics.kthScoreHistory.push({node:diagnostics.searchNodes,
            formalEvaluations:diagnostics.completeConfigurationsEvaluated,score:heap[0].score});
        }
      }
      function range(proof,depth) {
        if(!proof || proof.unsupported)return null;
        let value=proof.base,minimum=proof.base,maximum=proof.base;
        for(const id of selectedIds) {
          const choice=proof.byId.get(id);
          if(!choice || choice.classification==="unknown")return null;
          value+=choice.contribution;
        }
        minimum=value;maximum=value;
        for(let i=depth;i<slots.length;i++) {
          const slot=proof.bySlot.get(slots[i]);
          if(slot.blockerCount)return null;
          minimum+=slot.minimum;maximum+=slot.maximum;
        }
        return {value,minimum,maximum};
      }
      function boundKind(depth) {
        const boundStart=searchProfile?performance.now():0;
        try {return boundKindCore(depth);}
        finally {if(searchProfile)searchProfile.boundMs+=performance.now()-boundStart;}
      }
      function magicBoundKind(depth,kthScore) {
        const d=diagnostics.magicUpperBound;
            if(magicCoupled?.supported){const r=diagnostics.magicRectangleBound,rt=performance.now();
              const rectangle=magicCoupledUpper(magic,magicCoupled,magicState,depth,selectedIds.length,true);
              r.calls++;r.totalMs+=performance.now()-rt;
              if(rectangle!==null&&rectangle+slack(rectangle,kthScore)<kthScore){r.prunes++;return "objective";}
              const c=diagnostics.magicCoupledBound,t=performance.now();
              const upper=magicCoupledUpper(magic,magicCoupled,magicState,depth,selectedIds.length);
              c.calls++;c.totalMs+=performance.now()-t;
              if(upper!==null&&upper+slack(upper,kthScore)<kthScore){c.prunes++;return "objective";}}
            const mark=performance.now();
            const result=magicUpper(magic,selectedIds,slots.slice(depth),magicSuffix?.[depth]);d.calls++;d.totalMs+=performance.now()-mark;
            if(result.upper===null){d.unknown++;diagnostics.upperBoundUnknownCount++;d.reasons[result.reason]=(d.reasons[result.reason]||0)+1;}
            else{d.known++;diagnostics.upperBoundKnownCount++;d.sum+=result.upper;
              d.minimum=d.minimum===null?result.upper:Math.min(d.minimum,result.upper);d.maximum=d.maximum===null?result.upper:Math.max(d.maximum,result.upper);
              d[result.upper<kthScore?'less':result.upper===kthScore?'equal':'greater']++;
              if(result.upper+slack(result.upper,kthScore)<kthScore)return "objective";}
            return null;
      }
      function boundKindCore(depth) {
        if(stratum) {
          const old=preparedGroup?preparedGroupPotentialUpper(preparedGroup,selectedIds,depth).upper:potentialUpper(potentialProof,selectedIds,slots.slice(depth));
          const coupled=primaryCompletionUpper(primaryCompletion,selectedIds,depth),upper=coupled===null?old:old===null?coupled:Math.min(old,coupled);
          if(stratum.kind==="primary") {
            // Only the maximum SCORE is required here; equal-score key ties
            // belong to the residual stage, which retains all alternatives.
            if(heap.length&&upper!==null&&upper<=heap[0].rankScore)return "objective";
          } else {
            if(upper!==null&&upper<stratum.target)return "objective";
            if(heap.length===context.topK) {
              if(avoid) {const secondaryUpper=avoidUpper(avoid,avoidState,depth);
                if(secondaryUpper!==null&&secondaryUpper+slack(secondaryUpper,heap[0].secondaryRankScore)<heap[0].secondaryRankScore)return "objective";}
              else if(magic&&options.lexicographicMagicBound!==false)return magicBoundKind(depth,heap[0].secondaryRankScore);
            }
            return null;
          }
        }
        if(petProof && options.boundMode!=="none"){
          const upper=global.MOEPetGrowth.upper(petProof,selectedIds,depth);
          for(const c of context.constraints)if(c.op==="gte"&&upper+slack(upper,c.value)<c.value)return "feasibility";
          if(heap.length===context.topK){const kth=heap[0];if(upper+slack(upper,kth.rankScore)<kth.rankScore)return "objective";
            if(upper===kth.rankScore){const tie=optimisticTieKey(tieKeyProof,selectedIds,depth,kth.performanceKey);if(tie&&tie.classification!=="retain")return "objective";}}
          return null;
        }
        if(!proofs)return null;
        for(const constraint of context.constraints) {
          const bound=range(proofs.get(specKey(constraint.metric)),depth);
          if(!bound)continue;
          if(diagnostics.firstConstraintBoundDepth===null)diagnostics.firstConstraintBoundDepth=depth;
          const {value,minimum,maximum}=bound;
          const eps=slack(value,minimum,maximum,constraint.value);
          if((constraint.op==="gte" && maximum+eps<constraint.value)
            || (constraint.op==="lte" && minimum-eps>constraint.value)
            || (constraint.op==="eq" && (maximum+eps<constraint.value || minimum-eps>constraint.value)))return "feasibility";
        }
        if(heap.length===context.topK) {
          if(evasionResistance){
            const d=diagnostics.lexicographic,a=diagnostics.avoidFastPath,t=performance.now();d.primaryCalls++;a.calls++;
            const upper=avoidUpper(avoid,avoidState,depth,true),ms=performance.now()-t;d.primaryMs+=ms;a.totalMs+=ms;
            if(upper===null)return null;
            if(upper+slack(upper,heap[0].rankScore)<heap[0].rankScore){d.primaryPrunes++;a.prunes++;return "objective";}
            if(upper>heap[0].rankScore){d.secondarySkippedGreater++;return null;}
            if(upper!==heap[0].rankScore||!secondaryResistance)return null;
            const st=performance.now(),s=diagnostics.resistanceFastPath;d.secondaryCalls++;s.calls++;
            const secondaryUpper=avoidUpper(secondaryResistance,resistanceState,depth),elapsed=performance.now()-st;d.secondaryMs+=elapsed;s.totalMs+=elapsed;
            if(secondaryUpper!==null&&secondaryUpper+slack(secondaryUpper,heap[0].secondaryRankScore)<heap[0].secondaryRankScore){d.secondaryPrunes++;s.prunes++;return "objective";}return null;
          }
          if(magicResistance){
            if(!magic)return null;
            const d=diagnostics.lexicographic,t=performance.now();d.primaryCalls++;
            const upper=magicPrimaryUpper(magic,magicCoupled,magicState,depth,selectedIds,slots,magicSuffix?.[depth]);
            d.primaryMs+=performance.now()-t;
            if(upper===null)return null;
            if(upper+slack(upper,heap[0].rankScore)<heap[0].rankScore){d.primaryPrunes++;return "objective";}
            if(upper>heap[0].rankScore){d.secondarySkippedGreater++;return null;}
            if(upper!==heap[0].rankScore||!avoid)return null;
            const st=performance.now(),a=diagnostics.resistanceFastPath;d.secondaryCalls++;a.calls++;
            const secondaryUpper=avoidUpper(avoid,avoidState,depth),ms=performance.now()-st;d.secondaryMs+=ms;a.totalMs+=ms;
            if(secondaryUpper!==null&&secondaryUpper+slack(secondaryUpper,heap[0].secondaryRankScore)<heap[0].secondaryRankScore){d.secondaryPrunes++;a.prunes++;return "objective";}return null;
          }
          if(avoid&&!lexicographic){const d=resistance?diagnostics.resistanceFastPath:diagnostics.avoidFastPath,t=performance.now(),upper=avoidUpper(avoid,avoidState,depth);d.calls++;d.totalMs+=performance.now()-t;if(upper!==null&&upper+slack(upper,heap[0].rankScore)<heap[0].rankScore){d.prunes++;return "objective";}return null;}
          if(lexicographic) {
            const d=diagnostics.lexicographic,t=performance.now();d.primaryCalls++;
            const compared=groupAware?(preparedGroup?preparedGroupPotentialUpper(preparedGroup,selectedIds,depth):groupPotentialUpper(potentialProof,selectedIds,slots.slice(depth))):null;
            const oldUpper=compared?.upper??potentialUpper(potentialProof,selectedIds,slots.slice(depth)),coupledUpper=primaryCompletionUpper(primaryCompletion,selectedIds,depth);
            const upper=coupledUpper===null?oldUpper:oldUpper===null?coupledUpper:Math.min(oldUpper,coupledUpper);
            d.primaryMs+=performance.now()-t;
            if(upper===null)return null;
            if(upper+slack(upper,heap[0].rankScore)<heap[0].rankScore){d.primaryPrunes++;return "objective";}
            if(upper>heap[0].rankScore){d.secondarySkippedGreater++;return null;}
            if(upper!==heap[0].rankScore)return null;
            if(avoid){const mt=performance.now(),a=diagnostics.avoidFastPath;d.secondaryCalls++;a.calls++;const secondaryUpper=avoidUpper(avoid,avoidState,depth);const elapsed=performance.now()-mt;d.secondaryMs+=elapsed;a.totalMs+=elapsed;
              if(secondaryUpper!==null&&secondaryUpper+slack(secondaryUpper,heap[0].secondaryRankScore)<heap[0].secondaryRankScore){d.secondaryPrunes++;a.prunes++;return "objective";}return null;}
            if(!magic || options.lexicographicMagicBound===false)return null;
            const mt=performance.now();d.secondaryCalls++;const result=magicBoundKind(depth,heap[0].secondaryRankScore);
            d.secondaryMs+=performance.now()-mt;if(result)d.secondaryPrunes++;return result;
          }
          if(magic)return magicBoundKind(depth,heap[0].rankScore);
          if(potentialProof) {
            const potentialStart=potentialProfile?performance.now():0;
            const sampled=potentialProfile && potentialProfile.calls%100===0;
            const compared=groupAware?(preparedGroup
              ?preparedGroupPotentialUpper(preparedGroup,selectedIds,depth,sampled?potentialProfile.stages:null)
              :sampled
              ?profileGroupPotentialUpper(potentialProof,selectedIds,slots.slice(depth),potentialProfile.stages)
              :groupPotentialUpper(potentialProof,selectedIds,slots.slice(depth))):null;
            const sumUpper=compared?.sumUpper??potentialUpper(potentialProof,selectedIds,slots.slice(depth));
            const upper=compared?.upper??sumUpper;
            if(potentialProfile){potentialProfile.calls++;potentialProfile.callsByDepth[depth]++;
              potentialProfile.totalMs+=performance.now()-potentialStart;}
            if(tieAudit && upper!==null) {
              const frame=auditFrames[depth];
              if(heap[0].score===205) {
                if(tieAudit.startedNode===null)tieAudit.startedNode=diagnostics.searchNodes;
                const relation=upper<205?tieAudit.less:upper===205?tieAudit.equal:tieAudit.greater;
                frame.relation=relation;relation.nodes++;relation.byDepth[depth]++;tieAudit.afterFinalScoreNodes++;
              }
              if(upper===heap[0].rankScore) {
                tieAudit.equalChecks++;const keyStart=performance.now();
                const keyBound=optimisticTieKey(tieKeyProof,selectedIds,depth,heap[0].performanceKey);
                tieAudit.keyBoundMs+=performance.now()-keyStart;
                if(!keyBound)tieAudit.unknown++;
                else if(keyBound.classification==="retain")tieAudit.retained++;
                else {
                  tieAudit.safePrunable++;tieAudit[keyBound.classification==="prefix-only"?"prefixOnly":"suffixBound"]++;
                  if(keyBound.sameKey)tieAudit.sameKey++;
                  if(!frame.covered){tieAudit.prunableRoots++;frame.covered=true;}
                }
                if(frame.relation===tieAudit.equal){const post=tieAudit.afterFinalKey;post.checks++;
                  if(!keyBound)post.unknown++;else if(keyBound.classification==="retain")post.retained++;
                  else{post.safePrunable++;post[keyBound.classification==="prefix-only"?"prefixOnly":"suffixBound"]++;
                    if(keyBound.sameKey)post.sameKey++;}}
              }
            }
            if(upper===null)diagnostics.upperBoundUnknownCount++;
            else {
              if(groupAware){diagnostics.groupAwareBoundUseCount++;
                if(upper<sumUpper)diagnostics.groupAwareReductionCount++;}
              const summary=diagnostics.upperBoundSummary;
              summary.count++;summary.sumUpperTotal+=sumUpper;summary.usedUpperTotal+=upper;summary.reductionTotal+=sumUpper-upper;
              summary.sumAverage=summary.sumUpperTotal/summary.count;summary.usedAverage=summary.usedUpperTotal/summary.count;
              summary.averageReduction=summary.reductionTotal/summary.count;
              summary.minimum=summary.minimum===null?upper:Math.min(summary.minimum,upper);
              summary.maximum=summary.maximum===null?upper:Math.max(summary.maximum,upper);
              summary.distribution[upper<100?"below100":upper<150?"from100to149":upper<200?"from150to199":"atLeast200"]++;
              diagnostics.upperBoundKnownCount++;diagnostics.optimisticBoundUseCount++;
              if(diagnostics.firstObjectiveBoundDepth===null)diagnostics.firstObjectiveBoundDepth=depth;
              // Equality must remain searchable for the configuration-key tie order.
              if(upper+slack(upper,heap[0].rankScore)<heap[0].rankScore) {
                diagnostics.optimisticObjectivePrunedNodes++;return "objective";
              }
              if(tiePruningEnabled && upper===heap[0].rankScore) {
                diagnostics.tieKeyChecks++;const keyStart=performance.now();
                const keyBound=optimisticTieKey(tieKeyProof,selectedIds,depth,heap[0].performanceKey);
                diagnostics.tieKeyMs+=performance.now()-keyStart;
                if(!keyBound)diagnostics.tieKeyUnknown++;
                else if(keyBound.classification==="retain")diagnostics.tieKeyRetained++;
                else {
                  diagnostics[keyBound.classification==="prefix-only"?"tiePrefixPrunes":"tieSuffixPrunes"]++;
                  if(keyBound.sameKey)diagnostics.tieSameKeyPrunes++;
                  return "tie";
                }
              }
            }
            return null;
          }
          const bound=range(proofs.get(specKey(context.objective)),depth);
          if(context.objective.metric==="ac") {
            const timing=performance.now(),d=diagnostics.acUpperBound;d.calls++;
            const groupResult=bound?null:acSuffix?acPreparedUpper(acGroups,selectedIds,acSuffix.suffix[depth],diagnostics.acBoundProfile):
              acGroupUpper(acGroups,selectedIds,slots.slice(depth),diagnostics.acBoundProfile);
            if(options.acGroupDryRun){if(bound||(groupResult?.upper!==null&&groupResult?.upper!==undefined))d.dryKnown++;else d.dryUnknown++;}
            const relaxed=bound?null:!options.acGroupDryRun&&acGroups?groupResult:
              acPercentageUpper(acProof,selectedIds,slots.slice(depth));
            const upper=bound?.maximum??relaxed?.upper;
            d.totalMs+=performance.now()-timing;
            if(upper===null || upper===undefined){d.unknown++;d.unknownByDepth[depth]++;
              diagnostics.upperBoundUnknownCount++;
              const reason=relaxed?.reason||"unknown";d.reasons[reason]=(d.reasons[reason]||0)+1;
              if(reason.includes("group") || reason.includes("stack") || reason==="remaining-blocker")d.groupFallback++;
            }else{d.known++;if(bound)d.additiveUses++;else {
                if(!acGroups||options.acGroupDryRun||relaxed.usesPercentage)d.percentageUses++;
                if(acGroups&&!options.acGroupDryRun&&relaxed.usesGroups)d.groupUses++;
                if(acGroups&&!options.acGroupDryRun&&relaxed.usesGroups&&relaxed.usesPercentage)d.groupPercentageUses++;
              }
              diagnostics.upperBoundKnownCount++;
              if(diagnostics.firstObjectiveBoundDepth===null)diagnostics.firstObjectiveBoundDepth=depth;
              if(!bound && upper+slack(upper,heap[0].rankScore)<heap[0].rankScore)return "objective";
            }
          }
          if(context.objective.metric==="skillPlus") {
            if(bound)diagnostics.upperBoundKnownCount++;
            else diagnostics.upperBoundUnknownCount++;
          }
          if(bound) {
            if(diagnostics.firstObjectiveBoundDepth===null)diagnostics.firstObjectiveBoundDepth=depth;
            const {value,minimum,maximum}=bound;
            const optimistic=context.objective.direction==="min"
              ? -minimum : maximum;
            if(optimistic+slack(value,optimistic,heap[0].rankScore)<heap[0].rankScore)return "objective";
          }
        }
        return null;
      }
      function choicePriority(cls) {
        if(!proofs)return [0,0];
        const id=cls?.representativeCandidateId;
        const specs=[context.objective,...context.constraints.map(c=>c.metric)];
        let unknown=0,gain=0;
        for(const spec of specs) {
          const proof=proofs.get(specKey(spec));if(!proof || proof.unsupported)continue;
          const choice=id?proof.byId.get(id):{classification:"provenAdditive",contribution:0};
          if(!choice || choice.classification==="unknown"){unknown++;continue;}
          const constraint=context.constraints.find(c=>specKey(c.metric)===specKey(spec));
          const direction=constraint?(constraint.op==="lte"?-1:1):(spec.direction==="min"?-1:1);
          gain+=direction*choice.contribution;
        }
        return [unknown,-gain];
      }
      const choicesBySlot=new Map(slots.map(slot=>{
        const choices=[...groups.get(slot),null];
        if(options.candidateOrder==="potential" && potentialProof)choices.sort((a,b)=>
          (b?potentialProof.byId.get(b.representativeCandidateId):0)-(a?potentialProof.byId.get(a.representativeCandidateId):0)
          ||String(a?.representativeCandidateId||"").localeCompare(String(b?.representativeCandidateId||"")));
        else if(options.slotOrder==="blockers" || options.slotOrder==="impact")choices.sort((a,b)=>{
          const x=choicePriority(a),y=choicePriority(b);
          return x[0]-y[0]||x[1]-y[1]||String(a?.representativeCandidateId||"").localeCompare(String(b?.representativeCandidateId||""));
        });
        if(petProof)choices.sort((a,b)=>(petProof.byId.get(b?.representativeCandidateId)?.multiplier||1)-(petProof.byId.get(a?.representativeCandidateId)?.multiplier||1)||(a?.equivalenceKey||"~").localeCompare(b?.equivalenceKey||"~"));
        if(magicOrdering)choices.sort((a,b)=>(lexicographic?(b?potentialProof.byId.get(b.representativeCandidateId):0)-(a?potentialProof.byId.get(a.representativeCandidateId):0):0)||magicOrdering.values.get(b?.representativeCandidateId||"null:"+slot)-magicOrdering.values.get(a?.representativeCandidateId||"null:"+slot));
        return [slot,choices];
      }));
      diagnostics.candidateCountsByDepth=slots.map(slot=>({slot,classes:groups.get(slot).length,
        choices:fixedBySlot.has(slot)?1:choicesBySlot.get(slot).length}));
      const primaryRoot=(lexicographic||stratum?.kind==="primary")&&potentialProof?Math.min(groupPotentialUpper(potentialProof,[],slots).upper,primaryCompletionUpper(primaryCompletion,[],0)??Infinity):null;
      diagnostics.lexicographic.rootPrimaryUpper=primaryRoot;
      function discoveryChoices(choices,depth) {
        const resistanceGain=c=>{if(!c||!secondaryResistance)return 0;const v=secondaryResistance.byId.get(c.representativeCandidateId);return (secondaryResistance.base+v.flat)*(1+v.pct/100);};
        if(avoid?.supported){const target=Math.sqrt((1+avoidState.pct/100)/Math.max(1,avoid.base+avoidState.flat)),j=avoid.scales.reduce((best,t,i)=>Math.abs(Math.log(t/target))<Math.abs(Math.log(avoid.scales[best]/target))?i:best,0),width=avoid.scales.length;const gain=c=>{if(!c)return 0;const v=avoid.byId.get(c.representativeCandidateId).compiled;let n=v.values[j];for(const g of v.grouped)n+=Math.max(0,g.values[j]-avoidState.groups[g.index*width+j]);return n;};return choices.slice().sort((a,b)=>(lexicographic?(b?potentialProof.byId.get(b.representativeCandidateId):0)-(a?potentialProof.byId.get(a.representativeCandidateId):0):0)||(magicResistance&&magicOrdering?magicOrdering.values.get(b?.representativeCandidateId||"null:"+slots[depth])-magicOrdering.values.get(a?.representativeCandidateId||"null:"+slots[depth]):0)||gain(b)-gain(a)||(evasionResistance&&secondaryResistance?resistanceGain(b)-resistanceGain(a):0));}
        if(!lexicographic || (heap.length===context.topK && heap[0].rankScore===primaryRoot))return choices;
        const maxima=new Map();
        for(const source of [...potentialProof.fixedSources,...selectedIds.flatMap(id=>potentialProof.sourcesById.get(id))])
          if(source.bucket)maxima.set(source.bucket,Math.max(maxima.get(source.bucket)||0,source.potential));
        const gain=c=>c?potentialProof.sourcesById.get(c.representativeCandidateId).reduce((n,s)=>n+(s.bucket?Math.max(0,s.potential-(maxima.get(s.bucket)||0)):s.potential),0):0;
        const upper=c=>primaryCompletion?primaryCompletionUpper(primaryCompletion,c?[...selectedIds,c.representativeCandidateId]:selectedIds,depth+1):preparedGroup?preparedGroupPotentialUpper(preparedGroup,c?[...selectedIds,c.representativeCandidateId]:selectedIds,depth+1).upper:groupPotentialUpper(potentialProof,c?[...selectedIds,c.representativeCandidateId]:selectedIds,slots.slice(depth+1)).upper;
        const values=new Map(choices.map(c=>[c,{upper:upper(c),gain:gain(c)}]));
        return choices.slice().sort((a,b)=>values.get(b).upper-values.get(a).upper||values.get(b).gain-values.get(a).gain);
      }
      const dfs=tieAudit?function(depth) {
        const start=performance.now(),frame={childrenMs:0,relation:null,covered:depth>0 && auditFrames[depth-1].covered};
        auditFrames[depth]=frame;
        try{return dfsCore(depth);}finally {
          const elapsed=performance.now()-start;
          if(frame.relation){frame.relation.exclusiveMs+=elapsed-frame.childrenMs;frame.relation.subtreeMs+=elapsed;}
          if(depth>0)auditFrames[depth-1].childrenMs+=elapsed;
        }
      }:dfsCore;
      function dfsCore(depth) {
        if(stratum?.certified||stratum?.unsupported)return;
        diagnostics.searchNodes++;diagnostics.nodesByDepth[depth]++;
        if(options.onProgress && Number.isInteger(options.progressEvery) && options.progressEvery>0
          && diagnostics.searchNodes%options.progressEvery===0)options.onProgress(snapshot(depth));
        if(enablePruning) {
          const kind=boundKind(depth);
          if(tieAudit && auditFrames[depth].covered)tieAudit.coveredNodes++;
          if(kind==="tie"){diagnostics.tiePrunedNodes++;diagnostics.tiePrunesByDepth[depth]++;return;}
          if(kind) {diagnostics[kind==="feasibility"?"feasibilityPrunedNodes":"boundPrunedNodes"]++;
            if(tieAudit && kind==="objective" && auditFrames[depth].relation){auditFrames[depth].relation.objectivePrunes++;tieAudit.afterFinalScorePrunes++;}
            diagnostics[kind==="feasibility"?"feasibilityPrunesByDepth":"boundPrunesByDepth"][depth]++;return;}
        }
        if(depth===slots.length){consider();return;}
        if(tieAudit && auditFrames[depth].relation){auditFrames[depth].relation.expanded++;auditFrames[depth].relation.expandedByDepth[depth]++;}
        const slot=slots[depth],fixed=fixedBySlot.get(slot);
        const choices=discoveryChoices(fixed?groups.get(slot).filter(cls=>cls.representativeCandidateId===fixed):choicesBySlot.get(slot),depth);
        for(const cls of choices) {
          if(enablePruning && context.mainWeaponSkill && slot===context.mainWeaponSlot) {
            const row=cls&&rows.get(cls.representativeCandidateId);
            if(!row || !weaponRowHasCalcData(row) || !optimizerWeaponSkillNames(row).includes(context.mainWeaponSkill)) {
              diagnostics.feasibilityPrunedNodes++;diagnostics.feasibilityPrunesByDepth[depth]++;continue;
            }
          }
          if(!cls){dfs(depth+1);continue;}
          const invalidStart=searchProfile?performance.now():0;
          const invalid=enablePruning && invalidNext(cls);
          if(searchProfile)searchProfile.invalidNextMs+=performance.now()-invalidStart;
          if(invalid){recordInvalid("hand-or-conflict");continue;}
          const candidate=cls.representativeCandidate,row=rows.get(candidate.candidateId),added=conflicts.get(candidate.candidateId);
          selected.push(candidate);selectedClasses.push(cls);selectedRows.push(row);selectedIds.push(candidate.candidateId);
          for(const key of added)activeConflictKeys.add(key);
          const parentAvoid=avoidState;if(avoid)avoidState=avoidChild(avoid,avoidState,candidate.candidateId);const parentResistance=resistanceState;if(secondaryResistance)resistanceState=avoidChild(secondaryResistance,resistanceState,candidate.candidateId);
          const parentMagic=magicState,v=magicCoupled?.byId.get(candidate.candidateId);
          if(v)magicState={flat:parentMagic.flat+v.flat,log:parentMagic.log+v.log};
          dfs(depth+1);
          magicState=parentMagic;avoidState=parentAvoid;resistanceState=parentResistance;
          for(const key of added)activeConflictKeys.delete(key);
          selected.pop();selectedClasses.pop();selectedRows.pop();selectedIds.pop();
        }
      }
      function* cooperativeDFS(depth) {
        if(options.signal?.aborted||stratum?.certified||stratum?.unsupported)return;
        if(diagnostics.searchNodes%64===0)yield snapshot(depth);
        diagnostics.searchNodes++;diagnostics.nodesByDepth[depth]++;
        if(options.onProgress && Number.isInteger(options.progressEvery) && options.progressEvery>0
          && diagnostics.searchNodes%options.progressEvery===0)options.onProgress(snapshot(depth));
        if(enablePruning) {
          const kind=boundKind(depth);
          if(tieAudit && auditFrames[depth].covered)tieAudit.coveredNodes++;
          if(kind==="tie"){diagnostics.tiePrunedNodes++;diagnostics.tiePrunesByDepth[depth]++;return;}
          if(kind) {diagnostics[kind==="feasibility"?"feasibilityPrunedNodes":"boundPrunedNodes"]++;
            if(tieAudit && kind==="objective" && auditFrames[depth].relation){auditFrames[depth].relation.objectivePrunes++;tieAudit.afterFinalScorePrunes++;}
            diagnostics[kind==="feasibility"?"feasibilityPrunesByDepth":"boundPrunesByDepth"][depth]++;return;}
        }
        if(depth===slots.length){consider();return;}
        if(tieAudit && auditFrames[depth].relation){auditFrames[depth].relation.expanded++;auditFrames[depth].relation.expandedByDepth[depth]++;}
        const slot=slots[depth],fixed=fixedBySlot.get(slot);
        const choices=discoveryChoices(fixed?groups.get(slot).filter(cls=>cls.representativeCandidateId===fixed):choicesBySlot.get(slot),depth);
        for(const cls of choices) {
          if(enablePruning && context.mainWeaponSkill && slot===context.mainWeaponSlot) {
            const row=cls&&rows.get(cls.representativeCandidateId);
            if(!row || !weaponRowHasCalcData(row) || !optimizerWeaponSkillNames(row).includes(context.mainWeaponSkill)) {
              diagnostics.feasibilityPrunedNodes++;diagnostics.feasibilityPrunesByDepth[depth]++;continue;
            }
          }
          if(!cls){yield* cooperativeDFS(depth+1);continue;}
          const invalidStart=searchProfile?performance.now():0;
          const invalid=enablePruning && invalidNext(cls);
          if(searchProfile)searchProfile.invalidNextMs+=performance.now()-invalidStart;
          if(invalid){recordInvalid("hand-or-conflict");continue;}
          const candidate=cls.representativeCandidate,row=rows.get(candidate.candidateId),added=conflicts.get(candidate.candidateId);
          selected.push(candidate);selectedClasses.push(cls);selectedRows.push(row);selectedIds.push(candidate.candidateId);
          for(const key of added)activeConflictKeys.add(key);
          const parentAvoid=avoidState;if(avoid)avoidState=avoidChild(avoid,avoidState,candidate.candidateId);const parentResistance=resistanceState;if(secondaryResistance)resistanceState=avoidChild(secondaryResistance,resistanceState,candidate.candidateId);
          const parentMagic=magicState,v=magicCoupled?.byId.get(candidate.candidateId);
          if(v)magicState={flat:parentMagic.flat+v.flat,log:parentMagic.log+v.log};
          yield* cooperativeDFS(depth+1);
          magicState=parentMagic;avoidState=parentAvoid;resistanceState=parentResistance;
          for(const key of added)activeConflictKeys.delete(key);
          selected.pop();selectedClasses.pop();selectedRows.pop();selectedIds.pop();
        }
      }
      if(options.cooperative) {
        if(tieAudit)throw new Error("Cooperative diagnostic tie audit is unsupported");
        const iterator=cooperativeDFS(0);let closed=false;
        const finish=()=>{evaluationSession?.dispose();      diagnostics.elapsedMs=performance.now()-start;diagnostics.exact=!options.signal?.aborted;
      diagnostics.finalKthScoreReachedNode=diagnostics.kthScoreHistory.at(-1)?.node??null;
      diagnostics.cacheHitCount=evaluationSession?.diagnostics.evaluationCacheHitCount||0;
      diagnostics.formalEvaluationAverageMs=evalProfile && diagnostics.completeConfigurationsEvaluated
        ?(evalProfile.formalEvaluationMs||0)/diagnostics.completeConfigurationsEvaluated:null;
      diagnostics.computeMetricsAverageMs=evalProfile && diagnostics.completeConfigurationsEvaluated
        ?(evalProfile.computeMetricsMs||0)/diagnostics.completeConfigurationsEvaluated:null;
      return {results:heap.sort((a,b)=>better(a,b)?-1:better(b,a)?1:0),diagnostics};}
        return {step:()=>contextApi().withRuntime(context,()=>{
          if(closed)throw new Error("Search already finished");
          try {if(options.signal?.aborted){iterator.return();closed=true;return {done:true,value:finish()};}const next=iterator.next();if(next.done){closed=true;return {done:true,value:finish()};}return next;}
          catch(error){closed=true;iterator.return();evaluationSession?.dispose();throw error;}
        }),close:()=>{if(!closed){closed=true;iterator.return();evaluationSession?.dispose();}}};
      }
      const dfsStart=performance.now();
      try {dfs(0);} finally {
        if(searchProfile)searchProfile.dfsMs=performance.now()-dfsStart;
        evaluationSession?.dispose();
      }
      diagnostics.elapsedMs=performance.now()-start;diagnostics.exact=true;
      diagnostics.finalKthScoreReachedNode=diagnostics.kthScoreHistory.at(-1)?.node??null;
      diagnostics.cacheHitCount=evaluationSession?.diagnostics.evaluationCacheHitCount||0;
      diagnostics.formalEvaluationAverageMs=evalProfile && diagnostics.completeConfigurationsEvaluated
        ?(evalProfile.formalEvaluationMs||0)/diagnostics.completeConfigurationsEvaluated:null;
      diagnostics.computeMetricsAverageMs=evalProfile && diagnostics.completeConfigurationsEvaluated
        ?(evalProfile.computeMetricsMs||0)/diagnostics.completeConfigurationsEvaluated:null;
      return {results:heap.sort((a,b)=>better(a,b)?-1:better(b,a)?1:0),diagnostics};
    });
  }
  // Condition each candidate on an optimistic slot + certified-clique
  // completion. UB < P is an impossibility proof; UB >= P is NOT a witness.
  // Unknown cases, conflict bridges and every equivalence identity stay intact.
  function primaryResidual(reduction,proof,target,completionTemplate) {
    const started=performance.now(),slots=reduction.context.slots,keep=new Set(),counts=[];
    const fixed=reduction.context.fixedCandidateIds;
    for(const slot of slots) {
      const remaining=slots.filter(s=>s!==slot),completion=preparePrimaryCompletion(proof,remaining,completionTemplate);
      const fixedElsewhere=fixed.filter(id=>reduction.candidates.find(c=>c.candidateId===id)?.slot!==slot);
      const candidates=reduction.candidates.filter(c=>c.slot===slot);
      for(const c of candidates) {
        const ids=[...fixedElsewhere,c.candidateId],old=groupPotentialUpper(proof,ids,remaining).upper,coupled=primaryCompletionUpper(completion,ids,0);
        const upper=coupled===null?old:old===null?coupled:Math.min(old,coupled);
        if(upper===null||upper>=target)keep.add(c.candidateId);
      }
      counts.push({slot,before:candidates.length,after:candidates.filter(c=>keep.has(c.candidateId)).length});
    }
    const candidates=reduction.candidates.filter(c=>keep.has(c.candidateId));
    const residual={...reduction,candidates,contextEquivalentClasses:reduction.contextEquivalentClasses.filter(c=>keep.has(c.representativeCandidateId))};
    // Reuse the primary stage's row/source/clique objects. Only residual slot
    // lists/maxima and the suffix for the secondary slot order are rebuilt.
    const residualProof={...proof,
      sourceListsBySlot:new Map(slots.map(s=>[s,candidates.filter(c=>c.slot===s).map(c=>proof.sourcesById.get(c.candidateId))])),
      bySlot:new Map(slots.map(s=>[s,Math.max(0,...candidates.filter(c=>c.slot===s).map(c=>proof.byId.get(c.candidateId)))]))};
    return {reduction:residual,proof:residualProof,counts,elapsedMs:performance.now()-started};
  }
  function run(reduction,options={}) {
    const eligible=lexicographicScope(reduction.context)&&options.primaryStrataFastPath!==false
      &&options.enablePruning!==false&&options.boundMode===undefined
      &&options.lexicographicFastPath!==false&&options.skillPlusFastPath!==false
      &&options.skillPlusOptimisticBound!==false&&options.skillPlusGroupAwareBound!==false
      &&options.lexicographicMatchingBound!==false&&!options.skillPlusTieAudit;
    if(!eligible)return runCore(reduction,options);
    const started=performance.now(),metadata={enabled:true,primaryMaximum:null,primaryMaximumExact:false,
      primaryMs:0,residualBuildMs:0,secondaryMs:0,originalClasses:reduction.candidates.length,residualClasses:null,
      P0DistinctLowerBound:0,P0CountExact:false,reusedPrimaryProof:true,fallbackReason:null};
    let active=null,closed=false;
    function* stages() {
      function* search(r,o,stage=null) {
        active=runCore(r,{...o,cooperative:true},stage);
        for(;;){const q=active.step();if(q.done){active=null;return q.value;}yield q.value;}
      }
      const c=reduction.context,{schemaVersion,model,observations,legacyDominance,...primaryOptions}=c;
      const primaryContext=contextApi().create({...primaryOptions,secondary:null,topK:1});
      const primaryStage={kind:"primary",proof:null,certified:false,unsupported:false},primaryStart=performance.now();
      const primary=yield* search({...reduction,context:primaryContext},{...options,candidateOrder:"potential"},primaryStage);
      metadata.primaryMs=performance.now()-primaryStart;
      metadata.primaryNodes=primary.diagnostics.searchNodes;metadata.primaryFormalEvaluations=primary.diagnostics.completeConfigurationsEvaluated;
      const target=primary.results[0]?.score;metadata.primaryMaximum=target??null;
      metadata.primaryMaximumExact=primary.diagnostics.exact&&!primaryStage.unsupported&&target!==undefined;
      let result;
      if(!metadata.primaryMaximumExact||target===undefined) {
        metadata.fallbackReason=options.signal?.aborted?"aborted-primary":"unproved-primary";
        result=yield* search(reduction,options);
      } else {
        const residual=primaryResidual(reduction,primaryStage.proof,target,primaryStage.completion);
        metadata.residualBuildMs=residual.elapsedMs;metadata.residualClasses=residual.reduction.candidates.length;metadata.slotCounts=residual.counts;
        const residualStage={kind:"residual",target,proof:residual.proof,completionTemplate:primaryStage.completion,witnessKeys:new Set()},secondaryStart=performance.now();
        result=yield* search(residual.reduction,options,residualStage);
        metadata.secondaryMs=performance.now()-secondaryStart;metadata.P0DistinctLowerBound=residualStage.witnessKeys.size;
        metadata.secondaryNodes=result.diagnostics.searchNodes;metadata.secondaryFormalEvaluations=result.diagnostics.completeConfigurationsEvaluated;
        metadata.P0CountExact=result.diagnostics.exact&&result.results.length<c.topK;
        if(result.diagnostics.exact&&result.results.length<c.topK) {
          // P1/P2 are deliberately not implemented. Preserve global Top-K
          // semantics by completing the original lexicographic search instead.
          metadata.fallbackReason="P0-below-K";result=yield* search(reduction,options);
        }
      }
      result.diagnostics.primaryStrata=metadata;result.diagnostics.elapsedMs=performance.now()-started;
      return result;
    }
    const iterator=stages(),controller={step(){if(closed)throw new Error("Search already finished");
      try{const q=iterator.next();if(q.done)closed=true;return q;}catch(error){closed=true;active?.close();iterator.return();throw error;}},
      close(){if(!closed){closed=true;active?.close();iterator.return();}}};
    if(options.cooperative)return controller;
    try{for(;;){const q=controller.step();if(q.done)return q.value;}}finally{controller.close();}
  }
  // Magic reads equipment.magic + flat(target=magic), then sequential
  // percent rows. Conversions consume magic but never write stats.magic.
  // Keep both signs and optional sources: group/latest resolution can remove
  // any Buff row. One certified exclusive key per source avoids unsafe dedup.
  // Evasion and resistance have ADDITIVE percentages, unlike magic's sequential factors.
  // Each bound vector includes one candidate's body and optional positive Buffs.
  function prepareAvoid(plan,ordering=false,secondary=false) {
    // Both paths have the audited formal (baseline + flat) * (1 + pct / 100)
    // structure. Resistance never inherits the evasion-only forced override.
    const c=plan.context,combined=lexicographicScope(c)&&c.secondary.metric==="avoid",magicResistance=magicResistanceScope(c),evasionResistance=evasionResistanceScope(c),metric=combined?"avoid":magicResistance||evasionResistance&&secondary?"resistance":c.objective.metric;if(!["avoid","resistance"].includes(metric)||c.objective.direction!=="max"||c.secondary&&!combined&&!magicResistance&&!evasionResistance||c.constraints.length||c.mainWeaponSkill||c.mainWeaponSlot)return null;
    const flatField=metric==="avoid"?"extraAvoid":"extra"+(magicResistance||evasionResistance?c.secondary.element:c.objective.element)+"Res",pctField=flatField+"Pct",baseline=skillSimDerived()[metric==="avoid"?"avoid":"resist"];
    const started=performance.now(),scales=Array.from({length:65},(_,i)=>Math.pow(2,i/4-8)),sources=[],byId=new Map();
    let supported=true,forced=-Infinity,absoluteFlat=Math.abs(baseline),absolutePct=0,negativeFixed=0,integerFlat=Number.isSafeInteger(baseline);
    const extra=(row,mode)=>{const e=emptyExtraStats();addExtraStatsInto(e,row,mode);const flat=e[flatField],pct=e[pctField];
      if(!Number.isFinite(flat)||!Number.isFinite(pct))supported=false;absoluteFlat+=Math.abs(flat);absolutePct+=Math.abs(pct);integerFlat=integerFlat&&Number.isSafeInteger(flat);return {flat:Math.max(0,flat),pct:Math.max(0,pct),negative:Math.min(0,pct),hasPercentage:pct!==0};};
    const source=(row,stack="",slot="__fixed")=>{const v=extra(row,"buff"),keys=resolveAllBuffRowsForGroups({composite:[row]}).groups.map(g=>"group:"+g.group.toLowerCase());
      if(stack)keys.push("stack:"+stack);if(metric==="avoid"&&Number.isFinite(row.forcedEvasion))forced=Math.max(forced,row.forcedEvasion);
      const x={...v,keys,slot,bucket:null};sources.push(x);return x;};
    const fixedRows=normalizeCompositeRows(expandSkillSimMasteryBuffState(c.baseState).composite).filter(r=>r.enabled&&!r.excluded),fixed=fixedRows.map(r=>source(r));
    for(const x of fixed)negativeFixed+=x.negative;
    for(const cls of plan.classes){const id=cls.representativeCandidateId,row=plan.rows.get(id),body=extra(row,"base"),resolved=resolveEquipmentBuffRowsForSameTechnic([row]),buffs=normalizeCompositeRows(resolved.map(equipmentBuffToCompositeRow)).filter(r=>r.enabled&&!r.excluded),stack=resolved.length===1&&buffs.length===1?equipmentBuffStackKey(resolved[0]):"";
      const list=buffs.map(r=>source(r,stack,row.slot));byId.set(id,{body,sources:list,hasPercentage:body.hasPercentage||list.some(x=>x.hasPercentage),flat:body.flat+list.reduce((n,x)=>n+x.flat,0),pct:body.pct+list.reduce((n,x)=>n+x.pct,0),negative:body.negative+list.reduce((n,x)=>n+x.negative,0)});}
    const minimumPct=negativeFixed+[...plan.groups.values()].reduce((n,classes)=>n+Math.min(0,...classes.map(x=>byId.get(x.representativeCandidateId).negative)),0);
    if(minimumPct < -100)supported=false; // Negative total factor needs a different interval proof.
    const membership=new Map();for(const x of sources)for(const key of x.keys){if(!membership.has(key))membership.set(key,new Set());membership.get(key).add(x.slot);}
    for(const x of sources)x.bucket=x.keys.filter(k=>membership.get(k).size>1).sort((a,b)=>membership.get(b).size-membership.get(a).size||(a<b?-1:1))[0]||null;
    const buckets=[...new Set(sources.map(x=>x.bucket).filter(Boolean))],indexes=new Map(buckets.map((x,i)=>[x,i])),width=scales.length;
    const linear=v=>Float64Array.from(scales,t=>t*v.flat+v.pct/(100*t));
    const compile=(body,list)=>{const fallback={flat:body.flat,pct:body.pct},grouped=[];
      for(const x of list)if(x.bucket)grouped.push({index:indexes.get(x.bucket),values:linear(x)});else{fallback.flat+=x.flat;fallback.pct+=x.pct;}
      return {fallback,values:linear(fallback),grouped};};
    const fixedProjection=compile({flat:0,pct:0},fixed),fixedFlat=fixed.reduce((n,x)=>n+x.flat,0),fixedPct=fixed.reduce((n,x)=>n+x.pct,0);
    for(const v of byId.values()){v.full=linear(v);v.compiled=compile(v.body,v.sources);}
    if(ordering){const primary=combined?(plan.primaryProof||skillPotentialProof(plan)):null;const value=slot=>Math.max(0,...plan.groups.get(slot).map(c=>{const v=byId.get(c.representativeCandidateId);return (Math.max(0,baseline)+v.flat)*(1+v.pct/100);}));plan.slots.sort((a,b)=>(primary?primary.bySlot.get(b)-primary.bySlot.get(a):0)||value(b)-value(a)||plan.groups.get(a).length-plan.groups.get(b).length);}
    const slots=plan.slots,frontiers=new Map(),suffix=Array(slots.length+1),fallbackSuffix=Array(slots.length+1),groupSuffix=Array(slots.length+1),suffixFlat=new Float64Array(slots.length+1),suffixPct=new Float64Array(slots.length+1),suffixHasPercentage=new Uint8Array(slots.length+1);
    suffix[slots.length]=new Float64Array(width);fallbackSuffix[slots.length]=new Float64Array(width);groupSuffix[slots.length]=new Float64Array(width*buckets.length);
    for(let i=slots.length-1;i>=0;i--){const options=[{flat:0,pct:0},...plan.groups.get(slots[i]).map(c=>byId.get(c.representativeCandidateId))],unique=[...new Map(options.map(v=>[v.flat+":"+v.pct,v])).values()],frontier=unique.filter(v=>!unique.some(w=>w!==v&&w.flat>=v.flat&&w.pct>=v.pct));frontiers.set(slots[i],frontier);suffixHasPercentage[i]=suffixHasPercentage[i+1]||options.some(v=>v.hasPercentage);
      suffix[i]=suffix[i+1].slice();fallbackSuffix[i]=fallbackSuffix[i+1].slice();groupSuffix[i]=groupSuffix[i+1].slice();suffixFlat[i]=suffixFlat[i+1]+Math.max(...options.map(v=>v.flat));suffixPct[i]=suffixPct[i+1]+Math.max(...options.map(v=>v.pct));
      for(let j=0;j<width;j++)suffix[i][j]+=Math.max(0,...frontier.map(v=>scales[j]*v.flat+v.pct/(100*scales[j])));
      for(let j=0;j<width;j++){let maximum=0;for(const cls of plan.groups.get(slots[i])){const v=byId.get(cls.representativeCandidateId).compiled;maximum=Math.max(maximum,v.values[j]);for(const g of v.grouped){const k=g.index*width+j;groupSuffix[i][k]=Math.max(groupSuffix[i][k],g.values[j]);}}fallbackSuffix[i][j]+=maximum;}}
    const initial={flat:fixedFlat,pct:fixedPct,hasPercentage:fixed.some(x=>x.hasPercentage),fallback:fixedProjection.fallback,groups:new Float64Array(width*buckets.length)};
    for(const g of fixedProjection.grouped)for(let j=0;j<width;j++)initial.groups[g.index*width+j]=Math.max(initial.groups[g.index*width+j],g.values[j]);
    const base=Math.max(0,baseline),margin=Number.EPSILON*8192*(sources.length+slots.length*8+64)*(1+absoluteFlat)*(1+absolutePct/100)**2;
    if(!Number.isFinite(base)||!Number.isFinite(margin)||!Number.isFinite((1+absoluteFlat)*(1+absolutePct/100)*128))supported=false;
    return {supported,base,forced,byId,initial,scales,suffix,fallbackSuffix,groupSuffix,suffixFlat,suffixPct,frontiers,buckets,margin,suffixHasPercentage,integerFlat:integerFlat&&absoluteFlat<Number.MAX_SAFE_INTEGER/4,prepareMs:performance.now()-started};
  }
  function avoidChild(proof,state,id) {
    const v=proof.byId.get(id),groups=state.groups.slice(),width=proof.scales.length;
    for(const g of v.compiled.grouped)for(let j=0;j<width;j++){const k=g.index*width+j;groups[k]=Math.max(groups[k],g.values[j]);}
    return {flat:state.flat+v.flat,pct:state.pct+v.pct,hasPercentage:state.hasPercentage||v.hasPercentage,fallback:{flat:state.fallback.flat+v.compiled.fallback.flat,pct:state.fallback.pct+v.compiled.fallback.pct},groups};
  }
  function avoidUpper(proof,state,depth,exactAdditive=false) {
    if(!proof?.supported)return null;
    let upper=(proof.base+state.flat+proof.suffixFlat[depth])*(1+(state.pct+proof.suffixPct[depth])/100);
    // The existing rectangle needs no rounding margin for certified additive
    // safe-integer inputs. Percentages must actually be zero, including tiny
    // values whose multiplier could round to 1. Standalone bounds stay padded.
    const exact=exactAdditive&&proof.integerFlat&&!state.hasPercentage&&!proof.suffixHasPercentage[depth]?Math.max(upper,proof.forced):null;
    const width=proof.scales.length;
    for(let j=0;j<width;j++){const t=proof.scales[j],slot=t*(proof.base+state.flat)+(1+state.pct/100)/t+proof.suffix[depth][j];
      let group=t*(proof.base+state.fallback.flat)+(1+state.fallback.pct/100)/t+proof.fallbackSuffix[depth][j];
      for(let k=j;k<state.groups.length;k+=width)group+=Math.max(state.groups[k],proof.groupSuffix[depth][k]);
      upper=Math.min(upper,(Math.min(slot,group)/2)**2);}
    upper=Math.max(upper,proof.forced)+proof.margin;if(exact!==null)upper=Math.min(upper,exact);
    return Number.isFinite(upper)?upper:null;
  }
  function inspectAvoid(reduction,slots=reduction.context.slots,{secondary=false}={}) {
    return contextApi().withRuntime(reduction.context,()=>{const plan=prepare(reduction);plan.slots=slots.slice();const proof=prepareAvoid(plan,false,secondary);if(!proof)return null;
      return {supported:proof.supported,prepareMs:proof.prepareMs,frontiers:Object.fromEntries([...proof.frontiers].map(([s,f])=>[s,f.length])),buckets:proof.buckets,
        evaluate:(ids,remaining)=>{const depth=slots.length-remaining.length;if(remaining.some((s,i)=>s!==slots[depth+i]))throw new Error("Additive-stat inspector requires suffix ordering");let state=proof.initial;for(const id of ids)state=avoidChild(proof,state,id);return avoidUpper(proof,state,depth,evasionResistanceScope(reduction.context)&&!secondary);}};});
  }
  function inspectResistance(reduction,slots=reduction.context.slots) {
    if(reduction.context.objective.metric!=="resistance"&&!magicResistanceScope(reduction.context)&&!evasionResistanceScope(reduction.context))return null;
    return inspectAvoid(reduction,slots,{secondary:evasionResistanceScope(reduction.context)});
  }
  function magicScope(context) {
    return magicResistanceScope(context)||lexicographicScope(context)&&context.secondary.metric==="magic" || (context.objective.metric==="magic" && context.objective.direction==="max" && !context.secondary
      && !context.constraints.length && !context.fixedCandidateIds.length && !context.excludedCandidateIds.length);
  }
  function magicResistanceScope(context) {
    return context.objective.metric==="magic"&&context.objective.direction==="max"&&context.secondary?.metric==="resistance"&&context.secondary.direction==="max"
      &&!context.constraints.length&&!context.fixedCandidateIds.length&&!context.excludedCandidateIds.length&&!context.mainWeaponSkill&&!context.mainWeaponSlot;
  }
  function evasionResistanceScope(context) {
    return context.objective.metric==="avoid"&&context.objective.direction==="max"&&context.secondary?.metric==="resistance"&&context.secondary.direction==="max"
      &&!context.constraints.length&&!context.mainWeaponSkill&&!context.mainWeaponSlot;
  }
  // Safe completion relaxation: one positive Buff row per remaining slot,
  // at most one winner per retained certified clique. Other edges are dropped.
  function preparePrimaryCompletion(proof,slots,template=null) {
    if(!proof || [...proof.sourcesById.values()].some(s=>s.length>1) || proof.fixedSources.reduce((n,s)=>n+s.potential,0)!==proof.base)return null;
    const frequency=new Map();for(const s of proof.allSources)if(s.bucket)frequency.set(s.bucket,(frequency.get(s.bucket)||0)+1);
    const prefix="group:skillbuff:"+proof.spec.skillName.toLowerCase()+":";
    const buckets=[...frequency.keys()].sort((a,b)=>Number(b.startsWith(prefix))-Number(a.startsWith(prefix))||frequency.get(b)-frequency.get(a)).slice(0,8);
    const indexes=template?.indexes||new Map(buckets.map((b,i)=>[b,i])),size=1<<indexes.size,suffix=Array(slots.length+1);
    suffix[slots.length]=new Float64Array(size);suffix[slots.length].fill(-Infinity);suffix[slots.length][0]=0;
    for(let depth=slots.length-1;depth>=0;depth--){const next=suffix[depth+1],out=next.slice(),options=proof.sourceListsBySlot.get(slots[depth]);
      for(const rows of options)for(const source of rows){const index=indexes.get(source.bucket),bit=index===undefined?0:1<<index;
        for(let mask=0;mask<size;mask++)if(!(mask&bit)&&next[mask]!==-Infinity)out[mask|bit]=Math.max(out[mask|bit],next[mask]+source.potential);}
      suffix[depth]=out;
    }
    return {proof,indexes,size,suffix};
  }
  function primaryCompletionUpper(prepared,ids,depth) {
    if(!prepared)return null;const weights=new Float64Array(prepared.indexes.size);let flat=0;
    for(const rows of [prepared.proof.fixedSources,...ids.map(id=>prepared.proof.sourcesById.get(id))])for(const source of rows){
      const index=prepared.indexes.get(source.bucket);if(index===undefined)flat+=source.potential;else weights[index]=Math.max(weights[index],source.potential);}
    let upper=-Infinity;for(let mask=0;mask<prepared.size;mask++){let value=prepared.suffix[depth][mask]+flat;
      for(let i=0;i<weights.length;i++)if(!(mask&(1<<i)))value+=weights[i];upper=Math.max(upper,value);}
    return Number.isSafeInteger(upper)?upper:null;
  }
  function lexicographicScope(context) {
    return context.objective.metric==="skillPlus" && context.objective.direction==="max"
      && ["magic","avoid"].includes(context.secondary?.metric) && context.secondary.direction==="max"
      && !context.constraints.length && (context.secondary.metric==="avoid"||!context.fixedCandidateIds.length && !context.excludedCandidateIds.length) && !context.mainWeaponSkill && !context.mainWeaponSlot;
  }
  function magicProof(plan,prepareCandidates=true) {
    if(!magicScope(plan.context))return null;
    const zero=()=>({lo:0,hi:0,pLo:1,pHi:1});
    const product=(a,b)=>{const v=[a.pLo*b.pLo,a.pLo*b.pHi,a.pHi*b.pLo,a.pHi*b.pHi];
      a.pLo=Math.min(...v);a.pHi=Math.max(...v);};
    const add=(a,b)=>{a.lo+=b.lo;a.hi+=b.hi;product(a,b);};
    const join=(a,b)=>{a.lo=Math.min(a.lo,b.lo);a.hi=Math.max(a.hi,b.hi);a.pLo=Math.min(a.pLo,b.pLo);a.pHi=Math.max(a.pHi,b.pHi);};
    const sources=[],byId=new Map(),slots=new Map(),fixedFactors=[];let terms=16,absoluteFlat=0,fixedGrowth=1,integerFlat=true,fixedPercentZero=true;
    const source=(row,stack="")=>{
      const flat=+(row.flatMagic??0),pct=+(row.magicPct??0);terms+=4;integerFlat=integerFlat&&Number.isSafeInteger(flat);
      if(!Number.isFinite(flat)||!Number.isFinite(pct))return null;
      absoluteFlat+=Math.abs(flat);
      const range={lo:Math.min(0,flat),hi:Math.max(0,flat),pLo:Math.min(1,1+pct/100),pHi:Math.max(1,1+pct/100)};
      const groups=resolveAllBuffRowsForGroups({composite:[row]}).groups.map(g=>"group:"+g.group.toLowerCase());
      const keys=[...new Set([...groups,...(stack?["stack:"+stack]:[])])];
      const s={name:row.name,flat,pct,range,keys,bucket:null};if(flat!==0||pct!==0)sources.push(s);return s;
    };
    const fixedState=expandSkillSimMasteryBuffState(plan.context.baseState);
    const baseline=contextApi().evaluate(plan.context,[],plan.sources).metrics;
    const fixed=zero();fixed.lo=fixed.hi=baseline.baseMagicFromSpirit;
    absoluteFlat+=Math.abs(baseline.baseMagicFromSpirit);integerFlat=integerFlat&&Number.isSafeInteger(baseline.baseMagicFromSpirit);
    for(const r of normalizeFlatRows(fixedState).filter(r=>r.enabled&&(r.target||"magic")==="magic")){
      const v=+r.value||0;fixed.lo+=v;fixed.hi+=v;absoluteFlat+=Math.abs(v);terms++;integerFlat=integerFlat&&Number.isSafeInteger(v);}
    for(const r of (fixedState.pct||[]).filter(r=>r.enabled&&!r.excluded&&r.target==="magic")){
      const percent=+r.percent||0,p=1+percent/100;fixedPercentZero=fixedPercentZero&&percent===0;fixedFactors.push(p);fixedGrowth*=Math.max(1,Math.abs(p));terms+=4;}
    const fixedSources=normalizeCompositeRows(fixedState.composite).filter(r=>r.enabled&&!r.excluded).map(r=>source(r));
    if(fixedSources.some(s=>!s)||!Object.values(fixed).every(Number.isFinite))return null;
    for(const cls of plan.classes){const id=cls.representativeCandidateId,row=plan.rows.get(id),raw=cls.representativeCandidate.evaluationFields||{};
      const direct=zero();direct.lo=direct.hi=+row.magic||0;terms++;integerFlat=integerFlat&&Number.isSafeInteger(direct.lo);
      if(Number.isFinite(direct.lo))absoluteFlat+=Math.abs(direct.lo);
      const resolved=resolveEquipmentBuffRowsForSameTechnic([row]);
      const buffs=normalizeCompositeRows(resolved.map(equipmentBuffToCompositeRow)).filter(r=>r.enabled&&!r.excluded);
      const stack=resolved.length===1&&buffs.length===1?equipmentBuffStackKey(resolved[0]):"";
      const list=buffs.map(b=>source(b,stack));
      const malformed=["magic","equipBuffFlatMagic","equipBuffMagicPct"].some(k=>!Number.isFinite(+(raw[k]??0)));
      byId.set(id,{direct,sources:list,reason:malformed||list.some(s=>!s)||!Number.isFinite(direct.lo)?"nonfinite-source":null});
    }
    const counts=new Map();for(const s of sources)for(const k of s.keys)counts.set(k,(counts.get(k)||0)+1);
    for(const s of sources)s.bucket=s.keys.slice().sort((a,b)=>counts.get(b)-counts.get(a)||(a<b?-1:a>b?1:0))[0]||null;
    const collect=entry=>{if(entry?.prepared)return entry.prepared;
      if(!entry||entry.reason)return {reason:entry?.reason||"missing-source"};
      const range={...entry.direct},buckets=new Map();
      for(const s of entry.sources){if(s.flat===0&&s.pct===0)continue;
        if(s.bucket){if(!buckets.has(s.bucket))buckets.set(s.bucket,zero());join(buckets.get(s.bucket),s.range);}else add(range,s.range);}
      return {range,buckets,hasPercentage:entry.sources.some(s=>s.pct!==0)};};
    if(prepareCandidates)for(const entry of byId.values())entry.prepared=collect(entry);
    for(const [slot,list] of plan.groups){const range=zero(),buckets=new Map();let reason=null,hasPercentage=false;
      for(const cls of list){const x=collect(byId.get(cls.representativeCandidateId));if(x.reason){reason=x.reason;continue;}join(range,x.range);hasPercentage=hasPercentage||x.hasPercentage;
        for(const [k,v] of x.buckets){if(!buckets.has(k))buckets.set(k,zero());join(buckets.get(k),v);}}
      slots.set(slot,{range,buckets,reason,hasPercentage,candidateIds:list.map(c=>c.representativeCandidateId)});}
    return {fixed,byId,slots,collect,add,join,zero,terms,sources,fixedSources,fixedFactors,fixedGrowth,absoluteFlat,integerFlat,fixedPercentZero};
  }
  function prepareMagicSuffix(proof,slots) {
    return Object.freeze(Array.from({length:slots.length+1},(_,depth)=>{
      const range=proof.zero(),buckets=new Map();let reason=null,hasPercentage=false;
      for(const slot of slots.slice(depth)){const x=proof.slots.get(slot);if(x.reason){reason=x.reason;continue;}proof.add(range,x.range);hasPercentage=hasPercentage||x.hasPercentage;
        for(const [k,v] of x.buckets){if(!buckets.has(k))buckets.set(k,proof.zero());proof.join(buckets.get(k),v);}}
      return Object.freeze({range:Object.freeze(range),buckets:Object.freeze([...buckets].map(([k,v])=>Object.freeze([k,Object.freeze(v)]))),reason,hasPercentage});
    }));
  }
  // Bound-only positive relaxation. Keep each candidate's flat/factor pair;
  // dropping conflicts enlarges the completion set, never the search domain.
  // log(x) <= log(t) + x/t - 1 gives a separable slot support envelope.
  // Negative factors cannot use this monotone proof: retain the old interval UB.
  function prepareMagicOrdering(proof,plan) {
    const values=new Map(),potential=new Map(),canonical=plan.context.slots;
    for(const [slot,classes] of plan.groups){const rest=canonical.filter(s=>s!==slot),suffix=prepareMagicSuffix(proof,rest)[0];let maximum=-Infinity;
      for(const cls of [...classes,null]){const ids=cls?[cls.representativeCandidateId]:[],single=magicUpper(proof,ids,[]).upper,completion=magicUpper(proof,ids,rest,suffix).upper;
        if(single===null||completion===null)return null;
        maximum=Math.max(maximum,single);values.set(cls?.representativeCandidateId||"null:"+slot,completion);}
      potential.set(slot,maximum);
    }
    return {values,slots:canonical.slice().sort((a,b)=>potential.get(b)-potential.get(a)||canonical.indexOf(a)-canonical.indexOf(b))};
  }
  function prepareMagicCoupled(proof,slots) {
    const started=performance.now(),byId=new Map(),frontiers=new Map();
    let supported=proof.fixedFactors.every(p=>p>=0&&Number.isFinite(p));
    const vector=e=>{
      if(!e||e.reason)return null;
      let flat=Math.max(0,e.direct.hi),log=0;
      for(const s of e.sources){if(s.range.pLo<0)return null;
        flat+=Math.max(0,s.flat);log+=Math.log(Math.max(1,1+s.pct/100));}
      return Number.isFinite(flat)&&Number.isFinite(log)?{flat,log}:null;
    };
    for(const [id,e] of proof.byId){const v=vector(e);byId.set(id,v);if(!v)supported=false;}
    const fixed=vector({direct:proof.fixed,sources:proof.fixedSources});
    if(!fixed)supported=false;
    const scales=Array.from({length:49},(_,i)=>Math.pow(2,i/4));
    const suffix=Array.from({length:slots.length+1},()=>new Float64Array(scales.length));
    const suffixFlat=new Float64Array(slots.length+1),suffixLog=new Float64Array(slots.length+1);
    for(const slot of slots){const options=[{flat:0,log:0}];
      // Candidate IDs are supplied by the prepared slot metadata below.
      for(const id of proof.slots.get(slot).candidateIds)if(byId.get(id))options.push(byId.get(id));
      const unique=[...new Map(options.map(v=>[v.flat+":"+v.log,v])).values()];
      frontiers.set(slot,unique.filter(v=>!unique.some(w=>w!==v&&w.flat>=v.flat&&w.log>=v.log&&(w.flat>v.flat||w.log>v.log))));
    }
    for(let d=slots.length-1;d>=0;d--)for(let j=0;j<scales.length;j++){
      let support=-Infinity;for(const v of frontiers.get(slots[d]))support=Math.max(support,v.flat/scales[j]+v.log);
      suffix[d][j]=suffix[d+1][j]+support;
    }
    for(let d=slots.length-1;d>=0;d--){const f=frontiers.get(slots[d]);
      suffixFlat[d]=suffixFlat[d+1]+Math.max(...f.map(v=>v.flat));
      suffixLog[d]=suffixLog[d+1]+Math.max(...f.map(v=>v.log));}
    for(const row of suffix)for(let j=0;j<scales.length;j++)row[j]+=Math.log(scales[j])-1;
    let fixedLog=0;for(const p of proof.fixedFactors)fixedLog+=Math.log(p);
    const maxFlat=(fixed?.flat||0)+[...frontiers.values()].reduce((n,f)=>n+Math.max(...f.map(v=>v.flat)),0);
    const maxLog=(fixed?.log||0)+[...frontiers.values()].reduce((n,f)=>n+Math.max(...f.map(v=>v.log)),0)+Math.log(proof.fixedGrowth);
    // Formal x*percent occurs before /100, so reserve intermediate headroom.
    if(!Number.isFinite((1+proof.absoluteFlat+maxFlat)*Math.exp(maxLog)*128))supported=false;
    return {supported,byId,frontiers,scales,suffix,suffixFlat,suffixLog,fixed,fixedLog,prepareMs:performance.now()-started};
  }
  function magicCoupledUpper(proof,prepared,state,depth,count,rectangle=false) {
    if(!prepared.supported)return null;
    const flat=prepared.fixed.flat+state.flat,log=prepared.fixed.log+state.log+prepared.fixedLog;
    let exponent=Infinity;
    if(!rectangle)for(let j=0;j<prepared.scales.length;j++){const t=prepared.scales[j];
      exponent=Math.min(exponent,flat/t+log+prepared.suffix[depth][j]);}
    const raw=rectangle?(flat+prepared.suffixFlat[depth])*Math.exp(log+prepared.suffixLog[depth]):Math.exp(exponent);
    // Includes log/exp, support sums and formal forward error; extreme values
    // fall back to the interval proof. Positive relaxation only increases growth.
    const n=proof.terms+count+prepared.suffix.length+256;
    // Cancellation may make raw small while earlier flat rounding is amplified
    // by percentages. Preserve an absolute-input growth budget as well.
    const growth=Math.max(1,Math.exp(prepared.fixed.log+state.log+prepared.suffixLog[depth]))*proof.fixedGrowth;
    const upper=raw+Number.EPSILON*4096*n*((1+proof.absoluteFlat)*growth+raw);
    return Number.isFinite(upper)&&n*Number.EPSILON<0.001?upper:null;
  }
  function magicUpper(proof,selectedIds,remainingSlots,prepared=null) {
    if(!proof)return {upper:null,reason:"unsupported"};
    const range={...proof.fixed},buckets=new Map();let reason=null,hasPercentage=false;
    const include=x=>{if(x.reason){reason=x.reason;return;}proof.add(range,x.range);hasPercentage=hasPercentage||x.hasPercentage;
      for(const [k,v] of x.buckets){if(!buckets.has(k))buckets.set(k,proof.zero());proof.join(buckets.get(k),v);}};
    include(proof.collect({direct:proof.zero(),sources:proof.fixedSources}));
    for(const id of selectedIds)include(proof.collect(proof.byId.get(id)));
    if(prepared)include(prepared);
    else for(const slot of remainingSlots)include(proof.slots.get(slot)||{reason:"missing-slot"});
    if(reason)return {upper:null,reason};
    for(const v of buckets.values())proof.add(range,v);
    const growth=Math.max(1,Math.abs(range.pLo),Math.abs(range.pHi))*proof.fixedGrowth;
    for(const p of proof.fixedFactors)proof.add(range,{lo:0,hi:0,pLo:p,pHi:p});
    // Absolute forward-error envelope for addition and x + x*p/100,
    // including factor construction/products in this relaxation. Underflow
    // is covered by the additive 1 term. Refuse overflow/extreme budgets.
    const n=proof.terms+remainingSlots.length+selectedIds.length;
    const magnitude=(1+proof.absoluteFlat)*growth;
    const raw=Math.max(range.lo*range.pLo,range.lo*range.pHi,range.hi*range.pLo,range.hi*range.pHi);
    const pad=Number.EPSILON*128*n*magnitude;
    const upper=raw+pad;
    // Certify equality only when every additive input and intermediate is a
    // safe integer and no active multiplier changes magic. No epsilon equality.
    // Standalone callers keep the padded upper bound.
    const exactUpper=proof.integerFlat&&proof.fixedPercentZero&&!hasPercentage&&proof.absoluteFlat<Number.MAX_SAFE_INTEGER/4
      &&range.pLo===1&&range.pHi===1&&proof.fixedFactors.every(p=>p===1)&&Number.isSafeInteger(raw)?raw:null;
    return n*Number.EPSILON<0.001&&Number.isFinite(magnitude*128)&&Number.isFinite(upper)?{upper,exactUpper,range,reason:null}:{upper:null,reason:"nonfinite-envelope"};
  }
  function magicPrimaryUpper(proof,coupled,state,depth,ids,slots,suffix) {
    const interval=magicUpper(proof,ids,slots.slice(depth),suffix),bounds=[interval.exactUpper??interval.upper];
    if(coupled?.supported)bounds.push(magicCoupledUpper(proof,coupled,state,depth,ids.length,true),magicCoupledUpper(proof,coupled,state,depth,ids.length));
    const known=bounds.filter(x=>x!==null&&x!==undefined);return known.length?Math.min(...known):null;
  }
  function inspectMagicPrimary(reduction,slots=reduction.context.slots) {
    return contextApi().withRuntime(reduction.context,()=>{const proof=magicProof(prepare(reduction));if(!proof)return null;
      const coupled=prepareMagicCoupled(proof,slots),suffix=prepareMagicSuffix(proof,slots);
      return {evaluate:(ids,remaining)=>{const depth=slots.length-remaining.length;if(remaining.some((s,i)=>s!==slots[depth+i]))throw new Error("Magic primary inspector requires suffix ordering");
        const state={flat:0,log:0};for(const id of ids){const v=coupled.byId.get(id);if(!v)return magicUpper(proof,ids,remaining,suffix[depth]).upper;state.flat+=v.flat;state.log+=v.log;}
        return magicPrimaryUpper(proof,coupled,state,depth,ids,slots,suffix[depth]);}};});
  }
  function inspectMagic(reduction,selectedIds=[],remainingSlots=reduction.context.slots,{prepared=true}={}) {
    return contextApi().withRuntime(reduction.context,()=>{const proof=magicProof(prepare(reduction));
      return proof?{...magicUpper(proof,selectedIds,remainingSlots,prepared?prepareMagicSuffix(proof,remainingSlots)[0]:null),sources:proof.sources,
        candidates:Object.fromEntries(proof.byId),slots:Object.fromEntries(proof.slots)}:null;});
  }
  function inspectMagicCoupled(reduction,selectedIds=[],remainingSlots=reduction.context.slots) {
    return contextApi().withRuntime(reduction.context,()=>{
      const proof=magicProof(prepare(reduction));if(!proof)return null;
      const prepared=prepareMagicCoupled(proof,remainingSlots),state={flat:0,log:0};
      for(const id of selectedIds){const v=prepared.byId.get(id);if(!v)return {upper:null};state.flat+=v.flat;state.log+=v.log;}
      return {upper:magicCoupledUpper(proof,prepared,state,0,selectedIds.length),supported:prepared.supported,
        frontiers:Object.fromEntries(prepared.frontiers),prepareMs:prepared.prepareMs,
        evaluate:(ids,remaining)=>{
          const selected={flat:0,log:0};for(const id of ids){const v=prepared.byId.get(id);if(!v)return null;selected.flat+=v.flat;selected.log+=v.log;}
          const depth=remainingSlots.length-remaining.length;
          if(remaining.some((s,i)=>s!==remainingSlots[depth+i]))throw new Error("Coupled inspector requires suffix ordering");
          return magicCoupledUpper(proof,prepared,selected,depth,ids.length);
        },vectors:Object.fromEntries(prepared.byId)};
    });
  }
  function inspectBounds(reduction) {
    return contextApi().withRuntime(reduction.context,()=>{
      const plan=prepare(reduction),proofs=additiveProof(plan);
      return {metrics:Object.fromEntries([...proofs].map(([key,proof])=>[key,{
        status:proof.unsupported||"candidate-dependent",base:proof.base,field:proof.field,
        candidates:Object.fromEntries([...proof.byId]),
        slots:Object.fromEntries([...proof.bySlot])}]))};
    });
  }
  function inspectSkillPlusPotential(reduction,selectedIds=[],remainingSlots=reduction.context.slots) {
    return contextApi().withRuntime(reduction.context,()=>{
      const proof=skillPotentialProof(prepare(reduction)),completion=lexicographicScope(reduction.context)?preparePrimaryCompletion(proof,reduction.context.slots):null;
      return proof?{base:proof.base,candidates:Object.fromEntries(proof.byId),slots:Object.fromEntries(proof.bySlot),
        upperBound:potentialUpper(proof,selectedIds,remainingSlots),
        groupAware:groupPotentialUpper(proof,selectedIds,remainingSlots),
        preparedGroupAware:preparedGroupPotentialUpper(prepareGroupPotentialSuffix(proof,remainingSlots),selectedIds,0),
        classification:proof.diagnostics,sources:proof.allSources, evaluate:(ids,remaining)=>{const old=groupPotentialUpper(proof,ids,remaining).upper,depth=reduction.context.slots.length-remaining.length;
          if(remaining.some((s,i)=>s!==reduction.context.slots[depth+i]))return old;const coupled=primaryCompletionUpper(completion,ids,depth);return coupled===null?old:Math.min(old,coupled);}}:null;
    });
  }
  function inspectTieKey(reduction,selectedIds=[],remainingSlots=reduction.context.slots,kthKey=null) {
    const plan=prepare(reduction);
    const remaining=new Set(remainingSlots),slots=[...plan.slots.filter(slot=>!remaining.has(slot)),...remainingSlots];
    return optimisticTieKey(prepareTieKey(plan,slots),selectedIds,slots.length-remainingSlots.length,kthKey);
  }
  function inspectACPercentage(reduction,selectedIds=[],remainingSlots=reduction.context.slots) {
    return contextApi().withRuntime(reduction.context,()=>{
      const plan=prepare(reduction),proof=acPercentageProof(plan,additiveProof(plan).get(specKey(plan.context.objective)));
      return proof?{fixed:proof.fixed,candidates:Object.fromEntries(proof.byId),slots:Object.fromEntries(proof.bySlot),
        ...acPercentageUpper(proof,selectedIds,remainingSlots)}:null;
    });
  }
  function inspectACGroups(reduction,selectedIds=[],remainingSlots=reduction.context.slots,{prepared=false}={}) {
    return contextApi().withRuntime(reduction.context,()=>{
      const plan=prepare(reduction),proof=acGroupProof(plan);
      return proof?{sources:proof.allSources,candidates:Object.fromEntries(proof.byId),
        ...(prepared?acPreparedUpper(proof,selectedIds,prepareACSuffix(proof,remainingSlots).suffix[0]):
          acGroupUpper(proof,selectedIds,remainingSlots))}:null;
    });
  }
  global.MOEOptimizerV2BranchAndBound=Object.freeze({run,inspectMagicPrimary,inspectAvoid,inspectResistance,inspectBounds,inspectSkillPlusPotential,inspectTieKey,inspectACPercentage,inspectACGroups,inspectMagic,inspectMagicCoupled});
})(globalThis);
