/* Session-local catalog policies. IDs, not display names, define identity. */
(function(g){
 const id=i=>String(i.catalogId??i.id??'');
 function create(){const values=new Map();return {get:i=>values.get(id(i))||'normal',set(i,v){if(!id(i))throw Error('装備IDがありません');if(!['normal','fixed','excluded'].includes(v))throw Error('不正な方針');if(v==='normal')values.delete(id(i));else values.set(id(i),v);},clear(v){for(const [k,x] of values)if(!v||x===v)values.delete(k);},snapshot:()=>Object.fromEntries(values)};}
 function validateFixed(items,toRow){const rows=items.map(toRow),slots=new Set(),conflicts=new Set();for(const r of rows){if(slots.has(r.slot))throw Error('同じ部位を複数固定できません：'+r.slot);slots.add(r.slot);for(const k of g.optimizerEquipmentConflictKeys(r)){if(conflicts.has(k))throw Error('固定装備の装備占有が競合しています');conflicts.add(k);}}
 const right=rows.find(r=>r.slot==='武器: 右手'),left=rows.find(r=>r.slot==='武器: 左手');if(right&&left&&(g.optimizerWeaponUsesBothHands(right)||g.optimizerWeaponUsesBothHands(left)))throw Error('両手武器と左手装備は同時に固定できません');return rows;}
 function compile(policy,snapshot){return {fixedCandidateIds:snapshot.candidates.filter(c=>policy[String(c.catalogId)]==='fixed').map(c=>c.candidateId),excludedCandidateIds:snapshot.candidates.filter(c=>policy[String(c.catalogId)]==='excluded').map(c=>c.candidateId)};}
 function difference(top,row){const a=new Map(top.equipment.map(e=>[e.slot,e.equivalenceKey])),b=new Map(row.equipment.map(e=>[e.slot,e.equivalenceKey]));return {primary:row.score-top.score,secondary:row.secondaryScore===undefined?null:row.secondaryScore-top.secondaryScore,slots:[...new Set([...a.keys(),...b.keys()])].filter(s=>a.get(s)!==b.get(s))};}
 g.MOEEquipmentCandidatePolicy=Object.freeze({create,validateFixed,compile,difference});
})(globalThis);
