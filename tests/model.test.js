const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const G = require('../assets/js/model-core.js');
const base = JSON.parse(fs.readFileSync(path.join(root,'data/model.json')));
const architecture = JSON.parse(fs.readFileSync(path.join(root,'data/architecture.json')));
const m = G.build(base, architecture);

test('three-level model passes structural and provenance validation',()=>assert.deepEqual(G.validate(m),[]));
test('the source model is not mutated or silently replaced',()=>{
 const before=JSON.stringify(base);G.build(base,architecture);assert.equal(JSON.stringify(base),before);
 for(const e of base.edges) assert.equal(m.edges.find(x=>x.id===e.id).label,e.label);
});
test('every original element and relation survives the abstraction',()=>{
 assert.equal(m.nodes.length,44);assert.equal(m.edges.length,71);assert.equal(m.actionSituations.length,6);
 base.nodes.forEach(n=>assert(m.nodes.some(x=>x.id===n.id)));
 base.edges.forEach(e=>assert(m.edges.some(x=>x.id===e.id)));
});
test('all primary homes resolve and shared membership does not duplicate identities',()=>{
 assert(m.nodes.find(n=>n.id==='a_residents').actionSituations.length>1);
 assert.equal(m.nodes.filter(n=>n.id==='a_residents').length,1);
 m.nodes.forEach(n=>assert(n.actionSituations.includes(n.home)));
});
test('all overview handoffs have exact directed backing relations',()=>{
 const ix=G.indices(m);
 m.transfers.forEach(t=>t.edgeIds.forEach(id=>{
  assert.equal(ix.nodes[ix.edges[id].source].home,t.source);
  assert.equal(ix.nodes[ix.edges[id].target].home,t.target);
 }));
 const seen=new Set(['strategy']);for(let i=0;i<6;i++)m.transfers.filter(t=>t.primary).forEach(t=>{if(seen.has(t.source)||seen.has(t.target)){seen.add(t.source);seen.add(t.target);}});
 assert.equal(seen.size,6);
});
test('element pagination preserves every relation and caps the drawing',()=>{
 for(const n of m.nodes){const first=G.neighborhood(m,n.id),seen=new Set();
  for(let i=0;i<first.pages;i++){const p=G.neighborhood(m,n.id,{},i);assert(p.incoming.length<=4&&p.outgoing.length<=4);[...p.incoming,...p.outgoing].forEach(e=>seen.add(e.id));}
  assert.equal(seen.size,G.incident(m,n.id).length);
 }
});
test('documented-only mode never manufactures connections',()=>{
 m.nodes.forEach(n=>G.incident(m,n.id,{basis:'documented'}).forEach(e=>assert.equal(e.basis,'documented')));
 assert.deepEqual(G.path(m,'p_biodivmonitor','p_strategy'),['e55']);
 assert.equal(G.path(m,'p_biodivmonitor','p_strategy',{basis:'documented'}),null);
});
test('paths respect arrow direction and reject missing nodes',()=>{
 assert.equal(G.path(m,'p_strategy','p_biodivmonitor',{basis:'documented'}),null);
 assert.equal(G.path(m,'not-a-node','p_plant'),null);
 assert.deepEqual(G.path(m,'p_plant','p_plant'),[]);
});
test('resident-report question starts with a report, not a data-reading edge',()=>{
 assert.equal(m.questions[0].source,'d_report');
 const p=G.path(m,m.questions[0].source,m.questions[0].target);assert(p&&p.includes('e30'));assert(!p.includes('e28'));
});
test('unknown capacity and observed practice are not invented',()=>{
 m.nodes.filter(n=>n.type==='actor').forEach(n=>assert.deepEqual(n.capacityAssessment,{budgetControl:null,staffTime:null,influenceScore:null}));
 [...m.nodes,...m.edges].forEach(x=>assert.equal(x.observedInPractice,null));
 assert.equal(m.edges.find(e=>e.id==='e69').basis,'synthesis');
});
test('bad overview provenance is detected',()=>{
 const bad=JSON.parse(JSON.stringify(m));bad.transfers[0].edgeIds=['e23'];assert(G.validate(bad).some(s=>s.includes('Untraceable')));
});
