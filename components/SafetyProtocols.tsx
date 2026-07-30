"use client";

import { ShieldCheck, Lock, AlertTriangle, FileCheck, HeartPulse, CheckCircle2 } from "lucide-react";

export function SafetyProtocols() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck style={{ width: 22, height: 22, color: "#2dd4bf" }} />
          Safety Protocols, Medical Guidelines & HIPAA Safeguards
        </h1>
        <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>
          Enterprise clinical safety framework, compliance safeguards, and automated triage escalation rules
        </p>
      </div>

      {/* Grid Section 1: HIPAA & Privacy Security Framework */}
      <div className="card" style={{ padding: 20, background: "#161618", border: "1px solid #242427", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Lock style={{ width: 16, height: 16, color: "#2dd4bf" }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", margin: 0 }}>
            HIPAA Compliance & Privacy Safeguards Protocol
          </h3>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: 0 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div className="inset-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2dd4bf" }}>Zero Data Retention (ZDR)</span>
            <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>
              Dictation transcripts and PHI are processed ephemerally. No patient data is retained by LLM providers for model training.
            </p>
          </div>

          <div className="inset-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa" }}>AES-256 Encryption</span>
            <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>
              All database records and session parameters are encrypted using AES-256 at rest and TLS 1.3 in transit.
            </p>
          </div>

          <div className="inset-panel" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#c084fc" }}>De-Identification Engine</span>
            <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>
              Direct identifiers (SSN, MRN, DOB, addresses) are automatically anonymized before AI model execution.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Section 2: Clinical Triage & Red Flag Escalation Rules */}
      <div className="card" style={{ padding: 20, background: "#161618", border: "1px solid #242427", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle style={{ width: 16, height: 16, color: "#f87171" }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Clinical Decision Support (CDS) Red Flag Escalation Rules
          </h3>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: 0 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="inset-panel" style={{ padding: 14, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)" }}>
              HIGH RISK OVERRIDE
            </span>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Acute Coronary Syndrome (ACS) Protocol
              </h4>
              <p style={{ fontSize: 11, color: "#a1a1aa", margin: "2px 0 0", lineHeight: 1.5 }}>
                Crushing substernal chest pain radiating to arm/jaw, diaphoresis, or exertional dyspnea automatically forces a HIGH Triage Risk classification, triggering an immediate 12-lead ECG order directive.
              </p>
            </div>
          </div>

          <div className="inset-panel" style={{ padding: 14, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: "rgba(245,158,11,0.2)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.4)" }}>
              AIRWAY PROTOCOL
            </span>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Acute Respiratory Distress & Anaphylaxis Rule
              </h4>
              <p style={{ fontSize: 11, color: "#a1a1aa", margin: "2px 0 0", lineHeight: 1.5 }}>
                Inspiratory stridor, accessory muscle use, or SpO2 &lt; 92% triggers an urgent bronchodilator / epinephrine alert and prompts immediate red-flag return precautions in patient follow-up care summaries.
              </p>
            </div>
          </div>

          <div className="inset-panel" style={{ padding: 14, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: "rgba(192,132,252,0.2)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.4)" }}>
              SEPSIS SCREENING
            </span>
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Systemic Inflammatory Response Syndrome (SIRS) Protocol
              </h4>
              <p style={{ fontSize: 11, color: "#a1a1aa", margin: "2px 0 0", lineHeight: 1.5 }}>
                Temperature &gt; 101.4°F combined with tachycardia (&gt; 90 bpm) or altered mental status triggers automated sepsis risk flags and recommendation for CBC/blood cultures.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section 3: Provider Sign-Off & Auditability */}
      <div className="card" style={{ padding: 20, background: "#161618", border: "1px solid #242427", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileCheck style={{ width: 16, height: 16, color: "#4ade80" }} />
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Provider Verification & Medical Governance Policy
          </h3>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: 0 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="inset-panel" style={{ padding: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <CheckCircle2 style={{ width: 16, height: 16, color: "#4ade80", flexShrink: 0, marginTop: 2 }} />
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>Human-in-the-Loop (HITL) Sign-Off</span>
              <p style={{ fontSize: 11, color: "#a1a1aa", margin: "2px 0 0", lineHeight: 1.5 }}>
                All generated SOAP notes are marked as draft proposals. Clinicians must review, edit, and click "Approve & Sign" before any note is saved into permanent health records.
              </p>
            </div>
          </div>

          <div className="inset-panel" style={{ padding: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
            <HeartPulse style={{ width: 16, height: 16, color: "#2dd4bf", flexShrink: 0, marginTop: 2 }} />
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>Audit Trail Logging</span>
              <p style={{ fontSize: 11, color: "#a1a1aa", margin: "2px 0 0", lineHeight: 1.5 }}>
                Every pipeline run creates a timestamped audit log capturing model inputs, outputs, verification quality scores, and provider signature status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
