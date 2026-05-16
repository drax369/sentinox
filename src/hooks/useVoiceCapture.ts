"use client";

import { t, type UiKey } from "@/lib/i18n";
import { useCallback, useRef, useState } from "react";

type SpeechErrorCode =
  | "aborted"
  | "audio-capture"
  | "language-not-supported"
  | "network"
  | "no-speech"
  | "not-allowed"
  | "service-not-allowed"
  | string;

function voiceErrorKey(code: SpeechErrorCode): UiKey | null {
  switch (code) {
    case "aborted":
      return null;
    case "no-speech":
      return "voiceNoSpeech";
    case "not-allowed":
    case "service-not-allowed":
      return "voiceMicBlocked";
    case "audio-capture":
      return "voiceAudioCapture";
    case "network":
      return "voiceNetwork";
    default:
      return "voiceFailed";
  }
}

export function useVoiceCapture(language = "en") {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const finalRef = useRef("");
  const listeningRef = useRef(false);
  const restartCountRef = useRef(0);

  const cleanup = useCallback(() => {
    try {
      recognitionRef.current?.abort();
    } catch {
      recognitionRef.current?.stop();
    }
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    listeningRef.current = false;
  }, []);

  const attachRecognition = useCallback(
    (recognition: SpeechRecognition) => {
      recognition.onresult = (event) => {
        let interim = "";
        let final = finalRef.current;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += chunk;
          } else {
            interim += chunk;
          }
        }
        finalRef.current = final;
        setFinalTranscript(final.trim());
        setTranscript((final + interim).trim());
        if (final || interim) setError(null);
      };

      recognition.onerror = (ev) => {
        const code = (ev as SpeechRecognitionErrorEvent).error as SpeechErrorCode;
        const hasText = Boolean(finalRef.current.trim());

        if (code === "aborted") return;

        // Chrome often emits these when pausing or restarting — not a real failure if we got text
        if (code === "network" || code === "no-speech") {
          if (hasText) {
            setError(null);
            return;
          }
          if (listeningRef.current) return;
          const softKey = voiceErrorKey(code);
          if (softKey) setError(t(softKey, language));
          return;
        }

        const errKey = voiceErrorKey(code);
        if (errKey) setError(t(errKey, language));
        listeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        const text = finalRef.current.trim();
        setFinalTranscript(text);
        setTranscript(text);
        if (text) setError(null);

        // Chrome stops after silence; restart while user still has mic "on"
        if (listeningRef.current && restartCountRef.current < 8) {
          restartCountRef.current += 1;
          window.setTimeout(() => {
            if (!listeningRef.current || !recognitionRef.current) return;
            try {
              recognitionRef.current.start();
            } catch {
              /* already started */
            }
          }, 120);
          return;
        }

        listeningRef.current = false;
        setIsListening(false);
        if (text) setError(null);
      };
    },
    [language]
  );

  const startListening = useCallback(
    async (lang = "en-US") => {
      setError(null);
      setTranscript("");
      setFinalTranscript("");
      finalRef.current = "";
      restartCountRef.current = 0;
      cleanup();

      if (typeof window === "undefined") return;

      const SpeechRecognitionCtor =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionCtor) {
        setError(t("voiceChromeOnly", language));
        return;
      }

      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setError(t("voiceMicDenied", language));
        return;
      }

      const tryLocales = [lang, "hi-IN", "en-IN", "en-US"].filter(
        (l, i, arr) => arr.indexOf(l) === i
      );

      for (const locale of tryLocales) {
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = locale;

        attachRecognition(recognition);
        recognitionRef.current = recognition;

        try {
          recognition.start();
          listeningRef.current = true;
          setIsListening(true);
          setActiveLocale(locale);
          if (locale !== lang) {
            setError(t("voiceFallbackNotice", language));
          }
          return;
        } catch {
          recognitionRef.current = null;
        }
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError(t("voiceCouldNotStart", language));
    },
    [attachRecognition, cleanup, language]
  );

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    restartCountRef.current = 0;
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsListening(false);

    const text = finalRef.current.trim() || transcript.trim();
    setFinalTranscript(text);
    setTranscript(text);
    if (text) setError(null);
    return text;
  }, [transcript]);

  return {
    isListening,
    transcript,
    finalTranscript,
    error,
    activeLocale,
    startListening,
    stopListening,
    setTranscript,
    setFinalTranscript,
  };
}
