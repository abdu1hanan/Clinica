import { createClient, SupabaseClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured =
  rawUrl &&
  supabaseAnonKey &&
  !rawUrl.includes("your-project") &&
  rawUrl.startsWith("http");

const cleanUrl = rawUrl ? rawUrl.trim().replace(/\/+$/, "") : "";

declare global {
  var __supabaseBrowserClient: SupabaseClient | undefined;
}

function getBrowserSupabaseClient(): SupabaseClient | null {
  if (!isConfigured) return null;

  if (typeof window !== "undefined") {
    if (!globalThis.__supabaseBrowserClient) {
      globalThis.__supabaseBrowserClient = createClient(cleanUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });
    }
    return globalThis.__supabaseBrowserClient;
  }

  return createClient(cleanUrl, supabaseAnonKey, { auth: { persistSession: false } });
}

export const supabaseClient = getBrowserSupabaseClient();
