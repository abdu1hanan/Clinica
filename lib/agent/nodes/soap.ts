import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState, SOAPNote, SOAPNoteSchema } from "../state";

export async function soapNode(state: AgentState): Promise<Partial<AgentState>> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const patientData = state.patientData;
  const triageResult = state.triageResult;
  const cleanedTranscript = state.cleanedTranscript || state.rawInput;

  if (!patientData) {
    return { currentNode: "soap", error: "Missing patientData for SOAP generation" };
  }

  if (!apiKey) {
    const fallback: SOAPNote = {
      subjective: `${patientData.patient_name}${patientData.age ? `, ${patientData.age}-year-old` : ""}${patientData.gender && patientData.gender !== "unspecified" ? ` ${patientData.gender}` : ""} presents with ${patientData.chief_complaint}. ${patientData.hpi || ""}`,
      objective: `Vitals: ${patientData.vitals?.vitals_summary ?? `BP ${patientData.vitals?.blood_pressure ?? "Not recorded"}, HR ${patientData.vitals?.heart_rate ?? "Not recorded"}, Temp ${patientData.vitals?.temperature ?? "Not recorded"}`}. Physical Exam: ${patientData.physical_exam ?? "Not documented at this encounter."} Review of Systems: ${patientData.review_of_systems?.join("; ") || "Not documented."}`,
      assessment: `Clinical presentation consistent with ${patientData.chief_complaint}. Triage Risk: ${triageResult?.triage_level ?? "LOW"}. ${triageResult?.recommendation ?? ""}`,
      plan: patientData.plan_directives?.length
        ? patientData.plan_directives.map((d, i) => `${i + 1}. ${d}`).join("\n")
        : "1. Symptomatic relief as appropriate.\n2. Follow up with primary care physician.\n3. Return if symptoms worsen.",
    };
    return { soapNote: fallback, currentNode: "soap" };
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.0-flash",
    temperature: 0.15,
  });

  const prompt = `You are a board-certified Internal Medicine physician writing a formal SOAP note for an Electronic Medical Record (EMR) system.

CRITICAL INSTRUCTIONS:
1. SYNTHESIZE and REWRITE — never copy-paste raw speech verbatim. Convert clinical shorthand into formal medical prose.
2. SUBJECTIVE: Write a complete HPI paragraph — include mechanism/onset, character, location, duration, radiation, aggravating/relieving factors, and pertinent negatives from the Review of Systems.
3. OBJECTIVE: Use structured bullet-point format for (a) Vitals, (b) Physical Examination findings, (c) Special Tests with results. If vitals were stated as "stable", write "Vitals: Reported stable by clinician." NEVER output empty brackets.
4. ASSESSMENT: INFER the primary diagnostic impression based on the full clinical picture (S + O). Name the diagnosis formally (e.g., "Acute mechanical lumbar strain secondary to repetitive heavy lifting"). Add a differential if clinically appropriate.
5. PLAN: Format as numbered, actionable medical orders:
   - Medications with dose, route, frequency, duration
   - Activity recommendations and restrictions  
   - Follow-up timing
   - Return precautions / red-flag symptoms to watch for
6. If any section has insufficient data, write "Not reported at this encounter." — NEVER leave blank.

---
Original Clinical Transcript:
"""
${cleanedTranscript}
"""

Extracted Clinical Data:
Patient: ${patientData.patient_name}, ${patientData.age ?? "Age not stated"} years, ${patientData.gender ?? "Gender not stated"}
Chief Complaint: ${patientData.chief_complaint}
HPI: ${patientData.hpi ?? "See transcript"}
Vitals: ${patientData.vitals?.vitals_summary ?? `BP: ${patientData.vitals?.blood_pressure ?? "not documented"}, HR: ${patientData.vitals?.heart_rate ?? "not documented"}, Temp: ${patientData.vitals?.temperature ?? "not documented"}, SpO2: ${patientData.vitals?.oxygen_saturation ?? "not documented"}`}
Symptoms: ${patientData.symptoms?.join(", ") || "See transcript"}
Review of Systems: ${patientData.review_of_systems?.join("; ") || "Not specifically documented"}
Physical Exam: ${patientData.physical_exam ?? "Not documented"}
Plan Directives: ${patientData.plan_directives?.join("; ") || "Not specifically stated"}
Medical History: ${patientData.medical_history?.join(", ") || "Not reported"}
Triage Level: ${triageResult?.triage_level ?? "LOW"}
Triage Flags: ${triageResult?.flags?.map(f => f.symptom).join(", ") || "None identified"}
---

Return ONLY this raw JSON (no markdown, no code blocks):
{
  "subjective": "Complete professional HPI paragraph",
  "objective": "• Vitals: ...\n• Physical Examination: ...\n• Special Tests: ...",
  "assessment": "Primary diagnostic impression with brief rationale. Triage risk context.",
  "plan": "1. Medications: ...\n2. Activity: ...\n3. Follow-Up: ...\n4. Return Precautions: ..."
}`;

  try {
    const response = await model.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in SOAP response");

    const parsedJson = JSON.parse(jsonMatch[0]);
    const validatedSOAP = SOAPNoteSchema.parse(parsedJson);

    return { soapNote: validatedSOAP, currentNode: "soap", error: null };
  } catch (err) {
    console.error("Error in soapNode:", err);
    const fallback: SOAPNote = {
      subjective: `${patientData.patient_name} presents with ${patientData.chief_complaint}. ${patientData.hpi || ""}`,
      objective: `Vitals: ${patientData.vitals?.vitals_summary ?? "Not documented."}. Physical Exam: ${patientData.physical_exam ?? "Not documented at this encounter."}`,
      assessment: `Clinical impression: ${patientData.chief_complaint}. Triage classification: ${triageResult?.triage_level ?? "LOW"} risk.`,
      plan: patientData.plan_directives?.length
        ? patientData.plan_directives.map((d, i) => `${i + 1}. ${d}`).join("\n")
        : "1. Follow up with primary physician.\n2. Monitor for red flag symptom progression.",
    };
    return { soapNote: fallback, currentNode: "soap", error: null };
  }
}
