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
