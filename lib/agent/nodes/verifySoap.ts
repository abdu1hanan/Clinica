import { AgentState, ValidationStatus } from "../state";

export async function verifySoapNode(state: AgentState): Promise<Partial<AgentState>> {
  const soapNote = state.soapNote;
  const currentValidation = state.validationStatus ?? { isValid: true, errors: [], retryCount: 0 };
  const errors: string[] = [];

  if (!soapNote) {
    errors.push("SOAP note object is null");
  } else {
    if (!soapNote.subjective || soapNote.subjective.trim().length < 10) {
      errors.push("Subjective section is incomplete or missing");
    }
    if (!soapNote.objective || soapNote.objective.trim().length < 5) {
      errors.push("Objective section is incomplete or missing");
    }
    if (!soapNote.assessment || soapNote.assessment.trim().length < 10) {
      errors.push("Assessment section is incomplete or missing");
    }
    if (!soapNote.plan || soapNote.plan.trim().length < 10) {
      errors.push("Plan section is incomplete or missing");
    }
  }

  const isValid = errors.length === 0;

  const newValidationStatus: ValidationStatus = {
    isValid,
    errors,
    retryCount: isValid ? currentValidation.retryCount : currentValidation.retryCount + 1,
  };

  return {
    currentNode: "verifySoap",
    validationStatus: newValidationStatus,
  };
}
