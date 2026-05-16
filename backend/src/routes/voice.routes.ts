import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { voiceEngineService } from "../modules/voice/voice-engine.service.js";

export async function voiceRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post("/voice/generate", async (request) => {
    const body = z
      .object({
        text: z.string().min(1).max(10_000),
        language: z.string().default("en"),
        scanId: z.string().uuid().optional(),
      })
      .parse(request.body);

    return voiceEngineService.generate(
      request.user!.id,
      body.text,
      body.language,
      body.scanId
    );
  });
}
