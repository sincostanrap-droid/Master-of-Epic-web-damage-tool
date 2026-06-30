# 物理ダメージ系分類レビュー v7 適用手順

PowerShellでリポジトリ直下にいる前提です。

## 1. パッチをコピー

ZIPの中身をリポジトリ直下へコピーします。

上書きされるファイル:

```txt
tools/review-native-effect-rule-candidates.mjs
```

追加されるファイル:

```txt
docs/native-effect-rule-physical-damage-classification-v1.md
APPLY_NATIVE_EFFECT_RULE_PHYSICAL_DAMAGE_CLASSIFICATION_WINDOWS.md
MANIFEST_NATIVE_EFFECT_RULE_PHYSICAL_DAMAGE_CLASSIFICATION.json
```

## 2. レビュー出力を再生成

```powershell
node tools/extract-native-effect-rule-candidates.mjs
node tools/review-native-effect-rule-candidates.mjs
```

## 3. サマリ確認

```powershell
Get-Content .\dist\native-effect-rules\nativeEffectRules.strictReview.summary.json -Encoding UTF8
```

`counts` に次のような項目が増えていればOKです。

```txt
physicalDamageAll
physicalDamageOutgoing
physicalDamageReductionOrReflect
physicalDamageUnknownOrMixed
byPhysicalDamageClass
```

## 4. 分類結果を見る

```powershell
notepad .\dist\native-effect-rules\nativeEffectRules.strictReview.physicalDamage.outgoing.tsv
notepad .\dist\native-effect-rules\nativeEffectRules.strictReview.physicalDamage.reductionOrReflect.tsv
notepad .\dist\native-effect-rules\nativeEffectRules.strictReview.physicalDamage.unknownOrMixed.tsv
```

見るポイント:

```txt
物理与ダメージ増加バフ系 → outgoing
軽減/盾/ガード/バリア系 → reduction
反射/リフレクト系 → reflect
混在または判断不能 → unknown_or_mixed
```

## 5. コミット

```powershell
git add tools/review-native-effect-rule-candidates.mjs docs/native-effect-rule-physical-damage-classification-v1.md APPLY_NATIVE_EFFECT_RULE_PHYSICAL_DAMAGE_CLASSIFICATION_WINDOWS.md MANIFEST_NATIVE_EFFECT_RULE_PHYSICAL_DAMAGE_CLASSIFICATION.json
git commit -m "Classify physical damage effect candidates"
git push
```

`dist/native-effect-rules/` は調査出力なので、通常はコミットしません。
