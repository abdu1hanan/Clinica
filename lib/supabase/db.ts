import { getSupabaseServerClient } from "./server";
import { AgentState, DifferentialDiagnosis, ICD10Suggestion } from "../agent/state";

export interface SessionRecord {
  id: string;
  created_at: string;
  raw_input: string;
  patient_name: string;
  triage_level: "HIGH" | "MEDIUM" | "LOW";
  soap_note: any;
  follow_up: any;
  triage_flags: any;
  differentials?: DifferentialDiagnosis[] | null;
  icd10?: ICD10Suggestion[] | null;
}

export interface PatientCustomNote {
  id: string;
  created_at: string;
  patient_name: string;
  note_type: string;
  content: string;
}

export async function saveClinicalSession(state: AgentState): Promise<SessionRecord | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    console.warn("[Supabase Persistence] Supabase client is not configured or missing environment variables.");
    return null;
  }

  if (!state.soapNote || !state.followUp || !state.triageResult) {
    console.warn("[Supabase Persistence] Incomplete state: soapNote, followUp, or triageResult missing.");
    return null;
  }

  const patientName = (state.patientData?.patient_name && state.patientData.patient_name !== "Anonymous Patient")
    ? state.patientData.patient_name
    : "Patient Encounter";

  const corePayload = {
    raw_input: state.rawInput,
    patient_name: patientName,
    triage_level: state.triageResult.triage_level,
    soap_note: state.soapNote,
    follow_up: state.followUp,
    triage_flags: state.triageResult.flags ?? [],
  };

  const extendedPayload = {
    ...corePayload,
    differentials: state.differentialDiagnoses ?? [],
    icd10: state.icd10Suggestions ?? [],
  };

  try {
    // Attempt 1: Extended insert with differentials & icd10
    const { data: extData, error: extError } = await supabase
      .from("sessions")
      .insert(extendedPayload)
      .select()
      .single();

    if (!extError && extData) {
      console.log("[Supabase Persistence] Successfully saved session with extended columns:", extData.id);
      return extData as SessionRecord;
    }

    // Attempt 2: Fallback to core columns if extended columns don't exist yet in Supabase table
    console.warn("[Supabase Persistence] Extended insert failed, attempting core payload insert:", extError?.message);

    const { data: coreData, error: coreError } = await supabase
      .from("sessions")
      .insert(corePayload)
      .select()
      .single();

    if (coreError) {
      console.error("[Supabase Persistence] Core payload insert error:", coreError);
      return null;
    }

    console.log("[Supabase Persistence] Successfully saved session with core columns:", coreData.id);
    return {
      ...coreData,
      differentials: state.differentialDiagnoses ?? [],
      icd10: state.icd10Suggestions ?? [],
    } as SessionRecord;
  } catch (err) {
    console.error("[Supabase Persistence] Unexpected exception during insert:", err);
    return null;
  }
}

export async function fetchClinicalSessions(limit = 25): Promise<SessionRecord[]> {
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
      console.error("[Supabase Fetch] Error fetching sessions:", error);
      return [];
    }

    return (data as SessionRecord[]) ?? [];
  } catch (err) {
    console.error("[Supabase Fetch] Unexpected exception:", err);
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

export async function savePatientCustomNote(
  patientName: string,
  noteType: string,
  content: string
): Promise<PatientCustomNote | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("patient_notes")
      .insert({
        patient_name: patientName,
        note_type: noteType,
        content: content,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert patient note error:", error);
      return null;
    }

    return data as PatientCustomNote;
  } catch (err) {
    console.error("Error saving patient note:", err);
    return null;
  }
}

export async function fetchPatientCustomNotes(patientName?: string): Promise<PatientCustomNote[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  try {
    let query = supabase.from("patient_notes").select("*").order("created_at", { ascending: false });
    if (patientName && patientName !== "All Patients") {
      query = query.eq("patient_name", patientName);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Supabase fetch patient notes error:", error);
      return [];
    }
    return (data as PatientCustomNote[]) ?? [];
  } catch (err) {
    console.error("Error fetching patient notes:", err);
    return [];
  }
}
