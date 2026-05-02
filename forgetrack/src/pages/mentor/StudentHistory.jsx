import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, ChevronRight, User } from 'lucide-react';

export default function StudentHistory() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('usn');
      
      if (!error && data) {
        // Mocking some attendance data for display purposes
        const enrichedData = data.map(student => ({
          ...student,
          attendancePercentage: Math.floor(Math.random() * 30) + 70, // 70-100%
          sessionsAttended: Math.floor(Math.random() * 10) + 10,
        }));
        setStudents(enrichedData);
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.usn.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-text-secondary">Loading student history...</div>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Student History</h1>
          <p className="text-text-secondary font-medium">Review student performance and attendance records.</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6 border-b border-border-subtle bg-surface/40 backdrop-blur-md flex flex-col sm:flex-row gap-5 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or USN..." 
              className="input pl-11 bg-surface-inset border-border-subtle focus:bg-surface transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="px-4 py-2 bg-surface-raised rounded-xl border border-border-subtle text-sm font-bold text-text-primary">
            {filteredStudents.length} Students
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-text-tertiary text-xs uppercase tracking-wider bg-surface-raised/30">
                <th className="py-5 px-6 font-semibold">Student Details</th>
                <th className="py-5 px-6 font-semibold">Branch</th>
                <th className="py-5 px-6 font-semibold">Attendance</th>
                <th className="py-5 px-6 font-semibold">Sessions</th>
                <th className="py-5 px-6 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-text-secondary">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-surface-raised/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-inset border border-border-subtle flex items-center justify-center text-accent-glow font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary">{student.name}</p>
                          <p className="text-xs text-text-tertiary font-mono">{student.usn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text-secondary font-medium">
                      {student.branch_code}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-full max-w-[100px] h-2 bg-surface-inset rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${student.attendancePercentage >= 85 ? 'bg-success-fg' : student.attendancePercentage >= 75 ? 'bg-warning' : 'bg-danger-fg'}`}
                            style={{ width: `${student.attendancePercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-text-primary">{student.attendancePercentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text-secondary text-sm font-medium">
                      {student.sessionsAttended} / 20
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-text-tertiary hover:text-accent-glow p-2 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
