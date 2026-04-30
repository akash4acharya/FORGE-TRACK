import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, BookOpen, Upload, UserCheck, Calendar, LogOut } from 'lucide-react';

export function Sidebar({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login');
  };

  const navClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 h-11 rounded-xl transition-all duration-300 ${
      isActive 
        ? 'bg-accent-glow text-text-inverse font-medium shadow-md shadow-blue-500/20' 
        : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary font-medium'
    }`;

  return (
    <aside className="w-[280px] h-screen bg-canvas border-r border-border-subtle flex flex-col flex-shrink-0 relative z-20">
      <div className="p-6 border-b border-border-subtle flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent-glow flex items-center justify-center font-bold text-white text-lg shadow-sm">F</div>
        <span className="font-display font-bold text-xl text-text-primary tracking-tight">ForgeTrack</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        <div className="px-3 mb-2 animate-fade-in flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-raised border border-border-default flex items-center justify-center text-text-primary font-medium text-sm">
            AA
          </div>
          <div>
            <p className="text-micro text-text-secondary mb-0.5">Welcome back!</p>
            <p className="text-body-sm font-semibold text-text-primary">Akash Acharya 👋</p>
          </div>
        </div>

        {role === 'mentor' && (
          <>
            <div>
              <p className="text-label text-fg-tertiary mb-2 px-2 uppercase tracking-wider">Overview</p>
              <NavLink to="/dashboard" className={navClass}>
                <LayoutDashboard size={20} strokeWidth={1.75} />
                <span className="text-body">Dashboard</span>
              </NavLink>
            </div>
            <div>
              <p className="text-label text-fg-tertiary mb-2 px-2 uppercase tracking-wider">Activity</p>
              <NavLink to="/attendance" className={navClass}>
                <CheckSquare size={20} strokeWidth={1.75} />
                <span className="text-body">Mark Attendance</span>
              </NavLink>
              <NavLink to="/history" className={navClass}>
                <Users size={20} strokeWidth={1.75} />
                <span className="text-body">Student History</span>
              </NavLink>
              <NavLink to="/materials" className={navClass}>
                <BookOpen size={20} strokeWidth={1.75} />
                <span className="text-body">Materials</span>
              </NavLink>
            </div>
            <div>
              <p className="text-label text-fg-tertiary mb-2 px-2 uppercase tracking-wider">Data</p>
              <NavLink to="/upload" className={navClass}>
                <Upload size={20} strokeWidth={1.75} />
                <span className="text-body">Upload CSV</span>
              </NavLink>
            </div>
          </>
        )}

        {role === 'student' && (
          <>
            <div>
              <p className="text-label text-fg-tertiary mb-2 px-2 uppercase tracking-wider">Overview</p>
              <NavLink to="/me/attendance" className={navClass}>
                <UserCheck size={20} strokeWidth={1.75} />
                <span className="text-body">My Attendance</span>
              </NavLink>
              <NavLink to="/me/upcoming" className={navClass}>
                <Calendar size={20} strokeWidth={1.75} />
                <span className="text-body">Upcoming</span>
              </NavLink>
              <NavLink to="/me/materials" className={navClass}>
                <BookOpen size={20} strokeWidth={1.75} />
                <span className="text-body">Materials</span>
              </NavLink>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-border-subtle">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 h-11 w-full rounded-lg text-fg-secondary hover:bg-surface transition-colors">
          <LogOut size={20} strokeWidth={1.75} />
          <span className="text-body">Logout</span>
        </button>
      </div>
    </aside>
  );
}
