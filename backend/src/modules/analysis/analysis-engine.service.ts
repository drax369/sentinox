import { RiskLevel } from "@prisma/client";
import { getGrokClient } from "../../integrations/grok.client.js";
import { drugDbService } from "../../integrations/drug-db.service.js";
import { env } from "../../config/env.js";
import { knowledgeGraphService } from "../knowledge/knowledge-graph.service.js";
import { profileService } from "../profile/profile.service.js";
import { multilingualService } from "../multilingual/multilingual.service.js";
import type { AnalysisResult, NormalizedContent } from "../../types/analysis.js";
import type { ProfileUpdateInput } from "../profile/profile.service.js";

export class AnalysisEngineService {
  async analyze(
    userId: string,
    content: NormalizedContent
  ): Promise<AnalysisResult> {
    const profile = await profileService.getPersonalizationContext(userId);
    const ingredientNames = content.detectedEntities.map((e) => e.name);

    const drugInteractions = await drugDbService.checkInteractions(
      profile.currentMedications,
      ingredientNames
    );

    const allergyWarnings = this.checkAllergies(
      profile.allergies,
      content.text,
      ingredientNames
    );

    const graphInsights = await knowledgeGraphService.contextualReasoning(
      content.productHints[0]?.name ?? "Product",
      ingredientNames,
      profile.chronicConditions
    );

    let aiResult = await this.runAiAnalysis(content, profile);

    const personalizedNotes = [
      ...this.personalize(profile as ProfileUpdateInput & { age?: number }),
      ...graphInsights,
      ...allergyWarnings.map((w) => `Allergy alert: ${w}`),
    ];

    const riskScore = this.computeRiskScore(
      aiResult.riskScore,
      drugInteractions.length,
      allergyWarnings.length,
      profile.age
    );

    const riskLevel = this.scoreToLevel(riskScore);

    if (content.language !== "en") {
      aiResult = await this.localizeResult(aiResult, content.language);
    }

    return {
      ...aiResult,
      drugInteractions: [
        ...aiResult.drugInteractions,
        ...drugInteractions.map(
          (d) => `${d.substanceA} + ${d.substanceB}: ${d.description} (${d.severity})`
        ),
      ],
      allergyWarnings: [...aiResult.allergyWarnings, ...allergyWarnings],
      personalizedNotes,
      riskScore,
      riskLevel,
    };
  }

  private async runAiAnalysis(
    content: NormalizedContent,
    profile: Awaited<ReturnType<typeof profileService.getPersonalizationContext>>
  ): Promise<AnalysisResult> {
    const grok = getGrokClient();
    const systemPrompt = `You are Sentinox medical education AI. Analyze consumable products. 
Output strict JSON matching this schema:
{
  "overview": string,
  "ingredientExplanations": [{"name": string, "explanation": string, "riskLevel": "low"|"medium"|"high"}],
  "benefits": string[],
  "sideEffects": string[],
  "riskFactors": string[],
  "drugInteractions": string[],
  "allergyWarnings": string[],
  "usageInstructions": string,
  "toxicityAlerts": string[],
  "contraindications": string[],
  "riskScore": number (0-100),
  "simplifiedExplanation": string,
  "childFriendly": string,
  "elderlyFriendly": string,
  "alternatives": string[]
}
User context: age=${profile.age}, allergies=${profile.allergies.join(",")}, meds=${profile.currentMedications.join(",")}, conditions=${profile.chronicConditions.join(",")}.
Disclaimer: Educational only, not medical diagnosis.`;

    if (grok) {
      const res = await grok.chat.completions.create({
        model: env.GROK_REASONING_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze:\n${content.text}\n\nEntities: ${JSON.stringify(content.detectedEntities)}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const raw = JSON.parse(res.choices[0]?.message?.content ?? "{}") as AnalysisResult & {
        riskScore: number;
      };
      return {
        ...raw,
        riskLevel: this.scoreToLevel(raw.riskScore ?? 30),
        personalizedNotes: [],
      };
    }

    return this.fallbackAnalysis(content);
  }

  private async localizeResult(
    result: AnalysisResult,
    lang: string
  ): Promise<AnalysisResult> {
    const [
      overview,
      simplifiedExplanation,
      usageInstructions,
      childFriendly,
      elderlyFriendly,
      benefits,
      sideEffects,
      riskFactors,
      drugInteractions,
      allergyWarnings,
      toxicityAlerts,
      contraindications,
      alternatives,
      ingredientExplanations,
    ] = await Promise.all([
      multilingualService.translate(result.overview, lang),
      multilingualService.translate(result.simplifiedExplanation, lang),
      multilingualService.translate(result.usageInstructions ?? "", lang),
      multilingualService.translate(result.childFriendly ?? "", lang),
      multilingualService.translate(result.elderlyFriendly ?? "", lang),
      multilingualService.translateArray(result.benefits, lang),
      multilingualService.translateArray(result.sideEffects, lang),
      multilingualService.translateArray(result.riskFactors, lang),
      multilingualService.translateArray(result.drugInteractions, lang),
      multilingualService.translateArray(result.allergyWarnings, lang),
      multilingualService.translateArray(result.toxicityAlerts, lang),
      multilingualService.translateArray(result.contraindications, lang),
      multilingualService.translateArray(result.alternatives, lang),
      Promise.all(
        result.ingredientExplanations.map(async (ing) => ({
          ...ing,
          explanation: await multilingualService.translate(ing.explanation, lang),
        }))
      ),
    ]);

    return {
      ...result,
      overview,
      simplifiedExplanation,
      usageInstructions,
      childFriendly,
      elderlyFriendly,
      benefits,
      sideEffects,
      riskFactors,
      drugInteractions,
      allergyWarnings,
      toxicityAlerts,
      contraindications,
      alternatives,
      ingredientExplanations,
    };
  }

  private fallbackAnalysis(content: NormalizedContent): AnalysisResult {
    const names = content.detectedEntities.map((e) => e.name).join(", ") || "components";
    return {
      overview: `Analysis of product containing: ${names}. Configure GROK_API_KEY for full AI reasoning.`,
      ingredientExplanations: content.detectedEntities.map((e) => ({
        name: e.name,
        explanation: `Detected ${e.type} from ${e.source ?? "input"}.`,
        riskLevel: "medium",
      })),
      benefits: ["Supports general wellness when used as directed"],
      sideEffects: ["Individual reactions may vary"],
      riskFactors: ["Consult healthcare provider if pregnant or on medication"],
      drugInteractions: [],
      allergyWarnings: [],
      usageInstructions: "Follow label directions.",
      toxicityAlerts: [],
      contraindications: [],
      riskLevel: RiskLevel.CAUTION,
      riskScore: 45,
      simplifiedExplanation: `This product includes ${names}. Talk to your doctor if you have allergies or take other medicines.`,
      childFriendly: `This has different ingredients. Ask a grown-up before using it.`,
      elderlyFriendly: `Review ingredients with your pharmacist, especially if you take multiple medications.`,
      personalizedNotes: [],
      alternatives: ["Consult pharmacist for alternatives"],
    };
  }

  private checkAllergies(
    allergies: string[],
    text: string,
    ingredients: string[]
  ): string[] {
    const warnings: string[] = [];
    const haystack = `${text} ${ingredients.join(" ")}`.toLowerCase();
    for (const allergy of allergies) {
      if (haystack.includes(allergy.toLowerCase())) {
        warnings.push(`Contains or may contain allergen: ${allergy}`);
      }
    }
    return warnings;
  }

  private personalize(profile: ProfileUpdateInput & { age?: number }): string[] {
    const notes: string[] = [];
    if (profile.age && profile.age < 12) {
      notes.push("Pediatric user: verify age-appropriate dosing with pediatrician.");
    }
    if (profile.age && profile.age > 65) {
      notes.push("Older adult: monitor for drug-nutrient interactions and polypharmacy.");
    }
    return notes;
  }

  private computeRiskScore(
    base: number,
    interactionCount: number,
    allergyCount: number,
    age?: number | null
  ): number {
    let score = base;
    score += interactionCount * 12;
    score += allergyCount * 15;
    if (age && age < 12) score += 10;
    return Math.min(100, Math.max(0, score));
  }

  private scoreToLevel(score: number): RiskLevel {
    if (score >= 70) return RiskLevel.HIGH_RISK;
    if (score >= 40) return RiskLevel.CAUTION;
    return RiskLevel.SAFE;
  }
}

export const analysisEngineService = new AnalysisEngineService();
