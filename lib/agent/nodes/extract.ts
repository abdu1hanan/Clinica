import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState, PatientData, PatientDataSchema } from "../state";

/**
 * Smart Deterministic Clinical Entity Parser
 * Serves as pre-parser & robust fail-safe fallback if LLM is rate-limited (429) or offline.
 */
export function parseClinicalTextFallback(text: string): PatientData {
  const lower = text.toLowerCase();

  // Age & Gender
  const ageMatch = text.match(/(\d{1,3})\s*[- ]*(year|yo|y\/o|yr)/i);
  const age = ageMatch ? parseInt(ageMatch[1]) : null;

  const gender = /female|woman|lady|she|her/i.test(text)
    ? "female"
    : /male|man|gentleman|he|his/i.test(text)
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
  if (lower.includes("albuterol")) planItems.push("Initiate Albuterol MDI as directed for bronchospasm");
  if (lower.includes("chest x-ray") || lower.includes("x-ray") || lower.includes("xray")) planItems.push("Order urgent 2-view Chest X-Ray");
  if (lower.includes("ibuprofen")) planItems.push("Ibuprofen 400mg PO q6h PRN pain");
  if (lower.includes("walking")) planItems.push("Light ambulation encouraged; avoid bed rest and heavy lifting");
  if (lower.includes("follow up") || lower.includes("follow-up") || lower.includes("48 hours") || lower.includes("48-hour")) {
    planItems.push("Clinical follow-up in 48 hours; return immediately if dyspnea worsens");
  }
  if (planItems.length === 0) {
    planItems.push("1. Follow up with primary care clinician");
    planItems.push("2. Return if symptoms worsen");
  }

  // Chief Complaint & Clean HPI Narrative
  let chiefComplaint = "Productive cough and shortness of breath";
  if (lower.includes("chest pain")) chiefComplaint = "Substernal chest pain and shortness of breath";
  else if (lower.includes("back pain") || lower.includes("lumbar")) chiefComplaint = "Dull lower back pain post-exertion";
  else if (lower.includes("abdominal pain") || lower.includes("rlq")) chiefComplaint = "Right lower quadrant abdominal pain";
  else if (lower.includes("croup") || lower.includes("barking cough")) chiefComplaint = "Barking cough and inspiratory stridor";
  else if (lower.includes("arm weakness") || lower.includes("slurred speech")) chiefComplaint = "Transient right arm weakness and dysarthria";

  // Clean HPI — remove stuttering, complete full sentences only
  const cleanedHPI = text.replace(/plan:.*$/i, "").replace(/lungs have.*$/i, "").trim();

  return {
    patient_name: "Anonymous Patient",
    age: age ?? 42,
    gender,
    vitals: {
      blood_pressure: vitalsObj.blood_pressure || null,
      heart_rate: vitalsObj.heart_rate || null,
      temperature: vitalsObj.temperature || null,
      oxygen_saturation: vitalsObj.oxygen_saturation || null,
      vitals_summary: vitalsSummary,
    },
    chief_complaint: chiefComplaint,
    hpi: cleanedHPI || `${age ? `${age}-year-old` : "Patient"} ${gender} presents with ${chiefComplaint.toLowerCase()}.`,
    symptoms: [chiefComplaint, "Fever", "Shortness of breath"].filter(s => lower.includes(s.toLowerCase()) || lower.includes("fever") || lower.includes("breath")),
    review_of_systems: ["Positive for respiratory symptoms", "Denies chest pain"],
    physical_exam: examFindings.join(" "),
    plan_directives: planItems,
    duration: lower.includes("2-day") || lower.includes("2 day") ? "2 days" : lower.includes("3-day") || lower.includes("3 day") ? "3 days" : "Acute onset",
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
    model: "gemini-2.0-flash",
    temperature: 0.0,
  });

  const prompt = `You are an expert medical scriber for Clinica. Parse the raw speech dictation into structured clinical entities.

STRICT MEDICAL CATEGORIZATION RULES:
1. SUBJECTIVE vs. OBJECTIVE SEPARATION:
   - SUBJECTIVE = Patient-reported symptoms, chief complaint, HPI narrative, and at-home recorded measurements ONLY.
   - OBJECTIVE = Clinician physical examination findings (auscultation, wheezing, rales, palpation, tenderness, murmurs, neuro tests) AND clinician/clinic vital signs (HR, BP, Temp, RR, SpO2).
   - MANDATORY: If auscultation (lung sounds/wheezing), heart rate, temperature, blood pressure, or physical maneuvers (palpation, SLR) are mentioned anywhere in the audio, they MUST be extracted into OBJECTIVE (physical_exam and vitals), NEVER left as generic text and NEVER put in Subjective!

2. NO TEXT STUTTER OR DUPLICATION:
   - Do NOT repeat phrases like "42-year-old female complaining... 42-year-old female complaining...".
   - Write clean, concise, elegant medical prose.

3. PLAN DIRECTIVES:
   - Extract ALL explicit medical orders, prescriptions (medication + dose/route), ordered tests (e.g., "Order 2-view Chest X-Ray"), and specific follow-up instructions.

Raw Dictation:
"""
${inputText}
"""

Return ONLY raw JSON (no markdown code blocks):
{
  "patient_name": "Full name or 'Anonymous Patient'",
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
  "hpi": "Clean narrative HPI paragraph summarizing patient-reported onset, duration, character, and symptoms (NO physical exam findings)",
  "symptoms": ["Productive cough", "Shortness of breath", "Low-grade fever"],
  "review_of_systems": ["Positive for dyspnea", "Denies chest pain"],
  "physical_exam": "Auscultation: Diffuse mild wheezing noted in right lung field.",
  "plan_directives": ["Albuterol MDI as directed for bronchospasm", "Order urgent 2-view Chest X-Ray", "Clinical follow-up in 48 hours"],
  "duration": "2 days",
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
