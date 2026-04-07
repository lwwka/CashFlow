import { FormEvent, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { Panel } from '../components/Panel';
import { useBudgetMutations } from '../hooks/useBudgetMutations';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { usePreferences } from '../providers/PreferencesProvider';
import type { Budget } from '../types';

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
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const isAmountValid = Number(form.amount) >= 0 && form.amount !== '';
  const { status, isSaving, upsert, remove } = useBudgetMutations({
    onAfterUpsert: async () => Promise.all([reloadBudgets(), reloadCategories()]).then(() => undefined),
    onAfterDelete: async () => reloadBudgets(),
    onErrorMessage: t('status.failedBudget'),
    onSavedMessage: t('budgets.saved'),
    onDeletedMessage: t('budgets.deleted'),
  });

  function resetForm(): void {
    setEditingBudgetId(null);
    setForm({ amount: '', categoryId: '' });
  }

  function startEditing(budget: Budget): void {
    setEditingBudgetId(budget.id);
    setForm({
      amount: String(budget.amount),
      categoryId: budget.categoryId ?? '',
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!isAmountValid) {
      return;
    }

    const didSave = await upsert({
      month,
      amount: Number(form.amount),
      categoryId: form.categoryId || undefined,
    });

    if (didSave) {
      resetForm();
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (editingBudgetId === id) {
      resetForm();
    }

    await remove(id);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Panel title={editingBudgetId ? t('budgets.edit') : t('budgets.writer')} eyebrow={month}>
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
          <div className="space-y-3">
            <button className="primary-button w-full" disabled={isSaving || !isAmountValid} type="submit">
              {editingBudgetId ? t('budgets.update') : t('budgets.save')}
            </button>
            {editingBudgetId ? (
              <button
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                onClick={resetForm}
                type="button"
              >
                {t('budgets.cancelEdit')}
              </button>
            ) : null}
          </div>
          {status ? <p className="text-sm text-white/70">{status}</p> : null}
          {error ? <p className="text-sm text-coral">{error}</p> : null}
        </form>
      </Panel>

      <Panel title={t('budgets.lanes')} eyebrow={t('budgets.stored')}>
        <div className="space-y-3">
          {budgets.map((budget) => (
            <div key={budget.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{budget.categoryName || t('budgets.wholeMonth')}</p>
                  <p className="mt-2 text-sand">{formatCurrency(budget.amount)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
                    onClick={() => startEditing(budget)}
                    type="button"
                  >
                    {t('transactions.edit')}
                  </button>
                  <button className="danger-button" onClick={() => void handleDelete(budget.id)} type="button">
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {budgets.length === 0 ? <p className="text-sm text-white/55">{t('budgets.emptyMonth')}</p> : null}
        </div>
      </Panel>
    </div>
  );
}
