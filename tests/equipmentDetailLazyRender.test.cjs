const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/main.js'), 'utf8');
function block(start, end) { return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start))); }
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.style = {}; this.dataset = {}; this.className = ''; this.classList = {add(){}, toggle(){}}; }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  replaceWith(child) { const i = this.parent.children.indexOf(this); child.parent = this.parent; this.parent.children[i] = child; }
  querySelector(selector) {
    const matches = el => selector.startsWith('.') ? el.className.split(' ').includes(selector.slice(1)) : el.tag === selector;
    for (const child of this.children) { if (matches(child)) return child; const found = child.querySelector(selector); if (found) return found; }
    return null;
  }
}
let builds = 0;
const context = {
  document: {createElement: tag => new Element(tag), createDocumentFragment: () => new Element('fragment')},
  makeCell(tag, props = {}) { return Object.assign(new Element(tag), props); },
  updateEquipBuffStatus(button, row) { button.textContent = row.name; },
  makeEquipmentBuffEditor(row, button) {
    builds++;
    const el = new Element('div'); el.className = 'equipBuffGrid'; el.row = row; el.statusButton = button;
    el.edit = value => { row.note = value; button.textContent = value; };
    return el;
  },
  equipmentUseCell: () => new Element('td'), equipmentOptimizerFixedCell: () => new Element('td'),
  equipmentOptimizerExcludeCell: () => new Element('td'), tagInputCell: () => new Element('td'),
  equipmentActionCell: () => new Element('td'), attachEquipmentInlineBuffSummaryToRow(){}
};
vm.createContext(context);
vm.runInContext(block('function makeEquipmentBuffButtonCell(', '/* 装備1行分の入力欄') + '\n' + block('function makeEquipmentInputRow(', '/* 武器/防具/装飾の固定行テーブル'), context);
const rows = Array.from({length: 100}, (_, i) => ({name: `装備${i}`, slot: '防具: 手', note: ''}));
const rendered = rows.map((row, i) => context.makeEquipmentInputRow(row, false, i));
assert.equal(builds, 0, '100 collapsed rows build no detail editors');
const detail = rendered[0].children[1];
const button = rendered[0].querySelector('button');
button.onclick();
assert.equal(builds, 1);
const editor = detail.querySelector('.equipBuffGrid');
assert.equal(editor.statusButton, button, 'editor updates the real visible button');
editor.edit('手入力を保持');
button.onclick();
assert.equal(detail.style.display, 'none');
button.onclick();
assert.equal(builds, 1, 'reopening does not rebuild');
assert.equal(detail.querySelector('.equipBuffGrid'), editor);
assert.equal(rows[0].note, '手入力を保持');
assert.equal(button.textContent, '手入力を保持');
const rerendered = context.makeEquipmentInputRow(rows[0], false, 0);
assert.equal(builds, 2, 'an open row rebuilds exactly once on table refresh');
assert.equal(rerendered.children[1].style.display, '');
assert.equal(rerendered.querySelector('.equipBuffGrid').row.note, '手入力を保持');
assert.equal(rerendered.querySelector('.equipBuffGrid').statusButton, rerendered.querySelector('button'));
console.log('equipmentDetailLazyRender: OK (100 closed rows: 0 editors; first open: 1; reopen: 0 additional)');
