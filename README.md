# Master of Epic 物理ダメージ計算webツール - 分割版

これは、単一HTMLで肥大化してきたツールを **HTML / CSS / JS に分離した版** です。

## ファイル構成

```text
index.html
styles/main.css
src/main.js
src/optimizer/optimizer.worker.js
legacy/single_html_latest.html
```

## 起動方法

ZIPを展開してから `index.html` を開いてください。ZIP内から直接開くとCSS/JSが読めないことがあります。

GitHub Pages にそのまま置けます。

ローカルで確認する場合は、`file://` 直開きより簡易サーバー推奨です。

```bash
python -m http.server 8000
```

ブラウザで開きます。

```text
http://localhost:8000/
```

## 今回やったこと

- `<style>` を `styles/main.css` へ分離
- `<script>` を `src/main.js` へ分離
- 現行の単一HTML版を `legacy/single_html_latest.html` に保存
- 次フェーズ用に `src/optimizer/optimizer.worker.js` を追加

## まだWorker化していない理由

現在の最適化処理は、計算ロジックの一部がまだグローバル `state` や画面側関数に依存しています。
そのままWorkerへ移すと壊れる可能性が高いため、まずは安全に単一HTML卒業だけ済ませています。

## 次フェーズ

1. `computeMetrics` と `normalizeEquipmentRows` 周辺をDOM非依存にする
2. `runOptimizer({ state, inputs, settings })` を作る
3. `optimizer.worker.js` に移す
4. 進捗バーとキャンセルボタンを追加する


## Worker v1

この版では、最適化処理を `src/optimizer/optimizer.worker.js` から実行するようにしました。

- UI側: `src/main.js`
- Worker側: `src/optimizer/optimizer.worker.js`
- Workerが読み込む計算関数: `src/main.js` 内の `runOptimizerCore(...)`

`runIntegratedOptimizer()` は、現在の画面状態を `payload` にしてWorkerへ送ります。
Workerは結果と進捗を `postMessage` で返します。

### 注意

`file://` 直開きだとブラウザによってWorkerが制限される場合があります。
その場合は以下で起動してください。

```bash
python -m http.server 8000
```

そして `http://localhost:8000/` を開きます。


## Worker v1.1 fallback

`file://` 直開き、またはブラウザ側のWorker制限でWorker起動に失敗した場合でも、
自動的にメインスレッド実行へ切り替えるようにしました。

Workerの動作確認をしたい場合は、展開フォルダで以下を実行してください。

```bash
python -m http.server 8000
```

その後、以下を開きます。

```text
http://localhost:8000/
```


## Worker v1.2 optimizer/core.js

この版では、最適化の重い本体を `src/optimizer/core.js` へ分離しました。

```text
src/main.js
  UI、タブ、保存、描画、Worker起動

src/optimizer/core.js
  runOptimizerCore()
  makeOptimizerStatusText()

src/optimizer/optimizer.worker.js
  Worker側の入口
  importScripts("../main.js", "./core.js")
```

まだ `core.js` は `main.js` 内の計算関数や正規化関数を参照しています。
次の段階で `computeMetrics` 周辺を `src/calc/` へ移していきます。


## Worker v1.3 現在ON構成の比較行

最適化結果に「現在ON構成」を必ず混ぜるチェックボックスを追加しました。

```text
最適化計算 β
  現在ON構成を結果に含める
```

ONの場合、手動で現在ONにしている装備・装備以外Buffを1つの比較行として結果に追加します。

目的:
- 既知の強い手動構成が探索結果に出ない問題の切り分け
- 探索の取りこぼしか、上限/枠/目標値で弾かれているのかの確認

表示:
- 種別列に「現在ON」または「自動探索 + 現在ON」
- 無効な場合は理由を表示
  - バフ枠超過
  - ステータス上限超過
  - 目標値超過
  - 装備競合


## Worker v1.4 現在ONより良い結果だけ表示

最適化計算βに以下を追加しました。

```text
☑ 現在ONより良い結果だけ表示
```

ONの場合、現在ON構成を基準にして、評価順位がそれ以下の自動探索結果を非表示にします。
現在ON構成は「現在ON（基準）」として末尾に表示されます。

これにより、「今の構成より本当に改善する候補だけ見たい」時に使いやすくなります。


## Worker v1.5 現在ON装備 + 最適Buff の種候補

最適化計算βに以下を追加しました。

```text
☑ 現在ON装備のBuff最適化も評価
```

ONの場合、手動で現在ONにしている装備セットを必ず1回評価対象に入れ、
その装備のままBuffだけ最適化した候補を探索結果へ混ぜます。

目的:
- 装備beamで現在ON装備セットが途中で落ちる問題の回避
- 「装備はこれで良いがBuff選択だけ怪しい」ケースの検証
- 現在ON構成より良い結果だけ表示との併用


## Worker v1.6 calc/core.js

この版では、ダメージ計算の中心である `computeMetrics()` とバフ枠集計を `src/calc/core.js` へ分離しました。

```text
src/calc/core.js
  computeMetrics()
  buffSlotCountForState()

src/main.js
  UI描画
  入力収集
  保存/読込
  Worker起動

src/optimizer/core.js
  runOptimizerCore()
```

ブラウザ側では `calc/core.js` → `main.js` → `optimizer/core.js` の順に読み込みます。
Worker側では `main.js` → `calc/core.js` → `optimizer/core.js` の順に読み込みます。

次は、`calc/core.js` が参照している補助関数や定数を少しずつ `src/calc/` 側へ移していく段階です。


## Worker v1.7 storage/shareUrl.js

この版では、見せびらかしタブの軽量共有URL処理を `src/storage/shareUrl.js` へ分離しました。

```text
src/storage/shareUrl.js
  軽量共有構成の生成
  gzip/base64url エンコード
  共有URL発行
  共有URLからの読み込み
```

読み込み順は以下です。

```text
storage/shareUrl.js
calc/core.js
main.js
optimizer/core.js
```

`main.js` の初期化中に `loadConfigFromShareHash()` を呼ぶため、
共有URL処理は `main.js` より前に読み込ませています。


## Worker v1.8 storage/importExport.js

この版では、保存・読み込みまわりを `src/storage/importExport.js` へ分離しました。

```text
src/storage/importExport.js
  JSON出力 / JSON読み込み
  TSV出力 / TSV読み込み
  TSV serialize/parse
  applyConfig()
  resetConfig()
```

読み込み順は以下です。

```text
storage/shareUrl.js
storage/importExport.js
calc/core.js
main.js
optimizer/core.js
```

`main.js` の初期化処理が `applyConfig()` を呼ぶため、
`importExport.js` は `main.js` より前に読み込ませています。


## Worker v1.9 使用チェック全解除ボタン

装備登録タブとBuff登録タブに、使用チェックだけを一括OFFにするボタンを追加しました。

```text
装備登録
  装備の使用を全解除

Buff登録
  Buffの使用を全解除
```

装備側は候補・固定・除外・メモ等を残したまま `enabled` だけOFFにします。
Buff側は装備以外Buff、外枠補正、その他バフ、および旧互換カテゴリの `enabled` をOFFにします。


## Worker v1.10 最適化計算βの使い方ガイド

最適化計算βの説明文を整理し、実際の使い方が分かるガイドへ変更しました。

追加内容:
- 候補の用意
- 現在構成と使用チェックの意味
- 固定/除外の使い分け
- 目的・目標値の考え方
- 0から探す時のおすすめ手順
- 検索 → 適用 → 再検索 の運用
- 結果種別の見方
- 結果が出ない時の確認ポイント


## Worker v1.11 ユーザーフレンドリーUI文言

画面上の説明文を、開発者向けではなく利用者向けの言い方へ調整しました。

主な変更:
- 「分割版」「調整中」「内部」などの開発寄り表現を削減
- 最適化計算の説明を「おすすめ構成を探す」方向に整理
- 使用 / 固定 / 除外 の違いをやさしく説明
- 検索 → 適用 → もう一度検索、という運用を明記
- 検索条件のラベルを「検索の広さ」「仕上げ回数」などに変更
- 保存・共有まわりのボタン名を利用者向けに変更
