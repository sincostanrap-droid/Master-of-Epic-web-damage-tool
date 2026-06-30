# Native Effect Rule Candidate Strict Review v1

この文書は、`nativeEffectRules.candidates.tsv` をそのまま昇格しないためのレビュー方針をまとめたものです。

## 背景

候補抽出は `data/manual/buffRules.manual.refined.tsv` などの既存手動データから、火力計算に関係しそうな文字列を機械的に拾います。

そのため、次のような混入が起こります。

- Buff効果ではなく、装備側の付加ステータスを拾う
- `攻撃ディレイ` ではない `音楽ディレイ` / `魔法ディレイ` / `アイテム使用ディレイ` を拾う
- `equipment_names` に含まれる `攻撃ディレイ減少バフ` などの表示名を効果として扱ってしまう
- notesに複数の値が混在している

## 方針

`candidate-auto-review` は「候補として見つかった」だけであり、計算用ルールとしては未承認です。

昇格してよいのは、以下を満たしたものだけです。

1. 効果がBuff/特殊効果由来であることを確認した
2. 装備側ステータスではないことを確認した
3. `攻撃ディレイ` と、他のディレイ種別を区別できている
4. 併用不可/優先度/WarAge無効/確率/条件の扱いを記録した
5. `effects_json` に入れるstatを必要最小限に絞った

## 追加ツール

```powershell
node tools/review-native-effect-rule-candidates.mjs
```

出力:

```txt
dist/native-effect-rules/nativeEffectRules.strictReview.all.tsv
dist/native-effect-rules/nativeEffectRules.strictReview.combat.tsv
dist/native-effect-rules/nativeEffectRules.strictReview.attackDelay.needsManual.tsv
dist/native-effect-rules/nativeEffectRules.strictReview.likelyMixedOrNonCombat.tsv
dist/native-effect-rules/nativeEffectRules.strictReview.summary.json
```

## 重要

このツールはレビュー専用です。

`data/manual/nativeEffectRules.manual.tsv` は変更しません。
`src/data/generated/nativeEffectRules.generated.js` も変更しません。
