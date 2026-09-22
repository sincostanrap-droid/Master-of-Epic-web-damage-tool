#!/usr/bin/env node
// Public official lists, newest IDs + explicitly selected missing IDs. NOT a full recrawl.
// Existing rows/manual rules are preserved. Review the report before publishing.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
import {toCatalog} from './build-equipment-catalog-from-google-sheet.mjs';

export const categories = {weapons:'weapon',defences:'defense',shields:'shield'};
export function decodeText(value) {
  return String(value ?? '').replace(/\\u([0-9a-f]{4})|\\([nrt])/gi, (_,hex,escape) =>
    hex ? String.fromCharCode(parseInt(hex,16)) : ({n:'\n',r:'\r',t:'\t'})[escape]);
}
export function parsePage(text) {
  if (text.trim().startsWith('{')) return JSON.parse(text);
  const encoded = text.match(/\bdata-page="([^"]+)"/)?.[1];
  if (!encoded) throw Error('Official page has no data-page JSON');
  const decoded = encoded.replace(/&quot;/g,'"').replace(/&#039;|&apos;/g,"'")
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  return JSON.parse(decoded);
}
export function validatePage(page, category, expectedPage, previousId=Infinity) {
  const list=page.props?.[category];
  if (!list || list.current_page!==expectedPage || !Array.isArray(list.data)
      || !Number.isInteger(list.total) || !Number.isInteger(list.last_page)
      || !list.data.length || list.data.length>list.per_page) throw Error(`Invalid page: ${category}/${expectedPage}`);
  for (const row of list.data) {
    if (!row || !Number.isInteger(row.id) || row.id>=previousId || !row.name || !Array.isArray(row.add_statuses)
        || !Object.hasOwn(row,'technic') || (category==='weapons' && !Array.isArray(row.need_skills))) {
      throw Error(`Incomplete or non-descending item: ${category}/${row?.id}`);
    }
    if (Number(row.technic_id)>0 && Number(row.technic?.id)!==Number(row.technic_id)) throw Error('Missing technic relation');
    previousId=row.id;
  }
  return list;
}
export function convertRows(records) {
  const items=[], statuses=[], buffs=[];
  for (const {category, row:r, fetchedAt} of records) {
    const cat=categories[category];
    if (!cat) throw Error('Unknown category');
    const primary=r.requiredSkill || r.useSkill || r.weponType || '';
    const req=(r.need_skills || []).map(s=>{
      const name=decodeText(s.name),required=Number(s.pivot?.value);
      if (!name || !Number.isFinite(required)) throw Error(`Unknown need_skills schema: ${r.id}`);
      return {name,required};
    });
    // need_skills contains additional requirements, not the weapon's primary skill.
    if(primary && Number(r.need_level)>0) req.unshift({name:primary,required:Number(r.need_level)});
    items.push({...r,category:cat,name:decodeText(r.name),info:decodeText(r.info),
      requiredSkill:r.requiredSkill || r.useSkill || r.weponType || '',
      requirements_json:JSON.stringify(req),source_url:`https://idb.moepic.com/items/${category}/${r.id}`,
      fetched_at:fetchedAt,add_status_text:r.add_statuses.map(s=>`${s.name} ${Number(s.pivot.value)>=0?'+':''}${s.pivot.value}`).join('\n')});
    // Each official relation is consumed once; do not also parse add_status_text.
    for(const s of r.add_statuses) {
      if (!s.name || !Number.isFinite(Number(s.pivot?.value))) throw Error(`Invalid add_status: ${r.id}`);
      statuses.push({category:cat,item_id:r.id,status_id:s.id,status_name:s.name,value:s.pivot.value});
    }
    if(r.technic) buffs.push({category:cat,item_id:r.id,item_name:decodeText(r.name),
      technic_id:r.technic.id,technic_name:decodeText(r.technic.name),technic_info:decodeText(r.technic.info)});
  }
  const result=toCatalog(items,statuses,buffs);
  for(const item of [...result.equipment,...result.buffs]) {
    item.source='official-idb'; item.sourceSheetUrl='';
  }
  for(const item of result.equipment) if(item.unmappedAddStatuses.length) throw Error(`Unmapped status: ${item.catalogId}`);
  return result;
}
export function mergeCatalog(baseEquipment,baseBuffs,delta) {
  const equipment=structuredClone(baseEquipment),buffs=structuredClone(baseBuffs);
  const ids=new Set(equipment.map(x=>x.catalogId)), byBuff=new Map(buffs.map(x=>[x.catalogId,x]));
  const added=[],newBuffs=[],changedBuffDescriptions=[];
  for(const row of delta.equipment) {
    if(ids.has(row.catalogId)) throw Error(`Refusing to overwrite existing item: ${row.catalogId}`);
    ids.add(row.catalogId);equipment.push(row);added.push(row.catalogId);
  }
  for(const row of delta.buffs) {
    const old=byBuff.get(row.catalogId);
    if(!old){buffs.push(row);byBuff.set(row.catalogId,row);newBuffs.push(row.catalogId);continue;}
    if(old.name!==row.name || old.info!==row.info) changedBuffDescriptions.push({id:row.catalogId,previous:{name:old.name,info:old.info},current:{name:row.name,info:row.info}});
    // Preserve existing descriptions/rules until reviewed; add provenance links only.
    for(const key of ['sourceEquipmentIds','sourceEquipmentNames']) old[key]=[...new Set([...(old[key]||[]),...(row[key]||[])])];
  }
  return {equipment,buffs,added,newBuffs,changedBuffDescriptions};
}
async function readCatalog(dir) {
  const context=vm.createContext({window:{}});
  for(const name of ['equipmentCatalog','buffCatalog']) vm.runInContext(await fs.readFile(path.join(dir,name+'.generated.js'),'utf8'),context);
  return JSON.parse(JSON.stringify(context.window));
}
async function writeText(file,text) {
  const handle=await fs.open(file,'w');
  try {
    const bytes=Buffer.from(text);
    for(let offset=0;offset<bytes.length;) {
      const {bytesWritten}=await handle.write(bytes,offset,Math.min(65536,bytes.length-offset),offset);
      if(!bytesWritten) throw Error(`Could not write ${file}`);
      offset+=bytesWritten;
    }
    await handle.sync();
  } finally {await handle.close();}
}
async function main() {
  const args=Object.fromEntries(process.argv.slice(2).map(s=>{const i=s.indexOf('=');return i<0?[s,true]:[s.slice(0,i),s.slice(i+1)];}));
  if(!args['--out']) throw Error('Usage: node tools/update-equipment-catalog-from-official.mjs --out=DIR [--base=src/data/generated] [--cache-dir=DIR] [--offline] [--include=defences:ID,...]');
  const base=await readCatalog(args['--base']||'src/data/generated');
  const cache=args['--cache-dir']||'dist/official-new-items';await fs.mkdir(cache,{recursive:true});
  const records=[],coverage=[];
  for(const [category,cat] of Object.entries(categories)) {
    const baseline=base.MOE_EQUIPMENT_CATALOG_GENERATED.filter(x=>x.category===cat);
    const cutoff=Math.max(...baseline.map(x=>x.officialId));
    if(!Number.isFinite(cutoff)) throw Error(`Missing baseline category ${cat}`);
    let previousId=Infinity,total=null,boundary=false;
    for(let number=1;number<=500;number++) {
      const url=`https://idb.moepic.com/items/${category}?sortby=0&order=1&page=${number}`;
      const file=path.join(cache,`${category}-desc-${number}.json`);
      let page;
      if(args['--offline']) page=JSON.parse(await fs.readFile(file,'utf8'));
      else {
        const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
        if(!response.ok) throw Error(`${url}: HTTP ${response.status}`);
        page=parsePage(await response.text());page.fetchedAt=new Date().toISOString();page.sourceUrl=url;
        await fs.writeFile(file,JSON.stringify(page,null,2)+'\n');
        await new Promise(resolve=>setTimeout(resolve,300));
      }
      if(!page.fetchedAt || page.sourceUrl!==url) throw Error('Cache must have fetchedAt and matching sourceUrl');
      const list=validatePage(page,category,number,previousId);
      if(total!==null && list.total!==total) throw Error('Official total changed during fetch; retry');
      total=list.total;previousId=list.data.at(-1).id;
      for(const row of list.data) if(row.id>cutoff) records.push({category,row,fetchedAt:page.fetchedAt});
      if(previousId<=cutoff || number===list.last_page) {
        boundary=true;coverage.push({category,baselineCount:baseline.length,baselineUniqueCount:new Set(baseline.map(x=>x.catalogId)).size,officialTotal:total,cutoffId:cutoff,pages:number,lowestFetchedId:previousId});break;
      }
    }
    if(!boundary) throw Error(`Page limit reached before boundary: ${category}`);
  }
  const included=[];
  for(const selection of String(args['--include']||'').split(',').filter(Boolean)) {
    const [category,rawId]=selection.split(':');const id=Number(rawId);
    if(!categories[category] || !Number.isSafeInteger(id) || id<=0) throw Error(`Invalid selection: ${selection}`);
    if(base.MOE_EQUIPMENT_CATALOG_GENERATED.some(x=>x.catalogId===`official-${categories[category]}-${id}`)
        || records.some(x=>x.category===category && x.row.id===id)) continue;
    const url=`https://idb.moepic.com/items/${category}/${id}`;
    const file=path.join(cache,`${category}-item-${id}.json`);let page;
    if(args['--offline']) page=JSON.parse(await fs.readFile(file,'utf8'));
    else {
      const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
      if(!response.ok) throw Error(`${url}: HTTP ${response.status}`);
      page=parsePage(await response.text());page.fetchedAt=new Date().toISOString();page.sourceUrl=url;
      await fs.writeFile(file,JSON.stringify(page,null,2)+'\n');
    }
    if(page.sourceUrl!==url || !page.fetchedAt) throw Error('Invalid individual page provenance');
    const row=Object.values(page.props||{}).find(x=>x?.id===id && Array.isArray(x.add_statuses));
    validatePage({props:{[category]:{current_page:1,last_page:1,per_page:1,total:1,data:[row]}}},category,1);
    records.push({category,row,fetchedAt:page.fetchedAt});included.push(selection);
  }
  const merged=mergeCatalog(base.MOE_EQUIPMENT_CATALOG_GENERATED,base.MOE_BUFF_CATALOG_GENERATED,convertRows(records));
  const generatedAt=new Date().toISOString();
  const report={generatedAt,scope:'new IDs above baseline maximum plus explicitly selected missing IDs; existing items retained, not fully recrawled',coverage,included,
    addedEquipment:merged.added,newBuffs:merged.newBuffs,changedBuffDescriptions:merged.changedBuffDescriptions,
    items:records.map(x=>({category:x.category,id:x.row.id,name:x.row.name,technic:x.row.technic}))};
  await fs.mkdir(args['--out'],{recursive:true});
  const safe=value=>JSON.stringify(value,null,2).replace(/<\/script/gi,'<\\/script');
  for(const [name,key,items] of [['equipmentCatalog','EQUIPMENT',merged.equipment],['buffCatalog','BUFF',merged.buffs]]) {
    const meta={...base[`MOE_${key}_CATALOG_META`],generatedAt,equipmentCount:merged.equipment.length,buffCount:merged.buffs.length,
      lastOfficialIncrementalUpdate:{generatedAt,scope:report.scope,coverage,addedEquipment:merged.added.length,newBuffs:merged.newBuffs.length}};
    for(const field of ['mappedStatusCounts','ignoredStatusCounts','unmappedStatusCounts']) meta[field]={};
    for(const item of merged.equipment) for(const status of item.addStatuses||[]) {
      const field=status.statKey?'mappedStatusCounts':status.ignored?'ignoredStatusCounts':'unmappedStatusCounts';
      const label=status.statKey?`${status.name} -> ${status.statKey}`:status.name;
      meta[field][label]=(meta[field][label]||0)+1;
    }
    await writeText(path.join(args['--out'],name+'.generated.js'),`// Generated by tools/update-equipment-catalog-from-official.mjs\n// Existing entries retained; incremental official new IDs only.\nwindow.MOE_${key}_CATALOG_META = ${safe(meta)};\nwindow.MOE_${key}_CATALOG_GENERATED = ${safe(items)};\n`);
  }
  await fs.writeFile(path.join(args['--out'],'official-update-report.json'),safe(report)+'\n');
  console.log(JSON.stringify({equipment:merged.equipment.length,buffs:merged.buffs.length,added:merged.added.length,newBuffs:merged.newBuffs.length,changedDescriptions:merged.changedBuffDescriptions.length,coverage},null,2));
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) main().catch(error=>{console.error(error);process.exitCode=1;});
