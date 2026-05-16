import type { FastifyInstance } from "fastify";
import { redis } from "../lib/redis.js";
import { env } from "../config/env.js";
import { verifyAccessToken } from "../middleware/auth.js";

export async function registerWebSocket(app: FastifyInstance) {
  app.get(env.WS_PATH, { websocket: true }, (socket, request) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get("token");
    const scanId = url.searchParams.get("scanId");

    if (!token || !scanId) {
      socket.close(4001, "token and scanId required");
      return;
    }

    try {
      verifyAccessToken(token);
    } catch {
      socket.close(4003, "unauthorized");
      return;
    }

    const channel = `scan:${scanId}`;
    const subscriber = redis.duplicate();

    void subscriber.subscribe(channel);
    subscriber.on("message", (_ch: string, message: string) => {
      socket.send(message);
    });

    socket.on("close", () => {
      void subscriber.unsubscribe(channel);
      void subscriber.quit();
    });

    socket.send(
      JSON.stringify({
        type: "connected",
        scanId,
        message: "Subscribed to analysis stream",
      })
    );
  });
}
