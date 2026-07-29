import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentStateAnnotation, AgentState } from "./state";
import { cleanTranscriptNode } from "./nodes/cleanTranscript";
import { extractNode } from "./nodes/extract";
import { differentialNode } from "./nodes/differential";
import { triageNode } from "./nodes/triage";
import { soapNode } from "./nodes/soap";
import { verifySoapNode } from "./nodes/verifySoap";
import { icd10Node } from "./nodes/icd10";
import { followupNode } from "./nodes/followup";

function routeAfterVerification(state: AgentState): string {
  const status = state.validationStatus;
  if (!status || status.isValid || status.retryCount >= 2) {
    return "icd10";
  }
  return "soap";
}

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("cleanTranscript", cleanTranscriptNode)
  .addNode("extract", extractNode)
  .addNode("differential", differentialNode)
  .addNode("triage", triageNode)
  .addNode("soap", soapNode)
  .addNode("verifySoap", verifySoapNode)
  .addNode("icd10", icd10Node)
  .addNode("followup", followupNode)

  .addEdge(START, "cleanTranscript")
  .addEdge("cleanTranscript", "extract")
  .addEdge("extract", "differential")
  .addEdge("differential", "triage")
  .addEdge("triage", "soap")
  .addEdge("soap", "verifySoap")
  .addConditionalEdges("verifySoap", routeAfterVerification, {
    icd10: "icd10",
    soap: "soap",
  })
  .addEdge("icd10", "followup")
  .addEdge("followup", END);

export const clinicaAgentGraph = workflow.compile();
