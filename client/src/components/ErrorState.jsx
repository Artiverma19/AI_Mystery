import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button.jsx';

export default function ErrorState({
  title = 'Investigation Halted',
  message = 'An unexpected issue occurred while accessing case records.',
  onRetry,
  className = ''
}) {
  return (
    <div
      className={`p-6 sm:p-8 rounded-xl bg-red-950/20 border border-red-800/40 text-center flex flex-col items-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-red-200/80 mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="border-red-800/50 hover:bg-red-950/40">
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
}

