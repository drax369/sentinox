"use client";

import { LANGUAGES } from "@/lib/constants";
import { useAppStore } from "@/stores/app-store";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Moon, Sun, Globe, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function WorkspaceHeader() {
  const language = useAppStore((s) => s.language);
  const theme = useAppStore((s) => s.theme);
  const notifications = useAppStore((s) => s.notifications);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setTheme = useAppStore((s) => s.setTheme);
  const [showNotif, setShowNotif] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="glass-panel flex items-center justify-between rounded-2xl px-4 py-3">
      <Link
        href="/landing"
        className="font-[family-name:var(--font-orbitron)] text-sm font-bold neon-text"
      >
        SENTINOX OS
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs outline-none focus:border-cyan-400/40"
          aria-label="Select language"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-cyan-300"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotif(!showNotif)}
            className="relative rounded-lg border border-white/10 p-2 text-slate-400 hover:text-cyan-300"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] text-white">
                {unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 top-full z-50 mt-2 w-64 glass-panel rounded-xl p-3"
              >
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500">No notifications</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <p key={n.id} className="border-b border-white/5 py-2 text-xs last:border-0">
                      <strong className="text-cyan-300">{n.title}</strong>
                      <br />
                      <span className="text-slate-400">{n.message}</span>
                    </p>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-cyan-300"
          aria-label="Health profile settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
