"use client";

import { useEffect, useState } from "react";
import { History, Clock, ChevronRight, User, AlertCircle, Database } from "lucide-react";
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Patient Records DB</h3>
        </div>
        <button
          onClick={loadHistory}
          className="text-[11px] font-semibold text-slate-500 hover:text-teal-400 transition-colors uppercase tracking-wider"
        >
          Refresh DB
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-slate-500 py-6 text-center flex items-center justify-center gap-2">
          <Clock className="w-3.5 h-3.5 animate-spin text-teal-500" />
          <span>Synchronizing records...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-xs text-slate-600 py-8 text-center border border-dashed border-slate-800 rounded-lg">
          No records discovered in Supabase yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {sessions.map((s) => {
            const isSelected = activeSessionId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectSession(s)}
                className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-teal-950/20 border-teal-500/50 text-slate-100 shadow-sm shadow-teal-950/50"
                    : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="space-y-1.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2 font-medium truncate text-slate-200">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate font-semibold">{s.patient_name || "Patient"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3 text-slate-600 shrink-0" />
                    <span>{new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${
                      s.triage_level === "HIGH"
                        ? "bg-rose-950/30 text-rose-300 border-rose-800/40"
                        : s.triage_level === "MEDIUM"
                        ? "bg-amber-950/30 text-amber-300 border-amber-800/40"
                        : "bg-emerald-950/30 text-emerald-300 border-emerald-800/40"
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
