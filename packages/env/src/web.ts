import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const webEnv = createEnv({
  server: {
    API_URL: z.string().url().default("http://localhost:8787"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {},
  clientPrefix: "VITE_",
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
