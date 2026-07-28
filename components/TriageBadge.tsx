"use client";

import { AlertTriangle, AlertCircle, CheckCircle, ShieldAlert } from "lucide-react";
import { TriageResult } from "@/lib/agent/state";

interface TriageBadgeProps {
  triageResult: TriageResult | null;
}

export function TriageBadge({ triageResult }: TriageBadgeProps) {
  if (!triageResult) return null;

  const { triage_level, flags, recommendation } = triageResult;

  const styles = {
    HIGH: {
      border: "border-rose-500/40 bg-rose-950/20",
      badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      icon: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />,
      title: "HIGH CLINICAL RISK SEVERITY",
    },
    MEDIUM: {
      border: "border-amber-500/40 bg-amber-950/20",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
      title: "MODERATE CLINICAL RISK SEVERITY",
    },
    LOW: {
      border: "border-emerald-500/40 bg-emerald-950/20",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
      title: "LOW ROUTINE CLINICAL RISK",
    },
  }[triage_level];

  return (
    <div className={`border rounded-xl p-4 space-y-3 ${styles.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {styles.icon}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-100 uppercase">{styles.title}</h4>
            <p className="text-[11px] text-slate-400">Clinical Safety Rule Engine Evaluation</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-md border ${styles.badge}`}>
          {triage_level} RISK
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/70 p-3 rounded-lg border border-slate-800">
        {recommendation}
      </p>

      {flags && flags.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Clinical Red Flags Identified ({flags.length}):
          </span>
          <div className="space-y-1.5">
            {flags.map((flag, idx) => (
              <div key={idx} className="text-xs bg-slate-950/80 border border-slate-800 rounded-md p-2.5 flex items-start gap-2">
                <span className="font-semibold text-slate-200 capitalize underline decoration-amber-500/40 shrink-0">
                  {flag.symptom}:
                </span>
                <span className="text-slate-300 leading-normal">{flag.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
