import { Link, useOutletContext } from 'react-router-dom';

import { MetricCard } from '../components/MetricCard';
import { Panel } from '../components/Panel';
import { useOverview } from '../hooks/useOverview';
import { useTransactions } from '../hooks/useTransactions';
import { usePreferences } from '../providers/PreferencesProvider';
import type { Transaction } from '../types';

interface ShellContext {
  month: string;
  fromDate: string;
  toDate: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export function DashboardPage(): JSX.Element {
  const { month, fromDate, toDate } = useOutletContext<ShellContext>();
  const hasCustomRange = Boolean(fromDate && toDate);
  const filter = hasCustomRange ? { from: fromDate, to: toDate } : { month };
  const { overview, isLoading: isOverviewLoading, error: overviewError } = useOverview(filter);
  const { transactions, isLoading: isTransactionsLoading, error: transactionsError } = useTransactions(filter);
  const { t } = usePreferences();
  const isLoading = isOverviewLoading || isTransactionsLoading;
  const error = overviewError ?? transactionsError;
  const currentBalance = overview?.balance ?? 0;

  const nextStepLink = transactions.length === 0 ? '/transactions' : '/goals';
  const nextStepLabel = transactions.length === 0 ? t('dashboard.openTransactionsQuick') : t('dashboard.openGoalsQuick');
  const expenseItems = transactions.filter((item) => item.type === 'expense');
  const expenseRatio =
    (overview?.totalIncome ?? 0) > 0 ? (overview?.totalExpense ?? 0) / (overview?.totalIncome ?? 0) : 0;
  const isSpendingHeavy = (overview?.totalIncome ?? 0) > 0 && expenseRatio > 0.8;
  const spendingRateLabel =
    (overview?.totalIncome ?? 0) > 0 ? `${(expenseRatio * 100).toFixed(0)}%` : '未開始';
  const budgetMessage =
    expenseItems.length === 0
      ? t('dashboard.budgetSafe')
      : isSpendingHeavy
        ? t('dashboard.budgetRisk').replace('{count}', String(expenseItems.length))
        : t('dashboard.budgetSafe');

  return (
    <>
      <section className="glass-panel overflow-hidden">
        <div className="px-6 py-8">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-reef">{t('dashboard.eyebrow')}</p>
            <h2 className="mt-4 text-5xl leading-none">{t('dashboard.title')}</h2>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-coral/30 bg-coral/10 px-5 py-4 text-sm text-coral">{error}</div>
      ) : null}

      {hasCustomRange ? (
        <div className="rounded-3xl border border-sand/20 bg-sand/10 px-5 py-4 text-sm text-sand">
          {t('shell.dashboardRangeHint')}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label={t('metric.income')} value={formatCurrency(overview?.totalIncome ?? 0)} tone="positive" />
        <MetricCard label={t('metric.expense')} value={formatCurrency(overview?.totalExpense ?? 0)} tone="warning" />
        <MetricCard label={t('metric.balance')} value={formatCurrency(overview?.balance ?? 0)} tone="neutral" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Panel title="本月提醒" eyebrow={month}>
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">已用收入</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <p className={`text-3xl font-semibold leading-none sm:text-4xl ${isSpendingHeavy ? 'text-coral' : 'text-reef'}`}>
                  {spendingRateLabel}
                </p>
                <p className="text-right text-sm leading-6 text-white/60">
                  {(overview?.totalIncome ?? 0) > 0
                    ? isSpendingHeavy
                      ? '這個月已接近支出壓力區。'
                      : '目前仍在可控範圍。'
                    : '先記一筆收入，數字會更準。'}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">現在要做什麼</p>
                  <p className="mt-3 text-base font-semibold leading-tight text-white sm:text-lg">{nextStepLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{budgetMessage}</p>
                </div>
                <Link className="inline-flex shrink-0 text-sm font-semibold text-reef" to={nextStepLink}>
                  {transactions.length === 0 ? t('dashboard.openTransactions') : t('dashboard.openGoals')}
                </Link>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="常用動作" eyebrow="直接開始">
          <div className="grid gap-3 md:grid-cols-2">
            <Link
              className="rounded-2xl border border-white/10 bg-black/15 px-4 py-5 transition hover:bg-white/5"
              to="/transactions"
            >
              <p className="text-sm font-medium text-white">記一筆收入或支出</p>
              <p className="mt-3 inline-flex text-sm font-semibold text-reef">{t('dashboard.openTransactions')}</p>
            </Link>
            <Link
              className="rounded-2xl border border-white/10 bg-black/15 px-4 py-5 transition hover:bg-white/5"
              to="/goals"
            >
              <p className="text-sm font-medium text-white">看今個月是否達標</p>
              <p className="mt-3 inline-flex text-sm font-semibold text-sand">{t('dashboard.openGoals')}</p>
            </Link>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6">
        <Panel title={t('transactions.recent')} eyebrow={t('transactions.timeline')}>
          <div className="space-y-3">
            {transactions.slice(0, 3).map((item) => (
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
      </section>
    </>
  );
}
