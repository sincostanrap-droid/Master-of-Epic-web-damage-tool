const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {runtime,context,json,hash}=require('./audit-optimizer-v2-phase4H-final-consistency.cjs');
const r=JSON.parse(fs.readFileSync('docs/optimizer-v2-phase4H-final-consistency.json','utf8'));
function winners(p,ctx,build){return p.MOEOptimizerV2SearchContext.withRuntime(ctx,()=>{const resolved=p.resolveAllBuffRowsForGroups(p.expandEquipmentBuffState({...ctx.baseState,equipment:build.equipment.map(x=>x.row)}));return {groups:json(resolved.groups.map(g=>({group:g.group,winner:g.winner.row.name}))),active:json(resolved.state.composite.filter(x=>x.enabled&&!x.excluded).map(x=>({name:x.name,tags:x.tags,flatMagic:x.flatMagic,magicPct:x.magicPct,skillPlus:p.normalizeAdditionalEffects(x.extraEffects).filter(e=>e.key==='skillPlus'&&e.name==='破壊魔法')})))};});}
const p=runtime(),ctx=context(p),old=runtime('a00cfd2'),oldCtx=context(old);
r.explanation={userContextSame:['skillSim','race','external','fixed','excluded','constraints','K','inputs','baseStateHash'].every(k=>hash(r.current.context[k])===hash(r.historical.context[k])),top1SlotChanges:[{slot:'武器: 弾丸',before:null,after:'起源の弾',primaryContribution:0,bodyMagic:2}],bodyMagic:[r.historical.reconstructedTop1.metrics.equipmentRaw.magic,r.current.newTop1.metrics.equipmentRaw.magic],magicPercent:3};
r.explanation.buffWinners={historical:winners(old,oldCtx,r.historical.reconstructedTop1),current:winners(p,ctx,r.current.newTop1)};
assert.deepEqual(r.explanation.buffWinners.historical,r.explanation.buffWinners.current);r.explanation.buffWinnersSame=true;
r.explanation.formulaGitBlobs=Object.fromEntries(['src/main.js','src/calc/core.js'].map(f=>[f,['a00cfd2','HEAD'].map(ref=>cp.execFileSync('git',['rev-parse',`${ref}:${f}`],{encoding:'utf8'}).trim())]));
for(const v of Object.values(r.explanation.formulaGitBlobs))assert.equal(v[0],v[1]);
fs.writeFileSync('docs/optimizer-v2-phase4H-final-consistency.json',JSON.stringify(r,null,2));
const hybrid=runtime({data:'a00cfd2'}),hybridCtx=context(hybrid),h=hybrid.MOEOptimizerV2FacetSearch.prepare(hybrid.equipmentCatalogItems(),hybridCtx);r.explanation.currentCodeHistoricalAllDataClasses=h.reduction.candidates.length;assert.equal(h.reduction.candidates.length,580);
console.log('CURRENT-CODE-OLD-DATA',h.reduction.candidates.length);
const items=p.equipmentCatalogItems().map(x=>x.catalogId==='wiki-ammo-bullet-9'?{...x,extraStats:{...x.extraStats,magic:0},addStatuses:(x.addStatuses||[]).filter(s=>s.statKey!=='magic')}:x),a=p.MOEOptimizerV2FacetSearch.prepare(items,ctx);r.explanation.withOriginMagicRemoved={classes:a.reduction.candidates.length,removed:r.current.classes.filter(c=>!a.reduction.contextEquivalentClasses.some(x=>x.equivalenceKey===c.key)).map(c=>({id:c.id,name:c.name,slot:c.slot}))};assert.equal(a.reduction.candidates.length,581);
r.explanation.classIncrease={maskDataCorrection:1,originMagicAddition:1,weaponAmmoStructuralRetention:11,total:13};
fs.writeFileSync('docs/optimizer-v2-phase4H-final-consistency.json',JSON.stringify(r,null,2));console.log('ORIGIN-MAGIC-REMOVED',a.reduction.candidates.length,'Buff winners unchanged');
