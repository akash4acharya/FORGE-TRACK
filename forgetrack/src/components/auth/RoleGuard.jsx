import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Simple mock for auth state
export const useAuth = () => {
  // In a real app, read from Supabase
  const role = localStorage.getItem('role') || null; 
  return { role, user: { name: 'Mock User' } };
};

export function RoleGuard({ children, allowedRoles }) {
  const { role } = useAuth();
  const location = useLocation();

  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
