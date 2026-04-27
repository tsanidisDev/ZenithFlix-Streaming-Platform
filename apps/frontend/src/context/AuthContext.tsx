'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export interface AuthUser {
  sub: number;
  email: string;
  createdAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
const STORAGE_KEY = 'zenithflix_token';

function decodeJwt(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as {
      sub: number;
      email: string;
      createdAt?: string;
    };
    return { sub: payload.sub, email: payload.email, createdAt: payload.createdAt };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const decoded = decodeJwt(stored);
      if (decoded) {
        setToken(stored);
        setUser(decoded);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(err.message ?? 'Login failed');
    }
    const { accessToken } = (await res.json()) as { accessToken: string };
    localStorage.setItem(STORAGE_KEY, accessToken);
    setToken(accessToken);
    setUser(decodeJwt(accessToken));
  }

  async function register(email: string, password: string) {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(err.message ?? 'Registration failed');
    }
    const { accessToken } = (await res.json()) as { accessToken: string };
    localStorage.setItem(STORAGE_KEY, accessToken);
    setToken(accessToken);
    setUser(decodeJwt(accessToken));
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
