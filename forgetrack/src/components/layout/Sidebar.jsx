import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, BookOpen, Upload, UserCheck, Calendar, LogOut, Settings, Moon, Sun } from 'lucide-react';

export function Sidebar({ role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('role');
    navigate('/login');
  };

  const navClass = ({ isActive }) => 
    `flex items-center gap-3 px-4 h-10 rounded-md transition-all duration-200 ${
      isActive 
        ? 'bg-amethyst text-white font-semibold' 
        : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
    }`;

  return (
    <aside className="w-64 h-screen bg-darkcard border-r border-white/5 flex flex-col flex-shrink-0 relative z-20">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-amethyst flex items-center justify-center font-bold text-white text-lg">F</div>
        <span className="font-bold text-xl text-white tracking-tight">Forge<span className="text-amethyst">Track</span></span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-6 custom-scrollbar">
        {role === 'mentor' && (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-3 px-4 font-semibold uppercase tracking-wider">Overview</p>
              <div className="flex flex-col gap-1">
                <NavLink to="/dashboard" className={navClass}>
                  <LayoutDashboard size={18} strokeWidth={2} />
                  <span className="text-sm">Dashboard</span>
                </NavLink>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-3 px-4 font-semibold uppercase tracking-wider">Activity</p>
              <div className="flex flex-col gap-1">
                <NavLink to="/attendance" className={navClass}>
                  <CheckSquare size={18} strokeWidth={2} />
                  <span className="text-sm">Mark Attendance</span>
                </NavLink>
                <NavLink to="/history" className={navClass}>
                  <Users size={18} strokeWidth={2} />
                  <span className="text-sm">Student History</span>
                </NavLink>
                <NavLink to="/materials" className={navClass}>
                  <BookOpen size={18} strokeWidth={2} />
                  <span className="text-sm">Materials</span>
                </NavLink>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-3 px-4 font-semibold uppercase tracking-wider">Data</p>
              <div className="flex flex-col gap-1">
                <NavLink to="/upload" className={navClass}>
                  <Upload size={18} strokeWidth={2} />
                  <span className="text-sm">Upload CSV</span>
                </NavLink>
              </div>
            </div>
          </>
        )}

        {role === 'student' && (
          <>
            <div>
              <p className="text-xs text-gray-500 mb-3 px-4 font-semibold uppercase tracking-wider">Overview</p>
              <div className="flex flex-col gap-1">
                <NavLink to="/me/attendance" className={navClass}>
                  <UserCheck size={18} strokeWidth={2} />
                  <span className="text-sm">My Attendance</span>
                </NavLink>
                <NavLink to="/me/upcoming" className={navClass}>
                  <Calendar size={18} strokeWidth={2} />
                  <span className="text-sm">Upcoming</span>
                </NavLink>
                <NavLink to="/me/materials" className={navClass}>
                  <BookOpen size={18} strokeWidth={2} />
                  <span className="text-sm">Materials</span>
                </NavLink>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-white/5 flex flex-col gap-4">
        {/* Dark Mode Toggle (Visual Only) */}
        <div className="flex items-center justify-between px-4 py-2 bg-darkbase rounded-md border border-white/5">
          <div className="flex items-center gap-2 text-gray-400">
            <Moon size={16} />
            <span className="text-xs font-semibold text-white">Dark Mode</span>
          </div>
          <div className="w-8 h-4 bg-amethyst rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>

        <button className="w-full bg-amethyst hover:bg-amethyst-hover text-white text-sm font-semibold py-2.5 rounded-md transition-colors">
          Upgrade Now
        </button>

        <div className="flex items-center justify-between mt-2 px-2 text-gray-400">
          <button onClick={handleLogout} className="flex items-center gap-2 hover:text-white transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <button className="hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
