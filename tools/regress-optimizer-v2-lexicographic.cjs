const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const cases=[{skill:'破壊魔法',name:'destruction',historical:false},{skill:'回復魔法',name:'healing',historical:true}],results=[];
for(const c of cases){const file=`docs/optimizer-v2-phase4C-${c.name}-regression.json`,args=['tools/benchmark-optimizer-v2-generic-skillplus.cjs','after',file,'120',c.skill,...(c.historical?['--historical']:[])];
 const log=cp.execFileSync(process.execPath,args,{encoding:'utf8',maxBuffer:8*1024*1024});fs.writeFileSync(`docs/optimizer-v2-phase4C-${c.name}-regression.log`,log);
 const old=JSON.parse(fs.readFileSync(`docs/optimizer-v2-phase4B-${c.name}-regression.json`)).cases[c.skill],now=JSON.parse(fs.readFileSync(file)).cases[c.skill];
 assert.equal(now.diagnostics.exact,true);assert.deepEqual(now.top,old.top);for(const key of ['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes','tiePrunedNodes','topKUpdates','exact'])assert.equal(now.diagnostics[key],old.diagnostics[key]);assert.equal(now.formalParity,true);
 results.push({skill:c.skill,exact:true,topKeyIdsParity:true,majorCounterParity:true,formalParity:true,elapsedMs:now.elapsedMs,counters:Object.fromEntries(['searchNodes','completeConfigurationsEvaluated','boundPrunedNodes','tiePrunedNodes'].map(k=>[k,now.diagnostics[k]]))});console.log(JSON.stringify(results.at(-1)));
}
fs.writeFileSync('docs/optimizer-v2-phase4C-skillplus-regression.json',JSON.stringify(results,null,2));
