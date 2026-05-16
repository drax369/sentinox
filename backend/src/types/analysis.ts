import type { RiskLevel } from "@prisma/client";

export interface NormalizedContent {
  text: string;
  language: string;
  detectedEntities: ResolvedEntity[];
  productHints: ProductHint[];
}

export interface ResolvedEntity {
  name: string;
  type: "medicine" | "ingredient" | "nutrient" | "additive" | "unknown";
  externalId?: string;
  source?: string;
  confidence: number;
}

export interface ProductHint {
  name: string;
  brand?: string;
  barcode?: string;
  category?: string;
}

export interface AnalysisResult {
  overview: string;
  ingredientExplanations: { name: string; explanation: string; riskLevel: string }[];
  benefits: string[];
  sideEffects: string[];
  riskFactors: string[];
  drugInteractions: string[];
  allergyWarnings: string[];
  usageInstructions?: string;
  toxicityAlerts: string[];
  contraindications: string[];
  riskLevel: RiskLevel;
  riskScore: number;
  simplifiedExplanation: string;
  childFriendly?: string;
  elderlyFriendly?: string;
  personalizedNotes: string[];
  alternatives: string[];
}

export interface VoiceSyncPayload {
  audioBase64?: string;
  audioUrl?: string;
  phonemes: { phoneme: string; startMs: number; endMs: number }[];
  emotionTags: string[];
  timingMarkers: { word: string; startMs: number; endMs: number }[];
}

export interface StreamChunk {
  type: "progress" | "partial" | "complete" | "error";
  step?: string;
  data?: unknown;
  message?: string;
}
