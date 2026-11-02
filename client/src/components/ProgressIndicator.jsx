import React from 'react';
import { Search, Lightbulb, Trophy } from 'lucide-react';

export default function ProgressIndicator({
  difficulty = 'medium',
  discoveredCount = 0,
  totalEvidence = 0,
  hintsUsed = 0,
  hintsRemaining = 0
}) {
  const percentage = totalEvidence > 0 ? Math.round((discoveredCount / totalEvidence) * 100) : 0;

  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    medium: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    hard: 'text-red-400 bg-red-950/40 border-red-800/40'
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${
              difficultyColors[difficulty] || difficultyColors.medium
            }`}
          >
            {difficulty} Case
          </span>
          <span className="text-xs text-slate-400">Investigation Progress</span>
        </div>

        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Evidence: <strong className="text-white">{discoveredCount}</strong> / {totalEvidence}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Hints Used: <strong className="text-white">{hintsUsed}</strong> ({hintsRemaining} left)
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
