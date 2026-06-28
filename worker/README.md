# Cloudflare Worker: MoE IDB Proxy v1.18.1

v1.18.1 はデバッグしやすい簡易版です。まずはこちらをCloudflare Workerに貼ってください。

## 確認方法

デプロイ後、Worker URLをブラウザで開きます。

```text
https://xxxxx.workers.dev
```

次のように表示されればWorker自体はOKです。

```text
OK: MoE IDB proxy worker is running...
```

次に、個別URL付きで開きます。

```text
https://xxxxx.workers.dev/?url=https%3A%2F%2Fidb.moepic.com%2Fitems%2Fdefences%2F22761
```

公式DBのHTMLが表示されれば、ツール側の「URLから取得して解析」が使えます。

## 注意

- 検索ページは拒否します。
- 個別アイテムURLだけ許可します。
- idb.moepic.com 以外は拒否します。
