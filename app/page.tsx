"use client";

import { useState } from "react";
import { Stethoscope, Cpu, Database, AlertCircle, Layers, Activity, FileText, CheckCircle2, ChevronRight, User } from "lucide-react";
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
        setErrorMsg(data.error || "Failed to execute clinical pipeline.");
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
      console.error("Pipeline error:", err);
      setPipelineStep("error");
      setErrorMsg("Connection error or session timeout during graph execution.");
    }
  };

  const handleSelectHistorySession = (session: SessionRecord) => {
    setActiveSessionId(session.id);
    setCleanedTranscript(session.raw_input);
    setTriageResult({
      triage_level: session.triage_level,
      flags: session.triage_flags || [],
      recommendation: `Patient session loaded from record database history (${new Date(session.created_at).toLocaleString()}).`,
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
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans clinical-grid">
      {/* Premium Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-teal-500/10 border border-teal-500/30 p-2.5 rounded-xl text-teal-400 shadow-sm shadow-teal-500/10">
              <Stethoscope className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Clinica</h1>
                <span className="text-[10px] tracking-widest font-extrabold uppercase px-2.5 py-0.5 bg-teal-500/10 border border-teal-500/30 rounded text-teal-400">
                  Clinical Workspace v1.4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enterprise Clinical Intake, Safety Triage, & SOAP Note Documentation Pipeline
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2.5">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-1.5 px-3 flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-400 font-medium">Pipeline Nodes:</span>
              <span className="text-slate-200 font-bold">6 Active</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-1.5 px-3 flex items-center gap-2 text-xs">
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-400 font-medium">DB Connection:</span>
              <span className="text-slate-200 font-bold">Supabase</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Stats Panel */}
      <section className="bg-slate-950/40 border-b border-slate-900 py-3.5 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg flex items-center gap-3">
            <Activity className="w-4 h-4 text-teal-400" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Triage Level</p>
              <p className="text-xs font-semibold text-slate-200">{triageResult?.triage_level ? `${triageResult.triage_level} Risk` : "Unprocessed"}</p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg flex items-center gap-3">
            <FileText className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Patient Record</p>
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">{patientData?.patient_name || "Unassigned"}</p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg flex items-center gap-3">
            <Layers className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pipeline Steps</p>
              <p className="text-xs font-semibold text-slate-200">{pipelineStep === "completed" ? "6/6 Done" : pipelineStep === "idle" ? "Ready" : "Processing"}</p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Validation status</p>
              <p className="text-xs font-semibold text-slate-200">{soapNote ? "SOAP Verified" : "Pending Intake"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Intake Controls (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/20 to-purple-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500" />
            <div className="relative">
              <IntakeForm
                onRunAgent={handleRunAgent}
                isLoading={pipelineStep !== "idle" && pipelineStep !== "completed" && pipelineStep !== "error"}
              />
            </div>
          </div>

          <AgentStatusBadge currentStep={pipelineStep} />

          <HistorySidebar
            onSelectSession={handleSelectHistorySession}
            activeSessionId={activeSessionId}
          />
        </div>

        {/* Right Side: Clinical Results Workspace (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {errorMsg && (
            <div className="bg-rose-950/30 border border-rose-900/80 text-rose-200 rounded-xl p-4 text-xs flex items-start gap-3 shadow-lg shadow-rose-950/20">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold text-rose-100 uppercase tracking-wide">Execution Error Detected</p>
                <p className="text-rose-300 mt-1 leading-relaxed">{errorMsg}</p>
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
      <footer className="border-t border-slate-900 bg-slate-950/50 backdrop-blur py-4 text-center text-xs text-slate-500 tracking-wide mt-auto">
        Clinica Enterprise Workspace • Documenting patient sessions securely & efficiently.
      </footer>
    </div>
  );
}
