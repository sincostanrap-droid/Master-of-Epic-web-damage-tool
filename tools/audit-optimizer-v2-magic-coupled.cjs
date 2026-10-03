const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {completionRuntime}=require('./optimizer-v2-magic-completion-runtime.cjs');
const {p,B}=completionRuntime(),base=vm.runInContext('DEFAULT_STATE()',p),items=p.equipmentCatalogItems();items.forEach(i=>p.MOEEquipmentEffectFacetCatalog.project(i));
const context=p.MOEEquipmentSearchSpecification.toContext(p.MOEEquipmentSearchSpecification.create([{key:'stat:magic'}],{topK:20}),{baseState:base}),prep=p.MOEOptimizerV2FacetSearch.prepare(items,context),r=prep.reduction;
const prior=JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4B-3-slack.json')),slots=prior.slotOrder,ins=B.completionInspector(r),coupled=B.inspectMagicCoupled(r,[],slots);
const vectors=coupled.vectors,frontiers=coupled.frontiers,rows=[],counts=[];
// B: single-slot optimum with independent maxima for all other slots. This
// interval rectangle drops conflicts and negative effects, a safe relaxation.
function rectangle(ids,remaining,single){let flat=0,log=0;for(const id of ids){flat+=vectors[id].flat;log+=vectors[id].log;}
 const maxima=remaining.map(s=>({flat:Math.max(...frontiers[s].map(v=>v.flat)),log:Math.max(...frontiers[s].map(v=>v.log))}));
 const f=flat+maxima.reduce((n,v)=>n+v.flat,0),l=log+maxima.reduce((n,v)=>n+v.log,0);
 let ub=f*Math.exp(l);if(single)for(let i=0;i<remaining.length;i++)ub=Math.min(ub,Math.max(...frontiers[remaining[i]].map(v=>(f-maxima[i].flat+v.flat)*Math.exp(l-maxima[i].log+v.log))));
 return ub+1e-6; // Diagnostic DEFAULT_STATE only (fixed base/flat/percent = 0).
}
for(const slot of slots){const vs=r.contextEquivalentClasses.filter(c=>c.representativeCandidate.slot===slot).map(c=>vectors[c.representativeCandidateId]);
 const f=Math.max(...vs.map(v=>v.flat)),l=Math.max(...vs.map(v=>v.log));counts.push({slot,classes:vs.length,frontier:frontiers[slot].length,separateMaxima:!vs.some(v=>v.flat===f&&v.log===l),maxFlat:f,maxFactor:Math.exp(l)});}
const measured=prior.partials.filter(x=>x.max!==undefined);
for(const x of measured){const rem=slots.slice(x.depth),a=ins.upper(x.ids,rem).upper,c=coupled.evaluate(x.ids,rem),b=rectangle(x.ids,rem,true),d=rectangle(x.ids,rem,false);
 assert.equal(a,x.upper,'checkpoint old bound exact replay');assert.ok(c>=x.max);assert.ok(b>=x.max);assert.ok(d>=x.max);
 rows.push({depth:x.depth,ids:x.ids,actual:x.max,A:a,B:Math.min(a,b),C:Math.min(a,c),D:Math.min(a,d),CStandalone:c});}
function quantile(xs,q){xs=xs.slice().sort((a,b)=>a-b);return xs[Math.floor((xs.length-1)*q)];}
const summary={};for(const mode of ['A','B','C','D']){const slacks=rows.map(x=>x[mode]-x.actual),threshold=239.25966812315707,survivors=rows.filter(x=>x[mode]>threshold),falseOnes=survivors.filter(x=>x.actual<=threshold);
 summary[mode]={median:quantile(slacks,.5),p90:quantile(slacks,.9),p95:quantile(slacks,.95),max:Math.max(...slacks),survivors:survivors.length,falseSurvivors:falseOnes.length,falseSurvivorRate:survivors.length?falseOnes.length/survivors.length:null,prunes:rows.length-survivors.length};}
const cost={};for(const mode of ['A','B','C','D']){const start=performance.now(),repeats=30;for(let i=0;i<repeats;i++)for(const x of measured){const rem=slots.slice(x.depth);if(mode==='A')ins.upper(x.ids,rem);else if(mode==='C')coupled.evaluate(x.ids,rem);else rectangle(x.ids,rem,mode==='B');}const totalMs=performance.now()-start;cost[mode]={calls:repeats*measured.length,totalMs,costUs:totalMs*1000/(repeats*measured.length)};}
const selectedProfile={lookups:0,sourceVisits:0,selectedVectors:0};let t=performance.now();for(let j=0;j<100;j++)for(const x of measured)for(const id of x.ids){selectedProfile.lookups++;const e=ins.candidates[id];const map=new Map();let flat=e.direct.hi;for(const s of e.sources){selectedProfile.sourceVisits++;if(s.bucket)map.set(s.bucket,s.range);else flat+=s.range.hi;}selectedProfile.selectedVectors+=flat===Infinity?0:1;}
selectedProfile.reconstructionLoopMs=performance.now()-t;selectedProfile.note='Isolated collect-shaped allocation/lookup/source walk microprofile; excludes join/fixed/suffix/arithmetic. Not additive to production stage timers.';
const joint={calls:0,totalMs:0,pairs:0};for(const x of measured.filter(x=>x.depth===15).slice(0,8)){t=performance.now();const j=ins.jointPrepared(x.ids,slots.slice(x.depth),2);joint.calls++;joint.pairs+=j.calls;joint.totalMs+=performance.now()-t;assert.ok(j.upper>=x.max);}
joint.costUs=joint.totalMs*1000/joint.calls;
const data={classes:r.contextEquivalentClasses.length,frontierPrepareMs:coupled.prepareMs,slots:counts,sameSlotSeparateMaxima:counts.filter(x=>x.separateMaxima).length,partialStates:rows.length,safetyViolations:0,summary,cost,selectedProfile,joint,rows,actualSource:'Checkpoint Phase 4B-3 independently enumerated formal completion maxima; old UB replay exact equality checked'};
fs.writeFileSync('docs/optimizer-v2-phase4B-4-audit.json',JSON.stringify(data,null,2));console.log(JSON.stringify({...data,rows:undefined}));
