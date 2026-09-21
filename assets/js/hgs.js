'use strict';
(() => {
const MODEL=window.HGS_NETWORK_DATA;
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const NS='http://www.w3.org/2000/svg';
const byId=Object.fromEntries(MODEL.nodes.map(n=>[n.id,n]));
const byEdge=Object.fromEntries(MODEL.edges.map(e=>[e.id,e]));
const sources=Object.fromEntries(MODEL.sources.map(s=>[s.id,s]));
const palette={original:{stroke:'#aa8046',fill:'#eee2cf'},revision:{stroke:'#668da7',fill:'#dfebf1'},both:{stroke:'#668f7e',fill:'#e0eade'}};
const edgeColor={authority:'#718571',drafting:'#4e7963',advice:'#718e9f',participation:'#ad8b5e',coordination:'#849783',evaluation:'#9a88a2',affiliation:'#9ba392',continuity:'#88947e'};
const catLabel={authority:'Decision / authority',drafting:'Drafting / authorship',advice:'Advice / knowledge',participation:'Participation',coordination:'Coordination',evaluation:'Monitoring / evaluation',affiliation:'Affiliation',continuity:'Policy continuity'};
const state={phase:'both',scope:'core',lens:'all',people:false,planned:true,labels:'selected',selected:null,selectedEdge:null,hover:null,hoverEdge:null,tab:'inspect',focus:null,path:null,view:{x:0,y:0,k:1},positions:{},cache:{},renderedNodes:[],renderedEdges:[],paths:{},nodeEls:{},edgeEls:{},contextEdges:new Set(),notes:{},searchIndex:-1,searchHits:[],layoutEpoch:0};
try{state.notes=JSON.parse(localStorage.getItem('amsterdamHGS.notes.v1')||'{}')}catch(_e){}
const svg=$('#graph'), viewport=$('#viewport'), stage=$('#stage');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phaseName=p=>p==='original'?'Original proposal':p==='revision'?'Revision pathway':'Both processes';
const kindName=k=>({actor:'Organisation / group',person:'Named person',policy:'Policy framework',process:'Process',output:'Policy input / output'}[k]||k);
const phaseAllows=(x,p=state.phase)=>p==='both'||x.phase==='both'||x.phase===p;
const skey=()=>[state.phase,state.scope,state.people,state.focus?.id||'',state.focus?.hops||'',state.lens].join('|');
const hash=s=>{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(h,31)+s.charCodeAt(i))|0;return h>>>0};
function el(name,attrs={},parent){const x=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))x.setAttribute(k,String(v));if(parent)parent.appendChild(x);return x}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,3500)}
function announce(t){$('#live').textContent=t}
function phaseTag(n){return `<span class="tag ${n.phase}">${phaseName(n.phase)}</span>`}
function sourceLinks(ids){return `<div class="sources-inline">${[...new Set(ids)].map(id=>{const s=sources[id];return `<div class="source-card"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">[${id}] ${esc(s.title)} &#8599;</a><small>${esc(s.date)} &middot; ${esc(s.locator)}</small></div>`}).join('')}</div>`}
function baseEdges(){return MODEL.edges.filter(e=>phaseAllows(e)&&(state.planned||e.status!=='planned')&&(state.people||!(byId[e.source].kind==='person'||byId[e.target].kind==='person')))}
function neighbours(id,edges){const result=[];for(const e of edges){if(e.source===id)result.push([e.target,e]);else if(e.target===id)result.push([e.source,e])}return result}
function reach(id,hops,edges){let visited=new Set([id]),front=[id];for(let i=0;i<hops;i++){const next=[];for(const x of front)for(const [y] of neighbours(x,edges))if(!visited.has(y)){visited.add(y);next.push(y)}front=next}return visited}
function shortest(a,b,edges,directed=false){const q=[a],prev=new Map([[a,null]]);for(let qi=0;qi<q.length;qi++){const x=q[qi];if(x===b)break;for(const e of edges){let y=null;if(e.source===x)y=e.target;else if(!directed&&e.target===x)y=e.source;if(y&&!prev.has(y)){prev.set(y,[x,e.id]);q.push(y)}}}if(!prev.has(b))return null;const ns=[b],es=[];let x=b;while(x!==a){const [p,e]=prev.get(x);es.unshift(e);ns.unshift(p);x=p}return{nodes:ns,edges:es,directed}}
function filteredGraph(){
 let edges=baseEdges(),ns;
 state.contextEdges=new Set();
 if(state.path){const keep=new Set(state.path.edges);edges=edges.filter(e=>keep.has(e.id));ns=new Set(state.path.nodes)}
 else if(state.focus){ns=reach(state.focus.id,state.focus.hops,edges);edges=edges.filter(e=>ns.has(e.source)&&ns.has(e.target))}
 else if(state.lens!=='all'){
   const matches=edges.filter(e=>e.category===state.lens),keep=new Set(matches.map(e=>e.id));
   const endpoints=new Set(matches.flatMap(e=>[e.source,e.target]));
   const roots=['oldplan','newplan'].filter(x=>phaseAllows(byId[x]));
   for(const id of endpoints){let best=null;for(const root of roots){const r=shortest(id,root,edges);if(r&&(!best||r.edges.length<best.edges.length))best=r}if(best)for(const eid of best.edges)keep.add(eid)}
   if(roots.length===2){const r=shortest(roots[0],roots[1],edges);if(r)for(const eid of r.edges)keep.add(eid)}
   edges=edges.filter(e=>keep.has(e.id));for(const e of edges)if(e.category!==state.lens)state.contextEdges.add(e.id);
   ns=new Set(edges.flatMap(e=>[e.source,e.target]));
 }else{
   ns=new Set(MODEL.nodes.filter(n=>phaseAllows(n)&&(state.scope==='all'||n.core||(state.people&&n.kind==='person'))&&(state.people||n.kind!=='person')).map(n=>n.id));
   if(state.people){for(const id of [...ns]){let n=byId[id];while(n.parent&&phaseAllows(byId[n.parent])){ns.add(n.parent);n=byId[n.parent]}}}
   edges=edges.filter(e=>ns.has(e.source)&&ns.has(e.target));
 }
 const connected=new Set(edges.flatMap(e=>[e.source,e.target]));
 const nodes=MODEL.nodes.filter(n=>ns.has(n.id)&&connected.has(n.id));
 return{nodes,edges};
}
function wrap(s,max=23){if(s.includes('\n'))return s.split('\n');let lines=[],line='';for(const w of s.split(' ')){if((line+' '+w).trim().length>max&&line){lines.push(line);line=w}else line=(line+' '+w).trim()}if(line)lines.push(line);return lines}
function dims(n){const lines=wrap(n.label,n.kind==='person'?24:23);const titleLines=Math.min(lines.length,3);if(n.kind==='policy')return{w:178,h:95,top:-46,bottom:49};if(n.kind==='output')return{w:176,h:121,top:-37,bottom:84};if(n.kind==='process')return{w:178,h:110,top:-32,bottom:78};return{w:n.kind==='person'?181:176,h:91+20*(titleLines-1),top:-38,bottom:53+20*(titleLines-1)+20}}
function rect(n,pad=0){const p=state.positions[n.id],d=dims(n);return{x:p.x-d.w/2-pad,y:p.y+d.top-pad,w:d.w+2*pad,h:d.bottom-d.top+2*pad,id:n.id}}
function overlaps(a,b,pad=0){return a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y}
function anchors(){
 for(const n of MODEL.nodes){if(n.anchor){state.positions[n.id]={x:n.anchor[0],y:n.anchor[1]*.80}}}
 // Place the referendum on the lower-left branch, not on an extra row.
 state.positions.referendum={x:40,y:397};
 const counts={};
 for(const n of MODEL.nodes){if(n.anchor)continue;let par=n.parent&&state.positions[n.parent]?state.positions[n.parent]:{x:n.phase==='original'?220:n.phase==='revision'?1060:640,y:340};const k=counts[n.parent||n.phase]||0;counts[n.parent||n.phase]=k+1;const a=(k*2.39996+(hash(n.id)%50)/40);const r=175+Math.sqrt(k)*88;state.positions[n.id]={x:par.x+Math.cos(a)*r,y:par.y+Math.sin(a)*r}}
}
anchors();
function arrange(nodes,edges,force=false){
 if(!nodes.length)return;
 if(!force&&state.cache[skey()]){for(const n of nodes){const q=state.cache[skey()][n.id];if(q)state.positions[n.id]={...q}}return}
 if(state.scope==='core'&&!state.focus&&!state.path&&state.lens==='all'&&!state.people){anchors();return}
 const poses={};
 if(state.focus||state.path){
  const focal=state.focus?.id||state.path.nodes[Math.floor(state.path.nodes.length/2)],rest=nodes.filter(n=>n.id!==focal);
  state.positions[focal]={x:630,y:380};const d1=reach(focal,1,edges);
  const rings=[rest.filter(n=>d1.has(n.id)),rest.filter(n=>!d1.has(n.id))];
  rings.forEach((ring,j)=>ring.forEach((n,i)=>{const a=-Math.PI/2+2*Math.PI*i/ring.length;const r=Math.max(j?410:240,ring.length*40);state.positions[n.id]={x:630+Math.cos(a)*r,y:380+Math.sin(a)*r*.79}}));
 }else{anchors();const factor=nodes.length>45?1.65:1.4;for(const n of nodes){state.positions[n.id].x*=factor;state.positions[n.id].y*=factor}}
 for(const n of nodes)poses[n.id]={...state.positions[n.id]};
 // Deterministic rectangular collision relaxation. No live physics on hover.
 for(let iter=0;iter<270;iter++){
  const f=Object.fromEntries(nodes.map(n=>[n.id,{x:0,y:0}]));
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   const a=nodes[i],b=nodes[j],pa=state.positions[a.id],pb=state.positions[b.id],da=dims(a),db=dims(b);
   let dx=pb.x-pa.x,dy=(pb.y+(db.bottom+db.top)/2)-(pa.y+(da.bottom+da.top)/2);
   if(Math.abs(dx)<.01)dx=((hash(a.id+b.id)%2)?1:-1)*.1;if(Math.abs(dy)<.01)dy=.1;
   const ox=(da.w+db.w)/2+50-Math.abs(dx),oy=(da.bottom-da.top+db.bottom-db.top)/2+54-Math.abs(dy);
   if(ox>0&&oy>0){if(ox<oy*1.35){const q=Math.sign(dx)*ox*.34;f[a.id].x-=q;f[b.id].x+=q}else{const q=Math.sign(dy)*oy*.34;f[a.id].y-=q;f[b.id].y+=q}}
  }
  for(const n of nodes){const p=state.positions[n.id],home=poses[n.id];f[n.id].x+=(home.x-p.x)*.016;f[n.id].y+=(home.y-p.y)*.016;p.x+=Math.max(-27,Math.min(27,f[n.id].x));p.y+=Math.max(-27,Math.min(27,f[n.id].y))}
 }
 // Final separation pass without anchor attraction.
 for(let iter=0;iter<180;iter++){let any=false;for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  const a=nodes[i],b=nodes[j],ra=rect(a,13),rb=rect(b,13);if(!overlaps(ra,rb))continue;any=true;
  const ox=Math.min(ra.x+ra.w-rb.x,rb.x+rb.w-ra.x),oy=Math.min(ra.y+ra.h-rb.y,rb.y+rb.h-ra.y);const pa=state.positions[a.id],pb=state.positions[b.id];
  if(ox<oy){const s=pa.x<=pb.x?-1:1;pa.x+=s*(ox/2+1);pb.x-=s*(ox/2+1)}else{const s=pa.y<=pb.y?-1:1;pa.y+=s*(oy/2+1);pb.y-=s*(oy/2+1)}
 }if(!any)break}
 saveLayout(nodes);
}
function saveLayout(nodes=state.renderedNodes){state.cache[skey()]=Object.fromEntries(nodes.map(n=>[n.id,{...state.positions[n.id]}]))}
function makeNode(n){
 const p=state.positions[n.id],d=dims(n),c=palette[n.phase];const g=el('g',{'class':'node '+n.kind,'data-node':n.id,transform:`translate(${p.x},${p.y})`,tabindex:0,role:'button','aria-label':`${n.name}. ${n.role}. ${phaseName(n.phase)}.`},$('#nodeLayer'));
 el('title',{},g).textContent=n.name+' - '+n.role;
 el('rect',{x:-d.w/2,y:d.top,width:d.w,height:d.bottom-d.top,rx:10,class:'hit'},g);
 if(n.kind==='policy'){
   const points='-70,-41 70,-41 87,0 70,41 -70,41 -87,0';el('polygon',{points,fill:c.fill,stroke:c.stroke,class:'body','stroke-dasharray':n.status==='planned'?'7 4':''},g);
   el('polygon',{points:'-74,-45 74,-45 92,0 74,45 -74,45 -92,0',class:'outline'},g);
   const lines=wrap(n.label);const start=lines.length===1?-1:-10;
   lines.slice(0,2).forEach((line,i)=>el('text',{x:0,y:start+20*i,class:'node-title',style:'stroke:none;font-size:19px'},g).textContent=line);
   el('text',{x:0,y:29,class:'node-state'},g).textContent=n.id==='oldplan'?'REJECTED 2024':n.id==='newplan'?'RENEWAL PATHWAY':'EXISTING FRAMEWORK';
 }else{
   if(n.kind==='output'){el('path',{d:'M 0 -33 L 37 0 L 0 33 L -37 0 Z',fill:c.fill,stroke:c.stroke,class:'body'},g);el('path',{d:'M 0 -38 L 42 0 L 0 38 L -42 0 Z',class:'outline'},g)}
   else if(n.kind==='process'){el('rect',{x:-43,y:-27,width:86,height:54,rx:13,fill:c.fill,stroke:c.stroke,class:'body'},g);el('rect',{x:-47,y:-31,width:94,height:62,rx:16,class:'outline'},g)}
   else{el('circle',{r:n.kind==='person'?27:31,fill:c.fill,stroke:c.stroke,class:'body'},g);el('circle',{r:n.kind==='person'?32:36,class:'outline'},g);if(n.phase==='both')el('circle',{r:24,fill:'none',stroke:c.stroke,'stroke-opacity':.25,'stroke-width':1},g)}
   const code=el('text',{x:0,y:1,class:'node-code',style:`font-size:${n.code.length>5?10:n.code.length>3?12:16}px`},g);code.textContent=n.code;
   const lines=wrap(n.label,n.kind==='person'?24:23).slice(0,3);lines.forEach((line,i)=>el('text',{x:0,y:54+i*20,class:'node-title',style:n.kind==='person'?'font-size:16px':''},g).textContent=line);
 }
 state.nodeEls[n.id]=g;return g;
}
class Heap{constructor(){this.a=[]}push(v){let a=this.a;a.push(v);let i=a.length-1;while(i>0){let p=(i-1)>>1;if(a[p][0]<=v[0])break;a[i]=a[p];i=p}a[i]=v}pop(){let a=this.a;if(!a.length)return null;let top=a[0],v=a.pop();if(a.length){let i=0;while(true){let j=i*2+1;if(j>=a.length)break;if(j+1<a.length&&a[j+1][0]<a[j][0])j++;if(a[j][0]>=v[0])break;a[i]=a[j];i=j}a[i]=v}return top}get length(){return this.a.length}}
// Obstacle-aware visibility routing. Labels are part of each obstacle;
// connectors cannot take a shortcut through another actor's text.
function segmentHits(a,b,r){
 const dx=b.x-a.x,dy=b.y-a.y;let lo=0,hi=1;
 for(const [p,q] of [[-dx,a.x-r.x],[dx,r.x+r.w-a.x],[-dy,a.y-r.y],[dy,r.y+r.h-a.y]]){
  if(Math.abs(p)<1e-9){if(q<0)return false;continue}
  const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;
 }return hi>1e-7&&lo<1-1e-7;
}
function routingGrid(nodes){
 const rs=nodes.map(n=>rect(n,10));
 const clear=(a,b,skip)=>!rs.some(r=>r.id!==skip&&segmentHits(a,b,r));
 const vertices=[];const adj=[];
 for(const r of rs)for(const [x,y] of [[r.x-3,r.y-3],[r.x+r.w+3,r.y-3],[r.x+r.w+3,r.y+r.h+3],[r.x-3,r.y+r.h+3]]){
  const v={x,y};if(!rs.some(o=>x>o.x&&x<o.x+o.w&&y>o.y&&y<o.y+o.h)){vertices.push(v);adj.push([])}
 }
 for(let i=0;i<vertices.length;i++)for(let j=i+1;j<vertices.length;j++){
  const a=vertices[i],b=vertices[j];if(!clear(a,b))continue;
  const d=Math.hypot(b.x-a.x,b.y-a.y)+3;adj[i].push([j,d]);adj[j].push([i,d]);
 }
 const router={rs,vertices,adj,clear,ports:{},usage:new Map()};
 for(const n of nodes)router.ports[n.id]=ports(n,router);
 return router;
}
function ports(n,grid){
 const p=state.positions[n.id],r=rect(n,10);
 const hr=n.kind==='policy'?88:n.kind==='process'?44:n.kind==='output'?38:n.kind==='person'?29:33;
 const top=n.kind==='policy'?-43:n.kind==='process'?-28:n.kind==='person'?-29:-34;
 const candidates=[
  {anchor:{x:p.x+hr+5,y:p.y},gate:{x:r.x+r.w+3,y:p.y},dir:'right'},
  {anchor:{x:p.x-hr-5,y:p.y},gate:{x:r.x-3,y:p.y},dir:'left'},
  {anchor:{x:p.x,y:p.y+top-5},gate:{x:p.x,y:r.y-3},dir:'top'}
 ];
 if(n.kind==='policy')candidates.push({anchor:{x:p.x,y:p.y+47},gate:{x:p.x,y:r.y+r.h+3},dir:'bottom'});
 return candidates.filter(a=>grid.clear(a.anchor,a.gate,n.id)).map(a=>{
  a.links=[];a.lead=Math.hypot(a.gate.x-a.anchor.x,a.gate.y-a.anchor.y);
  grid.vertices.forEach((v,i)=>{if(grid.clear(a.gate,v))a.links.push([i,Math.hypot(v.x-a.gate.x,v.y-a.gate.y)+3])});return a;
 });
}
function simplify(points){const out=[];for(const p of points){if(out.length&&Math.hypot(p.x-out.at(-1).x,p.y-out.at(-1).y)<.2)continue;out.push(p);while(out.length>=3){const a=out.at(-3),b=out.at(-2),c=out.at(-1),cross=(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x),dot=(b.x-a.x)*(c.x-b.x)+(b.y-a.y)*(c.y-b.y);if(Math.abs(cross)<.01&&dot>=0)out.splice(out.length-2,1);else break}}return out}
function pathString(points){if(points.length<2)return '';let s=`M ${points[0].x} ${points[0].y}`;for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1];const d1=Math.hypot(b.x-a.x,b.y-a.y),d2=Math.hypot(c.x-b.x,c.y-b.y),r=Math.min(11,d1/3,d2/3);if(!d1||!d2)continue;const p={x:b.x-(b.x-a.x)/d1*r,y:b.y-(b.y-a.y)/d1*r},q={x:b.x+(c.x-b.x)/d2*r,y:b.y+(c.y-b.y)/d2*r};s+=` L ${p.x} ${p.y} Q ${b.x} ${b.y} ${q.x} ${q.y}`}const last=points.at(-1);return s+` L ${last.x} ${last.y}`}
function route(e,grid){
 const aa=grid.ports[e.source],bb=grid.ports[e.target],v=grid.vertices,N=v.length;
 const points=[...v,...aa.map(p=>p.gate),...bb.map(p=>p.gate)];
 const sourceStart=N,targetStart=N+aa.length,total=points.length;
 const gs=new Float64Array(total);gs.fill(Infinity);const prev=new Int32Array(total);prev.fill(-1);
 const heap=new Heap(),closed=new Uint8Array(total),extra=new Map();
 for(let i=0;i<bb.length;i++)for(const [j,c] of bb[i].links){if(!extra.has(j))extra.set(j,[]);extra.get(j).push([targetStart+i,c]);}
 for(let i=0;i<aa.length;i++){gs[sourceStart+i]=aa[i].lead;heap.push([aa[i].lead,sourceStart+i]);}
 let end=-1,best=Infinity;
 while(heap.length){
  const [cost,id]=heap.pop();if(closed[id])continue;if(cost>best)break;closed[id]=1;
  if(id>=targetStart){const d=cost+bb[id-targetStart].lead;if(d<best){best=d;end=id}continue;}
  let links;
  if(id>=sourceStart){const p=aa[id-sourceStart];links=p.links.slice();for(let i=0;i<bb.length;i++)if(grid.clear(p.gate,bb[i].gate))links.push([targetStart+i,Math.hypot(bb[i].gate.x-p.gate.x,bb[i].gate.y-p.gate.y)+3]);}
  else links=[...grid.adj[id],...(extra.get(id)||[])];
  for(const [j,dist] of links){
   const key=id<N&&j<N?[Math.min(id,j),Math.max(id,j)].join(':'):'';
   const penalty=key?Math.min(4,grid.usage.get(key)||0)*9:0;
   const c=cost+dist+penalty;if(c<gs[j]){gs[j]=c;prev[j]=id;heap.push([c,j]);}
  }
 }
 if(end<0){console.warn('No collision-free route',e.id);return{points:[],d:''};}
 const ids=[];for(let id=end;id!==-1;id=prev[id])ids.unshift(id);
 const a=aa[ids[0]-sourceStart],b=bb[end-targetStart];
 for(let i=1;i<ids.length;i++)if(ids[i-1]<N&&ids[i]<N){const key=[Math.min(ids[i-1],ids[i]),Math.max(ids[i-1],ids[i])].join(':');grid.usage.set(key,(grid.usage.get(key)||0)+1);}
 const all=simplify([a.anchor,...ids.map(id=>points[id]),b.anchor]);
 return{points:all,d:pathString(all)};
}
function createMarkers(){const defs=$('#svgDefs');for(const [cat,color] of Object.entries(edgeColor)){const m=el('marker',{id:'arrow-'+cat,viewBox:'0 0 11 10',refX:10,refY:5,markerWidth:11,markerHeight:10,orient:'auto',markerUnits:'userSpaceOnUse'},defs);el('path',{d:'M 0 0 L 10 5 L 0 10 L 2.5 5 Z',fill:color},m)}}
createMarkers();
function drawEdges(){
 $('#edgeLayer').replaceChildren();$('#edgeHitLayer').replaceChildren();state.edgeEls={};state.paths={};
 if(!state.renderedNodes.length)return;
 const grid=routingGrid(state.renderedNodes);
 for(const e of state.renderedEdges){const r=route(e,grid);state.paths[e.id]=r;
 const p=el('path',{d:r.d,class:'edge-visible '+e.status+(state.contextEdges.has(e.id)?' context':''),'data-edge':e.id,stroke:edgeColor[e.category]||'#8d9f88','marker-end':'url(#arrow-'+e.category+')'},$('#edgeLayer'));
 const hit=el('path',{d:r.d,class:'edge-hit','data-edge':e.id,tabindex:-1,role:'button','aria-label':byId[e.source].name+' '+e.label+' '+byId[e.target].name},$('#edgeHitLayer'));
 state.edgeEls[e.id]={p,hit};
 }
}
function updateNodePositions(){for(const n of state.renderedNodes){const p=state.positions[n.id];state.nodeEls[n.id]?.setAttribute('transform',`translate(${p.x},${p.y})`)}}
function drawGraph(fit=true,force=false){
 const {nodes,edges}=filteredGraph();state.renderedNodes=nodes;state.renderedEdges=edges;
 if(state.selected&&!nodes.some(n=>n.id===state.selected))state.selected=null;if(state.selectedEdge&&!edges.some(e=>e.id===state.selectedEdge))state.selectedEdge=null;
 arrange(nodes,edges,force);state.nodeEls={};$('#nodeLayer').replaceChildren();for(const n of nodes)makeNode(n);
 drawEdges();$('#emptyGraph').hidden=!!nodes.length;
 if(fit)fitGraph();else applyView();updateHighlight();updateChrome();renderSide();
 announce(`${nodes.length} visible elements and ${edges.length} connections.`);
}
function updateChrome(){
 $$('[data-phase]').forEach(b=>{const on=b.dataset.phase===state.phase;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on)});
 $('#lens').value=state.lens;$('#scope').value=state.scope;$('#people').checked=state.people;$('#planned').checked=state.planned;$('#labels').value=state.labels;
 $('#counts').textContent=state.renderedNodes.length+' elements';
 let crumb=state.phase==='both'?'Comparison network':phaseName(state.phase);
 if(state.path)crumb+='<span>/</span><span>Connection trace</span><button data-clear-focus>Clear</button>';
 else if(state.focus)crumb+='<span>/</span><span>'+state.focus.hops+'-hop focus</span><button data-clear-focus>Show network</button>';
 else if(state.lens!=='all')crumb+='<span>/</span><span>'+esc(catLabel[state.lens])+'</span>';
 $('#breadcrumbs').innerHTML=crumb;
 const cap=$('#phaseCaptions');cap.style.display=state.focus||state.path||state.lens!=='all'||state.scope==='all'||state.people?'none':'flex';cap.querySelector('.old').style.display=state.phase==='revision'?'none':'';cap.querySelector('.new').style.display=state.phase==='original'?'none':'';cap.querySelector('.both').style.display=state.phase==='both'?'':'none';
 $('#datasetStats').textContent=MODEL.nodes.length+' mapped elements / '+MODEL.edges.length+' sourced relations';
 $('#mapHint').textContent=state.lens!=='all'?'Faint links retain context. Select a node to follow its connections.':state.scope==='all'||state.people?'Use search or a 1-hop focus for close reading.':'Select to inspect \u00b7 Drag to rearrange \u00b7 Scroll to zoom';
}
function applyView(){const {x,y,k}=state.view;viewport.setAttribute('transform',`translate(${x},${y}) scale(${k})`);$('#zoomRead').textContent=Math.round(k*100)+'%'}
function graphBounds(){
 const rs=state.renderedNodes.map(n=>rect(n,15));
 for(const r of Object.values(state.paths))for(const p of r.points)rs.push({x:p.x-10,y:p.y-10,w:20,h:20});
 if(!rs.length)return{x:0,y:0,w:100,h:100};
 const x=Math.min(...rs.map(r=>r.x)),y=Math.min(...rs.map(r=>r.y));return{x,y,w:Math.max(...rs.map(r=>r.x+r.w))-x,h:Math.max(...rs.map(r=>r.y+r.h))-y};
}
function fitGraph(){const b=graphBounds(),w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;const k=Math.min(1.32,(w-62)/b.w,(h-86)/b.h);state.view={k:Math.max(.12,k),x:w/2-(b.x+b.w/2)*k,y:39+(h-81)/2-(b.y+b.h/2)*k};applyView()}
function zoom(mult,cx=stage.clientWidth/2,cy=stage.clientHeight/2){const v=state.view,k=Math.max(.12,Math.min(3.4,v.k*mult));v.x=cx-(cx-v.x)*k/v.k;v.y=cy-(cy-v.y)*k/v.k;v.k=k;applyView()}
function selectedContext(){let id=state.hover||state.selected,edgeid=state.hoverEdge||state.selectedEdge;if(state.hover){edgeid=null}else if(state.hoverEdge){id=null}let ids=new Set(),es=new Set();if(edgeid){const e=byEdge[edgeid];ids.add(e.source);ids.add(e.target);es.add(edgeid)}else if(id){ids.add(id);for(const e of state.renderedEdges)if(e.source===id||e.target===id){ids.add(e.source);ids.add(e.target);es.add(e.id)}}else if(state.path){ids=new Set(state.path.nodes);es=new Set(state.path.edges)}return{ids,es,has:ids.size>0}}
function updateHighlight(){
 const c=selectedContext();for(const n of state.renderedNodes){const g=state.nodeEls[n.id];g.classList.toggle('dim',c.has&&!c.ids.has(n.id));g.classList.toggle('selected',state.selected===n.id);g.classList.toggle('hovered',state.hover===n.id);g.classList.toggle('on-path',!!state.path?.nodes.includes(n.id))}
 for(const e of state.renderedEdges){const p=state.edgeEls[e.id]?.p;if(!p)continue;p.classList.toggle('dim',c.has&&!c.es.has(e.id));p.classList.toggle('active',c.es.has(e.id));p.classList.toggle('on-path',!!state.path?.edges.includes(e.id))}
 drawLabels(c);
}
function labelCandidates(points){const segments=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=Math.hypot(b.x-a.x,b.y-a.y);if(len>35)segments.push({a,b,len,i})}segments.sort((a,b)=>b.len-a.len);const result=[];for(const seg of segments.slice(0,7)){for(const t of [.5,.32,.68])for(const off of [0,-19,19])result.push({x:seg.a.x+(seg.b.x-seg.a.x)*t,y:seg.a.y+(seg.b.y-seg.a.y)*t+off})}return result}
function drawLabels(c=selectedContext()){
 const layer=$('#labelLayer');layer.replaceChildren();if(state.labels==='none')return;
 let edges=state.labels==='all'?state.renderedEdges:state.renderedEdges.filter(e=>c.es.has(e.id));edges=[...edges].sort((a,b)=>(c.es.has(b.id)?1:0)-(c.es.has(a.id)?1:0));
 const occupied=state.renderedNodes.map(n=>rect(n,9)),placed=[];
 for(const e of edges){const route=state.paths[e.id];if(!route)continue;let text=e.label;if(e.status==='planned'&&!text.toLowerCase().includes('would'))text+=' *';const w=Math.min(340,text.length*6.25+16),h=23;let box=null;
 for(const p of labelCandidates(route.points)){const b={x:p.x-w/2,y:p.y-h/2,w,h};if(!occupied.some(r=>overlaps(b,r,3))&&!placed.some(r=>overlaps(b,r,4))){box=b;break}}
 if(!box)continue;placed.push(box);const g=el('g',{class:'edge-label'+(c.has&&!c.es.has(e.id)?' dim':'')},layer);el('rect',{x:box.x,y:box.y,width:w,height:h,rx:4},g);el('text',{x:box.x+w/2,y:box.y+h/2+1},g).textContent=text;
 }
}
function selectNode(id,fit=false){if(!byId[id])return;state.selected=id;state.selectedEdge=null;state.hover=null;state.hoverEdge=null;state.tab='inspect';showInspector();updateHighlight();renderSide();if(fit)fitGraph();announce(byId[id].name+' selected');setHash()}
function selectEdge(id){if(!byEdge[id])return;state.selected=null;state.selectedEdge=id;state.tab='inspect';state.hover=null;state.hoverEdge=null;showInspector();updateHighlight();renderSide();setHash()}
function showInspector(){if($('#workspace').classList.contains('no-inspector')){$('#workspace').classList.remove('no-inspector');$('#panelBtn').setAttribute('aria-pressed','true')}}
function clearSelection(){state.selected=null;state.selectedEdge=null;state.hover=null;state.hoverEdge=null;$('#tooltip').hidden=true;updateHighlight();renderSide();setHash()}
function focusOn(id,hops){state.focus={id,hops};state.path=null;state.lens='all';state.selected=id;state.selectedEdge=null;state.tab='inspect';drawGraph(true,true);setHash()}
function clearFocus(){state.focus=null;state.path=null;drawGraph();setHash()}
function revealNode(id){const n=byId[id];if(!phaseAllows(n))state.phase=n.phase;if(n.kind==='person')state.people=true;state.scope='all';state.focus={id,hops:1};state.path=null;state.lens='all';state.selected=id;state.selectedEdge=null;state.tab='inspect';if(n.status==='planned')state.planned=true;showInspector();hideSearch();$('#search').value='';drawGraph(true,true);setHash()}
function renderWelcome(){return `<div class="kicker">Policy actor network</div><h2>One network.<br>Two policy moments.</h2><p>Explore who prepared the original proposal, who contributed advice, and how the post-referendum process feeds the next HGS.</p><div class="mini-metrics"><div><strong>${state.renderedNodes.length}</strong><small>visible elements</small></div><div><strong>${state.renderedEdges.length}</strong><small>visible connections</small></div></div><p class="caution">The blue network is a <strong>revision pathway</strong>, not a confirmed new drafting-team roster. Advisory, participation and monitoring roles remain separate.</p><h3>Start with a question</h3><button class="quick-card" data-quick="original">Who prepared the original proposal?<small>Authors, executive, council and formal input.</small></button><button class="quick-card" data-quick="revision">Who is preparing the next HGS?<small>Recorded commitments and the unverified team assignment.</small></button><button class="quick-card" data-quick="resident">How does resident input travel?<small>Assembly participants, advice and policy follow-up.</small></button><button class="quick-card" data-quick="courtyard">Where did courtyard concerns enter?<small>The VVAB's documented consultation contribution.</small></button><h3>Read the network</h3><p class="small-note">Colour identifies the policy period. Arrows name responsibilities; they are not a ranking of power or a proof of causal influence. Dashed links are documented intentions. Dotted links show affiliation.</p><p class="small-note">Choose <em>All documented contributors</em> for the extended network. Named people are optional; affiliation does not imply personal authorship.</p>${sourceLinks(['S01','S14'])}`}
function connectionButton(e,id){const out=e.source===id,other=byId[out?e.target:e.source];return `<button class="connection" data-edge-open="${e.id}"><span class="other">${out?'&#8594; ':'&#8592; '}${esc(other.name)}</span><span class="verb">${esc(e.label)}</span><small>${esc(catLabel[e.category])} &middot; ${e.status==='planned'?'Intended / not completed':e.status==='affiliation'?'Affiliation':'Recorded action'}</small></button>`}
function renderNode(n){
 const rel=MODEL.edges.filter(e=>(e.source===n.id||e.target===n.id)&&phaseAllows(e)&&(state.planned||e.status!=='planned'));
 const outgoing=rel.filter(e=>e.source===n.id),incoming=rel.filter(e=>e.target===n.id);
 const kids=MODEL.nodes.filter(x=>x.parent===n.id&&x.kind==='person');
 return `<div class="kicker">${esc(kindName(n.kind))}</div><h2>${esc(n.name)}</h2><div class="tags">${phaseTag(n)}<span class="tag">${esc(n.role)}</span>${n.status==='planned'?'<span class="tag planned">Announced / intended</span>':''}</div><p>${esc(n.summary)}</p>${n.original?`<div class="phase-role"><div class="kicker">Original proposal / 2021-2024</div><p>${esc(n.original)}</p></div>`:''}${n.revision?`<div class="phase-role new"><div class="kicker">Revision pathway / 2025 onward</div><p>${esc(n.revision)}</p></div>`:''}${n.limit?`<p class="caution">${esc(n.limit)}</p>`:''}<div class="actions"><button data-focus="1" data-id="${n.id}">1-hop focus</button><button data-focus="2" data-id="${n.id}">2-hop focus</button><button data-trace="${n.id}">Trace a connection</button></div><h3>Connections <span class="pill-count">${rel.length}</span></h3><p class="small-note">Click a connection for its exact responsibility, direction and sources. This list includes connections hidden by the detail filter.</p>${outgoing.length?'<div class="direction-label">From this element</div>'+outgoing.map(e=>connectionButton(e,n.id)).join(''):''}${incoming.length?'<div class="direction-label">To this element</div>'+incoming.map(e=>connectionButton(e,n.id)).join(''):''}${kids.length?`<h3>Named people</h3>${kids.map(p=>`<button class="connection" data-open-node="${p.id}">${esc(p.name)}<small>${esc(p.role)}</small></button>`).join('')}`:''}<h3>Evidence</h3>${sourceLinks(n.sources)}<details><summary>Private research note</summary><p class="small-note">Stored in this browser only. Notes do not change the sourced model.</p><textarea class="note-area" id="localNote" data-id="${n.id}" aria-label="Private research note for ${esc(n.name)}">${esc(state.notes[n.id]||'')}</textarea><div id="saveHint" class="save-hint"></div></details>`;
}
function renderEdge(e){const a=byId[e.source],b=byId[e.target];return `<div class="kicker">Directed connection</div><h2 class="relation-title">${esc(e.label)}</h2><div class="tags"><span class="tag ${e.phase}">${phaseName(e.phase)}</span><span class="tag">${esc(catLabel[e.category])}</span><span class="tag ${e.status==='planned'?'planned':''}">${e.status==='planned'?'Documented intention':e.status==='affiliation'?'Recorded affiliation':'Recorded action'}</span></div><div class="relation-pair"><button data-open-node="${a.id}">${esc(a.name)}</button><span class="verb"><span class="arrow">&#8595;</span>${esc(e.label)}</span><button data-open-node="${b.id}">${esc(b.name)}</button></div>${e.note?`<p>${esc(e.note)}</p>`:''}${e.status==='planned'?'<p class="caution">This connection records an announced or intended relationship. It does not assert that the action has been completed.</p>':''}${e.status==='affiliation'?'<p class="caution">Affiliation or a named role is not proof of personal authorship of an organisation\'s policy contribution.</p>':''}<div class="actions"><button data-focus="1" data-id="${a.id}">Focus source</button><button data-focus="1" data-id="${b.id}">Focus target</button></div><h3>Connection evidence</h3>${sourceLinks(e.sources)}`}
function renderDirectory(){const q=$('#search').value.toLowerCase().trim();const ns=MODEL.nodes.filter(n=>phaseAllows(n)&&(state.people||n.kind!=='person')&&(!q||[n.name,n.role,n.summary].join(' ').toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name));return `<div class="kicker">Searchable model register</div><h2>Actor directory</h2><p class="small-note">${ns.length} elements in this period. Click an entry to open its immediate network. Enable Named people to include individual contributors and historical affiliations.</p>${ns.map(n=>`<button class="directory-item" data-open-node="${n.id}"><span class="dot ${n.phase==='original'?'old':n.phase==='revision'?'new':'both'}"></span><span>${esc(n.name)}<small>${esc(n.role)}</small></span></button>`).join('')}`}
function renderSources(){return `<div class="kicker">Provenance register</div><h2>Sources &amp; scope</h2><p class="small-note">${MODEL.sources.length} primary records. Every connection has its own source references. All links open the source in a new tab.</p><p class="caution">This is a documented subset, not an exhaustive consultation register. No current drafting lead or complete revision-team roster is asserted.</p>${MODEL.sources.map(s=>`<div class="source-card"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">[${s.id}] ${esc(s.title)} &#8599;</a><small>${esc(s.date)} &middot; ${esc(s.locator)}</small><p class="small-note">${esc(s.note)}</p></div>`).join('')}<h3>Records still needed</h3><p class="small-note">Complete consultation respondent register and district submissions; the new executive assignment (bestuursopdracht), project team and participation plan; named assembly expert and sounding-board rosters.</p><p class="small-note">Groups and named members may overlap. Graph-element totals are not unique-person counts.</p>`}
function renderTrace(){
 const p=state.path;return `<div class="kicker">Connection trace</div><h2>${p.edges.length} linked responsibilities</h2><p>From ${esc(byId[p.nodes[0]].name)} to ${esc(byId[p.nodes.at(-1)].name)}.</p><p class="caution">${p.directed?'This trace follows arrow directions.':'This navigation trace may follow arrows in reverse.'} A connection chain is not evidence of causal influence or delegated authority.</p>${p.edges.map((id,i)=>{const e=byEdge[id],forward=e.source===p.nodes[i];return `<div class="direction-label">Step ${i+1} / ${forward?'with':'against'} the arrow</div><button class="connection" data-edge-open="${e.id}"><span class="other">${esc(byId[e.source].name)}</span><span class="verb">&#8595; ${esc(e.label)}</span><span class="other">${esc(byId[e.target].name)}</span></button>`}).join('')}<div class="actions"><button data-clear-focus>Return to the network</button></div>`;
}
function renderSide(){
 $$('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));
 $('#sideBody').innerHTML=state.tab==='actors'?renderDirectory():state.tab==='sources'?renderSources():state.selected?renderNode(byId[state.selected]):state.selectedEdge?renderEdge(byEdge[state.selectedEdge]):state.path?renderTrace():renderWelcome();
 const note=$('#localNote');if(note)note.addEventListener('input',()=>{state.notes[note.dataset.id]=note.value;try{localStorage.setItem('amsterdamHGS.notes.v1',JSON.stringify(state.notes));$('#saveHint').textContent='Saved locally.'}catch(_e){$('#saveHint').textContent='Browser storage unavailable. Export data to retain this note.'}})
}
function setHash(){const p=new URLSearchParams();p.set('period',state.phase);if(state.scope!=='core')p.set('detail',state.scope);if(state.people)p.set('people','1');if(state.selected)p.set('actor',state.selected);if(state.selectedEdge)p.set('relation',state.selectedEdge);if(state.lens!=='all')p.set('lens',state.lens);if(state.focus)p.set('hops',String(state.focus.hops));try{history.replaceState(null,'','#'+p)}catch(_e){}}
function reset(){Object.assign(state,{phase:'both',scope:'core',lens:'all',people:false,planned:true,selected:null,selectedEdge:null,hover:null,hoverEdge:null,focus:null,path:null,tab:'inspect',labels:'selected'});$('#search').value='';hideSearch();anchors();drawGraph(true,true);setHash()}
function openDialog(title,content){$('#dialogTitle').textContent=title;$('#dialogBody').innerHTML=content;$('#dialog').showModal()}
function guide(){openDialog('Explore the HGS network',`<p>This is the network-graph companion to the Amsterdam Tree Governance Explorer. It compares the proposal rejected in 2024 with the subsequent revision pathway.</p><h3>Navigate</h3><p>Select an actor for responsibilities, incoming and outgoing connections, names and evidence. Select a line for its exact relationship. Drag a node to reposition it; drag empty space to pan. Use the wheel, trackpad or zoom buttons to zoom.</p><h3>Reduce complexity</h3><p>Switch policy periods, choose a responsibility lens, or open a 1-hop / 2-hop neighbourhood. The key-actor view opens first; the extended contributor view and named people are optional. Lenses retain connecting context links rather than leaving isolated nodes.</p><h3>Interpretation</h3><p>Amber means the original-proposal process; blue means the post-referendum revision pathway; green means an institution appears in both. Colours do not describe political positions. Arrow directions describe the labelled relationship, not an overall hierarchy of power.</p><p>Solid lines record actions. Dashed lines record intentions or planned steps. Dotted lines are affiliations. A trace follows relationships; it is not a causal claim or a formal chain of command.</p><h3>Keyboard and access</h3><p>Tab through controls and graph actors; Enter selects an actor. The Directory provides a text route into every included element. Escape clears selection or closes an open dialog. Sources and relationship lists provide the detail even when the graph is zoomed out.</p><p class="small-note">The explorer uses local site assets and no external libraries. Source links open external documents. Baskerville Old Face is used when installed, with Baskerville and Georgia fallbacks; no font file is bundled.</p>`)}
function limitations(){openDialog('Scope, evidence and open questions',`<p><strong>Evidence snapshot:</strong> 21 September 2026. This is an independent research map, not an official municipal organisation chart.</p><p>The original network combines proposal authors, formal advisers, consultation input and the referendum process. The revision network combines the known municipal follow-up, citizen-assembly preparation, recommendations and monitoring. These are deliberately different kinds of involvement.</p><p class="caution">The replacement HGS drafting lead and full team were not verified. Wouter van der Veur is tied to the original dossier; Vera Adels to the citizen-assembly project; Niek Bosch to TAC work. None is labelled the current HGS revision lead.</p><p>The TAC's February 2025 report says it was not part of the new policy preparation. The assembly evaluation states that the Burgerberaad does not replace consultation on a new HGS.</p>${sourceLinks(['S07','S12','S14'])}<h3>Coverage limits</h3><p>The consultation register is incomplete. The map does not infer that every member of a green-sector umbrella organisation personally contributed. Historical committee membership is dated, and a present-day portfolio is not treated as proof of a project appointment.</p><p>Overlapping collective and individual nodes are included for exploration; totals count graph elements, not unique people. Layout and visual prominence are design choices, not measures of formal power.</p><h3>To extend the evidence</h3><p>The complete Nota van Beantwoording and district submissions, the successor's bestuursopdracht and project plan, and the new participation plan would enable a fuller and more precise actor register.</p>`)}
function traceDialog(id){const opts=MODEL.nodes.filter(n=>phaseAllows(n)&&(state.people||n.kind!=='person')).sort((a,b)=>a.name.localeCompare(b.name));const op=sel=>opts.map(n=>`<option value="${n.id}" ${n.id===sel?'selected':''}>${esc(n.name)}</option>`).join('');openDialog('Trace a connection',`<p>Find a shortest connection chain in this period. This is a navigation tool, not evidence of causal influence or a formal authority chain.</p><div class="form-grid"><label>From<select id="traceFrom">${op(id)}</select></label><label>To<select id="traceTo">${op(state.phase==='original'?'oldplan':'newplan')}</select></label></div><label class="check-control"><input type="checkbox" id="traceDirected">Follow arrow directions only</label><div class="actions"><button id="runTrace" class="primary">Show connection chain</button></div><p class="small-note" id="traceMessage">Respects the policy period, Named people and Planned links settings.</p>`);$('#runTrace').onclick=()=>{const a=$('#traceFrom').value,b=$('#traceTo').value;if(a===b){$('#traceMessage').textContent='Select two different elements.';return}const p=shortest(a,b,baseEdges(),$('#traceDirected').checked);if(!p){$('#traceMessage').textContent='No connection chain was found with these settings. Try allowing reverse traversal or planned links.';return}state.path=p;state.focus=null;state.selected=null;state.selectedEdge=null;state.scope='all';state.lens='all';state.tab='inspect';$('#dialog').close();drawGraph(true,true);toast('Trace shown. Read each arrow independently; reverse traversal may be included.')}}
function exportData(){const data={...MODEL,exportedAt:new Date().toISOString(),localResearchNotes:state.notes,view:{period:state.phase,scope:state.scope,lens:state.lens,people:state.people,planned:state.planned},positions:state.positions};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='amsterdam-hgs-network.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Sourced model and local notes exported.')}
// Delegated inspector and modal actions.
document.addEventListener('click',ev=>{const t=ev.target.closest('button');if(!t)return;
 if(t.dataset.phase){state.phase=t.dataset.phase;state.focus=null;state.path=null;state.hover=null;state.hoverEdge=null;if(state.selected&&!phaseAllows(byId[state.selected]))state.selected=null;if(state.selectedEdge&&!phaseAllows(byEdge[state.selectedEdge]))state.selectedEdge=null;drawGraph();setHash()}
 if(t.dataset.tab){state.tab=t.dataset.tab;renderSide()}
 if(t.dataset.openNode)revealNode(t.dataset.openNode);
 if(t.dataset.edgeOpen){const e=byEdge[t.dataset.edgeOpen];if(!state.renderedEdges.some(x=>x.id===e.id)){if(byId[e.source].kind==='person'||byId[e.target].kind==='person')state.people=true;state.scope='all';state.lens='all';state.path=null;state.focus={id:state.selected||e.source,hops:1};drawGraph(true,true)}selectEdge(e.id)}
 if(t.dataset.focus)focusOn(t.dataset.id,Number(t.dataset.focus));
 if(t.hasAttribute('data-clear-focus'))clearFocus();
 if(t.dataset.trace)traceDialog(t.dataset.trace);
 if(t.dataset.quick){const which=t.dataset.quick;state.scope=which==='original'?'all':'core';state.lens='all';state.path=null;state.focus=null;state.people=false;state.planned=true;state.phase=which==='original'||which==='courtyard'?'original':'revision';if(which==='original'){state.lens='drafting';state.selected='rd';drawGraph(true,true);selectNode('rd')}else if(which==='revision'){drawGraph();selectNode('newplan')}else revealNode(which==='resident'?'assembly':'vvab');setHash()}
});
$('#helpBtn').onclick=guide;$('#limitationsBtn').onclick=limitations;$('#closeDialog').onclick=()=>$('#dialog').close();$('#dialog').addEventListener('click',e=>{if(e.target===$('#dialog')){const r=$('#dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#dialog').close()}});
$('#exportBtn').onclick=exportData;$('#resetBtn').onclick=reset;$('#emptyReset').onclick=reset;$('#clearSelection').onclick=clearSelection;
$('#panelBtn').onclick=()=>{const hidden=$('#workspace').classList.toggle('no-inspector');$('#panelBtn').setAttribute('aria-pressed',!hidden);requestAnimationFrame(fitGraph)};
$('#lens').onchange=e=>{state.lens=e.target.value;state.focus=null;state.path=null;state.selected=null;state.selectedEdge=null;drawGraph(true,true);setHash()};
$('#scope').onchange=e=>{state.scope=e.target.value;state.focus=null;state.path=null;state.hover=null;state.hoverEdge=null;drawGraph(true);setHash()};
$('#people').onchange=e=>{state.people=e.target.checked;if(!state.people&&state.selected&&byId[state.selected].kind==='person')state.selected=null;state.path=null;if(state.focus&&byId[state.focus.id].kind==='person')state.focus=null;drawGraph(true,true);setHash()};
$('#planned').onchange=e=>{state.planned=e.target.checked;state.path=null;drawGraph(true);setHash()};$('#labels').onchange=e=>{state.labels=e.target.value;drawLabels()};
$('#fitBtn').onclick=fitGraph;$('#zoomRead').onclick=fitGraph;$('#zoomIn').onclick=()=>zoom(1.22);$('#zoomOut').onclick=()=>zoom(1/1.22);$('#tidyBtn').onclick=()=>{delete state.cache[skey()];drawGraph(true,true);toast('Visible network rearranged.')};
// Search includes every mapped element, even when currently hidden.
function hideSearch(){$('#searchResults').hidden=true;$('#search').setAttribute('aria-expanded','false');state.searchIndex=-1}
function doSearch(){const q=$('#search').value.trim().toLowerCase();if(!q){hideSearch();if(state.tab==='actors')renderSide();return}const terms=q.split(/\s+/);state.searchHits=MODEL.nodes.map(n=>{const text=[n.name,n.label,n.role,n.summary,n.original,n.revision,n.code].join(' ').toLowerCase();const score=terms.every(t=>text.includes(t))?(n.name.toLowerCase().includes(q)?3:1)+(phaseAllows(n)?1:0):0;return{n,score}}).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.n.name.localeCompare(b.n.name)).slice(0,18).map(x=>x.n);
 $('#searchResults').innerHTML=state.searchHits.length?state.searchHits.map((n,i)=>`<button data-search-id="${n.id}" data-index="${i}">${esc(n.name)}<small>${esc(n.role)} &middot; ${phaseName(n.phase)}</small></button>`).join(''):'<p style="padding:10px;font-size:13px">No matching element in this evidence register.</p>';
 $('#searchResults').hidden=false;$('#search').setAttribute('aria-expanded','true');state.searchIndex=-1;if(state.tab==='actors')renderSide()}
$('#search').addEventListener('input',doSearch);$('#search').addEventListener('keydown',e=>{if(e.key==='Escape'){hideSearch();return}if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();const len=state.searchHits.length;if(!len)return;state.searchIndex=(state.searchIndex+(e.key==='ArrowDown'?1:-1)+len)%len;$$('[data-search-id]').forEach((b,i)=>b.classList.toggle('focused',i===state.searchIndex));$$('[data-search-id]')[state.searchIndex]?.scrollIntoView({block:'nearest'})}if(e.key==='Enter'&&state.searchHits.length){e.preventDefault();revealNode(state.searchHits[Math.max(0,state.searchIndex)].id)}});
$('#searchResults').addEventListener('click',e=>{const b=e.target.closest('[data-search-id]');if(b)revealNode(b.dataset.searchId)});document.addEventListener('pointerdown',e=>{if(!e.target.closest('.search-control'))hideSearch()});
// Pointer events: hover never triggers physics or moves the graph.
let gesture=null,dragFrame=null,pinch=null;const touches=new Map();
function screenPoint(e){const r=stage.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function showTip(e,nodeId,edgeId){const tip=$('#tooltip');if(nodeId){const n=byId[nodeId];tip.innerHTML=`<strong>${esc(n.name)}</strong><div class="tip-role">${esc(n.role)}</div><small>${phaseName(n.phase)} &middot; Click for responsibilities and evidence.</small>`}else if(edgeId){const r=byEdge[edgeId];tip.innerHTML=`<strong>${esc(r.label)}</strong><small>${esc(byId[r.source].name)} &#8594; ${esc(byId[r.target].name)}</small><small>${r.status==='planned'?'Documented intention':r.status==='affiliation'?'Recorded affiliation':'Recorded action'} &middot; click for sources</small>`}else{tip.hidden=true;return}tip.hidden=false;moveTip(e)}
function moveTip(e){const tip=$('#tooltip');const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+16,y=e.clientY+18;if(x+w>window.innerWidth-10)x=e.clientX-w-16;if(y+h>window.innerHeight-10)y=e.clientY-h-14;tip.style.left=Math.max(8,x)+'px';tip.style.top=Math.max(8,y)+'px'}
svg.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;const pos=screenPoint(e);if(e.pointerType==='touch'){touches.set(e.pointerId,pos);if(touches.size===2){const [a,b]=[...touches.values()];pinch={dist:Math.hypot(b.x-a.x,b.y-a.y),mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};gesture=null;svg.setPointerCapture(e.pointerId);return}}
 e.preventDefault();const ng=e.target.closest('[data-node]'),eg=e.target.closest('[data-edge]');gesture={id:e.pointerId,start:pos,last:pos,node:ng?.dataset.node,edge:eg?.dataset.edge,moved:false};$('#tooltip').hidden=true;svg.setPointerCapture(e.pointerId)
});
svg.addEventListener('pointermove',e=>{
 const p=screenPoint(e);if(e.pointerType==='touch'&&touches.has(e.pointerId)){touches.set(e.pointerId,p);if(touches.size===2&&pinch){const [a,b]=[...touches.values()],dist=Math.hypot(a.x-b.x,a.y-b.y),mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};zoom(dist/pinch.dist,pinch.mid.x,pinch.mid.y);state.view.x+=mid.x-pinch.mid.x;state.view.y+=mid.y-pinch.mid.y;applyView();pinch={dist,mid};return}}
 if(gesture&&gesture.id===e.pointerId){if(!gesture.moved&&Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)<6)return;gesture.moved=true;svg.classList.add('dragging');const dx=p.x-gesture.last.x,dy=p.y-gesture.last.y;gesture.last=p;
  if(gesture.node){const q=state.positions[gesture.node],old={...q};q.x+=dx/state.view.k;q.y+=dy/state.view.k;const blocked=()=>state.renderedNodes.some(n=>n.id!==gesture.node&&overlaps(rect(byId[gesture.node],12),rect(n,12)));if(blocked()){q.y=old.y;if(blocked()){q.x=old.x;q.y=old.y+dy/state.view.k;if(blocked())q.y=old.y}}updateNodePositions();if(!dragFrame)dragFrame=requestAnimationFrame(()=>{drawEdges();updateHighlight();dragFrame=null})}else{state.view.x+=dx;state.view.y+=dy;applyView()}return}
 if(e.pointerType==='touch')return;const ng=e.target.closest('[data-node]'),eg=e.target.closest('[data-edge]');const ni=ng?.dataset.node||null,ei=ng?null:eg?.dataset.edge||null;
 if(ni!==state.hover||ei!==state.hoverEdge){state.hover=ni;state.hoverEdge=ei;updateHighlight();showTip(e,ni,ei)}else if(!$('#tooltip').hidden)moveTip(e);
});
function endPointer(e){touches.delete(e.pointerId);if(touches.size<2)pinch=null;if(!gesture||gesture.id!==e.pointerId)return;const g=gesture;gesture=null;svg.classList.remove('dragging');if(g.moved){if(g.node){saveLayout();drawEdges();updateHighlight()}}else if(g.node)selectNode(g.node);else if(g.edge)selectEdge(g.edge);else clearSelection();try{svg.releasePointerCapture(e.pointerId)}catch(_e){}}
svg.addEventListener('pointerup',endPointer);svg.addEventListener('pointercancel',e=>{touches.delete(e.pointerId);gesture=null;pinch=null;svg.classList.remove('dragging')});
svg.addEventListener('pointerleave',()=>{if(gesture)return;state.hover=null;state.hoverEdge=null;$('#tooltip').hidden=true;updateHighlight()});
svg.addEventListener('wheel',e=>{e.preventDefault();const p=screenPoint(e);zoom(Math.exp(-e.deltaY*.0014),p.x,p.y)},{passive:false});
svg.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-node]')){e.preventDefault();selectNode(e.target.closest('[data-node]').dataset.node)}else if(e.key==='+')zoom(1.2);else if(e.key==='-')zoom(1/1.2);else if(e.key.toLowerCase()==='f')fitGraph()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#dialog').open){hideSearch();clearSelection()}});
let resizeTimer;new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>fitGraph(),90)}).observe(stage);
// Read a saved local URL fragment, without fetching any external asset.
try{const p=new URLSearchParams(location.hash.slice(1));if(['both','original','revision'].includes(p.get('period')))state.phase=p.get('period');if(p.get('detail')==='all')state.scope='all';if(p.get('people')==='1')state.people=true;if(catLabel[p.get('lens')])state.lens=p.get('lens');if(byId[p.get('actor')]){state.selected=p.get('actor');if(byId[state.selected].kind==='person')state.people=true;if(['1','2'].includes(p.get('hops')))state.focus={id:state.selected,hops:Number(p.get('hops'))}}if(byEdge[p.get('relation')])state.selectedEdge=p.get('relation')}catch(_e){}
drawGraph();
// Read-only test / inspection interface. The underlying model remains inspectable.
window.HGSExplorer={model:MODEL,state,getVisible:()=>({nodes:state.renderedNodes,edges:state.renderedEdges}),getBounds:()=>state.renderedNodes.map(n=>rect(n)),select:revealNode,reset,fit:fitGraph,draw:drawGraph,routePaths:()=>state.paths};
})();
