# v1.24.9 保守記録（2026-09-21）

基準: GitHub main `97c2ea3e255f7e6c78952b775a6ecb84023352ca`。
既存機能の修復を行い、技能限定ディレイの新しい計算機構は追加しない。

## 今回の修正

- HTMLから参照されていた `showcaseElementDamageTotals.js` と
  `showcaseRecoveryTotals.js` を復元し、404を解消。
- 属性強化は装備Buff展開・競合解決後の有効行を集計。
  同一technicの重複、Buff OFF、装備不使用、除外行を加算しない。
- 自然回復・継続増減は既存の計算済み追加ステータスを表示。
  自然回復の `/分` と継続増減の `/秒` を区別する。
- 表示とコピー欄を同期し、効果がなくなったときは集計行を消す。
  既存のスキル強化見出しと共存し、繰り返し描画でも見出しを増殖させない。
- 属性強化を物理ダメージ式へ加算する変更はない。
- READMEの現在バージョン、実行時manualの場所、skillPlusの対応範囲を整理。

## カタログの再取得結果

既存生成ツールが参照する [Googleシート](https://docs.google.com/spreadsheets/d/10nHr68XojjuxxJrpLBENrDWUB4TywMGy8CTe9lzclSE/edit)
から3シートを取得し、一時ディレクトリで再生成して現行データと照合した。

| データ | 取得行数 |
| --- | ---: |
| items_all | 11,792 |
| add_status | 34,196 |
| equip_buff | 3,485 |
| 生成される装備 | 11,792 |
| 生成されるBuff | 1,648 |

装備・Buffの追加、削除、数値、説明、必要スキル、Buff参照に差分はなかった。
装備70件で `fetchedAt` だけが異なり、再取得側の時刻は現行より古かった。
全装備の公式DB取得日は2026-06-29のまま。
このため生成日時だけを更新したファイルへの置換は行わない。
「9月時点の公式DBを全件取得済み」「最新装備を収録済み」という意味ではない。

取得CSVのSHA-256（再照合用）:

```text
items_all: 7c1b4ac433acf897231ab7392d2d2c1455a8adf35dc4c3bf4aa3daa454de9170
add_status: dcce93dc3191a1bef80607ee18170e88267eeb2fa7fae31c5668645d51673029
equip_buff: 86109cbcdc0eac7113a534394c1bd0472b48429ef42ecb0eb300584c7dd39a69
```

## 残課題

1. 公式DBから元シートへの収集を更新し、新しい装備の増減を確認する。
   現在のリポジトリ内の生成ツールはシートを読むもので、公式DB全件収集は行わない。
2. 更新後のカタログで、確定済みmanualと新規Buff候補を再監査する。
3. 根拠未確定の効果は数値を推定して計算へ入れず、引き続き確認対象とする。

技能限定ディレイの対象技計算やGPU対応は、この保守作業には含めない。

## 確認コマンド（PowerShell、リポジトリ直下）

```powershell
Get-ChildItem .\tests\*.test.cjs | ForEach-Object {
    node $_.FullName
    if ($LASTEXITCODE -ne 0) { throw "Test failed: $($_.Name)" }
}
node .\tools\audit-equipment-buff-manual.mjs
if ($LASTEXITCODE -ne 0) { throw "Buff audit failed" }
python -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開く。終了はサーバー側で `Ctrl+C`。
フレイム デビル ウイングのBuffを有効にして属性強化合計を確認し、
光のブローチのBuffを有効にしてHP自然回復合計を確認する。
BuffをOFFにすると対象合計が減ること、コピー欄に重複がないことを確認する。
