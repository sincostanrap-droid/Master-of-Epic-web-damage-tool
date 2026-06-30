# Effect system v1 foundation

## Goal

Separate equipment identity from effect calculation.

- Equipment catalog remains official-DB/spreadsheet-derived.
- Buff/effect catalog is generated from MoE Forge extracted reference data.
- Physical damage calculator reads only the physical subset.
- Generic equipment simulator can read all stats without losing non-firepower effects.

## Generated contents

- `src/data/generated/moeForgeEffectCatalog.generated.js`
  - 2276 reference effect entries.
  - Source layers: `module48314`, `module49542`, `module75724.Buffs`.
- `src/data/generated/moeForgeEquipmentBuffIndex.generated.js`
  - 12408 equipment-buff reference entries.
  - Holds `Buff`, `BuffInfo`, `BuffStats`, parsed direct effects, and unsupported fields.
- `src/data/effects/effectStatSchema.js`
  - Canonical stat list. Physical, survival, magic, resist, utility, regen, special.
- `src/effects/effectResolver.js`
  - Aggregates flat/percent/coefficient/namedGroup/formula/conversion effects.
- `src/effects/effectBridge.js`
  - Compatibility adapter for current physical calculator.

## Important handling rules

1. MoE Forge data is `reference`, not `official`.
2. Do not delete unrecognized effects. They go to `unsupportedFields`.
3. Named groups such as `N_Crit_B` and `N_Skill_強化_E` are preserved as named groups and should not be blindly summed.
4. `1490` is not used as a primary source because it appears to contain simplified/representative values that can conflict with other modules.
5. Existing physical calculation should keep working until explicitly switched to `effectBridge`.

## Migration plan

### Phase 1: Add files only

Add this patch package on `feature/effect-catalog-v1`. No UI/calculator behavior changes.

### Phase 2: Display reference effects

Add a debug/reference panel in the existing Buff correction UI:

- Search by Buff name.
- Show source layer, raw fields, normalized effects, unsupported fields.
- Allow manual promotion to existing `buffRules.manual.js` or future verified catalog.

### Phase 3: Physical calculator bridge

Use `effectBridge.toLegacyPhysicalPatch()` for selected buffs only, behind a feature flag.

### Phase 4: Generic equipment simulator

Add a generic stat summary panel that reads all canonical stats, not just physical damage stats.

## Current risk

This patch intentionally avoids changing existing calculator state shape. That keeps v1.23.23 stable and lets the new model mature beside it.
