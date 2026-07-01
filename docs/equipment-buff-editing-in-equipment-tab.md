# 装備Buff編集を装備登録タブへ一本化

装備Buff修正タブを廃止し、装備Buffの編集導線を装備登録タブの各装備行の「詳細」内に一本化します。

## 目的

- technic_id単位の別タブ編集で既存の装備Buff計算経路を壊さない
- 装備行に保存される既存フィールドをそのまま使う
- 装備登録のエクスポート/インポートと自然に連動させる

## 変更

- MAIN_TABS から `equipBuffFix` を削除
- `activateMainTab()` から `renderEquipBuffFixTab()` 呼び出しを削除
- 装備Buff修正タブ専用の描画関数群を削除
- 装備登録タブ内の文言から「装備Buff修正タブ」参照を削除

## 計算経路

装備Buff計算は既存どおり以下を使います。

- `equipmentBuffHasEffect(row)`
- `equipmentBuffToCompositeRow(row)`
- `expandEquipmentBuffState(st)`

`src/calc/core.js` は変更しません。
