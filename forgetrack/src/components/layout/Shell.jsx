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
    <div className="flex h-screen overflow-hidden bg-darkbase text-gray-100">
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 z-10 border-b border-white/5 bg-darkcard">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {title}
            </h1>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#" className="text-white border-b-2 border-amethyst py-5">Overview</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Notifications</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Trade history</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex relative group w-64">
              <input 
                type="text" 
                className="w-full bg-darkbase border border-white/5 h-9 rounded-md text-sm pl-4 pr-10 focus:border-amethyst/50 focus:outline-none transition-all text-white placeholder-gray-500" 
                placeholder="Search" 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <button className="h-9 px-3 flex items-center gap-2 bg-darkbase border border-white/5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:border-white/10 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                Nov 11 - Nov 18
              </button>
              <button className="h-9 w-9 flex items-center justify-center bg-darkbase border border-white/5 rounded-md text-gray-300 hover:text-white hover:border-white/10 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              </button>
            </div>

            <button className="h-9 px-4 bg-amethyst hover:bg-amethyst-hover text-white rounded-md text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
              Share
            </button>

            <div className="w-9 h-9 rounded-full ml-2 overflow-hidden border border-white/10 cursor-pointer">
              <img src="https://ui-avatars.com/api/?name=Akash+Acharya&background=random" alt="User" className="w-full h-full object-cover" />
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
