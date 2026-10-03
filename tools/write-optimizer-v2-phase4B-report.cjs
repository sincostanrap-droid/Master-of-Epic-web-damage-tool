const fs=require('node:fs');
const before=require('../docs/optimizer-v2-phase4B-before.json').cases.B,after=require('../docs/optimizer-v2-phase4B-after-prepared.json'),prefix=require('../docs/optimizer-v2-phase4B-final-prefix.json'),audit=require('../docs/optimizer-v2-phase4B-candidate-audit.json');
const destru=require('../docs/optimizer-v2-phase4B-destruction-regression.json').cases['破壊魔法'],healing=require('../docs/optimizer-v2-phase4B-healing-regression.json').cases['回復魔法'];
const n=x=>x.toLocaleString('en-US'),sec=x=>(x/1000).toFixed(2),q=x=>JSON.stringify(x),d=after.diagnostics,m=d.magicUpperBound;
const slots=Object.entries(after.slotBefore).map(([s,b])=>{const a=after.slotAfter[s];return `| ${s} | ${b.classes} | ${a.classes} | ${b.directFlat} / ${a.directFlat} | ${b.buffFlat} / ${a.buffFlat} | ${b.buffPct} / ${a.buffPct} | ${b.interactionOrConservativeOnly} / ${a.interactionOrConservativeOnly} | ${b.structuralOnly} / ${a.structuralOnly} |`;}).join('\n');
const top=after.top.map((r,i)=>`| ${i+1} | ${r.score} | ${r.names.map(x=>x[1]).join('、')} |`).join('\n');
const log=fs.readFileSync('docs/optimizer-v2-phase4B-tests.log','utf8');
const relative=(s)=>s.replace(/\\/g,'/');
const text=`# Optimizer v2 Phase 4B — Magic Objective Exact Fast Path

実装・安全性検証済み。**実カタログのExact完走は未達**。120秒で停止し、結果は exact:false として保存した。候補削減と上界により正式評価の膨張は解消したが、探索木の完走を保証できていない。途中Top20は確定最適解ではない。

## 開始状態・変更範囲

HEAD/checkpoint: afb5e8d2bf928cea5017c944e6c7e4da679680cf（Implement specialized catalog search and manual optimizer test UI）。checkpointは既存、追加commit不要。開始時 tracked変更は src/optimizer-v2/branchAndBound.js のPhase 4Aと docs/specialized-equipment-search-facet-audit.json の生成記録。Phase 4A・primary/secondary監査の未追跡ファイルも保持した。reset/restore/checkout/stash/stage/commit/pushは実施していない。

Phase 4B変更:

- src/optimizer-v2/branchAndBound.js：magic専用source envelope、正式exclusive bucket、prepared suffix、diagnostics、inspectMagic。Phase 4Aの変更を保持。
- src/optimizer-v2/facetSearch.js：固定contextの依存closureとstrict K-safe replacement。既存class keyは変更しない。
- tests/optimizerV2MagicFastPath.test.cjs：独立全列挙・上界安全性・ON/OFF・ID/alias・19/20/21境界・固定入力・nonfinite fallback。
- tools/benchmark-optimizer-v2-magic.cjs：診断専用のbefore/after、ノード数/時間停止、正式再評価。
- tools/audit-optimizer-v2-magic.cjs：カタログ全体のhard filterと候補/class集計。
- tools/write-optimizer-v2-phase4B-report.cjs：保存JSONから本レポートを生成。
- docs/optimizer-v2-phase4B-*：生JSON、テストログ、本レポート、git記録。

正式計算 src/calc/core.js、Buff resolverを含むsrc/main.js、UI/index.html、AC数学/Reducer、DPS、skillPlus fast-path仕様、secondary仕様を変更していない。既存生成監査JSONはテストが更新する時刻・時間値のみ。

## 再現条件

ブラウザの過去1400秒入力を取得していない。Phase 4A/監査と同じ明示的CLI DEFAULT_STATE基準。

- objective: magic/max、secondaryなし、constraintsなし、Top20。
- race: ${after.context.race}。skillSim精神力: ${after.context.skillSim.skills['精神力']}、inputs.spirit: ${after.context.inputs.spirit}。
- 関連skills（精神力、着こなし、刀剣ほか）: DEFAULT_STATEでは全0。全値はafter-prepared.jsonのcontext.skillSim.skillsに保存。
- fixed external Buff: 空。masteryの追加条件もこの入力では不成立。
- fixed/excluded: 空。gender filter: ${after.context.gender}。ownedOnly: ${after.context.ownedOnly}。
- 17slot。既存fewestの**削減前slot順を保持**。候補の既存ID順、null順、比較契約を維持。明示的slotOrderの既存fixtureも維持。

適用条件: magic/max、secondary/constraints/fixedCandidateIds/excludedCandidateIdsなし。これ以外は従来汎用経路。replacement削減はmainWeaponSkill指定時や非正/非finite割合で安全証明できなければ0件。boundは合法性を楽観緩和できる場合のみ。診断OFF: prepare(...,{magicReduction:false})、run(...,{magicBound:false})、magicPreparedBound:false、boundMode:'none'。

## 正式magicの唯一の経路

src/calc/core.js computeMetrics() と src/main.js の次の処理を追跡した。

1. SearchContextがskillSim精神力を正式inputs.spiritへ固定し、raceをinputs.raceSelectへ渡す。基礎値はcomputeMetricsが返すbaseMagicFromSpirit（spirit × RACE_MAGIC_COEFFS）。boundはこの正式出力を取得し、種族式を別実装しない。
2. normalizeEquipmentRows → expandEquipmentBuffState → applyBuffGroupRules。Equipment BuffはresolveEquipmentBuffRowのreviewed/manual/generated構造化結果を正式Composite行へ展開。
3. 有効装備のrow.magicをequipmentRaw.magicへ合計。装備要求スキル不足でこのmagicは減衰しない。
4. expandCompositeState() がactive Composite.flatMagicをflat(target=magic)へ、magicPctをpct(target=magic)へ追加。
5. normalizeFlatRows(st)のenabledなmagic行をequipmentRaw.magicへ足し、baseMagicFromSpiritと合計。
6. applyPercentStats() はpct行の順に **x → x + x × percent/100** を繰り返す。ACの割合合算式とは違う。direct equipment magicPctはこの経路で読まれず、今回のdirect%分類は0。
7. calcConversions() はmagic等を攻撃力へ変換するが、stats.magicを書き換えない。magicへの逆変換/skillPlusからの増幅経路は現行formal codeにない。
8. objectiveはMetrics.read('magic') → metrics.stats.magic。最終構成は従来EvaluationSession/SearchContext.evaluate/computeMetricsで評価する。facet値の和を正式scoreとして返していない。

same-technic/latestはresolveEquipmentBuffRowsForSameTechnicの同一stackKeyの最新有効行1件。groupはresolveAllBuffRowsForGroupsのaccepted groupを占有した行だけ採用するgreedy正式ルール。manual/auto compatibility/tagsと複数group所属を公式helperから取得する。勝者をoptimizer側で固定しない。

external/masteryは開始時snapshotとして固定。ON/OFF、追加削除をoptimizerは行わない。固定Compositeが装備Buffと競合する可能性をclosureとboundへ含める。raw flat/pct行の扱いも正式コードどおり監査した。

## 候補監査とrelevance

| stage | candidate IDs / classes |
|---|---:|
| catalog | ${n(audit.catalog)} |
| hard prefilter（全catalog、今回条件） | ${n(audit.hardPrefilter)} |
| facet direct relevant candidate | 3,396 |
| Buff保守保持追加candidate | 2,420 |
| structural追加candidate | 485 |
| 既存relevance後・equivalence前 | 6,301 |
| 既存generic projection/equivalence | 4,560 |
| 既存facet-context equivalence | 2,621 |
| 新strict replacement削除 | 1,762 classes / 4,039 IDs |
| 保持equivalent IDs（不可逆mergeなし） | 2,262 |
| 最終探索代表 | **859 classes** |

requirementによる装備削除は0。今回条件のhard filterは0。正式数値の候補集計: direct flat magic ${n(audit.candidateCounts.direct)}、Buff flat ${audit.candidateCounts.buffFlat}、Buff% ${audit.candidateCounts.buffPct}、formal relevant union ${n(audit.candidateCounts.formalRelevantUnion)}。これらは重複あり。group/stack各${n(audit.candidateCounts.group)} candidate。単純なBuff有無を魔力関連と見なさず、以下の依存graphを作る。

起点: magic/flatMagic/magicPctのBuff source、fixed external/masteryの全formal group。
辺: 公式group（manual、auto、tags含む）とequipment stack key。
推移closure: **direct Buff 137 classes + interaction closure 79 classes**。魔力に届かないdisconnected Buffは2,085 classes。相対latest順だけでなく絶対orderがgroup priorityへ入るため、正式buffGroupResolveScoreのorder区間が他priorityと交差する場合はpayloadを落とさず保守fallbackする。今回orderSafe=true。

class分類（重複可）:

| category | before | after |
|---|---:|---:|
| direct flat magic !=0 | 1,071 | 704 |
| direct magic% | 0 | 0 |
| Equipment Buff flat magic !=0 | 3 | 3 |
| Equipment Buff magic% !=0 | 134 | 134 |
| direct flatとBuff%両方 | 101 | 101 |
| formal magic関連union | 1,107 | 740 |
| 正寄与sourceあり | 1,037 | 735 |
| 負寄与sourceあり | 71 | 6 |
| magic値0、normalized Buff保守/interaction | 1,487 | 114 |
| magic値0、normalized Buffなし | 27 | 5 |
| 合計0寄与 | 1,514 | 119 |
| explicit unknown/nonfinite protection | 0 | 0 |

旧保守分類の1,509は、normalized非magic Buff 1,487と、Buff宣言はあるが正式resolverでnumeric sourceがない22を含む。残る5は武器/弾丸構造候補。unknown説明文を数値化していない。未解釈説明があること自体と、現formal codeが数値sourceとして読むことは区別した。特殊magic変換は0。requirement/restrictionは元データに保持。

## slot別（各数値はbefore / after、重複あり）

| slot | old classes | new classes | direct flat | Buff flat | Buff% | interaction/保守のみ | numeric Buffなし構造等 |
|---|---:|---:|---:|---:|---:|---:|---:|
${slots}

胸445→75、胴264→72、頭250→80、装飾腰238→38。全slotのraw候補・個別class情報はcandidate-audit.jsonとafter-prepared.jsonに保存。

## safe reduction / equivalence / Top20

新equivalence/key/dedupe/null collapseは追加していない。既存metric-aware key、全normalized Buff payload、original/equivalent IDsを保持する。依存closure外で、正式order区間の安全性が確認できたBuffだけを**replacement比較用signature**から外せる。元class keyは変更しない。

signature: 既存facet signatureからdirect flat magicだけを除いたもの。slot、hand、weapon presence、twoHanded、projectile/ammo、restrictions、hard conflicts、protection、uncertain identityを保持。closure内Buffの全payload/stackを保持。requirementsは元candidateに保持し、正式magicへ影響しないという既存正式経路の証明だけを使う。

同一signature内で、最終的に保持するK=20 distinct classを先に決める。Aのdirect magicがBより高く、全completionで割合積が正で、最大forward-error budgetを差が厳密に超える場合だけBを削除する。same groupのwitnessは削除しない。負割合<=-100%、非finite、証明不能contextは削減しない。

Bを含む合法completionの他slotを固定し、20 witnessへ置換すると、合法性/関連Buff結果を悪化させず、正式magicがstrictly高い20個の異なる既存keyの構成が存在する。従ってBはglobal Top20に入れない。19個なら削除しない。同じclassの20 aliasesは数えない。削除IDsはequivalentへ混ぜず、20 witness IDsをdiagnostic provenanceとして保存。

無関係装備を単にnullに置き換えるだけでは、同scoreの別keyがTop20へ必要な場合を証明できない。このため119 zero classesを全削除していない。これは既存Top-K契約を保持するための安全側であり、新dedupe仕様ではない。

## safe upper bound

正式基礎値 + selected direct magic + remaining各slotのdirect range + fixed/selected/remaining Buff flat range をF=[Fmin,Fmax]へ含める。負flatも保持。Buffは競合で消え得るので0をrangeへ含める。

各magic%行は、正式逐次乗算の数学的factor (1+p/100) と不成立時1を含むintervalへ射影。group winnerを予測せず、**正式に最大1行しか成立しないgroup/stack**のsourceだけ、flat min/max・factor min/maxのrectangleへjoinする。direct装備magicをそのbucketへ入れない。1 sourceが複数exclusive keyに属する場合は1つのcertified keyへだけ割り当て、他の排他制約を捨てるrelaxation。排他keyのないsourceはsum/product fallback。

source/slot/fixed factor intervalsを積interval P=[Pmin,Pmax]へ含め、4隅 FminPmin/FminPmax/FmaxPmin/FmaxPmax の最大 + outward rounding budgetをupperにする。負%、-100%未満・符号反転も4隅で包含。正式x+x*p/100とbound側factor演算順のrounding差は、全source絶対flat量・最大intermediate factor growth・operation countによるNumber.EPSILON×128×Nのabsolute forward-error envelopeで安全側へ補う。非finite/overflow/極端なrounding budgetはknownにしない。

remaining各slotのfallback range / bucket membership / bucket rangeを一度だけ計算し、depth suffixをimmutableに準備。各nodeでremaining candidateを再走査しない。selected/fixedのwinnerを固定しない。magicが0のBuff sourceはbound内では恒等演算なので省略するが、Reducerのinteraction candidateや正式resolverからは除かない。診断でunprepared/prepared ON/OFFを比較可能。

数値pruneは従来どおり upper + slack < kthScore。magic tie pruneは接続しない。魔力はfloating pointで安全側paddingを持ち、今回equal upper=0回。skillPlusのinteger equality proofを無条件流用しない。score descending →既存metric-aware performanceKey ascending、同一key重複排除は維持。

実catalog bound blocker: **0**。未知の非finite sourceは選択branch/未決slotのみunknownとなり、そのslotをnull/別finite候補で確定すればknownへ戻ることをfixtureで確認。固定入力自体が不明な場合は全体fallback。final scoreは常にformal path。

## 10k prefix比較（実際はcooperativeの最初のyield: 10,048 nodes）

| | before | after |
|---|---:|---:|
| candidates before equivalence | 6,301 | 6,301 |
| search classes | 2,621 | 859 |
| elapsed | ${sec(before.search.elapsedMs)}s | ${sec(prefix.elapsedMs)}s |
| formal eval | ${n(before.search.diagnostics.completeConfigurationsEvaluated)} | ${n(prefix.diagnostics.completeConfigurationsEvaluated)} |
| objective prune | 0 | ${n(prefix.diagnostics.boundPrunedNodes)} |
| feasibility / tie prune | 0 / 0 | 0 / 0 |
| magic bound known / unknown | unsupported（専用callなし） | ${n(prefix.diagnostics.magicUpperBound.known)} / 0 |
| bound cumulative | ${(before.search.diagnostics.searchProfile.boundMs/1000).toFixed(4)}s | ${(prefix.diagnostics.magicUpperBound.totalMs/1000).toFixed(4)}s |
| best / kth（途中値） | 40 / 39 | ${prefix.top[0].score} / ${prefix.top.at(-1).score} |
| exact | false（node診断停止） | false（node診断停止） |

時間約${(before.search.elapsedMs/prefix.elapsedMs).toFixed(1)}倍短縮、正式評価${(100*(1-prefix.diagnostics.completeConfigurationsEvaluated/before.search.diagnostics.completeConfigurationsEvaluated)).toFixed(2)}%削減。beforeも正式評価はleafだけだったが、ほぼ全nodeがleafへ到達しboundがなかった。afterはleafに到達しても正式評価前のsafe boundで落ちる。DFS/formal評価の意味は変更していない。

準備: before ${sec(before.preparationMs)}s / after ${sec(prefix.setupMs)}s。after magic replacement reducer ${prefix.reduction.elapsedMs.toFixed(2)}ms。candidate preparationは既存projection/equivalence込みのsetup値。facet cold cacheは別計測（JSON参照）。search内proof準備は${(prefix.diagnostics.searchProfile.proofMs/1000).toFixed(2)}s、session等もsearch elapsedへ含む。診断CLIの比較用二重prepareはsetup/searchに含めず、productionでは追加実行しない。

prefixは探索木が変わるため同じTop20途中値とは限らない。旧実catalogは未完走なのでglobal Top20の旧新一致は実測できていない。完全parityは独立全列挙fixtureで検証。

## 実catalog node無制限試験（診断120秒停止）

| counter | result |
|---|---:|
| elapsed | ${sec(after.elapsedMs)}s |
| explored | ${n(d.searchNodes)} |
| formal eval | ${n(d.completeConfigurationsEvaluated)} |
| objective prune | ${n(d.boundPrunedNodes)} |
| feasibility / tie prune | ${d.feasibilityPrunedNodes} / ${d.tiePrunedNodes} |
| known / unknown | ${n(m.known)} / ${m.unknown} |
| magic bound cumulative | ${(m.totalMs/1000).toFixed(2)}s |
| bound average | ${(m.totalMs*1000/m.calls).toFixed(2)} microseconds |
| total bound/DFS hook profile | ${(d.searchProfile.boundMs/1000).toFixed(2)}s |
| formal time | ${(d.evaluationProfile.formalEvaluationMs/1000).toFixed(2)}s |
| computeMetrics time | ${(d.evaluationProfile.computeMetricsMs/1000).toFixed(2)}s |
| nodes/sec | ${Math.round(d.searchNodes/(after.elapsedMs/1000))} |
| exact | **false** |
| formal reevaluation parity（保存20構成） | ${after.formalParity} |

途中Top20: 65.1×6件、64.05×14件。全key・selected IDs・equivalent IDs・装備名をafter-prepared.jsonのtopへ保存した。完走していないので再現性2回目は実施していない。

## 残るボトルネック

upper<kth ${n(m.less)}、upper==kth ${m.equal}、upper>kth ${n(m.greater)}。unknownでboundが無効なのではない。最後depthの${n(d.nodesByDepth.at(-1))} nodes（${(100*d.nodesByDepth.at(-1)/d.searchNodes).toFixed(2)}%）が大半。固定slot順の末尾は頭80、胴72、胸75 classes。nullも含めるとこの3slotだけで81×73×76=449,388通り/上位prefix。複数groupのflat/%rectangleは実現不能な組合せも許すため、内部bound>kthのまま末端候補を大量に検査する。

Top20初充足node ${d.firstTopKFullNode}。暫定kth=64.05はnode ${n(d.kthScoreHistory.at(-1).node)}、formal630で到達。その後${n(d.searchNodes-d.kthScoreHistory.at(-1).node)} nodesで追加formalは0。停止時点でも先頭14decisionは最初の選択（nodesByDepthが各1）のまま。初期解の巡回と巨大な末尾Cartesian productが支配し、正式評価630回が主因ではない。bound約88.37s、formal約5.86s。

今回禁止された候補順/slot順、secondary、dedupeや新Top-Kを変更しない。次はmagic単独の残存859 structural classes/strict witness不足と、group envelopeの実現不能rectangleが作る内部枝を監査すべき。魔力単独Exact完成を宣言せず、Phase 4C複合探索へ進める根拠にはしない。

## safety / parity / cache / 回帰

- 独立全completion列挙から852 partial statesで upper >= max(formal completion score) を直接検証。flat/%混在、negative % -150、group/latest、same technic/equipment stack、複数group所属、2HAND/null、要求不足、equivalent aliases、固定external/OFFを含む。
- Independent Brute Force Top20 score/key/rankと一致。bound OFF/ON、Reducer OFF/ON、prepared OFF/ON、既存descending探索順fixture、formal reevaluationの全metrics/IDs/aliasesが一致。
- K=19保持、20/21 strict witness削減、独立replacement completion全列挙、strictではないtie保持を検証。negative fixed Buffを0寄与candidateで抑制できるbridgeは削除しない。
- 要求刀剣100/現在0の武器でskillMod=0でもmagic+20は100%保持、external flat7込みflatStatRaw.magic=27。付加効果を武器本体性能と混同しない。
- Reprojection: 精神力0/40/100・external値変更でEvaluationSession signatureが異なる。元入力を後から150/999へmutateしてもsession評価は不変。magic proof/suffixは各reduction/runのcontextとcatalog snapshotから生成し、global再利用cacheを導入していない。race/objective/fixed state/catalog変更でも新context/session/preparationとなる。既存facet cacheは発見/分類用、formal winner/scoreの唯一の正に使わない。
- 破壊魔法 Phase 4A: ${sec(destru.elapsedMs)}s、906,559 nodes / formal827 / objective767,980 / tie39,315、Top20 all180、exact:true。
- 回復魔法旧完成条件: ${sec(healing.elapsedMs)}s、3,702,622 nodes / formal787 / objective2,984,107 / tie307,948、Top20 all205、exact:true。
- 上記2ケースともPhase 4A生JSONとTop20 score/key/selected IDs/equivalent IDs/順位/主要counter完全一致、非session正式再評価もtrue。
- error-budget-check.jsonに、新operation count 21,000でも全1,762 witness証明が成立し859 classesを維持する検証を保存。最小strict差0.19に対し誤差予算0.00013565。
- 全テスト **80/80、fail0**、${(Number(log.match(/duration_ms ([\d.]+)/)?.[1]||0)/1000).toFixed(2)}s。magic fixtureのformal reevaluation240回に加えてreplacement/bridge/snapshot/nonfinite fixtureも成功。Phase 4A generic skillPlusテスト、AC correctness/prepared/dominance、DPS、既存Optimizer、battle、skillSim、UI/catalog/search等の回帰テストを含む。
- git diff --check成功（CRLF変換案内のみ、diffエラーなし）。変更した通常UI/正式計算ファイルは0。commit/pushなし。

生データ: before.json / final-prefix.json / after-prepared.json / candidate-audit.json / destruction-regression.json / healing-regression.json / tests.log（全てoptimizer-v2-phase4B-接頭辞）。git status全文はoptimizer-v2-phase4B-git-status.log。

## 保存した途中Top20（確定結果ではない）

${top}
`;
fs.writeFileSync('docs/optimizer-v2-phase4B-magic-fast-path.md',text);
