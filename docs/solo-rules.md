---
title: Solo Rules
sidebar_position: 3
---

# Exceed — Solo Rules

Battle most characters from **seasons 3–6** (and Guilty Gear) against a rules-driven
**AI fighter**. You still play your own character normally; these rules only define how the
AI opponent behaves. You'll need a **d6**.

> **Just want to run a turn?** The [interactive Turn Order](/turn-order) walks the AI's turn
> step by step and folds in your chosen fighter's specific rules. This page is the full
> written reference behind it.

These are unofficial solo rules by **Michael Kelley (One Stop Co-Op Shop)**. Season 1–2
characters can be played by *you*, but aren't supported as AI fighters.

---

## The engine in one glance

Except where a rule below (or a fighter's AI card) says otherwise, **the AI follows all normal
game rules** — including drawing a card after non-strike actions.

| | |
|---|---|
| **Win/Lose** | First to reduce the opponent to 0 life wins. The AI may reshuffle any number of times without losing; you still lose on a second reshuffle. |
| **Hand** | The AI's hand is kept **facedown but spread**, so you can see its size at a glance — hand size drives its actions. |
| **Turn** | Check range → roll a d6 vs. hand size → resolve one action from the chart. |

---

## Setup

Choose your character and a supported AI character. Set up as normal: shuffle both decks, deal
each a hand (the **AI's facedown**), and set both life totals to **30**. The **AI never
mulligans**.

**Force & gauge costs.** When the AI pays a force cost, it discards **random** cards from hand
(an ultra still counts as 2 force, so it may overpay). It spends the **leftmost** gauge card and
saves ultras for last. It only spends gauge on force costs if it has already exceeded *and* has
more gauge than its most expensive ultra.

---

## The AI's turn

**1. Check the range.** Striking range is **1–3**; moving range is **4+** (defaults — many
fighters differ). This picks the chart row.

**2. Roll a d6 and compare to hand size** — less than, equal to, or greater than.

**3. Exceed check.** If the AI can afford to exceed, it does so on any **odd roll (1, 3, 5)**,
ignoring the chart that turn. (Seasons 5–7 add conditions — see the fighter's season rules.)

**4. Resolve the action** from the chart:

| Range | Roll &lt; hand | Roll = hand | Roll &gt; hand |
|-------|:----:|:----:|:----:|
| **Striking (1–3)** | Strike | Strike | Boost and Draw |
| **Moving (4+)** | Move | Strike | Boost and Draw |

### Move
1. **Advance** a number of spaces equal to the die rolled (an advance — no extra cost to pass you).
2. **Discard** cards from hand equal to **half the spaces advanced**, rounded down.
3. **Do not draw** at the end of this action.

### Boost and Draw
1. Flip the **top card of the AI's deck** and resolve its boost if it can afford it and it has
   an effect.
2. Draw **2 cards** total (unless the boost made it strike).

- If a boost makes the AI strike and it has **0–2 cards**, ignore the boost — just draw 2.
- If a boost grants an **extra action**, don't draw 2 — resolve a new AI turn (roll again).

---

## Strikes

Whenever a strike happens (either side initiating):

1. **Set ability** — if the AI initiated and qualifies, it resolves now (most common for
   season 3 Critical abilities).
2. **You set your attack** (resolving on-set abilities; if wild swinging, flip and pick first).
3. **Read Check** (below).
4. **Find effective** — flip AI hand cards one at a time, keeping order, until an effective card
   appears. If none, the AI wild swings.
5. **Refill** — discard the flipped cards and draw an equal number facedown.

### Read Check
You roll a separate d6. On a **1–2** the AI **reads** (guessed your attack); on a **3–6** it
**panics**. Adjust these bands to tune difficulty. If you set your attack **face-up**, the AI
reads automatically — no roll.

### Panic attack (3–6)
Flip cards left to right; the first attack that is **in range** to hit your current space is
effective and is played. Out-of-range attacks are skipped. The AI considers effects on its own
cards but **ignores yours** (except effects already in play before the strike).

### Read attack (1–2)
The AI considers all abilities **and your played attack**, and picks the first flipped card that
**wins** the strike — deals more damage than it suffers (best use of its abilities, worst use of
your optional ones). If nothing wins, it takes the card with the closest damage dealt-vs-suffered
(leftmost on ties). It never treats a card as winning if that card would lose it the game.

---

## AI choice priorities

When a choice isn't covered by the fighter's AI card, use the first rule that applies:

1. Deal as much damage to you as possible.
2. Suffer as little damage as possible.
3. Gain as much as possible (cards, gauge, advantage), then spend as little.
4. Move the AI toward the **center** of the arena, avoiding **danger spaces**.
5. Move you **farther** from the center.
6. Roll to decide if still tied.

**Danger spaces** are spaces holding your traps, allies, or negative-effect cards; the AI avoids
them (priority #4) unless every move would land on one.

---

## Normal attacks & boosts

| Card | AI handling |
|------|-------------|
| **Block** | Always effective when revealed during a panic. |
| **Dive** | Panic: effective if the advance would take the AI past you. |
| **Tech / Tech Hit** | Discard your highest force-cost boost (randomize ties). |
| **Reading** | AI plays it → reveal a random card of yours; a basic forces a read attack. Against the AI → name a card and force it if the AI holds it. |
| **Parry** | AI plays it → you discard a random card. Against the AI → name a card, discard it if held, then refresh the AI's hand. |

---

## Other rules

- **EX attacks (optional):** after the AI picks an effective strike, flip the rest of its hand; a
  second copy that isn't useless to EX is played as an EX attack. Always use this for fighters
  with special EX rules.
- **Range modifiers:** continuous boosts that shift the AI's min/max range slide the
  striking/moving rows accordingly.
- **Difficulty:** widen the read band (1–3, 1–4, 1–5) to make the AI harder, or narrow it (only
  1, or never) to make it easier.

---

## Fighter AI cards

Every supported fighter overrides the engine with its own **Turn Resolution** tweaks and
**Card Clarifications**. Rather than list them all here, pick your opponent in the
[interactive Turn Order](/turn-order) — its rules are folded into the matching steps as you go.
