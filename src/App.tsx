import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { ReportIssueSection } from './components/ReportIssueSection.js';
import { AnalysisVerificationSection } from './components/AnalysisVerificationSection.js';
import { ComplaintPreviewSection } from './components/ComplaintPreviewSection.js';
import { MyReportsSection } from './components/MyReportsSection.js';
import { HelpAboutSection } from './components/HelpAboutSection.js';
import { OfficialChannelModal } from './components/OfficialChannelModal.js';
import { AuthModal } from './components/AuthModal.js';
import {
  CivicReport,
  IssueAnalysis,
  IssueCategory,
  LocationData,
  SupportedLanguage,
} from './types/civic.js';
import { SampleImageOption } from './utils/sampleImages.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [aiModelName, setAiModelName] = useState<string>('gemma-4-26b-a4b-it');

  // Evidence & Analysis State
  const [evidenceImage, setEvidenceImage] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<IssueAnalysis | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleImageOption | null>(null);
  const [initialSampleId, setInitialSampleId] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Complaint Generation State
  const [complaintData, setComplaintData] = useState<{
    category: IssueCategory;
    title: string;
    observations: string[];
    userDescription: string;
    location: LocationData;
    language: SupportedLanguage;
    complaintText: string;
    suggestedDepartment: string;
    evidenceImage: string;
  } | null>(null);
  const [isGeneratingComplaint, setIsGeneratingComplaint] = useState<boolean>(false);
  const [isSavingReport, setIsSavingReport] = useState<boolean>(false);
  const [isRegeneratingComplaint, setIsRegeneratingComplaint] = useState<boolean>(false);

  // Reports Dashboard State
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);

  // Modals
  const [handoffModalOpen, setHandoffModalOpen] = useState<boolean>(false);
  const [handoffReportInfo, setHandoffReportInfo] = useState<{
    category: IssueCategory;
    cityOrArea: string;
    complaintText: string;
  } | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('civic_eye_user');
      return saved ? JSON.parse(saved) : { name: 'Sai Lakshmi', email: 'citizen@civiceye.org' };
    } catch {
      return { name: 'Sai Lakshmi', email: 'citizen@civiceye.org' };
    }
  });

  // Fetch initial config & reports
  useEffect(() => {
    fetchConfig();
    fetchReports();

    // Check for autostart parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setActiveTab('report');
    }
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.aiModel) {
          setAiModelName(data.aiModel);
        }
      }
    } catch (err) {
      console.warn('Config fetch error:', err);
    }
  };

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleAnalysisComplete = (
    analysisResult: IssueAnalysis,
    imageSrc: string,
    sampleInfo?: SampleImageOption
  ) => {
    setCurrentAnalysis(analysisResult);
    setEvidenceImage(imageSrc);
    setSelectedSample(sampleInfo || null);
    setActiveTab('analysis');
  };

  const handleSelectSampleFromHero = (sampleId: string) => {
    setInitialSampleId(sampleId);
    setActiveTab('report');
  };

  const handleGenerateComplaint = async (verifiedData: {
    category: IssueCategory;
    title: string;
    observations: string[];
    userDescription: string;
    location: LocationData;
    language: SupportedLanguage;
    landmark?: string;
    suggestedDepartment: string;
  }) => {
    setIsGeneratingComplaint(true);
    try {
      const response = await fetch('/api/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifiedData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate complaint petition.');
      }

      const result = await response.json();

      setComplaintData({
        category: verifiedData.category,
        title: verifiedData.title,
        observations: verifiedData.observations,
        userDescription: verifiedData.userDescription,
        location: verifiedData.location,
        language: verifiedData.language,
        complaintText: result.complaintText,
        suggestedDepartment: verifiedData.suggestedDepartment,
        evidenceImage: evidenceImage || '',
      });

      setActiveTab('complaint');
    } catch (err: any) {
      alert(`Complaint generation error: ${err.message || 'Please try again.'}`);
    } finally {
      setIsGeneratingComplaint(false);
    }
  };

  const handleRegenerateInLanguage = async (targetLanguage: SupportedLanguage) => {
    if (!complaintData) return;
    setIsRegeneratingComplaint(true);

    try {
      const response = await fetch('/api/generate-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: complaintData.category,
          title: complaintData.title,
          observations: complaintData.observations,
          userDescription: complaintData.userDescription,
          location: complaintData.location,
          language: targetLanguage,
          landmark: complaintData.location.addressOrLandmark,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate complaint.');
      }

      const result = await response.json();
      setComplaintData({
        ...complaintData,
        language: targetLanguage,
        complaintText: result.complaintText,
      });
    } catch (err: any) {
      alert(`Regeneration failed: ${err.message || 'Please try again.'}`);
    } finally {
      setIsRegeneratingComplaint(false);
    }
  };

  const handleSaveReport = async (reportPayload: Partial<CivicReport>) => {
    setIsSavingReport(true);
    try {
      const payload = {
        ...reportPayload,
        userId: currentUser?.email || 'citizen-user-1',
        userDisplayName: currentUser?.name || 'Concerned Citizen',
        userEmail: currentUser?.email,
      };

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Could not save report to database.');
      }

      const data = await response.json();
      setReports((prev) => [data.report, ...prev]);
    } catch (err: any) {
      alert(err.message || 'Error saving report.');
    } finally {
      setIsSavingReport(false);
    }
  };

  const handleUpdateReport = async (
    reportId: string,
    updates: Partial<CivicReport> & { newNote?: string }
  ) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update report.');
      }

      const data = await response.json();
      setReports((prev) =>
        prev.map((r) => (r.reportId === reportId ? data.report : r))
      );
    } catch (err: any) {
      alert(err.message || 'Error updating report.');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this civic report?')) return;
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setReports((prev) => prev.filter((r) => r.reportId !== reportId));
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting report.');
    }
  };

  const handleOpenHandoffFromComplaint = () => {
    if (!complaintData) return;
    setHandoffReportInfo({
      category: complaintData.category,
      cityOrArea: complaintData.location.cityOrArea,
      complaintText: complaintData.complaintText,
    });
    setHandoffModalOpen(true);
  };

  const handleOpenHandoffFromReport = (report: CivicReport) => {
    setHandoffReportInfo({
      category: report.issueCategory,
      cityOrArea: report.location.cityOrArea,
      complaintText: report.complaintText,
    });
    setHandoffModalOpen(true);
  };

  const handleUserLogin = (userData: { name: string; email: string }) => {
    setCurrentUser(userData);
    localStorage.setItem('civic_eye_user', JSON.stringify(userData));
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('civic_eye_user');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActiveAnalysis={!!currentAnalysis}
        hasActiveComplaint={!!complaintData}
        aiModelName={aiModelName}
        user={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HeroSection
            onStartReport={() => setActiveTab('report')}
            onSelectSample={handleSelectSampleFromHero}
          />
        )}

        {activeTab === 'report' && (
          <ReportIssueSection
            onAnalysisComplete={handleAnalysisComplete}
            initialSampleId={initialSampleId}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        )}

        {activeTab === 'analysis' && currentAnalysis && evidenceImage && (
          <AnalysisVerificationSection
            analysis={currentAnalysis}
            evidenceImage={evidenceImage}
            initialLocationHint={selectedSample?.locationHint}
            onGenerateComplaint={handleGenerateComplaint}
            isGeneratingComplaint={isGeneratingComplaint}
          />
        )}

        {activeTab === 'complaint' && complaintData && (
          <ComplaintPreviewSection
            complaintData={complaintData}
            onSaveReport={handleSaveReport}
            onRegenerate={handleRegenerateInLanguage}
            onOpenHandoff={handleOpenHandoffFromComplaint}
            isSaving={isSavingReport}
            isRegenerating={isRegeneratingComplaint}
          />
        )}

        {activeTab === 'my-reports' && (
          <MyReportsSection
            reports={reports}
            onUpdateReport={handleUpdateReport}
            onDeleteReport={handleDeleteReport}
            onNavigateToNewReport={() => setActiveTab('report')}
            onOpenHandoff={handleOpenHandoffFromReport}
          />
        )}

        {activeTab === 'help' && <HelpAboutSection />}
      </main>

      {/* Official Channel Handoff Modal */}
      {handoffModalOpen && handoffReportInfo && (
        <OfficialChannelModal
          category={handoffReportInfo.category}
          cityOrArea={handoffReportInfo.cityOrArea}
          complaintText={handoffReportInfo.complaintText}
          onClose={() => setHandoffModalOpen(false)}
        />
      )}

      {/* Authentication Modal */}
      {authModalOpen && (
        <AuthModal
          user={currentUser}
          onLogin={handleUserLogin}
          onLogout={handleUserLogout}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {/* Global CivicEye Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CivicEye</span>
            <span>•</span>
            <span>AI Public Issue Reporter</span>
            <span>•</span>
            <span className="text-teal-700 font-mono">Gemma 4 Powered</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setActiveTab('help')}
              className="hover:text-teal-700 cursor-pointer"
            >
              Directory & Help
            </button>
            <button
              onClick={() => setActiveTab('my-reports')}
              className="hover:text-teal-700 cursor-pointer"
            >
              My Reports
            </button>
            <span>Anti-Fabrication & Citizen Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
