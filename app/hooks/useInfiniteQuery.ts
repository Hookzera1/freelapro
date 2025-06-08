import { useInfiniteQuery as useReactInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface QueryFnParams {
  pageParam?: number;
  signal?: AbortSignal;
}

interface PaginatedResponse<T> {
  data: T[];
  nextPage: number | null;
  totalPages: number;
  totalItems: number;
}

interface UseInfiniteQueryOptions<T> {
  queryKey: string[];
  queryFn: (params: QueryFnParams) => Promise<PaginatedResponse<T>>;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useInfiniteQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 1000 * 60 * 5, // 5 minutos
  gcTime = 1000 * 60 * 30, // 30 minutos
}: UseInfiniteQueryOptions<T>) {
  const { ref, inView } = useInView();

  const query = useReactInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => queryFn({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<T>) => lastPage.nextPage ?? undefined,
    enabled,
    staleTime,
    gcTime,
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  // Carregar mais itens quando o último item estiver visível
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Função para recarregar os dados
  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  // Extrair todos os itens das páginas
  const items = query.data?.pages.reduce<T[]>((acc, page) => [...acc, ...page.data], []) || [];

  return {
    ...query,
    items,
    refresh,
    loadMoreRef: ref,
  };
} 