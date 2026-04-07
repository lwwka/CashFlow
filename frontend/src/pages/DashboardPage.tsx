import { useOutletContext } from 'react-router-dom';

import { MetricCard } from '../components/MetricCard';
import { Panel } from '../components/Panel';
import { useBudgets } from '../hooks/useBudgets';
import { useOverview } from '../hooks/useOverview';
import { useTransactions } from '../hooks/useTransactions';
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

export function DashboardPage(): JSX.Element {
  const { month, fromDate, toDate } = useOutletContext<ShellContext>();
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

  return (
    <>
      <section className="glass-panel overflow-hidden">
        <div className="px-6 py-8">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-reef">{t('dashboard.eyebrow')}</p>
            <h2 className="mt-4 text-5xl leading-none">{t('dashboard.title')}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">{t('dashboard.description')}</p>
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
