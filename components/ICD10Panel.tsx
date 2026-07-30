"use client";

import { useState } from "react";
import { Tag, Copy, Check, Clock, User, ChevronRight } from "lucide-react";
import { ICD10Suggestion } from "@/lib/agent/state";
import { SessionRecord } from "@/lib/supabase/db";

interface ICD10PanelProps {
  suggestions: ICD10Suggestion[] | null;
  historySessions?: SessionRecord[];
}

const CONFIDENCE_STYLE = {
  High: { bg: "rgba(34,197,94,0.1)", border: "rgba(74,222,128,0.3)", text: "#4ade80", dot: "#22c55e" },
  Moderate: { bg: "rgba(59,130,246,0.1)", border: "rgba(96,165,250,0.3)", text: "#60a5fa", dot: "#3b82f6" },
  Low: { bg: "#111113", border: "#242427", text: "#a1a1aa", dot: "#71717a" },
};

export function ICD10Panel({ suggestions, historySessions = [] }: ICD10PanelProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<SessionRecord | null>(null);

  const activeSuggestions = selectedHistory?.icd10 || suggestions;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const primary = activeSuggestions?.find(s => s.is_primary);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {/* Main Active ICD-10 Card */}
      <div className="card" style={{ overflow: "hidden", background: "#161618", border: "1px solid #242427" }}>
        <div>
          <div style={{
            padding: "14px 18px 10px", background: "#161618",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tag style={{ width: 15, height: 15, color: "#fbbf24" }} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>
                  ICD-10-CM Codes
                </span>
                <span style={{ fontSize: 11, color: "#71717a", marginLeft: 8 }}>
                  {selectedHistory ? `Showing history for ${selectedHistory.patient_name}` : "Suggested diagnostic codes"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {selectedHistory && (
                <button
                  onClick={() => setSelectedHistory(null)}
                  style={{ fontSize: 10, fontWeight: 600, color: "#2dd4bf", background: "#222226", border: "1px solid #333338", borderRadius: 6, padding: "3px 9px", cursor: "pointer" }}
                >
                  Reset to Current
                </button>
              )}
              {primary && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "3px 8px", borderRadius: 6,
                  background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", fontFamily: "'IBM Plex Mono', monospace" }}>
                    {primary.code}
                  </span>
                  <span style={{ fontSize: 9, color: "#fbbf24", opacity: 0.8 }}>Primary</span>
                </div>
              )}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "0 18px 12px" }} />
        </div>

        {/* Content */}
        {!activeSuggestions || activeSuggestions.length === 0 ? (
          <div style={{ padding: 18 }}>
            <p style={{ fontSize: 11, color: "#52525b", margin: 0 }}>
              No ICD-10 code suggestions available. Execute an intake encounter to generate diagnostic coding mappings.
            </p>
          </div>
        ) : (
          <div style={{ padding: "0 18px 18px" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "110px 1fr 90px 36px",
              padding: "6px 10px", marginBottom: 6,
              background: "#111113", borderRadius: 6, border: "1px solid #242427",
            }}>
              {["ICD-10 Code", "Description", "Confidence", ""].map(h => (
                <span key={h} className="section-label">{h}</span>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activeSuggestions.map((s) => {
                const sty = CONFIDENCE_STYLE[s.confidence] ?? CONFIDENCE_STYLE.Low;
                return (
                  <div key={s.code} style={{
                    display: "grid", gridTemplateColumns: "110px 1fr 90px 36px",
                    alignItems: "center",
                    padding: "8px 10px", borderRadius: 7,
                    border: s.is_primary ? `1px solid ${sty.border}` : "1px solid #242427",
                    background: s.is_primary ? sty.bg : "#111113",
                  }}>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700,
                      color: s.is_primary ? "#fbbf24" : "#ffffff",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      {s.is_primary && (
                        <span style={{
                          width: 5, height: 5, borderRadius: "50%", background: "#fbbf24", flexShrink: 0,
                        }} />
                      )}
                      {s.code}
                    </span>

                    <span style={{ fontSize: 11, color: "#a1a1aa", paddingRight: 8, lineHeight: 1.4 }}>
                      {s.description}
                      {s.is_primary && (
                        <span style={{
                          marginLeft: 6, fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                          padding: "1px 5px", borderRadius: 3, background: "#f59e0b", color: "#000000",
                        }}>
                          Primary
                        </span>
                      )}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: sty.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: sty.text }}>{s.confidence}</span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(s.code)}
                      title={`Copy ${s.code}`}
                      className="btn-raised"
                      style={{ width: 28, height: 28, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      {copiedCode === s.code
                        ? <Check style={{ width: 11, height: 11, color: "#4ade80" }} />
                        : <Copy style={{ width: 11, height: 11 }} />
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Previous ICD-10 Records History List Down Below */}
      {historySessions.length > 0 && (
        <div className="card" style={{ padding: 18, background: "#161618", border: "1px solid #242427", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock style={{ width: 14, height: 14, color: "#fbbf24" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>Previous ICD-10 Records History</span>
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
                  border: selectedHistory?.id === s.id ? "1px solid #fbbf24" : "1px solid #242427",
                  background: selectedHistory?.id === s.id ? "rgba(245,158,11,0.12)" : "#111113",
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
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#a1a1aa" }}>View ICD-10</span>
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
