import React, { useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  FileSearch,
  MessageSquare,
  Video,
  Camera,
  FileText
} from 'lucide-react';
import Button from './Button.jsx';
import FictionalMediaLabel from './FictionalMediaLabel.jsx';
import { EVIDENCE_TYPE_META } from './EvidenceCard.jsx';

export default function EvidenceViewer({ evidence, isOpen, onClose, onDiscover, isDiscovering = false }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !evidence) return null;

  const meta = EVIDENCE_TYPE_META[evidence.type] || EVIDENCE_TYPE_META.document;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-modal-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${meta.color}`}>
                <meta.icon className="w-3.5 h-3.5" />
                <span>{meta.label}</span>
              </span>
              <FictionalMediaLabel label="Fictional AI Content" />
            </div>
            <h3 id="evidence-modal-title" className="text-lg sm:text-xl font-bold text-white">
              {evidence.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Metadata badges (Timestamp, Location, Source) */}
          <div className="flex flex-wrap gap-2 text-xs">
            {evidence.timestamp && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Timestamp: {evidence.timestamp}</span>
              </div>
            )}
            {evidence.location && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Location: {evidence.location}</span>
              </div>
            )}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
              <FileSearch className="w-3.5 h-3.5 text-blue-400" />
              <span>Source: {evidence.source}</span>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-3.5 rounded-lg border border-slate-800">
            <span className="text-xs uppercase font-mono text-slate-500 block mb-1">Evidence Brief</span>
            {evidence.description}
          </div>

          {/* Type-Specific Evidence Presentation */}
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            {evidence.type === 'chat' && (
              <div className="bg-[#0b141a] p-4 sm:p-6 font-sans">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                      💬
                    </div>
                    <span className="font-semibold text-slate-200">Fictional Encrypted Chat Log</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded">
                    Decrypted
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg rounded-tl-none bg-[#1f2c34] p-3 text-slate-200 text-xs sm:text-sm shadow">
                      <p className="whitespace-pre-line leading-relaxed">{evidence.content}</p>
                      <div className="text-[10px] text-slate-400 text-right mt-1.5">
                        {evidence.timestamp || 'Recorded'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {evidence.type === 'camera_record' && (
              <div className="bg-slate-950 p-4 sm:p-6 border border-cyan-900/40 rounded-xl relative overflow-hidden font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-cyan-900/40 text-cyan-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-bold tracking-wider uppercase">CCTV FEED REC [CAM-03]</span>
                  </div>
                  <span>{evidence.timestamp || '23:59:00'}</span>
                </div>
                <div className="p-4 bg-slate-900/80 rounded border border-cyan-800/30 text-cyan-200 leading-relaxed font-sans text-sm">
                  <p className="whitespace-pre-line">{evidence.content}</p>
                </div>
                <div className="text-[10px] text-cyan-600 mt-3 text-right">
                  SIMULATED CAMERA STORYBOARD TRANSCRIPT • FICTIONAL SURVEILLANCE
                </div>
              </div>
            )}

            {evidence.type === 'image' && (
              <div className="bg-slate-950 p-6 text-center border border-purple-900/30 rounded-xl">
                {evidence.assetUrl ? (
                  <img
                    src={evidence.assetUrl}
                    alt={evidence.title}
                    className="max-h-64 mx-auto rounded-lg object-contain mb-4 border border-slate-700"
                  />
                ) : (
                  <div className="h-44 rounded-lg bg-purple-950/20 border border-purple-800/40 flex flex-col items-center justify-center mb-4 p-4">
                    <Camera className="w-10 h-10 text-purple-400 mb-2" />
                    <span className="text-xs font-semibold text-purple-300">Fictional Scene Photograph</span>
                    <span className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      {evidence.description}
                    </span>
                  </div>
                )}
                <div className="p-3 bg-slate-900/90 rounded border border-slate-800 text-left text-sm text-slate-200">
                  <span className="text-[10px] uppercase font-mono text-purple-400 block mb-1">
                    Visual Clue Transcript
                  </span>
                  <p className="leading-relaxed">{evidence.content}</p>
                </div>
              </div>
            )}

            {(evidence.type === 'document' || evidence.type === 'statement' || evidence.type === 'timeline') && (
              <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 font-sans text-sm">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
                  <span>CONFIDENTIAL INVESTIGATION DOCUMENT</span>
                  <span className="text-amber-400">RESTRICTED DOSSIER</span>
                </div>
                <div className="p-4 bg-slate-900/70 rounded-lg border border-slate-800/80 text-slate-200 leading-relaxed">
                  <p className="whitespace-pre-line">{evidence.content}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Discover Action */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            {evidence.isDiscovered ? (
              <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Evidence Discovered (+5 Points Earned)</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Mark as discovered to log this clue in your case file.
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            {!evidence.isDiscovered && onDiscover && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onDiscover(evidence.id)}
                isLoading={isDiscovering}
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Discover Clue (+5 pts)
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
