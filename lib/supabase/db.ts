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
      differentials: state.differentialDiagnoses ?? [],
      icd10: state.icd10Suggestions ?? [],
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
