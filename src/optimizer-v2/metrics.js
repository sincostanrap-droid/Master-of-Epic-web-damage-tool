/* Observation contracts for the existing calculator. No replacement formulas. */
(function(global) {
  "use strict";
  const pairs={ac:["extraAC","extraACPct"],hit:["extraHit","extraHitPct"],
    avoid:["extraAvoid","extraAvoidPct"],maxHP:["extraHP","extraHPPct"],
    maxST:["extraST","extraSTPct"],maxMP:["extraMP","extraMPPct"]};
  const names=new Set(["petGrowth","physicalDamage","attackDps","attack","magic","speed","attackDelay","critRate","skillPlus","extraStat","numeric","resistance",...Object.keys(pairs)]);
  const aliases={accuracy:"hit",evasion:"avoid",hp:"maxHP",st:"maxST",mp:"maxMP",
    moveSpeed:"speed",critical:"critRate",AC:"ac",attackPower:"attack"};
  function normalize(value, direction="max") {
    const spec=typeof value==="string"?{metric:value}: {...value};
    spec.metric=aliases[spec.metric] || spec.metric;
    if (!names.has(spec.metric)) throw new Error(`Unsupported objective/metric: ${spec.metric}`);
    for(const key of Object.keys(spec)) if(!["metric","direction","skillName","stat","path","element"].includes(key)) throw new Error(`Unsupported metric field: ${key}`);
    spec.direction=spec.direction ?? direction;
    if(!["min","max"].includes(spec.direction)) throw new Error("Invalid objective direction");
    if(spec.metric==="skillPlus" && (!spec.skillName || validSkillSimSkillName(spec.skillName,"")!==spec.skillName)) throw new Error("Known skillName required");
    if(spec.metric==="resistance" && !["Fire","Water","Earth","Wind","Neutral"].includes(spec.element)) throw new Error("Known resistance element required");
    if(spec.metric==="extraStat" && !Object.hasOwn(emptyExtraStats(),spec.stat)) throw new Error("Known extraStat required");
    if(spec.metric==="numeric" && (typeof spec.path!=="string" || !/^[A-Za-z][\w]*(\.[A-Za-z][\w]*)*$/.test(spec.path)
      || spec.path.split('.').some(x=>["constructor","prototype","__proto__"].includes(x)))) throw new Error("Safe numeric metric path required");
    return spec;
  }
  function observationPlan(objective,constraints) {
    const specs=[objective,...constraints.map(c=>c.metric)], extra=new Set(),base=new Set();
    for(const s of specs) {
      for(const key of pairs[s.metric]||[]) extra.add(key);
      if(s.metric==="attackDelay" || s.metric==="attackDps") extra.add("extraAttackDelay");
      if(s.metric==="critRate") extra.add("extraCritRatePct");
      if(s.metric==="resistance") {extra.add("extra"+s.element+"Res");extra.add("extra"+s.element+"ResPct");}
      if(s.metric==="extraStat") extra.add(s.stat);
      // Damage/attack conversions can consume magic and speed from another slot.
      if(["physicalDamage","attackDps","attack"].includes(s.metric)) for(const key of ["attack","magic","speed"]) base.add(key);
      if(s.metric==="magic") base.add("magic");
      if(s.metric==="speed") for(const key of ["magic","speed"]) base.add(key);
    }
    return {metrics:specs,extraFields:[...extra].sort(),baseFields:[...base].sort(),
      skillNames:[...new Set(specs.filter(s=>s.metric==="skillPlus").map(s=>s.skillName))].sort(),
      conservativeAll:specs.some(s=>s.metric==="numeric"),
      needsDps:specs.some(s=>s.metric==="attackDps")};
  }
  function read(spec,metrics,dps) {
    const e=metrics.extraStats;
    switch(spec.metric) {
      case "petGrowth":return metrics.petGrowth.multiplier;
      case "physicalDamage":return metrics.finalDamage;
      case "attackDps":return dps?.continuousDps;
      case "attack":return metrics.atk;
      case "magic":return metrics.stats.magic;
      case "speed":return metrics.stats.speed;
      case "hit":return metrics.playerHit;
      case "ac":return metrics.defense;
      case "avoid":return effectiveAvoidValue(skillSimDerived(),metrics);
      case "maxHP":return totalStatValue(skillSimDerived().hp,e.extraHP,e.extraHPPct);
      case "maxST":return totalStatValue(skillSimDerived().st,e.extraST,e.extraSTPct);
      case "maxMP":return totalStatValue(skillSimDerived().mp,e.extraMP,e.extraMPPct);
      case "attackDelay":return e.extraAttackDelay;
      case "critRate":return e.extraCritRatePct;
      case "skillPlus":return global.MOESkillPlusV21.totalForSkill(metrics.skillPlusTotals,spec.skillName);
      case "resistance":return totalStatValue(skillSimDerived().resist,e["extra"+spec.element+"Res"],e["extra"+spec.element+"ResPct"]);
      case "extraStat":return e[spec.stat];
      case "numeric":return spec.path.split('.').reduce((obj,key)=>obj && Object.hasOwn(obj,key)?obj[key]:undefined,metrics);
    }
  }
  global.MOEOptimizerV2Metrics=Object.freeze({normalize,observationPlan,read});
})(globalThis);
