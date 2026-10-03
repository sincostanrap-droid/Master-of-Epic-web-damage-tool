// Bounded subset of the actual MagicCoupled fixture; production sources untouched.
const fs=require('node:fs');
let code=fs.readFileSync('tests/optimizerV2MagicCoupled.test.cjs','utf8');
code=code.replace('[[false,0],[true,0],[false,70],[true,70],[false,140],[false,10]]','[[false,0]]');
code=code.replace('for(const x of records){','for(const x of records.filter(x=>x.depth<=1).concat(records.filter(x=>x.depth===3).slice(0,10))){');
code=code.replace("['none','old','coupled','joint2','joint3','jointPrepared2','jointPrepared3','coupledStrong']","['none','old','coupled','jointPrepared2']");
code=code.replace("['current','potential']","['current']");
code=code.replace('assert.ok(partials>=1000);assert.ok(coupledChecks>=1000);','assert.ok(partials>=16);assert.ok(coupledChecks>=16);');
code=code.replace("'docs/optimizer-v2-phase4B-4-fixtures.json'","'docs/optimizer-v2-phase4H-magic-coupled-focused.json'");
code=code.replace("modes:['none','old','coupled','joint2','joint3','jointPrepared2','jointPrepared3','coupledStrong']","modes:['none','old','coupled','jointPrepared2'],scenarios:1,fullAuditScenarios:6,fullAuditParityRuns:288,focused:true");
const started=performance.now();code=code.replace('let coupledChecks=0,','const inspectTimes=[];const timedInspect=(...args)=>{const t=performance.now(),out=B.inspectMagicCoupled(...args);inspectTimes.push(performance.now()-t);return out;};let coupledChecks=0,');
code=code.replaceAll('B.inspectMagicCoupled(', 'timedInspect(').replace('out=timedInspect(...args)','out=B.inspectMagicCoupled(...args)');
code=code.replace('const result={coupledChecks,','const result={elapsedMs:performance.now()-auditStarted,inspectTimes,coupledChecks,');
new Function('require','auditStarted',code)(require,started);
