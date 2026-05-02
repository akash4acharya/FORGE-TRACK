import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Calendar, BookOpen, Activity, TrendingUp, ChevronRight, TrendingDown, Clock, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Mon', current: 4000, previous: 2400 },
  { name: 'Tue', current: 3000, previous: 1398 },
  { name: 'Wed', current: 2000, previous: 9800 },
  { name: 'Thu', current: 2780, previous: 3908 },
  { name: 'Fri', current: 1890, previous: 4800 },
  { name: 'Sat', current: 2390, previous: 3800 },
  { name: 'Sun', current: 3490, previous: 4300 },
];

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

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Purple Gradient Card */}
        <div className="bg-gradient-to-br from-amethyst to-purple-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/80 font-medium text-sm">Total Sessions</span>
              <BookOpen size={20} className="text-white/80" />
            </div>
            <div className="flex items-end gap-4">
              <h3 className="text-4xl font-bold">{totalSessions}</h3>
              <div className="flex items-center gap-1 text-sm font-medium bg-white/20 px-2 py-1 rounded-md mb-1">
                <ArrowUpRight size={16} />
                <span>12.5%</span>
              </div>
            </div>
            <p className="text-white/60 text-xs mt-4">Compared to last month</p>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Standard Dark Cards */}
        <div className="bg-darkcard border border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium text-sm">Enrolled Students</span>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <h3 className="text-3xl font-bold text-white">25</h3>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md mb-1">
              <ArrowUpRight size={16} />
              <span>4.2%</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4">Active this semester</p>
        </div>

        <div className="bg-darkcard border border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium text-sm">Avg. Attendance</span>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
              <Activity size={16} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <h3 className="text-3xl font-bold text-white">92%</h3>
            <div className="flex items-center gap-1 text-sm font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-md mb-1">
              <ArrowDownRight size={16} />
              <span>1.1%</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4">Across all active phases</p>
        </div>

        <div className="bg-darkcard border border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 font-medium text-sm">Active Days</span>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-300">
              <Calendar size={16} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <h3 className="text-3xl font-bold text-white">15</h3>
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md mb-1">
              <ArrowUpRight size={16} />
              <span>8.4%</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4">Days with logged activities</p>
        </div>
      </div>

      {/* Analytics & Mentee Progress Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area */}
        <div className="bg-darkcard border border-white/5 rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Session Activity Analytics</h2>
            <select className="bg-darkbase border border-white/10 text-gray-300 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-amethyst">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151517', borderColor: '#ffffff1a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="previous" stroke="#475569" strokeWidth={2} fill="transparent" />
                <Area type="monotone" dataKey="current" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress List Area */}
        <div className="bg-darkcard border border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Mentee Progress by Phase</h2>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 font-medium">Phase 1: Onboarding</span>
                <span className="text-white font-bold">85%</span>
              </div>
              <div className="w-full bg-darkbase rounded-full h-2">
                <div className="bg-amethyst h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 font-medium">Phase 2: Core Skills</span>
                <span className="text-white font-bold">62%</span>
              </div>
              <div className="w-full bg-darkbase rounded-full h-2">
                <div className="bg-amethyst h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 font-medium">Phase 3: Advanced Training</span>
                <span className="text-white font-bold">40%</span>
              </div>
              <div className="w-full bg-darkbase rounded-full h-2">
                <div className="bg-amethyst h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 font-medium">Phase 4: Capstone</span>
                <span className="text-white font-bold">15%</span>
              </div>
              <div className="w-full bg-darkbase rounded-full h-2">
                <div className="bg-amethyst h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            
             <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300 font-medium">Phase 5: Graduation</span>
                <span className="text-white font-bold">5%</span>
              </div>
              <div className="w-full bg-darkbase rounded-full h-2">
                <div className="bg-amethyst h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Transaction History Table (Student Sessions) */}
      <div className="bg-darkcard border border-white/5 rounded-xl p-0 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Student Sessions</h2>
          <button className="text-amethyst hover:text-white transition-colors text-sm font-medium">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider bg-white/[0.02]">
                <th className="py-4 px-6 font-medium">Student</th>
                <th className="py-4 px-6 font-medium">Session Topic</th>
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sessions.slice(0, 5).map((session, i) => (
                <tr key={session.id || i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-darkbase border border-white/10 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=Student+${i + 1}&background=random`} alt="Student" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Student {i + 1}</p>
                        <p className="text-gray-500 text-xs">student{i + 1}@forge.local</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-300 text-sm font-medium">{session.topic || 'General Check-in'}</p>
                    <p className="text-gray-500 text-xs">{session.session_type}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <Clock size={14} />
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {i % 3 === 0 ? (
                      <span className="px-2.5 py-1 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded-md text-xs font-medium">Success</span>
                    ) : i % 3 === 1 ? (
                      <span className="px-2.5 py-1 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 rounded-md text-xs font-medium">Processing</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-red-400/10 text-red-400 border border-red-400/20 rounded-md text-xs font-medium">Declined</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && [1, 2, 3].map(i => (
                 <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-darkbase border border-white/10 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        <img src={`https://ui-avatars.com/api/?name=Student+${i}&background=random`} alt="Student" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Student {i}</p>
                        <p className="text-gray-500 text-xs">student{i}@forge.local</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-gray-300 text-sm font-medium">Orientation Session</p>
                    <p className="text-gray-500 text-xs">Offline</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                      <Clock size={14} />
                      Oct {10 + i}, 2023
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 rounded-md text-xs font-medium">Success</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5">
                      <MoreHorizontal size={18} />
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
