/* Opt-in reduction for unconstrained AC / specified skillPlus maximization.
 * Formal resolution/evaluation remains the sole source of final scores.
 */
(function(global) {
  "use strict";
  const order=v=>Array.isArray(v)?v.map(order):v&&typeof v==='object'
    ?Object.fromEntries(Object.keys(v).sort().map(k=>[k,order(v[k])])):v;
  const key=v=>JSON.stringify(order(v));
  const E=()=>global.MOEOptimizerV2EffectiveCandidates;
  const C=()=>global.MOEOptimizerV2SearchContext;
  function descriptor(context) {
    const avoidResistance=context.objective.metric==='avoid'&&context.secondary?.metric==='resistance'&&context.secondary.direction==='max';
    const magicResistance=context.objective.metric==='magic'&&context.secondary?.metric==='resistance'
      &&context.secondary.direction==='max'&&!context.fixedCandidateIds.length&&!context.excludedCandidateIds.length;
    const combined=context.objective.metric==='skillPlus'&&['magic','avoid'].includes(context.secondary?.metric)
      &&context.secondary.direction==='max'&&(context.secondary.metric==='avoid'||!context.fixedCandidateIds.length&&!context.excludedCandidateIds.length);
    if((context.secondary&&!combined&&!magicResistance&&!avoidResistance) || context.objective.direction!=="max" || context.constraints.length || context.mainWeaponSkill
      || context.mainWeaponSlot) return null;
    if(context.objective.metric==='avoid') return {metric:'avoid',flat:'extraAvoid',percentage:'extraAvoidPct',...(avoidResistance?{
      resistanceFlat:'extra'+context.secondary.element+'Res',resistancePercentage:'extra'+context.secondary.element+'ResPct'}:{})};
    if(context.objective.metric==='resistance') return {metric:'resistance',flat:'extra'+context.objective.element+'Res',percentage:'extra'+context.objective.element+'ResPct'};
    if(context.objective.metric==='ac') return {metric:'ac',flat:'extraAC',percentage:'extraACPct'};
    if(magicResistance)return {metric:'magic',secondaryMagic:true,secondaryResistance:true,
      flat:'extra'+context.secondary.element+'Res',percentage:'extra'+context.secondary.element+'ResPct'};
    if(context.objective.metric==='skillPlus') return {metric:'skillPlus',skillName:context.objective.skillName,...(combined?{secondaryMagic:context.secondary.metric==='magic',secondaryAvoid:context.secondary.metric==='avoid'}: {})};
    return null;
  }
  function reduce(snapshot,context,{dominance=true,acFixedContextEquivalence=true,acReplacementDominance=true,acReplacementDryRun=false}={}) {
    return global.MOEOptimizerV2Candidates.drainPreparation(reduceSteps(snapshot,context,{dominance,acFixedContextEquivalence,acReplacementDominance,acReplacementDryRun}),context);
  }
  function* reduceSteps(snapshot,context,{dominance=true,acFixedContextEquivalence=true,acReplacementDominance=true,acReplacementDryRun=false}={}) {
    const legacy=yield* E().reduceSteps(snapshot,context),desc=descriptor(context);
    if(!desc){legacy.metricReducer={applied:false,reason:'unsupported-objective-or-constraints'};return legacy;}
      const preparation=legacy.candidatePreparation;
      const eligible=new Set(legacy.contextEquivalentClasses.flatMap(c=>c.equivalentCandidateIds));
      const legacyMembership=new Map();
      for(const cls of legacy.contextEquivalentClasses)for(const id of cls.equivalentCandidateIds)legacyMembership.set(id,cls);
      const filtered=new Map(legacy.filtered.map(c=>[c.candidateId,c.reason]));
      const entries=[],byToken=new Map(),member=new Map(),reached=new Set(),queue=[];
      const addToken=(tokens,token)=>{tokens.add(token);};
      const groupTokens=buffs=>{
        const tokens=new Set();
        for(const buff of buffs) for(const candidate of collectActiveBuffConflictCandidates({composite:[buff]}))
          for(const group of [candidate.group,...splitTags(candidate.row.tags)].filter(Boolean))
            addToken(tokens,'group:'+group.toLowerCase());
        return tokens;
      };
      for(const candidate of snapshot.candidates) {
        yield {phase:'reducer relevance',processed:entries.length,total:snapshot.candidates.length};
        if(!eligible.has(candidate.candidateId))continue;
        const row=preparation?preparation.readRow(candidate):global.MOEOptimizerV2Candidates.toEquipmentRow(candidate),source=snapshot.sources[candidate.sourceRef];
        const effective=E().project(candidate,source,context,{candidatePreparation:preparation});
        const buffs=effective.proofBuffs;
        const extra=emptyExtraStats();addExtraStatsInto(extra,row,'base');
        if(desc.metric==='ac')extra.extraAC=equipmentArmorAC(row,context.skillSim).total;
        const buffExtra=emptyExtraStats();buffs.forEach(b=>addExtraStatsInto(buffExtra,b,'buff'));
        const flat=desc.flat?extra[desc.flat]:0;
        const buffFlat=desc.flat?buffExtra[desc.flat]:global.MOESkillPlusV21.totalForSkill(
          skillPlusTotalsFromResolvedState({composite:buffs}),desc.skillName);
        const basePercentage=desc.percentage?extra[desc.percentage]:0;
        const buffPercentage=desc.percentage?buffExtra[desc.percentage]:0;
        const percentage=basePercentage+buffPercentage;
        const magic=desc.secondaryMagic?(+row.magic||0):0;
        const magicBuff=!!desc.secondaryMagic&&buffs.some(b=>+b.flatMagic!==0||+b.magicPct!==0);
        const statDirect=flat!==0 || buffFlat!==0 || basePercentage!==0 || buffPercentage!==0;
        const primaryDirect=desc.secondaryResistance?magic!==0||magicBuff:statDirect;
        const avoid=desc.secondaryAvoid?{flat:extra.extraAvoid,pct:extra.extraAvoidPct}:null;
        const avoidBuff=!!desc.secondaryAvoid&&buffs.some(b=>+b.extraAvoid!==0||+b.extraAvoidPct!==0||Number.isFinite(b.forcedEvasion));
        const resistance=desc.resistanceFlat?{flat:extra[desc.resistanceFlat],pct:extra[desc.resistancePercentage]}:null;
        const resistanceBuff=!!resistance&&buffs.some(b=>b[desc.resistanceFlat]!==0||b[desc.resistancePercentage]!==0);
        const secondaryDirect=resistance?resistance.flat!==0||resistance.pct!==0||resistanceBuff:desc.secondaryResistance?statDirect:magic!==0||magicBuff||!!avoid&&(avoid.flat!==0||avoid.pct!==0)||avoidBuff;
        const forcedAvoid=(desc.metric==='avoid'||desc.secondaryAvoid)&&buffs.some(b=>Number.isFinite(b.forcedEvasion));
        const direct=primaryDirect||secondaryDirect||forcedAvoid;
        const tokens=groupTokens(buffs);
        // Preserve exact stack spelling: same-technic/latest runs before groups.
        effective.proofStackKeys.filter(Boolean).forEach(t=>addToken(tokens,'stack:'+t));
        optimizerEquipmentConflictKeys(row).forEach(t=>addToken(tokens,'equipment:'+t));
        const unknown=effective.protectedReasons.some(r=>r!=='resolved-buff-interaction' && r!=='fixed-candidate')
          || ![flat,buffFlat,percentage,...(resistance?[resistance.flat,resistance.pct]:[])].every(Number.isFinite);
        const entry={candidate,row,effective,flat,buffFlat,basePercentage,buffPercentage,percentage,direct,primaryDirect,secondaryDirect,magic,magicBuff,avoid,avoidBuff,resistance,resistanceBuff,tokens,unknown};
        entries.push(entry);member.set(candidate.candidateId,entry);
        for(const token of tokens){if(!byToken.has(token))byToken.set(token,[]);byToken.get(token).push(entry);}
        // Body AC does not make an unrelated attack Buff a target Buff. Seed
        // Buff closure only from Buff target effects (or unresolved/fixed inputs).
        if(buffFlat!==0 || buffPercentage!==0 || magicBuff || avoidBuff || resistanceBuff || forcedAvoid || unknown || context.fixedCandidateIds.includes(candidate.candidateId)
          || (direct && effective.semantics.hardConflicts.length)) {
          reached.add(candidate.candidateId);queue.push(entry);
        }
      }
      // Fixed pre-conflict external and mastery rows may introduce a bridge.
      // Seed ALL their group memberships conservatively, including non-target categories.
      const base=expandSkillSimMasteryBuffState(context.baseState);
      const baseTokens=new Set();
      for(const candidate of collectActiveBuffConflictCandidates(base))
        for(const group of [candidate.group,...splitTags(candidate.row.tags)].filter(Boolean))
          baseTokens.add('group:'+group.toLowerCase());
      for(const token of baseTokens)for(const entry of byToken.get(token)||[])
        if(!reached.has(entry.candidate.candidateId)){reached.add(entry.candidate.candidateId);queue.push(entry);}
      const visited=new Set();
      for(let i=0;i<queue.length;i++)for(const token of queue[i].tokens) {
        if(visited.has(token))continue;visited.add(token);
        for(const entry of byToken.get(token)||[])if(!reached.has(entry.candidate.candidateId)) {
          reached.add(entry.candidate.candidateId);queue.push(entry);
        }
      }
      // Removing a disjoint group can change the absolute group-order number.
      // The formal latest/food priority includes that number. Preserve relative
      // ordering only when no order-sensitive score interval can cross a fixed
      // score interval; otherwise keep the complete legacy candidate universe.
      const priorityRows=collectActiveBuffConflictCandidates({...base,other:[]});
      for(const entry of entries)if(reached.has(entry.candidate.candidateId))
        priorityRows.push(...collectActiveBuffConflictCandidates({composite:entry.effective.proofBuffs}));
      const maxOrder=(base.composite||[]).length+(base.post||[]).length+context.slots.length+1;
      const intervals=priorityRows.map(c=>{
        const first=buffGroupResolveScore(c.row,0,c.type),last=buffGroupResolveScore(c.row,maxOrder,c.type);
        return {first,last,moving:first!==last};
      });
      const ambiguousOrder=intervals.some(a=>!Number.isFinite(a.first)||!Number.isFinite(a.last)
        || intervals.some(b=>(a.moving!==b.moving || (a.moving&&a.first!==b.first))
          && Math.max(a.first,b.first)<=Math.min(a.last,b.last)));
      if(ambiguousOrder){legacy.metricReducer={applied:false,reason:'unproved-runtime-order-priority',
        descriptor:desc,maxOrder};return legacy;}
      // If EVERY eligible ammo option is inert and conflict-free, ammo can first
      // be replaced by null. With no ammo and no requested main weapon, selecting
      // a zero-metric weapon cannot help feasibility; removing it only relaxes
      // hand occupancy. Weapon requirements affect damage, not these two metrics.
      const ammoCanBeNull=entries.filter(e=>e.candidate.slot==='武器: 弾丸').every(e=>
        !e.direct&&!reached.has(e.candidate.candidateId)&&!e.unknown&&!optimizerEquipmentConflictKeys(e.row).length);
      const groups=new Map(),nullReplacements=Object.fromEntries(context.slots.map(s=>[s,[]]));
      const classification=[],reasons={},removed=[];
      const discard=(entry,reason)=>{reasons[reason]=(reasons[reason]||0)+1;
        removed.push({candidateId:entry.candidate.candidateId,name:entry.candidate.name,reason});};
      for(const candidate of snapshot.candidates)if(!eligible.has(candidate.candidateId))
        classification.push({candidateId:candidate.candidateId,name:candidate.name,stage:'hard-prefilter',reason:filtered.get(candidate.candidateId)||'fixed-slot'});
      for(const entry of entries) {
        yield {phase:'reducer classes',processed:classification.length,total:entries.length};
        const {candidate,row,effective}=entry,buffConnected=reached.has(candidate.candidateId),connected=entry.direct||buffConnected;
        const structural={slot:candidate.slot,requirements:candidate.requirements,
          armorRequirements:desc.metric==='ac'?(row.armorRequirements||[]):undefined,
          rawRequirements:effective.semantics.rawRequirements,restrictions:effective.semantics.restrictions,
          hardConflicts:effective.semantics.hardConflicts,
          // Weapon performance is irrelevant; presence/selection, hands and projectile compatibility are not.
          weapon: candidate.slot.startsWith('武器:')?{
            hasCalcData:weaponRowHasCalcData(row),twoHanded:optimizerWeaponUsesBothHands(row),
            projectileKind:projectileWeaponKind(row),ammoKind:optimizerAmmoKind(row),
            isWeapon:isWeaponEquipmentRow(row),weaponReq:row.weaponReq}:null};
        const inert=!connected && (!candidate.slot.startsWith('武器:') || ammoCanBeNull)
          && !structural.hardConflicts.length && !entry.unknown;
        entry.structural=structural;entry.connected=connected;entry.buffConnected=buffConnected;
        if(desc.secondaryMagic||desc.secondaryAvoid||desc.metric==='avoid'||desc.metric==='resistance'){delete structural.requirements;delete structural.rawRequirements;
          if(structural.weapon)delete structural.weapon.weaponReq;}
        if(inert) {
          nullReplacements[candidate.slot].push(candidate);
          entry.classKey=null;discard(entry,'objective-zero-no-interaction');
          classification.push({candidateId:candidate.candidateId,name:candidate.name,stage:'null-replaceable',direct:false,interaction:false,
            replacementProof:candidate.slot.startsWith('武器:')?'inert-ammo-then-relaxed-hand-occupancy':'identical-target-and-feasibility'});
          continue;
        }
        // Connected Buffs retain full formal payload and ordering identity, including
        // foreign skills/stats used by group scores. Do not fix their winner.
        const signature={structural,bodyFlat:entry.flat,bodyPercentage:desc.percentage?effective.semantics.observedExtra[desc.percentage]:0,
          ...(desc.secondaryMagic?{bodyMagic:entry.magic,secondary:context.secondary}: {}),
          ...(desc.secondaryAvoid?{bodyAvoid:entry.avoid,secondary:context.secondary}: {}),
          ...(desc.resistanceFlat?{bodyResistance:entry.resistance,secondary:context.secondary}: {}),
          buffs:buffConnected?effective.semantics.buffs:[],stackKeys:buffConnected?effective.proofStackKeys:[],
          unknown:entry.unknown?candidate.candidateId:null,
          fixed:context.fixedCandidateIds.includes(candidate.candidateId)?candidate.candidateId:null};
        const equivalenceKey=key([context.objective,context.constraints,signature]);
        entry.classKey=equivalenceKey;
        if(!groups.has(equivalenceKey))groups.set(equivalenceKey,[]);groups.get(equivalenceKey).push(entry);
        classification.push({candidateId:candidate.candidateId,name:candidate.name,stage:'metric-class',
          direct:entry.direct,interaction:connected&&!entry.direct,percentage:entry.percentage,unknown:entry.unknown,
          ...(desc.secondaryMagic||desc.secondaryAvoid||desc.resistanceFlat?{primaryDirect:entry.primaryDirect,secondaryDirect:entry.secondaryDirect,buffConnected}: {}),
          equivalenceKey});
      }
      const allClasses=[...groups].map(([equivalenceKey,list])=>{
        list.sort((a,b)=>a.candidate.candidateId<b.candidate.candidateId?-1:a.candidate.candidateId>b.candidate.candidateId?1:0);
        const rep=list[0],candidates=list.map(e=>e.candidate);
        const cls={equivalenceScope:'SearchContext',equipmentEquivalence:'not-assessed',
          representativeCandidate:rep.candidate,representativeCandidateId:rep.candidate.candidateId,
          equivalentCandidateIds:candidates.map(c=>c.candidateId),equivalentCandidates:candidates,
          equivalenceKey,equivalenceReason:'identical-metric-and-structural-projection',
          retainedRepresentativeCandidateId:rep.candidate.candidateId};
        rep.cls=cls;for(const e of list)e.cls=cls;return cls;
      });
      // AC flat dominance requires a strictly positive multiplier in EVERY layout.
      // A sum of every negative pre-conflict percentage is a conservative lower
      // bound; suppressing a row cannot make that sum smaller. No final AC formula here.
      const negativePct=entries.reduce((s,e)=>s+Math.min(0,e.basePercentage)+Math.min(0,e.buffPercentage),0);
      // Fixed Buff percentages before conflict (not resolved baseline) must also count.
      let fixedMagnitude=desc.metric==='ac'?Math.abs(armorACContext(context.skillSim).base):0,fixedPercentageMagnitude=0;
      const fixedExtra=emptyExtraStats();normalizeCompositeRows(base.composite)
        .filter(b=>b.enabled&&!b.excluded).forEach(b=>{
          const x=emptyExtraStats();addExtraStatsInto(x,b,'buff');
          fixedMagnitude+=Math.abs(x.extraAC||0);
          fixedPercentageMagnitude+=Math.abs(x.extraACPct||0);
          if(desc.percentage)fixedExtra[desc.percentage]+=Math.min(0,x[desc.percentage]);
        });
      const positiveMultiplier=desc.metric!=='ac' || negativePct+(fixedExtra.extraACPct||0)>-100;
      const dominanceGroups=new Map(),deleted=new Set();
      // Restrict this first proof to AC with no metric-connected Buff. Target-skill
      // Buff alternatives are retained; their stack identity/competition is significant.
      for(const cls of allClasses) {
        yield {phase:'reducer dominance',processed:dominanceGroups.size,total:allClasses.length};
        const e=member.get(cls.representativeCandidateId);
        if(desc.metric!=='ac' || (e.buffConnected&&e.effective.proofBuffs.length) || e.percentage || e.unknown
          || context.fixedCandidateIds.includes(e.candidate.candidateId))continue;
        const k=key(e.structural);if(!dominanceGroups.has(k))dominanceGroups.set(k,[]);dominanceGroups.get(k).push(e);
      }
      const magnitude=entries.reduce((s,e)=>s+Math.abs(e.flat)+Math.abs(e.buffFlat),fixedMagnitude);
      const percentageMagnitude=entries.reduce((s,e)=>s+Math.abs(e.basePercentage)+Math.abs(e.buffPercentage),fixedPercentageMagnitude);
      const minSlope=1+(negativePct+(fixedExtra.extraACPct||0))/100;
      const maxSlope=1+percentageMagnitude/100;
      const operationBudget=entries.length+(base.composite||[]).length+context.slots.length*16+64;
      // Conservative floating-point separation: account for summation and the
      // common percentage multiplication. Near-equal alternatives are retained.
      const margin=Number.EPSILON*Math.max(1,magnitude)*operationBudget*64*Math.max(1,maxSlope/minSlope);
      const finiteProof=Number.isFinite(magnitude)&&entries.every(e=>!e.unknown)
        && Number.isFinite(fixedExtra.extraACPct||0)&&Number.isFinite(margin)
        && magnitude*maxSlope<Number.MAX_VALUE/2&&operationBudget*Number.EPSILON<0.001;
      if(dominance&&positiveMultiplier&&finiteProof)for(const list of dominanceGroups.values()) {
        for(const e of list) {
          yield {phase:'reducer dominance',processed:deleted.size,total:allClasses.length};
          const winners=list.filter(a=>a.flat-e.flat>margin);
          // K distinct strictly-better classes in the SAME slot/structure give K
          // distinct feasible replacements of every completion. Ties are never pruned.
          if(winners.length>=context.topK) {
            deleted.add(e.cls.equivalenceKey);
            for(const candidate of e.cls.equivalentCandidates)discard({candidate},'dominated-flat');
            e.dominatedByCandidateIds=winners.sort((a,b)=>b.flat-a.flat).slice(0,context.topK).map(a=>a.candidate.candidateId);
          }
        }
      }
      const legacyClasses=allClasses.filter(c=>!deleted.has(c.equivalenceKey));
      const legacyAllClassCount=allClasses.length;
      const legacyFlatCandidateCount=[...dominanceGroups.values()].reduce((s,l)=>s+l.reduce((n,e)=>n+e.cls.equivalentCandidateIds.length,0),0);
      const legacyWitnesses=new Map(allClasses.map(c=>[c.equivalenceKey,member.get(c.representativeCandidateId).dominatedByCandidateIds]));
      let classes=legacyClasses;
      let acEquivalence=null;
      if(desc.metric==='ac' && acFixedContextEquivalence) {
        // Requirement metadata is consumed by the SAME formal body helper.
        // Formal evaluation sums effective body and additions separately: retain
        // both exact Numbers, not just their total. No tolerance or rounding.
        // Occupancy, eligibility, conflict, resolved Buff payload and stack identity
        // remain unchanged. Unknown inputs and fixed identities stay conservative.
        const numberKey=n=>Object.is(n,-0)?{negativeZero:true}:n;
        const merged=new Map(),active=new Set(legacyClasses.map(c=>c.equivalenceKey));
        const oldToNew=new Map();
        for(const cls of allClasses)for(const candidate of cls.equivalentCandidates) {
          const entry=member.get(candidate.candidateId),signature=JSON.parse(cls.equivalenceKey)[2];
          const armor=equipmentArmorAC(entry.row,context.skillSim);
          let nextKey=cls.equivalenceKey;
          if(!entry.unknown && [armor.effective,armor.addition].every(Number.isFinite)) {
            delete signature.structural.requirements;
            delete signature.structural.armorRequirements;
            delete signature.structural.rawRequirements;
            if(signature.structural.weapon)delete signature.structural.weapon.weaponReq;
            signature.formalArmor={effective:numberKey(armor.effective),addition:numberKey(armor.addition)};
            nextKey=key([context.objective,context.constraints,signature]);
          }
          oldToNew.set(candidate.candidateId,nextKey);
          if(!merged.has(nextKey))merged.set(nextKey,{members:[],active:false});
          const group=merged.get(nextKey);group.members.push({...cls,equivalentCandidates:[candidate]});group.active||=active.has(cls.equivalenceKey);
        }
        const projected=[];
        for(const [equivalenceKey,group] of merged) {
          const candidates=group.members.flatMap(c=>c.equivalentCandidates)
            .sort((a,b)=>a.candidateId<b.candidateId?-1:a.candidateId>b.candidateId?1:0);
          const representativeCandidate=candidates[0];
          const cls={...group.members[0],equivalenceKey,representativeCandidate,
            representativeCandidateId:representativeCandidate.candidateId,
            retainedRepresentativeCandidateId:representativeCandidate.candidateId,
            equivalentCandidates:candidates,equivalentCandidateIds:candidates.map(c=>c.candidateId),
            equivalenceReason:'identical-formal-body-and-addition-in-fixed-AC-context'};
          projected.push(cls);for(const c of candidates)member.get(c.candidateId).cls=cls;
          if(group.active)classes===legacyClasses?classes=[cls]:classes.push(cls);
        }
        if(classes===legacyClasses)classes=[];
        allClasses.splice(0,allClasses.length,...projected);
        for(const record of classification)if(record.equivalenceKey) {
          record.legacyEquivalenceKey=record.equivalenceKey;
          record.equivalenceKey=oldToNew.get(record.candidateId);
        }
        acEquivalence={before:legacyClasses.length,after:classes.length,
          bySlot:Object.fromEntries(context.slots.map(slot=>[slot,{before:legacyClasses.filter(c=>c.representativeCandidate.slot===slot).length,
            after:classes.filter(c=>c.representativeCandidate.slot===slot).length}]))};
      }
      for(const record of classification) {
        const entry=member.get(record.candidateId);
        record.legacyRepresentativeCandidateId=legacyMembership.get(record.candidateId)?.representativeCandidateId||null;
        record.legacyProtectedReasons=entry?.effective.protectedReasons||[];
        if(entry)Object.assign(record,{slot:entry.candidate.slot,bodyFlat:entry.flat,buffFlat:entry.buffFlat,
          bodyPercentage:entry.basePercentage,buffPercentage:entry.buffPercentage,
          direct:entry.direct,interaction:entry.buffConnected&&!entry.direct,
          unknown:entry.unknown,hardConflicts:entry.structural.hardConflicts});
        if(record.legacyEquivalenceKey?deleted.has(record.legacyEquivalenceKey):entry?.cls&&deleted.has(entry.cls.equivalenceKey)) {
          record.stage='dominated-flat';
          record.dominatedByCandidateIds=legacyWitnesses.get(record.legacyEquivalenceKey||entry.cls.equivalenceKey);
        }
      }
      // Strict K-safe replacement is distinct from equivalence. The complete
      // class registry remains intact; a dominated ID is never a winner alias.
      // Bound every separate operand, not their possibly cancelling total.
      // Likewise, count negative percentages per pre-conflict row: an aggregate
      // +5/-5 may become -5 after conflict resolution and is not a lower bound.
      let replacementMagnitude=fixedMagnitude,replacementPctMagnitude=fixedPercentageMagnitude,
        replacementNegativePct=fixedExtra.extraACPct||0;
      if(desc.metric==='ac')for(const e of entries) {
        const a=equipmentArmorAC(e.row,context.skillSim);
        replacementMagnitude+=Math.abs(a.effective)+Math.abs(a.addition);
        replacementPctMagnitude+=Math.abs(e.basePercentage);
        replacementNegativePct+=Math.min(0,e.basePercentage);
        for(const buff of e.effective.proofBuffs){const extra=emptyExtraStats();addExtraStatsInto(extra,buff,'buff');
          replacementMagnitude+=Math.abs(extra.extraAC||0);
          replacementPctMagnitude+=Math.abs(extra.extraACPct||0);
          replacementNegativePct+=Math.min(0,extra.extraACPct||0);}
      }
      const replacementMinSlope=1+replacementNegativePct/100,
        replacementMaxSlope=1+replacementPctMagnitude/100;
      const replacementMargin=Number.EPSILON*Math.max(1,replacementMagnitude)*operationBudget*64*
        Math.max(1,replacementMaxSlope/replacementMinSlope);
      const replacement={before:classes.length,after:classes.length,applied:false,
        proofAvailable:desc.metric==='ac'&&acFixedContextEquivalence&&finiteProof&&replacementMinSlope>0&&
          Number.isFinite(replacementMargin)&&replacementMagnitude*replacementMaxSlope<Number.MAX_VALUE/2,
        structuralGroups:0,comparisons:0,excluded:{},removed:[],bySlot:{},
        roundingMargin:replacementMargin,minMultiplier:replacementMinSlope,operandMagnitude:replacementMagnitude};
      if(replacement.proofAvailable) {
        const groups=new Map();
        for(const cls of classes) {
          const sig=JSON.parse(cls.equivalenceKey)[2];
          const reason=sig.unknown?'unknown':sig.fixed?'fixed':sig.buffs.length?'buff-interaction':
            sig.bodyPercentage?'percentage':!sig.formalArmor?'no-formal-projection':null;
          if(reason){replacement.excluded[reason]=(replacement.excluded[reason]||0)+1;continue;}
          const armor=equipmentArmorAC(member.get(cls.representativeCandidateId).row,context.skillSim);
          delete sig.bodyFlat;delete sig.formalArmor;
          const structuralKey=key(sig);
          if(!groups.has(structuralKey))groups.set(structuralKey,[]);
          groups.get(structuralKey).push({cls,body:armor.effective,addition:armor.addition,
            total:armor.total});
        }
        replacement.structuralGroups=groups.size;
        for(const [,list] of [...groups].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0)) {
          // Intrinsic deterministic order, independent of catalog/input order.
          // Only permanently retained predecessors can act as witnesses.
          list.sort((a,b)=>b.total-a.total||(a.cls.equivalenceKey<b.cls.equivalenceKey?-1:1));
          const retained=[];
          for(const b of list) {
            const witnesses=retained.filter(a=>{replacement.comparisons++;
              return a.body>=b.body && a.addition>=b.addition && a.total-b.total>replacementMargin;});
            if(witnesses.length<context.topK){retained.push(b);continue;}
            replacement.removed.push({equivalenceKey:b.cls.equivalenceKey,
              candidateIds:b.cls.equivalentCandidateIds.slice(),slot:b.cls.representativeCandidate.slot,
              name:b.cls.representativeCandidate.name,witnessClassKeys:witnesses.slice(0,context.topK).map(a=>a.cls.equivalenceKey),
              witnessCandidateIds:witnesses.slice(0,context.topK).map(a=>a.cls.representativeCandidateId)});
          }
        }
        const planned=new Set(replacement.removed.map(x=>x.equivalenceKey));
        for(const slot of context.slots){const before=classes.filter(c=>c.representativeCandidate.slot===slot).length;
          const count=replacement.removed.filter(x=>x.slot===slot).length;
          replacement.bySlot[slot]={before,removed:count,after:before-count};}
        replacement.after=classes.length-planned.size;
        if(dominance&&acReplacementDominance&&!acReplacementDryRun) {
          replacement.applied=true;
          classes=classes.filter(c=>!planned.has(c.equivalenceKey));
          const provenance=new Map(replacement.removed.flatMap(x=>x.candidateIds.map(id=>[id,x])));
          for(const record of classification)if(provenance.has(record.candidateId)){
            const proof=provenance.get(record.candidateId);
            record.stage='dominated-ac-replacement';record.replacementWitnessClassKeys=proof.witnessClassKeys;
            record.replacementWitnessCandidateIds=proof.witnessCandidateIds;
            discard(member.get(record.candidateId),'dominated-ac-replacement');
          }
        }
      }
      const representatives=classes.map(c=>c.representativeCandidate);
      const effectiveCandidates=classes.map(cls=>member.get(cls.representativeCandidateId).effective);
      const output={...legacy,candidates:representatives,effectiveCandidates,contextEquivalentClasses:classes,
        equivalentClasses:classes,equivalentGroups:classes,removed,
        diagnostics:{...legacy.diagnostics,afterParetoCount:classes.length,equivalentClassCount:classes.length,
          afterEquivalenceCount:classes.length,metricReduction:{inputCount:snapshot.candidates.length,
            hardPrefilterCount:entries.length,directRelevantCount:entries.filter(e=>e.direct).length,
            interactionAddedCount:entries.filter(e=>e.connected&&!e.direct).length,
            percentOrNonAdditiveRetainedCount:entries.filter(e=>e.buffConnected&&e.effective.proofBuffs.length).length,
            percentRetainedCount:entries.filter(e=>e.percentage!==0).length,
            flatOnlyClassCount:[...dominanceGroups.values()].reduce((s,l)=>s+l.length,0),
            flatOnlyCandidateCount:legacyFlatCandidateCount,
            beforeDominanceCandidateCount:allClasses.reduce((s,c)=>s+c.equivalentCandidateIds.length,0),
            beforeDominanceClassCount:legacyAllClassCount,afterDominanceClassCount:legacyClasses.length,acFixedContextEquivalence:acEquivalence,
            acReplacementDominance:replacement,
            finalCandidateCount:classes.reduce((s,c)=>s+c.equivalentCandidateIds.length,0),
            equivalentAliasCount:classes.reduce((s,c)=>s+c.equivalentCandidateIds.length-1,0),
            equivalentClassCount:classes.length,objectiveZeroRemovedCount:Object.values(nullReplacements).reduce((s,l)=>s+l.length,0),
            weaponPerformanceIgnoredCandidateCount:entries.filter(e=>weaponRowHasCalcData(e.row)).length,
            legacyWeaponClassCount:legacy.contextEquivalentClasses.filter(c=>c.representativeCandidate.slot.startsWith('武器:')).length,
            metricWeaponClassCount:classes.filter(c=>c.representativeCandidate.slot.startsWith('武器:')).length,
            dominatedClassCount:deleted.size,positiveMultiplierProven:positiveMultiplier,ammoNullReplacementProven:ammoCanBeNull,roundingMargin:margin,reasons,
            runtimeOrderIndependenceProven:true,
            bySlot:Object.fromEntries(context.slots.map(slot=>[slot,{before:entries.filter(e=>e.candidate.slot===slot).length,
              classes:classes.filter(c=>c.representativeCandidate.slot===slot).length,nullReplaceable:nullReplacements[slot].length}]))}},
        metricReducer:{applied:true,descriptor:desc,classification,nullReplacements,allClasses,
          removed,originalSources:snapshot.sources,originalCandidates:snapshot.candidates}};
      if(preparation)Object.defineProperty(output,'candidatePreparation',{value:preparation});
      return output;
  }
  function describeConfiguration(reduction,ids) {
    if(!reduction.metricReducer?.applied)return E().describeConfiguration(reduction,ids);
    const membership=new Map();
    for(const cls of reduction.metricReducer.allClasses)for(const id of cls.equivalentCandidateIds)membership.set(id,cls);
    const nullIds=new Map(Object.values(reduction.metricReducer.nullReplacements).flat().map(c=>[c.candidateId,c.slot]));
    const slots=new Set(),equipment=[];
    for(const id of ids) {
      const cls=membership.get(id);
      if(!cls){if(nullIds.has(id)) {
        const slot=nullIds.get(id);if(slots.has(slot))throw new Error('Multiple candidates in one slot');slots.add(slot);continue;
      }throw new Error('Unknown metric configuration candidate: '+id);}
      const selectedCandidate=E().resolveCandidate(cls,id);
      if(slots.has(selectedCandidate.slot))throw new Error('Multiple candidates in one slot');slots.add(selectedCandidate.slot);
      equipment.push({slot:selectedCandidate.slot,selectedCandidate,...cls});
    }
    equipment.sort((a,b)=>a.slot<b.slot?-1:a.slot>b.slot?1:0);
    return {equipment,performanceKey:key(equipment.map(e=>[e.slot,e.equivalenceKey]))};
  }
  function resolveCandidate(reduction,id) {
    const original=reduction.metricReducer?.originalCandidates?.find(c=>c.candidateId===id);
    if(original)return original;
    for(const cls of reduction.metricReducer?.allClasses||reduction.contextEquivalentClasses)
      if(cls.equivalentCandidateIds.includes(id))return E().resolveCandidate(cls,id);
    for(const candidates of Object.values(reduction.metricReducer?.nullReplacements||{})) {
      const candidate=candidates.find(c=>c.candidateId===id);if(candidate)return candidate;
    }
    throw new Error('Unknown reducer candidate: '+id);
  }
  global.MOEOptimizerV2MetricCandidateReducer=Object.freeze({descriptor,reduce,reduceSteps,describeConfiguration,resolveCandidate});
})(globalThis);
