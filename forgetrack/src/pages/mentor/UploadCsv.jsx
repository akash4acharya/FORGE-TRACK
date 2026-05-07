import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { openRouter } from '../../lib/gemini';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload as UploadIcon, FileText, CheckCircle, AlertTriangle, XCircle, RefreshCw, Save, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';

export default function UploadCsv() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState({ headers: [], rows: [] });
  const [mapping, setMapping] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importHistory, setImportHistory] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchImportHistory = async () => {
    const { data } = await supabase.from('import_log').select('*').order('uploaded_at', { ascending: false });
    if (data) setImportHistory(data);
  };

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const isCsv = uploadedFile.name.endsWith('.csv');
    const isXlsx = uploadedFile.name.endsWith('.xlsx');

    if (isCsv) {
      Papa.parse(uploadedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length > 0) {
            setRawData({
              headers: Object.keys(results.data[0]),
              rows: results.data
            });
          }
        }
      });
    } else if (isXlsx) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (data.length > 0) {
          const headers = data[0];
          const rows = data.slice(1).map(rowArray => {
            const rowObj = {};
            headers.forEach((h, i) => { rowObj[h] = rowArray[i]; });
            return rowObj;
          });
          setRawData({ headers, rows });
        }
      };
      reader.readAsBinaryString(uploadedFile);
    }
  };

  const callAgentForMapping = async () => {
    setIsProcessing(true);
    try {
      const systemPrompt = `You are an AI that maps column headers from student attendance CSV/Excel files into a normalized database schema.
Allowed target fields: "student_name", "usn", "admission_number", "email", "branch_code", "date", "session_topic", "attendance_status", "IGNORE".
Output strictly JSON matching this schema:
{
  "mapping": { "<source_column>": "<target_field>" },
  "date_format": "DD/M/YY" | "DD/MM/YYYY" | "YYYY-MM-DD" | "D-MMM" | "OTHER",
  "attendance_convention": "TRUE/FALSE" | "P/A" | "Present/Absent" | "1/0" | "Y/N",
  "is_pivoted": boolean,
  "date_columns": ["col1", "col2"] // only if is_pivoted
}`;
      const userPrompt = JSON.stringify({
        headers: rawData.headers,
        sample_rows: rawData.rows.slice(0, 5)
      });

      const response = await openRouter.chat.completions.create({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0
      });

      let resultText = response.choices[0].message.content;
      if (resultText.startsWith('```json')) {
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '');
      }

      const result = JSON.parse(resultText);
      
      const completeMapping = { ...result };
      if (!completeMapping.mapping) completeMapping.mapping = {};
      rawData.headers.forEach(h => {
        if (!completeMapping.mapping[h]) completeMapping.mapping[h] = 'IGNORE';
      });

      setMapping(completeMapping);
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("AI mapping failed, please map columns manually.");
      setMapping({
        mapping: rawData.headers.reduce((acc, h) => ({ ...acc, [h]: 'IGNORE' }), {}),
        date_format: "YYYY-MM-DD",
        attendance_convention: "Present/Absent",
        is_pivoted: false,
        date_columns: []
      });
      setStep(2);
    }
    setIsProcessing(false);
  };

  const generateCandidates = () => {
    const cands = [];
    rawData.rows.forEach((row, i) => {
      if (mapping.is_pivoted) {
        mapping.date_columns.forEach(dc => {
          if (row[dc] !== undefined && row[dc] !== null && String(row[dc]).trim() !== "") {
            cands.push({
              source_row: i,
              student_name: row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'student_name')] || '',
              usn: row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'usn')] || '',
              branch_code: row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'branch_code')] || '',
              date_str: dc,
              status_str: String(row[dc]),
              status: 'clean',
              reason: ''
            });
          }
        });
      } else {
        const dateKey = Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'date');
        const statusKey = Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'attendance_status');
        
        if (dateKey && statusKey && row[dateKey] && String(row[statusKey]).trim() !== "") {
          cands.push({
            source_row: i,
            student_name: row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'student_name')] || '',
            usn: row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'usn')] || '',
            branch_code: row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'branch_code')] || '',
            date_str: row[dateKey],
            status_str: String(row[statusKey]),
            status: 'clean',
            reason: ''
          });
        }
      }
    });

    cands.forEach(c => {
      if (!c.student_name || !c.usn) {
        c.status = 'error'; c.reason = 'Missing name or USN';
      } else if (!c.date_str) {
        c.status = 'error'; c.reason = 'Missing date';
      } else {
        const parsedDate = new Date(c.date_str);
        if (isNaN(parsedDate)) {
           c.status = 'error'; c.reason = 'Invalid date format';
        }
      }
    });

    setCandidates(cands);
    setStep(3);
  };

  const handleImport = async () => {
    if (!window.confirm("You are importing existing attendance. Proceed?")) return;
    
    setIsProcessing(true);
    try {
      const { data: logData, error: logError } = await supabase.from('import_log').insert([{
        filename: file.name,
        uploaded_by: 'Mentor', 
        status: 'in_progress',
        total_rows: candidates.length,
        imported_rows: 0,
        skipped_rows: 0,
        column_mapping: JSON.stringify(mapping)
      }]).select('*').single();

      if (logError) throw logError;

      const cleanCands = candidates.filter(c => c.status === 'clean');

      const uniqueDates = [...new Set(cleanCands.map(c => new Date(c.date_str).toISOString().split('T')[0]))];
      
      for (let d of uniqueDates) {
        const dObj = new Date(d);
        await supabase.from('sessions').upsert({
          date: d,
          topic: 'Imported Session',
          month_number: dObj.getMonth() + 1,
          duration_hours: 2.0
        }, { onConflict: 'date' });
      }

      const { data: allSessions } = await supabase.from('sessions').select('id, date');
      const sessionMap = {};
      if (allSessions) {
        allSessions.forEach(s => sessionMap[s.date] = s.id);
      }

      const uniqueStudents = [];
      const usnSet = new Set();
      for (let c of cleanCands) {
        if (!usnSet.has(c.usn)) {
          usnSet.add(c.usn);
          uniqueStudents.push({
            usn: c.usn,
            name: c.student_name,
            branch_code: c.branch_code || 'CS'
          });
        }
      }

      if (uniqueStudents.length > 0) {
        await supabase.from('students').upsert(uniqueStudents, { onConflict: 'usn' });
      }
      
      const { data: allStudents } = await supabase.from('students').select('id, usn');
      const studentMap = {};
      if (allStudents) {
        allStudents.forEach(s => studentMap[s.usn] = s.id);
      }

      const attendanceInserts = [];
      for (let c of cleanCands) {
        const dStr = new Date(c.date_str).toISOString().split('T')[0];
        const sessionId = sessionMap[dStr];
        const studentId = studentMap[c.usn];
        
        let present = false;
        const val = c.status_str.toLowerCase();
        if (['true', 'p', 'present', '1', 'y', 'yes'].includes(val)) present = true;

        if (sessionId && studentId) {
          attendanceInserts.push({
            student_id: studentId,
            session_id: sessionId,
            present: present,
            marked_by: 'csv_import',
            import_id: logData.id
          });
        }
      }

      for (let i = 0; i < attendanceInserts.length; i += 50) {
        const batch = attendanceInserts.slice(i, i + 50);
        await supabase.from('attendance').upsert(batch, { onConflict: 'student_id,session_id' });
      }

      await supabase.from('import_log').update({
        status: 'completed',
        imported_rows: cleanCands.length,
        skipped_rows: candidates.filter(c => c.status !== 'clean').length
      }).eq('id', logData.id);

      alert("Import completed successfully!");
      setStep(1);
      setFile(null);
      setRawData({ headers: [], rows: [] });
      fetchImportHistory();
    } catch (e) {
      console.error(e);
      alert("Import failed.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">CSV Upload Agent</h1>
        <p className="text-gray-400 font-medium text-sm">Upload Google Forms/Sheets exports and let AI map columns automatically.</p>
      </div>

      <div className="bg-[#151517] border border-zinc-800 rounded-xl p-6 shadow-sm">
        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-xl hover:border-amethyst transition-colors group">
            <UploadIcon className="text-zinc-600 mb-4 group-hover:text-amethyst" size={48} />
            <p className="text-white font-medium mb-2">Drag & drop your CSV or Excel file</p>
            <p className="text-zinc-500 text-sm mb-6">Supported formats: .csv, .xlsx (Max 5MB)</p>
            <label className="bg-amethyst hover:bg-[#c084fc] text-white px-6 py-2 rounded-md cursor-pointer font-medium transition-colors shadow-sm">
              Browse Files
              <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileUpload} />
            </label>
            {file && (
              <div className="mt-6 text-left w-full max-w-md bg-darkbase p-4 rounded-md border border-zinc-800">
                <div className="flex items-center gap-3">
                  <FileText className="text-amethyst" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-white text-sm font-medium truncate">{file.name}</p>
                    <p className="text-zinc-500 text-xs">{(file.size / 1024).toFixed(1)} KB • {rawData.rows.length} rows</p>
                  </div>
                  <button 
                    onClick={callAgentForMapping} 
                    disabled={isProcessing}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm disabled:opacity-50 flex items-center gap-1"
                  >
                    {isProcessing ? 'Thinking...' : 'Next'}
                    {!isProcessing && <ArrowRight size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && mapping && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">AI Column Mapping</h2>
              <div className="flex gap-2">
                <span className="bg-zinc-800 text-xs px-2 py-1 rounded-md text-zinc-300">Format: {mapping.date_format}</span>
                <span className="bg-zinc-800 text-xs px-2 py-1 rounded-md text-zinc-300">Pivoted: {mapping.is_pivoted ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            <div className="bg-darkbase rounded-md border border-zinc-800 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-400">CSV Column</th>
                    <th className="px-4 py-3 font-medium text-zinc-400">Maps To</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(mapping.mapping).map(([source, target]) => (
                    <tr key={source} className="border-b border-zinc-800/50 hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{source}</td>
                      <td className="px-4 py-3">
                        <select 
                          className="bg-darkbase border border-zinc-700 text-white rounded-md px-2 py-1 outline-none focus:border-amethyst"
                          value={target}
                          onChange={(e) => setMapping({...mapping, mapping: {...mapping.mapping, [source]: e.target.value}})}
                        >
                          {['student_name', 'usn', 'admission_number', 'email', 'branch_code', 'date', 'session_topic', 'attendance_status', 'IGNORE'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-2 border border-zinc-700 text-white rounded-md hover:bg-zinc-800 transition-colors">Back</button>
              <button onClick={generateCandidates} className="px-4 py-2 bg-amethyst hover:bg-[#c084fc] text-white rounded-md transition-colors shadow-sm">Generate Preview</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Data Preview</h2>
              <div className="flex gap-4 text-sm">
                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={16}/> {candidates.filter(c => c.status === 'clean').length} Ready</span>
                <span className="text-red-400 flex items-center gap-1"><XCircle size={16}/> {candidates.filter(c => c.status === 'error').length} Errors</span>
              </div>
            </div>

            <div className="bg-darkbase rounded-md border border-zinc-800 overflow-hidden max-h-96 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/50 border-b border-zinc-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium text-zinc-400">Student</th>
                    <th className="px-4 py-3 font-medium text-zinc-400">USN</th>
                    <th className="px-4 py-3 font-medium text-zinc-400">Date</th>
                    <th className="px-4 py-3 font-medium text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, idx) => (
                    <tr key={idx} className={`border-b border-zinc-800/50 ${c.status === 'error' ? 'bg-red-500/10 border-l-4 border-l-red-500' : 'hover:bg-white/5 border-l-4 border-l-emerald-500'}`}>
                      <td className="px-4 py-2 text-white">
                        {c.student_name || <span className="text-red-400 italic">Missing</span>}
                        {c.status === 'error' && <div className="text-xs text-red-400 mt-1">{c.reason}</div>}
                      </td>
                      <td className="px-4 py-2 text-zinc-300">{c.usn}</td>
                      <td className="px-4 py-2 text-zinc-300">{c.date_str}</td>
                      <td className="px-4 py-2 text-zinc-300">
                        <span className={`px-2 py-1 rounded text-xs ${['true', 'p', 'present', '1', 'y', 'yes'].includes(c.status_str.toLowerCase()) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {c.status_str}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setStep(2)} className="px-4 py-2 border border-zinc-700 text-white rounded-md hover:bg-zinc-800 transition-colors">Back</button>
              <button onClick={handleImport} disabled={isProcessing || candidates.filter(c=>c.status==='error').length > 0} className="px-4 py-2 bg-amethyst hover:bg-[#c084fc] text-white rounded-md flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm">
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                Import Data
              </button>
            </div>
          </div>
        )}
      </div>

      {step === 1 && importHistory.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-semibold text-white mb-4">Past Imports</h2>
          <div className="bg-[#151517] border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800/50 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3 font-medium text-zinc-400">File Name</th>
                  <th className="px-6 py-3 font-medium text-zinc-400">Date</th>
                  <th className="px-6 py-3 font-medium text-zinc-400">Status</th>
                  <th className="px-6 py-3 font-medium text-zinc-400 text-right">Rows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {importHistory.map(log => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    >
                      <td className="px-6 py-4 text-white font-medium flex items-center gap-2">
                        {expandedLogId === log.id ? <ChevronDown size={16} className="text-zinc-500" /> : <ChevronRight size={16} className="text-zinc-500" />}
                        <FileText size={16} className="text-zinc-500" />
                        {log.filename}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {new Date(log.uploaded_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${log.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : log.status === 'partial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {log.status === 'completed' ? <CheckCircle size={12} /> : log.status === 'partial' ? <AlertTriangle size={12} /> : <XCircle size={12} />}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-400">
                        {log.imported_rows}/{log.total_rows}
                      </td>
                    </tr>
                    {expandedLogId === log.id && (
                      <tr className="bg-zinc-900/50">
                        <td colSpan={4} className="p-6">
                          <div className="bg-darkbase border border-zinc-800 p-4 rounded-lg">
                            <h4 className="text-white font-semibold mb-2">Column Mapping</h4>
                            <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">
                              {log.column_mapping || "No mapping available"}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
