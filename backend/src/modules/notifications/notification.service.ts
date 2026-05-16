import { RiskLevel } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import type { AnalysisResult } from "../../types/analysis.js";

export class NotificationService {
  async processAnalysisAlerts(
    userId: string,
    analysis: AnalysisResult,
    productName: string
  ): Promise<void> {
    if (analysis.riskLevel === RiskLevel.HIGH_RISK) {
      await this.create(userId, "high_risk", "High Risk Product Detected", {
        message: `${productName} scored high risk. Review interactions and dosage immediately.`,
        productName,
      });
    }

    for (const warning of analysis.allergyWarnings) {
      await this.create(userId, "allergy", "Allergy Risk Detected", {
        message: warning,
        productName,
      });
    }

    for (const interaction of analysis.drugInteractions) {
      await this.create(userId, "drug_interaction", "Medication Interaction Alert", {
        message: interaction,
        productName,
      });
    }

    if (analysis.toxicityAlerts.length > 0) {
      await this.create(userId, "toxicity", "Toxicity Alert", {
        message: analysis.toxicityAlerts[0],
        productName,
      });
    }

    const recalls = await prisma.productRecall.findMany({
      where: {
        productName: { contains: productName.split(" ")[0], mode: "insensitive" },
      },
      take: 1,
    });
    for (const recall of recalls) {
      await this.create(userId, "recall", "Product Recall Notice", {
        message: recall.reason,
        productName: recall.productName,
      });
    }
  }

  async create(
    userId: string,
    type: string,
    title: string,
    payload: { message: string; productName?: string }
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message: payload.message,
        metadata: { productName: payload.productName },
      },
    });
  }

  async list(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}

export const notificationService = new NotificationService();
