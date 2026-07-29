"use client";

import { useEffect, useState } from "react";
import { BarChart2 } from "lucide-react";

interface UsageStats {
  agentRuns: number;
  transcriptions: number;
  agentLimit: number;
  transcribeLimit: number;
}

export function UsageBanner() {
  const [stats, setStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const agentRemaining = Math.max(0, stats.agentLimit - stats.agentRuns);
  const transcribeRemaining = Math.max(0, stats.transcribeLimit - stats.transcriptions);

  return (
    <div className="no-print" style={{
      background: "linear-gradient(180deg, var(--bg-card) 0%, var(--bg-paper) 100%)",
      borderBottom: "1px solid var(--border-light)",
      padding: "5px 24px",
      display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16,
      boxShadow: "0 1px 0 rgba(255,255,255,0.9), 0 1px 4px rgba(0,0,0,0.03)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <BarChart2 style={{ width: 11, height: 11, color: "var(--teal-mid)" }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          System Quotas:
        </span>
      </div>
      {[
        { label: "Pipeline Runs", remaining: agentRemaining, limit: stats.agentLimit },
        { label: "Transcriptions", remaining: transcribeRemaining, limit: stats.transcribeLimit },
      ].map(item => (
        <div key={item.label} style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "3px 8px", borderRadius: 5,
          background: "var(--bg-subtle)", border: "1px solid var(--border-light)",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
        }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{item.label}:</span>
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: item.remaining === 0 ? "var(--red-mid)" : item.remaining < 5 ? "var(--amber-mid)" : "var(--teal-dark)",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            {item.remaining}/{item.limit}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-placeholder)" }}>remaining</span>
        </div>
      ))}
    </div>
  );
}
