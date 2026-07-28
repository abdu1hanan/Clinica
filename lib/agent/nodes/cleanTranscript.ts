import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState } from "../state";

export async function cleanTranscriptNode(state: AgentState): Promise<Partial<AgentState>> {
  const rawInput = state.rawInput;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!rawInput || !rawInput.trim()) {
    return {
      currentNode: "cleanTranscript",
      cleanedTranscript: "",
      error: "Input clinical dictation is empty.",
    };
  }

  if (!apiKey) {
    return {
      currentNode: "cleanTranscript",
      cleanedTranscript: rawInput.trim(),
    };
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-2.0-flash",
    temperature: 0.0,
  });

  const prompt = `You are a clinical transcription processor. Clean up and format the following raw speech-to-text dictation into clear, professional medical text.

Tasks:
1. Fix obvious speech recognition errors (e.g. "blood pressure one twenty over eighty" -> "blood pressure 120/80 mmHg", "degree fahrenheit" -> "°F").
2. Standardize vital sign expressions and units.
3. Remove filler words (e.g., "um", "uh", "you know", "like") while retaining 100% of clinical facts, patient history, and symptoms.
4. Correct phonetically misspelled medical terms.
5. Retain original patient names, dates, and symptoms accurately.

Raw Dictation:
"""
${rawInput}
"""

Return ONLY the cleaned and formatted clinical text. Do not add conversational intro or explanation.`;

  try {
    const response = await model.invoke(prompt);
    const cleanedText = typeof response.content === "string" ? response.content.trim() : JSON.stringify(response.content).trim();

    return {
      currentNode: "cleanTranscript",
      cleanedTranscript: cleanedText || rawInput.trim(),
      error: null,
    };
  } catch (err) {
    console.error("Error in cleanTranscriptNode:", err);
    return {
      currentNode: "cleanTranscript",
      cleanedTranscript: rawInput.trim(),
      error: null,
    };
  }
}
