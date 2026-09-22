# 弓・銃・矢弾対応

- Wikiから矢 20件、銃弾 10件を生成。
- 弓は弓本体+矢、銃は銃本体+銃弾のダメージと射程を加算。
- 近接武器では矢・弾を計算に使用しない。
- 装備カタログへ矢・弾を追加。スロット「武器: 弾丸」で絞り込み可能。
- 矢・弾の必要スキルはWiki表の区切りを使用。


## v1.1 catalog loading fix

- Added `src/data/generated/ammoCatalog.generated.js` to `CATALOG_SCRIPT_URLS`.
- The generated arrow/bullet entries are now actually loaded when the equipment catalog opens.
- Ammo entries use slot `武器: 弾丸`, so they can be searched and added through the normal catalog flow.
