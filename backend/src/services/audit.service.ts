import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

export async function writeAuditLog(params: {
  userId?: string;
  action: string;
  resource?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        ipAddress: params.ipAddress,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    logger.error({ err, action: params.action }, "Audit log write failed");
  }
}
