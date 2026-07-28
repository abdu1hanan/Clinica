"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Play, Loader2, RefreshCw, FileText, Activity } from "lucide-react";

interface IntakeFormProps {
  onRunAgent: (input: string) => Promise<void>;
  isLoading: boolean;
}

const CLINICAL_PRESETS = [
  {
    label: "High Risk (Acute Cardiac)",
    text: "45-year-old male, John Smith. Complaining of severe crushing chest pain and shortness of breath starting 2 hours ago. Blood pressure 145/90 mmHg, heart rate 98 bpm, temperature 98.6 °F. Pain radiates to left arm. History of hypertension.",
  },
  {
    label: "Medium Risk (Abdominal)",
    text: "32-year-old female, Sarah Jenkins. Reporting persistent right lower quadrant abdominal pain for 18 hours, accompanied by nausea and mild fever. Blood pressure 122/78 mmHg, heart rate 84 bpm, temperature 101.2 °F. Unable to keep fluids down.",
  },
  {
    label: "Low Risk (Upper Respiratory)",
    text: "28-year-old male, Michael Brown. Presenting with mild nasal congestion, dry cough, and sore throat for 3 days. No fever, blood pressure 118/75 mmHg, heart rate 72 bpm, oxygen saturation 99%.",
  },
];

export function IntakeForm({ onRunAgent, isLoading }: IntakeFormProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleTranscribe(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
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

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setInputText((prev) => (prev ? `${prev}\n\n${data.text}` : data.text));
      } else {
        alert(data.error || "Speech transcription failed.");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      alert("Failed to process speech input.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onRunAgent(inputText.trim());
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-400" /> Patient Intake Dictation
          </h3>
          <p className="text-xs text-slate-400">Record dictation or input clinical history notes</p>
        </div>

        <div className="text-xs text-slate-500 font-medium">Dictation Mode</div>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Sample Clinical Scenarios:
        </span>
        <div className="flex flex-wrap gap-2">
          {CLINICAL_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(preset.text)}
              className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-md border border-slate-800 transition-colors font-medium"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or dictate patient intake notes... (e.g., '45yo male presenting with chest pain, BP 145/90 mmHg...')"
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/40 resize-none font-mono leading-relaxed"
          />

          {/* Voice Bar Control */}
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            {isTranscribing ? (
              <span className="text-[11px] text-teal-400 flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing speech input...
              </span>
            ) : isRecording ? (
              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-800 px-3 py-1 rounded-md">
                <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-rose-300">{formatTimer(recordSeconds)}</span>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded transition-colors"
                >
                  <MicOff className="w-3 h-3" /> Stop
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartRecording}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md border border-slate-700 transition-colors font-medium"
              >
                <Mic className="w-3.5 h-3.5 text-teal-400" /> Voice Record
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setInputText("")}
            className="text-xs text-slate-500 hover:text-slate-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Clear Entry
          </button>

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:hover:bg-teal-600 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-md shadow-sm transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing Clinical Pipeline...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Execute Pipeline
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
