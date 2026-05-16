export type AssistantState = "idle" | "listening" | "thinking" | "speaking";

export type InputMethod = "text" | "voice" | "camera" | "gallery" | "drop";

export type ThemeMode = "dark" | "light";

export interface Ingredient {
  name: string;
  amount?: string;
  purpose: string;
  riskLevel: "low" | "medium" | "high";
}

export interface RiskAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
}

export interface ProductAnalysis {
  id: string;
  productName: string;
  category: string;
  summary: string;
  ingredients: Ingredient[];
  benefits: string[];
  sideEffects: string[];
  avoidIf: string[];
  drugInteractions: string[];
  allergyRisks: string[];
  longTermRisks: string[];
  safeDosage?: string;
  useCases: string[];
  conditionSuitability: { condition: string; suitable: boolean; note: string }[];
  alternatives: string[];
  personalizedRecommendations: string[];
  simplifiedExplanation: string;
  scannedAt: string;
}

export interface SavedProduct {
  id: string;
  name: string;
  category: string;
  scannedAt: string;
  analysisId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface HealthProfile {
  allergies: string[];
  conditions: string[];
  medications: string[];
  dietaryRestrictions: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
