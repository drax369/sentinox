"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";
import {
  ArrowUpIcon,
  Paperclip,
  Shield,
  Pill,
  Apple,
  AlertTriangle,
} from "lucide-react";

function useAutoResizeTextarea(minHeight: number, maxHeight: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      textarea.style.height = `${Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight))}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface SentinoxMoonChatProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  isScanning?: boolean;
  className?: string;
}

export function SentinoxMoonChat({
  onSend,
  disabled,
  isScanning,
  className,
}: SentinoxMoonChatProps) {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea(48, 120);

  const submit = () => {
    const text = message.trim();
    if (!text || disabled || isScanning) return;
    onSend(text);
    setMessage("");
    adjustHeight(true);
  };

  const placeholder = t("inputPlaceholder");

  return (
    <div className={cn("w-full", className)}>
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            adjustHeight();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          disabled={disabled || isScanning}
          className="min-h-[48px] w-full resize-none border-none bg-transparent px-4 py-3 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500"
          style={{ overflow: "hidden" }}
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <Button variant="ghost" size="icon" type="button" className="text-slate-400" disabled>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!message.trim() || disabled || isScanning}
            onClick={submit}
            className="gap-1 rounded-lg bg-cyan-500/20 px-3 text-cyan-200 hover:bg-cyan-500/30"
          >
            <ArrowUpIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <QuickAction icon={<Pill className="h-3.5 w-3.5" />} label={t("quickMedicine")} onPick={t("quickPickMedicine")} setMessage={setMessage} />
        <QuickAction icon={<Apple className="h-3.5 w-3.5" />} label={t("quickFood")} onPick={t("quickPickFood")} setMessage={setMessage} />
        <QuickAction icon={<Shield className="h-3.5 w-3.5" />} label={t("quickSupplement")} onPick={t("quickPickSupplement")} setMessage={setMessage} />
        <QuickAction icon={<AlertTriangle className="h-3.5 w-3.5" />} label={t("quickAllergies")} onPick={t("quickPickAllergies")} setMessage={setMessage} />
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onPick,
  setMessage,
}: {
  icon: React.ReactNode;
  label: string;
  onPick: string;
  setMessage: (v: string) => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setMessage(onPick)}
      className="gap-1.5 rounded-full border-white/10 bg-black/30 text-xs text-slate-300 hover:bg-white/10 hover:text-white"
    >
      {icon}
      {label}
    </Button>
  );
}
