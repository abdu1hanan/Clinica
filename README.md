# Clinica — Intelligent Clinical Documentation & Triage Platform

Clinica is an enterprise-grade clinical documentation and safety triage platform designed to streamline medical intake processing, standardize SOAP (Subjective, Objective, Assessment, Plan) documentation, scan for acute triage risk indicators, and generate plain-language patient care instructions.

The system processes oral dictation or written intake notes through a stateful multi-stage execution pipeline, ensuring clinical accuracy, quality control verification, and automated database persistence.

---

## Key Capabilities

- **Speech Dictation to Text**: Instant voice input transcription with medical terminology normalization using Groq Whisper.
- **Transcript Cleaning**: Automatic normalization of spoken vital signs, formatting, and phonetic error correction.
- **Entity Extraction**: Extraction of patient demographics, vitals (BP, HR, Temp, SpO2), chief complaint, symptoms, and medical history.
- **Clinical Triage Matrix**: Rule-based risk assessment assigning risk ratings (**HIGH**, **MEDIUM**, **LOW**) and flagging red-flag clinical triggers.
- **SOAP Note Formatting**: Automated generation of standardized Subjective, Objective, Assessment, and Plan documentation.
- **Quality Control Loop**: Verification stage that evaluates SOAP completeness and routes back for corrections if required.
- **Patient Follow-Up Generator**: Plain-language patient communication instructions with return precautions.
- **Persistent Audit Logging**: Supabase database persistence for clinical sessions and daily usage audit logs.

---

## Pipeline Workflow & State Graph Architecture

```
                               ┌─────────────────────────┐
                               │   Patient Intake Input  │
                               └────────────┬────────────┘
                                            │
                                            ▼
                             ┌─────────────────────────────┐
                             │  Node 1: Clean Transcript   │
                             └──────────────┬──────────────┘
                                            │
                                            ▼
                             ┌─────────────────────────────┐
                             │  Node 2: Extract Entities   │
                             └──────────────┬──────────────┘
                                            │
                                            ▼
                             ┌─────────────────────────────┐
                             │  Node 3: Clinical Triage    │
                             └──────────────┬──────────────┘
                                            │
                                            ▼
                             ┌─────────────────────────────┐
                             │  Node 4: SOAP Generation    │
                             └──────────────┬──────────────┘
                                            │
                                            ▼
                             ┌─────────────────────────────┐
                             │  Node 5: SOAP Verification  │
                             └──────────────┬──────────────┘
                                            │
                             ┌──────────────┴──────────────┐
                             │ Is SOAP valid or retried?   │
                             └──┬───────────────────────┬──┘
                       Invalid  │                       │ Valid / Retry Max
                    (Retry < 2) │                       │
                                ▼                       ▼
                   ┌──────────────────┐    ┌─────────────────────────────┐
                   │ Node 4: Re-SOAP  │    │  Node 6: Patient Follow-Up  │
                   └──────────────────┘    └──────────────┬──────────────┘
                                                          │
                                                          ▼
                                           ┌─────────────────────────────┐
                                           │  Supabase DB Persistence &  │
                                           │   Client Dashboard Output   │
                                           └─────────────────────────────┘
```

---

## Quotas & Anti-Abuse Protections

To protect system resources and ensure reliable performance, Clinica enforces active daily quotas and payload safety checks:

| Protections | Enforced Limits | Behavior on Violation |
| :--- | :--- | :--- |
| **Pipeline Runs Quota** | Max **50 executions** / day | HTTP `429 Too Many Requests` status with quota message. |
| **Audio Transcriptions Quota** | Max **30 transcriptions** / day | HTTP `429 Too Many Requests` status with fallback notice. |
| **Text Payload Guard** | Max **10,000 characters** / request | HTTP `400 Bad Request` status rejecting oversized text. |
| **Audio Upload Guard** | Max **25 MB** / file | HTTP `400 Bad Request` status rejecting oversized audio. |

Quotas are tracked globally using the Supabase `usage_logs` database table with atomic in-memory fallback.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript, React 19
- **Styling**: Tailwind CSS, Lucide Icons
- **State Orchestration**: LangGraph StateGraph pipeline
- **Speech Recognition**: Groq Whisper API (`whisper-large-v3`)
- **Language Intelligence Engine**: Google Gemini API (`gemini-2.0-flash`)
- **Backend & Database**: Supabase (PostgreSQL)
- **Deployment Target**: Vercel

---

## Repository Structure

```
clinica/
├── app/
│   ├── api/
│   │   ├── agent/
│   │   │   └── route.ts        # Primary pipeline execution endpoint (with quota & payload checks)
│   │   ├── transcribe/
│   │   │   └── route.ts        # Audio speech-to-text endpoint (with file size & quota checks)
│   │   └── usage/
│   │       └── route.ts        # Daily quota usage metrics endpoint
│   ├── globals.css             # Base styles & custom clinical grid aesthetics
│   ├── layout.tsx              # Root application layout with persistent header banner
│   └── page.tsx                # Main clinical dashboard interface
├── components/
│   ├── AgentStatusBadge.tsx    # State execution node status visualizer
│   ├── FollowUpPanel.tsx       # Patient care summary display & copy utility
│   ├── HistorySidebar.tsx      # Past clinical session logs
│   ├── IntakeForm.tsx          # Patient intake dictation & voice recording interface
│   ├── SOAPPreview.tsx         # Structured SOAP medical note viewer
│   ├── TriageBadge.tsx         # Triage risk rating & flag indicator display
│   └── UsageBanner.tsx         # Real-time system quota metric display
├── lib/
│   ├── agent/
│   │   ├── nodes/              # 6 pipeline node functions
│   │   ├── tools/              # Clinical triage matrix & follow-up tools
│   │   ├── graph.ts            # LangGraph workflow definition & conditional routing
│   │   └── state.ts            # LangGraph Annotation state schemas
│   ├── supabase/
│   │   ├── client.ts           # Supabase browser client
│   │   ├── db.ts               # Database persistent storage methods
│   │   └── server.ts           # Supabase server client
│   └── rateLimit.ts            # System quota & rate limiter engine
└── supabase/
    └── schema.sql              # Supabase table definitions (`sessions`, `usage_logs`)
```

---

## Prerequisites & Credentials Acquisition Guide

To run Clinica locally or deploy to production, obtain the following credentials:

### 1. Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Log in with your Google account.
3. Click **Get API Key** -> **Create API Key in new project**.
4. Copy the generated key. (Used as `GOOGLE_API_KEY`).

### 2. Groq API Key
1. Visit [Groq Console](https://console.groq.com/).
2. Sign up or log in.
3. Navigate to **API Keys** and click **Create API Key**.
4. Copy the key. (Used as `GROQ_API_KEY`).

### 3. Supabase Project Credentials & Database Setup
1. Visit [Supabase](https://supabase.com/) and create a free project.
2. Under **Project Settings** -> **API**, copy:
   - Project URL (Used as `NEXT_PUBLIC_SUPABASE_URL`)
   - anon / public key (Used as `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - service_role key (Used as `SUPABASE_SERVICE_ROLE_KEY`)
3. Navigate to **SQL Editor** in your Supabase Dashboard.
4. Copy and execute the following SQL schema (located in `supabase/schema.sql`):

```sql
-- 1. Create sessions table for clinical session records
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  patient_name TEXT DEFAULT 'Anonymous Patient',
  raw_input TEXT NOT NULL,
  triage_level TEXT NOT NULL,
  triage_flags TEXT[],
  soap_note JSONB NOT NULL,
  follow_up JSONB NOT NULL
);

-- 2. Create usage_logs table for daily rate limiting
CREATE TABLE IF NOT EXISTS public.usage_logs (
  date DATE PRIMARY KEY,
  agent_runs INT DEFAULT 0,
  transcriptions INT DEFAULT 0
);

-- 3. Row Level Security policies
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write access to sessions"
  ON public.sessions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read/write access to usage_logs"
  ON public.usage_logs FOR ALL USING (true) WITH CHECK (true);
```

---

## Local Installation & Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/abdu1hanan/Clinica.git
cd Clinica
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:

```env
# Language & Speech Services
GOOGLE_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Supabase Storage & Persistence
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Launch Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step-by-Step Real-World Testing Guide

### Test Case 1: High Risk Emergency Intake (Presets)
1. In the **Patient Intake & Dictation** section, click **Preset 1 (High Risk)**.
2. Click **Execute Clinical Pipeline**.
3. Verify:
   - Triage Badge displays **HIGH RISK** with flagged red-flag triggers (e.g. Chest pain, Radiation).
   - SOAP Note preview shows populated Subjective, Objective, Assessment, and Plan fields.
   - Patient Follow-Up tab updates with clear instructions and return precautions.
   - History Sidebar logs the new session.

### Test Case 2: Moderate Risk Intake (Presets)
1. Click **Preset 2 (Moderate Risk)**.
2. Click **Execute Clinical Pipeline**.
3. Verify: Triage Badge updates to **MEDIUM RISK** (RLQ Pain, Fever).

### Test Case 3: Live Microphone Dictation
1. Click **Start Dictation Recording**.
2. Speak clinical notes aloud (e.g., *"Patient Jane Doe, 50 years old, complaining of severe headache and BP 150 over 95"*).
3. Click **Stop Recording**.
4. Verify audio is transcribed by Groq Whisper and populated into the intake box automatically.

### Test Case 4: Daily Quota & Anti-Abuse Checks
1. View the **System Quotas** banner at top right.
2. If daily quota limits (50 agent runs / 30 transcriptions) are reached, the API responds with HTTP 429 and displays a quota limit notification.

---

## Vercel Deployment Instructions

### Pre-Deployment Check
Run local production build to ensure clean compilation:
```bash
npm run build
```

### Option A: Deployment via Vercel Web Dashboard (Recommended)
1. Push your repository to GitHub.
2. Log into [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **Add New** -> **Project**.
4. Import your **Clinica** GitHub repository.
5. In the **Environment Variables** section, add:
   - `GOOGLE_API_KEY`
   - `GROQ_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Click **Deploy**. Vercel will build and assign a live production URL.

### Option B: Deployment via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```
Follow CLI prompts and add environment variables via `vercel env add` or in the project dashboard.

---

## License
MIT License. Built for clinical workflow automation and candidate technical verification.
