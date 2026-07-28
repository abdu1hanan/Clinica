import { AgentState, TriageResult, TriageResultSchema } from "../state";
import { clinicalTriageTool } from "../tools/triageTool";

export async function triageNode(state: AgentState): Promise<Partial<AgentState>> {
  const patientData = state.patientData;

  if (!patientData) {
    return {
      currentNode: "triage",
      error: "Missing patientData in state",
    };
  }

  try {
    const rawToolOutput = await clinicalTriageTool.invoke({
      symptoms: patientData.symptoms ?? [],
      chief_complaint: patientData.chief_complaint ?? "",
      vitals: patientData.vitals ?? {},
    });

    const parsedJson = JSON.parse(rawToolOutput);
    const triageResult = TriageResultSchema.parse(parsedJson);

    return {
      triageResult,
      currentNode: "triage",
      error: null,
    };
  } catch (err: any) {
    console.error("Error in triageNode:", err);
    const fallbackTriage: TriageResult = {
      triage_level: "LOW",
      flags: [],
      recommendation: "Routine clinical assessment recommended.",
    };
    return {
      triageResult: fallbackTriage,
      currentNode: "triage",
      error: null,
    };
  }
}
