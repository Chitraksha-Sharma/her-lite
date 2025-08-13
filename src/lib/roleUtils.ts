import { useAuth } from "@/api/context/AuthContext";
export const ADMIN_ROLES = ['system developer', 'admin'];

// Hook to check if user has admin access
export const useAdminAccess = () => {
    const { hasAnyRole } = useAuth();
    return hasAnyRole(ADMIN_ROLES);
  };
  
  // Hook to check if user has specific role
  export const useRoleAccess = (roles: string[]) => {
    const { hasAnyRole } = useAuth();
    return hasAnyRole(roles);
  };

  // Component wrapper for role-based rendering
export const RoleBasedRender = ({ 
    children, 
    allowedRoles, 
    fallback = null 
  }: { 
    children: React.ReactNode; 
    allowedRoles: string[]; 
    fallback?: React.ReactNode;
  }) => {
    const { hasAnyRole } = useAuth();
    
    if (hasAnyRole(allowedRoles)) {
      return children;
    }
    
    return fallback;
  };