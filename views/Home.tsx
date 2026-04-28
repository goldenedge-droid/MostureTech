
import React from 'react';
import { ICONS } from '../constants';
import { AppView } from '../types';

interface HomeProps {
  setView: (view: AppView) => void;
  completedLessons?: string[];
}

// Updated based on new Handbook Structure
const EXPERT_CHECKLIST = [
  { id: 'm1-l2', label: 'Relative Humidity Mastery', category: 'Physics' },
  { id: 'm2-l1', label: 'Sorption vs Condensation', category: 'Methods' },
  { id: 'm3-lab', label: 'Mollier Diagram Analysis', category: 'Psychrometrics' },
  { id: 'm4-case', label: 'Warehouse Dimensioning', category: 'Engineering' },
];

const Home: React.FC<HomeProps> = ({ setView, completedLessons = [] }) => {
  const totalSteps = EXPERT_CHECKLIST.length;
  const completedCount = completedLessons.filter(id => EXPERT_CHECKLIST.some(step => step.id === id)).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <section>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Technician Dashboard</h2>
        <p className="text-slate-400 text-sm mt-1 font-light">Status: <span className="text-sky-400 font-mono font-medium">{progressPercent === 100 ? 'HANDBOOK MASTER' : progressPercent > 50 ? 'SENIOR TECHNICIAN' : 'JUNIOR APPRENTICE'}</span></p>
      </section>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/50 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <ICONS.Droplet className="w-24 h-24 text-sky-500" />
        </div>
        <div className="relative z-10">
          <p className="text-sky-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Handbook Progress</p>
          <h3 className="text-2xl font-bold text-white leading-tight">Moisture Technology<br/>Certification</h3>
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="tracking-widest">CHAPTER COMPLETION</span>
              <span className="text-sky-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
              <div 
                className="h-full bg-gradient-to-r from-sky-600 to-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.4)] transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <button 
            onClick={() => setView(AppView.ACADEMY)}
            className="mt-8 w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-sky-900/40"
          >
            Open Handbook
            <ICONS.ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* The Path to Moisture Jedi Checklist */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Core Competencies</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-500 uppercase font-bold">Certification Path</span>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-[2rem] overflow-hidden divide-y divide-slate-800/30">
          {EXPERT_CHECKLIST.map((step) => {
            const isDone = completedLessons.includes(step.id);
            return (
              <div key={step.id} className="p-5 flex items-center justify-between group transition-colors hover:bg-slate-800/20">
                <div className="flex items-center gap-5">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-500 ${
                    isDone ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-700'
                  }`}>
                    {isDone ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <span className="text-[11px] font-bold font-mono">0{EXPERT_CHECKLIST.indexOf(step) + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-bold tracking-tight transition-colors ${isDone ? 'text-slate-200' : 'text-slate-500'}`}>{step.label}</p>
                    <p className="text-[9px] text-slate-600 uppercase font-mono mt-0.5 tracking-wider font-bold">{step.category}</p>
                  </div>
                </div>
                {isDone ? (
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Certified</span>
                ) : (
                  <button 
                    onClick={() => setView(AppView.ACADEMY)}
                    className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-sky-500 uppercase tracking-widest transition-opacity"
                  >
                    Study
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Tools Grid */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Field Utilities</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setView(AppView.CALCULATORS)}
            className="p-6 bg-slate-900 border border-slate-800/50 rounded-[2rem] text-left hover:border-sky-500/50 transition-all group active:scale-[0.96] shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-inner">
              <ICONS.Calculator className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-100 text-sm tracking-tight">Psychrometrics</p>
            <p className="text-[9px] text-slate-600 uppercase mt-1 font-mono font-bold tracking-tighter">Field Engine</p>
          </button>
          
          <button 
            onClick={() => setView(AppView.TUTOR)}
            className="p-6 bg-slate-900 border border-slate-800/50 rounded-[2rem] text-left hover:border-amber-500/50 transition-all group active:scale-[0.96] shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-inner">
              <ICONS.Tutor className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-100 text-sm tracking-tight">Moisture Guru</p>
            <p className="text-[9px] text-slate-600 uppercase mt-1 font-mono font-bold tracking-tighter">AI Knowledge</p>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
