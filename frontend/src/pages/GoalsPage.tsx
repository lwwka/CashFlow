import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { MetricCard } from '../components/MetricCard';
import { Panel } from '../components/Panel';
import { useFinancialGoal } from '../hooks/useFinancialGoal';
import { useFinancialGoalMutations } from '../hooks/useFinancialGoalMutations';
import { useMonthlyGoal } from '../hooks/useMonthlyGoal';
import { useMonthlyGoalMutations } from '../hooks/useMonthlyGoalMutations';
import { useOverview } from '../hooks/useOverview';
import { useTransactions } from '../hooks/useTransactions';
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

export function GoalsPage(): JSX.Element {
  const { month, fromDate, toDate } = useOutletContext<ShellContext>();
  const { t } = usePreferences();
  const hasCustomRange = Boolean(fromDate && toDate);
  const filter = hasCustomRange ? { from: fromDate, to: toDate } : { month };
  const { overview, isLoading: isOverviewLoading, error: overviewError } = useOverview(filter);
  const { transactions, isLoading: isTransactionsLoading, error: transactionsError } = useTransactions(filter);
  const { transactions: allTransactions, isLoading: isLifetimeLoading, error: lifetimeError } = useTransactions();
  const { monthlyGoal, isLoading: isGoalLoading, error: goalError, reload: reloadGoal } = useMonthlyGoal(month);
  const {
    financialGoal,
    isLoading: isFinancialGoalLoading,
    error: financialGoalError,
    reload: reloadFinancialGoal,
  } = useFinancialGoal('long_term_savings');
  const [goalInput, setGoalInput] = useState('');
  const [longTermGoalInput, setLongTermGoalInput] = useState('');
  const { status: goalStatusMessage, isSaving: isSavingGoal, save } = useMonthlyGoalMutations({
    onAfterSave: async () => reloadGoal(),
    onErrorMessage: t('dashboard.goalSaveFailed'),
    onSavedMessage: t('dashboard.goalSaved'),
  });
  const { status: financialGoalStatusMessage, isSaving: isSavingFinancialGoal, save: saveFinancialGoal } =
    useFinancialGoalMutations({
      onAfterSave: async () => reloadFinancialGoal(),
      onErrorMessage: t('dashboard.goalSaveFailed'),
      onSavedMessage: t('dashboard.goalSaved'),
    });

  const monthProgress = useMemo(() => getMonthProgress(month), [month]);
  const currentSavings = overview?.balance ?? 0;
  const savingsTarget = monthlyGoal?.savingsTarget ?? 0;
  const targetGap = savingsTarget - currentSavings;
  const savingsRate = overview?.totalIncome ? currentSavings / overview.totalIncome : 0;
  const projectedMonthEndBalance = currentSavings / monthProgress.daysElapsed * monthProgress.daysInMonth;
  const projectedIncome = (overview?.totalIncome ?? 0) / monthProgress.daysElapsed * monthProgress.daysInMonth;
  const projectedSavingsRate = projectedIncome > 0 ? projectedMonthEndBalance / projectedIncome : 0;
  const goalStatus = getGoalStatus(monthlyGoal, currentSavings, projectedMonthEndBalance);
  const goalProgressPercent =
    savingsTarget > 0 ? Math.max(0, Math.min((currentSavings / savingsTarget) * 100, 100)) : 0;
  const lifetimeBalance = allTransactions.reduce(
    (sum, transaction) => sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
    0,
  );
  const longTermTarget = Number(longTermGoalInput || 0);
  const longTermGap = Math.max(longTermTarget - lifetimeBalance, 0);
  const longTermProgress = longTermTarget > 0 ? Math.max(0, Math.min((lifetimeBalance / longTermTarget) * 100, 100)) : 0;
  const monthlyRunway = savingsTarget > 0 ? longTermGap / savingsTarget : 0;
  const milestones = buildMilestones(longTermTarget);
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
    isOverviewLoading || isGoalLoading || isTransactionsLoading || isLifetimeLoading || isFinancialGoalLoading;
  const error = overviewError ?? goalError ?? transactionsError ?? lifetimeError ?? financialGoalError;

  useEffect(() => {
    setGoalInput(monthlyGoal ? String(monthlyGoal.savingsTarget) : '');
  }, [monthlyGoal?.id, monthlyGoal?.savingsTarget]);

  useEffect(() => {
    setLongTermGoalInput(financialGoal ? String(financialGoal.targetAmount) : '10000');
  }, [financialGoal?.id, financialGoal?.targetAmount]);

  async function handleGoalSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (goalInput === '' || Number(goalInput) < 0) {
      return;
    }

    await save({
      month,
      savingsTarget: Number(goalInput),
    });
  }

  async function handleFinancialGoalSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (longTermGoalInput === '' || Number(longTermGoalInput) < 0) {
      return;
    }

    await saveFinancialGoal({
      goalType: 'long_term_savings',
      targetAmount: Number(longTermGoalInput),
    });
  }

  return (
    <>
      <section className="glass-panel overflow-hidden">
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-reef">{t('nav.goals')}</p>
            <h2 className="mt-4 text-5xl leading-none">本月目標與長期方向</h2>
            {hasCustomRange ? (
              <p className="mt-4 text-sm leading-7 text-sand">{t('shell.goalsRangeHint')}</p>
            ) : null}
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

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-5">
          <p className="text-sm font-medium text-white">Monthly focus 本月重點</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-5">
          <p className="text-sm font-medium text-white">Long-term direction 長期方向</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label={t('dashboard.monthlyTarget')} value={formatCurrency(savingsTarget)} tone="neutral" />
        <MetricCard label={t('dashboard.currentSavings')} value={formatCurrency(currentSavings)} tone="positive" />
        <MetricCard label={t('dashboard.targetGap')} value={formatCurrency(Math.abs(targetGap))} tone={targetGap > 0 ? 'warning' : 'positive'} />
        <MetricCard label={t('dashboard.projectedMonthEnd')} value={formatCurrency(projectedMonthEndBalance)} tone="neutral" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title={t('dashboard.goalSummary')} eyebrow={month}>
          <form className="space-y-4" onSubmit={(event) => void handleGoalSubmit(event)}>
            <label className="field">
              <span className="field-label">{t('dashboard.monthlyTarget')}</span>
              <input
                className="text-input"
                min="0"
                step="0.01"
                type="number"
                value={goalInput}
                onChange={(event) => setGoalInput(event.target.value)}
              />
            </label>
            <button className="primary-button w-full" disabled={isSavingGoal || goalInput === '' || Number(goalInput) < 0} type="submit">
              {t('dashboard.saveGoal')}
            </button>
            {goalStatusMessage ? <p className="text-sm text-white/70">{goalStatusMessage}</p> : null}
          </form>
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-white/55">{t('dashboard.goalProgress')}</p>
              <p className="text-sm text-sand">{goalProgressPercent.toFixed(1)}%</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-reef"
                style={{ width: `${goalProgressPercent}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-white/55">{t('dashboard.currentSavings')}</p>
              <p className="text-white">{formatCurrency(currentSavings)}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-white/55">{t('dashboard.monthlyTarget')}</p>
              <p className="text-white">{formatCurrency(savingsTarget)}</p>
            </div>
          </div>
        </Panel>

        <Panel title={t('dashboard.goalStatus')} eyebrow={t('dashboard.projectedSavingsRate')}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">{t('dashboard.savingsRate')}</p>
              <p className="mt-3 text-2xl text-sand">{(savingsRate * 100).toFixed(1)}%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">{t('dashboard.projectedSavingsRate')}</p>
              <p className="mt-3 text-2xl text-sand">{(projectedSavingsRate * 100).toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/55">{t('dashboard.targetGap')}</p>
              <p className={targetGap > 0 ? 'text-coral' : 'text-reef'}>{formatCurrency(Math.abs(targetGap))}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/55">{t('dashboard.projectedMonthEnd')}</p>
              <p className="text-white">{formatCurrency(projectedMonthEndBalance)}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-white/55">{t('dashboard.monthEndSummary')}</p>
              <p className={targetGap <= 0 ? 'text-reef' : 'text-coral'}>
                {targetGap <= 0 ? t('dashboard.targetReached') : t('dashboard.actionNeeded')}
              </p>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/65">
              {targetGap <= 0
                ? `You are ahead of target by ${formatCurrency(Math.abs(targetGap))}.`
                : `You still need ${formatCurrency(targetGap)} to reach this month's target.`}
            </p>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title={t('dashboard.longTermGoal')} eyebrow={t('dashboard.wealthTrack')}>
          <form className="space-y-4" onSubmit={(event) => void handleFinancialGoalSave(event)}>
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
              type="submit"
            >
              儲存長期目標
            </button>
            {financialGoalStatusMessage ? <p className="text-sm text-white/70">{financialGoalStatusMessage}</p> : null}
          </form>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
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

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-sm text-white/55">Milestones 里程碑</p>
            <div className="mt-3 space-y-2">
              {milestones.length > 0 ? (
                milestones.map((value, index) => {
                  const reached = lifetimeBalance >= value;

                  return (
                    <div key={`${value}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-white/65">
                        {t('dashboard.milestone')} {index + 1}
                      </span>
                      <span className={reached ? 'text-reef' : 'text-sand'}>{formatCurrency(value)}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-white/55">{t('dashboard.setLongTermTargetHint')}</p>
              )}
            </div>
            {monthlyRunway > 0 ? (
              <p className="mt-4 text-sm leading-7 text-white/65">
                {monthlyRunway.toFixed(1)} {t('dashboard.monthsAtCurrentPace')}
              </p>
            ) : null}
          </div>
        </Panel>

        <details className="rounded-[28px] border border-white/10 bg-[#132736]/80 px-5 py-5">
          <summary className="cursor-pointer list-none text-base font-semibold text-white">
            {t('dashboard.cashFlowTrend')}
            <span className="ml-3 text-sm font-normal text-white/45">Open only when you want a deeper read</span>
          </summary>
          <div className="mt-4">
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
          </div>
        </details>
      </section>
    </>
  );
}
