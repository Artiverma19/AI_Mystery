import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PenTool, Lightbulb, Compass } from 'lucide-react';
import Button from '../components/Button.jsx';
import DifficultySelector from '../components/DifficultySelector.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { createCase } from '../services/api.js';

const SAMPLE_PREMISES = [
  {
    title: 'The Moonlight Gallery Theft',
    text: 'A legendary Renaissance portrait was swapped with an expert forgery during the stormy midnight gala at the city museum.'
  },
  {
    title: 'The Clockmaker’s Missing Blueprint',
    text: 'At the old belltower workshop, the master clockmaker vanishes right after completing the blueprints for the town’s celestial clock.'
  },
  {
    title: 'The Alpine Express Sapphire',
    text: 'A luxury passenger train halts in a snowdrift. By the time power returns, a collector’s star sapphire has disappeared from the dining car safe.'
  }
];

export default function CreateCasePage() {
  const navigate = useNavigate();
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const charCount = premise.trim().length;
  const isValidLength = charCount >= 20 && charCount <= 1000;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValidLength || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await createCase({
        premise: premise.trim(),
        difficulty
      });

      if (response?.case?.id) {
        navigate(`/case/${response.case.id}`);
      } else {
        throw new Error('Case created but no case ID returned');
      }
    } catch (err) {
      console.error('Failed to create mystery case:', err);
      setError(err.message || 'Failed to generate mystery case. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
          <PenTool className="w-4 h-4" />
          <span>Case Creator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Design Your Mystery</h1>
        <p className="text-sm text-slate-400 mt-1">
          Provide a short premise and select your challenge level. Gemini will craft the suspects, clues, and chronological solution.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12">
          <LoadingState
            title="Weaving the Mystery..."
            message="Gemini is forging suspect motives, synchronizing camera transcripts, planting clues, and locking the answer key securely on the server."
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <ErrorState
              title="Mystery Creation Failed"
              message={error}
              onRetry={handleSubmit}
            />
          )}

          {/* Premise Textarea */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="premise-input" className="block text-sm font-bold text-white">
                Fictional Scenario / Premise
              </label>
              <span
                className={`text-xs font-mono ${
                  charCount === 0
                    ? 'text-slate-500'
                    : isValidLength
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {charCount} / 1000 characters {charCount < 20 ? '(min 20)' : ''}
              </span>
            </div>

            <textarea
              id="premise-input"
              rows={4}
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="e.g. During the annual technology summit in Neo-Verona, the prototype quantum drive vanishes from the locked exhibition vault..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-y"
            />

            {/* Premise Suggestions */}
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-2">Or choose a premise inspiration:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PREMISES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPremise(sample.text)}
                    className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition"
                  >
                    ✨ {sample.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Configuration */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-white">Select Difficulty Level</label>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full text-base py-3.5"
              disabled={!isValidLength || isLoading}
              isLoading={isLoading}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Mystery Room
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

