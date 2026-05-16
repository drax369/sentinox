import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { createAnalysisWorker } from "./queues/analysis.queue.js";

const worker = createAnalysisWorker(env.WORKER_CONCURRENCY);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Analysis job completed");
});

worker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Analysis job failed");
});

logger.info(`Sentinox worker started (concurrency: ${env.WORKER_CONCURRENCY})`);

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
