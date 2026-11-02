import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function FictionalMediaLabel({ label = 'Fictional AI-Generated Evidence', className = '' }) {
  return (
    <div
      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700 ${className}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
      <span>{label}</span>
    </div>
  );
}

