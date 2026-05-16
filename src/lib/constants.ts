import { SUPPORTED_LANGUAGES } from "./languages";

export const LANGUAGES = SUPPORTED_LANGUAGES.map((l) => ({
  code: l.code,
  label: l.nativeLabel,
  flag: l.flag,
}));

export const FEATURES = [
  {
    icon: "scan",
    title: "Multi-Modal Scan",
    description:
      "Analyze products via text, voice, camera, or document upload with neural precision.",
  },
  {
    icon: "shield",
    title: "Drug Interaction Engine",
    description:
      "Cross-reference medications, supplements, and allergens against your health profile.",
  },
  {
    icon: "brain",
    title: "AI Health Education",
    description:
      "Simplified explanations of ingredients, benefits, risks, and safe dosage in your language.",
  },
  {
    icon: "globe",
    title: "Global Language Support",
    description:
      "Voice playback and localized summaries across 30+ languages including all major Indian languages.",
  },
  {
    icon: "lock",
    title: "Zero-Trust Security",
    description:
      "End-to-end encryption, biometric-ready auth, and HIPAA-aligned data architecture.",
  },
  {
    icon: "history",
    title: "Scan Memory",
    description:
      "Timeline history, saved products, and persistent AI chat memory for continuity.",
  },
] as const;

export const HOW_IT_WORKS = [
  { step: "01", title: "Capture", desc: "Upload label, speak ingredients, or snap a photo." },
  { step: "02", title: "Analyze", desc: "Sentinox AI parses compounds and cross-references databases." },
  { step: "03", title: "Educate", desc: "Receive breakdowns, risks, interactions, and alternatives." },
  { step: "04", title: "Act", desc: "Save to profile, set alerts, and share with your care team." },
] as const;

export const TESTIMONIALS = [
  {
    name: "Dr. Amara Chen",
    role: "Clinical Pharmacist",
    quote:
      "Sentinox translates complex label data into patient-friendly insights in seconds.",
  },
  {
    name: "Marcus Rivera",
    role: "Allergy Patient",
    quote:
      "I finally understand what's in my supplements without a medical degree.",
  },
  {
    name: "Priya Nair",
    role: "Nutrition Coach",
    quote:
      "The ingredient breakdown and interaction warnings are remarkably accurate.",
  },
] as const;
