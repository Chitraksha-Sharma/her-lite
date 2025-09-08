// src/api/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as auth from "../auth"; // try auth.loginApi or auth.login (handled below)
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
  const fetchUserRoles = async (uuid: string) => {
    try {
      const userResp = await getUser(uuid, { forceReload: true });
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
        fetchUserRoles(session.user.uuid).catch((e) => console.warn(e));
      }
      setLoading(false);
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // login wrapper that supports both loginApi or login from ../auth
  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      // call whichever exists in your auth module
      const loginFn = (auth as any).loginApi ?? (auth as any).login;
      if (!loginFn) throw new Error("No login function found in ../auth");

      const response = await loginFn(username, password);

      if (response?.success && response.user) {
        // store token + minimal session
        const newSession: SessionData = {
          authenticated: true,
          user: response.user,
          token: response.token,
        };
        setSession(newSession);
        localStorage.setItem("authToken", response.token);

        // Fetch full user (with person & roles) and update session if possible
        try {
          const fullUserResp = await getUser(response.user.uuid, { forceReload: true });
          if (fullUserResp.success && fullUserResp.data) {
            const updatedSession: SessionData = {
              ...newSession,
              user: fullUserResp.data as User,
            };
            setSession(updatedSession);
            localStorage.setItem("authSession", JSON.stringify(updatedSession));
            // fetch roles
            await fetchUserRoles((fullUserResp.data as User).uuid);
            return { success: true, user: fullUserResp.data as User };
          } else {
            // fallback: proceed with minimal user
            await fetchUserRoles(response.user.uuid);
            return { success: true, user: response.user };
          }
        } catch (err) {
          console.warn("Failed to fetch full user after login:", err);
          await fetchUserRoles(response.user.uuid);
          return { success: true, user: response.user };
        }
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
