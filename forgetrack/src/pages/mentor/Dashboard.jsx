import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Calendar, BookOpen, Activity, TrendingUp, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: true });
      
      if (!error && data) {
        setSessions(data);
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const totalSessions = sessions.length;
  const nextSession = sessions.find(s => new Date(s.date) >= new Date()) || sessions[sessions.length - 1];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-text-secondary">Loading dashboard...</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Welcome Banner */}
      <div className="card bg-gradient-to-br from-surface to-surface-raised border-none p-10 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-text-primary mb-3">Welcome back, Akash! 👋</h1>
          <p className="text-text-secondary text-lg max-w-xl">
            You have {totalSessions} total sessions tracked. Your next session on <span className="text-accent-glow font-semibold">"{nextSession?.topic}"</span> is coming up.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10 hidden md:block">
          <Activity size={160} className="text-accent-glow" />
        </div>
      </div>

      {/* Stat Cards - Modern SaaS Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card flex flex-col gap-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-medium">Total Sessions</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-text-primary">{totalSessions}</h3>
              <span className="text-success-fg text-xs font-bold flex items-center gap-0.5">
                <TrendingUp size={12} /> +4%
              </span>
            </div>
          </div>
        </div>

        <div className="card flex flex-col gap-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-medium">Enrolled Students</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-text-primary">25</h3>
            </div>
          </div>
        </div>

        <div className="card flex flex-col gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-medium">Avg. Attendance</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-text-primary">92%</h3>
            </div>
          </div>
        </div>

        <div className="card flex flex-col gap-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-text-secondary text-sm font-medium">Active Days</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-bold text-text-primary">15</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-text-primary">Curriculum Overview</h2>
          <button className="btn-primary">Add New Session</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-text-tertiary text-xs uppercase tracking-wider">
                <th className="pb-4 px-2">Topic</th>
                <th className="pb-4 px-2">Date</th>
                <th className="pb-4 px-2">Status</th>
                <th className="pb-4 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {sessions.map((session, i) => (
                <tr key={session.id} className="group hover:bg-surface-raised/50 transition-colors">
                  <td className="py-4 px-2">
                    <span className="font-semibold text-text-primary">{session.topic}</span>
                  </td>
                  <td className="py-4 px-2 text-text-secondary text-sm font-medium">
                    {new Date(session.date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-2">
                    <span className={`pill ${session.session_type === 'offline' ? 'pill-success' : 'bg-surface-raised text-text-secondary'}`}>
                      {session.session_type}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button className="text-text-tertiary hover:text-accent-glow p-2 transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
