import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { TriageFlag, TriageResult } from "../state";

const CLINICAL_TRIAGE_RULES: Array<{
  keywords: string[];
  level: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
}> = [
  {
    keywords: ["chest pain", "angina", "cardiac pain", "pressure in chest"],
    level: "HIGH",
    reason: "Possible acute coronary syndrome or myocardial ischemia. Immediate ECG & ER evaluation indicated.",
  },
  {
    keywords: ["shortness of breath", "dyspnea", "difficulty breathing", "wheezing severe", "stridor"],
    level: "HIGH",
    reason: "Potential respiratory distress or acute pulmonary decompensation.",
  },
  {
    keywords: ["numbness", "weakness one side", "facial droop", "slurred speech", "stroke", "tia"],
    level: "HIGH",
    reason: "Neurological indicator for potential acute ischemic or hemorrhagic stroke.",
  },
  {
    keywords: ["loss of consciousness", "syncope", "passed out", "fainted"],
    level: "HIGH",
    reason: "Syncope of undetermined origin — cardiac arrhythmia vs hemodynamic instability.",
  },
  {
    keywords: ["severe headache", "thunderclap headache", "sudden worst headache"],
    level: "HIGH",
    reason: "Indicator for subarachnoid hemorrhage or hypertensive crisis.",
  },
  {
    keywords: ["coughing blood", "hemoptysis", "vomiting blood", "hematemesis"],
    level: "HIGH",
    reason: "Active internal or pulmonary hemorrhage requires emergent evaluation.",
  },
  {
    keywords: ["fever", "high temp", "chills", "sweats"],
    level: "MEDIUM",
    reason: "Signs of systemic infection or inflammatory response. Monitor vitals and bloodwork.",
  },
  {
    keywords: ["abdominal pain", "stomach pain", "epigastric pain", "cramping severe"],
    level: "MEDIUM",
    reason: "Gastrointestinal complaint needing clinical palpation to rule out acute abdomen.",
  },
  {
    keywords: ["dizziness", "vertigo", "lightheadedness"],
    level: "MEDIUM",
    reason: "Vestibular vs orthostatic symptom — monitor blood pressure and gait stability.",
  },
  {
    keywords: ["persistent vomiting", "cannot keep fluids down", "dehydration"],
    level: "MEDIUM",
    reason: "Risk of electrolyte imbalance and fluid depletion.",
  },
  {
    keywords: ["mild headache", "tension headache", "headache mild"],
    level: "LOW",
    reason: "Non-emergent tension headache symptom pattern.",
  },
  {
    keywords: ["runny nose", "nasal congestion", "sore throat", "sneezing", "cough mild"],
    level: "LOW",
    reason: "Upper respiratory tract symptoms consistent with viral URTI.",
  },
  {
    keywords: ["joint pain", "knee pain", "back pain", "muscle ache"],
    level: "LOW",
    reason: "Musculoskeletal pain pattern. Symptomatic relief indicated.",
  },
];

export const clinicalTriageTool = new DynamicStructuredTool({
  name: "clinical_triage_scanner",
  description: "Scans patient symptoms and vitals against clinical rules to produce a triage risk rating (HIGH, MEDIUM, LOW) and flag high-risk clinical triggers.",
  schema: z.object({
    symptoms: z.array(z.string()).describe("List of patient symptoms extracted from intake"),
    chief_complaint: z.string().describe("Primary chief complaint of the patient"),
    vitals: z.record(z.string(), z.any()).optional().describe("Patient vitals object"),
  }),
  func: async ({ symptoms, chief_complaint }) => {
    const matchedFlags: TriageFlag[] = [];
    let overallLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";

    const allTexts = [...symptoms, chief_complaint].map((s) => s.toLowerCase());

    for (const rule of CLINICAL_TRIAGE_RULES) {
      for (const text of allTexts) {
        if (rule.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
          matchedFlags.push({
            symptom: text,
            level: rule.level,
            reason: rule.reason,
          });

          if (rule.level === "HIGH") {
            overallLevel = "HIGH";
          } else if (rule.level === "MEDIUM" && overallLevel !== "HIGH") {
            overallLevel = "MEDIUM";
          }
          break;
        }
      }
    }

    const uniqueFlags = matchedFlags.filter(
      (flag, index, self) => index === self.findIndex((f) => f.reason === flag.reason)
    );

    let recommendation = "";
    if (overallLevel === "HIGH") {
      recommendation = "URGENT CLINICAL ALERT: High-risk symptoms detected. Immediate physician evaluation and emergency protocol standby recommended.";
    } else if (overallLevel === "MEDIUM") {
      recommendation = "MODERATE RISK: Standard clinical evaluation required within 24 hours. Monitor vital signs closely.";
    } else {
      recommendation = "ROUTINE INTAKE: Low-risk presentation. Standard clinic protocol and routine follow-up appropriate.";
    }

    const result: TriageResult = {
      triage_level: overallLevel,
      flags: uniqueFlags,
      recommendation,
    };

    return JSON.stringify(result);
  },
});
