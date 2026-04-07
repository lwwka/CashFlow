import { useState } from 'react';

import { upsertMonthlyGoal } from '../lib/api';

interface UseMonthlyGoalMutationsOptions {
  onAfterSave?: () => Promise<void>;
  onErrorMessage: string;
  onSavedMessage: string;
}

export function useMonthlyGoalMutations(options: UseMonthlyGoalMutationsOptions) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save(input: { month: string; savingsTarget: number }): Promise<boolean> {
    setIsSaving(true);
    setStatus(null);

    try {
      await upsertMonthlyGoal(input);
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
