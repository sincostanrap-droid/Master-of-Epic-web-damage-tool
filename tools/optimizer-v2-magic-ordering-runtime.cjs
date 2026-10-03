/* Isolated VM diagnostics: only permutations and observations. No repository production edits. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {contextRuntime}=require('./inspect-optimizer-v2-context.cjs');
function runtime({transform,sourceCode}={}){const p=contextRuntime(),original=p.MOEOptimizerV2BranchAndBound;let code=sourceCode??fs.readFileSync('src/optimizer-v2/branchAndBound.js','utf8');
 function change(a,b){assert.equal(code.split(a).length,2,'unique diagnostic anchor');code=code.replace(a,b);}
 change('        return [slot,choices];',`        if(options.diagnosticChoiceOrder){if(!magicScope(context))throw new Error('Magic-only ordering diagnostic');const before=choices.slice(),after=options.diagnosticChoiceOrder(slot,choices.slice());
          if(after.length!==before.length||new Set(after).size!==before.length||before.some(c=>!after.includes(c)))throw new Error('Ordering must be a permutation');choices.splice(0,choices.length,...after);}
        return [slot,choices];`);
 change('      const slots=plan.slots;',`      const slots=plan.slots;
      if(options.orderObservation){options.orderObservation.slotOrder=slots.slice();options.orderObservation.started=performance.now();}`);
 change('      const acSuffix=options.acPreparedBound===false?null:prepareACSuffix(acGroups,slots);',`      const acSuffix=options.acPreparedBound===false?null:prepareACSuffix(acGroups,slots);
      if(options.orderObservation)options.orderObservation.suffixOrder=slots.slice();`);
 change('        if((potentialProof || magic || context.objective.metric==="ac") && heap.length===context.topK) {',`        if(options.orderObservation){const a=options.orderObservation,t=performance.now()-start,best=Math.max(...heap.map(x=>x.score));if(a.best===null||best>a.best){a.best=best;a.bestHistory.push({node:diagnostics.searchNodes,ms:t,score:best});}
          a.filled=heap.length===context.topK;a.kth=a.filled?heap[0].score:null;
          if(a.filled&&(a.kthHistory.length===0||a.kthHistory.at(-1).score!==a.kth))a.kthHistory.push({node:diagnostics.searchNodes,ms:t,score:a.kth});}
        if((potentialProof || magic || context.objective.metric==="ac") && heap.length===context.topK) {`);
 const b=code.indexOf('      function* cooperativeDFS(depth)'),e=code.indexOf('      if(options.cooperative)',b);let part=code.slice(b,e);
 part=part.replace('          if(kind) {diagnostics[','          if(kind && options.orderObservation?.firstPrune===null)options.orderObservation.firstPrune={node:diagnostics.searchNodes,ms:performance.now()-start};\n          if(kind) {diagnostics[');
 code=code.slice(0,b)+part+code.slice(e);
 const anchor='  function inspectMagic(reduction,';
 const fn=`  function orderingMeasures(reduction){return contextApi().withRuntime(reduction.context,()=>{const plan=prepare(reduction),proof=magicProof(plan);if(!proof)throw new Error('Unsupported diagnostic context');const root=magicUpper(proof,[],plan.context.slots).upper,baseline=contextApi().evaluate(plan.context,[],plan.sources).score;
    const candidates={},slotData={};for(const [slot,classes] of plan.groups){const rest=plan.context.slots.filter(s=>s!==slot),suffix=prepareMagicSuffix(proof,rest)[0],values=[];
      for(const cls of [...classes,null]){const id=cls?.representativeCandidateId||'',entry=id?proof.byId.get(id):null,flat=id?entry.direct.hi:0,projected=flat+(entry?.sources||[]).reduce((n,s)=>n+s.flat,0),pct=(entry?.sources||[]).reduce((n,s)=>n+s.pct,0);
        const optimistic=magicUpper(proof,id?[id]:[],[]).upper,completion=magicUpper(proof,id?[id]:[],rest,suffix).upper;
        const x={id,slot,flat,projected,pct,optimistic,completion,buffRelevant:(entry?.sources||[]).some(s=>s.flat||s.pct)};candidates[id||'null:'+slot]=x;values.push(x);}
      slotData[slot]={slot,classes:classes.length,branches:classes.length+1,maxPotential:Math.max(...values.map(x=>x.optimistic))-baseline,maxFlat:Math.max(...values.map(x=>x.projected)),maxDirectFlat:Math.max(...values.map(x=>x.flat)),maxPct:Math.max(...values.map(x=>x.pct)),buffCandidates:values.filter(x=>x.buffRelevant).length,
        spread:Math.max(...values.map(x=>x.optimistic))-Math.min(...values.map(x=>x.optimistic)),pruningPower:root-values.reduce((n,x)=>n+x.completion,0)/values.length};}
    return {root,baseline,candidates,slotData,currentSlots:plan.slots};});}
`;
 assert.equal(code.split(anchor).length,2);code=code.replace(anchor,fn+anchor);const exportAnchor=code.includes('inspectACGroups,inspectMagic,inspectMagicCoupled});')?'inspectACGroups,inspectMagic,inspectMagicCoupled});':'inspectACGroups,inspectMagic});';change(exportAnchor,exportAnchor.replace('});',',orderingMeasures});'));if(transform)code=transform(code);vm.runInContext(code,p);
 for(const f of ['equipmentEffectFacets','equipmentEffectFacetCatalog','equipmentSearchSpecification'])vm.runInContext(fs.readFileSync(`src/domain/${f}.js`,'utf8'),p);
 vm.runInContext(fs.readFileSync('src/optimizer-v2/facetSearch.js','utf8'),p);return {p,B:p.MOEOptimizerV2BranchAndBound,original};}
const slotModes=['current','smallest','largest','potential','spread','pruning','hybrid'],candidateModes=['current','projected','optimistic','flat','completion'];
function slotOrder(m,kind,canonical){const index=s=>canonical.indexOf(s),x=s=>m.slotData[s];if(kind==='current')return m.currentSlots.slice();return canonical.slice().sort((a,b)=>{
 const A=x(a),B=x(b);let delta=kind==='smallest'?A.classes-B.classes:kind==='largest'?B.classes-A.classes:kind==='potential'?B.maxPotential-A.maxPotential:kind==='spread'?B.spread-A.spread:kind==='pruning'?B.pruningPower-A.pruningPower:B.maxPotential-A.maxPotential||B.spread-A.spread||A.branches-B.branches;
 return delta||index(a)-index(b);});}
function choiceOrder(m,kind){if(kind==='current')return undefined;return (slot,choices)=>choices.map((c,i)=>({c,i,value:m.candidates[c?.representativeCandidateId||'null:'+slot][kind]})).sort((a,b)=>b.value-a.value||a.i-b.i).map(x=>x.c);}
const observation=()=>({best:null,kth:null,filled:false,bestHistory:[],kthHistory:[],firstPrune:null});
module.exports={runtime,slotModes,candidateModes,slotOrder,choiceOrder,observation};
