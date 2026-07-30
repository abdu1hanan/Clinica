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

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript, React 19
- **Styling**: Tailwind CSS, Lucide Icons
- **State Orchestration**: LangGraph StateGraph pipeline
- **Speech Recognition**: Groq Whisper API (`whisper-large-v3`)
- **Language Intelligence Engine**: Google Gemini API (`gemini-2.0-flash`)
- **Backend & Database**: Supabase (PostgreSQL)
- **Deployment Target**: Vercel

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
4. Copy and execute the  SQL schema (located in `supabase/schema.sql`):

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
