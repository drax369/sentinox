import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import websocket from "@fastify/websocket";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { authRoutes } from "./routes/auth.routes.js";
import { scanRoutes } from "./routes/scan.routes.js";
import { profileRoutes } from "./routes/profile.routes.js";
import { voiceRoutes } from "./routes/voice.routes.js";
import { registerWebSocket } from "./websocket/scan.socket.js";
import { abuseCheck } from "./middleware/security.js";

export async function buildApp() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    bodyLimit: env.UPLOAD_MAX_BYTES + 1024,
  });

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.NODE_ENV === "production" ? false : true,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });
  await app.register(multipart, {
    limits: { fileSize: env.UPLOAD_MAX_BYTES },
  });
  await app.register(websocket);

  app.addHook("onRequest", abuseCheck);

  app.get("/health", async () => ({
    status: "ok",
    service: "sentinox-api",
    timestamp: new Date().toISOString(),
  }));

  app.get("/ready", async () => {
    const { prisma } = await import("./lib/prisma.js");
    const { redis } = await import("./lib/redis.js");
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    return { status: "ready" };
  });

  await app.register(authRoutes, { prefix: "/api/v1" });
  await app.register(scanRoutes, { prefix: "/api/v1" });
  await app.register(profileRoutes, { prefix: "/api/v1" });
  await app.register(voiceRoutes, { prefix: "/api/v1" });
  await registerWebSocket(app);

  app.setErrorHandler((error, _request, reply) => {
    logger.error(error);
    const err = error as { validation?: unknown };
    if (err.validation) {
      return reply.status(400).send({ error: "Validation failed", details: err.validation });
    }
    return reply.status(500).send({ error: "Internal server error" });
  });

  return app;
}
