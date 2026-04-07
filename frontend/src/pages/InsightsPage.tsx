import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { Panel } from '../components/Panel';
import { useFinancialGoal } from '../hooks/useFinancialGoal';
import { useFinancialGoalMutations } from '../hooks/useFinancialGoalMutations';
import { useTransactions } from '../hooks/useTransactions';
import { useMonthlyGoal } from '../hooks/useMonthlyGoal';
import { useOverview } from '../hooks/useOverview';
import { usePreferences } from '../providers/PreferencesProvider';
import type { MonthlyGoal, Transaction } from '../types';

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

function getMonthProgress(month: string): { daysElapsed: number; daysInMonth: number } {
  const now = new Date();
  const [year, monthNumber] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  if (now.getUTCFullYear() === year && now.getUTCMonth() + 1 === monthNumber) {
    return {
      daysElapsed: Math.min(now.getUTCDate(), daysInMonth),
      daysInMonth,
    };
  }

  const isPastMonth =
    year < now.getUTCFullYear() || (year === now.getUTCFullYear() && monthNumber < now.getUTCMonth() + 1);

  return {
    daysElapsed: isPastMonth ? daysInMonth : 1,
    daysInMonth,
  };
}

function getGoalStatus(
  goal: MonthlyGoal | null,
  currentSavings: number,
  projectedMonthEndBalance: number,
): 'onTrack' | 'atRisk' | 'offTrack' {
  if (!goal || goal.savingsTarget <= 0) {
    return projectedMonthEndBalance >= 0 ? 'onTrack' : 'atRisk';
  }

  if (projectedMonthEndBalance >= goal.savingsTarget) {
    return 'onTrack';
  }

  if (currentSavings >= 0) {
    return 'atRisk';
  }

  return 'offTrack';
}

function buildMilestones(target: number): number[] {
  if (target <= 0) {
    return [];
  }

  return [0.25, 0.5, 0.75, 1].map((ratio) => Math.round(target * ratio));
}

function buildTrendSeries(transactions: Transaction[]): Array<{ label: string; net: number }> {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    const signedAmount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
    totals.set(transaction.occurredOn, (totals.get(transaction.occurredOn) ?? 0) + signedAmount);
  }

  return [...totals.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .slice(-12)
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

export function InsightsPage(): JSX.Element {
  const { month, fromDate, toDate } = useOutletContext<ShellContext>();
  const { t } = usePreferences();
  const hasCustomRange = Boolean(fromDate && toDate);
  const filter = hasCustomRange ? { from: fromDate, to: toDate } : { month };
  const { overview, isLoading: isOverviewLoading, error: overviewError } = useOverview(filter);
  const { transactions, isLoading: isTransactionsLoading, error: transactionsError } = useTransactions(filter);
  const { transactions: allTransactions, isLoading: isLifetimeLoading, error: lifetimeError } = useTransactions();
  const { monthlyGoal, isLoading: isGoalLoading, error: goalError } = useMonthlyGoal(month);
  const {
    financialGoal,
    isLoading: isFinancialGoalLoading,
    error: financialGoalError,
    reload: reloadFinancialGoal,
  } = useFinancialGoal('long_term_savings');
  const [longTermGoalInput, setLongTermGoalInput] = useState('');
  const { status: financialGoalStatusMessage, isSaving: isSavingFinancialGoal, save } = useFinancialGoalMutations({
    onAfterSave: async () => reloadFinancialGoal(),
    onErrorMessage: t('dashboard.goalSaveFailed'),
    onSavedMessage: t('dashboard.goalSaved'),
  });

  const monthProgress = useMemo(() => getMonthProgress(month), [month]);
  const currentSavings = overview?.balance ?? 0;
  const savingsTarget = monthlyGoal?.savingsTarget ?? 0;
  const targetGap = savingsTarget - currentSavings;
  const projectedMonthEndBalance = currentSavings / monthProgress.daysElapsed * monthProgress.daysInMonth;
  const goalStatus = getGoalStatus(monthlyGoal, currentSavings, projectedMonthEndBalance);
  const lifetimeBalance = allTransactions.reduce(
    (sum, transaction) => sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
    0,
  );
  const longTermTarget = Number(longTermGoalInput || 0);
  const longTermGap = Math.max(longTermTarget - lifetimeBalance, 0);
  const longTermProgress = longTermTarget > 0 ? Math.max(0, Math.min((lifetimeBalance / longTermTarget) * 100, 100)) : 0;
  const milestones = buildMilestones(longTermTarget);
  const monthlyRunway = savingsTarget > 0 ? longTermGap / savingsTarget : 0;
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
  const isLoading =
    isOverviewLoading || isTransactionsLoading || isLifetimeLoading || isGoalLoading || isFinancialGoalLoading;
  const error = overviewError ?? transactionsError ?? lifetimeError ?? goalError ?? financialGoalError;

  useEffect(() => {
    setLongTermGoalInput(financialGoal ? String(financialGoal.targetAmount) : '10000');
  }, [financialGoal?.id, financialGoal?.targetAmount]);

  async function handleFinancialGoalSave(): Promise<void> {
    if (longTermGoalInput === '' || Number(longTermGoalInput) < 0) {
      return;
    }

    await save({
      goalType: 'long_term_savings',
      targetAmount: Number(longTermGoalInput),
    });
  }

  return (
    <>
      <section className="glass-panel overflow-hidden">
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-reef">{t('nav.insights')}</p>
            <h2 className="mt-4 text-5xl leading-none">{t('dashboard.cashFlowTrend')}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              Keep the homepage light, and use this page for deeper trend reading and longer-term money goals.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-black/15 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">{t('dashboard.goalStatus')}</p>
            <p
              className={`mt-4 text-3xl ${
                goalStatus === 'onTrack'
                  ? 'text-reef'
                  : goalStatus === 'atRisk'
                    ? 'text-sand'
                    : 'text-coral'
              }`}
            >
              {goalStatus === 'onTrack'
                ? t('dashboard.status.onTrack')
                : goalStatus === 'atRisk'
                  ? t('dashboard.status.atRisk')
                  : t('dashboard.status.offTrack')}
            </p>
            <p className="mt-4 text-sm text-white/55">
              {hasCustomRange ? `${fromDate} → ${toDate}` : month}
            </p>
            <p className="mt-2 text-sm text-white/55">{isLoading ? t('dashboard.status.loading') : t('dashboard.status.ready')}</p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-coral/30 bg-coral/10 px-5 py-4 text-sm text-coral">{error}</div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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

        <Panel title={t('dashboard.longTermGoal')} eyebrow={t('dashboard.wealthTrack')}>
          <div className="space-y-4">
            <label className="field">
              <span className="field-label">{t('dashboard.longTermTarget')}</span>
              <input
                className="text-input"
                min="0"
                step="0.01"
                type="number"
                value={longTermGoalInput}
                onChange={(event) => setLongTermGoalInput(event.target.value)}
              />
            </label>
            <button
              className="primary-button w-full"
              disabled={isSavingFinancialGoal || longTermGoalInput === '' || Number(longTermGoalInput) < 0}
              onClick={() => void handleFinancialGoalSave()}
              type="button"
            >
              {t('dashboard.saveGoal')}
            </button>
            {financialGoalStatusMessage ? <p className="text-sm text-white/70">{financialGoalStatusMessage}</p> : null}
            <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-white/55">{t('dashboard.longTermProgress')}</p>
                <p className="text-sm text-sand">{longTermProgress.toFixed(1)}%</p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-reef" style={{ width: `${longTermProgress}%` }} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{t('dashboard.lifetimeSavings')}</p>
                  <p className="mt-2 text-lg text-white">{formatCurrency(lifetimeBalance)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{t('dashboard.longTermGap')}</p>
                  <p className="mt-2 text-lg text-sand">{formatCurrency(longTermGap)}</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title={t('dashboard.milestones')} eyebrow={t('dashboard.longTermTarget')}>
          <div className="space-y-3">
            {milestones.length > 0 ? (
              milestones.map((value, index) => {
                const reached = lifetimeBalance >= value;

                return (
                  <div key={`${value}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">
                        {t('dashboard.milestone')} {index + 1}
                      </p>
                      <p className={reached ? 'text-reef' : 'text-sand'}>{formatCurrency(value)}</p>
                    </div>
                    <p className="mt-3 text-sm text-white/60">
                      {reached
                        ? t('dashboard.milestoneReached')
                        : `${t('dashboard.milestoneRemaining')} ${formatCurrency(Math.max(value - lifetimeBalance, 0))}`}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-white/55">{t('dashboard.setLongTermTargetHint')}</p>
            )}
          </div>
        </Panel>

        <Panel title={t('dashboard.targetRunway')} eyebrow={t('dashboard.monthlyTarget')}>
          <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
            <p className="text-sm text-white/55">{t('dashboard.currentSavings')}</p>
            <p className="mt-3 text-2xl text-white">{formatCurrency(currentSavings)}</p>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/55">{t('dashboard.targetGap')}</p>
              <p className={targetGap > 0 ? 'text-coral' : 'text-reef'}>{formatCurrency(Math.abs(targetGap))}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/55">{t('dashboard.projectedMonthEnd')}</p>
              <p className="text-white">{formatCurrency(projectedMonthEndBalance)}</p>
            </div>
            {monthlyRunway > 0 ? (
              <p className="mt-4 text-sm leading-7 text-white/65">
                {monthlyRunway.toFixed(1)} {t('dashboard.monthsAtCurrentPace')}
              </p>
            ) : null}
          </div>
        </Panel>
      </section>
    </>
  );
}
