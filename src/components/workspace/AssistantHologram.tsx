"use client";

import { VoicePoweredOrb } from "@/components/ui/voice-powered-orb";
import { WaveVisualizer } from "@/components/ui/wave-visualizer";
import { cn } from "@/lib/utils";
import type { AssistantState } from "@/types";
import { motion } from "framer-motion";

const STATE_LABEL: Record<AssistantState, string> = {
  idle: "Ready",
  listening: "Listening",
  thinking: "Analyzing",
  speaking: "Speaking",
};

interface AssistantHologramProps {
  state: AssistantState;
  className?: string;
}

export function AssistantHologram({ state, className }: AssistantHologramProps) {
  const active = state === "listening" || state === "thinking" || state === "speaking";

  return (
    <div className={cn("relative flex h-full min-h-[280px] w-full flex-col", className)}>
      <WaveVisualizer active={active} />
      <motion.div
        className="relative mx-auto aspect-square w-full max-w-[min(100%,320px)] flex-1"
        animate={{
          scale: state === "thinking" ? [1, 1.04, 1] : 1,
        }}
        transition={{ duration: 1.2, repeat: state === "thinking" ? Infinity : 0 }}
      >
        {isScanningRing(state) && (
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 pulse-ring" />
        )}
        <VoicePoweredOrb
          enableVoiceControl={state === "listening"}
          hue={state === "listening" ? 190 : 200}
          className="h-full w-full"
        />
      </motion.div>
      <p className="mt-3 text-center font-[family-name:var(--font-orbitron)] text-xs tracking-[0.25em] text-cyan-400/70 uppercase">
        {STATE_LABEL[state]}
      </p>
    </div>
  );
}

function isScanningRing(state: AssistantState) {
  return state === "thinking";
}
