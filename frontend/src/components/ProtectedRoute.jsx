import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          <p className="text-sm text-slate-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to the appropriate home for their role
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user?.role === 'STORE_OWNER') return <Navigate to="/owner" replace />;
    return <Navigate to="/stores" replace />;
  }

  return children;
};

export default ProtectedRoute;
