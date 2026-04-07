import { useState } from 'react';

import { upsertFinancialGoal } from '../lib/api';

interface UseFinancialGoalMutationsOptions {
  onAfterSave?: () => Promise<void>;
  onErrorMessage: string;
  onSavedMessage: string;
}

export function useFinancialGoalMutations(options: UseFinancialGoalMutationsOptions) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save(input: { goalType: string; targetAmount: number }): Promise<boolean> {
    setIsSaving(true);
    setStatus(null);

    try {
      await upsertFinancialGoal(input);
      setStatus(options.onSavedMessage);
      await options.onAfterSave?.();
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
    save,
  };
}
