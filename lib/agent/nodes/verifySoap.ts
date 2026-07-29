import { AgentState, ValidationStatus, SOAPNote, QualityScore } from "../state";

function scoreSOAP(soapNote: SOAPNote | null): QualityScore {
  if (!soapNote) return { completeness: 0, specificity: 0, reasoning_quality: 0, safety: 0, overall: 0 };

  const { subjective, objective, assessment, plan } = soapNote;

  // Completeness: all sections meaningfully populated
  const completeness = [subjective, objective, assessment, plan].reduce((score, section) => {
    if (!section || section.trim().length < 20) return score;
    if (section.includes("Not reported") && section.trim().length < 50) return score + 10;
    return score + 25;
  }, 0);

  // Specificity: concrete numbers, medications, named findings
  const fullText = `${subjective} ${objective} ${assessment} ${plan}`.toLowerCase();
  let specificity = 50;
  if (/\d+\s*(mg|mcg|ml|bpm|mmhg|%|°f|°c)/.test(fullText)) specificity += 20;
  if (/physical exam|palpation|auscultation|slr|rovsing|murphy/i.test(fullText)) specificity += 15;
  if (/icd|diagnosis|impression|consistent with/i.test(fullText)) specificity += 15;

  // Reasoning quality: assessment synthesizes beyond cc
  let reasoning_quality = 40;
  if (assessment.length > 100) reasoning_quality += 20;
  if (/secondary to|due to|consistent with|differential|likely|possible/i.test(assessment)) reasoning_quality += 25;
  if (/triage|risk|emergency|urgent/i.test(assessment)) reasoning_quality += 15;

  // Safety: plan has return precautions and actionable orders
  let safety = 40;
  if (/return|seek|emergency|worsen|precaution|red flag/i.test(plan)) safety += 30;
  if (/follow.?up|follow up/i.test(plan)) safety += 15;
  if (/\d\./i.test(plan)) safety += 15; // numbered orders

  const overall = Math.min(100, Math.round((completeness + Math.min(100, specificity) + Math.min(100, reasoning_quality) + Math.min(100, safety)) / 4));

  return {
    completeness: Math.min(100, completeness),
    specificity: Math.min(100, specificity),
    reasoning_quality: Math.min(100, reasoning_quality),
    safety: Math.min(100, safety),
    overall,
  };
}

export async function verifySoapNode(state: AgentState): Promise<Partial<AgentState>> {
  const soapNote = state.soapNote;
  const currentValidation = state.validationStatus ?? { isValid: true, errors: [], retryCount: 0 };
  const errors: string[] = [];

  if (!soapNote) {
    errors.push("SOAP note object is null");
  } else {
    if (!soapNote.subjective || soapNote.subjective.trim().length < 20) {
      errors.push("Subjective section is incomplete or missing");
    }
    if (!soapNote.objective || soapNote.objective.trim().length < 10) {
      errors.push("Objective section is incomplete or missing");
    }
    if (!soapNote.assessment || soapNote.assessment.trim().length < 20) {
      errors.push("Assessment section is incomplete or missing");
    }
    if (!soapNote.plan || soapNote.plan.trim().length < 20) {
      errors.push("Plan section is incomplete or missing");
    }
  }

  const isValid = errors.length === 0;
  const qualityScore = scoreSOAP(soapNote);

  const newValidationStatus: ValidationStatus = {
    isValid,
    errors,
    retryCount: isValid ? currentValidation.retryCount : currentValidation.retryCount + 1,
  };

  return {
    currentNode: "verifySoap",
    validationStatus: newValidationStatus,
    qualityScore,
  };
}
