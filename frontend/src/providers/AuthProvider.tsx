import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { fetchMe, login, register } from '../lib/api';
import type { AuthProfile } from '../types';

interface AuthContextValue {
  accessToken: string | null;
  profile: AuthProfile | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  loginWithPassword: (input: { email: string; password: string }) => Promise<void>;
  registerWithPassword: (input: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('cashflow-access-token'));
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    async function bootstrap(): Promise<void> {
      if (!accessToken) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const me = await fetchMe();
        setProfile(me);
      } catch {
        localStorage.removeItem('cashflow-access-token');
        setAccessToken(null);
        setProfile(null);
      } finally {
        setIsBootstrapping(false);
      }
    }

    void bootstrap();
  }, [accessToken]);

  async function loginWithPassword(input: { email: string; password: string }): Promise<void> {
    const result = await login(input);
    localStorage.setItem('cashflow-access-token', result.accessToken);
    setAccessToken(result.accessToken);
    const me = await fetchMe();
    setProfile(me);
  }

  async function registerWithPassword(input: { email: string; password: string }): Promise<void> {
    const result = await register(input);
    localStorage.setItem('cashflow-access-token', result.accessToken);
    setAccessToken(result.accessToken);
    const me = await fetchMe();
    setProfile(me);
  }

  function logout(): void {
    localStorage.removeItem('cashflow-access-token');
    setAccessToken(null);
    setProfile(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      profile,
      isAuthenticated: Boolean(accessToken && profile),
      isBootstrapping,
      loginWithPassword,
      registerWithPassword,
      logout,
    }),
    [accessToken, profile, isBootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
