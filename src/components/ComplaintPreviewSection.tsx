import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  BookmarkPlus,
  ExternalLink,
  RotateCcw,
  Languages,
  MapPin,
  Building2,
  Edit3,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  CivicReport,
  IssueCategory,
  SupportedLanguage,
  LocationData,
} from '../types/civic.js';
import { generateComplaintPDF } from '../utils/pdfExport.js';

interface ComplaintPreviewSectionProps {
  complaintData: {
    category: IssueCategory;
    title: string;
    observations: string[];
    userDescription: string;
    location: LocationData;
    language: SupportedLanguage;
    complaintText: string;
    suggestedDepartment: string;
    evidenceImage: string;
  };
  onSaveReport: (report: Partial<CivicReport>) => Promise<void>;
  onRegenerate: (targetLanguage: SupportedLanguage) => Promise<void>;
  onOpenHandoff: () => void;
  isSaving: boolean;
  isRegenerating: boolean;
}

export const ComplaintPreviewSection: React.FC<ComplaintPreviewSectionProps> = ({
  complaintData,
  onSaveReport,
  onRegenerate,
  onOpenHandoff,
  isSaving,
  isRegenerating,
}) => {
  const [editableComplaint, setEditableComplaint] = useState(complaintData.complaintText);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableComplaint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    const syntheticReport: CivicReport = {
      reportId: `CE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: 'citizen-user-1',
      issueCategory: complaintData.category,
      issueTitle: complaintData.title,
      observations: complaintData.observations,
      userDescription: complaintData.userDescription,
      location: complaintData.location,
      language: complaintData.language,
      complaintText: editableComplaint,
      status: 'Ready to Submit',
      suggestedDepartment: complaintData.suggestedDepartment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    generateComplaintPDF(syntheticReport);
  };

  const handleSave = async () => {
    try {
      await onSaveReport({
        issueCategory: complaintData.category,
        issueTitle: complaintData.title,
        observations: complaintData.observations,
        userDescription: complaintData.userDescription,
        location: complaintData.location,
        language: complaintData.language,
        complaintText: editableComplaint,
        suggestedDepartment: complaintData.suggestedDepartment,
        imageThumbnail: complaintData.evidenceImage,
        status: 'Ready to Submit',
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const locationString = `${complaintData.location.addressOrLandmark || ''}, ${
    complaintData.location.cityOrArea || ''
  }`.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
          <FileText className="w-3.5 h-3.5 text-teal-600" />
          Step 3: Formal Complaint Review & Submission Handoff
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Grievance Petition Ready
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Gemma 4 has formulated a formal, factual complaint formatted for official municipal departments.
        </p>
      </div>

      {/* Overview & Quick Actions Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <img
              src={complaintData.evidenceImage}
              alt="Evidence"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 uppercase tracking-wider">
                  {complaintData.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400 font-mono">Gemma 4 Verified</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{complaintData.title}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {locationString}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  {complaintData.suggestedDepartment}
                </span>
              </div>
            </div>
          </div>

          {/* Language Switcher & Regeneration */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 self-stretch md:self-auto justify-between md:justify-start">
            <div className="flex items-center gap-1 px-2 text-xs font-semibold text-slate-600">
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              <span>Language:</span>
            </div>
            {(['English', 'Telugu', 'Hindi'] as SupportedLanguage[]).map((lang) => {
              const isActive = complaintData.language === lang;
              return (
                <button
                  key={lang}
                  disabled={isRegenerating}
                  onClick={() => onRegenerate(lang)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {lang === 'English' ? 'EN' : lang === 'Telugu' ? 'తెలుగు' : 'हिन्दी'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Petition Document Preview Box */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              Official Formal Petition Text ({complaintData.language})
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Done Editing' : 'Edit Complaint'}
            </button>
          </div>

          <div className="relative rounded-2xl border border-slate-300 bg-amber-50/20 p-5 font-serif text-slate-800 text-sm leading-relaxed shadow-inner">
            {isRegenerating ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 font-sans">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                <p className="text-sm font-semibold">Regenerating in {complaintData.language} with Gemma 4...</p>
              </div>
            ) : isEditing ? (
              <textarea
                value={editableComplaint}
                onChange={(e) => setEditableComplaint(e.target.value)}
                rows={12}
                className="w-full bg-white p-4 rounded-xl border border-slate-300 font-sans text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
              />
            ) : (
              <div className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed selection:bg-teal-200">
                {editableComplaint}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* 1. Copy Complaint */}
          <button
            onClick={handleCopy}
            className="py-3 px-4 rounded-xl border border-slate-200 hover:border-teal-300 bg-white hover:bg-teal-50/40 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                Copy Complaint Text
              </>
            )}
          </button>

          {/* 2. Download Official PDF */}
          <button
            onClick={handleDownloadPDF}
            className="py-3 px-4 rounded-xl border border-slate-200 hover:border-teal-300 bg-white hover:bg-teal-50/40 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-600" />
            Download PDF Petition
          </button>

          {/* 3. Save to My Reports */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'border border-slate-200 hover:border-teal-300 bg-white hover:bg-teal-50/40 text-slate-800'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Saved to My Reports!
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 text-slate-600" />
                Save to My Reports
              </>
            )}
          </button>

          {/* 4. Open Official Channels Handoff */}
          <button
            onClick={onOpenHandoff}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Official Portal Handoff
          </button>
        </div>

        {/* Transparency & Official Gateway Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">Verified Citizen Reporting Protocol</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              CivicEye assists in composing structured, evidence-backed petitions. To complete official
              redressal, use the button above to copy this petition into authorized municipal grievance
              systems (such as GHMC MyCURE or Swachhata), then record your official tracking token in My Reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
