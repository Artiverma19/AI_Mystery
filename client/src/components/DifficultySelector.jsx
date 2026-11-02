import React from 'react';
import { UserCheck, FileSearch, Lightbulb, Trophy } from 'lucide-react';

const DIFFICULTIES = [
  {
    id: 'easy',
    name: 'Easy',
    badge: 'Novice Detective',
    suspects: 3,
    evidence: 5,
    hints: 2,
    basePoints: 100,
    accent: 'border-emerald-500/40 hover:border-emerald-500 bg-emerald-950/20 text-emerald-300'
  },
  {
    id: 'medium',
    name: 'Medium',
    badge: 'Senior Inspector',
    suspects: 4,
    evidence: 7,
    hints: 3,
    basePoints: 150,
    accent: 'border-amber-500/40 hover:border-amber-500 bg-amber-950/20 text-amber-300'
  },
  {
    id: 'hard',
    name: 'Hard',
    badge: 'Master Sleuth',
    suspects: 5,
    evidence: 9,
    hints: 3,
    basePoints: 200,
    accent: 'border-red-500/40 hover:border-red-500 bg-red-950/20 text-red-300'
  }
];

export default function DifficultySelector({ value, onChange, disabled = false }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {DIFFICULTIES.map((diff) => {
        const isSelected = value === diff.id;
        return (
          <button
            key={diff.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(diff.id)}
            className={`p-4 rounded-xl border text-left transition-all relative ${
              isSelected
                ? `${diff.accent} ring-2 ring-amber-500/50 shadow-lg`
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-base text-white">{diff.name}</span>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {diff.badge}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>{diff.suspects} Suspects</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <FileSearch className="w-3.5 h-3.5 text-slate-500" />
                <span>{diff.evidence} Evidence</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
                <span>{diff.hints} Hints</span>
              </div>
              <div className="flex items-center space-x-1.5 text-amber-400 font-medium">
                <Trophy className="w-3.5 h-3.5" />
                <span>{diff.basePoints} Pts</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

