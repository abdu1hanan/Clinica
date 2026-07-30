"use client";

import { useEffect, useState } from "react";
import { History, Clock, ChevronRight, User, Database } from "lucide-react";
import { fetchClinicalSessions, SessionRecord } from "@/lib/supabase/db";

interface HistorySidebarProps {
  onSelectSession: (session: SessionRecord) => void;
  activeSessionId?: string | null;
  localSessions?: SessionRecord[];
}

export function HistorySidebar({ onSelectSession, activeSessionId, localSessions = [] }: HistorySidebarProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const loadHistory = async () => {
    setLoading(true);
    const dbData = await fetchClinicalSessions(15);
    // Combine local in-memory sessions with database sessions (deduped by id)
    const combinedMap = new Map<string, SessionRecord>();
    localSessions.forEach((s) => combinedMap.set(s.id, s));
    dbData.forEach((s) => combinedMap.set(s.id, s));
    const merged = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setSessions(merged);
    setLoading(false);
  };

  useEffect(() => { loadHistory(); }, [activeSessionId, localSessions]);

  const triageStyle = (level: string) => ({
    HIGH: { background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" },
    MEDIUM: { background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#fbbf24" },
    LOW: { background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" },
  }[level] ?? { background: "#222226", border: "1px solid #333338", color: "#a1a1aa" });

  return (
    <div className="card" style={{ padding: 18, background: "#161618", border: "1px solid #242427", display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Database style={{ width: 15, height: 15, color: "#60a5fa" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>Patient Encounter Records</span>
            <History style={{ width: 12, height: 12, color: "#71717a" }} />
          </div>
          <button
            onClick={loadHistory}
            style={{ fontSize: 10, fontWeight: 600, color: "#2dd4bf", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}
          >
            Refresh
          </button>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "0 0 12px" }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#71717a", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Clock style={{ width: 12, height: 12 }} className="animate-spin" />
          Syncing encounters...
        </div>
      ) : sessions.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "24px 12px", fontSize: 11, color: "#52525b",
          border: "1px dashed #242427", borderRadius: 8, background: "#111113",
        }}>
          No encounter records generated yet. Run an intake dictation on Overview tab to generate records.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sessions.map((s) => {
            const isSelected = activeSessionId === s.id;
            const ts = triageStyle(s.triage_level);
            return (
              <button
                key={s.id}
                onClick={() => onSelectSession(s)}
                style={{
                  width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: 8,
                  border: isSelected ? "1px solid #2dd4bf" : "1px solid #242427",
                  background: isSelected ? "rgba(45,212,191,0.1)" : "#111113",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ minWidth: 0, paddingRight: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <User style={{ width: 12, height: 12, color: "#71717a", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.patient_name || "Anonymous Patient"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#71717a", fontFamily: "'IBM Plex Mono', monospace" }}>
                    <Clock style={{ width: 10, height: 10, flexShrink: 0 }} />
                    <span suppressHydrationWarning>
                      {mounted ? `${new Date(s.created_at).toLocaleDateString()} ${new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Recent Encounter"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ padding: "3px 8px", borderRadius: 4, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", ...ts }}>
                    {s.triage_level}
                  </span>
                  <ChevronRight style={{ width: 13, height: 13, color: "#71717a" }} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
