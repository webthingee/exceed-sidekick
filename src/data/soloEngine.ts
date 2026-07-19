// The shared solo AI engine for Exceed Fighting System, structured as
// phases → steps for the <TurnWalkthrough> stepper.
//
// Source: "Exceed Solo Mode" by Michael Kelley (One Stop Co-Op Shop), the
// unofficial solo rules for seasons 3–7. This file holds only the *shared*
// engine — the rules identical for every AI fighter. Each fighter's overrides
// (season rules, Turn Resolution, Card Clarifications) live in soloFighters.ts.
//
// The engine is the same for all opponents; a fighter only ever *overrides* it,
// so steps here flag where fighters commonly change the rule (striking range,
// exceeding, the strike) via the `override` note.

// A collapsible branch of an action (e.g. the Read / Panic read-check outcomes).
export type Outcome = {
  id: string; // 'read' | 'panic' — matched against the rolled outcome
  name: string;
  desc: string;
};

export type TurnAction = {
  id?: string; // optional marker (e.g. 'readcheck') for roll logic
  name: string;
  desc: string;
  // Collapsible outcomes shown under this action; the rolled one opens + highlights.
  outcomes?: Outcome[];
};

// A 2D lookup grid (e.g. the action chart: range rows × roll-vs-hand columns).
export type Chart = {
  rowHeader: string; // top-left cell label, e.g. "Range"
  cols: string[]; // column headers
  rows: {label: string; sub?: string; cells: string[]}[];
};

export type Step = {
  id: string;
  title: string;
  detail: string;
  bullets?: string[];
  actions?: TurnAction[];
  chart?: Chart; // rendered as a grid when present
  // When a step folds several engine concepts together, list the other step ids
  // it covers so fighter overrides tagged to those ids still surface here.
  coversSteps?: string[];
  roll?: boolean; // this step rolls the action d6 — show "Roll Result = N" + reroll
  readRoll?: boolean; // this step uses the strike read-check d6 (read 1–2 / panic 3–6)
  ref?: string; // rules citation, e.g. "Solo · AI Turn"
  // 'repeat' steps loop as you resolve the turn; 'round' steps are once-per-turn
  // bookends. Left mostly unused here (the AI turn isn't a strict alternation),
  // but kept so the shared component's badges still work.
  tag?: 'repeat' | 'round';
  // Optional callout: many fighters override this step. Shown as a highlighted
  // note so a solo player knows to check their fighter's AI card.
  override?: string;
};

export type PhaseKind = 'setup' | 'loop' | 'end';

export type Phase = {
  id: string;
  name: string; // full name, e.g. "The AI's Turn"
  short: string; // compact label for the progress rail
  kind: PhaseKind;
  blurb: string;
  steps: Step[];
};

export type Walkthrough = {
  id: string;
  title: string;
  subtitle: string;
  phases: Phase[];
};

export const SOLO_ENGINE: Walkthrough = {
  id: 'engine',
  title: 'The AI Engine',
  subtitle: 'The shared turn flow every AI fighter follows — your fighter only overrides it.',
  phases: [
    {
      id: 'setup',
      name: 'Setup',
      short: 'Setup',
      kind: 'setup',
      blurb: 'Once, before the battle.',
      steps: [
        {
          id: 'choose',
          title: 'Choose the fighters',
          detail:
            'Pick the character you play and the character the AI plays (it must be a supported season 3–7 fighter). Review that fighter’s season rules and AI card.',
          ref: 'Solo · Setup',
        },
        {
          id: 'deal',
          title: 'Set up as normal',
          detail:
            'Shuffle both decks, deal each a starting hand, and set both life totals to 30. Deal the AI’s hand facedown.',
          bullets: ['The AI never mulligans its opening hand.'],
          ref: 'Solo · Setup',
        },
        {
          id: 'ai-hand',
          title: 'Keep the AI hand facedown',
          detail:
            'The number of cards in the AI’s hand drives its actions, so keep its hand facedown but spread out so you can see the count at a glance.',
          ref: 'Solo · AI Hand',
        },
      ],
    },
    {
      id: 'ai-turn',
      name: 'The AI’s Turn',
      short: 'AI Turn',
      kind: 'loop',
      blurb: 'One roll decides the action: Move, Strike, or Boost and Draw.',
      steps: [
        {
          id: 'resolve',
          coversSteps: ['range', 'roll', 'exceed', 'chart'],
          roll: true,
          title: 'Check range, roll & resolve',
          detail:
            'Check the AI’s range to you, then roll one d6 and compare it to the cards in the AI’s hand. This single roll resolves the turn:',
          bullets: [
            'Range picks the chart row — striking is 1–3, moving is 4+ (many fighters differ; see below).',
            'Exceed check first — an odd roll (1, 3, 5) with enough gauge means the AI exceeds and ignores the chart. (Seasons 5–7 add conditions.)',
            'Otherwise read the chart: the range row × your roll-vs-hand column gives the action.',
          ],
          chart: {
            rowHeader: 'Range',
            cols: ['🎲 < hand', '🎲 = hand', '🎲 > hand'],
            rows: [
              {label: 'Striking range', sub: '1–3 default', cells: ['Strike', 'Strike', 'Boost and Draw']},
              {label: 'Moving range', sub: '4+ default', cells: ['Move', 'Strike', 'Boost and Draw']},
            ],
          },
          override:
            'Many fighters change this — a wider striking range, exceed timing, the chart result, or a character action. Check your fighter.',
          ref: 'Solo · AI Turn',
        },
      ],
    },
    {
      id: 'move',
      name: 'Move',
      short: 'Move',
      kind: 'loop',
      blurb: 'Advance, then discard for the distance moved.',
      steps: [
        {
          id: 'move',
          title: 'Resolve a Move',
          detail:
            'Resolve a Move action in three steps, then end the turn (no end-of-action draw):',
          actions: [
            {name: '1. Advance', desc: 'Advance a number of spaces equal to the die rolled (an advance — no extra cost to pass you).'},
            {name: '2. Discard', desc: 'Discard cards from hand equal to HALF the spaces advanced, rounded down.'},
            {name: '3. No draw', desc: 'Do NOT draw a card at the end of this action.'},
          ],
          ref: 'Solo · Move',
        },
      ],
    },
    {
      id: 'strike',
      name: 'Strike',
      short: 'Strike',
      kind: 'loop',
      blurb: 'When either fighter strikes — read or panic, then find an effective card.',
      steps: [
        {
          id: 'strike-seq',
          readRoll: true,
          coversSteps: ['read-check', 'panic', 'read'],
          title: 'The strike sequence',
          detail:
            'Whenever a strike happens (AI- or player-initiated), work through these steps in order:',
          actions: [
            {name: '1. Set ability', desc: 'If the AI initiated and qualifies for a set ability, it resolves now.'},
            {name: '2. Player sets', desc: 'You set your attack (resolving any on-set abilities). If wild swinging, flip and pick first.'},
            {
              id: 'readcheck',
              name: '3. Read Check',
              desc: 'Roll a separate d6 — 1–2 the AI reads, 3–6 it panics (face-up attack → auto-read). The rolled outcome opens; tap the other to compare.',
              outcomes: [
                {id: 'read', name: 'Read · roll 1–2', desc: 'The AI considers all abilities AND your played attack, then plays the first flipped card that WINS (deals more than it suffers). If none win, it takes the closest damage trade (leftmost on ties) — never a card that would lose it the game.'},
                {id: 'panic', name: 'Panic · roll 3–6', desc: 'Flip left to right; the first attack IN RANGE of your current space is played. It ignores your card’s effects (except ones already in play before the strike). Block is always effective; Dive is effective if it advances past you.'},
              ],
            },
            {name: '4. Find effective', desc: 'Flip AI hand cards one at a time, keeping order, until an effective card appears — else wild swing.'},
            {name: '5. Refill', desc: 'Discard the flipped AI cards and draw an equal number of facedown cards.'},
          ],
          override:
            'Set abilities are most common for season 3 (Street Fighter) Critical abilities. Check your fighter.',
          ref: 'Solo · Strike · Read Check',
        },
      ],
    },
    {
      id: 'boost-draw',
      name: 'Boost & Draw',
      short: 'Boost',
      kind: 'loop',
      blurb: 'Flip a boost off the deck, then draw two.',
      steps: [
        {
          id: 'boost-draw',
          title: 'Resolve Boost and Draw',
          detail:
            'Flip the top card of the AI’s DECK and resolve its boost if it can afford it and it has an effect, then draw 2 cards total.',
          bullets: [
            'If a boost makes the AI strike and it has 0–2 cards, ignore the boost — it just draws 2 instead.',
            'If a boost grants an extra action, don’t draw 2 — resolve a new AI turn (roll again on the chart).',
          ],
          ref: 'Solo · Boost and Draw',
        },
      ],
    },
    {
      id: 'reference',
      name: 'Reference',
      short: 'Reference',
      kind: 'end',
      blurb: 'Tie-breakers and special cards the AI uses across every turn.',
      steps: [
        {
          id: 'priorities',
          title: 'AI choice priorities',
          detail:
            'When a choice isn’t covered by the fighter’s AI card, use the first rule that applies:',
          actions: [
            {name: '1', desc: 'Deal as much damage to you as possible.'},
            {name: '2', desc: 'Suffer as little damage as possible.'},
            {name: '3', desc: 'Gain as much as possible (cards, gauge, advantage), then spend as little.'},
            {name: '4', desc: 'Move the AI toward the center of the arena, avoiding danger spaces.'},
            {name: '5', desc: 'Move you farther from the center.'},
            {name: '6', desc: 'Roll to decide if still tied.'},
          ],
          ref: 'Solo · AI Choices',
        },
        {
          id: 'costs',
          title: 'Force and gauge costs',
          detail:
            'When the AI pays a force cost it discards random cards from hand (an ultra still counts as 2 force, so it may overpay). It spends the leftmost gauge card and saves ultras for last.',
          bullets: [
            'It only spends gauge on force costs if it has already exceeded and has more gauge than its most expensive ultra.',
          ],
          ref: 'Solo · Costs',
        },
        {
          id: 'normals',
          title: 'Normal attacks & boosts',
          detail: 'Special handling for common cards:',
          actions: [
            {name: 'Block', desc: 'Always effective when revealed during a panic.'},
            {name: 'Dive', desc: 'Panic: effective if the advance would take the AI past you.'},
            {name: 'Tech / Tech Hit', desc: 'Discard your highest force-cost boost (randomize ties).'},
            {name: 'Reading', desc: 'AI plays it → reveal a random card of yours; a basic forces a read. Against AI → name a card, force it if held.'},
            {name: 'Parry', desc: 'AI plays it → you discard a random card. Against AI → name a card, discard it if held, then refresh its hand.'},
          ],
          ref: 'Solo · Normal Attacks and Boosts',
        },
        {
          id: 'other',
          title: 'Other engine rules',
          detail: 'A few whole-game rules that always apply:',
          bullets: [
            'Reshuffling: the AI reshuffles freely and never loses from doing so. You still lose on a second reshuffle.',
            'EX attacks (optional): after picking an effective strike, flip the rest of the hand; a second copy that isn’t useless to EX is played as an EX attack.',
            'Danger spaces: spaces with your traps/allies/negative cards; the AI avoids them (priority #4) unless every move lands on one.',
            'Range modifiers: continuous boosts that shift min/max range slide the striking/moving rows accordingly.',
          ],
          ref: 'Solo · Reshuffling · EX · Danger Spaces',
        },
      ],
    },
  ],
};

// A game ends the moment a fighter hits 0 life. Shown as a persistent note.
export const END_NOTE =
  'First fighter to reduce the opponent to 0 life wins. The AI can reshuffle any number of times without losing — you still lose on a second reshuffle.';
