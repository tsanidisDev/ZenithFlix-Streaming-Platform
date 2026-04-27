'use client';

import { X, AtSign, Play, GitFork } from 'lucide-react';
import styles from './Footer.module.css';

const SOCIALS = [
  { label: 'Twitter / X', href: '#', Icon: X },
  { label: 'Instagram',   href: '#', Icon: AtSign },
  { label: 'YouTube',     href: '#', Icon: Play },
  { label: 'GitHub',      href: '#', Icon: GitFork },
] as const;

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>ZenithFlix</span>

        <nav className={styles.socials} aria-label="Social media links">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              className={styles.socialLink}
              aria-label={label}
              rel="noopener noreferrer"
            >
              <Icon size={18} aria-hidden="true" />
            </a>
          ))}
        </nav>

        <p className={styles.disclaimer}>
          All content is entirely fictional and for demonstration purposes only.
          &copy; {new Date().getFullYear()} ZenithFlix
        </p>
      </div>
    </footer>
  );
}
