"use client";

import { useState } from "react";
import { Tag, Copy, Check } from "lucide-react";
import { ICD10Suggestion } from "@/lib/agent/state";

interface ICD10PanelProps {
  suggestions: ICD10Suggestion[] | null;
}

const CONFIDENCE_STYLE = {
  High: { bg: "rgba(34,197,94,0.1)", border: "rgba(74,222,128,0.3)", text: "#4ade80", dot: "#22c55e" },
  Moderate: { bg: "rgba(59,130,246,0.1)", border: "rgba(96,165,250,0.3)", text: "#60a5fa", dot: "#3b82f6" },
  Low: { bg: "#121215", border: "#27272a", text: "#a1a1aa", dot: "#71717a" },
};

export function ICD10Panel({ suggestions }: ICD10PanelProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="card" style={{ padding: 18, background: "#18181b", border: "1px solid #27272a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Tag style={{ width: 15, height: 15, color: "#fbbf24" }} />
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>ICD-10-CM Codes</h4>
        </div>
        <p style={{ fontSize: 11, color: "#52525b", margin: 0 }}>
          No ICD-10 code suggestions available. Execute an intake encounter to generate diagnostic coding mappings.
        </p>
      </div>
    );
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const primary = suggestions.find(s => s.is_primary);

  return (
    <div className="card" style={{ overflow: "hidden", background: "#18181b", border: "1px solid #27272a" }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #27272a",
        background: "#18181b",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag style={{ width: 15, height: 15, color: "#fbbf24" }} />
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5" }}>
              ICD-10-CM Codes
            </span>
            <span style={{ fontSize: 11, color: "#71717a", marginLeft: 8 }}>
              Suggested diagnostic codes
            </span>
          </div>
        </div>
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

      {/* Table */}
      <div style={{ padding: 16 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "110px 1fr 90px 36px",
          padding: "6px 10px", marginBottom: 6,
          background: "#121215", borderRadius: 6, border: "1px solid #27272a",
        }}>
          {["ICD-10 Code", "Description", "Confidence", ""].map(h => (
            <span key={h} className="section-label">{h}</span>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {suggestions.map((s) => {
            const sty = CONFIDENCE_STYLE[s.confidence] ?? CONFIDENCE_STYLE.Low;
            return (
              <div key={s.code} style={{
                display: "grid", gridTemplateColumns: "110px 1fr 90px 36px",
                alignItems: "center",
                padding: "8px 10px", borderRadius: 7,
                border: s.is_primary ? `1px solid ${sty.border}` : "1px solid #27272a",
                background: s.is_primary ? sty.bg : "#121215",
              }}>
                {/* Code */}
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700,
                  color: s.is_primary ? "#fbbf24" : "#f4f4f5",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  {s.is_primary && (
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%", background: "#fbbf24", flexShrink: 0,
                    }} />
                  )}
                  {s.code}
                </span>

                {/* Description */}
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

                {/* Confidence */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
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
                    ? <Check style={{ width: 11, height: 11, color: "#4ade80" }} />
                    : <Copy style={{ width: 11, height: 11 }} />
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
