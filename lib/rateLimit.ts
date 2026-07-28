import { getSupabaseServerClient } from "./supabase/server";

export const DAILY_LIMITS = {
  agent: 50,         // 50 agent runs/day
  transcribe: 30,    // 30 audio transcriptions/day
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  count: number;
  message?: string;
}

// In-memory fallback counter for local development if Supabase env vars are not set
const memoryCounter = {
  date: new Date().toISOString().split("T")[0],
  agent: 0,
  transcribe: 0,
};

export async function checkAndIncrementLimit(type: "agent" | "transcribe"): Promise<RateLimitResult> {
  const limit = DAILY_LIMITS[type];
  const today = new Date().toISOString().split("T")[0];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Fallback to in-memory if Supabase is not yet connected
  if (!supabaseUrl || supabaseUrl.includes("your-project")) {
    if (memoryCounter.date !== today) {
      memoryCounter.date = today;
      memoryCounter.agent = 0;
      memoryCounter.transcribe = 0;
    }

    if (memoryCounter[type] >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        count: memoryCounter[type],
        message: `Daily ${type} limit reached (${limit}/day). Please try again tomorrow.`,
      };
    }

    memoryCounter[type] += 1;
    return {
      allowed: true,
      remaining: limit - memoryCounter[type],
      limit,
      count: memoryCounter[type],
    };
  }

  try {
    const supabase = getSupabaseServerClient();

    // 1. Fetch current today's usage row
    const { data: usageRow, error: fetchErr } = await supabase
      .from("usage_logs")
      .select("*")
      .eq("date", today)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.error("Rate limit fetch error:", fetchErr);
    }

    const currentCount = usageRow ? (type === "agent" ? usageRow.agent_runs : usageRow.transcriptions) : 0;

    if (currentCount >= limit) {
      return {
        allowed: false,
        remaining: 0,
        limit,
        count: currentCount,
        message: `Daily demo limit reached for ${type} operations (${limit}/${type}s per day). Protects API quotas.`,
      };
    }

    // 2. Increment count via UPSERT
    const newAgentCount = type === "agent" ? currentCount + 1 : (usageRow?.agent_runs ?? 0);
    const newTranscribeCount = type === "transcribe" ? currentCount + 1 : (usageRow?.transcriptions ?? 0);

    const { error: upsertErr } = await supabase
      .from("usage_logs")
      .upsert(
        {
          date: today,
          agent_runs: newAgentCount,
          transcriptions: newTranscribeCount,
        },
        { onConflict: "date" }
      );

    if (upsertErr) {
      console.error("Rate limit upsert error:", upsertErr);
    }

    return {
      allowed: true,
      remaining: limit - (currentCount + 1),
      limit,
      count: currentCount + 1,
    };
  } catch (err) {
    console.error("Error checking rate limit:", err);
    // Fail-open for smooth demo UX if DB has temporary issue
    return {
      allowed: true,
      remaining: limit,
      limit,
      count: 0,
    };
  }
}

export async function getTodayUsageStats(): Promise<{ agentRuns: number; transcriptions: number; agentLimit: number; transcribeLimit: number }> {
  const today = new Date().toISOString().split("T")[0];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl || supabaseUrl.includes("your-project")) {
    return {
      agentRuns: memoryCounter.agent,
      transcriptions: memoryCounter.transcribe,
      agentLimit: DAILY_LIMITS.agent,
      transcribeLimit: DAILY_LIMITS.transcribe,
    };
  }

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("usage_logs")
      .select("*")
      .eq("date", today)
      .maybeSingle();

    return {
      agentRuns: data?.agent_runs ?? 0,
      transcriptions: data?.transcriptions ?? 0,
      agentLimit: DAILY_LIMITS.agent,
      transcribeLimit: DAILY_LIMITS.transcribe,
    };
  } catch (err) {
    return {
      agentRuns: 0,
      transcriptions: 0,
      agentLimit: DAILY_LIMITS.agent,
      transcribeLimit: DAILY_LIMITS.transcribe,
    };
  }
}
