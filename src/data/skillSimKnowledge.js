/*
  skillSimKnowledge.js

  スキルシミュレータ用のマスタリー / テクニック / 魔法データです。

  v1.20.1:
  - マスタリーは、ユーザー提供の MoERead「シップ/複合」HTMLをもとに自前データ化。
  - 1次/2次/3次シップは、同一マスタリー内の tiers として保持します。
  - テクニック/魔法はまだサンプルです。今後、別データとして追加します。

  注意:
  - 外部サイトのコードは転載せず、アップロードされた表から必要な構造データを生成しています。
  - 条件・効果は今後の検証で修正する可能性があります。
*/
(function(){
  "use strict";

  const masteries = [
  {
    "id": "mastery-war",
    "code": "WAR",
    "name": "ウォーリアー / ファイター / ナイト",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ウォーリアー",
        "en": "Warrior"
      },
      {
        "min": 70,
        "name": "ファイター",
        "en": "Fighter"
      },
      {
        "min": 90,
        "name": "ナイト",
        "en": "Knight"
      }
    ],
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40
      },
      {
        "skill": "キック",
        "min": 40
      },
      {
        "skill": "盾",
        "min": 40
      },
      {
        "skill": "戦闘技術",
        "min": 40
      }
    ],
    "effect": "刀剣武器を振るときのディレイが短くなる\nディレイ5％短縮",
    "shipEquipment": "ウォーリアへの果たし状",
    "acquisition": "チュートリアル",
    "transfer": "×",
    "prerequisiteTechniques": [
      "エンデュランス",
      "テンションアップ",
      "ウォークライ",
      "プロテクト ガード",
      "天輪・繚乱の剣",
      "アブソーブ ガード",
      "シバルリー スピリッツ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-alc",
    "code": "ALC",
    "name": "アルケミスト / マスター ウィザード / ウォーロック",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "アルケミスト",
        "en": "Alchemist"
      },
      {
        "min": 70,
        "name": "マスター ウィザード",
        "en": "Master Wizard"
      },
      {
        "min": 90,
        "name": "ウォーロック",
        "en": "Warlock"
      }
    ],
    "requirements": [
      {
        "skill": "破壊魔法",
        "min": 40
      },
      {
        "skill": "回復魔法",
        "min": 40
      },
      {
        "skill": "強化魔法",
        "min": 40
      },
      {
        "skill": "神秘魔法",
        "min": 40
      }
    ],
    "effect": "魔法詠唱速度が速くなる\n全ての魔法の詠唱時間4％・ディレイ6％短縮",
    "shipEquipment": "アルケミストへの試練",
    "acquisition": "チュートリアル",
    "transfer": "×",
    "prerequisiteTechniques": [
      "パル フレア",
      "リフレクト バリア",
      "エナジー チャージ",
      "マジック スプリング",
      "スペル エンハンス",
      "マナ リチャージ",
      "シリアル スペル",
      "ディレイ マジック",
      "マルチプル エンハンス",
      "メルト バースト"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-for",
    "code": "FOR",
    "name": "フォレスター / フォレスト マスター / スカイウォーカー",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "フォレスター",
        "en": "Forester"
      },
      {
        "min": 70,
        "name": "フォレスト マスター",
        "en": "Forest Master"
      },
      {
        "min": 90,
        "name": "スカイウォーカー",
        "en": "Skywalker"
      }
    ],
    "requirements": [
      {
        "skill": "弓",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      },
      {
        "skill": "物まね",
        "min": 40
      },
      {
        "skill": "調教",
        "min": 40
      }
    ],
    "effect": "弓攻撃の発射間隔が短くなる\nディレイ5％短縮",
    "shipEquipment": "フォレスターへの一矢",
    "acquisition": "チュートリアル",
    "transfer": "×",
    "prerequisiteTechniques": [
      "アロー レイン",
      "ヒドゥン ショット",
      "刈り払い",
      "リバイバル ソウル",
      "クイック アロー"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-nec",
    "code": "NEC",
    "name": "ネクロマンサー / ダーク プリースト / シャドウ ナイト",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ネクロマンサー",
        "en": "Necromancer"
      },
      {
        "min": 70,
        "name": "ダーク プリースト",
        "en": "Dark Priest"
      },
      {
        "min": 90,
        "name": "シャドウ ナイト",
        "en": "Shadow Knight"
      }
    ],
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 40
      },
      {
        "skill": "死の魔法",
        "min": 40
      },
      {
        "skill": "牙",
        "min": 40
      },
      {
        "skill": "暗黒命令",
        "min": 40
      }
    ],
    "effect": "召喚魔法の詠唱時間が短縮される\n召喚魔法の詠唱時間・ディレイ5％短縮",
    "shipEquipment": "ネクロマンサーへの実験",
    "acquisition": "チュートリアル",
    "transfer": "×",
    "prerequisiteTechniques": [
      "サモン ストロング ゾンビ",
      "ナイト オブ カース",
      "サモン ドラゴン ゾンビ",
      "ネガティブ バースト",
      "サモン ガシャドクロ",
      "ディメンター ソウル",
      "ダーク ディメンション",
      "サモン ヘッドレス ナイト",
      "残夜の黒翼",
      "ソウル スレイブ",
      "ブラッド ムーン",
      "ベノム インフェルノ",
      "反魂の秘術",
      "地獄の祭壇",
      "サモン プロセルピナ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-cre",
    "code": "CRE",
    "name": "クリエイター / マスター クリエイター / ジェネシス",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "クリエイター",
        "en": "Creator"
      },
      {
        "min": 70,
        "name": "マスター クリエイター",
        "en": "Master Creator"
      },
      {
        "min": 90,
        "name": "ジェネシス",
        "en": "Genesis"
      }
    ],
    "requirements": [
      {
        "skill": "鍛冶",
        "min": 40
      },
      {
        "skill": "木工",
        "min": 40
      },
      {
        "skill": "伐採",
        "min": 40
      },
      {
        "skill": "採掘",
        "min": 40
      }
    ],
    "effect": "合成アクションゲージの移動速度が遅くなる\n鍛治と木工のゲージ速度-10",
    "shipEquipment": "未来生み出す、創造主へ",
    "acquisition": "チュートリアル",
    "transfer": "×",
    "prerequisiteTechniques": [
      "エキスパート センス",
      "サモン アプレンティス"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-bom",
    "code": "BOM",
    "name": "爆弾男 / 爆弾女 / 超爆弾男 / 超爆弾女 / ボンバーキング / ボンバークイーン",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "爆弾男 / 爆弾女",
        "en": "Bomberman"
      },
      {
        "min": 70,
        "name": "超爆弾男 / 超爆弾女",
        "en": "Super Bomberman"
      },
      {
        "min": 90,
        "name": "ボンバーキング / ボンバークイーン",
        "en": "Bomber King / Bomber Queen"
      }
    ],
    "requirements": [
      {
        "skill": "罠",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      },
      {
        "skill": "持久力",
        "min": 40
      },
      {
        "skill": "物まね",
        "min": 40
      }
    ],
    "effect": "罠の設置間隔が短くなる\nディレイ5％短縮",
    "shipEquipment": "爆弾男への一歩",
    "acquisition": "【朝露の芽】への一矢",
    "transfer": "○",
    "prerequisiteTechniques": [
      "ボンバー エクスプロージョン",
      "クロスファイアー ボム",
      "グラウンド ゼロ",
      "リモコン爆弾",
      "パンプキン ボム",
      "エアリアル ボミング"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-bre",
    "code": "BRE",
    "name": "ブリーダー / ブリード マスター / ブリード ロード",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ブリーダー",
        "en": "Breeder"
      },
      {
        "min": 70,
        "name": "ブリード マスター",
        "en": "Breed Master"
      },
      {
        "min": 90,
        "name": "ブリード ロード",
        "en": "Breed Lord"
      }
    ],
    "requirements": [
      {
        "skill": "取引",
        "min": 40
      },
      {
        "skill": "料理",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      },
      {
        "skill": "調教",
        "min": 40
      }
    ],
    "effect": "ペットの経験値がペットウインドウに表示されるようになる\n調教スキルの技のディレイが短くなる\n連れているペットの取得経験値が少し増える\nディレイ5％短縮、取得経験値+20%",
    "shipEquipment": "未実装",
    "acquisition": "【一粒の種】への一矢",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ブリーディング ウィップ",
      "エリア チェリッシング",
      "ひよこ鑑定",
      "トリミング ケア",
      "リバイバルソウル"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-tem",
    "code": "TEM",
    "name": "テンプルナイト / パラディン / セイクリッドロード",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "テンプルナイト",
        "en": "Temple Knight"
      },
      {
        "min": 70,
        "name": "パラディン",
        "en": "Paladin"
      },
      {
        "min": 90,
        "name": "セイクリッドロード",
        "en": "Sacred Lord"
      }
    ],
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 40
      },
      {
        "skill": "神秘魔法",
        "min": 40
      },
      {
        "skill": "こんぼう",
        "min": 40
      },
      {
        "skill": "戦闘技術",
        "min": 40
      },
      {
        "skill": "集中力",
        "min": 40
      }
    ],
    "effect": "アンデッド系に追加ダメージ\nエンチャント魔法の特性\nに準拠。20ダメージ程度\n右手にFzBエフェクト。命中するとLBのエフェクト\nブレイド系と併用できない。ブレイド系に常に上書きされる",
    "shipEquipment": "テンプルナイトへの試練",
    "acquisition": "あわく光る、白き願い",
    "transfer": "○",
    "prerequisiteTechniques": [
      "シャイニング フォース",
      "サクリファイス リザレクション",
      "神の雷",
      "ゴッド ハンマー",
      "ゴッド ブレス",
      "ヘブンズ ジャッジメント"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-dru",
    "code": "DRU",
    "name": "ドルイド / マスター ドルイド / ドルイド キング / ドルイド クイーン",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ドルイド",
        "en": "Druid"
      },
      {
        "min": 70,
        "name": "マスター ドルイド",
        "en": "Master Druid"
      },
      {
        "min": 90,
        "name": "ドルイド キング / ドルイド クイーン",
        "en": "Druid King / Druid Queen"
      }
    ],
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      },
      {
        "skill": "魔法熟練",
        "min": 40
      },
      {
        "skill": "暗黒命令",
        "min": 40
      }
    ],
    "effect": "毒にかかった時、自動で解毒される\n毒系のDoTのみ",
    "shipEquipment": "知識溢れる 祭司への試練",
    "acquisition": "【祝されし者】への挑戦\nウォーター ウンディーネ\nThe Legend of Duelist\n忍者\n御庭番",
    "transfer": "×",
    "prerequisiteTechniques": [
      "グローイング ツリー",
      "アシッド レイン",
      "フォース オブ ネイチャー",
      "スノー ストーム",
      "桜花の魔鏡"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-sag",
    "code": "SAG",
    "name": "紺碧の賢者 / 深緋の賢者 / 白銀の賢者",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "紺碧の賢者",
        "en": "Sage of Cerulean"
      },
      {
        "min": 70,
        "name": "深緋の賢者",
        "en": "Sage of Scarlet"
      },
      {
        "min": 90,
        "name": "白銀の賢者",
        "en": "Sage of Silver"
      }
    ],
    "requirements": [
      {
        "skill": "破壊魔法",
        "min": 40
      },
      {
        "skill": "回復魔法",
        "min": 40
      },
      {
        "skill": "強化魔法",
        "min": 40
      },
      {
        "skill": "神秘魔法",
        "min": 40
      },
      {
        "skill": "召喚魔法",
        "min": 40
      },
      {
        "skill": "死の魔法",
        "min": 40
      }
    ],
    "effect": "詠唱中の移動速度が速くなる\nモーションが、賢者風になる\n※モーションは、男性キャラ限定\n詠唱中の速度移動+40％",
    "shipEquipment": "紺碧の賢者への試練",
    "acquisition": "【入門者】への試練",
    "transfer": "×",
    "prerequisiteTechniques": [
      "マジック ドレイン",
      "リザレクション オール",
      "シリアル スペル",
      "アルティメット バースト",
      "サモン プロセルピナ",
      "紅き援軍要請",
      "蒼き援軍要請"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-gre",
    "code": "GRE",
    "name": "グレート クリエイター / クリエイト ロード / 人間国宝",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "グレート クリエイター",
        "en": "Great Creator"
      },
      {
        "min": 70,
        "name": "クリエイト ロード",
        "en": "Create Lord"
      },
      {
        "min": 90,
        "name": "人間国宝",
        "en": "Living Treasure"
      }
    ],
    "requirements": [
      {
        "skill": "鍛冶",
        "min": 40
      },
      {
        "skill": "木工",
        "min": 40
      },
      {
        "skill": "裁縫",
        "min": 40
      },
      {
        "skill": "薬調合",
        "min": 40
      },
      {
        "skill": "装飾細工",
        "min": 40
      },
      {
        "skill": "料理",
        "min": 40
      },
      {
        "skill": "複製",
        "min": 40
      },
      {
        "skill": "醸造",
        "min": 40
      }
    ],
    "effect": "所持可能重量が増加する\nグレードの高い合成品を作成しやすくなります。\n最大重量+20、全生産のグレードゾーン+1",
    "shipEquipment": "未来切り開く、創造主へ",
    "acquisition": "【砕石の槌】への要務\n【紡ぎ手】への課題\n【見習い】への注文",
    "transfer": "×",
    "prerequisiteTechniques": [
      "鳥獣戯画",
      "マスプロダクション"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-mer",
    "code": "MER",
    "name": "傭兵 / ヒットマン / ゴッドファーザー",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "傭兵",
        "en": "Mercenary"
      },
      {
        "min": 70,
        "name": "ヒットマン",
        "en": "Hitman"
      },
      {
        "min": 90,
        "name": "ゴッドファーザー",
        "en": "Godfather"
      }
    ],
    "requirements": [
      {
        "skill": "銃器",
        "min": 40
      },
      {
        "skill": "罠",
        "min": 40
      },
      {
        "skill": "物まね",
        "min": 40
      },
      {
        "skill": "戦闘技術",
        "min": 40
      },
      {
        "skill": "料理",
        "min": 40
      }
    ],
    "effect": "所持可能重量が増加する、攻撃ディレイが少し短くなる\n最大重量+10\n210525パッチ\nにて攻撃ディレイ-3が追加",
    "shipEquipment": "傭兵装備 取得作戦",
    "acquisition": "【無刀】への果たし状",
    "transfer": "×",
    "prerequisiteTechniques": [
      "スナイパー ショット",
      "グレネード ブラスト",
      "リコール トイソルジャー",
      "マシンガン プレイスメント",
      "リコール アンダーリング",
      "パンプキン ボム"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-sam",
    "code": "SAM",
    "name": "サムライ / サムライ マスター / 将軍",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "サムライ",
        "en": "Samurai"
      },
      {
        "min": 70,
        "name": "サムライ マスター",
        "en": "Samurai Master"
      },
      {
        "min": 90,
        "name": "将軍",
        "en": "Shogun"
      }
    ],
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40
      },
      {
        "skill": "戦闘技術",
        "min": 40
      },
      {
        "skill": "攻撃回避",
        "min": 40
      },
      {
        "skill": "筋力",
        "min": 40
      },
      {
        "skill": "包帯",
        "min": 40
      },
      {
        "skill": "精神力",
        "min": 40
      }
    ],
    "effect": "二刀流による攻撃が可能になる。\n左手に刀剣武器を装備している必要があります。\n詳しくは\n下記\n参照",
    "shipEquipment": "剣の道を極める一歩",
    "acquisition": "【木刀】への果たし状\n異国の剣士",
    "transfer": "×",
    "prerequisiteTechniques": [
      "牙斬",
      "乱れ桜",
      "居合斬り",
      "天輪・繚乱の剣",
      "桜花一閃",
      "燕返し",
      "弧月破斬",
      "堅守の太刀"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-min",
    "code": "MIN",
    "name": "マイン ビショップ / メタル ビショップ / フルメタル ビショップ",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "マイン ビショップ",
        "en": "Mine Bishop"
      },
      {
        "min": 70,
        "name": "メタル ビショップ",
        "en": "Metal Bishop"
      },
      {
        "min": 90,
        "name": "フルメタル ビショップ",
        "en": "Full Metal Bishop"
      }
    ],
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 40
      },
      {
        "skill": "魔法熟練",
        "min": 40
      },
      {
        "skill": "召喚魔法",
        "min": 40
      },
      {
        "skill": "鍛冶",
        "min": 40
      }
    ],
    "effect": "グレードの高い合成品を作成しやすくなる\n鍛治のグレードゾーン+2.2",
    "shipEquipment": "[マインビショップ]への要務",
    "acquisition": "【粗金の槌】への要務",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ロック ミミック",
      "サモン マイナーズ",
      "サモン ブラスト ファーネス"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-kit",
    "code": "KIT",
    "name": "厨房師 / マスター厨房師 / ゴッド厨房師",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "厨房師",
        "en": "Kitchen Master"
      },
      {
        "min": 70,
        "name": "マスター厨房師",
        "en": "True Kitchen Master"
      },
      {
        "min": 90,
        "name": "ゴッド厨房師",
        "en": "God Kitchen Master"
      }
    ],
    "requirements": [
      {
        "skill": "料理",
        "min": 40
      },
      {
        "skill": "醸造",
        "min": 40
      }
    ],
    "effect": "料理と醸造の合成成功率が上昇する\n料理と醸造のヒットゾーン+1",
    "shipEquipment": "厨房師へのオーダー",
    "acquisition": "【皿洗い】への注文",
    "transfer": "×",
    "prerequisiteTechniques": [
      "トリプル フィレッツ",
      "サモン ジンジャーブレッドマン",
      "サモン チョコ キャット",
      "フランバージュ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-ass",
    "code": "ASS",
    "name": "アサシン / 忍者 / 御庭番",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "アサシン",
        "en": "Assassin"
      },
      {
        "min": 70,
        "name": "忍者",
        "en": "Ninja"
      },
      {
        "min": 90,
        "name": "御庭番",
        "en": "Oniwaban"
      }
    ],
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40
      },
      {
        "skill": "罠",
        "min": 40
      },
      {
        "skill": "物まね",
        "min": 40
      },
      {
        "skill": "投げ",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      },
      {
        "skill": "薬調合",
        "min": 40
      },
      {
        "skill": "落下耐性",
        "min": 40
      }
    ],
    "effect": "傾斜に対して垂直に立つ事が可能\n移動速度やクリティカル発生率が上昇する\n移動速度6％、クリティカル発生率10％上昇",
    "shipEquipment": "忍ぶ衣は、金貨と共に",
    "acquisition": "白き、望",
    "transfer": "○",
    "prerequisiteTechniques": [
      "霧隠れの術",
      "火遁の術",
      "エア ジャンプ",
      "木ノ葉風陣の術",
      "アサシネイト",
      "インファリブル スロウ",
      "水遁の術",
      "炎遁の術",
      "石化の術",
      "勇健の術",
      "風魔手裏剣",
      "兵糧丸",
      "パンプキン ボム"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-sea",
    "code": "SEA",
    "name": "海戦士 / 英雄海戦士 / 海王",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "海戦士",
        "en": "Sea Fighter"
      },
      {
        "min": 70,
        "name": "英雄海戦士",
        "en": "Sea Hero"
      },
      {
        "min": 90,
        "name": "海王",
        "en": "Sea King"
      }
    ],
    "requirements": [
      {
        "skill": "水泳",
        "min": 40
      },
      {
        "skill": "槍",
        "min": 40
      },
      {
        "skill": "料理",
        "min": 40
      },
      {
        "skill": "釣り",
        "min": 40
      },
      {
        "skill": "取引",
        "min": 40
      }
    ],
    "effect": "槍攻撃の間隔が短くなる\nディレイ5％短縮\n泳ぎ速度+17",
    "shipEquipment": "熱くたぎる、海の誓い",
    "acquisition": "旅人と、にっこり",
    "transfer": "○",
    "prerequisiteTechniques": [
      "ウォーター ストリーム",
      "キャッチ ターゲット",
      "サモン バディ",
      "サモン クラーケン",
      "ネプチューン スキン",
      "鮪型魚雷",
      "オーシャン ストリーム"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-bra",
    "code": "BRA",
    "name": "ブレイブナイト / アーマーナイト / ジャスティス タンク",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ブレイブナイト",
        "en": "Brave Knight"
      },
      {
        "min": 70,
        "name": "アーマーナイト",
        "en": "Armor Knight"
      },
      {
        "min": 90,
        "name": "ジャスティス タンク",
        "en": "Justice Tank"
      }
    ],
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 40
      },
      {
        "skill": "こんぼう",
        "min": 40
      },
      {
        "skill": "盾",
        "min": 40
      },
      {
        "skill": "着こなし",
        "min": 40
      }
    ],
    "effect": "防御力が増加する\n防御力+5",
    "shipEquipment": "ブレイブナイトへの果たし状",
    "acquisition": "白・抱・望",
    "transfer": "○",
    "prerequisiteTechniques": [
      "アトラクト",
      "エンデュランス",
      "テンションアップ",
      "プロテクト ガード",
      "かばう",
      "アブソーブ ガード",
      "フォートレス",
      "シバルリー スピリッツ",
      "キャッスル オブ ストーン",
      "ショルダー チャージ",
      "ハードネス ストライク",
      "リバーサル エナジー",
      "フォース プロヴォーク"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-evi",
    "code": "EVI",
    "name": "イビルナイト / デスナイト / ヘルナイト",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "イビルナイト",
        "en": "Evil Knight"
      },
      {
        "min": 70,
        "name": "デスナイト",
        "en": "Death Knight"
      },
      {
        "min": 90,
        "name": "ヘルナイト",
        "en": "Hell Knight"
      }
    ],
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40
      },
      {
        "skill": "牙",
        "min": 40
      },
      {
        "skill": "死の魔法",
        "min": 40
      }
    ],
    "effect": "死の魔法の詠唱スピードが速くなる\n死の魔法の詠唱時間・ディレイ6％短縮",
    "shipEquipment": "イビルナイトへの実験",
    "acquisition": "【夕闇】への実験",
    "transfer": "○",
    "prerequisiteTechniques": [
      "ダークネス フォース",
      "ライフ ドレイン",
      "ネガティブ バースト",
      "ダーク ディメンション",
      "残夜の黒翼",
      "カラミティ フォース",
      "ブラッド カーニバル"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-cos",
    "code": "COS",
    "name": "コスプレイヤー / コスプレヒーロー / コスプレヒロイン / ヒーロー / ヒロイン",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "コスプレイヤー",
        "en": "Cos Player"
      },
      {
        "min": 70,
        "name": "コスプレヒーロー / コスプレヒロイン",
        "en": "Cos Play Hero / Cos Play Heroine"
      },
      {
        "min": 90,
        "name": "ヒーロー / ヒロイン",
        "en": "Hero / Heroine"
      }
    ],
    "requirements": [
      {
        "skill": "装飾細工",
        "min": 40
      },
      {
        "skill": "裁縫",
        "min": 40
      },
      {
        "skill": "着こなし",
        "min": 40
      },
      {
        "skill": "物まね",
        "min": 40
      },
      {
        "skill": "攻撃回避",
        "min": 40
      },
      {
        "skill": "パフォーマンス",
        "min": 40
      }
    ],
    "effect": "全てのシップ専用アイテムが装備できる\n詳しくは\n下記\n参照",
    "shipEquipment": "未実装",
    "acquisition": "【織り手】への課題\nウォーター ウンディーネ\nステンノ　忍者　宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "フィニッシング エンド スパーク",
      "ファイナル アルティメット ヒーロー ビーム"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-dab",
    "code": "DAB",
    "name": "物好き / ネタ師変人 / 神ネタ師",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "物好き",
        "en": "Dabster"
      },
      {
        "min": 70,
        "name": "ネタ師変人",
        "en": "Spooky"
      },
      {
        "min": 90,
        "name": "神ネタ師",
        "en": "Spooky Lord"
      }
    ],
    "requirements": [
      {
        "skill": "水泳",
        "min": 40
      },
      {
        "skill": "収穫",
        "min": 40
      },
      {
        "skill": "酩酊",
        "min": 40
      },
      {
        "skill": "落下耐性",
        "min": 40
      },
      {
        "skill": "パフォーマンス",
        "min": 40
      }
    ],
    "effect": "移動と待機モーションが、傷ついた戦士のモーションに変わる\n（男性限定）\n、移動できない技も移動しながら使用できる\n210525パッチ\nにて常時SoWが追加。\n女性キャラでも効果あり",
    "shipEquipment": "未実装",
    "acquisition": "ウォーター ウンディーネ\nThe Legend of Duelist\nステンノ　忍者　宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ウォーター アート"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-ath",
    "code": "ATH",
    "name": "アスリート / トライアスリート / 鉄人",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "アスリート",
        "en": "Athlete"
      },
      {
        "min": 70,
        "name": "トライアスリート",
        "en": "Triathlete"
      },
      {
        "min": 90,
        "name": "鉄人",
        "en": "Ironman"
      }
    ],
    "requirements": [
      {
        "skill": "落下耐性",
        "min": 40
      },
      {
        "skill": "水泳",
        "min": 40
      },
      {
        "skill": "自然調和",
        "min": 40
      }
    ],
    "effect": "自然スタミナ回復速度が速くなる\n秒間0.83回復(1分で50相当)",
    "shipEquipment": "走れ、金メダルへの道",
    "acquisition": "【新緑の木】への一矢\nウォーター ウンディーネ\nThe Legend of Duelist\nステンノ　宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "エア ジャンプ",
      "ハイパー ジャンプ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-dkf",
    "code": "DKF",
    "name": "酔拳士 / 酔拳マスター / 酔拳聖",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "酔拳士",
        "en": "Drunken Fighter"
      },
      {
        "min": 70,
        "name": "酔拳マスター",
        "en": "Drunken Master"
      },
      {
        "min": 90,
        "name": "酔拳聖",
        "en": "Drunken Lord"
      }
    ],
    "requirements": [
      {
        "skill": "素手",
        "min": 40
      },
      {
        "skill": "キック",
        "min": 40
      },
      {
        "skill": "酩酊",
        "min": 40
      },
      {
        "skill": "攻撃回避",
        "min": 40
      },
      {
        "skill": "持久力",
        "min": 40
      }
    ],
    "effect": "(通常)回避が上昇し、待機状態\nと戦闘体勢\nが酔いモーションに変わる\n(酔歩)回避が上昇し、待機状態と移動が酔いモーションに変わる\n回避+3",
    "shipEquipment": "酒の力で敵を討て\n宝箱",
    "acquisition": "ウォーター ウンディーネ\nThe Legend of Duelist\nメモリーズ ボックス(酔歩)\n*1",
    "transfer": "×",
    "prerequisiteTechniques": [
      "酔避連撃",
      "練気弾",
      "オーラ ナックル",
      "飛燕脚"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-row",
    "code": "ROW",
    "name": "荒くれ者 / レスラー / チャンピオン",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "荒くれ者",
        "en": "Rowdy"
      },
      {
        "min": 70,
        "name": "レスラー",
        "en": "Wrestler"
      },
      {
        "min": 90,
        "name": "チャンピオン",
        "en": "Champion"
      }
    ],
    "requirements": [
      {
        "skill": "素手",
        "min": 40
      },
      {
        "skill": "キック",
        "min": 40
      },
      {
        "skill": "落下耐性",
        "min": 40
      },
      {
        "skill": "生命力",
        "min": 40
      },
      {
        "skill": "パフォーマンス",
        "min": 40
      }
    ],
    "effect": "ヒット・ポイント(HP)の回復速度が速くなる\n秒間0.66回復(1分で40相当)",
    "shipEquipment": "荒くれし者よ イチバンを目指せ",
    "acquisition": "【鉄刀】への挑戦\nウォーター ウンディーネ\nステンノ\nダイアロス チャンピオン",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ギャラクシー ダイナマイト キック",
      "フィニッシング エンド",
      "ファンタスティック ボディ",
      "バックハンド チョップ",
      "オーラ ナックル",
      "毒霧",
      "フライング ボディプレス",
      "ジャンピング ヒップ アタック",
      "飛燕脚",
      "酔拳"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-idl",
    "code": "IDL",
    "name": "新人アイドル / ビスクアイドル / ダイアロスアイドル",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "新人アイドル",
        "en": "New Idol"
      },
      {
        "min": 70,
        "name": "ビスクアイドル",
        "en": "Bisque Idol"
      },
      {
        "min": 90,
        "name": "ダイアロスアイドル",
        "en": "Diaros Idol"
      }
    ],
    "requirements": [
      {
        "skill": "ダンス",
        "min": 40
      },
      {
        "skill": "音楽",
        "min": 40
      },
      {
        "skill": "水泳",
        "min": 40
      },
      {
        "skill": "パフォーマンス",
        "min": 40
      }
    ],
    "effect": "体の周りがキラキラ輝く\nオールドアイドルの場合、常時インヴィジビリティ詠唱エフェクトが発生",
    "shipEquipment": "君だけの、アイドル衣装！",
    "acquisition": "【フレッシュアイドル】への道\nウォーター ウンディーネ\nステンノ　宝箱\n複製(オールド)\n*2",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ライブ ステージ",
      "ファッシネイト キッス",
      "スモーク マシーン"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-hou",
    "code": "HOU",
    "name": "ハウスキーパー / メイド(お手伝い) / バレット(従者) / アビゲイル(侍女) / バトラー(執事)",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ハウスキーパー",
        "en": "House Keeper"
      },
      {
        "min": 70,
        "name": "メイド(お手伝い) / バレット(従者)",
        "en": "Maid / Valet"
      },
      {
        "min": 90,
        "name": "アビゲイル(侍女) / バトラー(執事)",
        "en": "Abigail / Butler"
      }
    ],
    "requirements": [
      {
        "skill": "料理",
        "min": 40
      },
      {
        "skill": "裁縫",
        "min": 40
      },
      {
        "skill": "美容",
        "min": 40
      }
    ],
    "effect": "裁縫合成の成功率が上昇\n裁縫の滑り減少、ヒットゾーン+5",
    "shipEquipment": "仕える心は、[ハウスキーパー]の証",
    "acquisition": "ウォーター ウンディーネ\nステンノ\n忍者\n宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "エリア クリーニング"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-adv",
    "code": "ADV",
    "name": "アドベンチャラー / エクスプローラー / トレジャーハンター",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "アドベンチャラー",
        "en": "Adventurer"
      },
      {
        "min": 70,
        "name": "エクスプローラー",
        "en": "Explorer"
      },
      {
        "min": 90,
        "name": "トレジャーハンター",
        "en": "Treasure Hunter"
      }
    ],
    "requirements": [
      {
        "skill": "落下耐性",
        "min": 40
      },
      {
        "skill": "水泳",
        "min": 40
      },
      {
        "skill": "採掘",
        "min": 40
      },
      {
        "skill": "解読",
        "min": 40
      },
      {
        "skill": "盗み",
        "min": 40
      }
    ],
    "effect": "水中移動速度が上昇し 落下ダメージが軽減される\n泳ぎ速度+6、落下ダメージ-10％",
    "shipEquipment": "未実装",
    "acquisition": "ウォーター ウンディーネ\n忍者\n宝箱",
    "transfer": "",
    "prerequisiteTechniques": [
      "タイダウン ローピング",
      "シークレット シーフ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-spy",
    "code": "SPY",
    "name": "スパイ / ストーカー / ステルス",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "スパイ",
        "en": "Spy"
      },
      {
        "min": 70,
        "name": "ストーカー",
        "en": "Stalker"
      },
      {
        "min": 90,
        "name": "ステルス",
        "en": "Stealth"
      }
    ],
    "requirements": [
      {
        "skill": "物まね",
        "min": 40
      },
      {
        "skill": "投げ",
        "min": 40
      },
      {
        "skill": "盗み",
        "min": 40
      }
    ],
    "effect": "盗み確率が上昇する",
    "shipEquipment": "未実装",
    "acquisition": "ウォーター ウンディーネ\n忍者\n宝箱",
    "transfer": "",
    "prerequisiteTechniques": [
      "シークレット シーフ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-yan",
    "code": "YAN",
    "name": "レディース / チンピラ / アウトロー / ギャング",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "レディース / チンピラ",
        "en": "Ladies' / Punk"
      },
      {
        "min": 70,
        "name": "アウトロー",
        "en": "Outlaw"
      },
      {
        "min": 90,
        "name": "ギャング",
        "en": "Gang"
      }
    ],
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 40
      },
      {
        "skill": "取引",
        "min": 40
      },
      {
        "skill": "盗み",
        "min": 40
      },
      {
        "skill": "酩酊",
        "min": 40
      }
    ],
    "effect": "棍棒武器を振る時のディレイが短くなる\nディレイ5％短縮",
    "shipEquipment": "未実装",
    "acquisition": "ウォーター ウンディーネ\n忍者\n宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ヤンキー ウェイ",
      "グレア アイ",
      "リコール アンダーリング"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-tea",
    "code": "TEA",
    "name": "アカデミアン / ティーチャー / プロフェッサー",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "アカデミアン",
        "en": "Academian"
      },
      {
        "min": 70,
        "name": "ティーチャー",
        "en": "Teacher"
      },
      {
        "min": 90,
        "name": "プロフェッサー",
        "en": "Professor"
      }
    ],
    "requirements": [
      {
        "skill": "解読",
        "min": 40
      },
      {
        "skill": "複製",
        "min": 40
      },
      {
        "skill": "集中力",
        "min": 40
      },
      {
        "skill": "神秘魔法",
        "min": 40
      },
      {
        "skill": "精神力",
        "min": 40
      }
    ],
    "effect": "複製スキルの合成成功率が上昇する\n複製ヒットゾーン+5、グレードゾーン+1",
    "shipEquipment": "未実装",
    "acquisition": "ウォーター ウンディーネ\n御庭番\nステンノ　宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "未実装"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-bbd",
    "code": "BBD",
    "name": "ブラッドバード / ドレッドバード / カオスバード",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "ブラッドバード",
        "en": "Blood Bard"
      },
      {
        "min": 70,
        "name": "ドレッドバード",
        "en": "Dread Bard"
      },
      {
        "min": 90,
        "name": "カオスバード",
        "en": "Chaos Bard"
      }
    ],
    "requirements": [
      {
        "skill": "持久力",
        "min": 40
      },
      {
        "skill": "牙",
        "min": 40
      },
      {
        "skill": "音楽",
        "min": 40
      }
    ],
    "effect": "音楽スキル・シャウトスキルの詠唱速度が上昇する\n音楽スキルの効果が上昇し、シャウトスキルの詠唱速度が短縮される\nシャウトのみ詠唱時間5％短縮・ディレイ5％短縮\n音楽は短縮されない\n210525パッチ\nにて効果の出ていなかった音楽短縮を廃止し、音楽効果アップ+？に変更",
    "shipEquipment": "未実装",
    "acquisition": "【スイートアイドル】への道\nウォーター ウンディーネ\nピクシー シャドウ\n宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "ヴァンパイア ノクターン",
      "リコール オーディエンス"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-due",
    "code": "DUE",
    "name": "デュエリスト / レガトゥス / タイラント",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "デュエリスト",
        "en": "Duelist"
      },
      {
        "min": 70,
        "name": "レガトゥス",
        "en": "Legatus"
      },
      {
        "min": 90,
        "name": "タイラント",
        "en": "Tyrant"
      }
    ],
    "requirements": [
      {
        "skill": "槍",
        "min": 40
      },
      {
        "skill": "筋力",
        "min": 40
      },
      {
        "skill": "着こなし",
        "min": 40
      }
    ],
    "effect": "攻撃力が上昇する\n攻撃力+3",
    "shipEquipment": "闘う覚悟 己の力で成し遂げよ",
    "acquisition": "ウォーター ウンディーネ\n宝箱",
    "transfer": "×",
    "prerequisiteTechniques": [
      "モラール ブースター",
      "ブレイン ブレイカー",
      "ガード レイジ"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-col",
    "code": "COL",
    "name": "コレクター / コレクト マスター / 採集王",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "コレクター",
        "en": "Collector"
      },
      {
        "min": 70,
        "name": "コレクト マスター",
        "en": "???"
      },
      {
        "min": 90,
        "name": "採集王",
        "en": "???"
      }
    ],
    "requirements": [
      {
        "skill": "採掘",
        "min": 40
      },
      {
        "skill": "伐採",
        "min": 40
      },
      {
        "skill": "収穫",
        "min": 40
      },
      {
        "skill": "釣り",
        "min": 40
      }
    ],
    "effect": "スタミナの最大値と最大重量が増加する\n最大スタミナ+10、最大重量+10",
    "shipEquipment": "未実装",
    "acquisition": "宝箱",
    "transfer": "？",
    "prerequisiteTechniques": [
      "未実装"
    ],
    "source": "MoERead シップ/複合"
  },
  {
    "id": "mastery-elm",
    "code": "ELM",
    "name": "エレメンタルナイト / エレメンタルマスター / エレメンタルロード",
    "category": "複合シップ",
    "kind": "マスタリー",
    "tiers": [
      {
        "min": 40,
        "name": "エレメンタルナイト",
        "en": "Elemental Knight"
      },
      {
        "min": 70,
        "name": "エレメンタルマスター",
        "en": "???"
      },
      {
        "min": 90,
        "name": "エレメンタルロード",
        "en": "???"
      }
    ],
    "requirements": [
      {
        "skill": "槍",
        "min": 40
      },
      {
        "skill": "強化魔法",
        "min": 40
      },
      {
        "skill": "召喚魔法",
        "min": 40
      },
      {
        "skill": "攻撃回避",
        "min": 40
      }
    ],
    "effect": "耐火・水・風・地属性が上昇する\n各属性抵抗+10",
    "shipEquipment": "未実装",
    "acquisition": "ヘントリ",
    "transfer": "？",
    "prerequisiteTechniques": [
      "リコール マーシー ライトⅡ",
      "セルフ ブローバック",
      "リコール ユナイト エレメンタル",
      "ファイア エレメンタル バレット",
      "アクア エレメンタル バレット",
      "ウインド エレメンタル バレット",
      "アース エレメンタル バレット",
      "フォース シールド",
      "エレメント シールド",
      "シュートアロー"
    ],
    "source": "MoERead シップ/複合"
  }
];

  const techniques = [
    {
      id: "tech-kicker",
      name: "サイド キック",
      category: "キック",
      kind: "テクニック",
      requirements: [{skill:"キック", min:20}],
      successSkill: "キック",
      successRequired: 20,
      note: "サンプル。"
    },
    {
      id: "tech-shield-guard",
      name: "シールド ガード",
      category: "盾",
      kind: "テクニック",
      requirements: [{skill:"盾", min:10}],
      successSkill: "盾",
      successRequired: 10,
      note: "サンプル。"
    },
    {
      id: "tech-berserk",
      name: "バーサーク",
      category: "戦闘技術",
      kind: "テクニック",
      requirements: [{skill:"戦闘技術", min:40}],
      successSkill: "戦闘技術",
      successRequired: 40,
      note: "サンプル。"
    },
    {
      id: "tech-cannon",
      name: "キャノン ディスチャージ",
      category: "銃器",
      kind: "テクニック",
      requirements: [{skill:"銃器", min:90}],
      successSkill: "銃器",
      successRequired: 90,
      note: "サンプル。"
    }
  ];

  const magic = [
    {
      id: "magic-minor-burst",
      name: "マイナー バースト",
      category: "破壊魔法",
      kind: "魔法",
      requirements: [{skill:"破壊魔法", min:1}],
      successSkill: "破壊魔法",
      successRequired: 1,
      mp: 5,
      reagent: "ノア ダスト",
      note: "サンプル。"
    },
    {
      id: "magic-healing",
      name: "ヒーリング",
      category: "回復魔法",
      kind: "魔法",
      requirements: [{skill:"回復魔法", min:10}],
      successSkill: "回復魔法",
      successRequired: 10,
      mp: 9,
      reagent: "ノア ダスト",
      note: "サンプル。"
    },
    {
      id: "magic-buff",
      name: "エンライテン",
      category: "強化魔法",
      kind: "魔法",
      requirements: [{skill:"強化魔法", min:20}],
      successSkill: "強化魔法",
      successRequired: 20,
      mp: 11,
      reagent: "ノア ダスト",
      note: "サンプル。"
    },
    {
      id: "magic-mesmerize",
      name: "メスメライズ",
      category: "神秘魔法",
      kind: "魔法",
      requirements: [{skill:"神秘魔法", min:40}],
      successSkill: "神秘魔法",
      successRequired: 40,
      mp: 23,
      reagent: "ノア パウダー",
      note: "サンプル。"
    }
  ];

  window.MOE_SKILL_SIM_KNOWLEDGE = {
    masteries,
    techniques,
    magic,
    source: {
      masteries: "MoERead シップ/複合",
      url: "https://moeread.stars.ne.jp/?シップ/複合"
    }
  };
})();
