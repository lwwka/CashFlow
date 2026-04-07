import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../providers/AuthProvider';
import { usePreferences } from '../providers/PreferencesProvider';

interface AppShellProps {
  month: string;
  onMonthChange: (value: string) => void;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}

export function AppShell(props: AppShellProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, profile } = useAuth();
  const { locale, setLocale, theme, setTheme, t } = usePreferences();
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
  const appGitSha = typeof __APP_GIT_SHA__ !== 'undefined' ? __APP_GIT_SHA__ : 'local';
  const appBuildDate =
    typeof __APP_BUILD_DATE__ !== 'undefined' ? new Date(__APP_BUILD_DATE__) : null;
  const formattedBuildDate = appBuildDate
    ? `${appBuildDate.getFullYear()}-${String(appBuildDate.getMonth() + 1).padStart(2, '0')}-${String(appBuildDate.getDate()).padStart(2, '0')} ${String(appBuildDate.getHours()).padStart(2, '0')}:${String(appBuildDate.getMinutes()).padStart(2, '0')}`
    : 'local build';
  const navItems = [
    { to: '/', label: t('nav.dashboard') },
    { to: '/goals', label: t('nav.goals') },
    { to: '/insights', label: t('nav.insights') },
    { to: '/reports', label: t('nav.reports') },
    { to: '/transactions', label: t('nav.transactions') },
    { to: '/categories', label: t('nav.categories') },
    { to: '/budgets', label: t('nav.budgets') },
  ];
  const showFilters = location.pathname !== '/';

  return (
    <div className="min-h-screen bg-hero-glow px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[252px_minmax(0,1fr)]">
        <aside className="glass-panel h-fit overflow-hidden lg:sticky lg:top-6">
          <div className="border-b border-white/10 px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.35em] text-reef">CashFlow</p>
            <h1 className="mt-3 text-3xl leading-none">{t('shell.title')}</h1>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Signed in as 已登入身份</p>
              <p className="mt-2 text-sm text-sand">{profile?.email ?? '-'}</p>
            </div>
          </div>

          <div className="space-y-5 px-5 py-5">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [
                      'block rounded-2xl px-4 py-2.5 text-sm font-medium transition',
                      isActive ? 'bg-reef/15 text-reef' : 'text-white/70 hover:bg-white/5 hover:text-white',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {showFilters ? (
              <div className="rounded-3xl border border-white/10 bg-ink/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">{t('shell.filters')}</h2>
                  <span className="text-[11px] text-white/45">
                    {props.fromDate && props.toDate ? 'Range' : 'Month'}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <label className="field">
                    <span className="field-label">{t('shell.month')}</span>
                    <input
                      className="text-input"
                      type="month"
                      value={props.month}
                      onChange={(event) => props.onMonthChange(event.target.value)}
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <label className="field">
                      <span className="field-label">{t('shell.fromDate')}</span>
                      <input
                        className="text-input"
                        type="date"
                        value={props.fromDate}
                        onChange={(event) => props.onFromDateChange(event.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span className="field-label">{t('shell.toDate')}</span>
                      <input
                        className="text-input"
                        type="date"
                        value={props.toDate}
                        onChange={(event) => props.onToDateChange(event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3 text-[11px] leading-5 text-white/55">
                    {props.fromDate && props.toDate ? t('shell.rangeModeCustom') : t('shell.rangeModeMonth')}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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

            <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Build</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full border border-reef/20 bg-reef/10 px-2.5 py-1 font-semibold text-reef">
                    v{appVersion}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/60">
                    {appGitSha}
                  </span>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-white/45">{formattedBuildDate}</p>
              </div>
              <button
                className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                type="button"
              >
                Logout 登出
              </button>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <Outlet context={{ month: props.month, fromDate: props.fromDate, toDate: props.toDate }} />
        </main>
      </div>
    </div>
  );
}
