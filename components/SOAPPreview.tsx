"use client";

import { useState } from "react";
import { FileText, Copy, Check, Printer, CheckCircle2 } from "lucide-react";
import { SOAPNote, PatientData, QualityScore } from "@/lib/agent/state";

interface SOAPPreviewProps {
  soapNote: SOAPNote | null;
  patientData?: PatientData | null;
  qualityScore?: QualityScore | null;
  cleanedTranscript?: string;
}

export function QualityMeter({ score }: { score: QualityScore | null }) {
  if (!score) {
    return (
      <div className="card" style={{
        padding: 16, background: "#161618", border: "1px solid #242427",
        display: "flex", flexDirection: "column", gap: 10, width: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText style={{ width: 15, height: 15, color: "#2dd4bf" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>Documentation Quality Score</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: "#222226", color: "#a1a1aa" }}>
            Standby
          </span>
        </div>

        {/* Slightly visible white hr line */}
        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "4px 0 6px" }} />

        <p style={{ fontSize: 11, color: "#71717a", margin: 0 }}>
          Quality evaluation standby. Execute intake encounter pipeline to evaluate documentation completeness, specificity, reasoning, and safety.
        </p>
      </div>
    );
  }

  const dims = [
    { label: "Completeness", value: score.completeness, color: "#2dd4bf" },
    { label: "Specificity", value: score.specificity, color: "#60a5fa" },
    { label: "Clinical Reasoning", value: score.reasoning_quality, color: "#c084fc" },
    { label: "Safety Coverage", value: score.safety, color: score.safety >= 70 ? "#4ade80" : "#f87171" },
  ];

  const overallColor = score.overall >= 80 ? "#4ade80" : score.overall >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="card" style={{
      padding: 16, background: "#161618", border: "1px solid #242427",
      display: "flex", flexDirection: "column", gap: 10, width: "100%",
    }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText style={{ width: 15, height: 15, color: "#2dd4bf" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>Documentation Quality Score</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: overallColor, fontFamily: "'IBM Plex Mono', monospace" }}>
            {score.overall}
            <span style={{ fontSize: 11, fontWeight: 500, color: "#71717a" }}> / 100</span>
          </span>
        </div>

        {/* Slightly visible white hr line */}
        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "8px 0 10px" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {dims.map(dim => (
          <div key={dim.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#a1a1aa" }}>{dim.label}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: dim.color, fontFamily: "'IBM Plex Mono', monospace" }}>
                {dim.value}%
              </span>
            </div>
            <div className="quality-bar-track" style={{ width: "100%" }}>
              <div className="quality-bar-fill" style={{ width: `${dim.value}%`, background: dim.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SOAPPreview({ soapNote, patientData, cleanedTranscript }: SOAPPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [approved, setApproved] = useState(false);
  const [activeTab, setActiveTab] = useState<"soap" | "transcript">("soap");

  if (!soapNote) {
    return (
      <div className="card" style={{
        padding: 32, textAlign: "center", background: "#161618", border: "1px solid #242427", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      }}>
        <FileText style={{ width: 32, height: 32, color: "#3a3a40", margin: "0 auto 10px" }} />
        <p style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa", margin: 0 }}>
          Structured SOAP note
        </p>
        <p style={{ fontSize: 11, color: "#52525b", marginTop: 4 }}>
          Auto-generated from transcript · Draft ready for review.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    const todayStr = new Date().toLocaleDateString();
    const text = `CLINICAL SOAP NOTE — CLINICA PLATFORM
Patient: ${patientData?.patient_name ?? "Patient"}  |  Date: ${todayStr}
════════════════════════════════════════

SUBJECTIVE (S):
${soapNote.subjective}

OBJECTIVE (O):
${soapNote.objective}

ASSESSMENT (A):
${soapNote.assessment}

PLAN (P):
${soapNote.plan}

════════════════════════════════════════
Generated by Clinica Clinical Documentation Platform`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  const sections = [
    { key: "S", title: "Subjective", content: soapNote.subjective },
    { key: "O", title: "Objective", content: soapNote.objective },
    { key: "A", title: "Assessment", content: soapNote.assessment },
    { key: "P", title: "Plan", content: soapNote.plan },
  ];

  return (
    <div className="card" style={{ overflow: "hidden", background: "#161618", border: "1px solid #242427", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Header */}
      <div>
        <div style={{
          padding: "14px 18px 10px",
          background: "#161618",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText style={{ width: 15, height: 15, color: "#2dd4bf" }} />
              Structured SOAP note
            </h3>
            <p style={{ fontSize: 11, color: "#71717a", margin: "2px 0 0" }}>
              Auto-generated from transcript · Draft ready for review
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={handlePrint} className="btn-dark-pill no-print" style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 11 }}>
              <Printer style={{ width: 12, height: 12 }} /> Print
            </button>
            <button onClick={handleCopy} className="btn-dark-pill" style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", fontSize: 11 }}>
              {copied
                ? <><Check style={{ width: 12, height: 12, color: "#4ade80" }} /> Copied!</>
                : <><Copy style={{ width: 12, height: 12 }} /> Copy note</>
              }
            </button>
          </div>
        </div>

        {/* Slightly visible white hr line */}
        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "0 18px 14px" }} />
      </div>

      {/* Content */}
      <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        {activeTab === "soap" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sections.map(sec => (
              <div key={sec.key} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#222226",
                  border: "1px solid #333338",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  {sec.key}
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>
                    {sec.title}
                  </h4>
                  <p style={{
                    fontSize: 12, color: "#a1a1aa", margin: 0,
                    lineHeight: 1.7, whiteSpace: "pre-line",
                  }}>
                    {sec.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="inset-panel" style={{ padding: 12 }}>
            <span className="section-label" style={{ display: "block", marginBottom: 8 }}>
              Cleaned & Normalized Transcript Output
            </span>
            <p style={{
              fontSize: 12, color: "#a1a1aa", margin: 0,
              lineHeight: 1.7, whiteSpace: "pre-line",
              fontFamily: "'IBM Plex Mono', monospace",
            }}>
              {cleanedTranscript}
            </p>
          </div>
        )}

        {/* Footer Actions — Approve & sign button only */}
        <div style={{ display: "flex", gap: 10, paddingTop: 10, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <button
            onClick={() => setApproved(true)}
            className="btn-white-pill"
            style={{
              background: approved ? "#16a34a" : "#ffffff",
              color: approved ? "#ffffff" : "#000000",
              padding: "7px 20px", fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <CheckCircle2 style={{ width: 14, height: 14 }} />
            {approved ? "Approved & Signed" : "Approve & sign"}
          </button>
        </div>
      </div>
    </div>
  );
}
