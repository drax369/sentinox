"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ParticleField } from "@/components/effects/ParticleField";
import { MeshBackground } from "@/components/effects/MeshBackground";
import { useAppStore } from "@/stores/app-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint,
  Lock,
  Mail,
  Shield,
  Code2,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthMode = "signin" | "signup" | "otp";

export default function AuthPage() {
  const router = useRouter();
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin" || mode === "signup") {
      setMode("otp");
      return;
    }
    setAuthenticated(true);
    router.push("/workspace");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4 mesh-gradient">
      <MeshBackground />
      <ParticleField count={50} />

      <GlassPanel
        holographic
        glow="cyan"
        className="relative z-10 w-full max-w-md p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6 text-center">
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold neon-text">
            SENTINOX
          </h1>
          <p className="mt-1 text-sm text-slate-400">Secure Health Intelligence Access</p>
        </div>

        <motion.div className="mb-6 flex gap-2 rounded-xl bg-white/5 p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-sm transition-all ${
                mode === m
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </motion.div>

        <div className="mb-6 flex gap-3">
          {[Globe, Code2].map((Icon, i) => (
            <button
              key={i}
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/5"
              aria-label="Social sign in"
            >
              <Icon className="h-4 w-4" />
              {i === 0 ? "Google" : "GitHub"}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
          <div className="h-px flex-1 bg-white/10" />
          or email
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {mode !== "otp" ? (
              <>
                <label className="block">
                  <span className="mb-1 flex items-center gap-2 text-xs text-cyan-400/80">
                    <Mail className="h-3 w-3" /> Email
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                    placeholder="you@healthmail.com"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 flex items-center gap-2 text-xs text-cyan-400/80">
                    <Lock className="h-3 w-3" /> Password
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-cyan-400/50"
                    placeholder="••••••••"
                  />
                </label>
              </>
            ) : (
              <label className="block">
                <span className="mb-1 text-xs text-cyan-400/80">OTP Verification</span>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center font-mono text-lg tracking-[0.5em] outline-none focus:border-cyan-400/50"
                  placeholder="000000"
                />
              </label>
            )}

            <MagneticButton type="submit" className="w-full" data-magnetic>
              {mode === "otp" ? "Verify & Enter" : mode === "signin" ? "Sign In" : "Create Account"}
            </MagneticButton>
          </motion.form>
        </AnimatePresence>

        <motion.div
          className="mt-6 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div className="flex items-center gap-2 text-xs text-emerald-400">
            <Shield className="h-4 w-4" />
            <span>256-bit encrypted</span>
          </motion.div>
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-cyan-400/70 hover:text-cyan-300"
            title="Biometric auth ready"
            aria-label="Biometric authentication ready"
          >
            <Fingerprint className="h-4 w-4" />
            Bio-ready
          </button>
        </motion.div>

        <p className="mt-4 text-center text-xs text-slate-500">
          <Link href="/landing" className="text-cyan-400/70 hover:text-cyan-300">
            ← Back to home
          </Link>
        </p>
      </GlassPanel>
    </main>
  );
}
