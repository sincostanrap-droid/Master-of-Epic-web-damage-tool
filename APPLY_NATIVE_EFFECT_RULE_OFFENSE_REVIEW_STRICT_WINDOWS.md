# Apply Native Effect Rule Offense Review Strict v1

From repository root:

```powershell
node tools/extract-native-effect-rule-candidates.mjs
node tools/review-native-effect-rule-candidates.mjs
node tools/review-native-offense-candidates.mjs

Get-Content .\dist\native-effect-rules\nativeEffectRules.offenseReview.summary.json -Encoding UTF8
Get-Content .\dist\native-effect-rules\nativeEffectRules.offenseReview.simpleNeedsSourceCheck.tsv -Encoding UTF8 -First 40
Get-Content .\dist\native-effect-rules\nativeEffectRules.offenseReview.mixedNeedsManual.tsv -Encoding UTF8 -First 40
```

Commit only the tool/doc files:

```powershell
git add tools/review-native-offense-candidates.mjs docs/native-effect-rule-offense-review-strict-v1.md APPLY_NATIVE_EFFECT_RULE_OFFENSE_REVIEW_STRICT_WINDOWS.md MANIFEST_NATIVE_EFFECT_RULE_OFFENSE_REVIEW_STRICT.json
git commit -m "Add strict native offense candidate review"
git push
```

Do not commit `dist/native-effect-rules/` review outputs.
