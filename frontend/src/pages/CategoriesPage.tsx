import { FormEvent, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { Panel } from '../components/Panel';
import { useCategories } from '../hooks/useCategories';
import { useCategoryMutations } from '../hooks/useCategoryMutations';
import { usePreferences } from '../providers/PreferencesProvider';

interface ShellContext {
  month: string;
}

export function CategoriesPage(): JSX.Element {
  useOutletContext<ShellContext>();
  const { categories, error, reload } = useCategories();
  const { t } = usePreferences();
  const [form, setForm] = useState({ name: '', type: 'expense' });
  const normalizedName = form.name.trim();
  const { status, isSaving, create } = useCategoryMutations({
    onAfterCreate: async () => reload(),
    onErrorMessage: t('status.failedCategory'),
    onSavedMessage: t('categories.saved'),
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!normalizedName) {
      return;
    }

    const didCreate = await create({
      name: normalizedName,
      type: form.type as 'income' | 'expense',
    });

    if (didCreate) {
      setForm({ name: '', type: 'expense' });
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel title={t('categories.create')} eyebrow={t('categories.reusable')}>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <p className="text-sm leading-6 text-white/60">{t('categories.helper')}</p>
          <label className="field">
            <span className="field-label">{t('categories.name')}</span>
            <input
              className="text-input"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder={t('categories.name.placeholder')}
            />
          </label>
          <label className="field">
            <span className="field-label">{t('categories.type')}</span>
            <select
              className="text-input"
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
            >
              <option value="expense">{t('transactions.type.expense')}</option>
              <option value="income">{t('transactions.type.income')}</option>
            </select>
          </label>
          <button className="primary-button w-full" disabled={isSaving || !normalizedName} type="submit">
            {t('categories.save')}
          </button>
          {status ? <p className="text-sm text-white/70">{status}</p> : null}
          {error ? <p className="text-sm text-coral">{error}</p> : null}
        </form>
      </Panel>

      <Panel title={t('categories.catalog')} eyebrow={t('categories.currentUser')}>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="font-medium text-white">{category.name}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">{category.type}</p>
            </div>
          ))}
          {categories.length === 0 ? <p className="text-sm text-white/55">{t('categories.empty')}</p> : null}
        </div>
      </Panel>
    </div>
  );
}
