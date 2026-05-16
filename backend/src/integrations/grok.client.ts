import OpenAI from "openai";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

/** xAI Grok — OpenAI-compatible client (https://api.x.ai/v1) */
let client: OpenAI | null = null;

export function getGrokClient(): OpenAI | null {
  const apiKey = env.GROK_API_KEY;
  if (!apiKey) {
    logger.warn("GROK_API_KEY not set — AI features use fallback logic");
    return null;
  }
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: env.GROK_API_BASE_URL,
    });
  }
  return client;
}

export function isGrokConfigured(): boolean {
  return Boolean(env.GROK_API_KEY);
}
