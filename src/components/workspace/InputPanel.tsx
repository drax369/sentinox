"use client";

import { GlassPanel } from "@/components/ui/GlassPanel";
import { useVoiceCapture } from "@/hooks/useVoiceCapture";
import { useAnalysisStore } from "@/stores/analysis-store";
import { useAppStore } from "@/stores/app-store";
import { getSpeechRecognitionLocale } from "@/lib/languages";
import { useI18n } from "@/hooks/useI18n";
import { motion } from "framer-motion";
import {
  Camera,
  ImageIcon,
  Mic,
  MicOff,
  Type,
  Upload,
} from "lucide-react";
import { useCallback, useRef, useState, type DragEvent } from "react";

const METHOD_IDS = [
  { id: "text" as const, icon: Type, labelKey: "methodText" as const },
  { id: "voice" as const, icon: Mic, labelKey: "methodVoice" as const },
  { id: "camera" as const, icon: Camera, labelKey: "methodCamera" as const },
  { id: "gallery" as const, icon: ImageIcon, labelKey: "methodGallery" as const },
];

interface InputPanelProps {
  activeMethod: string;
  onMethodChange: (m: string) => void;
  onScan: (input: string, imageHint?: string) => void;
}

export function InputPanel({ activeMethod, onMethodChange, onScan }: InputPanelProps) {
  const { t } = useI18n();
  const inputText = useAnalysisStore((s) => s.inputText);
  const setInputText = useAnalysisStore((s) => s.setInputText);
  const isScanning = useAnalysisStore((s) => s.isScanning);
  const language = useAppStore((s) => s.language);
  const setAssistantState = useAppStore((s) => s.setAssistantState);
  const {
    isListening,
    transcript,
    finalTranscript,
    error: voiceError,
    startListening,
    stopListening,
    setFinalTranscript,
  } = useVoiceCapture(language);
  const [voiceCaptured, setVoiceCaptured] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const speechLocale = getSpeechRecognitionLocale(language);
  const textPlaceholder = t("inputPlaceholder");

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        setInputText(`Uploaded: ${file.name}`);
        onScan(`Product from file: ${file.name}`, file.name);
      }
    },
    [onScan, setInputText]
  );

  const handleFile = (files: FileList | null, hint: string) => {
    const file = files?.[0];
    if (!file) return;
    setInputText(`Uploaded: ${file.name}`);
    onScan(`Product from ${hint}: ${file.name}`, file.name);
  };

  const toggleVoice = async () => {
    if (isListening) {
      const text = stopListening();
      setAssistantState("idle");
      if (text) {
        setVoiceCaptured(true);
        setInputText(text);
      }
    } else {
      setVoiceCaptured(false);
      setFinalTranscript("");
      setAssistantState("listening");
      await startListening(speechLocale);
    }
  };

  const confirmVoiceScan = () => {
    const text = finalTranscript || transcript;
    if (text) onScan(text);
    setVoiceCaptured(false);
  };

  return (
    <GlassPanel className="flex h-full flex-col p-4 lg:p-5" glow="cyan">
      <h2 className="mb-4 font-[family-name:var(--font-orbitron)] text-sm font-semibold tracking-wider text-cyan-400">
        {t("inputMatrix")}
      </h2>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
        {METHOD_IDS.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            type="button"
            onClick={() => onMethodChange(id)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition ${
              activeMethod === id
                ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 text-slate-400 hover:border-cyan-400/20"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(labelKey)}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {activeMethod === "text" && (
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={textPlaceholder}
            className="min-h-[140px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-relaxed outline-none focus:border-cyan-400/40"
            aria-label="Product text input"
          />
        )}

        {activeMethod === "voice" && (
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col items-center justify-center py-4">
              <motion.button
                type="button"
                onClick={toggleVoice}
                className={`flex h-20 w-20 items-center justify-center rounded-full border-2 ${
                  isListening
                    ? "border-purple-400 bg-purple-500/20 pulse-ring"
                    : "border-cyan-400/50 bg-cyan-500/10"
                }`}
                whileTap={{ scale: 0.95 }}
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="h-8 w-8 text-purple-400" />
                ) : (
                  <Mic className="h-8 w-8 text-cyan-400" />
                )}
              </motion.button>
              <p className="mt-3 text-center text-xs text-slate-400">
                {isListening
                  ? `${t("listening")} (${speechLocale})…`
                  : t("tapToSpeak")}
              </p>
              {voiceError && !finalTranscript && !transcript && (
                <p className="mt-2 max-w-xs text-center text-xs text-red-400">{voiceError}</p>
              )}
              <p className="mt-1 text-center text-[10px] text-slate-500">
                {t("voiceHint")}
              </p>
            </div>

            {(isListening || voiceCaptured || transcript) && (
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3">
                <p className="mb-1 text-[10px] font-semibold tracking-wider text-cyan-400 uppercase">
                  {isListening ? t("liveTranscript") : t("youSaid")}
                </p>
                <p className="max-h-32 overflow-y-auto text-sm leading-relaxed text-slate-200">
                  {isListening ? transcript || "…" : finalTranscript || transcript}
                </p>
              </div>
            )}

            {voiceCaptured && !isListening && (finalTranscript || transcript) && (
              <button
                type="button"
                onClick={confirmVoiceScan}
                disabled={isScanning}
                className="w-full rounded-xl bg-gradient-to-r from-purple-500/30 to-cyan-500/30 py-2.5 text-sm font-medium text-cyan-100"
              >
                {t("analyzeVoice")}
              </button>
            )}
          </div>
        )}

        {(activeMethod === "camera" || activeMethod === "gallery") && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture={activeMethod === "camera" ? "environment" : undefined}
              className="hidden"
              onChange={(e) => handleFile(e.target.files, activeMethod)}
            />
            <button
              type="button"
              onClick={() =>
                (activeMethod === "camera" ? cameraRef : fileRef).current?.click()
              }
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-cyan-400/30 p-8 transition hover:bg-cyan-500/5"
            >
              <Camera className="h-10 w-10 text-cyan-400/60" />
              <span className="text-sm text-slate-400">
                {activeMethod === "camera" ? t("openCamera") : t("chooseGallery")}
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files, "gallery")}
            />
          </div>
        )}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="mt-4 shrink-0 rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-slate-500 transition hover:border-cyan-400/30"
      >
        <Upload className="mx-auto mb-1 h-5 w-5 text-cyan-400/50" />
        {t("dragDrop")}
      </div>

      {activeMethod === "text" && (
        <button
          type="button"
          disabled={isScanning || !inputText.trim()}
          onClick={() => onScan(inputText)}
          className="mt-4 w-full shrink-0 rounded-xl bg-gradient-to-r from-cyan-500/30 to-purple-500/30 py-3 text-sm font-medium text-cyan-100 transition hover:shadow-[var(--glow-cyan)] disabled:opacity-40"
        >
          {isScanning ? t("analyzing") : t("runScan")}
        </button>
      )}
    </GlassPanel>
  );
}
