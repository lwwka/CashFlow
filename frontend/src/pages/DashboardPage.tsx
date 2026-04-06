import { useOutletContext } from 'react-router-dom';

import { MetricCard } from '../components/MetricCard';
import { Panel } from '../components/Panel';
import { useCashflowData } from '../hooks/useCashflowData';
import { usePreferences } from '../providers/PreferencesProvider';

interface ShellContext {
  userEmail: string;
  month: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export function DashboardPage(): JSX.Element {
  const { userEmail, month } = useOutletContext<ShellContext>();
  const { overview, transactions, budgets, isLoading, error } = useCashflowData(userEmail, month);
  const { t } = usePreferences();

  return (
    <>
      <section className="glass-panel overflow-hidden">
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-reef">{t('dashboard.eyebrow')}</p>
            <h2 className="mt-4 text-5xl leading-none">{t('dashboard.title')}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">{t('dashboard.description')}</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-black/15 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">{t('dashboard.scope')}</p>
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="text-white/45">{t('dashboard.user')}</dt>
                <dd className="mt-1 text-base text-sand">{userEmail}</dd>
              </div>
              <div>
                <dt className="text-white/45">{t('shell.month')}</dt>
                <dd className="mt-1 text-base text-sand">{month}</dd>
              </div>
              <div>
                <dt className="text-white/45">{t('dashboard.status')}</dt>
                <dd className="mt-1 text-base text-sand">{isLoading ? t('dashboard.status.loading') : t('dashboard.status.ready')}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-coral/30 bg-coral/10 px-5 py-4 text-sm text-coral">{error}</div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t('metric.income')} value={formatCurrency(overview?.totalIncome ?? 0)} tone="positive" />
        <MetricCard label={t('metric.expense')} value={formatCurrency(overview?.totalExpense ?? 0)} tone="warning" />
        <MetricCard label={t('metric.balance')} value={formatCurrency(overview?.balance ?? 0)} tone="neutral" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title={t('transactions.recent')} eyebrow={t('transactions.timeline')}>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-medium text-white">{item.note || item.categoryName || item.type}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
                    {item.occurredOn} · {item.categoryName || t('transactions.uncategorized')}
                  </p>
                </div>
                <p className={item.type === 'income' ? 'text-reef' : 'text-coral'}>{formatCurrency(item.amount)}</p>
              </div>
            ))}
            {transactions.length === 0 ? <p className="text-sm text-white/55">{t('transactions.empty')}</p> : null}
          </div>
        </Panel>

        <Panel title={t('budgets.lanes')} eyebrow={t('budgets.planning')}>
          <div className="space-y-3">
            {budgets.map((budget) => (
              <div key={budget.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{budget.categoryName || t('budgets.wholeMonth')}</p>
                  <p className="text-sand">{formatCurrency(budget.amount)}</p>
                </div>
              </div>
            ))}
            {budgets.length === 0 ? <p className="text-sm text-white/55">{t('budgets.empty')}</p> : null}
          </div>
        </Panel>
      </section>
    </>
  );
}
