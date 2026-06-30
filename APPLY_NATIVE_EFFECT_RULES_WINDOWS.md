# 適用手順: 自作効果ルール v1

PowerShellでリポジトリ直下に移動します。

```powershell
git switch feature/native-effect-rules-v1
git status
```

`nothing to commit, working tree clean` を確認してから、このZIPの中身をリポジトリ直下へコピーします。

追加されるファイル:

```txt
data/manual/nativeEffectRules.manual.tsv
tools/build-native-effect-rules.mjs
src/data/generated/nativeEffectRules.generated.js
src/effects/nativeEffectResolver.js
docs/native-effect-rules-v1.md
APPLY_NATIVE_EFFECT_RULES_WINDOWS.md
MANIFEST_NATIVE_EFFECT_RULES.json
```

生成テスト:

```powershell
node tools/build-native-effect-rules.mjs
```

差分確認:

```powershell
git status --short
git diff --stat
```

コミット:

```powershell
git add data/manual/nativeEffectRules.manual.tsv tools/build-native-effect-rules.mjs src/data/generated/nativeEffectRules.generated.js src/effects/nativeEffectResolver.js docs/native-effect-rules-v1.md APPLY_NATIVE_EFFECT_RULES_WINDOWS.md MANIFEST_NATIVE_EFFECT_RULES.json
git commit -m "Add native effect rule foundation"
git push -u origin feature/native-effect-rules-v1
```

このパッチは既存の物理計算には接続しません。
