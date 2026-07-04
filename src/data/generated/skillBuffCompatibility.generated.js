// Generated skill buff compatibility data for Master of Epic physical damage tool.
// Source: uploaded MoE装備品Buff併用一覧.xlsx + uploaded MoE Wiki アイテム/追加効果/併用.
// Schema: compatible with current src/main.js skillBuffCompatibilityItems/applySkillBuffCompatibilityToEquipment.
// Encoding: UTF-8 with BOM for Windows PowerShell compatibility.
// ? / ？ groups are normalized for conflict judgement; original labels remain in groupRaw and groupTentative.
window.MOE_SKILL_BUFF_COMPATIBILITY_GENERATED = [
  {
    "id": "skillbuff:召喚魔法:A:黒魔術の書",
    "skillName": "召喚魔法",
    "skill": "召喚魔法",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:召喚魔法:A",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "黒魔術の書",
    "name": "黒魔術の書",
    "canonicalBuffName": "黒魔術の書",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "グリモアロッド"
    ],
    "notes": [
      "召還系魔法詠唱時間、ディレイ-30％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:召喚魔法:B:大賢者の知識",
    "skillName": "召喚魔法",
    "skill": "召喚魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:召喚魔法:B",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知識",
    "name": "大賢者の知識",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10/最大HP-20％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:召喚魔法:B:大賢者の知恵",
    "skillName": "召喚魔法",
    "skill": "召喚魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:召喚魔法:B",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知恵",
    "name": "大賢者の知恵",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "大賢者の知識",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10/最大HP-20％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:召喚魔法:C:叡智の力",
    "skillName": "召喚魔法",
    "skill": "召喚魔法",
    "group": "C",
    "groupRaw": "C?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:召喚魔法:C",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "叡智の力",
    "name": "叡智の力",
    "canonicalBuffName": "叡智の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "叡智の魔導書"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:A:ホーリーエンハンス",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:A",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "ホーリーエンハンス",
    "name": "ホーリーエンハンス",
    "canonicalBuffName": "ホーリーエンハンス",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "聖なる十字架",
      "星と月のストラ"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:A:双天使の加護",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:A",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "双天使の加護",
    "name": "双天使の加護",
    "canonicalBuffName": "双天使の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "双天使のリング"
    ],
    "notes": [
      "MP自然回復42/ｍ"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:A:天空の滅竜魔導士",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:A",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "天空の滅竜魔導士",
    "name": "天空の滅竜魔導士",
    "canonicalBuffName": "天空の滅竜魔導士",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ウェンディなりきりウィッグ"
    ],
    "notes": [
      "MP自然回復42/ｍ"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:A:錬金サポート",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:A",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "錬金サポート",
    "name": "錬金サポート",
    "canonicalBuffName": "錬金サポート",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ボダッハなりきりウィッグ",
      "ボダッハなりきりウィッグカラー"
    ],
    "notes": [
      "MP自然回復42/ｍ"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:B:プリンセスハート",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:B",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "プリンセスハート",
    "name": "プリンセスハート",
    "canonicalBuffName": "プリンセスハート",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "プリンセスグラデウィッグ",
      "プリンセススカート",
      "ハートライトウィッグ",
      "プリンセスドレス",
      "リボンオペラグローブ",
      "姫カットハーフツインウィッグ",
      "プリンセスショートウィッグ"
    ],
    "notes": [
      "光の精霊 が優先"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:B:光の精霊",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:B",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "光の精霊",
    "name": "光の精霊",
    "canonicalBuffName": "光の精霊",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ホワイトウィスプ"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:C:ホーリーメイデン",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "C",
    "groupRaw": "C",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:C",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "ホーリーメイデン",
    "name": "ホーリーメイデン",
    "canonicalBuffName": "ホーリーメイデン",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "メイデンクローク"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:C:新人魔法少女",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "C",
    "groupRaw": "C",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:C",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "新人魔法少女",
    "name": "新人魔法少女",
    "canonicalBuffName": "新人魔法少女",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スノーホワイトなりきり装備(染)"
    ],
    "notes": [
      "Buffは染色可能のみ"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:C:施療神官",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "C",
    "groupRaw": "C",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:C",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "施療神官",
    "name": "施療神官",
    "canonicalBuffName": "施療神官",
    "aliasOf": "",
    "aliases": [
      "治癒神官"
    ],
    "items": [
      "てとらなりきりウィッグ",
      "てとらなりきりウィッグカラー"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "official/Scrapbox name"
  },
  {
    "id": "skillbuff:回復魔法:C:治癒神官",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "C",
    "groupRaw": "C",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:C",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "治癒神官",
    "name": "治癒神官",
    "canonicalBuffName": "施療神官",
    "aliasOf": "施療神官",
    "aliases": [
      "治癒神官"
    ],
    "items": [
      "てとらなりきりウィッグ",
      "てとらなりきりウィッグカラー"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Scrapbox name"
  },
  {
    "id": "skillbuff:回復魔法:D:慈愛の力",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "D",
    "groupRaw": "D",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:D",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "慈愛の力",
    "name": "慈愛の力",
    "canonicalBuffName": "慈愛の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ホワイトエンジェルロッド"
    ],
    "notes": [
      "風精霊の加護が優先"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:D:風精霊の加護",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "D",
    "groupRaw": "D",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:D",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "風精霊の加護",
    "name": "風精霊の加護",
    "canonicalBuffName": "風精霊の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "エアリアルロッド",
      "背負いエアリアルロッド"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:E:永遠の献身",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "E",
    "groupRaw": "E",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:E",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "永遠の献身",
    "name": "永遠の献身",
    "canonicalBuffName": "永遠の献身",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ホワイトエンジェル装備"
    ],
    "notes": [
      "回復魔法の詠唱・ディレイ短縮15％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:F:月星の力",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "F",
    "groupRaw": "F",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:F",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "月星の力",
    "name": "月星の力",
    "canonicalBuffName": "月星の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "月星の帽子",
      "月星のウィッグ",
      "月星の耳飾り",
      "月星のコンタクト"
    ],
    "notes": [
      "MP自然回復42/ｍ"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:G:地母神の加護",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "G",
    "groupRaw": "G",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:G",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "地母神の加護",
    "name": "地母神の加護",
    "canonicalBuffName": "地母神の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "女神官なりきり装備",
      "女神官の錫杖"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:H:大司教",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "H",
    "groupRaw": "H",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:H",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大司教",
    "name": "大司教",
    "canonicalBuffName": "大司教",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "剣の乙女なりきり装備",
      "天秤剣"
    ],
    "notes": [
      "強化魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:I:聖母の微笑",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "I",
    "groupRaw": "I",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:I",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "聖母の微笑",
    "name": "聖母の微笑",
    "canonicalBuffName": "聖母の微笑",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "アーシアなりきりウィッグ",
      "アーシアなりきりウィッグカラー",
      "セクシーシスター装備"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:J:神聖な力",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "J",
    "groupRaw": "J",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:J",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "神聖な力",
    "name": "神聖な力",
    "canonicalBuffName": "神聖な力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "セイクリッドロングブーツ",
      "セイクリッドハープグローブ",
      "聖騎士の兜",
      "聖騎士のチャーム",
      "セイクリッドヴェール",
      "聖騎士の靴",
      "レースアイマスク"
    ],
    "notes": [
      "神秘魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:K:大魔導士",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "K",
    "groupRaw": "K",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:K",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "大魔導士",
    "name": "大魔導士",
    "canonicalBuffName": "大魔導士",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スペルマスターロングコート"
    ],
    "notes": [
      "ALC系魔法+5"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:K:戦乙女の力",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "K",
    "groupRaw": "K?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:K",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "戦乙女の力",
    "name": "戦乙女の力",
    "canonicalBuffName": "戦乙女の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ヴァルキリーアーマードレス"
    ],
    "notes": [
      "強化魔法+15％/魔力→攻撃変換10％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:K:高貴な心",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "K",
    "groupRaw": "K?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:K",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "高貴な心",
    "name": "高貴な心",
    "canonicalBuffName": "高貴な心",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ロイヤルハーツドレス"
    ],
    "notes": [
      "神秘魔法+15/無属性魔法15％UP"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:L:白薔薇の加護",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "L",
    "groupRaw": "L",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:L",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "白薔薇の加護",
    "name": "白薔薇の加護",
    "canonicalBuffName": "白薔薇の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "クラシックレースケープ"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:L:大賢者の知識",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "L",
    "groupRaw": "L?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:L",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知識",
    "name": "大賢者の知識",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:回復魔法:L:大賢者の知恵",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "L",
    "groupRaw": "L?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:L",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知恵",
    "name": "大賢者の知恵",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "大賢者の知識",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative",
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:回復魔法:M:オシリスの加護",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "M",
    "groupRaw": "M",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:M",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "オシリスの加護",
    "name": "オシリスの加護",
    "canonicalBuffName": "オシリスの加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "背負いクルック"
    ],
    "notes": [
      "死の魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:M:デボーテッド ラブ",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "M",
    "groupRaw": "M?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:M",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "デボーテッド ラブ",
    "name": "デボーテッド ラブ",
    "canonicalBuffName": "デボーテッド ラブ",
    "aliasOf": "",
    "aliases": [
      "デボーテッドラブ",
      "デポーデッドラブ"
    ],
    "items": [
      "バレンタインネックリボン"
    ],
    "notes": [
      "MP自然回復56.25/m"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:回復魔法:M:デボーテッドラブ",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "M",
    "groupRaw": "M?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:M",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "デボーテッドラブ",
    "name": "デボーテッドラブ",
    "canonicalBuffName": "デボーテッド ラブ",
    "aliasOf": "デボーテッド ラブ",
    "aliases": [
      "デボーテッドラブ",
      "デポーデッドラブ"
    ],
    "items": [
      "バレンタインネックリボン"
    ],
    "notes": [
      "MP自然回復56.25/m"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative",
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:回復魔法:M:デポーデッドラブ",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "M",
    "groupRaw": "M?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:M",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "デポーデッドラブ",
    "name": "デポーデッドラブ",
    "canonicalBuffName": "デボーテッド ラブ",
    "aliasOf": "デボーテッド ラブ",
    "aliases": [
      "デボーテッドラブ",
      "デポーデッドラブ"
    ],
    "items": [
      "バレンタインネックリボン"
    ],
    "notes": [
      "MP自然回復56.25/m"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative",
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:回復魔法:M:英雄の翼",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "M",
    "groupRaw": "M?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:M",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "英雄の翼",
    "name": "英雄の翼",
    "canonicalBuffName": "英雄の翼",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ヒロイックウイング"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:N:マジックチャーム",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "N",
    "groupRaw": "N",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:N",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "マジックチャーム",
    "name": "マジックチャーム",
    "canonicalBuffName": "マジックチャーム",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ウィッチハットチャーム"
    ],
    "notes": [
      "ALC系魔法+5/大魔同士と併用可能"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:O:上級魔術師",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "O",
    "groupRaw": "O",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:O",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "上級魔術師",
    "name": "上級魔術師",
    "canonicalBuffName": "上級魔術師",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ツインブレイドロングウィッグ"
    ],
    "notes": [
      "破壊+15"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:O:錬金術の極意",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "O",
    "groupRaw": "O?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:O",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "錬金術の極意",
    "name": "錬金術の極意",
    "canonicalBuffName": "錬金術の極意",
    "aliasOf": "",
    "aliases": [
      "魔術師の極意"
    ],
    "items": [
      "シングルブレイドウィッグ"
    ],
    "notes": [
      "ALC系魔法+10/生産MG枠+2"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki table / likely spreadsheet typo for Single Blade Wig"
  },
  {
    "id": "skillbuff:回復魔法:O:魔術師の極意",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "O",
    "groupRaw": "O?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:O",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "魔術師の極意",
    "name": "魔術師の極意",
    "canonicalBuffName": "錬金術の極意",
    "aliasOf": "錬金術の極意",
    "aliases": [
      "魔術師の極意"
    ],
    "items": [
      "シングルブレイドウィッグ"
    ],
    "notes": [
      "ALC系魔法+10/生産MG枠+2"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative",
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki table / likely spreadsheet typo for Single Blade Wig"
  },
  {
    "id": "skillbuff:回復魔法:P:法力",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "P",
    "groupRaw": "P",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:P",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "法力",
    "name": "法力",
    "canonicalBuffName": "法力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "毘盧帽"
    ],
    "notes": [
      "強化魔法+10/不死特効1.25倍"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:Q:魔法陣ブースト",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "Q",
    "groupRaw": "Q",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:Q",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "魔法陣ブースト",
    "name": "魔法陣ブースト",
    "canonicalBuffName": "魔法陣ブースト",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "マジックレザーグローブ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:R:天職：治癒師",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "R",
    "groupRaw": "R",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:R",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "天職：治癒師",
    "name": "天職：治癒師",
    "canonicalBuffName": "天職：治癒師",
    "aliasOf": "",
    "aliases": [
      "転職：治癒師"
    ],
    "items": [
      "白崎香織なりきり装備"
    ],
    "notes": [
      "神秘魔法+10/消費MP10％軽減"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "Scrapbox/Wiki name"
  },
  {
    "id": "skillbuff:回復魔法:R:転職：治癒師",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "R",
    "groupRaw": "R",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:R",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "転職：治癒師",
    "name": "転職：治癒師",
    "canonicalBuffName": "天職：治癒師",
    "aliasOf": "天職：治癒師",
    "aliases": [
      "転職：治癒師"
    ],
    "items": [
      "白崎香織なりきり装備"
    ],
    "notes": [
      "神秘魔法+10/消費MP10％軽減"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Scrapbox/Wiki name"
  },
  {
    "id": "skillbuff:回復魔法:S:天使の音色",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "S",
    "groupRaw": "S",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:S",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "天使の音色",
    "name": "天使の音色",
    "canonicalBuffName": "天使の音色",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "天使のハープ"
    ],
    "notes": [
      "音楽+5"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:S:叡智の力",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "S",
    "groupRaw": "S?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:S",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "叡智の力",
    "name": "叡智の力",
    "canonicalBuffName": "叡智の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "叡智の魔導書"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:T:レゾナンスムーン",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "T",
    "groupRaw": "T",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:T",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "レゾナンスムーン",
    "name": "レゾナンスムーン",
    "canonicalBuffName": "レゾナンスムーン",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "クレセントムーン",
      "ムーンフォースティアラ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:U:女王の威厳",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "U",
    "groupRaw": "U",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:回復魔法:U",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "女王の威厳",
    "name": "女王の威厳",
    "canonicalBuffName": "女王の威厳",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ワンドオブクイーン"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:回復魔法:V:回復の極意",
    "skillName": "回復魔法",
    "skill": "回復魔法",
    "group": "V",
    "groupRaw": "V?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:回復魔法:V",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "回復の極意",
    "name": "回復の極意",
    "canonicalBuffName": "回復の極意",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "聖職者の帽子"
    ],
    "notes": [],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:A:大地の加護",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:A",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大地の加護",
    "name": "大地の加護",
    "canonicalBuffName": "大地の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "タイタンロッド",
      "背負いタイタン"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:B:マジカル サポート",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:B",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "マジカル サポート",
    "name": "マジカル サポート",
    "canonicalBuffName": "マジカル サポート",
    "aliasOf": "",
    "aliases": [
      "マジカルサポート"
    ],
    "items": [
      "スクワラルファミリア",
      "マジカルキャット",
      "マジカルラブリーウォッチ"
    ],
    "notes": [
      "MP消費軽減5％",
      "優先度 マジカル サポート > 神に仕える者 > 呪術師の極意"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki/Scrapbox spacing"
  },
  {
    "id": "skillbuff:強化魔法:B:マジカルサポート",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:B",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "マジカルサポート",
    "name": "マジカルサポート",
    "canonicalBuffName": "マジカル サポート",
    "aliasOf": "マジカル サポート",
    "aliases": [
      "マジカルサポート"
    ],
    "items": [
      "スクワラルファミリア",
      "マジカルキャット",
      "マジカルラブリーウォッチ"
    ],
    "notes": [
      "MP消費軽減5％",
      "優先度 マジカル サポート > 神に仕える者 > 呪術師の極意"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki/Scrapbox spacing"
  },
  {
    "id": "skillbuff:強化魔法:B:呪術師の極意",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:B",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "呪術師の極意",
    "name": "呪術師の極意",
    "canonicalBuffName": "呪術師の極意",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ダークシャーマン装備",
      "呪術師の仮面"
    ],
    "notes": [
      "優先度:マジカルサポ＞神仕＞ダクシャ",
      "優先度 マジカル サポート > 神に仕える者 > 呪術師の極意"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:B:神に仕える者",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:B",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "神に仕える者",
    "name": "神に仕える者",
    "canonicalBuffName": "神に仕える者",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "巫女セット"
    ],
    "notes": [
      "強化魔法詠唱速度・ディレイ-15％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:C:悪魔の瞳",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "C",
    "groupRaw": "C",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:C",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "悪魔の瞳",
    "name": "悪魔の瞳",
    "canonicalBuffName": "悪魔の瞳",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "デビルアイ"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:C:強化の魔石",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "C",
    "groupRaw": "C?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:強化魔法:C",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "強化の魔石",
    "name": "強化の魔石",
    "canonicalBuffName": "強化の魔石",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ノーブルジャボ"
    ],
    "notes": [
      "魔力+3％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:C:英雄の翼",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "C",
    "groupRaw": "C?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:強化魔法:C",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "英雄の翼",
    "name": "英雄の翼",
    "canonicalBuffName": "英雄の翼",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ヒロイックウイング"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:D:付与術士",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "D",
    "groupRaw": "D",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:D",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "付与術士",
    "name": "付与術士",
    "canonicalBuffName": "付与術士",
    "aliasOf": "",
    "aliases": [
      "付与術師"
    ],
    "items": [
      "シロエなりきり装備"
    ],
    "notes": [
      "優先度:魔法聖女＞付与術士"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "Spreadsheet/Scrapbox item page use 士; Wiki compatibility table uses 師"
  },
  {
    "id": "skillbuff:強化魔法:D:付与術師",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "D",
    "groupRaw": "D",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:D",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "付与術師",
    "name": "付与術師",
    "canonicalBuffName": "付与術士",
    "aliasOf": "付与術士",
    "aliases": [
      "付与術師"
    ],
    "items": [
      "シロエなりきり装備"
    ],
    "notes": [
      "優先度:魔法聖女＞付与術士"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Spreadsheet/Scrapbox item page use 士; Wiki compatibility table uses 師"
  },
  {
    "id": "skillbuff:強化魔法:D:魔法聖女",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "D",
    "groupRaw": "D",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:D",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "魔法聖女",
    "name": "魔法聖女",
    "canonicalBuffName": "魔法聖女",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "シスターナナなりきり装備"
    ],
    "notes": [
      "優先度 魔法聖女 > 付与術師"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:E:大司教",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "E",
    "groupRaw": "E",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:E",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大司教",
    "name": "大司教",
    "canonicalBuffName": "大司教",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "剣の乙女なりきり装備",
      "天秤剣"
    ],
    "notes": [
      "回復魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:F:強化の刻印",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "F",
    "groupRaw": "F",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:F",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "強化の刻印",
    "name": "強化の刻印",
    "canonicalBuffName": "強化の刻印",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "インペリアルナイトスパルダー"
    ],
    "notes": [
      "攻撃力、魔力+3％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:F:赤龍帝の加護",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "F",
    "groupRaw": "F",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:F",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "赤龍帝の加護",
    "name": "赤龍帝の加護",
    "canonicalBuffName": "赤龍帝の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "一誠なりきりウィッグ",
      "一誠なりきりウィッグカラー"
    ],
    "notes": [
      "攻撃力+3％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:G:マギア フォース",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "G",
    "groupRaw": "G",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:G",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "マギア フォース",
    "name": "マギア フォース",
    "canonicalBuffName": "マギア フォース",
    "aliasOf": "",
    "aliases": [
      "マギアフォース"
    ],
    "items": [
      "マギアウイング"
    ],
    "notes": [
      "破壊魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki spacing"
  },
  {
    "id": "skillbuff:強化魔法:G:マギアフォース",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "G",
    "groupRaw": "G",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:G",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "マギアフォース",
    "name": "マギアフォース",
    "canonicalBuffName": "マギア フォース",
    "aliasOf": "マギア フォース",
    "aliases": [
      "マギアフォース"
    ],
    "items": [
      "マギアウイング"
    ],
    "notes": [
      "破壊魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki spacing"
  },
  {
    "id": "skillbuff:強化魔法:G:マジックチャーム",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "G",
    "groupRaw": "G?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:強化魔法:G",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "マジックチャーム",
    "name": "マジックチャーム",
    "canonicalBuffName": "マジックチャーム",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ウィッチハットチャーム"
    ],
    "notes": [
      "ALC系魔法+5"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:H:大魔導士",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "H",
    "groupRaw": "H",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:H",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "大魔導士",
    "name": "大魔導士",
    "canonicalBuffName": "大魔導士",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スペルマスターロングコート"
    ],
    "notes": [
      "ALC系魔法+5"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:H:戦乙女の力",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "H",
    "groupRaw": "H?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:強化魔法:H",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "戦乙女の力",
    "name": "戦乙女の力",
    "canonicalBuffName": "戦乙女の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ヴァルキリーアーマードレス"
    ],
    "notes": [
      "回復魔法+15/魔力→攻撃力変換10％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:I:法力",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "I",
    "groupRaw": "I",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:I",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "法力",
    "name": "法力",
    "canonicalBuffName": "法力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "毘盧帽"
    ],
    "notes": [
      "回復魔法+10/不死特効1.25倍"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:J:魔法陣ブースト",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "J",
    "groupRaw": "J",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:J",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "魔法陣ブースト",
    "name": "魔法陣ブースト",
    "canonicalBuffName": "魔法陣ブースト",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "マジックレザーグローブ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:J:魔力回路",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "J",
    "groupRaw": "J?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:強化魔法:J",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "魔力回路",
    "name": "魔力回路",
    "canonicalBuffName": "魔力回路",
    "aliasOf": "",
    "aliases": [
      "魔法回路"
    ],
    "items": [
      "ノアスレーブブレスレット"
    ],
    "notes": [
      "魔力→攻撃力変換10％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official name"
  },
  {
    "id": "skillbuff:強化魔法:J:魔法回路",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "J",
    "groupRaw": "J?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:強化魔法:J",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "魔法回路",
    "name": "魔法回路",
    "canonicalBuffName": "魔力回路",
    "aliasOf": "魔力回路",
    "aliases": [
      "魔法回路"
    ],
    "items": [
      "ノアスレーブブレスレット"
    ],
    "notes": [
      "魔力→攻撃力変換10％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative",
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official name"
  },
  {
    "id": "skillbuff:強化魔法:K:大賢者の知識",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "K",
    "groupRaw": "K",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:K",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知識",
    "name": "大賢者の知識",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:強化魔法:K:大賢者の知恵",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "K",
    "groupRaw": "K",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:K",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知恵",
    "name": "大賢者の知恵",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "大賢者の知識",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:強化魔法:L:レゾナンスムーン",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "L",
    "groupRaw": "L",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:L",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "レゾナンスムーン",
    "name": "レゾナンスムーン",
    "canonicalBuffName": "レゾナンスムーン",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "クレセントムーン",
      "ムーンフォースティアラ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:M:女王の威厳",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "M",
    "groupRaw": "M",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:M",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "女王の威厳",
    "name": "女王の威厳",
    "canonicalBuffName": "女王の威厳",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ワンドオブクイーン"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:N:錬金術の極意",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "N",
    "groupRaw": "N",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:強化魔法:N",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "錬金術の極意",
    "name": "錬金術の極意",
    "canonicalBuffName": "錬金術の極意",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "シングルブレイドウィッグ"
    ],
    "notes": [
      "ALC系魔法+10/生産MG枠+2"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:O:叡智の力",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "O",
    "groupRaw": "O?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:強化魔法:O",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "叡智の力",
    "name": "叡智の力",
    "canonicalBuffName": "叡智の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "叡智の魔導書"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:強化魔法:P:カスタム屋",
    "skillName": "強化魔法",
    "skill": "強化魔法",
    "group": "P",
    "groupRaw": "P?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:強化魔法:P",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "カスタム屋",
    "name": "カスタム屋",
    "canonicalBuffName": "カスタム屋",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ホトリなりきり装備"
    ],
    "notes": [
      "生産MG枠+2/優先度:錬金術＞カスタム"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:A:深淵の闇",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:A",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "深淵の闇",
    "name": "深淵の闇",
    "canonicalBuffName": "深淵の闇",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "裂け目",
      "イビルアイチョーカー"
    ],
    "notes": [
      "有先度:邪悪な力＞神聖の闇",
      "優先度 邪悪な力 > 深淵の闇"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:A:邪悪な力",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:A",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "邪悪な力",
    "name": "邪悪な力",
    "canonicalBuffName": "邪悪な力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "シニスターウイング"
    ],
    "notes": [
      "攻撃力+3％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:B:ゴーストマリッジ",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:B",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "ゴーストマリッジ",
    "name": "ゴーストマリッジ",
    "canonicalBuffName": "ゴーストマリッジ",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ホラードレス"
    ],
    "notes": [
      "魔力+3％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:B:バフォメットの刻印",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:B",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "バフォメットの刻印",
    "name": "バフォメットの刻印",
    "canonicalBuffName": "バフォメットの刻印",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "バフォメットマスク"
    ],
    "notes": [
      "詠唱継続率+30％/最大HP-15％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:B:魔界の支配者",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:B",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "魔界の支配者",
    "name": "魔界の支配者",
    "canonicalBuffName": "魔界の支配者",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "デーモンロードウィッグ"
    ],
    "notes": [
      "攻撃力+3％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:C:スプーキーソウル",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "C",
    "groupRaw": "C",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:C",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "スプーキーソウル",
    "name": "スプーキーソウル",
    "canonicalBuffName": "スプーキーソウル",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スプーキーナイトセット"
    ],
    "notes": [
      "常に スプーキー ソウル が優先"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:C:夜の王",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "C",
    "groupRaw": "C",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:C",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "夜の王",
    "name": "夜の王",
    "canonicalBuffName": "夜の王",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "セクシーヴァンパイアセット"
    ],
    "notes": [
      "ST、MP自然回復75.00/m"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:D:死ノ象徴",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "D",
    "groupRaw": "D",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:D",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "死ノ象徴",
    "name": "死ノ象徴",
    "canonicalBuffName": "死ノ象徴",
    "aliasOf": "",
    "aliases": [
      "死の象徴"
    ],
    "items": [
      "カースドクロウ",
      "死神の首飾り"
    ],
    "notes": [
      "闇を纏いし者 / 月夜の煌き と併用可能か不明"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki name"
  },
  {
    "id": "skillbuff:死の魔法:D:死の象徴",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "D",
    "groupRaw": "D",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:D",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "死の象徴",
    "name": "死の象徴",
    "canonicalBuffName": "死ノ象徴",
    "aliasOf": "死ノ象徴",
    "aliases": [
      "死の象徴"
    ],
    "items": [
      "カースドクロウ",
      "死神の首飾り"
    ],
    "notes": [
      "闇を纏いし者 / 月夜の煌き と併用可能か不明"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki name"
  },
  {
    "id": "skillbuff:死の魔法:D:月夜の煌き",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "D",
    "groupRaw": "D?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:D",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "月夜の煌き",
    "name": "月夜の煌き",
    "canonicalBuffName": "月夜の煌き",
    "aliasOf": "",
    "aliases": [
      "夜空の煌めき",
      "月夜の煌めき"
    ],
    "items": [
      "ムーンライトバタフライ"
    ],
    "notes": [
      "神秘魔法+10/ST自然回復41.25/ｍ"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki name"
  },
  {
    "id": "skillbuff:死の魔法:D:夜空の煌めき",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "D",
    "groupRaw": "D?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:D",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "夜空の煌めき",
    "name": "夜空の煌めき",
    "canonicalBuffName": "月夜の煌き",
    "aliasOf": "月夜の煌き",
    "aliases": [
      "夜空の煌めき",
      "月夜の煌めき"
    ],
    "items": [
      "ムーンライトバタフライ"
    ],
    "notes": [
      "神秘魔法+10/ST自然回復41.25/ｍ"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative",
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki name"
  },
  {
    "id": "skillbuff:死の魔法:D:月夜の煌めき",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "D",
    "groupRaw": "D?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:D",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "月夜の煌めき",
    "name": "月夜の煌めき",
    "canonicalBuffName": "月夜の煌き",
    "aliasOf": "月夜の煌き",
    "aliases": [
      "夜空の煌めき",
      "月夜の煌めき"
    ],
    "items": [
      "ムーンライトバタフライ"
    ],
    "notes": [
      "神秘魔法+10/ST自然回復41.25/ｍ"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative",
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki name"
  },
  {
    "id": "skillbuff:死の魔法:E:アヌビスの力",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "E",
    "groupRaw": "E",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:E",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "アヌビスの力",
    "name": "アヌビスの力",
    "canonicalBuffName": "アヌビスの力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "アヌビスサイス"
    ],
    "notes": [
      "アイテム使用ディレイ-15％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:E:バフォメットの力",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "E",
    "groupRaw": "E?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:E",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "バフォメットの力",
    "name": "バフォメットの力",
    "canonicalBuffName": "バフォメットの力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "悪魔後者の杖"
    ],
    "notes": [
      "破壊魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:F:紅髪の滅殺姫",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "F",
    "groupRaw": "F",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:F",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "紅髪の滅殺姫",
    "name": "紅髪の滅殺姫",
    "canonicalBuffName": "紅髪の滅殺姫",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "リアスなりきりウィッグカラー",
      "リアスなりきりウィッグ"
    ],
    "notes": [
      "魔力3％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:F:闇の王",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "F",
    "groupRaw": "F?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:F",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "闇の王",
    "name": "闇の王",
    "canonicalBuffName": "闇の王",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "シャドウロードヘッド"
    ],
    "notes": [
      "暗黒命令+15/HP,MP自然回復56.25/m"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:G:蠍の加護",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "G",
    "groupRaw": "G",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:G",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "蠍の加護",
    "name": "蠍の加護",
    "canonicalBuffName": "蠍の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "アラクラン装備"
    ],
    "notes": [
      "クリティカル率+15％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:H:漆黒の魔眼",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "H",
    "groupRaw": "H",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:H",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "漆黒の魔眼",
    "name": "漆黒の魔眼",
    "canonicalBuffName": "漆黒の魔眼",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "漆黒の右目",
      "漆黒の左眼"
    ],
    "notes": [
      "メモリーズボックで顔耳切り替え可能"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:I:オシリスの加護",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "I",
    "groupRaw": "I",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:I",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "オシリスの加護",
    "name": "オシリスの加護",
    "canonicalBuffName": "オシリスの加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "背負いクルック"
    ],
    "notes": [
      "回復魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:I:邪悪なオーラ",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "I",
    "groupRaw": "I?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:I",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "邪悪なオーラ",
    "name": "邪悪なオーラ",
    "canonicalBuffName": "邪悪なオーラ",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スカルスピリットオーラ",
      "ダークネスサイス"
    ],
    "notes": [
      "魔法攻撃ダメージアップ10％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:J:漆黒のベール",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "J",
    "groupRaw": "J",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:J",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "漆黒のベール",
    "name": "漆黒のベール",
    "canonicalBuffName": "漆黒のベール",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ゴシックヘッドドレス",
      "ハロウィンヴェール"
    ],
    "notes": [
      "暗黒命令+10",
      "邪悪な力 と併用可能"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:K:悪魔の力",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "K",
    "groupRaw": "K",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:K",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "悪魔の力",
    "name": "悪魔の力",
    "canonicalBuffName": "悪魔の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "悪魔の仮面",
      "ダークサイドハンド",
      "デビルウイングイヤー"
    ],
    "notes": [
      "暗黒命令+10/魔力3％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:L:月夜見の加護",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "L",
    "groupRaw": "L",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:L",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "月夜見の加護",
    "name": "月夜見の加護",
    "canonicalBuffName": "月夜見の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "十五夜の着物"
    ],
    "notes": [
      "MP自然回復41.25/詠唱速度魔法ディレイ-15％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:L:ダークな雰囲気",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "L",
    "groupRaw": "L?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:L",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "ダークな雰囲気",
    "name": "ダークな雰囲気",
    "canonicalBuffName": "ダークな雰囲気",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ゴシックロリータサロペット"
    ],
    "notes": [
      "暗黒命令+15/MP自然回復41.25/m"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:M:殲滅の魔術師",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "M",
    "groupRaw": "M",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:M",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "殲滅の魔術師",
    "name": "殲滅の魔術師",
    "canonicalBuffName": "殲滅の魔術師",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "アグレッシブキャスター装備(染)"
    ],
    "notes": [
      "破壊魔法+15/染色可のみBuff有"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:N:死神候補",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "N",
    "groupRaw": "N",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:N",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "死神候補",
    "name": "死神候補",
    "canonicalBuffName": "死神候補",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "死神の使い魔"
    ],
    "notes": [
      "暗黒命令+15"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:O:大賢者の知識",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "O",
    "groupRaw": "O",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:O",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知識",
    "name": "大賢者の知識",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10/最大HP-20％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:死の魔法:O:大賢者の知恵",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "O",
    "groupRaw": "O",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:O",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知恵",
    "name": "大賢者の知恵",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "大賢者の知識",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10/最大HP-20％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:死の魔法:O:堕天使の魔眼",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "O",
    "groupRaw": "O?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:O",
    "safeForConflictAutoApply": true,
    "value": 0,
    "valueRaw": "?%",
    "valueUncertain": true,
    "amount": "?%",
    "buffName": "堕天使の魔眼",
    "name": "堕天使の魔眼",
    "canonicalBuffName": "堕天使の魔眼",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "イビルアイブローチ"
    ],
    "notes": [
      "テクニック効果範囲+1/射程+?"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "valueUncertain",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:O:真祖の吸血鬼",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "O",
    "groupRaw": "O?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:O",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "真祖の吸血鬼",
    "name": "真祖の吸血鬼",
    "canonicalBuffName": "真祖の吸血鬼",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "トゥルーヴァンパイアコート"
    ],
    "notes": [
      "牙+20/与ダメHP吸収5％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:P:小悪魔の翼",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "P",
    "groupRaw": "P",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:P",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "小悪魔の翼",
    "name": "小悪魔の翼",
    "canonicalBuffName": "小悪魔の翼",
    "aliasOf": "",
    "aliases": [
      "子悪魔の翼"
    ],
    "items": [
      "デビルウイングシューズ",
      "ゴシックハーネスベルト"
    ],
    "notes": [
      "落下速度60％減少/落下ダメージ25％減少"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki name"
  },
  {
    "id": "skillbuff:死の魔法:P:子悪魔の翼",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "P",
    "groupRaw": "P",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:死の魔法:P",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "子悪魔の翼",
    "name": "子悪魔の翼",
    "canonicalBuffName": "小悪魔の翼",
    "aliasOf": "小悪魔の翼",
    "aliases": [
      "子悪魔の翼"
    ],
    "items": [
      "デビルウイングシューズ",
      "ゴシックハーネスベルト"
    ],
    "notes": [
      "落下速度60％減少/落下ダメージ25％減少"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki name"
  },
  {
    "id": "skillbuff:死の魔法:Q:魔術師の怨念",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "Q",
    "groupRaw": "Q?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:Q",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "魔術師の怨念",
    "name": "魔術師の怨念",
    "canonicalBuffName": "魔術師の怨念",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スカルスピリットオーラ"
    ],
    "notes": [
      "魔力3％/破壊魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:R:闇の支配者",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "R",
    "groupRaw": "R?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:R",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "闇の支配者",
    "name": "闇の支配者",
    "canonicalBuffName": "闇の支配者",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ダークルーラー装備"
    ],
    "notes": [
      "無属性効果+15％/魔力3％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:S:叡智の力",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "S",
    "groupRaw": "S?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:S",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "叡智の力",
    "name": "叡智の力",
    "canonicalBuffName": "叡智の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "叡智の魔導書"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:T:闇を纏いし者",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "T",
    "groupRaw": "T?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:T",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "闇を纏いし者",
    "name": "闇を纏いし者",
    "canonicalBuffName": "闇を纏いし者",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "カオスサークル",
      "ナイトメアゴシックウェア"
    ],
    "notes": [
      "暗黒命令+10",
      "死ノ象徴 / 月夜の煌き と併用可能か不明"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:死の魔法:U:ヤミの力",
    "skillName": "死の魔法",
    "skill": "死の魔法",
    "group": "U",
    "groupRaw": "U?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:死の魔法:U",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "ヤミの力",
    "name": "ヤミの力",
    "canonicalBuffName": "ヤミの力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ゴジックロリータアイパッチ"
    ],
    "notes": [
      "暗黒命令+10/詠唱妨害耐性+20％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:A:魔術師の極意",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:A",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "魔術師の極意",
    "name": "魔術師の極意",
    "canonicalBuffName": "魔術師の極意",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "魔術師にローブ",
      "魔術師のパンツ",
      "魔導書付きチェーンベルト",
      "魔術師のショートパンツ",
      "チャーリーのニット帽"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:B:火神の力",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:B",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "火神の力",
    "name": "火神の力",
    "canonicalBuffName": "火神の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "イグニスロッド",
      "背負いイグニスロッド"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:B:雪の女王",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:B",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "雪の女王",
    "name": "雪の女王",
    "canonicalBuffName": "雪の女王",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "氷雪のサークレット"
    ],
    "notes": [
      "火神の力 を上書き"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:C:太陽の力",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "C",
    "groupRaw": "C",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:C",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "太陽の力",
    "name": "太陽の力",
    "canonicalBuffName": "太陽の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "太陽のポンチョ",
      "太陽の耳飾り"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:D:魔導の真髄",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "D",
    "groupRaw": "D",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:D",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "魔導の真髄",
    "name": "魔導の真髄",
    "canonicalBuffName": "魔導の真髄",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "魔法のとんがり帽子",
      "魔導の手袋"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:E:鬼道の力",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "E",
    "groupRaw": "E",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:E",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "鬼道の力",
    "name": "鬼道の力",
    "canonicalBuffName": "鬼道の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "鬼人の双角+3"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:E:神獣青龍の加護",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "E",
    "groupRaw": "E?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:E",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "神獣青龍の加護",
    "name": "神獣青龍の加護",
    "canonicalBuffName": "神獣青龍の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "異界の神獣青龍"
    ],
    "notes": [
      "Spreadsheet未収録。Scrapbox/公式DBで確認。魔力+3%も併発。"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "wiki+scrapbox+official",
    "correctionReason": "missing in spreadsheet"
  },
  {
    "id": "skillbuff:破壊魔法:F:レイヴンファミリア",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "F",
    "groupRaw": "F",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:F",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "レイヴンファミリア",
    "name": "レイヴンファミリア",
    "canonicalBuffName": "レイヴンファミリア",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "カラスの使い魔"
    ],
    "notes": [
      "同部位他装備と併用可能か不明"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:F:マギアフォース",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "F",
    "groupRaw": "F?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:F",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "マギアフォース",
    "name": "マギアフォース",
    "canonicalBuffName": "マギアフォース",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "マギアウイング"
    ],
    "notes": [
      "同部位他装備と併用可能か不明"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:F:マジックチャーム",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "F",
    "groupRaw": "F?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:F",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "マジックチャーム",
    "name": "マジックチャーム",
    "canonicalBuffName": "マジックチャーム",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ウィッチハットチャーム"
    ],
    "notes": [
      "ALC系魔法+5"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:F:神獣白虎の加護",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "F",
    "groupRaw": "F?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:F",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "神獣白虎の加護",
    "name": "神獣白虎の加護",
    "canonicalBuffName": "神獣白虎の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "異界の神獣白虎"
    ],
    "notes": [
      "同部位他装備と併用可能か不明"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:G:ラル・ファク神の加護",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "G",
    "groupRaw": "G",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:G",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "ラル・ファク神の加護",
    "name": "ラル・ファク神の加護",
    "canonicalBuffName": "ラル・ファク神の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "アポステルローブ",
      "バスターマント"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:H:雷光の巫女",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "H",
    "groupRaw": "H",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:H",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "雷光の巫女",
    "name": "雷光の巫女",
    "canonicalBuffName": "雷光の巫女",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "朱乃なりきりウィッグカラー",
      "朱乃なりきりウィッグ"
    ],
    "notes": [
      "上級魔術師 と併用可能か不明"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:H:上級魔術師",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "H",
    "groupRaw": "H?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:H",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "上級魔術師",
    "name": "上級魔術師",
    "canonicalBuffName": "上級魔術師",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ツインブレイドロングウイッグ"
    ],
    "notes": [
      "雷光の巫女 と併用可能か不明"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:H:錬金術の極意",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "H",
    "groupRaw": "H?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:H",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "錬金術の極意",
    "name": "錬金術の極意",
    "canonicalBuffName": "錬金術の極意",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "シングルブレイドウイッグ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:I:鉱人道士",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "I",
    "groupRaw": "I",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:I",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "鉱人道士",
    "name": "鉱人道士",
    "canonicalBuffName": "鉱人道士",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "鉱人道士の髭"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:I:氷結の魔女",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "I",
    "groupRaw": "I?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:I",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "氷結の魔女",
    "name": "氷結の魔女",
    "canonicalBuffName": "氷結の魔女",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ミステリアスハーフマスク"
    ],
    "notes": [
      "水属性+10％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:J:大魔導士",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "J",
    "groupRaw": "J",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:J",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "大魔導士",
    "name": "大魔導士",
    "canonicalBuffName": "大魔導士",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スペルマスターロングコート"
    ],
    "notes": [
      "ALC系魔法+5"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:K:殲滅の魔術師",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "K",
    "groupRaw": "K",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:K",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "殲滅の魔術師",
    "name": "殲滅の魔術師",
    "canonicalBuffName": "殲滅の魔術師",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "アグレッシブキャスタ装備(染)"
    ],
    "notes": [
      "染色不可はBuffなし"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:L:破壊の紋章",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "L",
    "groupRaw": "L",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:L",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "破壊の紋章",
    "name": "破壊の紋章",
    "canonicalBuffName": "破壊の紋章",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "グラフィカルマジカルウイング"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:L:英雄の翼",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "L",
    "groupRaw": "L?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:L",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "英雄の翼",
    "name": "英雄の翼",
    "canonicalBuffName": "英雄の翼",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ヒロイックウイング"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:M:魔法陣ブースト",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "M",
    "groupRaw": "M",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:M",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "魔法陣ブースト",
    "name": "魔法陣ブースト",
    "canonicalBuffName": "魔法陣ブースト",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "マジックレザーグローブ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:M:シルフの加護",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "M",
    "groupRaw": "M?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:M",
    "safeForConflictAutoApply": true,
    "value": 0,
    "valueRaw": "?",
    "valueUncertain": true,
    "amount": "?",
    "buffName": "シルフの加護",
    "name": "シルフの加護",
    "canonicalBuffName": "シルフの加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ストームブレスレット"
    ],
    "notes": [
      "風属性?％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "valueUncertain",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:N:ウラエウスの力",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "N",
    "groupRaw": "N",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:N",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "ウラエウスの力",
    "name": "ウラエウスの力",
    "canonicalBuffName": "ウラエウスの力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "コブラヘッドロッド"
    ],
    "notes": [
      "火属性+10％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:N:女王の威厳",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "N",
    "groupRaw": "N?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:N",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "女王の威厳",
    "name": "女王の威厳",
    "canonicalBuffName": "女王の威厳",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ワンドオブクイーン"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:O:神獣玄武の加護",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "O",
    "groupRaw": "O",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:O",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "神獣玄武の加護",
    "name": "神獣玄武の加護",
    "canonicalBuffName": "神獣玄武の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "異界の神獣玄武"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:P:神獣朱雀の加護",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "P",
    "groupRaw": "P",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:P",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "神獣朱雀の加護",
    "name": "神獣朱雀の加護",
    "canonicalBuffName": "神獣朱雀の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "異界の神獣朱雀"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:Q:大賢者の知識",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "Q",
    "groupRaw": "Q",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:Q",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知識",
    "name": "大賢者の知識",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:破壊魔法:Q:大賢者の知恵",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "Q",
    "groupRaw": "Q",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:Q",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知恵",
    "name": "大賢者の知恵",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "大賢者の知識",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:破壊魔法:Q:破壊の魔石",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "Q",
    "groupRaw": "Q?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:Q",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "破壊の魔石",
    "name": "破壊の魔石",
    "canonicalBuffName": "破壊の魔石",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "マジックジェムチョーカー"
    ],
    "notes": [],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:R:レゾナンスムーン",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "R",
    "groupRaw": "R",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:破壊魔法:R",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "レゾナンスムーン",
    "name": "レゾナンスムーン",
    "canonicalBuffName": "レゾナンスムーン",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "クレセントムーン",
      "ムーンフォースティアラ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:S:魔術師の怨念",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "S",
    "groupRaw": "S?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:S",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "魔術師の怨念",
    "name": "魔術師の怨念",
    "canonicalBuffName": "魔術師の怨念",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スカルスピリットオーラ"
    ],
    "notes": [
      "死の魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:T:バフォメットの力",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "T",
    "groupRaw": "T?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:T",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "バフォメットの力",
    "name": "バフォメットの力",
    "canonicalBuffName": "バフォメットの力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "悪魔侯爵の杖"
    ],
    "notes": [
      "死の魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:U:氷の魔術師",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "U",
    "groupRaw": "U?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:U",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20%",
    "valueUncertain": false,
    "amount": "20%",
    "buffName": "氷の魔術師",
    "name": "氷の魔術師",
    "canonicalBuffName": "氷の魔術師",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "グレイシャルローブ"
    ],
    "notes": [
      "水属性+20％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:破壊魔法:V:叡智の力",
    "skillName": "破壊魔法",
    "skill": "破壊魔法",
    "group": "V",
    "groupRaw": "V?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:破壊魔法:V",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "叡智の力",
    "name": "叡智の力",
    "canonicalBuffName": "叡智の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "叡智の魔導書"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:A:水神の力",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:A",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "水神の力",
    "name": "水神の力",
    "canonicalBuffName": "水神の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "アクアロッド",
      "背負いアクアロッド"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:B:星屑の加護",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:B",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "星屑の加護",
    "name": "星屑の加護",
    "canonicalBuffName": "星屑の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "星屑の帽子",
      "星屑のドレグ",
      "星屑のイブニンググローブ",
      "星屑のウイングブーツ"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:B:月の加護",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:B",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "月の加護",
    "name": "月の加護",
    "canonicalBuffName": "月の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "クレセントチョーカー"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:C:神秘のオーラ",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "C",
    "groupRaw": "C",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:C",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "神秘のオーラ",
    "name": "神秘のオーラ",
    "canonicalBuffName": "神秘のオーラ",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "錬金術師のローブ",
      "錬金術師の帽子"
    ],
    "notes": [
      "魔力3％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:D:寿",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "D",
    "groupRaw": "D",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:D",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "寿",
    "name": "寿",
    "canonicalBuffName": "寿",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "水引帯",
      "水引のかんざし"
    ],
    "notes": [
      "ペット経験値1.1倍(D枠)"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:E:神祇官",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "E",
    "groupRaw": "E",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:E",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "神祇官",
    "name": "神祇官",
    "canonicalBuffName": "神祇官",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ミノリなりきり装備"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:F:蝶の加護",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "F",
    "groupRaw": "F",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:F",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "蝶の加護",
    "name": "蝶の加護",
    "canonicalBuffName": "蝶の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ルルパピヨン装備"
    ],
    "notes": [
      "MP自然回復42/ｍ"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:H:月夜の煌き",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "H",
    "groupRaw": "H",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:H",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "月夜の煌き",
    "name": "月夜の煌き",
    "canonicalBuffName": "月夜の煌き",
    "aliasOf": "",
    "aliases": [
      "月夜の煌めき"
    ],
    "items": [
      "ムーンライトバタフライ"
    ],
    "notes": [
      "死の魔法+10/ST自然回復41.25/ｍ"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki name"
  },
  {
    "id": "skillbuff:神秘魔法:H:月夜の煌めき",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "H",
    "groupRaw": "H",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:H",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "月夜の煌めき",
    "name": "月夜の煌めき",
    "canonicalBuffName": "月夜の煌き",
    "aliasOf": "月夜の煌き",
    "aliases": [
      "月夜の煌めき"
    ],
    "items": [
      "ムーンライトバタフライ"
    ],
    "notes": [
      "死の魔法+10/ST自然回復41.25/ｍ"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki name"
  },
  {
    "id": "skillbuff:神秘魔法:H:七色の奇跡",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "H",
    "groupRaw": "H?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:神秘魔法:H",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "七色の奇跡",
    "name": "七色の奇跡",
    "canonicalBuffName": "七色の奇跡",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ステンドガラスバタフライ"
    ],
    "notes": [
      "ペット経験値1.1倍(K )/耐呪/他"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:H:白狐の力",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "H",
    "groupRaw": "H?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:神秘魔法:H",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "白狐の力",
    "name": "白狐の力",
    "canonicalBuffName": "白狐の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "白狐"
    ],
    "notes": [
      "魔力+5％/病気、呪い無効"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:I:大魔導士",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "I",
    "groupRaw": "I",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:I",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "大魔導士",
    "name": "大魔導士",
    "canonicalBuffName": "大魔導士",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スペルマスターロングコート"
    ],
    "notes": [
      "ALC系魔法+5"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:I:ダークな雰囲気",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "I",
    "groupRaw": "I?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:神秘魔法:I",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "ダークな雰囲気",
    "name": "ダークな雰囲気",
    "canonicalBuffName": "ダークな雰囲気",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ゴシックロリータサロペット"
    ],
    "notes": [
      "死の魔法+10/MP自然回復41.25/ｍ"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:I:高貴な心",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "I",
    "groupRaw": "I?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:神秘魔法:I",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "高貴な心",
    "name": "高貴な心",
    "canonicalBuffName": "高貴な心",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ロイヤルハーツドレス"
    ],
    "notes": [
      "回復魔法+15/無属性魔法15％アップ"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:J:神眼の力",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "J",
    "groupRaw": "J",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:J",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "神眼の力",
    "name": "神眼の力",
    "canonicalBuffName": "神眼の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ゴッドアイリング"
    ],
    "notes": [
      "命中＆回避+10％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:J:神聖な力",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "J",
    "groupRaw": "J",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:J",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "神聖な力",
    "name": "神聖な力",
    "canonicalBuffName": "神聖な力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "セイクリッドロングブーツ",
      "セイクリッドハープグローブ",
      "聖騎士の兜",
      "聖騎士のチャーム",
      "セイクリッドヴェール",
      "聖騎士の靴",
      "レースアイマスク"
    ],
    "notes": [
      "回復魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:J:星光",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "J",
    "groupRaw": "J?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:神秘魔法:J",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "星光",
    "name": "星光",
    "canonicalBuffName": "星光",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スターライトリング"
    ],
    "notes": [
      "魔力3％"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:K:魔法陣ブースト",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "K",
    "groupRaw": "K",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:K",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "魔法陣ブースト",
    "name": "魔法陣ブースト",
    "canonicalBuffName": "魔法陣ブースト",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "マジックレザーグローブ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:L:ラッキーチャーム",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "L",
    "groupRaw": "L",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:L",
    "safeForConflictAutoApply": true,
    "value": 5,
    "valueRaw": "5",
    "valueUncertain": false,
    "amount": "5",
    "buffName": "ラッキーチャーム",
    "name": "ラッキーチャーム",
    "canonicalBuffName": "ラッキーチャーム",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "スネークリング"
    ],
    "notes": [
      "クリティカル率+5％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:M:天職：治癒師",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "M",
    "groupRaw": "M",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:M",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "天職：治癒師",
    "name": "天職：治癒師",
    "canonicalBuffName": "天職：治癒師",
    "aliasOf": "",
    "aliases": [
      "転職：治癒師"
    ],
    "items": [
      "白崎香織なりきり装備"
    ],
    "notes": [
      "回復魔法+15/MP消費軽減10％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "Scrapbox/Wiki name"
  },
  {
    "id": "skillbuff:神秘魔法:M:転職：治癒師",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "M",
    "groupRaw": "M",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:M",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "転職：治癒師",
    "name": "転職：治癒師",
    "canonicalBuffName": "天職：治癒師",
    "aliasOf": "天職：治癒師",
    "aliases": [
      "転職：治癒師"
    ],
    "items": [
      "白崎香織なりきり装備"
    ],
    "notes": [
      "回復魔法+15/MP消費軽減10％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Scrapbox/Wiki name"
  },
  {
    "id": "skillbuff:神秘魔法:N:英雄の翼",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "N",
    "groupRaw": "N",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:N",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "英雄の翼",
    "name": "英雄の翼",
    "canonicalBuffName": "英雄の翼",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ヒロイックウイング"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:N:奇術師",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "N",
    "groupRaw": "N?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:神秘魔法:N",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "奇術師",
    "name": "奇術師",
    "canonicalBuffName": "奇術師",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "マジシャンズカード"
    ],
    "notes": [
      "魔法熟練+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:O:大賢者の知識",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "O",
    "groupRaw": "O",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:O",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知識",
    "name": "大賢者の知識",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:神秘魔法:O:大賢者の知恵",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "O",
    "groupRaw": "O",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:O",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "大賢者の知恵",
    "name": "大賢者の知恵",
    "canonicalBuffName": "大賢者の知識",
    "aliasOf": "大賢者の知識",
    "aliases": [
      "大賢者の知恵"
    ],
    "items": [
      "大賢者のケープ"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "official/Wiki name"
  },
  {
    "id": "skillbuff:神秘魔法:P:レゾナンス ムーン",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "P",
    "groupRaw": "P",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:P",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "レゾナンス ムーン",
    "name": "レゾナンス ムーン",
    "canonicalBuffName": "レゾナンス ムーン",
    "aliasOf": "",
    "aliases": [
      "レゾナンスムーン"
    ],
    "items": [
      "クレセントムーン",
      "ムーンフォースティアラ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki spacing"
  },
  {
    "id": "skillbuff:神秘魔法:P:レゾナンスムーン",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "P",
    "groupRaw": "P",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:P",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "レゾナンスムーン",
    "name": "レゾナンスムーン",
    "canonicalBuffName": "レゾナンス ムーン",
    "aliasOf": "レゾナンス ムーン",
    "aliases": [
      "レゾナンスムーン"
    ],
    "items": [
      "クレセントムーン",
      "ムーンフォースティアラ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [
      "aliasRow"
    ],
    "source": "xlsx+wiki",
    "correctionReason": "Wiki spacing"
  },
  {
    "id": "skillbuff:神秘魔法:Q:女王の威厳",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "Q",
    "groupRaw": "Q",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:Q",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "女王の威厳",
    "name": "女王の威厳",
    "canonicalBuffName": "女王の威厳",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ワンドオブクイーン"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:R:錬金術の極意",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "R",
    "groupRaw": "R",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:神秘魔法:R",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "錬金術の極意",
    "name": "錬金術の極意",
    "canonicalBuffName": "錬金術の極意",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "シングルブレイドウィッグ"
    ],
    "notes": [
      "ALC系魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:神秘魔法:S:叡智の力",
    "skillName": "神秘魔法",
    "skill": "神秘魔法",
    "group": "S",
    "groupRaw": "S?",
    "groupUncertain": true,
    "groupTentative": true,
    "conflictGroup": "skillBuff:神秘魔法:S",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "叡智の力",
    "name": "叡智の力",
    "canonicalBuffName": "叡智の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "叡智の魔導書"
    ],
    "notes": [
      "賢者系魔法+10"
    ],
    "confidence": "tentative",
    "noteNeedsReview": true,
    "reviewFlags": [
      "groupTentative",
      "confidenceTentative"
    ],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:魔法熟練:A:エキスパートマジック",
    "skillName": "魔法熟練",
    "skill": "魔法熟練",
    "group": "A",
    "groupRaw": "A",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:魔法熟練:A",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "エキスパートマジック",
    "name": "エキスパートマジック",
    "canonicalBuffName": "エキスパートマジック",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "エキスパートマジックリング"
    ],
    "notes": [],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:魔法熟練:B:白百合の加護",
    "skillName": "魔法熟練",
    "skill": "魔法熟練",
    "group": "B",
    "groupRaw": "B",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:魔法熟練:B",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "白百合の加護",
    "name": "白百合の加護",
    "canonicalBuffName": "白百合の加護",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "ホワイトリリーロッド"
    ],
    "notes": [
      "詠唱妨害耐性+15％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:魔法熟練:C:妖狐の力",
    "skillName": "魔法熟練",
    "skill": "魔法熟練",
    "group": "C",
    "groupRaw": "C",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:魔法熟練:C",
    "safeForConflictAutoApply": true,
    "value": 15,
    "valueRaw": "15",
    "valueUncertain": false,
    "amount": "15",
    "buffName": "妖狐の力",
    "name": "妖狐の力",
    "canonicalBuffName": "妖狐の力",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "九重なりきりウィッグカラー",
      "九重なりきりウィッグ"
    ],
    "notes": [
      "魔力3％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:魔法熟練:D:自然崇拝",
    "skillName": "魔法熟練",
    "skill": "魔法熟練",
    "group": "D",
    "groupRaw": "D",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:魔法熟練:D",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "自然崇拝",
    "name": "自然崇拝",
    "canonicalBuffName": "自然崇拝",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "エスニックアームカバー",
      "エスニックファーシューズ",
      "エスニックウエストクロース"
    ],
    "notes": [
      "自然調和+20/暗黒命令+20/ST自然回復75/m"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:魔法熟練:E:奇術師",
    "skillName": "魔法熟練",
    "skill": "魔法熟練",
    "group": "E",
    "groupRaw": "E",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:魔法熟練:E",
    "safeForConflictAutoApply": true,
    "value": 10,
    "valueRaw": "10",
    "valueUncertain": false,
    "amount": "10",
    "buffName": "奇術師",
    "name": "奇術師",
    "canonicalBuffName": "奇術師",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "マジシャンズカード"
    ],
    "notes": [
      "神秘魔法+10"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  },
  {
    "id": "skillbuff:魔法熟練:F:陰陽術の極意",
    "skillName": "魔法熟練",
    "skill": "魔法熟練",
    "group": "F",
    "groupRaw": "F",
    "groupUncertain": false,
    "groupTentative": false,
    "conflictGroup": "skillBuff:魔法熟練:F",
    "safeForConflictAutoApply": true,
    "value": 20,
    "valueRaw": "20",
    "valueUncertain": false,
    "amount": "20",
    "buffName": "陰陽術の極意",
    "name": "陰陽術の極意",
    "canonicalBuffName": "陰陽術の極意",
    "aliasOf": "",
    "aliases": [],
    "items": [
      "陰陽の狩衣"
    ],
    "notes": [
      "魔力3％/召還ディレイ+25％"
    ],
    "confidence": "confirmed",
    "noteNeedsReview": false,
    "reviewFlags": [],
    "source": "xlsx+wiki",
    "correctionReason": ""
  }
];
