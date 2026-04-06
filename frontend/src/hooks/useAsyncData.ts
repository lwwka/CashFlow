import { useEffect, useState } from 'react';

export interface AsyncDataState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useAsyncData<T>(loader: () => Promise<T>, initialData: T, deps: readonly unknown[]): AsyncDataState<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function reload(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const nextData = await loader();
      setData(nextData);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, deps);

  return {
    data,
    isLoading,
    error,
    reload,
  };
}
