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
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading student history...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Student History</h1>
          <p className="text-gray-400 font-medium text-sm">Review student performance and attendance records.</p>
        </div>
      </div>

      <div className="bg-[#151517] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row gap-5 items-center justify-between">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or USN..." 
              className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-amethyst rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-colors outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-[#0a0a0b] border border-zinc-800 text-zinc-300 rounded-full px-4 py-1 text-sm font-medium">
            {filteredStudents.length} Students
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6 pb-3 border-b border-zinc-800">Student Details</th>
                <th className="py-4 px-6 pb-3 border-b border-zinc-800">Branch</th>
                <th className="py-4 px-6 pb-3 border-b border-zinc-800">Attendance</th>
                <th className="py-4 px-6 pb-3 border-b border-zinc-800">Sessions</th>
                <th className="py-4 px-6 pb-3 border-b border-zinc-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 text-sm">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-zinc-800/20 transition-colors cursor-pointer border-b border-zinc-800/60 last:border-b-0">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#27272a] border border-zinc-700 flex items-center justify-center text-white font-medium shadow-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{student.name}</p>
                          <p className="text-xs text-zinc-500 font-mono mt-0.5">{student.usn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 font-medium text-sm">
                      {student.branch_code}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-full max-w-[100px] h-1.5 bg-[#0a0a0b] border border-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${student.attendancePercentage >= 85 ? 'bg-emerald-500' : student.attendancePercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${student.attendancePercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-white">{student.attendancePercentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 text-sm font-medium">
                      {student.sessionsAttended} / 20
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-zinc-600 group-hover:text-white transition-colors p-1">
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
