import React from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Building2,
  Phone,
  Copy,
  Check,
  Info,
  X,
  MapPin,
} from 'lucide-react';
import { IssueCategory } from '../types/civic.js';
import { getRecommendedChannels } from '../utils/routing.js';

interface OfficialChannelModalProps {
  category: IssueCategory;
  cityOrArea?: string;
  complaintText: string;
  onClose: () => void;
}

export const OfficialChannelModal: React.FC<OfficialChannelModalProps> = ({
  category,
  cityOrArea = 'Hyderabad',
  complaintText,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);
  const channels = getRecommendedChannels(category, cityOrArea);

  const handleCopy = () => {
    navigator.clipboard.writeText(complaintText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              Verified Submission Channels
            </div>
            <h3 className="font-bold text-slate-900 text-xl">Official Reporting Handoff</h3>
            <p className="text-xs text-slate-500">
              Submit your CivicEye prepared petition to the verified municipal authority.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Submission Guide */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            How to Submit to Official Channels:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-teal-600 font-mono">1.</span>
              <span>Copy your formatted petition text using the button below.</span>
            </div>
            <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-teal-600 font-mono">2.</span>
              <span>Click the official portal link for your municipal department.</span>
            </div>
            <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-teal-600 font-mono">3.</span>
              <span>Paste complaint & upload your photo evidence on their portal.</span>
            </div>
            <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-teal-600 font-mono">4.</span>
              <span>Save the grievance ticket number into CivicEye "My Reports".</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-slate-500">Quick copy complaint:</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Petition Text'}
            </button>
          </div>
        </div>

        {/* Matching Official Portals List */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Verified Authorities for {category.replace('_', ' ')} in {cityOrArea || 'Your City'}:
          </p>

          <div className="space-y-3">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-teal-400 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{ch.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold uppercase">
                        {ch.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{ch.coverageArea}</span>
                    </div>
                  </div>

                  {ch.url && (
                    <a
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
                    >
                      <span>Open Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-600">{ch.instructions}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                  {ch.phone && (
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Phone className="w-3 h-3 text-teal-600" />
                      <span>Helpline: {ch.phone}</span>
                    </div>
                  )}
                  <span className="text-teal-700 font-medium italic">{ch.verificationNotice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-fabrication & Trust notice */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Transparency Notice:</strong> CivicEye never claims a complaint is registered with a
            government body until you submit it to their authorized system and record your official ticket number.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
