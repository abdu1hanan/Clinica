import { NextRequest, NextResponse } from "next/server";
import { clinicaAgentGraph } from "@/lib/agent/graph";
import { saveClinicalSession } from "@/lib/supabase/db";
import { checkAndIncrementLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const rateCheck = await checkAndIncrementLimit("agent");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.message ?? "Daily quota limit reached." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { rawInput } = body;

    if (!rawInput || typeof rawInput !== "string" || !rawInput.trim()) {
      return NextResponse.json(
        { error: "Field 'rawInput' is required and cannot be empty." },
        { status: 400 }
      );
    }

    const finalState = await clinicaAgentGraph.invoke({
      rawInput: rawInput.trim(),
    });

    const savedRecord = await saveClinicalSession(finalState);

    return NextResponse.json({
      success: true,
      sessionId: savedRecord?.id ?? null,
      cleanedTranscript: finalState.cleanedTranscript || rawInput.trim(),
      patientData: finalState.patientData,
      triageResult: finalState.triageResult,
      soapNote: finalState.soapNote,
      followUp: finalState.followUp,
      rateLimitRemaining: rateCheck.remaining,
    });
  } catch (err: any) {
    console.error("Error in /api/agent route:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during pipeline processing." },
      { status: 500 }
    );
  }
}
