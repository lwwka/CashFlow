import { FormEvent, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { Panel } from '../components/Panel';
import { useCashflowData } from '../hooks/useCashflowData';
import { createTransaction, deleteTransaction } from '../lib/api';
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

export function TransactionsPage(): JSX.Element {
  const { userEmail, month } = useOutletContext<ShellContext>();
  const { transactions, categories, isLoading, error, reload } = useCashflowData(userEmail, month);
  const { t } = usePreferences();
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '0',
    occurredOn: `${month}-01`,
    categoryId: '',
    note: '',
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      await createTransaction({
        userEmail,
        type: form.type as 'income' | 'expense',
        amount: Number(form.amount),
        occurredOn: form.occurredOn,
        categoryId: form.categoryId || undefined,
        note: form.note || undefined,
      });
      setForm((current) => ({ ...current, amount: '0', note: '' }));
      setStatus(t('transactions.saved'));
      await reload();
    } catch (nextError) {
      setStatus(nextError instanceof Error ? nextError.message : t('status.failedTransaction'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    await deleteTransaction(id, userEmail);
    setStatus(t('transactions.deleted'));
    await reload();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Panel title={t('transactions.create')} eyebrow={t('transactions.writeDb')}>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span className="field-label">{t('transactions.type')}</span>
              <select
                className="text-input"
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="expense">{t('transactions.type.expense')}</option>
                <option value="income">{t('transactions.type.income')}</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">{t('transactions.amount')}</span>
              <input
                className="text-input"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field">
              <span className="field-label">{t('transactions.occurredOn')}</span>
              <input
                className="text-input"
                type="date"
                value={form.occurredOn}
                onChange={(event) => setForm((current) => ({ ...current, occurredOn: event.target.value }))}
              />
            </label>
            <label className="field">
              <span className="field-label">{t('transactions.category')}</span>
              <select
                className="text-input"
                value={form.categoryId}
                onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
              >
                <option value="">{t('transactions.uncategorized')}</option>
                {categories
                  .filter((category) => category.type === form.type)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span className="field-label">{t('transactions.note')}</span>
            <input
              className="text-input"
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              placeholder={t('transactions.note.placeholder')}
            />
          </label>

          <button className="primary-button w-full" disabled={isSaving} type="submit">
            {isSaving ? t('transactions.saving') : t('transactions.createButton')}
          </button>
          {status ? <p className="text-sm text-white/70">{status}</p> : null}
          {error ? <p className="text-sm text-coral">{error}</p> : null}
        </form>
      </Panel>

      <Panel title={t('transactions.list')} eyebrow={month}>
        {isLoading ? <p className="text-sm text-white/55">{t('common.loading')}</p> : null}
        <div className="space-y-3">
          {transactions.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{item.note || item.categoryName || item.type}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">
                    {item.occurredOn} · {item.categoryName || t('transactions.uncategorized')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className={item.type === 'income' ? 'text-reef' : 'text-coral'}>{formatCurrency(item.amount)}</p>
                  <button className="danger-button" onClick={() => void handleDelete(item.id)} type="button">
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </article>
          ))}
          {transactions.length === 0 && !isLoading ? <p className="text-sm text-white/55">{t('transactions.empty')}</p> : null}
        </div>
      </Panel>
    </div>
  );
}
