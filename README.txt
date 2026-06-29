Master of Epic 物理ダメージ計算webツール v1.23.11 / 長音符正規化修正

差し替え対象:
- src/main.js
- styles/main.css
- README.md
- tools/build-equipment-catalog-from-google-sheet.mjs
- src/data/generated/equipmentCatalog.generated.js
- src/data/generated/buffCatalog.generated.js

概要:
- 新タブ「装備カタログ α」を追加しました。
- Googleスプレッドシートから生成した装備カタログを検索し、使うものだけ装備登録へ追加できます。
- 公式DB add_status 名をツール内部ステータスキーへ変換する対応表を追加しました。
- 生産・生活・感覚系など物理ダメージ計算に使わない add_status は既知の非対象として分類します。
- 生成カタログに statKey / ignored を付与し、未対応add_statusは計算対象だけ警告します。
- カタログに存在するだけでは計算対象になりません。
- 生成用スクリプト tools/build-equipment-catalog-from-google-sheet.mjs を追加しました。

生成:
node tools/build-equipment-catalog-from-google-sheet.mjs

別Spreadsheet ID:
node tools/build-equipment-catalog-from-google-sheet.mjs --spreadsheet-id=スプレッドシートID

ローカルTSV/CSVから生成:
node tools/build-equipment-catalog-from-google-sheet.mjs --input-dir=dist/moe-official-db
