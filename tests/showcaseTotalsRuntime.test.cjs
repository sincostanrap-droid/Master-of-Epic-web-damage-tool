const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {context, json, root} = require('../tools/benchmark-optimizer.cjs');

// HTMLだけ配布されてJSが欠落する事故を検出する。
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const [, src] of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) {
  if (!/^https?:/.test(src)) assert.ok(fs.existsSync(path.join(root, src.split('?')[0])), src);
}

const p = context(root, {catalog:true});
for (const file of ['showcaseSkillPlusTotals', 'showcaseElementDamageTotals', 'showcaseRecoveryTotals']) {
  vm.runInContext(fs.readFileSync(path.join(root, 'src/ui', file+'.js'), 'utf8'), p);
}
const rowFor = name => {
  const item = p.equipmentCatalogItems().find(i => i.name === name);
  assert.ok(item, name);
  return {...json(p.catalogEquipmentToRow(item)), enabled:true};
};
const fire = rowFor('フレイム デビル ウイング');
const recovery = rowFor('光のブローチ');
function resolve(equipment, composite=[]) {
  p.__equipment = json(equipment); p.__composite = json(composite);
  vm.runInContext('state=DEFAULT_STATE();state.equipment=__equipment;state.composite=__composite', p);
  return p.showcaseResolvedBuffState();
}
assert.equal(p.showcaseElementDamageTotals(resolve([fire]))['火属性'],20);
assert.equal(p.showcaseElementDamageTotals(resolve([fire,fire]))['火属性'],20,'same technic counted once');
assert.deepEqual(json(p.showcaseElementDamageTotals(resolve([{...fire,equipBuffEnabled:false}]))),{});
assert.deepEqual(json(p.showcaseElementDamageTotals(resolve([{...fire,enabled:false}]))),{});
const effect = value => [{key:'elementDamagePct',name:'火属性',value,scope:'display'}];
const active = resolve([], [
  {enabled:true,name:'a',tags:'test-element',extraEffects:effect(10)},
  {enabled:true,name:'b',tags:'test-element',extraEffects:effect(20)},
  {enabled:true,name:'excluded',excluded:true,extraEffects:effect(99)},
  {enabled:false,name:'off',extraEffects:effect(99)},
]);
assert.equal(active.composite.filter(r=>r.enabled&&!r.excluded).length,1);
assert.equal(p.showcaseElementDamageTotals(active)['火属性'],active.composite.find(r=>r.enabled&&!r.excluded).extraEffects[0].value);

resolve([recovery]);
const st = vm.runInContext('state',p);
const before = json(st);
const inputs = {raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,atkCap:500,techMultiplier:1};
const metrics = p.computeMetrics(st,inputs);
assert.equal(metrics.extraStats.hpRegenPerMinute,42);
assert.match(p.showcaseRecoverySummary(metrics), /HP自然回復 \+42\/分/);
assert.equal(p.showcaseRecoverySummary({extraStats:{hpRegenPerMinute:30,mpChangePerSecond:-2}}),'HP自然回復 +30/分 / MP増減 -2/秒');
assert.deepEqual(json(st),before,'summary/calculation must not mutate saved rows');

// 共通コピー欄は何度描き直しても見出しを重複させず、無効化時に消える。
const nodes = new Map();
const makeNode = () => ({children:[],textContent:'',append(...xs){this.children.push(...xs);},setAttribute(){}});
nodes.set('showcaseText',{value:'構成本文'});
nodes.set('showcaseView',{parentNode:{insertBefore(node){nodes.set(node.id,node);}}});
p.document={getElementById:id=>nodes.get(id),createElement:makeNode};
p.MOEShowcaseCopyHeaders.set('skill','スキル強化合計: 刀剣強化 +3');
for(let i=0;i<3;i++) {
  p.renderShowcaseElementDamageTotals(resolve([fire]));
  p.renderShowcaseRecoveryTotals(metrics);
}
assert.equal(nodes.get('showcaseText').value,'スキル強化合計: 刀剣強化 +3\n属性強化合計: 火属性ダメージ +20%\n自然回復・継続増減合計: HP自然回復 +42/分\n構成本文');
p.renderShowcaseElementDamageTotals(resolve([]));
p.renderShowcaseRecoveryTotals({extraStats:{}});
assert.equal(nodes.get('showcaseElementDamageTotals').hidden,true);
assert.equal(nodes.get('showcaseRecoveryTotals').hidden,true);
assert.equal(nodes.get('showcaseText').value,'スキル強化合計: 刀剣強化 +3\n構成本文');

// 初回起動でShowcaseタブを復元する場合、後続のdefer scriptより先に描画しない。
for (const restored of [true,false]) {
  const events = new Map(); let renders = 0;
  const boot = vm.createContext({
    document:{readyState:restored?'loading':'complete',getElementById:()=>null,
      addEventListener:(type,fn)=>events.set(type,fn),removeEventListener:type=>events.delete(type)},
    localStorage:{getItem:()=>restored?'showcase':'calc'},
    queueMicrotask:fn=>fn(),setTimeout:()=>0,
    renderShowcaseTab:()=>{renders++;}
  });
  vm.runInContext(fs.readFileSync(path.join(root,'src/ui/showcaseSkillPlusTotals.js'),'utf8'),boot);
  assert.equal(renders,0);
  if (restored) events.get('DOMContentLoaded')();
  else events.get('moe:main-tab-activated')({detail:{id:'showcase'}});
  assert.equal(renders,1);
}
console.log('showcase totals runtime: OK (catalog Buffs, duplicate/off/conflict, units, copy reset, script references)');
