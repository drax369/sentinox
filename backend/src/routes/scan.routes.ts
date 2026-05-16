import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ScanInputType } from "@prisma/client";
import { env } from "../config/env.js";
import { authenticate } from "../middleware/auth.js";
import {
  detectPromptInjection,
  scanFileHeader,
  validateUploadMime,
} from "../middleware/security.js";
import { scanService } from "../modules/scan/scan.service.js";
import { analysisQueue } from "../queues/analysis.queue.js";
import { writeAuditLog } from "../services/audit.service.js";

export async function scanRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.post("/scan/text", async (request, reply) => {
    const body = z
      .object({
        text: z.string().min(1).max(50_000),
        language: z.string().default("en"),
        async: z.boolean().default(true),
      })
      .parse(request.body);

    if (detectPromptInjection(body.text)) {
      return reply.status(400).send({ error: "Invalid input detected" });
    }

    const scan = await scanService.createScan(request.user!.id, "TEXT", {
      text: body.text,
      language: body.language,
    });

    await writeAuditLog({
      userId: request.user!.id,
      action: "scan.text",
      resource: scan.id,
      ipAddress: request.ip,
    });

    if (body.async) {
      const job = await analysisQueue.add("analyze", {
        scanId: scan.id,
        userId: request.user!.id,
        wsChannel: `scan:${scan.id}`,
      });
      return reply.status(202).send({
        scanId: scan.id,
        jobId: job.id,
        status: "queued",
        wsChannel: `scan:${scan.id}`,
      });
    }

    const result = await scanService.runAnalysis(scan.id, request.user!.id);
    return result;
  });

  app.post("/scan/voice", async (request, reply) => {
    const data = await request.file({ limits: { fileSize: env.UPLOAD_MAX_BYTES } });
    if (!data) return reply.status(400).send({ error: "No audio file" });

    const buffer = await data.toBuffer();
    const mime = data.mimetype;
    if (!validateUploadMime(mime)) {
      return reply.status(400).send({ error: "Unsupported audio format" });
    }

    const scan = await scanService.createScan(request.user!.id, "VOICE", {
      mimeType: mime,
      storageKey: buffer.toString("base64"),
      language: (request.query as { language?: string }).language ?? "en",
    });

    const job = await analysisQueue.add("analyze", {
      scanId: scan.id,
      userId: request.user!.id,
      wsChannel: `scan:${scan.id}`,
    });

    return reply.status(202).send({
      scanId: scan.id,
      jobId: job.id,
      status: "queued",
    });
  });

  app.post("/scan/image", async (request, reply) => {
    const data = await request.file({ limits: { fileSize: env.UPLOAD_MAX_BYTES } });
    if (!data) return reply.status(400).send({ error: "No image file" });

    const buffer = await data.toBuffer();
    const headerCheck = scanFileHeader(buffer);
    if (!headerCheck.safe) {
      return reply.status(400).send({ error: "File failed security scan" });
    }

    const mime = data.mimetype;
    if (!validateUploadMime(mime)) {
      return reply.status(400).send({ error: "Unsupported file type" });
    }

    const inputType: ScanInputType =
      mime === "application/pdf" ? "PDF" : "IMAGE";

    const scan = await scanService.createScan(request.user!.id, inputType, {
      mimeType: mime,
      storageKey: buffer.toString("base64"),
    });

    const job = await analysisQueue.add("analyze", {
      scanId: scan.id,
      userId: request.user!.id,
      wsChannel: `scan:${scan.id}`,
    });

    return reply.status(202).send({
      scanId: scan.id,
      jobId: job.id,
      status: "queued",
    });
  });

  app.post("/analysis/run", async (request, reply) => {
    const body = z
      .object({ scanId: z.string().uuid(), stream: z.boolean().default(false) })
      .parse(request.body);

    if (body.stream) {
      const job = await analysisQueue.add("analyze", {
        scanId: body.scanId,
        userId: request.user!.id,
        wsChannel: `scan:${body.scanId}`,
      });
      return reply.status(202).send({ jobId: job.id, wsChannel: `scan:${body.scanId}` });
    }

    const result = await scanService.runAnalysis(body.scanId, request.user!.id);
    return result;
  });

  app.get("/history", async (request) => {
    const limit = Number((request.query as { limit?: string }).limit ?? 20);
    return scanService.getHistory(request.user!.id, limit);
  });

  app.get("/recommendations", async (request) => {
    return scanService.getRecommendations(request.user!.id);
  });
}
