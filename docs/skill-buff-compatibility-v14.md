# v14: スキル値+装備BuffのWiki併用表取り込み

## 目的

MoE Wiki `アイテム/追加効果/併用` に載っているスキル効果アップ系の表を、装備カタログ由来の装備Buffへ紐づける。

今回の対象は次の2点。

- Buff名から `スキル+` 表示効果を自動投入する
- 安全に単一グループへ落とせる場合だけ、装備Buffの競合グループへ自動設定する

## 入力元

- `src/data/generated/equipmentCatalog.generated.js`
- `src/data/generated/buffCatalog.generated.js`
- アップロードされた `MoE Wiki (main) - アイテム_追加効果_併用.htm`

## 生成データ

- `src/data/generated/skillBuffCompatibility.generated.js`
- `dist/skill-buff-compatibility/skillBuffCompatibility.review.tsv`
- `dist/skill-buff-compatibility/skillBuffCompatibility.summary.json`

## 集計

- Wiki表の行数: 251
- ユニークBuff名: 188
- 対象スキル: 17
- カタログBuff名と一致した行: 251
- 数値が確定していてスキル+として自動投入できる行: 246
- 競合グループまで安全に自動投入できる行: 162

## 実装方針

`skillBuffCompatibility.generated.js` をカタログ系スクリプトと一緒に読み込む。

カタログから装備を追加するとき、装備Buff名でWiki併用表を検索し、数値が確定している行だけ `extraEffects` の `skillPlus` として追加する。

効果量が `+？` の行は自動投入しない。

グループが `A？` のように未確定のもの、または備考や節コメントに未検証・優先・上書きなどの注意があるものは、競合グループの自動設定対象から外す。

現行UIの装備Buff競合グループは単一グループ前提なので、1つのBuffが複数スキル+を持ち、競合グループも複数になる場合は自動設定しない。その場合は `equipBuffSourceText` にレビュー注意として残す。

## 注意

スキル+効果は現時点では「計算未対応・表示用効果」として入る。個別テクニックの威力・効果時間にどう反映するかは、技ごとの計算式が必要になるため、このパッチでは `src/calc/core.js` は変更しない。

ただし、競合グループ代表を選ぶときに、`skillPlus` 表示効果の値もスコアへ加える。これにより、同じスキル+競合グループで `+10` と `+20` が並んだ場合、原則として `+20` 側が残りやすくなる。
