# 装備効果 突合ビュー v1 適用手順

このパッチは `feature/effect-catalog-v1` ブランチ上で適用してください。`main` へはまだマージしません。

## 1. ブランチ確認

```powershell
git switch feature/effect-catalog-v1
git status
```

`nothing to commit, working tree clean` を確認します。

## 2. ZIPを展開してコピー

ZIPの中身をリポジトリ直下へコピーしてください。

正しい配置:

```txt
Master-of-Epic-web-damage-tool/
  equipment-effect-matcher.html
  src/effects/equipmentEffectMatcher.js
  docs/equipment-effect-matcher-v1.md
  APPLY_EQUIPMENT_EFFECT_MATCHER_WINDOWS.md
  MANIFEST_EQUIPMENT_EFFECT_MATCHER.json
```

## 3. コミット

```powershell
git status
git add equipment-effect-matcher.html src/effects/equipmentEffectMatcher.js docs/equipment-effect-matcher-v1.md APPLY_EQUIPMENT_EFFECT_MATCHER_WINDOWS.md MANIFEST_EQUIPMENT_EFFECT_MATCHER.json
git commit -m "Add equipment effect matcher"
git push
```

既存PRに自動で追加されます。新しいPRは作らなくて大丈夫です。

## 4. 動作確認

```powershell
python -m http.server 8080
```

ブラウザで開きます。

```txt
http://localhost:8080/equipment-effect-matcher.html
```

本体を同じ `http://localhost:8080/` で触ったあとに開くと、ブラウザ保存データから装備候補を自動探索します。

## 5. 確認すること

- 画面が開く
- 装備候補が表示される
- 装備名/Buff名/BuffStatsから候補が出る
- 既存の計算結果が変わっていない
- 以前の中立表記確認コマンドで固有名が残っていないこと
