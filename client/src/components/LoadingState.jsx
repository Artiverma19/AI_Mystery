import React from 'react';
import { Loader2, Search } from 'lucide-react';

export default function LoadingState({
  title = 'Investigating Case Files...',
  message = 'Consulting witnesses, compiling fictional evidence, and securing the crime scene.',
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center ${className}`}>
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
          <Search className="w-8 h-8 text-amber-400" />
        </div>
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin absolute -top-2 -right-2" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed">{message}</p>
    </div>
  );
}

