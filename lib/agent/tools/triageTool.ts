import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { TriageFlag, TriageResult } from "../state";

const CLINICAL_TRIAGE_RULES: Array<{
  keywords: string[];
  level: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
}> = [
  {
    keywords: ["chest pain", "angina", "cardiac pain", "pressure in chest", "crushing chest", "chest tightness"],
    level: "HIGH",
    reason: "Possible acute coronary syndrome or myocardial ischemia. Immediate ECG & ER evaluation indicated.",
  },
  {
    keywords: ["shortness of breath", "dyspnea", "difficulty breathing", "wheezing severe", "stridor", "respiratory distress"],
    level: "HIGH",
    reason: "Potential respiratory distress or acute pulmonary decompensation.",
  },
  {
    keywords: ["numbness", "weakness one side", "facial droop", "slurred speech", "stroke", "tia", "arm weakness", "leg weakness", "unilateral weakness"],
    level: "HIGH",
    reason: "Neurological indicator for potential acute ischemic or hemorrhagic stroke. FAST protocol indicated.",
  },
  {
    keywords: ["loss of consciousness", "syncope", "passed out", "fainted", "unresponsive"],
    level: "HIGH",
    reason: "Syncope of undetermined origin — cardiac arrhythmia vs hemodynamic instability.",
  },
  {
    keywords: ["severe headache", "thunderclap headache", "sudden worst headache", "worst headache of my life"],
    level: "HIGH",
    reason: "Indicator for subarachnoid hemorrhage or hypertensive crisis.",
  },
  {
    keywords: ["coughing blood", "hemoptysis", "vomiting blood", "hematemesis", "blood in stool", "melena"],
    level: "HIGH",
    reason: "Active internal or pulmonary hemorrhage requires emergent evaluation.",
  },
  {
    keywords: ["sepsis", "high fever", "rigors", "bacteremia", "septic"],
    level: "HIGH",
    reason: "Systemic sepsis indicators. Sepsis protocol and blood cultures required.",
  },
  {
    keywords: ["fever", "high temp", "chills", "sweats", "pyrexia"],
    level: "MEDIUM",
    reason: "Signs of systemic infection or inflammatory response. Monitor vitals and bloodwork.",
  },
  {
    keywords: ["abdominal pain", "stomach pain", "epigastric pain", "cramping severe", "rebound tenderness", "rovsing"],
    level: "MEDIUM",
    reason: "Gastrointestinal complaint needing clinical palpation to rule out acute abdomen.",
  },
  {
    keywords: ["dizziness", "vertigo", "lightheadedness", "presyncope"],
    level: "MEDIUM",
    reason: "Vestibular vs orthostatic symptom — monitor blood pressure and gait stability.",
  },
  {
    keywords: ["persistent vomiting", "cannot keep fluids down", "dehydration", "nausea vomiting"],
    level: "MEDIUM",
    reason: "Risk of electrolyte imbalance and fluid depletion.",
  },
  {
    keywords: ["palpitations", "irregular heartbeat", "racing heart", "tachycardia"],
    level: "MEDIUM",
    reason: "Cardiac arrhythmia possible. 12-lead ECG and cardiac monitoring indicated.",
  },
  {
    keywords: ["mild headache", "tension headache", "headache mild"],
    level: "LOW",
    reason: "Non-emergent tension headache symptom pattern.",
  },
  {
    keywords: ["runny nose", "nasal congestion", "sore throat", "sneezing", "cough mild", "upper respiratory"],
    level: "LOW",
    reason: "Upper respiratory tract symptoms consistent with viral URTI.",
  },
  {
    keywords: ["joint pain", "knee pain", "back pain", "muscle ache", "musculoskeletal", "lumbar"],
    level: "LOW",
    reason: "Musculoskeletal pain pattern. Symptomatic relief indicated.",
  },
];

// Vitals-based HIGH risk rules
function evaluateVitals(vitals: Record<string, string | null | undefined>): { flag: boolean; reason: string } | null {
  if (vitals.blood_pressure) {
    const bpMatch = vitals.blood_pressure.match(/(\d+)\/(\d+)/);
    if (bpMatch) {
      const systolic = parseInt(bpMatch[1]);
      const diastolic = parseInt(bpMatch[2]);
      if (systolic >= 180 || diastolic >= 110) {
        return { flag: true, reason: `Hypertensive crisis: BP ${vitals.blood_pressure}. Immediate antihypertensive evaluation required.` };
      }
      if (systolic < 90) {
        return { flag: true, reason: `Hypotension: BP ${vitals.blood_pressure}. Hemodynamic instability evaluation required.` };
      }
    }
  }
  if (vitals.heart_rate) {
    const hrMatch = vitals.heart_rate.match(/(\d+)/);
    if (hrMatch) {
      const hr = parseInt(hrMatch[1]);
      if (hr >= 130) {
        return { flag: true, reason: `Tachycardia: HR ${vitals.heart_rate}. Cardiac rhythm evaluation indicated.` };
      }
      if (hr < 45) {
        return { flag: true, reason: `Bradycardia: HR ${vitals.heart_rate}. Cardiac monitoring required.` };
      }
    }
  }
  if (vitals.oxygen_saturation) {
    const spo2Match = vitals.oxygen_saturation.match(/(\d+)/);
    if (spo2Match && parseInt(spo2Match[1]) < 92) {
      return { flag: true, reason: `Hypoxia: SpO2 ${vitals.oxygen_saturation}. Supplemental oxygen and respiratory evaluation required.` };
    }
  }
  return null;
}

export const clinicalTriageTool = new DynamicStructuredTool({
  name: "clinical_triage_scanner",
  description: "Scans patient symptoms and vitals against clinical safety rules to produce a triage risk rating (HIGH, MEDIUM, LOW) with confidence score and clinical rationale.",
  schema: z.object({
    symptoms: z.array(z.string()).describe("List of patient symptoms from intake"),
    chief_complaint: z.string().describe("Primary chief complaint"),
    vitals: z.record(z.string(), z.any()).optional().describe("Patient vitals object"),
  }),
  func: async ({ symptoms, chief_complaint, vitals }) => {
    const matchedFlags: TriageFlag[] = [];
    let overallLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";

    const allTexts = [...symptoms, chief_complaint].map((s) => s.toLowerCase());

    for (const rule of CLINICAL_TRIAGE_RULES) {
      for (const text of allTexts) {
        if (rule.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
          matchedFlags.push({
            symptom: text.length > 80 ? text.slice(0, 80) + "..." : text,
            level: rule.level,
            reason: rule.reason,
          });
          if (rule.level === "HIGH") overallLevel = "HIGH";
          else if (rule.level === "MEDIUM" && overallLevel !== "HIGH") overallLevel = "MEDIUM";
          break;
        }
      }
    }

    // Vitals-based override
    if (vitals && typeof vitals === "object") {
      const vitalsCheck = evaluateVitals(vitals as Record<string, string>);
      if (vitalsCheck) {
        matchedFlags.push({
          symptom: "Abnormal Vital Signs",
          level: "HIGH",
          reason: vitalsCheck.reason,
        });
        overallLevel = "HIGH";
      }
    }

    const uniqueFlags = matchedFlags.filter(
      (flag, index, self) => index === self.findIndex((f) => f.reason === flag.reason)
    );

    // Compute confidence based on number and severity of flags
    let confidence = 75;
    const highFlags = uniqueFlags.filter(f => f.level === "HIGH").length;
    const medFlags = uniqueFlags.filter(f => f.level === "MEDIUM").length;
    if (overallLevel === "HIGH") confidence = Math.min(98, 80 + highFlags * 6);
    else if (overallLevel === "MEDIUM") confidence = Math.min(90, 70 + medFlags * 5);
    else confidence = uniqueFlags.length === 0 ? 90 : 78;

    let recommendation = "";
    if (overallLevel === "HIGH") {
      recommendation = "URGENT CLINICAL ALERT: High-risk presentation detected. Immediate physician evaluation and emergency protocol activation recommended.";
    } else if (overallLevel === "MEDIUM") {
      recommendation = "MODERATE RISK: Standard clinical evaluation required within 24 hours. Vital sign monitoring and lab workup recommended.";
    } else {
      recommendation = "ROUTINE INTAKE: Low-risk presentation. Standard clinic protocol and routine outpatient follow-up appropriate.";
    }

    const result: TriageResult = {
      triage_level: overallLevel,
      flags: uniqueFlags,
      recommendation,
      confidence,
    };

    return JSON.stringify(result);
  },
});
