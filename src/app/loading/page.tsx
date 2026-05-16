"use client";

import { ParticleField } from "@/components/effects/ParticleField";
import dynamic from "next/dynamic";

const VoicePoweredOrb = dynamic(
  () =>
    import("@/components/ui/voice-powered-orb").then((m) => m.VoicePoweredOrb),
  { ssr: false, loading: () => <div className="h-36 w-36" /> }
);
import { useSpeech } from "@/hooks/useSpeech";
import { useAppStore } from "@/stores/app-store";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LOGO_LETTERS = ["S", "E", "N", "T", "I", "N", "O", "X"];

export default function LoadingPage() {
  const router = useRouter();
  const { speak } = useSpeech();
  const setHasCompletedLoading = useAppStore((s) => s.setHasCompletedLoading);
  const [progress, setProgress] = useState(0);
  const [greeted, setGreeted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 30 && !greeted) {
      setGreeted(true);
      speak("Welcome to Sentinox. Initializing neural health intelligence systems.");
    }
  }, [progress, greeted, speak]);

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => {
        setHasCompletedLoading(true);
        router.push("/landing");
      }, 800);
      return () => clearTimeout(t);
    }
  }, [progress, router, setHasCompletedLoading]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden mesh-gradient">
      <ParticleField count={120} />
      <div className="scan-line pointer-events-none absolute inset-0 z-10" aria-hidden />

      <motion.div
        className="relative z-20 flex gap-1 sm:gap-2"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {LOGO_LETTERS.map((letter, i) => (
          <motion.span
            key={`logo-${i}-${letter}`}
            className="font-[family-name:var(--font-orbitron)] text-4xl font-bold neon-text sm:text-6xl"
            variants={{
              hidden: { opacity: 0, y: 40, rotateX: -90 },
              visible: {
                opacity: 1,
                y: 0,
                rotateX: 0,
                transition: { type: "spring", stiffness: 200 },
              },
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>

      <motion.p
        className="relative z-20 mt-8 font-mono text-sm tracking-[0.3em] text-cyan-400/80 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Initializing Sentinox AI...
      </motion.p>

      <div className="relative z-20 mt-10 w-64 sm:w-80">
        <motion.div
          className="h-1 overflow-hidden rounded-full bg-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
            layout
          />
        </motion.div>
        <p className="mt-2 text-center font-mono text-xs text-slate-500">
          {Math.min(Math.round(progress), 100)}% — Neural mesh online
        </p>
      </div>

      <motion.div
        className="absolute bottom-16 left-1/2 h-36 w-36 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <VoicePoweredOrb hue={195} enableVoiceControl={false} className="h-full w-full" />
      </motion.div>
    </main>
  );
}
