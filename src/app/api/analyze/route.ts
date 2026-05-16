import { NextRequest, NextResponse } from "next/server";
import { generateMockAnalysis } from "@/lib/mock-analysis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input = "", language = "en", imageHint } = body as {
      input?: string;
      language?: string;
      imageHint?: string;
    };

    const combinedInput = [input, imageHint].filter(Boolean).join(" ");
    if (!combinedInput.trim()) {
      return NextResponse.json(
        { error: "No product data provided" },
        { status: 400 }
      );
    }

    await new Promise((r) => setTimeout(r, 1800));

    const analysis = generateMockAnalysis(combinedInput, language);
    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
