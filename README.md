# Amsterdam Tree Governance Explorer

One research model, two complementary views of how Amsterdam manages public trees.

**Site:** https://spoonforks.github.io/TreeGovernance/

## Two views, one system

The **Network graph** is the default (`index.html`). It retains the organic network, lenses, layouts, pan/zoom, clickable relations and draggable nodes. **Three-level** (`three-level.html`) organises the same elements into system, action-situation and element views.

Both views share the Amsterdam logo/header, the same 44 elements and 71 relations, sources, resource concepts and private notes. The header switch carries the selected element and evidence filter. Returning to Network graph in the same tab restores its lens, dragged positions and zoom, when browser session storage is available. A fresh visit to the root starts with Network graph. Old `legacy.html` links redirect there; previous root three-level URL fragments remain supported.

## Three levels

**Level 3 — System.** Six analytical action situations, connected by seven primary handoffs. Select an arena to open it; select an arrow to inspect its underlying relations. Additional handoffs are listed separately, not crammed into the drawing.

**Level 2 — Action situations.** Activities, participants, information, rules/resources and evidence/gaps have separate tabs. Arenas are analytical groupings, not official departments or prescribed approval sequences. Participants retain the same identity across overlapping arenas.

**Level 1 — Elements.** Bounded incoming/outgoing relationships with at most eight endpoints per page; every relation remains available through pagination and text lists.

## Shared data

`data/model.json` is the v0.3 institutional evidence graph. `data/architecture.json` is the v0.4 extension: action situations, scope/mode profiles, resource nodes, relations and handoff definitions. `assets/js/model-core.js` combines them. `assets/js/shared-model.js` loads and validates the combination for both renderers and assigns resource relationships to compatible network lenses. No substantive institutional claims were changed for the view integration.

Both Export model buttons export the combined JSON and exclude private notes. Notes remain in browser storage under the same key in both modes. No LLM service is connected.

## Local use and checks

```sh
python -m http.server 8000
npm run check
npm run standalone
```

Open `http://localhost:8000`. The split-file site requires HTTP to load JSON. The standalone builder exports the Three-level view with a link back to the hosted network.

`npm run check` validates the base model and runs 11 structural/provenance tests. `tests/view-switch-smoke.py` exercises the shared header, default mode, model equality, lenses, selection transfer, layout restoration and five responsive widths using offline DOM/navigation fixtures. It requires Python Playwright and Chromium; it does not test production HTTP navigation or native storage persistence. `tests/browser-smoke.py` covers the three-level standalone.

## Research status

This is a research synthesis, not an official City of Amsterdam process model or legal guidance. Institutional claims are inherited from the v0.3 desk model. Groupings and scope/mode descriptors are editorial classifications, not an independent factual audit. No practitioner validation, case-level compliance, budgets or influence measurements are claimed. Some sources may become stale. Private-tree governance and complete procurement/regional interfaces remain incomplete.

See `docs/THREE_LEVEL_MODEL.md` for methodology and limitations. No reuse license has been selected; external sources retain their rights.
