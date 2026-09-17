/* Node >=18. Runs the real calculation/search code, not a scoring mock.
 * node tools/benchmark-optimizer.cjs [--baseline /path/to/clean/main] [--repeats 3]
 * Baseline loader skips DOM-only installers; calculation/search sources are unchanged.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {performance} = require('node:perf_hooks');
const root = path.resolve(__dirname, '..');
const json = value => JSON.parse(JSON.stringify(value));
function context(repo=root, {worker=false, data=true, catalog=false}={}) {
  const ctx = vm.createContext({console, performance, setTimeout, clearTimeout});
  ctx.self = ctx;
  const load = (file, legacy=false) => {
    let source = fs.readFileSync(path.join(repo, file), 'utf8');
    if (legacy && file === 'src/main.js') {
      for (const name of ['installOptimizerEquipmentContributionV1', 'installOptimizerBuffContributionV1', 'installOptimizerReplacementThresholdsV1']) {
        source = source.replace(`(function ${name}() {`, `(function ${name}() { if (typeof document === 'undefined') return;`);
      }
      source = source.replace('(function installNpcEffectSlotsV1(global) {', '(function installNpcEffectSlotsV1(global) { if (typeof document === "undefined") return;');
    }
    vm.runInContext(source, ctx, {filename:file});
  };
  if (worker) {
    ctx.importScripts = (...files) => files.forEach(f => load(path.join('src/optimizer', f.split('?')[0])));
    load('src/optimizer/optimizer.worker.js');
  } else {
    ctx.window = ctx;
    for (const f of ['src/domain/attackDpsState.js', 'src/domain/catalogData.js', 'src/domain/catalogSearch.js', 'src/main.js', 'src/ui/showcase.js', 'src/calc/core.js', 'src/optimizer/core.js']) load(f, true);
  }
  if (data) {
    for (const f of ['src/data/generated/equipBuffRuleCandidates.generated.js', 'src/data/generated/skillBuffCompatibility.generated.js', 'src/data/generated/damageBuffCompatibility.generated.js', 'src/data/manual/buffRules.manual.js']) load(f);
  }
  if (catalog) {
    for (const f of ['src/data/generated/equipmentCatalog.generated.js', 'src/data/generated/buffCatalog.generated.js', 'src/ui/catalogResults.js']) load(f);
  }
  return ctx;
}
function fixture(ctx, mode='synthetic') {
  return json(vm.runInContext(`(() => {
    const p={state:DEFAULT_STATE(), inputs:{raceSelect:'newtar',str:100,spirit:100,weaponDamage:100,weaponWeight:5,weaponSkill:100,techMultiplier:1,atkCap:500}, settings:{maxSlots:24,topN:10,beamWidth:10,equipmentEvalLimit:3,exactEquipmentLimit:1,buffMode:'local',localPasses:2,objective:'damage',includeDisabledBuffs:true,forceOtherBuffs:true,includeCurrentConfig:true,evaluateCurrentEquipment:true}};
    if (${JSON.stringify(mode)} === 'synthetic') {
      for(let s=3;s<9;s++) for(let i=0;i<5;i++) p.state.equipment.push({...defaultEquipmentCandidate(EQUIPMENT_SLOTS[s].slot,false),name:'fixture'+s+'-'+i,attack:i+1,magic:5-i,equipBuffEnabled:true,equipBuffName:'fixture-buff'+s+'-'+i,equipBuffFlatAttack:i+2,equipBuffConflictGroup:'fixture-group'+s});
      p.state.composite=Array.from({length:12},(_,i)=>({enabled:true,name:'external'+i,slot:true,flatAttack:i+1,flatMagic:12-i,tags:'group'+(i%6)}));
    } else {
      const names=['サイドパート ウィッグ','南雲ハジメ なりきりコート','アメフト ユニフォーム'];
      const items=equipmentCatalogItems();
      const chosen=names.map(name=>items.find(item=>catalogNorm(item.name)===catalogNorm(name)));
      if(chosen.some(x=>!x)) throw new Error('Catalog regression fixture missing');
      p.state.equipment=chosen.map(catalogEquipmentToRow);
      const weapon={...defaultEquipmentCandidate('武器: 右手',true),name:'fixture-bow',weaponDamage:80,weaponRange:12,weaponTwoHanded:'○',weaponReq:[{name:'弓',required:100}]};
      p.state.equipment.push(weapon,{...defaultEquipmentCandidate('武器: 弾丸',true),name:'fixture-arrow',weaponDamage:10,weaponRange:3});
      p.state.equipment[0].enabled=true;
      p.state.equipment[3].optimizerFixed=true;
      p.state.equipment[4].optimizerFixed=true;
      p.state.composite=[{name:'fixed',enabled:true,fixed:true,flatAttack:10},{name:'same-group-a',enabled:false,flatAttack:15,tags:'test-conflict'},{name:'same-group-b',enabled:true,flatMagic:20,tags:'test-conflict'},{name:'fixed-off',enabled:false,fixed:true,flatAttack:999},{name:'delay',enabled:true,extraAttackDelay:-60}];
      p.settings.exactEquipmentLimit=3000;
      p.settings.mainWeaponSkill='弓';
    }
    return p;
  })()`, ctx));
}
function compare(a,b,label) {
  assert.deepEqual(json(a.results),json(b.results),label+': every result field');
  assert.deepEqual(json(a.summary.optimizerDiagnostic),json(b.summary.optimizerDiagnostic),label+': exploration coverage');
  for(const key of ['optimizerEvalCount','optimizerCacheHits','optimizerCapRejected','optimizerPrunedBuffs']) assert.equal(a.summary.settings[key],b.summary.settings[key],label+': '+key);
}
function run(ctx,payload,profile=false) {
  if(profile) vm.runInContext(`globalThis.__profile={}; for(const name of ['clone','normalizeEquipmentRows','normalizeCompositeRows','computeMetrics']) {const base=globalThis[name]; globalThis[name]=function(...args) {const start=performance.now();try{return base(...args);} finally {const item=__profile[name]||(__profile[name]={calls:0,ms:0});item.calls++;item.ms+=performance.now()-start;}}}`,ctx);
  const started=performance.now();
  const out=ctx.runOptimizerCore(json(payload));
  const ms=performance.now()-started;
  const transferStart=performance.now();
  const copied=structuredClone(out);
  const transferMs=performance.now()-transferStart;
  return {out,ms,transferMs,profile:ctx.__profile,cacheEntries:out.summary.settings._evaluationCache?.size||0};
}
if(require.main===module) {
  const args=process.argv.slice(2);
  const baselineIndex=args.indexOf('--baseline');
  const baseline=baselineIndex>=0?path.resolve(args[baselineIndex+1]):null;
  const repeatIndex=args.indexOf('--repeats');
  const repeats=repeatIndex>=0?Math.max(1,Number(args[repeatIndex+1])):1;
  for(const mode of ['synthetic','catalog']) {
    const current=context(root,{catalog:mode==='catalog'});
    const payload=fixture(current,mode);
    const old=baseline?context(baseline,{catalog:mode==='catalog'}):null;
    for(let i=0;i<repeats;i++) {
      const before=old?run(old,payload):null;
      const after=run(current,payload);
      if(before) compare(before.out,after.out,mode);
      console.log(JSON.stringify({mode,iteration:i+1,beforeMs:before?.ms,afterMs:after.ms,speedup:before?before.ms/after.ms:null,beforeTransferMs:before?.transferMs,afterTransferMs:after.transferMs,beforeCacheEntries:before?.cacheEntries,afterCacheEntries:after.cacheEntries,evaluations:after.out.summary.settings.optimizerEvalCount,results:after.out.results.length,equivalent:before?true:null}));
    }
  }
}
module.exports={context,fixture,compare,run,json,root};
