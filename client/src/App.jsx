import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppHeader from './components/AppHeader.jsx';
import HomePage from './pages/HomePage.jsx';
import CreateCasePage from './pages/CreateCasePage.jsx';
import InvestigationPage from './pages/InvestigationPage.jsx';
import ResultPage from './pages/ResultPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100">
        <AppHeader />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateCasePage />} />
            <Route path="/case/:id" element={<InvestigationPage />} />
            <Route path="/case/:id/result" element={<ResultPage />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <p>AI Mystery Room • Powered by Google Gemini • Strictly Fictional Entertainment</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
