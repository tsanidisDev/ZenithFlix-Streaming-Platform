'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import styles from './page.module.css';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.avatar} aria-hidden="true">
            {user.email[0].toUpperCase()}
          </div>
          <h1 className={styles.email}>{user.email}</h1>
          <p className={styles.sub}>Member since account creation</p>

          <div className={styles.actions}>
            <Link href="/" className={styles.homeBtn}>Back to home</Link>
            <button
              className={styles.logoutBtn}
              onClick={() => { logout(); router.push('/'); }}
            >
              Sign out
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
