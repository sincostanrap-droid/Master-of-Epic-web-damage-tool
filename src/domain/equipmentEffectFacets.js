/* Candidate effects only. No equipment eligibility, set calculation or Buff winner selection. */
(function (global) {
  // Candidate-only reviewed records from the checked-in Wiki snapshot. No runtime text parsing.
  // Conflicting old/new values remain unknown; no configuration product is inferred.
  const petExperienceRules=Object.freeze([
{
  "name": "ハッピー・イースター",
  "technicIds": [
    11966
  ],
  "multiplier": 1.05,
  "note": "ペット経験値補正装備表の分類F。構成計算では同分類を重複乗算しない。",
  "source": "MoE Wiki (main) - ペット.htm: pet-equipment"
},
  {
  "name": "アニマル トレーナー",
  "technicIds": [
    14655
  ],
  "multiplier": 1.2,
  "note": "ケモミミ バケット ハットA/B: ペット成長率1.20倍。分類L。調教効果の値/併用は別途確認。",
  "source": "MoE Wiki (main) - ペット.htm: pet-equipment, classification L"
},
  {
  "name": "庇護の絆",
  "technicIds": [
    14656
  ],
  "multiplier": 1.1,
  "note": "フェアリーモス ベルト: ペット成長率1.10倍。分類M。ペット死亡時の忠誠度低下を半減。",
  "source": "MoE Wiki (main) - ペット.htm: pet-equipment, classification M"
},
  {
    "name": "愛玩",
    "technicIds": [
      8305
    ],
    "multiplier": 1.1,
    "note": "ペットの取得経験値が少し上昇する ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 愛の女神とは併用不可 不具合だった模様、190409定期メンテにて修正、併用可",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:5"
  },
  {
    "name": "愛の神",
    "technicIds": [
      13390
    ],
    "multiplier": 1.2,
    "note": "愛の神の力でHPの自然回復速度とペットの取得経験値を大幅に上昇させる ※WarAgeでは効果がない 1分間にHPが112.5回復する、ペットの成長率を1.2倍にする 詳しくは「 ペット#y66d9c48 」ページを参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:14"
  },
  {
    "name": "愛の女神",
    "technicIds": [
      9151
    ],
    "multiplier": 1.1,
    "note": "愛の力が身に着けた者の最大HPを上昇させて、ペットの取得経験値を少し上昇させる ※WarAgeでは効果が無い 最大HP5%上昇 ペットの成長率を1.1倍にする 愛玩とは併用不可 不具合だった模様、190409定期メンテにて修正、併用可 詳しくは「 ペット#y66d9c48 」ページを参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:17"
  },
  {
    "name": "アニマル コミュニケーション",
    "technicIds": [
      10510
    ],
    "multiplier": 1.1,
    "note": "特殊な耳の効果で動物の声が聞こえて動物と意思の疎通ができる ※ペットの取得経験値と移動速度が少し上昇する ※移動速度上昇の効果はWarAgeでは効果がない ※WarAgeでは効果がない ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 移動速度+5(※ペットの移動速度ではない)",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:34"
  },
  {
    "name": "アニマル チャーム",
    "technicIds": [
      13284
    ],
    "multiplier": 1.2,
    "note": "動物も魅了する魅惑のもふもふ感 ※ペットの取得経験値が大幅に上昇する ペットの成長率を1.2倍にする 詳しくは「 ペット#y66d9c48 」ページを参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:35"
  },
  {
    "name": "アニマル フレンズ",
    "technicIds": [
      12207
    ],
    "multiplier": 1.1,
    "note": "動物達と心を通わせることで仲良くなれる ※ペットの取得経験値と調教スキルの効果が上昇する ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 調教テクニックの効果がスキル+10相当される 調教効果アップの併用関係は アイテム/追加効果/併用#調教 を参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:37"
  },
  {
    "name": "アニマル ラヴァー",
    "technicIds": [
      10678
    ],
    "multiplier": 1.1,
    "note": "調教スキルの効果とペットの取得経験値が少し上昇する ※愛玩の効果を上書きする ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 調教テクニックの効果がスキル+10相当される 調教効果アップの併用関係は アイテム/追加効果/併用#調教 を参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:38"
  },
  {
    "name": "エンジェル サポート",
    "technicIds": [
      10469
    ],
    "multiplier": 1.1,
    "note": "天使の加護で消費MPを軽減し、ペットの経験値取得率が少し上昇する ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 強欲と無欲 ( 強欲と無欲 )や 秘めたる願い ( ミサンガ アンクレット )と併用不可",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:112"
  },
  {
    "name": "幻獣の力",
    "technicIds": [
      10865
    ],
    "multiplier": 1.1,
    "note": "MPの自然回復速度とペットの取得経験値を少し上昇させる ※WarAgeでは効果がない ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:263"
  },
  {
    "name": "強欲と無欲",
    "technicIds": [
      7956
    ],
    "multiplier": 1.1,
    "note": "スキルの上昇率とペットの経験値取得率が少し上昇する スキル上昇率 +**.*%、ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 ※スキル上昇率がアップするBuff効果は、アイテムやペットのものも含めて最 古 の1つのみしか適用されない。",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:281"
  },
  {
    "name": "寿",
    "technicIds": [
      10304
    ],
    "multiplier": 1.1,
    "note": "神秘魔法の効果とペットの取得経験値が少し上昇する ※WarAgeでは効果がない ペットの成長率を1.1倍にする、他の成長率上昇装備と併用可 詳しくは「 ペット#y66d9c48 」ページを参照 神秘魔法テクニックの効果がスキル+10相当される 神秘魔法効果アップの併用関係は アイテム/追加効果/併用#神秘魔法 を参照 効果時間の上昇:ライト・ソーンスキン・エンジェリックスプリング・アクティベイション ダメージ上昇:神の雷・イリュージョンジャッジメント 効果時間・ダメージ上昇:ブレイド系（EXブレイド含む） 効果なし:謎肉謎水、タケミカヅチ、各リフレクション、レイジングハート",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:296"
  },
  {
    "name": "サポートロボ",
    "technicIds": [
      11653
    ],
    "multiplier": 1.1,
    "note": "最大所持重量とペットの取得経験値が増加する ※WarAgeでは効果がない 最大所持重量+25 ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動1(1).htm:326"
  },
  {
    "name": "強く育って",
    "technicIds": [
      11323
    ],
    "multiplier": 1.05,
    "note": "ペットの成長率がちょっとUPする ペットの成長率を1.05倍にする 詳しくは「 ペット#y66d9c48 」ページを参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動2(1).htm:60"
  },
  {
    "name": "三つの願い",
    "technicIds": [
      13041
    ],
    "multiplier": 1.05,
    "note": "与えるダメージが少し増加し、ペットの成長率が少し上昇して、重量が軽くなる ※WarAgeでは効果がない 所持重量10%軽減 ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 攻撃力が上昇するわけではなくダメージそのものが約5%増加する。 魔力やスキル依存の攻撃には効果がなく、採集にも効果がある 効果対象の詳細は 物理攻撃ダメージアップ を参照 物理攻撃ダメージアップ(物理与ダメージ増加バフ)の併用関係は アイテム/追加効果/併用2#物理攻撃ダメージアップ(物理与ダメージ増加バフ) を参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動2(1).htm:378"
  },
  {
    "name": "むぎゅっ",
    "technicIds": [
      11784
    ],
    "multiplier": 1.1,
    "note": "待機モーションが変化して、自然回復量とペットの取得経験値が少し上昇する ※自然回復量UPはWarAgeでは効果がない 1分間にHP/ST/MPが41.25回復する。 ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動2(1).htm:386"
  },
  {
    "name": "メダロッター",
    "technicIds": [
      12388
    ],
    "multiplier": 1.2,
    "note": "ペットの取得経験値が上昇する 260303パッチ にてアップグレード ペットの取得経験値と調教スキルの効果が大幅に上昇する ペットの成長率を1.1倍にする ペットの成長率を1.2倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 調教テクニックの効果がスキル+20相当される 調教効果アップの併用関係は アイテム/追加効果/併用#調教 を参照",
    "source": "MoE Wiki (main) - ペット.htm: pet-equipment, classification G; 260303復刻時倍率上昇"
  },
  {
    "name": "憧憬一途 (リアリス・フレーゼ)",
    "technicIds": [
      12612
    ],
    "multiplier": 1.1,
    "note": "スキルの上昇率とペットの経験値取得率が上昇して、猛牛系に特攻効果を得る ※WarAgeでは効果がない ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 猛牛系(ミノタウロスや牛系統,ただしペットには効果が無い)へのダメージが1.5倍になる",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動2(1).htm:474"
  },
  {
    "name": "リンクコーデ",
    "technicIds": [
      11534
    ],
    "multiplier": 1.1,
    "note": "ペットの取得経験値を少し上昇させて、特定のペットを連れていた場合に特殊効果を得る ※特定のペットのMP自然回復速度上昇、自身にMP継続回復の効果 バフ名は同じだが対象ペットのみ違うため共通性能を記載 ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 対象のペットを30m以内に連れていると10秒ごとに飼い主のMPを20回復する このMP回復はログに数値として出ない どれだけ離れてもエフェクトは発生し続けるが30mを越えるとMP回復効果はなくなる 離れすぎたり別ゾーン・ペット屋では発動しない MPに関する効果はおしゃれ装備に装備しても発動する また対象ペットが複数いる場合はMP回復効果がペットの数だけ発生する",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動2(1).htm:496"
  },
  {
    "name": "アニマル セラピスト",
    "technicIds": [
      13485
    ],
    "multiplier": 1.2,
    "note": "調教スキルの効果とペットの取得経験値が大幅に増加する ※WarAgeでは効果がない 調教テクニックの効果がスキル+20相当される 調教効果アップの併用関係は アイテム/追加効果/併用#調教 を参照 ペットの成長率を1.2倍にする 詳しくは「 ペット#y66d9c48 」ページを参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動3(1).htm:18"
  },
  {
    "name": "変成魔法",
    "technicIds": [
      13616
    ],
    "multiplier": 1.2,
    "note": "調教スキルの効果とペットの取得経験値が少し上昇する ※WarAgeでは効果がない 調教テクニックの効果がスキル+20相当される 調教効果アップの併用関係は アイテム/追加効果/併用#調教 を参照 ペットの成長率を1.2倍にする 詳しくは「 ペット#y66d9c48 」ページを参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動3(1).htm:34"
  },
  {
    "name": "アニマル トレーニング",
    "technicIds": [
      13692
    ],
    "multiplier": 1.2,
    "note": "調教スキルの効果とペットの取得経験値が大幅に上昇する ※WarAgeでは効果がない ペットの成長率を1.2倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 調教テクニックの効果がスキル+20相当される 調教効果アップの併用関係は アイテム/追加効果/併用#調教 を参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動3(1).htm:51"
  },
  {
    "name": "ご褒美おやつ",
    "technicIds": [
      13691
    ],
    "multiplier": 1.05,
    "note": "調教のスキル効果が上昇して、ペットの成長率がちょっとUPする ※WarAgeでは効果がない ペットの成長率を1.05倍にする 詳しくは「 ペット#y66d9c48 」ページを参照 調教テクニックの効果がスキル+10相当される 調教効果アップの併用関係は アイテム/追加効果/併用#調教 を参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動3(1).htm:52"
  },
  {
    "name": "七色の奇跡",
    "technicIds": [
      13787
    ],
    "multiplier": 1.1,
    "note": "七つの奇跡を受ける ※神秘魔法の効果が上昇、ペットの成長率上昇、呪いを無効化 ※無属性魔法ダメージ、落下ダメージ、落下速度、アイテムの重量を15%軽減する ※WarAgeでは効果がない 神秘魔法テクニックの効果がスキル+10相当される 神秘魔法効果アップの併用関係は アイテム/追加効果/併用#神秘魔法 を参照 ペットの成長率を1.1倍にする 詳しくは「 ペット#y66d9c48 」ページを参照、併用は ペット#pet-equipment を参照",
    "source": "MoE Wiki (main) - アイテム_追加効果_常時発動3(1).htm:62"
  },
  {
    "name": "秘めたる願い",
    "technicIds": [
      9936
    ],
    "multiplier": 1.1,
    "note": "ペット取得経験値1.1倍。併用条件は未評価。",
    "source": "src/data/manual/buffRules.manual.js"
  }
].map(r=>Object.freeze({...r,technicIds:Object.freeze(r.technicIds)})));
  function petExperienceRule(row) {
    const id=String(row.equipBuffTechnicId||'').replace(/^technic-/, '');
    return petExperienceRules.find(r=>r.technicIds.some(n=>String(n)===id));
  }
  function projectEquipmentEffectFacets(item, api) {
    const original = api.toRow(item);
    const row = api.resolveBuff(original);
    const buff = api.toComposite(row);
    const facets = new Map();
    const add = (key, label, value, source, field, unit = '') => {
      const n = Number(value);
      if (!Number.isFinite(n) || n === 0) return;
      if (!facets.has(key)) facets.set(key, {key, label:unit && !label.endsWith(unit) ? label + '（' + unit + '）' : label, value:0, unit, sources:[]});
      const f = facets.get(key);
      f.value += n;
      f.sources.push({source, field, value:n});
    };
    for (const def of api.definitions) {
      let value = original[def.prop];
      if (def.prop === 'extraAC') value = (+value || 0) - (+original.armorBaseAC || 0);
      add('stat:' + def.prop, def.label, value, 'direct', def.prop);
      if (row.equipBuffEnabled) add('stat:' + def.prop, def.label, row[def.equipProp], 'buff', def.equipProp);
    }
    // Raw body performance is deliberately separate from undiminished additions.
    add('body:armorAC', '防具本体AC（要件補正前）', original.armorBaseAC, 'body', 'armorBaseAC');
    add('body:weaponDamage', '武器本体ダメージ（要件補正前）', original.weaponDamage, 'body', 'weaponDamage');
    add('candidate:AC', 'AC候補値（本体+追加、要件補正前）', original.armorBaseAC, 'body', 'armorBaseAC');
    add('candidate:AC', 'AC候補値（本体+追加、要件補正前）', (+original.extraAC || 0) - (+original.armorBaseAC || 0), 'direct', 'extraAC');
    if (row.equipBuffEnabled) add('candidate:AC', 'AC候補値（本体+追加、要件補正前）', row.equipBuffExtraAC, 'buff', 'equipBuffExtraAC');
    for (const [prop, label] of Object.entries({attackPct:'攻撃力%', magicPct:'魔力%', speedPct:'速度%', dmgPct:'与ダメージ%', convMagicRate:'魔力→攻撃力変換%', convMagicSpeedRate:'魔力→速度変換%', convSpeedRate:'速度→攻撃力変換%'})) {
      if (row.equipBuffEnabled) add('stat:' + prop, label, buff[prop], 'buff', prop, '%');
    }
    if (row.equipBuffEnabled && buff.specialTarget && buff.special !== 1) {
      add('special:' + buff.specialTarget, buff.specialTarget + '特攻倍率', buff.special, 'buff', 'special', '倍');
    }
    // Typed additional effects retain their established meaning; custom text is never parsed.
    const seen = new Set();
    for (const effect of api.effects(row.extraEffects)) {
      if (!['skillPlus', 'elementDamagePct'].includes(effect.key) || !effect.name) continue;
      const identity = JSON.stringify([effect.key, effect.name, effect.value, effect.scope]);
      if (seen.has(identity)) continue;
      seen.add(identity);
      const label = effect.key === 'skillPlus' ? effect.name + ' スキル値+（skillPlus）' : effect.name + 'ダメージ強化%';
      add(effect.key + ':' + effect.name, label, effect.value, effect.scope === 'base' ? 'direct' : 'buff', effect.key, effect.unit || '');
    }
    // Structured compatibility values that are deliberately display-only in physical calc.
    // This uses official rule metadata, never a number parsed from presentation text.
    for (const rule of api.additionalRules?.(row, item) || []) {
      if (!row.equipBuffEnabled || !rule.safeForValueAutoApply || rule.valueUncertain || !rule.effectKey) continue;
      if (rule.autoApplyKind === 'displayElement' || String(rule.autoApplyKind).startsWith('equipBuff')) continue;
      const identity = String(rule.id || JSON.stringify([rule.effectKey, rule.element, rule.value]));
      if (seen.has(identity)) continue;
      seen.add(identity);
      add('compat:' + rule.effectKey + ':' + (rule.element || ''), rule.effectLabel || rule.effectKey, rule.value, 'buff', rule.id || rule.effectKey, rule.valueUnit || '');
    }
    const petRule=row.equipBuffEnabled?petExperienceRule(row):null;
    if(petRule?.multiplier)add('pet:experienceMultiplier','ペット成長率補正（装備）',petRule.multiplier,'buff','technic-'+row.equipBuffTechnicId,'倍');
    const metadata = {
      petExperience:petRule?Object.freeze({multiplier:petRule.multiplier,note:petRule.note,source:petRule.source,configurationSupported:true}):null,
      hasBuff:!!row.equipBuffEnabled, buffName:row.equipBuffName || '',
      groups:api.groups(row), stackRule:row.equipBuffStackRule || '', technicId:row.equipBuffTechnicId || '',
      requirementAppliesTo:['body:armorAC', 'body:weaponDamage'], candidateEffects:true
    };
    for (const f of facets.values()) { f.sources.forEach(Object.freeze); Object.freeze(f.sources); Object.freeze(f); }
    Object.freeze(metadata.groups); Object.freeze(metadata.requirementAppliesTo); Object.freeze(metadata);
    return Object.freeze({facets:Object.freeze([...facets.values()]), metadata});
  }
  function value(projection, key) { return projection.facets.find(f => f.key === key)?.value || 0; }
  function matches(projection, axes) {
    if (!axes?.[0]?.key) return false;
    return axes.every((axis, i) => {
      if (!axis.key) return true;
      const n = value(projection, axis.key), raw = String(axis.minimum ?? '').trim();
      if (axis.required && n <= 0) return false;
      if (raw !== '') return Number.isFinite(Number(raw)) && n >= Number(raw);
      return i === 0 || axis.required ? n > 0 : true;
    });
  }
  function compare(a, b, axes, sort, projection) {
    if (sort === 'slot') return String(a.slot || '').localeCompare(String(b.slot || ''), 'ja') || String(a.name).localeCompare(String(b.name), 'ja');
    if (sort !== 'name') {
      const order = sort === 'sub' ? [1,0,2] : sort === 'additional' ? [2,0,1] : [0,1,2];
      for (const i of order) { const d = value(projection(b), axes[i]?.key) - value(projection(a), axes[i]?.key); if (d) return d; }
    }
    return String(a.name || '').localeCompare(String(b.name || ''), 'ja') || String(a.catalogId || a.id || '').localeCompare(String(b.catalogId || b.id || ''));
  }
  global.MOEEquipmentEffectFacets = {projectEquipmentEffectFacets, value, matches, compare, petExperienceRules, petExperienceRule};
})(typeof window === 'undefined' ? globalThis : window);
