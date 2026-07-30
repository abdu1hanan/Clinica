import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isConfigured =
  rawUrl &&
  supabaseAnonKey &&
  !rawUrl.includes("your-project") &&
  rawUrl.startsWith("http");

const cleanUrl = rawUrl ? rawUrl.trim().replace(/\/+$/, "") : "";

export const supabaseClient = isConfigured
  ? createClient(cleanUrl, supabaseAnonKey)
  : null;
