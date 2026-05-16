import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import type { ResolvedEntity } from "../types/analysis.js";

export class NutritionDbService {
  async resolveIngredient(name: string): Promise<ResolvedEntity | null> {
    const normalized = name.toLowerCase().trim();

    try {
      const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&json=1&page_size=3`;
      const res = await fetch(offUrl, {
        headers: { "User-Agent": "Sentinox/1.0 (health-ai)" },
      });
      if (res.ok) {
        const data = (await res.json()) as {
          products?: { product_name?: string; ingredients_text?: string }[];
        };
        const product = data.products?.[0];
        if (product?.product_name) {
          return {
            name: product.product_name,
            type: "ingredient",
            source: "open_food_facts",
            confidence: 0.75,
          };
        }
      }
    } catch (err) {
      logger.debug({ err, name }, "Open Food Facts lookup failed");
    }

    if (env.USDA_FDC_API_KEY) {
      try {
        const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${env.USDA_FDC_API_KEY}&query=${encodeURIComponent(name)}&pageSize=1`;
        const res = await fetch(usdaUrl);
        if (res.ok) {
          const data = (await res.json()) as { foods?: { description: string; fdcId: number }[] };
          const food = data.foods?.[0];
          if (food) {
            return {
              name: food.description,
              type: "nutrient",
              externalId: String(food.fdcId),
              source: "usda_fdc",
              confidence: 0.8,
            };
          }
        }
      } catch (err) {
        logger.debug({ err }, "USDA FDC lookup failed");
      }
    }

    return {
      name: normalized,
      type: "unknown",
      confidence: 0.4,
    };
  }

  async searchBarcode(barcode: string): Promise<ResolvedEntity | null> {
    try {
      const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Sentinox/1.0" },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        product?: { product_name?: string; ingredients_text?: string };
      };
      if (data.product?.product_name) {
        return {
          name: data.product.product_name,
          type: "ingredient",
          source: "open_food_facts_barcode",
          externalId: barcode,
          confidence: 0.9,
        };
      }
    } catch {
      /* ignore */
    }
    return null;
  }
}

export const nutritionDbService = new NutritionDbService();
