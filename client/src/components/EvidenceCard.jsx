import React from 'react';
import {
  MessageSquare,
  Image as ImageIcon,
  Video,
  FileText,
  FileSpreadsheet,
  Clock,
  Eye,
  CheckCircle2,
  Lock
} from 'lucide-react';
import FictionalMediaLabel from './FictionalMediaLabel.jsx';

export const EVIDENCE_TYPE_META = {
  chat: { label: 'Chat Transcript', icon: MessageSquare, color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40' },
  image: { label: 'Scene Image', icon: ImageIcon, color: 'text-purple-400 bg-purple-950/30 border-purple-800/40' },
  camera_record: { label: 'CCTV Transcript', icon: Video, color: 'text-cyan-400 bg-cyan-950/30 border-cyan-800/40' },
  document: { label: 'Document', icon: FileText, color: 'text-amber-400 bg-amber-950/30 border-amber-800/40' },
  statement: { label: 'Witness Statement', icon: FileSpreadsheet, color: 'text-blue-400 bg-blue-950/30 border-blue-800/40' },
  timeline: { label: 'Timeline Log', icon: Clock, color: 'text-orange-400 bg-orange-950/30 border-orange-800/40' }
};

export default function EvidenceCard({ evidence, onClick }) {
  const meta = EVIDENCE_TYPE_META[evidence.type] || EVIDENCE_TYPE_META.document;
  const Icon = meta.icon;

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
        evidence.isDiscovered
          ? 'bg-slate-900/90 border-slate-700 hover:border-amber-500/60 shadow-sm'
          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 opacity-90'
      }`}
    >
      <div>
        {/* Top bar with Type and Discovery state */}
        <div className="flex items-center justify-between mb-3">
          <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${meta.color}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{meta.label}</span>
          </div>

          <div>
            {evidence.isDiscovered ? (
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Discovered</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Undiscovered</span>
              </span>
            )}
          </div>
        </div>

        {/* Title and Short Description */}
        <h4 className="font-semibold text-sm text-white group-hover:text-amber-300 transition-colors mb-1.5 line-clamp-1">
          {evidence.title}
        </h4>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {evidence.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Source: {evidence.source}</span>
        <span className="flex items-center space-x-1 text-amber-400/90 font-medium group-hover:translate-x-0.5 transition-transform">
          <Eye className="w-3.5 h-3.5" />
          <span>Examine</span>
        </span>
      </div>
    </div>
  );
}

