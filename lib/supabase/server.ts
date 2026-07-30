import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl || !supabaseKey || rawUrl.includes("your-project") || !rawUrl.startsWith("http")) {
    return null;
  }

  // Clean trailing slash to prevent PGRST125 invalid path error
  const supabaseUrl = rawUrl.trim().replace(/\/+$/, "");

  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn("Supabase server client initialization skipped:", err);
    return null;
  }
}
