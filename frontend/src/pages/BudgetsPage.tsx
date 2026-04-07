import { FormEvent, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { Panel } from '../components/Panel';
import { useBudgetMutations } from '../hooks/useBudgetMutations';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { usePreferences } from '../providers/PreferencesProvider';

interface ShellContext {
  month: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export function BudgetsPage(): JSX.Element {
  const { month } = useOutletContext<ShellContext>();
  const { budgets, error: budgetsError, reload: reloadBudgets } = useBudgets(month);
  const { categories, error: categoriesError, reload: reloadCategories } = useCategories();
  const { t } = usePreferences();
  const error = budgetsError ?? categoriesError;
  const expenseCategories = categories.filter((category) => category.type === 'expense');
  const [form, setForm] = useState({ amount: '', categoryId: '' });
  const isAmountValid = Number(form.amount) >= 0 && form.amount !== '';
  const { status, isSaving, upsert } = useBudgetMutations({
    onAfterUpsert: async () => Promise.all([reloadBudgets(), reloadCategories()]).then(() => undefined),
    onErrorMessage: t('status.failedBudget'),
    onSavedMessage: t('budgets.saved'),
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!isAmountValid) {
      return;
    }

    await upsert({
      month,
      amount: Number(form.amount),
      categoryId: form.categoryId || undefined,
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Panel title={t('budgets.writer')} eyebrow={month}>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <p className="text-sm leading-6 text-white/60">{t('budgets.helper')}</p>
          <label className="field">
            <span className="field-label">{t('budgets.categoryScope')}</span>
            <select
              className="text-input"
              value={form.categoryId}
              onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
            >
              <option value="">{t('budgets.wholeMonth')}</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          {expenseCategories.length === 0 ? <p className="text-xs text-white/50">{t('transactions.categoryHint')}</p> : null}
          <label className="field">
            <span className="field-label">{t('budgets.amount')}</span>
            <input
              className="text-input"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            />
          </label>
          {!isAmountValid ? <p className="text-sm text-white/55">{t('budgets.amountRequired')}</p> : null}
          <button className="primary-button w-full" disabled={isSaving || !isAmountValid} type="submit">
            {t('budgets.save')}
          </button>
          {status ? <p className="text-sm text-white/70">{status}</p> : null}
          {error ? <p className="text-sm text-coral">{error}</p> : null}
        </form>
      </Panel>

      <Panel title={t('budgets.lanes')} eyebrow={t('budgets.stored')}>
        <div className="space-y-3">
          {budgets.map((budget) => (
            <div key={budget.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{budget.categoryName || t('budgets.wholeMonth')}</p>
                <p className="text-sand">{formatCurrency(budget.amount)}</p>
              </div>
            </div>
          ))}
          {budgets.length === 0 ? <p className="text-sm text-white/55">{t('budgets.emptyMonth')}</p> : null}
        </div>
      </Panel>
    </div>
  );
}
