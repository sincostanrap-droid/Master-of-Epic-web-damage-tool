# Wiki常時発動HTML置き場

`tools/build-wiki-equip-buff-effects.mjs` でMoE Wikiの「アイテム/追加効果/常時発動」HTMLを再解析したい場合、保存したHTMLをこのフォルダへ置いてください。

既定では `*.htm` を読み込みます。

```powershell
node tools/build-wiki-equip-buff-effects.mjs
```

HTMLを置かずに、同梱済みの `src/data/generated/wikiEquipBuffEffects.generated.js` を現在の公式DBカタログへ再照合するだけなら、次を実行します。

```powershell
node tools/build-wiki-equip-buff-effects.mjs --rematch-only
```
