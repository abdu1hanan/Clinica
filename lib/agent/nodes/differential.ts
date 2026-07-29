import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState, DifferentialDiagnosis, DifferentialDiagnosisSchema } from "../state";
import { z } from "zod";

const DifferentialListSchema = z.array(DifferentialDiagnosisSchema);

export async function differentialNode(state: AgentState): Promise<Partial<AgentState>> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const patientData = state.patientData;
  const triageResult = state.triageResult;

  if (!patientData) {
    return { currentNode: "differential", differentialDiagnoses: [] };
  }

  if (!apiKey) {
    // Fallback differential based on chief complaint
    const fallback: DifferentialDiagnosis[] = [
      {
        rank: 1,
        diagnosis: patientData.chief_complaint || "Primary presentation",
        likelihood: "Most Likely",
        supporting_evidence: ["Patient-reported chief complaint"],
        contradicting_evidence: [],
        ruling_out_test: "Clinical examination and history",
      },
    ];
    return { differentialDiagnoses: fallback, currentNode: "differential" };
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.0-flash",
    temperature: 0.1,
  });

  const prompt = `You are a board-certified clinician generating a ranked differential diagnosis list for a clinical case.

Clinical Summary:
- Patient: ${patientData.patient_name}, ${patientData.age ?? "age unknown"} year old ${patientData.gender ?? ""}
- Chief Complaint: ${patientData.chief_complaint}
- HPI: ${patientData.hpi ?? "Not documented"}
- Symptoms: ${patientData.symptoms?.join(", ") || "See CC"}
- Physical Exam: ${patientData.physical_exam ?? "Not documented"}
- Review of Systems: ${patientData.review_of_systems?.join("; ") || "Not documented"}
- Vitals: ${patientData.vitals?.vitals_summary ?? `BP ${patientData.vitals?.blood_pressure ?? "?"}, HR ${patientData.vitals?.heart_rate ?? "?"}`}
- Triage Level: ${triageResult?.triage_level ?? "LOW"}

Generate the top 3 differential diagnoses ranked by clinical likelihood. For each:
- List 2-3 bullet points of SUPPORTING evidence from the case
- List 1-2 bullet points of CONTRADICTING evidence (what argues against it)
- Suggest the single most useful test or finding to rule it in or out

Return ONLY raw JSON array (no markdown, no backticks):
[
  {
    "rank": 1,
    "diagnosis": "Full formal diagnosis name",
    "likelihood": "Most Likely",
    "supporting_evidence": ["finding from the case that supports this"],
    "contradicting_evidence": ["finding that argues against this"],
    "ruling_out_test": "Single best test or finding to confirm or exclude"
  },
  {
    "rank": 2,
    "diagnosis": "...",
    "likelihood": "Possible",
    "supporting_evidence": [...],
    "contradicting_evidence": [...],
    "ruling_out_test": "..."
  },
  {
    "rank": 3,
    "diagnosis": "...",
    "likelihood": "Less Likely",
    "supporting_evidence": [...],
    "contradicting_evidence": [...],
    "ruling_out_test": "..."
  }
]`;

  try {
    const response = await model.invoke(prompt);
    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in differential response");

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = DifferentialListSchema.parse(parsed);

    return { differentialDiagnoses: validated, currentNode: "differential", error: null };
  } catch (err) {
    console.error("Error in differentialNode:", err);
    return {
      differentialDiagnoses: [
        {
          rank: 1,
          diagnosis: patientData.chief_complaint || "Primary clinical presentation",
          likelihood: "Most Likely",
          supporting_evidence: ["Patient's primary reported complaint"],
          contradicting_evidence: [],
          ruling_out_test: "Complete clinical assessment and examination",
        },
      ],
      currentNode: "differential",
      error: null,
    };
  }
}
