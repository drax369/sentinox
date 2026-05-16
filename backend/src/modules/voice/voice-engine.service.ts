import { speechService } from "../../integrations/speech.service.js";
import { prisma } from "../../lib/prisma.js";
import type { VoiceSyncPayload } from "../../types/analysis.js";

export class VoiceEngineService {
  async generate(
    userId: string,
    text: string,
    language: string,
    scanId?: string
  ): Promise<VoiceSyncPayload & { sessionId: string }> {
    const { audioBuffer, mimeType } = await speechService.textToSpeech(
      text,
      language
    );

    const phonemes = this.estimatePhonemes(text);
    const timingMarkers = this.estimateWordTimings(text);
    const emotionTags = this.detectEmotion(text);

    const audioBase64 = audioBuffer.length
      ? audioBuffer.toString("base64")
      : undefined;

    const session = await prisma.voiceSession.create({
      data: {
        userId,
        scanId,
        text,
        language,
        phonemes: phonemes as object,
        emotionTags,
        timingMarkers: timingMarkers as object,
        audioUrl: audioBase64 ? `data:${mimeType};base64,${audioBase64.slice(0, 100)}...` : null,
      },
    });

    return {
      sessionId: session.id,
      audioBase64,
      phonemes,
      emotionTags,
      timingMarkers,
    };
  }

  private estimatePhonemes(text: string): VoiceSyncPayload["phonemes"] {
    const words = text.split(/\s+/).filter(Boolean);
    let ms = 0;
    const phonemes: VoiceSyncPayload["phonemes"] = [];
    for (const word of words) {
      const syllables = Math.max(1, Math.ceil(word.length / 3));
      for (let i = 0; i < syllables; i++) {
        const dur = 80 + Math.random() * 40;
        phonemes.push({
          phoneme: word.slice(i, i + 2) || "AH",
          startMs: ms,
          endMs: ms + dur,
        });
        ms += dur;
      }
      ms += 50;
    }
    return phonemes;
  }

  private estimateWordTimings(text: string): VoiceSyncPayload["timingMarkers"] {
    const words = text.split(/\s+/).filter(Boolean);
    let ms = 0;
    return words.map((word) => {
      const dur = word.length * 60 + 100;
      const marker = { word, startMs: ms, endMs: ms + dur };
      ms += dur + 30;
      return marker;
    });
  }

  private detectEmotion(text: string): string[] {
    const lower = text.toLowerCase();
    if (/warning|risk|danger|avoid|toxic/.test(lower)) return ["concerned", "serious"];
    if (/benefit|safe|help|good/.test(lower)) return ["reassuring", "calm"];
    return ["neutral", "informative"];
  }
}

export const voiceEngineService = new VoiceEngineService();
