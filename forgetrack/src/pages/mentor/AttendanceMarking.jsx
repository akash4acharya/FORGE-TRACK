import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const themeMap = {
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-400', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]', rowBg: 'bg-cyan-950/20' },
  fuchsia: { bg: 'bg-fuchsia-500', text: 'text-fuchsia-400', border: 'border-fuchsia-400', shadow: 'shadow-[0_0_15px_rgba(217,70,239,0.5)]', rowBg: 'bg-fuchsia-950/20' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-400', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]', rowBg: 'bg-amber-950/20' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-400', shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.5)]', rowBg: 'bg-indigo-950/20' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]', rowBg: 'bg-emerald-950/20' }
};

export default function AttendanceMarking() {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState({});
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [studentRes, sessionRes] = await Promise.all([
        supabase.from('students').select('*').order('usn'),
        supabase.from('sessions').select('*').order('date', { ascending: false })
      ]);

      if (studentRes.data) setStudents(studentRes.data);
      if (sessionRes.data) {
        const themesKeys = Object.keys(themeMap);
        const themedSessions = sessionRes.data.map((s, i) => ({
          ...s,
          theme: themesKeys[i % themesKeys.length]
        }));
        setSessions(themedSessions);
        if (themedSessions.length > 0) setSelectedSession(themedSessions[0].id.toString());
      }
    }
    loadData();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.usn.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAttendance = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status
    }));
  };

  const markedCount = Object.values(attendance).filter(status => status !== null).length;
  const totalStudents = students.length;
  const progressPercentage = totalStudents > 0 ? (markedCount / totalStudents) * 100 : 0;

  const activeSession = sessions.find(s => s.id.toString() === selectedSession) || sessions[0];
  const activeTheme = activeSession ? themeMap[activeSession.theme] : themeMap.emerald;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Mark Attendance</h1>
          <p className="text-gray-400 font-medium text-sm">Select a session and record student presence manually.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <select 
              className={`w-full bg-[#0a0a0b] border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-amethyst transition-colors appearance-none ${activeTheme?.text || 'text-white'}`}
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.topic} ({new Date(s.date).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
          <button className="bg-amethyst hover:bg-[#c084fc] text-white px-6 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm whitespace-nowrap">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-[#151517] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row gap-5 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search students by name or USN..." 
              className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-amethyst rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-colors outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-[#0a0a0b] border border-zinc-800 text-zinc-300 rounded-full px-4 py-1 text-sm font-medium">
            {filteredStudents.length} Students Listed
          </div>
        </div>

        <div className="px-6 py-4 border-b border-zinc-800 bg-[#151517] sticky top-0 z-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Session Completion</span>
            <span className="text-xs font-bold text-white">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full ${activeTheme?.bg || 'bg-emerald-500'} transition-all duration-500 ease-out`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-zinc-800 max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredStudents.length === 0 ? (
            <div className="p-20 text-center">
              <div className="text-gray-600 mb-2 flex justify-center"><Search size={32} /></div>
              <div className="text-gray-400 font-medium text-sm">No students match your search</div>
            </div>
          ) : (
            filteredStudents.map((student, i) => {
              const status = attendance[student.id];
              return (
                <div 
                  key={student.id} 
                  className={`flex flex-col p-4 px-6 transition-colors duration-300 relative ${
                    status === 'present' ? (activeTheme?.rowBg || 'bg-emerald-950/20') : 
                    status === 'absent' ? 'bg-rose-950/20' : 
                    'hover:bg-white/[0.02]'
                  }`}
                >
                  {status === 'present' && <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeTheme?.bg || 'bg-emerald-500'}`} />}
                  {status === 'absent' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />}
                  
                  <div className="flex items-center justify-between w-full">
                    <div 
                      className="flex items-center gap-4 cursor-pointer flex-1 group"
                      onClick={() => setExpandedStudentId(expandedStudentId === student.id ? null : student.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#27272a] text-white font-medium border border-zinc-700 flex items-center justify-center text-sm shadow-sm group-hover:bg-[#3f3f46] transition-colors">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold transition-colors duration-300 ${status === 'absent' ? 'text-zinc-400' : 'text-white'}`}>{student.name}</p>
                          {expandedStudentId === student.id ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </div>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="bg-[#0a0a0b] border border-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-md font-mono">{student.usn}</span>
                          <span className="text-xs font-medium text-zinc-500">{student.branch_code}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                    <button 
                      onClick={() => toggleAttendance(student.id, 'present')}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ease-out active:scale-90 ${
                        status === 'present' 
                          ? `${activeTheme?.bg || 'bg-emerald-500'} ${activeTheme?.border || 'border-emerald-400'} text-white ${activeTheme?.shadow || 'shadow-[0_0_15px_rgba(16,185,129,0.5)]'}` 
                          : 'bg-[#151517] border-zinc-700 text-zinc-500 hover:-translate-y-0.5 hover:border-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Mark Present"
                    >
                      <Check size={18} strokeWidth={status === 'present' ? 3 : 2} />
                    </button>
                    <button 
                      onClick={() => toggleAttendance(student.id, 'absent')}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ease-out active:scale-90 ${
                        status === 'absent' 
                          ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
                          : 'bg-[#151517] border-zinc-700 text-zinc-500 hover:-translate-y-0.5 hover:border-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Mark Absent"
                    >
                      <X size={18} strokeWidth={status === 'absent' ? 3 : 2} />
                    </button>
                  </div>
                  </div>

                  {expandedStudentId === student.id && (
                    <div className="mt-4 p-4 bg-[#0a0a0b] rounded-lg border border-zinc-800 animate-fade-in text-sm text-zinc-400 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 ml-14">
                      <div><span className="font-medium text-zinc-500 block mb-1">Email</span> <span className="text-zinc-300">{student.email || 'Not provided'}</span></div>
                      <div><span className="font-medium text-zinc-500 block mb-1">Admission Number</span> <span className="text-zinc-300">{student.admission_number || 'Not provided'}</span></div>
                      <div><span className="font-medium text-zinc-500 block mb-1">Batch</span> <span className="text-zinc-300">{student.batch || '2024-2028'}</span></div>
                      <div><span className="font-medium text-zinc-500 block mb-1">Status</span> <span className={student.is_active !== false ? "text-emerald-400" : "text-rose-400"}>{student.is_active !== false ? 'Active' : 'Inactive'}</span></div>
                      <div><span className="font-medium text-zinc-500 block mb-1">Enrolled</span> <span className="text-zinc-300">{student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}</span></div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
