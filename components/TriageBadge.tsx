"use client";

import { AlertTriangle, AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { TriageResult } from "@/lib/agent/state";

interface TriageBadgeProps {
  triageResult: TriageResult | null;
}

export function TriageBadge({ triageResult }: TriageBadgeProps) {
  if (!triageResult) return null;

  const { triage_level, flags, recommendation, confidence } = triageResult;

  const cfg = {
    HIGH: {
      container: { background: "linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)", border: "1px solid #fca5a5", boxShadow: "0 2px 8px rgba(220,38,38,0.1), inset 0 1px 0 rgba(255,255,255,0.8)" },
      badge: { background: "#dc2626", color: "white", boxShadow: "0 1px 3px rgba(220,38,38,0.4)" },
      icon: <AlertTriangle style={{ width: 18, height: 18, color: "#dc2626", flexShrink: 0 }} />,
      title: "HIGH CLINICAL RISK SEVERITY",
      titleColor: "#7f1d1d",
      subColor: "#991b1b",
      barColor: "#dc2626",
    },
    MEDIUM: {
      container: { background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", border: "1px solid #fcd34d", boxShadow: "0 2px 8px rgba(217,119,6,0.1), inset 0 1px 0 rgba(255,255,255,0.8)" },
      badge: { background: "#d97706", color: "white", boxShadow: "0 1px 3px rgba(217,119,6,0.4)" },
      icon: <AlertCircle style={{ width: 18, height: 18, color: "#d97706", flexShrink: 0 }} />,
      title: "MODERATE CLINICAL RISK",
      titleColor: "#78350f",
      subColor: "#92400e",
      barColor: "#d97706",
    },
    LOW: {
      container: { background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid #86efac", boxShadow: "0 2px 8px rgba(22,163,74,0.08), inset 0 1px 0 rgba(255,255,255,0.8)" },
      badge: { background: "#16a34a", color: "white", boxShadow: "0 1px 3px rgba(22,163,74,0.4)" },
      icon: <CheckCircle style={{ width: 18, height: 18, color: "#16a34a", flexShrink: 0 }} />,
      title: "LOW ROUTINE CLINICAL RISK",
      titleColor: "#14532d",
      subColor: "#166534",
      barColor: "#16a34a",
    },
  }[triage_level];

  const conf = confidence ?? 80;

  return (
    <div style={{ borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12, ...cfg.container }}>
      {/* Header Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {cfg.icon}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", color: cfg.titleColor, margin: 0, textTransform: "uppercase" }}>
              {cfg.title}
            </h4>
            <p style={{ fontSize: 10, color: cfg.subColor, margin: 0, opacity: 0.8 }}>
              Clinical Safety Rule Engine — Deterministic Evaluation
            </p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", ...cfg.badge }}>
            {triage_level} RISK
          </span>
          <span style={{ fontSize: 9, fontWeight: 600, color: cfg.subColor, opacity: 0.8 }}>
            {conf}% Confidence
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cfg.subColor }}>
            Triage Confidence
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color: cfg.subColor }}>{conf}%</span>
        </div>
        <div className="quality-bar-track">
          <div className="quality-bar-fill" style={{ width: `${conf}%`, background: cfg.barColor }} />
        </div>
      </div>

      {/* Recommendation */}
      <div style={{
        background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "10px 12px",
        border: "1px solid rgba(255,255,255,0.9)", backdropFilter: "blur(4px)",
      }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: cfg.titleColor, margin: 0, lineHeight: 1.5 }}>
          {recommendation}
        </p>
      </div>

      {/* Red Flags */}
      {flags && flags.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
            <ShieldAlert style={{ width: 12, height: 12, color: cfg.subColor }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cfg.subColor }}>
              Clinical Red Flags Identified ({flags.length})
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {flags.map((flag, idx) => (
              <div key={idx} style={{
                background: "rgba(255,255,255,0.8)", borderRadius: 7, padding: "8px 10px",
                border: "1px solid rgba(255,255,255,0.9)",
                display: "flex", gap: 8, alignItems: "flex-start",
              }}>
                <span style={{
                  flexShrink: 0, padding: "1px 6px", borderRadius: 3, fontSize: 8, fontWeight: 800,
                  textTransform: "uppercase", marginTop: 1, letterSpacing: "0.06em",
                  background: flag.level === "HIGH" ? "#dc2626" : flag.level === "MEDIUM" ? "#d97706" : "#16a34a",
                  color: "white",
                }}>
                  {flag.level}
                </span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: cfg.titleColor, margin: 0, textTransform: "capitalize" }}>
                    {flag.symptom.length > 60 ? flag.symptom.slice(0, 60) + "..." : flag.symptom}
                  </p>
                  <p style={{ fontSize: 10, color: cfg.subColor, margin: "2px 0 0", lineHeight: 1.4, opacity: 0.9 }}>
                    {flag.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
