import {useMemo, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import TurnWalkthrough, {type StepNote} from '@site/src/components/TurnWalkthrough';
import {SOLO_ENGINE} from '@site/src/data/soloEngine';
import {SEASONS, FIGHTERS, type Fighter} from '@site/src/data/soloFighters';
import styles from './turnOrder.module.css';

// Card clarifications are card-triggered — they matter when the AI flips cards,
// which happens during a strike. Surface them on the strike sequence step.
const CLARIFICATION_STEP = 'strike-seq';

function notesFor(fighter: Fighter): Record<string, StepNote[]> {
  const map: Record<string, StepNote[]> = {};
  const push = (step: string, note: StepNote) => {
    (map[step] ??= []).push(note);
  };
  fighter.overrides?.forEach((o) => push(o.step, {text: o.text}));
  fighter.cardClarifications?.forEach((c) => push(CLARIFICATION_STEP, {label: c.card, text: c.note}));
  return map;
}

function FighterFullCard({fighter}: {fighter: Fighter}): ReactNode {
  const hasOverrides = (fighter.overrides?.length ?? 0) > 0;
  const hasClar = (fighter.cardClarifications?.length ?? 0) > 0;
  return (
    <div className={styles.fullCard}>
      {hasOverrides && (
        <>
          <div className={styles.sectionLabel}>Turn Resolution</div>
          {fighter.overrides!.map((o, i) => (
            <p key={i} className={styles.para}>
              {o.text}
            </p>
          ))}
        </>
      )}
      {hasClar && (
        <>
          <div className={styles.sectionLabel}>Card Clarifications</div>
          {fighter.cardClarifications!.map((c) => (
            <div key={c.card} className={styles.clar}>
              <span className={styles.clarCard}>{c.card}</span>
              <span className={styles.clarNote}>{c.note}</span>
            </div>
          ))}
        </>
      )}
      {!hasOverrides && !hasClar && (
        <p className={styles.para}>
          This fighter follows the shared engine with no extra Turn Resolution or card
          clarifications.
        </p>
      )}
    </div>
  );
}

export default function TurnOrderPage(): ReactNode {
  const [seasonId, setSeasonId] = useState(SEASONS[0].id);
  const [fighterSlug, setFighterSlug] = useState(
    FIGHTERS.find((f) => f.seasonId === SEASONS[0].id)?.slug ?? '',
  );
  const [cardOpen, setCardOpen] = useState(false);
  const [seasonOpen, setSeasonOpen] = useState(false);

  const season = useMemo(() => SEASONS.find((s) => s.id === seasonId) ?? SEASONS[0], [seasonId]);
  const seasonFighters = useMemo(
    () => FIGHTERS.filter((f) => f.seasonId === seasonId),
    [seasonId],
  );
  const fighter = useMemo(
    () => seasonFighters.find((f) => f.slug === fighterSlug) ?? seasonFighters[0],
    [seasonFighters, fighterSlug],
  );

  const notesByStep = useMemo(() => (fighter ? notesFor(fighter) : {}), [fighter]);

  const onSeasonChange = (id: string) => {
    setSeasonId(id);
    const first = FIGHTERS.find((f) => f.seasonId === id);
    if (first) setFighterSlug(first.slug);
  };

  const topSlot = (
    <div className={styles.picker}>
      <div className={styles.pickerRow}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Season</span>
          <select
            className={styles.select}
            value={seasonId}
            onChange={(e) => onSeasonChange(e.target.value)}>
            {SEASONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} — {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>AI fighter</span>
          <select
            className={styles.select}
            value={fighter?.slug ?? ''}
            onChange={(e) => setFighterSlug(e.target.value)}>
            {seasonFighters.map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {fighter && (
        <div className={styles.cardToggleWrap}>
          <button
            type="button"
            className={styles.cardToggle}
            onClick={() => setCardOpen((v) => !v)}
            aria-expanded={cardOpen}>
            {cardOpen ? '▾' : '▸'} {fighter.name}’s full AI card
          </button>
          {cardOpen && <FighterFullCard fighter={fighter} />}
        </div>
      )}

      {((season.specialRules?.length ?? 0) > 0 || fighter?.keyCard) && (
        <div className={styles.cardToggleWrap}>
          <button
            type="button"
            className={styles.cardToggle}
            onClick={() => setSeasonOpen((v) => !v)}
            aria-expanded={seasonOpen}>
            {seasonOpen ? '▾' : '▸'} {season.label} · {season.name} rules
          </button>
          {seasonOpen && (
            <div className={styles.seasonRulesBody}>
              {season.specialRules && season.specialRules.length > 0 && (
                <ul className={styles.seasonRulesList}>
                  {season.specialRules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
              {fighter?.keyCard && (
                <p className={styles.keyCardNote}>
                  <strong>★ Key-card fighter</strong> — follows the season’s key-card rules above.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Layout
      title="Turn Order"
      description="Step through an Exceed solo turn with your chosen AI fighter's details folded in.">
      <main>
        <div className={styles.pageHead}>
          <h1 className={styles.pageHeadTitle}>Turn Order</h1>
          <Link to="/docs/solo-rules" className={styles.back}>
            Solo Rules →
          </Link>
        </div>
        <TurnWalkthrough
          walkthrough={SOLO_ENGINE}
          fighterName={fighter?.name}
          notesByStep={notesByStep}
          topSlot={topSlot}
        />
      </main>
    </Layout>
  );
}
