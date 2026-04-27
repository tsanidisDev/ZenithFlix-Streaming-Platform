'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import MobileNav from '../MobileNav/MobileNav';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchValue('');
    router.replace(pathname);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearchValue(q);
    const url = q.trim()
      ? `${pathname}?q=${encodeURIComponent(q.trim())}`
      : pathname;
    router.replace(url, { scroll: false });
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') closeSearch();
  }

  return (
    <>
      <header className={styles.header} role="banner">
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo} aria-label="ZenithFlix home">
            ZENITH<em>FLIX</em>
          </Link>

          {/* Desktop nav — hidden when search is open */}
          {!searchOpen && (
            <nav className={styles.nav} aria-label="Main navigation">
              <Link href="/trending" className={styles.navLink}>Trending</Link>
              <Link href="/movies" className={styles.navLink}>Movies</Link>
              <Link href="/series" className={styles.navLink}>Series</Link>
              <Link href="/live" className={styles.navLink}>Live</Link>
            </nav>
          )}

          <div className={styles.right}>
            {/* Search */}
            {searchOpen ? (
              <div className={styles.searchBar} role="search">
                <span className={styles.searchIcon} aria-hidden="true"><Search size={16} /></span>
                <input
                  ref={searchInputRef}
                  className={styles.searchInput}
                  type="search"
                  placeholder="Search titles, genres…"
                  value={searchValue}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  aria-label="Search content"
                />
                <button
                  className={styles.iconBtn}
                  onClick={closeSearch}
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                className={styles.iconBtn}
                onClick={openSearch}
                aria-label="Open search"
              >
                <Search size={18} />
              </button>
            )}

            {/* Theme toggle */}
            <button
              className={styles.iconBtn}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User state — desktop */}
            <div className={styles.userArea} ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    className={styles.avatarBtn}
                    onClick={() => setUserMenuOpen((o) => !o)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    aria-label={`User menu for ${user.email}`}
                  >
                    <span className={styles.avatar} aria-hidden="true">
                      {user.email[0].toUpperCase()}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div
                      className={styles.userMenu}
                      role="menu"
                      aria-label="User menu"
                      onBlur={(e) => {
                        if (!userMenuRef.current?.contains(e.relatedTarget as Node)) {
                          setUserMenuOpen(false);
                        }
                      }}
                    >
                      <span className={styles.menuEmail}>{user.email}</span>
                      <Link
                        href="/profile"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        className={`${styles.menuItem} ${styles.menuItemDanger}`}
                        role="menuitem"
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.authLinks}>
                  <Link href="/login" className={styles.signInBtn}>Sign in</Link>
                  <Link href="/register" className={styles.registerBtn}>Register</Link>
                </div>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              className={styles.burgerBtn}
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileNavOpen}
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}

