import styles from './LandingBackground.module.css';

export default function LandingBackground() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={styles.grid} />
      <div className={styles.gradientOrb1} />
      <div className={styles.gradientOrb2} />
      <div className={styles.gradientOrb3} />
      <div className={styles.gradientOrb4} />
      <div className={styles.noise} />
      <div className={styles.glowLine1} />
      <div className={styles.glowLine2} />
      <div className={styles.glowLine3} />
    </div>
  );
}
