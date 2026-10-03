const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {candidateContext} = require('./inspect-optimizer-v2-candidates.cjs');
function paretoContext() {
  const page = candidateContext();
  const file = path.join(__dirname, '../src/optimizer-v2/pareto.js');
  vm.runInContext(fs.readFileSync(file, 'utf8'), page, {filename:file});
  return page;
}
if (require.main === module) {
  const page = paretoContext();
  const result = page.MOEOptimizerV2Pareto.reduce(page.MOEOptimizerV2Candidates.generate());
  console.log(JSON.stringify({diagnostics:result.diagnostics, removalExamples:result.removed.slice(0,10)}, null, 2));
}
module.exports = {paretoContext};
