"use client";

import { MeshBackground } from "@/components/effects/MeshBackground";
import { ParticleField } from "@/components/effects/ParticleField";
import { AnalysisPanel } from "@/components/workspace/AnalysisPanel";
import { AssistantHologram } from "@/components/workspace/AssistantHologram";
import { InputPanel } from "@/components/workspace/InputPanel";
import { SentinoxMoonChat } from "@/components/ui/sentinox-moon-chat";
import { useAnalyze } from "@/hooks/useAnalyze";
import { useI18n } from "@/hooks/useI18n";
import { useSpeech } from "@/hooks/useSpeech";
import { LANGUAGES } from "@/lib/constants";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useAppStore } from "@/stores/app-store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  History,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

export function WorkspaceShell() {
  const [activeMethod, setActiveMethod] = useState("text");
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const language = useAppStore((s) => s.language);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const assistantState = useAppStore((s) => s.assistantState);
  const setAssistantState = useAppStore((s) => s.setAssistantState);
  const notifications = useAppStore((s) => s.notifications);
  const savedProducts = useAppStore((s) => s.savedProducts);
  const history = useAnalysisStore((s) => s.history);
  const addToHistory = useAnalysisStore((s) => s.addToHistory);
  const currentAnalysis = useAnalysisStore((s) => s.currentAnalysis);
  const setCurrentAnalysis = useAnalysisStore((s) => s.setCurrentAnalysis);
  const isScanning = useAnalysisStore((s) => s.isScanning);
  const scanProgress = useAnalysisStore((s) => s.scanProgress);
  const setIsScanning = useAnalysisStore((s) => s.setIsScanning);
  const setScanProgress = useAnalysisStore((s) => s.setScanProgress);
  const addSavedProduct = useAppStore((s) => s.addSavedProduct);
  const addNotification = useAppStore((s) => s.addNotification);
  const healthProfile = useAppStore((s) => s.healthProfile);
  const updateHealthProfile = useAppStore((s) => s.updateHealthProfile);

  const { t } = useI18n();
  const { mutateAsync } = useAnalyze();
  const { speak } = useSpeech();

  const runScan = useCallback(
    async (input: string, imageHint?: string) => {
      if (!input.trim() && !imageHint) return;
      setIsScanning(true);
      setScanProgress(0);
      setAssistantState("thinking");

      let progress = 0;
      const progressInterval = setInterval(() => {
        progress = Math.min(progress + 12, 95);
        setScanProgress(progress);
      }, 200);

      try {
        const analysis = await mutateAsync({ input, language, imageHint });
        setScanProgress(100);
        setCurrentAnalysis(analysis);
        addToHistory(analysis);
        addSavedProduct({
          id: analysis.id,
          name: analysis.productName,
          category: analysis.category,
          scannedAt: analysis.scannedAt,
          analysisId: analysis.id,
        });
        addNotification({
          title: t("scanComplete"),
          message: analysis.productName,
        });
        setAssistantState("speaking");
        setTimeout(() => setAssistantState("idle"), 3000);
      } catch {
        addNotification({
          title: t("scanFailed"),
          message: t("analysisEmpty"),
        });
        setAssistantState("idle");
      } finally {
        clearInterval(progressInterval);
        setIsScanning(false);
      }
    },
    [
      language,
      mutateAsync,
      setCurrentAnalysis,
      addToHistory,
      addSavedProduct,
      addNotification,
      setAssistantState,
      setIsScanning,
      setScanProgress,
      t,
    ]
  );

  const handleSpeak = () => {
    if (!currentAnalysis) return;
    setAssistantState("speaking");
    speak(currentAnalysis.simplifiedExplanation, language);
    setTimeout(() => setAssistantState("idle"), 5000);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative min-h-screen mesh-gradient">
      <MeshBackground />
      <ParticleField count={40} />

      <header className="relative z-20 flex items-center justify-between border-b border-white/10 px-4 py-3 backdrop-blur-md">
        <Link
          href="/landing"
          className="font-[family-name:var(--font-orbitron)] text-lg font-bold neon-text"
        >
          SENTINOX OS
        </Link>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs outline-none"
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
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-cyan-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="rounded-lg p-2 text-slate-400 hover:text-cyan-300"
            aria-label="History"
          >
            <History className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-400 hover:text-cyan-300"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] text-black">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-lg p-2 text-slate-400 hover:text-cyan-300"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          <Link href="/auth" className="rounded-lg p-2 text-slate-400 hover:text-cyan-300">
            <User className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-panel absolute right-4 top-16 z-30 w-72 rounded-xl p-4"
          >
            <h3 className="mb-2 text-sm font-semibold text-cyan-400">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500">No notifications</p>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="mb-2 border-b border-white/5 pb-2 text-xs">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-slate-500">{n.message}</p>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="glass-panel absolute left-4 top-16 z-30 w-64 rounded-xl p-4"
          >
            <h3 className="mb-2 text-sm font-semibold text-cyan-400">Scan Timeline</h3>
            {history.length === 0 && savedProducts.length === 0 ? (
              <p className="text-xs text-slate-500">No scans yet</p>
            ) : (
              (history.length ? history : savedProducts.map((s) => ({ productName: s.name, scannedAt: s.scannedAt, id: s.id }))).slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="mb-2 block w-full rounded-lg bg-white/5 p-2 text-left text-xs hover:bg-cyan-500/10"
                  onClick={() => "productName" in item && setCurrentAnalysis(history.find((h) => h.id === item.id) ?? null)}
                >
                  {"productName" in item ? item.productName : ""}
                  <span className="block text-slate-500">
                    {new Date(item.scannedAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel absolute right-4 top-16 z-30 w-80 rounded-xl p-4"
          >
            <h3 className="mb-3 text-sm font-semibold text-cyan-400">Health Profile</h3>
            {(["allergies", "conditions", "medications", "dietaryRestrictions"] as const).map(
              (field) => (
                <label key={field} className="mb-2 block text-xs">
                  <span className="capitalize text-slate-400">{field}</span>
                  <input
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm"
                    value={healthProfile[field].join(", ")}
                    onChange={(e) =>
                      updateHealthProfile({
                        [field]: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Comma separated"
                  />
                </label>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-57px)] max-w-[1600px] gap-4 p-4 lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)_minmax(300px,360px)] lg:items-stretch">
        <aside className="flex min-h-[420px] flex-col lg:min-h-0">
          <InputPanel
            activeMethod={activeMethod}
            onMethodChange={setActiveMethod}
            onScan={runScan}
          />
        </aside>

        <main className="flex min-h-[480px] flex-col gap-4 lg:min-h-0">
          <div className="glass-panel relative flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-2xl p-4">
            <h2 className="mb-2 text-center font-[family-name:var(--font-orbitron)] text-xs tracking-[0.3em] text-cyan-400/80">
              {t("sentinoxCore")}
            </h2>
            <AssistantHologram state={assistantState} className="flex-1" />
            {isScanning && (
              <div className="absolute bottom-4 left-1/2 w-48 -translate-x-1/2">
                <motion.div className="h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                    style={{ width: `${scanProgress}%` }}
                  />
                </motion.div>
              </div>
            )}
          </div>
          <SentinoxMoonChat
            onSend={(text) => {
              useAnalysisStore.getState().setInputText(text);
              void runScan(text);
            }}
            isScanning={isScanning}
          />
        </main>

        <aside className="flex min-h-[420px] flex-col lg:min-h-0">
          <AnalysisPanel
            analysis={currentAnalysis}
            isScanning={isScanning}
            scanProgress={scanProgress}
            onSpeak={handleSpeak}
          />
        </aside>
      </div>
    </div>
  );
}
