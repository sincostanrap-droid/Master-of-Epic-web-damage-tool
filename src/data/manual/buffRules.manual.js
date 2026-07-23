// 手入力で確定した装備Buff効果ルールを置くためのファイルです。
// 公式DBやWiki由来の generated ファイルは再生成で上書きされるため、
// 検証済みの効果量・競合グループ・上書きルールはこの manual 側に追記します。
//
// 形式例:
// window.MOE_BUFF_RULES_MANUAL = {
//   "technic-12345": {
//     verified: true,
//     conflictGroup: "attack-delay-buff",
//     stats: { equipBuffExtraAttackDelay: -5 },
//     effects: [{ key: "attackDelayFlat", value: -5, unit: "", source: "manual" }],
//     memo: "検証済み"
//   }
// };
window.MOE_BUFF_RULES_MANUAL = window.MOE_BUFF_RULES_MANUAL || {};

// __MOE_EQUIPMENT_BUFF_NUMERIC_SPECIALIZED_BULK11_V1__
// 数値が明記されている残件のうち、通常移動速度は計算へ反映し、
// 水泳・詠唱・技能別ディレイ・射程・消費量・ペット経験値など
// 現行の物理ダメージ計算対象外の値は表示用として一括保持する。
(() => {
  const batch = {};
  const ensure = (id, name, status="display-only") => {
    const key = `technic-${id}`;
    batch[key] ||= {
      name,
      officialTechnicId: id,
      verified: status !== "unverified",
      applyDefault: true,
      reviewStatus: status,
      customEffects: [],
      memo: ""
    };
    if (status === "implemented") batch[key].reviewStatus = "implemented";
    if (status === "unverified" && batch[key].reviewStatus !== "implemented") {
      batch[key].reviewStatus = "unverified";
      batch[key].verified = false;
    }
    return batch[key];
  };
  const addDisplay = (id, name, effect, status="display-only") => {
    const rule = ensure(id, name, status);
    if (!rule.customEffects.some(item => item.name === effect)) {
      rule.customEffects.push({ name: effect, value: 0 });
    }
  };
  const addSpeed = (id, name, speed, other="") => {
    const rule = ensure(id, name, "implemented");
    rule.stats = { ...(rule.stats || {}), speed };
    rule.conflictGroup = `technic-${id}`;
    rule.stackRule = "same-technic";
    if (other) addDisplay(id, name, other, "implemented");
  };

  [
    [8197, "ゴーゴーロケット", 15, "待機/移動モーション変化・テクニック不可・専用技"],
    [8152, "宙を翔ける者", 15, "待機/移動モーション変化・雪/ライトエフェクト"],
    [11373, "水陸両用", 10, "泳ぎ速度+30・水面浮上"],
    [9454, "ドルフィンGO!", 15, "泳ぎ速度+20・テクニック不可"],
    [8130, "熱気球", -15, "浮遊モーション・専用技以外使用不可"],
    [6595, "マーメイド モード", -25, "泳ぎ速度+80・水中呼吸・モーション変化"]
  ].forEach(args => addSpeed(...args));

  [
    [10677, "イルカに乗られた少年？", "泳ぎ速度+10・泳ぎモーション変化"],
    [13340, "海狸の加護", "泳ぎ速度+20・伐採命中上昇量未検証"],
    [10830, "クマノミの加護", "水中移動速度+10%・水中呼吸・専用技"],
    [13010, "鮫人", "泳ぎ速度+20・待機/移動モーション変化"],
    [12562, "シーホースの力", "泳ぎ速度+20・水中呼吸・専用技"],
    [6896, "シャチ モード", "泳ぎ速度+80・泳ぎモーション変化"],
    [7150, "ダイビング", "泳ぎ速度+10・水中呼吸"],
    [11213, "ノアターボ", "強制移動速度+75・停止不可"],
    [7839, "マンタ モード", "泳ぎ速度+50・水中呼吸・モーション変化"],
    [9660, "ラッコ モード", "泳ぎ速度+20・水面浮上"]
  ].forEach(args => addDisplay(...args));

  [
    [8305, "愛玩", "ペット取得経験値1.1倍"],
    [13284, "アニマル チャーム", "ペット取得経験値1.2倍"],
    [10469, "エンジェル サポート", "消費MP10%軽減・ペット取得経験値1.1倍"],
    [7956, "強欲と無欲", "ペット取得経験値1.1倍・スキル上昇率未検証"],
    [11323, "強く育って", "ペット取得経験値1.05倍"],
    [11534, "リンクコーデ", "ペット取得経験値1.1倍・対象ペット連携時MP20/10秒回復"]
  ].forEach(args => addDisplay(...args));

  [
    [2823, "詠唱時間短縮", "全魔法 詠唱時間-3%・ディレイ-3%"],
    [5558, "エール", "ダンスディレイ-20%"],
    [5695, "踊り子の舞", "ダンスディレイ-20%"],
    [3102, "陰陽術式召喚", "召喚魔法 詠唱時間-10%・ディレイ-10%"],
    [4829, "合唱エフェクト", "音楽 詠唱時間-5%・ディレイ-5%・音符エフェクト"],
    [3772, "クイックタイム", "全魔法 詠唱時間-10%・ディレイ-10%・消費MP15%増加"],
    [9893, "行進曲", "音楽 詠唱時間-20%・ディレイ-20%・射程+3"],
    [8631, "高速射撃", "銃器ディレイ-12%"],
    [9382, "サモン サポート", "召喚魔法 詠唱時間-30%・ディレイ-30%"],
    [3277, "諸行無常", "音楽 詠唱時間-20%・ディレイ-10%"],
    [3272, "精神集中", "詠唱妨害耐性+20%・移動詠唱速度低下"],
    [4835, "タヌキ変化", "物まねディレイ-5%"],
    [6605, "チェロソナタ", "音楽 詠唱時間-20%・ディレイ-20%"],
    [12622, "騎心一槍 (ディア・フィアナ)", "槍ディレイ-15%・クリティカル率+20%"],
    [7302, "道化の極意", "物まねディレイ-20%"],
    [6471, "南国気分", "ダンスディレイ-15%・専用技"],
    [7633, "念珠", "全魔法 詠唱時間-10%・ディレイ-10%"],
    [9125, "パストーレ", "調教ディレイ-15%"],
    [5873, "ビートビート", "音楽 詠唱時間-15%・ディレイ-15%"],
    [7881, "蛇の加護", "詠唱妨害耐性+10%・低確率魔法反射"],
    [10472, "勾玉の加護", "魔法ディレイ-10%・詠唱妨害耐性+20%"],
    [7445, "ミュージック スタート！", "音楽 詠唱時間-20%・ディレイ-20%"],
    [4828, "魅惑の腰振り", "ダンスディレイ-5%"],
    [7993, "名調教師", "調教ディレイ-15%"],
    [9930, "メディカリスト", "アイテム使用ディレイ/速度-20%・薬調合スキル効果+10"],
    [7328, "薬識", "アイテム使用ディレイ-10%"],
    [6385, "リズミカル ダンス", "ダンスディレイ-20%"],
    [3549, "リズム マジック", "音楽 詠唱時間-20%・ディレイ-10%"],
    [11408, "レガリアの力", "刀剣ディレイ-15%・刀剣依存追撃"]
  ].forEach(args => addDisplay(...args));
  [
    [3038, "銃攻撃ディレイ短縮", "銃器ディレイ約-3%（未検証）"],
    [8997, "星霊魔導士", "召喚魔法ディレイ約-20%（未検証）"],
    [8202, "戦車リュック", "銃器ディレイ約-10%（未検証）"]
  ].forEach(args => addDisplay(...args, "unverified"));

  [
    [7466, "音声増幅装置", "音楽/シャウト射程+3"],
    [6386, "キャットイヤー スピーカー", "音楽/シャウト射程+3"],
    [6886, "ゴッドアイ", "魔法射程+3・看破・ペット経験値表示"],
    [2578, "サーチアイ", "魔法射程+3・看破"],
    [4951, "サウンド スピーカー", "音楽/シャウト射程+3"],
    [9997, "スナイパー アイ", "銃器/投擲射程+3"],
    [12623, "妖精王唱 (フェアリー・アンセム)", "魔法効果範囲+1.5・魔法与ダメージ約+10%"],
    [6400, "ロックンロール", "音楽/シャウト射程+3・待機モーション変化"]
  ].forEach(args => addDisplay(...args));

  [
    [8686, "闇光の輪", "消費ST/MP 5%軽減"],
    [4581, "王の財宝", "現在所持重量10%軽減"],
    [2497, "消費スタミナ軽減", "消費ST10%軽減"],
    [8565, "大樹の加護", "消費MP5%軽減・専用技"],
    [6267, "MP消費軽減", "消費MP5%軽減"],
    [9268, "魔帽子の加護", "消費MP10%軽減・被弾時ランダム防御"],
    [9565, "パワードアーム", "現在所持重量20%軽減"]
  ].forEach(args => addDisplay(...args));
  [
    [3103, "サバティック スペル", "消費MP約4%軽減・HP自然回復停止（未検証）"],
    [3151, "スペル サポート", "消費MP約4%軽減（未検証）"],
    [6664, "マギア=パルマ", "消費MP約5%軽減（未検証）"]
  ].forEach(args => addDisplay(...args, "unverified"));

  Object.values(batch).forEach(rule => {
    rule.memo = rule.reviewStatus === "implemented"
      ? "通常移動速度のみ計算へ反映し、その他の専門効果は表示のみ。"
      : (rule.reviewStatus === "unverified"
        ? "効果量に約・要検証表記があるため計算未反映。"
        : "専門ステータスのため物理ダメージ計算には入れず表示のみ。");
  });
  Object.assign(window.MOE_BUFF_RULES_MANUAL, batch);
})();

// __MOE_DAMAGE_ON_HIT_RECOVERY_V1__
// 与ダメージ時の回復量。現行のダメージ計算・最適化はリソース回復量を評価しないため、
// 数値は詳細表示用に保持する。ゲーム内では最古の1件のみが有効になる。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-9475": {
    name: "小悪魔の力", officialTechnicId: 9475, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時MP回復", value: 3, unit: "%" }],
    memo: "与ダメージ時MPを3%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-11156": {
    name: "獅子奮迅", officialTechnicId: 11156, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時ST回復", value: 3, unit: "%" }],
    memo: "与ダメージ時STを3%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-7955": {
    name: "真祖", officialTechnicId: 7955, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時HP回復", value: 5, unit: "%" }],
    memo: "与ダメージ時HPを5%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-9321": {
    name: "天空竜の加護", officialTechnicId: 9321, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時HP回復", value: 5, unit: "%" }],
    memo: "実測優先: 与ダメージ時HPを5%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-8641": {
    name: "土偶の加護", officialTechnicId: 8641, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時MP回復", value: 3, unit: "%" }],
    memo: "与ダメージ時MPを3%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-12821": {
    name: "フラワー ブレッシング", officialTechnicId: 12821, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時MP回復", value: 3, unit: "%" }],
    memo: "与ダメージ時MPを3%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-10387": {
    name: "魔剣の加護", officialTechnicId: 10387, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時HP回復", value: 10, unit: "%" }],
    memo: "与ダメージ時HPを10%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-9888": {
    name: "魔性の力", officialTechnicId: 9888, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時ST回復", value: 3, unit: "%" }],
    memo: "与ダメージ時STを3%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  },
  "technic-14069": {
    name: "真祖の吸血鬼", officialTechnicId: 14069, verified: true, applyDefault: true,
    customEffects: [{ name: "与ダメージ時HP回復", value: 5, unit: "%" }],
    memo: "与ダメージ時HPを5%回復。回復効果は最古の1件のみ有効（表示のみ）。"
  }
});

// 数値根拠が無い残件を、効果の存在まで確定できる表示専用と、
// 計算へ入れる数値が未検証のものに一括分類する。
// 装備本体の追加ステータスは含めず、Buff固有の効果だけを表示する。
[
  [3268, "急いでブレックファースト", "満腹度減少軽減"],
  [7750, "ヴィーナスの加護", "呼吸ゲージ回復・移動/テクニック不可・友好度変化"],
  [2439, "恋はアクアブルー", "泳ぎモーション変化"],
  [4559, "紅葉タイム", "強制座り・移動不可"],
  [9674, "酒風呂", "酩酊度が徐々に上昇"],
  [7755, "進め！カッシー！", "待機/移動モーション変化・水中移動速度上昇"],
  [8199, "戦艦", "水面浮上・水中移動"],
  [5967, "ソルダート", "待機モーション変化"],
  [1327, "待機モーション変化", "待機モーション変化"],
  [4022, "チェロ エフェクト", "音符エフェクト"],
  [3875, "Total Protection Service", "Total Protection前提Buff"],
  [7880, "トレジャー チェアー", "待機モーション変化・移動/テクニック不可"],
  [2996, "生野菜おいしい", "生野菜による腹痛を防止"],
  [7304, "忍者凧", "専用技「大凧の術」使用可能"],
  [9892, "ノスタルジック カメラ", "専用技「ゴースト ピクチャーズ」使用可能"],
  [7649, "ハーメルンの笛", "専用技「マニピュレイト メロディ」前提Buff"],
  [3551, "バイキング アンカー", "水中で沈む速度上昇"],
  [3867, "バカンス タイム", "強制座り・移動不可"],
  [8774, "ハンググライダー", "落下速度/落下ダメージ軽減・専用技使用可能"],
  [5976, "魔法の絨毯", "浮遊モーション・テクニック不可・移動速度?"]
].forEach(([id, name, effect]) => {
  window.MOE_BUFF_RULES_MANUAL[`technic-${id}`] = {
    name,
    officialTechnicId: id,
    verified: true,
    applyDefault: true,
    reviewStatus: "display-only",
    customEffects: [{ name: effect, value: 0 }],
    memo: "数値計算へ影響しない、または数値不明のため表示のみ。"
  };
});

[
  [11379, "あめあめふれふれ", "耐火属性上昇量"],
  [3275, "行脚修行", "移動詠唱速度/詠唱妨害率"],
  [1579, "エンチャント サンダー", "HP減少量/エンチャント効果"],
  [1577, "エンチャント ファイアー", "HP減少量/エンチャント効果"],
  [6368, "キョンシーの御札", "牙威力/命中上昇量"],
  [8998, "氷の滅悪魔導士", "悪魔特攻倍率"],
  [3274, "邪気払い", "炎追加ダメージ"],
  [7941, "スカイハイ", "HP自然回復量"],
  [8999, "大海のジュビア", "物理回避発動率"],
  [6086, "囚われのお姫様キブン♪", "HP自然回復量"],
  [5837, "パーソナル スペース", "HP自然回復量"],
  [8996, "火の滅竜魔導士", "ドラゴン特攻倍率"],
  [12458, "氷華の加護", "水属性ダメージ軽減率"],
  [12777, "無重力感", "HP/ST/MP自然回復量"],
  [7873, "モスキート スナッチ", "牙命中上昇量"],
  [7569, "ゆらゆら", "ST自然回復量"],
  [11483, "リゾート気分", "自然回復量"],
  [8819, "歴史の探究者", "採掘命中/罠回避上昇量"],
  [14258, "スターフィッシュ パワー", "HP自然回復/水属性効果上昇量"]
].forEach(([id, name, unknown]) => {
  window.MOE_BUFF_RULES_MANUAL[`technic-${id}`] = {
    name,
    officialTechnicId: id,
    verified: false,
    applyDefault: true,
    reviewStatus: "unverified",
    customEffects: [{ name: `${unknown}（未検証）`, value: 0 }],
    memo: `${unknown}の数値根拠が無いため計算未反映。`
  };
});

// __MOE_EQUIPMENT_BUFF_DISPLAY_CLASSIFICATION_BULK9_V1__
// 数値計算へ影響しない専用技・モーション・視覚効果・状態無効などを一括分類する。
// 効果量が判明していない戦闘効果はここへ混在させず、未検証候補として残す。
(() => {
  const entries = [
    [8251, "アイドル ステージ", "専用技・待機モーション変化"],
    [6382, "アイドル モーション", "待機モーション変化"],
    [13392, "愛の告白", "専用技 C.O.L"],
    [8687, "悪魔の書", "被弾時ランダム召喚・専用召喚技"],
    [6486, "悪魔憑依", "移動モーション変化"],
    [10201, "穴掘り名人", "採掘命中率上昇・専用技"],
    [6177, "アニマル ドライブ", "騎乗モーション・テクニック使用不可"],
    [4344, "アブダクション", "モーション変化"],
    [10213, "育成アプリ", "ペット取得経験値表示"],
    [6288, "インテリジェント デバイス", "美容・ペット経験値表示・看破"],
    [5471, "ヴァイス", "複合技ヴフト シュトース前提"],
    [4234, "ウイング エフェクト", "羽根エフェクト"],
    [9879, "ウォーター タンク", "喉の渇き軽減・専用技"],
    [3376, "動くな危険", "多段ノックバック無効"],
    [6305, "打ち倒す者", "待機・移動モーション変化"],
    [4812, "ウッドルーツ", "多段ノックバック無効"],
    [5150, "梅エフェクト", "梅の花びらエフェクト"],
    [10881, "H.EROの心", "説明のみ・数値効果なし"],
    [8639, "エリンギモード", "待機・移動モーション変化"],
    [5176, "エルンスト", "武器構えモーション変化"],
    [10212, "円卓会議", "待機モーション変化"],
    [7625, "扇の舞", "多段ノックバック無効"],
    [4806, "お掃除モード", "複合技サイクロン バキューム前提"],
    [6396, "傘を差す", "待機・移動モーション変化"],
    [4672, "かたつむり モーション", "移動モーション変化"],
    [6603, "九尾の力", "専用技 妖力解放前提"],
    [2993, "強靭な足腰", "多段ノックバック無効"],
    [10471, "鏡面反射", "確率魔法反射（発動率未検証）"],
    [11826, "掘削モード", "採掘命中率上昇・専用技"],
    [12147, "クラッカー", "専用技 コンフェッティ バースト"],
    [7529, "クラブ ウォーク", "待機・移動モーション変化"],
    [8901, "クリスマスツリー", "待機・移動・座りモーション変化"],
    [9722, "採掘魂", "専用技 ロック スマッシュ"],
    [3473, "採掘モード", "複合技ドリル ディグ前提"],
    [4952, "サーチ ディスプレイ", "看破"],
    [4673, "桜エフェクト", "桜の花びらエフェクト"],
    [2178, "漆黒の力", "看破"],
    [5968, "ジヤヴォール", "待機モーション変化"],
    [12006, "射出装置", "専用技 ムービング スパイダー"],
    [10427, "祝杯", "待機モーション変化・酩酊"],
    [10197, "主の証", "専用召喚技"],
    [9703, "蒸気機関", "専用技 スチーム バースト"],
    [7751, "ジラフ アイ", "視点位置変化"],
    [10531, "磁力操作", "銃器・投擲射程増加・専用技"],
    [2510, "心眼", "視界悪化"],
    [9144, "神光", "一部ステータス低下効果無効"],
    [5687, "新春の輝き", "発光エフェクト"],
    [9210, "新星現る", "星エフェクト"],
    [7223, "人力", "効果未判明"],
    [9322, "光のベール", "一部ステータス低下効果無効"],
    [11953, "ひなちゃんと一緒", "待機モーション変化"],
    [4825, "プカプカ", "水面への浮上"],
    [9269, "不死鳥の力", "被弾時低確率復活付与・専用技"],
    [6470, "浮遊霊", "待機・移動モーション変化・霊体看破"],
    [8770, "フラワーロード", "移動経路の花エフェクト"],
    [12708, "ブランコ", "待機モーション変化"],
    [4635, "ブルーローズ エフェクト", "青いバラの花びらエフェクト"],
    [12656, "ヘスティア・ナイフ", "専用技 アルゴ・ウエスタ"],
    [11767, "ぺったんこ", "各種モーション変化"],
    [11529, "ヘルスケア", "スキル値・美容情報表示"],
    [5856, "防菌効果", "一部病気Debuff自動解除"],
    [8973, "暴風竜の加護", "多段ノックバック無効"],
    [7946, "ホッピング", "待機・移動モーション変化"],
    [10385, "マーメイドの加護", "泳ぎモーション変化・水中呼吸"],
    [8846, "マネキンモーション", "待機モーション変化"],
    [11264, "魔法の枷", "専用技フェンリル フォースまで装備解除不可"],
    [8115, "水蜘蛛", "水面歩行"],
    [3273, "無病息災", "病気無効"],
    [6377, "愉快な踊り", "待機モーション変化"],
    [9701, "妖精の光", "敵対抑制・テクニック使用不可"],
    [5827, "立体機動装置", "複合技立体機動前提"],
    [9258, "竜化の秘法", "専用技ドラゴン フォース前提"],
    [1573, "竜の加護", "睡眠無効"],
    [11952, "蓮華の加護", "待機モーション変化・一部状態低下無効"],
    [4582, "ローズ エフェクト", "バラの花びらエフェクト"],
    [13508, "オルカン", "専用技 多連装ロケットランチャー"],
    [13795, "鑑賞モード", "待機モーション変化・専用技"],
    [13964, "逮捕術", "専用技 シャックル スリンガー"],
    [14092, "護符の力", "三種の専用魔法"]
  ];

  const rules = {};
  for (const [id, name, effect] of entries) {
    rules[`technic-${id}`] = {
      name, officialTechnicId: id, verified: true, applyDefault: true,
      reviewStatus: "display-only",
      conflictGroup: `technic-${id}`, stackRule: "same-technic",
      customEffects: [{ name: effect, value: 0 }],
      memo: `${effect}。物理ダメージ予想値へ直接加算しない表示項目。`
    };
  }
  Object.assign(window.MOE_BUFF_RULES_MANUAL, rules);
})();

// __MOE_EQUIPMENT_BUFF_DIRECT_EFFECTS_BULK8_V1__
// 既存の生成値・スキル併用表・ダメージ併用表・説明文の安全な自動抽出で
// カバーされない項目だけを対象にする。条件付き効果や未対応の計算種別は表示のみに留める。
(() => {
  const allRes = value => ({
    extraFireRes: value, extraWaterRes: value, extraEarthRes: value,
    extraWindRes: value, extraNeutralRes: value
  });
  const allResPct = value => ({
    extraFireResPct: value, extraWaterResPct: value, extraEarthResPct: value,
    extraWindResPct: value, extraNeutralResPct: value
  });
  const implemented = (id, name, stats, options={}) => ({
    name, officialTechnicId: id, verified: true, applyDefault: true,
    reviewStatus: "implemented",
    conflictGroup: options.conflictGroup || `technic-${id}`,
    stackRule: options.stackRule || "same-technic",
    stats, ...(options.extra || {}), memo: options.memo || name
  });
  const displayOnly = (id, name, effects, memo) => ({
    name, officialTechnicId: id, verified: true, applyDefault: true,
    reviewStatus: "display-only",
    conflictGroup: `technic-${id}`, stackRule: "same-technic",
    customEffects: effects, memo
  });
  const special = (id, name, targetRace, targetMultiplier, memo) => ({
    name, officialTechnicId: id, verified: true, applyDefault: true,
    reviewStatus: "implemented",
    conflictGroup: "special:latest", stackRule: "latest",
    misc: { targetRace, targetMultiplier }, memo
  });

  Object.assign(window.MOE_BUFF_RULES_MANUAL, {
    "technic-3358": implemented(3358, "愛らしい瞳",
      { extraDamageReducePct: 3, ...allRes(3) },
      { conflictGroup: "damage-cut:physical", stackRule: "score", memo: "物理ダメージ3%軽減、全抵抗+3。" }),
    "technic-4041": implemented(4041, "安全第一", { extraDamageReducePct: 5 }, {
      conflictGroup: "damage-cut:physical", stackRule: "score",
      extra: { customEffects: [{ name: "頭上からの落下物無効", value: 0 }] },
      memo: "物理ダメージ5%軽減。頭上からの落下物無効は表示のみ。"
    }),
    "technic-6383": implemented(6383, "インプレグナブル ガード", { extraDamageReducePct: 15 },
      { conflictGroup: "damage-cut:physical", stackRule: "score", memo: "物理ダメージ15%軽減。" }),
    "technic-10113": implemented(10113, "円月輪", { extraDamageReducePct: 10 }, {
      conflictGroup: "damage-cut:physical", stackRule: "score",
      extra: { customEffects: [{ name: "物理ダメージ常時反射", value: 10, unit: "%" }, { name: "専用技", value: 0, unit: "（斬り斬り舞）" }] },
      memo: "物理ダメージ10%軽減。10%常時反射と専用技は表示のみ。"
    }),
    "technic-5165": implemented(5165, "エンシェント オーラ", allResPct(5), { memo: "全抵抗+5%。" }),
    "technic-8504": implemented(8504, "美味しくなりました", { magic: 5 }, {
      extra: { customEffects: [{ name: "MP消費", value: 5, unit: "%" }] },
      memo: "魔力+5。MP消費+5%は表示のみ。"
    }),
    "technic-11267": implemented(11267, "桜花の加護", { attack: 5, ...allRes(15) }, { memo: "攻撃力+5、全抵抗+15。" }),
    "technic-7078": implemented(7078, "オートガード", { extraDamageReducePct: 15 },
      { conflictGroup: "damage-cut:physical", stackRule: "score", memo: "物理ダメージ15%軽減。" }),
    "technic-12494": implemented(12494, "オーロラの加護", { extraDamageReducePct: 15 }, {
      conflictGroup: "damage-cut:physical", stackRule: "score",
      extra: { customEffects: [{ name: "無属性魔法ダメージ軽減", value: 15, unit: "%" }] },
      memo: "物理ダメージ15%軽減。無属性魔法軽減は表示のみ。"
    }),
    "technic-6314": implemented(6314, "火炎", { extraFireRes: 10, extraWaterRes: 10 }, { memo: "耐火・耐水属性+10。" }),
    "technic-4836": implemented(4836, "結界陣", { extraDamageReducePct: 5 },
      { conflictGroup: "damage-cut:physical", stackRule: "score", memo: "物理ダメージ5%軽減。" }),
    "technic-6262": implemented(6262, "幻影盾", { extraDamageReducePct: 5 },
      { conflictGroup: "damage-cut:physical", stackRule: "score", memo: "物理ダメージ5%軽減。" }),
    "technic-7538": implemented(7538, "攻防一体", { extraDamageReducePct: 20 }, {
      conflictGroup: "damage-cut:physical", stackRule: "score",
      extra: { customEffects: [{ name: "移動速度低下", value: 0, unit: "（数値未検証）" }, { name: "待機・移動モーション変化", value: 0 }] },
      memo: "物理ダメージ20%軽減。移動速度低下量は未検証。"
    }),
    "technic-9567": implemented(9567, "氷の輝き", { extraFireResPct: 25 }, { memo: "耐火属性+25%。" }),
    "technic-3371": implemented(3371, "呪文抵抗UP", allRes(5), { memo: "全抵抗+5。" }),
    "technic-3276": implemented(3276, "滋養強壮", allResPct(10), { memo: "全抵抗+10%。" }),
    "technic-10384": implemented(10384, "神秘のベール", { extraDamageReducePct: 15 },
      { conflictGroup: "damage-cut:physical", stackRule: "score", memo: "物理ダメージ15%軽減。" }),
    "technic-2917": implemented(2917, "ダメージ軽減", { extraDamageReducePct: 10 },
      { conflictGroup: "damage-cut:physical", stackRule: "score", memo: "物理ダメージ10%軽減。" }),
    "technic-12446": implemented(12446, "超合金ボディ", { extraACPct: 10 }, {
      extra: { customEffects: [{ name: "10未満ダメージ無効", value: 0 }, { name: "専用技", value: 0, unit: "（ギガンテック モード）" }] },
      memo: "防御力+10%。10未満のダメージ無効と専用技は表示のみ。"
    }),
    "technic-5879": implemented(5879, "抵抗アップの秘石", { ...allRes(5), ...allResPct(5) }, { memo: "全抵抗の基本値+5、合計値+5%。" }),
    "technic-9839": implemented(9839, "ノア フロート", { extraAvoidPct: 3 }, {
      extra: { customEffects: [{ name: "落下速度低下", value: 0, unit: "（数値未検証）" }] },
      memo: "回避+3%。落下速度低下量は未検証。"
    }),
    "technic-3583": implemented(3583, "マナの加護", { extraDamageReducePct: 3 },
      { conflictGroup: "damage-cut:physical", stackRule: "score", memo: "物理ダメージ3%軽減。" }),
    "technic-6081": implemented(6081, "守りの鎖", { extraDamageReducePct: 10 },
      { conflictGroup: "damage-cut:physical", stackRule: "score", memo: "物理ダメージ10%軽減。" }),
    "technic-8764": implemented(8764, "満天の星", { magic: 5 }, {
      extra: { customEffects: [{ name: "砂嵐による視界不良無効", value: 0 }] },
      memo: "魔力+5。砂嵐無効は表示のみ。"
    }),
    "technic-11157": implemented(11157, "もこもこガード", { extraDamageReducePct: 15 }, {
      conflictGroup: "damage-cut:physical", stackRule: "score",
      extra: { customEffects: [{ name: "魔法ダメージ軽減", value: 15, unit: "%" }] },
      memo: "物理ダメージ15%軽減。魔法ダメージ15%軽減は表示のみ。"
    }),
    "technic-7829": implemented(7829, "モスキート ボディ", { extraACPct: -67 }, {
      extra: { customEffects: [{ name: "キャラクターサイズ", value: 33, unit: "%" }] },
      memo: "防御力を通常の33%へ低下（-67%）。キャラクターサイズ33%は表示のみ。"
    }),
    "technic-7478": implemented(7478, "マジックイヤリング", { magicPct: 2 }, { memo: "魔力+2%。" }),
    "technic-8005": implemented(8005, "古き漆黒の粘体", { extraDamageReducePct: 5 }, {
      conflictGroup: "damage-cut:physical", stackRule: "score",
      extra: { customEffects: [{ name: "物理ダメージ常時反射", value: 5, unit: "%" }] },
      memo: "物理ダメージ5%軽減。5%常時反射は表示のみ。"
    }),
    "technic-11169": implemented(11169, "蛇帯", { extraDamageReducePct: 15 }, {
      conflictGroup: "damage-cut:physical", stackRule: "score",
      extra: { customEffects: [{ name: "専用技", value: 0, unit: "（蛇帯乱舞）" }] },
      memo: "物理ダメージ15%軽減。専用技は表示のみ。"
    }),

    "technic-10688": special(10688, "巨人殺し", "giant", 1.2, "巨人系への物理・魔法ダメージとペット回復量1.2倍。計算は物理特攻に反映。"),
    "technic-9261": special(9261, "神撃の一振り", "chaos", 1.2, "カオス系への物理・魔法ダメージとペット回復量1.2倍。計算は物理特攻に反映。"),
    "technic-10530": special(10530, "ヘルズ スレイヤー", "chaos", 1.2, "カオス系への物理・魔法ダメージとペット回復量1.2倍。計算は物理特攻に反映。"),
    "technic-10396": special(10396, "竜爪撃", "dragon", 1.2, "ドラゴン系への物理・魔法ダメージとペット回復量1.2倍。計算は物理特攻に反映。キック威力上昇量は未検証。"),
    "technic-12612": special(12612, "憧憬一途 (リアリス・フレーゼ)", "bull", 1.5, "猛牛系へのダメージ1.5倍。ペット成長率1.1倍は計算対象外。"),

    "technic-7726": displayOnly(7726, "アイギスの盾", [
      { name: "物理ダメージ完全反射発動率", value: 10, unit: "%（約）" },
      { name: "魔法反射発動率", value: 10, unit: "%（約）" },
      { name: "専用技", value: 0, unit: "（メドゥーサ ガード）" }
    ], "確率反射と専用技は現行の物理ダメージ予想値に直接加算しない。"),
    "technic-8135": displayOnly(8135, "アドベンチャー ソウル", [
      { name: "落下ダメージ軽減", value: 25, unit: "%" },
      { name: "盗み技ディレイ", value: -10, unit: "%" },
      { name: "採掘命中率上昇", value: 0, unit: "（数値未検証）" }
    ], "落下・盗み・採掘用のため表示のみ。"),
    "technic-12618": displayOnly(12618, "月下狼哮 (ウールヴヘジン)", [
      { name: "夜間のみ 攻撃・命中・回避・防御", value: 20, unit: "" },
      { name: "一部状態異常無効", value: 0 }
    ], "夜間条件を現行入力で判定できないため表示のみ。"),
    "technic-2402": displayOnly(2402, "風の加護", [
      { name: "落下ダメージ軽減", value: 15, unit: "%" },
      { name: "落下速度軽減", value: 60, unit: "%" }
    ], "落下関連効果のため表示のみ。"),
    "technic-6406": displayOnly(6406, "空中散歩", [
      { name: "落下ダメージ軽減", value: 15, unit: "%" },
      { name: "落下速度軽減", value: 0, unit: "（数値未検証）" },
      { name: "待機・移動モーション変化", value: 0 }
    ], "落下関連効果のため表示のみ。"),
    "technic-13351": displayOnly(13351, "三巳一体", [
      { name: "噛みつき追加攻撃発動率", value: 100, unit: "%" },
      { name: "巻きつき追加攻撃発動率", value: 50, unit: "%" },
      { name: "毒ブレス追加攻撃発動率", value: 50, unit: "%" }
    ], "連鎖する追加攻撃は現行の単発物理ダメージ計算へ混在させず表示のみ。"),
    "technic-11149": displayOnly(11149, "ステータス上昇(WarAge)", [
      { name: "WarAge物理ダメージ軽減", value: 25, unit: "%" },
      { name: "WarAge魔法ダメージ軽減", value: 25, unit: "%" }
    ], "試験用かつ変更履歴を含むWarAge限定効果のため表示のみ。"),
    "technic-10566": displayOnly(10566, "七つ道具", [
      { name: "落下ダメージ軽減", value: 15, unit: "%" },
      { name: "落下速度", value: -15, unit: "%" },
      { name: "アイテム使用ディレイ・速度", value: -15, unit: "%" },
      { name: "盗み成功率・スキル効果上昇", value: 0, unit: "（数値未検証）" }
    ], "非戦闘計算項目のため表示のみ。"),
    "technic-11461": displayOnly(11461, "上森人 (ハイエルフ)", [
      { name: "弓技ディレイ", value: -15, unit: "%" },
      { name: "ジャンプ力", value: 1.45, unit: "倍" },
      { name: "落下ダメージ軽減", value: 25, unit: "%" }
    ], "弓技ディレイと移動関連効果は現行予想値に直接加算せず表示のみ。"),
    "technic-11029": displayOnly(11029, "魔力障壁", [
      { name: "魔法ダメージ軽減", value: 25, unit: "%" }
    ], "魔法ダメージ専用軽減は現行の物理ダメージ計算対象外。"),
    "technic-9564": displayOnly(9564, "闇を統べる者", [
      { name: "夜間のみ 攻撃・回避", value: 10, unit: "%" },
      { name: "移動時の足音消去", value: 0 }
    ], "夜間・ペット同伴条件を現行入力で判定できないため表示のみ。"),
    "technic-6480": displayOnly(6480, "UFO", [
      { name: "落下ダメージ軽減", value: 15, unit: "%" },
      { name: "落下速度軽減", value: 0, unit: "（数値未検証）" },
      { name: "待機・移動モーション変化", value: 0 }
    ], "落下関連効果のため表示のみ。"),
    "technic-7479": displayOnly(7479, "ランダム リフレクト", [
      { name: "物理ダメージ完全反射発動率", value: 10, unit: "%" },
      { name: "反射量", value: 100, unit: "%" }
    ], "確率反射のため現行の物理ダメージ予想値には直接加算しない。"),
    "technic-8648": displayOnly(8648, "魔眼の力", [
      { name: "不可視看破", value: 0 },
      { name: "被弾時 魔眼の呪い", value: 0, unit: "（発動率未検証）" },
      { name: "攻撃・防御低下", value: 20, unit: "%（未検証）" }
    ], "説明に未確認表現を含むため数値計算せず表示のみ。"),
    "technic-1628": displayOnly(1628, "物理反射 Lv1", [
      { name: "物理ダメージ常時反射", value: 5, unit: "%（程度）" }
    ], "反射のみでダメージ軽減はないため表示のみ。"),
    "technic-10689": displayOnly(10689, "ペインブラック", [
      { name: "物理ダメージ常時反射", value: 15, unit: "%" }
    ], "反射のみでダメージ軽減はないため表示のみ。"),
    "technic-11584": displayOnly(11584, "ヘルメスの加護", [
      { name: "回避から移動速度への変換率", value: 5, unit: "%" }
    ], "回避→移動速度変換は現行計算に未対応のため表示のみ。"),
    "technic-8573": displayOnly(8573, "魔王の家来 Lv99", [
      { name: "表示ダメージ倍率", value: 10000, unit: "倍（表示のみ）" }
    ], "実ダメージは変化せず表示だけを変更する。"),
    "technic-8574": displayOnly(8574, "魔王の家来 Lv999", [
      { name: "表示ダメージ倍率", value: 100000000, unit: "倍（表示のみ）" }
    ], "実ダメージは変化せず表示だけを変更する。"),
    "technic-8575": displayOnly(8575, "魔王の家来 Lv9999", [
      { name: "表示ダメージ倍率", value: 1000000000000, unit: "倍（表示のみ）" }
    ], "実ダメージは変化せず表示だけを変更する。"),
    "technic-9145": displayOnly(9145, "天使の加護", [
      { name: "被弾時HP20回復 発動率", value: 50, unit: "%" },
      { name: "HP回復", value: 20 }
    ], "被弾時の確率回復は現行物理ダメージ予想値に直接加算しない。"),
    "technic-8590": displayOnly(8590, "爆発体質", [
      { name: "被弾時固定100ダメージ 発動率", value: 5, unit: "%（約）" },
      { name: "反撃固定ダメージ", value: 100 }
    ], "被弾時確率反撃のため表示のみ。"),
    "technic-13688": displayOnly(13688, "クラゲエフェクト", [
      { name: "水属性ダメージ軽減", value: 25, unit: "%" }
    ], "水属性ダメージ専用軽減は現行の物理ダメージ計算対象外。"),
    "technic-8308": displayOnly(8308, "魔神の加護", [
      { name: "ハンド ガード発動率", value: 25, unit: "%（未検証）" },
      { name: "発動中の物理ダメージ軽減", value: 50, unit: "%" }
    ], "発動率が未検証の確率軽減のため表示のみ。")
  });
})();

// __MOE_EQUIPMENT_BUFF_NON_REDUNDANT_BULK7_REMAINDER_V1__
// 併用表・説明文自然回復補完で既に反映される項目は重ねてmanual登録せず、
// 既存経路に無い効果だけを残す。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-11462": {
    name: "鉱人道士 (ドワーフシャーマン)", officialTechnicId: 11462,
    verified: true, applyDefault: true, reviewStatus: "display-only",
    conflictGroup: "technic-11462", stackRule: "same-technic",
    skillEffects: [{ name: "破壊魔法", value: 10 }],
    customEffects: [{ name: "酩酊技ディレイ短縮", value: 0, unit: "（数値未検証）" }],
    memo: "破壊魔法スキル効果+10。酩酊技ディレイ短縮量は未検証。"
  },
  "technic-11216": {
    name: "トゲトゲ パワー", officialTechnicId: 11216,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-11216", stackRule: "same-technic",
    stats: { attack: 5 },
    customEffects: [{ name: "専用技", value: 0, unit: "（トゲトゲ チャージ）" }],
    memo: "攻撃力+5。専用技は表示のみ。WarAgeでは効果なし。"
  }
});

// __MOE_EQUIPMENT_BUFF_NO_EFFECT_AUDIT_MOVEMENT_BATCH6_V1__
// 通常速度、割合速度、魔力→速度変換を計算へ接続する。
// 水中速度と強制自動前進は通常移動速度へ混ぜず、表示用効果として保持する。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-10676": {
    name: "ウォーター バルーン", officialTechnicId: 10676,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10676", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [
      { name: "回転移動モーション", value: 0 },
      { name: "物理ダメージ軽減", value: 0, unit: "（数値未検証）" },
      { name: "浮上速度増加", value: 0, unit: "（数値未検証）" }
    ],
    memo: "移動速度+15。物理軽減・浮上速度・モーションは数値未確定または物理計算対象外のため表示のみ。"
  },
  "technic-9273": {
    name: "オクト ブースター", officialTechnicId: 9273,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-9273", stackRule: "same-technic",
    stats: { speed: 8, extraAvoidPct: 15 },
    memo: "移動速度+8、回避+15%。WarAgeでは効果なし。"
  },
  "technic-10374": {
    name: "機械翅", officialTechnicId: 10374,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10374", stackRule: "same-technic",
    stats: { speedPct: 5, extraAvoidPct: 5 },
    memo: "移動速度・回避+5%。WarAgeでは効果なし。"
  },
  "technic-10051": {
    name: "傀儡子", officialTechnicId: 10051,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10051", stackRule: "same-technic",
    stats: { speed: 5, extraAttackDelay: -5 },
    customEffects: [{ name: "消費ST", value: 10, unit: "%増加" }],
    memo: "移動速度+5、攻撃ディレイ-5。消費ST約10%増加は最大STへ誤加算せず表示のみ。WarAgeでは効果なし。"
  },
  "technic-13677": {
    name: "ファルコンの加護", officialTechnicId: 13677,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13677", stackRule: "same-technic",
    stats: { speed: 10, stRegenPerMinute: 41.25 },
    customEffects: [{ name: "待機モーション変化", value: 0 }],
    memo: "移動速度+10、ST自然回復41.25/分。待機モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-13920": {
    name: "暗影の暗殺術", officialTechnicId: 13920,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "critical:verified", stackRule: "score",
    stats: { attackPct: 5, speedPct: 10, extraCritRatePct: 20 },
    memo: "攻撃力+5%、移動速度+10%、クリティカル率+20%。WarAgeでは効果なし。"
  },
  "technic-13963": {
    name: "怪盗の極意", officialTechnicId: 13963,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13963", stackRule: "same-technic",
    stats: { speedPct: 5 },
    skillEffects: [{ name: "盗み", value: 20 }, { name: "物まね", value: 20 }],
    memo: "移動速度+5%、盗み・物まねスキル効果+20。WarAgeでは効果なし。"
  },
  "technic-13997": {
    name: "インフィニット エンハンス", officialTechnicId: 13997,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13997", stackRule: "same-technic",
    stats: { attackPct: 5, magicPct: 5, extraACPct: 5, speedPct: 5, extraMaxWeightPct: 5 },
    memo: "攻撃力・魔力・防御力・移動速度・最大所持重量+5%。WarAgeでは効果なし。"
  },
  "technic-14152": {
    name: "山の妖精", officialTechnicId: 14152,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-14152", stackRule: "same-technic",
    stats: { speedPct: 10 },
    skillEffects: [{ name: "ダンス", value: 20 }],
    customEffects: [{ name: "水中移動速度", value: 10, unit: "%" }],
    memo: "移動速度+10%、ダンススキル効果+20。水中移動速度+10%は通常速度へ重ねず表示のみ。WarAgeでは効果なし。"
  },
  "technic-14257": {
    name: "メガパワー", officialTechnicId: 14257,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-14257", stackRule: "same-technic",
    stats: { attackPct: 5, extraHitPct: 5, extraAvoidPct: 5, extraACPct: 5, speedPct: 5 },
    customEffects: [{ name: "落下速度軽減", value: 0, unit: "（数値未検証）" }],
    memo: "攻撃力・命中・回避・防御力・移動速度+5%。落下速度軽減量は未検証のため表示のみ。WarAgeでは効果なし。"
  },
  "technic-14306": {
    name: "フェアリー ブースト", officialTechnicId: 14306,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "movement-assist-exclusive", stackRule: "score",
    stats: { speedPct: 10 },
    customEffects: [{ name: "所持重量軽減", value: 0, unit: "（数値未検証）" }],
    memo: "移動速度+10%。所持重量軽減量は未検証。移動アシスト機能・ロードランナーと併用不可。"
  },
  "technic-14343": {
    name: "タクティカルギア", officialTechnicId: 14343,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-14343", stackRule: "same-technic",
    stats: { extraACPct: 10, extraAvoidPct: 10, speedPct: 10 },
    skillEffects: [{ name: "戦闘技術", value: 20 }],
    memo: "防御力・回避・移動速度+10%、戦闘技術スキル効果+20。WarAgeでは効果なし。"
  },
  "technic-14392": {
    name: "ロードランナー", officialTechnicId: 14392,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "movement-assist-exclusive", stackRule: "score",
    stats: { extraAvoidPct: 15, speedPct: 15 },
    customEffects: [{ name: "移動モーション変化", value: 0 }],
    memo: "回避・移動速度+15%。モーション変化は表示のみ。フェアリー ブースト・移動アシスト機能と併用不可。"
  },
  "technic-13876": {
    name: "異形の力", officialTechnicId: 13876,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13876", stackRule: "same-technic",
    stats: { attackPct: 3 },
    conversions: { magicToSpeedPct: 5 },
    skillEffects: [{ name: "暗黒命令", value: 10 }],
    memo: "攻撃力+3%、魔力の5%を移動速度へ加算、暗黒命令スキル効果+10。WarAgeでは効果なし。"
  },
  "technic-14299": {
    name: "魔法の靴", officialTechnicId: 14299,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-14299", stackRule: "same-technic",
    stats: { stRegenPerMinute: 41.25 },
    conversions: { magicToSpeedPct: 10 },
    memo: "魔力の10%を移動速度へ加算、ST自然回復41.25/分。WarAgeでは効果なし。"
  },
  "technic-14347": {
    name: "スピードスター", officialTechnicId: 14347,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-14347", stackRule: "same-technic",
    stats: { stRegenPerMinute: 41.25, mpRegenPerMinute: 41.25 },
    conversions: { magicToSpeedPct: 10 },
    memo: "魔力の10%を移動速度へ加算、ST・MP自然回復各41.25/分。WarAgeでは効果なし。"
  },
  "technic-8261": {
    name: "滑走", officialTechnicId: 8261,
    verified: true, applyDefault: true, reviewStatus: "display-only",
    conflictGroup: "forced-movement", stackRule: "score",
    misc: { forcedSpeed: 65 },
    customEffects: [
      { name: "強制自動前進", value: 65, unit: "+" },
      { name: "ジャンプ不可", value: 0 },
      { name: "テクニック使用不可", value: 0 }
    ],
    memo: "強制移動速度65。通常移動速度の加算値ではないため表示のみ。"
  },
  "technic-9453": {
    name: "魚ぉぉおおぉぉぉ！", officialTechnicId: 9453,
    verified: true, applyDefault: true, reviewStatus: "display-only",
    conflictGroup: "technic-9453", stackRule: "same-technic",
    customEffects: [{ name: "水中移動速度", value: 20, unit: "+" }, { name: "モーション変化", value: 0 }],
    memo: "水中移動速度+20。地上の通常移動速度へ加算しないため表示のみ。WarAgeでは効果なし。"
  },
  "technic-8640": {
    name: "ウー！マンボウ！", officialTechnicId: 8640,
    verified: true, applyDefault: true, reviewStatus: "display-only",
    conflictGroup: "technic-8640", stackRule: "same-technic",
    customEffects: [
      { name: "水中移動速度", value: 30, unit: "+" },
      { name: "水中呼吸", value: 0 },
      { name: "待機・移動モーション変化", value: 0 }
    ],
    memo: "水中移動速度+30・水中呼吸・モーション変化。通常移動速度へ加算しないため表示のみ。"
  },
  "technic-13191": {
    name: "海竜の力", officialTechnicId: 13191,
    verified: true, applyDefault: true, reviewStatus: "display-only",
    conflictGroup: "technic-13191", stackRule: "same-technic",
    skillEffects: [{ name: "水泳", value: 10 }],
    customEffects: [
      { name: "水中移動速度", value: 30, unit: "+" },
      { name: "水中呼吸", value: 0 },
      { name: "専用技", value: 0, unit: "（タイダルブレス）" }
    ],
    memo: "水中移動速度+30、水泳スキル効果+10、水中呼吸、専用技。通常移動速度へ加算せず表示のみ。"
  }
});

// __MOE_EQUIPMENT_BUFF_NO_EFFECT_AUDIT_MOVEMENT_BATCH5_V1__
// 通常移動速度・移動速度割合と、同じ説明文で確定している基礎ステータスを
// 計算へ接続する。水中速度、落下、反射、モーション、専用技は表示用に分離する。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-8754": {
    name: "回転木馬", officialTechnicId: 8754,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-8754", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "移動モーション変化", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+15。モーション変化・テクニック使用不可は表示のみ。"
  },
  "technic-8892": {
    name: "お注射タイム", officialTechnicId: 8892,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-8892", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "騎乗モーション変化", value: 0 }],
    memo: "移動速度+15。騎乗モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-7539": {
    name: "ラートの効果", officialTechnicId: 7539,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7539", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+10。モーション変化・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-11082": {
    name: "ライダー ソウル", officialTechnicId: 11082,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-11082", stackRule: "same-technic",
    stats: { speedPct: 8 },
    memo: "移動速度+8%。WarAgeでは効果なし。"
  },
  "technic-6263": {
    name: "ライド オン グリモア", officialTechnicId: 6263,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-6263", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "浮遊移動モーション", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+10。浮遊モーション・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-8064": {
    name: "ライド バイク", officialTechnicId: 8064,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-8064", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [
      { name: "待機・移動フォーム変化", value: 0 },
      { name: "通常時テクニック使用不可", value: 0 },
      { name: "専用技マナ バースト時移動速度", value: 50, unit: "+" }
    ],
    memo: "通常時の移動速度+20。専用技時+50、フォーム変化、テクニック制限は表示のみ。WarAgeでは効果なし。"
  },
  "technic-7386": {
    name: "ラピッドスワロー", officialTechnicId: 7386,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7386", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [{ name: "テクニック使用不可", value: 0 }],
    memo: "復刻後の現行値を採用して移動速度+20。旧値は+15。テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-7156": {
    name: "陸上最速の脚", officialTechnicId: 7156,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7156", stackRule: "same-technic",
    stats: { speed: 10 },
    memo: "移動速度+10。"
  },
  "technic-12381": {
    name: "ロードレーサー", officialTechnicId: 12381,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12381", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+15。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-13401": {
    name: "オーリ・オール", officialTechnicId: 13401,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13401", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [
      { name: "物理ダメージ50%反射確率", value: 25, unit: "%" },
      { name: "落下速度低下", value: 30, unit: "%" },
      { name: "移動モーション変化", value: 0 }
    ],
    memo: "移動速度+20。25%確率で物理ダメージ50%反射、落下速度30%低下、モーション変化は表示のみ。"
  },
  "technic-13684": {
    name: "椅子レース", officialTechnicId: 13684,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13684", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+10。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-13789": {
    name: "南瓜戦車", officialTechnicId: 13789,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13789", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [
      { name: "モーション変化", value: 0 },
      { name: "専用技", value: 0, unit: "（パンプキン キャノン）" }
    ],
    memo: "移動速度+20。モーション変化・専用技は表示のみ。WarAgeでは効果なし。"
  },
  "technic-13720": {
    name: "散歩拒否", officialTechnicId: 13720,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13720", stackRule: "same-technic",
    stats: { speedPct: -50 },
    skillEffects: [{ name: "調教", value: 20 }],
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度-50%（固定値-50ではない）、調教スキル効果+20。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-13869": {
    name: "重力操作", officialTechnicId: 13869,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13869", stackRule: "same-technic",
    stats: { speed: 10 },
    misc: { jumpMultiplier: 1.71 },
    customEffects: [
      { name: "現在所持重量", value: -20, unit: "%" },
      { name: "落下速度軽減", value: 25, unit: "%" },
      { name: "落下ダメージ軽減", value: 25, unit: "%" },
      { name: "専用技", value: 0, unit: "（ジェット スラスター）" }
    ],
    memo: "移動速度+10。ジャンプ力1.71倍、重量・落下系、専用技は表示のみ。WarAgeでは効果なし。"
  },
  "technic-13878": {
    name: "フード デリバリー", officialTechnicId: 13878,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13878", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [{ name: "モーション変化", value: 0 }],
    memo: "移動速度+20。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-13909": {
    name: "シュッシュポッポ", officialTechnicId: 13909,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-13909", stackRule: "same-technic",
    stats: { speedPct: 20, extraMaxWeightPct: 20 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+20%、最大所持重量+20%。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-14004": {
    name: "近未来二輪", officialTechnicId: 14004,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-14004", stackRule: "same-technic",
    stats: { speedPct: 20 },
    customEffects: [
      { name: "通常時テクニック使用不可", value: 0 },
      { name: "専用技", value: 0, unit: "（N-ブースト）" }
    ],
    memo: "移動速度+20%。テクニック制限・専用技は表示のみ。WarAgeでは効果なし。"
  },
  "technic-14073": {
    name: "ゆめくじらいどおん", officialTechnicId: 14073,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-14073", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [
      { name: "水中移動速度", value: 50, unit: "+" },
      { name: "水面浮上", value: 0 },
      { name: "待機・移動モーション変化", value: 0 }
    ],
    memo: "地上移動速度+20。水中移動速度+50・水面浮上・モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-14083": {
    name: "ウマの加護", officialTechnicId: 14083,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-14083", stackRule: "same-technic",
    stats: { speed: 5 },
    customEffects: [{ name: "キック攻撃補正", value: 5, unit: "+" }],
    memo: "移動速度+5。キック攻撃補正+5は通常攻撃力へ加算せず表示のみ。WarAgeでは効果なし。"
  },
  "technic-14253": {
    name: "乗馬", officialTechnicId: 14253,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-14253", stackRule: "same-technic",
    stats: { speedPct: 20 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+20%。モーション変化は表示のみ。WarAgeでは効果なし。"
  }
});

// __MOE_EQUIPMENT_BUFF_NO_EFFECT_AUDIT_MOVEMENT_BATCH4_V1__
// 通常移動速度と単位が確定した自然回復だけを計算へ接続する。
// 落下系、モーション、専用技、テクニック制限は表示用効果として保持する。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-9468": {
    name: "なりきりチャーリー", officialTechnicId: 9468,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-9468", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [
      { name: "待機・移動モーション変化", value: 0 },
      { name: "専用技", value: 0, unit: "（チャーリー フェスティバル）" }
    ],
    memo: "移動速度+15。モーション変化・専用技は表示のみ。WarAgeでは効果なし。"
  },
  "technic-5839": {
    name: "忍者走り", officialTechnicId: 5839,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-5839", stackRule: "same-technic",
    stats: { speed: 5 },
    misc: { jumpMultiplier: 1.71 },
    customEffects: [{ name: "走行モーション変化", value: 0 }],
    memo: "移動速度+5。ジャンプ力1.71倍・走行モーション変化は表示のみ。WarAgeではモーション以外効果なし。"
  },
  "technic-6199": {
    name: "寝袋効果", officialTechnicId: 6199,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-6199", stackRule: "same-technic",
    stats: { speed: -50, hpRegenPerMinute: 113 },
    memo: "移動速度-50、HP自然回復約113/分。"
  },
  "technic-12270": {
    name: "ノア ポッド", officialTechnicId: 12270,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12270", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [
      { name: "落下速度軽減", value: 38, unit: "%" },
      { name: "専用技以外テクニック使用不可", value: 0 },
      { name: "専用技", value: 0, unit: "（マナ キャノン）" }
    ],
    memo: "移動速度+20。落下速度38%軽減・テクニック制限・専用技は表示のみ。WarAgeでは効果なし。"
  },
  "technic-12701": {
    name: "蜂の羽ばたき", officialTechnicId: 12701,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12701", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [
      { name: "移動モーション変化", value: 0 },
      { name: "落下速度軽減", value: 60, unit: "%" }
    ],
    memo: "移動速度+10。落下速度60%軽減・モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-9935": {
    name: "バナナでプカプカ", officialTechnicId: 9935,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-9935", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "移動モーション変化", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+15。モーション変化・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-10470": {
    name: "埴輪ポーズ", officialTechnicId: 10470,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10470", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "モーション変化", value: 0 }],
    memo: "移動速度+10。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-7815": {
    name: "ビートル GO!", officialTechnicId: 7815,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7815", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+15。モーション変化・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-5896": {
    name: "浮遊モード", officialTechnicId: 5896,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-5896", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "浮遊モーション変化", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+10。浮遊モーション・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-12385": {
    name: "ブルーム ブースター", officialTechnicId: 12385,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12385", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [{ name: "移動エフェクト", value: 0 }],
    memo: "移動速度+20。移動エフェクトは表示のみ。WarAgeでは効果なし。"
  },
  "technic-10155": {
    name: "ブル ライディング", officialTechnicId: 10155,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10155", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "騎乗モーション変化", value: 0 }],
    memo: "移動速度+15。騎乗モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-8516": {
    name: "浮遊水晶", officialTechnicId: 8516,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-8516", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+15。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-12561": {
    name: "ヘリ脱出！", officialTechnicId: 12561,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12561", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [
      { name: "待機・移動モーション変化", value: 0 },
      { name: "落下速度軽減", value: 0, unit: "（数値未検証）" },
      { name: "テクニック使用不可", value: 0 }
    ],
    memo: "移動速度+20。モーション変化・落下速度軽減・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-9477": {
    name: "ボール キャリア", officialTechnicId: 9477,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-9477", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [
      { name: "移動モーション変化", value: 0 },
      { name: "専用技", value: 0, unit: "（ラグビー ダッシュ）" }
    ],
    memo: "移動速度+10。モーション変化・専用技は表示のみ。WarAgeでは効果なし。"
  },
  "technic-12715": {
    name: "魔法の馬車", officialTechnicId: 12715,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12715", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+20。モーション変化・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-8698": {
    name: "魔法の羽ペン", officialTechnicId: 8698,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-8698", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "羽根エフェクト", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+15。羽根エフェクト・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-5883": {
    name: "魔法のブラシ", officialTechnicId: 5883,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-5883", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [
      { name: "浮遊移動モーション", value: 0 },
      { name: "泡エフェクト", value: 0 },
      { name: "テクニック使用不可", value: 0 }
    ],
    memo: "移動速度+10。浮遊モーション・泡エフェクト・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-5582": {
    name: "魔法の箒", officialTechnicId: 5582,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-5582", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [
      { name: "浮遊移動モーション", value: 0 },
      { name: "発光エフェクト", value: 0 },
      { name: "テクニック使用不可", value: 0 }
    ],
    memo: "移動速度+10。浮遊モーション・発光エフェクト・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-12703": {
    name: "山犬の加護", officialTechnicId: 12703,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12703", stackRule: "same-technic",
    stats: { speed: 10 },
    misc: { jumpMultiplier: 1.21 },
    customEffects: [{ name: "落下ダメージ軽減", value: 0, unit: "（数値未検証）" }],
    memo: "移動速度+10。ジャンプ力1.21倍・落下ダメージ軽減は表示のみ。WarAgeでは効果なし。"
  },
  "technic-9968": {
    name: "四輪駆動", officialTechnicId: 9968,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-9968", stackRule: "same-technic",
    stats: { speed: 15 },
    memo: "移動速度+15。WarAgeでは効果なし。"
  }
});

// __MOE_EQUIPMENT_BUFF_NO_EFFECT_AUDIT_MOVEMENT_BATCH3_V1__
// 通常移動速度の明記値だけを計算へ接続し、武器種固有補正、落下速度、
// モーション、専用技、テクニック制限は表示用効果として分離する。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-7731": {
    name: "人馬一体", officialTechnicId: 7731,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7731", stackRule: "same-technic",
    stats: { speed: 5 },
    customEffects: [
      { name: "キック攻撃力", value: 10, unit: "+" },
      { name: "弓技ディレイ", value: -10, unit: "%" }
    ],
    memo: "移動速度+5。キック攻撃力+10・弓技ディレイ-10%は通常攻撃力/共通ディレイへ加算せず表示のみ。"
  },
  "technic-10882": {
    name: "スカイ ドライビング", officialTechnicId: 10882,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10882", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [
      { name: "攻撃不可", value: 0 },
      { name: "落下速度軽減", value: 0, unit: "（数値未検証）" }
    ],
    memo: "移動速度+20。攻撃不可・落下速度軽減は表示のみ。WarAgeでは効果なし。"
  },
  "technic-6591": {
    name: "スケーティング", officialTechnicId: 6591,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-6591", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "移動モーション変化", value: 0 }],
    memo: "移動速度+10。移動モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-11525": {
    name: "スター ロード", officialTechnicId: 11525,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-11525", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "移動軌跡エフェクト", value: 0 }],
    memo: "移動速度+10。移動軌跡エフェクトは表示のみ。WarAgeでは効果なし。"
  },
  "technic-6780": {
    name: "スノーボード", officialTechnicId: 6780,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-6780", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+10。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-9566": {
    name: "スノー ロード", officialTechnicId: 9566,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-9566", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "雪の結晶軌跡", value: 0 }],
    memo: "移動速度+10。雪の結晶の移動軌跡は表示のみ。"
  },
  "technic-12135": {
    name: "宣伝車", officialTechnicId: 12135,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12135", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+15。モーション変化等は表示のみ。WarAgeでは効果なし。"
  },
  "technic-5649": {
    name: "空飛ぶ雲", officialTechnicId: 5649,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-5649", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "浮遊移動モーション", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+10。浮遊モーション・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-8642": {
    name: "空飛ぶ絨毯", officialTechnicId: 8642,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-8642", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+15。モーション変化・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-7227": {
    name: "空を自由に飛びたいな", officialTechnicId: 7227,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7227", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [
      { name: "待機・移動モーション変化", value: 0 },
      { name: "落下速度", value: -70, unit: "%" }
    ],
    memo: "移動速度+10。落下速度-70%・モーション変化・落下系競合は表示のみ。WarAgeでは効果なし。"
  },
  "technic-7753": {
    name: "体重移動", officialTechnicId: 7753,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7753", stackRule: "same-technic",
    stats: { speed: 10 },
    memo: "移動速度+10。WarAgeでは効果なし。"
  },
  "technic-7157": {
    name: "竹馬の友", officialTechnicId: 7157,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7157", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "移動モーション変化", value: 0 }],
    memo: "移動速度+10。移動モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-8761": {
    name: "ツーリング", officialTechnicId: 8761,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-8761", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [{ name: "モーション変化", value: 0 }],
    memo: "移動速度+20。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-6478": {
    name: "電車でゴー！", officialTechnicId: 6478,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-6478", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "変身状態", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+15。変身状態・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-6781": {
    name: "ドッグファイト", officialTechnicId: 6781,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-6781", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+15。テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-7470": {
    name: "ドライビング", officialTechnicId: 7470,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7470", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [
      { name: "待機・移動モーション変化", value: 0 },
      { name: "通常時テクニック使用不可", value: 0 },
      { name: "専用技フル スロットル時移動速度", value: 35, unit: "+" }
    ],
    memo: "通常時の移動速度+15。専用技時+35、モーション変化、テクニック制限は表示のみ。WarAgeでは移動速度上昇なし。"
  },
  "technic-11759": {
    name: "トランスフォーム・タイタン！", officialTechnicId: 11759,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-11759", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [{ name: "専用技", value: 0, unit: "（フル スロットル）" }],
    memo: "移動速度+20。専用技は表示のみ。"
  },
  "technic-8252": {
    name: "トロリーバッグ", officialTechnicId: 8252,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-8252", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "待機モーション変化", value: 0 }],
    memo: "移動速度+15。待機モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-7804": {
    name: "☆彡", officialTechnicId: 7804,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7804", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [
      { name: "待機・移動モーション変化", value: 0 },
      { name: "テクニック使用不可", value: 0 },
      { name: "ライト効果", value: 0 }
    ],
    memo: "移動速度+15。モーション変化・テクニック使用不可・ライト効果は表示のみ。WarAgeでは効果なし。"
  },
  "technic-11162": {
    name: "肉球スタンプ", officialTechnicId: 11162,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-11162", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [
      { name: "落下ダメージ軽減", value: 25, unit: "%" },
      { name: "肉球の移動軌跡", value: 0 }
    ],
    memo: "移動速度+10。落下ダメージ25%軽減・肉球の移動軌跡は表示のみ。WarAgeでは効果なし。"
  }
});

// __MOE_EQUIPMENT_BUFF_NO_EFFECT_AUDIT_MOVEMENT_BATCH2_V1__
// 説明文に通常移動速度の固定値が明記された候補をmanualへ昇格する。
// モーション、専用技、テクニック制限、水泳速度、落下速度などは表示用に分離する。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-5812": {
    name: "アドベント エンジェル", officialTechnicId: 5812,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-5812", stackRule: "same-technic",
    stats: { speed: 2 },
    customEffects: [{ name: "浮遊移動モーション", value: 0 }, { name: "ライト効果", value: 0 }],
    memo: "移動速度+2。浮遊モーション・ライト効果は表示のみ。"
  },
  "technic-7246": {
    name: "安全運転", officialTechnicId: 7246,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7246", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "低空飛行モーション", value: 0 }],
    memo: "移動速度+15。低空飛行モーションは表示のみ。"
  },
  "technic-7801": {
    name: "韋駄天", officialTechnicId: 7801,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7801", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "移動モーション変化", value: 0 }],
    memo: "移動速度+10。移動モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-7879": {
    name: "一輪車", officialTechnicId: 7879,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7879", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+15。モーション変化・テクニック使用不可は表示のみ。WarAgeでは移動速度上昇なし。"
  },
  "technic-10247": {
    name: "一輪バイク", officialTechnicId: 10247,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10247", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [{ name: "モーション変化", value: 0 }],
    memo: "移動速度+20。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-10371": {
    name: "エクストリーム ボード", officialTechnicId: 10371,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10371", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [
      { name: "待機・移動モーション変化", value: 0 },
      { name: "専用技", value: 0, unit: "（グラウンド トリック）" }
    ],
    memo: "移動速度+10。モーション変化・専用技は表示のみ。WarAgeでは効果なし。"
  },
  "technic-7746": {
    name: "大型二種", officialTechnicId: 7746,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-7746", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+15。モーション変化等は表示のみ。WarAgeでは移動速度上昇なし。"
  },
  "technic-12198": {
    name: "大型二輪", officialTechnicId: 12198,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12198", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [
      { name: "テクニック使用不可", value: 0 },
      { name: "専用技", value: 0, unit: "（ジェット ブースター）" }
    ],
    memo: "移動速度+20。テクニック制限・専用技は表示のみ。WarAgeでは効果なし。"
  },
  "technic-12000": {
    name: "オート モービル", officialTechnicId: 12000,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12000", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+20。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-5988": {
    name: "おしおき三輪車", officialTechnicId: 5988,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-5988", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "旋回・移動モーション変化", value: 0 }, { name: "テクニック使用不可", value: 0 }],
    memo: "移動速度+10。モーション変化・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-11377": {
    name: "蛙の加護", officialTechnicId: 11377,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-11377", stackRule: "same-technic",
    stats: { speed: 10 },
    misc: { jumpMultiplier: 1.45 },
    memo: "移動速度+10。ジャンプ力1.45倍は表示のみ。WarAgeでは効果なし。"
  },
  "technic-10640": {
    name: "クリスタル シェルター", officialTechnicId: 10640,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10640", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [
      { name: "待機・移動モーション変化", value: 0 },
      { name: "MP自然回復", value: 0, unit: "（数値未検証）" }
    ],
    memo: "移動速度+15。MP自然回復量は数値不明のため表示のみ。WarAgeでは効果なし。"
  },
  "technic-10933": {
    name: "ゴーゴーゴースト", officialTechnicId: 10933,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10933", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [
      { name: "所持重量", value: 80, unit: "%" },
      { name: "落下速度低下", value: 0, unit: "（数値未検証）" },
      { name: "テクニック使用不可", value: 0 }
    ],
    memo: "移動速度+15。所持重量80%・落下速度低下・テクニック制限は表示のみ。WarAgeでは効果なし。"
  },
  "technic-10045": {
    name: "サイドカー", officialTechnicId: 10045,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10045", stackRule: "same-technic",
    stats: { speed: 15 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+15。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-10533": {
    name: "仕込み靴", officialTechnicId: 10533,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10533", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [
      { name: "足音消去", value: 0 },
      { name: "専用技", value: 0, unit: "（ジェット スラスター）" }
    ],
    memo: "移動速度+10。足音消去・専用技は表示のみ。WarAgeでは効果なし。"
  },
  "technic-11577": {
    name: "姿勢制御", officialTechnicId: 11577,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-11577", stackRule: "same-technic",
    stats: { speedPct: 8 },
    customEffects: [{ name: "落下速度低下", value: 0, unit: "（数値未検証）" }],
    memo: "移動速度+8%。落下速度低下量は数値不明のため表示のみ。WarAgeでは効果なし。"
  },
  "technic-12523": {
    name: "シャーク・ザ・ライド", officialTechnicId: 12523,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-12523", stackRule: "same-technic",
    stats: { speed: 15 },
    skillEffects: [{ name: "水泳", value: 10 }],
    customEffects: [
      { name: "水中移動速度", value: 65, unit: "+" },
      { name: "呼吸ゲージ回復", value: 0 }
    ],
    memo: "移動速度+15、水泳スキル効果+10。水中移動速度+65・呼吸ゲージ回復は表示のみ。WarAgeでは効果なし。"
  },
  "technic-5694": {
    name: "重力制御", officialTechnicId: 5694,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-5694", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [
      { name: "所持重量軽減", value: 10, unit: "%" },
      { name: "待機・移動モーション変化", value: 0 },
      { name: "テクニック使用不可", value: 0 }
    ],
    memo: "移動速度+10。所持重量軽減・モーション変化・テクニック制限は表示のみ。"
  },
  "technic-8120": {
    name: "神速の勾玉", officialTechnicId: 8120,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-8120", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [{ name: "移動モーション変化", value: 0 }],
    memo: "移動速度+10。移動モーション変化は表示のみ。WarAgeでは効果なし。"
  }
});

// __MOE_EQUIPMENT_BUFF_NO_EFFECT_AUDIT_BATCH1_V1__
// 生成候補では「効果なし」になる装備Buffのうち、説明内の数値と効果範囲が
// 明確なものだけを手動ルールへ昇格する。水中速度・落下軽減・アイテム使用
// ディレイは現行の物理計算へ接続せず、表示用効果として保持する。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-10510": {
    name: "アニマル コミュニケーション", officialTechnicId: 10510,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10510", stackRule: "same-technic",
    stats: { speed: 5 },
    customEffects: [{ name: "ペット取得経験値", value: 1.1, unit: "倍" }],
    memo: "移動速度+5。ペット取得経験値1.1倍は表示のみ。WarAgeでは効果なし。"
  },
  "technic-10829": {
    name: "駆け抜ける悪夢", officialTechnicId: 10829,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-10829", stackRule: "same-technic",
    stats: { speed: 5 },
    memo: "移動速度+5。WarAgeでは効果なし。"
  },
  "technic-9277": {
    name: "がたん ごとん がたん ごとん", officialTechnicId: 9277,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-9277", stackRule: "same-technic",
    stats: { speed: 10 },
    memo: "移動速度+10。WarAgeでは効果なし。"
  },
  "technic-9602": {
    name: "雷様", officialTechnicId: 9602,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-9602", stackRule: "same-technic",
    stats: { speed: 10 },
    customEffects: [
      { name: "待機・移動モーション変化", value: 0 },
      { name: "テクニック使用不可", value: 0 }
    ],
    memo: "移動速度+10。モーション変化・テクニック使用不可は表示のみ。WarAgeでは効果なし。"
  },
  "technic-11528": {
    name: "キックスケーター", officialTechnicId: 11528,
    verified: true, applyDefault: true, reviewStatus: "implemented",
    conflictGroup: "technic-11528", stackRule: "same-technic",
    stats: { speed: 20 },
    customEffects: [{ name: "待機・移動モーション変化", value: 0 }],
    memo: "移動速度+20。モーション変化は表示のみ。WarAgeでは効果なし。"
  },
  "technic-9961": {
    name: "魚群", officialTechnicId: 9961,
    verified: true, applyDefault: true, reviewStatus: "display-only",
    conflictGroup: "technic-9961", stackRule: "same-technic",
    customEffects: [
      { name: "水中移動速度", value: 20, unit: "+" },
      { name: "水中呼吸", value: 0 }
    ],
    memo: "水中移動速度+20・水中呼吸。通常移動速度へ誤加算しないため表示のみ。WarAgeでは効果なし。"
  },
  "technic-8063": {
    name: "風に揺られて", officialTechnicId: 8063,
    verified: true, applyDefault: true, reviewStatus: "display-only",
    conflictGroup: "fall-damage-reduction", stackRule: "score",
    customEffects: [
      { name: "落下ダメージ軽減", value: 15, unit: "%" },
      { name: "落下速度軽減", value: 0, unit: "（数値未検証）" },
      { name: "待機モーション変化", value: 0 }
    ],
    memo: "落下ダメージ15%軽減。落下速度の数値は未検証。物理ダメージ計算へは接続せず表示のみ。"
  },
  "technic-2440": {
    name: "アイテム使用ディレイ短縮 Lv1", officialTechnicId: 2440,
    verified: true, applyDefault: true, reviewStatus: "display-only",
    conflictGroup: "item-use-delay", stackRule: "latest",
    customEffects: [{ name: "アイテム使用ディレイ", value: -2, unit: "%" }],
    memo: "アイテム使用ディレイ・使用速度-2%。物理攻撃ディレイとは別のため表示のみ。"
  },
  "technic-2441": {
    name: "アイテム使用ディレイ短縮 Lv2", officialTechnicId: 2441,
    verified: true, applyDefault: true, reviewStatus: "display-only",
    conflictGroup: "item-use-delay", stackRule: "latest",
    customEffects: [{ name: "アイテム使用ディレイ", value: -4, unit: "%" }],
    memo: "アイテム使用ディレイ・使用速度-4%。物理攻撃ディレイとは別のため表示のみ。"
  },
  "technic-2442": {
    name: "アイテム使用ディレイ短縮 Lv3", officialTechnicId: 2442,
    verified: true, applyDefault: true, reviewStatus: "display-only",
    conflictGroup: "item-use-delay", stackRule: "latest",
    customEffects: [{ name: "アイテム使用ディレイ", value: -6, unit: "%" }],
    memo: "アイテム使用ディレイ・使用速度-6%。物理攻撃ディレイとは別のため表示のみ。"
  }
});

// __MOE_THREE_VERIFIED_EQUIPMENT_BUFFS_V1__

window.MOE_BUFF_RULES_MANUAL["technic-10685"] = {
  name: "狂戦士",
  officialTechnicId: 10685,
  verified: true,
  applyDefault: true,
  conflictGroup: "technic-10685",
  stackRule: "same-technic",
  stats: { attackPct: 5, hpRegenPerMinute: 78.125 },
  misc: { forcedEvasion: 0, forcedEvasionMode: "set" },
  effects: [
    { key: "attackPct", value: 5, unit: "%", source: "manual-verified" },
    { key: "evasionFixed", value: 0, unit: "", source: "manual-verified" }
  ],
  memo: "攻撃力+5%、HP自然回復78.125/分（15HP/11.52秒）。回避は0固定。WarAgeでは効果なし。"
};

// 自然回復の数値が明記されており、現行パッチ注記まで確認できるものだけを手入力する。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-12310": {
    name: "キャタピラー レッグ", officialTechnicId: 12310, verified: false, applyDefault: true,
    stats: { extraACPct: 5 },
    memo: "暫定: AC+5%。キックATK+10は現行計算対象外。"
  },
  "technic-9473": {
    name: "束縛の鎖", officialTechnicId: 9473, verified: false, applyDefault: true,
    stats: { attackPct: -5 },
    memo: "暫定: 攻撃力-5%。"
  },
  "technic-11384": {
    name: "フェンネの加護", officialTechnicId: 11384, verified: false, applyDefault: true,
    stats: { extraMPPct: 10 },
    memo: "暫定: 最大MP+10%。消費MP-10%は現行計算対象外。"
  },
  "technic-8264": {
    name: "フットワーク", officialTechnicId: 8264, verified: false, applyDefault: true,
    stats: { extraAvoidPct: 10 },
    memo: "暫定: 回避+10%。"
  },
  "technic-13128": {
    name: "フューチャー テクノロジー", officialTechnicId: 13128, verified: false, applyDefault: true,
    stats: { attackPct: 3, extraHitPct: 3, extraAvoidPct: 3, extraACPct: 3, extraFireResPct: 10, extraWaterResPct: 10, extraEarthResPct: 10, extraWindResPct: 10, extraNeutralResPct: 10 },
    memo: "暫定: 攻撃・命中・回避・防御+3%、全属性耐性+10%。"
  },
  "technic-8888": {
    name: "ラビットイヤー スピーカー", officialTechnicId: 8888, verified: false, applyDefault: true,
    stats: { extraAvoidPct: 3 },
    memo: "暫定: 回避+3%。AGI+3%は現行計算対象外。"
  },
  "technic-6672": {
    name: "龍神の加護", officialTechnicId: 6672, verified: false, applyDefault: true,
    stats: { extraACPct: 10, extraFireResPct: 10, extraWaterResPct: 10, extraEarthResPct: 10, extraWindResPct: 10, extraNeutralResPct: 10 },
    memo: "暫定: AC+10%、全属性耐性+10%。HP自然回復は既存補完で20/分。"
  },
  "technic-13681": {
    name: "王の器", officialTechnicId: 13681, verified: false, applyDefault: true,
    stats: { attackPct: 3, magicPct: 3, extraHitPct: 3, extraAvoidPct: 3, extraACPct: 3, extraFireResPct: 3, extraWaterResPct: 3, extraEarthResPct: 3, extraWindResPct: 3, extraNeutralResPct: 3 },
    memo: "暫定: 攻撃・魔力・命中・回避・防御・全属性耐性+3%。"
  },
  "technic-13717": {
    name: "ツヴァイフォーム", officialTechnicId: 13717, verified: true, applyDefault: true,
    stats: { stChangePerSecond: -0.34375, mpChangePerSecond: -0.34375 },
    memo: "現行注記（250729後）: HPスリップは削除済み。ST/MPは各20.625/分減少。"
  }
});

window.MOE_BUFF_RULES_MANUAL["technic-12614"] = {
  name: "復讐姫",
  officialTechnicId: 12614,
  verified: true,
  applyDefault: true,
  conflictGroup: "technic-12614",
  stackRule: "same-technic",
  stats: { attackPct: 5 },
  misc: {
    targetDamageEffects: "dragon:1.5",
    targetRace: "dragon",
    targetMultiplier: 1.5
  },
  effects: [
    { key: "attackPct", value: 5, unit: "%", source: "manual-verified" },
    { key: "targetDamageMultiplier", target: "dragon", value: 1.5, unit: "x", source: "manual-verified" }
  ],
  memo: "攻撃力+5%。ドラゴン系への与ダメージ1.5倍。WarAgeでは効果なし。"
};

// __MOE_ROSE_RADIANCE_STAT_KEYS_FIX_V1__
window.MOE_BUFF_RULES_MANUAL["technic-14427"] = {
  name: "薔薇の輝き",
  officialTechnicId: 14427,
  verified: true,
  applyDefault: true,
  conflictGroup: "critical:L",
  stackRule: "score",
  stats: {
    dmgPct: 10,
    extraCritRatePct: 15
  },
  effects: [
    { key: "physicalDamagePct", value: 10, unit: "%", source: "manual-verified" },
    { key: "criticalRatePct", value: 15, unit: "%", source: "manual-verified" }
  ],
  memo: "物理与ダメージ+10%、メイン攻撃クリティカル率+15%。競合なし。独立枠 critical:L。WarAgeでは効果なし。"
};

// __MOE_REVIEWED_EQUIPMENT_BUFFS_2026_07_21_V1__
// Wiki説明文とユーザー確認に基づく確定値。候補生成データより優先して適用する。
Object.assign(window.MOE_BUFF_RULES_MANUAL, {
  "technic-13239": {
    name: "銃士の心得", officialTechnicId: 13239, verified: true, applyDefault: true,
    conflictGroup: "critical:B1", stackRule: "score",
    stats: { extraCritRatePct: 15, extraHitPct: 10 },
    memo: "クリティカル率+15%（B1枠）、命中+10%。"
  },
  "technic-9212": {
    name: "選ばれし者", officialTechnicId: 9212, verified: true, applyDefault: true,
    conflictGroup: "technic-9212", stackRule: "same-technic",
    stats: { attackPct: 3, magicPct: 3 },
    memo: "攻撃力・魔力+3%。"
  },
  "technic-9604": {
    name: "暗殺術", officialTechnicId: 9604, verified: true, applyDefault: true,
    conflictGroup: "critical:B2", stackRule: "score",
    stats: { extraHitPct: 10, extraCritRatePct: 15 },
    memo: "命中+10%、クリティカル率+15%。"
  },
  "technic-11967": {
    name: "魔弾の射手", officialTechnicId: 11967, verified: true, applyDefault: true,
    conflictGroup: "critical:A1", stackRule: "score",
    stats: { extraHitPct: 10, extraCritRatePct: 15 },
    memo: "命中+10%、クリティカル率+15%。"
  },
  "technic-14252": {
    name: "闘魂", officialTechnicId: 14252, verified: true, applyDefault: true,
    conflictGroup: "damage:physical:L", stackRule: "score",
    stats: { dmgPct: 10, extraHPPct: 10, stRegenPerMinute: 56.25 },
    memo: "物理与ダメージ+10%、最大HP+10%、ST自然回復56.25/分。"
  },
  "technic-11372": {
    name: "石魔の加護", officialTechnicId: 11372, verified: true, applyDefault: true,
    conflictGroup: "damage-cut:physical", stackRule: "score",
    stats: { magicPct: 3, extraDamageReducePct: 15 },
    memo: "魔力+3%、物理ダメージ15%軽減。"
  },
  "technic-7567": {
    name: "力士", officialTechnicId: 7567, verified: true, applyDefault: true,
    conflictGroup: "damage-cut:physical", stackRule: "score",
    stats: { attackPct: 3, extraDamageReducePct: 10 },
    memo: "攻撃力+3%、物理ダメージ10%軽減。"
  },
  "technic-14263": {
    name: "黄金の呪い", officialTechnicId: 14263, verified: true, applyDefault: true,
    conflictGroup: "damage:physical:K", stackRule: "score",
    stats: { attackPct: 3, dmgPct: 10, extraHPPct: -15 },
    memo: "攻撃力+3%、物理与ダメージ+10%、最大HP-15%。"
  },
  "technic-13486": {
    name: "剛剣の使い手", officialTechnicId: 13486, verified: true, applyDefault: true,
    conflictGroup: "damage:physical:G", stackRule: "score",
    stats: { dmgPct: 15, extraHitPct: -5, extraAvoidPct: -5 },
    memo: "物理与ダメージ+15%、命中・回避-5%。"
  },
  "technic-10974": {
    name: "レッドゾーン", officialTechnicId: 10974, verified: true, applyDefault: true,
    conflictGroup: "technic-10974", stackRule: "same-technic",
    stats: { speedPct: 5, extraHPPct: -5 },
    memo: "移動速度+5%、最大HP-5%。"
  },
  "technic-10511": {
    name: "溢れる妖気", officialTechnicId: 10511, verified: true, applyDefault: true,
    conflictGroup: "technic-10511", stackRule: "same-technic",
    stats: { attackPct: 3, mpChangePerSecond: -7.3 },
    memo: "攻撃力+3%、MP-7.3/秒。"
  },
  "technic-9710": {
    name: "桜花爛漫", officialTechnicId: 9710, verified: true, applyDefault: true,
    conflictGroup: "technic-9710", stackRule: "same-technic",
    stats: { extraAvoidPct: 5 },
    memo: "回避+5%。"
  },
  "technic-9392": {
    name: "閣下サポート", officialTechnicId: 9392, verified: true, applyDefault: true,
    conflictGroup: "technic-9392", stackRule: "same-technic",
    stats: { magicPct: 3, extraMPPct: 3 },
    memo: "魔力・最大MP+3%。"
  },
  "technic-9215": {
    name: "賢者の知識", officialTechnicId: 9215, verified: true, applyDefault: true,
    conflictGroup: "technic-9215", stackRule: "same-technic",
    stats: { extraMPPct: 10 },
    memo: "最大MP+10%。"
  },
  "technic-10214": {
    name: "神秘のリンゴ", officialTechnicId: 10214, verified: true, applyDefault: true,
    conflictGroup: "technic-10214", stackRule: "same-technic",
    stats: { extraHPPct: 3, hpRegenPerMinute: 75 },
    memo: "最大HP+3%、HP自然回復75/分。Scrapbox取得済み根拠行で確認。"
  },
  "technic-8753": {
    name: "熾天使の力", officialTechnicId: 8753, verified: true, applyDefault: true,
    conflictGroup: "technic-8753", stackRule: "same-technic",
    stats: { extraHPPct: 3, attackPct: 3 },
    memo: "最大HP・攻撃力+3%。"
  },
  "technic-9406": {
    name: "ハーフ＆ハーフ", officialTechnicId: 9406, verified: true, applyDefault: true,
    conflictGroup: "technic-9406", stackRule: "same-technic",
    stats: { attackPct: 3, magicPct: 3 },
    memo: "攻撃力・魔力+3%。"
  },
  "technic-8517": {
    name: "デビルヘアー", officialTechnicId: 8517, verified: true, applyDefault: true,
    conflictGroup: "technic-8517", stackRule: "same-technic",
    stats: { attackPct: 3, magicPct: 3, extraHPPct: -5 },
    memo: "攻撃力・魔力+3%、最大HP-5%。"
  },
  "technic-12131": {
    name: "焔の加護", officialTechnicId: 12131, verified: true, applyDefault: true,
    conflictGroup: "technic-12131", stackRule: "same-technic",
    stats: { extraHPPct: 10, attackPct: 3, extraFireResPct: 40 },
    memo: "最大HP+10%、攻撃力+3%、耐火属性+40%。"
  },
  "technic-13919": {
    name: "ゴースト ブラザーズ", officialTechnicId: 13919, verified: true, applyDefault: true,
    conflictGroup: "technic-13919", stackRule: "same-technic",
    stats: { extraHPPct: 5, extraSTPct: 5, extraMPPct: 5, attackPct: 3, speedPct: 3, magicPct: 3 },
    customEffects: [{ name: "確率魔法反射（確率未確定）", value: 0 }],
    memo: "HP/ST/MP+5%、攻撃力/移動速度/魔力+3%。魔法反射率は未確定。"
  },
  "technic-14147": {
    name: "チョコっとラブ", officialTechnicId: 14147, verified: true, applyDefault: true,
    conflictGroup: "damage:physical:J", stackRule: "score",
    stats: { extraHPPct: 3, dmgPct: 3 },
    customEffects: [{ name: "魔法与ダメージ", value: 3, unit: "%" }],
    memo: "最大HP+3%、物理・魔法与ダメージ+3%。"
  },
  "technic-13488": {
    name: "愚者のアルカナ", officialTechnicId: 13488, verified: true, applyDefault: true,
    conflictGroup: "technic-13488", stackRule: "same-technic",
    skillEffects: [{ name: "物まね", value: 20 }],
    customEffects: [{ name: "物まねディレイ", value: -20, unit: "%" }],
    memo: "物まねスキル+20、物まねディレイ-20%。"
  },
  "technic-14300": {
    name: "堕天使の魔眼", officialTechnicId: 14300, verified: true, applyDefault: true,
    conflictGroup: "technic-14300", stackRule: "same-technic",
    skillEffects: [{ name: "死の魔法", value: 20 }],
    customEffects: [{ name: "効果範囲", value: 1, unit: "" }, { name: "魔法射程", value: 0, unit: "（数値未検証）" }],
    memo: "死の魔法スキル+20、効果範囲+1.0。魔法射程の数値は未検証。"
  },
  "technic-4799": {
    name: "闇の鍵", officialTechnicId: 4799, verified: true, applyDefault: true,
    conflictGroup: "technic-4799", stackRule: "same-technic",
    stats: { extraMPPct: 5 },
    memo: "最大MP+5%。"
  },
  "technic-12773": {
    name: "マジック チャーム", officialTechnicId: 12773, verified: true, applyDefault: true,
    aliases: ["マジックチャーム"],
    conflictGroup: "technic-12773", stackRule: "same-technic",
    skillEffects: [
      { name: "破壊魔法", value: 5 }, { name: "強化魔法", value: 5 },
      { name: "神秘魔法", value: 5 }, { name: "回復魔法", value: 5 }
    ],
    memo: "破壊・強化・神秘・回復魔法スキル+5。空白なし表記は別名として正規化する。"
  },
  "technic-8838": {
    name: "強化アシスト機能", officialTechnicId: 8838, verified: true, applyDefault: true,
    conflictGroup: "technic-8838", stackRule: "same-technic",
    customEffects: [{ name: "共通攻撃ディレイ", value: -5, unit: "%" }, { name: "ジャンプ力", value: 1.45, unit: "倍" }, { name: "ST消費", value: -10, unit: "%" }],
    memo: "共通攻撃ディレイ-5%。通常攻撃ディレイ値とは別パラメータのため、現行予想値には加算しない。"
  },
  "technic-10040": {
    name: "剣闘士の魂", officialTechnicId: 10040, verified: true, applyDefault: true,
    conflictGroup: "attack-delay:normal-attack", stackRule: "latest",
    customEffects: [{ name: "通常攻撃ディレイ", value: -18, unit: "%" }, { name: "ST消費", value: -10, unit: "%" }],
    memo: "通常攻撃ディレイ-18%。通常攻撃ディレイ値とは別パラメータのため、現行予想値には加算しない。"
  },
  "technic-9117": {
    name: "騎士(ザ・ナイト)", officialTechnicId: 9117, verified: true, applyDefault: true,
    aliases: ["騎士（ザ・ナイト）"],
    conflictGroup: "attack-delay:normal-attack", stackRule: "latest",
    customEffects: [{ name: "通常攻撃ディレイ", value: -18, unit: "%" }],
    memo: "通常攻撃ディレイ-18%。通常攻撃ディレイ値とは別パラメータのため、現行予想値には加算しない。"
  },
  "technic-11837": {
    name: "御使い", officialTechnicId: 11837, verified: true, applyDefault: true,
    conflictGroup: "technic-11837", stackRule: "same-technic",
    customEffects: [{ name: "刀剣技ディレイ", value: -15, unit: "%" }, { name: "共通攻撃ディレイ", value: -5, unit: "%" }],
    memo: "刀剣技ディレイ-15%、共通攻撃ディレイ-5%。現行予想値には加算しない。"
  },
  "technic-9605": {
    name: "神速の剣技", officialTechnicId: 9605, verified: true, applyDefault: true,
    conflictGroup: "technic-9605", stackRule: "same-technic",
    customEffects: [{ name: "刀剣技ディレイ", value: -15, unit: "%" }],
    memo: "刀剣技ディレイ-15%。現行予想値には加算しない。"
  },
  "technic-8693": {
    name: "免許皆伝", officialTechnicId: 8693, verified: true, applyDefault: true,
    conflictGroup: "technic-8693", stackRule: "same-technic",
    customEffects: [{ name: "刀剣技ディレイ", value: -15, unit: "%" }, { name: "攻撃・待機・移動モーション変化", value: 0 }],
    memo: "刀剣技ディレイ-15%。攻撃・待機・移動モーションが変化する。現行予想値には加算しない。"
  },
  "technic-9597": {
    name: "弓の名手", officialTechnicId: 9597, verified: true, applyDefault: true,
    conflictGroup: "technic-9597", stackRule: "same-technic",
    customEffects: [{ name: "弓技ディレイ", value: -15, unit: "%" }],
    memo: "弓技ディレイ-15%。現行予想値には加算しない。"
  },
  "technic-12613": {
    name: "疾風奮迅", officialTechnicId: 12613, verified: true, applyDefault: true,
    conflictGroup: "conversion:attack:C", stackRule: "score",
    conversions: { speedToAttackPct: 10 },
    memo: "移動速度の10%を攻撃力へ変換。攻撃力変換C枠。"
  },
  "technic-12004": {
    name: "双魔剣", officialTechnicId: 12004, verified: true, applyDefault: true,
    conflictGroup: "conversion:attack:dual-magic-sword", stackRule: "score",
    conversions: { magicToAttackPct: 5 },
    customEffects: [{ name: "専用技", value: 0, unit: "（双魔連斬）" }],
    memo: "魔力の5%を攻撃力へ変換。独立した攻撃力変換枠。"
  },
  "technic-11265": {
    name: "魔法剣", officialTechnicId: 11265, verified: true, applyDefault: true,
    conflictGroup: "conversion:attack:magic-sword", stackRule: "score",
    conversions: { magicToAttackPct: 30 },
    memo: "魔力の30%を攻撃力へ変換。独立した攻撃力変換枠。WarAgeでは効果なし。"
  },
  "technic-13132": {
    name: "エイシスの青い天使さん", officialTechnicId: 13132, verified: true, applyDefault: true,
    conflictGroup: "conversion:attack:eisis-blue-angel", stackRule: "score",
    conversions: { magicToAttackPct: 30 },
    memo: "魔力の30%を攻撃力へ変換。独立した攻撃力変換枠。鳥系特攻は別途の特攻最新1件ルールに従うため、この変換ルールには混在させない。"
  },
  "technic-8259": {
    name: "鬼神の力", officialTechnicId: 8259, verified: true, applyDefault: true,
    conflictGroup: "special:latest", stackRule: "latest",
    misc: { targetRace: "giant", targetMultiplier: 1.2 },
    memo: "巨人系への特攻1.2倍（暫定）。特攻系は種別を問わず最新1件のみ。"
  },
  "technic-14141": {
    name: "退魔の力", officialTechnicId: 14141, verified: true, applyDefault: true,
    conflictGroup: "special:latest", stackRule: "latest",
    stats: { magicPct: 3 },
    misc: { targetRace: "devil", targetMultiplier: 1.2 },
    memo: "魔力+3%、悪魔系への特攻1.2倍（暫定）。特攻系は種別を問わず最新1件のみ。"
  },
  "technic-6394": {
    name: "キャンプ", officialTechnicId: 6394, verified: true, applyDefault: true,
    conflictGroup: "technic-6394", stackRule: "same-technic",
    stats: { hpRegenPerMinute: 112, stRegenPerMinute: 112, mpRegenPerMinute: 112 },
    customEffects: [{ name: "移動行動不可", value: 0 }],
    memo: "HP・ST・MP自然回復 各112/分。移動行動不可。プライベート テント由来。"
  }
});
