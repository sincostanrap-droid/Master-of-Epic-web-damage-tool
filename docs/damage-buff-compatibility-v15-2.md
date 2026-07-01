# Damage Buff Compatibility v15.2

MoE Wiki「アイテム/追加効果/併用2」からダメージ系Buffの効果量・競合グループを取り込む。

## v15.2 の修正

- 攻撃力変換系の競合に、旧候補/旧v15由来の汎用 `attack-conversion` を使わない。
- Wiki併用2の表通り、`conversion:attack:A` / `conversion:attack:B` / `conversion:attack:C` ... を代表競合グループにする。
- 既に `attack-conversion` が候補ルールから入っていた場合も、ページ由来の具体グループで置き換える。
- タグに残る汎用 `attack-conversion` も除去する。

## 例

- 魔力回路: `conversion:attack:A`
- 半神の戦乙女: `conversion:attack:B`
- 疾風奮迅: `conversion:attack:C`
- サモンズ ソード: `conversion:attack:D`
- ノア リアクター: `conversion:attack:E`
- マナ フォース(蒼): `conversion:attack:F`
- 纏雷: `conversion:attack:G`
- クラスカード・アーチャー: `conversion:attack:H`
