'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import '@/lib/apiClient';

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30000, // 30 seconds stale time
        refetchOnWindowFocus: false,
      }
    }
  }));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
