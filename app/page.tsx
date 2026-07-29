"use client";

import { useState } from "react";
import { Stethoscope, Database, Activity, FileText, CheckCircle2, Layers, GitBranch, Tag } from "lucide-react";
import { IntakeForm } from "@/components/IntakeForm";
import { AgentStatusBadge, PipelineStep } from "@/components/AgentStatusBadge";
import { TriageBadge } from "@/components/TriageBadge";
import { SOAPPreview } from "@/components/SOAPPreview";
import { DifferentialPanel } from "@/components/DifferentialPanel";
import { ICD10Panel } from "@/components/ICD10Panel";
import { FollowUpPanel } from "@/components/FollowUpPanel";
import { HistorySidebar } from "@/components/HistorySidebar";
import {
  PatientData,
  TriageResult,
  SOAPNote,
  PatientFollowUp,
  DifferentialDiagnosis,
  ICD10Suggestion,
  QualityScore,
} from "@/lib/agent/state";
import { SessionRecord } from "@/lib/supabase/db";

export default function Home() {
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
  const [cleanedTranscript, setCleanedTranscript] = useState<string>("");
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [differentialDiagnoses, setDifferentialDiagnoses] = useState<DifferentialDiagnosis[] | null>(null);
  const [icd10Suggestions, setIcd10Suggestions] = useState<ICD10Suggestion[] | null>(null);
  const [soapNote, setSoapNote] = useState<SOAPNote | null>(null);
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
  const [followUp, setFollowUp] = useState<PatientFollowUp | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunAgent = async (rawInput: string) => {
    setErrorMsg(null);
    setPipelineStep("cleanTranscript");
    setCleanedTranscript("");
    setPatientData(null);
    setTriageResult(null);
    setDifferentialDiagnoses(null);
    setIcd10Suggestions(null);
    setSoapNote(null);
    setQualityScore(null);
    setFollowUp(null);

    try {
      const steps: PipelineStep[] = ["extract", "differential", "triage", "soap", "verifySoap", "icd10", "followup"];
      const timers = steps.map((step, i) =>
        setTimeout(() => setPipelineStep(step), 600 + i * 700)
      );

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput }),
      });

      timers.forEach(clearTimeout);

      const data = await res.json();

      if (!res.ok) {
        setPipelineStep("error");
        setErrorMsg(data.error || "Failed to execute clinical pipeline.");
        return;
      }

      setCleanedTranscript(data.cleanedTranscript || rawInput);
      setPatientData(data.patientData);
      setTriageResult(data.triageResult);
      setDifferentialDiagnoses(data.differentialDiagnoses);
      setIcd10Suggestions(data.icd10Suggestions);
      setSoapNote(data.soapNote);
      setQualityScore(data.qualityScore);
      setFollowUp(data.followUp);
      setActiveSessionId(data.sessionId);
      setPipelineStep("completed");
    } catch (err) {
      console.error("Pipeline error:", err);
      setPipelineStep("error");
      setErrorMsg("Connection error or session timeout during pipeline execution.");
    }
  };

  const handleSelectHistorySession = (session: SessionRecord) => {
    setActiveSessionId(session.id);
    setCleanedTranscript(session.raw_input);
    setTriageResult({
      triage_level: session.triage_level,
      flags: session.triage_flags || [],
      recommendation: `Session loaded from record history (${new Date(session.created_at).toLocaleString()}).`,
      confidence: 80,
    });
    setSoapNote(session.soap_note);
    setFollowUp(session.follow_up);
    setDifferentialDiagnoses(null);
    setIcd10Suggestions(null);
    setQualityScore(null);
    setPatientData({
      patient_name: session.patient_name,
      chief_complaint: session.raw_input,
      symptoms: [],
      vitals: {},
      review_of_systems: [],
      physical_exam: null,
      plan_directives: [],
      medical_history: [],
      allergies: [],
      current_medications: [],
    });
    setPipelineStep("completed");
    setErrorMsg(null);
  };

  const isRunning = pipelineStep !== "idle" && pipelineStep !== "completed" && pipelineStep !== "error";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* ── Header ── */}
      <header style={{
        background: "linear-gradient(180deg, #ffffff 0%, var(--bg-paper) 100%)",
        borderBottom: "1px solid var(--border-light)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, var(--teal-dark) 0%, var(--teal-mid) 100%)",
              boxShadow: "0 2px 6px rgba(13,148,136,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Stethoscope style={{ width: 20, height: 20, color: "white" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Clinica</h1>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "2px 8px", borderRadius: 4,
                  background: "var(--teal-bg)", border: "1px solid var(--teal-border)", color: "var(--teal-dark)"
                }}>
                  Clinical Workspace v2.0
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                Clinical Documentation & Triage Intelligence Platform
              </p>
            </div>
          </div>

          {/* Status Chips */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[
              { icon: <Activity style={{ width: 12, height: 12, color: "var(--teal-mid)" }} />, label: "Pipeline Nodes", value: "8 Active" },
              { icon: <Database style={{ width: 12, height: 12, color: "var(--blue-mid)" }} />, label: "Storage", value: "Supabase" },
              { icon: <GitBranch style={{ width: 12, height: 12, color: "var(--purple-mid)" }} />, label: "Differentials", value: "Live" },
              { icon: <Tag style={{ width: 12, height: 12, color: "var(--amber-mid)" }} />, label: "ICD-10", value: "Enabled" },
            ].map(chip => (
              <div key={chip.label} className="no-print" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 6,
                background: "var(--bg-subtle)", border: "1px solid var(--border-light)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
              }}>
                {chip.icon}
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>{chip.label}:</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)" }}>{chip.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <div style={{
        background: "var(--bg-paper)",
        borderBottom: "1px solid var(--border-light)",
        padding: "10px 24px",
        boxShadow: "0 1px 0 rgba(255,255,255,0.8)",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { icon: <Activity style={{ width: 14, height: 14, color: "var(--teal-mid)" }} />, label: "Triage Level", value: triageResult?.triage_level ? `${triageResult.triage_level} Risk` : "Pending", accent: triageResult?.triage_level === "HIGH" ? "#dc2626" : triageResult?.triage_level === "MEDIUM" ? "#d97706" : "var(--teal-mid)" },
            { icon: <FileText style={{ width: 14, height: 14, color: "var(--blue-mid)" }} />, label: "Patient", value: patientData?.patient_name || "Unassigned", accent: "var(--blue-mid)" },
            { icon: <Layers style={{ width: 14, height: 14, color: "var(--purple-mid)" }} />, label: "Pipeline State", value: pipelineStep === "completed" ? "8/8 Complete" : pipelineStep === "idle" ? "Ready" : "Processing...", accent: "var(--purple-mid)" },
            { icon: <CheckCircle2 style={{ width: 14, height: 14, color: "var(--green-mid)" }} />, label: "Doc Quality", value: qualityScore ? `${qualityScore.overall}/100` : "Pending", accent: "var(--green-mid)" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              padding: "8px 12px",
              boxShadow: "var(--shadow-card)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              {stat.icon}
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>{stat.label}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: stat.accent, margin: 0, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <main style={{ flex: 1, maxWidth: 1400, width: "100%", margin: "0 auto", padding: "20px 24px", display: "grid", gridTemplateColumns: "400px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <IntakeForm onRunAgent={handleRunAgent} isLoading={isRunning} />
          <AgentStatusBadge currentStep={pipelineStep} />
          <HistorySidebar onSelectSession={handleSelectHistorySession} activeSessionId={activeSessionId} />
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {errorMsg && (
            <div style={{
              background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 10,
              padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start",
              boxShadow: "0 2px 8px rgba(220,38,38,0.08)",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red-mid)", flexShrink: 0, marginTop: 4 }} />
              <div>
                <p style={{ fontWeight: 700, color: "var(--red-dark)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Pipeline Error</p>
                <p style={{ fontSize: 12, color: "#991b1b", marginTop: 2, margin: 0 }}>{errorMsg}</p>
              </div>
            </div>
          )}

          <TriageBadge triageResult={triageResult} />
          <SOAPPreview
            soapNote={soapNote}
            patientData={patientData}
            qualityScore={qualityScore}
            cleanedTranscript={cleanedTranscript}
          />
          <DifferentialPanel differentials={differentialDiagnoses} />
          <ICD10Panel suggestions={icd10Suggestions} />
          <FollowUpPanel followUp={followUp} />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="no-print" style={{
        borderTop: "1px solid var(--border-light)",
        background: "var(--bg-paper)",
        padding: "12px 24px",
        textAlign: "center",
        boxShadow: "0 -1px 0 rgba(255,255,255,0.8)",
      }}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
          Clinica Clinical Workspace · Secure documentation, triage evaluation, and patient communication platform.
        </p>
      </footer>
    </div>
  );
}
