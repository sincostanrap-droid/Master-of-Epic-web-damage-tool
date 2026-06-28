# Cloudflare Worker: MoE IDB Proxy

このWorkerは `Master of Epic 物理ダメージ計算webツール` から公式DB個別アイテムページを取得するためのプロキシです。

## 使い方

1. Cloudflare WorkersでWorkerを作成
2. `moe-idb-proxy-worker.js` の内容を貼り付け
3. Save and deploy
4. GitHub Pagesにツール本体を配置
5. 装備登録タブで公式DB個別URLを入力して取得

## 現在の固定設定

ツール側のWorker URL:

```text
https://divine-grass-1b84.sincostanrap.workers.dev
```

許可Origin:

```text
https://sincostanrap-droid.github.io
```

GitHub PagesのURLが `https://sincostanrap-droid.github.io/Master-of-Epic-web-damage-tool/` の場合でも、Originはパスを含まない `https://sincostanrap-droid.github.io` です。

## 制限

- `idb.moepic.com` 以外は拒否します。
- `/items/<カテゴリ>/<ID>` の個別アイテムURL以外は拒否します。
- 検索ページ、一覧ページ、外部URLは拒否します。
- 許可Origin以外、またはOriginなしのアクセスは403になります。
- ローカル `file://` からの実行は403になります。GitHub Pages上で確認してください。

## 装備Buffについて

公式DBから取得できる装備Buff情報は、Buff名と説明文までです。  
攻撃力%・属性ダメージ%・自然回復量などの実効果値は、ツール側で自動取得できません。必要に応じてBuff登録または装備詳細で手入力してください。


## v1.18.14 補足

ツール本体側では、公式DB上の装備部位が `右手 左手` の武器を右手優先で取り込みます。  
また、装備BuffについてはBuff名と説明文までしか公式DBから自動取得できません。実効果値はツール側で手入力してください。
