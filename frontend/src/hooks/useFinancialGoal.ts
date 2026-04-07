import { fetchFinancialGoal } from '../lib/api';
import type { FinancialGoal } from '../types';
import { useAsyncData } from './useAsyncData';

export function useFinancialGoal(goalType: string) {
  const state = useAsyncData<FinancialGoal | null>(async () => fetchFinancialGoal(goalType), null, [goalType]);

  return {
    financialGoal: state.data,
    isLoading: state.isLoading,
    error: state.error,
    reload: state.reload,
  };
}
