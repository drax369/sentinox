import { toFile } from "openai/uploads";
import { getGrokClient } from "./grok.client.js";
import { logger } from "../lib/logger.js";
import { multilingualService } from "../modules/multilingual/multilingual.service.js";

export interface SttResult {
  text: string;
  language: string;
  confidence: number;
}

export class SpeechService {
  /**
   * Speech-to-text. Tries xAI-compatible audio API; if unavailable, return empty
   * and use client-side Web Speech → POST /scan/text.
   */
  async speechToText(buffer: Buffer, mimeType: string): Promise<SttResult> {
    const grok = getGrokClient();
    if (!grok) {
      return { text: "", language: "en", confidence: 0 };
    }

    try {
      const file = await toFile(buffer, "audio.webm", { type: mimeType });
      const transcription = await grok.audio.transcriptions.create({
        file,
        model: "whisper-1",
        response_format: "verbose_json",
      });
      const lang = (transcription as { language?: string }).language ?? "en";
      return {
        text: transcription.text,
        language: lang,
        confidence: 0.9,
      };
    } catch (err) {
      logger.warn(
        { err },
        "Grok STT unavailable — send transcript via POST /scan/text or use browser voice input"
      );
      return { text: "", language: "en", confidence: 0 };
    }
  }

  /** Grok has no TTS — frontend uses Web Speech API; Grok handles translation only. */
  async textToSpeech(
    text: string,
    language: string
  ): Promise<{ audioBuffer: Buffer; mimeType: string }> {
    if (language !== "en") {
      await multilingualService.translate(text, language);
    }
    return { audioBuffer: Buffer.alloc(0), mimeType: "audio/mpeg" };
  }
}

export const speechService = new SpeechService();
