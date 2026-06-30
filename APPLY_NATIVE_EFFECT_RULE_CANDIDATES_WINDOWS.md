# 自作効果ルール候補抽出パッチ 適用手順

PowerShellでリポジトリ直下にいる前提です。

## 1. パッチをコピー

ZIPの中身をリポジトリ直下にコピーします。

追加されるファイル:

```txt
tools/extract-native-effect-rule-candidates.mjs
tools/report-native-effect-rule-coverage.mjs
docs/native-effect-rule-candidate-workflow.md
APPLY_NATIVE_EFFECT_RULE_CANDIDATES_WINDOWS.md
MANIFEST_NATIVE_EFFECT_RULE_CANDIDATES.json
```

## 2. 候補抽出

```powershell
node tools/extract-native-effect-rule-candidates.mjs
```

出力:

```txt
dist/native-effect-rules/nativeEffectRules.candidates.tsv
dist/native-effect-rules/nativeEffectRules.candidates.summary.json
```

## 3. カバレッジ確認

```powershell
node tools/report-native-effect-rule-coverage.mjs
```

出力:

```txt
dist/native-effect-rules/nativeEffectRuleCoverage.all.tsv
dist/native-effect-rules/nativeEffectRuleCoverage.matched.tsv
dist/native-effect-rules/nativeEffectRuleCoverage.unmatchedBuffs.tsv
dist/native-effect-rules/nativeEffectRuleCoverage.uncoveredBuffNames.tsv
dist/native-effect-rules/nativeEffectRuleCoverage.summary.json
```

## 4. 結果確認

```powershell
Get-Content .\dist\native-effect-rules\nativeEffectRules.candidates.tsv -First 20
Get-Content .\dist\native-effect-rules\nativeEffectRuleCoverage.uncoveredBuffNames.tsv -First 30
```

候補は `enabled=FALSE` です。
信頼できる候補だけ `data/manual/nativeEffectRules.manual.tsv` に移し、`enabled=TRUE` にしてください。

## 5. コミット

このパッチ自体を入れる場合:

```powershell
git add tools/extract-native-effect-rule-candidates.mjs tools/report-native-effect-rule-coverage.mjs docs/native-effect-rule-candidate-workflow.md APPLY_NATIVE_EFFECT_RULE_CANDIDATES_WINDOWS.md MANIFEST_NATIVE_EFFECT_RULE_CANDIDATES.json
git commit -m "Add native effect rule candidate tools"
git push
```

`dist/native-effect-rules/` は調査出力なので、通常はコミットしません。
