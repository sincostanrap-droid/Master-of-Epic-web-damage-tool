/*
  Attack DPS controls

  攻撃DPSタブの入力状態、手入力欄の表示切替、イベント登録を管理します。
*/

function attackDpsState() {
  state.attackDps = normalizeAttackDpsState(state.attackDps);
  return state.attackDps;
}

function setAttackDpsField(key, value, type="number") {
  const cfg = attackDpsState();
  if (type === "checkbox") cfg[key] = !!value;
  else if (type === "select") cfg[key] = value;
  else {
    const n = parseFloat(value);
    cfg[key] = Number.isFinite(n) ? n : 0;
  }
  updateAttackDpsManualVisibility();
  calc();
}

function updateAttackDpsManualVisibility() {
  const cfg = attackDpsState();
  document.querySelectorAll('[data-attack-dps-manual-for="damage"]').forEach(el => {
    el.hidden = cfg.damageSource !== "manual";
  });
  document.querySelectorAll('[data-attack-dps-manual-for="weaponDelay"]').forEach(el => {
    el.hidden = cfg.weaponDelaySource !== "manual";
  });
  document.querySelectorAll('[data-attack-dps-manual-for="equipBuffDelay"]').forEach(el => {
    el.hidden = cfg.equipmentBuffDelaySource !== "manual";
  });
}

function bindAttackDpsControls() {
  const cfg = attackDpsState();
  const bindNumber = (id, key) => {
    const el = byId(id);
    if (!el) return;
    el.value = cfg[key] ?? 0;
    el.oninput = e => setAttackDpsField(key, e.target.value, "number");
  };
  const bindSelect = (id, key) => {
    const el = byId(id);
    if (!el) return;
    el.value = cfg[key];
    el.onchange = e => setAttackDpsField(key, e.target.value, "select");
  };
  const bindCheckbox = (id, key) => {
    const el = byId(id);
    if (!el) return;
    el.checked = !!cfg[key];
    el.onchange = e => setAttackDpsField(key, e.target.checked, "checkbox");
  };

  bindSelect("attackDpsDamageSource", "damageSource");
  bindNumber("attackDpsManualDamage", "manualDamage");
  bindSelect("attackDpsWeaponDelaySource", "weaponDelaySource");
  bindNumber("attackDpsManualWeaponDelay", "manualWeaponDelay");
  bindSelect("attackDpsEquipBuffDelaySource", "equipmentBuffDelaySource");
  bindNumber("attackDpsEquipBuffDelay", "equipmentBuffDelay");
  bindNumber("attackDpsAttackDelayBuff", "attackDelayBuff");
  bindNumber("attackDpsStDelayBonus", "stDelayBonus");
  bindCheckbox("attackDpsManualAttackBonus", "manualAttackBonus");
  bindCheckbox("attackDpsCriticalCancel", "criticalCancel");
  bindNumber("attackDpsDamageFrame", "damageFrame");
  bindNumber("attackDpsNonCancelMotionFrames", "nonCancelMotionFrames");
  bindNumber("attackDpsFps", "fps");
  bindNumber("attackDpsSimSeconds", "simSeconds");
  bindNumber("attackDpsHitRatePct", "hitRatePct");

  updateAttackDpsManualVisibility();

  const copy = byId("attackDpsCopyCurrent");
  if (copy) copy.onclick = copyCurrentToAttackDps;
}

function createAttackDpsTab(panel) {
  const wrap = document.createElement("section");
  wrap.id = "attackDpsRoot";
  wrap.className = "attackDpsPanel";
  wrap.innerHTML = `
    <div class="attackDpsHeader">
      <div>
        <h2>アタックDPS α</h2>
        <p class="small">通常アタック向けの参考値です。現代運用を想定して、初期値はクリティカル100% + クリティカル時モーションキャンセルONにしています。</p>
      </div>
      <button type="button" id="attackDpsCopyCurrent">現在構成を手入力欄へ反映</button>
    </div>

    <div class="attackDpsGrid">
      <fieldset>
        <legend>1発ダメージ</legend>
        <label>ダメージ参照
          <select id="attackDpsDamageSource">
            <option value="current">計算タブの予想ダメージ</option>
            <option value="manual">手入力</option>
          </select>
        </label>
        <label data-attack-dps-manual-for="damage">手入力ダメージ
          <input id="attackDpsManualDamage" class="compactNumberInput" type="number" step="1">
        </label>
        <label>命中率%
          <input id="attackDpsHitRatePct" class="compactNumberInput" type="number" step="0.1" min="0" max="100">
        </label>
      </fieldset>

      <fieldset>
        <legend>ディレイ短縮</legend>
        <label>武器ディレイ参照
          <select id="attackDpsWeaponDelaySource">
            <option value="currentWeapon">現在の計算武器</option>
            <option value="manual">手入力</option>
          </select>
        </label>
        <label data-attack-dps-manual-for="weaponDelay">手入力 武器ディレイ
          <input id="attackDpsManualWeaponDelay" class="compactNumberInput" type="number" step="0.1">
        </label>
        <label>装備+攻撃ディレイBuff枠 参照
          <select id="attackDpsEquipBuffDelaySource">
            <option value="auto">ONの装備/Buffから自動</option>
            <option value="manual">手入力</option>
          </select>
        </label>
        <label data-attack-dps-manual-for="equipBuffDelay">手入力 装備+攻撃ディレイBuff枠
          <input id="attackDpsEquipBuffDelay" class="compactNumberInput" type="number" step="0.1">
          <span class="small">手入力時に使用 / -60で上限</span>
        </label>
        <label>アタック短縮Buff枠
          <input id="attackDpsAttackDelayBuff" class="compactNumberInput" type="number" step="0.1">
        </label>
        <label>ST補正%
          <input id="attackDpsStDelayBonus" class="compactNumberInput" type="number" step="0.1">
          <span class="small">ST200以上なら -10 想定</span>
        </label>
        <label class="checkLine">
          <input id="attackDpsManualAttackBonus" type="checkbox">
          手動アタック補正 -10% を適用
        </label>
      </fieldset>

      <fieldset>
        <legend>モーション</legend>
        <label>ダメージ発生フレーム
          <input id="attackDpsDamageFrame" class="compactNumberInput" type="number" step="1">
        </label>
        <label>非キャンセル時の行動不能フレーム
          <input id="attackDpsNonCancelMotionFrames" class="compactNumberInput" type="number" step="1">
        </label>
        <label>FPS
          <input id="attackDpsFps" class="compactNumberInput" type="number" step="1" min="1">
        </label>
        <label class="checkLine">
          <input id="attackDpsCriticalCancel" type="checkbox">
          クリティカル時モーションキャンセルを適用
        </label>
      </fieldset>

      <fieldset>
        <legend>表示</legend>
        <label>初撃込みDPSの計測秒数
          <input id="attackDpsSimSeconds" class="compactNumberInput" type="number" step="1" min="1">
        </label>
        <div class="attackDpsNote small">
          α版ではディレイ欄の数値を「60.3 ≒ 1秒」、つまり「ディレイ × 0.01658 秒」として秒換算します。装備本体/装備Buff/装備以外BuffでONになっている「攻撃ディレイ」値は自動参照できます。発生フレームはFPSで秒換算します。遠隔武器の弾着・距離・入力遅延・ラグ・対象デバフ変動は未考慮です。
        </div>
      </fieldset>
    </div>

    <div id="attackDpsResult" class="attackDpsResult"></div>
  `;
  panel.appendChild(wrap);
  bindAttackDpsControls();
}

function copyCurrentToAttackDps() {
  try {
    syncSelectedWeaponToHiddenInputs();
    syncRaceCoeff();
    syncBaseMagic();
    syncAttackTypeUI();
    const inputs = collectInputs();
    inputs.raceCoeff = byId("raceCoeff")?.value || inputs.raceCoeff;
    inputs.techMultiplier = byId("techMultiplier")?.value || inputs.techMultiplier;
    const metrics = computeMetrics(expandSkillSimMasteryBuffState(state), inputs);
    const cfg = attackDpsState();
    cfg.manualDamage = Math.max(0, Math.floor(metrics.finalDamage || 0));
    const weapon = selectedWeaponForCalc(state);
    if (weapon && +weapon.weaponAttackInterval > 0) cfg.manualWeaponDelay = +weapon.weaponAttackInterval;
    const delayAuto = collectAttackDpsDelaySources(state);
    cfg.equipmentBuffDelay = delayAuto.total || 0;
    bindAttackDpsControls();
    renderAttackDpsTab(metrics);
    calc();
  } catch (e) {
    alert("現在構成の反映に失敗しました: " + (e?.message || e));
  }
}
