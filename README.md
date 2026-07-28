# Clinica — Intelligent Clinical Documentation & Triage Platform

Clinica is a web-based clinical documentation platform designed to streamline patient intake, clinical triage evaluation, SOAP note generation, and patient care instructions.

The system processes oral or written patient intake, identifies high-risk clinical indicators, formats standard SOAP (Subjective, Objective, Assessment, Plan) medical documentation, and drafts plain-language follow-up summaries for patient communication.

---

## Workflow

The application executes a multi-stage sequential processing workflow:

1. **Voice Recording**: Clinicians record patient intake audio using browser media streams.
2. **Speech-to-Text**: Audio streams are processed via serverless endpoints using Groq Whisper.
3. **Transcript Formatting**: Unstructured speech outputs are cleaned, normalized, and formatted.
4. **SOAP Note Generation**: Extracted clinical entities are structured into Subjective, Objective, Assessment, and Plan documentation.
5. **Patient-Friendly Summary**: The clinical plan is converted into plain-language care instructions and return precautions for the patient.

---

## Architecture

```
[ Client Application UI ]
          │
          ▼ HTTP POST /api/agent
[ State Orchestrator ]
          │
          ├── Node 1: Transcript Cleaning & Formatting
          ├── Node 2: Clinical Entity Extraction
          ├── Node 3: Triage Rule Scanner
          ├── Node 4: SOAP Note Generator
          ├── Node 5: Validation & Quality Control
          └── Node 6: Patient Communication Generator
          │
          ▼
[ Supabase Persistence ]
  (Sessions & Usage Logs)
```

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **State Orchestration**: LangGraph StateGraph pipeline
- **Speech Recognition**: Groq Whisper API (`whisper-large-v3`)
- **Language Models**: Google Gemini Flash API (`gemini-2.0-flash`)
- **Database & Persistence**: Supabase (PostgreSQL)
- **Deployment Platform**: Vercel

---

## Project Structure

```
clinica/
├── app/
│   ├── api/
│   │   ├── agent/
│   │   │   └── route.ts        # Primary pipeline execution endpoint
│   │   ├── transcribe/
│   │   │   └── route.ts        # Audio transcription endpoint
│   │   └── usage/
│   │       └── route.ts        # Usage statistics endpoint
│   ├── globals.css             # Base styles and design system variables
│   ├── layout.tsx              # Root application layout
│   └── page.tsx                # Main clinical dashboard interface
├── components/
│   ├── AgentStatusBadge.tsx    # State execution status display
│   ├── FollowUpPanel.tsx       # Patient care summary display
│   ├── HistorySidebar.tsx      # Past clinical session logs
│   ├── IntakeForm.tsx          # Patient intake & voice recording interface
│   ├── SOAPPreview.tsx         # Structured SOAP note display
│   ├── TriageBadge.tsx         # Triage risk rating & flag display
│   └── UsageBanner.tsx         # Usage metrics banner
├── lib/
│   ├── agent/
│   │   ├── nodes/              # Workflow stage implementations
│   │   ├── tools/              # Clinical triage and follow-up modules
│   │   ├── graph.ts            # StateGraph definition and execution flow
│   │   └── state.ts            # Application state definitions and schemas
│   ├── supabase/
│   │   ├── client.ts           # Supabase client initializer
│   │   ├── db.ts               # Database query operations
│   │   └── server.ts           # Server-side Supabase client
│   └── rateLimit.ts            # Server-side quota limiter
└── supabase/
    └── schema.sql              # Database table definitions and schema
```

---

## Installation & Setup

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/abdu1hanan/Clinica.git
cd Clinica
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variable Setup

Create a `.env.local` file in the root directory:

```env
# API Credentials
GOOGLE_API_KEY=your_google_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Supabase Storage Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 4. Database Setup

Execute the SQL script located in `supabase/schema.sql` within your Supabase project SQL Editor to create the required tables (`sessions` and `usage_logs`).

---

## Execution Commands

### Local Development Server

Run the development server locally:

```bash
npm run dev
```

Access the application in your browser at `http://localhost:3000`.

### Production Build

Compile the production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```
