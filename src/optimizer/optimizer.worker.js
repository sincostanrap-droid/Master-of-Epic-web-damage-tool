/*
  optimizer.worker.js

  最適化をブラウザのメインUIとは別スレッドで実行します。
  これにより、探索中もタブ切り替えや進捗表示が止まりにくくなります。
*/

// Legacy calculation/catalog scripts use window for data globals only.
// No document or DOM shim is provided: UI initializers must stay guarded.
self.window = self;

importScripts(
  "../domain/attackDpsState.js?v=1.24.5",
  "../domain/catalogData.js?v=1.24.5",
  "../domain/catalogSearch.js?v=1.24.7",
  "../main.js?v=1.24.12",
  "../calc/core.js?v=1.24.12",
  "./core.js?v=1.24.12"
);

self.onmessage = event => {
  const msg = event.data || {};
  if (msg.type !== "optimize") return;

  try {
    const runtime = msg.payload?.runtime || {};
    OPTIMIZER_RUNTIME_DATA_KEYS.forEach(key => { self[key] = runtime.data?.[key] ?? null; });
    self.MOE_NPC_EFFECT_SLOTS = {
      getAcDelta: () => runtime.npc?.acDelta || 0,
      getEvasionDelta: () => runtime.npc?.evasionDelta || 0,
      getDamageTakenMultiplier: () => runtime.npc?.damageTakenMultiplier || 1
    };
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
