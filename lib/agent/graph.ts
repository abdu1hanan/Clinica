import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentStateAnnotation, AgentState } from "./state";
import { cleanTranscriptNode } from "./nodes/cleanTranscript";
import { extractNode } from "./nodes/extract";
import { triageNode } from "./nodes/triage";
import { soapNode } from "./nodes/soap";
import { verifySoapNode } from "./nodes/verifySoap";
import { followupNode } from "./nodes/followup";

function routeAfterVerification(state: AgentState): string {
  const status = state.validationStatus;
  if (!status || status.isValid || status.retryCount >= 2) {
    return "followup";
  }
  return "soap";
}

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("cleanTranscript", cleanTranscriptNode)
  .addNode("extract", extractNode)
  .addNode("triage", triageNode)
  .addNode("soap", soapNode)
  .addNode("verifySoap", verifySoapNode)
  .addNode("followup", followupNode)

  .addEdge(START, "cleanTranscript")
  .addEdge("cleanTranscript", "extract")
  .addEdge("extract", "triage")
  .addEdge("triage", "soap")
  .addEdge("soap", "verifySoap")
  .addConditionalEdges("verifySoap", routeAfterVerification, {
    followup: "followup",
    soap: "soap",
  })
  .addEdge("followup", END);

export const clinicaAgentGraph = workflow.compile();
