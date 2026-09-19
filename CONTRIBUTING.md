# Contributing

This is a research prototype, not an official municipal process map.

For institutional claims, edit `data/model.json`; keep stable IDs and cite primary evidence. Run `npm run sync-model` after editing it.

For the three-level organisation, edit `data/architecture.json`. Arena membership is an analytical grouping, not proof of responsibility. Overview handoffs must cite actual edge IDs. Do not invent relations merely to connect a picture.

Run `npm run check` before committing. The optional `tests/browser-smoke.py` exercises the UI through Playwright.

Keep documented evidence, analytical synthesis, formal requirements and observed practice distinct. Leave unknown budgets, capacity and influence as null. New Dutch terms should have an English explanation. Notes and flags are private browser annotations, not reviewed model facts.
