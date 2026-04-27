'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import styles from './page.module.css';

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (!isLoading && user) router.replace('/');
  }, [user, isLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Sign in</h1>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={submitting}
            />
          </div>

          {error && (
            <p className={styles.errorMsg} role="alert">{error}</p>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting || !email || !password}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <button
            type="button"
            className={styles.forgotBtn}
            onClick={() => setForgotSent(true)}
          >
            Forgot password?
          </button>

          {forgotSent && (
            <p className={styles.forgotMsg}>
              Password reset is not yet available.
            </p>
          )}
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className={styles.footerLink}>Register</Link>
        </p>
      </div>
      </main>
    </>
  );
}
