// Generic effect helpers for the Master of Epic effect catalog v1.
// This file intentionally does not depend on the existing damage calculator yet.
// Use it as the boundary layer between equipment, buffs, and future generic simulators.

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function createEmptyEffectTotals() {
  return {
    flat: Object.create(null),
    percent: Object.create(null),
    coefficient: Object.create(null),
    namedGroups: Object.create(null),
    formulas: [],
    conversions: [],
    unsupported: [],
    sources: []
  };
}

export function addEffectToTotals(totals, effect, context = {}) {
  if (!effect || !effect.stat) return totals;
  const stat = effect.stat;
  switch (effect.mode) {
    case 'flat':
      if (isFiniteNumber(effect.value)) totals.flat[stat] = (totals.flat[stat] || 0) + effect.value;
      break;
    case 'percent':
      if (isFiniteNumber(effect.value)) totals.percent[stat] = (totals.percent[stat] || 0) + effect.value;
      break;
    case 'coefficient':
      if (isFiniteNumber(effect.value)) {
        const key = effect.coefficientType || effect.sourceField || 'unknown';
        totals.coefficient[key] = (totals.coefficient[key] || 0) + effect.value;
      }
      break;
    case 'namedGroup':
      if (isFiniteNumber(effect.value)) {
        const key = `${stat}:${effect.group || effect.sourceField || 'unknown'}`;
        // Named groups should generally not be summed blindly. Keep the strongest value by default.
        totals.namedGroups[key] = Math.max(totals.namedGroups[key] || 0, effect.value);
      }
      break;
    case 'formula':
      totals.formulas.push(effect);
      break;
    case 'conversion':
      totals.conversions.push(effect);
      break;
    default:
      totals.unsupported.push(effect);
      break;
  }
  return totals;
}

export function resolveFormulaEffect(effect, context = {}) {
  const f = effect?.formula;
  if (!f || f.type !== 'skillMagicConst') return null;
  const skillValue = Number(context.skillValue ?? context.skill ?? 0);
  const magicValue = Number(context.magic ?? context.mag ?? 0);
  const value = (Number(f.skillCoeff || 0) * skillValue) + (Number(f.magicCoeff || 0) * magicValue) + Number(f.constant || 0);
  return { stat: effect.stat, mode: 'flat', value, sourceField: effect.sourceFields?.join('+') || 'formula' };
}

export function applyFormulas(totals, context = {}) {
  for (const formulaEffect of totals.formulas || []) {
    const resolved = resolveFormulaEffect(formulaEffect, context);
    if (resolved) addEffectToTotals(totals, resolved, context);
  }
  return totals;
}

export function resolveEffectEntries(entries = [], context = {}) {
  const totals = createEmptyEffectTotals();
  for (const entry of entries || []) {
    for (const effect of entry.effects || []) {
      addEffectToTotals(totals, effect, context);
    }
    if (entry.unsupportedFields && Object.keys(entry.unsupportedFields).length) {
      totals.unsupported.push({ source: entry.id || entry.name, fields: entry.unsupportedFields });
    }
    totals.sources.push({ id: entry.id, name: entry.name, sourceLayer: entry.sourceLayer, status: entry.verificationStatus });
  }
  applyFormulas(totals, context);
  return totals;
}

export function findEffectsByName(catalog = [], name) {
  if (!name) return [];
  const exact = catalog.filter(e => e.name === name);
  if (exact.length) return exact;
  const compact = String(name).replace(/\s+/g, '');
  return catalog.filter(e => String(e.name || '').replace(/\s+/g, '') === compact);
}

export function findEquipmentBuffEntries(index = [], itemNameOrBuffName) {
  if (!itemNameOrBuffName) return [];
  const q = String(itemNameOrBuffName).trim();
  return index.filter(e => e.itemName === q || e.buffName === q || String(e.itemName || '').includes(q) || String(e.buffName || '').includes(q));
}
