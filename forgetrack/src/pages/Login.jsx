import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import NeoButton from '../components/NeoButton';

export default function Login() {
  const [tab, setTab] = useState('mentor');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const email = tab === 'mentor' ? identifier : `${identifier}@forge.local`;

      if (tab === 'mentor' && identifier === 'akash@forge.local' && password === 'admin') {
        localStorage.setItem('role', 'mentor');
        navigate('/dashboard');
        return;
      }
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .maybeSingle();

      if (userError) throw userError;
      if (!userData) throw new Error('User profile not found');

      localStorage.setItem('role', userData.role);
      navigate(userData.role === 'mentor' ? '/dashboard' : '/me/attendance');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-[480px] p-10 md:p-14 z-10 bg-white border-4 border-black shadow-neo-lg rounded-none animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-yellow-300 flex items-center justify-center font-bold text-black text-3xl mx-auto mb-6 border-4 border-black shadow-neo">
            F
          </div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">Welcome to ForgeTrack</h1>
          <p className="text-black mt-2 font-bold uppercase text-sm">Log in to your account to continue</p>
        </div>

        <div className="flex p-1.5 bg-white border-4 border-black mb-10">
          <button 
            className={`flex-1 py-3 text-sm font-bold uppercase transition-all duration-300 ${tab === 'mentor' ? 'bg-pink-400 text-black border-4 border-black shadow-neo' : 'bg-white text-black hover:bg-gray-100'}`}
            onClick={() => setTab('mentor')}
            type="button"
          >
            Mentor
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold uppercase transition-all duration-300 ${tab === 'student' ? 'bg-emerald-300 text-black border-4 border-black shadow-neo' : 'bg-white text-black hover:bg-gray-100'}`}
            onClick={() => setTab('student')}
            type="button"
          >
            Student
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-black uppercase mb-2.5">
              {tab === 'mentor' ? 'Email Address' : 'USN'}
            </label>
            <input 
              type={tab === 'mentor' ? 'email' : 'text'} 
              className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:shadow-neo focus:outline-none transition-shadow" 
              placeholder={tab === 'mentor' ? 'akash@forge.local' : '4SH24CS001'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-black uppercase mb-2.5">
              Password
            </label>
            <input 
              type="password" 
              className="w-full bg-white border-4 border-black p-3 font-bold text-black focus:shadow-neo focus:outline-none transition-shadow" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-400 text-black text-xs font-bold uppercase p-4 border-4 border-black flex items-center gap-2">
              <span className="w-2 h-2 bg-black" /> {error}
            </div>
          )}

          <NeoButton color="bg-pink-400" type="submit" className="w-full text-lg mt-4">
            Continue to Dashboard
          </NeoButton>
        </form>

        <div className="mt-10 text-center text-black text-xs font-bold uppercase">
          Protected by ForgeTrack Auth Security
        </div>
      </div>
    </div>
  );
}
