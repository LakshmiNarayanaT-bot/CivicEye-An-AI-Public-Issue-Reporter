import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Languages,
  LocateFixed,
  FileText,
  Loader2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { IssueAnalysis, IssueCategory, SupportedLanguage, LocationData } from '../types/civic.js';

interface AnalysisVerificationSectionProps {
  analysis: IssueAnalysis;
  evidenceImage: string;
  initialLocationHint?: string;
  onGenerateComplaint: (verifiedData: {
    category: IssueCategory;
    title: string;
    observations: string[];
    userDescription: string;
    location: LocationData;
    language: SupportedLanguage;
    landmark?: string;
    suggestedDepartment: string;
  }) => void;
  isGeneratingComplaint: boolean;
}

export const AnalysisVerificationSection: React.FC<AnalysisVerificationSectionProps> = ({
  analysis,
  evidenceImage,
  initialLocationHint,
  onGenerateComplaint,
  isGeneratingComplaint,
}) => {
  // Editable fields with AI suggested initial values
  const [category, setCategory] = useState<IssueCategory>(analysis.category || 'road_damage');
  const [title, setTitle] = useState<string>(analysis.title || 'Civic Infrastructure Concern');
  const [userDescription, setUserDescription] = useState<string>('');
  const [cityOrArea, setCityOrArea] = useState<string>('Hyderabad');
  const [addressOrLandmark, setAddressOrLandmark] = useState<string>(initialLocationHint || '');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('English');
  const [additionalObservations, setAdditionalObservations] = useState<string>('');
  const [hasConfirmed, setHasConfirmed] = useState<boolean>(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const categoryOptions: { id: IssueCategory; label: string }[] = [
    { id: 'road_damage', label: 'Road Damage & Potholes' },
    { id: 'garbage', label: 'Garbage & Solid Waste' },
    { id: 'open_drain', label: 'Open Drain & Missing Manhole' },
    { id: 'water_issue', label: 'Water Leakage & Flooding' },
    { id: 'damaged_streetlight', label: 'Damaged Streetlight' },
    { id: 'other', label: 'Other Civic Hazard' },
    { id: 'uncertain', label: 'Uncertain / Needs Investigation' },
  ];

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.');
      return;
    }
    setGeoStatus('Locating current device position...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setGeoStatus(`Coordinates detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        if (!addressOrLandmark) {
          setAddressOrLandmark(`Near GPS: ${latitude.toFixed(4)} N, ${longitude.toFixed(4)} E`);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setGeoStatus('Location permission denied or unavailable. Please enter landmark manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !addressOrLandmark.trim()) {
      alert('Please provide an issue title and confirmed location or landmark.');
      return;
    }

    const mergedObservations = [...analysis.observations];
    if (additionalObservations.trim()) {
      mergedObservations.push(additionalObservations.trim());
    }

    onGenerateComplaint({
      category,
      title: title.trim(),
      observations: mergedObservations,
      userDescription: userDescription.trim(),
      location: {
        cityOrArea: cityOrArea.trim(),
        addressOrLandmark: addressOrLandmark.trim(),
        latitude: coords?.lat,
        longitude: coords?.lng,
      },
      language: selectedLanguage,
      landmark: addressOrLandmark.trim(),
      suggestedDepartment: analysis.suggested_department,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Step 2: AI Verification & Location Confirmation
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Review Findings & Confirm Location
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Gemma 4 has evaluated your photograph. Confirm the location details and language to generate your
          official petition.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: AI Findings Card */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900/5 border border-slate-200">
              <img src={evidenceImage} alt="Civic Evidence" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-mono text-teal-300 border border-teal-500/30">
                Gemma 4 Verified
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Model Assessment
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                    analysis.confidence_label === 'likely'
                      ? 'bg-emerald-100 text-emerald-800'
                      : analysis.confidence_label === 'possible'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Confidence: {analysis.confidence_label}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{analysis.title}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-teal-700 font-medium">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{analysis.suggested_department}</span>
                </div>
              </div>

              {/* Visual Observations */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">Observed Evidence:</p>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  {analysis.observations.map((obs, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hazard assessment */}
              <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Public Safety Impact:</span>
                </div>
                <p className="leading-relaxed text-amber-900/90">{analysis.potential_hazard}</p>
              </div>

              {/* Missing details note */}
              {analysis.missing_information && analysis.missing_information.length > 0 && (
                <div className="bg-sky-50 rounded-xl p-3 border border-sky-200 text-xs text-sky-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sky-800">
                    <Info className="w-3.5 h-3.5" />
                    <span>Citizen Confirmation Needed:</span>
                  </div>
                  <p className="text-[11px] text-sky-700">
                    Please confirm: {analysis.missing_information.join(', ')}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Verification & Location Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Citizen Verification Form</h3>
              <p className="text-xs text-slate-500">
                You have the final say. Correct any information before complaint generation.
              </p>
            </div>

            {/* Title field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Issue Title / Subject
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900"
                placeholder="e.g. Deep Pothole on Road No. 36"
              />
            </div>

            {/* Category selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Confirmed Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900 bg-white"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Section */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Exact Incident Location</span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  Use Device Location (Optional)
                </button>
              </div>

              {geoStatus && <p className="text-[11px] text-teal-700 font-medium">{geoStatus}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">City / Municipality</label>
                  <input
                    type="text"
                    value={cityOrArea}
                    onChange={(e) => setCityOrArea(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g. Hyderabad"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">
                    Street, Colony or Landmark
                  </label>
                  <input
                    type="text"
                    value={addressOrLandmark}
                    onChange={(e) => setAddressOrLandmark(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g. Road No. 36, Near Pillar 1240"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Note: Photos may be taken away from home; verify that the address represents where the
                problem exists.
              </p>
            </div>

            {/* Additional Observations / User Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Citizen Notes / Inconvenience Encountered
              </label>
              <textarea
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-slate-900"
                placeholder="e.g. This pothole has expanded over the last 3 days. Multiple commuters had near-miss accidents."
              />
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-teal-600" />
                Select Complaint Language
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(['English', 'Telugu', 'Hindi'] as SupportedLanguage[]).map((lang) => {
                  const isSelected = selectedLanguage === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      {lang === 'English' && 'English'}
                      {lang === 'Telugu' && 'తెలుగు (Telugu)'}
                      {lang === 'Hindi' && 'हिन्दी (Hindi)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Citizen Confirmation Checkbox */}
            <div className="pt-2 flex items-start gap-2.5">
              <input
                id="confirm-details"
                type="checkbox"
                checked={hasConfirmed}
                onChange={(e) => setHasConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="confirm-details" className="text-xs text-slate-600 cursor-pointer">
                I verify that the above location and evidence represent a genuine civic issue observed in
                public space.
              </label>
            </div>

            {/* Generate Complaint CTA */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={!hasConfirmed || isGeneratingComplaint}
                className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                  !hasConfirmed || isGeneratingComplaint
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-500/25 active:scale-98 cursor-pointer'
                }`}
              >
                {isGeneratingComplaint ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating {selectedLanguage} Complaint with Gemma 4...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Generate Formal Complaint Petition ({selectedLanguage})
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
