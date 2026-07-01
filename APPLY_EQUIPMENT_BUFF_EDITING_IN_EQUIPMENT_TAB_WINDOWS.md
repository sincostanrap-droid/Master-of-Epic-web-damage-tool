# 適用手順: 装備Buff編集を装備登録タブへ一本化

## 1. 適用

ZIPを展開して、リポジトリ直下へコピーしてください。

上書き:

```txt
src/main.js
```

追加:

```txt
docs/equipment-buff-editing-in-equipment-tab.md
MANIFEST_EQUIPMENT_BUFF_EDITING_IN_EQUIPMENT_TAB.json
```

## 2. 確認

```powershell
python -m http.server 8096
```

ブラウザで開きます。

```txt
http://localhost:8096/
```

確認点:

1. 上部タブから「装備Buff修正」が消えている
2. 装備登録タブは表示される
3. 装備行の「詳細」を開くと装備Buff欄がある
4. 装備Buff欄で攻撃力+などを編集できる
5. 既存の装備Buff計算が戻っている

## 3. コミット

```powershell
git add src/main.js docs/equipment-buff-editing-in-equipment-tab.md MANIFEST_EQUIPMENT_BUFF_EDITING_IN_EQUIPMENT_TAB.json APPLY_EQUIPMENT_BUFF_EDITING_IN_EQUIPMENT_TAB_WINDOWS.md
git commit -m "Keep equipment buff editing in equipment tab"
git push
```
