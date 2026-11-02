import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileSearch,
  Lightbulb,
  Award,
  Compass
} from 'lucide-react';
import { getCaseResult } from '../services/api.js';
import Button from '../components/Button.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import FictionalMediaLabel from '../components/FictionalMediaLabel.jsx';

export default function ResultPage() {
  const { id } = useParams();
  const location = useLocation();

  const [resultData, setResultData] = useState(location.state?.result || null);
  const [isLoading, setIsLoading] = useState(!location.state?.result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resultData) {
      loadResult();
    }
  }, [id]);

  async function loadResult() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCaseResult(id);
      if (response?.result) {
        setResultData(response.result);
      } else {
        throw new Error('Could not retrieve case solution');
      }
    } catch (err) {
      console.error('Error fetching result:', err);
      setError(err.message || 'The case is either active or result could not be retrieved');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingState
          title="Unsealing Final Verdict..."
          message="Retrieving forensic conclusion, scoring adjustments, and case answer key."
        />
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <ErrorState
          title="Case Result Unavailable"
          message={error || 'Could not load resolution.'}
          onRetry={loadResult}
        />
      </div>
    );
  }

  const {
    isCorrect,
    accusedSuspectId,
    culprit,
    explanation,
    motive,
    method,
    opportunity,
    supportingEvidence = [],
    discoveredEvidenceCount = 0,
    hintsUsed = 0,
    score = 0
  } = resultData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Verdict Header Banner */}
      <div
        className={`rounded-2xl border p-6 sm:p-10 text-center relative overflow-hidden ${
          isCorrect
            ? 'bg-gradient-to-b from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/50 shadow-2xl shadow-emerald-950/50'
            : 'bg-gradient-to-b from-red-950/40 via-slate-900 to-slate-950 border-red-500/50 shadow-2xl shadow-red-950/50'
        }`}
      >
        <div className="inline-flex items-center space-x-2 mb-4">
          <FictionalMediaLabel label="Fictional Case Verdict" />
        </div>

        <div className="flex justify-center mb-4">
          {isCorrect ? (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-400 flex items-center justify-center text-red-400">
              <XCircle className="w-10 h-10" />
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2">
          {isCorrect ? 'Mystery Solved!' : 'Case Unsolved'}
        </h1>

        <p className="text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
          {isCorrect
            ? 'Outstanding deduction! You successfully identified the culprit and unraveled the deception.'
            : 'The culprit escaped unnoticed. Your theory did not match the underlying evidence.'}
        </p>

        {/* Score Card */}
        <div className="mt-8 p-4 sm:p-6 rounded-xl bg-slate-900/90 border border-slate-800 max-w-md mx-auto grid grid-cols-3 gap-2 text-center">
          <div className="p-2 border-r border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Clues (+5)</span>
            <span className="text-sm font-bold text-slate-200">+{discoveredEvidenceCount * 5}</span>
          </div>
          <div className="p-2 border-r border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Hints (-10)</span>
            <span className="text-sm font-bold text-slate-200">-{hintsUsed * 10}</span>
          </div>
          <div className="p-2">
            <span className="text-[10px] uppercase font-mono text-amber-400 block">Final Score</span>
            <span className="text-lg font-black text-amber-300">{score} pts</span>
          </div>
        </div>
      </div>

      {/* Culprit Reveal Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase text-amber-400">
          <Award className="w-4 h-4" />
          <span>The True Culprit</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{culprit?.name || 'Unknown Culprit'}</h3>
            <p className="text-xs text-slate-400">{culprit?.profile}</p>
          </div>
          <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Your accusation:{' '}
            <strong className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
              {isCorrect ? culprit?.name : `Suspect ID: ${accusedSuspectId}`}
            </strong>
          </div>
        </div>

        {/* Motive, Method, Opportunity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold uppercase tracking-wider block">Motive</span>
            <p className="text-slate-300 leading-relaxed">{motive}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
            <span className="text-blue-400 font-bold uppercase tracking-wider block">Method</span>
            <p className="text-slate-300 leading-relaxed">{method}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold uppercase tracking-wider block">Opportunity</span>
            <p className="text-slate-300 leading-relaxed">{opportunity}</p>
          </div>
        </div>

        {/* Official Explanation */}
        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <span className="text-xs uppercase font-mono text-slate-400 block">Case Deduction & Explanation</span>
          <p className="text-sm text-slate-200 leading-relaxed">{explanation}</p>
        </div>

        {/* Supporting Evidence Breakdown */}
        {supportingEvidence.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs uppercase font-mono text-slate-400 block">Key Supporting Clues</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {supportingEvidence.map((ev) => (
                <div key={ev.id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
                  <div className="font-semibold text-white mb-1">{ev.title}</div>
                  <p className="text-slate-400 line-clamp-2">{ev.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Replay Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <Link to="/" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            Back to Home
          </Button>
        </Link>
        <Link to="/create" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto">
            <Compass className="w-4 h-4 mr-2" />
            Create Another Mystery
          </Button>
        </Link>
      </div>
    </div>
  );
}
