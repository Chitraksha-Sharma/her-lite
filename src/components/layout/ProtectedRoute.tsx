// src/components/layout/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '@/api/context/AuthContext';
import { UserRole } from '@/api/context/AuthContext';
import AccessDenied from './AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[]; // Make it optional for backward compatibility
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallback = <AccessDenied /> 
}) => {
  const { user, hasRole, isLoading } = useAuth();
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If no user is authenticated, show access denied
  if (!user) {
    return <>{fallback}</>;
  }
  
  // If allowedRoles is specified, check role permissions
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasRole(allowedRoles)) {
      return <>{fallback}</>;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
