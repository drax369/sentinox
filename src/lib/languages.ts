import { getInputPlaceholder } from "./i18n";

/** BCP-47 speech locales + display metadata for Sentinox i18n */
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇬🇧", speechLocale: "en-US" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳", speechLocale: "hi-IN" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", flag: "🇮🇳", speechLocale: "bn-IN" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", flag: "🇮🇳", speechLocale: "te-IN" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", flag: "🇮🇳", speechLocale: "mr-IN" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", flag: "🇮🇳", speechLocale: "ta-IN" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", flag: "🇮🇳", speechLocale: "ur-IN" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", flag: "🇮🇳", speechLocale: "gu-IN" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", flag: "🇮🇳", speechLocale: "kn-IN" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", flag: "🇮🇳", speechLocale: "ml-IN" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", flag: "🇮🇳", speechLocale: "pa-IN" },
  { code: "or", label: "Odia", nativeLabel: "ଓଡ଼ିଆ", flag: "🇮🇳", speechLocale: "or-IN" },
  { code: "as", label: "Assamese", nativeLabel: "অসমীয়া", flag: "🇮🇳", speechLocale: "as-IN" },
  { code: "sa", label: "Sanskrit", nativeLabel: "संस्कृतम्", flag: "🇮🇳", speechLocale: "sa-IN" },
  { code: "kok", label: "Konkani", nativeLabel: "कोंकणी", flag: "🇮🇳", speechLocale: "kok-IN" },
  { code: "mni", label: "Manipuri", nativeLabel: "মৈতৈলোন্", flag: "🇮🇳", speechLocale: "mni-IN" },
  { code: "ne", label: "Nepali", nativeLabel: "नेपाली", flag: "🇳🇵", speechLocale: "ne-NP" },
  { code: "sd", label: "Sindhi", nativeLabel: "سنڌي", flag: "🇮🇳", speechLocale: "sd-IN" },
  { code: "ks", label: "Kashmiri", nativeLabel: "کٲشُر", flag: "🇮🇳", speechLocale: "ks-IN" },
  { code: "mai", label: "Maithili", nativeLabel: "मैथिली", flag: "🇮🇳", speechLocale: "mai-IN" },
  { code: "sat", label: "Santali", nativeLabel: "ᱥᱟᱱᱛᱟᱲᱤ", flag: "🇮🇳", speechLocale: "sat-IN" },
  { code: "doi", label: "Dogri", nativeLabel: "डोगरी", flag: "🇮🇳", speechLocale: "doi-IN" },
  { code: "brx", label: "Bodo", nativeLabel: "बड़ो", flag: "🇮🇳", speechLocale: "brx-IN" },
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸", speechLocale: "es-ES" },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷", speechLocale: "fr-FR" },
  { code: "de", label: "German", nativeLabel: "Deutsch", flag: "🇩🇪", speechLocale: "de-DE" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", flag: "🇸🇦", speechLocale: "ar-SA" },
  { code: "zh", label: "Chinese", nativeLabel: "中文", flag: "🇨🇳", speechLocale: "zh-CN" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", flag: "🇯🇵", speechLocale: "ja-JP" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", flag: "🇧🇷", speechLocale: "pt-BR" },
  { code: "ru", label: "Russian", nativeLabel: "Русский", flag: "🇷🇺", speechLocale: "ru-RU" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const localeMap = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.code, l.speechLocale])
) as Record<string, string>;

const nameMap = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.code, l.label])
) as Record<string, string>;

/** Locales reliably supported by Chrome / Edge Web Speech API */
const CHROME_STT_LOCALES = new Set([
  "en-US",
  "en-IN",
  "en-GB",
  "hi-IN",
  "bn-IN",
  "te-IN",
  "mr-IN",
  "ta-IN",
  "ur-IN",
  "gu-IN",
  "kn-IN",
  "ml-IN",
  "pa-IN",
  "or-IN",
  "as-IN",
  "ne-NP",
  "es-ES",
  "fr-FR",
  "de-DE",
  "ar-SA",
  "zh-CN",
  "ja-JP",
  "pt-BR",
  "ru-RU",
]);

const INDIAN_LANGUAGE_CODES = new Set([
  "hi",
  "bn",
  "te",
  "mr",
  "ta",
  "ur",
  "gu",
  "kn",
  "ml",
  "pa",
  "or",
  "as",
  "sa",
  "kok",
  "mni",
  "ne",
  "sd",
  "ks",
  "mai",
  "sat",
  "doi",
  "brx",
]);

/** For TTS (broader locale list is fine) */
export function getSpeechLocale(code: string): string {
  return localeMap[code] ?? "en-US";
}

/**
 * Locale for Web Speech API — falls back when Chrome does not support the exact tag
 * (e.g. kok-IN, mni-IN → hi-IN).
 */
export function getSpeechRecognitionLocale(code: string): string {
  const preferred = localeMap[code] ?? "en-US";
  if (CHROME_STT_LOCALES.has(preferred)) return preferred;
  if (INDIAN_LANGUAGE_CODES.has(code)) return "hi-IN";
  return "en-US";
}

export function getLanguageName(code: string): string {
  return nameMap[code] ?? code;
}

/** @deprecated Use `getInputPlaceholder(code)` or `useI18n().t("inputPlaceholder")` */
export const INPUT_PLACEHOLDERS: Record<string, string> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.code, getInputPlaceholder(l.code)])
);
