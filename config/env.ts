import { config } from "dotenv";
import { z } from "zod";

config(); // load .env (ignored by git)

const EnvSchema = z.object({
  // SAP system connection
  SAP_BASE_URL: z.string().url("SAP_BASE_URL must be a valid URL"),
  SAP_CLIENT: z.string().default("100"),

  // Auth — see docs/authentication.md
  AUTH_METHOD: z.enum(["token", "sso", "basic"]).default("token"),
  SAP_TOKEN: z.string().optional(),       // used when AUTH_METHOD=token
  SAP_USERNAME: z.string().optional(),   // used when AUTH_METHOD=basic
  SAP_PASSWORD: z.string().optional(),   // used when AUTH_METHOD=basic

  // Operational
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DRY_RUN: z.coerce.boolean().default(false), // when true, write tools skip execution
});

function loadEnv() {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Environment configuration invalid:\n${issues}`);
  }
  return result.data;
}

export const env = loadEnv();
export type Env = typeof env;
