/* Offline source-to-import audit. No catalog mutation, browser use or optimizer run. */
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),cp=require('node:child_process');
const norm=s=>String(s||'').normalize('NFKC').replace(/[\s　]/g,'');
const aliases={'攻撃力':'attack','魔力':'magic','移動速度':'speed','速度':'speed','最大HP':'extraHP','HP':'extraHP','最大MP':'extraMP','MP':'extraMP','最大ST':'extraST','ST':'extraST','防御力':'extraAC','アーマークラス':'extraAC','AC':'extraAC','命中':'extraHit','回避':'extraAvoid','最大重量':'extraMaxWeight','攻撃ディレイ':'extraAttackDelay','魔法ディレイ':'extraMagicDelay','火属性抵抗':'extraFireRes','水属性抵抗':'extraWaterRes','地属性抵抗':'extraEarthRes','風属性抵抗':'extraWindRes','無属性抵抗':'extraNeutralRes','耐火属性':'extraFireRes','耐水属性':'extraWaterRes','耐地属性':'extraEarthRes','耐風属性':'extraWindRes','耐無属性':'extraNeutralRes','キック命中率補正':'extraKickHit','キック攻撃力補正':'extraKickAttack','牙命中率補正':'extraFangHit','牙攻撃力補正':'extraFangAttack'};
const pct={attack:'attackPct',magic:'magicPct',speed:'speedPct',extraAC:'extraACPct',extraHP:'extraHPPct',extraMP:'extraMPPct',extraST:'extraSTPct',extraHit:'extraHitPct',extraAvoid:'extraAvoidPct',extraAttackDelay:'extraAttackDelayPct',extraMagicDelay:'extraMagicDelayPct',extraFireRes:'extraFireResPct',extraWaterRes:'extraWaterResPct',extraEarthRes:'extraEarthResPct',extraWindRes:'extraWindResPct',extraNeutralRes:'extraNeutralResPct',extraMaxWeight:'extraMaxWeightPct'};
function textClaims(text,labels=aliases){
 const normalized=String(text||'').normalize('NFKC');const names=Object.keys(labels).sort((a,b)=>b.length-a.length);const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=new RegExp('('+names.map(escape).join('|')+')[ \\t]*(?:[:：][ \\t]*)?([+−-])[ \\t]*([0-9]+(?:\\.[0-9]+)?)(%?)','g');
 return [...normalized.matchAll(pattern)].map(m=>({label:m[1],field:m[4]?pct[labels[m[1]]]||null:labels[m[1]],value:(m[2]==='+'?1:-1)*Number(m[3]),percent:!!m[4],index:m.index,excerpt:normalized.slice(Math.max(0,m.index-60),m.index+m[0].length+100)}));
}
function sumStatuses(item,labelMap,known){
 const expected={},unsupported=[],ignored=[],invalid=[];
 if(item.addStatuses?.length){for(const st of item.addStatuses){const n=norm(st.name),v=Number(st.value);if(!Number.isFinite(v)){invalid.push(st);continue;}if(!v)continue;
 if(['キック攻撃力補正','キック攻撃補正','キック命中率補正','牙攻撃力補正','牙攻撃補正','牙命中率補正'].includes(n)){const field=labelMap[n]||aliases[n];if(field)expected[field]=(expected[field]||0)+v;else unsupported.push(st);continue;}
 if(n==='耐全属性'){for(const f of ['extraFireRes','extraWaterRes','extraEarthRes','extraWindRes','extraNeutralRes'])expected[f]=(expected[f]||0)+v;continue;}
 const field=st.statKey&&known.has(st.statKey)?st.statKey:labelMap[n]||aliases[n];
 if(field&&known.has(field))expected[field]=(expected[field]||0)+v;else unsupported.push(st);
 }}else for(const [field,value]of Object.entries(item.extraStats||{})){if(known.has(field)&&Number.isFinite(Number(value)))expected[field]=Number(value);else invalid.push({field,value});}
 if(item.category!=='weapon'&&Number(item.armorClass))expected.extraAC=(expected.extraAC||0)+Number(item.armorClass);
 return {expected,unsupported,ignored,invalid};
}
function classifyWikiEffect(source,effect) {
 const raw=String(effect.raw||'');
 if(raw&&source.info.includes(raw)){const at=source.info.indexOf(raw)+raw.length;if(/[0-9.%]/.test(source.info[at]||'')&&effect.unit!=='%')return 'snapshot-parser-numeric-fragment';}
 if(effect.key==='elementDamagePct'&&/軽減|回復|ディレイ|詠唱/.test(source.info))return 'snapshot-parser-effect-scope';
 if(effect.key==='skillPlus')return 'skill-effect-versus-skillPlus-or-source-version-review';
 if(/水中|泳ぎ|強制移動|ジャンプ|敵|対象|鈍足|足止め|夜間|22:00|専用テクで/.test(source.info))return 'conditional-or-target-scope-review';
 if(/ディレイ|詠唱/.test(effect.label))return 'timing-display-or-formal-semantics-review';
 return 'runtime-versus-snapshot-review';
}
function audit(){
 const p=require('./inspect-optimizer-v2-context.cjs').contextRuntime();
 vm.runInContext(fs.readFileSync('src/data/generated/wikiEquipBuffEffects.generated.js','utf8'),p);
 const defs=vm.runInContext('extraFieldDefsFor("summary")',p),labelMap={...aliases};for(const d of defs)labelMap[norm(d.label)]=d.prop;
 const known=new Set(defs.map(d=>d.prop));const items=p.equipmentCatalogItems(),buffs=p.buffCatalogItems(),wiki=p.MOE_WIKI_EQUIP_BUFF_EFFECTS_GENERATED;
 const all=[],findings=[],byBuff=new Map(),rows=new Map(),sources=['src/domain/catalogData.js','src/data/generated/equipmentCatalog.generated.js','src/data/generated/ammoCatalog.generated.js','src/data/generated/buffCatalog.generated.js','src/data/generated/wikiEquipBuffEffects.generated.js','src/data/generated/equipBuffRuleCandidates.generated.js','src/data/generated/skillBuffCompatibility.generated.js','src/data/generated/damageBuffCompatibility.generated.js','src/data/manual/buffRules.manual.js','src/main.js'];
 const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 const add=(item,kind,data)=>{const entry={itemId:item.catalogId||item.id,name:item.name,kind,...data};findings.push(entry);return entry;};
 for(const item of items){const id=item.catalogId||item.id;let row;try{row=p.resolveEquipmentBuffRow(p.catalogEquipmentToRow(item));rows.set(id,row);}catch(error){add(item,'import-error',{error:String(error)});all.push({id,name:item.name,status:'import-error'});continue;}
 const direct=sumStatuses(item,labelMap,known),issues=[];
 const body=item.category==='weapon'?{weaponDamage:item.weaponDamage,weaponAttackInterval:item.weaponAttackInterval,weaponRange:item.weaponRange,weaponDurability:item.weaponDurability}:{armorBaseAC:item.armorClass};
 for(const [field,value]of Object.entries(body)){if(value!==undefined&&Number.isFinite(Number(value))&&Number(row[field]||0)!==Number(value))issues.push(add(item,'body-import-mismatch',{field,expected:Number(value),actual:Number(row[field]||0)}));}
 for(const [field,expected]of Object.entries(direct.expected)){const actual=Number(row[field]||0);if(Math.abs(actual-expected)>1e-8*Math.max(1,Math.abs(expected)))issues.push(add(item,'structured-import-mismatch',{field,expected,actual}));}
 for(const st of direct.unsupported){const displayed=(row.extraEffects||[]).some(e=>norm(e.name)===norm(st.name)&&Number(e.value)===Number(st.value));const intentionallyIgnored=p.isKnownIgnoredOfficialAddStatus(st.name);issues.push(add(item,intentionallyIgnored?'intentionally-ignored-status':displayed?'structured-display-only':'unmapped-structured-status',{status:st}));}
 for(const invalid of direct.invalid)issues.push(add(item,'invalid-structured-status',{status:invalid}));
 const buffId=String(row.equipBuffTechnicId||'').replace(/^technic-/,'');if(buffId){if(!byBuff.has(buffId))byBuff.set(buffId,[]);byBuff.get(buffId).push(item);}
 const effectFields={};for(const d of defs)if(Number(row[d.equipProp]))effectFields[d.prop]=Number(row[d.equipProp]);for(const [key,field]of Object.entries({attackPct:'equipBuffAttackPct',magicPct:'equipBuffMagicPct',speedPct:'equipBuffSpeedPct'}))if(Number(row[field]))effectFields[key]=Number(row[field]);
 for(const claim of textClaims(item.info,labelMap)){
  const field=claim.field;const actual=Number(row[field]||0),buffValue=Number(effectFields[field]||0);
  const isConditional=/QoA|タイタンでのみ|装備中のみ|対象|命中した|ヒット|確率|Debuff|デバフ|足止め|鈍足|WarAgeでのみ|[0-9]+秒|[0-9]+ターン/.test(item.info||'');
  const kind=actual===claim.value&&!claim.percent?'text-value-represented-direct':buffValue===claim.value?'text-value-represented-buff':isConditional?'conditional-text-review':item.slot==='武器: 弾丸'&&actual===0&&!claim.percent?'confirmed-ammo-structured-omission':'text-numeric-review';
  const entry={...claim,actualDirect:actual,actualBuff:buffValue};issues.push(add(item,kind,entry));
 }
 const refs=(item.buffRefs||[]).filter(ref=>!p.catalogFindBuffById(ref));if(refs.length)issues.push(add(item,'unresolved-buff-reference',{refs}));
 all.push({id,name:item.name,slot:item.slot,sourceUrl:item.sourceUrl||null,sourceVerified:item.verified??null,sourceInfoPresent:!!item.info,structuredStatusCount:(item.addStatuses||[]).length,infoHash:crypto.createHash('sha256').update(String(item.info||'')).digest('hex'),structured:direct.expected,buffId:buffId||null,resolvedBuffFields:effectFields,displayEffects:row.extraEffects||[],findingKinds:[...new Set(issues.map(x=>x.kind))],textSemanticCoverage:'signed numeric claims only; other prose remains unverified'});
 }
 const wikiAudit=[];
 for(const source of wiki){const linked=[...new Map((source.matchedOfficialTechnicIds||[]).flatMap(id=>(byBuff.get(String(id))||[]).map(i=>[i.catalogId,i]))).values()];const checks=[];
 for(const effect of source.parsedStats||[]){let tested=0,equal=0;const differences=[];
 for(const item of linked){const row=rows.get(item.catalogId);const field=effect.equipProp;let actual;
 if(field)actual=Number(row[field]||0);else if(['skillPlus','elementDamagePct'].includes(effect.key))actual=(row.extraEffects||[]).filter(e=>e.key===effect.key&&e.name===(effect.target||effect.name)).reduce((n,e)=>n+Number(e.value||0),0);
 if(actual===undefined){continue;}tested++;if(actual===Number(effect.value))equal++;else differences.push({itemId:item.catalogId,name:item.name,actual});}
 checks.push({effect,tested,equal,differences,reviewCategory:differences.length?classifyWikiEffect(source,effect):null,status:!tested?'no-checkable-linked-import':differences.length?'source-runtime-difference-review':'snapshot-value-represented'});
 }
 wikiAudit.push({sourceId:source.wikiId,name:source.name,technicIds:source.matchedOfficialTechnicIds||[],linkedItemIds:linked.map(i=>i.catalogId),checks,unparsedNotes:source.unparsedNotes||[],info:source.info,sourceVerified:source.verified,semanticStatus:'snapshot comparison only; prose/conditions/conflicts not certified'});
 }
 const buffAudit=buffs.map(buff=>{const id=String(buff.officialTechnicId||'').replace(/^technic-/,'');const rule=p.findEquipBuffRuleCandidate(buff);return {id:buff.catalogId||buff.id,technicId:id,name:buff.name,linkedItemIds:(byBuff.get(id)||[]).map(i=>i.catalogId),ruleFound:!!rule,ruleSource:rule?.source||null,ruleVerified:rule?.verified??null,ruleApplyDefault:rule?.applyDefault??null,ruleStats:rule?.stats||null,info:buff.info||buff.note||'',semanticStatus:'reference/rule inventory; no assertion all described effects are implemented'};});
 const wikiReviewCounts={};for(const w of wikiAudit)for(const c of w.checks)if(c.reviewCategory)wikiReviewCounts[c.reviewCategory]=(wikiReviewCounts[c.reviewCategory]||0)+1;
 const counts={};for(const f of findings)counts[f.kind]=(counts[f.kind]||0)+1;
 const report={checkpoint:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),scope:'all local equipment/ammo imports, Buff references, all local Wiki records; not a live game/source recertification',sourceHashes:Object.fromEntries(sources.map(f=>[f,sha(f)])),summary:{equipment:items.length,ammo:items.filter(i=>i.slot==='武器: 弾丸').length,buffs:buffs.length,wikiRecords:wiki.length,wikiParsedEffects:wiki.reduce((n,w)=>n+(w.parsedStats||[]).length,0),counts,wikiReviewCounts,linkedBuffsWithoutRule:buffAudit.filter(b=>!b.ruleFound&&b.linkedItemIds.length).length,importedWithoutError:all.filter(i=>i.status!=="import-error").length,structuredNumericItemCount:all.filter(i=>Object.keys(i.structured||{}).length).length,wikiDifferentRecords:wikiAudit.filter(w=>w.checks.some(c=>c.differences.length)).length,wikiUnparsedRecords:wikiAudit.filter(w=>w.unparsedNotes.length).length,wikiNoLinkedItems:wikiAudit.filter(w=>!w.linkedItemIds.length).length},findings,equipment:all,buffs:buffAudit,wiki:wikiAudit};
 return report;
}
if(require.main===module){const result=audit();fs.writeFileSync('docs/catalog-full-data-audit.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result.summary,null,2));}
module.exports={audit,textClaims,sumStatuses,classifyWikiEffect};
