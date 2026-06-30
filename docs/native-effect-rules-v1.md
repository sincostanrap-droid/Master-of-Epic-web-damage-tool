# 自作効果ルール v1

この仕組みは、外部抽出カタログを正本にせず、公式DB・自前検証・手動TSVを中心に装備Buff/特殊効果を管理するための土台です。

## 方針

- 装備本体、使用条件、武器性能、AC、追加ステータス、装備Buff名は公式DB由来の装備カタログを使います。
- 効果量、条件、併用不可、未対応メモは `data/manual/nativeEffectRules.manual.tsv` で管理します。
- v1では本体計算には接続しません。まず生成と解決APIだけを追加します。
- 追撃、追加ダメージ、夜間限定、WarAge無効、専用技発動などは最初は説明保持に留めます。

## ファイル

- `data/manual/nativeEffectRules.manual.tsv`
  - 自作ルールの手入力元データ。
- `tools/build-native-effect-rules.mjs`
  - TSVから `nativeEffectRules.generated.js` を生成します。
- `src/data/generated/nativeEffectRules.generated.js`
  - ブラウザ用生成データ。
- `src/effects/nativeEffectResolver.js`
  - 装備データから直接ステータスと手動ルール候補を解決します。

## TSV列

| 列 | 内容 |
|---|---|
| `id` | ルールID。安定した文字列。 |
| `enabled` | `TRUE` で有効。 |
| `category` | `equipment_buff` など。 |
| `match_type` | 初期値は `buff_name`。 |
| `target_name` | Buff/効果名。 |
| `equipment_names` | 対象装備名を `|` 区切りで列挙。 |
| `technic_id` | 公式DBの装備Buff/technic ID。分かる場合だけ。 |
| `effects_json` | 計算可能な効果をJSONで記述。 |
| `unsupported_json` | 説明保持・未対応情報をJSONで記述。 |
| `stack_group` | 併用/上書きグループ。 |
| `stack_mode` | `add`, `highest`, `description_only` など。 |
| `verification` | `manual-seed`, `verified`, `needs-check` など。 |
| `notes` | 人間向けメモ。 |
| `sources` | 参照元メモ。 |

## 生成

```powershell
node tools/build-native-effect-rules.mjs
```

## 次の段階

1. ルール確認UIを追加する。
2. 既存の装備詳細/カタログ画面に「自作効果候補」を表示する。
3. 火力計算に安全な項目だけ接続する。

初期接続候補は以下です。

- 攻撃力固定値
- 攻撃力%
- 命中固定値
- 命中%
- 攻撃ディレイ
- クリティカル率
- 物理与ダメージ%

未対応・条件付き効果は計算に入れず、説明表示を優先します。
