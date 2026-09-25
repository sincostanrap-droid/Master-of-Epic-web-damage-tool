const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/main.js'),'utf8');
function block(a,b){return source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));}
let created=0,calcCalls=0,focusCalls=0,normalizedRows=0;
class Element {
 constructor(tag){created++;this.tag=tag;this.children=[];this.style={};this.classList={add(){}};this.className='';}
 appendChild(child){if(child.tag==='fragment'){for(const c of [...child.children])this.appendChild(c);return child;}child.parentNode=this;this.children.push(child);return child;}
 set innerHTML(value){this.children=[];}
 querySelectorAll(selector){return this.children.flatMap(c=>[(selector==='.'+c.className)?c:null,...c.querySelectorAll(selector)].filter(Boolean));}
 querySelector(selector){if(selector==='input:not([type=checkbox])')return this.children.flatMap(c=>c.tag==='input'?[c]:[c.querySelector(selector)]).find(Boolean)||null;return this.querySelectorAll(selector)[0]||null;}
 focus(){focusCalls++;}
 replaceWith(fragment){const parent=this.parentNode,index=parent.children.indexOf(this);parent.children.splice(index,1,...fragment.children);fragment.children.forEach(c=>c.parentNode=parent);this.parentNode=null;}
 remove(){const parent=this.parentNode;if(parent)parent.children.splice(parent.children.indexOf(this),1);this.parentNode=null;}
}
const body=new Element('tbody'),timers=new Map();let nextTimer=0;
const p={state:{composite:[]},document:{querySelector:()=>body,createElement:t=>new Element(t),createDocumentFragment:()=>new Element('fragment')},
 makeCell:(t,props={})=>Object.assign(new Element(t),props),ensureReviewedBuffCatalogButton(){},installCompactCompositeRowStyles(){},
 normalizeCompositeRows(rows){normalizedRows+=rows.length;return rows.map(r=>({...r}));},extraDefaultFields:()=>({}),
 renderEmptyRow(){body.appendChild(new Element('empty'));},
 checkboxCell:()=>new Element('td'),fixedCheckboxCell:()=>new Element('td'),excludeCheckboxCell:()=>new Element('td'),
 compositeEffectText:r=>String(r.flatAttack||0),compactCompositeSourceLabel:()=>'',makeCompositeExtraDetailRow:()=>new Element('detail'),compositeExtraCell:()=>new Element('td'),
 actionCell(arr,idx,render){const cell=new Element('td');cell.removeRow=()=>{arr.splice(idx,1);render();};return cell;},
 calc(){calcCalls++;},setTimeout(fn){const id=++nextTimer;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}};
vm.createContext(p);
vm.runInContext(block('function renderCompositeTable()','/* 旧項目: 割合ステータスBuff表'),p);
p.state.composite=Array.from({length:200},(_,i)=>({name:'Buff'+i,flatAttack:i}));p.renderCompositeTable();
const oldNodes=[...body.children],oldRow=p.state.composite[0],before=created,normalBefore=normalizedRows;
p.addCompositeRow();
assert.equal(body.children.length,402);assert.equal(normalizedRows-normalBefore,1,'normalize only the added row');
const addedNodes=created-before;assert.ok(addedNodes<30,'create only one pair of rows');assert.equal(p.state.composite[0],oldRow,'preserve live edit references');
assert.ok(oldNodes.every((node,i)=>body.children[i]===node),'existing DOM stays intact');assert.equal(calcCalls,0,'do not block add with calculation');assert.equal(focusCalls,1);
const newest=p.state.composite.at(-1);newest.flatAttack=42;p.refreshCompositeTableRow(newest);
assert.ok(oldNodes.every((node,i)=>body.children[i]===node),'effect add refreshes only edited row');
p.scheduleCompositeCalculation();p.scheduleCompositeCalculation();assert.equal(timers.size,1,'batch pending calculations');
for(const fn of timers.values())fn();timers.clear();assert.equal(calcCalls,1);
// Existing action closures still operate on the current array after appending.
body.children[0].children.at(-1).removeRow();assert.equal(p.state.composite[0].name,'Buff1');assert.equal(body.children.length,400);
p.state.composite=[];p.renderCompositeTable();p.addCompositeRow();assert.equal(body.children.length,2,'replace empty placeholder');
console.log(`Buff incremental rendering: 200 existing rows preserved, ${addedNodes} nodes for one addition; add/edit/delete and batched calculation OK`);
