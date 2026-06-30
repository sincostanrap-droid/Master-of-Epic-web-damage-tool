# 物理ダメージ系候補の分類レビュー v1

このパッチは、`physicalDamagePct` をそのまま「物理与ダメージ%」として扱わないためのレビュー強化です。

## 背景

既存の候補抽出では、表記ゆれを広めに拾うため `physicalDamagePct` という曖昧なキーにまとめていました。
しかし実際には、以下が混在します。

- 物理与ダメージ増加
- 物理ダメージ軽減 / 被ダメージ軽減
- 物理反射 / リフレクト
- 盾・ガード・バリア系の特殊効果
- 文脈だけでは判別不能なもの

そのため、`physicalDamagePct` は昇格禁止扱いにし、レビュー段階で次の候補キーへ分類します。

| 分類 | 推奨キー | 意味 |
| --- | --- | --- |
| outgoing | `physicalOutgoingDamagePct` | 攻撃側の物理与ダメージ補正 |
| reduction | `physicalDamageReductionPct` | 被物理ダメージ軽減・防御側補正 |
| reflect | `physicalReflectPct` | 物理反射・リフレクト |
| unknown_or_mixed | `physicalDamageUnknownPct` | 与/被/反射が未判定、または混在 |

## 出力

`node tools/review-native-effect-rule-candidates.mjs` 実行時に、従来のレビューTSVに加えて以下が出ます。

```txt
dist/native-effect-rules/nativeEffectRules.strictReview.physicalDamage.all.tsv
dist/native-effect-rules/nativeEffectRules.strictReview.physicalDamage.outgoing.tsv
dist/native-effect-rules/nativeEffectRules.strictReview.physicalDamage.reductionOrReflect.tsv
dist/native-effect-rules/nativeEffectRules.strictReview.physicalDamage.unknownOrMixed.tsv
```

## 重要な注意

この分類はレビュー補助です。`suggested_stat_key` が出ても、即 `nativeEffectRules.manual.tsv` へ昇格してはいけません。

昇格前に必ず確認すること:

1. 公式DB / Wiki / Scrapbox / 手元検証で効果説明を確認する
2. 与ダメージ・被ダメージ軽減・反射のどれかを確認する
3. 数値が一致することを確認する
4. 条件付き、WarAge無効、併用不可、発動率などを notes / unsupported_json に残す
5. `verification` を `verified` または `provisional` にする

## 方針

物理ダメージ系は、本体計算接続前に `physicalDamagePct` を使わない方針にします。
今後の自作ルールでは、攻撃側の与ダメージ補正だけを `physicalOutgoingDamagePct` として扱います。
