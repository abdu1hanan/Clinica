"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, User, Clock, Check, FileText } from "lucide-react";
import { savePatientCustomNote, fetchPatientCustomNotes, PatientCustomNote } from "@/lib/supabase/db";

interface NoteLibraryProps {
  patientNames: string[];
}

export function NoteLibrary({ patientNames }: NoteLibraryProps) {
  const defaultList = patientNames.length > 0 ? patientNames : ["Marcus Bell", "Robert Chen", "David Torres", "Priya Sharma", "Marcus Williams"];
  const [selectedPatient, setSelectedPatient] = useState<string>(defaultList[0]);
  const [noteType, setNoteType] = useState<string>("Progress Note");
  const [content, setContent] = useState<string>("");
  const [notes, setNotes] = useState<PatientCustomNote[]>([]);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [filterPatient, setFilterPatient] = useState<string>("All Patients");

  useEffect(() => {
    if (defaultList.length > 0 && !defaultList.includes(selectedPatient)) {
      setSelectedPatient(defaultList[0]);
    }
  }, [patientNames]);

  const loadNotes = async () => {
    const data = await fetchPatientCustomNotes(filterPatient);
    setNotes(data);
  };

  useEffect(() => { loadNotes(); }, [filterPatient]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newNoteObj: PatientCustomNote = {
      id: `local-note-${Date.now()}`,
      created_at: new Date().toISOString(),
      patient_name: selectedPatient,
      note_type: noteType,
      content: content.trim(),
    };

    setNotes((prev) => [newNoteObj, ...prev]);
    setContent("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);

    // Save to Supabase
    await savePatientCustomNote(selectedPatient, noteType, content.trim());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <BookOpen style={{ width: 22, height: 22, color: "#2dd4bf" }} />
          Clinical Note Library
        </h1>
        <p style={{ fontSize: 13, color: "#a1a1aa", margin: "4px 0 0" }}>
          Write custom progress notes, phone call records, and lab reviews per patient
        </p>
      </div>

      {/* 2-Col Grid: Form Left, Note Feed Right */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        
        {/* LEFT: Write Note Form */}
        <form onSubmit={handleAddNote} className="card" style={{ padding: 20, background: "#161618", border: "1px solid #242427", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Plus style={{ width: 15, height: 15, color: "#2dd4bf" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>Add Custom Patient Note</span>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "10px 0 12px" }} />
          </div>

          {/* Select Patient Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Select Patient
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              style={{
                background: "#111113", border: "1px solid #242427", borderRadius: 8,
                color: "#ffffff", padding: "9px 12px", fontSize: 12, outline: "none",
              }}
            >
              {defaultList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Note Type Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Note Category
            </label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              style={{
                background: "#111113", border: "1px solid #242427", borderRadius: 8,
                color: "#ffffff", padding: "9px 12px", fontSize: 12, outline: "none",
              }}
            >
              <option value="Progress Note">Progress Note</option>
              <option value="Phone Call Record">Phone Call Record</option>
              <option value="Lab Result Review">Lab Result Review</option>
              <option value="Discharge Summary">Discharge Summary</option>
              <option value="Callback Instruction">Callback Instruction</option>
            </select>
          </div>

          {/* Note Content Textarea */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Note Details
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type clinical progress notes, patient call logs, or lab follow-up instructions..."
              rows={5}
              className="input-field"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!content.trim()}
            className="btn-white-pill"
            style={{
              padding: "10px 20px", fontSize: 12, width: "100%", display: "flex",
              alignItems: "center", justifyContent: "center", gap: 6,
              opacity: !content.trim() ? 0.5 : 1,
            }}
          >
            {savedSuccess ? <Check style={{ width: 14, height: 14, color: "#16a34a" }} /> : <Plus style={{ width: 14, height: 14 }} />}
            {savedSuccess ? "Note Saved!" : "Save Patient Note"}
          </button>
        </form>

        {/* RIGHT: Saved Notes Feed */}
        <div className="card" style={{ padding: 20, background: "#161618", border: "1px solid #242427", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText style={{ width: 15, height: 15, color: "#2dd4bf" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#ffffff" }}>Saved Note History</span>
              </div>

              {/* Filter Patient Dropdown */}
              <select
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
                style={{
                  background: "#111113", border: "1px solid #242427", borderRadius: 6,
                  color: "#a1a1aa", padding: "4px 8px", fontSize: 10, outline: "none",
                }}
              >
                <option value="All Patients">All Patients</option>
                {defaultList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", margin: "10px 0 12px" }} />
          </div>

          {notes.length === 0 ? (
            <div className="inset-panel" style={{ padding: 24, textAlign: "center", color: "#52525b", fontSize: 11 }}>
              No custom clinical notes logged yet. Use the form on the left to record patient progress notes.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
              {notes.map((n) => (
                <div key={n.id} className="inset-panel" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <User style={{ width: 12, height: 12, color: "#2dd4bf" }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>{n.patient_name}</span>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "#222226", color: "#a1a1aa" }}>
                      {n.note_type}
                    </span>
                  </div>

                  <p style={{ fontSize: 11, color: "#a1a1aa", margin: 0, lineHeight: 1.5, whiteSpace: "pre-line" }}>
                    {n.content}
                  </p>

                  <div style={{ fontSize: 9, color: "#71717a", fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
                    Logged on {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
