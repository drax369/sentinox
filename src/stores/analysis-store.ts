import { create } from "zustand";
import type { ProductAnalysis } from "@/types";

interface AnalysisState {
  currentAnalysis: ProductAnalysis | null;
  history: ProductAnalysis[];
  isScanning: boolean;
  scanProgress: number;
  inputText: string;
  setCurrentAnalysis: (a: ProductAnalysis | null) => void;
  addToHistory: (a: ProductAnalysis) => void;
  setIsScanning: (v: boolean) => void;
  setScanProgress: (p: number) => void;
  setInputText: (t: string) => void;
  clearAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  history: [],
  isScanning: false,
  scanProgress: 0,
  inputText: "",
  setCurrentAnalysis: (currentAnalysis) => set({ currentAnalysis }),
  addToHistory: (a) =>
    set((s) => ({ history: [a, ...s.history].slice(0, 20) })),
  setIsScanning: (isScanning) => set({ isScanning }),
  setScanProgress: (scanProgress) => set({ scanProgress }),
  setInputText: (inputText) => set({ inputText }),
  clearAnalysis: () => set({ currentAnalysis: null, scanProgress: 0 }),
}));
