/* Both renderers use one composition function, the same IDs and source records. */
(function () {
  'use strict';
  const originalBuild = TreeGov.build;
  TreeGov.build = function (base, architecture) {
    const model = originalBuild(base, architecture);
    const resourceLenses = {
      res_stock: ['lifecycle','operations'],
      res_capacity: ['lifecycle','operations','governance'],
      res_fund: ['lifecycle','operations','permits','information','governance']
    };
    const nodes = Object.fromEntries(model.nodes.map(n => [n.id,n]));
    for (const [id,lenses] of Object.entries(resourceLenses)) {
      if (nodes[id]) nodes[id].lenses = lenses;
    }
    for (const edge of model.edges) {
      if (resourceLenses[edge.source] || resourceLenses[edge.target]) {
        edge.lenses = (nodes[edge.source].lenses || []).filter(l => (nodes[edge.target].lenses || []).includes(l));
      }
    }
    return model;
  };
  window.TREE_GOV_READY = (async function () {
    let architecture = window.TREE_GOV_ARCHITECTURE;
    if (!architecture) {
      const r = await fetch('data/architecture.json?v=0.4');
      if (!r.ok) throw new Error('Cannot load shared model: HTTP '+r.status);
      architecture = await r.json();
    }
    window.TREE_GOV_ARCHITECTURE = architecture;
    const model = TreeGov.build(window.TREE_GOV_MODEL, architecture);
    const errors = TreeGov.validate(model);
    if (errors.length) throw new Error(errors.join('; '));
    window.TreeGovernance = {model, queryPath:(s,t,filters) => TreeGov.path(model,s,t,filters)};
    const status = document.getElementById('modelStatus');
    if (status) status.textContent = model.nodes.length+' elements / '+model.edges.length+' relations';
    return model;
  })();
  // Each renderer displays the error; handle the shared promise too.
  window.TREE_GOV_READY.catch(() => {});
})();
