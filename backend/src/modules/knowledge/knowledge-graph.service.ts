import { prisma } from "../../lib/prisma.js";
import type { ResolvedEntity } from "../../types/analysis.js";

export class KnowledgeGraphService {
  async upsertIngredient(name: string) {
    const normalized = name.toLowerCase().trim();
    return prisma.ingredient.upsert({
      where: { normalized },
      create: { name, normalized },
      update: { name },
    });
  }

  async linkIngredients(
    fromName: string,
    toName: string,
    relationType: string,
    weight = 1
  ) {
    const from = await this.upsertIngredient(fromName);
    const to = await this.upsertIngredient(toName);
    return prisma.knowledgeEdge.upsert({
      where: {
        fromId_toId_relationType: {
          fromId: from.id,
          toId: to.id,
          relationType,
        },
      },
      create: {
        fromId: from.id,
        toId: to.id,
        relationType,
        weight,
      },
      update: { weight },
    });
  }

  async getRelated(name: string, depth = 2): Promise<string[]> {
    const ing = await prisma.ingredient.findFirst({
      where: { normalized: name.toLowerCase() },
    });
    if (!ing) return [];

    const edges = await prisma.knowledgeEdge.findMany({
      where: { OR: [{ fromId: ing.id }, { toId: ing.id }] },
      include: { from: true, to: true },
      take: 20,
    });

    const related = new Set<string>();
    for (const e of edges) {
      related.add(e.from.name);
      related.add(e.to.name);
    }
    related.delete(name);
    return [...related].slice(0, depth * 5);
  }

  async enrichFromEntities(entities: ResolvedEntity[]) {
    for (const e of entities) {
      await this.upsertIngredient(e.name);
      if (e.type === "medicine") {
        await this.linkIngredients(e.name, "side_effects", "may_cause");
      }
    }
  }

  async contextualReasoning(
    productName: string,
    ingredients: string[],
    conditions: string[]
  ): Promise<string[]> {
    const insights: string[] = [];
    for (const ing of ingredients.slice(0, 10)) {
      const related = await this.getRelated(ing);
      for (const cond of conditions) {
        if (
          related.some((r) => r.toLowerCase().includes(cond.toLowerCase())) ||
          ing.toLowerCase().includes(cond.toLowerCase())
        ) {
          insights.push(
            `${ing} may be relevant to your condition: ${cond}. Consult your clinician.`
          );
        }
      }
    }
    if (insights.length === 0 && ingredients.length > 0) {
      insights.push(
        `Knowledge graph linked ${ingredients.length} compounds for ${productName}.`
      );
    }
    return insights;
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
