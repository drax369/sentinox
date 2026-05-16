import { getGrokClient } from "./grok.client.js";
import { env } from "../config/env.js";

export interface OcrResult {
  text: string;
  labels: string[];
  packagingType?: string;
  confidence: number;
}

export class OcrService {
  async extractFromImage(
    buffer: Buffer,
    mimeType: string
  ): Promise<OcrResult> {
    const grok = getGrokClient();
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    if (grok) {
      const response = await grok.chat.completions.create({
        model: env.GROK_VISION_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Extract all text from product labels, medicines, supplements, or prescriptions. Return JSON: { text, labels: string[], packagingType?: string }. No markdown.",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: dataUrl, detail: "high" },
              },
              { type: "text", text: "Extract label text and ingredient list." },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4096,
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw) as OcrResult;
      return { ...parsed, confidence: 0.92 };
    }

    return {
      text: "[OCR unavailable — set GROK_API_KEY in .env]",
      labels: ["product_label"],
      packagingType: "unknown",
      confidence: 0,
    };
  }

  async extractFromPdf(buffer: Buffer): Promise<OcrResult> {
    return this.extractFromImage(buffer, "application/pdf");
  }
}

export const ocrService = new OcrService();
