import { fetchOverview } from '../lib/api';
import type { Overview } from '../types';
import { useAsyncData } from './useAsyncData';

export function useOverview(month: string) {
  const state = useAsyncData<Overview | null>(async () => fetchOverview(month), null, [month]);

  return {
    overview: state.data,
    isLoading: state.isLoading,
    error: state.error,
    reload: state.reload,
  };
}
