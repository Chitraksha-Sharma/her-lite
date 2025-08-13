import { createContext, useContext, useEffect, useState } from "react";
import { getSession, logoutFromOpenMRS } from "../auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      return { success: true, user: data.user };
    } else {
      return { success: false, error: "Invalid username or password" };
    }
  };

  const logout = async () => {
    await logoutFromOpenMRS();
    setSession(null);
  };

  useEffect(() => {
    getSession()
      .then((data) => {
        if (data.authenticated) {
          setSession(data);
        } else {
          setSession(null);
        }
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
