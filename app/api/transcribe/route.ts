import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { checkAndIncrementLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limit check
    const rateCheck = await checkAndIncrementLimit("transcribe");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.message ?? "Daily transcription limit reached." },
        { status: 429 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    
    // Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Audio file is required in FormData field 'file'." },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Audio file exceeds maximum allowed upload size of 25MB." },
        { status: 400 }
      );
    }

    // Fallback message if Groq API key is missing
    if (!groqApiKey) {
      return NextResponse.json({
        text: "[Demo Mode]: Patient is a 45-year-old male presenting with chest pain and shortness of breath since yesterday. Blood pressure 145/90 mmHg, heart rate 92 bpm.",
        isDemo: true,
      });
    }

    const groq = new Groq({ apiKey: groqApiKey });

    // Send audio file to Groq Whisper (whisper-large-v3)
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3",
      prompt: "Medical clinic patient intake dictation with vitals and clinical symptoms.",
      temperature: 0.0,
    });

    return NextResponse.json({
      text: transcription.text,
      isDemo: false,
      rateLimitRemaining: rateCheck.remaining,
    });
  } catch (err: any) {
    console.error("Error in /api/transcribe route:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to transcribe audio." },
      { status: 500 }
    );
  }
}
