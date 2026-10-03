const catalogCandidatePolicy=MOEEquipmentCandidatePolicy.create();
/* Thin catalog adapter. The projection itself has no DOM or application state dependency. */
let catalogFacetCache = new Map(), catalogFacetSources = [], catalogFacetOptionsReady = false, catalogFacetBuilding = false, catalogFacetGeneration = -1;
function invalidateCatalogEffectFacets() { catalogFacetCache.clear(); catalogFacetOptionsReady = false; catalogFacetSources = []; if(globalThis.MOEEquipmentEffectFacetCatalog) MOEEquipmentEffectFacetCatalog.invalidate(); }
function catalogEffectProjection(item) {
  const projection=MOEEquipmentEffectFacetCatalog.project(item);
  const generation=MOEEquipmentEffectFacetCatalog.generation();if(generation!==catalogFacetGeneration){catalogFacetCache.clear();catalogFacetOptionsReady=false;catalogFacetGeneration=generation;}
  catalogFacetCache.set(String(item.catalogId||item.id)+':'+(item.catalogQuality||'raw'),{projection});return projection;
}
function catalogSpecializationState() {
  return {enabled:catalogSearchMode==='special',
    axes:[0,1,2].map(i => ({key:byId('catalogSpecialAxis'+i)?.value || '', minimum:byId('catalogSpecialMin'+i)?.value || '', required:!!byId('catalogSpecialRequired'+i)?.checked})),
    showExcluded:!!byId('specialShowExcluded')?.checked, sort:byId('catalogSpecialSort')?.value || 'main'};
}
async function setupCatalogSpecializationOptions() {
  if (catalogFacetBuilding) return;
  // Checking one item detects source replacement before reusing option metadata.
  const items = equipmentCatalogItems();
  if (items[0]) catalogEffectProjection(items[0]);
  if (catalogFacetOptionsReady) return;
  catalogFacetBuilding = true;
  if(byId('catalogSpecialProgress'))byId('catalogSpecialProgress').hidden=false;
  const status = byId('catalogSpecialStatus');
  if (status) status.textContent = '候補効果を準備中…';
  try {
  const available = new Map();
  for (let i=0;i<items.length;i++) {
    for (const f of catalogEffectProjection(items[i]).facets) available.set(f.key, f.label);
    if (i % 100 === 99 || i === items.length-1) {
      if (status) status.textContent = '効果を準備中：'+(i+1)+' / '+items.length+' 装備';
      const progress=byId('catalogSpecialProgress'); if(progress){progress.max=items.length;progress.value=i+1;}
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  const options = [...available].sort((a,b) => a[1].localeCompare(b[1], 'ja'));
  for (let i=0;i<3;i++) {
    const select = byId('catalogSpecialAxis'+i); if (!select) continue;
    const previous = select.value;
    const formal=([key])=>!!MOEEquipmentSearchSpecification.metricFor(key);
    select.innerHTML = '<option value="">'+(i ? 'なし' : '選択してください')+'</option>'+[['最終値の最大化に対応（構成計算）',options.filter(formal)],['単品効果の比較のみ',options.filter(o=>!formal(o))]].map(([group,entries])=>'<optgroup label="'+group+'">'+entries.map(([key,label])=>'<option value="'+escapeAttr(key)+'">'+escapeHtml(label)+'</option>').join('')+'</optgroup>').join('');
    if (available.has(previous)) select.value = previous;
  }
  const presets = [
    ['ペット成長率補正（装備）','pet:experienceMultiplier'],
    ['破壊魔法 スキル値+（skillPlus） + 魔力','skillPlus:破壊魔法','stat:magic'],
    ['破壊魔法 スキル値+（skillPlus） + 火属性強化','skillPlus:破壊魔法','elementDamagePct:火属性'],
    ['回復魔法 スキル値+（skillPlus） + 魔力','skillPlus:回復魔法','stat:magic'],
    ['強化魔法 スキル値+（skillPlus） + 魔力','skillPlus:強化魔法','stat:magic'],
    ['キック攻撃補正 + 攻撃力','stat:extraKickAttack','stat:attack'],
    ['牙攻撃補正 + 攻撃力','stat:extraFangAttack','stat:attack'],
    ['回避 + AC候補値','stat:extraAvoid','candidate:AC'],
    ...['Fire','Water','Earth','Wind','Neutral'].map((x,i)=>[['火','水','地','風','無'][i]+'耐性','stat:extra'+x+'Res'])
  ].filter(p => p.slice(1).every(key => available.has(key)));
  const select = byId('catalogSpecialPreset');
  if (select) {
    select.innerHTML = '<option value="">プリセット</option>' + presets.map((p,i)=>'<option value="'+i+'">'+escapeHtml(p[0])+'</option>').join('');
    select.onchange = () => { const p = presets[+select.value]; if (!p || select.value === '') return;
      byId('catalogSpecialEnabled').checked = true;
      for(let i=0;i<3;i++){byId('catalogSpecialAxis'+i).value=p[i+1]||'';const optional=byId('catalogSpecialAxis'+i).closest('.catalogOptionalAxis');if(optional)optional.open=!!p[i+1];byId('catalogSpecialMin'+i).value='';if(i)byId('catalogSpecialRequired'+i).checked=false;}
      select.dispatchEvent(new Event('input', {bubbles:true}));
    };
  }
  catalogFacetOptionsReady = true;
  byId('catalogSpecialProgress').hidden = true;
  byId('catalogSpecialEnabled').disabled = false;
  if(byId('specialSearchButton')) byId('specialSearchButton').disabled = false;
  if (status) status.textContent = `${available.size}効果軸・${items.length}装備を準備しました。`;
  } finally { catalogFacetBuilding = false; }
}
function catalogSpecializationPanelHtml() {
  return `<section id="catalogSpecialPanel" class="catalogSpecialPanel"><h3>1. 比較する効果を選ぶ</h3>
    <p class="small">「最適構成を計算」は加算・％補正とBuff競合を含む最終値を最大化します。「候補を検索」は単品の効果を比較するため、加算値と％は別項目です。攻撃力の最終値最大化は現在未対応です。</p>
    <details class="catalogPolicyHelp"><summary>効果と最低条件について</summary><p class="small">既存のスキル強化表はskillPlusとして表示します。スキル性能強化とは区別してください。AC追加と防具本体ACも別軸です。</p></details>
    <p id="catalogSpecialStatus" class="small" role="status">初回だけ候補効果を準備します。</p>
    <input id="catalogSpecialEnabled" type="checkbox" checked hidden><progress id="catalogSpecialProgress" value="0" max="1" aria-label="効果データ準備の進捗"></progress>
    <select id="catalogSpecialPreset" data-catalog-special aria-label="特化検索プリセット"><option>準備中…</option></select>
    ${['メイン効果（必須）','サブ効果','追加効果'].map((label,i)=>`<div class="catalogSpecialAxis"><label>${label}<select id="catalogSpecialAxis${i}" data-catalog-special><option value="">${i?'なし':'選択してください'}</option></select></label><label>最低値<input id="catalogSpecialMin${i}" data-catalog-special type="number" step="any" placeholder="未指定 = 条件なし"></label>${i?`<label><input id="catalogSpecialRequired${i}" data-catalog-special type="checkbox"> この効果も持つ装備だけ</label>`:''}</div>`).join('')}
    <label>比較順<select id="catalogSpecialSort" data-catalog-special><option value="main">メイン → サブ → 追加（降順）</option><option value="sub">サブ降順</option><option value="additional">追加降順</option><option value="slot">部位</option><option value="name">名前</option></select></label>
    <p class="small">最低値の空欄と0は別です。空欄のメインは正寄与、空欄のサブ・追加は必須ではありません。「候補を検索」で反映します。</p></section>`;
}
function catalogSpecialHeader(filter) {
  const head = byId('catalogResultsBody')?.closest('table')?.querySelector('thead tr'); if (!head) return;
  const spec = filter.specialization;
  head.innerHTML = spec?.enabled ? '<th>装備名</th><th>部位</th>'+spec.axes.filter(a=>a.key).map(a=>'<th>'+escapeHtml(catalogFacetLabel(a.key))+'</th>').join('')+'<th>由来 / Buff</th><th>必要スキル</th><th>除外 / 固定</th><th>登録</th>' : '<th>装備名</th><th>部位</th><th>性能</th><th>装備Buff</th><th>登録</th>';
}
function catalogFacetLabel(key) { for(const entry of catalogFacetCache.values()){const f=entry.projection.facets.find(f=>f.key===key);if(f)return f.label;}return key?'効果':'なし'; }
function catalogSpecialRowHtml(item, already, spec) {
  const id=escapeAttr(item.catalogId||item.id||''), p=catalogEffectProjection(item);
  const numbers=spec.axes.filter(a=>a.key).map(a=>{const f=p.facets.find(f=>f.key===a.key);const sources=f?.sources.map(s=>`${s.source==='buff'?'Buff':s.source==='body'?'本体（要件補正前）':'本体/追加'} ${s.value}`).join(' / ')||'効果なし';return '<td title="'+escapeAttr(sources)+'">'+escapeHtml(String(f?.value||0))+'</td>';}).join('');
  const origins=[...new Set(p.facets.filter(f=>spec.axes.some(a=>a.key===f.key)).flatMap(f=>f.sources.map(s=>s.source)))].map(s=>s==='buff'?'Buff':s==='body'?'本体（要件補正前）':'本体/追加').join(' / ');
  const meta=[p.metadata.petExperience?(p.metadata.petExperience.multiplier?'ペット経験値 '+p.metadata.petExperience.multiplier+'倍（単品）':'ペット経験値倍率は旧・新値混在'):null,origins,p.metadata.hasBuff?'Buffあり':'Buffなし',p.metadata.groups.length?'競合groupあり':'',p.metadata.hasBuff&&p.metadata.stackRule?'stack: '+p.metadata.stackRule:''].filter(Boolean).join(' / ');
  return `<tr><td><button type="button" class="catalogNameButton" data-catalog-open="${id}">${escapeHtml(item.name||'')}</button></td><td>${escapeHtml(item.slot||'')}</td>${numbers}<td>${escapeHtml(meta)}</td><td>${escapeHtml(catalogRequirementAndPerformanceSummary(item))}</td><td>${catalogPolicyButtonsHtml(item)}</td><td><button type="button" data-catalog-add="${id}" ${already?'disabled':''}>${already?'登録済み':'＋ 登録'}</button></td></tr>`;
}

let catalogLastBulkPolicyChange=null;
function catalogBulkExclude(query,items=equipmentCatalogItems()) {
  const matches=catalogPolicyMatches(query,items);
  catalogLastBulkPolicyChange=matches.filter(i=>catalogCandidatePolicy.get(i)!=='excluded').map(item=>({item,previous:catalogCandidatePolicy.get(item)}));
  matches.forEach(item=>catalogCandidatePolicy.set(item,'excluded'));
  return matches.length;
}
function catalogUndoBulkExclude() {
  if(!catalogLastBulkPolicyChange)return;
  catalogLastBulkPolicyChange.forEach(({item,previous})=>catalogCandidatePolicy.set(item,previous));catalogLastBulkPolicyChange=null;
}
function catalogPolicyMatches(query,items=equipmentCatalogItems()) {
  const text=String(query||'').trim().normalize('NFKC').toLocaleLowerCase();
  return text?items.filter(i=>String(i.name||'').normalize('NFKC').toLocaleLowerCase().includes(text)):[];
}
function renderCatalogPolicyMatches() {
  const input=byId('specialPolicyQuery'),list=byId('specialPolicyMatches'),status=byId('specialPolicyFinderStatus');if(!input||!list||!status)return;
  const matches=catalogPolicyMatches(input.value);
  const bulk=byId('specialPolicyBulkExclude');if(bulk){bulk.disabled=!matches.length;bulk.textContent='一致する全'+matches.length+'件を除外';}
  const undo=byId('specialPolicyBulkUndo');if(undo)undo.disabled=!catalogLastBulkPolicyChange?.length;
  const fixed=matches.filter(i=>catalogCandidatePolicy.get(i)==='fixed').length;
  status.textContent=!input.value.trim()?'装備名を入力してください。':matches.length?'該当 '+matches.length+'件'+(matches.length>20?'（一覧は先頭20件。一括除外は全件が対象）':''):'該当する装備がありません。';if(fixed)status.textContent+=' 一括除外すると固定 '+fixed+'件も解除します。';
  list.innerHTML=matches.slice(0,20).map(i=>'<li><div><strong>'+escapeHtml(i.name)+'</strong><span class="catalogPolicySlot">'+escapeHtml(i.slot||'')+'</span></div><div>'+catalogPolicyButtonsHtml(i)+'</div></li>').join('');
}
function catalogPolicyButtonsHtml(item) {
  const id=escapeAttr(item.catalogId||item.id),policy=catalogCandidatePolicy.get(item);
  return ['fixed','excluded'].map(v=>'<button type="button" data-catalog-policy="'+id+'" data-policy="'+v+'" aria-pressed="'+(policy===v)+'">'+(v==='fixed'?(policy===v?'固定を解除':'固定'):(policy===v?'除外を解除':'除外'))+'</button>').join(' ');
}
function catalogOptimizerEquipmentHtml(e, fixedCandidateIds=[]) {
  const item=equipmentCatalogItems().find(i=>String(i.catalogId||i.id)===String(e.selectedCandidate.catalogId));
  if(!item)return '<li>'+escapeHtml(e.slot+'：'+e.selectedCandidate.name)+'</li>';
  return '<li><strong>'+escapeHtml((fixedCandidateIds.includes(e.selectedCandidate.candidateId)?'[固定] ':'')+e.slot+'：'+e.selectedCandidate.name)+'</strong> '+catalogPolicyButtonsHtml(item)+'<details><summary>性能詳細</summary><p>基本性能：'+escapeHtml(item.category==='weapon'?catalogWeaponSummary(item):catalogArmorSummary(item))+'</p><p>条件：'+escapeHtml(catalogRequirementAndPerformanceSummary(item))+'</p><p>追加効果：'+escapeHtml(catalogStatusSummary(item))+'</p><p>装備Buff：'+escapeHtml(catalogBuffSummary(item))+'</p>'+(item.info?'<p>'+escapeHtml(item.info)+'</p>':'')+'</details></li>';
}
function catalogSpecialDetailHtml(item, spec) {
  if (!spec?.enabled) return '';
  const p=catalogEffectProjection(item);
  return '<section>'+(p.metadata.petExperience?'<h4>ペット経験値倍率</h4><p>'+escapeHtml(p.metadata.petExperience.multiplier?'単品 '+p.metadata.petExperience.multiplier+'倍':'倍率は旧・新値混在のため比較対象外')+'</p><p>'+escapeHtml(p.metadata.petExperience.note)+'</p><p>候補値は単品の倍率です。「最適構成を計算」では併用分類を考慮して装備全体の倍率を比較します。</p>':'')+'<h4>今回の候補効果（競合前）</h4>'+spec.axes.filter(a=>a.key).map(a=>{const f=p.facets.find(f=>f.key===a.key);return '<p><strong>'+escapeHtml(catalogFacetLabel(a.key))+': '+(f?.value||0)+'</strong><br>'+escapeHtml(f?.sources.map(s=>(s.source==='buff'?'Equipment Buff':s.source==='body'?'本体（要件補正前）':'本体/add_status')+' '+s.value+' ['+s.field+']').join(' / ')||'該当効果なし')+'</p>';}).join('')+'<p class="small">'+escapeHtml([p.metadata.buffName,...p.metadata.groups,p.metadata.stackRule,p.metadata.technicId].filter(Boolean).join(' / '))+'：他装備・外部Buffとの同時成立は未判定。</p></section>';
}
let catalogSearchMode='normal',catalogOptimizationController=null,catalogOptimizationGeneration=0;
function mountCatalogSpecialization(panel){
  const modes=document.createElement('div');modes.className='catalogSearchModes';modes.setAttribute('role','group');modes.setAttribute('aria-label','カタログ検索モード');
  modes.innerHTML='<button id="catalogModeNormal" aria-pressed="true">通常検索</button><button id="catalogModeSpecial" aria-pressed="false">特化検索</button>';
  panel.querySelector('.catalogWorkspaceTop').after(modes);
  const special=document.createElement('section');special.id='catalogSpecialMode';special.hidden=true;
  special.innerHTML='<div class="catalogSpecialIntro"><h2>目的に合う装備を探す</h2><p>効果を選び、使いたい装備・使わない装備を指定して比較します。</p></div>'+catalogSpecializationPanelHtml()+
    '<div class="specialSearchActions"><h3>3. 比較・計算</h3><label>部位<select id="specialSlot"><option value="">全ての部位</option></select></label><label>装備名<input id="specialName" type="search" placeholder="任意"></label><button id="specialSearchButton" class="primary" disabled>候補を検索</button><p>候補検索：装備単体の競合前効果を比較。最低値は単品に適用します。</p><label>同点時<select id="specialSecondary"><option value="none">なし</option><option value="sub">サブ効果を最大化</option></select></label><button id="specialOptimizeButton" disabled>最適構成を計算</button><button id="specialOptimizeCancel" disabled>探索を停止</button><p>最適構成：選択した部位を装備なしから組み合わせ、スキルシミュレータとON外部Buffを開始時に固定して正式評価します。最低値は構成全体に適用。Top20。追加効果は最低条件として使用できます。</p><p id="specialOptimizerStatus" class="catalogSearchStatus" role="status">メイン効果を選んでください。</p><div id="specialOptimizerResults"></div></div>';
  special.querySelectorAll('.catalogSpecialAxis').forEach((axis,i)=>{if(!i)return;const optional=document.createElement('details');optional.className='catalogOptionalAxis';const title=document.createElement('summary');title.textContent=i===1?'サブ効果・最低条件（任意）':'追加の最低条件（任意）';optional.append(title);axis.before(optional);optional.append(axis);});
  panel.querySelector('.catalogWorkspaceGrid').before(special);
  const policies=document.createElement('section');policies.className='catalogPolicyPanel';policies.innerHTML='<h3>2. 装備の固定・除外</h3><p>計算前に装備名で探して設定できます。効果・部位の検索条件とは独立しています。</p><label class="catalogPolicyFinderLabel">設定する装備を探す<input id="specialPolicyQuery" type="search" placeholder="例：黒刀、ウルフ オーラ" autocomplete="off" aria-describedby="specialPolicyFinderStatus"></label><p id="specialPolicyFinderStatus" class="small" role="status">装備名を入力してください。</p><div class="catalogPolicyBulkActions"><button type="button" id="specialPolicyBulkExclude" disabled>一致する全0件を除外</button><button type="button" id="specialPolicyBulkUndo" disabled>直前の一括除外を戻す</button></div><ul id="specialPolicyMatches" class="catalogPolicyList"></ul><details class="catalogPolicyHelp"><summary>固定・除外の使い方</summary><p>固定は検索範囲外でも全構成に含みます。同じ部位の複数固定や両手武器の競合は拒否します。固定と除外はどちらか一方です。検索条件を変えても保持し、探索中の変更は次回から反映します。</p></details><label><input id="specialShowExcluded" type="checkbox" checked>除外した候補も表示</label><button data-policy-clear="excluded">除外を全解除</button><button data-policy-clear="fixed">固定を全解除</button><button data-policy-clear="all">全解除</button><p id="specialPolicySummary" role="status"></p><ul id="specialPolicyItems"></ul>';special.querySelector('.specialSearchActions').before(policies);
  byId('specialPolicyQuery').oninput=renderCatalogPolicyMatches;
  byId('specialPolicyBulkExclude').onclick=()=>{catalogBulkExclude(byId('specialPolicyQuery').value);refreshCatalogCandidatePolicy();};
  byId('specialPolicyBulkUndo').onclick=()=>{catalogUndoBulkExclude();refreshCatalogCandidatePolicy();};
  policies.querySelectorAll('[data-policy-clear]').forEach(b=>b.onclick=()=>{catalogLastBulkPolicyChange=null;catalogCandidatePolicy.clear(b.dataset.policyClear==='all'?null:b.dataset.policyClear);refreshCatalogCandidatePolicy();});
  byId('specialShowExcluded').onchange=()=>applyCatalogSearch(false);
  panel.addEventListener('click',event=>{const button=event.target.closest('[data-catalog-policy]');if(!button)return;const item=equipmentCatalogItems().find(i=>String(i.catalogId||i.id)===button.dataset.catalogPolicy);if(!item)return;const previous=catalogCandidatePolicy.get(item),next=previous===button.dataset.policy?'normal':button.dataset.policy;
    catalogCandidatePolicy.set(item,next);catalogLastBulkPolicyChange=null;try{MOEEquipmentCandidatePolicy.validateFixed(equipmentCatalogItems().filter(i=>catalogCandidatePolicy.get(i)==='fixed'),i=>catalogEquipmentToRow(i));}catch(error){catalogCandidatePolicy.set(item,previous);byId('specialPolicySummary').textContent=error.message;return;}refreshCatalogCandidatePolicy();});
  byId('specialSearchButton').onclick=()=>applyCatalogSearch(true);
  byId('catalogModeNormal').onclick=()=>setCatalogSearchMode('normal');byId('catalogModeSpecial').onclick=()=>setCatalogSearchMode('special');
  special.addEventListener('input',updateSpecializationOptimizationSupport);special.addEventListener('change',updateSpecializationOptimizationSupport);
  byId('specialOptimizeButton').onclick=runCatalogSpecializationOptimizer;
  byId('specialOptimizeCancel').onclick=()=>catalogOptimizationController?.abort();
}
async function setCatalogSearchMode(mode){
  catalogSearchMode=mode;
  byId('catalogModeNormal').setAttribute('aria-pressed',String(mode==='normal'));byId('catalogModeSpecial').setAttribute('aria-pressed',String(mode==='special'));
  byId('catalogSpecialMode').hidden=mode!=='special';
  const panel=document.querySelector('[data-tab-panel="catalog"]');panel.dataset.catalogMode=mode;
  for(const selector of ['.catalogWorkspaceFilters','.catalogWorkspaceSearch','.catalogWorkspaceSort'])panel.querySelector(selector).hidden=mode==='special';
  if(mode==='special'){
    await loadCatalogScriptsOnce();byId('specialSlot').innerHTML=catalogSlotOptions(equipmentCatalogItems());
    if(byId('specialSlot').dataset.saved)byId('specialSlot').value=byId('specialSlot').dataset.saved;
    await setupCatalogSpecializationOptions();updateSpecializationOptimizationSupport();
  }
  if(typeof restoreCatalogSearchMode==='function')restoreCatalogSearchMode(mode);else applyCatalogSearch(true);
}
function specializationSpecification(){
  return MOEEquipmentSearchSpecification.create(catalogSpecializationState().axes,{secondary:byId('specialSecondary').value==='sub',topK:20,
    slots:byId('specialSlot').value?[byId('specialSlot').value]:null,query:byId('specialName').value.trim()});
}
function updateSpecializationOptimizationSupport(){
  if(!byId('specialOptimizeButton'))return;
  const fixed=equipmentCatalogItems().filter(i=>catalogCandidatePolicy.get(i)==='fixed');byId('specialPolicySummary').textContent='固定 '+fixed.length+'件：'+fixed.map(i=>i.name).join(' / ')+' ／ 除外 '+Object.values(catalogCandidatePolicy.snapshot()).filter(v=>v==='excluded').length+'件';
  try{const spec=specializationSpecification();if((spec.primary.metric==='petGrowth'&&(spec.secondary||spec.constraints.some(c=>c.metric.metric!=='petGrowth')))||(spec.primary.metric!=='petGrowth'&&(spec.secondary?.metric==='petGrowth'||spec.constraints.some(c=>c.metric.metric==='petGrowth'))))throw new Error('ペット成長率は単独軸で計算してください。');byId('specialOptimizeButton').disabled=!!catalogOptimizationController||!catalogFacetOptionsReady;
    if(!catalogOptimizationController)byId('specialOptimizerStatus').textContent=(spec.primary.metric==='petGrowth'?'装備による成長率補正を計算します。BRE・消耗品・ペットへの技は含みません。 ':'')+'正式計算に対応しています。メイン最大'+(spec.secondary?' → 同点時サブ最大':'')+' → 構成キーの順で比較します。';
  }catch(error){byId('specialOptimizeButton').disabled=true;if(!catalogOptimizationController)byId('specialOptimizerStatus').textContent=error.message+' 候補検索は利用できます。';}
  const policyList=byId('specialPolicyItems');if(policyList)policyList.innerHTML=equipmentCatalogItems().filter(i=>catalogCandidatePolicy.get(i)!=='normal').map(i=>'<li>'+escapeHtml(i.name)+' '+catalogPolicyButtonsHtml(i)+'</li>').join('');
  document.querySelectorAll('[data-catalog-policy]').forEach(b=>{const item=equipmentCatalogItems().find(i=>String(i.catalogId||i.id)===b.dataset.catalogPolicy);if(item){const active=catalogCandidatePolicy.get(item)===b.dataset.policy;b.setAttribute('aria-pressed',String(active));b.textContent=b.dataset.policy==='fixed'?(active?'固定を解除':'固定'):(active?'除外を解除':'除外');}});
  byId('specialSlot').dataset.saved=byId('specialSlot').value;
}
let facetOptimizerScriptsPromise=null;
function loadFacetOptimizerScripts(){
  if(!facetOptimizerScriptsPromise)facetOptimizerScriptsPromise=(async()=>{
    for(const name of ['petGrowth','metrics','searchContext','effectiveCandidates','evaluationSession','branchAndBound','metricCandidateReducer','facetSearch']){
      await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='./src/optimizer-v2/'+name+'.js?v=phase4I-20261003';script.onload=resolve;script.onerror=()=>reject(new Error('Optimizerの読み込みに失敗しました'));document.head.append(script);});
    }
  })().catch(error=>{facetOptimizerScriptsPromise=null;throw error;});return facetOptimizerScriptsPromise;
}
function waitForFacetOptimizerScripts(signal){
  // The shared load may finish for a later run; only this run's wait is aborted.
  const loaded=loadFacetOptimizerScripts();let abort;
  return new Promise((resolve,reject)=>{
    abort=()=>{const error=new Error('Preparation aborted');error.name='AbortError';reject(error);};
    loaded.then(resolve,reject);
    if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});
  }).finally(()=>signal.removeEventListener('abort',abort));
}
function catalogFormalAxisValues(axes,context,result){
  return MOEOptimizerV2SearchContext.withRuntime(context,()=>axes.filter(a=>a.key).map(a=>{
    const metric=MOEEquipmentSearchSpecification.metricFor(a.key);
    if(metric?.metric==='petGrowth'&&!result.metrics.petGrowth)return catalogFacetLabel(a.key)+': '+MOEPetGrowth.resolve(result.equipment.map(e=>MOEOptimizerV2Candidates.toEquipmentRow(e.selectedCandidate))).multiplier;
    return catalogFacetLabel(a.key)+': '+(metric?MOEOptimizerV2Metrics.read(metric,result.metrics,result.dps):'正式値の構成評価は未対応（候補比較のみ）');
  }).join(' / '));
}
async function runCatalogSpecializationOptimizer(){
  if(catalogOptimizationController)return;
  const spec=specializationSpecification(),axes=JSON.parse(JSON.stringify(catalogSpecializationState().axes)),controller=new AbortController();catalogOptimizationController=controller;
  const generation=++catalogOptimizationGeneration,isCurrent=()=>generation===catalogOptimizationGeneration&&catalogOptimizationController===controller;
  const preparationStarted=performance.now();let runContext=null;
  let preparationDisplayAt=0,preparationDisplayPhase='';
  globalThis.MOE_LAST_FACET_SEARCH=null;
  byId('specialOptimizeButton').disabled=true;byId('specialOptimizeCancel').disabled=false;
  byId('specialOptimizerResults').innerHTML='';const status=byId('specialOptimizerStatus');status.textContent='正式入力と候補を準備中…';
  // Capture before any await: subsequent UI changes cannot alter this search.
  const base=JSON.parse(JSON.stringify(state)),inputs=collectInputs(),policy=catalogCandidatePolicy.snapshot();
  const preparationProgress=d=>{
    const now=performance.now();if(isCurrent()&&(d.phase!==preparationDisplayPhase||now-preparationDisplayAt>=50)){
      preparationDisplayAt=now;preparationDisplayPhase=d.phase;
      const phase={scripts:'読み込み',catalog:'装備データ',policy:'固定・除外候補', 'candidate preparation':'候補生成',reducer:'候補評価','reducer projection':'付加効果評価',equivalence:'同等装備整理','reducer relevance':'関連候補整理','reducer classes':'候補構成整理','reducer dominance':'候補整理',finalize:'最終準備'}[d.phase]||'候補準備';
      status.textContent='準備中：'+phase+' / '+d.processed.toLocaleString()+' / '+d.total.toLocaleString()+' / '+((now-preparationStarted)/1000).toFixed(1)+'秒';
    }
  };
  try{
    preparationProgress({phase:'scripts',processed:0,total:8});
    await waitForFacetOptimizerScripts(controller.signal);
    MOEOptimizerV2Candidates.abortPreparation(controller.signal);
    if(!isCurrent())return;
    preparationProgress({phase:'policy',processed:0,total:0});
    const fixedItems=equipmentCatalogItems().filter(i=>policy[String(i.catalogId||i.id)]==='fixed');
    const items=equipmentCatalogItems().filter(item=>policy[String(item.catalogId||item.id)]==='fixed'||((!spec.slots||spec.slots.includes(item.slot))&&(!spec.query||String(item.name).toLocaleLowerCase().includes(spec.query.toLocaleLowerCase()))));
    const snapshot=await MOEOptimizerV2Candidates.generateAsync({items:items.filter(i=>policy[String(i.catalogId||i.id)])},
      {signal:controller.signal,onProgress:d=>preparationProgress({...d,phase:'policy'})});
    MOEOptimizerV2Candidates.abortPreparation(controller.signal);if(!isCurrent())return;
    MOEEquipmentCandidatePolicy.validateFixed(fixedItems,i=>catalogEquipmentToRow(i));
    const compiled=MOEEquipmentCandidatePolicy.compile(policy,snapshot);
    const runSpec=spec.slots?{...spec,slots:[...new Set([...spec.slots,...snapshot.candidates.filter(c=>compiled.fixedCandidateIds.includes(c.candidateId)).map(c=>c.slot)])]}:spec;
    const context=MOEEquipmentSearchSpecification.toContext(runSpec,{baseState:base,inputs,...compiled});
    runContext=context;
    await new Promise(resolve=>setTimeout(resolve,0));
    MOEOptimizerV2Candidates.abortPreparation(controller.signal);
    const started=performance.now();
    const fixedCandidates=snapshot.candidates.filter(c=>compiled.fixedCandidateIds.includes(c.candidateId));
    const validation=fixedCandidates.length?MOEOptimizerV2SearchContext.evaluate(context,fixedCandidates,snapshot.sources):{violations:[]};
    const structural=validation.violations.filter(v=>!String(v).startsWith('constraint'));
    if(structural.length)throw new Error('固定装備を利用できません：'+structural.join(' / '));
    const prepared=await MOEOptimizerV2FacetSearch.prepareAsync(items,context,{signal:controller.signal,onProgress:preparationProgress});
    MOEOptimizerV2Candidates.abortPreparation(controller.signal);
    if(!isCurrent())return;
    status.textContent='固定 '+compiled.fixedCandidateIds.length+'件 / 除外 '+Object.values(policy).filter(v=>v==='excluded').length+'件。'+prepared.diagnostics.relevant+'候補 / '+prepared.diagnostics.classes+'クラス。探索中…';
    const result=await MOEOptimizerV2FacetSearch.run(prepared,{signal:controller.signal,profileEvaluation:true,onProgress:d=>{
      if(!isCurrent())return;
      status.textContent='探索中：'+d.searchNodes.toLocaleString()+'ノード / 正式評価 '+d.completeConfigurationsEvaluated.toLocaleString()+'件 / '+((performance.now()-started)/1000).toFixed(1)+'秒。未完走の結果はExactではありません。';
    }});
    if(!isCurrent())return;
    globalThis.MOE_LAST_FACET_SEARCH={spec,context,diagnostics:prepared.diagnostics,result,elapsedMs:performance.now()-started};
    status.textContent=(result.diagnostics.exact?'完走・この探索範囲内の最適構成（exact:true）':'停止・未完走（exact:false）')+' / '+prepared.diagnostics.relevant+'候補 / '+prepared.diagnostics.classes+'クラス / '+result.diagnostics.searchNodes.toLocaleString()+'ノード / 正式評価 '+result.diagnostics.completeConfigurationsEvaluated+'件 / '+((performance.now()-started)/1000).toFixed(2)+'秒';
    byId('specialOptimizerResults').innerHTML='<p>探索範囲：'+escapeHtml(runSpec.slots?runSpec.slots.join(' / '):'全ての部位')+(spec.query?' / 装備名 '+escapeHtml(spec.query):'')+'。固定 '+compiled.fixedCandidateIds.length+'件 / 除外 '+Object.values(policy).filter(v=>v==='excluded').length+'件。開始時の種族 '+escapeHtml(context.race)+' / 精神力 '+context.skillSim.skills['精神力']+' / 攻撃回避 '+context.skillSim.skills['攻撃回避']+' / 呪文抵抗力 '+context.skillSim.skills['呪文抵抗力']+'</p>'+ (result.results.map((r,i)=>'<details class="catalogOptimizerCard"'+(i===0?' open':'')+'><summary>'+ (i+1)+'位：'+escapeHtml(catalogFacetLabel(axes[0].key))+' '+catalogFormatScore(r.score)+(r.metrics.petGrowth?'倍':'')+(r.secondaryScore!==undefined?' / '+escapeHtml(catalogFacetLabel(axes[1].key))+' '+catalogFormatScore(r.secondaryScore):'')+'</summary><p>'+escapeHtml(catalogResultDifference(result.results[0],r))+'</p><p>'+escapeHtml(r.metrics.petGrowth?.scope||'正式Buff競合解決後の評価値。')+' '+(result.diagnostics.exact?'Exact':'暫定構成')+'</p><p>'+escapeHtml(catalogFormalAxisValues(axes,context,r))+'</p><ul>'+r.equipment.map(e=>catalogOptimizerEquipmentHtml(e,compiled.fixedCandidateIds)).join('')+'</ul><details><summary>同等ID・計算情報</summary><pre>'+escapeHtml(JSON.stringify({configurationKey:r.performanceKey,equivalentCandidateIds:r.equipment.map(e=>({slot:e.slot,ids:e.equivalentCandidateIds})),skillPlus:r.metrics.skillPlusTotals,petGrowth:r.metrics.petGrowth,extraStats:r.metrics.extraStats},null,2))+'</pre></details></details>').join('')||(result.diagnostics.exact?'<p>指定した部位・装備名の範囲には、条件を満たす構成がありません。</p>':'<p>未完走です。条件を満たす構成はまだ見つかっていません。</p>'));
  }catch(error){if(isCurrent()){
    if(error.name==='AbortError'){
      status.textContent='準備を停止・未完走（exact:false） / 0ノード';
      globalThis.MOE_LAST_FACET_SEARCH={spec,context:runContext,result:{results:[],diagnostics:{exact:false,searchNodes:0,completeConfigurationsEvaluated:0}},elapsedMs:performance.now()-preparationStarted};
      byId('specialOptimizerResults').innerHTML='<p>準備を中断しました。条件を変えて再検索できます。</p>';
    }else status.textContent='計算できませんでした：'+error.message;
  }}
  finally{if(isCurrent()){const message=status.textContent;catalogOptimizationController=null;byId('specialOptimizeCancel').disabled=true;updateSpecializationOptimizationSupport();status.textContent=message;}}
}

function refreshCatalogCandidatePolicy(){renderCatalogPolicyMatches();updateSpecializationOptimizationSupport();applyCatalogSearch(false,true);if(byId('specialOptimizerResults').innerHTML)byId('specialOptimizerStatus').textContent='固定・除外を変更しました。表示中の結果は変更前の構成です。「最適構成を計算」で再検索してください。';}
function catalogFormatScore(value){return Number.isFinite(value)?Number(value.toFixed(6)).toLocaleString('ja-JP',{maximumFractionDigits:6}):String(value);}
function catalogResultDifference(top,row){const d=MOEEquipmentCandidatePolicy.difference(top,row);return 'Top1との差：メイン '+Number(d.primary.toFixed(6))+(d.secondary===null?'':' / サブ '+Number(d.secondary.toFixed(6)))+' / 変更部位：'+(d.slots.join(' / ')||'なし');}
