import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

function testQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

export function renderWithQuery(ui: ReactElement) {
  const queryClient = testQueryClient();
  return { queryClient, ...render(ui, { wrapper: wrapperFor(queryClient) }) };
}

export function renderHookWithQuery<T>(hook: () => T) {
  const queryClient = testQueryClient();
  return { queryClient, ...renderHook(hook, { wrapper: wrapperFor(queryClient) }) };
}
