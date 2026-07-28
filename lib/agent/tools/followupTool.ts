import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { PatientFollowUp } from "../state";

export const patientFollowUpTool = new DynamicStructuredTool({
  name: "patient_followup_drafter",
  description: "Converts clinical SOAP plan and assessment into a warm, empathetic, plain-language patient follow-up message with clear next steps.",
  schema: z.object({
    patient_name: z.string().describe("Name of the patient"),
    chief_complaint: z.string().describe("Chief complaint of the patient"),
    plan: z.string().describe("Clinical plan section from the SOAP note"),
    assessment: z.string().describe("Clinical assessment section from the SOAP note"),
    triage_level: z.enum(["HIGH", "MEDIUM", "LOW"]).describe("Risk level from triage scanner"),
  }),
  func: async ({ patient_name, chief_complaint, plan, assessment, triage_level }) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return JSON.stringify({
        subject: `Follow-up on your clinic visit — ${patient_name}`,
        body: `Dear ${patient_name},\n\nThank you for visiting Clinica today regarding your symptoms (${chief_complaint}).\n\nNext Steps:\n${plan}\n\nPlease reach out if your symptoms worsen.\n\nWarm regards,\nClinica Care Team`,
      });
    }

    const model = new ChatGoogleGenerativeAI({
      apiKey,
      model: "gemini-2.0-flash",
      temperature: 0.3,
    });

    const prompt = `You are a clinical care coordinator writing a post-visit follow-up message to a patient.
Convert the technical clinical assessment & plan into clear, empathetic, easy-to-understand instructions.

Patient Name: ${patient_name}
Chief Complaint: ${chief_complaint}
Triage Risk Level: ${triage_level}
Clinical Assessment: ${assessment}
Clinical Plan: ${plan}

Requirements:
1. Maintain an encouraging, warm, and professional tone.
2. Present key instructions and next steps as clear bullet points.
3. Avoid technical jargon.
4. If risk level is HIGH, include clear return precautions to seek immediate emergency care if symptoms worsen.
5. Return JSON with keys: "subject" and "body".`;

    try {
      const response = await model.invoke(prompt);
      const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as PatientFollowUp;
        return JSON.stringify(parsed);
      }

      return JSON.stringify({
        subject: `Summary of your visit today — ${patient_name}`,
        body: content,
      });
    } catch (err) {
      return JSON.stringify({
        subject: `Follow-Up Care Instructions for ${patient_name}`,
        body: `Dear ${patient_name},\n\nThank you for visiting Clinica today regarding ${chief_complaint}.\n\nBased on your assessment, please follow these instructions:\n\n${plan}\n\nIf you experience worsening symptoms, please contact our clinic immediately.\n\nSincerely,\nClinica Care Team`,
      });
    }
  },
});
