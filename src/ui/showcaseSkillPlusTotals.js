/* v21.2: showcase skillPlus total summary
 * skillPlus はステータス/成功率/必要スキル/ダメージ式には加算しない。
 * 見せびらかしページに現在構成の合計値としてだけ表示する。
 */
(function installShowcaseSkillPlusTotalsV212(global) {
  if (global.__MOE_SKILL_PLUS_SHOWCASE_TOTALS_V21_2_INSTALLED__) return;
  global.__MOE_SKILL_PLUS_SHOWCASE_TOTALS_V21_2_INSTALLED__ = true;

  function num(value) {
    const v = parseFloat(value);
    return Number.isFinite(v) ? v : 0;
  }

  function addTotal(totals, skill, value) {
    const name = String(skill || "").trim();
    const v = num(value);
    if (!name || !v) return;
    totals[name] = (totals[name] || 0) + v;
  }

  function mergeTotals(...parts) {
    const out = {};
    parts.forEach(part => {
      Object.entries(part || {}).forEach(([skill, value]) => addTotal(out, skill, value));
    });
    return out;
  }

  function parseSkillPlusEffects(value) {
    const totals = {};
    if (!value) return totals;

    let effects = [];
    try {
      if (typeof normalizeAdditionalEffects === "function") effects = normalizeAdditionalEffects(value) || [];
      else if (Array.isArray(value)) effects = value;
    } catch {}

    (effects || []).forEach(e => {
      if (!e || e.key !== "skillPlus") return;
      addTotal(totals, e.name || e.skill || e.targetSkill, e.value ?? e.amount ?? e.plus);
    });

    if (!Array.isArray(value)) {
      String(value || "").split(/[;\n]/).forEach(part => {
        const cols = part.split("|");
        if (String(cols[0] || "").trim() !== "skillPlus") return;
        addTotal(totals, cols[1], cols[2]);
      });
    }

    return totals;
  }

  function rowSkillPlusTotals(row) {
    // まず行に保存済みの skillPlus を優先する。
    // カタログ投入済み行では extraEffects に skillPlus が入ることがあるため、
    // 互換表復元と二重加算しない。
    const direct = mergeTotals(
      parseSkillPlusEffects(row?.extraEffects),
      parseSkillPlusEffects(row?.equipBuff?.extraEffects),
      parseSkillPlusEffects(row?.equipBuffExtraEffects)
    );
    if (Object.keys(direct).length) return direct;

    // 保存済み skillPlus が無い旧データは v21 の互換復元を利用する。
    try {
      const api = global.MOESkillPlusV21;
      if (api && typeof api.totalsFromObject === "function") return api.totalsFromObject(row) || {};
    } catch {}
    return {};
  }

  function activeRowsForSkillPlusTotals() {
    const rows = [];
    try {
      if (typeof state === "undefined" || !state) return rows;

      const equipment = Array.isArray(state.equipment) ? state.equipment : [];
      if (typeof resolveEquipmentBuffRowsForSameTechnic === "function") {
        rows.push(...(resolveEquipmentBuffRowsForSameTechnic(equipment) || []));
      } else {
        rows.push(...equipment.filter(r => r && r.enabled !== false && r.equipBuffEnabled));
      }

      // 手動Buff/複合欄に skillPlus を置いた場合も合計表示できるようにする。
      if (Array.isArray(state.composite)) rows.push(...state.composite.filter(r => r && r.enabled !== false));
    } catch {}
    return rows;
  }

  function currentSkillPlusTotals() {
    const out = {};
    activeRowsForSkillPlusTotals().forEach(row => {
      Object.entries(rowSkillPlusTotals(row)).forEach(([skill, value]) => addTotal(out, skill, value));
    });
    return out;
  }

  function formatValue(value) {
    const v = num(value);
    const body = typeof fmt === "function" ? fmt(v, 2) : String(Math.round(v * 100) / 100);
    return `${v > 0 ? "+" : ""}${body}`;
  }

  function skillPlusEntries(totals) {
    return Object.entries(totals || {})
      .map(([skill, value]) => [skill, num(value)])
      .filter(([, value]) => value)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"));
  }

  function summaryText(totals) {
    const entries = skillPlusEntries(totals);
    if (!entries.length) return "";
    return entries.map(([skill, value]) => `${skill}強化 ${formatValue(value)}`).join(" / ");
  }

  function ensurePanel() {
    let panel = document.getElementById("showcaseSkillPlusTotals");
    if (panel) return panel;
    const view = document.getElementById("showcaseView");
    if (!view || !view.parentNode) return null;
    panel = document.createElement("div");
    panel.id = "showcaseSkillPlusTotals";
    panel.className = "showcaseSkillPlusTotals";
    panel.setAttribute("aria-live", "polite");
    view.parentNode.insertBefore(panel, view);
    return panel;
  }

  // 複数の見せびらかし集計が同じコピー欄を更新しても、
  // 既存の集計行を必ず一括で除去してから再構成する。
  const copyHeaders = global.MOEShowcaseCopyHeaders || (global.MOEShowcaseCopyHeaders = (() => {
    const values = new Map();
    const order = ["skill", "element", "recovery"];
    const strip = text => String(text || "").replace(/^(?:スキル強化合計|属性強化合計|自然回復・継続増減合計):[^\r\n]*(?:\r?\n)*/gm, "");
    const render = () => {
      const textarea = document.getElementById("showcaseText");
      if (!textarea) return;
      const headers = order.map(key => values.get(key)).filter(Boolean);
      const base = strip(textarea.value || "");
      textarea.value = headers.length ? `${headers.join("\n")}\n${base}` : base;
    };
    return {
      set(key, text) {
        if (text) values.set(key, text);
        else values.delete(key);
        render();
      },
      strip,
      render
    };
  })());

  function updateShowcaseSkillPlusTotals() {
    if (typeof document === "undefined") return;
    const totals = currentSkillPlusTotals();
    const body = summaryText(totals);
    const panel = ensurePanel();
    if (panel) {
      if (body) {
        panel.hidden = false;
        panel.innerHTML = `<div class="showcaseSkillPlusTotalsTitle">スキル強化合計</div><div class="showcaseSkillPlusTotalsBody">${typeof escapeHtml === "function" ? escapeHtml(body) : body}</div>`;
      } else {
        panel.hidden = true;
        panel.textContent = "";
      }
    }

    // コピー用のプレーンテキストにも合計を入れる。
    copyHeaders.set("skill", body ? `スキル強化合計: ${body}` : "");
  }

  let scheduled = false;
  function scheduleShowcaseSkillPlusTotalsUpdate(event) {
    // カタログの検索条件はShowcaseの現在構成を変更しない。
    // 大量の結果行がある画面で、キー入力ごとにShowcase集計を走らせない。
    if (event?.target?.closest?.('[data-tab-panel="catalog"]')) return;
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      updateShowcaseSkillPlusTotals();
    }, 0);
  }

  function wrapRenderFunction(name) {
    const fn = global[name];
    if (typeof fn !== "function" || fn.__skillPlusTotalsV212Wrapped) return;
    const wrapped = function(...args) {
      const ret = fn.apply(this, args);
      scheduleShowcaseSkillPlusTotalsUpdate();
      return ret;
    };
    wrapped.__skillPlusTotalsV212Wrapped = true;
    global[name] = wrapped;
  }

  function installHooks() {
    if (installHooks.installed) return;
    installHooks.installed = true;
    wrapRenderFunction("renderShowcase");
    wrapRenderFunction("updateShowcase");
    wrapRenderFunction("renderAll");
    wrapRenderFunction("render");

    document.addEventListener("input", scheduleShowcaseSkillPlusTotalsUpdate, true);
    document.addEventListener("change", scheduleShowcaseSkillPlusTotalsUpdate, true);
    document.addEventListener("click", scheduleShowcaseSkillPlusTotalsUpdate, true);

    const view = document.getElementById("showcaseView");
    if (view && typeof MutationObserver !== "undefined") {
      try {
        new MutationObserver(scheduleShowcaseSkillPlusTotalsUpdate).observe(view, {childList: true, subtree: true, characterData: true});
      } catch {}
    }

    scheduleShowcaseSkillPlusTotalsUpdate();
  }

  if (typeof document !== "undefined") {
    function initializeShowcaseOnFirstDisplay(event) {
      if (event.detail?.id !== "showcase") return;
      installHooks();
      document.removeEventListener("moe:main-tab-activated", initializeShowcaseOnFirstDisplay);
    }
    document.addEventListener("moe:main-tab-activated", initializeShowcaseOnFirstDisplay);
    if (localStorage.getItem("moeDamageSimActiveTab") === "showcase") {
      queueMicrotask(() => initializeShowcaseOnFirstDisplay({detail:{id:"showcase"}}));
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
