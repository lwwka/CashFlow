import { fetchCategories } from '../lib/api';
import type { Category } from '../types';
import { useAsyncData } from './useAsyncData';

export function useCategories() {
  const state = useAsyncData<Category[]>(
    async () => {
      const response = await fetchCategories();
      return response.items;
    },
    [],
    [],
  );

  return {
    categories: state.data,
    isLoading: state.isLoading,
    error: state.error,
    reload: state.reload,
  };
}
