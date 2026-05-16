"use client";

import { useMutation } from "@tanstack/react-query";
import type { ProductAnalysis } from "@/types";

interface AnalyzeParams {
  input: string;
  language: string;
  imageHint?: string;
}

async function analyzeProduct(params: AnalyzeParams): Promise<ProductAnalysis> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Analysis failed");
  const data = await res.json();
  return data.analysis;
}

export function useAnalyze() {
  return useMutation({
    mutationFn: analyzeProduct,
  });
}
