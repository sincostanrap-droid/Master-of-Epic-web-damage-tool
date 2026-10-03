// No UI modules or state.equipment source. Also used by the Phase 1 tests.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {context, root} = require('./benchmark-optimizer.cjs');
function candidateContext() {
  const page = context(root);
  for (const file of ['src/data/generated/equipmentCatalog.generated.js',
    'src/data/generated/ammoCatalog.generated.js', 'src/data/generated/buffCatalog.generated.js',
    'src/optimizer-v2/candidates.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), page, {filename:file});
  }
  return page;
}
if (require.main === module) {
  const page = candidateContext();
  const output = page.MOEOptimizerV2Candidates.generate();
  console.log(JSON.stringify(output.diagnostics, null, 2));
}
module.exports = {candidateContext};
