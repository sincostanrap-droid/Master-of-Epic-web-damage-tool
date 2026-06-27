/*
  optimizer.worker.js

  最適化をブラウザのメインUIとは別スレッドで実行します。
  これにより、探索中もタブ切り替えや進捗表示が止まりにくくなります。
*/

importScripts("../main.js", "../calc/core.js", "./core.js");

self.onmessage = event => {
  const msg = event.data || {};
  if (msg.type !== "optimize") return;

  try {
    const out = runOptimizerCore(msg.payload, progress => {
      self.postMessage({
        type: "progress",
        runId: msg.runId,
        ...progress
      });
    });

    self.postMessage({
      type: "result",
      runId: msg.runId,
      results: out.results,
      summary: out.summary
    });
  } catch (e) {
    self.postMessage({
      type: "error",
      runId: msg.runId,
      message: e && e.stack ? e.stack : (e?.message || String(e))
    });
  }
};
