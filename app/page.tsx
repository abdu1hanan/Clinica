"use client";

import { useState, useEffect } from "react";
import { SidebarNav } from "@/components/SidebarNav";
import { HeaderBar } from "@/components/HeaderBar";
import { IntakeForm, PresetsCard } from "@/components/IntakeForm";
import { AgentStatusBadge, PipelineStep } from "@/components/AgentStatusBadge";
import { TriageBadge } from "@/components/TriageBadge";
import { SOAPPreview, QualityMeter } from "@/components/SOAPPreview";
import { DifferentialPanel } from "@/components/DifferentialPanel";
import { ICD10Panel } from "@/components/ICD10Panel";
import { FollowUpPanel } from "@/components/FollowUpPanel";
import { HistorySidebar } from "@/components/HistorySidebar";
import { PatientModal } from "@/components/PatientModal";
import { PatientsDirectory } from "@/components/PatientsDirectory";
import { NoteLibrary } from "@/components/NoteLibrary";
import { SafetyProtocols } from "@/components/SafetyProtocols";
import {
  PatientData,
  TriageResult,
  SOAPNote,
  PatientFollowUp,
  DifferentialDiagnosis,
  ICD10Suggestion,
  QualityScore,
} from "@/lib/agent/state";
import { fetchClinicalSessions, SessionRecord } from "@/lib/supabase/db";

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
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [localSessions, setLocalSessions] = useState<SessionRecord[]>([]);
  const [selectedPatientModalSession, setSelectedPatientModalSession] = useState<SessionRecord | null>(null);

  // Automatically hydrate all historical sessions from Supabase database on page load/reload
  useEffect(() => {
    async function hydrateSessionsFromDatabase() {
      const records = await fetchClinicalSessions(50);
      if (records && records.length > 0) {
        setLocalSessions(records);
        const latest = records[0];
        if (latest) {
          if (!soapNote && latest.soap_note) setSoapNote(latest.soap_note);
          if (!followUp && latest.follow_up) setFollowUp(latest.follow_up);
          if (!triageResult && latest.triage_level) {
            setTriageResult({
              triage_level: latest.triage_level,
              flags: latest.triage_flags || [],
              recommendation: `Encounter record loaded from database history.`,
              confidence: 85,
            });
          }
          if (!differentialDiagnoses && latest.differentials && latest.differentials.length > 0) {
            setDifferentialDiagnoses(latest.differentials);
          }
          if (!icd10Suggestions && latest.icd10 && latest.icd10.length > 0) {
            setIcd10Suggestions(latest.icd10);
          }
        }
      }
    }
    hydrateSessionsFromDatabase();
  }, []);

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
      const newSessionId = data.sessionId || `session-${Date.now()}`;
      setActiveSessionId(newSessionId);
      setPipelineStep("completed");

      // Save into real-time local sessions array for Encounters, Patients & Note Library
      if (data.soapNote) {
        const extractedName = data.patientData?.patient_name && data.patientData.patient_name !== "Anonymous Patient"
          ? data.patientData.patient_name
          : "Patient Encounter";

        const newRecord: SessionRecord = {
          id: newSessionId,
          created_at: new Date().toISOString(),
          patient_name: extractedName,
          raw_input: rawInput,
          triage_level: data.triageResult?.triage_level || "LOW",
          triage_flags: data.triageResult?.flags || [],
          soap_note: data.soapNote,
          follow_up: data.followUp || { subject: "Care Instructions", body: "Follow up as advised." },
          differentials: data.differentialDiagnoses || [],
          icd10: data.icd10Suggestions || [],
        };
        setLocalSessions((prev) => [newRecord, ...prev]);
      }
    } catch (err) {
      console.error("Pipeline error:", err);
      setPipelineStep("error");
      setErrorMsg("Connection error or session timeout during pipeline execution.");
    }
  };

  const handleSelectHistorySession = (session: SessionRecord) => {
    setSelectedPatientModalSession(session);
  };

  const isRunning = pipelineStep !== "idle" && pipelineStep !== "completed" && pipelineStep !== "error";

  // Derive unique patient names dynamically from real executed sessions
  const dynamicPatientNames = Array.from(
    new Set([
      ...localSessions.map((s) => s.patient_name || "Patient Encounter"),
    ])
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0c", color: "#f4f4f5" }}>
      {/* Left Sidebar */}
      <SidebarNav activeTab={activeTab} onNavigate={(tab) => setActiveTab(tab)} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header Bar */}
        <HeaderBar />

        {/* Workspace Container */}
        <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 1440, width: "100%", margin: "0 auto" }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* Welcome Header Banner */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2dd4bf" }}>
                    THURSDAY, JULY 30
                  </span>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: "#ffffff", margin: "4px 0 2px", letterSpacing: "-0.02em" }}>
                    Good morning, Abdul Hanan.
                  </h1>
                  <p style={{ fontSize: 13, color: "#a1a1aa", margin: 0 }}>
                    Your clinical workspace is ready. Three encounters need review.
                  </p>
                </div>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div style={{
                  background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 10,
                  padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <p style={{ fontWeight: 700, color: "#f87171", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Pipeline Execution Error</p>
                    <p style={{ fontSize: 12, color: "#fca5a5", marginTop: 2, margin: 0 }}>{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* WORKSPACE GRID ROW 1 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "stretch" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", height: "100%" }}>
                  <IntakeForm onRunAgent={handleRunAgent} isLoading={isRunning} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%", height: "100%" }}>
                  <PresetsCard
                    activePreset={activePreset}
                    onSelectPreset={(text, idx) => {
                      setActivePreset(idx);
                      const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
                      if (textarea) {
                        textarea.value = text;
                        textarea.dispatchEvent(new Event("input", { bubbles: true }));
                      }
                    }}
                  />
                  <TriageBadge triageResult={triageResult} />
                </div>
              </div>

              {/* FULL WIDTH ROW 2: Execution Pipeline Animation Stepper */}
              <div style={{ width: "100%" }}>
                <AgentStatusBadge currentStep={pipelineStep} />
              </div>

              {/* FULL WIDTH ROW 3: Documentation Quality Score Box */}
              <div style={{ width: "100%" }}>
                <QualityMeter score={qualityScore} />
              </div>

              {/* WORKSPACE GRID ROW 4: Left = Structured SOAP Note Box, Right = Patient Follow-Up Box */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "stretch" }}>
                <div style={{ height: "100%" }}>
                  <SOAPPreview
                    soapNote={soapNote}
                    patientData={patientData}
                    cleanedTranscript={cleanedTranscript}
                  />
                </div>

                <div style={{ height: "100%" }}>
                  <FollowUpPanel followUp={followUp} />
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ENCOUNTERS */}
          {activeTab === "encounters" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: 0 }}>Encounters & Records</h1>
                <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>Patient encounter history database records</p>
              </div>
              <HistorySidebar onSelectSession={handleSelectHistorySession} activeSessionId={activeSessionId} localSessions={localSessions} />
            </div>
          )}

          {/* TAB 3: DIFFERENTIAL DX */}
          {activeTab === "differentials" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: 0 }}>Differential Diagnosis</h1>
                <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>Ranked diagnostic likelihood evaluation</p>
              </div>
              <DifferentialPanel differentials={differentialDiagnoses} historySessions={localSessions} />
            </div>
          )}

          {/* TAB 4: ICD-10 CODES */}
          {activeTab === "icd10" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: 0 }}>ICD-10-CM Coding</h1>
                <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>Automated diagnostic code mapping</p>
              </div>
              <ICD10Panel suggestions={icd10Suggestions} historySessions={localSessions} />
            </div>
          )}

          {/* TAB 5: PATIENT FOLLOW-UP */}
          {activeTab === "followup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: 0 }}>Patient Care Summary</h1>
                <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>Plain-language follow-up instructions</p>
              </div>
              <FollowUpPanel followUp={followUp} />
            </div>
          )}

          {/* TAB 6: SAFETY PROTOCOLS & HIPAA COMPLIANCE */}
          {activeTab === "safety" && (
            <SafetyProtocols />
          )}

          {/* TAB 7: PATIENTS DIRECTORY */}
          {activeTab === "patients" && (
            <PatientsDirectory
              sessions={localSessions}
              onSelectPatientEncounter={(s) => setSelectedPatientModalSession(s)}
            />
          )}

          {/* TAB 8: NOTE LIBRARY */}
          {activeTab === "notelibrary" && (
            <NoteLibrary patientNames={dynamicPatientNames} />
          )}

        </div>
      </div>

      {/* POPUP MODAL ENCOUNTER CARD */}
      <PatientModal
        session={selectedPatientModalSession}
        onClose={() => setSelectedPatientModalSession(null)}
      />
    </div>
  );
}
