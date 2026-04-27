'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Sun, Moon, Home, TrendingUp, Film, Tv, Radio, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './MobileNav.module.css';

interface Props {
  isOpen: boolean;
  onClose(): void;
}

export default function MobileNav({ isOpen, onClose }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeBtnRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = drawer.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}
      >
        <div className={styles.drawerHead}>
          <span className={styles.logo} aria-label="ZenithFlix">
            ZENITH<em>FLIX</em>
          </span>
          <button
            ref={closeBtnRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Mobile navigation">
          <Link className={styles.navLink} href="/" onClick={onClose}><Home size={16} aria-hidden="true" />Home</Link>
          <Link className={styles.navLink} href="/trending" onClick={onClose}><TrendingUp size={16} aria-hidden="true" />Trending</Link>
          <Link className={styles.navLink} href="/movies" onClick={onClose}><Film size={16} aria-hidden="true" />Movies</Link>
          <Link className={styles.navLink} href="/series" onClick={onClose}><Tv size={16} aria-hidden="true" />Series</Link>
          <Link className={styles.navLink} href="/live" onClick={onClose}><Radio size={16} aria-hidden="true" />Live</Link>
        </nav>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <><Sun size={16} aria-hidden="true" /> Light mode</> : <><Moon size={16} aria-hidden="true" /> Dark mode</>}
          </button>

          {user ? (
            <>
              <Link className={styles.navLink} href="/profile" onClick={onClose}>
                <User size={16} aria-hidden="true" />Profile &mdash; {user.email}
              </Link>
              <button
                className={styles.signOutBtn}
                onClick={() => { logout(); onClose(); }}
              >
                <LogOut size={16} aria-hidden="true" />Sign out
              </button>
            </>
          ) : (
            <>
              <Link className={styles.authLink} href="/login" onClick={onClose}><LogIn size={16} aria-hidden="true" />Sign in</Link>
              <Link className={`${styles.authLink} ${styles.authLinkAccent}`} href="/register" onClick={onClose}>
                <UserPlus size={16} aria-hidden="true" />Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
