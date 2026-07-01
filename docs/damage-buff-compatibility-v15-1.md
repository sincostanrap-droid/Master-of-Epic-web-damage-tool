# v15.1: ダメージ系Buff併用表の取り込み（攻撃力変換グループ修正）

MoE Wiki `アイテム/追加効果/併用2` の表を元に、装備Buffへダメージ関連効果を自動投入する。

## v15.1での修正点

v15では、攻撃力変換系（魔力→攻撃力、移動速度→攻撃力など）について、
ページ内の `A/B/C...` グループを競合判定に使わず、実質的に変換系をまとめて扱うような状態になっていた。

v15.1では、攻撃力変換もWiki表のグループをそのまま使う。

例:

- `魔攻変換` → `conversion:attack:A`
- `半神の戦乙女` → `conversion:attack:B`
- `疾風奮迅` → `conversion:attack:C`
- `サモンズ ソード` → `conversion:attack:D`
- `ノア リアクター` → `conversion:attack:E`
- `マナ フォース(蒼)` → `conversion:attack:F`
- `纏雷` → `conversion:attack:G`
- `クラスカード・アーチャー` → `conversion:attack:H`

`A？` や `B？` などの不確定表記は、効果値は投入しつつ、元の `groupRaw` とレビュー注意を残す。

## 自動投入方針

物理ダメージ計算に関わる既存欄へ入れるもの:

- 物理与ダメージ増加 → `equipBuffDmgPct`
- 攻撃力変換 魔力xN% → `equipBuffConvMagicRate`
- 攻撃力変換 移動速度xN% → `equipBuffConvSpeedRate`
- クリティカル率 → `equipBuffExtraCritRatePct`

表示用に留めるもの:

- 魔法与ダメージ増加
- 属性ダメージ増加
- 効果範囲

## 競合グループ

Wiki表のグループを元にする。

- 物理与ダメ: `damage:physical:<group>`
- クリティカル: `critical:<group>`
- 攻撃力変換: `conversion:attack:<group>`
- 魔法/属性/範囲: 表示・監視用タグ

現行ツールは代表競合グループが単一のため、複数軸を持つBuffでは代表グループに入り切らないものをタグへ残す。
