import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState, PatientData, PatientDataSchema } from "../state";

export async function extractNode(state: AgentState): Promise<Partial<AgentState>> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const inputText = state.cleanedTranscript || state.rawInput;

  if (!inputText || !inputText.trim()) {
    return {
      currentNode: "extract",
      error: "Input text is empty",
    };
  }

  if (!apiKey) {
    const fallbackData: PatientData = {
      patient_name: "Patient (Demo)",
      age: 40,
      gender: "unspecified",
      vitals: { blood_pressure: "120/80 mmHg", heart_rate: "75 bpm" },
      chief_complaint: inputText.slice(0, 100),
      symptoms: [inputText.slice(0, 50)],
      duration: "recent onset",
      medical_history: [],
    };
    return {
      patientData: fallbackData,
      currentNode: "extract",
    };
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.0-flash",
    temperature: 0.1,
  });

  const prompt = `You are a clinical entity extraction service parsing clinical dictation notes into structured JSON format.

Input Clinical Text:
"""
${inputText}
"""

Extract entities matching this strict JSON structure:
{
  "patient_name": "Full name or 'Anonymous Patient'",
  "age": number or null,
  "gender": "male | female | other | unspecified",
  "vitals": {
    "blood_pressure": "e.g. 130/85 mmHg or null",
    "heart_rate": "e.g. 82 bpm or null",
    "temperature": "e.g. 98.6 °F or null",
    "respiratory_rate": "e.g. 18/min or null",
    "oxygen_saturation": "e.g. 98% or null"
  },
  "chief_complaint": "Primary complaint summary",
  "symptoms": ["symptom 1", "symptom 2"],
  "duration": "e.g. 3 days or null",
  "medical_history": ["condition 1", "condition 2"]
}

Output ONLY valid JSON.`;

  try {
    const response = await model.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON structure in extraction response");
    }

    const parsedJson = JSON.parse(jsonMatch[0]);
    const validatedData = PatientDataSchema.parse(parsedJson);

    return {
      patientData: validatedData,
      currentNode: "extract",
      error: null,
    };
  } catch (err) {
    console.error("Error in extractNode:", err);
    const fallbackData: PatientData = {
      patient_name: "Patient",
      chief_complaint: inputText.slice(0, 120),
      symptoms: [inputText.slice(0, 60)],
      vitals: {},
      medical_history: [],
    };
    return {
      patientData: fallbackData,
      currentNode: "extract",
      error: null,
    };
  }
}
