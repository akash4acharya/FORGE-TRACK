import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [tab, setTab] = useState('mentor');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-[420px] p-8 md:p-10 z-10 bg-[#151517] border border-zinc-800 rounded-2xl animate-fade-in shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-zinc-800 flex items-center justify-center font-extrabold text-white text-xl mx-auto mb-6 border border-zinc-700 rounded-full shadow-sm">
            F
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to ForgeTrack</h1>
          <p className="text-zinc-400 mt-2 text-[11px] font-semibold uppercase tracking-wider">Log in to your account to continue</p>
        </div>

        <div className="flex bg-[#0a0a0b] border border-zinc-800 rounded-full p-1 mb-8">
          <button 
            className={`flex-1 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 rounded-full ${tab === 'mentor' ? 'bg-gradient-to-r from-[#a855f7] to-[#c084fc] text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}
            onClick={() => setTab('mentor')}
            type="button"
          >
            MENTOR
          </button>
          <button 
            className={`flex-1 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 rounded-full ${tab === 'student' ? 'bg-gradient-to-r from-[#a855f7] to-[#c084fc] text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}
            onClick={() => setTab('student')}
            type="button"
          >
            STUDENT
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
              {tab === 'mentor' ? 'Email Address' : 'USN'}
            </label>
            <input 
              type={tab === 'mentor' ? 'email' : 'text'} 
              className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-md py-3 px-4 text-sm font-medium text-white placeholder-zinc-700 focus:outline-none focus:border-amethyst transition-colors" 
              placeholder={tab === 'mentor' ? 'akash@forge.local' : '4SH24CS001'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-md py-3 pl-4 pr-10 text-sm font-medium text-white placeholder-zinc-700 focus:outline-none focus:border-amethyst transition-colors" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 text-xs font-medium p-3 rounded-md border border-red-500/20 flex items-center gap-2">
               {error}
            </div>
          )}

          <div className="pt-2">
            <button type="submit" className="w-full bg-gradient-to-r from-[#a855f7] to-[#c084fc] hover:opacity-90 text-white rounded-md py-3 text-sm font-semibold transition-opacity shadow-sm">
              Continue to Dashboard
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
          Protected by ForgeTrack Auth Security
        </div>
      </div>
    </div>
  );
}
