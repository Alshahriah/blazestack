import { type TRPCClientErrorLike, createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./root";

export type { AppRouter, TRPCClientErrorLike };

export function createClient(baseUrl: string) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
      }),
    ],
  });
}
