import React from 'react';
import {
  HelpCircle,
  Cpu,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronDown,
  Info,
  Languages,
} from 'lucide-react';
import { VERIFIED_CHANNELS } from '../utils/routing.js';

export const HelpAboutSection: React.FC = () => {
  const faqs = [
    {
      q: 'How does Gemma 4 analyze civic infrastructure problems?',
      a: 'CivicEye sends uploaded photographs to Google Gemma 4 (26B Multimodal), which inspects observable visual evidence such as potholes, asphalt breakdown, overflowing garbage bins, broken drainage covers, or damaged streetlights. It extracts factual observations without exaggeration and recommends the corresponding municipal engineering department.',
    },
    {
      q: 'Does CivicEye automatically register complaints in government databases?',
      a: 'No. To maintain complete transparency and integrity, CivicEye does not claim direct automated submission to government databases unless an authorized municipal API integration is established. Instead, CivicEye formats your photo evidence into a formal petition in English, Telugu, or Hindi, generates an official PDF, and guides you directly to verified portals like GHMC MyCURE or Swachhata.',
    },
    {
      q: 'Which languages are supported for complaint generation?',
      a: 'CivicEye generates petitions in English, Telugu (తెలుగు), and Hindi (हिन्दी). You can switch between languages with one click and customize the text before saving or exporting.',
    },
    {
      q: 'Is my photograph or location data stored publicly?',
      a: 'No. Uploaded photographs and verified locations are stored only within your private CivicEye session and reports dashboard. CivicEye does not publish citizen faces, vehicle license plates, or home addresses to any public feed.',
    },
    {
      q: 'What should I do after submitting to an official portal?',
      a: 'When you submit via GHMC MyCURE, Swachhata, or the Water Board helpline, the government authority provides a grievance reference token (e.g., GHMC-2026-XXXX). Enter this token into CivicEye under "My Reports" along with any follow-up notes to monitor your complaint through to resolution.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
          <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
          Platform Guide & Directory
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          About CivicEye & Official Channels
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Empowering citizens with artificial intelligence to document public infrastructure hazards accurately.
        </p>
      </div>

      {/* AI Model Architecture & Principles */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Google Gemma 4 AI Architecture</h3>
            <p className="text-xs text-slate-500">Core intelligence and safety guardrails</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">Multimodal Vision Understanding</h4>
            <p className="leading-relaxed">
              Processes raw photograph pixels directly on the backend via the Google Gen AI SDK. Gemma 4
              detects road surface irregularities, solid waste accumulation, broken sewer infrastructure, and
              unlit electrical fixtures.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">Strict Anti-Hallucination Guardrails</h4>
            <p className="leading-relaxed">
              Gemma 4 is instructed never to fabricate street names or assume geographic locations from
              images alone. Location confirmation is placed in the hands of the citizen.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Municipal Authorities Directory */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-xl">Verified Municipal Grievance Directory</h3>
          <p className="text-xs text-slate-600">
            Official government portals and hotlines supported for citizen handoff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VERIFIED_CHANNELS.map((ch) => (
            <div
              key={ch.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{ch.name}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                    {ch.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{ch.coverageArea}</p>
                <p className="text-xs text-slate-600 mt-2">{ch.instructions}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {ch.phone ? (
                  <span className="font-semibold text-slate-700">Helpline: {ch.phone}</span>
                ) : (
                  <span></span>
                )}
                {ch.url && (
                  <a
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
                  >
                    <span>Visit Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-teal-600" />
          <h3 className="font-bold text-slate-900 text-lg">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
