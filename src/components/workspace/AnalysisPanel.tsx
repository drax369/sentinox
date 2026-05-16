"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/hooks/useI18n";
import type { ProductAnalysis } from "@/types";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  Pill,
  Sparkles,
  XCircle,
} from "lucide-react";

interface AnalysisPanelProps {
  analysis: ProductAnalysis | null;
  isScanning: boolean;
  scanProgress: number;
  onSpeak?: () => void;
}

function Section({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <h3 className="mb-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

export function AnalysisPanel({
  analysis,
  isScanning,
  scanProgress,
  onSpeak,
}: AnalysisPanelProps) {
  const { t } = useI18n();

  const riskLabel = (level: string) => {
    if (level === "high") return t("riskHigh");
    if (level === "medium") return t("riskMedium");
    return t("riskLow");
  };

  if (isScanning) {
    return (
      <GlassPanel className="flex h-full flex-col p-4" glow="purple">
        <h2 className="mb-4 font-[family-name:var(--font-orbitron)] text-sm font-semibold text-purple-400">
          {t("analysisOutput")}
        </h2>
        <div className="mb-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
              animate={{ width: `${scanProgress}%` }}
            />
          </div>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {t("scanningPct", { n: scanProgress })}
          </p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </GlassPanel>
    );
  }

  if (!analysis) {
    return (
      <GlassPanel className="flex h-full flex-col items-center justify-center p-8 text-center" glow="purple">
        <Sparkles className="mb-4 h-12 w-12 text-purple-400/40" />
        <p className="text-slate-400">{t("analysisEmpty")}</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel className="flex h-full flex-col overflow-hidden" glow="purple">
      <div className="flex items-center justify-between border-b border-white/10 p-4">
        <h2 className="font-[family-name:var(--font-orbitron)] text-sm font-semibold text-purple-400">
          {t("analysisOutput")}
        </h2>
        {onSpeak && (
          <button
            type="button"
            onClick={onSpeak}
            className="rounded-lg border border-cyan-400/30 px-3 py-1 text-xs text-cyan-300 hover:bg-cyan-500/10"
          >
            {t("voicePlayback")}
          </button>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <Section title={t("productSummary")} delay={0}>
            <p className="text-lg font-semibold text-cyan-100">{analysis.productName}</p>
            <span className="mt-1 inline-block rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400">
              {analysis.category}
            </span>
            <p className="mt-2 text-sm text-slate-400">{analysis.summary}</p>
          </Section>

          <Section title={t("ingredients")} delay={0.1}>
            <div className="space-y-2">
              {analysis.ingredients.map((ing, i) => (
                <motion.div
                  key={`${ing.name}-${i}`}
                  className="glass-panel rounded-xl p-3"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{ing.name}</span>
                    <span
                      className={`text-xs ${
                        ing.riskLevel === "high"
                          ? "text-red-400"
                          : ing.riskLevel === "medium"
                            ? "text-amber-400"
                            : "text-emerald-400"
                      }`}
                    >
                      {riskLabel(ing.riskLevel)}
                    </span>
                  </div>
                  {ing.amount && (
                    <p className="text-xs text-slate-500">{ing.amount}</p>
                  )}
                  <p className="text-xs text-slate-400">{ing.purpose}</p>
                </motion.div>
              ))}
            </div>
          </Section>

          <Section title={t("benefits")} delay={0.2}>
            <ul className="space-y-1">
              {analysis.benefits.map((b, i) => (
                <li key={`benefit-${i}`} className="flex gap-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  {b}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t("riskAlerts")} delay={0.25}>
            {analysis.sideEffects.map((s, i) => (
              <p key={`side-${i}`} className="mb-1 flex gap-2 text-sm text-amber-200/90">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                {s}
              </p>
            ))}
            {analysis.drugInteractions.map((d, i) => (
              <p key={`interaction-${i}`} className="mb-1 flex gap-2 text-sm text-red-300/90">
                <Pill className="h-4 w-4 shrink-0 text-red-400" />
                {d}
              </p>
            ))}
          </Section>

          <Section title={t("whoShouldAvoid")} delay={0.3}>
            <ul className="space-y-1">
              {analysis.avoidIf.map((a, i) => (
                <li key={`avoid-${i}`} className="flex gap-2 text-sm text-slate-400">
                  <XCircle className="h-4 w-4 shrink-0 text-red-400/70" />
                  {a}
                </li>
              ))}
            </ul>
          </Section>

          {analysis.safeDosage && (
            <Section title={t("safeDosage")} delay={0.35}>
              <p className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3 text-sm">
                {analysis.safeDosage}
              </p>
            </Section>
          )}

          <Section title={t("conditionSuitability")} delay={0.4}>
            <div className="space-y-2">
              {analysis.conditionSuitability.map((c) => (
                <div
                  key={c.condition}
                  className="flex items-start justify-between rounded-lg bg-white/5 p-2 text-sm"
                >
                  <span>{c.condition}</span>
                  <span className={c.suitable ? "text-emerald-400" : "text-red-400"}>
                    {c.suitable ? t("suitable") : t("avoid")}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t("alternatives")} delay={0.45}>
            <ul className="list-inside list-disc text-sm text-slate-400">
              {analysis.alternatives.map((a, i) => (
                <li key={`alt-${i}`}>{a}</li>
              ))}
            </ul>
          </Section>

          <Section title={t("personalized")} delay={0.5}>
            {analysis.personalizedRecommendations.map((r, i) => (
              <p key={`rec-${i}`} className="text-sm text-purple-200/80">
                → {r}
              </p>
            ))}
          </Section>

          <Section title={t("simplifiedExplanation")} delay={0.55}>
            <p className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-4 text-sm leading-relaxed">
              {analysis.simplifiedExplanation}
            </p>
          </Section>
      </div>
    </GlassPanel>
  );
}
