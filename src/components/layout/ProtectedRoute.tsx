// src/components/layout/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAccess } from '@/lib/roleUtils';
import { useAuth } from '@/api/context/AuthContext';
import AccessDenied from './AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();
  const hasAdminAccess = useAdminAccess();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show access denied if authenticated but no admin access
  // if (!hasAdminAccess) {
  //   return <AccessDenied />;
  // }

  return <>{children}</>;
};

export default ProtectedRoute;
