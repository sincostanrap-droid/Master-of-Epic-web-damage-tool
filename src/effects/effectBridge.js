// Bridge helpers for gradually moving the existing physical damage calculator to the generic effect system.
// v1 goal: new data structure can exist beside the current addStatuses/equipBuff flow without changing existing behavior.

import { REFERENCE_EFFECT_CATALOG } from '../data/generated/referenceEffectCatalog.generated.js';
import { REFERENCE_EQUIPMENT_BUFF_INDEX } from '../data/generated/referenceEquipmentBuffIndex.generated.js';
import { findEffectsByName, findEquipmentBuffEntries, resolveEffectEntries } from './effectResolver.js';

export function getReferenceBuffEffectsByName(buffName, context = {}) {
  return resolveEffectEntries(findEffectsByName(REFERENCE_EFFECT_CATALOG, buffName), context);
}

export function getReferenceEquipmentBuffEffects(itemNameOrBuffName, context = {}) {
  return resolveEffectEntries(findEquipmentBuffEntries(REFERENCE_EQUIPMENT_BUFF_INDEX, itemNameOrBuffName), context);
}

export function toLegacyPhysicalPatch(totals) {
  // Keep this adapter deliberately small. Existing calculator can consume this without knowing about full generic stats.
  return {
    attackFlat: totals.flat.attack || 0,
    attackPercent: totals.percent.attack || 0,
    hitFlat: totals.flat.hit || 0,
    hitPercent: totals.percent.hit || 0,
    attackDelay: (totals.flat.attackDelay || 0) + (totals.percent.attackDelay || 0),
    critRate: (totals.flat.critRate || 0) + (totals.percent.critRate || 0),
    magicFlat: totals.flat.magic || 0,
    unsupported: totals.unsupported || [],
    sources: totals.sources || []
  };
}
