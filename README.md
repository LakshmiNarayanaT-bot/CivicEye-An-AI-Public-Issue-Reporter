# CivicEye – AI Public Issue Reporter

> **"See a Problem. Snap a Photo. Make Your City Better."**

An AI-powered civic reporting web application utilizing **Google Gemma 4 (`gemma-4-26b-a4b-it`)** as its core multimodal artificial intelligence engine for public infrastructure defect analysis, citizen verification, and formal multilingual complaint generation.

---

## Architecture Overview

```
Citizen
  │
  ▼ [Upload / Camera / 1-Click Preset]
Express Backend (/api/analyze)
  │
  ▼ [@google/genai Multimodal API Call]
Google Gemma 4 (gemma-4-26b-a4b-it)
  │
  ▼ [Structured Issue Analysis JSON]
Citizen Review & Location Confirmation (GPS / Landmark)
  │
  ▼ [POST /api/generate-complaint]
Gemma 4 Multilingual Complaint Engine (English / Telugu / Hindi)
  │
  ▼
Formal Petition Review & Export:
  ├── Copy to Clipboard
  ├── Download Official PDF (jsPDF)
  ├── Verified Municipal Portal Handoff (GHMC MyCURE, Swachhata, HMWSSB, CPGRAMS)
  └── Save & Track in "My Reports" Dashboard
```

---

## Key Features

1. **Gemma 4 Multimodal Analysis (`/api/analyze`)**:
   - Detects road damage, overflowing waste, open manholes/drains, water leakage, and damaged streetlights.
   - Extracts observable visual evidence without exaggeration.
   - Assigns qualitative confidence (`likely`, `possible`, `uncertain`) and recommends responsible departments (e.g. *Road Maintenance Wing*, *Solid Waste Management*).
   - Enforces AI safety: never hallucinates street addresses from visuals alone.

2. **Citizen Location & Verification**:
   - Editable citizen form for final authority over title, category, and observations.
   - Optional browser Geolocation API integration + manual landmark entry.

3. **Multilingual Complaint Generation (`/api/generate-complaint`)**:
   - Generates formal petitions formatted for municipal bodies.
   - Fully supports **English**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)** with 1-click language toggling and regeneration.

4. **Complaint Export & Verified Official Handoff**:
   - Clean, professional grievance petition PDF download via `jspdf`.
   - Direct routing guidance for Hyderabad and national portals (**GHMC MyCURE**, **Swachhata - MoHUA**, **HMWSSB Water Board**, **TGSPDCL**, **CPGRAMS**).
   - Strict Anti-Fabrication Notice: CivicEye does not make false claims of automated government filing.

5. **My Reports Dashboard (`/api/reports`)**:
   - Persistent report storage (`data/reports.json`).
   - Track internal status (`Draft`, `Ready to Submit`, `Submission Recorded`, `Resolved`).
   - Record official government token numbers (e.g., `GHMC-2026-88129`) and timeline follow-up notes.
   - Search by keyword or filter by category and status.

6. **Instant Hackathon Demonstration Presets**:
   - 5 built-in photographic test scenarios (Pothole, Waste Dump, Open Drain, Water Burst, Broken Streetlight) for instant 1-click testing.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons
- **Build Tool**: Vite
- **Backend**: Node.js, Express, TypeScript (`tsx`)
- **AI Model**: Google Gemma 4 (`gemma-4-26b-a4b-it`) via `@google/genai`
- **PDF Generation**: `jspdf`
- **Testing**: `node:test` (unit tests) and `@playwright/cli` (end-to-end browser verification)

---

## Environment Variables

Configure in `.env`:

```env
# GEMINI_API_KEY: Required for Gemini / Gemma AI API calls.
GEMINI_API_KEY="your-api-key-here"

# GEMMA_MODEL_ID: Configurable AI model ID (Default: gemma-4-26b-a4b-it)
GEMMA_MODEL_ID="gemma-4-26b-a4b-it"

# PORT: Server port (Default: 3000)
PORT=3000
```

---

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run unit tests:
   ```bash
   npx tsx --test src/utils/validation.test.ts src/utils/routing.test.ts
   ```

3. Start development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. Build for production:
   ```bash
   npm run build
   npm start
   ```
