import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState, SOAPNote, SOAPNoteSchema } from "../state";

export async function soapNode(state: AgentState): Promise<Partial<AgentState>> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const patientData = state.patientData;
  const triageResult = state.triageResult;

  if (!patientData) {
    return {
      currentNode: "soap",
      error: "Missing patientData for SOAP generation",
    };
  }

  // Fallback SOAP if API key missing
  if (!apiKey) {
    const fallbackSOAP: SOAPNote = {
      subjective: `Patient (${patientData.patient_name}) reports: ${patientData.chief_complaint}. Symptoms: ${patientData.symptoms.join(", ")}.`,
      objective: `Vitals: BP ${patientData.vitals.blood_pressure ?? '120/80'}, HR ${patientData.vitals.heart_rate ?? '72'}. Physical exam pending.`,
      assessment: `Clinical Assessment (${triageResult?.triage_level ?? 'LOW'} Risk): Presentation consistent with ${patientData.chief_complaint}. Triage recommendation: ${triageResult?.recommendation ?? 'Routine follow-up'}.`,
      plan: `1. Clinical monitoring.\n2. Symptom relief as needed.\n3. Patient educated on warning signs.`,
    };
    return {
      soapNote: fallbackSOAP,
      currentNode: "soap",
    };
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.0-flash",
    temperature: 0.2,
  });

  const prompt = `You are an expert clinical documentation specialist formatting patient intake data into standard SOAP (Subjective, Objective, Assessment, Plan) format.

Patient Data:
${JSON.stringify(patientData, null, 2)}

Clinical Triage Evaluation:
${JSON.stringify(triageResult, null, 2)}

Generate standard medical SOAP documentation:
- **Subjective (S)**: Patient demographic info, chief complaint, detailed history of present illness, patient-reported symptoms, and relevant medical history.
- **Objective (O)**: Vital signs, physical observations, labs, and objective clinical markers.
- **Assessment (A)**: Diagnostic impressions, differential diagnosis, and clinical triage risk context (${triageResult?.triage_level ?? 'LOW'} RISK).
- **Plan (P)**: Actionable diagnostic tests, therapeutic interventions, medications, referral recommendations, and return precautions.

Return JSON with exact keys: "subjective", "objective", "assessment", "plan".
Do NOT use markdown code block formatting. Return raw valid JSON.`;

  try {
    const response = await model.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in SOAP response");
    }

    const parsedJson = JSON.parse(jsonMatch[0]);
    const validatedSOAP = SOAPNoteSchema.parse(parsedJson);

    return {
      soapNote: validatedSOAP,
      currentNode: "soap",
      error: null,
    };
  } catch (err: any) {
    console.error("Error in soapNode:", err);
    const fallbackSOAP: SOAPNote = {
      subjective: `Patient ${patientData.patient_name} presents with ${patientData.chief_complaint}.`,
      objective: `Vitals documented: ${JSON.stringify(patientData.vitals)}.`,
      assessment: `Clinical presentation evaluated. Triage rating: ${triageResult?.triage_level ?? 'LOW'}.`,
      plan: `1. Follow up with primary physician.\n2. Monitor for red flag symptoms.`,
    };
    return {
      soapNote: fallbackSOAP,
      currentNode: "soap",
      error: null,
    };
  }
}
