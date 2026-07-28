"use client";

import { CheckCircle2, Loader2, Circle, ShieldCheck } from "lucide-react";

export type PipelineStep =
  | "idle"
  | "cleanTranscript"
  | "extract"
  | "triage"
  | "soap"
  | "verifySoap"
  | "followup"
  | "completed"
  | "error";

interface AgentStatusBadgeProps {
  currentStep: PipelineStep;
}

const NODES = [
  { id: "cleanTranscript", label: "Transcript Formatting", desc: "Speech normalization" },
  { id: "extract", label: "Entity Extraction", desc: "Structured parsing" },
  { id: "triage", label: "Clinical Triage", desc: "Risk rule scanner" },
  { id: "soap", label: "SOAP Generation", desc: "Clinical documentation" },
  { id: "verifySoap", label: "Quality Verification", desc: "SOAP validation check" },
  { id: "followup", label: "Patient Care Summary", desc: "Care instruction draft" },
];

export function AgentStatusBadge({ currentStep }: AgentStatusBadgeProps) {
  if (currentStep === "idle") {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Clinical Processing Engine</span>
        </div>
        <p className="text-slate-500">6-stage state graph execution pipeline ready.</p>
      </div>
    );
  }

  const getStepStatus = (nodeId: string) => {
    const order = ["cleanTranscript", "extract", "triage", "soap", "verifySoap", "followup", "completed"];
    const currentIndex = order.indexOf(currentStep);
    const nodeIndex = order.indexOf(nodeId);

    if (currentStep === "error") return "error";
    if (currentStep === "completed" || nodeIndex < currentIndex) return "completed";
    if (nodeIndex === currentIndex) return "active";
    return "pending";
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-200">Execution Pipeline Status</span>
        {currentStep !== "completed" && currentStep !== "error" && (
          <span className="flex items-center gap-1.5 text-[11px] text-teal-400 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing pipeline...
          </span>
        )}
        {currentStep === "completed" && (
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pipeline Complete
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {NODES.map((node) => {
          const status = getStepStatus(node.id);
          return (
            <div
              key={node.id}
              className={`p-2.5 rounded-md border text-xs transition-all ${
                status === "completed"
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                  : status === "active"
                  ? "bg-teal-950/40 border-teal-500/60 text-teal-200 shadow-sm shadow-teal-900/30"
                  : "bg-slate-950/50 border-slate-800/60 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium mb-0.5">
                {status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                {status === "active" && <Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin shrink-0" />}
                {status === "pending" && <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                <span className="truncate">{node.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate pl-5">{node.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
