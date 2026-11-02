import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  Search,
  Lightbulb,
  Gavel,
  ShieldAlert,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { getCase, discoverEvidence, requestHint, accuseSuspect } from '../services/api.js';
import SuspectCard from '../components/SuspectCard.jsx';
import EvidenceCard from '../components/EvidenceCard.jsx';
import EvidenceViewer from '../components/EvidenceViewer.jsx';
import HintPanel from '../components/HintPanel.jsx';
import ProgressIndicator from '../components/ProgressIndicator.jsx';
import AccusationPanel from '../components/AccusationPanel.jsx';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import FictionalMediaLabel from '../components/FictionalMediaLabel.jsx';

export default function InvestigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [unlockedHints, setUnlockedHints] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isRequestingHint, setIsRequestingHint] = useState(false);
  const [isAccusing, setIsAccusing] = useState(false);

  // Active view tab on mobile: 'evidence' | 'suspects' | 'hints' | 'accuse'
  const [activeTab, setActiveTab] = useState('evidence');

  useEffect(() => {
    loadCaseData();
  }, [id]);

  async function loadCaseData() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCase(id);
      if (response?.case) {
        if (response.case.status === 'completed') {
          navigate(`/case/${id}/result`);
          return;
        }
        setCaseData(response.case);
      } else {
        throw new Error('Case not found');
      }
    } catch (err) {
      console.error('Failed to load case:', err);
      setError(err.message || 'Failed to retrieve case investigation records');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDiscoverEvidence(evidenceId) {
    if (!caseData || isDiscovering) return;
    setIsDiscovering(true);
    try {
      const res = await discoverEvidence(id, evidenceId);
      if (res?.discoveredEvidenceIds) {
        // Update local case state
        setCaseData((prev) => {
          if (!prev) return prev;
          const updatedDiscovered = res.discoveredEvidenceIds;
          return {
            ...prev,
            discoveredEvidenceIds: updatedDiscovered,
            evidence: prev.evidence.map((e) =>
              e.id === evidenceId ? { ...e, isDiscovered: true, isClue: true } : e
            )
          };
        });

        // Update selected evidence in modal if open
        if (selectedEvidence && selectedEvidence.id === evidenceId) {
          setSelectedEvidence((prev) => (prev ? { ...prev, isDiscovered: true, isClue: true } : null));
        }
      }
    } catch (err) {
      console.error('Error discovering evidence:', err);
      alert(err.message || 'Failed to record evidence discovery');
    } finally {
      setIsDiscovering(false);
    }
  }

  async function handleRequestHint() {
    if (!caseData || isRequestingHint) return;
    setIsRequestingHint(true);
    try {
      const res = await requestHint(id);
      if (res?.hint) {
        setUnlockedHints((prev) => [...prev, res.hint]);
        setCaseData((prev) =>
          prev
            ? {
                ...prev,
                hintsUsed: res.hintsUsed,
                hintsRemaining: res.hintsRemaining
              }
            : prev
        );
      }
    } catch (err) {
      console.error('Error requesting hint:', err);
      alert(err.message || 'Failed to request hint');
    } finally {
      setIsRequestingHint(false);
    }
  }

  async function handleAccuse(suspectId) {
    if (!caseData || isAccusing) return;
    setIsAccusing(true);
    try {
      const res = await accuseSuspect(id, suspectId);
      if (res?.result) {
        navigate(`/case/${id}/result`, { state: { result: res.result } });
      }
    } catch (err) {
      console.error('Accusation error:', err);
      alert(err.message || 'Accusation failed');
      setIsAccusing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <LoadingState
          title="Entering Investigation Room..."
          message="Retrieving forensic logs, witness statements, and detective case files."
        />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <ErrorState
          title="Case File Unavailable"
          message={error || 'Could not load investigation files.'}
          onRetry={loadCaseData}
        />
      </div>
    );
  }

  const discoveredCount = caseData.discoveredEvidenceIds?.length || 0;
  const totalEvidence = caseData.evidence?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Case Dossier Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Active Case #{caseData.id?.slice(-6)}
            </span>
            <FictionalMediaLabel label="Fictional Incident" />
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>{caseData.setting}</span>
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
          {caseData.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="md:col-span-2 space-y-2">
            <span className="text-xs uppercase font-mono text-slate-400 block">Briefing</span>
            <p className="text-sm text-slate-300 leading-relaxed">{caseData.briefing}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
            <span className="text-amber-400 font-semibold block mb-1">Incident Summary</span>
            <p className="text-slate-300 leading-relaxed">{caseData.incident}</p>
          </div>
        </div>
      </div>

      {/* Progress & Stats Bar */}
      <ProgressIndicator
        difficulty={caseData.difficulty}
        discoveredCount={discoveredCount}
        totalEvidence={totalEvidence}
        hintsUsed={caseData.hintsUsed || 0}
        hintsRemaining={caseData.hintsRemaining || 0}
      />

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center space-x-2">
        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'evidence'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Evidence Board ({totalEvidence})</span>
        </button>

        <button
          onClick={() => setActiveTab('suspects')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'suspects'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Suspects ({caseData.suspects?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('hints')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'hints'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Hints ({caseData.hintsRemaining ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('accuse')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'accuse'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Gavel className="w-4 h-4 text-red-400" />
          <span>Accusation Panel</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Search className="w-5 h-5 text-amber-400" />
              <span>Evidence Board</span>
            </h2>
            <span className="text-xs text-slate-400">Click any card to inspect and discover clues</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseData.evidence?.map((item) => (
              <EvidenceCard
                key={item.id}
                evidence={item}
                onClick={() => setSelectedEvidence(item)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'suspects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Suspect Lineup</span>
            </h2>
            <span className="text-xs text-slate-400">Review public statements, motives, and opportunities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseData.suspects?.map((suspect) => (
              <SuspectCard key={suspect.id} suspect={suspect} showFullDetails={true} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'hints' && (
        <div className="max-w-2xl mx-auto">
          <HintPanel
            hints={unlockedHints}
            hintsUsed={caseData.hintsUsed || 0}
            hintsRemaining={caseData.hintsRemaining || 0}
            onRequestHint={handleRequestHint}
            isLoading={isRequestingHint}
            disabled={caseData.status === 'completed'}
          />
        </div>
      )}

      {activeTab === 'accuse' && (
        <div className="space-y-6">
          <AccusationPanel
            suspects={caseData.suspects || []}
            onAccuse={handleAccuse}
            isSubmitting={isAccusing}
            disabled={caseData.status === 'completed'}
          />
        </div>
      )}

      {/* Evidence Viewer Modal */}
      <EvidenceViewer
        evidence={selectedEvidence}
        isOpen={Boolean(selectedEvidence)}
        onClose={() => setSelectedEvidence(null)}
        onDiscover={handleDiscoverEvidence}
        isDiscovering={isDiscovering}
      />
    </div>
  );
}

