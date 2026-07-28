import { AgentState, PatientFollowUp, PatientFollowUpSchema } from "../state";
import { patientFollowUpTool } from "../tools/followupTool";

export async function followupNode(state: AgentState): Promise<Partial<AgentState>> {
  const patientData = state.patientData;
  const soapNote = state.soapNote;
  const triageResult = state.triageResult;

  if (!patientData || !soapNote) {
    return {
      currentNode: "followup",
      error: "Missing patientData or soapNote for follow-up draft",
    };
  }

  try {
    const rawToolOutput = await patientFollowUpTool.invoke({
      patient_name: patientData.patient_name ?? "Patient",
      chief_complaint: patientData.chief_complaint ?? "clinic visit",
      plan: soapNote.plan ?? "",
      assessment: soapNote.assessment ?? "",
      triage_level: triageResult?.triage_level ?? "LOW",
    });

    const parsedJson = JSON.parse(rawToolOutput);
    const validatedFollowUp = PatientFollowUpSchema.parse(parsedJson);

    return {
      followUp: validatedFollowUp,
      currentNode: "followup",
      error: null,
    };
  } catch (err: any) {
    console.error("Error in followupNode:", err);
    const fallbackFollowUp: PatientFollowUp = {
      subject: `Summary of your visit — Clinica`,
      body: `Dear ${patientData.patient_name},\n\nThank you for visiting us today. Please follow these guidelines:\n\n${soapNote.plan}\n\nWarmly,\nClinica Team`,
    };
    return {
      followUp: fallbackFollowUp,
      currentNode: "followup",
      error: null,
    };
  }
}
