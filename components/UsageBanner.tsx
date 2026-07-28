"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Activity } from "lucide-react";

export function UsageBanner() {
  const [stats, setStats] = useState<{
    agentRuns: number;
    transcriptions: number;
    agentLimit: number;
    transcribeLimit: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => null);
  }, []);

  if (!stats) return null;

  const agentRemaining = Math.max(0, stats.agentLimit - stats.agentRuns);
  const transcribeRemaining = Math.max(0, stats.transcribeLimit - stats.transcriptions);

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs py-2 px-4 flex items-center justify-between text-slate-400">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
        <span>
          <strong className="text-slate-200">System Quotas:</strong> Active daily limits enforced for public endpoints
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-teal-400" />
          <span>Pipeline Executions: <strong className="text-teal-300">{agentRemaining}</strong>/{stats.agentLimit} remaining today</span>
        </span>
        <span className="text-slate-700">|</span>
        <span>Speech Transcriptions: <strong className="text-teal-300">{transcribeRemaining}</strong>/{stats.transcribeLimit} remaining today</span>
      </div>
    </div>
  );
}
