"use client";

import { CheckCircle2, Loader2, Circle, ShieldCheck } from "lucide-react";

export type PipelineStep =
  | "idle"
  | "cleanTranscript"
  | "extract"
  | "differential"
  | "triage"
  | "soap"
  | "verifySoap"
  | "icd10"
  | "followup"
  | "completed"
  | "error";

interface AgentStatusBadgeProps {
  currentStep: PipelineStep;
}

const NODES = [
  { id: "cleanTranscript", label: "Transcript Formatting", desc: "Normalize speech output" },
  { id: "extract", label: "Clinical Entity Extraction", desc: "HPI, ROS, physical exam" },
  { id: "differential", label: "Differential Diagnosis", desc: "Ranked clinical DDx" },
  { id: "triage", label: "Safety Triage Scanner", desc: "Risk rule evaluation" },
  { id: "soap", label: "SOAP Synthesis", desc: "Formal EMR documentation" },
  { id: "verifySoap", label: "Quality Verification", desc: "Completeness & scoring" },
  { id: "icd10", label: "ICD-10 Coding", desc: "Diagnostic code mapping" },
  { id: "followup", label: "Patient Care Summary", desc: "Plain-language instructions" },
];

export function AgentStatusBadge({ currentStep }: AgentStatusBadgeProps) {
  if (currentStep === "idle") {
    return (
      <div className="card" style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck style={{ width: 15, height: 15, color: "var(--teal-mid)" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
            8-Stage Clinical Processing Engine
          </span>
        </div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
          Pipeline ready. Enter clinical dictation to begin processing.
        </p>
      </div>
    );
  }

  const order = ["cleanTranscript", "extract", "differential", "triage", "soap", "verifySoap", "icd10", "followup", "completed"];

  const getStatus = (nodeId: string) => {
    if (currentStep === "error") return "error";
    const ci = order.indexOf(currentStep);
    const ni = order.indexOf(nodeId);
    if (currentStep === "completed" || ni < ci) return "completed";
    if (ni === ci) return "active";
    return "pending";
  };

  const completedCount = NODES.filter(n => getStatus(n.id) === "completed").length;
  const activeNode = NODES.find(n => getStatus(n.id) === "active");

  return (
    <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Pipeline Execution Status
        </span>
        {currentStep === "completed" ? (
          <span style={{ fontSize: 11, color: "var(--green-dark)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <CheckCircle2 style={{ width: 13, height: 13 }} /> All Stages Complete
          </span>
        ) : currentStep !== "error" && (
          <span style={{ fontSize: 11, color: "var(--teal-dark)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
            <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />
            {activeNode?.desc ?? "Processing..."}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="quality-bar-track">
        <div
          className="quality-bar-fill"
          style={{
            width: `${currentStep === "completed" ? 100 : (completedCount / NODES.length) * 100}%`,
            background: "linear-gradient(90deg, var(--teal-dark), var(--teal-mid))",
          }}
        />
      </div>

      {/* Node grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {NODES.map((node) => {
          const status = getStatus(node.id);
          return (
            <div
              key={node.id}
              style={{
                padding: "7px 10px",
                borderRadius: 7,
                border: "1px solid",
                fontSize: 11,
                transition: "all 0.2s",
                ...(status === "completed" ? {
                  background: "var(--green-bg)",
                  borderColor: "var(--green-border)",
                  color: "var(--green-dark)",
                } : status === "active" ? {
                  background: "var(--teal-bg)",
                  borderColor: "var(--teal-border)",
                  color: "var(--teal-dark)",
                  boxShadow: "0 0 0 2px rgba(13,148,136,0.12)",
                } : {
                  background: "var(--bg-subtle)",
                  borderColor: "var(--border-light)",
                  color: "var(--text-muted)",
                }),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                {status === "completed" && <CheckCircle2 style={{ width: 11, height: 11, flexShrink: 0 }} />}
                {status === "active" && <Loader2 style={{ width: 11, height: 11, flexShrink: 0 }} className="animate-spin" />}
                {(status === "pending" || status === "error") && <Circle style={{ width: 11, height: 11, flexShrink: 0 }} />}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.label}</span>
              </div>
              <p style={{ fontSize: 10, opacity: 0.7, marginTop: 1, marginBottom: 0, paddingLeft: 17, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {node.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
