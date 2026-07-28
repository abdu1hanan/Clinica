import { z } from "zod";
import { Annotation } from "@langchain/langgraph";

export const PatientDataSchema = z.object({
  patient_name: z.string().default("Patient"),
  age: z.number().nullable().optional(),
  gender: z.string().nullable().optional(),
  vitals: z.object({
    blood_pressure: z.string().nullable().optional(),
    heart_rate: z.string().nullable().optional(),
    temperature: z.string().nullable().optional(),
    respiratory_rate: z.string().nullable().optional(),
    oxygen_saturation: z.string().nullable().optional(),
  }).default({}),
  chief_complaint: z.string().default("Unspecified symptoms"),
  symptoms: z.array(z.string()).default([]),
  duration: z.string().nullable().optional(),
  medical_history: z.array(z.string()).default([]),
});

export type PatientData = z.infer<typeof PatientDataSchema>;

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
});

export type TriageResult = z.infer<typeof TriageResultSchema>;

export const SOAPNoteSchema = z.object({
  subjective: z.string(),
  objective: z.string(),
  assessment: z.string(),
  plan: z.string(),
});

export type SOAPNote = z.infer<typeof SOAPNoteSchema>;

export const PatientFollowUpSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

export type PatientFollowUp = z.infer<typeof PatientFollowUpSchema>;

export const ValidationStatusSchema = z.object({
  isValid: z.boolean().default(true),
  errors: z.array(z.string()).default([]),
  retryCount: z.number().default(0),
});

export type ValidationStatus = z.infer<typeof ValidationStatusSchema>;

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
  soapNote: Annotation<SOAPNote | null>({
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
