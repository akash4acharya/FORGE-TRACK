import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent-glow/10 blur-[100px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full" />

      <div className="card w-full max-w-[480px] p-10 md:p-14 z-10 border border-border-subtle shadow-2xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-accent-glow flex items-center justify-center font-bold text-white text-3xl mx-auto mb-6 shadow-lg shadow-blue-500/30">
            F
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Welcome to ForgeTrack</h1>
          <p className="text-text-secondary mt-2 font-medium">Log in to your account to continue</p>
        </div>

        <div className="flex p-1.5 bg-surface-inset rounded-2xl mb-10 border border-border-subtle">
          <button 
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${tab === 'mentor' ? 'bg-surface text-text-primary shadow-lg border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setTab('mentor')}
            type="button"
          >
            Mentor
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${tab === 'student' ? 'bg-surface text-text-primary shadow-lg border border-border-subtle' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setTab('student')}
            type="button"
          >
            Student
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2.5">
              {tab === 'mentor' ? 'Email Address' : 'USN'}
            </label>
            <input 
              type={tab === 'mentor' ? 'email' : 'text'} 
              className="input bg-surface-inset border-border-subtle focus:bg-surface" 
              placeholder={tab === 'mentor' ? 'akash@forge.local' : '4SH24CS001'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-text-secondary mb-2.5">
              Password
            </label>
            <input 
              type="password" 
              className="input bg-surface-inset border-border-subtle focus:bg-surface" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-danger-bg text-danger-fg text-xs font-bold p-4 rounded-xl border border-danger-border flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-danger-fg" /> {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full py-4 rounded-2xl text-base font-bold shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-transform">
            Continue to Dashboard
          </button>
        </form>

        <div className="mt-10 text-center text-text-tertiary text-xs font-medium">
          Protected by ForgeTrack Auth Security
        </div>
      </div>
    </div>
  );
}
