import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getPage } from '../lib/api';
import { Loading, ErrorState, Empty, C } from './ui';
export function ListScreen<T extends { id: string }>({ keyName, path, render, empty, header }: { keyName: string; path: string; render: (i: T) => React.ReactElement; empty: string; header?: React.ReactElement }) {
  const q = useInfiniteQuery({ queryKey: [keyName], initialPageParam: 1,
    queryFn: ({ pageParam }) => getPage<T>(path, pageParam),
    getNextPageParam: (last) => (last.page < last.total_pages ? last.page + 1 : undefined) });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error as Error} retry={() => q.refetch()} />;
  const data = q.data?.pages.flatMap((p) => p.items) ?? [];
  return <FlatList style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16, gap: 12 }} data={data} keyExtractor={(i) => i.id}
    ListHeaderComponent={header} renderItem={({ item }) => render(item)} ListEmptyComponent={<Empty text={empty} />}
    refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} />}
    onEndReached={() => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()} />;
}
