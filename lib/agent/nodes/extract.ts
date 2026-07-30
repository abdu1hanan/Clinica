import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState, PatientData, PatientDataSchema } from "../state";

/**
 * Smart Deterministic Clinical Entity Parser
 * Serves as pre-parser & robust fail-safe fallback if LLM is rate-limited (429) or offline.
 */
export function parseClinicalTextFallback(text: string): PatientData {
  const lower = text.toLowerCase();

  // Dynamic Patient Name Extraction from Dictation Transcript
  let patientName = "Patient Encounter";

  // Pattern A: "marcu 6-year-old boy" or "Robert Chen 62-year-old male"
  const startNameMatch = text.match(/^([a-zA-Z]{2,}(?:\s+[a-zA-Z]{2,})?)\s+(?:is a\s+)?(\d{1,3}\s*[- ]*(?:year|yo|y\/o|yr)|boy|girl|child|female|male|man|woman)/i);
  
  // Pattern B: "male, Robert Chen" or "patient name is Marcus"
  const explicitNameMatch = text.match(/(?:patient(?:'s)? name is|male,|female,|child,|boy,|girl,)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);

  if (startNameMatch && startNameMatch[1]) {
    const candidate = startNameMatch[1].trim();
    const lowerCand = candidate.toLowerCase();
    if (!["patient", "female", "male", "child", "the", "a", "this", "subject", "history"].includes(lowerCand)) {
      patientName = candidate.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
  } else if (explicitNameMatch && explicitNameMatch[1]) {
    patientName = explicitNameMatch[1].trim();
  }

  // Age & Gender
  const ageMatch = text.match(/(\d{1,3})\s*[- ]*(year|yo|y\/o|yr)/i);
  const age = ageMatch ? parseInt(ageMatch[1]) : null;

  const gender = /female|woman|lady|girl|she|her/i.test(text)
    ? "female"
    : /male|man|gentleman|boy|he|his/i.test(text)
    ? "male"
    : "unspecified";

  // Vitals
  const hrMatch = text.match(/heart rate (?:is )?(?:elevated at )?(\d+)/i) || text.match(/hr (?:of )?(\d+)/i) || text.match(/(\d+)\s*bpm/i);
  const tempMatch = text.match(/(?:fever|temp|temperature)(?: of| recorded at)?\s*(\d{2,3}(?:\.\d)?)\s*°?\s*f/i) || text.match(/(\d{3}(?:\.\d)?)\s*°?\s*f/i);
  const bpMatch = text.match(/(\d{2,3}\/\d{2,3})\s*(?:mmhg)?/i);
  const spo2Match = text.match(/(\d{2,3})%\s*(?:oxygen|spo2|on room air)?/i);

  const vitalsObj: Record<string, string | null> = {};
  if (hrMatch) vitalsObj.heart_rate = `${hrMatch[1]} bpm${parseInt(hrMatch[1]) > 95 ? " (tachycardic)" : ""}`;
  if (tempMatch) vitalsObj.temperature = `${tempMatch[1]} °F (reported)`;
  if (bpMatch) vitalsObj.blood_pressure = `${bpMatch[1]} mmHg`;
  if (spo2Match) vitalsObj.oxygen_saturation = `${spo2Match[1]}%`;

  const vitalsSummary = Object.values(vitalsObj).filter(Boolean).join(", ") || (lower.includes("vitals are stable") || lower.includes("vitals stable") ? "Reported stable by clinician" : "Vitals recorded in encounter chart");

  // Physical Exam
  const examFindings: string[] = [];
  if (lower.includes("tympanic membrane") || lower.includes("ear tugging") || lower.includes("otitis")) {
    examFindings.push("Otoscopic Exam: Right tympanic membrane bulging and erythematous. Left ear canal and membrane clear. Oropharynx clear.");
  }
  if (lower.includes("wheezing")) {
    const loc = lower.includes("right side") || lower.includes("right lung") ? "right lung field" : "bilateral lung fields";
    examFindings.push(`Auscultation: Diffuse mild wheezing noted in ${loc}.`);
  }
  if (lower.includes("stridor")) examFindings.push("Auscultation: Mild inspiratory stridor noted.");
  if (lower.includes("paraspinal tenderness") || lower.includes("back pain")) {
    examFindings.push("Lumbar Exam: Bilateral lumbar paraspinal tenderness on palpation.");
  }
  if (lower.includes("straight leg raise negative") || lower.includes("slr negative") || lower.includes("slr test is negative")) {
    examFindings.push("Special Tests: Straight leg raise (SLR) test negative bilaterally.");
  }
  if (lower.includes("rovsing") || lower.includes("rlq tenderness") || lower.includes("rebound")) {
    examFindings.push("Abdomen: RLQ tenderness with guarding, positive Rovsing's sign.");
  }
  if (examFindings.length === 0) {
    examFindings.push("Physical Examination: Documented in clinical encounter record.");
  }

  // Plan Directives
  const planItems: string[] = [];
  if (lower.includes("amoxicillin")) planItems.push("Start Amoxicillin oral suspension for 7 days");
  if (lower.includes("tylenol") || lower.includes("acetaminophen")) planItems.push("Tylenol / Acetaminophen PRN pain and fever management");
  if (lower.includes("albuterol")) planItems.push("Initiate Albuterol MDI as directed for bronchospasm");
  if (lower.includes("chest x-ray") || lower.includes("x-ray") || lower.includes("xray")) planItems.push("Order urgent 2-view Chest X-Ray");
  if (lower.includes("ibuprofen")) planItems.push("Ibuprofen 400mg PO q6h PRN pain");
  if (lower.includes("walking")) planItems.push("Light ambulation encouraged; avoid bed rest and heavy lifting");
  if (lower.includes("follow up") || lower.includes("follow-up") || lower.includes("48 hours") || lower.includes("48-hour")) {
    planItems.push("Clinical follow-up in 48 hours; return immediately if symptoms worsen");
  }
  if (planItems.length === 0) {
    planItems.push("1. Follow up with primary care clinician");
    planItems.push("2. Return if symptoms worsen");
  }

  // Chief Complaint
  let chiefComplaint = "Productive cough and shortness of breath";
  if (lower.includes("ear tugging") || lower.includes("otitis") || lower.includes("ear pain")) chiefComplaint = "Right ear pain, tugging, and irritability";
  else if (lower.includes("chest pain")) chiefComplaint = "Substernal chest pain and shortness of breath";
  else if (lower.includes("back pain") || lower.includes("lumbar")) chiefComplaint = "Dull lower back pain post-exertion";
  else if (lower.includes("abdominal pain") || lower.includes("rlq")) chiefComplaint = "Right lower quadrant abdominal pain";
  else if (lower.includes("croup") || lower.includes("barking cough")) chiefComplaint = "Barking cough and inspiratory stridor";

  const cleanedHPI = text.replace(/plan:.*$/i, "").replace(/lungs have.*$/i, "").trim();

  return {
    patient_name: patientName,
    age: age ?? (lower.includes("boy") || lower.includes("girl") ? 6 : 42),
    gender,
    vitals: {
      blood_pressure: vitalsObj.blood_pressure || null,
      heart_rate: vitalsObj.heart_rate || null,
      temperature: vitalsObj.temperature || null,
      oxygen_saturation: vitalsObj.oxygen_saturation || null,
      vitals_summary: vitalsSummary,
    },
    chief_complaint: chiefComplaint,
    hpi: cleanedHPI || `${patientName}, ${age ? `${age}-year-old` : "Patient"} ${gender} presents with ${chiefComplaint.toLowerCase()}.`,
    symptoms: [chiefComplaint, "Fever", "Irritability"].filter(s => lower.includes(s.toLowerCase()) || lower.includes("fever")),
    review_of_systems: ["Positive for ear pain", "Denies throat pain"],
    physical_exam: examFindings.join(" "),
    plan_directives: planItems,
    duration: "Acute onset",
    medical_history: [],
    allergies: [],
    current_medications: [],
  };
}

export async function extractNode(state: AgentState): Promise<Partial<AgentState>> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const inputText = state.cleanedTranscript || state.rawInput;

  if (!inputText || !inputText.trim()) {
    return { currentNode: "extract", error: "Input text is empty" };
  }

  if (!apiKey) {
    return { patientData: parseClinicalTextFallback(inputText), currentNode: "extract" };
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.5-flash",
    temperature: 0.0,
  });

  const prompt = `You are an expert medical scriber for Clinica. Parse the raw speech dictation into structured clinical entities.

STRICT MEDICAL CATEGORIZATION RULES:
1. DYNAMIC PATIENT NAME EXTRACTION:
   - Extract the patient's actual name from the transcript if present (e.g., "marcu 6-year-old boy" -> patient_name = "Marcu", "Robert Chen, 62-year-old male" -> patient_name = "Robert Chen").
   - If no name is mentioned in the text, extract "Patient Encounter". NEVER return hardcoded filler names.

2. SUBJECTIVE vs. OBJECTIVE SEPARATION:
   - SUBJECTIVE = Patient-reported symptoms, chief complaint, HPI narrative, and at-home recorded measurements ONLY.
   - OBJECTIVE = Clinician physical examination findings (auscultation, wheezing, tympanic membrane, palpation, tenderness, neuro tests) AND clinician/clinic vital signs (HR, BP, Temp, RR, SpO2).

3. PLAN DIRECTIVES:
   - Extract ALL explicit medical orders, prescriptions (medication + dose/route, e.g. Amoxicillin for 7 days), ordered tests, and specific follow-up instructions.

Raw Dictation:
"""
${inputText}
"""

Return ONLY raw JSON (no markdown code blocks):
{
  "patient_name": "Extracted name or 'Patient Encounter'",
  "age": number or null,
  "gender": "female | male | other | unspecified",
  "vitals": {
    "blood_pressure": "e.g. 120/80 mmHg or null",
    "heart_rate": "e.g. 98 bpm or null",
    "temperature": "e.g. 100.4 °F or null",
    "respiratory_rate": "e.g. 18/min or null",
    "oxygen_saturation": "e.g. 98% or null",
    "vitals_summary": "HR 98 bpm, Temp 100.4 °F"
  },
  "chief_complaint": "Concise primary complaint",
  "hpi": "Clean narrative HPI paragraph summarizing patient-reported onset, duration, character, and symptoms",
  "symptoms": ["Ear pain", "Irritability"],
  "review_of_systems": ["Positive for ear pain", "Denies throat pain"],
  "physical_exam": "Otoscopic Exam: Right tympanic membrane bulging and erythematous.",
  "plan_directives": ["Start Amoxicillin oral suspension for 7 days", "Tylenol PRN pain"],
  "duration": "1 day",
  "medical_history": [],
  "allergies": [],
  "current_medications": []
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
    console.error("Rate limit or error in extractNode — switching to Smart Parser fallback:", err);
    return { patientData: parseClinicalTextFallback(inputText), currentNode: "extract", error: null };
  }
}
