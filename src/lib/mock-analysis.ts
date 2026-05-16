import { getAnalysisPack } from "@/lib/i18n/analysis-packs";
import { t } from "@/lib/i18n";
import type { ProductAnalysis } from "@/types";

export function generateMockAnalysis(
  input: string,
  language: string
): ProductAnalysis {
  const pack = getAnalysisPack(language);
  const productName =
    input.slice(0, 60).trim() || t("unknownProduct", language);
  const category = detectCategory(input, pack);

  return {
    id: crypto.randomUUID(),
    productName,
    category,
    summary: pack.summary(productName),
    ingredients: pack.ingredients.map((ing) => ({ ...ing })),
    benefits: [...pack.benefits],
    sideEffects: [...pack.sideEffects],
    avoidIf: [...pack.avoidIf],
    drugInteractions: [...pack.drugInteractions],
    allergyRisks: [...pack.allergyRisks],
    longTermRisks: [...pack.longTermRisks],
    safeDosage:
      category === pack.categories.medicine ? pack.safeDosageMedicine : undefined,
    useCases: [...pack.useCases],
    conditionSuitability: pack.conditions.map((c) => ({ ...c })),
    alternatives: [...pack.alternatives],
    personalizedRecommendations: [...pack.recommendations],
    simplifiedExplanation: pack.simplified(category),
    scannedAt: new Date().toISOString(),
  };
}

function detectCategory(
  input: string,
  pack: ReturnType<typeof getAnalysisPack>
): string {
  const lower = input.toLowerCase();
  if (/medicine|tablet|capsule|prescription|mg|dose|दवा|औषध|மருந்து|మందు|دوا/i.test(lower))
    return pack.categories.medicine;
  if (/supplement|vitamin|mineral|probiotic|सप्लीमेंट|சத்து/i.test(lower))
    return pack.categories.supplement;
  if (/food|snack|nutrition|calorie|protein|भोजन|खाद्य|உணவு/i.test(lower))
    return pack.categories.food;
  return pack.categories.health;
}
