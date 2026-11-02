import React from 'react';
import { Lightbulb, AlertCircle, Sparkles } from 'lucide-react';
import Button from './Button.jsx';

export default function HintPanel({
  hints = [],
  hintsUsed = 0,
  hintsRemaining = 0,
  onRequestHint,
  isLoading = false,
  disabled = false
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Investigation Hints</h4>
            <p className="text-xs text-slate-400">
              {hintsRemaining} {hintsRemaining === 1 ? 'hint' : 'hints'} remaining • -10 points each
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRequestHint}
          disabled={disabled || hintsRemaining <= 0 || isLoading}
          isLoading={isLoading}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
          Request Hint (-10 pts)
        </Button>
      </div>

      {hints.length === 0 ? (
        <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-400">
          No hints requested yet. Stuck on a deduction? Request a subtle clue from headquarters.
        </div>
      ) : (
        <div className="space-y-2.5">
          {hints.map((hintText, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs sm:text-sm text-amber-200/90 flex items-start space-x-3"
            >
              <span className="font-mono text-xs font-bold text-amber-400 shrink-0 mt-0.5">
                Hint #{idx + 1}:
              </span>
              <p className="leading-relaxed">{hintText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
