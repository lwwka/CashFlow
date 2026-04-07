import { useState } from 'react';

import { createCategory, deleteCategory, updateCategory } from '../lib/api';

interface UseCategoryMutationsOptions {
  onAfterCreate?: () => Promise<void>;
  onAfterUpdate?: () => Promise<void>;
  onAfterDelete?: () => Promise<void>;
  onErrorMessage: string;
  onSavedMessage: string;
  onUpdatedMessage: string;
  onDeletedMessage: string;
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

  async function update(id: string, input: { name?: string; type?: 'income' | 'expense' }): Promise<boolean> {
    setIsSaving(true);
    setStatus(null);

    try {
      await updateCategory(id, input);
      setStatus(options.onUpdatedMessage);
      await options.onAfterUpdate?.();
      return true;
    } catch (nextError) {
      setStatus(nextError instanceof Error ? nextError.message : options.onErrorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(id: string): Promise<void> {
    setStatus(null);

    try {
      await deleteCategory(id);
      setStatus(options.onDeletedMessage);
      await options.onAfterDelete?.();
    } catch (nextError) {
      setStatus(nextError instanceof Error ? nextError.message : options.onErrorMessage);
    }
  }

  return {
    status,
    isSaving,
    create,
    update,
    remove,
  };
}
