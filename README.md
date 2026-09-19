# Amsterdam Tree Governance Explorer

Interactive research prototype for exploring how Amsterdam manages public trees across policy, design, monitoring, maintenance, permitting, participation and ecological feedback.

**Live site (after GitHub Pages is enabled):** https://spoonforks.github.io/TreeGovernance/

## Model

This is a typed governance graph, not only a stakeholder network. It separates **actors**, **processes**, **data/objects**, **rules/policies**, and **ecological objects/outcomes**. Relations are typed and record provenance, confidence, and whether they are directly **documented** or are a research **synthesis**.

This is not an official City of Amsterdam organization chart.

## Explore

- Click a node for its summary, sources and direct relations.
- Click-and-drag a node to reposition it.
- Pan and zoom the canvas.
- Switch lenses for lifecycle, governance, information, participation, projects, permits, biodiversity and policy.
- Use 1-hop / 2-hop focus and the path finder.
- Toggle **documented edges only** to remove interpretive synthesis edges.

## Data

The canonical graph is [`data/model.json`](data/model.json). The site loads [`data/model.js`](data/model.js), generated from the same data.

See [`docs/SCHEMA.md`](docs/SCHEMA.md), [`docs/MODELING_NOTES.md`](docs/MODELING_NOTES.md), and [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Edit and validate

```bash
npm run sync-model
npm run validate
```

No npm dependencies are required.

## GitHub Pages

Open **Settings → Pages**, choose **Deploy from a branch**, then select **main** and **/(root)**.

## License

No reuse license has been selected yet.
