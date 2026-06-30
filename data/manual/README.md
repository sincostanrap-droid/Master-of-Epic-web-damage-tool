# Buff手入力TSV

装備Buff効果は公式DBだけでは数値まで確定できないものが多いため、Wiki抽出候補をTSVに出して、人間が確認した行だけ `buffRules.manual.js` に変換します。

## 1. テンプレートTSVを作る

まず、Wiki候補と公式DBカタログを照合済みにしておきます。

```powershell
node tools/build-wiki-equip-buff-effects.mjs --rematch-only
```

次に、入力用TSVを生成します。

```powershell
node tools/build-buff-rules-template.mjs --only-matched
```

出力:

```text
data/manual/buffRules.manual.input.tsv
```

## 2. TSVに入力する

### TSVのヘッダー

v1.23.14以降、生成されるTSVは次の2段ヘッダーです。

```text
1行目: 日本語表示名。Excel/Googleスプレッドシートで見やすくするための行
2行目: 内部キー。変換スクリプトが読む列名
3行目以降: 入力データ
```

入力するときは1行目・2行目を消さず、3行目以降を編集してください。
旧形式の「1行目が内部キー」のTSVも引き続き読み込めます。


`buffRules.manual.input.tsv` をExcelやGoogleスプレッドシートで開きます。

確定したい行だけ、最低限以下を入力します。

```text
enabled = TRUE
verified = TRUE または FALSE
officialTechnicId = 公式DBのtechnic_id
name = Buff名
必要な数値列 = 効果量
memo = 根拠や注意点
```

`enabled` が空の行は変換時に無視されます。

## 3. manual JSへ変換する

```powershell
node tools/build-buff-rules-manual-from-tsv.mjs
```

出力:

```text
src/data/manual/buffRules.manual.js
```

## 代表的な列

```text
attack / attackPct                攻撃力 / 攻撃力%
magic / magicPct                  魔力 / 魔力%
speed / speedPct                  移動速度 / 移動速度%
magicToAttackPct                  魔力のn%を攻撃力に加算/変換
magicToSpeedPct                   魔力のn%を移動速度に加算/変換
speedToAttackPct                  移動速度のn%を攻撃力に変換
jumpMultiplier                    ジャンプ力倍率。例: 1.21
forcedSpeed                       強制移動速度。例: 75
targetDamageEffects               種族/対象特攻などのメモ
dmgPct                            与ダメ%
extraHit / extraHitPct            命中 / 命中%
extraAvoid / extraAvoidPct        回避 / 回避%
extraAttackDelay                  攻撃ディレイ。短縮はマイナス値
extraMagicDelay                   魔法ディレイ。短縮はマイナス値
extraCritRatePct                  クリ率%
extraDamageReducePct              被ダメ軽減%
hpRegenPerMinute                  HP自然回復/分
stRegenPerMinute                  ST自然回復/分
mpRegenPerMinute                  MP自然回復/分
skillEffects                      例: 音楽:+10;ダンス:+10
customEffects                     自動計算しないメモ効果。例: 専用技あり;変身
```

## 注意

`src/data/generated/` 以下は再生成で上書きされます。人間が確認した値は、このTSVまたは `src/data/manual/buffRules.manual.js` 側で管理してください。

## 4. Scrapboxで補完する

Medi記録Scrapbox版から、装備名/Buff名を使って関連ページを検索し、TSVに根拠行や重複・併用ヒントを追加できます。

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs
```

より広く自動取得する場合は、Scrapboxの公開ページ一覧を先にキャッシュして照合します。

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --limit=0
```

既定の出力:

```text
data/manual/buffRules.manual.scrapbox.tsv
```

大量に処理したい場合:

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs --limit=0
```

主な追加列:

```text
scrapboxMatchStatus        Scrapbox照合状態
scrapboxMatchedQueries     検索に使った語
scrapboxPages              候補ページ
scrapboxStackRuleHint      additive / multiplicative / exclusive-or-latest / stackable など
scrapboxConflictGroupHint  magic-damage-buff / mp-regen-buff など
scrapboxEffectHint         数値や効果らしい根拠行
scrapboxNotes              未確認・条件付き・WarAge注意など
scrapboxRawLines           根拠行まとめ
```

`--apply-hints` を付けると、手入力されていない `stackRule` / `memo` にScrapboxヒントを補助反映します。ただし既存の手入力値は上書きしません。

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs --limit=0 --apply-hints
```

Scrapbox補完後TSVを確認し、採用する行だけ `enabled=TRUE` にしてから、通常通り次を実行してください。

```powershell
node tools/build-buff-rules-manual-from-tsv.mjs --input=data/manual/buffRules.manual.scrapbox.tsv
```

### 自動取得オプション

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --limit=0
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --apply-hints --limit=0
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --refresh-cache --limit=0
```

- `--auto-fetch`: Scrapbox公開ページ一覧を取得し、ローカル照合に使います。
- `--limit=0`: TSV全行を処理します。
- `--apply-hints`: 空欄の `stackRule` / `conflictGroup` / `memo` にScrapboxヒントを補助反映します。既存の手入力値は上書きしません。
- `--refresh-cache`: `data/cache/scrapbox/` を取り直します。

## v1.23.18 のScrapbox補完について

`buffRules.manual.scrapbox.tsv` には、Scrapbox由来の候補に加えて `Scrapbox照合品質` と `Scrapbox除外ページ` が出力されます。

- `exact-title` / `exact-equipment-title`: 比較的信頼しやすい候補です。
- `near-buff-title` / `near-equipment-title`: 要確認ですが候補として見られます。
- `reference-title`: 「HP自然回復増加バフ」などの参照ページ由来です。根拠行を確認してください。
- `Scrapbox除外ページ`: 以前の広い検索なら拾っていたが、ノイズとして落としたページです。

既存のScrapbox補完TSVが広く拾いすぎている場合は、次で作り直してください。

```powershell
node tools/enrich-buff-rules-template-from-scrapbox.mjs --auto-fetch --refresh-cache --limit=0
```

## 6. Scrapbox補完TSVをさらに精度補正する

Scrapbox補完後のTSVから、魔力→攻撃力変換、魔力→移動速度変換、移動速度→攻撃力変換、ジャンプ力倍率などを補助抽出できます。

```powershell
node tools/refine-buff-rules-tsv.mjs --input=data/manual/buffRules.manual.scrapbox.tsv
```

出力:

```text
data/manual/buffRules.manual.refined.tsv
```

この処理は既存入力値を上書きせず、空欄だけ補完します。`enabled` と `verified` は自動でONにしないため、採用する行だけ人間が確認してください。

追加/補完される主な列:

```text
magicToAttackPct      魔力→攻撃力%
magicToSpeedPct       魔力→移動速度%
speedToAttackPct      移動速度→攻撃力%
jumpMultiplier        ジャンプ力倍率
forcedSpeed           強制移動速度
targetDamageEffects   種族/対象特攻メモ
refineStatus          精度補正状態
refineNotes           精度補正メモ
```

## v1.23.20 / 装備Buff候補JS生成

`data/manual/buffRules.manual.refined.tsv` など、Wiki/Scrapbox補完済みTSVからブラウザ用の候補JSを生成できます。
この候補JSは、装備カタログからBuff付き装備を追加した時の初期値として使われます。

```powershell
node tools/build-equip-buff-candidates-from-tsv.mjs --input=data/manual/buffRules.manual.refined.tsv
```

出力:

```text
src/data/generated/equipBuffRuleCandidates.generated.js
```

注意:
- 候補値は未確定データです。装備Buff修正タブでWiki原文/Scrapbox根拠行を見ながら修正してください。
- 同一technic_idは `technic-ID` 競合グループで管理され、`same-technic` では後から登録されたものだけ有効になります。
- `data/cache/` はScrapbox自動取得用の開発キャッシュなのでGitに入れないでください。
