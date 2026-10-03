/* Shared catalog adapter. Cache candidate effects, never final conflict winners. */
(function(global){
  let entries=new Map(),references=[],revision=0;
  function invalidate(){entries.clear();references=[];revision++;}
  function project(item){
    const refs=['MOE_EQUIPMENT_CATALOG_MANUAL','MOE_EQUIPMENT_CATALOG','MOE_EQUIPMENT_CATALOG_GENERATED','MOE_AMMO_CATALOG_GENERATED','MOE_BUFF_CATALOG_MANUAL','MOE_BUFF_CATALOG_GENERATED','MOE_BUFF_RULES_MANUAL','MOE_EQUIP_BUFF_RULE_CANDIDATES_MANUAL','MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED','MOE_SKILL_BUFF_COMPATIBILITY_MANUAL','MOE_SKILL_BUFF_COMPATIBILITY_GENERATED','MOE_DAMAGE_BUFF_COMPATIBILITY_MANUAL','MOE_DAMAGE_BUFF_COMPATIBILITY_GENERATED'].map(k=>global[k]);
    if(refs.some((r,i)=>r!==references[i])){invalidate();references=refs;}
    const key=String(item.catalogId||item.id||'')+':'+(item.catalogQuality||'raw');
    if(entries.has(key))return entries.get(key);
    const value=global.MOEEquipmentEffectFacets.projectEquipmentEffectFacets(item,{
      toRow:catalogEquipmentToRow,resolveBuff:resolveEquipmentBuffRow,toComposite:equipmentBuffToCompositeRow,
      definitions:extraFieldDefsFor('summary'),effects:normalizeAdditionalEffects,additionalRules:damageBuffCompatibilityRulesForEquipmentBuff,
      groups:r=>normalizeEquipmentBuffConflictGroupsInput(r.equipBuffConflictGroups||r.equipBuffConflictGroup)});
    entries.set(key,value);return value;
  }
  function available(items){const found=new Map();for(const item of items)for(const facet of project(item).facets)found.set(facet.key,{key:facet.key,label:facet.label,unit:facet.unit});return [...found.values()];}
  global.MOEEquipmentEffectFacetCatalog=Object.freeze({project,invalidate,available,generation:()=>revision});
})(globalThis);
