/**
 * CivicEye - Core Domain Types
 */

export type IssueCategory =
  | 'road_damage'
  | 'garbage'
  | 'open_drain'
  | 'water_issue'
  | 'damaged_streetlight'
  | 'other'
  | 'uncertain';

export type ConfidenceLabel = 'likely' | 'possible' | 'uncertain';

export type ReportStatus =
  | 'Draft'
  | 'Ready to Submit'
  | 'Submission Recorded'
  | 'Resolved (User Confirmed)';

export type SupportedLanguage = 'English' | 'Telugu' | 'Hindi';

export interface IssueAnalysis {
  category: IssueCategory;
  title: string;
  observations: string[];
  potential_hazard: string;
  confidence_label: ConfidenceLabel;
  suggested_department: string;
  missing_information: string[];
  requires_user_confirmation: boolean;
  model_used?: string;
}

export interface LocationData {
  cityOrArea: string;
  addressOrLandmark: string;
  latitude?: number;
  longitude?: number;
}

export interface ReportUpdateNote {
  updateId: string;
  note: string;
  source: 'citizen' | 'official_status' | 'system';
  createdAt: string;
}

export interface CivicReport {
  reportId: string;
  userId: string;
  userDisplayName?: string;
  userEmail?: string;
  issueCategory: IssueCategory;
  issueTitle: string;
  observations: string[];
  userDescription: string;
  location: LocationData;
  language: SupportedLanguage;
  complaintText: string;
  status: ReportStatus;
  externalComplaintReference?: string;
  imageThumbnail?: string;
  suggestedDepartment: string;
  createdAt: string;
  updatedAt: string;
  updates?: ReportUpdateNote[];
}

export interface OfficialChannel {
  id: string;
  name: string;
  category: string[];
  coverageArea: string;
  type: 'app' | 'web' | 'helpline' | 'whatsapp';
  url?: string;
  phone?: string;
  instructions: string;
  verificationNotice: string;
}
