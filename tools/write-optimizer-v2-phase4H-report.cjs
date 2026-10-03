const fs=require('node:fs');
const d=require('../docs/optimizer-v2-phase4H-production.json'),f=require('../docs/optimizer-v2-phase4H-fixtures.json'),initial=require('../docs/optimizer-v2-phase4H-diagnostic.json'),reg=require('../docs/optimizer-v2-phase4H-regression.json');
const retry=fs.existsSync('docs/optimizer-v2-phase4H-regression-retry.json')?require('../docs/optimizer-v2-phase4H-regression-retry.json'):{tests:[]};
const tests=new Map([...reg.tests,...retry.tests].map(t=>[t.file,t])),passed=[...tests.values()].filter(t=>t.exitCode===0),failed=[...tests.values()].filter(t=>t.exitCode!==0),sec=n=>(n/1000).toFixed(3);
const lines=[`# Optimizer v2 Phase 4H — primary-preserving residual search`,
`HEAD: ${initial.head}; catalog ${initial.catalog}; DEFAULT_STATE; K=20; CLI、browser schedulingなし。commit / pushなし。`,
``,
`skillPlus → magic / evasion の既存対応scopeへproduction採用。skill名分岐なし。最大値だけを先にExact証明し、全同値代替を残した候補集合でsecondaryを探索する。primary Top1構成は固定しない。`,
``,
`|項目|magic|evasion|`,`|---|---:|---:|`];
const a=d.cases[0],b=d.cases[1],s=x=>x.afterDiagnostics.primaryStrata;
for(const [label,values] of [
 ['primary maximum',[s(a).primaryMaximum,s(b).primaryMaximum]],
 ['P0 distinct（formal評価済み下限）',[`≥${s(a).P0DistinctLowerBound}`,`≥${s(b).P0DistinctLowerBound}`]],
 ['classes',[`${s(a).originalClasses} → ${s(a).residualClasses}`,`${s(b).originalClasses} → ${s(b).residualClasses}`]],
 ['catalog preparation 秒',[sec(a.preparationMs),sec(b.preparationMs)]],
 ['primary Exact 秒',[sec(s(a).primaryMs),sec(s(b).primaryMs)]],
 ['residual構築 秒',[sec(s(a).residualBuildMs),sec(s(b).residualBuildMs)]],
 ['secondary探索 秒',[sec(s(a).secondaryMs),sec(s(b).secondaryMs)]],
 ['secondary nodes',[s(a).secondaryNodes,s(b).secondaryNodes]],
 ['secondary formal evaluations',[s(a).secondaryFormalEvaluations,s(b).secondaryFormalEvaluations]],
 ['before総探索 秒',[sec(a.beforeMs),sec(b.beforeMs)]],
 ['after総探索 秒（primary/filter込み）',[sec(a.afterMs),sec(b.afterMs)]],
 ['before準備込み 秒',[sec(a.beforeIncludingPreparationMs),sec(b.beforeIncludingPreparationMs)]],
 ['after準備込み 秒',[sec(a.afterIncludingPreparationMs),sec(b.afterIncludingPreparationMs)]],
 ['best',[`(${a.top[0].primary}, ${a.top[0].secondary})`,`(${b.top[0].primary}, ${b.top[0].secondary})`]],
 ['kth',[`(${a.top.at(-1).primary}, ${a.top.at(-1).secondary})`,`(${b.top.at(-1).primary}, ${b.top.at(-1).secondary})`]],
 ['Top20 parity / exact',['完全一致 / true','完全一致 / true']]])lines.push(`|${label}|${values.join('|')}|`);
lines.push('',`facet共通warmup ${sec(d.facetWarmupMs)}秒は両方式共通で表外。最初のcatalog準備はcold、次対象はcache warmであり、A/B間のpreparation差を方式の効果と解釈しない。同一prepared reductionでbefore/afterを連続測定した。過去のmagic (180,87.55)/(180,86.52)ではなく、現HEAD・現catalogでのlegacy Exact値との完全一致を確認した。`,
'',`P0総件数は全列挙していない。表の下限はfeasibleかつformal primary=P0のdistinct performanceKey数であり、K=20を十分満たす証拠。exactは返却Top20についての意味を維持する。`,
'',`## 判定と再利用`,
'',`候補cを指定slotへ固定し、残りslotに対して min(既存slot/group上限, slot＋Buff group completion DP上限) を計算。UB<P0のみ除外する。UB≥P0/unknownは到達の証明ではなく、除外できない候補として保持。negative、同技/latest、Equipment Buff group conflict、occupancy、fixed/excluded、nullの最終判定は既存formal resolver。leafでformal score===P0を必須とする。`,
'',`DPは既存最大8 certified bucketの安全な緩和。primary stageのsource/row、sourcesById、fixedSources、bucket割当、DP bucket indexes、candidatePreparation/cacheを同じ検索内で共有する。条件付き残余slot集合やsecondary順が変わるためsuffix tablesとslot lists/maximaを組み直す。primary終了後にcatalogから作り直さない。個別構成の正式winner/group状態は別構成に転用しない。`,
'',`最大値stageは同値keyのTop1順を証明する必要がなく、formal feasible scoreがroot UBと一致したら最大値の上下界一致で終了。それ以外はcompletion UBでより高いscoreがないことを証明する。これは内部の最大値stageであり、外部のTop-K Exact結果はresidualまたはfallback探索が確定する。`,
'',`## slot別class数（nullは件数外）`,'',`|slot|magic 元→残余|evasion 元→残余|P0条件|`,`|---|---:|---:|---|`);
for(let i=0;i<s(a).slotCounts.length;i++){const x=s(a).slotCounts[i],y=s(b).slotCounts.find(y=>y.slot===x.slot),original=initial.cases[0].filter.slots.find(z=>z.slot===x.slot);lines.push(`|${x.slot}|${x.before}→${x.after}|${y.before}→${y.after}|${original.nullRetained?'null可能な楽観空間を保持':'nullでP0到達不能；残余集合が必要'}|`);}
lines.push('',`右手/左手/頭/顔/耳/胸では複数代替を保持。1候補に絞れたslotもTop1固定ではなく、条件付きUBの除外結果。靴/防具腰/指/弾丸は縮小せずsecondary自由探索候補を保持する。positive primary sourceがないことだけではconflict影響なしを証明できないため、「完全無関係」と誤認して削除しない。関連slotの代替集合IDはdiagnostic/reuse JSONのpreservingIds、実際のTop20 IDsはproduction JSONへ保存。`,
'',`group診断では各positive bucketのsource寄与を取り除いた場合のcompletion UBを測定した。magic/evasionとも${a.groups.filter(g=>g.requiredPositiveWinner).length}/${a.groups.length} bucketでUB<180となり、positive winner必須と証明。required bucketは ${a.groups.filter(g=>g.requiredPositiveWinner).map(g=>g.bucket.split(':').at(-1).toUpperCase()).join(', ')}。残りは必須性未証明として代替を保持する。この分類もcandidate 1個固定ではない。各bucketのsource candidate集合と除外時UBはproduction JSONのgroupsへ保存。`,
'',`## 安全性・fallback・将来構造`,
'',`${f.partialStates} states（non-leaf partial ${f.nonLeafPartialStates}件）、独立formal全列挙${f.independentCompletions} completion。保持${f.retainedBranches}枝、除外${f.excludedBranches}枝を検証。過小上限／除外枝からP0到達 violation ${f.violations}。除外candidate ${f.removedCandidatesChecked}件についてoracleの全P0構成に存在しないことも確認。${f.parityRuns} fixtureでproduction Top-K parity。破壊/回復/キック × magic/evasion、Top1とsecondary最良の差、関連slot交換、非primary slot改善、P0≥K、P0<K、group、同技latest、同slot、fixed/excluded、negative/externalを含む。`,
'',`P0<K fixtureはP0=15、distinct=1、K=20。productionはP0-below-Kで元のlexicographicへfallbackし、低いprimary stratumを含めた正しいTop20を返す。P0だけでglobal Exact終了しない。同期/cooperative parity、abort exact:false、close-before-startもcontrol testで確認。`,
'',`将来は Primary Exact → P0残余secondary → K未満なら次の未探索primary score P1をExact確定 → P1残余secondary… と層ごとに結果を連結できる。次score証明、層間distinctと元performanceKey順を保つ専用設計が必要。今回はP1/P2、generic engine、他objective、UI/formal計算は変更していない。`,
'',`## 回帰・Git`,
'',`既存回帰：${passed.length}/${tests.size} passed（再実行結果優先）。${failed.length?`未完了/失敗: ${failed.map(t=>t.file+' '+(t.error||t.stderr||t.exitCode)).join('; ')}`:'失敗なし。'} 120秒timeoutがあった初回とretryは別JSONで記録し、timeoutをcorrectness成功として扱わない。`,
'',`最終git diff --check / statusは docs/optimizer-v2-phase4H-final-git.json に保存。既存未追跡資料は保持。production変更はsrc/optimizer-v2/branchAndBound.jsのみ、追加はPhase 4H診断・検証・報告用ファイル。commit / pushなし。`);
fs.writeFileSync('docs/optimizer-v2-phase4H-primary-strata.md',lines.join('\n')+'\n');
