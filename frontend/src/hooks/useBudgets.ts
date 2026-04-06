import { fetchBudgets } from '../lib/api';
import type { Budget } from '../types';
import { useAsyncData } from './useAsyncData';

export function useBudgets(month: string) {
  const state = useAsyncData<Budget[]>(
    async () => {
      const response = await fetchBudgets(month);
      return response.items;
    },
    [],
    [month],
  );

  return {
    budgets: state.data,
    isLoading: state.isLoading,
    error: state.error,
    reload: state.reload,
  };
}
