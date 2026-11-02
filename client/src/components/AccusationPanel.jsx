import React, { useState } from 'react';
import { Gavel, AlertTriangle, ShieldAlert } from 'lucide-react';
import Button from './Button.jsx';
import SuspectCard from './SuspectCard.jsx';

export default function AccusationPanel({ suspects = [], onAccuse, isSubmitting = false, disabled = false }) {
  const [selectedSuspectId, setSelectedSuspectId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const selectedSuspect = suspects.find((s) => s.id === selectedSuspectId);

  function handleOpenConfirm() {
    if (!selectedSuspectId) return;
    setShowConfirmModal(true);
  }

  function handleConfirm() {
    setShowConfirmModal(false);
    if (onAccuse && selectedSuspectId) {
      onAccuse(selectedSuspectId);
    }
  }

  return (
    <div className="rounded-xl border border-red-900/40 bg-gradient-to-b from-slate-900 to-red-950/20 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-red-400 mb-1">
            <Gavel className="w-5 h-5" />
            <h3 className="font-bold text-base sm:text-lg text-white">Deliver Your Accusation</h3>
          </div>
          <p className="text-xs text-slate-400">
            Select the primary culprit from the suspect lineup. You have only <strong className="text-red-400">one attempt</strong>.
          </p>
        </div>

        <Button
          variant="danger"
          size="md"
          disabled={disabled || !selectedSuspectId || isSubmitting}
          isLoading={isSubmitting}
          onClick={handleOpenConfirm}
        >
          <Gavel className="w-4 h-4 mr-1.5" />
          Accuse Selected Suspect
        </Button>
      </div>

      {/* Lineup selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {suspects.map((suspect) => (
          <SuspectCard
            key={suspect.id}
            suspect={suspect}
            selectable={!disabled && !isSubmitting}
            isSelected={selectedSuspectId === suspect.id}
            onSelect={(id) => setSelectedSuspectId(id)}
            showFullDetails={false}
          />
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedSuspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-red-800/60 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center mb-4 text-red-400 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-bold text-white text-center mb-2">Confirm Accusation</h4>
            <p className="text-sm text-slate-300 text-center mb-4">
              Are you sure you want to formally accuse{' '}
              <strong className="text-red-400 font-bold">{selectedSuspect.name}</strong>?
            </p>

            <div className="p-3 bg-red-950/30 rounded-lg border border-red-900/40 text-xs text-red-300 mb-6 leading-relaxed">
              <AlertTriangle className="w-4 h-4 inline mr-1 text-red-400" />
              This action cannot be undone. Case evidence and hints will lock, and your final score will be calculated immediately.
            </div>

            <div className="flex items-center justify-end space-x-3">
              <Button variant="secondary" size="sm" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirm}>
                Yes, Submit Accusation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

