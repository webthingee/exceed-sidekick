# Notes / TODO

## Solo Turn Order — verify fighter override step-tagging

The base solo engine (`src/data/soloEngine.ts`) models Exceed's core loop, but
**seasons 6–7 use mechanics the engine doesn't natively represent** — character
actions (CA), Overdrive, key cards, Boost & Cancel. Each affected fighter's Turn
Resolution notes in `src/data/soloFighters.ts` were tagged to the *closest* engine
step (usually `chart` "The action chart" or `exceed` "Exceeding"), with the full rule
text preserved. **The step placement is best-effort and needs review.**

Go back and check that each fighter's overrides surface on the right walkthrough step
in `/turn-order`. Priorities:

- [ ] **Season 6 (Under Night)** — CA-heavy fighters: Chaos, Enkidu, Gordeau, Hilda,
      Hyde, Linne, Londrekia, Merkava, Mika, Nanase, Orie, Phonon, Seth, Vatista,
      Wagner, Waldstein, Yuzuriha. Confirm key-card fighters (Enkidu, Hyde, Linne,
      Orie, Wagner, Yuzuriha) read correctly with the season key-card rules.
- [ ] **Season 7 (Guilty Gear)** — Boost-and-Cancel fighters: confirm the "boosts and
      cancels if action roll ≤ gauge" notes land sensibly (Ky, Sol, Baiken, etc.), and
      the "will not exceed / will not cancel" fighters (Faust, Jack-O', Giovanna,
      Happy Chaos, Chipp) are clear.
- [ ] Spot-check a few S3–S5 fighters too, since those map more cleanly.

Also verify the extracted text itself against `pipeline/Reference/exceedSolo.md`
(this was a hand transcription of ~67 fighters — watch for wording/number errors).

## Deferred features (per user, not yet)

- [ ] **Die roller** — a d6 button on the action-chart / read-check steps that resolves
      the AI's action given range + hand size, dims the other options, and folds in
      chart-changing fighters (C. Viper, Ken, Ryu, Guile, and the S6/S7 CA fighters).
      User asked to hold on this.
- [ ] **Glossary** — still to build (like the sibling apps).
- [ ] Possible **standard 2-player turn order** alongside the solo one.

