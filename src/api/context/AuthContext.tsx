// src/api/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getSession, loginWithOpenMRS, logoutFromOpenMRS } from "../auth";
import { getUser } from "../user";

// Define our own User and Session interfaces
export interface User {
  uuid: string;
  display: string;
  username: string;
  // Add more OpenMRS fields if needed
}

export interface SessionData {
  authenticated: boolean;
  user: User;
}

interface AuthContextType {
  session: SessionData | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  loading: boolean;
  userRoles: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const currentSession = await getSession();
        if (currentSession?.authenticated) {
          setSession(currentSession);
          await fetchUserRoles(currentSession.user.uuid);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchUserRoles = async (uuid: string) => {
    try {
      const user = await getUser(uuid);
      console.log("Fetched user from API:", user);
  
      // Extract "display" field instead of "name"
      const roleNames = (user?.roles || [])
        .map((r: any) => r?.display?.toLowerCase?.())
        .filter(Boolean);
  
      setUserRoles(roleNames);
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };
  
  
  

  const login = async (username: string, password: string) => {
    try {
      const response = await loginWithOpenMRS(username, password);
      if (response?.success && response.user) {
        setSession({ authenticated: true, user: response.user });
        await fetchUserRoles(response.user.uuid);
        return { success: true, user: response.user };
      }
      return { success: false, error: "Invalid username or password" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "An error occurred during login" };
    }
  };

  const logout = async () => {
    try {
      await logoutFromOpenMRS();
      setSession(null);
      setUserRoles([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const hasRole = (role: string) => userRoles.includes(role.toLowerCase());

  const hasAnyRole = (roles: string[]) =>
    roles.map((r) => r.toLowerCase()).some((role) => userRoles.includes(role));

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user || null,
        isAuthenticated: !!session?.authenticated,
        login,
        logout,
        loading,
        userRoles,
        hasRole,
        hasAnyRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
