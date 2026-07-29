"use client";

import { useState } from "react";
import { Tag, Copy, Check } from "lucide-react";
import { ICD10Suggestion } from "@/lib/agent/state";

interface ICD10PanelProps {
  suggestions: ICD10Suggestion[] | null;
}

const CONFIDENCE_STYLE = {
  High: { bg: "#f0fdf4", border: "#86efac", text: "#166534", dot: "#16a34a" },
  Moderate: { bg: "#eff6ff", border: "#93c5fd", text: "#1e40af", dot: "#2563eb" },
  Low: { bg: "var(--bg-subtle)", border: "var(--border-light)", text: "var(--text-secondary)", dot: "var(--text-muted)" },
};

export function ICD10Panel({ suggestions }: ICD10PanelProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!suggestions || suggestions.length === 0) return null;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const primary = suggestions.find(s => s.is_primary);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid var(--border-light)",
        background: "var(--bg-subtle)", boxShadow: "0 1px 0 rgba(255,255,255,0.8)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag style={{ width: 14, height: 14, color: "var(--amber-mid)" }} />
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>
              ICD-10-CM Codes
            </span>
            <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 8 }}>
              Suggested diagnostic codes
            </span>
          </div>
        </div>
        {primary && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 6,
            background: "var(--amber-bg)", border: "1px solid var(--amber-border)",
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--amber-dark)", fontFamily: "'IBM Plex Mono', monospace" }}>
              {primary.code}
            </span>
            <span style={{ fontSize: 9, color: "var(--amber-dark)", opacity: 0.8 }}>Primary</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ padding: 14 }}>
        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "100px 1fr 90px 36px",
          padding: "5px 10px", marginBottom: 4,
          background: "var(--bg-inset)", borderRadius: 6,
        }}>
          {["ICD-10 Code", "Description", "Confidence", ""].map(h => (
            <span key={h} className="section-label">{h}</span>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {suggestions.map((s) => {
            const sty = CONFIDENCE_STYLE[s.confidence] ?? CONFIDENCE_STYLE.Low;
            return (
              <div key={s.code} style={{
                display: "grid", gridTemplateColumns: "100px 1fr 90px 36px",
                alignItems: "center",
                padding: "8px 10px", borderRadius: 7,
                border: s.is_primary ? `1px solid ${sty.border}` : "1px solid var(--border-light)",
                background: s.is_primary ? sty.bg : "white",
                boxShadow: s.is_primary ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}>
                {/* Code */}
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700,
                  color: s.is_primary ? "var(--amber-dark)" : "var(--text-secondary)",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {s.is_primary && (
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%", background: "var(--amber-mid)", flexShrink: 0,
                    }} />
                  )}
                  {s.code}
                </span>

                {/* Description */}
                <span style={{ fontSize: 11, color: "var(--text-secondary)", paddingRight: 8, lineHeight: 1.4 }}>
                  {s.description}
                  {s.is_primary && (
                    <span style={{
                      marginLeft: 6, fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                      padding: "1px 5px", borderRadius: 3, background: "var(--amber-mid)", color: "white",
                    }}>
                      Primary
                    </span>
                  )}
                </span>

                {/* Confidence */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: sty.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: sty.text }}>{s.confidence}</span>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => handleCopyCode(s.code)}
                  title={`Copy ${s.code}`}
                  className="btn-raised"
                  style={{ width: 28, height: 28, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {copiedCode === s.code
                    ? <Check style={{ width: 11, height: 11, color: "var(--green-mid)" }} />
                    : <Copy style={{ width: 11, height: 11 }} />
                  }
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 9, color: "var(--text-placeholder)", marginTop: 10, marginBottom: 0 }}>
          ICD-10-CM codes are AI-suggested for documentation assistance only. All codes must be verified by a certified medical coder before clinical or billing use.
        </p>
      </div>
    </div>
  );
}
