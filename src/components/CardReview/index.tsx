import type {ReactNode} from 'react';
import styles from './styles.module.css';

type Stat = [label: string, value: string, isKeyword?: boolean];

type Props = {
  name: string;
  image: string;
  tier: string;
  tag?: string;
  note?: string;
  oneLiner: string;
  stats: Stat[];
  blitz?: string;
};

const TIERS = ['S', 'A', 'B', 'C', 'D'];

// The verdict header shown at the top of each "Hacking a Card" post:
// card art + tier badge + one-liner + stat grid. Self-contained dark styling
// so it looks the same in the site's light and dark themes.
export default function CardReview(props: Props): ReactNode {
  return (
    <div className={styles.hero}>
      <img
        className={styles.cardimg}
        src={props.image}
        alt={props.name}
        loading="lazy"
      />
      <div className={styles.verdict}>
        <div className={styles.tier}>
          <div className={styles.big}>{props.tier}</div>
          <div>
            <div className={styles.scale}>
              {TIERS.map((t) => (
                <span key={t} className={t === props.tier ? styles.on : ''}>
                  {t}
                </span>
              ))}
            </div>
            {props.tag && <div className={styles.tag2}>{props.tag}</div>}
            {props.note && <div className={styles.sc}>{props.note}</div>}
          </div>
        </div>
        <div className={styles.oneliner}>{props.oneLiner}</div>
        <div className={styles.stats}>
          {props.stats.map(([k, v, kw], i) => (
            <div key={i} className={styles.stat}>
              <div className={styles.k}>{k}</div>
              <div className={`${styles.v} ${kw ? styles.kw : ''}`}>{v}</div>
            </div>
          ))}
        </div>
        {props.blitz && <div className={styles.blitz}>{props.blitz}</div>}
      </div>
    </div>
  );
}
