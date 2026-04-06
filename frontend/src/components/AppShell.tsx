import { NavLink, Outlet } from 'react-router-dom';

import { usePreferences } from '../providers/PreferencesProvider';

interface AppShellProps {
  userEmail: string;
  month: string;
  onUserEmailChange: (value: string) => void;
  onMonthChange: (value: string) => void;
}

export function AppShell(props: AppShellProps): JSX.Element {
  const { locale, setLocale, theme, setTheme, t } = usePreferences();
  const navItems = [
    { to: '/', label: t('nav.dashboard') },
    { to: '/transactions', label: t('nav.transactions') },
    { to: '/categories', label: t('nav.categories') },
    { to: '/budgets', label: t('nav.budgets') },
  ];

  return (
    <div className="min-h-screen bg-hero-glow px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="glass-panel overflow-hidden">
          <div className="border-b border-white/10 px-6 py-6">
            <p className="text-xs uppercase tracking-[0.35em] text-reef">CashFlow</p>
            <h1 className="mt-4 text-4xl leading-none">{t('shell.title')}</h1>
            <p className="mt-4 text-sm leading-6 text-white/65">{t('shell.description')}</p>
          </div>

          <div className="space-y-6 px-6 py-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [
                      'block rounded-2xl px-4 py-3 text-sm font-medium transition',
                      isActive ? 'bg-reef/15 text-reef' : 'text-white/70 hover:bg-white/5 hover:text-white',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="rounded-3xl border border-white/10 bg-ink/60 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">{t('shell.filters')}</h2>
              <div className="mt-4 space-y-4">
                <label className="field">
                  <span className="field-label">{t('shell.userEmail')}</span>
                  <input
                    className="text-input"
                    value={props.userEmail}
                    onChange={(event) => props.onUserEmailChange(event.target.value)}
                    placeholder="demo@cashflow.local"
                  />
                </label>
                <label className="field">
                  <span className="field-label">{t('shell.month')}</span>
                  <input
                    className="text-input"
                    type="month"
                    value={props.month}
                    onChange={(event) => props.onMonthChange(event.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field-label">{t('locale.switch')}</span>
                  <select className="text-input" onChange={(event) => setLocale(event.target.value as 'en' | 'zh')} value={locale}>
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">{t('theme.switch')}</span>
                  <select className="text-input" onChange={(event) => setTheme(event.target.value as 'dark' | 'light')} value={theme}>
                    <option value="dark">{t('theme.dark')}</option>
                    <option value="light">{t('theme.light')}</option>
                  </select>
                </label>
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <Outlet context={{ userEmail: props.userEmail, month: props.month }} />
        </main>
      </div>
    </div>
  );
}
