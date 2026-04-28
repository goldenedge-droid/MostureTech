
import React from 'react';
import { AppView } from '../types';
import { ICONS, COLORS } from '../constants';

interface LayoutProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const navItems = [
    { view: AppView.HOME, label: 'Dashboard', icon: ICONS.Home },
    { view: AppView.CALCULATORS, label: 'Tools', icon: ICONS.Calculator },
    { view: AppView.ACADEMY, label: 'Academy', icon: ICONS.Academy },
    { view: AppView.TUTOR, label: 'Tutor', icon: ICONS.Tutor },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto overflow-hidden bg-slate-950 shadow-2xl">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <ICONS.Droplet className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-100">
            Moisture<span className="text-sky-500">Tech</span>
          </h1>
        </div>
        <div className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
          LVL 12
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 flex justify-around items-center h-20 px-4 z-50">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentView === item.view ? 'text-sky-400 scale-110' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
