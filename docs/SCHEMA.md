# Graph schema

## Node
Required fields: `id`, `label`, `type`, `group`, `summary`, `why`, `lenses[]`, `sources[]`, `confidence`.

Node types: `actor`, `process`, `data`, `rule`, `ecology`.

Optional: `translation` for English glosses of Dutch names or acronyms.

## Relation
Required fields: `id`, `source`, `target`, `label`, `group`, `basis`, `confidence`, `sources[]`, `lenses[]`, `evidence`.

Relation groups: `authority`, `information`, `operation`, `participation`, `resource`, `ecology`.

`basis` is either `documented` or `synthesis`.

## Principle
Processes, data, rules and ecological states are first-class objects. This keeps the analytical model independent from the SVG layout and makes later graph queries or LLM-assisted inference possible.
