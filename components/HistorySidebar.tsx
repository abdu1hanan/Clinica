"use client";

import { useEffect, useState } from "react";
import { History, Clock, ChevronRight, User, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { fetchClinicalSessions, SessionRecord } from "@/lib/supabase/db";

interface HistorySidebarProps {
  onSelectSession: (session: SessionRecord) => void;
  activeSessionId?: string | null;
}

export function HistorySidebar({ onSelectSession, activeSessionId }: HistorySidebarProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    const data = await fetchClinicalSessions(15);
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [activeSessionId]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5">
          <History className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-semibold text-slate-200">Supabase Session History</h3>
        </div>
        <button
          onClick={loadHistory}
          className="text-[11px] text-slate-500 hover:text-teal-400 transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500 py-4 text-center">Loading past sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="text-xs text-slate-600 py-4 text-center">
          No saved sessions found in Supabase yet.
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {sessions.map((s) => {
            const isSelected = activeSessionId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSession(s)}
                className={`w-full text-left p-2 rounded-md border text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-teal-950/40 border-teal-500/60 text-slate-100"
                    : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-1 font-medium truncate text-slate-200">
                    <User className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{s.patient_name || "Patient"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <span>{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                      s.triage_level === "HIGH"
                        ? "bg-rose-950 text-rose-300 border border-rose-800/50"
                        : s.triage_level === "MEDIUM"
                        ? "bg-amber-950 text-amber-300 border border-amber-800/50"
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800/50"
                    }`}
                  >
                    {s.triage_level}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
