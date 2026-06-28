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


## Worker v1.12 効果追加UI / 装備・Buff単体インポート

追加内容:
- 装備詳細とBuff詳細に「効果を追加」UIを追加
- 攻撃力+、与ダメ%、魔力→攻撃力%、クリ率%などは既存入力欄へ自動加算
- スキル+、属性ダメージ強化、テクニック強化など未計算の効果は表示用追加効果として保存
- 装備登録タブの下に、装備だけのTSV/JSON出力・読み込み・テンプレートを追加
- Buff登録タブの下に、BuffだけのTSV/JSON出力・読み込み・テンプレートを追加

注意:
- スキル+や属性ダメージ強化は、現時点では表示・保存用です。
- 読み込みは対象タブの登録内容を置き換えます。


## Worker v1.13 追加ステータス欄の簡略化

装備詳細 / Buff詳細の追加ステータス欄を、値が入っている項目だけ先に表示する形へ変更しました。

- 通常表示: 値が入っているステータスだけ表示
- 追加入力: 上の「効果を追加」を使う想定
- 直接入力: 「値がない項目を直接入力する」を開くと全候補を入力可能


## Worker v1.14 効果追加UIの改善

効果追加UIを、追加先に応じて選択肢が切り替わる形へ変更しました。

- 装備詳細では「装備本体 / 装備Buff」を先に選択
- 追加先に応じて効果プルダウンの候補を切り替え
- スキル+はスキルシミュレータのスキル一覧から選択
- 属性ダメージ強化は 火 / 水 / 地 / 風 / 無 の5択
- スキル強化%は存在しないため追加しない
- 装備本体の追加ステータスに「最大重量」を追加
- 装備Buff/Buff側に「最大重量」「最大重量%」を追加


## Worker v1.15 装備詳細レイアウト整理 / 本体ステータス統合

変更内容:
- 「効果を追加」を装備詳細の一番上へ移動
- 装備本体の追加ステータスを上、装備Buff関連を下に整理
- 値のない項目を直接入力する折りたたみ欄を削除
- スキル+ / 属性ダメージ% は装備Buff/Buff側だけに表示
- テクニック強化%を効果追加候補から削除
- 装備一覧の攻撃力 / 魔力 / 速度の独立列を廃止
- 攻撃力 / 魔力 / 速度を装備本体の追加ステータス欄へ統合


## Worker v1.16 効果追加UI仕上げ

追加内容:
- 効果プルダウンをカテゴリ別に整理
- 効果追加後に「どこへ反映されたか」を表示
- スキル+ / 属性ダメージ% などの表示用追加効果を見やすい一覧に変更
- 表示用追加効果に編集ボタンを追加
- 表示用追加効果の削除ボタンを整理
- 装備/Buffテンプレートに使い方と extraEffects サンプルを追記

注意:
- 攻撃力+などの計算用効果は、追加後に各ステータス欄へ反映されます。編集は反映先の数値欄で行います。
- スキル+ / 属性ダメージ% は引き続き表示・将来連携用です。


## Worker v1.16.1 Hotfix

v1.16で誤って `extraStatNumberInput()` が削除され、TSV読み込み後の描画や候補追加・詳細展開が止まる問題を修正しました。

変更:
- `extraStatNumberInput()` を復旧
- v1.16の効果追加UI仕上げ内容は維持


## Worker v1.17 公式DB貼り付け取り込み 試作

装備登録タブに、Master of Epic公式DBの装備ページを補助的に取り込む欄を追加しました。

できること:
- 装備名で公式DB検索ページを開く
- 公式DBの個別ページ本文/HTMLを貼り付ける
- 装備名、装備部位、武器ダメージ、攻撃間隔、射程、必要スキル、AC、追加効果の一部を解析
- 装備候補として追加

制限:
- GitHub Pagesだけでは公式DBを直接fetchできない場合があるため、自動取得ではなく貼り付け方式
- 公式DBページの表記ゆれやHTML変更により、誤認識する可能性あり
- 未対応の効果は表示用の追加効果として保持


## Worker v1.17.1 公式DB解析改善

公式DB貼り付け取り込みの解析を改善しました。

改善内容:
- HTML貼り付け時に `<title>` / og:title / h1 / 画像alt も解析対象に追加
- テーブルHTMLの th/td が連結される問題を軽減
- 装備名称の推定ロジックを改善
- 装備部位、数値項目、必要スキル、追加効果の読み取りを改善
- 解析後に装備名・部位を手動補正できる欄を追加

制限:
- 公式DBの表記ゆれが大きい効果は、表示用追加効果として残します。


## Worker v1.17.2 公式DB 防具装飾/付加効果 解析修正

`https://idb.moepic.com/items/defences/22761` のような防具装飾ページを想定して、公式DB貼り付け解析を修正しました。

改善:
- ページタイトルの「防具装飾」分類から装備名を取れるように修正
- 「腰装飾」「腰(装)」などを `装飾: 腰` にマップ
- `付加効果` を装備Buff名/説明として取り込む
- `追加効果` と `付加効果` を混ぜないように分離
- `回避 + 10.0; 最大重量 + 30.0; 移動速度 + 5.0` のような複数効果1行を分割
- 複数効果1行で最初の数値だけ拾ってしまう問題を修正


## Worker v1.17.3 公式DB解析追加修正

v1.17.2の修正内容を、v1.17.3として明確に切り直した版です。

対象:
- 防具装飾
- 腰装飾
- 付加効果/Buff名
- 追加効果の複数項目分割


## Worker v1.17.4 公式DB 部位/追加効果の追加修正

ユーザー提供の本文貼り付け例に合わせて、公式DBパーサーを追加修正しました。

修正:
- `腰（装）` を `装飾: 腰` として判定
- `背中（装）` を `装飾: 背中` として判定
- `耐火属性 +20.0` を火耐性として取り込み
- ジャイアント ドラゴンフライ / 真紅の大剣 の貼り付け本文を想定した簡易セルフテスト関数を追加


## Worker v1.18 公式DB URL取り込み実験版

Cloudflare Worker経由で公式DBの個別アイテムURLを取得する欄を追加しました。

追加:
- Worker URL入力欄
- 公式DB 個別URL入力欄
- URLから取得して解析ボタン
- Worker URLをブラウザlocalStorageへ保存
- `worker/moe-idb-proxy-worker.js` を同梱
- `worker/README.md` を同梱

方針:
- 検索ページは取得しません。
- `/items/<カテゴリ>/<ID>` の個別アイテムURLだけ許可します。
- Worker側で1日キャッシュします。


## Worker v1.18.1 Worker接続テスト/簡易Worker版

変更:
- Worker接続テストボタンを追加
- Cloudflare Workerコードを簡易版へ変更
- caches.default を使わず、まずは接続確認しやすくした
- Worker URLを直接開くとヘルスチェック文字列を返す

NetworkErrorが出る場合:
1. Worker URLをブラウザで直接開いて `OK: MoE IDB proxy worker is running...` が出るか確認
2. 出ない場合はWorkerの貼り付け/デプロイが失敗
3. 出る場合はツールのWorker URL欄に同じURLを入れて「Worker接続テスト」を押す


## Worker v1.18.2 公式DB HTML/詰まり本文解析修正

Workerで取得したHTMLや、ラベルと値が1行に詰まった公式DB本文を想定して解析を修正しました。

改善:
- HTMLからscript/style等のノイズを除去して本文化
- `<th>装備部位</th><td>腰（装）</td>` のようなテーブルHTMLを改行付きで本文化
- `装備部位 腰（装） 必要スキル...` のような詰まり本文からも欄を切り出す
- `付加効果 ... 追加効果 ... 特殊条件` のような詰まり本文からBuff名/説明と追加効果を分離
- script内JSON風データの一部も解析候補へ追加
- セルフテストに「詰まり本文」「ミニHTML」を追加

- v1.18.2追補: 1行に詰まった本文の先頭から装備名を拾う処理も追加。


## Worker v1.18.3 公式DB data-page JSON解析

Cloudflare Workerで取得した公式DB HTMLは、画面本文ではなく `#app` の `data-page` 属性にInertia/LaravelのJSONとしてアイテム詳細が入っていました。  
そのため、HTML本文パースより前に `data-page` JSONを直接解析する処理を追加しました。

対応:
- `props.defense` / `props.weapon` / `props.shield` などから構造化データを取得
- `defense.name` → 装備名
- `defense.equip` → 装備部位
- `defense.armor_class` → AC
- `defense.technic.name/info` → 装備Buff名/説明
- `defense.add_statuses[].name/pivot.value` → 追加ステータス
- ジャイアント ドラゴンフライの `data-page` 形式セルフテストを追加


## Worker v1.18.4 固定Worker URL / Origin制限

変更:
- ツール側のWorker URL入力欄を削除
- Worker URLを `https://divine-grass-1b84.sincostanrap.workers.dev` に固定
- Worker側に許可Originチェックを追加
- 許可Originは `https://sincostanrap-droid.github.io` のみ
- 許可Origin以外、またはOriginなしのアクセスは403
- 公式DBは個別アイテムURL `/items/<カテゴリ>/<ID>` のみ取得

注意:
- GitHub PagesのOriginはパスを含みません。
  例: `https://sincostanrap-droid.github.io/Master-of-Epic-web-damage-tool/`
  のOriginは `https://sincostanrap-droid.github.io` です。
- ローカル `file://` からはWorkerが403になります。公開済みGitHub Pages上で試してください。


## Worker v1.18.5 武器の必要スキル値取り込み修正

武器ページの `data-page` JSONで、必要スキル値が `need_level` 以外の名前やネスト構造に入っている場合にも対応しました。

改善:
- `requiredSkill + need_level`
- `required_skill.name + required_skill.pivot.value`
- `skill.name + skill.level`
- `requiredSkills[]` / `requirements[]`
- `required_skill_level` / `skill_level` / `requiredLevel`
などを広めに探索します。

追加:
- 武器data-pageのセルフテストを追加
- 武器ダメージ/攻撃間隔/射程の別名にも一部対応


## Worker v1.18.6 複合必要スキル武器 / 攻撃間隔・有効レンジ補強

修正:
- 複数の必要スキルを持つ武器に対応
- `required_skills[]` / `requirements[]` などの配列を全部拾う
- 名前が固定でないネスト構造も深掘りして `skill名 + 必要値` を抽出
- 最大8件まで必要スキルを保持
- `stats[]` / `properties[]` 内の「攻撃間隔」「有効レンジ」「射程」も拾う

想定:
- `weapons/7135` のような「こんぼう + 素手」
- `weapons/4856` のような3種前提武器

- v1.18.6追補: `stats[]` の攻撃間隔/有効レンジが必要スキルとして誤検出されないよう除外。


## Worker v1.18.7 武器必要スキルの文字列フォールバック / 接続テスト削除

修正:
- Worker接続テストボタンを削除
- `requiredSkill` が「こんぼう 素手」のように複数スキル名を1つの文字列で持つ場合に対応
- `need_level` が1つだけある場合、文字列内の全スキルへ同じ必要値を適用
- `必要スキル こんぼう 50.0 素手 50.0` のような本文/説明文字列からも抽出
- 攻撃間隔 / 有効レンジ / ダメージも、構造化キーで取れない場合は本文文字列から補完
- 炎の珠相当のセルフテストを追加

- v1.18.7追補: 必要スキルの重複表示をスキル名単位で除去。同じスキルが複数回出た場合は大きい必要値を採用。

- v1.18.7追補2: normalizeWeaponReqRowsForEquipment重複除去も追加し、表示・保存前の重複を抑制。
