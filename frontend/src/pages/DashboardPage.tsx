import { useOutletContext } from 'react-router-dom';

import { MetricCard } from '../components/MetricCard';
import { Panel } from '../components/Panel';
import { useBudgets } from '../hooks/useBudgets';
import { useOverview } from '../hooks/useOverview';
import { useTransactions } from '../hooks/useTransactions';
import { useAuth } from '../providers/AuthProvider';
import { usePreferences } from '../providers/PreferencesProvider';
import type { Budget, Transaction } from '../types';

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

function buildTopExpenseCategories(transactions: Transaction[]): Array<{ name: string; amount: number }> {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') {
      continue;
    }

    const key = transaction.categoryName || 'Uncategorized';
    totals.set(key, (totals.get(key) ?? 0) + transaction.amount);
  }

  return [...totals.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 4);
}

function buildBudgetComparison(
  budgets: Budget[],
  transactions: Transaction[],
): Array<{ id: string; name: string; budget: number; actual: number; remaining: number }> {
  return budgets
    .filter((budget) => Boolean(budget.categoryId))
    .map((budget) => {
      const actual = transactions
        .filter((transaction) => transaction.type === 'expense' && transaction.categoryId === budget.categoryId)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      return {
        id: budget.id,
        name: budget.categoryName || 'Uncategorized',
        budget: budget.amount,
        actual,
        remaining: budget.amount - actual,
      };
    })
    .sort((left, right) => left.remaining - right.remaining);
}

function buildTrendSeries(transactions: Transaction[]): Array<{ label: string; net: number }> {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    const signedAmount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    totals.set(transaction.occurredOn, (totals.get(transaction.occurredOn) ?? 0) + signedAmount);
  }

  return [...totals.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .slice(-10)
    .map(([label, net]) => ({ label: label.slice(5), net }));
}

function buildTrendPolyline(points: Array<{ label: string; net: number }>): string {
  if (points.length === 0) {
    return '';
  }

  const width = 320;
  const height = 110;
  const values = points.map((point) => point.net);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = height - ((point.net - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
}

export function DashboardPage(): JSX.Element {
  const { month, fromDate, toDate } = useOutletContext<ShellContext>();
  const { profile } = useAuth();
  const hasCustomRange = Boolean(fromDate && toDate);
  const filter = hasCustomRange ? { from: fromDate, to: toDate } : { month };
  const { overview, isLoading: isOverviewLoading, error: overviewError } = useOverview(filter);
  const { transactions, isLoading: isTransactionsLoading, error: transactionsError } = useTransactions(filter);
  const { budgets, isLoading: isBudgetsLoading, error: budgetsError } = useBudgets(month);
  const { t } = usePreferences();
  const isLoading = isOverviewLoading || isTransactionsLoading || isBudgetsLoading;
  const error = overviewError ?? transactionsError ?? budgetsError;
  const topExpenseCategories = buildTopExpenseCategories(transactions);
  const budgetComparison = buildBudgetComparison(budgets, transactions);
  const trendSeries = buildTrendSeries(transactions);
  const trendPolyline = buildTrendPolyline(trendSeries);
  const bestTrendPoint = trendSeries.reduce<{ label: string; net: number } | null>(
    (best, point) => (!best || point.net > best.net ? point : best),
    null,
  );
  const worstTrendPoint = trendSeries.reduce<{ label: string; net: number } | null>(
    (worst, point) => (!worst || point.net < worst.net ? point : worst),
    null,
  );

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
                <dd className="mt-1 text-base text-sand">{profile?.email ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-white/45">{t('shell.month')}</dt>
                <dd className="mt-1 text-base text-sand">{hasCustomRange ? `${fromDate} → ${toDate}` : month}</dd>
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

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title={t('dashboard.cashFlowTrend')} eyebrow={t('dashboard.decisionLayer')}>
          {trendSeries.length > 0 ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <svg className="h-[140px] w-full" viewBox="0 0 320 120" preserveAspectRatio="none" role="img">
                  <line x1="0" y1="60" x2="320" y2="60" stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />
                  <polyline
                    fill="none"
                    stroke="rgb(72 225 207)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={trendPolyline}
                  />
                </svg>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{t('dashboard.bestDay')}</p>
                  <p className="mt-3 text-lg text-reef">
                    {bestTrendPoint ? `${bestTrendPoint.label} · ${formatCurrency(bestTrendPoint.net)}` : '-'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{t('dashboard.worstDay')}</p>
                  <p className="mt-3 text-lg text-coral">
                    {worstTrendPoint ? `${worstTrendPoint.label} · ${formatCurrency(worstTrendPoint.net)}` : '-'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/55">{t('dashboard.noTrendData')}</p>
          )}
        </Panel>

        <Panel title={t('dashboard.topCategories')} eyebrow={t('dashboard.spendingHotspots')}>
          <div className="space-y-3">
            {topExpenseCategories.map((item, index) => (
              <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">#{index + 1}</p>
                    <p className="mt-2 font-medium text-white">{item.name}</p>
                  </div>
                  <p className="text-coral">{formatCurrency(item.amount)}</p>
                </div>
              </div>
            ))}
            {topExpenseCategories.length === 0 ? <p className="text-sm text-white/55">{t('dashboard.noExpenseData')}</p> : null}
          </div>
        </Panel>

        <Panel title={t('dashboard.budgetVsActual')} eyebrow={t('dashboard.budgetPulse')}>
          <div className="space-y-3">
            {budgetComparison.map((item) => {
              const percent = item.budget > 0 ? Math.min((item.actual / item.budget) * 100, 100) : 0;
              const isOverBudget = item.remaining < 0;

              return (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-sand">{formatCurrency(item.budget)}</p>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={isOverBudget ? 'h-full rounded-full bg-coral' : 'h-full rounded-full bg-reef'}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <p className="text-white/60">
                      {t('dashboard.actualSpend')}: <span className="text-white">{formatCurrency(item.actual)}</span>
                    </p>
                    <p className={isOverBudget ? 'text-coral' : 'text-white/60'}>
                      {isOverBudget ? t('dashboard.overBudget') : t('dashboard.remaining')}:{' '}
                      <span className={isOverBudget ? 'text-coral' : 'text-white'}>
                        {formatCurrency(Math.abs(item.remaining))}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
            {budgetComparison.length === 0 ? <p className="text-sm text-white/55">{t('dashboard.noBudgetData')}</p> : null}
          </div>
        </Panel>
      </section>
    </>
  );
}
