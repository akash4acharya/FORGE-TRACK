import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Shell({ children }) {
  const role = localStorage.getItem('role') || 'mentor'; // Fallback
  const location = useLocation();

  // Basic breadcrumb
  const path = location.pathname.substring(1) || 'Dashboard';
  const title = path.charAt(0).toUpperCase() + path.slice(1);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-[80px] flex items-center justify-between px-10 z-10 border-b border-border-subtle bg-canvas/80 backdrop-blur-xl">
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-text-tertiary uppercase tracking-widest">
              Overview <span className="mx-2 text-border-strong">/</span> 
              <span className="text-text-primary">{title}</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative group w-80">
              <input 
                type="text" 
                className="input bg-surface-inset border-border-subtle h-11 text-sm pl-4 pr-12 focus:bg-surface focus:shadow-xl transition-all rounded-xl" 
                placeholder="Search anything..." 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-surface-raised border border-border-subtle rounded-lg text-[10px] font-bold text-text-tertiary">
                ⌘K
              </div>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-border-subtle">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent-glow to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105 transition-transform">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-10 py-8 relative z-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
