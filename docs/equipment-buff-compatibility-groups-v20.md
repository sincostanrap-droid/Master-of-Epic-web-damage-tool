# v20: 装備Buff併用グループの復元・永続化

## 目的

Wiki `アイテム/追加効果/併用` と `アイテム/追加効果/併用2` から生成した競合グループを、装備Buff名から再適用し、TSV/JSON/装備だけTSVに残す。

## 修正内容

- `equipBuffName` から skillPlus / damage / critical / conversion / magic / element の競合グループを復元する。
- `equipBuffConflictGroup` だけでなく、複数軸用の `equipBuffConflictGroups` を持つ。
- `equipmentBuffCompositeTags()` で全競合グループを composite tags に渡す。
- `catalogEquipmentToRow()` の返却前にも競合グループを復元する。
- TSV/装備だけTSVに `equipBuffCatalogId`, `equipBuffTechnicId`, `equipBuffConflictGroup`, `equipBuffConflictGroups`, `equipBuffStackRule` を追加する。
- 汎用 `attack-conversion` は代表グループとして使わず、`conversion:attack:A/B/...` を使う。

## 期待例

- `黄金の呪い`: `damage:physical:K`
- `闘魂`: `damage:physical:L`
- `サイボーグ`: `damage:physical:H`
- `ミリタリーアーツ`: `damage:physical:B`
- `クラスカード・アーチャー`: `conversion:attack:H`
- `戦乙女の力`: `conversion:attack:I`
- `竜王の腕`: `damage:physical:*` と `critical:*` の複数軸

## 注意

既に保存済みTSVは旧列のまま読み込める。パッチ適用後に再保存すると新しい競合グループ列が追加される。
