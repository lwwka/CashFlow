import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { MetricCard } from '../components/MetricCard';
import { Panel } from '../components/Panel';
import { useMonthlyGoal } from '../hooks/useMonthlyGoal';
import { useMonthlyGoalMutations } from '../hooks/useMonthlyGoalMutations';
import { useOverview } from '../hooks/useOverview';
import type { MonthlyGoal } from '../types';
import { usePreferences } from '../providers/PreferencesProvider';

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

export function GoalsPage(): JSX.Element {
  const { month, fromDate, toDate } = useOutletContext<ShellContext>();
  const { t } = usePreferences();
  const hasCustomRange = Boolean(fromDate && toDate);
  const { overview, isLoading: isOverviewLoading, error: overviewError } = useOverview(
    hasCustomRange ? { from: fromDate, to: toDate } : { month },
  );
  const { monthlyGoal, isLoading: isGoalLoading, error: goalError, reload: reloadGoal } = useMonthlyGoal(month);
  const [goalInput, setGoalInput] = useState('');
  const { status: goalStatusMessage, isSaving: isSavingGoal, save } = useMonthlyGoalMutations({
    onAfterSave: async () => reloadGoal(),
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
  const isLoading = isOverviewLoading || isGoalLoading;
  const error = overviewError ?? goalError;

  useEffect(() => {
    setGoalInput(monthlyGoal ? String(monthlyGoal.savingsTarget) : '');
  }, [monthlyGoal?.id, monthlyGoal?.savingsTarget]);

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

  return (
    <>
      <section className="glass-panel overflow-hidden">
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-reef">{t('dashboard.goalSummary')}</p>
            <h2 className="mt-4 text-5xl leading-none">{t('dashboard.projectedMonthEnd')}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              Focus this page on one thing: whether this month is still on track for your savings target and how much room you have left to correct course.
            </p>
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
              {t('dashboard.daysProgress')}: {monthProgress.daysElapsed}/{monthProgress.daysInMonth}
            </p>
            <p className="mt-2 text-sm text-white/55">{isLoading ? t('dashboard.status.loading') : t('dashboard.status.ready')}</p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-3xl border border-coral/30 bg-coral/10 px-5 py-4 text-sm text-coral">{error}</div>
      ) : null}

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
    </>
  );
}
