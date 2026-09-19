# Amsterdam Tree Governance Explorer

A three-level research atlas of how Amsterdam manages public trees.

**Site:** https://spoonforks.github.io/TreeGovernance/

## Three levels, one underlying graph

**Level 3 — System.** Six analytical action situations, connected by seven primary handoffs. Select an arena to open it; select an arrow to inspect the original relations that support the aggregation. Four additional selected handoffs are listed separately, not crammed into the drawing.

**Level 2 — Action situations.** Activities, participants, information, rules/resources, and evidence/gaps have separate tabs. An arena is an analytical grouping, not a new municipal department or a prescribed sequence of approvals. Participants retain the same identity across overlapping arenas.

**Level 1 — Elements.** A bounded incoming/outgoing graph with at most eight relation endpoints per page. Every relation remains accessible through pagination and the textual relation list. Click to explore, drag to reposition; reset layout to restore the readable starting arrangement.

The previous v0.3 flat map remains at `legacy.html` for comparison.

## What adds analytical value

- Overview links reference underlying edge IDs; aggregation never introduces a new causal fact.
- Evidence basis, institutional mode, scope and confidence are distinct fields.
- Resources include planting stock, operational capacity and the municipal replant fund. Unknown allocations and influence are not assigned fabricated values.
- Directed route queries expose synthesis dependencies. They show structural reachability, not causal or legal entailment.
- Each arena carries explicit research questions and boundaries for practitioner validation.
- Shareable URL fragments reproduce a view. Notes remain local and are exported separately from the graph.
- Small screens use readable arena cards and relation lists rather than shrinking a whole graph.

## Data and architecture

`data/model.json` remains the original v0.3 institutional evidence graph. `data/architecture.json` is the canonical v0.4 extension: action situations, membership, scope/mode profiles, three resource nodes, six new relations, and traceable handoff definitions.

`assets/js/model-core.js` deterministically combines these into one graph. The browser's **Export model** produces that combined JSON, including the new metadata, arenas and provenance. This same pure module is callable from Node for later query/LLM integration. No LLM service is currently connected.

`data/model.js` is the generated browser copy of the original graph. After editing `data/model.json`, run `npm run sync-model`. The architecture JSON is fetched directly and does not have a duplicate generated copy.

## Local use and checks

```sh
python -m http.server 8000
npm run check
npm run standalone
```

Open `http://localhost:8000`. The split-file site needs HTTP to load JSON. The generated `tree-governance-standalone.html` also opens without a server. No runtime npm dependencies or third-party CDNs are required.

`npm run check` validates the original graph, checks JS syntax, and runs the three-level model tests. An optional browser regression script is described in `docs/THREE_LEVEL_MODEL.md`.

## Research status

The institutional claims are inherited from the v0.3 desk-research model. The new groupings and scope/mode descriptors are editorial classifications; they are not an independent factual audit. No practitioner validation, case-level compliance, budgets or influence measurements are claimed. Some base sources may become stale.

This is not an official City of Amsterdam process model or legal guidance. Private-tree governance and complete procurement/regional interfaces remain incomplete. See `docs/THREE_LEVEL_MODEL.md` for the methodology and limitations.

No reuse license has been selected. External source material retains its own rights.
