import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Search, Filter, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AttendanceMarking() {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [search, setSearch] = useState('');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    async function loadAttendance() {
      if (!selectedSession) return;
      const { data } = await supabase.from('attendance').select('student_id, present').eq('session_id', selectedSession);
      if (data) {
        const map = {};
        data.forEach(r => map[r.student_id] = r.present);
        setAttendanceMap(map);
      }
    }
    loadAttendance();
  }, [selectedSession]);

  const handleSave = async () => {
    if (!selectedSession) return;
    setIsSaving(true);
    const inserts = Object.keys(attendanceMap).map(studentId => ({
      session_id: selectedSession,
      student_id: studentId,
      present: attendanceMap[studentId],
      marked_by: 'manual'
    }));

    if (inserts.length > 0) {
      const { error } = await supabase.from('attendance').upsert(inserts, { onConflict: 'student_id,session_id' });
      if (error) {
        toast.error('Failed to save attendance');
      } else {
        toast.success('Attendance saved successfully!', { icon: '✅' });
      }
    } else {
      toast('No changes to save.');
    }
    setIsSaving(false);
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.usn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Mark Attendance</h1>
          <p className="text-text-secondary font-medium">Select a session and record student presence manually.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
            <select
              className="input pl-10 border-none bg-surface-raised font-semibold"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.topic} ({new Date(s.date).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary whitespace-nowrap px-6 disabled:opacity-50 transition-opacity">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="card border-none shadow-xl p-16 flex flex-col items-center justify-center text-center bg-darkbase border border-zinc-800">
          <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
            <Users size={40} className="text-zinc-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Students Found</h2>
          <p className="text-zinc-500 max-w-md mx-auto mb-8">Your database is completely empty. You need to upload your student roster and attendance history before you can mark new sessions.</p>
          <button onClick={() => navigate('/upload')} className="bg-gradient-to-r from-[#a855f7] to-[#c084fc] hover:opacity-90 text-white font-semibold py-3 px-8 rounded-full transition-all shadow-lg shadow-amethyst/20">
            Go to CSV Upload
          </button>
        </div>
      ) : (

      <div className="card p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6 border-b border-border-subtle bg-surface/40 backdrop-blur-md flex flex-col sm:flex-row gap-5 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type="text"
              placeholder="Search students by name or USN..."
              className="input pl-11 bg-surface-inset border-border-subtle focus:bg-surface transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="px-4 py-2 bg-surface-raised rounded-xl border border-border-subtle text-sm font-bold text-text-primary">
            {filteredStudents.length} Students Listed
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-border-subtle max-h-[600px] overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-20 text-center">
              <div className="text-text-tertiary mb-2"><Search size={48} className="mx-auto opacity-20" /></div>
              <div className="text-text-secondary font-medium text-lg">No students match your search</div>
            </div>
          ) : (
            filteredStudents.map((student, i) => (
              <div key={student.id} className="flex items-center justify-between p-6 hover:bg-surface-raised/40 transition-all group animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-surface-raised to-surface border border-border-subtle flex items-center justify-center font-bold text-accent-glow text-xl shadow-lg group-hover:scale-110 transition-transform">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-text-primary group-hover:text-accent-glow transition-colors">{student.name}</p>
                    <div className="flex gap-3 items-center mt-1.5">
                      <span className="text-xs font-bold font-mono text-text-tertiary bg-surface-inset px-2.5 py-1 rounded-lg border border-border-subtle">{student.usn}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border-strong opacity-30"></span>
                      <span className="text-sm text-text-secondary font-semibold">{student.branch_code}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setAttendanceMap(prev => ({ ...prev, [student.id]: true }))}
                    className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all shadow-lg active:scale-90 ${attendanceMap[student.id] === true ? 'border-success-fg bg-success-fg text-white' : 'border-success-border bg-success-bg text-success-fg hover:bg-success-fg hover:text-white'}`} 
                    title="Mark Present"
                  >
                    <Check size={22} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => setAttendanceMap(prev => ({ ...prev, [student.id]: false }))}
                    className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all shadow-lg active:scale-90 ${attendanceMap[student.id] === false ? 'border-danger-fg bg-danger-fg text-white' : 'border-danger-border bg-danger-bg text-danger-fg hover:bg-danger-fg hover:text-white'}`} 
                    title="Mark Absent"
                  >
                    <X size={22} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      )}
    </div>
  );
}
