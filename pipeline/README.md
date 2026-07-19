# Data pipeline — Exceed Fighting System

The template ships the **shell** (UI, build, deploy) but no game data. This directory is where
you build the two data sources the site reads. Nothing here is published — it's local tooling.

## 1. Glossary → `src/data/glossary.json`

Parse Exceed Fighting System's rules document into an array of entries. Each entry:

```jsonc
{
  "slug": "ambush",              // url-safe id, unique
  "name": "Ambush",              // display heading
  "definition": "…",             // body text; "(see: X)" inline refs auto-link
  "examples": [], "notes": [], "bullets": [],
  "seeAlso": [],                 // extra cross-referenced slugs
  "isKeyword": true,             // drives the Keywords filter chip
  "isAbility": false,            // drives the Abilities filter chip
  "category": "A"                // first letter, for the A–Z view
}
```

Curate an explicit keyword list (like UVS's `KEYWORDS` set) — `isKeyword`/`isAbility` come from
that list, not from guessing. Reference implementation: `UVSApp/scripts/extract-glossary.mjs`
(tuned to the UVS PDF; the parsing will differ for your source, but the output shape is the same).

## 2. Cards → `src/data/cards.json`

Fetch the card list from the game's card database. Each card:

```jsonc
{ "name": "Card Name", "set": "set-code", "num": "123" }
```

`set` + `num` must slot into the image URL configured as `https://level99games.com/cards/<set>/<num>.jpg`
in `src/pages/index.tsx` and `src/components/RandomCard/index.tsx`. Reference implementation:
`UVSApp/uvsCardFetcher/` (Python, hits universus.cards).

## Suggested layout

```
pipeline/
├─ Reference/   ← rules PDFs (git-ignored)
├─ output/      ← intermediate JSON (git-ignored)
├─ extract-glossary.mjs
└─ fetch-cards.*
```
