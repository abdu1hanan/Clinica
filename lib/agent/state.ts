import { z } from "zod";
import { Annotation } from "@langchain/langgraph";

// ─── Patient Data ─────────────────────────────────────────────────────────────
export const PatientDataSchema = z.object({
  patient_name: z.string().default("Anonymous Patient"),
  age: z.number().nullable().optional(),
  gender: z.string().nullable().optional(),
  vitals: z.object({
    blood_pressure: z.string().nullable().optional(),
    heart_rate: z.string().nullable().optional(),
    temperature: z.string().nullable().optional(),
    respiratory_rate: z.string().nullable().optional(),
    oxygen_saturation: z.string().nullable().optional(),
    vitals_summary: z.string().nullable().optional(),
  }).default({}),
  chief_complaint: z.string().default("Unspecified symptoms"),
  hpi: z.string().nullable().optional(), // History of Present Illness narrative
  symptoms: z.array(z.string()).default([]),
  review_of_systems: z.array(z.string()).default([]), // Pertinent positives & negatives
  physical_exam: z.string().nullable().optional(), // Physical exam findings
  plan_directives: z.array(z.string()).default([]), // Medications, activity, follow-up instructions
  duration: z.string().nullable().optional(),
  medical_history: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  current_medications: z.array(z.string()).default([]),
});
export type PatientData = z.infer<typeof PatientDataSchema>;

// ─── Triage ───────────────────────────────────────────────────────────────────
export const TriageFlagSchema = z.object({
  symptom: z.string(),
  level: z.enum(["HIGH", "MEDIUM", "LOW"]),
  reason: z.string(),
});
export type TriageFlag = z.infer<typeof TriageFlagSchema>;

export const TriageResultSchema = z.object({
  triage_level: z.enum(["HIGH", "MEDIUM", "LOW"]),
  flags: z.array(TriageFlagSchema),
  recommendation: z.string(),
  confidence: z.number().min(0).max(100).default(80),
});
export type TriageResult = z.infer<typeof TriageResultSchema>;

// ─── SOAP Note ────────────────────────────────────────────────────────────────
export const SOAPNoteSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessment: z.string(),
  plan: z.string(),
});
export type SOAPNote = z.infer<typeof SOAPNoteSchema>;

// ─── Differential Diagnoses ───────────────────────────────────────────────────
export const DifferentialDiagnosisSchema = z.object({
  rank: z.number(),
  diagnosis: z.string(),
  likelihood: z.enum(["Most Likely", "Possible", "Less Likely"]),
  supporting_evidence: z.array(z.string()),
  contradicting_evidence: z.array(z.string()),
  ruling_out_test: z.string(),
});
export type DifferentialDiagnosis = z.infer<typeof DifferentialDiagnosisSchema>;

// ─── ICD-10 Codes ─────────────────────────────────────────────────────────────
export const ICD10SuggestionSchema = z.object({
  code: z.string(),
  description: z.string(),
  confidence: z.enum(["High", "Moderate", "Low"]),
  is_primary: z.boolean().default(false),
});
export type ICD10Suggestion = z.infer<typeof ICD10SuggestionSchema>;

// ─── Documentation Quality Score ──────────────────────────────────────────────
export const QualityScoreSchema = z.object({
  completeness: z.number().min(0).max(100),
  specificity: z.number().min(0).max(100),
  reasoning_quality: z.number().min(0).max(100),
  safety: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
});
export type QualityScore = z.infer<typeof QualityScoreSchema>;

// ─── Patient Follow-Up ────────────────────────────────────────────────────────
export const PatientFollowUpSchema = z.object({
  subject: z.string(),
  body: z.string(),
});
export type PatientFollowUp = z.infer<typeof PatientFollowUpSchema>;

// ─── Validation Status ────────────────────────────────────────────────────────
export const ValidationStatusSchema = z.object({
  isValid: z.boolean().default(true),
  errors: z.array(z.string()).default([]),
  retryCount: z.number().default(0),
});
export type ValidationStatus = z.infer<typeof ValidationStatusSchema>;

// ─── LangGraph State Annotation ───────────────────────────────────────────────
export const AgentStateAnnotation = Annotation.Root({
  rawInput: Annotation<string>(),
  cleanedTranscript: Annotation<string>({
    value: (x, y) => y ?? x ?? "",
    default: () => "",
  }),
  patientData: Annotation<PatientData | null>({
    value: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  triageResult: Annotation<TriageResult | null>({
    value: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  differentialDiagnoses: Annotation<DifferentialDiagnosis[] | null>({
    value: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  icd10Suggestions: Annotation<ICD10Suggestion[] | null>({
    value: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  soapNote: Annotation<SOAPNote | null>({
    value: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  qualityScore: Annotation<QualityScore | null>({
    value: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  followUp: Annotation<PatientFollowUp | null>({
    value: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  validationStatus: Annotation<ValidationStatus>({
    value: (x, y) => y ?? x ?? { isValid: true, errors: [], retryCount: 0 },
    default: () => ({ isValid: true, errors: [], retryCount: 0 }),
  }),
  currentNode: Annotation<string>({
    value: (x, y) => y ?? x ?? "init",
    default: () => "init",
  }),
  error: Annotation<string | null>({
    value: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
});

export type AgentState = typeof AgentStateAnnotation.State;
