# 自作効果ルール候補抽出 v1

この追加分は、MoEForge系データを使わず、既存の自前整理データから `nativeEffectRules.manual.tsv` に移せそうな候補を作るための開発補助です。

## 追加されるツール

- `tools/extract-native-effect-rule-candidates.mjs`
  - `data/manual/buffRules.manual.refined.tsv` などから候補を抽出します。
  - 出力は `dist/native-effect-rules/nativeEffectRules.candidates.tsv` です。
  - 既存の `data/manual/nativeEffectRules.manual.tsv` は直接変更しません。
  - 候補は `enabled=FALSE` で出力されます。人間が確認してから manual TSV に移します。

- `tools/report-native-effect-rule-coverage.mjs`
  - 装備カタログ上の Buff と `nativeEffectRules.generated.js` の一致状況をレポートします。
  - 出力は `dist/native-effect-rules/nativeEffectRuleCoverage.*.tsv` です。

## 基本フロー

```powershell
node tools/extract-native-effect-rule-candidates.mjs
node tools/report-native-effect-rule-coverage.mjs
```

候補を見ます。

```powershell
Get-Content .\dist\native-effect-rules\nativeEffectRules.candidates.tsv -First 20
Get-Content .\dist\native-effect-rules\nativeEffectRuleCoverage.uncoveredBuffNames.tsv -First 30
```

候補の中から信用できるものだけを `data/manual/nativeEffectRules.manual.tsv` にコピーし、`enabled` を `TRUE` にします。

その後、生成します。

```powershell
node tools/build-native-effect-rules.mjs
```

## 注意

候補抽出は正本ではありません。既存の自前整理データに含まれる表現を機械的に拾うだけです。

特に次のものは必ず人間確認してください。

- 併用不可、優先度、上書き関係
- WarAge 無効
- 夜間限定、条件付き
- 追撃、追加ダメージ、専用技発動
- 物理与ダメージ% と攻撃力% の混同
- スキル効果+ とステータス+ の混同

## コミット方針

`dist/native-effect-rules/` は調査出力なので、基本的にはコミットしません。
コミットするのは、レビュー済みで `data/manual/nativeEffectRules.manual.tsv` に反映したルールと、生成後の `src/data/generated/nativeEffectRules.generated.js` です。
