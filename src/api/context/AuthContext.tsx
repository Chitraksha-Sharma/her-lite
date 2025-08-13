import { createContext, useContext, useEffect, useState } from "react";
import { getSession, logoutFromOpenMRS } from "../auth";
import { getUser } from "../user";

interface User {
  uuid: string;
  display: string;
  username: string;
  roles?: Array<{
    uuid: string;
    display: string;
    name: string;
  }>;
}

interface Session {
  authenticated: boolean;
  user: User;
}

interface AuthContextType {
  session: Session | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  loading: boolean;
  userRoles: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const fetchUserRoles = async (userUuid: string) => {
    try {
      const userData = await getUser(userUuid);
      const roles = userData.roles?.map((role: any) => role.display) || [];
      setUserRoles(roles);
      return roles;
    } catch (error) {
      console.error("Failed to fetch user roles:", error);
      setUserRoles([]);
      return [];
    }
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  const login = async (username: string, password: string) => {
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
      setSession(data);
      await fetchUserRoles(data.user.uuid);
      return { success: true, user: data.user };
    } else {
      return { success: false, error: "Invalid username or password" };
    }
  };

  const logout = async () => {
    await logoutFromOpenMRS();
    setSession(null);
    setUserRoles([]);
  };

  useEffect(() => {
    getSession()
      .then(async (data) => {
        if (data.authenticated) {
          setSession(data);
          await fetchUserRoles(data.user.uuid);
        } else {
          setSession(null);
          setUserRoles([]);
        }
      })
      .catch(() => {
        setSession(null);
        setUserRoles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout, loading, userRoles, hasRole, hasAnyRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
