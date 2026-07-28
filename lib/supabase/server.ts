import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project") || !supabaseUrl.startsWith("http")) {
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn("Supabase server client initialization skipped:", err);
    return null;
  }
}
