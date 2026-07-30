"use client";

import { X, FileText, ShieldAlert, Mail, GitBranch, Tag, Check, Copy } from "lucide-react";
import { SessionRecord } from "@/lib/supabase/db";
import { useState } from "react";

interface PatientModalProps {
  session: SessionRecord | null;
  onClose: () => void;
}

export function PatientModal({ session, onClose }: PatientModalProps) {
  const [copied, setCopied] = useState(false);

  if (!session) return null;

  const handleCopy = () => {
    const text = `CLINICAL ENCOUNTER RECORD — CLINICA
Patient: ${session.patient_name} | Date: ${new Date(session.created_at).toLocaleString()}
Triage Risk: ${session.triage_level}

SUBJECTIVE:
${session.soap_note?.subjective}

OBJECTIVE:
${session.soap_note?.objective}

ASSESSMENT:
${session.soap_note?.assessment}

PLAN:
${session.soap_note?.plan}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triageBadge = {
    HIGH: { bg: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)" },
    MEDIUM: { bg: "rgba(245,158,11,0.2)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.4)" },
    LOW: { bg: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.4)" },
  }[session.triage_level] ?? { bg: "#222226", color: "#a1a1aa", border: "1px solid #333338" };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.8)", backdropFilter: "blur(6px)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, overflowY: "auto",
    }}>
      <div className="card" style={{
        background: "#161618", border: "1px solid #242427", borderRadius: 16,
        maxWidth: 860, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column",
        overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 24px 14px", borderBottom: "1px solid #242427",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#111113",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", margin: 0 }}>
                {session.patient_name}
              </h2>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 6, ...triageBadge }}>
                {session.triage_level} RISK
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#71717a", margin: "4px 0 0" }}>
              Encounter recorded on {new Date(session.created_at).toLocaleString()}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={handleCopy} className="btn-dark-pill" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", fontSize: 11 }}>
              {copied ? <Check style={{ width: 12, height: 12, color: "#4ade80" }} /> : <Copy style={{ width: 12, height: 12 }} />}
              {copied ? "Copied Record" : "Copy SOAP"}
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: "50%", background: "#222226", border: "1px solid #333338",
                color: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Chief Complaint Dictation */}
          <div className="inset-panel" style={{ padding: 14 }}>
            <span className="section-label" style={{ display: "block", marginBottom: 6 }}>Dictation Input Transcript</span>
            <p style={{ fontSize: 12, color: "#a1a1aa", margin: 0, lineHeight: 1.6, fontFamily: "'IBM Plex Mono', monospace" }}>
              {session.raw_input}
            </p>
          </div>

          {/* Structured SOAP Note */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
              <FileText style={{ width: 14, height: 14, color: "#2dd4bf" }} />
              Structured SOAP Note
            </h4>

            {[
              { key: "S", title: "Subjective", text: session.soap_note?.subjective },
              { key: "O", title: "Objective", text: session.soap_note?.objective },
              { key: "A", title: "Assessment", text: session.soap_note?.assessment },
              { key: "P", title: "Plan", text: session.soap_note?.plan },
            ].map(sec => (
              <div key={sec.key} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", background: "#222226", border: "1px solid #333338",
                  color: "#ffffff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                }}>
                  {sec.key}
                </div>
                <div>
                  <h5 style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", margin: "0 0 3px" }}>{sec.title}</h5>
                  <p style={{ fontSize: 12, color: "#a1a1aa", margin: 0, lineHeight: 1.6, whiteSpace: "pre-line" }}>{sec.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Triage & Patient Follow-Up 2-Col */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Triage Flags */}
            <div className="inset-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldAlert style={{ width: 14, height: 14, color: "#f87171" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>Triage Safety Signals</span>
              </div>
              {session.triage_flags && session.triage_flags.length > 0 ? (
                session.triage_flags.map((f: any, i: number) => (
                  <div key={i} style={{ fontSize: 11, color: "#a1a1aa", background: "#161618", padding: 8, borderRadius: 6, border: "1px solid #242427" }}>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>{f.symptom}: </span>{f.reason}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 11, color: "#71717a", margin: 0 }}>No acute safety flags detected.</p>
              )}
            </div>

            {/* Patient Follow-Up */}
            <div className="inset-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail style={{ width: 14, height: 14, color: "#2dd4bf" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>Care Instructions</span>
              </div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#ffffff", margin: 0 }}>{session.follow_up?.subject}</p>
              <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0, lineHeight: 1.5, whiteSpace: "pre-line" }}>
                {session.follow_up?.body}
              </p>
            </div>
          </div>

          {/* Differentials & ICD-10 (If available) */}
          {session.differentials && session.differentials.length > 0 && (
            <div className="inset-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <GitBranch style={{ width: 14, height: 14, color: "#c084fc" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>Differential Diagnoses</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {session.differentials.map((d: any, i: number) => (
                  <div key={i} style={{ fontSize: 11, color: "#a1a1aa", background: "#161618", padding: 8, borderRadius: 6, border: "1px solid #242427", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 600, color: "#ffffff" }}>{d.rank}. {d.diagnosis}</span>
                    <span style={{ color: "#c084fc", fontWeight: 700, fontSize: 10 }}>{d.likelihood}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.icd10 && session.icd10.length > 0 && (
            <div className="inset-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Tag style={{ width: 14, height: 14, color: "#fbbf24" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>ICD-10 Coding Mappings</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {session.icd10.map((c: any, i: number) => (
                  <span key={i} style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: "#222226", color: "#fbbf24", border: "1px solid #333338" }}>
                    {c.code} — {c.description}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #242427", background: "#111113", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn-white-pill" style={{ padding: "8px 24px", fontSize: 12 }}>
            Close Encounter Record
          </button>
        </div>
      </div>
    </div>
  );
}
