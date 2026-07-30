"use client";

import { useState } from "react";
import {
  Inbox,
} from "lucide-react";
import { SidebarNav } from "@/components/SidebarNav";
import { HeaderBar } from "@/components/HeaderBar";
import { IntakeForm } from "@/components/IntakeForm";
import { AgentStatusBadge, PipelineStep } from "@/components/AgentStatusBadge";
import { TriageBadge } from "@/components/TriageBadge";
import { SOAPPreview, QualityMeter } from "@/components/SOAPPreview";
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

function EmptyStateTemplate({ title, description }: { title: string; description: string }) {
  return (
    <div className="card" style={{
      padding: 60, textAlign: "center", background: "#18181b", border: "1px solid #27272a",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: "#121215", border: "1px solid #27272a",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a",
      }}>
        <Inbox style={{ width: 24, height: 24 }} />
      </div>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f4f4f5", margin: 0 }}>{title}</h3>
        <p style={{ fontSize: 12, color: "#71717a", margin: "4px 0 0", maxWidth: 360 }}>{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("overview");
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b", color: "#f4f4f5" }}>
      {/* Left Sidebar */}
      <SidebarNav activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab)} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header Bar */}
        <HeaderBar />

        {/* Workspace Container */}
        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 1440, width: "100%", margin: "0 auto" }}>
          
          {/* TAB 1: OVERVIEW (EXACT DASHBOARD LAYOUT SPECIFIED) */}
          {activeTab === "overview" && (
            <>
              {/* Welcome Header Banner */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2dd4bf" }}>
                    THURSDAY, JULY 30
                  </span>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f4f4f5", margin: "4px 0 2px", letterSpacing: "-0.02em" }}>
                    Good morning, Abdul Hanan.
                  </h1>
                  <p style={{ fontSize: 13, color: "#a1a1aa", margin: 0 }}>
                    Your clinical workspace is ready.
                  </p>
                </div>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10,
                  padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <p style={{ fontWeight: 700, color: "#f87171", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Pipeline Execution Error</p>
                    <p style={{ fontSize: 12, color: "#fca5a5", marginTop: 2, margin: 0 }}>{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* ROW 1 (Recorder Left + Presets Right) & ROW 2 (Transcription Left + Triage Safety Flags Right) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Combined Recorder, Presets, Transcription & Triage Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "stretch" }}>
                  
                  {/* Left Column: IntakeForm (Recorder Top, Transcription Bottom) */}
                  <IntakeForm onRunAgent={handleRunAgent} isLoading={isRunning} />

                  {/* Right Column: Triage Safety Flags Box (Stays Aligned even when empty) */}
                  <TriageBadge triageResult={triageResult} />
                </div>

                {/* ROW 3: Full Width Execution Pipeline Animation Stepper */}
                <div style={{ width: "100%" }}>
                  <AgentStatusBadge currentStep={pipelineStep} />
                </div>

                {/* ROW 4: Full Width Documentation Quality Score Box */}
                <div style={{ width: "100%" }}>
                  <QualityMeter score={qualityScore} />
                </div>

                {/* ROW 5: Left = SOAP Notes Box, Right = Patient Follow-Up Box */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
                  {/* Left: Structured SOAP Note Box */}
                  <SOAPPreview
                    soapNote={soapNote}
                    patientData={patientData}
                    cleanedTranscript={cleanedTranscript}
                  />

                  {/* Right: Patient Follow-Up Box (Full Width Copy Button Only) */}
                  <FollowUpPanel followUp={followUp} />
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ENCOUNTERS */}
          {activeTab === "encounters" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f4f4f5", margin: 0 }}>Encounters & Records</h1>
                <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>Patient encounter history database records</p>
              </div>
              <HistorySidebar onSelectSession={handleSelectHistorySession} activeSessionId={activeSessionId} />
            </div>
          )}

          {/* TAB 3: DIFFERENTIAL DX */}
          {activeTab === "differentials" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f4f4f5", margin: 0 }}>Differential Diagnosis</h1>
                <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>Ranked diagnostic likelihood evaluation</p>
              </div>
              <DifferentialPanel differentials={differentialDiagnoses} />
            </div>
          )}

          {/* TAB 4: ICD-10 CODES */}
          {activeTab === "icd10" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f4f4f5", margin: 0 }}>ICD-10-CM Coding</h1>
                <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>Automated diagnostic code mapping</p>
              </div>
              <ICD10Panel suggestions={icd10Suggestions} />
            </div>
          )}

          {/* TAB 5: PATIENT FOLLOW-UP */}
          {activeTab === "followup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f4f4f5", margin: 0 }}>Patient Care Summary</h1>
                <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>Plain-language follow-up instructions</p>
              </div>
              <FollowUpPanel followUp={followUp} />
            </div>
          )}

          {/* TAB 6: SAFETY PROTOCOLS */}
          {activeTab === "safety" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f4f4f5", margin: 0 }}>Safety Protocols & Triage</h1>
                <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>Automated clinical safety evaluation rules</p>
              </div>
              <TriageBadge triageResult={triageResult} />
            </div>
          )}

          {/* EMPTY STATE TEMPLATE COMPONENTS WITH "NO DATA AVAILABLE" LABELS */}
          {activeTab === "templates" && (
            <EmptyStateTemplate title="AI Templates" description="No data available for AI templates." />
          )}

          {activeTab === "patients" && (
            <EmptyStateTemplate title="Patients Directory" description="No data available for patients directory." />
          )}

          {activeTab === "notelibrary" && (
            <EmptyStateTemplate title="Note Library" description="No data available for note library." />
          )}

          {activeTab === "help" && (
            <EmptyStateTemplate title="Help & Support" description="No data available for help & support." />
          )}

          {activeTab === "settings" && (
            <EmptyStateTemplate title="Workspace Settings" description="No data available for workspace settings." />
          )}

        </div>
      </div>
    </div>
  );
}
