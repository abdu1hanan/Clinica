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
    const fullMessage = `Subject: ${followUp.subject}\n\n${followUp.body}`;
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-teal-400" />
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Patient Care Communication Summary</h3>
            <p className="text-[10px] text-slate-500">Plain-language patient instruction draft</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Draft
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" /> Copy Draft
            </>
          )}
        </button>
      </div>

      <div className="p-4">
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject:</span>
            <span className="text-xs font-medium text-slate-200">{followUp.subject}</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">
              Care Instructions & Return Precautions:
            </span>
            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
              {followUp.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
