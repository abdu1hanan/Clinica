"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Play, Loader2, RefreshCw, Pause, Radio } from "lucide-react";

export const CLINICAL_PRESETS = [
  {
    label: "Respiratory / Bronchitis (Script 2)",
    text: "42-year-old female presenting with a 2-day history of productive cough and shortness of breath. Subjective low-grade fever recorded at home (100.4°F). Lungs have diffuse mild wheezing on the right side, heart rate is elevated at 98. Plan: Albuterol inhaler, order Chest X-ray.",
  },
  {
    label: "Cardiac Emergency",
    text: "62-year-old male, Robert Chen. Presenting with sudden onset crushing substernal chest pain radiating to the left arm and jaw, rated 9/10. Onset 45 minutes ago, associated with diaphoresis and nausea. History of hypertension and hyperlipidemia. Current medications: atorvastatin 40mg, lisinopril 10mg. Blood pressure 168/102 mmHg, heart rate 110 bpm, respiratory rate 20/min, oxygen saturation 94% on room air, temperature 98.8°F.",
  },
  {
    label: "Lumbar Strain",
    text: "54-year-old male, David Torres. Presenting with dull aching lower back pain, rated 6/10, onset 3 days ago after helping move heavy furniture. Denies radiation of pain down either leg, denies lower extremity numbness or tingling, denies bowel or bladder dysfunction. Physical exam shows mild bilateral lumbar paraspinal tenderness on palpation. Straight leg raise test is negative bilaterally. Gait is normal. Vitals are stable. Plan: ibuprofen 400mg by mouth every 6 hours as needed for pain, light walking encouraged, avoid heavy lifting.",
  },
  {
    label: "Acute Abdomen",
    text: "28-year-old female, Priya Sharma. 18-hour history of right lower quadrant abdominal pain, rated 8/10. Pain started periumbilically and migrated to RLQ. Associated with anorexia, nausea, and low-grade fever. No vomiting. Blood pressure 118/74 mmHg, heart rate 96 bpm, temperature 101.4°F. Physical exam: RLQ tenderness with guarding, positive Rovsing's sign, rebound tenderness present.",
  },
  {
    label: "Pediatric Croup",
    text: "8-year-old male, Marcus Williams. 2-day history of barking cough, worse at night. Mother reports audible stridor with agitation, but child is currently calm and in no acute distress. Low-grade fever of 100.8°F. Blood pressure 98/62 mmHg, heart rate 104 bpm, oxygen saturation 97% on room air. Chest auscultation reveals mild inspiratory stridor, lungs clear bilaterally.",
  },
  {
    label: "Neurological TIA",
    text: "68-year-old female, Margaret Sullivan. Presenting with acute onset right arm weakness and slurred speech lasting approximately 15 minutes, now fully resolved. History of type 2 diabetes, hypertension, and atrial fibrillation. Current medications: metformin 1000mg twice daily, amlodipine 10mg, warfarin 5mg. Blood pressure 158/94 mmHg, heart rate 88 bpm irregular. NIHSS 0. Neurological exam currently normal.",
  },
];

interface IntakeFormProps {
  onRunAgent: (input: string) => Promise<void>;
  isLoading: boolean;
}

export function IntakeForm({ onRunAgent, isLoading }: IntakeFormProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => setRecordSeconds((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording, isPaused]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleTranscribe(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);
      setActivePreset(null);
    } catch {
      alert("Microphone access is unavailable or denied by browser.");
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const handleTranscribe = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.text) {
        setInputText((prev) => (prev ? `${prev}\n\n${data.text}` : data.text));
      } else {
        alert(data.error || "Speech transcription failed.");
      }
    } catch {
      alert("Failed to process speech input.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) onRunAgent(inputText.trim());
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m.toString().padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
  };

  const charCount = inputText.length;
  const charPct = Math.min(100, (charCount / 10000) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── ROW 1: Main Recorder (Left) + Sample Presets Box (Right) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "stretch" }}>
        
        {/* LEFT: Main Recorder Card */}
        <div className="card" style={{ padding: 20, background: "#18181b", border: "1px solid #27272a", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
          {/* Header Status Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: isRecording ? "#ef4444" : "#2dd4bf",
                boxShadow: isRecording ? "0 0 8px #ef4444" : "0 0 8px #2dd4bf",
              }} className="animate-pulse" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5" }}>
                {isRecording ? (isPaused ? "Recording paused" : "Recording active") : "Ready to record"}
              </span>
            </div>

            {/* Live transcription badge — NO EMOJIS, simple green dot */}
            <div style={{
              background: "#27272a",
              border: "1px solid #3f3f46",
              borderRadius: 999,
              padding: "3px 10px",
              fontSize: 10,
              color: "#a1a1aa",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2dd4bf" }} />
              Live transcription on
            </div>
          </div>

          <div style={{ fontSize: 11, color: "#71717a", margin: 0 }}>
            Encounter: {activePreset !== null ? CLINICAL_PRESETS[activePreset].label : "General consultation intake"}
          </div>

          {/* Timer & Waveform */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
            <div style={{
              fontSize: 40,
              fontWeight: 800,
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#ffffff",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}>
              {isRecording ? formatTimer(recordSeconds) : "00 : 00"}
            </div>

            {/* Waveform Visualizer */}
            <div style={{ display: "flex", alignItems: "center", gap: 3, height: 28 }}>
              {[14, 22, 10, 26, 18, 28, 12, 24, 16, 20, 10, 25, 15, 22].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: isRecording && !isPaused ? undefined : `${h}px`,
                    background: isRecording ? (isPaused ? "#71717a" : "#2dd4bf") : "#3f3f46",
                    borderRadius: 2,
                    animationDelay: `${i * 0.08}s`,
                  }}
                  className={isRecording && !isPaused ? "wave-bar" : ""}
                />
              ))}
            </div>
          </div>

          {/* Recorder Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {isRecording ? (
                <>
                  <button
                    type="button"
                    onClick={handlePauseRecording}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: "#27272a", border: "1px solid #3f3f46", color: "#f4f4f5", cursor: "pointer",
                    }}
                  >
                    <Pause style={{ width: 12, height: 12 }} /> {isPaused ? "Resume" : "Pause"}
                  </button>
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 16px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", cursor: "pointer",
                    }}
                  >
                    Stop & generate
                  </button>
                </>
              ) : (
                /* New Recording Button — Curved Pill, White with Black Text/Icon */
                <button
                  type="button"
                  onClick={handleStartRecording}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 20px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: "#ffffff", color: "#000000", border: "none", cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(255,255,255,0.2)",
                  }}
                >
                  <Mic style={{ width: 14, height: 14, color: "#000000" }} /> New recording
                </button>
              )}
            </div>

            <div style={{ fontSize: 10, color: "#71717a", display: "flex", alignItems: "center", gap: 5 }}>
              <Radio style={{ width: 12, height: 12, color: "#2dd4bf" }} />
              {isRecording ? "Input level good" : "Mic standby"}
            </div>
          </div>
        </div>

        {/* RIGHT: Sample Clinical Scenarios Presets Box (Dedicated Box, NO EMOJIS) */}
        <div className="card" style={{ padding: 18, background: "#18181b", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#f4f4f5" }}>Clinical Scenario Presets</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#27272a", color: "#a1a1aa" }}>6 Presets</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, justifyContent: "center" }}>
            {CLINICAL_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => { setInputText(preset.text); setActivePreset(idx); }}
                className="btn-raised"
                style={{
                  textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 500,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  borderRadius: 6,
                  ...(activePreset === idx ? {
                    background: "rgba(45,212,191,0.15)",
                    borderColor: "rgba(45,212,191,0.4)",
                    color: "#2dd4bf",
                  } : {}),
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 2 LEFT: Transcription Textarea Box ── */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: 18, background: "#18181b", border: "1px solid #27272a", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f4f4f5" }}>Clinical Dictation Transcript</span>
          {isTranscribing && (
            <span style={{ fontSize: 10, color: "#2dd4bf", display: "flex", alignItems: "center", gap: 5 }}>
              <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" /> Processing speech...
            </span>
          )}
        </div>

        <textarea
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setActivePreset(null); }}
          placeholder="Type or dictate patient intake notes... (e.g. '42yo female presenting with cough and shortness of breath...')"
          rows={5}
          className="input-field"
        />

        {/* Footer controls: Clear button on LEFT with char bar, Execute Pipeline button on RIGHT (White rounded pill with black text) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
          {/* LEFT: Clear button + Character bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => { setInputText(""); setActivePreset(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600,
                color: "#a1a1aa", background: "#27272a", border: "1px solid #3f3f46",
                borderRadius: 6, padding: "4px 10px", cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 11, height: 11 }} /> Clear
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div className="quality-bar-track" style={{ width: 80 }}>
                <div
                  className="quality-bar-fill"
                  style={{
                    width: `${charPct}%`,
                    background: charPct > 90 ? "#ef4444" : charPct > 70 ? "#f59e0b" : "#2dd4bf",
                  }}
                />
              </div>
              <span style={{ fontSize: 10, color: "#71717a", fontFamily: "'IBM Plex Mono', monospace" }}>
                {charCount.toLocaleString()} / 10,000
              </span>
            </div>
          </div>

          {/* RIGHT: Execute Pipeline Button — White Pill, Black Text & Black Icon */}
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 22px", borderRadius: 999, fontSize: 12, fontWeight: 800,
              background: "#ffffff", color: "#000000", border: "none", cursor: "pointer",
              boxShadow: "0 2px 8px rgba(255,255,255,0.2)",
              opacity: isLoading || !inputText.trim() ? 0.5 : 1,
            }}
          >
            {isLoading ? (
              <><Loader2 style={{ width: 14, height: 14, color: "#000000" }} className="animate-spin" /> Processing...</>
            ) : (
              <><Play style={{ width: 14, height: 14, fill: "#000000", color: "#000000" }} /> Execute Pipeline</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
