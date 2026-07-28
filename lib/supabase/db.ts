import { getSupabaseServerClient } from "./server";
import { AgentState } from "../agent/state";

export interface SessionRecord {
  id: string;
  created_at: string;
  raw_input: string;
  patient_name: string;
  triage_level: "HIGH" | "MEDIUM" | "LOW";
  soap_note: any;
  follow_up: any;
  triage_flags: any;
}

export async function saveClinicalSession(state: AgentState): Promise<SessionRecord | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  if (!state.soapNote || !state.followUp || !state.triageResult) {
    return null;
  }

  try {
    const payload = {
      raw_input: state.rawInput,
      patient_name: state.patientData?.patient_name ?? "Anonymous Patient",
      triage_level: state.triageResult.triage_level,
      soap_note: state.soapNote,
      follow_up: state.followUp,
      triage_flags: state.triageResult.flags ?? [],
    };

    const { data, error } = await supabase
      .from("sessions")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert session error:", error);
      return null;
    }

    return data as SessionRecord;
  } catch (err) {
    console.error("Error saving clinical session to Supabase:", err);
    return null;
  }
}

export async function fetchClinicalSessions(limit = 20): Promise<SessionRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase fetch sessions error:", error);
      return [];
    }

    return (data as SessionRecord[]) ?? [];
  } catch (err) {
    console.error("Error fetching clinical sessions:", err);
    return [];
  }
}

export async function fetchSessionById(id: string): Promise<SessionRecord | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as SessionRecord;
  } catch (err) {
    console.error("Error fetching session by id:", err);
    return null;
  }
}
