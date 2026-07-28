"use client";

import { useState } from "react";
import { Stethoscope, Cpu, Database, AlertCircle, Layers } from "lucide-react";
import { IntakeForm } from "@/components/IntakeForm";
import { AgentStatusBadge, PipelineStep } from "@/components/AgentStatusBadge";
import { TriageBadge } from "@/components/TriageBadge";
import { SOAPPreview } from "@/components/SOAPPreview";
import { FollowUpPanel } from "@/components/FollowUpPanel";
import { HistorySidebar } from "@/components/HistorySidebar";
import { PatientData, TriageResult, SOAPNote, PatientFollowUp } from "@/lib/agent/state";
import { SessionRecord } from "@/lib/supabase/db";

export default function Home() {
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
  const [cleanedTranscript, setCleanedTranscript] = useState<string>("");
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [soapNote, setSoapNote] = useState<SOAPNote | null>(null);
  const [followUp, setFollowUp] = useState<PatientFollowUp | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunAgent = async (rawInput: string) => {
    setErrorMsg(null);
    setPipelineStep("cleanTranscript");
    setCleanedTranscript("");
    setPatientData(null);
    setTriageResult(null);
    setSoapNote(null);
    setFollowUp(null);

    try {
      const step1 = setTimeout(() => setPipelineStep("extract"), 600);
      const step2 = setTimeout(() => setPipelineStep("triage"), 1200);
      const step3 = setTimeout(() => setPipelineStep("soap"), 1800);
      const step4 = setTimeout(() => setPipelineStep("verifySoap"), 2400);
      const step5 = setTimeout(() => setPipelineStep("followup"), 3000);

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput }),
      });

      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
      clearTimeout(step5);

      const data = await res.json();

      if (!res.ok) {
        setPipelineStep("error");
        setErrorMsg(data.error || "Failed to execute pipeline.");
        return;
      }

      setCleanedTranscript(data.cleanedTranscript || rawInput);
      setPatientData(data.patientData);
      setTriageResult(data.triageResult);
      setSoapNote(data.soapNote);
      setFollowUp(data.followUp);
      setActiveSessionId(data.sessionId);
      setPipelineStep("completed");
    } catch (err) {
      console.error("Pipeline execution error:", err);
      setPipelineStep("error");
      setErrorMsg("Network timeout or pipeline communication error.");
    }
  };

  const handleSelectHistorySession = (session: SessionRecord) => {
    setActiveSessionId(session.id);
    setCleanedTranscript(session.raw_input);
    setTriageResult({
      triage_level: session.triage_level,
      flags: session.triage_flags || [],
      recommendation: `Historical session record loaded from database (${new Date(session.created_at).toLocaleString()}).`,
    });
    setSoapNote(session.soap_note);
    setFollowUp(session.follow_up);
    setPatientData({
      patient_name: session.patient_name,
      chief_complaint: session.raw_input,
      symptoms: [],
      vitals: {},
      medical_history: [],
    });
    setPipelineStep("completed");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/10 border border-teal-500/30 p-2 rounded-lg text-teal-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-slate-100">Clinica</h1>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-md">
                  Clinical Orchestrator
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Intelligent Patient Intake, SOAP Note Generation & Triage Platform
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md text-slate-300 font-medium">
              <Cpu className="w-3.5 h-3.5 text-teal-400" /> StateGraph Pipeline
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md text-slate-300 font-medium">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Validation Nodes
            </span>
            <span className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md text-slate-300 font-medium">
              <Database className="w-3.5 h-3.5 text-blue-400" /> PostgreSQL Persistence
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <IntakeForm
            onRunAgent={handleRunAgent}
            isLoading={pipelineStep !== "idle" && pipelineStep !== "completed" && pipelineStep !== "error"}
          />

          <AgentStatusBadge currentStep={pipelineStep} />

          <HistorySidebar
            onSelectSession={handleSelectHistorySession}
            activeSessionId={activeSessionId}
          />
        </div>

        {/* Right Column (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-800 text-rose-200 rounded-xl p-4 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-100">Pipeline Execution Error</p>
                <p className="text-rose-300/90 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <TriageBadge triageResult={triageResult} />

          <SOAPPreview
            soapNote={soapNote}
            patientName={patientData?.patient_name}
            cleanedTranscript={cleanedTranscript}
          />

          <FollowUpPanel followUp={followUp} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3.5 text-center text-xs text-slate-500">
        Clinica Medical Platform — Enterprise Clinical Intake & Documentation Infrastructure
      </footer>
    </div>
  );
}
