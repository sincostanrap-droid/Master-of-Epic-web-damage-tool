# v15.3 damage buff compatibility fix

v15.2では、攻撃力変換のページ上グループ `conversion:attack:A/B/C...` は入るようにしたが、既存候補データ側の汎用 `attack-conversion` が残り得た。

v15.3では以下を行う。

- `applyEquipBuffRuleCandidateToEquipment()` が汎用 `attack-conversion` を代表競合グループに入れないようにする。
- `catalogEquipmentToRow()` の最後で汎用 `attack-conversion` を安全弁として削除する。
- `equipBuffRuleCandidates.generated.js` 内の `"conflictGroup": "attack-conversion"` を空にする。
- Wiki併用2由来の `conversion:attack:A/B/C...` は維持する。

これにより、攻撃力変換系はページ通りのグループ分けだけが代表競合として残る。
