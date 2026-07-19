# Exceed Sidekick

A fast, searchable reference for **Exceed Fighting System**, built with [Docusaurus](https://docusaurus.io/).
Generated from the BGApp template (`BGApps/BGApp-template`).

## Develop

```bash
npm install
npm run start                    # http://localhost:3000/exceed-sidekick/
npm run start -- --host 0.0.0.0  # also serve on your LAN (e.g. a phone)
npm run build                    # production build into build/
npm run typecheck
```

## What's here

- **Glossary** — `src/pages/glossary.tsx`, data-driven from `src/data/glossary.json`.
- **Homepage** — `src/pages/index.tsx` (hero + nav tiles + random card art).
- **Hacking a Card** — card-review blog under `blog/`, components in `src/components/`.
- **Guides** — `docs/*.md`.

## Data pipeline (per game — the real work)

The glossary and card data are **not** shipped by the template. Build them under `pipeline/`
and write the results to `src/data/glossary.json` and `src/data/cards.json`.
See [pipeline/README.md](pipeline/README.md).

## Deploy

Push to `main` → `.github/workflows/deploy.yml` builds and deploys to GitHub Pages at
`https://webthingee.github.io/exceed-sidekick/`. Enable Pages (Source: GitHub Actions) once.
