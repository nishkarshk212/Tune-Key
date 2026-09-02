import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080B12]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs font-medium tracking-wide">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (requireAdmin) {
    if (!isAuthenticated || !isAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
