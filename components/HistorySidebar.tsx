"use client";

import { useEffect, useState } from "react";
import { History, Clock, ChevronRight, User, Database } from "lucide-react";
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

  useEffect(() => { loadHistory(); }, [activeSessionId]);

  const triageStyle = (level: string) => ({
    HIGH: { background: "#fee2e2", border: "1px solid #fca5a5", color: "#7f1d1d" },
    MEDIUM: { background: "#fef3c7", border: "1px solid #fcd34d", color: "#78350f" },
    LOW: { background: "#dcfce7", border: "1px solid #86efac", color: "#14532d" },
  }[level] ?? { background: "var(--bg-subtle)", border: "1px solid var(--border-light)", color: "var(--text-muted)" });

  return (
    <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10, borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Database style={{ width: 14, height: 14, color: "var(--blue-mid)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>Patient Records</span>
          <History style={{ width: 11, height: 11, color: "var(--text-muted)" }} />
        </div>
        <button
          onClick={loadHistory}
          style={{ fontSize: 10, fontWeight: 600, color: "var(--teal-dark)", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Clock style={{ width: 12, height: 12 }} className="animate-spin" />
          Syncing records...
        </div>
      ) : sessions.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "20px 0", fontSize: 11, color: "var(--text-placeholder)",
          border: "2px dashed var(--border-light)", borderRadius: 8,
        }}>
          No session records found in database.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 280, overflowY: "auto" }}>
          {sessions.map((s) => {
            const isSelected = activeSessionId === s.id;
            const ts = triageStyle(s.triage_level);
            return (
              <button
                key={s.id}
                onClick={() => onSelectSession(s)}
                style={{
                  width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 8,
                  border: isSelected ? "1px solid var(--teal-border)" : "1px solid var(--border-light)",
                  background: isSelected ? "var(--teal-bg)" : "white",
                  boxShadow: isSelected ? "0 1px 4px rgba(13,148,136,0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ minWidth: 0, paddingRight: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <User style={{ width: 11, height: 11, color: "var(--text-muted)", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.patient_name || "Anonymous Patient"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-muted)", fontFamily: "'IBM Plex Mono', monospace" }}>
                    <Clock style={{ width: 10, height: 10, flexShrink: 0 }} />
                    <span>
                      {new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", ...ts }}>
                    {s.triage_level}
                  </span>
                  <ChevronRight style={{ width: 12, height: 12, color: "var(--text-muted)" }} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
