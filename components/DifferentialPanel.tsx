"use client";

import { GitBranch, CheckCircle, XCircle, FlaskConical } from "lucide-react";
import { DifferentialDiagnosis } from "@/lib/agent/state";

interface DifferentialPanelProps {
  differentials: DifferentialDiagnosis[] | null;
}

const LIKELIHOOD_STYLE = {
  "Most Likely": { bg: "#f0fdf4", border: "#86efac", text: "#14532d", badge: "#16a34a" },
  "Possible": { bg: "#eff6ff", border: "#93c5fd", text: "#1e3a5f", badge: "#2563eb" },
  "Less Likely": { bg: "var(--bg-subtle)", border: "var(--border-light)", text: "var(--text-secondary)", badge: "var(--text-muted)" },
};

export function DifferentialPanel({ differentials }: DifferentialPanelProps) {
  if (!differentials || differentials.length === 0) return null;

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid var(--border-light)",
        background: "var(--bg-subtle)", boxShadow: "0 1px 0 rgba(255,255,255,0.8)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <GitBranch style={{ width: 14, height: 14, color: "var(--purple-mid)" }} />
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>
            Differential Diagnosis
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 8 }}>
            Ranked clinical likelihood analysis
          </span>
        </div>
      </div>

      {/* Differentials */}
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {differentials.map((diff) => {
          const style = LIKELIHOOD_STYLE[diff.likelihood] ?? LIKELIHOOD_STYLE["Less Likely"];
          return (
            <div key={diff.rank} style={{
              border: `1px solid ${style.border}`, borderRadius: 9,
              background: style.bg, overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
                  <span style={{ fontSize: 12, fontWeight: 700, color: style.text }}>{diff.diagnosis}</span>
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
                {/* Supporting */}
                {diff.supporting_evidence.length > 0 && (
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#166534", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                      <CheckCircle style={{ width: 10, height: 10 }} /> Supporting Evidence
                    </span>
                    <div style={{ paddingLeft: 14, display: "flex", flexDirection: "column", gap: 2 }}>
                      {diff.supporting_evidence.map((e, i) => (
                        <p key={i} style={{ fontSize: 11, color: "#166534", margin: 0, lineHeight: 1.5 }}>• {e}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contradicting */}
                {diff.contradicting_evidence.length > 0 && (
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#92400e", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                      <XCircle style={{ width: 10, height: 10 }} /> Against
                    </span>
                    <div style={{ paddingLeft: 14, display: "flex", flexDirection: "column", gap: 2 }}>
                      {diff.contradicting_evidence.map((e, i) => (
                        <p key={i} style={{ fontSize: 11, color: "#92400e", margin: 0, lineHeight: 1.5 }}>• {e}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ruling Out Test */}
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 6,
                  background: "rgba(255,255,255,0.7)", borderRadius: 6,
                  padding: "6px 10px", border: "1px solid rgba(255,255,255,0.9)",
                }}>
                  <FlaskConical style={{ width: 11, height: 11, color: "var(--purple-mid)", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--purple-dark)" }}>
                      Rule-Out Test
                    </span>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{diff.ruling_out_test}</p>
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
