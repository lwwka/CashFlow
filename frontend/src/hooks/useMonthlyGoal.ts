import { fetchMonthlyGoal } from '../lib/api';
import type { MonthlyGoal } from '../types';
import { useAsyncData } from './useAsyncData';

export function useMonthlyGoal(month: string) {
  const state = useAsyncData<MonthlyGoal | null>(async () => fetchMonthlyGoal(month), null, [month]);

  return {
    monthlyGoal: state.data,
    isLoading: state.isLoading,
    error: state.error,
    reload: state.reload,
  };
}
