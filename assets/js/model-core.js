/* Pure model functions, shared by the browser and Node tests. No layout state. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TreeGov = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clone = x => JSON.parse(JSON.stringify(x));
  function build(base, architecture) {
    const model = clone(base), a = clone(architecture);
    model.metadata = { ...model.metadata, version: a.schemaVersion, baseVersion: base.metadata.version,
      schema: 'Three-level typed graph: elements, overlapping action situations, traceable system transfers.',
      baseVerification: base.metadata.verification,
      verification: 'Institutional claims inherited from the v0.3 desk model; new groupings and qualifiers are editorial classifications, not an independent factual audit.',
      canonicalData: ['data/model.json', 'data/architecture.json'], methodology: a.method };
    model.nodes = [...model.nodes, ...a.nodes].map(n => ({ ...n, ...a.nodeProfiles[n.id],
      observedInPractice: null, evidenceReview: n.id.startsWith('res_') ? 'v0.4 resource extension' : 'inherited v0.3 desk model' }));
    model.edges = [...model.edges, ...a.edges].map(e => ({ ...e, ...a.edgeProfiles[e.id],
      observedInPractice: null, metadataBasis: 'Editorial classification; not proof of compliance.' }));
    model.actionSituations = a.actionSituations.map(s => ({ ...s, basis: 'synthesis',
      members: [...new Set([...s.core, ...s.members, ...model.nodes.filter(n => n.home === s.id).map(n => n.id)])] }));
    model.nodes.forEach(n => {
      n.actionSituations = model.actionSituations.filter(s => s.members.includes(n.id)).map(s => s.id);
      if (n.type === 'actor') n.capacityAssessment = { budgetControl: null, staffTime: null, influenceScore: null };
    });
    const edges = Object.fromEntries(model.edges.map(e => [e.id, e]));
    model.transfers = a.transfers.map(t => ({ ...t, basis: 'aggregation',
      underlyingBases: [...new Set(t.edgeIds.map(id => edges[id]?.basis))],
      sources: [...new Set(t.edgeIds.flatMap(id => edges[id]?.sources || []))] }));
    model.questions = a.questions;
    return model;
  }
  function indices(m) { return { nodes: Object.fromEntries(m.nodes.map(n => [n.id, n])),
    edges: Object.fromEntries(m.edges.map(e => [e.id, e])), sources: Object.fromEntries(m.sources.map(s => [s.id, s])),
    situations: Object.fromEntries(m.actionSituations.map(s => [s.id, s])) }; }
  function allowed(e, filters = {}) {
    return (filters.basis !== 'documented' || e.basis === 'documented') &&
      (!filters.group || filters.group === 'all' || e.group === filters.group) &&
      (!filters.mode || filters.mode === 'all' || e.institutionalMode === filters.mode);
  }
  function incident(m, id, filters = {}) { return m.edges.filter(e => (e.source === id || e.target === id) && allowed(e, filters)); }
  function neighborhood(m, id, filters = {}, page = 0) {
    const all = incident(m, id, filters), incoming = all.filter(e => e.target === id), outgoing = all.filter(e => e.source === id);
    const pages = Math.max(1, Math.ceil(incoming.length / 4), Math.ceil(outgoing.length / 4));
    const current = Math.max(0, Math.min(pages - 1, Number.isFinite(page) ? page : 0));
    return { incoming: incoming.slice(current * 4, current * 4 + 4), outgoing: outgoing.slice(current * 4, current * 4 + 4),
      page: current, pages, total: all.length };
  }
  function path(m, start, end, filters = {}) {
    const ids = new Set(m.nodes.map(n => n.id));
    if (!ids.has(start) || !ids.has(end)) return null;
    const adj = Object.fromEntries([...ids].map(id => [id, []]));
    m.edges.filter(e => allowed(e, filters)).forEach(e => adj[e.source].push(e));
    const q = [start], prev = new Map([[start, null]]);
    for (let i = 0; i < q.length; i++) {
      if (q[i] === end) break;
      for (const e of adj[q[i]]) if (!prev.has(e.target)) { prev.set(e.target, e); q.push(e.target); }
    }
    if (!prev.has(end)) return null;
    const result = []; let current = end;
    while (current !== start) { const e = prev.get(current); result.unshift(e.id); current = e.source; }
    return result;
  }
  function validate(m) {
    const errors = [], ix = indices(m), types = ['actor','process','data','rule','resource','ecology'];
    for (const [name, list] of [['node',m.nodes],['edge',m.edges],['source',m.sources],['situation',m.actionSituations],['transfer',m.transfers]]) {
      const seen = new Set();
      for (const x of list) { if (!x.id || seen.has(x.id)) errors.push(`Duplicate/missing ${name} ID: ${x.id}`); seen.add(x.id); }
    }
    for (const n of m.nodes) {
      if (!types.includes(n.type) || !n.summary) errors.push(`Bad node ${n.id}`);
      if (!ix.situations[n.home] || !n.actionSituations.includes(n.home)) errors.push(`Unassigned element ${n.id}`);
      if (!n.scales?.length || !n.institutionalMode) errors.push(`Missing qualifiers ${n.id}`);
    }
    for (const e of m.edges) {
      if (!ix.nodes[e.source] || !ix.nodes[e.target]) errors.push(`Bad endpoints ${e.id}`);
      if (!['documented','synthesis'].includes(e.basis)) errors.push(`Bad evidence basis ${e.id}`);
      if (!e.institutionalMode || !e.scales?.length) errors.push(`Missing qualifiers ${e.id}`);
    }
    for (const x of [...m.nodes, ...m.edges, ...m.actionSituations]) {
      if (!x.sources?.length || x.sources.some(id => !ix.sources[id])) errors.push(`Bad source reference ${x.id}`);
    }
    for (const s of m.actionSituations) {
      if (s.core.length > 5) errors.push(`Too many overview activities in ${s.id}`);
      if (s.members.some(id => !ix.nodes[id]) || s.core.some(id => !s.members.includes(id))) errors.push(`Bad membership ${s.id}`);
    }
    for (const t of m.transfers) {
      if (!t.edgeIds.length || !ix.situations[t.source] || !ix.situations[t.target]) errors.push(`Bad transfer ${t.id}`);
      for (const id of t.edgeIds) {
        const e = ix.edges[id];
        if (!e || ix.nodes[e.source]?.home !== t.source || ix.nodes[e.target]?.home !== t.target) errors.push(`Untraceable transfer ${t.id}/${id}`);
      }
    }
    return errors;
  }
  return { build, indices, allowed, incident, neighborhood, path, validate };
});
