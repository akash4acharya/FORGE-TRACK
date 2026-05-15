import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually since we don't have dotenv
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backup() {
  console.log("Fetching students...");
  const { data: students, error: studentsError } = await supabase.from('students').select('*');
  
  if (studentsError) {
    console.error("Error fetching students:", studentsError);
    return;
  }

  console.log("Fetching attendance...");
  const { data: attendance, error: attendanceError } = await supabase.from('attendance').select('*');
  
  if (attendanceError) {
    console.error("Error fetching attendance:", attendanceError);
    return;
  }

  const backupData = {
    timestamp: new Date().toISOString(),
    students,
    attendance
  };

  const backupPath = path.join(__dirname, '..', 'supabase', 'student_backup_archive.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`Successfully backed up ${students.length} students and ${attendance.length} attendance records to ${backupPath}`);
  
  // Now purge the data!
  console.log("Purging dummy students and attendance from DB...");
  const { error: delAttErr } = await supabase.from('attendance').delete().gt('id', 0);
  if (delAttErr) console.error("Error deleting attendance:", delAttErr);

  const { error: delStuErr } = await supabase.from('students').delete().gt('id', 0);
  if (delStuErr) console.error("Error deleting students:", delStuErr);

  const { error: delSesErr } = await supabase.from('sessions').delete().gt('id', 0);
  if (delSesErr) console.error("Error deleting sessions:", delSesErr);

  console.log("Purge complete! The database is now ready for production use.");
}

backup();
