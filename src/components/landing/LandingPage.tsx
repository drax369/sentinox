"use client";

import { ParticleField } from "@/components/effects/ParticleField";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { LandingHero } from "@/components/landing/LandingHero";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import {
  FEATURES,
  HOW_IT_WORKS,
  LANGUAGES,
  TESTIMONIALS,
} from "@/lib/constants";
import { motion } from "framer-motion";
import {
  Brain,
  Globe,
  History,
  Lock,
  Scan,
  Shield,
} from "lucide-react";
import Link from "next/link";

const ICON_MAP = {
  scan: Scan,
  shield: Shield,
  brain: Brain,
  globe: Globe,
  lock: Lock,
  history: History,
} as const;

export function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="fixed inset-0 -z-10 mesh-gradient" aria-hidden />
      <ParticleField count={36} />

      <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4 backdrop-blur-md">
        <span className="font-[family-name:var(--font-orbitron)] text-lg font-bold neon-text">
          SENTINOX
        </span>
        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-sm text-slate-400 hover:text-cyan-300">
            Sign In
          </Link>
          <Link href="/workspace" data-magnetic>
            <MagneticButton variant="primary">Launch OS</MagneticButton>
          </Link>
        </div>
      </nav>

      <LandingHero />

      <section id="features" className="relative z-10 px-4 py-24">
        <ScrollReveal className="mx-auto max-w-6xl text-center">
          <h2 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold neon-text">
            Live Product Scan Demo
          </h2>
          <p className="mt-2 text-slate-400">Neural analysis in under 2 seconds</p>
        </ScrollReveal>
        <ScrollReveal delay={0.2} className="mx-auto mt-10 max-w-2xl">
          <GlassPanel holographic className="p-6">
            <div className="flex items-center gap-3 font-mono text-sm text-cyan-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              Scanning: Organic Multivitamin Complex...
            </div>
            <div className="mt-4 space-y-2">
              {["Parsing ingredients...", "Cross-referencing interactions...", "Generating health summary..."].map(
                (line, i) => (
                  <motion.p
                    key={line}
                    className="text-slate-400"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    viewport={{ once: true }}
                  >
                    ✓ {line}
                  </motion.p>
                )
              )}
            </div>
          </GlassPanel>
        </ScrollReveal>
      </section>

      <section className="relative z-10 px-4 py-24">
        <ScrollReveal className="mx-auto max-w-6xl text-center">
          <h2 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold">Core Features</h2>
        </ScrollReveal>
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = ICON_MAP[f.icon as keyof typeof ICON_MAP] ?? Brain;
            return (
              <ScrollReveal key={f.title} delay={i * 0.1}>
                <GlassPanel className="group h-full p-6 transition hover:shadow-[var(--glow-cyan)]">
                  <Icon className="mb-4 h-8 w-8 text-cyan-400 transition group-hover:scale-110" />
                  <h3 className="font-semibold text-cyan-100">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{f.description}</p>
                </GlassPanel>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 px-4 py-24">
        <ScrollReveal className="mx-auto max-w-6xl text-center">
          <h2 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold">How It Works</h2>
        </ScrollReveal>
        <motion.div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((step, i) => (
            <ScrollReveal key={step.step} delay={i * 0.15}>
              <GlassPanel className="p-6 text-center">
                <span className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-cyan-400/40">
                  {step.step}
                </span>
                <h3 className="mt-2 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{step.desc}</p>
              </GlassPanel>
            </ScrollReveal>
          ))}
        </motion.div>
      </section>

      <section className="relative z-10 px-4 py-24">
        <ScrollReveal className="mx-auto max-w-6xl text-center">
          <h2 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold">Trusted Voices</h2>
        </ScrollReveal>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1}>
              <GlassPanel className="p-6">
                <p className="text-slate-300 italic">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 font-semibold text-cyan-300">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </GlassPanel>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-4 py-24">
        <ScrollReveal className="mx-auto max-w-6xl text-center">
          <h2 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold">Languages</h2>
        </ScrollReveal>
        <ScrollReveal className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
          {LANGUAGES.map((lang) => (
            <span key={lang.code} className="glass-panel rounded-full px-4 py-2 text-sm">
              {lang.flag} {lang.label}
            </span>
          ))}
        </ScrollReveal>
      </section>

      <section className="relative z-10 px-4 py-24 pb-32">
        <ScrollReveal className="mx-auto max-w-3xl">
          <GlassPanel holographic glow="purple" className="p-10 text-center">
            <Lock className="mx-auto h-10 w-10 text-purple-400" />
            <h2 className="mt-4 font-[family-name:var(--font-orbitron)] text-2xl font-bold">
              Enterprise-Grade Security
            </h2>
            <p className="mt-2 text-slate-400">
              End-to-end encryption, zero-trust architecture, and biometric-ready authentication.
            </p>
            <Link href="/workspace" className="mt-6 inline-block">
              <MagneticButton data-magnetic>Enter Sentinox OS</MagneticButton>
            </Link>
          </GlassPanel>
        </ScrollReveal>
      </section>
    </main>
  );
}
