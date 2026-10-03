/* UI-independent search specification -> immutable formal SearchContext. */
(function(global){
  const copy=v=>JSON.parse(JSON.stringify(v));
  const freeze=v=>{if(v&&typeof v==="object"){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
  function metricFor(key){
    if(key==='pet:experienceMultiplier')return {metric:'petGrowth'};
    if(key==='stat:magic')return {metric:'magic'};
    if(key==='stat:extraAvoid')return {metric:'avoid'};
    const resist=/^stat:extra(Fire|Water|Earth|Wind|Neutral)Res$/.exec(key);
    if(resist)return {metric:'resistance',element:resist[1]};
    if(key.startsWith('skillPlus:'))return {metric:'skillPlus',skillName:key.slice(10)};
    return null;
  }
  function create(axes,{secondary=false,topK=20,slots=null,query=''}={}){
    if(!axes?.[0]?.key)throw new Error('メイン効果を選んでください。');
    const primary=metricFor(axes[0].key);if(!primary)throw new Error('このメイン効果は候補検索のみ対応しています。');
    const tie=secondary&&axes[1]?.key?metricFor(axes[1].key):null;
    if(secondary&&axes[1]?.key&&!tie)throw new Error('サブ効果の最適構成計算は未対応です。');
    const constraints=[];
    for(const axis of axes){if(!axis.key)continue;const text=String(axis.minimum??'').trim();if(text===''&&!axis.required)continue;
      const metric=metricFor(axis.key);if(!metric)throw new Error('最低条件の効果は正式評価に未対応です。');
      const minimum=metric.metric==='petGrowth'&&axis.required?Math.max(1+Number.EPSILON,text===''?1:Number(text)):text===''?Number.MIN_VALUE:Number(text);
      if(!Number.isFinite(minimum))throw new Error('最低値は有限の数値で指定してください。');
      constraints.push({metric,op:'gte',value:minimum});if(axis.required&&minimum<=0)constraints.push({metric,op:'gte',value:Number.MIN_VALUE});
    }
    if(!Number.isInteger(topK)||topK<1)throw new Error('Top件数が不正です。');
    return freeze({version:1,primary,secondary:tie,constraints,topK,slots:slots?slots.slice():null,query:String(query)});
  }
  function toContext(spec,{baseState,inputs,gender=null,fixedCandidateIds=[],excludedCandidateIds=[],runtime}={}){
    return global.MOEOptimizerV2SearchContext.create({objective:spec.primary,...(spec.secondary?{secondary:spec.secondary}:{}),
      constraints:spec.constraints,topK:spec.topK,...(spec.slots?{slots:spec.slots}:{}),baseState:copy(baseState),
      skillSim:copy(baseState.skillSim),inputs:{...copy(inputs||{}),str:baseState.skillSim.skills?.["筋力"]||0,spirit:baseState.skillSim.skills?.["精神力"]||0,drunk:baseState.skillSim.skills?.["酩酊"]||0},gender,fixedCandidateIds,excludedCandidateIds,...(runtime?{runtime}:{} )});
  }
  global.MOEEquipmentSearchSpecification=Object.freeze({metricFor,create,toContext});
})(globalThis);
