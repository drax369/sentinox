import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),
  /** xAI Grok API key — get one at https://console.x.ai */
  GROK_API_KEY: z.string().optional(),
  GROK_API_BASE_URL: z.string().default("https://api.x.ai/v1"),
  GROK_MODEL: z.string().default("grok-3-mini"),
  GROK_VISION_MODEL: z.string().default("grok-2-vision-1212"),
  GROK_REASONING_MODEL: z.string().default("grok-3-mini"),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  UPLOAD_MAX_BYTES: z.coerce.number().default(10_485_760),
  WORKER_CONCURRENCY: z.coerce.number().default(5),
  WS_PATH: z.string().default("/ws"),
  RXNORM_API_BASE: z.string().default("https://rxnav.nlm.nih.gov/REST"),
  USDA_FDC_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function resolveGrokKey(): void {
  // Support common env var names from xAI console
  if (!process.env.GROK_API_KEY) {
    process.env.GROK_API_KEY =
      process.env.XAI_API_KEY ?? process.env.XAI_API_KEY_SECRET;
  }
}

function loadEnv(): Env {
  resolveGrokKey();

  if (process.env.NODE_ENV !== "production") {
    process.env.DATABASE_URL ??=
      "postgresql://sentinox:sentinox@localhost:5432/sentinox?schema=public";
    process.env.JWT_ACCESS_SECRET ??=
      "dev-access-secret-minimum-32-characters-long!!";
    process.env.JWT_REFRESH_SECRET ??=
      "dev-refresh-secret-minimum-32-characters-long!";
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
    throw new Error("Environment validation failed");
  }
  return parsed.data;
}

export const env = loadEnv();
