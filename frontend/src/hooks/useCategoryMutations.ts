import { useState } from 'react';

import { createCategory } from '../lib/api';

interface UseCategoryMutationsOptions {
  onAfterCreate?: () => Promise<void>;
  onErrorMessage: string;
  onSavedMessage: string;
}

export function useCategoryMutations(options: UseCategoryMutationsOptions) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function create(input: { name: string; type: 'income' | 'expense' }): Promise<boolean> {
    setIsSaving(true);
    setStatus(null);

    try {
      await createCategory(input);
      setStatus(options.onSavedMessage);
      await options.onAfterCreate?.();
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
    create,
  };
}
