/*
  skillSimKnowledge.js

  v1.20.9:
  - 盗み、複合技、特殊技を追加投入。
  - 表内テクニックのみを取り込み、短評セクションや関連テクニック欄は取り込まない。
  - 複合技は Skill 欄から複数必要スキルを解析して requirements に保持。
  - 魔法データはまだサンプルです。
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
    "id": "tech-76c0a472f3-e0c6e51574-20",
    "name": "チャージド ブラント",
    "kind": "テクニック",
    "category": "こんぼう",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 20
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "170\n(78-84)",
    "delay": "1100",
    "description": "力を溜めて敵を激しく叩きつけることにより\nガード技を無視してダメージを貫通させる\n※成功すると 敵をスタンさせることができる\nガードブレイク技\n※スタン中は被ダメージ1割減",
    "transfer": "×",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード\nバルカーガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A4%B3%A4%F3%A4%DC%A4%A6",
    "power": "1.35\n(1.15)",
    "move": "×"
  },
  {
    "id": "tech-76c0a472f3-a0419ef751-40",
    "name": "スニーク アタック",
    "kind": "テクニック",
    "category": "こんぼう",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 40
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "145\n(54-60)",
    "delay": "650",
    "description": "敵の側面や背後から忍び寄り 不意打ちで敵を眠らせる\n昏睡状態は一定時間経過で解除される\n※昏睡中は被ダメージ1割減",
    "transfer": "×",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード\nバルカーガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A4%B3%A4%F3%A4%DC%A4%A6",
    "power": "1.05\n(0.95)",
    "move": "○"
  },
  {
    "id": "tech-76c0a472f3-18ef21e7e6-50",
    "name": "ニート クラッシャー",
    "kind": "テクニック",
    "category": "こんぼう",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 50
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "130\n(60-66)",
    "delay": "980",
    "description": "対象の装備の耐久度を大幅に消耗させる攻撃を繰り出す。\nこの技を食らった者は、働いて修理代を稼がなければならない。",
    "transfer": "×",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード\nバルカーガード\nギガース系",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A4%B3%A4%F3%A4%DC%A4%A6",
    "power": "1.25\n(1.0)",
    "move": "×"
  },
  {
    "id": "tech-76c0a472f3-d2d0fdea18-60",
    "name": "ウェポン ディザーム",
    "kind": "テクニック",
    "category": "こんぼう",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 60
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "155\n(60-66)",
    "delay": "620",
    "description": "敵の装備している武器を叩き落す\nこの技を受けたプレイヤーは、\n1秒くらいの間、右と左スロットの装備を付け替えできなくなる",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ/ヌブール村)\nオークガード\nアマゾネスガード\nギガース系",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A4%B3%A4%F3%A4%DC%A4%A6",
    "power": "1.0\n(0.8)",
    "move": "×"
  },
  {
    "id": "tech-76c0a472f3-e8aa5ede8b-70",
    "name": "ヴォーテックス ホイール",
    "kind": "テクニック",
    "category": "こんぼう",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 70
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "140\n(72-78)",
    "delay": "1100",
    "description": "その場で回転することにより 周りの敵にダメージを与えて吹き飛ばす\n自分中心の範囲攻撃\nノックバック効果",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ/ヌブール村)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A4%B3%A4%F3%A4%DC%A4%A6",
    "power": "1.1\n(0.9)",
    "move": "×"
  },
  {
    "id": "tech-76c0a472f3-743cea7434-80",
    "name": "ディスロケーション",
    "kind": "テクニック",
    "category": "こんぼう",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 80
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 80,
    "cost": {
      "st": 36
    },
    "castTime": "135\n(48-54)",
    "delay": "1100",
    "description": "敵の骨格を揺るがすダメージを与え HP・MPの自然回復を阻止する",
    "transfer": "×",
    "acquisition": "イクシオンタイクーン\nタルタロッサパラディン\nギガースマッドネス\nギガースツイン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A4%B3%A4%F3%A4%DC%A4%A6",
    "power": "1.45\n(1.15)",
    "move": "×"
  },
  {
    "id": "tech-76c0a472f3-b84caa66b6-90",
    "name": "クウェイク ビート",
    "kind": "テクニック",
    "category": "こんぼう",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 90
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 90,
    "cost": {
      "st": 39
    },
    "castTime": "200",
    "delay": "1000\n※",
    "description": "両手用のこんぼうで地面を強打し 地響きを起こす\n※周囲にいる者のバランス感覚を奪う\n自分中心の広範囲に連続ノックバック効果\n両手用棍棒を装備時のみ使用可能",
    "transfer": "×",
    "acquisition": "ギガース系\nキングザブール\nサベージナイト\nサベージランサーロード\nサベージドルイドロード\nウォーターウンディーネ\nブラッド ゴーレム",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A4%B3%A4%F3%A4%DC%A4%A6",
    "power": "-",
    "move": "×"
  },
  {
    "id": "tech-76c0a472f3-f9618056e1-90",
    "name": "ライジング インパクト",
    "kind": "テクニック",
    "category": "こんぼう",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 90
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "200",
    "delay": "1200",
    "description": "地面を伝わる衝撃が対象の足元を隆起させダメージを与える技\n使用アイテム：原初の粉 1",
    "transfer": "×",
    "acquisition": "ChaosAge天の門 報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A4%B3%A4%F3%A4%DC%A4%A6",
    "power": "1.4\n(1.0)",
    "move": "×"
  },
  {
    "id": "tech-951dc6e009-eb62febce3-1",
    "name": "ロウ キック",
    "kind": "テクニック",
    "category": "キック",
    "requirements": [
      {
        "skill": "キック",
        "min": 1
      }
    ],
    "successSkill": "キック",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "75\n(24-29)",
    "delay": "255",
    "description": "敵の足元を狙って 素早い蹴りを繰り出す",
    "transfer": "×",
    "acquisition": "NPC販売\nクエスト報酬(武閃)\nアマゾネス系\nボビーイムサマス\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%AD%A5%C3%A5%AF",
    "range": "4.5"
  },
  {
    "id": "tech-951dc6e009-569df3cf0f-10",
    "name": "ヘラクレス シュート",
    "kind": "テクニック",
    "category": "キック",
    "requirements": [
      {
        "skill": "キック",
        "min": 10
      }
    ],
    "successSkill": "キック",
    "successRequired": 10,
    "cost": {
      "st": 8
    },
    "castTime": "90\n(30-35)",
    "delay": "590",
    "description": "対象をボールに見立てて、思い切り蹴り飛ばす\nノックバック効果",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネス系\nボビーイムサマス\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%AD%A5%C3%A5%AF",
    "range": "4.9"
  },
  {
    "id": "tech-951dc6e009-61fa5f149f-20",
    "name": "サイド キック",
    "kind": "テクニック",
    "category": "キック",
    "requirements": [
      {
        "skill": "キック",
        "min": 20
      }
    ],
    "successSkill": "キック",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "95\n(18-23)",
    "delay": "575",
    "description": "中段蹴りを繰り出し 敵を転ばせて後ろ向きにさせる\n方向を変化させられる",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネス系\nボビーイムサマス\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%AD%A5%C3%A5%AF",
    "range": "4.9"
  },
  {
    "id": "tech-951dc6e009-8bcec55167-30",
    "name": "レッグ ストーム",
    "kind": "テクニック",
    "category": "キック",
    "requirements": [
      {
        "skill": "キック",
        "min": 30
      }
    ],
    "successSkill": "キック",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "133\n(48-53)",
    "delay": "613",
    "description": "連続して敵を蹴りつけ 敵のHPとスタミナを減らす\n※対NPCでは移動速度も低下させる\n・物理ダメージ＋2回の追加魔法ダメージ",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネス系\nボビーイムサマス\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%AD%A5%C3%A5%AF",
    "range": "4.9"
  },
  {
    "id": "tech-951dc6e009-3c59821599-40",
    "name": "ブレイン ストライク",
    "kind": "テクニック",
    "category": "キック",
    "requirements": [
      {
        "skill": "キック",
        "min": 40
      }
    ],
    "successSkill": "キック",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "135\n(48-53)",
    "delay": "685",
    "description": "敵の脳天にかかとを振り下ろし マナ・ポイント(MP)を減らす",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネス系\nボビーイムサマス\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%AD%A5%C3%A5%AF",
    "range": "4.9"
  },
  {
    "id": "tech-951dc6e009-3f48157fc6-50",
    "name": "リボルト キック",
    "kind": "テクニック",
    "category": "キック",
    "requirements": [
      {
        "skill": "キック",
        "min": 50
      }
    ],
    "successSkill": "キック",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "97\n(36-41)",
    "delay": "1047",
    "description": "キックを当てた反動で 敵をよろけさせて尻餅をつかせる。\n対象のBuff効果を古いものから１つ剥がす\nダメージ＋鈍足Debuff＋Buff剥がし",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネス系\nボビーイムサマス\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%AD%A5%C3%A5%AF",
    "range": "5.1"
  },
  {
    "id": "tech-951dc6e009-51e4eb4abc-60",
    "name": "シリアル シュート",
    "kind": "テクニック",
    "category": "キック",
    "requirements": [
      {
        "skill": "キック",
        "min": 60
      }
    ],
    "successSkill": "キック",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "116\n(36-41)",
    "delay": "1198",
    "description": "上方向へのダメージ判定が発生する蹴りを繰り出す\nターゲット不要\n自分の前方から上に範囲攻撃",
    "transfer": "×",
    "acquisition": "アマゾネスアーチャー\nボビーイムサマス\nグレート\nアントニー\n拳僧兵\n棍僧兵\nクエスト報酬(武閃)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%AD%A5%C3%A5%AF",
    "range": ""
  },
  {
    "id": "tech-951dc6e009-161bbd31a3-70",
    "name": "ドロップ キック",
    "kind": "テクニック",
    "category": "キック",
    "requirements": [
      {
        "skill": "キック",
        "min": 70
      }
    ],
    "successSkill": "キック",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "125\n(48-53)",
    "delay": "1225",
    "description": "ダメージを与えた後ダウンさせる\n着弾点を中心とした範囲攻撃\nガード貫通",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ/ヌブール村)\nアマゾネスアーチャー\nボビーイムサマス\nサベージナイト\nサベージランサーロード\nウォーターウンディーネ\nギガース\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%AD%A5%C3%A5%AF",
    "range": "6.2"
  },
  {
    "id": "tech-951dc6e009-9fe4e9044e-80",
    "name": "トルネード",
    "kind": "テクニック",
    "category": "キック",
    "requirements": [
      {
        "skill": "キック",
        "min": 80
      }
    ],
    "successSkill": "キック",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "160\n(108-113)",
    "delay": "800",
    "description": "回し蹴りを繰り出して、四方の敵を攻撃する\n使用直後から攻撃が当たるまでダメージを無効化する\nターゲット不要\n自分を中心とした範囲攻撃\n使用した瞬間に物理ダメージ100%軽減、魔法無効化の防御Buffが短時間発生\n物理攻撃の追加効果は貫通",
    "transfer": "×",
    "acquisition": "アマゾネスアーチャー\nボビーイムサマス\nグレート\nアントニー\n拳僧兵\n棍僧兵",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%AD%A5%C3%A5%AF",
    "range": ""
  },
  {
    "id": "tech-951dc6e009-1aefb46fb6-90",
    "name": "ムーン ボヤージ",
    "kind": "テクニック",
    "category": "キック",
    "requirements": [
      {
        "skill": "キック",
        "min": 90
      }
    ],
    "successSkill": "キック",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "116\n(96-101)",
    "delay": "865",
    "description": "敵を上空に蹴り上げて 蹴りのほかに落下ダメージも与える",
    "transfer": "×",
    "acquisition": "アマゾネスアーチャー\nボビーイムサマス\nサベージナイト\nサベージランサーロード\nキングザブール\nウォーターウンディーネ\nギガース\nグレート\nアントニー\nThe Legend of Duelist\n拳僧兵\n棍僧兵",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%AD%A5%C3%A5%AF",
    "range": "5.4"
  },
  {
    "id": "tech-4b3a352348-db07034348-1",
    "name": "ホラー クライ",
    "kind": "テクニック",
    "category": "シャウト",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 1
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "200",
    "delay": "850",
    "description": "暗黒の力を通した 恐ろしい叫び声を聞かせる\nこの声を聞いたものは防御力と呪文抵抗力が低下する",
    "transfer": "×",
    "acquisition": "NPC販売\nゾンビ ドッグ\nゾンビラット",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%B7%A5%E3%A5%A6%A5%C8",
    "move": "○"
  },
  {
    "id": "tech-4b3a352348-5fb54ea8eb-20",
    "name": "ロットン ボイス",
    "kind": "テクニック",
    "category": "シャウト",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 20
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "200",
    "delay": "850",
    "description": "死者の声を借り 不快な声を発する\n聴いた者のアイテム使用ディレイを増加させる\n※対NPCでは命中率を低下させる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%B7%A5%E3%A5%A6%A5%C8",
    "move": "○"
  },
  {
    "id": "tech-4b3a352348-01ccfc2398-30",
    "name": "フィアー ノイズ",
    "kind": "テクニック",
    "category": "シャウト",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 30
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "200",
    "delay": "850",
    "description": "怨みのこもった死者の叫びを発し 対象の恐怖心を煽る\n聴いた者は攻撃間隔を広げる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%B7%A5%E3%A5%A6%A5%C8",
    "move": "○"
  },
  {
    "id": "tech-4b3a352348-62cef19498-40",
    "name": "デフニング クレマー",
    "kind": "テクニック",
    "category": "シャウト",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 40
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "200",
    "delay": "850",
    "description": "大声で敵をののしり 詠唱を妨害する",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%B7%A5%E3%A5%A6%A5%C8",
    "move": "○"
  },
  {
    "id": "tech-4b3a352348-e1e9c173a1-50",
    "name": "イビル スクリーム",
    "kind": "テクニック",
    "category": "シャウト",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 50
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "200",
    "delay": "850",
    "description": "邪悪な叫びを聞かせて怯えさせ\n範囲内にいる対象の回避と移動速度を低下させる",
    "transfer": "×",
    "acquisition": "NPC販売\nゾンビ ラット",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%B7%A5%E3%A5%A6%A5%C8",
    "move": "○"
  },
  {
    "id": "tech-4b3a352348-304a9f7134-60",
    "name": "ハウリング ボイス",
    "kind": "テクニック",
    "category": "シャウト",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 60
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "220",
    "delay": "1100",
    "description": "声を振動させて対象に衝撃波を放つ",
    "transfer": "×",
    "acquisition": "イビル シンガー\nウォーターウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%B7%A5%E3%A5%A6%A5%C8",
    "move": "×"
  },
  {
    "id": "tech-4b3a352348-9e3f9bf8ec-70",
    "name": "ラウディ ウェイル",
    "kind": "テクニック",
    "category": "シャウト",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 70
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "200",
    "delay": "1100",
    "description": "叫び声をあげ 敵の攻撃力を下げる",
    "transfer": "×",
    "acquisition": "イビル シンガー\nウォーターウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%B7%A5%E3%A5%A6%A5%C8",
    "move": "○"
  },
  {
    "id": "tech-4b3a352348-2448f30ea0-80",
    "name": "ワイルド ロア",
    "kind": "テクニック",
    "category": "シャウト",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 80
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "200",
    "delay": "1100",
    "description": "野生の雄叫びをあげ 攻撃速度を速める",
    "transfer": "×",
    "acquisition": "イビル シンガー\nウォーターウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%B7%A5%E3%A5%A6%A5%C8",
    "move": "×"
  },
  {
    "id": "tech-4b3a352348-346937036d-90",
    "name": "ジャイアント リサイタル",
    "kind": "テクニック",
    "category": "シャウト",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 90
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "250",
    "delay": "1450",
    "description": "ジャイアントの歌を聞かせ 敵をスタンさせる",
    "transfer": "×",
    "acquisition": "サベージ ナイト\nギガース\nキング ザブール\nウォーターウンディーネ\nブラッド ゴーレム",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%B7%A5%E3%A5%A6%A5%C8",
    "move": "×"
  },
  {
    "id": "tech-795d25e718-3d933e7571-1",
    "name": "チアー ダンス",
    "kind": "テクニック",
    "category": "ダンス",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 1
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "320",
    "delay": "320",
    "description": "自分の周りにいる仲間の魔法詠唱の速度を上げる。\n詠唱開始時にBuffを受けていないと効果ナシ",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク山)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%C0%A5%F3%A5%B9",
    "move": "△"
  },
  {
    "id": "tech-795d25e718-71c2a819aa-10",
    "name": "ルート ダンス",
    "kind": "テクニック",
    "category": "ダンス",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 10
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 10,
    "cost": {
      "st": 5
    },
    "castTime": "320",
    "delay": "320",
    "description": "この踊りを見るものに、植物が地面深くに根を下ろすイメージを与え、ノックバック系の弾き飛ばしが効かなくなる効果をもつ。\nウッドルーツ ブーツ、おばけのチャーリー、鳥人刺繍 化粧廻しと競合してBuffが解除されてノックバックしてしまう。\n※重量限界が5程度増加する。\n→\n解除法一覧",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク山)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%C0%A5%F3%A5%B9",
    "move": "△"
  },
  {
    "id": "tech-795d25e718-e59a7c4320-20",
    "name": "ウェーブ ダンス",
    "kind": "テクニック",
    "category": "ダンス",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 20
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "340",
    "delay": "340",
    "description": "自分の周りにいる仲間のクリティカル発動率を上昇させる。\n※命中が5程度増加する。",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク山)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%C0%A5%F3%A5%B9",
    "move": "△"
  },
  {
    "id": "tech-795d25e718-ae84266fda-30",
    "name": "ボン ダンス",
    "kind": "テクニック",
    "category": "ダンス",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 30
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "290",
    "delay": "290",
    "description": "自分の周りで霊体になっている仲間に、物理攻撃と魔法攻撃を効き辛くする効果を与える。\n※霊体になっているPCが瞬間的に見える効果がある。",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク山)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%C0%A5%F3%A5%B9",
    "move": "△"
  },
  {
    "id": "tech-795d25e718-67453b9706-40",
    "name": "バンザイ ダンス",
    "kind": "テクニック",
    "category": "ダンス",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 40
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "180",
    "delay": "180",
    "description": "自分の周りにいる仲間の移動速度を上昇させる。",
    "transfer": "×",
    "acquisition": "NPC販売(ネオク山)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%C0%A5%F3%A5%B9",
    "move": "△"
  },
  {
    "id": "tech-795d25e718-e5ca1d0934-50",
    "name": "スワン ダンス",
    "kind": "テクニック",
    "category": "ダンス",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 50
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "300",
    "delay": "300",
    "description": "自分の周りにいる仲間の毒とDoTを取り除く。\n→\n解除法一覧",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク山)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%C0%A5%F3%A5%B9",
    "move": "△"
  },
  {
    "id": "tech-795d25e718-21f8aa2172-60",
    "name": "ツイスト",
    "kind": "テクニック",
    "category": "ダンス",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 60
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "310",
    "delay": "310",
    "description": "自分の周りにいる仲間の攻撃間隔を縮める。\nディレイ減少効果\nSpeciality 全てに適用。生産・採取も速くなる",
    "transfer": "×",
    "acquisition": "イビルダンサー\nイビルビューティシャン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%C0%A5%F3%A5%B9",
    "move": "△"
  },
  {
    "id": "tech-795d25e718-8f5d9a2025-70",
    "name": "タウント ダンス",
    "kind": "テクニック",
    "category": "ダンス",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 70
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "420",
    "delay": "420",
    "description": "自分の周囲で寝ている味方を嘲り、たたき起こす。\n※効果持続中は、眠りとスタン状態になってもすぐに解除される。\n→\n解除法一覧",
    "transfer": "×",
    "acquisition": "イビルダンサー\nイビルビューティシャン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%C0%A5%F3%A5%B9",
    "move": "△"
  },
  {
    "id": "tech-795d25e718-f45554f042-80",
    "name": "レッツ ダンス",
    "kind": "テクニック",
    "category": "ダンス",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 80
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "180",
    "delay": "180",
    "description": "自分の周りにいる仲間を踊らせて、スタミナを回復させる。",
    "transfer": "×",
    "acquisition": "イビルダンサー\nイビルビューティシャン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%C0%A5%F3%A5%B9",
    "move": "△"
  },
  {
    "id": "tech-795d25e718-888354c4c3-90",
    "name": "フーリガン ダンス",
    "kind": "テクニック",
    "category": "ダンス",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 90
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 90,
    "cost": {
      "st": 38
    },
    "castTime": "320",
    "delay": "320",
    "description": "この踊りを見た者は、怪しい動きに熱狂して我を忘れ、メイン攻撃が乱舞技になる。\n短評参照",
    "transfer": "×",
    "acquisition": "イビルダンサー\nイビルビューティシャン\nサベージキング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%C0%A5%F3%A5%B9",
    "move": "△"
  },
  {
    "id": "tech-6e9c211d06-7aefb748e0-0",
    "name": "祝砲",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 0,
    "cost": {
      "st": 0
    },
    "castTime": "140",
    "delay": "440",
    "description": "ラブラブな二人の祝福する祝砲\n※ラブラブではない人には効果がない",
    "transfer": "×",
    "acquisition": "イベント報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-109f8e96a5-1",
    "name": "Ａ.Ｐ.Ｐ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1,
    "cost": {
      "st": 1
    },
    "castTime": "300",
    "delay": "900",
    "description": "天使のような祈りの姿勢",
    "transfer": "",
    "acquisition": "クエスト報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-031923842e-1",
    "name": "Ｍ.Ａ.Ｎ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1,
    "cost": {
      "st": 2
    },
    "castTime": "180",
    "delay": "680",
    "description": "弁解する\n(申し訳ありません)",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク山)\nイビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-c31cc2d76d-1",
    "name": "Ｓ.Ｄ.Ｍ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1,
    "cost": {
      "st": 4
    },
    "castTime": "300",
    "delay": "300",
    "description": "白鳥の舞\n(スワンダンスモーション)※スキル上昇判定なし",
    "transfer": "×",
    "acquisition": "NPC販売(ネオク山)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-07cb040878-10",
    "name": "Ｎ.Ｏ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 10
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 10,
    "cost": {
      "st": 2
    },
    "castTime": "180",
    "delay": "680",
    "description": "はっきりと否定するポーズ\n(No!!)",
    "transfer": "○",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-ddf54b3f4c-10",
    "name": "Ｔ.Ｓ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 10
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 10,
    "cost": {
      "st": 1
    },
    "castTime": "244",
    "delay": "744",
    "description": "膝を組んだ座り方\n(体育座り)\n※動かなければモーション持続",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク山)\nサベージ ナイト\nサベージ ランサーロード\nキング ザブール",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-ff0b529e7f-20",
    "name": "Ｉ.Ｔ.Ｅ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 20
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 20,
    "cost": {
      "st": 1
    },
    "castTime": "244",
    "delay": "744",
    "description": "思いっきり転ぶ\n(いてっ)",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク山)\nサベージ ナイト\nサベージ ランサーロード\nキング ザブール",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-315ff56ec0-20",
    "name": "Ｙ.Ｓ.Ｋ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 20
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 20,
    "cost": {
      "st": 2
    },
    "castTime": "236",
    "delay": "736",
    "description": "木を切る振りをする\n(与作)",
    "transfer": "○",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-749113c2e1-30",
    "name": "シード ショット",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 30
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "160",
    "delay": "1360",
    "description": "スイカの種を高速で口から飛ばす\n使用アイテム : カット スイカ 1",
    "transfer": "×",
    "acquisition": "スイカマン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-d06545aa0b-30",
    "name": "Ｇ.Ｉ.Ｋ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 30
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 30,
    "cost": {
      "st": 2
    },
    "castTime": "174",
    "delay": "674",
    "description": "ノコギリを引く振りをする\n(ギコギコ)\n※動かなければモーション持続",
    "transfer": "○",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-3321322066-30",
    "name": "Ｌ.Ｏ.Ｖ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 30
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 30,
    "cost": {
      "st": 0
    },
    "castTime": "400",
    "delay": "1400",
    "description": "-\ninfoに説明が書かれていない\nスキル上昇判定無し\n※キラキラのエフェクトと共に\n/dance→/kissを行う技",
    "transfer": "×",
    "acquisition": "愛の詩集\n('\n07バレンタインイベント\n)\n複製",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-7a90158b1b-30",
    "name": "Ｍ.Ｄ.Ｌ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 30
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 30,
    "cost": {
      "st": 1
    },
    "castTime": "244",
    "delay": "744",
    "description": "ファッションモデルになりきる\n(モデル)\n※一定時間、移動モーション変化Buffが付く",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク山)\nそんなエサに俺様がクマ\nサベージ ナイト\nサベージ ランサーロード\nキング ザブール\nカオス ウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-d6b86e548b-30",
    "name": "Ｏ.Ｔ.Ｍ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 30
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 30,
    "cost": {
      "st": 0
    },
    "castTime": "580",
    "delay": "1200",
    "description": "性別を超えた愛の表現\n(乙女)\n対象指定技\n自分が/kiss→自分が/snaky→対象が/shake\n/shakeモーションに詠唱中断効果あり\n(/shake発動は遅く、詠唱を見てからでは中断はまず無理)",
    "transfer": "○",
    "acquisition": "錬金-第2弾\n錬金-第6弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-5a5e946da1-40",
    "name": "Ｋ.Ｙ.Ｒ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 40
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 40,
    "cost": {
      "st": 2
    },
    "castTime": "180",
    "delay": "680",
    "description": "辺りを見回す\n(キョロキョロ)",
    "transfer": "○",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-c4a506a0a8-40",
    "name": "Ｎ.Ｙ.Ａ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 40
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 40,
    "cost": {
      "st": 3
    },
    "castTime": "199",
    "delay": "999",
    "description": "にゃーんのポーズ\n(にゃーん)",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク山)\n釣られクマ\nそんなエサに俺様がクマ\nサベージ ナイト\nサベージ ドルイドロード\nキング ザブール",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-0c0032155c-50",
    "name": "Ｍ.Ｔ.Ｒ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 50
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 50,
    "cost": {
      "st": 1
    },
    "castTime": "50",
    "delay": "550",
    "description": "必死になって全力疾走する\n(元/昔のツイスターラン？\n「Motion of Twister Run」「物まねツイスターラン」との説も)\n※効果中は移動速度が17程度下がる\n※女性キャラはジャンプ時もポーズをつける",
    "transfer": "×",
    "acquisition": "NPC販売(ネオク山)\nそんなエサに俺様がクマ\nサベージ ナイト\nサベージ ランサーロード\nサベージ ドルイドロード\nキング ザブール\nカオス ウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-5169297c76-50",
    "name": "Ｓ.Ｓ.Ｐ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 50
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 50,
    "cost": {
      "st": 2
    },
    "castTime": "120",
    "delay": "620",
    "description": "さり気なくいたす\n(すかしっぺ)",
    "transfer": "×",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-4438f424f8-60",
    "name": "Ｂ.Ｋ.Ｄ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 60
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 60,
    "cost": {
      "st": 2
    },
    "castTime": "160",
    "delay": "660",
    "description": "転んでしりもちをつく\n(バックドロップ)",
    "transfer": "×",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-de9d331c9b-60",
    "name": "Ｎ.Ｊ.Ｋ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 60
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 60,
    "cost": {
      "st": 5
    },
    "castTime": "300",
    "delay": "900",
    "description": "伝説の名優になりきる\n(なんじゃこりゃー)",
    "transfer": "×",
    "acquisition": "NPC販売(ネオク山)\n釣られクマ\nそんなエサに俺様がクマ\nサベージ ナイト\nサベージ ランサーロード\nキング ザブール\nウォーター ウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-3376eee3fd-60",
    "name": "Ｏ.Ｒ.Ａ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 60
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 60,
    "cost": {
      "st": 2
    },
    "castTime": "300",
    "delay": "800",
    "description": "肩で風を切って歩く\n(おらー)",
    "transfer": "×",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-818405f37a-70",
    "name": "Ｈ.Ｇ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 70
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 70,
    "cost": {
      "st": 1
    },
    "castTime": "244",
    "delay": "744",
    "description": "肉体美を強調する\n(ハルク・ホーガン)",
    "transfer": "",
    "acquisition": "サベージ ナイト\nサベージ ランサーロード\nキング ザブール\nステンノ\nブラッド ゴーレム",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-2-70",
    "name": "Ｈ.Ｇ バージョン2",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 70
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 70,
    "cost": {
      "st": 7
    },
    "castTime": "300",
    "delay": "800",
    "description": "肉体美を強調する\n(ハルク・ホーガン)",
    "transfer": "",
    "acquisition": "複製",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-3-70",
    "name": "Ｈ.Ｇ バージョン3",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 70
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 70,
    "cost": {
      "st": 7
    },
    "castTime": "350",
    "delay": "850",
    "description": "肉体美を強調する\n(ハルク・ホーガン)",
    "transfer": "",
    "acquisition": "複製\n粗悪品のみ作製可能",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-3bf0326fb4-70",
    "name": "Ｈ.Ｋ.Ｄ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 70
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 70,
    "cost": {
      "st": 2
    },
    "castTime": "90",
    "delay": "590",
    "description": "派手に吹き飛ばされる\n(ふっとび転がりダウン)",
    "transfer": "",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-ac1b4eadf0-70",
    "name": "Ｓ.Ｐ.Ｉ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 70
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 70,
    "cost": {
      "st": 2
    },
    "castTime": "240",
    "delay": "740",
    "description": "身構える\n(スパイダーマン)",
    "transfer": "",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-aab57f4a15-80",
    "name": "Ｐ.Ｉ.Ｃ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 80
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 80,
    "cost": {
      "st": 2
    },
    "castTime": "240",
    "delay": "740",
    "description": "鍵を開けるフリをする\n(ピッキング)",
    "transfer": "×",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-e729fb20dd-80",
    "name": "Ｕ.Ｋ.Ｍ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 80
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 80,
    "cost": {
      "st": 2
    },
    "castTime": "240",
    "delay": "740",
    "description": "後ろ受身をとる\n(受身)",
    "transfer": "",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-3f102b7b7e-80",
    "name": "Ｙ.Ｋ.Ｓ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 80
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 80,
    "cost": {
      "st": 5
    },
    "castTime": "150",
    "delay": "1150",
    "description": "気合の入った座り方をして、周囲にガンを飛ばす\n(ヤンキー座り)\n※動かなければモーション持続",
    "transfer": "×",
    "acquisition": "サベージ ランサーロード\nサベージ ドルイドロード\nサベージ ナイト\nキング ザブール\nステンノ\nブラッド ゴーレム",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-6af18fd45b-90",
    "name": "Ｋ.Ｂ.Ｋ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 90
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 90,
    "cost": {
      "st": 2
    },
    "castTime": "240",
    "delay": "740",
    "description": "大見得を切る\n(歌舞伎)",
    "transfer": "×",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-91109885bd-90",
    "name": "Ｍ.Ｂ.Ｋ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 90
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 90,
    "cost": {
      "st": 2
    },
    "castTime": "240",
    "delay": "740",
    "description": "さりげなく頂戴する\n(万引き)",
    "transfer": "×",
    "acquisition": "イビル ダンサー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-6e9c211d06-594578f4b6-90",
    "name": "Ｍ.Ｏ.Ｅ",
    "kind": "テクニック",
    "category": "パフォーマンス",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 90
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 90,
    "cost": {
      "st": 9
    },
    "castTime": "290",
    "delay": "560",
    "description": "娯楽の達人が、見えない仕掛けを使って最高に目立つポーズをキメる\n(Master of Entertainment)\n※水中発動不可\n※一定時間、Buffが付く",
    "transfer": "×",
    "acquisition": "サベージ ナイト\nサベージ ランサーロード\nサベージ ドルイドロード\nキング ザブール\nブラッド ゴーレム\nファイアー ゴーレム\nフレイム ゴーレム\nガイア\nノーザン ゲートキーパー\nステンノ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%A5%D1%A5%D5%A5%A9%A1%BC%A5%DE%A5%F3%A5%B9"
  },
  {
    "id": "tech-203575cfb7-338d6b76fe-20",
    "name": "チャージド スラッシュ",
    "kind": "テクニック",
    "category": "刀剣",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 20
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 20,
    "cost": {
      "st": 15
    },
    "castTime": "155\n(90-96)",
    "delay": "1100",
    "description": "力を溜めて激しく敵に斬りつけることにより\nガード技を無視してダメージを貫通させる\n※成功すると 敵をスタンさせることができる\nガードブレイク技",
    "transfer": "×",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%E1%B7%F5",
    "power": "1.25\n(1.05)",
    "move": "×"
  },
  {
    "id": "tech-203575cfb7-c124b582d6-40",
    "name": "ダイイング スタブ",
    "kind": "テクニック",
    "category": "刀剣",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 40,
    "cost": {
      "st": 21
    },
    "castTime": "140\n(48-54)",
    "delay": "900",
    "description": "対象をえぐるようにして突き刺し 巨大な傷口を作る\n※斬った後もダメージが続く\n追加効果でDoT",
    "transfer": "×",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%E1%B7%F5",
    "power": "0.85+α\n(0.75+α)",
    "move": "×"
  },
  {
    "id": "tech-203575cfb7-e4605ab214-50",
    "name": "ニューロン ストライク",
    "kind": "テクニック",
    "category": "刀剣",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 50
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "195\n→165\n(\n96-102\n)→(84-90)",
    "delay": "1300\n→1150",
    "description": "剣で斬りつけて属性防御値を下げる\n移動発動可だが、モーションが長い",
    "transfer": "×",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%E1%B7%F5",
    "power": "1.15\n(1.0)",
    "move": "○"
  },
  {
    "id": "tech-203575cfb7-1a940985b4-60",
    "name": "エクセキューション",
    "kind": "テクニック",
    "category": "刀剣",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 60
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "240\n→210\n(\n114-120\n)→(102-108)",
    "delay": "590",
    "description": "ジャンプ斬りで敵の脳天を叩き割り 大ダメージを与える\n※技発動中は無防備になる\nモーション中は被ダメージ増",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ)\nオークガード\nアマゾネスガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%E1%B7%F5",
    "power": "1.8\n(1.6)",
    "move": "×"
  },
  {
    "id": "tech-203575cfb7-1574e47f31-70",
    "name": "ソニック ストライク",
    "kind": "テクニック",
    "category": "刀剣",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 70
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "200\n(90-96)",
    "delay": "820\n→1230",
    "description": "手にしている剣を投げて 離れた敵を攻撃する\n※投げた武器は失ってしまう\n壊れるのではなく消滅。シップ剣も消える\n※投げた武器の耐久は大幅に減少する",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ/ヌブール村)\nタルタロッサエアー\nイクシオンウォリアー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%E1%B7%F5",
    "power": "1.5\n(1.3)",
    "move": "×"
  },
  {
    "id": "tech-203575cfb7-01e080bd7e-80",
    "name": "ウィンド エッジ",
    "kind": "テクニック",
    "category": "刀剣",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 80
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "120\n()",
    "delay": "1100",
    "description": "風の刃を飛ばし、遠くにいる敵を斬りつけることができる技\n使用アイテム：原初の粉 1",
    "transfer": "×",
    "acquisition": "ChaosAge火の門 報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%E1%B7%F5",
    "power": "0.8\n(?)",
    "move": "?"
  },
  {
    "id": "tech-203575cfb7-27261701c9-80",
    "name": "ヴァルキリー ブレイド",
    "kind": "テクニック",
    "category": "刀剣",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 80
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "140\n(36-42)",
    "delay": "1100",
    "description": "力一杯敵を切りつけ 大ダメージを与える。\n※武器の損傷も大きくなる\n武器損傷：通常攻撃10回分/Fizzle時9回分",
    "transfer": "×",
    "acquisition": "タルタロッサスラッシュ\nサベージランサーロード\nギガース\nウォーターウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%E1%B7%F5",
    "power": "1.45\n(1.25)",
    "move": "×"
  },
  {
    "id": "tech-203575cfb7-1f7f0f3eb3-90",
    "name": "ソード ダンス",
    "kind": "テクニック",
    "category": "刀剣",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "125\n(18-24)",
    "delay": "1280\n※",
    "description": "装備している武器で敵の直接攻撃をはじき返し ダメージを与える\n物理攻撃の範囲は前方扇状のレンジ3.5\n武器損傷：通常攻撃2回分/Fizzle時1回分",
    "transfer": "×",
    "acquisition": "タルタロッサスラッシュ\nサベージナイト\nサベージランサーロード\nギガース\nウォーターウンディーネ\nシャドウナイト",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%E1%B7%F5",
    "power": "0.9\n(0.6)",
    "move": "△"
  },
  {
    "id": "tech-40e86d2900-aa1ec8a396-1",
    "name": "トレード",
    "kind": "テクニック",
    "category": "取引",
    "requirements": [
      {
        "skill": "取引",
        "min": 1
      }
    ],
    "successSkill": "取引",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "60",
    "delay": "1060",
    "description": "対象とアイテムやお金の交換をする\n取引スキル値に関わらずFizzleは発生しない",
    "transfer": "○",
    "acquisition": "初期習得済み\nNPC販売(ネオク高原)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%E8%B0%FA"
  },
  {
    "id": "tech-40e86d2900-7c9e0f72be-10",
    "name": "オープン セラー",
    "kind": "テクニック",
    "category": "取引",
    "requirements": [
      {
        "skill": "取引",
        "min": 10
      }
    ],
    "successSkill": "取引",
    "successRequired": 10,
    "cost": {
      "st": 40
    },
    "castTime": "450",
    "delay": "1450",
    "description": "露店を開いて自動販売をする",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク高原)\nイオーフェン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%E8%B0%FA"
  },
  {
    "id": "tech-40e86d2900-63e9f634a8-20",
    "name": "オープン バイヤー",
    "kind": "テクニック",
    "category": "取引",
    "requirements": [
      {
        "skill": "取引",
        "min": 20
      }
    ],
    "successSkill": "取引",
    "successRequired": 20,
    "cost": {
      "st": 40
    },
    "castTime": "450",
    "delay": "1199",
    "description": "露店を開いて自動買取をする",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク高原)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%E8%B0%FA"
  },
  {
    "id": "tech-40e86d2900-5f26485357-30",
    "name": "サインボード",
    "kind": "テクニック",
    "category": "取引",
    "requirements": [
      {
        "skill": "取引",
        "min": 30
      }
    ],
    "successSkill": "取引",
    "successRequired": 30,
    "cost": {
      "st": 40
    },
    "castTime": "450",
    "delay": "1450",
    "description": "自分の店の看板を立てる\n※アイテム『店の看板』が必要\n水中では使用できない",
    "transfer": "×",
    "acquisition": "NPC販売(ネオク高原)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%E8%B0%FA"
  },
  {
    "id": "tech-40e86d2900-c03f713a6c-40",
    "name": "ハイアー ボディーガード",
    "kind": "テクニック",
    "category": "取引",
    "requirements": [
      {
        "skill": "取引",
        "min": 40
      }
    ],
    "successSkill": "取引",
    "successRequired": 40,
    "cost": {
      "st": 23
    },
    "castTime": "150",
    "delay": "650",
    "description": "オーク ギャングをお金でボディガードとして雇う",
    "transfer": "○",
    "acquisition": "NPC販売(ネオク高原)\nオークギャング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%E8%B0%FA"
  },
  {
    "id": "tech-40e86d2900-797404d077-50",
    "name": "マーチャント コール",
    "kind": "テクニック",
    "category": "取引",
    "requirements": [
      {
        "skill": "取引",
        "min": 50
      }
    ],
    "successSkill": "取引",
    "successRequired": 50,
    "cost": {
      "st": 40
    },
    "castTime": "225",
    "delay": "1775",
    "description": "出張商人を呼んで買い物をする\n利用できるのは使用者のみ\n売却は何度でも可、商品の購入は1回のみ",
    "transfer": "○",
    "acquisition": "イオーフェン\n抜忍",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%E8%B0%FA"
  },
  {
    "id": "tech-40e86d2900-16d087da07-60",
    "name": "ハイアー マーシナリー",
    "kind": "テクニック",
    "category": "取引",
    "requirements": [
      {
        "skill": "取引",
        "min": 60
      }
    ],
    "successSkill": "取引",
    "successRequired": 60,
    "cost": {
      "st": 23
    },
    "castTime": "150",
    "delay": "650",
    "description": "大金を払い ドワーフの傭兵を雇う",
    "transfer": "×",
    "acquisition": "イオーフェン\nドワーヴンマフィア\nシークレットサービス",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%E8%B0%FA"
  },
  {
    "id": "tech-40e86d2900-b890665707-90",
    "name": "バンカー コール",
    "kind": "テクニック",
    "category": "取引",
    "requirements": [
      {
        "skill": "取引",
        "min": 90
      }
    ],
    "successSkill": "取引",
    "successRequired": 90,
    "cost": {
      "st": 40
    },
    "castTime": "450",
    "delay": "1750",
    "description": "出張銀行員を呼び出す\n一部呼び出せない地域がある\n利用できるのは使用者のみ\n銀行を1回閉じると消える",
    "transfer": "×",
    "acquisition": "イオーフェン\nブラッド ゴーレム\nサベージナイト\nサベージランサーロード\nサベージドルイドロード\nキングザブール\n銀行員(WarAge)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%E8%B0%FA"
  },
  {
    "id": "tech-a0ec11cd07-5848a92191-20",
    "name": "バルク ショット",
    "kind": "テクニック",
    "category": "弓",
    "requirements": [
      {
        "skill": "弓",
        "min": 20
      }
    ],
    "successSkill": "弓",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "150\n(24-29)",
    "delay": "800",
    "description": "複数の矢を連続して射る\n※スキル上昇と共に回数が増える\n連撃技。最大で6hit\n撃った回数分の矢を消費する",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ\n反乱軍アーチャー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B5%DD",
    "power": "0.5*n\n(0.35*n)",
    "move": "×"
  },
  {
    "id": "tech-a0ec11cd07-8d44d0d822-40",
    "name": "ジャッジメント ショット",
    "kind": "テクニック",
    "category": "弓",
    "requirements": [
      {
        "skill": "弓",
        "min": 40
      }
    ],
    "successSkill": "弓",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "180\n(78-83)",
    "delay": "600",
    "description": "敵に矢を射て突き刺さった矢に稲妻を落とす\n物理＋魔法ダメージ\n他より射程がやや短い",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B5%DD",
    "power": "1.1+α\n(0.9+α)",
    "move": "×"
  },
  {
    "id": "tech-a0ec11cd07-963d9655b1-50",
    "name": "ソニック アロー",
    "kind": "テクニック",
    "category": "弓",
    "requirements": [
      {
        "skill": "弓",
        "min": 50
      }
    ],
    "successSkill": "弓",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "60\n(36-41)",
    "delay": "1100",
    "description": "有効レンジは短いが、ガードを貫通する攻撃",
    "transfer": "×",
    "acquisition": "NPC販売(WarAge奇跡)\nクエスト報酬(フォレール)\nヴァルグリンドアマゾネス(弓型)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B5%DD",
    "power": "1.3\n(1.0)",
    "move": "×"
  },
  {
    "id": "tech-a0ec11cd07-43ce992d31-60",
    "name": "ホープレス ショット",
    "kind": "テクニック",
    "category": "弓",
    "requirements": [
      {
        "skill": "弓",
        "min": 60
      }
    ],
    "successSkill": "弓",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "90\n(36-41)",
    "delay": "1100",
    "description": "対象の武器に付加されているエンチャントを解除する",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B5%DD",
    "power": "1.15\n(0.9)",
    "move": "×"
  },
  {
    "id": "tech-a0ec11cd07-db8bd60867-70",
    "name": "ホークアイ ショット",
    "kind": "テクニック",
    "category": "弓",
    "requirements": [
      {
        "skill": "弓",
        "min": 70
      }
    ],
    "successSkill": "弓",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "210\n(156-161)",
    "delay": "600",
    "description": "鷹の目のように鋭く敵を睨みつけ 目視できるギリギリの距離まで矢を飛ばす\n射程が+20される",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ\n反乱軍アーチャー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B5%DD",
    "power": "0.9\n(0.7)",
    "move": "×"
  },
  {
    "id": "tech-a0ec11cd07-071dd83420-80",
    "name": "シール ショット",
    "kind": "テクニック",
    "category": "弓",
    "requirements": [
      {
        "skill": "弓",
        "min": 80
      }
    ],
    "successSkill": "弓",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "120\n(84-89)",
    "delay": "1000",
    "description": "対象に弓ダメージを与え 更にスペルブックにチャージされている魔法を解除する",
    "transfer": "×",
    "acquisition": "アマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B5%DD",
    "power": "1.25\n(1.05)",
    "move": "○"
  },
  {
    "id": "tech-a0ec11cd07-a9c9831021-90",
    "name": "ゴルゴタ ショット",
    "kind": "テクニック",
    "category": "弓",
    "requirements": [
      {
        "skill": "弓",
        "min": 90
      }
    ],
    "successSkill": "弓",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "290\n(162-167)",
    "delay": "1200",
    "description": "パーティメンバーの力を借り、敵を突き抜ける矢を発射する\n※自分を含めて2人以上のパーティを組んでいる時に発動可能\nPTメンバーが近くにいないと発動しない",
    "transfer": "×",
    "acquisition": "サベージキング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B5%DD",
    "power": "1.5\n(1.2)",
    "move": "×"
  },
  {
    "id": "tech-aa99c6c930-21308be16f-1",
    "name": "プリーチ",
    "kind": "テクニック",
    "category": "戦闘技術",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 1
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "130",
    "delay": "670",
    "description": "敵をなだめて戦意を喪失させる\n※ 対人戦では相手の戦闘状態を解除する\n→\nタゲ切り技",
    "transfer": "○",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C0%EF%C6%AE%B5%BB%BD%D1",
    "move": "×",
    "range": "6.3"
  },
  {
    "id": "tech-aa99c6c930-7ba6fab490-10",
    "name": "タックル",
    "kind": "テクニック",
    "category": "戦闘技術",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 10
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 10,
    "cost": {
      "st": 8
    },
    "castTime": "130",
    "delay": "630",
    "description": "敵に体当たりを喰らわせ 後退させる\nダメージは発生しないが弱い詠唱妨害効果がある",
    "transfer": "○",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C0%EF%C6%AE%B5%BB%BD%D1",
    "move": "○",
    "range": "6.3"
  },
  {
    "id": "tech-aa99c6c930-56c7e5c7af-20",
    "name": "タウント",
    "kind": "テクニック",
    "category": "戦闘技術",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 20
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "165",
    "delay": "815",
    "description": "敵を挑発し 自分に注意を惹きつける\nダメージは発生しないが弱い詠唱妨害効果がある\n→\n挑発技",
    "transfer": "○",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C0%EF%C6%AE%B5%BB%BD%D1",
    "move": "○",
    "range": "9.3"
  },
  {
    "id": "tech-aa99c6c930-fcea76b9c3-30",
    "name": "バーサーク",
    "kind": "テクニック",
    "category": "戦闘技術",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 30
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "150",
    "delay": "1350",
    "description": "一時的に暴走状態になり攻撃力と攻撃スピードが高まる\n※ バーサーク状態の間は、HP/MP/STの自然回復量が低下する\nジャンプで解除される\n素手を除く「アタック」のみ ディレイ13%短縮",
    "transfer": "○",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C0%EF%C6%AE%B5%BB%BD%D1",
    "move": "○",
    "range": "-"
  },
  {
    "id": "tech-aa99c6c930-2a4e4e14cd-40",
    "name": "エクゾシズム",
    "kind": "テクニック",
    "category": "戦闘技術",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 40
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "140",
    "delay": "790",
    "description": "邪悪な気を祓い 自分にかけられた最も新しいステータスダウン効果を1つ無効にする\n※ 毒・呪い・スタン・眠り・DoTダメージは解除できません\n→\n解除法一覧",
    "transfer": "○",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C0%EF%C6%AE%B5%BB%BD%D1",
    "move": "○",
    "range": "-"
  },
  {
    "id": "tech-aa99c6c930-58bf155e49-50",
    "name": "ナイト マインド",
    "kind": "テクニック",
    "category": "戦闘技術",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 50
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "150",
    "delay": "1650",
    "description": "攻撃の命中率を大幅に上昇させる",
    "transfer": "○",
    "acquisition": "NPC販売\nオークガード\nアマゾネスガード\nギガース",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C0%EF%C6%AE%B5%BB%BD%D1",
    "move": "○",
    "range": "-"
  },
  {
    "id": "tech-aa99c6c930-31cc2f00f6-60",
    "name": "バーサーク オール",
    "kind": "テクニック",
    "category": "戦闘技術",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 60
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "200",
    "delay": "2200",
    "description": "一時的に暴走状態になり、攻撃力を大幅に上昇させるが、\n代償として回避が大幅に減少する\nパーティメンバー全員をバーサーク状態にする\n効果中はACが大幅に減少する\nジャンプで解除される\nバーサーク\nとは異なり、HP/ST/MP自然回復は有り",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ)\n行商人 ジョン(エルビン渓谷)\nオークガード\nアマゾネスガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C0%EF%C6%AE%B5%BB%BD%D1",
    "move": "×",
    "range": "-"
  },
  {
    "id": "tech-aa99c6c930-382273115c-70",
    "name": "カンフー ソウル",
    "kind": "テクニック",
    "category": "戦闘技術",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 70
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "150",
    "delay": "1350",
    "description": "メイン攻撃のクリティカル発生率を上昇させる\n※ 効果中は呪文抵抗力と回避が低下します。\nジャンプで解除される",
    "transfer": "×",
    "acquisition": "ボビーイムサマス\nサベージナイト\nウォーターウンディーネ\nギガース\nグレート\nレスラー（ニューター男）\n拳僧兵\n棍僧兵",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C0%EF%C6%AE%B5%BB%BD%D1",
    "move": "○",
    "range": "-"
  },
  {
    "id": "tech-aa99c6c930-6bc0e120a0-80",
    "name": "サムライ ハート",
    "kind": "テクニック",
    "category": "戦闘技術",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 80
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "150",
    "delay": "1650",
    "description": "敵の防御力を 一定時間大幅に減少させる",
    "transfer": "×",
    "acquisition": "タルタロッサバレット\nタルタロッサスラッシュ\n拳僧兵\n棍僧兵",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C0%EF%C6%AE%B5%BB%BD%D1",
    "move": "○",
    "range": "6.8"
  },
  {
    "id": "tech-aa99c6c930-2d9af034d4-90",
    "name": "センス オブ ワンダー",
    "kind": "テクニック",
    "category": "戦闘技術",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 90
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "150",
    "delay": "1750",
    "description": "移動しながら発動できない一部の攻撃を 移動しながらでも繰り出せるようにする",
    "transfer": "×",
    "acquisition": "タルタロッサバレット\nサベージ ナイト\nサベージランサーロード\nウォーターウンディーネ\nギガース\nブラッド ゴーレム\n拳僧兵\n棍僧兵",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C0%EF%C6%AE%B5%BB%BD%D1",
    "move": "○",
    "range": "-"
  },
  {
    "id": "tech-46006e663a-7ed2cd424c-1",
    "name": "スロウ",
    "kind": "テクニック",
    "category": "投げ",
    "requirements": [
      {
        "skill": "投げ",
        "min": 1
      }
    ],
    "successSkill": "投げ",
    "successRequired": 1,
    "cost": {
      "st": 9
    },
    "castTime": "85",
    "delay": "425",
    "description": "投てき用の武器を 敵に投げつける",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%EA%A4%B2",
    "power": "1.0",
    "move": "○"
  },
  {
    "id": "tech-46006e663a-7e3b28b3f6-1",
    "name": "フック アクション",
    "kind": "テクニック",
    "category": "投げ",
    "requirements": [
      {
        "skill": "投げ",
        "min": 1
      }
    ],
    "successSkill": "投げ",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "150",
    "delay": "1000",
    "description": "鉤縄を利用して 壁や崖を登ることができる\n※【アクション オブジェクト】をターゲットして使用します\n使用アイテム : 鉤縄",
    "transfer": "×",
    "acquisition": "クエスト「\n忍び頭領との手合わせ\n」報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%EA%A4%B2",
    "power": "-",
    "move": "×"
  },
  {
    "id": "tech-46006e663a-1037b34fec-20",
    "name": "ブラインド スロウ",
    "kind": "テクニック",
    "category": "投げ",
    "requirements": [
      {
        "skill": "投げ",
        "min": 20
      }
    ],
    "successSkill": "投げ",
    "successRequired": 20,
    "cost": {
      "st": 15
    },
    "castTime": "88",
    "delay": "1088",
    "description": "太陽や月の光を反射させ\n対象の目を眩ませながら投てき武器を投げつける\n追加効果で命中低下のDebuff",
    "transfer": "×",
    "acquisition": "NPC販売\n下忍",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%EA%A4%B2",
    "power": "0.95\n(0.75)",
    "move": "○"
  },
  {
    "id": "tech-46006e663a-8c4d32eb00-30",
    "name": "ミリオネア シャワー",
    "kind": "テクニック",
    "category": "投げ",
    "requirements": [
      {
        "skill": "投げ",
        "min": 30
      }
    ],
    "successSkill": "投げ",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "75",
    "delay": "1275",
    "description": "自分の所持金を敵に投げつける。\n対象にお金の亡者がいた場合には、落ちたお金を拾おうとしてしまう。\n威力固定\n技の発動に必要なお金：50G (50J)\n前方範囲技",
    "transfer": "×",
    "acquisition": "抜け忍",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%EA%A4%B2",
    "power": "ATK80\n(ATK50)",
    "move": "×"
  },
  {
    "id": "tech-46006e663a-b260d86f84-40",
    "name": "ラピッド スロウ",
    "kind": "テクニック",
    "category": "投げ",
    "requirements": [
      {
        "skill": "投げ",
        "min": 40
      }
    ],
    "successSkill": "投げ",
    "successRequired": 40,
    "cost": {
      "st": 21
    },
    "castTime": "90",
    "delay": "1090",
    "description": "対象に攻撃を貫通させて 後方にいる敵にもダメージを与えられる\n前方に帯状の範囲技",
    "transfer": "×",
    "acquisition": "NPC販売\nクエスト報酬(フォレール)\n下忍",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%EA%A4%B2",
    "power": "1.0\n(0.75)",
    "move": "○"
  },
  {
    "id": "tech-46006e663a-252161f765-60",
    "name": "シャドウ ストライク",
    "kind": "テクニック",
    "category": "投げ",
    "requirements": [
      {
        "skill": "投げ",
        "min": 60
      }
    ],
    "successSkill": "投げ",
    "successRequired": 60,
    "cost": {
      "st": 24
    },
    "castTime": "130",
    "delay": "1130",
    "description": "対象に投げダメージを与えた後 自分の姿を眩ます\n→\nタゲ切り技",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ)\n下忍\nイクシオン アサシン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%EA%A4%B2",
    "power": "1.2\n(0.75)",
    "move": "○"
  },
  {
    "id": "tech-46006e663a-f7dcb75697-70",
    "name": "バニッシュ クラウド",
    "kind": "テクニック",
    "category": "投げ",
    "requirements": [
      {
        "skill": "投げ",
        "min": 70
      }
    ],
    "successSkill": "投げ",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "200",
    "delay": "1200",
    "description": "投てき用の武器を足元に叩きつけて煙を出現させる\n※姿を眩ましている間は 技の発動が早くなっているので、奇襲攻撃のチャンス\n効果中はアタックディレイのみ減少\n→\nタゲ切り技",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ/ヌブール村)\n暗殺者\nイクシオン アサシン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%EA%A4%B2",
    "power": "-",
    "move": "○"
  },
  {
    "id": "tech-46006e663a-175b6b353d-80",
    "name": "ダブル スロウ",
    "kind": "テクニック",
    "category": "投げ",
    "requirements": [
      {
        "skill": "投げ",
        "min": 80
      }
    ],
    "successSkill": "投げ",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "115",
    "delay": "1295",
    "description": "一度に2つの投擲武器を投げることができる\nMiss/ミスザマークで2発目発生せず",
    "transfer": "×",
    "acquisition": "イクシオン アサシン\nサベージ ナイト\nサベージ ランサーロード\nブラッド ゴーレム",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%EA%A4%B2",
    "power": "0.85*2\n(0.75*2)",
    "move": "○"
  },
  {
    "id": "tech-46006e663a-d08e57148a-90",
    "name": "シャドウ スティッチ",
    "kind": "テクニック",
    "category": "投げ",
    "requirements": [
      {
        "skill": "投げ",
        "min": 90
      }
    ],
    "successSkill": "投げ",
    "successRequired": 90,
    "cost": {
      "st": 33
    },
    "castTime": "150",
    "delay": "1150",
    "description": "対象の影を射止めて 身動きがとれないようにする\n範囲内必中",
    "transfer": "×",
    "acquisition": "イクシオン アサシン\nキング ザブール\nサベージ ナイト\nサベージ ランサーロード\nサベージ ドルイドロード\nウォーター ウンディーネ\nギガース\nブラッド ゴーレム",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%EA%A4%B2",
    "power": "-",
    "move": "×"
  },
  {
    "id": "tech-5da33608cb-3348ede286-1",
    "name": "テラー チャーム",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 1
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "170",
    "delay": "750",
    "description": "対象は恐怖に魅入られ 目を逸らしてしまう\n→\nタゲ切り技",
    "transfer": "×",
    "acquisition": "NPC販売\nゾンビ系全般\nボーン メイジ\nジャイアント ウィング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-cbf9c8efc6-10",
    "name": "ドレイン ソウル",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 10
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 10,
    "cost": {
      "st": 8
    },
    "castTime": "170",
    "delay": "750",
    "description": "死体から魂を吸収し MPを回復する\n※魂が残っている死体からは、多くのMPを回復可能",
    "transfer": "×",
    "acquisition": "NPC販売\nゾンビ系全般\nボーン メイジ\nジャイアント ウィング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-b742fb73f9-20",
    "name": "ブレイム フォーカス",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 20
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "170",
    "delay": "750",
    "description": "周りにいる敵の反応範囲を広くする\n自分中心の範囲技",
    "transfer": "×",
    "acquisition": "NPC販売\nアスモダイ デューク",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-652cae94fb-30",
    "name": "でふゅーじょん",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 30
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 30,
    "cost": {
      "st": 19
    },
    "castTime": "150",
    "delay": "1150",
    "description": "自分とパーティメンバー全員の 『 フュージョン 』 を解除する\n※ 『 フュージョン 』 効果中のみ発動可能",
    "transfer": "",
    "acquisition": "NPC『naze』\nに\nフュージョンの技書と引換",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-233cc2f4e4-30",
    "name": "スケイプ ゴート",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 30
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 30,
    "cost": {
      "st": 19
    },
    "castTime": "170",
    "delay": "850",
    "description": "一定時間、敵を攻撃やアイテムの使用を不可能にさせる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-29005ed43b-40",
    "name": "サクリファイス ディナー",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 40
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 40,
    "cost": {
      "st": 17
    },
    "castTime": "150",
    "delay": "918",
    "description": "自分のペットを食べ HP・MP・STを回復する\n育成中のペット(特にウーやホム)の誤食に注意",
    "transfer": "×",
    "acquisition": "NPC販売\nゾンビ系全般\nボーン メイジ\nジャイアント ウィング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-100c65bd42-50",
    "name": "ナイト カーテン",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 50
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "180",
    "delay": "2580",
    "description": "辺り一面を暗闇に包みこみ 敵からの攻撃を当りにくくする\n自分中心の範囲技。ディレイが少し長い",
    "transfer": "×",
    "acquisition": "NPC販売\nゾンビ系全般\nボーン メイジ\nジャイアント ウィング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-28ae48c9a1-60",
    "name": "スレイブ チェイン",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 60
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "170",
    "delay": "1150",
    "description": "対象を自分の方へと歩み寄らせる",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ)\nゾンビ系全般\nボーン メイジ\nジャイアント ウィング\nデミトリー(WarAge)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-9f3c1efe7c-70",
    "name": "ハンギング ウイングス",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 70
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 70,
    "cost": {
      "st": 29
    },
    "castTime": "120",
    "delay": "920",
    "description": "対象を宙にはりつける\n※浮いてる間は、ヒット・ポイント(HP)と回避能力が減少する",
    "transfer": "×",
    "acquisition": "NPC販売(ヌブール村)\nゾンビ系全般\nボーン メイジ\nジャイアント ウィング\nハンナ イムサマス\nサベージ ドルイド\nデミトリー(WarAge)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-fcf73d454f-80",
    "name": "ギロチン コール",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 80
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "130",
    "delay": "1580",
    "description": "最大ヒットポイントの20%を切った対象の首を刎ねる\n(与えることが出来るダメージは最大で200です。)",
    "transfer": "×",
    "acquisition": "ハンナ イムサマス\nサベージ ドルイド\nサベージ ドルイドロード\nデミトリー(WarAge)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-d8e9c1c59f-90",
    "name": "りばーす・ふゅーじょん",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 90
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 90,
    "cost": {
      "st": 32
    },
    "castTime": "280",
    "delay": "2280",
    "description": "ダークマターから魂の残滓を取り込み、融合変身することで身体能力が強化される\n※自分にのみ効果を発揮する、パーティメンバーがいても取り込まない\n使用アイテム : ダークマター 1\n詳細はこちら",
    "transfer": "",
    "acquisition": "NPC『naze』\nの\nクエストポイント報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-5da33608cb-ab26cfeef8-90",
    "name": "フュージョン",
    "kind": "テクニック",
    "category": "暗黒命令",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 90
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 90,
    "cost": {
      "st": 32
    },
    "castTime": "280",
    "delay": "2280",
    "description": "パーティメンバー全員が合体し 一体の怪物へと姿を変える\n技使用者以外は操作不能になり 力を分け与える事しか出来なくなる\n発動者は、強靭な力と長いリーチを得られる\n※自分を含めて2人以上のパーティを組んでいる時に発動可能",
    "transfer": "×",
    "acquisition": "アスモダイ デューク\nハンナ イムサマス\nシェリー イムサマス\nデミトリー(WarAge)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B0%C5%B9%F5%CC%BF%CE%E1"
  },
  {
    "id": "tech-e5e6cb266e-925248fa6b-10",
    "name": "ガード ブレイカー",
    "kind": "テクニック",
    "category": "槍",
    "requirements": [
      {
        "skill": "槍",
        "min": 10
      }
    ],
    "successSkill": "槍",
    "successRequired": 10,
    "cost": {
      "st": 11
    },
    "castTime": "95\n(42-48)",
    "delay": "950",
    "description": "ガードの隙間をぬって 無理やりダメージを与える\nガード貫通技",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%E4",
    "power": "0.95\n(0.8)",
    "move": "×"
  },
  {
    "id": "tech-e5e6cb266e-1875a0d57b-20",
    "name": "タイダル スピアー",
    "kind": "テクニック",
    "category": "槍",
    "requirements": [
      {
        "skill": "槍",
        "min": 20
      }
    ],
    "successSkill": "槍",
    "successRequired": 20,
    "cost": {
      "st": 15
    },
    "castTime": "105\n(60-66)",
    "delay": "900\n※",
    "description": "後退した後に前方に踏み込み攻撃する",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%E4",
    "power": "1.2\n(0.95)",
    "move": "△"
  },
  {
    "id": "tech-e5e6cb266e-fca6da52eb-40",
    "name": "ポール シフト",
    "kind": "テクニック",
    "category": "槍",
    "requirements": [
      {
        "skill": "槍",
        "min": 40
      }
    ],
    "successSkill": "槍",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "110\n(42-48)",
    "delay": "1100\n※",
    "description": "槍を利用して前方向に飛び上がる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%E4",
    "power": "-",
    "move": "○"
  },
  {
    "id": "tech-e5e6cb266e-3d62950379-50",
    "name": "ドラゴン テイル",
    "kind": "テクニック",
    "category": "槍",
    "requirements": [
      {
        "skill": "槍",
        "min": 50
      }
    ],
    "successSkill": "槍",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "120\n(78-84)",
    "delay": "1100",
    "description": "対象の防具と ガードの隙間を狙って攻撃する\n※成功すると敵はスタン状態になる\nガードブレイク技",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%E4",
    "power": "1.05\n(0.85)",
    "move": "○"
  },
  {
    "id": "tech-e5e6cb266e-cbeeef692b-60",
    "name": "ペネトレイション",
    "kind": "テクニック",
    "category": "槍",
    "requirements": [
      {
        "skill": "槍",
        "min": 60
      }
    ],
    "successSkill": "槍",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "125\n(66-72)",
    "delay": "1200",
    "description": "ダメージは低いが、離れた敵にまで届く貫通攻撃を与える\n前方に細い帯状の範囲技",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ)\nサベージ ランサー\nサベージ ナイト\nサベージ ランサーロード\nウォーター ウンディーネ\nギガース",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%E4",
    "power": "0.95\n(0.8)",
    "move": "○"
  },
  {
    "id": "tech-e5e6cb266e-dea5378a13-70",
    "name": "ハラキリ スピアー",
    "kind": "テクニック",
    "category": "槍",
    "requirements": [
      {
        "skill": "槍",
        "min": 70
      }
    ],
    "successSkill": "槍",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "106\n(36-41)",
    "delay": "1000",
    "description": "自分の腹を貫通させて 後ろの敵に奇襲攻撃を与える\n後方範囲技\n自分自身にも反動ダメージ有",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ/ヌブール村)\nサベージ ランサー\nサベージ ナイト\nサベージ ランサーロード\nギガース",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%E4",
    "power": "1.5\n(1.35)",
    "move": "×"
  },
  {
    "id": "tech-e5e6cb266e-861a5bc2a9-80",
    "name": "ドラゴン フォール",
    "kind": "テクニック",
    "category": "槍",
    "requirements": [
      {
        "skill": "槍",
        "min": 80
      }
    ],
    "successSkill": "槍",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "181",
    "delay": "1070\n※",
    "description": "大ジャンプを行い 落下中に\n空中制動して頭上から槍を突き立てる\n着弾点中心の小範囲技",
    "transfer": "×",
    "acquisition": "サベージ ランサー\nサベージ ナイト\nサベージ ランサーロード\nウォーター ウンディーネ\nギガース",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%E4",
    "power": "1.6\n(1.45)",
    "move": "△"
  },
  {
    "id": "tech-e5e6cb266e-8374e70dc8-90",
    "name": "デドリー ホロウ",
    "kind": "テクニック",
    "category": "槍",
    "requirements": [
      {
        "skill": "槍",
        "min": 90
      }
    ],
    "successSkill": "槍",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "175\n(24-30)",
    "delay": "690",
    "description": "ダメージを与えながら前方に突進する\n連撃技。途中でミスると技の発動は終了する。\n1発目単体攻撃、2発目以降は範囲攻撃。",
    "transfer": "×",
    "acquisition": "サベージ ランサー\nサベージ ナイト\nサベージ ランサーロード\nサベージ ドルイドロード\nギガース\nブラッド ゴーレム",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%E4",
    "power": "下記\n参照",
    "move": "△"
  },
  {
    "id": "tech-87d892e099-ce82a9621f-1",
    "name": "バイト",
    "kind": "テクニック",
    "category": "牙",
    "requirements": [
      {
        "skill": "牙",
        "min": 1
      }
    ],
    "successSkill": "牙",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "130",
    "delay": "770",
    "description": "敵に強く噛みつき ダメージを与える\nhit時にST少量回復。回復値はスキル値依存\n発動時間130表記だが実際には110",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%E7",
    "move": "○"
  },
  {
    "id": "tech-87d892e099-1d012c885a-20",
    "name": "ブラッド サック",
    "kind": "テクニック",
    "category": "牙",
    "requirements": [
      {
        "skill": "牙",
        "min": 20
      }
    ],
    "successSkill": "牙",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "180",
    "delay": "1180",
    "description": "対象に激しく噛みつき 吸い取った血でHPを回復する\n魔法攻撃扱い（必中、半減レジスト判定有）\n回復量はダメージと等量",
    "transfer": "×",
    "acquisition": "NPC販売\nクエスト報酬（暗使）",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%E7",
    "move": "○"
  },
  {
    "id": "tech-87d892e099-288299557e-30",
    "name": "ハンガー バイト",
    "kind": "テクニック",
    "category": "牙",
    "requirements": [
      {
        "skill": "牙",
        "min": 30
      }
    ],
    "successSkill": "牙",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "127",
    "delay": "1027",
    "description": "対象を牙で噛み付いて、喉を乾かし空腹にさせる\n攻撃スピードも少し遅くなる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%E7",
    "move": "×"
  },
  {
    "id": "tech-87d892e099-7aea258f95-40",
    "name": "ワーウルフ",
    "kind": "テクニック",
    "category": "牙",
    "requirements": [
      {
        "skill": "牙",
        "min": 40
      }
    ],
    "successSkill": "牙",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "140",
    "delay": "990",
    "description": "狼に変身して 特殊な身体特性を身につける\n魔力が下がる代わりに、回避率と耐風属性が増加する\n変身系Buff\nジャンプで任意に解除される",
    "transfer": "×",
    "acquisition": "NPC販売\nクエスト報酬（暗使）",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%E7",
    "move": "×"
  },
  {
    "id": "tech-87d892e099-352f90aabb-50",
    "name": "グール ファング",
    "kind": "テクニック",
    "category": "牙",
    "requirements": [
      {
        "skill": "牙",
        "min": 50
      }
    ],
    "successSkill": "牙",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "180",
    "delay": "870",
    "description": "怨霊を宿らせた一撃で 敵をマヒさせる\n対象がダメージを受けると解除される",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%E7",
    "move": "×"
  },
  {
    "id": "tech-87d892e099-589e8eab2b-60",
    "name": "ブラッド シェアー",
    "kind": "テクニック",
    "category": "牙",
    "requirements": [
      {
        "skill": "牙",
        "min": 60
      }
    ],
    "successSkill": "牙",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "150",
    "delay": "1150",
    "description": "人型の対象に噛み付き 一定時間だけ自分の支配下におく\n調教50「マンカインド フェイタライズ」と同一の技\n(ペットにできる種類、捕獲条件、運用方法も同じ)",
    "transfer": "×",
    "acquisition": "NPC販売(ヌブール村)\nクエスト報酬（暗使）\nハンナイムサマス\nデミトリー(WarAge)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%E7",
    "move": "○"
  },
  {
    "id": "tech-87d892e099-0fafd76122-70",
    "name": "ハッキング バイト",
    "kind": "テクニック",
    "category": "牙",
    "requirements": [
      {
        "skill": "牙",
        "min": 70
      }
    ],
    "successSkill": "牙",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "170",
    "delay": "1170",
    "description": "対象に噛み付き かかっているBuffやDebuff効果を2つ奪い取る",
    "transfer": "×",
    "acquisition": "ハンナイムサマス\nゾンビオルヴァン\nデミトリー(WarAge)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%E7",
    "move": "○"
  },
  {
    "id": "tech-87d892e099-96a02d96a7-80",
    "name": "バット フォーム",
    "kind": "テクニック",
    "category": "牙",
    "requirements": [
      {
        "skill": "牙",
        "min": 80
      }
    ],
    "successSkill": "牙",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "20",
    "delay": "2020",
    "description": "一定時間コウモリに変身し 空を飛べるようになる\n効果中はBuffの効果時間が増加する\n変身系Buff",
    "transfer": "×",
    "acquisition": "ジャイアントバット(WarAge)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%E7",
    "move": "×"
  },
  {
    "id": "tech-87d892e099-0e1e9a136a-90",
    "name": "ブラッド レイン",
    "kind": "テクニック",
    "category": "牙",
    "requirements": [
      {
        "skill": "牙",
        "min": 90
      }
    ],
    "successSkill": "牙",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "200",
    "delay": "1100",
    "description": "吸い取った血を上空に噴射して血の池を作り 敵をおびき寄せる\n吸い寄せられた敵は、スタミナを消耗して攻撃速度が遅くなる\n範囲技\nスタミナ減少効果は対象のACで軽減される",
    "transfer": "×",
    "acquisition": "ハンナイムサマス\nブラッド ゴーレム\nサベージナイト\nサベージランサーロード\nキングザブール\nデミトリー(WarAge)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%E7",
    "move": "×"
  },
  {
    "id": "tech-f4582800cf-0984f288f1-1",
    "name": "アミティ ミミック",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 1
      }
    ],
    "successSkill": "物まね",
    "successRequired": 1,
    "cost": {
      "st": 9
    },
    "castTime": "100\n(30-35)",
    "delay": "600",
    "description": "敵の声色を真似て 自分に注意を引きつける\n→\n挑発技",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-954d7fd3b5-20",
    "name": "コーリング ミミック",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 20
      }
    ],
    "successSkill": "物まね",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "160\n(72-77)",
    "delay": "760",
    "description": "対象の近くにいる全ての敵の注意を引きつける\n範囲技\n→\n挑発技",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-87f564c2ff-30",
    "name": "マーメイド ミミック",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 30
      }
    ],
    "successSkill": "物まね",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "50\n(18-23)",
    "delay": "2250",
    "description": "一定時間、泳ぐスピードが上昇する\nスキルが高くなるとディレイが短くなる\n水泳モーションがドルフィンキックに変わる",
    "transfer": "○",
    "acquisition": "カオスウンディーネ\n下忍",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-6bdee1380b-40",
    "name": "スケープゴート ミミック",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 40
      }
    ],
    "successSkill": "物まね",
    "successRequired": 40,
    "cost": {
      "st": 21
    },
    "castTime": "110\n(36-41)",
    "delay": "1150",
    "description": "一定時間、全てのダメージを 案山子に身代わりにさせる\n効果時間内(2.4秒)に受ける物理ダメージを軽減、魔法を無効化",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ\n下忍",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-0bc91d256d-50",
    "name": "ネイチャー ミミック",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 50
      }
    ],
    "successSkill": "物まね",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "150\n(54-59)",
    "delay": "1250",
    "description": "周りの風景に溶け込み 姿を隠す\n→\nタゲ切り技",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ\n下忍",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-784c1ecc44-60",
    "name": "ハラキリ ミミック",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 60
      }
    ],
    "successSkill": "物まね",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "260\n(102-107)",
    "delay": "1460",
    "description": "自分の腹を斬り 死んだふりをする\n※ダメージは受けるが 死ななければ回復する\n※死んだ振りをしている間に 行動をとると技の効果はキャンセルされる\n47〜53程度のダメージを受けた後、その約2倍のHPを回復する\n使用から回復効果発動まで10秒ほど時間が掛かる",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-2d817b1db8-70",
    "name": "オールド ミラージュ ミミック",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 70
      }
    ],
    "successSkill": "物まね",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "150\n(54-59)",
    "delay": "1350",
    "description": "自然な姿のニューター男を出現させ 敵を惑わせる\nミラージュミミックと共通のディレイ",
    "transfer": "×",
    "acquisition": "複製",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-6c3f8159ba-70",
    "name": "ミラージュ ミミック",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 70
      }
    ],
    "successSkill": "物まね",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "150\n(54-59)",
    "delay": "1350",
    "description": "自分にソックリの分身を出現させ 敵を惑わせる\n約17秒間、分身が4体出現\nペットコマンドで使役できる",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ/ヌブール村)\nアマゾネススマッシャー\nデビルクロウ\n暗殺者",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-320695b333-80",
    "name": "シャドウ ハイド",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 80
      }
    ],
    "successSkill": "物まね",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "150\n(54-59)",
    "delay": "1150",
    "description": "対象の影に潜み 後をつける\n透明状態になり対象を強制的に自動追尾する\n→\nタゲ切り技",
    "transfer": "×",
    "acquisition": "アマゾネススマッシャー\nデビルクロウ\n暗殺者",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-a780cd9ea2-90",
    "name": "セブン ソウルズ",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 90
      }
    ],
    "successSkill": "物まね",
    "successRequired": 90,
    "cost": {
      "st": 53
    },
    "castTime": "200\n(？-？)",
    "delay": "2200",
    "description": "SGKの分身を7体同時に召喚し攻撃する\n使用アイテム：原初の粉",
    "transfer": "",
    "acquisition": "原初の泉(火の門)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-6aec2a416d-90",
    "name": "チャーム ダンス",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 90
      }
    ],
    "successSkill": "物まね",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "250\n(204-209)",
    "delay": "1250",
    "description": "身につけている装備を脱いで 敵を惑わす\n範囲技、ヘイト上昇無し、詠唱妨害効果有り\n強制的に対象を180度回転させ、ターゲットを強制解除させる\n自分の胴装備が外れる\n→\n挑発技",
    "transfer": "×",
    "acquisition": "アマゾネススマッシャー\nデビルクロウ\nサベージナイト\nサベージランサーロード\nサベージキング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-f4582800cf-8dd741c6fb-90",
    "name": "パーフェクト ミミック",
    "kind": "テクニック",
    "category": "物まね",
    "requirements": [
      {
        "skill": "物まね",
        "min": 90
      }
    ],
    "successSkill": "物まね",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "150",
    "delay": "3600",
    "description": "ターゲットした対象と同じ姿に変装することができる\n※一部の対象には使用することができません\n※メモリーズ ボックスで秘伝の書に戻すことができる\n効果時間は固定60秒",
    "transfer": "○",
    "acquisition": "ドッペルゲンガー\n錬金-第3.5弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%AA%A4%DE%A4%CD"
  },
  {
    "id": "tech-971b6e5a0a-5c8df624bc-78d5766b6a",
    "name": "ガトリング・キャロル",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "音楽",
        "min": 0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 0,
    "cost": {},
    "castTime": "?",
    "delay": "?",
    "description": "「古代の聖歌・ガトリング」",
    "transfer": "",
    "acquisition": "'05/12 神竜の封印",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-43149d2819-78d5766b6a",
    "name": "ガード・キャロル",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "音楽",
        "min": 0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 0,
    "cost": {},
    "castTime": "?",
    "delay": "?",
    "description": "「古代の聖歌・ガード」",
    "transfer": "",
    "acquisition": "'05/12 神竜の封印",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-7154f76ce6-78d5766b6a",
    "name": "キャノン・キャロル",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "音楽",
        "min": 0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 0,
    "cost": {},
    "castTime": "?",
    "delay": "?",
    "description": "「古代の聖歌・キャノン」",
    "transfer": "",
    "acquisition": "'05/12 神竜の封印",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-5b6f07b0a3-0",
    "name": "ジャン拳 グー",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 0,
    "cost": {
      "st": 0.0
    },
    "castTime": "180",
    "delay": "360",
    "description": "5本の指をすべて握った状態で「石」を表している\n発動に必要なBuff : ハンド フォーム or ジャン拳ハンド",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "17' 7月 ジャンケン ハンド登場！\n170725"
  },
  {
    "id": "tech-971b6e5a0a-eb5a480b80-0",
    "name": "ジャン拳 チョキ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 0,
    "cost": {
      "st": 0.0
    },
    "castTime": "180",
    "delay": "360",
    "description": "5本の指のうち2本を伸ばした状態で残りを握ることで「鋏」を表している\n発動に必要なBuff : ハンド フォーム or ジャン拳ハンド",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "17' 7月 ジャンケン ハンド登場！\n170725"
  },
  {
    "id": "tech-971b6e5a0a-1c8578a39c-0",
    "name": "ジャン拳 パー",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 0,
    "cost": {
      "st": 0.0
    },
    "castTime": "180",
    "delay": "360",
    "description": "5本の指をすべて開いた状態で「紙」を表している\n発動に必要なBuff : ハンド フォーム or ジャン拳ハンド",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "17' 7月 ジャンケン ハンド登場！\n170725"
  },
  {
    "id": "tech-971b6e5a0a-fc52177f2c-0",
    "name": "トリック スロウ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "投げ",
        "min": 0
      }
    ],
    "successSkill": "投げ",
    "successRequired": 0,
    "cost": {
      "st": 5.0
    },
    "castTime": "80",
    "delay": "680",
    "description": "サンタ ナイトを懲らしめるために 子供たちが考えた悪戯技\n使用アイテム : クリスマス リース 1",
    "transfer": "",
    "acquisition": "'06 クリスマスイベント\n子供達に希望の光を",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "100\n固定",
    "move": "○"
  },
  {
    "id": "tech-971b6e5a0a-2679eecb38-0",
    "name": "ニードル スロウ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "投げ",
        "min": 0
      }
    ],
    "successSkill": "投げ",
    "successRequired": 0,
    "cost": {
      "st": 10.0
    },
    "castTime": "77",
    "delay": "247",
    "description": "針を投げつける\n使用アイテム : 針の束",
    "transfer": "",
    "acquisition": "'05/10 公式イベント\n仁義無き大運動会",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "1\n固定",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-595874d0f1-78d5766b6a",
    "name": "バリア・キャロル",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "音楽",
        "min": 0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 0,
    "cost": {},
    "castTime": "?",
    "delay": "?",
    "description": "「古代の聖歌・バリア」",
    "transfer": "",
    "acquisition": "'05/12 神竜の封印",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-36e895ddf3-0",
    "name": "ホーリーライト グリーン",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 0,
    "cost": {
      "mp": 5.0
    },
    "castTime": "135",
    "delay": "200",
    "description": "やさしい光の力を放つ",
    "transfer": "×",
    "acquisition": "'06 クリスマスイベント\n子供達に希望の光を\n錬金-第2弾\n*1",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "reagent": "ND1",
    "range": ""
  },
  {
    "id": "tech-971b6e5a0a-21791e79b9-0",
    "name": "ホーリーライト レッド",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 0,
    "cost": {
      "mp": 5.0
    },
    "castTime": "135",
    "delay": "200",
    "description": "暖かい光の力を放つ",
    "transfer": "×",
    "acquisition": "'06 クリスマスイベント\n子供達に希望の光を\n錬金-第2弾\n*1",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "reagent": "ND1",
    "range": ""
  },
  {
    "id": "tech-971b6e5a0a-18d8ed2e4c-0",
    "name": "ミニ セイクリッド・ブラスト",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "銃器",
        "min": 0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "1150",
    "description": "使用アイテム : ノア・フュエル 1\nエフェクトのみで、ダメージ・ヘイト上昇無し",
    "transfer": "×",
    "acquisition": "'11 クリスマスイベント報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-f163694ad8-7f095f6964",
    "name": "ロール パンチ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "素手",
        "min": 0
      }
    ],
    "successSkill": "素手",
    "successRequired": 0,
    "cost": {},
    "castTime": "",
    "delay": "",
    "description": "使用アイテム : 球体図鑑",
    "transfer": "",
    "acquisition": "'05/10 公式イベント\n仁義無き大運動会",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-ebf027ad0a-78d5766b6a",
    "name": "ワープ・キャロル",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "音楽",
        "min": 0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 0,
    "cost": {},
    "castTime": "?",
    "delay": "?",
    "description": "「古代の聖歌・ワープ」",
    "transfer": "",
    "acquisition": "'05/12 神竜の封印",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-e989c7d0e1-1",
    "name": "エキサイティング リアクション",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "40",
    "delay": "540",
    "description": "興奮したポーズ\n発動に必要なBuff :\n鑑賞モード",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン(250812-250819)"
  },
  {
    "id": "tech-971b6e5a0a-4ae498c7c7-1",
    "name": "グラウンド トリック",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "180",
    "delay": "680",
    "description": "平らなバーンで華麗なトリックを決める",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "もえガチャ(前提装備)\n初出210119"
  },
  {
    "id": "tech-971b6e5a0a-1ddfef7e14-1",
    "name": "サクリファイス・キャロル",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "音楽",
        "min": 1.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 1.0,
    "cost": {
      "st": 0.0
    },
    "castTime": "320",
    "delay": "18270",
    "description": "機体を内部破壊させて、敵を巻き添えにする\nノア タイタン専用テクニック\nただし、現在は使用できない",
    "transfer": "",
    "acquisition": "'05/12 神竜の封印",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-e75de0f4cd-1",
    "name": "スイカ割り",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 1.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "600",
    "description": "スイカを力いっぱい叩く技\n※スイカ割りチャレンジのBuffが付いているときのみ使用可能",
    "transfer": "",
    "acquisition": "'11 スイカ割りイベント",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-979599698a-1",
    "name": "フェイスエモーション（哀）",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "650",
    "description": "一定時間、泣き顔のエフェクトが表示される",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "181023実装"
  },
  {
    "id": "tech-971b6e5a0a-f53e257929-1",
    "name": "フェイスエモーション（喜）",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "650",
    "description": "一定時間、笑い顔のエフェクトが表示される",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "181023実装"
  },
  {
    "id": "tech-971b6e5a0a-2500bc2d38-1",
    "name": "フェイスエモーション（怒）",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "650",
    "description": "一定時間、怒り顔のエフェクトが表示される",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "181023実装"
  },
  {
    "id": "tech-971b6e5a0a-e7de3d163b-1",
    "name": "フラワー シャワー",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "240",
    "delay": "420",
    "description": "花びらを下から上に投げ上げて祝福する",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン(190528-190604)"
  },
  {
    "id": "tech-971b6e5a0a-5ea219f034-1",
    "name": "ポンコツの儀",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 1.0
    },
    "castTime": "220",
    "delay": "216000",
    "description": "復活させることを 強いられている",
    "transfer": "",
    "acquisition": "'12/01 ロッタン復活の儀",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-175d87f95f-1",
    "name": "参拝",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "900",
    "delay": "1400",
    "description": "二礼二拍一礼",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン(231226-240109)"
  },
  {
    "id": "tech-971b6e5a0a-a508810fc5-1",
    "name": "心臓を捧げよ！",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 1.0
    },
    "castTime": "190",
    "delay": "390",
    "description": "右手を心臓に当てて敬礼するモーション",
    "transfer": "○",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "×",
    "note": "『 進撃の巨人 』コラボ\n2014年3月課金\n特設サイト\n公式サイト\n紹介動画\n。"
  },
  {
    "id": "tech-971b6e5a0a-e5ae076cfe-1",
    "name": "牛乳を注ぐ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "300",
    "delay": "800",
    "description": "使用アイテム: ミルク 1",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": ""
  },
  {
    "id": "tech-971b6e5a0a-373953efd6-1",
    "name": "選べるヒーローポーズ集",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "40",
    "delay": "540",
    "description": "戦隊モノの決めポーズ\n5種類のヒーローポーズから一つを選択して入手できる\n※USEすると取り出す技書を選択できる\n※アイテムスロットに1スロットの空きが必要です",
    "transfer": "開封前：○\n開封後：○",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "171219実装\n公式告知のSS\nで、\n左から「 ヒーローポーズ3 / 2 / 1 / 4 / 5 」"
  },
  {
    "id": "tech-971b6e5a0a-2-1",
    "name": "選べるヒーローポーズ集2",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "40",
    "delay": "540",
    "description": "戦隊モノの決めポーズ\n5種類のヒーローポーズから一つを選択して入手できる\n※USEすると取り出す技書を選択できる\n※アイテムスロットに1スロットの空きが必要です",
    "transfer": "開封前：○\n開封後：○",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "230704実装\n公式告知ページ"
  },
  {
    "id": "tech-971b6e5a0a-eb991dde03-1",
    "name": "選べる忍者ポーズ集",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "40",
    "delay": "540",
    "description": "忍者の決めポーズ\n壱/弐/参/肆/伍から1つ選択",
    "transfer": "○",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "もえガチャ初出250304\n公式告知ページ"
  },
  {
    "id": "tech-971b6e5a0a-b7c46931a5-1",
    "name": "Ｂ.Ｓ.Ｐ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "700",
    "description": "剣を肩で担ぐようなポーズ",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン(210831-210907)\n210907実装"
  },
  {
    "id": "tech-971b6e5a0a-5dc2b05a01-1",
    "name": "Ｃ.Ｋ.Ｄ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "50",
    "delay": "550",
    "description": "腰を低くして腕を組み、足を高く上げる独特なダンス\n(コサックダンス)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン\n161220"
  },
  {
    "id": "tech-971b6e5a0a-0154f32001-1",
    "name": "Ｃ.Ｎ.Ｔ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "500",
    "description": "レフェリーによるフォール技に対するカウント",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン(200225-200303)\n200303実装"
  },
  {
    "id": "tech-971b6e5a0a-2450cf5455-1",
    "name": "Ｄ.Ｄ.Ｋ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "700",
    "description": "駄々っ子のようなモーション",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "×",
    "note": "課金キャンペーン\n(1609??〜160913)\n160913実装\n公式サイトはこちら\n紹介動画はこちら"
  },
  {
    "id": "tech-971b6e5a0a-3e44a9ec30-1",
    "name": "Ｆ.Ｓ.Ｍ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "300",
    "delay": "800",
    "description": "フィギュアの回転モーション\nフィギュア・スピン・モーション(？)",
    "transfer": "○",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "×",
    "note": "2015年6月課金\n150623実装\n公式サイトはこちら\n紹介動画はこちら"
  },
  {
    "id": "tech-971b6e5a0a-df490be57d-1",
    "name": "Ｇ.Ｄ.Ｄ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "720",
    "delay": "1220",
    "description": "激しい動きで踊る\n(\nGet Down Dance\n)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン(220913-220920)\n220920実装"
  },
  {
    "id": "tech-971b6e5a0a-e0de690203-1",
    "name": "Ｈ.Ｂ.Ｂ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "700",
    "description": "無数の風船が浮かび上がる\n(HappyBirthdayBalloon)\n(Twitterの風船を飛ばすことができなかった怨念と思われる)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン(220705-220712)\n220712実装\n紹介ツイートはこちら"
  },
  {
    "id": "tech-971b6e5a0a-d3552c0957-1",
    "name": "Ｈ.Ｂ.Ｇ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "1000",
    "description": "リズムに合わせて、頭を激しく上下に振るモーション\n(ヘッドバンキング)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン(190618-190625)\n190625実装"
  },
  {
    "id": "tech-971b6e5a0a-0f657d2d1b-1",
    "name": "Ｈ.Ｋ.Ｓ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 1.0
    },
    "castTime": "180",
    "delay": "380",
    "description": "くしゃみをするモーション。",
    "transfer": "○",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "×",
    "note": "140909実装\n14' 9月 『 タツノコプロ 』コラボクエスト\n「アクビ迷子でごじゃるの話」報酬"
  },
  {
    "id": "tech-971b6e5a0a-c489b2f019-1",
    "name": "Ｉ.Ｆ.Ｐ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "230",
    "delay": "730",
    "description": "アイドルの決めポーズ\nIdol Finish Pose",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "ミラクルサマーガチャ2020\n初出200728実装"
  },
  {
    "id": "tech-971b6e5a0a-07ca14b193-1",
    "name": "Ｉ.Ｇ.Ｐ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 0.0
    },
    "castTime": "270",
    "delay": "770",
    "description": "アイドルのために捧げる応援のパフォーマンス\nアイドル・ギーク・パフォーマンス",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "×",
    "note": "2015年7月課金\n150707実装\n公式サイトはこちら\n紹介動画はこちら"
  },
  {
    "id": "tech-971b6e5a0a-f0c6e16820-1",
    "name": "Ｉ.Ｎ.Ｄ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "750",
    "delay": "1240",
    "description": "みんなで楽しく盛り上がれるダンス\nオリエンタルなダンス(インド)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "×",
    "note": "150407実装\n公式サイトはこちら\n紹介動画はこちら\n2015年3月課金"
  },
  {
    "id": "tech-971b6e5a0a-bf8bfbd034-1",
    "name": "Ｋ.Ｋ.Ｄ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "580",
    "delay": "1080",
    "description": "切れのあるダンスを披露する\n(\nキレキレダンス\n)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "2015年7月課金\n150804実装\n公式サイトはこちら\n紹介動画はこちら"
  },
  {
    "id": "tech-971b6e5a0a-68d89be6ea-1",
    "name": "Ｌ.Ｄ.Ｍ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "1200",
    "description": "腰に手を当てて交互に足を上げるモーション\n(ラインダンスモーション)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン\n(160315〜160322)\n160322実装"
  },
  {
    "id": "tech-971b6e5a0a-1b24e2f0c1-1",
    "name": "Ｍ.Ｃ.Ｍ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "648",
    "delay": "1648",
    "description": "変身シーンを自作自演できる、これであなたも正義の味方\n(マジカルチェンジモーション？)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン\n(160308〜160315)\n160315実装"
  },
  {
    "id": "tech-971b6e5a0a-5b47c3c8b9-1",
    "name": "Ｍ.Ｋ.Ｄ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "350",
    "delay": "850",
    "description": "両腕を上下に振りながら楽しそうに踊る\n(モンキーダンス)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "2015年11月課金\n第2弾\n151117実装\n公式サイトはこちら\n紹介動画はこちら"
  },
  {
    "id": "tech-971b6e5a0a-4e2ad45835-1",
    "name": "Ｐ.Ｏ.Ｒ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "300",
    "delay": "900",
    "description": "死者に捧ぐ 蘇生の祈り\n使用アイテム : ノアワーシップドール 1\n(「Prayer Of Resurrection」？)\n※\n170321パッチ\nで、秘伝の書から特殊条件 NT/OPを削除",
    "transfer": "",
    "acquisition": "Mora's Closet\n('\n04 クリスマスイベント\n)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-e9480ad1d1-1",
    "name": "Ｒ.Ｂ.Ｆ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "120",
    "delay": "620",
    "description": "ロボトルファイト！",
    "transfer": "×",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "×",
    "note": "231003実装\n『メダロット』 コラボ\n交換報酬"
  },
  {
    "id": "tech-971b6e5a0a-154dbda34c-1",
    "name": "Ｒ.Ｄ.Ｇ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "270",
    "delay": "770",
    "description": "華麗に回転しながら豪快に土下座をする\n(\nローリング土下座)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "2015年8月課金\n150818実装\n公式サイトはこちら\n紹介動画はこちら"
  },
  {
    "id": "tech-971b6e5a0a-0af3053912-1",
    "name": "Ｒ.Ｄ.Ｍ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "700",
    "description": "弧を描くようにクルクル回るダンスモーション\nローリング・ダンス・モーション",
    "transfer": "○",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "×",
    "note": "2015年4月課金\n150428実装\n公式サイトはこちら\n紹介動画はこちら"
  },
  {
    "id": "tech-971b6e5a0a-i-1",
    "name": "Ｓ.I.Ｚ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "220",
    "delay": "820",
    "description": "膝を揃えて畳んで座る\n(正座)",
    "transfer": "○",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "×",
    "note": "150303実装\n2015年2月課金\n公式サイトはこちら"
  },
  {
    "id": "tech-971b6e5a0a-44271532bf-1",
    "name": "Ｓ.Ｃ.Ｐ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "1500",
    "description": "カッコいいポーズで周囲の人を魅了する。",
    "transfer": "○",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "140902実装\n2014年8月課金\n公式サイトはこちら\n公式サイトで見られないので参考\n※備考：\n参考（元ネタ？）：検索「魔方陣グルグル 光魔法」"
  },
  {
    "id": "tech-971b6e5a0a-f69e41b40d-1",
    "name": "Ｓ.Ｆ.Ｐ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "120",
    "delay": "620",
    "description": "輪郭を隠して小顔に見せるポーズ\n(Small.Face.Pose)",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン(240319-240326)"
  },
  {
    "id": "tech-971b6e5a0a-cef1066fc9-1",
    "name": "Ｓ.Ｇ.Ｐ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "280",
    "delay": "780",
    "description": "剣を地面に突き立てて構えるポーズ",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン(210525-210601)\n210601実装"
  },
  {
    "id": "tech-971b6e5a0a-8a3081388c-1",
    "name": "Ｓ.Ｎ.Ｓ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "700",
    "delay": "1200",
    "description": "シンクロナイズドスイミングの演技をするモーション",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "160531実装"
  },
  {
    "id": "tech-971b6e5a0a-9cbdad4d67-1",
    "name": "Ｗ.Ｉ.Ｎ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "700",
    "description": "戦闘に勝利した時の決めポーズ（剣Ver.）\n勝利のファンファーレのようなSEが鳴る",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "課金キャンペーン\n(160830)\n160906実装"
  },
  {
    "id": "tech-971b6e5a0a-311218d24f-1",
    "name": "Ｙ.Ｗ.Ｐ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 1.0
    },
    "castTime": "330",
    "delay": "830",
    "description": "ヤッターマンの勝利のポーズ\n勝利のファンファーレのようなSEが鳴る",
    "transfer": "○",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "move": "",
    "note": "140924実装（140926よりガチャ登場）\n特別ガチャ"
  },
  {
    "id": "tech-971b6e5a0a-ba5f4b661f-11",
    "name": "ヒーリング・キャロル",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "音楽",
        "min": 11.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 11.0,
    "cost": {
      "st": 0.0
    },
    "castTime": "60",
    "delay": "560",
    "description": "「古代の聖歌・ヒーリング」\n行動を止めて回復する。\nノア タイタン専用テクニック\nただし、現在は使用できない",
    "transfer": "",
    "acquisition": "'05/12 神竜の封印",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-63d0b7af5b-30",
    "name": "マインド インパクト",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "精神力",
        "min": 30.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "80",
    "delay": "680",
    "description": "魔力を 込めた光の弾を飛ばす\n※精神力が高いほど威力が上がる技\n発動に必要なBuff : ナールドスタッフ",
    "transfer": "",
    "acquisition": "サベージ ドルイドロード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "1.0",
    "move": "○"
  },
  {
    "id": "tech-971b6e5a0a-63d763351c-30",
    "name": "Ｍ インパクト",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "精神力",
        "min": 30.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "80",
    "delay": "900",
    "description": "魔力を込めた光の珠を飛ばす\n※精神力が高いほど威力があがる技\n両手武器専用",
    "transfer": "",
    "acquisition": "サベージ ドルイド ロード\nリザードマン メイジ\n錬金-第3.5弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "精神*1.1",
    "move": "○"
  },
  {
    "id": "tech-971b6e5a0a-73c62b84a0-40",
    "name": "ガトリング ショット",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "銃器",
        "min": 40.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 40.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "295",
    "delay": "750",
    "description": "銃器による連射が可能となる\n※銃器を酷使するため 損傷が大きい\n発動に必要なBuff ガンナーの極意\n現状、GG-00試作型の専用技\nガンナーの極意Buff中は銃器持ち替え不可",
    "transfer": "",
    "acquisition": "もえガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-a843e6dc8a-60",
    "name": "クイック ショット",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "銃器",
        "min": 60.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 60.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "160",
    "delay": "800",
    "description": "攻撃力は低下するが、銃器のディレイを大幅に短縮できる\n発動に必要なBuff 特殊効果:ドワーヴンライフル",
    "transfer": "×",
    "acquisition": "狙撃手ドワーフ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "-",
    "move": ""
  },
  {
    "id": "tech-971b6e5a0a-013f66c667-60",
    "name": "シャドウ バインド",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "弓",
        "min": 60.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "160",
    "delay": "900",
    "description": "直接ダメージは期待できないが、対象の動きを止めることができる\n発動に必要なBuff 特殊効果:コンポジット ボウ\n与ダメージ無し",
    "transfer": "○",
    "acquisition": "サベージ キング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "0.0",
    "move": "×"
  },
  {
    "id": "tech-971b6e5a0a-b4f72e7648-60",
    "name": "ブラスト スラッシュ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 60.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "100",
    "delay": "900",
    "description": "疾風の如く 対象へ斬撃を飛ばす攻撃\n発動に必要なBuff 特殊効果:ロングソード",
    "transfer": "○",
    "acquisition": "タルタロッサ キャプテン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "0.7",
    "move": "×"
  },
  {
    "id": "tech-971b6e5a0a-3807915290-60",
    "name": "ワイルド ヒット",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 60.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "220",
    "delay": "900",
    "description": "素早く３連打を繰り出す\n発動に必要なBuff 特殊効果：ウォーメイス",
    "transfer": "○",
    "acquisition": "タルタロッサ パラディン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "1.4",
    "move": "○"
  },
  {
    "id": "tech-971b6e5a0a-41dd5547bd-60",
    "name": "ヴィジット ウェイブ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "槍",
        "min": 60.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "180",
    "delay": "900",
    "description": "突き立てた槍が、幻影の高波を引き起こし\n対象を巻き込む\n発動に必要Buff 特殊効果:バトルフォーク",
    "transfer": "○",
    "acquisition": "サベージ ランサー\nサベージ ランサーロード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "0.75",
    "move": "×"
  },
  {
    "id": "tech-971b6e5a0a-331d830a7c-60",
    "name": "Ｑ ショット",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "銃器",
        "min": 60.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 60.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "160",
    "delay": "1200",
    "description": "銃器のディレイを大幅に短縮できる\n※攻撃力上昇系の技や魔法と重複しません",
    "transfer": "",
    "acquisition": "狙撃手 ドワーフ\n錬金-第3.5弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "-",
    "move": "○"
  },
  {
    "id": "tech-971b6e5a0a-bef518ac01-60",
    "name": "Ｓ バインド",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "弓",
        "min": 60.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "160",
    "delay": "900",
    "description": "直接ダメージは期待できないが、対象の動きを止めることができる",
    "transfer": "",
    "acquisition": "サベージ キング\nリザードマン スナイパー\nリザードマン アーチャー\n錬金-第3.5弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "0.1",
    "move": "○"
  },
  {
    "id": "tech-971b6e5a0a-2fad01590b-60",
    "name": "Ｖ ウェイブ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "槍",
        "min": 60.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "180",
    "delay": "1200",
    "description": "突き立てた槍が、幻影の高波を引き起こし\n対象を巻き込む",
    "transfer": "",
    "acquisition": "サベージ ランサーロード\nリザードマン ソルジャー(槍)\n錬金-第3.5弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "0.75",
    "move": "×"
  },
  {
    "id": "tech-971b6e5a0a-c3503ecee9-80",
    "name": "アース ブロウ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 80.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "260",
    "delay": "1000",
    "description": "強烈な一振りから生み出された衝撃が大地を駆け抜ける\n発動に必要なBuff 特殊効果:バトルアックス",
    "transfer": "○",
    "acquisition": "タルタロッサ キング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "1.25",
    "move": "×"
  },
  {
    "id": "tech-971b6e5a0a-1df28c8f00-80",
    "name": "スピリチュアル ブラント",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 80.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "250",
    "delay": "1000",
    "description": "魂をこめた渾身の一撃\n発動に必要なBuff 特殊効果：ウォーハンマー",
    "transfer": "○",
    "acquisition": "ジャイアント",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "1.7",
    "move": "×"
  },
  {
    "id": "tech-971b6e5a0a-4fc33586b5-80",
    "name": "デス ミスチェ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 80.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "180",
    "delay": "1000",
    "description": "死神が対象の行動を制限させる\n死神に目を付けられた者は視界を遮られ逃げ惑うことしかできなくなる\n発動に必要なBuff 特殊効果:サイス\n与ダメージ無し",
    "transfer": "○",
    "acquisition": "アスモダイ デューク",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "-",
    "move": "×"
  },
  {
    "id": "tech-971b6e5a0a-859e0980a4-80",
    "name": "バーン ピール",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "槍",
        "min": 80.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "280",
    "delay": "1000",
    "description": "雷を呼び寄せ 周囲の敵を焼き払う\n発動に必要Buff 特殊効果:トライデント",
    "transfer": "○",
    "acquisition": "サベージ ランサー\nサベージ ランサーロード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "0.9",
    "move": "×"
  },
  {
    "id": "tech-971b6e5a0a-69c7e148e5-80",
    "name": "ブランディッシュ ビート",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 80.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "240",
    "delay": "1000",
    "description": "武器を大きく振りかぶり幾多の敵を薙ぎ払う攻撃\n発動に必要なBuff 特殊効果:グレートソード",
    "transfer": "○",
    "acquisition": "サベージ ナイト\nタルタロッサ スラッシュ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "0.9",
    "move": "×"
  },
  {
    "id": "tech-971b6e5a0a-5bda85eee2-80",
    "name": "ブリッツ ラッシュ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "335",
    "delay": "1500",
    "description": "素手とキックの連続攻撃を繰り出すことができる\n※素手のみでも発動できるが キックスキルが高いとダメージが増加する\n発動に必要なBuff 特殊効果:ナックル",
    "transfer": "○",
    "acquisition": "ボビー イムサマス",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": "○"
  },
  {
    "id": "tech-971b6e5a0a-e3bad14011-80",
    "name": "Ｂ ビート",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 80.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "190",
    "delay": "1100",
    "description": "武器を大きく振りかぶり幾多の敵を薙ぎ払う攻撃\n両手刀剣専用",
    "transfer": "",
    "acquisition": "サベージ ナイト\nリザードマン ソルジャー(刀剣)\n錬金-第3.5弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "0.95",
    "move": "×"
  },
  {
    "id": "tech-971b6e5a0a-dfd6309be8-80",
    "name": "Ｂ ラッシュ",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "275",
    "delay": "1500",
    "description": "素手とキックの連続攻撃を繰り出すことができる\n※素手のみでも発動できるがキックスキルが高いとダメージが増加する",
    "transfer": "",
    "acquisition": "ボビー イムサマス\nアントニー\n錬金-第3.5弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "",
    "move": "○"
  },
  {
    "id": "tech-971b6e5a0a-ce76cd2781-80",
    "name": "Ｓ ブラント",
    "kind": "テクニック",
    "category": "特殊",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 80.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "200",
    "delay": "1100",
    "description": "魂をこめた渾身の一撃\n両手棍棒専用",
    "transfer": "",
    "acquisition": "ジャイアント\nタルタロッサ パラディン\nリザードマン ソルジャー(棍棒)\n錬金-第3.5弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%A5%C6%A5%AF%A5%CB%A5%C3%A5%AF/%C6%C3%BC%EC",
    "power": "1.4",
    "move": "×"
  },
  {
    "id": "tech-b31c96aba3-fca69dc423-1",
    "name": "ロックピック",
    "kind": "テクニック",
    "category": "盗み",
    "requirements": [
      {
        "skill": "盗み",
        "min": 1.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "270",
    "delay": "510",
    "description": "鍵の掛かった錠をこじ開ける\n通常では開かない宝箱等を、こじ開けることが出来る\n使用アイテム : ピッキング ツール",
    "transfer": "",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%F0%A4%DF",
    "cap": "7"
  },
  {
    "id": "tech-b31c96aba3-8860d316e2-20",
    "name": "ロックオン グルー",
    "kind": "テクニック",
    "category": "盗み",
    "requirements": [
      {
        "skill": "盗み",
        "min": 20.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 20.0,
    "cost": {
      "st": 11.0
    },
    "castTime": "120",
    "delay": "1220",
    "description": "対象に接着剤を吹き付け行動を制限する\n使用アイテム : 接着剤",
    "transfer": "",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%F0%A4%DF",
    "cap": "40"
  },
  {
    "id": "tech-b31c96aba3-60a53afa1f-30",
    "name": "スティール",
    "kind": "テクニック",
    "category": "盗み",
    "requirements": [
      {
        "skill": "盗み",
        "min": 30.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "120",
    "delay": "2200",
    "description": "Mobからアイテムを盗むことができる\n※対象のHPが少ないほど成功率が上がります",
    "transfer": "",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%F0%A4%DF",
    "cap": "50"
  },
  {
    "id": "tech-b31c96aba3-ca55ce9d0c-40",
    "name": "リムーブ トラップ",
    "kind": "テクニック",
    "category": "盗み",
    "requirements": [
      {
        "skill": "盗み",
        "min": 40.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "270",
    "delay": "1270",
    "description": "罠を解除する\n仕掛けられた罠を取り除くことが出来る\n使用アイテム : ピッキング ツール",
    "transfer": "",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%F0%A4%DF",
    "cap": "60"
  },
  {
    "id": "tech-b31c96aba3-6c29b9c071-50",
    "name": "ステルス",
    "kind": "テクニック",
    "category": "盗み",
    "requirements": [
      {
        "skill": "盗み",
        "min": 50.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "60",
    "delay": "2600",
    "description": "体を特殊な装備でまとって光学迷彩化させる\n効果中は移動速度が遅くなる",
    "transfer": "",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%F0%A4%DF",
    "cap": "89.3"
  },
  {
    "id": "tech-b31c96aba3-0e8513d91b-60",
    "name": "インセーン スティール",
    "kind": "テクニック",
    "category": "盗み",
    "requirements": [
      {
        "skill": "盗み",
        "min": 60.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "120",
    "delay": "22000",
    "description": "公共施設の設置物を盗み取る\n(生産装置や敵勢力のCC/DAの設置物などを盗む)\n※ 現在 WarAge では 盗み判定はありません",
    "transfer": "",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%F0%A4%DF",
    "cap": "判定無"
  },
  {
    "id": "tech-b31c96aba3-0c5a85f819-80",
    "name": "ゴージャス スティール",
    "kind": "テクニック",
    "category": "盗み",
    "requirements": [
      {
        "skill": "盗み",
        "min": 80.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "120",
    "delay": "2200",
    "description": "Mobから希少なアイテムを盗むことが出来る\n※対象のHPが少ないほど成功率が上がります",
    "transfer": "",
    "acquisition": "宝箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C5%F0%A4%DF",
    "cap": "100"
  },
  {
    "id": "tech-4dd9294514-72f6879545-1",
    "name": "シールド ガード",
    "kind": "テクニック",
    "category": "盾",
    "requirements": [
      {
        "skill": "盾",
        "min": 1
      }
    ],
    "successSkill": "盾",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "75",
    "delay": "490",
    "description": "物理攻撃を防ぎ ダメージを減らす",
    "transfer": "○",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%E2",
    "move": "×",
    "melee": "○",
    "ranged": "○",
    "magicGuard": "×"
  },
  {
    "id": "tech-4dd9294514-0840749a7e-10",
    "name": "スパイク アタック",
    "kind": "テクニック",
    "category": "盾",
    "requirements": [
      {
        "skill": "盾",
        "min": 10
      }
    ],
    "successSkill": "盾",
    "successRequired": 10,
    "cost": {
      "st": 11
    },
    "castTime": "125\n(48-54)",
    "delay": "1200",
    "description": "装備した盾で敵を強打する\n※盾のACが高いほど大ダメージを与えます\n攻撃技",
    "transfer": "×",
    "acquisition": "NPC販売\n荒くれ グレイブン\n用心棒 グレイブン\nヘテラ\nガーディアン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%E2",
    "move": "×",
    "melee": "-",
    "ranged": "-",
    "magicGuard": "-"
  },
  {
    "id": "tech-4dd9294514-bf3feac03e-20",
    "name": "バッシュ",
    "kind": "テクニック",
    "category": "盾",
    "requirements": [
      {
        "skill": "盾",
        "min": 20
      }
    ],
    "successSkill": "盾",
    "successRequired": 20,
    "cost": {
      "st": 15
    },
    "castTime": "135",
    "delay": "790",
    "description": "盾で敵の直接攻撃を跳ね除けて、敵を無防備（被クリティカル率上昇）にさせる\nガード判定が長い\n強制的に一瞬で後ろを向かせる\n被クリティカル率上昇の効果時間は短い",
    "transfer": "○",
    "acquisition": "NPC販売\nオーク ガード\nアマゾネス ガード\nバルカー ガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%E2",
    "move": "×",
    "melee": "○",
    "ranged": "×",
    "magicGuard": "×"
  },
  {
    "id": "tech-4dd9294514-e51a3a193a-30",
    "name": "スタン ガード",
    "kind": "テクニック",
    "category": "盾",
    "requirements": [
      {
        "skill": "盾",
        "min": 30
      }
    ],
    "successSkill": "盾",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "135",
    "delay": "1200",
    "description": "直接攻撃を防ぎ ダメージを減らす\n※成功すると敵はスタン状態になる\n※スタン中は被ダメージ1割減",
    "transfer": "○",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%E2",
    "move": "×",
    "melee": "○",
    "ranged": "×",
    "magicGuard": "×"
  },
  {
    "id": "tech-4dd9294514-4658bdf487-40",
    "name": "インパクト ステップ",
    "kind": "テクニック",
    "category": "盾",
    "requirements": [
      {
        "skill": "盾",
        "min": 40
      }
    ],
    "successSkill": "盾",
    "successRequired": 40,
    "cost": {
      "st": 21
    },
    "castTime": "110",
    "delay": "900",
    "description": "盾で敵の直接攻撃を弾き飛ばし、間合いを広げる\nガード成功すると、相手にノックバック効果\nノックバック距離が大きい",
    "transfer": "○",
    "acquisition": "NPC販売\nオーク ガード\nアマゾネス ガード\nバルカー ガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%E2",
    "move": "○",
    "melee": "○",
    "ranged": "×",
    "magicGuard": "×"
  },
  {
    "id": "tech-4dd9294514-a9a2f6ae40-50",
    "name": "バンデット ガード",
    "kind": "テクニック",
    "category": "盾",
    "requirements": [
      {
        "skill": "盾",
        "min": 50
      }
    ],
    "successSkill": "盾",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "120",
    "delay": "1400",
    "description": "敵が放った遠距離攻撃を盾で受け止めて、放ってきた弾を強奪する。\nガードブレイクを受けない\n（現状ではガードブレイク属性の遠隔物理技がない）",
    "transfer": "○",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%E2",
    "move": "○",
    "melee": "×",
    "ranged": "○",
    "magicGuard": "×"
  },
  {
    "id": "tech-4dd9294514-bb7912e660-60",
    "name": "カミカゼ",
    "kind": "テクニック",
    "category": "盾",
    "requirements": [
      {
        "skill": "盾",
        "min": 60
      }
    ],
    "successSkill": "盾",
    "successRequired": 60,
    "cost": {
      "st": 27
    },
    "castTime": "240",
    "delay": "1290",
    "description": "盾に身を隠し ガードしたまま移動する\n直接攻撃のみガード可能\n※成功すると敵はスタン状態になる\nモーション終わり際にはガード判定が消える\n※スタン中は被ダメージ1割減",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ)\nオーク ガード\nアマゾネス ガード\nバルカー ガード",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%E2",
    "move": "○",
    "melee": "○",
    "ranged": "×",
    "magicGuard": "×"
  },
  {
    "id": "tech-4dd9294514-12086d127e-70",
    "name": "リベンジ ガード",
    "kind": "テクニック",
    "category": "盾",
    "requirements": [
      {
        "skill": "盾",
        "min": 70
      }
    ],
    "successSkill": "盾",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "110",
    "delay": "1400",
    "description": "自分に向けて打たれた直接攻撃と魔法のダメージを 盾で跳ね返す\nガードに成功した近接物理攻撃を反射する\n魔法はAvoidした場合のみ反射する\n矢などの飛び道具は跳ね返せない",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ/ヌブール村)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%E2",
    "move": "×",
    "melee": "○",
    "ranged": "×",
    "magicGuard": "▲"
  },
  {
    "id": "tech-4dd9294514-ce013c3add-80",
    "name": "マジック ガード",
    "kind": "テクニック",
    "category": "盾",
    "requirements": [
      {
        "skill": "盾",
        "min": 80
      }
    ],
    "successSkill": "盾",
    "successRequired": 80,
    "cost": {
      "st": 33
    },
    "castTime": "201",
    "delay": "1150",
    "description": "自分に向かって放たれた魔法を 盾で吸収する\n※完全回避に成功すると、敵が放った魔法のコストを吸収する\n魔法をAvoidした時のみ、MP吸収の効果が発生する\n全属性耐性が大幅に上昇するBuffも付く\nガードブレイクを受けない\n（現状ではガードブレイク属性の魔法がない）\nガードロストは盾無しで魔法を受けた場合のみ",
    "transfer": "×",
    "acquisition": "タルタロッサ ナイト\nタルタロッサ パラディン\nキング ザブール\nシャドウナイト",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%E2",
    "move": "○",
    "melee": "×",
    "ranged": "×",
    "magicGuard": "○"
  },
  {
    "id": "tech-4dd9294514-99504cbb43-90",
    "name": "シールディング オーラ",
    "kind": "テクニック",
    "category": "盾",
    "requirements": [
      {
        "skill": "盾",
        "min": 90
      }
    ],
    "successSkill": "盾",
    "successRequired": 90,
    "cost": {
      "st": 36
    },
    "castTime": "130",
    "delay": "1000",
    "description": "シールドガードのオーラを発し\n近くにいる仲間を守る\n味方のAC・抵抗を大幅に上昇させる範囲Buff\n非ガード技(ガードブレイクを受けない)",
    "transfer": "×",
    "acquisition": "サベージ ナイト\nサベージ ランサーロード\nサベージ ドルイドロード\nギガース\nウォーター ウンディーネ\nキング ザブール\nバジリスク マザー\nブラッド ゴーレム",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%E2",
    "move": "○",
    "melee": "△",
    "ranged": "△",
    "magicGuard": "△"
  },
  {
    "id": "tech-7f095f6964-b027a82005-10",
    "name": "ジャブ",
    "kind": "テクニック",
    "category": "素手",
    "requirements": [
      {
        "skill": "素手",
        "min": 10
      }
    ],
    "successSkill": "素手",
    "successRequired": 10,
    "cost": {
      "st": 8
    },
    "castTime": "50\n(18-23)",
    "delay": "320",
    "description": "立て続けに素早いパンチを繰り出す\n※敵の行動を阻害する\n左手用ナックルで威力上昇",
    "transfer": "×",
    "acquisition": "NPC販売\nボビーイムサマス\nギガントス\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%C7%BC%EA",
    "power": "0.7",
    "move": "○",
    "range": "3.2"
  },
  {
    "id": "tech-7f095f6964-6d66da1b64-20",
    "name": "チャージド フィスト",
    "kind": "テクニック",
    "category": "素手",
    "requirements": [
      {
        "skill": "素手",
        "min": 20
      }
    ],
    "successSkill": "素手",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "90\n(36-41)",
    "delay": "840",
    "description": "力を溜めて敵を激しく殴りつけることにより、\nガード技を無視してダメージを貫通させる\n※成功すると スタンさせることができる\nガードブレイク技\n※スタン中は被ダメージ2割減",
    "transfer": "×",
    "acquisition": "NPC販売\nボビーイムサマス\nガーディアン\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%C7%BC%EA",
    "power": "対Mob\n1.3\n対PC\n1.1",
    "move": "×",
    "range": "3.4"
  },
  {
    "id": "tech-7f095f6964-507299d286-40",
    "name": "サクリファイス フィスト",
    "kind": "テクニック",
    "category": "素手",
    "requirements": [
      {
        "skill": "素手",
        "min": 40
      }
    ],
    "successSkill": "素手",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "140\n(96-101)",
    "delay": "1300",
    "description": "己の肉体を武器と化し、爆発的なダメージを与える\n※攻撃の成功・不成功に関わらず自分もダメージを受ける",
    "transfer": "×",
    "acquisition": "NPC販売\nボビーイムサマス\nガーディアン\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%C7%BC%EA",
    "power": "1.2\n+α",
    "move": "×",
    "range": "3.4"
  },
  {
    "id": "tech-7f095f6964-80217c7e0c-50",
    "name": "ブラインド ジャブ",
    "kind": "テクニック",
    "category": "素手",
    "requirements": [
      {
        "skill": "素手",
        "min": 50
      }
    ],
    "successSkill": "素手",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "120\n(42-47)",
    "delay": "1200",
    "description": "顔面に ジャブをお見舞いする\n対象は 視界を一定時奪われる\n※NPCは、対象を見失う事がある\nファークリップが一時的に0になる",
    "transfer": "×",
    "acquisition": "ボビーイムサマス\nグレート\nアントニー\nThe Legend of Duelist",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%C7%BC%EA",
    "power": "0.9",
    "move": "×",
    "range": "3.4"
  },
  {
    "id": "tech-7f095f6964-6ffd30c96b-60",
    "name": "ディザーム ガード",
    "kind": "テクニック",
    "category": "素手",
    "requirements": [
      {
        "skill": "素手",
        "min": 60
      }
    ],
    "successSkill": "素手",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "150",
    "delay": "390",
    "description": "敵が装備している武器を外し、2秒くらいの間、\n右と左スロットの装備を付け替えできなくさせる\n対Mobでは相手の攻撃力を下げる効果",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ)\nボビーイムサマス\nガーディアン\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%C7%BC%EA",
    "power": "0",
    "move": "○",
    "range": ""
  },
  {
    "id": "tech-7f095f6964-294f3babc3-70",
    "name": "イリュージョン フィンガー",
    "kind": "テクニック",
    "category": "素手",
    "requirements": [
      {
        "skill": "素手",
        "min": 70
      }
    ],
    "successSkill": "素手",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "100\n(36-41)",
    "delay": "800",
    "description": "親指で対象を連打攻撃して全身に身につけている装飾品を全て脱がす\n※この技の発動には 指にバネを仕込まなければならない\nサム オブ レジェンドを1つ消費する",
    "transfer": "×",
    "acquisition": "NPC販売\nボビーイムサマス\nサベージナイト\nサベージランサーロード\nサベージドルイドロード\nサベージキング\nキングザブール\nグレート\nアントニー\n拳僧兵\n棍僧兵",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%C7%BC%EA",
    "power": "対Mob\n1.35\n対PC\n1.2",
    "move": "×",
    "range": "3.4"
  },
  {
    "id": "tech-7f095f6964-06117977a9-80",
    "name": "スパルタン フィスト",
    "kind": "テクニック",
    "category": "素手",
    "requirements": [
      {
        "skill": "素手",
        "min": 80
      }
    ],
    "successSkill": "素手",
    "successRequired": 80,
    "cost": {
      "st": 33
    },
    "castTime": "200\n(72-77)",
    "delay": "1100",
    "description": "対象の気の力を増幅させて、\nヒット・ポイント(HP)を回復する\n他人にも使用できる",
    "transfer": "×",
    "acquisition": "ボビーイムサマス\nミスリルガーディアン\nサベージナイト\nサベージランサーロード\nグレート\nアントニー\n拳僧兵\n棍僧兵",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%C7%BC%EA",
    "power": "-",
    "move": "×",
    "range": "3.0"
  },
  {
    "id": "tech-7f095f6964-ff7dedeafb-90",
    "name": "サイズミック ウェーブ",
    "kind": "テクニック",
    "category": "素手",
    "requirements": [
      {
        "skill": "素手",
        "min": 90
      }
    ],
    "successSkill": "素手",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "150\n(?)",
    "delay": "1650",
    "description": "大地を伝わる衝撃波で周囲にダメージを与える技\n使用アイテム：原初の粉 1",
    "transfer": "×",
    "acquisition": "ChaosAge地の門 報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%C7%BC%EA",
    "power": "",
    "move": "×",
    "range": "?"
  },
  {
    "id": "tech-7f095f6964-6173f8903b-90",
    "name": "拳聖乱舞",
    "kind": "テクニック",
    "category": "素手",
    "requirements": [
      {
        "skill": "素手",
        "min": 90
      }
    ],
    "successSkill": "素手",
    "successRequired": 90,
    "cost": {
      "st": 44
    },
    "castTime": "767\n(90-95)",
    "delay": "1600",
    "description": "素手攻撃の究極奥義。相手に無数のパンチを浴びせつつ、\n気を溜めて放出する。\n途中で空振りすると、攻撃は止まってしまう。",
    "transfer": "×",
    "acquisition": "ボビーイムサマス\nストライカー\nグレート\nアントニー\nThe Legend of Duelist\n拳僧兵\n棍僧兵",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C1%C7%BC%EA",
    "power": "",
    "move": "×",
    "range": "6.0?"
  },
  {
    "id": "tech-720e6baa39-2e120b08f5-1",
    "name": "バーニング プラント",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 1
      }
    ],
    "successSkill": "罠",
    "successRequired": 1,
    "cost": {
      "st": 9
    },
    "castTime": "60",
    "delay": "400",
    "description": "燃え盛る種を地面に植えつけ 周囲を炎で包む\n使用アイテム : バーニング シード 1\n設置した種が火属性の魔法ダメージを与える",
    "transfer": "×",
    "acquisition": "NPC販売\nクエスト報酬(フォレール)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-720e6baa39-a7da9df429-10",
    "name": "ポイズン プラント",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 10
      }
    ],
    "successSkill": "罠",
    "successRequired": 10,
    "cost": {
      "st": 8
    },
    "castTime": "60",
    "delay": "400",
    "description": "毒効果のついた種を植えつけ 周囲を毒に侵す\n使用アイテム : ポイズン シード 1\n設置した種が地属性の持続ダメージを与える",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-720e6baa39-fa2fefd62d-20",
    "name": "サプライズ プラント",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 20
      }
    ],
    "successSkill": "罠",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "60",
    "delay": "400",
    "description": "敵の近くで種を派手に爆発させ 敵を逃亡させる\n使用アイテム : サプライズ シード 1\n設置した種が戦闘を阻害するDebuffを与える",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-720e6baa39-0a11b6f7c2-30",
    "name": "フォグ プラント",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 30
      }
    ],
    "successSkill": "罠",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "60",
    "delay": "400",
    "description": "種から霧を発生させ 敵の視界を遮る\n使用アイテム : フォグ シード 1\n設置した種が命中を低下させるDebuffを与える",
    "transfer": "×",
    "acquisition": "NPC販売\nクエスト報酬(フォレール)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-720e6baa39-bfe11bcdd0-40",
    "name": "コーマ プラント",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 40
      }
    ],
    "successSkill": "罠",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "60",
    "delay": "400",
    "description": "催眠ガスを発生させ 対象を睡眠状態に陥れる\n使用アイテム : コーマ シード 1\n設置した種が行動を封じるDebuffを与える",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-720e6baa39-a45cbd5ed9-50",
    "name": "マスキング シード",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 50
      }
    ],
    "successSkill": "罠",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "60",
    "delay": "550",
    "description": "自分の周りに植えた罠を隠して敵に察知されないようにする\n広範囲の種が透明状態になる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-720e6baa39-293d7f32cf-60",
    "name": "ボーリング",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 60
      }
    ],
    "successSkill": "罠",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "45",
    "delay": "645\n※",
    "description": "目の前にある罠を転がす\n※敵が植えた罠も転がす事が可能です\n前方の種を押し出す",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ)\n暗殺者\nサベージナイト\nサベージランサーロード\nウォーターウンディーネ\nギガース",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-720e6baa39-706974d6fb-70",
    "name": "ハーベスト プレイ",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 70
      }
    ],
    "successSkill": "罠",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "60",
    "delay": "1060\n※",
    "description": "祈りの力で設置した罠（種）を急成長させ、効果を即時発動させる\nターゲットした種の主人が植えた同じタイプの罠が全て発動する",
    "transfer": "×",
    "acquisition": "NPC販売(ヌブール村)\n暗殺者\nサベージナイト\nサベージランサーロード\nウォーターウンディーネ\nギガース",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-720e6baa39-aba7b2ed82-80",
    "name": "マイン スウィープ",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 80
      }
    ],
    "successSkill": "罠",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "100",
    "delay": "440\n※",
    "description": "周りに設置された敵の罠を解除する\n広範囲の種を一瞬で消し去る",
    "transfer": "×",
    "acquisition": "暗殺者\nサベージナイト\nサベージランサーロード\nウォーターウンディーネ\nギガース",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-720e6baa39-605e343e31-90",
    "name": "バグズ デリバリー",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 90
      }
    ],
    "successSkill": "罠",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "50",
    "delay": "950",
    "description": "虫たちの力を借り 罠を自分の近くに運んでもらう\n一定時間ごとに設置者へ向かって種が移動する",
    "transfer": "×",
    "acquisition": "暗殺者\nサベージナイト\nサベージランサーロード\nウォーターウンディーネ\nギガース",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-720e6baa39-871436300a-90",
    "name": "リモート ボム",
    "kind": "テクニック",
    "category": "罠",
    "requirements": [
      {
        "skill": "罠",
        "min": 90
      }
    ],
    "successSkill": "罠",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "60",
    "delay": "860",
    "description": "対象を追いかけて自爆するEGK型の爆弾\n使用アイテム：原初の粉 1",
    "transfer": "?",
    "acquisition": "ChaosAge風の門 報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%E6%AB"
  },
  {
    "id": "tech-c6d201c924-6c7d5c5e28-1",
    "name": "サイレント ラン",
    "kind": "テクニック",
    "category": "自然調和",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 1
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "150",
    "delay": "750",
    "description": "周りの敵の聴覚を誤魔化し 自分の足音を気付かれにくくする\n説明とは異なり\nタゲ切り技\n対象がダメージを受けると解除",
    "transfer": "×",
    "acquisition": "NPC販売\nクエスト報酬(フォレール)\nアマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%AB%C1%B3%C4%B4%CF%C2",
    "move": "○"
  },
  {
    "id": "tech-c6d201c924-9e1830c783-20",
    "name": "センス ヒドゥン",
    "kind": "テクニック",
    "category": "自然調和",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 20
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "150",
    "delay": "830",
    "description": "五感を研ぎ澄まし 隠れている者を発見できるようにする\n看破Buff",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%AB%C1%B3%C4%B4%CF%C2",
    "move": "○"
  },
  {
    "id": "tech-c6d201c924-5e20f739eb-30",
    "name": "ムーン フォール",
    "kind": "テクニック",
    "category": "自然調和",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 30
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "20",
    "delay": "680",
    "description": "一定時間 強風の力を借りて宙へ浮きあがる\n落下速度の低下、落下ダメージの軽減",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%AB%C1%B3%C4%B4%CF%C2",
    "move": "○"
  },
  {
    "id": "tech-c6d201c924-bfbb26649a-40",
    "name": "ネイチャー ビート",
    "kind": "テクニック",
    "category": "自然調和",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 40
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "150",
    "delay": "1100",
    "description": "木に触れ 自然の癒しの力でHPを回復する\n(伐採可能な木に対して有効)\nトレント系にも使用可能",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%AB%C1%B3%C4%B4%CF%C2",
    "move": "○"
  },
  {
    "id": "tech-c6d201c924-4588ac15f9-50",
    "name": "ツイスター ラン",
    "kind": "テクニック",
    "category": "自然調和",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 50
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "110",
    "delay": "1110",
    "description": "自分の後ろに追い風を巻き起こし 移動速度を早める",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネススマッシャー\nデビルクロウ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%AB%C1%B3%C4%B4%CF%C2",
    "move": "×"
  },
  {
    "id": "tech-c6d201c924-cfc4e75c3d-60",
    "name": "センス プレイ",
    "kind": "テクニック",
    "category": "自然調和",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 60
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "120",
    "delay": "3120",
    "description": "素早い獲物が通過したルートを感知し、追跡する\n※対Mobには 対象に対して自分の気配を希薄にさせる効果もある",
    "transfer": "×",
    "acquisition": "アマゾネススマッシャー\nデビルクロウ\nサベージキング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%AB%C1%B3%C4%B4%CF%C2",
    "move": "○"
  },
  {
    "id": "tech-c6d201c924-75db84370a-70",
    "name": "ファルコン ウイング",
    "kind": "テクニック",
    "category": "自然調和",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 70
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "210",
    "delay": "1410",
    "description": "ファルコンのように羽ばたき 前方に飛び上がる\n※スキルが高くなるとディレイが速くなる\n重量オーバー時でも移動可能",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ/ヌブール村)\nアマゾネススマッシャー\nデビルクロウ\n暗殺者\nサベージドルイド",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%AB%C1%B3%C4%B4%CF%C2",
    "move": "○"
  },
  {
    "id": "tech-c6d201c924-19a710e427-80",
    "name": "グレート エスケイプ",
    "kind": "テクニック",
    "category": "自然調和",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 80
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "261",
    "delay": "2061",
    "description": "パーティー全員の移動速度を速める\n※効果中は攻撃できなくなる\n移動速度が大幅に上がるが、技・魔法が使用できなくなる\nMRPで解除可能",
    "transfer": "×",
    "acquisition": "アマゾネススマッシャー\nデビルクロウ\n暗殺者\nサベージドルイド\nサベージナイト\nサベージキング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%AB%C1%B3%C4%B4%CF%C2",
    "move": "×"
  },
  {
    "id": "tech-c6d201c924-c8db18f168-90",
    "name": "リーシング スカイ",
    "kind": "テクニック",
    "category": "自然調和",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 90
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 90,
    "cost": {
      "st": 33
    },
    "castTime": "210",
    "delay": "1410",
    "description": "天候を操る\n使用者中心の範囲技\n天候によって効果が変わる (短評参照)",
    "transfer": "×",
    "acquisition": "サベージドルイド\nサベージキング\nThe Legend of Duelist[御庭番型]",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BC%AB%C1%B3%C4%B4%CF%C2",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-20-1",
    "name": "20周年オブジェクト",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "20周年オブジェクトを設置する",
    "transfer": "○",
    "acquisition": "課金者プレゼント\n260512〜260519",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-0e5771d950-1",
    "name": "×フラッグ召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "バツが描かれた旗を召喚する\n※特に効果はない",
    "transfer": "",
    "acquisition": "バザールボックス 交換アイテム\n2枚交換\n171228",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-aac87872ac-1",
    "name": "○フラッグ召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "マルが描かれた旗を召喚する\n※特に効果はない",
    "transfer": "",
    "acquisition": "バザールボックス 交換アイテム\n2枚交換\n171228",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-3b7bd9b203-1",
    "name": "かまくら",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 1.0
      }
    ],
    "successSkill": "召喚魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "大きなかまくらを召喚する\n※かまくらの中で座ると自然回復量が上昇する\n※必要スキルに「召喚魔法1」がありますが、スキル値0でも使用できます。",
    "transfer": "",
    "acquisition": "もえガチャ（福袋）\n151229（160101）",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-43107102bd-1",
    "name": "こたつ召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "木工",
        "min": 1.0
      }
    ],
    "successSkill": "木工",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "遠赤外線効果のある暖房器具を設置する\n※ 課金アイテムなので複合に記載。",
    "transfer": "",
    "acquisition": "もえガチャ\n171114",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-d776f9da1c-1",
    "name": "にゃんこ大集合",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "調教",
        "min": 1.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "180",
    "delay": "2150",
    "description": "マタタビの香りに釣られて猫たちが集まってくる\n使用アイテム : マタタビ パウダー 1",
    "transfer": "",
    "acquisition": "「101匹にゃんこ」報酬\n221129〜221213",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-c441747c2a-1",
    "name": "のぼり召喚（メンバー募集）",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "メンバー募集の旗を立てる",
    "transfer": "",
    "acquisition": "公式FS勧誘イベント\n150805",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-df55e0593a-1",
    "name": "のぼり召喚（冷やし中華）",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "冷やし中華の旗を立てる",
    "transfer": "",
    "acquisition": "もえガチャ\n150710\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-2544e7bc5d-1",
    "name": "のぼり召喚（大安売り）",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "大安売りの旗を立てる",
    "transfer": "",
    "acquisition": "もえガチャ\n150710\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-a4dc99a806-1",
    "name": "のぼり召喚（新商品）",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "新商品の旗を立てる",
    "transfer": "",
    "acquisition": "もえガチャ\n150710\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-4f2dd1aa85-1",
    "name": "ましゅかまくら",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 1.0
      }
    ],
    "successSkill": "召喚魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "いやしましゅまろの形をしたかまくらを召喚する\n※必要スキルに「召喚魔法1」がありますが、スキル値0でも使用できます。",
    "transfer": "",
    "acquisition": "課金キャンペーン\n181106",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-637f887f7a-1",
    "name": "もみじ召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "栽培",
        "min": 1.0
      }
    ],
    "successSkill": "栽培",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "1200",
    "description": "もみじの木を生やすことができる\nもみじの木を座らせるともみじの葉が舞い散る",
    "transfer": "○",
    "acquisition": "課金者プレゼント\n201027〜201104",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-788f104e9e-1",
    "name": "アウトドア ライブ",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "音楽",
        "min": 1.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "野外での演奏に適した大音量で音楽とシャウトの効果範囲を大きく上昇させる\nさらに周囲のプレイヤーをノリノリにする。",
    "transfer": "○",
    "acquisition": "ミラクルサマーガチャ2020\n初出200728",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-1910033829-1",
    "name": "ガゼボ召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "木工",
        "min": 1.0
      }
    ],
    "successSkill": "木工",
    "successRequired": 1.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "屋根と柱だけで構成された休憩用の建造物を設置する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出201020\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-819ff74e4d-1",
    "name": "クリスマスツリー召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "栽培",
        "min": 1.0
      }
    ],
    "successSkill": "栽培",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "1200",
    "description": "クリスマスツリーを設置する\nクリスマスツリーを座らせるとエフェクトでライトアップされる",
    "transfer": "○",
    "acquisition": "課金キャンペーン\n201215〜201222",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-d0e416fe36-1",
    "name": "グラス フィールド",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "栽培",
        "min": 1.0
      }
    ],
    "successSkill": "栽培",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "60",
    "delay": "480",
    "description": "wwwwwwwwwwwwwwwwwwwwwwwwwwwwww\nww種を植えて周囲に草を生やすww\nwwwwwwwwwwwwwwwwwwwwwwwwwwwwww\n使用アイテム : シード 10",
    "transfer": "○",
    "acquisition": "課金者プレゼント\n220524〜220531",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-6490c8de5d-1",
    "name": "ゴースト ピクチャーズ",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 1.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 1.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "120",
    "delay": "1320",
    "description": "霊を引き寄せる呪いの写真を撮る\n発動に必要なBuff :\nノスタルジック カメラ",
    "transfer": "",
    "acquisition": "もえガチャ\n初出200630",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-081055f99d-1",
    "name": "スタンドマイク",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "音楽",
        "min": 1.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "120",
    "delay": "2120",
    "description": "スタンドマイクを召喚する\nスタンドマイクにライトポーションをトレードするとスポットライトが点灯します",
    "transfer": "",
    "acquisition": "錬金-第7弾(褒章)\n100720",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-f65449181b-1",
    "name": "セレブレイション ディナー",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "料理",
        "min": 1.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "ディナー用のテーブルとイスと料理を召喚する\nディナー用テーブルとイスの近くでBuff「\nテイスティング\n」を発動させると「大人なデート」が発動する\n大人なデート：誰にも邪魔されない大人なデート気分を味わえるかも！？\n※お相手はご自身でお探しください。",
    "transfer": "",
    "acquisition": "もえガチャ(同梱品)\n初出200512",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-103e3c9a1f-1",
    "name": "チャーリー フェスティバル",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 1.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "魔女に仮装した小さなチャーリーを沢山呼び出すことができる。\n発動に必要なBuff :\nなりきりチャーリー\nor\nプリティ チャーリー",
    "transfer": "",
    "acquisition": "もえガチャ\n初出191001(装備)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-6ed6238c70-1",
    "name": "チャーリーのかまくら",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 1.0
      }
    ],
    "successSkill": "召喚魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "チャーリーの形をしたかまくらを召喚する\n※かまくらの中で座ると自然回復が上昇する\n※必要スキルに「召喚魔法1」がありますが、スキル値0でも使用できます。",
    "transfer": "○",
    "acquisition": "課金者プレゼント\n240123〜240130",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-a21aa64ed5-1",
    "name": "チョコ ホット スプリング",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "採掘",
        "min": 1.0
      }
    ],
    "successSkill": "採掘",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "270",
    "delay": "2000",
    "description": "チョコの温泉を掘り当てる\n※混浴です\nケンカになるので他の温泉の近くでは絶対に使用しないでください\n発動に必要な装備 : つるはし",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出200204",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-f4cc2ea444-1",
    "name": "バーチャル ステージ",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "音楽",
        "min": 1.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "3Dホログラムによってアイドルのステージを表示する\n※バーチャル ステージを「座らせる」ことでバーチャル空間を起動する",
    "transfer": "",
    "acquisition": "もえガチャ\n181113",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-4bbaef86fc-1",
    "name": "パンチングマシーン",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "素手",
        "min": 1.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "パンチングマシーンを設置する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出231226",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-ecd041a3c9-1",
    "name": "ファイティング ウオ",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "水泳",
        "min": 1.0
      }
    ],
    "successSkill": "水泳",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "果敢に戦う魚達を5匹呼び出す\n発動に必要なBuff :\nクマノミの加護",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出210824",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-360657b52a-1",
    "name": "フェアリーマルシェワゴン",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "可愛らしい荷車を召喚する",
    "transfer": "○",
    "acquisition": "大入り福袋2022（年末のみ）\n初出211222",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-b370bd3411-1",
    "name": "フラワースタンド召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 1.0
      }
    ],
    "successSkill": "召喚魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "60",
    "delay": "660",
    "description": "19周年記念のフラワースタンドを召喚する\n※必要スキルに「召喚魔法 1」がありますが、スキル値0でも使用できます。",
    "transfer": "",
    "acquisition": "ハッピーフラワー！\n250513〜250527",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-b6831d72b0-1",
    "name": "フリー マーケット",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "450",
    "delay": "1450",
    "description": "フリーマーケット用のシートを足元に召喚する\n※召喚した『フリマ スペース』を右クリックすることで\n露店中に近くにいる客の呼び込みを行うことができる",
    "transfer": "",
    "acquisition": "錬金-第9弾(褒賞)\n120424",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-4ba6fc10a2-1",
    "name": "フローティング ランタン",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "60",
    "delay": "120",
    "description": "願い込めたランタンを夜空へ飛ばす",
    "transfer": "○",
    "acquisition": "課金者プレゼント\n250805〜250812",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "○"
  },
  {
    "id": "tech-b538e5d10c-ed54ba9a41-1",
    "name": "ブルー フラワー フィールド",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "栽培",
        "min": 1.0
      }
    ],
    "successSkill": "栽培",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "60",
    "delay": "480",
    "description": "お花畑を召喚する\n※お花畑で座ると自然回復量が上昇する\n使用アイテム : シード ×10",
    "transfer": "",
    "acquisition": "もえガチャ（福袋）\n211222",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "○"
  },
  {
    "id": "tech-b538e5d10c-946af0190f-1",
    "name": "プラネタリウム",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "半球状の巨大なドームを出現させる\n※WarAgeでは召喚できない",
    "transfer": "○",
    "acquisition": "課金者プレゼント\n220823〜220830",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-8f161852f6-1",
    "name": "プレゼント ボックス",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "大きなプレゼントボックスを召喚する\n※ 課金アイテムなので複合に記載。",
    "transfer": "",
    "acquisition": "課金キャンペーン\n171212",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-5333d910b6-1",
    "name": "ペットハウス(茶)",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "調教",
        "min": 1.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "ペットハウスを召喚する",
    "transfer": "",
    "acquisition": "課金者プレゼント\n230314〜230322",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-d6404ec03f-1",
    "name": "ホット スプリング",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "採掘",
        "min": 1.0
      }
    ],
    "successSkill": "採掘",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "270",
    "delay": "2000",
    "description": "温泉を掘り当てる※混浴です※ケンカになるので他の温泉の近くでは絶対に使用しないでください\n発動に必要な装備 : つるはし",
    "transfer": "",
    "acquisition": "もえガチャ\n180626",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-c658a96236-1",
    "name": "ポータブル ステージ",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "音楽",
        "min": 1.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "携帯ステージを召喚する\n※ 課金アイテムなので複合に記載。",
    "transfer": "",
    "acquisition": "もえガチャ\n150203",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-f64a07ea4a-1",
    "name": "マジカル ルーレット",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "1650",
    "description": "ルーレットで止まった色によってさまざまな効果が付与される魔法具を召喚する\n※最大で一度に5種類まで付与されるが、ドクロに止まった場合は全てのBUFFが解除されて、HP/ST/MPが1になる\n※1プレイ：500G",
    "transfer": "○",
    "acquisition": "大入り福袋\n初出210101",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-f74f618b54-1",
    "name": "マニピュレイト メロディ",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "音楽",
        "min": 1.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "190",
    "delay": "1690",
    "description": "笛の音色で街中のネズミを呼び寄せて操ることができる\n発動に必要なBuff : ハーメルンの笛",
    "transfer": "",
    "acquisition": "もえガチャ\n170321",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-1a0304b52d-1",
    "name": "マネキン召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "裁縫",
        "min": 1.0
      }
    ],
    "successSkill": "裁縫",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "60",
    "delay": "360",
    "description": "マネキンを召喚する\n※右クリックした時点で通常枠に装備している防具をコピーする\n※もう一度右クリックで解除\n※変身系ペンダント等で姿が変更されていた場合は更新されるのでご注意ください",
    "transfer": "",
    "acquisition": "ファッションコンテスト\n入賞記念アイテム\nチケット交換品",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-2ad9432010-1",
    "name": "ミニ茣蓙召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "小さな茣蓙を召喚する\n※ 茣蓙召喚の小さいバージョン",
    "transfer": "",
    "acquisition": "バザールボックス 交換アイテム\n2枚交換\n171228",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-759a209e43-1",
    "name": "メイプル フィールド",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "栽培",
        "min": 1.0
      }
    ],
    "successSkill": "栽培",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "60",
    "delay": "480",
    "description": "周囲に紅葉が散ったフィールドを召喚する\n使用アイテム : 腐葉土 1",
    "transfer": "○",
    "acquisition": "課金者プレゼント\n221115〜221122",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-2ac5bad952-1",
    "name": "ランウェイ召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "100",
    "delay": "1100",
    "description": "ランウェイを召喚する",
    "transfer": "",
    "acquisition": "ファッションコンテスト\n入賞記念アイテム\nチケット交換品",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-42db589ada-1",
    "name": "ランチ タイム",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "料理",
        "min": 1.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "450",
    "delay": "1450",
    "description": "ピクニックセットを召喚する\n※アイテム「ピクニックセット」をUSEすると入手。\n使用アイテム : ピクニック 休息セット ×１＋１",
    "transfer": "",
    "acquisition": "錬金-第5.5弾(報酬)\n090721",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-8c88dddcb4-1",
    "name": "リコール ペットショップ",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "1650",
    "description": "出張ペット屋さんを呼び出して預けたり、ケイジにしまうことができる\n※出張依頼には500G(J)が必要です\n使用アイテム : 500 gold(jade)",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出231121",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-0fe88d877c-1",
    "name": "レッド ホット スプリング",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "採掘",
        "min": 1.0
      }
    ],
    "successSkill": "採掘",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "270",
    "delay": "2000",
    "description": "赤く煮えたぎる熱湯温泉を掘り当てる\n※混浴です\n※ケンカになるので他の温泉の近くでは絶対に使用しないでください\n発動に必要な装備 : つるはし",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出250708",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-057a43d7a9-1",
    "name": "ロイヤルアフタヌーン",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "料理",
        "min": 1.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "おしゃれなガーデンチェアとガーデンテーブルを召喚する\n※ ロイヤルアフタヌーンセットに同梱（盾、召喚複合技の2点セット）",
    "transfer": "○",
    "acquisition": "もえガチャ\n180213",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-594609aee9-1",
    "name": "一本桜",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "栽培",
        "min": 1.0
      }
    ],
    "successSkill": "栽培",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "1200",
    "description": "一本の桜を咲かすことができる\n桜の木を座らせると桜が舞い散る\n※必要スキルに「栽培」がありますが、スキル値0でも使用できます。",
    "transfer": "○",
    "acquisition": "課金キャンペーン\n200331〜0407",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-301021b7d8-1",
    "name": "七輪召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "料理",
        "min": 1.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "七輪を召喚する\n発動に必要なBuff :\n炭火焼き",
    "transfer": "",
    "acquisition": "課金者プレゼント\n230606〜230613\n231107〜231114",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-ac64faec60-1",
    "name": "出でよ、我が眷属！",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 1.0
      }
    ],
    "successSkill": "召喚魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "150",
    "delay": "2400",
    "description": "6匹のファミリア バットを同時に召喚する\nファミリア バットは吸血技を使用した時や死亡時にプレイヤーのHPを回復させる\n発動に必要なBuff :\n主の証\n使用アイテム : アイボール 6",
    "transfer": "無\n料",
    "acquisition": "もえガチャ(装備)\n初出201027",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-9f5de47052-1",
    "name": "助けて！弁天丸",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 1.0
      }
    ],
    "successSkill": "召喚魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "10950",
    "description": "『宇宙海賊船 弁天丸』を別の空間から呼び寄せる。\n使用アイテム : ノア クリスタル 1\n※ 限定・課金アイテムなので複合に記載。",
    "transfer": "○",
    "acquisition": "『 モーレツ宇宙海賊 』コラボ\n130205",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-079b603564-1",
    "name": "巨大タイマー召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "巨大なタイマーを設置する",
    "transfer": "○",
    "acquisition": "課金者プレゼント\n250121〜250128",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-1f7037b568-1",
    "name": "巻藁召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 1.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "60",
    "delay": "360",
    "description": "試し斬り用の巻藁を召喚する\n※右クリックで破壊可能/破壊不能を切り替えることができる\n※フラグは共通のため、設置した全ての巻藁に適応される\n使用アイテム : わら 1",
    "transfer": "○",
    "acquisition": "もえガチャ\n(大入り福袋 2023)\n初出221220",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-7f985252eb-1",
    "name": "望遠鏡",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 1.0
      }
    ],
    "successSkill": "召喚魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "遠くを見ることができる望遠鏡を設置する",
    "transfer": "",
    "acquisition": "「ダイアロス博物館?!」\n220517〜220531",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-6fdfa2bf1e-1",
    "name": "演説台召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "「 /shout 」 による発言がテロップで表示されるようになる演説台を召喚する",
    "transfer": "○",
    "acquisition": "もえガチャ\n(ミラクルサマーガチャ)\n初出230808",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-419282359b-1",
    "name": "狩人の食卓",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "料理",
        "min": 1.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "獲物を焼くためのたき火セットを召喚する",
    "transfer": "",
    "acquisition": "福袋\n190101",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-a1855d760a-1",
    "name": "茣蓙召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "***\n※ 後に「ミニ茣蓙召喚」という類似の別テクニックが実装された",
    "transfer": "",
    "acquisition": "バザールボックス 交換アイテム\n5枚交換\n160816",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-054c0615ea-1",
    "name": "茶道セット",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "料理",
        "min": 1.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "450",
    "delay": "1450",
    "description": "茶道セットを召喚する\n※必要スキルに「取引」がありますが、スキル値0でも使用できます。",
    "transfer": "○",
    "acquisition": "課金キャンペーン\n初出200324〜200331",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-6e9b154bfb-1",
    "name": "蓄音機召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "音楽",
        "min": 1.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "BGMをリストから選択して自由に変更できる蓄音機を召喚する\n※変更できるBGMは自分のクライアントのみです。\n※追加のBGMリストは今後ゲーム内で入手可能になる予定です。\n※ 課金アイテムなので複合に記載。",
    "transfer": "",
    "acquisition": "もえガチャ\n171017",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-3cbd1c0b3f-1",
    "name": "風景パネル",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 1.0
      }
    ],
    "successSkill": "召喚魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "ダイアロスの風景が描かれたパネルを召喚する",
    "transfer": "○",
    "acquisition": "第十八回デザコン参加賞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-f299f5b688-1",
    "name": "魔女の大釜",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "薬調合",
        "min": 1.0
      }
    ],
    "successSkill": "薬調合",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "120",
    "delay": "1200",
    "description": "『 薬調合 』や『 染色 』が可能な魔女の大釜を召喚する\n※調合スキルが一定以上で特別なポーションを合成できる\n※条件を満たすと右クリックメニューでレシピが表示される\n※合成はコンバインではなく魔女の大釜にトレードしてください",
    "transfer": "",
    "acquisition": "大入り福袋\n初出201222\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-147c3004f5-10",
    "name": "お好み焼き屋",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "料理",
        "min": 10.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 10.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "お好み焼き屋台を設置する",
    "transfer": "×",
    "acquisition": "イベント\n初出220426",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-ef0e866877-10",
    "name": "かき氷屋",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "料理",
        "min": 10.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 10.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "かき氷屋を設置することができる\n「氷」を3個渡すことで周囲に任意のBUFF効果を付与することができる\n使用アイテム : 氷",
    "transfer": "○",
    "acquisition": "ミラクルサマーガチャ2020\n初出200804",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-a1d2abe87d-10",
    "name": "マイショップ(木工屋)",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 10.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 10.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "自分専用の木工屋店舗を設置することができる\n「選べるマイショップボックス」の中身。青色の屋根のお店。",
    "transfer": "",
    "acquisition": "もえガチャ\n161011",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-1575cc22f7-10",
    "name": "マイショップ(裁縫屋)",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 10.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 10.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "自分専用の裁縫屋店舗を設置することができる\n「選べるマイショップボックス」の中身。緑色の屋根のお店。",
    "transfer": "",
    "acquisition": "もえガチャ\n161011",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-8a0777f5c2-10",
    "name": "マイショップ(鍛冶屋)",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 10.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 10.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "自分専用の鍛冶屋店舗を設置することができる\n「選べるマイショップボックス」の中身。赤色の屋根のお店。\n4種類のマイショップから１つ選んで入手できる\n※アイテムスロットに1スロットの空きが必要です\n※商人はついてきませんのでご注意下さい\n※鍛冶屋、木工屋、裁縫屋、食べ物屋",
    "transfer": "",
    "acquisition": "もえガチャ\n161011",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-60b2f69d1d-10",
    "name": "マイショップ(食べ物屋)",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 10.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 10.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "自分専用の食べ物屋店舗を設置することができる\n「選べるマイショップボックス」の中身。黄色の屋根のお店。",
    "transfer": "",
    "acquisition": "もえガチャ\n161011",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-838b21b32b-12",
    "name": "クリスマス ショップ",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 12.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 12.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "150",
    "delay": "1225",
    "description": "自分専用のクリスマス ショップを設置する事ができる\n※必要スキルに「取引」がありますが、スキル値0でも使用できます。",
    "transfer": "",
    "acquisition": "課金キャンペーン\n191210〜191217",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-368029f004-15",
    "name": "ねじりんポール",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "美容",
        "min": 15.0
      }
    ],
    "successSkill": "美容",
    "successRequired": 15.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "美容師の看板となるオブジェクトを召喚する",
    "transfer": "",
    "acquisition": "もえガチャ（福袋）\n151225",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-14659e3032-30",
    "name": "ボンファイヤー",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "料理",
        "min": 30.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 30.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "150",
    "delay": "20150",
    "description": "たき火を設置する\n※たき火の近くで座ると自然回復量が上昇する\n※火が消えている場合は効果がありません\n※丸太を追加することで燃焼時間を延長させることができる\n使用アイテム : 丸太 ×３〜\n※生産外及び黒の廟堂産出テクなので（暫定的に）複合に記載。",
    "transfer": "×",
    "acquisition": "黒の廟堂\n150113",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-7c38f8a9f4-30-30",
    "name": "弾薬錬成",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "銃器",
        "min": 30.0
      },
      {
        "skill": "鍛冶",
        "min": 30.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "100",
    "delay": "700",
    "description": "スチールインゴットから6発分の錬成弾を錬成する\n使用アイテム : スチールインゴット",
    "transfer": "",
    "acquisition": "『ありふれた職業で世界最強』\nコラボクエスト報酬\n250422〜250520",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-87ae42a817-40",
    "name": "サモン アプレンティス",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 40.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 40.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "150",
    "delay": "1650",
    "description": "職人の見習いとして仕える少年を呼び出す\n※右クリックでTTBを利用可能\n発動に必要なBuff : クリエイター マスタリー\n使用アイテム : 200gold",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-cd4eeca132-50-40",
    "name": "トラップ ボックス",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "罠",
        "min": 50.0
      },
      {
        "skill": "暗黒命令",
        "min": 40.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "近寄った者を襲う人食い宝箱を設置する",
    "transfer": "",
    "acquisition": "もえガチャ\n160628",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-10022c98ec-40",
    "name": "メディカル スプリンクラー",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "薬調合",
        "min": 40.0
      }
    ],
    "successSkill": "薬調合",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "100",
    "delay": "1300",
    "description": "周囲にポーションの効果を振り撒く特殊な機器を設置する\n(長いので省略)",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出260526",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-8a9d0dcba5-90-40",
    "name": "リコール ハンティング ガン",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "銃器",
        "min": 90.0
      },
      {
        "skill": "神秘魔法",
        "min": 40.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "2500",
    "description": "遠隔操作が可能な4丁の猟銃を特殊召喚する技\n使用アイテム : ペーパー ドール 4",
    "transfer": "○",
    "acquisition": "もえガチャ\n170509",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-849e1a5f88-40-40",
    "name": "レイルロード トラック",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "木工",
        "min": 40.0
      },
      {
        "skill": "鍛冶",
        "min": 40.0
      }
    ],
    "successSkill": "木工",
    "successRequired": 40.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "60",
    "delay": "660",
    "description": "列車の通る道を設置して、高速移動が可能になる\n※右クリックで高速移動のON/OFFを切り替えることができます。\n※WarAgeでは効果がない",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出251014",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-b34c1450e4-70-50",
    "name": "キープアウト トラップ",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "罠",
        "min": 70.0
      },
      {
        "skill": "暗黒命令",
        "min": 50.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "100",
    "delay": "2300",
    "description": "立入禁止の看板を設置して、範囲内への敵の侵入を妨害する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出200414",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-2e59daee92-50",
    "name": "スモーク マシーン",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "音楽",
        "min": 50.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "120",
    "delay": "1620",
    "description": "周囲に煙のように見える高密度の蒸気を放出する装置を設置する\n※スモークマシーンを座らせることで起動する\n※スモークの範囲に入っている間、音楽の効果が上昇し、回避率が上昇する\n発動に必要なBuff : 新人アイドル マスタリー or オールド アイドル マスタリー",
    "transfer": "○",
    "acquisition": "大入り福袋\n初出201222",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-edcb50f873-50",
    "name": "マシンガン プレイスメント",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "銃器",
        "min": 50.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "150",
    "delay": "1950",
    "description": "オート機能を備えたマシンガンを設置する\n※右クリックで手動による「 機銃掃射 」も可能です。\n※手動で発動した方がより短い間隔で連射発動が可能です。\n発動に必要なBuff : 傭兵 マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出200811\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-efb28cbd69-50",
    "name": "リコール アンダーリング",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "取引",
        "min": 50.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "200",
    "delay": "2000",
    "description": "手下を呼び出して自分の代わりに戦わせる\n※呼び出しには200G（J）が必要です。\n発動に必要なBuff : チンピラ マスタリー or 傭兵マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210831",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-5d45cc22f0-60-60",
    "name": "インペイル トラップ",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "罠",
        "min": 60.0
      },
      {
        "skill": "暗黒命令",
        "min": 60.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "100",
    "delay": "1500",
    "description": "地面から槍が飛び出す罠を設置する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出230322",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-3ff4a3854a-80-60",
    "name": "コピー ミミック",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "物まね",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 60.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "コピー能力のある分身を出現させて、敵のこうげきを模倣する\n※一部の範囲技や特定の武器が必要な技は発動できない",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出200915",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-9a262a787f-60-60",
    "name": "マジック マッシュルーム",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "栽培",
        "min": 60.0
      },
      {
        "skill": "薬調合",
        "min": 60.0
      }
    ],
    "successSkill": "栽培",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "100",
    "delay": "1300",
    "description": "敵を引き付ける胞子を放つ大きなキノコを召喚する\n使用アイテム : 毒キノコ 1",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出221108",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-64b2f387cc-60",
    "name": "リコール オーディエンス",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 60.0
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "160",
    "delay": "1350",
    "description": "熱狂的なライブの観客を集める\n発動に必要なBuff : ブラッドバード マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出231107",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-4753609ae6-60",
    "name": "リコール トイソルジャー",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 60.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "複数の兵士を同時に呼び出す\n※発動には一人当たり200G(J)×4人分の800G(J)が必要です。\n発動に必要なBuff : 傭兵 マスタリー\n使用Gold(Jade) : 800",
    "transfer": "",
    "acquisition": "もえガチャ\n181106",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-7bc0c7ec1e-80-60",
    "name": "大盾召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "盾",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 60.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "120",
    "delay": "2120",
    "description": "身体を覆うほどの大きな盾を召喚する",
    "transfer": "○",
    "acquisition": "『ありふれた職業で世界最強』\nコラボガチャ\n初出250422",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-9ba8f747cc-60-60",
    "name": "弩車召喚",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "木工",
        "min": 60.0
      },
      {
        "skill": "鍛冶",
        "min": 60.0
      }
    ],
    "successSkill": "木工",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1800",
    "description": "ドワーフが発明した強力なバネの力で巨大な矢を放つ特製の弩車を召喚する。\n使用アイテム : 弩車",
    "transfer": "",
    "acquisition": "もえガチャ\n180417",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-bfe3a82303-60",
    "name": "鮪型魚雷",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "水泳",
        "min": 60.0
      }
    ],
    "successSkill": "水泳",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1050",
    "description": "追尾式の鮪型魚雷を操り敵を撃沈する\n※地上でも発動可能です\n発動に必要なBuff : 海戦士 マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出191015",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-637b642880-70-70",
    "name": "スクランブル ファイター",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "銃器",
        "min": 70.0
      },
      {
        "skill": "精神力",
        "min": 70.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "魔力によって小型の戦闘機を具現化する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210921",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-18e52a02fc-90-70",
    "name": "ノアキャノン プレイスメント",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "銃器",
        "min": 90.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "1950",
    "description": "高出力なノアキャノン砲を設置する\n※マナが切れるまで『 ハイパー ノアキャノン 』を使用する\n※マナは『 ピュアノアキューブ 』を渡すことでリチャージが可能\n使用アイテム : ピュア ノア キューブ 3",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出250225",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-fecd497289-70",
    "name": "フラワー ガーデン",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "精神力",
        "min": 70.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "自分の周囲に花畑の幻影を生み出し、味方のMPを継続回復させる\n※WarAgeでは効果がない\n発動に必要なBuff :\nフラワー ブレッシング",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出240605",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-bde11d9fea-70",
    "name": "リモコン爆弾",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "罠",
        "min": 70.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "60",
    "delay": "1260",
    "description": "遠隔で起爆可能な爆弾を設置する\n発動に必要なBuff : 爆弾男 マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210525",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-ebe40c53cb-70-70",
    "name": "紅き援軍要請",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 70.0
      },
      {
        "skill": "生命力",
        "min": 70.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "100",
    "delay": "2000",
    "description": "ビスク軍(エルガディン軍)の援軍を呼ぶ\n発動に必要なBuff : 紺碧の賢者 マスタリー\n使用アイテム : 600 gold",
    "transfer": "×",
    "acquisition": "クエスト",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-e3ddae7812-78",
    "name": "助けて！なのはさん",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 78.0
      }
    ],
    "successSkill": "召喚魔法",
    "successRequired": 78.0,
    "cost": {
      "st": 78.0
    },
    "castTime": "200",
    "delay": "7800",
    "description": "ミッドチルダ式魔導を扱う空戦魔導師「高町なのは」を呼び出して助けてもらえる\n※一度だけ「ディバインバスター」で攻撃してくれます。\n※WarAgeでは呼び出せません。",
    "transfer": "◯",
    "acquisition": "『 魔法少女リリカルなのは Reflection 』コラボ\nもえガチャ\n180313",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-99f45c8235-80-80",
    "name": "オート シェル シールド",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "盾",
        "min": 80.0
      },
      {
        "skill": "着こなし",
        "min": 80.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "120",
    "delay": "2120",
    "description": "使用者のダメージを肩代わりする巨大な盾を召喚する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出260428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": "×"
  },
  {
    "id": "tech-b538e5d10c-d9f84de35e-80",
    "name": "グローイング ツリー",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 80.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "120",
    "delay": "2120",
    "description": "生命の樹を呼び出し 周囲の味方を回復させる\n発動に必要なBuff : ドルイド マスタリー\n使用アイテム : シード×１",
    "transfer": "",
    "acquisition": "錬金-第8弾\n101207\nミトヤの箱 Lv2",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-bceff56cc2-80-80",
    "name": "守護結界",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 80.0
      },
      {
        "skill": "召喚魔法",
        "min": 80.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 80.0,
    "cost": {
      "st": 46.0
    },
    "castTime": "450",
    "delay": "2450",
    "description": "魔を退け、敵の魔法を無効化する結界を展開する\n※WarAgeでは効果がない\n使用アイテム : ペーパー ドール 5",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出260113",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-b538e5d10c-584502735a-90",
    "name": "パンプキンボム",
    "kind": "テクニック",
    "category": "複合技/召喚",
    "requirements": [
      {
        "skill": "罠",
        "min": 90.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "120",
    "delay": "2120",
    "description": "対象に向かってカボチャ型の手榴弾を投げる\n一定時間後に大爆発を起こして周囲にダメージを与える\n発動に必要なBuff : アサシン マスタリー or 爆弾男 マスタリー or 傭兵 マスタリー\n使用アイテム : かぼちゃ 1",
    "transfer": "◯",
    "acquisition": "もえガチャ\n初出241015",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%BE%A4%B4%AD",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-b8c0c041b0-1",
    "name": "いやしの風",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 1.0
      }
    ],
    "successSkill": "回復魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "130",
    "delay": "650",
    "description": "回復魔法の効果を上昇させ、専用技 『 いやしの風 』 が使用できる\n発動に必要なBuff : 風精霊の加護",
    "transfer": "無\n料",
    "acquisition": "もえガチャ\n初出200122（装備）",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "○"
  },
  {
    "id": "tech-4000ebb85a-4e4274d9e9-1",
    "name": "イントラヴィーナス ドリップ",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "包帯",
        "min": 1.0
      }
    ],
    "successSkill": "包帯",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "120",
    "delay": "1000",
    "description": "対象に点滴を打つことでスタミナの自然回復を大幅に上昇させる\n発動に必要なBuff : 白衣の天使",
    "transfer": "",
    "acquisition": "もえガチャ\n181127",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-60c4436853-1",
    "name": "メタモルフォーゼ",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "250",
    "delay": "36000",
    "description": "新しい姿に生まれ変わるように、HPとMPを全回復して、全てのバフとデバフが消滅する\n発動に必要なBuff :\n胡蝶之夢",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n(ミラクルサマーガチャ)\n初出230801",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-144a93f5b4-1",
    "name": "メダロット フルチャージ",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "生命力",
        "min": 1.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "200",
    "delay": "4200",
    "description": "溜めたエネルギーを開放してHPを大回復し、デバフを解除する\n※回復量は生命力スキルに依存します\n発動に必要なBuff :\nディアステージ フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211116",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-ad153a1698-1",
    "name": "メダロット リペア",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "150",
    "delay": "950",
    "description": "HPを少し回復する\n※回復量は精神力スキルに依存します\n発動に必要なBuff :\nブレザーメイツ フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出231010",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-ee87bc795e-1",
    "name": "メダロット レストア",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "200",
    "delay": "3200",
    "description": "技説明\n発動に必要なBuff :\nブレザーメイツ フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出231010",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-9291d6ba39-1",
    "name": "ラブ ショット",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "弓",
        "min": 1.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 1.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "140",
    "delay": "1500",
    "description": "ラブパワーが宿った矢で意中のあの子を狙い撃ち！\nあの子のHPを回復してあげることで、あの子もキミにメロメロだ！\n発動に必要なBuff : 愛のキューピット",
    "transfer": "",
    "acquisition": "もえガチャ\n180213",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-f6a209ca9a-1",
    "name": "ラブリー チョコレート",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "130",
    "delay": "650",
    "description": "自分以外の対象に無償の愛でMPを分け与える\n※スキルが足りなくても発動可能\n発動に必要なBuff : スウィート ハート",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出200204",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-33fd8e2f2d-1",
    "name": "癒しの音色",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "音楽",
        "min": 1.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "280",
    "delay": "1000",
    "description": "美しい笛の音色で自分以外の周囲の味方を癒す\n朧月笛セット同封の朧月笛(武器)要装備\n※（精錬）課金アイテム及び特定装備テクなので複合に記載。",
    "transfer": "",
    "acquisition": "朧月笛セット",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-f6c6e3b8f6-10-50",
    "name": "ちゅ〜っと♪",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 10.0
      },
      {
        "skill": "筋力",
        "min": 50.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 10.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "170",
    "delay": "750",
    "description": "強力な肺活量で死体からより多くの魂を吸収し MPを回復する",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出241119",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-4c370fa4b7-70-20",
    "name": "ヒーリング ショット",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "銃器",
        "min": 70.0
      },
      {
        "skill": "回復魔法",
        "min": 20.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "135",
    "delay": "800",
    "description": "癒しの魔力を弾丸に込めて 味方を撃つ",
    "transfer": "",
    "acquisition": "錬金-第7弾\n錬金-第8弾\n錬金-Fancy\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-4229ed9223-30",
    "name": "フラ ダンス",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 30.0
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "400",
    "delay": "400",
    "description": "自分の周りにいる仲間のMP自然回復量を上昇させる\n発動に必要なBuff : 南国気分",
    "transfer": "○",
    "acquisition": "もえガチャ\n150721",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-3e2b0dc60b-30",
    "name": "マロン フラッシュ",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 30.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "200",
    "delay": "1500",
    "description": "甘い栗のクリームでPTメンバーのHP,ST、空腹を回復する\n発動に必要なBuff : モンブラン デコレーション",
    "transfer": "×",
    "acquisition": "もえガチャ(装備)\n初出201006",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-3df095aba8-40-40",
    "name": "いやしのくうかん",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "生命力",
        "min": 40.0
      },
      {
        "skill": "持久力",
        "min": 40.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 40.0,
    "cost": {
      "st": 21.0
    },
    "castTime": "184",
    "delay": "1840",
    "description": "みんなでぴょんぴょんたのしいな♪",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出191119\nコラボ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-bd007195d0-40-40",
    "name": "ソウル スティール",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "盗み",
        "min": 40.0
      },
      {
        "skill": "死の魔法",
        "min": 40.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "150",
    "delay": "1150",
    "description": "闇の力で対象のスタミナとマナ・ポイントを盗む",
    "transfer": "○",
    "acquisition": "錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-ffc48b19a7-60-40",
    "name": "ハートビート ヒーリング",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 60.0
      },
      {
        "skill": "自然回復",
        "min": 40.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1350",
    "description": "自然の力で対象の生命力を賦活し、継続回復効果を付与する",
    "transfer": "○",
    "acquisition": "もえガチャ(ログホラコラボ)\n初出210727",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-ab9f39f774-40",
    "name": "兵糧丸",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "薬調合",
        "min": 40.0
      }
    ],
    "successSkill": "薬調合",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "120",
    "delay": "1920",
    "description": "HPを150回復、一時的にスタミナの最大値を1.5倍、スタミナの自然回復速度を上昇させる\n発動に必要なBuff : アサシン マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出240702",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "○"
  },
  {
    "id": "tech-4000ebb85a-82889f7375-60-40",
    "name": "Ｓ.Ｗ.Ｄ",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 60.0
      },
      {
        "skill": "ダンス",
        "min": 40.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "220",
    "delay": "2220",
    "description": "PTメンバーとダンスを踊り HP自然回復をUPさせる\n(Shall We Dance?)\n発動に必要なBuff : S.N.F",
    "transfer": "",
    "acquisition": "錬金-第4弾(特殊)\n練金-第5.5弾\nQoA プリティ ゴースト",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-539c59d6e1-50",
    "name": "トリミング ケア",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "調教",
        "min": 50.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "220",
    "delay": "1120",
    "description": "ペットの身体的ケアからメンタル面のケアまでしっかりサポート！\n※ペットにかかっているDEBUFFを消し去り、MPを回復する\n発動に必要なBuff : ブリーダー マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出191029",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-936006fe2f-50",
    "name": "ハッスル ソング",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "音楽",
        "min": 50.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "250",
    "delay": "900",
    "description": "自分以外のPTメンバーに元気を与える応援ソングを歌う\n発動に必要なBuff :\nアイドルの卵",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230725",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "○"
  },
  {
    "id": "tech-4000ebb85a-29851b5b3a-50",
    "name": "ファッシネイト キッス",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "音楽",
        "min": 50.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "250",
    "delay": "900",
    "description": "アイドルの投げキッスでハッスルする\n※対象のスタミナが回復する\n発動に必要なBuff : 新人アイドル マスタリー or オールド アイドル マスタリー",
    "transfer": "",
    "acquisition": "錬金の箱\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-471ca4eac3-60",
    "name": "シバルリー スピリッツ",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 60.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "280",
    "delay": "1780",
    "description": "背後に守るべき者が多いほど体力（HP）を回復する\n発動に必要なBuff : ウォーリアー マスタリー or ブレイブナイト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210525",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-396783355c-90-60-60",
    "name": "大自然の息吹",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 90.0
      },
      {
        "skill": "回復魔法",
        "min": 60.0
      },
      {
        "skill": "魔法熟練",
        "min": 60.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 90.0,
    "cost": {
      "st": 100.0
    },
    "castTime": "300",
    "delay": "7200",
    "description": "自然界のエネルギーを体内に取り込み魔力へ変換して放つことで\nPTメンバーとペットの傷を完全に癒し、さらに負の効果を全て打ち消す",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出190924",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-c4b01faea4-70",
    "name": "ゴッド ブレス",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 70.0
      }
    ],
    "successSkill": "回復魔法",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "150",
    "delay": "7200",
    "description": "神へ祈りを捧げることで、神の祝福を受けてHPが全快する\n発動に必要なBuff : テンプルナイト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出221213",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "○"
  },
  {
    "id": "tech-4000ebb85a-b9a53fc517-70-70-70",
    "name": "ネイチャー ヒーリング",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 70.0
      },
      {
        "skill": "魔法熟練",
        "min": 70.0
      },
      {
        "skill": "自然回復",
        "min": 70.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 70.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "300",
    "delay": "1500",
    "description": "大地の力を借りて、HP/MP/STの回復速度を高める",
    "transfer": "",
    "acquisition": "錬金-第2弾\nネイチャー ゴーレム（ゴージャス スティール）",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "○"
  },
  {
    "id": "tech-4000ebb85a-d072be2a53-70",
    "name": "マナ リチャージ",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 70.0
      }
    ],
    "successSkill": "回復魔法",
    "successRequired": 70.0,
    "cost": {
      "st": 50.0
    },
    "castTime": "280",
    "delay": "18280",
    "description": "大気中に漂うマナを吸収して消耗したマナを全回復させる\n発動に必要なBuff : アルケミスト マスタリー or 魔力結晶",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210224\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-4000ebb85a-809be35422-70-70",
    "name": "ライブ ステージ",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 70.0
      },
      {
        "skill": "音楽",
        "min": 70.0
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "510",
    "delay": "1850",
    "description": "アイドルが踊りだすと 何処でもライブ会場に早変わり！\n発動に必要なBuff : 新人アイドル マスタリー or オールド アイドル マスタリー",
    "transfer": "",
    "acquisition": "錬金-第9弾(褒賞)\n錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-a6ff684cfc-80-80",
    "name": "チェンジ エナジー",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 80.0
      },
      {
        "skill": "神秘魔法",
        "min": 80.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 80.0,
    "cost": {
      "st": 0.0
    },
    "castTime": "200",
    "delay": "1200",
    "description": "HPをスタミナへと変換することができる",
    "transfer": "○",
    "acquisition": "火竜神殿-宝箱\n錬金-第3.5弾\n錬金-第5弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-1879ae50d7-90",
    "name": "エリア チェリッシング",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "調教",
        "min": 90.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "220",
    "delay": "1020",
    "description": "愛情を込めて周囲にいるペットを介抱し、HPを回復させる\n発動に必要なBuff : ブリーダー マスタリー",
    "transfer": "",
    "acquisition": "複製\n錬金-第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": "×"
  },
  {
    "id": "tech-4000ebb85a-941b75c228-90",
    "name": "リバイバル ソウル",
    "kind": "テクニック",
    "category": "複合技/回復",
    "requirements": [
      {
        "skill": "調教",
        "min": 90.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "250",
    "delay": "4250",
    "description": "復活の儀式でペット達の魂を呼び戻し復活させる\n発動に必要なBuff : ブリーダー マスタリー\nor フォレスター マスタリー",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B2%F3%C9%FC",
    "move": ""
  },
  {
    "id": "tech-535536ea23-ab11bf5092-1",
    "name": "インファント カーズ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 1.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "魔眼の力による幼児化の呪いで対象を弱体化させる\n発動に必要なBuff :\n悪魔の瞳",
    "transfer": "×",
    "acquisition": "もえガチャ(前提装備)\n初出211026",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-a4bad3f90c-1",
    "name": "ウォーター バズーカ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "120",
    "delay": "480",
    "description": "水鉄砲の水を勢い良く飛ばす専用技\n発動に必要なBuff : ウォーター チャージ",
    "transfer": "",
    "acquisition": "もえガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-2d4cb561c8-1",
    "name": "エリア エクスカベイション",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "採掘",
        "min": 1.0
      }
    ],
    "successSkill": "採掘",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "200",
    "delay": "1000",
    "description": "専用の機材で周囲の地面をまとめて掘り返す\n発動に必要なBuff :\n掘削モード",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230131",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-3bbdfe1981-1",
    "name": "エンチャント シュート",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "キック",
        "min": 1.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "120",
    "delay": "300",
    "description": "通常攻撃のようにエンチャントやクリティカル効果が付与される蹴り\n発動に必要なBuff : エンチャント レッグ系\n(\nエンチャント レッグ\n、\nエンチャント レッグ ファイアー、\nエンチャント レッグ サンダー、エンチャント レッグ アイス\n)",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出220405",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-6646db6d1c-1",
    "name": "サイコキャノン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 60.0
    },
    "castTime": "180",
    "delay": "1080",
    "description": "ノアガンアームにチャージされたノアストーンのエネルギーを放出する\n発動に必要なBuff : サイコチャージ",
    "transfer": "",
    "acquisition": "もえガチャ（夏袋）\n160809",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-d619d1308f-1",
    "name": "タンク キャノン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 1.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "120",
    "delay": "1320",
    "description": "背中に仕込んだ砲台から弾を発射する\n発動に必要なBuff : 戦車リュック\nor\nツインキャノン\n発動毎に「弾」を消費する、種類不問",
    "transfer": "",
    "acquisition": "もえガチャ（福袋）\n171226",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-172283fe2c-1",
    "name": "ツイン マナレーザー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "100",
    "delay": "900",
    "description": "マナを圧縮したレーザーを放つ\n※対NPCのみ使用可能\n※威力は精神力スキルに依存する\n発動に必要なBuff :\nマナ・コンバーター",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230829",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-04a275132c-1",
    "name": "ドライバーショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 1.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "130",
    "delay": "720",
    "description": "フルスイングで対象を遠くまで飛ばす一撃\n※対NPCのみ使用可能\n発動に必要なBuff :\nドライバー",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出240528",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-9c6516fa60-1",
    "name": "ドリル ディグ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "採掘",
        "min": 1.0
      }
    ],
    "successSkill": "採掘",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "105",
    "delay": "950",
    "description": "手に装備したドリル アームで採掘を行う\n発動に必要なBuff : 採掘モード",
    "transfer": "",
    "acquisition": "錬金-第6弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-7e0ce36948-1",
    "name": "ノア ガトリング",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 1.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "200",
    "delay": "1800",
    "description": "ノアの力で弾丸を高速で連射する技\n※発動には銃器の弾が必要\n威力は筋力スキルに依存する\n発動に必要なBuff :\nガトリング アーム",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230829",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-ed7aa2387c-1",
    "name": "ノア バスター",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 1.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "40",
    "delay": "40",
    "description": "威力は低いが連続で発動可能な気弾を放つ\n※対NPCのみ使用可能、空中発動可\n発動に必要なBuff :\nノア チャージ",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出220823",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "筋力依存",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-d7107a0330-1",
    "name": "ノアチャージ ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 1.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 1.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "180",
    "delay": "600",
    "description": "エネルギーを溜めて圧縮された巨大な気弾を放つ\n※対NPCのみ使用可能\n発動に必要なBuff :\nノア チャージ",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出220823",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "筋力依存",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-f38085ecca-1",
    "name": "バラージ ファイア",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "120",
    "delay": "1600",
    "description": "対象に集中砲火を浴びせてダメージを与える\n※銃器スキルが高いほどダメージが増加する\n発動に必要なBuff : 支援ユニット",
    "transfer": "",
    "acquisition": "もえガチャ\n181030",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "短評\n参照",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-a99259444d-1",
    "name": "パンプキン キャノン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 1.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "120",
    "delay": "900",
    "description": "対象にカボチャ型の炸裂弾を撃って、周囲に大ダメージを与える\n※発動には任意の武器を装備する必要があります。\n※技のダメージ量、射程は武器に依存します。\n発動に必要なBuff :\n南瓜戦車",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出250812",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-f5bbd9a03c-1",
    "name": "ピーチ キャノン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "130",
    "delay": "450",
    "description": "杖の力を借りて桃のエネルギー弾を放ち、与えたダメージの20％分MPが回復する\n※スキルが足りなくても発動可能、精神力スキルで威力が上がる\n発動に必要なBuff :\n桃の加護",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出220301",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-4c8b76b282-1",
    "name": "フレイムスロワー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "200",
    "delay": "1400",
    "description": "タンクに入った可燃性の液体を噴射して点火することで直線上に火炎を噴き出す\n発動に必要なBuff :\n液体燃料",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出220524",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-42dfd04e08-1",
    "name": "ブラッド ドロー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "包帯",
        "min": 1.0
      }
    ],
    "successSkill": "包帯",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "120",
    "delay": "1100",
    "description": "注射で対象の血液を採取する\n※HPとMPを吸収する\n発動に必要なBuff : 白衣の天使",
    "transfer": "",
    "acquisition": "もえガチャ\n181127",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-3caae6c4f7-1",
    "name": "プロメテウスの炎",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "破壊魔法",
        "min": 1.0
      }
    ],
    "successSkill": "破壊魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "130",
    "delay": "450",
    "description": "杖の力を借りて炎の玉を放つ\n※スキルが足りなくても発動可能、破壊魔法スキルで威力が上がる\n発動に必要なBuff : 火神の力\n※必要スキルに「破壊魔法」がありますが、スキル値0でも使用できます。",
    "transfer": "",
    "acquisition": "もえガチャ\n初出190723",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-f4f389d6bd-1",
    "name": "マナ キャノン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "40",
    "delay": "80",
    "description": "マナを消費して連続で発動可能なエネルギー弾を放つ\n※対NPCのみ使用可能、空中発動可\n発動に必要なBuff :\nノア ポッド\n※必要スキルに「精神力」がありますが、スキル値0でも使用できます。",
    "transfer": "",
    "acquisition": "もえガチャ\n(ミラクルサマーガチャ)\n(前提装備)\n初出230808",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "詳細参照",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-fb18d46e04-1",
    "name": "メダロット ガトリング",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 1.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "130",
    "delay": "1800",
    "description": "防御不可能な5連射撃技\n※威力は筋力スキルに依存します\n発動に必要なBuff :\nメタビー フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211116",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": ""
  },
  {
    "id": "tech-535536ea23-f4241e72fc-1",
    "name": "メダロット キャンセラー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 1.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "100",
    "delay": "1200",
    "description": "ダメージを与えて対象の有益な効果を2つ消す\n※発動には近接武器を装備している必要があります\n発動に必要なBuff :\nシュシュポップ フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』 コラボ\nもえガチャ(前提装備)\n初出231003",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.2",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-0934c15b24-1",
    "name": "メダロット サクション",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "170",
    "delay": "1300",
    "description": "対象のHPを吸収する\n※吸収量は精神力スキルに依存します\n発動に必要なBuff :\nナイトクイーン フォーム",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出260303",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-f8c396d6ef-1",
    "name": "メダロット サンダー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 1.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "100",
    "delay": "1300",
    "description": "対象にダメージを与えて麻痺させ、一時的に行動不可能状態にする\n※発動には近接武器を装備している必要があります\n発動に必要なBuff :\nペッパーキャット フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211122",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.4",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-b42796d5d1-1",
    "name": "メダロット ソード",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 1.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "120",
    "delay": "1300",
    "description": "威力の高い単体斬撃\n※発動には近接武器を装備している必要があります\n発動に必要なBuff :\nロクショウ フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211122",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.5",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-e920cb8de1-1",
    "name": "メダロット デストロイ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "160",
    "delay": "1800",
    "description": "防御力に関係なく大ダメージを与える射撃攻撃\n※攻撃力と射程は武器に依存します\n※対NPCのみ使用可能\n発動に必要なBuff :\nパラレルデウス フォーム",
    "transfer": "",
    "acquisition": "『メダロット』 コラボ\nもえガチャ(前提装備)\n初出260317",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-79e15d5136-1",
    "name": "メダロット ハイパービーム",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "180",
    "delay": "2000",
    "description": "ガードを貫通する強力なビームを放つ\n※攻撃力と射程は武器に依存します\n発動に必要なBuff :\nアークビートル フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211130",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "2.0",
    "move": ""
  },
  {
    "id": "tech-535536ea23-3a426d0c57-1",
    "name": "メダロット ハイパーミサイル",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 1.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "215",
    "delay": "2400",
    "description": "軽減不可の射撃攻撃\n※威力は筋力スキルに依存します\n発動に必要なBuff :\nハードネステン フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』 コラボ\nもえガチャ(前提装備)\n初出231017",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-1a5674f9d5-1",
    "name": "メダロット ハンマー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 1.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "120",
    "delay": "1500",
    "description": "防御を貫く渾身の一撃\n※発動には近接武器を装備している必要があります\n発動に必要なBuff :\nロクショウ フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211122",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.25",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-4725659577-1",
    "name": "メダロット ハードハンマー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 1.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "130",
    "delay": "1800",
    "description": "対象の防御力を無視して大ダメージを与える\n※発動には近接武器を装備している必要があります\n※対NPCのみ使用可能\n発動に必要なBuff :\nシャドウアーマー フォーム",
    "transfer": "",
    "acquisition": "『メダロット』 コラボ\nもえガチャ(前提装備)\n初出260310",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-0ff99aca9e-1",
    "name": "メダロット パワーライフル",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "130",
    "delay": "1300",
    "description": "エネルギーを溜めて放つ高威力の射撃技\n※攻撃力と射程は武器に依存します\n発動に必要なBuff :\nアークビートル フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211130",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.45",
    "move": ""
  },
  {
    "id": "tech-535536ea23-0aa6450768-1",
    "name": "メダロット フリーズ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 1.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "120",
    "delay": "1300",
    "description": "対象にダメージを与え凍結させ、凍結中は防御と回避が0になる\n※ダメージを受けると解除される\n※発動には接近武器を装備している必要があります\n発動に必要なBuff :\nディアステージ フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211116",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-65e3af259f-1",
    "name": "メダロット ブレイク",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "200",
    "delay": "1800",
    "description": "対象の防御力に関係なく大ダメージを与える技\n※攻撃力と射程は武器に依存します\n発動に必要なBuff :\nゴッドエンペラー フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211130",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.5",
    "move": ""
  },
  {
    "id": "tech-535536ea23-40aba45baa-1",
    "name": "メダロット プレス",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "160",
    "delay": "1300",
    "description": "対象に必中の重力ダメージを与え、一定確率でクリティカルが発生する\n※攻撃力と射程は武器に依存します\n※対NPCのみ使用可能\n発動に必要なBuff :\nパラレルデウス フォーム",
    "transfer": "",
    "acquisition": "『メダロット』 コラボ\nもえガチャ(前提装備)\n初出260317",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-af1c0fa8da-1",
    "name": "メダロット マイナスアタック",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 1.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "150",
    "delay": "1300",
    "description": "HPが低いほど威力が上昇する一撃\n※発動には近接武器を装備している必要があります\n※対NPCのみ使用可能\n発動に必要なBuff :\nシャドウアーマー フォーム",
    "transfer": "",
    "acquisition": "『メダロット』 コラボ\nもえガチャ(前提装備)\n初出260310",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-12537d2ff4-1",
    "name": "メダロット メガガトリング",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 1.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "130",
    "delay": "2000",
    "description": "防御不可能な5連射撃技\n※威力は筋力スキルに依存します\n発動に必要なBuff :\nハードネステン フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』 コラボ\nもえガチャ(前提装備)\n初出231017",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-163e0153a1-1",
    "name": "メダロット ライフル",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "130",
    "delay": "1200",
    "description": "エネルギーを溜めて放つ射撃技\n※攻撃力と射程が武器に依存します\n発動に必要なBuff :\nメタビー フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211116",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.35",
    "move": ""
  },
  {
    "id": "tech-535536ea23-4d8ea3fbf6-1",
    "name": "メダロット レーザー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "180",
    "delay": "1400",
    "description": "圧縮された高エネルギーのガードを貫くレーザーを放つ技\n※攻撃力と射程は武器に依存します\n発動に必要なBuff :\nゴッドエンペラー フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211130",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.65",
    "move": ""
  },
  {
    "id": "tech-535536ea23-25aa188fad-1",
    "name": "ローリング バースト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 1.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "60",
    "delay": "1200",
    "description": "高速で回転しながら対象を弾き飛ばす\n発動に必要なBuff :\n独楽",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出240618",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-07bf2a8a1f-1",
    "name": "冥界送り",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "死の魔法",
        "min": 1.0
      }
    ],
    "successSkill": "死の魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "150",
    "delay": "1000",
    "description": "瀕死の敵の魂を刈り取り、冥界へを送る技\n※対象のHPが10%以下の場合のみ、効果が発動する\n(与えることができるダメージは最大で200です。)\n発動に必要なBuff :\nアヌビスの力",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230124",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-453415e09e-1",
    "name": "水弾",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "水泳",
        "min": 1.0
      }
    ],
    "successSkill": "水泳",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "100",
    "delay": "240",
    "description": "口から水の弾を吐き出す\n発動に必要なBuff :\nシーホースの力",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出240109",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "水泳0.8",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-967b4ac033-8-8",
    "name": "プリニー落とし",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "投げ",
        "min": 8.0
      },
      {
        "skill": "暗黒命令",
        "min": 8.0
      }
    ],
    "successSkill": "投げ",
    "successRequired": 8.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "180",
    "delay": "1200",
    "description": "その技のために一体どれだけのプリニーを犠牲にしたんだァッー！",
    "transfer": "○",
    "acquisition": "ディスガイアコラボガチャ\n180605〜0626",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-8f9f46d91f-8-8",
    "name": "ラブナックル！",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 8.0
      },
      {
        "skill": "生命力",
        "min": 8.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 8.0,
    "cost": {
      "st": 12.0
    },
    "castTime": "180",
    "delay": "1050",
    "description": "ただ全力で放つ愛の拳！この気持ち！まさしく愛です！",
    "transfer": "○",
    "acquisition": "ディスガイアコラボガチャ\n180612〜0626",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.3",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-cb954f8c72-8-8",
    "name": "爆弾ノック",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 8.0
      },
      {
        "skill": "罠",
        "min": 8.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 8.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "130",
    "delay": "1200",
    "description": "伝説のバッター、現る",
    "transfer": "○",
    "acquisition": "ディスガイアコラボガチャ\n180529〜0626",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-45059f9c91-70-70-10",
    "name": "バーニング シュート",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "キック",
        "min": 70.0
      },
      {
        "skill": "持久力",
        "min": 70.0
      },
      {
        "skill": "素手",
        "min": 10.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "160",
    "delay": "1060",
    "description": "回転しながら飛び上がりオーバーヘッドで炎の球を蹴り飛ばす技",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出230606",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-8253c0a9e8-30-10",
    "name": "パイ投げ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "料理",
        "min": 30.0
      },
      {
        "skill": "投げ",
        "min": 10.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 30.0,
    "cost": {
      "st": 9.0
    },
    "castTime": "110",
    "delay": "1200",
    "description": "ケーキを対象の顔めがけて投げつける\n使用アイテム : ショート ケーキ",
    "transfer": "○",
    "acquisition": "錬金-第4弾\n黒の廟堂 交換報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "料理\n依存？",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-b8d61fa73f-10-10",
    "name": "レイジブロー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 10.0
      },
      {
        "skill": "戦闘技術",
        "min": 10.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 10.0,
    "cost": {
      "st": 9.0
    },
    "castTime": "150",
    "delay": "1200",
    "description": "踏み込みと共に両手剣で斬り裂く攻撃",
    "transfer": "",
    "acquisition": "『 灰と幻想のグリムガル 』コラボ\n七賢者の箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.2",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-06b9dd9783-50-20",
    "name": "タライ落とし",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 50.0
      },
      {
        "skill": "召喚魔法",
        "min": 20.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "250",
    "delay": "1140",
    "description": "対象の頭上にタライを召喚し落とす",
    "transfer": "○",
    "acquisition": "錬金-第7弾\n錬金-GENERATIONS\n精錬の泉\n火竜神殿-宝箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "？",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-d3c5f5461d-80-20",
    "name": "水遁の術",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 80.0
      },
      {
        "skill": "神秘魔法",
        "min": 20.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "250",
    "delay": "1650",
    "description": "少量の水を触媒にして大量の水を口から吐き出す忍術\n水属性ダメージと水圧によるノックバック効果を与える\n発動に必要なBuff : アサシン マスタリー\n使用アイテム : サモンス ウォーター",
    "transfer": "×",
    "acquisition": "黒の廟堂\n170321",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-b462a34755-70-20",
    "name": "火竜の咆哮",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "生命力",
        "min": 70.0
      },
      {
        "skill": "神秘魔法",
        "min": 20.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "150",
    "delay": "1550",
    "description": "口から灼熱の炎のブレスを放つ",
    "transfer": "○",
    "acquisition": "『 FAIRY TAIL 』コラボ\nもえガチャ\n初出190129",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-cffc068157-50-20",
    "name": "火竜の鉄拳",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 50.0
      },
      {
        "skill": "神秘魔法",
        "min": 20.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "90",
    "delay": "1200",
    "description": "炎を纏った拳で敵を殴りつける\n※ドラゴンタイプに特効効果あり",
    "transfer": "○",
    "acquisition": "『 FAIRY TAIL 』コラボ\nチケット交換報酬\n黒バハ報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.0+0.6",
    "move": ""
  },
  {
    "id": "tech-535536ea23-463467d3b7-60-20",
    "name": "神速打ち",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 60.0
      },
      {
        "skill": "集中力",
        "min": 20.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "60",
    "delay": "400",
    "description": "素早く構えて銃を撃つ\n※発動には片手銃を装備している必要がある",
    "transfer": "",
    "acquisition": "『ありふれた職業で世界最強』\nコラボクエスト報酬\n250422〜250520",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.0",
    "move": ""
  },
  {
    "id": "tech-535536ea23-e5ce629415-60-20",
    "name": "脳天唐竹割り",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 60.0
      },
      {
        "skill": "パフォーマンス",
        "min": 20.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "120",
    "delay": "900",
    "description": "対象の脳天めがけて縦方向のチョップを放つ打撃技",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出230919",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "NPC1.3\nPC1.15",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-4773d4940d-30",
    "name": "カオス ブレイカー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "生命力",
        "min": 30.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 30.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "200",
    "delay": "900",
    "description": "カオス生物に対して絶大な威力を持つ生命エネルギーを放つ技",
    "transfer": "○",
    "acquisition": "イビル タイタン\n火竜神殿-宝箱\n錬金-第1弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "2.0",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-37a9c0294a-30",
    "name": "ケロっと ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "水泳",
        "min": 30.0
      }
    ],
    "successSkill": "水泳",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "140",
    "delay": "1240",
    "description": "対象を背中の水鉄砲でずぶ濡れにして移動速度を低下させる\n発動に必要なBuff :\nウォーター タンク",
    "transfer": "",
    "acquisition": "もえガチャ\n初出200602",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-72913b18c0-70-30",
    "name": "スティール ハート ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 70.0
      },
      {
        "skill": "盗み",
        "min": 30.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "140",
    "delay": "1200",
    "description": "ハートの矢で対象を射抜きHPを吸収する",
    "transfer": "○",
    "acquisition": "『 叛逆性ミリオンアーサー 』\nコラボもえガチャ\n初出190813\n装備セット同梱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.3(1.0)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-ae883085ad-30",
    "name": "ソーン プリズン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "罠",
        "min": 30.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "150",
    "delay": "1650",
    "description": "吸血植物の茨で対象を閉じ込めて徐々に体力を奪う\n発動に必要なBuff :\n茨の契約",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出210323",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": ""
  },
  {
    "id": "tech-535536ea23-da221dbf1a-30-30",
    "name": "ダーティー スロウ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "投げ",
        "min": 30.0
      },
      {
        "skill": "薬調合",
        "min": 30.0
      }
    ],
    "successSkill": "投げ",
    "successRequired": 30.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "120",
    "delay": "920",
    "description": "対象に汚物と共に投げつけて追加で毒ダメージを与える",
    "transfer": "×",
    "acquisition": "初出190611)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.7+α",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-2cb8316ce0-30",
    "name": "チェイン オブ バインド",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "精神力",
        "min": 30.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 30.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "200",
    "delay": "1200",
    "description": "魔力で鎖を操作し、敵を捕縛して無力化する\n※ダメージで解除される\n発動に必要なBuff :\nペンデュラム",
    "transfer": "",
    "acquisition": "課金プレゼント(前提装備)\n初出220111",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "なし",
    "move": ""
  },
  {
    "id": "tech-535536ea23-e575f02e01-90-30",
    "name": "チャージ ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 90.0
      },
      {
        "skill": "集中力",
        "min": 30.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "250",
    "delay": "1200",
    "description": "力を込めた強力なショット",
    "transfer": "○",
    "acquisition": "NPC販売(War奇跡)\n(※品)\n錬金-第4弾(特殊)\n練金-第5.5弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.7\n(1.5)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-d551ede596-60-30",
    "name": "デストロイ ウェポン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 30.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 30.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1150",
    "description": "ターゲットに少量のダメージを与え、武器の耐久度を大幅に減らす",
    "transfer": "○",
    "acquisition": "錬金-第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-fba69f32d8-30",
    "name": "トリプル フィレッツ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "料理",
        "min": 30.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 30.0,
    "cost": {
      "st": 27.0
    },
    "castTime": "150",
    "delay": "1050",
    "description": "魚を捌くかのように対象を切る\n発動に必要なBuff : 厨房師 マスタリー",
    "transfer": "○",
    "acquisition": "複製\n錬金-第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "料理\n依存",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-52d0450b4b-30-30",
    "name": "バックスタブ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 30.0
      },
      {
        "skill": "盗み",
        "min": 30.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "120",
    "delay": "1200",
    "description": "相手の背後から片手剣を急所に突き刺し、ダメージを与える\n背後以外から発動できない",
    "transfer": "",
    "acquisition": "『 灰と幻想のグリムガル 』コラボ\n七賢者の箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.0\n(0.9)",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-2578136d75-30",
    "name": "バックハンド チョップ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 30.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "120",
    "delay": "980",
    "description": "対象の胸元めがけて 水平にチョップする\n発動に必要なBuff : 荒くれ者 マスタリー",
    "transfer": "",
    "acquisition": "グレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.8",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-2b5e23bbd3-30-70",
    "name": "フェリング スラッシュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "伐採",
        "min": 30.0
      },
      {
        "skill": "木工",
        "min": 70.0
      }
    ],
    "successSkill": "伐採",
    "successRequired": 30.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "100",
    "delay": "800",
    "description": "伐採で鍛え上げられた肉体から繰り出される一撃\n伐採斧専用",
    "transfer": "○",
    "acquisition": "パンダマン\n錬金-第1弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.5",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-ed5d0395e6-30",
    "name": "フォトン レーザー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 30.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 30.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "120",
    "delay": "360",
    "description": "マナを光の粒子に変えて放つ光線銃専用の技\n発動に必要なBuff :\n光線銃",
    "transfer": "",
    "acquisition": "[鍛冶](前提装備)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-f19746ecaf-80-30",
    "name": "マジック ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 80.0
      },
      {
        "skill": "破壊魔法",
        "min": 30.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 80.0,
    "cost": {
      "st": 39.0
    },
    "castTime": "140",
    "delay": "1300",
    "description": "魔法の弾を発射して直線上の敵を撃ち抜く",
    "transfer": "○",
    "acquisition": "NPC販売(War奇跡)\n(※品)\n錬金-第4弾\n練金-第5.5弾\n錬金-第6弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "(0.9)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-19d704ffa2-40-30",
    "name": "マナ スラスト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 40.0
      },
      {
        "skill": "精神力",
        "min": 30.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 40.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "135",
    "delay": "1100",
    "description": "槍をマナの力で強化して 対象の防御を無効化する一撃を放つ",
    "transfer": "○",
    "acquisition": "錬金-GENERATIONS\n錬金-第9弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "(0.55)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-92d2536e02-50-30",
    "name": "レッグ スラッシュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 50.0
      },
      {
        "skill": "知能",
        "min": 30.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "155",
    "delay": "1100",
    "description": "両足を斬り付け動きを鈍らす\n※対象の移動速度上昇技を無効化させる",
    "transfer": "○",
    "acquisition": "錬金-第4弾(特殊)\n練金-第5.5弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.8×2\n(0.5×2)",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-b519b15845-30",
    "name": "ロック スマッシュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "採掘",
        "min": 30.0
      }
    ],
    "successSkill": "採掘",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "220",
    "delay": "870",
    "description": "硬い岩石やゴーレムをドリルで粉砕する技\n発動に必要なBuff : 採掘魂",
    "transfer": "×",
    "acquisition": "もえガチャ\n初出200414",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": ""
  },
  {
    "id": "tech-535536ea23-ba97ec6c06-30",
    "name": "斬り斬り舞",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 30.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "回転で生じた風の刃が周囲の敵を切り刻む\n発動に必要なBuff :\n円月輪",
    "transfer": "×",
    "acquisition": "もえガチャ(装備)\n初出200929",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "スキル値*0.43*4",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-266e585b26-70-40",
    "name": "アクア ダイブ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 70.0
      },
      {
        "skill": "水泳",
        "min": 40.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "180",
    "delay": "1250",
    "description": "水の力を纏った状態で大ジャンプを行い、\n頭上めがけて槍を突き刺し水属性の追加ダメージを与える",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出190528",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-f8e7c58239-80-40",
    "name": "アブストラクション ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 80.0
      },
      {
        "skill": "呪文抵抗力",
        "min": 40.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "160",
    "delay": "1200",
    "description": "詠唱妨害効果のある矢を放つ",
    "transfer": "○",
    "acquisition": "錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.05\n(0.7)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-e1410c2246-60-40",
    "name": "アース ビート",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 60.0
      },
      {
        "skill": "自然調和",
        "min": 40.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "180",
    "delay": "1300",
    "description": "激しく地面を振動させ 周囲の敵にダメージと鈍足効果を与える",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出241119",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-59ac52d969-70-40",
    "name": "インパクト ウェーブ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 70.0
      },
      {
        "skill": "集中力",
        "min": 40.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "180",
    "delay": "1200",
    "description": "大地を振動させて 衝撃波を生み出し 周囲の敵を吹き飛ばす",
    "transfer": "○",
    "acquisition": "錬金-第7弾\n錬金-GENERATIONS",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.5\n(0.3)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-27b871127f-40",
    "name": "エリア ハーベスト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "収穫",
        "min": 40.0
      }
    ],
    "successSkill": "収穫",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "300",
    "delay": "1200",
    "description": "専用の機材で周囲の草木をまとめて刈る技\n発動に必要なBuff :\nチップソー",
    "transfer": "×",
    "acquisition": "もえガチャ(装備)\n初出201020",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.5*4",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-7ce8ef8990-40-40",
    "name": "エリア フェリング",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "伐採",
        "min": 40.0
      },
      {
        "skill": "木工",
        "min": 40.0
      }
    ],
    "successSkill": "伐採",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "150",
    "delay": "1000",
    "description": "遠心力を利用して周囲の大木を切り倒す",
    "transfer": "",
    "acquisition": "錬金の箱\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-9eece918a4-80-80-40",
    "name": "オーラ フィスト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 80.0
      },
      {
        "skill": "神秘魔法",
        "min": 40.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "110",
    "delay": "1200",
    "description": "闘気を纏った拳から放たれる渾身のストレートで直線上の敵にダメージを与える",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出250121",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.3+1.0\n(PC1.0+0.8)",
    "move": ""
  },
  {
    "id": "tech-535536ea23-705600f194-40",
    "name": "クイック アロー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 40.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "80",
    "delay": "600",
    "description": "威力は落ちるが隙を減らして素早く矢を射る\n※弓スキル値が高いほどディレイが短くなる\n発動に必要なBuff : フォレスター マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出260127",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-04d65e988d-40",
    "name": "クロスファイアー ボム",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "罠",
        "min": 40.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 40.0,
    "cost": {
      "st": 21.0
    },
    "castTime": "60",
    "delay": "340",
    "description": "お手製の特殊な爆弾を設置する\n※自分が爆発の範囲内にいた場合はダメージを受ける\n※範囲内に他の爆弾がある場合は誘爆する\n※スキル値が高いほど、威力や射程が増加する\n発動に必要なBuff : 爆弾男 マスタリー\n使用アイテム : グレート エクスプロード ポーション",
    "transfer": "○",
    "acquisition": "錬金-第9弾\n錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "短評\n参照",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-22e7ebeb27-90-40",
    "name": "グラビティ ダーク",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 90.0
      },
      {
        "skill": "死の魔法",
        "min": 40.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "1400",
    "description": "暗黒の力で対象の動きを止めて、最大HP20％分の魔法ダメージを与える\n※最大で200ダメージを与える",
    "transfer": "○",
    "acquisition": "もえガチャ\n180116",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "割合",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-5982b2a6c7-40",
    "name": "チューチュー ドレイン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "牙",
        "min": 40.0
      }
    ],
    "successSkill": "牙",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "150",
    "delay": "1200",
    "description": "頭に付いた口吻を突き刺して血を吸いスタミナに変換する\n※WarAgeでは効果が無い\n発動に必要なBuff : モスキート スナッチ",
    "transfer": "",
    "acquisition": "もえガチャ\n170711",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-8a066812b4-40-50",
    "name": "ディスポイル",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "盗み",
        "min": 40.0
      },
      {
        "skill": "筋力",
        "min": 50.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "120",
    "delay": "1800",
    "description": "対象に物理ダメージを与え、さらにアイテムを盗むことができる\n※対象のHPが少ないほど成功率が上がります",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出190122",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-63f9f96d44-60-40",
    "name": "デストラクション インパルス",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 60.0
      },
      {
        "skill": "音楽",
        "min": 40.0
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "200",
    "delay": "1000",
    "description": "気持ちが昂り手にした武器を対象に叩きつけて破壊する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210316",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-812bcf6a06-40",
    "name": "トゲトゲ チャージ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 40.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 40.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "150",
    "delay": "1150",
    "description": "トゲの付いた鉄球を身に纏い突撃する\n※約24m先で範囲ダメージを与える\n発動に必要なBuff :\nトゲトゲ パワー",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出220308",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-67eae83fd7-40-40",
    "name": "ドレス・ブレイク",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 40.0
      },
      {
        "skill": "精神力",
        "min": 40.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "120",
    "delay": "920",
    "description": "胴とパンツ部位の装備を強制的に外して一定時間装備不可にする、さらに防御力を低下させる技",
    "transfer": "",
    "acquisition": "D×Dコラボ\nクエスト報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "-",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-ccf0e90f19-40-40",
    "name": "フット スウィープ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "キック",
        "min": 40.0
      },
      {
        "skill": "戦闘技術",
        "min": 40.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "75",
    "delay": "725",
    "description": "低い姿勢から素早く足を払い、相手を転倒させて隙をつくる",
    "transfer": "○",
    "acquisition": "もえガチャ\n180925",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-f763e9f3a3-40-40",
    "name": "ヘイトレッド",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40.0
      },
      {
        "skill": "暗黒命令",
        "min": 40.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "200",
    "delay": "1200",
    "description": "勢いよく踏み込むと共に剣を上から振り下ろす攻撃",
    "transfer": "",
    "acquisition": "『 灰と幻想のグリムガル 』コラボ\n七賢者の箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.2",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-32c247e036-60-40",
    "name": "マジカル ブロー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "破壊魔法",
        "min": 60.0
      },
      {
        "skill": "集中力",
        "min": 40.0
      }
    ],
    "successSkill": "破壊魔法",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "950",
    "description": "拳にマナをためて、魔力が高いほど威力が上がる一撃で敵を粉砕する",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "魔力依存",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-ee166b69be-40",
    "name": "ライジング ドラゴン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 40.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 40.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "180",
    "delay": "1300",
    "description": "右腕に封印された龍神の力を解放して大ダメージを与える\n発動に必要なBuff : 封印されし龍神",
    "transfer": "",
    "acquisition": "もえガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.3",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-825991176f-90-40-40",
    "name": "ローリング ヒーローキック",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "キック",
        "min": 90.0
      },
      {
        "skill": "物まね",
        "min": 40.0
      },
      {
        "skill": "パフォーマンス",
        "min": 40.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "1150",
    "description": "勢いよくジャンプしてから前方二回宙返りの後、前方へ飛び蹴りを放つ必殺技",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出230704",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-b4372801d0-60-40",
    "name": "ヴァイパー ストラッシュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 60.0
      },
      {
        "skill": "牙",
        "min": 40.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "180",
    "delay": "1200",
    "description": "腕の腱を傷つける攻撃で出血させ、継続的なダメージと命中率ダウン効果を与える",
    "transfer": "○",
    "acquisition": "もえガチャ(ログホラコラボ)\n初出210727",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-225d9e5232-40",
    "name": "刈り払い",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 40.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "120",
    "delay": "800",
    "description": "防具の隙間を素早く横に薙ぎ払うように斬りつける\n発動に必要なBuff : フォレスター マスタリー",
    "transfer": "",
    "acquisition": "『 灰と幻想のグリムガル 』コラボ\n七賢者の箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.0",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-fc0c6341b2-40",
    "name": "双棍の極意",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 40.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 40.0,
    "cost": {
      "st": 0.0
    },
    "castTime": "20",
    "delay": "0",
    "description": "左手こんぼうによる追加攻撃が可能になる。\n左手にこんぼう武器を装備している必要があります。\n< 双棍の極意の条件 >\nこんぼうスキルが40以上で\n左手にこんぼう武器を装備していること",
    "transfer": "",
    "acquisition": "もえガチャ\n151117",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-5c0e02a87e-80-40",
    "name": "徹甲弾",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 80.0
      },
      {
        "skill": "鍛冶",
        "min": 40.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "155",
    "delay": "1500",
    "description": "金属の被帽で加工した特殊な弾で貫通力を高めて対象の装甲を貫く\n※対象の防御力を無視してダメージを与える",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出191023",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-1e290c8e25-60-40",
    "name": "暗黒玉",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 60.0
      },
      {
        "skill": "精神力",
        "min": 40.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "240",
    "delay": "1400",
    "description": "暗黒エネルギーを溜めて放ち、敵を包囲して殲滅する技",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出220607",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "暗黒x1.68",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-21b1f8b1cf-40",
    "name": "蛇帯乱舞",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "精神力",
        "min": 40.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 40.0,
    "cost": {
      "st": 21.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "蛇帯が周囲を乱れ飛び敵を切り刻む\n発動に必要なBuff :\n蛇帯",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-c420d05ec6-40",
    "name": "酔避連撃",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 40.0
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "500",
    "delay": "1460",
    "description": "酔拳の動きで相手を翻弄し 紙一重で相手の攻撃を避け\n強力な連続攻撃を繰り出す\n発動に必要なBuff : 酔拳士 マスタリー",
    "transfer": "",
    "acquisition": "複製",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": "△"
  },
  {
    "id": "tech-535536ea23-ea85254c86-90-40",
    "name": "雷光十字剣",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      },
      {
        "skill": "精神力",
        "min": 40.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "180",
    "delay": "1500",
    "description": "左の初撃で対象の動きを止めて右の追撃で雷ダメージを与える\n※発動には左右に刀剣武器を装備する必要がある",
    "transfer": "×",
    "acquisition": "宮殿(儀式)報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-24834a9065-42-42",
    "name": "フォーリン アロー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 42.0
      },
      {
        "skill": "神秘魔法",
        "min": 42.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 42.0,
    "cost": {
      "st": 48.0
    },
    "castTime": "155",
    "delay": "1300",
    "description": "イエス！フォーリンアロー！",
    "transfer": "○",
    "acquisition": "ディスガイアコラボガチャ\n180612〜0626",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.8",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-ac4a7b603f-42-42",
    "name": "魔王玉",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 42.0
      },
      {
        "skill": "戦闘技術",
        "min": 42.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 42.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "240",
    "delay": "1200",
    "description": "魔力の象徴である炎球を自在に操るラハールの必殺技",
    "transfer": "○",
    "acquisition": "ディスガイアコラボガチャ\n180529〜0626",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-39951e9af5-90-50",
    "name": "アーマー ブレイク",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 90.0
      },
      {
        "skill": "破壊魔法",
        "min": 50.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "190",
    "delay": "1300",
    "description": "魔力を込めた一撃で対象の防御力を無効化して攻撃する",
    "transfer": "○",
    "acquisition": "錬金-第8弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "(0.95)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-7b1b41700d-90-50",
    "name": "カース オブ デス",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 90.0
      },
      {
        "skill": "死の魔法",
        "min": 50.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "200",
    "delay": "3200",
    "description": "対象に死の呪いを与える\n呪いを受けた者は90秒後に即死級のダメージを受ける",
    "transfer": "○",
    "acquisition": "錬金-Light",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "固定",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-4599bba1d4-70-50",
    "name": "コーリング ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 70.0
      },
      {
        "skill": "自然調和",
        "min": 50.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "160",
    "delay": "1200",
    "description": "攻撃がヒットした対象を自分の足元へ引き寄せる",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "NPC1.0\nPC0.8",
    "move": ""
  },
  {
    "id": "tech-535536ea23-b904897310-70-50",
    "name": "ジャベリン スロウ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 70.0
      },
      {
        "skill": "投げ",
        "min": 50.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "130",
    "delay": "1500\n(191008以降)",
    "description": "装備した槍を前方の敵めがけて 全力で投げる\n※対象を基準に 後方の敵も貫く 投げた武器の耐久は大幅に減少する\n投げた武器は失ってしまう",
    "transfer": "○",
    "acquisition": "錬金-第7弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.5\n(1.35)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-f3ff5fce5a-50",
    "name": "ドラゴン テイル ウィップ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 50.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "150",
    "delay": "950",
    "description": "回転しながら尻尾で周囲の敵を薙ぎ払う\n※竜化状態の時のみ使用可能\n※筋力スキルは足りなくても発動可能\n発動に必要なBuff : ドラゴン フォース",
    "transfer": "×",
    "acquisition": "竜眼の指輪\n(もえガチャ\n初出190611)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-db3a14871b-50",
    "name": "バタフライ イリュージョン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 50.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "150",
    "delay": "1150",
    "description": "対象へ無数の幻蝶を放ちダメージを与え、鱗粉の効果で混乱させる\n発動に必要なBuff :\n蝶の舞\nor\n月夜の煌き",
    "transfer": "",
    "acquisition": "もえガチャ\n初出190514",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-320a33905a-50",
    "name": "ファイアー バード",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "生命力",
        "min": 50.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "200",
    "delay": "1500",
    "description": "不死鳥の炎を身に纏い、両腕を広げて突進して前方に火属性のダメージを与える技\n発動に必要なBuff : 不死鳥の力",
    "transfer": "",
    "acquisition": "フェニックスヒーロー装備\n(アイテムショップ・\nもえガチャ初出190625)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "生命依存",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-6c8c0828f8-70-50",
    "name": "マインド ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "知能",
        "min": 50.0
      }
    ],
    "successSkill": "知能",
    "successRequired": 50.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "180",
    "delay": "1380",
    "description": "マナを一点に集約させて弾丸のように放つ技",
    "transfer": "○",
    "acquisition": "錬金-第9弾\n錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "精神\n×1.0",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-212e434b26-90-50",
    "name": "レール ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "投げ",
        "min": 90.0
      },
      {
        "skill": "破壊魔法",
        "min": 50.0
      }
    ],
    "successSkill": "投げ",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "160",
    "delay": "1360",
    "description": "雷の電磁力を体内から腕へと巡らせ\n加速させた電磁力と共に 投てき武器を撃ちだす",
    "transfer": "○",
    "acquisition": "錬金-第6弾\n錬金-Light\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "(1.2)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-3d18ec13b4-70-50",
    "name": "一閃",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 70.0
      },
      {
        "skill": "自然調和",
        "min": 50.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "120\n(80)",
    "delay": "1200",
    "description": "一瞬で間合いを詰めて 敵を貫く",
    "transfer": "○",
    "acquisition": "NPC販売(War奇跡)\n(※品)\n錬金-第4弾\n練金-第5.5弾\n練金-第7弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.05\n(0.85)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-d17d98bdf0-60-50",
    "name": "底なし沼",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "罠",
        "min": 60.0
      },
      {
        "skill": "自然調和",
        "min": 50.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "60",
    "delay": "1400",
    "description": "粘土の高い泥状の沼を地面に設置して沼に落ちた敵の動きを止める\n使用アイテム : 泥1",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出200609",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-2533b02ad6-70-50",
    "name": "落石トラップ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "罠",
        "min": 70.0
      },
      {
        "skill": "自然調和",
        "min": 50.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "100",
    "delay": "2000",
    "description": "落石注意の看板を設置して、周囲に落石を発生させる",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出190716",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-ea0fbfaa32-70-50",
    "name": "連続打ち",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 70.0
      },
      {
        "skill": "戦闘技術",
        "min": 50.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "120",
    "delay": "650",
    "description": "1発の威力は低下するが、左右に装備した片手銃を連続で撃つ\n※左手に銃を装備していない場合は右手の銃だけ撃ちます。\n※発動には片手銃を装備している必要がある",
    "transfer": "",
    "acquisition": "『ありふれた職業で世界最強』\nコラボクエスト報酬\n250422〜250520",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.8x2",
    "move": ""
  },
  {
    "id": "tech-535536ea23-dae0c2b69e-80-50",
    "name": "龍気発勁",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      },
      {
        "skill": "精神力",
        "min": 50.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "200",
    "delay": "1000",
    "description": "大地に流れる気を集めて放出する技",
    "transfer": "○",
    "acquisition": "錬金-Light",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.2",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-fa04983344-60",
    "name": "アシッド レイン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 60.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "280",
    "delay": "1700",
    "description": "天に祈りを捧げて 強酸性の雨を降らせ、対象の防御力を低下させる\n発動に必要なBuff : ドルイド マスタリー",
    "transfer": "○",
    "acquisition": "錬金-Light",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "？",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-a2ca22113f-80-60-60",
    "name": "ギガンテック ウェポン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "精神力",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 60.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 80.0,
    "cost": {
      "st": 39.0
    },
    "castTime": "180",
    "delay": "1500",
    "description": "魔法の力で武器を巨大化して一刀両断にする技\n※発動するためには両手持ちの近接武器が必要です",
    "transfer": "○",
    "acquisition": "もえガチャ\n161101",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "2.0？",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-e5bd6ce467-60",
    "name": "サウザンド スラッシュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "料理",
        "min": 60.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 60.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "120",
    "delay": "1000",
    "description": "無数の刃が食材を切り刻む\n※発動には刀剣武器が必要です。\n※対象は収穫可能なオブジェクト（mob）のみです。\n※イベント産出、及び料理か収穫なのか曖昧なので複合に記載。",
    "transfer": "",
    "acquisition": "逃げ出した食材たちを捕まえろ！！\n20181211 〜 20181225",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-6f5476c815-60",
    "name": "シュートアロー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "強化魔法",
        "min": 60.0
      }
    ],
    "successSkill": "強化魔法",
    "successRequired": 60.0,
    "cost": {
      "st": 34.0
    },
    "castTime": "243",
    "delay": "332",
    "description": "矢を風の精霊に頼んで飛ばしてもらう物理攻撃魔法\n発動に必要なBuff : エレメンタルナイト マスタリー\n使用アイテム : 矢",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出240820",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-656ebfaf23-60",
    "name": "ジャンピング ヒップ アタック",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 60.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "120",
    "delay": "1000",
    "description": "相手に背を向けながら臀部を後ろに突き出して対象の胸付近に飛び込む技\n発動に必要なBuff : 荒くれ者 マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出200225",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-77efa2b9a4-90-60",
    "name": "ステークス ブロー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 90.0
      },
      {
        "skill": "戦闘技術",
        "min": 60.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "200",
    "delay": "1500",
    "description": "隙は大きいが渾身の力を込めて放つ一か八かの一撃\n※0.5倍〜3.0倍の範囲で倍率が変動します",
    "transfer": "○",
    "acquisition": "もえガチャ\n160405\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.5〜3.0",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-765e60e677-90-60",
    "name": "スピア オブ ツェペシュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 90.0
      },
      {
        "skill": "牙",
        "min": 60.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "周囲の敵を串刺しにし 流れた血でHPを回復する",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出241119",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "物理0.75\n魔法0.25",
    "move": ""
  },
  {
    "id": "tech-535536ea23-3a11ab0cbe-60-60",
    "name": "ターン インパクト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 60.0
      },
      {
        "skill": "戦闘技術",
        "min": 60.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "120",
    "delay": "1100",
    "description": "強振した一撃で対象を振り向かせる",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "NPC？\nPC1.0",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-a11b4b657b-60-90",
    "name": "ネオ トルネード",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 60.0
      },
      {
        "skill": "キック",
        "min": 90.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 60.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "295",
    "delay": "1250",
    "description": "周囲の敵を引き寄せ、蹴り飛ばす",
    "transfer": "○",
    "acquisition": "火竜神殿-宝箱\n錬金-第2弾\n錬金-第5弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "-",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-5a2d7e6272-90-60",
    "name": "バラージ ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 90.0
      },
      {
        "skill": "キック",
        "min": 60.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "155",
    "delay": "1300",
    "description": "強靭な脚力で飛び上がり、上空から前方の敵を一斉に射抜く",
    "transfer": "○",
    "acquisition": "錬金-第4弾\n練金-第5.5弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.9\n(0.5)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-1aa9c05503-60-80",
    "name": "パワー フィスト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 60.0
      },
      {
        "skill": "筋力",
        "min": 80.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "90",
    "delay": "1110",
    "description": "振りかぶって渾身の一撃で殴る",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "NPC1.45\nPC1.1",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-772423f5d1-60",
    "name": "ヒドゥン ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 60.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1100",
    "description": "一発目と同じ軌道で 防御不能な見えない二発目を射る\n発動に必要なBuff : フォレスター マスタリー",
    "transfer": "○",
    "acquisition": "錬金-第9弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.9\n×2",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-391c9eb3a0-60",
    "name": "フランバージュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "料理",
        "min": 60.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "120",
    "delay": "920",
    "description": "仕上げにアルコールをかけて火柱で瞬時に加熱する技\n発動に必要なBuff : 厨房師 マスタリー\n使用アイテム : ワイン",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出251007",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-4cf4c6108d-60",
    "name": "ヤンキー ウェイ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 60.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "920",
    "delay": "1200",
    "description": "肩が触れた対象を威嚇し\n理不尽な怒りを ぶちまける\n発動に必要なBuff : チンピラ マスタリー",
    "transfer": "",
    "acquisition": "錬金-第6弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "？",
    "move": "特殊"
  },
  {
    "id": "tech-535536ea23-c2d417268b-60",
    "name": "張り手",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 60.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "160",
    "delay": "1000",
    "description": "両腕から強烈な張り手を繰り出して敵を押し出す\n発動に必要なBuff : 力士",
    "transfer": "",
    "acquisition": "もえガチャ\n170117",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.05+α",
    "move": ""
  },
  {
    "id": "tech-535536ea23-7cd0c9f25c-80-60",
    "name": "暗黒捕縛陣",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 80.0
      },
      {
        "skill": "罠",
        "min": 60.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "魔力を込めた糸を蜘蛛の巣状に張り巡らせて敵を捕らえる",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出211109",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-61f31ced54-60",
    "name": "毒霧",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 60.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1050",
    "description": "口に含んだ特殊な液体を対象の顔めがけて吹きかけて視界を奪う\n発動に必要なBuff : 荒くれ者 マスタリー\n使用アイテム : 練りワサビ",
    "transfer": "○",
    "acquisition": "もえガチャ\n181002",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-945dd09675-80-60",
    "name": "無限風刃",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "投げ",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 60.0
      }
    ],
    "successSkill": "投げ",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "180",
    "delay": "1400",
    "description": "無数の風の刃を放ち対象を切り刻む\n※使用には スロウ系ナイフ が必要となります。\n使用アイテム : スロウ系ナイフ",
    "transfer": "○",
    "acquisition": "『 叛逆性ミリオンアーサー 』\nコラボもえガチャ\n初出190813\n装備セット同梱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-a0260e0171-70-60",
    "name": "睡眠ガス弾",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 70.0
      },
      {
        "skill": "薬調合",
        "min": 60.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "155",
    "delay": "1500",
    "description": "対象に直撃すると その周囲に強力な眠り効果のある\nガスを噴出させる\n使用アイテム :グレート ソウバーリング ポーション1",
    "transfer": "○",
    "acquisition": "錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "-",
    "move": ""
  },
  {
    "id": "tech-535536ea23-677c841607-90-60",
    "name": "超ドラゴンフォール",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 90.0
      },
      {
        "skill": "キック",
        "min": 60.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "205",
    "delay": "1440",
    "description": "遥か上空へ大ジャンプを行い 落下中に空中制動して頭上から槍を突き立てる",
    "transfer": "",
    "acquisition": "錬金の箱\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "2.0(1.65)",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-62ff31730f-60",
    "name": "飛燕脚",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "キック",
        "min": 60.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "100",
    "delay": "1000",
    "description": "素早い飛び膝蹴りで対象を蹴り上げる\n発動に必要なBuff : 荒くれ者 マスタリー or 酔拳士 マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210928",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-63d62c9b64-70-70",
    "name": "イクスティングイッシュ スラスト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 70.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "120",
    "delay": "1380",
    "description": "連続突きでダメージを与えて、対象の有益なBUFFを最大3つまで消し去る",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "NPC1.2\nPC1.0",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-524c92853d-70",
    "name": "インファリブル スロウ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "投げ",
        "min": 70.0
      }
    ],
    "successSkill": "投げ",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "110",
    "delay": "1380",
    "description": "3連続で対象に向かって魔力を帯びた投擲武器を投げつけ、障害物で遮られても必ず当てることが出来る技\n※シールドガード等の技によって防ぐことは可能\n発動に必要なBuff : アサシン マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n161115\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-bf4c376049-70-70",
    "name": "エンハンスド ブレイカー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "精神力",
        "min": 70.0
      },
      {
        "skill": "強化魔法",
        "min": 70.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "160",
    "delay": "1140",
    "description": "魔力の50％を攻撃力に上乗せして強力な一撃を放つ\nHit時に魔法の詠唱を中断させる",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出211012",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.1",
    "move": ""
  },
  {
    "id": "tech-535536ea23-64ee1463e7-70",
    "name": "ギャラクシー ダイナマイト キック",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "キック",
        "min": 70.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "325",
    "delay": "1225",
    "description": "世界の法則を無視するかの如く繰り出される\n移動可能な強烈ドロップキック\nヒット後は、アピールしないと気持ちが収まらない\n発動に必要なBuff : 荒くれ者 マスタリー",
    "transfer": "",
    "acquisition": "ダイアロス チャンピオン\n謎の覆面レスラー\n複製\n(※品)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "？",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-7ddd8c8355-70",
    "name": "グレネード ブラスト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 70.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "250",
    "delay": "1800",
    "description": "ハンド グレネードを投げつける\n※爆発に巻き込まれ 自らもダメージを受ける\n発動に必要なBuff:傭兵マスタリー",
    "transfer": "○",
    "acquisition": "錬金-第8弾\nソレスの箱 Lv2",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-36a9568b86-90-70",
    "name": "グレネード弾",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 90.0
      },
      {
        "skill": "罠",
        "min": 70.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "155",
    "delay": "1500",
    "description": "対象に直撃するとその周囲を巻き込み燃え上がる\n使用アイテム : グレート エクスプロード ポーション",
    "transfer": "○",
    "acquisition": "錬金-第3.5弾\n錬金-第6弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "(0.75+炎)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-1cc104f1fa-70-70",
    "name": "ゲイル スラスト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 70.0
      },
      {
        "skill": "強化魔法",
        "min": 70.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "125",
    "delay": "1200",
    "description": "疾風の如き速さで 無数の突きを繰りだす",
    "transfer": "○",
    "acquisition": "NPC販売(War奇跡)\n(※品)\n錬金-第4弾\n練金-第5.5弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "短評\n参照",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-425ceac473-70",
    "name": "スナイパー ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 70.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "190",
    "delay": "910",
    "description": "遥か遠くにいる対象を狙い撃つことができる\n攻撃を受けた者は詠唱を強制的に中断させられる\n発動に必要なBuff : 傭兵 マスタリー",
    "transfer": "○",
    "acquisition": "火竜神殿-宝箱\n錬金-第2弾\n錬金-第5弾\n練金-第5.5弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.2\n(1.0)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-4633801b6c-90-70",
    "name": "ソード オブ レガリア",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      },
      {
        "skill": "神秘魔法",
        "min": 70.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "200",
    "delay": "1500",
    "description": "魔法剣を召喚して対象に物理ダメージと属性ダメージを与える\n※火・水・風・地属性の中から最も高い属性の魔法剣を呼び出す\n（同数値の場合ランダム）",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210629\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": ""
  },
  {
    "id": "tech-535536ea23-b5fb6e5fab-80-70",
    "name": "チェンジ ロケーション",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "精神力",
        "min": 80.0
      },
      {
        "skill": "神秘魔法",
        "min": 70.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "60",
    "delay": "860",
    "description": "自分と対象の位置を入れ替える\n※PCは対象にできない\n※移動できないNPCには効果がない",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "-",
    "move": ""
  },
  {
    "id": "tech-535536ea23-6568bb3053-70",
    "name": "ディメンター ソウル",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "死の魔法",
        "min": 70.0
      }
    ],
    "successSkill": "死の魔法",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "200",
    "delay": "2000",
    "description": "周囲に物理ダメージを与えて、与えたダメージの25%分のマナを回復する\n発動に必要なBuff : ネクロマンサー マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n181211",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-15579d2772-70-70",
    "name": "デス ファング",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "牙",
        "min": 70.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "牙",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "110",
    "delay": "1010",
    "description": "首元に噛みつき 頸動脈を切断し持続的な出血ダメージを与える",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出241119",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.65+dotx6",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-24c257805b-80-70",
    "name": "バーニング サーブ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      },
      {
        "skill": "キック",
        "min": 70.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "230",
    "delay": "900",
    "description": "強烈なジャンプサーブで放つ炎の球が対象を狙い撃つ",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出250819",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-8ef5471fd6-70",
    "name": "ファイナル アルティメット ヒーロー ビーム",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 70.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "400",
    "delay": "1680",
    "description": "ピンチの時に使用できるヒーローの必殺技\n技を受ける者に避けてはいけない雰囲気を与える\n※最大HPが3割以下で発動可能\n発動に必要なBuff : コスプレイヤー マスタリー",
    "transfer": "○",
    "acquisition": "錬金-GENERATIONS\n錬金-第9弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-7b9d0adf30-70",
    "name": "フィニッシング エンド",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 70.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "350",
    "delay": "1800",
    "description": "後方にいる悪を打ち倒す\nトドメの大爆発\n※爆発には火薬が必要\n発動に必要なBuff : 荒くれ者 マスタリー\n使用アイテム : エクスプロード ポーション",
    "transfer": "",
    "acquisition": "ダイアロス チャンピオン\n謎の覆面レスラー\n複製\n(※品)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "パフォ\n依存",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-ce9b18390c-70",
    "name": "フィニッシング エンド スパーク",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 70.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "350",
    "delay": "1800",
    "description": "後方にいる悪を打ち倒す\nトドメの大爆発\n※爆発には火薬が必要\n発動に必要なBuff : コスプレイヤー マスタリー\n使用アイテム : エクスプロード ポーション",
    "transfer": "",
    "acquisition": "ダイアロス チャンピオン\nバーサーカー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "パフォ\n依存",
    "move": ""
  },
  {
    "id": "tech-535536ea23-b017be01dc-70-70",
    "name": "フォービドゥン・バロール・ビュー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 70.0
      },
      {
        "skill": "牙",
        "min": 70.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "180",
    "delay": "1200",
    "description": "視界に映った敵の時間を止めるバロールの魔眼",
    "transfer": "○",
    "acquisition": "もえガチャ\n(D×Dコラボ)\n初出230221",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "-",
    "move": ""
  },
  {
    "id": "tech-535536ea23-dcc79011be-70",
    "name": "フライング ボディプレス",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 70.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "160",
    "delay": "1200",
    "description": "空高く飛び上がり対象に自身の体を浴びせる技\n発動に必要なBuff : 荒くれ者 マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出190416",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.25",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-d8b3f844f6-80-70",
    "name": "ブレイク ダンス",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 80.0
      },
      {
        "skill": "持久力",
        "min": 70.0
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "480",
    "delay": "1200",
    "description": "高度な技術と身体能力が必要なストリートダンス\nウィンドミルからのヘッドスピンにより周囲の敵を蹴散らす",
    "transfer": "○",
    "acquisition": "もえガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "ダンス\n依存",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-4fdb1b9ccd-70-70",
    "name": "ヘビー クラッシュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 70.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "180",
    "delay": "1200",
    "description": "重量を生かした強烈な一撃\n※武器の重さでダメージ倍率が変動します",
    "transfer": "○",
    "acquisition": "錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "短評\n参照",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-aca29380b2-70-70",
    "name": "ポイズン バイト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "牙",
        "min": 70.0
      },
      {
        "skill": "死の魔法",
        "min": 70.0
      }
    ],
    "successSkill": "牙",
    "successRequired": 70.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "1300",
    "description": "対象の体内に直接毒を注入する",
    "transfer": "○",
    "acquisition": "キング ファンガス\nバード イーター\n錬金-第1弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.5\n+毒",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-41a1f916d3-90-70",
    "name": "メテオ ドライブ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 90.0
      },
      {
        "skill": "神秘魔法",
        "min": 70.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "200",
    "delay": "1600",
    "description": "狙いを定めた対象に誘導した小型の隕石を落とす技",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出200303",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.1+1\n(1.0+特殊)",
    "move": ""
  },
  {
    "id": "tech-535536ea23-da408a3731-70",
    "name": "ライトニング アロー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 70.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "180",
    "delay": "800",
    "description": "雷を纏ったガードを貫く光の矢を放つ技\n発動に必要なBuff :\n雷弩",
    "transfer": "○",
    "acquisition": "[生産]\n(前提装備)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-adebc8280e-70",
    "name": "ランタン ブレイド",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "盾",
        "min": 70.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "100",
    "delay": "900",
    "description": "盾についた剣で切り裂き、同時に盾に仕込まれたランタンの明かりで目つぶしの効果を与える\n発動に必要なBuff : ランタン シールド\n*1",
    "transfer": "",
    "acquisition": "もえガチャ\n160202",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-929d058984-90-70",
    "name": "リル・ラファーガ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 90.0
      },
      {
        "skill": "自然調和",
        "min": 70.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "風を身に纏い、神速の勢いで突進しながら放つ突き技\n※対NPCのみ使用可能",
    "transfer": "○",
    "acquisition": "『ダンまち?』コラボ\nもえガチャ\n初出240220",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.6+特殊",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-e19aaef651-70",
    "name": "ヴァンパイア ノクターン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "音楽",
        "min": 70.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "250",
    "delay": "1250",
    "description": "ヴァンパイアをイメージした幻想的な歌\n周囲の敵から生命力を吸い取る\n発動に必要なBuff : ブラッドバード マスタリー",
    "transfer": "○",
    "acquisition": "錬金-GENERATIONS\n錬金-第9弾\n錬金-Light\nゲオの箱 Lv2",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "短評\n参照",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-4973e60af0-70-80",
    "name": "大切断",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 70.0
      },
      {
        "skill": "筋力",
        "min": 80.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "140",
    "delay": "1350",
    "description": "大木を切り倒すような強力な一撃で敵を斬りつける",
    "transfer": "×",
    "acquisition": "宮殿(転生)報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.5",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-ba5052fe02-80-70",
    "name": "天翔閃",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "140",
    "delay": "1500",
    "description": "剣に聖なる光をまとわせて振り下ろすことで、聖なるエネルギーを斬撃として飛ばす技\n※悪魔に特攻効果",
    "transfer": "○",
    "acquisition": "『ありふれた職業で世界最強』\nコラボガチャ\n初出250507",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "NPC1.44\nPC1.2",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-49283cad37-70",
    "name": "弧月破斬",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 70.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "130",
    "delay": "1250",
    "description": "神速の居合から剣圧による斬撃を飛ばす\n発動に必要なBuff : サムライ マスタリー or\n神霊の加護",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出220927",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.2\n(対人1.0)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-d6e32414fc-70-70",
    "name": "殲廻蹴撃",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "キック",
        "min": 70.0
      },
      {
        "skill": "こんぼう",
        "min": 70.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "150",
    "delay": "1300",
    "description": "両手用のこんぼう武器を地面に突き立てて全身で回転し、周囲の敵を蹴散らす技\n※武器の攻撃力とキックのスキル値で威力が変化する\n※キック効果上昇アイテムの影響は受けない",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出201104",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "短評\n参照",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-5a0a8e6600-70",
    "name": "火遁の術",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "薬調合",
        "min": 70.0
      }
    ],
    "successSkill": "薬調合",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "180",
    "delay": "1080",
    "description": "口から巨大な火の玉を飛ばす忍術\n炎ダメージと火傷によるスリップダメージを与える\n発動に必要なBuff:アサシン マスタリー\n使用アイテム : グレート エクスプロード ポーション",
    "transfer": "○",
    "acquisition": "錬金-第7弾\n錬金-第8弾\n錬金-Light\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "？",
    "move": "？"
  },
  {
    "id": "tech-535536ea23-974861288b-90-70",
    "name": "焔の舞",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "130",
    "delay": "1200",
    "description": "全身に炎を纏った渾身の一撃で敵を焼き尽くす",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出220705",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "mob0.9+0.4*3\nPC0.8+0.35*3",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-ca5ea148e2-90-70",
    "name": "燕返し",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      },
      {
        "skill": "攻撃回避",
        "min": 70.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "190",
    "delay": "1500",
    "description": "水平斬りから素早く反転させて斬りつける技\n二太刀目は必中の一撃となる\n発動に必要なBuff : サムライ マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210420",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.0+1.3",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-d0db7336f3-90-70",
    "name": "牙斬",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      },
      {
        "skill": "精神力",
        "min": 70.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "170",
    "delay": "1000",
    "description": "左に持った武器で攻撃を弾き\n怯んだ相手に斬撃を与える二段攻撃\n発動に必要なBuff : サムライ マスタリー",
    "transfer": "○",
    "acquisition": "異国の剣士\n錬金-第1弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.5",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-a86687ec67-70-90",
    "name": "背水の一閃",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 70.0
      },
      {
        "skill": "生命力",
        "min": 90.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "160",
    "delay": "2000",
    "description": "HPが少ないほど威力が上昇する捨て身の一撃",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出220111",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-7e1d925de5-80-70",
    "name": "閃光裂破拳",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "100",
    "delay": "1000",
    "description": "光を纏った拳の一撃による衝撃波が、ガードを貫通して対象を吹き飛ばす",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210928\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "mob1.55\nPC1.3",
    "move": ""
  },
  {
    "id": "tech-535536ea23-26af82e121-70",
    "name": "雷光弾",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 70.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "140",
    "delay": "1200",
    "description": "ライトニング ブレイド の効果を込めて放つ魔弾\n発動に必要なBuff : ライトニング ブレイド",
    "transfer": "○",
    "acquisition": "錬金-第9弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-f452b7ff38-80",
    "name": "アサシネイト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 80.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "120",
    "delay": "2000",
    "description": "敵に気づかれずに背後から攻撃することで大ダメージを与える暗殺術\n背後以外から攻撃出来ない\n発動に必要なBuff : アサシン マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n160405",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "2.0\n(1.5)",
    "move": ""
  },
  {
    "id": "tech-535536ea23-682108848f-80-80",
    "name": "インバース トルネード",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "キック",
        "min": 80.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "1650",
    "description": "逆さになって開脚した状態で高速回転する技",
    "transfer": "○",
    "acquisition": "もえガチャ\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-7d8d85cedf-80-80",
    "name": "インファリブル ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 80.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "140",
    "delay": "1500",
    "description": "敵を捉えて狙い撃つことで確実に当てることができる技\n※狙いが外れていた（ミスザマーク）場合は当たらない",
    "transfer": "×",
    "acquisition": "黒の廟堂\n170321",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.5",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-600b7388b8-90-80",
    "name": "インフィニティ ラッシュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "キック",
        "min": 90.0
      },
      {
        "skill": "筋力",
        "min": 80.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "200",
    "delay": "1700",
    "description": "前方の敵に対して無数の蹴りを高速で繰り出す技\n※最大で5HITする",
    "transfer": "○",
    "acquisition": "もえガチャ\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "-",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-f23c2a5e33-80-80-80-80-80",
    "name": "オーシャン ストリーム",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "水泳",
        "min": 80.0
      },
      {
        "skill": "槍",
        "min": 80.0
      },
      {
        "skill": "料理",
        "min": 80.0
      },
      {
        "skill": "釣り",
        "min": 80.0
      },
      {
        "skill": "取引",
        "min": 80.0
      }
    ],
    "successSkill": "水泳",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "水が無いところでも大量の水を生成し、水流で全てを洗い流す",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "水泳依存?",
    "move": ""
  },
  {
    "id": "tech-535536ea23-6de5db24bc-80",
    "name": "オーラ ナックル",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "140",
    "delay": "1200",
    "description": "気を拳に集中させて威力を高めた一撃を放つ\n※ダメージ反射効果を無効化してダメージを与える\n※シールド ガードを貫通することはできない\n発動に必要なBuff : 酔拳士 マスタリー or 荒くれ者 マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n180123\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "短評\n参照",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-c12c19ed41-80-80",
    "name": "クレイジー フォールダウン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 80.0
      },
      {
        "skill": "強化魔法",
        "min": 80.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "131",
    "delay": "1100",
    "description": "対象を空高く打ち上げ垂直に落下させる\n殴られた挙句足の骨も折れて二度痛い",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出241119",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "NPC1.2\nPC1.0+落下",
    "move": ""
  },
  {
    "id": "tech-535536ea23-f7f3f5fdc4-80",
    "name": "グラウンド・ゼロ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 80.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "200",
    "delay": "1600",
    "description": "自らが爆弾となり、上空から落下して周囲を大爆発に巻き込む\n発動に必要なBuff : 爆弾男 マスタリー",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-25b579076d-80-80",
    "name": "グランド インパクト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      },
      {
        "skill": "筋力",
        "min": 80.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "200",
    "delay": "1800",
    "description": "力を込めた一撃が地面を伝わって広がり周囲にいる敵にダメージを与える",
    "transfer": "○",
    "acquisition": "もえガチャ\n180501",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "短評\n参照",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-a3e2613b08-80-80",
    "name": "ゲイル シュート",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "キック",
        "min": 80.0
      },
      {
        "skill": "筋力",
        "min": 80.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "80\n(30-35)",
    "delay": "950",
    "description": "高速で繰り出された蹴りから生じた 真空の刃が敵を襲う\n反動で自らもダメージを受ける",
    "transfer": "○",
    "acquisition": "NPC販売(War奇跡)\n(※品)\n錬金-第5弾\n錬金-第6弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "-",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-470b8b552c-80-80",
    "name": "コンビネーション ラッシュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      },
      {
        "skill": "攻撃回避",
        "min": 80.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 39.0
    },
    "castTime": "140",
    "delay": "1300",
    "description": "隙の少ない連打で確実に対象へダメージを与える",
    "transfer": "○",
    "acquisition": "サマーラッキーバッグ2018\n180731",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.2",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-8a63daf40a-80",
    "name": "ゴッド ハンマー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 80.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "1350",
    "description": "悪を滅する神の鉄槌 アンデッド系には大ダメージを与える\n発動に必要なBuff : テンプルナイト マスタリー",
    "transfer": "",
    "acquisition": "錬金の箱\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.4\n対ｱﾝﾃﾞｯﾄ3.0",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-5fac2e143f-80",
    "name": "ショルダー チャージ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "盾",
        "min": 80.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "1200",
    "description": "防御力が高いほどに対象に大ダメージを与えることができる\n発動に必要なBuff : ブレイブナイト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210914",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "AC*0.65",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-b7eccf75a1-80-80",
    "name": "スパイダー ネット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "罠",
        "min": 80.0
      },
      {
        "skill": "暗黒命令",
        "min": 80.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "170",
    "delay": "1370",
    "description": "蜘蛛の糸を撃ちだし 絡めて動きを鈍らせる\n使用アイテム : スパイダー シルク１",
    "transfer": "○",
    "acquisition": "錬金-第8弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "？",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-f83c5c1f8d-80-80-80",
    "name": "セット マイン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "罠",
        "min": 80.0
      },
      {
        "skill": "薬調合",
        "min": 80.0
      },
      {
        "skill": "呪文抵抗力",
        "min": 80.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "100",
    "delay": "2000",
    "description": "地雷を設置することができる\n使用アイテム : グレート エクスプロード ポーション",
    "transfer": "○",
    "acquisition": "錬金-第4弾\n練金-第5.5弾\n練金-第7弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "?",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-e4271834a5-80",
    "name": "ツイン ショット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 80.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "140",
    "delay": "900",
    "description": "ガンファイター ハンドガン(片手銃)を装備時のみ発動可能・両手装備時は2連攻撃となる\n※（アイテムショップ）課金アイテムなので複合に記載。",
    "transfer": "",
    "acquisition": "アイテムショップ[100SP]",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-36c32ff2c7-80",
    "name": "ハードネス ストライク",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 80.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "135",
    "delay": "1300",
    "description": "防御力が高いほど対象にダメージを与える一撃\n発動に必要なBuff : ブレイブナイト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出220614",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-8d1d2ba470-80-80",
    "name": "バリアント ブロウ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 80.0
      },
      {
        "skill": "生命力",
        "min": 80.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "140",
    "delay": "1800",
    "description": "ピンチになるほど威力が上昇する逆転の一撃\nHPが50％以下で発動できる\n※確率でクリティカルの効果が発生する",
    "transfer": "○",
    "acquisition": "もえガチャ\n(ゴブスレコラボ)\n初出220719",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-f8bc6cde57-80-80-80",
    "name": "パリィ カウンター",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 80.0
      },
      {
        "skill": "攻撃回避",
        "min": 80.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "95",
    "delay": "1300",
    "description": "敵の攻撃を槍で受け流して反撃する",
    "transfer": "○",
    "acquisition": "錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.75",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-2c9567d8f4-80",
    "name": "ブレイン ブレイカー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 80.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "高速で無数の突きを繰り出し、対象のMPを削り取る\n発動に必要なBuff : デュエリスト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n181120",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-bac17bbf90-80-80",
    "name": "ライジング スラッシュ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 80.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "140",
    "delay": "1250",
    "description": "下から上へ垂直に飛び上がりながら斬りつける剣技",
    "transfer": "○",
    "acquisition": "錬金の箱\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.56(1.3)",
    "move": ""
  },
  {
    "id": "tech-535536ea23-84e9da659c-80-80",
    "name": "ローリング ラリアット",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      },
      {
        "skill": "キック",
        "min": 80.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "120",
    "delay": "1200",
    "description": "軸足を中心に独楽のように回転しながら相手の首元にラリアットを決める",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出190429",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.7*3",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-2ec7acc559-80",
    "name": "ヴフト シュトース",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "盾",
        "min": 80.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "170",
    "delay": "900",
    "description": "対象の攻撃を受け流して 所持している武器で鋭く突き刺す\n発動に必要なBuff : ヴァイス",
    "transfer": "",
    "acquisition": "アイテムショップ\n（500SP）",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "?",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-b50e2c58fb-80",
    "name": "乱れ桜",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 80.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "300",
    "delay": "1200",
    "description": "桜吹雪の幻影と共に 一瞬で敵の周囲を切りつける美技\n発動に必要なBuff:サムライ マスタリー",
    "transfer": "○",
    "acquisition": "錬金-第7弾(褒章)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "(0.9)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-35f784846b-80-80",
    "name": "剛射",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 80.0
      },
      {
        "skill": "筋力",
        "min": 80.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "160",
    "delay": "1200",
    "description": "少し射程が短くなるが、力を込めた一撃で対象の防御力を無視して大ダメージを与える",
    "transfer": "○",
    "acquisition": "『ゴブリンスレイヤー』 コラボ\nもえガチャ\n初出220726",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-738b42cd58-80-80",
    "name": "功夫乱舞",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "素手",
        "min": 80.0
      },
      {
        "skill": "キック",
        "min": 80.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 80.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "280",
    "delay": "1500",
    "description": "拳と蹴りによる華麗な舞で周囲の敵を蹴散らす連撃",
    "transfer": "○",
    "acquisition": "もえガチャ\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-19dffacb81-80",
    "name": "炎遁の術",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "薬調合",
        "min": 80.0
      }
    ],
    "successSkill": "薬調合",
    "successRequired": 80.0,
    "cost": {
      "st": 39.0
    },
    "castTime": "180",
    "delay": "1680",
    "description": "口から巨大な炎の塊を飛ばす忍術\n対象に火属性の魔法ダメージを与える\n発動に必要なBuff : アサシン マスタリー と 秘奥義\n使用アイテム : グレート エクスプロード ポーション 1",
    "transfer": "",
    "acquisition": "もえガチャ\n171107",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-b83976f7d1-80",
    "name": "練気弾",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 80.0
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 80.0,
    "cost": {
      "st": 100.0
    },
    "castTime": "250",
    "delay": "1650",
    "description": "生命エネルギーを溜めて放つ\nスタミナ消費は激しいが 無属性の魔法ダメージを与えることができる\n発動に必要なBuff : 酔拳士 マスタリー",
    "transfer": "○",
    "acquisition": "錬金-第8弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "酩酊\n依存？",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-f61795ae56-80-80",
    "name": "魔槍烈破",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 80.0
      },
      {
        "skill": "強化魔法",
        "min": 80.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "1200",
    "description": "闘気に魔力を乗せて放つ槍の秘技\n※魔力が高いほどダメージが増加する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出220510",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-a92075c285-90",
    "name": "アルゴ・ウエスタ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "300",
    "delay": "2000",
    "description": "聖火の英斬\n魔力の伝導率が高いヘスティア・ナイフにファイアボルトを纏わせ、拡散してしまう前に【英雄願望】を使い、斬撃と魔力の両方を『二重収束』して放つ必殺技\n発動に必要なBuff :\nヘスティア・ナイフ",
    "transfer": "",
    "acquisition": "『ダンまち?』コラボ\nダンまちイベント交換\n(前提装備)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-619a2da663-90",
    "name": "アロー レイン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "弓",
        "min": 90.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "330",
    "delay": "1100",
    "description": "上空に矢を放ち 無数の矢を雨のように降らす\n発動に必要なBuff:フォレスター マスタリー",
    "transfer": "○",
    "acquisition": "錬金-第7弾\n錬金-GENERATIONS",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "？",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-59486f182b-90-90",
    "name": "アンガー スウィープ",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 90.0
      },
      {
        "skill": "戦闘技術",
        "min": 90.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "200",
    "delay": "1800",
    "description": "怒りにまかせて前方の敵に対して薙ぎ払うように銃を連射する\n※発動には弾が最大5発必要\n※狙いを定めないため、攻撃中は命中率が低下する",
    "transfer": "○",
    "acquisition": "もえガチャ\n181204",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.6*5",
    "move": "△"
  },
  {
    "id": "tech-535536ea23-ce5e745cc2-90-90",
    "name": "インフィニット スラスト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 90.0
      },
      {
        "skill": "攻撃回避",
        "min": 90.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "200",
    "delay": "1350",
    "description": "目にも留まらぬ高速の連続突きで敵を翻弄する\n※片手槍でのみ発動出来る",
    "transfer": "",
    "acquisition": "もえガチャ\n160202\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.3*5+α",
    "move": ""
  },
  {
    "id": "tech-535536ea23-fc111c8e83-90",
    "name": "インフィニティ ブレイド",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "180",
    "delay": "1800",
    "description": "無数の剣を召喚して前方に発射する技\n発動に必要なBuff :\nサモンズ ソード",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出240611",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.7x6",
    "move": "×(△)"
  },
  {
    "id": "tech-535536ea23-9ae418d889-90-90",
    "name": "ウォーター ストリーム",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 90.0
      },
      {
        "skill": "水泳",
        "min": 90.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "170",
    "delay": "1100",
    "description": "水を操り 敵を押し流す\n発動に必要なBuff : 海戦士 マスタリー",
    "transfer": "○",
    "acquisition": "錬金-第4弾(特殊)\n練金-第5.5弾\n錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-7385a8bf4e-90",
    "name": "エアリアル ボミング",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "罠",
        "min": 90.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "300",
    "delay": "2100",
    "description": "空中飛び上がり、自ら爆弾となって地上のターゲットにピンポイント爆撃を行う\n※巻き込んだ対象の数だけ最大HPの10％分(最大40)ダメージを受ける\n発動に必要なBuff : 爆弾男 マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出260127",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "罠\n依存",
    "move": "○"
  },
  {
    "id": "tech-535536ea23-1b0fe29aee-90-90",
    "name": "タイム ボム",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "罠",
        "min": 90.0
      },
      {
        "skill": "薬調合",
        "min": 90.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "125",
    "delay": "1300",
    "description": "時限式の爆弾を対象に設置する\n制限時間内に解除できなければ大ダメージを受ける",
    "transfer": "○",
    "acquisition": "火竜神殿-宝箱\n錬金-第3.5弾\n錬金-第5弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "-",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-612d9e0aca-90-90-90",
    "name": "ハルマゲドン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 90.0
      },
      {
        "skill": "筋力",
        "min": 90.0
      },
      {
        "skill": "精神力",
        "min": 90.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 90.0,
    "cost": {
      "st": 150.0
    },
    "castTime": "200",
    "delay": "2000",
    "description": "世界に終末を告げる最後の天災\n有益なbuffを消し去り、防御を無視して大ダメージを与える",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出241119",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.5",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-561facd8cd-90-90",
    "name": "パワー インパクト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 90.0
      },
      {
        "skill": "筋力",
        "min": 90.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "195",
    "delay": "1300",
    "description": "渾身の力で振り下ろし大地ごと周囲の敵を打ち砕く",
    "transfer": "○",
    "acquisition": "NPC販売(War奇跡)\n(※品)\n錬金-第4弾\n練金-第5.5弾\n錬金-第6弾\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.35\n(1.2)",
    "move": "△"
  },
  {
    "id": "tech-535536ea23-fa0f86f2ef-90-40",
    "name": "フルスウィング",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 90.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "240",
    "delay": "1500",
    "description": "構えた武器を渾身の力で振りぬき吹き飛ばす。",
    "transfer": "×",
    "acquisition": "黒の廟堂",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.15",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-8b785eb4e3-90",
    "name": "ボンバー エクスプロージョン",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "罠",
        "min": 90.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "400",
    "delay": "1500",
    "description": "自分の周りにいる敵を巻き込んで自爆する\n発動に必要なBuff : 爆弾男 マスタリー",
    "transfer": "○",
    "acquisition": "複製\n錬金-第1弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "?",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-d675c4e01c-90-90",
    "name": "ムーンサルト ブレイカー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 90.0
      },
      {
        "skill": "戦闘技術",
        "min": 90.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "1350",
    "description": "上空から回転の力を加えた強烈な一撃を対象の脳天めがけて打ち下ろす\n※発動するには両手武器が必要",
    "transfer": "○",
    "acquisition": "もえガチャ\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.6",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-4784cdf32c-90-90-90",
    "name": "リープ スラスト",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "槍",
        "min": 90.0
      },
      {
        "skill": "強化魔法",
        "min": 90.0
      },
      {
        "skill": "攻撃回避",
        "min": 90.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "脚力を強化し、槍を構えて爆発的な加速力で前方に超低空での跳躍・突進する。\nテクニック発動から跳躍までの間にため時間が発生する。\n移動発動不可。\n既定の距離を一気に跳躍しているのでぶつからないと途中で止まれない",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出240820",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "NPC1.0\n対人0.9",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-3249fceaf3-90-90",
    "name": "双棍乱舞",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 90.0
      },
      {
        "skill": "戦闘技術",
        "min": 90.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "500",
    "delay": "1600",
    "description": "左右の棍棒から繰りだす連続攻撃\n※全ての攻撃を発動させるには左右に片手棍棒を装備している必要があります。",
    "transfer": "○",
    "acquisition": "もえガチャ\n151124",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-43e4d56f79-90",
    "name": "双魔連斬",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "筋力",
        "min": 90.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "180",
    "delay": "1500",
    "description": "双剣で回転しながら直線上を斬りつける\n※発動には近接武器を装備する必要がある\n発動に必要なBuff :\n双魔剣",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230418",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.7+0.5*3",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-5f92c37721-90",
    "name": "回転斬り",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "160",
    "delay": "1300",
    "description": "リヴァイが得意とする高速回転切り。\n※空中で発動可能\n※限定課金アイテムなので複合に記載。",
    "transfer": "○",
    "acquisition": "『 進撃の巨人 』コラボ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.7+0.5*3",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-a1ab125138-90",
    "name": "多連装ロケットランチャー",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "銃器",
        "min": 90.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "350",
    "delay": "2000",
    "description": "最大6連発が可能なロケットランチャー\n発動に必要なBuff :\nオルカン",
    "transfer": "",
    "acquisition": "『ありふれた職業で世界最強』\nコラボガチャ(前提装備)\n初出250422",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.8×6",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-a55b22be40-90",
    "name": "大震撃",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 90.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "180",
    "delay": "1500",
    "description": "大地を強く叩いた振動で周囲に地属性ダメージを与える\n発動に必要なBuff :\n戦闘データ <ミノタウロス>",
    "transfer": "×",
    "acquisition": "クエスト(ひっとの戦闘訓練)\nポイント報酬(前提装備)\n230523実装",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "特殊",
    "move": ""
  },
  {
    "id": "tech-535536ea23-6d9b120e56-90-90",
    "name": "天吊地縛",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "投げ",
        "min": 90.0
      },
      {
        "skill": "落下耐性",
        "min": 90.0
      }
    ],
    "successSkill": "投げ",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "210",
    "delay": "4000",
    "description": "弦を投げつけ飛び上がり、首をくくって釣り上げる。\n同時、影を射止め固定し弦を引き締める。\n天に吊り、地で縛り、命を絞る。\n※拘束を解除されると大きな隙を晒すことになる。\n発動に必要なBuff : アサシン マスタリー &\n忍 マスタリー\n(いずれか1つではなく2つ全て必要)\n使用アイテム : 弦",
    "transfer": "",
    "acquisition": "クエスト報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "",
    "move": ""
  },
  {
    "id": "tech-535536ea23-f6a8bd416e-90",
    "name": "天輪・繚乱の剣",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "220",
    "delay": "1500",
    "description": "すれ違い様に、無数の刃が対象を連続で切り裂く\n※発動には左右に刀剣武器を装備する必要がある\n発動に必要なBuff : ウォーリア― マスタリー or サムライ マスタリー\nor 騎士(ザ・ナイト)",
    "transfer": "○",
    "acquisition": "『 FAIRY TAIL 』コラボ\nもえガチャ\n初出190212",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.2+0.2*6\n(0.6+0.1*6)",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-18872b9b3a-90",
    "name": "居合斬り",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "180",
    "delay": "1500",
    "description": "異国の剣士が編み出した秘奥義の一つ。対象の装甲を貫く目にも止まらぬ音速の一撃。\n発動に必要なBuff : サムライ マスタリー",
    "transfer": "×",
    "acquisition": "黒の廟堂",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.2",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-044db8f4e9-90",
    "name": "旋風斬",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "120",
    "delay": "1500",
    "description": "体を高速で回転させながら周囲を斬り刻む剣技\n発動に必要なBuff :\n戦闘データ <魔神ヘルミナ>",
    "transfer": "×",
    "acquisition": "クエスト(ひっとの戦闘訓練)\nポイント報酬(前提装備)\n230523実装",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "0.9+0.4x4",
    "move": ""
  },
  {
    "id": "tech-535536ea23-1aba381764-90",
    "name": "桜花一閃",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "桜吹雪と共に一閃を放ち、舞い散る花びらが対象の視界を奪う\n発動に必要なBuff : サムライ マスタリー or\n桜花爛漫",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出200324",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "1.3",
    "move": "×"
  },
  {
    "id": "tech-535536ea23-a504806ca1-90-90",
    "name": "真・剣聖乱舞",
    "kind": "テクニック",
    "category": "複合技/攻撃",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      },
      {
        "skill": "戦闘技術",
        "min": 90.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "530",
    "delay": "1100",
    "description": "刀剣攻撃の奥義\n相手に素早い剣撃を浴びせかけ 上空からの攻撃で止めを刺す\n途中で空振りすると 攻撃は止まってしまう",
    "transfer": "○",
    "acquisition": "錬金-第6弾\n宮殿(賢王)報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%B9%B6%B7%E2",
    "power": "短評\n参照",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-3fe44182ea-0",
    "name": "錬金マイスター",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "生命力",
        "min": 0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 0,
    "cost": {
      "st": 0.0
    },
    "castTime": "20",
    "delay": "20",
    "description": "錬金を極めた者の証\n最大HP+20、所持可能重量+20の効果を得る",
    "transfer": "",
    "acquisition": "錬金の箱\n200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5"
  },
  {
    "id": "tech-2bc32507eb-n-1",
    "name": "N-ブースト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "0",
    "delay": "900",
    "description": "マナを推進力に変換して15秒間、爆発的な加速を得る\n発動に必要なBuff:\n近未来二輪",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出251209",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-9635eff176-1",
    "name": "こいのぼり",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "取引",
        "min": 1.0
      }
    ],
    "successSkill": "取引",
    "successRequired": 1.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "こいのぼりを立てる",
    "transfer": "○",
    "acquisition": "もえがちゃ\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-78ea103d41-1",
    "name": "アシミレイト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "物まね",
        "min": 1.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "150",
    "delay": "1750",
    "description": "背景と同化して敵に気付かれにくくなる\n発動に必要なBuff : カメレオン アイ",
    "transfer": "",
    "acquisition": "もえガチャ\n初出190115",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-290c0f0edb-1",
    "name": "アトラクション フォース",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "素手",
        "min": 1.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 1.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "200",
    "delay": "1000",
    "description": "対象に磁性を与えて左手の磁力で引き寄せる\n発動に必要なBuff :\n磁力操作",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出210518",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-2-1",
    "name": "ウォーター バズーカ 2",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "120",
    "delay": "480",
    "description": "水鉄砲の水を勢い良く味方に向かって飛ばす専用技\n※水に濡れることで火属性ダメージを一時的に軽減する\n発動に必要なBuff : ウォーター チャージ",
    "transfer": "",
    "acquisition": "もえガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-8b22b6d0af-1",
    "name": "エンジェル フォール",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "0",
    "delay": "1500",
    "description": "不思議な魔石の力でゆっくりと浮遊しながら落下することができる\n※効果中に地面に届かない場合はダメージを受ける\n発動に必要なBuff : 魔石の力",
    "transfer": "",
    "acquisition": "もえガチャ\n初出190507",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-afb593ab35-1",
    "name": "オンステージ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "薬調合",
        "min": 1.0
      }
    ],
    "successSkill": "薬調合",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "100",
    "delay": "4100",
    "description": "頭上にミラーボールを設置する\n使用アイテム : グレート ライト ポーション\n※周囲のPCへの負荷が非常に大きいため、使用環境によってはゲーム進行に支障をきたす。",
    "transfer": "",
    "acquisition": "錬金-第6弾(特殊)\n錬金-GENERATIONS",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-f3f332608a-1",
    "name": "オーグメンター",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "0",
    "delay": "600",
    "description": "ジェットエンジンの排気に対して燃料を吹きつけて推進力を得る\n※空中で発動可能、地面接地で解除\n発動に必要なBuff :\nジェットパック",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230131",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-d0fa3e6e48-1",
    "name": "クール・ド・ショコラ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "料理",
        "min": 1.0
      }
    ],
    "successSkill": "料理",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "250",
    "delay": "2250",
    "description": "ショコラティエ自慢の一品をふるまう\n様々なステータスが少しずつ上昇する\n※効果量は料理スキルに依存する\n発動に必要なBuff :\nスペシャリテ",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出250311",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-d8505fef69-1",
    "name": "グライディング",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 1.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "0",
    "delay": "1200",
    "description": "ハンググライダーを利用して大空を滑空することが出来る\n※空中で発動可能、着地で効果が解除される\n※WarAgeでは効果が無い\n発動に必要なBuff : ハンググライダー",
    "transfer": "",
    "acquisition": "もえガチャ\n180925",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-7269b45512-1",
    "name": "グライディング フライト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 1.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "60",
    "delay": "1260",
    "description": "ムササビ スーツの飛膜を広げてグライダーのように滑空することができる\n※空中で発動可能\n※地面に接地すると効果が切れます。\n発動に必要なBuff : ムササビ モード or 翼竜の飛翔",
    "transfer": "",
    "acquisition": "",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-2a238d930b-1",
    "name": "コントロール バーナー",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 1.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "0",
    "delay": "400",
    "description": "バーナーの火力を上げて熱気球の硬度を上げる\n※テクニック発動時に落下位置が変更されます。\n発動に必要なBuff : 熱気球",
    "transfer": "",
    "acquisition": "もえガチャ\n171121",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-87cd10a6f1-1",
    "name": "コンフェッティ バースト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "銃器",
        "min": 1.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "クラッカーを上空に向けて撃ち、花吹雪を撒き散らす\n発動に必要なBuff :\nクラッカー",
    "transfer": "",
    "acquisition": "課金者プレゼント(前提装備)\n230620〜230627",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-58f231d84a-1",
    "name": "サイクロン バキューム",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "素手",
        "min": 1.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "1550",
    "description": "サイクロン バスターで前方にある全ての物を吸い込む\n発動に必要なBuff : お掃除モード",
    "transfer": "",
    "acquisition": "錬金-第9弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-64b3eb0fd9-1",
    "name": "シャックル スリンガー",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "170",
    "delay": "1170",
    "description": "敵に紐付きの手錠を投げつけて、捕縛して引き寄せる\n発動に必要なBuff :\n逮捕術",
    "transfer": "",
    "acquisition": "(前提装備)\n2025年秋の宝探し\n251125〜251209",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-2402c3920c-1",
    "name": "ジェット スラスター",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "キック",
        "min": 1.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 1.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "0",
    "delay": "600",
    "description": "足に仕込まれたノアストーンから爆発的な推進力を得て大ジャンプが可能になる\n発動に必要なBuff :\n仕込み靴\nor\n重力操作",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出210518",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-a29e54f3cd-1",
    "name": "ジェット ブースター",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "持久力",
        "min": 1.0
      }
    ],
    "successSkill": "持久力",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "0",
    "delay": "900",
    "description": "マナを消費してジェット噴射で爆走する\n※WarAgeでは効果がない\n発動に必要なBuff :\n大型二輪",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230704",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-1c8667f7ae-1",
    "name": "ディグホール",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "採掘",
        "min": 1.0
      }
    ],
    "successSkill": "採掘",
    "successRequired": 1.0,
    "cost": {
      "st": 10.0
    },
    "castTime": "0",
    "delay": "800",
    "description": "地面に穴を掘って地中を進むことができる\n※移動速度は低下するが、敵に襲われにくくなる\n※行動やジャンプで解除される\n発動に必要なBuff :\n穴掘り名人",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出201110",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-52285a1870-1",
    "name": "ドラゴン フォース",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "生命力",
        "min": 1.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 1.0,
    "cost": {
      "st": 50.0
    },
    "castTime": "150",
    "delay": "3150",
    "description": "漆黒の竜に変身して攻撃力と防御力と牙スキルの威力が上昇して、回避が低下する\n発動に必要なBuff : 竜化の秘法",
    "transfer": "×",
    "acquisition": "竜眼の指輪\n(もえガチャ\n初出190611)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-013efac2ce-1-1",
    "name": "バトル オーラ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 1.0
      },
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "180",
    "delay": "1180",
    "description": "全身から闘気を解放して相手を威嚇する\n気持ちが高まって戦闘力がほんの少し上昇する",
    "transfer": "○",
    "acquisition": "もえがちゃ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-60e89a18d3-1",
    "name": "ピュア ホワイト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 1.0
      }
    ],
    "successSkill": "回復魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "150",
    "delay": "1050",
    "description": "浄化の光が周囲を包み 負の効果を１つ打ち消す\n発動に必要なBuff :\n白百合の加護",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出210706",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-c1c2c45701-1",
    "name": "ファルコン グライディング",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 1.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "1350",
    "description": "大空へ向かって羽ばたき、空中を滑空するように移動する\n※WarAgeでは効果が無い\n発動に必要なBuff : 鳥になりたい",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出191029",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-ab3970a5ee-1",
    "name": "フェンリル フォース",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "牙",
        "min": 1.0
      }
    ],
    "successSkill": "牙",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "巨狼フェンリルに変身して、攻撃力、移動速度、牙スキルの威力と命中が上昇する\n※WarAgeでは効果がない\n発動に必要なBuff :\n魔法の枷",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出220322",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-0f6ca61406-1",
    "name": "フル スロットル",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "0",
    "delay": "1200",
    "description": "アクセル全開でぶっ飛ばす！！\nマナを消費して一時的に移動速度を大幅に上昇させることができる\n※WarAgeでは効果が無い\n発動に必要なBuff :\nドライビング\nor\nレッドゾーン",
    "transfer": "",
    "acquisition": "もえガチャ（福袋）\n161220",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-04f883982a-1",
    "name": "フレグランス ストーム",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "美容",
        "min": 1.0
      }
    ],
    "successSkill": "美容",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "200",
    "delay": "5400",
    "description": "周囲にフレグランスを撒き、浴びたものの汚れ具合を少し回復する\n※美容スキルが高いとディレイが短くなる\n発動に必要なBuff :\nフレグランス",
    "transfer": "",
    "acquisition": "公式イベント\n(前提装備)\n220222〜220308",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-75123ea686-1",
    "name": "ブラックマジック エンハンス",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "召喚魔法",
        "min": 1.0
      }
    ],
    "successSkill": "召喚魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "130",
    "delay": "1150",
    "description": "召喚したペットの攻撃力と魔力が上昇するが、代償にダメージが増加する\n※スキルが足りなくても発動可能、召喚魔法スキルで効果量が上昇する\n発動に必要なBuff :\n黒魔術の書",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出220426",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-5824cebd56-1",
    "name": "ペイント カラー(緑)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "500",
    "description": "一定時間で消える特殊なインクで地面を緑に塗りつぶす\n※ 座る事で解除が可能\n発動に必要なBuff :\nペインター\n使用アイテム : カラー インク",
    "transfer": "×",
    "acquisition": "第十五回\nデザコン参加賞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-50d382f617-1",
    "name": "ペイント カラー(赤)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "500",
    "description": "一定時間で消える特殊なインクで地面を赤くに塗りつぶす\n※ 座る事で解除が可能\n発動に必要なBuff :\nペインター\n使用アイテム : カラー インク",
    "transfer": "×",
    "acquisition": "第十五回\nデザコン参加賞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-dfca9efddc-1",
    "name": "ペイント カラー(青)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "500",
    "description": "一定時間で消える特殊なインクで地面を青くに塗りつぶす\n※ 座る事で解除が可能\n発動に必要なBuff :\nペインター\n使用アイテム : カラー インク",
    "transfer": "×",
    "acquisition": "第十五回\nデザコン参加賞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-7903e29df3-1",
    "name": "ペイント カラー(黒)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "500",
    "description": "一定時間で消える特殊なインクで地面を真っ黒に塗りつぶす\n※ 座る事で解除が可能\n発動に必要なBuff :\nペインター\n使用アイテム : カラー インク",
    "transfer": "×",
    "acquisition": "第十五回\nデザコン参加賞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-d0d12686c1-1",
    "name": "ホーム レコード",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 0.0
    },
    "castTime": "100",
    "delay": "500",
    "description": "ホームレコーダーを介して、レコードポイント/ホームポイントを記録する",
    "transfer": "",
    "acquisition": "NPC販売（AncientAgeオートベンダー）",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-6808746e7d-1",
    "name": "ボリテイション",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "1000",
    "description": "レビテイション中に使用することで一定時間飛行能力を得ることができる\n※高低差を変更することはできません。\n発動に必要なBuff : レビテイション",
    "transfer": "",
    "acquisition": "もえガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-d16235ce5b-1",
    "name": "マジカル ウィグル ブラシ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "500",
    "description": "僅かな魔力で誰でも使えるアートスペル\n足元に残したラインがくねくねと動き出す\n※座る事で解除が可能\n使用アイテム : カラーインク1",
    "transfer": "",
    "acquisition": "錬金-第9弾(褒賞)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-1c4b13e6a2-1",
    "name": "マジカル ブラシ(緑)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "500",
    "description": "足元に色を残しラインを描くことができる\n使用アイテム : カラー インク",
    "transfer": "",
    "acquisition": "錬金-第5弾(褒章)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "◯"
  },
  {
    "id": "tech-2bc32507eb-14c0981503-1",
    "name": "マジカル ブラシ(赤)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "500",
    "description": "足元に色を残しラインを描くことができる\n使用アイテム : カラー インク",
    "transfer": "",
    "acquisition": "錬金-第5弾(褒章)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "◯"
  },
  {
    "id": "tech-2bc32507eb-c947906050-1",
    "name": "マジカル ブラシ(青)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "500",
    "description": "足元に色を残しラインを描くことができる\n使用アイテム : カラー インク",
    "transfer": "",
    "acquisition": "錬金-第5弾(褒章)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "◯"
  },
  {
    "id": "tech-2bc32507eb-68c76aeeff-1",
    "name": "マナ バースト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "0",
    "delay": "300",
    "description": "マナを消費して瞬間的に加速させることができる\n※WarAgeでは効果が無い\n発動に必要なBuff : ライド バイク",
    "transfer": "",
    "acquisition": "もえガチャ\n171010",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-04a931ad69-1",
    "name": "ムービング スパイダー",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 1.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "40",
    "delay": "440",
    "description": "蜘蛛の糸を射出して対象の元へ移動する\n発動に必要なBuff :\n射出装置\n使用アイテム : スパイダー シルク 1",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230425",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-aa07fb2e95-1",
    "name": "メダロット たいちせいぎょ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 1.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "200",
    "delay": "2000",
    "description": "自分の移動速度とアイテムの重量と軽くする\n発動に必要なBuff :\nシュシュポップ フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出231003",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-83701370c2-1",
    "name": "メダロット ステルス",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 1.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 1.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "姿を消して不意打ちで大ダメージを与える\n発動に必要なBuff :\nペッパーキャット フォーム",
    "transfer": "×",
    "acquisition": "『メダロット』コラボ\nもえガチャ(前提装備)\n初出211122",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-28027986bd-1",
    "name": "モードチェンジ タンク",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "40",
    "delay": "2000",
    "description": "説明しよう！\n『 モードチェンジ タンク 』とは膝立ちの姿勢になることで\nキャタピラー部分が地面と接地して高速移動ができるようになるのだ！\nただしWarAgeでは効果がないのだ！\n発動に必要なBuff :\nキャタピラー レッグ",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230829",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-33bd384890-1",
    "name": "ラグビー ダッシュ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "キック",
        "min": 1.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "1500",
    "description": "敵陣に向かって猛ダッシュする\n※ダッシュ中は移動速度が上昇し攻撃を回避できるが、テクニックは使用できずスタミナの消費が激しい\n※WarAgeでは効果が無い\n発動に必要なBuff : ボール キャリア",
    "transfer": "○",
    "acquisition": "191016\nAC購入キャンペーン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-abcef00e26-1",
    "name": "ラブ ウィップ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "調教",
        "min": 1.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "120",
    "delay": "1320",
    "description": "愛のムチでペットの取得経験値が増加するが、通常攻撃以外使用できなくなる\n発動に必要なBuff :\n使役の力",
    "transfer": "×",
    "acquisition": "もえガチャ(前提装備)\n初出230905",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-98430bd75d-1",
    "name": "リミット スペル",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "調教",
        "min": 1.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "120",
    "delay": "1620",
    "description": "ペットの呪文詠唱を制限する代わりにペットの成長率が少しだけ上昇する\n発動に必要なBuff :\n犬笛",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出200825",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-94266e9900-1",
    "name": "リリース オブ フォース",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 1.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "150",
    "delay": "3300",
    "description": "両腕に封印された闇の力を解放することで攻撃ディレイを大幅に減少させる\n※効果中は「束縛の鎖」のパッシブが消える\n発動に必要なBuff : 束縛の鎖 マスタリー",
    "transfer": "×",
    "acquisition": "もえガチャ(前提装備)\n初出191008",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-7eefbd3350-1",
    "name": "リリース オブ マジック",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "150",
    "delay": "3300",
    "description": "ペンダントに溜めていた魔力を開放することで、魔力が上昇して、魔法ディレイが大幅に減少する\n効果中は「魔法の封蝋」のパッシブが消える\n魔力が上昇して、魔法ディレイが大幅に減少する\n発動に必要なBuff :\n魔法の封蝋",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出241001",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-6f33176bc8-1",
    "name": "レイジングハート セットアップ！",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "600",
    "delay": "18000",
    "description": "一定時間、魔法少女に変身して魔力上昇と魔法の射程増加効果を得る\n※WarAgeでは使用できない\n発動に必要なBuff : スタンバイモード",
    "transfer": "",
    "acquisition": "『 魔法少女リリカルなのは Reflection 』コラボ\n180306",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-df324d002f-1",
    "name": "レビテイション",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "200",
    "delay": "800",
    "description": "その場で浮くことができる",
    "transfer": "",
    "acquisition": "錬金-第2弾(褒章)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-37ad2bdfef-1",
    "name": "ロケット発射",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "360",
    "delay": "960",
    "description": "ロケットを打ち上げる\n発動に必要なBuff : ゴーゴーロケット",
    "transfer": "",
    "acquisition": "もえガチャ（福袋）\n171226",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-5206a855f5-1",
    "name": "ワイド スターマイン",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "薬調合",
        "min": 1.0
      }
    ],
    "successSkill": "薬調合",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "100",
    "delay": "1600",
    "description": "広範囲に連続で打ち上がる花火を設置する\n使用アイテム : エクスプロード ポーション×３",
    "transfer": "○",
    "acquisition": "錬金-第5弾(褒章)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "？"
  },
  {
    "id": "tech-2bc32507eb-3617f2743e-1",
    "name": "地中潜行",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 1.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 1.0,
    "cost": {
      "st": 0.0
    },
    "castTime": "100",
    "delay": "1300",
    "description": "地中を水中のように泳ぎながら移動できる\n発動に必要なBuff : 土遁の術",
    "transfer": "",
    "acquisition": "もえがちゃ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-1d495d0ad2-1",
    "name": "大きくなーれ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "120",
    "delay": "2000",
    "description": "願いを込めて打ち出の小槌を振ることで身体が大きくなる\n発動に必要なBuff:\n宝槌",
    "transfer": "×",
    "acquisition": "無料配布品(前提装備)\n260101-260106",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-a4c467b943-1",
    "name": "大凧の術",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "物まね",
        "min": 1.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "0",
    "delay": "1500",
    "description": "追い風を受けることで風に乗って大空を飛ぶことができる術\n※空中で発動可能\n発動に必要なBuff : 忍者凧",
    "transfer": "",
    "acquisition": "もえガチャ\n160913",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-b94a690352-1",
    "name": "大地の守り",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "強化魔法",
        "min": 1.0
      }
    ],
    "successSkill": "強化魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "130",
    "delay": "950",
    "description": "大地のマナを利用して自身の防御力と呪文抵抗力を上昇させる\n発動に必要なBuff : 大地の加護",
    "transfer": "×",
    "acquisition": "もえがちゃ\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-748b64a02b-1",
    "name": "妖力解放",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "150",
    "delay": "54000",
    "description": "九尾の妖力を解放することで一時的に魔力を大幅に上昇させるが、体にかかる負荷も大きい\n※再使用には魔力回復のために時間がかかる\n発動に必要なBuff : 九尾の力",
    "transfer": "",
    "acquisition": "もえがちゃ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-d62a2c7c08-1",
    "name": "漆黒の瘴気",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 1.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "160",
    "delay": "1400",
    "description": "漆黒の瘴気が対象を包み、防御力と魔法抵抗力を低下させる\n※プレイヤーには効果が無い\n発動に必要なBuff : 憑神の力",
    "transfer": "",
    "acquisition": "もえガチャ\n180227",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-4cb02000d5-1",
    "name": "立体機動",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 1.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "420",
    "description": "対象にアンカーを撃ち込み、ワイヤーを巻き上げることで高速移動ができる。\n※対象は採取可能なオブジェクト、アクションポイント、巨人\n発動に必要なBuff : 立体機動装置",
    "transfer": "",
    "acquisition": "『 進撃の巨人 』コラボ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "◯"
  },
  {
    "id": "tech-2bc32507eb-061220fcad-1",
    "name": "超特急",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "持久力",
        "min": 1.0
      }
    ],
    "successSkill": "持久力",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "0",
    "delay": "750",
    "description": "超スピードで直進する\n急には止まれないので注意！\n※WarAgeでは効果がない\n発動に必要なBuff :\n高速鉄道",
    "transfer": "",
    "acquisition": "もえガチャ\n(前提装備)\n初出230101",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-97621b566f-1",
    "name": "鏡花水月",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 1.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "100",
    "delay": "1000",
    "description": "水面に映った幻の虚像を攻撃させることで物理攻撃を回避する\n※物理攻撃以外を受けた場合は効果が消滅する\n※スキルが足りなくても発動可能、神秘魔法スキルで効果量が上昇する\n発動に必要なBuff : 水神の力",
    "transfer": "",
    "acquisition": "もえガチャ\n初出200609(前提装備)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-123997b97f-1",
    "name": "Ｃ.Ｏ.Ｌ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "250",
    "delay": "750",
    "description": "バレンタインチョコレートを渡して愛の告白をしよう！\n発動に必要なBuff :\n愛の告白\n使用アイテム : バレンタイン チョコレート 1",
    "transfer": "",
    "acquisition": "アイテムショップ\n(前提装備)\n初出250212",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-0951760fc9-1",
    "name": "Ｈ.Ｓ.Ｄ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 1.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "20",
    "delay": "520",
    "description": "移動速度は遅くなるが、逆立ちで移動できる",
    "transfer": "○",
    "acquisition": "課金キャンペーン\n190604-190611",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-449f75f31d-10-10",
    "name": "スワット",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "盗み",
        "min": 10.0
      },
      {
        "skill": "攻撃回避",
        "min": 10.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 10.0,
    "cost": {
      "st": 9.0
    },
    "castTime": "90",
    "delay": "800",
    "description": "片手武器で相手の武器を叩き、武器破壊や武器落としを狙う技\n※対Mobでは攻撃力を少し下げる",
    "transfer": "×",
    "acquisition": "『 灰と幻想のグリムガル 』コラボ\n七賢者の箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "◯"
  },
  {
    "id": "tech-2bc32507eb-037d6741ea-10-10",
    "name": "ハヤメ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "弓",
        "min": 10.0
      },
      {
        "skill": "自然調和",
        "min": 10.0
      }
    ],
    "successSkill": "弓",
    "successRequired": 10.0,
    "cost": {
      "st": 9.0
    },
    "castTime": "100",
    "delay": "1100",
    "description": "一時的に動体視力をアップさせて命中率が上昇する",
    "transfer": "×",
    "acquisition": "『 灰と幻想のグリムガル 』コラボ\n七賢者の箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-321122660d-10-10",
    "name": "隠密の歩法",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "物まね",
        "min": 10.0
      },
      {
        "skill": "自然調和",
        "min": 10.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 10.0,
    "cost": {
      "st": 9.0
    },
    "castTime": "100",
    "delay": "1300",
    "description": "隠密は気づかれず、疑われず、害されずに情報を持ち帰るもの。\nその歩みは周囲に馴染み、当然のように其処にある。達人の歩みは懐に至るまで警戒を抱かせないという。",
    "transfer": "×",
    "acquisition": "クエスト報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-da3f344167-20-20",
    "name": "イグゾースト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 20.0
      },
      {
        "skill": "攻撃回避",
        "min": 20.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 20.0,
    "cost": {
      "st": 11.0
    },
    "castTime": "40",
    "delay": "800",
    "description": "特殊な身のこなしで後方へ下がって敵との距離を取る技",
    "transfer": "×",
    "acquisition": "『 灰と幻想のグリムガル 』コラボ\n七賢者の箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-2d933214ad-90-20",
    "name": "紅蓮火竜拳",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "素手",
        "min": 90.0
      },
      {
        "skill": "神秘魔法",
        "min": 20.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "3000",
    "description": "通常攻撃HIT時に「 火竜の鉄拳 」が追加で発動する\n※ドラゴンタイプに特効効果あり",
    "transfer": "○",
    "acquisition": "『 FAIRY TAIL 』コラボ\nもえガチャ\n初出190129",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-e1b005a2ba-20-20",
    "name": "Ｓ.Ｂ.Ｇ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 20.0
      },
      {
        "skill": "攻撃回避",
        "min": 20.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 20.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "0",
    "delay": "1500",
    "description": "仮想の敵からの攻撃を避けながら攻撃を返す練習",
    "transfer": "○",
    "acquisition": "サマーラッキーバッグ2018\n180731",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-37079d00ec-40-20",
    "name": "Ｓ.Ｎ.Ｆ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 40.0
      },
      {
        "skill": "ダンス",
        "min": 20.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "520",
    "delay": "1800",
    "description": "自分の周囲を明るく照らす\n(サタデー ナイト フィーバー)",
    "transfer": "",
    "acquisition": "錬金-第4弾\n錬金-第6弾\nQoA プリティ ゴースト",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-e9e7be0753-50-30",
    "name": "アーリー スラスト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 50.0
      },
      {
        "skill": "盗み",
        "min": 30.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "40",
    "delay": "900",
    "description": "相手の弱点をマーキングし、マーキングを狙うことで1度だけダメージを増加させる\n※ダメージを与えるとマーキングが解除される\n※発動には右手に近接武器を装備している必要がある",
    "transfer": "○",
    "acquisition": "もえガチャ(ログホラコラボ)\n初出210727",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-5c44ace168-30",
    "name": "グルーミング ケア",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "調教",
        "min": 30.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "200",
    "delay": "1700",
    "description": "ペットを毛繕いすることでペットのパフォーマンスを向上させる\n※攻撃、命中、回避、防御、魔力を8%上昇させる\n発動に必要なBuff :\nグルーミング",
    "transfer": "無\n料",
    "acquisition": "ミラクルサマーガチャ2020\n初出200728",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-b695255394-60-30",
    "name": "スター マイン",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 60.0
      },
      {
        "skill": "薬調合",
        "min": 30.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "170",
    "delay": "750",
    "description": "空高く舞い上がり 夜空に美しい大輪の花を咲かせる\n使用アイテム : エクスプロード ポーション",
    "transfer": "",
    "acquisition": "錬金-第4弾\n錬金-第6弾\n黒の廟堂 交換報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-2a3d256a36-30-70",
    "name": "ソウル ハイド",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 30.0
      },
      {
        "skill": "死体回収",
        "min": 70.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 30.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "100",
    "delay": "1100",
    "description": "自らの魂を自然に溶け込ませることにより気配を完全に消す",
    "transfer": "",
    "acquisition": "赤の廟堂-宝箱\n錬金-第1弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-b5532dac92-70-30",
    "name": "ビジョン スティール",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "盗み",
        "min": 70.0
      },
      {
        "skill": "暗黒命令",
        "min": 30.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "一定時間、対象の視点で盗み見ることができる",
    "transfer": "",
    "acquisition": "もえガチャ\n160405",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-1949ca16ed-30",
    "name": "ムーン フォース",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 30.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "250",
    "delay": "2050",
    "description": "月の光を浴びることで魔力と呪文抵抗力が上昇する\n※夜の間は効果が2倍になる\n発動に必要なBuff :\n月の加護",
    "transfer": "×",
    "acquisition": "もえガチャ(前提装備)\n初出200929",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-a012bdbe1a-60-30",
    "name": "ロングレンジ カスタム",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "銃器",
        "min": 60.0
      },
      {
        "skill": "鍛冶",
        "min": 30.0
      }
    ],
    "successSkill": "銃器",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1200",
    "description": "武器を改造して一時的に射程を大幅に伸ばす",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出250819",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-6a8f8fee3d-30",
    "name": "仙気解放",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 30.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 30.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "150",
    "delay": "2200",
    "description": "自然のエネルギーを身に纏い身体能力を強化する仙術\n発動中は自然回復力が低下（停止）する\n※WarAgeでは効果がない\n発動に必要なBuff :\n仙術",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出220315",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-6fad2b759d-30-30",
    "name": "共鳴",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "音楽",
        "min": 30.0
      },
      {
        "skill": "パフォーマンス",
        "min": 30.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "20",
    "delay": "750",
    "description": "ケロケロケロケロ…\n共鳴することでPTメンバー全員の自然回復量を増加させる",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出200602",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-49cba91208-30-30",
    "name": "制約の鎖",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "調教",
        "min": 30.0
      },
      {
        "skill": "神秘魔法",
        "min": 30.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "120",
    "delay": "1320",
    "description": "魔法の鎖でペット1体の行動を制限して攻撃力と回避を一定時間半減させる",
    "transfer": "",
    "acquisition": "もえガチャ\n180130",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-b3e05765a9-30",
    "name": "大噴火",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 30.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "150",
    "delay": "1350",
    "description": "怒りが有頂天に達した時、頭上からマグマが噴出して与えるダメージが増加する\n※WarAgeでは効果がない\n発動に必要なBuff :\n活火山",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230718",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-f36be7d7a1-30",
    "name": "大樹の奇跡",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 30.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "140",
    "delay": "1500",
    "description": "大樹の力により範囲攻撃の範囲が少し増加する\n※WarAgeでは効果が無い\n発動に必要なBuff : 大樹の加護",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出180515",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-87e8ffb81d-30-30",
    "name": "鬼火",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "死体回収",
        "min": 30.0
      },
      {
        "skill": "パフォーマンス",
        "min": 30.0
      }
    ],
    "successSkill": "死体回収",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "自分の周囲に人魂を呼び出す",
    "transfer": "○",
    "acquisition": "錬金-第7弾\n錬金-第8弾\n黒の廟堂 交換報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-8db21c3cc4-30-30",
    "name": "Ｃ.Ｈ.Ｗ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 30.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 30.0,
    "cost": {
      "st": 59.0
    },
    "castTime": "500",
    "delay": "1020",
    "description": "体内の精神力を一点に集中させ\n一気に放出する超必殺技\nその見た目は 相手を一撃で倒せそうな気にさせる",
    "transfer": "",
    "acquisition": "錬金-第6弾\n練金-第7弾\n黒の廟堂 交換報酬\n七賢者の箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-e3af20b6b9-30",
    "name": "Ｃ.Ｒ.Ｌ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "水泳",
        "min": 30.0
      }
    ],
    "successSkill": "水泳",
    "successRequired": 30.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "20",
    "delay": "1520",
    "description": "走るよりも早く地面を泳ぐように移動することが出来る\n※WarAgeでは効果が無い",
    "transfer": "",
    "acquisition": "課金キャンペーン190416",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-88ce817e85-40",
    "name": "ひよこ鑑定",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "調教",
        "min": 40.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 40.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "150",
    "delay": "750",
    "description": "ひよこの性別を鑑定することができる\n発動に必要なBuff : ブリーダー マスタリー",
    "transfer": "",
    "acquisition": "NPC販売(ひよこ鑑定士)\n※購入条件あり",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-8b7838b6d0-40-40",
    "name": "アイドル ソング",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "音楽",
        "min": 40.0
      },
      {
        "skill": "ダンス",
        "min": 40.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "400",
    "delay": "1500",
    "description": "歌の力で周囲の味方を勇気付けて、攻撃力と防御力を上昇させる\n発動に必要なBuff : アイドル ステージ",
    "transfer": "",
    "acquisition": "もえガチャ\n180116",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-f8892ee9a9-40",
    "name": "ウォークライ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 40.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "180",
    "delay": "1180",
    "description": "雄叫びを上げて周囲の敵を怯ませ、足止めする\n発動に必要なBuff : ウォーリアー マスタリー or パーフェクト・ウォリアー",
    "transfer": "×",
    "acquisition": "『 灰と幻想のグリムガル 』コラボ\n七賢者の箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-cc7712c72a-40-40",
    "name": "エキスパート センス",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "採掘",
        "min": 40.0
      },
      {
        "skill": "伐採",
        "min": 40.0
      }
    ],
    "successSkill": "採掘",
    "successRequired": 40.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "140",
    "delay": "1640",
    "description": "採掘と伐採の命中率を上昇させる\n発動に必要なBuff : クリエイター マスタリー",
    "transfer": "",
    "acquisition": "錬金-第9弾\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-78747559fd-40",
    "name": "クイーンズ オーダー",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 40.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 40.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "120",
    "delay": "1920",
    "description": "女王の命令で敵軍へ突撃させる\n※自分以外のPTメンバーの攻撃力と命中を10%上昇させる\n発動に必要なBuff :\n女王の威厳",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出250902",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-33f800c26a-40",
    "name": "グレア アイ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 40.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "180",
    "delay": "1180",
    "description": "周囲を睨みつける\n睨まれたものは目を反らして 身動きが取れなくなる\n発動に必要なBuff : チンピラ マスタリー",
    "transfer": "",
    "acquisition": "錬金-第9弾\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-3449dc4140-50-40",
    "name": "サーチ ディレクション",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 40.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 40.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "150",
    "delay": "950",
    "description": "ターゲットがいる方向やターゲットと自分の距離を感じ取ることができる\n※システムウィンドウに表示されます。",
    "transfer": "",
    "acquisition": "もえガチャ\n160405",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-fbd84afe2f-40",
    "name": "スチーム バースト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "筋力",
        "min": 40.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "150",
    "delay": "1450",
    "description": "スタミナが徐々に減るが、蒸気の力で一時的に攻撃力を上昇させる\n※WarAgeでは効果がない\n発動に必要なBuff :\n蒸気機関",
    "transfer": "×",
    "acquisition": "もえガチャ\n初出200317",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-85251293c5-40-40",
    "name": "スパート ウィップ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "調教",
        "min": 40.0
      },
      {
        "skill": "集中力",
        "min": 40.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "120",
    "delay": "1200",
    "description": "ペットに追い込みをかけて一時的に移動速度を上昇させる",
    "transfer": "○",
    "acquisition": "もえガチャ\n180717",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-cf004a147d-40-40",
    "name": "ツリー ミミック",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "物まね",
        "min": 40.0
      },
      {
        "skill": "自然調和",
        "min": 40.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "20",
    "delay": "2020",
    "description": "完全に自然と融合することで敵から認識されなくなる技\n※移動や行動を起こすと解除される\n※ヘイトが乗った状態では効果が無い\n※BOSS等の一部のモンスターには効果が無い\n発動に必要なBuff : 木の心",
    "transfer": "",
    "acquisition": "もえガチャ\n161011",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-7b2b919d05-90-40",
    "name": "フィジカル バリアドーム",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "盾",
        "min": 90.0
      },
      {
        "skill": "召喚魔法",
        "min": 40.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "120",
    "delay": "2120",
    "description": "周囲に物理ダメージを軽減するバリアを展開する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出230620",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-6dad6ae4c6-40",
    "name": "フラワー ミミック",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "物まね",
        "min": 40.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "20",
    "delay": "2020",
    "description": "花に擬態することで敵の目をごまかしやり過ごすことができる\n※移動や行動を起こすと解除される\n※ヘイトが乗った状態では効果が無い\n発動に必要なBuff : ハナカマキリ\n？？？",
    "transfer": "",
    "acquisition": "もえガチャ\n170221",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-3d7e4aa779-90-40",
    "name": "ブレイン マッスル",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "筋力",
        "min": 90.0
      },
      {
        "skill": "集中力",
        "min": 40.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "244",
    "delay": "1944",
    "description": "むきむきのーみそ・ｗ・\n※攻撃力と防御力が大幅に上昇するが、効果中は魔法が使用できなくなる\n※バーサーク系と併用できない",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出241119",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-54edbc432b-70-70-40",
    "name": "ブースト バイタリティ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "生命力",
        "min": 70.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      },
      {
        "skill": "呪文抵抗力",
        "min": 40.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "150",
    "delay": "1900",
    "description": "一時的に活力を増加させて、最大HPを上昇させる",
    "transfer": "",
    "acquisition": "テクガチャ\n初出251104",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-f2f5576924-90-40",
    "name": "マジカル バリアドーム",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "盾",
        "min": 90.0
      },
      {
        "skill": "呪文抵抗力",
        "min": 40.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "120",
    "delay": "2120",
    "description": "周囲に魔法ダメージを軽減するバリアを展開する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出230725",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-1dd39ede0f-40",
    "name": "マスプロダクション",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "鍛冶",
        "min": 40.0
      }
    ],
    "successSkill": "鍛冶",
    "successRequired": 40.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "気合を入れて集中することで一定時間、量産可能な状態になる\nコンバイン可能上限が50に増加する\n発動に必要なBuff : グレート クリエイター マスタリー",
    "transfer": "○",
    "acquisition": "錬金の箱\n第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-16f02da03a-40",
    "name": "ライオニック オーラ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "筋力",
        "min": 40.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "獅子の力を開放することで身体能力を10%上昇させる\n発動に必要なBuff :\n獅子の加護",
    "transfer": "",
    "acquisition": "もえガチャ\n(前提装備)初出200818",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-dfc19a5f03-40",
    "name": "ライオニック フォーム",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "牙",
        "min": 40.0
      }
    ],
    "successSkill": "牙",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "150",
    "delay": "1600",
    "description": "百獣の王に変身して、一時的に攻撃力と移動速度が上昇する\n発動に必要なBuff :\n獅子の加護",
    "transfer": "",
    "acquisition": "もえガチャ\n(前提装備)初出200818",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-ed351b7cff-70-40",
    "name": "ランディング アチチュード",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "落下耐性",
        "min": 70.0
      },
      {
        "skill": "パフォーマンス",
        "min": 40.0
      }
    ],
    "successSkill": "落下耐性",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "120",
    "delay": "920",
    "description": "どんな高所からも完璧な着地姿勢を取ることでダメージを軽減することができる\n※空中で発動可",
    "transfer": "",
    "acquisition": "錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-1d32467acf-60-40",
    "name": "桜花乱舞",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 60.0
      },
      {
        "skill": "神秘魔法",
        "min": 40.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "桜の魔法陣を展開して周囲にいる味方のダメージを軽減する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210309",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-727d5664ca-40",
    "name": "薔薇のアンサンブル",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "音楽",
        "min": 40.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "120",
    "delay": "750",
    "description": "PTメンバーとペットのクリティカル率を上昇させる\n発動に必要なBuff : 薔薇のコンダクター",
    "transfer": "",
    "acquisition": "もえガチャ\n初出200526",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-a3d1f734f7-40",
    "name": "酔拳",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 40.0
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "150",
    "delay": "1950",
    "description": "酔えば酔うほど強くなるが、効果の発動中は視界が歪んで見える\n※ジャンプで解除可能\n発動に必要なBuff : 酔拳士 マスタリー or 酔拳士(酔歩) マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出231226",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-2510a28237-60-40",
    "name": "鬼火纏",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "素手",
        "min": 60.0
      },
      {
        "skill": "酩酊",
        "min": 40.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "2000",
    "description": "鬼火を拳に纏うことで通常攻撃が連撃に変化する\n※WarAgeでは効果がない\n発動に必要なBuff :\n妖鬼の力",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出230822",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-a047829c67-50-50",
    "name": "アジリティ サークル",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 50.0
      },
      {
        "skill": "知能",
        "min": 50.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "足元に魔法陣を展開させて\n魔法陣内にいるキャラクターの回避と攻撃速度を上昇させる\n使用アイテム : PNQ×３",
    "transfer": "",
    "acquisition": "2014年3月課金",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-de6f4db3b9-50-50",
    "name": "アンカー ハウル",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 50.0
      },
      {
        "skill": "盾",
        "min": 50.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "220",
    "delay": "1600",
    "description": "裂帛の雄たけびを上げることで敵に自分が脅威であることを知らしめ、瞬間的に自分への敵対心を煽る\n同時に自身も戦いに備えることで、短時間ではあるが防御力上昇する",
    "transfer": "○",
    "acquisition": "もえガチャ(ログホラコラボ)\n初出210720",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-ae7c676ec0-80-50",
    "name": "イグニス フォーム",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "強化魔法",
        "min": 80.0
      },
      {
        "skill": "呪文抵抗力",
        "min": 50.0
      }
    ],
    "successSkill": "強化魔法",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "250",
    "delay": "2250",
    "description": "太陽神の力を得て炎の化身となることで攻撃力が上昇し、\n火属性の攻撃を吸収するが、耐水属性が大幅に低下する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出190604",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-ba56221c5b-50",
    "name": "エア ジャンプ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 50.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "0",
    "delay": "180",
    "description": "空中でも発動可能な跳躍\n発動に必要なBuff : アサシン マスタリー or アスリート マスタリー",
    "transfer": "",
    "acquisition": "錬金-GENERATIONS\n錬金-第9弾\n錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "◯"
  },
  {
    "id": "tech-2bc32507eb-1c2b80de3d-60-50",
    "name": "カースド スクラッチ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 60.0
      },
      {
        "skill": "死の魔法",
        "min": 50.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1100",
    "description": "対象に呪いの傷痕を残し次に受ける攻撃のダメージを倍増させる\n※ダメージ発生時に解除される",
    "transfer": "",
    "acquisition": "もえガチャ\n170808",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-9e70c3ced0-90-50",
    "name": "サイコキネシス",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 90.0
      },
      {
        "skill": "死の魔法",
        "min": 50.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "240",
    "delay": "1500",
    "description": "念力により周囲の敵の行動を制限する",
    "transfer": "",
    "acquisition": "火竜神殿-宝箱\n錬金-第2弾\n錬金-第5弾\n練金-第5.5弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-c04f4ecb32-70-50",
    "name": "シール ミスト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 70.0
      },
      {
        "skill": "死の魔法",
        "min": 50.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 70.0,
    "cost": {
      "st": 29.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "対象の周囲に一定時間、有益な効果を無効化する呪いの霧を発生させる",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出191008\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-80c7d8e8f9-60-50",
    "name": "ファントム イリュージョン",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "物まね",
        "min": 60.0
      },
      {
        "skill": "盗み",
        "min": 50.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 60.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "100",
    "delay": "2300",
    "description": "自分そっくりの身代わり人形と入れ替わり、その隙に透明化して逃げることができる",
    "transfer": "",
    "acquisition": "もえガチャ\n初出251118",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-4349e5985c-50-50",
    "name": "フィアー ドミネイション",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 50.0
      },
      {
        "skill": "死の魔法",
        "min": 50.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "150",
    "delay": "1200",
    "description": "対象を恐怖で支配して動きを止め、MPを吸収する\n※WarAgeではMP吸収効果のみ発動",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210209",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-307cbd0bcb-60-50",
    "name": "フェアリー ミミック",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "物まね",
        "min": 60.0
      },
      {
        "skill": "薬調合",
        "min": 50.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "100",
    "delay": "2100",
    "description": "特殊な薬で妖精のように小さな姿に変身する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出251223",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-afe215ba84-80-50",
    "name": "ブーステッド レッグス",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "キック",
        "min": 80.0
      },
      {
        "skill": "強化魔法",
        "min": 50.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "130",
    "delay": "1030",
    "description": "一時的に脚力を増幅させる",
    "transfer": "",
    "acquisition": "錬金-Fancy",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-a66683b425-70-50",
    "name": "ベルカ式魔法陣(はやて)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 70.0
      },
      {
        "skill": "知能",
        "min": 50.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "足元に古代ベルカ式の魔法陣を展開させて魔法陣内にいるキャラクターの攻撃範囲を増加させる\n※WarAgeでは効果が無い\n使用アイテム : PNQ×３",
    "transfer": "○",
    "acquisition": "『 魔法少女リリカルなのは Reflection 』コラボ\nもえガチャ\n180320",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-e5e1da3617-70-50",
    "name": "ベルカ式魔法陣(ヴィータ)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 70.0
      },
      {
        "skill": "知能",
        "min": 50.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "足元に古代ベルカ式の魔法陣を展開させて魔法陣内にいるキャラクターの攻撃力を増加させる\n※WarAgeでは効果が無い\n使用アイテム : PNQ×３",
    "transfer": "○",
    "acquisition": "『 魔法少女リリカルなのは Reflection 』コラボ\nもえガチャ\n180320",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-63d3d6e810-50-50",
    "name": "マジック サークル",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 50.0
      },
      {
        "skill": "知能",
        "min": 50.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "足元に魔法陣を展開させて\n魔法陣内にいるキャラクターの魔力とMP回復速度を上昇させる\n使用アイテム : PNQ×３",
    "transfer": "",
    "acquisition": "2014年3月課金\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-9b8beb3251-50",
    "name": "マジック スプリング",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 50.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 50.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "0",
    "delay": "70",
    "description": "宙に魔法の足場を出現させて飛び跳ねるように移動することができる\n発動に必要なBuff : アルケミスト マスタリー",
    "transfer": "○",
    "acquisition": "もえがちゃ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-e58084c992-70-50",
    "name": "ミッドチルダ式魔法陣(なのは)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 70.0
      },
      {
        "skill": "知能",
        "min": 50.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "足元にミッドチルダ式の魔法陣を展開させて魔法陣内にいるキャラクターの魔力と魔法の射程を上昇させる\n※WarAgeでは効果が無い\n使用アイテム : PNQ×３",
    "transfer": "×",
    "acquisition": "『 魔法少女リリカルなのは Reflection 』コラボ\nクエスト報酬\n180320",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-eef8f475f4-70-50",
    "name": "ミッドチルダ式魔法陣(フェイト)",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 70.0
      },
      {
        "skill": "知能",
        "min": 50.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "足元にミッドチルダ式の魔法陣を展開させて魔法陣内にいるキャラクターの回避と移動速度を上昇させる\n※WarAgeでは効果が無い\n使用アイテム : PNQ×３",
    "transfer": "○",
    "acquisition": "『 魔法少女リリカルなのは Reflection 』コラボ\nもえガチャ\n180313",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-3ee3617ed1-80-50",
    "name": "ヴァンパイア フォーム",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "牙",
        "min": 80.0
      },
      {
        "skill": "暗黒命令",
        "min": 50.0
      }
    ],
    "successSkill": "牙",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "80",
    "delay": "1800",
    "description": "吸血鬼に変身する\n牙の攻撃力と命中率が上昇し、通常攻撃に吸血の効果が付与される\nさらに移動速度が上昇する ※War Ageでは効果が無い",
    "transfer": "",
    "acquisition": "もえがちゃ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-f2b8eb8101-70-70-50",
    "name": "勇猛無比の陣",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 70.0
      },
      {
        "skill": "持久力",
        "min": 70.0
      },
      {
        "skill": "盾",
        "min": 50.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "150",
    "delay": "3600",
    "description": "防御力が低下するが、攻撃力と命中を上昇させる魔法陣を展開する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出250401",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-65bfc13f7c-70-50",
    "name": "天啓視",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "攻撃回避",
        "min": 70.0
      },
      {
        "skill": "神秘魔法",
        "min": 50.0
      }
    ],
    "successSkill": "攻撃回避",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "20",
    "delay": "1100",
    "description": "数秒先の未来を視ることで敵の行動を予見して、命中率を上昇、敵の攻撃を回避する",
    "transfer": "○",
    "acquisition": "『ありふれた職業で世界最強』\nコラボガチャ\n初出250430",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-1015acfb72-60-50",
    "name": "幻桜",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 60.0
      },
      {
        "skill": "戦闘技術",
        "min": 50.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "200",
    "delay": "1800",
    "description": "桜吹雪と共に姿を消し、不意の一撃で攻撃がクリティカルになる",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出220329",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-49c595f9aa-50",
    "name": "残夜の黒翼",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "死の魔法",
        "min": 50.0
      }
    ],
    "successSkill": "死の魔法",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "120",
    "delay": "1620",
    "description": "闇の力で身を守り、漆黒の翼が姿を隠す\n発動に必要なBuff : ネクロマンサー マスタリー or イビルナイト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210413\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-60a2788912-60-50",
    "name": "空力",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "キック",
        "min": 60.0
      },
      {
        "skill": "精神力",
        "min": 50.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "0",
    "delay": "240",
    "description": "魔力で空中に足場を作り、空中歩行が可能になる\n※空中発動可能",
    "transfer": "",
    "acquisition": "『ありふれた職業で世界最強』\nコラボクエスト報酬\n250422〜250520",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-5496ee4eef-50-50",
    "name": "豪脚",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "キック",
        "min": 50.0
      },
      {
        "skill": "筋力",
        "min": 50.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "120",
    "delay": "1620",
    "description": "一時的にキックの威力と命中を上昇させる",
    "transfer": "",
    "acquisition": "『ありふれた職業で世界最強』\nコラボクエスト報酬\n250422〜250520",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-bf3e0ae0e9-60-60",
    "name": "アクセラレイター",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "強化魔法",
        "min": 60.0
      }
    ],
    "successSkill": "強化魔法",
    "successRequired": 60.0,
    "cost": {
      "st": 50.0
    },
    "castTime": "30",
    "delay": "1600",
    "description": "緊急救助用の加速機動システムにより瞬間的に移動速度を上昇させる",
    "transfer": "○",
    "acquisition": "『 魔法少女リリカルなのは Reflection 』コラボ\nもえガチャ\n180327",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-76018ca9c6-80-60",
    "name": "アルゴノゥト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "強化魔法",
        "min": 80.0
      },
      {
        "skill": "集中力",
        "min": 60.0
      }
    ],
    "successSkill": "強化魔法",
    "successRequired": 80.0,
    "cost": {
      "st": 46.0
    },
    "castTime": "900",
    "delay": "3000",
    "description": "英雄願望\n憧憬となる英雄をイメージしてチャージすることで、次の一撃の威力を大幅に上げる技\n※WarAgeでは効果がない",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出240213",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-7fa8973ab1-60",
    "name": "アンリミテッド フォース",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "生命力",
        "min": 60.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 60.0,
    "cost": {
      "st": 50.0
    },
    "castTime": "140",
    "delay": "4200",
    "description": "物理攻撃の威力と魔力が上昇して、HPとMPの自然回復量が大幅に上昇する\n発動に必要なBuff :\n竜王の加護",
    "transfer": "×",
    "acquisition": "もえガチャ(前提装備)\n初出250325",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-2928f77017-80-60",
    "name": "エクステンション サークル",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 80.0
      },
      {
        "skill": "魔法熟練",
        "min": 60.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "周囲に球状の魔法陣を展開させて\n魔法陣内にいるキャラクターの射程、攻撃範囲を増加させる\n※WarAgeでは効果がない\n使用アイテム : ピュア ノア キューブ 3",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出220920",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-ff69e4acb3-60-60",
    "name": "システム・オルタ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "強化魔法",
        "min": 60.0
      },
      {
        "skill": "筋力",
        "min": 60.0
      }
    ],
    "successSkill": "強化魔法",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "180",
    "delay": "2000",
    "description": "一時的に身体能力を強化して攻撃力と攻撃スピードを上昇させるが、体に負荷がかかり消費スタミナが増加する\n※ジャンプで解除可能",
    "transfer": "○",
    "acquisition": "『 魔法少女リリカルなのは Reflection 』コラボ\nもえガチャ\n180327",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-7e93b343d3-60-60",
    "name": "ジェネレイト ボディ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 60.0
      },
      {
        "skill": "死体回収",
        "min": 60.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "2000",
    "description": "一定時間、闇の力で肉体が受けた傷やダメージを瞬時に再生する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出221011",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-3b5df64486-90-60",
    "name": "ジャイアント",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "筋力",
        "min": 90.0
      },
      {
        "skill": "強化魔法",
        "min": 60.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 90.0,
    "cost": {
      "st": 50.0
    },
    "castTime": "150",
    "delay": "3150",
    "description": "マナを消費して自らの身体を巨大化させる\n※WarAgeでは効果が無い",
    "transfer": "○",
    "acquisition": "『 FAIRY TAIL 』コラボ\nもえガチャ\n初出190129",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-ca08adc782-60",
    "name": "タイダウン ローピング",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "盗み",
        "min": 60.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "160",
    "delay": "1360",
    "description": "盗みの力を加えたベルトを対象に投げ\n捕らえた対象の行動を盗む\n※移動速度、攻撃速度、詠唱速度が低下する\n発動に必要なBuff : アドベンチャラー マスタリー\n使用アイテム :\nベルト×４\n縄×１\n110419アイテム変更",
    "transfer": "",
    "acquisition": "錬金-第6弾\n黒の廟堂 交換報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-6e2f9771af-60-60",
    "name": "ダイビング グラウンド",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "水泳",
        "min": 60.0
      },
      {
        "skill": "自然調和",
        "min": 60.0
      }
    ],
    "successSkill": "水泳",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "20",
    "delay": "1500",
    "description": "地面に潜って地面を水面のように泳ぐことができる\n効果中は移動速度で少し上昇して物理攻撃がすり抜ける\n※ジャンプや行動で解除される",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出221011",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-f38ebf003e-60",
    "name": "テンションアップ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 60.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1950",
    "description": "テンションを上げることで一定時間、範囲攻撃の範囲が広がる\n発動に必要なBuff : ウォーリアー マスタリー or ブレイブナイト マスタリー",
    "transfer": "×",
    "acquisition": "200901実装\n武閃ギルドランク3以上購入可能",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-7c871094be-60",
    "name": "ハイパー ジャンプ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 60.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "20",
    "delay": "1620",
    "description": "効果中は連続で高く飛び上がることができる\n発動に必要なBuff : アスリート マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出260127",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-f0060f2d7b-60",
    "name": "フォートレス",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "盾",
        "min": 60.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "150",
    "delay": "1900",
    "description": "防御力が上昇し、ノックバックに対して踏み止まることができる\n発動に必要なBuff : ブレイブナイト マスタリー",
    "transfer": "",
    "acquisition": "錬金の箱\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-6f3de92b96-60",
    "name": "ブリーディング ウィップ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "調教",
        "min": 60.0
      }
    ],
    "successSkill": "調教",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "110",
    "delay": "2510",
    "description": "ペットに特殊攻撃をさせる\n※ペットが特殊攻撃を使える状態の時のみ発動する\n発動に必要なBuff : ブリーダー マスタリー",
    "transfer": "",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-6e55ae2945-60-60",
    "name": "全力全開",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 60.0
      },
      {
        "skill": "精神力",
        "min": 60.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "170",
    "delay": "2000",
    "description": "防御力が低下し魔法使用時の消費MPが増えるが、一時的に魔力を大幅に上げることができる\n※ジャンプで解除可能",
    "transfer": "○",
    "acquisition": "『 魔法少女リリカルなのは Reflection 』コラボ\nもえガチャ\n180327",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-a6bc31d49d-80-70",
    "name": "アトラクト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "着こなし",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "着こなし",
    "successRequired": 80.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "140",
    "delay": "1200",
    "description": "敵の注意を引き付けて味方を守る\n発動に必要なBuff : ブレイブナイト マスタリー",
    "transfer": "○",
    "acquisition": "複製\n錬金-第2弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-f29e28ddc0-70",
    "name": "エリア クリーニング",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "美容",
        "min": 70.0
      }
    ],
    "successSkill": "美容",
    "successRequired": 70.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "220",
    "delay": "1800",
    "description": "周囲を洗浄し、汚れとともにDebuffを一つ洗い流す\n使用アイテム : シャンプー×３\n発動に必要なBuff : ハウスキーパー マスタリー",
    "transfer": "",
    "acquisition": "複製\n錬金-第4弾\n練金-第5.5弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-4d85fa467b-80-70",
    "name": "ジャイアント キリング",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "筋力",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "筋力",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "1500",
    "description": "一定時間、強力な敵を打ち滅ぼす力を得ることができる\n※カオス系に対して特攻効果",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出191023",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-e3d29c080c-70",
    "name": "スペル エンハンス",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 70.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "150",
    "delay": "2000",
    "description": "MPの消費量が増加するが、破壊魔法の効果を大幅に上昇させる\n※ジャンプで解除可能\n発動に必要なBuff : アルケミスト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n180424",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-2826d13931-70",
    "name": "タイム エクステンション",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 70.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "100",
    "delay": "1900",
    "description": "効果中だけ自信にかかっているバフの効果時間を延長させる\n※効果が切れた場合は元に戻ります\n発動に必要なBuff :\n時の歯車",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出250225",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-ca5849594d-70-70",
    "name": "ダイアロス ポップス",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "音楽",
        "min": 70.0
      },
      {
        "skill": "ダンス",
        "min": 70.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "300",
    "delay": "1250",
    "description": "音楽と軽快なダンスで味方を鼓舞する歌\nPTメンバーとペットの攻撃力を上昇させる\nアイドル ソング\nを上書きする（併用不可）",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210622",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-c8dcbbd5b5-70-40",
    "name": "ディテクション レーダー",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "盗み",
        "min": 70.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "150",
    "delay": "2200",
    "description": "周囲200mのPCやNPCを捕捉して、レーダー上に表示する\n※一定時間経過か行動でキャンセルされる",
    "transfer": "×",
    "acquisition": "黒の廟堂\nクリア報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-899fd998e1-70-90",
    "name": "バック ステップ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 70.0
      },
      {
        "skill": "攻撃回避",
        "min": 90.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 70.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "20",
    "delay": "500",
    "description": "後ろへ飛ぶことにより攻撃を避ける",
    "transfer": "",
    "acquisition": "NPC販売(War奇跡)\n(※品)\n錬金-第3〜3.5弾(特殊)\n錬金-第5弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-196171775a-80-70",
    "name": "フォースド アウェイクン",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 80.0
      },
      {
        "skill": "強化魔法",
        "min": 70.0
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 80.0,
    "cost": {
      "st": 100.0
    },
    "castTime": "200",
    "delay": "1400",
    "description": "鶏の鳴き真似に強化魔法をのせて放つことで眠れる力をたたき起こす\n※自分を含む味方とペットの与えるダメージを増加させる\n※センスレスで上書きされる",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出240820",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-6e36f0ad83-70-70",
    "name": "フルバースト マジック",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 70.0
      },
      {
        "skill": "集中力",
        "min": 70.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "170",
    "delay": "2000",
    "description": "魔法使用時の消費MPが増えるが、一時的に魔力を大幅に上げることができる\n※ジャンプで解除可能",
    "transfer": "",
    "acquisition": "錬金の箱\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-e3c293665e-70",
    "name": "モラール ブースター",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "シャウト",
        "min": 70.0
      }
    ],
    "successSkill": "シャウト",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "200",
    "delay": "1700",
    "description": "後方にいる味方を鼓舞して 一時的に仲間の攻撃力を上昇させる\n発動に必要なBuff : デュエリスト マスタリー",
    "transfer": "",
    "acquisition": "錬金-GENERATIONS\n錬金-第9弾\n火竜神殿-宝箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-741c245223-70",
    "name": "ライフ ドレイン",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "死の魔法",
        "min": 70.0
      }
    ],
    "successSkill": "死の魔法",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "170",
    "delay": "1600",
    "description": "武器に吸魔の力を宿し、対象に与えたダメージの25%を回復する\n※一部テクニックとDoT系には効果が反映されません。\n発動に必要なBuff : イビルナイト マスタリー",
    "transfer": "",
    "acquisition": "もえガチャ\n170627",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-f4639a175b-70-70-70-70",
    "name": "ラスト スパート",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 70.0
      },
      {
        "skill": "水泳",
        "min": 70.0
      },
      {
        "skill": "自然回復",
        "min": 70.0
      },
      {
        "skill": "持久力",
        "min": 70.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 70.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "60",
    "delay": "1860",
    "description": "最後の力を振り絞って全力で走る",
    "transfer": "",
    "acquisition": "トレント アスリート\nワンダー ソウル\n錬金-第1弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-05e248768d-70",
    "name": "リバーサル エナジー",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "効果中に受けたダメージ量に応じて、スタミナを回復する\n発動に必要なBuff : ブレイブナイト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出240604",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-3a24ca8022-80-70",
    "name": "リミット ブレイク",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "強化魔法",
        "min": 80.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "強化魔法",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "260",
    "delay": "1300",
    "description": "潜在能力を引き出し、爆発的に攻撃力を上げることができる\nが、\nメイン攻撃以外使用できない\n※詳細は短評にて\n※Buff枠を2つ使用する\n現在は1つ ジャンプで解除可能",
    "transfer": "",
    "acquisition": "ブラック バイソン[大]\nワイルド バイソン[大]\n火口の審判者\n錬金-第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-ddf8d95dc9-80-70",
    "name": "レイジ ドライブ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 80.0
      },
      {
        "skill": "強化魔法",
        "min": 70.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "140",
    "delay": "1740",
    "description": "怒りを駆動力に変換して攻撃性能を一段階アップさせる\n※攻撃ディレイが減少して、物理攻撃の威力が増加するが、回避が大幅に低下する\n※攻撃ディレイ減少はペットには効果がない\n※ペットにはと記述があるがそもそも自己バフ",
    "transfer": "",
    "acquisition": "もえガチャ(福袋)\n初出260101",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-a46d53ad71-70",
    "name": "レゾナンス フォース",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "生命力",
        "min": 70.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 70.0,
    "cost": {
      "st": 9.0
    },
    "castTime": "100",
    "delay": "1100",
    "description": "特殊テクニックが使用可能になる\n使用可能技 →\nレゾナンスフォース使用技",
    "transfer": "",
    "acquisition": "リザードマン アーチャー\n錬金-第4弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-4184c496b0-70-70",
    "name": "絶断",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 70.0
      },
      {
        "skill": "精神力",
        "min": 70.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "130",
    "delay": "1930",
    "description": "魔力で武器を強化して切れ味を上げる技\n与える物理ダメージが一時的に増加する",
    "transfer": "○",
    "acquisition": "『ありふれた職業で世界最強』\nコラボガチャ\n初出250507",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-baa0991c89-70-70",
    "name": "縮地",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 70.0
      },
      {
        "skill": "キック",
        "min": 70.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "0",
    "delay": "1000",
    "description": "脚部に力を集中させて、爆発的な移動力で直線状の距離を詰める技※空中発動可能",
    "transfer": "",
    "acquisition": "『ありふれた職業で世界最強』\nコラボクエスト報酬\n250422〜250520",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-3305c17593-80-80",
    "name": "オーバー チャージ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 80.0
      },
      {
        "skill": "集中力",
        "min": 80.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 80.0,
    "cost": {
      "st": 46.0
    },
    "castTime": "450",
    "delay": "2250",
    "description": "膨大な魔力を一点へ収束させて、次に使用する攻撃魔法の威力を大幅に上昇させる\n※魔法以外の効果でも解除される\n※WarAgeでは上昇率が低下する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出260616",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-68e7633971-80",
    "name": "ガードレイジ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "着こなし",
        "min": 80.0
      }
    ],
    "successSkill": "着こなし",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "1650",
    "description": "ダメージを軽減し、効果中にダメージを受けると確率で一時的に攻撃力が上昇する\n発動に必要なBuff : デュエリスト マスタリー",
    "transfer": "",
    "acquisition": "錬金の箱\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-9d975ce75a-80-80",
    "name": "クイック ステップ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "キック",
        "min": 80.0
      },
      {
        "skill": "攻撃回避",
        "min": 80.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 80.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "50",
    "delay": "750",
    "description": "一瞬で対象との間合いをつめる",
    "transfer": "",
    "acquisition": "NPC販売(War奇跡)\n(※品)\n錬金-第8弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-a3851d577f-80-80",
    "name": "クロノス サークル",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 80.0
      },
      {
        "skill": "集中力",
        "min": 80.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "足元に時の魔法陣を召喚する\n※魔法陣の中にいるときに「 アクセラレート タイム 」の効果が付与される\n※右クリックで「 リバース タイム 」の効果が付与される",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出230411",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-d4200c81d1-80-80",
    "name": "グラビティアクシス",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 80.0
      },
      {
        "skill": "強化魔法",
        "min": 80.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "時間の流れが加速する特殊な領域を展開する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210427\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-b89c0254e0-80-80",
    "name": "グレート マジック サークル",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 80.0
      },
      {
        "skill": "魔法熟練",
        "min": 80.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "2400",
    "description": "巨大な魔法陣を展開して術者の魔力と詠唱速度を上昇させる\n使用アイテム : PNQ×３",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出190507\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-4001e29f24-80-80",
    "name": "セイクリッド フィールド",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 80.0
      },
      {
        "skill": "神秘魔法",
        "min": 80.0
      }
    ],
    "successSkill": "回復魔法",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "2400",
    "description": "フィールド上に状態異常を無効化する聖域「 サンクチュアリ 」を展開する\n※魔法陣内にいるプレイヤーは勢力にかかわらず、状態異常を解除するBUFFが付与される\n※「 サンクチュアリ 」は一定時間が経過するか、一定ダメージで消滅する\n使用アイテム : PNQ×３",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出190702\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-bbf2a26d7e-80",
    "name": "ソウル スレイブ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "暗黒命令",
        "min": 80.0
      }
    ],
    "successSkill": "暗黒命令",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "180",
    "delay": "3000",
    "description": "召喚したペットに自分が受けたダメージを肩代わりさせる禁呪法\n※召喚したペットと距離が離れすぎていると効果を失う\n発動に必要なBuff : ネクロマンサー マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出220426",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-72e3a545d2-90-80",
    "name": "タケミカヅチ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 90.0
      },
      {
        "skill": "呪文抵抗力",
        "min": 80.0
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "120",
    "delay": "3720",
    "description": "己の肉体に雷の力を取り込み、反応速度を極限まで高める技\n※効果が切れると反動により、HP/ST/MPが激減する",
    "transfer": "",
    "acquisition": "もえガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-8dd741c6fb-80-90",
    "name": "パーフェクト ミミック",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "着こなし",
        "min": 80.0
      },
      {
        "skill": "物まね",
        "min": 90.0
      }
    ],
    "successSkill": "着こなし",
    "successRequired": 80.0,
    "cost": {},
    "castTime": "-",
    "delay": "-",
    "description": "※\n151110パッチ\nで仕様が変更されたため、\n物まねスキル\nの項目に移動\n※下記短評も移動",
    "transfer": "",
    "acquisition": "-",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "-"
  },
  {
    "id": "tech-2bc32507eb-e952091a44-90-80",
    "name": "ヒーローズ ファンタジア",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "音楽",
        "min": 90.0
      },
      {
        "skill": "強化魔法",
        "min": 80.0
      }
    ],
    "successSkill": "音楽",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "300",
    "delay": "1200",
    "description": "英雄譚を元に作られた幻想曲\nPTメンバーとペットの様々なステータスを上昇させる",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出250819",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-ba14b68620-80",
    "name": "フォース プロヴォーク",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 80.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "1750",
    "description": "強制的に敵意を引き寄せる挑発技\n発動に必要なBuff : ブレイブナイト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出260127",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-937f827a8a-80",
    "name": "ブラッド ムーン",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "牙",
        "min": 80.0
      }
    ],
    "successSkill": "牙",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "2200",
    "description": "赤き月が頭上に現れるとき、闇の力が開放されて、魔力と魔法詠唱速度が上昇する\n発動に必要なBuff : ネクロマンサー マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出221213",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-c1d14d94b4-80-80",
    "name": "マスター ストレングス",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 80.0
      },
      {
        "skill": "筋力",
        "min": 80.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "120",
    "delay": "1500",
    "description": "次の物理攻撃で与えるダメージが2倍以上になる\n※他の行動をとると技の効果はキャンセルされる",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出210323\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-3be51c9b3f-80-80",
    "name": "八卦蹴撃陣",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "キック",
        "min": 80.0
      },
      {
        "skill": "素手",
        "min": 80.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "2150",
    "description": "一時的にキックの威力と命中率を大幅に強化して、キック技のディレイを短縮する",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出190618",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-987197d3a5-80",
    "name": "勇健の術",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 80.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 80.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "120",
    "delay": "2120",
    "description": "身体を強化して毒や状態異常を解除し、一定時間防ぐ忍術\n発動に必要なBuff : アサシン マスタリー と 秘奥義",
    "transfer": "",
    "acquisition": "もえガチャ\n171107",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-4db042258e-80",
    "name": "石化の術",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "物まね",
        "min": 80.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 80.0,
    "cost": {
      "st": 39.0
    },
    "castTime": "120",
    "delay": "2320",
    "description": "大きな石に変化して自然と一体化することで敵を欺く忍術\n※移動や行動で術が解ける\n発動に必要なBuff : アサシン マスタリー と 秘奥義",
    "transfer": "",
    "acquisition": "もえガチャ\n171107",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-7d88ba0275-80",
    "name": "風魔手裏剣",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "投げ",
        "min": 80.0
      }
    ],
    "successSkill": "投げ",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "150",
    "delay": "600",
    "description": "高い威力と補正能力を持つ卍型の巨大な手裏剣を召喚する。\n発動に必要なBuff : アサシン マスタリー",
    "transfer": "",
    "acquisition": "錬金の箱\n初出200428",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-boost-10-90",
    "name": "Boost",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "生命力",
        "min": 90.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 90.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "3000",
    "delay": "1800",
    "description": "赤龍帝の力で攻撃力依存の攻撃で与えるダメージが5%上昇するが、STとMPの消費も5%増加する\n※生命スキル依存で最大5段階まで連続チャージ可能、連続チャージするごとに上昇量が2倍になる\n※チャージ中ジャンプでキャンセル可能、さらにジャンプで解除可能\n※WarAgeでは効果がない\n発動に必要なBuff :\n赤龍帝の力",
    "transfer": "",
    "acquisition": "クエスト(前提装備)\nもえガチャ(前提装備)\n(D×Dコラボ)\n初出230207",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "○"
  },
  {
    "id": "tech-2bc32507eb-867f527d09-90",
    "name": "キャッチ ターゲット",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "釣り",
        "min": 90.0
      }
    ],
    "successSkill": "釣り",
    "successRequired": 90.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "595",
    "delay": "800",
    "description": "極めし者の技 地上の獲物も軽々と釣り上げる\n発動に必要なBuff : 海戦士 マスタリー\n釣竿装備時のみ使用可能",
    "transfer": "",
    "acquisition": "クエスト報酬\n錬金-第2弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-ee9f6e4afb-90",
    "name": "ギガンテック モード",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "着こなし",
        "min": 90.0
      }
    ],
    "successSkill": "着こなし",
    "successRequired": 90.0,
    "cost": {
      "st": 35.0
    },
    "castTime": "200",
    "delay": "2000",
    "description": "巨大化して攻撃力と移動速度が上昇する。\n※ジャンプで解除可能\n※Warageでは効果が無い。\n発動に必要なBuff :\n超合金ボディ",
    "transfer": "×",
    "acquisition": "ギガントマキナ装備セット（染色可）\n装備セット(前提装備)\n初出231121",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-4f16b08c5c-90-90-90-90-90-90-90-90",
    "name": "ゴッド ハンド",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "鍛冶",
        "min": 90.0
      },
      {
        "skill": "裁縫",
        "min": 90.0
      },
      {
        "skill": "木工",
        "min": 90.0
      },
      {
        "skill": "複製",
        "min": 90.0
      },
      {
        "skill": "料理",
        "min": 90.0
      },
      {
        "skill": "醸造",
        "min": 90.0
      },
      {
        "skill": "薬調合",
        "min": 90.0
      }
    ],
    "successSkill": "鍛冶",
    "successRequired": 90.0,
    "cost": {
      "st": 25.0
    },
    "castTime": "150",
    "delay": "30300",
    "description": "極めしものが到達できる領域\n使用アイテム : ゴッドアイ",
    "transfer": "",
    "acquisition": "錬金-第4弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-d9af17d54d-90",
    "name": "シークレット シーフ",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "盗み",
        "min": 90.0
      }
    ],
    "successSkill": "盗み",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "140",
    "delay": "1640",
    "description": "集中力を高めて 一定時間 盗める確率を上昇させる\n発動に必要なBuff : スパイ マスタリー or アドベンチャラー マスタリー",
    "transfer": "",
    "acquisition": "錬金-GENERATIONS\n錬金-第9弾\n火竜神殿-宝箱",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-08946663f3-90",
    "name": "ダークネス フォース",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "死の魔法",
        "min": 90.0
      }
    ],
    "successSkill": "死の魔法",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "300",
    "delay": "9999",
    "description": "自らの命を生贄に捧げ 闇の力を得る\n※身体能力が大幅に上昇するが 一定時間後に術者は死ぬ\n発動に必要なBuff : イビルナイト マスタリー",
    "transfer": "",
    "acquisition": "錬金-第7弾\n錬金-第8弾\n錬金-Fancy\n錬金-Light\nトレジャー マップ ＜ イプス峡谷 特殊1 ＞",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-1a52fbbc25-90-90-90-90-90",
    "name": "プロストレイト",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 90.0
      },
      {
        "skill": "攻撃回避",
        "min": 90.0
      },
      {
        "skill": "筋力",
        "min": 90.0
      },
      {
        "skill": "包帯",
        "min": 90.0
      },
      {
        "skill": "精神力",
        "min": 90.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 90.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "240",
    "delay": "1200",
    "description": "威厳に満ちたオーラで周囲の敵を平伏させる\n1の固定ダメージ",
    "transfer": "",
    "acquisition": "アクセル(War)\nミクル(War)\n錬金-第1弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-c211d9820b-90-90-90-90-90-90-90",
    "name": "忍 マスタリー",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "刀剣",
        "min": 90.0
      },
      {
        "skill": "罠",
        "min": 90.0
      },
      {
        "skill": "物まね",
        "min": 90.0
      },
      {
        "skill": "自然調和",
        "min": 90.0
      },
      {
        "skill": "薬調合",
        "min": 90.0
      },
      {
        "skill": "落下耐性",
        "min": 90.0
      },
      {
        "skill": "投げ",
        "min": 90.0
      }
    ],
    "successSkill": "刀剣",
    "successRequired": 90.0,
    "cost": {
      "st": 0.0
    },
    "castTime": "20",
    "delay": "20",
    "description": "ダイアロス島のあらゆる忍を打ち倒し、真の忍となった証。\nその身は軽く、鋭く、靭やかに。",
    "transfer": "",
    "acquisition": "クエスト報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5"
  },
  {
    "id": "tech-2bc32507eb-af5e755fac-90",
    "name": "瞬間移動",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 90.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "90",
    "delay": "690",
    "description": "対象のNPCの位置へ瞬時に移動する\n発動に必要なBuff :\n戦闘データ <ザハーク>",
    "transfer": "×",
    "acquisition": "クエスト(ひっとの戦闘訓練)\nポイント報酬(前提装備)\n230523実装",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-e4e2f6103f-90-90",
    "name": "限界突破",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 90.0
      },
      {
        "skill": "神秘魔法",
        "min": 90.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 90.0,
    "cost": {
      "st": 80.0
    },
    "castTime": "200",
    "delay": "18200",
    "description": "MPを消費して一定時間、自身の身体能力を20%上昇させるが、自然回復が停止して、徐々にHPが減少する",
    "transfer": "○",
    "acquisition": "『ありふれた職業で世界最強』\nコラボガチャ\n初出250422",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-85e65f9a45-90-90",
    "name": "霧隠れの術",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 90.0
      },
      {
        "skill": "物まね",
        "min": 90.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 90.0,
    "cost": {
      "st": 100.0
    },
    "castTime": "200",
    "delay": "4000",
    "description": "自分の周りに霧を発生させて味方の姿を隠す\n→\nタゲ切り技\n発動に必要なBuff : アサシン マスタリー",
    "transfer": "",
    "acquisition": "忍者\n錬金-第2弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": "×"
  },
  {
    "id": "tech-2bc32507eb-c8bc031bdf-90-90-90",
    "name": "霧隠暗殺術",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 90.0
      },
      {
        "skill": "物まね",
        "min": 90.0
      },
      {
        "skill": "刀剣",
        "min": 90.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 90.0,
    "cost": {
      "st": 100.0
    },
    "castTime": "10",
    "delay": "10010",
    "description": "暗殺者の秘奥義から発展した絶技\n濃霧に紛れたその姿は捉えることは出来ず、放たれる一撃は必ず不意打ちとなる。\n発動に必要なBuff : アサシン マスタリー &\n忍\n& 霧隠れの術\n(いずれか1つではなく3つ全て必要)",
    "transfer": "",
    "acquisition": "クエスト報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-2bc32507eb-8ccbd24c05-150-150",
    "name": "ヒーロー タイム",
    "kind": "テクニック",
    "category": "複合技/補助",
    "requirements": [
      {
        "skill": "精神力",
        "min": 150.0
      },
      {
        "skill": "集中力",
        "min": 150.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 150.0,
    "cost": {
      "st": 100.0
    },
    "castTime": "110",
    "delay": "32400",
    "description": "全ステータスが跳ね上がり、どんな敵も一撃で倒し\nあらゆる攻撃が当たらず、大爆発に巻き込まれても平気になる",
    "transfer": "",
    "acquisition": "クエスト",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CA%E4%BD%F5",
    "move": ""
  },
  {
    "id": "tech-44ad679254-total-protection-1",
    "name": "Total Protection",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 1.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 1.0,
    "cost": {
      "st": 5.0
    },
    "castTime": "300",
    "delay": "35300",
    "description": "一度だけ物理ダメージを軽減することができる\n※ダメージを93％防ぐ。ダメージを受けると効果消滅\n※マカフィー シールドを装備すると必要Buff点灯\n発動に必要なBuff : Total Protection Service",
    "transfer": "",
    "acquisition": "'10 Get！マカフィーシールドキャンペーン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "○"
  },
  {
    "id": "tech-44ad679254-d6a4ca9386-1",
    "name": "アンチ マジック シェル",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "精神力",
        "min": 1.0
      }
    ],
    "successSkill": "精神力",
    "successRequired": 1.0,
    "cost": {
      "st": 30.0
    },
    "castTime": "150",
    "delay": "2200",
    "description": "一時的に魔法のダメージを軽減するバリアを展開する\n発動に必要なBuff :\nシェル ガード",
    "transfer": "×",
    "acquisition": "もえガチャ(前提装備)\n初出220712",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-63c1b5104b-1",
    "name": "ドッジ マント",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "攻撃回避",
        "min": 1.0
      }
    ],
    "successSkill": "攻撃回避",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "100",
    "delay": "1300",
    "description": "ひらりとマントで物理攻撃や魔法を防ぐ\n発動に必要なBuff :\n高貴な騎士\nor\n破邪の力",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出201110",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-03f567d51b-1",
    "name": "プロテクション バリア",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "生命力",
        "min": 1.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 1.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "120",
    "delay": "1300",
    "description": "攻撃や魔法から身を守る保護障壁を展開する\n発動に必要なBuff :\nオート プロテクション",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出221129",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-90df9b60cb-1",
    "name": "地蔵変化",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "物まね",
        "min": 1.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 1.0,
    "cost": {
      "st": 20.0
    },
    "castTime": "120",
    "delay": "1120",
    "description": "地蔵に変身して物理攻撃を防ぐ\n※変身中は移動、行動不可\n発動に必要なBuff : 大きな葉っぱ",
    "transfer": "",
    "acquisition": "錬金-第6弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-ff3f5bb8f0-30-70-10",
    "name": "セイクリッド バリア",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 30.0
      },
      {
        "skill": "強化魔法",
        "min": 70.0
      },
      {
        "skill": "死の魔法",
        "min": 10.0
      }
    ],
    "successSkill": "回復魔法",
    "successRequired": 30.0,
    "cost": {
      "st": 15.0
    },
    "castTime": "120",
    "delay": "1020",
    "description": "聖なる壁を展開し攻撃や魔法から身を守る\n信仰心は無くても何とかなる！！\n発動に必要な触媒 : ND1",
    "transfer": "",
    "acquisition": "クエスト報酬\n初出241119",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "○"
  },
  {
    "id": "tech-44ad679254-25e0a4b7f6-80-80-10",
    "name": "金剛の構え",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 80.0
      },
      {
        "skill": "着こなし",
        "min": 80.0
      },
      {
        "skill": "攻撃回避",
        "min": 10.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "200",
    "delay": "2200",
    "description": "その場から動けなくなるが、自分の防御力以下のダメージを無効化し、攻撃した者のヘイトを上昇させる\n※一撃で防御力以上のダメージを受けた場合、効果が解除される",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出220531",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-9322d1e792-60-20",
    "name": "バック フリップ",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "攻撃回避",
        "min": 60.0
      },
      {
        "skill": "パフォーマンス",
        "min": 20.0
      }
    ],
    "successSkill": "攻撃回避",
    "successRequired": 60.0,
    "cost": {
      "st": 27.0
    },
    "castTime": "20",
    "delay": "1220",
    "description": "連続でバク転を行うことで、攻撃の的を絞らせず回避する技\n※バク転中は徐々にスタミナを消費します\n※行動を行うと解除されます",
    "transfer": "○",
    "acquisition": "もえガチャ（夏袋）\n170801",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-bc33150bc6-30-70",
    "name": "ロック ミミック",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "物まね",
        "min": 30.0
      },
      {
        "skill": "神秘魔法",
        "min": 70.0
      }
    ],
    "successSkill": "物まね",
    "successRequired": 30.0,
    "cost": {
      "st": 40.0
    },
    "castTime": "60",
    "delay": "1260",
    "description": "イワへと姿を変え、自然と一体化して敵を欺く\n最大HP防御力、土属性が大幅上昇、回避が大幅に下がる\n発動に必要なBuff : マイン ビショップ マスタリー",
    "transfer": "○",
    "acquisition": "複製\n錬金-第1弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-bdc5f19e67-60-30",
    "name": "不浄衝撃盾",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "牙",
        "min": 60.0
      },
      {
        "skill": "盾",
        "min": 30.0
      }
    ],
    "successSkill": "牙",
    "successRequired": 60.0,
    "cost": {
      "st": 27.0
    },
    "castTime": "110",
    "delay": "1600",
    "description": "自分の周囲に赤黒い衝撃波を発生させ、防御と攻撃を同時に行う\n※発動時に自身に魔法無効化の効果と周囲にダメージ+ノックバック効果を与える",
    "transfer": "○",
    "acquisition": "もえガチャ\n170919",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-37fbd65342-30",
    "name": "氷鏡の壁",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "着こなし",
        "min": 30.0
      }
    ],
    "successSkill": "着こなし",
    "successRequired": 30.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "140",
    "delay": "1140",
    "description": "物理攻撃を防ぐ氷の壁を生成して、壁に触れた対象を凍らす\n発動に必要なBuff : 氷炎の使い手",
    "transfer": "",
    "acquisition": "もえガチャ\n初出190723",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-1654ecd580-40",
    "name": "アナライズ マジック",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 40.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 40.0,
    "cost": {
      "st": 21.0
    },
    "castTime": "120",
    "delay": "1620",
    "description": "魔法を瞬時に分析して無効化する\n発動に必要なBuff :\n反魔の匣",
    "transfer": "",
    "acquisition": "もえガチャ(前提装備)\n初出241022",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-5536e05a49-60-40",
    "name": "ブレイク カウンター",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 60.0
      },
      {
        "skill": "戦闘技術",
        "min": 40.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 60.0,
    "cost": {
      "st": 27.0
    },
    "castTime": "120",
    "delay": "1200",
    "description": "相手のガードブレイク技を防いでカウンターでスタンさせる技\n※通常の攻撃は防げない",
    "transfer": "×",
    "acquisition": "黒の廟堂",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-158c946598-40",
    "name": "呪いの藁人形",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 40.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 40.0,
    "cost": {
      "st": 21.0
    },
    "castTime": "135",
    "delay": "1200",
    "description": "藁人形でガード中に攻撃を受けた場合、藁人形の呪いを対象に発動する\n発動に必要なBuff : 藁人形の呪い\n*2",
    "transfer": "",
    "acquisition": "'17 7月 デイリークエスト2（仮）\n170711",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-4833099830-40",
    "name": "堅守の太刀",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 40.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 40.0,
    "cost": {
      "st": 19.0
    },
    "castTime": "90",
    "delay": "600",
    "description": "左手の武器で相手の攻撃を払い回避する\n※戦闘技術スキル値でディレイが短くなる\n発動に必要なBuff : サムライ マスタリー or\n武神流の極意\n使用アイテム : 左手近接武器",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出240625",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "○"
  },
  {
    "id": "tech-44ad679254-b47ac3c879-90-40",
    "name": "高速ツッコミ",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 90.0
      },
      {
        "skill": "死体回収",
        "min": 40.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "60",
    "delay": "400",
    "description": "ボケを拾い続けることで身に着けた鋭いツッコミで\n対象の攻撃や魔法を打ち消して無効化（Avoid）する",
    "transfer": "○",
    "acquisition": "もえガチャ\n180717",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-26194b147d-70-70-50",
    "name": "ドッジ ステップ",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "攻撃回避",
        "min": 70.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      },
      {
        "skill": "キック",
        "min": 50.0
      }
    ],
    "successSkill": "攻撃回避",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "0",
    "delay": "1200",
    "description": "華麗なステップで物理攻撃や魔法攻撃を回避する\n※行動でキャンセルされる",
    "transfer": "",
    "acquisition": "テクガチャ\n初出251104",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-4cdd76ef43-50",
    "name": "木ノ葉風陣の術",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 50.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "180",
    "delay": "1780",
    "description": "自分の周囲を特殊な木の葉で覆い物理ダメージを軽減する術\n発動に必要なBuff : アサシン マスタリー",
    "transfer": "◯",
    "acquisition": "'14 9月 課金キャンペーン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-13a786a81b-50-50",
    "name": "百花繚乱",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "ダンス",
        "min": 50.0
      },
      {
        "skill": "戦闘技術",
        "min": 50.0
      }
    ],
    "successSkill": "ダンス",
    "successRequired": 50.0,
    "cost": {
      "st": 23.0
    },
    "castTime": "180",
    "delay": "1600",
    "description": "花吹雪と共に高速で回転して敵の攻撃をはじき返し、魔法を無効化する防御技",
    "transfer": "◯",
    "acquisition": "ナイト リリィ装備セット（染色可）同梱\n*1",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-b728f8dc1d-60",
    "name": "アブソーブ ガード",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 60.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 60.0,
    "cost": {
      "st": 27.0
    },
    "castTime": "110",
    "delay": "1460",
    "description": "盾でダメージ回避した分のHPを回復するガード技\n※ダメージを完全回避した場合でも回復する上限は100となります\n発動に必要なBuff : ウォーリアー マスタリー\nor\nブレイブナイト マスタリー\nor\nパーフェクト・ウォリアー\nor\nシュッツァー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出191105",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-8abf81dee8-90-60",
    "name": "ウインドミル スピアー",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "槍",
        "min": 90.0
      },
      {
        "skill": "戦闘技術",
        "min": 60.0
      }
    ],
    "successSkill": "槍",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "135",
    "delay": "1650",
    "description": "槍を前方で高速回転させることで 敵の攻撃を跳ね返しダメージを与える\n両手槍専用",
    "transfer": "×",
    "acquisition": "黒の廟堂",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-d4a6a70b47-90-60",
    "name": "ウェポン ガード",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "戦闘技術",
        "min": 90.0
      },
      {
        "skill": "盾",
        "min": 60.0
      }
    ],
    "successSkill": "戦闘技術",
    "successRequired": 90.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "190",
    "delay": "900",
    "description": "装備している両手武器で敵の直接攻撃を防御する\n両手武器専用",
    "transfer": "◯",
    "acquisition": "NPC販売(War奇跡)\n(※品)\n錬金-初期〜第1弾\n錬金-第3〜3.5弾(特殊)\n錬金-第5弾(特殊)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-99747b754b-60-90",
    "name": "ヘイティング ガード",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 60.0
      },
      {
        "skill": "戦闘技術",
        "min": 90.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 60.0,
    "cost": {
      "st": 27.0
    },
    "castTime": "140",
    "delay": "1200",
    "description": "盾で敵の直接攻撃を弾き、対象のヘイトを上昇させて隙をつくる",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出241224",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-61cd281717-60-60",
    "name": "ミスト フォーム",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "牙",
        "min": 60.0
      },
      {
        "skill": "自然調和",
        "min": 60.0
      }
    ],
    "successSkill": "牙",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "60",
    "delay": "1000",
    "description": "霧に姿を変えて攻撃をかわす",
    "transfer": "◯",
    "acquisition": "錬金-第4弾(特殊)\n練金-第5.5弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-35b1611b1a-60",
    "name": "メドゥーサ ガード",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 60.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 60.0,
    "cost": {
      "st": 27.0
    },
    "castTime": "135",
    "delay": "1200",
    "description": "ガードに成功するとメドゥーサの瞳が発動して対象を石化させる\n発動に必要なBuff : アイギスの盾",
    "transfer": "",
    "acquisition": "もえガチャ\n170418",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-17bb60a0f3-60",
    "name": "桜花の魔鏡",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "自然調和",
        "min": 60.0
      }
    ],
    "successSkill": "自然調和",
    "successRequired": 60.0,
    "cost": {
      "st": 28.0
    },
    "castTime": "120",
    "delay": "1320",
    "description": "桜の花のような魔法陣を展開して魔法を跳ね返す\n発動に必要なBuff : ドルイド マスタリー\nor\n大自然の使者\nor\n森呪遣い",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出230322",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-e80c9408bd-70",
    "name": "かばう",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 70.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "20",
    "delay": "1300",
    "description": "味方一人のダメージを一定時間肩代わりする\n※Buffが付与されていても範囲外の場合はダメージを肩代わりしません。\n発動に必要なBuff : ブレイブナイト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ\n初出180515",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-8743cdc5af-70-70-70-70",
    "name": "ウツセミの術",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "罠",
        "min": 70.0
      },
      {
        "skill": "自然調和",
        "min": 70.0
      },
      {
        "skill": "投げ",
        "min": 70.0
      },
      {
        "skill": "薬調合",
        "min": 70.0
      }
    ],
    "successSkill": "罠",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "60",
    "delay": "1260",
    "description": "異国の物語から考案された暗殺術の一つ。\n睡眠毒粉を仕込んだ胴着を投げつけ、敵の視線を切り攻撃を防ぐと同時に相手の背後へと回り込む。\n視覚を奪い、意識を奪い、のちの一撃にて命を奪う。\n発動に必要なBuff : アサシン マスタリー",
    "transfer": "",
    "acquisition": "クエスト報酬",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-da6dcc262e-70-70",
    "name": "クロス カウンター",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "素手",
        "min": 70.0
      },
      {
        "skill": "攻撃回避",
        "min": 70.0
      }
    ],
    "successSkill": "素手",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "90",
    "delay": "1140",
    "description": "相手の攻撃をギリギリで交してカウンター気味にパンチを放つ",
    "transfer": "◯",
    "acquisition": "もえガチャ\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-b8d808773f-80-70",
    "name": "ゾーン タイム",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "攻撃回避",
        "min": 80.0
      },
      {
        "skill": "集中力",
        "min": 70.0
      }
    ],
    "successSkill": "攻撃回避",
    "successRequired": 80.0,
    "cost": {
      "st": 39.0
    },
    "castTime": "100",
    "delay": "1500",
    "description": "極度の集中状態となり、全ての物理攻撃を見切ることができる\n※効果中に行動した場合、集中力が途切れて効果が解除される",
    "transfer": "◯",
    "acquisition": "もえガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-915dade0a1-70-70",
    "name": "ファンタスティック ボディ",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "パフォーマンス",
        "min": 70.0
      },
      {
        "skill": "生命力",
        "min": 70.0
      }
    ],
    "successSkill": "パフォーマンス",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "320",
    "delay": "1000",
    "description": "鍛えぬかれたボディであらゆる攻撃を受け止める\n発動に必要なBuff : 荒くれ者 マスタリー\n素手専用(右手装備不可)",
    "transfer": "○",
    "acquisition": "グレート\n錬金-第2弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-71d3dddd97-90-70",
    "name": "プロテクト オーラ",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 90.0
      },
      {
        "skill": "神秘魔法",
        "min": 70.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "180",
    "delay": "1500",
    "description": "守りのオーラをPTメンバーへ飛ばし、一度だけ攻撃を軽減、又は無力化する",
    "transfer": "◯",
    "acquisition": "火竜神殿-宝箱\n錬金-第3.5弾\n錬金-第5弾",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-c7ee4235a0-70-70",
    "name": "マジック シュート",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "キック",
        "min": 70.0
      },
      {
        "skill": "戦闘技術",
        "min": 70.0
      }
    ],
    "successSkill": "キック",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "70",
    "delay": "1270",
    "description": "MPを消費して魔力を身に纏うことで相手の魔法を蹴り返すことができる",
    "transfer": "◯",
    "acquisition": "もえガチャ\n170214",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-d5ab90d893-70",
    "name": "リフレクト バリア",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 70.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "120",
    "delay": "1320",
    "description": "魔法の障壁で 魔法と遠距離攻撃を跳ね返す\n発動に必要なBuff : アルケミスト マスタリー",
    "transfer": "◯",
    "acquisition": "錬金-第7弾\n錬金-GENERATIONS",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-cd90993b9c-70-70",
    "name": "リプレイス マナ",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 70.0
      },
      {
        "skill": "神秘魔法",
        "min": 70.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "120",
    "delay": "2020",
    "description": "MPが0になるまで ダメージをMPで受ける\n※MP以上のダメージを受けた場合はHPが減ります\n※ジャンプキャンセル可",
    "transfer": "◯",
    "acquisition": "錬金-Fancy\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-a3d689691e-70-20",
    "name": "リベンジ スイング",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "こんぼう",
        "min": 70.0
      }
    ],
    "successSkill": "こんぼう",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "110",
    "delay": "1000",
    "description": "放たれた魔法や遠距離攻撃を打ち返す",
    "transfer": "×",
    "acquisition": "黒の廟堂",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-1246e11901-70-70",
    "name": "聖絶",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 70.0
      },
      {
        "skill": "強化魔法",
        "min": 70.0
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 70.0,
    "cost": {
      "st": 33.0
    },
    "castTime": "100",
    "delay": "1300",
    "description": "防御障壁を展開して、一度だけ攻撃を軽減、又は無効化する",
    "transfer": "×",
    "acquisition": "ありふれた職業で世界最強 season3\nコラボクエスト報酬\n250430〜250520",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-44ad679254-c7a9b3cae6-80-80",
    "name": "エンデュランス",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "生命力",
        "min": 80.0
      },
      {
        "skill": "持久力",
        "min": 80.0
      }
    ],
    "successSkill": "生命力",
    "successRequired": 80.0,
    "cost": {
      "st": 38.0
    },
    "castTime": "120",
    "delay": "2320",
    "description": "即死級のダメージを受けても一度だけ HPが1残り耐えることができる\n発動に必要なBuff : ウォーリアー マスタリー\nor\nブレイブナイト マスタリー\nor\nパーフェクト・ウォリアー",
    "transfer": "◯",
    "acquisition": "錬金-Fancy\nテクガチャ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-cd5253d227-90",
    "name": "キャッスル オブ ストーン",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 90.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "150",
    "delay": "7200",
    "description": "不動の構えを取ると同時に石の城砦のような防御力を発揮し、ごく短時間だがあらゆるダメージを受け止める\n発動に必要なBuff : ブレイブナイト マスタリー",
    "transfer": "○",
    "acquisition": "もえガチャ(ログホラコラボ)\n初出210720",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-7ba023ff3d-90",
    "name": "ネプチューン スキン",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "水泳",
        "min": 90.0
      }
    ],
    "successSkill": "水泳",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "180",
    "delay": "2000",
    "description": "海神の加護で水属性の攻撃を吸収して、回復に変換することができる。\n発動に必要なBuff : 海戦士 マスタリー",
    "transfer": "◯",
    "acquisition": "もえガチャ\n初出180410",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": "×"
  },
  {
    "id": "tech-44ad679254-c73cf26b89-90",
    "name": "プロテクト ガード",
    "kind": "テクニック",
    "category": "複合技/防御",
    "requirements": [
      {
        "skill": "盾",
        "min": 90.0
      }
    ],
    "successSkill": "盾",
    "successRequired": 90.0,
    "cost": {
      "st": 45.0
    },
    "castTime": "120",
    "delay": "1920",
    "description": "範囲内にいるPTメンバーのダメージを一定時間肩代わりする\n※Buffが付与されていないPTメンバーとBuffが付与されていても\n範囲外のPTメンバーのダメージは肩代わりしません。\n発動に必要なBuff : ウォーリアー マスタリー\nor\nブレイブナイト マスタリー",
    "transfer": "×",
    "acquisition": "黒の廟堂\n170321",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CA%A3%B9%E7%B5%BB/%CB%C9%B8%E6",
    "move": ""
  },
  {
    "id": "tech-a535760389-e17312845d-1",
    "name": "アニマル フェイタライズ",
    "kind": "テクニック",
    "category": "調教",
    "requirements": [
      {
        "skill": "調教",
        "min": 1
      }
    ],
    "successSkill": "調教",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "150",
    "delay": "650",
    "description": "動物を手なずけ従わせる\n※警戒を解くこともできる\n警戒を解くこともできる、とあるが\nタゲ切り\n効果は無い",
    "transfer": "×",
    "acquisition": "NPC販売\nクエスト報酬(フォレール)",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C4%B4%B6%B5"
  },
  {
    "id": "tech-a535760389-92ec795d20-10",
    "name": "チェリッシング",
    "kind": "テクニック",
    "category": "調教",
    "requirements": [
      {
        "skill": "調教",
        "min": 10
      }
    ],
    "successSkill": "調教",
    "successRequired": 10,
    "cost": {
      "st": 8
    },
    "castTime": "220",
    "delay": "820",
    "description": "愛情を込めてペットをなで、ヒット・ポイント(HP)を回復させる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C4%B4%B6%B5"
  },
  {
    "id": "tech-a535760389-2bd8bceaf9-20",
    "name": "チアー ショット",
    "kind": "テクニック",
    "category": "調教",
    "requirements": [
      {
        "skill": "調教",
        "min": 20
      }
    ],
    "successSkill": "調教",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "120",
    "delay": "780",
    "description": "ペットに気合を入れて強化させる\nATK増加",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C4%B4%B6%B5"
  },
  {
    "id": "tech-a535760389-a87b5a1b92-30",
    "name": "ワーシップ ネイチャー",
    "kind": "テクニック",
    "category": "調教",
    "requirements": [
      {
        "skill": "調教",
        "min": 30
      }
    ],
    "successSkill": "調教",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "290",
    "delay": "2090",
    "description": "大いなる自然の力を借り、死亡したペットを生き返らせる\n※ワーシップドールを一つ消費します\nワーシップドールは一人一個制限あり",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C4%B4%B6%B5"
  },
  {
    "id": "tech-a535760389-1f4b9cd0d3-40",
    "name": "テラー ウィップ",
    "kind": "テクニック",
    "category": "調教",
    "requirements": [
      {
        "skill": "調教",
        "min": 40
      }
    ],
    "successSkill": "調教",
    "successRequired": 40,
    "cost": {
      "st": 5
    },
    "castTime": "150",
    "delay": "650",
    "description": "手で威嚇し 敵の\n召喚\nペットを追い払う",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C4%B4%B6%B5"
  },
  {
    "id": "tech-a535760389-20ca2e07e3-50",
    "name": "マンカインド フェイタライズ",
    "kind": "テクニック",
    "category": "調教",
    "requirements": [
      {
        "skill": "調教",
        "min": 50
      }
    ],
    "successSkill": "調教",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "150",
    "delay": "650",
    "description": "人型の敵を調教し従わせる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C4%B4%B6%B5"
  },
  {
    "id": "tech-a535760389-0060bbcc1c-60",
    "name": "パフォーミング ウィップ",
    "kind": "テクニック",
    "category": "調教",
    "requirements": [
      {
        "skill": "調教",
        "min": 60
      }
    ],
    "successSkill": "調教",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "110",
    "delay": "2510",
    "description": "ペットに特殊攻撃をさせる\n※ペットが特殊攻撃を使える状態の時のみ発動する",
    "transfer": "×",
    "acquisition": "コボルトブリーダー\nそんなエサに俺様がクマ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C4%B4%B6%B5"
  },
  {
    "id": "tech-a535760389-7419a4c8bb-70",
    "name": "ミラクル ケイジ",
    "kind": "テクニック",
    "category": "調教",
    "requirements": [
      {
        "skill": "調教",
        "min": 70
      }
    ],
    "successSkill": "調教",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "60",
    "delay": "560",
    "description": "ペットをアイテム化する\n※アニマル ケイジを一つ使用します\nアニマルケイジは何度でも使用可能",
    "transfer": "×",
    "acquisition": "NPC販売(ヌブールの村)\nコボルトブリーダー\nそんなエサに俺様がクマ\nサベージ キング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C4%B4%B6%B5"
  },
  {
    "id": "tech-a535760389-d4ffbe37ca-80",
    "name": "ドラゴン フェイタライズ",
    "kind": "テクニック",
    "category": "調教",
    "requirements": [
      {
        "skill": "調教",
        "min": 80
      }
    ],
    "successSkill": "調教",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "150",
    "delay": "650",
    "description": "地上最強と謳われる竜族を従わせる",
    "transfer": "×",
    "acquisition": "ベビードラゴン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C4%B4%B6%B5"
  },
  {
    "id": "tech-a535760389-de2d6ff18d-90",
    "name": "ドミニオン",
    "kind": "テクニック",
    "category": "調教",
    "requirements": [
      {
        "skill": "調教",
        "min": 90
      }
    ],
    "successSkill": "調教",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "77",
    "delay": "577",
    "description": "魂をペットに乗り移らせ ペットを操作できるようになる\n※乗り移っている間 ペットに負担がかかり、徐々にHPが減少していく\nペットの姿が消え、ペットの姿で行動できる\n変身中は空腹・渇き・酔いモーションを無視",
    "transfer": "×",
    "acquisition": "コボルトブリーダー\nそんなエサに俺様がクマ\nサベージナイト\nサベージランサーロード\nサベージドルイドロード\nサベージ キング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%C4%B4%B6%B5"
  },
  {
    "id": "tech-1123b9a9c5-a186a6346e-1",
    "name": "ボーンレス",
    "kind": "テクニック",
    "category": "酩酊",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 1
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "170",
    "delay": "910",
    "description": "酔った状態で予測不可能な動きをして攻撃をかわす\n※効果終了後、隙が少し出来てしまう\n近接物理攻撃を防ぐガード技\n鈍足化するが移動可能\n効果中に発生した相手の攻撃はクリティカルになる",
    "transfer": "×",
    "acquisition": "NPC販売\nグレート\nアントニー\nレスラー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%EE%C9%EE%C4",
    "move": "△",
    "range": "-"
  },
  {
    "id": "tech-1123b9a9c5-fbf9a708eb-10",
    "name": "リカバー センス",
    "kind": "テクニック",
    "category": "酩酊",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 10
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 10,
    "cost": {
      "st": 8
    },
    "castTime": "130",
    "delay": "350",
    "description": "自分の顔を激しく叩いて 酔いを醒ます\n※逃走したい時などに使用する",
    "transfer": "×",
    "acquisition": "NPC販売\nグレート\nアントニー\nレスラー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%EE%C9%EE%C4",
    "move": "○",
    "range": "-"
  },
  {
    "id": "tech-1123b9a9c5-5c27000c47-20",
    "name": "マイティー グラブ",
    "kind": "テクニック",
    "category": "酩酊",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 20
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "120",
    "delay": "820",
    "description": "敵の足元にまとわりつき 動きを封じる",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネスガード(尼巣)\nグレート\nアントニー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%EE%C9%EE%C4",
    "move": "×",
    "range": "4.6"
  },
  {
    "id": "tech-1123b9a9c5-c72e152260-30",
    "name": "ストーン マッスル",
    "kind": "テクニック",
    "category": "酩酊",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 30
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "165",
    "delay": "800",
    "description": "体を石のように堅くし全ての攻撃を高確率で無効化する\nボーンレスの上位技で、遠隔と魔法もAvoid可能。\n近接武器を装備している時は使用不可。(ナックルは例外、遠隔武器の弓や銃器もOK)\nナックル装備中のみ 戦技によるST回復の恩恵を得られる",
    "transfer": "×",
    "acquisition": "NPC販売\nストーンゴーレム系\nグレート\nアントニー\nレスラー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%EE%C9%EE%C4",
    "move": "×",
    "range": "-"
  },
  {
    "id": "tech-1123b9a9c5-0e5594c38b-40",
    "name": "センスレス",
    "kind": "テクニック",
    "category": "酩酊",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 40
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "120",
    "delay": "920",
    "description": "死んだふりをして敵を欺く\n※寝ている間は HP回復速度が上昇するが防御力が落ちる\n→\nタゲ切り技\n移動・ディレイ付の行動を取ると解除される",
    "transfer": "×",
    "acquisition": "NPC販売\nアマゾネスガード(尼巣)\nグレート\nアントニー\nレスラー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%EE%C9%EE%C4",
    "move": "×",
    "range": "-"
  },
  {
    "id": "tech-1123b9a9c5-6529ea1654-50",
    "name": "ディザスター ナップ",
    "kind": "テクニック",
    "category": "酩酊",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 50
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "250",
    "delay": "850",
    "description": "耳を覆いたくなるほど大きなイビキをかき 敵の攻撃を妨害する\n（ダメージを受けることで、効果は解除される）\n自分中心の範囲技。レジスト判定有り\n一定時間だけ対象に自分へのターゲットを不可能にする",
    "transfer": "×",
    "acquisition": "NPC販売\nグレート\nアントニー\nレスラー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%EE%C9%EE%C4",
    "move": "×",
    "range": "(5.2)"
  },
  {
    "id": "tech-1123b9a9c5-5a6784c7fe-60",
    "name": "ドブロク スプレイ",
    "kind": "テクニック",
    "category": "酩酊",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 60
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "220",
    "delay": "920",
    "description": "酒を吹き付け 前方にいる対象のBuff効果を古いものから1つ剥がす\n前方範囲技",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ/ヌブール村)\nグレート\nアントニー\nレスラー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%EE%C9%EE%C4",
    "move": "○",
    "range": "(6.7)"
  },
  {
    "id": "tech-1123b9a9c5-1d93182ae5-70",
    "name": "ビッグバン フィスト",
    "kind": "テクニック",
    "category": "酩酊",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 70
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "180",
    "delay": "600",
    "description": "泥酔した状態で腕を振り回し 周囲の敵を攻撃する\n※範囲攻撃の効果\n威力は素手スキル依存（素手によるATK依存なので、ナックルの有無も影響）",
    "transfer": "×",
    "acquisition": "NPC販売\nグレート\nアントニー\nレスラー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%EE%C9%EE%C4",
    "move": "○",
    "range": "(5.0)"
  },
  {
    "id": "tech-1123b9a9c5-a95ab3890a-80",
    "name": "フレイム ブレス",
    "kind": "テクニック",
    "category": "酩酊",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 80
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "190",
    "delay": "850",
    "description": "口に酒を含み 敵に炎を吹き付ける\n※アルコール度数の高い酒が必要\n範囲攻撃",
    "transfer": "×",
    "acquisition": "ボビーイムサマス\nサベージナイト\nサベージランサーロード\nウォーター ウンディーネ\nギガース\nグレート\nアントニー\nレスラー（ニューター男）",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%EE%C9%EE%C4",
    "move": "○",
    "range": "5.0"
  },
  {
    "id": "tech-1123b9a9c5-5c8d124737-90",
    "name": "キヨミズ パッション",
    "kind": "テクニック",
    "category": "酩酊",
    "requirements": [
      {
        "skill": "酩酊",
        "min": 90
      }
    ],
    "successSkill": "酩酊",
    "successRequired": 90,
    "cost": {
      "st": 30
    },
    "castTime": "550",
    "delay": "2460",
    "description": "パーティのスタミナを吸収し 巨大なエネルギー弾を発動する\n※エネルギーを貯めた後に攻撃を受けると 効果が止まってしまう\n※自分を含めて2人以上のパーティを組んでいる時に発動可能\n自分中心の範囲攻撃\n魔法扱いで詠唱妨害あり、呪文抵抗で軽減\nPT全員が浮遊状態になる",
    "transfer": "×",
    "acquisition": "サベージナイト\nサベージランサーロード\nサベージドルイドロード\nウォーターウンディーネ\nキングザブール\nギガース\nグレート\nアントニー\nブラッド ゴーレム",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%EE%C9%EE%C4",
    "move": "○",
    "range": ""
  },
  {
    "id": "tech-fc98b99d37-2874fa22fb-10",
    "name": "エイム ファイアー",
    "kind": "テクニック",
    "category": "銃器",
    "requirements": [
      {
        "skill": "銃器",
        "min": 10
      }
    ],
    "successSkill": "銃器",
    "successRequired": 10,
    "cost": {
      "st": 15
    },
    "castTime": "140",
    "delay": "1600\n※",
    "description": "しゃがみ撃ちする\n移動は遅くなるが、命中率が大幅に上がる\n※ジャンプでキャンセル可能\n効果中は両手の武器スロットを換装できない",
    "transfer": "×",
    "acquisition": "NPC販売\n狙撃手ドワーフ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%C6%B4%EF"
  },
  {
    "id": "tech-fc98b99d37-a645d8f208-20",
    "name": "アサルト ファイアー",
    "kind": "テクニック",
    "category": "銃器",
    "requirements": [
      {
        "skill": "銃器",
        "min": 20
      }
    ],
    "successSkill": "銃器",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "120",
    "delay": "1700\n※",
    "description": "伏せ撃ちする\n移動できなくなるが 回避率と耐地属性が大幅に上昇する\n効果中は両手の武器スロットを換装できない\nエイムで上書きすることで解除できる",
    "transfer": "×",
    "acquisition": "NPC販売\n狙撃手ドワーフ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%C6%B4%EF"
  },
  {
    "id": "tech-fc98b99d37-676d14a002-30",
    "name": "ブラスト ファイアー",
    "kind": "テクニック",
    "category": "銃器",
    "requirements": [
      {
        "skill": "銃器",
        "min": 30
      }
    ],
    "successSkill": "銃器",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "86",
    "delay": "2000\n※",
    "description": "地面に向けて抱え銃を発砲する\n※反動で後ろ向きに飛び戦線離脱できる\n※スキル値によりディレイが短くなります\n装備している銃器と弾を使用する",
    "transfer": "×",
    "acquisition": "NPC販売\n狙撃手ドワーフ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%C6%B4%EF"
  },
  {
    "id": "tech-fc98b99d37-65964297a0-40",
    "name": "ダイイング ファイアー",
    "kind": "テクニック",
    "category": "銃器",
    "requirements": [
      {
        "skill": "銃器",
        "min": 40
      }
    ],
    "successSkill": "銃器",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "150\n(90)",
    "delay": "1900\n※",
    "description": "抱え銃を暴発させ 自分の周りの者に大ダメージを与える\n※抱え銃は使い物にならなくなり 自身も負傷してしまう\n自分中心の範囲攻撃",
    "transfer": "×",
    "acquisition": "NPC販売\n狙撃手ドワーフ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%C6%B4%EF"
  },
  {
    "id": "tech-fc98b99d37-e47ee2e1ff-50",
    "name": "キャノン プレイスメント",
    "kind": "テクニック",
    "category": "銃器",
    "requirements": [
      {
        "skill": "銃器",
        "min": 50
      }
    ],
    "successSkill": "銃器",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "20",
    "delay": "2000\n※",
    "description": "大砲や輸送機器などを設置する\n使用アイテム : ドワーヴン キャノン 1\n水中では使用できない\n大砲の使い方は\n下記参照",
    "transfer": "×",
    "acquisition": "NPC販売\n狙撃手ドワーフ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%C6%B4%EF"
  },
  {
    "id": "tech-fc98b99d37-28153f2260-60",
    "name": "キャノン リペア",
    "kind": "テクニック",
    "category": "銃器",
    "requirements": [
      {
        "skill": "銃器",
        "min": 60
      }
    ],
    "successSkill": "銃器",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "170",
    "delay": "2000\n※",
    "description": "設置されている大砲を修理する\n大砲のHPを大幅に回復する",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ)\n狙撃手ドワーフ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%C6%B4%EF"
  },
  {
    "id": "tech-fc98b99d37-28e0fca599-70",
    "name": "キャノン クラッシャー",
    "kind": "テクニック",
    "category": "銃器",
    "requirements": [
      {
        "skill": "銃器",
        "min": 70
      }
    ],
    "successSkill": "銃器",
    "successRequired": 70,
    "cost": {
      "st": 33
    },
    "castTime": "195",
    "delay": "5000",
    "description": "設置された大砲を破壊する\n装備している銃器と弾を使用する",
    "transfer": "×",
    "acquisition": "NPC販売(ヌブール村)\n狙撃手ドワーフ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%C6%B4%EF"
  },
  {
    "id": "tech-fc98b99d37-d047aa438c-80",
    "name": "キャノン コントロール",
    "kind": "テクニック",
    "category": "銃器",
    "requirements": [
      {
        "skill": "銃器",
        "min": 80
      }
    ],
    "successSkill": "銃器",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "170",
    "delay": "1700\n※",
    "description": "大砲に乗り込み弾を発射する\n※大砲の厚い装甲に守られて 防御力と攻撃力が上昇するが\n風属性の抵抗力と移動速度は落ちる\n※ジャンプすると大砲から出ることができる\n使用アイテム : ドワーヴン キャノン 1\n効果中は両手の武器スロットを換装できない",
    "transfer": "×",
    "acquisition": "狙撃手ドワーフ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%C6%B4%EF"
  },
  {
    "id": "tech-fc98b99d37-4f1df574ff-80",
    "name": "キャノン ディスチャージ",
    "kind": "テクニック",
    "category": "銃器",
    "requirements": [
      {
        "skill": "銃器",
        "min": 80
      }
    ],
    "successSkill": "銃器",
    "successRequired": 80,
    "cost": {
      "st": 45
    },
    "castTime": "400",
    "delay": "1200",
    "description": "乗り込んだ大砲から周囲を巻き込む強力な大砲の弾を発射する\n『キャノン コントロール』発動中か『ドワーヴン タンク』装備中のみ使用可能（140805修正）\n着弾点を中心とした範囲攻撃",
    "transfer": "×",
    "acquisition": "狙撃手ドワーフ\n情報員ドワーフ\n幹部ドワーフ\nゴッドファーザー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%C6%B4%EF"
  },
  {
    "id": "tech-fc98b99d37-3e512136fc-90",
    "name": "マッスル キャノン",
    "kind": "テクニック",
    "category": "銃器",
    "requirements": [
      {
        "skill": "銃器",
        "min": 90
      }
    ],
    "successSkill": "銃器",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "170",
    "delay": "2170\n※",
    "description": "大砲にパーティメンバーを詰めて遠くへ飛ばす\n使用者自身は飛べない",
    "transfer": "×",
    "acquisition": "狙撃手ドワーフ\nサベージ ナイト\nサベージ ランサーロード\nサベージ ドルイドロード\nファイアー ゴーレム\nフレイム ゴーレム\nキング ザブール",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%BD%C6%B4%EF"
  },
  {
    "id": "tech-6376c97463-323951e219-1",
    "name": "ベビースネークのエチュード",
    "kind": "テクニック",
    "category": "音楽",
    "requirements": [
      {
        "skill": "音楽",
        "min": 1
      }
    ],
    "successSkill": "音楽",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "250",
    "delay": "600",
    "description": "弱い力を守る抵抗の歌\nPTメンバーの呪文抵抗力を上昇させる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%BB%B3%DA",
    "move": "○",
    "range": "半径\n36.0"
  },
  {
    "id": "tech-6376c97463-b168185ef9-10",
    "name": "セイクリッド レクイエム",
    "kind": "テクニック",
    "category": "音楽",
    "requirements": [
      {
        "skill": "音楽",
        "min": 10
      }
    ],
    "successSkill": "音楽",
    "successRequired": 10,
    "cost": {
      "st": 9
    },
    "castTime": "250",
    "delay": "900",
    "description": "周囲にいるアンデッド系の敵を鎮める歌",
    "transfer": "×",
    "acquisition": "NPC販売\nイビル シンガー\nオーク プリースト\nタルタロッサ セイクリッド\nゴーレム クレリック\nブロンズ ゴーレム\nガイア",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%BB%B3%DA",
    "move": "○",
    "range": ""
  },
  {
    "id": "tech-6376c97463-24f9d9caf3-20",
    "name": "イクシオン マーチ",
    "kind": "テクニック",
    "category": "音楽",
    "requirements": [
      {
        "skill": "音楽",
        "min": 20
      }
    ],
    "successSkill": "音楽",
    "successRequired": 20,
    "cost": {
      "st": 11
    },
    "castTime": "800",
    "delay": "600",
    "description": "侵入者から身を守る歌\nPTメンバーの防御力を上昇させる。",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%BB%B3%DA",
    "move": "○",
    "range": ""
  },
  {
    "id": "tech-6376c97463-666cefa45f-30",
    "name": "アルケミスト ラプソディ",
    "kind": "テクニック",
    "category": "音楽",
    "requirements": [
      {
        "skill": "音楽",
        "min": 30
      }
    ],
    "successSkill": "音楽",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "250",
    "delay": "600",
    "description": "錬金術師の研究・苦悩・発見の唄\nPTメンバーの魔力を上昇させる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%BB%B3%DA",
    "move": "○",
    "range": ""
  },
  {
    "id": "tech-6376c97463-ba39cf5491-40",
    "name": "ファンガスの子守唄",
    "kind": "テクニック",
    "category": "音楽",
    "requirements": [
      {
        "skill": "音楽",
        "min": 40
      }
    ],
    "successSkill": "音楽",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "250",
    "delay": "900",
    "description": "寝つきの悪い子を瞬時に眠らせる子守唄\n自分以外のPTメンバーを深い眠りに誘い自然回復量を上昇させる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%BB%B3%DA",
    "move": "○",
    "range": ""
  },
  {
    "id": "tech-6376c97463-85702eb1f6-50",
    "name": "アビシニアン ワルツ",
    "kind": "テクニック",
    "category": "音楽",
    "requirements": [
      {
        "skill": "音楽",
        "min": 50
      }
    ],
    "successSkill": "音楽",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "250",
    "delay": "600",
    "description": "アビシニアンの軽快な動きを表現した唄\nPTメンバーの回避率を上昇させる",
    "transfer": "×",
    "acquisition": "NPC販売",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%BB%B3%DA",
    "move": "○",
    "range": ""
  },
  {
    "id": "tech-6376c97463-a0966bf7b4-60",
    "name": "シスター エモーション",
    "kind": "テクニック",
    "category": "音楽",
    "requirements": [
      {
        "skill": "音楽",
        "min": 60
      }
    ],
    "successSkill": "音楽",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "250",
    "delay": "900",
    "description": "反戦を祈る修道女の感情を表した歌\nPTメンバーのDebuff効果を古い順から１つ解除する",
    "transfer": "×",
    "acquisition": "イビル シンガー\nウォーター ウンディーネ\nサベージ キング\nThe Legend of Duelist\n[御庭番]",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%BB%B3%DA",
    "move": "○",
    "range": ""
  },
  {
    "id": "tech-6376c97463-138ea3e569-80",
    "name": "トライデント ブルース",
    "kind": "テクニック",
    "category": "音楽",
    "requirements": [
      {
        "skill": "音楽",
        "min": 80
      }
    ],
    "successSkill": "音楽",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "250",
    "delay": "900",
    "description": "12日間戦争で戦死したトライデント達の活躍の歌\n自分以外のPTメンバーのスタミナ消費量を軽減する",
    "transfer": "×",
    "acquisition": "イビル シンガー\nウォーター ウンディーネ\nサベージ キング",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%BB%B3%DA",
    "move": "○",
    "range": ""
  },
  {
    "id": "tech-6376c97463-8171a16892-90",
    "name": "レゾナンス ハーモニー",
    "kind": "テクニック",
    "category": "音楽",
    "requirements": [
      {
        "skill": "音楽",
        "min": 90
      }
    ],
    "successSkill": "音楽",
    "successRequired": 90,
    "cost": {
      "st": 45
    },
    "castTime": "300",
    "delay": "1200",
    "description": "古き時代と新しき時代を紡ぐ共鳴の唄\n聴く者を落ち着かせ HPを最大HPの25％分回復させる",
    "transfer": "×",
    "acquisition": "ウォーター ウンディーネ\nサベージ ナイト\nサベージ キング\nキング ザブール\nブラッド ゴーレム",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%B2%BB%B3%DA",
    "move": "○",
    "range": ""
  },
  {
    "id": "tech-fd3663265a-0051ec459e-1",
    "name": "メディテーション",
    "kind": "テクニック",
    "category": "魔法熟練",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 1
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 1,
    "cost": {
      "st": 5
    },
    "castTime": "500",
    "delay": "1400",
    "description": "精神を強く集中させて マナ・ポイント(MP)の回復速度を速める\n※発動時間中は少しずつスタミナ(ST)を消費する\n発動時間中(約8.4秒)は 移動以外の行動はできない\n一歩でも動くと効果は解除される。 →\nまとめ\n参照",
    "transfer": "○",
    "acquisition": "NPC販売\nガープ\nレイス(魔法使い)\nオークプリースト",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CB%E2%CB%A1%BD%CF%CE%FD"
  },
  {
    "id": "tech-fd3663265a-65135bb329-10",
    "name": "リジェクト マジック",
    "kind": "テクニック",
    "category": "魔法熟練",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 10
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 10,
    "cost": {
      "st": 9
    },
    "castTime": "100",
    "delay": "600",
    "description": "自分にかかっている有益な効果を一つ打ち消すことができる",
    "transfer": "×",
    "acquisition": "170418実装\n異端者\nスカルパスメイジ\nレッドライン\nサイドワインダー？\nウォーターウンディーネ（イプス・ガルムともDrop確認）\nピクシー シャドウ / ステンノ/ プロミネンス ワイバーン\n※ 複製不可",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CB%E2%CB%A1%BD%CF%CE%FD"
  },
  {
    "id": "tech-fd3663265a-1c36041cd4-20",
    "name": "ホーリー ブレス",
    "kind": "テクニック",
    "category": "魔法熟練",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 20
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 20,
    "cost": {
      "st": 15
    },
    "castTime": "170",
    "delay": "1549",
    "description": "一定時間 魔力が増加する",
    "transfer": "○",
    "acquisition": "NPC販売\n異端者\nスカルパスメイジ\nレッドライン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CB%E2%CB%A1%BD%CF%CE%FD"
  },
  {
    "id": "tech-fd3663265a-d0d951a27a-30",
    "name": "マジック ブースト",
    "kind": "テクニック",
    "category": "魔法熟練",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 30
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 30,
    "cost": {
      "st": 15
    },
    "castTime": "69",
    "delay": "869",
    "description": "魔法が届く範囲を広げる\n本来の魔法の射程に関わらず +3.0(固定)",
    "transfer": "○",
    "acquisition": "NPC販売\n異端者\nスカルパスメイジ\nレッドライン",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CB%E2%CB%A1%BD%CF%CE%FD"
  },
  {
    "id": "tech-fd3663265a-daf1068605-40",
    "name": "マナ プレッシャー",
    "kind": "テクニック",
    "category": "魔法熟練",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 40
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 40,
    "cost": {
      "st": 19
    },
    "castTime": "90",
    "delay": "1890",
    "description": "効果が切れるまでの間、MPの消費量が軽減される\nMP消費量が82％になる",
    "transfer": "○",
    "acquisition": "NPC販売\n異端者\nスカルパスメイジ\nウォーターウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CB%E2%CB%A1%BD%CF%CE%FD"
  },
  {
    "id": "tech-fd3663265a-36ec7a6cfa-50",
    "name": "スペル エクステンション",
    "kind": "テクニック",
    "category": "魔法熟練",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 50
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 50,
    "cost": {
      "st": 23
    },
    "castTime": "90",
    "delay": "1890",
    "description": "スペルブックに魔法をチャージしておける時間を延長する",
    "transfer": "○",
    "acquisition": "NPC販売\n異端者\nスカルパスメイジ\nウォーターウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CB%E2%CB%A1%BD%CF%CE%FD"
  },
  {
    "id": "tech-fd3663265a-2f13f76dbb-60",
    "name": "ホールド",
    "kind": "テクニック",
    "category": "魔法熟練",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 60
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 60,
    "cost": {
      "st": 28
    },
    "castTime": "50",
    "delay": "550",
    "description": "敵からの攻撃で 魔法の詠唱を妨害されにくくなる\n発動すると一瞬足が止まる",
    "transfer": "×",
    "acquisition": "NPC販売(夜間キャンプ)\nサイドワインダー\nウォーターウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CB%E2%CB%A1%BD%CF%CE%FD"
  },
  {
    "id": "tech-fd3663265a-4397b556fa-70",
    "name": "ホーリー リカバー",
    "kind": "テクニック",
    "category": "魔法熟練",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 70
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 70,
    "cost": {
      "st": 50
    },
    "castTime": "150",
    "delay": "10950",
    "description": "聖なる力が全身を包み込み マナ・ポイント(MP)が回復する\n発動すると足が止まる。ディレイは約3分",
    "transfer": "×",
    "acquisition": "NPC販売(ヌブール村)\nサイドワインダー",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CB%E2%CB%A1%BD%CF%CE%FD"
  },
  {
    "id": "tech-fd3663265a-044e1d5143-80",
    "name": "キャスティング ムーブ",
    "kind": "テクニック",
    "category": "魔法熟練",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 80
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 80,
    "cost": {
      "st": 38
    },
    "castTime": "90",
    "delay": "1890",
    "description": "詠唱中の移動速度を速める\n詠唱中の移動速度が1.2倍になる\nブックチャージには効果が無い\n一部の魔法(召喚系など)には効果が無い",
    "transfer": "×",
    "acquisition": "サイドワインダー\nマジックゴーレム\nサベージドルイド\nウォーターウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CB%E2%CB%A1%BD%CF%CE%FD"
  },
  {
    "id": "tech-fd3663265a-946aa55f66-90",
    "name": "ラピッド キャスト",
    "kind": "テクニック",
    "category": "魔法熟練",
    "requirements": [
      {
        "skill": "魔法熟練",
        "min": 90
      }
    ],
    "successSkill": "魔法熟練",
    "successRequired": 90,
    "cost": {
      "st": 44
    },
    "castTime": "150",
    "delay": "1750",
    "description": "魔法の詠唱を大幅に短縮することができる\n※効果継続中はマナ・ポイント(MP)の消費量が増える\nジャンプをすると効果が解除される\n詠唱時間を35%短縮/MP消費量は150%になる\nマナプレッシャーと併用で消費量120%",
    "transfer": "×",
    "acquisition": "サイドワインダー\nマジックゴーレム\nブラッド ゴーレム\nサベージドルイド\nサベージナイト\nサベージランサーロード\nサベージドルイドロード\nウォーターウンディーネ",
    "source": "MoERead",
    "sourceUrl": "https://moeread.stars.ne.jp/?%A5%B9%A5%AD%A5%EB/%BD%CF%CE%FD%28%B5%BB%29/%CB%E2%CB%A1%BD%CF%CE%FD"
  }
];
  const magic = [
  {
    "id": "magic-minor-burst",
    "name": "マイナー バースト",
    "category": "破壊魔法",
    "kind": "魔法",
    "requirements": [
      {
        "skill": "破壊魔法",
        "min": 1
      }
    ],
    "successSkill": "破壊魔法",
    "successRequired": 1,
    "mp": 5,
    "reagent": "ノア ダスト",
    "note": "サンプル。"
  },
  {
    "id": "magic-healing",
    "name": "ヒーリング",
    "category": "回復魔法",
    "kind": "魔法",
    "requirements": [
      {
        "skill": "回復魔法",
        "min": 10
      }
    ],
    "successSkill": "回復魔法",
    "successRequired": 10,
    "mp": 9,
    "reagent": "ノア ダスト",
    "note": "サンプル。"
  },
  {
    "id": "magic-buff",
    "name": "エンライテン",
    "category": "強化魔法",
    "kind": "魔法",
    "requirements": [
      {
        "skill": "強化魔法",
        "min": 20
      }
    ],
    "successSkill": "強化魔法",
    "successRequired": 20,
    "mp": 11,
    "reagent": "ノア ダスト",
    "note": "サンプル。"
  },
  {
    "id": "magic-mesmerize",
    "name": "メスメライズ",
    "category": "神秘魔法",
    "kind": "魔法",
    "requirements": [
      {
        "skill": "神秘魔法",
        "min": 40
      }
    ],
    "successSkill": "神秘魔法",
    "successRequired": 40,
    "mp": 23,
    "reagent": "ノア パウダー",
    "note": "サンプル。"
  }
];
  window.MOE_SKILL_SIM_KNOWLEDGE = {masteries, techniques, magic, source: {
  "masteries": "MoERead シップ/複合",
  "url": "https://moeread.stars.ne.jp/?シップ/複合",
  "techniques": "MoERead 熟練(技)・複合技・特殊 表内テクニック",
  "techniqueCategories": {
    "こんぼう": 8,
    "キック": 10,
    "シャウト": 9,
    "ダンス": 10,
    "パフォーマンス": 31,
    "刀剣": 8,
    "取引": 8,
    "弓": 7,
    "戦闘技術": 10,
    "投げ": 9,
    "暗黒命令": 12,
    "槍": 8,
    "牙": 9,
    "物まね": 12,
    "特殊": 77,
    "盗み": 7,
    "盾": 10,
    "素手": 9,
    "罠": 11,
    "自然調和": 9,
    "複合技/召喚": 96,
    "複合技/回復": 30,
    "複合技/攻撃": 226,
    "複合技/補助": 195,
    "複合技/防御": 41,
    "調教": 10,
    "酩酊": 10,
    "銃器": 10,
    "音楽": 9,
    "魔法熟練": 10
  }
}};
})();
