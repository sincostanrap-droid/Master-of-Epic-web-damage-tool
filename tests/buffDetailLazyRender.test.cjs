const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/main.js'), 'utf8');
function block(start, end) { return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start))); }
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.style = {}; this.dataset = {}; this.className = ''; this.classList = {add(){}, toggle(){}}; }
  appendChild(child) { this.children.push(child); return child; }
  querySelector(selector) {
    for (const child of this.children) {
      if (selector.startsWith('.') ? child.className.split(' ').includes(selector.slice(1)) : child.tag === selector) return child;
      const found = child.querySelector(selector); if (found) return found;
    }
    return null;
  }
}
let builds = 0, calculations = 0, showcases = 0;
const pending = new Map();
let timerId = 0;
const context = {
  setTimeout(fn) { const id = ++timerId; pending.set(id, fn); return id; },
  clearTimeout(id) { pending.delete(id); },
  document: {createElement: tag => new Element(tag)},
  makeCell(tag, props = {}) { const el = Object.assign(new Element(tag), props); el.className = props.class || ''; return el; },
  updateCompositeExtraStatus(button, row) { button.textContent = row.name; },
  makeCompactCompositePrimaryEditor(row, summary, button) {
    builds++; const el = new Element('div');
    el.edit = value => { row.flatAttack = value; context.compactCompositeRefreshSummary(row, summary, button); };
    return el;
  },
  makeQuickEffectAdder() { builds++; return new Element('div'); },
  makeExtraStatsEditor() { builds++; return new Element('div'); },
  compositeEffectText: row => String(row.flatAttack), renderTagLinkSummary(){},
  renderShowcaseTab() { showcases++; }, calc() { calculations++; showcases++; }
};
vm.createContext(context);
vm.runInContext(block('let compositeCalcTimer =', 'function addCompositeRow('), context);
vm.runInContext(block('function makeCompositeExtraDetailRow(', '// __MOE_BUFF_CATALOG_PHASE1_V1__') + '\n' + block('function compactCompositeRefreshSummary(', 'function makeCompactCompositePrimaryEditor('), context);
const rows = Array.from({length:100}, () => ({name:'Buff', flatAttack:0}));
const summary = new Element('div');
const details = rows.map(row => context.makeCompositeExtraDetailRow(row));
const cells = rows.map((row, i) => context.compositeExtraCell(row, details[i], summary));
assert.equal(builds, 0, 'closed Buffs create no editors');
const button = cells[0].querySelector('button'); button.onclick();
assert.equal(builds, 3, 'first opening creates the three editor sections once');
const editor = details[0].querySelector('.compositeExtraEditor').children[0];
editor.edit(15);
assert.equal(summary.textContent, '15');
assert.equal(calculations, 0, 'editing does not synchronously recalculate');
editor.edit(16); editor.edit(15);
assert.equal(pending.size, 1, 'successive edits share one pending calculation');
for (const callback of pending.values()) callback();
pending.clear();
assert.equal(calculations, 1); assert.equal(showcases, 1, 'one calculation refreshes showcase once');
button.onclick(); assert.equal(details[0].style.display, 'none');
button.onclick(); assert.equal(builds, 3); assert.equal(rows[0].flatAttack, 15);
const refreshed = context.makeCompositeExtraDetailRow(rows[0]);
context.compositeExtraCell(rows[0], refreshed, summary);
assert.equal(builds, 6, 'open row restores editors on table refresh');
assert.equal(rows[0].flatAttack, 15);
console.log('buffDetailLazyRender: OK (100 closed Buffs: no editors; first open/reopen/edit/refresh preserved; no double showcase refresh)');
