const {runtime,slotOrder,choiceOrder,observation}=require('./optimizer-v2-magic-ordering-runtime.cjs');
const assert=require('node:assert/strict');
function completionRuntime({profile=false}={}){return runtime({transform(code){
 const anchor='            const result=magicUpper(magic,selectedIds,slots.slice(depth),magicSuffix?.[depth]);d.calls++;d.totalMs+=performance.now()-mark;';
 assert.equal(code.split(anchor).length,2);
 code=code.replace(anchor,anchor.replace('const result=','let result=')+`\n            if(options.strongCompletion && result.upper!==null && result.upper>=heap[0].score){const strong=options.strongCompletion(selectedIds,slots.slice(depth),result.upper,heap[0].score);if(Number.isFinite(strong))result={...result,upper:Math.min(result.upper,strong)};}
            if(options.completionAudit)options.completionAudit({depth,node:diagnostics.searchNodes,ids:selectedIds,slots,upper:result.upper,kth:heap[0].score,ms:performance.now()-start});`);
 const a='  function inspectMagic(reduction,';
 const fn=`  function completionInspector(reduction,{prepareCandidates=true}={}){return contextApi().withRuntime(reduction.context,()=>{const plan=prepare(reduction),proof=magicProof(plan,prepareCandidates),tables=new Map(),prefixes=new Map();return {profile:proof.profile={},sources:proof.sources,candidates:Object.fromEntries(proof.byId),fixed:proof.fixed,fixedSources:proof.fixedSources,fixedFactors:proof.fixedFactors,
   upper:(ids,remaining)=>magicUpper(proof,ids,remaining,prepareMagicSuffix(proof,remaining)[0]),
   vectors:(ids)=>ids.map(id=>proof.byId.get(id)),
   joint:(ids,remaining,count)=>{const suffix=remaining.slice(-count),prefix=remaining.slice(0,-count),prepared=prepareMagicSuffix(proof,prefix)[0];let upper=-Infinity,calls=0;const chosen=ids.slice();function walk(i){if(i===suffix.length){const u=magicUpper(proof,chosen,prefix,prepared).upper;calls++;if(u===null){upper=Infinity;return;}upper=Math.max(upper,u);return;}for(const c of [...plan.groups.get(suffix[i]),null]){if(c)chosen.push(c.representativeCandidateId);walk(i+1);if(c)chosen.pop();}}walk(0);return {upper:Number.isFinite(upper)?upper:null,calls};},
   jointPrepared:(ids,remaining,count)=>{const suffix=count?remaining.slice(-count):[],prefix=count?remaining.slice(0,-count):remaining,key=JSON.stringify(suffix),pk=JSON.stringify(prefix);let table=tables.get(key);
     if(!table){const started=performance.now(),domains=suffix.map(slot=>{const unique=new Map();for(const cls of plan.groups.get(slot)){const id=cls.representativeCandidateId,e=proof.byId.get(id),sig=JSON.stringify([e.reason,e.direct,e.sources.filter(s=>s.flat||s.pct).map(s=>[s.range,s.bucket])]);if(!unique.has(sig))unique.set(sig,id);}return [null,...unique.values()];});const vectors=[],chosen=[];function walk(i){if(i===domains.length){vectors.push(chosen.slice());return;}for(const id of domains[i]){if(id)chosen.push(id);walk(i+1);if(id)chosen.pop();}}walk(0);table={vectors,buildMs:performance.now()-started,domains:domains.map(d=>d.length),serializedBytes:JSON.stringify(vectors).length};tables.set(key,table);}
     if(!prefixes.has(pk))prefixes.set(pk,prepareMagicSuffix(proof,prefix)[0]);let upper=-Infinity;for(const vector of table.vectors){const u=magicUpper(proof,ids.concat(vector),prefix,prefixes.get(pk)).upper;if(u===null)return {upper:null,calls:table.vectors.length,table};upper=Math.max(upper,u);}return {upper,calls:table.vectors.length,table:{buildMs:table.buildMs,domains:table.domains,serializedBytes:table.serializedBytes}};}
 };});}
`;
 code=code.replace(a,fn+a);code=code.replace('inspectMagicCoupled,orderingMeasures});','inspectMagicCoupled,orderingMeasures,completionInspector});');
 if(profile){const begin=code.indexOf('  function magicUpper('),end=code.indexOf('  function inspectMagic(',begin);let part=code.slice(begin,end);
   part=part.replace('    const range={...proof.fixed}',`    const timed=(key,fn)=>{if(!proof.profile)return fn();const t=performance.now(),value=fn();proof.profile[key]=(proof.profile[key]||0)+performance.now()-t;return value;};
    const range={...proof.fixed}`);
   part=part.replace('    include(proof.collect({direct:proof.zero(),sources:proof.fixedSources}));','    timed("fixedMs",()=>include(proof.collect({direct:proof.zero(),sources:proof.fixedSources})));');
   part=part.replace('    for(const id of selectedIds)include(proof.collect(proof.byId.get(id)));','    timed("selectedMs",()=>{for(const id of selectedIds)include(proof.collect(proof.byId.get(id)));});');
   part=part.replace('    if(prepared)include(prepared);','    timed("suffixMs",()=>{if(prepared)include(prepared);').replace('    if(reason)return {upper:null,reason};','    });if(reason)return {upper:null,reason};');
   part=part.replace('    for(const v of buckets.values())proof.add(range,v);','    timed("groupMs",()=>{for(const v of buckets.values())proof.add(range,v);});const arithmeticStart=performance.now();');
   part=part.replace('    return n*Number.EPSILON<0.001', '    if(proof.profile)proof.profile.arithmeticMs=(proof.profile.arithmeticMs||0)+performance.now()-arithmeticStart;\n    return n*Number.EPSILON<0.001');
   code=code.slice(0,begin)+part+code.slice(end);
 }return code;
}});}
module.exports={completionRuntime,slotOrder,choiceOrder,observation};
