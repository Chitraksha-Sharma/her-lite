import { createContext, useContext, useEffect, useState } from "react";
import { getSession, logoutFromOpenMRS } from "../auth"; // adjust import

// Define User Roles
export const USER_ROLES = {
  SYSTEM_DEVELOPER: 'system_developer',
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Role checking methods
  hasRole: (roles: UserRole[]) => boolean;
  isSystemDeveloper: () => boolean;
  isAdmin: () => boolean;
  isSystemDeveloperOrAdmin: () => boolean;
  // Existing methods
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Role checking methods
  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  };

  const isSystemDeveloper = (): boolean => hasRole(['system_developer']);
  const isAdmin = (): boolean => hasRole(['admin']);
  const isSystemDeveloperOrAdmin = (): boolean => hasRole(['system_developer', 'admin']);

  const login = async (username: string, password: string) => {
    // ⚠️ Delete any existing session first
    await logoutFromOpenMRS();

    const credentials = btoa(`${username}:${password}`);
    const response = await fetch("/openmrs/ws/rest/v1/session", {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      return { success: false, error: "Login failed" };
    }

    const data = await response.json();

    if (data.authenticated) {
      // Create user object with role (you'll need to get this from your backend)
      const userData: User = {
        id: data.user.uuid || data.user.id,
        name: data.user.display || data.user.name,
        email: data.user.email || username,
        role: determineUserRole(data.user) // You'll need to implement this based on your backend
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } else {
      return { success: false, error: "Invalid username or password" };
    }
  };

  const logout = async () => {
    await logoutFromOpenMRS();
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    getSession()
      .then((data) => {
        if (data.authenticated) {
          // Create user object with role
          const userData: User = {
            id: data.user.uuid || data.user.id,
            name: data.user.display || data.user.name,
            email: data.user.email || '',
            role: determineUserRole(data.user) // You'll need to implement this based on your backend
          };
          
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      hasRole, 
      isSystemDeveloper, 
      isAdmin, 
      isSystemDeveloperOrAdmin, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to determine user role from backend data
// You'll need to implement this based on how your backend provides role information
const determineUserRole = (userData: any): UserRole => {
  // This is a placeholder - implement based on your backend structure
  // You might get role from userData.role, userData.privileges, or userData.groups
  
  // Example implementations:
  
  // If role is directly in userData
  if (userData.role) {
    return userData.role as UserRole;
  }
  
  // If role is determined by privileges
  if (userData.privileges) {
    const privileges = userData.privileges.map((p: any) => p.name);
    if (privileges.includes('System Developer')) return 'system_developer';
    if (privileges.includes('Administrator')) return 'admin';
    if (privileges.includes('Doctor')) return 'doctor';
    if (privileges.includes('Nurse')) return 'nurse';
    if (privileges.includes('Receptionist')) return 'receptionist';
  }
  
  // If role is determined by groups
  if (userData.groups) {
    const groups = userData.groups.map((g: any) => g.name);
    if (groups.includes('System Developers')) return 'system_developer';
    if (groups.includes('Administrators')) return 'admin';
    if (groups.includes('Doctors')) return 'doctor';
    if (groups.includes('Nurses')) return 'nurse';
    if (groups.includes('Receptionists')) return 'receptionist';
  }
  
  // Default role
  return 'patient';
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
