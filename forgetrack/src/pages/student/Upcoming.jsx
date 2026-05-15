import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Clock, MapPin, Video, ArrowRight } from 'lucide-react';

export default function Upcoming() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      // Try to fetch upcoming sessions from Supabase
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(5);

        if (!error && data && data.length > 0) {
          setSessions(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Fetch failed", e);
      }

      // Fallback Mock Data if empty
      setSessions([]);
      setLoading(false);
    }
    fetchSessions();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-zinc-500 font-medium">Loading upcoming sessions...</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Upcoming Sessions</h1>
        <p className="text-zinc-400 font-medium">See what's next in your curriculum and prepare ahead.</p>
      </div>

      <div className="grid gap-6">
        {sessions.length === 0 ? (
          <div className="bg-[#151517] border border-zinc-800 rounded-xl p-16 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 border border-zinc-700/50">
              <Calendar className="text-zinc-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No upcoming sessions</h3>
            <p className="text-zinc-500 text-sm max-w-md">Your mentor hasn't scheduled any new sessions yet. When they use the AI upload agent to import the roster, your upcoming classes will appear here.</p>
          </div>
        ) : (
          sessions.map((session, i) => {
            const dateObj = new Date(session.date);
            const isOnline = session.session_type === 'online';

            return (
              <div key={session.id} className="bg-darkbase hover:bg-[#1a1a1c] border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 transition-colors shadow-sm group animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex-shrink-0 bg-[#151517] border border-zinc-800 rounded-xl p-4 w-24 text-center group-hover:border-amethyst/50 transition-colors">
                  <p className="text-amethyst font-bold text-sm uppercase tracking-widest">{dateObj.toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-white font-extrabold text-3xl">{dateObj.getDate()}</p>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-amethyst transition-colors">{session.topic}</h3>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${isOnline ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-medium mt-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-zinc-500" />
                      <span>{session.duration_hours} Hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOnline ? <Video size={16} className="text-zinc-500" /> : <MapPin size={16} className="text-zinc-500" />}
                      <span>{isOnline ? 'Google Meet / Zoom' : 'Forge Innovation Lab'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 w-full md:w-auto">
                  <button className="w-full md:w-auto px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2">
                    View Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
