import { getGrokClient } from "../../integrations/grok.client.js";
import { env } from "../../config/env.js";
import { getLanguageName, LANGUAGE_NAMES } from "../../lib/languages.js";

export class MultilingualService {
  async translate(text: string, targetLang: string): Promise<string> {
    if (!text?.trim() || targetLang === "en") return text;
    const grok = getGrokClient();
    const langName = getLanguageName(targetLang);

    if (grok) {
      const res = await grok.chat.completions.create({
        model: env.GROK_MODEL,
        messages: [
          {
            role: "system",
            content: `Translate accurately to ${langName}. Preserve medical and ingredient terminology where possible. Output only the translation, no notes.`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.2,
      });
      return res.choices[0]?.message?.content?.trim() ?? text;
    }

    return text;
  }

  async translateArray(items: string[], targetLang: string): Promise<string[]> {
    if (targetLang === "en" || !items.length) return items;
    const joined = items.map((item, i) => `[${i}] ${item}`).join("\n");
    const grok = getGrokClient();
    if (!grok) return items;

    const langName = getLanguageName(targetLang);
    const res = await grok.chat.completions.create({
      model: env.GROK_MODEL,
      messages: [
        {
          role: "system",
          content: `Translate each numbered line to ${langName}. Keep [index] prefixes. One translation per line.`,
        },
        { role: "user", content: joined },
      ],
      temperature: 0.2,
    });

    const out = res.choices[0]?.message?.content ?? "";
    return out
      .split("\n")
      .map((line) => line.replace(/^\[\d+\]\s*/, "").trim())
      .filter(Boolean);
  }

  async detectLanguage(text: string): Promise<string> {
    const grok = getGrokClient();
    if (!grok || !text.trim()) return "en";

    const res = await grok.chat.completions.create({
      model: env.GROK_MODEL,
      messages: [
        {
          role: "system",
          content: `Detect the primary language of the user text. Reply with ONLY the ISO 639-1 code (e.g. hi, en, ta). Supported: ${Object.keys(LANGUAGE_NAMES).join(", ")}`,
        },
        { role: "user", content: text.slice(0, 500) },
      ],
      temperature: 0,
    });

    const code = res.choices[0]?.message?.content?.trim().toLowerCase().slice(0, 6) ?? "en";
    return LANGUAGE_NAMES[code] ? code : "en";
  }

  async regionalSimplify(text: string, region?: string, lang = "en"): Promise<string> {
    const grok = getGrokClient();
    if (!grok) return text;

    const langName = getLanguageName(lang);
    const res = await grok.chat.completions.create({
      model: env.GROK_MODEL,
      messages: [
        {
          role: "system",
          content: `Simplify for a general audience in ${region ?? "India"} using ${langName}. Plain language, 2-3 short paragraphs.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.3,
    });
    return res.choices[0]?.message?.content ?? text;
  }

  listSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_NAMES);
  }
}

export const multilingualService = new MultilingualService();
