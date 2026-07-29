import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState, ICD10Suggestion, ICD10SuggestionSchema } from "../state";
import { z } from "zod";

const ICD10ListSchema = z.array(ICD10SuggestionSchema);

export async function icd10Node(state: AgentState): Promise<Partial<AgentState>> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const soapNote = state.soapNote;
  const patientData = state.patientData;
  const triageResult = state.triageResult;

  if (!soapNote && !patientData) {
    return { currentNode: "icd10", icd10Suggestions: [] };
  }

  if (!apiKey) {
    const fallback: ICD10Suggestion[] = [
      {
        code: "R68.89",
        description: "Other specified general symptoms and signs",
        confidence: "Low",
        is_primary: true,
      },
    ];
    return { icd10Suggestions: fallback, currentNode: "icd10" };
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.0-flash",
    temperature: 0.0,
  });

  const prompt = `You are a certified medical coder (CPC) with expertise in ICD-10-CM coding. Based on the clinical documentation below, suggest the 3 most appropriate ICD-10-CM codes.

Clinical Assessment:
${soapNote?.assessment ?? patientData?.chief_complaint ?? "General clinical presentation"}

Chief Complaint: ${patientData?.chief_complaint ?? "Not specified"}
Triage Level: ${triageResult?.triage_level ?? "LOW"}
Physical Exam: ${patientData?.physical_exam ?? "Not documented"}

CODING RULES:
1. Select the most specific code available for the primary diagnosis
2. First code = highest confidence primary diagnosis
3. Secondary codes = comorbidities or secondary conditions mentioned
4. Use ICD-10-CM format (letter + 2 digits + decimal + up to 4 more digits)

Return ONLY raw JSON array (no markdown):
[
  {
    "code": "ICD-10-CM code (e.g. M54.50)",
    "description": "Official ICD-10 descriptor",
    "confidence": "High",
    "is_primary": true
  },
  {
    "code": "...",
    "description": "...",
    "confidence": "Moderate",
    "is_primary": false
  },
  {
    "code": "...",
    "description": "...",
    "confidence": "Low",
    "is_primary": false
  }
]`;

  try {
    const response = await model.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in ICD-10 response");

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = ICD10ListSchema.parse(parsed);

    return { icd10Suggestions: validated, currentNode: "icd10", error: null };
  } catch (err) {
    console.error("Error in icd10Node:", err);
    return {
      icd10Suggestions: [
        {
          code: "R68.89",
          description: "Other specified general symptoms and signs",
          confidence: "Low" as const,
          is_primary: true,
        },
      ],
      currentNode: "icd10",
      error: null,
    };
  }
}
