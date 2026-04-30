import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Forbidden() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleReturn = () => {
    if (role === 'mentor') navigate('/dashboard');
    else if (role === 'student') navigate('/me/attendance');
    else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 app-main">
      <div className="text-center">
        <h1 className="text-display-lg text-danger-fg mb-4">403</h1>
        <h2 className="text-h2 text-fg-primary mb-2">Access Forbidden</h2>
        <p className="text-body-lg text-fg-secondary mb-8">You don't have access to this page.</p>
        <button onClick={handleReturn} className="btn-primary">
          Return to Home
        </button>
      </div>
    </div>
  );
}
