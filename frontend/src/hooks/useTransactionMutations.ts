import { useState } from 'react';

import { createTransaction, deleteTransaction } from '../lib/api';

interface UseTransactionMutationsOptions {
  onAfterCreate?: () => Promise<void>;
  onAfterDelete?: () => Promise<void>;
  onErrorMessage: string;
  onSavedMessage: string;
  onDeletedMessage: string;
}

export function useTransactionMutations(options: UseTransactionMutationsOptions) {
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function create(input: {
    type: 'income' | 'expense';
    amount: number;
    occurredOn: string;
    categoryId?: string;
    note?: string;
  }): Promise<boolean> {
    setIsSaving(true);
    setStatus(null);

    try {
      await createTransaction(input);
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

  async function remove(id: string): Promise<void> {
    try {
      await deleteTransaction(id);
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
    remove,
  };
}
