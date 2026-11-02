import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldAlert, Sparkles } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:border-amber-500/60 transition-colors">
            <Compass className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-wide">AI Mystery Room</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Detective MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Fictional AI-Powered Crime Investigation</p>
          </div>
        </Link>

        <nav className="flex items-center space-x-4">
          <Link
            to="/create"
            className="flex items-center space-x-1.5 text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Create Mystery</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

