/* Development-only VM instrumentation. Never edits or replaces the production file. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
const {objectiveContexts}=require('./inspect-optimizer-v2-objectives.cjs');
const copy=x=>JSON.parse(JSON.stringify(x));
const output=process.argv[2]||'docs/optimizer-v2-ac-tree-audit.json';
const limit=Number(process.argv[3]||1000000);
const p=contextRuntime(),snapshot=p.MOEOptimizerV2Candidates.generate(),context=objectiveContexts(p,20).ac;
const reduction=p.MOEOptimizerV2MetricCandidateReducer.reduce(snapshot,context);
const records=new Map(reduction.metricReducer.classification.map(x=>[x.candidateId,x]));
const classes=reduction.contextEquivalentClasses;
const count=a=>Object.fromEntries([...new Set(a)].map(k=>[k,a.filter(x=>x===k).length]));
const emptySlot=()=>({raw:0,prefilter:0,classes:0,positive:0,zero:0,negative:0,flat:0,percentage:0,requirements:0,group:0,protected:0,nullSafe:0,flatOnly:0});
const slots=Object.fromEntries(context.slots.map(slot=>[slot,emptySlot()]));
const virtual=new Map(),relaxedFlat=new Map();
const ablations={};
for(const name of ['requirements','armorRequirements','rawRequirements','restrictions','weapon'])ablations[name]=new Set();
const details=classes.map(cls=>{
  const r=records.get(cls.representativeCandidateId),parsed=JSON.parse(cls.equivalenceKey),sig=parsed[2];
  const v=copy(parsed);
  // Counterfactual only: requirement fields are removed after recording effective AC.
  delete v[2].structural.requirements;delete v[2].structural.armorRequirements;
  delete v[2].structural.rawRequirements;
  if(v[2].structural.weapon)delete v[2].structural.weapon.weaponReq;
  const key=JSON.stringify(v);if(!virtual.has(key))virtual.set(key,[]);virtual.get(key).push(cls);
  for(const field of Object.keys(ablations)){const x=copy(parsed);delete x[2].structural[field];ablations[field].add(JSON.stringify(x));}
  const s=slots[r.slot]||(slots[r.slot]={raw:0,prefilter:0,classes:0,positive:0,zero:0,negative:0,flat:0,percentage:0,requirements:0,group:0,protected:0,nullSafe:0,flatOnly:0});
  s.classes++;const flat=r.bodyFlat+r.buffFlat,pct=r.bodyPercentage+r.buffPercentage;
  s[flat>0||pct>0?'positive':flat<0||pct<0?'negative':'zero']++;
  if(flat!==0)s.flat++;if(pct!==0)s.percentage++;
  if((sig.structural.requirements||[]).length||(sig.structural.armorRequirements||[]).length)s.requirements++;
  if(r.legacyProtectedReasons.length)s.protected++;
  const interaction=!!r.interaction||!!sig.buffs?.length;
  if(interaction)s.group++;
  const nullSafe=flat===0&&pct===0&&!interaction&&!r.unknown&&!sig.structural.hardConflicts?.length&&!sig.structural.weapon;
  if(nullSafe)s.nullSafe++;
  const flatOnly=!interaction&&!r.unknown&&pct===0&&!sig.fixed;
  if(flatOnly){s.flatOnly++;const z=copy(v[2].structural),k=JSON.stringify(z);if(!relaxedFlat.has(k))relaxedFlat.set(k,[]);relaxedFlat.get(k).push({cls,flat,key});}
  return {candidateId:cls.representativeCandidateId,name:cls.representativeCandidate.name,slot:r.slot,flat,pct,
    body:r.bodyFlat,buff:r.buffFlat,requirements:sig.structural.requirements,armorRequirements:sig.structural.armorRequirements,
    protectedReasons:r.legacyProtectedReasons,interaction,unknown:r.unknown,nullSafe,virtualKey:key};
});
for(const c of snapshot.candidates)if(slots[c.slot])slots[c.slot].raw++;
for(const r of records.values())if(slots[r.slot]&&r.stage!=='hard-prefilter')slots[r.slot].prefilter++;
const margin=reduction.diagnostics.metricReduction.roundingMargin;
const hypotheticalDominated=new Set();
for(const list of relaxedFlat.values())for(const e of list){
  const distinct=new Set(list.filter(a=>a.flat-e.flat>margin).map(a=>a.key));
  if(distinct.size>=20)hypotheticalDominated.add(e.cls.representativeCandidateId);
}
for(const [slot,s] of Object.entries(slots)){
  const local=details.filter(d=>d.slot===slot);s.hypotheticalClasses=new Set(local.map(d=>d.virtualKey)).size;
  s.hypotheticalKSafeRemoved=local.filter(d=>hypotheticalDominated.has(d.candidateId)).length;
  s.combinedHypotheticalClasses=new Set(local.filter(d=>!d.nullSafe&&!hypotheticalDominated.has(d.candidateId)).map(d=>d.virtualKey)).size;
}
const result={exact:false,diagnosticOnly:true,context:{objective:context.objective,constraints:context.constraints},
  reducer:copy(reduction.diagnostics.metricReduction),slots,details,fieldAblations:Object.fromEntries(Object.entries(ablations).map(([k,v])=>[k,{classes:v.size,reduction:classes.length-v.size}])),
  hypothetical:{current:classes.length,requirementAblatedClasses:virtual.size,nullSafeClasses:details.filter(d=>d.nullSafe).length,
    relaxedStructuralK20Removed:hypotheticalDominated.size,combinedClasses:new Set(details.filter(d=>!d.nullSafe&&!hypotheticalDominated.has(d.candidateId)).map(d=>d.virtualKey)).size,
    warning:'Counterfactual diagnosis, not a replacement-safety proof. All feasibility and Buff payload retained except requirement fields.'},
  splitExamples:[...virtual.values()].filter(a=>a.length>1).slice(0,20).map(a=>a.map(c=>({id:c.representativeCandidateId,name:c.representativeCandidate.name}))),
  tree:{relations:{},depths:[],epochs:[],branches:{},gaps:{},tieDry:{candidates:0,uniqueRoots:0,coveredNodes:0,coveredFormal:0},checkpoints:[]}};
const groupProof=p.MOEOptimizerV2BranchAndBound.inspectACGroups(reduction);
result.sourceAudit=copy(groupProof);
for(const s of Object.values(slots)){s.buffRelated=s.group;s.group=0;s.requirementEffective=0;s.bodyScaled=0;}
for(const d of details){
  const cls=classes.find(c=>c.representativeCandidateId===d.candidateId);
  const row=p.MOEOptimizerV2Candidates.toEquipmentRow(cls.representativeCandidate);
  const armor=p.equipmentArmorAC(row,context.skillSim);d.armor=copy(armor);
  d.groupSources=copy(groupProof.candidates[d.candidateId].sources);
  if(d.groupSources.some(s=>s.exclusiveKeys.length))slots[d.slot].group++;
  if(armor.performance.mod!==1)slots[d.slot].requirementEffective++;
  if(armor.raw!==0)slots[d.slot].bodyScaled++;
}
let source=fs.readFileSync('src/optimizer-v2/branchAndBound.js','utf8');
function replace(a,b){assert.equal(source.split(a).length,2,'Unique instrumentation anchor: '+a);source=source.replace(a,b);}
replace('const slots=plan.slots;','const slots=plan.slots; const auditTie=options.acTreeAudit?prepareTieKey(plan,slots):null;');
replace('const upper=bound?.maximum??relaxed?.upper;',`const upper=bound?.maximum??relaxed?.upper;
            options.acTreeAudit?.bound(depth,upper,heap[0],selectedIds,auditTie&&upper===heap[0].rankScore?optimisticTieKey(auditTie,selectedIds,depth,heap[0].performanceKey):null);`);
replace('function dfsCore(depth) {',`function dfsCore(depth) {
        if(!options.acTreeAudit)return auditedCore(depth);
        const f=options.acTreeAudit.begin(depth,heap,selectedIds,diagnostics);
        try{return auditedCore(depth);}finally{options.acTreeAudit.end(f,diagnostics);}
      }
      function auditedCore(depth) {`);
replace('const kind=boundKind(depth);','const kind=boundKind(depth); options.acTreeAudit?.outcome(depth,kind);');
replace('if(depth===slots.length){consider();return;}','if(depth===slots.length){options.acTreeAudit?.leaf(depth);consider();return;}');
replace('for(const cls of choices) {','options.acTreeAudit?.expand(depth,choices.length); for(const cls of choices) {');
replace('if(!cls){dfs(depth+1);continue;}','if(!cls){options.acTreeAudit?.nullBranch(depth);dfs(depth+1);continue;}');
vm.runInContext(source,p,{filename:'development-only-ac-tree-overlay.js'});
const frames=[],t=result.tree;
let node=0,currentEpoch=null;
function stat(container,key){return container[key]||(container[key]={nodes:0,formal:0,expanded:0,pruned:0,exclusiveMs:0});}
const audit={
 begin(depth,heap,ids,d){node++;const kth=heap.length===20?heap[0].rankScore:null;
   if(!currentEpoch||currentEpoch.score!==kth){currentEpoch={score:kth,startNode:node,nodes:0,formal:0,pruned:0,relations:{}};t.epochs.push(currentEpoch);}
   currentEpoch.nodes++;
   const f={depth,start:performance.now(),childrenMs:0,children:0,relation:kth===null?'kth-unset':'unobserved',formalBefore:d.completeConfigurationsEvaluated,epoch:currentEpoch,
     covered:depth>0&&frames[depth-1].covered};
   if(depth===3){const key=JSON.stringify(ids);f.branch=t.branches[key]||(t.branches[key]={ids:ids.slice(),nodes:0,formal:0,pruned:0,startNode:node});}
   else if(depth>3)f.branch=frames[depth-1].branch;
   if(f.branch)f.branch.nodes++;
   frames[depth]=f;
   if(depth>0)frames[depth-1].children++;
   const ds=t.depths[depth]||(t.depths[depth]={nodes:0,expanded:0,children:0,nullBranches:0,pruned:0,formal:0,relations:{}});ds.nodes++;
   if(f.covered)t.tieDry.coveredNodes++;return f;
 },
 bound(depth,upper,kth,ids,tie){const f=frames[depth];f.relation=upper==null?'unknown':upper<kth.rankScore?'less':upper===kth.rankScore?'equal':'greater';
   if(upper!=null){const gap=upper-kth.rankScore,key=gap<0?'negative':gap===0?'exact-zero':gap<1e-6?'positive-under-1e-6':gap<1?'positive-under-1':gap<10?'positive-1-to-10':gap<50?'positive-10-to-50':'positive-at-least-50';t.gaps[key]=(t.gaps[key]||0)+1;}
   if(tie&&tie.key>=kth.performanceKey){t.tieDry.candidates++;if(!f.covered){t.tieDry.uniqueRoots++;f.covered=true;} }
 },
 outcome(depth,kind){if(kind){frames[depth].pruned=true;t.depths[depth].pruned++;frames[depth].epoch.pruned++;if(frames[depth].branch)frames[depth].branch.pruned++;}},
 leaf(depth){frames[depth].leaf=true;},
 expand(depth,n){frames[depth].expanded=true;t.depths[depth].expanded++;t.depths[depth].choices=n;},
 nullBranch(depth){t.depths[depth].nullBranches++;},
 end(f,d){const elapsed=performance.now()-f.start,formal=d.completeConfigurationsEvaluated-f.formalBefore;
   if(f.depth>0)frames[f.depth-1].childrenMs+=elapsed;
   const ownFormal=f.leaf?formal:0,ds=t.depths[f.depth];ds.children+=f.children;ds.formal+=ownFormal;
   for(const s of [stat(t.relations,f.relation),stat(ds.relations,f.relation),stat(f.epoch.relations,f.relation)]){
     s.nodes++;s.formal+=ownFormal;s.expanded+=Number(!!f.expanded);s.pruned+=Number(!!f.pruned);s.exclusiveMs+=elapsed-f.childrenMs;
   }
   f.epoch.formal+=ownFormal;if(f.covered)t.tieDry.coveredFormal+=ownFormal;
   if(f.branch)f.branch.formal+=ownFormal;
 }
};
const stop=new Error('diagnostic-prefix-stop'),start=performance.now();let last;
try{p.MOEOptimizerV2BranchAndBound.run(reduction,{slotOrder:'blockers',acTreeAudit:audit,observeTopK:true,profileEvaluation:true,
  progressEvery:1000,onProgress:d=>{last=copy(d);if([10000,13000,100000,300000,1000000].includes(d.searchNodes)){t.checkpoints.push(last);console.log(JSON.stringify({nodes:d.searchNodes,formal:d.completeConfigurationsEvaluated,prune:d.boundPrunedNodes,elapsed:performance.now()-start}));}
    if(d.searchNodes>=limit)throw stop;}});}catch(e){if(e!==stop)throw e;}
result.elapsedMs=performance.now()-start;result.progress=last;
result.tree.slotOrder=last.candidateCountsByDepth;
result.tree.remainingCombinations=last.candidateCountsByDepth.map((x,i)=>({depth:i,slot:x.slot,choices:x.choices,
  theoreticalCompletions:last.candidateCountsByDepth.slice(i+1).reduce((n,x)=>n*BigInt(x.choices),1n).toString()}));
const baseline=JSON.parse(fs.readFileSync('docs/optimizer-v2-ac-prepared-new-300000.json','utf8'));
result.baselineParity=[];
for(const checkpoint of t.checkpoints){const old=[...(baseline.checkpoints||[]),baseline.progress].find(x=>x?.searchNodes===checkpoint.searchNodes);if(!old)continue;
  for(const k of ['completeConfigurationsEvaluated','boundPrunedNodes','observedTopK'])assert.deepEqual(checkpoint[k],old[k]);
  result.baselineParity.push({nodes:checkpoint.searchNodes,matched:true});}
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({output,elapsedMs:result.elapsedMs,relations:t.relations,hypothetical:result.hypothetical,parity:result.baselineParity}));
