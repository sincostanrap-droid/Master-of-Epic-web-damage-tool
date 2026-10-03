const fs=require('node:fs');
const a=JSON.parse(fs.readFileSync('docs/optimizer-v2-ac-tree-audit.json','utf8'));
// Include the zero-class ammo slot in reports produced before the CLI's slot initialization fix.
if(!a.slots['武器: 弾丸'])a.slots['武器: 弾丸']={raw:a.reducer.inputCount-Object.values(a.slots).reduce((n,s)=>n+s.raw,0),
  prefilter:a.reducer.bySlot['武器: 弾丸'].before,classes:0,positive:0,zero:0,negative:0,flat:0,percentage:0,requirements:0,
  group:0,buffRelated:0,protected:0,nullSafe:0,flatOnly:0,hypotheticalClasses:0,hypotheticalKSafeRemoved:0,combinedHypotheticalClasses:0,bodyScaled:0};
for(const [slot,s] of Object.entries(a.slots))s.requirementEffective=a.details.filter(d=>d.slot===slot&&d.armor.performance.mod!==1).length;
fs.writeFileSync('docs/optimizer-v2-ac-tree-audit.json',JSON.stringify(a,null,2)+'\n');
const sum=k=>Object.values(a.slots).reduce((n,s)=>n+(s[k]||0),0),f=x=>Number(x).toFixed(3);
const stable=a.tree.epochs.at(-1),history=a.progress.kthScoreHistory;
const rows=Object.entries(a.slots).map(([slot,s])=>`| ${slot} | ${s.raw} | ${s.prefilter} | ${s.classes} | ${s.positive}/${s.zero}/${s.negative} | ${s.requirements} | ${s.flat} | ${s.percentage} | ${s.buffRelated||0} | ${s.group} | ${s.protected} | ${s.hypotheticalClasses} | ${s.hypotheticalKSafeRemoved} | ${s.combinedHypotheticalClasses} |`).join('\n');
const depths=a.tree.depths.map((d,i)=>`| ${i} | ${a.tree.slotOrder[i]?.slot||'leaf'} | ${a.tree.slotOrder[i]?.choices||0} | ${d.nodes} | ${d.pruned} | ${d.expanded} | ${d.formal} | ${d.nullBranches} | ${f(d.expanded?d.children/d.expanded:0)} |`).join('\n');
const scoreCounts={};for(const r of a.progress.observedTopK)scoreCounts[r.score]=(scoreCounts[r.score]||0)+1;
const report=`# Phase 3C-4 AC structural audit

## Scope / source state

Audit only; no production source, Reducer, actual pruning, bound mathematics, prepared path, order, formal calculation, skillPlus or DPS changes. No commit/push. HEAD is 765d5c0. Contrary to the starting assumption, Phase 3C-3 remains uncommitted (four existing tracked changes and its artifacts); preserved. Correctness-fixed current total is **2,198 classes**, not 2,197. Context: AC max, newtar male, clothing 100, Top20, constraints=[]; no constraint-safety explanation is needed.

Files read: src/optimizer-v2/{metricCandidateReducer,effectiveCandidates,branchAndBound,searchContext,metrics,candidates,evaluationSession}.js; src/calc/core.js; src/main.js; tools/inspect-optimizer-v2-{context,objectives}.cjs; C3 prefix/classification/observation JSON. Added only two audit/report CLIs and this report/JSON/test log. The audit loads exact source into a VM with uniquely asserted diagnostic anchors. It does not write or replace production source and never enables AC tie pruning.

## Static classification

All 11,804 candidates → hard prefilter 11,506 → before dominance 6,925 candidates / 2,383 classes → 6,117 candidates / **2,198 classes**. Already null-replaced 4,581 candidates; already K-safe dominated 808 candidates /185 classes. Weapon performance ignored in 1,880 candidates; weapon legacy 1,902 classes → metric-aware 236. Body damage/interval/range and standalone attack/magic/DPS/foreign skillPlus are already absent from the current metric key. They are not the remaining large split source.

Positive/zero/negative potential classes: **${sum('positive')}/${sum('zero')}/${sum('negative')}**. These classify source flat/pct signs, not a claim that every positive source wins a formal conflict. One class mixes positive/negative. Flat relevant ${sum('flat')}; percentage relevant ${sum('percentage')}; requirement metadata ${sum('requirements')}; actual requirement attenuation **0** in this context (all 2,198 representative mods are1); raw body AC present ${sum('bodyScaled')}. Relevant Buff payload/interaction ${sum('buffRelated')}; any exclusive/stack source metadata ${sum('group')}; legacy protection ${sum('protected')}. These overlap, not a partition. Protection is informational here: the metric Reducer does not make every protected row a singleton. Unknown source classes0.

| slot | raw | prefilter | classes | positive/zero/negative | requirement metadata | flat | % | relevant Buff payload | any group/stack metadata | legacy protected | hypothetical B | D removed | B+D |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${rows}

No remaining class meets the conservative zero/no-interaction/no-hard-conflict/no-occupancy null-equivalence certificate (0 classes /0 candidates). Seven zero classes are six interaction rows (黒猫のお面+5/+8, モニターアイマスク, グローイング ビヤード+3, 背負い大鉞, 背負い錬金王の杖), plus マジック チャージ ストーン with hard conflict effectrange:f. Null is still one choice per slot, including ammo's sole null choice. Negative rows are not automatically deletable for Top20: a single better null replacement does not supply 20 distinct better configurations, and relevant structural/conflict semantics must be preserved.

## Hypothetical equivalence / K-safe analysis (not implemented)

Current key includes objective/constraints, formal helper bodyFlat, bodyPercentage, connected Buff payload/stack keys, unknown/fixed identity, and structural slot/requirements/armorRequirements/rawRequirements/restrictions/hardConflicts/weapon role. Requirement differences are repeated in multiple fields: removing requirements alone removes0, armorRequirements alone0, rawRequirements alone36; jointly removing these and weapon.weaponReq while retaining already computed effective AC yields **1,349 classes (849 fewer)**. Restriction ablation alone removes30, but was not included in B: restrictions can affect feasibility. Weapon role ablation alone removes0, and occupancy/compatibility were retained.

All current body proficiency mods are1; therefore the raw-AC rank inversions caused specifically by requirement attenuation are0 for this validation context. Equal effective scalar AC across raw/requirement combinations occurs (split examples in JSON, e.g. カオス スペル ブック/クラブ オブ モラ/スタッフ オブ モラ/ハイキャスター スペル ブック). This does not prove that body/addition accumulation can be merged bit-identically in every layout: formal computeMetrics separately sums effective body and additions. Future refinement must preserve that numerical contract too.

| diagnostic scenario | classes | qualification |
|---|---:|---|
| A current |2198| actual |
| B requirement-ablated hypothetical key |1349| effective scalar held fixed, all feasibility/Buff fields otherwise retained |
| C conservative null consolidation |2198| no additional certified inert class |
| D relaxed-structure strict K20 dominance |503|1695 original classes have20 distinct strictly higher scalar alternatives; not a full replacement proof |
| B+C+D |427| hypothetical, not a proposed production result |

D excludes connected Buff/%/unknown/fixed alternatives, retains slot/occupancy/hard conflicts/restrictions, uses the existing conservative positive-multiplier and rounding margin (${a.reducer.roundingMargin}), and counts distinct B keys, not aliases, as the20 witnesses. Current unrelaxed structural grouping has already executed its certified K20 deletion; no additional deletion follows from that unchanged proof. The 2,130 remaining flat-only classes are kept under that conservative structural partition/Top-K policy; this does not mean all2,130 are intrinsically necessary. New requirement-equivalence proof and new key/tie contract must precede using D. Witnesses are alternative replacements in the same slot, not simultaneously equipped gear. Each replacement must preserve every completion's feasibility, ordering and distinct performance key. Strict score differences are required; ties cannot be discarded by K-count alone.

Foreign Buff numerical fields are not universally irrelevant: compositeGroupScore() uses attack%, magic%, flat attack/magic, skillPlus, HP/MP/ST, hit/avoid, delays, crit, etc. to choose winners. same-technic/latest uses order. Dropping them can change whether an AC Buff wins. They remain in B. Display-only and nonconnected payloads are already omitted by the metric Reducer. The 849 count is a requirement-field counterfactual, not a proof that all other observed differences can be dropped.

## One-million-node observation

Fixed development prefix, **exact:false**, not a completed optimizer result. ${f(a.elapsedMs/1000)} seconds with diagnostic timers; not a standalone performance comparison (first diagnostic run overlapped tests and took96.05s). Four checkpoints 10k/13k/100k/300k match C3 formal counts, actual prunes and complete observed Top20 score/key/candidate IDs exactly. Full relation totals: <kth949,982, ==kth0, >kth49,976, kth-unset41; one observer-stop node was interrupted before bound classification. Actual objective prune949,982; feasibility0; formal236. Expanded greater nodes49,760; unset-expanded21.

Top20 filled at node41. Last observed kth score394.38285714285706 reached node153,313. After that: **846,687 nodes, 800,493 <kth, 46,193 >kth, ==0, formal0**, and one observer-stop node. This is a stable prefix threshold, not a proved final global kth. Full kth history is in JSON. Exclusive measured time: less ${f(a.tree.relations.less.exclusiveMs/1000)}s; greater ${f(a.tree.relations.greater.exclusiveMs/1000)}s; unset ${f(a.tree.relations['kth-unset'].exclusiveMs/1000)}s. Child time is subtracted to avoid double counting.

Remaining greater-bound gap distribution (all prefix): ${Object.entries(a.tree.gaps).map(([k,v])=>k+'='+v).join(', ')}. 33,112 nodes have a bound gap of at least10; only16 are within positive1e-6. Thus exact equality is not hidden by the outward rounding allowance on a large scale in this prefix. Large optimistic envelopes permit parent expansion, then a selected child makes the envelope lower than kth. It is not merely a tie subtree problem.

## Comparator / equal-bound dry-run

better(): rankScore descending, then performanceKey ascending via JavaScript string '<'; no third breaker. AC max rankScore=score. Key is a JSON string of selected [slot,equivalenceKey] pairs sorted by slot; null omits a pair. Nested numbers are JSON text, not numeric token sorting. Representative/alias IDs affect ordering only if already encoded in equivalenceKey (e.g. fixed/unknown identity); recovered alias arrays are not additional tie breakers. Identical keys are deduplicated.

Dry-run uses the existing optimisticTieKey machinery in the VM only: lexically minimal remaining token per canonical slot, fixed selected tokens, ignoring feasibility. That is favorable-side relaxation, not a predicted winner or actual prune. Strict upperBound===kth node count0, hence prune-candidate nodes0, unique subtree roots0, estimated observed nodes/formal saved0, prefix-only/suffix decisions0. No equal-bound subtree sizes exist to estimate here. Do not change '<' to'<=' or strip outward bound padding to manufacture ties. Current AC cannot benefit from skillPlus-style equality pruning on this evidence.

## Depth / branching

Child average is **visited children per expanded parent in this interrupted prefix**, not full configured cardinality. Upper levels' average1 means still inside their first branch, not one option available.

| depth | decision slot | configured choices | nodes | objective prune | expanded | formal | visited null branches | average visited children |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
${depths}

Dominant visited depths10/11:装飾胸382,199 nodes and防具腰446,562 nodes; together82.8761% of all prefix nodes. Pants79 visited branches × shoes~303 × accessory waist16 starts a large Cartesian expansion before chest/armor-waist rejection. Head then sees112,680 nodes but only71 expansions. 8,924 leaf nodes reached;8,688 cut by objective bound;236 formally evaluated. No additional leaf evaluation after153,313: all later paths terminate internally when AC envelope drops below threshold.

First three chosen rows (メカニカル フェイス / フューチャー ノア アームガード+9 / フューチャー ノア アーマー+9) contain999,997 prefix nodes and all236 evaluations. Prefix never returned from the first seven decisions. This is not evidence that these are globally best; current order visits them first. At shoulders, each selected branch has126,535,735,868,129,280 theoretical remaining completions; pants494,280,218,234,880; shoes1,631,287,848,960; accessory waist101,955,490,560. Counts ignore constraints/occupancy/group pruning, are upper-scale diagnostics and not expected formal evaluations or completion percentage. Depth-specific products and selected IDs are recorded in JSON.

Observed Top20 has${Object.keys(scoreCounts).length} distinct scores, not one score: ${JSON.stringify(scoreCounts)}. Best397.7257142857143; kth394.38285714285706. Full20 distinct keys and candidate ID selections are retained in JSON. Score duplicates do not imply equal objective bounds.

## Measured alternatives / safety conditions (no ranking)

| alternative | measured or estimated effect | safety work still needed |
|---|---|---|
| Reducer structural refinement |849-class reduction in B, with requirements currently fully met | context-fixed formal observables, body/addition rounding, compatibility and alias/key policy |
| K-safe dominance |1695 current class witnesses; combined427 hypothetical classes |20 distinct interchangeable replacements for every completion, strict score margin, positive final multiplier, complete structure |
| null consolidation |0 extra certified classes;4581 candidates already removed | six Buff interaction rows + one hard conflict must not be treated inert |
| AC tie-aware |0 equality/dry-run candidates in1M | actual favorable key proof; unchanged exact numeric upper bound equality |
| slot ordering |large Cartesian steps303×16×18×180; entire first upper branch persists | result parity; this audit does not run alternate orders or claim saved-node count |
| bound tightening |49,976 >kth nodes;33,112 gap>=10;46,193 expansions after stable score without formal evaluation | source/slot/group rectangle relaxations could be tighter, but no new admissibility proof or node-saving estimate here |

A is only partly true:2,139 classes have positive potential, but849 requirement-only virtual splits show positive relevance is not the same as needing every structural class. B/D/F/G are evidenced; C/E are not a large residual cause in this prefix. H: occupancy/hard conflicts already exist in structural signatures and invalidNext; group buckets are source-level safe relaxations rather than formal winner predictions. No omitted feasibility field was established. Reported hypothetical class reduction is not equivalent to measured node reduction. Do not claim that427 classes will complete faster or preserve current Top20 keys without the stated proof.

The236 formal evaluations are not a formal bottleneck: most nodes decide rejection in the prepared AC bound. This is a high branching / loose-parent-envelope problem, with additional requirement partitioning. The present data does not support AC tie-aware as the main solution. No new optimizer implementation is performed in this phase.

## Validation / Git

Full existing tests **71/71 passed**,0 failed (114.896s); log optimizer-v2-ac-tree-tests.log. Existing Brute Force/bound OFF/order/formal parity tests maintained. Audit checkpoint asserts10k/13k/100k/300k allpassed. Both diagnostic runs stopped by development-only node observer, exact:false; no unlimited/background exploration started. git diff --check successful; LF/CRLF notices only. Production tracked changes are still exactly the four prior C3 files. Final status saved separately. No commit/push/stage/reset/restore/stash.
`;
fs.writeFileSync('docs/optimizer-v2-phase3C-4-ac-structural-audit.md',report);
console.log('Wrote audit report');
