#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const targets = [
  'data/cache/scrapbox',
  'data/cache'
].map(p => path.resolve(ROOT, p));

let removed = 0;
for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  fs.rmSync(target, {recursive:true, force:true});
  console.log(`[remove] ${target}`);
  removed++;
}
if (!removed) console.log('[clear-dev-cache] 削除対象のキャッシュはありません。');
else console.log('[clear-dev-cache] 開発用キャッシュを削除しました。次回Scrapbox自動取得時には再生成されます。');
