"use client";

import { useState } from "react";
import { Mail, Copy, Check } from "lucide-react";
import { PatientFollowUp } from "@/lib/agent/state";

interface FollowUpPanelProps {
  followUp: PatientFollowUp | null;
}

export function FollowUpPanel({ followUp }: FollowUpPanelProps) {
  const [copied, setCopied] = useState(false);

  if (!followUp) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${followUp.subject}\n\n${followUp.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid var(--border-light)",
        background: "var(--bg-subtle)", boxShadow: "0 1px 0 rgba(255,255,255,0.8)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Mail style={{ width: 14, height: 14, color: "var(--teal-mid)" }} />
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>
              Patient Follow-Up Instructions
            </span>
            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>
              Plain-language post-visit care summary
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="btn-raised"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", fontSize: 11 }}
        >
          {copied
            ? <><Check style={{ width: 12, height: 12, color: "var(--green-mid)" }} /> Copied!</>
            : <><Copy style={{ width: 12, height: 12 }} /> Copy Draft</>
          }
        </button>
      </div>

      {/* Email preview */}
      <div style={{ padding: 14 }}>
        {/* Subject line */}
        <div className="inset-panel" style={{ padding: "7px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="section-label">Subject:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{followUp.subject}</span>
        </div>

        {/* Body */}
        <div style={{
          background: "white", border: "1px solid var(--border-light)", borderRadius: 8,
          padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}>
          <p style={{
            fontSize: 12, color: "var(--text-secondary)", margin: 0,
            lineHeight: 1.8, whiteSpace: "pre-line",
          }}>
            {followUp.body}
          </p>
        </div>
      </div>
    </div>
  );
}
