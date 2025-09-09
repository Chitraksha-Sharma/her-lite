// src/api/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as auth from "../auth";
import { getUser } from "../user";

// Types
export interface Person {
  uuid: string;
  display?: string;
  links?: any[];
  [key: string]: any;
}

export interface Role {
  uuid?: string;
  display?: string;
  links?: any[];
  [key: string]: any;
}

export interface User {
  uuid: string;
  display: string;
  username?: string;
  systemId?: string;
  userProperties?: Record<string, any>;
  person?: Person;
  roles?: Role[];
  [key: string]: any;
}

export interface SessionData {
  authenticated: boolean;
  user: User;
  token: string;
}

interface AuthContextType {
  session: SessionData | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  loading: boolean;
  userRoles: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionData | null>(() => {
    try {
      const raw = localStorage.getItem("authSession");
      return raw ? (JSON.parse(raw) as SessionData) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // persist session
  useEffect(() => {
    if (session) {
      localStorage.setItem("authSession", JSON.stringify(session));
    } else {
      localStorage.removeItem("authSession");
    }
  }, [session]);

  // fetch roles helper
  const fetchUserRoles = async (user: User) => {
    try {
      console.log("Fetching roles for user:", user.uuid);
      
      // Check if user already has roles
      if (user.roles && user.roles.length > 0) {
        const roleNames = user.roles.map((r: Role) => r?.display?.toLowerCase?.()).filter(Boolean) as string[];
        setUserRoles(roleNames);
        return;
      }
      
      // If no roles, fetch full user data
      const userResp = await getUser(user.uuid, { forceReload: true });
      if (!userResp.success || !userResp.data) {
        setUserRoles([]);
        return;
      }
      
      const fullUser = userResp.data as User;
      const roleNames = (fullUser.roles || []).map((r: Role) => r?.display?.toLowerCase?.()).filter(Boolean) as string[];
      setUserRoles(roleNames);
    } catch (err) {
      console.error("Error fetching user roles:", err);
      setUserRoles([]);
    }
  };

  // initialize: background fetch roles if session available
  useEffect(() => {
    const initialize = async () => {
      if (session?.user?.uuid) {
        // fetch roles but don't block UI
        fetchUserRoles(session.user).catch((e) => console.warn(e));
      }
      setLoading(false);
    };
    initialize();
  }, []); // Only run once on mount

  // login wrapper that supports both loginApi or login from ../auth
  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      // call whichever exists in your auth module
      const loginFn = (auth as any).loginApi ?? (auth as any).login;
      if (!loginFn) throw new Error("No login function found in ../auth");

      const response = await loginFn(username, password);
      console.log("Login response:", response);

      if (response?.success && response.user) {
        // Handle potential nested results structure
        let userData = response.user;
        if (userData.results && Array.isArray(userData.results) && userData.results.length > 0) {
          userData = userData.results[0];
        }

        // Validate user data
        if (!userData.uuid) {
          throw new Error("Invalid user data received from login");
        }

        // Create session with token + user data
        const newSession: SessionData = {
          authenticated: true,
          user: userData,
          token: response.token,
        };
        
        setSession(newSession);
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("authSession", JSON.stringify(newSession));

        // Fetch roles (this will use existing data if available)
        await fetchUserRoles(userData);
        
        return { success: true, user: userData };
      }

      setSession(null);
      return { success: false, error: "Invalid username or password" };
    } catch (err) {
      console.error("Login error:", err);
      setSession(null);
      return { success: false, error: err instanceof Error ? err.message : "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  // logout wrapper
  const logout = async () => {
    try {
      const logoutFn = (auth as any).logoutApi ?? (auth as any).logout;
      if (logoutFn && session?.token) {
        try {
          await logoutFn(session.token);
        } catch (e) {
          console.warn("Server logout failed:", e);
        }
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setSession(null);
      setUserRoles([]);
      localStorage.removeItem("authToken");
      localStorage.removeItem("authSession");
      localStorage.removeItem("currentLocation");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("currentProvider");
    }
  };

  const hasRole = (role: string) => userRoles.includes(role.toLowerCase());

  const hasAnyRole = (roles: string[]) => roles.map((r) => r.toLowerCase()).some((role) => userRoles.includes(role));

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
        hasAnyRole,
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