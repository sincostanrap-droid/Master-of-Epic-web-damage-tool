const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {context, json, root} = require('../tools/benchmark-optimizer.cjs');

for (const worker of [false, true]) {
  const p = context(root, {worker, catalog:true});
  const rule = p.findEquipBuffRuleCandidate({catalogId:'technic-14654'});
  assert.equal(rule.reviewStatus, 'implemented');
  assert.equal(rule.verified, true);
  assert.equal(rule.reviewComplete, true);
  assert.equal(rule.conversions.magicToAttackPct, 10);
  assert.equal(rule.stats.dmgPct, 10);
  assert.equal(rule.conditions.disabledInWarAge, true);
  assert.equal(rule.stats.magicPct, undefined, 'magic damage must not boost the magic stat');

  const itemFor = id => {
    const item = p.equipmentCatalogItems().find(i => i.buffRefs?.includes('technic-' + id));
    assert.ok(item, 'catalog item for ' + id);
    return item;
  };
  const rowFor = id => ({...json(p.catalogEquipmentToRow(itemFor(id))), enabled:true});
  const item = itemFor(14654), mana = rowFor(14654);
  assert.equal(item.name, 'マジック サークル ガントレット');
  assert.equal(mana.equipBuffConvMagicRate, 10);
  assert.equal(mana.equipBuffDmgPct, 10);
  const compat = p.damageBuffCompatibilityRulesForBuff(item.equipBuff, item);
  assert.equal(compat.length, 3);
  const magic = compat.find(r => r.effectKey === 'magicDmgPct');
  assert.equal(magic.value, 10);
  assert.equal(magic.valueUnit, '%');
  assert.equal(magic.autoApplyKind, 'displayOnly');
  assert.equal(magic.physicalCalcRelevant, false);
  assert.ok(mana.extraEffects.some(e => e.name === '魔法与ダメージ' && e.value === 10 && e.unit === '%' && e.scope === 'display'));
  assert.match(p.equipmentBuffEffectText(mana), /魔法与ダメージ\s*\+10%/);
  assert.match(p.equipmentBuffEffectText(mana), /WarAgeでは無効/);
  const groups = p.normalizeEquipmentBuffConflictGroupsInput(mana.equipBuffConflictGroups);
  assert.deepEqual(new Set(Array.from(groups)), new Set([
    'conversion:attack:independent:technic-14654',
    'damage:physical:independent:technic-14654',
    'damage:magic:independent:technic-14654'
  ]));
  for (const existing of p.damageBuffCompatibilityItems().filter(r => !r.id.startsWith('mana-overdrive-'))) {
    assert.ok(!groups.includes(existing.conflictGroup), 'independent from ' + existing.buffName);
  }

  const inputs = {raceSelect:'newtar', str:100, spirit:100, weaponDamage:100, weaponWeight:5,
    atkCap:500, techMultiplier:1, attackType:'attack', targetAC:0};
  function calc(rows, composite = []) {
    const s = json(vm.runInContext('DEFAULT_STATE()', p));
    s.equipment = json(rows);
    s.composite = json(composite);
    const before = json(s), capture = {};
    const metrics = p.computeMetrics(s, inputs, capture);
    assert.deepEqual(json(s), before, 'formal calculation preserves saved rows');
    return {metrics, active:capture.resolvedBuffState.composite.filter(r => r.enabled && !r.excluded)};
  }
  const on = calc([mana]).metrics;
  const off = calc([{...mana, equipBuffEnabled:false}]).metrics;
  assert.equal(on.stats.magic, 105, 'includes the real gauntlet magic +5');
  assert.equal(on.conversionAtk - off.conversionAtk, 10.5, '10% of effective magic through the formal converter');
  assert.equal(on.atk - off.atk, 10.5);
  assert.equal(on.dmgMultiplier, 1.1);
  assert.equal(off.dmgMultiplier, 1);
  assert.equal(calc([{...mana, enabled:false}]).metrics.conversionAtk, 0);

  const conversion = rowFor(13080), physical = rowFor(12139), magicBuff = rowFor(12611);
  const others = [conversion, physical, magicBuff];
  const before = calc([{...mana, equipBuffEnabled:false}, ...others]).metrics;
  const together = calc([mana, ...others]);
  for (const row of [mana, ...others]) {
    assert.ok(together.active.some(r => r.name === row.equipBuffName), row.equipBuffName + ' remains active');
  }
  assert.ok(Math.abs(together.metrics.conversionAtk - before.conversionAtk - together.metrics.stats.magic * 0.1) < 1e-9);
  assert.ok(Math.abs(together.metrics.dmgMultiplier - before.dmgMultiplier - 0.1) < 1e-9);
  assert.equal(calc([mana, {...mana, name:'duplicate gauntlet'}]).metrics.conversionAtk, on.conversionAtk, 'same technic does not double count');

  const legacy = {...mana, equipBuffConvMagicRate:0, equipBuffDmgPct:0,
    equipBuffRuleConfidence:'unverified', equipBuffRuleSource:'manual-official-description',
    extraEffects:[{key:'custom', name:'公式説明（数値計算・併用未検証）: 旧説明', value:0, scope:'display'},
      {key:'custom', name:'ユーザー追加効果', value:3, scope:'display'}]};
  const resolved = p.resolveEquipmentBuffRow(legacy);
  assert.equal(resolved.equipBuffConvMagicRate, 10);
  assert.equal(resolved.equipBuffDmgPct, 10);
  assert.equal(resolved.equipBuffRuleConfidence, 'verified');
  assert.ok(!resolved.extraEffects.some(e => e.name.includes('数値計算・併用未検証')));
  assert.ok(resolved.extraEffects.some(e => e.name === 'ユーザー追加効果'));
  assert.deepEqual(json(p.resolveEquipmentBuffRow(resolved)), json(resolved), 'resolution is idempotent');

  if (!worker) {
    for (const file of ['src/ui/catalogRows.js', 'src/domain/equipmentEffectFacets.js',
      'src/domain/equipmentEffectFacetCatalog.js']) {
      vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), p, {filename:file});
    }
    const detail = p.catalogBuffSummary(item);
    assert.match(detail, /魔力→攻撃力 10%/);
    assert.match(detail, /与ダメ\+10%/);
    assert.match(detail, /魔法与ダメージ\s*\+10%/);
    assert.match(detail, /WarAgeでは無効/);
    assert.doesNotMatch(detail, /未検証/);
    for (const effect of ['conversion:magicToAttackPct', 'stat:dmgPct', 'stat:magicDmgPct']) {
      assert.equal(p.catalogBuffEffectFilterMatches(item, {effect, op:'eq', valueRaw:'10'}), true, effect);
      assert.equal(p.catalogBuffEffectFilterMatches(item, {effect, op:'gt', valueRaw:'10'}), false, effect);
    }
    const facets = p.MOEEquipmentEffectFacetCatalog.project(item);
    for (const key of ['stat:convMagicRate', 'stat:dmgPct', 'compat:magicDmgPct:']) {
      assert.equal(p.MOEEquipmentEffectFacets.value(facets, key), 10, key);
    }
    assert.equal(p.MOEEquipmentEffectFacets.matches(facets, [
      {key:'stat:convMagicRate', minimum:'10'}, {key:'stat:dmgPct', minimum:'10'},
      {key:'compat:magicDmgPct:', minimum:'10'}]), true, 'specialized three-axis search');
  }
}
console.log('Mana Overdrive: reviewed rules, three independent axes, main/worker formal calculation, saved-row migration, detail and specialized search OK');
