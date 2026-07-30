"use client";

import { useState } from "react";
import { Mail, Copy, Check, CheckCircle2 } from "lucide-react";
import { PatientFollowUp } from "@/lib/agent/state";

interface FollowUpPanelProps {
  followUp: PatientFollowUp | null;
}

export function FollowUpPanel({ followUp }: FollowUpPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!followUp) {
    return (
      <div className="card" style={{ padding: 18, background: "#18181b", border: "1px solid #27272a" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mail style={{ width: 15, height: 15, color: "#2dd4bf" }} />
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>Patient follow-up</h4>
              <p style={{ fontSize: 11, color: "#71717a", margin: 0 }}>Plain-language care instructions</p>
            </div>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "#27272a", color: "#a1a1aa" }}>
            Reading level: 6th grade
          </span>
        </div>
        <p style={{ fontSize: 11, color: "#52525b", margin: 0 }}>No patient follow-up data available. Execute an intake encounter to generate instructions.</p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${followUp.subject}\n\n${followUp.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bodyLines = followUp.body.split("\n").filter(l => l.trim().length > 0);

  return (
    <div className="card" style={{ padding: 18, background: "#18181b", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Mail style={{ width: 15, height: 15, color: "#2dd4bf" }} />
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>Patient follow-up</h4>
            <p style={{ fontSize: 11, color: "#71717a", margin: 0 }}>Plain-language post-encounter summary</p>
          </div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#27272a", color: "#a1a1aa" }}>
          Reading level: 6th grade
        </span>
      </div>

      {/* Instruction List Card */}
      <div style={{
        background: "#121215",
        border: "1px solid #27272a",
        borderRadius: 10,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#f4f4f5" }}>
          {followUp.subject}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bodyLines.map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <CheckCircle2 style={{ width: 14, height: 14, color: "#2dd4bf", flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>
                {line.replace(/^[\s•\-\d\.]+\s*/, "")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Full Width Copy Button ONLY */}
      <button
        onClick={handleCopy}
        className="btn-raised"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "9px 14px",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {copied ? <Check style={{ width: 13, height: 13, color: "#4ade80" }} /> : <Copy style={{ width: 13, height: 13 }} />}
        {copied ? "Copied Follow-up Draft" : "Copy Follow-up Draft"}
      </button>
    </div>
  );
}
