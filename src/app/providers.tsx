"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { initPostHogClient } from "@/lib/analytics/posthog-client";
import { ServiceWorkerRegistration } from "@/features/pwa";

/**
 * App-wide client providers. A `useState` initializer (not a module-level
 * singleton) so each request/browser tab gets its own QueryClient — a
 * module singleton would leak cached data across users on the server.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    initPostHogClient();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      <ServiceWorkerRegistration />
    </QueryClientProvider>
  );
}
