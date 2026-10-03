const fs=require('node:fs'),cp=require('node:child_process');
const read=name=>JSON.parse(fs.readFileSync(`docs/optimizer-v2-phase4C-${name}.json`));
const b=read('benchmark'),a=read('audit'),f=read('fixtures'),reg=read('skillplus-regression'),old=read('group-only-benchmark').runs.find(r=>r.mode==='old'),r=b.runs.find(r=>r.mode==='new'&&r.diagnostics.exact),d=r.diagnostics,l=d.lexicographic,h=l.history;
const ms=x=>x.toFixed(2),tuple=x=>`(${x.primary}, ${x.secondary})`,first=h.find(x=>x.bestPrimary===180),full=h.find(x=>x.kthPrimary!==undefined),opt=h.find(x=>x.kthPrimary===180),point=a.ordering.find(x=>x.lexicographicOrdering==='primaryMagic');
const finalLog=fs.existsSync('docs/optimizer-v2-phase4C-tests-final.log')?fs.readFileSync('docs/optimizer-v2-phase4C-tests-final.log','utf8'):'';
const tests=/ℹ pass 86\r?\nℹ fail 0/.test(finalLog)?'最終全体再実行: 86/86 pass、failure 0。初回85/86の旧監査API呼出しを修正して再検証。その後componentwise safetyを強化したfixtureも単独再実行pass。':'全体初回85/86 pass。旧監査のconfiguration APIをmetric-aware APIへ修正して対象再実行pass。最終全体再実行は未完了。';
const values=[
 ['checkpoint commit SHA','151423f8bf0625605efdba8d0a67e1b309a6a3e3'],
 ['開始git status','main、working tree clean、origin/mainより17 commits ahead'],
 ['変更ファイル','末尾のgit status。production 3ファイル、tests 3ファイル、診断toolsとPhase4C監査成果物'],
 ['fast-path適用条件','skillPlus max → magic max、constraints/fixed/excluded/mainWeapon指定なし、整数正寄与の既存primary proofが利用可能。その他はgeneric Exact'],
 ['primary semantic','Search Specification → context.objective.skillName → skillPotentialProof.spec。facetのskillPlus:<target>を使用'],
 ['secondary semantic','context.secondary.metric === magic、direction === max。既存magicProofを共有'],
 ['破壊魔法hardcode','productionに追加なし。benchmarkだけ破壊魔法を選択。回復魔法・キックfixtureも通過'],
 ['combined candidate generation',`catalog ${a.catalogTotal} → facet prefilter ${a.facetPrefilter.relevant} → union/closure → equivalence → magic strict-K replacement`],
 ['primary direct classes',a.primaryDirectClasses],['secondary direct classes',a.secondaryDirectClasses],['both classes',a.bothClasses],['interaction-only classes',a.interactionOnlyClasses],['conservative-only classes',a.conservativeOnlyClasses],
 ['equivalence前candidate数',a.equivalenceBefore],['equivalence後classes',a.equivalenceAfter],['final search classes',a.finalClasses],
 ['以前2621 classesとの比較','2621 → 580。既存Buff全保持へ戻していない'],
 ['skillPlus reducer再利用','MetricCandidateReducerの対象skill projection、group/stack/occupancy closure、正式order-priority safety guardを共有'],
 ['magic reducer再利用',`同じstrict-K replacementをprimary payloadも同値な構造内で適用。${a.magicReduction.oldClasses} → ${a.finalClasses}、除去${a.magicReduction.provenRemovable} class`],
 ['combined equivalence','target skillPlus、magic、接続Buffの全formal payload、group/stack/order、occupancy、restriction、weapon feasibilityを保持。無制約の両観測に影響しないrequirement本体情報だけ投影から除外'],
 ['SearchContext signature','既存EvaluationSessionがcanonical(context)全体を署名。primary/secondary、target、skillSim、race、external Buff、fixed/excluded、constraints、inputsを含む。prepared artifactのassertContextを維持'],
 ['EvaluationSession','既存sessionを1つ生成。final buildごとに正式評価1回'],
 ['final formal score','既存SearchContext.evaluate/EvaluationSession.evaluateがscore・secondaryScoreを同時取得。projectionはfinal scoreに使わない'],
 ['lexicographic comparator','既存better(): primary rankScore desc → secondaryRankScore desc → UTF-16 configuration key asc。変更なし'],
 ['primary upper bound','既存generic group-aware/prepared-suffix upperと、下記one-slot/one-clique suffix DP upperのmin。証明不能なら既存bound'],
 ['secondary upper bound','Phase4B-4のrectangle → prepared slot-coupled envelope → 既存group interval。shared magicBoundKind'],
 ['tuple bound構造','(P_ub, M_ub)。P_ub > kth PならMを計算しない。P_ub == kth PでのみMを評価'],
 ['tuple安全性','各completionを独立にP_ub/M_ubが覆うため、両値が同一buildで実現可能でなくても安全。unknown/equality-key枝は保持。2,100 partialでP/Mの独立completion最大値もそれぞれ検証'],
 ['magic lazy呼出条件','Top-K充足、P_ub == kth.primary、magic proof利用可能、magic bound有効のときだけ'],
 ['primary bound calls',l.primaryCalls],['primary prune数',l.primaryPrunes],
 ['magic cheap bound calls',d.magicRectangleBound.calls],['magic strong bound calls',`prepared coupled ${d.magicCoupledBound.calls}、legacy group ${d.magicUpperBound.calls}、Cartesian joint 0`],
 ['secondary prune数',l.secondaryPrunes],['tie prune数',d.tiePrunedNodes],
 ['primary bound cumulative time',`${ms(l.primaryMs)} ms (${ms(l.primaryMs*1000/l.primaryCalls)} µs/call)`],
 ['magic bound cumulative time',`${ms(l.secondaryMs)} ms。rectangle ${ms(d.magicRectangleBound.totalMs)}、coupled ${ms(d.magicCoupledBound.totalMs)}、legacy ${ms(d.magicUpperBound.totalMs)} ms`],
 ['slot ordering','production: primary potential desc、同点magic potential desc。current / primary / primaryMagic / pruningの4案を10k nodesで診断'],
 ['candidate ordering','primary optimistic contribution desc → magic optimistic completion desc → 既存stable順。初期discoveryではchild primary UBとselected cliqueに対する増分で並べ替え。score/pruneとは独立'],
 ['first primary=180 node/time',`node ${first.node} / ${ms(first.ms)} ms (proof/session準備込み)`],
 ['kth primary=180 node/time',`node ${opt.node} / ${ms(opt.ms)} ms`],
 ['primary180内magic改善',h.filter((x,i)=>!i||x.bestSecondary!==h[i-1].bestSecondary).map(x=>`${x.bestSecondary}@node${x.node}`).join(' → ')],
 ['Top20初回充足',`node ${full.node} / ${ms(full.ms)} ms。充足時からkth primary180`],
 ['old generic combined benchmark',`${old.classes} classes、${ms(old.elapsedMs)} ms、${old.diagnostics.searchNodes} nodes、formal ${old.diagnostics.completeConfigurationsEvaluated}、best ${tuple(old.top[0])}、kth ${tuple(old.top.at(-1))}、exact:false (30秒上限)`],
 ['new 10k benchmark',`${ms(point.elapsedMs)} ms、formal ${point.diagnostics.completeConfigurationsEvaluated}、primary prune ${point.diagnostics.lexicographic.primaryPrunes}、secondary prune ${point.diagnostics.lexicographic.secondaryPrunes}、best ${tuple(point.top[0])}、kth ${tuple(point.top.at(-1))}`],
 ['new 100k benchmark','55,153 nodesでExact完了のため到達不要'],['new 500k benchmark','Exact完了のため到達不要'],['new 1M benchmark','Exact完了のため到達不要'],
 ['final explored nodes',d.searchNodes],['formal evaluations',d.completeConfigurationsEvaluated],['best tuple',tuple(r.top[0])],['kth tuple',tuple(r.top.at(-1))],
 ['Top20 primary distribution','180: 20 builds'],['Top20 secondary distribution',r.top.map(x=>x.secondary).join(', ')],
 ['primary最大distinct build数','少なくとも20 canonical distinct buildsを正式評価で確認。枝刈りした領域の全件数は数えていない'],
 ['単純P*限定の安全性','このcontextは最大primaryだけでTop20充足。ただしgeneric correctness条件には使わない。19件fixtureでは下位primaryを保持'],
 ['tuple safety partial数',f.tupleSafetyPartials],['tuple safety violations',f.violations],
 ['Independent Brute Force parity',`original catalog fixtureの独立正式全列挙 ${f.independentFormalCompletions} completions、${f.parityRuns} runs、K=1/5/20でscore/key/IDs/順序/exact一致`],
 ['bound OFF parity','all OFF / primary only / primary+magic、完全一致'],['ordering parity','current / primary / primaryMagic / pruning、ascending / descending、全fixtureの完走結果一致'],
 ['primary最大19件fixture','180が19件 + 179が複数。Top20に179が1件入る。A(180,100) > B(179,999)も固定'],
 ['requirement不足fixture','必要刀剣100、現在0、mod0。skillPlus +10 / magic +5は正式評価で100%有効'],
 ['Equipment Buff conflict fixture','skillPlus/magic group、same-technic/latest、複数slot、negative magic%、occupancy、external固定、null/alias/tieを独立正式全列挙と比較'],
 ['fixed fixture','generic fallback、独立正式全列挙Top5 parity、exact:true'],['excluded fixture','generic fallback、独立正式全列挙Top5 parity、exact:true'],
 ['search elapsed',b.runs.filter(x=>x.mode==='new').map(x=>`${ms(x.elapsedMs/1000)}秒 (candidate preparation ${ms(x.prepareMs/1000)}秒)`).join(' / ')],
 ['exact',b.runs.filter(x=>x.mode==='new').every(x=>x.diagnostics.exact)?'true (2回とも全探索終了)':'false'],['2回目再現性','Top20 primary/secondary/key/candidate IDsとnodes/formal/prunes/bound calls完全一致'],
 ['未完走時残存構造','最終pathは完走。旧group-only pathは120秒未完走。raw depth/costはgroup-only-benchmark.jsonに保存'],
 ['破壊魔法単独回帰',`${ms(reg[0].elapsedMs/1000)}秒、exact:true、Top20/key/IDs/主要counter一致、formal ${reg[0].counters.completeConfigurationsEvaluated}`],
 ['回復魔法単独回帰',`${ms(reg[1].elapsedMs/1000)}秒、旧完成条件exact:true、Top20/key/IDs/主要counter一致、formal ${reg[1].counters.completeConfigurationsEvaluated}`],
 ['magic単独回帰',`${ms(a.magicRegression.elapsedMs/1000)}秒、859 classes、68,113 nodes、exact:true、best ${a.magicRegression.best} / kth ${a.magicRegression.kth}、Top20/key/IDs一致`],
 ['AC回帰','既存AC/group/percentage/strict-replacement/formal tests通過。計算変更なし'],['DPS回帰','既存DPS/formal/session tests通過。計算変更なし'],['全テスト結果',tests],
 ['git diff --check','成功。LF→CRLF warningのみ、whitespace errorなし'],['formal calculation無変更','src/main.js / 正式計算 / resolver / EvaluationSession / SearchContext無変更'],
 ['Top-K semantics無変更','heap/dedupe/configuration-key serialization/final comparatorの契約を保持。複合equivalenceは両観測のpayloadを保持'],
 ['UI無変更','UI/表示/Worker接続の変更なし。既存特化検索から内部で適用'],['commit/push','実行していない。HEADは開始checkpointのまま'],['最終git status','下記。既存変更の破棄なし。テスト生成した既存監査のtiming差分だけcheckpointへ復元']
];
if(values.length!==82)throw new Error('Expected 82 report fields, got '+values.length);
const status=cp.execFileSync('git',['status','--short'],{encoding:'utf8'});
const table=values.map(([k,v],i)=>`| ${i+1} | ${k} | ${String(v).replaceAll('|','\\|')} |`).join('\n');
const explanation=`# Optimizer v2 Phase 4C: skillPlus → magic Lexicographic Exact

実カタログ K=20 は2回とも Exact 完走。best **(180, 87.55)**、kth **(180, 86.52)**。候補 **580 classes**、探索 **55,153 nodes**、正式評価 **220 builds**。

## Single-pass と primary completion proof

既存のskillPlus group-aware上界とmagic prepared envelopeを1本のB&Bに接続した。P上界がkth primaryより低ければ即枝刈り、高ければsecondaryを評価せず保持。同値時だけ共有magic boundを使用する。primary/secondaryとも正式評価の値でheapを比較し、configuration keyの同値枝は保持する。P*領域限定や重み付きscoreはない。

独立group上界だけでは、1つの残りslotにある異なるcandidateから複数groupを得る緩和が残り、120秒でもprimary155領域から抜けられなかった。このため既存proofのpositive sourceとcertified cliqueだけを使うsuffix DPを追加した。候補あたりpositive sourceが1行以下であり、固定source合計が既存baseと一致するときだけ有効。最大8つのcertified cliqueを保持し、それ以外の競合は加算側へ緩和する。descriptionの推測はしない。

残りslotsから取得する保持clique集合Sの最大positive寄与をD_i[S]として開始時に準備する。各slotのtransitionはnullまたはcandidateの1 source。選択済み/固定sourceのclique最大値をW_g、非保持寄与をFとして、上界は **max_S(D_i[S] + Σ(g∉S)W_g) + F**。実際にselectedより改善するclique集合を選ぶことができ、改善しないremaining sourceはnullへ緩和できるので全completionを覆う。既存group上界とのminを使う。整数proofのoperation budget内なので丸めによる過小評価はない。複数sourceやunknownではこの追加proofを使用しない。

magicは既存prepared candidate vector/frontier/suffixとbranch push/popのincremental flat/log stateを共有。別のmagic scorerは作っていない。Cartesian joint strong bound/cacheは導入していない。候補削減は両objectiveのunion + resolver interaction closure。bound用projectionとfinal formal scoreを分離し、requirement不足でも付加効果を保持する。

## 完了報告 (要求82項目)

| # | 項目 | 結果 |
|---:|---|---|
${table}

## Ordering / cost / evidence

| ordering | 10k elapsed ms | best tuple | primary prune | secondary prune |
|---|---:|---|---:|---:|
${a.ordering.map(x=>`| ${x.lexicographicOrdering} | ${ms(x.elapsedMs)} | ${tuple(x.top[0])} | ${x.diagnostics.lexicographic.primaryPrunes} | ${x.diagnostics.lexicographic.secondaryPrunes} |`).join('\n')}

一次bound ${ms(l.primaryPrunes/l.primaryMs)} prunes/ms、secondary ${ms(l.secondaryPrunes/l.secondaryMs)} prunes/ms、全bound cumulative ${ms(d.searchProfile.boundMs)} ms。rectangle ${ms(d.magicRectangleBound.totalMs*1000/d.magicRectangleBound.calls)} µs/call、coupled ${ms(d.magicCoupledBound.totalMs*1000/d.magicCoupledBound.calls)} µs/call、legacy group ${ms(d.magicUpperBound.totalMs*1000/d.magicUpperBound.calls)} µs/call。時間には並行回帰テスト実行中のCPU揺れがある。再現性比較はcounter/結果を使用した。

magic既存安全性も回帰: original 1,704 partial / 3,408 joint checks / violation 0。coupled fixtureはsupported 1,704、全partial 2,556、joint 5,112、violation 0。回復魔法→magicの実カタログ10k-node smokeは新path有効、exactは中断のためfalse。

一次最大の全distinct件数や枝刈り領域のfalse-survivor率は再全列挙していない。完成したTop20で最大primary20件を確認する診断に限定した。次の性能課題は約22–29秒のcombined candidate preparation。汎用stat展開・secondary追加・UI変更は今回の対象外。

証跡: [benchmark](optimizer-v2-phase4C-benchmark.json)、[candidate/ordering/magic regression audit](optimizer-v2-phase4C-audit.json)、[independent fixtures](optimizer-v2-phase4C-fixtures.json)、[skillPlus regressions](optimizer-v2-phase4C-skillplus-regression.json)、[final tests](optimizer-v2-phase4C-tests-final.log)。再実行はtoolsのbenchmark/audit/regress/write report各runner。

最終working tree (report自身の作成タイミングによってuntracked一覧の追記のみあり):

\`\`\`text
${status}\`\`\`
`;
fs.writeFileSync('docs/optimizer-v2-phase4C-lexicographic-exact.md',explanation);
console.log('Wrote 82-item Phase 4C report');
