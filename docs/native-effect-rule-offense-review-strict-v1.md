# Native Effect Rule Offense Review Strict v1

This review is for attack/hit candidate effects only.

It intentionally does not modify `data/manual/nativeEffectRules.manual.tsv` and does not regenerate calculation data.

## Purpose

Earlier offense review output was too loose: rows could appear in a simple attack/hit file even when `effects_json` still contained evasion or movement speed. This tool parses `effects_json` directly and separates candidates into:

- `offense_simple_needs_source_check`
  - `effects_json` contains only attack/hit keys: `attackFlat`, `attackPct`, `hitFlat`, `hitPct`.
  - Still not verified. Source check is required before promotion.
- `offense_mixed_needs_manual`
  - attack/hit is mixed with attack delay, critical, physical damage, skill effect, evasion, movement speed, etc.
- `offense_likely_equipment_status_marker_needs_manual`
  - names/notes contain marker-like buff names such as `攻撃力増加バフ` or `命中増加バフ`; this may be equipment status contamination.
- `parse_error`
  - the TSV/JSON could not be parsed safely.

## Run

```powershell
node tools/extract-native-effect-rule-candidates.mjs
node tools/review-native-effect-rule-candidates.mjs
node tools/review-native-offense-candidates.mjs
```

## Outputs

```txt
dist/native-effect-rules/nativeEffectRules.offenseReview.all.tsv
dist/native-effect-rules/nativeEffectRules.offenseReview.simpleNeedsSourceCheck.tsv
dist/native-effect-rules/nativeEffectRules.offenseReview.mixedNeedsManual.tsv
dist/native-effect-rules/nativeEffectRules.offenseReview.statusMarkerNeedsManual.tsv
dist/native-effect-rules/nativeEffectRules.offenseReview.parseError.tsv
dist/native-effect-rules/nativeEffectRules.offenseReview.summary.json
```

Do not commit `dist/native-effect-rules/` review outputs unless intentionally preserving an investigation snapshot.
