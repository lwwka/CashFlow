import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../providers/AuthProvider';
import { usePreferences } from '../providers/PreferencesProvider';

export function AuthPage(): JSX.Element {
  const { isAuthenticated, loginWithPassword, registerWithPassword } = useAuth();
  const { t } = usePreferences();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('demo-auth@cashflow.local');
  const [password, setPassword] = useState('StrongPassword123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithPassword({ email, password });
      } else {
        await registerWithPassword({ email, password });
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="glass-panel w-full max-w-lg p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-reef">CashFlow Auth</p>
        <h1 className="mt-4 text-4xl">{mode === 'login' ? 'Login 登入' : 'Register 註冊'}</h1>
        <p className="mt-4 text-sm text-white/65">
          {mode === 'login'
            ? 'Sign in to use authenticated API flows.'
            : 'Create an account to start using authenticated API flows.'}
        </p>

        <form className="mt-8 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="field">
            <span className="field-label">{t('shell.userEmail')}</span>
            <input className="text-input" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Password 密碼</span>
            <input className="text-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>

          <button className="primary-button w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Please wait... 請稍候' : mode === 'login' ? 'Login 登入' : 'Register 註冊'}
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-coral">{error}</p> : null}

        <button
          className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 transition hover:bg-white/10"
          onClick={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
          type="button"
        >
          {mode === 'login' ? 'Need an account? Register 註冊新帳戶' : 'Already have an account? Login 已有帳戶登入'}
        </button>
      </div>
    </div>
  );
}
