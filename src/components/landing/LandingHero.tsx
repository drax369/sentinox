"use client";

import { MagneticButton } from "@/components/ui/MagneticButton";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function LandingHero() {
  const titleWords = "Decode Your Health".split(" ");

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pt-24">
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,255,0.12),transparent_60%)]"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,245,255,0.08) 1px, transparent 1px), linear-gradient(rgba(0,245,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "48px 48px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.p
          className="mb-4 font-mono text-xs tracking-[0.4em] text-cyan-400/80 uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Neural Health Intelligence
        </motion.p>
        <h1 className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-[family-name:var(--font-orbitron)] text-4xl font-extrabold uppercase text-white sm:text-5xl md:text-6xl xl:text-7xl">
          {titleWords.map((word, i) => (
            <motion.span
              key={`title-${i}-${word}`}
              className="fade-in-word inline-block"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i + 0.3, type: "spring", stiffness: 120 }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="mt-4 max-w-xl text-sm text-slate-300 md:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          AI-powered analysis of food, medicine, and supplements — in your language, with voice and vision.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Link href="/workspace" data-magnetic>
            <MagneticButton variant="primary">Launch Sentinox OS</MagneticButton>
          </Link>
          <Link href="/auth">
            <MagneticButton variant="ghost">Create Account</MagneticButton>
          </Link>
        </motion.div>
      </div>

      <motion.a
        href="#features"
        className="explore-btn absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 text-sm text-white/70 transition hover:text-cyan-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        Scroll to explore
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </motion.a>
    </section>
  );
}
