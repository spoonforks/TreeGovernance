/* Three levels of exploration. No external services, fonts or analytics. */
(async function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe = v => { try { const u = new URL(v); return /^https?:$/.test(u.protocol) ? u.href : '#'; } catch { return '#'; } };
  const titles = { actor:'Actor',process:'Process',data:'Data / object',rule:'Rule / policy',resource:'Resource',ecology:'Ecology' };
  const modes = { formal:'Formal authority / rule',policy:'Policy requirement',reported:'Reported practice',analytical:'Analytical construct',unknown:'Not classified',biophysical:'Biophysical' };
  const colors = { actor:'#69978a',process:'#c8a46c',data:'#7797ad',rule:'#aa7c73',resource:'#9b8aa8',ecology:'#7e9b61' };
  let M, I, state, inspection = null, directoryType = 'all', directoryArea = 'all', directoryScale = 'all', routeFrom, routeTo;
  let notes = {}; try { notes = JSON.parse(localStorage.getItem('treeGovNotesV1') || '{}'); if (!notes || typeof notes !== 'object') notes = {}; } catch { notes = {}; }
  const notify = msg => { $('#toast').textContent = msg; $('#toast').style.display = 'block'; clearTimeout(notify.timer); notify.timer = setTimeout(() => $('#toast').style.display = 'none', 3000); };
  const badge = (text, cls='') => `<span class="badge ${esc(cls)}">${esc(text)}</span>`;
  const typeLine = n => `<div class="type-line"><i class="shape ${esc(n.type)}" aria-hidden="true"></i>${esc(titles[n.type])}</div>`;
  const sourceHTML = ids => [...new Set(ids || [])].map(id => I.sources[id]).filter(Boolean).map(s => `<div class="evidence"><a href="${safe(s.url)}" target="_blank" rel="noopener">${esc(s.id)} · ${esc(s.title)} ↗</a><p>${esc(s.note)}</p></div>`).join('');
  const nodeButton = (id, action='element') => { const n=I.nodes[id]; return n ? `<button class="small-card" data-action="${action}" data-id="${esc(id)}">${typeLine(n)}<strong>${esc(n.label)}</strong><small>${esc(n.summary)}</small></button>` : ''; };
  function parse() {
    const p = new URLSearchParams(location.hash.slice(1));
    const view = ['system','situation','element'].includes(p.get('view')) ? p.get('view') : 'system';
    let arena = I.situations[p.get('arena')] ? p.get('arena') : null;
    const node = I.nodes[p.get('node')] ? p.get('node') : null;
    if (node && arena && !I.nodes[node].actionSituations.includes(arena)) arena = I.nodes[node].home;
    if (view === 'situation' && !arena) arena = 'assessment';
    return {view,arena,node,tab:p.get('tab')||'activities',basis:p.get('basis')==='documented'?'documented':'all',group:p.get('group')||'all',mode:p.get('mode')||'all',page:Math.max(0,parseInt(p.get('page'))||0)};
  }
  function go(values, replace=false) {
    const next = {...state,...values};
    const p = new URLSearchParams();
    for (const k of ['view','arena','node','tab','basis','group','mode','page']) if (next[k] && next[k] !== 'all' && next[k] !== 'activities') p.set(k,next[k]);
    if (replace) { history.replaceState(null,'','#'+p); state=parse(); render(); }
    else if (location.hash === '#'+p) { state=parse(); render(); }
    else location.hash = p.toString();
  }
  function openElement(id) {
    if (!I.nodes[id]) return;
    inspection = null;
    go({view:'element',node:id,arena:state.arena && I.situations[state.arena].members.includes(id)?state.arena:I.nodes[id].home,page:0});
  }
  function evidenceSummary(es) { const d=es.filter(e=>e.basis==='documented').length; return `${d} documented · ${es.length-d} synthesis`; }
  function edgeRow(e) {
    return `<button class="relation-row" data-action="edge" data-id="${e.id}"><strong>${esc(I.nodes[e.source].label)} → ${esc(I.nodes[e.target].label)}</strong><span class="predicate">${esc(e.label)}</span><small>${esc(e.id)} · ${esc(e.group)} · ${esc(e.basis)} · ${esc(modes[e.institutionalMode]||'Not classified')}</small></button>`;
  }
  const arenaEdges = s => M.edges.filter(e=>s.members.includes(e.source)&&s.members.includes(e.target));
  function legend() { return `<div class="legend">${Object.entries(titles).map(([k,v])=>`<span><i class="shape ${k}" aria-hidden="true"></i>${v}</span>`).join('')}<span>— Documented</span><span>┄ Synthesis / mixed bundle</span></div>`; }
  function lineText(text,x,y,cls='title',max=23,lineHeight=28) {
    const words=String(text).split(/\s+/), lines=[]; let line='';
    words.forEach(w=>{if(line && (line+' '+w).length>max){lines.push(line);line=w;}else line+=(line?' ':'')+w;}); if(line)lines.push(line);
    return `<text class="${cls}" x="${x}" y="${y}">${lines.map((l,i)=>`<tspan x="${x}" dy="${i?lineHeight:0}">${esc(l)}</tspan>`).join('')}</text>`;
  }
  function defs() { return '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M1 1L9 5L1 9Z" fill="#7c9684"/></marker></defs>'; }
  function header(kicker,title,description) { return `<div class="intro"><div><div class="kicker">${esc(kicker)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></div><button class="quiet" data-action="share">Copy view link ↗</button></div>`; }
  function systemView() {
    const pos={strategy:[45,50],design:[415,50],permits:[785,50],learning:[45,450],assessment:[415,450],care:[785,450]};
    const paths={h1:['M335 135L412 135',374,117],h2:['M560 220L560 447',560,326],h3:['M620 450L620 367Q620 350 637 350L913 350Q930 350 930 333L930 223',765,337],h4:['M1000 220L1000 447',1000,310],h6:['M705 535L782 535',744,515],h7:['M930 620L930 695Q930 710 913 710L207 710Q190 710 190 693L190 623',560,698],h8:['M160 450L160 223',160,326]};
    let edges='';
    M.transfers.filter(t=>t.primary).forEach(t=>{const [d,x,y]=paths[t.id],mixed=t.underlyingBases.includes('synthesis');edges+=`<g data-transfer="${t.id}"><path class="connector ${t.channel} ${mixed?'synthesis':''}" d="${d}"/><path class="edge-hit" d="${d}" data-action="transfer" data-id="${t.id}"/><text class="edge-label" x="${x}" y="${y}" text-anchor="middle">${['h1','h6'].includes(t.id)?t.label.split(' ').map((w,i)=>`<tspan x="${x}" dy="${i?15:-12}">${esc(w)}</tspan>`).join(''):esc(t.label)}</text></g>`;});
    const cards=M.actionSituations.map((s,i)=>{const [x,y]=pos[s.id];return `<g class="card" role="button" tabindex="0" aria-label="Open action situation: ${esc(s.label)}" data-action="situation" data-id="${s.id}" transform="translate(${x} ${y})"><rect width="290" height="170" rx="13"/><rect class="accent" x="19" y="23" width="26" height="3"/><text class="sub" x="55" y="28">${String(i+1).padStart(2,'0')} / ACTION SITUATION</text>${lineText(s.label,20,66)}<text class="hint" x="20" y="133">${esc(s.short)}</text><text class="hint" x="20" y="153">${s.core.length} ${s.core.length===1?'activity':'activities'} · open arena →</text></g>`;}).join('');
    $('#main').innerHTML=header('Level 3 / System','How the tree system works','Six connected action situations. Start with an arena, then follow its activities, participants and evidence—without opening the whole network at once.')+
      `<div class="panel"><div class="panel-bar"><span>Main pathways · select an arena to go deeper</span><button data-action="handoffs">All ${M.transfers.length} selected handoffs</button></div><div class="graph-scroll system-canvas"><svg class="graph system-graph" viewBox="0 0 1130 755" role="group" aria-label="Six action situations and seven primary handoffs">${defs()}${edges}${cards}</svg></div><div class="mobile-system">${M.actionSituations.map(s=>`<button class="small-card" data-action="situation" data-id="${s.id}"><div class="kicker">Action situation</div><strong>${esc(s.label)}</strong><small>${esc(s.question)}</small><small>Open activities and connections →</small></button>`).join('')}</div><div class="legend"><span>Rounded cards = action situations</span><span>Arrows = bundles of mapped relations</span><span>Dashed = includes synthesis</span></div></div>`+
      '<p class="footnote">Seven primary handoffs are drawn for readability. These are selected pathways, not an exhaustive flowchart or a required sequence. Select an arrow to see the exact underlying relations.</p>'+
      '<div class="section-heading"><h2>Explore a question</h2><span class="muted tiny">Directed graph queries · no LLM</span></div><div class="situation-grid">'+M.questions.map((q,i)=>`<button class="small-card" data-action="question" data-id="${i}"><strong>${esc(q.title)}</strong><small>Trace the mapped route and inspect where it depends on synthesis. →</small></button>`).join('')+'</div>';
    overviewInspector();
  }
  function overviewInspector() {
    $('#inspector').innerHTML=`<div class="kicker">A layered research model</div><h2 class="inspector-title">One system.<br>Three ways in.</h2><p><strong>System</strong> shows relationships between arenas.</p><p><strong>Action situations</strong> reveal activities, participants, rules and resources.</p><p><strong>Elements</strong> expose individual claims and their sources.</p><div class="metrics"><div><strong>${M.actionSituations.length}</strong><small>arenas</small></div><div><strong>${M.nodes.length}</strong><small>elements</small></div><div><strong>${M.edges.length}</strong><small>relations</small></div></div><div class="caution">A structured research synthesis, not an official organisational chart. Grouping elements does not establish a legal responsibility or prove influence.</div><div class="inspector-section"><h3>What remains unknown?</h3><p>Actual resource allocations, informal influence, and whether particular evidence changed a decision require practitioner validation.</p><button data-action="method">Read the modelling boundaries</button></div><div class="inspector-section"><h3>Readability by design</h3><p>Only six arena cards here. No more than five activities per arena. Element graphs show at most eight relation endpoints per page.</p></div>`;
  }
  function situationView() {
    const s=I.situations[state.arena], es=arenaEdges(s), members=s.members.map(id=>I.nodes[id]);
    const tabs=[['activities','Activities'],['participants','Participants'],['information','Information'],['constraints','Rules & resources'],['evidence','Evidence & gaps']];
    if(!tabs.some(([k])=>k===state.tab))state.tab='activities';
    let body='';
    if(state.tab==='activities') body=`<p class="footnote row-title">Activities are grouped by function, not numbered as a mandatory sequence. Select one to inspect its actual connections.</p><div class="activity-list">`+s.core.map((id,i)=>{const n=I.nodes[id];return `<article class="activity"><div class="step">${String.fromCharCode(65+i)}</div><div><div class="type-line"><i class="shape process"></i>Activity</div><h3>${esc(n.label)}</h3><p>${esc(n.summary)}</p><div class="badges">${badge(TreeGov.incident(M,id).length+' mapped relations')}${badge(n.scales.join(' / '))}</div></div><button data-action="inspect" data-id="${id}">Inspect →</button></article>`;}).join('')+'</div>';
    if(state.tab==='participants') body='<p class="footnote row-title">Roles below come from actual relation records—not from membership in this arena. These are not rankings of power or influence.</p>'+members.filter(n=>n.type==='actor').map(n=>{const roles=es.filter(e=>e.source===n.id||e.target===n.id);return `<article class="small-card"><div class="type-line"><i class="shape actor"></i>Participant</div><h3>${esc(n.label)}</h3><p>${esc(n.translation||n.summary)}</p>${roles.length?roles.map(edgeRow).join(''):'<p>No role relationship is explicitly mapped within this arena. Included as context only.</p>'}<button data-action="element" data-id="${n.id}">Explore this actor →</button></article>`;}).join('<div style="height:12px"></div>');
    if(state.tab==='information') body='<p class="footnote row-title">Records and ecological objects used in this arena. “Available” does not imply “consulted” or “acted upon”.</p><div class="cards-grid">'+members.filter(n=>['data','ecology'].includes(n.type)).map(n=>nodeButton(n.id,'inspect')).join('')+'</div>';
    if(state.tab==='constraints') body='<h3 class="row-title">Rules and policy instruments</h3><div class="cards-grid">'+members.filter(n=>n.type==='rule').map(n=>nodeButton(n.id,'inspect')).join('')+'</div><div class="section-heading"><h3>Resources that enable action</h3></div>'+ (members.some(n=>n.type==='resource')?'<div class="cards-grid">'+members.filter(n=>n.type==='resource').map(n=>nodeButton(n.id,'inspect')).join('')+'</div>':'<div class="empty">No specific resource is mapped for this arena yet. That is a research gap—not evidence that the arena needs no resources.</div>')+'<div class="caution">Budget control, available staff time and informal influence have not been quantified. Formal rules and reported practice are separate from evidence confidence.</div>';
    if(state.tab==='evidence') body=`<div class="badges">${badge(evidenceSummary(es))}${badge('Arena boundary: analytical')}</div><h3 class="row-title">Questions for practitioner validation</h3>${s.gaps.map(g=>`<div class="caution">${esc(g)}</div>`).join('')}<h3 class="section-heading">Source base</h3>${sourceHTML(s.sources)}<h3 class="section-heading">Record a research note</h3>${noteHTML('arena:'+s.id)}<details><summary>Inspect ${es.length} relations within this arena</summary>${es.map(edgeRow).join('')}</details>`;
    if(!body.trim()||body.endsWith('class="cards-grid"></div>'))body+='<div class="empty">Nothing is explicitly mapped in this category yet.</div>';
    const links=M.transfers.filter(t=>t.source===s.id||t.target===s.id);
    $('#main').innerHTML=header('Level 2 / Action situation',s.label,s.summary)+`<div class="situation-summary"><div class="kicker">The governing question</div><h2>${esc(s.question)}</h2></div><div class="tabs" role="tablist" aria-label="Arena detail categories">${tabs.map(([key,label])=>`<button role="tab" aria-selected="${state.tab===key}" class="tab ${state.tab===key?'active':''}" data-action="tab" data-id="${key}">${label}</button>`).join('')}</div><section role="tabpanel">${body}</section><div class="section-heading"><h2>Across the arena boundary</h2></div><div class="situation-grid">${links.map(t=>`<button class="small-card" data-action="transfer" data-id="${t.id}"><div class="kicker">${t.source===s.id?'Outgoing':'Incoming'} handoff</div><strong>${esc(I.situations[t.source].label)} → ${esc(I.situations[t.target].label)}</strong><small>${esc(t.label)} · ${t.edgeIds.length} underlying relation${t.edgeIds.length===1?'':'s'}</small></button>`).join('')}</div>`;
    if(inspection && s.members.includes(inspection))nodeInspector(inspection);else arenaInspector(s);
  }
  function arenaInspector(s) {
    $('#inspector').innerHTML=`<div class="kicker">Arena boundary</div><h2 class="inspector-title">${esc(s.short)}</h2><div class="badges">${badge(s.scales.join(' / '))}${badge('Analytical grouping','synthesis')}</div><p>${esc(s.outcomes.join(' '))}</p><div class="inspector-section"><h3>Scope, not a new institution</h3><p>This arena groups existing elements. Participants can appear in several arenas while retaining the same stable identifier.</p></div><div class="inspector-section"><h3>Validate this assumption</h3><p>${esc(s.gaps[0])}</p><button data-action="tab" data-id="evidence">Evidence & research gaps →</button></div><div class="inspector-section"><h3>Explore activities</h3>${s.core.map(id=>`<button class="small-card" data-action="element" data-id="${id}"><strong>${esc(I.nodes[id].label)}</strong><small>Open element-level relationships →</small></button>`).join('')}</div>`;
  }
  function nodeInspector(id) {
    const n=I.nodes[id], es=TreeGov.incident(M,id);
    $('#inspector').innerHTML=`${typeLine(n)}<h2 class="inspector-title">${esc(n.label)}</h2>${n.translation?`<p><strong>Name / English explanation:</strong> ${esc(n.translation)}</p>`:''}<p>${esc(n.summary)}</p><div class="badges">${badge('Confidence: '+n.confidence)}${badge(modes[n.institutionalMode]||'Not classified')}${n.scales.map(s=>badge(s)).join('')}</div><p class="tiny">Institutional-mode and scope tags are editorial descriptors, not fresh factual verification.</p>${state.view!=='element'?`<button class="primary" data-action="element" data-id="${id}">Explore this element →</button>`:''}<div class="inspector-section"><h3>Where this element appears</h3><div class="chip-row">${n.actionSituations.map(id=>`<button data-action="situation" data-id="${id}">${esc(I.situations[id].label)}</button>`).join('')}</div><p>${esc(n.why)}</p></div><div class="inspector-section"><h3>Evidence base</h3><p>${esc(evidenceSummary(es))}. No case-level observation or stakeholder validation is recorded.</p><details><summary>${n.sources.length} supporting sources</summary>${sourceHTML(n.sources)}</details></div><div class="inspector-section"><h3>Research note</h3>${noteHTML(id)}</div><div class="inspector-section"><span class="tiny">Stable ID: ${esc(id)}</span></div>`;
  }
  function noteHTML(id) {
    const n=notes[id]||{};
    return `<textarea data-note="${esc(id)}" aria-label="Research note" placeholder="What is missing, uncertain or contested?">${esc(n.text||'')}</textarea><label class="tiny"><input type="checkbox" data-flag="${esc(id)}" ${n.flagged?'checked':''}> Flag for follow-up</label><div class="note-save">Stored in this browser only. Not sent to GitHub.</div>`;
  }
  function directoryView() {
    let nodes=M.nodes.filter(n=>(directoryType==='all'||n.type===directoryType)&&(directoryArea==='all'||n.actionSituations.includes(directoryArea))&&(directoryScale==='all'||n.scales.includes(directoryScale)));
    $('#main').innerHTML=header('Level 1 / Element index','Find a starting point','Actors, activities, data, rules, resources and ecological objects. Open one to explore its immediate relationships rather than loading every element into one canvas.')+`<div class="controls"><label>Type <select id="directoryType"><option value="all">All types</option>${Object.entries(titles).map(([k,v])=>`<option value="${k}" ${k===directoryType?'selected':''}>${v}</option>`).join('')}</select></label><label>Arena <select id="directoryArea"><option value="all">All action situations</option>${M.actionSituations.map(s=>`<option value="${s.id}" ${s.id===directoryArea?'selected':''}>${esc(s.label)}</option>`).join('')}</select></label><label>Scale <select id="directoryScale"><option value="all">All scales</option>${[...new Set(M.nodes.flatMap(n=>n.scales))].sort().map(x=>`<option value="${x}" ${x===directoryScale?'selected':''}>${esc(x)}</option>`).join('')}</select></label><span class="muted tiny">${nodes.length} elements</span></div><div class="directory-grid">${nodes.map(n=>nodeButton(n.id)).join('')}</div>`;
    overviewInspector();
  }
  function elementView() {
    if(!state.node)return directoryView();
    const n=I.nodes[state.node], page=TreeGov.neighborhood(M,n.id,state,state.page);
    state.page=page.page;
    const es=[...page.incoming,...page.outgoing];
    $('#main').innerHTML=header('Level 1 / Element',n.label,'A bounded view of immediate incoming and outgoing relations. Page through connections or follow an element; the full graph remains intact.')+
      `<div class="controls"><label>Evidence <select id="basis"><option value="all">All evidence</option><option value="documented" ${state.basis==='documented'?'selected':''}>Documented only</option></select></label><label>Relation <select id="group"><option value="all">All relation types</option>${['authority','information','operation','participation','resource','ecology'].map(x=>`<option ${x===state.group?'selected':''} value="${x}">${x}</option>`).join('')}</select></label><label>Institution <select id="mode"><option value="all">All modes</option>${Object.entries(modes).filter(([k])=>k!=='biophysical').map(([k,v])=>`<option value="${k}" ${k===state.mode?'selected':''}>${v}</option>`).join('')}</select></label></div><div class="panel"><div class="panel-bar"><span>${es.length} of ${page.total} matching relations · click to inspect, drag to rearrange</span><div class="tools"><button data-action="reset-layout">Reset layout</button><div class="pager"><button data-action="page" data-id="${page.page-1}" ${page.page===0?'disabled':''} aria-label="Previous connections">←</button><span>${page.page+1} / ${page.pages}</span><button data-action="page" data-id="${page.page+1}" ${page.page+1===page.pages?'disabled':''} aria-label="Next connections">→</button></div></div></div><div class="graph-scroll" id="elementCanvas"></div><div class="mobile-element-note">On a narrow screen, use the full relation list below instead of a compressed graph.</div>${legend()}</div>${!es.length?'<div class="caution">No relations match these filters. This does not establish that the element is disconnected in the real system. Reset the filters or inspect the evidence gap.</div>':''}<p class="footnote">Arrow direction is preserved. A line is a typed relation, not necessarily a causal effect. Dragging changes only the drawing, never the model.</p><div class="section-heading"><h2>Read the relations</h2><button data-action="trace-from" data-id="${n.id}">Trace from here →</button></div>${es.map(edgeRow).join('')}`;
    drawNeighborhood(n,page);nodeInspector(n.id);
  }
  function svgIcon(type,x,y) {
    const fill=colors[type];
    if(type==='actor')return `<circle cx="${x+7}" cy="${y+7}" r="7" fill="${fill}"/>`;
    if(type==='data')return `<path d="M${x+7} ${y}l8 7-8 7-8-7Z" fill="${fill}"/>`;
    if(type==='rule')return `<path d="M${x+4} ${y}h8l5 7-5 7h-8l-5-7Z" fill="${fill}"/>`;
    if(type==='ecology')return `<path d="M${x} ${y+14}Q${x-2} ${y} ${x+14} ${y}Q${x+16} ${y+14} ${x} ${y+14}" fill="${fill}"/>`;
    if(type==='resource')return [0,5,10].map(d=>`<rect x="${x}" y="${y+d}" width="15" height="3" fill="${fill}"/>`).join('');
    return `<rect x="${x}" y="${y}" width="14" height="14" rx="3" fill="${fill}"/>`;
  }
  function drawNeighborhood(n,page) {
    const max=Math.max(page.incoming.length,page.outgoing.length,2), h=Math.max(440,max*160+80), positions={};
    positions.center={x:420,y:h/2-62,id:n.id};
    page.incoming.forEach((e,i)=>positions['in_'+e.id]={x:25,y:55+i*160,id:e.source});
    page.outgoing.forEach((e,i)=>positions['out_'+e.id]={x:815,y:55+i*160,id:e.target});
    const es=[...page.incoming.map(e=>({e,from:'in_'+e.id,to:'center'})),...page.outgoing.map(e=>({e,from:'center',to:'out_'+e.id}))];
    function geometry(z) {
      const a=positions[z.from],b=positions[z.to],dx=b.x-a.x,dy=b.y-a.y;
      const sx=a.x+145,sy=a.y+62,tx=b.x+145,ty=b.y+62;
      const da=Math.min(145/(Math.abs(dx)||.001),62/(Math.abs(dy)||.001));
      const x1=sx+dx*da,y1=sy+dy*da,x2=tx-dx*da,y2=ty-dy*da;
      const mx=(x1+x2)/2;
      return `M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
    }
    function graphCard(key,p) {const nn=I.nodes[p.id];return `<g class="card" data-key="${key}" data-node="${p.id}" tabindex="0" role="button" aria-label="Open ${esc(nn.label)}" transform="translate(${p.x} ${p.y})"><rect width="290" height="124" rx="10" ${key==='center'?'style="stroke:#386b58;stroke-width:2.5;fill:#edf3e8"':''}/>${svgIcon(nn.type,16,15)}<text class="sub" x="42" y="27">${esc(titles[nn.type])}</text>${lineText(nn.label,16,57,'node-title',27,22)}<text class="hint" x="16" y="111">${key==='center'?'Selected element': 'Explore relations →'}</text></g>`;}
    $('#elementCanvas').innerHTML=`<svg class="graph element-graph" viewBox="0 0 1130 ${h}" role="group" aria-label="Immediate incoming and outgoing relations">${defs()}<text class="sub" x="25" y="26">INCOMING</text><text class="sub" x="815" y="26">OUTGOING</text><g class="links">${es.map(z=>`<g data-edge="${z.e.id}"><path class="connector ${z.e.group} ${z.e.basis==='synthesis'?'synthesis':''}" d="${geometry(z)}"/><path class="edge-hit" data-action="edge" data-id="${z.e.id}" d="${geometry(z)}"><title>${esc(z.e.label)}</title></path></g>`).join('')}</g>${Object.entries(positions).map(([key,p])=>graphCard(key,p)).join('')}</svg>`;
    const svg=$('#elementCanvas svg');let gesture=null;
    const point=ev=>{const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());};
    svg.addEventListener('pointerdown',ev=>{
      if(ev.button!==0||!ev.isPrimary)return;const card=ev.target.closest('[data-key]');if(!card)return;
      ev.preventDefault();ev.stopPropagation();const p=point(ev),key=card.dataset.key;
      gesture={key,pointerId:ev.pointerId,startX:ev.clientX,startY:ev.clientY,point:p,start:{...positions[key]},drag:false};
      svg.setPointerCapture(ev.pointerId);
    });
    svg.addEventListener('pointermove',ev=>{
      if(!gesture||gesture.pointerId!==ev.pointerId)return;
      ev.preventDefault();if(Math.hypot(ev.clientX-gesture.startX,ev.clientY-gesture.startY)>=7)gesture.drag=true;
      if(!gesture.drag)return;const p=point(ev),pos=positions[gesture.key];pos.x=gesture.start.x+p.x-gesture.point.x;pos.y=gesture.start.y+p.y-gesture.point.y;
      svg.querySelector(`[data-key="${gesture.key}"]`).setAttribute('transform',`translate(${pos.x} ${pos.y})`);
      es.forEach(z=>svg.querySelectorAll(`[data-edge="${z.e.id}"] path`).forEach(el=>el.setAttribute('d',geometry(z))));
    });
    svg.addEventListener('pointerup',ev=>{
      if(!gesture||gesture.pointerId!==ev.pointerId)return;
      ev.preventDefault();ev.stopPropagation();const g=gesture;gesture=null;
      try{svg.releasePointerCapture(ev.pointerId);}catch{}
      if(!g.drag)openElement(positions[g.key].id);
    });
    const cancel=()=>{gesture=null;};svg.addEventListener('pointercancel',cancel);svg.addEventListener('lostpointercapture',cancel);
    svg.querySelectorAll('[data-node]').forEach(el=>el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();openElement(el.dataset.node);}}));
  }
  function showEdge(id) {
    const e=I.edges[id];if(!e)return;
    $('#inspector').innerHTML=`<div class="kicker">Relation ${esc(e.id)}</div><h2 class="inspector-title">${esc(e.label)}</h2><div class="badges">${badge(e.basis,e.basis)}${badge('Confidence: '+e.confidence)}${badge(modes[e.institutionalMode]||'Not classified')}</div><p><strong>From:</strong> ${esc(I.nodes[e.source].label)}<br><strong>To:</strong> ${esc(I.nodes[e.target].label)}</p><p>${esc(e.evidence || (e.basis==='synthesis'?'An interpretive connection in the research model. Supporting sources do not by themselves establish this exact relationship in practice.':'Classified as documented in the source model. A source reference is not case-level proof that the relationship operated.'))}</p><p class="tiny">Scope: ${esc(e.scales.join(', '))}. Mode tags are editorial classifications. Observed in practice: not established.</p><div class="chip-row"><button data-action="element" data-id="${e.source}">Explore source</button><button data-action="element" data-id="${e.target}">Explore target</button></div><div class="inspector-section"><h3>Evidence</h3>${sourceHTML(e.sources)}</div><div class="inspector-section"><h3>Research note</h3>${noteHTML('edge:'+id)}</div>`;
    if(innerWidth<900)$('#inspector').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function showTransfer(id) {
    const t=M.transfers.find(t=>t.id===id);if(!t)return;
    $('#inspector').innerHTML=`<div class="kicker">System handoff</div><h2 class="inspector-title">${esc(t.label)}</h2><p>${esc(I.situations[t.source].label)} → ${esc(I.situations[t.target].label)}</p><div class="badges">${badge('Aggregation, not a new fact')}${badge(t.underlyingBases.join(' + '))}</div><p>This arrow summarises the following relations. It does not create an additional causal or legal claim.</p>${t.edgeIds.map(id=>edgeRow(I.edges[id])).join('')}<div class="inspector-section"><h3>Open either arena</h3><div class="chip-row"><button data-action="situation" data-id="${t.source}">${esc(I.situations[t.source].label)}</button><button data-action="situation" data-id="${t.target}">${esc(I.situations[t.target].label)}</button></div></div>`;
    if(innerWidth<900)$('#inspector').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function dialog(title,body) {$('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=body;if(!$('#dialog').open)$('#dialog').showModal();}
  function traceDialog(from,to) {
    routeFrom=from||state.node||'a_residents';routeTo=to||'p_maintain';
    const options=selected=>M.nodes.slice().sort((a,b)=>a.label.localeCompare(b.label)).map(n=>`<option value="${n.id}" ${selected===n.id?'selected':''}>${esc(n.label)}</option>`).join('');
    dialog('Trace an evidenced route',`<p>This is directed reachability through typed relations—not a simulation, proof of causality, or a legal conclusion.</p><div class="form-grid"><label>From<select id="routeFrom">${options(routeFrom)}</select></label><label>To<select id="routeTo">${options(routeTo)}</select></label></div><div class="controls"><label><input type="checkbox" id="routeDocumented"> Documented relations only</label><button class="primary" data-action="run-route">Trace route</button></div><div id="routeResult"></div>`);
    runRoute();
  }
  function runRoute() {
    const start=$('#routeFrom').value,end=$('#routeTo').value,only=$('#routeDocumented').checked;
    const path=TreeGov.path(M,start,end,{basis:only?'documented':'all'}),box=$('#routeResult');
    if(path===null){box.innerHTML='<div class="caution">No directed path exists in the model under this evidence filter. A missing mapped path is not proof that no real-world route exists.</div>';return;}
    const ss=path.filter(id=>I.edges[id].basis==='synthesis').length;
    box.innerHTML=`<div class="badges">${badge(path.length+' relations')}${badge(ss+' synthesis dependencies',ss?'synthesis':'documented')}</div>${ss?'<div class="caution">This route relies on interpretive links. It should be treated as a research proposition until those links are validated.</div>':''}${path.map(id=>{const e=I.edges[id];return `<div class="route-step"><button data-action="element-dialog" data-id="${e.source}">${esc(I.nodes[e.source].label)} ↗</button><p>↓ ${esc(e.label)}</p><div class="badges">${badge(e.id)}${badge(e.basis,e.basis)}</div><small>Evidence: ${e.sources.map(id=>`<a href="${safe(I.sources[id].url)}" target="_blank" rel="noopener">${id}</a>`).join(', ')}</small></div>`;}).join('')}<button data-action="element-dialog" data-id="${end}">${esc(I.nodes[end].label)} ↗</button>`;
  }
  function methodDialog() {
    dialog('How to read this model',`<h3>Three levels, one evidence graph</h3><p>The system view bundles relations between six analytical arenas. An arena organises activities and their participants, inputs, rules and resources. Element views expose the individual directional claims. A primary home is only a display convention; an element can belong to several arenas.</p><h3>Do not confuse three different things</h3><p><strong>Documented / synthesis</strong> describes evidential basis. <strong>Formal / policy / analytical / unknown</strong> describes institutional interpretation. <strong>Confidence</strong> is the inherited editorial judgement, not a probability or compliance measurement.</p><p>${esc(M.metadata.methodology.provenance)}</p><div class="caution">No actor has been given a fabricated budget, staffing figure or influence score. Unknown values remain null. Informal practices need interviews or observation before they can be encoded as facts.</div><h3>Reading a handoff</h3><p>An overview arrow references specific relation IDs. Select it to inspect those claims. Seven primary handoffs are drawn; four further selected handoffs are listed separately. The full element graph can contain other cross-arena relations.</p><h3>What is not in scope?</h3><p>Private-tree governance, complete procurement processes, case-specific legal tests and every regional interface remain incomplete. This is not legal advice or an official municipal workflow.</p><h3>Research notes & privacy</h3><p>Notes stay in this browser. Model export excludes your notes; export them separately below. The site has no analytics, no account and no LLM connection.</p><div class="chip-row"><button data-action="export-notes">Export my notes</button><button data-action="export">Export combined model</button></div><h3>Conceptual references</h3>${M.metadata.methodology.citations.map(s=>`<p><a href="${safe(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a></p>`).join('')}<p>Inspired by these frameworks; this prototype does not claim full IAD or PROV-O conformance.</p>`);
  }
  function download(value,name) { const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})); const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000); }
  function render() {
    $('#levels').innerHTML=[['system','3','System'],['situation','2','Action situations'],['element','1','Elements']].map(([v,num,title])=>`<button class="level-button ${state.view===v?'active':''}" aria-current="${state.view===v?'page':'false'}" data-action="level" data-id="${v}"><span class="number">${num}</span>${title}</button>`).join('');
    $('#breadcrumbs').innerHTML='<button data-action="level" data-id="system">Amsterdam trees</button>'+(state.arena&&state.view!=='system'?`<span>/</span><button data-action="situation" data-id="${state.arena}">${esc(I.situations[state.arena].label)}</button>`:'')+(state.node&&state.view==='element'?`<span>/</span><span>${esc(I.nodes[state.node].label)}</span>`:'');
    if(state.view==='system')systemView();else if(state.view==='situation')situationView();else elementView();
  }
  document.addEventListener('click',async ev=>{
    const el=ev.target.closest('[data-action]');if(!el)return;const id=el.dataset.id,action=el.dataset.action;
    if(el.disabled)return;
    if(action==='level'){inspection=null;go({view:id,node:null,arena:id==='situation'?(state.arena||'assessment'):null,tab:'activities',page:0});}
    if(action==='situation'){inspection=null;go({view:'situation',arena:id,node:null,tab:'activities',page:0});}
    if(action==='element')openElement(id);
    if(action==='inspect'){inspection=id;nodeInspector(id);if(innerWidth<900)$('#inspector').scrollIntoView({behavior:'smooth'});}
    if(action==='tab'){inspection=null;go({tab:id});}
    if(action==='page')go({page:Number(id)});
    if(action==='edge')showEdge(id);
    if(action==='transfer')showTransfer(id);
    if(action==='reset-layout')render();
    if(action==='trace')traceDialog();
    if(action==='trace-from')traceDialog(id);
    if(action==='question'){const q=M.questions[Number(id)];traceDialog(q.source,q.target);}
    if(action==='run-route')runRoute();
    if(action==='element-dialog'){$('#dialog').close();openElement(id);}
    if(action==='close-dialog')$('#dialog').close();
    if(action==='method')methodDialog();
    if(action==='export'){download(M,'tree-governance-model-v0.4.json');notify('Combined model exported. Your notes were not included.');}
    if(action==='export-notes')download({version:'0.4',notes},'tree-governance-private-notes.json');
    if(action==='share'){try{await navigator.clipboard.writeText(location.href);notify('Link to this view copied.');}catch{dialog('Copy this view link',`<input style="width:100%" aria-label="View link" readonly value="${esc(location.href)}">`);}}
    if(action==='handoffs')dialog('All selected system handoffs',`<p>The overview draws seven primary pathways. These ${M.transfers.length} bundles can all be traced to element-level relations; they are not an exhaustive list of inter-arena links.</p>${M.transfers.map(t=>`<button class="relation-row" data-action="transfer-dialog" data-id="${t.id}"><strong>${esc(I.situations[t.source].label)} → ${esc(I.situations[t.target].label)}</strong><span class="predicate">${esc(t.label)}</span><small>${t.edgeIds.join(', ')} · ${esc(t.underlyingBases.join(' + '))}${t.primary?' · on overview':''}</small></button>`).join('')}`);
    if(action==='transfer-dialog'){$('#dialog').close();showTransfer(id);}
  });
  document.addEventListener('keydown',ev=>{
    if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('g[data-action]')){ev.preventDefault();ev.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
    if(ev.key==='Escape')$('#searchResults').hidden=true;
  });
  document.addEventListener('change',ev=>{
    const el=ev.target;
    if(['basis','group','mode'].includes(el.id))go({[el.id]:el.value,page:0});
    if(el.id==='directoryType'){directoryType=el.value;directoryView();}
    if(el.id==='directoryArea'){directoryArea=el.value;directoryView();}
    if(el.id==='directoryScale'){directoryScale=el.value;directoryView();}
    if(el.matches('[data-flag]'))saveNote(el.dataset.flag,{flagged:el.checked});
  });
  function saveNote(id,patch) {
    notes[id]={...notes[id],...patch};
    try{localStorage.setItem('treeGovNotesV1',JSON.stringify(notes));const status=$(`[data-note="${id}"]`)?.parentNode.querySelector('.note-save');if(status)status.textContent='Saved in this browser only.';}catch{notify('Browser storage is unavailable. Export your notes before leaving.');}
  }
  document.addEventListener('input',ev=>{if(ev.target.matches('[data-note]'))saveNote(ev.target.dataset.note,{text:ev.target.value});});
  $('#search').addEventListener('input',ev=>{
    const q=ev.target.value.trim().toLowerCase(),box=$('#searchResults');if(!q){box.hidden=true;return;}
    const found=M.nodes.filter(n=>[n.label,n.summary,n.translation,n.id].join(' ').toLowerCase().includes(q)).slice(0,10);
    box.innerHTML=found.length?found.map(n=>`<button data-action="element" data-id="${n.id}">${typeLine(n)}${esc(n.label)}<small>${esc(I.situations[n.home].label)}</small></button>`).join(''):'<p class="empty">No matching elements.</p>';box.hidden=false;
  });
  document.addEventListener('click',ev=>{if(!ev.target.closest('.search-wrap')||ev.target.closest('#searchResults button'))$('#searchResults').hidden=true;});
  try {
    let architecture=window.TREE_GOV_ARCHITECTURE;
    if(!architecture){const r=await fetch('data/architecture.json?v=0.4');if(!r.ok)throw new Error('Cannot load architecture.json ('+r.status+')');architecture=await r.json();}
    M=TreeGov.build(window.TREE_GOV_MODEL,architecture);I=TreeGov.indices(M);
    const errors=TreeGov.validate(M);if(errors.length)throw new Error(errors.join('; '));
    window.TreeGovernance={model:M,queryPath:(s,t,filters)=>TreeGov.path(M,s,t,filters)};
    state=parse();render();window.addEventListener('hashchange',()=>{inspection=null;state=parse();render();});
  }catch(err){console.error(err);$('#main').innerHTML=`<h1>The model could not be loaded</h1><div class="caution">${esc(err.message)}</div><p>Serve this folder over HTTP, or open the standalone HTML export. The split-file site cannot fetch JSON when opened directly as a local file.</p><p><a href="legacy.html">Open the previous flat explorer</a></p>`;}
})();
