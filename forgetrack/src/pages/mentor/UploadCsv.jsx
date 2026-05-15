import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { callGeminiAgent } from '../../services/aiUpload';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload as UploadIcon, FileText, CheckCircle, AlertTriangle, XCircle, RefreshCw, Save, ChevronDown, ChevronRight, ArrowRight, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';

const normalizeAttendance = (val) => {
  if (val === undefined || val === null) return false;
  const strVal = String(val).trim().toLowerCase();
  if (['p', 'present', 'yes', 'y', '1', 'true', 't'].includes(strVal)) return true;
  return false;
};

export default function UploadCsv() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [rawData, setRawData] = useState({ headers: [], rows: [] });
  const [mapping, setMapping] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importHistory, setImportHistory] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);
  
  // Missing data inference state
  const [missingDaysInput, setMissingDaysInput] = useState('');
  
  // Conflict state
  const [conflictingDates, setConflictingDates] = useState([]);

  // AI Model selector state — verified against OpenRouter API 2026-05-14
  const AI_MODELS = [
    { id: 'google-direct/gemini-2.5-flash', label: '⭐ Gemini 2.5 Flash (Direct)' },
    { id: 'google-direct/gemini-2.0-flash', label: '⭐ Gemini 2.0 Flash (Direct)' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B' },
    { id: 'deepseek/deepseek-v4-flash:free', label: 'DeepSeek V4 Flash' },
    { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B' },
    { id: 'qwen/qwen3-coder:free', label: 'Qwen 3 Coder' },
  ];
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);

  const loadHistory = async () => {
    const { data } = await supabase.from('import_log').select('*').order('uploaded_at', { ascending: false });
    return data;
  };

  const fetchImportHistory = () => {
    loadHistory().then(data => {
      if (data) setImportHistory(data);
    });
  };

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const testScenarios = [
    { name: 'Test 1 (Perfect)', headers: ['Name', 'Date', 'Topic', 'Attendance'], rows: [['John Doe', '2025-08-04', 'Intro', 'Present']] },
    { name: 'Test 2 (Messy)', headers: ['Student_ID_Num', 'Class_Name_Final', 'Session_Time', 'Is_Here'], rows: [['1RN21CS001', 'CS101', '10:00 AM', '1']] },
    { name: 'Test 3 (Missing)', headers: ['Candidate', 'Topic', 'Present'], rows: [['Jane Doe', 'Data Eng', 'Y']] },
    { name: 'Test 4 (Pivoted)', headers: ['USN', 'Name', 'Day 1', 'Day 2'], rows: [['1RN21CS001', 'John Doe', 'Present', 'Absent']] },
    { name: 'Test 5 (Garbage)', headers: ['Milk', 'Eggs', 'Bread', 'Butter'], rows: [['1 gallon', '12', '1 loaf', '1 stick']] }
  ];

  const handleRunDiagnostics = async () => {
    console.log("Starting AI Diagnostics...");
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(`\n--- Running ${scenario.name} ---`);
      try {
        const result = await callGeminiAgent(scenario.headers, scenario.rows, "", selectedModel);
        console.log(`TEST ${i + 1} RESULT:`, result);
      } catch (error) {
        console.error(`TEST ${i + 1} FAILED:`, error.message);
      }
    }
    console.log("\nDiagnostics Complete!");
  };

  const processDataArray = (data) => {
    let headerIndex = -1;
    for (let i = 0; i < data.length; i++) {
      const rowStr = (data[i] || []).join(' ').toLowerCase();
      if (rowStr.includes('usn') || rowStr.includes('name') || rowStr.includes('email') || rowStr.includes('sl no')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      for (let i = 0; i < data.length; i++) {
        const nonEmpties = (data[i] || []).filter(cell => cell !== undefined && cell !== null && String(cell).trim() !== '');
        if (nonEmpties.length >= 3) {
          headerIndex = i;
          break;
        }
      }
    }

    if (headerIndex === -1 || !data[headerIndex]) {
      toast.error('Could not find valid headers in the file/sheet.');
      return;
    }

    const rawHeaders = data[headerIndex];
    const parentHeaders = headerIndex > 0 ? data[headerIndex - 1] : [];
    
    let currentParent = '';
    const headers = rawHeaders.map((h, i) => {
      if (parentHeaders && parentHeaders[i] && String(parentHeaders[i]).trim() !== '') {
        currentParent = String(parentHeaders[i]).trim();
      }
      
      let colName = h ? String(h).trim() : `Column_${i}`;
      
      if (currentParent && (colName.toLowerCase() === 'attendance' || colName.toLowerCase().includes('knowledge') || colName.toLowerCase().includes('skill'))) {
        colName = `${currentParent} - ${colName}`;
      }
      return colName;
    });

    const rows = data.slice(headerIndex + 1).map(rowArray => {
      const rowObj = {};
      headers.forEach((h, i) => { rowObj[h] = rowArray[i]; });
      return rowObj;
    });
    setRawData({ headers, rows });
    setStep(1); // Ready to proceed to mapping
  };

  const handleFileUpload = (e) => {
    let uploadedFile;
    if (e.target && e.target.files) {
      uploadedFile = e.target.files[0];
    } else if (e.dataTransfer && e.dataTransfer.files) {
      uploadedFile = e.dataTransfer.files[0];
    }
    
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
            setWorkbook(null); // Clear any previous workbook
          }
        }
      });
    } else if (isXlsx) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        if (wb.SheetNames.length > 1) {
          setWorkbook(wb);
          setSheetNames(wb.SheetNames);
          setSelectedSheet(wb.SheetNames[0]);
          setStep(1.5);
        } else {
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          processDataArray(data);
          setWorkbook(null); // Clear any previous workbook
        }
      };
      reader.readAsBinaryString(uploadedFile);
    } else {
      toast.error('Invalid file format. Please upload .csv or .xlsx');
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e);
  };

  const handleSheetSelection = () => {
    if (!workbook || !selectedSheet) return;
    const ws = workbook.Sheets[selectedSheet];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    processDataArray(data);
  };

  const callAgentForMapping = async (additionalContext = '') => {
    setIsProcessing(true);
    try {
      const completeMapping = await callGeminiAgent(rawData.headers, rawData.rows, additionalContext, selectedModel);
      
      if (!completeMapping.mapping) completeMapping.mapping = {};
      
      // Free models often mess up casing or trim keys. Let's normalize it defensively.
      const aiKeys = Object.keys(completeMapping.mapping);
      const normalizedMapping = {};
      
      rawData.headers.forEach(h => {
        const matchedKey = aiKeys.find(k => k.trim().toLowerCase() === h.trim().toLowerCase());
        let target = matchedKey ? String(completeMapping.mapping[matchedKey]).trim().toLowerCase() : 'ignore';
        
        // Ensure it strictly matches one of our allowed schema keys
        const allowed = ['student_name', 'usn', 'admission_number', 'email', 'branch_code', 'date', 'session_topic', 'attendance_status'];
        if (allowed.includes(target)) {
          normalizedMapping[h] = target;
        } else {
          normalizedMapping[h] = 'IGNORE';
        }
      });

      completeMapping.mapping = normalizedMapping;

      setMapping(completeMapping);
      
      if (completeMapping.date_format === 'MISSING' && !additionalContext) {
        setStep(2.5); // Missing data inference
      } else {
        setStep(2);
      }
    } catch (e) {
      console.error(e);
      toast.error("AI mapping failed, defaulting to manual.");
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

  const handleMissingDataInference = () => {
    if (!missingDaysInput.trim()) {
      toast.error("Please enter the usual days for the class.");
      return;
    }
    callAgentForMapping(missingDaysInput);
  };

  const generateCandidates = () => {
    const cands = [];
    // Basic fallback date if still missing after AI inference
    let inferredGlobalDate = new Date().toISOString().split('T')[0];

    rawData.rows.forEach((row, i) => {
      if (mapping.is_pivoted) {
        mapping.date_columns.forEach(dc => {
          if (row[dc] !== undefined && row[dc] !== null && String(row[dc]).trim() !== "") {
            const student_name = String(row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'student_name')] || '').trim();
            const usn = String(row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'usn')] || '').trim();
            
            if (!student_name || !usn) return; // Skip ghost rows

            cands.push({
              source_row: i,
              student_name,
              usn,
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
        
        let dateVal = dateKey ? row[dateKey] : inferredGlobalDate;

        if (statusKey && String(row[statusKey]).trim() !== "") {
          const student_name = String(row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'student_name')] || '').trim();
          const usn = String(row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'usn')] || '').trim();
          
          if (!student_name || !usn) return; // Skip ghost rows

          cands.push({
            source_row: i,
            student_name,
            usn,
            branch_code: row[Object.keys(mapping.mapping).find(k => mapping.mapping[k] === 'branch_code')] || '',
            date_str: dateVal,
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
        let parsedDate = new Date(c.date_str);
        
        // Handle "Day X" formats by incrementing from the base date
        if (isNaN(parsedDate)) {
           const dayMatch = c.date_str.match(/Day\s*(\d+)/i);
           if (dayMatch) {
             const daysToAdd = parseInt(dayMatch[1]) - 1;
             parsedDate = new Date(inferredGlobalDate);
             parsedDate.setDate(parsedDate.getDate() + daysToAdd);
           }
        }

        if (isNaN(parsedDate)) {
           c.status = 'error'; c.reason = 'Invalid date format';
        } else {
           // Normalize date string format for matching
           c.date_str = parsedDate.toISOString().split('T')[0];
        }
      }
    });

    setCandidates(cands);
    setStep(3);
  };

  const detectConflicts = async () => {
    setIsProcessing(true);
    const cleanCands = candidates.filter(c => c.status === 'clean');
    const uniqueDates = [...new Set(cleanCands.map(c => c.date_str))];

    const { data: existingSessions } = await supabase.from('sessions').select('date').in('date', uniqueDates);
    
    if (existingSessions && existingSessions.length > 0) {
      setConflictingDates(existingSessions.map(s => s.date));
      setStep(3.5);
    } else {
      executeImport('merge');
    }
    setIsProcessing(false);
  };

  const executeImport = async (resolution = 'merge') => {
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
      const uniqueDates = [...new Set(cleanCands.map(c => c.date_str))];
      
      // Upsert sessions in parallel
      const sessionPromises = uniqueDates.map(d => {
        const dObj = new Date(d);
        return supabase.from('sessions').upsert({
          date: d,
          topic: 'Imported Session',
          month_number: dObj.getMonth() + 1,
          duration_hours: 2.0,
          session_type: 'offline'
        }, { onConflict: 'date' }).then(({ error }) => {
          if (error) throw error;
        });
      });
      await Promise.all(sessionPromises);

      const { data: allSessions } = await supabase.from('sessions').select('id, date');
      const sessionMap = {};
      if (allSessions) allSessions.forEach(s => sessionMap[s.date] = s.id);

      // Upsert students
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
        const { error: stuError } = await supabase.from('students').upsert(uniqueStudents, { onConflict: 'usn' });
        if (stuError) throw stuError;
      }
      
      const { data: allStudents } = await supabase.from('students').select('id, usn');
      const studentMap = {};
      if (allStudents) allStudents.forEach(s => studentMap[s.usn] = s.id);

      // If override, delete old attendance for these sessions
      if (resolution === 'override') {
        const sessionIdsToOverride = conflictingDates.map(d => sessionMap[d]).filter(Boolean);
        if (sessionIdsToOverride.length > 0) {
          await supabase.from('attendance').delete().in('session_id', sessionIdsToOverride);
        }
      }

      const attendanceInserts = [];
      for (let c of cleanCands) {
        const sessionId = sessionMap[c.date_str];
        const studentId = studentMap[c.usn];
        
        if (!studentId) {
          console.warn(`Student USN not found in database, skipping attendance row: ${c.usn}`);
          continue;
        }
        
        let present = false;
        if (c.status_str === undefined || c.status_str === null || String(c.status_str).trim() === '') {
          console.warn(`Attendance status missing for USN: ${c.usn}. Defaulting to absent (false).`);
          present = false;
        } else {
          present = normalizeAttendance(c.status_str);
        }

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

      const attendancePromises = [];
      for (let i = 0; i < attendanceInserts.length; i += 500) {
        const batch = attendanceInserts.slice(i, i + 500);
        attendancePromises.push(
          supabase.from('attendance').upsert(batch, { onConflict: 'student_id,session_id' })
            .then(({ error }) => { if (error) throw error; })
        );
      }
      await Promise.all(attendancePromises);

      await supabase.from('import_log').update({
        status: 'completed',
        imported_rows: cleanCands.length,
        skipped_rows: candidates.filter(c => c.status !== 'clean').length
      }).eq('id', logData.id);

      toast.success("Import completed successfully!", { icon: '🎉' });
      setStep(1);
      setFile(null);
      setWorkbook(null);
      setRawData({ headers: [], rows: [] });
      fetchImportHistory();
    } catch (e) {
      console.error("Supabase Import Error Details:", e.message || e.details || e);
      toast.error(`Import failed: ${e.message || 'Check console for details'}`);
    }
    setIsProcessing(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">AI-Powered CSV Upload</h1>
          <p className="text-gray-400 font-medium text-sm">Upload Excel or CSV files and let AI map columns automatically.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-xs font-medium">AI Model</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[#0a0a0b] border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#a855f7] transition-colors cursor-pointer appearance-none min-w-[180px]"
          >
            {AI_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#151517] border border-zinc-800 rounded-xl p-6 shadow-sm">
        {step === 1 && (
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-xl hover:border-amethyst transition-colors group"
          >
            <UploadIcon className="text-zinc-600 mb-4 group-hover:text-amethyst transition-colors" size={48} />
            <p className="text-white font-bold text-lg mb-2">Drag & drop your roster file</p>
            <p className="text-zinc-500 text-sm mb-6 font-medium">Supported formats: .csv, .xlsx</p>
            <label className="bg-gradient-to-r from-[#a855f7] to-[#c084fc] hover:opacity-90 text-white px-6 py-2.5 rounded-md cursor-pointer font-bold transition-opacity shadow-sm">
              Browse Files
              <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileUpload} />
            </label>
            {file && (
              <div className="mt-6 text-left w-full max-w-md bg-[#0a0a0b] p-4 rounded-xl border border-zinc-800 animate-fade-in shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amethyst/10 flex items-center justify-center">
                    <FileText className="text-amethyst" size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-white text-sm font-bold truncate">{file.name}</p>
                    <p className="text-zinc-500 text-xs font-medium">{(file.size / 1024).toFixed(1)} KB • {rawData.rows.length} rows</p>
                  </div>
                  <button 
                    onClick={() => callAgentForMapping('')} 
                    disabled={isProcessing}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2 font-semibold transition-colors"
                  >
                    {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : 'Process'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1.5 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="text-amethyst" size={24} />
              <h2 className="text-xl font-bold text-white">Multiple Sheets Detected</h2>
            </div>
            <p className="text-zinc-400 text-sm mb-6">Select the specific sheet you want to process from <span className="text-white font-medium">{file.name}</span>.</p>
            
            <div className="grid gap-3 max-w-md">
              {sheetNames.map(sheet => (
                <button
                  key={sheet}
                  onClick={() => setSelectedSheet(sheet)}
                  className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${selectedSheet === sheet ? 'bg-amethyst/10 border-amethyst text-white' : 'bg-[#0a0a0b] border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                >
                  <span className="font-semibold">{sheet}</span>
                  {selectedSheet === sheet && <CheckCircle size={18} className="text-amethyst" />}
                </button>
              ))}
            </div>

            <div className="flex justify-start gap-3 mt-6">
              <button onClick={() => setStep(1)} className="px-5 py-2 border border-zinc-700 text-white font-medium rounded-md hover:bg-zinc-800 transition-colors">Cancel</button>
              <button onClick={handleSheetSelection} className="px-5 py-2 bg-gradient-to-r from-[#a855f7] to-[#c084fc] text-white font-semibold rounded-md shadow-sm transition-opacity hover:opacity-90 flex items-center gap-2">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2.5 && (
          <div className="space-y-6 animate-fade-in max-w-lg">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-start gap-4">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-amber-400 font-bold mb-1">Missing Context Detected</h3>
                <p className="text-amber-500/80 text-sm font-medium">The AI noticed that there are no clear dates in your headers. To proceed, please provide some context.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-400 mb-2">On what days of the week is this class usually taken?</label>
              <input 
                type="text" 
                placeholder="e.g. Every Monday and Thursday"
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-md py-3 px-4 text-sm text-white focus:border-amethyst outline-none transition-colors"
                value={missingDaysInput}
                onChange={e => setMissingDaysInput(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-2 border border-zinc-700 text-white font-medium rounded-md hover:bg-zinc-800 transition-colors">Abort</button>
              <button onClick={handleMissingDataInference} disabled={isProcessing} className="px-5 py-2 bg-gradient-to-r from-[#a855f7] to-[#c084fc] disabled:opacity-50 text-white font-semibold rounded-md shadow-sm transition-opacity hover:opacity-90 flex items-center gap-2">
                {isProcessing ? 'Analyzing...' : 'Extrapolate Dates'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && mapping && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">AI Column Mapping</h2>
              <div className="flex gap-2">
                <span className="bg-[#0a0a0b] border border-zinc-800 text-xs px-3 py-1.5 font-semibold rounded-md text-zinc-300">Format: {mapping.date_format}</span>
                <span className="bg-[#0a0a0b] border border-zinc-800 text-xs px-3 py-1.5 font-semibold rounded-md text-zinc-300">Pivoted: {mapping.is_pivoted ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            <div className="bg-[#0a0a0b] rounded-xl border border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/30 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-zinc-400">CSV Column</th>
                    <th className="px-6 py-4 font-semibold text-zinc-400">Maps To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {Object.entries(mapping.mapping).map(([source, target]) => (
                    <tr key={source} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{source}</td>
                      <td className="px-6 py-4">
                        <select 
                          className="bg-[#151517] border border-zinc-700 text-white rounded-md px-3 py-1.5 outline-none focus:border-amethyst font-medium"
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
              <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-zinc-700 text-white font-medium rounded-md hover:bg-zinc-800 transition-colors">Back</button>
              <button onClick={generateCandidates} className="px-5 py-2.5 bg-gradient-to-r from-[#a855f7] to-[#c084fc] text-white font-semibold rounded-md transition-opacity hover:opacity-90 shadow-sm">Generate Preview</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Data Preview</h2>
              <div className="flex gap-4 text-sm font-bold">
                <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"><CheckCircle size={16}/> {candidates.filter(c => c.status === 'clean').length} Ready</span>
                <span className="text-red-400 flex items-center gap-1.5 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20"><XCircle size={16}/> {candidates.filter(c => c.status === 'error').length} Errors</span>
              </div>
            </div>

            <div className="bg-[#0a0a0b] rounded-xl border border-zinc-800 overflow-hidden max-h-96 overflow-y-auto custom-scrollbar shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-800/30 border-b border-zinc-800 sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-zinc-400">Student</th>
                    <th className="px-6 py-4 font-semibold text-zinc-400">USN</th>
                    <th className="px-6 py-4 font-semibold text-zinc-400">Date</th>
                    <th className="px-6 py-4 font-semibold text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {candidates.map((c, idx) => (
                    <tr key={idx} className={`${c.status === 'error' ? 'bg-red-500/5 border-l-4 border-l-red-500' : 'hover:bg-white/5 border-l-4 border-l-emerald-500'}`}>
                      <td className="px-6 py-3 text-white font-medium">
                        {c.student_name || <span className="text-red-400 italic">Missing</span>}
                        {c.status === 'error' && <div className="text-xs text-red-400 mt-1 font-semibold">{c.reason}</div>}
                      </td>
                      <td className="px-6 py-3 text-zinc-300 font-mono text-xs">{c.usn}</td>
                      <td className="px-6 py-3 text-zinc-300 font-medium">{c.date_str}</td>
                      <td className="px-6 py-3 text-zinc-300">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${['true', 'p', 'present', '1', 'y', 'yes'].includes(c.status_str.toLowerCase()) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {c.status_str}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setStep(2)} className="px-5 py-2.5 border border-zinc-700 text-white font-medium rounded-md hover:bg-zinc-800 transition-colors">Back</button>
              <button onClick={detectConflicts} disabled={isProcessing || candidates.filter(c=>c.status==='error').length > 0} className="px-5 py-2.5 bg-gradient-to-r from-[#a855f7] to-[#c084fc] hover:opacity-90 text-white font-semibold rounded-md flex items-center gap-2 disabled:opacity-50 transition-opacity shadow-sm">
                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                Import Data
              </button>
            </div>
          </div>
        )}

        {step === 3.5 && (
          <div className="space-y-6 animate-fade-in max-w-lg bg-[#151517] border border-zinc-800 p-8 rounded-xl shadow-2xl">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex items-start gap-4">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-400 font-bold mb-1">Conflict Detected</h3>
                <p className="text-red-500/80 text-sm font-medium mb-3">We found existing records for the following dates in this import:</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {conflictingDates.map(d => (
                    <span key={d} className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs font-bold font-mono">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => executeImport('override')} className="w-full bg-[#a855f7] hover:bg-[#c084fc] text-white font-bold py-3 px-4 rounded-md transition-colors shadow-lg flex items-center justify-center gap-2">
                Override Existing Data
              </button>
              <button onClick={() => executeImport('merge')} className="w-full bg-[#a855f7] hover:bg-[#c084fc] text-white font-bold py-3 px-4 rounded-md transition-colors shadow-lg flex items-center justify-center gap-2">
                Merge Data
              </button>
              <button onClick={() => setStep(3)} className="w-full bg-[#a855f7] hover:bg-[#c084fc] text-white font-bold py-3 px-4 rounded-md transition-colors shadow-lg flex items-center justify-center gap-2">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {step === 1 && importHistory.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-4">Past Imports</h2>
          <div className="bg-[#151517] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800/30 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-zinc-400">File Name</th>
                  <th className="px-6 py-4 font-semibold text-zinc-400">Date</th>
                  <th className="px-6 py-4 font-semibold text-zinc-400">Status</th>
                  <th className="px-6 py-4 font-semibold text-zinc-400 text-right">Rows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {importHistory.map(log => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    >
                      <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                        {expandedLogId === log.id ? <ChevronDown size={16} className="text-zinc-500" /> : <ChevronRight size={16} className="text-zinc-500" />}
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                          <FileText size={14} className="text-zinc-400" />
                        </div>
                        {log.filename}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-medium">
                        {new Date(log.uploaded_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${log.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : log.status === 'partial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {log.status === 'completed' ? <CheckCircle size={14} /> : log.status === 'partial' ? <AlertTriangle size={14} /> : <XCircle size={14} />}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-400 font-medium">
                        {log.imported_rows}/{log.total_rows}
                      </td>
                    </tr>
                    {expandedLogId === log.id && (
                      <tr className="bg-[#0a0a0b]">
                        <td colSpan={4} className="p-6">
                          <div className="bg-[#151517] border border-zinc-800 p-4 rounded-xl shadow-sm">
                            <h4 className="text-white font-bold mb-3">Column Mapping</h4>
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

      {/* Hidden DevTestButton */}
      <button 
        onClick={handleRunDiagnostics} 
        className="block text-zinc-700 hover:text-zinc-400 text-xs mt-8 transition-colors w-full text-center cursor-pointer"
      >
        Run AI Diagnostics
      </button>
    </div>
  );
}
