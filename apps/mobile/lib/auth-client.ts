import { createAuthClient } from "better-auth/react";

import { Platform } from "react-native";
const DEV_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_URL = __DEV__
  ? `http://${DEV_HOST}:8787`
  : "https://blazestack-api.your-subdomain.workers.dev";

export const authClient = createAuthClient({
  baseURL: `${API_URL}/api/auth`,
});

export const { signIn, signUp, signOut, useSession } = authClient;
