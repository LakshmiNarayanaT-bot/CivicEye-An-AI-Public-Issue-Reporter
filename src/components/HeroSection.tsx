import React from 'react';
import {
  Camera,
  Cpu,
  MapPin,
  FileCheck2,
  Share2,
  AlertTriangle,
  Trash2,
  Waves,
  LightbulbOff,
  Wrench,
  Languages,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface HeroSectionProps {
  onStartReport: () => void;
  onSelectSample: (sampleId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartReport,
  onSelectSample,
}) => {
  const steps = [
    {
      num: '01',
      title: 'Capture or Upload',
      desc: 'Take a clear photograph of any damaged road, waste dump, or public hazard.',
      icon: Camera,
    },
    {
      num: '02',
      title: 'Gemma 4 AI Analysis',
      desc: 'Multimodal Gemma 4 inspects visible damage, determines category, and evaluates hazard level.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Confirm Issue & Location',
      desc: 'Review the AI findings, add exact street landmarks, and choose your preferred language.',
      icon: MapPin,
    },
    {
      num: '04',
      title: 'Generate Complaint',
      desc: 'Gemma 4 crafts a structured, formal petition formatted for municipal authorities.',
      icon: FileCheck2,
    },
    {
      num: '05',
      title: 'Export, Report & Track',
      desc: 'Download official PDF, copy to verified portals (GHMC MyCURE / Swachhata), and track progress.',
      icon: Share2,
    },
  ];

  const issueCategories = [
    {
      id: 'sample-pothole',
      title: 'Road Damage & Potholes',
      desc: 'Craters, asphalt peeling, dangerous depressions risking two-wheelers and vehicles.',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badge: 'High Priority',
    },
    {
      id: 'sample-garbage',
      title: 'Garbage & Solid Waste',
      desc: 'Overflowing dumpsters, roadside garbage dumps, uncleared municipal waste.',
      icon: Trash2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: 'Sanitation',
    },
    {
      id: 'sample-drain',
      title: 'Open Drains & Manholes',
      desc: 'Missing manhole covers, exposed stormwater drains, overflowing sewer pits.',
      icon: Wrench,
      color: 'bg-red-50 text-red-700 border-red-200',
      badge: 'Critical Hazard',
    },
    {
      id: 'sample-water',
      title: 'Water Leaks & Flooding',
      desc: 'Burst municipal water pipes, stagnant water pools, road waterlogging.',
      icon: Waves,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      badge: 'Infrastructure',
    },
    {
      id: 'sample-light',
      title: 'Damaged Streetlights',
      desc: 'Unlit streets, broken fixtures, exposed high-voltage wiring, dark spots.',
      icon: LightbulbOff,
      color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      badge: 'Public Safety',
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-teal-900 via-teal-950 to-slate-950 text-white p-8 sm:p-14 shadow-2xl border border-teal-800/40">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Empowered by Google Gemma 4 (26B Multimodal)
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            See a Problem.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400">
              Snap a Photo.
            </span>{' '}
            Make Your City Better.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            CivicEye bridges the gap between citizens and municipal authorities. Using the multimodal
            intelligence of Gemma 4, CivicEye detects public hazards from photos, identifies the
            responsible department, and drafts formal multilingual complaints ready for official reporting.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onStartReport}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/30 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              Report an Issue Now
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectSample('sample-pothole')}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/15 flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              Try Live Pothole Sample
            </button>
          </div>

          {/* Anti-fabrication & Transparency guarantee */}
          <div className="pt-4 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Transparent Citizen Handoff: CivicEye prepares verified formal petitions for genuine civic portals
              like GHMC MyCURE and Swachhata.
            </span>
          </div>
        </div>
      </section>

      {/* How It Works - 5 Simple Steps */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How CivicEye Works
          </h2>
          <p className="text-slate-600 text-sm">
            From photograph to formal complaint petition in five structured, transparent steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 font-mono">
                      {s.num}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4 text-teal-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base mb-1.5">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Supported Issues Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Supported Civic Issues
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Click any category below to load a verified scenario for demonstration.
            </p>
          </div>
          <button
            onClick={onStartReport}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            Upload your own photo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {issueCategories.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onSelectSample(item.id)}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-600">
                  <span>Load Sample Test Photo</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Features & Principles Banner */}
      <section className="bg-slate-900 text-slate-100 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Multimodal Gemma 4 Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time vision reasoning identifies visual evidence, notes hazards without exaggeration,
              and flags missing details for user confirmation.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Multilingual Complaint Drafting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate formal grievance petitions in English, Telugu (తెలుగు), and Hindi (हिन्दी) formatted
              specifically for Indian municipal standards.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Citizen Privacy & Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The citizen remains in full control. Verify location, edit complaints, and manage report status
              securely without unwanted data exposure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
