Master of Epic 物理ダメージ計算webツール v1.23.12 / Wiki装備Buff効果候補インポート

差し替え対象:
- src/main.js
- styles/main.css
- README.md
- tools/build-equipment-catalog-from-google-sheet.mjs
- src/data/generated/equipmentCatalog.generated.js
- src/data/generated/buffCatalog.generated.js
- src/data/generated/wikiEquipBuffEffects.generated.js
- src/data/manual/buffRules.manual.js
- tools/build-wiki-equip-buff-effects.mjs

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


Wiki装備Buff効果候補生成:
- MoE Wikiの「アイテム/追加効果/常時発動」HTMLから装備Buff効果候補を生成します。
- 候補は計算へ即反映せず、src/data/generated/wikiEquipBuffEffects.generated.js に開発用データとして保存します。
- 不明・条件付き・未照合のものは dist/wiki-equip-buff-effects/wikiEquipBuffEffects.unresolved.tsv に出力します。

再照合のみ:
node tools/build-wiki-equip-buff-effects.mjs --rematch-only

HTMLから再解析:
node tools/build-wiki-equip-buff-effects.mjs --input="data/wiki/equip-buff-effects/*.htm"

v1.23.13 / Buff手入力TSVテンプレート
- data/manual/buffRules.manual.input.tsv を生成する tools/build-buff-rules-template.mjs を追加
- TSVから src/data/manual/buffRules.manual.js を生成する tools/build-buff-rules-manual-from-tsv.mjs を追加
- data/manual/README.md と example TSV を追加
