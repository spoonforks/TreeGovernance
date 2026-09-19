const fs = require("fs");
const model = JSON.parse(fs.readFileSync("data/model.json", "utf8"));
const errors = [];
const nodeTypes = new Set(["actor","process","data","rule","ecology"]);
const edgeGroups = new Set(["authority","information","operation","participation","resource","ecology"]);
const bases = new Set(["documented","synthesis"]);
const confidence = new Set(["high","medium","low"]);

function checkUnique(items, kind) {
  const seen = new Set();
  for (const x of items) {
    if (!x.id) errors.push(kind + " missing id");
    else if (seen.has(x.id)) errors.push("Duplicate " + kind + " id: " + x.id);
    seen.add(x.id);
  }
}
checkUnique(model.sources || [], "source");
checkUnique(model.nodes || [], "node");
checkUnique(model.edges || [], "edge");

const sourceIds = new Set((model.sources || []).map(x => x.id));
const nodeById = Object.fromEntries((model.nodes || []).map(x => [x.id, x]));

for (const n of model.nodes || []) {
  if (!nodeTypes.has(n.type)) errors.push("Invalid node type: " + n.id);
  if (!confidence.has(n.confidence)) errors.push("Invalid node confidence: " + n.id);
  if (!(n.sources || []).length) errors.push("Node has no sources: " + n.id);
  for (const s of n.sources || []) if (!sourceIds.has(s)) errors.push("Unknown source " + s + " on node " + n.id);
}
for (const edge of model.edges || []) {
  if (!nodeById[edge.source]) errors.push("Unknown source node " + edge.source + " on " + edge.id);
  if (!nodeById[edge.target]) errors.push("Unknown target node " + edge.target + " on " + edge.id);
  if (!edgeGroups.has(edge.group)) errors.push("Invalid edge group: " + edge.id);
  if (!bases.has(edge.basis)) errors.push("Invalid basis: " + edge.id);
  if (!confidence.has(edge.confidence)) errors.push("Invalid edge confidence: " + edge.id);
  if (!(edge.sources || []).length) errors.push("Edge has no sources: " + edge.id);
  for (const s of edge.sources || []) if (!sourceIds.has(s)) errors.push("Unknown source " + s + " on edge " + edge.id);
  if (nodeById[edge.source] && nodeById[edge.target]) {
    for (const lens of edge.lenses || []) {
      if (!(nodeById[edge.source].lenses || []).includes(lens) || !(nodeById[edge.target].lenses || []).includes(lens)) {
        errors.push("Ineffective lens tag " + lens + " on " + edge.id + " (both endpoints must belong to the lens)");
      }
    }
  }
}

function componentCount(nodes, edges) {
  if (!nodes.length) return 0;
  const ids = new Set(nodes.map(x => x.id));
  const adj = Object.fromEntries(nodes.map(x => [x.id, []]));
  for (const edge of edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) continue;
    adj[edge.source].push(edge.target); adj[edge.target].push(edge.source);
  }
  const seen = new Set(); let count = 0;
  for (const node of nodes) {
    if (seen.has(node.id)) continue;
    count++;
    const q=[node.id]; seen.add(node.id);
    while(q.length) for (const y of adj[q.pop()] || []) if (!seen.has(y)) { seen.add(y); q.push(y); }
  }
  return count;
}

if (componentCount(model.nodes || [], model.edges || []) > 1) errors.push("Whole graph is disconnected.");

const lenses = [...new Set((model.nodes || []).flatMap(x => x.lenses || []))].sort();
for (const lens of lenses) {
  const nodes = model.nodes.filter(x => (x.lenses || []).includes(lens));
  const ids = new Set(nodes.map(x => x.id));
  const edges = model.edges.filter(x => ids.has(x.source) && ids.has(x.target) && (x.lenses || []).includes(lens));
  const c = componentCount(nodes, edges);
  if (c > 1) errors.push("Lens '" + lens + "' has " + c + " disconnected components.");
}

const expectedJs = "window.TREE_GOV_MODEL = " + JSON.stringify(model, null, 2) + ";\n";
if (!fs.existsSync("data/model.js") || fs.readFileSync("data/model.js","utf8") !== expectedJs) {
  errors.push("data/model.js is out of sync with data/model.json; run npm run sync-model.");
}

if (errors.length) {
  console.error("\nModel validation failed:");
  for (const x of errors) console.error("- " + x);
  process.exit(1);
}
console.log("Model valid:", model.nodes.length, "nodes,", model.edges.length, "relations,", model.sources.length, "sources,", lenses.length, "connected lenses.");
