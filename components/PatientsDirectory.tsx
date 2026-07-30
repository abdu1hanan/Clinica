"use client";

import { useState } from "react";
import { Users, User, Clock, ShieldAlert, Heart, Activity, FileText, ChevronRight } from "lucide-react";
import { SessionRecord } from "@/lib/supabase/db";

interface PatientsDirectoryProps {
  sessions: SessionRecord[];
  onSelectPatientEncounter?: (session: SessionRecord) => void;
}

export function PatientsDirectory({ sessions, onSelectPatientEncounter }: PatientsDirectoryProps) {
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);

  // Group sessions dynamically by patient_name
  const patientMap = new Map<string, SessionRecord[]>();

  sessions.forEach((s) => {
    const name = s.patient_name || "Patient Encounter";
    const existing = patientMap.get(name) || [];
    patientMap.set(name, [...existing, s]);
  });

  const patientNames = Array.from(patientMap.keys());
  const activePatient = selectedPatientName || patientNames[0];
  const activeSessions = activePatient ? (patientMap.get(activePatient) || []) : [];
  const latestSession = activeSessions[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Users style={{ width: 22, height: 22, color: "#2dd4bf" }} />
            Patients Directory
          </h1>
          <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>
            Comprehensive patient encounter directory & medical records database
          </p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "#222226", color: "#a1a1aa", border: "1px solid #333338" }}>
          {patientNames.length} Registered Patients
        </span>
      </div>

      {patientNames.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center", background: "#161618", border: "1px solid #242427" }}>
          <Users style={{ width: 36, height: 36, color: "#3a3a40", margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", margin: 0 }}>No Patients Registered Yet</h3>
          <p style={{ fontSize: 12, color: "#71717a", margin: "6px 0 0" }}>
            Execute an intake dictation on the Overview tab. Patient names will be dynamically extracted and added to this directory automatically!
          </p>
        </div>
      ) : (
        /* 2-Column Directory Layout */
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, alignItems: "start" }}>
          
          {/* LEFT COLUMN: Dynamic Patient List Card */}
          <div className="card" style={{ padding: 18, background: "#161618", border: "1px solid #242427", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>Patient Registry</span>
              <span style={{ fontSize: 10, color: "#71717a" }}>Auto-extracted</span>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "4px 0 6px" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {patientNames.map((name) => {
                const count = (patientMap.get(name) || []).length;
                const isSelected = name === activePatient;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedPatientName(name)}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8,
                      border: isSelected ? "1px solid #2dd4bf" : "1px solid #242427",
                      background: isSelected ? "rgba(45,212,191,0.12)" : "#111113",
                      color: isSelected ? "#2dd4bf" : "#ffffff",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%", background: isSelected ? "#2dd4bf" : "#222226",
                        color: isSelected ? "#000000" : "#a1a1aa", fontSize: 11, fontWeight: 800,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{name}</span>
                    </div>

                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "#222226", color: "#a1a1aa" }}>
                      {count} {count === 1 ? "Encounter" : "Encounters"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Active Patient Medical Profile & History */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {activePatient && (
              <div className="card" style={{ padding: 22, background: "#161618", border: "1px solid #242427", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", background: "rgba(45,212,191,0.15)",
                      border: "1px solid rgba(45,212,191,0.3)", color: "#2dd4bf",
                      fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {activePatient.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", margin: 0 }}>
                        {activePatient}
                      </h2>
                      <p style={{ fontSize: 11, color: "#71717a", margin: "2px 0 0" }}>
                        Patient Record ID: #{activePatient.replace(/\s+/g, "").toUpperCase()}-2026
                      </p>
                    </div>
                  </div>

                  {latestSession && (
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 6,
                      background: latestSession.triage_level === "HIGH" ? "rgba(239,68,68,0.2)" : latestSession.triage_level === "MEDIUM" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)",
                      color: latestSession.triage_level === "HIGH" ? "#f87171" : latestSession.triage_level === "MEDIUM" ? "#fbbf24" : "#4ade80",
                    }}>
                      {latestSession.triage_level} RISK ENCOUNTER
                    </span>
                  )}
                </div>

                <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: 0 }} />

                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#ffffff", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock style={{ width: 14, height: 14, color: "#2dd4bf" }} />
                    Recorded Encounter History ({activeSessions.length})
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {activeSessions.map((s) => (
                      <div
                        key={s.id}
                        className="inset-panel"
                        style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#ffffff", fontFamily: "'IBM Plex Mono', monospace" }}>
                            {new Date(s.created_at).toLocaleString()}
                          </span>
                          {onSelectPatientEncounter && (
                            <button
                              onClick={() => onSelectPatientEncounter(s)}
                              className="btn-dark-pill"
                              style={{ padding: "4px 10px", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}
                            >
                              View SOAP Card <ChevronRight style={{ width: 10, height: 10 }} />
                            </button>
                          )}
                        </div>

                        <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>
                          <span style={{ color: "#ffffff", fontWeight: 600 }}>Assessment: </span>
                          {s.soap_note?.assessment || "Clinical assessment recorded"}
                        </p>

                        <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>
                          <span style={{ color: "#ffffff", fontWeight: 600 }}>Plan: </span>
                          {s.soap_note?.plan || "Care plan recorded"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
