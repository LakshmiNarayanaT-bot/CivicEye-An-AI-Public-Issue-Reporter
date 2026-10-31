import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Copy,
  Trash2,
  ExternalLink,
  PlusCircle,
  MapPin,
  Calendar,
  Building2,
  Tag,
  MessageSquare,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';
import { CivicReport, IssueCategory, ReportStatus } from '../types/civic.js';
import { generateComplaintPDF } from '../utils/pdfExport.js';

interface MyReportsSectionProps {
  reports: CivicReport[];
  onUpdateReport: (reportId: string, updates: Partial<CivicReport> & { newNote?: string }) => Promise<void>;
  onDeleteReport: (reportId: string) => Promise<void>;
  onNavigateToNewReport: () => void;
  onOpenHandoff: (report: CivicReport) => void;
}

export const MyReportsSection: React.FC<MyReportsSectionProps> = ({
  reports,
  onUpdateReport,
  onDeleteReport,
  onNavigateToNewReport,
  onOpenHandoff,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);

  // Modal for recording external reference or notes
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [refTokenInput, setRefTokenInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filterReports = reports.filter((r) => {
    const matchesSearch =
      r.issueTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location.addressOrLandmark || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location.cityOrArea || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || r.issueCategory === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
    await onUpdateReport(reportId, { status: newStatus });
  };

  const handleSaveTokenAndNote = async (reportId: string) => {
    await onUpdateReport(reportId, {
      externalComplaintReference: refTokenInput.trim() || undefined,
      newNote: noteInput.trim() || undefined,
      status: refTokenInput.trim() ? 'Submission Recorded' : undefined,
    });
    setEditingReportId(null);
    setRefTokenInput('');
    setNoteInput('');
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
      case 'Ready to Submit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
            <CheckCircle2 className="w-3 h-3 text-teal-600" /> Ready to Submit
          </span>
        );
      case 'Submission Recorded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Send className="w-3 h-3 text-blue-600" /> Submission Recorded
          </span>
        );
      case 'Resolved (User Confirmed)':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved (Confirmed)
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Civic Reports & Tracking
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Track petitions created with CivicEye, record municipal tokens, and monitor civic resolutions.
          </p>
        </div>
        <button
          onClick={onNavigateToNewReport}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Report ID, title, or location..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Ready to Submit">Ready to Submit</option>
              <option value="Submission Recorded">Submission Recorded</option>
              <option value="Resolved (User Confirmed)">Resolved (Confirmed)</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              <option value="road_damage">Road Damage</option>
              <option value="garbage">Garbage / Waste</option>
              <option value="open_drain">Open Drain / Manhole</option>
              <option value="water_issue">Water Issue</option>
              <option value="damaged_streetlight">Streetlight</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filterReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">No matching reports found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'You have not submitted or saved any civic complaints yet.'}
            </p>
          </div>
          <button
            onClick={onNavigateToNewReport}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Report an Issue Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filterReports.map((report) => {
            const locText = `${report.location.addressOrLandmark || ''}, ${
              report.location.cityOrArea || ''
            }`.trim();
            return (
              <div
                key={report.reportId}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-teal-300 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: ID and Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {report.reportId}
                    </span>
                    {getStatusBadge(report.status)}
                  </div>

                  {/* Title and Category */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {report.issueTitle}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold text-[10px] uppercase">
                        {report.issueCategory.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-medium">Lang: {report.language}</span>
                    </div>
                  </div>

                  {/* Location & Department */}
                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{locText || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{report.suggestedDepartment}</span>
                    </div>
                    {report.externalComplaintReference && (
                      <div className="flex items-center gap-1.5 text-blue-700 font-semibold pt-0.5">
                        <Tag className="w-3.5 h-3.5 shrink-0" />
                        <span>Official Token: {report.externalComplaintReference}</span>
                      </div>
                    )}
                  </div>

                  {/* Follow-up Updates Count */}
                  {report.updates && report.updates.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span>{report.updates.length} timeline updates recorded</span>
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => generateComplaintPDF(report)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-teal-600" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleCopy(report.complaintText, report.reportId)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === report.reportId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingReportId(report.reportId);
                        setRefTokenInput(report.externalComplaintReference || '');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      Token / Note
                    </button>
                    <button
                      onClick={() => onDeleteReport(report.reportId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs text-slate-400">{selectedReport.reportId}</span>
                <h3 className="font-bold text-slate-900 text-xl">{selectedReport.issueTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Status changer */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Internal Tracking Status:</span>
              <select
                value={selectedReport.status}
                onChange={(e) => handleStatusChange(selectedReport.reportId, e.target.value as ReportStatus)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="Draft">Draft</option>
                <option value="Ready to Submit">Ready to Submit</option>
                <option value="Submission Recorded">Submission Recorded</option>
                <option value="Resolved (User Confirmed)">Resolved (User Confirmed)</option>
              </select>
            </div>

            {/* Full Complaint Text */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Complaint Petition ({selectedReport.language})
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {selectedReport.complaintText}
              </div>
            </div>

            {/* Updates Timeline */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Activity Timeline</p>
              <div className="space-y-2">
                {selectedReport.updates?.map((u) => (
                  <div key={u.updateId} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                      <span className="capitalize font-semibold text-slate-600">{u.source}</span>
                      <span>{new Date(u.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800">{u.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => generateComplaintPDF(selectedReport)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record External Token / Follow-up Note Modal */}
      {editingReportId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg">Record Official Grievance Token</h3>
            <p className="text-xs text-slate-500">
              After submitting your petition to an official portal (e.g., GHMC MyCURE), record the
              reference token for follow-up tracking.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Government Reference ID / Token
              </label>
              <input
                type="text"
                value={refTokenInput}
                onChange={(e) => setRefTokenInput(e.target.value)}
                placeholder="e.g. GHMC-2026-88421"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Follow-up Note (Optional)</label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={3}
                placeholder="e.g. Spoke to ward inspector, inspection scheduled for tomorrow."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingReportId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveTokenAndNote(editingReportId)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
              >
                Save Tracking Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
