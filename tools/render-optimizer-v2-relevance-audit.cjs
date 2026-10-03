/* Render investigation evidence, not an optimizer/filter implementation. */
const fs=require('node:fs');
const a=JSON.parse(fs.readFileSync('docs/optimizer-v2-relevance-audit.json','utf8'));
const lines=[],add=(...s)=>lines.push(...s),pair=(c,k,f)=>`${c[f]}/${k[f]}`;
add('# Optimizer v2 AC / 回復魔法skillPlus relevance監査','',
  '使用commit: `'+a.commit+'`。調査のみ。探索・計算・UI・既存Optimizer・テストの実装変更なし。commit/pushなし。',
  '既存の未追跡Final Validation記録は削除・移動・stageしていない。新規調査CLIはproduction reducerをそのまま実行し、射影と既存read-only bound inspectionを読む。探索は実行しない。','',
  '## 集計の定義','',
  '- candidate欄は断りのない限りprefilter後。class欄はそのSearchContextの代表クラス。',
  '- AC正/負は本体および競合前BuffのextraAC/extraACPctの符号。割合だけで本体0でも正寄与の可能性として数える。正と負は混在し得る。最終構成で採用されるBuffや純増量とは区別する。',
  '- skillPlusは正式helperが競合前Compositeから読む回復魔法値。正寄与106候補は通常正式経路の単品評価でも全件一致を確認した。',
  '- projection保護とmetric boundのunknownは別。保護理由は全件resolved-buff-interactionであり、全件が未解釈ゲーム効果という意味ではない。',
  '- 「局所無関係」は対象値0・projection保護なし・metric bound unknownなし。武器占有/弾薬/装備条件まで無関係とは証明していない。',
  '- さらに武器3部位とhard conflictを除いた「非武器・競合なし局所ゼロ」も別集計する。安全な削除件数やTop-K同値性を自動的に保証する数字ではない。',
  '- 以下の分類は保護/他skill/他効果などで重複する。排他的な内訳は正/負/ゼロの符号分類のみ（AC混在1件を除く）。','',
  '## Context','',
  '両ケースともobjective=max、topK=20、constraints=[]、全17部位、race=newtar、gender=male。銃器のcrit/delay条件はAC/skillPlusへ引き継がれていない。制約安全性を理由に残る候補は0件。',
  'AC observedBaseは空、observedExtraはextraAC/extraACPctだけ。skillPlusはobservedBase/observedExtraとも空、skillNamesは回復魔法だけ。','');
for(const [name,c] of Object.entries(a.cases)){
  add('## '+(name==='ac'?'AC':'回復魔法skillPlus')+' 集計','',
    '| 分類 | 全カタログcandidate | prefilter後candidate | class |','|---|---:|---:|---:|');
  for(const [f,label] of [['count','総数'],['positive','正寄与'],['negative','負寄与'],['zero','局所寄与0'],['protected','projection保護'],
    ['boundUnknown','metric bound unknown（現Context保持対象）'],['unrelated','局所無関係・保護なし'],['structurallyInert','非武器・hard conflictなしの局所ゼロ'],
    ['constraintOnly','制約だけへ寄与'],['zeroKnownOther','対象0・他の効果payloadあり'],['zeroOtherSkills','対象0・他skillPlusあり'],
    ['zeroProtected','対象0・projection保護あり'],['displayPayloadOnly','追加効果はdisplayのみ・数値Buff効果なし']])
    add(`| ${label} | ${c.catalog[f]} | ${c.prefilter[f]} | ${c.classes[f]} |`);
  add('', 'named Buffがあっても正式resolverで効果なしとなるのは'+c.prefilter.modelIgnoredNamedBuff+' candidate。これだけで保護されるわけではない。',
    '対象0・display-only payloadだけの保護candidateは'+c.rows.filter(r=>r.retained&&r.zero&&r.protected&&r.displayPayloadOnly).length+'件。',
    '', '### slot内訳','', '符号/保護/ゼロ欄はcandidate/class。catalogはprefilter前。',
    '', '| slot | catalog | prefilter | class | 正 | 負 | 0 | 保護 | 局所無関係 | bound blocker | 保護なし数値dom概算 |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  for(const [slot,v] of Object.entries(c.bySlot))add(`| ${slot} | ${v.catalog.count} | ${v.candidates.count} | ${v.classes.count} | ${pair(v.candidates,v.classes,'positive')} | ${pair(v.candidates,v.classes,'negative')} | ${pair(v.candidates,v.classes,'zero')} | ${pair(v.candidates,v.classes,'protected')} | ${pair(v.candidates,v.classes,'unrelated')} | ${v.classes.boundUnknown} | ${c.numericDominance.candidates.bySlot[slot].dominated}/${c.numericDominance.classes.bySlot[slot].dominated} |`);
  add('', '### dominance概算（適用していない）','',
    '| 比較条件 | dominated candidate | dominated class | class pair数 |', '|---|---:|---:|---:|');
  for(const [field,label] of [['numericDominance','保護/metric unknownを除外、同slot数値比較のみ'],
    ['structuralDominance','さらに残りの全projection semanticsも一致'],['boundKnownNumericDominance','metric unknownだけ除外（保護/装備条件の比較は省略）']])
    add(`| ${label} | ${c[field].candidates.dominated} | ${c[field].classes.dominated} | ${c[field].classes.pairs} |`);
  add('', '最も厳しい条件のclass例: '+(c.structuralDominance.classes.examples.slice(0,8).map(e=>`${e.name}(${e.value}) < ${e.by}(${e.winnerValue})`).join(' / ')||'なし'),
    'metric-bound-known数値例（装備条件を比較していない）: '+c.boundKnownNumericDominance.classes.examples.slice(0,3).map(e=>`${e.name} < ${e.by}`).join(' / '),
    'Top20では非同値の下位候補でも2〜20位に必要な場合がある。数値dominanceは一括削除可能性ではない。strict dominanceをtopK>1で無効化する現行理由も維持されている。','',
    '### equivalence keyの感度（キー省略の机上集計のみ）','',
    '| 省略field | 仮class数 | 現行からの減少 |','|---|---:|---:|---:|');
  for(const [field,v] of Object.entries(c.keySensitivity))if(v.delta||['observedBase','observedExtra','buffs','requirements'].includes(field))
    add(`| ${field} | ${v.classesAfterDiagnosticOmission} | ${v.delta} |`);
  add('', '保護candidateIdだけ外した仮数は'+c.classesIgnoringSingletonProtection+'。foreign Buff fieldsを省いても保護を維持するなら'+c.foreignBuffFieldOmission.keepSingletonProtection+'（現行と同じ）。',
    '全装備条件・武器・Buff意味・保護を無視してslotと対象数値だけにすると'+c.classesIgnoringProtectionAndNonobjectiveSemantics+'種類。これは安全な削減数ではなく下限に近い数値多様性の目安。省略別減少は重なりがあり加算不可。','',
    '### 対象へつながる宣言済み依存グラフ','',
    '対象値が非0の候補を起点に、既存collectActiveBuffConflictCandidatesのgroup/tags、same-technic stack key、hard conflictを推移的に接続した調査結果: '+c.dependencyClosure.candidateCount+' candidate / '+c.dependencyClosure.classCount+' class（そのうち対象0は'+c.dependencyClosure.zeroCandidates+' candidate / '+c.dependencyClosure.zeroClasses+' class）。',
    '同slotの辺も保守的に残す。装備hand/ammo・固定外部state・Top-K表現を含む完全な安全性証明ではない。実際のreducer/探索には一切適用していない。','',
    '### 代表例','');
  for(const [field,label] of [['positive','正寄与'],['negative','負寄与'],['zeroUnrelated','局所ゼロ・保護なし'],['zeroProtected','局所ゼロ・保護あり'],
    ['otherSkillsOnly','対象ゼロ・他skillPlusあり'],['ignoredNamedBuff','named Buffだが正式モデル効果なし']])
    add('- '+label+': '+(c.examples[field].slice(0,4).map(r=>r.name).join('、')||'なし'));
  add('- 非武器・競合なし局所ゼロ例: '+c.rows.filter(r=>r.retained&&r.structurallyInert).filter((r,i,list)=>list.findIndex(x=>x.slot===r.slot)===i).slice(0,6).map(r=>r.name).join('、'),'');
}
add('## 回復魔法skillPlusの直接/経由実数','',
  '全11,804件中、candidate/正式装備行extraEffectsへ回復魔法+Nを保持するのは106件。Buff→Composite経由で正式計算へ渡るのも同じ106件。両者は完全に重複し、合計212件ではない。Buff経由だけで元candidateに対象skillPlusがない候補は0件。負0件、その他11,698件。',
  'prefilter後も正106件、classも106件。106件は全てprojection保護によりsingleton。正式skillPlus集計はequipmentのextraEffectsを直接足すのでなく、競合解決済みCompositeのextraEffectsを読む。対象positive106件の単品正式評価スコアと集計値は全件一致した。',
  '106 positive class中、91はmetric boundもunknown、15はmetric加算proofがある。ゼロ寄与で直接bound blockerになるのは7件。しかし推移的なgroup/stack接続まで読むとゼロ32件となり、対象関連のグラフは138件になる。106+7だけを残す案にも安全性の不足がある。','',
  '回復魔法0で他skillPlusを持つ422 candidate/classのうち、Buffの数値効果が他skillPlusだけなのは214 candidate/class。本体AC・武器性能なども含めて装備全体が他skillPlusだけという厳しい条件では0件。',
  '正寄与106クラスだけでも15部位に分散しており、各部位の正候補＋emptyの直積は1,100,170,874,880通り（競合前）。Sparse化だけで完走時間が保証されるわけではなく、競合依存とその証明も重要。','',
  '## AC bound blocker','', '| slot | percentage | group interaction | total |','|---|---:|---:|---:|');
for(const [slot,v] of Object.entries(a.cases.ac.boundReasons))add(`| ${slot} | ${v.reasons['buff-percentage']||0} | ${v.reasons['buff-group-interaction']||0} | ${v.blockerCount} |`);
add('', '合計74 candidate / 74 class。割合24、group interaction50。unknownは正式モデル不明とは限らず、現行加算proofで表現できないという意味。全件ID/name/slot/reasonはJSONのboundBlockerCandidatesに収録。代表例:', '');
for(const r of a.cases.ac.boundBlockerCandidates.filter(r=>r.reason==='buff-percentage').slice(0,18))add(`- ${r.name} / ${r.slot} / flat=${r.flat}, AC%=${r.pct} / ${r.reason}`);
add('', 'group interactionゼロ例: '+a.cases.ac.rows.filter(r=>r.retained&&r.zero&&r.boundUnknown).map(r=>r.name).join('、'),'',
  '## アース チェストベル','',
  'catalogId=official-defense-10557、candidateId=ov2:catalogId:official-defense-10557:quality:raw、category=defense、slot=装飾: 胸、race/gender=ALL、着こなし1、armorClass=0、Buff technic-3471「アース ベル」。正式catalog、候補、正式行、artifact、projection、proofの全内容はJSONのearthChestBellに保持。',
  'resolveEquipmentBuffRow → findEquipBuffRuleCandidate → applyEquipBuffRuleCandidateToEquipmentで、既存ruleのstats.extraACPct=5がequipBuffExtraACPct=5へ写る。equipmentBuffToCompositeRow/normalizeCompositeRows後はextraACPct=5、extraAC=0。候補ruleデータのverified=false等を根拠に独自のゲーム補完はしていない。現行正式経路が5を使用する事実を記録する。',
  'projection observedExtraは本体extraAC=0/extraACPct=0だが、semantics.buffs内にextraACPct=5が入る。buffStackKeys/name/autoStackGroup(__technic-3471)/same-technicも残る。protectedReasons=[resolved-buff-interaction]。',
  'additiveProofのAC pctField=extraACPct。buffExtra.extraACPctが非0なのでreason=buff-percentage、contribution=null、classification=unknown。rangeは選択済みIDのunknownを見てnullを返す。boundKindCoreはobjective boundを使えず、その枝を残す。',
  'AC正式metricはtotalStatValue(0,extraAC,extraACPct)。割合5%の増加量は構成全体のflat ACに依存するため、候補単体の固定加算contributionでは表現できない。これは値5が不明なのではなく、現行proofがflat×percentを上界化していないため。正式ACへ入る変換はこの経路になく、convMagicRate等は攻撃/速度向け。',
  `正式単品/組合せ確認: チェストベル単体=${a.earthChestBell.formalExample.earthOnly}、${a.earthChestBell.formalExample.partner}単体=${a.earthChestBell.formalExample.partnerOnly}、両者=${a.earthChestBell.formalExample.combined}。割合効果だけの単品score0を「常に寄与0」と誤認できない。`,
  'WarAgeの説明文は保持されるが、このSearchContextの正式モデルにWarAge切替はない。ここでゲーム条件を追加していない。','',
  '## 残るcode pathと設計意図/実態','',
  '1. filterReasonはslot/excluded/owned/race/gender/ammo/main weaponのみ。reduceはfixed-slot alternativeを追加。objective relevance filterは存在しない。対象値0や低値は除外条件でない。',
  '2. projectはobservedBase/observedExtraを目的別に絞る。本体attack/magicや他のextra statusが無条件にkeyへ入っているわけではない。ACでHP/命中を、skillPlusでACを本体数値として保持する射影ではない。',
  '3. ただしweapon={damage,interval,weight,range,twoHanded,requirements,projectileKind,ammoKind,motion}はobjectiveにかかわらず残る。AC/skillPlus値へ直接不要なdamage/interval/rangeの差がクラスを分割している。一方hand/ammo/weapon presenceには構成可能性の意味があり、weaponを丸ごと削除してよい証明ではない。',
  '4. category/weaponType/weaponHand/quality/race/gender/requirements/rawRequirements/hardConflictsも残る。必要条件を区別する意図がある。単独field省略0という結果は「不使用」ではなく、他fieldが同じ差を保持している場合がある。',
  '5. Buffは数値効果だけでなくname/tags/stack ruleや対象外ステータス、対象外skillPlusも保持。skillPlus-only、groupなし、他の効果なしの場合だけ未観測skillを省く例外がある。実データのtarget106件はその例外に該当せず保護される。',
  '6. compositeGroupScoreは攻撃/魔力/AC/他skillPlus等をwinner priorityへ使う。対象外の値でも、対象Buffとgroupが接続される場合は正式metricに間接影響し得る。display-only payloadはmetric直接入力でなくてもhasEffect判定やstack選択へ関わるため、無条件削除は別証明が必要。',
  '7. protectedな候補はgroups.set(protected:candidateId,[e])になり、equivalenceKey末尾にもcandidateIdが入る。Buff違いだけでなく、完全に同じprojectionでも保護candidateを別singletonにする。ACはこのidentity保護だけを外す机上比較で6611→6002、skillPlusは4849→4156。',
  '8. dominatesはfingerprint同一かつlegacy crit/delay axesの差だけ。今回は両axes=0なのでAC/skillPlus数値dominanceは実施されない。Top20ではさらにstrict dominance無効。topK=1へ変えてもAC/skillPlus数値Paretoが自動的に実行されるわけではない。',
  '9. B&Bはslotごとにclassesとnullを探索する。emptyはカタログcandidate/classでなくnullであり、objective0の実装備クラスと統合されない。既存装備条件/Top-K keyの意味は維持される。全17slotを探索し、ゼロ寄与slotを省くrelevance処理はない。','',
  '## 判断（実装しない）','',
  '- AC 6611は必要な数値種類が6611あるためではない。保護2979、武器性能の過剰区別、数値dominance/relevanceがないことが主因。既知局所ゼロ1547クラスと厳格な数値下位1762クラスが残る。ただしAC正次元3763クラス・割合/競合74クラスがあり、削除だけでは割合枝の性能問題を解決しない。',
  '- skillPlusは正106/4849（約2.19%）、残りゼロ4743。対象とは無関係なweapon performance、保護singleton2873ゼロ、未実装relevance filterが主要因。34.1百万ノードの多くが下流の大量の右手代替に費やされ、unknown groupを選んだ枝ではboundが使えない。',
  '- 汎用SearchContext-awareな観測/依存判定を精密化する余地は大きい。机上数値種類1304/50や依存接続4190/138は安全な最終候補数ではない。固定・除外・所有・装備条件・空装備・Top20多重性とgroup依存を証明してから評価すべき。',
  '- AC専用探索エンジンが必須とはこの監査から言えない。まず汎用射影/依存契約を正す方向が妥当。ただしそれだけで実用時間内完走が保証されるとも言えず、AC割合/競合へ安全なmetric-specific扱いが別に必要かは次の検証課題。',
  '- 対象skillPlusのSparse Exactは有力。106件＋競合依存closure32件の138件は調査上の候補コアだが、hand/ammo等のゼロ寄与構造選択、外部Buff、Top-K同値性を含む安全性は未証明。単純にそれ以外を除外する案は採用していない。',
  '- DPSは武器damage/interval/変換/遅延/クリティカルの非線形依存があり、この単純metric relevanceとは別の課題として扱うべき。','',
  '## 使用ファイルと検証','',
  '- src/optimizer-v2/candidates.js、searchContext.js、metrics.js、effectiveCandidates.js、evaluationSession.js、branchAndBound.js（読み取りのみ）',
  '- src/main.js、src/calc/core.js、src/data/generated/equipmentCatalog.generated.js、ammoCatalog.generated.js、buffCatalog.generated.js、equipBuffRuleCandidates.generated.js、skillBuffCompatibility.generated.js、damageBuffCompatibility.generated.js、src/data/manual/buffRules.manual.js（読み取りのみ）',
  '- tools/inspect-optimizer-v2-context.cjs、inspect-optimizer-v2-objectives.cjs、inspect-optimizer-v2-candidates.cjs、benchmark-optimizer.cjs（既存runtime）',
  '- 新規未追跡: tools/audit-optimizer-v2-relevance.cjs、tools/render-optimizer-v2-relevance-audit.cjs、docs/optimizer-v2-relevance-audit.json、docs/optimizer-v2-relevance-summary.json、docs/optimizer-v2-relevance-tests.log、本記録',
  '- 全テスト64/64成功（78.204秒）。対象skillPlus106件の通常正式単品評価も一致。既存探索を再起動していない。',
  '- git diff --check成功。追跡済みファイル変更なし。新規調査成果のみ未追跡。既存未追跡ファイルの削除/移動/stageなし。commit/pushなし。','');
fs.writeFileSync('docs/optimizer-v2-relevance-audit.md',lines.join('\n'));
