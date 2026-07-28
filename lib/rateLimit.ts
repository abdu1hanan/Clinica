import { getSupabaseServerClient } from "./supabase/server";

export const DAILY_LIMITS = {
  agent: 50,
  transcribe: 30,
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  count: number;
  message?: string;
}

const memoryCounter = {
  date: new Date().toISOString().split("T")[0],
  agent: 0,
  transcribe: 0,
};

export async function checkAndIncrementLimit(type: "agent" | "transcribe"): Promise<RateLimitResult> {
  const limit = DAILY_LIMITS[type];
  const today = new Date().toISOString().split("T")[0];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("your-project") &&
    supabaseUrl.startsWith("http");

  if (!isSupabaseConfigured) {
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
        message: `Daily ${type} operation limit reached (${limit}/day). Try again tomorrow.`,
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
    if (!supabase) {
      memoryCounter[type] += 1;
      return {
        allowed: true,
        remaining: limit - memoryCounter[type],
        limit,
        count: memoryCounter[type],
      };
    }

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
        message: `Daily demo quota limit reached for ${type} operations (${limit}/${type}s per day).`,
      };
    }

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

  const isSupabaseConfigured =
    supabaseUrl &&
    !supabaseUrl.includes("your-project") &&
    supabaseUrl.startsWith("http");

  if (!isSupabaseConfigured) {
    return {
      agentRuns: memoryCounter.agent,
      transcriptions: memoryCounter.transcribe,
      agentLimit: DAILY_LIMITS.agent,
      transcribeLimit: DAILY_LIMITS.transcribe,
    };
  }

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return {
        agentRuns: memoryCounter.agent,
        transcriptions: memoryCounter.transcribe,
        agentLimit: DAILY_LIMITS.agent,
        transcribeLimit: DAILY_LIMITS.transcribe,
      };
    }

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
