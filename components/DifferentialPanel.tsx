"use client";

import { GitBranch, CheckCircle, XCircle, FlaskConical } from "lucide-react";
import { DifferentialDiagnosis } from "@/lib/agent/state";

interface DifferentialPanelProps {
  differentials: DifferentialDiagnosis[] | null;
}

const LIKELIHOOD_STYLE = {
  "Most Likely": { bg: "rgba(34,197,94,0.1)", border: "rgba(74,222,128,0.3)", text: "#4ade80", badge: "#16a34a" },
  "Possible": { bg: "rgba(59,130,246,0.1)", border: "rgba(96,165,250,0.3)", text: "#60a5fa", badge: "#2563eb" },
  "Less Likely": { bg: "#121215", border: "#27272a", text: "#a1a1aa", badge: "#52525b" },
};

export function DifferentialPanel({ differentials }: DifferentialPanelProps) {
  if (!differentials || differentials.length === 0) {
    return (
      <div className="card" style={{ padding: 18, background: "#18181b", border: "1px solid #27272a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <GitBranch style={{ width: 15, height: 15, color: "#c084fc" }} />
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>Differential Diagnosis</h4>
        </div>
        <p style={{ fontSize: 11, color: "#52525b", margin: 0 }}>
          No differential diagnosis data available. Execute an intake encounter to generate ranked diagnostic differentials.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: "hidden", background: "#18181b", border: "1px solid #27272a" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #27272a",
        background: "#18181b",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <GitBranch style={{ width: 15, height: 15, color: "#c084fc" }} />
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5" }}>
            Differential Diagnosis
          </span>
          <span style={{ fontSize: 11, color: "#71717a", marginLeft: 8 }}>
            Ranked clinical likelihood analysis
          </span>
        </div>
      </div>

      {/* Differentials */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {differentials.map((diff) => {
          const style = LIKELIHOOD_STYLE[diff.likelihood] ?? LIKELIHOOD_STYLE["Less Likely"];
          return (
            <div key={diff.rank} style={{
              border: `1px solid ${style.border}`, borderRadius: 9,
              background: style.bg, overflow: "hidden",
            }}>
              {/* Dx Header */}
              <div style={{
                padding: "8px 12px",
                borderBottom: `1px solid ${style.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: style.badge, color: "white",
                    fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{diff.rank}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f4f4f5" }}>{diff.diagnosis}</span>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "2px 8px", borderRadius: 4, background: style.badge, color: "white",
                }}>
                  {diff.likelihood}
                </span>
              </div>

              {/* Evidence */}
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                {diff.supporting_evidence.length > 0 && (
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4ade80", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                      <CheckCircle style={{ width: 10, height: 10 }} /> Supporting Evidence
                    </span>
                    <div style={{ paddingLeft: 14, display: "flex", flexDirection: "column", gap: 2 }}>
                      {diff.supporting_evidence.map((e, i) => (
                        <p key={i} style={{ fontSize: 11, color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>• {e}</p>
                      ))}
                    </div>
                  </div>
                )}

                {diff.contradicting_evidence.length > 0 && (
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fbbf24", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                      <XCircle style={{ width: 10, height: 10 }} /> Against
                    </span>
                    <div style={{ paddingLeft: 14, display: "flex", flexDirection: "column", gap: 2 }}>
                      {diff.contradicting_evidence.map((e, i) => (
                        <p key={i} style={{ fontSize: 11, color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>• {e}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 6,
                  background: "#121215", borderRadius: 6,
                  padding: "6px 10px", border: "1px solid #27272a",
                }}>
                  <FlaskConical style={{ width: 11, height: 11, color: "#c084fc", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#c084fc" }}>
                      Rule-Out Test
                    </span>
                    <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0 }}>{diff.ruling_out_test}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
