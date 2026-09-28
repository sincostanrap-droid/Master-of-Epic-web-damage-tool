/* Progressive conditions; all existing control IDs and optimizer parsing remain intact. */
function initializeCompactSettings() {
  const rows = [...document.querySelectorAll(".optimizerSkillPlusFilterRow")];
  if (!rows.length || rows[0].dataset.compactReady) return;
  const container = rows[0].parentElement;
  rows[0].dataset.compactReady = "1";
  const add = document.createElement("button");
  add.type = "button"; add.className = "optimizerAddCondition";
  add.textContent = "＋ 条件を追加";
  const update = () => { add.disabled = rows.every(row => !row.hidden); };
  rows.forEach((row, index) => {
    const select = row.querySelector("[data-skill-plus-filter-select]");
    row.hidden = index > 0 && !select?.value;
    const remove = document.createElement("button");
    remove.type = "button"; remove.className = "optimizerRemoveCondition";
    remove.textContent = "削除"; remove.setAttribute("aria-label", "スキル強化条件" + (index + 1) + "を削除");
    remove.onclick = () => {
      select.value = "";
      const value = row.querySelector('input[type="number"]');
      if (value) value.value = "";
      const op = row.querySelector('[id^="optimizerSkillPlusFilterOp"]');
      if (op) op.value = "gte";
      if (rows.filter(r => !r.hidden).length > 1) row.hidden = true;
      select.dispatchEvent(new Event("change", {bubbles:true}));
      update();
    };
    row.append(remove);
  });
  add.onclick = () => {
    const next = rows.find(row => row.hidden);
    if (next) {
      next.hidden = false;
      next.querySelector("select")?.focus({preventScroll:true});
    }
    update();
  };
  container.after(add);
  update();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeCompactSettings, {once:true});
else initializeCompactSettings();
