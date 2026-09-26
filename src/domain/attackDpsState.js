/*
  Attack DPS state

  攻撃DPS計算で使用する設定の既定値と、保存データの正規化を管理します。
  通常画面とOptimizer Workerの両方から利用するため、DOMには依存させません。
*/

// 実測の連続攻撃周期。初撃の発生時間や描画FPSとは独立。
const ATTACK_DPS_REMOTE_MOTIONS = Object.freeze({
  tackleGun: Object.freeze({label:"片手銃：タックル", seconds:0.944}),
  nekomataGun: Object.freeze({label:"両手銃：猫又", seconds:0.800}),
  nekomataBow: Object.freeze({label:"弓：猫又", seconds:46.10 / 60})
});
function attackDpsWeaponMotionKey(weapon) {
  const names = (weapon?.weaponReq || []).map(row => row.name || "").join(" ");
  if (names.includes("銃器")) return weapon.weaponTwoHanded === "○" ? "nekomataGun" : "tackleGun";
  if (names.includes("弓")) return "nekomataBow";
  return "";
}
function defaultAttackDpsState() {
  return {
    motionProfile: "auto",
    damageSource: "current",
    manualDamage: 100,
    weaponDelaySource: "currentWeapon",
    manualWeaponDelay: 300,
    equipmentBuffDelaySource: "auto",
    equipmentBuffDelay: 0,
    attackDelayBuff: 0,
    stDelayBonus: -10,
    manualAttackBonus: true,
    criticalCancel: true,
    damageFrame: 45,
    nonCancelMotionFrames: 90,
    fps: 60,
    simSeconds: 30,
    hitRatePct: 100
  };
}

function normalizeAttackDpsState(raw) {
  const d = defaultAttackDpsState();
  const src = raw && typeof raw === "object" ? raw : {};
  const out = {...d, ...src};
  out.motionProfile = Object.prototype.hasOwnProperty.call(ATTACK_DPS_REMOTE_MOTIONS, out.motionProfile) ? out.motionProfile : "auto";
  out.damageSource = out.damageSource === "manual" ? "manual" : "current";
  out.weaponDelaySource = out.weaponDelaySource === "manual" ? "manual" : "currentWeapon";
  out.equipmentBuffDelaySource = out.equipmentBuffDelaySource === "manual" ? "manual" : "auto";
  ["manualDamage", "manualWeaponDelay", "equipmentBuffDelay", "attackDelayBuff", "stDelayBonus", "damageFrame", "nonCancelMotionFrames", "fps", "simSeconds", "hitRatePct"].forEach(k => {
    out[k] = parseFloat(out[k]);
    if (!Number.isFinite(out[k])) out[k] = d[k];
  });
  out.fps = Math.max(1, out.fps || d.fps);
  out.simSeconds = Math.max(1, out.simSeconds || d.simSeconds);
  out.hitRatePct = Math.max(0, Math.min(100, out.hitRatePct));
  out.manualAttackBonus = out.manualAttackBonus !== false;
  out.criticalCancel = out.criticalCancel !== false;
  return out;
}

function attackDpsAddDelaySource(bucket, kind, name, value, note="") {
  const n = parseFloat(value);
  if (!Number.isFinite(n) || n === 0) return;
  const item = {kind, name: name || kind, value: n, note};
  bucket.sources.push(item);
  if (kind === "装備") bucket.equipmentTotal += n;
  else bucket.buffTotal += n;
  bucket.total += n;
}

function attackDpsAddDelayPctSource(bucket, kind, name, value, note="") {
  const n = parseFloat(value);
  if (!Number.isFinite(n) || n === 0) return;
  bucket.pctSources.push({kind, name: name || kind, value: n, note});
}

function collectAttackDpsDelaySources(st=state) {
  const bucket = {equipmentTotal:0, buffTotal:0, total:0, sources:[], pctSources:[]};
  const baseState = st || state || {};

  normalizeEquipmentRows(baseState.equipment)
    .filter(r => r.enabled !== false)
    .forEach(r => {
      const label = `${(r.slot || "装備").replace(/^武器: |^防具: |^装飾: /, "")} ${r.name || "名称未入力"}`.trim();
      attackDpsAddDelaySource(bucket, "装備", label, r.extraAttackDelay, "装備本体");
      attackDpsAddDelayPctSource(bucket, "装備", label, r.extraAttackDelayPct, "攻撃ディレイ%はDPS枠には未反映");
    });

  let buffState = clone(baseState);
  if (typeof expandSkillSimMasteryBuffState === "function") buffState = expandSkillSimMasteryBuffState(buffState);
  if (typeof expandEquipmentBuffState === "function") buffState = expandEquipmentBuffState(buffState);
  if (typeof applyBuffGroupRules === "function") buffState = applyBuffGroupRules(buffState);

  normalizeCompositeRows(buffState.composite)
    .filter(r => r.enabled && !r.excluded && compositeHasEffect(r))
    .forEach(r => {
      const isEquipBuff = /^装備由来[:：]/.test(r.note || "") || /装備Buff$/.test(r.name || "");
      const kind = isEquipBuff ? "装備Buff" : "Buff";
      attackDpsAddDelaySource(bucket, kind, r.name || kind, r.extraAttackDelay, r.note || "");
      attackDpsAddDelayPctSource(bucket, kind, r.name || kind, r.extraAttackDelayPct, "攻撃ディレイ%はDPS枠には未反映");
    });

  bucket.sources.sort((a,b) => a.kind.localeCompare(b.kind, "ja") || a.name.localeCompare(b.name, "ja"));
  bucket.pctSources.sort((a,b) => a.kind.localeCompare(b.kind, "ja") || a.name.localeCompare(b.name, "ja"));
  return bucket;
}

function attackDpsClampPercentForMultiplier(v, min=-99.9, max=999) {
  const n = parseFloat(v) || 0;
  return Math.max(min, Math.min(max, n));
}

function calculateAttackDps({
  cfg,
  weapon=null,
  currentDamage=0,
  currentWeaponDelay=0,
  delayAuto={equipmentTotal:0, buffTotal:0, total:0, sources:[], pctSources:[]}
}={}) {
  cfg = normalizeAttackDpsState(cfg);
  const warnings = [];

  const damage = cfg.damageSource === "current" ? currentDamage : Math.max(0, +cfg.manualDamage || 0);
  if (cfg.damageSource === "current" && !(damage > 0)) warnings.push("計算タブの予想ダメージが0です。手入力ダメージに切り替えるか、計算条件を確認してください。");

  const weaponDelay = cfg.weaponDelaySource === "currentWeapon" ? currentWeaponDelay : Math.max(0, +cfg.manualWeaponDelay || 0);
  if (cfg.weaponDelaySource === "currentWeapon" && !(weaponDelay > 0)) warnings.push("現在の計算武器に攻撃間隔がありません。装備詳細に攻撃間隔を入れるか、手入力に切り替えてください。");

  const equipBuffRaw = cfg.equipmentBuffDelaySource === "auto"
    ? delayAuto.total
    : (+cfg.equipmentBuffDelay || 0);
  const equipBuffCapped = Math.max(-60, equipBuffRaw);
  if (equipBuffRaw < -60) warnings.push("装備+攻撃ディレイBuff枠は -60 に丸めています。");
  if (cfg.equipmentBuffDelaySource === "auto" && delayAuto.pctSources.length) warnings.push("攻撃ディレイ% は現状DPS自動枠に未反映です。MoEの短縮値は通常『攻撃ディレイ -X』として登録してください。");

  const attackDelayBuff = attackDpsClampPercentForMultiplier(cfg.attackDelayBuff);
  const stBonus = attackDpsClampPercentForMultiplier(cfg.stDelayBonus);
  const manualBonus = cfg.manualAttackBonus ? -10 : 0;

  const delayMultiplier =
    (100 + equipBuffCapped) / 100 *
    (100 + attackDelayBuff) / 100 *
    (100 + stBonus) / 100 *
    (100 + manualBonus) / 100;

  const shortenedDelay = Math.max(0, weaponDelay * delayMultiplier);
  // MoE wiki等の記述では、ディレイ欄の数値は 60.3 ≒ 1秒。
  // つまり 実秒 ≒ ディレイ値 * 0.01658。
  const ATTACK_DPS_DELAY_SECONDS_PER_POINT = 0.01658;
  const delaySec = shortenedDelay * ATTACK_DPS_DELAY_SECONDS_PER_POINT;
  const weaponMotionKey = attackDpsWeaponMotionKey(weapon);
  const motionKey = cfg.motionProfile === "auto" ? weaponMotionKey : cfg.motionProfile;
  const motion = ATTACK_DPS_REMOTE_MOTIONS[motionKey];
  const supported = !!motion && cfg.criticalCancel &&
    (cfg.weaponDelaySource === "manual" || weaponMotionKey === motionKey);
  if (!motion || (cfg.weaponDelaySource !== "manual" && weaponMotionKey !== motionKey))
    warnings.push("現在の武器は選択したモーションの対象外、または武器種が未確認です。遠隔3種類以外の周期は未検証です。");
  if (!cfg.criticalCancel) warnings.push("今回の試作はクリキャン時の実測周期のみ対応しています。");
  const fps = cfg.fps;
  const damageFrame = null;
  const damageFrameSec = null;
  const motionLockSec = supported ? motion.seconds : NaN;
  const periodSec = supported ? Math.max(delaySec, motionLockSec) : NaN;

  const simSeconds = Math.max(1, +cfg.simSeconds || 30);
  const hitRate = Math.max(0, Math.min(1, (+cfg.hitRatePct || 0) / 100));
  // 初撃の発生時刻は未測定。時間窓の値は定常周期による期待値。
  const hitCount = periodSec > 0 ? simSeconds / periodSec : NaN;
  const expectedTotalDamage = damage * hitRate * hitCount;

  return {
    cfg, weapon, motion, supported, damage, currentDamage, weaponDelay, currentWeaponDelay,
    equipBuffRaw, equipBuffCapped, delayAuto, attackDelayBuff, stBonus, manualBonus,
    delayMultiplier, shortenedDelay, delaySec, fps, damageFrame, damageFrameSec,
    motionLockSec, periodSec, simSeconds, hitRate, hitCount, expectedTotalDamage,
    continuousDps: periodSec > 0 ? damage * hitRate / periodSec : NaN,
    windowDps: simSeconds > 0 ? expectedTotalDamage / simSeconds : NaN,
    attacksPerMinute: periodSec > 0 ? 60 / periodSec : NaN,
    warnings
  };
}
