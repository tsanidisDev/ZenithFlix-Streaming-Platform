import styles from './SkeletonRow.module.css';

interface Props {
  title: string;
}

export default function SkeletonRow({ title }: Props) {
  return (
    <section
      className={styles.skeleton}
      aria-label={`Loading ${title}`}
      aria-busy="true"
    >
      <div className={styles.title} />
      <div className={styles.track}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.tile} aria-hidden="true">
            <div className={styles.thumb} />
            <div className={styles.line} />
            <div className={styles.lineShort} />
          </div>
        ))}
      </div>
    </section>
  );
}
