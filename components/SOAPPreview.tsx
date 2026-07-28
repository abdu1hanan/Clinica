"use client";

import { useState } from "react";
import { FileText, Copy, Check, Stethoscope, Activity, ClipboardList, Calendar } from "lucide-react";
import { SOAPNote } from "@/lib/agent/state";

interface SOAPPreviewProps {
  soapNote: SOAPNote | null;
  patientName?: string;
  cleanedTranscript?: string;
}

export function SOAPPreview({ soapNote, patientName, cleanedTranscript }: SOAPPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"soap" | "transcript">("soap");

  if (!soapNote) {
    return (
      <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 bg-slate-950/40">
        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
        <p className="text-sm font-medium text-slate-400">Clinical SOAP Documentation Workspace</p>
        <p className="text-xs text-slate-600 mt-1">
          Complete patient intake dictation to generate structured medical documentation.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    const text = `CLINICAL SOAP NOTE — CLINICA PLATFORM
Patient: ${patientName || "Patient"}
------------------------------------------------
SUBJECTIVE (S):
${soapNote.subjective}

OBJECTIVE (O):
${soapNote.objective}

ASSESSMENT (A):
${soapNote.assessment}

PLAN (P):
${soapNote.plan}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    {
      key: "S",
      title: "Subjective (S)",
      desc: "Patient history, chief complaint & symptoms",
      content: soapNote.subjective,
      icon: <Stethoscope className="w-4 h-4 text-teal-400" />,
      color: "border-teal-500/30 bg-teal-950/10",
    },
    {
      key: "O",
      title: "Objective (O)",
      desc: "Vitals, measurements & clinical observations",
      content: soapNote.objective,
      icon: <Activity className="w-4 h-4 text-blue-400" />,
      color: "border-blue-500/30 bg-blue-950/10",
    },
    {
      key: "A",
      title: "Assessment (A)",
      desc: "Diagnosis & clinical risk evaluation",
      content: soapNote.assessment,
      icon: <ClipboardList className="w-4 h-4 text-purple-400" />,
      color: "border-purple-500/30 bg-purple-950/10",
    },
    {
      key: "P",
      title: "Plan (P)",
      desc: "Treatment plan, referrals & medications",
      content: soapNote.plan,
      icon: <Calendar className="w-4 h-4 text-emerald-400" />,
      color: "border-emerald-500/30 bg-emerald-950/10",
    },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Workspace Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("soap")}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeTab === "soap"
                  ? "bg-teal-600 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              SOAP Note
            </button>
            {cleanedTranscript && (
              <button
                onClick={() => setActiveTab("transcript")}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  activeTab === "transcript"
                    ? "bg-teal-600 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Formatted Transcript
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied SOAP
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Text
            </>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {activeTab === "soap" ? (
          <div className="space-y-3">
            {sections.map((sec) => (
              <div key={sec.key} className={`border rounded-lg p-3.5 space-y-1.5 ${sec.color}`}>
                <div className="flex items-center gap-2">
                  {sec.icon}
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{sec.title}</h4>
                  <span className="text-[10px] text-slate-500 font-normal">({sec.desc})</span>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pl-6 font-mono">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 whitespace-pre-line leading-relaxed">
            <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-2 font-sans">
              Cleaned & Formatted Transcript Output:
            </h4>
            {cleanedTranscript}
          </div>
        )}
      </div>
    </div>
  );
}
