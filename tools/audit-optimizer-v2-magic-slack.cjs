const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {completionRuntime,slotOrder,choiceOrder,observation}=require('./optimizer-v2-magic-completion-runtime.cjs');
const {p,B}=completionRuntime(),json=x=>JSON.parse(JSON.stringify(x)),C=p.MOEOptimizerV2SearchContext;
const items=p.equipmentCatalogItems(),base=vm.runInContext('DEFAULT_STATE()',p);items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));
const context=p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'stat:magic'}],{topK:20}),{baseState:base});
const started=performance.now(),prep=p.MOEOptimizerV2FacetSearch.prepare(items,context),r=prep.reduction,m=B.orderingMeasures(r),slots=slotOrder(m,'potential',context.slots),ins=B.completionInspector(r);
const groups=Object.fromEntries(slots.map(s=>[s,r.contextEquivalentClasses.filter(c=>c.representativeCandidate.slot===s)])),samples=[],seen=new Set(),caps={},a=observation(),signal={aborted:false};
const output='docs/optimizer-v2-phase4B-3-slack.json',data={classes:r.contextEquivalentClasses.length,setupMs:performance.now()-started,slotOrder:slots,partials:[],vectorAudit:[],jointTables:[]};const save=()=>fs.writeFileSync(output,JSON.stringify(data,null,2));
const ctrl=B.run(r,{cooperative:true,signal,fixedSlotOrder:slots,diagnosticChoiceOrder:choiceOrder(m,'completion'),orderObservation:a,completionAudit:x=>{
 const rel=x.upper<x.kth?'less':x.upper===x.kth?'equal':'greater',key=x.depth+':'+rel,limit=x.depth>=16?100:x.depth===15?32:8;
 const signature=x.depth+':'+x.ids.join('|');if((caps[key]||0)<limit&&!seen.has(signature)){seen.add(signature);caps[key]=(caps[key]||0)+1;samples.push({...x,ids:x.ids.slice(),slots:x.slots.slice(),relation:rel});}
}});let last;
try{while(true){const q=ctrl.step();if(q.done){data.sampleSearch=json(q.value.diagnostics);break;}last=q.value;if(last.searchNodes>=100000)signal.aborted=true;}}finally{ctrl.close();}
data.sampleSearchObservation=json(a);data.sampledCount=samples.length;console.log(JSON.stringify({sampled:samples.length,depths:Object.fromEntries(slots.map((_,i)=>[i,samples.filter(x=>x.depth===i).length]))}));
const scale=JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4B-3-scaling.json'));
const thresholds=Object.fromEntries(scale.runs.filter(x=>[1,5,20].includes(x.k)).map(x=>[x.k,x.observation.kth]));data.thresholds=thresholds;
for(const slot of slots){const entries=groups[slot].map(c=>({id:c.representativeCandidateId,...ins.candidates[c.representativeCandidateId]})),sigs=new Set(entries.map(x=>JSON.stringify([x.direct,x.sources.map(s=>({flat:s.flat,pct:s.pct,keys:s.keys,bucket:s.bucket}))])));
 let cross=0;for(const e of entries)if(e.sources.some(s=>s.pct))cross++;
 const frontier=entries.filter(e=>!entries.some(f=>f!==e&&JSON.stringify(f.sources)===JSON.stringify(e.sources)&&Math.min(0,f.direct.lo)<=Math.min(0,e.direct.lo)&&Math.max(0,f.direct.hi)>=Math.max(0,e.direct.hi)&&(Math.min(0,f.direct.lo)<Math.min(0,e.direct.lo)||Math.max(0,f.direct.hi)>Math.max(0,e.direct.hi))));
 // Diagnostic bound-only optional direct hull includes null. Never delete a search candidate.
 data.vectorAudit.push({slot,classes:entries.length,distinctBoundVectors:sigs.size,intervalContainmentFrontier:frontier.length,percentCandidates:cross,bucketKeys:[...new Set(entries.flatMap(e=>e.sources.map(s=>s.bucket).filter(Boolean)))]});}
let formalCalls=0;
function enumerate(sample){const remaining=slots.slice(sample.depth),selected=sample.ids.map(id=>p.MOEOptimizerV2MetricCandidateReducer.resolveCandidate(r,id)),all=selected.slice(),scores=[];let max=-Infinity,best,legal=0,attempts=0,flatMax=-Infinity,factorMax=-Infinity;
 function walk(depth){if(depth===remaining.length){attempts++;const e=C.evaluate(context,all,prep.snapshot.sources);formalCalls++;if(e.feasible){legal++;scores.push(e.score);const flat=e.metrics.baseMagicFromSpirit+e.metrics.flatStatRaw.magic;flatMax=Math.max(flatMax,flat);if(flat!==0)factorMax=Math.max(factorMax,e.score/flat);if(e.score>max){max=e.score;best={score:e.score,flat,factor:flat?e.score/flat:null,ids:all.map(c=>c.candidateId)};}}return;}
 for(const cls of [...groups[remaining[depth]],null]){if(cls)all.push(cls.representativeCandidate);walk(depth+1);if(cls)all.pop();}}
 const mark=performance.now();walk(0);return {max,best,legal,attempts,flatMax,factorMax,formalMs:performance.now()-mark};}
const exhaustive=samples.filter(s=>s.depth>=15),three=samples.filter(s=>s.depth===14).slice(0,2),toEvaluate=[...exhaustive,...three],jointSelected=samples.filter(s=>s.depth<15).filter((s,i)=>i%8===0).slice(0,10);
for(const sample of samples){const rem=slots.slice(sample.depth),old=ins.upper(sample.ids,rem),row={...sample,remainingSlots:rem,range:json(old.range),upper:old.upper};
 if(toEvaluate.includes(sample)){const e=enumerate(sample);Object.assign(row,e,{slack:old.upper-e.max,falseSurvivor:Object.fromEntries(Object.entries(thresholds).map(([k,t])=>[k,old.upper>t&&e.max<t]))});assert.ok(old.upper>=e.max,'old bound safety');
   const f=old.range.hi,q=old.range.pHi,raw=Math.max(old.range.lo*old.range.pLo,old.range.lo*q,f*old.range.pLo,f*q);
   if(e.flatMax>0&&e.factorMax>0&&raw===f*q)row.slackAccounting={flatRangeOverestimate:(f-e.flatMax)*(q+e.factorMax)/2,percentageRangeOverestimate:(q-e.factorMax)*(f+e.flatMax)/2,flatPctIndependentMaximum:e.flatMax*e.factorMax-e.max,numericalPad:old.upper-raw,note:'Symmetric arithmetic decomposition, not independent causal attribution. Group/stack/occupancy influence both maxima.'};}
 if(jointSelected.includes(sample)||three.includes(sample)||sample.depth===15&&data.partials.filter(x=>x.joint2).length<12){for(const count of [2,3]){if(rem.length<count)continue;const t=performance.now(),j=ins.joint(sample.ids,rem,count);row['joint'+count]={...j,elapsedMs:performance.now()-t,gain:old.upper-j.upper,prunes:Object.fromEntries(Object.entries(thresholds).map(([k,v])=>[k,j.upper<v]))};if(row.max!==undefined)assert.ok(j.upper>=row.max,'joint bound safety');}}
 data.partials.push(row);if(data.partials.length%40===0){save();console.log(`partials=${data.partials.length} formal=${formalCalls}`);}}
for(const count of [2,3]){const suffix=slots.slice(-count),combinations=suffix.reduce((n,s)=>n*(groups[s].length+1),1),t=performance.now(),vectors=new Set();let calls=0;const ids=[];
 function walk(i){if(i===suffix.length){calls++;vectors.add(JSON.stringify(ids.map(id=>ins.candidates[id])));return;}for(const c of [...groups[suffix[i]],null]){if(c)ids.push(c.representativeCandidateId);walk(i+1);if(c)ids.pop();}}walk(0);
 const bytes=[...vectors].reduce((n,s)=>n+Buffer.byteLength(s),0);data.jointTables.push({count,suffix,combinations,calls,distinctVectors:vectors.size,serializedBytes:bytes,buildMs:performance.now()-t,note:'Vectors are a diagnostic candidate table, not a prefix-independent final maximum. All group/stack dependencies remain.'});}
const exact=data.partials.filter(x=>x.max!==undefined),quantile=(xs,q)=>xs.slice().sort((a,b)=>a-b)[Math.floor((xs.length-1)*q)];
function summary(xs){return {n:xs.length,min:Math.min(...xs),median:quantile(xs,.5),p90:quantile(xs,.9),p95:quantile(xs,.95),p99:quantile(xs,.99),max:Math.max(...xs)};}
data.formalCalls=formalCalls;data.exhaustiveCount=exact.length;data.slackSummary=summary(exact.map(x=>x.slack));data.byDepth=Object.fromEntries([...new Set(exact.map(x=>x.depth))].map(depth=>[depth,summary(exact.filter(x=>x.depth===depth).map(x=>x.slack))]));
data.falseSurvivors=Object.fromEntries(Object.entries(thresholds).map(([k,t])=>{const survivors=exact.filter(x=>x.upper>t),falseOnes=survivors.filter(x=>x.max<t);return[k,{threshold:t,survivors:survivors.length,falseSurvivors:falseOnes.length,rate:survivors.length?falseOnes.length/survivors.length:null}];}));
data.memoStateCount=new Set(exact.map(x=>JSON.stringify({depth:x.depth,ids:x.ids}))).size;data.elapsedMs=performance.now()-started;data.completed=true;save();console.log(JSON.stringify({slack:data.slackSummary,falseSurvivors:data.falseSurvivors,exhaustive:data.exhaustiveCount,formalCalls,elapsedMs:data.elapsedMs}));
