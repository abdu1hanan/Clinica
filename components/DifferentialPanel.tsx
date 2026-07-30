"use client";

import { useState } from "react";
import { GitBranch, CheckCircle, XCircle, FlaskConical, Clock, User, ChevronRight } from "lucide-react";
import { DifferentialDiagnosis } from "@/lib/agent/state";
import { SessionRecord } from "@/lib/supabase/db";

interface DifferentialPanelProps {
  differentials: DifferentialDiagnosis[] | null;
  historySessions?: SessionRecord[];
}

const LIKELIHOOD_STYLE = {
  "Most Likely": { bg: "rgba(34,197,94,0.1)", border: "rgba(74,222,128,0.3)", text: "#4ade80", badge: "#16a34a" },
  "Possible": { bg: "rgba(59,130,246,0.1)", border: "rgba(96,165,250,0.3)", text: "#60a5fa", badge: "#2563eb" },
  "Less Likely": { bg: "#111113", border: "#242427", text: "#a1a1aa", badge: "#52525b" },
};

export function DifferentialPanel({ differentials, historySessions = [] }: DifferentialPanelProps) {
  const [selectedHistory, setSelectedHistory] = useState<SessionRecord | null>(null);

  const activeDiffs = selectedHistory?.differentials || differentials;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {/* Main Active Differentials Card */}
      <div className="card" style={{ overflow: "hidden", background: "#161618", border: "1px solid #242427" }}>
        <div>
          <div style={{
            padding: "14px 18px 10px", background: "#161618",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GitBranch style={{ width: 15, height: 15, color: "#c084fc" }} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                  Differential Diagnosis
                </span>
                <span style={{ fontSize: 11, color: "#71717a", marginLeft: 8 }}>
                  {selectedHistory ? `Showing history for ${selectedHistory.patient_name}` : "Ranked clinical likelihood analysis"}
                </span>
              </div>
            </div>

            {selectedHistory && (
              <button
                onClick={() => setSelectedHistory(null)}
                style={{ fontSize: 10, fontWeight: 600, color: "#2dd4bf", background: "#222226", border: "1px solid #333338", borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}
              >
                Reset to Current
              </button>
            )}
          </div>

          <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "0 18px 12px" }} />
        </div>

        {/* Content */}
        {!activeDiffs || activeDiffs.length === 0 ? (
          <div style={{ padding: 18 }}>
            <p style={{ fontSize: 11, color: "#52525b", margin: 0 }}>
              No differential diagnosis data available. Execute an intake encounter to generate ranked diagnostic differentials.
            </p>
          </div>
        ) : (
          <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            {activeDiffs.map((diff) => {
              const style = LIKELIHOOD_STYLE[diff.likelihood] ?? LIKELIHOOD_STYLE["Less Likely"];
              return (
                <div key={diff.rank} style={{
                  border: `1px solid ${style.border}`, borderRadius: 9,
                  background: style.bg, overflow: "hidden",
                }}>
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
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>{diff.diagnosis}</span>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                      padding: "2px 8px", borderRadius: 4, background: style.badge, color: "white",
                    }}>
                      {diff.likelihood}
                    </span>
                  </div>

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
                      background: "#111113", borderRadius: 6,
                      padding: "6px 10px", border: "1px solid #242427",
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
        )}
      </div>

      {/* Previous Differential Records History List Down Below */}
      {historySessions.length > 0 && (
        <div className="card" style={{ padding: 18, background: "#161618", border: "1px solid #242427", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock style={{ width: 14, height: 14, color: "#c084fc" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>Previous Diagnostic Records History</span>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "10px 0 12px" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {historySessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedHistory(s)}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8,
                  border: selectedHistory?.id === s.id ? "1px solid #c084fc" : "1px solid #242427",
                  background: selectedHistory?.id === s.id ? "rgba(192,132,252,0.12)" : "#111113",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <User style={{ width: 13, height: 13, color: "#71717a" }} />
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", display: "block" }}>
                      {s.patient_name || "Anonymous Patient"}
                    </span>
                    <span style={{ fontSize: 10, color: "#71717a", fontFamily: "'IBM Plex Mono', monospace" }}>
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#a1a1aa" }}>View Differential</span>
                  <ChevronRight style={{ width: 12, height: 12, color: "#71717a" }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
