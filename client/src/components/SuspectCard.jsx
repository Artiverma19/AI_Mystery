import React from 'react';
import { User, AlertTriangle, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import FictionalMediaLabel from './FictionalMediaLabel.jsx';

export default function SuspectCard({
  suspect,
  isSelected = false,
  onSelect,
  selectable = false,
  showFullDetails = true
}) {
  return (
    <div
      onClick={selectable && onSelect ? () => onSelect(suspect.id) : undefined}
      className={`rounded-xl border transition-all duration-200 bg-slate-900/70 p-5 flex flex-col justify-between ${
        selectable ? 'cursor-pointer hover:border-amber-500/60' : ''
      } ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-950/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Header with Portrait/Avatar and Name */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {suspect.portrait?.assetUrl ? (
                <img
                  src={suspect.portrait.assetUrl}
                  alt={suspect.portrait.alt || suspect.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-base text-white leading-tight">{suspect.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{suspect.profile}</p>
            </div>
          </div>

          {selectable && (
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                isSelected
                  ? 'border-amber-500 bg-amber-500 text-slate-950'
                  : 'border-slate-700 bg-slate-800 text-transparent'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Fictional Portrait Alt Label */}
        {suspect.portrait?.alt && (
          <div className="mb-3">
            <FictionalMediaLabel label={`Suspect: ${suspect.portrait.alt}`} className="text-[10px]" />
          </div>
        )}

        {showFullDetails && (
          <div className="space-y-3 text-xs mt-3">
            {/* Statement */}
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-400 font-semibold mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Statement</span>
              </div>
              <p className="text-slate-300 italic">"{suspect.statement}"</p>
            </div>

            {/* Motive & Opportunity */}
            <div className="grid grid-cols-1 gap-2">
              <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-900/30">
                <div className="flex items-center space-x-1.5 text-red-400 font-semibold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Suspected Motive</span>
                </div>
                <p className="text-red-200/90 leading-relaxed">{suspect.motive}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/30">
                <div className="flex items-center space-x-1.5 text-blue-400 font-semibold mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Opportunity / Alibi</span>
                </div>
                <p className="text-blue-200/90 leading-relaxed">{suspect.opportunity}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
