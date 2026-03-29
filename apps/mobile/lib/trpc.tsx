import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppRouter } from "@erh/trpc";
import { useState } from "react";

// Android emulator uses 10.0.2.2 to reach host localhost.
// iOS simulator and Expo Go on device use the LAN IP.
import { Platform } from "react-native";
const DEV_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_URL = __DEV__
  ? `http://${DEV_HOST}:8787`
  : "https://erh-api.your-subdomain.workers.dev";

export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${API_URL}/trpc`,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
