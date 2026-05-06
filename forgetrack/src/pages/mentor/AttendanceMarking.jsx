import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Search, Filter } from 'lucide-react';

export default function AttendanceMarking() {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    async function loadData() {
      const [studentRes, sessionRes] = await Promise.all([
        supabase.from('students').select('*').order('usn'),
        supabase.from('sessions').select('*').order('date', { ascending: false })
      ]);

      if (studentRes.data) setStudents(studentRes.data);
      if (sessionRes.data) {
        setSessions(sessionRes.data);
        if (sessionRes.data.length > 0) setSelectedSession(sessionRes.data[0].id.toString());
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
              className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-md py-2 pl-10 pr-4 text-sm font-medium text-white focus:outline-none focus:border-amethyst transition-colors appearance-none"
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
                <div key={student.id} className="flex items-center justify-between p-4 px-6 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#27272a] text-white font-medium border border-zinc-700 flex items-center justify-center text-sm shadow-sm">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{student.name}</p>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="bg-[#0a0a0b] border border-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-md font-mono">{student.usn}</span>
                        <span className="text-xs font-medium text-zinc-500">{student.branch_code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => toggleAttendance(student.id, 'present')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        status === 'present' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                          : 'border border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400'
                      }`}
                      title="Mark Present"
                    >
                      <Check size={16} strokeWidth={status === 'present' ? 3 : 2} />
                    </button>
                    <button 
                      onClick={() => toggleAttendance(student.id, 'absent')}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        status === 'absent' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                          : 'border border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400'
                      }`}
                      title="Mark Absent"
                    >
                      <X size={16} strokeWidth={status === 'absent' ? 3 : 2} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
