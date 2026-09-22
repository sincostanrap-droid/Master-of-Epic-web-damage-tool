# v1.24.10 公式DBカタログ補完（2026-09-21）

基準: GitHub main `cc9f42cc6109dc83d2267bb22c58f98a03c25581`。

## 収録内容

公式DBの公開ページから新着43件と取りこぼし2件、合計45件を追加した。
取りこぼしは [緊箍児](https://idb.moepic.com/items/defences/23393) と
[カラコンメガネ](https://idb.moepic.com/items/defences/23384)。
既存装備の行・取得日時・確定済みBuff定義は維持している。

| カテゴリ | 更新前の一意ID数 | 追加 | 更新後 | 公式一覧の件数 |
| --- | ---: | ---: | ---: | ---: |
| 武器 | 1,840 | 3 | 1,843 | 1,843 |
| 防具・装飾 | 9,548 | 42 | 9,590 | 9,590 |
| 盾 | 334 | 0 | 334 | 334 |
| 合計 | 11,722 | 45 | 11,767 | 11,767 |

旧データには同一IDの重複行が防具5行・盾65行ある。
今回はその除去を行っていないため、生成ファイルの行数は11,792→11,837。
画面のカタログ処理は既存のID重複除去を使う。Buffカタログは1,648→1,673。

一覧の件数一致は、全既存装備の数値・説明を再取得した保証ではない。
今回の範囲は新着IDと判明した不足IDの補完。
既存IDの性能変更・削除を全ページ走査して反映する処理ではない。

## 新規Buffの扱い

25件は公式原文を表示・検索できるよう収録し、
`reviewStatus: unverified / reviewComplete: false` とした。
数値が明記されている箇所も含め、今回は新規Buffの数値計算へは追加しない。
効果量、条件、併用関係の確認が必要。
倍率や回復量がない説明に推定値を入れていない。
装備本体の追加ステータスは通常どおり計算する。
既存Buffを持つ新装備には、これまでの確定済みルールが適用される。

監査の `remaining=0` は新規Buffの計算実装完了を意味しない。
今回追加分は `unverifiedReview.pending=25` として残る。
従来の最終未検証7件も維持する。

## 取得経路・更新ツール

公式の [武器一覧](https://idb.moepic.com/items/weapons?sortby=0&order=1)、
[防具一覧](https://idb.moepic.com/items/defences?sortby=0&order=1)、
[盾一覧](https://idb.moepic.com/items/shields?sortby=0&order=1) の
公開HTML内 `data-page` JSONを使用する。ログインやプロキシWorkerは不要。

`tools/update-equipment-catalog-from-official.mjs` は新しいIDを降順に取得し、
既存最大IDに達したところで止まる。ページ番号、降順、総件数、追加ステータス、
Buff参照の欠落を検査する。古いIDの不足は `--include` で明示して取得できる。
主武器スキルと `need_skills` の追加条件を合成して複数要件を保持する。
従来のGoogleシート生成ツールの数値マッピングを共用している。

Node.js 18以上。更新結果はまず別ディレクトリへ出す。

```powershell
node .\tools\update-equipment-catalog-from-official.mjs --out=dist/official-update --cache-dir=dist/official-source --include=defences:23393,defences:23384
```

出力の `official-update-report.json` で追加装備、新規Buff、既存Buff説明の差分を確認する。
ツールはmanualのBuff計算ルールを自動作成しない。
新規Buffを追加するときは、原文表示と未検証状態も併せて登録して監査する。
既存IDの不足は自動検出しないため、公式件数と一意ID数の照合が必要。

`--offline` は保存したページJSONから再生成する。
同じ45件を再現する場合は、基準コミットのカタログ2ファイルを用意して
`--base=そのディレクトリ` を指定する。
更新後のカタログを基準にした場合、収録済みIDは再追加しない。

追加45件と25Buffの一覧・公式原文・取得範囲は
`docs/official-catalog-update-20260921.json` に保存した。

## 確認範囲

- 実カタログを読み込む回帰テストとBuff監査。
- 45件の追加・既存行の非変更・既存Buff定義の維持。
- 新規Buff原文の表示・検索、未検証フラグ、計算値を追加していないこと。
- 複数必要スキル、追加ステータスの一度だけの加算、ページ不整合時の停止。
- カタログJSのキャッシュ更新。

ブラウザ実機での表示確認はユーザー側で行う。
次の課題は新規25Buffの効果量・条件・併用関係の調査と反映。
