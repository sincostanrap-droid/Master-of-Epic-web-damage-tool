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
  bindAttackDpsControls();
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

  const motionSelect = byId("attackDpsMotionProfile");
  if (motionSelect) {
    const key = attackDpsWeaponMotionKey(selectedWeaponForCalc(state));
    motionSelect.innerHTML = '<option value="auto">現在武器から選択</option>' +
      Object.entries(ATTACK_DPS_REMOTE_MOTIONS).filter(([id]) => cfg.weaponDelaySource === "manual" || id === key)
      .map(([id, motion]) => '<option value="' + id + '">' + motion.label + '</option>').join("");
    if (cfg.weaponDelaySource !== "manual" && cfg.motionProfile !== key) cfg.motionProfile = "auto";
  }
  bindSelect("attackDpsMotionProfile", "motionProfile");
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
        <h2>アタックDPS 遠隔β試作</h2>
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
        <label>スキル短縮・アタック短縮（手入力・短縮20%なら-20）
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
        <legend>実測モーション（クリキャン）</legend>
        <label>武器・モーション
          <select id="attackDpsMotionProfile"></select>
        </label>
        <p class="small">片手銃：タックル 約0.944秒 / 両手銃：猫又 約0.800秒 / 弓：猫又 約0.768秒。対応するモーションをゲーム内で使用する前提です。</p>
        <label class="checkLine"><input id="attackDpsCriticalCancel" type="checkbox">クリティカル時モーションキャンセルを適用</label>
        <p class="small">連続攻撃の実測下限です。初撃の発生時間ではありません。その他の武器・非キャンセルは未検証です。</p>
      </fieldset>

      <fieldset>
        <legend>表示</legend>
        <label>定常攻撃の換算秒数
          <input id="attackDpsSimSeconds" class="compactNumberInput" type="number" step="1" min="1">
        </label>
        <div class="attackDpsNote small">
          ディレイ値 × 0.01658秒で換算し、実測周期の下限と比較します。スキル短縮・アタック短縮は手入力です。時間窓の値は定常周期による換算で、初撃・弾着距離・ラグは含みません。
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
