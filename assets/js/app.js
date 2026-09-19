const MODEL=window.TREE_GOV_MODEL;
const sourceById=Object.fromEntries(MODEL.sources.map(s=>[s.id,s]));
const nodeById=Object.fromEntries(MODEL.nodes.map(n=>[n.id,n]));
const edgeById=Object.fromEntries(MODEL.edges.map(e=>[e.id,e]));
const runtime=Object.fromEntries(MODEL.nodes.map(n=>[n.id,{x:0,y:0,vx:0,vy:0}]));
const svg=document.getElementById('graph'), viewport=document.getElementById('viewport'), edgesG=document.getElementById('edges'), labelsG=document.getElementById('edgeLabels'), nodesG=document.getElementById('nodes');
const sideBody=document.getElementById('sideBody');
const NS='http://www.w3.org/2000/svg';
const state={lens:'all',selectedNode:null,selectedEdge:null,hoverNode:null,focusIds:null,pathIds:new Set(),pathEdgeIds:new Set(),relationLabels:false,documentedOnly:false,searchHits:new Set(),tab:'guide',
notes:(()=>{try{return JSON.parse(localStorage.getItem('treeGovNotesV1')||'{}')}catch(e){return {}}})(),
view:{x:0,y:0,k:1},pendingDrag:null,drag:null,pan:null,suppressClick:false};

const colors={actor:'#78978e',process:'#c6a262',data:'#8094ad',rule:'#ae7770',ecology:'#7f9f6a'};
const edgeColors={authority:'#6e6962',information:'#6d86a5',operation:'#738d68',participation:'#b08459',resource:'#8b7898',ecology:'#75976a'};

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function safeUrl(v){try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?u.href:'#'}catch(e){return '#'}}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function randFor(s,a=0,b=1){return a+(hash(s)%100000)/100000*(b-a)}
function nodeRadius(n){return {actor:42,process:67,data:52,rule:62,ecology:54}[n.type]||45}
function lensAllows(item){return state.lens==='all'||(item.lenses||[]).includes(state.lens)}
function visibleNodes(){return MODEL.nodes.filter(n=>lensAllows(n)&&(!state.focusIds||state.focusIds.has(n.id)))}
function visibleNodeIds(){return new Set(visibleNodes().map(n=>n.id))}
function visibleEdges(){
  const ids=visibleNodeIds();
  return MODEL.edges.filter(e=>ids.has(e.source)&&ids.has(e.target)&&lensAllows(e)&&(!state.documentedOnly||e.basis==='documented'));
}

function initPositions(){
  const center={x:520,y:390};
  MODEL.nodes.forEach(n=>{
    const a=randFor(n.id+'a',0,Math.PI*2), r=randFor(n.id+'r',90,330);
    let bias={actor:[-150,-20],process:[20,30],data:[170,80],rule:[-60,-180],ecology:[120,210]}[n.type]||[0,0];
    runtime[n.id].x=center.x+Math.cos(a)*r+bias[0]; runtime[n.id].y=center.y+Math.sin(a)*r+bias[1]; runtime[n.id].vx=runtime[n.id].vy=0;
  });
}

function organicLayout(){
  const ns=visibleNodes(), es=visibleEdges(); if(!ns.length)return;
  if(!ns.some(n=>Number.isFinite(runtime[n.id].x)&&Math.abs(runtime[n.id].x)>1)) initPositions();
  const c={x:520,y:390}, steps=520;
  for(let iter=0;iter<steps;iter++){
    const temp=1-iter/steps;
    for(const n of ns){runtime[n.id].vx*=.72;runtime[n.id].vy*=.72}
    for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++){
      const a=runtime[ns[i].id],b=runtime[ns[j].id]; let dx=b.x-a.x,dy=b.y-a.y; let d2=dx*dx+dy*dy+1, d=Math.sqrt(d2);
      const min=nodeRadius(ns[i])+nodeRadius(ns[j])+28;
      let f=26000/d2;
      if(d<min)f+=(min-d)*.065;
      const fx=f*dx/d,fy=f*dy/d; a.vx-=fx;a.vy-=fy;b.vx+=fx;b.vy+=fy;
    }
    for(const e of es){
      const a=runtime[e.source],b=runtime[e.target];let dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)+.001;
      const desired=e.group==='information'?145:e.group==='authority'?165:155;
      const f=(d-desired)*.0105; const fx=f*dx/d,fy=f*dy/d;a.vx+=fx;a.vy+=fy;b.vx-=fx;b.vy-=fy;
    }
    for(const n of ns){
      const p=runtime[n.id]; p.vx+=(c.x-p.x)*.0018; p.vy+=(c.y-p.y)*.0018;
      const cap=9*temp+1.5; const mag=Math.sqrt(p.vx*p.vx+p.vy*p.vy)||1;if(mag>cap){p.vx=p.vx/mag*cap;p.vy=p.vy/mag*cap}
      p.x+=p.vx;p.y+=p.vy;
    }
  }
  collisionRelax(ns,50);
  recenter(ns,520,390);
}

function collisionRelax(ns,rounds=35){
  for(let k=0;k<rounds;k++)for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++){
    const a=runtime[ns[i].id],b=runtime[ns[j].id];let dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1;
    const min=nodeRadius(ns[i])+nodeRadius(ns[j])+18;
    if(d<min){const push=(min-d)/2,ux=dx/d,uy=dy/d;a.x-=ux*push;a.y-=uy*push;b.x+=ux*push;b.y+=uy*push}
  }
}
function recenter(ns,cx,cy){let sx=0,sy=0;ns.forEach(n=>{sx+=runtime[n.id].x;sy+=runtime[n.id].y});sx/=ns.length;sy/=ns.length;ns.forEach(n=>{runtime[n.id].x+=cx-sx;runtime[n.id].y+=cy-sy})}

function flowLayout(){
  const ns=visibleNodes(); if(!ns.length)return;
  const rank={r_vision:0,r_biodiv:0,r_bomenverord:0,a_college:0,a_vor:1,a_stadswerken:1,a_teambomen:1,a_ecologists:1,a_districts:1,a_projects:1,a_contractors:1,a_residents:1,a_nurseries:1,
  p_strategy:2,r_puccini:2,p_project:2,p_site:3,p_bea:3,p_plant:4,p_establish:5,p_inspect:6,p_report:6,p_biodivmonitor:6,d_report:6,d_bea:4,d_inspection:7,d_treeasset:7,p_assess:8,
  p_decide:9,d_task:9,p_maintain:10,p_permit:10,d_permit:11,p_intervene:12,p_replant:13,d_account:13,e_trees:14,e_outcomes:15};
  const groups={};ns.forEach(n=>{const r=rank[n.id]??7;(groups[r]??=[]).push(n)});
  const rs=Object.keys(groups).map(Number).sort((a,b)=>a-b); const xGap=155, yGap=105;
  rs.forEach((r,ri)=>{const arr=groups[r].sort((a,b)=>a.type.localeCompare(b.type)||a.label.localeCompare(b.label));const startY=390-(arr.length-1)*yGap/2;arr.forEach((n,i)=>{runtime[n.id].x=95+ri*xGap;runtime[n.id].y=startY+i*yGap})});
  collisionRelax(ns,20);
}
function concentricLayout(){
  const ns=visibleNodes();const by={rule:[],actor:[],process:[],data:[],ecology:[]};ns.forEach(n=>(by[n.type]??by.process).push(n));
  const spec=[['ecology',100],['data',220],['process',355],['actor',490],['rule',610]],cx=520,cy=390;
  spec.forEach(([type,r])=>{const arr=by[type];arr.forEach((n,i)=>{const a=-Math.PI/2+i*Math.PI*2/Math.max(1,arr.length);runtime[n.id].x=cx+Math.cos(a)*r;runtime[n.id].y=cy+Math.sin(a)*r})})
}
function runLayout(fitAfter=true){const mode=document.getElementById('layout').value;if(mode==='flow')flowLayout();else if(mode==='concentric')concentricLayout();else organicLayout();render();if(fitAfter)fitVisible()}

function shapeElement(n){
  const p=runtime[n.id],g=document.createElementNS(NS,'g');g.setAttribute('class','node');g.dataset.id=n.id;g.setAttribute('transform',`translate(${p.x} ${p.y})`);
  let s;
  if(n.type==='actor'||n.type==='ecology'){s=document.createElementNS(NS,'circle');s.setAttribute('r',n.type==='ecology'?46:36)}
  else if(n.type==='process'){s=document.createElementNS(NS,'rect');s.setAttribute('x','-60');s.setAttribute('y','-29');s.setAttribute('width','120');s.setAttribute('height','58');s.setAttribute('rx','14')}
  else if(n.type==='data'){s=document.createElementNS(NS,'polygon');s.setAttribute('points','0,-38 50,0 0,38 -50,0')}
  else{s=document.createElementNS(NS,'polygon');s.setAttribute('points','-48,-31 48,-31 61,0 48,31 -48,31 -61,0')}
  s.setAttribute('class','shape');s.setAttribute('fill',colors[n.type]||'#999');g.appendChild(s);
  const title=document.createElementNS(NS,'title'); title.textContent=[n.label,n.translation?('English: '+n.translation):'',n.summary||''].filter(Boolean).join(' — '); g.appendChild(title);
  const text=document.createElementNS(NS,'text');const lines=wrapLabel(n.label,n.type==='process'?17:n.type==='rule'?15:14);const lineH=12;
  lines.forEach((line,i)=>{const t=document.createElementNS(NS,'tspan');t.setAttribute('x','0');t.setAttribute('dy',i===0?String(-(lines.length-1)*lineH/2):String(lineH));t.textContent=line;text.appendChild(t)});g.appendChild(text);
  g.classList.add('drag-ready');
  g.addEventListener('pointerdown',ev=>beginNodeDrag(ev,n.id));
  g.addEventListener('click',ev=>ev.preventDefault());
  g.addEventListener('mouseenter',()=>{state.hoverNode=n.id;updateClasses()});g.addEventListener('mouseleave',()=>{state.hoverNode=null;updateClasses()});
  return g;
}
function wrapLabel(text,max){const words=text.split(/\s+/);const lines=[];let line='';for(const w of words){if(!line)line=w;else if((line+' '+w).length<=max)line+=' '+w;else{lines.push(line);line=w}}if(line)lines.push(line);return lines.slice(0,4)}

function edgeGeometry(e){
  const s=nodeById[e.source],t=nodeById[e.target],a=runtime[e.source],b=runtime[e.target];let dx=b.x-a.x,dy=b.y-a.y,d=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/d,uy=dy/d;
  const sr=nodeRadius(s),tr=nodeRadius(t);const x1=a.x+ux*sr,y1=a.y+uy*sr,x2=b.x-ux*tr,y2=b.y-uy*tr;
  const mx=(x1+x2)/2,my=(y1+y2)/2,px=-uy,py=ux;const curve=((hash(e.id)%7)-3)*5.5;
  const cx=mx+px*curve,cy=my+py*curve;
  return{x1,y1,x2,y2,cx,cy,mx:.25*x1+.5*cx+.25*x2,my:.25*y1+.5*cy+.25*y2,path:`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`};
}
function render(){
  edgesG.replaceChildren();labelsG.replaceChildren();nodesG.replaceChildren();
  const es=visibleEdges(),ns=visibleNodes();
  for(const e of es){
    const geo=edgeGeometry(e);const path=document.createElementNS(NS,'path');path.setAttribute('d',geo.path);path.setAttribute('class',`edge ${e.group}`);path.dataset.id=e.id;path.setAttribute('stroke',edgeColors[e.group]||'#888');path.setAttribute('marker-end',`url(#arr-${e.group in edgeColors?e.group:'authority'})`);
    edgesG.appendChild(path);
    const hit=document.createElementNS(NS,'path');hit.setAttribute('d',geo.path);hit.setAttribute('class','edge-hit');hit.dataset.id=e.id;hit.addEventListener('click',ev=>{ev.stopPropagation();selectEdge(e.id)});edgesG.appendChild(hit);
    if(state.relationLabels||state.selectedEdge===e.id||state.pathEdgeIds.has(e.id)||isContextEdge(e)) labelsG.appendChild(edgeLabelElement(e,geo));
  }
  for(const n of ns)nodesG.appendChild(shapeElement(n));
  updateClasses();applyView();updateStats();
}
function edgeLabelElement(e,g){
  const group=document.createElementNS(NS,'g');group.setAttribute('class','edge-label');const w=Math.min(150,e.label.length*5.2+12),h=18;
  const r=document.createElementNS(NS,'rect');r.setAttribute('x',g.mx-w/2);r.setAttribute('y',g.my-h/2);r.setAttribute('width',w);r.setAttribute('height',h);
  const t=document.createElementNS(NS,'text');t.setAttribute('x',g.mx);t.setAttribute('y',g.my+.5);t.textContent=e.label;group.append(r,t);return group;
}
function neighborIds(id,depth=1){let seen=new Set([id]),front=new Set([id]);for(let d=0;d<depth;d++){const next=new Set();visibleEdges().forEach(e=>{if(front.has(e.source)&&!seen.has(e.target))next.add(e.target);if(front.has(e.target)&&!seen.has(e.source))next.add(e.source)});next.forEach(x=>seen.add(x));front=next}return seen}
function isContextEdge(e){const id=state.selectedNode||state.hoverNode;if(!id)return false;return e.source===id||e.target===id}
function updateClasses(){
  const contextId=state.selectedNode||state.hoverNode, context=contextId?neighborIds(contextId,1):null;
  nodesG.querySelectorAll('.node').forEach(g=>{const id=g.dataset.id;g.classList.toggle('selected',id===state.selectedNode);g.classList.toggle('path',state.pathIds.has(id));g.classList.toggle('searchhit',state.searchHits.has(id));g.classList.toggle('context',!!context&&context.has(id));g.classList.toggle('dim',!!context&&!context.has(id)&&!state.pathIds.size||state.pathIds.size&&!state.pathIds.has(id))});
  edgesG.querySelectorAll('.edge').forEach(p=>{const e=edgeById[p.dataset.id];const ctx=!!context&&(context.has(e.source)&&context.has(e.target)&&(e.source===contextId||e.target===contextId));p.classList.toggle('context',ctx);p.classList.toggle('path',state.pathEdgeIds.has(e.id));p.classList.toggle('dim',(!!context&&!ctx)||state.pathEdgeIds.size&&!state.pathEdgeIds.has(e.id));p.setAttribute('marker-end',(ctx||state.pathEdgeIds.has(e.id))?'url(#arr-context)':`url(#arr-${e.group in edgeColors?e.group:'authority'})`)})
}
function updateStats(){document.getElementById('stats').textContent=`${visibleNodes().length} elements · ${visibleEdges().length} visible relations · lens: ${state.lens==='all'?'whole system':state.lens}`}

function applyView(){viewport.setAttribute('transform',`translate(${state.view.x} ${state.view.y}) scale(${state.view.k})`)}
function graphPoint(clientX,clientY){const r=svg.getBoundingClientRect();return{x:(clientX-r.left-state.view.x)/state.view.k,y:(clientY-r.top-state.view.y)/state.view.k}}
function boundsFor(ids=null){const ns=visibleNodes().filter(n=>!ids||ids.has(n.id));if(!ns.length)return null;let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const n of ns){const p=runtime[n.id],r=nodeRadius(n);minX=Math.min(minX,p.x-r);maxX=Math.max(maxX,p.x+r);minY=Math.min(minY,p.y-r);maxY=Math.max(maxY,p.y+r)}return{minX,minY,maxX,maxY}}
function fitVisible(ids=null){const b=boundsFor(ids);if(!b)return;const r=svg.getBoundingClientRect(),pad=55,w=Math.max(10,b.maxX-b.minX),h=Math.max(10,b.maxY-b.minY);const k=Math.max(.12,Math.min(1.35,(r.width-pad*2)/w,(r.height-pad*2)/h));state.view.k=k;state.view.x=r.width/2-(b.minX+b.maxX)/2*k;state.view.y=r.height/2-(b.minY+b.maxY)/2*k;applyView()}
svg.addEventListener('wheel',ev=>{ev.preventDefault();const r=svg.getBoundingClientRect(),sx=ev.clientX-r.left,sy=ev.clientY-r.top,gx=(sx-state.view.x)/state.view.k,gy=(sy-state.view.y)/state.view.k;const factor=ev.deltaY<0?1.12:.89,newK=Math.max(.12,Math.min(3,state.view.k*factor));state.view.x=sx-gx*newK;state.view.y=sy-gy*newK;state.view.k=newK;applyView()},{passive:false});
svg.addEventListener('pointerdown',ev=>{
  if(ev.target!==svg)return;
  ev.preventDefault();
  state.pan={x:ev.clientX,y:ev.clientY,vx:state.view.x,vy:state.view.y,pointerId:ev.pointerId};
  svg.setPointerCapture(ev.pointerId);svg.classList.add('panning')
});
svg.addEventListener('pointermove',ev=>{
  if(state.pendingDrag&&!state.drag){
    const dx=ev.clientX-state.pendingDrag.startClientX,dy=ev.clientY-state.pendingDrag.startClientY;
    if(Math.hypot(dx,dy)>=7){
      state.drag={...state.pendingDrag};
      state.pendingDrag=null;
      state.suppressClick=true;
      svg.classList.add('panning');
    }
  }
  if(state.drag){
    ev.preventDefault();
    const pt=graphPoint(ev.clientX,ev.clientY),p=runtime[state.drag.id];
    p.x=state.drag.startNodeX+(pt.x-state.drag.startGraphX);
    p.y=state.drag.startNodeY+(pt.y-state.drag.startGraphY);
    render();
    return;
  }
  if(state.pan){
    ev.preventDefault();
    state.view.x=state.pan.vx+(ev.clientX-state.pan.x);state.view.y=state.pan.vy+(ev.clientY-state.pan.y);applyView()
  }
});
svg.addEventListener('pointerup',ev=>{
  const clickNodeId=state.pendingDrag && !state.drag ? state.pendingDrag.id : null;
  const didDrag=!!state.drag;
  if(state.drag||state.pendingDrag||state.pan){try{svg.releasePointerCapture(ev.pointerId)}catch(e){}}
  state.pendingDrag=null;state.drag=null;state.pan=null;svg.classList.remove('panning');
  if(didDrag){
    state.suppressClick=true;
    setTimeout(()=>state.suppressClick=false,90);
  }else{
    state.suppressClick=false;
    if(clickNodeId){ev.preventDefault();selectNode(clickNodeId)}
  }
});
svg.addEventListener('pointercancel',ev=>{
  state.pendingDrag=null;state.drag=null;state.pan=null;state.suppressClick=false;svg.classList.remove('panning');
  try{svg.releasePointerCapture(ev.pointerId)}catch(e){}
});
svg.addEventListener('click',ev=>{
  // Node selection is handled explicitly on pointerup so pointer capture cannot swallow it.
  if(ev.target===svg&&!state.suppressClick)clearHighlight()
});
function beginNodeDrag(ev,id){
  if(ev.button!==undefined && ev.button!==0)return;
  ev.preventDefault();
  ev.stopPropagation();
  const pt=graphPoint(ev.clientX,ev.clientY),p=runtime[id];
  state.pendingDrag={id,startClientX:ev.clientX,startClientY:ev.clientY,startGraphX:pt.x,startGraphY:pt.y,startNodeX:p.x,startNodeY:p.y,pointerId:ev.pointerId};
  state.drag=null;state.suppressClick=false;
  svg.setPointerCapture(ev.pointerId);
}

function selectNode(id){state.selectedNode=id;state.selectedEdge=null;state.tab='details';syncTabs();render();showNode(id)}
function selectEdge(id){state.selectedEdge=id;state.selectedNode=null;state.tab='details';syncTabs();render();showEdge(id)}
function clearHighlight(){state.selectedNode=null;state.selectedEdge=null;state.hoverNode=null;state.focusIds=null;state.pathIds.clear();state.pathEdgeIds.clear();state.searchHits.clear();render();if(state.tab==='details')showGuide()}
function focusOn(id,depth){state.focusIds=neighborIds(id,depth);render();fitVisible(state.focusIds)}
function syncTabs(){document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab))}

function showNode(id){
 const n=nodeById[id],srcs=(n.sources||[]).map(x=>sourceById[x]).filter(Boolean),incoming=MODEL.edges.filter(e=>e.target===id).map(e=>({e,other:nodeById[e.source],dir:'from'})),outgoing=MODEL.edges.filter(e=>e.source===id).map(e=>({e,other:nodeById[e.target],dir:'to'})),note=state.notes[id]||{};
 sideBody.innerHTML=`<div class="kicker">${esc(n.type)} · ${esc(n.group||'')}</div><h2>${esc(n.label)}</h2><div><span class="pill">confidence: ${esc(n.confidence)}</span><span class="pill">${n.sources.length} source${n.sources.length===1?'':'s'}</span></div><p>${esc(n.summary)}</p>
 ${n.translation?`<p><strong>English gloss:</strong> ${esc(n.translation)}</p>`:""} 
 <h3>Why this exists in the model</h3><p>${esc(n.why)}</p><div class="panel-actions"><button type="button" id="focus1">Focus 1 hop</button><button type="button" id="focus2">Focus 2 hops</button><button type="button" id="pathFrom">Use as path start</button></div>
 <h3>Relations</h3><div class="conn-list">${[...incoming,...outgoing].map(x=>`<button type="button" class="conn" data-node="${x.other.id}"><strong>${x.dir==='from'?'←':'→'} ${esc(x.other.label)}</strong><small>${esc(x.e.label)} · ${esc(x.e.group)} · ${esc(x.e.basis)}</small></button>`).join('')||'<div class="empty">No mapped relations.</div>'}</div>
 <h3>Sources</h3><div class="source-list">${srcs.map(s=>`<div class="source-card"><a href="${safeUrl(s.url)}" target="_blank" rel="noopener">${esc(s.id)} · ${esc(s.title)}</a><p>${esc(s.note)}</p></div>`).join('')}</div>
 <h3>Research note</h3><textarea id="nodeNote" placeholder="Add your own note. Saved only in this browser.">${esc(note.text||'')}</textarea><div class="checkline"><input id="flagNode" type="checkbox" ${note.flagged?'checked':''}/><label for="flagNode">flag for follow-up</label></div>`;
 document.getElementById('focus1').onclick=()=>focusOn(id,1);document.getElementById('focus2').onclick=()=>focusOn(id,2);document.getElementById('pathFrom').onclick=()=>{switchTab('path');document.getElementById('pathSource').value=id};
 sideBody.querySelectorAll('.conn').forEach(b=>b.onclick=()=>{state.focusIds=null;selectNode(b.dataset.node);fitVisible(new Set([b.dataset.node]))});
 const ta=document.getElementById('nodeNote'),fl=document.getElementById('flagNode'),save=()=>{state.notes[id]={text:ta.value,flagged:fl.checked};localStorage.setItem('treeGovNotesV1',JSON.stringify(state.notes))};ta.oninput=save;fl.onchange=save;
}
function showEdge(id){const e=edgeById[id],s=nodeById[e.source],t=nodeById[e.target];sideBody.innerHTML=`<div class="kicker">Relation · ${esc(e.group)}</div><h2>${esc(s.label)} → ${esc(t.label)}</h2><p><strong>${esc(e.label)}</strong></p><div><span class="pill">${esc(e.basis)}</span><span class="pill">confidence: ${esc(e.confidence)}</span></div>
<p>${e.basis==='synthesis'?'This is an interpretive connection assembled from the cited sources rather than a direct statement that these exact model elements are linked.':'This relation is directly supported by the cited source material at the level represented here.'}</p>
<h3>Endpoints</h3><div class="conn-list"><button class="conn" data-node="${s.id}"><strong>From: ${esc(s.label)}</strong><small>${esc(s.type)}</small></button><button class="conn" data-node="${t.id}"><strong>To: ${esc(t.label)}</strong><small>${esc(t.type)}</small></button></div>
<h3>Sources</h3><div class="source-list">${(e.sources||[]).map(x=>sourceById[x]).filter(Boolean).map(src=>`<div class="source-card"><a href="${safeUrl(src.url)}" target="_blank" rel="noopener">${esc(src.id)} · ${esc(src.title)}</a><p>${esc(src.note)}</p></div>`).join('')}</div>`;sideBody.querySelectorAll('.conn').forEach(b=>b.onclick=()=>selectNode(b.dataset.node))}
function showGuide(){sideBody.innerHTML=`<div class="kicker">How to use this prototype</div><h2>Explore processes, not just organizations</h2><p>The map separates <strong>actors</strong>, <strong>processes</strong>, <strong>data/objects</strong>, <strong>rules</strong> and <strong>ecological outcomes</strong>. The point is to expose mechanisms that a stakeholder-only map tends to hide.</p>
<div class="note"><strong>Scope:</strong> municipal management of public trees. Private-tree governance, utilities, provincial/water-board roles and many procurement details are intentionally incomplete.</div>
<h3>Exploration moves</h3><p><strong>Click a node</strong> for its role, evidence and direct relations. The details panel opens with a short summary; many Dutch labels also show an English gloss. Drag nodes to rearrange them. Pan the canvas by dragging empty space and use the mouse wheel to zoom.</p><p><strong>Lenses</strong> show the same system through lifecycle, information, participation, permits, projects or biodiversity. <strong>Focus 1/2 hops</strong> reduces a local neighborhood. Click an edge to inspect whether it is directly documented or a research synthesis.</p>
<p>The <strong>Path finder</strong> answers structural questions such as “How can a resident observation reach maintenance?” It finds a mapped route; it does not claim causality.</p>
<h3>Data model</h3><code class="schema">Node { id, type, group, summary, sources[], confidence }\nRelation { source, target, label, group, basis, sources[], confidence }</code><p>The visualization is only one view over a typed, provenance-aware property graph. That structure is deliberately suitable for later LLM or rule-based inference.</p>
<h3>Model boundary</h3><p>This is an interpretive research synthesis, not an official City of Amsterdam organization chart. “Synthesis” edges make that distinction explicit.</p>`}
function showSources(){state.tab='details';syncTabs();sideBody.innerHTML=`<div class="kicker">Evidence base</div><h2>Sources used in v0.3</h2><p>Primary emphasis is on current City of Amsterdam pages, municipal regulations and recent Amsterdam administrative/research material.</p><div class="source-list">${MODEL.sources.map(s=>`<div class="source-card"><a href="${safeUrl(s.url)}" target="_blank" rel="noopener">${esc(s.id)} · ${esc(s.title)}</a><p>${esc(s.note)}</p></div>`).join('')}</div>`}
function showPath(){
 const vn=visibleNodes().slice().sort((a,b)=>a.label.localeCompare(b.label)),opts=vn.map(n=>`<option value="${n.id}">${esc(n.label)}</option>`).join('');
 sideBody.innerHTML=`<div class="kicker">Path explorer</div><h2>Trace a route through the system</h2><p>Find the shortest mapped path between two visible elements. This is structural, not causal proof.</p><div class="pathbox"><select id="pathSource">${opts}</select><select id="pathTarget">${opts}</select><button type="button" class="primary" id="tracePath">Trace</button></div><div id="pathResult" class="empty">Choose two elements.</div>
 <h3>Example questions</h3><div class="conn-list"><button class="conn ex" data-s="a_residents" data-t="p_maintain"><strong>Resident → maintenance</strong><small>How can a public observation enter operations?</small></button><button class="conn ex" data-s="r_biodiv" data-t="p_plant"><strong>Biodiversity policy → planting</strong><small>How can policy reach a physical tree?</small></button><button class="conn ex" data-s="a_projects" data-t="p_intervene"><strong>Project team → major intervention</strong><small>What is the project/removal route?</small></button></div>`;
 const s=document.getElementById('pathSource'),t=document.getElementById('pathTarget');if(state.selectedNode&&vn.some(n=>n.id===state.selectedNode))s.value=state.selectedNode;if(t.options.length>1)t.selectedIndex=1;
 document.getElementById('tracePath').onclick=()=>tracePath(s.value,t.value);sideBody.querySelectorAll('.ex').forEach(b=>b.onclick=()=>{if(vn.some(n=>n.id===b.dataset.s)&&vn.some(n=>n.id===b.dataset.t)){s.value=b.dataset.s;t.value=b.dataset.t;tracePath(s.value,t.value)}else document.getElementById('pathResult').textContent='Switch to Whole system to run this example.'})
}
function tracePath(s,t){
 const ids=visibleNodeIds(),es=visibleEdges(),adj=Object.fromEntries([...ids].map(id=>[id,[]]));es.forEach(e=>{adj[e.source].push([e.target,e.id]);adj[e.target].push([e.source,e.id])});
 const q=[s],prev={[s]:null},prevE={};for(let i=0;i<q.length;i++){const cur=q[i];if(cur===t)break;for(const [nx,eid] of adj[cur]||[])if(!(nx in prev)){prev[nx]=cur;prevE[nx]=eid;q.push(nx)}}
 const box=document.getElementById('pathResult');state.pathIds.clear();state.pathEdgeIds.clear();if(!(t in prev)){box.textContent='No mapped path is visible under the current lens / evidence filters.';render();return}
 const path=[];let cur=t;while(cur!==null){path.push(cur);state.pathIds.add(cur);if(cur!==s)state.pathEdgeIds.add(prevE[cur]);cur=prev[cur]}path.reverse();box.innerHTML=`<p><strong>${path.length-1} relation${path.length===2?'':'s'}</strong></p><p>${path.map(id=>esc(nodeById[id].label)).join(' → ')}</p>`;render();fitVisible(state.pathIds)
}
function switchTab(tab){state.tab=tab;syncTabs();if(tab==='guide')showGuide();else if(tab==='path')showPath();else if(state.selectedNode)showNode(state.selectedNode);else if(state.selectedEdge)showEdge(state.selectedEdge);else showGuide()}

document.getElementById('lens').onchange=e=>{state.lens=e.target.value;state.focusIds=null;state.pathIds.clear();state.pathEdgeIds.clear();runLayout()};
document.getElementById('layout').onchange=()=>runLayout();document.getElementById('fit').onclick=()=>fitVisible();document.getElementById('reflow').onclick=()=>{initPositions();runLayout()};
document.getElementById('reset').onclick=()=>{state.lens='all';state.focusIds=null;state.selectedNode=null;state.selectedEdge=null;state.pathIds.clear();state.pathEdgeIds.clear();state.documentedOnly=false;state.searchHits.clear();document.getElementById('lens').value='all';document.getElementById('documentedOnly').checked=false;document.getElementById('search').value='';initPositions();runLayout();state.tab='guide';syncTabs();showGuide()};
document.getElementById('labels').onchange=e=>{state.relationLabels=e.target.checked;render()};document.getElementById('documentedOnly').onchange=e=>{state.documentedOnly=e.target.checked;runLayout()};
document.getElementById('clearHighlight').onclick=clearHighlight;document.getElementById('sourcesBtn').onclick=showSources;document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
document.getElementById('search').oninput=e=>{const q=e.target.value.trim().toLowerCase();state.searchHits.clear();if(q)visibleNodes().forEach(n=>{if(n.label.toLowerCase().includes(q)||(n.summary||'').toLowerCase().includes(q)||(n.group||'').toLowerCase().includes(q))state.searchHits.add(n.id)});render();if(state.searchHits.size)fitVisible(state.searchHits)};
document.getElementById('exportBtn').onclick=()=>{const out=JSON.parse(JSON.stringify(MODEL));out.annotations=state.notes;const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='amsterdam-tree-governance-model-v0.3.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)};
new ResizeObserver(()=>applyView()).observe(svg);
initPositions();organicLayout();render();requestAnimationFrame(()=>fitVisible());showGuide();
