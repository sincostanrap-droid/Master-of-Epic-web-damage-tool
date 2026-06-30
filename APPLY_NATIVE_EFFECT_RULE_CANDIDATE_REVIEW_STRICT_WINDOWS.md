# Native Effect Rule Candidate Strict Review v1 - Windows apply guide

## 1. Copy files

ZIPを展開して、リポジトリ直下へコピーします。

追加ファイル:

```txt
tools/review-native-effect-rule-candidates.mjs
docs/native-effect-rule-candidate-review-strict-v1.md
APPLY_NATIVE_EFFECT_RULE_CANDIDATE_REVIEW_STRICT_WINDOWS.md
MANIFEST_NATIVE_EFFECT_RULE_CANDIDATE_REVIEW_STRICT.json
```

## 2. Run candidate extraction first

```powershell
node tools/extract-native-effect-rule-candidates.mjs
```

## 3. Run strict review

```powershell
node tools/review-native-effect-rule-candidates.mjs
```

## 4. Open reports

```powershell
notepad .\dist\native-effect-rules\nativeEffectRules.strictReview.combat.tsv
notepad .\dist\native-effect-rules\nativeEffectRules.strictReview.attackDelay.needsManual.tsv
notepad .\dist\native-effect-rules\nativeEffectRules.strictReview.likelyMixedOrNonCombat.tsv
```

## 5. Commit

```powershell
git add tools/review-native-effect-rule-candidates.mjs docs/native-effect-rule-candidate-review-strict-v1.md APPLY_NATIVE_EFFECT_RULE_CANDIDATE_REVIEW_STRICT_WINDOWS.md MANIFEST_NATIVE_EFFECT_RULE_CANDIDATE_REVIEW_STRICT.json
git commit -m "Add strict native effect candidate review"
git push
```

`dist/native-effect-rules/` は調査出力なので、通常はコミットしません。
