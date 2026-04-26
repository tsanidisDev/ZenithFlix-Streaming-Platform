import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <span className={styles.logo} aria-label="ZenithFlix home">
          ZENITH<em>FLIX</em>
        </span>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#trending" className={styles.navLink}>Trending</a>
          <a href="#movies" className={styles.navLink}>Movies</a>
          <a href="#series" className={styles.navLink}>Series</a>
          <a href="#live" className={styles.navLink}>Live</a>
        </nav>
      </div>
    </header>
  );
}
