# Three-level model, v0.4

## Purpose and design test

The model should help a non-specialist discover processes and stakeholder interactions, locate evidence, and identify useful interview questions. More nodes are not automatically an improvement. Each new arena must answer a governing question and allow the user to reach its evidence-bearing elements.

The architecture is inspired by Michael McGinnis (2011), *Networks of Adjacent Action Situations in Polycentric Governance*, https://doi.org/10.1111/j.1541-0072.2010.00396.x. The separation of entities, activities, actors and provenance also takes inspiration from W3C PROV-O, https://www.w3.org/TR/prov-o/. This is neither a complete IAD formalisation nor a conformant PROV-O ontology.

## What the levels mean

System → action situation → element is a navigation hierarchy, not a hierarchy of authority. Action situations can overlap. A single stable actor ID can appear in multiple situations without creating duplicate actors or implying a new institutional relationship.

Each element has one `home` for deterministic overview aggregation and an `actionSituations` membership list. The home is an editorial display convention, not an exclusive jurisdiction.

## Contract

The base graph is in `data/model.json`. The extension is in `data/architecture.json`. `TreeGov.build(base, extension)` returns the unified graph; UI and tests use the same builder.

Nodes retain their original identifiers, labels, summaries, sources and confidence. Profiles add `home`, `scales`, `institutionalMode` and overlapping memberships. Actor capacity fields remain null until supported. Every node and relation has `observedInPractice: null`: desk research is not field observation.

Relations retain their source, target and evidence basis. The added institutional-mode tags distinguish formal rules/authority, policy requirements, reported practice, analytical abstractions and unknown classifications. These tags are editorial interpretations, not source verification. Most relation-level scales remain `not_assessed` rather than being inferred from endpoints. Element-scale profiles provide the first usable scope filter.

Each action situation records a governing question, core activities, contextual members, source references, intended outcomes and research gaps. Category tabs do not imply a compulsory sequence of activities.

Each overview transfer records source arena, target arena and `edgeIds`. Validation checks that every underlying source and target has the corresponding primary home. Evidence status is derived from those edges. A transfer is an aggregation, not an additional institutional assertion.

## Resources

The three resource concepts are planting stock, operational capacity and the municipal replant fund. The first and last are linked to existing sources S4 and S23. Operational capacity and its enabling relationship are explicitly synthesis, grounded in the existing staffing/contract context rather than measured capacity. No budget amounts or staffing totals are asserted.

The replant fund is not represented as the general maintenance budget. Its compensation and planting links are conditional. See https://lokaleregelgeving.overheid.nl/CVDR697591 for the policy context.

## Avoiding false conclusions

A source reference does not establish that a process happened in a particular case. Documented is not the same as formal; formal is not proof of compliance. A missing mapped relation is not proof that no real relationship exists. Co-membership does not establish influence or responsibility. A directed graph path is structural reachability across heterogeneous relations, not automatic causal composition.

The first example route starts at the citizen report, not at the resident actor, to avoid mistaking the existing “views a tree passport” relation for a reporting mechanism.

## Readability contract

The default system drawing contains six arena cards and seven primary links. Additional selected handoffs are in a separate list. An arena shows at most five core activities; other categories are in tabs. Element diagrams show up to four incoming and four outgoing endpoints, with explicit pagination. Long descriptions and evidence sit outside the graph. On narrow screens the UI switches to cards and a relation list.

The legacy graph is preserved rather than overwritten, including its earlier lenses. The new abstraction does not require all local views to be connected or fabricate links to remove genuine research gaps.

## Validation and browser checks

Run `npm run check` for the base validator, JavaScript syntax and Node tests. They cover identity preservation, membership, transfer provenance, pagination coverage, directed paths, evidence filters and unknown-value handling.

`tests/browser-smoke.py` runs the standalone page in Chromium through Playwright. It can use `CHROMIUM_PATH` or the Playwright-installed browser. It covers all arenas/tabs and element views, node clicking, dragging without selecting text, route filters, source search, export separation, and responsive overflow. Install Playwright separately to run it; it is not a website dependency.

## Not yet implemented

No stakeholder claims database, collaborative editing, case timeline, procurement expansion, institutional-grammar rule parser, inference engine or LLM connection has been added. These require additional evidence and design decisions rather than a decorative extra layer.
