const fs=require('node:fs'),crypto=require('node:crypto');
const d=JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4B-1.5-tail.json')),c=JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4B-1.5-control.json'));
const pct=(n,t=d.diagnostics.searchNodes)=>(100*n/t).toFixed(3)+'%',num=n=>n.toLocaleString('en-US'),table=(heads,rows)=>[heads.join(' | '),heads.map(()=>'---').join(' | '),...rows.map(r=>r.join(' | '))].map(x=>'| '+x+' |').join('\n');
const sum=d.audit.at6405.reduce((s,x)=>({less:s.less+x.less,equal:s.equal+x.equal,greater:s.greater+x.greater}),{less:0,equal:0,greater:0});
const hist={};d.top.forEach(x=>hist[x.score]=(hist[x.score]||0)+1);
const profiles=d.diagnostics.searchProfile,call=d.diagnostics.magicUpperBound;
const rankedLevels=Object.keys(d.distinct.formalScoreHistogram).map(Number).sort((a,b)=>b-a);
const topMetrics=new Set(d.top.map(t=>d.audit.formals.find(f=>f.key===t.key).numericMetricsSignature)).size;
const known=call.calls,other=d.elapsedMs-profiles.prepareMs-profiles.proofMs-profiles.orderMs-profiles.sessionMs-profiles.boundMs-profiles.invalidNextMs-profiles.considerMs;
let report=`# Optimizer v2 Phase 4B-1.5 — Magic tail explosion audit

監査のみ。既存Phase 4A/4Bの未コミット変更を保持。探索・Reducer・上界・comparator・key・正式計算・UIは編集していない。commit / pushなし。

## 結論

主因は「最高魔力の同点枝をkeyのため残すこと」ではなく、弱い前段構成を固定したまま末尾のCartesian productを生成し、leafで初めて棄却すること。上界 == kth は **0**。${num(d.diagnostics.nodesByDepth[17])} leaf（全nodeの${pct(d.diagnostics.nodesByDepth[17])}）のうち${num(d.diagnostics.boundPrunedNodes)}が上界で棄却された。

停止時の最高65.1 / kth64.05に対し、同一SearchContextで正式魔力 **182** の合法構成を別途確認した。これは最適値の証明ではないが、探索が高魔力領域へ未到達である直接の証拠。同点差の問題も存在するが、等値bound枝が時間を消費しているという説明は今回の記録では成立しない。

## git / 変更範囲

開始時の追跡済み変更は docs/specialized-equipment-search-facet-audit.json、src/optimizer-v2/branchAndBound.js、src/optimizer-v2/facetSearch.js の3ファイル。Phase 4A/4Bおよび以前の監査の未追跡記録・CLI・テストも保持した。今回追加した診断は branchAndBound.js のソースを **隔離VM内で計測用に展開するだけ** で、リポジトリの同ファイルは編集していない。通常Optimizerへ診断hookは追加していない。

追加ファイル:
- tools/audit-optimizer-v2-magic-tail.cjs（120秒計測 / 10k通常経路parity）
- tools/analyze-optimizer-v2-magic-tail.cjs（関連signature / 正式witness / 固定node通常経路control / metrics再評価）
- tests/optimizerV2MagicTailAudit.test.cjs（独立全列挙5ケース）
- docs/optimizer-v2-phase4B-1.5-*（報告・生データ・Top20・テスト記録）
- tools/write-optimizer-v2-magic-tail-report.cjs（この報告生成）

全テストで既存の自動生成facet監査JSONの時間値が更新された。既存変更を戻す操作は行っていない。

## 再現条件

CLI基準条件。ブラウザの現在入力を取得した値ではない。

${table(['項目','値'],[['objective','magic / max'],['secondary','なし'],['constraints','[]'],['race',d.context.race],['精神力 / 着こなし / 他全skill','すべて0（skillSim autoApply=true）'],['external Buff','composite=[] / pct=[] / 有効flatなし'],['mastery','全skill0、生成有効masteryなし'],['fixed / excluded','[] / []'],['gender','null（性別指定なし）'],['Top-K',20],['catalog / retained classes','11,804 / 859']])}

初回facet・候補準備は探索120秒とは別。前Phaseと同じDEFAULT_STATEおよびSearch Specificationを使用。探索順はPhase 4Bの元2,621class時のfewest順を保持し、candidateはcandidateId.localeCompare順、nullは最後。

## 120秒再現と結果不変の確認

${table(['経路','探索秒','nodes','formal','objective prune','unknown','exact'],[['診断付き', (d.elapsedMs/1000).toFixed(3),num(d.diagnostics.searchNodes),630,num(d.diagnostics.boundPrunedNodes),0,'false'],['診断なし同一node prefix',(c.elapsedMs/1000).toFixed(3),num(c.diagnostics.searchNodes),c.diagnostics.completeConfigurationsEvaluated,num(c.diagnostics.boundPrunedNodes),0,'false'],['前Phaseの120秒記録','120.001','9,512,512',630,'9,386,637',0,'false']])}

今回の診断付きnode数は前Phaseより少ない。多数の計測カウンタを隔離VMに追加した経路であり、120秒のwall-timeでは同一node数を要求できない。小規模fixtureの実行も一時重なったため、120秒差を純粋な性能回帰と解釈しない。固定10,048nodeでは通常${(d.parity.offMs/1000).toFixed(3)}秒 / 診断${(d.parity.onMs/1000).toFixed(3)}秒、score/key/IDs/同等IDs/主要counter完全一致。さらに **7,860,992node全prefix** でも通常経路と完全一致。停止時Top20は前Phase120秒記録ともscore/key/IDsが完全一致した。通常formal再評価で全20件のscore・全metrics一致。

これは完走済みExact結果ではなく、**中断時の暫定Top20**。今回も exact:false。Top20を最適解として表示・報告していない。

## 時間の内訳

${table(['項目','秒'],[['plan preparation',(profiles.prepareMs/1000).toFixed(3)],['proof',(profiles.proofMs/1000).toFixed(3)],['order / session',((profiles.orderMs+profiles.sessionMs)/1000).toFixed(3)],['bound wrapper',(profiles.boundMs/1000).toFixed(3)],['うちmagic upper計算',(call.totalMs/1000).toFixed(3)],['invalidNext legality checks',(profiles.invalidNextMs/1000).toFixed(3)],['consider wrapper',(profiles.considerMs/1000).toFixed(3)],['うち正式評価',(d.diagnostics.evaluationProfile.formalEvaluationMs/1000).toFixed(3)],['うちcomputeMetrics',(d.diagnostics.evaluationProfile.computeMetricsMs/1000).toFixed(3)],['残りgenerator / bookkeeping / 診断等',(other/1000).toFixed(3)]])}

内包項目は加算しない。上界呼出${num(call.calls)}回、平均${(call.totalMs*1000/call.calls).toFixed(3)}μs、node当たり${(call.calls/d.diagnostics.searchNodes).toFixed(6)}回。正式評価は全nodeの${pct(630)}しかない。

## depth別nodeとbranch factor

depthのslotは「次に選択するslot」。そのslot選択の子はdepth+1に入る。したがって装飾胸を選んだ後の判定はleaf depth17に記録される。averageは中断までに実際に生成した子 / 展開親。最後の各depthの親は途中なので理論branch数より小さい。

${table(['depth / 次slot','class / null込','入ったnode','子生成','平均 / 最大','prune前候補総数','試行済み','子prune後','formal'],d.depthTable.map(x=>[x.depth+' '+x.slot,x.classes+' / '+x.choices,num(x.nodes),num(x.children),x.averageBranch.toFixed(3)+' / '+x.maximumBranch,num(x.available),num(x.attempted),num(x.postPruneChildren),x.formal]))}

prune前候補総数は展開親ごとのavailable choices総和。試行済みはそのうち実際にfor-loopに入った数。装飾胸の試行${num(d.audit.attempts[16])}と子${num(d.depthTable[16].children)}の1件差は中断yieldで子のnode加算前に停止した分。

## slot別実展開 / prune

${table(['slot','classes','null込','そのslotの子node','子のobjective prune','null試行'],d.depthTable.slice(0,17).map(x=>[x.slot,x.classes,x.choices,num(x.children),num(d.diagnostics.boundPrunesByDepth[x.depth+1]),num(x.nulls)]))}

頭81 × 胴73 × 装飾胸76 = **449,388** completions / 前段prefix。最初の13decision（弾丸〜防具手）はまだ最初のcandidateから戻っていない。装飾腰も39択のうち18択に入っただけ。指・耳・防具腰・背中は各最初の選択のまま。

全slotを単純Cartesian積にした理論数は約6.37×10^27。合法性とboundを無視した参考値であり、実際の探索必要node数ではない。

装飾胸の102,073親のうち、少なくとも **101,442親**（102,073 - 中断中1親 - formalを持ち得る最大630親）は全子が正式評価へ到達しない。親の少なくとも99.382%が空振り。上界を持つ内部親は閾値より高いため展開し、子を作った後で低いと分かる。

## kth履歴と上界分布

Top20初充足node37 / formal20。最終観測kth64.05到達node3,898,374 / formal630。これは全探索の最終kthの証明ではなく、今回の残りprefixで安定した値。

${table(['kth score','node','formal'],d.diagnostics.kthScoreHistory.map(x=>[x.score,num(x.node),x.formalEvaluations]))}

${table(['比較','Top20充足後全体','観測kth64.05到達後'],[['upper < kth',num(call.less),num(sum.less)],['upper == kth',call.equal,sum.equal],['upper > kth',num(call.greater),num(sum.greater)],['unknown',call.unknown,0],['Top20未充足node',37,'—'],['formal',610,0],['objective prune',num(d.diagnostics.boundPrunedNodes),num(sum.less)]])}

64.05到達後 ${num(d.diagnostics.searchNodes-3898374)}node、formal0、prune${num(sum.less)}。到達後のgreater ${num(sum.greater)}nodeは内部親だけで、leafのgreaterは0。

${table(['depth','< kth','== kth','> kth','64.05後 <','64.05後 >'],d.depthTable.map(x=>[x.depth,num(x.relations.less),x.relations.equal,num(x.relations.greater),num(x.at6405.less),num(x.at6405.greater)]))}

elapsedを厳密にrelation別計時してはいない。上界計算累積時間をcall数に比例配分した粗い寄与概算は less ${(call.totalMs/1000*call.less/known).toFixed(2)}秒 / greater ${(call.totalMs/1000*call.greater/known).toFixed(2)}秒 / equal0秒。実際のstage時間とは区別する。

## tie-aware dry-run

現在の実数upperで == kth は0件。安全prune候補0、key boundを使って残す必要があるequal枝0、判定不能equal枝0。unique subtree / 推定削減node / 推定削減formalはいずれも0。

既存optimisticTieKeyはcanonical slot順の最小tokenによる楽観的keyを返すため、同じ数値upperが閾値と厳密一致した時には既存の証明を使って比較できる。ただし魔力上界はrange4隅のraw最大に正の浮動小数点誤差余裕を足す（branchAndBound.js magicUpper）。数学的なraw値が閾値に一致しても、実際のsafe upperは > になる。**余裕を勝手に外してtie判定することは不安全**。今回raw == kthを安全tieと読み替えていない。

「key差だけで探索継続したequal-bound枝」は **0**。greater枝の全completionを正式計算していないため、その中の潜在的同点枝を別途0と断言してはいない。

## completion重複

探索で正式評価した630構成: 46 score / 195 conservative relevant signatures（scoreとの組） / 620 numeric formal metric signatures / 630 configuration keys。

増分を互いに排他的に分類する（全pairの分類ではない）:

${table(['分類','件数','630件中'],[['A 新scoreを初めて観測 / keyも新規',46,pct(46,630)],['B 既出score、relevant signatureは新規',149,pct(149,630)],['C 既出score + relevant signatureも既出',435,pct(435,630)],['D key同一 / candidate IDだけの差',0,'0%']])}

same-score評価は584/630 = ${pct(584,630)}。C435件があることはkeyに余分な区別が残る証拠だが、equivalence統合の安全性を証明・実装したわけではない。

別途、periodicな76node-window / 100,003node間隔で抽出した **5,855棄却leaf** を通常formal経路で再評価。全件合法、全件score < その時点のkth、same / aboveは0。280 distinct score、同値の繰り返し5,575件（${pct(5575,5855)}）。これは監査追加評価で、探索のformal630やTop20には入れていない。層化無作為標本ではないため全カタログへ比率を外挿しない。CLIの次回再実行では監査負荷を抑えるためこの標本を最大128件へ間引く。

未訪問の約6.37×10^27理論組合せの同じmagic数を正確に推定する根拠はない。今回判明した全leaf ${num(d.diagnostics.boundPrunedNodes)}件は safe upper < その時のkth なので、全completionを正式評価せずとも当時のTop20へ入れないと証明されている。これは「最上位score tieを探している」こととは違う。

## relevant signature試算の定義

診断signatureは既存のslot/hand/occupancy/hard conflicts/restrictions/direct magic/extraを保持。正式proofBuffsのmagic効果をseedに正式group/stack token closureを再計算し、connectedなBuffは **全prototype** を保持（非magic値でもwinner priorityに影響し得るため）。disconnectedなBuff/stackだけを診断signatureから落とし、protection/uncertainメタを除く。connected216 classes、残り643 classes。これはOptimizerへ適用していない、最小signatureでもなく、安全な新equivalenceの証明でもない。

## objective signature試算

以下は**今回実際にformal評価された列**からの集約だけ。実枝刈りを変更して再探索した結果ではない。

${table(['仮想mode','distinct件数','20充足node','630件からの重複entry削減'],[['1 magic score',d.distinct.counts[0],num(d.distinct.filledAt[0]),630-d.distinct.counts[0]],['2 score + relevant equipment signature',d.distinct.counts[1],num(d.distinct.filledAt[1]),630-d.distinct.counts[1]],['3 score + 全正式metrics',d.fullMetricsDistinct?.count??'metrics再評価待ち',d.fullMetricsDistinct?.filledAt??'—',d.fullMetricsDistinct?630-d.fullMetricsDistinct.count:'—'],['補足: 全数値metrics（非数値ラベル除外）',d.distinct.counts[2],num(d.distinct.filledAt[2]),630-d.distinct.counts[2]],['4 current configuration key',d.distinct.counts[3],num(d.distinct.filledAt[3]),630-d.distinct.counts[3]]])}

node削減量はこの表から計算不能。score-distinctならTop20充足が37→28,541nodeへ遅れ、観測済み46scoreの上位20distinctを採ると20位は${rankedLevels[19]}（現行64.05より低い）。その閾値を使うだけならむしろpruneが弱くなる。dedupeが速くなると決めつけられない。

現在Top20は 2 score / 8 relevant signatures / ${topMetrics} numeric metric signatures / 20 keys。scoreだけなら18重複entry、関連signatureなら12重複entryを表現上まとめられる。しかし表示集約と探索量削減は別問題。

## 現在のTop-K / key契約

1. rankScore descending（今回score = magic、max）
2. 同値ならsecondaryRankScore descending（今回なし、0）
3. 同値ならperformanceKeyのJavaScript文字列 < によるascending。

keyはJSON文字列。装備した非null classの [slot, equivalenceKey] をslot文字列のUTF-16順で並べる。nullは列自体を省略（null tokenを書かない）。equivalenceKey内部のobject fieldはstableなキー順。数値部分もJSON文字列として比較され、numeric natural sortではない。candidateId.localeCompareは探索順用で、結果tie比較とは別。

keyにはslot、hand、restriction、hard conflict、weaponRole/twoHanded/projectile/ammo、observed magic、observed extra、**全正規化Buff prototype**、stack key、protection等が入る。weapon damage/interval/range/raw requirementはこの魔力facet keyには入らない。他metricのBuff数値、Buff名、display-only extraEffectsは入る。全てが無関係とは限らず、connected Buffのwinner priorityに他metric数値が効く場合は必須。

candidateIdは通常keyに入らない。不明な保護がある場合だけuncertainとして入る仕組み。この実カタログのunknownProtectedは0。equivalent original IDsは順位を決めない。代表candidateはID順で復元し、同等IDsは結果に付く。heap内の同keyはkeys Setで重複登録しない。今回評価630件に同keyは無い。

現契約は「objectiveに不要な全差を完全に消す」契約にはなっていない。magic無関係のdisconnected Buff prototype等も残る。単なるcatalog ID差は同値化済みだが、非magic Buff差は別entryになり得る。今回これを変更しない。

## 暫定Top20

score分布: ${Object.entries(hist).map(([s,n])=>s+': '+n+'件').join(' / ')}。全20keyはdistinct。下表はkey全文のSHA256先頭12桁を表示し、**全文key、全candidate IDs、全slot装備、同等IDsは optimizer-v2-phase4B-1.5-top20.json** に保存。

${table(['順位','魔力','key SHA256先頭'],d.top.map((x,i)=>[i+1,x.score,crypto.createHash('sha256').update(x.key).digest('hex').slice(0,12)]))}

## 高魔力の合法witness

同一条件の正式再評価で魔力182、feasible:true、violations=[]。直接magic最大の候補を診断用に抽出した1構成で、Top20への挿入・warm start・探索順変更は一切していない。最大値の証明やおすすめ構成ではない。

${table(['slot','装備','本体magic'],d.highFlatWitness.equipment.map(x=>[x.slot,x.name,x.magic]))}

左手・弾丸はnull。全candidate IDはtail.jsonのhighFlatWitnessに保存。

## small fixtures

${table(['ケース','raw / class','current Top20 score分布','結果'],JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4B-1.5-fixtures.json')).map(x=>[x.label,x.raw+' / '+x.classes,JSON.stringify(x.histogram),'独立全列挙 = bound OFF = ON / exact:true']))}

最大21件なら全20件同score、最大19件なら20位には下位score。key-only差も20entryとして数える。ID-only24件は1class、nullと合わせて2entry。

## 遅さの分類と次フェーズ優先順位

**C（両方）だがnodeコストの主因は低品質prefixの末尾全展開。** completion評価側では A新score7.302% / B既出score92.698%。node側では <kth ${pct(call.less)} / ==kth0% / >kth ${pct(call.greater)} / 初充足前${pct(37)}。この2つの母集団は異なる。時間をA/Bへ厳密分配する根拠は無く、未訪問completionについてA/B比率を断言しない。

推奨順（実装なし）:

${table(['順','案','測定根拠 / 条件'],[[1,'D slot ordering改善の比較監査','最初の13decision固定、182の合法witnessに未到達。高影響decisionを早く決めた場合に親で棄却が早まるか同一Top20 parityで測る。改善node数は未測定。candidate orderingも現状ID順だが今回は変更なし。'],[2,'E suffix DP / suffix探索構造','末尾親102,073の99.382%以上が空振り。各親で76子生成せず安全な代表/要約で扱えるか。Buff競合・key・Top20・浮動小数点順序を維持する証明が必要、現時点の削減量は未測定。'],[3,'B relevant metric key整理','630→195 signature、Top20 20→8を診断確認。connected priorityを落とさない証明と互換性方針が必要。key整理だけで何node減るかは未測定。'],[4,'F 代表構成＋同値一覧表示','Top20 2score/8関連signatureは視認性改善余地。表示集約だけではnodeは減らない。'],[5,'A objective-aware tie pruning','実upper == kth0、既存条件による削減見込み0。rounding余裕込みでも安全なtie証明を別途作れない限り本命ではない。'],[6,'C objective distinct result mode','別Top-K契約。20充足28,541node、20位のscoreが下がりprune悪化の可能性。今回の速度問題の直接解決策とは言えない。']])}

先にDを**測定比較**し、効果が小さければ末尾の全子棄却構造をEの対象として分析する。B/C/Fは結果の意味・表示の問題と区別する。上界のtightnessが内部親で不足するという問題も確認できたが、今回上界を変更せず、どのsafe relaxationが何nodeを余分に生むかは次の監査で測定する。

## validation

全テスト81/81成功、fail0（230.783秒）。既存80件および追加fixture1件。git diff --check成功（LF→CRLF注意表示のみ）。固定10kおよび7,860,992nodeで通常/診断counter・Top20 score/key/rank/IDs/同等IDs完全一致。Top20全metrics正式再評価一致。今回起動した探索・監査CLIは各tool sessionの正常終了を確認。commit / pushなし。最終git statusは optimizer-v2-phase4B-1.5-git-status.log。
`;
fs.writeFileSync('docs/optimizer-v2-phase4B-1.5-tail-audit.md',report);
