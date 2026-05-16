import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export interface DrugMatch {
  rxcui?: string;
  name: string;
  source: string;
}

export interface InteractionResult {
  substanceA: string;
  substanceB: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
}

export class DrugDbService {
  async searchMedicine(name: string): Promise<DrugMatch[]> {
    try {
      const url = `${env.RXNORM_API_BASE}/drugs.json?name=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = (await res.json()) as {
        drugGroup?: { conceptGroup?: { conceptProperties?: { name: string; rxcui: string }[] }[] };
      };
      const concepts =
        data.drugGroup?.conceptGroup?.flatMap((g) => g.conceptProperties ?? []) ?? [];
      return concepts.slice(0, 5).map((c) => ({
        rxcui: c.rxcui,
        name: c.name,
        source: "rxnorm",
      }));
    } catch (err) {
      logger.warn({ err, name }, "RxNorm lookup failed");
      return [];
    }
  }

  async checkInteractions(
    medications: string[],
    ingredients: string[]
  ): Promise<InteractionResult[]> {
    const results: InteractionResult[] = [];
    const allSubs = [...medications, ...ingredients].map((s) => s.toLowerCase());

    const knownPairs: [string, string, InteractionResult][] = [
      [
        "warfarin",
        "vitamin k",
        {
          substanceA: "Warfarin",
          substanceB: "Vitamin K",
          severity: "moderate",
          description: "Vitamin K may reduce anticoagulant effect.",
        },
      ],
      [
        "maoi",
        "tyramine",
        {
          substanceA: "MAOI",
          substanceB: "Tyramine",
          severity: "severe",
          description: "Hypertensive crisis risk with tyramine-rich foods.",
        },
      ],
    ];

    for (const [a, b, interaction] of knownPairs) {
      const hasA = allSubs.some((s) => s.includes(a));
      const hasB = allSubs.some((s) => s.includes(b));
      if (hasA && hasB) results.push(interaction);
    }

    return results;
  }
}

export const drugDbService = new DrugDbService();
