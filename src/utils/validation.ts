import { IssueAnalysis, IssueCategory, ConfidenceLabel } from '../types/civic.js';

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(size: number, mimeType: string): ImageValidationResult {
  if (!size || size <= 0) {
    return { valid: false, error: 'The selected image is empty. Please choose a valid photograph.' };
  }
  if (size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image exceeds 10MB limit (size: ${(size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file.`,
    };
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported image format (${mimeType}). Supported formats are JPEG, PNG, and WebP.`,
    };
  }
  return { valid: true };
}

export function sanitizeCategory(categoryRaw: unknown): IssueCategory {
  const cat = String(categoryRaw || '').trim().toLowerCase();
  const validCategories: IssueCategory[] = [
    'road_damage',
    'garbage',
    'open_drain',
    'water_issue',
    'damaged_streetlight',
    'other',
    'uncertain',
  ];
  if (validCategories.includes(cat as IssueCategory)) {
    return cat as IssueCategory;
  }
  if (cat.includes('road') || cat.includes('pothole') || cat.includes('asphalt')) return 'road_damage';
  if (cat.includes('garbage') || cat.includes('waste') || cat.includes('trash') || cat.includes('dump')) return 'garbage';
  if (cat.includes('drain') || cat.includes('manhole') || cat.includes('sewer')) return 'open_drain';
  if (cat.includes('water') || cat.includes('leak') || cat.includes('flood') || cat.includes('logging')) return 'water_issue';
  if (cat.includes('light') || cat.includes('lamp') || cat.includes('electrical')) return 'damaged_streetlight';
  return 'other';
}

export function sanitizeConfidence(confidenceRaw: unknown): ConfidenceLabel {
  const conf = String(confidenceRaw || '').trim().toLowerCase();
  if (conf === 'likely' || conf === 'high') return 'likely';
  if (conf === 'possible' || conf === 'medium') return 'possible';
  return 'uncertain';
}

export function parseAndValidateGemmaAnalysis(aiOutput: string, modelName: string): IssueAnalysis {
  let cleaned = aiOutput.trim();

  // Strip code block fences if present (e.g. ```json ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);

    const category = sanitizeCategory(parsed.category);
    const title = typeof parsed.title === 'string' && parsed.title.trim().length > 0
      ? parsed.title.trim()
      : 'Visible Civic Infrastructure Issue';

    const observations: string[] = Array.isArray(parsed.observations)
      ? parsed.observations.map(String).filter((o: string) => o.trim().length > 0)
      : ['Visible civic infrastructure concern detected in photograph.'];

    const potential_hazard = typeof parsed.potential_hazard === 'string' && parsed.potential_hazard.trim().length > 0
      ? parsed.potential_hazard.trim()
      : 'Potential public inconvenience or road safety risk if left unaddressed.';

    const confidence_label = sanitizeConfidence(parsed.confidence_label);

    const suggested_department = typeof parsed.suggested_department === 'string' && parsed.suggested_department.trim().length > 0
      ? parsed.suggested_department.trim()
      : getFallbackDepartment(category);

    const missing_information: string[] = Array.isArray(parsed.missing_information)
      ? parsed.missing_information.map(String).filter((m: string) => m.trim().length > 0)
      : ['Exact civic address or nearest landmark', 'Specific ward or zone number'];

    return {
      category,
      title,
      observations,
      potential_hazard,
      confidence_label,
      suggested_department,
      missing_information,
      requires_user_confirmation: true,
      model_used: modelName,
    };
  } catch (err) {
    // If JSON parsing fails, extract salient information gracefully
    return {
      category: 'uncertain',
      title: 'Civic Issue Requiring User Clarification',
      observations: [
        'An issue was detected in the photograph, but structured analysis requires user verification.',
        cleaned.slice(0, 150).replace(/[{}"]/g, ''),
      ],
      potential_hazard: 'Potential civic infrastructure hazard identified for citizen review.',
      confidence_label: 'uncertain',
      suggested_department: 'Municipal Corporation General Grievances',
      missing_information: ['Exact issue category confirmation', 'Civic location and address'],
      requires_user_confirmation: true,
      model_used: modelName,
    };
  }
}

export function getFallbackDepartment(category: IssueCategory): string {
  switch (category) {
    case 'road_damage':
      return 'Road Maintenance & Engineering Wing';
    case 'garbage':
      return 'Sanitation & Solid Waste Management';
    case 'open_drain':
      return 'Drainage & Stormwater Drainage Department';
    case 'water_issue':
      return 'Water Supply & Sewerage Board';
    case 'damaged_streetlight':
      return 'Electrical & Street Lighting Wing';
    default:
      return 'Municipal Public Works / Grievance Redressal';
  }
}
