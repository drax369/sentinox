import { Queue, Worker, type Job } from "bullmq";
import { redis } from "../lib/redis.js";
import { logger } from "../lib/logger.js";
import { scanService } from "../modules/scan/scan.service.js";
import type { StreamChunk } from "../types/analysis.js";

export const ANALYSIS_QUEUE = "sentinox:analysis";

export interface AnalysisJobData {
  scanId: string;
  userId: string;
  wsChannel?: string;
}

export const analysisQueue = new Queue<AnalysisJobData>(ANALYSIS_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export function createAnalysisWorker(concurrency: number) {
  return new Worker<AnalysisJobData>(
    ANALYSIS_QUEUE,
    async (job: Job<AnalysisJobData>) => {
      const { scanId, userId, wsChannel } = job.data;
      logger.info({ scanId, jobId: job.id }, "Processing analysis job");

      const publish = async (chunk: StreamChunk) => {
        if (wsChannel) {
          await redis.publish(wsChannel, JSON.stringify(chunk));
        }
        await job.updateProgress(
          chunk.type === "progress" ? 50 : chunk.type === "complete" ? 100 : 0
        );
      };

      await scanService.runAnalysis(scanId, userId, publish);
      return { scanId, status: "completed" };
    },
    { connection: redis, concurrency }
  );
}
