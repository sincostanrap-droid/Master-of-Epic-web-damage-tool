/* Runtime audit: compare reviewed source effects with actual rule resolution,
 * catalog imports, searches and rendered labels. No source-string presence tests. */
const assert = require('node:assert/strict');
const {context} = require('./benchmark-optimizer.cjs');
const TIMING_EXPECTATIONS = [
  [11780,'アイテム使用ディレイ',-15,'%'],[9401,'音楽ディレイ',-10,'%'],
  [10062,'回復魔法ディレイ',-15,'%'],[11160,'強化魔法ディレイ',-15,'%'],
  [11357,'召喚魔法ディレイ',-30,'%'],[9286,'刀剣ディレイ',-15,'%'],
  [12154,'罠ディレイ',-20,'%'],[11839,'槍ディレイ',-15,''],
  [7758,'死の魔法ディレイ',-15,''],[10929,'ダンスディレイ',-15,''],
  [13083,'死の魔法ディレイ',-15,'%'],[11280,'魔法ディレイ',-10,'%'],
  [7378,'音楽ディレイ',-20,'%'],[2967,'弓攻撃ディレイ',-5,'%'],
  [13504,'銃器ディレイ',-20,'%'],[13962,'銃器ディレイ',-20,'%'],
  [14091,'召喚魔法ディレイ',-25,'%']
];
function audit(p=context(undefined,{catalog:true})) {
  const items=p.equipmentCatalogItems();
  const byBuff=new Map();
  for(const item of items) {
    const buff=p.catalogBuffForItem(item); if(!buff) continue;
    const key=String(buff.officialTechnicId || buff.id || buff.catalogId || '').replace(/^technic-/, '');
    if(!byBuff.has(key)) byBuff.set(key,[]);
    byBuff.get(key).push(item);
  }
  let timingItems=0;
  for(const [id,name,value,unit] of TIMING_EXPECTATIONS) {
    const rule=p.findEquipBuffRuleCandidate({officialTechnicId:id});
    assert.ok(rule,`rule ${id}`);
    const rows=[{equipBuffEnabled:true,equipBuffTechnicId:id,equipBuffName:rule.name}];
    const linked=byBuff.get(String(id))||[];
    assert.ok(linked.length,`catalog items for ${rule.name}`);
    for(const item of linked) {
      rows.push(p.catalogEquipmentToRow(item)); timingItems++;
      assert.ok(p.catalogBuffEffectEntries(item).some(e=>id===11280 ? e.type==='stat:extraMagicDelayPct' && e.value===value : e.type==='effectText' && e.target===name && e.value===value),`numeric search ${item.name}: ${name} ${value}`);
    }
    for(const row of rows) {
      const resolved=p.resolveEquipmentBuffRow(row);
      assert.ok(id===11280 ? resolved.equipBuffExtraMagicDelayPct===value : resolved.extraEffects.some(e=>e.key==='custom'&&e.scope==='display'&&e.name===name&&e.value===value&&e.unit===unit),`runtime display ${rule.name}: ${name} ${value}${unit}`);
      assert.ok(p.equipmentBuffEffectText(row).includes(name),`render ${rule.name}`);
    }
  }
  const knownMotionNames=['アフタヌーン・ティー','動きたくない魔力','滑走','ショルダー タックル','DJ','テイスティング','時の魔法(左)','囚われのお姫様キブン♪','ドルフィンGO!','魔王の風格','安らぎの一時','ハグモーション'];
  for(const name of knownMotionNames) {
    const g=p.MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED.find(g=>g.name===name);
    assert.ok(g, name);
    assert.ok(p.equipmentBuffHasMotionPresentation(g.rawInfo),`motion wording ${name}`);
  }
  let motionCandidates=0;
  for(const g of p.MOE_EQUIP_BUFF_RULE_CANDIDATES_GENERATED) {
    if(!p.equipmentBuffHasMotionPresentation(g.rawInfo)) continue;
    motionCandidates++;
    const row={equipBuffEnabled:true,equipBuffTechnicId:g.officialTechnicId,equipBuffName:g.name,equipBuffWikiText:g.rawInfo};
    assert.match(p.equipmentBuffEffectText(row),/モーション/,`motion candidate ${g.name}`);
  }
  let motionItems=0;
  for(const item of items) {
    const buff=p.catalogBuffForItem(item);
    if(!buff || !p.equipmentBuffHasMotionPresentation(p.equipmentBuffPresentationSourceText({equipBuffName:buff.name}))) continue;
    const row=p.catalogEquipmentToRow(item);
    assert.match(p.equipmentBuffEffectText(row), /モーション/, `actual catalog motion ${item.name}`);
    assert.ok(p.catalogBuffEffectEntries(item).some(e=>e.type==='effectText'&&e.target==='モーション変化'), `motion search ${item.name}`);
    motionItems++;
  }
  for(const text of ['モーションが変化しない','モーション変化なし','攻撃力が変化する','毒状態となる','モーションの速度は変化しない','モーションが変わらない']) assert.equal(p.equipmentBuffHasMotionPresentation(text),false,`not a motion change: ${text}`);
  const races={dragon:'ドラゴン',chaos:'カオス',undead:'アンデッド',giant:'巨人',goblin:'ゴブリン',demon:'悪魔',bull:'猛牛',bird:'鳥'};
  for(const [key,label] of Object.entries(races)) {
    const variants=[`特攻×1.5`,`${label}特攻 +1.5倍`,`${key}:1.5`];
    assert.deepEqual(Array.from(p.deduplicateEquipmentBuffEffectLabels(variants)),[`${label}特攻×1.5`]);
  }
  return {reviewedTimingRules:TIMING_EXPECTATIONS.length,timingCatalogItems:timingItems,knownMotionRegressions:knownMotionNames.length,motionSourceCandidates:motionCandidates,motionCatalogItems:motionItems,targetRaces:Object.keys(races).length};
}
module.exports={audit,TIMING_EXPECTATIONS};
if(require.main===module) console.log('equipment Buff presentation audit: OK',JSON.stringify(audit()));
