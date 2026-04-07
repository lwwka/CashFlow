import { fetchOverview } from '../lib/api';
import type { Overview } from '../types';
import { useAsyncData } from './useAsyncData';

export function useOverview(filter: { month?: string; from?: string; to?: string }) {
  const state = useAsyncData<Overview | null>(
    async () => fetchOverview(filter),
    null,
    [filter.month, filter.from, filter.to],
  );

  return {
    overview: state.data,
    isLoading: state.isLoading,
    error: state.error,
    reload: state.reload,
  };
}
