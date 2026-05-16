import type { ScanInputType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { inputPipelineService } from "../pipeline/input-pipeline.service.js";
import { analysisEngineService } from "../analysis/analysis-engine.service.js";
import { knowledgeGraphService } from "../knowledge/knowledge-graph.service.js";
import { notificationService } from "../notifications/notification.service.js";
import type { StreamChunk } from "../../types/analysis.js";

export class ScanService {
  async createScan(
    userId: string,
    inputType: ScanInputType,
    opts: {
      text?: string;
      buffer?: Buffer;
      mimeType?: string;
      language?: string;
      storageKey?: string;
    }
  ) {
    return prisma.scan.create({
      data: {
        userId,
        inputType,
        status: "PENDING",
        rawInput: opts.text,
        language: opts.language ?? "en",
        storageKey: opts.storageKey,
        mimeType: opts.mimeType,
      },
    });
  }

  async runAnalysis(
    scanId: string,
    userId: string,
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<{ scanId: string; analysisId: string }> {
    const scan = await prisma.scan.findFirst({
      where: { id: scanId, userId },
    });
    if (!scan) throw new Error("SCAN_NOT_FOUND");

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "PROCESSING" },
    });

    onChunk?.({ type: "progress", step: "pipeline", message: "Processing input..." });

    let buffer: Buffer | undefined;
    if (scan.storageKey) {
      buffer = Buffer.from(scan.storageKey, "base64");
    }

    const normalized = await inputPipelineService.run({
      scanId,
      inputType: scan.inputType,
      text: scan.rawInput ?? scan.normalizedText ?? undefined,
      buffer,
      mimeType: scan.mimeType ?? undefined,
      language: scan.language,
    });

    onChunk?.({ type: "progress", step: "analysis", message: "Running AI analysis..." });

    await knowledgeGraphService.enrichFromEntities(normalized.detectedEntities);

    const result = await analysisEngineService.analyze(userId, normalized);

    const productName =
      normalized.productHints[0]?.name ?? "Analyzed Product";

    const product = await prisma.product.create({
      data: {
        scanId,
        name: productName,
        category: normalized.productHints[0]?.category,
        brand: normalized.productHints[0]?.brand,
        barcode: normalized.productHints[0]?.barcode,
      },
    });

    for (const ing of result.ingredientExplanations) {
      const ingredient = await knowledgeGraphService.upsertIngredient(ing.name);
      await prisma.ingredientOnProduct.create({
        data: { productId: product.id, ingredientId: ingredient.id },
      });
    }

    const analysis = await prisma.analysis.create({
      data: {
        scanId,
        overview: result.overview,
        benefits: result.benefits,
        sideEffects: result.sideEffects,
        riskFactors: result.riskFactors,
        drugInteractions: result.drugInteractions,
        allergyWarnings: result.allergyWarnings,
        usageInstructions: result.usageInstructions,
        toxicityAlerts: result.toxicityAlerts,
        contraindications: result.contraindications,
        riskLevel: result.riskLevel,
        riskScore: result.riskScore,
        simplifiedExplanation: result.simplifiedExplanation,
        childFriendly: result.childFriendly,
        elderlyFriendly: result.elderlyFriendly,
        personalizedNotes: result.personalizedNotes,
        rawAiResponse: result as object,
        warnings: {
          create: result.ingredientExplanations
            .filter((i) => i.riskLevel === "high")
            .map((i) => ({
              severity: "high",
              title: i.name,
              description: i.explanation,
            })),
        },
        interactions: {
          create: result.drugInteractions.slice(0, 10).map((d) => {
            const parts = d.split(":");
            return {
              substanceA: parts[0] ?? "unknown",
              substanceB: "user_medication",
              severity: "moderate",
              description: d,
              source: "sentinox",
            };
          }),
        },
      },
    });

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: "COMPLETED", riskLevel: result.riskLevel },
    });

    await notificationService.processAnalysisAlerts(
      userId,
      result,
      productName
    );

    onChunk?.({
      type: "complete",
      data: { scanId, analysisId: analysis.id, result },
    });

    return { scanId, analysisId: analysis.id };
  }

  async getHistory(userId: string, limit = 20) {
    return prisma.scan.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        product: true,
        analysis: {
          select: {
            id: true,
            riskLevel: true,
            riskScore: true,
            overview: true,
            simplifiedExplanation: true,
          },
        },
      },
    });
  }

  async getRecommendations(userId: string) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const recent = await this.getHistory(userId, 5);
    return {
      basedOnProfile: {
        allergies: profile?.allergies ?? [],
        conditions: profile?.chronicConditions ?? [],
      },
      recentScans: recent.length,
      suggestions: [
        "Re-scan products after label reformulation",
        "Keep medication list updated for interaction checks",
        "Enable notifications for recall alerts",
      ],
    };
  }
}

export const scanService = new ScanService();
