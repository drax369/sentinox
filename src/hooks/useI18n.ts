"use client";

import { useCallback } from "react";
import { t, type UiKey } from "@/lib/i18n";
import { useAppStore } from "@/stores/app-store";

export function useI18n() {
  const language = useAppStore((s) => s.language);

  const translate = useCallback(
    (key: UiKey, vars?: Record<string, string | number>) => t(key, language, vars),
    [language]
  );

  return { language, t: translate };
}
