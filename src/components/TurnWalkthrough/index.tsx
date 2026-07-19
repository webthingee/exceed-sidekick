import {useCallback, useEffect, useMemo, useRef, useState, type ReactNode} from 'react';
import clsx from 'clsx';

import {END_NOTE, type Walkthrough} from '@site/src/data/soloEngine';
import styles from './styles.module.css';

// Per-phase accent, keyed by phase id. Chosen to read on both light and dark
// surfaces since it's only ever used for small accents (eyebrow, rail, dots).
const ACCENT: Record<string, string> = {
  setup: '#8a93a6',
  'ai-turn': '#4b83e0',
  move: '#2fa46b',
  strike: '#d9534f',
  'boost-draw': '#8250df',
  reference: '#64748b',
};

type FlatStep = {
  phaseIndex: number;
  stepIndex: number; // index within the phase
  phaseId: string;
  phaseName: string;
  phaseKind: string;
  phaseSteps: number; // total steps in this phase
  accent: string;
  step: Walkthrough['phases'][number]['steps'][number];
};

const SWIPE_THRESHOLD = 45;

export type StepNote = {label?: string; text: string};

export default function TurnWalkthrough({
  walkthrough,
  fighterName,
  notesByStep,
  topSlot,
}: {
  walkthrough: Walkthrough;
  // When set, the current step shows this fighter's tagged notes as a ⭐ callout.
  fighterName?: string;
  // Map of engine step id → the selected fighter's notes for that step.
  notesByStep?: Record<string, StepNote[]>;
  // Rendered above the phase rail — used for the fighter picker + full card.
  topSlot?: ReactNode;
}): ReactNode {
  // Flatten phases → one entry per step, keeping phase context on each.
  const flat = useMemo<FlatStep[]>(() => {
    const out: FlatStep[] = [];
    walkthrough.phases.forEach((phase, phaseIndex) => {
      phase.steps.forEach((step, stepIndex) => {
        out.push({
          phaseIndex,
          stepIndex,
          phaseId: phase.id,
          phaseName: phase.name,
          phaseKind: phase.kind,
          phaseSteps: phase.steps.length,
          accent: ACCENT[phase.id] ?? 'var(--ifm-color-primary)',
          step,
        });
      });
    });
    return out;
  }, [walkthrough]);

  // Index of the first "loop" step — where a new round restarts (skipping setup).
  const loopStart = useMemo(() => flat.findIndex((f) => f.phaseKind === 'loop'), [flat]);

  const [i, setI] = useState(0);
  const cur = flat[i];
  const atFirst = i === 0;
  const atLast = i === flat.length - 1;

  // Auto-rolled d6s. Rolled in an effect (not in useState init) so server and
  // first client render agree — Math.random would mismatch on hydrate.
  // `roll` = the AI action roll; `readRoll` = the separate strike read-check.
  const d6 = () => Math.floor(Math.random() * 6) + 1;
  const [roll, setRoll] = useState<number | null>(null);
  const [readRoll, setReadRoll] = useState<number | null>(null);
  useEffect(() => {
    setRoll(d6());
    setReadRoll(d6());
  }, []);

  // Read check: 1–2 reads, 3–6 panics. Drives which outcome opens/highlights
  // under the strike sequence's "Read Check" line.
  const readOutcomeId = readRoll == null ? null : readRoll <= 2 ? 'read' : 'panic';

  // Outcome collapse state. Default: the rolled outcome is open. A manual toggle
  // overrides that default until the next reroll (which clears the overrides).
  const [openOutcome, setOpenOutcome] = useState<Record<string, boolean>>({});
  const isOutcomeOpen = (id: string, rolled: boolean) => openOutcome[id] ?? rolled;
  const toggleOutcome = (id: string, rolled: boolean) =>
    setOpenOutcome((prev) => ({...prev, [id]: !(prev[id] ?? rolled)}));
  const rerollRead = () => {
    setReadRoll(d6());
    setOpenOutcome({});
  };

  // Phase index by id, so a clickable chart cell can jump to its action's phase.
  const phaseIndexById = useMemo(() => {
    const m: Record<string, number> = {};
    walkthrough.phases.forEach((p, pi) => (m[p.id] = pi));
    return m;
  }, [walkthrough]);

  // Map a chart cell's action text to the phase it links to (if any).
  const cellPhaseIndex = useCallback(
    (cell: string): number | undefined => {
      const k = cell.trim().toLowerCase();
      const id = k === 'move' ? 'move' : k === 'strike' ? 'strike' : k === 'boost and draw' ? 'boost-draw' : undefined;
      return id ? phaseIndexById[id] : undefined;
    },
    [phaseIndexById],
  );

  const go = useCallback(
    (next: number) => setI((prev) => Math.max(0, Math.min(flat.length - 1, next))),
    [flat.length],
  );
  const goNext = useCallback(() => {
    if (atLast) go(loopStart >= 0 ? loopStart : 0); // loop back to a new round
    else go(i + 1);
  }, [atLast, go, i, loopStart]);
  const goPrev = useCallback(() => go(i - 1), [go, i]);
  const goPhase = useCallback(
    (phaseIndex: number) => {
      const target = flat.findIndex((f) => f.phaseIndex === phaseIndex);
      if (target >= 0) go(target);
    },
    [flat, go],
  );

  // Keyboard: ← / → to move between steps.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  // Touch: horizontal swipe to move between steps.
  const touch = useRef<{x: number; y: number} | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touch.current = {x: t.clientX, y: t.clientY};
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const {step} = cur;

  // Within an action phase, two 'repeat' steps (e.g. Your turn / The AI's turn)
  // form a toggle pair you flip between as you alternate. A lone repeat step
  // (standard's "Player turns") keeps the static chip instead.
  const repeatSiblings = flat
    .map((f, idx) => ({f, idx}))
    .filter(({f}) => f.phaseIndex === cur.phaseIndex && f.step.tag === 'repeat');
  const isTogglePair = step.tag === 'repeat' && repeatSiblings.length >= 2;

  // A merged step (e.g. "Roll & resolve") collects the fighter notes tagged to
  // every engine concept it folds in, not just its own id.
  const noteIds = [step.id, ...(step.coversSteps ?? [])];
  const stepNotes = notesByStep ? noteIds.flatMap((id) => notesByStep[id] ?? []) : [];

  return (
    <div className={styles.wrap} style={{['--accent' as string]: cur.accent}}>
      {topSlot}

      {/* Phase rail — jump targets + progress */}
      <nav className={styles.rail} aria-label="Turn phases">
        {walkthrough.phases.map((phase, pi) => {
          const state = pi === cur.phaseIndex ? 'current' : pi < cur.phaseIndex ? 'done' : 'todo';
          const fill =
            pi < cur.phaseIndex ? 100 : pi > cur.phaseIndex ? 0 : ((cur.stepIndex + 1) / cur.phaseSteps) * 100;
          return (
            <button
              key={phase.id}
              type="button"
              className={clsx(styles.railItem, styles[`rail_${state}`])}
              style={{['--accent' as string]: ACCENT[phase.id], flexGrow: phase.steps.length}}
              onClick={() => goPhase(pi)}
              aria-current={state === 'current' ? 'step' : undefined}>
              <span className={styles.railLabel}>{phase.short}</span>
              <span className={styles.railTrack}>
                <span className={styles.railFill} style={{width: `${fill}%`}} />
              </span>
            </button>
          );
        })}
      </nav>

      {/* Step card */}
      <div className={styles.stage} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <article className={styles.card} key={step.id} aria-live="polite">
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrow}>{cur.phaseName}</span>
            {cur.phaseKind === 'setup' && <span className={styles.badgeOnce}>once per game</span>}
            {step.tag === 'round' && <span className={styles.badgeOnce}>once per round</span>}
            {step.tag === 'repeat' && !isTogglePair && (
              <span className={styles.badgeRepeat}>↻ repeats until both pass</span>
            )}
          </div>
          {step.roll ? (
            <div className={styles.rollResult}>
              <span className={styles.rollLabel}>Roll Result =</span>
              <span className={styles.rollValue}>{roll ?? '–'}</span>
              {roll !== null && roll % 2 === 1 && (
                <span className={styles.rollParity}>odd · exceed possible</span>
              )}
              <button type="button" className={styles.rerollBtn} onClick={() => setRoll(d6())}>
                🎲 Roll again
              </button>
            </div>
          ) : step.readRoll ? (
            <div className={styles.rollResult}>
              <span className={styles.rollLabel}>Read Check =</span>
              <span className={styles.rollValue}>{readRoll ?? '–'}</span>
              {readRoll !== null && (
                <span className={styles.rollParity}>
                  {readRoll <= 2 ? 'READS' : 'PANICS'}
                </span>
              )}
              <button type="button" className={styles.rerollBtn} onClick={rerollRead}>
                🎲 Roll again
              </button>
            </div>
          ) : cur.phaseSteps > 1 ? (
            <div className={styles.counter}>
              Step {cur.stepIndex + 1} of {cur.phaseSteps}
            </div>
          ) : null}

          {isTogglePair && (
            <>
              <div className={styles.turnToggle} role="group" aria-label="Whose turn — tap to swap">
                {repeatSiblings.map(({f, idx}) => (
                  <button
                    key={f.step.id}
                    type="button"
                    className={clsx(styles.turnToggleBtn, idx === i && styles.turnToggleActive)}
                    onClick={() => go(idx)}
                    aria-current={idx === i ? 'step' : undefined}>
                    {f.step.title.replace(/^The\s+/i, '')}
                  </button>
                ))}
              </div>
              <div className={styles.turnToggleHint}>↻ Alternate until both pass</div>
            </>
          )}

          <h2 className={styles.title}>{step.title}</h2>

          {/* Steps with an actions list lead with the actions (the important,
              tappable info); their intro prose drops to the footer. Chart steps
              keep their intro up top, then explain, then show the grid. */}
          {!step.actions && <p className={styles.detail}>{step.detail}</p>}

          {step.bullets && (
            <ul className={styles.bullets}>
              {step.bullets.map((b, bi) => (
                <li key={bi}>{b}</li>
              ))}
            </ul>
          )}

          {step.chart && (
            <div className={styles.chartScroll}>
              <table className={styles.chart}>
                <thead>
                  <tr>
                    <th scope="col" className={styles.chartCorner}>
                      {step.chart.rowHeader}
                    </th>
                    {step.chart.cols.map((c) => (
                      <th key={c} scope="col" className={styles.chartColHead}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {step.chart.rows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row" className={styles.chartRowHead}>
                        {row.label}
                        {row.sub && <span className={styles.chartRowSub}>{row.sub}</span>}
                      </th>
                      {row.cells.map((cell, ci) => {
                        const target = cellPhaseIndex(cell);
                        return (
                          <td key={ci} className={styles.chartCell}>
                            {target !== undefined ? (
                              <button
                                type="button"
                                className={styles.chartCellBtn}
                                onClick={() => goPhase(target)}>
                                {cell} <span aria-hidden="true">→</span>
                              </button>
                            ) : (
                              cell
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {step.actions && (
            <ul className={styles.actions}>
              {step.actions.map((a) =>
                a.outcomes ? (
                  <li key={a.name} className={styles.action}>
                    <span className={styles.actionName}>{a.name}</span>
                    {a.desc && <span className={styles.actionDesc}>{a.desc}</span>}
                    <div className={styles.outcomes}>
                      {a.outcomes.map((o) => {
                        const rolled = readOutcomeId === o.id;
                        const open = isOutcomeOpen(o.id, rolled);
                        return (
                          <div
                            key={o.id}
                            className={clsx(styles.outcome, rolled && styles.actionActive)}>
                            <button
                              type="button"
                              className={styles.outcomeHead}
                              onClick={() => toggleOutcome(o.id, rolled)}
                              aria-expanded={open}>
                              <span className={styles.outcomeChevron} aria-hidden="true">
                                {open ? '▾' : '▸'}
                              </span>
                              <span className={styles.outcomeName}>{o.name}</span>
                              {rolled && readRoll !== null && (
                                <span className={styles.actionActiveTag}>rolled {readRoll}</span>
                              )}
                            </button>
                            {open && <p className={styles.outcomeDesc}>{o.desc}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </li>
                ) : (
                  <li key={a.name} className={styles.action}>
                    <span className={styles.actionName}>{a.name}</span>
                    <span className={styles.actionDesc}>{a.desc}</span>
                  </li>
                ),
              )}
            </ul>
          )}

          {/* Fighter-specific injection. With a fighter selected, show its notes
              for this step; if the step is one fighters commonly change but this
              one doesn't, say so. Fall back to the generic hint only when no
              fighter is chosen. */}
          {fighterName ? (
            stepNotes.length > 0 ? (
              <div className={styles.fighterNote}>
                <span className={styles.fighterNoteLabel}>★ {fighterName}</span>
                {stepNotes.map((n, ni) => (
                  <span key={ni} className={styles.fighterNoteItem}>
                    {n.label && <strong>{n.label}: </strong>}
                    {n.text}
                  </span>
                ))}
              </div>
            ) : step.override ? (
              <div className={styles.fighterNoteMuted}>{fighterName} uses the default here.</div>
            ) : null
          ) : (
            step.override && (
              <div className={styles.override}>
                <span className={styles.overrideLabel}>⚡ Fighter override</span>
                <span>{step.override}</span>
              </div>
            )
          )}

          <div className={styles.foot}>
            {step.actions && (
              <p className={styles.detailFoot}>{step.detail.replace(/\s*:\s*$/, '.')}</p>
            )}
            {step.ref && <div className={styles.ref}>{step.ref}</div>}
          </div>
        </article>
      </div>

      {/* Bottom navigation */}
      <div className={styles.nav}>
        <button type="button" className={styles.navBtn} onClick={goPrev} disabled={atFirst} aria-label="Previous step">
          <span aria-hidden="true">←</span> Back
        </button>

        <div className={styles.dots} aria-hidden="true">
          {Array.from({length: cur.phaseSteps}).map((_, di) => (
            <span key={di} className={clsx(styles.dot, di === cur.stepIndex && styles.dotActive)} />
          ))}
        </div>

        <button type="button" className={clsx(styles.navBtn, styles.navNext)} onClick={goNext} aria-label="Next step">
          {atLast ? 'New round' : 'Next'} <span aria-hidden="true">→</span>
        </button>
      </div>

      <p className={styles.endNote}>{END_NOTE}</p>
    </div>
  );
}
