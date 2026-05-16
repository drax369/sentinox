import type { ScanInputType } from "@prisma/client";
import { ocrService } from "../../integrations/ocr.service.js";
import { speechService } from "../../integrations/speech.service.js";
import { drugDbService } from "../../integrations/drug-db.service.js";
import { nutritionDbService } from "../../integrations/nutrition-db.service.js";
import { prisma } from "../../lib/prisma.js";
import type { NormalizedContent } from "../../types/analysis.js";
import { detectPromptInjection, sanitizeUserInput } from "../../middleware/security.js";

export interface PipelineInput {
  scanId: string;
  inputType: ScanInputType;
  text?: string;
  buffer?: Buffer;
  mimeType?: string;
  language?: string;
}

export class InputPipelineService {
  async run(input: PipelineInput): Promise<NormalizedContent> {
    let extractedText = "";
    let language = input.language ?? "en";
    const labels: string[] = [];

    await this.recordStep(input.scanId, "detect_input_type", "completed", {
      inputType: input.inputType,
    });

    if (input.inputType === "TEXT") {
      extractedText = sanitizeUserInput(input.text ?? "");
      if (detectPromptInjection(extractedText)) {
        throw new Error("PROMPT_INJECTION_DETECTED");
      }
      await this.recordStep(input.scanId, "text_normalize", "completed", {
        length: extractedText.length,
      });
    }

    if (input.inputType === "VOICE" && input.buffer) {
      const start = Date.now();
      const stt = await speechService.speechToText(
        input.buffer,
        input.mimeType ?? "audio/webm"
      );
      extractedText = sanitizeUserInput(stt.text);
      language = stt.language;
      await this.recordStep(input.scanId, "speech_to_text", "completed", stt, Date.now() - start);
    }

    if (
      input.buffer &&
      (input.inputType === "IMAGE" ||
        input.inputType === "PRESCRIPTION" ||
        input.inputType === "PDF")
    ) {
      const start = Date.now();
      const ocr =
        input.inputType === "PDF"
          ? await ocrService.extractFromPdf(input.buffer)
          : await ocrService.extractFromImage(
              input.buffer,
              input.mimeType ?? "image/jpeg"
            );
      extractedText = sanitizeUserInput(ocr.text);
      labels.push(...ocr.labels);
      await this.recordStep(input.scanId, "ocr_extraction", "completed", ocr, Date.now() - start);
    }

    if (!extractedText.trim()) {
      throw new Error("NO_CONTENT_EXTRACTED");
    }

    const startResolve = Date.now();
    const entities = await this.resolveEntities(extractedText);
    const productHints = await this.detectProducts(extractedText, entities);
    await this.recordStep(
      input.scanId,
      "entity_resolution",
      "completed",
      { entities, productHints },
      Date.now() - startResolve
    );

    await prisma.scan.update({
      where: { id: input.scanId },
      data: { normalizedText: extractedText, language },
    });

    return {
      text: extractedText,
      language,
      detectedEntities: entities,
      productHints,
    };
  }

  private async resolveEntities(text: string) {
    const tokens = text
      .split(/[,;\n]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2 && t.length < 80)
      .slice(0, 30);

    const entities = await Promise.all(
      tokens.map(async (token) => {
        const [drug, food] = await Promise.all([
          drugDbService.searchMedicine(token),
          nutritionDbService.resolveIngredient(token),
        ]);
        if (drug[0]) {
          return {
            name: drug[0].name,
            type: "medicine" as const,
            externalId: drug[0].rxcui,
            source: drug[0].source,
            confidence: 0.85,
          };
        }
        return food!;
      })
    );

    return entities.filter(Boolean);
  }

  private async detectProducts(
    text: string,
    entities: NormalizedContent["detectedEntities"]
  ) {
    const barcodeMatch = text.match(/\b(\d{8,14})\b/);
    if (barcodeMatch) {
      const hit = await nutritionDbService.searchBarcode(barcodeMatch[1]);
      if (hit) return [{ name: hit.name, barcode: barcodeMatch[1] }];
    }

    const firstLine = text.split("\n")[0]?.slice(0, 120) ?? "Unknown Product";
    return [
      {
        name: entities[0]?.name ?? firstLine,
        category: entities[0]?.type,
      },
    ];
  }

  private async recordStep(
    scanId: string,
    step: string,
    status: string,
    output: unknown,
    durationMs?: number
  ) {
    await prisma.pipelineStep.create({
      data: { scanId, step, status, output: output as object, durationMs },
    });
  }
}

export const inputPipelineService = new InputPipelineService();
