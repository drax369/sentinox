"use client";

import { useAppStore } from "@/stores/app-store";
import { useEffect } from "react";

/** Keeps document `lang` in sync with the selected app language (a11y + TTS) */
export function LanguageSync() {
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
