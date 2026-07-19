// Per-fighter overrides for the Exceed solo AI engine (soloEngine.ts).
//
// Source: "Exceed Solo Mode" by Michael Kelley (One Stop Co-Op Shop). Each
// season has a rule card (special rules, unsupported fighters, "AI against"
// notes) and each fighter has an AI card with Turn Resolution tweaks and Card
// Clarifications. Only the *overrides* live here — the shared engine is in
// soloEngine.ts.
//
// Turn Resolution notes are TAGGED to the engine step they change (`step`), so
// the interactive Turn Order can fold them into that step. Card clarifications
// are card-triggered, so they surface on the Strike step and in the full card.
//
// NOTE on later seasons: BlazBlue (5), Under Night (6) and Guilty Gear (7) add
// mechanics the base engine doesn't model directly — Overdrive, character
// actions ("CA"), key cards, Boost and Cancel. Those notes are still tagged to
// the closest engine step; the full text carries the detail.

// Engine step ids a fighter override can attach to (see soloEngine.ts).
export type EngineStepId =
  | 'range'
  | 'roll'
  | 'exceed'
  | 'chart'
  | 'move'
  | 'boost-draw'
  | 'strike-seq'
  | 'read-check'
  | 'panic'
  | 'read'
  | 'costs'
  | 'priorities';

export type TurnOverride = {
  step: EngineStepId; // which engine step this note modifies
  text: string;
};

export type CardClarification = {
  card: string; // card name
  note: string; // how the AI handles it
};

export type Fighter = {
  slug: string; // url-safe id, unique across all seasons
  name: string; // display name
  seasonId: string; // links to the Season it belongs to
  keyCard?: boolean; // season 6: this fighter uses "key cards"
  overrides?: TurnOverride[]; // step-tagged Turn Resolution tweaks
  cardClarifications?: CardClarification[];
};

export type Season = {
  id: string;
  name: string; // e.g. "Street Fighter"
  label: string; // e.g. "Season 3"
  number: number;
  specialRules?: string[]; // season-wide AI rules
  unsupported?: string[]; // fighters not supported as AI
  againstNotes?: string[]; // rules when the AI plays AGAINST a season fighter
};

export const SEASONS: Season[] = [
  {
    id: 'street-fighter',
    name: 'Street Fighter',
    label: 'Season 3',
    number: 3,
    specialRules: [
      'All Critical effects are set abilities. If every crit ability ends up useless for the final selected attack (e.g. bonus power when the AI plays a Block), give the AI back the 1 gauge it spent on the crit.',
    ],
    unsupported: ['Dan', 'Sagat'],
    againstNotes: ['Zangief — range 1 from Zangief is considered a danger space.'],
  },
  {
    id: 'shovel-knight',
    name: 'Shovel Knight',
    label: 'Season 4',
    number: 4,
    unsupported: ['Enchantress', 'Mole Knight', 'Specter Knight'],
    againstNotes: [
      'Specter Knight — if he used his close-2 ability and the AI panics, treat attacks with speed 0–3 as though Specter Knight had already closed when judging effective range.',
      'Mole Knight — if the AI panics when Mole Knight burrows, treat attacks with speed 0–3 as targeting the burrow’s space instead of Mole Knight’s.',
    ],
  },
  {
    id: 'blazblue',
    name: 'BlazBlue',
    label: 'Season 5',
    number: 5,
    specialRules: [
      'The AI starts with its Astral Heat card in its deck.',
      'The AI will NOT exceed if it has 0–2 cards in hand.',
    ],
    unsupported: ['Litchi', 'Nine', 'Rachel'],
    againstNotes: [
      'Carl — the AI hits Nirvana when able, unless its strike cancels your attack or deals 3+ damage.',
    ],
  },
  {
    id: 'under-night',
    name: 'Under Night In-Birth',
    label: 'Season 6',
    number: 6,
    specialRules: [
      'Exceeding — season 6 fighters exceed on an odd activation roll only if they have 3+ gauge.',
      'Reverting — they revert on an odd activation roll when their gauge is empty, adding a random card to their gauge.',
      '“CA” means character action — the unique action on the character’s main card.',
      'Key cards — Enkidu, Hyde, Linne, Orie, Wagner and Yuzuriha use “key cards”: they never spend a key card for a gauge cost unless it’s their only option; they exceed on an odd roll only with 2+ key cards in gauge (still needing 3+ gauge total); and they revert on an odd roll with zero key cards in gauge, flipping their deck for a key card instead of adding from hand (no draw after).',
    ],
    unsupported: ['Byakuya', 'Carmine'],
    againstNotes: [
      'Treat all trap boost spaces as danger spaces.',
      'Yuzuriha — when her exceeded CA is used against the AI, the AI has −2 to its read roll.',
    ],
  },
  {
    id: 'guilty-gear',
    name: 'Guilty Gear',
    label: 'Season 7',
    number: 7,
    specialRules: [
      'Boost and Cancel — when a Guilty Gear fighter rolls a “Strike” result with 3+ cards in hand and the activation roll is ≤ the cards in its gauge, it performs a Boost and Cancel instead.',
      'Boost and Cancel: flip cards from the deck until a cancelable boost appears. If resolving it leaves the AI in striking range, resolve the boost, pay 1 gauge to cancel, then strike with a −1 bonus to the read roll. If it would leave the AI out of striking range, ignore the flipped card and resolve a normal strike (no read bonus).',
    ],
    againstNotes: ['Range 1 from Potemkin is considered a danger space.'],
  },
];

export const FIGHTERS: Fighter[] = [
  // ---- Season 3 · Street Fighter ----
  {
    slug: 'akuma',
    name: 'Akuma',
    seasonId: 'street-fighter',
    cardClarifications: [
      {card: 'Gohadoken', note: 'For the boost, the AI won’t draw beyond a 5-card hand and won’t spend life to drop below 7 life.'},
      {card: 'Goshoryuken', note: 'For the boost, the AI always chooses the gauge gain.'},
      {card: 'Hyakkishu', note: 'For the boost, ignore the “now” effect.'},
    ],
  },
  {
    slug: 'c-viper',
    name: 'C. Viper',
    seasonId: 'street-fighter',
    overrides: [
      {step: 'chart', text: 'C. Viper performs a Boost and Draw action on a die roll that equals her hand size (instead of striking).'},
      {step: 'boost-draw', text: 'When she plays a continuous boost, she strikes (and does not draw 2) if she is at range 1–3 and has at least 2 cards in hand.'},
    ],
    cardClarifications: [
      {card: 'Temple Massage', note: 'For the boost, C. Viper plays the topmost card in her discard pile that has a continuous boost.'},
    ],
  },
  {
    slug: 'cammy',
    name: 'Cammy',
    seasonId: 'street-fighter',
    overrides: [
      {step: 'range', text: 'Cammy’s striking range is 1–4 when she has 3+ cards, or 1–5 when she has 5+ cards.'},
    ],
    cardClarifications: [
      {card: 'CQC', note: 'Push/pull the opponent to the furthest space away possible.'},
    ],
  },
  {
    slug: 'chun-li',
    name: 'Chun Li',
    seasonId: 'street-fighter',
    overrides: [
      {step: 'range', text: 'Chun Li’s striking range is 1–4, and 1–5 when she has 5+ cards in hand. When exceeded, increase this range by +1 for each continuous boost.'},
    ],
    cardClarifications: [
      {card: 'Lightning Legs', note: 'The Critical effect only counts (and is only paid for) if Chun Li has a NON-special boost active, or if her special boost didn’t hit (going to gauge per its hit effect).'},
    ],
  },
  {
    slug: 'guile',
    name: 'Guile',
    seasonId: 'street-fighter',
    overrides: [
      {step: 'roll', text: 'If Guile has 0–2 cards at the start of his turn and has at least 1 gauge (and cannot exceed), do NOT roll his die. Instead he spends 1 gauge, draws 2 cards, and resolves a boost from his deck. If he is exceeded at range 1–3, he then strikes; if he does not strike, he draws 2 more cards.'},
    ],
  },
  {
    slug: 'ken',
    name: 'Ken',
    seasonId: 'street-fighter',
    overrides: [
      {step: 'chart', text: 'If Ken’s activation roll equals his hand size while at range 2+, he uses his character action to close and draw (instead of striking). If exceeded, he uses his character action instead of any “strike” result while at range 1–4.'},
    ],
    cardClarifications: [
      {card: 'Hadoken', note: 'The AI will NOT use Hadoken’s choice ability (placing it on top of the deck).'},
    ],
  },
  {
    slug: 'm-bison',
    name: 'M. Bison',
    seasonId: 'street-fighter',
    overrides: [
      {step: 'boost-draw', text: 'When M. Bison completes a Boost and Draw action that did not cause a strike, after drawing 2 he adds 1 card from his hand to his gauge.'},
      {step: 'exceed', text: 'When he exceeds, he adds 0–3 cards from his hand to his gauge, not taking his hand below 2 cards.'},
    ],
    cardClarifications: [
      {card: 'Somersault Skull Diver', note: 'For the boost, you discard a random card. If it is a special or Ultra attack (not a normal), M. Bison strikes.'},
    ],
  },
  {
    slug: 'ryu',
    name: 'Ryu',
    seasonId: 'street-fighter',
    overrides: [
      {step: 'chart', text: 'If Ryu’s activation roll equals his hand size, he uses his character action to move 1 — retreating from range 1, advancing at other ranges. If exceeded, he uses it on a roll that equals or exceeds his hand size by 1, again advancing unless at range 1.'},
    ],
    cardClarifications: [
      {card: 'Hadoken', note: 'The AI will NOT use Hadoken’s ability (placing it on top of the deck).'},
    ],
  },
  {
    slug: 'vega',
    name: 'Vega',
    seasonId: 'street-fighter',
    overrides: [
      {step: 'range', text: 'Vega’s striking range is 1–4.'},
      {step: 'move', text: 'For priority #5 and move actions, Vega prefers to move toward the nearest arena edge instead of the center — even if that means retreating instead of advancing.'},
    ],
    cardClarifications: [
      {card: 'Bloody High Claw / Splendid Claw', note: 'For the boosts, pay to sustain them if Vega will have 2+ cards remaining.'},
      {card: 'Rolling Crystal Flash / Sky High Claw', note: 'For the boost, move to advance past the opponent if possible. For Sky High Claw, put the topmost continuous boost from Vega’s discard into play.'},
      {card: 'Scarlet Terror', note: 'For the boost, place Vega at range 1 from the opponent, on the side closer to an arena edge.'},
    ],
  },
  {
    slug: 'zangief',
    name: 'Zangief',
    seasonId: 'street-fighter',
    overrides: [
      {step: 'move', text: 'Zangief prioritizes being at range 1 over being closer to the center of the arena (AI priority #4).'},
    ],
    cardClarifications: [
      {card: 'Flying Power Bomb', note: 'For the boost, roll a d6 and halve it (rounded up). This is the range (1–3) that Zangief “selects”.'},
    ],
  },

  // ---- Season 4 · Shovel Knight ----
  {
    slug: 'king-knight',
    name: 'King Knight',
    seasonId: 'shovel-knight',
    overrides: [
      {step: 'boost-draw', text: 'When King Knight is at range 1–3 and rolls a 5 or 6 for Boost and Draw, he instead plays a decree if he has one available (chosen at random). This uses his ENTIRE turn — he pays no force and draws no cards.'},
    ],
    cardClarifications: [
      {card: 'Healing Hammer', note: 'Seal this card as long as King Knight has at least 2 cards in his discard pile.'},
      {card: 'Spin Jump', note: 'For the “Edict” boost, check whether King Knight’s attack is an EX attack while selecting his attack card.'},
    ],
  },
  {
    slug: 'plague-knight',
    name: 'Plague Knight',
    seasonId: 'shovel-knight',
    overrides: [
      {step: 'strike-seq', text: 'If Plague Knight has at least one card in hand after placing a strike from his hand (NOT after a wild swing), he plays a random card from his hand to use his special ability. If exceeded, he additionally discards the top card of his DECK to boost ALL strikes, even wild swings.'},
    ],
    cardClarifications: [
      {card: 'Chain Reaction', note: 'For the boost, don’t look at any cards — just add the top card of the AI’s deck to its hand and the next card to its gauge.'},
    ],
  },
  {
    slug: 'polar-knight',
    name: 'Polar Knight',
    seasonId: 'shovel-knight',
    overrides: [
      {step: 'move', text: 'When placing an Ice Spike, place it closer to the player, then closer to center. When moving an ice spike, move the one closest to the player (but not in their space), then closer to center.'},
    ],
    cardClarifications: [
      {card: 'Icicle Drop', note: 'For the boost, do not remove an ice spike on the player’s space, and don’t draw past a 5-card hand.'},
      {card: 'Stomp', note: 'Don’t remove a spike if the player initiated the strike. Removing a spike for bonus power takes precedence per normal AI priority.'},
      {card: 'Shovel Charge', note: 'For the push, push into as many spikes as possible, but make sure the AI can still remove a spike for bonus power if able.'},
    ],
  },
  {
    slug: 'propeller-knight',
    name: 'Propeller Knight',
    seasonId: 'shovel-knight',
    overrides: [
      {step: 'strike-seq', text: 'Once exceeded, Propeller Knight’s ability does NOT work as printed. Instead he gets +2 power if his attack is at maximum range OR one less than max range.'},
    ],
    cardClarifications: [
      {card: 'Saber Lunge', note: 'The AI always chooses to gain Advantage (and put the card in his gauge), even if the opponent initiated the strike.'},
      {card: 'Launcher', note: 'For the boost, roll 1d6 and move Propeller Knight half that many spaces (rounded up) toward the center — or toward the opponent if already at center.'},
      {card: 'Full Broadside', note: 'For the boost, shuffle Propeller Knight’s discard and play the topmost continuous boost.'},
    ],
  },
  {
    slug: 'shovel-knight',
    name: 'Shovel Knight',
    seasonId: 'shovel-knight',
    overrides: [
      {step: 'boost-draw', text: 'When not exceeded, after Shovel Knight finishes a Move or Boost and Draw action he moves Shield Knight 1 toward the opponent (or onto his space if he is closer). When exceeded, she moves this way at the end of EACH of his turns.'},
    ],
    cardClarifications: [
      {card: 'Tandem Attack', note: 'For the boost, place Shield Knight on Shovel Knight’s space, ignoring her normal movement priorities. She may still move afterward.'},
    ],
  },
  {
    slug: 'tinker-knight',
    name: 'Tinker Knight',
    seasonId: 'shovel-knight',
    overrides: [
      {step: 'costs', text: 'While not exceeded, Tinker Knight will NOT spend gauge for any reason if it would take him below 5 gauge.'},
    ],
    cardClarifications: [
      {card: 'Bomb Bounce', note: 'For the boost, if not exceeded, flip cards from his deck until a Special attack appears, play its boost, and discard the other flipped cards.'},
    ],
  },
  {
    slug: 'treasure-knight',
    name: 'Treasure Knight',
    seasonId: 'shovel-knight',
    overrides: [
      {step: 'costs', text: 'The AI uses free force before spending force from its hand or gauge.'},
      {step: 'move', text: 'Once Treasure Knight has exceeded, he discards 1 fewer card for his Move actions.'},
    ],
    cardClarifications: [
      {card: 'Scuttle Slam', note: 'For the boost, add ALL AI gauge cards to hand, shuffle, then place random cards back in the gauge (adding the top discard as normal).'},
      {card: 'Treasure Coin', note: 'For the boost, add a random card from the AI discard pile to hand, shuffling the hand afterward.'},
    ],
  },

  // ---- Season 5 · BlazBlue ----
  {
    slug: 'arakune',
    name: 'Arakune',
    seasonId: 'blazblue',
    overrides: [
      {step: 'strike-seq', text: 'Arakune always adds cards to overdrive when able, unless they can be added to gauge instead. When exceeded he ignores his overdrive ability, and when choosing an attack he searches overdrive for matching speed and considers the bonuses. If the final attack has no speed match, discard a random overdrive card.'},
    ],
    cardClarifications: [
      {card: 'permutation n, r', note: 'For the boost, if you choose the second option, Arakune’s next attack gets −2 to the read check.'},
      {card: 'f piecewise', note: 'Ignore the “now” portion of the boost.'},
      {card: 'f of g', note: 'For the “hit” effect, shuffle the discard and choose 3 cards at random.'},
      {card: 'f inverse', note: 'For the boost, seal the top card of Arakune’s deck, add the next to his gauge, and the third to his overdrive.'},
    ],
  },
  {
    slug: 'bang',
    name: 'Bang',
    seasonId: 'blazblue',
    overrides: [
      {step: 'range', text: 'Bang’s striking range is 1–4 when he has 5+ cards.'},
      {step: 'boost-draw', text: 'When Bang takes a Boost and Draw action, discard 1 card from the top of his deck at the end of the action.'},
      {step: 'exceed', text: 'When Bang exceeds, he spends special cards in his gauge when able. His Overdrive shuffles the gained cards into his hand.'},
    ],
    cardClarifications: [
      {card: 'Infinite Chaos — Fist of the Void', note: 'On the hit effect, Bang adds the topmost special card from his discard pile.'},
      {card: 'Bang Style Shuriken', note: 'For the attack, Bang plays a random boost from his hand. For the boost, he always chooses to take another action.'},
    ],
  },
  {
    slug: 'carl',
    name: 'Carl',
    seasonId: 'blazblue',
    overrides: [
      {step: 'range', text: 'If Nirvana is within 1 range of the opponent, Carl always uses the Striking Range row for activation, regardless of his own range.'},
      {step: 'boost-draw', text: 'Nirvana moves toward the opponent (never onto their space). When not exceeded, Carl moves her after a Move or Boost and Draw action; when exceeded, any time he rolls a Strike (and on each Overdrive trigger). He flips Nirvana to active whenever given the option.'},
    ],
    cardClarifications: [
      {card: 'Laetabilis Cantata', note: 'Carl moves Nirvana unless she is at range 0–1 from the opponent.'},
      {card: 'Con Fuoco', note: 'For the boost, if given a choice, Carl only passes the opponent if it puts Nirvana on the opposite side.'},
      {card: 'Cantabile', note: 'Carl ignores this boost if it takes Nirvana further from the opponent.'},
    ],
  },
  {
    slug: 'hakumen',
    name: 'Hakumen',
    seasonId: 'blazblue',
    overrides: [
      {step: 'chart', text: 'When not exceeded, if Hakumen rolls equal to his hand size he advances 1 space (or retreats 1 if unable) and draws 1 card instead of striking. He counts as having “drawn” on any turn he does not strike, so his Overdrive gives him a free gauge after Move actions, Boost and Draw actions, and after this 1 advance.'},
    ],
  },
  {
    slug: 'hazama',
    name: 'Hazama',
    seasonId: 'blazblue',
    overrides: [
      {step: 'strike-seq', text: 'When Hazama initiates a strike, he places one random Ouroboros card on an adjacent space closer to the player (or away if at range 1). He pays ZERO force for this, even when exceeded. Resolve the Ouroboros after your strike is set and before selecting Hazama’s strike.'},
    ],
    cardClarifications: [
      {card: 'Eternal Coils', note: 'Hazama discards as many of your cards as possible while keeping at least one card in his own hand.'},
    ],
  },
  {
    slug: 'jin',
    name: 'Jin',
    seasonId: 'blazblue',
    overrides: [
      {step: 'strike-seq', text: 'Jin’s non-exceeded ability is a set ability. He will NOT activate it, regardless of his roll, if he has 4+ cards in hand (he doesn’t “need” the draw 2).'},
    ],
  },
  {
    slug: 'kokonoe',
    name: 'Kokonoe',
    seasonId: 'blazblue',
    overrides: [
      {step: 'strike-seq', text: 'When Kokonoe can place the Graviton, she always chooses the opponent’s space. She only activates the Graviton while it is on the opponent’s space, but always does so then if she can afford the 1 force.'},
    ],
  },
  {
    slug: 'noel',
    name: 'Noel',
    seasonId: 'blazblue',
    overrides: [
      {step: 'strike-seq', text: 'Noel’s non-exceeded ability is a set ability.'},
    ],
    cardClarifications: [
      {card: 'Bullet Storm', note: 'When using this boost, she gets a −2 modifier to her read check on the added strike.'},
    ],
  },
  {
    slug: 'nu-13',
    name: 'Nu-13',
    seasonId: 'blazblue',
    overrides: [
      {step: 'range', text: 'Nu-13 treats ALL ranges as striking range as long as she has 4+ cards in hand.'},
      {step: 'strike-seq', text: 'When not exceeded, she ALWAYS uses her +3–4 range ability when the strike’s range is 4+.'},
      {step: 'move', text: 'Nu prioritizes maximizing her range from the player with movement abilities over getting closer to the center.'},
    ],
  },
  {
    slug: 'platinum',
    name: 'Platinum',
    seasonId: 'blazblue',
    overrides: [
      {step: 'strike-seq', text: 'Platinum always uses her Cleanup ability. For her exceeded ability she sustains a random boost. For her Overdrive she discards a random Overdrive card, playing it if it has a continuous boost.'},
    ],
    cardClarifications: [
      {card: 'Dramatic Sammy', note: 'On a hit, sustain a random continuous boost.'},
      {card: 'Miracle Jeanne', note: 'Play the two topmost continuous boosts that do NOT cause Platinum to miss or get stunned.'},
      {card: 'Cure Dot Typhoon', note: 'Ignore the “after” effect.'},
    ],
  },
  {
    slug: 'ragna',
    name: 'Ragna',
    seasonId: 'blazblue',
    overrides: [
      {step: 'exceed', text: 'While exceeded, Ragna only pushes the opponent if it moves them farther from the edge of the arena (following standard AI priorities).'},
    ],
    cardClarifications: [
      {card: 'Devoured by Darkness', note: 'Resolved differently than printed: it costs 0 force. Ragna takes 1 non-lethal damage, draws 2, then takes another action.'},
      {card: 'Hell’s Fang', note: 'For the boost, Ragna will not spend life to draw 1 card.'},
    ],
  },
  {
    slug: 'tager',
    name: 'Tager',
    seasonId: 'blazblue',
    overrides: [
      {step: 'strike-seq', text: 'Tager’s non-exceeded ability is a set ability. He ONLY uses it if he is at range 3+.'},
      {step: 'exceed', text: 'When exceeded, he pulls 2 with his Overdrive if it fulfills standard AI priorities (getting the player closer to an edge).'},
    ],
  },
  {
    slug: 'taokaka',
    name: 'Taokaka',
    seasonId: 'blazblue',
    overrides: [
      {step: 'range', text: 'Taokaka’s striking range is 1–5.'},
      {step: 'strike-seq', text: 'When not exceeded and striking at range 3–5, Taokaka always wild swings.'},
      {step: 'move', text: 'Taokaka prefers to increase her distance to the opponent for priority #4 (before going toward center).'},
    ],
    cardClarifications: [
      {card: 'Hexa Edge!', note: 'The boost cost is reduced to 0. Ignore the “now” effect.'},
      {card: 'Slashy Slashy!', note: 'For the boost, if the first wild swing drawn is invalid, Taokaka flips a second wild swing.'},
    ],
  },

  // ---- Season 6 · Under Night In-Birth ----
  {
    slug: 'chaos',
    name: 'Chaos',
    seasonId: 'under-night',
    overrides: [
      {step: 'range', text: 'Chaos always uses the Striking Range row for activation.'},
      {step: 'move', text: 'Prioritizes increasing range to the opponent over getting closer to center (priority #4).'},
      {step: 'chart', text: 'CA — he uses his CA instead of a normal “strike” activation at range 4+ (3+ with space to retreat when exceeded). You choose your attack, then the AI resolves its read check with +1, and places its attack card. On a panic, place it to cover your current space and as many spaces to either side as possible, preferring spaces closer to Chaos.'},
    ],
    cardClarifications: [
      {card: 'Deep Revenance', note: 'For the boost, resolve as with his CA above.'},
      {card: 'Dissect', note: 'This card cannot be set on a space in a CA attack.'},
      {card: 'That’s Your Prey', note: 'Always ignore this boost.'},
    ],
  },
  {
    slug: 'enkidu',
    name: 'Enkidu',
    seasonId: 'under-night',
    keyCard: true,
    overrides: [
      {step: 'boost-draw', text: 'Not-exceeded CA — if 1+ copies of Three Precept Strike are in discard, Boost and Draw actions draw 1 card instead of 2 AND recover one Three Precept (shuffled into hand).'},
      {step: 'chart', text: 'Exceeded CA — use on any “strike” activation at range 1–3. (Three Precept Strike is a key card.)'},
    ],
    cardClarifications: [
      {card: 'Three Precept Strike', note: 'If the AI hand has 2 copies and you initiated, use “reveal” instead of EX, shuffling 1 copy into the new hand. If 3+ copies, reveal AND EX. Only uses the boost with 3+ more life than you.'},
      {card: 'Chained Kick', note: 'For the boost, he spends force to reach range 1–3.'},
      {card: 'Demon Seal', note: 'Ignores the optional return in the “after” effect. Boost costs 0 force but ignores its “after” effect.'},
      {card: 'Spiral Dual Palm Strike', note: 'Doesn’t use the boost’s optional sustain.'},
    ],
  },
  {
    slug: 'gordeau',
    name: 'Gordeau',
    seasonId: 'under-night',
    overrides: [
      {step: 'range', text: 'Gordeau’s striking range is 1–6 if he has 5+ cards.'},
      {step: 'chart', text: 'Not-exceeded CA — always uses CA on a “strike” activation.'},
      {step: 'exceed', text: 'He only exceeds if his gauge count is 1 less than, equal to, or greater than your hand + gauge combined. If so, on his next in-striking-range turn he spends all his gauge for his CA (no activation roll), reverts, then uses his non-exceeded CA to strike.'},
    ],
    cardClarifications: [
      {card: 'Grim Reaper', note: 'Always spend gauge (if able) for advantage if the AI initiated the strike.'},
      {card: 'Mortal Slide', note: 'Do not use the optional boost sustain.'},
      {card: 'Soul Exodus', note: 'For the boost, discard a random card of yours. If there’s a strike on the next turn (either side), −2 to the read roll.'},
    ],
  },
  {
    slug: 'hilda',
    name: 'Hilda',
    seasonId: 'under-night',
    overrides: [
      {step: 'range', text: 'Hilda’s striking range is 1–5.'},
      {step: 'chart', text: 'Not-exceeded CA — always use on a “strike” activation at range 2–4.'},
      {step: 'exceed', text: 'Exceeded CA — on an even roll while she has 5+ cards and enough gauge to move you to range 4 or 5, she uses her CA repeatedly to reach the closer range, then reverts and strikes with her non-exceeded CA.'},
    ],
    cardClarifications: [
      {card: 'Tri-Furket', note: 'For the hit effect always choose gauge. Ignore the boost if you would gain more gauge than the AI.'},
      {card: 'Condensify Gloom', note: 'Only consider the face-up set option for strikes you initiated. For a panic, place it on your space.'},
      {card: 'Impalement', note: 'Change spent gauge cards to include your original (panic) or new (read) range for max power. While active, Hilda’s striking range becomes 4+.'},
    ],
  },
  {
    slug: 'hyde',
    name: 'Hyde',
    seasonId: 'under-night',
    keyCard: true,
    overrides: [
      {step: 'range', text: 'Hyde’s striking range is 1–4 if he has 5+ cards. Attacks with 5+ speed, or 5+ guard/armor sum (besides Block), are key cards.'},
      {step: 'chart', text: 'Not-exceeded CA — use on an activation roll equal to or 1 over his hand size. He strikes if in striking range and you have 0–2 cards (panic strike, then you choose your card).'},
      {step: 'exceed', text: 'Exceeded CA — if you have 0–2 cards and at least one AI gauge card is an in-range key card, he uses the CA on ANY odd activation roll (hand size doesn’t matter), striking with a random in-range key card face-up.'},
    ],
  },
  {
    slug: 'linne',
    name: 'Linne',
    seasonId: 'under-night',
    keyCard: true,
    overrides: [
      {step: 'chart', text: 'Not-exceeded CA — when at range 4+ with 0–3 cards, Linne always uses her CA (no activation roll). Continuous boosts that can cause a strike are key cards.'},
      {step: 'exceed', text: 'Exceeded CA — on a “strike” activation at range 1–3, she uses her CA to play a random key card from her gauge.'},
    ],
    cardClarifications: [
      {card: 'Tenacious Mist', note: 'For the boost, draw a random card from your hand. If it is a normal attack, you cannot play copies of that normal in this strike.'},
    ],
  },
  {
    slug: 'londrekia',
    name: 'Londrekia',
    seasonId: 'under-night',
    overrides: [
      {step: 'range', text: 'Londrekia’s striking range is 1–4 if he has 5+ cards.'},
      {step: 'chart', text: 'Not-exceeded CA — when striking with exactly 3 gauge, resolve the read check BEFORE you set your strike. On a read, use the CA instead of a normal strike. If its “after” effect triggers, the AI gets −2 to its next read check.'},
      {step: 'exceed', text: 'Exceeded CA — always used on “strike” activations if the AI has 4+ cards. For panic CA strikes at range 1–3, the AI won’t choose a 0–3 speed attack.'},
    ],
    cardClarifications: [
      {card: 'Circular Step', note: 'If the AI hand has 2 copies, use “reveal” instead of EX, shuffling 1 copy into the new hand. If 3+ copies, reveal AND EX.'},
      {card: 'Snow Blossom', note: 'For attack-boost placement, choose a space between AI and player if possible, then as close to center as possible.'},
    ],
  },
  {
    slug: 'merkava',
    name: 'Merkava',
    seasonId: 'under-night',
    overrides: [
      {step: 'exceed', text: 'Merkava will NEVER exceed; ignore boosts that exceed.'},
      {step: 'range', text: 'His striking range is 1–5.'},
      {step: 'chart', text: 'On an even “strike” activation at range 1–3, he uses his CA to retreat instead of striking (this still applies when boosts modify min/max range). With a Move action at range 6+, he uses his CA to advance instead.'},
    ],
    cardClarifications: [
      {card: 'I, Breath Out', note: 'While active, his striking range becomes all ranges. When choosing his strike, treat “X” as 4.'},
      {card: 'I, Defile', note: 'While active, ignore the CA retreat option at range 1.'},
      {card: 'I, Persistently Cling', note: 'Only considers its 0-range face-up set option for strikes you initiated. For a panic, place it on your space.'},
      {card: 'I, Rampage / I, Resentfully Rage', note: 'Do not use the “return to top of deck” effect.'},
    ],
  },
  {
    slug: 'mika',
    name: 'Mika',
    seasonId: 'under-night',
    overrides: [
      {step: 'chart', text: 'CA — on ANY odd activation roll at range 1–3 with 2+ cards (1+ if exceeded), Mika uses a modified CA. If not exceeded, she first discards a card, then (either way) strikes with +1 to her read check. Setting her attack, she flips the top 2 cards of her deck and plays a random boost from her hand, then wild-strikes with one of the 2 flipped cards (the boost considered when choosing).'},
    ],
    cardClarifications: [
      {card: 'Mika’s Hip Attack', note: 'If active when she uses her CA, she discards an extra card (if able) to flip 3 cards instead of 2 and doesn’t suffer the +1 read penalty.'},
    ],
  },
  {
    slug: 'nanase',
    name: 'Nanase',
    seasonId: 'under-night',
    overrides: [
      {step: 'chart', text: 'Not-exceeded CA — use if she has more cards than you and rolls a “strike” activation with an odd die.'},
      {step: 'exceed', text: 'Exceeded CA — use on any “strike” activation. With 2+ more cards than you, she chooses the advantage option; otherwise the +2 power option.'},
    ],
  },
  {
    slug: 'orie',
    name: 'Orie',
    seasonId: 'under-night',
    keyCard: true,
    overrides: [
      {step: 'chart', text: 'Not-exceeded CA — always uses CA on “strike” activations. Attacks with 5+ power are key cards.'},
      {step: 'exceed', text: 'Exceeded CA — use on all “strike” activations, spending the highest-power key card in her gauge to pay for it. If the final attack’s power is equal or higher than the spent card, move that card back to her gauge — she effectively “canceled” the ability.'},
    ],
  },
  {
    slug: 'phonon',
    name: 'Phonon',
    seasonId: 'under-night',
    overrides: [
      {step: 'range', text: 'Phonon’s striking range is 1–X, where X = 3 plus power bonuses from boosts and CA.'},
      {step: 'chart', text: 'CA — always use on any “strike” activation. When exceeded she retreats at range 1–4 and closes at range 5+.'},
    ],
    cardClarifications: [
      {card: 'Blinding Beatitude', note: 'For the attack “after” option, return to hand if the card isn’t going to gauge. Always use the boost “after” option.'},
      {card: 'Complete Servitude', note: 'She does not reveal a card first. Instead, the attack’s printed power becomes the highest OTHER card in her hand, if that card’s power is higher than the chosen attack.'},
      {card: 'Sliding Affliction', note: 'For the boost, always return to hand if able.'},
      {card: 'Tuning Satisfaction', note: 'If the AI hand has 2 copies, use “reveal” instead of EX, shuffling 1 copy into the new hand. If 3+ copies, reveal AND EX.'},
    ],
  },
  {
    slug: 'seth',
    name: 'Seth',
    seasonId: 'under-night',
    overrides: [
      {step: 'range', text: 'Seth’s striking range is 1–4 if he has 5+ cards.'},
      {step: 'chart', text: 'CA — use if the activation roll is a “strike” with an odd value at range 1 or 3.'},
      {step: 'exceed', text: 'If you have 0–5 life, Seth will not use his CA, exceed, or revert.'},
    ],
    cardClarifications: [
      {card: 'Abyssal Geometry / Distant Frontier', note: 'Never uses the optional action in the boost.'},
      {card: 'Captive Segment', note: 'If the AI hand includes an ultra, count the push/pull-1 boost effect from using this ability.'},
      {card: 'Vanishing Confusion', note: 'For the boost, use the seal effect if needed to hit and/or avoid your strike. Sustain if the AI has more life.'},
    ],
  },
  {
    slug: 'vatista',
    name: 'Vatista',
    seasonId: 'under-night',
    overrides: [
      {step: 'range', text: 'Vatista’s striking range is 1–6 if she has 5+ cards.'},
      {step: 'read-check', text: 'Vatista applies a −1 modifier to all of her read checks.'},
      {step: 'chart', text: 'CA — use on all “strike” activations.'},
      {step: 'exceed', text: 'Revert — use on odd activation rolls when she has 0–1 gauge.'},
    ],
    cardClarifications: [
      {card: 'Lumen Stella', note: 'While active, her striking range becomes all ranges. When choosing her strike, treat “X” as 4.'},
      {card: 'Zahhishio', note: 'With 2–3 gauge, if this card is in range (panic) or would win (read), play it over other hand cards, ignoring left-to-right order. Ignore the boost if you have 3+ cards, or if no gauge cards are in range with 5+ speed and/or guard+armor.'},
    ],
  },
  {
    slug: 'wagner',
    name: 'Wagner',
    seasonId: 'under-night',
    keyCard: true,
    overrides: [
      {step: 'chart', text: 'CA — use on an activation roll equal to or 1 over his hand size. If not exceeded, flip cards from deck until a key card appears; if exceeded, pick a random key card from his gauge. He draws 1 card after the action if he didn’t strike. Continuous boost cards are key cards.'},
    ],
    cardClarifications: [
      {card: 'Filthy Dog!', note: 'For the boost, shuffle the discard and take the first special/ultra.'},
      {card: 'Kugel Blitz / Schild Zack / Sturm Brecher', note: 'Uses the optional no-hit effect to place into the boost area when able.'},
      {card: 'Hitze Falke / Megiddo L’or', note: 'Set in a panic strike only, from boost face-up, if in range when you have 0–2 cards.'},
    ],
  },
  {
    slug: 'waldstein',
    name: 'Waldstein',
    seasonId: 'under-night',
    overrides: [
      {step: 'strike-seq', text: 'While not exceeded, Waldstein only plays an ultra attack if he has 4+ gauge.'},
      {step: 'chart', text: 'CA — he always uses his CA on any “strike” activation.'},
    ],
    cardClarifications: [
      {card: 'Verderben', note: 'Only selectable as an attack if you have 0–2 cards (including the strike you set). If selected, you may freely change your attack (unless you initiated and set face-up).'},
      {card: 'Werfen Erschlagen', note: 'While active, the AI’s striking range changes to 1–5.'},
    ],
  },
  {
    slug: 'yuzuriha',
    name: 'Yuzuriha',
    seasonId: 'under-night',
    keyCard: true,
    overrides: [
      {step: 'range', text: 'Yuzuriha’s striking range is 1–4 while she has 5+ cards. While exceeded, her striking range shrinks or expands to include the ranges of key cards in her gauge. Non-ultras with 4+ speed, and Battoujutsu Ni No Kata: Saki, are key cards.'},
      {step: 'chart', text: 'Not-exceeded CA — on an even roll with 3+ cards, she uses her CA to flip cards from her deck until a key card appears and adds it to her gauge. She does not draw after.'},
      {step: 'exceed', text: 'Exceeded CA — if she is in range of at least one key card in her gauge, she does not roll and instead uses her CA.'},
    ],
    cardClarifications: [
      {card: 'Over Here!', note: 'Ignore the boost if no key cards in gauge are in range.'},
      {card: 'Sogetsu… Kashou', note: 'The gauge card spent second (to the top of her discard) should be her highest power, even if it’s a key card.'},
      {card: 'Zero No Kata', note: 'Always uses the Cleanup sustaining option if able.'},
    ],
  },

  // ---- Season 7 · Guilty Gear ----
  {
    slug: 'anji-mito',
    name: 'Anji Mito',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'strike-seq', text: 'Anji pays 1 force to use his set ability when his action or read roll is odd and he has 3+ cards — but not if you initiated at range 4+.'},
    ],
    cardClarifications: [
      {card: 'Kachoufuugetsu Kai', note: 'Resolve the boost the same as a “Reading” boost.'},
      {card: 'Nagiha', note: 'For the boost, the AI draws 3 cards total if it has 0–2 cards, or strikes if it has 3+ cards.'},
      {card: 'Issei Dugi: Sai', note: 'Ignore the “now” effect of the boost.'},
    ],
  },
  {
    slug: 'axl-low',
    name: 'Axl Low',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'range', text: 'Axl’s striking range is always 1–5.'},
      {step: 'move', text: 'When moving, Axl prioritizes increasing his range to the opponent over being closer to center.'},
    ],
    cardClarifications: [
      {card: 'Sickle Storm', note: 'Axl will not play this card for its boost.'},
      {card: 'One Vision', note: 'Axl uses this action as soon as able. For his first two actions he prioritizes having 3+ cards (via Boost and Draw), then being at 3–5 range; he strikes on the 3rd action.'},
      {card: 'Axl Bomber', note: 'The AI spends the gauge for advantage if it would be your turn next.'},
    ],
  },
  {
    slug: 'baiken',
    name: 'Baiken',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'exceed', text: 'The AI will not use Baiken’s special character action and will not exceed.'},
      {step: 'chart', text: 'While in striking range with 2–3 cards, Baiken strikes on an action roll of 1–5 regardless of hand size (this doesn’t affect whether she boosts and cancels). When she boosts and cancels with 4 cards, play the boost from her hand (bringing her to 3 cards).'},
    ],
    cardClarifications: [
      {card: 'Kenjyu', note: 'For the boost, always add a card from hand to gauge — unless canceling and it would leave 0–1 cards for the strike.'},
    ],
  },
  {
    slug: 'chipp-zanuff',
    name: 'Chipp Zanuff',
    seasonId: 'guilty-gear',
    cardClarifications: [
      {card: 'Resshou', note: 'For the “after” effect, Chipp gains advantage if he struck, or shuffles the card back into the AI hand if you struck.'},
      {card: 'Alpha Blade / Suck a Sage', note: 'Chipp will not play these for their boosts, unless he is boosting and canceling.'},
    ],
  },
  {
    slug: 'faust',
    name: 'Faust',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'exceed', text: 'Faust will not exceed.'},
      {step: 'chart', text: 'Faust will not boost and cancel. When Faust would strike as his action, instead resolve his boost-then-strike special action.'},
    ],
  },
  {
    slug: 'giovanna',
    name: 'Giovanna',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'exceed', text: 'Giovanna will not exceed.'},
      {step: 'strike-seq', text: 'When striking, she always uses her special strike action (including after a cancel).'},
    ],
    cardClarifications: [
      {card: 'Sol Poente', note: 'For the boost, she always adds a random card from hand to her gauge if able.'},
    ],
  },
  {
    slug: 'goldlewis-dickinson',
    name: 'Goldlewis Dickinson',
    seasonId: 'guilty-gear',
    cardClarifications: [
      {card: 'Down With the System / Burn it Down Poente', note: 'For both boosts, return a random special to the AI hand and shuffle.'},
      {card: 'Behemoth Typhoon Hurl', note: 'For the boost, the AI pays force to strike if in striking range with 5+ cards (if about to cancel, it uses the 2-force strike option instead).'},
      {card: 'Behemoth Typhoon Swing', note: 'For the boost, the AI spends enough force to be in striking range, if needed.'},
      {card: 'Behemoth Typhoon Slam', note: 'For the boost, the AI spends enough force (but NOT from gauge) to be as close to max hand size as possible.'},
    ],
  },
  {
    slug: 'happy-chaos',
    name: 'Happy Chaos',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'range', text: 'Happy Chaos’s striking range is 1–5 while he has at least 1 gauge.'},
      {step: 'chart', text: 'Happy Chaos will not boost and cancel.'},
      {step: 'move', text: 'When moving, the AI prioritizes increasing its range to 3–5.'},
      {step: 'exceed', text: 'Whenever the AI gains advantage with 3+ gauge, it uses his exceed ability if at range 1–5 — the only time it exceeds.'},
      {step: 'strike-seq', text: 'After hitting, reveal the rest of his hand; if able, he seals the leftmost ultra to use his ability.'},
    ],
    cardClarifications: [
      {card: 'At the Ready', note: 'For the strike, the AI prefers to return a random sealed card over drawing 2, if possible.'},
      {card: 'Fire', note: 'For the boost, the AI never spends life.'},
      {card: 'Steady Aim', note: 'The AI will not play this strike face-up.'},
      {card: 'Gun Down', note: 'For the boost, the AI spends force to strike if it has 4+ cards.'},
    ],
  },
  {
    slug: 'i-no',
    name: 'I-No',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'range', text: 'I-No’s striking range is 1–5 while she has 4+ cards.'},
      {step: 'strike-seq', text: 'If she strikes at range 4+ on her turn, she uses her 1-force action (after resolving any cancels).'},
    ],
    cardClarifications: [
      {card: 'The Midnight Carnival', note: 'For the boost, the AI always chooses the draw-and-add-to-gauge option.'},
      {card: 'Ultimate Fortissimo', note: 'For the boost, the AI never spends gauge to sustain the card.'},
    ],
  },
  {
    slug: 'jack-o',
    name: 'Jack-O’',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'exceed', text: 'Jack-O’ will not exceed.'},
      {step: 'chart', text: 'When Jack-O’ would strike as her action, if she has 4+ cards she spends 1 force from hand to flip cards from her deck until a continuous boost appears (this can come after a cancel).'},
    ],
    cardClarifications: [
      {card: 'Throw Servant', note: 'For the “after” effect, flip cards from deck until a continuous boost appears to sustain.'},
      {card: 'Cheer Servant On', note: 'She sustains the leftmost continuous boost.'},
      {card: 'Iron Pumpkin', note: 'For the boost, always add to gauge.'},
      {card: 'Countdown', note: 'For the boost, add a random card to the AI gauge.'},
    ],
  },
  {
    slug: 'ky-kiske',
    name: 'Ky Kiske',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'range', text: 'Ky’s striking range is 1–5 while he has 5+ cards.'},
      {step: 'chart', text: 'Ky boosts and cancels if his action roll is less than, equal to, or one greater than the cards in his gauge.'},
      {step: 'move', text: 'For movement, Ky prefers to move to range 2 of an enemy; then closer to center and you closer to the edge, as normal.'},
    ],
  },
  {
    slug: 'leo-whitefang',
    name: 'Leo Whitefang',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'exceed', text: 'Leo always chooses to exceed when able.'},
      {step: 'chart', text: 'While exceeded and in striking range, Leo strikes with a wild swing on an action roll of 1–5 regardless of hand size (he still checks for boost and cancel first).'},
    ],
    cardClarifications: [
      {card: 'Zweites Kaltes Gestober', note: 'For the boost, you may look at the AI’s hand. Shuffle it after.'},
      {card: 'Stolz', note: 'Leo draws 4 total with this boost if he doesn’t strike. If he boosts then cancels into a wild swing, reveal the top two deck cards and strike with the better one (per read rules).'},
      {card: 'Stahlwirbel / Leidenschaft des Dirigenten', note: 'Stahlwirbel is always invalid unless the AI is wild swinging while exceeded. For both boosts, the AI always wild swings if in striking range.'},
    ],
  },
  {
    slug: 'may',
    name: 'May',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'range', text: 'May’s striking range is 1–4 while she has 5+ cards.'},
      {step: 'strike-seq', text: 'When May initiates a strike with at least 4 cards, she pays 1 force to use her character power.'},
    ],
    cardClarifications: [
      {card: 'Great Yamada Attack', note: 'For the boost, May spends the 1 force to strike if she has 4+ cards.'},
    ],
  },
  {
    slug: 'millia-rage',
    name: 'Millia Rage',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'strike-seq', text: 'For her ability, Millia prioritizes gaining advantage on the exceeded side (if you would take the next turn), then drawing if she has 0–4 cards, then advancing or retreating by normal move priority.'},
    ],
    cardClarifications: [
      {card: 'Winger', note: 'For the boost, the AI always gains advantage if you take the next turn.'},
      {card: 'Tandem Top', note: 'For the boost, the AI advances past you if possible; if so, shuffle this card and the newly drawn card into hand.'},
    ],
  },
  {
    slug: 'nagoriyuki',
    name: 'Nagoriyuki',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'exceed', text: 'Nagoriyuki exceeds when the AI reshuffles its deck for the SECOND time, not the first.'},
      {step: 'strike-seq', text: 'When resolving his non-exceeded special effect, draw 2 cards then discard 2 from the top of the deck.'},
    ],
    cardClarifications: [
      {card: 'Kirioroshi', note: 'The AI will not play this for its boost.'},
      {card: 'Bloodsucking Universe', note: 'For the strike, randomly choose the 2 discarded cards to shuffle in. For the boost, use the “now” effect if you have at least one boost, preferring the leftmost.'},
      {card: 'Wasureyuki', note: 'For the boost, add as many cards to gauge as possible.'},
    ],
  },
  {
    slug: 'potemkin',
    name: 'Potemkin',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'move', text: 'When moving, Potemkin prioritizes being at range 1 over being closer to center and over moving you toward the edges.'},
    ],
  },
  {
    slug: 'ramlethal-valentine',
    name: 'Ramlethal Valentine',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'range', text: 'Ramlethal’s striking range is 1–4 while she has 5+ cards.'},
      {step: 'strike-seq', text: 'With 5+ cards, striking at 4+ range when not exceeded (or any range once exceeded), she pays 2 force to activate her ability.'},
    ],
    cardClarifications: [
      {card: 'Calavados / Dauro / Eralumo', note: 'For effects that return or add a card to gauge or hand, take a random appropriate card from the indicated area.'},
      {card: 'Mortobato', note: 'The AI never plays this for its boost.'},
    ],
  },
  {
    slug: 'sol-badguy',
    name: 'Sol Badguy',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'chart', text: 'Sol boosts and cancels if his action roll is less than, equal to, or one greater than the cards in his gauge.'},
      {step: 'exceed', text: 'When Sol exceeds, he counts as having canceled for that turn (+2 power on his free Strike).'},
    ],
  },
  {
    slug: 'testament',
    name: 'Testament',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'range', text: 'Testament’s striking range is 1–4 while it has 5+ cards.'},
    ],
    cardClarifications: [
      {card: 'Scythe Swing / Arbiter Sign: Rising', note: 'Ignore these when flipping for a Boost and Draw or Boost and Cancel action.'},
      {card: 'Calamity One', note: 'Always resolve the strike bonus if able. For the boost, if the read roll ≤ the AI’s hand size they draw 1; otherwise they advance 2.'},
      {card: 'Arbiter Sign: Falling', note: 'Ignore the “now” effect on the boost.'},
    ],
  },
  {
    slug: 'zato-1',
    name: 'Zato=1',
    seasonId: 'guilty-gear',
    overrides: [
      {step: 'strike-seq', text: 'When placing Eddie, the AI places him as close to range 1 from you as possible (ties broken toward center). If you are at range 1 from Eddie, the AI is always considered to be in striking range.'},
    ],
    cardClarifications: [
      {card: 'That’s a Lot', note: 'For the boost, the AI spends 1 force to strike if it has 4+ cards and is in striking range (if about to cancel, it uses this strike instead).'},
      {card: 'Oppose', note: 'For the boost, the AI adds a card to its gauge if able.'},
      {card: 'Sun Void', note: 'Ignore the “now” effect on this boost.'},
    ],
  },
];
