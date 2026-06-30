# 自作効果ルール突合 v1 適用手順 Windows

## 前提

`feature/native-effect-rules-v1` で自作効果ルール土台が入っていること。

## 適用

ZIPを展開し、中身をリポジトリ直下へコピーします。

配置:

```text
Master-of-Epic-web-damage-tool/
  native-effect-rule-matcher.html
  src/effects/nativeEffectRuleMatcher.js
  docs/native-effect-rule-matching-v1.md
  APPLY_NATIVE_EFFECT_RULE_MATCHER_WINDOWS.md
  MANIFEST_NATIVE_EFFECT_RULE_MATCHER.json
```

## 動作確認

```powershell
python -m http.server 8095
```

```text
http://localhost:8095/native-effect-rule-matcher.html
```

検索例:

```text
怪鳥の力
ミリタリーアーツ
コブラ オーラ
三巳一体
```

## コミット

```powershell
git status --short
git add native-effect-rule-matcher.html src/effects/nativeEffectRuleMatcher.js docs/native-effect-rule-matching-v1.md APPLY_NATIVE_EFFECT_RULE_MATCHER_WINDOWS.md MANIFEST_NATIVE_EFFECT_RULE_MATCHER.json
git commit -m "Add native effect rule matcher"
git push
```

## 注意

この差分は本体計算には接続しません。
