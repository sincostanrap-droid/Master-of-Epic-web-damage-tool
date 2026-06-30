# クリティカル率UP系の手動昇格 v1

`dist/native-effect-rules/nativeEffectRules.review-combat.tsv` の候補から、まず安全に切り出しやすい `クリティカル率UP A/B Lv1〜Lv3` だけを `data/manual/nativeEffectRules.manual.tsv` に追加します。

## 方針

候補抽出では、同じ行に攻撃力、命中、回避、攻撃ディレイなども混ざっている場合があります。
これは装備本体の追加ステータスや別説明を拾っている可能性があるため、今回の昇格では採用しません。

採用するのは以下のみです。

- `クリティカル率UP A Lv1`: `criticalRate: 1`
- `クリティカル率UP A Lv2`: `criticalRate: 2`
- `クリティカル率UP A Lv3`: `criticalRate: 3`
- `クリティカル率UP B Lv1`: `criticalRate: 1`
- `クリティカル率UP B Lv2`: `criticalRate: 2`
- `クリティカル率UP B Lv3`: `criticalRate: 3`

`verification` は `provisional-manual` とし、計算接続前に最終確認できるようにしています。
