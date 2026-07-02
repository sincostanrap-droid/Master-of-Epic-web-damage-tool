# v17.1 + v18 + v19.1 + v20 bundled patch

この同梱版は以下を順に適用します。

## v17.1: 装備カタログ複数数値フィルタ

装備カタログに、最大4条件のAND数値フィルタを追加します。

例:

- 攻撃力 +4以上
- 攻撃ディレイ -1以下
- 命中 +1以上

## v18: 装備Buff同一テクニック最新1件化 + 見せびらかし表示修正

- 同一 `equipBuffTechnicId` / 同一 `equipBuffName` は最新1件だけ計算へ展開します。
- 見せびらかしページで `攻撃力+8 / 攻撃力 +8` のように装備本体ステータスが二重表示される問題を直します。

## v19.1: 専門戦闘追加ステータスの正規フィールド化

Buffではない公式DB/Wiki由来の追加ステータスを、装備本体の追加ステータスとして正しく保持します。

追加/整理する主なフィールド:

- `extraKickAttack`: キック攻撃力補正
- `extraKickHit`: キック命中率補正
- `extraFangAttack`: 牙攻撃補正
- `extraFangHit`: 牙命中率補正

これにより、キック攻撃力補正や牙命中率補正を通常の攻撃力/命中に混ぜません。

## v20: Wiki併用/併用2 競合グループの復元・永続化

- `equipBuffName` から `skillPlus:*`, `damage:physical:*`, `critical:*`, `conversion:attack:*`, `damage:magic:*`, `damage:element:*` などを復元します。
- `equipBuffConflictGroup` に加えて、複数軸用の `equipBuffConflictGroups` を保存します。
- TSV/装備だけTSVに `equipBuffCatalogId`, `equipBuffTechnicId`, `equipBuffConflictGroup`, `equipBuffConflictGroups`, `equipBuffStackRule` を追加します。
- composite 展開時に全競合グループを tags へ渡します。

## 注意

既に装備登録へ誤った値で入っている装備は、パッチ後にカタログから再投入してください。既存行には元の `add_status` の内訳が残っていないため、通常攻撃力/命中へ混ざった値を安全に自動復元できません。
