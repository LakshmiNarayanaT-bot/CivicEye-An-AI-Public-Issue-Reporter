import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  validateImageFile,
  parseAndValidateGemmaAnalysis,
} from './src/utils/validation.js';
import {
  CivicReport,
  IssueCategory,
  LocationData,
  SupportedLanguage,
  ReportStatus,
} from './src/types/civic.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Support JSON payloads up to 25MB for base64 image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Model configuration
const GEMMA_MODEL_ID = process.env.GEMMA_MODEL_ID || 'gemma-4-26b-a4b-it';

// Data persistence storage path
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory reports cache seeded from file
let reportsDatabase: CivicReport[] = [];
try {
  if (fs.existsSync(REPORTS_FILE)) {
    const raw = fs.readFileSync(REPORTS_FILE, 'utf-8');
    reportsDatabase = JSON.parse(raw);
  }
} catch (e) {
  console.error('Failed to read reports.json, initializing empty reports store:', e);
  reportsDatabase = [];
}

function persistReports() {
  try {
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reportsDatabase, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing reports.json:', err);
  }
}

// Initialize GoogleGenAI SDK
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --- API Endpoints ---

// 1. Health & Config endpoint
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'CivicEye',
    tagline: 'See a Problem. Snap a Photo. Make Your City Better.',
    aiModel: GEMMA_MODEL_ID,
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Multimodal Image Analysis via Gemma 4
app.post('/api/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'Missing imageBase64 in request body.' });
      return;
    }

    const cleanMimeType = mimeType || 'image/jpeg';
    const approxByteSize = Math.round((imageBase64.length * 3) / 4);

    const validation = validateImageFile(approxByteSize, cleanMimeType);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    // Clean data URL prefix if sent (e.g. data:image/png;base64, or data:image/svg+xml;base64,)
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '').trim();

    const ai = getGenAIClient();

    const analysisPrompt = `
You are the core multimodal AI engine for CivicEye, a civic issue detection system.
Analyze the provided photograph of a public infrastructure issue.
Identify observable public infrastructure problems carefully and objectively.

Follow these strict rules:
1. Identify the primary visible problem. Categorize into ONE of:
   - "road_damage" (potholes, cracks, broken asphalt, damaged pavement)
   - "garbage" (overflowing bins, open waste dumps, accumulated trash)
   - "open_drain" (missing/broken manhole cover, overflowing sewer, exposed stormwater drain)
   - "water_issue" (broken water supply pipe, road waterlogging, major drinking water leak)
   - "damaged_streetlight" (broken lamp fixture, exposed electrical wires, leaning or damaged pole)
   - "other" (other clear municipal hazard)
   - "uncertain" (photograph is unclear, blurry, or not a public civic issue)

2. SAFETY & OBJECTIVITY RULES:
   - NEVER invent or assume the city, road name, or geographic location based on visual assumptions.
   - NEVER fabricate injuries, accidents, vehicle damage, or unverified measurements.
   - Describe only what is visibly supported by the image.
   - If multiple issues are visible, describe the primary one and note the others in observations.
   - Treat confidence_label as qualitative: "likely" (clearly visible), "possible" (partially visible or ambiguous), or "uncertain".

Respond strictly with valid raw JSON matching this schema (do NOT include markdown fences, do NOT include extra commentary):
{
  "category": "road_damage" | "garbage" | "open_drain" | "water_issue" | "damaged_streetlight" | "other" | "uncertain",
  "title": "Short descriptive title of the issue (e.g. Deep Pothole on Carriageway)",
  "observations": [
    "Specific visual evidence point 1",
    "Specific visual evidence point 2"
  ],
  "potential_hazard": "Concise realistic statement of public safety hazard or inconvenience without exaggeration",
  "confidence_label": "likely" | "possible" | "uncertain",
  "suggested_department": "Name of relevant municipal department (e.g. Road Maintenance Wing, Sanitation Department)",
  "missing_information": [
    "List details that citizen must confirm, e.g. Exact street name, landmark"
  ],
  "requires_user_confirmation": true
}
`;

    // Multimodal call to Gemma 4
    let responseText = '';
    try {
      const response = await ai.models.generateContent({
        model: GEMMA_MODEL_ID,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: cleanMimeType.toLowerCase().includes('png')
                    ? 'image/png'
                    : cleanMimeType.toLowerCase().includes('webp')
                    ? 'image/webp'
                    : 'image/jpeg',
                  data: base64Data,
                },
              },
              {
                text: analysisPrompt,
              },
            ],
          },
        ],
      });
      responseText = response.text || '';
    } catch (modelError: any) {
      console.error('Gemma 4 model call failed:', modelError);
      res.status(502).json({
        error: `AI Model (${GEMMA_MODEL_ID}) request failed: ${modelError.message || 'Unknown error'}. Please verify model configuration.`,
      });
      return;
    }

    const structuredAnalysis = parseAndValidateGemmaAnalysis(responseText, GEMMA_MODEL_ID);
    res.json(structuredAnalysis);
  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ error: error.message || 'Internal server error during image analysis.' });
  }
});

// 3. AI Complaint Generation via Gemma 4
app.post('/api/generate-complaint', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      title,
      observations,
      userDescription,
      location,
      language = 'English',
      landmark,
    } = req.body;

    if (!category || !title) {
      res.status(400).json({ error: 'Missing category or title for complaint generation.' });
      return;
    }

    const locStr = location
      ? `${location.addressOrLandmark || landmark || 'Local Ward Area'}, ${location.cityOrArea || ''}`.trim()
      : landmark || 'Local Civic Area';

    const obsList = Array.isArray(observations) ? observations.join('\n- ') : 'Visible infrastructure problem';

    const ai = getGenAIClient();

    const complaintPrompt = `
You are an expert civic grievance specialist writing a formal public complaint petition on behalf of a citizen.
Use the verified facts below to craft a professional, formal, and respectful petition to the municipal corporation or local government authority.

VERIFIED FACTS:
- Issue Category: ${category}
- Issue Subject: ${title}
- Verified Location: ${locStr}
- Visual Evidence / Observations:
- ${obsList}
- Citizen Notes: ${userDescription || 'None provided'}
- Target Language: ${language} (MUST be written entirely in ${language})

CRITICAL RULES:
1. STRICTLY output in ${language}. If Telugu, write in clear, natural Telugu script. If Hindi, write in standard formal Hindi (Devanagari). If English, write in formal English.
2. Structure the complaint in standard official petition format:
   - Subject line: "Subject: Request for Urgent Resolution of [Specific Issue] at [Location]"
   - Formal Salutation: (e.g., "Respected Sir/Madam," / "గౌరవనీయులైన అధికారి గారికి," / "आदरणीय महोदय / महोदया,")
   - Clear opening stating the civic hazard at the exact confirmed location.
   - Factual summary of observed conditions without exaggeration.
   - Mention the public inconvenience or safety hazard to commuters, residents, or pedestrians.
   - Polite, respectful request for field inspection, prompt repair, and preventive action.
   - Professional closing with citizen contact placeholders:
     "Yours sincerely," / "ఇట్లు," / "भवदीय,"
     "[Citizen Name / Concerned Resident]"
     "[Contact Number]"
3. Do NOT invent fabricated official government complaint numbers, fake official names, or pretend this has already been acknowledged.
4. Keep the tone dignified, factual, constructive, and firm.

Generate ONLY the clean text of the formal complaint without surrounding meta-explanations.
`;

    let complaintText = '';
    try {
      const response = await ai.models.generateContent({
        model: GEMMA_MODEL_ID,
        contents: complaintPrompt,
      });
      complaintText = (response.text || '').trim();
    } catch (modelError: any) {
      console.error('Gemma 4 complaint generation error:', modelError);
      res.status(502).json({
        error: `AI Model (${GEMMA_MODEL_ID}) failed to generate complaint: ${modelError.message || 'Unknown error'}`,
      });
      return;
    }

    res.json({
      complaintText,
      language,
      modelUsed: GEMMA_MODEL_ID,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-complaint:', error);
    res.status(500).json({ error: error.message || 'Internal server error generating complaint.' });
  }
});

// 4. Save a new civic report
app.post('/api/reports', (req: Request, res: Response) => {
  try {
    const {
      userId = 'citizen-user-1',
      userDisplayName = 'Civic Citizen',
      userEmail,
      issueCategory,
      issueTitle,
      observations = [],
      userDescription = '',
      location = { cityOrArea: 'Hyderabad', addressOrLandmark: '' },
      language = 'English',
      complaintText,
      status = 'Ready to Submit',
      suggestedDepartment = 'Municipal Corporation',
      imageThumbnail,
    } = req.body;

    if (!issueTitle || !complaintText) {
      res.status(400).json({ error: 'Issue title and complaint text are required.' });
      return;
    }

    const reportId = `CE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const newReport: CivicReport = {
      reportId,
      userId,
      userDisplayName,
      userEmail,
      issueCategory: issueCategory as IssueCategory,
      issueTitle,
      observations,
      userDescription,
      location: location as LocationData,
      language: language as SupportedLanguage,
      complaintText,
      status: status as ReportStatus,
      suggestedDepartment,
      imageThumbnail,
      createdAt: now,
      updatedAt: now,
      updates: [
        {
          updateId: `up-${Date.now()}-1`,
          note: `Report generated via CivicEye using ${GEMMA_MODEL_ID} AI analysis.`,
          source: 'system',
          createdAt: now,
        },
      ],
    };

    reportsDatabase.unshift(newReport);
    persistReports();

    res.status(201).json({
      success: true,
      report: newReport,
      message: 'Civic report saved successfully.',
    });
  } catch (error: any) {
    console.error('Error saving report:', error);
    res.status(500).json({ error: error.message || 'Failed to save civic report.' });
  }
});

// 5. Get saved reports
app.get('/api/reports', (req: Request, res: Response) => {
  const { userId, category, status } = req.query;

  let filtered = [...reportsDatabase];

  if (userId && typeof userId === 'string') {
    filtered = filtered.filter((r) => r.userId === userId || r.userId === 'citizen-user-1');
  }

  if (category && typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter((r) => r.issueCategory === category);
  }

  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter((r) => r.status === status);
  }

  res.json({ reports: filtered, total: filtered.length });
});

// 6. Get single report by ID
app.get('/api/reports/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const report = reportsDatabase.find((r) => r.reportId === id);

  if (!report) {
    res.status(404).json({ error: `Report with ID ${id} not found.` });
    return;
  }

  res.json({ report });
});

// 7. Update report (status, external reference, follow-up notes)
app.patch('/api/reports/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = reportsDatabase.findIndex((r) => r.reportId === id);

  if (index === -1) {
    res.status(404).json({ error: `Report with ID ${id} not found.` });
    return;
  }

  const existing = reportsDatabase[index];
  const { status, externalComplaintReference, newNote, complaintText, userDescription } = req.body;

  const now = new Date().toISOString();
  const updatedUpdates = existing.updates ? [...existing.updates] : [];

  if (newNote && typeof newNote === 'string' && newNote.trim().length > 0) {
    updatedUpdates.push({
      updateId: `up-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      note: newNote.trim(),
      source: 'citizen',
      createdAt: now,
    });
  }

  if (status && status !== existing.status) {
    updatedUpdates.push({
      updateId: `up-${Date.now()}-status`,
      note: `Status updated from "${existing.status}" to "${status}".`,
      source: 'citizen',
      createdAt: now,
    });
  }

  if (externalComplaintReference && externalComplaintReference !== existing.externalComplaintReference) {
    updatedUpdates.push({
      updateId: `up-${Date.now()}-ref`,
      note: `Recorded official government reference token: ${externalComplaintReference}.`,
      source: 'official_status',
      createdAt: now,
    });
  }

  const updatedReport: CivicReport = {
    ...existing,
    status: (status as ReportStatus) || existing.status,
    externalComplaintReference:
      externalComplaintReference !== undefined ? externalComplaintReference : existing.externalComplaintReference,
    complaintText: complaintText || existing.complaintText,
    userDescription: userDescription || existing.userDescription,
    updatedAt: now,
    updates: updatedUpdates,
  };

  reportsDatabase[index] = updatedReport;
  persistReports();

  res.json({
    success: true,
    report: updatedReport,
    message: 'Report updated successfully.',
  });
});

// 8. Delete report
app.delete('/api/reports/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = reportsDatabase.length;
  reportsDatabase = reportsDatabase.filter((r) => r.reportId !== id);

  if (reportsDatabase.length === initialLength) {
    res.status(404).json({ error: `Report with ID ${id} not found.` });
    return;
  }

  persistReports();
  res.json({ success: true, message: `Report ${id} deleted successfully.` });
});

// --- Vite Integration & Server Startup ---
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicEye backend running on http://0.0.0.0:${PORT}`);
    console.log(`Active AI Model: ${GEMMA_MODEL_ID}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting CivicEye server:', err);
  process.exit(1);
});
