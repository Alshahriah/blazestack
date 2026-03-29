import { createAuthClient } from "better-auth/react";

const API_URL = "http://localhost:8787";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
}) as ReturnType<typeof createAuthClient>;

export const { signIn, signUp, signOut, useSession } = authClient;
