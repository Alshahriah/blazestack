import { createAuthClient } from "better-auth/client";

export function createClient(baseUrl: string) {
  return createAuthClient({
    baseURL: `${baseUrl}/api/auth`,
  });
}

export type AuthClient = ReturnType<typeof createClient>;
