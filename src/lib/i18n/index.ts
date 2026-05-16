import type { UiKey } from "./ui-keys";
import { UI_MESSAGES } from "./ui-messages";
import { resolveLang } from "./resolve-lang";

export type { UiKey };
export { getAnalysisPack } from "./analysis-packs";
export { resolveLang };

export function t(key: UiKey, lang: string, vars?: Record<string, string | number>): string {
  const resolved = resolveLang(lang);
  const table = UI_MESSAGES[resolved] ?? UI_MESSAGES[lang] ?? UI_MESSAGES.en;
  let text = table[key] ?? UI_MESSAGES.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

/** Placeholder for text inputs — same key as UI */
export function getInputPlaceholder(lang: string): string {
  return t("inputPlaceholder", lang);
}
