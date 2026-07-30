"use client";

import { AlertTriangle, AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { TriageResult } from "@/lib/agent/state";

interface TriageBadgeProps {
  triageResult: TriageResult | null;
}

export function TriageBadge({ triageResult }: TriageBadgeProps) {
  if (!triageResult) {
    return (
      <div className="card" style={{ padding: 18, background: "#161618", border: "1px solid #242427", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldAlert style={{ width: 15, height: 15, color: "#2dd4bf" }} />
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", margin: 0 }}>Triage safety flags</h4>
                <p style={{ fontSize: 11, color: "#71717a", margin: 0 }}>Automated review of clinical risk signals</p>
              </div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#222226", color: "#a1a1aa" }}>Standby</span>
          </div>

          {/* Slightly visible white hr line */}
          <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "10px 0 12px" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, justifyContent: "center" }}>
          <div style={{ background: "#111113", border: "1px solid #242427", borderRadius: 8, padding: 10, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <AlertTriangle style={{ width: 14, height: 14, color: "#f87171", flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#ffffff" }}>Acute Risk Scanner Standby</span>
                <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: "rgba(239,68,68,0.2)", color: "#f87171" }}>Urgent</span>
              </div>
              <p style={{ fontSize: 10, color: "#71717a", margin: "2px 0 0" }}>Automated clinical risk rule engine ready to evaluate intake dictation.</p>
            </div>
          </div>

          <div style={{ background: "#111113", border: "1px solid #242427", borderRadius: 8, padding: 10, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <AlertCircle style={{ width: 14, height: 14, color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#ffffff" }}>Exacerbation Risk Protocol</span>
                <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: "rgba(245,158,11,0.2)", color: "#fbbf24" }}>Monitor</span>
              </div>
              <p style={{ fontSize: 10, color: "#71717a", margin: "2px 0 0" }}>Vitals and symptom flag triggers armed for evaluation.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { triage_level, flags, recommendation, confidence } = triageResult;

  const cfg = {
    HIGH: {
      badge: { background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)" },
      icon: <AlertTriangle style={{ width: 15, height: 15, color: "#f87171", flexShrink: 0 }} />,
      title: "HIGH CLINICAL RISK",
    },
    MEDIUM: {
      badge: { background: "rgba(245,158,11,0.2)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.4)" },
      icon: <AlertCircle style={{ width: 15, height: 15, color: "#fbbf24", flexShrink: 0 }} />,
      title: "MODERATE RISK",
    },
    LOW: {
      badge: { background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.4)" },
      icon: <CheckCircle style={{ width: 15, height: 15, color: "#4ade80", flexShrink: 0 }} />,
      title: "LOW ROUTINE RISK",
    },
  }[triage_level];

  return (
    <div className="card" style={{ padding: 18, background: "#161618", border: "1px solid #242427", height: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldAlert style={{ width: 15, height: 15, color: "#2dd4bf" }} />
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", margin: 0 }}>Triage safety flags</h4>
              <p style={{ fontSize: 11, color: "#71717a", margin: 0 }}>Automated review of clinical risk signals</p>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, ...cfg.badge }}>
            {triage_level} RISK ({confidence ?? 80}%)
          </span>
        </div>

        {/* Slightly visible white hr line */}
        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "10px 0 12px" }} />
      </div>

      <div style={{ background: "#111113", border: "1px solid #242427", borderRadius: 8, padding: 10 }}>
        <p style={{ fontSize: 11, color: "#e4e4e7", margin: 0, lineHeight: 1.5 }}>
          {recommendation}
        </p>
      </div>

      {flags && flags.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {flags.map((flag, idx) => (
            <div key={idx} style={{
              background: "#111113", border: "1px solid #242427", borderRadius: 8,
              padding: 10, display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              {cfg.icon}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#ffffff", textTransform: "capitalize" }}>
                    {flag.symptom.length > 45 ? flag.symptom.slice(0, 45) + "..." : flag.symptom}
                  </span>
                  <span style={{
                    fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                    background: flag.level === "HIGH" ? "rgba(239,68,68,0.2)" : flag.level === "MEDIUM" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)",
                    color: flag.level === "HIGH" ? "#f87171" : flag.level === "MEDIUM" ? "#fbbf24" : "#4ade80",
                  }}>
                    {flag.level === "HIGH" ? "Urgent" : flag.level === "MEDIUM" ? "Monitor" : "Cleared"}
                  </span>
                </div>
                <p style={{ fontSize: 10, color: "#a1a1aa", margin: "2px 0 0", lineHeight: 1.4 }}>
                  {flag.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
