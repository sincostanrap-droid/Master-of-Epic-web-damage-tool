# 自作効果ルール突合 v1

この差分は、`nativeEffectRules.manual.tsv` から生成した自作効果ルールと、装備カタログ上の装備名・Buff名・テクニックIDを突き合わせる開発用ページを追加します。

## 目的

- MoEForge系の外部抽出データを正本にしない。
- 公式DB由来の装備カタログと、自前で管理する `nativeEffectRules.manual.tsv` を突合する。
- どの装備Buffが自作ルールに一致しているかを確認する。
- 未登録Buff、説明のみ、未対応効果を見落とさない。

## 追加ファイル

- `native-effect-rule-matcher.html`
- `src/effects/nativeEffectRuleMatcher.js`
- `docs/native-effect-rule-matching-v1.md`
- `APPLY_NATIVE_EFFECT_RULE_MATCHER_WINDOWS.md`
- `MANIFEST_NATIVE_EFFECT_RULE_MATCHER.json`

## 本体計算への影響

ありません。

このページは開発用の確認ページであり、既存の物理ダメージ計算・装備登録・最適化処理には接続していません。

## 使い方

ローカルサーバーを起動します。

```powershell
python -m http.server 8095
```

ブラウザで開きます。

```text
http://localhost:8095/native-effect-rule-matcher.html
```

確認例:

- `怪鳥の力`
- `ミリタリーアーツ`
- `コブラ オーラ`
- `三巳一体`

## 見るポイント

- 装備カタログが読み込めているか。
- Buff名またはテクニックIDから自作ルールに一致しているか。
- Buffありなのに未登録の装備がどれだけあるか。
- 直接効果とBuff由来効果が混ざって見えていないか。
- 説明/未対応メモが保持されているか。
