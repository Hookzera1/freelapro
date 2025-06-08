'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadingProvider } from '@/components/ui/Loading';
import { ConfirmDialogProvider } from '@/components/ui/ConfirmDialog';
import { ToastProvider } from '@/components/ui/Toast';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <LoadingProvider>
          <ConfirmDialogProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ConfirmDialogProvider>
        </LoadingProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}