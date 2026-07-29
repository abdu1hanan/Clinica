"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Play, Loader2, RefreshCw, FileText, Activity } from "lucide-react";

interface IntakeFormProps {
  onRunAgent: (input: string) => Promise<void>;
  isLoading: boolean;
}

const CLINICAL_PRESETS = [
  {
    label: "🫀 Cardiac Emergency",
    text: "62-year-old male, Robert Chen. Presenting with sudden onset crushing substernal chest pain radiating to the left arm and jaw, rated 9/10. Onset 45 minutes ago, associated with diaphoresis and nausea. History of hypertension and hyperlipidemia. Current medications: atorvastatin 40mg, lisinopril 10mg. Blood pressure 168/102 mmHg, heart rate 110 bpm, respiratory rate 20/min, oxygen saturation 94% on room air, temperature 98.8°F. No fever, no cough, no recent illness.",
  },
  {
    label: "🦴 Lumbar Strain",
    text: "54-year-old male, David Torres. Presenting with dull aching lower back pain, rated 6/10, onset 3 days ago after helping move heavy furniture. Denies radiation of pain down either leg, denies lower extremity numbness or tingling, denies bowel or bladder dysfunction. Physical exam shows mild bilateral lumbar paraspinal tenderness on palpation. Straight leg raise test is negative bilaterally. Gait is normal. Vitals are stable. Plan: ibuprofen 400mg by mouth every 6 hours as needed for pain, light walking encouraged, avoid heavy lifting, heat therapy to affected area.",
  },
  {
    label: "🩺 Acute Abdomen",
    text: "28-year-old female, Priya Sharma. 18-hour history of right lower quadrant abdominal pain, rated 8/10. Pain started periumbilically and migrated to RLQ. Associated with anorexia, nausea, and low-grade fever. No vomiting. Blood pressure 118/74 mmHg, heart rate 96 bpm, temperature 101.4°F, oxygen saturation 99%. Physical exam: RLQ tenderness with guarding, positive Rovsing's sign, rebound tenderness present. No history of similar episodes. LMP was 5 weeks ago. No known drug allergies.",
  },
  {
    label: "👶 Pediatric Croup",
    text: "8-year-old male, Marcus Williams. 2-day history of barking cough, worse at night. Mother reports audible stridor with agitation, but child is currently calm and in no acute distress. Low-grade fever of 100.8°F. No difficulty swallowing, no drooling. Blood pressure 98/62 mmHg, heart rate 104 bpm, oxygen saturation 97% on room air. Chest auscultation reveals mild inspiratory stridor, lungs otherwise clear bilaterally. No previous croup episodes. No known allergies. Up to date on immunizations.",
  },
  {
    label: "🧠 Neurological TIA",
    text: "68-year-old female, Margaret Sullivan. Presenting with acute onset right arm weakness and slurred speech lasting approximately 15 minutes, now fully resolved. Denies headache, vision changes, or facial drooping. History of type 2 diabetes, hypertension, and atrial fibrillation. Current medications: metformin 1000mg twice daily, amlodipine 10mg, warfarin 5mg. Blood pressure 158/94 mmHg, heart rate 88 bpm irregular, oxygen saturation 97%. NIHSS on arrival 0. Neurological exam currently normal. Last INR was 1.8 two weeks ago.",
  },
];

export function IntakeForm({ onRunAgent, isLoading }: IntakeFormProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordSeconds((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordSeconds(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

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
      setActivePreset(null);
    } catch {
      alert("Microphone access is unavailable or denied by browser.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const charCount = inputText.length;
  const charPct = Math.min(100, (charCount / 10000) * 100);

  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
            <FileText style={{ width: 14, height: 14, color: "var(--teal-mid)" }} />
            Patient Intake Dictation
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, margin: 0 }}>
            Dictate or type clinical notes — voice or text input
          </p>
        </div>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 4,
          background: "var(--teal-bg)", border: "1px solid var(--teal-border)", color: "var(--teal-dark)"
        }}>
          Dictation Mode
        </div>
      </div>

      {/* Presets */}
      <div>
        <span className="section-label" style={{ display: "block", marginBottom: 8 }}>Clinical Scenario Presets:</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {CLINICAL_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setInputText(preset.text); setActivePreset(idx); }}
              className="btn-raised"
              style={{
                textAlign: "left", padding: "7px 12px", fontSize: 11,
                ...(activePreset === idx ? {
                  background: "var(--teal-bg)",
                  borderColor: "var(--teal-border)",
                  color: "var(--teal-dark)",
                  boxShadow: "0 1px 3px rgba(13,148,136,0.15), inset 0 1px 0 rgba(255,255,255,0.6)",
                } : {}),
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea + Voice */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ position: "relative" }}>
          <textarea
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); setActivePreset(null); }}
            placeholder="Type or dictate patient intake notes... (e.g., '45yo male presenting with chest pain, BP 145/90 mmHg...')"
            rows={6}
            className="input-field"
            style={{ paddingBottom: 44 }}
          />

          {/* Voice Control Bar */}
          <div style={{ position: "absolute", right: 10, bottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            {isTranscribing ? (
              <span style={{
                fontSize: 10, display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 6, background: "var(--teal-bg)",
                border: "1px solid var(--teal-border)", color: "var(--teal-dark)",
              }}>
                <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" />
                Processing speech...
              </span>
            ) : isRecording ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 6,
                background: "var(--red-bg)", border: "1px solid var(--red-border)",
              }}>
                <Activity style={{ width: 11, height: 11, color: "var(--red-mid)" }} className="animate-pulse" />
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: "var(--red-dark)" }}>
                  {formatTimer(recordSeconds)}
                </span>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  style={{
                    display: "flex", alignItems: "center", gap: 3,
                    padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: "var(--red-mid)", border: "none", color: "white", cursor: "pointer",
                  }}
                >
                  <MicOff style={{ width: 10, height: 10 }} /> Stop
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartRecording}
                className="btn-raised"
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", fontSize: 11 }}
              >
                <Mic style={{ width: 12, height: 12, color: "var(--teal-mid)" }} />
                Voice Record
              </button>
            )}
          </div>
        </div>

        {/* Char count */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <div className="quality-bar-track" style={{ flex: 1, maxWidth: 120 }}>
              <div
                className="quality-bar-fill"
                style={{
                  width: `${charPct}%`,
                  background: charPct > 90 ? "var(--red-mid)" : charPct > 70 ? "var(--amber-mid)" : "var(--teal-mid)",
                }}
              />
            </div>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{charCount.toLocaleString()} / 10,000</span>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => { setInputText(""); setActivePreset(null); }}
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
            >
              <RefreshCw style={{ width: 11, height: 11 }} /> Clear
            </button>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", fontSize: 12 }}
            >
              {isLoading ? (
                <><Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> Processing Pipeline...</>
              ) : (
                <><Play style={{ width: 13, height: 13, fill: "white" }} /> Execute Pipeline</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
