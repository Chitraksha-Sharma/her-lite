// src/components/layout/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '@/api/context/AuthContext';
import AccessDenied from './AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <AccessDenied /> 
}) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || !session.authenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
