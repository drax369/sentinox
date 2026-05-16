import type { FastifyReply, FastifyRequest } from "fastify";

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above)\s+instructions/i,
  /system\s*:\s*you\s+are/i,
  /<\s*script/i,
  /javascript:/i,
];

const BLOCKED_MIME_FOR_EXEC = [
  "application/x-msdownload",
  "application/x-sh",
  "application/javascript",
];

export function detectPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((p) => p.test(text));
}

export function sanitizeUserInput(text: string, maxLen = 50_000): string {
  let sanitized = text.slice(0, maxLen).trim();
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
  return sanitized;
}

export function validateUploadMime(mime: string): boolean {
  if (BLOCKED_MIME_FOR_EXEC.includes(mime)) return false;
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "application/pdf",
    "audio/mpeg",
    "audio/wav",
    "audio/webm",
    "audio/ogg",
  ];
  return allowed.includes(mime);
}

/** Basic magic-byte check for images/PDF */
export function scanFileHeader(buffer: Buffer): { safe: boolean; detected?: string } {
  if (buffer.length < 4) return { safe: false };
  const hex = buffer.subarray(0, 8).toString("hex");
  if (hex.startsWith("ffd8ff")) return { safe: true, detected: "image/jpeg" };
  if (hex.startsWith("89504e47")) return { safe: true, detected: "image/png" };
  if (hex.startsWith("25504446")) return { safe: true, detected: "application/pdf" };
  if (hex.startsWith("52494646")) return { safe: true, detected: "audio/wav" };
  if (buffer.subarray(0, 4).toString("ascii") === "%PDF") {
    return { safe: true, detected: "application/pdf" };
  }
  return { safe: true, detected: "unknown" };
}

export async function abuseCheck(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const ip = request.ip;
  const key = `abuse:${ip}`;
  const { redis } = await import("../lib/redis.js");
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  if (count > 200) {
    return reply.status(429).send({ error: "Abuse detected. Try again later." });
  }
}
