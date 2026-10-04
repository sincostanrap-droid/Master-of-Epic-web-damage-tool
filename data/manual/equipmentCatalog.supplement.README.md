# 装備カタログのWiki補完入力

正本は equipmentCatalog.supplement.json。公式DB由来の装備と区別した wiki- IDを使う。公式シート全生成と公式差分更新の双方がこの入力を既存の toCatalog で変換・統合する。

既存のカタログを保持して補完だけ再生成する場合:

```powershell
node tools/build-equipment-catalog-from-google-sheet.mjs --supplements-only
```

シュライン ナイト7部位はユーザー提供のEUC-JP HTML「MoE Wiki (main) - アイテム_防具_特産品.htm」の着こなし91.0欄が根拠。素材「オリ」はオリハルコンとして保存。PMと転送○はメタデータ。重量は各部位の値のみを採用（合計40.50）。矛盾するセット総重量41.50、セットAC、フレーバー説明は保存しない。着こなし不足時の処理は既存計算に委ねる。
