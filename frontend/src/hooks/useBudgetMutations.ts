import { useState } from 'react';

import { upsertBudget } from '../lib/api';

interface UseBudgetMutationsOptions {
  onAfterUpsert?: () => Promise<void>;
  onErrorMessage: string;
  onSavedMessage: string;
}

export function useBudgetMutations(options: UseBudgetMutationsOptions) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function upsert(input: { month: string; amount: number; categoryId?: string }): Promise<boolean> {
    setIsSaving(true);
    setStatus(null);

    try {
      await upsertBudget(input);
      setStatus(options.onSavedMessage);
      await options.onAfterUpsert?.();
      return true;
    } catch (nextError) {
      setStatus(nextError instanceof Error ? nextError.message : options.onErrorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    status,
    isSaving,
    upsert,
  };
}
