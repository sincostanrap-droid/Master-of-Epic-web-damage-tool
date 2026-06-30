# 適用手順: クリティカル率UP系の手動昇格

PowerShellでリポジトリ直下に移動します。

```powershell
git status --short
```

このZIPの中身をリポジトリ直下へコピーします。

追加されるファイル:

```txt
tools/promote-native-critical-rules.mjs
docs/native-effect-rule-promotion-critical-v1.md
APPLY_NATIVE_EFFECT_RULE_PROMOTE_CRITICAL_WINDOWS.md
MANIFEST_NATIVE_EFFECT_RULE_PROMOTE_CRITICAL.json
```

手動昇格スクリプトを実行します。

```powershell
node tools/promote-native-critical-rules.mjs
node tools/build-native-effect-rules.mjs
```

確認:

```powershell
Select-String -Path .\data\manual\nativeEffectRules.manual.tsv -Pattern "クリティカル率UP" -Context 0,0
Select-String -Path .\src\data\generated\nativeEffectRules.generated.js -Pattern "クリティカル率UP" -Context 0,8
```

突合ページでも確認します。

```powershell
python -m http.server 8095
```

```txt
http://localhost:8095/native-effect-rule-matcher.html
```

検索例:

```txt
クリティカル率UP
黒猫のお面
龍の籠手
```

コミット:

```powershell
git add tools/promote-native-critical-rules.mjs docs/native-effect-rule-promotion-critical-v1.md APPLY_NATIVE_EFFECT_RULE_PROMOTE_CRITICAL_WINDOWS.md MANIFEST_NATIVE_EFFECT_RULE_PROMOTE_CRITICAL.json data/manual/nativeEffectRules.manual.tsv src/data/generated/nativeEffectRules.generated.js
git commit -m "Promote native critical rate rules"
git push
```
