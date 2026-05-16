import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { buildApp } from "./app.js";

async function main() {
  const app = await buildApp();
  await app.listen({ port: env.PORT, host: env.HOST });
  logger.info(`Sentinox API listening on ${env.HOST}:${env.PORT}`);
}

main().catch((err) => {
  logger.fatal(err);
  process.exit(1);
});
