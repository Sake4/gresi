import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { SessionProvider } from '@/features/auth';
import { queryClient } from '@/lib/queryClient';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
}
