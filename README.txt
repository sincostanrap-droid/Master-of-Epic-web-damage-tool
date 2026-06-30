v1.23.22 / 装備Buff修正UI改善・カタログソート再投入

- 装備Buff修正タブでは、同一technic_id由来の既定グループを競合グループ欄に表示しないようにしました。内部では同一technic_idは最新1つだけ有効です。
- 手動入力した競合グループだけを競合グループとして表示・管理します。
- 装備Buff修正タブに検索、手動競合ありのみ、効果入力済みのみの絞り込みを追加しました。
- 詳細追加ステータス/効果追加を折りたたみ、主要数値と原文確認を優先するUIにしました。
- 装備登録側の装備Buff編集欄を折りたたみました。
- 装備カタログαにソート、昇順/降順、表示件数指定を再投入しました。

v1.23.22 / 装備Buff修正UI改善・カタログソート再投入

- 装備Buff修正タブをBuff編集専用UIに整理。装備本体の追加ステータスは非表示。
- 同一technic_idのBuffは1件に集約表示し、編集内容を同じIDの装備行へ反映。
- 競合グループと重複ルールを装備Buff修正タブで直接編集可能。
- Wiki/Scrapbox原文を説明欄として表示。

v1.23.20 / 装備Buff修正タブ・TSV候補自動投入
- 新タブ「装備Buff修正」を追加。装備登録にあるBuff付き装備を一覧し、既存の装備Buff編集UIで修正できます。
- 装備カタログからBuff付き装備を追加した時、src/data/generated/equipBuffRuleCandidates.generated.js の候補値を初期値として装備Buffへ投入します。
- Wiki原文 / Scrapbox根拠行 / 抽出ヒントを装備Buff編集欄に表示・編集できます。
- 同一technic_idは内部処理で最新1つのみ有効にします。technic-ID は手動競合グループとしては表示しません。
- 魔力→移動速度% の保持・表示欄を追加。
- tools/build-equip-buff-candidates-from-tsv.mjs を追加。
- tools/clear-dev-cache.mjs を追加。

候補JS生成:
node tools/build-equip-buff-candidates-from-tsv.mjs --input=data/manual/buffRules.manual.refined.tsv

キャッシュ削除:
node tools/clear-dev-cache.mjs
または PowerShell: Remove-Item -Recurse -Force data\cache\scrapbox

Master of Epic 物理ダメージ計算webツール v1.23.19 / Buff変換系列・TSV精度補正

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



v1.23.18 / Scrapbox照合ノイズ抑制
- Scrapbox補完TSVに「Scrapbox照合品質」「Scrapbox除外ページ」を追加。
- Buff名/装備名/参照ページの照合を分け、短い英字・数値系Buffで無関係なページを拾いすぎる問題を抑制。
- 作り直し推奨: node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --refresh-cache --limit=0

v1.23.17 / Scrapbox補完TSV自動生成対応
- Scrapbox補完スクリプト実行時、既定入力TSVが未作成または0行なら、入力TSVを自動生成してから補完します。
- 既に Wiki装備Buff効果候補を生成済みなら、次の1コマンドで補完できます。
  node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --limit=0

## v1.23.16 / Scrapbox自動取得補完対応

- Scrapbox補完スクリプトに `--auto-fetch` を追加。
- Medi記録Scrapbox版の公開ページ一覧を自動取得して、Buff名・Wiki名・装備名とのローカル照合に使います。
- 取り直しは `--refresh-cache`。

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --limit=0
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --apply-hints --limit=0
```

## v1.23.15 / Scrapbox装備Buff補完TSV対応

- `tools/enrich-buff-rules-template-from-scrapbox.mjs` を追加しました。
- `data/manual/buffRules.manual.input.tsv` の装備名/Buff名から Medi記録Scrapbox版を検索し、重複・併用・効果の根拠候補を `data/manual/buffRules.manual.scrapbox.tsv` に追記します。
- 既定では既存のTSVを直接上書きせず、補完済みTSVを別名出力します。
- `--apply-hints` を付けると、未入力の補助欄にScrapbox由来ヒントを反映できます。

実行例:

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs
node tools/enrich-buff-rules-template-from-scrapbox.mjs --limit=0 --apply-hints
node tools/build-buff-rules-manual-from-tsv.mjs --input=data/manual/buffRules.manual.scrapbox.tsv
```
