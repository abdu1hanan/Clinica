import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState, PatientData, PatientDataSchema } from "../state";

export async function extractNode(state: AgentState): Promise<Partial<AgentState>> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const inputText = state.cleanedTranscript || state.rawInput;

  if (!inputText || !inputText.trim()) {
    return { currentNode: "extract", error: "Input text is empty" };
  }

  if (!apiKey) {
    const fallbackData: PatientData = {
      patient_name: "Demo Patient",
      age: 45,
      gender: "unspecified",
      vitals: { vitals_summary: "Not reported at this encounter" },
      chief_complaint: inputText.slice(0, 100),
      hpi: inputText.slice(0, 200),
      symptoms: [inputText.slice(0, 60)],
      review_of_systems: [],
      physical_exam: "Physical examination not documented",
      plan_directives: [],
      duration: "recent onset",
      medical_history: [],
      allergies: [],
      current_medications: [],
    };
    return { patientData: fallbackData, currentNode: "extract" };
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.0-flash",
    temperature: 0.0,
  });

  const prompt = `You are a board-certified clinical documentation specialist. Extract ALL clinical entities from this physician dictation with maximum precision.

CRITICAL RULES:
- NEVER output empty strings or empty JSON objects for vitals — if vitals are described as "stable" or not stated numerically, output: "Reported stable by clinician" in vitals_summary
- Extract pertinent NEGATIVES in review_of_systems (e.g., "Denies radiation of pain", "No lower extremity numbness", "No bowel/bladder dysfunction")
- Extract EXACT medication directives with dosages (e.g., "Ibuprofen 400mg PO PRN", "aspirin 81mg daily") into plan_directives
- Extract physical exam findings (palpation, auscultation, special tests like SLR, Murphy's sign) into physical_exam as a single structured string
- Extract HPI as a flowing narrative: onset, character, location, duration, radiation, aggravating/relieving factors

Clinical Dictation:
"""
${inputText}
"""

Return ONLY this JSON structure (no markdown, no backticks):
{
  "patient_name": "Full name or 'Anonymous Patient'",
  "age": number or null,
  "gender": "male | female | other | unspecified",
  "vitals": {
    "blood_pressure": "e.g. 145/90 mmHg or null",
    "heart_rate": "e.g. 98 bpm or null",
    "temperature": "e.g. 101.2 °F or null",
    "respiratory_rate": "e.g. 18/min or null",
    "oxygen_saturation": "e.g. 98% or null",
    "vitals_summary": "Reported stable by clinician" or null if specific values provided
  },
  "chief_complaint": "Concise primary complaint (one sentence)",
  "hpi": "Full History of Present Illness narrative — onset, character, location, duration, radiation, aggravating/relieving factors, associated symptoms",
  "symptoms": ["symptom 1", "symptom 2"],
  "review_of_systems": ["Denies radiation of pain", "No lower extremity numbness", "Positive for nausea", etc.],
  "physical_exam": "Structured exam findings — e.g. Lumbar: mild paraspinal tenderness bilaterally. SLR: negative bilaterally. Gait: normal.",
  "plan_directives": ["Ibuprofen 400mg PO q6h PRN pain", "Light walking encouraged", "Avoid heavy lifting"],
  "duration": "e.g. 3 days or null",
  "medical_history": ["condition 1"],
  "allergies": ["NKDA" or allergy entries],
  "current_medications": ["medication 1"]
}`;

  try {
    const response = await model.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in extraction response");

    const parsedJson = JSON.parse(jsonMatch[0]);
    const validatedData = PatientDataSchema.parse(parsedJson);

    return { patientData: validatedData, currentNode: "extract", error: null };
  } catch (err) {
    console.error("Error in extractNode:", err);
    const fallback: PatientData = {
      patient_name: "Patient",
      chief_complaint: inputText.slice(0, 120),
      hpi: inputText.slice(0, 300),
      symptoms: [inputText.slice(0, 60)],
      vitals: { vitals_summary: "Not documented at this encounter" },
      review_of_systems: [],
      physical_exam: "Not documented at this encounter",
      plan_directives: [],
      medical_history: [],
      allergies: [],
      current_medications: [],
    };
    return { patientData: fallback, currentNode: "extract", error: null };
  }
}
