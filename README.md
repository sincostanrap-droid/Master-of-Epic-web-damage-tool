# Master of Epic 物理ダメージ計算webツール

**Master of Epic** 向けの、ブラウザだけで動く物理ダメージ計算・構成比較ツールです。  
武器、スキル、装備、Buff、対象ACなどを入力して、予想ダメージ、攻撃力、Buff枠、構成差分、アタックDPS参考値を確認できます。

現在の表示バージョン: **v1.23.18 / Scrapbox照合ノイズ抑制**

---

## できること

- 物理攻撃の予想ダメージ計算
- アタック、ヘビー クラッシュ、倍率手入力テクニックの比較
- クリティカル込み/なしの確認
- 武器、防具、装飾、装備Buffの登録
- 装備以外Buff、外枠補正、その他Buffの登録
- Buff枠 24枠の確認
- 競合グループによる同時適用不可Buffの整理
- スキル合計850のスキルシミュレータ
- 登録済み候補からの構成探索、最適化計算β
- 現在構成の見せびらかし表示
- JSON / TSV による保存、読み込み、表計算ソフト編集
- 軽量共有URLの発行
- アタックDPS αによる通常アタックDPS参考値の確認
- 公式DB抽出スプレッドシートから生成した装備カタログの検索と、装備登録への追加

---

## 使い方

### ローカルで確認する

ZIPやリポジトリを展開したフォルダで、簡易サーバーを起動します。

```bash
python -m http.server 8000
```

ブラウザで次を開きます。

```text
http://localhost:8000/
```

`file://` で `index.html` を直接開いても動く場合がありますが、Web Worker、保存、共有URLまわりでブラウザ制限を受けることがあります。基本は簡易サーバー経由を推奨します。

### GitHub Pages / Netlify で公開する

静的サイトとしてそのまま公開できます。  
ビルドコマンドは不要です。

Netlifyに手動アップロードする場合は、リポジトリ直下のファイル一式をアップロードしてください。パッチzip単体をアップロードしてもサイトは更新されません。

---

## 画面タブ

### 計算

基本設定、武器情報、攻撃種別、対象AC、計算サマリー、分析、最適化計算βをまとめたメインタブです。

主な表示内容:

- 予想ダメージ
- 予想攻撃力
- 予想魔力
- 装備補正合計
- 総合ステータス
- Buff枠数
- 構成A/B比較
- 実測ダメージとの差分
- AC別ダメージ表
- 種族比較
- Buff寄与率
- ステータス1あたりの伸び
- 構成診断
- 最適化計算β

### アタックDPS α

通常アタックのDPSを参考値として計算するタブです。

α版のため、ゲーム内実測と完全一致させるものではありません。対象デバフ、追加ダメージ、遠隔武器の距離、ラグ、入力遅延、サーバー処理などは単純化しています。

主な仕様:

- 現在の計算結果ダメージを参照
- ダメージ手入力にも対応
- 現在武器ディレイを参照
- 武器ディレイ手入力にも対応
- ONの装備本体、装備Buff、装備以外Buffから「攻撃ディレイ」値を自動集計
- 攻撃ディレイ装備+Buff枠は合算して最大 -60
- アタック短縮Buff、ST補正、手動アタック補正は別枠として乗算
- ディレイ値は `60.3 ≒ 1秒`、つまり `ディレイ × 0.01658 秒` として秒換算
- クリティカル100%・クリティカル時モーションキャンセルを初期前提
- ダメージ発生フレーム、非キャンセル時行動不能フレーム、FPS、計測秒数、命中率を入力可能
- 継続DPS、初撃込みN秒DPS、1分あたり攻撃回数を表示

手入力欄は、手入力モードを選んだ場合だけ表示されます。

### スキルシミュレータ

スキル構成を入力して、スキル合計、残りポイント、種族別の簡易ステータスを確認します。

v1.23.3以降、スキルシミュレータの値は計算タブへ常時自動反映されます。  
計算タブへの反映チェックや反映ボタンは不要になりました。

### 装備登録

武器、防具、装飾候補を登録するタブです。

装備行には次の状態があります。

- 使用: 現在の構成として使う
- 固定: 最適化計算で必ず使う
- 除外: 最適化計算の候補から外す

装備詳細では、武器性能、必要スキル、追加ステータス、装備Buffなどを入力できます。  
追加ステータスは「効果を追加」から追加したものだけ表示されます。

公式DB取り込みは試作機能です。公式DBの個別ページ本文やURLから装備情報を取り込みます。ただし、装備Buffの実効果値までは取得できないため、攻撃力%、与ダメ%、攻撃ディレイなどの数値は必要に応じて手入力してください。


### 装備カタログ α

公式DB抽出スプレッドシートから生成したカタログを検索し、使いたい装備だけ「装備登録」へコピーするタブです。

カタログに存在するだけでは計算対象になりません。計算・最適化に使うには、検索結果の「装備登録へ追加」を押して、登録済み候補へコピーしてください。

生成カタログは以下のファイルとして読み込まれます。

```text
src/data/generated/equipmentCatalog.generated.js
src/data/generated/buffCatalog.generated.js
```

公式DBの `add_status` 名は、生成時にツール内部のステータスキーへ変換されます。
たとえば `攻撃力` は `attack`、`命中` は `extraHit`、`攻撃ディレイ` は `extraAttackDelay` として扱われます。
未対応の `add_status` 名が出た場合は、生成スクリプトの実行結果に `未対応add_status` として表示されるため、対応表へ追加してください。v1.23.9以降は、生産・生活・感覚系などのステータスも「装備パズル」用の追加ステータスとして保持し、検索・登録・最適化目標に利用できます。v1.23.11では、長音符「ー」をマイナス記号として誤正規化していた問題を修正しています。

### Wiki装備Buff効果候補生成

装備Buffの効果量は公式DBの `technic_id` だけでは数値まで分からないため、MoE Wikiの「アイテム/追加効果/常時発動」ページを開発用データとして解析できます。

生成されるファイルは以下です。

```text
src/data/generated/wikiEquipBuffEffects.generated.js
dist/wiki-equip-buff-effects/wikiEquipBuffEffects.parsed.tsv
dist/wiki-equip-buff-effects/wikiEquipBuffEffects.unresolved.tsv
```

`wikiEquipBuffEffects.generated.js` は **計算へ即反映しない候補データ** です。WikiのBuff名・説明文・装備品名から、公式DB由来の `technic_id` へ可能な範囲で照合し、数値として読めるものだけ `parsedStats` に入れます。専用技、変身、確率発動、競合、条件付き効果などは `unparsedNotes` や `unresolved.tsv` に残します。

HTMLを保存して再解析する場合は、次のフォルダへ `.htm` を置きます。

```text
data/wiki/equip-buff-effects/
```

実行例:

```powershell
node tools/build-wiki-equip-buff-effects.mjs
```

同梱済みのWiki抽出候補を、現在の `buffCatalog.generated.js` / `equipmentCatalog.generated.js` へ再照合するだけなら以下です。

```powershell
node tools/build-wiki-equip-buff-effects.mjs --rematch-only
```

検証済みの効果量や競合グループは、再生成で消えないように `src/data/manual/buffRules.manual.js` 側へ昇格させる想定です。


初期状態ではプレースホルダーなので、実データを入れるには次のスクリプトを実行します。

```bash
node tools/build-equipment-catalog-from-google-sheet.mjs
```

別のスプレッドシートを使う場合は、IDを指定します。

```bash
node tools/build-equipment-catalog-from-google-sheet.mjs --spreadsheet-id=スプレッドシートID
```

ローカルに `items_all.tsv` / `add_status.tsv` / `equip_buff.tsv` がある場合は、外部アクセスなしでも生成できます。

```bash
node tools/build-equipment-catalog-from-google-sheet.mjs --input-dir=dist/moe-official-db
```

自動取得データは未検証候補として扱います。装備Buffの実数値、競合グループ、特殊効果は公式DBだけでは確定できないため、必要に応じて登録後に手入力してください。

### Buff登録

装備とは別に付け外しするBuffを登録するタブです。  
自己Buff、外部Buff、歌、変身、料理、課金Buffなどをまとめて管理できます。

主な種類:

- 装備以外Buff
- 外枠補正
- その他Buff

装備以外Buffは、攻撃力%、魔力%、速度%、攻撃力+、魔力+、速度+、与ダメ%、特攻倍率などを入力できます。  
外枠補正は、最後に掛かる補正を入力する場所です。  
その他Buffは、ダメージには直接影響しないがBuff枠だけ数えるものを登録します。

### 競合グループ

同時に乗らないBuffを整理するためのタブです。

同じ競合グループ名を持つBuffが複数ONになっている場合、計算では代表1つだけを使います。  
例:

```text
攻撃力上昇A
与ダメ上昇A
変身系
```

### 見せびらかし

現在構成を一覧表示するタブです。  
装備、Buff、ステータス、予想ダメージなどをまとめて確認できます。

### 保存・読込

設定の保存、読み込み、共有に使います。

対応形式:

- 全体JSON
- 装備だけJSON / TSV
- BuffだけJSON / TSV
- テンプレートTSV
- 軽量共有URL

TSVは表計算ソフトで編集するための形式です。  
大量の装備候補やBuff候補を整理する場合に使います。

---

## 最適化計算βについて

登録済みの装備候補とBuff候補から、条件に合う構成を探す機能です。

基本的な流れ:

1. 装備登録、Buff登録で候補を用意する
2. 現在使っている構成がある場合は「使用」をONにする
3. 絶対に使うものは「固定」、使わないものは「除外」にする
4. 計算タブの最適化計算βで目的を選んで検索する
5. 良さそうな結果を適用する
6. 適用後の構成を基準に、もう一度検索する

0から一発で完全な構成を探すより、検索 → 適用 → 再検索を何度か回す使い方を想定しています。

---

## バージョン更新方針

更新時は、画面上部のタイトル直下に表示されるバージョンを必ず更新します。

例:

```text
v1.23.5 / README実態反映
```

パッチファイル名も、何用の更新か分かる名前にします。

例:

```text
master_of_epic_physical_damage_tool_readme_update_v1.23.5_patch.zip
```

---

## ファイル構成

主なファイルは次の通りです。

```text
index.html
styles/main.css
src/main.js
src/calc/core.js
src/storage/shareUrl.js
src/storage/importExport.js
src/optimizer/core.js
src/optimizer/optimizer.worker.js
legacy/
patches/
README.md
```

### index.html

画面本体です。CSSとJavaScriptを読み込みます。

### styles/main.css

画面レイアウト、タブ、テーブル、入力欄、レスポンシブ表示などのスタイルです。

### src/main.js

UI描画、タブ制御、入力処理、画面更新、アタックDPS α、スキルシミュレータ、装備/Buff登録、最適化起動などを担当します。

### src/calc/core.js

ダメージ計算の中心処理です。  
`computeMetrics()` など、計算本体に近い処理を置く想定です。

### src/storage/shareUrl.js

軽量共有URLの生成、読み込みを担当します。

### src/storage/importExport.js

JSON / TSV の出力、読み込み、設定適用、リセットなどを担当します。

### src/optimizer/core.js

最適化計算の中心処理です。

### src/optimizer/optimizer.worker.js

重い最適化処理をWeb Workerで動かすための入口です。  
Workerが使えない環境では、メインスレッド実行へフォールバックする想定です。

---

## 注意事項

このツールはMaster of Epicのプレイヤー向け検証・構成比較ツールです。  
ゲーム仕様、装備性能、Buff効果、検証値は変更される可能性があります。

特に以下は参考値として扱ってください。

- 対象デバフ込みの最終ダメージ
- 特攻や外枠補正の扱い
- アタックDPS αの結果
- ディレイ短縮とモーションキャンセル
- 遠隔武器の距離や弾着
- ラグ、入力遅延、サーバー処理
- 実測ダメージとの差分

疑わしい場合は、ゲーム内実測や参照元の検証情報で確認してください。

---

## 更新履歴

- v1.23.12: MoE Wiki「アイテム/追加効果/常時発動」HTMLから装備Buff効果候補を抽出する開発用スクリプトと generated/manual データ置き場を追加。計算には即反映せず、未解析TSVを出力して手動補完できるようにした。
- v1.23.11: add_status名の正規化で長音符「ー」をマイナス記号へ置換していた問題を修正。生産系の「グレードゾーン」「ゲージ滑り」「ヒットゾーン」が正しく対応表へ一致するように修正。
- v1.23.9: 生産・生活・感覚系を含む公式DB `add_status` をツール内部ステータスへ対応。火力以外の装備パズル/最適化目標に利用できるように拡張。
- v1.23.8: 生産・生活・感覚系など物理ダメージ計算に使わない公式DB `add_status` を既知の非対象として分類し、未対応警告を計算対象ステータスだけに整理。
- v1.23.7: 公式DB `add_status` 名からツール内部ステータスキーへの明示的な対応表を追加。生成カタログに `statKey` を付与し、未対応ステータスを検出できるように修正。
- v1.23.6: 装備カタログα、Googleスプレッドシートからの生成スクリプト、カタログ検索から装備登録への追加を追加。

### v1.23.5 / README実態反映

- READMEを現行機能に合わせて全面整理
- 初見の人向けに、目的、使い方、タブ説明、公開方法、注意事項を追加
- 画面上部の表示バージョンを更新

### v1.23.4 / Buff削除ボタン表示修正

- Buff登録タブの操作列を広げ、上下移動/削除ボタンが隠れないよう修正

### v1.23.3 / UI調整・自動反映修正

- アタックDPS αの入力欄幅を調整
- 手入力欄を必要時だけ表示
- スキルシミュレータのレイアウト崩れを修正
- スキルシミュレータから計算タブへ常時自動反映
- 装備詳細/Buff詳細の追加ステータス表示を整理
- Buff登録、外枠補正、その他Buffの列幅を調整

### v1.23.2 / アタックDPSα・ディレイ短縮自動参照

- ONの装備本体、装備Buff、装備以外Buffから攻撃ディレイ短縮値を自動参照

### v1.23.1 / アタックDPSα・ディレイ秒換算修正

- ディレイ換算を `ディレイ / 100` から `ディレイ × 0.01658` に修正

### v1.23.0 / アタックDPS α

- 新タブ「アタックDPS α」を追加
- 通常アタックのDPS参考値計算を追加


## v1.23.14: Buff手入力TSV日本語ヘッダー対応

`data/manual/buffRules.manual.input.tsv` の1行目に日本語表示名、2行目に内部キーを出力するようにしました。
ExcelやGoogleスプレッドシートでは1行目を見ながら編集でき、変換スクリプトは2行目の内部キーを使って `buffRules.manual.js` を生成します。旧形式の「1行目が内部キー」のTSVも引き続き読み込めます。

## v1.23.13: Buff手入力TSVテンプレート

Wiki常時発動ページから抽出した装備Buff候補を、人間が確認して `buffRules.manual.js` に投入するためのTSVテンプレートと変換スクリプトを追加しました。

### 入力TSVを作る

```powershell
node tools/build-wiki-equip-buff-effects.mjs --rematch-only
node tools/build-buff-rules-template.mjs --only-matched
```

出力:

```text
data/manual/buffRules.manual.input.tsv
```

`enabled=TRUE` にした行だけが次の変換対象になります。

### manual JSへ変換する

```powershell
node tools/build-buff-rules-manual-from-tsv.mjs
```

出力:

```text
src/data/manual/buffRules.manual.js
```

`data/manual/buffRules.manual.example.tsv` に最小例を同梱しています。


## v1.23.18 / Scrapbox照合ノイズ抑制

`tools/enrich-buff-rules-template-from-scrapbox.mjs` の照合を安全側へ寄せました。

- `Scrapbox照合品質` と `Scrapbox除外ページ` 列を追加。
- Buff名・装備名・参照バフページを区別して照合。
- 装備名検索は原則として完全一致/近似一致ページだけを採用。
- `AGI 3%UP` など短い英字・数値系Buff名で、無関係な装備セットページを拾いすぎる問題を抑制。
- 旧来の広い照合を使いたい場合は `--broad-match` を指定できます。

推奨コマンド:

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --refresh-cache --limit=0
```

既存の広すぎる `data/manual/buffRules.manual.scrapbox.tsv` は、上記コマンドで作り直してください。

## v1.23.17 / Scrapbox補完TSV自動生成対応

- `tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch` 実行時、既定入力 `data/manual/buffRules.manual.input.tsv` が未作成またはデータ0行の場合、自動で `node tools/build-buff-rules-template.mjs --only-matched` を実行します。
- これにより、Wiki装備Buff効果候補が生成済みなら、Scrapbox補完まで1コマンドで進められます。
- カスタム `--input=...` 指定時は安全のため自動生成せず、その指定ファイルをそのまま使います。

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --limit=0
```

## v1.23.16 / Scrapbox自動取得補完対応

- `tools/enrich-buff-rules-template-from-scrapbox.mjs` に `--auto-fetch` を追加しました。
- `--auto-fetch` を付けると、Medi記録Scrapbox版の公開ページ一覧を自動取得して `data/cache/scrapbox/` にキャッシュし、TSVのBuff名・Wiki名・装備名とローカル照合します。
- 旧来の検索API補完も残しているため、ページタイトル一致と全文検索の両方を使って補完できます。
- キャッシュを取り直す場合は `--refresh-cache` を付けます。

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --limit=0
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --apply-hints --limit=0
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --refresh-cache --limit=0
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
